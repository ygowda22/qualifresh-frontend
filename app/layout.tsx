import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QualiFresh — Fresh Exotic Vegetables, Pune",
  description: "Premium Korean, Exotic & Thai vegetables delivered twice a week in Pune & Mumbai. Farm to doorstep freshness guaranteed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Favicon without preload hint — avoids "preloaded but not used" browser warning */}
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
