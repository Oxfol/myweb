import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Reveal } from "../components/Reveal";
import { Container, SectionHeading } from "../components/SiteShell";

export const metadata = { title: "联系", description: "联系 Flower ZC，查看公开项目与 GitHub。" };

export default function ContactPage() {
  return <div className="page-shell"><Container>
    <SectionHeading eyebrow="Contact" title={"如果你也在，\n把想法做成系统。"} description="公开代码、项目与开发日志是最好的介绍。联系入口保持简单，不放无效表单。" />
    <Reveal className="contact-panel">
      <a href="https://github.com/flowerzc" target="_blank" rel="noreferrer"><GithubLogoIcon size={26} /><span><small>GitHub</small>github.com/flowerzc</span><ArrowUpRightIcon size={22} /></a>
      <Link href="/projects"><span><small>从这里开始</small>查看公开项目</span><ArrowUpRightIcon size={22} /></Link>
    </Reveal>
  </Container></div>;
}
