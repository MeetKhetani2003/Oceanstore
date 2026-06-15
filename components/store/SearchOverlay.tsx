"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, FormEvent } from "react";
import { useStore } from "@/context/StoreContext";
import { useLockBody } from "@/lib/ui-utils/hooks";
import { CATEGORIES } from "@/data/catalog";
import { Close, Search, ArrowUpRight } from "@/lib/ui-utils/icons";
import { EASE_PREMIUM } from "@/components/store/Reveal";
import { useRouter } from "next/navigation";

const POPULAR = [
  "Mango",
  "Banana",
  "Milk",
  "Paneer",
  "Bread",
  "Coca Cola",
];

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const router = useRouter();
  useLockBody(searchOpen);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (q.trim()) {
      router.push(`/collections?search=${encodeURIComponent(q.trim())}`);
      closeSearch();
    }
  };

  const handlePopularSearch = (term: string) => {
    router.push(`/collections?search=${encodeURIComponent(term)}`);
    closeSearch();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex justify-center px-4 pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_PREMIUM }}
        >
          <div
            className="absolute inset-0 bg-ocean-950/45 backdrop-blur-md"
            onClick={closeSearch}
          />
          <motion.div
            className="relative w-full max-w-2xl"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE_PREMIUM }}
          >
            <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_40px_80px_-30px_rgba(7,23,38,0.5)]">
              <form onSubmit={handleSearch} className="flex items-center gap-3 border-b border-gray-100 px-5">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search for fresh essentials…"
                  className="h-16 flex-1 bg-transparent text-[17px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeSearch}
                  className="grid h-9 w-9 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Close className="h-5 w-5" />
                </button>
              </form>

              <div className="px-5 py-6 bg-gray-50/50">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-gray-500">
                  Popular searches
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-medium text-gray-700 transition-colors hover:border-ocean-300 hover:text-ocean-600 shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.24em] text-gray-500">
                  Browse categories
                </p>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                  {CATEGORIES.map((c) => (
                    <a
                      key={c.id}
                      href={`/collections?category=${encodeURIComponent(c.name)}`}
                      onClick={closeSearch}
                      className="group flex items-center justify-between py-2.5 text-[14px] font-medium text-gray-600 transition-colors hover:text-ocean-600"
                    >
                      {c.name}
                      <ArrowUpRight className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ocean-500" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
