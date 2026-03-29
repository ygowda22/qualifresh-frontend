// ═══════════════════════════════════════════════════════════
//  QualiFresh Site Configuration
//  Edit this file to update business details without touching any other code
// ═══════════════════════════════════════════════════════════

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
    minOrder:             350,   // ₹ minimum order
    freeDeliveryAbove:    600,   // ₹ free delivery threshold
    deliveryCharge:       50,    // ₹ charge below threshold
    freeMicrogreensAbove: 1500,  // ₹ free microgreens threshold
    days:                 ["Wednesday", "Saturday"],
    orderCutoff:          { wednesday: "Tuesday", saturday: "Friday" },
  },

  // ── Hero Section ───────────────────────────────────────────
  hero: {
    badge:        "🌱 FARM TO DOORSTEP — MUMBAI & PUNE",
    line1:        "Fresh Korean, Exotic &",
    lineAccent:   "Thai Vegetables",
    line2:        "at Your Door",
    subtext:      "Hand-picked specialty vegetables delivered twice a week to Mumbai & Pune. Order on WhatsApp — pay only after delivery. Not satisfied? Free replacement, no questions.",
  },

  // ── Stats Bar (hero bottom) ─────────────────────────────────
  stats: [
    { value: "57+",        label: "Exotic Varieties"    },
    { value: "2×",         label: "Wed & Sat Delivery"  },
    { value: "No Advance", label: "Pay After Delivery"  },
  ],

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    about:     "Premium exotic vegetables sourced from trusted Pune farms. Delivering freshness across Pune & Mumbai twice a week.",
    developer: "Web Development By Yogeshwari Gowda",
    tagline:   "Designed with ❤️ for fresh farming · Pune, India",
  },

  // ── API ────────────────────────────────────────────────────
  apiUrl: "http://localhost:4000",  // change to your live backend URL when deploying

  // ── Products per page ──────────────────────────────────────
  productsPerPage: 12,

};