// Copy and content for /b2b (professional kitchens). Kept in one place for review and approval.
// Claims are qualitative only: no percentages, savings or volumes until verified figures exist.
// B2B pack sizes and pricing are not confirmed, so none are shown.

import type { CategoryId } from "./products";

export const B2B_CONTACT = {
  // from the Micky's B2C MRP card ("Trade enquiries"); needs approval for use on the website
  phone: "+91 92719 73474",
  phoneHref: "tel:+919271973474",
  email: "sales1.cpfoods@cpgh.in",
};

export const HERO = {
  headline: ["Built for", "busy kitchens."],
  secondary: ["Less prep.", "More control."],
  support: "Micky's takes care of repetitive base preparation so professional kitchens can focus on final execution.",
  primary: "Request a sample",
  secondary_cta: "Talk to us",
};

export const PROBLEM = {
  headline: ["Too much", "happens", "before service."],
  // desktop: scattered word centres (% of the stage, clear of the headline) and sizes; phones: a simple wrapped list
  words: [
    { w: "Chopping", x: 18, y: 64, s: 1.0 },
    { w: "Soaking", x: 58, y: 16, s: 0.8 },
    { w: "Boiling", x: 44, y: 80, s: 1.15 },
    { w: "Grinding", x: 78, y: 40, s: 0.95 },
    { w: "Cooking", x: 52, y: 46, s: 0.8 },
    { w: "Storage", x: 15, y: 90, s: 0.7 },
    { w: "Procurement", x: 73, y: 88, s: 0.85 },
    { w: "Prep staff", x: 86, y: 64, s: 0.7 },
    { w: "Equipment", x: 85, y: 16, s: 0.65 },
  ],
  result: ["Micky's base", "Final ingredients", "Chef"],
};

export const BENEFITS = {
  eyebrow: "Why professional kitchens use Micky's",
  items: [
    { title: "Less prep", text: "Reduce repetitive preparation before service." },
    { title: "Consistent base", text: "Start from the same dependable foundation across batches." },
    { title: "Faster execution", text: "Move from order to final preparation with fewer prep steps." },
    { title: "Simpler operations", text: "Reduce the complexity around ingredients, preparation and kitchen workflow." },
  ],
};

export const WORKFLOW = {
  headline: ["Your kitchen.", "Your finish."],
  steps: [
    { title: "Micky's base", text: "The slow, repetitive part, already done.", who: "Micky's" },
    { title: "Add your final ingredients", text: "Your protein, vegetables or paneer.", who: "Your kitchen" },
    { title: "Season / customise", text: "Your spice level, your finish, your menu.", who: "Your kitchen" },
    { title: "Plate / serve", text: "Your plating, your standard.", who: "Your kitchen" },
  ],
  note: "Micky's handles the base. Every decision after that stays with the chef.",
};

export type B2BCategory = {
  id: CategoryId;
  label: string;
  text: string;
  featured: { slug: string; name: string; text: string }[];
  also: string[];
};

// product names and one-liners are condensed from the pack copy
export const RANGE: { headline: string[]; note: string; categories: B2BCategory[] } = {
  headline: ["The professional", "range."],
  note: "Contact us for B2B pack options.",
  categories: [
    {
      id: "gravies",
      label: "Gravies",
      text: "Cooked gravy bases. Add your protein or vegetables and finish your way.",
      featured: [
        { slug: "makhani-sauce", name: "Makhani Sauce", text: "Rich tomato and cashew-based creamy gravy." },
        { slug: "brown-masala-gravy", name: "Brown Masala Gravy", text: "Browned onions, tomatoes, cashew nuts and melon seeds." },
        { slug: "yellow-gravy-base", name: "Yellow Gravy Base", text: "Onion, cashew and aromatic spices, golden and smooth." },
      ],
      also: ["Punjabi Bhuna Masala", "White Gravy Base", "Tangy Malai Gravy (Jain)", "Malabar Curry"],
    },
    {
      id: "pastes",
      label: "Pastes & Sauces",
      text: "Ready-to-use pastes, sauces and dips for the line and the pass.",
      featured: [
        { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", text: "Fresh ginger and garlic, blended and ready to use." },
        { slug: "pizza-sauce", name: "Pizza Sauce", text: "Slow-cooked with fresh tomatoes and real spices." },
        { slug: "imli-chutney", name: "Imli Chutney", text: "Ripe tamarind with gentle spices, smooth in texture." },
      ],
      also: ["Garlic Paste", "Ginger Paste", "Tomato Ketchup"],
    },
    {
      id: "grains",
      label: "Grains & Pulses",
      text: "Cooked pulses and dal, ready to go straight into your preparation.",
      featured: [
        { slug: "boiled-kabuli-chana", name: "Boiled Kabuli Chana", text: "Cooked chickpeas: open, rinse, use." },
        { slug: "boiled-rajma", name: "Boiled Rajma", text: "Cooked kidney beans, soft and firm to the bite." },
        { slug: "amritsari-dal-makhani", name: "Amritsari Dal Makhani", text: "Slow-simmered whole black lentils. Just heat." },
      ],
      also: ["Boiled Kala Chana", "Boiled Toor Dal"],
    },
  ],
};

export const CONSISTENCY = {
  headline: ["Consistency", "without", "killing creativity."],
  base: { slug: "makhani-sauce", label: "One base", name: "Makhani Sauce" },
  // finishes suggested on the Makhani Sauce pack; photos are placeholders until the Micky's food shoot
  dishes: [
    { label: "+ Paneer", image: "/images/module4/dish-02.webp", alt: "Paneer in a rich red gravy" },
    { label: "+ Vegetables", image: "/images/recipes/recipe-03.webp", alt: "Vegetable curries in steel bowls" },
    { label: "+ Roasted chicken", image: "/images/recipes/recipe-06.webp", alt: "Chicken curry served with naan" },
  ],
  caption: ["Same foundation.", "Different chef finishes."],
};

export const OPERATIONS = {
  headline: ["Fewer moving", "parts."],
  items: [
    { title: "Simplified procurement", text: "Fewer raw ingredients to source for every base." },
    { title: "Reduced prep complexity", text: "Fewer steps between delivery and service." },
    { title: "Lower storage complexity", text: "Ready bases instead of many separate prep components." },
    { title: "Reduced wastage", text: "Use what the menu needs, when it needs it." },
    { title: "Less dependence on multiple prep processes", text: "The repetitive base work arrives already done." },
    { title: "Consistent execution", text: "The same starting point, shift after shift." },
  ],
};

export const USE_CASES = {
  headline: ["Where it", "fits."],
  items: [
    { title: "Hotels", text: "For faster execution across multiple outlets." },
    { title: "Restaurants", text: "For consistency and reduced prep." },
    { title: "Cloud kitchens", text: "For scalable preparation across orders." },
    { title: "Catering", text: "For large-volume execution." },
  ],
  also: "Also for cafes, institutional kitchens and professional chefs.",
};

export const ENQUIRY = {
  headline: ["Request a sample."],
  support: "Tell us about your kitchen. Our team will get back to you with samples, pack options and pricing.",
  intents: { sample: "Request a sample", details: "Pricing & product details" },
  submit: { sample: "Request a sample", details: "Send enquiry" },
  privacy: "We use these details only to respond to your enquiry.",
  success: ["Thank you.", "Our team will get in touch."],
};

export const FINAL = {
  headline: ["Put Micky's", "to work", "in your kitchen."],
  primary: "Request a sample",
  secondary: "Speak to B2B sales",
};

// photography slots: drop the final files at these paths and they appear automatically
export const PHOTOS = {
  hero: { src: "/images/b2b/kitchen-service.webp", alt: "Chefs at the pass during service", brief: "Professional kitchen during service: chefs at the pass" },
  workflow: { src: "/images/b2b/chef-finishing.webp", alt: "A chef finishing a dish in a pan", brief: "Chef finishing a dish: pan, flame, hands" },
  useCases: { src: "/images/b2b/mise-en-place.webp", alt: "Mise en place on a steel counter", brief: "Mise en place / restaurant line before service" },
};
