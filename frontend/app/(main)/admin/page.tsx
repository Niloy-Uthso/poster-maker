"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API || "http://localhost:4000";
const input = "w-full rounded-lg border border-gray-300 p-2 outline-none focus:border-brand";
const card = "rounded-xl bg-white p-5 shadow";
const DECOS = ["flag", "paddy", "doves", "floral", "candles"];
const emptyT = { title: "", occasionType: "", isActive: true, photoSlots: 3, bg1: "#006a4e", bg2: "#003d2c", accent: "#f42a41", text: "#ffffff", decoration: "flag" };

export default function AdminPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "templates" | "posters">("stats");
  const [stats, setStats] = useState<any>(null);
  const [tpls, setTpls] = useState<any[]>([]);
  const [posters, setPosters] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyT);
  const [editId, setEditId] = useState("");
  const [err, setErr] = useState("");

  const isAdmin = user?.role === "admin";

  // guard: must be logged in AND admin
  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
    else if (!isAdmin) router.replace("/");
  }, [loading, token, isAdmin, router]);

  const call = useCallback(async (path: string, opts: any = {}) => {
    const r = await fetch(API + path, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Request failed");
    return j;
  }, [token]);

  const load = useCallback(async () => {
    try {
      setStats(await call("/api/admin/stats"));
      setTpls(await call("/api/admin/templates"));
      setPosters(await call("/api/admin/posters"));
    } catch (e: any) { setErr(e.message); }
  }, [call]);

  useEffect(() => { if (token && isAdmin) load(); }, [token, isAdmin, load]);

  const saveTemplate = async () => {
    setErr("");
    const body = {
      title: form.title, occasionType: form.occasionType, isActive: form.isActive,
      layoutConfig: {
        photoSlots: Number(form.photoSlots),
        palette: { bg1: form.bg1, bg2: form.bg2, accent: form.accent, text: form.text, decoration: form.decoration, photoFocus: "top" },
      },
    };
    try {
      await call(editId ? `/api/admin/templates/${editId}` : "/api/admin/templates",
        { method: editId ? "PATCH" : "POST", body: JSON.stringify(body) });
      setForm(emptyT); setEditId(""); load();
    } catch (e: any) { setErr(e.message); }
  };

  const editTemplate = (t: any) => {
    const c = t.layoutConfig || {}, p = c.palette || {};
    setEditId(t._id);
    setForm({ ...emptyT, ...p, title: t.title, occasionType: t.occasionType, isActive: t.isActive, photoSlots: c.photoSlots || 3 });
  };

  const removeTemplate = async (id: string) => {
    if (!confirm("Delete this template? Deactivating it is safer.")) return;
    try { await call(`/api/admin/templates/${id}`, { method: "DELETE" }); load(); } catch (e: any) { setErr(e.message); }
  };

  const toggleBlock = async (p: any) => {
    try { await call(`/api/admin/posters/${p._id}/block`, { method: "PATCH", body: JSON.stringify({ blocked: !p.blocked }) }); load(); }
    catch (e: any) { setErr(e.message); }
  };

  const removePoster = async (id: string) => {
    if (!confirm("Delete this poster permanently?")) return;
    try { await call(`/api/posters/${id}`, { method: "DELETE" }); load(); } catch (e: any) { setErr(e.message); }
  };

  if (loading || !token || !isAdmin) return <p className="p-8 text-center text-gray-500">Loading…</p>;

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const tabBtn = (k: typeof tab, label: string) => (
    <button onClick={() => setTab(k)}
      className={`cursor-pointer rounded-lg px-4 py-2 ${tab === k ? "bg-brand text-white" : "bg-white hover:bg-gray-100"}`}>{label}</button>
  );

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Admin</h1>
      <div className="mb-4 flex gap-2">{tabBtn("stats", "Usage")}{tabBtn("templates", "Templates")}{tabBtn("posters", "Moderation")}</div>
      {err && <p className="mb-3 text-red-600">{err}</p>}

      {tab === "stats" && stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Users", stats.users], ["Posters", stats.posters], ["Completed", stats.completed],
            ["Failed", stats.failed], ["Blocked", stats.blocked], ["Avg generation", `${(stats.avgLatencyMs / 1000).toFixed(1)} s`]].map(([k, v]) => (
            <div key={k as string} className={card}><p className="text-sm text-gray-500">{k}</p><p className="text-3xl font-semibold">{v}</p></div>
          ))}
        </div>
      )}

      {tab === "templates" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <h3 className="mb-3 font-semibold">{editId ? "Edit template" : "New template"}</h3>
            <div className="space-y-2">
              <input className={input} placeholder="Title" value={form.title} onChange={e => set("title", e.target.value)} />
              <input className={input} placeholder="Occasion (e.g. বিজয় দিবস)" value={form.occasionType} onChange={e => set("occasionType", e.target.value)} />
              <div className="flex gap-2">
                <select className={input} value={form.photoSlots} onChange={e => set("photoSlots", e.target.value)}>
                  {[1, 2, 3].map(n => <option key={n} value={n}>{n} photo{n > 1 ? "s" : ""}</option>)}
                </select>
                <select className={input} value={form.decoration} onChange={e => set("decoration", e.target.value)}>
                  {DECOS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {(["bg1", "bg2", "accent", "text"] as const).map(k => (
                  <label key={k} className="flex flex-col items-center">{k}
                    <input type="color" value={form[k]} onChange={e => set(k, e.target.value)} className="h-9 w-12 cursor-pointer" />
                  </label>
                ))}
                <label className="ml-auto flex items-center gap-1">
                  <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} /> Active
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={saveTemplate} className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">{editId ? "Save changes" : "Add template"}</button>
                {editId && <button onClick={() => { setEditId(""); setForm(emptyT); }} className="cursor-pointer rounded-lg border px-4 py-2">Cancel</button>}
              </div>
            </div>
          </div>

          <div className={card}>
            <h3 className="mb-3 font-semibold">All templates</h3>
            {tpls.map(t => (
              <div key={t._id} className="mb-2 flex items-center gap-2">
                <span className="h-5 w-5 rounded" style={{ background: t.layoutConfig?.palette?.bg1 }} />
                <span className="flex-1 truncate">{t.title} <span className="text-xs text-gray-500">({t.occasionType}){!t.isActive && " · inactive"}</span></span>
                <button onClick={() => editTemplate(t)} className="cursor-pointer rounded border px-2 py-0.5 hover:bg-gray-100">Edit</button>
                <button onClick={() => removeTemplate(t._id)} className="cursor-pointer rounded border border-red-300 px-2 py-0.5 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "posters" && (
        <div className={card}>
          <h3 className="mb-3 font-semibold">Latest posters (newest first)</h3>
          {posters.length === 0 && <p className="text-gray-500">No posters yet.</p>}
          {posters.map(p => (
            <div key={p._id} className="mb-3 flex items-center gap-3 border-b pb-3">
              {p.generatedImageUrl
                ? <a href={p.generatedImageUrl} target="_blank"><img src={p.generatedImageUrl} alt="" className="h-20 w-14 rounded object-cover" /></a>
                : <div className="h-20 w-14 rounded bg-gray-100" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.formData?.headline} — {p.formData?.name}</p>
                <p className="truncate text-sm text-gray-500">{p.userId?.email || "unknown user"} · {p.status} · {new Date(p.createdAt).toLocaleString()}</p>
                {p.blocked && <span className="text-sm font-medium text-red-600">Blocked</span>}
              </div>
              <button onClick={() => toggleBlock(p)} className="cursor-pointer rounded border px-3 py-1 hover:bg-gray-100">{p.blocked ? "Unblock" : "Block"}</button>
              <button onClick={() => removePoster(p._id)} className="cursor-pointer rounded border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}