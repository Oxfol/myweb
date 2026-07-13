import { ArrowUpRightIcon, GithubLogoIcon, RssIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Container, PageHeading } from "../components/SiteShell";
import { QuickSidebar } from "../components/QuickSidebar";

export const metadata = { title: "联系", description: "联系 Flower ZC，查看公开项目与 GitHub。", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <div className="dense-page"><Container><PageHeading eyebrow="Contact / Connect" title="联系与入口" description="从公开项目、开发日志或 GitHub 开始了解正在构建的系统。" /><div className="dense-page-layout"><main className="contact-grid"><a href="https://github.com/Oxfol" target="_blank" rel="noreferrer"><GithubLogoIcon size={22} /><span><small>GitHub</small>github.com/Oxfol</span><ArrowUpRightIcon size={18} /></a><Link href="/logs"><RssIcon size={22} /><span><small>开发日志</small>阅读最近的构建记录</span><ArrowUpRightIcon size={18} /></Link><div><span><small>Email</small>暂未公开</span></div></main><QuickSidebar title="Contact" items={[{ label: "GitHub", href: "https://github.com/Oxfol" }, { label: "Logs", href: "/logs" }, { label: "Projects", href: "/projects" }]} /></div></Container></div>;
}
