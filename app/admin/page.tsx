"use client";
import { useEffect, useState, useRef } from "react";

const API = "/backend";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", out_for_delivery: "#8b5cf6",
  delivered: "#16a34a", cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", out_for_delivery: "Out for Delivery",
  delivered: "Delivered", cancelled: "Cancelled",
};

// ── Mini Bar Chart (CSS) ─────────────────────────────────────────────────────
function MiniBarChart({ data, color = "#2d8a4e" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "140px", width: "100%" }}>
      {data.map((d, i) => {
        const pct = Math.max(4, (d.value / max) * 100);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", height: "100%" }}>
            <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              {d.value > 0 && <span style={{ fontSize: "8px", color: "#374151", fontWeight: 700, marginBottom: "2px" }}>{d.value}</span>}
              <div style={{
                width: "100%",
                height: `${pct}%`,
                background: color,
                borderRadius: "3px 3px 0 0",
                opacity: 0.85,
                transition: "height 0.3s ease",
              }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span style={{ fontSize: "8.5px", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%", textOverflow: "ellipsis" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", padding: "1.3rem 1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ width: "50px", height: "50px", borderRadius: "14px", background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#111827", fontFamily: "sans-serif", lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: "12px", color: "#6b7280", fontFamily: "sans-serif", marginTop: "2px" }}>{label}</div>
        {sub && <div style={{ fontSize: "11px", color: color, fontWeight: 600, fontFamily: "sans-serif", marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 900, backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: "16px", padding: "2rem", width: "clamp(320px,92vw,560px)", maxHeight: "90vh", overflowY: "auto", zIndex: 1000, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        {children}
      </div>
    </>
  );
}

// ── Input helper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", fontFamily: "sans-serif", marginBottom: "4px" }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13.5px", fontFamily: "sans-serif", boxSizing: "border-box", background: "#fff", color: "#111827" };

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [token, setToken]       = useState<string | null>(null);
  const [tab, setTab]           = useState<"dashboard"|"orders"|"products"|"users">("dashboard");
  const [loginEmail, setLE]     = useState("");
  const [loginPass, setLP]      = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [prodSearch, setProdSearch] = useState("");
  const [prodPage, setProdPage]     = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  // Data
  const [stats, setStats]       = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders]     = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers]       = useState<any[]>([]);

  // Product modal
  const [showProdModal, setShowProdModal] = useState(false);
  const [editProd, setEditProd]           = useState<any>(null);
  const [prodForm, setProdForm]           = useState<any>({});
  const [uploading, setUploading]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Order filter
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("qf_admin_token");
    if (t) setToken(t);
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  async function doLogin() {
    setLoginErr(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPass }) });
      const d = await r.json();
      if (!r.ok) { setLoginErr(d.message || "Login failed"); return; }
      localStorage.setItem("qf_admin_token", d.token);
      setToken(d.token);
    } catch { setLoginErr("Network error"); }
    finally { setLoading(false); }
  }

  function logout() { localStorage.removeItem("qf_admin_token"); setToken(null); }

  // ── Load data when logged in ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    loadStats(); loadAnalytics(); loadOrders(); loadProducts(); loadUsers();
  }, [token]);

  async function loadStats() {
    try {
      const r = await fetch(`${API}/api/admin/users/stats`, { headers: authHeaders() });
      if (r.ok) setStats(await r.json());
    } catch {}
  }
  async function loadAnalytics() {
    try {
      const r = await fetch(`${API}/api/orders/analytics`, { headers: authHeaders() });
      if (r.ok) setAnalytics(await r.json());
    } catch {}
  }
  async function loadOrders() {
    try {
      const r = await fetch(`${API}/api/orders`, { headers: authHeaders() });
      if (r.ok) setOrders(await r.json());
    } catch {}
  }
  async function loadProducts() {
    try {
      const r = await fetch(`${API}/api/products/admin/all`, { headers: authHeaders() });
      if (r.ok) setProducts(await r.json());
    } catch {}
  }
  async function loadUsers() {
    try {
      const r = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
      if (r.ok) setUsers(await r.json());
    } catch {}
  }

  async function updateOrderStatus(id: string, status: string) {
    await fetch(`${API}/api/orders/${id}/status`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }) });
    loadOrders();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
    loadUsers();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/api/products/${id}`, { method: "DELETE", headers: authHeaders() });
    loadProducts();
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("image", file);
    // Send slug so image is saved as /public/products/{slug}.ext for auto-linking
    if (prodForm.slug) fd.append("slug", prodForm.slug);
    const r = await fetch(`/api/upload`, { method: "POST", body: fd });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      throw new Error(d.message || "Upload failed");
    }
    const d = await r.json();
    return d.url;
  }

  function openAddProduct() {
    setEditProd(null);
    setProdForm({ name: "", slug: "", category: "other", description: "", quantityLabel: "", unit: "gm", price: "", priceUnit: "per_unit", stock: "", isImported: false, isActive: true, imageUrl: "" });
    setShowProdModal(true);
  }

  function openEditProduct(p: any) {
    setEditProd(p);
    setProdForm({ ...p, price: String(p.price), stock: String(p.stock) });
    setShowProdModal(true);
  }

  async function saveProd() {
    if (uploading) { showToast("Wait for the image upload to finish first", false); return; }
    if (uploadError) { showToast("Fix the upload error before saving", false); return; }
    if (!prodForm.name || !prodForm.slug || !prodForm.price) {
      showToast("Name, slug, and price are required", false); return;
    }
    const body = { ...prodForm, price: Number(prodForm.price), stock: Number(prodForm.stock) };
    if (editProd) {
      await fetch(`${API}/api/products/${editProd._id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) });
    } else {
      await fetch(`${API}/api/products`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
    }
    localStorage.setItem("qf_products_updated", Date.now().toString());
    await loadProducts(); // load fresh data BEFORE closing so list is ready instantly
    setShowProdModal(false);
    showToast(editProd ? "✓ Product updated — list refreshed!" : "✓ Product added — list refreshed!");
  }

  const ALLOWED_MIME = ["image/jpeg","image/png","image/webp","image/gif","image/avif"];
  const ALLOWED_EXT  = [".jpg",".jpeg",".png",".webp",".gif",".avif"];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const ext      = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    const basename = file.name.slice(0, file.name.length - ext.length); // filename without extension

    // ── 1. Validate file type ─────────────────────────────────────────────────
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) {
      setUploadError(`"${file.name}" is not a valid image. Please upload a JPG, PNG, or WebP file.`);
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large — maximum size is 10 MB.");
      e.target.value = "";
      return;
    }

    // ── 2. Filename must match the product slug ───────────────────────────────
    if (prodForm.slug && basename !== prodForm.slug) {
      setUploadError(`Filename must match the product slug. Expected "${prodForm.slug}${ext}" but got "${file.name}". Rename the file and try again.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setProdForm((f: any) => ({ ...f, imageUrl: url }));
      // If editing an existing product, persist imageUrl to DB immediately so the list refreshes correctly
      if (editProd?._id) {
        await fetch(`${API}/api/products/${editProd._id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ ...prodForm, imageUrl: url, price: Number(prodForm.price), stock: Number(prodForm.stock) }),
        });
      }
      localStorage.setItem("qf_products_updated", Date.now().toString());
      await loadProducts();
      showToast(`✓ Image saved as ${url.split("/").pop()}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed — please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "orders",    icon: "📦", label: "Orders"    },
    { id: "products",  icon: "🥬", label: "Products"  },
    { id: "users",     icon: "👥", label: "Users"     },
  ] as const;

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderFilter === "all" || o.status === orderFilter;
    const matchSearch = !orderSearch || o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.guestName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const PROD_PER_PAGE = 15;
  const filteredProducts = products.filter(p => !prodSearch || p.name?.toLowerCase().includes(prodSearch.toLowerCase()) || p.slug?.toLowerCase().includes(prodSearch.toLowerCase()) || p.category?.toLowerCase().includes(prodSearch.toLowerCase()));
  const totalProdPages = Math.ceil(filteredProducts.length / PROD_PER_PAGE);
  const pagedProducts = filteredProducts.slice(prodPage * PROD_PER_PAGE, (prodPage + 1) * PROD_PER_PAGE);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1f12,#1a4a2e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia,serif" }}>
        <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem 2rem", width: "clamp(300px,90vw,380px)", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img src="/logo.png" alt="QualiFresh" style={{ height: "80px", width: "auto", margin: "0 auto 10px", display: "block", objectFit: "contain" }} />
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a3c2e", margin: "0 0 4px", fontFamily: "Georgia,serif" }}>Admin Panel</h1>
            <p style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "sans-serif", margin: 0 }}>Sign in to manage your store</p>
          </div>
          {loginErr && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", color: "#dc2626", fontSize: "13px", fontFamily: "sans-serif", marginBottom: "12px" }}>{loginErr}</div>}
          <input type="email" placeholder="Admin email" value={loginEmail} onChange={e => setLE(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
            style={{ ...inputStyle, marginBottom: "10px", background: "#fff", color: "#111827" }} />
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input type={showAdminPass ? "text" : "password"} placeholder="Password" value={loginPass} onChange={e => setLP(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()}
              style={{ ...inputStyle, paddingRight: "40px", background: "#fff", color: "#111827" }} />
            <button type="button" onClick={() => setShowAdminPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af", padding: 0 }}>{showAdminPass ? "🙈" : "👁"}</button>
          </div>
          <button onClick={doLogin} disabled={loading}
            style={{ width: "100%", padding: "13px", background: loading ? "#e5e7eb" : "#2d8a4e", color: loading ? "#9ca3af" : "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // ── Admin layout ──────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#f1f5f9" }}>

      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, background: "linear-gradient(180deg,#0a1f12 0%,#1a3c2e 100%)", display: "flex", flexDirection: "column", padding: "1.5rem 0" }}>
        <div style={{ padding: "0 1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="QualiFresh" style={{ height: "38px", width: "auto", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "2px" }} />
            <div>
              <div style={{ color: "#d9f99d", fontWeight: 700, fontSize: "14px", fontFamily: "Georgia,serif" }}>QualiFresh</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "1rem 0.8rem" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id as any)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: tab === item.id ? "rgba(163,230,53,0.15)" : "transparent", color: tab === item.id ? "#a3e635" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13.5px", fontWeight: tab === item.id ? 700 : 400, marginBottom: "4px", textAlign: "left" }}>
              <span style={{ fontSize: "17px" }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 0.8rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} style={{ width: "100%", padding: "9px 12px", background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Dashboard</h1>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Welcome back! Here's what's happening at QualiFresh.</p>
            </div>

            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <StatCard label="Total Orders"       value={stats?.totalOrders ?? "—"}              icon="📦" color="#2d8a4e" sub={`₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")} revenue`} />
              <StatCard label="Total Customers"    value={stats?.totalUsers ?? "—"}               icon="👥" color="#3b82f6" sub={`${stats?.newUsersThisMonth ?? 0} this month`} />
              <StatCard label="Repeat Customers"   value={stats?.repeatCustomers ?? "—"}          icon="🔄" color="#7c3aed" />
              <StatCard label="Products Listed"    value={products.length}                        icon="🥬" color="#f59e0b" />
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {/* Daily orders chart */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: 700, color: "#111827" }}>Orders — Last 30 Days</h3>
                {analytics?.dailyOrders?.length > 0 ? (
                  <MiniBarChart
                    data={analytics.dailyOrders.slice(-14).map((d: any) => ({ label: d._id?.slice(5) || "", value: d.count }))}
                    color="#2d8a4e"
                  />
                ) : <p style={{ color: "#9ca3af", fontSize: "13px", textAlign: "center", padding: "2rem 0" }}>No data yet</p>}
              </div>

              {/* Order status breakdown */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: 700, color: "#111827" }}>Order Status</h3>
                {analytics?.statusBreakdown?.length > 0 ? analytics.statusBreakdown.map((s: any) => (
                  <div key={s._id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLORS[s._id] || "#9ca3af", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "13px", color: "#374151" }}>{STATUS_LABELS[s._id] || s._id}</span>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: STATUS_COLORS[s._id] || "#374151" }}>{s.count}</span>
                    <div style={{ width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, (s.count / (analytics?.totalOrders || 1)) * 100)}%`, background: STATUS_COLORS[s._id] || "#9ca3af", borderRadius: "3px" }} />
                    </div>
                  </div>
                )) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>No orders yet</p>}
              </div>
            </div>

            {/* Top products + Recent orders */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "1rem" }}>
              {/* Top products */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: 700, color: "#111827" }}>Top Selling Products</h3>
                {stats?.topProducts?.length > 0 ? stats.topProducts.map((p: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ width: "22px", height: "22px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p._id}</span>
                    <span style={{ fontWeight: 700, fontSize: "12px", color: "#6b7280" }}>{p.count} sold</span>
                  </div>
                )) : <p style={{ color: "#9ca3af", fontSize: "13px" }}>No sales data yet</p>}
              </div>

              {/* Recent orders */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "14px", fontWeight: 700, color: "#111827" }}>Recent Orders</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr>{["Order", "Customer", "Amount", "Status"].map(h => <th key={h} style={{ textAlign: "left", color: "#9ca3af", fontWeight: 600, padding: "4px 8px 8px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(analytics?.recentOrders || []).slice(0, 6).map((o: any) => (
                      <tr key={o._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 600, color: "#2d8a4e" }}>{o.orderNumber}</td>
                        <td style={{ padding: "8px", color: "#374151" }}>{o.guestName || o.user?.name || "Guest"}</td>
                        <td style={{ padding: "8px", fontWeight: 700, color: "#111827" }}>₹{o.total}</td>
                        <td style={{ padding: "8px" }}>
                          <span style={{ background: STATUS_COLORS[o.status] + "20", color: STATUS_COLORS[o.status], fontSize: "11px", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>{STATUS_LABELS[o.status]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: 0 }}>Orders</h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search order / customer…"
                    style={{ padding: "8px " + (orderSearch ? "30px" : "12px") + " 8px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13px", background: "#fff", color: "#111827" }} />
                  {orderSearch && <button onClick={() => setOrderSearch("")} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "#e5e7eb", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "9px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>}
                </div>
                <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13px" }}>
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Order #", "Customer", "Items", "Total", "Slot", "Date", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>No orders found</td></tr>
                  )}
                  {filteredOrders.map(o => (
                    <tr key={o._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2d8a4e" }}>{o.orderNumber}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{o.guestName || o.user?.name || "Guest"}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{o.guestPhone || o.user?.phone || ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px", maxWidth: "180px" }}>
                        <div style={{ fontSize: "12px", color: "#374151" }}>{o.items?.slice(0, 2).map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}{o.items?.length > 2 ? ` +${o.items.length - 2} more` : ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#111827" }}>₹{o.total}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "12px" }}>{o.deliverySlot}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "12px" }}>{fmtDate(o.createdAt)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: STATUS_COLORS[o.status] + "20", color: STATUS_COLORS[o.status], fontSize: "11px", padding: "3px 9px", borderRadius: "6px", fontWeight: 700 }}>{STATUS_LABELS[o.status]}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)}
                          style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "12px", cursor: "pointer", background: "#fff", color: "#111827" }}>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: 0 }}>Products <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: 400 }}>({filteredProducts.length})</span></h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <input value={prodSearch} onChange={e => { setProdSearch(e.target.value); setProdPage(0); }} placeholder="Search products…"
                    style={{ padding: "8px " + (prodSearch ? "30px" : "12px") + " 8px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13px", background: "#fff", color: "#111827" }} />
                  {prodSearch && <button onClick={() => { setProdSearch(""); setProdPage(0); }} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "#e5e7eb", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "9px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>}
                </div>
                <button onClick={openAddProduct}
                  style={{ padding: "10px 20px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                  + Add Product
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "11.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>{prodSearch ? "No products match your search" : "No products found"}</td></tr>
                  )}
                  {pagedProducts.map(p => (
                    <tr key={p._id} style={{ borderTop: "1px solid #f1f5f9", opacity: p.isActive ? 1 : 0.55, background: p.isActive ? undefined : "#fffbeb" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <img src={p.imageUrl || `/products/${p.slug}.png`} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }}
                          onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&q=60&fit=crop"; }} />
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{p.slug}</div>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#6b7280", textTransform: "capitalize" }}>{p.category}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#111827" }}>₹{p.price}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ color: p.stock > 10 ? "#16a34a" : p.stock > 0 ? "#f59e0b" : "#ef4444", fontWeight: 700 }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-start" }}>
                          <span style={{ background: p.isActive ? "#f0fdf4" : "#fef2f2", color: p.isActive ? "#16a34a" : "#ef4444", fontSize: "11.5px", padding: "3px 9px", borderRadius: "6px", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                          {!p.isActive && <span style={{ fontSize: "10px", color: "#92400e", fontFamily: "sans-serif", whiteSpace: "nowrap" }}>Hidden from users</span>}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEditProduct(p)} style={{ padding: "5px 12px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                          <button onClick={() => deleteProduct(p._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalProdPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>Page {prodPage + 1} of {totalProdPages} · {filteredProducts.length} products</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => setProdPage(p => Math.max(0, p - 1))} disabled={prodPage === 0}
                      style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", background: prodPage === 0 ? "#f9fafb" : "#fff", color: prodPage === 0 ? "#d1d5db" : "#374151", cursor: prodPage === 0 ? "default" : "pointer", fontSize: "12px", fontWeight: 600 }}>← Prev</button>
                    <button onClick={() => setProdPage(p => Math.min(totalProdPages - 1, p + 1))} disabled={prodPage >= totalProdPages - 1}
                      style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", background: prodPage >= totalProdPages - 1 ? "#f9fafb" : "#fff", color: prodPage >= totalProdPages - 1 ? "#d1d5db" : "#374151", cursor: prodPage >= totalProdPages - 1 ? "default" : "pointer", fontSize: "12px", fontWeight: 600 }}>Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 1.5rem" }}>Customers <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: 400 }}>({users.length})</span></h1>
            <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Name", "Email", "Phone", "Registered", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "11.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>No customers yet</td></tr>}
                  {users.map(u => (
                    <tr key={u._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", color: "#2d8a4e", flexShrink: 0 }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                          <span style={{ fontWeight: 600, color: "#111827" }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "#374151" }}>{u.email}</td>
                      <td style={{ padding: "12px 14px", color: "#374151" }}>{u.phone}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "12px" }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: u.isActive ? "#f0fdf4" : "#fef2f2", color: u.isActive ? "#16a34a" : "#ef4444", fontSize: "11.5px", padding: "3px 9px", borderRadius: "6px", fontWeight: 600 }}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => deleteUser(u._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Product Add/Edit Modal ── */}
      {showProdModal && (
        <Modal onClose={() => setShowProdModal(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>{editProd ? "Edit Product" : "Add Product"}</h2>
            <button onClick={() => setShowProdModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Product Image</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              {(prodForm.imageUrl || prodForm.slug) && (
                <img src={prodForm.imageUrl || `/products/${prodForm.slug}.png`} alt=""
                  style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px", border: "2px solid #e5e7eb", flexShrink: 0 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <input ref={fileRef} type="file" accept={ALLOWED_EXT.join(",")} onChange={handleImageUpload} style={{ display: "none" }} />
                <button onClick={() => { setUploadError(null); fileRef.current?.click(); }} disabled={uploading}
                  style={{ padding: "9px 16px", background: "#f0fdf4", color: "#2d8a4e", border: "2px dashed #86efac", borderRadius: "8px", cursor: uploading ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>
                  {uploading ? "⏳ Uploading…" : "📁 Upload Image"}
                </button>

                {/* Inline validation error */}
                {uploadError && (
                  <div style={{ marginTop: "6px", padding: "7px 10px", background: "#fef2f2", borderRadius: "6px", border: "1px solid #fecaca" }}>
                    <p style={{ margin: 0, fontSize: "11.5px", color: "#dc2626", fontFamily: "sans-serif" }}>⚠ {uploadError}</p>
                  </div>
                )}

                {/* Filename hints — product image + category image */}
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  {/* Product image filename */}
                  <div style={{ padding: "7px 10px", background: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "10.5px", fontWeight: 700, color: "#166534", fontFamily: "sans-serif" }}>📦 Product image filename:</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <code style={{ flex: 1, fontSize: "12px", color: "#15803d", background: "#dcfce7", padding: "3px 7px", borderRadius: "4px", fontWeight: 700 }}>
                        {prodForm.slug ? `${prodForm.slug}.png` : <span style={{ color: "#9ca3af", fontWeight: 400 }}>enter slug first</span>}
                      </code>
                      {prodForm.slug && (
                        <button onClick={() => copyText(`${prodForm.slug}.png`, "prod")}
                          style={{ padding: "3px 8px", background: copied === "prod" ? "#16a34a" : "#e5e7eb", color: copied === "prod" ? "#fff" : "#374151", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {copied === "prod" ? "✓ Copied" : "📋 Copy"}
                        </button>
                      )}
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#6b7280", fontFamily: "sans-serif" }}>Copy filename and place in your images folder.</p>
                  </div>

                </div>

                {prodForm.imageUrl && (
                  <div style={{ marginTop: "6px" }}>
                    <input value={prodForm.imageUrl} onChange={e => setProdForm((f: any) => ({ ...f, imageUrl: e.target.value }))} placeholder="Or paste image URL" style={{ ...inputStyle, fontSize: "12px" }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Field label="Product Name" required><input value={prodForm.name || ""} onChange={e => setProdForm((f: any) => ({ ...f, name: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Slug (URL key)" required><input value={prodForm.slug || ""} onChange={e => setProdForm((f: any) => ({ ...f, slug: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Category" required>
              <select value={prodForm.category || "other"} onChange={e => setProdForm((f: any) => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {["leafy","herb","mushroom","microgreen","sprout","fruit","grain","other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Unit">
              <select value={prodForm.unit || "gm"} onChange={e => setProdForm((f: any) => ({ ...f, unit: e.target.value }))} style={inputStyle}>
                {["gm","kg","ml","bunch","pkt","punnet","pc","pt"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)" required><input type="number" value={prodForm.price || ""} onChange={e => setProdForm((f: any) => ({ ...f, price: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Price Unit">
              <select value={prodForm.priceUnit || "per_unit"} onChange={e => setProdForm((f: any) => ({ ...f, priceUnit: e.target.value }))} style={inputStyle}>
                <option value="per_unit">Per Unit</option>
                <option value="per_kg">Per KG</option>
              </select>
            </Field>
            <Field label="Stock" required><input type="number" value={prodForm.stock || ""} onChange={e => setProdForm((f: any) => ({ ...f, stock: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Quantity Label"><input value={prodForm.quantityLabel || ""} onChange={e => setProdForm((f: any) => ({ ...f, quantityLabel: e.target.value }))} placeholder="e.g. 250gm" style={inputStyle} /></Field>
          </div>
          <Field label="Description">
            <textarea value={prodForm.description || ""} onChange={e => setProdForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={prodForm.isImported || false} onChange={e => setProdForm((f: any) => ({ ...f, isImported: e.target.checked }))} /> Imported
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
              <input type="checkbox" checked={prodForm.isActive !== false} onChange={e => setProdForm((f: any) => ({ ...f, isActive: e.target.checked }))} /> Active
            </label>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowProdModal(false)} style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={saveProd} disabled={uploading || !!uploadError}
              style={{ padding: "10px 24px", background: uploading || uploadError ? "#86efac" : "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: uploading || uploadError ? "not-allowed" : "pointer", fontWeight: 700, opacity: uploading || uploadError ? 0.6 : 1 }}>
              {editProd ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.ok ? "#0a1f12" : "#7f1d1d", color: toast.ok ? "#a3e635" : "#fca5a5", padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", fontFamily: "sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", zIndex: 2000, display: "flex", alignItems: "center", gap: "8px" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
