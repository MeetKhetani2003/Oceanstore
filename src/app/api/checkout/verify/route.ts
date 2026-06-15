import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { Order } from '@/features/orders/models';
import { Inventory, StockReservation } from '@/features/inventory/models';
import { Product } from '@/features/products/models';
import { User } from '@/features/auth/models';
import { generateInvoicePDF } from '@/features/orders/invoiceBuilder';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return new Response(JSON.stringify({ error: 'Missing payment parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    // 1. Verify Razorpay cryptographic signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    session.startTransaction();

    // 2. Fetch Order and confirm it belongs to this Razorpay Order ID
    const order = await Order.findById(orderId).populate('items.productId').session(session);
    if (!order) {
      throw new Error(`Order not found for ID: ${orderId}`);
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      throw new Error('Order mismatch with payment gateway reference');
    }

    // Double check status to avoid double processing
    if (order.status === 'PAID') {
      await session.commitTransaction();
      session.endSession();
      return new Response(JSON.stringify({ success: true, message: 'Order already processed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Update stock balances: move reserved stock to sold stock
    for (const item of order.items) {
      const inv = await Inventory.findOne({ productId: item.productId._id }).session(session);
      const prod = await Product.findById(item.productId._id).session(session);

      if (inv) {
        inv.reservedStock = Math.max(0, inv.reservedStock - item.quantity);
        inv.soldStock += item.quantity;
        inv.stockHistory.push({
          adjustmentType: 'SALE',
          quantity: item.quantity,
          notes: `Sold in Order ID: ${order.id}`,
          date: new Date(),
        });
        await inv.save({ session });
        
        // Keep product collections in sync
        if (prod) {
          prod.reservedStock = inv.reservedStock;
          await prod.save({ session });
        }
      }
    }

    // 4. Remove active stock reservation documents
    await StockReservation.deleteMany({ orderId: order._id }).session(session);

    // 5. Update order details
    order.status = 'PAID';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save({ session });

    // 6. Generate Invoice PDF inside GridFS (non-fatal — don't abort payment on PDF error)
    const customer = await User.findById(order.userId).session(session);
    if (!customer) {
      throw new Error('Customer profile not found');
    }

    let invoiceFileId: string | null = null;
    try {
      invoiceFileId = await generateInvoicePDF(order, customer);
      order.invoiceFileId = invoiceFileId;
      await order.save({ session });
    } catch (pdfError: any) {
      console.error('Invoice PDF generation failed (non-fatal):', pdfError.message);
      // Payment is still valid — we just skip the invoice attachment
    }

    await session.commitTransaction();
    session.endSession();

    // 7. Dispatch Confirmation Email via SMTP (non-fatal)
    try {
      const invoiceSection = invoiceFileId
        ? `<a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/${invoiceFileId}" style="display: inline-block; background-color: #1E4D2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 500; margin-top: 15px;">Download Invoice PDF</a>`
        : `<p style="font-size: 12px; color: #888; margin-top: 15px;">Your invoice will be available shortly in your profile dashboard.</p>`;

      await sendEmail({
        to: customer.email,
        subject: `Order Confirmed: #${order.id.substring(0, 8).toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e8e8e8; border-radius: 12px;">
            <h2 style="font-family: serif; color: #0A192F;">Your order is confirmed!</h2>
            <p>Hi ${customer.name},</p>
            <p>Thank you for shopping with OCEON. Your payment has been received, and we are preparing your order for shipment.</p>
            <hr style="border: 0; border-top: 1px solid #e8e8e8; margin: 20px 0;" />
            <h3 style="font-family: serif; margin-bottom: 5px;">Order Summary</h3>
            <p style="font-size: 14px; margin: 0 0 15px 0;">Order Code: <strong>#${order.id.toUpperCase()}</strong></p>
            <p style="font-size: 14px; margin: 5px 0;">Total Paid: <strong>INR ${parseFloat(order.total.toString()).toFixed(2)}</strong></p>
            <p style="font-size: 14px; margin: 5px 0;">Delivery Window: <strong>${order.deliveryWindow}</strong></p>
            ${invoiceSection}
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error('Confirmation email send failed (non-fatal):', emailError.message);
    }

    return new Response(JSON.stringify({ success: true, orderId: order.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Payment verification failed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Payment verification failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
