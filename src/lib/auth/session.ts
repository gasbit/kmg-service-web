import type { AuthSession } from "@/features/auth/auth.types";
import { readAuthToken } from "./cookies";

export async function readSession(): Promise<AuthSession | null> {
  const token = await readAuthToken();
  return token ? { token } : null;
}
