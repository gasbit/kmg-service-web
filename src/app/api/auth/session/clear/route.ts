import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookies";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(AUTH_COOKIE_NAME, "", { ...getAuthCookieOptions(), maxAge: 0 });
  return response;
}
