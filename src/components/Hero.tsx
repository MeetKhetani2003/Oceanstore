'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle } from 'lucide-react';

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

export const Hero = () => {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-ocean-blue">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=2400" 
          alt="Premium Grocery" 
          className="w-full h-full object-cover scale-105 transform transition-transform duration-[20s] hover:scale-100"
        />
      </div>

      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-6 md:px-12 flex flex-col items-start mt-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-2xl text-white"
        >
          <motion.p variants={fadeUp} className="text-sm md:text-base tracking-[0.2em] uppercase font-medium mb-6 opacity-80">
            Quality In Lowest Prices
          </motion.p>
          <motion.h1 variants={fadeUp} className="editorial-font text-5xl md:text-7xl lg:text-8xl leading-[1.1] mb-8 font-normal">
            Fresh Essentials.<br />Delivered Beautifully.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl font-light mb-12 max-w-lg opacity-90 leading-relaxed">
            Fresh produce, artisan dairy, and everyday essentials meticulously curated for the modern household.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-6">
            <a 
              href="#shop"
              className="bg-white text-ocean-blue px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Shop Collection</span>
              <ChevronRight size={18} />
            </a>
            <a 
              href="https://wa.me/1234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle size={18} />
              <span>Order via WhatsApp</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
export default Hero;
