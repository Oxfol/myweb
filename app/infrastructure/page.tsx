import { CheckCircleIcon, CpuIcon, DatabaseIcon, HardDrivesIcon, LightningIcon, NetworkIcon, StackIcon, TerminalWindowIcon } from "@phosphor-icons/react/ssr";
import { ArchitectureFlow } from "../components/ArchitectureFlow";
import { Container, PageHeading, TechBadge } from "../components/SiteShell";
import { QuickSidebar } from "../components/QuickSidebar";

const services = [
  ["VPS", "HostVDS / Hong Kong", "4 vCPU · 8 GB RAM", "稳定", CpuIcon],
  ["Docker", "Compose stack", "12 containers", "运行中", StackIcon],
  ["Redis", "Cache / Queue", "7.x · 256 MB", "稳定", LightningIcon],
  ["Postgres", "Primary database", "16.x · 4 schemas", "稳定", DatabaseIcon],
  ["Hermes", "AI agent gateway", "Tasks · Tools · Browser", "运行中", TerminalWindowIcon],
  ["Network", "Caddy / Cloudflare", "HTTPS · DNS · Proxy", "运行中", NetworkIcon],
  ["Storage", "Volumes / Backup", "Daily snapshot", "待完善", HardDrivesIcon],
  ["Actions", "GitHub Actions", "Build · Deploy · Check", "运行中", CheckCircleIcon],
] as const;
export const metadata = { title: "基础设施", description: "Flower ZC 当前 VPS 开发环境和服务架构。" };

export default function InfrastructurePage() {
  return <div className="dense-page"><Container><PageHeading eyebrow="Infrastructure / System" title="开发基础设施" description="一套可观察、可部署、可回滚的个人开发环境。状态只展示公开运行边界。" /><div className="dense-page-layout"><main><div className="system-summary"><div><span>系统状态</span><strong>运行稳定</strong></div><div><span>服务</span><strong>8 个组件</strong></div><div><span>入口</span><strong>HTTPS / Caddy</strong></div><div><span>部署</span><strong>自动检查</strong></div></div><ArchitectureFlow /><div className="infra-grid">{services.map(([name, role, detail, status, Icon]) => <article className="infra-card" key={name}><div className="infra-card-top"><span className="infra-icon"><Icon size={19} /></span><span className={`infra-status ${status === "待完善" ? "infra-status-muted" : ""}`}><i />{status}</span></div><h2>{name}</h2><p>{role}</p><div className="infra-card-bottom"><TechBadge>{detail}</TechBadge><span>公开视图</span></div></article>)}</div></main><QuickSidebar title="System Summary" items={[{ label: "VPS", value: "Hong Kong" }, { label: "Docker", value: "12 containers" }, { label: "Network", value: "HTTPS" }, { label: "Actions", value: "Passing" }]} /></div></Container></div>;
}
