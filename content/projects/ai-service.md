---
order: 3
title: AI Service
description: 统一封装 OpenAI、OpenRouter 与 Gemini 的模型调用、限流、重试和成本记录。
publicationStatus: published
status: planned
stack:
  - TypeScript
  - OpenAI
  - OpenRouter
  - Redis
currentPhase: 需求拆解
nextStep: 确定 provider adapter 接口
features:
  - 将模型供应商差异留在适配层，业务代码只面对稳定的生成接口。
---
