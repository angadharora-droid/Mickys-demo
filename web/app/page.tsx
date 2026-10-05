import type { Metadata } from "next";
import Header from "@/components/Header";
import { ldJson, organizationLd } from "@/lib/seo";
import ChefSection from "@/components/ChefSection";
import HeroScroll from "@/components/HeroScroll";
import ProductRange from "@/components/ProductRange";
import SmoothScroll from "@/components/SmoothScroll";

const DESCRIPTION = "Micky's by CP Foods: chef-ready gravies, pastes and sauces. We do the prep, you make it yours.";

export const metadata: Metadata = {
  title: "Micky's | Rasoi Ki Taiyaari, Micky's Ki Zimmedari",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: "Micky's | Rasoi Ki Taiyaari, Micky's Ki Zimmedari", description: DESCRIPTION, url: "/", images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Micky\'s pouches" }] },
};

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(organizationLd()) }} />
        <HeroScroll />
        <ChefSection />
        <ProductRange />
      </main>
    </>
  );
}
