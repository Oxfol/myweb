import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { calculateReadingTime, parseLogSource, sortPublishedLogs } from "../app/data/logs-core.js";

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

let workerPromise;
async function render(pathname) {
  workerPromise ||= import(new URL(`../dist/server/index.js?${Date.now()}`, import.meta.url).href).then(module => module.default);
  const worker = await workerPromise;
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
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

test("sitemap includes published logs and excludes drafts", async () => {
  const response = await render("/sitemap.xml");
  const sitemap = await response.text();
  assert.equal(response.status, 200);
  assert.match(sitemap, /2026-07-11-test/);
  assert.doesNotMatch(sitemap, /2026-07-12-draft/);
});
