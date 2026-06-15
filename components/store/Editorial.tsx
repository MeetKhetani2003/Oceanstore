"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { IMAGES } from "@/data/catalog";
import { Reveal } from "@/components/store/Reveal";
import { Eyebrow, Button } from "@/components/store/ui";
import { Check } from "@/lib/ui-utils/icons";

const points = [
  "Sourced from trusted regional farms and independent makers.",
  "Hand-checked for freshness and quality before every dispatch.",
  "Priced fairly and transparently — never any hidden fees.",
];

export function Editorial() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-22, 34]);

  return (
    <section id="story" className="bg-white py-24 md:py-32">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Image composition */}
        <Reveal>
          <div ref={ref} className="relative">
            <motion.div
              style={reduce ? undefined : { y: y1 }}
              className="relative aspect-[5/6] overflow-hidden rounded-[2rem]"
            >
              <img
                src={IMAGES.editorialMain}
                alt="A chef preparing fresh vegetables"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <motion.div
              style={reduce ? undefined : { y: y2 }}
              className="absolute -bottom-8 right-2 hidden aspect-[3/4] w-40 overflow-hidden rounded-2xl border-[6px] border-cream shadow-[0_30px_60px_-20px_rgba(7,23,38,0.55)] sm:block lg:w-44"
            >
              <img
                src={IMAGES.editorialSecond}
                alt="Fresh produce being sliced"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div className="absolute left-5 top-8 rounded-2xl bg-white/95 px-5 py-4 shadow-xl border border-line/50 backdrop-blur">
              <p className="font-display text-3xl font-bold leading-none text-ink">
                100%
              </p>
              <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                Hand-checked
              </p>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div>
          <Reveal>
            <Eyebrow tone="ocean">The OCEON standard</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-ink">
              Curated daily, delivered with care.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">
              We treat groceries like they matter — because they do. Every
              order is assembled by hand, quality-checked against a strict
              freshness standard, and dispatched from a hub near you. No
              anonymous warehouses. No produce left to wilt.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <ul className="mt-8 space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-500 border border-leaf-100">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink/85">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Button href="#shop" variant="primary" arrow>
                Start an order
              </Button>
              <div className="flex items-center gap-3">
                <span className="font-sans text-lg font-bold text-ink">
                  OCEON
                </span>
                <span className="text-[13px] leading-tight text-muted font-medium">
                  Quality in
                  <br />
                  lowest prices
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
