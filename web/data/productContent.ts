// Product page content, per product. Read only through lib/products.ts (getProductPage).
//
// Every block records where it came from. `status: "pending"` content is NEVER shown on
// the live site: in development it renders with a visible "pending" marker so the layout
// can be reviewed; in production it is dropped. When WooCommerce / the pack artwork
// supplies verified values, flip the status (or map the field from WooCommerce).
//
// Sources used here:
//   deck  = Micky's chef recipe deck (frontend/src/data/siteData.js › APPLICATIONS)
//   site  = existing Micky's site product data (frontend/src/data/siteData.js › PRODUCTS)

export type ContentStatus = "verified" | "pending";

export type HowToStep = { word: string; text: string };

export type DetailRow = {
  label: string;
  /** null while the verified value is not available yet */
  value: string | null;
  /** optional table (e.g. nutrition): header row first */
  table?: string[][];
  status: ContentStatus;
  source?: string;
};

export type ProductContent = {
  /** hero glow colour: the product's personality, kept inside the brand palette (falls back to the product tint) */
  heroTint?: string;
  /** high-resolution pack render for the product page (falls back to the shop image) */
  heroImage?: { src: string; width: number; height: number };
  /** back of pack (label), offered as a second view on the product page */
  backImage?: { src: string; width: number; height: number };
  /** the one strong statement after the hero: two lines */
  statement: [string, string];
  summary: string;
  /** what this product does for the customer: 3 points maximum */
  points: { title: string; text: string }[];
  howToUse: { status: ContentStatus; source: string; steps: HowToStep[]; tip?: string } | null;
  /** product-specific rows; "Available sizes" is added automatically from the product */
  details: DetailRow[];
  /** dishes shown under "Make it your way" (slugs from data/recipes.ts) */
  recipeSlugs: string[];
  /** more dishes the same base makes (deck), shown as a single line */
  moreDishes?: string[];
};

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  // ------------------------------------------------------------------ Punjabi Bhuna Masala (pending images)
  // Transcribed from the pack. NOTE for the pack team: the front says "Bhuna", the back says "Buna";
  // the address reads "Maharasshtre". The pack has no cooking steps, so How to Use is not shown.
  // ---- from the Cumulative Retort artwork (Sep 2026) ----
  "amritsari-dal-makhani": {
    heroTint: "#ecc46a",
    heroImage: { src: "/products/pouches/amritsari-dal-makhani-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/amritsari-dal-makhani-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Made from slow-simmered whole black lentils and a bold blend of spices, a smooth texture and distinctive smoky notes. Simply heat to create thick, full-flavoured Dal Makhani with true slow-cooked character.",
    points: [
      { title: "Slow-simmered", text: "Whole black lentils cooked low and slow, with distinctive smoky notes." },
      { title: "Just heat", text: "Pour into a pan and heat for 8–10 minutes: the dal is already made." },
      { title: "Finish your way", text: "Fresh cream, kasuri methi, julienned ginger and extra butter." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Pour & heat.", text: "Open the packet, pour the dal into a pan, and cook on medium heat for 8–10 minutes, stirring occasionally to keep it smooth." },
        { word: "Finish & enrich.", text: "Add 1 tbsp fresh cream and a pinch of kasuri methi, then mix well." },
        { word: "Serve.", text: "Serve hot with naan, jeera rice or roti. Garnish with julienned ginger and extra butter." },
      ],
      tip: "Add a small drizzle of ghee or butter just before serving.",
    },
    details: [
      { label: "Ingredients", value: "Water, Mixed Pulses (Black Gram (Urad), Whole Green Gram (Moong)), Tomato, Cream (Milk), Butter, Refined Sunflower Oil, Garlic, Ginger, Red Chilli Powder, Salt, Dried Fenugreek Leaves (Kasuri Methi).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Contains Milk. Manufactured in a facility that processes foods containing wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "126.35", "6.30%"],
          ["Protein (g)", "4.91", "8.90%"],
          ["Carbohydrate (g)", "12.3", "4.10%"],
          ["Total Sugars (g)", "2.01", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "6.39", "9.50%"],
          ["Saturated Fat (g)", "1.16", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "258.3", "12.90%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: ["amritsari-dal-makhani-bowl"],
  },
  "makhani-sauce": {
    heroTint: "#ef9f6c",
    heroImage: { src: "/products/pouches/makhani-sauce-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/makhani-sauce-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Rich tomato and cashew-based creamy gravy: just add your favourite ingredient and make a delicious makhani dish in minutes.",
    points: [
      { title: "Tomato & cashew", text: "A rich, creamy makhani base made with tomato, cashew nuts and butter." },
      { title: "One pouch, many dishes", text: "Vegetables, paneer, koftas, roasted chicken or cooked mutton: the pack's own suggestions." },
      { title: "Finish your way", text: "¼ cup fresh cream and a pinch of kasuri methi, crushed between your hands." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Heat & base.", text: "Heat 1 tablespoon of oil or butter in a clean pan." },
        { word: "Add gravy.", text: "Pour the entire pouch of Micky's Makhani Sauce into the pan. Cook on medium heat and bring to a gentle boil. Add a little water (2–4 tablespoons) if required to adjust consistency." },
        { word: "Add & cook.", text: "Add about 3–4 cups of your choice (vegetables, paneer, koftas, roasted chicken or cooked mutton). Mix well and simmer for 5–8 minutes. Serve hot with butter naan, jeera rice or laccha paratha. Finish with ¼ cup fresh cream and a pinch of kasuri methi (crushed between hands)." },
      ],
      tip: "Add 1 teaspoon of ginger-garlic paste at the time of tempering. Adjust the seasoning.",
    },
    details: [
      { label: "Ingredients", value: "Tomato, Onion, Refined Sunflower Oil, Butter, Refined Sugar, Cashew Nuts, Ginger, Garlic, Coconut (Desiccated), Red Chilli Powder, Iodised Salt, Spice Blend (Coriander Seeds, Cumin, Red Chillies, Turmeric, Black Pepper, Dried Ginger, Mustard, Fennel Seeds, Garlic, Cassia, Fenugreek Leaves, Cardamom, Cloves, Nutmeg, Green Cardamom, Mace, Asafoetida, Cinnamon).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Contains Milk, Tree Nuts (Cashew, Coconut), Mustard. Manufactured in a facility that also processes foods containing wheat, celery and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "178.49", "8.90%"],
          ["Protein (g)", "3.21", "5.80%"],
          ["Carbohydrate (g)", "13.67", "4.60%"],
          ["Total Sugars (g)", "8.4", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "12.33", "18.40%"],
          ["Saturated Fat (g)", "2.24", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "1723.93", "86.20%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: ["makhani-curry"],
  },
  "boiled-kabuli-chana": {
    heroTint: "#8fd0cc",
    heroImage: { src: "/products/pouches/boiled-kabuli-chana-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/boiled-kabuli-chana-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Boiled Kabuli Chana: pure, nutty goodness. Open it. Wash it. Cook it.",
    points: [
      { title: "Already cooked", text: "Chickpeas, water and salt: nothing else." },
      { title: "Open, rinse, use", text: "Add straight to your preparation after a rinse." },
      { title: "Best for", text: "Chole Masala, Chana Masala, Punjabi Chole, Chole Pulao, Mediterranean Chickpea Salad, Hummus, Falafel and Chana Chaat." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Open & rinse.", text: "Open the pack, transfer the Micky's Boiled Kabuli Chana into a bowl, and wash thoroughly with clean water." },
        { word: "Ready to use.", text: "The cooked kabuli chana is ready to be added directly to your preparation." },
        { word: "Cook & enjoy.", text: "Perfect for a variety of dishes and quick recipes." },
      ],
    },
    details: [
      { label: "Ingredients", value: "Water, Kabuli Chana (Chickpeas), Iodised Salt.", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "57.88", "2.90%"],
          ["Protein (g)", "2.11", "3.80%"],
          ["Carbohydrate (g)", "12.36", "4.10%"],
          ["Total Sugars (g)", "1.32", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "24.13", "1.20%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Chole Masala", "Chana Masala", "Punjabi Chole", "Chole Pulao", "Mediterranean Chickpea Salad", "Hummus", "Falafel", "Chana Chaat"],
  },
  "boiled-rajma": {
    heroTint: "#8fd0cc",
    heroImage: { src: "/products/pouches/boiled-rajma-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/boiled-rajma-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Perfectly cooked rajma: soft, creamy and firm to the bite. Simply open, heat and serve.",
    points: [
      { title: "Already cooked", text: "Kidney beans, water and salt: nothing else." },
      { title: "Open, rinse, use", text: "Add straight to your preparation after a rinse." },
      { title: "Best for", text: "Rajma Masala, Quesadilla, Tacos, Rajma Tikki, Kidney Bean Salad, Mexican Rice and Mexican Patty." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Open & rinse.", text: "Open the pack, transfer the Micky's Boiled Rajma (kidney beans) into a bowl, and wash thoroughly with clean water." },
        { word: "Ready to use.", text: "The cooked rajma is ready to be added directly to your preparation." },
        { word: "Cook & enjoy.", text: "Perfect for a variety of Indian and fusion dishes." },
      ],
    },
    details: [
      { label: "Ingredients", value: "Water, Kidney Beans (Rajma), Iodised Salt.", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "54.63", "2.70%"],
          ["Protein (g)", "3.51", "6.40%"],
          ["Carbohydrate (g)", "9.45", "3.20%"],
          ["Total Sugars (g)", "1.29", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "0.31", "0.50%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "8.36", "0.40%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Rajma Masala", "Quesadilla", "Tacos", "Rajma Tikki", "Kidney Bean Salad", "Mexican Rice", "Mexican Patty"],
  },
  "boiled-kala-chana": {
    heroTint: "#8fd0cc",
    heroImage: { src: "/products/pouches/boiled-kala-chana-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/boiled-kala-chana-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Boiled black Bengal gram: real earthy flavour, no shortcuts. Open it. Wash it. Cook it. Win the meal.",
    points: [
      { title: "Already cooked", text: "Black chickpeas, water and salt: nothing else." },
      { title: "No cooking needed", text: "A quick rinse, then add it straight to your recipe." },
      { title: "Best for", text: "Black Chana Masala, Kala Chana Pulao, Rajasthani Dahi Chane, Kadala Curry, Kala Chana Chaat, Chana Stir-Fry, Chana Quesadilla, Chana & Avocado Toast and pani puri." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Open & rinse.", text: "Open the pack, pour the Micky's Boiled Kala Chana into a bowl, and give it a quick rinse with clean water." },
        { word: "Ready to use.", text: "No cooking needed: add it straight to your recipe." },
        { word: "Cook & enjoy.", text: "Use it in your favourite dishes and get cooking instantly." },
      ],
    },
    details: [
      { label: "Ingredients", value: "Water, Black Chana (Black Chickpeas), Iodised Salt.", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "48.08", "2.40%"],
          ["Protein (g)", "2.21", "4.00%"],
          ["Carbohydrate (g)", "9.81", "3.30%"],
          ["Total Sugars (g)", "1.14", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "15.59", "0.80%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Black Chana Masala", "Kala Chana Pulao", "Rajasthani Dahi Chane", "Kadala Curry", "Kala Chana Chaat", "Chana Stir-Fry", "Chana Quesadilla", "Chana & Avocado Toast", "Pani Puri"],
  },
  "boiled-toor-dal": {
    heroTint: "#8fd0cc",
    heroImage: { src: "/products/pouches/boiled-toor-dal-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/boiled-toor-dal-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Perfectly cooked toor dal. Just heat, add your favourite seasoning, and enjoy a wholesome, delicious meal in minutes.",
    points: [
      { title: "Already cooked", text: "Split pigeon pea and water: nothing else." },
      { title: "Temper & heat", text: "A jeera tadka, then the dal, and it's ready." },
      { title: "Best for", text: "Dal Tadka, Dal Fry, Dal Biryani, Dal Paratha, Plain Jeera Dal, Sambar, Tomato Pappu or Khichdi." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Heat & temper.", text: "Heat oil in a pan. Add whole cumin seeds (jeera) and let them crackle." },
        { word: "Add the base.", text: "Add the Toor Dal and mix well. Cook over medium heat until thoroughly heated." },
        { word: "Finish & serve.", text: "Add turmeric and salt as required, finish with ghee and freshly chopped coriander. Mix well and serve hot." },
      ],
    },
    details: [
      { label: "Ingredients", value: "Water, Split Pigeon Pea (Toor Dal).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "68.84", "3.40%"],
          ["Protein (g)", "6.52", "11.90%"],
          ["Carbohydrate (g)", "10.69", "3.60%"],
          ["Total Sugars (g)", "1.35", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "8.87", "0.40%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Dal Tadka", "Dal Fry", "Dal Biryani", "Dal Paratha", "Plain Jeera Dal", "Sambar", "Tomato Pappu", "Khichdi"],
  },
  "garlic-paste": {
    heroTint: "#e58f7c",
    heroImage: { src: "/products/pouches/garlic-paste-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/garlic-paste-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Fresh garlic, blended for instant aroma and rich flavour. A ready-to-use paste that saves time and elevates every dish.",
    points: [
      { title: "Fresh garlic", text: "Blended for instant aroma and rich flavour." },
      { title: "Ready to use", text: "No peeling, no chopping: straight into the pan." },
      { title: "Keeps a week", text: "Once open, refrigerate and use within 7 days." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Garlic, Water, Iodised Salt, Acidity Regulators (INS 260, INS 330), Preservatives (INS 211, INS 202).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "80.2", "4.00%"],
          ["Protein (g)", "3.02", "5.50%"],
          ["Carbohydrate (g)", "17.03", "5.70%"],
          ["Total Sugars (g)", "11.07", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "714.1", "35.70%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool, dry place. Once open, refrigerate and use within 7 days. Do not consume if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
  },
  "ginger-garlic-paste": {
    heroTint: "#e58f7c",
    heroImage: { src: "/products/pouches/ginger-garlic-paste-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/ginger-garlic-paste-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Fresh ginger and garlic, blended for instant aroma and rich flavour. A ready-to-use paste that saves time and elevates every dish.",
    points: [
      { title: "Fresh ginger & garlic", text: "Blended for instant aroma and rich flavour." },
      { title: "Ready to use", text: "No peeling, no chopping: straight into the pan." },
      { title: "Keeps a week", text: "Once open, refrigerate and use within 7 days." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Ginger, Garlic, Water, Iodised Salt, Acidity Regulators (INS 260, INS 330), Preservatives (INS 211, INS 202).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "57.44", "2.90%"],
          ["Protein (g)", "2.39", "4.30%"],
          ["Carbohydrate (g)", "11.97", "4.00%"],
          ["Total Sugars (g)", "5.23", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "1004.5", "50.20%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool, dry place. Once open, refrigerate and use within 7 days. Do not consume if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
  },
  "ginger-paste": {
    heroTint: "#e8a070",
    heroImage: { src: "/products/pouches/ginger-paste-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/ginger-paste-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Fresh ginger blended for instant aroma and rich flavour. A ready-to-use paste that saves time and elevates every dish.",
    points: [
      { title: "Fresh ginger", text: "Blended for instant aroma and rich flavour." },
      { title: "Ready to use", text: "No peeling, no grating: straight into the pan." },
      { title: "Keeps a week", text: "Once open, refrigerate and use within 7 days." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Ginger, Water, Iodised Salt, Acidity Regulators (INS 260, INS 330), Preservatives (INS 211, INS 202).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "31.92", "1.60%"],
          ["Protein (g)", "0.86", "1.60%"],
          ["Carbohydrate (g)", "7.12", "2.40%"],
          ["Total Sugars (g)", "2.24", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "<0.1", "<0.2%"],
          ["Saturated Fat (g)", "0", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "973.18", "48.70%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool, dry place. Once open, refrigerate and use within 7 days. Do not consume if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
  },
  "tomato-ketchup": {
    heroTint: "#c98a8a",
    heroImage: { src: "/products/pouches/tomato-ketchup-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/tomato-ketchup-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A hot and sweet tomato ketchup with a rich texture and balanced blend of spices, perfect for snacks.",
    points: [
      { title: "Hot & sweet", text: "Tomato with garlic, onion and red chilli for a little heat." },
      { title: "Rich texture", text: "A thick ketchup that holds on snacks." },
      { title: "Keeps a week", text: "Once open, refrigerate and use within 7 days." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Water, Tomato Paste (27%), Sugar, Salt, Mixed Spices and Condiments (Garlic Powder, Onion Powder, Red Chilli Powder), Acidity Regulator (INS 330), Stabilizer (INS 415), Raising Agent (INS 500(ii)).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy", "118 kcal", "5.90%"],
          ["Protein", "1.3 g", "2.40%"],
          ["Carbohydrate", "28.5 g", "–"],
          ["Total Sugars", "22.0 g", "–"],
          ["Added Sugars", "19.5 g", "39.00%"],
          ["Total Fat", "0.2 g", "0.30%"],
          ["Saturated Fat", "0.0 g", "–"],
          ["Trans Fat", "0.0 g", "–"],
          ["Sodium", "290 mg", "14.50%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool, dry place. Once open, refrigerate and use within 7 days. Do not consume if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
  },
  "imli-chutney": {
    heroTint: "#b98aa8",
    heroImage: { src: "/products/pouches/imli-chutney-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/imli-chutney-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A balanced blend of ripe tamarind, sweetness, and gentle spices. Tangy, mildly sweet, and smooth in texture, made to complement Indian snacks and chaat. A classic dip that brings every bite together.",
    points: [
      { title: "Tangy & sweet", text: "Ripe tamarind with gentle spices, smooth in texture." },
      { title: "Open. Serve. Enjoy.", text: "Drizzle over snacks, dollop on chaats, or mix into your favourite dishes." },
      { title: "Bonus", text: "Works great as a dip, sandwich spread or salad enhancer." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Refined Sugar, Water, Tamarind Pulp, Iodised Salt, Mixed Spices & Condiments (Garam Masala, Cumin Powder, Black Pepper Powder, Ginger Powder, Black Salt, Deggi Mirch, Red Chilli Powder, Fennel Powder), Preservative (INS 211).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "250", "12.50%"],
          ["Protein (g)", "1.2", "2.20%"],
          ["Carbohydrate (g)", "61", "20.30%"],
          ["Total Sugars (g)", "52", "–"],
          ["Added Sugar (g)", "50", "100%"],
          ["Dietary Fibre (g)", "1.5", "5.00%"],
          ["Total Fat (g)", "0.2", "0.30%"],
          ["Saturated Fat (g)", "–", "–"],
          ["Trans Fat (g)", "–", "–"],
          ["Cholesterol (mg)", "–", "–"],
          ["Sodium (mg)", "850", "42.50%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool, dry place. Once open, refrigerate. Do not consume if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Chaats", "Pakoras", "Samosas", "Sandwiches", "Wraps"],
  },
  "punjabi-bhuna-masala": {
    heroTint: "#dca08c",
    heroImage: { src: "/products/pouches/punjabi-bhuna-masala-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/punjabi-bhuna-masala-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A slow-cooked onion-tomato base with a blend of spices: a ready-to-use masala. The perfect mother sauce for classic Indian recipes.",
    points: [
      { title: "A mother sauce", text: "The pack calls it the perfect mother sauce for classic Indian recipes." },
      { title: "Tadka, curries, gravies", text: "A ready base for tadka, curries, gravies and classic Indian preparations." },
      { title: "Ideal for", text: "Chole Masala, Homestyle Paneer, Soya Chaap, Egg Masala, Bhuna Chicken and Homestyle Mutton Masala." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Onion, Tomato, Refined Sunflower Oil, Ginger, Garlic, Iodised Salt, Coriander Powder, Red Chilli Powder, Cumin Seeds and Turmeric Powder.", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Manufactured in a facility that processes foods containing milk, wheat, mustard, celery, tree nuts and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "206.25", "10.30%"],
          ["Protein (g)", "1.86", "3.40%"],
          ["Carbohydrate (g)", "13.86", "4.60%"],
          ["Total Sugars (g)", "7.53", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "15.93", "23.80%"],
          ["Saturated Fat (g)", "2.9", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "621.86", "31.10%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Chole Masala", "Homestyle Paneer", "Soya Chaap", "Egg Masala", "Bhuna Chicken", "Homestyle Mutton Masala"],
  },
  // Pack: "Pizza Sauce (Handpicked Tomatoes)". No cooking steps on the pack, so no How to Use section.
  "pizza-sauce": {
    heroTint: "#eea98f",
    heroImage: { src: "/products/pouches/pizza-sauce-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/pizza-sauce-back.webp", width: 1000, height: 1340 },
    statement: ["The sauce is ready.", "The pizza is yours."],
    summary: "A slow-cooked sauce made with fresh tomatoes and real spices for a well-balanced flavour.",
    points: [
      { title: "Handpicked tomatoes", text: "Slow-cooked with fresh tomatoes and real spices for a well-balanced flavour." },
      { title: "Herbs & spices", text: "Oregano and basil, with chilli flakes, black pepper and bay leaf." },
      { title: "Best used for", text: "Pizzas, pasta, calzones, Mexican dishes, pizza bases, pasta sauces, lasagna, baked dishes and sandwich spreads." },
    ],
    howToUse: null,
    details: [
      { label: "Ingredients", value: "Tomato, Water, Refined Sunflower Oil, Refined Sugar, Garlic, Celery, Leeks, Iodised Salt, Herbs (Oregano, Basil), Spices (Chilli Flakes, Black Pepper, Bay Leaf).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Contains Celery. Manufactured in a facility that processes foods containing milk, wheat, mustard, peanuts and tree nuts.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "85", "4.20%"],
          ["Protein (g)", "1.5", "3.00%"],
          ["Carbohydrate (g)", "14.5", "5.50%"],
          ["Total Sugars (g)", "8", "–"],
          ["Added Sugar (g)", "2.2", "4.40%"],
          ["Total Fat (g)", "3", "4.50%"],
          ["Saturated Fat (g)", "0.4", "2.00%"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "300", "15.00%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: [],
    moreDishes: ["Pizzas", "Pasta", "Calzones", "Lasagna", "Baked dishes", "Sandwich spreads"],
  },

  // ------------------------------------------------------------------ Malabar Curry
  // Transcribed from the pack (front + back label artwork). NOTE for the pack team: the description
  // says "fresh coconut milk" while the ingredients list "Coconut Milk Powder"; shown as printed.
  "malabar-curry": {
    heroTint: "#f0d27a", // the pack's yellow, softened
    heroImage: { src: "/products/pouches/malabar-curry-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/malabar-curry-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A coastal-style curry made with spices, fresh coconut milk, tomatoes, and a touch of tamarind. Just heat and stir for a warm, comforting Malabar-style meal.",
    points: [
      { title: "Coastal-style base", text: "Spices, coconut, tomatoes and a touch of tamarind, already cooked into the gravy." },
      { title: "One pouch, many dishes", text: "Chicken, fish, prawns, vegetables or paneer: the pack's own suggestions." },
      { title: "Finish your way", text: "Fresh curry leaves and a drizzle of coconut milk to finish." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Prepare & heat.", text: "Heat 2 tsp oil in a pan and add 8–10 curry leaves, then pour in Micky's Malabar gravy with 2 cups water and stir well." },
        { word: "Add & cook.", text: "Add your choice of about 3 cups of chicken, fish, prawns, vegetables or paneer and simmer until fully cooked and flavourful." },
        { word: "Serve & enjoy.", text: "Serve hot with rice, appams or flatbreads for perfect coastal-style comfort. Garnish with fresh curry leaves and a drizzle of coconut milk." },
      ],
      tip: "Add 2–3 tbsp coconut milk at the end and simmer for a minute to enhance the authentic Malabari flavour and give it a rich, smooth finish.",
    },
    details: [
      {
        label: "Ingredients",
        value: "Onion, Tomato, Water, Refined Sunflower Oil, Coconut Milk Powder, Desiccated Coconut, Tamarind Pulp, Ginger and Garlic, Peanut, Salt, Red Chilli Powder, Coriander Seeds, Cinnamon, Cumin Seeds, Black Pepper, Cloves, Bay Leaves, Curry Leaves, Mustard Seeds, Turmeric Powder, Cumin Powder.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Allergen information",
        value: "Contains Peanut, Mustard, Coconut. Manufactured in a facility that also processes foods containing milk, wheat, celery and tree nut components.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "241.09", "12.10%"],
          ["Protein (g)", "2.67", "4.90%"],
          ["Carbohydrate (g)", "13.39", "4.50%"],
          ["Total Sugars (g)", "6.12", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "19.65", "29.30%"],
          ["Saturated Fat (g)", "3.57", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "700.56", "35.00%"],
        ],
        status: "verified",
        source: "pack",
      },
      {
        label: "Storage",
        value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Manufacturer",
        value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in",
        status: "verified",
        source: "pack",
      },
    ],
    recipeSlugs: ["malabar-curry-your-way"],
    moreDishes: ["Chicken", "Fish", "Prawns", "Vegetables", "Paneer"],
  },
  "white-gravy-base": {
    heroTint: "#ecd48e", // the pack's yellow, softened
    heroImage: { src: "/products/pouches/white-gravy-base-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/white-gravy-base-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Velvety white gravy with a rich, creamy body and deep savoury flavour, made with onion, cashew nut, ginger, garlic, green chilli, white pepper and green cardamom.",
    points: [
      { title: "Rich & creamy", text: "A velvety white gravy with a rich, creamy body and deep savoury flavour." },
      { title: "One pouch, many dishes", text: "Vegetables, paneer, chicken or mutton: the pack's own suggestions." },
      { title: "Finish your way", text: "Fresh cream, a pinch of white pepper or a small knob of butter." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Heat & base.", text: "Heat 1 tbsp oil in a pan, then add Micky's White Gravy Base and mix well." },
        { word: "Add & cook.", text: "Add your choice of about 2–3 cups cooked vegetables, paneer, chicken or mutton and simmer for a few minutes until well coated and heated through." },
        { word: "Finish & serve.", text: "Garnish with 2–3 tbsp fresh cream and serve hot with naan, roti or rice. Add a pinch of white pepper or a small knob of butter to garnish." },
      ],
      tip: "Add 1 tsp ginger-garlic paste and sauté until aromatic for more freshness.",
    },
    details: [
      { label: "Ingredients", value: "Water, Onion, Cashew Nut, Refined Sunflower Oil, Ginger, Garlic, Refined Sugar, Iodised Salt, Melon Seeds, Green Chilli, White Pepper, Green Cardamom.", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Contains Milk and Tree Nuts (Cashew). Manufactured in a facility that processes foods containing wheat, celery, peanut and mustard components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "156", "8%"],
          ["Protein (g)", "4.6", "9%"],
          ["Carbohydrate (g)", "10.2", "–"],
          ["Total Sugars (g)", "2.8", "–"],
          ["Added Sugar (g)", "0.5", "1%"],
          ["Total Fat (g)", "10.8", "16%"],
          ["Saturated Fat (g)", "4.8", "22%"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "14", "5%"],
          ["Sodium (mg)", "275", "14%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: ["white-gravy-curry"],
  },
  "yellow-gravy-base": {
    heroTint: "#efcc72", // the pack's yellow, softened
    heroImage: { src: "/products/pouches/yellow-gravy-base-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/yellow-gravy-base-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A smooth, creamy blend of onion, cashew and aromatic spices, gently cooked for a rich texture and golden colour.",
    points: [
      { title: "Smooth & golden", text: "Onion, cashew and aromatic spices, gently cooked for a rich texture and golden colour." },
      { title: "One pouch, many dishes", text: "Vegetables, paneer, koftas, chicken or cooked mutton: the pack's own suggestions." },
      { title: "Finish your way", text: "Fresh cream stirred in, and a pinch of kasuri methi to garnish." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated); Cumulative Retort PDF",
      steps: [
        { word: "Heat & base.", text: "Heat 1 tbsp oil or butter in a pan, then pour in Micky's Yellow Gravy Base and bring to a gentle boil (add a little water if needed)." },
        { word: "Add & cook.", text: "Add about 3–4 cups vegetables, paneer, koftas, chicken or cooked mutton and simmer for 5–8 minutes until well coated and cooked through." },
        { word: "Finish & serve.", text: "Stir in ¼ cup fresh cream and mix well, and serve hot with butter naan, jeera rice or laccha paratha. Garnish with a pinch of kasuri methi." },
      ],
      tip: "Add 1 tbsp ginger-garlic paste at the time of tempering and sauté until fragrant. Also, crush kasuri methi between your palms and finish with a small knob of butter for a rich, restaurant-style taste.",
    },
    details: [
      { label: "Ingredients", value: "Onion, Water, Melon Seeds, Cashewnut, Tomato, Ginger & Garlic, Refined Sunflower Oil, Iodised Salt, Red Chilli Powder, Spice Blend (Cumin Powder, Turmeric Powder, Coriander Seeds, Cumin, Red Chillies, Black Pepper, Dried Ginger, Mustard Seeds, Fennel Seeds, Garlic, Cassia, Fenugreek Leaves, Cardamom, Cloves, Nutmeg, Green Cardamom, Mace, Asafoetida, Cinnamon, Bay Leaf).", status: "verified", source: "pack" },
      { label: "Allergen information", value: "Contains Tree Nuts (Cashew Nut) and Mustard. Manufactured in a facility that processes foods containing wheat, milk, celery and peanut components.", status: "verified", source: "pack" },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "141.99", "7.10%"],
          ["Protein (g)", "4.71", "8.60%"],
          ["Carbohydrate (g)", "10.02", "3.30%"],
          ["Total Sugars (g)", "4.49", "–"],
          ["Added Sugar (g)", "<0.5", "–"],
          ["Total Fat (g)", "9.23", "13.80%"],
          ["Saturated Fat (g)", "2.52", "–"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "0", "–"],
          ["Sodium (mg)", "565.1", "28.30%"],
        ],
        status: "verified",
        source: "pack",
      },
      { label: "Storage", value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.", status: "verified", source: "pack" },
      { label: "Manufacturer", value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in", status: "verified", source: "pack" },
    ],
    recipeSlugs: ["yellow-gravy-curry"],
  },

  // ------------------------------------------------------------------ Tangy Malai Gravy (Jain)
  // Transcribed from the pack (front + back label artwork, Sep 2026). NOTE for the pack team: the
  // nutrition table says "Added Sugar 0 g" while the ingredients list "Refined Sugar"; shown as printed.
  // Not shown until confirmed (hard to read on the artwork): FSSAI licence number, feedback phone number.
  "tangy-malai-gravy": {
    heroTint: "#c6d7a0", // the pack's green, softened into the cream palette
    heroImage: { src: "/products/pouches/tangy-malai-gravy-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/tangy-malai-gravy-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "Perfect for Jains: a creamy, rich, tangy malai base made with tomatoes, cashews and mild spices. Just heat, mix and flex!",
    points: [
      { title: "Perfect for Jains", text: "A creamy, rich, tangy malai base of tomatoes, cashews and mild spices, labelled Jain on the pack." },
      { title: "One pouch, many dishes", text: "Vegetables, veg koftas or paneer: the pack's own suggestions." },
      { title: "Finish your way", text: "A spoon of cream, a drizzle of ghee and a pinch of crushed kasuri methi." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Pour & heat.", text: "Empty the pouch into a clean pan and cook on medium heat until it comes to a gentle boil." },
        { word: "Add & mix.", text: "Add your choice of about 2–3 cups of vegetables, veg koftas or paneer and stir gently." },
        { word: "Finish & serve.", text: "Add 1 tbsp cream and a drizzle of ghee, and mix until rich and smooth. Serve hot with roti, naan or rice for perfect Jain-style indulgence." },
      ],
      tip: "Add a pinch of kasuri methi (crushed) along with the cream to enhance aroma and give it a richer, restaurant-style flavour.",
    },
    details: [
      {
        label: "Ingredients",
        value: "Tomato, Water, Butter, Refined Sugar, Cream (Milk), Iodised Salt, Cashew Nuts, Melon Seeds, Refined Sunflower Oil, Spice Blend (Cumin Powder, Red Chilli Powder, Coriander Powder, Cinnamon, Black Pepper, Cloves, Cardamom, Mace, Nutmeg, Bay Leaves), Coconut Powder, Kasuri Methi (Dried Fenugreek Leaves).",
        status: "verified",
        source: "pack",
      },
      {
        label: "Allergen information",
        value: "Contains Milk, Tree Nuts (Cashew), Coconut. Manufactured in a facility that also processes foods containing wheat, mustard, celery and peanut components.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "140", "7%"],
          ["Protein (g)", "3", "5%"],
          ["Carbohydrate (g)", "7", "–"],
          ["Total Sugars (g)", "3.5", "–"],
          ["Added Sugar (g)", "0", "–"],
          ["Total Fat (g)", "10", "15%"],
          ["Saturated Fat (g)", "5", "23%"],
          ["Trans Fat (g)", "0", "–"],
          ["Cholesterol (mg)", "15", "–"],
          ["Sodium (mg)", "180", "9%"],
        ],
        status: "verified",
        source: "pack (note: 'Added Sugar 0' vs 'Refined Sugar' in ingredients: confirm with the pack team)",
      },
      {
        label: "Storage",
        value: "Store in a cool and dry place. Refrigerate after opening and consume within 2 days. Do not use if the pouch is leaking, damaged or bloated.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Manufacturer",
        value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality.",
        status: "verified",
        source: "pack",
      },
    ],
    recipeSlugs: ["tangy-malai-curry"],
    moreDishes: ["Vegetables", "Veg koftas", "Paneer"],
  },

  // ------------------------------------------------------------------ Brown Masala Gravy
  // Every value below is transcribed from the pack (front + back label artwork, Sep 2026).
  "brown-masala-gravy": {
    heroTint: "#d9a47f", // browned-onion warmth, within the maroon/yellow palette
    heroImage: { src: "/products/pouches/brown-masala-gravy-hero.webp", width: 1000, height: 1340 },
    backImage: { src: "/products/pouches/brown-masala-gravy-back.webp", width: 1000, height: 1340 },
    statement: ["The base is ready.", "The finish is yours."],
    summary: "A rich and flavorful onion-based gravy made from browned onions, tomatoes, cashew nuts, melon seeds, and aromatic Indian spices.",
    points: [
      { title: "Browned onion base", text: "Browned onions, tomatoes, cashew nuts and melon seeds, already cooked into the gravy." },
      { title: "One pouch, many dishes", text: "Vegetables, paneer, koftas, chicken or cooked mutton: the pack's own suggestions." },
      { title: "Finish your way", text: "Fresh cream, garam masala and kasuri methi to finish; a small cube of butter for a glossy finish." },
    ],
    howToUse: {
      status: "verified",
      source: "pack: back label cooking instructions (verbatim, lightly punctuated)",
      steps: [
        { word: "Heat & base.", text: "Heat 1 tbsp oil or butter in a pan. Pour in Micky's Brown Gravy and bring to a gentle boil. Add a little water if required to adjust the consistency." },
        { word: "Add & cook.", text: "Add about 3–4 cups of vegetables, paneer, koftas, chicken or cooked mutton, and simmer for 5–8 minutes, stirring occasionally, until well coated and cooked through." },
        { word: "Finish & serve.", text: "Stir in ¼ cup fresh cream (optional). Add ½ tsp garam masala and 1 tsp kasuri methi. Mix well and simmer for 1 minute. Serve hot with butter naan, jeera rice or lachha paratha." },
      ],
      tip: "Use fresh seasonal vegetables for the best flavour and texture. For a richer variation, add paneer cubes or mushrooms. Finish with a small cube of butter for a glossy finish.",
    },
    details: [
      {
        label: "Ingredients",
        value: "Water, Brown Onion, Char Magaz (Melon Seeds), Tomato, Cashew Nuts, Refined Sunflower Oil, Garlic, Ginger, Salt, Spice Blend (Coriander Seeds, Cumin, Red Chillies, Turmeric, Black Pepper, Dried Ginger, Mustard, Fennel Seeds, Garlic, Cassia, Fenugreek Leaves, Cardamom, Cloves, Nutmeg, Green Cardamom, Mace, Asafoetida, Cinnamon), Bay Leaf, Black Cardamom, Black Cumin (Shahi Jeera).",
        status: "verified",
        source: "pack",
      },
      {
        label: "Allergen information",
        value: "Contains Tree Nuts (Cashew). Manufactured in a facility that also processes products containing Milk, Wheat, Celery, Mustard, and Peanuts.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Nutrition",
        value: "Nutritional information per 100 g.",
        table: [
          ["", "Per 100 g", "%RDA"],
          ["Energy (kcal)", "145", "7%"],
          ["Protein (g)", "2.8", "–"],
          ["Total Carbohydrate (g)", "11.5", "–"],
          ["Total Sugars (g)", "4.2", "–"],
          ["Added Sugar (g)", "0", "0%"],
          ["Total Fat (g)", "10.2", "15%"],
          ["Saturated Fat (g)", "1.6", "7%"],
          ["Trans Fat (g)", "<0.1", "–"],
          ["Sodium (mg)", "560", "28%"],
        ],
        status: "verified",
        source: "pack",
      },
      {
        label: "Storage",
        value: "Store in a cool, dry place. Once open, refrigerate and use within 2 days. Do not consume if the pouch is leaking, damaged or bloated.",
        status: "verified",
        source: "pack",
      },
      {
        label: "Manufacturer",
        value: "Manufactured / marketed by Centre Point Foods Private Limited, FP-55 & FP-56, Five Star Industrial Area, Butibori MIDC, Nagpur, Maharashtra 441122. A product of Centre Point Hospitality. FSSAI Lic. No. 11525056000326. Feedback: +91 92719 73474 / cpfoods@cpgh.in",
        status: "verified",
        source: "pack",
      },
    ],
    recipeSlugs: ["brown-masala-curry"],
    moreDishes: ["Vegetables", "Paneer", "Koftas", "Chicken", "Cooked mutton"],
  },

  "makhani-gravy": {
    heroTint: "#eba48f", // warm tomato
    heroImage: { src: "/products/gravies/makhani-gravy-hero.webp", width: 684, height: 1013 }, // v3 Blender render
    statement: ["The base is ready.", "The finish is yours."],
    // deck: "A rich, buttery tomato-cashew base. Temper, add your protein, finish with cream — one base, an entire makhani menu."
    summary: "A rich, buttery tomato-cashew base. Temper, add your protein, finish with cream: one base, an entire makhani menu.",
    points: [
      { title: "One base, many dishes", text: "Paneer Makhani, Butter Chicken, Veg Makhani and more, all from the same pouch." },
      { title: "Start at the finish", text: "The makhani base is already made, so your time goes into the dish, not the prep." },
      { title: "Finish your way", text: "A little sugar for a sweeter, richer profile. Red chilli for more heat. Cream or butter to finish." },
    ],
    howToUse: {
      status: "verified",
      source: "deck (Makhani Gravy method), condensed; confirm against the pack instructions",
      steps: [
        { word: "Heat.", text: "Warm butter, oil or desi ghee in a pan on medium flame. Add a little red chilli powder and a pinch of salt." },
        { word: "Add.", text: "Add Micky's Makhani Gravy and mix well. Cook on low–medium heat, stirring occasionally." },
        { word: "Simmer.", text: "Add paneer or your protein and mix gently. Simmer a few minutes so it takes in the gravy." },
        { word: "Finish.", text: "Adjust with a little water or cream. Finish with butter or fresh cream, and serve." },
      ],
    },
    details: [
      { label: "Ingredients", value: "Tomatoes, cashews, onions, butter, spices and salt", status: "pending", source: "site (old product data): verify against the pack label" },
      { label: "Storage", value: null, status: "pending", source: "awaiting pack data" },
      { label: "Shelf life", value: null, status: "pending", source: "awaiting pack data" },
      { label: "Nutrition", value: null, status: "pending", source: "awaiting pack data" },
      { label: "Allergen information", value: null, status: "pending", source: "awaiting pack data" },
    ],
    recipeSlugs: ["paneer-makhani", "butter-chicken"],
    moreDishes: ["Veg Makhani", "Mushroom Makhani", "Egg Makhani", "Chicken Tikka Makhani", "Kofta Makhani", "Soya Chaap Makhani", "Malai Kofta Makhani", "Fish Makhani", "Prawn Makhani"],
  },
};
