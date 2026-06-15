import Cart, { ICart } from "@/lib/db/models/Cart";
import connectDB from "@/lib/db/connect";

export class CartRepository {
  static async findByUserId(userId: string): Promise<ICart | null> {
    await connectDB();
    return Cart.findOne({ userId }).lean<ICart>();
  }

  static async findByGuestToken(guestToken: string): Promise<ICart | null> {
    await connectDB();
    return Cart.findOne({ guestToken }).lean<ICart>();
  }

  static async upsertForUser(
    userId: string,
    data: Partial<ICart>
  ): Promise<ICart> {
    await connectDB();
    const result = await Cart.findOneAndUpdate(
      { userId },
      { ...data, userId },
      { upsert: true, new: true }
    ).lean();
    return result as unknown as ICart;
  }

  static async upsertForGuest(
    guestToken: string,
    data: Partial<ICart>
  ): Promise<ICart> {
    await connectDB();
    const result = await Cart.findOneAndUpdate(
      { guestToken },
      { ...data, guestToken },
      { upsert: true, new: true }
    ).lean();
    return result as unknown as ICart;
  }

  static async deleteByUserId(userId: string): Promise<void> {
    await connectDB();
    await Cart.deleteOne({ userId });
  }

  static async deleteByGuestToken(guestToken: string): Promise<void> {
    await connectDB();
    await Cart.deleteOne({ guestToken });
  }

  static async mergeGuestCart(
    guestToken: string,
    userId: string
  ): Promise<ICart | null> {
    await connectDB();
    const [guestCart, userCart] = await Promise.all([
      Cart.findOne({ guestToken }),
      Cart.findOne({ userId }),
    ]);
    if (!guestCart) return userCart?.toObject() ?? null;

    if (!userCart) {
      guestCart.userId = userId as unknown as typeof guestCart.userId;
      guestCart.guestToken = undefined;
      await guestCart.save();
      return guestCart.toObject();
    }

    // Merge: add guest items to user cart (update qty if already exists)
    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) => i.productId.toString() === guestItem.productId.toString()
      );
      if (existing) {
        existing.qty += guestItem.qty;
      } else {
        userCart.items.push(guestItem);
      }
    }
    await userCart.save();
    await Cart.deleteOne({ guestToken });
    return userCart.toObject();
  }
}
