"use client";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../../src/config/site";

interface Props { activePage?: "about-us" | "our-farms" | "products" | "contact"; }
interface Product { _id: string; name: string; price: number; slug: string; imageUrl?: string; category: string; quantityLabel?: string; }

const { delivery: DEL } = siteConfig;

function CartSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
}
function UserSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}

export default function SiteNav({ activePage }: Props) {
  const navRef    = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Products (for search + cart display)
  const [products, setProducts] = useState<Product[]>([]);

  // Cart state — synced with qf_cart localStorage
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [cartEnabled, setCartEnabled] = useState(true);

  // Checkout flow (step 1 = cart, step 2 = form, step 3 = confirmed)
  const [cartStep, setCartStep]       = useState<1|2|3>(1);
  const [ckName, setCkName]           = useState("");
  const [ckEmail, setCkEmail]         = useState("");
  const [ckPhone, setCkPhone]         = useState("");
  const [ckAddress, setCkAddress]     = useState("");
  const [ckCity, setCkCity]           = useState("Pune");
  const [ckSlot, setCkSlot]           = useState("Wednesday");
  const [ckNotes, setCkNotes]         = useState("");
  const [ckLoading, setCkLoading]     = useState(false);
  const [ckOrderNum, setCkOrderNum]   = useState("");
  const [ckError, setCkError]         = useState("");

  // User
  const [user, setUser] = useState<{ name: string; email: string; token: string } | null>(null);

  // Nav
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dropdownTop, setDropdownTop] = useState<number | undefined>();

  // Search
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Login modal
  const [showLogin, setShowLogin]   = useState(false);
  const [authTab, setAuthTab]       = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail]   = useState("");
  const [authPass, setAuthPass]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showPass2, setShowPass2]   = useState(false);
  const [regName, setRegName]       = useState("");
  const [regPhone, setRegPhone]     = useState("");
  const [regPass2, setRegPass2]     = useState("");
  const [authError, setAuthError]   = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ── Fetch products ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/backend/api/products")
      .then(r => r.json())
      .then(d => {
        const prods = Array.isArray(d) ? d : [];
        setProducts(prods);
        try {
          const cache = JSON.stringify(prods.map((p: Product) => ({ _id: p._id, name: p.name, price: p.price, slug: p.slug })));
          localStorage.setItem("qf_products_cache", cache);
          window.dispatchEvent(new StorageEvent("storage", { key: "qf_products_cache", newValue: cache }));
        } catch {}
      })
      .catch(() => {});
  }, []);

  // ── Load user + cart + settings from localStorage ───────────────────────────
  useEffect(() => {
    const load = () => {
      try {
        const u = localStorage.getItem("qf_user");
        setUser(u ? JSON.parse(u) : null);
        const c = localStorage.getItem("qf_cart");
        setCart(c ? JSON.parse(c) : {});
        setCartEnabled(localStorage.getItem("qf_cart_enabled") !== "false");
      } catch { /* ignore */ }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  // ── Mobile menu top position ────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (navRef.current) setDropdownTop(navRef.current.getBoundingClientRect().bottom);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update); };
  }, [mobileMenu]);

  // ── Close search on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  function updateCart(updated: Record<string, number>) {
    setCart(updated);
    localStorage.setItem("qf_cart", JSON.stringify(updated));
  }
  function addToCart(id: string) {
    updateCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  }
  function removeFromCart(id: string) {
    const updated = { ...cart };
    if ((updated[id] || 0) > 1) updated[id]--;
    else delete updated[id];
    updateCart(updated);
  }

  const cartItems    = products.filter(p => (cart[p._id] || 0) > 0);
  const cartCount    = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal    = cartItems.reduce((s, p) => s + p.price * cart[p._id], 0);
  const deliveryCost = cartTotal >= DEL.freeDeliveryAbove ? 0 : cartTotal > 0 ? DEL.deliveryCharge : 0;
  const grandTotal   = cartTotal + deliveryCost;

  const ckPhoneClean = ckPhone.replace(/\s+/g, "").replace(/^(\+91|91)/, "");
  const ckPhoneValid = /^[6-9]\d{9}$/.test(ckPhoneClean);
  const ckCanSubmit  = ckName.trim() !== "" && ckPhone.trim() !== "" && ckPhoneValid && ckAddress.trim() !== "";

  function closeCart() { setShowCart(false); setCartStep(1); setCkError(""); }
  function openCheckout() {
    if (user && !ckName) setCkName(user.name);
    if (user && !ckEmail) setCkEmail(user.email);
    setCartStep(2);
  }

  const waOrderUrl = cartItems.length > 0
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        "Hi QualiFresh! I'd like to order:\n" +
        cartItems.map(p => `• ${p.name} ×${cart[p._id]} — ₹${p.price * cart[p._id]}`).join("\n") +
        `\n\nTotal: ₹${grandTotal}${deliveryCost === 0 ? " (Free delivery!)" : ""}` +
        (ckName ? `\n\nName: ${ckName}` : "") +
        (ckPhone ? `\nPhone: ${ckPhone}` : "")
      )}`
    : `https://wa.me/${siteConfig.whatsapp}`;

  async function placeOrder() {
    if (ckLoading || !ckCanSubmit) return;
    setCkError(""); setCkLoading(true);
    try {
      const items = cartItems.map(p => ({ productId: p._id, name: p.name, slug: p.slug, quantity: cart[p._id], price: p.price }));
      const r = await fetch("/backend/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal: cartTotal, deliveryCharge: deliveryCost, total: grandTotal, deliveryAddress: ckAddress, city: ckCity, deliverySlot: ckSlot, notes: ckNotes, guestName: ckName, guestEmail: ckEmail, guestPhone: ckPhone }),
      });
      const d = await r.json();
      if (!r.ok) { setCkError(d.message || "Order failed. Please try again."); return; }
      fetch(`/backend/api/orders/${d._id}/notify`, { method: "POST", headers: { "Content-Type": "application/json" } }).catch(() => {});
      setCkOrderNum(d.orderNumber);
      setCartStep(3);
      updateCart({});
    } catch { setCkError("Network error. Please try again."); }
    finally { setCkLoading(false); }
  }

  // ── Search suggestions ───────────────────────────────────────────────────────
  const searchSuggestions = search.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  // ── Auth helpers ─────────────────────────────────────────────────────────────
  async function doLogin() {
    setAuthError(""); setAuthLoading(true);
    try {
      const r = await fetch("/backend/api/users/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPass }),
      });
      const d = await r.json();
      if (!r.ok) { setAuthError(d.message || "Login failed"); return; }
      const u = { name: d.user.name, email: d.user.email, token: d.token };
      setUser(u); localStorage.setItem("qf_user", JSON.stringify(u));
      setShowLogin(false); setAuthEmail(""); setAuthPass("");
      window.location.href = "/user";
    } catch { setAuthError("Network error. Please try again."); }
    finally { setAuthLoading(false); }
  }

  async function doRegister() {
    setAuthError("");
    if (!regName || !authEmail || !regPhone || !authPass) { setAuthError("All fields are required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) { setAuthError("Please enter a valid email address"); return; }
    const cleanPh = regPhone.replace(/\s+/g, "").replace(/^(\+91|91)/, "");
    if (!/^[6-9]\d{9}$/.test(cleanPh)) { setAuthError("Please enter a valid 10-digit Indian mobile number"); return; }
    if (authPass !== regPass2) { setAuthError("Passwords do not match"); return; }
    setAuthLoading(true);
    try {
      const r = await fetch("/backend/api/users/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: authEmail, phone: regPhone, password: authPass }),
      });
      const d = await r.json();
      if (!r.ok) { setAuthError(d.message || "Registration failed"); return; }
      const u = { name: d.user.name, email: d.user.email, token: d.token };
      setUser(u); localStorage.setItem("qf_user", JSON.stringify(u));
      setShowLogin(false);
      window.location.href = "/user";
    } catch { setAuthError("Network error. Please try again."); }
    finally { setAuthLoading(false); }
  }

  function logout() {
    setUser(null); localStorage.removeItem("qf_user");
    window.location.href = "/";
  }
  function closeLogin() { setShowLogin(false); setAuthError(""); setAuthEmail(""); setAuthPass(""); }
  function resetAuth(tab: "login" | "register") {
    setAuthTab(tab); setAuthError(""); setShowPass(false); setShowPass2(false);
    setAuthEmail(""); setAuthPass(""); setRegName(""); setRegPhone(""); setRegPass2("");
  }

  const navLinks = [
    { label: "Home",      href: "/"          },
    { label: "Products",  href: "/products"  },
    { label: "About Us",  href: "/about-us"  },
    { label: "Our Farms", href: "/our-farms" },
    { label: "Contact",   href: "/contact"   },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "9px",
    border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  const FALLBACK = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&q=60";

  return (
    <>
      <style>{`
        .sn-nav{background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:68px;position:fixed;top:34px;left:0;right:0;z-index:9998;box-shadow:0 1px 0 #e9ede4,0 4px 20px rgba(0,0,0,.08);}
        @media(max-width:1024px){.sn-nav{top:34px!important}}
        .sn-desk-nav{display:flex;gap:2.2rem;flex:1 1 auto;justify-content:center;align-items:center;}
        .sn-link{color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;padding:5px 0;border-bottom:2px solid transparent;transition:all .22s;font-family:'Inter','Poppins',sans-serif;letter-spacing:0.01em;}
        .sn-link:hover,.sn-link.active{color:#2d8a4e;border-bottom-color:#2d8a4e;}
        .sn-hamburger{display:none;background:none;border:1.5px solid #e5e7eb;border-radius:9px;padding:7px 10px;cursor:pointer;font-size:17px;line-height:1;color:#374151;transition:all .2s;}
        .sn-search-wrap{position:relative;}
        .sn-desk-only{display:flex;}
        .sn-btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:700;transition:all .2s;}
        .sn-btn-g:hover{background:#1f6b3a;}
        .sn-suggestion-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid #f3f4f6;cursor:default;}
        .sn-suggestion-item:hover{background:#f9fafb;}
        .sn-suggestion-item:last-child{border-bottom:none;}
        .sn-mob-search{display:none;position:fixed;top:102px;left:0;right:0;background:#fff;border-bottom:1px solid #e5e7eb;padding:8px 1rem;z-index:9990;box-sizing:border-box;}
        .sn-mob-spacer{display:none;height:0;}
        @media(max-width:1024px){
          .sn-desk-nav{display:none!important;}
          .sn-search-wrap{display:none!important;}
          .sn-hamburger{display:flex!important;}
          .sn-mob-search{display:flex!important;}
          .sn-mob-spacer{display:block!important;height:50px;}
          .sn-signin-text{display:none!important;}
          .sn-cart-text{display:none!important;}
          .sn-user-name{display:none!important;}
          .sn-logout-btn{display:none!important;}
          .sn-signin-btn{padding:8px 9px!important;}
          .sn-cart-btn{padding:8px 10px!important;}
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* ── Navbar ── */}
      <nav ref={navRef} className="sn-nav">
        <a href="/" style={{ lineHeight: 0, flexShrink: 0 }}>
          <img src="/logo.png" alt="QualiFresh" style={{ height: "52px", width: "auto", display: "block", objectFit: "contain" }} />
        </a>

        {/* Desktop nav links */}
        <div className="sn-desk-nav">
          {navLinks.map(item => (
            <a key={item.label} href={item.href}
              className={`sn-link${`/${activePage}` === item.href ? " active" : ""}`}>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Desktop search */}
          <div ref={searchRef} className="sn-search-wrap">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products…"
              style={{ padding: "9px 30px 9px 34px", borderRadius: "24px", border: "1.5px solid #e5e7eb", fontSize: "13px", width: "180px", background: "#f7faf8", transition: "all .25s", outline: "none", fontFamily: "inherit" }}
              onFocusCapture={e => { e.target.style.width = "220px"; e.target.style.background = "#fff"; e.target.style.borderColor = "#2d8a4e"; e.target.style.boxShadow = "0 0 0 3px rgba(45,138,78,0.1)"; }}
              onBlur={e => { e.target.style.width = "180px"; e.target.style.background = "#f7faf8"; e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none", color: "#9ca3af" }}>🔍</span>
            {search && (
              <button onClick={() => { setSearch(""); setSearchOpen(false); }} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", background: "#d1d5db", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "11px", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontWeight: 600 }}>✕</button>
            )}
            {searchOpen && searchSuggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300, overflow: "hidden", minWidth: "260px" }}>
                {searchSuggestions.map(p => (
                  <div key={p._id} className="sn-suggestion-item">
                    <span style={{ fontSize: "12.5px", color: "#111827", fontFamily: "sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "sans-serif", flexShrink: 0, margin: "0 8px" }}>₹{p.price}</span>
                    <button
                      onMouseDown={e => { e.preventDefault(); addToCart(p._id); setSearch(""); setSearchOpen(false); }}
                      style={{ padding: "3px 10px", borderRadius: "6px", border: "none", background: "#2d8a4e", color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign In / User */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <a href="/user" style={{ fontSize: "13px", fontWeight: 600, color: "#2d8a4e", fontFamily: "sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                <UserSvg /><span className="sn-user-name">Hi, {user.name.split(" ")[0]}</span>
              </a>
              <button onClick={logout} className="sn-logout-btn" style={{ padding: "6px 10px", borderRadius: "7px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => { setShowLogin(true); resetAuth("login"); }}
              className="sn-signin-btn"
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", transition: "all .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2d8a4e"; (e.currentTarget as HTMLButtonElement).style.color = "#2d8a4e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}>
              <UserSvg /><span className="sn-signin-text">Sign In</span>
            </button>
          )}

          {/* Cart button */}
          {cartEnabled && (
            <button onClick={() => setShowCart(true)} className="sn-btn-g sn-cart-btn"
              style={{ padding: "9px 16px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CartSvg />
              {cartCount > 0 && (
                <span style={{ background: "#fff", color: "#2d8a4e", borderRadius: "50%", width: "19px", height: "19px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>{cartCount}</span>
              )}
              <span className="sn-cart-text">Cart</span>
            </button>
          )}

          {/* Hamburger */}
          <button onClick={() => setMobileMenu(m => !m)} className="sn-hamburger"
            style={{ background: mobileMenu ? "#f0fdf4" : "none", border: `1.5px solid ${mobileMenu ? "#2d8a4e" : "#e5e7eb"}`, color: mobileMenu ? "#2d8a4e" : "#374151" }}>
            {mobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu (nav links only — Sign In, Cart, and search are on the navbar / below it) ── */}
      {mobileMenu && (
        <div style={{ background: "#fff", borderTop: "2px solid #2d8a4e", borderBottom: "1px solid #e5e7eb", padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "0.35rem", zIndex: 210, position: "fixed", left: 0, right: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", top: dropdownTop || undefined }}>
          {navLinks.map(item => (
            <a key={item.label} href={item.href} onClick={() => setMobileMenu(false)}
              style={{ color: "#1a3c2e", textDecoration: "none", fontSize: "14.5px", fontWeight: 600, padding: "11px 16px", borderRadius: "10px", background: `/${activePage}` === item.href ? "#f0fdf4" : "#f7faf8", border: `1px solid ${ `/${activePage}` === item.href ? "#bbf7d0" : "#e9ede4"}`, transition: "all .15s", display: "block" }}>
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* ── Cart Drawer (3-step: cart → checkout form → confirmed) ── */}
      {showCart && (
        <>
          <div onClick={() => { if (!ckLoading) closeCart(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 490, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "102px", right: 0, bottom: 0, width: "clamp(300px,92vw,390px)", background: "#fff", boxShadow: "-6px 0 40px rgba(0,0,0,.18)", zIndex: 500, display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {cartStep === 2 && (
                  <button onClick={() => setCartStep(1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280", padding: "0 4px 0 0", lineHeight: 1 }}>←</button>
                )}
                <img src="/logo.png" alt="QualiFresh" style={{ height: "30px", objectFit: "contain" }} />
                <span style={{ fontWeight: 700, color: "#166534", fontSize: "14.5px", fontFamily: "sans-serif" }}>
                  {cartStep === 3 ? "Order Confirmed 🎉" : cartStep === 2 ? "Checkout" : `Cart (${cartCount})`}
                </span>
              </div>
              <button onClick={() => { if (!ckLoading) closeCart(); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>

            {/* ── STEP 1: Cart Items ── */}
            {cartStep === 1 && (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.3rem" }}>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "#9ca3af" }}>
                      <div style={{ fontSize: "52px", marginBottom: "1rem" }}>🛒</div>
                      <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", margin: "0 0 4px" }}>Your cart is empty</p>
                      <p style={{ fontSize: "13px", fontFamily: "sans-serif", marginBottom: "1.5rem" }}>Add fresh exotic veggies to get started!</p>
                      <a href="/products" onClick={closeCart}
                        style={{ padding: "11px 28px", fontSize: "14px", borderRadius: "10px", background: "#2d8a4e", color: "#fff", fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
                        Shop Now →
                      </a>
                    </div>
                  ) : cartItems.map(p => (
                    <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f3f4f6", gap: "8px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, minWidth: 0 }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "46px", height: "46px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>🥬</div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: "0 0 1px", fontWeight: 700, fontSize: "12.5px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                          {p.quantityLabel && <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontFamily: "sans-serif" }}>{p.quantityLabel}</p>}
                          <p style={{ margin: "2px 0 0", fontWeight: 800, color: "#2d8a4e", fontSize: "13.5px" }}>₹{p.price * cart[p._id]}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <button onClick={() => removeFromCart(p._id)} style={{ background: "#f3f4f6", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", fontWeight: 800, fontSize: "14px" }}>−</button>
                        <span style={{ fontWeight: 800, minWidth: "18px", textAlign: "center", fontSize: "13px" }}>{cart[p._id]}</span>
                        <button onClick={() => addToCart(p._id)} style={{ background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", fontWeight: 800, fontSize: "14px" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div style={{ padding: "1rem 1.3rem", borderTop: "2px solid #f0fdf4" }}>
                    {[["Subtotal", `₹${cartTotal}`], ["Delivery", deliveryCost === 0 ? "FREE 🎉" : `₹${deliveryCost}`]].map(([l, v]) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "5px", fontFamily: "sans-serif" }}>
                        <span>{l}</span>
                        <span style={{ color: l === "Delivery" && deliveryCost === 0 ? "#16a34a" : undefined, fontWeight: l === "Delivery" && deliveryCost === 0 ? 700 : 400 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "16px", marginBottom: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "9px" }}>
                      <span>Total</span><span style={{ color: "#1a3c2e" }}>₹{grandTotal}</span>
                    </div>
                    {cartTotal > 0 && cartTotal < DEL.freeDeliveryAbove && (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "7px", padding: "7px 10px", fontSize: "11.5px", color: "#166534", marginBottom: "10px", fontFamily: "sans-serif" }}>
                        🚚 Add ₹{DEL.freeDeliveryAbove - cartTotal} more for <strong>free delivery!</strong>
                      </div>
                    )}
                    <button onClick={openCheckout} disabled={cartTotal < DEL.minOrder}
                      style={{ width: "100%", padding: "13px", fontSize: "14.5px", background: cartTotal >= DEL.minOrder ? "#2d8a4e" : "#e5e7eb", color: cartTotal >= DEL.minOrder ? "#fff" : "#9ca3af", border: "none", borderRadius: "9px", cursor: cartTotal >= DEL.minOrder ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit", marginBottom: "8px" }}>
                      {cartTotal >= DEL.minOrder ? "Proceed to Checkout →" : `Min ₹${DEL.minOrder} (add ₹${DEL.minOrder - cartTotal} more)`}
                    </button>
                    <a href={waOrderUrl} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", background: "#25d366", color: "#fff", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", textDecoration: "none" }}>
                      <WhatsAppIcon size={16} /> WhatsApp Order
                    </a>
                  </div>
                )}
              </>
            )}

            {/* ── STEP 2: Checkout Form ── */}
            {cartStep === 2 && (
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.3rem" }}>
                {/* Order summary (collapsed) */}
                <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.2rem" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#374151", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Summary ({cartItems.length} items)</p>
                  {cartItems.map(p => (
                    <div key={p._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#374151", fontFamily: "sans-serif", marginBottom: "3px" }}>
                      <span>{p.name} × {cart[p._id]}</span><span style={{ fontWeight: 700 }}>₹{p.price * cart[p._id]}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "7px", marginTop: "6px", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "13.5px" }}>
                    <span>Total</span><span style={{ color: "#1a3c2e" }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Form */}
                {(() => {
                  const fStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" };
                  const lStyle: React.CSSProperties = { display: "block", fontSize: "11.5px", fontWeight: 700, color: "#374151", fontFamily: "sans-serif", marginBottom: "4px" };
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <label style={lStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input type="text" placeholder="Your name" value={ckName} onChange={e => setCkName(e.target.value)} style={fStyle}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      <div>
                        <label style={lStyle}>Mobile Number <span style={{ color: "#ef4444" }}>*</span></label>
                        <input type="tel" placeholder="e.g. 9876543210" value={ckPhone} onChange={e => setCkPhone(e.target.value)}
                          style={{ ...fStyle, borderColor: ckPhone && !ckPhoneValid ? "#ef4444" : "#e5e7eb" }}
                          onFocus={e => (e.target.style.borderColor = ckPhone && !ckPhoneValid ? "#ef4444" : "#2d8a4e")}
                          onBlur={e => (e.target.style.borderColor = ckPhone && !ckPhoneValid ? "#ef4444" : "#e5e7eb")} />
                        {ckPhone && !ckPhoneValid && <p style={{ color: "#ef4444", fontSize: "11px", fontFamily: "sans-serif", margin: "3px 0 0" }}>Enter a valid 10-digit Indian mobile number</p>}
                      </div>
                      <div>
                        <label style={lStyle}>Email (for confirmation)</label>
                        <input type="email" placeholder="your@email.com" value={ckEmail} onChange={e => setCkEmail(e.target.value)} style={fStyle}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      <div>
                        <label style={lStyle}>Delivery Address <span style={{ color: "#ef4444" }}>*</span></label>
                        <input type="text" placeholder="Flat, Street, Area" value={ckAddress} onChange={e => setCkAddress(e.target.value)} style={fStyle}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      <div>
                        <label style={lStyle}>City</label>
                        <input type="text" placeholder="Pune / Mumbai" value={ckCity} onChange={e => setCkCity(e.target.value)} style={fStyle}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      <div>
                        <label style={lStyle}>Delivery Slot <span style={{ color: "#ef4444" }}>*</span></label>
                        <select value={ckSlot} onChange={e => setCkSlot(e.target.value)} style={{ ...fStyle, cursor: "pointer", background: "#fff" }}>
                          <option>Wednesday</option>
                          <option>Saturday</option>
                        </select>
                      </div>
                      <div>
                        <label style={lStyle}>Special Instructions (optional)</label>
                        <textarea placeholder="e.g. Leave at door, call on arrival…" value={ckNotes} onChange={e => setCkNotes(e.target.value)} rows={2}
                          style={{ ...fStyle, resize: "none" }}
                          onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                      </div>
                      {ckError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "9px 12px", fontSize: "12.5px", color: "#dc2626", fontFamily: "sans-serif" }}>{ckError}</div>}
                      <button onClick={placeOrder} disabled={!ckCanSubmit || ckLoading}
                        style={{ width: "100%", padding: "13px", fontSize: "14.5px", background: ckCanSubmit && !ckLoading ? "#2d8a4e" : "#e5e7eb", color: ckCanSubmit && !ckLoading ? "#fff" : "#9ca3af", border: "none", borderRadius: "9px", cursor: ckCanSubmit && !ckLoading ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit" }}>
                        {ckLoading ? "Placing Order…" : `Place Order · ₹${grandTotal}`}
                      </button>
                      <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", fontFamily: "sans-serif", margin: "0" }}>Pay on delivery · No advance required</p>
                      <div style={{ textAlign: "center", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                        <a href={waOrderUrl} target="_blank" rel="noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25d366", color: "#fff", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13px", fontFamily: "sans-serif" }}>
                          <WhatsAppIcon size={15} /> Order via WhatsApp instead
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── STEP 3: Order Confirmed ── */}
            {cartStep === 3 && (
              <div style={{ flex: 1, overflowY: "auto", padding: "2rem 1.3rem", textAlign: "center" }}>
                <div style={{ width: "68px", height: "68px", background: "linear-gradient(135deg,#2d8a4e,#16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 14px" }}>🌿</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: "#166534" }}>Order Placed!</h3>
                <div style={{ display: "inline-block", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "8px 22px", margin: "8px 0 14px", fontWeight: 800, fontSize: "17px", color: "#1a3c2e" }}>{ckOrderNum}</div>
                <p style={{ fontSize: "13.5px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "6px" }}>Thank you, <strong>{ckName}</strong>! Your order is confirmed.</p>
                {ckEmail && <p style={{ fontSize: "12.5px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "14px" }}>Confirmation sent to <strong>{ckEmail}</strong>.</p>}
                <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "12px 16px", margin: "14px 0", textAlign: "left", fontSize: "12.5px", color: "#374151", fontFamily: "sans-serif" }}>
                  <div>📅 Delivery: <strong>{ckSlot}</strong></div>
                  <div style={{ marginTop: "4px" }}>📍 {ckAddress}{ckCity ? `, ${ckCity}` : ""}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button onClick={() => { closeCart(); setCkName(""); setCkEmail(""); setCkPhone(""); setCkAddress(""); setCkNotes(""); setCkOrderNum(""); }}
                    style={{ padding: "12px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}>
                    Continue Shopping
                  </button>
                  <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi QualiFresh! Order ${ckOrderNum} confirmed.\nName: ${ckName} | Phone: ${ckPhone}\nDelivery: ${ckSlot}\nAddress: ${ckAddress}${ckCity ? ", " + ckCity : ""}`)}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#25d366", color: "#fff", padding: "11px", borderRadius: "9px", textDecoration: "none", fontWeight: 700, fontSize: "13.5px" }}>
                    <WhatsAppIcon size={16} /> Share on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Floating mail button (visible on all SiteNav pages) ── */}
      <a href={`mailto:${siteConfig.email}`} title={`Email: ${siteConfig.email}`}
        className={`qf-fab qf-fab-mail${cartEnabled && cartCount > 0 && !showCart ? " cart-active" : ""}`}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2d8a4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "13px", height: "13px", background: "#2d8a4e", borderRadius: "50%", border: "2.5px solid #fff" }} />
      </a>

      {/* ── Floating cart button (visible on all SiteNav pages) ── */}
      {cartEnabled && cartCount > 0 && !showCart && (
        <button onClick={() => setShowCart(true)} className="qf-fab qf-fab-cart" style={{ display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {cartCount} · <strong>₹{cartTotal}</strong>
        </button>
      )}

      {/* ── Mobile search bar: fixed below navbar, visible when dropdown is closed ── */}
      {!mobileMenu && (
        <div className="sn-mob-search">
          <div style={{ position: "relative", flex: 1 }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={e => { if (e.key === "Enter" && search.trim()) { window.location.href = `/products?q=${encodeURIComponent(search.trim())}`; } }}
              placeholder="Search vegetables, herbs…"
              style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" as const, outline: "none" }} />
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>🔍</span>
            {search && (
              <button onClick={() => { setSearch(""); setSearchOpen(false); }}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "#d1d5db", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontWeight: 600 }}>✕</button>
            )}
            {searchOpen && searchSuggestions.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9996, overflow: "hidden" }}>
                {searchSuggestions.map(p => (
                  <div key={p._id} className="sn-suggestion-item">
                    <span style={{ fontSize: "12.5px", color: "#111827", fontFamily: "sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontFamily: "sans-serif", flexShrink: 0, margin: "0 8px" }}>₹{p.price}</span>
                    <button
                      onMouseDown={e => { e.preventDefault(); addToCart(p._id); setSearch(""); setSearchOpen(false); }}
                      style={{ padding: "3px 10px", borderRadius: "6px", border: "none", background: "#2d8a4e", color: "#fff", fontWeight: 700, fontSize: "11px", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile spacer: pushes page content below the fixed mobile search bar ── */}
      <div className="sn-mob-spacer" />

      {/* ── Login modal ── */}
      {showLogin && (
        <>
          <div onClick={closeLogin} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "calc(50% + 51px)", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: "18px", padding: "2rem", width: "clamp(300px,90vw,420px)", zIndex: 600, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "1.4rem", position: "relative" }}>
              <button onClick={closeLogin} style={{ position: "absolute", right: 0, top: 0, background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
              <img src="/logo.png" alt="QualiFresh" style={{ height: "80px", width: "auto", display: "block", margin: "0 auto 8px", objectFit: "contain" }} />
              <p style={{ fontSize: "13px", color: "#6b7280", fontFamily: "sans-serif", margin: 0 }}>Fresh Exotic Vegetables, Delivered</p>
            </div>
            <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "3px", marginBottom: "1.4rem" }}>
              {(["login", "register"] as const).map(t => (
                <button key={t} onClick={() => resetAuth(t)}
                  style={{ flex: 1, padding: "9px", borderRadius: "8px", border: "none", background: authTab === t ? "#fff" : "transparent", fontWeight: authTab === t ? 700 : 500, fontSize: "13.5px", cursor: "pointer", color: authTab === t ? "#1a3c2e" : "#6b7280", boxShadow: authTab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all .2s", fontFamily: "inherit" }}>
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
            {authError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", color: "#dc2626", fontSize: "13px", fontFamily: "sans-serif", marginBottom: "12px" }}>{authError}</div>}
            {authTab === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && doLogin()}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af", padding: 0 }}>{showPass ? "🙈" : "👁"}</button>
                </div>
                <button onClick={doLogin} disabled={authLoading} className="sn-btn-g" style={{ padding: "13px", fontSize: "15px", opacity: authLoading ? 0.7 : 1 }}>
                  {authLoading ? "Signing in…" : "Sign In"}
                </button>
                <p style={{ textAlign: "center", fontSize: "13px", fontFamily: "sans-serif", color: "#6b7280", margin: 0 }}>
                  No account? <span style={{ color: "#2d8a4e", cursor: "pointer", fontWeight: 600 }} onClick={() => resetAuth("register")}>Create one free</span>
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" placeholder="Full name" value={regName} onChange={e => setRegName(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                <input type="email" placeholder="Email address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                <input type="tel" placeholder="Mobile number" value={regPhone} onChange={e => setRegPhone(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af", padding: 0 }}>{showPass ? "🙈" : "👁"}</button>
                </div>
                <div style={{ position: "relative" }}>
                  <input type={showPass2 ? "text" : "password"} placeholder="Confirm password" value={regPass2} onChange={e => setRegPass2(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && doRegister()}
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                  <button type="button" onClick={() => setShowPass2(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af", padding: 0 }}>{showPass2 ? "🙈" : "👁"}</button>
                </div>
                <button onClick={doRegister} disabled={authLoading} className="sn-btn-g" style={{ padding: "13px", fontSize: "15px", opacity: authLoading ? 0.7 : 1 }}>
                  {authLoading ? "Creating account…" : "Create Account"}
                </button>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#25d366", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13px", fontFamily: "sans-serif" }}>
                <WhatsAppIcon size={16} /> Order via WhatsApp instead
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
