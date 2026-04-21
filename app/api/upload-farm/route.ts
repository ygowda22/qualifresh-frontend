import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const auth     = request.headers.get("authorization") || "";

    const r = await fetch(`${API}/api/farms/upload`, {
      method:  "POST",
      headers: { Authorization: auth },
      body:    formData,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json(data, { status: r.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Farm upload proxy error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
