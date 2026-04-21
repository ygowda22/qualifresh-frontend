"use client";
import { usePathname } from "next/navigation";
import SiteNav from "./SiteNav";

type ActivePage = "about-us" | "our-farms" | "products" | "contact";

const PAGE_MAP: Record<string, ActivePage> = {
  "/about-us":  "about-us",
  "/our-farms": "our-farms",
  "/products":  "products",
  "/contact":   "contact",
  "/checkout":  "products",
};

export default function GlobalNav() {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith("/admin")) return null;
  return <SiteNav activePage={PAGE_MAP[pathname]} />;
}
