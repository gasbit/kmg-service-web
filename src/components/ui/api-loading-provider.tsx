"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LoadingModal } from "./loading";

type LoadingOptions = {
  description?: string;
  label?: string;
};

type ApiLoadingContextValue = {
  isLoading: boolean;
  runWithLoading: <T>(request: () => Promise<T>, options?: LoadingOptions) => Promise<T>;
};

const defaultOptions: Required<LoadingOptions> = {
  description: "กรุณารอสักครู่ ระบบกำลังดำเนินการ",
  label: "กำลังโหลดข้อมูล...",
};

const ApiLoadingContext = createContext<ApiLoadingContextValue | null>(null);

export function ApiLoadingProvider({ children }: { children: ReactNode }) {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState<Required<LoadingOptions>>(defaultOptions);

  const runWithLoading = useCallback(
    async <T,>(request: () => Promise<T>, options: LoadingOptions = {}): Promise<T> => {
      setLoadingOptions({ ...defaultOptions, ...options });
      setPendingRequests((count) => count + 1);

      try {
        return await request();
      } finally {
        setPendingRequests((count) => Math.max(0, count - 1));
      }
    },
    [],
  );

  const value = useMemo<ApiLoadingContextValue>(
    () => ({ isLoading: pendingRequests > 0, runWithLoading }),
    [pendingRequests, runWithLoading],
  );

  return (
    <ApiLoadingContext.Provider value={value}>
      {children}
      <LoadingModal
        description={loadingOptions.description}
        label={loadingOptions.label}
        open={pendingRequests > 0}
      />
    </ApiLoadingContext.Provider>
  );
}

export function useApiLoading() {
  const context = useContext(ApiLoadingContext);

  if (!context) {
    throw new Error("useApiLoading must be used within ApiLoadingProvider");
  }

  return context;
}
