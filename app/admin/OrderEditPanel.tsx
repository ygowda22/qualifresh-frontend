"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { siteConfig } from "../../src/config/site";
import { cldImg } from "../lib/img";

// Admin: edit an order's items. Side panel on ≥1024px, full-screen sheet on phones/tablets.
// The live summary is display-only; the server recalculates and its numbers are final.

const API = "/backend";
const { delivery: DEL } = siteConfig;
const MAX_QTY = 999;
const MAX_PRICE = 100000;

interface Line {
  key: string;
  productId: string | null;     // null = old line without a catalogue product
  name: string;
  slug: string;
  qty: string;                  // as typed
  price: string;                // as typed
  imageUrl?: string;
  quantityLabel?: string;
  orig?: { qty: number; price: number }; // from the stored order (undefined for added lines)
}

export interface EditableOrderItem { productId?: string | null; name: string; slug: string; quantity: number; price: number; }
export interface EditableOrder {
  _id: string; orderNumber: string; status: string; items?: EditableOrderItem[];
  subtotal: number; deliveryCharge: number; total: number; updatedAt?: string; createdAt?: string;
  deliverySlot?: string; guestName?: string; user?: { name?: string } | null;
}
export interface CatalogueProduct { _id: string; name: string; slug: string; price: number; imageUrl?: string; quantityLabel?: string; unit?: string; stock?: number; isActive?: boolean; }

interface Props {
  order: EditableOrder;
  products: CatalogueProduct[];
  deliveryLabel: string;
  token: string;
  onClose: () => void;                       // closed without saving
  onSaved: (order: EditableOrder) => void;   // server copy of the updated order
  onReload: () => Promise<EditableOrder | null>; // fresh copy of this order (or null if gone)
  onUnauthorized: () => void;                // session expired → existing admin login behaviour
}

let keySeq = 0;
const nextKey = () => `l${++keySeq}`;
const rupees = (n: number) => `₹${Number.isInteger(n) ? n : n.toFixed(2)}`;

function totalsOf(lines: { qty: number; price: number }[]) {
  const sub = lines.reduce((s, l) => s + Math.round(l.price * 100) * l.qty, 0);
  const del = sub === 0 || sub >= DEL.freeDeliveryAbove * 100 ? 0 : DEL.deliveryCharge * 100;
  return { subtotal: sub / 100, deliveryCharge: del / 100, total: (sub + del) / 100 };
}

function qtyError(v: string) {
  if (!/^\d+$/.test(v.trim())) return "Whole number, 1–999";
  const n = Number(v); return n < 1 || n > MAX_QTY ? "Whole number, 1–999" : "";
}
function priceError(v: string) {
  const t = v.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return "Price, up to 2 decimals";
  const n = Number(t); return n <= 0 || n > MAX_PRICE ? `More than ₹0, at most ₹${MAX_PRICE}` : "";
}

// Lines from the stored order. Duplicate lines for the same product at the same price are merged
// (counts as a change that needs Save); same product at different prices stays separate.
function linesFromOrder(order: EditableOrder, products: CatalogueProduct[]): { lines: Line[]; merged: boolean } {
  const byId = new Map(products.map(p => [String(p._id), p]));
  const out: Line[] = []; let merged = false;
  for (const it of (Array.isArray(order.items) ? order.items : [])) {
    const pid = it.productId ? String(it.productId) : null;
    const same = out.find(l => (pid ? l.productId === pid : !l.productId && l.name === it.name) && l.orig && l.orig.price === it.price);
    if (same) {
      const q = Math.min(MAX_QTY, Number(same.qty) + Number(it.quantity));
      same.qty = String(q); merged = true; continue;
    }
    const p = pid ? byId.get(pid) : undefined;
    out.push({ key: nextKey(), productId: pid, name: it.name, slug: it.slug, qty: String(it.quantity), price: String(it.price),
      imageUrl: p?.imageUrl, quantityLabel: p?.quantityLabel, orig: { qty: it.quantity, price: it.price } });
  }
  return { lines: out, merged };
}

export default function OrderEditPanel({ order: initialOrder, products, deliveryLabel, token, onClose, onSaved, onReload, onUnauthorized }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [baseItems, setBaseItems] = useState<EditableOrderItem[]>(Array.isArray(initialOrder.items) ? initialOrder.items : []); // "original" for change detection
  const init = useMemo(() => linesFromOrder(initialOrder, products), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [lines, setLines] = useState<Line[]>(init.lines);
  const [mergedOnOpen, setMergedOnOpen] = useState(init.merged);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<{ message: string; reload?: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); // server errors per line field
  const [askDiscard, setAskDiscard] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [vv, setVv] = useState<{ top: number; height: number } | null>(null);

  // ── derived ───────────────────────────────────────────────────────────────
  const originalKey = useMemo(() => JSON.stringify(baseItems.map(i => [i.productId ? String(i.productId) : i.name, i.quantity, i.price])), [baseItems]);
  const currentKey = JSON.stringify(lines.map(l => [l.productId ?? l.name, Number(l.qty), Number(l.price)]));
  const dirty = mergedOnOpen || currentKey !== originalKey;
  const invalid = lines.some(l => qtyError(l.qty) || priceError(l.price));
  const canSave = dirty && lines.length > 0 && !invalid && !saving;
  const before = { subtotal: order.subtotal, deliveryCharge: order.deliveryCharge, total: order.total };
  const after = totalsOf(lines.map(l => ({ qty: qtyError(l.qty) ? 0 : Number(l.qty), price: priceError(l.price) ? 0 : Number(l.price) })));
  const customer = order.guestName || order.user?.name || "Guest";

  // ── open/close behaviour ─────────────────────────────────────────────────
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  const askRef = useRef(askDiscard); askRef.current = askDiscard;
  const closedRef = useRef(false);
  function finish(cb: () => void) {
    if (closedRef.current) return;
    closedRef.current = true;
    if (window.history.state?.qfOrderEdit) window.history.back(); // drop the entry added on open
    cb();
  }
  function requestClose() {
    if (saving) return;
    if (dirtyRef.current) setAskDiscard(true); else finish(onClose);
  }

  useEffect(() => {
    // Back button / phone back gesture closes the panel (asking first if there are changes)
    window.history.pushState({ ...(window.history.state || {}), qfOrderEdit: true }, "", window.location.href);
    const onPop = () => {
      if (closedRef.current) return;
      if (dirtyRef.current) {
        window.history.pushState({ ...(window.history.state || {}), qfOrderEdit: true }, "", window.location.href);
        setAskDiscard(true);
      } else { closedRef.current = true; onClose(); }
    };
    window.addEventListener("popstate", onPop);
    // Background must not scroll behind the panel
    const html = document.documentElement, body = document.body;
    const prev = [html.style.overflow, body.style.overflow];
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    // Keep the Save bar above the on-screen keyboard (visual viewport)
    const v = window.visualViewport;
    const onVv = () => { if (v) setVv({ top: v.offsetTop, height: v.height }); };
    v?.addEventListener("resize", onVv); v?.addEventListener("scroll", onVv); onVv();
    titleRef.current?.focus();
    return () => {
      window.removeEventListener("popstate", onPop);
      html.style.overflow = prev[0]; body.style.overflow = prev[1];
      v?.removeEventListener("resize", onVv); v?.removeEventListener("scroll", onVv);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes (or dismisses an open prompt). Listened for on the whole document: Safari does
  // not focus buttons on click, so focus may not be inside the panel when Escape is pressed.
  const escRef = useRef<() => void>(() => {});
  escRef.current = () => {
    if (askRef.current) setAskDiscard(false);
    else if (confirmRemove) setConfirmRemove(null);
    else requestClose();
  };
  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); escRef.current(); } };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, []);

  // Tab stays inside the panel
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab" && panelRef.current) {
      const f = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // ── editing ──────────────────────────────────────────────────────────────
  function update(key: string, patch: Partial<Line>) {
    setLines(ls => ls.map(l => (l.key === key ? { ...l, ...patch } : l)));
    setFieldErrors(fe => { const n = { ...fe }; delete n[`${key}.qty`]; delete n[`${key}.price`]; delete n[`${key}.product`]; return n; });
    setError(null);
  }
  function step(key: string, d: number) {
    const l = lines.find(x => x.key === key); if (!l) return;
    const n = qtyError(l.qty) ? 1 : Math.min(MAX_QTY, Math.max(1, Number(l.qty) + d));
    update(key, { qty: String(n) });
  }
  function remove(key: string) {
    setLines(ls => ls.filter(l => l.key !== key)); setConfirmRemove(null); setError(null);
  }
  function addProduct(p: CatalogueProduct) {
    const pid = String(p._id);
    const existing = lines.find(l => l.productId === pid);
    if (existing) step(existing.key, +1);
    else setLines(ls => [...ls, { key: nextKey(), productId: pid, name: p.name, slug: p.slug, qty: "1", price: String(p.price), imageUrl: p.imageUrl, quantityLabel: p.quantityLabel }]);
    setSearch(""); setError(null);
  }
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => String(p.name || "").toLowerCase().includes(q)).slice(0, 20);
  }, [search, products]);

  // ── save ─────────────────────────────────────────────────────────────────
  async function save() {
    if (!canSave || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(null); setFieldErrors({});
    try {
      const r = await fetch(`${API}/api/orders/${order._id}/items`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map(l => ({ productId: l.productId, name: l.name, slug: l.slug, quantity: Number(l.qty), price: Number(l.price) })),
          expectedUpdatedAt: order.updatedAt || order.createdAt,
        }),
      });
      if (r.status === 401) { closedRef.current = true; onUnauthorized(); return; }
      const d = await r.json().catch(() => ({}));
      if (r.ok) { finish(() => onSaved(d)); return; }
      if (r.status === 409) { setError({ message: d.message || "This order was changed by someone else. Reload and try again.", reload: true }); return; }
      const m = /^items\.(\d+)\.(quantity|price|productId)$/.exec(d.field || "");
      if (m && lines[Number(m[1])]) {
        const which = m[2] === "quantity" ? "qty" : m[2] === "price" ? "price" : "product";
        setFieldErrors({ [`${lines[Number(m[1])].key}.${which}`]: d.message });
      } else setError({ message: d.message || `Couldn't save (error ${r.status}).` });
    } catch {
      setError({ message: "Couldn't save. Check your connection and try again." });
    } finally {
      savingRef.current = false; setSaving(false);
    }
  }
  async function reload() {
    setError(null);
    const fresh = await onReload();
    if (!fresh) { setError({ message: "This order no longer exists." }); return; }
    const next = linesFromOrder(fresh, products);
    setOrder(fresh); setLines(next.lines); setMergedOnOpen(next.merged); setFieldErrors({}); setConfirmRemove(null);
    setBaseItems(Array.isArray(fresh.items) ? fresh.items : []); // the fresh copy is the new "original"
    if (!["pending", "confirmed", "out_for_delivery"].includes(fresh.status))
      setError({ message: `${fresh.status === "delivered" ? "Delivered" : fresh.status === "cancelled" ? "Cancelled" : "This"} orders can't be edited.` });
  }

  const sheetStyle: React.CSSProperties = vv ? { top: vv.top, height: vv.height } : {};

  return (
    <div className="oe-root" role="presentation">
      <style>{`
        .oe-root{position:fixed;inset:0;z-index:600}
        .oe-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}
        .oe-panel{position:absolute;right:0;top:0;bottom:0;width:min(560px,100vw);background:#fff;display:flex;flex-direction:column;box-shadow:-6px 0 40px rgba(0,0,0,.18);outline:none;overscroll-behavior:contain}
        .oe-head{padding:16px 18px 12px;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;align-items:flex-start}
        .oe-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:12px 18px}
        .oe-foot{border-top:1px solid #e5e7eb;padding:12px 18px calc(12px + env(safe-area-inset-bottom));background:#fff}
        .oe-line{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;padding:12px 0;border-bottom:1px solid #f1f5f9}
        .oe-ctrls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}
        .oe-input{padding:7px 10px;border-radius:8px;border:1.5px solid #e5e7eb;font-size:13px;background:#fff;color:#111827;font-family:inherit;min-width:0}
        .oe-input:focus-visible,.oe-btn:focus-visible,.oe-step:focus-visible,.oe-x:focus-visible,.oe-result:focus-visible{outline:2px solid #2d8a4e;outline-offset:2px}
        .oe-input.err{border-color:#ef4444}
        .oe-step{width:34px;height:34px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#111827;font-size:17px;font-weight:700;cursor:pointer;line-height:1}
        .oe-btn{padding:9px 16px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:inherit;white-space:nowrap}
        .oe-btn:disabled{cursor:not-allowed;opacity:.55}
        .oe-x{background:none;border:none;font-size:20px;color:#6b7280;cursor:pointer;width:36px;height:36px;border-radius:8px;flex-shrink:0}
        .oe-result{display:flex;width:100%;gap:10px;align-items:center;padding:8px;border:none;background:#fff;border-radius:8px;cursor:pointer;text-align:left;font-family:inherit}
        .oe-result:hover{background:#f0fdf4}
        .oe-tag{font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px;white-space:nowrap}
        .oe-err{font-size:11.5px;color:#dc2626;margin-top:4px}
        @media(pointer:coarse){
          .oe-input{font-size:16px}
          .oe-step{width:44px;height:44px}
          .oe-btn{min-height:44px}
        }
        @media(max-width:1023px){
          .oe-panel{width:100vw;left:0;box-shadow:none}
          .oe-input{font-size:16px}
          .oe-step{width:44px;height:44px}
          .oe-btn{min-height:44px;font-size:15px}
        }
      `}</style>
      <div className="oe-backdrop" onClick={requestClose} />
      <div ref={panelRef} className="oe-panel" role="dialog" aria-modal="true" aria-labelledby="oe-title" onKeyDown={onKeyDown} style={sheetStyle}>
        <div className="oe-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="oe-title" ref={titleRef} tabIndex={-1} style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827", outline: "none" }}>
              Edit order <span style={{ color: "#2d8a4e" }}>{order.orderNumber}</span>
            </h2>
            <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "3px", overflowWrap: "anywhere" }}>
              {customer}{deliveryLabel ? ` · Delivery: ${deliveryLabel}` : ""}
            </div>
          </div>
          <button type="button" className="oe-x" onClick={requestClose} aria-label="Close edit order panel">✕</button>
        </div>

        <div className="oe-body">
          {lines.length === 0 && (
            <p style={{ fontSize: "13px", color: "#b91c1c", background: "#fef2f2", borderRadius: "8px", padding: "10px 12px" }}>An order needs at least one item. Add a product below.</p>
          )}
          {lines.map(l => {
            const qErr = fieldErrors[`${l.key}.qty`] || qtyError(l.qty);
            const pErr = fieldErrors[`${l.key}.price`] || priceError(l.price);
            const lineAmount = !qtyError(l.qty) && !priceError(l.price) ? Math.round(Number(l.price) * 100) * Number(l.qty) / 100 : null;
            return (
              <div key={l.key} className="oe-line" data-line={l.name}>
                {l.imageUrl ? <img src={cldImg(l.imageUrl, 100)} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                  : <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🥬</div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "13.5px", overflowWrap: "anywhere" }}>
                      {l.name}{!l.orig && <span className="oe-tag" style={{ marginLeft: "6px", background: "#f0fdf4", color: "#2d8a4e" }}>New</span>}
                      {l.quantityLabel && <div style={{ fontSize: "11.5px", color: "#9ca3af", fontWeight: 400 }}>{l.quantityLabel}</div>}
                    </div>
                    <div style={{ fontWeight: 700, color: "#111827", whiteSpace: "nowrap", fontSize: "13.5px" }} aria-label={`Line amount for ${l.name}`}>{lineAmount === null ? "—" : rupees(lineAmount)}</div>
                  </div>
                  {confirmRemove === l.key ? (
                    <div className="oe-ctrls" role="alertdialog" aria-label={`Remove ${l.name}?`}>
                      <span style={{ fontSize: "13px", color: "#374151" }}>Remove this item?</span>
                      <button type="button" className="oe-btn" style={{ background: "#fef2f2", color: "#ef4444" }} onClick={() => remove(l.key)} aria-label={`Confirm remove ${l.name}`}>Remove</button>
                      <button type="button" className="oe-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => setConfirmRemove(null)}>Keep</button>
                    </div>
                  ) : (
                    <div className="oe-ctrls">
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button type="button" className="oe-step" onClick={() => step(l.key, -1)} disabled={!qtyError(l.qty) && Number(l.qty) <= 1} aria-label={`Decrease quantity of ${l.name}`}>−</button>
                        <input className={`oe-input${qErr ? " err" : ""}`} value={l.qty} inputMode="numeric" style={{ width: "58px", textAlign: "center" }}
                          aria-label={`Quantity of ${l.name}`} aria-invalid={!!qErr} onChange={e => update(l.key, { qty: e.target.value })} />
                        <button type="button" className="oe-step" onClick={() => step(l.key, +1)} disabled={!qtyError(l.qty) && Number(l.qty) >= MAX_QTY} aria-label={`Increase quantity of ${l.name}`}>+</button>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6b7280" }}>
                        ₹<input className={`oe-input${pErr ? " err" : ""}`} value={l.price} inputMode="decimal" style={{ width: "86px" }}
                          aria-label={`Price per unit of ${l.name}`} aria-invalid={!!pErr} onChange={e => update(l.key, { price: e.target.value })} />/ea
                      </label>
                      <button type="button" className="oe-btn" style={{ background: "#fef2f2", color: "#ef4444", marginLeft: "auto", padding: "7px 10px" }}
                        onClick={() => setConfirmRemove(l.key)} aria-label={`Remove ${l.name}`}>🗑 Remove</button>
                    </div>
                  )}
                  {qErr && <div className="oe-err" role="alert">Quantity: {qErr}</div>}
                  {pErr && <div className="oe-err" role="alert">Price: {pErr}</div>}
                  {fieldErrors[`${l.key}.product`] && <div className="oe-err" role="alert">{fieldErrors[`${l.key}.product`]}</div>}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: "14px" }}>
            <label htmlFor="oe-search" style={{ fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>+ Add product</label>
            <input id="oe-search" className="oe-input" style={{ width: "100%", boxSizing: "border-box" }} placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)} autoComplete="off" aria-controls="oe-results" />
            {search.trim() && (
              <div id="oe-results" role="listbox" aria-label="Product search results" style={{ marginTop: "6px", border: "1px solid #f1f5f9", borderRadius: "10px", padding: "4px" }}>
                {results.length === 0 ? <div style={{ padding: "10px", fontSize: "13px", color: "#9ca3af" }}>No products found</div> : results.map(p => (
                  <button key={p._id} type="button" role="option" aria-selected={false} className="oe-result" onClick={() => addProduct(p)} aria-label={`Add ${p.name}`}>
                    {p.imageUrl ? <img src={cldImg(p.imageUrl, 100)} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                      : <span style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#f0fdf4", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🥬</span>}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#111827", overflowWrap: "anywhere" }}>{p.name}</span>
                      <span style={{ display: "block", fontSize: "11.5px", color: "#9ca3af" }}>{p.quantityLabel || p.unit || ""}</span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{rupees(Number(p.price))}</span>
                      {p.stock === 0 && <span className="oe-tag" style={{ background: "#fef2f2", color: "#ef4444" }}>Out of stock</span>}
                      {p.isActive === false && <span className="oe-tag" style={{ background: "#fef3c7", color: "#92400e" }}>Inactive</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="oe-foot">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: "3px", fontSize: "13px", color: "#374151", marginBottom: "10px" }} aria-live="polite">
            <span>Subtotal</span><span data-summary="subtotal">{rupees(before.subtotal)} → <strong>{rupees(after.subtotal)}</strong></span>
            <span>Delivery</span><span data-summary="delivery">{before.deliveryCharge === 0 ? "FREE" : rupees(before.deliveryCharge)} → <strong>{after.deliveryCharge === 0 ? "FREE" : rupees(after.deliveryCharge)}</strong></span>
            <span style={{ fontWeight: 800, color: "#111827" }}>Total</span><span data-summary="total" style={{ fontWeight: 800, color: "#111827" }}>{rupees(before.total)} → {rupees(after.total)}</span>
          </div>
          {error && (
            <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "9px 12px", fontSize: "12.5px", color: "#dc2626", marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <span>{error.message}</span>
              {error.reload && <button type="button" className="oe-btn" style={{ background: "#fff", color: "#dc2626", border: "1px solid #fecaca" }} onClick={reload}>Reload order</button>}
            </div>
          )}
          {askDiscard ? (
            <div role="alertdialog" aria-label="Discard changes?" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ flex: 1, fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>Discard changes?</span>
              <button type="button" className="oe-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => setAskDiscard(false)} autoFocus>Keep editing</button>
              <button type="button" className="oe-btn" style={{ background: "#fef2f2", color: "#ef4444" }} onClick={() => finish(onClose)}>Discard</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="oe-btn" style={{ flex: 1, background: "#f3f4f6", color: "#374151" }} onClick={requestClose}>Cancel</button>
              <button type="button" className="oe-btn" style={{ flex: 2, background: canSave ? "#2d8a4e" : "#e5e7eb", color: canSave ? "#fff" : "#9ca3af" }} onClick={save} disabled={!canSave} aria-label="Save order changes">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
