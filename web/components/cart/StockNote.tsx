import type { StockState } from "@/lib/cart";

const LABEL = { instock: "In stock", lowstock: "Low stock", outofstock: "Out of stock" } as const;

/** Renders nothing until WooCommerce supplies a stock state. */
export default function StockNote({ stock }: { stock: StockState }) {
  if (!stock) return null;
  return <p className={`cart-stock is-${stock}`}>{LABEL[stock]}</p>;
}
