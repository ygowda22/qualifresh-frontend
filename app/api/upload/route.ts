import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_EXT  = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ message: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large — max 10 MB." }, { status: 400 });
    }

    const slug = (formData.get("slug") as string | null)?.trim().replace(/[^a-z0-9-_]/gi, "");
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:    "qualifresh/products",
          public_id: slug || undefined,
          overwrite: true,
          resource_type: "image",
        },
        (err, res) => {
          if (err || !res) reject(err || new Error("Upload failed"));
          else resolve(res as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "Upload failed — check Cloudinary credentials" }, { status: 500 });
  }
}
