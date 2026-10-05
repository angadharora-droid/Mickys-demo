// Razorpay signature checks (pure functions, Node crypto only).
// Imported only by server modules; kept free of framework imports so it can be unit-tested directly.
import { createHmac, timingSafeEqual } from "node:crypto";

export const hmacSha256Hex = (secret: string, payload: string) => createHmac("sha256", secret).update(payload, "utf8").digest("hex");

/** constant-time comparison; false for any length mismatch */
export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a, "utf8"), B = Buffer.from(b, "utf8");
  return A.length === B.length && timingSafeEqual(A, B);
}

/** Checkout success: signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret) */
export function verifyPaymentSignature(p: { orderId: string; paymentId: string; signature: string }, keySecret: string) {
  if (!keySecret || !p.orderId || !p.paymentId || !p.signature) return false;
  return safeEqual(hmacSha256Hex(keySecret, `${p.orderId}|${p.paymentId}`), p.signature);
}

/** Webhooks: X-Razorpay-Signature = HMAC_SHA256(raw request body, webhook_secret) */
export function verifyWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string) {
  if (!webhookSecret || !signature) return false;
  return safeEqual(hmacSha256Hex(webhookSecret, rawBody), signature);
}
