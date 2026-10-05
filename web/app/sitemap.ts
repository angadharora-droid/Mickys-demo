import type { MetadataRoute } from "next";
import { POLICIES } from "@/data/legal";
import { getCatalogue } from "@/lib/products";
import { getRecipes } from "@/lib/recipes";
import { SITE_URL } from "@/lib/site";

// Public, indexable pages only (no cart/checkout, no placeholder recipes, policies only once approved).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, SITE_URL).href;
  const { products } = await getCatalogue();
  const recipes = (await getRecipes()).filter((r) => r.status !== "placeholder");
  const pages: [string, MetadataRoute.Sitemap[number]["priority"]][] = [
    ["/", 1], ["/shop", 0.9], ["/recipes", 0.7], ["/why-mickys", 0.6], ["/b2b", 0.6], ["/about", 0.5], ["/contact", 0.5],
  ];
  return [
    ...pages.map(([p, priority]) => ({ url: url(p), changeFrequency: "weekly" as const, priority })),
    ...products.map((p) => ({ url: url(`/shop/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...recipes.map((r) => ({ url: url(`/recipes/${r.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...POLICIES.filter((p) => p.body).map((p) => ({ url: url(`/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
