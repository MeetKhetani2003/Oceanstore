'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  ShieldCheck,
  Sunrise,
  Sun,
  Sunset,
  Trash2
} from 'lucide-react';

const DELIVERY_WINDOWS = [
  { id: 'Morning (8:00 AM - 12:00 PM)', label: 'Morning', time: '8 AM - 12 PM', icon: Sunrise },
  { id: 'Afternoon (12:00 PM - 4:00 PM)', label: 'Afternoon', time: '12 PM - 4 PM', icon: Sun },
  { id: 'Evening (4:00 PM - 8:00 PM)', label: 'Evening', time: '4 PM - 8 PM', icon: Sunset },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart, user } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    deliveryWindow: 'Morning (8:00 AM - 12:00 PM)',
    notes: '',
    couponCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Hydrate form values with user profile details
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Load Razorpay SDK Script on Mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const shippingFee = cartTotal > 500 ? 0 : 40;
  const tax = cartTotal * 0.05;
  const grandTotal = cartTotal + shippingFee + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP Code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (cart.length === 0) return;
    
    setLoading(true);
    setGeneralError('');

    try {
      // 1. Hit stock reservation & Razorpay order creation endpoint
      const reserveRes = await fetch('/api/checkout/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          shippingAddress: {
            name: formData.name,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            phone: formData.phone
          },
          deliveryWindow: formData.deliveryWindow,
          couponCode: formData.couponCode || undefined,
        })
      });

      const reserveData = await reserveRes.json();

      if (!reserveRes.ok || !reserveData.success) {
        throw new Error(reserveData.error || 'Inventory lock or payment prep failed');
      }

      // 2. Open Razorpay Checkout Window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkeyid',
        amount: reserveData.amount,
        currency: reserveData.currency,
        name: 'OCEON Store',
        description: 'Premium Daily Essentials Checkout',
        order_id: reserveData.razorpayOrderId,
        handler: async function (response: any) {
          // Cryptographic verified success callback
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: reserveData.orderId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              router.push(`/checkout/success/${reserveData.orderId}`);
            } else {
              router.push(`/checkout/failed?orderId=${reserveData.orderId}`);
            }
          } catch (err) {
            router.push(`/checkout/failed?orderId=${reserveData.orderId}`);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#1E4D2B', // Matches --color-accent-green
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function () {
        router.push(`/checkout/failed?orderId=${reserveData.orderId}`);
      });
      
      rzp.open();
    } catch (err: any) {
      setGeneralError(err.message || 'An unexpected checkout failure occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white text-charcoal pb-24 font-sans">
      {/* Header */}
      <header className="border-b border-subtle-gray/60 bg-white/80 backdrop-blur-md sticky top-0 z-30 py-5">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/shop" className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-charcoal/70 hover:text-charcoal transition-colors">
            <ArrowLeft size={14} />
            <span>Return to Shop</span>
          </Link>
          <span className="text-xl font-bold tracking-widest text-charcoal">OCEON</span>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Cart Settlement</p>
          <h1 className="editorial-font text-5xl text-charcoal">Checkout</h1>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl p-4 mb-8 font-medium">
            {generalError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Delivery Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-subtle-gray/50 shadow-xs space-y-8">
            <div>
              <h2 className="text-base font-semibold mb-2 flex items-center space-x-3 text-charcoal">
                <MapPin size={16} className="text-accent-green" />
                <span>Shipping Address</span>
              </h2>
              <p className="text-xs text-gray-400 font-light">Fill out your shipping information. All fields are required.</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full name input */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="name" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className={`w-full bg-warm-white border ${errors.name ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 pl-10.5 pr-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                </div>

                {/* WhatsApp Contact Input */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    WhatsApp Phone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className={`w-full bg-warm-white border ${errors.phone ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 pl-10.5 pr-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                </div>
              </div>

              {/* Email Address input */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane.doe@example.com"
                    className={`w-full bg-warm-white border ${errors.email ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 pl-10.5 pr-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
              </div>

              {/* Street Address textarea */}
              <div className="flex flex-col space-y-2">
                <label htmlFor="street" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Flat/House No, Colony, Sector"
                    rows={2}
                    className={`w-full bg-warm-white border ${errors.street ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3.5 pl-10.5 pr-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all resize-none`}
                  />
                </div>
                {errors.street && <p className="text-[10px] text-red-500 font-medium">{errors.street}</p>}
              </div>

              {/* City, State, Zip grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="city" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New Delhi"
                    className={`w-full bg-warm-white border ${errors.city ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 px-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                  />
                  {errors.city && <p className="text-[10px] text-red-500 font-medium">{errors.city}</p>}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="state" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Delhi"
                    className={`w-full bg-warm-white border ${errors.state ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 px-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                  />
                  {errors.state && <p className="text-[10px] text-red-500 font-medium">{errors.state}</p>}
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="zipCode" className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="110001"
                    className={`w-full bg-warm-white border ${errors.zipCode ? 'border-red-500' : 'border-subtle-gray/60'} rounded-xl py-3 px-4 text-xs text-charcoal outline-none focus:border-charcoal focus:bg-white transition-all`}
                  />
                  {errors.zipCode && <p className="text-[10px] text-red-500 font-medium">{errors.zipCode}</p>}
                </div>
              </div>

              {/* Delivery Window (Selectable visual cards instead of a native select) */}
              <div className="flex flex-col space-y-3 pt-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Preferred Delivery Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DELIVERY_WINDOWS.map((slot) => {
                    const SlotIcon = slot.icon;
                    const isSelected = formData.deliveryWindow === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryWindow: slot.id }))}
                        className={`border-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-accent-green bg-accent-green/5 text-accent-green font-semibold shadow-xs' 
                            : 'border-subtle-gray/60 hover:border-charcoal/20 bg-white text-gray-500'
                        }`}
                      >
                        <SlotIcon size={18} className={isSelected ? 'text-accent-green' : 'text-gray-400'} />
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-2.5">{slot.label}</span>
                        <span className="text-[11px] font-light mt-0.5">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Receipt Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-subtle-gray/50 shadow-xs flex flex-col relative overflow-hidden">
              {/* Receipt styling detail */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent-green" />
              
              <h2 className="text-base font-semibold mb-6 flex items-center space-x-3 text-charcoal pb-4 border-b border-subtle-gray/40">
                <ShoppingBag size={16} className="text-accent-green" />
                <span>Order Summary</span>
              </h2>

              {/* Cart items list */}
              <div className="divide-y divide-subtle-gray/50 max-h-[350px] overflow-y-auto no-scrollbar pr-1 mb-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-light">
                    Your cart is empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex space-x-4 pt-4 first:pt-0">
                      <div className="w-14 h-14 bg-warm-white border border-subtle-gray/30 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <h4 className="text-xs font-semibold text-charcoal leading-snug pr-2">{item.product.name}</h4>
                          <span className="text-xs font-bold text-charcoal">
                            INR {(parseFloat(item.product.price) * item.quantity).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[10px] text-gray-400 font-light">Qty: {item.quantity}</p>
                          <div className="flex items-center border border-subtle-gray rounded-full bg-white scale-80 -mr-4 origin-right">
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-subtle-gray/50 pt-6 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Subtotal</span>
                  <span className="font-semibold text-charcoal">INR {cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Delivery Fee</span>
                  <span className="font-semibold text-charcoal">
                    {shippingFee === 0 ? <span className="text-accent-green font-bold uppercase tracking-wider text-[10px]">Free</span> : `INR ${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-light">Est. GST (5%)</span>
                  <span className="font-semibold text-charcoal">INR {tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-subtle-gray/50 pt-4 text-charcoal">
                  <span className="font-semibold text-xs uppercase tracking-widest text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-gradient">INR {grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  className={`w-full bg-accent-green hover:bg-[#153b20] text-white py-4 rounded-full font-semibold text-xs uppercase tracking-widest transition-colors duration-300 flex items-center justify-center space-x-2 shadow-xs cursor-pointer ${cart.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CreditCard size={14} />
                  <span>{loading ? 'Securing Order...' : 'Pay with Razorpay'}</span>
                </button>

                <div className="flex items-start space-x-2.5 text-[10px] text-gray-400 bg-warm-white border border-subtle-gray/40 p-3.5 rounded-2xl">
                  <ShieldCheck size={14} className="text-accent-green flex-shrink-0 mt-0.5" />
                  <span>15 minutes inventory lock holds automatically during checkout. Unpaid stock returns to shelf.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
