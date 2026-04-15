"use client";
import { useEffect, useState, useRef } from "react";
import { siteConfig } from "../../src/config/site";

const API = "/backend";

// ── Default Farm Photos ──────────────────────────────────────────────────────
interface FarmPhoto { id: string; title: string; description: string; imageUrl: string; }

// ── Custom Categories ─────────────────────────────────────────────────────────
interface CustomCategory { id: string; key: string; label: string; image: string; color: string; icon: string; }
const CAT_COLOR_OPTIONS = ["#1d4ed8","#16a34a","#15803d","#b91c1c","#0d9488","#ca8a04","#7c3aed","#b45309","#db2777","#0369a1"];

const DEFAULT_FARM_PHOTOS: FarmPhoto[] = [
  { id: "f1", title: "Our Main Farm",   description: "Sun-drenched fields in Pune's fertile belt",   imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop" },
  { id: "f2", title: "Herb Garden",     description: "Fresh herbs cultivated with care every morning", imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop" },
  { id: "f3", title: "Mushroom House",  description: "Climate-controlled growing chambers",            imageUrl: "https://images.unsplash.com/photo-1504382262782-5b4ece78642b?w=800&q=80&fit=crop" },
  { id: "f4", title: "Harvest Morning", description: "Fresh picks loaded before sunrise",              imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80&fit=crop" },
  { id: "f5", title: "Cold Storage",    description: "Temperature-controlled from farm to door",       imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&fit=crop" },
  { id: "f6", title: "Delivery Ready",  description: "Packed with care, delivered with love",          imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80&fit=crop" },
];

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
  const [tab, setTab]           = useState<"dashboard"|"orders"|"products"|"users"|"settings">("dashboard");
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
  const [imgKey, setImgKey]           = useState(0); // bumped after each upload to force img remount
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError]     = useState<string | null>(null);

  // ── Settings state ─────────────────────────────────────────────────────────
  const [cartEnabled, setCartEnabled]   = useState(true);
  const [farmPhotos, setFarmPhotos]     = useState<FarmPhoto[]>(DEFAULT_FARM_PHOTOS);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [editingFarm, setEditingFarm]   = useState<FarmPhoto | null>(null);
  const [farmForm, setFarmForm]         = useState({ title: "", description: "", imageUrl: "" });
  const [farmUploadError, setFarmUploadError] = useState<string | null>(null);
  const [farmUploading, setFarmUploading]     = useState(false);
  const farmFileRef = useRef<HTMLInputElement>(null);

  // ── Category state ──────────────────────────────────────────────────────────
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, { label?: string; image?: string; color?: string; icon?: string }>>({});
  const [showCatModal,  setShowCatModal]  = useState(false);
  const [editingCat,    setEditingCat]    = useState<CustomCategory | null>(null);
  const [editingStaticKey, setEditingStaticKey] = useState<string | null>(null);
  const [catForm,       setCatForm]       = useState({ label: "", image: "", color: CAT_COLOR_OPTIONS[0], icon: "🥦" });
  const [catUploadError, setCatUploadError] = useState<string | null>(null);
  const [catUploading,  setCatUploading]  = useState(false);
  const catFileRef = useRef<HTMLInputElement>(null);

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

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser,   setEditingUser]   = useState<any>(null);
  const [userForm,      setUserForm]      = useState({ name: "", email: "", phone: "", password: "", isActive: true });
  const [userFormErr,   setUserFormErr]   = useState("");
  const [userSaving,    setUserSaving]    = useState(false);

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
    document.title = "Admin Panel — QualiFresh";
    const t = localStorage.getItem("qf_admin_token");
    if (t) setToken(t);
    // Load settings from localStorage
    const cartSetting = localStorage.getItem("qf_cart_enabled");
    if (cartSetting !== null) setCartEnabled(cartSetting === "true");
    const farmSetting = localStorage.getItem("qf_farm_photos");
    if (farmSetting) { try { setFarmPhotos(JSON.parse(farmSetting)); } catch {} }
    const catSetting = localStorage.getItem("qf_custom_categories");
    if (catSetting) { try { setCustomCategories(JSON.parse(catSetting)); } catch {} }
    const overrideSetting = localStorage.getItem("qf_category_overrides");
    if (overrideSetting) { try { setCategoryOverrides(JSON.parse(overrideSetting)); } catch {} }
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
    setProdLoading(true);
    setProdError(null);
    try {
      const r = await fetch(`${API}/api/products/admin/all`, { headers: authHeaders() });
      if (!r.ok) {
        if (r.status === 401) { logout(); return; } // token expired — force re-login
        const d = await r.json().catch(() => ({}));
        setProdError(d.message || `Server error (${r.status})`);
        return;
      }
      const data = await r.json();
      const ts = Date.now();
      setProducts(data.map((p: any) => p.imageUrl ? { ...p, imageUrl: `${p.imageUrl.split("?")[0]}?t=${ts}` } : p));
    } catch (e: any) {
      setProdError("Network error — is the backend running?");
    } finally {
      setProdLoading(false);
    }
  }
  async function loadUsers() {
    try {
      const r = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
      if (r.ok) setUsers(await r.json());
    } catch {}
  }

  async function updateOrderStatus(id: string, status: string) {
    const r = await fetch(`${API}/api/orders/${id}/status`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }) });
    if (r.ok) {
      // Trigger backend notification (email + SMS) after status change
      try {
        await fetch(`${API}/api/orders/${id}/notify`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ status }) });
      } catch {}
    }
    loadOrders();
    showToast(`✓ Order status updated to ${STATUS_LABELS[status] || status}`);
  }

  async function deleteOrder(id: string, orderNumber: string) {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    setOrders(prev => prev.filter(o => o._id !== id)); // optimistic remove
    try {
      const r = await fetch(`${API}/api/admin/orders/${id}`, { method: "DELETE", headers: authHeaders() });
      if (r.ok) {
        showToast("✓ Order deleted");
      } else {
        loadOrders(); // revert on failure
        showToast("Failed to delete order", false);
      }
    } catch {
      loadOrders(); // revert on network error
      showToast("Network error — order not deleted", false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
    loadUsers();
  }

  function openAddUser() {
    setEditingUser(null);
    setUserForm({ name: "", email: "", phone: "", password: "", isActive: true });
    setUserFormErr("");
    setShowUserModal(true);
  }

  function openEditUser(u: any) {
    setEditingUser(u);
    setUserForm({ name: u.name || "", email: u.email || "", phone: u.phone || "", password: "", isActive: u.isActive !== false });
    setUserFormErr("");
    setShowUserModal(true);
  }

  async function saveUser() {
    setUserFormErr("");
    if (!userForm.name.trim()) { setUserFormErr("Name is required"); return; }
    if (!userForm.email.trim()) { setUserFormErr("Email is required"); return; }
    if (!editingUser && !userForm.password) { setUserFormErr("Password is required for new users"); return; }
    setUserSaving(true);
    try {
      const payload: any = { name: userForm.name.trim(), email: userForm.email.trim(), phone: userForm.phone.trim(), isActive: userForm.isActive };
      if (userForm.password) payload.password = userForm.password;
      const url = editingUser ? `${API}/api/admin/users/${editingUser._id}` : `${API}/api/admin/users`;
      const method = editingUser ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) { setUserFormErr(d.message || "Save failed"); return; }
      setShowUserModal(false);
      loadUsers();
      showToast(editingUser ? "User updated" : "User created");
    } catch { setUserFormErr("Network error"); }
    finally { setUserSaving(false); }
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
    setUploadError(null);
    setShowProdModal(true);
  }

  function openEditProduct(p: any) {
    setEditProd(p);
    setProdForm({ ...p, price: String(p.price), stock: String(p.stock) });
    setUploadError(null);
    setShowProdModal(true);
  }

  async function saveProd() {
    if (uploading) { showToast("Wait for the image upload to finish first", false); return; }
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
    setImgKey(k => k + 1); // force all product images to re-fetch from server
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

    setUploading(true);
    try {
      const url = await uploadImage(file);
      // Append cache-bust so the browser fetches the new image immediately in the product list
      const cacheBustedUrl = `${url}?t=${Date.now()}`;
      setProdForm((f: any) => ({ ...f, imageUrl: cacheBustedUrl }));
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
      setImgKey(k => k + 1); // force all product img elements to remount → always fetches fresh
      showToast(`✓ Image saved as ${url.split("/").pop()}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed — please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── Settings helpers ───────────────────────────────────────────────────────
  function saveSettings(newCartEnabled: boolean, newFarmPhotos: FarmPhoto[]) {
    localStorage.setItem("qf_cart_enabled", String(newCartEnabled));
    localStorage.setItem("qf_farm_photos", JSON.stringify(newFarmPhotos));
    localStorage.setItem("qf_custom_categories", JSON.stringify(customCategories));
    localStorage.setItem("qf_settings_updated", Date.now().toString());
    showToast("✓ Settings saved and applied to store!");
  }

  function openFarmModal(photo?: FarmPhoto) {
    if (photo) { setEditingFarm(photo); setFarmForm({ title: photo.title, description: photo.description, imageUrl: photo.imageUrl }); }
    else { setEditingFarm(null); setFarmForm({ title: "", description: "", imageUrl: "" }); }
    setFarmUploadError(null);
    setShowFarmModal(true);
  }

  function saveFarmPhoto() {
    if (!farmForm.imageUrl) { setFarmUploadError("Please upload or paste an image URL."); return; }
    let updated: FarmPhoto[];
    if (editingFarm) {
      updated = farmPhotos.map(p => p.id === editingFarm.id ? { ...p, ...farmForm } : p);
    } else {
      updated = [...farmPhotos, { id: `f${Date.now()}`, ...farmForm }];
    }
    setFarmPhotos(updated);
    setShowFarmModal(false);
    showToast(editingFarm ? "✓ Farm photo updated!" : "✓ Farm photo added!");
  }

  function deleteFarmPhoto(id: string) {
    if (!confirm("Remove this farm photo?")) return;
    setFarmPhotos(f => f.filter(p => p.id !== id));
  }

  async function uploadFarmImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFarmUploadError(null);
    const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext)) { setFarmUploadError("Invalid file type. Use JPG, PNG, or WebP."); e.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setFarmUploadError("File too large — max 10 MB."); e.target.value = ""; return; }
    setFarmUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("slug", `farm-${Date.now()}`);
      const r = await fetch(`/api/upload`, { method: "POST", body: fd });
      if (!r.ok) throw new Error("Upload failed");
      const d = await r.json();
      setFarmForm(f => ({ ...f, imageUrl: `${d.url}?t=${Date.now()}` }));
    } catch (err: any) { setFarmUploadError(err.message || "Upload failed"); }
    finally { setFarmUploading(false); e.target.value = ""; }
  }

  // ── Category helpers ──────────────────────────────────────────────────────
  function openCatModal(cat?: CustomCategory) {
    if (cat) { setEditingCat(cat); setCatForm({ label: cat.label, image: cat.image, color: cat.color, icon: cat.icon }); }
    else { setEditingCat(null); setCatForm({ label: "", image: "", color: CAT_COLOR_OPTIONS[0], icon: "🥦" }); }
    setEditingStaticKey(null);
    setCatUploadError(null);
    setShowCatModal(true);
  }

  function openStaticCatEdit(staticCat: typeof siteConfig.categories[0]) {
    const override = categoryOverrides[staticCat.key] || {};
    setEditingStaticKey(staticCat.key);
    setEditingCat(null);
    setCatForm({
      label: (override.label ?? staticCat.label),
      image: (override.image ?? staticCat.image),
      color: (override.color ?? staticCat.color),
      icon:  (override.icon  ?? staticCat.icon),
    });
    setCatUploadError(null);
    setShowCatModal(true);
  }

  function saveCatEntry() {
    if (!catForm.label.trim()) { setCatUploadError("Category name is required."); return; }

    if (editingStaticKey) {
      // Save override for a static category
      const updated = { ...categoryOverrides, [editingStaticKey]: { label: catForm.label, image: catForm.image, color: catForm.color, icon: catForm.icon } };
      setCategoryOverrides(updated);
      localStorage.setItem("qf_category_overrides", JSON.stringify(updated));
      localStorage.setItem("qf_settings_updated", Date.now().toString());
      setShowCatModal(false);
      showToast("✓ Default category updated!");
      return;
    }

    const key = catForm.label.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");
    let updated: CustomCategory[];
    if (editingCat) {
      updated = customCategories.map(c => c.id === editingCat.id ? { ...c, ...catForm, key } : c);
    } else {
      updated = [...customCategories, { id: `cat-${Date.now()}`, key, ...catForm }];
    }
    setCustomCategories(updated);
    localStorage.setItem("qf_custom_categories", JSON.stringify(updated));
    localStorage.setItem("qf_settings_updated", Date.now().toString());
    setShowCatModal(false);
    showToast(editingCat ? "✓ Category updated!" : "✓ Category added!");
  }

  function deleteCat(id: string) {
    if (!confirm("Remove this category?")) return;
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    localStorage.setItem("qf_custom_categories", JSON.stringify(updated));
    localStorage.setItem("qf_settings_updated", Date.now().toString());
    showToast("✓ Category removed.");
  }

  async function uploadCatImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCatUploadError(null);
    const ext = (file.name.match(/\.[^.]+$/) || [""])[0].toLowerCase();
    const allowed = [".jpg",".jpeg",".png",".webp"];
    if (!allowed.includes(ext)) { setCatUploadError("Use JPG, PNG, or WebP."); e.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setCatUploadError("File too large — max 10 MB."); e.target.value = ""; return; }
    setCatUploading(true);
    try {
      const slug = `cat-${catForm.label.trim().toLowerCase().replace(/[^a-z0-9]/g,"-") || Date.now()}`;
      const fd = new FormData();
      fd.append("image", file);
      fd.append("slug", slug);
      const r = await fetch("/api/upload-category", { method: "POST", body: fd });
      if (!r.ok) throw new Error("Upload failed");
      const d = await r.json();
      setCatForm(f => ({ ...f, image: `${d.url}?t=${Date.now()}` }));
    } catch (err: any) { setCatUploadError(err.message || "Upload failed"); }
    finally { setCatUploading(false); e.target.value = ""; }
  }

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "orders",    icon: "📦", label: "Orders"    },
    { id: "products",  icon: "🥬", label: "Products"  },
    { id: "users",     icon: "👥", label: "Users"     },
    { id: "settings",  icon: "⚙️",  label: "Settings"  },
  ] as const;

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderFilter === "all" || o.status === orderFilter;
    const matchSearch = !orderSearch || o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.guestName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const PROD_PER_PAGE = 10;
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
    <div className="admin-wrap" style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif", background: "#f1f5f9" }}>
      <style>{`
        @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        .admin-wrap{flex-direction:row}
        .admin-sidebar{width:220px;flex-shrink:0;background:linear-gradient(180deg,#0a1f12 0%,#1a3c2e 100%);display:flex;flex-direction:column;padding:1.5rem 0}
        .admin-sidebar-logo{display:block}
        .admin-sidebar-nav{flex:1;padding:1rem 0.8rem}
        .admin-mobile-nav{display:none}
        .admin-main{flex:1;overflow:auto;padding:2rem}
        .admin-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .admin-charts-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem}
        .admin-recent-row{display:grid;grid-template-columns:1fr 1.6fr;gap:1rem}
        @media(max-width:768px){
          .admin-wrap{flex-direction:column}
          .admin-sidebar{display:none}
          .admin-mobile-nav{display:flex;background:linear-gradient(90deg,#0a1f12,#1a3c2e);overflow-x:auto;position:sticky;top:0;z-index:200;padding:0;border-bottom:1px solid rgba(255,255,255,0.1)}
          .admin-mobile-nav::-webkit-scrollbar{display:none}
          .admin-mobile-nav-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 14px;background:none;border:none;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;border-bottom:2px solid transparent;transition:all .15s;flex-shrink:0}
          .admin-main{padding:1rem}
          .admin-charts-row{grid-template-columns:1fr!important}
          .admin-recent-row{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .admin-mobile-nav-btn{padding:8px 10px;font-size:10px}
          .admin-main{padding:0.75rem}
          .admin-table-wrap table td:last-child{white-space:nowrap}
          .admin-prod-actions{display:flex!important;flex-wrap:wrap!important;gap:4px!important}
          .admin-prod-actions button{padding:4px 8px!important;font-size:11px!important}
          .admin-order-del{padding:4px 8px!important;font-size:11px!important}
          .admin-header-toolbar{flex-wrap:wrap!important}
        }
      `}</style>

      {/* Sidebar — desktop only */}
      <aside className="admin-sidebar">
        <div style={{ padding: "0 1.2rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="QualiFresh" style={{ height: "38px", width: "auto", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "2px" }} />
            <div>
              <div style={{ color: "#d9f99d", fontWeight: 700, fontSize: "14px", fontFamily: "Georgia,serif" }}>QualiFresh</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="admin-sidebar-nav">
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

      {/* Mobile tab bar — mobile only */}
      <div className="admin-mobile-nav">
        {navItems.map(item => (
          <button key={item.id} className="admin-mobile-nav-btn"
            onClick={() => setTab(item.id as any)}
            style={{ color: tab === item.id ? "#a3e635" : "rgba(255,255,255,0.55)", borderBottomColor: tab === item.id ? "#a3e635" : "transparent" }}>
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button className="admin-mobile-nav-btn" onClick={logout} style={{ color: "#fca5a5", borderBottomColor: "transparent" }}>
          <span style={{ fontSize: "18px" }}>🚪</span>
          Logout
        </button>
      </div>

      {/* Main content */}
      <main className="admin-main">

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
            <div className="admin-charts-row">
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
            <div className="admin-recent-row">
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

            <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Order #", "Customer", "Items", "Total", "Slot", "Date", "Status", "Update", ""].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>No orders found</td></tr>
                  )}
                  {filteredOrders.map(o => (
                    <tr key={o._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2d8a4e" }}>{o.orderNumber}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{o.guestName || o.user?.name || "Guest"}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{o.guestPhone || o.user?.phone || ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "220px" }}>
                          {o.items?.length > 0 ? o.items.map((i: any, idx: number) => (
                            <div key={idx} style={{ fontSize: "12px", color: "#374151", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px", alignItems: "baseline", paddingBottom: idx < o.items.length - 1 ? "3px" : 0, borderBottom: idx < o.items.length - 1 ? "1px dashed #f1f5f9" : "none" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {i.name}{i.variant ? <span style={{ color: "#9ca3af", fontSize: "11px" }}> ({i.variant})</span> : ""}
                                <span style={{ color: "#6b7280" }}> ×{i.quantity}</span>
                              </span>
                              <span style={{ color: "#9ca3af", fontSize: "11px", whiteSpace: "nowrap" }}>₹{i.price}/ea</span>
                              <span style={{ fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>₹{(i.price * i.quantity).toFixed(0)}</span>
                            </div>
                          )) : <span style={{ fontSize: "12px", color: "#9ca3af" }}>—</span>}
                        </div>
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
                      <td style={{ padding: "12px 14px" }}>
                        <button className="admin-order-del" onClick={() => deleteOrder(o._id, o.orderNumber)}
                          style={{ padding: "5px 10px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                          🗑 Delete
                        </button>
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
              <div className="admin-header-toolbar" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <input value={prodSearch} onChange={e => { setProdSearch(e.target.value); setProdPage(0); }} placeholder="Search products…"
                    style={{ padding: "8px " + (prodSearch ? "30px" : "12px") + " 8px 12px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "13px", background: "#fff", color: "#111827" }} />
                  {prodSearch && <button onClick={() => { setProdSearch(""); setProdPage(0); }} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "#e5e7eb", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", fontSize: "9px", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>}
                </div>
                <button onClick={loadProducts} disabled={prodLoading}
                  style={{ padding: "10px 14px", background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: prodLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                  {prodLoading ? "⏳" : "🔄"} Refresh
                </button>
                <button onClick={openAddProduct}
                  style={{ padding: "10px 20px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
                  + Add Product
                </button>
              </div>
            </div>

            {/* Error banner */}
            {prodError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>⚠ {prodError}</span>
                <button onClick={loadProducts} style={{ padding: "6px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Retry</button>
              </div>
            )}

            <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "650px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, fontSize: "11.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prodLoading && (
                    <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <div style={{ fontSize: "28px", animation: "spin 1s linear infinite" }}>⏳</div>
                        <span style={{ fontSize: "13px" }}>Loading products…</span>
                      </div>
                    </td></tr>
                  )}
                  {!prodLoading && pagedProducts.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#9ca3af" }}>
                        <span style={{ fontSize: "36px" }}>🥬</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{prodSearch ? "No products match your search" : "No products yet"}</span>
                        {!prodSearch && <button onClick={openAddProduct} style={{ padding: "8px 18px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>+ Add First Product</button>}
                      </div>
                    </td></tr>
                  )}
                  {pagedProducts.map(p => (
                    <tr key={p._id} style={{ borderTop: "1px solid #f1f5f9", opacity: p.isActive ? 1 : 0.55, background: p.isActive ? undefined : "#fffbeb" }}>
                      <td style={{ padding: "10px 14px" }}>
                        {p.imageUrl ? (
                          <img key={imgKey + "-" + p._id} src={p.imageUrl} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🥬</div>
                        )}
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
                        <div className="admin-prod-actions" style={{ display: "flex", gap: "6px" }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "12px" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: 0 }}>Customers <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: 400 }}>({users.length})</span></h1>
              <button onClick={openAddUser} style={{ padding: "9px 18px", background: "linear-gradient(135deg,#2d8a4e,#1f6b3a)", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(45,138,78,.25)" }}>
                + Add User
              </button>
            </div>
            <div className="admin-table-wrap" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "600px" }}>
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
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEditUser(u)} style={{ padding: "5px 12px", background: "#f0fdf4", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                          <button onClick={() => deleteUser(u._id)} style={{ padding: "5px 12px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Store Settings</h1>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Control what users see on the storefront.</p>
            </div>

            {/* ── Cart Visibility Card ── */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: "1.5rem", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "22px" }}>🛒</span>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Cart & Add to Cart Buttons</h2>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.7 }}>
                    When <strong>disabled</strong>, the Cart button, floating cart, and all "Add to Cart" buttons on the storefront are hidden. Users can still browse products. Useful during restocking or maintenance.
                  </p>
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", fontWeight: 700, background: cartEnabled ? "#f0fdf4" : "#fef2f2", color: cartEnabled ? "#16a34a" : "#ef4444" }}>
                      {cartEnabled ? "✓ Currently visible to users" : "✗ Hidden from users"}
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setCartEnabled(v => !v)}
                    style={{
                      width: "64px", height: "34px", borderRadius: "17px", border: "none", cursor: "pointer",
                      background: cartEnabled ? "linear-gradient(135deg,#2d8a4e,#16a34a)" : "#d1d5db",
                      position: "relative", transition: "background 0.3s", boxShadow: cartEnabled ? "0 2px 12px rgba(45,138,78,0.4)" : "none",
                    }}
                    title={cartEnabled ? "Click to hide cart" : "Click to show cart"}
                  >
                    <span style={{
                      position: "absolute", top: "3px", left: cartEnabled ? "33px" : "3px",
                      width: "28px", height: "28px", borderRadius: "50%", background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.22)", transition: "left 0.25s cubic-bezier(.4,0,.2,1)",
                    }} />
                  </button>
                  <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600 }}>{cartEnabled ? "ON" : "OFF"}</span>
                </div>
              </div>
            </div>

            {/* ── Farm Photos Card ── */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: "1.5rem", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "22px" }}>🌾</span>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Our Farms Section — Photos</h2>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>These photos appear in the "Our Farms" section on the homepage. Up to 6 recommended.</p>
                </div>
                <button onClick={() => openFarmModal()}
                  style={{ padding: "9px 18px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  + Add Photo
                </button>
              </div>

              {farmPhotos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem", color: "#9ca3af", border: "2px dashed #e5e7eb", borderRadius: "10px" }}>
                  <span style={{ fontSize: "32px" }}>📷</span>
                  <p style={{ margin: "8px 0 0", fontSize: "13px" }}>No farm photos yet. Click "+ Add Photo" to add one.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
                  {farmPhotos.map(photo => (
                    <div key={photo.id} style={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid #e9ede4", background: "#f9fafb", position: "relative" }}>
                      <div style={{ height: "130px", overflow: "hidden", position: "relative" }}>
                        <img src={photo.imageUrl} alt={photo.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=60&fit=crop"; }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 50%)" }} />
                        <div style={{ position: "absolute", bottom: "8px", left: "10px", right: "10px" }}>
                          <div style={{ color: "#fff", fontSize: "12px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.title || "Untitled"}</div>
                          {photo.description && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.description}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", padding: "8px 10px" }}>
                        <button onClick={() => openFarmModal(photo)} style={{ flex: 1, padding: "5px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                        <button onClick={() => deleteFarmPhoto(photo.id)} style={{ flex: 1, padding: "5px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Custom Categories Card ── */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: "1.5rem", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "22px" }}>🗂️</span>
                    <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Browse by Category</h2>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>Add custom categories. They appear on the homepage, product filters, and everywhere instantly.</p>
                </div>
                <button onClick={() => openCatModal()}
                  style={{ padding: "9px 18px", background: "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  + Add Category
                </button>
              </div>

              {/* Static categories (editable) */}
              <div style={{ marginBottom: "1.4rem" }}>
                <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Default Categories (from site config)</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                  {siteConfig.categories.map(c => {
                    const ov = categoryOverrides[c.key] || {};
                    const label = ov.label ?? c.label;
                    const color = ov.color ?? c.color;
                    const icon  = ov.icon  ?? c.icon;
                    const image = ov.image ?? c.image;
                    return (
                      <div key={c.key} style={{ borderRadius: "10px", overflow: "hidden", border: `2px solid ${color}22`, background: "#f9fafb" }}>
                        <div style={{ height: "80px", overflow: "hidden", position: "relative", background: image ? undefined : `${color}18` }}>
                          {image ? (
                            <img src={image} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "32px" }}>{icon}</div>
                          )}
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.4) 0%,transparent 55%)" }} />
                          <div style={{ position: "absolute", bottom: "6px", left: "8px", color: "#fff", fontSize: "12px", fontWeight: 700 }}>{icon} {label}</div>
                        </div>
                        <div style={{ padding: "6px 8px" }}>
                          <button onClick={() => openStaticCatEdit(c)} style={{ width: "100%", padding: "5px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Custom Categories</p>
              {customCategories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", border: "2px dashed #e5e7eb", borderRadius: "10px" }}>
                  <span style={{ fontSize: "28px" }}>🗂️</span>
                  <p style={{ margin: "8px 0 0", fontSize: "13px" }}>No custom categories yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px" }}>
                  {customCategories.map(cat => (
                    <div key={cat.id} style={{ borderRadius: "12px", overflow: "hidden", border: `2px solid ${cat.color}22`, background: "#f9fafb", position: "relative" }}>
                      <div style={{ height: "110px", overflow: "hidden", position: "relative", background: cat.image ? undefined : `${cat.color}18` }}>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "40px" }}>{cat.icon}</div>
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg,rgba(0,0,0,0.45) 0%,transparent 55%)" }} />
                        <div style={{ position: "absolute", bottom: "8px", left: "10px" }}>
                          <div style={{ color: "#fff", fontSize: "12.5px", fontWeight: 700 }}>{cat.icon} {cat.label}</div>
                        </div>
                        <div style={{ position: "absolute", top: "8px", right: "8px", width: "14px", height: "14px", borderRadius: "50%", background: cat.color, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.25)" }} />
                      </div>
                      <div style={{ display: "flex", gap: "6px", padding: "8px 10px" }}>
                        <button onClick={() => openCatModal(cat)} style={{ flex: 1, padding: "5px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                        <button onClick={() => deleteCat(cat.id)} style={{ flex: 1, padding: "5px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => saveSettings(cartEnabled, farmPhotos)}
                style={{ padding: "13px 36px", background: "linear-gradient(135deg,#2d8a4e,#16a34a)", color: "#fff", border: "none", borderRadius: "11px", fontWeight: 800, fontSize: "14.5px", cursor: "pointer", boxShadow: "0 4px 16px rgba(45,138,78,0.35)", display: "flex", alignItems: "center", gap: "8px" }}>
                💾 Save Settings
              </button>
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
              {prodForm.imageUrl && (
                <img src={prodForm.imageUrl} alt=""
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
                {[...siteConfig.categories, ...customCategories.map(c => ({ key: c.key, label: c.label }))].map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
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
            <button onClick={saveProd} disabled={uploading}
              style={{ padding: "10px 24px", background: uploading ? "#86efac" : "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: uploading ? "not-allowed" : "pointer", fontWeight: 700, opacity: uploading ? 0.6 : 1 }}>
              {editProd ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Farm Photo Modal ── */}
      {showFarmModal && (
        <Modal onClose={() => setShowFarmModal(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{editingFarm ? "Edit Farm Photo" : "Add Farm Photo"}</h2>
            <button onClick={() => setShowFarmModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>

          {/* Photo preview */}
          {farmForm.imageUrl && (
            <div style={{ height: "160px", borderRadius: "10px", overflow: "hidden", marginBottom: "14px", background: "#f1f5f9" }}>
              <img src={farmForm.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}

          {/* Image upload */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Photo</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <input ref={farmFileRef} type="file" accept={ALLOWED_EXT.join(",")} onChange={uploadFarmImage} style={{ display: "none" }} />
              <button onClick={() => { setFarmUploadError(null); farmFileRef.current?.click(); }} disabled={farmUploading}
                style={{ padding: "8px 14px", background: "#f0fdf4", color: "#2d8a4e", border: "2px dashed #86efac", borderRadius: "8px", cursor: farmUploading ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600 }}>
                {farmUploading ? "⏳ Uploading…" : "📁 Upload Photo"}
              </button>
              <span style={{ fontSize: "12px", color: "#9ca3af", alignSelf: "center" }}>or</span>
              <input value={farmForm.imageUrl} onChange={e => setFarmForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Paste image URL…"
                style={{ ...inputStyle, flex: 1, minWidth: "160px" }} />
            </div>
            {farmUploadError && <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "#dc2626" }}>⚠ {farmUploadError}</p>}
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Title</label>
            <input value={farmForm.title} onChange={e => setFarmForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Our Main Farm" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Caption <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
            <input value={farmForm.description} onChange={e => setFarmForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Sun-drenched fields in Pune" style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowFarmModal(false)} style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={saveFarmPhoto} disabled={!farmForm.imageUrl || farmUploading}
              style={{ padding: "10px 24px", background: !farmForm.imageUrl || farmUploading ? "#86efac" : "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: !farmForm.imageUrl || farmUploading ? "not-allowed" : "pointer", fontWeight: 700, opacity: !farmForm.imageUrl || farmUploading ? 0.7 : 1 }}>
              {editingFarm ? "Save Changes" : "Add Photo"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <Modal onClose={() => setShowCatModal(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{editingStaticKey ? "Edit Default Category" : editingCat ? "Edit Category" : "Add Category"}</h2>
            <button onClick={() => setShowCatModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Category Image <span style={{ color: "#9ca3af", fontWeight: 400 }}>(saved to /public/category)</span></label>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
              {catForm.image && (
                <img src={catForm.image} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "2px solid #e5e7eb", flexShrink: 0 }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <input ref={catFileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={uploadCatImage} style={{ display: "none" }} />
                <button onClick={() => { setCatUploadError(null); catFileRef.current?.click(); }} disabled={catUploading}
                  style={{ padding: "9px 16px", background: "#f0fdf4", color: "#2d8a4e", border: "2px dashed #86efac", borderRadius: "8px", cursor: catUploading ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  {catUploading ? "⏳ Uploading…" : "📁 Upload Image"}
                </button>
                <input value={catForm.image} onChange={e => setCatForm(f => ({ ...f, image: e.target.value }))} placeholder="Or paste image URL"
                  style={{ ...inputStyle, fontSize: "12px", marginTop: "6px" }} />
                {catUploadError && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#dc2626" }}>⚠ {catUploadError}</p>}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Category Name *</label>
            <input value={catForm.label} onChange={e => setCatForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Exotic Fruits" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Icon (emoji)</label>
            <input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} placeholder="🥦" style={{ ...inputStyle, width: "80px" }} maxLength={4} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Accent Color</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CAT_COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setCatForm(f => ({ ...f, color: c }))}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", background: c, border: catForm.color === c ? "3px solid #111" : "2px solid transparent", cursor: "pointer", boxShadow: catForm.color === c ? "0 0 0 2px #fff inset" : undefined, transition: "all .15s" }} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowCatModal(false)} style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={saveCatEntry} disabled={catUploading}
              style={{ padding: "10px 24px", background: catUploading ? "#86efac" : "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: catUploading ? "not-allowed" : "pointer", fontWeight: 700 }}>
              {editingStaticKey || editingCat ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── User Modal ── */}
      {showUserModal && (
        <Modal onClose={() => setShowUserModal(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>{editingUser ? "Edit User" : "Add User"}</h2>
            <button onClick={() => setShowUserModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
          </div>

          <Field label="Full Name" required>
            <input style={inputStyle} value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahul Sharma" />
          </Field>
          <Field label="Email" required>
            <input style={inputStyle} type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
          </Field>
          <Field label="Phone">
            <input style={inputStyle} type="tel" value={userForm.phone} onChange={e => setUserForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" />
          </Field>
          <Field label={editingUser ? "New Password (leave blank to keep current)" : "Password"} required={!editingUser}>
            <input style={inputStyle} type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder={editingUser ? "Leave blank to keep current" : "Set a password"} />
          </Field>
          <Field label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setUserForm(f => ({ ...f, isActive: !f.isActive }))}
                style={{ width: "52px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer", background: userForm.isActive ? "#2d8a4e" : "#d1d5db", position: "relative", transition: "background .2s" }}>
                <span style={{ position: "absolute", top: "3px", left: userForm.isActive ? "26px" : "3px", width: "22px", height: "22px", borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
              </button>
              <span style={{ fontSize: "13px", color: userForm.isActive ? "#16a34a" : "#6b7280", fontWeight: 600 }}>{userForm.isActive ? "Active" : "Inactive"}</span>
            </div>
          </Field>

          {userFormErr && <div style={{ background: "#fef2f2", color: "#ef4444", borderRadius: "8px", padding: "9px 14px", fontSize: "13px", marginBottom: "12px" }}>{userFormErr}</div>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button onClick={() => setShowUserModal(false)} style={{ padding: "10px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "9px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={saveUser} disabled={userSaving}
              style={{ padding: "10px 24px", background: userSaving ? "#86efac" : "#2d8a4e", color: "#fff", border: "none", borderRadius: "9px", cursor: userSaving ? "not-allowed" : "pointer", fontWeight: 700 }}>
              {userSaving ? "Saving…" : editingUser ? "Save Changes" : "Add User"}
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
