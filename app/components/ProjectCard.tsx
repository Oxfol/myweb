import Link from "next/link";
import { StatusBadge, TechBadge } from "./SiteShell";
import type { Project } from "../data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return <article className="glass group flex h-full flex-col rounded-[1.5rem] p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[.08] md:p-6"><div className="mb-8 flex items-start justify-between gap-4"><span className="font-mono text-xs text-white/35">{project.number}</span><StatusBadge status={project.status} /></div><div className="flex-1"><h3 className="display text-3xl text-white">{project.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{project.description}</p><div className="mt-5 flex flex-wrap gap-1.5">{project.stack.map((item) => <TechBadge key={item}>{item}</TechBadge>)}</div></div><div className="mt-8 flex items-end justify-between border-t border-white/10 pt-4"><div><p className="text-[11px] text-dim">当前阶段</p><p className="mt-1 text-sm text-white/80">{project.currentPhase}</p></div><Link href={`/projects/${project.slug}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg text-white/65 transition group-hover:border-white/45 group-hover:text-white">↗</Link></div></article>;
}
