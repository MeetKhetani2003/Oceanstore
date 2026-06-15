"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PRODUCTS, TABS, type Tab } from "@/data/catalog";
import { Reveal, staggerItem } from "@/components/store/Reveal";
import { ProductCard } from "@/components/store/ProductCard";
import { Eyebrow } from "@/components/store/ui";
import { ArrowRight } from "@/lib/ui-utils/icons";
import { cn } from "@/utils/cn";

export function Products() {
  const [tab, setTab] = useState<Tab>("all");
  const filtered =
    tab === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.tab === tab);

  return (
    <section id="shop" className="bg-cream-100 py-16 md:py-24 border-b border-line">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow tone="ocean">Daily Essentials</Eyebrow>
            <h2 className="mt-3 max-w-[20ch] font-display text-[24px] md:text-[32px] font-extrabold tracking-tight text-ink leading-tight">
              Best Sellers & Fresh Arrivals
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="md:max-w-xs">
            <p className="text-[14px] leading-relaxed text-muted">
              Handpicked everyday favorites, local harvest produce, and dairy essentials selected for the highest quality.
            </p>
          </Reveal>
        </div>

        {/* Tabs styled with logo colors */}
        <Reveal delay={0.05}>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-[13px] font-bold tracking-tight transition-all duration-300 shadow-sm cursor-pointer",
                  tab === t.id
                    ? "border-ocean-500 bg-ocean-500 text-white shadow-[0_6px_15px_-4px_rgba(10,100,227,0.3)]"
                    : "border-line bg-white text-ink/75 hover:border-ocean-300 hover:text-ocean-600"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <motion.div
          key={tab}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
        >
          {filtered.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <a
            href="#categories"
            className="group inline-flex items-center gap-2 text-[14px] font-bold text-ink hover:text-ocean-500 transition-colors"
          >
            Browse the full catalogue
            <ArrowRight className="h-4 w-4 text-leaf-500 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
