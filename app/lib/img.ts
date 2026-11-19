/**
 * Pick the right-sized version of a product/category/farm/testimonial image.
 *
 * Cloudinary (current):
 *   .../image/upload/v123/qualifresh-products/bok-choy.png                        (~600 KB PNG)
 *   → .../image/upload/f_auto,q_auto,w_480/v123/qualifresh-products/bok-choy.png  (~30-50 KB WebP)
 *
 * Google Cloud Storage (after migration — backend stores <name>-1200.webp and <name>-400.webp):
 *   https://storage.googleapis.com/<bucket>/.../bok-choy-1200.webp
 *   → ...-400.webp when a small image (w <= 480) is enough
 *
 * Any other URL (local /public files, other hosts) is returned unchanged,
 * so it is safe to wrap any image src with it.
 * Pass `h` to crop Cloudinary images to an exact box (c_fill, auto gravity);
 * GCS images are cropped by CSS object-fit instead.
 */
const CLD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
const GCS_LARGE = /^(https:\/\/storage\.googleapis\.com\/.+)-1200\.webp(\?.*)?$/;
const SMALL_MAX = 480;

export function cldImg(url: string | undefined | null, w: number, h?: number): string {
  if (!url) return "";

  const g = url.match(GCS_LARGE);
  if (g) return w <= SMALL_MAX ? `${g[1]}-400.webp${g[2] ?? ""}` : url;

  const m = url.match(CLD);
  if (!m) return url;
  const rest = m[2];
  // already transformed, e.g. "c_fill,w_400/..." or "f_auto/..."
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;
  const t = h ? `c_fill,g_auto,w_${w},h_${h},f_auto,q_auto` : `f_auto,q_auto,w_${w}`;
  return `${m[1]}${t}/${rest}`;
}
