// The one product/data layer for the shop. Every shop component reads products through
// here, and every cart action goes through lib/cart.ts, so WooCommerce can replace the
// placeholder data without touching the UI.
//
// Today: data/products.ts (names, copy, pack renders; gravy sizes 250 g / 500 g).
// Later (WooCommerce Store API, e.g. /wp-json/wc/store/v1/products):
//   id              -> Product.id
//   variations      -> Product.sizes[].variationId (matched on the size attribute)
//   name, slug      -> Product.name, Product.slug
//   prices.price    -> Product.price        (never guessed: hidden while null)
//   prices.sale     -> Product.salePrice
//   stock_status    -> Product.stockStatus
//   images          -> Product.image (keep the /products/... paths until final renders land)
// Nothing here invents prices, stock or pack sizes.

import { PRODUCT_CONTENT, type DetailRow, type ProductContent } from "@/data/productContent";
import { CATEGORIES, PRODUCTS, type Category, type CategoryId, type Product } from "@/data/products";
import { RECIPES, type Recipe } from "@/data/recipes";

export type { Category, CategoryId, Product };

export type Catalogue = { categories: Category[]; products: Product[] };

export async function getCatalogue(): Promise<Catalogue> {
  // TODO(woocommerce): fetch products + variations here (server side, cached/revalidated).
  return { categories: CATEGORIES, products: PRODUCTS };
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug) ?? null;
}

export const DEFAULT_CATEGORY: CategoryId = "gravies";

export const isCategoryId = (v: unknown): v is CategoryId => CATEGORIES.some((c) => c.id === v);

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? "";

/** Quick add is only offered where the retail pack sizes are confirmed. */
export const canQuickAdd = (p: Product) => p.sizes.length > 0 && p.stockStatus !== "outofstock";

/** Default selection: the first approved size (250 g for the gravies). */
export const defaultSize = (p: Product) => p.sizes[0]?.label ?? null;

export const productUrl = (p: Pick<Product, "slug">) => `/shop/${p.slug}`;

/** the price for one size (per-size MRP first); null when unknown */
export const priceFor = (p: Product, sizeLabel?: string | null) => {
  const s = p.sizes.find((x) => x.label === sizeLabel) ?? p.sizes[0];
  return s?.price ?? p.salePrice ?? p.price ?? null;
};

export const formatPrice = (v: number | null | undefined) =>
  v == null ? null : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export const findProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug) ?? null;

// ---------------------------------------------------------------- product page

export type { DetailRow, ProductContent };

export type ProductPageData = {
  product: Product;
  content: ProductContent | null;
  hero: { src: string; width: number; height: number };
  /** verified rows, plus pending rows only in development (marked, never live) */
  details: DetailRow[];
  recipes: Recipe[];
  related: Product[];
};

const showPending = process.env.NODE_ENV !== "production";

export async function getProductPage(slug: string): Promise<ProductPageData | null> {
  const { products } = await getCatalogue();
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  // TODO(woocommerce): description, ingredients, nutrition, images and variations from the product endpoint.
  const content = PRODUCT_CONTENT[slug] ?? null;
  const sizes: DetailRow[] = product.sizes.length
    ? [{ label: "Available sizes", value: product.sizes.map((s) => s.label).join(" · "), status: "verified" }]
    : [];
  const details = [...sizes, ...(content?.details ?? [])].filter((d) => (d.status === "verified" && d.value) || showPending);
  const bySlug = (s: string) => RECIPES.find((r) => r.slug === s);
  const recipes = (content ? content.recipeSlugs.map(bySlug).filter((r): r is Recipe => !!r) : RECIPES.filter((r) => r.productSlug === slug))
    .filter((r) => !r.photoMissing); // the product page shows food photography only
  // same category first, topped up from the rest of the range when a category has fewer than two others
  const others = products.filter((o) => o.slug !== slug);
  const related = [...others.filter((o) => o.category === product.category), ...others.filter((o) => o.category !== product.category)].slice(0, 2);
  const hero = content?.heroImage ?? { src: product.image, width: product.imageWidth, height: product.imageHeight };
  return { product, content, hero, details, recipes: recipes.slice(0, 3), related };
}
