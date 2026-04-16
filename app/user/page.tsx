"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "../../src/config/site";
import SiteNav from "../components/SiteNav";

interface UserData { name: string; email: string; token: string; phone?: string; }
interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
  _id: string; orderNumber: string; status: string; total: number; subtotal: number;
  deliveryCharge: number; deliveryAddress: string; deliverySlot: string;
  items: OrderItem[]; createdAt: string;
}

const { delivery: DEL } = siteConfig;

const TICKER_ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", out_for_delivery: "#8b5cf6",
  delivered: "#16a34a", cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", cancelled: "Cancelled",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"orders" | "profile" | "addresses" | "wishlist">("orders");

  useEffect(() => {
    document.title = "My Account – QualiFresh";
    try {
      const saved = localStorage.getItem("qf_user");
      if (!saved) { router.push("/"); return; }
      const u: UserData = JSON.parse(saved);
      setUser(u);
      loadOrders(u.token);
    } catch { router.push("/"); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadOrders(token: string) {
    setOrdersLoading(true);
    try {
      const r = await fetch("/backend/api/orders/my", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (r.ok) { const d = await r.json(); setOrders(d.orders || d || []); }
    } catch { /* ignore */ }
    finally { setOrdersLoading(false); }
  }

  function logout() {
    localStorage.removeItem("qf_user");
    router.push("/");
  }

  if (!user) return null;

  const NAV_ITEMS = [
    { id: "orders",    icon: "📦", label: "My Orders" },
    { id: "profile",   icon: "👤", label: "Profile" },
    { id: "addresses", icon: "📍", label: "Addresses" },
    { id: "wishlist",  icon: "❤️", label: "Wishlist" },
  ] as const;

  return (
    <div style={{ fontFamily: "'Inter','Poppins',-apple-system,sans-serif", background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}

        /* Ticker */
        .up-ticker-desktop{display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:6px 1rem;overflow:hidden;width:100%;background:#0f8a65;}
        .up-ticker-mobile{display:none;width:100%;background:#0f8a65;border-bottom:1px solid #0a6e50;}
        @media(max-width:1024px){
          .up-ticker-desktop{display:none}
          .up-ticker-mobile{display:block;overflow:hidden;padding:5px 0;height:34px}
          .up-ticker-scroll{display:inline-flex;animation:upticker 30s linear infinite;white-space:nowrap}
          .up-ticker-scroll:hover{animation-play-state:paused}
        }
        @keyframes upticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* Layout */
        .up-layout{max-width:1100px;margin:0 auto;padding:2rem 1.5rem;display:grid;grid-template-columns:240px 1fr;gap:1.5rem;align-items:start;}
        .up-card{background:#fff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,.06);border:1px solid #f1f5f9;}

        /* Sidebar */
        .up-sidebar{position:sticky;top:1.5rem;}
        .up-profile-hero{padding:1.5rem;text-align:center;border-bottom:1px solid #f1f5f9;}
        .up-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#2d8a4e,#a3e635);display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;font-weight:800;margin:0 auto 12px;}
        .up-nav-item{display:flex;align-items:center;gap:10px;padding:12px 1.2rem;cursor:pointer;transition:all .18s;border-left:3px solid transparent;font-size:14px;font-weight:600;color:#4b5563;}
        .up-nav-item:hover{background:#f7faf8;color:#2d8a4e;}
        .up-nav-item.active{background:#f0fdf4;color:#2d8a4e;border-left-color:#2d8a4e;}

        /* Content area */
        .up-section-title{font-size:1.05rem;font-weight:800;color:#111827;padding:1.2rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:8px;}
        .up-section-body{padding:1.2rem 1.5rem;}

        /* Order cards */
        .up-order-card{border:1px solid #e5e7eb;border-radius:12px;padding:1.1rem 1.2rem;margin-bottom:0.8rem;transition:box-shadow .2s;}
        .up-order-card:hover{box-shadow:0 4px 18px rgba(0,0,0,.09);}
        .up-order-card:last-child{margin-bottom:0;}

        /* Profile rows */
        .up-profile-row{display:flex;align-items:center;padding:13px 0;border-bottom:1px solid #f8f9fa;}
        .up-profile-row:last-child{border-bottom:none;}
        .up-profile-label{width:130px;font-size:12.5px;color:#9ca3af;font-weight:700;flex-shrink:0;text-transform:uppercase;letter-spacing:0.04em;}
        .up-profile-value{font-size:14px;color:#111827;font-weight:500;}

        /* Empty state */
        .up-empty{text-align:center;padding:3rem 1rem;color:#9ca3af;}

        /* Mobile: stack layout */
        @media(max-width:768px){
          .up-layout{grid-template-columns:1fr;gap:1rem;}
          .up-sidebar{position:static;}
          .up-profile-hero{padding:1.2rem;}
          .up-avatar{width:60px;height:60px;font-size:24px;}
          .up-section-body{padding:1rem;}
          .up-section-title{padding:1rem;}
        }
        @media(max-width:480px){
          .up-layout{padding:1rem;}
          .up-nav-item{padding:11px 1rem;}
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* ── Ticker (desktop) ── */}
      <div className="up-ticker-desktop">
        {TICKER_ITEMS.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
            {i > 0 && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ee7b7", marginRight: "16px", flexShrink: 0 }} />}
            {item}
          </span>
        ))}
      </div>

      {/* ── Ticker (mobile scrolling) ── */}
      <div className="up-ticker-mobile">
        <div className="up-ticker-scroll">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ee7b7", marginLeft: "22px", flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── Navbar via SiteNav (100% identical across all pages) ── */}
      <SiteNav />

      {/* ── Page body ── */}
      <div className="up-layout">

        {/* ── Sidebar ── */}
        <aside className="up-card up-sidebar">
          {/* Profile hero */}
          <div className="up-profile-hero">
            <div className="up-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <p style={{ fontWeight: 800, fontSize: "15px", color: "#0f1a0f", marginBottom: "3px" }}>{user.name}</p>
            <p style={{ fontSize: "12px", color: "#6b7280", wordBreak: "break-all" }}>{user.email}</p>
          </div>

          {/* Section nav */}
          <nav>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`up-nav-item${activeSection === item.id ? " active" : ""}`} onClick={() => setActiveSection(item.id)}>
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: "1rem 1.2rem", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={logout}
              style={{ width: "100%", padding: "10px", borderRadius: "9px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", transition: "all .2s" }}>
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ display: "flex", flexDirection: "column", gap: "0" }}>

          {/* ─── ORDERS ─── */}
          {activeSection === "orders" && (
            <div className="up-card">
              <div className="up-section-title">
                <span>📦</span> Order History
                {orders.length > 0 && <span style={{ marginLeft: "auto", background: "#f0fdf4", color: "#166534", fontSize: "12px", padding: "3px 10px", borderRadius: "6px", fontWeight: 700 }}>{orders.length} orders</span>}
              </div>
              <div className="up-section-body">
                {ordersLoading ? (
                  <div className="up-empty">
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
                    <p style={{ fontFamily: "sans-serif", fontSize: "13px" }}>Loading orders…</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="up-empty">
                    <div style={{ fontSize: "52px", marginBottom: "1rem" }}>📦</div>
                    <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", marginBottom: "8px" }}>No orders yet</p>
                    <p style={{ fontSize: "13px", fontFamily: "sans-serif", marginBottom: "1.5rem" }}>Start shopping to place your first order!</p>
                    <a href="/products" style={{ display: "inline-block", padding: "11px 28px", background: "#2d8a4e", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Shop Now →</a>
                  </div>
                ) : orders.map(order => (
                  <div key={order._id} className="up-order-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 800, fontSize: "14px", color: "#2d8a4e" }}>{order.orderNumber}</span>
                          <span style={{ background: (STATUS_COLORS[order.status] || "#9ca3af") + "22", color: STATUS_COLORS[order.status] || "#9ca3af", fontSize: "11px", padding: "3px 10px", borderRadius: "6px", fontWeight: 700 }}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#6b7280", fontFamily: "sans-serif", lineHeight: 1.6, margin: "0 0 4px" }}>
                          {order.items?.slice(0, 3).map((item, i) => (
                            <span key={i}>{item.name} ×{item.quantity}{i < Math.min(order.items.length, 3) - 1 ? ", " : ""}</span>
                          ))}
                          {order.items?.length > 3 && <span> +{order.items.length - 3} more</span>}
                        </p>
                        {order.deliveryAddress && <p style={{ fontSize: "11.5px", color: "#9ca3af", margin: 0 }}>📍 {order.deliveryAddress}</p>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: "16px", color: "#111827" }}>₹{order.total}</div>
                        <div style={{ fontSize: "11.5px", color: "#9ca3af", marginTop: "3px" }}>{fmtDate(order.createdAt)}</div>
                        {order.deliverySlot && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>🕐 {order.deliverySlot}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {activeSection === "profile" && (
            <div className="up-card">
              <div className="up-section-title"><span>👤</span> Profile Details</div>
              <div className="up-section-body">
                <div className="up-profile-row">
                  <span className="up-profile-label">Name</span>
                  <span className="up-profile-value">{user.name}</span>
                </div>
                <div className="up-profile-row">
                  <span className="up-profile-label">Email</span>
                  <span className="up-profile-value">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="up-profile-row">
                    <span className="up-profile-label">Phone</span>
                    <span className="up-profile-value">{user.phone}</span>
                  </div>
                )}
                <div className="up-profile-row">
                  <span className="up-profile-label">Member Since</span>
                  <span className="up-profile-value">QualiFresh Customer</span>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "1.5rem" }}>
                  <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25d366", color: "#fff", padding: "11px 20px", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>
                    💬 WhatsApp Support
                  </a>
                  <button onClick={logout}
                    style={{ padding: "11px 20px", borderRadius: "9px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit" }}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── ADDRESSES ─── */}
          {activeSection === "addresses" && (
            <div className="up-card">
              <div className="up-section-title"><span>📍</span> Saved Addresses</div>
              <div className="up-section-body">
                <div className="up-empty">
                  <div style={{ fontSize: "44px", marginBottom: "1rem" }}>📍</div>
                  <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", marginBottom: "8px" }}>No saved addresses</p>
                  <p style={{ fontSize: "13px", fontFamily: "sans-serif", maxWidth: "300px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
                    Your delivery address from your next order will appear here.
                  </p>
                  <a href="/products" style={{ display: "inline-block", padding: "11px 24px", background: "#2d8a4e", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", textDecoration: "none" }}>Browse Products</a>
                </div>
              </div>
            </div>
          )}

          {/* ─── WISHLIST ─── */}
          {activeSection === "wishlist" && (
            <div className="up-card">
              <div className="up-section-title"><span>❤️</span> Wishlist</div>
              <div className="up-section-body">
                <div className="up-empty">
                  <div style={{ fontSize: "44px", marginBottom: "1rem" }}>❤️</div>
                  <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", marginBottom: "8px" }}>Your wishlist is empty</p>
                  <p style={{ fontSize: "13px", fontFamily: "sans-serif", maxWidth: "300px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
                    Save your favourite exotic vegetables here for quick reordering.
                  </p>
                  <a href="/products" style={{ display: "inline-block", padding: "11px 24px", background: "#2d8a4e", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", textDecoration: "none" }}>Explore Products</a>
                </div>
              </div>
            </div>
          )}

          {/* Back to shop */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <a href="/products" style={{ color: "#2d8a4e", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>← Back to Shop</a>
          </div>
        </main>
      </div>
    </div>
  );
}
