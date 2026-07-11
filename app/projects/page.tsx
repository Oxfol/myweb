import { ProjectsExplorer } from "../components/ProjectsExplorer";
import { PageHeading, Container } from "../components/SiteShell";
import { QuickSidebar } from "../components/QuickSidebar";
import { projects } from "../data/projects";

export const metadata = { title: "项目", description: "Flower ZC 正在运行、计划和实验中的开发项目。" };

export default function ProjectsPage() {
  return <div className="dense-page"><Container><PageHeading eyebrow="Projects / Portfolio" title="项目" description="运行中的系统、实验中的工具，以及下一步要解决的问题。" /><div className="dense-page-layout"><main><ProjectsExplorer projects={projects} /></main><QuickSidebar title="项目导航" active="全部项目" items={[{ label: "全部项目", href: "#projects-all" }, { label: "运行中", href: "#project-active", value: String(projects.filter(project => project.status === "active").length) }, { label: "计划中", href: "#project-planned", value: String(projects.filter(project => project.status === "planned").length) }, { label: "实验性", href: "#project-experimental", value: String(projects.filter(project => project.status === "experimental").length) }]} /></div></Container></div>;
}
