"use client";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../src/config/site";

const { delivery: DEL } = siteConfig;

const ITEMS = [
  `📅 Delivery: ${DEL.days.join(" & ")}`,
  `📦 Min order ₹${DEL.minOrder}`,
  `🚚 Free delivery above ₹${DEL.freeDeliveryAbove}`,
  `🎁 Free microgreens above ₹${DEL.freeMicrogreensAbove}`,
  `📞 ${siteConfig.phoneDisplay}`,
];

export default function GlobalTicker() {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith("/admin")) return null;
  return (
    <>
      <style>{`
        .gt-desktop{display:flex;justify-content:center;align-items:center;flex-wrap:nowrap;gap:0;padding:7px 1rem;overflow:hidden;width:100%;background:#0f8a65;}
        .gt-mobile{display:none;width:100%;background:#0f8a65;border-bottom:1px solid #0a6e50;}
        @media(max-width:768px){
          .gt-desktop{display:none!important;}
          .gt-mobile{display:block!important;overflow:hidden;padding:5px 0;height:34px;}
          .gt-scroll{display:inline-flex;animation:gtticker 30s linear infinite;white-space:nowrap;}
          .gt-scroll:hover{animation-play-state:paused;}
        }
        @keyframes gtticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
      `}</style>
      <div className="gt-desktop">
        {ITEMS.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 16px", fontSize: "12px", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
            {i > 0 && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ee7b7", marginRight: "16px", flexShrink: 0 }} />}
            {item}
          </span>
        ))}
      </div>
      <div className="gt-mobile">
        <div className="gt-scroll">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", padding: "0 22px", fontSize: "12px", fontWeight: 500, color: "#d1fae5", whiteSpace: "nowrap" }}>
              {item}<span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6ee7b7", marginLeft: "22px", flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
