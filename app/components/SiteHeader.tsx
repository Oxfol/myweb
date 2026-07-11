"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, GithubLogoIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";

const nav = [
  ["首页", "/"],
  ["关于", "/about"],
  ["项目", "/projects"],
  ["日志", "/logs"],
  ["基础设施", "/infrastructure"],
  ["路线图", "/roadmap"],
  ["联系", "/contact"],
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`site-header ${compact ? "site-header-compact" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="brand-link" aria-label="Flower ZC 首页" onClick={() => setOpen(false)}>
          <span className="brand-mark">f</span>
          <span>Flower ZC</span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          {nav.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href} className={active ? "nav-link nav-link-active" : "nav-link"} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                {label}
                {active && <m.span layoutId="nav-indicator" className="nav-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              </Link>
            );
          })}
        </nav>

        <a className="github-link" href="https://github.com/flowerzc" target="_blank" rel="noreferrer">
          <GithubLogoIcon size={17} weight="regular" aria-hidden="true" />
          <span>GitHub</span>
          <ArrowUpRightIcon size={14} aria-hidden="true" />
        </a>

        <button className="menu-button" type="button" aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} onClick={() => setOpen(value => !value)}>
          {open ? <XIcon size={22} /> : <ListIcon size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <m.nav
              aria-label="移动端导航"
              initial={{ y: -12 }}
              animate={{ y: 0 }}
              exit={{ y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {nav.map(([label, href], index) => (
                <Link key={href} href={href} className={isActive(pathname, href) ? "mobile-nav-link mobile-nav-link-active" : "mobile-nav-link"} onClick={() => setOpen(false)}>
                  <span className="mobile-nav-index">{String(index + 1).padStart(2, "0")}</span>
                  <span>{label}</span>
                  <ArrowUpRightIcon size={20} aria-hidden="true" />
                </Link>
              ))}
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
