"use client";

import Link from "next/link";
import { cn } from "@/utils/cn";
import { CATEGORIES } from "@/data/catalog";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Close } from "@/lib/ui-utils/icons";
import { useLockBody } from "@/lib/ui-utils/hooks";

export function FilterSidebar({ activeCategory }: { activeCategory: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Close modal when search params change (e.g. after clicking a filter link)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  useLockBody(isOpen);

  const FilterContent = () => {
    const currentSearch = searchParams.get("search") || "";
    const currentMin = searchParams.get("minPrice") || "";
    const currentMax = searchParams.get("maxPrice") || "";
    const currentSort = searchParams.get("sortBy") || "";

    const [minPrice, setMinPrice] = useState(currentMin);
    const [maxPrice, setMaxPrice] = useState(currentMax);

    const applyPriceFilter = () => {
      const params = new URLSearchParams(searchParams.toString());
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
      
      params.delete("page"); // Reset page when filtering
      router.push(`/collections?${params.toString()}`);
    };

    return (
      <div className="space-y-4">
        {/* Categories */}
        <div className="bg-white rounded-[20px] border border-line p-4 shadow-sm">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-4 px-2">
            Aisles & Departments
          </h2>
          
          <nav className="space-y-1">
            <Link
              href="/collections"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border-l-4",
                !activeCategory
                  ? "border-ocean-500 bg-ocean-50 text-ocean-600"
                  : "border-transparent text-ink/80 hover:bg-gray-50 hover:text-ink"
              )}
            >
              <span className="truncate flex-1">All Aisles</span>
            </Link>

            {CATEGORIES.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
              const hrefParams = new URLSearchParams();
              hrefParams.set("category", cat.name);
              if (currentSearch) hrefParams.set("search", currentSearch);
              if (currentSort) hrefParams.set("sortBy", currentSort);

              return (
                <Link
                  key={cat.id}
                  href={`/collections?${hrefParams.toString()}`}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-bold transition-all mt-1 border-l-4",
                    isActive
                      ? "border-ocean-500 bg-ocean-50 text-ocean-600"
                      : "border-transparent text-ink/80 hover:bg-gray-50 hover:text-ink"
                  )}
                >
                  <span className="truncate flex-1">{cat.name}</span>
                  <span className="text-[10px] bg-cream-100 text-muted px-2 py-0.5 rounded-full font-bold ml-2">
                    {cat.count.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Price Filter */}
        <div className="bg-white rounded-[20px] border border-line p-4 shadow-sm">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-4 px-2">
            Price Range (₹)
          </h2>
          <div className="flex items-center gap-2 px-2 mb-3">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ocean-500 transition-colors"
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ocean-500 transition-colors"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full h-9 rounded-lg bg-gray-50 text-gray-700 text-[13px] font-bold hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            Apply Price Filter
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Filters Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-line px-4 py-3 text-[14px] font-bold text-ink shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          Filters & Categories
        </button>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block space-y-4">
        <FilterContent />
      </aside>

      {/* Mobile Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[70] flex justify-end bg-ocean-950/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Click away overlay */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
            
            <motion.div
              className="relative w-full max-w-[320px] bg-cream-100 h-full overflow-y-auto shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5 bg-white sticky top-0 z-10">
                <span className="font-display text-[16px] font-extrabold text-ink">Filters</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-ink hover:bg-gray-200 transition-colors"
                >
                  <Close className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
