"use client";
import { useEffect, useState, useRef } from "react";
import { siteConfig } from "../src/config/site";

const { delivery: DEL, apiUrl: API } = siteConfig;

const IMG: Record<string, string> = {
  "asparagus-250gm":             "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80&fit=crop",
  "a2-gir-cow-ghee-500ml":       "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80&fit=crop",
  "a2-gir-cow-ghee-250ml":       "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80&fit=crop",
  "american-kale-curled-250gm":  "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&q=80&fit=crop",
  "moong-sprouts-250gm":         "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&q=80&fit=crop",
  "baby-corn-200gm":             "https://images.unsplash.com/photo-1601593346740-925612772716?w=400&q=80&fit=crop",
  "baby-spinach-100gm":          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80&fit=crop",
  "baby-kale-leaves-100gm":      "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&q=80&fit=crop",
  "baby-pakchoy-250gm":          "https://images.unsplash.com/photo-1597668158861-f7c51e75ce1a?w=400&q=80&fit=crop",
  "baby-potato-500gm":           "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop",
  "basil-50gm":                  "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&q=80&fit=crop",
  "bok-choy-500gm":              "https://images.unsplash.com/photo-1597668158861-f7c51e75ce1a?w=400&q=80&fit=crop",
  "capsicum-red-yellow-mix-500gm":"https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80&fit=crop",
  "celery-500gm":                "https://images.unsplash.com/photo-1628773822503-930a7eaab43a?w=400&q=80&fit=crop",
  "cherry-tomato-200gm":         "https://images.unsplash.com/photo-1546094096-0df4bcaad337?w=400&q=80&fit=crop",
  "chinese-cabbage-1kg":         "https://images.unsplash.com/photo-1598512199776-e0f5e78db4b0?w=400&q=80&fit=crop",
  "parsley-100gm":               "https://images.unsplash.com/photo-1602165238978-7d24c50e5c43?w=400&q=80&fit=crop",
  "galangal-100gm":              "https://images.unsplash.com/photo-1559181567-c3190ca9d1d7?w=400&q=80&fit=crop",
  "kaffir-lime-leaves-50gm":     "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400&q=80&fit=crop",
  "garlic-chives-250gm":         "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=400&q=80&fit=crop",
  "soyabean-sprouts-200gm":      "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=400&q=80&fit=crop",
  "baby-carrots-8-10sticks":     "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80&fit=crop",
  "kholrabi-500gm":              "https://images.unsplash.com/photo-1550411294-2b0f09e63b5c?w=400&q=80&fit=crop",
  "herbs-mix-10gm":              "https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=400&q=80&fit=crop",
  "iceberg-lettuce-500gm":       "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&q=80&fit=crop",
  "lemongrass-100gm":            "https://images.unsplash.com/photo-1609501677781-2ffc15c91e62?w=400&q=80&fit=crop",
  "mix-microgreens-50gm":        "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400&q=80&fit=crop",
  "morning-glory-250gm":         "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=400&q=80&fit=crop",
  "mushroom-200gm":              "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop",
  "peeled-garlic-250gm":         "https://images.unsplash.com/photo-1583822645289-bd1de5d4e8fb?w=400&q=80&fit=crop",
  "purple-red-cabbage-500gm":    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80&fit=crop",
  "arugula-50gm":                "https://images.unsplash.com/photo-1607175785229-b7b7c5d31eb2?w=400&q=80&fit=crop",
  "shelled-sweet-corn-250gm":    "https://images.unsplash.com/photo-1601593346740-925612772716?w=400&q=80&fit=crop",
  "zucchini-green-yellow-500gm": "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80&fit=crop",
  "thai-mix-125gm":              "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80&fit=crop",
  "edible-flowers-20-25pc":      "https://images.unsplash.com/photo-1490750967868-88df5691cc31?w=400&q=80&fit=crop",
  "organic-ragi-flour-500gm":    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80&fit=crop",
  "green-jalapeno-250gm":        "https://images.unsplash.com/photo-1528826007177-f38517ce2b28?w=400&q=80&fit=crop",
  "butternut-squash-500-600gm":  "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80&fit=crop",
  "king-oyster-mushroom-200gm":  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80&fit=crop",
  "enoki-mushroom-100gm":        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop",
  "shimeji-mushroom-125gm":      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80&fit=crop",
  "portobello-mushroom-200gm":   "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&fit=crop",
  "minari-100gm":                "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400&q=80&fit=crop",
  "leeks-250gm":                 "https://images.unsplash.com/photo-1605209971703-f2b8c57aef44?w=400&q=80&fit=crop",
  "perilla-50gm":                "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=400&q=80&fit=crop",
  "perilla-250gm":               "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=400&q=80&fit=crop",
  "red-radish-250gm":            "https://images.unsplash.com/photo-1585666048030-01abca37a2f1?w=400&q=80&fit=crop",
  "swiss-chard-250gm":           "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80&fit=crop",
  "broccoli-500gm":              "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80&fit=crop",
  "lotus-root-250gm":            "https://images.unsplash.com/photo-1553980501-f2f75f8c54e3?w=400&q=80&fit=crop",
  "edamame-fresh-200gm":         "https://images.unsplash.com/photo-1621955511272-5f7bd4d9eb35?w=400&q=80&fit=crop",
  "indrayani-rice-1kg":          "https://images.unsplash.com/photo-1536304993881-ff86e0c9e8b5?w=400&q=80&fit=crop",
  "mulberry-150gm":              "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&q=80&fit=crop",
  "fennel-with-leaves-500gm":    "https://images.unsplash.com/photo-1551123892-85a29e37a5ec?w=400&q=80&fit=crop",
  "brussels-sprouts-200gm":      "https://images.unsplash.com/photo-1584270355706-c0f6c1d4fe4e?w=400&q=80&fit=crop",
};

const FALLBACK = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80&fit=crop";

const CAT_LABEL: Record<string, string> = {
  leafy:"Leafy Greens", herb:"Fresh Herbs", mushroom:"Mushrooms",
  microgreen:"Microgreens", sprout:"Sprouts", fruit:"Fruits",
  grain:"Grains", other:"Vegetables",
};
const CAT_COLOR: Record<string, string> = {
  leafy:"#16a34a", herb:"#15803d", mushroom:"#b91c1c",
  microgreen:"#0d9488", sprout:"#ca8a04", fruit:"#7c3aed",
  grain:"#b45309", other:"#1d4ed8",
};
const CAT_IMG: Record<string, string> = {
  leafy:      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=75&fit=crop",
  herb:       "https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=200&q=75&fit=crop",
  mushroom:   "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&q=75&fit=crop",
  microgreen: "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=200&q=75&fit=crop",
  sprout:     "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=200&q=75&fit=crop",
  fruit:      "https://images.unsplash.com/photo-1618897996318-5a901fa696ca?w=200&q=75&fit=crop",
  grain:      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&q=75&fit=crop",
  other:      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=75&fit=crop",
};

// Ticker items — shown centered on desktop, scrolling on mobile
const TICKER_ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function CartSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function UserSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function MailSvg({ size = 20, color = "#2d8a4e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function QFLogo({ height = 44, dark = false }: { height?: number; dark?: boolean }) {
  const text  = dark ? "#fff" : "#1a3c2e";
  const green = dark ? "#a3e635" : "#2d8a4e";
  return (
    <svg height={height} viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <circle cx="22" cy="22" r="20" fill={green} />
      <path d="M14 26 Q18 14 22 18 Q26 10 30 22 Q26 30 22 28 Q18 30 14 26Z" fill="#fff" opacity="0.9" />
      <path d="M22 28 L22 34" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <text x="50" y="17" fontFamily="Georgia,serif" fontWeight="700" fontSize="17" fill={text}>Quali</text>
      <text x="94" y="17" fontFamily="Georgia,serif" fontWeight="700" fontSize="17" fill={green}>fresh</text>
      <text x="51" y="30" fontFamily="Georgia,serif" fontSize="9" fill={dark ? "rgba(255,255,255,0.5)" : "#9ca3af"} letterSpacing="2">QUALITY FIRST</text>
    </svg>
  );
}

const PER_PAGE = siteConfig.productsPerPage;

export default function Home() {
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [cat, setCat]               = useState("all");
  const [cart, setCart]             = useState<Record<string, number>>({});
  const [showCart, setShowCart]     = useState(false);
  const [showLogin, setShowLogin]   = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [hov, setHov]               = useState<string | null>(null);
  const [catVisible, setCatVisible] = useState(false);
  const productsRef                 = useRef<HTMLDivElement>(null);
  const catRef                      = useRef<HTMLDivElement>(null);
  const footerRef                   = useRef<HTMLElement>(null);

  // ── Favicon ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = `${siteConfig.name} — Fresh Exotic Vegetables, Pune`;
    // Remove any existing favicon
    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
    const svgFav = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%232d8a4e'/><path d='M20 38 Q26 18 32 24 Q38 14 44 32 Q38 44 32 40 Q26 44 20 38Z' fill='white' opacity='0.92'/><path d='M32 40 L32 52' stroke='white' stroke-width='3' stroke-linecap='round'/><text x='50%' y='30' dominant-baseline='middle' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' font-size='14' fill='%232d8a4e'></text></svg>`;
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = `data:image/svg+xml,${svgFav}`;
    document.head.appendChild(link);
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
    .then(r => r.json())
    .then(setProducts)
    .catch(() => setLoading(false));
}, []);

  // ── Reset page on filter change ───────────────────────────────────────────
  useEffect(() => { setPage(1); }, [cat, search]);

  // ── Category: only visible after scrolling down ───────────────────────────
  useEffect(() => {
    const el = catRef.current;
    if (!el) return;
    // rootMargin: "-120px 0px 0px 0px" means section must be 120px below viewport top before triggering
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCatVisible(true); },
      { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filtered   = products.filter(p => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const cartItems  = products.filter(p => cart[p._id]);
  const cartCount  = Object.values(cart).reduce((a: number, b) => a + (b as number), 0);
  const cartTotal  = products.reduce((s, p) => s + (cart[p._id] || 0) * p.price, 0);
  const deliveryCost = cartTotal >= DEL.freeDeliveryAbove ? 0 : cartTotal > 0 ? DEL.deliveryCharge : 0;

  const add    = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id: string) => setCart(c => { const n = { ...c }; n[id] > 1 ? n[id]-- : delete n[id]; return n; });

  // Scroll to products with offset for sticky nav
  const scrollToProducts = () => {
    const el = productsRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const catCounts = products.reduce((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {} as Record<string, number>);

  return (
    <div style={{ fontFamily: "Georgia,'Times New Roman',serif", background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%}

        /* ── Ticker: DESKTOP = centered single line, MOBILE = scrolling ── */
        .ticker-wrap { overflow: hidden; background: #1a3c2e; }
        /* Desktop: show items centered, no animation */
        .ticker-desktop {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: nowrap;
          gap: 0;
          padding: 7px 1rem;
          overflow: hidden;
        }
        /* Mobile: full scrolling ticker — hidden on desktop */
        .ticker-mobile { display: none; }
        @media(max-width: 900px) {
          .ticker-desktop { display: none; }
          .ticker-mobile  { display: block; overflow: hidden; padding: 7px 0; }
          .ticker-scroll  { display: inline-flex; animation: ticker 30s linear infinite; white-space: nowrap; }
          .ticker-scroll:hover { animation-play-state: paused; }
        }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{box-shadow:0 6px 24px rgba(45,138,78,.45)} 50%{box-shadow:0 6px 32px rgba(45,138,78,.7)} }
        @keyframes shimmer { 0%{opacity:.5} 100%{opacity:1} }

        .fade-up { animation: fadeUp .45s ease both; }
        .btn-g   { background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:700;transition:all .2s; }
        .btn-g:hover:not(:disabled){ background:#1f6b3a;transform:translateY(-1px);box-shadow:0 4px 14px rgba(45,138,78,.35); }
        .btn-g:disabled{ background:#e5e7eb;color:#9ca3af;cursor:not-allowed; }
        .nav-a  { color:#4b5563;text-decoration:none;font-size:14px;font-weight:600;padding:4px 0;border-bottom:2px solid transparent;transition:all .2s;font-family:'Helvetica Neue',Arial,sans-serif; }
        .nav-a:hover,.nav-a.active{ color:#2d8a4e;border-bottom-color:#2d8a4e; }
        .lift   { transition:all .25s ease; }
        .lift:hover { transform:translateY(-4px);box-shadow:0 14px 36px rgba(0,0,0,.12)!important; }
        input:focus { outline:none; }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#2d8a4e;border-radius:4px}

        /* Responsive */
        @media(max-width:1024px){
          .hero-cards{display:none!important}
          .cat-grid{grid-template-columns:repeat(4,1fr)!important}
        }
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .desktop-search{display:none!important}
          .hero-inner{padding:2rem 1rem!important;min-height:unset!important}
          .hero-h1{font-size:1.65rem!important}
          .hero-sub{font-size:13px!important}
          .hero-btn{padding:10px 16px!important;font-size:13px!important}
          .hero-stats{gap:1.2rem!important;padding-top:1.2rem!important;margin-top:1.5rem!important}
          .cat-section{padding:2rem 1rem!important}
          .cat-grid{grid-template-columns:repeat(4,1fr)!important;gap:8px!important}
          .cat-card-img{height:65px!important}
          .cat-card-label{font-size:9.5px!important;padding:5px 3px!important}
          .prod-section{padding:1.5rem 1rem 4rem!important}
          .prod-grid{grid-template-columns:repeat(2,1fr)!important;gap:.75rem!important}
          .prod-img{height:140px!important}
          .prod-name{font-size:12.5px!important}
          .why-section{padding:2rem 1rem!important}
          .why-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .footer-grid{grid-template-columns:1fr 1fr!important;gap:1.5rem!important}
          .footer-wrap{padding:2rem 1rem!important}
          .section-heading{font-size:1.4rem!important}
          .filter-row{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}
          .filter-row::-webkit-scrollbar{display:none}
          .page-btns{gap:4px!important}
          .page-btn{width:32px!important;height:32px!important;font-size:12px!important}
          .nav-bar{padding:0 1rem!important;height:60px!important}
          .mob-search-bar{display:flex!important}
          .mobile-hamburger{display:flex!important}
        }
        @media(max-width:480px){
          .cat-grid{grid-template-columns:repeat(4,1fr)!important}
          .prod-grid{grid-template-columns:repeat(2,1fr)!important}
          .why-grid{grid-template-columns:1fr 1fr!important}
          .footer-grid{grid-template-columns:1fr!important}
          .hero-stats-val{font-size:1.2rem!important}
        }
        .mobile-hamburger{display:none}
        .mob-search-bar{display:none}
        /* Hide Next.js dev overlay bottom-left indicator */
        nextjs-portal{display:none!important}
      `}</style>

      {/* ═══ TICKER BAR ═══ */}
      <div className="ticker-wrap">
        {/* Desktop: centered single line */}
        <div className="ticker-desktop">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}
              {i < TICKER_ITEMS.length - 1 && <span style={{ marginLeft: "16px", color: "rgba(163,230,53,0.4)", fontSize: "12px" }}>·</span>}
            </span>
          ))}
        </div>
        {/* Mobile: scrolling ticker */}
        <div className="ticker-mobile">
          <div className="ticker-scroll">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
                {item}
                <span style={{ marginLeft: "22px", color: "rgba(163,230,53,0.4)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className="nav-bar" style={{ background: "#fff", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 1px 0 #e5e7eb,0 4px 16px rgba(0,0,0,.06)" }}>
        <QFLogo height={40} />

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: "2rem" }}>
          {[
            { label: "Home",      action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
            { label: "Products",  action: scrollToProducts },
            { label: "About Us",  action: undefined },
            { label: "Our Farms", action: undefined },
            { label: "Contact",   action: () => footerRef.current?.scrollIntoView({ behavior: "smooth" }) },
          ].map((item, i) => (
            <a key={item.label} href="#" onClick={e => { e.preventDefault(); item.action?.(); }}
              className={`nav-a${i === 0 ? " active" : ""}`}>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Desktop search */}
          <div className="desktop-search" style={{ position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{ padding: "8px 12px 8px 32px", borderRadius: "22px", border: "1.5px solid #e5e7eb", fontSize: "13px", width: "170px", fontFamily: "inherit", background: "#f9fafb", transition: "all .25s" }}
              onFocus={e => { e.target.style.width = "210px"; e.target.style.background = "#fff"; e.target.style.borderColor = "#2d8a4e"; }}
              onBlur={e => { e.target.style.width = "170px"; e.target.style.background = "#f9fafb"; e.target.style.borderColor = "#e5e7eb"; }} />
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none", color: "#9ca3af" }}>🔍</span>
          </div>

          {/* Sign In button */}
          <button onClick={() => setShowLogin(true)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit", transition: "all .2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2d8a4e"; (e.currentTarget as HTMLButtonElement).style.color = "#2d8a4e"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}>
            <UserSvg />
            <span className="desktop-nav" style={{ display: "inline" }}>Sign In</span>
          </button>

          {/* Cart */}
          <button onClick={() => setShowCart(true)} className="btn-g"
            style={{ padding: "9px 16px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}>
            <CartSvg />
            {cartCount > 0 && (
              <span style={{ background: "#fff", color: "#2d8a4e", borderRadius: "50%", width: "19px", height: "19px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800 }}>{cartCount}</span>
            )}
            <span className="desktop-nav" style={{ display: "inline" }}>Cart</span>
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(m => !m)} className="mobile-hamburger"
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 9px", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>
            {mobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile search bar */}
      <div className="mob-search-bar" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "8px 1rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vegetables, herbs…"
            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit" }} />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenu && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", zIndex: 190, position: "relative" }}>
          {[
            { label: "Home",      action: () => { setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); } },
            { label: "Products",  action: () => { setMobileMenu(false); scrollToProducts(); } },
            { label: "About Us",  action: () => setMobileMenu(false) },
            { label: "Our Farms", action: () => setMobileMenu(false) },
            { label: "Contact",   action: () => { setMobileMenu(false); footerRef.current?.scrollIntoView({ behavior: "smooth" }); } },
          ].map(item => (
            <a key={item.label} href="#" onClick={e => { e.preventDefault(); item.action(); }}
              style={{ color: "#374151", textDecoration: "none", fontSize: "15px", fontWeight: 600, padding: "9px 12px", borderRadius: "8px", background: "#f9fafb", fontFamily: "sans-serif" }}>
              {item.label}
            </a>
          ))}
          <button onClick={() => { setMobileMenu(false); setShowLogin(true); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2d8a4e", textDecoration: "none", fontSize: "15px", fontWeight: 600, padding: "9px 12px", borderRadius: "8px", background: "#f0fdf4", border: "none", cursor: "pointer", fontFamily: "sans-serif" }}>
            <UserSvg /> Sign In
          </button>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "10px", fontSize: "13px", color: "#6b7280", fontFamily: "sans-serif" }}>
            <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "#2d8a4e" }}>{siteConfig.phoneDisplay}</a></div>
            <div style={{ marginTop: "4px" }}>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "#2d8a4e" }}>{siteConfig.email}</a></div>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <div style={{ background: "linear-gradient(135deg,#0a1f12 0%,#0f3020 45%,#1a4a2e 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        <div className="hero-inner" style={{ maxWidth: "1300px", margin: "0 auto", padding: "3.5rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", minHeight: "460px" }}>
          <div style={{ flex: "0 0 auto", maxWidth: "560px" }} className="fade-up">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "5px 14px", fontSize: "11.5px", color: "#d9f99d", marginBottom: "1.2rem", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>
              {siteConfig.hero.badge}
            </div>
            <h1 className="hero-h1" style={{ fontSize: "clamp(1.8rem,3.8vw,3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: "1rem" }}>
              {siteConfig.hero.line1}<br />
              <span style={{ color: "#d4a017", fontStyle: "italic" }}>{siteConfig.hero.lineAccent}</span><br />
              {siteConfig.hero.line2}
            </h1>
            <p className="hero-sub" style={{ fontSize: "clamp(13px,1.4vw,15px)", color: "rgba(255,255,255,0.72)", lineHeight: 1.8, marginBottom: "1.8rem", maxWidth: "460px", fontFamily: "sans-serif" }}>
              {siteConfig.hero.subtext}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn-g hero-btn" onClick={scrollToProducts} style={{ padding: "13px 28px", fontSize: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
                <CartSvg /> Shop Now
              </button>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" className="hero-btn"
                style={{ background: "#25d366", color: "#fff", border: "none", borderRadius: "8px", padding: "13px 22px", fontWeight: 700, fontSize: "14px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "inherit" }}>
                💬 WhatsApp Order
              </a>
            </div>
            <div className="hero-stats" style={{ display: "flex", gap: "2rem", marginTop: "2rem", paddingTop: "1.8rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {siteConfig.stats.map(s => (
                <div key={s.label}>
                  <div className="hero-stats-val" style={{ fontSize: "clamp(1.2rem,2.5vw,1.8rem)", fontWeight: 800, color: "#d4a017" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero cards — desktop only */}
          <div className="hero-cards" style={{ flex: "0 0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "360px" }}>
            {products.slice(0, 4).map((p, i) => (
              <div key={p._id} style={{ background: "rgba(255,255,255,0.09)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "12px", overflow: "hidden", animation: `fadeUp .5s ${i * 0.1 + 0.3}s both` }}>
                <img src={IMG[p.slug] || FALLBACK} alt={p.name} style={{ width: "100%", height: "85px", objectFit: "cover" }} />
                <div style={{ padding: "8px 10px" }}>
                  <p style={{ color: "#fff", fontSize: "11.5px", fontWeight: 600, lineHeight: 1.3, marginBottom: "2px" }}>{p.name}</p>
                  <p style={{ color: "#a3e635", fontSize: "13px", fontWeight: 700 }}>₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CATEGORIES — invisible until scrolled to ═══ */}
      <div ref={catRef} className="cat-section"
        style={{
          background: "#fff", padding: "3rem 2.5rem",
          opacity: catVisible ? 1 : 0,
          transform: catVisible ? "translateY(0)" : "translateY(48px)",
          transition: "opacity 0.75s ease, transform 0.75s ease",
          pointerEvents: catVisible ? "auto" : "none",
        }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ color: "#2d8a4e", fontWeight: 700, fontSize: "11.5px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "6px" }}>Browse by Category</p>
            <h2 className="section-heading" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#0f1a0f" }}>Fresh Produce Categories</h2>
          </div>
          <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: "12px" }}>
            {Object.entries(CAT_LABEL).map(([key, label]) => {
              const active = cat === key;
              return (
                <div key={key} className="lift" onClick={() => { setCat(key); scrollToProducts(); }}
                  style={{ borderRadius: "12px", overflow: "hidden", cursor: "pointer", border: `2px solid ${active ? CAT_COLOR[key] : "transparent"}`, boxShadow: active ? `0 0 0 3px ${CAT_COLOR[key]}22` : "0 2px 8px rgba(0,0,0,.07)", background: "#fff" }}>
                  <div className="cat-card-img" style={{ height: "85px", overflow: "hidden" }}>
                    <img src={CAT_IMG[key]} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  </div>
                  <div className="cat-card-label" style={{ padding: "7px 5px", textAlign: "center", background: active ? CAT_COLOR[key] : "#fff" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: active ? "#fff" : CAT_COLOR[key], fontFamily: "sans-serif", lineHeight: 1.2 }}>{label}</div>
                    <div style={{ fontSize: "9.5px", color: active ? "rgba(255,255,255,0.7)" : "#9ca3af", fontFamily: "sans-serif" }}>{catCounts[key] || 0}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ PRODUCTS ═══ */}
      <div ref={productsRef} className="prod-section" style={{ background: "#f4f6f0", padding: "2.5rem 2.5rem 5rem" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.2rem", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <p style={{ color: "#2d8a4e", fontWeight: 700, fontSize: "11.5px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "3px" }}>{cat === "all" ? "All Products" : CAT_LABEL[cat]}</p>
              <h2 className="section-heading" style={{ fontSize: "clamp(1.3rem,2.5vw,1.7rem)", fontWeight: 800, color: "#0f1a0f" }}>Our Fresh Picks</h2>
            </div>
            <div className="filter-row" style={{ display: "flex", gap: "6px", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "4px" }}>
              <button onClick={() => setCat("all")}
                style={{ padding: "6px 14px", borderRadius: "18px", border: cat === "all" ? "2px solid #2d8a4e" : "1.5px solid #d1d5db", background: cat === "all" ? "#2d8a4e" : "#fff", color: cat === "all" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "12px", fontFamily: "sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                All
              </button>
              {Object.entries(CAT_LABEL).map(([key, label]) => (
                <button key={key} onClick={() => setCat(key)}
                  style={{ padding: "6px 12px", borderRadius: "18px", border: cat === key ? `2px solid ${CAT_COLOR[key]}` : "1.5px solid #d1d5db", background: cat === key ? CAT_COLOR[key] : "#fff", color: cat === key ? "#fff" : "#374151", fontWeight: cat === key ? 700 : 400, cursor: "pointer", fontSize: "12px", fontFamily: "sans-serif", whiteSpace: "nowrap", flexShrink: 0, transition: "all .18s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!loading && <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "1rem", fontFamily: "sans-serif" }}>{filtered.length} products · page {page} of {totalPages || 1}</p>}

          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem", color: "#6b7280" }}>
              <div style={{ fontSize: "44px", animation: "shimmer 1s ease-in-out infinite alternate", marginBottom: "1rem" }}>🌿</div>
              <p style={{ fontFamily: "sans-serif" }}>Loading fresh products…</p>
            </div>
          ) : (
            <div className="prod-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: "1.1rem" }}>
              {paginated.map((p, i) => {
                const qty = cart[p._id] || 0;
                return (
                  <div key={p._id} className="lift"
                    style={{ background: "#fff", borderRadius: "13px", border: "1px solid #e9ede4", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.05)", animation: `fadeUp .4s ${(i % PER_PAGE) * 0.03}s both` }}
                    onMouseEnter={() => setHov(p._id)} onMouseLeave={() => setHov(null)}>
                    <div className="prod-img" style={{ height: "175px", overflow: "hidden", position: "relative" }}>
                      <img src={IMG[p.slug] || FALLBACK} alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .45s", transform: hov === p._id ? "scale(1.08)" : "scale(1)" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,.2) 0%,transparent 55%)" }} />
                      <div style={{ position: "absolute", top: "8px", left: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
                        {p.isImported && <span style={{ background: "#1d4ed8", color: "#fff", fontSize: "9.5px", padding: "2px 7px", borderRadius: "8px", fontWeight: 700, fontFamily: "sans-serif" }}>Imported</span>}
                        {p.tags?.includes("premium") && <span style={{ background: "#d97706", color: "#fff", fontSize: "9.5px", padding: "2px 7px", borderRadius: "8px", fontWeight: 700, fontFamily: "sans-serif" }}>⭐ Premium</span>}
                        {p.tags?.includes("chef-favorite") && <span style={{ background: "#7c3aed", color: "#fff", fontSize: "9.5px", padding: "2px 7px", borderRadius: "8px", fontWeight: 700, fontFamily: "sans-serif" }}>👨‍🍳 Chef's Pick</span>}
                      </div>
                      <div style={{ position: "absolute", bottom: "8px", right: "8px", background: p.stock > 0 ? "rgba(22,163,74,.9)" : "rgba(220,38,38,.9)", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "8px", fontWeight: 600, fontFamily: "sans-serif" }}>
                        {p.stock > 0 ? "In Stock" : "Out"}
                      </div>
                    </div>
                    <div style={{ padding: "0.85rem 0.95rem" }}>
                      <span style={{ fontSize: "10px", color: CAT_COLOR[p.category] || "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", fontFamily: "sans-serif" }}>{CAT_LABEL[p.category]}</span>
                      <h3 className="prod-name" style={{ margin: "4px 0 3px", fontSize: "13.5px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{p.name}</h3>
                      <p style={{ fontSize: "11.5px", color: "#9ca3af", marginBottom: "9px", fontFamily: "sans-serif" }}>{p.quantityLabel}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "9px" }}>
                        <span style={{ fontWeight: 800, color: "#1a3c2e", fontSize: "18px" }}>₹{p.price}</span>
                        {p.priceUnit === "per_kg" && <span style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "sans-serif" }}>/kg</span>}
                      </div>
                      {qty > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", borderRadius: "8px", padding: "5px 8px", border: "1.5px solid #86efac" }}>
                          <button onClick={() => remove(p._id)} style={{ background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px", fontWeight: 800 }}>−</button>
                          <span style={{ fontWeight: 800, color: "#166534", fontSize: "15px" }}>{qty}</span>
                          <button onClick={() => add(p._id)} style={{ background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px", fontWeight: 800 }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => p.stock > 0 && add(p._id)} disabled={p.stock === 0}
                          style={{ width: "100%", padding: "9px", fontSize: "13px", background: p.stock > 0 ? "#2d8a4e" : "#f3f4f6", color: p.stock > 0 ? "#fff" : "#9ca3af", border: "none", borderRadius: "8px", cursor: p.stock > 0 ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          {p.stock > 0 ? <><CartSvg /> Add to Cart</> : "Out of Stock"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="page-btns" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "2rem", flexWrap: "wrap" }}>
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); scrollToProducts(); }} disabled={page === 1}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: page === 1 ? "#f9fafb" : "#fff", color: page === 1 ? "#9ca3af" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "sans-serif" }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc: (number | string)[], n, idx, arr) => { if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("…"); acc.push(n); return acc; }, [])
                .map((n, idx) =>
                  n === "…" ? <span key={`e${idx}`} style={{ color: "#9ca3af" }}>…</span> : (
                    <button key={n} className="page-btn" onClick={() => { setPage(n as number); scrollToProducts(); }}
                      style={{ width: "36px", height: "36px", borderRadius: "8px", border: page === n ? "2px solid #2d8a4e" : "1.5px solid #d1d5db", background: page === n ? "#2d8a4e" : "#fff", color: page === n ? "#fff" : "#374151", cursor: "pointer", fontWeight: page === n ? 700 : 400, fontSize: "13px", fontFamily: "sans-serif" }}>
                      {n}
                    </button>
                  )
                )}
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); scrollToProducts(); }} disabled={page === totalPages}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #d1d5db", background: page === totalPages ? "#f9fafb" : "#fff", color: page === totalPages ? "#9ca3af" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "sans-serif" }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ WHY QUALIFRESH ═══ */}
      <div className="why-section" style={{ background: "#fff", padding: "3.5rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={{ color: "#2d8a4e", fontWeight: 700, fontSize: "11.5px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "6px" }}>Why Choose Us</p>
            <h2 className="section-heading" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#0f1a0f" }}>The {siteConfig.name} Difference</h2>
          </div>
          <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
            {([
              ["🌱","#dcfce7","#166534","Farm to Table",   "Vegetables harvested same morning, delivered fresh to your door"],
              ["❄️","#dbeafe","#1d4ed8","Cold Chain",      "Temperature-controlled logistics — freshness guaranteed throughout"],
              ["🧑‍🌾","#fef3c7","#92400e","Local Farmers",  "Directly sourced from trusted farms in and around Pune"],
              ["🔬","#fce7f3","#9d174d","Quality Tested",  "Every batch inspected before dispatch — no compromises"],
              ["📦","#ede9fe","#6d28d9","Eco Packaging",   "Breathable, sustainable packaging that keeps produce alive longer"],
              ["🤝","#f0fdf4","#166534","Trusted by Chefs","Preferred by top restaurants, hotels & home chefs across Pune & Mumbai"],
            ] as [string,string,string,string,string][]).map(([icon,bg,clr,title,desc]) => (
              <div key={title} className="lift" style={{ background: bg, borderRadius: "13px", padding: "1.3rem" }}>
                <div style={{ fontSize: "26px", marginBottom: "10px" }}>{icon}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "14.5px", fontWeight: 700, color: clr }}>{title}</h3>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#6b7280", lineHeight: 1.65, fontFamily: "sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SIGN IN MODAL ═══ */}
      {showLogin && (
        <>
          <div onClick={() => setShowLogin(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: "16px", padding: "2rem", width: "clamp(300px,90vw,380px)", zIndex: 600, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <QFLogo height={34} />
              <button onClick={() => setShowLogin(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f1a0f", marginBottom: "0.4rem" }}>Welcome back</h2>
            <p style={{ fontSize: "13px", color: "#6b7280", fontFamily: "sans-serif", marginBottom: "1.5rem" }}>Sign in to track your orders and manage your account.</p>
            <input type="tel" placeholder="Mobile number" style={{ width: "100%", padding: "12px 14px", borderRadius: "9px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "sans-serif", marginBottom: "10px", transition: "border .2s" }}
              onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
            <input type="password" placeholder="Password" style={{ width: "100%", padding: "12px 14px", borderRadius: "9px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "sans-serif", marginBottom: "14px", transition: "border .2s" }}
              onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
            <button className="btn-g" style={{ width: "100%", padding: "13px", fontSize: "15px" }}>Sign In</button>
            <div style={{ textAlign: "center", marginTop: "14px", fontSize: "13px", fontFamily: "sans-serif", color: "#6b7280" }}>
              Don't have an account? <span style={{ color: "#2d8a4e", cursor: "pointer", fontWeight: 600 }}>Register</span>
            </div>
            <div style={{ textAlign: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
              <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#25d366", color: "#fff", padding: "10px 22px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13.5px", fontFamily: "sans-serif" }}>
                💬 Order via WhatsApp instead
              </a>
            </div>
          </div>
        </>
      )}

      {/* ═══ CART DRAWER ═══ */}
      {showCart && (
        <>
          <div onClick={() => setShowCart(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "clamp(300px,92vw,390px)", background: "#fff", boxShadow: "-6px 0 40px rgba(0,0,0,.18)", zIndex: 400, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <QFLogo height={30} />
                <span style={{ fontWeight: 700, color: "#166534", fontSize: "14.5px", fontFamily: "sans-serif" }}>Cart ({cartCount})</span>
              </div>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.3rem" }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3.5rem 0", color: "#9ca3af" }}>
                  <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🥬</div>
                  <p style={{ fontWeight: 600, fontFamily: "sans-serif" }}>Cart is empty</p>
                  <p style={{ fontSize: "13px", fontFamily: "sans-serif" }}>Add fresh veggies to get started!</p>
                </div>
              ) : cartItems.map(p => (
                <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #f3f4f6", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <img src={IMG[p.slug] || FALLBACK} alt={p.name} style={{ width: "46px", height: "46px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: "0 0 1px", fontWeight: 700, fontSize: "12.5px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontFamily: "sans-serif" }}>{p.quantityLabel}</p>
                      <p style={{ margin: "2px 0 0", fontWeight: 800, color: "#2d8a4e", fontSize: "13.5px" }}>₹{p.price * cart[p._id]}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <button onClick={() => remove(p._id)} style={{ background: "#f3f4f6", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", fontWeight: 800, fontSize: "14px" }}>−</button>
                    <span style={{ fontWeight: 800, minWidth: "18px", textAlign: "center", fontSize: "13px" }}>{cart[p._id]}</span>
                    <button onClick={() => add(p._id)} style={{ background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "6px", width: "26px", height: "26px", cursor: "pointer", fontWeight: 800, fontSize: "14px" }}>+</button>
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
                  <span>Total</span><span style={{ color: "#1a3c2e" }}>₹{cartTotal + deliveryCost}</span>
                </div>
                {cartTotal > 0 && cartTotal < DEL.freeDeliveryAbove && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "7px", padding: "7px 10px", fontSize: "11.5px", color: "#166534", marginBottom: "10px", fontFamily: "sans-serif" }}>
                    🚚 Add ₹{DEL.freeDeliveryAbove - cartTotal} more for <strong>free delivery!</strong>
                  </div>
                )}
                <button disabled={cartTotal < DEL.minOrder}
                  style={{ width: "100%", padding: "13px", fontSize: "14.5px", background: cartTotal >= DEL.minOrder ? "#2d8a4e" : "#e5e7eb", color: cartTotal >= DEL.minOrder ? "#fff" : "#9ca3af", border: "none", borderRadius: "9px", cursor: cartTotal >= DEL.minOrder ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "inherit" }}>
                  {cartTotal >= DEL.minOrder ? "Proceed to Checkout →" : `Min ₹${DEL.minOrder} (add ₹${DEL.minOrder - cartTotal} more)`}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ SUPPORT EMAIL BUTTON (bottom-right, above cart if cart visible) ═══ */}
      <a href={`mailto:${siteConfig.email}?subject=Support Request — QualiFresh`}
        title={`Email Support: ${siteConfig.email}`}
        style={{
          position: "fixed",
          bottom: cartCount > 0 && !showCart ? "5.5rem" : "1.5rem",
          right: "1.5rem",
          width: "48px", height: "48px",
          background: "#fff",
          border: "2px solid #2d8a4e",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 18px rgba(45,138,78,0.22)",
          cursor: "pointer", zIndex: 199,
          textDecoration: "none",
          transition: "bottom 0.3s ease, background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#f0fdf4"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#fff"; }}>
        <MailSvg size={21} color="#2d8a4e" />
        <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "13px", height: "13px", background: "#2d8a4e", borderRadius: "50%", border: "2.5px solid #fff" }} />
      </a>

      {/* ═══ FLOATING CART BUTTON ═══ */}
      {cartCount > 0 && !showCart && (
        <button onClick={() => setShowCart(true)} className="btn-g"
          style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "12px 20px", borderRadius: "50px", boxShadow: "0 6px 24px rgba(45,138,78,.45)", zIndex: 200, fontSize: "13.5px", display: "flex", alignItems: "center", gap: "7px", animation: "pulse 2.5s ease-in-out infinite" }}>
          <CartSvg /> {cartCount} · <strong>₹{cartTotal}</strong>
        </button>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer ref={footerRef} style={{ background: "#0a1628", color: "#fff" }}>
        <div className="footer-wrap" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2.5rem 1.5rem" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
            <div>
              <div style={{ marginBottom: "14px" }}><QFLogo height={38} dark /></div>
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
              </div>
            </div>
            <div>
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Quick Links</h4>
              {[
                { label: "Home",       action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
                { label: "Products",   action: scrollToProducts },
                { label: "About Us",   action: undefined },
                { label: "Our Farms",  action: undefined },
                { label: "Contact Us", action: () => footerRef.current?.scrollIntoView({ behavior: "smooth" }) },
              ].map(link => (
                <a key={link.label} href="#" onClick={e => { e.preventDefault(); link.action?.(); }}
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "9px", textDecoration: "none", fontFamily: "sans-serif", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#d4a017")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                  {link.label}
                </a>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Delivery Info</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📦 Min order: ₹{DEL.minOrder}</div>
                <div>🚚 Free above ₹{DEL.freeDeliveryAbove}</div>
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