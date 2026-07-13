---
order: 6
title: Personal Dev Infrastructure
description: 把 VPS 变成长期稳定的个人开发基础设施：部署、域名、证书、数据库与备份。
publicationStatus: published
status: stable
stack:
  - Ubuntu 24.04
  - Docker Compose
  - Caddy
  - Cloudflare
currentPhase: 基础设施已可用
nextStep: 补齐监控、备份与 GitHub Actions
features:
  - 生产入口保持单一职责：Caddy 负责域名、HTTPS 和反向代理。
  - 应用栈独立部署，避免把数据库、缓存和 agent 绑进博客容器。
---
