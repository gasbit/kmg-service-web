export const TRANSACTION_TYPES = {
  DELIVERY_EXCHANGE: "DELIVERY_EXCHANGE",
  WALK_IN_EXCHANGE: "WALK_IN_EXCHANGE",
  BORROW_CYLINDER: "BORROW_CYLINDER",
  RETURN_CYLINDER: "RETURN_CYLINDER",
  BUY_FULL_TANK: "BUY_FULL_TANK",
} as const;

export const CREATE_TRANSACTION_TYPES = [
  TRANSACTION_TYPES.DELIVERY_EXCHANGE,
  TRANSACTION_TYPES.WALK_IN_EXCHANGE,
  TRANSACTION_TYPES.BORROW_CYLINDER,
  TRANSACTION_TYPES.BUY_FULL_TANK,
] as const;

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.DELIVERY_EXCHANGE]: "ส่งแก๊สแลกถัง",
  [TRANSACTION_TYPES.WALK_IN_EXCHANGE]: "แลกหน้าร้าน",
  [TRANSACTION_TYPES.BORROW_CYLINDER]: "ยืมถัง",
  [TRANSACTION_TYPES.RETURN_CYLINDER]: "คืนถัง",
  [TRANSACTION_TYPES.BUY_FULL_TANK]: "ซื้อถังเต็ม",
} as const;

export const TRANSACTION_STATUSES = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "กำลังดำเนินการ",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const TRANSACTION_STEPS = [
  { label: "เลือกประเภทรายการ" },
  { label: "ข้อมูลลูกค้า" },
  { label: "รายการสินค้า" },
  { label: "ยืนยันข้อมูล" },
] as const;
