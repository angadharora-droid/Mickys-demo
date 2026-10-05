"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { cartSubtotal, closeCart, setCoupon, useCart } from "@/lib/cart";
import { applyCoupon } from "@/lib/checkout";
import { formatPrice } from "@/lib/products";
import CheckoutButton from "./CheckoutButton";

const LATER = "Calculated at checkout";

/** Totals are shown only when WooCommerce supplies them; nothing is estimated. */
export default function CartSummary({ variant }: { variant: "drawer" | "page" }) {
  const cart = useCart();
  const subtotal = formatPrice(cartSubtotal(cart));
  // TODO(woocommerce): discount + total come from the Store API cart totals.
  const discount: string | null = null;
  const total: string | null = null;

  if (variant === "drawer") {
    return (
      <div className="cart-sum is-drawer">
        <div className="cart-sum-row"><span>Subtotal</span><span>{subtotal ?? LATER}</span></div>
        <p className="cart-sum-note">Shipping and taxes calculated at checkout.</p>
        <CheckoutButton />
        <Link href="/cart" className="cart-secondary" onClick={closeCart}>View cart</Link>
      </div>
    );
  }

  return (
    <div className="cart-sum is-page">
      <h2 className="cart-sum-h">Order summary</h2>
      <dl className="cart-sum-rows">
        <div className="cart-sum-row"><dt>Subtotal</dt><dd>{subtotal ?? LATER}</dd></div>
        {discount && <div className="cart-sum-row"><dt>Discount</dt><dd>−{discount}</dd></div>}
        <div className="cart-sum-row"><dt>Shipping</dt><dd>{LATER}</dd></div>
        <div className="cart-sum-row is-total"><dt>Total</dt><dd>{total ?? LATER}</dd></div>
      </dl>
      <Coupon code={cart.coupon} />
      <CheckoutButton />
      <Link href="/shop" className="cart-secondary">Continue shopping</Link>
    </div>
  );
}

function Coupon({ code }: { code: string | null }) {
  const [open, setOpen] = useState(!!code);
  const [value, setValue] = useState(code ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await applyCoupon(value);
    setBusy(false);
    setMsg(r.message);
    if (value.trim()) setCoupon(value.trim().toUpperCase()); // carried to WooCommerce, which decides
  };

  return (
    <div className="cart-coupon">
      <button type="button" className="cart-coupon-toggle" aria-expanded={open} aria-controls="cart-coupon-form" onClick={() => setOpen((o) => !o)}>
        Have a coupon? <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <form id="cart-coupon-form" className="cart-coupon-form" onSubmit={submit}>
          <label htmlFor="cart-coupon-code" className="sr-only">Coupon code</label>
          <input id="cart-coupon-code" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter code" autoComplete="off" autoCapitalize="characters" enterKeyHint="done" />
          <button type="submit" disabled={busy}>Apply</button>
        </form>
      )}
      {msg && <p className="cart-coupon-msg" role="status">{msg}</p>}
    </div>
  );
}
