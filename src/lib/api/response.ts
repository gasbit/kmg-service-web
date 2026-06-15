export type ApiResponse<T> =
  | { success: true; data: T; meta?: unknown }
  | { success: false; error: unknown; meta?: unknown };
