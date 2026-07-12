import Image from "next/image";
import { LoginForm } from "@/features/auth/login-form";
import {
  ShieldCheckIcon,
  ShieldLockIcon,
  SpeedIcon,
} from "@/components/icon/icons";
import { Card, CardContent } from "@/components/ui/card";
import { TextLabel } from "@/components/ui/text-label";

const trustItems = [
  {
    title: "ปลอดภัย",
    description: "มาตรฐานความปลอดภัยระดับสูง",
    icon: ShieldLockIcon,
  },
  {
    title: "เชื่อถือได้",
    description: "ระบบเสถียร ข้อมูลไม่สูญหาย",
    icon: ShieldCheckIcon,
  },
  {
    title: "รวดเร็ว",
    description: "ใช้งานง่าย ลดช่วงเวลาทำงาน",
    icon: SpeedIcon,
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#020817_0%,#061a49_42%,#f5f9ff_42%,#eef6ff_100%)] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1440px] items-stretch overflow-hidden rounded-[1.75rem] border border-white/15 bg-white shadow-2xl shadow-black/30 max-lg:min-h-[calc(100vh-2rem)] max-md:block max-md:rounded-[1.25rem]">
        <section className="relative flex min-h-[36rem] flex-1 overflow-hidden bg-brand-navy-deep text-white max-md:min-h-0 max-md:pb-8">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#020817_0%,#032465_54%,#02112f_100%)]" />
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(120deg,transparent_0%,transparent_48%,rgba(24,200,255,0.18)_49%,transparent_58%),radial-gradient(circle_at_82%_45%,rgba(255,255,255,0.18)_0_1px,transparent_1px)] [background-size:100%_100%,22px_22px]" />
          <div className="absolute -right-28 top-24 h-24 w-[42rem] -rotate-[32deg] rounded-full border border-cyan-300/30" />
          <div className="absolute -right-16 bottom-24 h-20 w-[38rem] -rotate-[18deg] rounded-full border border-cyan-300/20" />
          <div className="absolute bottom-20 left-12 h-px w-3/4 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          <div className="absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(0deg,rgba(2,8,23,0.92),transparent)]" />

          <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-12 max-lg:px-6 max-md:py-8">
            <Image
              src="/brand/kmg-logo.png"
              alt="ร้านขวัญเมืองแก๊ส"
              width={520}
              height={520}
              priority
              className="h-auto w-[min(74vw,33rem)] drop-shadow-[0_22px_50px_rgba(0,0,0,0.52)] max-lg:w-[min(38vw,25rem)] max-md:w-[min(74vw,18rem)]"
            />

            <div className="mt-12 grid w-full max-w-2xl grid-cols-3 divide-x divide-white/15 max-md:mt-7 max-md:max-w-sm">
              {trustItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex flex-col items-center px-4 text-center max-md:px-2"
                  >
                    <Icon className="h-11 w-11 text-brand-cyan max-md:h-8 max-md:w-8" />
                    <TextLabel
                      as="h2"
                      className="mt-4 text-lg font-bold text-white max-md:mt-2 max-md:text-sm"
                      variant="body"
                    >
                      {item.title}
                    </TextLabel>
                    <TextLabel
                      as="p"
                      className="mt-1 max-w-36 text-blue-100/90 max-md:text-[0.68rem] max-md:leading-4"
                      variant="body"
                    >
                      {item.description}
                    </TextLabel>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#ffffff_0%,#f7fbff_54%,#e9f4ff_100%)] px-8 py-10 max-lg:px-6 max-md:px-4 max-md:py-6">
          <div className="absolute right-8 top-6 h-56 w-56 opacity-35 [background-image:radial-gradient(circle,rgba(18,111,255,0.28)_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
          <div className="absolute left-10 top-24 h-24 w-[46rem] -rotate-[18deg] bg-[linear-gradient(90deg,rgba(24,200,255,0.28)_0%,rgba(18,111,255,0.12)_48%,transparent_100%)] blur-xl" />
          <div className="absolute bottom-24 right-[-8rem] h-28 w-[44rem] -rotate-[28deg] bg-[linear-gradient(90deg,transparent_0%,rgba(148,163,184,0.28)_36%,rgba(18,111,255,0.18)_100%)] blur-xl" />
          <div className="absolute -left-16 bottom-16 h-24 w-[34rem] -rotate-[18deg] rounded-full border border-cyan-200/80" />
          <div className="absolute -right-28 top-1/2 h-24 w-[36rem] -translate-y-1/2 -rotate-[28deg] rounded-full border border-blue-200/80" />

          <Card
            className="relative z-10 w-full max-w-[31.5rem] max-md:rounded-2xl"
            variant="glass"
          >
            <CardContent variant="glass">
              <div className="text-center">
                <TextLabel as="p" variant="eyebrow">
                  ยินดีต้อนรับเข้าสู่ระบบ
                </TextLabel>
                <TextLabel as="h1" className="mt-3" variant="title">
                  ร้านขวัญเมืองแก๊ส
                </TextLabel>
                <TextLabel as="p" className="mt-3" variant="subtitle">
                  ระบบจัดการร้านแก๊สครบวงจร
                </TextLabel>
                <div className="mx-auto mt-4 flex w-20 items-center gap-2">
                  <span className="h-1 flex-1 rounded-full bg-brand-blue" />
                  <span className="h-1 w-2 rounded-full bg-brand-blue" />
                </div>
              </div>

              <LoginForm />

              <TextLabel as="p" className="mt-8 text-center" variant="caption">
                © 2024 ร้านขวัญเมืองแก๊ส สงวนลิขสิทธิ์
              </TextLabel>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
