"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/store/ui";
import { money } from "@/data/catalog";
import Script from "next/script";
import { ShieldCheck, Truck, CreditCard } from "@/lib/ui-utils/icons";
import { cn } from "@/utils/cn";

type Step = "shipping" | "review" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartLines, subtotal, cartCount, notify, clearCart } = useStore();

  const [activeStep, setActiveStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setName(data.user.name || "");
          const defAddress = data.user.addresses?.find((a: any) => a.isDefault) || data.user.addresses?.[0];
          if (defAddress) {
            setLine1(defAddress.line1 || "");
            setLine2(defAddress.line2 || "");
            setCity(defAddress.city || "");
            setState(defAddress.state || "");
            setPincode(defAddress.pincode || "");
            setPhone(defAddress.phone || "");
          }
        } else {
          router.push("/login?from=/checkout");
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, [router]);

  const shipping = subtotal >= 299 ? 0 : 29.0;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + shipping + tax;

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      alert("Please fill in all required shipping fields.");
      return;
    }
    setActiveStep("review");
  };

  const handlePlaceOrder = async () => {
    if (cartCount === 0) {
      alert("Your basket is empty.");
      return;
    }

    setLoading(true);
    setActiveStep("payment");

    try {
      // Create DB order & Razorpay order
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shippingAddress: {
            name,
            phone,
            line1,
            line2,
            city,
            state,
            pincode,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate order");
      }

      const { orderId, razorpayOrder } = orderData;

      // Launch Razorpay checkout overlay
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "OCEON Store",
        description: `Order Ref: ${orderData.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            notify("Payment successful!");
            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
          } catch (err: any) {
            alert(`Payment success but verification failed: ${err.message}`);
            setLoading(false);
            setActiveStep("review");
          }
        },
        prefill: {
          name: user?.name || name,
          email: user?.email || "",
          contact: phone,
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzpay = new (window as any).Razorpay(options);
      rzpay.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setActiveStep("review");
      });
      rzpay.open();
    } catch (err: any) {
      alert(err.message || "An error occurred placing your order.");
      setLoading(false);
      setActiveStep("review");
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <p className="text-sm tracking-tight text-muted">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="bg-cream-50 min-h-screen pt-28 pb-20">
        <div className="container-x max-w-6xl">
          {/* Step Indicator Header */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Connector Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-line/80 z-0" />
              <div
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-ocean-900 z-0 transition-all duration-500",
                  activeStep === "shipping" ? "w-0" : activeStep === "review" ? "w-1/2" : "w-full"
                )}
              />

              {/* Steps */}
              {[
                { id: "shipping", label: "Shipping", icon: Truck },
                { id: "review", label: "Review", icon: ShieldCheck },
                { id: "payment", label: "Payment", icon: CreditCard },
              ].map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = activeStep === step.id;
                const isCompleted =
                  (activeStep === "review" && idx === 0) ||
                  (activeStep === "payment" && (idx === 0 || idx === 1));

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                        isCurrent
                          ? "bg-ocean-900 border-ocean-900 text-cream-50 shadow-md"
                          : isCompleted
                          ? "bg-leaf-600 border-leaf-600 text-white"
                          : "bg-white border-line text-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        "absolute -bottom-6 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap mt-1",
                        isCurrent ? "text-ocean-900 font-bold" : "text-muted"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] mt-12">
            
            {/* Left Column: Form & Step Contents */}
            <div className="bg-white rounded-3xl border border-line/40 p-6 md:p-8 shadow-sm space-y-6">
              
              {/* STEP 1: SHIPPING DETAILS */}
              {activeStep === "shipping" && (
                <form onSubmit={handleNextToReview} className="space-y-6">
                  <h2 className="text-lg font-light tracking-tight text-ink border-b border-line/50 pb-3">
                    Shipping Address
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      required
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                      placeholder="Flat, House no., Building, Company"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                      placeholder="Area, Street, Sector, Village"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink/70 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full rounded-xl border border-line bg-cream-50/50 px-4 py-2.5 text-[14px] text-ink focus:border-leaf-500 focus:outline-none transition-colors"
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full h-12 mt-6">
                    Continue to Review
                  </Button>
                </form>
              )}

              {/* STEP 2: ORDER REVIEW */}
              {activeStep === "review" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-light tracking-tight text-ink border-b border-line/50 pb-3">
                    Review Your Order
                  </h2>

                  <div className="bg-cream-50/70 border border-line rounded-2xl p-5 text-sm space-y-2">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-ink mb-1">
                      Delivery Destination
                    </h3>
                    <p className="font-medium text-ink">{name}</p>
                    <p className="text-muted">
                      {line1}, {line2 && `${line2}, `}
                      {city}, {state} - {pincode}
                    </p>
                    <p className="text-muted">Contact: {phone}</p>
                    <button
                      onClick={() => setActiveStep("shipping")}
                      className="text-xs font-semibold text-leaf-700 hover:text-leaf-800 underline mt-2 block"
                    >
                      Edit shipping address
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-ink">
                      Selected Items ({cartCount})
                    </h3>
                    <ul className="divide-y divide-line/40 border border-line rounded-2xl overflow-hidden bg-cream-50/30">
                      {cartLines.map(({ product, qty }) => (
                        <li key={product.id} className="flex gap-4 p-4 items-center">
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover bg-sand shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-ink truncate">{product.name}</h4>
                            <p className="text-[11px] text-muted">{qty} × {money(product.price)}</p>
                          </div>
                          <span className="font-semibold text-xs text-ink">{money(product.price * qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-line/50">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setActiveStep("shipping")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="green"
                      size="lg"
                      onClick={handlePlaceOrder}
                      className="flex-1"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT PROCESSING */}
              {activeStep === "payment" && (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto animate-spin rounded-full h-10 w-10 border-2 border-ocean-900 border-t-transparent" />
                  <h3 className="font-display text-xl font-light text-ink">
                    Connecting Secure Payment Gateway
                  </h3>
                  <p className="text-sm text-muted max-w-xs mx-auto">
                    Please complete the payment in the Razorpay transaction overlay. Do not close this browser tab.
                  </p>
                </div>
              )}

            </div>

            {/* Right Column: Order Pricing Total */}
            <div className="bg-white rounded-3xl border border-line/40 p-6 shadow-sm h-fit space-y-6">
              <h2 className="text-lg font-light tracking-tight text-ink border-b border-line/50 pb-3">
                Order Value
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : money(shipping)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>GST/Tax (5%)</span>
                  <span>{money(tax)}</span>
                </div>
                <div className="border-t border-line/50 pt-3 flex justify-between text-base font-semibold text-ink">
                  <span>Grand Total</span>
                  <span>{money(grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
