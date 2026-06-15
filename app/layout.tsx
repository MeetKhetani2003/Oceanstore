import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OCEON — Quality In Lowest Prices",
    template: "%s | OCEON",
  },
  description:
    "Premium grocery and daily essentials delivered to your door. Fresh produce, dairy, and everyday items curated for modern households.",
  keywords: [
    "grocery delivery",
    "fresh produce",
    "online grocery",
    "daily essentials",
    "OCEON",
  ],
  authors: [{ name: "OCEON" }],
  creator: "OCEON",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "OCEON",
    title: "OCEON — Quality In Lowest Prices",
    description:
      "Premium grocery and daily essentials — delivered beautifully.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCEON — Quality In Lowest Prices",
    description:
      "Premium grocery and daily essentials — delivered beautifully.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
