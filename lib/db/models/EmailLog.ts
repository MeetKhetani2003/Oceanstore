import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEmailLog extends Document {
  to: string;
  subject: string;
  template: string;
  orderId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status: "sent" | "failed" | "pending" | "retrying";
  attempts: number;
  lastError?: string;
  messageId?: string;
  sentAt?: Date;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    template: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["sent", "failed", "pending", "retrying"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: String,
    messageId: String,
    sentAt: Date,
    nextRetryAt: Date,
  },
  { timestamps: true }
);

EmailLogSchema.index({ status: 1, nextRetryAt: 1 });
EmailLogSchema.index({ userId: 1 });
EmailLogSchema.index({ orderId: 1 });
EmailLogSchema.index({ createdAt: -1 });

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
