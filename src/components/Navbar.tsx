'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  User, 
  ShoppingCart, 
  MessageCircle, 
  Menu, 
  X,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getProductsAction } from '@/features/products/actions';

export const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  
  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { cartCount, setIsCartOpen, user, logout, openAuthModal, addToCart } = useCart();

  useEffect(() => {
    setIsHomepage(window.location.pathname === '/');
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch search products on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      const loadSearchData = async () => {
        if (products.length === 0) {
          const res = await getProductsAction();
          if (res.success && res.products) {
            setProducts(res.products);
          }
        }
      };
      loadSearchData();
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery, products]);

  // Transparent header behavior only on homepage hero scroll top
  const isTransparentHero = isHomepage && !isScrolled;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className={`fixed top-0 w-full z-40 transition-all duration-500 ${
        isTransparentHero 
          ? 'bg-transparent py-6' 
          : 'bg-white/70 backdrop-blur-xl border-b border-subtle-gray/30 py-3.5 shadow-[0_2px_15px_-3px_rgba(10,25,47,0.03)]'
      }`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-grow md:flex-1">
            <Link 
              href="/" 
              className={`text-2xl font-bold tracking-widest transition-all duration-300 hover:opacity-85 ${
                isTransparentHero ? 'text-white' : 'text-charcoal'
              }`}
            >
              OCEON
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 items-center flex-1 justify-center">
            {[
              { label: 'Shop Catalog', path: '/shop' },
              { label: 'Discover', path: '/#discover' },
              { label: 'Standards', path: '/#our-standards' }
            ].map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.label}
                  href={item.path} 
                  className={`relative px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                    isTransparentHero 
                      ? 'text-white/80 hover:text-white hover:bg-white/10' 
                      : active
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && !isTransparentHero && (
                    <motion.span 
                      layoutId="nav-dot"
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent-green rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Icons & Actions */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-3">
            {/* WhatsApp Link */}
            <a 
              href="https://wa.me/919205968389" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase px-3.5 py-2 rounded-xl transition-all duration-300 ${
                isTransparentHero 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-charcoal/70 hover:text-accent-green hover:bg-accent-green/5'
              }`}
            >
              <MessageCircle size={14} className="text-green-600" />
              <span>WhatsApp</span>
            </a>

            <div className={`w-px h-4 transition-colors duration-300 ${isTransparentHero ? 'bg-white/20' : 'bg-subtle-gray/60'}`} />
            
            {/* Search Bubble */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isTransparentHero 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-charcoal/80 hover:text-accent-green hover:bg-accent-green/5'
              }`}
              title="Search Catalog"
            >
              <Search size={16} strokeWidth={2.5} />
            </button>
            
            {/* Wishlist Link */}
            <Link 
              href="/wishlist" 
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isTransparentHero 
                  ? 'text-white hover:bg-white/10' 
                  : isActive('/wishlist')
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'text-charcoal/80 hover:text-accent-green hover:bg-accent-green/5'
              }`}
              title="Favorites"
            >
              <Heart size={16} strokeWidth={2.5} className={isActive('/wishlist') ? 'fill-accent-green' : ''} />
            </Link>
            
            {/* User Details / Signin */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isTransparentHero 
                      ? 'text-white hover:bg-white/10' 
                      : isActive('/profile')
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'text-charcoal/80 hover:text-accent-green hover:bg-accent-green/5'
                  }`}
                  title="Profile Account"
                >
                  <User size={16} strokeWidth={2.5} />
                </Link>
                <button 
                  onClick={logout}
                  className={`text-[9px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isTransparentHero 
                      ? 'border-white text-white hover:bg-white hover:text-charcoal' 
                      : 'border-subtle-gray/80 text-charcoal/80 hover:border-charcoal hover:bg-charcoal hover:text-white'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className={`text-[9px] font-bold tracking-widest uppercase px-4.5 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isTransparentHero 
                    ? 'border-white text-white hover:bg-white hover:text-charcoal' 
                    : 'border-charcoal bg-charcoal text-white hover:bg-accent-green hover:border-accent-green'
                }`}
              >
                Sign In
              </button>
            )}
            
            {/* Cart Icon Bubble */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isTransparentHero 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-charcoal/80 hover:text-accent-green hover:bg-accent-green/5'
              }`}
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-accent-green text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={`p-2.5 rounded-full cursor-pointer ${
                isTransparentHero ? 'text-white hover:bg-white/10' : 'text-charcoal hover:bg-charcoal/5'
              }`}
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2.5 rounded-full cursor-pointer ${
                isTransparentHero ? 'text-white hover:bg-white/10' : 'text-charcoal hover:bg-charcoal/5'
              }`}
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-green text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className={`p-2.5 rounded-full cursor-pointer ${
                isTransparentHero ? 'text-white hover:bg-white/10' : 'text-charcoal hover:bg-charcoal/5'
              }`} 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs"
            />

            {/* Slide Down Search Panel */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-subtle-gray/50 p-6 md:p-10 shadow-lg"
            >
              <div className="max-w-[1200px] mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 w-full max-w-2xl bg-warm-white border border-subtle-gray/60 rounded-2xl px-4.5 py-3">
                    <Search size={16} className="text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for avocados, sourdough loaves, heirlooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-charcoal outline-none border-0 placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-charcoal cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-6 p-2.5 bg-warm-white border border-subtle-gray/60 hover:bg-subtle-gray/40 rounded-full transition-colors cursor-pointer text-charcoal"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Suggestions list */}
                <div>
                  {searchQuery.trim() === '' ? (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Type above to search our organic fresh grocery catalogue...
                    </p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      No matching products found on shelves. Try &quot;avocado&quot; or &quot;bread&quot;.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Matching Products ({searchResults.length})</p>
                      {searchResults.map((p) => {
                        const displayPrice = p.salePrice || p.price;
                        return (
                          <div 
                            key={p.id}
                            className="flex items-center justify-between border border-subtle-gray/30 rounded-xl p-3 bg-white hover:border-charcoal/10 transition-colors"
                          >
                            <Link 
                              href={`/product/${p.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center space-x-4 flex-1 cursor-pointer"
                            >
                              <div className="w-11 h-11 bg-warm-white rounded-lg p-1.5 border border-subtle-gray/20 flex items-center justify-center flex-shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-charcoal leading-none mb-1">{p.name}</h4>
                                <p className="text-[9px] text-gray-400 font-light uppercase tracking-wider">{p.brand} • {p.category}</p>
                              </div>
                            </Link>

                            <div className="flex items-center space-x-5">
                              <span className="text-xs font-bold text-charcoal">INR {displayPrice}</span>
                              <button
                                onClick={() => {
                                  addToCart({
                                    id: p.id,
                                    name: p.name,
                                    origin: p.brand,
                                    price: displayPrice,
                                    unit: 'pcs',
                                    image: p.image
                                  });
                                  setIsSearchOpen(false);
                                }}
                                className="bg-accent-green hover:bg-[#153b20] text-white p-2 rounded-full transition-colors cursor-pointer"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu (Glassmorphism Slide Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Mobile menu backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs"
            />

            {/* Mobile menu drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 z-55 w-full max-w-sm bg-white/95 backdrop-blur-xl border-l border-subtle-gray/30 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-subtle-gray/30 bg-white">
                <span className="text-xl font-bold tracking-widest text-charcoal">OCEON</span>
                <button 
                  className="p-2 hover:bg-subtle-gray/50 rounded-full text-charcoal cursor-pointer transition-colors" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile menu links */}
              <div className="flex-grow flex flex-col p-8 space-y-5">
                {[
                  { label: 'Shop All Products', path: '/shop' },
                  { label: 'Discover Collection', path: '/#discover' },
                  { label: 'Our Standards', path: '/#our-standards' },
                  { label: 'Favorites Wishlist', path: '/wishlist' },
                  { label: 'My Profile Details', path: '/profile' }
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link 
                      href={item.path} 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 text-lg font-medium tracking-wide transition-colors ${
                        isActive(item.path) ? 'text-accent-green font-bold' : 'text-charcoal hover:text-accent-green'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile menu footer status */}
              <div className="p-6 border-t border-subtle-gray/30 bg-warm-white/20 text-center">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <p className="text-[10px] text-gray-400 font-light">Logged in as {user.name}</p>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="w-full text-[10px] font-bold tracking-widest uppercase border border-red-200 text-red-500 py-2.5 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                    className="w-full text-[10px] font-bold tracking-widest uppercase bg-charcoal text-white py-2.5 rounded-xl hover:bg-accent-green transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
