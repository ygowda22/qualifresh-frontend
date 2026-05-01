import type { Metadata } from "next";
import "./globals.css";
import GlobalNav from "./components/GlobalNav";
import GlobalTicker from "./components/GlobalTicker";
import { CartProvider } from "./context/CartContext";

const siteUrl = "https://qualifresh.in";

// export const metadata: Metadata = {
//   title: {
//     default:  "QualiFresh — Quality First",
//     template: "%s | QualiFresh",
//   },
//   description: "Premium farm-fresh produce delivered to your doorstep.",
//   keywords: ["exotic vegetables", "Korean vegetables", "Thai vegetables", "Pune delivery", "farm fresh", "QualiFresh"],
//   authors: [{ name: "QualiFresh" }],
//   icons: {
//     icon:     [{ url: "/logo.png", type: "image/png", sizes: "any" }],
//     shortcut: "/logo.png",
//     apple:    "/logo.png",
//   },
//   openGraph: {
//     title:       "QualiFresh — Quality First",
//     description: "Premium farm-fresh produce delivered to your doorstep.",
//     type:        "website",
//     locale:      "en_IN",
//     url:         siteUrl,
//     images:      [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "QualiFresh Logo" }],
//     siteName:    "QualiFresh",
//   },
//   twitter: {
//     card:        "summary_large_image",
//     title:       "QualiFresh — Quality First",
//     description: "Premium farm-fresh produce delivered to your doorstep.",
//     images:      [`${siteUrl}/logo.png`],
//   },
// };
export const metadata: Metadata = {
  title: {
    default: "QualiFresh — Quality First",
    template: "%s | QualiFresh",
  },
  description: "Premium farm-fresh produce delivered to your doorstep.",
  keywords: ["exotic vegetables", "Korean vegetables", "Thai vegetables", "Pune delivery", "farm fresh", "QualiFresh"],
  authors: [{ name: "QualiFresh" }],
  
  // Icons configuration
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  // OpenGraph for Facebook/Instagram/WhatsApp/etc.
  openGraph: {
    title: "QualiFresh — Quality First",
    description: "Premium farm-fresh produce delivered to your doorstep.",
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/logo.png`, // MUST be absolute URL
        width: 1200,               // Recommended size for social sharing
        height: 630,               // Recommended aspect ratio (1.91:1)
        alt: "QualiFresh Logo",
      },
    ],
    siteName: "QualiFresh",
  },

  // Twitter Card configuration
  twitter: {
    card:"summary_large_image",
    title:"QualiFresh — Quality First",
    description:"Premium farm-fresh produce delivered to your doorstep.",
    images:[`${siteUrl}/logo.png`], // MUST be absolute URL
    site:"@QualiFresh",            // Add your Twitter handle if you have one
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
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1"  />
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
      <body className="min-h-full flex flex-col" style={{ background: "#f4f6f0" }}><CartProvider><GlobalTicker /><GlobalNav />{children}</CartProvider></body>
    </html>
  );
}
