// Invoice data for one order — shared by the PDF and the on-screen (phone) preview so both
// show exactly the same content and page breaks. No PDF/QR library here (kept small).
import { invoiceConfig } from "../../../src/config/invoice";

export type InvoiceConfig = typeof invoiceConfig;

export interface InvoiceOrder {
  orderNumber: string;
  createdAt?: string;
  deliverySlot?: string;
  deliveryAddress?: string;
  city?: string;
  guestName?: string;
  guestPhone?: string;
  user?: { name?: string; phone?: string } | null;
  items?: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export interface InvoiceRow { sr: number; name: string; qty: number; rate: string; amount: string; lines: number; }
export interface InvoicePage { rows: InvoiceRow[]; first: boolean; last: boolean; }
export interface InvoiceModel {
  cfg: InvoiceConfig;
  orderNumber: string;
  dateText: string;          // DD-MM-YYYY (Asia/Kolkata)
  delivery: string;
  customer: { name: string; phone: string; address: string };
  rows: InvoiceRow[];
  subTotal: string; delivery_: string; roundOff: string; totalText: string;
  totalRounded: number;
  amountInWords: string;
  upi: string;
  qrCaption: string;
  fileName: string;
  pages: InvoicePage[];
  hasHangul: boolean;
}

// ── formatting ──────────────────────────────────────────────────────────────
/** ₹1,25,000.00 (Indian digit grouping, always 2 decimals) */
export function inr(n: number): string {
  return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
  "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function twoDigits(n: number): string { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""); }
function threeDigits(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  return [h ? `${ONES[h]} Hundred` : "", r ? twoDigits(r) : ""].filter(Boolean).join(" ");
}
/** Whole rupees in words, Indian numbering (thousand / lakh / crore). */
export function rupeesInWords(rupees: number): string {
  let n = Math.round(Math.abs(rupees));
  if (n === 0) return "Zero Rupees only";
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(`${crore >= 100 ? rupeesInWords(crore).replace(/ Rupees only$/, "") : twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (n) parts.push(threeDigits(n));
  return `${parts.join(" ")} Rupees only`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Day, month and year of a date in India time. */
export function istDate(iso?: string): { d: string; m: number; y: string } | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric" })
    .formatToParts(date).map(x => [x.type, x.value]));
  return { d: p.day, m: Number(p.month), y: p.year };
}

// Emoji, plus zero-width joiner, variation selectors and skin-tone modifiers (built from code points,
// so the source has no invisible characters)
const EMOJI = new RegExp(`[\\p{Extended_Pictographic}${String.fromCodePoint(0x200d, 0xfe0e, 0xfe0f)}${String.fromCodePoint(0x1f3fb)}-${String.fromCodePoint(0x1f3ff)}]`, "gu");

/** <orderNumber>_<Customer-Name>_<DD-Mon-YYYY>.pdf — safe on Windows and Mac. */
export function invoiceFileName(orderNumber: string, customerName: string | undefined, createdAt?: string): string {
  let name = (customerName || "").normalize("NFC").trim()
    .replace(EMOJI, "")   // emoji (and joiners/selectors)
    .replace(/[\\/:*?"<>|]/g, "")                                                          // not allowed in file names
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{M}\p{N}-]/gu, "")                                                  // keep letters, digits, "-"
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
  name = Array.from(name).slice(0, 40).join("").replace(/-$/, "");
  if (!name) name = "Customer";
  const dt = istDate(createdAt);
  const date = dt ? `${dt.d}-${MONTHS[dt.m - 1]}-${dt.y}` : "undated";
  const num = (orderNumber || "Order").replace(/[\\/:*?"<>|\s]/g, "");
  return `${num}_${name}_${date}.pdf`;
}

/** UPI deep link for the QR. "@" stays readable (UPI apps expect it); everything else URL-encoded. */
export function upiLink(cfg: InvoiceConfig, amount: number, orderNumber: string): string {
  const enc = (s: string) => encodeURIComponent(s).replace(/%40/g, "@");
  return `upi://pay?pa=${enc(cfg.upi.id)}&pn=${enc(cfg.upi.payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${enc(orderNumber)}`;
}

// UPI QR (drawn identically by the PDF and the on-screen copy)
export interface QrMatrix { size: number; dark: boolean[] }
export const QR_MM = 32;   // printed size of the code itself (without quiet zone) — at least 30 mm
export const QR_QUIET = 4; // modules of white space around the code

export const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

// ── page layout (shared by PDF and HTML preview; all sizes in mm) ───────────
export const LAYOUT = {
  pageW: 210, pageH: 297, margin: 12,
  firstHeader: 66,        // business header + customer/invoice block on page 1
  contHeader: 12,         // "Invoice QF-x (continued)" on later pages
  tableHead: 7,
  rowBase: 6, rowLine: 3.9, // single-line row height, and each extra wrapped line
  closing: 96,            // totals + words + terms + bank / QR / signature
  footer: 8,              // "Page x of y"
  cols: { sr: 11, qty: 16, rate: 31, amount: 34 }, // particulars gets the rest
  charsPerLine: 46,       // conservative estimate for the particulars column at 9pt
};

function wrappedLines(text: string): number {
  // Hangul is about twice as wide as Latin letters
  const width = Array.from(text).reduce((w, ch) => w + (HANGUL.test(ch) ? 2 : 1), 0);
  return Math.max(1, Math.ceil(width / LAYOUT.charsPerLine));
}

function paginate(rows: InvoiceRow[]): InvoicePage[] {
  const usable = LAYOUT.pageH - 2 * LAYOUT.margin - LAYOUT.footer;
  const pages: InvoicePage[] = [];
  let cur: InvoiceRow[] = [], first = true, left = usable - LAYOUT.firstHeader - LAYOUT.tableHead;
  const rowH = (r: InvoiceRow) => LAYOUT.rowBase + (r.lines - 1) * LAYOUT.rowLine;
  for (const r of rows) {
    if (rowH(r) > left && cur.length) {
      pages.push({ rows: cur, first, last: false });
      cur = []; first = false; left = usable - LAYOUT.contHeader - LAYOUT.tableHead;
    }
    cur.push(r); left -= rowH(r);
  }
  // the totals / bank / QR block must fit under the last rows, else it gets its own page
  if (left >= LAYOUT.closing) pages.push({ rows: cur, first, last: true });
  else { pages.push({ rows: cur, first, last: false }); pages.push({ rows: [], first: false, last: true }); }
  return pages;
}

/** Emoji can't be printed with the invoice fonts — leave them out of printed text. */
export function printable(s: unknown): string {
  return String(s ?? "").replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();
}

export function buildInvoice(order: InvoiceOrder, cfg: InvoiceConfig = invoiceConfig): InvoiceModel {
  const name = printable(order.guestName || order.user?.name);
  const phone = printable(order.guestPhone || order.user?.phone);
  const addr = printable(order.deliveryAddress);
  const address = [addr && addr !== "Not provided" ? addr : "", printable(order.city)].filter(Boolean).join(", ");
  const rows: InvoiceRow[] = (Array.isArray(order.items) ? order.items : []).map((it, i) => {
    const amountPaise = Math.round(Number(it.price) * 100) * Number(it.quantity);
    const itemName = printable(it.name);
    return { sr: i + 1, name: itemName, qty: Number(it.quantity), rate: inr(Number(it.price)), amount: inr(amountPaise / 100), lines: wrappedLines(itemName) };
  });
  const total = Number(order.total) || 0;
  const totalRounded = Math.round(total);
  const ro = Math.round((totalRounded - total) * 100) / 100;
  const dt = istDate(order.createdAt);
  const text = [name, address, ...rows.map(r => r.name)].join(" ");
  return {
    cfg,
    orderNumber: order.orderNumber,
    dateText: dt ? `${dt.d}-${String(dt.m).padStart(2, "0")}-${dt.y}` : "",
    delivery: (order.deliverySlot || "").trim(),
    customer: { name, phone, address },
    rows,
    subTotal: inr(Number(order.subtotal) || 0),
    delivery_: Number(order.deliveryCharge) ? inr(Number(order.deliveryCharge)) : "Free",
    roundOff: ro === 0 ? inr(0) : `${ro > 0 ? "+" : "−"}${inr(Math.abs(ro))}`,
    totalText: inr(totalRounded),
    totalRounded,
    amountInWords: rupeesInWords(totalRounded),
    upi: upiLink(cfg, totalRounded, order.orderNumber),
    qrCaption: `Scan to pay ${inr(totalRounded)} · UPI: ${cfg.upi.id}`,
    fileName: invoiceFileName(order.orderNumber, order.guestName || order.user?.name, order.createdAt),
    pages: paginate(rows),
    hasHangul: HANGUL.test(text),
  };
}
