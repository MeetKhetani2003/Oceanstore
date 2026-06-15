import Coupon, { ICoupon } from "@/lib/db/models/Coupon";
import connectDB from "@/lib/db/connect";

export class CouponRepository {
  static async findByCode(code: string): Promise<ICoupon | null> {
    await connectDB();
    return Coupon.findOne({ code: code.toUpperCase() }).lean<ICoupon>();
  }

  static async list(opts: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ coupons: ICoupon[]; total: number }> {
    await connectDB();
    const { page = 1, limit = 20, isActive } = opts;
    const query: Record<string, unknown> = {};
    if (typeof isActive === "boolean") query.isActive = isActive;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ICoupon[]>(),
      Coupon.countDocuments(query),
    ]);
    return { coupons, total };
  }

  static async create(data: Partial<ICoupon>): Promise<ICoupon> {
    await connectDB();
    const coupon = new Coupon(data);
    await coupon.save();
    return coupon.toObject();
  }

  static async updateById(
    id: string,
    data: Partial<ICoupon>
  ): Promise<ICoupon | null> {
    await connectDB();
    return Coupon.findByIdAndUpdate(id, data, { new: true }).lean<ICoupon>();
  }

  static async incrementUsage(
    code: string,
    userId: string
  ): Promise<ICoupon | null> {
    await connectDB();
    return Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $inc: { usedCount: 1 },
        $addToSet: { usedBy: userId },
      },
      { new: true }
    ).lean<ICoupon>();
  }

  static async deleteById(id: string): Promise<boolean> {
    await connectDB();
    const result = await Coupon.findByIdAndDelete(id);
    return !!result;
  }
}
