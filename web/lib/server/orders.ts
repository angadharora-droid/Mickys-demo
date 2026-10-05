import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Customer } from "./customer";
import type { PricedLine } from "./pricing";

// Order records for the payment flow. An order is only ever marked "paid" by the server after a
// verified Razorpay signature (checkout callback) or a verified webhook.
//
// Development / test mode: a local JSON file (.data/orders.json, git-ignored).
// Production: not enabled yet. Before going live, implement the WooCommerce store below:
//   create  -> POST /wp-json/wc/v3/orders { status: "pending", line_items (variation_id, quantity),
//              billing/shipping from Customer, meta: razorpay_order_id }   (server-side, consumer key)
//   paid    -> PUT  /wp-json/wc/v3/orders/{id} { set_paid: true, transaction_id: razorpay_payment_id,
//              payment_method: "razorpay" }
// Until then orderStore() returns null in production and checkout reports payments unavailable,
// so a payment can never be taken without somewhere to record it.

export type OrderStatus = "created" | "paid" | "failed";

export type OrderRecord = {
  id: string; // our reference, e.g. MK-LX2F9Q-3K7A
  createdAt: string;
  status: OrderStatus;
  mode: "test" | "live";
  amountPaise: number;
  currency: "INR";
  /** amount came from CHECKOUT_TEST_UNIT_PRICE_PAISE (test mode only) */
  testPricing: boolean;
  lines: PricedLine[];
  customer: Customer;
  /** entered on /cart; not applied (WooCommerce validates coupons later) */
  couponRequested: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  verifiedBy: ("signature" | "webhook")[];
  /** processed webhook event ids (idempotency) */
  events: string[];
  wooOrderId: number | null;
};

export interface OrderStore {
  create(o: OrderRecord): Promise<void>;
  get(id: string): Promise<OrderRecord | null>;
  findByRazorpayOrder(razorpayOrderId: string): Promise<OrderRecord | null>;
  update(id: string, fn: (o: OrderRecord) => OrderRecord): Promise<OrderRecord | null>;
}

export const newOrderId = () => `MK-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

// ---------------------------------------------------------------- local file store (test mode)
const FILE = path.join(process.cwd(), ".data", "orders.json");
let queue: Promise<unknown> = Promise.resolve();
/** serialise read-modify-write so concurrent requests don't lose updates */
const locked = <T,>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
};

async function readAll(): Promise<OrderRecord[]> {
  try { return JSON.parse(await readFile(FILE, "utf8")) as OrderRecord[]; } catch { return []; }
}
async function writeAll(all: OrderRecord[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(all, null, 2));
  await rename(tmp, FILE);
}

const fileStore: OrderStore = {
  create: (o) => locked(async () => { const all = await readAll(); all.push(o); await writeAll(all); }),
  get: async (id) => (await readAll()).find((o) => o.id === id) ?? null,
  findByRazorpayOrder: async (rid) => (await readAll()).find((o) => o.razorpayOrderId === rid) ?? null,
  update: (id, fn) => locked(async () => {
    const all = await readAll();
    const i = all.findIndex((o) => o.id === id);
    if (i < 0) return null;
    all[i] = fn(all[i]);
    await writeAll(all);
    return all[i];
  }),
};

export function orderStore(): OrderStore | null {
  if (process.env.NODE_ENV === "production") return null; // TODO(woocommerce): return wooOrderStore
  return fileStore;
}

/** Mark paid exactly once, recording how it was verified. */
export const markPaid = (store: OrderStore, id: string, paymentId: string, by: "signature" | "webhook", eventId?: string) =>
  store.update(id, (o) => ({
    ...o,
    status: "paid",
    razorpayPaymentId: o.razorpayPaymentId ?? paymentId,
    paidAt: o.paidAt ?? new Date().toISOString(),
    verifiedBy: o.verifiedBy.includes(by) ? o.verifiedBy : [...o.verifiedBy, by],
    events: eventId && !o.events.includes(eventId) ? [...o.events, eventId] : o.events,
  }));
