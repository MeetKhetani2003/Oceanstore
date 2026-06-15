import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import Script from "next/script";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OCEON | Premium Fresh Grocery & Everyday Essentials",
  description: "Redefining the standard for daily essentials. Premium quality, lowest prices, delivered flawlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
          <CartDrawer />
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        </CartProvider>
      </body>
    </html>
  );
}

