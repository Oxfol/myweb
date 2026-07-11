import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import { ArchitectureFlow } from "../components/ArchitectureFlow";
import { Reveal } from "../components/Reveal";
import { Container, SectionHeading, TechBadge } from "../components/SiteShell";

const services = [{ name: "Ubuntu 24.04", role: "主机系统", status: "稳定", tech: "HostVDS" }, { name: "Docker / Compose", role: "应用隔离与编排", status: "稳定", tech: "Containers" }, { name: "Caddy", role: "HTTPS 与反向代理", status: "运行中", tech: "Edge" }, { name: "PostgreSQL 16", role: "持久化数据", status: "稳定", tech: "Database" }, { name: "Redis 7", role: "缓存与队列", status: "稳定", tech: "Cache" }, { name: "Portainer", role: "容器可视化", status: "运行中", tech: "Ops" }, { name: "Hermes Agent", role: "AI agent 服务", status: "运行中", tech: "AI" }, { name: "Cloudflare DNS", role: "域名解析与边缘层", status: "运行中", tech: "DNS" }];
export const metadata = { title: "基础设施", description: "Flower ZC 当前 VPS 开发环境和服务架构。" };

export default function InfrastructurePage() {
  return <div className="page-shell"><Container>
    <SectionHeading eyebrow="Infrastructure" title={"一台 VPS，\n一套清晰的系统边界。"} description="展示公开架构与服务角色，不展示管理入口、密钥、数据库密码或敏感运行日志。" />
    <Reveal><ArchitectureFlow /></Reveal>
    <div className="service-grid">{services.map(service => <Reveal key={service.name} className="service-item"><div><span><CheckCircleIcon size={14} />{service.status}</span><h3>{service.name}</h3><p>{service.role}</p><TechBadge>{service.tech}</TechBadge></div></Reveal>)}</div>
  </Container></div>;
}
