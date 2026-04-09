import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { action_id, host_code } = await req.json();
  if (!action_id || !host_code) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const { error } = await supabase.rpc("delete_action", {
    p_action_id: action_id,
    p_host_code: host_code,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}
