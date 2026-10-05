"use client";

import { cartCount, openCart, useCart } from "@/lib/cart";

/** Header "Cart (n)": total quantity, opens the drawer. */
export default function CartButton() {
  const n = cartCount(useCart());
  return (
    <button
      type="button"
      onClick={openCart}
      aria-haspopup="dialog"
      aria-label={`Cart, ${n} ${n === 1 ? "item" : "items"}`}
      className="cursor-pointer uppercase opacity-85 hover:text-yellow hover:opacity-100"
    >
      Cart (<span className="tabular-nums">{n}</span>)
    </button>
  );
}
