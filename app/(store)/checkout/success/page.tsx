import { OrderRepository } from "@/lib/db/repositories/order.repository";
import Link from "next/link";
import { money } from "@/data/catalog";

interface PageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.orderId || "";

  let order = null;
  if (orderId) {
    try {
      order = await OrderRepository.findById(orderId);
    } catch (err) {
      console.error("Failed to load order for success page:", err);
    }
  }

  return (
    <div className="bg-cream-50 min-h-screen pt-32 pb-20 flex items-center justify-center">
      <div className="container-x max-w-xl">
        <div className="bg-white rounded-3xl border border-line/45 p-8 text-center shadow-sm">
          {/* Animated check circle */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-50 text-leaf-600 mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-light tracking-tight text-ink">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-sm text-muted">
            Thank you for shopping with OCEON. Your payment was verified, and your order is now being packed.
          </p>

          {order ? (
            <div className="mt-8 border-t border-line/50 pt-6 text-left space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Order Number</span>
                <span className="font-medium text-ink">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Paid</span>
                <span className="font-medium text-ink">{money(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-medium text-ink uppercase">{order.payment?.method || "Razorpay"}</span>
              </div>

              <div className="border-t border-line/50 pt-4">
                <h3 className="font-semibold text-xs uppercase tracking-[0.12em] text-ink mb-2">
                  Delivery Details
                </h3>
                <div className="text-muted text-xs space-y-1">
                  <p className="font-medium text-ink">{order.address.name}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                  <p>Phone: {order.address.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-line/50 pt-6 text-sm text-muted">
              Could not retrieve order details. Please check your email inbox for confirmation details.
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ocean-900 px-8 text-[14.5px] font-medium text-cream-50 hover:bg-ocean-950 transition-colors duration-300 w-full"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
