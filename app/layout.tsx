import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astral — Venture Past Our Sky",
  description:
    "Pioneering vessels and breakthrough engineering for extraordinary deep-space travel.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
