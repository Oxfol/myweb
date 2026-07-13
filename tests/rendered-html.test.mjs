import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { calculateReadingTime, isValidCalendarDate, parseLogSource, sortPublishedLogs } from "../app/data/logs-core.js";
import { getProjectFacts, getProjectSections } from "../app/data/project-detail.js";

const contentDir = new URL("../content/logs/", import.meta.url);
const logsSourceUrl = new URL("../app/data/logs.ts", import.meta.url);
const logFiles = (await readdir(contentDir)).filter(file => file.endsWith(".md"));
const sources = await Promise.all(logFiles.map(async file => ({ file, source: await readFile(new URL(file, contentDir), "utf8") })));
const parsed = sources.map(({ file, source }) => parseLogSource(`content/logs/${file}`, source));
const published = sortPublishedLogs(parsed);

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
    details: ["Feature"],
    stack: ["TypeScript"],
    architecture: [{ label: "CORE", value: "Service" }],
    timeline: [{ date: "2026-07-13", title: "Started", description: "Initial work" }],
    version: "v1.0.0",
    license: "MIT",
    updatedAt: "2026-07-13",
  };
  assert.deepEqual(getProjectSections(complete, true).map(section => section.id), ["overview", "features", "architecture", "tech-stack", "timeline", "related"]);
  assert.deepEqual(getProjectFacts(complete), [["Version", "v1.0.0"], ["License", "MIT"], ["Updated", "2026-07-13"]]);

  const minimal = { details: [], stack: [] };
  assert.deepEqual(getProjectSections(minimal, false).map(section => section.id), ["overview"]);
  assert.deepEqual(getProjectFacts(minimal), []);
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
  assert.ok(anchorTargets.includes("overview"));
  assert.ok(anchorTargets.includes("features"));
  assert.ok(anchorTargets.includes("tech-stack"));
  assert.ok(!anchorTargets.includes("architecture"));
  assert.ok(!anchorTargets.includes("timeline"));
  for (const target of anchorTargets) {
    assert.equal([...html.matchAll(new RegExp(`id="${target}"`, "g"))].length, 1, `#${target} must have one target`);
  }
  assert.doesNotMatch(html, /Development Timeline|Project Facts|Docker \/ VPS|GitHub Actions|Postgres/);
  assert.match(html, /Python/);
  assert.match(html, /Playwright/);
  assert.match(html, /LLM/);
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
});

test("sitemap uses log dates and omits fabricated dates elsewhere", async () => {
  const sitemap = await renderHtml("/sitemap.xml");
  const entries = [...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map(match => match[1]);
  const byLocation = new Map(entries.map(entry => [entry.match(/<loc>(.*?)<\/loc>/)?.[1], entry]));

  for (const pathname of ["", "/about", "/projects", "/logs", "/infrastructure", "/roadmap", "/contact"]) {
    assert.doesNotMatch(byLocation.get(`https://flowerzc.com${pathname}`) || "", /<lastmod>/);
  }
  for (const slug of ["hermes-agent", "wechat-api", "ai-service", "trading-bot", "webhook-service", "dev-infrastructure"]) {
    assert.doesNotMatch(byLocation.get(`https://flowerzc.com/projects/${slug}`) || "", /<lastmod>/);
  }
  for (const log of published) {
    assert.match(byLocation.get(`https://flowerzc.com/logs/${log.slug}`) || "", new RegExp(`<lastmod>${log.date}</lastmod>`));
  }
});
