"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { BRAND, NAV, WHATSAPP_URL, money } from "@/data/catalog";
import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";
import {
  Bag,
  Heart,
  Menu,
  Search,
  User as UserIcon,
  Whatsapp,
} from "@/lib/ui-utils/icons";
import { Button } from "@/components/store/ui";

export function Header() {
  const pathname = usePathname();
  const {
    openSearch,
    openMenu,
    openDrawer,
    cartCount,
    savedCount,
    subtotal,
  } = useStore();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(console.error);
  }, []);

  const handleAccountClick = () => {
    if (user) {
      window.location.href = "/profile";
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md transition-all duration-300">
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        
        {/* Left Side: Logo & Quick Delivery Address */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2"
          >
            <img
              src="/WhatsApp_Image_2026-06-14_at_12.33.31_PM-removebg-preview.png"
              alt="OCEON"
              className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </a>
          <div className="hidden border-l border-line pl-4 md:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ocean-500">
              Delivery in 15 Mins
            </p>
            <p className="text-[13px] font-medium text-ink/80 truncate max-w-[160px] mt-0.5">
              Lajpat Nagar, New Delhi
            </p>
          </div>
        </div>

        {/* Center: Q-Commerce Style Prominent Search Bar */}
        <div className="flex-1 max-w-xl">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-sand px-4 py-2.5 text-left text-muted/70 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-sm"
          >
            <Search className="h-4.5 w-4.5 text-muted/60" />
            <span className="text-[13.5px] font-normal">
              Search for "fresh milk", "farm eggs", "wheat bread" ...
            </span>
          </button>
        </div>

        {/* Right Side: Navigation Actions & Cart */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          
          {/* Wishlist Icon */}
          <button
            type="button"
            aria-label="Saved items"
            onClick={() => { window.location.href = "/wishlist"; }}
            className="relative hidden h-10 w-10 place-items-center rounded-xl text-ink hover:bg-gray-100 sm:grid"
          >
            <Heart className="h-[19px] w-[19px]" />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ocean-500 px-1 text-[10px] font-bold leading-none text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Account Icon */}
          <button
            type="button"
            aria-label="Account"
            onClick={handleAccountClick}
            className="hidden h-10 w-10 place-items-center rounded-xl text-ink hover:bg-gray-100 sm:grid"
          >
            <UserIcon className="h-[19px] w-[19px]" />
          </button>

          {/* WhatsApp Quick Order Button */}
          <Button
            href={WHATSAPP_URL}
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex border border-line hover:border-leaf-500 hover:text-leaf-500 bg-white"
          >
            <Whatsapp className="h-4 w-4 text-leaf-500" />
            WhatsApp Order
          </Button>

          {/* Q-Commerce Style Sticky Green Cart Pill */}
          {cartCount > 0 ? (
            <button
              onClick={() => openDrawer("cart")}
              className="flex items-center gap-2.5 rounded-xl bg-leaf-500 px-4 py-2 text-white transition-all duration-300 hover:bg-leaf-600 hover:scale-[1.02] shadow-[0_6px_20px_rgba(0,181,98,0.25)]"
            >
              <Bag className="h-[18px] w-[18px]" />
              <div className="text-left font-sans text-xs">
                <p className="font-bold leading-none">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</p>
                <p className="text-[10px] opacity-90 leading-none mt-0.5">{money(subtotal)}</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => openDrawer("cart")}
              className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 font-medium text-ink/80 transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <Bag className="h-[18px] w-[18px] text-muted" />
              <span className="text-[13.5px] hidden sm:inline">My Cart</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={openMenu}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

        </div>
      </div>
    </header>
  );
}
