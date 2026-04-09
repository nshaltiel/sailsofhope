import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { slug, text } = await req.json();
  if (!slug || typeof text !== "string") {
    return NextResponse.json({ error: "missing slug or text" }, { status: 400 });
  }
  const trimmed = text.trim().slice(0, 200);
  if (trimmed.length < 2) {
    return NextResponse.json({ error: "text too short" }, { status: 400 });
  }

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .select("id")
    .eq("slug", slug)
    .single();
  if (sErr || !session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("actions")
    .insert({ session_id: session.id, text: trimmed })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
