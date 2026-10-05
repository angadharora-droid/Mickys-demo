// Contact form: field rules shared by the form (browser) and the API route (server).
import { BUSINESS_TYPES, normaliseMobile } from "./b2b";

export const TOPICS = ["Product Question", "Order Support", "B2B", "Distribution", "Other"] as const;
export type Topic = (typeof TOPICS)[number];

export type ContactMessage = {
  topic: Topic;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  orderNumber: string; // Order Support only
  business: string; // B2B only
  city: string; // B2B only
  type: string; // B2B only
};

export type ContactErrors = Partial<Record<keyof ContactMessage, string>>;

export const EMPTY_MESSAGE: ContactMessage = { topic: "Product Question", name: "", email: "", mobile: "", subject: "", message: "", orderNumber: "", business: "", city: "", type: "" };

export const CONTACT_LIMITS = { name: 80, email: 120, mobile: 20, subject: 120, message: 2000, orderNumber: 40, business: 120, city: 60 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims every field, drops fields that don't apply to the topic, and returns the errors. */
export function validateContact(raw: Partial<Record<keyof ContactMessage, unknown>>): { value: ContactMessage; errors: ContactErrors } {
  const s = (k: keyof ContactMessage) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const topic = (TOPICS as readonly string[]).includes(s("topic")) ? (s("topic") as Topic) : "Other";
  const b2b = topic === "B2B";
  const value: ContactMessage = {
    topic, name: s("name"), email: s("email"), mobile: s("mobile"), subject: s("subject"), message: s("message"),
    orderNumber: topic === "Order Support" ? s("orderNumber") : "",
    business: b2b ? s("business") : "", city: b2b ? s("city") : "", type: b2b ? s("type") : "",
  };
  const L = CONTACT_LIMITS;
  const e: ContactErrors = {};
  if (value.name.length < 2) e.name = "Please enter your name.";
  else if (value.name.length > L.name) e.name = "Please shorten your name.";
  if (!value.email) e.email = "Please enter your email address.";
  else if (!EMAIL.test(value.email) || value.email.length > L.email) e.email = "Enter a valid email address.";
  if (value.mobile && !normaliseMobile(value.mobile)) e.mobile = "Enter a 10-digit Indian mobile number, or leave it empty.";
  if (value.subject.length < 2) e.subject = "Please add a subject.";
  else if (value.subject.length > L.subject) e.subject = "Please shorten the subject.";
  if (value.message.length < 10) e.message = "Please write a little more (at least 10 characters).";
  else if (value.message.length > L.message) e.message = `Please keep this under ${L.message} characters.`;
  if (value.orderNumber.length > L.orderNumber) e.orderNumber = "That order number looks too long.";
  if (b2b) {
    if (value.business.length < 2) e.business = "Please enter your business name.";
    else if (value.business.length > L.business) e.business = "Please shorten the business name.";
    if (value.city.length < 2) e.city = "Please enter your city.";
    else if (value.city.length > L.city) e.city = "Please shorten the city name.";
    if (!(BUSINESS_TYPES as readonly string[]).includes(value.type)) e.type = "Please choose your type of business.";
  }
  return { value, errors: e };
}
