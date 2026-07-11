import { ArrowRightIcon, CheckIcon, DotsThreeIcon } from "@phosphor-icons/react/ssr";
import { Container, PageHeading, StatusBadge, TechBadge } from "../components/SiteShell";
import { QuickSidebar } from "../components/QuickSidebar";

const completed = ["Docker 安装与基础网络修复", "Docker Compose 服务编排", "PostgreSQL / Redis / Caddy 部署", "Cloudflare DNS 与 HTTPS"];
const inProgress = ["配置 Hermes 模型提供商", "接入 OpenAI / OpenRouter / Gemini", "补齐监控与备份"];
const planned = ["部署微信小程序海报 API", "建立 Webhook 服务", "恢复浏览器自动化能力", "安全策略与成本报告"];

function RoadmapCard({ title, index, priority, category, done }: { title: string; index: number; priority: string; category: string; done?: boolean }) {
  return <article className="roadmap-card"><div className="roadmap-card-top"><span>{String(index).padStart(2, "0")}</span>{done ? <CheckIcon size={16} /> : <DotsThreeIcon size={18} />}</div><h2>{title}</h2><div className="roadmap-card-meta"><TechBadge>{category}</TechBadge><span>优先级 · {priority}</span><span>{done ? "已完成" : "Q3 2026"}</span></div><div className="roadmap-progress"><i style={{ width: done ? "100%" : priority === "高" ? "62%" : "28%" }} /></div></article>;
}

export const metadata = { title: "路线图", description: "Flower ZC 的基础设施与项目推进路线图。" };

export default function RoadmapPage() {
  return <div className="dense-page"><Container><PageHeading eyebrow="Roadmap / Product" title="产品路线图" description="把基础设施、项目和自动化能力拆成可追踪的下一步。" /><div className="dense-page-layout"><main><div className="roadmap-summary"><span><strong>4</strong> Completed</span><span><strong>3</strong> In Progress</span><span><strong>4</strong> Planned</span><ArrowRightIcon size={18} /></div><div className="roadmap-columns"><section><header><StatusBadge status="stable" /><h2>Completed</h2></header>{completed.map((item, index) => <RoadmapCard key={item} title={item} index={index + 1} priority="高" category="基础设施" done />)}</section><section><header><StatusBadge status="in-progress" /><h2>In Progress</h2></header>{inProgress.map((item, index) => <RoadmapCard key={item} title={item} index={index + 1} priority="高" category="平台" />)}</section><section><header><StatusBadge status="planned" /><h2>Planned</h2></header>{planned.map((item, index) => <RoadmapCard key={item} title={item} index={index + 1} priority="中" category="产品" />)}</section></div></main><QuickSidebar title="Progress Summary" items={[{ label: "完成度", value: "36%" }, { label: "高优先级", value: "5 项" }, { label: "当前焦点", value: "Hermes" }]} /></div></Container></div>;
}
