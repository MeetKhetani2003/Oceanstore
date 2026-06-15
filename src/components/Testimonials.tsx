'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Priya Sharma',
    location: 'South Delhi',
    rating: 5,
    text: 'OCEON has completely changed how I grocery shop. The avocados arrived perfectly ripe and the sourdough is honestly better than my local bakery.',
    avatar: 'PS',
    color: '#1E4D2B',
    product: 'Organic Avocados + Sourdough',
  },
  {
    name: 'Rahul Mehta',
    location: 'Gurugram',
    rating: 5,
    text: 'I was skeptical about 15-minute delivery but they delivered in 12! The packaging is beautiful and everything was ice cold. Will never go back to supermarkets.',
    avatar: 'RM',
    color: '#0A192F',
    product: 'Artisan Dairy Pack',
  },
  {
    name: 'Anika Patel',
    location: 'Noida',
    rating: 5,
    text: 'The quality is incredible for the price. I bought the olive oil and it tastes like something from a specialty import store. Genuinely impressed.',
    avatar: 'AP',
    color: '#7C4A1E',
    product: 'Cold-Pressed Olive Oil',
  },
  {
    name: 'Dev Krishnan',
    location: 'Lajpat Nagar',
    rating: 5,
    text: 'The UI is clean, delivery is fast, and the food is fresh. My kids love the produce selections. OCEON is a household staple now.',
    avatar: 'DK',
    color: '#4A1E7C',
    product: 'Weekly Fresh Basket',
  },
];

export const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 md:py-36 bg-warm-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12" ref={ref}>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3"
          >
            Customer Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="editorial-font text-4xl md:text-6xl text-charcoal"
          >
            Loved by Thousands
          </motion.h2>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="bg-white rounded-3xl p-7 border border-subtle-gray shadow-sm hover:shadow-md transition-shadow duration-400 flex flex-col"
            >
              <Quote size={24} className="text-subtle-gray mb-4" />

              <p className="text-gray-600 font-light text-sm leading-relaxed mb-6 flex-1">
                "{review.text}"
              </p>

              <div className="flex items-center space-x-1 mb-5">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="flex items-center space-x-3 border-t border-subtle-gray pt-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: review.color }}
                >
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{review.name}</p>
                  <p className="text-[11px] text-gray-400">{review.location}</p>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[10px] text-accent-green font-semibold bg-accent-green/10 px-2.5 py-1 rounded-full">
                  ✓ {review.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-14 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 bg-white rounded-3xl border border-subtle-gray p-8 shadow-sm"
        >
          {[
            { value: '50,000+', label: 'Happy Customers' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '2M+', label: 'Orders Delivered' },
            { value: '99.2%', label: 'Satisfaction Rate' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center px-6 border-b md:border-b-0 md:border-r last:border-0 border-subtle-gray pb-4 md:pb-0 w-full md:w-auto">
              <p className="editorial-font text-3xl md:text-4xl text-charcoal">{value}</p>
              <p className="text-xs text-gray-400 font-light mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
