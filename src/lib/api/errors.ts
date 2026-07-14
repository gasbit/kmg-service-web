export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = "INTERNAL_ERROR",
    public readonly status = 500,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const NETWORK_ERROR_CODE = "NETWORK_ERROR";
export const NETWORK_ERROR_MESSAGE = "ไม่สามารถเชื่อมต่อบริการได้ กรุณาลองอีกครั้ง";

export function toUserMessage(code?: string, fallback = "ไม่สามารถดำเนินการได้ในขณะนี้") {
  if (code === NETWORK_ERROR_CODE) return NETWORK_ERROR_MESSAGE;
  if (code === "UNAUTHORIZED") return "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
  if (code === "FORBIDDEN") return "คุณไม่มีสิทธิ์ใช้งานส่วนนี้";
  if (code === "VALIDATION_ERROR") return "ข้อมูลที่กรอกไม่ถูกต้อง";
  return fallback;
}
