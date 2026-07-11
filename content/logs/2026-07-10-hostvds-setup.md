---
title: 将 HostVDS 改造成长期开发服务器
date: 2026-07-10
summary: 记录 Docker、Caddy、PostgreSQL、Redis 与 Hermes Agent 的部署过程，以及网络和反向代理问题的真实修复。
tags: [VPS, Docker, Caddy]
status: published
---

## 背景

这台 HostVDS 不再作为中国入口的 Reality 代理节点，而是被重新定义为长期开发服务器。代理入口和开发基础设施分离，后续的维护边界会更清晰。

## 已完成

- 安装 Docker、Docker Compose 与 Git
- 部署 PostgreSQL 16、Redis 7、Caddy 2、Portainer CE
- 构建并运行 Hermes Agent Gateway 与 Dashboard
- 配置 flowerzc.com、hermes.flowerzc.com、api.flowerzc.com
- 为公开服务配置 Cloudflare DNS 与 HTTPS

## Docker Bridge 异常

最初 Caddy 容器内访问正常，但宿主机访问 127.0.0.1:80 会 reset。排查后发现 systemd-networkd 的匹配范围接管了 Docker 创建的 veth。修复配置从全量匹配收窄到物理网卡：

    [Match]
    Name=eth0

修改后 Docker bridge 恢复，Caddy、PostgreSQL 和 Redis 均能正常通信。

## Caddy 反向代理

Caddy 使用 host 网络模式，Hermes Dashboard 通过固定 Host 头完成反向代理。

## 下一步

接入模型提供商、部署微信小程序海报 API、建立 Webhook 服务，并把监控和备份补齐。
