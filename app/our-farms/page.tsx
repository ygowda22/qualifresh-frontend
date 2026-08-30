import OurFarmsClient from "./OurFarmsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function safeFetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!r.ok) return fallback;
    return await r.json();
  } catch {
    return fallback;
  }
}

export default async function OurFarmsPage() {
  const farms = await safeFetchJson<any[]>("/api/farms", []);
  const mapped = farms.map((p: any) => ({
    id: p._id,
    title: p.title || "",
    description: p.description || "",
    imageUrl: p.imageUrl,
  }));

  return <OurFarmsClient initialFarmPhotos={mapped} />;
}
