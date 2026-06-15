'use client';

import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-warm-white py-20 border-t border-subtle-gray">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-semibold tracking-widest text-charcoal mb-6">OCEON</h2>
          <p className="text-gray-500 font-light max-w-sm mb-8 leading-relaxed">
            Redefining the standard for daily essentials. Premium quality, lowest prices, delivered flawlessly.
          </p>
          <div className="flex space-x-4">
             {/* Social items */}
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-full bg-white border border-subtle-gray flex items-center justify-center text-charcoal hover:bg-ocean-blue hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-sm bg-current opacity-80"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-charcoal mb-6">Shop</h4>
          <ul className="space-y-4 text-gray-500 font-light">
            {['Fresh Produce', 'Meat & Seafood', 'Artisan Dairy', 'Pantry', 'Household'].map((item) => (
              <li key={item}>
                <a href="#shop" className="hover:text-charcoal transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-charcoal mb-6">Company</h4>
          <ul className="space-y-4 text-gray-500 font-light">
            {['About Us', 'Our Standards', 'Careers', 'Press', 'Investors'].map((item) => (
              <li key={item}>
                <a href="#our-standards" className="hover:text-charcoal transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-charcoal mb-6">Support</h4>
          <ul className="space-y-4 text-gray-500 font-light">
            {['Help Center', 'Delivery Areas', 'Returns', 'Contact Us', 'WhatsApp Ordering'].map((item) => (
              <li key={item}>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hover:text-charcoal transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-subtle-gray flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-light">
        <p>© 2026 OCEON Technologies Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-charcoal transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-charcoal transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
