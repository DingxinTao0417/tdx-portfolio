"use client";

import { useInView, useMotionValueEvent, type MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { palettes } from "./palette";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Lazy-loads the WebGL hero. Pauses rendering when scrolled out of view,
 * respects reduced-motion, and re-colors when the theme changes.
 */
export function HeroCanvas({
  progress,
  className,
}: {
  progress: MotionValue<number>;
  className?: string;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper, { amount: 0.05 });
  const { resolvedTheme } = useTheme();
  const progressRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useMotionValueEvent(progress, "change", (v) => {
    progressRef.current = v;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    // Sync once on mount without a synchronous set-state-in-effect.
    const id = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(id);
      media.removeEventListener("change", update);
    };
  }, []);

  const palette = palettes[resolvedTheme === "dark" ? "dark" : "light"];

  return (
    <div ref={wrapper} className={cn("relative", className)} aria-hidden>
      {/* CSS fallback glow — visible until WebGL is ready, and behind it afterwards. */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_70%)] blur-3xl" />
      </div>
      <HeroScene palette={palette} reduced={reduced} progressRef={progressRef} active={inView} />
    </div>
  );
}
