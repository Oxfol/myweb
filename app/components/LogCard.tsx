import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon } from "@phosphor-icons/react/ssr";
import { TechBadge } from "./SiteShell";
import type { LogMeta } from "../data/logs";

export function LogCard({ log }: { log: LogMeta }) {
  return (
    <article className="log-card">
      <span className="log-node" aria-hidden="true" />
      <div className="log-meta"><time dateTime={log.date}>{log.date}</time><span><ClockIcon size={13} />{log.readingTime}</span></div>
      <Link href={`/logs/${log.slug}`} className="log-card-link">
        <div>
          <h3>{log.title}</h3>
          <p>{log.summary}</p>
        </div>
        <ArrowUpRightIcon size={22} aria-hidden="true" />
      </Link>
      <div className="log-tags">{log.tags.map(tag => <TechBadge key={tag}>{tag}</TechBadge>)}</div>
    </article>
  );
}
