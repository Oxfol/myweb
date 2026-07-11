import Link from "next/link";
import { TechBadge } from "./SiteShell";
import type { LogMeta } from "../data/logs";

export function LogCard({ log }: { log: LogMeta }) { return <article className="group border-b border-white/10 py-6 first:pt-0"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="max-w-2xl"><div className="mb-3 flex items-center gap-3 text-xs text-dim"><time dateTime={log.date}>{log.date}</time><span>·</span><span>{log.readingTime}</span></div><Link href={`/logs/${log.slug}`} className="display text-2xl text-white transition group-hover:text-[var(--accent-soft)] md:text-3xl">{log.title}</Link><p className="mt-2 text-sm leading-6 text-muted">{log.summary}</p></div><div className="flex flex-wrap gap-1.5 md:justify-end">{log.tags.map(tag => <TechBadge key={tag}>{tag}</TechBadge>)}</div></div></article>; }
