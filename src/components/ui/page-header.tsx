import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

/** Shared top-of-page header with atmosphere, used by every inner page. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  body,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative isolate overflow-hidden pt-32 pb-4 sm:pt-40", className)}>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: "var(--hero-glow)" }}
      />
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} body={body} size="xl" as="h1" className="border-b border-line pb-10 sm:pb-12">
          {children}
        </SectionHeading>
      </div>
    </header>
  );
}
