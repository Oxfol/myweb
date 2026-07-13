export type ProjectArchitectureNode = { label: string; value: string };
export type ProjectTimelineItem = { date: string; title: string; description: string };

export type Project = {
  slug: string;
  number: string;
  title: string;
  description: string;
  status: "active" | "planned" | "in-progress" | "stable" | "experimental";
  stack: string[];
  currentPhase: string;
  nextStep: string;
  repository?: string;
  deployedUrl?: string;
  details: string[];
  architecture?: ProjectArchitectureNode[];
  timeline?: ProjectTimelineItem[];
  version?: string;
  license?: string;
  updatedAt?: string;
};

export const projects: Project[] = [
  { slug: "hermes-agent", number: "01", title: "Hermes Agent", description: "面向个人开发环境的 AI agent 基础层，负责任务编排、工具调用与可观察的自动化执行。", status: "active", stack: ["Python", "Docker", "Playwright", "LLM"], currentPhase: "Gateway 与 Dashboard 稳定运行", nextStep: "接入多模型提供商与任务回放", repository: "", deployedUrl: "https://hermes.flowerzc.com", details: ["把一次性的对话能力变成可复用的本地开发服务。", "将浏览器、Webhook、代码执行和日志收敛到统一的任务边界内。"] },
  { slug: "wechat-api", number: "02", title: "微信小程序海报 API", description: "为小程序和运营场景提供模板渲染、图片合成与可追踪分享链路。", status: "in-progress", stack: ["TypeScript", "Node.js", "Canvas", "Caddy"], currentPhase: "接口与模板协议设计", nextStep: "接入对象存储与生产域名", repository: "", details: ["接口以模板、变量和输出格式为核心，不绑定单一业务页面。", "生产环境由 Caddy 负责 HTTPS 与反向代理。"] },
  { slug: "ai-service", number: "03", title: "AI Service", description: "统一封装 OpenAI、OpenRouter 与 Gemini 的模型调用、限流、重试和成本记录。", status: "planned", stack: ["TypeScript", "OpenAI", "OpenRouter", "Redis"], currentPhase: "需求拆解", nextStep: "确定 provider adapter 接口", repository: "", details: ["将模型供应商差异留在适配层，业务代码只面对稳定的生成接口。"] },
  { slug: "trading-bot", number: "04", title: "Trading Bot", description: "以研究、回测和纸面交易为优先的合约策略实验场，保留数据、风险和结果的证据链。", status: "experimental", stack: ["Python", "Binance Futures", "Pandas", "Backtest"], currentPhase: "数据与回测验证", nextStep: "扩大样本并校验样本外结果", repository: "", details: ["默认 testnet / paper-first，避免用一次好的回测直接推断实盘能力。"] },
  { slug: "webhook-service", number: "05", title: "Webhook Service", description: "轻量、可观测的事件入口，为部署、通知与外部服务集成提供统一接收层。", status: "planned", stack: ["Node.js", "PostgreSQL", "Redis", "Caddy"], currentPhase: "接口草案", nextStep: "定义签名校验与重试策略", repository: "", details: ["所有外部事件先验证签名，再进入可重试的内部队列。"] },
  { slug: "dev-infrastructure", number: "06", title: "Personal Dev Infrastructure", description: "把 VPS 变成长期稳定的个人开发基础设施：部署、域名、证书、数据库与备份。", status: "stable", stack: ["Ubuntu 24.04", "Docker Compose", "Caddy", "Cloudflare"], currentPhase: "基础设施已可用", nextStep: "补齐监控、备份与 GitHub Actions", repository: "", details: ["生产入口保持单一职责：Caddy 负责域名、HTTPS 和反向代理。", "应用栈独立部署，避免把数据库、缓存和 agent 绑进博客容器。"] },
];

export function getProject(slug: string) { return projects.find(project => project.slug === slug); }
