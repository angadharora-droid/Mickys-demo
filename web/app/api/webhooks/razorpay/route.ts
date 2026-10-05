import { markPaid, orderStore } from "@/lib/server/orders";
import { razorpayConfig } from "@/lib/server/razorpay";
import { verifyWebhookSignature } from "@/lib/server/razorpaySignature";

export const runtime = "nodejs";

// Razorpay webhooks (Dashboard > Webhooks: payment.captured, payment.failed, order.paid).
// The raw body is verified with RAZORPAY_WEBHOOK_SECRET before anything is read. Handles the case
// where the customer closes the browser before our verify call runs. Idempotent per event id.

const json = (body: unknown, status = 200) => Response.json(body, { status });

type Entity = { id?: string; order_id?: string; amount?: number; status?: string };
type Event = { event?: string; payload?: { payment?: { entity?: Entity }; order?: { entity?: Entity } } };

export async function POST(req: Request) {
  const cfg = razorpayConfig();
  const store = orderStore();
  if (!cfg.webhookSecret || !store) return json({ error: "UNAVAILABLE" }, 503);

  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"), cfg.webhookSecret)) return json({ error: "INVALID_SIGNATURE" }, 400);

  let evt: Event;
  try { evt = JSON.parse(raw) as Event; } catch { return json({ error: "INVALID_BODY" }, 400); }
  const eventId = req.headers.get("x-razorpay-event-id") ?? undefined;
  const payment = evt.payload?.payment?.entity;
  const rzpOrderId = payment?.order_id ?? evt.payload?.order?.entity?.id;
  if (!rzpOrderId) return json({ ok: true, ignored: "no order" });

  const order = await store.findByRazorpayOrder(rzpOrderId);
  if (!order) return json({ ok: true, ignored: "unknown order" }); // not ours: acknowledge, don't retry
  if (eventId && order.events.includes(eventId)) return json({ ok: true, duplicate: true });

  switch (evt.event) {
    case "payment.captured":
    case "order.paid": {
      const amount = payment?.amount ?? evt.payload?.order?.entity?.amount;
      if (amount !== order.amountPaise) {
        await store.update(order.id, (o) => ({ ...o, events: eventId ? [...o.events, eventId] : o.events }));
        return json({ ok: true, ignored: "amount mismatch" }); // never mark paid on a different amount
      }
      await markPaid(store, order.id, payment?.id ?? order.razorpayPaymentId ?? "", "webhook", eventId);
      // TODO(woocommerce): mark the WooCommerce order paid if the verify call didn't already.
      return json({ ok: true });
    }
    case "payment.failed":
      await store.update(order.id, (o) => ({
        ...o,
        status: o.status === "paid" ? o.status : "failed",
        events: eventId && !o.events.includes(eventId) ? [...o.events, eventId] : o.events,
      }));
      return json({ ok: true });
    default:
      return json({ ok: true, ignored: evt.event ?? "unknown" });
  }
}
