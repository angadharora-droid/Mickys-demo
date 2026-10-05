import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import CheckoutForm from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Checkout | Micky's", robots: { index: false } };

export default function CheckoutRoute() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream"><CheckoutForm /></main>
    </>
  );
}
