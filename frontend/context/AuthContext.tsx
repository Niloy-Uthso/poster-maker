"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { id: string; name?: string; email?: string; role?: string };
type AuthCtx = {
  token: string;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // read saved login once when the app starts
  useEffect(() => {
  try {
    const t = localStorage.getItem("t");
    const u = localStorage.getItem("u");
    if (t && u) {
      const parsed = JSON.parse(u);
      if (!parsed || typeof parsed !== "object" || !parsed.id) throw new Error("old format");
      setToken(t); setUser(parsed);
    }
  } catch {
    localStorage.removeItem("t");
    localStorage.removeItem("u");
  }
  setLoading(false);
}, []);

  const login = (t: string, u: User) => {
    localStorage.setItem("t", t);
    localStorage.setItem("u", JSON.stringify(u));
    setToken(t); setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("t");
    localStorage.removeItem("u");
    setToken(""); setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}