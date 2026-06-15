"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/store/ui";
import { Bag, Heart, Whatsapp } from "@/lib/ui-utils/icons";
import { WHATSAPP_URL } from "@/data/catalog";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
  };
}

export function ProductDetailInteraction({ product }: ProductDetailProps) {
  const { addToCart, toggleSave, isSaved, openDrawer } = useStore();
  const [qty, setQty] = useState(1);

  const saved = isSaved(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, qty);
  };

  const handleBuyNow = () => {
    addToCart(product.id, qty);
    openDrawer("cart");
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.1em] text-ink/60">Quantity</span>
        <div className="flex items-center rounded-full border border-line bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-cream-50 transition-colors"
          >
            —
          </button>
          <span className="w-12 text-center text-sm font-semibold text-ink">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-cream-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleAddToCart}
          variant="primary"
          size="lg"
          className="flex-1"
        >
          <Bag className="h-4 w-4" />
          Add to Basket
        </Button>

        <Button
          onClick={handleBuyNow}
          variant="green"
          size="lg"
          className="flex-1"
        >
          Buy Now
        </Button>

        <button
          type="button"
          onClick={() => toggleSave(product.id)}
          className={`grid h-12 w-12 place-items-center rounded-full border transition-all ${
            saved
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-line bg-white text-ink hover:border-ink/40"
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* WhatsApp Ordering Cue */}
      <div className="rounded-2xl border border-line bg-white p-4 text-center">
        <p className="text-xs text-muted mb-2.5">
          Prefer to order manually? Send us a quick text.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-leaf-500 hover:text-leaf-600 transition-colors"
        >
          <Whatsapp className="h-4 w-4 text-leaf-500" />
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
