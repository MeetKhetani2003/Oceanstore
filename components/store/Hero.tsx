"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGES, STATS, WHATSAPP_URL } from "@/data/catalog";
import { Button } from "@/components/store/ui";
import { Whatsapp, ChevronDown } from "@/lib/ui-utils/icons";
import { cn } from "@/utils/cn";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SLIDES = [
  {
    image: IMAGES.hero,
    tagline: "15 MIN EXPRESS DELIVERY",
    title: "Fresh Essentials. Delivered Instantly.",
    description: "Daily essentials, fresh farm produce, dairy, and household snacks delivered to your doorstep in minutes at the lowest prices.",
    ctaText: "Shop Catalog",
    ctaLink: "#shop",
    badge: "50% OFF FIRST ORDER",
  },
  {
    image: IMAGES.editorialMain,
    tagline: "ARTISAN PANTRY & DAIRY",
    title: "Pure Milk & Fresh Farm Breads.",
    description: "Small-batch organic sourdoughs, farm milk, butter, and daily breakfast products sourced directly from local cooperatives.",
    ctaText: "Browse Dairy",
    ctaLink: "#categories",
    badge: "100% FARM FRESH",
  },
  {
    image: IMAGES.ctaBg,
    tagline: "HEALTHY & HYGIENIC",
    title: "Organic Vegetables. Handpicked Daily.",
    description: "100% quality checked leafy greens, seasonal veggies and fresh fruits sourced from farms, clean and safely packed.",
    ctaText: "Order Produce",
    ctaLink: "#categories",
    badge: "DIRECT FROM FARM",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  // Auto transition slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative flex min-h-[450px] md:min-h-[550px] lg:min-h-[650px] lg:h-[650px] items-center overflow-hidden bg-ocean-950">
      
      {/* Background Images Crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 0.45, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ocean-950 via-ocean-900/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-transparent to-transparent" />

      {/* Content */}
      <div className="container-x relative z-10 py-12 md:py-20 w-full text-white">
        <div className="flex flex-col">
          
          {/* Text Block */}
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {/* Badge and Tagline */}
                <div className="inline-flex items-center gap-2 rounded-lg bg-ocean-500/25 border border-ocean-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ocean-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-500 animate-pulse" />
                  {slide.tagline}
                </div>

                {/* Promo Badge */}
                <span className="ml-2 inline-flex items-center rounded-lg bg-leaf-500/20 border border-leaf-500/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-leaf-400">
                  {slide.badge}
                </span>

                {/* Title */}
                <h1 className="mt-4 font-display text-[2.4rem] md:text-[3.6rem] lg:text-[4.2rem] font-extrabold leading-[1.08] tracking-tight text-white">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="mt-4 text-[14.5px] leading-relaxed text-gray-300 md:text-[16px] max-w-xl">
                  {slide.description}
                </p>

                {/* Call to Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Button href={slide.ctaLink} variant="green" size="md" arrow>
                    {slide.ctaText}
                  </Button>
                  <Button href={WHATSAPP_URL} variant="outlineLight" size="md">
                    <Whatsapp className="h-4.5 w-4.5 text-leaf-400" />
                    Quick Order
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Carousel Controls */}
          <div className="mt-12 flex gap-3 justify-start items-center">
            {SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  current === idx 
                    ? "bg-leaf-500 w-8" 
                    : "bg-white/30 hover:bg-white/60 w-2.5"
                )}
              />
            ))}
          </div>

        </div>

        {/* Compact stats display */}
        <div className="mt-12 hidden border-t border-white/10 pt-6 md:block">
          <dl className="flex flex-wrap items-center gap-x-12 gap-y-2">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                {i > 0 && <span className="h-6 w-px bg-white/10" />}
                <div className="flex items-baseline gap-2">
                  <dt className="text-xl font-extrabold text-white">
                    {s.value}
                  </dt>
                  <dd className="text-[11px] uppercase tracking-wider text-gray-400">
                    {s.label}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

      </div>

    </section>
  );
}
