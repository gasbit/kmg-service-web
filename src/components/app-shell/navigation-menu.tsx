"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxesIcon,
  ChevronDownIcon,
  HistoryIcon,
  HomeIcon,
  LoanIcon,
  ProductIcon,
  ReceiptIcon,
  TruckIcon,
} from "@/components/icon/icons";

const navigation = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: HomeIcon },
  {
    href: "/transactions",
    label: "รายการ",
    icon: ReceiptIcon,
    children: [
      { href: "/transactions/new", label: "สร้างรายการใหม่" },
      { href: "/transactions", label: "ประวัติรายการ" },
    ],
  },
  { href: "/queues", label: "คิวส่งแก๊ส", icon: TruckIcon },
  {
    href: "/products",
    label: "คลังสินค้า",
    icon: BoxesIcon,
    children: [
      { href: "/products", label: "สินค้า" },
      // HOLD: รอ business decision เรื่อง stock balance, movement และ adjustment ก่อนเปิดเมนู Inventory
      // { href: "/inventory", label: "สต็อก" },
      // { href: "/inventory/movements", label: "ประวัติการเคลื่อนไหว" },
    ],
  },
  { href: "/loans", label: "รายการยืมถัง", icon: LoanIcon },
] as const;

export function NavigationMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="เมนูหลัก" className="space-y-1.5">
      {navigation.map((item) => {
        const childMatches = "children" in item && item.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`));
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) || childMatches;
        const ItemIcon = item.icon;

        return (
          <div key={item.href}>
            <Link
              className={`group flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${isActive ? "bg-[linear-gradient(135deg,#1884ff,#0754ef)] text-white shadow-lg shadow-blue-950/35" : "text-blue-100/80 hover:bg-white/8 hover:text-white"}`}
              href={item.href}
              onClick={onNavigate}
            >
              <ItemIcon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {"children" in item ? <ChevronDownIcon className={`size-4 transition-transform ${isActive ? "rotate-180" : ""}`} /> : null}
            </Link>
            {"children" in item && isActive ? (
              <div className="ml-6 border-l border-blue-300/15 py-1 pl-5">
                {item.children.map((child) => {
                  const childActive = pathname === child.href;
                  return (
                    <Link
                      className={`relative block rounded-lg px-2 py-2 text-[13px] transition-colors ${childActive ? "font-medium text-white" : "text-blue-100/55 hover:text-white"}`}
                      href={child.href}
                      key={child.href}
                      onClick={onNavigate}
                    >
                      {childActive ? <span className="absolute -left-[22px] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-blue-300" /> : null}
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
      <div className="pt-3">
        <p className="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/35">ข้อมูลและรายงาน</p>
        <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm text-blue-100/65 transition-colors hover:bg-white/8 hover:text-white" href="/transactions" onClick={onNavigate}><HistoryIcon className="size-5" /> รายงาน</Link>
        <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm text-blue-100/65 transition-colors hover:bg-white/8 hover:text-white" href="/products" onClick={onNavigate}><ProductIcon className="size-5" /> จัดการสินค้า</Link>
      </div>
    </nav>
  );
}
