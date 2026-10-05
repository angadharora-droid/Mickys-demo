import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import RecipeDetail from "@/components/recipes/RecipeDetail";
import { getRecipe, getRecipes, recipeUrl, relatedRecipes } from "@/lib/recipes";
import { breadcrumbLd, ldJson } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return (await getRecipes()).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/recipes/[slug]">): Promise<Metadata> {
  const r = await getRecipe((await params).slug);
  if (!r) return {};
  const title = `${r.name} | Micky's Recipes`;
  const description = r.description ?? `${r.name}, made with Micky's ${r.productName}.`;
  return {
    title,
    description,
    alternates: { canonical: recipeUrl(r) },
    // placeholder recipes have no method yet: keep them out of search until written
    robots: r.status === "placeholder" ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: recipeUrl(r), images: [r.heroImage] },
  };
}

export default async function RecipeRoute({ params }: PageProps<"/recipes/[slug]">) {
  const r = await getRecipe((await params).slug);
  if (!r) notFound();
  const all = await getRecipes();

  // Recipe structured data: only fields that exist. Ingredients/instructions only for complete
  // (status "real") recipes; no nutrition, times or ratings are invented.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    image: [new URL(r.heroImage, SITE_URL).href],
    url: new URL(recipeUrl(r), SITE_URL).href,
    author: { "@type": "Organization", name: "Micky's" },
    ...(r.description ? { description: r.description } : {}),
    ...(r.tags.length ? { keywords: r.tags.join(", ") } : {}),
    ...(r.servings ? { recipeYield: r.servings } : {}),
    ...(r.status === "real" && r.ingredients ? { recipeIngredient: r.ingredients } : {}),
    ...(r.status === "real" && r.steps ? { recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", name: s.title, text: s.text })) } : {}),
  };

  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd([["Recipes", "/recipes"], [r.name, recipeUrl(r)]])) }} />
        <RecipeDetail recipe={r} related={relatedRecipes(r, all)} />
      </main>
    </>
  );
}
