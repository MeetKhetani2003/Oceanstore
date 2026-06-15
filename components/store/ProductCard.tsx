"use client";

import { useStore } from "@/context/StoreContext";
import { money, type Product } from "@/data/catalog";
import { Heart, HeartFilled, Plus, Minus, Star } from "@/lib/ui-utils/icons";
import { cn } from "@/utils/cn";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, setQty, toggleSave, isSaved } = useStore();
  const qty = cart[product.id] ?? 0;
  const saved = isSaved(product.id);

  const discountPercent = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-[20px] bg-white p-3 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 hover:border-ocean-100">
      
      {/* Product Image Link & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F8F9FA] flex items-center justify-center mb-3">
        <Link 
          href={`/products/${product.id}`}
          className="w-full h-full p-2 flex items-center justify-center"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm"
          />
        </Link>

        {product.badge && (
          <div className="absolute left-2 top-2">
            <span className={cn(
              "px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-sm backdrop-blur-md",
              product.badge === "New" ? "bg-leaf-500/90" : "bg-ocean-500/90"
            )}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Favorite Icon */}
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save item"}
          aria-pressed={saved}
          onClick={() => toggleSave(product.id)}
          className={cn(
            "absolute right-2 top-2 z-20 grid h-7 w-7 place-items-center rounded-full transition-all duration-300 cursor-pointer backdrop-blur-md border",
            saved
              ? "bg-rose-50 border-rose-100 text-rose-500"
              : "bg-white/80 border-gray-200/50 text-gray-400 hover:text-rose-500 hover:bg-white"
          )}
        >
          {saved ? (
            <HeartFilled className="h-[14px] w-[14px]" />
          ) : (
            <Heart className="h-[14px] w-[14px]" />
          )}
        </button>
      </div>

      {/* Info Section Link */}
      <Link 
        href={`/products/${product.id}`}
        className="flex flex-col flex-1 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="flex items-center justify-center bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-600">
            {product.unit.replace("/ ", "")}
          </span>
          {discountPercent > 0 && (
            <span className="flex items-center justify-center bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        <h3 className="text-[14px] font-semibold leading-[1.3] tracking-tight text-gray-900 line-clamp-2 min-h-[36px]">
          {product.name}
        </h3>
      </Link>

      {/* Pricing & ADD Button Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-[16px] font-extrabold text-gray-900 tracking-tight">
              {money(product.price)}
            </span>
          </div>
          {product.comparePrice && product.comparePrice > product.price ? (
            <span className="font-sans text-[11px] text-gray-400 line-through font-medium">
              MRP {money(product.comparePrice)}
            </span>
          ) : (
             <span className="font-sans text-[11px] text-transparent select-none">placeholder</span>
          )}
        </div>

        {/* Dynamic ADD / Qty Controller */}
        <div className="w-[72px] shrink-0 z-20">
          {qty > 0 ? (
            <div className="flex items-center justify-between h-8 rounded-lg bg-leaf-600 text-white font-sans shadow-[0_2px_8px_rgba(5,150,105,0.25)]">
              <button
                type="button"
                onClick={() => setQty(product.id, qty - 1)}
                className="grid h-8 w-7 place-items-center rounded-l-lg hover:bg-black/10 transition-colors cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-[13px] font-bold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(product.id, qty + 1)}
                className="grid h-8 w-7 place-items-center rounded-r-lg hover:bg-black/10 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="flex w-full h-8 items-center justify-center rounded-lg border border-leaf-200 bg-leaf-50 text-[13px] font-extrabold text-leaf-600 transition-all hover:bg-leaf-100 hover:border-leaf-300 cursor-pointer shadow-sm"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
