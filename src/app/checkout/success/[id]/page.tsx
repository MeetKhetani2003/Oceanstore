'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { CheckCircle2, ArrowRight, Download, Calendar, MapPin, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Find order by fetching user order history or details
        // In a real-world full-stack app we hit a route, let's create a server fetch
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Fetch order error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-2xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center">
        {loading ? (
          <p className="text-gray-400 font-light text-sm">Fetching receipt...</p>
        ) : order ? (
          <div className="bg-white border border-subtle-gray rounded-3xl p-8 md:p-12 shadow-sm w-full space-y-8">
            <div className="flex flex-col items-center">
              <CheckCircle2 size={56} className="text-accent-green mb-4" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-accent-green font-bold">Payment Verified</p>
              <h1 className="editorial-font text-4xl text-charcoal mt-2 font-medium">Order Placed Successfully</h1>
              <p className="text-xs text-gray-400 mt-2 font-mono">Order Reference: #${order._id.substring(0, 8).toUpperCase()}</p>
            </div>

            <hr className="border-subtle-gray/60" />

            <div className="space-y-4 text-left text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Subtotal</span>
                <span className="font-medium text-charcoal">INR {parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Est. Tax (5% GST)</span>
                <span className="font-medium text-charcoal">INR {parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Delivery Fee</span>
                <span className="font-medium text-charcoal">INR {parseFloat(order.shippingFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-subtle-gray pt-4 text-charcoal text-base">
                <span className="font-medium">Total Amount Paid</span>
                <span className="font-bold">INR {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>

            <hr className="border-subtle-gray/60" />

            {/* Delivery Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs space-y-4 md:space-y-0">
              <div className="flex items-start space-x-3">
                <Calendar size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-0.5">Delivery Window</h4>
                  <p className="text-gray-500 font-light">{order.deliveryWindow}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-charcoal mb-0.5">Shipping Address</h4>
                  <p className="text-gray-500 font-light leading-relaxed">
                    {order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              {order.invoiceFileId && (
                <a
                  href={`/api/files/${order.invoiceFileId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal py-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <Download size={16} />
                  <span>Download Invoice PDF</span>
                </a>
              )}
              
              <Link
                href="/shop"
                className="flex-1 bg-accent-green hover:bg-[#153b20] text-white py-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-subtle-gray rounded-3xl p-12 shadow-sm w-full space-y-4">
            <h2 className="editorial-font text-2xl text-charcoal">Order receipt not found</h2>
            <Link href="/shop" className="text-sm text-accent-green hover:underline">
              Return to Shop
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
