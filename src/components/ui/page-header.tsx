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
    <header className={cn("relative isolate overflow-hidden pt-36 pb-6 sm:pt-44", className)}>
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: "var(--hero-glow)" }}
      />
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} body={body} size="xl">
          {children}
        </SectionHeading>
      </div>
    </header>
  );
}
