"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useLockBody } from "@/lib/ui-utils/hooks";
import { BRAND, NAV, WHATSAPP_URL } from "@/data/catalog";
import { Close, LogoMark, Whatsapp, ArrowUpRight } from "@/lib/ui-utils/icons";
import { EASE_PREMIUM } from "@/components/store/Reveal";

const social = ["Instagram", "X", "Facebook"];

export function MobileMenu() {
  const { menuOpen, closeMenu } = useStore();
  useLockBody(menuOpen);

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col bg-cream-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_PREMIUM }}
        >
          <div className="container-x flex h-16 items-center justify-between">
            <a href="/" onClick={closeMenu} className="flex items-center">
              <img
                src="/WhatsApp_Image_2026-06-14_at_12.33.31_PM-removebg-preview.png"
                alt="OCEON"
                className="h-10 w-auto object-contain"
              />
            </a>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-ink/[0.06]"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <motion.nav
            className="container-x mt-6 flex flex-1 flex-col gap-1"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
            }}
          >
            {NAV.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_PREMIUM } },
                }}
                className="group flex items-center justify-between border-b border-line/70 py-5"
              >
                <span className="font-display text-3xl font-light tracking-tight text-ink">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-muted">
                  0{i + 1}
                </span>
              </motion.a>
            ))}
          </motion.nav>

          <div className="container-x pb-10 pt-4">
            <a
              href={WHATSAPP_URL}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-leaf-600 py-[14px] text-[15px] font-medium text-white transition-colors hover:bg-leaf-700"
            >
              <Whatsapp className="h-5 w-5" />
              Order on WhatsApp
            </a>
            <div className="mt-7 flex items-center justify-between">
              <div className="text-[13px] leading-relaxed text-muted">
                <p>{BRAND.phone}</p>
                <p>{BRAND.email}</p>
              </div>
              <div className="flex items-center gap-4">
                {social.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-ink/70"
                  >
                    {s} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
