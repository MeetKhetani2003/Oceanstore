'use server';

import connectDB from '@/lib/db';
import { Order } from '@/features/orders/models';
import { Product } from '@/features/products/models';
import { User } from '@/features/auth/models';
import { getMe } from '@/features/auth/actions';
import { sendEmail } from '@/lib/nodemailer';

export async function getAdminStatsAction() {
  try {
    const user = await getMe();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();

    // 1. Calculate Revenue and Orders count
    const paidOrders = await Order.find({ status: { $nin: ['PENDING', 'CANCELLED'] } });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = await Order.countDocuments();

    // 2. Count Customers
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // 3. Count products and find low stock items (stock <= 10)
    const totalProducts = await Product.countDocuments();
    const lowStockItems = await Product.find({ stock: { $lte: 10 } }).populate('category');

    // 4. Query GridFS storage counts
    const db = await connectDB();
    const filesCount = await db.connection.db.collection('uploads.files').countDocuments();

    const formattedLowStock = lowStockItems.map(p => ({
      id: p._id.toString(),
      name: p.name,
      stock: p.stock,
      category: (p.category as any).name,
      sku: p.sku,
    }));

    // Fetch 5 recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId');

    const formattedOrders = recentOrders.map(o => ({
      id: o._id.toString(),
      customerName: (o.userId as any)?.name || 'Guest User',
      total: o.total.toString(),
      status: o.status,
      date: o.createdAt.toLocaleDateString(),
    }));

    return {
      success: true,
      stats: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalCustomers,
        totalProducts,
        filesCount,
      },
      lowStock: formattedLowStock,
      recentOrders: formattedOrders,
    };
  } catch (error: any) {
    console.error('getAdminStatsAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const admin = await getMe();
    if (!admin || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(admin.role)) {
      return { success: false, error: 'Unauthorized' };
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    order.status = status as any;
    await order.save();

    // Send dispatch status email
    const customer = await User.findById(order.userId);
    if (customer) {
      await sendEmail({
        to: customer.email,
        subject: `Order Update: #${order.id.substring(0, 8).toUpperCase()} is ${status}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e8e8e8; border-radius: 12px;">
            <h2 style="font-family: serif; color: #0A192F;">Your order status has changed!</h2>
            <p>Hi ${customer.name},</p>
            <p>Your order #${order.id.toUpperCase()} has been updated to: <strong>${status}</strong>.</p>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">We will send another update when your dispatch package ships or is delivered.</p>
          </div>
        `,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('updateOrderStatusAction error:', error);
    return { success: false, error: error.message };
  }
}
