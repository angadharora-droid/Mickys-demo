// Product data. Copy comes from the packs; sizes and MRPs (₹, inclusive of GST 5%) from the Micky's B2C MRP card,
// w.e.f. 04/09/2026 (Nagpur pilot, 16 live SKUs). Products not on that card have no sizes: shown, not orderable.
// The previous range is archived in data/archivedProducts.ts. Later WooCommerce supplies ids/stock without UI changes.

export type CategoryId = "gravies" | "pastes" | "grains";

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  /** One short line. Taken from existing Micky's product copy where it exists. */
  descriptor: string;
  /** Retail pack sizes. The first is selected by default. */
  sizes: ProductSize[];
  /** null until live WooCommerce prices are connected: never shown as a guess. */
  price: number | null;
  image: string; // transparent pack render
  imageWidth: number;
  imageHeight: number;
  /** Subtle background tint while this product is active. */
  tint: string;
  /** Temporary copy that still needs sign-off. */
  copyPending?: boolean;
  // --- filled by WooCommerce later (see lib/products.ts); hidden while null/absent ---
  id?: number | null;
  salePrice?: number | null;
  stockStatus?: "instock" | "outofstock" | "onbackorder" | null;
  /** product page sections */
  details?: string[] | null;
  howToUse?: string[] | null;
};

export type ProductSize = {
  label: string; // e.g. "250 g"
  /** WooCommerce variation id, connected later. */
  variationId: number | null;
  /** MRP in rupees for this size (inclusive of GST); null/absent = not priced, never guessed */
  price?: number | null;
};

// Sizes + MRP (₹) per the B2C MRP card, w.e.f. 04/09/2026
const size = (label: string, price: number): ProductSize => ({ label, variationId: null, price });
const MRP: Record<string, ProductSize[]> = {
  // pulses & dal
  "boiled-kala-chana": [size("250 g", 80)],
  "boiled-kabuli-chana": [size("250 g", 90)],
  "boiled-rajma": [size("250 g", 90)],
  "boiled-toor-dal": [size("250 g", 100)],
  // gravies
  "brown-masala-gravy": [size("250 g", 175)], // card: "Brown Gravy"
  "yellow-gravy-base": [size("250 g", 185)],
  "makhani-sauce": [size("250 g", 199)],
  "punjabi-bhuna-masala": [size("250 g", 200)],
  // paste
  "ginger-garlic-paste": [size("200 g", 40), size("500 g", 90)],
  // sauces & dips
  "tomato-ketchup": [size("200 g", 60), size("500 g", 75)],
  "imli-chutney": [size("200 g", 60), size("500 g", 149)],
  "pizza-sauce": [size("250 g", 85)],
  // ready meals
  "amritsari-dal-makhani": [size("250 g", 200)],
};
/** not on the MRP card (Tangy Malai, Malabar, White Gravy, Garlic Paste, Ginger Paste) -> no sizes, not orderable */
const sizesFor = (slug: string): ProductSize[] => MRP[slug] ?? [];

export type Category = { id: CategoryId; label: string; available: boolean };

export const CATEGORIES: Category[] = [
  { id: "gravies", label: "Gravies", available: true },
  { id: "pastes", label: "Pastes & Sauces", available: true },
  { id: "grains", label: "Grains & Pulses", available: true },
];

export const PRODUCTS: Product[] = [
  {
    slug: "brown-masala-gravy",
    name: "Brown Masala Gravy",
    category: "gravies",
    // pack copy, condensed: "A rich and flavorful onion-based gravy made from browned onions, tomatoes,
    // cashew nuts, melon seeds, and aromatic Indian spices."
    descriptor: "A rich, onion-based gravy of browned onions, tomatoes, cashew nuts, melon seeds and aromatic Indian spices.",
    sizes: sizesFor("brown-masala-gravy"),
    price: null,
    image: "/products/pouches/brown-masala-gravy.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#ecd2b6",
  },
  {
    slug: "tangy-malai-gravy",
    name: "Tangy Malai Gravy",
    category: "gravies",
    // pack copy: "Perfect for Jains — A creamy, rich, tangy malai base made with tomatoes, cashews, and mild spices."
    descriptor: "Perfect for Jains: a creamy, rich, tangy malai base made with tomatoes, cashews and mild spices.",
    sizes: sizesFor("tangy-malai-gravy"),
    price: null,
    image: "/products/pouches/tangy-malai-gravy.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#dde6c4",
  },
  {
    slug: "malabar-curry",
    name: "Malabar Curry",
    category: "gravies",
    // pack copy: "A coastal-style curry made with spices, fresh coconut milk, tomatoes, and a touch of tamarind."
    descriptor: "A coastal-style curry made with spices, coconut, tomatoes and a touch of tamarind.",
    sizes: sizesFor("malabar-curry"),
    price: null,
    image: "/products/pouches/malabar-curry.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f6e6ae",
  },
  {
    slug: "white-gravy-base",
    name: "White Gravy Base",
    category: "gravies",
    // pack copy: "Velvety white gravy with a rich, creamy body and deep savoury flavour."
    descriptor: "Velvety white gravy with a rich, creamy body and deep savoury flavour.",
    sizes: sizesFor("white-gravy-base"),
    price: null,
    image: "/products/pouches/white-gravy-base.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f1e2bf",
  },
  {
    slug: "yellow-gravy-base",
    name: "Yellow Gravy Base",
    category: "gravies",
    // pack copy: "A smooth, creamy blend of onion, cashew, and aromatic spices. Gently cooked for a rich texture and golden colour."
    descriptor: "A smooth, creamy blend of onion, cashew and aromatic spices, gently cooked for a rich texture and golden colour.",
    sizes: sizesFor("yellow-gravy-base"),
    price: null,
    image: "/products/pouches/yellow-gravy-base.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f3d9a0",
  },
  {
    slug: "punjabi-bhuna-masala",
    name: "Punjabi Bhuna Masala",
    category: "gravies",
    // pack copy: "A slow-cooked onion-tomato base with a blend of spices - ready-to-use masala."
    descriptor: "A slow-cooked onion-tomato base with a blend of spices: a ready-to-use masala.",
    sizes: sizesFor("punjabi-bhuna-masala"),
    price: null,
    image: "/products/pouches/punjabi-bhuna-masala.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#ecc9b8",
  },
  {
    slug: "pizza-sauce",
    name: "Pizza Sauce",
    category: "pastes",
    // pack: "Pizza Sauce (Handpicked Tomatoes)" / "A slow-cooked sauce made with fresh tomatoes and real spices for a well-balanced flavour."
    descriptor: "A slow-cooked sauce made with fresh tomatoes and real spices for a well-balanced flavour.",
    sizes: sizesFor("pizza-sauce"),
    price: null,
    image: "/products/pouches/pizza-sauce.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f3c6b0",
  },
  // from the Cumulative Retort artwork (Sep 2026)
  {
    slug: "amritsari-dal-makhani",
    name: "Amritsari Dal Makhani",
    category: "grains",
    descriptor: "Slow-simmered whole black lentils with a bold blend of spices, a smooth texture and distinctive smoky notes.",
    sizes: sizesFor("amritsari-dal-makhani"),
    price: null,
    image: "/products/pouches/amritsari-dal-makhani.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f3dca0",
  },
  {
    slug: "makhani-sauce",
    name: "Makhani Sauce",
    category: "gravies",
    descriptor: "A rich tomato and cashew-based creamy gravy: add your favourite ingredient for a delicious makhani dish in minutes.",
    sizes: sizesFor("makhani-sauce"),
    price: null,
    image: "/products/pouches/makhani-sauce.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f5cdb0",
  },
  {
    slug: "boiled-kabuli-chana",
    name: "Boiled Kabuli Chana",
    category: "grains",
    descriptor: "Pure, nutty goodness. Open it. Wash it. Cook it.",
    sizes: sizesFor("boiled-kabuli-chana"),
    price: null,
    image: "/products/pouches/boiled-kabuli-chana.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#d3ebe8",
  },
  {
    slug: "boiled-rajma",
    name: "Boiled Rajma (Kidney Beans)",
    category: "grains",
    descriptor: "Perfectly cooked rajma: soft, creamy and firm to the bite. Simply open, heat and serve.",
    sizes: sizesFor("boiled-rajma"),
    price: null,
    image: "/products/pouches/boiled-rajma.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#d3ebe8",
  },
  {
    slug: "boiled-kala-chana",
    name: "Boiled Kala Chana",
    category: "grains",
    descriptor: "Boiled black Bengal gram: real earthy flavour, no shortcuts. Open it. Wash it. Cook it.",
    sizes: sizesFor("boiled-kala-chana"),
    price: null,
    image: "/products/pouches/boiled-kala-chana.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#d3ebe8",
  },
  {
    slug: "boiled-toor-dal",
    name: "Boiled Toor Dal",
    category: "grains",
    descriptor: "Perfectly cooked toor dal. Just heat, add your favourite seasoning, and enjoy a wholesome meal in minutes.",
    sizes: sizesFor("boiled-toor-dal"),
    price: null,
    image: "/products/pouches/boiled-toor-dal.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#d3ebe8",
  },
  {
    slug: "garlic-paste",
    name: "Garlic Paste",
    category: "pastes",
    descriptor: "Fresh garlic, blended for instant aroma and rich flavour: a ready-to-use paste that saves time.",
    sizes: sizesFor("garlic-paste"),
    price: null,
    image: "/products/pouches/garlic-paste.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f2c9bd",
  },
  {
    slug: "ginger-garlic-paste",
    name: "Ginger Garlic Paste",
    category: "pastes",
    descriptor: "Fresh ginger and garlic, blended for instant aroma and rich flavour: a ready-to-use paste that saves time.",
    sizes: sizesFor("ginger-garlic-paste"),
    price: null,
    image: "/products/pouches/ginger-garlic-paste.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f2c9bd",
  },
  {
    slug: "ginger-paste",
    name: "Ginger Paste",
    category: "pastes",
    descriptor: "Fresh ginger blended for instant aroma and rich flavour: a ready-to-use paste that saves time.",
    sizes: sizesFor("ginger-paste"),
    price: null,
    image: "/products/pouches/ginger-paste.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#f3d0b8",
  },
  {
    slug: "tomato-ketchup",
    name: "Tomato Ketchup",
    category: "pastes",
    descriptor: "A hot and sweet tomato ketchup with a rich texture and balanced blend of spices, perfect for snacks.",
    sizes: sizesFor("tomato-ketchup"),
    price: null,
    image: "/products/pouches/tomato-ketchup.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#e6d3d3",
  },
  {
    slug: "imli-chutney",
    name: "Imli Chutney",
    category: "pastes",
    descriptor: "A balanced blend of ripe tamarind, sweetness and gentle spices: tangy, mildly sweet and smooth.",
    sizes: sizesFor("imli-chutney"),
    price: null,
    image: "/products/pouches/imli-chutney.webp",
    imageWidth: 560,
    imageHeight: 750,
    tint: "#e4d0dd",
  },
];

export const productsIn = (category: CategoryId) => PRODUCTS.filter((p) => p.category === category);
