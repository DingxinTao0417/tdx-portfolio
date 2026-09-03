"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeLabels, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex h-10 items-center rounded-full border border-line bg-surface p-1 font-mono text-[11px] tracking-[0.12em]",
        className,
      )}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            aria-current={active ? "true" : undefined}
            className={cn(
              "grid h-8 min-w-9 place-items-center rounded-full px-2.5 transition-colors",
              active
                ? "bg-fg text-bg"
                : "text-muted hover:text-fg",
            )}
          >
            {localeLabels[l].short}
          </Link>
        );
      })}
    </div>
  );
}
