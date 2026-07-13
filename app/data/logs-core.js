import matter from "gray-matter";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = new Set(["draft", "published"]);

function readDateLiteral(matterSource) {
  const match = matterSource.match(/^date:\s*(.*?)\s*$/m);
  if (!match) return "";
  const value = match[1].trim();
  const quote = value[0];
  return (quote === "'" || quote === '"') && value.at(-1) === quote ? value.slice(1, -1) : value;
}

export function isValidCalendarDate(date) {
  if (!DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
}

export function calculateReadingTime(content) {
  const chineseCharacters = (content.match(/[\u3400-\u9fff]/g) || []).length;
  const englishWords = (content.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
  return `${Math.max(1, Math.ceil(chineseCharacters / 400 + englishWords / 200))} 分钟`;
}

function fail(filePath, message) {
  throw new Error(`[logs] ${filePath}: ${message}`);
}

export function parseLogSource(filePath, source) {
  const parsed = matter(source);
  const data = parsed.data || {};
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const date = readDateLiteral(parsed.matter);
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  const tags = data.tags;
  const status = typeof data.status === "string" ? data.status.trim() : "";
  const slug = filePath.split(/[\\/]/).pop().replace(/\.md$/, "");

  if (!title) fail(filePath, "title is required");
  if (!isValidCalendarDate(date)) fail(filePath, "date must be a real calendar date using YYYY-MM-DD");
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== "string")) fail(filePath, "tags must be an array of strings");
  if (!VALID_STATUSES.has(status)) fail(filePath, "status must be draft or published");
  if (status === "published" && !summary) fail(filePath, "summary is required for published logs");
  if (status === "draft" && !summary) console.warn(`[logs] ${filePath}: draft log has an empty summary`);

  const content = parsed.content.trim();
  return { slug, title, date, summary, tags, status, readingTime: calculateReadingTime(content), content };
}

export function sortPublishedLogs(items) {
  return items
    .filter(item => item.status === "published")
    .sort((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}
