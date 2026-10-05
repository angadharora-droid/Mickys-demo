import { markPaid, orderStore } from "@/lib/server/orders";
import { razorpayConfig } from "@/lib/server/razorpay";
import { verifyPaymentSignature } from "@/lib/server/razorpaySignature";

export const runtime = "nodejs";

// Step 6: the browser forwards Razorpay's success callback; the SERVER verifies the signature
// against its secret before anything is marked paid. Browser data alone is never trusted.

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const FAIL = { error: "VERIFY_FAILED" };

export async function POST(req: Request) {
  const cfg = razorpayConfig();
  const store = orderStore();
  if (!cfg.ready || !store) return json({ error: "PAYMENTS_UNAVAILABLE" }, 503);

  let b: Record<string, unknown>;
  try { b = (await req.json()) as Record<string, unknown>; } catch { return json(FAIL, 400); }
  const ref = typeof b.ref === "string" ? b.ref : "";
  const orderId = typeof b.razorpay_order_id === "string" ? b.razorpay_order_id : "";
  const paymentId = typeof b.razorpay_payment_id === "string" ? b.razorpay_payment_id : "";
  const signature = typeof b.razorpay_signature === "string" ? b.razorpay_signature : "";
  if (!/^order_[A-Za-z0-9]{6,40}$/.test(orderId) || !/^pay_[A-Za-z0-9]{6,40}$/.test(paymentId) || !/^[a-f0-9]{64}$/.test(signature)) return json(FAIL, 400);

  const order = await store.findByRazorpayOrder(orderId);
  if (!order || order.id !== ref) return json(FAIL, 400);
  if (!verifyPaymentSignature({ orderId, paymentId, signature }, cfg.keySecret)) return json(FAIL, 400);

  const paid = await markPaid(store, order.id, paymentId, "signature");
  // TODO(woocommerce): create/mark the WooCommerce order paid here (server-side), store wooOrderId.
  return json({ ok: true, ref: paid?.id ?? order.id, status: paid?.status ?? "paid" });
}
