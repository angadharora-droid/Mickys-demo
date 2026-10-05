import type { Metadata } from "next";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import RecipesIndex from "@/components/recipes/RecipesIndex";
import { getRecipes, isRecipeFilter, recipeFilters } from "@/lib/recipes";

export const metadata: Metadata = {
  title: "Recipes | What will you make? | Micky's",
  description: "One Micky's base. Plenty of ways to make it yours.",
  alternates: { canonical: "/recipes" },
  openGraph: { title: "What will you make? | Micky's Recipes", description: "One Micky's base. Plenty of ways to make it yours.", images: ["/images/recipes/recipe-04.webp"] },
};

export default async function RecipesRoute({ searchParams }: PageProps<"/recipes">) {
  const { product } = await searchParams;
  const recipes = await getRecipes();
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="bg-cream">
        <RecipesIndex
          recipes={recipes}
          filters={recipeFilters(recipes)}
          initialFilter={isRecipeFilter(recipes, product) ? product : "all"}
          heroImage={{ src: "/images/recipes/recipe-04.webp", alt: "Aloo gobi with peas and tomato on a red platter" }}
        />
      </main>
    </>
  );
}
