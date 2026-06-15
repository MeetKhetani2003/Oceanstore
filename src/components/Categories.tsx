'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

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

const CATEGORIES = [
  { id: 1, name: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000', colSpan: 'md:col-span-8', rowSpan: 'md:row-span-2' },
  { id: 2, name: 'Artisan Dairy', image: 'https://images.unsplash.com/photo-1628045610815-585324b12750?auto=format&fit=crop&q=80&w=800', colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1' },
  { id: 3, name: 'Pantry Essentials', image: 'https://images.unsplash.com/photo-1506606401543-2e73709cebfc?auto=format&fit=crop&q=80&w=800', colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1' },
];

export const Categories = () => {
  return (
    <section id="discover" className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="flex justify-between items-end mb-16">
          <motion.h2 variants={fadeUp} className="editorial-font text-4xl md:text-5xl text-charcoal">Curated Departments</motion.h2>
          <motion.a variants={fadeUp} href="#shop" className="hidden md:flex items-center space-x-2 text-sm font-medium text-charcoal hover:opacity-70 transition-opacity">
            <span>View All</span>
            <ChevronRight size={16} />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          {CATEGORIES.map((cat) => (
            <motion.div 
              key={cat.id} 
              variants={fadeUp}
              className={`relative rounded-2xl overflow-hidden group ${cat.colSpan} ${cat.rowSpan} h-[300px] md:h-auto cursor-pointer`}
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                <h3 className="editorial-font text-2xl md:text-3xl text-white font-normal">{cat.name}</h3>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
export default Categories;
