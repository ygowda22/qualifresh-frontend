"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "../../src/config/site";
import SiteNav from "../components/SiteNav";

interface Product {
  _id: string; name: string; price: number; slug: string;
  imageUrl?: string; category: string; quantityLabel?: string; available?: boolean;
}

const { delivery: DEL } = siteConfig;

const TICKER_ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];


function InstagramIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
}
function FacebookIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function WhatsAppIconFt({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}

function syncCart(updated: Record<string, number>) {
  localStorage.setItem("qf_cart", JSON.stringify(updated));
  // Notify SiteNav (same-tab) via synthetic storage event
  window.dispatchEvent(new StorageEvent("storage", { key: "qf_cart", newValue: JSON.stringify(updated) }));
}

function getPerPage(): number {
  if (typeof window === "undefined") return 12;
  if (window.innerWidth < 640)  return 6;   // 2 cols × 3 rows
  if (window.innerWidth < 1024) return 6;   // 3 cols × 2 rows
  return 12;                                 // 4 cols × 3 rows
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [cart, setCart]           = useState<Record<string, number>>({});
  const [cartEnabled, setCartEnabled] = useState(true);
  const [cat, setCat]             = useState(searchParams.get("cat") || "all");
  const [search, setSearch]       = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(12);

  useEffect(() => {
    document.title = "Shop — Fresh Exotic Vegetables | QualiFresh";
    try {
      const c = localStorage.getItem("qf_cart");
      if (c) setCart(JSON.parse(c));
      setCartEnabled(localStorage.getItem("qf_cart_enabled") !== "false");
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === "qf_cart") { try { setCart(e.newValue ? JSON.parse(e.newValue) : {}); } catch {} }
      if (e.key === "qf_cart_enabled") { setCartEnabled(localStorage.getItem("qf_cart_enabled") !== "false"); }
    };
    window.addEventListener("storage", onStorage);

    // Responsive per-page
    setPerPage(getPerPage());
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setPerPage(getPerPage()), 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    function fetchProducts() {
      fetch("/backend/api/products")
        .then(r => r.json())
        .then((d: Product[]) => {
          setProducts(d.map(p => p.imageUrl ? { ...p, imageUrl: `${p.imageUrl.split("?")[0]}?t=${Date.now()}` } : p));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchProducts();
    // Re-fetch when admin uploads/deletes products
    const onStorage = (e: StorageEvent) => {
      if (e.key === "qf_products_updated") fetchProducts();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && localStorage.getItem("qf_products_updated")) fetchProducts();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Reset to page 1 whenever filter/search/perPage changes
  useEffect(() => { setPage(1); }, [cat, search, perPage]);

  function add(id: string) {
    const updated = { ...cart, [id]: (cart[id] || 0) + 1 };
    setCart(updated); syncCart(updated);
  }
  function remove(id: string) {
    const updated = { ...cart };
    if (updated[id] > 1) updated[id]--;
    else delete updated[id];
    setCart(updated); syncCart(updated);
  }

  const allCats = [{ key: "all", label: "All", icon: "🌿" }, ...siteConfig.categories];
  const cartItems = products.filter(p => (cart[p._id] || 0) > 0);
  const cartTotal = cartItems.reduce((s, p) => s + p.price * cart[p._id], 0);
  const deliveryCost = cartTotal >= DEL.freeDeliveryAbove ? 0 : cartTotal > 0 ? DEL.deliveryCharge : 0;
  const waOrderUrl = cartItems.length > 0
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        "Hi QualiFresh! I'd like to order:\n" +
        cartItems.map(p => `• ${p.name} ×${cart[p._id]} — ₹${p.price * cart[p._id]}`).join("\n") +
        `\n\nTotal: ₹${cartTotal + deliveryCost}${deliveryCost === 0 ? " (Free delivery!)" : ""}`
      )}`
    : `https://wa.me/${siteConfig.whatsapp}`;
  const filtered = products.filter(p => {
    const matchCat  = cat === "all" || p.category === cat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.available !== false;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div style={{ fontFamily: "'Inter','Poppins',-apple-system,sans-serif", background: "#f4f6f0", minHeight: "100vh" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%}

        .p-ticker-wrap{}
        .p-ticker-desktop{display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:7px 1rem;overflow:hidden;position:fixed;top:0;left:0;right:0;z-index:9999;width:100%;background:#0f8a65;}
        .p-ticker-mobile{display:none;position:fixed;top:0;left:0;right:0;z-index:198;width:100%;background:#0f8a65;border-bottom:1px solid #0a6e50;}
        @media(min-width:1025px){body{padding-top:102px}}
        @media(max-width:1024px){
          body{padding-top:102px!important}
          .p-ticker-desktop{display:none}
          .p-ticker-mobile{display:block;overflow:hidden;padding:5px 0;height:34px}
          .p-ticker-scroll{display:inline-flex;animation:pticker 30s linear infinite;white-space:nowrap}
          .p-ticker-scroll:hover{animation-play-state:paused}
          .sn-nav{top:34px!important}
        }
        @keyframes pticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        .p-cats{display:flex;gap:8px;overflow-x:auto;padding:0 0 4px;scrollbar-width:none;}
        .p-cats::-webkit-scrollbar{display:none}
        .p-cat{padding:7px 16px;border-radius:20px;border:1.5px solid #e5e7eb;background:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s;font-family:inherit;}
        .p-cat.active{background:#2d8a4e;color:#fff;border-color:#2d8a4e;}
        .p-cat:not(.active):hover{border-color:#2d8a4e;color:#2d8a4e;}

        .p-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        @media(max-width:1023px){.p-grid{grid-template-columns:repeat(3,1fr);gap:12px;}}
        @media(max-width:640px){.p-grid{grid-template-columns:repeat(2,1fr);gap:10px;}}
        @media(max-width:340px){.p-grid{grid-template-columns:1fr;}}

        .p-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #f1f5f9;transition:transform .2s,box-shadow .2s;}
        .p-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.1);}
        .p-card-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#f3f4f6;}
        .p-card-body{padding:10px 12px 12px;}
        .p-card-name{font-size:13px;font-weight:700;color:#111827;margin:0 0 2px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
        .p-card-qty{font-size:11px;color:#9ca3af;margin:0 0 6px;}
        .p-card-price{font-size:15px;font-weight:800;color:#2d8a4e;margin:0 0 8px;}
        .p-add-btn{width:100%;padding:7px;border:none;border-radius:8px;background:#2d8a4e;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;}
        .p-add-btn:hover{background:#1f6b3a;}
        .p-qty-ctrl{display:flex;align-items:center;justify-content:space-between;gap:4px;}
        .p-qty-btn{width:28px;height:28px;border:none;border-radius:6px;cursor:pointer;font-weight:800;font-size:15px;line-height:1;transition:background .2s;}
        .p-qty-minus{background:#f3f4f6;color:#374151;}
        .p-qty-minus:hover{background:#e5e7eb;}
        .p-qty-plus{background:#2d8a4e;color:#fff;}
        .p-qty-plus:hover{background:#1f6b3a;}
        .p-qty-val{font-weight:800;font-size:14px;color:#111827;min-width:24px;text-align:center;}

        .btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:700;transition:all .2s}
        .btn-g:hover{background:#1f6b3a;}
        .pf-footer-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:2rem;}
        @media(max-width:1024px){.pf-footer-grid{grid-template-columns:1fr 1fr!important;gap:1.5rem!important;}}
        @media(max-width:480px){.pf-footer-grid{grid-template-columns:1fr 1fr!important;gap:1rem!important;}}
        nextjs-portal{display:none!important}
      `}</style>

      {/* Ticker */}
      <div className="p-ticker-wrap">
        <div className="p-ticker-desktop">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}
              {i < TICKER_ITEMS.length - 1 && <span style={{ marginLeft: "16px", color: "rgba(163,230,53,0.4)" }}>·</span>}
            </span>
          ))}
        </div>
        <div className="p-ticker-mobile">
          <div className="p-ticker-scroll">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontFamily: "sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
                {item}<span style={{ marginLeft: "22px", color: "rgba(163,230,53,0.4)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <SiteNav activePage="products" />

      {/* Page header */}
      <div style={{ background: "linear-gradient(145deg,#071812 0%,#0a2218 30%,#0f3320 70%,#1c5a3a 100%)", padding: "4rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,78,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(163,230,53,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.28)", borderRadius: "24px", padding: "6px 18px", fontSize: "11px", color: "#bef264", marginBottom: "1.4rem", letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase" as const }}>
            🌿 Farm Fresh · {siteConfig.categories.length} Categories
          </span>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1rem", fontFamily: "'Poppins','Inter',sans-serif", letterSpacing: "-0.02em" }}>
            Shop <span style={{ background: "linear-gradient(90deg,#d4a017,#f0c040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Fresh Produce</span>
          </h1>
          <p style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(255,255,255,0.65)", maxWidth: "520px", margin: "0 auto 1.8rem", lineHeight: 1.85, fontFamily: "inherit" }}>
            {products.length > 0 ? `${products.length} exotic varieties` : "Exotic varieties"} — hand-picked and delivered twice a week to Pune & Mumbai.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={waOrderUrl} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "13px 28px", fontSize: "14px", fontWeight: 700, borderRadius: "10px", background: "#25d366", color: "#fff", textDecoration: "none", fontFamily: "inherit" }}>
              💬 WhatsApp Order
            </a>
          </div>
        </div>
      </div>
      {/* Wave separator */}
      <div style={{ lineHeight: 0, background: "#fff" }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "36px" }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#0f3320" />
        </svg>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: "68px", zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 1.5rem", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: "1 1 200px", position: "relative", minWidth: "160px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Search vegetables…"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setSearch(e.target.value); }}
              style={{ width: "100%", padding: "8px 34px 8px 32px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", fontFamily: "inherit", outline: "none" }}
              onFocus={e => (e.target.style.borderColor = "#2d8a4e")}
              onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px", lineHeight: 1, padding: "2px", display: "flex", alignItems: "center" }}
                aria-label="Clear search">
                ✕
              </button>
            )}
          </div>
          {/* Category pills */}
          <div className="p-cats" style={{ flex: "1 1 auto" }}>
            {allCats.map(c => (
              <button key={c.key} className={`p-cat${cat === c.key ? " active" : ""}`} onClick={() => setCat(c.key)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌱</div>
            <p style={{ fontFamily: "sans-serif", fontSize: "14px" }}>Loading fresh produce…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🥦</div>
            <p style={{ fontWeight: 700, fontSize: "15px", color: "#374151", fontFamily: "sans-serif", marginBottom: "8px" }}>No products found</p>
            <p style={{ fontSize: "13px", fontFamily: "sans-serif", marginBottom: "1.2rem" }}>Try a different category or clear your search.</p>
            <button onClick={() => { setCat("all"); setSearch(""); setSearchInput(""); }} className="btn-g" style={{ padding: "10px 22px", fontSize: "13.5px" }}>Clear Filters</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "12.5px", color: "#9ca3af", fontFamily: "sans-serif", marginBottom: "1rem" }}>
              Showing {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)} of {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {cat !== "all" ? ` in ${allCats.find(c => c.key === cat)?.label}` : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
            <div className="p-grid">
              {paginated.map(p => (
                <div key={p._id} className="p-card">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="p-card-img" />
                  ) : (
                    <div className="p-card-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", fontSize: "52px" }}>🥬</div>
                  )}
                  <div className="p-card-body">
                    <p className="p-card-name">{p.name}</p>
                    {p.quantityLabel && <p className="p-card-qty">{p.quantityLabel}</p>}
                    <p className="p-card-price">₹{p.price}</p>
                    {!cartEnabled ? (
                      <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(`Hi! I'd like to order: ${p.name} — ₹${p.price}`)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: "block", width: "100%", padding: "7px", background: "#25d366", color: "#fff", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "12.5px", fontWeight: 700 }}>
                        WhatsApp Order
                      </a>
                    ) : cart[p._id] ? (
                      <div className="p-qty-ctrl">
                        <button className="p-qty-btn p-qty-minus" onClick={() => remove(p._id)}>−</button>
                        <span className="p-qty-val">{cart[p._id]}</span>
                        <button className="p-qty-btn p-qty-plus" onClick={() => add(p._id)}>+</button>
                      </div>
                    ) : (
                      <button className="p-add-btn" onClick={() => add(p._id)}>+ Add to Cart</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "2rem", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" as const, paddingBottom: "4px" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: safePage === 1 ? "#f9fafb" : "#fff", color: safePage === 1 ? "#9ca3af" : "#374151", cursor: safePage === 1 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "sans-serif" }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .reduce((acc: (number | string)[], n, idx, arr) => { if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(n); return acc; }, [])
                  .map((n, idx) =>
                    n === "…" ? <span key={`e${idx}`} style={{ color: "#9ca3af" }}>…</span> : (
                      <button key={n} onClick={() => setPage(n as number)}
                        style={{ width: "36px", height: "36px", borderRadius: "8px", border: safePage === n ? "2px solid #2d8a4e" : "1.5px solid #d1d5db", background: safePage === n ? "#2d8a4e" : "#fff", color: safePage === n ? "#fff" : "#374151", cursor: "pointer", fontWeight: safePage === n ? 700 : 400, fontSize: "13px", fontFamily: "sans-serif" }}>
                        {n}
                      </button>
                    )
                  )}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: safePage === totalPages ? "#f9fafb" : "#fff", color: safePage === totalPages ? "#9ca3af" : "#374151", cursor: safePage === totalPages ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "sans-serif" }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(180deg,#081812 0%,#060f0c 100%)", color: "#fff" }}>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
            <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#f4f6f0" />
          </svg>
        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1.5rem" }}>
          <div className="pf-footer-grid" style={{ marginBottom: "2.5rem" }}>
            <div>
              <div style={{ marginBottom: "14px" }}>
                <img src="/logo.png" alt="QualiFresh" style={{ height: "38px", width: "auto", objectFit: "contain", display: "block" }} />
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontFamily: "sans-serif", maxWidth: "230px" }}>{siteConfig.footer.about}</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                {siteConfig.social.instagram && (
                  <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                    style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <InstagramIcon />
                  </a>
                )}
                {siteConfig.social.facebook && (
                  <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                    style={{ width: "36px", height: "36px", background: "#1877f2", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                    <FacebookIcon />
                  </a>
                )}
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                  style={{ width: "36px", height: "36px", background: "#25d366", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                  <WhatsAppIconFt size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "sans-serif" }}>Quick Links</h4>
              {[
                { label: "Home",       href: "/"          },
                { label: "Products",   href: "/products"  },
                { label: "About Us",   href: "/about-us"  },
                { label: "Our Farms",  href: "/our-farms" },
                { label: "Contact Us", href: "/contact"   },
              ].map(link => (
                <a key={link.label} href={link.href}
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "9px", textDecoration: "none", fontFamily: "sans-serif", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f0c040")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                  {link.label}
                </a>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "sans-serif" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "sans-serif" }}>Delivery Info</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📦 Min order: ₹{DEL.minOrder}</div>
                <div>🚚 Free delivery above ₹{DEL.freeDeliveryAbove}</div>
                <div>🎁 Free microgreens above ₹{DEL.freeMicrogreensAbove}</div>
                <div>⏰ Order by {DEL.orderCutoff.wednesday} for Wed</div>
                <div>⏰ Order by {DEL.orderCutoff.saturday} for Sat</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif" }}>
              © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.tagline}. All rights reserved. &nbsp;|&nbsp; {siteConfig.footer.developer}
            </p>
            <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.22)", fontFamily: "sans-serif" }}>
              {siteConfig.footer.tagline}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
