// The one shared cart. Every Add to Cart on the site (Module 5, Shop, Product page, related
// products, recipe previews) calls addToCart(); the header, drawer, /cart and /checkout read
// the same store through useCart().
//
// Today: a small in-memory store persisted to localStorage (slug + size + quantity only).
// Names, images, variation ids and prices are always re-read from the product data layer
// (lib/products.ts), so nothing stale or invented is ever kept in storage.
// Later: WooCommerce's cart session becomes the source of truth. The actions below keep their
// signatures; their bodies call the Store API (add-item / update-item / remove-item) and replace
// `lines` with the cart WooCommerce returns.

import { useSyncExternalStore } from "react";
import type { Product } from "@/data/products";
import { defaultSize, findProduct } from "@/lib/products";

export type StockState = "instock" | "lowstock" | "outofstock" | null;

export type CartLine = {
  /** slug + size: one line per variation */
  key: string;
  productId: number | null;
  variationId: number | null;
  slug: string;
  name: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  tint: string;
  /** selected pack size; null for products without confirmed sizes */
  size: string | null;
  /** sizes the customer may switch between (confirmed sizes only) */
  sizes: string[];
  quantity: number;
  /** unit price; null until WooCommerce supplies it (never guessed) */
  price: number | null;
  stock: StockState;
};

export type CartState = {
  lines: CartLine[];
  open: boolean;
  /** line to highlight after an add or a size change */
  highlight: string | null;
  /** last removed line, for Undo */
  removed: { line: CartLine; index: number } | null;
  /** customer-facing message; never an API error */
  error: string | null;
  /** code entered on /cart; validated by WooCommerce later */
  coupon: string | null;
  hydrated: boolean;
};

export const MAX_QTY = 20;
export const ADD_ERROR = "We couldn't add this item. Please try again.";
const STORAGE_KEY = "mickys-cart-v1";
/** kept for anything listening to adds (analytics later) */
export const CART_EVENT = "mickys:cart";
export type CartDetail = { slug: string; size: string; quantity: number };

const EMPTY: CartState = { lines: [], open: false, highlight: null, removed: null, error: null, coupon: null, hydrated: false };
let state: CartState = EMPTY;
const listeners = new Set<() => void>();

const keyOf = (slug: string, size: string | null) => `${slug}::${size ?? ""}`;

const stockOf = (p: Product): StockState =>
  p.stockStatus === "outofstock" ? "outofstock" : p.stockStatus === "instock" || p.stockStatus === "onbackorder" ? "instock" : null;

/** Build a line from the current product data (variation id / price follow the size). */
function lineFor(p: Product, size: string | null, quantity: number): CartLine {
  const s = size ? p.sizes.find((x) => x.label === size) : undefined;
  return {
    key: keyOf(p.slug, size),
    productId: p.id ?? null,
    variationId: s?.variationId ?? null,
    slug: p.slug,
    name: p.name,
    image: p.image,
    imageWidth: p.imageWidth,
    imageHeight: p.imageHeight,
    tint: p.tint,
    size,
    sizes: p.sizes.map((x) => x.label),
    quantity: Math.max(1, Math.min(MAX_QTY, quantity)),
    price: s?.price ?? p.salePrice ?? p.price ?? null,
    stock: stockOf(p),
  };
}

// ---------------------------------------------------------------- store plumbing
function persist(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, lines: lines.map((l) => ({ slug: l.slug, size: l.size, quantity: l.quantity })) }));
  } catch { /* private mode / storage full: the cart still works for this visit */ }
}

function restore(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { v: number; lines: { slug: string; size: string | null; quantity: number }[] } | null;
    if (!raw || raw.v !== 1 || !Array.isArray(raw.lines)) return [];
    const out: CartLine[] = [];
    for (const r of raw.lines) {
      const p = findProduct(String(r.slug));
      if (!p) continue; // product no longer sold
      const size = r.size && p.sizes.some((s) => s.label === r.size) ? r.size : null;
      if (!size) continue; // size no longer offered, or the product has no confirmed sizes yet
      const q = Number(r.quantity);
      if (!Number.isFinite(q) || q < 1) continue;
      const line = lineFor(p, size, q);
      const same = out.find((l) => l.key === line.key);
      if (same) same.quantity = Math.min(MAX_QTY, same.quantity + line.quantity);
      else out.push(line);
    }
    return out;
  } catch {
    return [];
  }
}

function set(patch: Partial<CartState>) {
  const linesChanged = patch.lines !== undefined && patch.lines !== state.lines;
  state = { ...state, ...patch };
  if (linesChanged && state.hydrated) persist(state.lines);
  listeners.forEach((l) => l());
}

function hydrate() {
  if (state.hydrated || typeof window === "undefined") return;
  state = { ...state, lines: restore(), hydrated: true };
  // keep several open tabs in step
  window.addEventListener("storage", (e) => { if (e.key === STORAGE_KEY) set({ lines: restore() }); });
}

function subscribe(l: () => void) {
  hydrate();
  listeners.add(l); // React re-reads the snapshot after subscribing, so the restored cart shows up
  return () => { listeners.delete(l); };
}

/** The shared cart, for any client component. */
export function useCart(): CartState {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

// ---------------------------------------------------------------- selectors
export const cartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const lineTotal = (l: CartLine) => (l.price == null ? null : l.price * l.quantity);
/** null while any price is unknown: never a partial or guessed subtotal */
export const cartSubtotal = (s: CartState) =>
  s.lines.length && s.lines.every((l) => l.price != null) ? s.lines.reduce((n, l) => n + (l.price as number) * l.quantity, 0) : null;

// ---------------------------------------------------------------- actions
/**
 * Add a product. `size` "" or null means "the default approved size" for products that have
 * sizes. Products without confirmed sizes cannot be added yet (the UI does not offer it).
 * Returns false (and shows ADD_ERROR) if the item could not be added.
 */
export async function addToCart(slug: string, size: string | null, quantity = 1, opts: { openDrawer?: boolean } = {}): Promise<boolean> {
  hydrate();
  // TODO(woocommerce): POST /wc/store/v1/cart/add-item { id: variationId ?? productId, quantity }, then set({ lines: fromWoo(response) }).
  const p = findProduct(slug);
  const chosen = size || (p ? defaultSize(p) : null);
  const valid = !!p && p.sizes.length > 0 && !!chosen && p.sizes.some((s) => s.label === chosen) && p.stockStatus !== "outofstock" && quantity >= 1;
  if (!valid) {
    set({ error: ADD_ERROR, open: opts.openDrawer ?? true });
    return false;
  }
  const add = lineFor(p, chosen, quantity);
  const lines = [...state.lines];
  const i = lines.findIndex((l) => l.key === add.key);
  if (i >= 0) lines[i] = { ...lines[i], quantity: Math.min(MAX_QTY, lines[i].quantity + quantity) };
  else lines.push(add);
  set({ lines, highlight: add.key, error: null, removed: null, open: opts.openDrawer ?? true });
  window.dispatchEvent(new CustomEvent<CartDetail>(CART_EVENT, { detail: { slug, size: chosen, quantity } }));
  return true;
}

export function setQuantity(key: string, quantity: number) {
  // TODO(woocommerce): POST /cart/update-item { key: wooItemKey, quantity }
  set({ lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : l)), error: null });
}

/** Switch a line to another confirmed size (a different WooCommerce variation). Merges if that size is already in the cart. */
export function changeSize(key: string, size: string) {
  // TODO(woocommerce): remove-item (old variation) + add-item (new variation) in one batch request.
  const i = state.lines.findIndex((l) => l.key === key);
  const cur = state.lines[i];
  const p = cur && findProduct(cur.slug);
  if (!cur || !p || cur.size === size || !p.sizes.some((s) => s.label === size)) return;
  const next = lineFor(p, size, cur.quantity);
  const lines = state.lines.filter((l) => l.key !== key);
  const j = lines.findIndex((l) => l.key === next.key);
  if (j >= 0) lines[j] = { ...lines[j], quantity: Math.min(MAX_QTY, lines[j].quantity + cur.quantity) };
  else lines.splice(i, 0, next);
  set({ lines, highlight: next.key, error: null });
}

export function removeLine(key: string) {
  // TODO(woocommerce): POST /cart/remove-item { key }
  const index = state.lines.findIndex((l) => l.key === key);
  if (index < 0) return;
  set({ lines: state.lines.filter((l) => l.key !== key), removed: { line: state.lines[index], index }, highlight: null });
}

export function undoRemove() {
  const r = state.removed;
  if (!r) return;
  const lines = [...state.lines];
  const j = lines.findIndex((l) => l.key === r.line.key);
  if (j >= 0) lines[j] = { ...lines[j], quantity: Math.min(MAX_QTY, lines[j].quantity + r.line.quantity) };
  else lines.splice(Math.min(r.index, lines.length), 0, r.line);
  set({ lines, removed: null, highlight: r.line.key });
}

export const dismissUndo = () => set({ removed: null });
export const clearError = () => set({ error: null });
export const setCoupon = (coupon: string | null) => set({ coupon });
export const openCart = () => { hydrate(); set({ open: true }); };
export const closeCart = () => set({ open: false, highlight: null });
/** after a completed WooCommerce order */
export const clearCart = () => set({ lines: [], removed: null, highlight: null, coupon: null });

export function viewProduct(slug: string) {
  // Module 5 "View product" (unchanged placeholder; not part of the cart).
  window.dispatchEvent(new CustomEvent("mickys:view-product", { detail: { slug } }));
}
