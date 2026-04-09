"use client";

import { useEffect, useRef, useState } from "react";

type Action = { id: string; session_id: string; text: string; created_at: number };

const BOAT_SVG = `
  <svg class="w-full h-full" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 L90 50 L80 70 L20 70 Z" fill="#5d4037" stroke="#3e2723" stroke-width="1.5" />
    <path d="M20 70 Q50 75 80 70" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <rect x="48" y="10" width="4" height="40" fill="#3e2723" />
    <path d="M52 10 L85 45 L52 45 Z" fill="#f97316" stroke="#ea580c" stroke-width="1" />
    <path d="M48 15 L15 45 L48 45 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1" />
    <path d="M48 5 L58 10 L48 15 Z" fill="#ef4444" />
  </svg>
`;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function SeaView({ sessionId, slug }: { sessionId: string; slug: string }) {
  const seaRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const boatNodes = useRef<Map<string, HTMLDivElement>>(new Map());
  const knownIds = useRef<Set<string>>(new Set());
  const [actions, setActions] = useState<Action[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showList, setShowList] = useState(false);
  const [newText, setNewText] = useState("");

  // clouds
  useEffect(() => {
    const c = cloudsRef.current;
    if (!c) return;
    for (let i = 0; i < 6; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      const size = Math.random() * 100 + 150;
      cloud.style.width = size + "px";
      cloud.style.height = size * 0.6 + "px";
      cloud.style.top = Math.random() * 40 + "%";
      cloud.style.animationDuration = Math.random() * 40 + 60 + "s";
      cloud.style.animationDelay = Math.random() * -100 + "s";
      c.appendChild(cloud);
    }
  }, []);

  // polling
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/actions?sessionId=${sessionId}`, { cache: "no-store" });
        if (!res.ok) { console.error("actions fetch failed", res.status); return; }
        const data: Action[] = await res.json();

        const currentIds = new Set(data.map((a) => a.id));

        // new actions → create boats
        for (const action of data) {
          if (!knownIds.current.has(action.id)) {
            knownIds.current.add(action.id);
            createBoat(action);
          }
        }

        // removed actions → remove boats
        for (const id of Array.from(knownIds.current)) {
          if (!currentIds.has(id)) {
            knownIds.current.delete(id);
            removeBoat(id);
          }
        }

        setActions(data);
      } catch (e) {
        console.error("polling error", e);
      } finally {
        if (!cancelled) setTimeout(poll, 2000);
      }
    }

    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function removeBoat(id: string) {
    const node = boatNodes.current.get(id);
    if (node) { node.remove(); boatNodes.current.delete(id); }
  }

  function createBoat(action: Action) {
    const sea = seaRef.current;
    if (!sea || boatNodes.current.has(action.id)) return;

    const wrapper = document.createElement("div");
    wrapper.className = "boat floating";

    const lane = Math.floor(Math.random() * 4);
    wrapper.style.top = `${15 + lane * 20}%`;

    const ltr = Math.random() > 0.5;
    const startX = ltr ? -400 : window.innerWidth + 100;
    const endX = ltr ? window.innerWidth + 400 : -400;
    wrapper.style.left = `${startX}px`;

    const flip = !ltr ? 'style="transform: scaleX(-1)"' : "";
    wrapper.innerHTML = `
      <div class="boat-text">${escapeHtml(action.text)}</div>
      <div class="boat-svg-container" ${flip}>${BOAT_SVG}</div>
    `;

    sea.appendChild(wrapper);
    boatNodes.current.set(action.id, wrapper);

    const loop = (sX: number, eX: number) => {
      const anim = wrapper.animate(
        [{ left: `${sX}px` }, { left: `${eX}px` }],
        { duration: (Math.random() * 10 + 25) * 1000, easing: "linear" }
      );
      (wrapper as any)._anim = anim;
      anim.onfinish = () => {
        if (boatNodes.current.get(action.id) !== wrapper) return;
        const newLtr = Math.random() > 0.5;
        const ns = newLtr ? -400 : window.innerWidth + 100;
        const ne = newLtr ? window.innerWidth + 400 : -400;
        wrapper.style.left = `${ns}px`;
        const svgWrap = wrapper.querySelector(".boat-svg-container") as HTMLElement | null;
        if (svgWrap) svgWrap.style.transform = newLtr ? "" : "scaleX(-1)";
        loop(ns, ne);
      };
    };
    loop(startX, endX);

    wrapper.onclick = () => {
      const a = (wrapper as any)._anim as Animation | undefined;
      if (!a) return;
      a.pause();
      setTimeout(() => a.play(), 4000);
    };
  }

  async function submitNew() {
    const v = newText.trim();
    if (v.length < 2) return;
    await fetch("/api/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, text: v }),
    });
    setNewText("");
    setShowAdd(false);
  }

  return (
    <div className="sea-page no-select">
      <div ref={cloudsRef} />
      <div className="sun" />

      <svg className="compass-bg" viewBox="0 0 100 100" fill="none" stroke="#0c4a6e" strokeWidth="0.2">
        <circle cx="50" cy="50" r="48" />
        <circle cx="50" cy="50" r="40" strokeDasharray="1 2" />
        <path d="M50 2 L54 46 L98 50 L54 54 L50 98 L46 54 L2 50 L46 46 Z" fill="rgba(12, 74, 110, 0.05)" />
      </svg>

      <header className="absolute top-16 left-0 right-0 text-center z-10 pointer-events-none">
        <h1 className="text-6xl font-black text-sky-900 drop-shadow-sm opacity-90 tracking-tight">
          מפרשים של תקווה
        </h1>
      </header>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 border-2 border-orange-200"
        >
          + הוספת מפרש אישי
        </button>
        <button
          onClick={() => setShowList(true)}
          className="bg-sky-900 hover:bg-sky-950 text-amber-400 font-bold py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 border-2 border-amber-400"
        >
          ★ מאגר הפעולות של הסדנה
        </button>
      </div>

      {showList && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-blur"
          onClick={(e) => e.target === e.currentTarget && setShowList(false)}
        >
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-sky-900">
            <div className="bg-sky-900 p-8 flex justify-between items-start text-white">
              <div>
                <h2 className="text-3xl font-extrabold text-amber-400">כל הפעולות</h2>
                <p className="mt-3 text-sky-100 text-base leading-relaxed">
                  התבוננו בפעולות ובחרו יחד 1-2 פעולות מסקרנות / חדשות עבור כל אחד מהעוגנים:
                </p>
                <ul className="mt-2 text-amber-300 font-bold space-y-1 text-sm">
                  <li>• החזקת אופק עתידי</li>
                  <li>• החזרת תחושת מסוגלות</li>
                  <li>• שימור משמעות בתוך הכאוס</li>
                </ul>
              </div>
              <button onClick={() => setShowList(false)} className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-full self-start">✕</button>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-slate-50">
              {actions.length === 0 && (
                <div className="col-span-full text-center text-slate-500 text-lg">אין פעולות עדיין</div>
              )}
              {actions.map((a) => (
                <div key={a.id} className="action-card p-6 rounded-2xl text-sky-900 font-bold text-center flex items-center justify-center leading-relaxed">
                  {a.text}
                </div>
              ))}
            </div>
            <div className="p-6 bg-white border-t border-slate-200 text-center">
              <span className="bg-sky-100 text-sky-900 px-4 py-2 rounded-full font-bold text-sm">
                סה"כ {actions.length} פעולות
              </span>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 modal-blur"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border-t-8 border-orange-500">
            <h2 className="text-2xl font-bold text-sky-900 mb-4">מה המפרש שלך היום?</h2>
            <p className="text-slate-600 mb-6">כתבו פעולה קטנה, מחשבה מחזקת או רגע של תקווה.</p>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-0 transition-colors text-lg font-medium"
              placeholder="לדוגמה: להכין כוס תה ולהקשיב לשיר אהוב..."
            />
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setShowAdd(false)} className="text-slate-500 font-bold px-4">ביטול</button>
              <button onClick={submitNew} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg active:scale-95">שלחו לים</button>
            </div>
          </div>
        </div>
      )}

      <div className="ocean">
        <div className="wave" />
        <div className="wave" />
        <div ref={seaRef} className="relative w-full h-full" />
      </div>
    </div>
  );
}
