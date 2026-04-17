import { NextRequest, NextResponse } from "next/server";
import path from "path";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_EXT  = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

const SUPABASE_URL    = process.env.SUPABASE_URL    || "";
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET          = "product-images";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file     = formData.get("image") as File | null;
    const slug     = (formData.get("slug") as string | null) || "";

    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ message: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large — max 10 MB." }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ message: "Storage not configured" }, { status: 500 });
    }

    const baseName = slug
      ? slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
      : path.basename(file.name, ext).replace(/\s+/g, "-").toLowerCase();
    const fileName = `${baseName}-${Date.now()}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
      {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${SUPABASE_KEY}`,
          "Content-Type": file.type,
          "x-upsert":     "false",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      console.error("Supabase upload error:", err);
      return NextResponse.json({ message: "Storage upload failed" }, { status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl, filename: fileName });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
