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

1. 在 `content/projects` 新建 `<slug>.md`。文件名必须匹配 `^[a-z0-9]+(?:-[a-z0-9]+)*\.md$`；文件名就是公开 URL 的 slug，创建后不可修改。
2. 必填 frontmatter：`order`、`title`、`description`、`publicationStatus`、`status`、`stack`、`currentPhase`、`nextStep`、`features`。
3. `publicationStatus` 控制是否公开，只允许 `draft` 或 `published`；`status` 表示项目生命周期，只允许 `active`、`planned`、`in-progress`、`stable`、`experimental`。两者互不替代。
4. `order` 必须是所有项目中唯一的正整数。`title` 最多 200 字符，`description`、`currentPhase`、`nextStep` 最多 1000 字符。
5. `stack` 最多 30 项（每项最多 80 字符），`features` 最多 50 项（每项最多 300 字符）。
6. 可选字段：`repository`、`deployedUrl`（仅 HTTPS）、`architecture`、`timeline`、`version`、`license`、`updatedAt`。日期必须是独立的真实 `YYYY-MM-DD` 标量，不附加行内注释。
7. frontmatter 后的 Markdown 是可选项目正文，最多 1MB；正文为空时页面不会渲染说明区块。
8. 所有项目（包括 draft）会在构建时由 `import.meta.glob` 自动发现并严格校验；只有 `published` 项目进入公开页面和 sitemap，无需修改 `app/data/projects.ts`。

## 目录结构

```text
app/                 页面、组件、SEO 路由与数据
content/logs/        可提交的 Markdown 日志源文件
content/projects/    可提交的 Markdown 项目源文件
public/media/        已内化的图片资源
Dockerfile           多阶段生产镜像
compose.yml          仅暴露 127.0.0.1:3000
```
