import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { Order } from '@/features/orders/models';
import { Inventory, StockReservation } from '@/features/inventory/models';
import { Product } from '@/features/products/models';
import { User } from '@/features/auth/models';
import { generateInvoicePDF } from '@/features/orders/invoiceBuilder';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mockwebhooksecret';

    if (!signature) {
      return new Response('Missing webhook signature', { status: 400 });
    }

    await connectDB();

    const isValidSignature = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValidSignature) {
      return new Response('Invalid webhook signature verification failed', { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment captured / order paid events
    if (event === 'order.paid' || event === 'payment.captured') {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payload.payment.entity.id;

      if (!razorpayOrderId) {
        return new Response('No order ID associated with payment entity', { status: 200 });
      }

      session.startTransaction();

      const order = await Order.findOne({ razorpayOrderId }).populate('items.productId').session(session);
      if (!order) {
        throw new Error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
      }

      // If already settled, do nothing
      if (order.status === 'PAID') {
        await session.commitTransaction();
        session.endSession();
        return new Response('Order already paid and settled', { status: 200 });
      }

      // Settle stock locks
      for (const item of order.items) {
        const inv = await Inventory.findOne({ productId: item.productId._id }).session(session);
        const prod = await Product.findById(item.productId._id).session(session);

        if (inv) {
          inv.reservedStock = Math.max(0, inv.reservedStock - item.quantity);
          inv.soldStock += item.quantity;
          inv.stockHistory.push({
            adjustmentType: 'SALE',
            quantity: item.quantity,
            notes: `Sold via Webhook Order ID: ${order.id}`,
            date: new Date(),
          });
          await inv.save({ session });
          
          if (prod) {
            prod.reservedStock = inv.reservedStock;
            await prod.save({ session });
          }
        }
      }

      // Delete reservations
      await StockReservation.deleteMany({ orderId: order._id }).session(session);

      // Settle order
      order.status = 'PAID';
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save({ session });

      // Build PDF receipt
      const customer = await User.findById(order.userId).session(session);
      if (!customer) {
        throw new Error('Customer profile not found');
      }

      const invoiceFileId = await generateInvoicePDF(order, customer);
      order.invoiceFileId = invoiceFileId;
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Email dispatch
      const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/${invoiceFileId}`;
      await sendEmail({
        to: customer.email,
        subject: `Order Payment Settled: #${order.id.substring(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e8e8e8; border-radius: 12px;">
            <h2 style="font-family: serif; color: #0A192F;">Your payment has been verified!</h2>
            <p>Hi ${customer.name},</p>
            <p>Your payment transaction for order #${order.id.toUpperCase()} has been verified. We are preparing to dispatch your items.</p>
            <hr style="border: 0; border-top: 1px solid #e8e8e8; margin: 20px 0;" />
            <a href="${invoiceUrl}" style="display: inline-block; background-color: #1E4D2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 500;">Download Invoice PDF</a>
          </div>
        `,
      });
      
      return new Response('Webhook payment processed successfully', { status: 200 });
    }

    return new Response('Webhook event ignored', { status: 200 });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Razorpay Webhook Error:', error);
    return new Response(`Webhook processing failed: ${error.message}`, { status: 500 });
  }
}
