'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCart, Product } from '@/context/CartContext';

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

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsAction } from '@/features/products/actions';

export const ProductSection = () => {
  const { addToCart, toggleFavorite, favorites } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const res = await getProductsAction();
      if (res.success && res.products) {
        setProducts(res.products.slice(0, 4)); // Show top 4 seeded arrivals
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 font-light bg-white">
        Loading fresh arrivals...
      </div>
    );
  }

  return (
    <section id="shop" className="py-24 md:py-32 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2 variants={fadeUp} className="editorial-font text-4xl md:text-5xl text-charcoal mb-4">Arrivals & Signatures</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto font-light">Seasonal highlights and everyday necessities, selected for unparalleled quality.</motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => {
            const isFavorite = favorites.includes(product.id);
            const displayPrice = product.salePrice || product.price;
            return (
              <motion.div 
                key={product.id} 
                variants={fadeUp}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="relative bg-[#FBFBF9] rounded-2xl aspect-[4/5] overflow-hidden mb-6 p-8 flex items-center justify-center border border-subtle-gray/30">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black-[0.01] transition-colors duration-300 z-10 pointer-events-none"></div>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-subtle-gray hover:shadow-md transition-all md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 duration-300 ${isFavorite ? 'text-red-500 fill-red-500 opacity-100 translate-y-0' : 'text-gray-400'}`}
                  >
                    <Heart size={18} strokeWidth={2} />
                  </button>
                </div>

                <div className="flex-grow flex flex-col">
                  <p className="text-xs text-gray-400 tracking-wider uppercase mb-2 font-medium">{product.brand}</p>
                  <h3 className="text-lg font-medium text-charcoal mb-1 leading-snug hover:text-accent-green transition-colors">
                    <Link href={`/product/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold text-charcoal">INR {displayPrice}</span>
                    </div>
                    <button 
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        origin: product.brand,
                        price: displayPrice,
                        unit: 'pcs',
                        image: product.image
                      })}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-charcoal hover:bg-ocean-blue hover:text-white hover:border-ocean-blue transition-colors duration-300"
                    >
                      <span className="text-xl font-light leading-none mb-[2px]">+</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ProductSection;
