import { parseProjectCollection, publishedProjects } from "./projects-core.js";

export type ProjectArchitectureNode = { label: string; value: string };
export type ProjectTimelineItem = { date: string; title: string; description: string };

export type Project = {
  slug: string;
  order: number;
  number: string;
  title: string;
  description: string;
  publicationStatus: "draft" | "published";
  status: "active" | "planned" | "in-progress" | "stable" | "experimental";
  stack: string[];
  currentPhase: string;
  nextStep: string;
  features: string[];
  repository?: string;
  deployedUrl?: string;
  architecture?: ProjectArchitectureNode[];
  timeline?: ProjectTimelineItem[];
  version?: string;
  license?: string;
  updatedAt?: string;
  content: string;
};

const markdownModules = import.meta.glob("../../content/projects/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const parsedProjects = parseProjectCollection(Object.entries(markdownModules));

export const projects: Project[] = publishedProjects(parsedProjects);

export function getProject(slug: string) {
  return projects.find(project => project.slug === slug);
}
