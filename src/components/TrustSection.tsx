'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Leaf, ShieldCheck, Award, ChevronRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const TRUST_FEATURES = [
  { icon: Clock, title: 'Impeccable Timing', desc: 'Precision delivery within your chosen window, every time.' },
  { icon: Leaf, title: 'Peak Freshness', desc: 'Sourced directly, stored perfectly, delivered at peak condition.' },
  { icon: ShieldCheck, title: 'Curated Quality', desc: 'Every item is inspected to meet our exacting standards.' },
  { icon: Award, title: 'Fair Value', desc: 'Premium quality without the excessive markup.' },
];

export const TrustSection = () => {
  return (
    <section id="our-standards" className="py-24 md:py-32 bg-ocean-blue text-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center"
        >
          <div className="lg:col-span-5">
            <motion.h2 variants={fadeUp} className="editorial-font text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Why Families<br />Trust OCEON
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-md font-light leading-relaxed mb-10">
              We approach grocery delivery with the precision of a technology company and the passion of an artisan market. No compromises.
            </motion.p>
            <motion.button variants={fadeUp} className="flex items-center space-x-2 text-sm font-medium border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-all">
              <span>Read our Quality Manifesto</span>
              <ChevronRight size={16} />
            </motion.button>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-1 sm:grid-cols-2 gap-12">
            {TRUST_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={fadeUp} className="flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                    <Icon size={24} className="text-warm-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default TrustSection;
