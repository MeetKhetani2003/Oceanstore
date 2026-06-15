"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { Check } from "@/lib/ui-utils/icons";
import { EASE_PREMIUM } from "@/components/store/Reveal";

export function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 md:bottom-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: EASE_PREMIUM }}
        >
          <div className="flex items-center gap-2.5 rounded-full bg-ocean-900 py-3 pl-3 pr-5 text-[13.5px] font-medium text-cream-50 shadow-[0_20px_45px_-15px_rgba(7,23,38,0.7)]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf-500">
              <Check className="h-4 w-4" />
            </span>
            {toast}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
