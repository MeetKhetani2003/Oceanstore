import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'PAID'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'RETURNED';

export interface IShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  invoiceFileId?: string; // GridFS file ID reference
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryWindow: string;
  shippingAddress: IShippingAddress;
  couponCode?: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  phone: { type: String, required: true },
});

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: [
        'PENDING',
        'RESERVED',
        'PAID',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
        'RETURNED',
      ],
      default: 'PENDING',
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    shippingFee: { type: Number, required: true, default: 0, min: 0 },
    tax: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    trackingNumber: { type: String },
    invoiceFileId: { type: String },
    razorpayOrderId: { type: String, unique: true, sparse: true, index: true },
    razorpayPaymentId: { type: String },
    deliveryWindow: { type: String, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    couponCode: { type: String },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
