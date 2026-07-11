import { calculateReadingTime, parseLogSource, sortPublishedLogs } from "./logs-core.js";

export type LogMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: string;
  content: string;
};

const markdownModules = import.meta.glob("../../content/logs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const parsedLogs = Object.entries(markdownModules).map(([filePath, source]) => parseLogSource(filePath, source));

export const logs: LogMeta[] = sortPublishedLogs(parsedLogs).map(log => ({
  slug: log.slug,
  title: log.title,
  date: log.date,
  summary: log.summary,
  tags: log.tags,
  readingTime: log.readingTime,
  content: log.content,
}));

export function getLog(slug: string) {
  return logs.find(log => log.slug === slug);
}

export { calculateReadingTime };
