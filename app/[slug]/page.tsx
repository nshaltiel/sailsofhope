import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import SeaView from "@/components/SeaView";

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const db = getAdminDb();
  const snap = await db.collection("sessions").where("slug", "==", slug).limit(1).get();
  if (snap.empty) notFound();
  const sessionId = snap.docs[0].id;
  return <SeaView sessionId={sessionId} slug={slug} />;
}
