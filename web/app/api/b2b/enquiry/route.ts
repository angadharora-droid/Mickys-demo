import { randomUUID } from "node:crypto";
import { normaliseMobile, validateEnquiry } from "@/lib/b2b";
import { deliverLead } from "@/lib/server/leads";

export const runtime = "nodejs";

const MAX_BODY = 8_000; // bytes
const WINDOW_MS = 10 * 60_000, MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>(); // per-IP submissions (per server instance; a shared store comes with the CRM)

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ ok: false, error: "invalid" }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(text); } catch { return json({ ok: false, error: "invalid" }, 400); }
  if (!body || typeof body !== "object") return json({ ok: false, error: "invalid" }, 400);

  // honeypot: people never see this field; bots fill it. Pretend success, store nothing.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return json({ ok: false, error: "rate_limited" }, 429);

  const { value, errors } = validateEnquiry(body);
  if (Object.keys(errors).length) return json({ ok: false, error: "invalid", fields: errors }, 422);

  hits.push(now);
  recent.set(ip, hits);
  const result = await deliverLead({ ...value, mobile: normaliseMobile(value.mobile)!, id: randomUUID(), receivedAt: new Date(now).toISOString(), source: "website-b2b" });
  if (result === "unavailable") return json({ ok: false, error: "unavailable" }, 503);
  if (result === "failed") return json({ ok: false, error: "failed" }, 502);
  return json({ ok: true });
}
