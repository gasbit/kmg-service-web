"use server";

import { redirect } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/cookies";

export async function loginAction() {
  return { ok: false as const, message: "ใช้ route handler /api/auth/login สำหรับ login form" };
}

export async function logoutAction() {
  await clearAuthToken();
  redirect("/login");
}
