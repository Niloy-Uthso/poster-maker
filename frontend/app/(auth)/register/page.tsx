"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API || "http://localhost:4000";
const input = "mb-3 w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-brand";

export default function RegisterPage() {
  const { token, loading, login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && token) router.replace("/"); }, [loading, token, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) return setErr("Password must be at least 6 characters");
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Registration failed");
      login(d.token, d.user);
      router.push("/");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-7 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Create account</h2>
        <input className={input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className={input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)} required />
        {err && <p className="mb-3 text-red-600">{err}</p>}
        <button disabled={busy} className="w-full cursor-pointer rounded-lg bg-brand py-2.5 text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? "Creating…" : "Register"}
        </button>
        <p className="mt-4">Already have an account? <Link href="/login" className="text-brand underline">Login</Link></p>
        <p className="mt-2"><Link href="/" className="text-sm text-gray-600 hover:underline">← Back to home</Link></p>
      </form>
    </main>
  );
}