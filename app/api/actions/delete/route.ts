import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { action_id, host_code } = await req.json();
  if (!action_id || !host_code) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const actionRef = db.collection("actions").doc(action_id);
  const actionSnap = await actionRef.get();
  if (!actionSnap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  const sessionId = actionSnap.get("session_id") as string;
  const sessionSnap = await db.collection("sessions").doc(sessionId).get();
  if (!sessionSnap.exists) return NextResponse.json({ error: "session not found" }, { status: 404 });

  if (sessionSnap.get("host_code") !== host_code) {
    return NextResponse.json({ error: "invalid host code" }, { status: 403 });
  }

  await actionRef.delete();
  return NextResponse.json({ ok: true });
}
