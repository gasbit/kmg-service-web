import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { getCurrentUser } from "@/features/auth/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/session/clear");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
        <AppSidebar />
        <div className="min-h-screen lg:pl-[248px]">
          {children}
          <MobileNav />
        </div>
      </div>
    </ToastProvider>
  );
}
