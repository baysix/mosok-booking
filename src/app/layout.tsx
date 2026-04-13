import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "무속은 안 어려워?",
    template: "%s | 무속",
  },
  description: "무속인 예약 플랫폼 — 예약, 기원, 채팅을 한곳에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-white text-foreground overflow-x-hidden">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
