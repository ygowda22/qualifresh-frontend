"use client";
import { useEffect, useState } from "react";
import { siteConfig } from "../../src/config/site";
import SiteNav from "../components/SiteNav";

interface FarmPhoto { id: string; title: string; description: string; imageUrl: string; }

const DEFAULT_FARM_PHOTOS: FarmPhoto[] = [
  { id: "f1", title: "Our Main Farm",   description: "Sun-drenched fields in Pune's fertile belt",    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop" },
  { id: "f2", title: "Herb Garden",     description: "Fresh herbs cultivated with care every morning", imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop" },
  { id: "f3", title: "Mushroom House",  description: "Climate-controlled growing chambers",            imageUrl: "https://images.unsplash.com/photo-1504382262782-5b4ece78642b?w=800&q=80&fit=crop" },
  { id: "f4", title: "Harvest Morning", description: "Fresh picks loaded before sunrise",              imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&fit=crop" },
  { id: "f5", title: "Cold Storage",    description: "Temperature-controlled from farm to door",       imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&fit=crop" },
  { id: "f6", title: "Delivery Ready",  description: "Packed with care, delivered with love",          imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80&fit=crop" },
];

const { delivery: DEL } = siteConfig;
const TICKER_ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];

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
function WhatsAppIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function OurFarmsPage() {
  const [farmPhotos, setFarmPhotos] = useState<FarmPhoto[]>([]);

  // Cart-aware WhatsApp state (reads localStorage product cache set by SiteNav)
  const [waCart, setWaCart]   = useState<Record<string, number>>({});
  const [waProds, setWaProds] = useState<{_id:string;name:string;price:number}[]>([]);

  useEffect(() => {
    document.title = siteConfig.pageTitles.ourFarms;
    try {
      const saved = localStorage.getItem("qf_farm_photos");
      setFarmPhotos(saved ? JSON.parse(saved) : DEFAULT_FARM_PHOTOS);
    } catch { setFarmPhotos(DEFAULT_FARM_PHOTOS); }
  }, []);

  useEffect(() => {
    try {
      const c = localStorage.getItem("qf_cart");
      if (c) setWaCart(JSON.parse(c));
      const p = localStorage.getItem("qf_products_cache");
      if (p) setWaProds(JSON.parse(p));
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (e.key === "qf_cart") { try { setWaCart(e.newValue ? JSON.parse(e.newValue) : {}); } catch {} }
      if (e.key === "qf_products_cache") { try { setWaProds(e.newValue ? JSON.parse(e.newValue) : []); } catch {} }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const waItems = waProds.filter(p => (waCart[p._id] || 0) > 0);
  const waTotal = waItems.reduce((s, p) => s + p.price * waCart[p._id], 0);
  const waUrl = waItems.length > 0
    ? `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
        "Hi QualiFresh! I'd like to order:\n" +
        waItems.map(p => `• ${p.name} ×${waCart[p._id]} — ₹${p.price * waCart[p._id]}`).join("\n") +
        `\n\nTotal: ₹${waTotal}`
      )}`
    : `https://wa.me/${siteConfig.whatsapp}`;

  const photos = farmPhotos.slice(0, 6);

  return (
    <div style={{ fontFamily: "'Inter','Poppins',-apple-system,BlinkMacSystemFont,sans-serif", background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%;font-family:'Inter','Poppins',-apple-system,BlinkMacSystemFont,sans-serif;}

        /* Ticker */
        .ticker-wrap{overflow:hidden;background:linear-gradient(90deg,#0f2d1c,#1a3c2e,#0f2d1c);margin-bottom:0;}
        .ticker-desktop{display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:6px 1rem;overflow:hidden;}
        .ticker-mobile{display:none;position:fixed;top:0;left:0;right:0;z-index:198;width:100%;background:linear-gradient(90deg,#0f2d1c,#1a3c2e,#0f2d1c);border-bottom:1px solid #174123;}
        @media(max-width:1024px){
          body{padding-top:34px!important}
          .ticker-desktop{display:none;}
          .ticker-mobile{display:block;overflow:hidden;padding:5px 0;height:34px;}
          .ticker-scroll{display:inline-flex;animation:ticker 30s linear infinite;white-space:nowrap;}
          .ticker-scroll:hover{animation-play-state:paused;}
          .sn-nav{top:34px!important;}
        }
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

        /* Navbar */
        .nav-bar-f{background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:68px;position:sticky;top:0;z-index:200;box-shadow:0 1px 0 #e9ede4,0 4px 20px rgba(0,0,0,.08);}
        .logo-btn-f{background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;}
        .desktop-nav-f{display:flex;gap:2.2rem;flex:1 1 auto;justify-content:center;align-items:center;}
        .nav-a-f{color:#4b5563;text-decoration:none;font-size:14px;font-weight:500;padding:5px 0;border-bottom:2px solid transparent;transition:all .22s cubic-bezier(.4,0,.2,1);font-family:'Inter','Poppins',sans-serif;letter-spacing:0.01em;}
        .nav-a-f:hover,.nav-a-f.active{color:#2d8a4e;border-bottom-color:#2d8a4e;}
        .mobile-hamburger-f{display:none;background:none;border:1.5px solid #e5e7eb;border-radius:9px;padding:7px 10px;cursor:pointer;font-size:17px;line-height:1;color:#374151;transition:all .2s;}
        .lift{transition:all .25s cubic-bezier(.4,0,.2,1);}
        .lift:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,.14)!important;}

        /* Mobile responsiveness */
        @media(max-width:768px){
          .farm-grid-f{grid-template-columns:1fr 1fr!important;gap:10px!important;}
          .farm-hero-f{height:220px!important;grid-row:span 1!important;}
          .farm-other-f{height:160px!important;}
          .trust-grid-f{flex-direction:column!important;align-items:stretch!important;}
          .trust-card-f{max-width:100%!important;}
          .footer-grid-f{grid-template-columns:1fr 1fr!important;gap:1.5rem!important;}
          .hero-strip-f{padding:3rem 1rem 2rem!important;}
        }
        @media(max-width:480px){
          .farm-grid-f{grid-template-columns:1fr!important;}
          .farm-hero-f,.farm-other-f{height:200px!important;grid-row:span 1!important;}
          .footer-grid-f{grid-template-columns:1fr!important;}
          .nav-bar-f{padding:0 1rem!important;}
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* ═══ TICKER BAR ═══ */}
      <div className="ticker-wrap">
        <div className="ticker-desktop">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 18px", fontSize: "11.5px", fontFamily: "'Inter','Poppins',sans-serif", fontWeight: 500, color: "#b3e9cc", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
              {item}
              {i < TICKER_ITEMS.length - 1 && <span style={{ marginLeft: "18px", color: "rgba(163,230,53,0.35)", fontSize: "14px", fontWeight: 300 }}>|</span>}
            </span>
          ))}
        </div>
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
      <SiteNav activePage="our-farms" />

      {/* ═══ HERO STRIP ═══ */}
      <div className="hero-strip-f" style={{ background: "linear-gradient(145deg,#071812 0%,#0a2218 30%,#0f3320 70%,#1c5a3a 100%)", padding: "4rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,78,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(163,230,53,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative", textAlign: "center", animation: "fadeUp .5s ease both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.28)", borderRadius: "24px", padding: "6px 18px", fontSize: "11px", color: "#bef264", marginBottom: "1.4rem", letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase" }}>
            🌾 Farm to Doorstep
          </span>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: "1rem", fontFamily: "'Poppins','Inter',sans-serif", letterSpacing: "-0.02em" }}>
            Where Freshness Begins
          </h1>
          <p style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(255,255,255,0.65)", maxWidth: "560px", margin: "0 auto 1.8rem", lineHeight: 1.85 }}>
            Every leaf, herb, and vegetable is grown with intention — harvested at peak freshness from our partner farms in Pune and delivered the same week.
          </p>
          <a href="/products"
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "linear-gradient(135deg,#2d8a4e,#1f6b3a)", color: "#fff", borderRadius: "10px", padding: "13px 30px", fontSize: "14.5px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 18px rgba(45,138,78,0.45)", fontFamily: "inherit", transition: "all .22s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}>
            🛒 Shop Our Produce
          </a>
        </div>
      </div>

      {/* Wave */}
      <div style={{ lineHeight: 0, background: "#f4f6f0" }}>
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "48px" }}>
          <path d="M0,28 C360,56 720,0 1080,28 C1260,42 1360,14 1440,28 L1440,0 L0,0 Z" fill="#0f3320" />
        </svg>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "24px", padding: "5px 18px", fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
            📸 Farm Gallery
          </span>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, color: "#0f1a0f", margin: "0 0 10px", fontFamily: "'Poppins','Inter',sans-serif", letterSpacing: "-0.02em" }}>
            Behind the Freshness
          </h2>
          <p style={{ fontSize: "clamp(13px,1.4vw,15px)", color: "#4b5563", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            A look inside our farms, growing chambers, and delivery process — where quality starts before it reaches your door.
          </p>
          <div style={{ width: "48px", height: "3px", background: "linear-gradient(90deg,#2d8a4e,#a3e635)", borderRadius: "2px", margin: "14px auto 0" }} />
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="farm-grid-f" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {photos.map((photo, idx) => (
              <div key={photo.id} className={`lift ${idx === 0 ? "farm-hero-f" : "farm-other-f"}`}
                style={{ borderRadius: "20px", overflow: "hidden", position: "relative", gridRow: idx === 0 ? "span 2" : undefined, height: idx === 0 ? "460px" : "210px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
                <img src={photo.imageUrl} alt={photo.title || "Farm"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s cubic-bezier(.4,0,.2,1)", display: "block" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(7,24,18,0.75) 0%,rgba(7,24,18,0.1) 50%,transparent 100%)" }} />
                {photo.title && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.2rem 1.4rem" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: idx === 0 ? "17px" : "13.5px", marginBottom: "3px", fontFamily: "'Poppins','Inter',sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{photo.title}</div>
                    {photo.description && <div style={{ color: "rgba(255,255,255,0.75)", fontSize: idx === 0 ? "13px" : "11.5px", lineHeight: 1.5 }}>{photo.description}</div>}
                  </div>
                )}
                {idx === 0 && (
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)", borderRadius: "20px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>🌿</span>
                    <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>Farm Fresh</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className="trust-grid-f" style={{ display: "flex", gap: "1rem", marginTop: "3rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🌱", title: "20+ Farm Partners",   desc: "Trusted Pune & Mumbai farms"       },
            { icon: "❄️", title: "Cold Chain Delivery", desc: "2–8°C from farm to door"           },
            { icon: "📅", title: "Wed & Sat Delivery",  desc: "Twice-weekly freshness guarantee"  },
            { icon: "🤝", title: "Pay After Delivery",  desc: "Zero advance payment required"     },
          ].map(b => (
            <div key={b.title} className="trust-card-f" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#fff", border: "1.5px solid #e9ede4", borderRadius: "16px", padding: "16px 20px", flex: "1 1 200px", maxWidth: "290px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, boxShadow: "0 2px 8px rgba(45,138,78,0.18)" }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f1a0f" }}>{b.title}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div style={{ marginTop: "3.5rem", background: "linear-gradient(135deg,#071812,#0f3320)", borderRadius: "24px", padding: "2.5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(163,230,53,0.06)", pointerEvents: "none" }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.25)", borderRadius: "20px", padding: "5px 16px", fontSize: "11px", color: "#bef264", marginBottom: "1rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            🚚 Delivered Twice a Week
          </span>
          <h3 style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 800, color: "#fff", margin: "0 0 10px", fontFamily: "'Poppins','Inter',sans-serif" }}>
            Ready to taste farm-fresh produce?
          </h3>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 auto 1.8rem", maxWidth: "420px", lineHeight: 1.8 }}>
            Order on WhatsApp or browse our full product range. Pay only after delivery — no advance required.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/products"
              style={{ background: "linear-gradient(135deg,#2d8a4e,#1f6b3a)", color: "#fff", borderRadius: "10px", padding: "13px 28px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px", boxShadow: "0 4px 18px rgba(45,138,78,0.45)", fontFamily: "inherit" }}>
              🛒 Shop Now
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer"
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: "10px", padding: "13px 28px", fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px", backdropFilter: "blur(8px)" }}>
              💬 WhatsApp Order
            </a>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "linear-gradient(180deg,#081812 0%,#060f0c 100%)", color: "#fff", borderTop: "1px solid rgba(45,138,78,0.15)" }}>
        <div style={{ lineHeight: 0, marginTop: "-1px" }}>
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
            <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#f4f6f0" />
          </svg>
        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1.5rem" }}>
          <div className="footer-grid-f" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
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
                  <WhatsAppIcon size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter','Poppins',sans-serif" }}>Quick Links</h4>
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
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter','Poppins',sans-serif" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter','Poppins',sans-serif" }}>Delivery Info</h4>
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
