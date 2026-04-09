# מפרשים של תקווה — Sails of Hope

אפליקציה וובית לסדנאות חוסן למחנכים. כל מפגש = אינסטנס סדנה משלו עם קישור ייעודי. משתתפים שולחים פעולות מהנייד, והן מופיעות כסירות במסך ההקרנה בזמן אמת. למנחה יש מסך ניהול עם אפשרות מחיקה.

## דרישות
- Node.js 18+
- חשבון Supabase (חינמי)

## התקנה
```bash
brew install node    # אם אין לך
cd ~/sailsofhope
npm install
cp .env.local.example .env.local
# ערוך את .env.local עם הפרטים מ-Supabase (Settings → API)
npm run dev
```
פתח http://localhost:3000

## הגדרת Supabase
1. צור פרויקט חדש ב-https://supabase.com
2. ב-SQL Editor הרץ את `supabase/migrations/0001_init.sql`
3. ב-Database → Replication ודא ש-`actions` כלולה ב-`supabase_realtime`
4. העתק את `Project URL` ו-`anon public key` ל-`.env.local`

## זרימה
- `/` — המנחה יוצר סדנה ומקבל 3 קישורים: מסך הקרנה, קישור למשתתפים, ומסך ניהול עם קוד מנחה.
- `/{slug}` — מסך הסירות (להקרנה במפגש).
- `/{slug}/join` — מסך נייד למשתתפים.
- `/{slug}/host?code=XXXXXX` — מסך ניהול. דורש את קוד המנחה. ניתן למחוק פעולות.

## פריסה
פשוט push ל-GitHub וחבר ל-Vercel. הוסף את שני משתני הסביבה ב-Vercel project settings.
