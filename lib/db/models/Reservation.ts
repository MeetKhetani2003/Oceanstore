import mongoose, { Document, Schema, Model } from "mongoose";

export interface IReservationItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  priceAtReservation: number;
}

export interface IReservation extends Document {
  userId?: mongoose.Types.ObjectId;
  guestToken?: string;
  orderId?: mongoose.Types.ObjectId;
  items: IReservationItem[];
  status: "active" | "confirmed" | "released" | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationItemSchema = new Schema<IReservationItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtReservation: { type: Number, required: true },
  },
  { _id: false }
);

const ReservationSchema = new Schema<IReservation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    guestToken: String,
    orderId: { type: Schema.Types.ObjectId, ref: "Order", sparse: true },
    items: [ReservationItemSchema],
    status: {
      type: String,
      enum: ["active", "confirmed", "released", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      default: () =>
        new Date(
          Date.now() +
            (Number(process.env.RESERVATION_EXPIRY_MINUTES) || 15) * 60 * 1000
        ),
    },
  },
  { timestamps: true }
);

// TTL index for automatic expiry cleanup (background cleanup job handles stock restoration)
ReservationSchema.index({ expiresAt: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ userId: 1, status: 1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
