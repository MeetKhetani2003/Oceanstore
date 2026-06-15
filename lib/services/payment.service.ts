import Razorpay from "razorpay";
import crypto from "crypto";
import connectDB from "@/lib/db/connect";
import { OrderRepository } from "@/lib/db/repositories/order.repository";

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}

export interface CreateRazorpayOrderInput {
  amount: number; // in paise (INR * 100)
  orderId: string;
  currency?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResult> {
  const rz = getRazorpay();
  const order = await rz.orders.create({
    amount: Math.round(input.amount * 100), // convert to paise
    currency: input.currency || "INR",
    receipt: input.orderId,
    notes: input.notes || {},
  });

  // Update our order with razorpay order ID
  await OrderRepository.updatePayment(input.orderId, {
    razorpayOrderId: order.id,
    status: "pending",
  });

  return {
    razorpayOrderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === params.razorpaySignature;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expectedSignature === signature;
}

export async function initiateRefund(params: {
  razorpayPaymentId: string;
  amount?: number; // partial refund in paise, omit for full
  notes?: Record<string, string>;
}): Promise<{ refundId: string; amount: number; status: string }> {
  const rz = getRazorpay();
  const refund = await rz.payments.refund(params.razorpayPaymentId, {
    ...(params.amount ? { amount: params.amount } : {}),
    notes: params.notes || {},
  });
  return {
    refundId: refund.id,
    amount: refund.amount as number,
    status: refund.status,
  };
}

export async function fetchPaymentDetails(razorpayPaymentId: string) {
  const rz = getRazorpay();
  return rz.payments.fetch(razorpayPaymentId);
}
