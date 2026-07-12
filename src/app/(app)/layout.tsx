import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { TopBar } from "@/components/app-shell/top-bar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <AppSidebar />
      <div className="min-h-screen lg:pl-[248px]">
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">{children}</div>
        <MobileNav />
      </div>
    </div>
  );
}
