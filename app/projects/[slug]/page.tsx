import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { notFound } from "next/navigation";
import { Reveal } from "../../components/Reveal";
import { Container, StatusBadge, TechBadge } from "../../components/SiteShell";
import { getProject, projects } from "../../data/projects";

export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const project = getProject((await params).slug); return { title: project?.title || "项目详情", description: project?.description }; }

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return (
    <div className="page-shell project-detail-page">
      <Container>
        <Link href="/projects" className="back-link"><ArrowLeftIcon size={16} />返回项目</Link>
        <Reveal className="project-detail-hero">
          <div>
            <div className="detail-kicker"><span>{project.number}</span><StatusBadge status={project.status} /></div>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <div className="project-tags">{project.stack.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div>
          </div>
          <dl className="project-facts">
            <div><dt>当前阶段</dt><dd>{project.currentPhase}</dd></div>
            <div><dt>下一步</dt><dd>{project.nextStep}</dd></div>
            <div><dt>部署</dt><dd>{project.deployedUrl ? <a href={project.deployedUrl} target="_blank" rel="noreferrer">访问线上服务 <ArrowUpRightIcon size={15} /></a> : "暂未公开部署"}</dd></div>
            <div><dt>GitHub</dt><dd>{project.repository || "仓库暂未公开"}</dd></div>
          </dl>
        </Reveal>
        <Reveal className="project-notes">
          <p className="eyebrow">项目说明</p>
          {project.details.map(detail => <p key={detail}>{detail}</p>)}
        </Reveal>
      </Container>
    </div>
  );
}
