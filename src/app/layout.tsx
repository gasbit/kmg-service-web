import type { Metadata } from "next";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/600.css";
import "@fontsource/kanit/700.css";
import "@fontsource/kanit/800.css";
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
