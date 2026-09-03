"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up when scrolled into view. Non-numeric values render as-is. */
export function Counter({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);

  useEffect(() => {
    if (!inView || !match || !ref.current) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const node = ref.current;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, match]);

  return (
    <span ref={ref} className={className}>
      {match ? `${match[1]}0${match[3]}` : value}
    </span>
  );
}
