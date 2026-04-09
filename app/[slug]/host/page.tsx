"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase, type Action } from "@/lib/supabase";

export default function HostPage() {
  const { slug } = useParams<{ slug: string }>();
  const code = useSearchParams().get("code") || "";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, host_code")
        .eq("slug", slug)
        .single();
      if (error || !data) {
        setError("סדנה לא נמצאה");
        return;
      }
      if (data.host_code !== code) {
        setError("קוד מנחה שגוי");
        return;
      }
      setSessionId(data.id);
      setVerified(true);
    })();
  }, [slug, code]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("actions")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (!cancelled && data) setActions(data as Action[]);
    })();

    const ch = supabase
      .channel(`host:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "actions", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setActions((prev) => [payload.new as Action, ...prev]);
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as Action).id;
            setActions((prev) => prev.filter((a) => a.id !== id));
          }
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [sessionId]);

  async function del(id: string) {
    if (!confirm("למחוק את הפעולה הזו?")) return;
    const res = await fetch("/api/actions/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action_id: id, host_code: code }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert("מחיקה נכשלה: " + (j?.error || res.status));
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-700">{error}</h1>
        </div>
      </main>
    );
  }

  if (!verified) {
    return <main className="min-h-screen flex items-center justify-center text-sky-900">טוען...</main>;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-sky-900">ניהול סדנה</h1>
          <div className="flex gap-3">
            <a href={`/${slug}`} target="_blank" className="bg-sky-900 text-amber-300 font-bold py-2 px-4 rounded-xl">מסך הקרנה</a>
            <a href={`/${slug}/join`} target="_blank" className="bg-orange-500 text-white font-bold py-2 px-4 rounded-xl">מסך משתתפים</a>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow mb-6 text-sm text-slate-600">
          קישור משתתפים: <span className="font-mono text-sky-800">{origin}/{slug}/join</span>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-sky-900 text-white p-4 font-bold">
            פעולות בסדנה ({actions.length})
          </div>
          <ul className="divide-y divide-slate-100">
            {actions.length === 0 && <li className="p-6 text-center text-slate-400">אין פעולות עדיין</li>}
            {actions.map((a) => (
              <li key={a.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sky-900 font-medium">{a.text}</div>
                  <div className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString("he-IL")}</div>
                </div>
                <button
                  onClick={() => del(a.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-xl"
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
