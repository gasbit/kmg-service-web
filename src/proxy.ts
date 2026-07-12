import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.constants";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/dashboard";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname === LOGIN_PATH && hasSession) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (pathname !== LOGIN_PATH && !hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand).*)"],
};
