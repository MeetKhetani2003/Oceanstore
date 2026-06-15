import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: "percentage" | "fixed" | "free-shipping";
  value: number; // percent (0-100) or fixed INR amount
  minOrderAmount: number;
  maxDiscount?: number; // cap for percentage discounts
  usageLimit: number; // 0 = unlimited
  usedCount: number;
  perUserLimit: number; // 0 = unlimited per user
  usedBy: mongoose.Types.ObjectId[];
  applicableCategories: string[];
  applicableProducts: mongoose.Types.ObjectId[];
  expiresAt?: Date;
  startsAt?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["percentage", "fixed", "free-shipping"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    applicableCategories: { type: [String], default: [] },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    expiresAt: Date,
    startsAt: Date,
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ expiresAt: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
