import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "./components/SiteShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://flowerzc.com"),
  title: { default: "Flower ZC · 个人开发门户", template: "%s · Flower ZC" },
  description: "Flower ZC 的个人开发门户：AI Agent、后端 API、VPS 基础设施、自动化系统与开发日志。",
  alternates: { canonical: "https://flowerzc.com" },
  openGraph: { title: "Flower ZC · 个人开发门户", description: "持续构建 AI agent、开发基础设施与自动化系统。", url: "https://flowerzc.com", siteName: "Flower ZC", type: "website" },
  twitter: { card: "summary_large_image", title: "Flower ZC · 个人开发门户", description: "持续构建 AI agent、开发基础设施与自动化系统。" },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className="site-noise"><SiteShell>{children}</SiteShell></body></html>;
}
