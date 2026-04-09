import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "missing sessionId" }, { status: 400 });

  const db = getAdminDb();
  const snap = await db
    .collection("actions")
    .where("session_id", "==", sessionId)
    .get();

  const actions = snap.docs
    .map((d) => ({
      id: d.id,
      session_id: d.get("session_id") as string,
      text: d.get("text") as string,
      created_at: d.get("created_at") as number,
    }))
    .sort((a, b) => a.created_at - b.created_at);

  return NextResponse.json(actions, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const { slug, text } = await req.json();
  if (!slug || typeof text !== "string") {
    return NextResponse.json({ error: "missing slug or text" }, { status: 400 });
  }
  const trimmed = text.trim().slice(0, 200);
  if (trimmed.length < 2) {
    return NextResponse.json({ error: "text too short" }, { status: 400 });
  }

  const db = getAdminDb();
  const sess = await db.collection("sessions").where("slug", "==", slug).limit(1).get();
  if (sess.empty) return NextResponse.json({ error: "session not found" }, { status: 404 });
  const sessionId = sess.docs[0].id;

  const doc = await db.collection("actions").add({
    session_id: sessionId,
    text: trimmed,
    created_at: Date.now(),
  });
  return NextResponse.json({ id: doc.id, session_id: sessionId, text: trimmed });
}
