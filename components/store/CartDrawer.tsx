"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useLockBody } from "@/lib/ui-utils/hooks";
import { money, BRAND } from "@/data/catalog";
import { EASE_PREMIUM } from "@/components/store/Reveal";
import { Close, Plus, Minus, Bag, Heart, ArrowRight, Truck } from "@/lib/ui-utils/icons";
import { cn } from "@/utils/cn";

const FREE_THRESHOLD = 299;

function EmptyState({
  icon,
  title,
  sub,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  cta: string;
}) {
  const { closeDrawer } = useStore();
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sand text-muted">
        {icon}
      </span>
      <h3 className="mt-6 font-display text-2xl font-light text-ink">{title}</h3>
      <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">{sub}</p>
      <button
        onClick={() => {
          closeDrawer();
          document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-ocean-900 px-6 py-3 text-[14px] font-medium text-cream-50 transition-colors hover:bg-ocean-950"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    drawerTab,
    setDrawerTab,
    cartCount,
    savedCount,
    cartLines,
    savedLines,
    subtotal,
    setQty,
    removeFromCart,
    addToCart,
    toggleSave,
  } = useStore();
  useLockBody(drawerOpen);

  const checkoutWhatsApp = () => {
    const msg = `Hi OCEON, I'd like to place an order:\n${cartLines
      .map((l) => `• ${l.product.name} ×${l.qty}`)
      .join("\n")}\n\nTotal: ${money(subtotal)}`;
    window.open(
      `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener"
    );
  };

  const remaining = Math.max(0, FREE_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_PREMIUM }}
        >
          <div
            className="absolute inset-0 bg-ocean-950/45 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE_PREMIUM }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-[0_0_80px_-10px_rgba(7,23,38,0.6)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4">
              <div className="flex rounded-full bg-sand p-1">
                {(
                  [
                    ["cart", `Cart`, cartCount],
                    ["saved", `Saved`, savedCount],
                  ] as const
                ).map(([id, label, count]) => (
                  <button
                    key={id}
                    onClick={() => setDrawerTab(id)}
                    className={cn(
                      "relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-300",
                      drawerTab === id
                        ? "bg-cream-50 text-ink shadow-sm"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {label}
                    {count > 0 && (
                      <span className="ml-1.5 align-middle text-[11px] text-muted">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-ink/[0.06]"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {drawerTab === "cart" ? (
                cartLines.length === 0 ? (
                  <EmptyState
                    icon={<Bag className="h-7 w-7" />}
                    title="Your cart is empty"
                    sub="Fresh produce, dairy and essentials are waiting. Let's fill it up."
                    cta="Start shopping"
                  />
                ) : (
                  <ul className="divide-y divide-line/60">
                    {cartLines.map(({ product, qty }) => (
                      <li key={product.id} className="flex gap-4 px-5 py-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-[14.5px] font-medium leading-tight text-ink">
                                {product.name}
                              </h4>
                              <p className="mt-0.5 text-[12px] text-muted">
                                {money(product.price)} {product.unit}
                              </p>
                            </div>
                            <span className="font-display text-[15px] text-ink">
                              {money(product.price * qty)}
                            </span>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center gap-1 rounded-full border border-line bg-cream-50 p-0.5">
                              <button
                                onClick={() => setQty(product.id, qty - 1)}
                                aria-label="Decrease"
                                className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-sand"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-6 text-center text-[13px] font-semibold tabular-nums">
                                {qty}
                              </span>
                              <button
                                onClick={() => setQty(product.id, qty + 1)}
                                aria-label="Increase"
                                className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-sand"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-[12px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : savedLines.length === 0 ? (
                <EmptyState
                  icon={<Heart className="h-7 w-7" />}
                  title="No saved items yet"
                  sub="Tap the heart on any product to keep it here for later."
                  cta="Discover products"
                />
              ) : (
                <ul className="divide-y divide-line/60">
                  {savedLines.map(({ product }) => (
                    <li key={product.id} className="flex gap-4 px-5 py-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-[14.5px] font-medium leading-tight text-ink">
                              {product.name}
                            </h4>
                            <p className="mt-0.5 text-[12px] text-muted">
                              {product.category}
                            </p>
                          </div>
                          <span className="font-display text-[15px] text-ink">
                            {money(product.price)}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <button
                            onClick={() => addToCart(product.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ocean-900 px-4 py-2 text-[12.5px] font-medium text-cream-50 transition-colors hover:bg-ocean-950"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add to cart
                          </button>
                          <button
                            onClick={() => toggleSave(product.id)}
                            className="text-[12px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {drawerTab === "cart" && cartLines.length > 0 && (
              <div className="border-t border-line/70 px-5 py-5">
                <div className="flex items-center gap-2 text-[12.5px] text-muted">
                  <Truck className="h-4 w-4 text-leaf-600" />
                  {remaining > 0 ? (
                    <span>
                      Add{" "}
                      <span className="font-semibold text-ink">
                        {money(remaining)}
                      </span>{" "}
                      for free delivery
                    </span>
                  ) : (
                    <span className="text-leaf-700">
                      You've unlocked free delivery
                    </span>
                  )}
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-leaf-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[14px] text-muted">Subtotal</span>
                  <span className="font-display text-2xl font-normal text-ink">
                    {money(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Taxes &amp; delivery calculated at checkout.
                </p>

                <button
                  onClick={() => {
                    closeDrawer();
                    window.location.href = "/checkout";
                  }}
                  className="group mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ocean-900 py-[14px] text-[15px] font-medium text-cream-50 transition-colors hover:bg-ocean-950"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={checkoutWhatsApp}
                  className="group mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-leaf-600/30 text-leaf-700 py-2 text-[13.5px] font-medium transition-colors hover:bg-leaf-50/50"
                >
                  Checkout via WhatsApp
                </button>
                <button
                  onClick={closeDrawer}
                  className="mt-2 w-full rounded-full py-2.5 text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
