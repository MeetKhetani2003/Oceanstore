'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductsAction } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import { Search, Heart, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SkeletonCard = () => (
  <div className="bg-white border border-subtle-gray/50 rounded-3xl p-6 space-y-5 shadow-xs">
    <div className="bg-warm-white/60 border border-subtle-gray/30 rounded-2xl aspect-[4/5] animate-pulse flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-subtle-gray/40 border-t-accent-green animate-spin" />
    </div>
    <div className="space-y-2">
      <div className="h-2.5 bg-subtle-gray/50 rounded w-1/4 animate-pulse" />
      <div className="h-4 bg-subtle-gray/60 rounded w-3/4 animate-pulse" />
    </div>
    <div className="pt-4 border-t border-subtle-gray/30 flex items-center justify-between">
      <div className="h-4 bg-subtle-gray/60 rounded w-1/4 animate-pulse" />
      <div className="h-8 bg-subtle-gray/50 rounded-full w-16 animate-pulse" />
    </div>
  </div>
);

export default function ShopPage() {
  const router = useRouter();
  const { addToCart, toggleFavorite, favorites, cart } = useCart();

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/product/${slug}`);
  };
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(2000);

  // Categories & Brands lists
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const res = await getProductsAction();
      if (res.success && res.products) {
        setProducts(res.products);
        setFilteredProducts(res.products);

        // Extract categories and brands list dynamically
        const uniqueCategories = ['All', ...Array.from(new Set(res.products.map((p) => p.category)))];
        const uniqueBrands = ['All', ...Array.from(new Set(res.products.map((p) => p.brand)))];
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      }
      // Add a slight artificial delay for loading skeleton feel
      setTimeout(() => setLoading(false), 500);
    }
    loadProducts();
  }, []);

  // Filter application pipeline
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Price filter
    result = result.filter((p) => parseFloat(p.salePrice || p.price) <= priceRange);

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => parseFloat(a.salePrice || a.price) - parseFloat(b.salePrice || b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => parseFloat(b.salePrice || b.price) - parseFloat(a.salePrice || a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [search, selectedCategory, selectedBrand, sortBy, priceRange, products]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-[1600px] w-full mx-auto px-6 md:px-12">
        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-subtle-gray/40 pb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Curated Shelf</p>
            <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">Daily Essentials</h1>
          </div>
          <span className="text-xs font-medium text-gray-400 px-3.5 py-1.5 bg-white border border-subtle-gray/60 rounded-full w-max shadow-2xs">
            Showing <strong className="text-charcoal">{filteredProducts.length}</strong> items
          </span>
        </div>

        {/* Quick Department Filter Pills */}
        <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar pb-6 mb-8 border-b border-subtle-gray/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 flex-shrink-0">Quick Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4.5 py-2 rounded-full cursor-pointer transition-all border duration-200 flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-accent-green border-accent-green text-white shadow-xs'
                  : 'bg-white border-subtle-gray/60 text-gray-600 hover:border-charcoal/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Filters Sidebar (Left Column) */}
          <div className="lg:col-span-3 space-y-8 bg-white border border-subtle-gray/50 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-subtle-gray/50 pb-4">
              <h2 className="text-xs font-bold tracking-widest text-charcoal uppercase flex items-center space-x-2">
                <SlidersHorizontal size={14} className="text-accent-green" />
                <span>Filter Engine</span>
              </h2>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setPriceRange(2000);
                  setSortBy('featured');
                }}
                className="text-[10px] font-semibold text-gray-400 hover:text-charcoal cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Search */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Search keywords</label>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hass, bread, tomatoes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-warm-white border border-subtle-gray/60 rounded-xl py-2.5 pl-9 pr-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Department</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs transition-colors duration-200 cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-accent-green/10 text-accent-green font-semibold' 
                        : 'text-gray-500 hover:bg-subtle-gray/30'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check size={12} className="text-accent-green" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Dropdown */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Brand Sourced</label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-warm-white border border-subtle-gray/60 rounded-xl py-2.5 px-3.5 text-xs text-charcoal outline-none focus:border-charcoal cursor-pointer appearance-none"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Price Slider */}
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                <span>Maximum Price</span>
                <span className="text-charcoal font-bold text-xs bg-warm-white border border-subtle-gray/60 px-2 py-0.5 rounded-full">
                  INR {priceRange}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-1 bg-subtle-gray rounded-lg appearance-none cursor-pointer accent-accent-green"
              />
            </div>
          </div>

          {/* Products Grid Column (Right Column) */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Grid Header Controls */}
            <div className="flex justify-between items-center bg-white border border-subtle-gray/50 rounded-2xl px-6 py-4 shadow-xs text-xs text-gray-500">
              <p>Show results: <strong className="text-charcoal font-semibold">{filteredProducts.length} items</strong></p>
              <div className="flex items-center space-x-2">
                <ArrowUpDown size={13} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-charcoal font-semibold border-0 focus:ring-0 cursor-pointer outline-none text-xs"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Alphabetical: A to Z</option>
                </select>
              </div>
            </div>

            {/* Image Grid with Animation */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4].map((n) => (
                  <SkeletonCard key={n} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center text-gray-400 font-light border border-dashed border-subtle-gray/80 rounded-3xl bg-white space-y-4"
              >
                <div className="w-12 h-12 bg-subtle-gray/30 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">No products match your filter</h3>
                  <p className="text-xs text-gray-400 font-light mt-1">Try resetting search keywords or price brackets.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p) => {
                    const isFavorite = favorites.includes(p.id);
                    const displayPrice = p.salePrice || p.price;
                    const hasDiscount = p.salePrice !== null;
                    const isAdded = cart.some(item => item.product.id === p.id);
                    
                    return (
                      <motion.div 
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => handleCardClick(e, p.slug)}
                        className="group flex flex-col h-full bg-white border border-subtle-gray/40 rounded-3xl p-4 hover:border-accent-green/20 hover:shadow-lg transition-all duration-300 relative cursor-pointer"
                      >
                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p.id);
                          }}
                          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs border border-subtle-gray/50 hover:shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer ${
                            isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Heart size={14} strokeWidth={2.5} />
                        </button>

                        {/* Image aspect-ratio holder */}
                        <div className="relative bg-warm-white/40 rounded-2xl aspect-[3/4] overflow-hidden mb-5 p-6 flex items-center justify-center border border-subtle-gray/20 group-hover:bg-warm-white/20 transition-colors">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
                          />

                          {hasDiscount && (
                            <span className="absolute top-3 left-3 bg-accent-green/10 border border-accent-green/20 text-accent-green text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                              Sale
                            </span>
                          )}
                          {p.stock <= 10 && p.stock > 0 && (
                            <span className="absolute top-3 left-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                              Low Stock
                            </span>
                          )}
                        </div>

                        {/* Product text details */}
                        <div className="flex-grow flex flex-col px-1">
                          <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">{p.brand}</p>
                          <h3 className="text-sm font-semibold text-charcoal mb-2 leading-snug hover:text-accent-green transition-colors line-clamp-2">
                            <Link href={`/product/${p.slug}`}>
                              {p.name}
                            </Link>
                          </h3>

                          {/* Star Ratings */}
                          <div className="flex items-center space-x-1 mb-4">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-charcoal">4.0</span>
                            <span className="text-[10px] text-gray-400 font-light">(124 reviews)</span>
                          </div>
                          
                          {/* Price & Add button footer */}
                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-subtle-gray/30">
                            <div>
                              <span className="text-sm font-bold text-charcoal">INR {displayPrice}</span>
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-400 line-through ml-2">INR {p.price}</span>
                              )}
                            </div>
                            
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
