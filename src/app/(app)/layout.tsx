import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { TopBar } from "@/components/app-shell/top-bar";
import { getCurrentUser } from "@/features/auth/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/session/clear");

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div>
        <TopBar user={user} />
        {children}
        <MobileNav />
      </div>
    </div>
  );
}
