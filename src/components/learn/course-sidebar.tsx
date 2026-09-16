"use client";

import { ArrowLeft, ChevronDown, Circle, CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLearningRecord } from "@/components/learn/learning-record";
import { fdeCourse, fdeModules, getFdeCopy } from "@/data/fde";
import { Link, usePathname } from "@/i18n/navigation";

export function CourseSidebar({ locale }: { locale: string }) {
  const copy = getFdeCopy(locale);
  const pathname = usePathname();
  const current = pathname.split("/").at(-1);
  const overview = current === "fde";
  const record = useLearningRecord();
  const paneRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav aria-label={copy.directory} className="flex h-full min-h-0 flex-col" data-course-sidebar>
      <div className="shrink-0 border-b border-line pb-5">
        <Link href="/learn" onClick={closeMobileDirectory} className="inline-flex min-h-11 items-center gap-2 text-xs text-muted hover:text-accent"><ArrowLeft className="h-3.5 w-3.5" />{copy.allCourses}</Link>
        <Link href="/learn/fde" onClick={closeMobileDirectory} className="mt-1 block font-display text-xl font-semibold leading-8 tracking-tight">{copy.title}</Link>
        <p className="mt-2 text-xs leading-6 text-muted">{fdeCourse.lesson_count} {copy.lessons} · {copy.edition}</p>
      </div>
      <Link href="/learn/fde" onClick={closeMobileDirectory} aria-current={overview ? "page" : undefined} className={"mt-4 flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium " + (overview ? "bg-accent-soft text-accent" : "text-muted hover:bg-bg-elevated hover:text-fg")}>{copy.overview}</Link>
      <div ref={paneRef} className="mt-4 max-h-[55dvh] min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1 lg:max-h-none" data-lenis-prevent data-course-directory>
        {fdeModules.map((module) => (
          <details key={module.id} open className="group rounded-xl">
            <summary lang="zh-CN" className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg bg-bg-elevated px-3 py-3 text-xs font-semibold leading-5 hover:text-accent">
              <span className="shrink-0 font-mono text-[10px] text-muted">0{module.order}</span>
              {module.title}
              <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 -rotate-90 text-muted transition-transform group-open:rotate-0" />
            </summary>
            <ul className="mt-1 space-y-1">
              {module.lessons.map((lesson) => {
                const slug = lesson.content_path.replace("lessons/", "").replace(".md", "");
                const active = slug === current;
                const read = record.read.includes(lesson.id);
                const Status = read ? CircleCheck : Circle;
                return <li key={lesson.id}><Link lang="zh-CN" href={"/learn/fde/" + slug} onClick={closeMobileDirectory} aria-current={active ? "page" : undefined} className={"flex min-h-11 items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] leading-6 transition-colors " + (active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-bg-elevated hover:text-fg")}>
                  <Status aria-hidden="true" className={"mt-1 h-4 w-4 shrink-0 " + (read ? "text-accent" : "text-muted")} />
                  <span>{module.order}.{lesson.order} {lesson.title}{read && <span className="sr-only"> · {copy.marked}</span>}{lesson.implementation_track === "optional_extension" && <span className="ml-1 text-[10px] text-muted">({copy.optional})</span>}</span>
                </Link></li>;
              })}
            </ul>
          </details>
        ))}
      </div>
    </nav>
  );
}
