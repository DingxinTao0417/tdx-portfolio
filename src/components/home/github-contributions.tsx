"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { site } from "@/data/site";
import type { GitHubContributionCalendar } from "@/lib/github";

const contributionColors = [
  "bg-[#e8ece7] dark:bg-white/10",
  "bg-[#c9dfbd] dark:bg-[#31543a]",
  "bg-[#8fc57c] dark:bg-[#487e4b]",
  "bg-[#4f9d56] dark:bg-[#5fa963]",
  "bg-[#176b38] dark:bg-[#82c878]",
];

function parseDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function getWeekIndex(value: string, calendarStart: Date) {
  return Math.floor((parseDate(value).getTime() - calendarStart.getTime()) / (86_400_000 * 7));
}

function ContributionGrid({ calendar, today }: { calendar: GitHubContributionCalendar; today: string }) {
  const t = useTranslations("Home.github.contributions");
  const locale = useLocale();
  const hintId = useId();
  const days = calendar.days.filter((day) => day.date <= today);
  const lastDate = days.at(-1)?.date;
  const [focusDate, setFocusDate] = useState(lastDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const cells = useRef(new Map<string, HTMLButtonElement>());
  const scrollArea = useRef<HTMLDivElement>(null);
  const activeDay = days.find((day) => day.date === (hoverDate ?? selectedDate));
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
  const calendarStart = parseDate(calendar.startDate);
  calendarStart.setUTCDate(calendarStart.getUTCDate() - calendarStart.getUTCDay());
  const weekCount = getWeekIndex(calendar.endDate, calendarStart) + 1;
  const gridTemplateColumns = `repeat(${weekCount}, minmax(0, 1fr))`;
  const months = calendar.days
    .filter((day, index) => index === 0 || day.date.endsWith("-01"))
    .map((day) => ({
      date: day.date,
      label: monthFormatter.format(parseDate(day.date)),
      week: getWeekIndex(day.date, calendarStart),
    }))
    // Leave room for each label, including partial months at either end.
    .filter((month, index, all) => weekCount - month.week >= 3 && (!all[index + 1] || all[index + 1].week - month.week >= 3));

  useEffect(() => {
    const scroller = scrollArea.current;
    const latest = lastDate ? cells.current.get(lastDate) : undefined;
    if (!scroller || !latest) return;
    // Show the most recent days on narrow screens without scrolling the page.
    scroller.scrollLeft = Math.max(0, scroller.scrollLeft + latest.getBoundingClientRect().right - scroller.getBoundingClientRect().right + 4);
  }, [lastDate]);

  function dayLabel(day: (typeof days)[number]) {
    return t("day", { date: dayFormatter.format(parseDate(day.date)), count: day.count });
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    let target: number;
    if (event.key === "Home") target = 0;
    else if (event.key === "End") target = days.length - 1;
    else if (event.key in offsets) target = Math.max(0, Math.min(days.length - 1, index + offsets[event.key]));
    else return;
    event.preventDefault();
    setHoverDate(null);
    cells.current.get(days[target].date)?.focus();
  }

  return (
    <>
      <div ref={scrollArea} className="mt-6 min-w-0 overflow-x-auto py-1" data-lenis-prevent data-contribution-scroll>
        <div className="grid min-w-[720px] grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 gap-y-2 px-1">
          <div
            className="col-start-2 row-start-1 grid h-4 gap-[3px] font-mono text-[10px] text-muted"
            style={{ gridTemplateColumns }}
            aria-hidden
            data-contribution-months
          >
            {months.map(({ date, label, week }) => (
              <span key={date} className="whitespace-nowrap" style={{ gridColumn: `${week + 1} / span 3`, gridRow: 1 }}>
                {label}
              </span>
            ))}
          </div>
          <div className="col-start-1 row-start-2 grid grid-rows-7 gap-[3px] font-mono text-[10px] text-muted" aria-hidden>
            <span className="self-center" style={{ gridRowStart: 2 }}>{t("monday")}</span>
            <span className="self-center" style={{ gridRowStart: 4 }}>{t("wednesday")}</span>
            <span className="self-center" style={{ gridRowStart: 6 }}>{t("friday")}</span>
          </div>
          <div
            role="group"
            aria-label={t("summary", { count: calendar.total, period: calendar.year ?? t("period") })}
            aria-describedby={hintId}
            className="col-start-2 row-start-2 grid gap-[3px]"
            style={{ gridTemplateColumns, gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
            onPointerLeave={() => setHoverDate(null)}
            data-contribution-grid
          >
            {calendar.days.map((day, index) => {
              const style = { gridColumnStart: getWeekIndex(day.date, calendarStart) + 1, gridRowStart: parseDate(day.date).getUTCDay() + 1 };
              if (day.date > today) {
                return <span key={day.date} style={style} className="aspect-square rounded-[2px] border border-line/50" aria-hidden />;
              }
              return (
                <button
                  key={day.date}
                  ref={(node) => { if (node) cells.current.set(day.date, node); else cells.current.delete(day.date); }}
                  type="button"
                  tabIndex={focusDate === day.date ? 0 : -1}
                  aria-label={dayLabel(day)}
                  aria-pressed={selectedDate === day.date}
                  title={dayLabel(day)}
                  data-date={day.date}
                  data-count={day.count}
                  className={`aspect-square cursor-pointer rounded-[2px] transition-[box-shadow] hover:ring-2 hover:ring-fg/40 ${contributionColors[day.level]} ${selectedDate === day.date ? "ring-2 ring-fg/60" : ""}`}
                  style={style}
                  onPointerEnter={() => setHoverDate(day.date)}
                  onClick={() => { setSelectedDate(day.date); setFocusDate(day.date); }}
                  onFocus={() => { setSelectedDate(day.date); setFocusDate(day.date); }}
                  onKeyDown={(event) => navigate(event, index)}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="min-h-5 text-xs leading-5 text-muted" data-contribution-detail>
          {activeDay ? dayLabel(activeDay) : t("hint")}
        </p>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted" aria-hidden>
          <span>{t("less")}</span>
          {contributionColors.map((color, level) => <span key={level} className={`h-3 w-3 rounded-[2px] ${color}`} />)}
          <span>{t("more")}</span>
        </div>
      </div>
      <p id={hintId} className="sr-only">{t("keyboardHint")}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted/80 sm:hidden">{t("scrollHint")}</p>
    </>
  );
}

export function GitHubContributions({
  calendar: initialCalendar,
  years,
  today,
}: {
  calendar: GitHubContributionCalendar | null;
  years: number[];
  today: string;
}) {
  const t = useTranslations("Home.github.contributions");
  const selectId = useId();
  const [calendar, setCalendar] = useState(initialCalendar);
  const [requestedYear, setRequestedYear] = useState<number | null>(initialCalendar?.year ?? null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(!initialCalendar);
  const request = useRef<AbortController | null>(null);
  const calendars = useRef(new Map<number | null, GitHubContributionCalendar>(initialCalendar ? [[initialCalendar.year, initialCalendar]] : []));

  useEffect(() => () => request.current?.abort(), []);

  async function loadCalendar(year: number | null) {
    request.current?.abort();
    setRequestedYear(year);
    setFailed(false);
    const cached = calendars.current.get(year);
    if (cached) {
      setCalendar(cached);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const response = await fetch(`/api/github/contributions${year === null ? "" : `?year=${year}`}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Contribution request failed");
      const result: GitHubContributionCalendar & { ok: boolean } = await response.json();
      if (!result.ok || result.year !== year || !Array.isArray(result.days)) throw new Error("Invalid contribution response");
      if (controller.signal.aborted) return;
      calendars.current.set(year, result);
      setCalendar(result);
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-bg-elevated/60 p-5 sm:p-7 lg:col-span-12" data-github-contributions aria-busy={loading}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{t("eyebrow")}</h3>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-fg">
            {calendar ? t("total", { count: calendar.total }) : "—"}
          </p>
          {calendar && (
            <p className="mt-1 text-xs text-muted" data-contribution-period>
              {calendar.year ?? t("period")}<span className="mx-2" aria-hidden>·</span>
              <span className="font-mono text-[10px]">{calendar.startDate} — {calendar.endDate > today ? today : calendar.endDate}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor={selectId} className="sr-only">{t("chooseYear")}</label>
          <select
            id={selectId}
            value={requestedYear ?? "recent"}
            onChange={(event) => void loadCalendar(event.target.value === "recent" ? null : Number(event.target.value))}
            className="min-h-10 cursor-pointer rounded-lg border border-line bg-bg px-3 py-2 font-mono text-xs text-fg"
          >
            <option value="recent">{t("period")}</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <a
            href={`https://github.com/${site.handle}${calendar?.year ? `?tab=overview&from=${calendar.year}-01-01&to=${calendar.year}-12-31` : ""}`}
            target="_blank"
            rel="noreferrer noopener"
            className="py-2 font-mono text-xs text-accent transition-colors hover:text-fg"
          >
            {t("view")} →
          </a>
        </div>
      </div>
      <div role="status" aria-live="polite">
        {loading && <p className="mt-4 text-xs text-muted">{t("loading", { period: requestedYear ?? t("period") })}</p>}
        {failed && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
            <p>{calendar ? t("loadFailed") : t("unavailable")}</p>
            <button type="button" onClick={() => void loadCalendar(requestedYear)} className="min-h-9 px-2 text-accent underline underline-offset-4">{t("retry")}</button>
          </div>
        )}
      </div>
      {calendar && <ContributionGrid key={`${calendar.year}-${calendar.startDate}`} calendar={calendar} today={today} />}
      <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted/80">{t("source")}</p>
    </div>
  );
}
