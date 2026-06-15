import { CouponRepository } from "@/lib/db/repositories/coupon.repository";
import type { ICoupon } from "@/lib/db/models/Coupon";

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  discount: number;
  freeShipping: boolean;
  coupon?: ICoupon;
}

export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId?: string
): Promise<CouponValidationResult> {
  const coupon = await CouponRepository.findByCode(code);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code", discount: 0, freeShipping: false };
  }

  if (!coupon.isActive) {
    return { valid: false, error: "This coupon is inactive", discount: 0, freeShipping: false };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, error: "This coupon is not yet active", discount: 0, freeShipping: false };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: "This coupon has expired", discount: 0, freeShipping: false };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: "This coupon has reached its usage limit", discount: 0, freeShipping: false };
  }

  if (orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      discount: 0,
      freeShipping: false,
    };
  }

  if (userId && coupon.perUserLimit > 0) {
    const userUsage = coupon.usedBy.filter(
      (id) => id.toString() === userId
    ).length;
    if (userUsage >= coupon.perUserLimit) {
      return {
        valid: false,
        error: "You've already used this coupon the maximum number of times",
        discount: 0,
        freeShipping: false,
      };
    }
  }

  let discount = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case "percentage":
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      break;
    case "fixed":
      discount = Math.min(coupon.value, orderAmount);
      break;
    case "free-shipping":
      freeShipping = true;
      discount = 0;
      break;
  }

  return { valid: true, discount, freeShipping, coupon };
}

export function calculateOrderTotals(params: {
  subtotal: number;
  discount: number;
  freeShipping: boolean;
  taxRate?: number;
}): {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
} {
  const freeShippingThreshold =
    Number(process.env.FREE_SHIPPING_THRESHOLD) || 599;
  const standardShipping = Number(process.env.STANDARD_SHIPPING_FEE) || 49;
  const taxRate = params.taxRate ?? Number(process.env.GST_RATE) ?? 0.05;

  const subtotal = params.subtotal;
  const discountAmount = Math.min(params.discount, subtotal);
  const discountedAmount = subtotal - discountAmount;

  const shippingFee =
    params.freeShipping || discountedAmount >= freeShippingThreshold
      ? 0
      : standardShipping;

  const taxableAmount = discountedAmount;
  const taxAmount = taxableAmount * taxRate;

  const total = discountedAmount + shippingFee + taxAmount;

  return {
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
