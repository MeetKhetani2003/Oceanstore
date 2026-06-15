import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  productSlug: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  qty: number;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  guestToken?: string;
  items: ICartItem[];
  couponCode?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productSlug: String,
    name: String,
    image: String,
    price: Number,
    unit: String,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    guestToken: { type: String, sparse: true },
    items: [CartItemSchema],
    couponCode: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  { timestamps: true }
);

// TTL index — auto-delete expired guest carts
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ userId: 1 }, { sparse: true });
CartSchema.index({ guestToken: 1 }, { sparse: true });

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
