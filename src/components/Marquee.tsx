'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ITEMS = [
  '🥑 Organic Avocados',
  '🍅 Heirloom Tomatoes',
  '🥛 Artisan Dairy',
  '🫒 Cold-Pressed Olive Oil',
  '🍞 Daily Sourdough',
  '🥦 Farm Broccoli',
  '🍓 Seasonal Berries',
  '🧀 Aged Cheddar',
  '🍋 Amalfi Lemons',
  '🌿 Fresh Herbs',
];

export const Marquee = () => {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="bg-accent-green text-white py-4 overflow-hidden border-y border-accent-green/20">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center mx-8 text-sm font-medium tracking-wide">
            {item}
            <span className="mx-6 text-white/30">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
