'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductBySlug } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Leaf,
  Clock,
  Plus,
  Minus,
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  Award,
  Share2,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Tab = 'description' | 'details' | 'delivery';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { addToCart, updateQuantity, toggleFavorite, favorites, cart, openAuthModal, user } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getProductBySlug(resolvedParams.slug);
      if (res.success && res.product) {
        setProduct(res.product);
        setRelated(res.related || []);
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams.slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const displayPrice = product.salePrice || product.price;
    addToCart({
      id: product.id,
      name: product.name,
      origin: product.brand,
      price: displayPrice,
      unit: 'pcs',
      image: product.image,
    });
    if (qty > 1) updateQuantity(product.id, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-32 pb-24 max-w-[1400px] w-full mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
            <div className="bg-subtle-gray/40 rounded-3xl aspect-[4/5]" />
            <div className="space-y-6 pt-8">
              <div className="h-3 bg-subtle-gray/60 rounded w-1/3" />
              <div className="h-12 bg-subtle-gray/60 rounded w-4/5" />
              <div className="h-8 bg-subtle-gray/40 rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-3 bg-subtle-gray/40 rounded" />
                <div className="h-3 bg-subtle-gray/40 rounded w-5/6" />
                <div className="h-3 bg-subtle-gray/40 rounded w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center space-y-6 px-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">404 — Product Not Found</p>
          <h1 className="editorial-font text-4xl md:text-5xl text-charcoal text-center">
            This item has left the shelf.
          </h1>
          <p className="text-sm text-gray-400 font-light text-center max-w-sm">
            It may have been removed or the link is incorrect. Explore our full catalogue below.
          </p>
          <Link
            href="/shop"
            className="flex items-center space-x-2 bg-accent-green text-white text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-[#153b20] transition-colors"
          >
            <span>Browse the Catalogue</span>
            <ChevronRight size={16} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const displayPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price);
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.salePrice !== null && parseFloat(product.salePrice) < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;
  const inCart = cart.find((item) => item.product.id === product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const images = product.images?.length > 0 ? product.images : [product.image];

  const tabContent: Record<Tab, React.ReactNode> = {
    description: (
      <div className="prose prose-sm max-w-none text-gray-600 font-light leading-relaxed">
        <p>{product.description}</p>
        {product.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-widest font-semibold text-accent-green border border-accent-green/30 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    ),
    details: (
      <div className="space-y-4 text-sm">
        {[
          { label: 'SKU', value: product.sku },
          { label: 'Brand', value: product.brand },
          { label: 'Category', value: product.category },
          { label: 'Availability', value: isOutOfStock ? 'Out of Stock' : `${product.stock} units available` },
          { label: 'Listed Price', value: `INR ${originalPrice.toFixed(2)}` },
          ...(hasDiscount ? [{ label: 'Sale Price', value: `INR ${displayPrice.toFixed(2)} (${discountPercent}% off)` }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between border-b border-subtle-gray/50 pb-4">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 w-28 flex-shrink-0">{label}</span>
            <span className="text-charcoal font-medium text-right">{value}</span>
          </div>
        ))}
      </div>
    ),
    delivery: (
      <div className="space-y-5 text-sm">
        {[
          {
            icon: Truck,
            title: 'Express Delivery',
            desc: 'Delivered in 15–30 minutes for orders placed before 8 PM. Same-day delivery for morning and evening slots.',
          },
          {
            icon: Clock,
            title: 'Delivery Windows',
            desc: 'Morning (8 AM–12 PM), Afternoon (12–4 PM), Evening (4–8 PM). Select your preferred time at checkout.',
          },
          {
            icon: RotateCcw,
            title: 'Easy Returns',
            desc: 'Not satisfied? Report within 24 hours and we will arrange a full refund or replacement. No questions asked.',
          },
          {
            icon: ShieldCheck,
            title: 'Quality Guarantee',
            desc: 'Every item is hygiene-tested and cold-chain certified. Our freshness promise is backed by our team.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start space-x-4">
            <div className="w-9 h-9 bg-accent-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-accent-green" />
            </div>
            <div>
              <p className="font-semibold text-charcoal text-xs mb-1">{title}</p>
              <p className="text-gray-400 font-light text-xs leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-24">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 mb-8">
          <nav className="flex items-center space-x-2 text-xs text-gray-400 font-light">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
            <ChevronRight size={12} />
            {product.category && (
              <>
                <span className="hover:text-charcoal transition-colors">{product.category}</span>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-charcoal font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Main product section */}
        <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* ── Left: Image Gallery ─────────────────────────────────────── */}
            <div className="space-y-4 sticky top-24">
              {/* Main image with zoom */}
              <div
                className="relative bg-white border border-subtle-gray rounded-3xl overflow-hidden aspect-[4/5] cursor-crosshair shadow-sm"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={images[activeImage] || product.image}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-12 mix-blend-multiply"
                    style={isZoomed ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(1.6)',
                      transition: 'transform 0.1s ease-out',
                    } : {}}
                  />
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  {hasDiscount && (
                    <span className="bg-accent-green text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      −{discountPercent}% OFF
                    </span>
                  )}
                  {isLowStock && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Low Stock
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Zoom hint */}
                {!isZoomed && (
                  <div className="absolute bottom-4 right-4 text-[10px] text-gray-300 font-light">
                    Hover to zoom
                  </div>
                )}
              </div>

              {/* Thumbnail row */}
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-white p-2 flex items-center justify-center transition-all duration-200 ${
                        activeImage === i ? 'border-charcoal shadow-sm' : 'border-subtle-gray hover:border-charcoal/40'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Info ─────────────────────────────────────── */}
            <div className="space-y-8 pt-2">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-accent-green font-bold">{product.brand}</span>
                  <span className="text-gray-200">•</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{product.category}</span>
                </div>
                <h1 className="editorial-font text-4xl md:text-5xl lg:text-[3.5rem] text-charcoal leading-[1.1] mb-3">
                  {product.name}
                </h1>
                <p className="text-xs font-mono text-gray-300">SKU: {product.sku}</p>
              </div>

              {/* Ratings (visual, static) */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-light">4.0 · 124 reviews</span>
                {product.featured && (
                  <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Award size={10} />
                    <span>OCEON Pick</span>
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-b border-subtle-gray py-6">
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-semibold text-charcoal">INR {displayPrice.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-300 line-through">INR {originalPrice.toFixed(2)}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-xs text-accent-green font-semibold mt-1">
                    You save INR {(originalPrice - displayPrice).toFixed(2)} ({discountPercent}% off)
                  </p>
                )}
                <p className="text-[11px] text-gray-400 font-light mt-2">
                  Price inclusive of all taxes. Free delivery on orders above INR 500.
                </p>
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-sm text-gray-500 font-light leading-relaxed">{product.shortDescription}</p>
              )}

              {/* Stock alert */}
              {isLowStock && !isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-xl px-4 py-3"
                >
                  <Clock size={14} className="flex-shrink-0" />
                  <span>Only {product.stock} left — reserve yours before it sells out.</span>
                </motion.div>
              )}

              {/* Qty + CTA */}
              {!isOutOfStock ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-subtle-gray rounded-full bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQty((p) => Math.max(1, p - 1))}
                      className="p-4 hover:bg-subtle-gray/50 transition-colors cursor-pointer"
                    >
                      <Minus size={14} className="text-charcoal" />
                    </button>
                    <span className="w-12 text-center font-semibold text-sm text-charcoal">{qty}</span>
                    <button
                      onClick={() => setQty((p) => Math.min(product.stock, p + 1))}
                      className="p-4 hover:bg-subtle-gray/50 transition-colors cursor-pointer"
                    >
                      <Plus size={14} className="text-charcoal" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <motion.button
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-4 px-8 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm cursor-pointer ${
                      addedToCart
                        ? 'bg-charcoal text-white'
                        : 'bg-accent-green hover:bg-[#153b20] text-white'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center space-x-2"
                        >
                          <Check size={18} />
                          <span>{inCart ? 'Cart Updated' : 'Added to Cart'}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="add"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center space-x-2"
                        >
                          <ShoppingBag size={18} />
                          <span>{inCart ? 'Update Cart' : 'Add to Cart'}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Wishlist */}
                  <motion.button
                    onClick={() => toggleFavorite(product.id)}
                    whileTap={{ scale: 0.93 }}
                    className={`w-14 h-14 rounded-full border flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                      isFavorite
                        ? 'border-red-200 text-red-500 bg-red-50'
                        : 'border-subtle-gray text-gray-400 bg-white hover:border-charcoal/30'
                    }`}
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 font-medium">
                  <span>Out of Stock — Check back soon or browse alternatives below.</span>
                </div>
              )}

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { icon: Clock, label: '15–30 min', sub: 'Express delivery' },
                  { icon: Leaf, label: 'Farm fresh', sub: 'Hand-picked daily' },
                  { icon: ShieldCheck, label: 'Certified', sub: 'Hygienic packing' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center border border-subtle-gray rounded-2xl p-4 bg-white shadow-sm"
                  >
                    <div className="w-8 h-8 bg-accent-green/10 rounded-lg flex items-center justify-center mb-2">
                      <Icon size={15} className="text-accent-green" />
                    </div>
                    <p className="text-[11px] font-semibold text-charcoal">{label}</p>
                    <p className="text-[10px] text-gray-400 font-light">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Share */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-charcoal transition-colors font-medium cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share this product</span>
              </button>
            </div>
          </div>

          {/* ── Tabs: Description / Details / Delivery ─────────────────────── */}
          <div className="mt-24 border-t border-subtle-gray pt-16">
            <div className="flex space-x-1 border-b border-subtle-gray mb-10 overflow-x-auto no-scrollbar">
              {(['description', 'details', 'delivery'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 px-6 text-xs uppercase tracking-widest font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                    activeTab === tab ? 'text-charcoal' : 'text-gray-400 hover:text-charcoal'
                  }`}
                >
                  {tab === 'description' ? 'Description' : tab === 'details' ? 'Product Details' : 'Delivery & Returns'}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl"
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Related Products ────────────────────────────────────────────── */}
          {related.length > 0 && (
            <div className="mt-24">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">You May Also Like</p>
                  <h2 className="editorial-font text-3xl md:text-4xl text-charcoal">From the Same Collection</h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:flex items-center space-x-2 text-xs font-semibold text-accent-green hover:underline"
                >
                  <span>View all</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((p) => {
                  const rPrice = p.salePrice ? parseFloat(p.salePrice) : parseFloat(p.price);
                  const rOriginal = parseFloat(p.price);
                  const rHasDiscount = p.salePrice && parseFloat(p.salePrice) < rOriginal;
                  return (
                    <Link
                      href={`/product/${p.slug}`}
                      key={p.id}
                      className="group flex flex-col"
                    >
                      <div className="relative bg-white rounded-2xl aspect-square overflow-hidden mb-4 p-6 flex items-center justify-center border border-subtle-gray shadow-sm hover:shadow-md transition-all duration-300">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
                        />
                        {rHasDiscount && (
                          <span className="absolute top-3 left-3 bg-accent-green text-white text-[9px] font-bold px-2 py-1 rounded-full">
                            SALE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{p.brand}</p>
                      <h3 className="text-sm font-medium text-charcoal leading-snug mb-2 group-hover:text-accent-green transition-colors line-clamp-2">
                        {p.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-auto">
                        <span className="text-sm font-semibold text-charcoal">INR {rPrice.toFixed(0)}</span>
                        {rHasDiscount && (
                          <span className="text-xs text-gray-300 line-through">INR {rOriginal.toFixed(0)}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
