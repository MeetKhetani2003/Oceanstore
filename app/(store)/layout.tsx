import type { ReactNode } from "react";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { SearchOverlay } from "@/components/store/SearchOverlay";
import { MobileMenu } from "@/components/store/MobileMenu";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { Toast } from "@/components/store/Toast";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Overlays & floating UI */}
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <FloatingWhatsApp />
      <Toast />
    </StoreProvider>
  );
}
