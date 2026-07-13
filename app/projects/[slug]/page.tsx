import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CheckCircleIcon, CubeIcon, GitBranchIcon, GithubLogoIcon, LightningIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { Reveal } from "../../components/Reveal";
import { Container, StatusBadge, TechBadge } from "../../components/SiteShell";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { getProjectFacts, getProjectSections } from "../../data/project-detail.js";
import { getProject, projects } from "../../data/projects";
import { logs } from "../../data/logs";

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const project = getProject(slug);
  return {
    title: project?.title || "项目详情",
    description: project?.description,
    alternates: { canonical: `/projects/${slug}` },
  };
}

const featureIcons = [LightningIcon, CubeIcon, GitBranchIcon];

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const related = projects.filter(item => item.slug !== project.slug && item.stack.some(tech => project.stack.includes(tech))).slice(0, 3);
  const relatedLogs = logs.filter(log => log.tags.some(tag => project.stack.includes(tag))).slice(0, 3);
  const hasRelatedContent = related.length > 0 || relatedLogs.length > 0;
  const sections = getProjectSections(project, hasRelatedContent);
  const sectionNumbers = new Map(sections.map((section, index) => [section.id, String(index + 1).padStart(2, "0")]));
  const facts = getProjectFacts(project);

  return <div className="page-shell detail-page project-detail-page"><Container>
    <nav className="detail-breadcrumb" aria-label="面包屑"><Link href="/">首页</Link><span>/</span><Link href="/projects">Projects</Link><span>/</span><strong>{project.title}</strong></nav>
    <Reveal className="detail-heading"><div><div className="detail-kicker"><span>{project.number}</span><StatusBadge status={project.status} /></div><h1>{project.title}</h1><p>{project.description}</p></div><Link href="/projects" className="back-link"><ArrowLeftIcon size={16} />返回项目</Link></Reveal>
    <div className="detail-grid"><main className="detail-main">
      <section className="detail-section" id="overview"><div className="section-heading"><span>{sectionNumbers.get("overview")}</span><div><h2>Overview</h2><p>当前状态、公开入口与下一步计划。</p></div></div><div className="overview-card"><div><small>Status</small><strong><StatusBadge status={project.status} /></strong></div>{project.repository && <div><small>Repository</small><strong><a href={project.repository} target="_blank" rel="noreferrer">GitHub <ArrowUpRightIcon size={14} /></a></strong></div>}{project.deployedUrl && <div><small>Deployment</small><strong><a href={project.deployedUrl} target="_blank" rel="noreferrer">Online <ArrowUpRightIcon size={14} /></a></strong></div>}{project.currentPhase && <div><small>Current phase</small><strong>{project.currentPhase}</strong></div>}{project.nextStep && <div><small>Next step</small><strong>{project.nextStep}</strong></div>}{project.updatedAt && <div><small>Last updated</small><strong>{project.updatedAt}</strong></div>}</div></section>
      {sectionNumbers.has("content") && <section className="detail-section" id="content"><div className="section-heading"><span>{sectionNumbers.get("content")}</span><div><h2>Details</h2><p>项目内容文件中提供的补充说明。</p></div></div><MarkdownRenderer content={project.content} /></section>}
      {sectionNumbers.has("features") && <section className="detail-section" id="features"><div className="section-heading"><span>{sectionNumbers.get("features")}</span><div><h2>Features</h2><p>项目数据中明确记录的能力与边界。</p></div></div><div className="feature-grid">{project.features.map((feature, index) => { const Icon = featureIcons[index % featureIcons.length]; return <article className="feature-card" key={feature}><Icon size={20} /><h3>Feature {String(index + 1).padStart(2, "0")}</h3><p>{feature}</p></article>; })}</div></section>}
      {sectionNumbers.has("architecture") ? <section className="detail-section" id="architecture"><div className="section-heading"><span>{sectionNumbers.get("architecture")}</span><div><h2>Architecture</h2><p>项目数据中明确记录的系统组成。</p></div></div><div className="architecture-diagram">{project.architecture!.map((node, index) => <Fragment key={`${node.label}-${node.value}`}><div className="architecture-node"><small>{node.label}</small><strong>{node.value}</strong></div>{index < project.architecture!.length - 1 && <ArrowRightIcon size={18} />}</Fragment>)}</div></section> : null}
      {sectionNumbers.has("tech-stack") && <section className="detail-section" id="tech-stack"><div className="section-heading"><span>{sectionNumbers.get("tech-stack")}</span><div><h2>Tech Stack</h2><p>数据源明确声明的技术与服务。</p></div></div><div className="detail-tech-grid">{project.stack.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div></section>}
      {sectionNumbers.has("timeline") ? <section className="detail-section" id="timeline"><div className="section-heading"><span>{sectionNumbers.get("timeline")}</span><div><h2>Development Timeline</h2><p>项目数据中记录的开发节点。</p></div></div><div className="detail-timeline">{project.timeline!.map(item => <div key={`${item.date}-${item.title}`}><time>{item.date}</time><div><h3>{item.title}</h3><p>{item.description}</p></div><CheckCircleIcon size={17} /></div>)}</div></section> : null}
      {sectionNumbers.has("related") && <section className="detail-section related-section" id="related"><div className="section-heading"><span>{sectionNumbers.get("related")}</span><div><h2>Related Content</h2><p>基于已声明技术标签关联的项目与日志。</p></div></div><div className="related-detail-grid">{related.map(item => <Link key={item.slug} href={`/projects/${item.slug}`}><small>PROJECT</small><strong>{item.title}</strong><span>{item.description}</span><ArrowRightIcon size={15} /></Link>)}{relatedLogs.map(item => <Link key={item.slug} href={`/logs/${item.slug}`}><small>LOG · {item.date}</small><strong>{item.title}</strong><span>{item.summary}</span><ArrowRightIcon size={15} /></Link>)}</div></section>}
    </main><aside className="detail-sidebar"><div className="sidebar-card"><p className="eyebrow">Project Index</p><strong>{project.number} / {String(projects.length).padStart(2, "0")}</strong><StatusBadge status={project.status} /><div className="sidebar-actions">{project.repository && <a href={project.repository} target="_blank" rel="noreferrer"><GithubLogoIcon size={16} />GitHub</a>}{project.deployedUrl && <a href={project.deployedUrl} target="_blank" rel="noreferrer"><ArrowUpRightIcon size={16} />Demo</a>}</div></div><div className="sidebar-card"><p className="eyebrow">Quick Navigation</p><nav className="sidebar-links">{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav></div>{facts.length > 0 && <div className="sidebar-card"><p className="eyebrow">Project Facts</p><dl className="sidebar-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>}</aside></div>
  </Container></div>;
}
