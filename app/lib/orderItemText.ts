// One place for how an order line's quantity, unit and rate are worded — used by the admin Orders
// list, the admin Edit panel, the invoice PDF and the customer's My Orders, so the text is
// identical everywhere. Display only: amounts mirror the server (price × weightKg when a per-kg
// line has been weighed, otherwise price × quantity).

export interface ProductUnitInfo { name?: string; unit?: string; priceUnit?: string; quantityLabel?: string }
export interface OrderLine { name: string; quantity: number; price: number; weightKg?: number | null }

const PACK_SIZE_UNITS = new Set(["g", "gm", "gms", "gram", "grams", "ml", "l", "ltr", "litre", "liter"]);

/** The unit a line is counted in: gm/ml pack sizes → "pkt"; pt/punnet → "punnet" (pots → "pc"); fallback "pc". */
export function countUnit(p: ProductUnitInfo): string {
  const u = (p.unit || "").trim().toLowerCase();
  if (!u) return "pc";
  if (PACK_SIZE_UNITS.has(u)) return "pkt";
  if (u === "pt" || u === "punnet") return /\bpots?\b/i.test(p.name || "") ? "pc" : "punnet";
  return u;
}
export const isPerKg = (p?: ProductUnitInfo | null) => p?.priceUnit === "per_kg";
/** per-kg products whose unit is kg (customer orders kilos), as opposed to per-kg items ordered by the piece */
export const isKgProduct = (p?: ProductUnitInfo | null) => isPerKg(p) && (p?.unit || "").trim().toLowerCase() === "kg";
export const isWeighed = (l: OrderLine) => typeof l.weightKg === "number";

/** Line amount in paise (same rule as the server). */
export function linePaise(l: OrderLine): number {
  return isWeighed(l) ? Math.round(l.price * 100 * (l.weightKg as number)) : Math.round(l.price * 100) * l.quantity;
}
export const kg = (w: number) => w.toFixed(2);
export const inr2 = (n: number) => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "2 pkt" · "1 pc (est.)" · "1 pc · 1.70 kg" · "2 kg (est.)" · "1.15 kg" — null when the product is unknown. */
export function qtyText(l: OrderLine, p?: ProductUnitInfo | null): string | null {
  if (!p) return null;
  if (isPerKg(p)) {
    if (isKgProduct(p)) return isWeighed(l) ? `${kg(l.weightKg as number)} kg` : `${l.quantity} kg (est.)`;
    return isWeighed(l) ? `${l.quantity} pc · ${kg(l.weightKg as number)} kg` : `${l.quantity} pc (est.)`;
  }
  return `${l.quantity} ${countUnit(p)}`;
}
/** Unit the rate is per: "kg" for per-kg lines, otherwise the count unit. */
export const rateUnit = (p: ProductUnitInfo) => (isPerKg(p) ? "kg" : countUnit(p));

/** Admin Orders list wording: "1 pkt · ₹50/pkt", "1 pc (est.) · ₹80/kg", "1 pc · 1.70 kg × ₹80/kg", "1.15 kg × ₹450/kg". */
export function listText(l: OrderLine, p?: ProductUnitInfo | null): { qty: string; rate: string } | null {
  const q = qtyText(l, p);
  if (!q || !p) return null;
  return { qty: q, rate: `${isWeighed(l) ? "× " : ""}₹${l.price}/${rateUnit(p)}` };
}

/** Small grey text after the item name: pack size / label, or "1 piece · billed by actual weight" once weighed. */
export function subLabel(l: OrderLine, p?: ProductUnitInfo | null): string {
  if (p && isPerKg(p) && isWeighed(l)) return isKgProduct(p) ? "billed by actual weight" : `${l.quantity} piece${l.quantity === 1 ? "" : "s"} · billed by actual weight`;
  return (p?.quantityLabel || "").replace(/\s+/g, " ").trim();
}
