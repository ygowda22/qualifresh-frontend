"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "../../src/config/site";

const { delivery: DEL } = siteConfig;

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
function InstagramIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
}
function FacebookIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}

export default function ContactPage() {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [msg, setMsg]       = useState("");
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => { document.title = siteConfig.pageTitles.contact; }, []);

  const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk  = !phone || /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, "").replace(/^(\+91|91)/, ""));
  const canSend  = name.trim() && email.trim() && emailOk && msg.trim() && phoneOk;

  async function handleSubmit() {
    if (!canSend || sending) return;
    setSending(true); setSendError("");
    try {
      const r = await fetch("/backend/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), message: msg.trim() }),
      });
      if (!r.ok) { const d = await r.json(); setSendError(d.message || "Failed to send. Please try again."); return; }
      setSent(true);
    } catch { setSendError("Network error. Please try again."); }
    finally { setSending(false); }
  }

  return (
    <div style={{ background: "#f4f6f0", minHeight: "100vh" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden;-webkit-text-size-adjust:100%}

        .c-wrap{max-width:1100px;margin:0 auto;padding:3rem 1.5rem;}
        .c-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:2.5rem;align-items:start;}
        .c-card{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 16px rgba(0,0,0,.06);border:1px solid #f1f5f9;}
        .c-contact-item{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f1f5f9;}
        .c-contact-item:last-child{border-bottom:none;}
        .c-icon-wrap{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .c-label{font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;}
        .c-value{font-size:14px;color:#111827;font-weight:600;}
        input:focus,textarea:focus{outline:none;border-color:#2d8a4e!important;}
        .btn-g{background:#2d8a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;transition:all .2s;}
        .btn-g:hover{background:#1f6b3a;}
        .btn-g:disabled{background:#e5e7eb;color:#9ca3af;cursor:not-allowed;}
        @media(max-width:900px){.c-grid{grid-template-columns:1fr!important;}}
        .cf-footer-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:2rem;}
        @media(max-width:1024px){.cf-footer-grid{grid-template-columns:1fr 1fr!important;gap:1.5rem!important;}}
        @media(max-width:480px){.cf-footer-grid{grid-template-columns:1fr 1fr!important;gap:1rem!important;}}
        .cf-footer-link{display:block;color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:9px;text-decoration:none;transition:color .2s;}
        .cf-footer-link:hover{color:#f0c040!important;}
        nextjs-portal{display:none!important}
      `}</style>


      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0a1f12,#0f3020)", padding: "2.5rem 1.5rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", borderRadius: "20px", padding: "4px 16px", fontSize: "11px", fontWeight: 700, color: "#d9f99d", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>Get in Touch</span>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
            Contact <span style={{ color: "#a3e635" }}>QualiFresh</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", maxWidth: "500px" }}>
            Questions about your order, availability, or partnership? We typically respond within a few hours.
          </p>
        </div>
      </div>

      {/* Wave: hero → content */}
      <div style={{ lineHeight: 0, background: "#f4f6f0" }}>
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "44px" }}>
          <path d="M0,24 C360,48 720,0 1080,24 C1260,36 1360,12 1440,24 L1440,0 L0,0 Z" fill="#0f3020" />
        </svg>
      </div>

      {/* Content */}
      <div className="c-wrap">
        <div className="c-grid">

          {/* Left: contact info */}
          <div>
            <div className="c-card" style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f1a0f", marginBottom: "4px" }}>Reach Us Directly</h2>
              <p style={{ fontSize: "12.5px", color: "#9ca3af", marginBottom: "1rem" }}>We're available Mon–Sat, 9am–7pm IST.</p>

              <div className="c-contact-item">
                <div className="c-icon-wrap" style={{ background: "#dcfce7" }}>
                  <WhatsAppIcon size={20} />
                </div>
                <div>
                  <div className="c-label">WhatsApp (fastest)</div>
                  <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi QualiFresh! I have a question.")}`}
                    target="_blank" rel="noreferrer"
                    className="c-value" style={{ color: "#16a34a", textDecoration: "none" }}>
                    +{siteConfig.whatsapp}
                  </a>
                </div>
              </div>

              <div className="c-contact-item">
                <div className="c-icon-wrap" style={{ background: "#eff6ff", fontSize: "22px" }}>📞</div>
                <div>
                  <div className="c-label">Phone</div>
                  <a href={`tel:${siteConfig.phone}`} className="c-value" style={{ color: "#1d4ed8", textDecoration: "none" }}>
                    {siteConfig.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="c-contact-item">
                <div className="c-icon-wrap" style={{ background: "#fef3c7", fontSize: "20px" }}>✉️</div>
                <div>
                  <div className="c-label">Email</div>
                  <a href={`mailto:${siteConfig.email}`} className="c-value" style={{ color: "#b45309", textDecoration: "none" }}>
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="c-contact-item">
                <div className="c-icon-wrap" style={{ background: "#f5f3ff", fontSize: "20px" }}>📍</div>
                <div>
                  <div className="c-label">Based in</div>
                  <div className="c-value">{siteConfig.address}</div>
                </div>
              </div>
            </div>

            {/* Delivery quick info */}
            <div className="c-card" style={{ background: "linear-gradient(135deg,#f0fdf4,#fff)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#166534", marginBottom: "12px" }}>📅 Delivery Schedule</h3>
              {[
                { label: "Delivery Days", value: DEL.days.join(" & ") },
                { label: "Wednesday orders by", value: DEL.orderCutoff.wednesday },
                { label: "Saturday orders by", value: DEL.orderCutoff.saturday },
                { label: "Min Order", value: `₹${DEL.minOrder}` },
                { label: "Free Delivery Above", value: `₹${DEL.freeDeliveryAbove}` },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "5px 0", borderBottom: "1px solid #f0fdf4" }}>
                  <span style={{ color: "#6b7280" }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: "#166534" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div className="c-card">
            {sent ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "52px", marginBottom: "14px" }}>✅</div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#166534", margin: "0 0 8px" }}>Message Sent!</h2>
                <p style={{ fontSize: "13.5px", color: "#6b7280", marginBottom: "20px" }}>We received your message and will reply to your email within a few hours.</p>
                <button onClick={() => { setSent(false); setName(""); setEmail(""); setPhone(""); setMsg(""); }} className="btn-g" style={{ padding: "11px 28px", fontSize: "14px" }}>Send Another</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f1a0f", marginBottom: "4px" }}>Send a Message</h2>
                <p style={{ fontSize: "12.5px", color: "#9ca3af", marginBottom: "1.3rem" }}>We'll reply to your email within a few hours.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "Your Name", ph: "e.g. Priya Sharma", val: name, set: setName, type: "text", req: true },
                    { label: "Email Address", ph: "your@email.com", val: email, set: setEmail, type: "email", req: true },
                    { label: "Phone (optional)", ph: "e.g. 9876543210", val: phone, set: setPhone, type: "tel" },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                        {f.label}{f.req && <span style={{ color: "#ef4444" }}> *</span>}
                      </label>
                      <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", fontFamily: "inherit" }}
                      />
                      {f.type === "email" && email && !emailOk && (
                        <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>Enter a valid email address</p>
                      )}
                      {f.type === "tel" && phone && !phoneOk && (
                        <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>Enter a valid 10-digit Indian mobile number</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                      Message <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea placeholder="How can we help you?" value={msg} onChange={e => setMsg(e.target.value)} rows={4}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", fontFamily: "inherit", resize: "vertical" }}
                    />
                  </div>
                  {sendError && <p style={{ fontSize: "12px", color: "#ef4444", margin: "0" }}>{sendError}</p>}
                  <button onClick={handleSubmit} disabled={!canSend || sending} className="btn-g" style={{ padding: "13px", fontSize: "14.5px" }}>
                    {sending ? "Sending…" : "Send Message →"}
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi QualiFresh! I have a question.")}`}
                      target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#25d366", color: "#fff", padding: "10px 22px", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}>
                      <WhatsAppIcon size={16} /> Or chat on WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(180deg,#081812 0%,#060f0c 100%)", color: "#fff" }}>
        <div style={{ lineHeight: 0, marginTop: "-1px" }}>
          <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "40px" }}>
            <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1360,14 1440,20 L1440,0 L0,0 Z" fill="#f4f6f0" />
          </svg>
        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1.5rem" }}>
          <div className="cf-footer-grid" style={{ marginBottom: "2.5rem" }}>
            <div>
              <div style={{ marginBottom: "14px" }}>
                <img src="/logo.png" alt="QualiFresh" style={{ height: "38px", width: "auto", objectFit: "contain" }} />
              </div>
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
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Quick Links</h4>
              {[
                { label: "Home",       href: "/" },
                { label: "Products",   href: "/products" },
                { label: "About Us",   href: "/about-us" },
                { label: "Our Farms",  href: "/our-farms" },
                { label: "Contact Us", href: "/contact" },
              ].map(link => (
                <a key={link.label} href={link.href} className="cf-footer-link">{link.label}</a>
              ))}
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Contact</h4>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
                <div>📞 <a href={`tel:${siteConfig.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.phoneDisplay}</a></div>
                <div>✉️ <a href={`mailto:${siteConfig.email}`} style={{ color: "inherit", textDecoration: "none" }}>{siteConfig.email}</a></div>
                <div>📍 {siteConfig.address}</div>
                <div>📅 {DEL.days.join(" & ")}</div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "#f0c040", fontWeight: 700, marginBottom: "14px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Delivery Info</h4>
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
    </div>
  );
}
