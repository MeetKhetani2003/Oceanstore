'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer = () => {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();

  const FREE_SHIPPING_THRESHOLD = 500;
  const deliveryProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const neededForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-warm-white shadow-2xl flex flex-col border-l border-subtle-gray/40"
          >
            {/* Header */}
            <div className="p-6 border-b border-subtle-gray/60 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
                  <ShoppingBag size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-charcoal">Your Cart</h2>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">
                    {cart.length === 0 ? 'Empty shelf' : `${cart.reduce((sum, item) => sum + item.quantity, 0)} items added`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-subtle-gray/50 rounded-full transition-colors duration-200 cursor-pointer"
              >
                <X size={18} className="text-charcoal" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            {cart.length > 0 && (
              <div className="bg-white px-6 py-4 border-b border-subtle-gray/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-charcoal">
                    {neededForFreeShipping > 0 ? (
                      <>
                        <Truck size={14} className="text-accent-green animate-pulse" />
                        <span>Add <strong className="text-accent-green">INR {neededForFreeShipping.toFixed(0)}</strong> more for <strong>FREE delivery</strong></span>
                      </>
                    ) : (
                      <>
                        <Gift size={14} className="text-accent-green animate-bounce" />
                        <span className="text-accent-green font-semibold">You qualified for FREE delivery! 📦</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {Math.round(deliveryProgress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-subtle-gray rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${deliveryProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-accent-green rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-warm-white/30">
              <AnimatePresence initial={false}>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-20"
                  >
                    <div className="w-16 h-16 bg-subtle-gray/40 rounded-2xl flex items-center justify-center mb-5 text-gray-400">
                      <ShoppingBag size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-charcoal mb-1">Your cart is empty</h3>
                    <p className="text-gray-400 text-xs max-w-[240px] font-light leading-relaxed">
                      Add fresh produce, dairy, or bakery items to get started with your daily essentials order.
                    </p>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                      className="bg-white border border-subtle-gray/40 rounded-2xl p-4 flex space-x-4 shadow-xs hover:border-charcoal/10 transition-colors"
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-warm-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-subtle-gray/30 p-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-semibold text-charcoal leading-snug">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5">
                              {item.product.origin} • INR {item.product.price}/{item.product.unit}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Quantity Controls & Total */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-subtle-gray/30">
                          <div className="flex items-center border border-subtle-gray rounded-full bg-white scale-85 -ml-3 origin-left">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-subtle-gray rounded-full transition-colors cursor-pointer"
                            >
                              <Minus size={10} className="text-charcoal" />
                            </button>
                            <span className="w-6 text-center text-[11px] font-bold text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-subtle-gray rounded-full transition-colors cursor-pointer"
                            >
                              <Plus size={10} className="text-charcoal" />
                            </button>
                          </div>
                          <span className="text-xs font-bold text-charcoal">
                            INR {(parseFloat(item.product.price) * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-subtle-gray bg-white space-y-4">
                <div className="flex justify-between items-center text-charcoal">
                  <span className="text-xs font-light text-gray-400">Cart Subtotal</span>
                  <span className="text-base font-bold">INR {cartTotal.toFixed(0)}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                  Shipping fees and taxes computed dynamically at checkout. All order fulfillments verified via secure payments.
                </p>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-accent-green hover:bg-[#153b20] text-white py-4 rounded-full font-semibold text-xs transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <ShoppingBag size={14} />
                    <span>Proceed to Checkout</span>
                  </Link>

                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[10px] text-gray-400 hover:text-charcoal transition-colors duration-200 py-1.5 cursor-pointer font-medium"
                  >
                    Empty Entire Cart
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
