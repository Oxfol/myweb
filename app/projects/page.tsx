import { Reveal } from "../components/Reveal";
import { Container, SectionHeading } from "../components/SiteShell";
import { ProjectCard } from "../components/ProjectCard";
import { projects } from "../data/projects";

export const metadata = { title: "项目", description: "Flower ZC 正在运行、计划和实验中的开发项目。" };

export default function ProjectsPage() {
  return (
    <div className="page-shell">
      <Container>
        <SectionHeading eyebrow="Projects / 01—06" title={"运行中的系统，\n不是静态作品集。"} description="从 AI Agent 到个人基础设施。每个项目只展示当前状态、技术边界与下一步。" />
        <div className="projects-grid">{projects.map(project => <Reveal key={project.slug}><ProjectCard project={project} /></Reveal>)}</div>
      </Container>
    </div>
  );
}
