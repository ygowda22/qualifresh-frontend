"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "../../src/config/site";

interface UserData { name: string; email: string; token: string; phone?: string; }
interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
  _id: string; orderNumber: string; status: string; total: number; subtotal: number;
  deliveryCharge: number; deliveryAddress: string; deliverySlot: string;
  items: OrderItem[]; createdAt: string;
}

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
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

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

  const tabs = [
    { id: "orders", label: "📦 My Orders" },
    { id: "profile", label: "👤 Profile" },
  ] as const;

  return (
    <div style={{ fontFamily: "'Inter','Poppins',-apple-system,sans-serif", background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        .user-nav{background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:68px;position:sticky;top:0;z-index:200;box-shadow:0 1px 0 #e9ede4,0 4px 20px rgba(0,0,0,.08);}
        .user-wrap{max-width:1000px;margin:0 auto;padding:2rem 1.5rem;}
        .user-card{background:#fff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,.06);border:1px solid #f1f5f9;padding:1.5rem;}
        .user-tabs{display:flex;gap:6px;background:#f3f4f6;border-radius:12px;padding:4px;margin-bottom:1.5rem;}
        .user-tab{flex:1;padding:10px;border:none;border-radius:9px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:all .2s;}
        .user-tab.active{background:#fff;color:#166534;box-shadow:0 1px 4px rgba(0,0,0,.12);}
        .user-tab:not(.active){background:transparent;color:#6b7280;}
        .order-card{border:1px solid #e5e7eb;border-radius:12px;padding:1.2rem;margin-bottom:1rem;transition:box-shadow .2s;}
        .order-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
        .order-items{font-size:12px;color:#6b7280;margin-top:6px;line-height:1.6;}
        .profile-row{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9;}
        .profile-label{width:120px;font-size:13px;color:#9ca3af;font-weight:600;flex-shrink:0;}
        .profile-value{font-size:14px;color:#111827;font-weight:500;}
        @media(max-width:600px){
          .user-nav{padding:0 1rem;}
          .user-wrap{padding:1.5rem 1rem;}
          .user-card{padding:1rem;}
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* Navbar */}
      <nav className="user-nav">
        <a href="/" style={{ lineHeight: 0 }}>
          <img src="/logo.png" alt="QualiFresh" style={{ height: "44px", width: "auto", objectFit: "contain" }} />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#2d8a4e" }}>Hi, {user.name.split(" ")[0]}</span>
          <button onClick={logout}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="user-wrap">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg,#2d8a4e,#a3e635)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#fff", fontWeight: 800, flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f1a0f", marginBottom: "2px" }}>{user.name}</h1>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="user-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`user-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="user-card">
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Order History</h2>
            {ordersLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
                <p style={{ fontFamily: "sans-serif", fontSize: "13px" }}>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "52px", marginBottom: "1rem" }}>📦</div>
                <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", marginBottom: "8px" }}>No orders yet</p>
                <p style={{ fontSize: "13px", fontFamily: "sans-serif", marginBottom: "1.5rem" }}>Start shopping to place your first order!</p>
                <a href="/products" style={{ display: "inline-block", padding: "11px 28px", background: "#2d8a4e", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Shop Now</a>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="order-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: "15px", color: "#2d8a4e" }}>{order.orderNumber}</span>
                        <span style={{ background: (STATUS_COLORS[order.status] || "#9ca3af") + "20", color: STATUS_COLORS[order.status] || "#9ca3af", fontSize: "11px", padding: "3px 10px", borderRadius: "6px", fontWeight: 700 }}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <span key={i}>{item.name} ×{item.quantity}{i < Math.min(order.items.length, 3) - 1 ? ", " : ""}</span>
                        ))}
                        {order.items?.length > 3 && <span> +{order.items.length - 3} more</span>}
                      </div>
                      {order.deliveryAddress && (
                        <div style={{ fontSize: "11.5px", color: "#9ca3af", marginTop: "4px" }}>📍 {order.deliveryAddress}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "16px", color: "#111827" }}>₹{order.total}</div>
                      <div style={{ fontSize: "11.5px", color: "#9ca3af", marginTop: "2px" }}>{fmtDate(order.createdAt)}</div>
                      {order.deliverySlot && (
                        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>🕐 {order.deliverySlot}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="user-card">
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Profile Details</h2>
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{user.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user.email}</span>
            </div>
            {user.phone && (
              <div className="profile-row">
                <span className="profile-label">Phone</span>
                <span className="profile-value">{user.phone}</span>
              </div>
            )}
            <div style={{ paddingTop: "1.5rem" }}>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25d366", color: "#fff", padding: "11px 22px", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "13px", marginRight: "10px" }}>
                💬 WhatsApp Support
              </a>
              <button onClick={logout}
                style={{ padding: "11px 22px", borderRadius: "9px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit" }}>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Back to shop */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/products" style={{ color: "#2d8a4e", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>← Back to Shop</a>
        </div>
      </div>
    </div>
  );
}
