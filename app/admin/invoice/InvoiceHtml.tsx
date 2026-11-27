"use client";
// On-screen copy of the invoice for phones/tablets (they can't show a PDF inside the page).
// Built from the SAME model and LAYOUT as the PDF (renderInvoice.tsx), sized in mm and scaled
// to the screen width, so it matches the printed pages.
import { useEffect, useRef, useState } from "react";
import { HANGUL, LAYOUT, QR_MM, QR_QUIET, type InvoiceModel, type QrMatrix } from "./model";

const GREEN = "#1f6b3a", LINE = "#6b7280", SOFT = "#e7f3ea";
const mm = (n: number) => `${n}mm`;
const kr = (t: string) => (HANGUL.test(t) ? { fontFamily: "QFKorean, QFSans, sans-serif" } : {});
const clamp = (n: number): React.CSSProperties => ({ display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical", overflow: "hidden" });

function QrSvg({ m }: { m: QrMatrix }) {
  const n = m.size + 2 * QR_QUIET, outer = (QR_MM * n) / m.size;
  let d = "";
  for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.dark[r * m.size + c]) d += `M${c + QR_QUIET} ${r + QR_QUIET}h1v1h-1z`;
  return (
    <svg viewBox={`0 0 ${n} ${n}`} style={{ width: mm(outer), height: mm(outer), display: "block" }} shapeRendering="crispEdges" aria-label="UPI QR code">
      <rect width={n} height={n} fill="#fff" /><path d={d} fill="#000" />
    </svg>
  );
}

export default function InvoiceHtml({ m, qr }: { m: InvoiceModel; qr: QrMatrix }) {
  const { cfg } = m, L = LAYOUT, cols = L.cols;
  const partW = L.pageW - 2 * L.margin - cols.sr - cols.qty - cols.rate - cols.amount;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const fit = () => { const w = wrapRef.current?.clientWidth || 0; const pagePx = (L.pageW / 25.4) * 96; if (w) setScale(Math.min(1, (w - 16) / pagePx)); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, [L.pageW]);
  const cell: React.CSSProperties = { padding: `${mm(0.4)} ${mm(1.3)} 0`, boxSizing: "border-box", lineHeight: 1.2 };
  const totalRow = (label: string, value: string, bold = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: `${mm(0.6)} 0`, fontWeight: bold ? 700 : 400, fontSize: bold ? "10.5pt" : "9pt", ...(bold ? { borderTop: `1px solid ${GREEN}`, marginTop: mm(0.6), paddingTop: mm(1.2) } : {}) }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
  const pagePx = (L.pageW / 25.4) * 96, pageHPx = (L.pageH / 25.4) * 96;
  return (
    <div ref={wrapRef} className="inv-html" style={{ width: "100%" }}>
      <style>{`
        @font-face{font-family:QFSans;src:url(/fonts/invoice/NotoSans-400-latin.ttf) format("truetype");font-weight:400}
        @font-face{font-family:QFSans;src:url(/fonts/invoice/NotoSans-700-latin.ttf) format("truetype");font-weight:700}
        @font-face{font-family:QFKorean;src:url(/fonts/invoice/NotoSansKR-400-hangul.ttf) format("truetype");unicode-range:U+1100-11FF,U+3130-318F,U+AC00-D7A3}
      `}</style>
      {m.pages.map((pg, i) => (
        <div key={i} style={{ width: pagePx * scale, height: pageHPx * scale, margin: "0 auto 12px", boxShadow: "0 2px 12px rgba(0,0,0,.15)", background: "#fff", overflow: "hidden" }} data-invoice-page={i + 1}>
          <div style={{ width: mm(L.pageW), height: mm(L.pageH), transform: `scale(${scale})`, transformOrigin: "top left", padding: mm(L.margin), boxSizing: "border-box", position: "relative", fontFamily: "QFSans, sans-serif", fontSize: "8.5pt", color: "#111827", lineHeight: 1.2 }}>
            {pg.first ? (
              <div style={{ height: mm(L.firstHeader) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: mm(21) }}>
                  <div style={{ display: "flex", width: mm(140) }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cfg.logo} alt="" style={{ width: mm(25), height: mm(19.7), marginRight: mm(3.5) }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14pt", fontWeight: 700, color: GREEN }}>{cfg.businessName}</div>
                      <div style={{ fontSize: "8pt", marginTop: mm(0.6) }}>{cfg.tagline}</div>
                      <div style={{ fontSize: "8pt", marginTop: mm(0.5), color: "#374151" }}>{cfg.address}</div>
                      <div style={{ fontSize: "8pt", marginTop: mm(0.5), color: "#374151", whiteSpace: "pre" }}>E-mail: {cfg.email}{"   "}Mob.: {cfg.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "14pt", fontWeight: 700, border: `1.5pt solid ${GREEN}`, color: GREEN, padding: `${mm(1.2)} ${mm(5)}`, letterSpacing: "1.4pt" }}>{cfg.title}</div>
                    <div style={{ fontSize: "8.5pt", marginTop: mm(1.5) }}>GST No.: {cfg.gstin}</div>
                  </div>
                </div>
                <div style={{ borderTop: `1.5pt solid ${GREEN}`, marginBottom: mm(2) }} />
                <div style={{ display: "flex", justifyContent: "space-between", height: mm(21.5) }}>
                  <div style={{ width: mm(120) }}>
                    <div style={{ fontSize: "7.5pt", color: LINE, fontWeight: 700 }}>To:</div>
                    <div style={{ fontSize: "10pt", fontWeight: 700, marginTop: mm(0.4), ...clamp(1), ...kr(m.customer.name) }}>{m.customer.name}</div>
                    {m.customer.phone && <div style={{ fontSize: "8.5pt", marginTop: mm(0.4) }}>Phone: {m.customer.phone}</div>}
                    {m.customer.address && <div style={{ fontSize: "8pt", marginTop: mm(0.4), ...clamp(3), ...kr(m.customer.address) }}>{m.customer.address}</div>}
                  </div>
                  <div style={{ width: mm(62) }}>
                    {[["Invoice No.:", m.orderNumber], ["Date:", m.dateText], ["Delivery:", m.delivery]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", marginBottom: mm(0.8) }}>
                        <span style={{ width: mm(22), color: LINE, fontWeight: 700, fontSize: "8.5pt" }}>{k}</span>
                        <span style={{ flex: 1, fontWeight: k === "Invoice No.:" ? 700 : 400 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: mm(L.contHeader), display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: GREEN }}>{cfg.title} {m.orderNumber} (continued)</span>
                <span style={{ color: LINE }}>{m.dateText}</span>
              </div>
            )}

            {pg.rows.length > 0 && (
              <div style={{ display: "flex", background: SOFT, border: `1px solid ${GREEN}`, height: mm(L.tableHead), boxSizing: "border-box", alignItems: "center", fontWeight: 700, color: GREEN }}>
                <span style={{ width: mm(cols.sr), ...cell }}>Sr.</span>
                <span style={{ width: mm(partW), ...cell }}>Particulars</span>
                <span style={{ width: mm(cols.qty), ...cell, textAlign: "right" }}>Qty</span>
                <span style={{ width: mm(cols.rate), ...cell, textAlign: "right" }}>Rate</span>
                <span style={{ width: mm(cols.amount), ...cell, textAlign: "right" }}>Amount</span>
              </div>
            )}
            {pg.rows.map(r => (
              <div key={r.sr} style={{ display: "flex", height: mm(L.rowBase + (r.lines - 1) * L.rowLine), boxSizing: "border-box", borderLeft: "1px solid #9ca3af", borderRight: "1px solid #9ca3af", borderBottom: "0.5px solid #9ca3af" }}>
                <span style={{ width: mm(cols.sr), ...cell }}>{r.sr}</span>
                <span style={{ width: mm(partW), ...cell, ...clamp(r.lines), ...kr(r.name + r.sub) }}>{r.name}{r.sub && <span style={{ fontSize: "7pt", color: LINE }}>{"  "}{r.sub}</span>}</span>
                <span style={{ width: mm(cols.qty), ...cell, textAlign: "right" }}>{r.qty}</span>
                <span style={{ width: mm(cols.rate), ...cell, textAlign: "right" }}>{r.rate}</span>
                <span style={{ width: mm(cols.amount), ...cell, textAlign: "right" }}>{r.amount}</span>
              </div>
            ))}

            {pg.last && (
              <div style={{ marginTop: mm(1.5) }}>
                <div style={{ fontWeight: 700 }}>Items: {m.itemCount}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: mm(0.5) }}>
                  <div style={{ width: mm(98), paddingTop: mm(0.6) }}>
                    <div><b>Amount in words: </b>{m.amountInWords}</div>
                    <div style={{ marginTop: mm(1.2), fontSize: "8pt", color: "#374151" }}>Terms: {cfg.terms}</div>
                    {m.hasPerKg && <div style={{ marginTop: mm(1.2), fontSize: "7.5pt", color: LINE }}>* Weight-based items are billed by the actual weight at packing.</div>}
                  </div>
                  <div style={{ width: mm(82) }}>
                    {totalRow("Sub Total", m.subTotal)}
                    {totalRow("Delivery Charges", m.delivery_)}
                    {totalRow("Round off", m.roundOff)}
                    {totalRow("Total Amount", m.totalText, true)}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: mm(3) }}>
                  <div style={{ width: mm(68), border: "1px solid #9ca3af", padding: mm(2), boxSizing: "border-box" }}>
                    <div style={{ fontWeight: 700, color: GREEN, marginBottom: mm(1) }}>Bank Details</div>
                    {[["Account Name", cfg.bank.accountName], ["Bank Name", `${cfg.bank.bankName}, Branch: ${cfg.bank.branch}`], ["Account No.", cfg.bank.accountNo], ["IFSC Code", cfg.bank.ifsc], ["GooglePay / PhonePe", cfg.bank.paymentPhone]].map(([k, v]) => (
                      <div key={k} style={{ fontSize: "8pt", marginTop: mm(0.5) }}>{k}: {v}</div>
                    ))}
                  </div>
                  <div style={{ width: mm(58), display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <QrSvg m={qr} />
                    <div style={{ fontSize: "7.5pt", textAlign: "center", marginTop: mm(0.5) }}>{m.qrCaption}</div>
                  </div>
                  <div style={{ width: mm(52), display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: "8.5pt" }}>{cfg.signatureFor}</div>
                    <div style={{ height: mm(20) }} />
                    <div style={{ borderTop: "0.8pt solid #111827", width: mm(44) }} />
                    <div style={{ fontSize: "8pt", marginTop: mm(1) }}>{cfg.signatureLabel}</div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ position: "absolute", bottom: mm(6), left: 0, right: 0, textAlign: "center", fontSize: "8pt", color: LINE }}>Page {i + 1} of {m.pages.length}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
