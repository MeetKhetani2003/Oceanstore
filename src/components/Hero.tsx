'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Zap, Leaf, Clock } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'New Season Arrivals',
    headline: 'Farm Fresh.\nDelivered\nBeautifully.',
    subtext: 'Hand-picked at peak ripeness. On your doorstep in 30 minutes.',
    cta: 'Shop Fresh Produce',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=2400',
    accent: '#1E4D2B',
    badge: '🌿 Organic Certified',
  },
  {
    id: 2,
    eyebrow: 'Artisan Collection',
    headline: 'Premium\nDairy &\nBakery.',
    subtext: 'Small-batch, handcrafted staples from trusted local producers.',
    cta: 'Explore Artisan Range',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=2400',
    accent: '#7C4A1E',
    badge: '🥐 Daily Baked',
  },
  {
    id: 3,
    eyebrow: 'Express Delivery',
    headline: '15 Minutes.\nAny Order.\nEvery Time.',
    subtext: 'The fastest grocery delivery in your city. Zero compromises on quality.',
    cta: 'Order Now',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2400',
    accent: '#0A192F',
    badge: '⚡ Express Delivery',
  },
];

const STATS = [
  { icon: Zap, value: '15 min', label: 'Avg. Delivery' },
  { icon: Leaf, value: '100%', label: 'Organic Sourced' },
  { icon: Clock, value: '24/7', label: 'Order Anytime' },
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1);
  }, [current, goTo]);

  // Auto-advance + progress bar
  useEffect(() => {
    setProgress(0);
    const duration = 6000;
    const interval = 50;
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / duration) * 100, 100));
    }, interval);

    const slideTimer = setTimeout(next, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(slideTimer);
    };
  }, [current, next]);

  const slide = SLIDES[current];

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.4 } }),
  };

  return (
    <section className="relative h-screen min-h-[680px] max-h-[900px] overflow-hidden bg-ocean-blue">
      {/* Background images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.eyebrow}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center max-w-[1600px] mx-auto px-6 md:px-12 pt-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${slide.id}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="max-w-2xl text-white"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 backdrop-blur-sm border border-white/20 text-white px-4 py-1.5 rounded-full mb-6"
            >
              {slide.badge}
            </motion.span>

            <h1 className="editorial-font text-6xl md:text-8xl lg:text-[6rem] leading-[1.0] mb-6 font-normal whitespace-pre-line">
              {slide.headline}
            </h1>

            <p className="text-base md:text-xl font-light mb-10 opacity-85 leading-relaxed max-w-lg">
              {slide.subtext}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={slide.ctaLink}
                className="group inline-flex items-center space-x-2 bg-white text-charcoal px-7 py-4 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                <span>{slide.cta}</span>
                <ChevronRight size={16} className="transform transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://wa.me/919205968389"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 border border-white/30 text-white px-7 py-4 rounded-full font-medium text-sm hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stats row */}
        <div className="absolute bottom-16 left-6 md:left-12 right-6 md:right-12 max-w-[1600px]">
          <div className="flex items-end justify-between">
            {/* Live stats */}
            <div className="hidden md:flex items-center space-x-8">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center space-x-3 text-white">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-base font-bold leading-none">{value}</p>
                    <p className="text-[11px] opacity-60 font-light mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Slide counter */}
              <span className="text-white/50 text-xs font-mono">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>

              {/* Dots */}
              <div className="flex items-center space-x-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? 1 : -1)}
                    className="relative h-0.5 rounded-full overflow-hidden cursor-pointer transition-all duration-300"
                    style={{ width: i === current ? 32 : 16, background: 'rgba(255,255,255,0.3)' }}
                  >
                    {i === current && (
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Arrow buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/15 transition-all duration-300 cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all duration-300 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
