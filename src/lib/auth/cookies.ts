import { cookies } from "next/headers";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "./auth.constants";

export { AUTH_COOKIE_NAME };

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function readAuthToken() {
  return (await cookies()).get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function setAuthToken(token: string) {
  (await cookies()).set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

export async function clearAuthToken() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
}
