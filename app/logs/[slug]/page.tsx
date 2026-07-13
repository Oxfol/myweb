import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, CalendarBlankIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { ArticleExperience, type ArticleHeading } from "../../components/ArticleExperience";
import { ArticleActions } from "../../components/ArticleActions";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { Container, TechBadge } from "../../components/SiteShell";
import { getLog, logs } from "../../data/logs";

export function generateStaticParams() { return logs.map(log => ({ slug: log.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const slug = (await params).slug; const log = getLog(slug); return { title: log?.title || "日志", description: log?.summary, alternates: { canonical: `/logs/${slug}` } }; }
function getHeadings(content: string): ArticleHeading[] { const used = new Map<string, number>(); return content.split("\n").flatMap(line => { const match = line.match(/^(##|###)\s+(.+)$/); if (!match) return []; const label = match[2].trim(); const base = label.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "") || "section"; const count = used.get(base) || 0; used.set(base, count + 1); return [{ id: count ? `${base}-${count + 1}` : base, label, level: match[1] === "###" ? 3 : 2 } as ArticleHeading]; }); }

export default async function LogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const log = getLog((await params).slug); if (!log) notFound();
  const index = logs.findIndex(item => item.slug === log.slug); const previous = logs[index + 1]; const next = logs[index - 1]; const headings = getHeadings(log.content);
  const sidebar = <><div className="sidebar-card"><p className="eyebrow">Log Metadata</p><div className="log-sidebar-meta"><span><CalendarBlankIcon size={15} />{log.date}</span><span><ClockIcon size={15} />{log.readingTime}</span></div><div className="log-tags">{log.tags.map(tag => <TechBadge key={tag}>{tag}</TechBadge>)}</div><ArticleActions /></div><div className="sidebar-card"><p className="eyebrow">Quick Actions</p><nav className="sidebar-links"><Link href="/logs"><ArrowLeftIcon size={15} />返回日志列表</Link><a href="#related-logs">Related Logs</a></nav></div></>;
  return <div className="page-shell detail-page article-page"><Container><nav className="detail-breadcrumb" aria-label="面包屑"><Link href="/">首页</Link><span>/</span><Link href="/logs">Logs</Link><span>/</span><strong>{log.slug}</strong></nav><header className="detail-heading article-detail-heading"><div><div className="article-meta"><span>{log.date}</span><span><ClockIcon size={14} />{log.readingTime}</span></div><h1>{log.title}</h1><p>{log.summary}</p></div><Link href="/logs" className="back-link"><ArrowLeftIcon size={16} />返回日志</Link></header><ArticleExperience headings={headings} sidebar={sidebar}><MarkdownRenderer content={log.content} /></ArticleExperience><nav className="article-pagination" aria-label="日志翻页"><div>{previous && <Link href={`/logs/${previous.slug}`}><ArrowLeftIcon size={16} /><span><small>上一篇</small>{previous.title}</span></Link>}</div><div>{next && <Link href={`/logs/${next.slug}`}><span><small>下一篇</small>{next.title}</span><ArrowRightIcon size={16} /></Link>}</div></nav><section className="related-logs" id="related-logs"><div className="section-heading"><span>Related</span><div><h2>Related Logs</h2><p>来自相同技术标签的开发记录。</p></div></div><div>{logs.filter(item => item.slug !== log.slug && item.tags.some(tag => log.tags.includes(tag))).slice(0, 3).map(item => <Link key={item.slug} href={`/logs/${item.slug}`}><span>{item.date}</span>{item.title}<ArrowRightIcon size={15} /></Link>)}</div></section></Container></div>;
}
