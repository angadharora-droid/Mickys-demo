import "server-only";
import Razorpay from "razorpay";

// Razorpay configuration, read from the server environment only. The key secret never leaves
// this module's callers (route handlers); only the Key ID is ever returned to the browser.

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: "test" | "live";
  /** keys present, and live keys only when explicitly allowed */
  ready: boolean;
};

export function razorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? "";
  const mode = keyId.startsWith("rzp_live_") ? "live" : "test";
  const allowLive = process.env.RAZORPAY_ALLOW_LIVE === "true";
  const ready = !!keyId && !!keySecret && (keyId.startsWith("rzp_test_") || (mode === "live" && allowLive));
  return { keyId, keySecret, webhookSecret, mode, ready };
}

let client: Razorpay | null = null;
let clientKey = "";

export function razorpayClient(cfg: RazorpayConfig) {
  if (!client || clientKey !== cfg.keyId) {
    client = new Razorpay({ key_id: cfg.keyId, key_secret: cfg.keySecret });
    clientKey = cfg.keyId;
  }
  return client;
}
