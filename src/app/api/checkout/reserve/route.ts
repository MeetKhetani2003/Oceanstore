import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { getMe } from '@/features/auth/actions';
import { Product } from '@/features/products/models';
import { Inventory, StockReservation } from '@/features/inventory/models';
import { Order } from '@/features/orders/models';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  const session = await mongoose.startSession();
  try {
    const user = await getMe();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { items, shippingAddress, deliveryWindow, couponCode, discount = 0 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty or invalid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    let subtotal = 0;
    const orderItems: any[] = [];

    // Begin Transaction
    session.startTransaction();

    for (const item of items) {
      const { productId, quantity } = item;

      // 1. Fetch inventory and lock row atomically using mongoose session
      const inv = await Inventory.findOne({ productId }).session(session);
      const prod = await Product.findById(productId).session(session);

      if (!inv || !prod) {
        throw new Error(`Product or Inventory not found for ID: ${productId}`);
      }

      if (inv.availableStock < quantity) {
        throw new Error(`Insufficient stock for product: ${prod.name}. Available: ${inv.availableStock}`);
      }

      // 2. Adjust stock levels
      inv.availableStock -= quantity;
      inv.reservedStock += quantity;
      
      // Save history log
      inv.stockHistory.push({
        adjustmentType: 'RESERVATION',
        quantity,
        notes: `Reservation for checkout by user: ${user.id}`,
        date: new Date(),
      });
      await inv.save({ session });

      // Keep product collections in sync
      prod.stock = inv.availableStock;
      prod.reservedStock = inv.reservedStock;
      await prod.save({ session });

      // Create reservation logger
      const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await StockReservation.create(
        [
          {
            productId: new mongoose.Types.ObjectId(productId),
            userId: new mongoose.Types.ObjectId(user.id),
            quantity,
            expiresAt: reservationExpiry,
          },
        ],
        { session }
      );

      const price = prod.salePrice || prod.price;
      subtotal += price * quantity;
      orderItems.push({
        productId: prod._id,
        quantity,
        price,
      });
    }

    const shippingFee = subtotal > 500 ? 0 : 40; // Free shipping over INR 500
    const tax = subtotal * 0.05; // 5% GST on groceries
    const total = subtotal + shippingFee + tax - discount;

    // 3. Create Razorpay Order
    // Note: Razorpay accepts amount in paise/cents (multiply by 100)
    const amountInPaise = Math.round(total * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // 4. Create pending order document
    const newOrder = await Order.create(
      [
        {
          userId: new mongoose.Types.ObjectId(user.id),
          status: 'RESERVED',
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
          deliveryWindow,
          shippingAddress,
          couponCode,
          razorpayOrderId: razorpayOrder.id,
          items: orderItems,
        },
      ],
      { session }
    );

    // Link reservation orderId
    await StockReservation.updateMany(
      { userId: user.id, orderId: null },
      { $set: { orderId: newOrder[0]._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return new Response(
      JSON.stringify({
        success: true,
        orderId: newOrder[0].id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Inventory reservation failed:', error);
    return new Response(JSON.stringify({ error: error.message || 'Inventory reservation failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
