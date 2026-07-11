import { Reveal } from "../components/Reveal";
import { Container, SectionHeading, TechBadge } from "../components/SiteShell";

const focus = ["AI Agent", "后端 API", "微信小程序", "自动化部署", "交易系统", "VPS 基础设施"];
export const metadata = { title: "关于我", description: "Flower ZC 的技术方向、关注领域与长期目标。" };

export default function AboutPage() {
  return <div className="page-shell"><Container>
    <SectionHeading eyebrow="About / Flower ZC" title={"把复杂问题，\n拆成可维护的系统。"} description="独立开发者。从真实需求出发，先让最小系统运行，再用日志、指标与自动化提高可靠性。" />
    <div className="editorial-grid">
      <Reveal className="editorial-primary"><p className="eyebrow">正在关注</p><div className="project-tags">{focus.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div><p>目前的工作重心是 Hermes Agent、个人 VPS 开发环境、微信小程序海报 API 和 AI 服务适配。技术选择优先考虑可观察、可回滚和长期维护。</p></Reveal>
      <Reveal className="editorial-list"><p className="eyebrow">工作方式</p><ol><li><span>01</span>先确认边界，再开始编码</li><li><span>02</span>把真实错误写进日志</li><li><span>03</span>用自动化减少重复操作</li></ol></Reveal>
    </div>
    <Reveal className="editorial-quote"><p className="eyebrow">技术理念</p><h2>少一点魔法，<br />多一点证据。</h2><p>能被部署、能被监控、能被另一个人接手，才算完成。</p></Reveal>
  </Container></div>;
}
