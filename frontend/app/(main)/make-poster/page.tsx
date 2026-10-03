"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API || "http://localhost:4000";
const input = "mb-3 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-brand";
const card = "mb-4 rounded-xl bg-white p-5 shadow";

export default function MakePosterPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  const [tpls, setTpls] = useState<any[]>([]);
  const [tpl, setTpl] = useState("");
  const [f, setF] = useState<any>({ name: "", designation: "", party: "", union: "", district: "", headline: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const [poster, setPoster] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
const [instructions, setInstructions] = useState("");

useEffect(() => { 
  if (!loading && !token) 
    router.replace("/login"); }, 

  [loading, token, router]);

  const call = useCallback(async (path: string, opts: any = {}) => {
    const r = await fetch(API + path, {
      ...opts,
      headers: {
        ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
      },
    });
    const j = await r.json();
    if (!r.ok) 
      throw new Error(j.error || "Request failed");
    return j;
  }, [token]);

  const loadHist = useCallback(async () => {
    if (!user)
       return;
    try { 
      setHist(await call(`/api/posters/user/${user.id}`));
     } catch {}
  }, [call, user]);


  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/templates`).then(r => r.json()).then(d => { setTpls(d); setTpl(d[0]?._id || ""); });
    loadHist();
  }, [token, loadHist]);


  useEffect(() => {
   if (!poster || !["draft", "generating"].includes(poster.status))
     return;
    
    const id = setInterval(async () => {
      try {
        const p = await call(`/api/posters/${poster._id}`);
        setPoster(p);
        if (!["draft", "generating"].includes(p.status)) { setBusy(false); loadHist(); }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [poster, call, loadHist]);

  const addPhoto = async (file?: File) => {
    if (!file || photos.length >= 3) return;
    setErr("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const { url } = await call("/api/upload", { method: "POST", body: fd });
      setPhotos(p => [...p, url]);
    } catch (e: any) { setErr(e.message); }
  };

 const run = async (path: string, body: any) => {
  setErr(""); setBusy(true);
  try {
    const p = await call(path, { method: "POST", body: JSON.stringify(body) });
    setPoster(p);
    if (p.status !== "generating") { setBusy(false); loadHist(); }
  } catch (e: any) { setErr(e.message); setBusy(false); }
};

  const create = () => run("/api/posters", {
    templateId: tpl,
    formData: { ...f, occasion: tpls.find(t => t._id === tpl)?.occasionType },
    photos,
  });
  const regen = () => run(`/api/posters/${poster._id}/regenerate`, { formData: f, instructions });

  const del = async (id: string) => {
    try { await call(`/api/posters/${id}`, { method: "DELETE" }); if (poster?._id === id) setPoster(null); loadHist(); }
    catch (e: any) { setErr(e.message); }
  };

  if (loading || !token) 
    return <p className="p-8 text-center text-gray-500">Loading…</p>;

  const field = (k: string, label: string) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input className={`${input} mt-1 font-normal`} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
    </label>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-4 lg:grid-cols-2">
      <div>
        <div className={card}>
          <h3 className="mb-3 text-lg font-semibold">১. টেমপ্লেট ও তথ্য</h3>
          <select className={input} value={tpl} onChange={e => setTpl(e.target.value)}>
            {tpls.map(t => <option key={t._id} value={t._id}>{t.title} ({t.occasionType})</option>)}
          </select>
          {field("headline", "শিরোনাম (Bangla headline)*")}
          {field("name", "নাম*")}
          {field("designation", "পদবি")}
          {field("party", "দল/সংগঠন")}
          {field("union", "ইউনিয়ন/থানা")}
          {field("district", "জেলা")}

          <label className="block text-sm font-medium text-gray-700">
            ছবি (max 3)
            <input type="file" accept="image/*" className={`${input} mt-1 font-normal`}
              onChange={e => { addPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <div className="mb-3 flex gap-2">
            {photos.map(u => (
              <div key={u} className="relative">
                <img src={u} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <button onClick={() => setPhotos(p => p.filter(x => x !== u))}
                  className="absolute -right-1 -top-1 h-5 w-5 cursor-pointer rounded-full bg-red-600 text-xs text-white">×</button>
              </div>
            ))}
          </div>

          <button onClick={create} disabled={busy}
            className="cursor-pointer rounded-lg bg-brand px-5 py-2.5 text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? "তৈরি হচ্ছে…" : "পোস্টার তৈরি করুন"}
          </button>
          {err && <p className="mt-3 text-red-600">{err}</p>}
        </div>

        <div className={card}>
          <h3 className="mb-3 text-lg font-semibold">ইতিহাস</h3>
          {hist.length === 0 && <p className="text-gray-500">No posters yet.</p>}
          {hist.map(p => (
            <div key={p._id} className="mb-2 flex items-center gap-2">
              <span className="flex-1 truncate">{p.formData?.headline} — {p.status}</span>
              {p.generatedImageUrl && <a href={p.generatedImageUrl} target="_blank" className="text-brand underline">Download</a>}
              {/* <button onClick={() => setPoster(p)} className="cursor-pointer rounded border px-2 py-0.5 hover:bg-gray-100">View</button> */}
              <button onClick={() => { setPoster(p); setF((old: any) => ({ ...old, ...p.formData })); }} className="cursor-pointer rounded border px-2 py-0.5 hover:bg-gray-100" >View</button>
              <button onClick={() => del(p._id)} className="cursor-pointer rounded border px-2 py-0.5 hover:bg-gray-100">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} self-start`}>
        <h3 className="mb-3 text-lg font-semibold">২. প্রিভিউ</h3>
        {!poster && <p className="text-gray-500">Fill the form and generate.</p>}
        {poster?.status === "generating" && <p>AI পোস্টার তৈরি করছে…</p>}
        {poster?.status === "failed" && <p className="text-red-600">Failed: {poster.error}</p>}
        {poster?.status === "completed" && poster.generatedImageUrl && (
          <>
            <img src={poster.generatedImageUrl} alt="Generated poster" className="w-full rounded-lg" />
            {poster.error && <p className="mt-2 text-sm text-amber-600">{poster.error}</p>}
<textarea
  value={instructions}
  onChange={e => setInstructions(e.target.value)}
  maxLength={300}
  rows={3}
  placeholder="e.g. make the background red, use paddy decoration, bigger headline | যেমন: ব্যাকগ্রাউন্ড লাল করো, কবুতর দাও"
  className="mt-3 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-brand"
/>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={poster.generatedImageUrl} target="_blank"
                className="rounded-lg bg-brand px-4 py-2.5 text-white hover:bg-brand-dark">Open / Download PNG (2400×3200)</a>
              <button onClick={regen} disabled={busy}
                className="cursor-pointer rounded-lg bg-gray-700 px-4 py-2.5 text-white hover:bg-gray-800 disabled:opacity-60">
                Regenerate with edits ({poster.retries}/3)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}