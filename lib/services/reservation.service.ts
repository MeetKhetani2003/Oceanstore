import mongoose from "mongoose";
import connectDB from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import Reservation, { IReservation } from "@/lib/db/models/Reservation";
import { ReservationRepository } from "@/lib/db/repositories/reservation.repository";

export interface ReservationItem {
  productId: string;
  qty: number;
  priceAtReservation: number;
}

export interface ReservationResult {
  reservationId: string;
  expiresAt: Date;
  items: ReservationItem[];
}

/**
 * CRITICAL: Creates a stock reservation using MongoDB transactions.
 * Atomically reduces availableStock and increases reservedStock.
 * Prevents overselling and race conditions.
 */
export async function createReservation(
  userId: string | undefined,
  guestToken: string | undefined,
  items: ReservationItem[]
): Promise<ReservationResult> {
  const db = await connectDB();
  const session = await mongoose.startSession();

  try {
    let result: ReservationResult | null = null;

    await session.withTransaction(async () => {
      // Verify stock for all items within transaction
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (
          product.inventory.trackInventory &&
          product.inventory.availableStock < item.qty
        ) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.inventory.availableStock}, Requested: ${item.qty}`
          );
        }
      }

      // Atomically update all product stocks
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              "inventory.availableStock": -item.qty,
              "inventory.reservedStock": item.qty,
            },
          },
          { session }
        );
      }

      // Create reservation document
      const expiryMinutes =
        Number(process.env.RESERVATION_EXPIRY_MINUTES) || 15;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const [reservation] = await Reservation.create(
        [
          {
            userId: userId || undefined,
            guestToken: guestToken || undefined,
            items: items.map((i) => ({
              productId: new mongoose.Types.ObjectId(i.productId),
              qty: i.qty,
              priceAtReservation: i.priceAtReservation,
            })),
            status: "active",
            expiresAt,
          },
        ],
        { session }
      );

      result = {
        reservationId: reservation._id.toString(),
        expiresAt,
        items,
      };
    });

    if (!result) throw new Error("Reservation transaction failed");
    return result;
  } finally {
    await session.endSession();
  }
}

/**
 * Releases a reservation and restores stock.
 * Called on payment failure, checkout abandonment, or expiry.
 */
export async function releaseReservation(
  reservationId: string
): Promise<void> {
  const db = await connectDB();
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(
        session
      );
      if (!reservation || reservation.status !== "active") return;

      // Restore stock for each item
      for (const item of reservation.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              "inventory.availableStock": item.qty,
              "inventory.reservedStock": -item.qty,
            },
          },
          { session }
        );
      }

      reservation.status = "released";
      await reservation.save({ session });
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Confirms reservation (called after successful payment).
 * Moves stock from reserved to sold.
 */
export async function confirmReservation(
  reservationId: string
): Promise<void> {
  const db = await connectDB();
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(reservationId).session(
        session
      );
      if (!reservation) throw new Error("Reservation not found");

      for (const item of reservation.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              "inventory.reservedStock": -item.qty,
              "inventory.soldStock": item.qty,
            },
          },
          { session }
        );
      }

      reservation.status = "confirmed";
      await reservation.save({ session });
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Cleanup job: finds all expired active reservations and releases them.
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const expired = await ReservationRepository.findExpired();
  let released = 0;

  for (const reservation of expired) {
    try {
      await releaseReservation(reservation._id.toString());
      released++;
    } catch (err) {
      console.error(
        `[Reservation] Failed to release ${reservation._id}:`,
        err
      );
    }
  }

  if (released > 0) {
    console.log(`[Reservation] Released ${released} expired reservations`);
  }

  return released;
}
