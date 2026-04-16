import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:  "QualiFresh — Fresh Exotic Vegetables, Pune",
    template: "%s | QualiFresh",
  },
  description: "Premium Korean, Exotic & Thai vegetables delivered twice a week in Pune & Mumbai. Farm to doorstep freshness guaranteed.",
  keywords: ["exotic vegetables", "Korean vegetables", "Thai vegetables", "Pune delivery", "farm fresh", "QualiFresh"],
  authors: [{ name: "QualiFresh" }],
  icons: {
    icon:     [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    shortcut: "/logo.png",
    apple:    "/logo.png",
  },
  openGraph: {
    title:       "QualiFresh — Fresh Exotic Vegetables, Pune",
    description: "Premium Korean, Exotic & Thai vegetables delivered twice a week in Pune & Mumbai.",
    type:        "website",
    locale:      "en_IN",
    images:      [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{ background: "#f4f6f0" }}>
      <head>
        {/* Viewport — MUST be first so mobile browsers render at correct scale */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts — Inter + Poppins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600;1,700&display=swap" rel="stylesheet" />
        {/* Favicon without preload hint — avoids "preloaded but not used" browser warning */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Inline critical background — prevents white flash before CSS loads on all devices */}
        <style dangerouslySetInnerHTML={{ __html: `html,body{background-color:#f4f6f0!important;margin:0;padding:0}` }} />
        <meta name="theme-color" content="#f4f6f0" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#f4f6f0" }}>{children}</body>
    </html>
  );
}
