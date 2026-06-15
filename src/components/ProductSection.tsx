'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getProductsAction } from '@/features/products/actions';

export const ProductSection = () => {
  const router = useRouter();
  const { addToCart, toggleFavorite, favorites } = useCart();

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/product/${slug}`);
  };
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    getProductsAction().then((res) => {
      if (res.success && res.products) setProducts(res.products.slice(0, 4));
      setLoading(false);
    });
  }, []);

  const handleAdd = (product: any) => {
    const displayPrice = product.salePrice || product.price;
    addToCart({ id: product.id, name: product.name, origin: product.brand, price: displayPrice, unit: 'pcs', image: product.image });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section id="shop" className="py-24 md:py-36 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12" ref={ref}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2 mb-3"
            >
              <Sparkles size={14} className="text-accent-green" />
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Fresh Picks</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="editorial-font text-4xl md:text-6xl text-charcoal"
            >
              Arrivals &<br />Signatures
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="group flex items-center space-x-2 text-sm font-semibold text-charcoal border-b-2 border-charcoal/20 hover:border-accent-green hover:text-accent-green pb-1 transition-all duration-300"
            >
              <span>View Full Catalogue</span>
              <ArrowRight size={15} className="transform transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-subtle-gray/40 rounded-3xl aspect-[3/4]" />
                <div className="h-3 bg-subtle-gray/50 rounded w-1/4" />
                <div className="h-4 bg-subtle-gray/60 rounded w-3/4" />
                <div className="h-4 bg-subtle-gray/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, idx) => {
              const isFav = favorites.includes(product.id);
              const displayPrice = product.salePrice || product.price;
              const hasDiscount = product.salePrice !== null;
              const isAdded = addedId === product.id;

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                  onClick={(e) => handleCardClick(e, product.slug)}
                  className="group flex flex-col h-full bg-white border border-subtle-gray/40 rounded-3xl p-4 hover:border-accent-green/20 hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                >
                  {/* Image container */}
                  <div className="relative bg-warm-white/40 rounded-2xl overflow-hidden aspect-[3/4] mb-5 border border-subtle-gray/20 flex items-center justify-center p-6 transition-colors group-hover:bg-warm-white/20">
                    <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-600 group-hover:scale-105"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {hasDiscount && (
                        <span className="bg-accent-green/10 border border-accent-green/20 text-accent-green text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Sale
                        </span>
                      )}
                      {product.stock <= 10 && product.stock > 0 && (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Low Stock
                        </span>
                      )}
                    </div>

                    {/* Wishlist */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
                      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs border border-subtle-gray/50 hover:shadow-md transition-all duration-200 cursor-pointer ${
                        isFav ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Heart size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col px-1">
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1.5">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-charcoal leading-snug mb-2 hover:text-accent-green transition-colors line-clamp-2">
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h3>

                    {/* Modern Star line */}
                    <div className="flex items-center space-x-1 mb-4">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-charcoal">4.0</span>
                      <span className="text-[10px] text-gray-400 font-light">(124 reviews)</span>
                    </div>

                    {/* Footer Row */}
                    <div className="mt-auto pt-4 border-t border-subtle-gray/30 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-charcoal">INR {displayPrice}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through ml-2">INR {product.price}</span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(product); }}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                          isAdded
                            ? 'bg-charcoal border-charcoal text-white'
                            : 'border-accent-green/20 text-accent-green hover:bg-accent-green hover:text-white'
                        }`}
                      >
                        {isAdded ? 'Added ✓' : 'Add +'}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
