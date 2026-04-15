import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT  = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

// Saves uploaded category images into /public/category/
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ message: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large — max 10 MB." }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const slug   = (formData.get("slug") as string | null)?.trim().replace(/[^a-z0-9-_]/gi, "") || `cat-${Date.now()}`;
    const filename = `${slug}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "category");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/category/${filename}` });
  } catch (err) {
    console.error("Category upload error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
