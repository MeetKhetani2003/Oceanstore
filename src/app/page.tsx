import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import TrustSection from '@/components/TrustSection';
import Testimonials from '@/components/Testimonials';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-warm-white">
      <Navbar />
      <main className="flex-1">
        {/* 1. Full-screen hero carousel */}
        <Hero />
 
        {/* 2. Scrolling marquee ticker */}
        <Marquee />

        {/* 3. Category grid */}
        <Categories />

        {/* 4. Featured products */}
        <ProductSection />

        {/* 5. Why OCEON trust pillars */}
        <TrustSection />

        {/* 6. Customer testimonials */}
        <Testimonials />

        {/* 7. Free delivery CTA banner */}
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

