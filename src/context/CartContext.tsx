'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutAction } from '@/features/auth/actions';
import { getCartAction, syncCartAction } from '@/features/cart/actions';

export interface Product {
  id: string;
  name: string;
  origin: string;
  price: string;
  unit: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  user: any | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  authModalRedirectUrl: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRedirectUrl, setAuthModalRedirectUrl] = useState('');

  const openAuthModal = (redirectUrl?: string) => {
    if (redirectUrl) {
      setAuthModalRedirectUrl(redirectUrl);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalRedirectUrl('');
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getMe();
      setUser(currentUser);
      
      if (currentUser) {
        // User logged in: load their cart from MongoDB database
        const dbCart = await getCartAction();
        if (dbCart.success && dbCart.items.length > 0) {
          setCart(dbCart.items);
        }
      }
    } catch (e) {
      console.error('refreshUser error:', e);
    }
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    setCart([]);
    localStorage.removeItem('ocean_cart');
  };

  // Sync state on mount
  useEffect(() => {
    setIsMounted(true);
    refreshUser();

    const savedFavorites = localStorage.getItem('ocean_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    }

    // Load guest cart only if user check hasn't run or is guest
    const savedCart = localStorage.getItem('ocean_cart');
    if (savedCart && !user) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading guest cart', e);
      }
    }
  }, []);

  // Save changes to Database / LocalStorage
  useEffect(() => {
    if (isMounted) {
      if (user) {
        const payload = cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));
        syncCartAction(payload);
      } else {
        localStorage.setItem('ocean_cart', JSON.stringify(cart));
      }
    }
  }, [cart, user, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('ocean_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        favorites,
        toggleFavorite,
        user,
        refreshUser,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalRedirectUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
