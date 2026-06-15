import User, { IUser, UserRole } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import { Types } from "mongoose";

export class UserRepository {
  static async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).lean<IUser>();
  }

  static async findByIdWithPassword(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).select("+password").lean<IUser>();
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email: email.toLowerCase() }).lean<IUser>();
  }

  static async findByEmailWithPassword(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email: email.toLowerCase() })
      .select("+password +refreshTokens")
      .lean<IUser>();
  }

  static async findByGoogleId(googleId: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ googleId }).lean<IUser>();
  }

  static async create(data: Partial<IUser>): Promise<IUser> {
    await connectDB();
    const user = new User(data);
    await user.save();
    return user.toObject();
  }

  static async updateById(
    id: string,
    data: Partial<IUser>
  ): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(id, data, { new: true }).lean<IUser>();
  }

  static async findByVerificationToken(token: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    })
      .select("+emailVerificationToken +emailVerificationExpiry")
      .lean<IUser>();
  }

  static async findByResetToken(token: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    })
      .select("+passwordResetToken +passwordResetExpiry")
      .lean<IUser>();
  }

  static async list(opts: {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
  }): Promise<{ users: IUser[]; total: number }> {
    await connectDB();
    const { page = 1, limit = 20, role, search } = opts;
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean<IUser[]>(),
      User.countDocuments(query),
    ]);
    return { users, total };
  }

  static async addToWishlist(userId: string, productId: string): Promise<void> {
    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: productId },
    });
  }

  static async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<void> {
    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: productId },
    });
  }

  static async addAddress(
    userId: string,
    address: IUser["addresses"][0]
  ): Promise<IUser | null> {
    await connectDB();
    if (address.isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { "addresses.$[].isDefault": false },
      });
    }
    return User.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true }
    ).lean<IUser>();
  }

  static async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<IUser["addresses"][0]>
  ): Promise<IUser | null> {
    await connectDB();
    if (data.isDefault) {
      await User.findByIdAndUpdate(userId, {
        $set: { "addresses.$[].isDefault": false },
      });
    }
    return User.findByIdAndUpdate(
      userId,
      {
        $set: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [`addresses.$[elem].${k}`, v])
        ),
      },
      {
        new: true,
        arrayFilters: [{ "elem._id": new Types.ObjectId(addressId) }],
      }
    ).lean<IUser>();
  }

  static async deleteAddress(
    userId: string,
    addressId: string
  ): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
      { new: true }
    ).lean<IUser>();
  }

  static async countByRole(): Promise<Record<string, number>> {
    await connectDB();
    const results = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    return results.reduce(
      (acc, r) => ({ ...acc, [r._id]: r.count }),
      {} as Record<string, number>
    );
  }
}
