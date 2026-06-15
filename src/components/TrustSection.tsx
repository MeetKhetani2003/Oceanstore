'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, Leaf, ShieldCheck, Award, Zap, Truck } from 'lucide-react';
import Link from 'next/link';

const PILLARS = [
  {
    icon: Zap,
    title: '15-Minute Delivery',
    desc: 'Our dark stores are strategically placed so your order reaches you faster than ever.',
    stat: '98%',
    statLabel: 'on-time rate',
    color: '#1E4D2B',
  },
  {
    icon: Leaf,
    title: 'Farm to Doorstep',
    desc: 'We partner directly with certified organic farms. No middlemen, no mystery.',
    stat: '100%',
    statLabel: 'organic sourced',
    color: '#0A192F',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guarantee',
    desc: 'Every product passes a 12-point quality inspection before it enters our warehouse.',
    stat: '12-pt',
    statLabel: 'quality check',
    color: '#7C4A1E',
  },
  {
    icon: Award,
    title: 'Fair Value Promise',
    desc: 'Premium quality shouldn\'t cost a premium. We keep margins honest and prices fair.',
    stat: '30%',
    statLabel: 'avg. savings vs retail',
    color: '#4A1E7C',
  },
];

export const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="our-standards" className="py-24 md:py-36 bg-ocean-blue text-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12" ref={ref}>

        {/* Top: headline + intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-end">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4"
            >
              Our Standards
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="editorial-font text-5xl md:text-6xl lg:text-7xl leading-tight"
            >
              Why Families<br />Trust OCEON
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-lg"
          >
            We built OCEON with one principle: a family should never have to choose between quality and affordability. Every decision we make reflects that.
          </motion.p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:bg-white/10 transition-colors duration-400 group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${p.color}55`, border: `1px solid ${p.color}88` }}
                >
                  <Icon size={22} className="text-white" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-bold mb-1 editorial-font">{p.stat}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-5">{p.statLabel}</div>
                <h3 className="text-lg font-semibold mb-3">{p.title}</h3>
                <p className="text-white/50 font-light text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
