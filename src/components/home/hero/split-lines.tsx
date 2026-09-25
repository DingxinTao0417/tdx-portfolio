"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import { splitText } from "@/components/fx/split";
import { useFxPlay, useFxState, type FxPlayOptions } from "@/components/fx/trigger";
import { cn } from "@/lib/utils";

type SplitLinesProps = FxPlayOptions & {
  text: string;
  as?: "p" | "span" | "div";
  delay?: number;
  /** Seconds between rendered lines. */
  stagger?: number;
  duration?: number;
  className?: string;
};

/**
 * SplitText's masked rise, staggered by rendered line instead of by word: before playing, words
 * are grouped by their line box, so a paragraph rises line by line at any width. Reuses the
 * `fx-split` CSS, so hidden/safety/reduced-motion/no-JS states behave like SplitText.
 */
export function SplitLines({
  text,
  as = "p",
  delay = 0,
  stagger = 0.09,
  duration = 0.95,
  className,
  ...playOptions
}: SplitLinesProps) {
  // Typed as p: every allowed tag takes the same props here.
  const Tag = as as "p";
  const ref = useRef<HTMLParagraphElement>(null);
  const active = useFxPlay(ref, playOptions);
  const state = useFxState(active);
  const segments = useMemo(() => splitText(text), [text]);

  // Line indices only matter until the entrance starts; changing them later would re-time it.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || active) return;
    const measure = () => {
      const words = Array.from(root.querySelectorAll<HTMLElement>(".fx-w"));
      let line = -1;
      let top = -Infinity;
      // All reads first, then all writes: no forced style recalc per word.
      const lines = words.map((word) => {
        if (word.offsetTop > top + word.offsetHeight / 2) {
          line += 1;
          top = word.offsetTop;
        }
        return line;
      });
      words.forEach((word, i) => (word.firstElementChild as HTMLElement | null)?.style.setProperty("--i", String(lines[i])));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [active, segments]);

  return (
    <Tag
      ref={ref}
      className={cn("fx-split", className)}
      data-fx-state={state}
      data-variant="rise"
      style={{ "--fx-delay": `${delay}s`, "--fx-stagger": `${stagger}s`, "--fx-dur": `${duration}s` } as CSSProperties}
    >
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden="true">
        {segments.map((segment, i) =>
          segment.type === "space" ? (
            <Fragment key={i}>{" "}</Fragment>
          ) : (
            <span key={i} className="fx-w">
              {segment.units.map((unit) => (
                <span key={unit.index} className="fx-u">
                  {unit.text}
                </span>
              ))}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
