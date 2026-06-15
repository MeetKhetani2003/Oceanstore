import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/features/orders/models';
import { getMe } from '@/features/auth/actions';

export async function GET() {
  try {
    const user = await getMe();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .populate('items.productId');

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
