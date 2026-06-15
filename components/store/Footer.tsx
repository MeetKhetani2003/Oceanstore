"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { BRAND, CATEGORIES, WHATSAPP_URL } from "@/data/catalog";
import {
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  LogoMark,
  MapPin,
} from "@/lib/ui-utils/icons";

const company = ["About", "Careers", "Press", "Sustainability", "Our Hubs"];
const support = ["Help Center", "Delivery", "Returns", "Contact", "FAQ"];
const payments = ["Visa", "Mastercard", "Amex", "Apple Pay", "G Pay"];

function Col({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-100/45">
        {title}
      </h4>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-[14px] text-cream-100/70 transition-colors duration-300 hover:text-cream-50"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-ocean-950 text-cream-100/65">
      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 text-cream-50">
              <a href="/">
                <img
                  src="/WhatsApp_Image_2026-06-14_at_12.33.31_PM-removebg-preview.png"
                  alt={BRAND.name}
                  className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
              </a>
            </div>
            <p className="mt-5 max-w-xs text-pretty text-[14.5px] leading-relaxed text-cream-100/60">
              {BRAND.descriptor}. {BRAND.tagline} — fresh produce, dairy and
              everyday essentials, curated for modern households.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                notify("You're on the list — welcome to OCEON");
                setEmail("");
              }}
              className="mt-7 flex max-w-sm items-center gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for fresh drops"
                className="h-11 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-[14px] text-cream-50 outline-none transition-colors placeholder:text-cream-100/40 focus:border-white/35"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-500 text-white transition-colors hover:bg-leaf-600"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <a
              href={WHATSAPP_URL}
              className="mt-6 inline-flex items-center gap-2 text-[13px] text-cream-100/70 transition-colors hover:text-cream-50"
            >
              <MapPin className="h-4 w-4 text-leaf-400" />
              {BRAND.city}
            </a>
          </div>

          <Col title="Shop" links={[...CATEGORIES.map((c) => c.name), "All products"]} />
          <Col title="Company" links={company} />
          <Col title="Support" links={support} />
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-cream-100/50">
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] tracking-wide text-cream-100/45"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-cream-100/70 transition-colors hover:bg-white/10 hover:text-cream-50"
              >
                <Icon className="h-[17px] w-[17px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
