import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { StatusBadge, TechBadge } from "./SiteShell";
import { SpotlightPanel } from "./SpotlightPanel";
import type { Project } from "../data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <SpotlightPanel className="project-card">
      <article>
        <div className="project-card-top"><span className="project-number">{project.number}</span><StatusBadge status={project.status} /></div>
        <div className="project-card-body">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="project-tags">{project.stack.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div>
        </div>
        <div className="project-card-footer">
          <div><span>当前阶段</span><strong>{project.currentPhase}</strong></div>
          <Link href={`/projects/${project.slug}`} aria-label={`查看 ${project.title}`}><ArrowUpRightIcon size={19} /></Link>
        </div>
      </article>
    </SpotlightPanel>
  );
}
