"use client";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../../src/config/site";
import SiteNav from "../components/SiteNav";

const { delivery: DEL } = siteConfig;

// ── Icons ─────────────────────────────────────────────────────────────────────
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
function MailSvg({ size = 20, color = "#2d8a4e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function QFLogo({ height = 44, dark }: { height?: number; dark?: boolean }) {
  return <img src="/logo.png" alt="QualiFresh" style={{ height: `${height}px`, width: "auto", display: "block", objectFit: "contain" }} />;
}

const TICKER_ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];

export default function AboutPage() {

  // Contact modal state
  const [showContact, setShowContact]   = useState(false);
  const [cName, setCName]               = useState("");
  const [cEmail, setCEmail]             = useState("");
  const [cMobile, setCMobile]           = useState("");
  const [cMsg, setCMsg]                 = useState("");
  const [cSent, setCSent]               = useState(false);

  // Cart-aware WhatsApp state (reads localStorage product cache set by SiteNav)
  const [waCart, setWaCart]       = useState<Record<string, number>>({});
  const [waProds, setWaProds]     = useState<{_id:string;name:string;price:number}[]>([]);

  useEffect(() => { document.title = siteConfig.pageTitles.aboutUs; }, []);

  // Scroll-in animation observer
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".scroll-anim");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
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

  const closeModal = () => { setShowContact(false); setCName(""); setCEmail(""); setCMobile(""); setCMsg(""); setCSent(false); };
  const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail);
  const phoneOk  = !cMobile || /^[6-9]\d{9}$/.test(cMobile.replace(/\s+/g, "").replace(/^(\+91|91)/, ""));
  const canSend  = cEmail.trim() && emailOk && cMsg.trim() && phoneOk;

  return (
    <div style={{ fontFamily: "Georgia,'Times New Roman',serif", background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%}

        /* Ticker */
        .a-ticker-wrap {}
        .a-ticker-desktop { display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:7px 1rem;overflow:hidden;width:100%;background:#0f8a65; }
        .a-ticker-mobile { display:none;width:100%;background:#0f8a65;border-bottom:1px solid #0a6e50; }
        @media(max-width:1024px){
          .a-ticker-desktop{display:none}
          .a-ticker-mobile{display:block;overflow:hidden;padding:5px 0;height:34px}
          .a-ticker-scroll{display:inline-flex;animation:aticker 30s linear infinite;white-space:nowrap}
          .a-ticker-scroll:hover{animation-play-state:paused}
        }
        @keyframes aticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* Buttons */
        .btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:700;transition:all .2s}
        .btn-g:hover{background:#1f6b3a;transform:translateY(-1px);box-shadow:0 4px 14px rgba(45,138,78,.35)}
        .lift{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
        .lift:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(0,0,0,.15)!important;border-color:rgba(45,138,78,0.35)!important}
        input:focus,textarea:focus{outline:none}

        /* Scroll-in animations */
        @keyframes fadeInUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .scroll-anim{opacity:0;transform:translateY(28px);transition:none}
        .scroll-anim.visible{animation:fadeInUp .55s cubic-bezier(.22,1,.36,1) both}
        .scroll-anim.d1{animation-delay:.07s}
        .scroll-anim.d2{animation-delay:.17s}
        .scroll-anim.d3{animation-delay:.27s}
        .scroll-anim.d4{animation-delay:.37s}

        /* About grids */
        /* Stats: 4 fixed-width columns that won't stretch — centered in hero */
        .about-stats-grid { display:grid;grid-template-columns:repeat(4,minmax(130px,220px));gap:1.2rem;justify-content:center; }
        .about-stats-cell { background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:1.4rem 1rem;text-align:center;backdrop-filter:blur(6px);min-width:0; }
        .about-mv-grid    { display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem; }
        .about-steps-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem; }
        .about-story-grid { display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center; }
        .about-step-line  { display:block; }
        .section-heading  { font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;color:#0f1a0f; }
        .about-card-img   { height:130px; }

        /* Footer */
        .footer-grid { display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:2rem; }

        @media(max-width:1024px){
          .about-stats-grid { grid-template-columns:repeat(2,minmax(130px,260px))!important;gap:1rem!important; }
          .about-mv-grid    { grid-template-columns:repeat(2,1fr)!important; }
          .about-steps-grid { grid-template-columns:repeat(2,1fr)!important; }
          .about-story-grid { grid-template-columns:1fr!important;gap:1.5rem!important; }
          .about-story-img  { display:none!important; }
          .about-step-line  { display:none!important; }
          .footer-grid      { grid-template-columns:1fr 1fr!important;gap:1.5rem!important; }
          .about-card-img   { height:110px!important; }
        }
        @media(max-width:640px){
          .about-stats-grid { grid-template-columns:repeat(2,1fr)!important; }
          .about-stats-cell { padding:1.1rem 0.8rem!important; }
          .about-mv-grid    { grid-template-columns:1fr!important; }
          .about-card-img   { height:100px!important; }
        }
        @media(max-width:480px){
          .about-stats-grid { grid-template-columns:repeat(2,1fr)!important;gap:0.6rem!important; }
          .about-stats-cell { padding:0.9rem 0.6rem!important;border-radius:12px!important; }
          .about-steps-grid { grid-template-columns:repeat(2,1fr)!important;gap:0.6rem!important; }
          .footer-grid      { grid-template-columns:1fr 1fr!important;gap:1rem!important; }
          .about-how-section  { padding:2rem 1rem!important; }
          .about-guar-section { padding:2rem 1rem!important; }
          .about-card-img   { height:88px!important; }
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* ── Ticker desktop ── */}
      <div className="a-ticker-wrap">
        <div className="a-ticker-desktop">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}
              {i < TICKER_ITEMS.length - 1 && <span style={{ marginLeft: "16px", color: "rgba(163,230,53,0.4)" }}>·</span>}
            </span>
          ))}
        </div>
        <div className="a-ticker-mobile">
          <div className="a-ticker-scroll">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
                {item}<span style={{ marginLeft: "22px", color: "rgba(163,230,53,0.4)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <SiteNav activePage="about-us" />

      {/* ══════════════════════════════════════════════════════
          ABOUT US CONTENT
      ══════════════════════════════════════════════════════ */}

      {/* ── 1. Hero strip ── */}
      <div style={{ background: "linear-gradient(145deg,#071812 0%,#0a2218 30%,#0f3320 70%,#1c5a3a 100%)", padding: "4rem 2rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle,rgba(45,138,78,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(163,230,53,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1300px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "5px 18px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "16px" }}>Our Story</span>
            <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
              Bringing <span style={{ color: "#a3e635" }}>Restaurant-Grade</span><br />Freshness to Your Home
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", fontFamily: "sans-serif", maxWidth: "620px", margin: "0 auto", lineHeight: 1.8 }}>
              QualiFresh was born from a simple belief that every home deserves the same exotic, farm-fresh produce that top restaurants enjoy. We grow everything ourselves on our farms in Pune - no middlemen, no sourcing, just pure farm-fresh produce.
            </p>
          </div>
          <div className="about-stats-grid">
            {[
              { value: "57+", label: "Exotic Varieties",  sub: "Korean, Thai & more",   color: "#a3e635" },
              { value: "20+", label: "Farm Partners",     sub: "Trusted Pune farms",     color: "#34d399" },
              { value: "2",   label: "Cities Served",     sub: "Pune & Mumbai",          color: "#60a5fa" },
              { value: "2×",  label: "Weekly Deliveries", sub: "Wednesday & Saturday",   color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} className="about-stats-cell">
                <div style={{ fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", fontFamily: "sans-serif", marginBottom: "3px" }}>{s.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontFamily: "sans-serif" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave: hero → Our Story */}
      <div style={{ lineHeight: 0, background: "#fff" }}>
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "44px" }}>
          <path d="M0,24 C360,48 720,0 1080,24 C1260,36 1360,12 1440,24 L1440,0 L0,0 Z" fill="#0f3320" />
        </svg>
      </div>

      {/* ── 2. Our Story ── */}
      <div style={{ background: "#fff", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="about-story-grid">
            <div>
              <span style={{ display: "inline-block", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "14px" }}>Our Roots</span>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 800, color: "#0f1a0f", margin: "0 0 16px", lineHeight: 1.25 }}>From Pune's Farms<br />to Your Kitchen</h2>
              <p style={{ fontSize: "14px", color: "#4b5563", fontFamily: "sans-serif", lineHeight: 1.9, marginBottom: "16px" }}>
                We started QualiFresh after seeing a gap - home cooks and health-conscious families in Pune &amp; Mumbai had no reliable way to access the specialty produce that only high-end restaurants could source. We changed that.
              </p>
              <p style={{ fontSize: "14px", color: "#4b5563", fontFamily: "sans-serif", lineHeight: 1.9, marginBottom: "24px" }}>
                Today we grow with <strong style={{ color: "#166534" }}>20+ dedicated farms</strong> across the Pune region, maintain a strict cold chain, and personally inspect every batch before it ships. Every order is packed with care and delivered on your chosen day — Wednesday or Saturday.
              </p>
              <blockquote style={{ borderLeft: "4px solid #2d8a4e", paddingLeft: "1.2rem", margin: 0 }}>
                <p style={{ fontSize: "15px", color: "#1a3c2e", fontStyle: "italic", fontWeight: 600, lineHeight: 1.7, margin: "0 0 6px" }}>"Quality isn't just a word for us — it's the reason we wake up every morning."</p>
                <cite style={{ fontSize: "12.5px", color: "#6b7280", fontFamily: "sans-serif", fontStyle: "normal", fontWeight: 600 }}>— Rohit, Founder, QualiFresh</cite>
              </blockquote>
            </div>
            <div className="about-story-img" style={{ borderRadius: "20px", overflow: "hidden", height: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
              <img src="/products/farm-1776104049239.png?t=1776104050928" alt="Fresh farm produce" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Mission · Vision · Promise ── */}
      <div style={{ background: "linear-gradient(135deg,#071812 0%,#0f2a1a 50%,#071812 100%)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "12px" }}>What Drives Us</span>
            <h2 className="section-heading" style={{ color: "#fff" }}>Mission, Vision &amp; Promise</h2>
          </div>
          <div className="about-mv-grid">
            {[
              { icon: "🎯", gradient: "linear-gradient(135deg,#0a2e1a,#1a5c30)", img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80&fit=crop", stat: "57+", statSub: "Exotic varieties", title: "Our Mission", text: "To grow the world's finest exotic vegetables - Korean, Thai, Japanese, and beyond - accessible to every home cook and family across India, at fair prices with zero compromise on freshness and quality." },
              { icon: "🌏", gradient: "linear-gradient(135deg,#0c2340,#1e4080)", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&fit=crop", stat: "All India", statSub: "Our reach goal", title: "Our Vision",  text: "A future where every Indian household has access to farm-fresh, globally diverse produce. We're building the infrastructure — farm partnerships, cold chain, and community — to make that happen." },
              { icon: "🤝", gradient: "linear-gradient(135deg,#1e0a3c,#4a1080)", img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80&fit=crop", stat: "Zero", statSub: "Advance required", title: "Our Promise", text: "No advance payment. Pay only after delivery. Not satisfied? We replace it, no questions asked. Every batch is inspected for freshness and quality before it leaves the farm." },
            ].map((card, i) => (
              <div key={card.title} className={`lift scroll-anim d${i + 1}`} style={{ borderRadius: "18px", overflow: "hidden", background: card.gradient, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", cursor: "pointer" }}>
                <div className="about-card-img" style={{ overflow: "hidden", position: "relative" }}>
                  <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
                  <div style={{ position: "absolute", inset: 0, background: card.gradient, opacity: 0.7 }} />
                  <div style={{ position: "absolute", top: "14px", left: "16px" }}>
                    <span style={{ fontSize: "28px" }}>{card.icon}</span>
                  </div>
                  <div style={{ position: "absolute", top: "12px", right: "14px", textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#a3e635", lineHeight: 1 }}>{card.stat}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>{card.statSub}</div>
                  </div>
                </div>
                <div style={{ padding: "1.2rem" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{card.title}</h3>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontFamily: "sans-serif" }}>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. How It Works ── */}
      <div className="about-how-section" style={{ background: "linear-gradient(135deg,#060f0c 0%,#0a1f12 50%,#060f0c 100%)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "12px" }}>The Process</span>
            <h2 className="section-heading" style={{ color: "#fff" }}>From Farm to Your Doorstep</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", fontFamily: "sans-serif", marginTop: "8px", maxWidth: "500px", margin: "8px auto 0" }}>A transparent, quality-controlled journey every single order.</p>
          </div>
          <div className="about-steps-grid">
            {[
              { step: "01", icon: "🌾", gradient: "linear-gradient(135deg,#0a2e1a,#1a5c30)", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop", title: "Farm Sourced",    desc: "Vegetables are harvested from our farms in Pune — same morning, every order." },
              { step: "02", icon: "🔬", gradient: "linear-gradient(135deg,#0c2340,#1e4080)", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&fit=crop", title: "Quality Checked", desc: "Every batch is inspected for freshness and quality before it's packed." },
              { step: "03", icon: "❄️", gradient: "linear-gradient(135deg,#0a2030,#0a4060)", img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop", title: "Cold Packed",     desc: "Packed in temperature-controlled conditions (2–8°C) to preserve peak freshness and nutrition." },
              { step: "04", icon: "🚚", gradient: "linear-gradient(135deg,#1e0a3c,#4a1080)", img: "https://images.unsplash.com/photo-1584277261846-c6a1672ed979?w=600&q=80&fit=crop", title: "Door Delivered",  desc: "Delivered to your door on your chosen day (Wed or Sat). Pay only after you receive." },
            ].map((s, i) => (
              <div key={s.step} className={`lift scroll-anim d${i + 1}`} style={{ borderRadius: "18px", overflow: "hidden", background: s.gradient, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", cursor: "pointer" }}>
                <div className="about-card-img" style={{ overflow: "hidden", position: "relative" }}>
                  <img src={s.img} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
                  <div style={{ position: "absolute", inset: 0, background: s.gradient, opacity: 0.7 }} />
                  <div style={{ position: "absolute", top: "14px", left: "16px" }}>
                    <span style={{ fontSize: "28px" }}>{s.icon}</span>
                  </div>
                  <div style={{ position: "absolute", top: "12px", right: "14px", textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#a3e635", lineHeight: 1 }}>STEP</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#a3e635", lineHeight: 1 }}>{s.step}</div>
                  </div>
                </div>
                <div style={{ padding: "1.2rem" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontFamily: "sans-serif" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Quality Guarantee strip ── */}
      <div className="about-guar-section" style={{ background: "linear-gradient(135deg,#0a1f12,#0f3020,#1a4a2e)", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 16px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "14px" }}>Our Guarantee</span>
          <h2 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 800, color: "#fff", margin: "0 0 2.5rem" }}>Why Thousands Trust QualiFresh</h2>
          <div className="about-stats-grid">
            {[
              { icon: "💳", gradient: "linear-gradient(135deg,#0a2e1a,#1a5c30)", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fit=crop", stat: "₹0",   statSub: "Upfront cost",   title: "No Advance Payment",  desc: "Order on WhatsApp, pay only after delivery. Zero financial risk — ever." },
              { icon: "🔄", gradient: "linear-gradient(135deg,#0c2340,#1e4080)", img: "https://images.unsplash.com/photo-1559181567-c3190ca9d1d7?w=600&q=80&fit=crop", stat: "100%", statSub: "Satisfaction",    title: "Free Replacement",    desc: "Not happy with freshness? We replace it, no questions asked, same week." },
              { icon: "❄️", gradient: "linear-gradient(135deg,#0a2030,#0a4060)", img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&fit=crop", stat: "2–8°C", statSub: "Preserved",     title: "Cold Chain Assured",  desc: "From 37°C farm to your door at 2–8°C. Nutrition and flavour fully preserved." },
              { icon: "🌱", gradient: "linear-gradient(135deg,#1e2a0a,#3a5010)", img: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80&fit=crop", stat: "20+",  statSub: "Farm partners",  title: "Sustainably Sourced", desc: "Eco packaging, local farm partnerships, and minimum-waste operations." },
            ].map((g, i) => (
              <div key={g.title} className={`lift scroll-anim d${i + 1}`} style={{ borderRadius: "18px", overflow: "hidden", background: g.gradient, color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", cursor: "pointer" }}>
                <div className="about-card-img" style={{ overflow: "hidden", position: "relative" }}>
                  <img src={g.img} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
                  <div style={{ position: "absolute", inset: 0, background: g.gradient, opacity: 0.7 }} />
                  <div style={{ position: "absolute", top: "14px", left: "16px" }}>
                    <span style={{ fontSize: "28px" }}>{g.icon}</span>
                  </div>
                  <div style={{ position: "absolute", top: "12px", right: "14px", textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#a3e635", lineHeight: 1 }}>{g.stat}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>{g.statSub}</div>
                  </div>
                </div>
                <div style={{ padding: "1.2rem" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{g.title}</h3>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.72)", lineHeight: 1.7, fontFamily: "sans-serif" }}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <a href="/products" className="btn-g" style={{ padding: "13px 28px", fontSize: "14px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px" }}>🛒 Shop Now</a>
            <a href={waUrl} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "13px 28px", fontSize: "14px", fontWeight: 700, borderRadius: "10px", background: "#25d366", color: "#fff", textDecoration: "none", fontFamily: "inherit" }}>
              <WhatsAppIcon size={16} /> Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "linear-gradient(180deg,#081812 0%,#060f0c 100%)", color: "#fff" }}>
        <div style={{ lineHeight: 0, marginTop: "-1px" }}>
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
            <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#1a4a2e" />
          </svg>
        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1.5rem" }}>
          <div className="footer-grid" style={{ marginBottom: "2.5rem" }}>
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
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                  style={{ width: "36px", height: "36px", background: "#25d366", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}>
                  <WhatsAppIcon size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Quick Links</h4>
              {[
                { label: "Home",       href: "/"          },
                { label: "Products",   href: "/products"  },
                { label: "About Us",   href: "/about-us"  },
                { label: "Our Farms",  href: "/our-farms" },
                { label: "Contact Us", href: "/contact"   },
              ].map(link => (
                <a key={link.label} href={link.href}
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "9px", textDecoration: "none", fontFamily: "sans-serif", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#d4a017")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                  {link.label}
                </a>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>Delivery Info</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2, fontFamily: "sans-serif" }}>
                <div>📦 Min order: ₹{DEL.minOrder}</div>
                <div>🚚 Free Delivery above ₹{DEL.freeDeliveryAbove}</div>
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
