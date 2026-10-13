import type { ReactNode } from "react";

export function AdminPageTitle({ eyebrow, title, body, children }: { eyebrow: string; title: string; body?: string; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="eyebrow flex items-center gap-3">
          <span className="inline-block h-px w-6 bg-accent" />
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {body && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{body}</p>}
      </div>
      {children}
    </header>
  );
}
