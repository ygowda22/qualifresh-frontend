import { NextRequest, NextResponse } from "next/server";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT  = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Proxies category image upload to the backend API.
// Returns { url } where url is an absolute backend URL ready to store in DB.
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const formData   = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ message: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large — max 10 MB." }, { status: 400 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const r = await fetch(`${backendBase}/api/upload`, {
      method:  "POST",
      headers: { Authorization: authHeader },
      body:    formData,
    });

    const d = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json(d, { status: r.status });

    const url: string = d.url ?? "";
    const absoluteUrl = url.startsWith("http") ? url : `${backendBase}${url}`;
    return NextResponse.json({ url: absoluteUrl });
  } catch (err) {
    console.error("Category upload proxy error:", err);
    return NextResponse.json({ message: "Upload failed — backend may be unreachable" }, { status: 500 });
  }
}
