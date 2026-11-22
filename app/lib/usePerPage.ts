"use client";
import { useEffect, useState, type RefObject } from "react";

// Shared product-grid pagination helpers for the home page and /products.

// Products per page, matching the grid's column breakpoints:
// ≤480px (2 cols × 20 rows) → 40, ≤1023px (3 cols × 10 rows) → 30, wider (4 cols × 10 rows) → 40.
const MOBILE = "(max-width: 480px)";
const TABLET = "(max-width: 1023px)";
const perPageNow = () => (window.matchMedia(MOBILE).matches ? 40 : window.matchMedia(TABLET).matches ? 30 : 40);

// Media-query listeners fire only when the WIDTH crosses a breakpoint, never for the
// height-only "resize" events mobile browsers send when the address bar shows/hides
// while scrolling (that used to flip perPage, reset to page 1 and make the grid flicker).
// Setting the same value again is a no-op in React, so state changes only when it differs.
export function usePerPage(initial = 40): number {
  const [perPage, setPerPage] = useState(initial);
  useEffect(() => {
    const update = () => setPerPage(perPageNow());
    update();
    const queries = [window.matchMedia(MOBILE), window.matchMedia(TABLET)];
    queries.forEach(q => q.addEventListener("change", update));
    return () => queries.forEach(q => q.removeEventListener("change", update));
  }, []);
  return perPage;
}

// Height of the sticky site header (measured, so it is right on every screen size).
function stickyHeaderHeight(): number {
  let h = 0;
  document.querySelectorAll<HTMLElement>("nav, header").forEach(el => {
    const pos = getComputedStyle(el).position;
    const r = el.getBoundingClientRect();
    if ((pos === "sticky" || pos === "fixed") && r.height > 0 && r.height < window.innerHeight / 2) h = Math.max(h, r.height);
  });
  return h;
}

// Scroll so the top of the product grid sits just below the sticky header.
// Smooth normally, instant when the visitor prefers reduced motion.
function scrollToGrid(el: HTMLElement | null) {
  if (!el) return;
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight() - 16);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto"; // globals.css sets html { scroll-behavior: smooth }
    window.scrollTo(0, top);
    root.style.scrollBehavior = prev;
  } else {
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// Pagination clicks call the returned function together with setPage(...). The scroll runs
// AFTER the new page has rendered (effect + next animation frame), so a shorter last page can
// no longer clamp the scroll position to the footer. Nothing happens on the first render.
export function useScrollToGridAfterPageChange(gridRef: RefObject<HTMLElement | null>): () => void {
  const [request, setRequest] = useState(0);
  useEffect(() => {
    if (request === 0) return;
    const id = requestAnimationFrame(() => scrollToGrid(gridRef.current));
    return () => cancelAnimationFrame(id);
  }, [request, gridRef]);
  return () => setRequest(n => n + 1);
}
