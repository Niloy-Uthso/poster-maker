"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API || "http://localhost:4000";

export default function MyPostersPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [posters, setPosters] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");

  // route guard
  useEffect(() => { if (!loading && !token) router.replace("/login"); }, [loading, token, router]);

  const call = useCallback(async (path: string, opts: any = {}) => {
    const r = await fetch(API + path, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Request failed");
    return j;
  }, [token]);

  useEffect(() => {
  if (!token) return;
  if (!user) { setFetching(false); return; }
  call(`/api/posters/user/${user.id}`)
    .then(setPosters)
    .catch((e: any) => setErr(e.message))
    .finally(() => setFetching(false));
}, [token, user, call]);

  const del = async (id: string) => {
    if (!confirm("Delete this poster?")) return;
    try {
      await call(`/api/posters/${id}`, { method: "DELETE" });
      setPosters(p => p.filter(x => x._id !== id));
    } catch (e: any) { setErr(e.message); }
  };

  if (loading || !token) return <p className="p-8 text-center text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Posters</h1>
        <Link href="/make-poster" className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-dark">+ New poster</Link>
      </div>

      {err && <p className="mb-3 text-red-600">{err}</p>}
      {fetching && <p className="text-gray-500">Loading your posters…</p>}

      {!fetching && posters.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="mb-3 text-gray-600">You haven&apos;t made any posters yet.</p>
          <Link href="/make-poster" className="text-brand underline">Make your first poster</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map(p => (
          <div key={p._id} className="overflow-hidden rounded-xl bg-white shadow">
            <div className="flex aspect-[3/4] items-center justify-center bg-gray-100">
              {p.status === "completed" && p.generatedImageUrl ? (
                <img src={p.generatedImageUrl} alt={p.formData?.headline} className="h-full w-full object-cover" />
              ) : p.status === "failed" ? (
                <span className="px-4 text-center text-red-600">Failed to generate</span>
              ) : (
                <span className="text-gray-500">Generating…</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="truncate font-semibold">{p.formData?.headline || "Untitled"}</h3>
              <p className="truncate text-sm text-gray-600">{p.formData?.name}</p>
              <p className="mb-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</p>
              <div className="flex items-center gap-2">
                {p.generatedImageUrl && (
                  <a href={p.generatedImageUrl} target="_blank"
                    className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark">Open / Download</a>
                )}
                <button onClick={() => del(p._id)}
                  className="cursor-pointer rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}