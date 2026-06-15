"use client";

import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/store/ProductCard";
import { Eyebrow } from "@/components/store/ui";
import { Heart } from "@/lib/ui-utils/icons";
import Link from "next/link";

export default function WishlistPage() {
  const { savedLines, toggleSave, addToCart, savedCount } = useStore();

  return (
    <div className="bg-cream-50 min-h-screen pt-28 pb-20">
      <div className="container-x">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <Eyebrow tone="leaf">Your Collection</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-light tracking-tight text-ink md:text-5xl">
            My Wishlist ({savedCount} items)
          </h1>
          <p className="mt-3 text-muted max-w-xl">
            Your saved grocery and daily essentials. Keep items here to monitor stock levels or quickly add to your next basket.
          </p>
        </div>

        {savedLines.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-line/45 shadow-sm max-w-lg mx-auto px-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-50 text-muted mb-6">
              <Heart className="h-7 w-7 text-ink/30" />
            </div>
            <h3 className="font-display text-2xl font-light text-ink">No saved items yet</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Tap the heart icon on any product to save it here for quick reference later.
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ocean-900 px-6 text-[13.5px] font-medium text-cream-50 hover:bg-ocean-950 transition-colors duration-300"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {savedLines.map(({ product }) => {
              // Map savedLines item structure to catalog Product structure for ProductCard
              const cardProduct = {
                id: product.id,
                name: product.name,
                category: product.category,
                tab: (product.tab as any) || "all",
                price: product.price,
                unit: product.unit,
                image: product.image,
                badge: product.badge as any,
                origin: product.origin,
              };

              return (
                <div key={product.id} className="relative group bg-white p-4 rounded-3xl border border-line/40 shadow-sm flex flex-col justify-between">
                  <div className="relative">
                    <ProductCard product={cardProduct} />
                    <Link
                      href={`/products/${product.id}`}
                      className="absolute inset-0 z-10 cursor-pointer"
                      aria-label={`View ${product.name} details`}
                    />
                  </div>
                  
                  {/* Actions Bar inside card footer */}
                  <div className="mt-4 pt-4 border-t border-line/50 flex gap-2 justify-between items-center relative z-20">
                    <button
                      onClick={() => addToCart(product.id)}
                      className="text-xs font-semibold uppercase tracking-wider text-leaf-700 hover:text-leaf-800 underline transition-colors"
                    >
                      Add to basket
                    </button>
                    <button
                      onClick={() => toggleSave(product.id)}
                      className="text-xs text-muted hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
