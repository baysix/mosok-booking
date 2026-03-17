import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "무속은 안 어려워?",
  description: "무속인 예약 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-white text-foreground">
        {children}
      </body>
    </html>
  );
}
