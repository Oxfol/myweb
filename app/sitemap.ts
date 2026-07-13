import type { MetadataRoute } from "next";
import { projects } from "./data/projects";
import { logs } from "./data/logs";
import { buildSitemapEntries } from "./data/sitemap-core.js";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://flowerzc.com";
  const staticRoutes = ["", "/about", "/projects", "/logs", "/infrastructure", "/roadmap", "/contact"];
  return buildSitemapEntries({ base, staticRoutes, projects, logs }) as MetadataRoute.Sitemap;
}
