import HomeClient from "./HomeClient";

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

export default async function Home() {
  const [products, farmPhotos, categories, testimonials] = await Promise.all([
    safeFetchJson<any[]>("/api/products", []),
    safeFetchJson<any[]>("/api/farms", []),
    safeFetchJson<any[]>("/api/categories", []),
    safeFetchJson<any[]>("/api/testimonials", []),
  ]);

  return (
    <HomeClient
      initialProducts={products}
      initialFarmPhotos={farmPhotos}
      initialCategories={categories}
      initialTestimonials={testimonials}
    />
  );
}
