'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsAction } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Heart, ShoppingBag, ShieldCheck, Leaf, Clock, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { addToCart, toggleFavorite, favorites, updateQuantity, cart } = useCart();
  const [slug, setSlug] = useState<string | null>(null);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Resolve dynamic Next.js params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function loadProduct() {
      const res = await getProductsAction();
      if (res.success && res.products) {
        const found = res.products.find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center font-sans">
        <p className="text-gray-400 font-light text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center font-sans space-y-4">
        <h2 className="editorial-font text-2xl text-charcoal">Product Not Found</h2>
        <Link href="/shop" className="text-sm text-accent-green hover:underline">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice !== null;
  const inCart = cart.find((item) => item.product.id === product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      origin: product.brand,
      price: displayPrice,
      unit: 'pcs',
      image: product.image,
    });
    // Set matching quantity
    if (qty > 1) {
      updateQuantity(product.id, qty);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-[1400px] w-full mx-auto px-6 md:px-12">
        <Link
          href="/shop"
          className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-charcoal transition-colors mb-12"
        >
          <ArrowLeft size={16} />
          <span>Return to Shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Column: Product Image Gallery */}
          <div className="bg-white border border-subtle-gray rounded-2xl p-12 flex items-center justify-center shadow-sm aspect-[4/5]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
                {product.brand} • {product.category}
              </p>
              <h1 className="editorial-font text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
            </div>

            <div className="border-t border-b border-subtle-gray py-6 flex items-baseline space-x-4">
              <span className="text-3xl font-semibold text-charcoal">INR {displayPrice}</span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">INR {product.price}</span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Overview
              </h3>
              <p className="text-gray-600 font-light leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </div>

            {/* Inventory Alerts */}
            {product.stock <= 10 && product.stock > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl p-3.5 font-medium">
                Low Stock Warning: Only {product.stock} items left in store. Reserve yours now.
              </div>
            )}

            {/* Quantity Selector & Add Trigger */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center border border-subtle-gray rounded-full p-2 bg-white justify-between w-32">
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="p-1 hover:bg-subtle-gray rounded-full transition-colors cursor-pointer"
                >
                  <Minus size={14} className="text-charcoal" />
                </button>
                <span className="font-semibold text-sm w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((prev) => prev + 1)}
                  className="p-1 hover:bg-subtle-gray rounded-full transition-colors cursor-pointer"
                >
                  <Plus size={14} className="text-charcoal" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-accent-green hover:bg-[#153b20] text-white py-4 px-8 rounded-full font-medium transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm"
              >
                <ShoppingBag size={18} />
                <span>{inCart ? 'Update In Cart' : 'Add to Collection'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(product.id)}
                className={`w-14 h-14 rounded-full border flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 ${isFavorite ? 'border-red-200 text-red-500 bg-red-50' : 'border-subtle-gray text-gray-400 bg-white'}`}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Features Info list */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-subtle-gray">
              <div className="flex items-start space-x-3 text-xs">
                <Clock size={18} className="text-accent-green mt-0.5" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-0.5">Fast Dispatch</h4>
                  <p className="text-gray-400 font-light">Delivery in 15-30 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <Leaf size={18} className="text-accent-green mt-0.5" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-0.5">Peak Freshness</h4>
                  <p className="text-gray-400 font-light">Hand-picked daily</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <ShieldCheck size={18} className="text-accent-green mt-0.5" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-0.5">Secure Packing</h4>
                  <p className="text-gray-400 font-light">Hygiene certified packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
