"use client";
// "Invoice preview" panel: large modal on desktop (the real PDF in the browser's viewer),
// full-screen sheet on phones/tablets (on-screen copy built from the same data/layout).
// The PDF/QR libraries are imported only here, when the panel opens.
import { useEffect, useRef, useState } from "react";
import { buildInvoice, type InvoiceModel, type InvoiceOrder, type InvoiceProduct, type QrMatrix } from "./model";
import InvoiceHtml from "./InvoiceHtml";

type SaveFilePicker = (o: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) =>
  Promise<{ createWritable: () => Promise<{ write: (b: Blob) => Promise<void>; close: () => Promise<void> }> }>;

interface Ready { blob: Blob; url: string; model: InvoiceModel; qr: QrMatrix }

export default function InvoicePreview({ order, products, onClose }: { order: InvoiceOrder; products?: InvoiceProduct[]; onClose: () => void }) {
  const [state, setState] = useState<"preparing" | "ready" | "error">("preparing");
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState<Ready | null>(null);
  const [notice, setNotice] = useState("");
  const busy = useRef<Record<string, boolean>>({});
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [env] = useState(() => {
    const ua = navigator.userAgent;
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    let canShareFiles = false;
    try { canShareFiles = !!navigator.canShare?.({ files: [new File([""], "x.pdf", { type: "application/pdf" })] }); } catch {}
    return {
      desktop,
      canSaveAs: typeof (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker === "function",
      canShareFiles,
      safari: /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|FxiOS|Android/.test(ua),
    };
  });

  // ── generate (again on Retry) ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false, url = "";
    setState("preparing"); setNotice("");
    (async () => {
      try {
        const model = buildInvoice(order, undefined, products); // products: units for the items table
        const { renderInvoicePdf } = await import("./renderInvoice");
        const { blob, qr } = await renderInvoicePdf(model);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setReady({ blob, url, model, qr }); setState("ready");
      } catch (e) {
        console.error("Invoice generation failed", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── open/close: Escape, ✕, Back; focus; background doesn't scroll ───────
  const closedRef = useRef(false);
  function close() {
    if (closedRef.current) return;
    closedRef.current = true;
    if (window.history.state?.qfInvoice) window.history.back();
    onClose();
  }
  const closeRef = useRef(close); closeRef.current = close;
  useEffect(() => {
    window.history.pushState({ ...(window.history.state || {}), qfInvoice: true }, "", window.location.href);
    const onPop = () => { if (!closedRef.current) { closedRef.current = true; onClose(); } };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); closeRef.current(); } };
    window.addEventListener("popstate", onPop);
    document.addEventListener("keydown", onKey);
    const html = document.documentElement, body = document.body, prev = [html.style.overflow, body.style.overflow];
    html.style.overflow = "hidden"; body.style.overflow = "hidden";
    titleRef.current?.focus();
    return () => {
      window.removeEventListener("popstate", onPop); document.removeEventListener("keydown", onKey);
      html.style.overflow = prev[0]; body.style.overflow = prev[1];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function onTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const f = [...panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), iframe, [tabindex='0']")].filter(el => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }

  // ── actions (each guarded against double clicks) ─────────────────────────
  async function once(key: string, fn: () => Promise<void> | void, holdMs = 1000) {
    if (busy.current[key]) return;
    busy.current[key] = true;
    try { await fn(); } finally { setTimeout(() => { busy.current[key] = false; }, holdMs); }
  }
  const file = () => new File([ready!.blob], ready!.model.fileName, { type: "application/pdf" });
  const download = () => once("download", () => {
    // A fresh URL of a named File (not the one shown in the preview frame): Safari otherwise
    // treats it as the already-open document and loses the file name.
    const url = URL.createObjectURL(file());
    const a = document.createElement("a");
    a.href = url; a.download = ready!.model.fileName; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  });
  const saveAs = () => once("saveas", async () => {
    try {
      const picker = (window as unknown as { showSaveFilePicker: SaveFilePicker }).showSaveFilePicker;
      const handle = await picker({ suggestedName: ready!.model.fileName, types: [{ description: "PDF document", accept: { "application/pdf": [".pdf"] } }] });
      const w = await handle.createWritable(); await w.write(ready!.blob); await w.close();
      setNotice("Saved.");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setNotice("Couldn't save the file. Try Download instead.");
    }
  }, 300);
  const share = () => once("share", async () => {
    try { await navigator.share({ files: [file()], title: ready!.model.fileName }); }
    catch (e) { if ((e as Error)?.name !== "AbortError") setNotice("Couldn't share the file."); }
  }, 300);
  const print = () => once("print", async () => {
    if (!env.desktop) {                       // phones/tablets: the OS share sheet (has Print on iPhone)
      if (env.canShareFiles) await share(); else window.open(ready!.url, "_blank");
      return;
    }
    if (env.safari) { window.open(ready!.url, "_blank"); setNotice("Opened in a new tab — press ⌘P to print."); return; }
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
    frame.onload = () => { try { frame.contentWindow?.focus(); frame.contentWindow?.print(); } catch { window.open(ready!.url, "_blank"); } };
    frame.src = ready!.url;
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 60_000);
  }, 2000);

  const btn = (label: string, onClick: () => void, aria: string, primary = false) => (
    <button type="button" className={`ip-btn${primary ? " primary" : ""}`} onClick={onClick} aria-label={aria} disabled={state !== "ready"}>{label}</button>
  );

  return (
    <div className="ip-root" role="presentation">
      <style>{`
        .ip-root{position:fixed;inset:0;z-index:600}
        .ip-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.5)}
        .ip-panel{position:absolute;top:4vh;bottom:4vh;left:50%;transform:translateX(-50%);width:min(980px,94vw);background:#fff;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25)}
        .ip-head{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #f1f5f9}
        .ip-bar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 18px;border-bottom:1px solid #f1f5f9}
        .ip-body{flex:1;min-height:0;background:#f1f5f9;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
        .ip-btn{padding:8px 14px;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#111827;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap}
        .ip-btn.primary{background:#2d8a4e;border-color:#2d8a4e;color:#fff}
        .ip-btn:disabled{opacity:.5;cursor:not-allowed}
        .ip-btn:focus-visible,.ip-x:focus-visible{outline:2px solid #2d8a4e;outline-offset:2px}
        .ip-x{margin-left:auto;background:none;border:none;font-size:20px;color:#6b7280;cursor:pointer;width:36px;height:36px;border-radius:8px}
        @media(max-width:1023px),(pointer:coarse){
          .ip-panel{top:0;bottom:0;left:0;right:0;transform:none;width:100vw;border-radius:0}
          .ip-btn{min-height:44px;font-size:15px;flex:1 1 auto}
          .ip-x{width:44px;height:44px}
        }
      `}</style>
      <div className="ip-backdrop" onClick={close} />
      <div ref={panelRef} className="ip-panel" role="dialog" aria-modal="true" aria-labelledby="ip-title" onKeyDown={onTab}>
        <div className="ip-head">
          <h2 id="ip-title" ref={titleRef} tabIndex={-1} style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827", outline: "none" }}>
            Invoice preview <span style={{ color: "#2d8a4e" }}>{order.orderNumber}</span>
          </h2>
          <button type="button" className="ip-x" onClick={close} aria-label="Close invoice preview">✕</button>
        </div>
        <div className="ip-bar">
          {env.canSaveAs && btn("💾 Save as…", saveAs, "Save invoice as…", true)}
          {btn("⬇ Download", download, "Download invoice PDF", !env.canSaveAs)}
          {btn("🖨 Print", print, "Print invoice")}
          {env.canShareFiles && btn("📤 Share", share, "Share invoice PDF")}
          <button type="button" className="ip-btn" onClick={close}>Close</button>
        </div>
        {notice && <div role="status" style={{ padding: "8px 18px", fontSize: "13px", color: "#374151", background: "#f0fdf4" }}>{notice}</div>}
        <div className="ip-body">
          {state === "preparing" && <p role="status" style={{ textAlign: "center", color: "#6b7280", padding: "3rem 1rem", margin: 0 }}>Preparing invoice…</p>}
          {state === "error" && (
            <div role="alert" style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p style={{ color: "#dc2626", margin: "0 0 12px" }}>Couldn&apos;t create the invoice. Try again.</p>
              <button type="button" className="ip-btn primary" onClick={() => setAttempt(a => a + 1)}>Retry</button>
            </div>
          )}
          {state === "ready" && ready && (env.desktop
            ? <iframe title={`Invoice ${order.orderNumber} (PDF)`} src={ready.url} style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
            : <div style={{ padding: "12px 0" }}><InvoiceHtml m={ready.model} qr={ready.qr} /></div>)}
        </div>
      </div>
    </div>
  );
}
