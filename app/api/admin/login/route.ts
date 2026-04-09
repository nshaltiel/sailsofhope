import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const validUser = process.env.ADMIN_USERNAME ?? "admin";
  const validPass = process.env.ADMIN_PASSWORD ?? "admin123";

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: "שם משתמש או סיסמה שגויים" }, { status: 401 });
  }

  const secret = process.env.ADMIN_SECRET ?? "default-secret";
  const token = createHmac("sha256", secret).update(validUser).digest("hex");

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
