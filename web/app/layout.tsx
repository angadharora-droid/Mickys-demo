import Footer from "@/components/Footer";
import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const display = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Micky's | Rasoi Ki Taiyaari, Micky's Ki Zimmedari",
  description:
    "Micky's by CP Foods: chef-ready gravies, pastes and sauces. We do the prep, you make it yours.",
  // site-wide defaults; pages override title/description/url
  openGraph: {
    type: "website",
    siteName: "Micky's",
    locale: "en_IN",
    images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Micky's pouches" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#6F0E13",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla's cz-shortcut-listen, Grammarly, dark-mode tools)
    // add attributes to <html>/<body> before React loads. This only ignores attribute differences on these two
    // tags; mismatches anywhere inside the page are still reported.
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="bg-maroon text-cream" suppressHydrationWarning>
        {children}
        <Footer />
      </body>
    </html>
  );
}
