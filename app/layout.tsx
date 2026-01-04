import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "静态地图认知工具",
  description: "用最少的信息，快速建立对国家 / 省 / 市 / 区的空间认知。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-muted/30">{children}</body>
    </html>
  );
}
