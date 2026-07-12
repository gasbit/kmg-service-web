import { NextResponse, type NextRequest } from "next/server";
import type { LoginResponseData } from "@/features/auth/auth.types";
import { API_BASE_URL } from "@/lib/api/client";
import { toUserMessage } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/response";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!isLoginPayload(body)) {
    return NextResponse.json(
      { ok: false, message: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(`${API_BASE_URL}/auth/login`, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch(() => null);

  if (!backendResponse) {
    return NextResponse.json(
      {
        ok: false,
        message: "ไม่สามารถเชื่อมต่อ Backend API ได้ กรุณาตรวจสอบว่า KMG-SERVICE-API เปิดอยู่ที่ port 4000",
        code: "BACKEND_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  const payload = (await backendResponse.json().catch(() => null)) as ApiResponse<LoginResponseData> | null;

  if (!payload || !payload.success) {
    const code = payload?.success === false ? payload.error.code : "INTERNAL_ERROR";
    const message = payload?.success === false ? payload.error.message : undefined;

    return NextResponse.json(
      {
        ok: false,
        message: toUserMessage(code, message ?? "ไม่สามารถเข้าสู่ระบบได้"),
        code,
        requestId: payload?.meta?.requestId,
      },
      { status: backendResponse.status || 500 },
    );
  }

  const response = NextResponse.json({ ok: true, user: payload.data.user });
  response.cookies.set(AUTH_COOKIE_NAME, payload.data.accessToken, getAuthCookieOptions());
  return response;
}

function isLoginPayload(value: unknown): value is { username: string; password: string } {
  if (!value || typeof value !== "object") return false;
  const payload = value as { password?: unknown; username?: unknown };
  return typeof payload.username === "string" && payload.username.length > 0 && typeof payload.password === "string";
}
