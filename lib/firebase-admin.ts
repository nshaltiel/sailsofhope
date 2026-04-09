import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _db: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (_db) return _db;
  let app: App;
  if (getApps().length) {
    app = getApps()[0]!;
  } else {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var missing");
    app = initializeApp({ credential: cert(JSON.parse(json)) });
  }
  _db = getFirestore(app);
  return _db;
}
