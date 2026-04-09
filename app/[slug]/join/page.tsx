"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    const v = text.trim();
    if (v.length < 2) return;
    setBusy(true);
    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, text: v }),
    });
    setBusy(false);
    if (res.ok) {
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } else {
      const j = await res.json().catch(() => ({}));
      alert("שגיאה: " + (j?.error || res.status));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white p-6 flex items-start justify-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full mt-8 border-t-8 border-orange-500">
        <h1 className="text-3xl font-black text-sky-900 mb-2">מפרש משלך</h1>
        <p className="text-slate-600 mb-6">שתפו פעולה, מחשבה או רגע של תקווה — והוא יופיע כסירה במסך המשותף.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          rows={4}
          className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-0 text-lg"
          placeholder="לדוגמה: הכנתי לתלמידים מכתב אישי..."
        />
        <button
          onClick={send}
          disabled={busy}
          className="mt-5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl w-full text-lg disabled:opacity-50"
        >
          {busy ? "שולח..." : "שלחו לים ⛵"}
        </button>
        {sent && <div className="mt-4 text-center text-green-700 font-bold">המפרש שלך יצא לדרך!</div>}
        <p className="mt-6 text-xs text-slate-400 text-center">תוכלו לשלוח כמה פעולות שתרצו</p>
      </div>
    </main>
  );
}
