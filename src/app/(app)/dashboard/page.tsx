import { PageHeader } from "@/components/app-shell/page-header";
import { TodayDashboard } from "@/features/dashboard/today-dashboard";

export default function DashboardPage() {
  return (
    <main>
      <PageHeader
        description="ยินดีต้อนรับเข้าสู่ระบบ ร้านขวัญเมืองแก๊ส"
        title={<>สวัสดีตอนเช้า, <span className="text-[#0866f5]">Admin</span></>}
      />
      <div className="p-4 sm:p-6 lg:p-8 lg:pt-4">
        <TodayDashboard />
      </div>
    </main>
  );
}
