import matter from "gray-matter";

const FILENAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const PUBLICATION_STATUSES = new Set(["draft", "published"]);
const LIFECYCLE_STATUSES = new Set(["active", "planned", "in-progress", "stable", "experimental"]);
const ALLOWED_FIELDS = new Set([
  "order", "title", "description", "publicationStatus", "status", "stack", "currentPhase", "nextStep", "features",
  "repository", "deployedUrl", "architecture", "timeline", "version", "license", "updatedAt",
]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CONTENT_BYTES = 1024 * 1024;

function fail(filePath, field, message) {
  throw new Error(`[projects] ${filePath}: ${field}: ${message}`);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

function assertKnownFields(filePath, value, allowedFields, field) {
  for (const key of Object.keys(value)) {
    if (!allowedFields.has(key)) fail(filePath, `${field}.${key}`, "field is not allowed");
  }
}

function requiredString(filePath, value, field, maxLength) {
  if (typeof value !== "string") fail(filePath, field, "must be a string");
  const normalized = value.trim();
  if (!normalized) fail(filePath, field, "must not be empty");
  if (normalized.length > maxLength) fail(filePath, field, `must be at most ${maxLength} characters`);
  return normalized;
}

function optionalString(filePath, value, field, maxLength) {
  if (value === undefined) return undefined;
  return requiredString(filePath, value, field, maxLength);
}

function stringArray(filePath, value, field, maxItems, maxItemLength) {
  if (!Array.isArray(value)) fail(filePath, field, "must be an array");
  if (value.length > maxItems) fail(filePath, field, `must contain at most ${maxItems} items`);
  return value.map((item, index) => requiredString(filePath, item, `${field}[${index}]`, maxItemLength));
}

function httpsUrl(filePath, value, field) {
  if (value === undefined) return undefined;
  const normalized = requiredString(filePath, value, field, 2048);
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    fail(filePath, field, "must be a valid HTTPS URL");
  }
  if (parsed.protocol !== "https:") fail(filePath, field, "must use HTTPS");
  return normalized;
}

function unquoteDateLiteral(value) {
  const normalized = value.trim();
  const quote = normalized[0];
  return (quote === "'" || quote === '"') && normalized.at(-1) === quote ? normalized.slice(1, -1) : normalized;
}

function topLevelDateLiteral(matterSource, field) {
  const match = matterSource.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, "m"));
  return match ? unquoteDateLiteral(match[1]) : "";
}

function timelineDateLiterals(matterSource) {
  return [...matterSource.matchAll(/^\s+(?:-\s*)?date:\s*(.*?)\s*$/gm)].map(match => unquoteDateLiteral(match[1]));
}

export function isValidProjectDate(date) {
  if (!DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

function strictDate(filePath, date, field) {
  if (!isValidProjectDate(date)) fail(filePath, field, "must be a real calendar date using YYYY-MM-DD without an inline comment");
  return date;
}

function architectureItems(filePath, value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) fail(filePath, "architecture", "must be an array");
  if (value.length > 30) fail(filePath, "architecture", "must contain at most 30 items");
  return value.map((item, index) => {
    const field = `architecture[${index}]`;
    if (!isPlainObject(item)) fail(filePath, field, "must be an object");
    assertKnownFields(filePath, item, new Set(["label", "value"]), field);
    return {
      label: requiredString(filePath, item.label, `${field}.label`, 100),
      value: requiredString(filePath, item.value, `${field}.value`, 1000),
    };
  });
}

function timelineItems(filePath, value, matterSource) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) fail(filePath, "timeline", "must be an array");
  if (value.length > 50) fail(filePath, "timeline", "must contain at most 50 items");
  const dates = timelineDateLiterals(matterSource);
  if (dates.length !== value.length) fail(filePath, "timeline", "each item must contain one standalone date scalar");
  return value.map((item, index) => {
    const field = `timeline[${index}]`;
    if (!isPlainObject(item)) fail(filePath, field, "must be an object");
    assertKnownFields(filePath, item, new Set(["date", "title", "description"]), field);
    return {
      date: strictDate(filePath, dates[index], `${field}.date`),
      title: requiredString(filePath, item.title, `${field}.title`, 200),
      description: requiredString(filePath, item.description, `${field}.description`, 1000),
    };
  });
}

export function parseProjectSource(filePath, source) {
  const filename = filePath.replace(/\\/g, "/").split("/").pop() || "";
  if (!FILENAME_PATTERN.test(filename)) fail(filePath, "filename", "must match ^[a-z0-9]+(?:-[a-z0-9]+)*\\.md$");

  const parsed = matter(source);
  const data = parsed.data || {};
  if (!isPlainObject(data)) fail(filePath, "frontmatter", "must be an object");
  assertKnownFields(filePath, data, ALLOWED_FIELDS, "frontmatter");

  if (!Number.isInteger(data.order) || data.order < 1) fail(filePath, "order", "must be a positive integer");
  if (!PUBLICATION_STATUSES.has(data.publicationStatus)) fail(filePath, "publicationStatus", "must be draft or published");
  if (!LIFECYCLE_STATUSES.has(data.status)) fail(filePath, "status", "must be active, planned, in-progress, stable, or experimental");

  if (new TextEncoder().encode(parsed.content).byteLength > MAX_CONTENT_BYTES) fail(filePath, "content", "must be at most 1MB");
  const content = parsed.content.trim();

  const updatedAt = data.updatedAt === undefined
    ? undefined
    : strictDate(filePath, topLevelDateLiteral(parsed.matter, "updatedAt"), "updatedAt");

  return {
    slug: filename.slice(0, -3),
    order: data.order,
    number: String(data.order).padStart(2, "0"),
    title: requiredString(filePath, data.title, "title", 200),
    description: requiredString(filePath, data.description, "description", 1000),
    publicationStatus: data.publicationStatus,
    status: data.status,
    stack: stringArray(filePath, data.stack, "stack", 30, 80),
    currentPhase: requiredString(filePath, data.currentPhase, "currentPhase", 1000),
    nextStep: requiredString(filePath, data.nextStep, "nextStep", 1000),
    features: stringArray(filePath, data.features, "features", 50, 300),
    repository: httpsUrl(filePath, data.repository, "repository"),
    deployedUrl: httpsUrl(filePath, data.deployedUrl, "deployedUrl"),
    architecture: architectureItems(filePath, data.architecture),
    timeline: timelineItems(filePath, data.timeline, parsed.matter),
    version: optionalString(filePath, data.version, "version", 100),
    license: optionalString(filePath, data.license, "license", 100),
    updatedAt,
    content,
  };
}

export function parseProjectCollection(entries) {
  const parsed = entries.map(([filePath, source]) => ({ filePath, project: parseProjectSource(filePath, source) }));
  const slugs = new Map();
  const orders = new Map();
  for (const { filePath, project } of parsed) {
    if (slugs.has(project.slug)) fail(filePath, "slug", `duplicates ${slugs.get(project.slug)}`);
    if (orders.has(project.order)) fail(filePath, "order", `duplicates ${orders.get(project.order)}`);
    slugs.set(project.slug, filePath);
    orders.set(project.order, filePath);
  }
  return parsed.map(({ project }) => project);
}

export function publishedProjects(projects) {
  return projects.filter(project => project.publicationStatus === "published").sort((a, b) => a.order - b.order);
}
