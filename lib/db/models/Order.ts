import mongoose, { Document, Schema, Model } from "mongoose";

export type OrderStatus =
  | "pending"
  | "reserved"
  | "paid"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "returned";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productSnapshot: {
    name: string;
    slug: string;
    image: string;
    category: string;
    unit: string;
  };
  price: number;
  qty: number;
  total: number;
}

export interface IOrderAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrderPayment {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  method?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAt?: Date;
  refundId?: string;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IOrderTimeline {
  status: OrderStatus;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  address: IOrderAddress;
  coupon?: {
    code: string;
    discount: number;
    type: string;
  };
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  payment: IOrderPayment;
  invoiceFileId?: string;
  invoiceNumber?: string;
  timeline: IOrderTimeline[];
  notes?: string;
  reservationId?: mongoose.Types.ObjectId;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productSnapshot: {
      name: String,
      slug: String,
      image: String,
      category: String,
      unit: String,
    },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    method: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paidAt: Date,
    refundId: String,
    refundedAt: Date,
    refundAmount: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    coupon: {
      code: String,
      discount: Number,
      type: String,
    },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.05 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "reserved",
        "paid",
        "packed",
        "shipped",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "refunded",
        "returned",
      ],
      default: "pending",
    },
    payment: { type: OrderPaymentSchema, default: {} },
    invoiceFileId: String,
    invoiceNumber: String,
    timeline: [
      {
        status: String,
        note: String,
        updatedBy: Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notes: String,
    reservationId: { type: Schema.Types.ObjectId, ref: "Reservation" },
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

// Auto-generate order number
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await (this.constructor as Model<IOrder>).countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ "payment.razorpayOrderId": 1 });
OrderSchema.index({ "payment.razorpayPaymentId": 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
