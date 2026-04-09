import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import HostPanel from "@/components/HostPanel";

export default async function HostPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { code?: string };
}) {
  const { slug } = params;
  const code = searchParams.code ?? "";

  const db = getAdminDb();
  const snap = await db.collection("sessions").where("slug", "==", slug).limit(1).get();
  if (snap.empty) notFound();

  const doc = snap.docs[0];
  if (doc.get("host_code") !== code) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-700">קוד מנחה שגוי</h1>
        </div>
      </main>
    );
  }

  return <HostPanel sessionId={doc.id} slug={slug} hostCode={code} />;
}
