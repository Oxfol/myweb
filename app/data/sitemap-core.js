export function buildSitemapEntries({ base, staticRoutes, projects, logs }) {
  return [
    ...staticRoutes.map(path => ({ url: `${base}${path}`, changeFrequency: "weekly" })),
    ...projects.map(project => ({
      url: `${base}/projects/${project.slug}`,
      changeFrequency: "monthly",
      ...(project.updatedAt ? { lastModified: project.updatedAt } : {}),
    })),
    ...logs.map(log => ({
      url: `${base}/logs/${log.slug}`,
      lastModified: log.date,
      changeFrequency: "monthly",
    })),
  ];
}
