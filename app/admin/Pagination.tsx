"use client";
import { useEffect, useState, type RefObject } from "react";

export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * 1-based page numbers to render for 0-based `page` of `totalPages`:
 * always first and last, current ±1, "…" for gaps (a gap of exactly one page
 * shows that page instead). Near the edges three numbers stay visible.
 *   page 1 of 52 → 1 2 3 … 52      page 7 of 52 → 1 … 6 7 8 … 52
 *   page 52 of 52 → 1 … 50 51 52   totalPages ≤ 7 → every page
 */
export function pageWindow(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const cur = Math.min(Math.max(page, 0), totalPages - 1) + 1;
  let start = Math.max(2, cur - 1);
  let end   = Math.min(totalPages - 1, cur + 1);
  if (cur <= 2)              end   = 3;
  if (cur >= totalPages - 1) start = totalPages - 2;
  if (start === 3)              start = 2;              // "1 … 3" → "1 2 3"
  if (end === totalPages - 2)   end   = totalPages - 1; // "50 … 52" → "50 51 52"
  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis-start");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
}

const PAGE_SIZES = [10, 25, 50];

type Props = {
  /** 0-based */
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  /** e.g. "orders", "products" */
  itemLabel: string;
  /** Scrolled into view (smoothly) when the user changes page. */
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** Show the "Go to page" box (desktop only). Default true. */
  showGoTo?: boolean;
};

export default function Pagination({
  page, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange, itemLabel, scrollTargetRef, showGoTo = true,
}: Props) {
  const [goTo, setGoTo] = useState("");

  // Filters/search can shrink the list under the current page — clamp back into range.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) onPageChange(Math.max(0, totalPages - 1));
  }, [page, totalPages, onPageChange]);

  if (totalItems <= 0) return null;

  const last  = Math.max(0, totalPages - 1);
  const cur   = Math.min(page, last);
  const from  = cur * pageSize + 1;
  const to    = Math.min((cur + 1) * pageSize, totalItems);
  const multi = totalPages > 1;

  function go(p: number) {
    const next = Math.min(Math.max(0, p), last);
    if (next === cur) return;
    onPageChange(next);
    scrollTargetRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitGoTo() {
    const n = parseInt(goTo, 10);
    if (!Number.isFinite(n)) return;
    go(n - 1);
    setGoTo("");
  }

  return (
    <nav className="qf-pg" aria-label="Pagination">
      <style>{PAGINATION_CSS}</style>

      <p className="qf-pg-summary" aria-live="polite">
        Showing {from}–{to} of {totalItems} {itemLabel}
      </p>

      <div className="qf-pg-controls">
        {onPageSizeChange && (
          <label className="qf-pg-size">
            <span>Per page</span>
            <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
              {(PAGE_SIZES.includes(pageSize) ? PAGE_SIZES : [...PAGE_SIZES, pageSize].sort((a, b) => a - b)).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}

        {multi && (
          <div className="qf-pg-nav">
            <button type="button" className="qf-pg-btn qf-pg-step" onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous page">
              <span aria-hidden="true">‹</span><span className="qf-pg-txt">Prev</span>
            </button>

            <ul className="qf-pg-list">
              {pageWindow(cur, totalPages).map(item =>
                typeof item === "number" ? (
                  <li key={item}>
                    <button type="button" className="qf-pg-btn" onClick={() => go(item - 1)}
                      aria-current={item - 1 === cur ? "page" : undefined}
                      aria-label={`Page ${item}`}>
                      {item}
                    </button>
                  </li>
                ) : (
                  <li key={item} className="qf-pg-gap" aria-hidden="true">…</li>
                )
              )}
            </ul>

            <span className="qf-pg-compact">Page {cur + 1} of {totalPages}</span>

            <button type="button" className="qf-pg-btn qf-pg-step" onClick={() => go(cur + 1)} disabled={cur >= last} aria-label="Next page">
              <span className="qf-pg-txt">Next</span><span aria-hidden="true">›</span>
            </button>
          </div>
        )}

        {multi && showGoTo && totalPages > 7 && (
          <form className="qf-pg-goto" noValidate onSubmit={e => { e.preventDefault(); submitGoTo(); }}>
            <label>
              <span>Go to</span>
              <input type="number" inputMode="numeric" min={1} max={totalPages} value={goTo}
                onChange={e => setGoTo(e.target.value)} placeholder={String(cur + 1)} aria-label={`Go to page (1–${totalPages})`} />
            </label>
            <button type="submit" className="qf-pg-btn qf-pg-go" disabled={!goTo}>Go</button>
          </form>
        )}
      </div>
    </nav>
  );
}

const PAGINATION_CSS = `
.qf-pg{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:1rem;min-width:0}
.qf-pg-summary{margin:0;font-size:12.5px;color:#6b7280}
.qf-pg-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}
.qf-pg-nav{display:flex;align-items:center;gap:6px;min-width:0}
.qf-pg-list{display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0}
.qf-pg-btn{min-width:36px;height:36px;padding:0 10px;display:inline-flex;align-items:center;justify-content:center;gap:4px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .12s,border-color .12s}
.qf-pg-btn:hover:not(:disabled):not([aria-current]){background:#f0fdf4;border-color:#bbf7d0}
.qf-pg-btn[aria-current="page"]{background:#2d8a4e;border-color:#2d8a4e;color:#fff;font-weight:700;cursor:default}
.qf-pg-btn:disabled{background:#f9fafb;color:#9ca3af;cursor:not-allowed}
.qf-pg-btn:focus-visible,.qf-pg select:focus-visible,.qf-pg input:focus-visible{outline:2px solid #2d8a4e;outline-offset:2px}
.qf-pg-step{font-weight:600}
.qf-pg-step span[aria-hidden]{font-size:17px;line-height:1}
.qf-pg-gap{width:20px;text-align:center;color:#9ca3af;font-size:13px;user-select:none}
.qf-pg-compact{display:none;font-size:13px;font-weight:600;color:#374151;white-space:nowrap;padding:0 6px}
.qf-pg-size,.qf-pg-goto label{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#6b7280;white-space:nowrap}
.qf-pg-size select,.qf-pg-goto input{height:36px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;color:#111827;font-size:13px;font-family:inherit;padding:0 8px}
.qf-pg-goto{display:inline-flex;align-items:center;gap:6px;margin:0}
.qf-pg-goto input{width:64px}
.qf-pg-go{font-weight:600}
@media(max-width:639px){
  .qf-pg{flex-direction:column;justify-content:center}
  .qf-pg-summary{text-align:center}
  .qf-pg-controls{flex-direction:column;justify-content:center}
  .qf-pg-list,.qf-pg-txt,.qf-pg-goto{display:none}
  .qf-pg-compact{display:inline}
  .qf-pg-step{width:40px;height:40px;padding:0}
}
`;
