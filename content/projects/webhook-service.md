---
order: 5
title: Webhook Service
description: 轻量、可观测的事件入口，为部署、通知与外部服务集成提供统一接收层。
publicationStatus: published
status: planned
stack:
  - Node.js
  - PostgreSQL
  - Redis
  - Caddy
currentPhase: 接口草案
nextStep: 定义签名校验与重试策略
features:
  - 所有外部事件先验证签名，再进入可重试的内部队列。
---
