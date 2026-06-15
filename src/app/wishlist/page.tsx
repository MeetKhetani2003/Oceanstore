'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductsAction } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  const router = useRouter();
  const { favorites, toggleFavorite, addToCart, cart } = useCart();

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/product/${slug}`);
  };
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const res = await getProductsAction();
      if (res.success && res.products) {
        setProducts(res.products);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter product catalog by favorited IDs
    const filtered = products.filter((p) => favorites.includes(p.id));
    setWishlistItems(filtered);
  }, [favorites, products]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-[1400px] w-full mx-auto px-6 md:px-12">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">My Collection</p>
          <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">Favorites Wishlist</h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm font-light">Loading wishlist...</p>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-24 bg-white border border-subtle-gray rounded-3xl p-12 max-w-lg mx-auto shadow-sm space-y-6">
            <Heart size={48} className="text-gray-300 mx-auto" strokeWidth={1} />
            <div>
              <h2 className="editorial-font text-2xl text-charcoal mb-1">Your wishlist is empty</h2>
              <p className="text-gray-400 font-light text-xs">Explore our curated departments and heart products to save them here.</p>
            </div>
            <Link 
              href="/shop"
              className="inline-flex bg-accent-green hover:bg-[#153b20] text-white py-3 px-6 rounded-full font-medium transition-colors text-xs items-center space-x-2"
            >
              <span>Explore Catalogue</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((p) => {
              const displayPrice = p.salePrice || p.price;
              const hasDiscount = p.salePrice !== null;
              const isAdded = cart.some(item => item.product.id === p.id);
              
              return (
                <div key={p.id} onClick={(e) => handleCardClick(e, p.slug)} className="group cursor-pointer flex flex-col h-full bg-white border border-subtle-gray/40 rounded-3xl p-4 hover:border-accent-green/20 hover:shadow-lg transition-all duration-300 relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleFavorite(p.id)}
                    className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs border border-subtle-gray/50 hover:shadow-sm hover:scale-105 transition-all cursor-pointer text-red-500 fill-red-500"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Image Holder */}
                  <div className="relative bg-warm-white/40 border border-subtle-gray/20 rounded-2xl aspect-[3/4] overflow-hidden mb-5 p-6 flex items-center justify-center group-hover:bg-warm-white/20 transition-colors">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
                    />
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-accent-green/10 border border-accent-green/20 text-accent-green text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-grow flex flex-col px-1">
                    <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">{p.brand}</p>
                    <h3 className="text-sm font-semibold text-charcoal mb-2 leading-snug hover:text-accent-green line-clamp-2">
                      <Link href={`/product/${p.slug}`}>
                        {p.name}
                      </Link>
                    </h3>

                    {/* Star ratings */}
                    <div className="flex items-center space-x-1 mb-4">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-charcoal">4.0</span>
                      <span className="text-[10px] text-gray-400 font-light">(124 reviews)</span>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-subtle-gray/30">
                      <span className="text-sm font-bold text-charcoal">INR {displayPrice}</span>
                      <button
                        onClick={() => addToCart({
                          id: p.id,
                          name: p.name,
                          origin: p.brand,
                          price: displayPrice,
                          unit: 'pcs',
                          image: p.image
                        })}
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
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
