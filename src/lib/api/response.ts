export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta?: {
        requestId?: string;
        [key: string]: unknown;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
      meta?: {
        requestId?: string;
        [key: string]: unknown;
      };
    };

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== "object") return false;
  return "success" in value && typeof (value as { success: unknown }).success === "boolean";
}
