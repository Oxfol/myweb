import hostVdsContent from "../../content/logs/2026-07-10-hostvds-setup.md?raw";
import portalContent from "../../content/logs/2026-07-11-portal-foundation.md?raw";

export type LogMeta = { slug: string; title: string; date: string; summary: string; tags: string[]; readingTime: string; content: string };

export const logs: LogMeta[] = [
  { slug: "2026-07-10-hostvds-setup", title: "将 HostVDS 改造成长期开发服务器", date: "2026-07-10", summary: "记录 Docker、Caddy、PostgreSQL、Redis 与 Hermes Agent 的部署过程，以及网络和反向代理问题的真实修复。", tags: ["VPS", "Docker", "Caddy"], readingTime: "8 分钟", content: hostVdsContent },
  { slug: "2026-07-11-portal-foundation", title: "为个人开发门户建立内容骨架", date: "2026-07-11", summary: "把项目状态、开发日志和 VPS 基础设施从零散记录整理成可长期维护的公开入口。", tags: ["Portal", "TypeScript", "Docs"], readingTime: "4 分钟", content: portalContent },
];

export function getLog(slug: string) { return logs.find(log => log.slug === slug); }
