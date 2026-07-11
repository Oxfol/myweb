import { CheckIcon, CircleIcon } from "@phosphor-icons/react/ssr";
import { Reveal } from "../components/Reveal";
import { Container, SectionHeading, StatusBadge } from "../components/SiteShell";

const done = ["Docker 安装与基础网络修复", "Docker Compose 服务编排", "PostgreSQL / Redis / Caddy 部署", "Portainer 与 Hermes Agent 运行", "Cloudflare DNS 与 HTTPS", "Hermes 域名反向代理"];
const next = ["配置 Hermes 模型提供商", "接入 OpenAI / OpenRouter / Gemini", "部署微信小程序海报 API", "建立 Webhook 服务", "接入 PostgreSQL 与 Redis", "GitHub Actions 自动部署", "恢复浏览器自动化能力", "增加监控、备份与安全策略"];
export const metadata = { title: "路线图", description: "Flower ZC 的基础设施与项目推进路线图。" };

function Track({ title, status, items, doneTrack = false }: { title: string; status: string; items: string[]; doneTrack?: boolean }) {
  return <Reveal className="roadmap-track"><header><StatusBadge status={status} /><h2>{title}</h2></header><ol>{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p>{doneTrack ? <CheckIcon size={15} /> : <CircleIcon size={11} />}</li>)}</ol></Reveal>;
}

export default function RoadmapPage() {
  return <div className="page-shell"><Container>
    <SectionHeading eyebrow="Roadmap" title={"已完成的，\n和下一步。"} description="路线图不是交付承诺，而是当前真实工作顺序。状态随日志与部署结果更新。" />
    <div className="roadmap-grid"><Track title="已完成" status="stable" items={done} doneTrack /><Track title="下一阶段" status="planned" items={next} /></div>
  </Container></div>;
}
