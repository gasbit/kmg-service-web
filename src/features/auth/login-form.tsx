"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "@/components/icon/icons";
import { useApiLoading } from "@/components/ui/api-loading-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextLabel } from "@/components/ui/text-label";
import type { LoginResult } from "./auth.types";

export function LoginForm() {
  const router = useRouter();
  const { runWithLoading } = useApiLoading();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      return;
    }

    setIsPending(true);

    try {
      const { response, result } = await runWithLoading(
        async () => {
          const response = await fetch("/api/auth/login", {
            body: JSON.stringify({ username, password }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
          const result = (await response.json()) as LoginResult;
          return { response, result };
        },
        {
          description: "ระบบกำลังตรวจสอบชื่อผู้ใช้งานและรหัสผ่าน",
          label: "กำลังเข้าสู่ระบบ...",
        },
      );

      if (!response.ok || !result.ok) {
        setError(result.ok ? "ไม่สามารถเข้าสู่ระบบได้" : result.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      aria-label="Login form"
      aria-busy={isPending}
      className="mt-8 space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
        <div>
          <Input
            autoComplete="username"
            leftIcon={
              <UserIcon className="h-5 w-5 shrink-0 text-slate-500 transition group-focus-within:text-brand-blue" />
            }
            name="username"
            placeholder="ชื่อผู้ใช้งาน"
            required
            type="text"
          />
        </div>

        <div>
          <Input
            autoComplete="current-password"
            leftIcon={
              <LockIcon className="h-5 w-5 shrink-0 text-slate-500 transition group-focus-within:text-brand-blue" />
            }
            name="password"
            placeholder="รหัสผ่าน"
            rightElement={
              <Button
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                onClick={() => setShowPassword((value) => !value)}
                size="icon"
                type="button"
                variant="icon"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </Button>
            }
            type={showPassword ? "text" : "password"}
            required
          />
        </div>

        {/* รอ backend รองรับ remember-me และ forgot-password ก่อนเปิดใช้งาน
        <div className="flex items-center justify-between gap-4 text-sm font-semibold max-[360px]:items-start max-[360px]:gap-2">
          <label className="flex min-w-0 items-center gap-2 text-slate-700">
            <Checkbox defaultChecked name="remember" />
            <TextLabel className="truncate" variant="form">
              จดจำฉันไว้ในระบบ
            </TextLabel>
          </label>
          <a
            className="shrink-0 text-brand-blue-strong transition hover:text-brand-blue"
            href="#"
          >
            ลืมรหัสผ่าน?
          </a>
        </div>
        */}
      </div>

      {error ? (
        <TextLabel as="p" className="rounded-lg bg-red-50 px-4 py-3 text-red-700" variant="caption">
          {error}
        </TextLabel>
      ) : null}

      <Button
        className="mt-2"
        fullWidth
        isLoading={isPending}
        leftIcon={<LockIcon className="h-5 w-5" />}
        loadingText="กำลังเข้าสู่ระบบ..."
        size="lg"
        type="submit"
      >
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
