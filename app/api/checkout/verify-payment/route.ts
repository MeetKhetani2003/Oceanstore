import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/services/payment.service";
import { OrderRepository } from "@/lib/db/repositories/order.repository";

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (isValid) {
      // Update our database order to 'paid'
      await OrderRepository.updatePayment(orderId, {
        status: "paid",
        razorpayPaymentId,
        razorpaySignature,
      });

      await OrderRepository.updateStatus(
        orderId,
        "paid",
        "Payment verified successfully via Razorpay checkout"
      );

      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      // Update our database order to 'failed'
      await OrderRepository.updatePayment(orderId, {
        status: "failed",
      });

      await OrderRepository.updateStatus(
        orderId,
        "cancelled",
        "Payment verification failed (invalid signature)"
      );

      return NextResponse.json({ error: "Invalid signature verification" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
