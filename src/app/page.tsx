"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Loading products...</p>;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>QualiFresh Products</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {products.map((p: any) => (
          <div key={p._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem" }}>{p.name}</h3>
            <p style={{ color: "#555", margin: "0 0 0.5rem" }}>{p.quantityLabel}</p>
            <p style={{ fontWeight: "bold", color: "#2d7a2d" }}>₹{p.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}