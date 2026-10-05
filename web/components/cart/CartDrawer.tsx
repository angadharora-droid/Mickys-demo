"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cartCount, clearError, closeCart, useCart } from "@/lib/cart";
import { lockScroll } from "@/lib/smoothScroll";
import CartEmpty from "./CartEmpty";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import UndoBar from "./UndoBar";

/** Slide-in cart, available on every page. Opens from the header and after every add. */
export default function CartDrawer() {
  const cart = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();
  const n = cartCount(cart);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (cart.open && !d.open) { d.showModal(); lockScroll(true); }
    if (!cart.open && d.open) { d.close(); }
  }, [cart.open]);

  // unlock the page whenever the dialog closes (button, Escape, backdrop)
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => { lockScroll(false); if (cart.open) closeCart(); };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [cart.open]);

  // a new page means the drawer's job is done
  useEffect(() => { closeCart(); }, [pathname]);

  // bring a just-added line into view
  useEffect(() => {
    if (!cart.open || !cart.highlight) return;
    listRef.current?.querySelector(".is-new")?.scrollIntoView({ block: "nearest" });
  }, [cart.open, cart.highlight, cart.lines]);

  return (
    <dialog
      ref={ref}
      className="cart-drawer"
      aria-labelledby="cart-drawer-title"
      data-lenis-prevent
      onClick={(e) => { if (e.target === ref.current) closeCart(); }}
    >
      <div className="cart-panel">
        <header className="cart-head">
          <h2 id="cart-drawer-title" className="display cart-title">Your cart</h2>
          {n > 0 && <span className="cart-count">{n} {n === 1 ? "item" : "items"}</span>}
          <button type="button" className="cart-close" onClick={closeCart} aria-label="Close cart">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {cart.error && (
          <div className="cart-alert" role="alert">
            <p>{cart.error}</p>
            <button type="button" onClick={clearError} aria-label="Dismiss message">×</button>
          </div>
        )}

        <div className="cart-body">
          {cart.lines.length > 0 ? (
            <ul ref={listRef} className="cart-list" aria-label="Items in your cart">
              {cart.lines.map((l) => <CartItem key={l.key} line={l} variant="drawer" highlight={l.key === cart.highlight} onNavigate={closeCart} />)}
            </ul>
          ) : (
            <CartEmpty onNavigate={closeCart} />
          )}
        </div>

        <UndoBar />
        {cart.lines.length > 0 && (
          <footer className="cart-foot"><CartSummary variant="drawer" /></footer>
        )}
      </div>
    </dialog>
  );
}
