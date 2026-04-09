import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";

function expectedToken() {
  const secret = process.env.ADMIN_SECRET ?? "default-secret";
  const user = process.env.ADMIN_USERNAME ?? "admin";
  return createHmac("sha256", secret).update(user).digest("hex");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin/* — but allow /admin/login through
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;
  if (token && token === expectedToken()) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
