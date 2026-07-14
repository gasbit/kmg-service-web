"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Toast, type ToastItem, type ToastOptions } from "./toast";

type ToastContextValue = {
  dismissToast: (id: string) => void;
  toast: (options: ToastOptions) => string;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

const defaultDuration: Record<NonNullable<ToastOptions["variant"]>, number> = {
  error: 8000,
  info: 5000,
  success: 5000,
  warning: 7000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const sequenceRef = useRef(0);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${sequenceRef.current++}`;
    const variant = options.variant ?? "info";
    setItems((current) => [...current.slice(-3), { ...options, id, variant }]);

    const duration = options.duration ?? defaultDuration[variant];
    if (duration > 0) {
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setItems((current) => current.filter((item) => item.id !== id));
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ dismissToast, toast }), [dismissToast, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label="การแจ้งเตือน"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[110] flex flex-col gap-3 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[min(24rem,calc(100vw-2.5rem))]"
      >
        {items.map((item) => <Toast item={item} key={item.id} onDismiss={dismissToast} />)}
      </section>
    </ToastContext.Provider>
  );
}
