"use client";

import { Truck, Clock, Leaf, Refresh } from "@/lib/ui-utils/icons";
import { Reveal } from "@/components/store/Reveal";

const items = [
  { icon: Truck, label: "Free delivery over ₹299" },
  { icon: Clock, label: "Express in 15 minutes" },
  { icon: Leaf, label: "100% freshness guarantee" },
  { icon: Refresh, label: "Effortless returns" },
];



export function AssuranceStrip() {
  return (
    <section className="border-b border-line/70 bg-cream-50">
      <Reveal>
        <ul className="container-x grid grid-cols-2 md:grid-cols-4">
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-3 py-6 text-center md:border-l md:border-line/60 md:first:border-l-0 md:py-8"
            >
              <Icon className="h-5 w-5 shrink-0 text-leaf-600" />
              <span className="text-[13px] font-medium tracking-tight text-ink/80 md:text-[14px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
