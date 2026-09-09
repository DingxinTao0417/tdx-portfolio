export type GitHubContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type GitHubContributionCalendar = {
  total: number;
  startDate: string;
  endDate: string;
  days: GitHubContributionDay[];
  year: number | null;
};

export const MIN_GITHUB_CONTRIBUTION_YEAR = 2023;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const INTEGER = "(?:\\d{1,3}(?:,\\d{3})+|\\d+)";

export function isGitHubContributionYear(year: number): boolean {
  return Number.isInteger(year)
    && year >= MIN_GITHUB_CONTRIBUTION_YEAR
    && year <= new Date().getUTCFullYear();
}

function attributes(source: string): Record<string, string> {
  return Object.fromEntries(
    Array.from(source.matchAll(/([\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g), ([, key, , value]) => [key, value]),
  );
}

function hasClass(value: string | undefined, name: string): boolean {
  return value?.split(/\s+/).includes(name) ?? false;
}

function dateTimestamp(value: string | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp
    : null;
}

/**
 * Reads only data from GitHub's calendar HTML. Counts come from the tool-tip
 * attached to each cell, not from its relative color level. A changed or
 * incomplete response fails as a whole instead of inventing missing zero days.
 */
export function parseGitHubContributionCalendar(
  html: string,
  year?: number,
): GitHubContributionCalendar | null {
  if (year !== undefined && !isGitHubContributionYear(year)) return null;

  const headings = Array.from(html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi))
    .filter(([, attrs]) => attributes(attrs).id === "js-contribution-activity-description");
  if (headings.length !== 1) return null;
  const summary = headings[0][2].trim().match(
    new RegExp(`^(${INTEGER})\\s+contributions?\\s+in\\s+(the\\s+last\\s+year|\\d{4})$`, "i"),
  );
  if (!summary) return null;
  const summaryYear = /^\d{4}$/.test(summary[2]) ? Number(summary[2]) : null;
  if (summaryYear !== (year ?? null)) return null;
  const total = Number(summary[1].replaceAll(",", ""));
  if (!Number.isSafeInteger(total)) return null;

  const graphs = Array.from(html.matchAll(/<div\b([^>]*)>/gi), ([, attrs]) => attributes(attrs))
    .filter((attrs) => hasClass(attrs.class, "js-calendar-graph"));
  if (graphs.length !== 1) return null;
  const startDate = graphs[0]["data-from"]?.match(/^(\d{4}-\d{2}-\d{2}) 00:00:00 UTC$/)?.[1];
  const endDate = graphs[0]["data-to"]?.match(/^(\d{4}-\d{2}-\d{2}) 23:59:59 UTC$/)?.[1];
  const start = dateTimestamp(startDate);
  const end = dateTimestamp(endDate);
  if (!startDate || !endDate || start === null || end === null || end < start) return null;
  const expectedDays = (end - start) / DAY_MS + 1;
  if (year !== undefined) {
    if (startDate !== `${year}-01-01` || endDate !== `${year}-12-31`) return null;
  } else if (expectedDays < 365 || expectedDays > 373) {
    // GitHub extends its rolling year back to the beginning of the first week.
    return null;
  }

  const tables = Array.from(html.matchAll(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi))
    .filter(([, attrs]) => hasClass(attributes(attrs).class, "ContributionCalendar-grid"));
  if (tables.length !== 1) return null;
  const table = tables[0][2];
  const tooltips = new Map<string, { count: number; month: number; day: number; year?: number }>();
  for (const [, attrs, content] of table.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const target = attributes(attrs).for;
    const tooltip = content.trim().match(
      new RegExp(`^(No|${INTEGER})\\s+contributions?\\s+on\\s+([a-z]+)\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,\\s+(\\d{4}))?\\.$`, "i"),
    );
    if (!target || !tooltip) return null;
    const count = /^no$/i.test(tooltip[1]) ? 0 : Number(tooltip[1].replaceAll(",", ""));
    const month = MONTHS.indexOf(tooltip[2].toLowerCase()) + 1;
    const day = Number(tooltip[3]);
    const tooltipYear = tooltip[4] ? Number(tooltip[4]) : undefined;
    if (!Number.isSafeInteger(count) || month === 0 || day < 1 || day > 31) return null;
    const previous = tooltips.get(target);
    if (previous && (previous.count !== count || previous.month !== month || previous.day !== day || previous.year !== tooltipYear)) {
      return null;
    }
    tooltips.set(target, { count, month, day, year: tooltipYear });
  }

  const dates = new Map<string, GitHubContributionDay>();
  const cellIds = new Map<string, string>();
  for (const [, source] of table.matchAll(/<td\b([^>]*)>/gi)) {
    const attrs = attributes(source);
    if (!("data-date" in attrs) && !hasClass(attrs.class, "ContributionCalendar-day")) continue;
    const date = attrs["data-date"];
    const timestamp = dateTimestamp(date);
    const tooltip = tooltips.get(attrs.id);
    if (timestamp === null || !/^[0-4]$/.test(attrs["data-level"] ?? "") || !attrs.id || !tooltip) return null;
    if (timestamp < start || timestamp > end) return null;
    const [cellYear, month, day] = date.split("-").map(Number);
    if (tooltip.month !== month || tooltip.day !== day || (tooltip.year !== undefined && tooltip.year !== cellYear)) return null;
    const level = Number(attrs["data-level"]) as GitHubContributionDay["level"];
    if ((tooltip.count === 0) !== (level === 0)) return null;
    const previousDate = cellIds.get(attrs.id);
    if (previousDate && previousDate !== date) return null;
    cellIds.set(attrs.id, date);
    const previous = dates.get(date);
    if (previous && (previous.count !== tooltip.count || previous.level !== level)) return null;
    dates.set(date, { date, count: tooltip.count, level });
  }

  const days = Array.from(dates.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length !== expectedDays || cellIds.size !== tooltips.size) return null;
  if (days.some((day, index) => dateTimestamp(day.date) !== start + index * DAY_MS)) return null;
  const dailyTotal = days.reduce((sum, day) => sum + day.count, 0);
  if (!Number.isSafeInteger(dailyTotal) || dailyTotal !== total) return null;

  return { total, startDate, endDate, days, year: year ?? null };
}
