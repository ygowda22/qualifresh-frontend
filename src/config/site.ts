// ═══════════════════════════════════════════════════════════
//  QualiFresh Site Configuration
//  Edit this file to update business details without touching any other code
// ═══════════════════════════════════════════════════════════

export interface CategoryConfig {
  key:       string;   // must match MongoDB category field exactly
  label:     string;   // display name shown to users
  color:     string;   // accent color (hex)
  image:     string;   // category card image URL
  icon:      string;   // emoji icon
  pageTitle: string;   // browser tab title suffix when this category is filtered
}

export const siteConfig = {

  // ── Business Info ──────────────────────────────────────────
  name:        "QualiFresh",
  tagline:     "Quality First",
  phone:       "7276369948",
  phoneDisplay:"7276369948",
  email:       "rohit@qualifresh.in",
  whatsapp:    "917276369948",  // country code + number, no spaces
  address:     "Pune, Maharashtra, India",

  // ── Social Media ───────────────────────────────────────────
  social: {
    instagram: "https://www.instagram.com/rohitgowda_89/",
    facebook:  "https://www.facebook.com/rohitgowda123",
    twitter:   "",   // leave empty to hide
  },

  // ── Delivery Rules ─────────────────────────────────────────
  delivery: {
    minOrder:             350,
    freeDeliveryAbove:    600,
    deliveryCharge:       50,
    freeMicrogreensAbove: 1500,
    days:                 ["Wednesday", "Saturday"],
    orderCutoff:          { wednesday: "Tuesday", saturday: "Friday" },
  },

  // ── Hero Section ───────────────────────────────────────────
  hero: {
    badge:       "🌱 FARM TO DOORSTEP — MUMBAI & PUNE",
    line1:       "Fresh Korean, Exotic &",
    lineAccent:  "Thai Vegetables",
    line2:       "at Your Door",
    subtext:     "Hand-picked specialty vegetables delivered twice a week to Mumbai & Pune. Order on WhatsApp — pay only after delivery. Not satisfied? Free replacement, no questions.",
    // Right-side hero image (replace with your own CDN URL or /images/hero.jpg)
    image:       "https://images.pexels.com/photos/11631746/pexels-photo-11631746.jpeg?auto=compress&cs=tinysrgb&w=900",
  },

  // ── Stats Bar (hero bottom) ─────────────────────────────────
  stats: [
    { value: "57+",        label: "Exotic Varieties"   },
    { value: "2×",         label: "Wed & Sat Delivery" },
    { value: "No Advance", label: "Pay After Delivery" },
  ],

  // ── Product Categories ─────────────────────────────────────
  // To add a new category: add an entry here AND use the same `key`
  // value in MongoDB products. The UI reads purely from this list.
  categories: [
    {
      key:       "other",
      label:     "Vegetables",
      color:     "#1d4ed8",
      image:     "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=75&fit=crop",
      icon:      "🥦",
      pageTitle: "Fresh Vegetables",
    },
    {
      key:       "leafy",
      label:     "Leafy Greens",
      color:     "#16a34a",
      image:     "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=75&fit=crop",
      icon:      "🥬",
      pageTitle: "Leafy Greens",
    },
    {
      key:       "herb",
      label:     "Fresh Herbs",
      color:     "#15803d",
      image:     "https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=200&q=75&fit=crop",
      icon:      "🌿",
      pageTitle: "Fresh Herbs",
    },
    {
      key:       "mushroom",
      label:     "Mushrooms",
      color:     "#b91c1c",
      image:     "https://images.pexels.com/photos/5453799/pexels-photo-5453799.jpeg?auto=compress&cs=tinysrgb&w=200",
      icon:      "🍄",
      pageTitle: "Mushrooms",
    },
    {
      key:       "microgreen",
      label:     "Microgreens",
      color:     "#0d9488",
      image:     "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=200&q=75&fit=crop",
      icon:      "🌱",
      pageTitle: "Microgreens",
    },
    {
      key:       "sprout",
      label:     "Sprouts",
      color:     "#ca8a04",
      image:     "https://images.pexels.com/photos/8839400/pexels-photo-8839400.jpeg?auto=compress&cs=tinysrgb&w=200",
      icon:      "🫘",
      pageTitle: "Sprouts",
    },
    {
      key:       "fruit",
      label:     "Fruits",
      color:     "#7c3aed",
      image:     "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200&q=75&fit=crop",
      icon:      "🍓",
      pageTitle: "Exotic Fruits",
    },
    {
      key:       "grain",
      label:     "Grains & More",
      color:     "#b45309",
      image:     "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=75&fit=crop",
      icon:      "🌾",
      pageTitle: "Grains & More",
    },
  ] as CategoryConfig[],

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    about:     "Premium exotic vegetables sourced from trusted Pune farms. Delivering freshness across Pune & Mumbai twice a week.",
    developer: "Web Development By Yogeshwari Gowda",
    tagline:   "Designed with ❤️ for fresh farming · Pune, India",
  },

  // ── Page Titles (section-based) ────────────────────────────
  pageTitles: {
    home:     "Home — Buy Fresh Exotic Vegetables | QualiFresh",
    products: "Shop — Fresh Green Exotic Vegetables | QualiFresh",
    why:      "Why QualiFresh — Farm to Table | QualiFresh",
    aboutUs:  "About Us – QualiFresh",
    ourFarms: "Our Farms – QualiFresh",
    contact:  "Contact – QualiFresh",
  },

  // ── API ────────────────────────────────────────────────────
  apiUrl: "http://localhost:4000",

  // ── Products per page ──────────────────────────────────────
  productsPerPage: 15,
};
