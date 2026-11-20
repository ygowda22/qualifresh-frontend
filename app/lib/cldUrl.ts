// Rewrites a Cloudinary delivery URL to request auto format/quality (WebP/AVIF)
// plus a size transform, so images are served small instead of raw PNG/JPG.
// Non-Cloudinary URLs (static assets, external URLs) are returned unchanged.
export function cld(url: string | undefined | null, transforms: string): string {
  if (!url || !url.includes("/upload/")) return url || "";
  if (/\/upload\/[a-z]{1,3}_[^/]+\//.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/${transforms}/`);
}
