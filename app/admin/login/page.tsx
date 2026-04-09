"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setError(data?.error || "שגיאה");
      }
    } catch {
      setError("שגיאת רשת — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full border-t-8 border-sky-900">
        <h1 className="text-3xl font-black text-sky-900 mb-1">כניסת מנהל</h1>
        <p className="text-slate-500 text-sm mb-8">מפרשים של תקווה</p>

        <label className="block text-sm font-bold text-sky-900 mb-1">שם משתמש</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && login()}
          className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-sky-900 focus:ring-0 text-lg mb-4"
          autoComplete="username"
        />

        <label className="block text-sm font-bold text-sky-900 mb-1">סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && login()}
          className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-sky-900 focus:ring-0 text-lg mb-6"
          autoComplete="current-password"
        />

        {error && <div className="text-red-600 font-bold text-sm mb-4 text-center">{error}</div>}

        <button
          onClick={login}
          disabled={loading}
          className="bg-sky-900 hover:bg-sky-950 text-white font-bold py-4 px-8 rounded-2xl shadow-xl w-full text-lg disabled:opacity-50"
        >
          {loading ? "נכנס..." : "כניסה"}
        </button>
      </div>
    </main>
  );
}
