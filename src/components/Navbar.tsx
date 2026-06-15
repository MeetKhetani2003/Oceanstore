'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  User, 
  ShoppingCart, 
  MessageCircle, 
  Menu, 
  X 
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const { cartCount, setIsCartOpen, user, logout, openAuthModal } = useCart();

  useEffect(() => {
    // Detect if we're on the homepage
    setIsHomepage(window.location.pathname === '/');

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transparent with white text only on homepage hero (not scrolled)
  const isTransparentHero = isHomepage && !isScrolled;

  return (
    <>
      <header className={`fixed top-0 w-full z-40 transition-all duration-500 ${
        isTransparentHero 
          ? 'bg-transparent py-6' 
          : 'bg-white/95 backdrop-blur-md border-b border-subtle-gray py-4 shadow-sm'
      }`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex-1">
            <Link href="/" className={`text-2xl font-semibold tracking-widest transition-colors duration-300 ${isTransparentHero ? 'text-white' : 'text-charcoal'}`}>
              OCEON
            </Link>
          </div>

          {/* Desktop Links - Minimal */}
          <nav className="hidden md:flex space-x-10 flex-1 justify-center">
            {['Shop', 'Discover', 'Our Standards'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className={`text-sm font-medium tracking-wide transition-colors duration-300 ${isTransparentHero ? 'text-white/80 hover:text-white' : 'text-charcoal/70 hover:text-charcoal'}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Icons & Actions */}
          <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
            <a 
              href="https://wa.me/919205968389" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 ${isTransparentHero ? 'text-white/80 hover:text-white' : 'text-charcoal/70 hover:text-charcoal'}`}
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </a>
            <div className={`w-px h-4 transition-colors duration-300 ${isTransparentHero ? 'bg-white/20' : 'bg-subtle-gray'}`}></div>
            
            <button className={`transition-colors duration-300 ${isTransparentHero ? 'text-white hover:text-white/70' : 'text-charcoal hover:text-ocean-blue'}`}>
              <Search size={20} strokeWidth={1.5} />
            </button>
            
            <button className={`transition-colors duration-300 ${isTransparentHero ? 'text-white hover:text-white/70' : 'text-charcoal hover:text-ocean-blue'}`}>
              <Heart size={20} strokeWidth={1.5} />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className={`transition-colors duration-300 ${isTransparentHero ? 'text-white hover:text-white/70' : 'text-charcoal hover:text-ocean-blue'}`}>
                  <User size={20} strokeWidth={1.5} />
                </Link>
                <button 
                  onClick={logout}
                  className={`text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${isTransparentHero ? 'border-white text-white hover:bg-white hover:text-charcoal' : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => openAuthModal()}
                className={`text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer ${isTransparentHero ? 'border-white text-white hover:bg-white hover:text-charcoal' : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'}`}
              >
                Sign In
              </button>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative transition-colors duration-300 ${isTransparentHero ? 'text-white hover:text-white/70' : 'text-charcoal hover:text-ocean-blue'}`}
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-semibold scale-90 border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className={`md:hidden p-1 ${isTransparentHero ? 'text-white' : 'text-charcoal'}`} 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-55 bg-warm-white flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-subtle-gray">
              <span className="text-2xl font-semibold tracking-widest text-charcoal">OCEON</span>
              <button className="p-1 text-charcoal" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col p-8 space-y-8 text-2xl font-light editorial-font">
              {['Shop All', 'Fresh Produce', 'Dairy & Eggs', 'Pantry', 'Our Standards', 'Account'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-charcoal hover:opacity-75 transition-opacity"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
