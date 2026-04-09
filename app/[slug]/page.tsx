"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SeaView from "@/components/SeaView";

export default function SlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(collection(db, "sessions"), where("slug", "==", slug), limit(1)));
      if (snap.empty) setNotFound(true);
      else setSessionId(snap.docs[0].id);
    })();
  }, [slug]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-sky-900">סדנה לא נמצאה</h1>
          <a href="/" className="text-orange-500 underline mt-4 inline-block">חזרה לדף הבית</a>
        </div>
      </main>
    );
  }

  if (!sessionId) {
    return <main className="min-h-screen flex items-center justify-center bg-sky-50 text-sky-900">טוען...</main>;
  }

  return <SeaView sessionId={sessionId} slug={slug} />;
}
