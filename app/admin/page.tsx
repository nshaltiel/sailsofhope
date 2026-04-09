"use client";

import { useEffect, useState } from "react";

type SessionItem = {
  id: string;
  slug: string;
  title: string | null;
  host_code: string;
  created_at: number;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [created, setCreated] = useState<{ slug: string; host_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoadingSessions(false);
    }
  }

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data?.slug) {
        setCreated({ slug: data.slug, host_code: data.host_code });
        setTitle("");
        fetchSessions();
      } else {
        alert("שגיאה ביצירת סדנה: " + (data?.error || ""));
      }
    } catch {
      alert("שגיאת רשת — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-sky-900">מפרשים של תקווה</h1>
            <p className="text-slate-500 text-sm mt-1">ממשק מנהל</p>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 text-sm font-bold">
            התנתק
          </button>
        </div>

        {/* Create session */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-orange-500">
          <h2 className="text-xl font-black text-sky-900 mb-5">צור סדנה חדשה</h2>

          {!created ? (
            <>
              <label className="block text-sm font-bold text-sky-900 mb-2">כותרת הסדנה (לא חובה)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && create()}
                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-0 text-lg mb-4"
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
            <div className="space-y-4">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200">
                <div className="text-xs font-bold text-sky-900 mb-1">🖥️ מסך הקרנה</div>
                <a className="text-sky-700 underline break-all text-sm" href={`/${created.slug}`} target="_blank" rel="noreferrer">
                  {origin}/{created.slug}
                </a>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
                <div className="text-xs font-bold text-orange-900 mb-1">📱 קישור למשתתפים — שתף זה!</div>
                <a className="text-orange-700 underline break-all text-sm" href={`/${created.slug}/join`} target="_blank" rel="noreferrer">
                  {origin}/{created.slug}/join
                </a>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300">
                <div className="text-xs font-bold text-amber-900 mb-1">🔑 קוד מנחה</div>
                <div className="text-2xl font-black tracking-widest text-amber-900">{created.host_code}</div>
                <a
                  className="inline-block mt-2 bg-sky-900 text-amber-300 font-bold py-2 px-4 rounded-xl text-sm"
                  href={`/${created.slug}/host?code=${created.host_code}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  פתח מסך ניהול ←
                </a>
              </div>
              <button
                onClick={() => setCreated(null)}
                className="w-full text-slate-400 hover:text-sky-900 font-bold py-2 text-sm"
              >
                + צור סדנה נוספת
              </button>
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-sky-900 text-white px-8 py-5 flex justify-between items-center">
            <h2 className="text-xl font-black">כל הסדנאות ({sessions.length})</h2>
            <button onClick={fetchSessions} className="text-sky-200 hover:text-white text-sm">
              רענן
            </button>
          </div>

          {loadingSessions ? (
            <div className="p-8 text-center text-slate-400">טוען...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">אין סדנאות עדיין</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <li key={s.id} className="p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-bold text-sky-900">
                      {s.title || <span className="text-slate-400 font-normal">ללא כותרת</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(s.created_at).toLocaleString("he-IL")} · <span className="font-mono">{s.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={`/${s.slug}`}
                      target="_blank"
                      className="bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      🖥️ הקרנה
                    </a>
                    <a
                      href={`/${s.slug}/join`}
                      target="_blank"
                      className="bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      📱 משתתפים
                    </a>
                    <a
                      href={`/${s.slug}/host?code=${s.host_code}`}
                      target="_blank"
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      🔑 ניהול
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}
