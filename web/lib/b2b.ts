// B2B enquiry: field rules shared by the form (browser) and the API route (server).

export const BUSINESS_TYPES = ["Hotel", "Restaurant", "Cloud Kitchen", "Cafe", "Caterer", "Institutional Kitchen", "Distributor", "Other"] as const;
export const INTERESTS = ["Gravies", "Pastes & Sauces", "Grains & Pulses", "Multiple Categories"] as const;
export const INTENTS = ["sample", "details"] as const;

export type Enquiry = {
  intent: (typeof INTENTS)[number];
  name: string;
  business: string;
  city: string;
  mobile: string;
  email: string;
  type: string;
  interest: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export const EMPTY_ENQUIRY: Enquiry = { intent: "sample", name: "", business: "", city: "", mobile: "", email: "", type: "", interest: "", message: "" };

export const LIMITS = { name: 80, business: 120, city: 60, mobile: 20, email: 120, message: 1000 } as const;

/** Indian mobile: optional +91 / 91 / 0, then 10 digits starting 6–9. Returns +91XXXXXXXXXX or null. */
export function normaliseMobile(v: string) {
  const d = v.replace(/[\s\-().]/g, "");
  const m = d.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  return m ? `+91${m[1]}` : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims every field and returns the errors (empty object when valid). */
export function validateEnquiry(raw: Partial<Record<keyof Enquiry, unknown>>): { value: Enquiry; errors: EnquiryErrors } {
  const s = (k: keyof Enquiry) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const value: Enquiry = {
    intent: (INTENTS as readonly string[]).includes(s("intent")) ? (s("intent") as Enquiry["intent"]) : "sample",
    name: s("name"), business: s("business"), city: s("city"), mobile: s("mobile"),
    email: s("email"), type: s("type"), interest: s("interest"), message: s("message"),
  };
  const e: EnquiryErrors = {};
  if (value.name.length < 2) e.name = "Please enter your name.";
  else if (value.name.length > LIMITS.name) e.name = "Please shorten your name.";
  if (value.business.length < 2) e.business = "Please enter your business name.";
  else if (value.business.length > LIMITS.business) e.business = "Please shorten the business name.";
  if (value.city.length < 2) e.city = "Please enter your city.";
  else if (value.city.length > LIMITS.city) e.city = "Please shorten the city name.";
  if (!value.mobile) e.mobile = "Please enter your mobile number.";
  else if (!normaliseMobile(value.mobile)) e.mobile = "Enter a 10-digit Indian mobile number.";
  if (value.email && (!EMAIL.test(value.email) || value.email.length > LIMITS.email)) e.email = "Enter a valid email address, or leave it empty.";
  if (!(BUSINESS_TYPES as readonly string[]).includes(value.type)) e.type = "Please choose your type of business.";
  if (!(INTERESTS as readonly string[]).includes(value.interest)) e.interest = "Please choose the products you're interested in.";
  if (value.message.length > LIMITS.message) e.message = `Please keep this under ${LIMITS.message} characters.`;
  return { value, errors: e };
}
