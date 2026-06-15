"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { productMap, type Product } from "@/data/catalog";

type DrawerTab = "cart" | "saved";

type ResolvedLine = { product: Product; qty: number };

type StoreValue = {
  // cart
  cart: Record<string, number>;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartLines: ResolvedLine[];
  subtotal: number;
  // wishlist
  saved: string[];
  savedLines: ResolvedLine[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  savedCount: number;
  // overlays
  drawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setDrawerTab: (t: DrawerTab) => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  // toasts
  toast: string | null;
  notify: (msg: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("cart");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("oceanstore_cart");
      if (storedCart) setCart(JSON.parse(storedCart));
      const storedSaved = localStorage.getItem("oceanstore_saved");
      if (storedSaved) setSaved(JSON.parse(storedSaved));
    } catch (e) {
      console.error("Failed to load store from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("oceanstore_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("oceanstore_saved", JSON.stringify(saved));
    }
  }, [saved, isLoaded]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + qty }));
      const p = productMap[id];
      notify(p ? `${p.name} added to cart` : "Added to cart");
    },
    [notify]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => {
      if (qty <= 0) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: qty };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSaved((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const { cartLines, cartCount, subtotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    const lines: ResolvedLine[] = [];
    for (const [id, qty] of Object.entries(cart)) {
      const p = productMap[id];
      if (!p) continue;
      count += qty;
      total += p.price * qty;
      lines.push({ product: p, qty });
    }
    return { cartLines: lines, cartCount: count, subtotal: total };
  }, [cart]);

  const savedLines = useMemo(
    () =>
      saved
        .map((id) => productMap[id])
        .filter(Boolean)
        .map((product) => ({ product: product as Product, qty: 1 })),
    [saved]
  );

  const value: StoreValue = {
    cart,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartCount,
    cartLines,
    subtotal,
    saved,
    savedLines,
    toggleSave,
    isSaved,
    savedCount: saved.length,
    drawerOpen,
    drawerTab,
    openDrawer: (tab = "cart") => {
      setDrawerTab(tab);
      setDrawerOpen(true);
    },
    closeDrawer: () => setDrawerOpen(false),
    setDrawerTab,
    searchOpen,
    openSearch: () => setSearchOpen(true),
    closeSearch: () => setSearchOpen(false),
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    toast,
    notify,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
