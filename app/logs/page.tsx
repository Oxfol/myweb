import { LogsExplorer } from "../components/LogsExplorer";
import { PageHeading, Container } from "../components/SiteShell";
import { QuickSidebar } from "../components/QuickSidebar";
import { logs } from "../data/logs";

export const metadata = { title: "开发日志", description: "Flower ZC 的基础设施、项目和部署开发日志。", alternates: { canonical: "/logs" } };

export default function LogsPage() {
  return <div className="dense-page"><Container><PageHeading eyebrow={`Dev Log / ${String(logs.length).padStart(2, "0")}`} title="开发日志" description="记录真实开发过程、问题与解决方案。支持即时搜索正文、标签和摘要。" /><div className="dense-page-layout"><main><LogsExplorer logs={logs} /></main><QuickSidebar title="日志导航" active="最新日志" items={[{ label: "最新日志", href: "#logs-content" }, { label: "年份", href: "#log-search", value: "2026" }, { label: "标签", href: "#log-search", value: `${new Set(logs.flatMap(log => log.tags)).size} 个` }, { label: "热门文章", href: `/logs/${logs[0]?.slug}` }]} /></div></Container></div>;
}
