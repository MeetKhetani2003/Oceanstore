'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="bg-white border border-subtle-gray rounded-3xl p-8 md:p-12 shadow-sm w-full space-y-6">
      <div className="flex flex-col items-center">
        <AlertCircle size={56} className="text-red-500 mb-4" strokeWidth={1.5} />
        <p className="text-xs uppercase tracking-widest text-red-500 font-bold">Transaction Failed</p>
        <h1 className="editorial-font text-3xl text-charcoal mt-2 font-medium">Payment Verification Failed</h1>
        {orderId && (
          <p className="text-xs text-gray-400 mt-2 font-mono">Order Ref: #${orderId.substring(0, 8).toUpperCase()}</p>
        )}
      </div>

      <p className="text-gray-500 font-light text-sm leading-relaxed">
        Your payment could not be processed or verified by Razorpay. If funds were debited, they will be auto-refunded by your bank within 3-5 business days.
      </p>

      <hr className="border-subtle-gray/60" />

      <div className="pt-4 flex flex-col gap-4">
        <Link
          href="/checkout"
          className="w-full bg-accent-green hover:bg-[#153b20] text-white py-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 text-sm cursor-pointer"
        >
          <span>Retry Checkout</span>
        </Link>
        
        <Link
          href="/shop"
          className="w-full bg-white border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal py-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 text-sm"
        >
          <ArrowLeft size={16} />
          <span>Browse Catalog</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 max-w-md w-full mx-auto px-6 flex flex-col items-center justify-center text-center">
        <Suspense fallback={<div className="bg-white border border-subtle-gray rounded-3xl p-8 w-full animate-pulse h-64 flex items-center justify-center">Loading details...</div>}>
          <FailedContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

