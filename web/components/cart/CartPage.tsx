"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import LightHeader from "../shop/LightHeader";
import CartEmpty from "./CartEmpty";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import UndoBar from "./UndoBar";

/** /cart: items on the left, order summary on the right (stacked on phones). */
export default function CartPage() {
  const cart = useCart();
  const n = cartCount(cart);
  return (
    <div className="cartp">
      <LightHeader />
      <header className="cartp-head">
        <h1 className="display cartp-title">Your cart</h1>
        {n > 0 && <p className="cart-count">{n} {n === 1 ? "item" : "items"}</p>}
        <Link href="/shop" className="shop-view cartp-back">Continue shopping <span aria-hidden="true">→</span></Link>
      </header>

      {!cart.hydrated ? (
        <div className="cartp-loading" aria-busy="true" aria-label="Loading your cart"><span /><span /></div>
      ) : cart.lines.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="cartp-grid">
          <section aria-label="Items in your cart">
            <div className="cartp-cols" aria-hidden="true"><span>Product</span><span>Quantity</span>{cart.lines.every((l) => l.price != null) && <span>Total</span>}</div>
            <ul className="cart-list cartp-list">
              {cart.lines.map((l) => <CartItem key={l.key} line={l} variant="page" highlight={l.key === cart.highlight} />)}
            </ul>
            <UndoBar />
          </section>
          <aside className="cartp-summary"><CartSummary variant="page" /></aside>
        </div>
      )}
    </div>
  );
}
