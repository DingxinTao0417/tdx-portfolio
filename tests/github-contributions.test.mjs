import assert from "node:assert/strict";
import test from "node:test";
import { parseGitHubContributionCalendar } from "../src/lib/github-contributions.ts";

const DAY_MS = 86400000;

function fixture(startDate, endDate, year, counts = [1234, 1]) {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const days = Array.from({ length: (end - start) / DAY_MS + 1 }, (_, index) => {
    const date = new Date(start + index * DAY_MS);
    const count = counts[index] ?? 0;
    return { date: date.toISOString().slice(0, 10), count, index, day: date.getUTCDate(), month: date.toLocaleString("en-US", { month: "long", timeZone: "UTC" }) };
  });
  const cells = days.map(({ date, count, index, day, month }) => {
    const id = `contribution-day-component-${index}`;
    const level = count === 0 ? 0 : count === 1 ? 1 : 4;
    return `<td class="ContributionCalendar-day" data-date="${date}" id="${id}" data-level="${level}"></td><tool-tip for="${id}">${count === 0 ? "No" : count.toLocaleString("en-US")} ${count === 1 ? "contribution" : "contributions"} on ${month} ${day}.</tool-tip>`;
  });
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return {
    cells,
    days,
    html: `<h2 id="js-contribution-activity-description">${total.toLocaleString("en-US")} ${total === 1 ? "contribution" : "contributions"} in ${year ?? "the last year"}</h2><div class="js-calendar-graph" data-from="${startDate} 00:00:00 UTC" data-to="${endDate} 23:59:59 UTC"><table class="ContributionCalendar-grid">${cells.toReversed().join("")}</table></div>`,
  };
}

test("exact counts, comma separators, zero days and dates sorted despite row order", () => {
  const source = fixture("2024-01-01", "2024-12-31", 2024);
  const calendar = parseGitHubContributionCalendar(source.html, 2024);
  assert.ok(calendar);
  assert.equal(calendar.year, 2024);
  assert.equal(calendar.total, 1235);
  assert.equal(calendar.days.length, 366);
  assert.deepEqual(calendar.days[0], { date: "2024-01-01", count: 1234, level: 4 });
  assert.deepEqual(calendar.days[1], { date: "2024-01-02", count: 1, level: 1 });
  assert.ok(calendar.days.some((day) => day.date === "2024-02-29"));
  assert.equal(calendar.days.at(-1).date, "2024-12-31");
  assert.equal(calendar.days.reduce((sum, day) => sum + day.count, 0), calendar.total);
});

test("single-contribution summary and single-quoted attributes", () => {
  const source = fixture("2023-01-01", "2023-12-31", 2023, [1]);
  const calendar = parseGitHubContributionCalendar(source.html.replaceAll('"', "'"), 2023);
  assert.equal(calendar?.total, 1);
  assert.equal(calendar?.days.length, 365);
});

test("a real zero total is valid when the complete source explicitly contains zero days", () => {
  const source = fixture("2023-01-01", "2023-12-31", 2023, []);
  assert.equal(parseGitHubContributionCalendar(source.html, 2023)?.total, 0);
});

test("rolling year retains GitHub's week alignment and crosses a year boundary", () => {
  const source = fixture("2025-09-07", "2026-09-09");
  const calendar = parseGitHubContributionCalendar(source.html);
  assert.ok(calendar);
  assert.equal(calendar.year, null);
  assert.equal(calendar.days.length, 368);
  assert.equal(calendar.startDate, "2025-09-07");
  assert.equal(calendar.endDate, "2026-09-09");
  assert.ok(calendar.days.some((day) => day.date === "2026-01-01"));
});

test("identical dates are deduplicated, conflicting duplicates fail", () => {
  const source = fixture("2024-01-01", "2024-12-31", 2024);
  const append = (cell) => source.html.replace("</table>", `${cell}</table>`);
  const duplicate = source.cells[0].replaceAll("component-0", "component-duplicate");
  assert.equal(parseGitHubContributionCalendar(append(duplicate), 2024)?.days.length, 366);
  assert.equal(parseGitHubContributionCalendar(append(duplicate.replace("1,234", "1,235")), 2024), null);
});

test("incomplete and malformed calendars fail without dropping individual days", () => {
  const source = fixture("2024-01-01", "2024-12-31", 2024);
  const invalid = [
    source.html.replace(source.cells[0], ""),
    source.html.replace(/<tool-tip for="contribution-day-component-0">[^<]*<\/tool-tip>/, ""),
    source.html.replace('data-level="4"', 'data-level="5"'),
    source.html.replace('data-level="4"', 'data-level="0"'),
    source.html.replace('data-date="2024-02-29"', 'data-date="2024-02-30"'),
    source.html.replace('data-date="2024-02-29"', ""),
    source.html.replace("on January 1.", "on February 1."),
    source.html.replace("1,235 contributions in", "1,236 contributions in"),
    source.html.replace("1,234 contributions on", "many contributions on"),
    source.html.replace("</table>", ""),
    "<html><h1>Rate limit exceeded</h1></html>",
  ];
  for (const [index, html] of invalid.entries()) {
    assert.equal(parseGitHubContributionCalendar(html, 2024), null, `invalid case ${index}`);
  }
});

test("year mismatches, invalid ranges and non-leap February 29 fail", () => {
  const year = fixture("2024-01-01", "2024-12-31", 2024);
  assert.equal(parseGitHubContributionCalendar(year.html), null);
  assert.equal(parseGitHubContributionCalendar(year.html, 2025), null);
  assert.equal(parseGitHubContributionCalendar(year.html, 2022), null);
  assert.equal(parseGitHubContributionCalendar(year.html, 2024.5), null);
  assert.equal(parseGitHubContributionCalendar(year.html, new Date().getUTCFullYear() + 1), null);
  assert.equal(parseGitHubContributionCalendar(fixture("2024-01-02", "2024-12-31", 2024).html, 2024), null);
  const nonLeap = fixture("2023-01-01", "2023-12-31", 2023);
  assert.equal(parseGitHubContributionCalendar(nonLeap.html.replace('data-date="2023-02-28"', 'data-date="2023-02-29"'), 2023), null);
});

test("live GitHub totals match every daily count for rolling, singular, leap and current years", { skip: process.env.GITHUB_CONTRIBUTIONS_LIVE !== "1" }, async () => {
  for (const year of [undefined, 2023, 2024, new Date().getUTCFullYear()]) {
    const url = new URL("https://github.com/users/DingxinTao0417/contributions");
    if (year !== undefined) {
      url.searchParams.set("from", `${year}-01-01`);
      url.searchParams.set("to", `${year}-12-31`);
    }
    const response = await fetch(url, { headers: { "User-Agent": "tdx-portfolio-test", "Accept-Language": "en-US" }, signal: AbortSignal.timeout(8000) });
    assert.equal(response.status, 200);
    const calendar = parseGitHubContributionCalendar(await response.text(), year);
    assert.ok(calendar, `GitHub calendar ${year ?? "rolling"}`);
    assert.equal(calendar.days.reduce((sum, day) => sum + day.count, 0), calendar.total);
    console.log(JSON.stringify({ year: calendar.year, total: calendar.total, start: calendar.startDate, end: calendar.endDate, days: calendar.days.length }));
  }
});
