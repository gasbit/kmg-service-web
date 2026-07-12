import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { AuthUser, CurrentUserResponseData } from "./auth.types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiClient<CurrentUserResponseData>("/auth/me", { cache: "no-store" });
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") return null;
    throw error;
  }
}
