// ═══════════════════════════════════════════════════════════
//  QualiFresh — invoice details (admin invoice PDF)
//  Every business detail printed on the invoice lives here. Kept separate from
//  site.ts so the public website's JavaScript doesn't carry it.
// ═══════════════════════════════════════════════════════════

export const invoiceConfig = {
  title:        "INVOICE",
  businessName: "QUALIFRESH QUALITY FIRST",
  tagline:      "All Korean, continental and Indian vegetable supplier and grower",
  address:      "Near Dhamale Diary, Bebadohal, Tal. Maval, Dist. Pune - 410 506",
  email:        "rohit@qualifresh.in",
  phone:        "7276369948",
  gstin:        "27AUZPG0618D1ZL",
  logo:         "/logo.webp",
  terms:        "Thanks for doing business with us!",
  signatureFor: "For Qualifresh Quality First",
  signatureLabel: "Authorised Signature",
  bank: {
    accountName: "Go Fresh Agro",
    bankName:    "Bank of Baroda",
    branch:      "Talegaon Dabhade",
    accountNo:   "35790200000479",
    ifsc:        "BARB0TALEGA",
    paymentPhone:"7276369948",   // GooglePay / PhonePe
  },
  upi: {
    id:        "gofreshagro-2@okicici",
    payeeName: "Go Fresh Agro",
  },
};
