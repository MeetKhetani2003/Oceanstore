'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, openAuthModal, authModalRedirectUrl, refreshUser } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine query redirect params
  const queryRedirect = searchParams.get('redirect');
  const redirectUrl = authModalRedirectUrl || queryRedirect || '';

  useEffect(() => {
    // Check if URL query contains login=true on page load
    const triggerLogin = searchParams.get('login') === 'true';
    if (triggerLogin && !isAuthModalOpen) {
      openAuthModal(queryRedirect || undefined);
    }
  }, [searchParams, isAuthModalOpen, openAuthModal, queryRedirect]);

  const handleClose = () => {
    closeAuthModal();
    if (searchParams.get('login') === 'true') {
      router.push('/');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        closeAuthModal();
        
        // Dynamic redirection to destination page, or reload homepage
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setError('Network error: Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        const loginUri = `${window.location.origin}/api/auth/callback/google`;
        
        // Save target redirect in cookie so the backend callback can retrieve it
        if (redirectUrl) {
          document.cookie = `authRedirect=${encodeURIComponent(redirectUrl)}; path=/; max-age=300; SameSite=Lax`;
        } else {
          document.cookie = `authRedirect=/; path=/; max-age=300; SameSite=Lax`;
        }

        (window as any).google.accounts.id.initialize({
          client_id: '147355234716-avvp415jts8tf13kph2uudm21u5rpgvu.apps.googleusercontent.com',
          login_uri: loginUri,
          ux_mode: 'redirect',
          cancel_on_tap_outside: false,
        });

        const container = document.getElementById('google-signin-btn');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'filled_blue',
            size: 'large',
            width: 320,
            shape: 'pill',
            text: 'signin_with',
          });
        }
      }
    };

    // Delay slightly to ensure GSI script is loaded/evaluated
    const timer = setTimeout(() => {
      initGoogle();
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthModalOpen]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#0A192F]/40 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white border border-subtle-gray rounded-3xl p-8 md:p-10 shadow-2xl z-10 flex flex-col items-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-1.5 rounded-full border border-subtle-gray hover:bg-subtle-gray/40 text-charcoal/50 hover:text-charcoal transition-all duration-300 cursor-pointer"
            >
              <X size={14} />
            </button>

            {/* Logo / Title */}
            <div className="text-center mb-8 space-y-2 mt-4">
              <span className="text-xs uppercase tracking-widest text-accent-green font-bold">Welcome to Oceon</span>
              <h2 className="editorial-font text-3xl font-semibold text-charcoal tracking-wide">Enter the Store</h2>
              <p className="text-gray-400 font-light text-sm max-w-[280px] mx-auto">
                A seamless, single-click entry to manage your cart, orders, and addresses.
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3.5 mb-6 text-center font-medium">
                {error}
              </div>
            )}

            {/* Loader or Google Button container */}
            <div className="w-full flex justify-center py-6">
              {loading ? (
                <div className="flex flex-col items-center space-y-3 py-4">
                  <div className="w-6 h-6 border-2 border-accent-green border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-400 font-light font-mono animate-pulse">Authenticating session...</span>
                </div>
              ) : (
                <div id="google-signin-btn" className="min-h-[44px]"></div>
              )}
            </div>

            {/* Privacy/Security Callout */}
            <div className="mt-8 pt-6 border-t border-subtle-gray/60 w-full flex items-start space-x-3 text-left">
              <ShieldCheck size={18} className="text-accent-green flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-gray-400 leading-normal font-light">
                <strong>Secure Single Sign-On</strong>: We do not store passwords. Google authenticates your identity, and we securely stream your profile picture to GridFS.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
