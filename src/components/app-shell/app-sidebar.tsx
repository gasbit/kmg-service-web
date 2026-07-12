import Image from "next/image";
import { UserIcon } from "@/components/icon/icons";
import { NavigationMenu } from "./navigation-menu";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      alt="ร้านขวัญเมืองแก๊ส"
      className={`${compact ? "w-[190px]" : "w-[210px]"} h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]`}
      height={1024}
      priority
      src="/brand/kmg-logo-2.png"
      width={1536}
    />
  );
}

export function AppSidebar() {
  return (
    <aside aria-label="แถบเมนูแอปพลิเคชัน" className="fixed inset-y-0 left-0 z-30 hidden w-[248px] overflow-hidden bg-[#03173d] text-white lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_20%_100%,rgba(19,111,255,.4),transparent_58%)]" />
      <div className="relative flex h-28 items-center justify-center px-6"><BrandMark /></div>
      <div className="relative flex-1 overflow-y-auto px-4 py-3"><NavigationMenu /></div>
      <div className="relative m-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#061b43]/80 p-3.5 shadow-xl shadow-black/15">
        <span className="flex size-10 items-center justify-center rounded-full bg-white text-slate-500"><UserIcon className="size-6" /></span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Admin</p><p className="truncate text-xs text-blue-100/55">ผู้ดูแลระบบ</p></div>
        <span className="size-2 rounded-full bg-emerald-400" title="ออนไลน์" />
      </div>
    </aside>
  );
}
