import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { makeHostCode, makeSlug } from "@/lib/ids";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title: string | null = body?.title?.trim() || null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug();
    const db = getAdminDb();
    const existing = await db.collection("sessions").where("slug", "==", slug).limit(1).get();
    if (!existing.empty) continue;

    const host_code = makeHostCode();
    const doc = await db.collection("sessions").add({
      slug,
      title,
      host_code,
      created_at: Date.now(),
    });
    return NextResponse.json({ id: doc.id, slug, host_code, title });
  }
  return NextResponse.json({ error: "could not allocate slug" }, { status: 500 });
}
