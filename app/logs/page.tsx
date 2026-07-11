import { LogCard } from "../components/LogCard";
import { Reveal } from "../components/Reveal";
import { Container, SectionHeading } from "../components/SiteShell";
import { logs } from "../data/logs";

export const metadata = { title: "开发日志", description: "Flower ZC 的基础设施、项目和部署开发日志。" };

export default function LogsPage() {
  return (
    <div className="page-shell logs-page">
      <Container>
        <SectionHeading eyebrow={`Dev Log / ${String(logs.length).padStart(2, "0")}`} title={"把过程留下来，\n让系统可以复盘。"} description="保留命令、错误、根因和修复逻辑。日志来自仓库中的 Markdown，并在每次构建时自动更新。" />
        <div className="log-timeline logs-index">{logs.map(log => <Reveal key={log.slug}><LogCard log={log} /></Reveal>)}</div>
      </Container>
    </div>
  );
}
