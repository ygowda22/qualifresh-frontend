"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "../../src/config/site";
import SiteNav from "../components/SiteNav";

const { delivery: DEL } = siteConfig;

interface Product {
  _id: string; name: string; price: number; slug: string;
  imageUrl?: string; quantityLabel?: string;
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}

export default function CheckoutPage() {
  const [cart, setCart]         = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  // Form fields
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("Pune");
  const [slot, setSlot]       = useState("Wednesday");
  const [notes, setNotes]     = useState("");

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum]     = useState("");
  const [done, setDone]             = useState(false);
  const [apiError, setApiError]     = useState("");

  useEffect(() => {
    document.title = "Checkout — QualiFresh";
    try {
      const c = localStorage.getItem("qf_cart");
      if (c) setCart(JSON.parse(c));
      const u = localStorage.getItem("qf_user");
      if (u) { const user = JSON.parse(u); setName(user.name || ""); setEmail(user.email || ""); }
    } catch {}
    fetch("/backend/api/products")
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cartItems    = products.filter(p => (cart[p._id] || 0) > 0);
  const cartTotal    = cartItems.reduce((s, p) => s + p.price * cart[p._id], 0);
  const deliveryCost = cartTotal >= DEL.freeDeliveryAbove ? 0 : cartTotal > 0 ? DEL.deliveryCharge : 0;
  const grandTotal   = cartTotal + deliveryCost;

  // Validation
  const cleanPhone  = phone.replace(/\s+/g, "").replace(/^(\+91|91)/, "");
  const phoneValid  = /^[6-9]\d{9}$/.test(cleanPhone);
  const canSubmit   = name.trim() !== "" && phone.trim() !== "" && phoneValid && address.trim() !== "" && slot !== "";

  const waOrderUrl = cartItems.length > 0
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        `Hi QualiFresh! I'd like to order:\n` +
        cartItems.map(p => `• ${p.name} ×${cart[p._id]} — ₹${p.price * cart[p._id]}`).join("\n") +
        `\n\nTotal: ₹${grandTotal}${deliveryCost === 0 ? " (Free delivery!)" : ""}` +
        `\n\nName: ${name || "—"}` +
        (phone ? `\nPhone: ${phone}` : "") +
        (address ? `\nAddress: ${address}${city ? ", " + city : ""}` : "") +
        `\nSlot: ${slot}`
      )}`
    : `https://wa.me/${siteConfig.whatsapp}`;

  async function placeOrder() {
    if (!canSubmit) return;
    setApiError(""); setSubmitting(true);
    try {
      const items = cartItems.map(p => ({ productId: p._id, name: p.name, slug: p.slug, quantity: cart[p._id], price: p.price }));
      const r = await fetch("/backend/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal: cartTotal, deliveryCharge: deliveryCost, total: grandTotal, deliveryAddress: address, city, deliverySlot: slot, notes, guestName: name, guestEmail: email, guestPhone: phone }),
      });
      const d = await r.json();
      if (!r.ok) { setApiError(d.message || "Order failed. Please try again."); return; }
      fetch(`/backend/api/orders/${d._id}/notify`, { method: "POST", headers: { "Content-Type": "application/json" } }).catch(() => {});
      setOrderNum(d.orderNumber);
      setDone(true);
      const empty = "{}";
      localStorage.setItem("qf_cart", empty);
      window.dispatchEvent(new StorageEvent("storage", { key: "qf_cart", newValue: empty }));
    } catch { setApiError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "9px",
    border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit",
    background: "#fff", color: "#111827", boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ fontFamily: "'Inter','Poppins',-apple-system,sans-serif", background: "#f4f6f0", minHeight: "100vh" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        .ck-grid{display:grid;grid-template-columns:1fr 420px;gap:2rem;max-width:1100px;margin:0 auto;padding:2rem 1.5rem;}
        @media(max-width:860px){.ck-grid{grid-template-columns:1fr;}}
        .ck-card{background:#fff;border-radius:16px;padding:1.8rem;box-shadow:0 2px 16px rgba(0,0,0,.07);border:1px solid #f1f5f9;}
        .ck-field-label{display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:5px;font-family:sans-serif;}
        .ck-err{color:#ef4444;font-size:12px;font-family:sans-serif;margin-top:4px;}
        .btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:9px;cursor:pointer;font-family:inherit;font-weight:700;transition:background .2s;}
        .btn-g:hover{background:#1f6b3a;}
        nextjs-portal{display:none!important}
      `}</style>

      <SiteNav activePage="products" />

      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg,#0a1f12,#0f3020)", padding: "2rem 1.5rem 1.8rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 16px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "10px" }}>Checkout</span>
          <h1 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Complete Your Order</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13.5px", fontFamily: "sans-serif" }}>Pay on delivery · No advance required</p>
        </div>
      </div>
      {/* Wave */}
      <div style={{ lineHeight: 0, background: "#f4f6f0" }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "36px" }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#0f3020" />
        </svg>
      </div>

      {/* ── ORDER CONFIRMED ── */}
      {done ? (
        <div style={{ maxWidth: "520px", margin: "3rem auto", padding: "0 1.5rem" }}>
          <div className="ck-card" style={{ textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg,#2d8a4e,#16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 16px" }}>🌿</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#166534", margin: "0 0 8px" }}>Order Placed!</h2>
            <div style={{ display: "inline-block", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "10px 28px", margin: "8px 0 14px", fontWeight: 800, fontSize: "20px", color: "#1a3c2e" }}>{orderNum}</div>
            <p style={{ fontSize: "14px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "6px" }}>Thank you, <strong>{name}</strong>! Your order is confirmed.</p>
            {email && <p style={{ fontSize: "13px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "14px" }}>Confirmation will be sent to <strong>{email}</strong>.</p>}
            <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "12px 16px", margin: "14px 0", textAlign: "left", fontSize: "13px", color: "#374151", fontFamily: "sans-serif" }}>
              <div>📅 Delivery Slot: <strong>{slot}</strong></div>
              <div style={{ marginTop: "4px" }}>📍 {address}{city ? `, ${city}` : ""}</div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/products" style={{ padding: "12px 24px", background: "#2d8a4e", color: "#fff", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>Continue Shopping</a>
              <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi QualiFresh! Order ${orderNum} confirmed.\nName: ${name} | Phone: ${phone}\nDelivery: ${slot}\nAddress: ${address}${city ? ", " + city : ""}`)}`}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#25d366", color: "#fff", padding: "12px 24px", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                <WhatsAppIcon size={16} /> Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="ck-grid">

          {/* ── LEFT: DELIVERY FORM ── */}
          <div className="ck-card">
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f1a0f", margin: "0 0 1.4rem" }}>Delivery Details</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Full Name */}
              <div>
                <label className="ck-field-label">Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)}
                  style={inp} onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* Mobile */}
              <div>
                <label className="ck-field-label">Mobile Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ ...inp, borderColor: phone && !phoneValid ? "#ef4444" : "#e5e7eb" }}
                  onFocus={e => (e.target.style.borderColor = phone && !phoneValid ? "#ef4444" : "#2d8a4e")}
                  onBlur={e => (e.target.style.borderColor = phone && !phoneValid ? "#ef4444" : "#e5e7eb")} />
                {phone && !phoneValid && <p className="ck-err">Please enter a valid 10-digit Indian mobile number</p>}
              </div>

              {/* Email */}
              <div>
                <label className="ck-field-label">Email (for confirmation)</label>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={inp} onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* Address */}
              <div>
                <label className="ck-field-label">Delivery Address <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="Flat, Building, Street, Area" value={address} onChange={e => setAddress(e.target.value)}
                  style={inp} onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* City */}
              <div>
                <label className="ck-field-label">City</label>
                <input type="text" placeholder="Pune / Mumbai" value={city} onChange={e => setCity(e.target.value)}
                  style={inp} onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
              </div>

              {/* Delivery slot */}
              <div>
                <label className="ck-field-label">Delivery Slot <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={slot} onChange={e => setSlot(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="ck-field-label">Special Instructions (optional)</label>
                <textarea placeholder="e.g. Leave at door, call on arrival…" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  style={{ ...inp, resize: "none" }}
                  onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
              </div>
            </div>

            {/* Validation hint */}
            {!canSubmit && (name || phone || address) && (
              <div style={{ marginTop: "12px", background: "#fef9ec", border: "1px solid #fde68a", borderRadius: "8px", padding: "9px 12px", fontSize: "12.5px", color: "#92400e", fontFamily: "sans-serif" }}>
                {!name.trim() && "• Full name is required\n"}
                {(!phone.trim() || !phoneValid) && "• Valid 10-digit mobile number is required\n"}
                {!address.trim() && "• Delivery address is required"}
              </div>
            )}

            {apiError && (
              <div style={{ marginTop: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", color: "#dc2626", fontFamily: "sans-serif" }}>{apiError}</div>
            )}

            <button onClick={placeOrder} disabled={!canSubmit || submitting} className="btn-g"
              style={{ width: "100%", marginTop: "18px", padding: "15px", fontSize: "15px", opacity: !canSubmit || submitting ? 0.55 : 1, cursor: !canSubmit || submitting ? "not-allowed" : "pointer" }}>
              {submitting ? "Placing Order…" : cartItems.length > 0 ? `Place Order · ₹${grandTotal}` : "Place Order"}
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", fontFamily: "sans-serif", marginTop: "9px" }}>
              Pay on delivery · No advance required
            </p>

            {/* WhatsApp alternative */}
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "sans-serif", marginBottom: "10px" }}>Or order directly via WhatsApp</p>
              <a href={waOrderUrl} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#25d366", color: "#fff", padding: "10px 22px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13.5px", fontFamily: "sans-serif" }}>
                <WhatsAppIcon size={16} /> WhatsApp Order
              </a>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div>
            <div className="ck-card">
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f1a0f", margin: "0 0 1.2rem" }}>
                Order Summary {!loading && cartItems.length > 0 && <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 400 }}>({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>}
              </h2>

              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "13px", fontFamily: "sans-serif" }}>Loading cart…</div>
              ) : cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛒</div>
                  <p style={{ fontSize: "14px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "14px" }}>Your cart is empty.</p>
                  <a href="/products" style={{ padding: "10px 22px", background: "#2d8a4e", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13.5px" }}>Browse Products</a>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {cartItems.map(p => (
                      <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6", gap: "10px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                          {p.quantityLabel && <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontFamily: "sans-serif" }}>{p.quantityLabel}</p>}
                          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6b7280", fontFamily: "sans-serif" }}>₹{p.price} × {cart[p._id]}</p>
                        </div>
                        <span style={{ fontWeight: 800, color: "#2d8a4e", fontSize: "14px", flexShrink: 0 }}>₹{p.price * cart[p._id]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "2px solid #f0fdf4" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "6px", fontFamily: "sans-serif" }}>
                      <span>Subtotal</span><span>₹{cartTotal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", fontFamily: "sans-serif" }}>
                      <span style={{ color: "#6b7280" }}>Delivery</span>
                      <span style={{ color: deliveryCost === 0 ? "#16a34a" : "#374151", fontWeight: deliveryCost === 0 ? 700 : 400 }}>
                        {deliveryCost === 0 ? "FREE 🎉" : `₹${deliveryCost}`}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "16px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
                      <span>Total</span><span style={{ color: "#1a3c2e" }}>₹{grandTotal}</span>
                    </div>
                    {cartTotal > 0 && cartTotal < DEL.freeDeliveryAbove && (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "7px", padding: "7px 10px", fontSize: "11.5px", color: "#166534", marginTop: "10px", fontFamily: "sans-serif" }}>
                        🚚 Add ₹{DEL.freeDeliveryAbove - cartTotal} more for <strong>free delivery!</strong>
                      </div>
                    )}
                    {cartTotal < DEL.minOrder && cartTotal > 0 && (
                      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "7px", padding: "7px 10px", fontSize: "11.5px", color: "#9a3412", marginTop: "8px", fontFamily: "sans-serif" }}>
                        ⚠️ Min order ₹{DEL.minOrder} — add ₹{DEL.minOrder - cartTotal} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Delivery info */}
            <div className="ck-card" style={{ marginTop: "1rem" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 10px", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Delivery Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#4b5563", fontFamily: "sans-serif" }}>
                <div>📅 <strong>Slots:</strong> Wednesday &amp; Saturday</div>
                <div>📦 <strong>Min order:</strong> ₹{DEL.minOrder}</div>
                <div>🚚 <strong>Free delivery</strong> above ₹{DEL.freeDeliveryAbove}</div>
                <div>💳 <strong>Pay on delivery</strong> — no advance</div>
                <div>🔄 <strong>Free replacement</strong> if not satisfied</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: "linear-gradient(180deg,#081812 0%,#060f0c 100%)", color: "#fff", marginTop: "2rem" }}>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
            <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#f4f6f0" />
          </svg>
        </div>
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", marginBottom: "4px" }}>
            © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.tagline}. All rights reserved. &nbsp;|&nbsp; {siteConfig.footer.developer}
          </p>
          <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.22)", fontFamily: "sans-serif" }}>
            {siteConfig.footer.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
