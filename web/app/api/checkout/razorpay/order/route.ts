import { validateCustomer } from "@/lib/server/customer";
import { newOrderId, orderStore } from "@/lib/server/orders";
import { priceLines } from "@/lib/server/pricing";
import { razorpayClient, razorpayConfig } from "@/lib/server/razorpay";

export const runtime = "nodejs";

// Step 2 of checkout: the SERVER creates the Razorpay order. The amount is computed here from our
// own product data; the browser only receives what Razorpay Checkout needs (never the secret).

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const cfg = razorpayConfig();
  const store = orderStore();
  if (!cfg.ready || !store) return json({ error: "PAYMENTS_UNAVAILABLE" }, 503);

  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; } catch { return json({ error: "INVALID_REQUEST" }, 400); }

  const c = validateCustomer(body.customer);
  if (!c.ok) return json({ error: "INVALID_DETAILS", fields: c.fields }, 400);

  const priced = priceLines(body.lines, cfg);
  if (!priced.ok) return json({ error: priced.reason === "unpriced" ? "PRICING_UNAVAILABLE" : "INVALID_CART" }, priced.reason === "unpriced" ? 409 : 400);

  const id = newOrderId();
  const coupon = typeof body.coupon === "string" && /^[A-Z0-9_-]{2,40}$/i.test(body.coupon) ? body.coupon.toUpperCase() : null;
  let rzp: { id: string; amount: number | string; currency: string };
  try {
    rzp = await razorpayClient(cfg).orders.create({
      amount: priced.amountPaise,
      currency: "INR",
      receipt: id,
      notes: { ref: id, site: "mickys", test_pricing: String(priced.testPricing) },
    });
  } catch {
    return json({ error: "PAYMENT_START_FAILED" }, 502); // details stay on the server
  }

  await store.create({
    id,
    createdAt: new Date().toISOString(),
    status: "created",
    mode: cfg.mode,
    amountPaise: priced.amountPaise,
    currency: "INR",
    testPricing: priced.testPricing,
    lines: priced.lines,
    customer: c.customer,
    couponRequested: coupon,
    razorpayOrderId: rzp.id,
    razorpayPaymentId: null,
    paidAt: null,
    verifiedBy: [],
    events: [],
    wooOrderId: null,
  });

  return json({
    ref: id,
    razorpayOrderId: rzp.id,
    amount: Number(rzp.amount),
    currency: rzp.currency,
    keyId: cfg.keyId, // public Key ID (same as NEXT_PUBLIC_RAZORPAY_KEY_ID)
    mode: cfg.mode,
    testPricing: priced.testPricing,
    prefill: { name: c.customer.name, email: c.customer.email, contact: c.customer.phone },
  });
}
