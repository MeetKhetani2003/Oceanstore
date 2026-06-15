'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Download, 
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  LogOut 
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
    router.push('/login');
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
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Customer Account</p>
            <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">{user.name}</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1 bg-white border border-subtle-gray rounded-2xl p-4 shadow-sm">
            {[
              { id: 'orders', label: 'Order History', icon: ShoppingBag },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
              { id: 'info', label: 'Personal Details', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'bg-ocean-blue text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-subtle-gray/40'}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Panels */}
          <div className="lg:col-span-9 bg-white border border-subtle-gray rounded-2xl p-8 shadow-sm min-h-[400px]">
            
            {/* 1. ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-charcoal border-b border-subtle-gray pb-4">Past Purchases</h2>
                
                {loadingOrders ? (
                  <p className="text-gray-400 text-sm font-light">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-light space-y-4">
                    <p>You haven&apos;t placed any orders yet.</p>
                    <Link href="/shop" className="inline-flex items-center space-x-2 text-xs font-semibold text-accent-green hover:underline">
                      <span>Browse Store</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(o => (
                      <div key={o._id} className="border border-subtle-gray rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-charcoal/30 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-semibold text-charcoal">#${o._id.substring(0, 8).toUpperCase()}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${o.status === 'PAID' || o.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                              {o.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-light">{new Date(o.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{o.items.length} items • INR {parseFloat(o.total).toFixed(2)}</p>
                        </div>

                        <div className="flex gap-4">
                          {o.invoiceFileId && (
                            <a
                              href={`/api/files/${o.invoiceFileId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal py-2.5 px-4 rounded-full flex items-center space-x-2"
                            >
                              <Download size={14} />
                              <span>Invoice</span>
                            </a>
                          )}
                          <Link
                            href={`/checkout/success/${o._id}`}
                            className="text-xs font-semibold bg-accent-green hover:bg-[#153b20] text-white py-2.5 px-4 rounded-full flex items-center space-x-2"
                          >
                            <span>Receipt</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-subtle-gray pb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Your Addresses</h2>
                  {!showAddForm && (
                    <button
                      onClick={handleOpenAddForm}
                      className="text-xs font-semibold bg-accent-green hover:bg-[#153b20] text-white py-2 px-4 rounded-full cursor-pointer transition-colors"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {showAddForm && (
                  <form onSubmit={handleSaveAddress} className="border border-subtle-gray rounded-2xl p-6 bg-warm-white/20 space-y-4 max-w-xl">
                    <h3 className="text-sm font-semibold text-charcoal mb-2">New Delivery Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrName" className="text-[10px] font-semibold text-gray-400 uppercase">Receiver Full Name</label>
                        <input
                          type="text"
                          id="addrName"
                          name="name"
                          value={newAddress.name}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.name && <span className="text-[10px] text-red-500 font-medium">{addressErrors.name}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrPhone" className="text-[10px] font-semibold text-gray-400 uppercase">WhatsApp / Contact Phone</label>
                        <input
                          type="text"
                          id="addrPhone"
                          name="phone"
                          value={newAddress.phone}
                          onChange={handleAddressChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="addrStreet" className="text-[10px] font-semibold text-gray-400 uppercase">Street Address</label>
                      <input
                        type="text"
                        id="addrStreet"
                        name="street"
                        value={newAddress.street}
                        onChange={handleAddressChange}
                        placeholder="Flat/House No, Colony, Sector"
                        className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                      />
                      {addressErrors.street && <span className="text-[10px] text-red-500 font-medium">{addressErrors.street}</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrCity" className="text-[10px] font-semibold text-gray-400 uppercase">City</label>
                        <input
                          type="text"
                          id="addrCity"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.city && <span className="text-[10px] text-red-500 font-medium">{addressErrors.city}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrState" className="text-[10px] font-semibold text-gray-400 uppercase">State</label>
                        <input
                          type="text"
                          id="addrState"
                          name="state"
                          value={newAddress.state}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.state && <span className="text-[10px] text-red-500 font-medium">{addressErrors.state}</span>}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label htmlFor="addrZip" className="text-[10px] font-semibold text-gray-400 uppercase">ZIP Code</label>
                        <input
                          type="text"
                          id="addrZip"
                          name="zipCode"
                          value={newAddress.zipCode}
                          onChange={handleAddressChange}
                          className="bg-white border border-subtle-gray rounded-lg p-2.5 text-xs outline-none focus:border-charcoal transition-colors"
                        />
                        {addressErrors.zipCode && <span className="text-[10px] text-red-500 font-medium">{addressErrors.zipCode}</span>}
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
                  <p className="text-gray-400 text-sm font-light">No saved addresses found. Addresses are automatically saved on checkout or can be added using the button above.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="border border-subtle-gray rounded-2xl p-5 relative bg-warm-white/40 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-charcoal mb-1 flex items-center space-x-2 text-sm">
                            <MapPin size={14} className="text-accent-green" />
                            <span>Address {idx + 1}</span>
                            {addr.name && <span className="text-xs text-gray-400 font-light">• {addr.name}</span>}
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed font-light mt-2">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                        </div>
                        {addr.phone && (
                          <p className="text-[10px] text-gray-400 font-light mt-3">Phone: {addr.phone}</p>
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
                <h2 className="text-lg font-semibold text-charcoal border-b border-subtle-gray pb-4">Personal Details</h2>
                <div className="space-y-4 max-w-md">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Name</span>
                    <span className="text-charcoal font-medium">{user.name}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Email Address</span>
                    <span className="text-charcoal font-medium">{user.email}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Access Role</span>
                    <span className="text-charcoal font-medium text-xs font-semibold bg-subtle-gray/60 px-2 py-0.5 rounded-full uppercase w-max">
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
