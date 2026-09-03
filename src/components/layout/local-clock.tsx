"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 15_000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: site.timeZone,
  }).format(new Date());
}

function getServerSnapshot() {
  return "--:--";
}

/** Live Los Angeles clock. Inherits `color` so it works on inverted surfaces. */
export function LocalClock({ label, className }: { label: string; className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-muted",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span suppressHydrationWarning className="font-semibold tabular-nums text-current">
        {time}
      </span>
      <span className="uppercase opacity-80">{label}</span>
    </span>
  );
}
