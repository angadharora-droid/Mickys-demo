import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import CartPage from "@/components/cart/CartPage";

export const metadata: Metadata = { title: "Your cart | Micky's", robots: { index: false } };

export default function CartRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream"><CartPage /></main>
    </>
  );
}
