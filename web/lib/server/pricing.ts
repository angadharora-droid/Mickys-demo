import "server-only";
import { findProduct } from "@/lib/products";
import type { RazorpayConfig } from "./razorpay";

// The amount to charge is always computed here, on the server, from our own product data.
// Nothing the browser sends about prices is trusted (it only sends slug, size, quantity).

export type PricedLine = {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  productId: number | null;
  variationId: number | null;
  /** unit price in paise */
  unitPaise: number;
};

export type PriceResult =
  | { ok: true; lines: PricedLine[]; amountPaise: number; testPricing: boolean }
  | { ok: false; reason: "invalid" | "unpriced" };

const MAX_LINES = 30, MAX_QTY = 20, MIN_AMOUNT = 100; // Razorpay minimum: 100 paise

/** TEST MODE ONLY: per-item amount while WooCommerce prices are not connected. */
function testUnitPaise(cfg: RazorpayConfig) {
  if (cfg.mode !== "test") return null;
  const v = Number(process.env.CHECKOUT_TEST_UNIT_PRICE_PAISE);
  return Number.isInteger(v) && v >= 100 ? v : null;
}

export function priceLines(input: unknown, cfg: RazorpayConfig): PriceResult {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return { ok: false, reason: "invalid" };
  const merged = new Map<string, PricedLine>();
  let testPricing = false;
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return { ok: false, reason: "invalid" };
    const { slug, size, quantity } = raw as Record<string, unknown>;
    if (typeof slug !== "string" || typeof size !== "string" || !Number.isInteger(quantity)) return { ok: false, reason: "invalid" };
    const q = quantity as number;
    const p = findProduct(slug);
    const s = p?.sizes.find((x) => x.label === size);
    if (!p || !s || q < 1 || q > MAX_QTY || p.stockStatus === "outofstock") return { ok: false, reason: "invalid" };
    const rupees = s.price ?? p.salePrice ?? p.price ?? null;
    let unitPaise = rupees == null ? null : Math.round(rupees * 100);
    if (unitPaise == null) {
      unitPaise = testUnitPaise(cfg);
      if (unitPaise == null) return { ok: false, reason: "unpriced" };
      testPricing = true;
    }
    const key = `${slug}::${size}`;
    const prev = merged.get(key);
    if (prev) prev.quantity = Math.min(MAX_QTY, prev.quantity + q);
    else merged.set(key, { slug, name: p.name, size, quantity: q, productId: p.id ?? null, variationId: s.variationId, unitPaise });
  }
  const lines = [...merged.values()];
  const amountPaise = lines.reduce((n, l) => n + l.unitPaise * l.quantity, 0);
  if (amountPaise < MIN_AMOUNT) return { ok: false, reason: "invalid" };
  return { ok: true, lines, amountPaise, testPricing };
}
