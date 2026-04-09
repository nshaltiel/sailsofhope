import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function init(): App {
  if (getApps().length) return getApps()[0]!;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var missing");
  const creds = JSON.parse(json);
  return initializeApp({ credential: cert(creds) });
}

export const adminDb = getFirestore(init());
