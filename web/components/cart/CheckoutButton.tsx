"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeCart, useCart } from "@/lib/cart";
import { CHECKOUT_ERROR, startCheckout } from "@/lib/checkout";

/** Hands the cart to WooCommerce checkout (or the preview shell until it is connected). */
export default function CheckoutButton() {
  const { lines } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    const r = await startCheckout(lines).catch(() => ({ ok: false as const, message: CHECKOUT_ERROR }));
    if (!r.ok) { setError(r.message); setBusy(false); return; }
    closeCart();
    if (r.url.startsWith("/")) { router.push(r.url); setBusy(false); }
    else window.location.assign(r.url);
  };

  return (
    <>
      <button type="button" className="cart-checkout" onClick={go} disabled={busy || lines.length === 0} aria-busy={busy}>
        {busy ? "Preparing checkout…" : "Checkout"}
      </button>
      {error && <p className="cart-error" role="alert">{error}</p>}
    </>
  );
}
