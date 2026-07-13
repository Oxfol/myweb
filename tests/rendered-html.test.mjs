import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { calculateReadingTime, isValidCalendarDate, parseLogSource, sortPublishedLogs } from "../app/data/logs-core.js";
import { isValidProjectDate, parseProjectCollection, parseProjectSource, publishedProjects } from "../app/data/projects-core.js";
import { getProjectFacts, getProjectSections } from "../app/data/project-detail.js";
import { buildSitemapEntries } from "../app/data/sitemap-core.js";
import { legacyProjects } from "./fixtures/legacy-projects.mjs";

const contentDir = new URL("../content/logs/", import.meta.url);
const logsSourceUrl = new URL("../app/data/logs.ts", import.meta.url);
const logFiles = (await readdir(contentDir)).filter(file => file.endsWith(".md"));
const sources = await Promise.all(logFiles.map(async file => ({ file, source: await readFile(new URL(file, contentDir), "utf8") })));
const parsed = sources.map(({ file, source }) => parseLogSource(`content/logs/${file}`, source));
const published = sortPublishedLogs(parsed);
const projectsDir = new URL("../content/projects/", import.meta.url);
const projectsSourceUrl = new URL("../app/data/projects.ts", import.meta.url);
const projectFiles = (await readdir(projectsDir)).filter(file => file.endsWith(".md"));
const projectSources = await Promise.all(projectFiles.map(async file => [
  `content/projects/${file}`,
  await readFile(new URL(file, projectsDir), "utf8"),
]));
const parsedProjects = parseProjectCollection(projectSources);
const publicProjects = publishedProjects(parsedProjects);

test("automatically discovers at least three Markdown logs", async () => {
  const source = await readFile(logsSourceUrl, "utf8");
  assert.ok(logFiles.length >= 3);
  assert.match(source, /import\.meta\.glob\(.*content\/logs\/\*\.md/s);
  assert.doesNotMatch(source, /2026-07-11-test\.md/);
});

test("parses front matter and creates a filename slug", () => {
  const log = parsed.find(item => item.slug === "2026-07-11-test");
  assert.ok(log);
  assert.equal(log.title, "test");
  assert.equal(log.date, "2026-07-11");
  assert.deepEqual(log.tags, ["test"]);
  assert.equal(log.status, "published");
  assert.equal(log.content, "test");
});

test("only published logs enter the public collection", () => {
  assert.ok(published.some(log => log.slug === "2026-07-11-test"));
  assert.ok(!published.some(log => log.slug === "2026-07-12-draft"));
});

test("sorts by date descending, then slug descending", () => {
  const sorted = sortPublishedLogs([
    { slug: "a", date: "2026-07-11", status: "published" },
    { slug: "c", date: "2026-07-12", status: "published" },
    { slug: "b", date: "2026-07-11", status: "published" },
  ]);
  assert.deepEqual(sorted.map(log => log.slug), ["c", "b", "a"]);
});

test("calculates reading time without manual metadata", () => {
  assert.equal(calculateReadingTime("中".repeat(400)), "1 分钟");
  assert.equal(calculateReadingTime(Array.from({ length: 200 }, () => "word").join(" ")), "1 分钟");
  assert.equal(calculateReadingTime("中".repeat(801)), "3 分钟");
  assert.equal(parsed.find(log => log.slug === "2026-07-11-test").readingTime, "1 分钟");
});

test("invalid published front matter fails with the file path", () => {
  assert.throws(
    () => parseLogSource("content/logs/bad.md", "---\ndate: 2026-07-11\ntags: []\nstatus: published\n---\nbody"),
    /content\/logs\/bad\.md: title is required/,
  );
  assert.throws(
    () => parseLogSource("content/logs/bad-status.md", "---\ntitle: Bad\ndate: 2026-07-11\nsummary: Bad\ntags: []\nstatus: stable\n---\nbody"),
    /content\/logs\/bad-status\.md: status must be draft or published/,
  );
});

function logSource({ date, summary = "Summary", status = "published" }) {
  return `---\ntitle: Valid title\ndate: ${date}\nsummary: '${summary}'\ntags:\n  - test\nstatus: ${status}\n---\nbody`;
}

test("accepts real calendar dates and leap days", () => {
  assert.equal(isValidCalendarDate("2026-07-13"), true);
  assert.equal(isValidCalendarDate("2024-02-29"), true);
  assert.equal(isValidCalendarDate("2000-02-29"), true);
  assert.equal(parseLogSource("content/logs/leap.md", logSource({ date: "2024-02-29" })).date, "2024-02-29");
});

test("rejects impossible dates without JavaScript date rollover", () => {
  for (const date of ["2026-02-30", "2026-13-01", "2026-00-10", "2026-04-31", "1900-02-29", "2026-7-13"]) {
    assert.equal(isValidCalendarDate(date), false);
    assert.throws(
      () => parseLogSource(`content/logs/${date}.md`, logSource({ date })),
      new RegExp(`content/logs/${date.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.md: date must be a real calendar date using YYYY-MM-DD`),
    );
  }
});

test("rejects an empty published summary and an invalid status", () => {
  assert.throws(
    () => parseLogSource("content/logs/empty-summary.md", logSource({ date: "2026-07-13", summary: "   " })),
    /content\/logs\/empty-summary\.md: summary is required for published logs/,
  );
  assert.throws(
    () => parseLogSource("content/logs/invalid-status.md", logSource({ date: "2026-07-13", status: "stable" })),
    /content\/logs\/invalid-status\.md: status must be draft or published/,
  );
});

test("project detail sections and facts only expose supplied data", () => {
  const complete = {
    content: "Project details",
    features: ["Feature"],
    stack: ["TypeScript"],
    architecture: [{ label: "CORE", value: "Service" }],
    timeline: [{ date: "2026-07-13", title: "Started", description: "Initial work" }],
    version: "v1.0.0",
    license: "MIT",
    updatedAt: "2026-07-13",
  };
  assert.deepEqual(getProjectSections(complete, true).map(section => section.id), ["overview", "content", "features", "architecture", "tech-stack", "timeline", "related"]);
  assert.deepEqual(getProjectFacts(complete), [["Version", "v1.0.0"], ["License", "MIT"], ["Updated", "2026-07-13"]]);

  const minimal = { content: "", features: [], stack: [] };
  assert.deepEqual(getProjectSections(minimal, false).map(section => section.id), ["overview"]);
  assert.deepEqual(getProjectFacts(minimal), []);
});

function projectSource(overrides = {}, body = "") {
  const data = {
    order: 1,
    title: "Fixture project",
    description: "Fixture description",
    publicationStatus: "published",
    status: "active",
    stack: ["TypeScript"],
    currentPhase: "Validation",
    nextStep: "Release",
    features: ["Strict parsing"],
    ...overrides,
  };
  const scalar = value => typeof value === "string" ? value : JSON.stringify(value);
  const lines = Object.entries(data).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      if (key === "architecture" || key === "timeline") {
        return [`${key}:`, ...value.flatMap(item => [
          `  - ${Object.keys(item)[0]}: ${scalar(Object.values(item)[0])}`,
          ...Object.entries(item).slice(1).map(([itemKey, itemValue]) => `    ${itemKey}: ${scalar(itemValue)}`),
        ])];
      }
      return [`${key}:`, ...value.map(item => `  - ${scalar(item)}`)];
    }
    return [`${key}: ${scalar(value)}`];
  });
  return `---\n${lines.join("\n")}\n---\n${body}`;
}

test("automatically discovers and losslessly migrates the six public projects", async () => {
  const source = await readFile(projectsSourceUrl, "utf8");
  assert.equal(projectFiles.length, 6);
  assert.match(source, /import\.meta\.glob\(.*content\/projects\/\*\.md/s);
  assert.doesNotMatch(source, /Hermes Agent|微信小程序海报 API/);
  assert.deepEqual(publicProjects.map(project => ({
    slug: project.slug,
    order: project.order,
    title: project.title,
    description: project.description,
    status: project.status,
    stack: project.stack,
    currentPhase: project.currentPhase,
    nextStep: project.nextStep,
    features: project.features,
    ...(project.deployedUrl ? { deployedUrl: project.deployedUrl } : {}),
  })), legacyProjects);
  assert.deepEqual(publicProjects.map(project => project.slug), legacyProjects.map(project => project.slug));
  assert.ok(publicProjects.every(project => project.publicationStatus === "published"));
  assert.ok(publicProjects.every(project => project.content === ""));
});

test("parses the complete project contract and keeps publication status separate", () => {
  const project = parseProjectSource("content/projects/full-contract.md", projectSource({
    publicationStatus: "draft",
    status: "stable",
    repository: "https://github.com/Oxfol/myweb",
    deployedUrl: "https://flowerzc.com",
    architecture: [{ label: "Web", value: "Application" }],
    timeline: [{ date: "2024-02-29", title: "Started", description: "Initial work" }],
    version: "v1.0.0",
    license: "MIT",
    updatedAt: "2026-07-13",
  }, "## Overview\n\nSafe project body."));
  assert.equal(project.slug, "full-contract");
  assert.equal(project.publicationStatus, "draft");
  assert.equal(project.status, "stable");
  assert.equal(project.number, "01");
  assert.equal(project.timeline[0].date, "2024-02-29");
  assert.equal(project.updatedAt, "2026-07-13");
  assert.match(project.content, /Safe project body/);
});

test("filters drafts before list, detail parameters, related projects, and sitemap", async () => {
  const collection = parseProjectCollection([
    ["content/projects/public-fixture.md", projectSource({ order: 1 })],
    ["content/projects/draft-fixture.md", projectSource({ order: 2, publicationStatus: "draft", status: "planned" })],
  ]);
  const visible = publishedProjects(collection);
  assert.deepEqual(visible.map(project => project.slug), ["public-fixture"]);
  assert.equal(visible.find(project => project.slug === "draft-fixture"), undefined);
  assert.equal(visible.filter(item => item.slug !== "public-fixture").some(item => item.slug === "draft-fixture"), false);
  assert.deepEqual(buildSitemapEntries({ base: "https://flowerzc.com", staticRoutes: [], projects: visible, logs: [] }).map(entry => entry.url), ["https://flowerzc.com/projects/public-fixture"]);
  const detailSource = await readFile(new URL("../app/projects/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(detailSource, /projects\.map\(project => \(\{ slug: project\.slug \}\)\)/);
  assert.equal((await render("/projects/draft-fixture")).status, 404);
});

test("rejects invalid project fields and duplicate orders", () => {
  assert.equal(isValidProjectDate("2024-02-29"), true);
  for (const date of ["2026-02-30", "2026-13-01", "2026-00-10", "1900-02-29"]) {
    assert.equal(isValidProjectDate(date), false);
    assert.throws(() => parseProjectSource("content/projects/bad-date.md", projectSource({ updatedAt: date })), /bad-date\.md: updatedAt:/);
  }
  assert.throws(() => parseProjectSource("content/projects/commented-date.md", projectSource({ updatedAt: "2026-07-13 # date" })), /commented-date\.md: updatedAt:/);
  assert.throws(() => parseProjectSource("content/projects/http-url.md", projectSource({ repository: "http://example.com/repo" })), /http-url\.md: repository: must use HTTPS/);
  assert.throws(() => parseProjectSource("content/projects/Bad_Name.md", projectSource()), /Bad_Name\.md: filename:/);
  assert.throws(() => parseProjectSource("content/projects/unknown.md", projectSource({ unknownField: "value" })), /unknown\.md: frontmatter\.unknownField: field is not allowed/);
  assert.throws(() => parseProjectSource("content/projects/bad-stack.md", projectSource({ stack: "TypeScript" })), /bad-stack\.md: stack: must be an array/);
  assert.throws(() => parseProjectSource("content/projects/bad-architecture.md", projectSource({ architecture: [{ label: "Web", extra: "invalid" }] })), /bad-architecture\.md: architecture\[0\]\.extra: field is not allowed/);
  assert.throws(() => parseProjectSource("content/projects/bad-publication.md", projectSource({ publicationStatus: "private" })), /bad-publication\.md: publicationStatus:/);
  assert.throws(() => parseProjectSource("content/projects/bad-status.md", projectSource({ publicationStatus: "draft", status: "production" })), /bad-status\.md: status:/);
  assert.throws(() => parseProjectCollection([
    ["content/projects/one.md", projectSource({ order: 1 })],
    ["content/projects/two.md", projectSource({ order: 1 })],
  ]), /two\.md: order: duplicates/);
  assert.throws(() => parseProjectCollection([
    ["content/a/same.md", projectSource({ order: 1 })],
    ["content/b/same.md", projectSource({ order: 2 })],
  ]), /same\.md: slug: duplicates/);
});

test("derives project numbers from order and sorts published projects by order", () => {
  const projects = parseProjectCollection([
    ["content/projects/second.md", projectSource({ order: 2 })],
    ["content/projects/first.md", projectSource({ order: 1 })],
  ]);
  assert.deepEqual(publishedProjects(projects).map(project => [project.slug, project.number]), [["first", "01"], ["second", "02"]]);
});

test("project content is data-driven and rendered only when non-empty", async () => {
  const detailSource = await readFile(new URL("../app/projects/[slug]/page.tsx", import.meta.url), "utf8");
  const rendererSource = await readFile(new URL("../app/components/MarkdownRenderer.tsx", import.meta.url), "utf8");
  assert.match(detailSource, /<MarkdownRenderer content=\{project\.content\}/);
  assert.match(detailSource, /project\.features\.map/);
  assert.doesNotMatch(detailSource, /project\.details/);
  assert.doesNotMatch(rendererSource, /dangerouslySetInnerHTML/);
  assert.deepEqual(getProjectSections({ content: "## Body", features: [], stack: [] }).map(section => section.id), ["overview", "content"]);
  assert.deepEqual(getProjectSections({ content: "   ", features: [], stack: [] }).map(section => section.id), ["overview"]);
});

let workerPromise;
async function render(pathname) {
  workerPromise ||= import(new URL(`../dist/server/index.js?${Date.now()}`, import.meta.url).href).then(module => module.default);
  const worker = await workerPromise;
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

async function renderHtml(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200, `${pathname} should render successfully`);
  return response.text();
}

function canonicalFrom(html) {
  const tag = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/i)?.[0];
  return tag?.match(/\bhref="([^"]+)"/i)?.[1];
}

test("getLog-backed detail route renders the newly added published log", async () => {
  const response = await render("/logs/2026-07-11-test");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /test/);
});

test("draft detail route is not public", async () => {
  const response = await render("/logs/2026-07-12-draft");
  assert.equal(response.status, 404);
});

test("project detail anchors have unique rendered targets and optional sections stay hidden", async () => {
  const html = await renderHtml("/projects/hermes-agent");
  const anchorTargets = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
  const projectSectionIds = ["overview", "content", "features", "architecture", "tech-stack", "timeline", "related"];
  const visibleSectionIds = anchorTargets.filter(target => projectSectionIds.includes(target));
  assert.ok(anchorTargets.includes("overview"));
  assert.ok(anchorTargets.includes("features"));
  assert.ok(anchorTargets.includes("tech-stack"));
  assert.ok(!anchorTargets.includes("content"));
  assert.ok(!anchorTargets.includes("architecture"));
  assert.ok(!anchorTargets.includes("timeline"));
  for (const target of anchorTargets) {
    assert.equal([...html.matchAll(new RegExp(`id="${target}"`, "g"))].length, 1, `#${target} must have one target`);
  }
  const visibleNumbers = visibleSectionIds.map(target => {
    const section = html.match(new RegExp(`<section[^>]*id="${target}"[^>]*>[\\s\\S]*?<div class="section-heading"><span>(\\d{2})</span>`));
    assert.ok(section, `#${target} must render a section number`);
    return section[1];
  });
  assert.deepEqual(visibleNumbers, visibleSectionIds.map((_, index) => String(index + 1).padStart(2, "0")));
  assert.doesNotMatch(html, /Development Timeline|Project Facts|Docker \/ VPS|GitHub Actions|Postgres/);
  assert.match(html, /Python/);
  assert.match(html, /Playwright/);
  assert.match(html, /LLM/);
  assert.match(html, /把一次性的对话能力变成可复用的本地开发服务/);
});

test("canonical URLs point to each page itself", async () => {
  const expected = new Map([
    ["/", "https://flowerzc.com/"],
    ["/projects", "https://flowerzc.com/projects"],
    ["/projects/hermes-agent", "https://flowerzc.com/projects/hermes-agent"],
    ["/logs", "https://flowerzc.com/logs"],
    ["/logs/2026-07-11-test", "https://flowerzc.com/logs/2026-07-11-test"],
  ]);
  for (const [pathname, canonical] of expected) {
    assert.equal(canonicalFrom(await renderHtml(pathname)), canonical);
  }
});

test("sitemap includes published logs and excludes drafts", async () => {
  const response = await render("/sitemap.xml");
  const sitemap = await response.text();
  assert.equal(response.status, 200);
  assert.match(sitemap, /2026-07-11-test/);
  assert.doesNotMatch(sitemap, /2026-07-12-draft/);
  const projectLocations = [...sitemap.matchAll(/<loc>https:\/\/flowerzc\.com\/projects\/([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(projectLocations, publicProjects.map(project => project.slug));
});

test("sitemap uses log dates and omits fabricated dates elsewhere", async () => {
  const sitemap = await renderHtml("/sitemap.xml");
  const entries = [...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map(match => match[1]);
  const byLocation = new Map(entries.map(entry => [entry.match(/<loc>(.*?)<\/loc>/)?.[1], entry]));
  assert.equal(byLocation.size, entries.length, "sitemap URLs must be unique");

  const requireEntry = url => {
    assert.equal(byLocation.has(url), true, `${url} must be present in sitemap`);
    return byLocation.get(url);
  };

  for (const pathname of ["", "/about", "/projects", "/logs", "/infrastructure", "/roadmap", "/contact"]) {
    assert.doesNotMatch(requireEntry(`https://flowerzc.com${pathname}`), /<lastmod>/);
  }
  for (const slug of ["hermes-agent", "wechat-api", "ai-service", "trading-bot", "webhook-service", "dev-infrastructure"]) {
    assert.doesNotMatch(requireEntry(`https://flowerzc.com/projects/${slug}`), /<lastmod>/);
  }
  for (const log of published) {
    assert.match(requireEntry(`https://flowerzc.com/logs/${log.slug}`), new RegExp(`<lastmod>${log.date}</lastmod>`));
  }
});

test("sitemap emits a declared project updatedAt and omits an undeclared one", () => {
  const entries = buildSitemapEntries({
    base: "https://flowerzc.com",
    staticRoutes: [],
    projects: [
      { slug: "dated-fixture", updatedAt: "2026-07-13" },
      { slug: "undated-fixture" },
    ],
    logs: [],
  });
  assert.equal(entries[0].lastModified, "2026-07-13");
  assert.equal("lastModified" in entries[1], false);
});
