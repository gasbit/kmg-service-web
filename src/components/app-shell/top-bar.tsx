import { BellIcon, CalendarIcon, UserIcon } from "@/components/icon/icons";

export function TopBar() {
  const today = new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" }).format(new Date());

  return (
    <header aria-label="แถบด้านบน" className="flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 pl-16 backdrop-blur-xl sm:px-6 sm:pl-20 lg:min-h-24 lg:border-0 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[#071a43] sm:text-xl">สวัสดีตอนเช้า, <span className="text-[#0866f5]">Admin</span></p>
        <p className="mt-1 hidden text-xs font-medium text-slate-500 sm:block">ยินดีต้อนรับเข้าสู่ระบบ ร้านขวัญเมืองแก๊ส</p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm md:flex"><CalendarIcon className="size-4 text-blue-600" /><time>{today}</time></div>
        <button aria-label="การแจ้งเตือน" className="relative flex size-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600" type="button"><BellIcon className="size-5" /><span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-white" /></button>
        <span className="hidden size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:flex"><UserIcon className="size-5" /></span>
      </div>
    </header>
  );
}
