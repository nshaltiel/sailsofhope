import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  const db = getAdminDb();
  const snap = await db
    .collection("sessions")
    .orderBy("created_at", "desc")
    .get();

  const sessions = snap.docs.map((d) => ({
    id: d.id,
    slug: d.get("slug") as string,
    title: (d.get("title") as string | null) ?? null,
    host_code: d.get("host_code") as string,
    created_at: d.get("created_at") as number,
  }));

  return NextResponse.json(sessions);
}
