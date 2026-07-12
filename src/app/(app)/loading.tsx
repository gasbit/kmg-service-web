import { LoadingState } from "@/components/ui/loading";

export default function AppLoading() {
  return (
    <LoadingState
      description="กรุณารอสักครู่ ระบบกำลังเตรียมข้อมูลล่าสุด"
      label="กำลังโหลดข้อมูล..."
      variant="page"
    />
  );
}
