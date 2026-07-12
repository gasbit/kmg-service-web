"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icon/icons";
import { BrandMark } from "./app-sidebar";
import { NavigationMenu } from "./navigation-menu";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button aria-label="เปิดเมนู" className="fixed left-4 top-3.5 z-40 flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm" onClick={() => setOpen(true)} type="button"><MenuIcon className="size-5" /></button>
      <div aria-hidden={!open} className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button aria-label="ปิดเมนู" className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} type="button" />
        <aside className={`absolute inset-y-0 left-0 flex w-[min(310px,86vw)] flex-col bg-[#03173d] p-4 text-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-5 flex items-center gap-3 px-1"><div className="flex-1"><BrandMark compact /></div><button aria-label="ปิดเมนู" className="flex size-9 items-center justify-center rounded-lg bg-white/8" onClick={() => setOpen(false)} type="button"><CloseIcon className="size-5" /></button></div>
          <div className="overflow-y-auto"><NavigationMenu onNavigate={() => setOpen(false)} /></div>
        </aside>
      </div>
    </div>
  );
}
