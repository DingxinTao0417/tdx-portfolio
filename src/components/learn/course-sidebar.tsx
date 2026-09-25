"use client";

import { ArrowLeft, Check, ChevronDown, Circle, CircleCheck } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { RollingNumber } from "@/components/blog/rolling-number";
import { useHydrated } from "@/components/fx/hooks";
import { useLearningRecord } from "@/components/learn/learning-record";
import { fdeCourse, fdeLessons, fdeModules, getFdeCopy } from "@/data/fde";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function CourseSidebar({ locale }: { locale: string }) {
  const copy = getFdeCopy(locale);
  const pathname = usePathname();
  const current = pathname.split("/").at(-1);
  const overview = current === "fde";
  const record = useLearningRecord();
  const hydrated = useHydrated();
  const paneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seen = useRef<string[] | null>(null);

  function closeMobileDirectory() {
    const drawer = paneRef.current?.closest<HTMLDetailsElement>("[data-mobile-course-directory]");
    if (drawer) drawer.open = false;
  }

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    if (overview) { pane.scrollTop = 0; return; }
    const revealActive = () => {
      const active = pane.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) return;
      const section = active.closest("details");
      if (section) section.open = true;
      if (pane.clientHeight === 0) return;
      const target = active.getBoundingClientRect();
      const frame = pane.getBoundingClientRect();
      if (target.top < frame.top || target.bottom > frame.bottom) {
        pane.scrollTop += target.top - frame.top - pane.clientHeight / 3;
      }
    };
    revealActive();
    const observer = new ResizeObserver(revealActive);
    observer.observe(pane);
    const drawer = pane.closest("[data-mobile-course-directory]");
    drawer?.addEventListener("toggle", revealActive);
    return () => {
      observer.disconnect();
      drawer?.removeEventListener("toggle", revealActive);
    };
  }, [pathname, overview]);

  // One highlight slides between lessons instead of each link lighting up on its own.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const place = () => {
      const active = track.querySelector<HTMLElement>('[aria-current="page"]');
      const visible = active !== null && active.offsetParent !== null;
      track.style.setProperty("--pfx-lesson-o", visible ? "1" : "0");
      if (!visible) return;
      track.style.setProperty("--pfx-lesson-y", `${active.offsetTop}px`);
      track.style.setProperty("--pfx-lesson-h", `${active.offsetHeight}px`);
    };
    place();
    const frame = requestAnimationFrame(() => track.setAttribute("data-ready", ""));
    const observer = new ResizeObserver(place);
    observer.observe(track);
    track.addEventListener("toggle", place, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("toggle", place, true);
    };
  }, [pathname]);

  // Lessons marked read after load get a small pop on their status icon.
  useEffect(() => {
    if (!hydrated) return;
    const previous = seen.current;
    seen.current = record.read;
    if (!previous || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const id of record.read) {
      if (previous.includes(id)) continue;
      trackRef.current?.querySelector(`[data-lesson="${id}"] [data-status]`)?.animate(
        [
          { transform: "scale(0.3) rotate(-45deg)", opacity: 0 },
          { transform: "scale(1.3)", opacity: 1, offset: 0.55 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    }
  }, [record.read, hydrated]);

  return (
    <nav aria-label={copy.directory} className="flex h-full min-h-0 flex-col" data-course-sidebar>
      <div className="shrink-0 border-b border-line pb-5">
        <Link href="/learn" onClick={closeMobileDirectory} className="group/back inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/back:-translate-x-1" />
          {copy.allCourses}
        </Link>
        <Link href="/learn/fde" onClick={closeMobileDirectory} className="mt-1 block font-display text-xl font-semibold leading-8 tracking-tight transition-colors hover:text-accent">{copy.title}</Link>
        <p className="mt-2 text-xs leading-6 text-muted">{fdeCourse.lesson_count} {copy.lessons} · {copy.edition}</p>
        <div className="mt-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <span>{copy.readingProgress}</span>
            <span className="flex items-baseline text-fg">
              <RollingNumber value={record.read.length} pad={2} />
              <span aria-hidden="true" className="text-muted">&nbsp;/ {fdeLessons.length}</span>
              <span className="sr-only">{record.read.length} / {fdeLessons.length}</span>
            </span>
          </div>
          <div aria-hidden="true" className="mt-2 flex h-1 gap-px">
            {fdeLessons.map((lesson, index) => (
              <span
                key={lesson.id}
                style={{ transitionDelay: `${index * 18}ms` }}
                className={cn(
                  "h-full flex-1 rounded-full transition-colors duration-500",
                  record.read.includes(lesson.id) ? "bg-accent" : "bg-line",
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <Link href="/learn/fde" onClick={closeMobileDirectory} aria-current={overview ? "page" : undefined} className={"mt-4 flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium transition-colors " + (overview ? "bg-accent-soft text-accent" : "text-muted hover:bg-bg-elevated hover:text-fg")}>{copy.overview}</Link>
      <div ref={paneRef} className="mt-4 max-h-[55dvh] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 lg:max-h-none" data-lenis-prevent data-course-directory>
        <div ref={trackRef} className="pfx-lessons relative isolate space-y-4">
          <span aria-hidden="true" className="pfx-lesson-mark" />
          {fdeModules.map((module) => {
            const done = module.lessons.filter((lesson) => record.read.includes(lesson.id)).length;
            const complete = done === module.lessons.length;
            return (
              <details key={module.id} open className="group rounded-xl">
                <summary lang="zh-CN" className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg bg-bg-elevated px-3 py-3 text-xs font-semibold leading-5 transition-colors hover:text-accent">
                  <span className="shrink-0 font-mono text-[10px] text-muted">0{module.order}</span>
                  {module.title}
                  <span className={cn("ml-auto flex shrink-0 items-center gap-1 font-mono text-[10px] font-normal tabular-nums", complete ? "text-accent" : "text-muted")}>
                    {complete && <Check aria-hidden="true" className="h-3 w-3" />}
                    {done}/{module.lessons.length}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 -rotate-90 text-muted transition-transform group-open:rotate-0" />
                </summary>
                <ul className="mt-1 space-y-1">
                  {module.lessons.map((lesson) => {
                    const slug = lesson.content_path.replace("lessons/", "").replace(".md", "");
                    const active = slug === current;
                    const read = record.read.includes(lesson.id);
                    const Status = read ? CircleCheck : Circle;
                    return <li key={lesson.id} data-lesson={lesson.id}><Link lang="zh-CN" href={"/learn/fde/" + slug} onClick={closeMobileDirectory} aria-current={active ? "page" : undefined} className={"group/lesson flex min-h-11 items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] leading-6 transition-colors " + (active ? "font-medium text-accent" : "text-muted hover:bg-bg-elevated hover:text-fg")}>
                      <Status data-status="" aria-hidden="true" className={"mt-1 h-4 w-4 shrink-0 transition-transform duration-500 group-hover/lesson:scale-110 " + (read ? "text-accent" : "text-muted")} />
                      <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/lesson:translate-x-0.5">{module.order}.{lesson.order} {lesson.title}{read && <span className="sr-only"> · {copy.marked}</span>}{lesson.implementation_track === "optional_extension" && <span className="ml-1 text-[10px] text-muted">({copy.optional})</span>}</span>
                    </Link></li>;
                  })}
                </ul>
              </details>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
