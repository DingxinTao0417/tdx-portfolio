"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState, type ComponentProps } from "react";

/** <pre> with a copy-to-clipboard affordance. Used for every MDX code block. */
export function Pre(props: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable (insecure context) — fail silently.
    }
  };

  return (
    <div className="group/pre relative">
      <pre ref={ref} {...props} />
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-line bg-bg-elevated/80 text-muted opacity-0 backdrop-blur transition-all hover:text-accent focus-visible:opacity-100 group-hover/pre:opacity-100"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
