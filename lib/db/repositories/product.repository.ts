import Product, { IProduct } from "@/lib/db/models/Product";
import connectDB from "@/lib/db/connect";

export interface ProductListOptions {
  page?: number;
  limit?: number;
  category?: string;
  tab?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating";
  minPrice?: number;
  maxPrice?: number;
}

export class ProductRepository {
  static async findById(id: string): Promise<IProduct | null> {
    await connectDB();
    return Product.findById(id).lean<IProduct>();
  }

  static async findBySlug(slug: string): Promise<IProduct | null> {
    await connectDB();
    return Product.findOne({ slug }).lean<IProduct>();
  }

  static async list(opts: ProductListOptions = {}): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
  }> {
    await connectDB();
    const {
      page = 1,
      limit = 12,
      category,
      tab,
      search,
      isActive = true,
      isFeatured,
      sortBy = "newest",
      minPrice,
      maxPrice,
    } = opts;

    const query: Record<string, unknown> = { isActive };
    if (category) query.category = new RegExp(category, "i");
    if (tab && tab !== "all") query.tab = tab;
    if (typeof isFeatured === "boolean") query.isFeatured = isFeatured;
    if (search) query.$text = { $search: search };
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
      if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
    }

    const sortMap: Record<string, Record<string, number>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { "rating.average": -1 },
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort((sortMap[sortBy] || { createdAt: -1 }) as any)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IProduct[]>(),
      Product.countDocuments(query),
    ]);

    return { products, total, pages: Math.ceil(total / limit) };
  }

  static async create(data: Partial<IProduct>): Promise<IProduct> {
    await connectDB();
    const product = new Product(data);
    await product.save();
    return product.toObject();
  }

  static async updateById(
    id: string,
    data: Partial<IProduct>
  ): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(id, data, { new: true }).lean<IProduct>();
  }

  static async deleteById(id: string): Promise<boolean> {
    await connectDB();
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  static async findByIds(ids: string[]): Promise<IProduct[]> {
    await connectDB();
    return Product.find({ _id: { $in: ids } }).lean<IProduct[]>();
  }

  static async decrementStock(
    productId: string,
    qty: number
  ): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(
      productId,
      {
        $inc: {
          "inventory.availableStock": -qty,
          "inventory.reservedStock": qty,
        },
      },
      { new: true }
    ).lean<IProduct>();
  }

  static async restoreStock(
    productId: string,
    qty: number
  ): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(
      productId,
      {
        $inc: {
          "inventory.availableStock": qty,
          "inventory.reservedStock": -qty,
        },
      },
      { new: true }
    ).lean<IProduct>();
  }

  static async confirmSale(
    productId: string,
    qty: number
  ): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(
      productId,
      {
        $inc: {
          "inventory.reservedStock": -qty,
          "inventory.soldStock": qty,
        },
      },
      { new: true }
    ).lean<IProduct>();
  }

  static async getLowStockProducts(threshold?: number): Promise<IProduct[]> {
    await connectDB();
    const th =
      threshold || Number(process.env.LOW_STOCK_THRESHOLD) || 10;
    return Product.find({
      isActive: true,
      "inventory.trackInventory": true,
      $expr: {
        $lte: [
          "$inventory.availableStock",
          { $ifNull: ["$inventory.lowStockThreshold", th] },
        ],
      },
    }).lean<IProduct[]>();
  }

  static async getStats(): Promise<{
    total: number;
    active: number;
    outOfStock: number;
    lowStock: number;
  }> {
    await connectDB();
    const [stats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          outOfStock: {
            $sum: {
              $cond: [
                { $eq: ["$inventory.availableStock", 0] },
                1,
                0,
              ],
            },
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$inventory.availableStock", 0] },
                    {
                      $lte: [
                        "$inventory.availableStock",
                        "$inventory.lowStockThreshold",
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    return stats || { total: 0, active: 0, outOfStock: 0, lowStock: 0 };
  }
}
