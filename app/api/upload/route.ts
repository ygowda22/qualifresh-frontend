import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const FOLDER_MAP: Record<string, string> = {
  "farm-images": "qualifresh-farms",
  "testimonial-avatars": "qualifresh-testimonials",
  "testimonial-photos": "qualifresh-testimonial-photos",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const auth     = request.headers.get("authorization") || "";

    const bucketParam = (formData.get("bucket") as string | null) || "";
    formData.delete("bucket");
    formData.set("folder", FOLDER_MAP[bucketParam] ?? "qualifresh-products");

    const r = await fetch(`${API}/api/upload`, {
      method:  "POST",
      headers: { Authorization: auth },
      body:    formData,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json(data, { status: r.status });
    return NextResponse.json({ success: true, url: data.url, filename: data.filename });
  } catch (err) {
    console.error("Upload proxy error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
