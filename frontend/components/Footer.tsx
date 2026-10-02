"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { token, loading } = useAuth();

  return (
    <footer className="mt-10 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 text-lg font-bold text-white">পোস্টার মেকার</h3>
          <p className="text-sm text-gray-400">
            Create print-ready political posters in Bangla in minutes, with AI-assisted design.
          </p>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Quick links</h4>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:text-white hover:underline">Home</Link></li>
            {!loading && token ? (
              <>
                <li><Link href="/make-poster" className="hover:text-white hover:underline">Make Poster</Link></li>
                <li><Link href="/my-posters" className="hover:text-white hover:underline">My Posters</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-white hover:underline">Login</Link></li>
                <li><Link href="/register" className="hover:text-white hover:underline">Register</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-white">Please note</h4>
          <p className="text-sm text-gray-400">
            Use only photos and symbols you have permission to use. Content that is defamatory or misleading is not allowed.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} পোস্টার মেকার. All rights reserved.
      </div>
    </footer>
  );
}