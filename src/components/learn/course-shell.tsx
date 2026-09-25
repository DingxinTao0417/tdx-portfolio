import { BookOpen, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { CourseSidebar } from "@/components/learn/course-sidebar";
import { getFdeCopy } from "@/data/fde";

export function CourseShell({ children, locale }: { children: ReactNode; locale: string }) {
  const copy = getFdeCopy(locale);
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-28 sm:px-8 lg:px-8 lg:pt-28 xl:px-12">
      <details className="pfx-disclosure group mb-7 rounded-xl border border-line bg-bg-elevated transition-colors open:border-line-strong lg:hidden" data-mobile-course-directory>
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent">
            <BookOpen className="h-4 w-4" />
          </span>
          {copy.directory}
          <ChevronDown className="ml-auto h-4 w-4 text-muted transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-180" />
        </summary>
        <div className="border-t border-line p-4"><CourseSidebar locale={locale} /></div>
      </details>
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-9 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-14">
        <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] min-h-0 self-start border-r border-line pr-5 lg:block xl:pr-6">
          <CourseSidebar locale={locale} />
        </aside>
        <div className="min-w-0" data-course-content>{children}</div>
      </div>
    </div>
  );
}
