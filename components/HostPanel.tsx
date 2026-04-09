"use client";

import { useEffect, useState } from "react";

type Action = { id: string; session_id: string; text: string; created_at: number };

export default function HostPanel({
  sessionId,
  slug,
  hostCode,
}: {
  sessionId: string;
  slug: string;
  hostCode: string;
}) {
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/actions?sessionId=${sessionId}`);
        if (res.ok) {
          const data: Action[] = await res.json();
          setActions(data.slice().reverse()); // newest first
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setTimeout(poll, 2000);
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  async function del(id: string) {
    if (!confirm("למחוק את הפעולה הזו?")) return;
    const res = await fetch("/api/actions/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action_id: id, host_code: hostCode }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("מחיקה נכשלה: " + (j?.error || res.status));
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-sky-900">ניהול סדנה</h1>
          <div className="flex gap-3">
            <a href={`/${slug}`} target="_blank" className="bg-sky-900 text-amber-300 font-bold py-2 px-4 rounded-xl text-sm">
              🖥️ מסך הקרנה
            </a>
            <a href={`/${slug}/join`} target="_blank" className="bg-orange-500 text-white font-bold py-2 px-4 rounded-xl text-sm">
              📱 מסך משתתפים
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow mb-6 text-sm text-slate-600">
          קישור משתתפים לשיתוף:{" "}
          <span className="font-mono text-sky-800 select-all">{origin}/{slug}/join</span>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-sky-900 text-white p-4 font-bold">
            פעולות בסדנה ({actions.length})
          </div>
          <ul className="divide-y divide-slate-100">
            {actions.length === 0 && (
              <li className="p-6 text-center text-slate-400">אין פעולות עדיין</li>
            )}
            {actions.map((a) => (
              <li key={a.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sky-900 font-medium">{a.text}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleString("he-IL")}
                  </div>
                </div>
                <button
                  onClick={() => del(a.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-xl text-sm"
                >
                  מחק
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
