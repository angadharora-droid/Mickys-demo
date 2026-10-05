import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import ProductPage from "@/components/product/ProductPage";
import { categoryLabel, getCatalogue, getProductPage, productUrl } from "@/lib/products";
import { breadcrumbLd, ldJson } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const { products } = await getCatalogue();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const data = await getProductPage((await params).slug);
  if (!data) return {};
  const { product: p, content, hero } = data;
  const title = `${p.name} | Micky's`;
  const description = content?.summary ?? p.descriptor;
  return {
    title,
    description,
    alternates: { canonical: productUrl(p) },
    openGraph: { title, description, url: productUrl(p), type: "website", images: [{ url: hero.src, width: hero.width, height: hero.height, alt: `${p.name} pouch` }] },
    twitter: { card: "summary_large_image", title, description, images: [hero.src] },
  };
}

export default async function ProductRoute({ params }: PageProps<"/shop/[slug]">) {
  const data = await getProductPage((await params).slug);
  if (!data) notFound();
  const { product: p, content, hero } = data;

  // Product structured data. Offers only from real MRPs (one per size); no ratings/reviews (none exist).
  const prices = p.sizes.map((s) => s.price).filter((x): x is number => x != null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: content?.summary ?? p.descriptor,
    image: [new URL(hero.src, SITE_URL).href],
    url: new URL(productUrl(p), SITE_URL).href,
    category: categoryLabel(p.category),
    brand: { "@type": "Brand", name: "Micky's" },
    ...(p.id ? { sku: String(p.id) } : {}),
    ...(prices.length
      ? {
          offers:
            prices.length > 1
              ? { "@type": "AggregateOffer", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, priceCurrency: "INR", url: new URL(productUrl(p), SITE_URL).href }
              : { "@type": "Offer", price: prices[0], priceCurrency: "INR", url: new URL(productUrl(p), SITE_URL).href,
                  ...(p.stockStatus ? { availability: p.stockStatus === "instock" ? "https://schema.org/InStock" : p.stockStatus === "onbackorder" ? "https://schema.org/BackOrder" : "https://schema.org/OutOfStock" } : {}) },
        }
      : {}),
  };

  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd([["Shop", "/shop"], [categoryLabel(p.category), `/shop?category=${p.category}`], [p.name, productUrl(p)]])) }} />
        <ProductPage data={data} />
      </main>
    </>
  );
}
