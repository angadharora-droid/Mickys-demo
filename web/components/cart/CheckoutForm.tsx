"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cartCount, cartSubtotal, clearCart, useCart } from "@/lib/cart";
import { isTestMode, payWithRazorpay, paymentsEnabled } from "@/lib/payments";
import { formatPrice } from "@/lib/products";
import LightHeader from "../shop/LightHeader";

const LATER = "Calculated at checkout";

type Field = "name" | "email" | "phone" | "address" | "city" | "state" | "pincode";
const FIELDS: { k: Field; label: string; type?: string; auto: string; wide?: boolean; mode?: "numeric" | "tel" | "email"; group: "contact" | "address" }[] = [
  { k: "email", label: "Email", type: "email", auto: "email", mode: "email", group: "contact" },
  { k: "phone", label: "Phone", type: "tel", auto: "tel", mode: "tel", group: "contact" },
  { k: "name", label: "Full name", auto: "name", wide: true, group: "address" },
  { k: "address", label: "Address", auto: "street-address", wide: true, group: "address" },
  { k: "city", label: "City", auto: "address-level2", group: "address" },
  { k: "state", label: "State", auto: "address-level1", group: "address" },
  { k: "pincode", label: "PIN code", auto: "postal-code", mode: "numeric", group: "address" },
];
const HINT: Record<Field, string> = {
  name: "Enter your full name.",
  email: "Enter a valid email address.",
  phone: "Enter a 10-digit mobile number.",
  address: "Enter your delivery address.",
  city: "Enter your city.",
  state: "Enter your state.",
  pincode: "Enter a 6-digit PIN code.",
};
// quick client-side check (the server validates again)
const OK: Record<Field, (v: string) => boolean> = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  phone: (v) => /^(?:\+?91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, "")),
  address: (v) => v.trim().length >= 5,
  city: (v) => v.trim().length >= 2,
  state: (v) => v.trim().length >= 2,
  pincode: (v) => /^[1-9]\d{5}$/.test(v.trim()),
};

/**
 * Checkout: contact + delivery details, then payment in Razorpay Checkout (Razorpay's own window).
 * We render no card fields. Until Razorpay keys are configured, the form stays disabled.
 */
export default function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const n = cartCount(cart);
  const subtotal = formatPrice(cartSubtotal(cart));
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [bad, setBad] = useState<Field[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const enabled = paymentsEnabled && n > 0;

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const invalid = FIELDS.filter((f) => !OK[f.k](values[f.k])).map((f) => f.k);
    setBad(invalid);
    if (invalid.length) { document.getElementById(`chk-${invalid[0]}`)?.focus(); return; }
    setBusy(true);
    const r = await payWithRazorpay({
      lines: cart.lines.filter((l) => l.size).map((l) => ({ slug: l.slug, size: l.size as string, quantity: l.quantity })),
      customer: values,
      coupon: cart.coupon,
    });
    setBusy(false);
    if (r.kind === "paid") { clearCart(); router.push(`/checkout/success?ref=${encodeURIComponent(r.ref)}`); return; }
    if (r.kind === "details") { setBad(r.fields as Field[]); setMsg("Please check the highlighted details."); return; }
    if (r.kind === "cancelled") { setMsg("Payment cancelled. Your cart is still here."); return; }
    setMsg(r.ref ? `${r.message} Reference: ${r.ref}` : r.message);
  };

  const field = (f: (typeof FIELDS)[number]) => {
    const err = bad.includes(f.k);
    return (
      <label key={f.k} className={`${f.wide ? "is-wide" : ""}${err ? " is-bad" : ""}`}>
        {f.label}
        <input
          id={`chk-${f.k}`}
          name={f.k}
          type={f.type ?? "text"}
          inputMode={f.mode}
          autoComplete={f.auto}
          value={values[f.k]}
          onChange={(e) => { setValues((v) => ({ ...v, [f.k]: e.target.value })); if (err) setBad((b) => b.filter((x) => x !== f.k)); }}
          aria-invalid={err || undefined}
          aria-describedby={err ? `chk-${f.k}-err` : undefined}
          required
        />
        {err && <span id={`chk-${f.k}-err`} className="chk-err">{HINT[f.k]}</span>}
      </label>
    );
  };

  return (
    <div className="chk">
      <LightHeader />
      <header className="chk-head">
        <h1 className="display chk-title">Checkout</h1>
        {!paymentsEnabled && <p className="chk-banner" role="note">Online payment is being set up. Nothing on this page is saved or sent yet.</p>}
        {paymentsEnabled && isTestMode && <p className="chk-banner is-test" role="note"><b>Test mode.</b> Use Razorpay test payment details. No real money is charged.</p>}
      </header>

      <form className="chk-grid" onSubmit={pay} noValidate>
        <div className="chk-steps">
          <fieldset className="chk-step" disabled={!enabled || busy}>
            <legend><span>01</span> Contact</legend>
            <div className="chk-fields">{FIELDS.filter((f) => f.group === "contact").map(field)}</div>
          </fieldset>
          <fieldset className="chk-step" disabled={!enabled || busy}>
            <legend><span>02</span> Delivery address</legend>
            <div className="chk-fields">{FIELDS.filter((f) => f.group === "address").map(field)}</div>
          </fieldset>
          <section className="chk-step" aria-labelledby="chk-pay">
            <h2 id="chk-pay" className="chk-legend"><span>03</span> Payment</h2>
            <p className="chk-note">You&apos;ll pay in Razorpay&apos;s secure window. Micky&apos;s never sees or stores your card or bank details.</p>
          </section>
        </div>

        <aside className="chk-summary" aria-labelledby="chk-sum">
          <h2 id="chk-sum" className="chk-legend">Order summary</h2>
          {n === 0 ? (
            <p className="chk-note">Your cart is empty. <Link href="/shop">Shop Micky&apos;s</Link></p>
          ) : (
            <>
              <ul className="chk-lines">
                {cart.lines.map((l) => (
                  <li key={l.key}>
                    <span className="chk-thumb" style={{ ["--tint" as string]: l.tint }}><Image src={l.image} alt="" width={l.imageWidth} height={l.imageHeight} sizes="48px" /></span>
                    <span className="chk-line"><b>{l.name}</b>{l.size} × {l.quantity}</span>
                  </li>
                ))}
              </ul>
              <dl className="cart-sum-rows">
                <div className="cart-sum-row"><dt>Subtotal</dt><dd>{subtotal ?? LATER}</dd></div>
                <div className="cart-sum-row"><dt>Shipping</dt><dd>{LATER}</dd></div>
                <div className="cart-sum-row is-total"><dt>Total</dt><dd>{LATER}</dd></div>
              </dl>
            </>
          )}
          <button type="submit" className="cart-checkout" disabled={!enabled || busy} aria-busy={busy}>
            {busy ? "Opening secure payment…" : "Pay securely"}
          </button>
          {msg && <p className="cart-error chk-msg" role="alert">{msg}</p>}
          {!paymentsEnabled && <p className="chk-note">Available once payment is connected.</p>}
          <Link href="/cart" className="cart-secondary">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}
