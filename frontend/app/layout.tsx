import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = { title: "AI Poster Maker" };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-[#f6f7f9] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}