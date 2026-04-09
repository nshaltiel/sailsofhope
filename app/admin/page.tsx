"use client";

import { useState } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [created, setCreated] = useState<{ slug: string; host_code: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data?.slug) setCreated({ slug: data.slug, host_code: data.host_code });
      else alert("שגיאה ביצירת סדנה: " + (data?.error || ""));
    } catch (e) {
      alert("שגיאת רשת — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white p-6 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full border-t-8 border-orange-500">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-black text-sky-900 mb-1">מפרשים של תקווה</h1>
            <p className="text-slate-500 text-sm">ממשק מנהל</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 text-sm font-bold">
            התנתק
          </button>
        </div>

        {!created ? (
          <>
            <label className="block text-sm font-bold text-sky-900 mb-2">כותרת הסדנה (לא חובה)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && create()}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-0 text-lg mb-6"
              placeholder="למשל: סדנת חוסן למנהלי בתי ספר"
            />
            <button
              onClick={create}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl w-full text-lg disabled:opacity-50"
            >
              {loading ? "יוצר..." : "צור סדנה חדשה"}
            </button>
          </>
        ) : (
          <div className="space-y-5">
            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200">
              <div className="text-sm font-bold text-sky-900 mb-2">🖥️ קישור למסך הקרנה (מסך גדול)</div>
              <a className="text-sky-700 underline break-all text-sm" href={`/${created.slug}`} target="_blank" rel="noreferrer">
                {origin}/{created.slug}
              </a>
            </div>
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-200">
              <div className="text-sm font-bold text-orange-900 mb-2">📱 קישור למשתתפים (נייד — שתפו זה!)</div>
              <a className="text-orange-700 underline break-all text-sm" href={`/${created.slug}/join`} target="_blank" rel="noreferrer">
                {origin}/{created.slug}/join
              </a>
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-300">
              <div className="text-sm font-bold text-amber-900 mb-2">🔑 קוד מנחה (שמרו!)</div>
              <div className="text-3xl font-black tracking-widest text-amber-900">{created.host_code}</div>
              <a
                className="inline-block mt-3 bg-sky-900 text-amber-300 font-bold py-2 px-5 rounded-xl text-sm"
                href={`/${created.slug}/host?code=${created.host_code}`}
                target="_blank"
                rel="noreferrer"
              >
                פתח מסך ניהול ←
              </a>
            </div>
            <button
              onClick={() => { setCreated(null); setTitle(""); }}
              className="w-full text-slate-500 hover:text-sky-900 font-bold py-2 text-sm"
            >
              + צור סדנה נוספת
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
