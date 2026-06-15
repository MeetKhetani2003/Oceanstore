'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Fresh Produce',
    description: 'Organic fruits & vegetables, sourced daily from local farms.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    href: '/shop',
    color: '#1E4D2B',
    items: '120+ items',
    span: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    name: 'Artisan Dairy',
    description: 'Handcrafted cheeses, cream, and cultured butter.',
    image: 'https://images.unsplash.com/photo-1628045610815-585324b12750?auto=format&fit=crop&q=80&w=800',
    href: '/shop',
    color: '#7C4A1E',
    items: '40+ items',
    span: 'col-span-1',
  },
  {
    name: 'Pantry & Bakery',
    description: 'Daily bread, premium oils, and pantry staples.',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=800',
    href: '/shop',
    color: '#0A192F',
    items: '80+ items',
    span: 'col-span-1',
  },
  {
    name: 'Meat & Seafood',
    description: 'Ethically sourced, fresh-cut proteins delivered cold.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800',
    href: '/shop',
    color: '#7B1D1D',
    items: '35+ items',
    span: 'col-span-1 md:col-span-2',
  },
];

export const Categories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="discover" className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div ref={ref}>
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3"
            >
              Shop by Department
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="editorial-font text-4xl md:text-6xl text-charcoal leading-tight"
            >
              Every Aisle.<br />Perfectly Stocked.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="group flex items-center space-x-2 text-sm font-semibold text-charcoal border-b-2 border-charcoal/20 hover:border-accent-green hover:text-accent-green pb-1 transition-all duration-300"
            >
              <span>Browse All Products</span>
              <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] gap-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative rounded-3xl overflow-hidden group cursor-pointer ${cat.span}`}
            >
              <Link href={cat.href} className="block w-full h-full">
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${cat.color}ee 0%, transparent 60%, rgba(0,0,0,0.3) 100%)` }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-7 flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-white/70 border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      {cat.items}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="editorial-font text-2xl md:text-3xl text-white font-normal leading-tight mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-white/60 text-xs font-light leading-relaxed max-w-[240px] hidden md:block">
                        {cat.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-400">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
