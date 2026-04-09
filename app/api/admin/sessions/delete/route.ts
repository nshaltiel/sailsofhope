import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { session_id } = await req.json();
  if (!session_id) return NextResponse.json({ error: "missing session_id" }, { status: 400 });

  const db = getAdminDb();

  // Delete all actions for this session
  const actionsSnap = await db
    .collection("actions")
    .where("session_id", "==", session_id)
    .get();

  const batch = db.batch();
  actionsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(db.collection("sessions").doc(session_id));
  await batch.commit();

  return NextResponse.json({ ok: true });
}
