'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer = () => {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-warm-white shadow-2xl flex flex-col border-l border-subtle-gray"
          >
            {/* Header */}
            <div className="p-6 border-b border-subtle-gray flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag size={22} className="text-charcoal" />
                <h2 className="text-xl font-medium text-charcoal">Your Cart</h2>
                <span className="bg-subtle-gray text-charcoal text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 hover:bg-subtle-gray rounded-full transition-colors duration-200"
              >
                <X size={20} className="text-charcoal" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-subtle-gray/50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-lg font-medium text-charcoal mb-1">Your cart is empty</h3>
                  <p className="text-gray-400 text-sm max-w-[250px] font-light">
                    Add fresh items from our collections to start your order.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.product.id} 
                    className="flex space-x-4 border-b border-subtle-gray/50 pb-6 last:border-b-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-subtle-gray/30 p-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-charcoal leading-snug">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-light mt-0.5">
                            {item.product.origin} • ${item.product.price}/{item.product.unit}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Quantity Controls & Total */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-subtle-gray rounded-full p-1 bg-white scale-90 -ml-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-subtle-gray rounded-full transition-colors duration-200"
                          >
                            <Minus size={12} className="text-charcoal" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-subtle-gray rounded-full transition-colors duration-200"
                          >
                            <Plus size={12} className="text-charcoal" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-charcoal">
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-subtle-gray bg-white space-y-4">
                <div className="flex justify-between items-center text-charcoal">
                  <span className="text-sm font-light text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-gray-400 font-light">
                  Tax and delivery calculated at checkout. Orders will be finalized via WhatsApp message.
                </p>

                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-accent-green hover:bg-[#153b20] text-white py-4 rounded-full font-medium transition-colors duration-300 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <ShoppingBag size={18} />
                    <span>Proceed to Checkout</span>
                  </Link>

                  <button
                    onClick={clearCart}
                    className="w-full text-center text-xs text-gray-400 hover:text-charcoal transition-colors duration-200 py-1"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
