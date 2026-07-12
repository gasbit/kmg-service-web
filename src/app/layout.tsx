import type { Metadata } from "next";
import { ApiLoadingProvider } from "@/components/ui/api-loading-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KMG Service",
  description: "KMG Service admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ApiLoadingProvider>{children}</ApiLoadingProvider>
      </body>
    </html>
  );
}
