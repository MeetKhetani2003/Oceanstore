import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/features/orders/models';
import { getMe } from '@/features/auth/actions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getMe();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id).populate('items.productId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership (only the owner or admins can read order details)
    if (order.userId.toString() !== user.id && !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Fetch order API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
