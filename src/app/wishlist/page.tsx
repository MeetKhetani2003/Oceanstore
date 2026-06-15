'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsAction } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  const { favorites, toggleFavorite, addToCart } = useCart();
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
              return (
                <div key={p.id} className="group cursor-pointer flex flex-col h-full bg-white border border-subtle-gray rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden mb-6 flex items-center justify-center p-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-subtle-gray shadow-sm text-red-500 fill-red-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1">{p.brand}</p>
                    <h3 className="text-sm font-medium text-charcoal mb-2 leading-snug hover:text-accent-green">
                      <Link href={`/product/${p.slug}`}>
                        {p.name}
                      </Link>
                    </h3>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-subtle-gray/30">
                      <span className="text-sm font-semibold text-charcoal">INR {displayPrice}</span>
                      <button
                        onClick={() => addToCart({
                          id: p.id,
                          name: p.name,
                          origin: p.brand,
                          price: displayPrice,
                          unit: 'pcs',
                          image: p.image
                        })}
                        className="text-xs font-semibold text-accent-green hover:text-[#153b20] flex items-center space-x-1"
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Cart</span>
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
