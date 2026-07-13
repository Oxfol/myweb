import type { MetadataRoute } from "next";
import { projects } from "./data/projects";
import { logs } from "./data/logs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://flowerzc.com";
  const staticRoutes = ["", "/about", "/projects", "/logs", "/infrastructure", "/roadmap", "/contact"];
  return [
    ...staticRoutes.map(path => ({ url: `${base}${path}`, changeFrequency: "weekly" as const })),
    ...projects.map(project => ({
      url: `${base}/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      ...(project.updatedAt ? { lastModified: project.updatedAt } : {}),
    })),
    ...logs.map(log => ({ url: `${base}/logs/${log.slug}`, lastModified: log.date, changeFrequency: "monthly" as const })),
  ];
}
