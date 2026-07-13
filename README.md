# Flower ZC 个人开发门户

中文个人开发门户，展示项目、VPS 基础设施、开发日志和路线图。内容直接存储在仓库中，不使用数据库保存文章。

## 技术栈

- Next.js App Router / Vinext
- TypeScript
- Tailwind CSS 4
- Docker / Docker Compose
- 本地 NASA 公开素材：`public/media`

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 生产构建

```bash
npm run build
npm run start
```

## Docker 部署

项目只监听本机 3000 端口，不直接暴露到公网：

```bash
cd /opt/stacks/blog
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:3000
```

## VPS 与 Caddy

在现有 Caddyfile 中添加：

```caddy
flowerzc.com {
    reverse_proxy 127.0.0.1:3000
}
```

Caddy 负责域名、HTTPS 和反向代理；本项目不管理其他服务的 Compose 配置。

## 添加日志

1. 在 `content/logs` 新建 `YYYY-MM-DD-slug.md`。
2. 添加 frontmatter：`title`、`date`、`summary`、`tags`、`status`。
3. `date` 必须是独立的 `YYYY-MM-DD` 标量和真实日历日期，不要附加行内注释。
4. 新文件会在下次构建时由 `import.meta.glob` 自动发现，无需修改 `app/data/logs.ts`。
5. 本地运行构建并提交。

## 添加项目

在 `app/data/projects.ts` 增加项目对象，填写 `status`、`stack`、`currentPhase`、`nextStep`。GitHub 地址没有就保持空字符串，不要伪造链接。

## 目录结构

```text
app/                 页面、组件、SEO 路由与数据
content/logs/        可提交的 Markdown 日志源文件
public/media/        已内化的图片资源
Dockerfile           多阶段生产镜像
compose.yml          仅暴露 127.0.0.1:3000
```
