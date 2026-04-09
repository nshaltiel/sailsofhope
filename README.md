# מפרשים של תקווה — Sails of Hope

אפליקציה וובית לסדנאות חוסן למחנכים. כל מפגש = אינסטנס סדנה משלו עם קישור ייעודי. משתתפים שולחים פעולות מהנייד, והן מופיעות כסירות במסך ההקרנה בזמן אמת. למנחה יש מסך ניהול עם אפשרות מחיקה.

**Stack:** Next.js 14 + Firestore (realtime) + firebase-admin (server-side delete) + Vercel.

## דרישות
- Node.js 18+
- חשבון Firebase (חינמי, Spark plan מספיק)
- חשבון Vercel (לפריסה)

## הגדרת Firebase
1. https://console.firebase.google.com → **Add project**.
2. לאחר יצירה: **Build → Firestore Database → Create database** (Production mode, region קרוב).
3. **Project settings (גלגל שיניים) → General → Your apps → הוסף Web app** (`</>`). תן שם, אל תסמן Hosting. תקבל אובייקט `firebaseConfig` — שמור בצד.
4. **Project settings → Service accounts → Generate new private key** → יורד JSON. שמור.
5. עדכן את כללי האבטחה: **Firestore Database → Rules** → הדבק את התוכן של `firestore.rules` ולחץ Publish.
6. אינדקסים: **Firestore → Indexes → Add index** וצור שני אינדקסים מורכבים על collection `actions`:
   - `session_id ASC`, `created_at ASC`
   - `session_id ASC`, `created_at DESC`
   (או הרץ פעם אחת את האפליקציה ולחץ על קישור השגיאה שיופיע ב-console — Firebase יציע ליצור אוטומטית.)

## הרצה מקומית
```bash
brew install node
cd ~/sailsofhope
npm install
cp .env.local.example .env.local
# מלא את הערכים של Firebase Web (6 משתנים) ושל Service Account (משתנה אחד עם JSON בשורה אחת)
npm run dev
```
http://localhost:3000

## פריסה ל-Vercel
1. Push ל-GitHub.
2. https://vercel.com/new → Import את הריפו.
3. **Environment Variables** — הוסף את אותם 7 משתנים מ-`.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (כל ה-JSON בשורה אחת — כולל `\n` מילולי בתוך ה-private_key)
4. **Deploy**.

> טיפ ל-`FIREBASE_SERVICE_ACCOUNT_JSON`: פתח את קובץ ה-JSON שירד, והשטח אותו לשורה אחת. אם תקופץ בעיה עם ה-newlines של ה-private_key, ודא שהן `\n` ולא ירידות שורה ממש.

## זרימת משתמש
- `/` — המנחה יוצר סדנה ומקבל 3 קישורים: מסך הקרנה, קישור למשתתפים, ומסך ניהול עם קוד מנחה.
- `/{slug}` — מסך הסירות (להקרנה במפגש).
- `/{slug}/join` — מסך נייד למשתתפים.
- `/{slug}/host?code=XXXXXX` — מסך ניהול. דורש את קוד המנחה. מאפשר מחיקת פעולות.
