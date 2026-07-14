import { readAuthToken } from "@/lib/auth/cookies";
import { ApiError, NETWORK_ERROR_CODE } from "./errors";
import { isApiResponse, type ApiResponse } from "./response";

type ApiClientOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, boolean | number | string | null | undefined>;
};

export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api";

export async function apiClient<T>(path: string, options: ApiClientOptions = {}) {
  const payload = await request<T>(path, options);
  return payload.data;
}

export async function apiClientWithMeta<T>(path: string, options: ApiClientOptions = {}) {
  const payload = await request<T>(path, options);
  return { data: payload.data, meta: payload.meta };
}

async function request<T>(path: string, options: ApiClientOptions = {}) {
  const token = await readAuthToken();
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);
  const requestBody = options.body;
  const isFormData = requestBody instanceof FormData;

  headers.set("Accept", "application/json");
  if (requestBody !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      body: requestBody === undefined ? undefined : isFormData ? requestBody : JSON.stringify(requestBody),
      headers,
    });
  } catch (error) {
    throw new ApiError(
      "Unable to reach API service",
      NETWORK_ERROR_CODE,
      503,
      error instanceof Error ? { cause: error.name } : undefined,
    );
  }
  const payload = await parseJson<ApiResponse<T>>(response);

  if (!isApiResponse<T>(payload)) {
    throw new ApiError("Malformed API response", "INTERNAL_ERROR", response.status);
  }

  if (!payload.success) {
    throw new ApiError(
      payload.error.message,
      payload.error.code,
      response.status,
      payload.error.details,
      payload.meta?.requestId,
    );
  }

  return payload;
}

function buildUrl(path: string, query?: ApiClientOptions["query"]) {
  const url = new URL(path.replace(/^\//, ""), `${API_BASE_URL.replace(/\/$/, "")}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
  }

  return url;
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("Malformed API response", "INTERNAL_ERROR", response.status);
  }
}
