"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({ url: window.location.href, title: document.title });
            return;
          }
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // user cancelled or clipboard blocked
        }
      }}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-line px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
