'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Truck, Star, ShieldCheck } from 'lucide-react';

export const CtaBanner = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-12 md:py-16 px-6 md:px-12 max-w-[1600px] mx-auto" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="relative rounded-[2rem] overflow-hidden bg-accent-green text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-10 md:p-16">
          {/* Left */}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-4">
              Limited Time Offer
            </p>
            <h2 className="editorial-font text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Free Delivery<br />on Your First<br />3 Orders.
            </h2>
            <p className="text-white/70 font-light mb-8 text-base leading-relaxed max-w-md">
              New to OCEON? Experience the difference. No minimum order, no delivery charges — for your first three orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="group inline-flex items-center space-x-2 bg-white text-accent-green px-7 py-4 rounded-full font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg shadow-black/10"
              >
                <span>Start Shopping Free</span>
                <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: feature pills */}
          <div className="space-y-4">
            {[
              { icon: Truck, title: 'Delivery in 15 minutes', sub: 'Fastest in the city, guaranteed' },
              { icon: Star, title: 'Handpicked quality', sub: 'Every item passes our 12-point check' },
              { icon: ShieldCheck, title: 'No-risk returns', sub: 'Not happy? Full refund, no questions' },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/15"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/60 font-light">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CtaBanner;
