import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import B2BPage from "@/components/b2b/B2BPage";
import { B2B_CONTACT, PHOTOS } from "@/data/b2b";
import { SITE_URL } from "@/lib/site";

const TITLE = "Micky's for Professional Kitchens | B2B Cooking Bases";
const DESCRIPTION =
  "Ready cooking bases, pastes and cooked pulses for hotels, restaurants, cloud kitchens and caterers. Less prep, more control. Request a sample for your kitchen.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/b2b" },
  openGraph: { title: "Built for busy kitchens | Micky's for Professional Kitchens", description: DESCRIPTION, url: "/b2b", images: ["/products/pouches/makhani-sauce-hero.webp"] },
};

// a photo slot shows its image as soon as the file exists in /public
const hasFile = (src: string) => existsSync(path.join(process.cwd(), "public", src));

export default function B2BRoute() {
  const photos = Object.fromEntries(Object.entries(PHOTOS).map(([k, p]) => [k, hasFile(p.src)])) as Record<keyof typeof PHOTOS, boolean>;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Micky's",
    url: SITE_URL,
    parentOrganization: { "@type": "Organization", name: "Centre Point Foods Private Limited" },
    contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: B2B_CONTACT.phone.replace(/\s/g, ""), email: B2B_CONTACT.email, areaServed: "IN" },
  };
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-maroon">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <B2BPage photos={photos} />
      </main>
    </>
  );
}
