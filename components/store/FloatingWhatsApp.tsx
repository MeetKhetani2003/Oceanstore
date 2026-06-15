"use client";

import { motion } from "framer-motion";
import { WHATSAPP_URL } from "@/data/catalog";
import { Whatsapp } from "@/lib/ui-utils/icons";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3"
    >
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full bg-ocean-900 px-3.5 py-2 text-[13px] font-medium text-cream-50 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 sm:block">
        Order on WhatsApp
      </span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-leaf-600 text-white shadow-[0_14px_30px_-8px_rgba(47,78,57,0.7)] transition-colors duration-300 group-hover:bg-leaf-700">
        <span className="absolute inset-0 animate-ping rounded-full bg-leaf-500/40 [animation-duration:2.6s]" />
        <Whatsapp className="relative h-7 w-7" />
      </span>
    </motion.a>
  );
}
