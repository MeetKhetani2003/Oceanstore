import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ProductRepository } from "@/lib/db/repositories/product.repository";
import { OrderRepository } from "@/lib/db/repositories/order.repository";
import { createRazorpayOrder } from "@/lib/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Authentication session expired" }, { status: 401 });
    }

    const { cart, shippingAddress } = await req.json();
    if (!cart || Object.keys(cart).length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.phone) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const [slug, qty] of Object.entries(cart)) {
      const dbProd = await ProductRepository.findBySlug(slug);
      if (!dbProd) {
        return NextResponse.json({ error: `Product not found: ${slug}` }, { status: 404 });
      }
      const itemTotal = dbProd.price * (qty as number);
      subtotal += itemTotal;
      orderItems.push({
        productId: dbProd._id as any,
        productSnapshot: {
          name: dbProd.name,
          slug: dbProd.slug,
          image: dbProd.externalImages?.[0] || "",
          category: dbProd.category,
          unit: dbProd.unit,
        },
        price: dbProd.price,
        qty: qty as number,
        total: itemTotal,
      });
    }

    const shippingCharge = subtotal >= 299 ? 0 : 29.0; // Free shipping above ₹299, otherwise ₹29
    const tax = subtotal * 0.05; // 5% GST
    const grandTotal = subtotal + shippingCharge + tax;

    const grandTotalINR = grandTotal;

    // Generate unique order number prefix (pre-save hook will also append a sequence if omitted, but we specify one here)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Create order in DB (initial status: 'pending') - strictly matches OrderSchema
    const order = await OrderRepository.create({
      orderNumber,
      user: payload.userId as any,
      items: orderItems as any,
      subtotal,
      shippingFee: shippingCharge,
      taxAmount: tax,
      taxRate: 0.05,
      discountAmount: 0,
      total: grandTotal,
      status: "pending",
      address: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state || "State",
        pincode: shippingAddress.pincode,
        country: "India",
      },
      payment: {
        method: "razorpay",
        status: "pending",
        razorpayOrderId: "",
        razorpayPaymentId: "",
      },
      timeline: [
        {
          status: "pending",
          note: "Order created successfully. Awaiting payment.",
          timestamp: new Date(),
        },
      ],
    });

    // Generate Razorpay Order
    const razorpayOrder = await createRazorpayOrder({
      amount: grandTotalINR, // in INR
      orderId: (order._id as any).toString(),
      currency: "INR",
      notes: {
        orderNumber: order.orderNumber,
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrder,
      grandTotal: grandTotal,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
