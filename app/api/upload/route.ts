import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Saves uploaded product images directly into /public/products/ so they are
// served by Next.js statically — no backend proxy required.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If the admin provides the product slug, name the file after it so the
    // auto-fallback on product cards picks it up without any imageUrl stored.
    const slug = (formData.get("slug") as string | null)?.trim().replace(/[^a-z0-9-_]/gi, "");
    const ext  = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = slug ? `${slug}${ext}` : `product-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "products");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/products/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
