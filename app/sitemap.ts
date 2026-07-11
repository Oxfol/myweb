import type { MetadataRoute } from "next";
import { projects } from "./data/projects";
import { logs } from "./data/logs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://flowerzc.com";
  const staticRoutes = ["", "/about", "/projects", "/logs", "/infrastructure", "/roadmap", "/contact"];
  return [...staticRoutes.map(path => ({ url: `${base}${path}`, lastModified: new Date("2026-07-11"), changeFrequency: "weekly" as const })), ...projects.map(project => ({ url: `${base}/projects/${project.slug}`, lastModified: new Date("2026-07-11"), changeFrequency: "monthly" as const })), ...logs.map(log => ({ url: `${base}/logs/${log.slug}`, lastModified: new Date(log.date), changeFrequency: "monthly" as const }))];
}
