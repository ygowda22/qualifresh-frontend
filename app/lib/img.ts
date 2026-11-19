/**
 * Serve Cloudinary images resized and in WebP/AVIF instead of the original PNG.
 *
 * Before: .../image/upload/v123/qualifresh-products/bok-choy.png        (~600 KB PNG)
 * After:  .../image/upload/f_auto,q_auto,w_480/v123/qualifresh-products/bok-choy.png  (~30-50 KB WebP)
 *
 * - Non-Cloudinary URLs (local /public files, other hosts) are returned unchanged,
 *   so it is safe to wrap any image src with it.
 * - URLs that already contain a transformation are returned unchanged.
 * - Pass `h` to crop to an exact box (c_fill, auto gravity).
 */
const CLD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export function cldImg(url: string | undefined | null, w: number, h?: number): string {
  if (!url) return "";
  const m = url.match(CLD);
  if (!m) return url;
  const rest = m[2];
  // already transformed, e.g. "c_fill,w_400/..." or "f_auto/..."
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;
  const t = h ? `c_fill,g_auto,w_${w},h_${h},f_auto,q_auto` : `f_auto,q_auto,w_${w}`;
  return `${m[1]}${t}/${rest}`;
}
