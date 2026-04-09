import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { makeHostCode, makeSlug } from "@/lib/ids";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title: string | null = body?.title?.trim() || null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    const host_code = makeHostCode();
    const { data, error } = await supabase
      .from("sessions")
      .insert({ slug, host_code, title })
      .select()
      .single();
    if (!error && data) return NextResponse.json(data);
    if (error && !`${error.message}`.includes("duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "could not allocate slug" }, { status: 500 });
}
