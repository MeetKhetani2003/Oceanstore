'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-warm-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Categories />
        <ProductSection />
        <TrustSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
