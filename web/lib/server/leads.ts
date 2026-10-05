import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Enquiry } from "@/lib/b2b";
import type { ContactMessage } from "@/lib/contact";

// Where website enquiries go. Server only: no credentials ever reach the browser.
//   1. <PREFIX>_WEBHOOK_URL set  -> POST the record as JSON (CRM / automation / mail service endpoint),
//      with "Authorization: Bearer <PREFIX>_WEBHOOK_TOKEN" when a token is configured.
//   2. otherwise, in development  -> appended to .data/<file>.json (git-ignored).
//   3. otherwise (production, not configured) -> "unavailable"; the form shows the phone/email instead.
// B2B enquiries use B2B_LEADS_*, the contact form uses CONTACT_*.

export type Lead = Enquiry & { mobile: string; id: string; receivedAt: string; source: "website-b2b" };
export type Message = ContactMessage & { mobile: string; id: string; receivedAt: string; source: "website-contact" };
export type DeliveryResult = "sent" | "stored" | "unavailable" | "failed";

async function deliver(record: object, prefix: "B2B_LEADS" | "CONTACT", file: string): Promise<DeliveryResult> {
  const url = process.env[`${prefix}_WEBHOOK_URL`];
  if (url) {
    try {
      const token = process.env[`${prefix}_WEBHOOK_TOKEN`];
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      return res.ok ? "sent" : "failed";
    } catch {
      return "failed";
    }
  }
  if (process.env.NODE_ENV === "production") return "unavailable";
  const target = path.join(process.cwd(), ".data", file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  let all: object[] = [];
  try { all = JSON.parse(await fs.readFile(target, "utf8")); } catch { /* first record */ }
  all.push(record);
  await fs.writeFile(target, JSON.stringify(all, null, 2));
  return "stored";
}

export const deliverLead = (lead: Lead) => deliver(lead, "B2B_LEADS", "b2b-leads.json");
export const deliverMessage = (message: Message) => deliver(message, "CONTACT", "contact-messages.json");
