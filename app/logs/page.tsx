import { Container, SectionHeading } from "../components/SiteShell";
import { LogCard } from "../components/LogCard";
import { logs } from "../data/logs";
export const metadata = { title: "开发日志", description: "Flower ZC 的基础设施、项目和部署开发日志。" };
export default function LogsPage() { return <div className="py-36 md:py-44"><Container><SectionHeading eyebrow="Dev Log" title="把过程留下来，\n让系统可以复盘。" description="日志直接存储在仓库的 content/logs 中。记录命令、错误、根因和修复，不用数据库，也不写虚构的进度。" /><div className="grid gap-10 lg:grid-cols-[1fr_280px]"><div>{logs.map(log => <LogCard key={log.slug} log={log} />)}</div><aside className="glass h-fit rounded-[1.5rem] p-5"><p className="eyebrow mb-4">写作约定</p><ul className="space-y-3 text-sm leading-6 text-muted"><li>· 按日期倒序</li><li>· 保留关键命令与错误</li><li>· 明确下一步</li><li>· 不公开密钥和敏感日志</li></ul></aside></div></Container></div>; }
