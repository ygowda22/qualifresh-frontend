"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface LightboxImage { url: string; alt: string; }

interface TestimonialLightboxProps {
  images: LightboxImage[];
  startIndex: number;
  name: string;
  onClose: () => void;
}

function lightboxUrl(url: string): string {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto,w_1200/");
}

export default function TestimonialLightbox({ images, startIndex, name, onClose }: TestimonialLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  function goTo(next: number) {
    if (next < 0 || next >= images.length) return;
    setLoaded(false);
    setIndex(next);
  }

  // Focus trap + restore, body scroll lock, Escape/arrow keys
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") { goTo(index - 1); return; }
      if (e.key === "ArrowRight") { goTo(index + 1); return; }
      if (e.key === "Tab") {
        const container = dialogRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Prefetch adjacent images only
  useEffect(() => {
    [index - 1, index + 1].forEach(i => {
      if (i < 0 || i >= images.length) return;
      const img = new window.Image();
      img.src = lightboxUrl(images[i].url);
    });
  }, [index, images]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? index - 1 : index + 1);
    touchStartX.current = null;
  }

  const current = images[index];
  if (!current) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos from ${name}`}
      tabIndex={-1}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

      <button onClick={onClose} aria-label="Close"
        style={{ position: "fixed", top: "18px", right: "22px", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ✕
      </button>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); goTo(index - 1); }} aria-label="Previous photo"
          style={{ position: "fixed", left: "18px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ‹
        </button>
      )}
      {index < images.length - 1 && (
        <button onClick={e => { e.stopPropagation(); goTo(index + 1); }} aria-label="Next photo"
          style={{ position: "fixed", right: "18px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50%", width: "44px", height: "44px", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ›
        </button>
      )}

      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "90vw", maxHeight: "88vh" }}>
        <div style={{ position: "relative", width: "min(90vw,900px)", height: "min(70vh,650px)" }}>
          {!loaded && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Loading…</div>
          )}
          <Image
            key={current.url}
            src={lightboxUrl(current.url)}
            alt={current.alt || `Photo from ${name}`}
            fill
            sizes="90vw"
            style={{ objectFit: "contain" }}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <div style={{ marginTop: "14px", color: "rgba(255,255,255,0.8)", fontSize: "13px", textAlign: "center" }}>
          {current.alt && <div style={{ marginBottom: "4px" }}>{current.alt}</div>}
          <div>{index + 1} / {images.length}</div>
        </div>
      </div>
    </div>
  );
}
