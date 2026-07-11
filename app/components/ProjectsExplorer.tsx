"use client";

import Link from "next/link";
import { ArrowUpRightIcon, GithubLogoIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { Project } from "../data/projects";
import { StatusBadge, TechBadge } from "./SiteShell";

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部状态");
  const [tech, setTech] = useState("全部技术");
  const [sort, setSort] = useState("最近更新");
  const categories = ["全部状态", ...Array.from(new Set(projects.map(project => project.status)))];
  const techs = ["全部技术", ...Array.from(new Set(projects.flatMap(project => project.stack)))];
  const filtered = useMemo(() => [...projects].filter(project => `${project.title} ${project.description} ${project.stack.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (category === "全部状态" || project.status === category) && (tech === "全部技术" || project.stack.includes(tech))).sort((a, b) => sort === "最近更新" ? a.number.localeCompare(b.number) : b.number.localeCompare(a.number)), [projects, query, category, tech, sort]);
  return <div className="projects-explorer"><div className="projects-toolbar"><label className="search-field"><MagnifyingGlassIcon size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索项目、技术栈或描述" aria-label="搜索项目" />{query && <button type="button" aria-label="清除搜索" onClick={() => setQuery("")}><XIcon size={15} /></button>}</label><select value={category} onChange={event => setCategory(event.target.value)} aria-label="按状态筛选"><option value="全部状态">全部状态</option>{categories.slice(1).map(item => <option key={item} value={item}>{item}</option>)}</select><select value={tech} onChange={event => setTech(event.target.value)} aria-label="按技术筛选">{techs.map(item => <option key={item}>{item}</option>)}</select><select value={sort} onChange={event => setSort(event.target.value)} aria-label="项目排序"><option>最近更新</option><option>编号倒序</option></select></div><div className="projects-dense-grid">{filtered.map(project => <article className="dense-project-card" key={project.slug}><div className="dense-project-top"><span className="project-logo">{project.title.slice(0, 1)}</span><StatusBadge status={project.status} /><span className="project-number">{project.number}</span></div><Link href={`/projects/${project.slug}`}><h2>{project.title}</h2><p>{project.description}</p></Link><div className="project-tags">{project.stack.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div><div className="dense-project-foot"><span>最近更新 · {project.currentPhase}</span><div>{project.repository ? <a href={project.repository} target="_blank" rel="noreferrer" aria-label="GitHub"><GithubLogoIcon size={16} /></a> : <span className="link-muted">GitHub</span>}{project.deployedUrl ? <a href={project.deployedUrl} target="_blank" rel="noreferrer" aria-label="Demo"><ArrowUpRightIcon size={16} /></a> : <span className="link-muted">Demo</span>}</div></div></article>)}</div>{!filtered.length && <div className="empty-state">没有匹配的项目。</div>}</div>;
}
