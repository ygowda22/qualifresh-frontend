"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { siteConfig } from "../../src/config/site";
import { saveAndClearCart } from "../lib/cartSync";
import { useCart } from "../context/CartContext";

interface UserData { name: string; email: string; token: string; phone?: string; }
interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
  _id: string; orderNumber: string; status: string; total: number; subtotal: number;
  deliveryCharge: number; deliveryAddress: string; deliverySlot: string;
  items: OrderItem[]; createdAt: string;
}
interface Address { id: string; label: string; line1: string; city: string; pincode?: string; }
interface WishProd { _id: string; name: string; price: number; imageUrl?: string; category: string; quantityLabel?: string; }

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
  const pathname = usePathname();

  // Core user + orders
  const [user, setUser]                 = useState<UserData | null>(null);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"orders" | "profile" | "addresses" | "wishlist">(() => {
    const seg = pathname?.split("/").pop() ?? "";
    return (["orders", "addresses", "wishlist", "profile"].includes(seg) ? seg : "profile") as "orders" | "profile" | "addresses" | "wishlist";
  });

  // Profile edit
  const [profEdit, setProfEdit]     = useState(false);
  const [profName, setProfName]     = useState("");
  const [profPhone, setProfPhone]   = useState("");
  const [profSaving, setProfSaving] = useState(false);
  const [profMsg, setProfMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Addresses
  const [addresses, setAddresses]     = useState<Address[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrEditId, setAddrEditId]   = useState<string | null>(null);
  const [addrLabel, setAddrLabel]     = useState("Home");
  const [addrLine1, setAddrLine1]     = useState("");
  const [addrCity, setAddrCity]       = useState("");
  const [addrPincode, setAddrPincode] = useState("");

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const [ordersPage, setOrdersPage]   = useState(1);
  const [addrsPage, setAddrsPage]     = useState(1);
  const [wishPage, setWishPage]       = useState(1);

  // Wishlist + cart (cart from global context — no local cart state)
  const { cart, setCart, addToCart: ctxAddToCart } = useCart();
  const [wishlist, setWishlist]     = useState<string[]>([]);
  const [wishProds, setWishProds]   = useState<WishProd[]>([]);

  useEffect(() => {
    document.title = "My Account – QualiFresh";
    try {
      const saved = localStorage.getItem("qf_user");
      if (!saved) { router.push("/"); return; }
      const u: UserData = JSON.parse(saved);
      setUser(u);
      loadOrders(u.token);
      loadWishlist(u.token);
    } catch { router.push("/"); }
    try {
      const a = localStorage.getItem("qf_addresses");
      if (a) setAddresses(JSON.parse(a));
    } catch {}
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

  async function loadWishlist(token: string) {
    try {
      const r = await fetch("/backend/api/users/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const d = await r.json();
        if (d?.wishlist) {
          const populated: WishProd[] = d.wishlist.filter((p: any) => typeof p === "object" && p._id);
          setWishProds(populated);
          setWishlist(populated.map(p => p._id));
          localStorage.setItem("qf_wishlist", JSON.stringify(populated.map(p => p._id)));
        }
      }
    } catch { /* ignore */ }
  }

  async function logout() {
    const token = user?.token;
    if (token) await saveAndClearCart(token, cart);
    setCart({});
    setWishlist([]);
    setWishProds([]);
    localStorage.removeItem("qf_user");
    localStorage.removeItem("qf_wishlist");
    router.push("/");
  }

  // ── Profile ──────────────────────────────────────────────────────────────────
  function startEditProfile() {
    if (!user) return;
    setProfName(user.name);
    setProfPhone(user.phone || "");
    setProfMsg(null);
    setProfEdit(true);
  }

  async function saveProfile() {
    if (!user || !profName.trim()) return;
    setProfSaving(true); setProfMsg(null);
    const updated: UserData = { ...user, name: profName.trim(), phone: profPhone.trim() || undefined };
    try {
      const r = await fetch("/backend/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: profName.trim(), phone: profPhone.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.user?.name) updated.name = d.user.name;
        if (d.user?.phone !== undefined) updated.phone = d.user.phone;
      }
    } catch { /* save locally on network error */ }
    setUser(updated);
    localStorage.setItem("qf_user", JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage", { key: "qf_user", newValue: JSON.stringify(updated) }));
    setProfEdit(false);
    setProfMsg({ type: "success", text: "Profile updated successfully!" });
    setProfSaving(false);
  }

  // ── Addresses ────────────────────────────────────────────────────────────────
  function saveAddress() {
    if (!addrLine1.trim() || !addrCity.trim()) return;
    const entry: Address = {
      id: addrEditId || Date.now().toString(),
      label: addrLabel, line1: addrLine1.trim(),
      city: addrCity.trim(), pincode: addrPincode.trim() || undefined,
    };
    const updated = addrEditId
      ? addresses.map(a => a.id === addrEditId ? entry : a)
      : [...addresses, entry];
    setAddresses(updated);
    localStorage.setItem("qf_addresses", JSON.stringify(updated));
    resetAddrForm();
  }

  function deleteAddress(id: string) {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("qf_addresses", JSON.stringify(updated));
  }

  function startEditAddress(a: Address) {
    setAddrEditId(a.id); setAddrLabel(a.label); setAddrLine1(a.line1);
    setAddrCity(a.city); setAddrPincode(a.pincode || "");
    setShowAddrForm(true);
  }

  function resetAddrForm() {
    setShowAddrForm(false); setAddrEditId(null);
    setAddrLabel("Home"); setAddrLine1(""); setAddrCity(""); setAddrPincode("");
  }

  // ── Wishlist ─────────────────────────────────────────────────────────────────
  function removeFromWishlist(id: string) {
    // Optimistic update
    setWishlist(prev => {
      const updated = prev.filter(w => w !== id);
      localStorage.setItem("qf_wishlist", JSON.stringify(updated));
      return updated;
    });
    setWishProds(prev => prev.filter(p => p._id !== id));
    // Sync to backend
    if (user) {
      fetch(`/backend/api/users/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      }).catch(() => { /* best-effort */ });
    }
  }

  function addToCart(id: string) { ctxAddToCart(id); }

  // wishProds is now populated directly from backend; filter just protects against stale state
  const wishlistProducts = wishProds.filter(p => wishlist.includes(p._id));

  function Pagination({ total, page, setPage }: { total: number; page: number; setPage: (p: number) => void }) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="up-pagination">
        <button className="up-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        {pages.map(p => (
          <button key={p} className={`up-page-btn${p === page ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="up-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
      </div>
    );
  }

  const pagedOrders   = orders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const pagedAddrs    = addresses.slice((addrsPage - 1) * ITEMS_PER_PAGE, addrsPage * ITEMS_PER_PAGE);
  const pagedWish     = wishlistProducts.slice((wishPage - 1) * ITEMS_PER_PAGE, wishPage * ITEMS_PER_PAGE);

  if (!user) return null;

  const NAV_ITEMS = [
    { id: "orders",    icon: "📦", label: "My Orders"  },
    { id: "profile",   icon: "👤", label: "Profile"    },
    { id: "addresses", icon: "📍", label: "Addresses"  },
    { id: "wishlist",  icon: "❤️", label: "Wishlist"   },
  ] as const;

  const fStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1.5px solid #e5e7eb", fontSize: "13.5px",
    boxSizing: "border-box", outline: "none", background: "#fff",
  };
  const lStyle: React.CSSProperties = {
    display: "block", fontSize: "11.5px", fontWeight: 700,
    color: "#374151", marginBottom: "4px",
  };

  return (
    <div className="up-page-bg" style={{ color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}


        /* Page wrapper */
        .up-page-bg{background:linear-gradient(180deg,#eef4ea 0%,#f4f6f0 120px);padding-bottom:2rem;}

        /* Pagination */
        .up-pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding-top:1.2rem;flex-wrap:wrap;}
        .up-page-btn{min-width:34px;height:34px;padding:0 10px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all .18s;display:flex;align-items:center;justify-content:center;}
        .up-page-btn:hover:not(:disabled){border-color:#2d8a4e;color:#2d8a4e;background:#f0fdf4;}
        .up-page-btn.active{background:#2d8a4e;color:#fff;border-color:#2d8a4e;}
        .up-page-btn:disabled{opacity:0.4;cursor:not-allowed;}

        /* Layout */
        .up-layout{max-width:1100px;margin:0 auto;padding:2rem 1.5rem;display:grid;grid-template-columns:256px 1fr;gap:1.5rem;align-items:start;}
        .up-card{background:#fff;border-radius:18px;box-shadow:0 2px 20px rgba(0,0,0,.06);border:1px solid #edf0ea;}

        /* Sidebar */
        .up-sidebar{position:sticky;top:1.5rem;overflow:hidden;}
        .up-profile-hero{background:linear-gradient(135deg,#1a3c2e 0%,#2d8a4e 100%);padding:1.8rem 1.5rem;text-align:center;position:relative;overflow:hidden;}
        .up-profile-hero::after{content:'';position:absolute;top:-40px;right:-40px;width:130px;height:130px;border-radius:50%;background:rgba(163,230,53,0.12);pointer-events:none;}
        .up-avatar{width:76px;height:76px;border-radius:50%;background:rgba(255,255,255,0.18);border:3px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff;font-weight:800;margin:0 auto 12px;backdrop-filter:blur(4px);}
        .up-hero-name{font-weight:800;font-size:15px;color:#fff;margin-bottom:4px;}
        .up-hero-email{font-size:11.5px;color:rgba(255,255,255,0.65);word-break:break-all;}
        .up-nav-list{padding:8px 0;}
        .up-nav-item{display:flex;align-items:center;gap:10px;padding:11px 1.2rem;cursor:pointer;transition:all .18s;border-left:3px solid transparent;font-size:13.5px;font-weight:600;color:#4b5563;}
        .up-nav-item:hover{background:#f0fdf4;color:#2d8a4e;}
        .up-nav-item.active{background:#f0fdf4;color:#166534;border-left-color:#2d8a4e;font-weight:700;}
        .up-nav-icon{font-size:17px;width:22px;text-align:center;flex-shrink:0;}
        .up-logout-wrap{padding:0.9rem 1.1rem;border-top:1px solid #f1f5f9;}

        /* Content area */
        .up-section-title{font-size:1rem;font-weight:800;color:#0f1a0f;padding:1.2rem 1.5rem;border-bottom:1px solid #f4f6f0;display:flex;align-items:center;gap:9px;letter-spacing:-0.01em;}
        .up-section-body{padding:1.3rem 1.5rem;}

        /* Order cards */
        .up-order-card{border:1.5px solid #e9ede4;border-radius:13px;padding:1.1rem 1.2rem;margin-bottom:0.8rem;transition:box-shadow .2s,border-color .2s;background:#fafcf8;}
        .up-order-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.08);border-color:#b6d6c2;}
        .up-order-card:last-child{margin-bottom:0;}

        /* Profile rows */
        .up-profile-row{display:flex;align-items:center;padding:13px 0;border-bottom:1px solid #f4f6f0;}
        .up-profile-row:last-child{border-bottom:none;}
        .up-profile-label{width:135px;font-size:11.5px;color:#9ca3af;font-weight:700;flex-shrink:0;text-transform:uppercase;letter-spacing:0.06em;}
        .up-profile-value{font-size:14px;color:#111827;font-weight:500;}

        /* Empty state */
        .up-empty{text-align:center;padding:3.5rem 1rem;color:#9ca3af;}
        .up-empty-icon{font-size:52px;margin-bottom:1rem;opacity:.8;}
        .up-empty-title{font-weight:800;font-size:15px;color:#374151;margin-bottom:8px;}
        .up-empty-text{font-size:13px;max-width:300px;margin:0 auto 1.5rem;line-height:1.6;color:#9ca3af;}
        .up-empty-cta{display:inline-block;padding:11px 28px;background:#2d8a4e;color:#fff;border-radius:10px;font-weight:700;font-size:13.5px;text-decoration:none;transition:background .2s;}
        .up-empty-cta:hover{background:#1f6b3a;}

        /* Address cards */
        .up-addr-card{border:1.5px solid #e9ede4;border-radius:13px;padding:1rem 1.2rem;margin-bottom:0.75rem;display:flex;align-items:flex-start;gap:12px;transition:border-color .2s,box-shadow .2s;background:#fafcf8;}
        .up-addr-card:hover{border-color:#2d8a4e;box-shadow:0 4px 16px rgba(45,138,78,.08);}
        .up-addr-card:last-child{margin-bottom:0;}
        .up-addr-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}

        /* Wishlist grid */
        .up-wish-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;}
        .up-wish-card{border:1.5px solid #e9ede4;border-radius:13px;overflow:hidden;transition:box-shadow .2s,border-color .2s;background:#fff;}
        .up-wish-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.1);border-color:#b6d6c2;}

        /* Input focus */
        .up-inp:focus{border-color:#2d8a4e!important;box-shadow:0 0 0 3px rgba(45,138,78,0.1)!important;outline:none;}
        select.up-inp:focus{border-color:#2d8a4e!important;}

        /* Badge pill */
        .up-count-pill{margin-left:auto;font-size:11.5px;padding:3px 10px;border-radius:20px;font-weight:700;}

        /* Hide on mobile — Sign Out lives in the SiteNav mobile slide-in menu */
        .up-hide-mobile{}

        /* Mobile */
        @media(max-width:768px){
          .up-layout{grid-template-columns:1fr;gap:1rem;padding:1rem;}
          .up-sidebar{position:static;display:none;}
          .up-hide-mobile{display:none!important;}
          .up-card{width:100%;min-width:0;overflow:hidden;}
          .up-section-body{padding:1rem;}
          .up-section-title{padding:1rem 1.1rem;font-size:0.93rem;}
          .up-wish-grid{grid-template-columns:repeat(2,1fr);}
          .up-addr-actions{flex-direction:row!important;}
          .up-profile-label{width:auto;min-width:90px;flex-shrink:0;}
          .up-profile-value{font-size:13px;word-break:break-word;min-width:0;}
          .up-order-amount{min-width:70px;}
        }
        @media(max-width:480px){
          .up-layout{padding:0.5rem;}
          .up-wish-grid{grid-template-columns:repeat(2,1fr);gap:0.6rem;}
          .up-addr-grid{grid-template-columns:1fr!important;}
          .up-section-body{padding:0.85rem;}
          .up-profile-label{font-size:10.5px;min-width:80px;}
        }
        nextjs-portal{display:none!important}
      `}</style>

      <div className="up-layout">

        {/* ── Sidebar ── */}
        <aside className="up-card up-sidebar">
          <div className="up-profile-hero">
            <div className="up-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <p className="up-hero-name">{user.name}</p>
            <p className="up-hero-email">{user.email}</p>
          </div>
          <nav className="up-nav-list">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`up-nav-item${activeSection === item.id ? " active" : ""}`} onClick={() => { setActiveSection(item.id); setOrdersPage(1); setAddrsPage(1); setWishPage(1); }}>
                <span className="up-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
          <div className="up-logout-wrap">
            <button onClick={logout}
              style={{ width: "100%", padding: "10px", borderRadius: "9px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit", transition: "all .2s" }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ display: "flex", flexDirection: "column" }}>

          {/* ─── ORDERS ─── */}
          {activeSection === "orders" && (
            <div className="up-card">
              <div className="up-section-title">
                <span>📦</span> Order History
                {orders.length > 0 && <span className="up-count-pill" style={{ background: "#f0fdf4", color: "#166534" }}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>}
              </div>
              <div className="up-section-body">
                {ordersLoading ? (
                  <div className="up-empty">
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏳</div>
                    <p style={{ fontSize: "13px" }}>Loading orders…</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="up-empty">
                    <div className="up-empty-icon">📦</div>
                    <p className="up-empty-title">No orders yet</p>
                    <p className="up-empty-text">Start shopping to place your first order!</p>
                    <button onClick={() => router.push("/products")} className="up-empty-cta">Shop Now →</button>
                  </div>
                ) : (
                  <>
                    {pagedOrders.map(order => (
                      <div key={order._id} className="up-order-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                              <span style={{ fontWeight: 800, fontSize: "14px", color: "#2d8a4e" }}>{order.orderNumber}</span>
                              <span style={{ background: (STATUS_COLORS[order.status] || "#9ca3af") + "22", color: STATUS_COLORS[order.status] || "#9ca3af", fontSize: "11px", padding: "3px 10px", borderRadius: "6px", fontWeight: 700 }}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 4px" }}>
                              {order.items?.slice(0, 3).map((item, i) => (
                                <span key={i}>{item.name} ×{item.quantity}{i < Math.min(order.items.length, 3) - 1 ? ", " : ""}</span>
                              ))}
                              {order.items?.length > 3 && <span> +{order.items.length - 3} more</span>}
                            </p>
                            {order.deliveryAddress && <p style={{ fontSize: "11.5px", color: "#9ca3af", margin: 0 }}>📍 {order.deliveryAddress}</p>}
                          </div>
                          <div className="up-order-amount" style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: "16px", color: "#111827" }}>₹{order.total}</div>
                            <div style={{ fontSize: "11.5px", color: "#9ca3af", marginTop: "3px" }}>{fmtDate(order.createdAt)}</div>
                            {order.deliverySlot && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>🕐 {order.deliverySlot}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Pagination total={orders.length} page={ordersPage} setPage={setOrdersPage} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {activeSection === "profile" && (
            <div className="up-card">
              <div className="up-section-title">
                <span>👤</span> Profile Details
                {!profEdit && (
                  <button onClick={startEditProfile}
                    style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: "7px", border: "1.5px solid #2d8a4e", background: "#f0fdf4", color: "#2d8a4e", cursor: "pointer", fontSize: "12.5px", fontWeight: 700, fontFamily: "inherit" }}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              <div className="up-section-body">
                {profMsg && (
                  <div style={{ background: profMsg.type === "success" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${profMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`, borderRadius: "8px", padding: "9px 14px", marginBottom: "1rem", fontSize: "13px", color: profMsg.type === "success" ? "#166534" : "#dc2626" }}>
                    {profMsg.type === "success" ? "✅ " : "❌ "}{profMsg.text}
                  </div>
                )}

                {profEdit ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={lStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                      <input className="up-inp" value={profName} onChange={e => setProfName(e.target.value)} placeholder="Your full name" style={fStyle}
                        onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>
                    <div>
                      <label style={lStyle}>Email</label>
                      <input value={user.email} disabled style={{ ...fStyle, background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }} />
                      <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "3px" }}>Email cannot be changed. Contact support if needed.</p>
                    </div>
                    <div>
                      <label style={lStyle}>Mobile Number</label>
                      <input className="up-inp" type="tel" value={profPhone} onChange={e => setProfPhone(e.target.value)} placeholder="10-digit mobile number" style={fStyle}
                        onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button onClick={saveProfile} disabled={profSaving || !profName.trim()}
                        style={{ padding: "10px 22px", background: (profSaving || !profName.trim()) ? "#e5e7eb" : "#2d8a4e", color: (profSaving || !profName.trim()) ? "#9ca3af" : "#fff", border: "none", borderRadius: "9px", cursor: (profSaving || !profName.trim()) ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "13.5px", fontFamily: "inherit" }}>
                        {profSaving ? "Saving…" : "Save Changes"}
                      </button>
                      <button onClick={() => { setProfEdit(false); setProfMsg(null); }}
                        style={{ padding: "10px 18px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "9px", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "inherit", color: "#6b7280" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="up-profile-row">
                      <span className="up-profile-label">Name</span>
                      <span className="up-profile-value">{user.name}</span>
                    </div>
                    <div className="up-profile-row">
                      <span className="up-profile-label">Email</span>
                      <span className="up-profile-value">{user.email}</span>
                    </div>
                    <div className="up-profile-row">
                      <span className="up-profile-label">Phone</span>
                      <span className="up-profile-value">{user.phone || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Not set</span>}</span>
                    </div>
                    <div className="up-profile-row">
                      <span className="up-profile-label">Member Since</span>
                      <span className="up-profile-value">QualiFresh Customer</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "1.5rem" }}>
                      <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25d366", color: "#fff", padding: "11px 20px", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>
                        💬 WhatsApp Support
                      </a>
                      <button onClick={logout} className="up-hide-mobile"
                        style={{ padding: "11px 20px", borderRadius: "9px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit" }}>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── ADDRESSES ─── */}
          {activeSection === "addresses" && (
            <div className="up-card">
              <div className="up-section-title">
                <span>📍</span> Saved Addresses
                <button onClick={() => { resetAddrForm(); setShowAddrForm(true); }}
                  style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: "7px", border: "1.5px solid #2d8a4e", background: "#f0fdf4", color: "#2d8a4e", cursor: "pointer", fontSize: "12.5px", fontWeight: 700, fontFamily: "inherit" }}>
                  + Add New
                </button>
              </div>
              <div className="up-section-body">

                {/* Inline form */}
                {showAddrForm && (
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1.2rem", marginBottom: "1.2rem", border: "1.5px solid #e5e7eb" }}>
                    <p style={{ fontWeight: 700, fontSize: "13.5px", color: "#111827", marginBottom: "12px" }}>
                      {addrEditId ? "✏️ Edit Address" : "➕ New Address"}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <label style={lStyle}>Label</label>
                        <select className="up-inp" value={addrLabel} onChange={e => setAddrLabel(e.target.value)} style={{ ...fStyle, cursor: "pointer" }}>
                          <option>Home</option>
                          <option>Work</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={lStyle}>Street Address <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="up-inp" value={addrLine1} onChange={e => setAddrLine1(e.target.value)} placeholder="Flat, Street, Area, Landmark" style={fStyle}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      <div className="up-addr-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={lStyle}>City <span style={{ color: "#ef4444" }}>*</span></label>
                          <input className="up-inp" value={addrCity} onChange={e => setAddrCity(e.target.value)} placeholder="Pune / Mumbai" style={fStyle}
                            onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                        </div>
                        <div>
                          <label style={lStyle}>Pincode</label>
                          <input className="up-inp" value={addrPincode} onChange={e => setAddrPincode(e.target.value)} placeholder="411001" style={fStyle}
                            onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <button onClick={saveAddress} disabled={!addrLine1.trim() || !addrCity.trim()}
                          style={{ padding: "9px 20px", background: (!addrLine1.trim() || !addrCity.trim()) ? "#e5e7eb" : "#2d8a4e", color: (!addrLine1.trim() || !addrCity.trim()) ? "#9ca3af" : "#fff", border: "none", borderRadius: "8px", cursor: (!addrLine1.trim() || !addrCity.trim()) ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit" }}>
                          {addrEditId ? "Update" : "Save Address"}
                        </button>
                        <button onClick={resetAddrForm}
                          style={{ padding: "9px 16px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "inherit", color: "#6b7280" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address list */}
                {addresses.length === 0 && !showAddrForm ? (
                  <div className="up-empty">
                    <div className="up-empty-icon">📍</div>
                    <p className="up-empty-title">No saved addresses</p>
                    <p className="up-empty-text">Click &quot;+ Add New&quot; above to save your delivery address.</p>
                  </div>
                ) : (
                  <>
                    {pagedAddrs.map(a => (
                      <div key={a.id} className="up-addr-card">
                        <div className="up-addr-icon">
                          {a.label === "Home" ? "🏠" : a.label === "Work" ? "🏢" : "📍"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#2d8a4e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{a.label}</div>
                          <div style={{ fontSize: "13.5px", color: "#111827", lineHeight: 1.5 }}>{a.line1}</div>
                          <div style={{ fontSize: "12.5px", color: "#6b7280" }}>{a.city}{a.pincode ? ` — ${a.pincode}` : ""}</div>
                        </div>
                        <div className="up-addr-actions" style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => startEditAddress(a)}
                            style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "11.5px", fontWeight: 600, fontFamily: "inherit" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteAddress(a.id)}
                            style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "11.5px", fontWeight: 600, fontFamily: "inherit" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <Pagination total={addresses.length} page={addrsPage} setPage={setAddrsPage} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── WISHLIST ─── */}
          {activeSection === "wishlist" && (
            <div className="up-card">
              <div className="up-section-title">
                <span>❤️</span> Wishlist
                {wishlistProducts.length > 0 && (
                  <span className="up-count-pill" style={{ background: "#fef2f2", color: "#dc2626" }}>
                    {wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="up-section-body">
                {wishlistProducts.length === 0 ? (
                  <div className="up-empty">
                    <div className="up-empty-icon">❤️</div>
                    <p className="up-empty-title">Your wishlist is empty</p>
                    <p className="up-empty-text">Tap the ❤️ on any product to save it here for quick reordering.</p>
                    <button onClick={() => router.push("/products")} className="up-empty-cta">Explore Products</button>
                  </div>
                ) : (
                  <>
                    <div className="up-wish-grid">
                      {pagedWish.map(p => (
                        <div key={p._id} className="up-wish-card">
                          <div style={{ height: "120px", overflow: "hidden", background: "#f0fdf4", position: "relative" }}>
                            {p.imageUrl && p.imageUrl.startsWith("http")
                              ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>🥬</div>
                            }
                            <button onClick={() => removeFromWishlist(p._id)} title="Remove from wishlist"
                              style={{ position: "absolute", top: "7px", right: "7px", width: "28px", height: "28px", borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", boxShadow: "0 2px 8px rgba(0,0,0,.18)" }}>
                              ❤️
                            </button>
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                            {p.quantityLabel && <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 4px" }}>{p.quantityLabel}</p>}
                            <p style={{ fontSize: "14px", fontWeight: 800, color: "#2d8a4e", margin: "0 0 8px" }}>₹{p.price}</p>
                            <button onClick={() => addToCart(p._id)}
                              style={{ width: "100%", padding: "7px", borderRadius: "7px", border: "none", background: "#2d8a4e", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "inherit" }}>
                              + Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination total={wishlistProducts.length} page={wishPage} setPage={setWishPage} />
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button onClick={() => router.push("/products")} style={{ background: "none", border: "none", color: "#2d8a4e", fontWeight: 600, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back to Shop</button>
          </div>
        </main>
      </div>
    </div>
  );
}
