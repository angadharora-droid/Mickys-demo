import "server-only";

// Contact + delivery details from the checkout form. Validated again here (never trust the client).
// No payment data is ever part of this: payment happens inside Razorpay Checkout.

export type Customer = { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string };
export type CustomerResult = { ok: true; customer: Customer } | { ok: false; fields: (keyof Customer)[] };

const RULES: Record<keyof Customer, RegExp> = {
  name: /^.{2,80}$/u,
  email: /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/,
  phone: /^(?:\+?91)?[6-9]\d{9}$/,
  address: /^.{5,200}$/u,
  city: /^.{2,60}$/u,
  state: /^.{2,60}$/u,
  pincode: /^[1-9]\d{5}$/,
};

export function validateCustomer(input: unknown): CustomerResult {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out = {} as Customer;
  const bad: (keyof Customer)[] = [];
  for (const k of Object.keys(RULES) as (keyof Customer)[]) {
    let v = typeof src[k] === "string" ? (src[k] as string).trim().replace(/\s+/g, " ") : "";
    if (k === "phone") v = v.replace(/[\s-]/g, "");
    if (k === "email") v = v.toLowerCase();
    if (!RULES[k].test(v)) bad.push(k);
    out[k] = v;
  }
  return bad.length ? { ok: false, fields: bad } : { ok: true, customer: out };
}
