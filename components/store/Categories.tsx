"use client";

import { CATEGORIES } from "@/data/catalog";
import { Reveal } from "@/components/store/Reveal";
import { Eyebrow } from "@/components/store/ui";
import { cn } from "@/utils/cn";

function CategoryCard({
  id,
  name,
  image,
  count,
  index,
}: {
  id: string;
  name: string;
  image: string;
  count: string;
  index: number;
}) {
  const bgColors = [
    "bg-rose-50 hover:bg-rose-100",
    "bg-amber-50 hover:bg-amber-100",
    "bg-emerald-50 hover:bg-emerald-100",
    "bg-blue-50 hover:bg-blue-100",
    "bg-violet-50 hover:bg-violet-100",
    "bg-cyan-50 hover:bg-cyan-100",
    "bg-orange-50 hover:bg-orange-100",
    "bg-fuchsia-50 hover:bg-fuchsia-100",
  ];
  
  const bgClass = bgColors[index % bgColors.length];

  return (
    <Reveal
      delay={(index % 4) * 0.05}
      className="col-span-1"
    >
      <a
        href={`/collections?category=${encodeURIComponent(name)}`}
        className={cn(
          "group relative flex flex-col items-center justify-between h-full p-5 rounded-[24px] border border-line/40 transition-all duration-300 overflow-hidden",
          bgClass,
          "hover:border-ocean-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ocean-500/10"
        )}
      >
        {/* Sleek Image Container */}
        <div className="relative w-full aspect-square flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-[85%] h-[85%] object-contain drop-shadow-md"
          />
        </div>

        {/* Text Area */}
        <div className="text-center mt-auto">
          <h3 className="text-[14.5px] md:text-[16px] font-bold text-ink leading-tight group-hover:text-ocean-600 transition-colors">
            {name}
          </h3>
          <p className="mt-1 text-[11px] md:text-[12px] font-semibold text-muted/80">
            {count}
          </p>
        </div>
      </a>
    </Reveal>
  );
}

export function Categories() {
  return (
    <section id="categories" className="bg-white py-16 md:py-24 border-b border-line">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <Reveal>
            <Eyebrow tone="ocean">Popular Categories</Eyebrow>
            <h2 className="mt-3 max-w-[20ch] font-display text-[24px] md:text-[32px] font-extrabold tracking-tight text-ink leading-tight">
              Shop Grocery by Category
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-[14px] leading-relaxed text-muted">
              Select a category to explore fresh farm fruits & vegetables, premium dairy products, namkeens, staples, and daily home essentials.
            </p>
          </Reveal>
        </div>

        {/* 4-column modern circles grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <CategoryCard
              key={c.id}
              id={c.id}
              name={c.name}
              image={c.image}
              count={c.count}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
