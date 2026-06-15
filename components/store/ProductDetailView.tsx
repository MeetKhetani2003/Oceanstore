"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductDetailInteraction } from "./ProductDetailInteraction";
import { ProductCard } from "./ProductCard";
import { Badge } from "./ui";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ChevronDown, Star, Truck, ShieldCheck, Refresh as RefreshCw } from "@/lib/ui-utils/icons";
import { money } from "@/data/catalog";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  images?: string[];
  category: string;
  description: string;
  origin?: string;
  weight?: number;
  comparePrice?: number;
  badge?: string;
  ratingAverage: number;
  ratingCount: number;
}

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: any[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "center center", transform: "scale(1)" });
  
  const productImages = product.images?.length ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(productImages[0]);

  // Hover zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.15)",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  // Mock Reviews
  const reviews = [
    {
      id: 1,
      author: "Aarav S.",
      rating: 5,
      date: "2 days ago",
      text: "Outstanding quality! Super fresh and arrived in under 20 minutes. Highly recommended.",
    },
    {
      id: 2,
      author: "Priya M.",
      rating: 4,
      date: "1 week ago",
      text: "Tastes amazing and looks very clean. Packing was clean and eco-friendly.",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Dynamic Grid */}
      <div className="grid gap-12 lg:grid-cols-2 bg-white rounded-[32px] border border-line/40 p-6 md:p-10 shadow-sm">
        
        {/* Left Side: Interactive Gallery */}
        <div className="space-y-4">
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F8F9FA] border border-line/50 cursor-zoom-in flex items-center justify-center p-4"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              style={zoomStyle}
              className="h-full w-full object-contain transition-transform duration-100 ease-out"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge tone={product.badge === "New" ? "leaf" : "ocean"}>
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all p-1 bg-[#F8F9FA] flex items-center justify-center",
                    activeImage === img ? "border-ocean-500 shadow-sm" : "border-transparent hover:border-line"
                  )}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted">Hover image to inspect detail</p>
        </div>

        {/* Right Side: Dynamic Meta Details */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-leaf-500">
            {product.category}
          </span>
          <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-ink md:text-4.5xl leading-tight">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-4 w-4 fill-current", i < Math.floor(product.ratingAverage) ? "text-amber-400" : "text-gray-200")} />
              ))}
            </div>
            <span className="text-sm font-semibold text-ink">{product.ratingAverage.toFixed(1)}</span>
            <span className="text-sm text-muted">({product.ratingCount} verified ratings)</span>
          </div>

          {/* Pricing Row */}
          <div className="mt-5 flex items-baseline gap-2.5">
            <span className="text-3xl font-semibold text-ink">
              {money(product.price)}
            </span>
            <span className="text-sm font-medium text-muted">{product.unit}</span>
            {product.comparePrice && (
              <span className="text-sm line-through text-muted/70 ml-2">
                {money(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-[14.5px] leading-relaxed text-muted">
            {product.description || `Hand-selected, fresh ${product.name.toLowerCase()} sourced with care for quality and taste.`}
          </p>

          {/* Client-side Add to Basket Controls */}
          <ProductDetailInteraction product={product} />

          {/* Modern Accordion Sections */}
          <div className="mt-10 border-t border-line/60 pt-6 space-y-4">
            
            {/* Accordion: Details */}
            <div className="border-b border-line/50 pb-4">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full flex items-center justify-between text-left font-semibold text-sm uppercase tracking-[0.12em] text-ink"
              >
                <span>Product Details &amp; Info</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", activeAccordion === "details" ? "rotate-180" : "")} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === "details" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs mt-4">
                      <div>
                        <dt className="text-muted font-normal">Origin</dt>
                        <dd className="text-ink font-semibold mt-0.5">{product.origin || "Local Organic Farm"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted font-normal">Est. Weight</dt>
                        <dd className="text-ink font-semibold mt-0.5">{product.weight ? `${product.weight}g` : "500g"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted font-normal">Shelf Life</dt>
                        <dd className="text-ink font-semibold mt-0.5">3-5 Days</dd>
                      </div>
                      <div>
                        <dt className="text-muted font-normal">Packaging</dt>
                        <dd className="text-ink font-semibold mt-0.5">Recyclable / Paper Bag</dd>
                      </div>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion: Delivery Guarantee */}
            <div className="border-b border-line/50 pb-4">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full flex items-center justify-between text-left font-semibold text-sm uppercase tracking-[0.12em] text-ink"
              >
                <span>Delivery &amp; Fresh Guarantee</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", activeAccordion === "shipping" ? "rotate-180" : "")} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs text-muted space-y-3 mt-4">
                      <div className="flex gap-2 items-start">
                        <Truck className="h-4 w-4 text-leaf-600 shrink-0 mt-0.5" />
                        <p><strong>Fast Dispatch:</strong> Express delivery in 30 minutes. Free shipping on orders over ₹299.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <ShieldCheck className="h-4 w-4 text-leaf-600 shrink-0 mt-0.5" />
                        <p><strong>Quality Check:</strong> Every basket hand-inspected before leaving our local warehouse.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <RefreshCw className="h-4 w-4 text-leaf-600 shrink-0 mt-0.5" />
                        <p><strong>No-Questions Guarantee:</strong> If any item is damaged or not fresh, contact us for an instant replacement or refund.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Ratings & Reviews Breakdown */}
      <div className="bg-white rounded-[32px] border border-line/40 p-6 md:p-10 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-ink mb-6">Customer Feedback</h2>
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          {/* Average Rating Block */}
          <div className="text-center md:text-left md:border-r border-line/50 md:pr-8 flex flex-col justify-center">
            <span className="text-5xl font-semibold text-ink">{product.ratingAverage.toFixed(1)}</span>
            <div className="flex justify-center md:justify-start text-amber-400 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-5 w-5 fill-current", i < Math.floor(product.ratingAverage) ? "text-amber-400" : "text-gray-200")} />
              ))}
            </div>
            <p className="text-xs text-muted mt-3">Based on {product.ratingCount} verified shopper reviews</p>
          </div>

          {/* Reviews List */}
          <div className="space-y-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="border-b border-line/50 pb-5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-ink">{rev.author}</span>
                  <span className="text-xs text-muted">{rev.date}</span>
                </div>
                <div className="flex text-amber-400 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("h-3 w-3 fill-current", i < rev.rating ? "text-amber-400" : "text-gray-200")} />
                  ))}
                </div>
                <p className="text-sm text-muted mt-2 leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-ink mb-8 text-center md:text-left">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((p) => {
              const cardProduct = {
                id: p.slug,
                name: p.name,
                category: p.category,
                tab: (p.tab as any) || "all",
                price: p.price,
                unit: p.unit,
                image: p.externalImages?.[0] || "",
                badge: p.badge as any,
                origin: p.origin,
              };

              return (
                <div key={p._id as string} className="relative">
                  <ProductCard product={cardProduct} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
