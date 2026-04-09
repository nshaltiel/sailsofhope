"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SeaView from "@/components/SeaView";

export default function SlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id")
        .eq("slug", slug)
        .single();
      if (error || !data) setNotFound(true);
      else setSessionId(data.id);
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
