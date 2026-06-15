'use server';

import connectDB from '@/lib/db';
import { Cart } from './models';
import { getMe } from '../auth/actions';
import mongoose from 'mongoose';

export async function getCartAction() {
  try {
    const user = await getMe();
    if (!user) return { success: false, items: [] };

    await connectDB();
    const cart = await Cart.findOne({ userId: user.id }).populate('items.productId');
    
    if (!cart) return { success: true, items: [] };

    const formattedItems = cart.items
      .filter((item) => item.productId !== null)
      .map((item) => {
        const prod = item.productId as any;
        return {
          product: {
            id: prod._id.toString(),
            name: prod.name,
            origin: prod.brand || 'OCEON',
            price: (prod.salePrice || prod.price).toString(),
            unit: prod.unit || 'pcs',
            image: prod.images?.[0] ? `/api/files/${prod.images[0]}` : '/images/avocado.png',
          },
          quantity: item.quantity,
        };
      });

    return { success: true, items: formattedItems };
  } catch (error) {
    console.error('getCartAction error:', error);
    return { success: false, items: [] };
  }
}

export async function syncCartAction(items: { productId: string; quantity: number }[]) {
  try {
    const user = await getMe();
    if (!user) return { success: false };

    await connectDB();
    
    const formattedItems = items.map((item) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      quantity: item.quantity,
    }));

    await Cart.findOneAndUpdate(
      { userId: user.id },
      { $set: { items: formattedItems } },
      { upsert: true }
    );

    return { success: true };
  } catch (error) {
    console.error('syncCartAction error:', error);
    return { success: false };
  }
}

