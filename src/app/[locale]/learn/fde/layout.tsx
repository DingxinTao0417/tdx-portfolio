import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { CourseShell } from "@/components/learn/course-shell";
import "../../blog/[slug]/post-fx.css";

export default async function FdeLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return <CourseShell locale={locale}>{children}</CourseShell>;
}
