import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minSpend: number;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: Date;
  customerRestrictions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSpend: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, index: true },
    customerRestrictions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  },
  { timestamps: true }
);

// Enforce compound unique constraint to prevent duplicate entries
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
