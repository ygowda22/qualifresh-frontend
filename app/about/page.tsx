"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "../../src/config/site";

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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [storyImg, setStoryImg]     = useState<string>("");

  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem("qf_farm_photos");
        const photos = saved ? (JSON.parse(saved) as {imageUrl:string}[]) : [];
        const first = photos.find(p => p.imageUrl && p.imageUrl.startsWith("https://"));
        setStoryImg(first ? first.imageUrl : "");
      } catch {}
    };
    fetch("/backend/api/farms")
      .then(r => r.ok ? r.json() : null)
      .then((data: any[]) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const first = data.find((p: any) => p.imageUrl && p.imageUrl.startsWith("https://"));
          setStoryImg(first ? first.imageUrl : "");
        } else { loadFromLocalStorage(); }
      })
      .catch(loadFromLocalStorage);
  }, []);

  // Contact modal state
  const [showContact, setShowContact]   = useState(false);
  const [cName, setCName]               = useState("");
  const [cEmail, setCEmail]             = useState("");
  const [cMobile, setCMobile]           = useState("");
  const [cMsg, setCMsg]                 = useState("");
  const [cSent, setCSent]               = useState(false);

  const closeModal = () => { setShowContact(false); setCName(""); setCEmail(""); setCMobile(""); setCMsg(""); setCSent(false); };
  const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail);
  const phoneOk  = !cMobile || /^[6-9]\d{9}$/.test(cMobile.replace(/\s+/g, "").replace(/^(\+91|91)/, ""));
  const canSend  = cEmail.trim() && emailOk && cMsg.trim() && phoneOk;

  return (
    <div style={{ background: "#f4f6f0", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%}

        /* Ticker */
        .a-ticker-wrap { overflow:hidden; background:#1a3c2e; }
        .a-ticker-desktop { display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:7px 1rem;overflow:hidden; }
        .a-ticker-mobile { display:none;position:fixed;top:0;left:0;right:0;z-index:198;width:100%;background:#1a3c2e;border-bottom:1px solid #174123; }
        @media(max-width:1024px){
          body{padding-top:44px!important}
          .a-ticker-desktop{display:none}
          .a-ticker-mobile{display:block;overflow:hidden;padding:7px 0}
          .a-ticker-scroll{display:inline-flex;animation:aticker 30s linear infinite;white-space:nowrap}
          .a-ticker-scroll:hover{animation-play-state:paused}
          .a-nav{top:44px!important}
          .a-hamburger{display:flex!important}
          .a-desknav{display:none!important}
          .a-mob-menu{top:calc(44px + 68px)!important}
        }
        @keyframes aticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

        /* Navbar */
        .a-nav { position:sticky;top:0;z-index:200;background:#fff;box-shadow:0 1px 0 #e5e7eb,0 4px 16px rgba(0,0,0,.06); }
        .a-hamburger { display:none;background:none;border:1px solid #e5e7eb;border-radius:8px;padding:6px 9px;cursor:pointer;font-size:18px;line-height:1; }
        .a-mob-menu { position:fixed;left:0;right:0;background:#f9fafb;border-top:2px solid #2d8a4e;border-bottom:1px solid #e5e7eb;padding:.8rem 1rem;display:flex;flex-direction:column;gap:.4rem;z-index:210;box-shadow:0 4px 12px rgba(0,0,0,.08); }
        .a-nav-link { color:#4b5563;text-decoration:none;font-size:14px;font-weight:600;padding:4px 0;border-bottom:2px solid transparent;transition:all .2s; }
        .a-nav-link:hover,.a-nav-link.active{color:#2d8a4e;border-bottom-color:#2d8a4e}

        /* Buttons */
        .btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;transition:all .2s}
        .btn-g:hover{background:#1f6b3a;transform:translateY(-1px);box-shadow:0 4px 14px rgba(45,138,78,.35)}
        .lift{transition:all .25s ease}
        .lift:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(0,0,0,.12)!important}
        input:focus,textarea:focus{outline:none}

        /* About grids */
        .about-stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem; }
        .about-mv-grid    { display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem; }
        .about-steps-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem; }
        .about-story-grid { display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center; }
        .about-step-line  { display:block; }
        .section-heading  { font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;color:#0f1a0f; }

        /* Footer */
        .footer-grid { display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:2rem; }

        @media(max-width:1024px){
          .about-stats-grid { grid-template-columns:repeat(2,1fr)!important; }
          .about-mv-grid    { grid-template-columns:repeat(1,1fr)!important; }
          .about-steps-grid { grid-template-columns:repeat(2,1fr)!important; }
          .about-story-grid { grid-template-columns:1fr!important;gap:1.5rem!important; }
          .about-story-img  { display:none!important; }
          .about-step-line  { display:none!important; }
          .footer-grid      { grid-template-columns:1fr 1fr!important;gap:1.5rem!important; }
        }
        @media(max-width:480px){
          .about-stats-grid { grid-template-columns:repeat(2,1fr)!important; }
          .about-steps-grid { grid-template-columns:repeat(2,1fr)!important; }
          .footer-grid      { grid-template-columns:1fr!important; }
        }
        nextjs-portal{display:none!important}
      `}</style>

      {/* ── Ticker desktop ── */}
      <div className="a-ticker-wrap">
        <div className="a-ticker-desktop">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}
              {i < TICKER_ITEMS.length - 1 && <span style={{ marginLeft: "16px", color: "rgba(163,230,53,0.4)" }}>·</span>}
            </span>
          ))}
        </div>
        <div className="a-ticker-mobile">
          <div className="a-ticker-scroll">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
                {item}<span style={{ marginLeft: "22px", color: "rgba(163,230,53,0.4)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="a-nav" style={{ padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
        <a href="/" style={{ textDecoration: "none", lineHeight: 0 }}><QFLogo height={52} /></a>

        {/* Desktop nav links */}
        <div className="a-desknav" style={{ display: "flex", gap: "2rem", flex: "1 1 auto", justifyContent: "center" }}>
          {[
            { label: "Home",      href: "/" },
            { label: "Products",  href: "/" },
            { label: "About Us",  href: "/about", active: true },
            { label: "Our Farms", href: "#" },
            { label: "Contact",   href: `mailto:${siteConfig.email}` },
          ].map(item => (
            <a key={item.label} href={item.href} className={`a-nav-link${item.active ? " active" : ""}`}>{item.label}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <a href="/" className="btn-g" style={{ padding: "9px 18px", fontSize: "13.5px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>🛒 Shop Now</a>
          <button className="a-hamburger" onClick={() => setMobileMenu(m => !m)}>{mobileMenu ? "✕" : "☰"}</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="a-mob-menu">
          {[
            { label: "Home",      href: "/" },
            { label: "Products",  href: "/" },
            { label: "About Us",  href: "/about" },
            { label: "Our Farms", href: "#" },
            { label: "Contact",   href: `mailto:${siteConfig.email}` },
          ].map(item => (
            <a key={item.label} href={item.href} onClick={() => setMobileMenu(false)}
              style={{ color: "#374151", textDecoration: "none", fontSize: "15px", fontWeight: 600, padding: "10px 14px", borderRadius: "9px", background: "#fff", border: "1px solid #e5e7eb" }}>
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ABOUT US CONTENT
      ══════════════════════════════════════════════════════ */}

      {/* ── 1. Hero strip ── */}
      <div style={{ background: "linear-gradient(135deg,#061a0e 0%,#0d3320 50%,#1a4a2e 100%)", padding: "4rem 1.5rem 3rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(163,230,53,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(45,138,78,0.06)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1160px", margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "5px 18px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>Our Story</span>
            <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
              Bringing <span style={{ color: "#a3e635" }}>Restaurant-Grade</span><br />Freshness to Your Home
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", maxWidth: "620px", margin: "0 auto", lineHeight: 1.8 }}>
              QualiFresh was born from a simple belief — that every home deserves the same exotic, farm-fresh produce that top restaurants enjoy. We source directly from trusted farms in Pune and deliver twice a week so freshness is never a compromise.
            </p>
          </div>
          <div className="about-stats-grid">
            {[
              { value: "57+", label: "Exotic Varieties",  sub: "Korean, Thai & more",   color: "#a3e635" },
              { value: "20+", label: "Farm Partners",     sub: "Trusted Pune farms",     color: "#34d399" },
              { value: "2",   label: "Cities Served",     sub: "Pune & Mumbai",          color: "#60a5fa" },
              { value: "2×",  label: "Weekly Deliveries", sub: "Wednesday & Saturday",   color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.5rem 1.2rem", textAlign: "center", backdropFilter: "blur(6px)" }}>
                <div style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "3px" }}>{s.label}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Our Story ── */}
      <div style={{ background: "#fff", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="about-story-grid">
            <div>
              <span style={{ display: "inline-block", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "14px" }}>Our Roots</span>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: 800, color: "#0f1a0f", margin: "0 0 16px", lineHeight: 1.25 }}>From Pune's Farms<br />to Your Kitchen</h2>
              <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.9, marginBottom: "16px" }}>
                We started QualiFresh after seeing a gap — home cooks and health-conscious families in Pune &amp; Mumbai had no reliable way to access the specialty produce that only high-end restaurants could source. We changed that.
              </p>
              <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.9, marginBottom: "24px" }}>
                Today we partner with <strong style={{ color: "#166534" }}>20+ dedicated farms</strong> across the Pune region, maintain a strict cold chain, and personally inspect every batch before it ships. Every order is packed with care and delivered on your chosen day — Wednesday or Saturday.
              </p>
              <blockquote style={{ borderLeft: "4px solid #2d8a4e", paddingLeft: "1.2rem", margin: 0 }}>
                <p style={{ fontSize: "15px", color: "#1a3c2e", fontStyle: "italic", fontWeight: 600, lineHeight: 1.7, margin: "0 0 6px" }}>"Quality isn't just a word for us — it's the reason we wake up every morning."</p>
                <cite style={{ fontSize: "12.5px", color: "#6b7280", fontStyle: "normal", fontWeight: 600 }}>— Rohit, Founder, QualiFresh</cite>
              </blockquote>
            </div>
            {storyImg && (
              <div className="about-story-img" style={{ borderRadius: "20px", overflow: "hidden", height: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
                <img src={storyImg} alt="Fresh farm produce" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Mission · Vision · Promise ── */}
      <div style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#fff 50%,#f0fdf4 100%)", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ display: "inline-block", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "12px" }}>What Drives Us</span>
            <h2 className="section-heading">Mission, Vision &amp; Promise</h2>
          </div>
          <div className="about-mv-grid">
            {[
              { icon: "🎯", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", title: "Our Mission", text: "To make the world's finest exotic vegetables — Korean, Thai, Japanese, and beyond — accessible to every home cook and family across India, at fair prices with zero compromise on freshness." },
              { icon: "🌏", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", title: "Our Vision",  text: "A future where every Indian household has access to farm-fresh, globally diverse produce. We're building the infrastructure — farm partnerships, cold chain, and community — to make that happen." },
              { icon: "🤝", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", title: "Our Promise", text: "No advance payment. Pay only after delivery. Not satisfied? We replace it, no questions asked. Every batch is cold-chain handled and freshness-inspected before it leaves the farm." },
            ].map(card => (
              <div key={card.title} className="lift" style={{ background: card.bg, border: `1.5px solid ${card.border}`, borderRadius: "18px", padding: "2rem 1.6rem" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "16px", boxShadow: `0 4px 14px ${card.border}` }}>{card.icon}</div>
                <h3 style={{ margin: "0 0 10px", fontSize: "17px", fontWeight: 800, color: card.color }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#4b5563", lineHeight: 1.8 }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. How It Works ── */}
      <div style={{ background: "#fff", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ display: "inline-block", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 700, color: "#16a34a", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "12px" }}>The Process</span>
            <h2 className="section-heading">From Farm to Your Doorstep</h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px", maxWidth: "500px", margin: "8px auto 0" }}>A transparent, quality-controlled journey every single order.</p>
          </div>
          <div className="about-steps-grid">
            {[
              { step: "01", icon: "🌾", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", title: "Farm Sourced",    desc: "Vegetables are harvested from our partner farms in Pune — same morning, every order." },
              { step: "02", icon: "🔬", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", title: "Quality Checked", desc: "Every batch is inspected for freshness, size consistency, and zero pesticide residue." },
              { step: "03", icon: "❄️", color: "#0891b2", bg: "#f0f9ff", border: "#bae6fd", title: "Cold Packed",     desc: "Packed in temperature-controlled conditions (2–8°C) to preserve peak freshness and nutrition." },
              { step: "04", icon: "🚚", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", title: "Door Delivered",  desc: "Delivered to your door on your chosen day (Wed or Sat). Pay only after you receive." },
            ].map((s, i) => (
              <div key={s.step} style={{ position: "relative" }}>
                {i < 3 && <div className="about-step-line" style={{ position: "absolute", top: "28px", left: "calc(50% + 28px)", right: "-50%", height: "2px", background: "linear-gradient(90deg,#2d8a4e,#a3e635)", zIndex: 0 }} />}
                <div className="lift" style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: "18px", padding: "1.8rem 1.4rem", textAlign: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 12px", boxShadow: `0 4px 14px ${s.border}` }}>{s.icon}</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: s.color, letterSpacing: "1.5px", marginBottom: "6px" }}>STEP {s.step}</div>
                  <h4 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 800, color: "#0f1a0f" }}>{s.title}</h4>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "#6b7280", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Quality Guarantee strip ── */}
      <div style={{ background: "linear-gradient(135deg,#0a1f12,#0f3020,#1a4a2e)", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 16px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "14px" }}>Our Guarantee</span>
          <h2 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 800, color: "#fff", margin: "0 0 2.5rem" }}>Why Thousands Trust QualiFresh</h2>
          <div className="about-stats-grid">
            {[
              { icon: "💳", title: "No Advance Payment",  desc: "Order on WhatsApp, pay only after delivery. Zero financial risk — ever.",     color: "#a3e635" },
              { icon: "🔄", title: "Free Replacement",    desc: "Not happy with freshness? We replace it, no questions asked, same week.",    color: "#34d399" },
              { icon: "❄️", title: "Cold Chain Assured",  desc: "From 37°C farm to your door at 2–8°C. Nutrition and flavour fully preserved.", color: "#60a5fa" },
              { icon: "🌱", title: "Sustainably Sourced", desc: "Eco packaging, local farm partnerships, and minimum-waste operations.",        color: "#f59e0b" },
            ].map(g => (
              <div key={g.title} className="lift" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.8rem 1.4rem", textAlign: "center", backdropFilter: "blur(6px)" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{g.icon}</div>
                <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 800, color: g.color }}>{g.title}</h4>
                <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <a href="/" className="btn-g" style={{ padding: "13px 28px", fontSize: "14px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "7px" }}>🛒 Shop Now</a>
            <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "13px 28px", fontSize: "14px", fontWeight: 700, borderRadius: "10px", background: "#25d366", color: "#fff", textDecoration: "none", fontFamily: "inherit" }}>
              <WhatsAppIcon size={16} /> Order on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#0a1628", color: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 1.5rem" }}>
          <div className="footer-grid" style={{ marginBottom: "2.5rem" }}>
            <div>
              <div style={{ marginBottom: "14px" }}><QFLogo height={38} dark /></div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: "230px" }}>{siteConfig.footer.about}</p>
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
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Quick Links</h4>
              {[
                { label: "Home",       href: "/" },
                { label: "Products",   href: "/" },
                { label: "About Us",   href: "/about" },
                { label: "Our Farms",  href: "#" },
                { label: "Contact Us", href: `mailto:${siteConfig.email}` },
              ].map(link => (
                <a key={link.label} href={link.href}
                  style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "9px", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#d4a017")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                  {link.label}
                </a>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#d4a017", fontWeight: 700, marginBottom: "14px", fontSize: "12.5px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Delivery Info</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
                <div>📦 Min order: ₹{DEL.minOrder}</div>
                <div>🚚 Free delivery above ₹{DEL.freeDeliveryAbove}</div>
                <div>🎁 Free microgreens above ₹{DEL.freeMicrogreensAbove}</div>
                <div>⏰ Order by {DEL.orderCutoff.wednesday} for Wed</div>
                <div>⏰ Order by {DEL.orderCutoff.saturday} for Sat</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.tagline}. All rights reserved. &nbsp;|&nbsp; {siteConfig.footer.developer}
            </p>
            <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.22)" }}>
              {siteConfig.footer.tagline}
            </p>
          </div>
        </div>
      </footer>

      {/* ── Floating email support button ── */}
      <button onClick={() => setShowContact(true)}
        title={`Email Support: ${siteConfig.email}`}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", width: "48px", height: "48px", background: "#fff", border: "2px solid #2d8a4e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(45,138,78,0.22)", cursor: "pointer", zIndex: 199 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
        <MailSvg size={21} color="#2d8a4e" />
        <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "13px", height: "13px", background: "#2d8a4e", borderRadius: "50%", border: "2.5px solid #fff" }} />
      </button>

      {/* ── Contact modal ── */}
      {showContact && (
        <>
          <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: "18px", padding: "2rem", width: "clamp(300px,90vw,420px)", zIndex: 600, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            {cSent ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div style={{ fontSize: "52px", marginBottom: "14px" }}>✅</div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#166534", margin: "0 0 8px" }}>Email Client Opened!</h2>
                <p style={{ fontSize: "13.5px", color: "#6b7280", marginBottom: "20px" }}>Your email app should have opened with your message pre-filled. Hit send from there!</p>
                <button onClick={closeModal} className="btn-g" style={{ padding: "11px 28px", fontSize: "14px" }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.3rem", position: "relative" }}>
                  <button onClick={closeModal} style={{ position: "absolute", right: 0, top: 0, background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
                  <img src="/logo.png" alt="QualiFresh" style={{ height: "64px", width: "auto", display: "block", margin: "0 auto 8px", objectFit: "contain" }} />
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f1a0f", margin: "0 0 8px" }}>Contact Support</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                    <a href={`mailto:${siteConfig.email}`} style={{ fontSize: "12.5px", color: "#2d8a4e", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>✉️</span>{siteConfig.email}
                    </a>
                    <a href={`tel:${siteConfig.phone}`} style={{ fontSize: "12.5px", color: "#2d8a4e", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>📞</span>{siteConfig.phoneDisplay}
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {([
                    { label: "Your Name",     placeholder: "e.g. Priya Sharma", value: cName,   set: setCName,   type: "text" },
                    { label: "Your Email",    placeholder: "your@email.com",     value: cEmail,  set: setCEmail,  type: "email", required: true },
                    { label: "Mobile Number", placeholder: "e.g. 9876543210",    value: cMobile, set: setCMobile, type: "tel" },
                  ] as { label: string; placeholder: string; value: string; set: (v: string) => void; type: string; required?: boolean }[]).map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>
                        {f.label}{f.required && <span style={{ color: "#ef4444" }}> *</span>}
                      </label>
                      <input type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.set(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", background: "#fff", color: "#111827" }}
                        onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>Message <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea placeholder="How can we help you?" value={cMsg} onChange={e => setCMsg(e.target.value)} rows={4}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", resize: "vertical", background: "#fff", color: "#111827" }}
                      onFocus={e => (e.target.style.borderColor = "#2d8a4e")} onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>
                {cEmail && !emailOk && <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}>Please enter a valid email address</p>}
                {cMobile && !phoneOk && <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}>Please enter a valid 10-digit mobile number</p>}
                <button disabled={!canSend}
                  onClick={() => {
                    if (!canSend) return;
                    const body = [`Name: ${cName || "Not provided"}`, `Email: ${cEmail}`, `Phone: ${cMobile || "Not provided"}`, ``, `Message:`, cMsg].join("\n");
                    window.open(`mailto:${siteConfig.email}?subject=${encodeURIComponent("QualiFresh Website Enquiry")}&body=${encodeURIComponent(body)}`);
                    setCSent(true);
                  }}
                  style={{ width: "100%", marginTop: "14px", padding: "12px", fontSize: "14px", background: !canSend ? "#e5e7eb" : "#2d8a4e", color: !canSend ? "#9ca3af" : "#fff", border: "none", borderRadius: "9px", cursor: !canSend ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                  <MailSvg size={16} color={!canSend ? "#9ca3af" : "#fff"} /> Open Email to Send
                </button>
                <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", marginTop: "8px" }}>
                  Or reach us at <a href={`tel:${siteConfig.phone}`} style={{ color: "#2d8a4e" }}>{siteConfig.phoneDisplay}</a>
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
