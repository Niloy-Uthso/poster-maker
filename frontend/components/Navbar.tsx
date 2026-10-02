"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-brand px-6 py-3.5 shadow-md">
      <Link href="/" className="text-xl font-bold text-white">পোস্টার মেকার</Link>

      <div className="flex items-center gap-5">
        {!loading && (token ? (
          <>
            <Link href="/make-poster" className="font-medium text-white hover:underline">Make Poster</Link>
            <Link href="/my-posters" className="font-medium text-white hover:underline">My Posters</Link>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="cursor-pointer rounded-md border border-white px-3.5 py-1.5 text-white hover:bg-white/10"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="font-medium text-white hover:underline">Login</Link>
        ))}
      </div>
    </nav>
  );
}