// Policy pages. No text is written here until the business / legal team supplies approved copy:
// until then each page says the policy is being finalised (no promises) and is kept out of search.

export type Policy = {
  slug: string;
  title: string;
  /** approved policy text, one paragraph per entry; null = not supplied yet */
  body: string[] | null;
  /** date the approved text takes effect, e.g. "2026-10-15"; null until approved */
  effective: string | null;
};

export const POLICIES: Policy[] = [
  { slug: "shipping-policy", title: "Shipping Policy", body: null, effective: null },
  { slug: "refund-policy", title: "Refund & Cancellation Policy", body: null, effective: null },
  { slug: "privacy-policy", title: "Privacy Policy", body: null, effective: null },
  { slug: "terms", title: "Terms & Conditions", body: null, effective: null },
];

export const policy = (slug: string) => POLICIES.find((p) => p.slug === slug) ?? null;
