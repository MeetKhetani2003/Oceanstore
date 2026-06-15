import Order, { IOrder, OrderStatus } from "@/lib/db/models/Order";
import connectDB from "@/lib/db/connect";

export interface OrderListOptions {
  page?: number;
  limit?: number;
  userId?: string;
  status?: OrderStatus;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export class OrderRepository {
  static async findById(id: string): Promise<IOrder | null> {
    await connectDB();
    return Order.findById(id)
      .populate("user", "name email phone")
      .lean<IOrder>();
  }

  static async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    await connectDB();
    return Order.findOne({ orderNumber }).lean<IOrder>();
  }

  static async list(opts: OrderListOptions = {}): Promise<{
    orders: IOrder[];
    total: number;
    pages: number;
  }> {
    await connectDB();
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      search,
      startDate,
      endDate,
    } = opts;
    const query: Record<string, unknown> = {};
    if (userId) query.user = userId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, "i") },
        { "address.name": new RegExp(search, "i") },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IOrder[]>(),
      Order.countDocuments(query),
    ]);
    return { orders, total, pages: Math.ceil(total / limit) };
  }

  static async create(data: Partial<IOrder>): Promise<IOrder> {
    await connectDB();
    const order = new Order(data);
    await order.save();
    return order.toObject();
  }

  static async updateStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    updatedBy?: string
  ): Promise<IOrder | null> {
    await connectDB();
    return Order.findByIdAndUpdate(
      id,
      {
        $set: { status },
        $push: {
          timeline: {
            status,
            note,
            updatedBy,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).lean<IOrder>();
  }

  static async updatePayment(
    id: string,
    paymentData: Partial<IOrder["payment"]>
  ): Promise<IOrder | null> {
    await connectDB();
    return Order.findByIdAndUpdate(
      id,
      { $set: Object.fromEntries(Object.entries(paymentData).map(([k, v]) => [`payment.${k}`, v])) },
      { new: true }
    ).lean<IOrder>();
  }

  static async getRevenueSummary(days: number = 30): Promise<{
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    dailyRevenue: { date: string; revenue: number; orders: number }[];
  }> {
    await connectDB();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [summary] = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "packed", "shipped", "out-for-delivery", "delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const daily = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "packed", "shipped", "out-for-delivery", "delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalRevenue: summary?.totalRevenue || 0,
      totalOrders: summary?.totalOrders || 0,
      avgOrderValue:
        summary?.totalOrders
          ? summary.totalRevenue / summary.totalOrders
          : 0,
      dailyRevenue: daily.map((d) => ({
        date: d._id,
        revenue: d.revenue,
        orders: d.orders,
      })),
    };
  }
}
