'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Share2, PlayCircle, Mail, MapPin, Phone } from 'lucide-react';

const LINKS = {
  Shop: ['Fresh Produce', 'Artisan Dairy', 'Pantry & Bakery', 'Meat & Seafood', 'Household'],
  Company: ['About OCEON', 'Our Standards', 'Careers', 'Press Room', 'Investors'],
  Support: ['Help Center', 'Delivery Areas', 'Returns Policy', 'Track Your Order', 'Contact Us'],
};

export const Footer = () => {
  return (
    <footer className="bg-charcoal text-white">
      {/* Main footer */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold tracking-widest mb-5">OCEON</h2>
            <p className="text-white/50 font-light max-w-xs mb-8 leading-relaxed text-sm">
              Redefining daily essentials — premium grocery delivered in 15 minutes with zero compromise on quality or price.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Phone, text: '+91 92059 68389' },
                { icon: Mail, text: 'globe@oceon.in' },
                { icon: MapPin, text: 'New Delhi, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center space-x-3 text-white/50 text-sm">
                  <Icon size={14} className="flex-shrink-0 text-white/30" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex space-x-3">
              {[
                { icon: Share2, label: 'Instagram', href: '#' },
                { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/919205968389' },
                { icon: PlayCircle, label: 'YouTube', href: '#' },
                { icon: Mail, label: 'Email', href: 'mailto:globe@oceon.in' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-6 tracking-wide">{category}</h4>
              <ul className="space-y-3.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="/shop"
                      className="text-white/45 hover:text-white text-sm font-light transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-white mb-6 tracking-wide">Stay Updated</h4>
            <p className="text-white/45 text-sm font-light mb-5 leading-relaxed">
              Get weekly deals, fresh arrivals, and seasonal picks straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-accent-green hover:bg-[#153b20] text-white py-3 rounded-xl text-sm font-semibold transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/30">
          <p>© 2026 OCEON Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
