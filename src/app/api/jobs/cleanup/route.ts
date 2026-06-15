import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { StockReservation, Inventory } from '@/features/inventory/models';
import { Product } from '@/features/products/models';
import { Order } from '@/features/orders/models';

export async function GET(request: Request) {
  // Simple bearer security check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET || 'mockcronsecret';

  if (secret !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized request' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await connectDB();
  const now = new Date();

  // Find all expired stock reservations
  const expiredReservations = await StockReservation.find({ expiresAt: { $lt: now } });
  
  if (expiredReservations.length === 0) {
    return NextResponse.json({ success: true, message: 'No expired stock reservations found' });
  }

  let restoredCount = 0;

  for (const reservation of expiredReservations) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // 1. Restore Inventory Stock Levels
      const inv = await Inventory.findOne({ productId: reservation.productId }).session(session);
      const prod = await Product.findById(reservation.productId).session(session);

      if (inv) {
        inv.availableStock += reservation.quantity;
        inv.reservedStock = Math.max(0, inv.reservedStock - reservation.quantity);
        inv.stockHistory.push({
          adjustmentType: 'ADDITION',
          quantity: reservation.quantity,
          notes: `Restored from expired reservation ID: ${reservation.id}`,
          date: new Date(),
        });
        await inv.save({ session });

        // Keep product collections in sync
        if (prod) {
          prod.stock = inv.availableStock;
          prod.reservedStock = inv.reservedStock;
          await prod.save({ session });
        }
      }

      // 2. If reservation is linked to an order, cancel order
      if (reservation.orderId) {
        const order = await Order.findById(reservation.orderId).session(session);
        if (order && (order.status === 'PENDING' || order.status === 'RESERVED')) {
          order.status = 'CANCELLED';
          await order.save({ session });
        }
      }

      // 3. Remove reservation record
      await StockReservation.findByIdAndDelete(reservation._id).session(session);

      await session.commitTransaction();
      restoredCount++;
    } catch (err) {
      await session.abortTransaction();
      console.error(`Failed to clean up reservation ${reservation.id}:`, err);
    } finally {
      session.endSession();
    }
  }

  return NextResponse.json({
    success: true,
    message: `Successfully restored ${restoredCount} expired inventory locks`,
  });
}
