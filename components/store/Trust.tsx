"use client";

import { TRUST } from "@/data/catalog";
import { Reveal } from "@/components/store/Reveal";
import { Eyebrow } from "@/components/store/ui";
import { Truck, Leaf, Shield, Tag, Check, Quote } from "@/lib/ui-utils/icons";

const iconMap = {
  truck: Truck,
  leaf: Leaf,
  shield: Shield,
  tag: Tag,
  check: Check,
};

export function Trust() {
  return (
    <section
      id="trust"
      className="relative overflow-hidden bg-ocean-950 py-24 text-cream-50 md:py-32"
    >
      <div className="pointer-events-none absolute -top-1/4 left-1/2 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-ocean-500/15 blur-[130px]" />

      <div className="container-x relative">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow tone="cream">Why families trust OCEON</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-cream-50">
              Built on trust, delivered with care.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-cream-100/70">
              Thousands of households rely on OCEON each week. Here's what keeps
              them coming back — and what we promise on every single order.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST.map((t, i) => {
            const Icon = iconMap[t.icon];
            return (
              <Reveal key={t.title} delay={(i % 5) * 0.06}>
                <div className="flex h-full flex-col">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-inset ring-white/10">
                    <Icon className="h-6 w-6 text-leaf-300" />
                  </span>
                  <h3 className="mt-5 text-[17px] font-medium tracking-tight text-cream-50">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-cream-100/65">
                    {t.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Testimonial */}
        <Reveal>
          <figure className="mx-auto mt-20 max-w-3xl border-t border-white/10 pt-14 text-center">
            <Quote className="mx-auto h-8 w-8 text-leaf-400/80" />
            <blockquote className="mt-6 font-display text-[clamp(1.4rem,2.6vw,2rem)] font-normal italic leading-[1.35] tracking-[-0.01em] text-cream-50">
              “OCEON has quietly replaced our weekly supermarket run. Everything
              arrives immaculate, genuinely fresh, and exactly when they say it
              will.”
            </blockquote>
            <figcaption className="mt-7 text-[13px] uppercase tracking-[0.2em] text-cream-100/55">
              Priya M. — Member since 2023
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
