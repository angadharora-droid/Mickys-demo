import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import ShopPage from "@/components/shop/ShopPage";
import { DEFAULT_CATEGORY, getCatalogue, isCategoryId } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop | Micky's",
  description: "Micky's gravies, pastes & sauces and grains & pulses. Less prep. More possibilities.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop Micky's", description: "Micky's gravies, pastes & sauces and grains & pulses. Less prep. More possibilities.", url: "/shop", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Micky\'s pouches" }] },
};

export default async function ShopRoute({ searchParams }: PageProps<"/shop">) {
  const { category } = await searchParams;
  const { categories, products } = await getCatalogue();
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <ShopPage categories={categories} products={products} initialCategory={isCategoryId(category) ? category : DEFAULT_CATEGORY} />
      </main>
    </>
  );
}
