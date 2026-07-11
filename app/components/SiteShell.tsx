import Link from "next/link";
import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">跳到主要内容</a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-cta">
          <div>
            <p className="eyebrow">持续构建</p>
            <h2>一次提交，<br />让系统再向前一步。</h2>
          </div>
          <Link href="/logs" className="footer-action">
            阅读开发日志
            <ArrowUpRightIcon size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Flower ZC</span>
          <div>
            <a href="https://github.com/flowerzc" target="_blank" rel="noreferrer"><GithubLogoIcon size={16} />GitHub</a>
            <span>Next.js / TypeScript</span>
            <span>Powered by HostVDS</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`site-container ${className}`}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, description, level = 1 }: { eyebrow: string; title: string; description?: string; level?: 1 | 2 }) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <Heading>{title}</Heading>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { active: "运行中", planned: "计划中", "in-progress": "进行中", stable: "稳定", experimental: "实验性" };
  return <span className={`status-badge status-${status}`}><i />{labels[status] || status}</span>;
}

export function TechBadge({ children }: { children: ReactNode }) {
  return <span className="tech-badge">{children}</span>;
}
