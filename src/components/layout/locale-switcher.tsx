"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { ScrambleText } from "@/components/fx/scramble-text";
import { Link, usePathname } from "@/i18n/navigation";
import { localeLabels, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Segmented EN / 中 switch. The thumb slides to the chosen locale on click, before the new locale
 * has loaded; labels decode on hover.
 */
export function LocaleSwitcher({
  label,
  className,
  size = "sm",
  onNavigate,
}: {
  label: string;
  className?: string;
  size?: "sm" | "lg";
  onNavigate?: () => void;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [pending, setPending] = useState<Locale | null>(null);
  const shown = pending ?? locale;
  const index = routing.locales.indexOf(shown);

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "relative grid grid-cols-2 items-center rounded-full border border-line bg-surface p-1 font-mono tracking-[0.12em]",
        size === "lg" ? "h-12 text-xs" : "h-11 text-[11px] lg:h-10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-fg shadow-[0_4px_14px_-6px_var(--accent-glow)] transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ translate: `${index * 100}% 0` }}
      />
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          hrefLang={l}
          onClick={() => {
            if (l !== locale) setPending(l);
            onNavigate?.();
          }}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "relative grid place-items-center rounded-full px-2.5 transition-colors duration-300",
            size === "lg" ? "h-10 min-w-12" : "h-9 min-w-10 lg:h-8 lg:min-w-9",
            l === shown ? "text-bg" : "text-muted hover:text-fg",
          )}
        >
          <ScrambleText text={localeLabels[l].short} trigger="hover" duration={0.5} />
        </Link>
      ))}
    </div>
  );
}
