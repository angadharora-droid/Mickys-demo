// Contact details for /contact. Only values with a source are shown; anything null stays hidden
// (in development a "pending" marker lists what is missing). Never add an unconfirmed number or account.

export type ContactValue = { value: string | null; source: string | null };

export const CONTACT = {
  // printed on every Micky's pack: "For any complaint or feedback, contact at"
  email: { value: "cpfoods@cpgh.in", source: "pack: complaint / feedback line" } as ContactValue,
  phone: { value: "+91 92719 73474", source: "pack: complaint / feedback line; MRP card: trade enquiries" } as ContactValue,
  // MRP card (w.e.f. 04/09/2026), "Trade enquiries"
  b2bEmail: { value: "sales1.cpfoods@cpgh.in", source: "B2C MRP card: trade enquiries" } as ContactValue,
  // printed on every pack ("Manufactured / marketed by")
  company: "Centre Point Foods Private Limited",
  address: { value: "FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122", source: "pack: manufactured / marketed by" } as ContactValue,
  // not supplied yet: hidden until a verified business number is given
  whatsapp: { value: null, source: null } as ContactValue, // e.g. "+91XXXXXXXXXX" -> shows "Chat on WhatsApp"
};

// not supplied yet: each appears only once a verified URL is added
export const SOCIALS: { id: string; label: string; url: string | null }[] = [
  { id: "instagram", label: "Instagram", url: null },
  { id: "facebook", label: "Facebook", url: null },
  { id: "youtube", label: "YouTube", url: null },
  { id: "linkedin", label: "LinkedIn", url: null },
];

export const CONTACT_HERO = {
  headline: ["Let's", "talk food."],
  support: ["Questions about Micky's, your order, or working with us?", "Send us a message."],
};

export const PATHS = [
  { topic: "Product Question", title: "Product questions", text: "Ask us anything about the Micky's range." },
  { topic: "Order Support", title: "Order support", text: "Need help with an existing order?" },
  { topic: "B2B", title: "B2B", text: "Talk to us about your professional kitchen." },
] as const;

export const CONTACT_COPY = {
  detailsIntro: "Write to us, call us, or use the form. We read every message.",
  success: { eyebrow: "Message sent.", headline: ["Thank you.", "Our team will get back to you."] },
  b2bLink: "Need samples or pack options? Use the full B2B enquiry form",
  privacy: "We use these details only to reply to your message.",
};

export type Faq = { q: string; a: string | null; status: "verified" | "pending"; source: string };

// Only answered from approved content. Pending answers are hidden on the live site.
export const FAQ: Faq[] = [
  {
    q: "What pack sizes are available?",
    a: "Gravies, Punjabi Bhuna Masala, Pizza Sauce, Amritsari Dal Makhani and the boiled pulses come in 250 g standee pouches. Ginger Garlic Paste, Tomato Ketchup and Imli Chutney come in 200 g and 500 g spout pouches.",
    status: "verified",
    source: "Micky's B2C MRP card, w.e.f. 04/09/2026",
  },
  {
    q: "How do I store Micky's products?",
    a: "Store in a cool, dry place. Once opened, refrigerate: gravies, dal and pulses should be used within 2 days; pastes and ketchup within 7 days. Do not use if the pouch is leaking, damaged or bloated.",
    status: "verified",
    source: "storage lines printed on each pack",
  },
  {
    q: "How can I contact the B2B team?",
    a: "Call +91 92719 73474, email sales1.cpfoods@cpgh.in, or send an enquiry from our B2B page.",
    status: "verified",
    source: "B2C MRP card: trade enquiries",
  },
  {
    q: "Where can I buy Micky's?",
    a: null, // needs approved retail / delivery information
    status: "pending",
    source: "awaiting approved stockist and delivery-area information",
  },
];
