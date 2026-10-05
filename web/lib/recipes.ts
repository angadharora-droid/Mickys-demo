// Recipe data layer (like lib/products.ts). Pages and components read recipes only through here.
import { RECIPES, type Recipe } from "@/data/recipes";
import { findProduct } from "@/lib/products";

export type { Recipe };

export type RecipeFilter = { id: string; label: string; count: number };

/** product filter id for a recipe: gravies by product, everything else by category */
const filterIdOf = (r: Recipe) => {
  const p = findProduct(r.productSlug);
  return !p ? r.productSlug : p.category === "gravies" ? p.slug : p.category;
};
const LABEL: Record<string, string> = { pastes: "Pastes & Sauces", grains: "Grains & Pulses" };
const ORDER = ["brown-masala-gravy", "tangy-malai-gravy", "malabar-curry", "white-gravy-base", "yellow-gravy-base", "makhani-sauce", "amritsari-dal-makhani", "punjabi-bhuna-masala", "yellow-gravy", "makhani-gravy", "malabari-gravy", "pastes", "grains"];

/** only recipes whose Micky's product is currently sold */
const LIVE = () => RECIPES.filter((r) => findProduct(r.productSlug));

export async function getRecipes(): Promise<Recipe[]> {
  // TODO(cms): recipes from the CMS / WordPress once written.
  return LIVE();
}

export async function getRecipe(slug: string) {
  return LIVE().find((r) => r.slug === slug) ?? null;
}

export const recipeMatches = (r: Recipe, filter: string) => filter === "all" || filterIdOf(r) === filter;

/** "All" plus one filter per product/category that actually has recipes (no empty filters). */
export function recipeFilters(recipes: Recipe[]): RecipeFilter[] {
  const counts = new Map<string, number>();
  recipes.forEach((r) => counts.set(filterIdOf(r), (counts.get(filterIdOf(r)) ?? 0) + 1));
  const ids = [...ORDER.filter((id) => counts.has(id)), ...[...counts.keys()].filter((id) => !ORDER.includes(id))];
  const rest = ids.map((id) => ({ id, label: LABEL[id] ?? findProduct(id)?.name ?? id, count: counts.get(id)! }));
  // one product only: filtering adds nothing, so no filter row
  return rest.length <= 1 ? [] : [{ id: "all", label: "All", count: recipes.length }, ...rest];
}

export const isRecipeFilter = (recipes: Recipe[], v: unknown): v is string => typeof v === "string" && recipeFilters(recipes).some((f) => f.id === v);

/** Same product first, then shared tags, then the same product category. */
export function relatedRecipes(r: Recipe, all: Recipe[], n = 3) {
  const cat = findProduct(r.productSlug)?.category;
  const score = (o: Recipe) =>
    (o.productSlug === r.productSlug ? 4 : 0) + o.tags.filter((t) => r.tags.includes(t)).length * 2 + (findProduct(o.productSlug)?.category === cat ? 1 : 0) + (o.status === "real" ? 0.5 : 0);
  return all.filter((o) => o.slug !== r.slug).sort((a, b) => score(b) - score(a)).slice(0, n);
}

export const recipeUrl = (r: Pick<Recipe, "slug">) => `/recipes/${r.slug}`;
