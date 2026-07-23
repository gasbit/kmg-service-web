import Link from "next/link";
import { InfoIcon } from "@/components/icon/icons";

export function TransactionLoadError({
  forbidden,
  message,
  requestId,
}: {
  forbidden?: boolean;
  message?: string;
  requestId?: string;
}) {
  return (
    <section className="grid min-h-[55vh] place-items-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-500">
          <InfoIcon className="size-8" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-[#071a43]">
          {forbidden ? "คุณไม่มีสิทธิ์สร้างรายการ" : "เตรียมหน้าสร้างรายการไม่สำเร็จ"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message ?? (forbidden ? "โปรดติดต่อผู้ดูแลระบบหากคิดว่าเป็นข้อผิดพลาด" : "ไม่สามารถโหลดข้อมูลสินค้าที่จำเป็นได้ กรุณาลองอีกครั้ง")}
        </p>
        {requestId ? <p className="mt-2 text-xs text-slate-400">รหัสอ้างอิง: {requestId}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {!forbidden ? <Link className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white" href="/transactions/new">ลองอีกครั้ง</Link> : null}
          <Link className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700" href={forbidden ? "/dashboard" : "/transactions"}>{forbidden ? "กลับแดชบอร์ด" : "กลับประวัติรายการ"}</Link>
        </div>
      </div>
    </section>
  );
}
