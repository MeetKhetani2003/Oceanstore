'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminStatsAction, updateOrderStatusAction } from '@/features/admin/actions';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Database, 
  Package, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadAdminData() {
    setLoading(true);
    setError('');
    const res = await getAdminStatsAction();
    if (res.success) {
      setStats(res.stats);
      setLowStock(res.lowStock || []);
      setRecentOrders(res.recentOrders || []);
    } else {
      setError(res.error || 'Failed to fetch admin stats');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      loadAdminData();
    } else {
      alert(res.error || 'Failed to update order status');
    }
    setUpdatingId(null);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center font-sans">
        <p className="text-gray-400 font-light text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-white flex flex-col justify-center items-center font-sans space-y-4 text-center px-6">
        <AlertTriangle size={48} className="text-red-500" strokeWidth={1.5} />
        <h2 className="editorial-font text-2xl text-charcoal">Access Denied / Failed</h2>
        <p className="text-gray-500 font-light text-sm max-w-sm">{error}. Ensure your user role has manager or admin rights.</p>
        <Link href="/" className="text-sm text-accent-green hover:underline">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-[1600px] w-full mx-auto px-6 md:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">CTO Control Center</p>
            <h1 className="editorial-font text-5xl md:text-6xl text-charcoal">Admin Dashboard</h1>
          </div>
          <button 
            onClick={loadAdminData}
            className="flex items-center space-x-2 text-xs font-semibold text-accent-green hover:text-[#153b20] transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* 1. Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          {[
            { label: 'Total Revenue', value: `INR ${stats?.totalRevenue}`, icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-100' },
            { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Active Customers', value: stats?.totalCustomers, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { label: 'Store Catalogue', value: `${stats?.totalProducts} items`, icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'GridFS Storage', value: `${stats?.filesCount} files`, icon: Database, color: 'text-gray-600 bg-gray-50 border-gray-100' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white border border-subtle-gray rounded-2xl p-6 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color} mb-4`}>
                  <Icon size={18} />
                </div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-charcoal leading-none">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Panel: Recent Orders (8 Cols) */}
          <div className="lg:col-span-8 bg-white border border-subtle-gray rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-charcoal border-b border-subtle-gray pb-4 mb-6">Recent Order Settles</h2>
            
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm font-light py-6">No order transaction logs found in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-subtle-gray text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                      <th className="pb-3 pr-4">Order Code</th>
                      <th className="pb-3 px-4">Customer</th>
                      <th className="pb-3 px-4">Total Amount</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle-gray/60">
                    {recentOrders.map(o => (
                      <tr key={o.id} className="align-middle">
                        <td className="py-4 pr-4 font-semibold text-charcoal">#${o.id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-4 px-4 font-light text-charcoal">{o.customerName}</td>
                        <td className="py-4 px-4 font-semibold text-charcoal">INR {parseFloat(o.total).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${o.status === 'PAID' || o.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4">
                          <select
                            disabled={updatingId === o.id}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="bg-warm-white border border-subtle-gray text-[10px] font-semibold rounded-lg px-2 py-1 cursor-pointer outline-none focus:border-charcoal"
                          >
                            <option value="RESERVED">Reserved</option>
                            <option value="PAID">Paid</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Panel: Low Stock Monitor (4 Cols) */}
          <div className="lg:col-span-4 bg-white border border-subtle-gray rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-charcoal border-b border-subtle-gray pb-4 mb-6 flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <span>Low Stock Alerts</span>
            </h2>

            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm font-light py-6">All products have sufficient inventory levels.</p>
            ) : (
              <div className="space-y-4">
                {lowStock.map(p => (
                  <div key={p.id} className="border border-subtle-gray rounded-xl p-4 flex items-center justify-between bg-amber-50/20">
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal leading-snug">{p.name}</h4>
                      <p className="text-[9px] text-gray-400 font-light mt-0.5">SKU: {p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-600">{p.stock} left</span>
                      <p className="text-[9px] text-gray-400 font-light mt-0.5">Restock Required</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
