'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Download, 
  ChevronDown,
  ChevronUp,
  ArrowRight,
  LogOut,
  Phone,
  Calendar
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useCart();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'addresses'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch user order history
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();

    // Fetch user address profiles
    async function loadAddresses() {
      try {
        const res = await fetch('/api/profile/addresses');
        const data = await res.json();
        if (data.success && data.addresses) {
          setAddresses(data.addresses);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      }
    }
    loadAddresses();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/shop');
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);

  const handleOpenAddForm = () => {
    setNewAddress({
      name: user?.name || '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setAddressErrors({});
    setShowAddForm(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!newAddress.name.trim()) newErrors.name = 'Full name is required';
    if (!newAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!newAddress.city.trim()) newErrors.city = 'City is required';
    if (!newAddress.state.trim()) newErrors.state = 'State is required';
    if (!newAddress.zipCode.trim()) newErrors.zipCode = 'ZIP Code is required';
    
    if (Object.keys(newErrors).length > 0) {
      setAddressErrors(newErrors);
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch('/api/profile/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh address list
        const addrsRes = await fetch('/api/profile/addresses');
        const addrsData = await addrsRes.json();
        if (addrsData.success && addrsData.addresses) {
          setAddresses(addrsData.addresses);
        }
        setShowAddForm(false);
      } else {
        alert(data.error || 'Failed to save address');
      }
    } catch (err) {
      console.error('Save address error:', err);
    } finally {
      setSavingAddress(false);
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center font-sans">
        <p className="text-gray-400 font-light text-sm">Please log in to access your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-[1400px] w-full mx-auto px-6 md:px-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-subtle-gray/40 pb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Customer Account</p>
            <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">{user.name}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1 bg-white border border-subtle-gray/50 rounded-3xl p-4 shadow-xs">
            {[
              { id: 'orders', label: 'Order History', icon: ShoppingBag },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'info', label: 'Personal Details', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 text-xs font-semibold uppercase tracking-wider py-3.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer relative ${
                    isActive ? 'text-white font-bold' : 'text-gray-500 hover:bg-subtle-gray/30'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-bubble"
                      className="absolute inset-0 bg-accent-green rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Panels */}
          <div className="lg:col-span-9 bg-white border border-subtle-gray/50 rounded-3xl p-6 md:p-8 shadow-xs min-h-[400px]">
            
            {/* 1. ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-charcoal border-b border-subtle-gray/40 pb-4">Past Purchases</h2>
                
                {loadingOrders ? (
                  <p className="text-gray-400 text-xs font-light">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-light space-y-4">
                    <p className="text-xs">You haven&apos;t placed any orders yet.</p>
                    <Link href="/shop" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-accent-green hover:underline">
                      <span>Browse Store</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(o => {
                      const isExpanded = expandedOrderId === o._id;
                      return (
                        <div 
                          key={o._id} 
                          className="border border-subtle-gray/50 rounded-2xl overflow-hidden hover:border-charcoal/20 transition-all bg-white"
                        >
                          {/* Order Header Summary Row */}
                          <div 
                            onClick={() => toggleExpandOrder(o._id)}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-warm-white/10 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs font-bold text-charcoal">#${o._id.substring(0, 8).toUpperCase()}</span>
                                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${o.status === 'PAID' || o.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {o.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-light">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-xs font-bold text-charcoal">INR {parseFloat(o.total).toFixed(0)}</p>
                                <p className="text-[9px] text-gray-400 font-light">{o.items.length} unique items</p>
                              </div>
                              <div className="text-gray-400">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Items List Container */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="border-t border-subtle-gray/40 bg-warm-white/20 p-5 space-y-4"
                              >
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Items Purchased</p>
                                <div className="space-y-3">
                                  {o.items.map((item: any, idx: number) => {
                                    const prod = item.productId;
                                    if (!prod) return null;
                                    const image = prod.images?.[0] ? `/images/${prod.images[0]}.png` : '/images/avocado.png';
                                    return (
                                      <div key={idx} className="flex items-center justify-between text-xs bg-white border border-subtle-gray/30 p-2.5 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 bg-warm-white border border-subtle-gray/30 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                                            <img src={image} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-charcoal">{prod.name}</h4>
                                            <p className="text-[9px] text-gray-400 font-light">{prod.brand} • INR {prod.price}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-bold text-charcoal">INR {(parseFloat(prod.price) * item.quantity).toFixed(0)}</span>
                                          <p className="text-[9px] text-gray-400 font-light">Qty: {item.quantity}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Actions in Expanded details */}
                                <div className="pt-4 flex justify-end gap-3 border-t border-subtle-gray/40 mt-4">
                                  {o.invoiceFileId && (
                                    <a
                                      href={`/api/files/${o.invoiceFileId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-bold uppercase tracking-wider border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal py-2 px-4 rounded-full flex items-center space-x-1.5"
                                    >
                                      <Download size={12} />
                                      <span>Invoice PDF</span>
                                    </a>
                                  )}
                                  <Link
                                    href={`/checkout/success/${o._id}`}
                                    className="text-[10px] font-bold uppercase tracking-wider bg-accent-green hover:bg-[#153b20] text-white py-2 px-4.5 rounded-full flex items-center space-x-1"
                                  >
                                    <span>Receipt</span>
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-subtle-gray/40 pb-4">
                  <h2 className="text-base font-semibold text-charcoal">Your Addresses</h2>
                  {!showAddForm && (
                    <button
                      onClick={handleOpenAddForm}
                      className="text-[10px] font-bold uppercase tracking-widest bg-accent-green hover:bg-[#153b20] text-white py-2 px-4 rounded-full cursor-pointer transition-colors"
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                {showAddForm && (
                  <form onSubmit={handleSaveAddress} className="border border-subtle-gray/50 rounded-2xl p-6 bg-warm-white/10 space-y-4 max-w-xl">
                    <h3 className="text-xs font-bold text-charcoal uppercase tracking-widest mb-2">New Delivery Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrName" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Receiver Full Name</label>
                        <input
                          type="text"
                          id="addrName"
                          name="name"
                          value={newAddress.name}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.name && <span className="text-[9px] text-red-500 font-semibold">{addressErrors.name}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrPhone" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp / Contact Phone</label>
                        <input
                          type="text"
                          id="addrPhone"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleAddressChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="addrStreet" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Street Address</label>
                      <input
                        type="text"
                        id="addrStreet"
                        name="street"
                        value={newAddress.street}
                        onChange={handleAddressChange}
                        placeholder="Flat/House No, Colony, Sector"
                        className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                      />
                      {addressErrors.street && <span className="text-[9px] text-red-500 font-semibold">{addressErrors.street}</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrCity" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">City</label>
                        <input
                          type="text"
                          id="addrCity"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.city && <span className="text-[9px] text-red-500 font-semibold">{addressErrors.city}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrState" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">State</label>
                        <input
                          type="text"
                          id="addrState"
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.state && <span className="text-[9px] text-red-500 font-semibold">{addressErrors.state}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrZip" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ZIP Code</label>
                        <input
                          type="text"
                          id="addrZip"
                          name="zipCode"
                          value={newAddress.zipCode}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray/60 rounded-lg p-2.5 text-xs text-charcoal outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.zipCode && <span className="text-[9px] text-red-500 font-semibold">{addressErrors.zipCode}</span>}
                      </div>
                    </div>
                    <div className="pt-4 flex space-x-3 justify-end text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal py-2 px-4 rounded-full transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="bg-accent-green hover:bg-[#153b20] text-white py-2 px-5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-gray-400 text-xs font-light leading-relaxed">No saved addresses found. Addresses are automatically saved on checkout or can be added using the button above.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="border border-subtle-gray/50 rounded-2xl p-5 relative bg-warm-white/20 hover:border-charcoal/20 transition-all flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-charcoal mb-1 flex items-center space-x-2 text-xs">
                            <MapPin size={13} className="text-accent-green" />
                            <span>Address {idx + 1}</span>
                            {addr.name && <span className="text-[10px] text-gray-400 font-light">• {addr.name}</span>}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed font-light mt-3">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                        </div>
                        {addr.phone && (
                          <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-4 pt-3 border-t border-subtle-gray/30">
                            <Phone size={10} />
                            <span>{addr.phone}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PERSONAL INFORMATION */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-charcoal border-b border-subtle-gray pb-4">Personal Details</h2>
                <div className="space-y-6 max-w-md">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</span>
                    <span className="text-charcoal font-semibold text-sm">{user.name}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                    <span className="text-charcoal font-semibold text-sm">{user.email}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Access Role</span>
                    <span className="text-charcoal text-[10px] font-bold tracking-widest uppercase bg-subtle-gray/60 px-3 py-1 rounded-full w-max mt-1">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
