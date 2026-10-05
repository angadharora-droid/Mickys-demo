// Structured data helpers. Only facts that exist in project data; never ratings, reviews, stock or invented prices.
import { COMPANY } from "@/data/company";
import { SITE_URL } from "./site";

const abs = (path: string) => new URL(path, SITE_URL).href;

/** Organization (Home). Contact details are the verified pack / MRP-card values. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.brand,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: abs("/brand/mickys-logo.png"),
    ...(COMPANY.address ? { address: { "@type": "PostalAddress", streetAddress: COMPANY.address, addressCountry: "IN" } } : {}),
    ...(COMPANY.email || COMPANY.phone
      ? { contactPoint: { "@type": "ContactPoint", contactType: "customer service", areaServed: "IN", ...(COMPANY.phone ? { telephone: COMPANY.phone.replace(/\s/g, "") } : {}), ...(COMPANY.email ? { email: COMPANY.email } : {}) } }
      : {}),
    ...(COMPANY.socials.length ? { sameAs: COMPANY.socials.map((s) => s.url) } : {}),
  };
}

/** BreadcrumbList from [name, path] pairs, e.g. [["Shop", "/shop"], ["Gravies", "/shop?category=gravies"], [name, url]]. */
export function breadcrumbLd(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

/** Serialise for <script type="application/ld+json"> (escapes "<"). */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
