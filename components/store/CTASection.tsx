"use client";

import { IMAGES, WHATSAPP_URL } from "@/data/catalog";
import { Reveal } from "@/components/store/Reveal";
import { Button, Eyebrow } from "@/components/store/ui";
import { Whatsapp } from "@/lib/ui-utils/icons";

export function CTASection() {
  return (
    <section className="bg-cream-50 py-20 md:py-28">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ocean-950">
            <img
              src={IMAGES.ctaBg}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/92 via-ocean-950/75 to-ocean-950/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/60 to-transparent" />

            <div className="relative z-10 mx-auto max-w-2xl px-6 py-20 text-center md:px-12 md:py-28">
              <div className="flex justify-center">
                <Eyebrow tone="cream">Ready when you are</Eyebrow>
              </div>
              <h2 className="mt-5 font-display text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.02em] text-cream-50">
                Order in minutes,
                <br />
                delivered beautifully.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-pretty text-[16px] leading-relaxed text-cream-100/75">
                Message us your list on WhatsApp and a real person will assemble
                and dispatch your order — or browse the full collection online.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button href={WHATSAPP_URL} variant="green" size="lg">
                  <Whatsapp className="h-[18px] w-[18px]" />
                  Order via WhatsApp
                </Button>
                <Button href="#shop" variant="outlineLight" size="lg" arrow>
                  Shop Collection
                </Button>
              </div>
              <p className="mt-7 text-[12.5px] uppercase tracking-[0.2em] text-cream-100/45">
                Live tracking · Six days a week · No subscription required
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
