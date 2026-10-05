// Checkout handoff from the cart. Payment happens on our /checkout page through Razorpay Checkout
// (see lib/payments.ts + app/api/checkout/razorpay/*): the server creates the Razorpay order,
// the customer pays in Razorpay's own window, and the server verifies the signature before the
// order is marked paid. The verified order is then written to WooCommerce (lib/server/orders.ts).
// We never build card fields or collect card details.

import type { CartLine } from "@/lib/cart";

export const CHECKOUT_ERROR = "We couldn't start checkout. Please try again.";

export type CheckoutResult = { ok: true; url: string } | { ok: false; message: string };

export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  if (lines.length === 0) return { ok: false, message: CHECKOUT_ERROR };
  return { ok: true, url: "/checkout" };
}

/** Coupons are validated by WooCommerce only. Until it is connected, nothing is applied. */
export async function applyCoupon(code: string): Promise<{ ok: boolean; message: string }> {
  const c = code.trim();
  if (!c) return { ok: false, message: "Enter a code." };
  // TODO(woocommerce): POST /wc/store/v1/cart/apply-coupon { code } and read the discount from the returned totals.
  return { ok: false, message: "Coupons are checked at checkout. We'll carry this code through for you." };
}
