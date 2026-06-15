'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsAction } from '@/features/products/actions';
import { useCart } from '@/context/CartContext';
import { Search, Heart, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ShopPage() {
  const { addToCart, toggleFavorite, favorites } = useCart();
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
      setLoading(false);
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
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Curated Catalogue</p>
          <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">Daily Essentials</h1>
        </div>

        {/* Toolbar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Filters Sidebar (Left Column) */}
          <div className="lg:col-span-3 space-y-8 bg-white border border-subtle-gray rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wider text-charcoal uppercase mb-4 flex items-center space-x-2">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </h2>

            {/* Search */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Search Products</label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Avocado, Oil, bread..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-warm-white border border-subtle-gray rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-charcoal transition-colors"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Department</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${selectedCategory === cat ? 'bg-ocean-blue text-white font-medium' : 'text-gray-600 hover:bg-subtle-gray/40'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Select */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-warm-white border border-subtle-gray rounded-xl py-2.5 px-3 text-xs outline-none focus:border-charcoal cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                <span>Max Price</span>
                <span className="text-charcoal font-bold">INR {priceRange}</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-accent-green cursor-pointer"
              />
            </div>
          </div>

          {/* Products Grid Column (Right Column) */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Grid Header Controls */}
            <div className="flex justify-between items-center bg-white border border-subtle-gray rounded-2xl p-4 shadow-sm text-xs text-gray-500">
              <p>Showing <span className="font-semibold text-charcoal">{filteredProducts.length}</span> products</p>
              <div className="flex items-center space-x-2">
                <ArrowUpDown size={14} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-charcoal font-medium border-0 focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Image Grid */}
            {loading ? (
              <div className="py-24 text-center text-gray-400 font-light">
                Loading catalogue...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center text-gray-400 font-light border border-dashed border-subtle-gray rounded-2xl bg-white">
                No products match the selected criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((p) => {
                  const isFavorite = favorites.includes(p.id);
                  const displayPrice = p.salePrice || p.price;
                  const hasDiscount = p.salePrice !== null;
                  
                  return (
                    <div key={p.id} className="group cursor-pointer flex flex-col h-full">
                      <div className="relative bg-white rounded-2xl aspect-[4/5] overflow-hidden mb-6 p-8 flex items-center justify-center border border-subtle-gray shadow-sm hover:shadow-md transition-all duration-300">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain mix-blend-multiply transform transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p.id);
                          }}
                          className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-subtle-gray hover:shadow-md transition-all duration-300 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        >
                          <Heart size={16} strokeWidth={2} />
                        </button>

                        {hasDiscount && (
                          <span className="absolute top-4 left-4 bg-accent-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="flex-grow flex flex-col px-1">
                        <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1.5">{p.brand}</p>
                        <h3 className="text-base font-medium text-charcoal mb-1.5 leading-snug hover:text-accent-green transition-colors">
                          <Link href={`/product/${p.slug}`}>
                            {p.name}
                          </Link>
                        </h3>
                        
                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-subtle-gray/30">
                          <div>
                            <span className="text-base font-semibold text-charcoal">INR {displayPrice}</span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through ml-2">INR {p.price}</span>
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
                            className="text-xs font-semibold uppercase tracking-wider text-accent-green border border-accent-green/30 hover:bg-accent-green hover:text-white px-3 py-1.5 rounded-full transition-colors duration-300"
                          >
                            Add +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
