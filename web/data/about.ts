// Copy for /about (brand story). Philosophy only: no founding dates, founder story, history, capacity,
// factory details, awards, certifications or market claims (none are approved). FOUNDERS carries names and
// titles only. If company history is needed later, add it as its own section once the facts are supplied.

export const ABOUT_HERO = {
  headline: ["We believe", "cooking should", "still feel", "like cooking."],
  support: ["Micky's takes care of the repetitive preparation,", "so you can focus on flavour, finishing and the final dish."],
};

export const EXISTS = {
  headline: ["The hard part", "shouldn't be", "the boring part."],
  story: [
    "Professional kitchens and home cooks spend a lot of time preparing the foundations of a dish.",
    "Micky's was created to simplify that preparation without taking control away from the cook.",
  ],
};

export const PRINCIPLES = [
  { title: ["Prep,", "simplified."], text: "The slow, repetitive foundation work is done before the pouch reaches your kitchen." },
  { title: ["Control,", "retained."], text: "Spice, texture and finish are still decided by the cook." },
  { title: ["Food,", "still yours."], text: "The dish that reaches the table is the one you made." },
];

export const IDEA = {
  base: ["We make", "the base."],
  dish: ["You make", "the dish."],
  pouch: { slug: "makhani-sauce", name: "Makhani Sauce" },
  dishImage: { src: "/images/recipes/recipe-01.webp", alt: "A creamy makhani curry finished with coriander" },
};

export const FOOD_FIRST = {
  headline: ["Built around", "real cooking."],
  support: "Micky's products are designed to become part of the cooking process, not replace it.",
};

export const CONVENIENCE = {
  headline: ["Convenience", "without", "giving up", "control."],
  support: ["Convenience should remove repetitive work,", "not remove creativity from the kitchen."],
};

export const VALUES = [
  { title: "Simplicity", text: "Fewer steps between the ingredients and the dish." },
  { title: "Consistency", text: "The same dependable base, pouch after pouch." },
  { title: "Creative control", text: "The final call always belongs to the cook." },
];

export const FOUNDERS = {
  headline: ["The people", "behind the base."],
  support: "Micky's is made by Centre Point Food Pvt Ltd, founded by Angadh and Arjun Arora.",
  people: [
    { name: "Angadh Arora", role: "Founder · Centre Point Food Pvt Ltd", src: "/images/about/founder-angadh-arora.webp", alt: "Angadh Arora at his desk" },
    { name: "Arjun Arora", role: "Founder · Centre Point Food Pvt Ltd", src: "/images/about/founder-arjun-arora.webp", alt: "Arjun Arora standing in his office" },
  ],
};

export const RANGE_CTA = {
  headline: ["Made to work", "across your", "kitchen."],
  categories: [
    { id: "gravies", label: "Gravies", text: "Cooked bases for curries: add, simmer, finish.", slug: "makhani-sauce" },
    { id: "pastes", label: "Pastes & Sauces", text: "Everyday pastes, sauces and dips, ready to use.", slug: "ginger-garlic-paste" },
    { id: "grains", label: "Grains & Pulses", text: "Cooked pulses and dal, ready when you are.", slug: "boiled-kabuli-chana" },
  ],
  cta: "Explore the range",
};

export const ABOUT_FINAL = {
  headline: ["Less prep.", "More cooking."],
  primary: "Shop Micky's",
  secondary: "Why Micky's",
};

// Food photography. Existing images are placeholders until the Micky's food shoot; slots whose file is
// missing show a designed panel (brief visible in development only) and fill in once the file is added.
export const ABOUT_PHOTOS = {
  hero: { src: "/images/recipes/recipe-03.webp", alt: "Curries in steel bowls, finished with cream and coriander", brief: "Finished gravies at the table" },
  ingredients: { src: "/images/about/ingredients.webp", alt: "Onions, tomatoes and whole spices on a board", brief: "Raw ingredients: onions, tomatoes, whole spices on a board" },
  chef: { src: "/images/about/chef-finishing.webp", alt: "A cook finishing a dish in the pan", brief: "Chef / home cook finishing a dish in the pan" },
  food: [
    { src: "/images/recipes/recipe-02.webp", alt: "A creamy curry simmering in a pan with lemon and herbs", brief: "" },
    { src: "/images/module4/dish-02.webp", alt: "Paneer in a rich red gravy", brief: "" },
    { src: "/images/recipes/recipe-06.webp", alt: "A curry served with naan", brief: "" },
    { src: "/images/recipes/recipe-04.webp", alt: "Aloo gobi with peas on a red platter", brief: "" },
  ],
};
