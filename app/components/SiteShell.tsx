"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const nav = [
  ["首页", "/"], ["关于", "/about"], ["项目", "/projects"], ["日志", "/logs"], ["基础设施", "/infrastructure"], ["路线图", "/roadmap"], ["联系", "/contact"],
];

export function SiteShell({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}

function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8">
    <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2 md:px-5">
      <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-serif text-xl italic">f</span>
        <span className="hidden text-sm font-semibold tracking-wide sm:block">Flower ZC</span>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex">
        {nav.map(([label, href]) => <Link key={href} href={href} className={`rounded-full px-3 py-2 text-[13px] transition ${pathname === href ? "bg-white text-black" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <a className="hidden rounded-full border border-white/15 px-3 py-2 text-xs text-white/70 transition hover:border-white/35 hover:text-white sm:block" href="https://github.com/flowerzc" target="_blank" rel="noreferrer">GitHub ↗</a>
        <button aria-label="打开菜单" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 lg:hidden" onClick={() => setOpen(!open)}>{open ? "×" : "≡"}</button>
      </div>
    </div>
    {open && <nav className="glass mx-auto mt-2 grid max-w-7xl gap-1 rounded-3xl p-3 lg:hidden">{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`rounded-2xl px-4 py-3 text-sm ${pathname === href ? "bg-white text-black" : "text-white/75 hover:bg-white/10"}`}>{label}</Link>)}</nav>}
  </header>;
}

function Footer() {
  return <footer className="border-t border-white/10 px-5 py-10 md:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-xs text-white/45 md:flex-row md:items-center"><span>© {new Date().getFullYear()} Flower ZC</span><div className="flex flex-wrap gap-x-5 gap-y-2"><a href="https://github.com/flowerzc" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a><span>Next.js / TypeScript</span><span>Powered by HostVDS</span></div></div></footer>;
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`mx-auto w-full max-w-7xl px-5 md:px-8 ${className}`}>{children}</div>; }
export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) { return <div className="reveal mb-10 max-w-3xl"><p className="eyebrow mb-4">{eyebrow}</p><h1 className="display text-5xl leading-[.95] text-white md:text-7xl">{title}</h1>{description && <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p>}</div>; }
export function StatusBadge({ status }: { status: string }) { const labels: Record<string,string> = { active: "运行中", planned: "计划中", "in-progress": "进行中", stable: "稳定", experimental: "实验性" }; return <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/65"><i className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "pulse-dot bg-emerald-300" : status === "in-progress" ? "bg-amber-300" : "bg-white/35"}`} />{labels[status] || status}</span>; }
export function TechBadge({ children }: { children: ReactNode }) { return <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">{children}</span>; }
