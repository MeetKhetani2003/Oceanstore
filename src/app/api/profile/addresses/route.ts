import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Order } from '@/features/orders/models';
import { User } from '@/features/auth/models';
import { getMe } from '@/features/auth/actions';

export async function GET() {
  try {
    const user = await getMe();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const uniqueAddresses: any[] = [];
    const addressKeys = new Set<string>();

    // 1. Fetch custom addresses saved on the User document
    const dbUser = await User.findById(user.id).select('addresses');
    if (dbUser && dbUser.addresses) {
      dbUser.addresses.forEach((addr: any) => {
        const key = `${addr.street}|${addr.city}|${addr.state}|${addr.zipCode}`.toLowerCase().trim();
        if (!addressKeys.has(key)) {
          addressKeys.add(key);
          uniqueAddresses.push({
            name: addr.name || '',
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            phone: addr.phone || '',
          });
        }
      });
    }

    // 2. Fetch past shipping addresses from user's order history
    const orders = await Order.find({ userId: user.id }).select('shippingAddress');
    orders.forEach((order) => {
      const addr = order.shippingAddress as any;
      if (!addr) return;
      const key = `${addr.street}|${addr.city}|${addr.state}|${addr.zipCode}`.toLowerCase().trim();
      if (!addressKeys.has(key)) {
        addressKeys.add(key);
        uniqueAddresses.push({
          name: addr.name || '',
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          phone: addr.phone || '',
        });
      }
    });

    return NextResponse.json({ success: true, addresses: uniqueAddresses });
  } catch (error: any) {
    console.error('Fetch user addresses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getMe();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, street, city, state, zipCode, phone } = body;

    if (!street || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    await connectDB();

    // Use $push with findByIdAndUpdate to avoid triggering full document validation
    // (which can fail for Google OAuth users who have no passwordHash)
    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        $push: {
          addresses: {
            name: name || user.name,
            street,
            city,
            state,
            zipCode,
            phone: phone || '',
          },
        },
      },
      { new: true, runValidators: false }
    );

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Address saved successfully' });
  } catch (error: any) {
    console.error('Save user address error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
