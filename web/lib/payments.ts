// Browser side of the Razorpay flow. It never sees the key secret and never decides that a payment
// succeeded: it asks our server to create the order, opens Razorpay Checkout (Razorpay's own secure
// window: we render no card fields), and forwards Razorpay's callback to our server for verification.

export const PUBLIC_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
export const paymentsEnabled = PUBLIC_KEY_ID.length > 0;
export const isTestMode = PUBLIC_KEY_ID.startsWith("rzp_test_");

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type RzpResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RzpInstance = { open(): void; on(event: "payment.failed", cb: (r: unknown) => void): void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RzpInstance } }

export type PayInput = {
  lines: { slug: string; size: string; quantity: number }[];
  customer: Record<string, string>;
  coupon: string | null;
};

export type PayOutcome =
  | { kind: "paid"; ref: string }
  | { kind: "cancelled" }
  | { kind: "details"; fields: string[] }
  | { kind: "error"; message: string; ref?: string };

const MESSAGES: Record<string, string> = {
  PAYMENTS_UNAVAILABLE: "Online payment isn't available right now. Please try again shortly.",
  PRICING_UNAVAILABLE: "Prices for some items aren't available yet, so we can't take payment right now.",
  INVALID_CART: "Something in your cart has changed. Please review your cart and try again.",
  DEFAULT: "We couldn't start the payment. Please try again.",
};
export const FAILED_MESSAGE = "The payment didn't go through. You can try again or choose another method.";
export const VERIFY_MESSAGE = "We couldn't confirm your payment yet. If money left your account, it will be confirmed automatically, so please don't pay again. Keep your order reference.";

let loading: Promise<boolean> | null = null;
function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve(!!window.Razorpay);
    s.onerror = () => { loading = null; resolve(false); };
    document.head.appendChild(s);
  });
  return loading;
}

export async function payWithRazorpay(input: PayInput): Promise<PayOutcome> {
  if (!(await loadCheckout()) || !window.Razorpay) return { kind: "error", message: MESSAGES.DEFAULT };

  let order: { ref: string; razorpayOrderId: string; amount: number; currency: string; keyId: string; testPricing: boolean; prefill: Record<string, string>; error?: string; fields?: string[] };
  try {
    const res = await fetch("/api/checkout/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    order = await res.json();
    if (!res.ok) {
      if (order.error === "INVALID_DETAILS") return { kind: "details", fields: order.fields ?? [] };
      return { kind: "error", message: MESSAGES[order.error ?? ""] ?? MESSAGES.DEFAULT };
    }
  } catch {
    return { kind: "error", message: MESSAGES.DEFAULT };
  }

  const Rzp = window.Razorpay;
  return new Promise<PayOutcome>((resolve) => {
    let failed = false;
    const rzp = new Rzp({
      key: order.keyId,
      order_id: order.razorpayOrderId,
      amount: order.amount,
      currency: order.currency,
      name: "Micky's",
      description: order.testPricing ? `Test payment · ${order.ref}` : `Order ${order.ref}`,
      prefill: order.prefill,
      notes: { ref: order.ref },
      theme: { color: "#6F0E13" },
      handler: async (r: RzpResponse) => {
        try {
          const res = await fetch("/api/checkout/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref: order.ref, ...r }),
          });
          const v = await res.json();
          resolve(res.ok && v.ok ? { kind: "paid", ref: order.ref } : { kind: "error", message: VERIFY_MESSAGE, ref: order.ref });
        } catch {
          resolve({ kind: "error", message: VERIFY_MESSAGE, ref: order.ref });
        }
      },
      modal: { ondismiss: () => resolve(failed ? { kind: "error", message: FAILED_MESSAGE } : { kind: "cancelled" }) },
    });
    rzp.on("payment.failed", () => { failed = true; }); // Razorpay lets the customer retry in the same window
    rzp.open();
  });
}
