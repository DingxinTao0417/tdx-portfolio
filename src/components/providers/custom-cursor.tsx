"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Signal-orange ring cursor for fine-pointer devices.
 * Grows over interactive elements; shows a label when `data-cursor-text` is set.
 */
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 60, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 900, damping: 60, mass: 0.4 });

  const [state, setState] = useState<{
    enabled: boolean;
    hover: boolean;
    label: string | null;
    down: boolean;
  }>({ enabled: false, hover: false, label: null, down: false });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor]",
      );
      const label = el?.dataset.cursorText ?? null;
      setState((s) =>
        s.hover === !!el && s.label === label ? s : { ...s, hover: !!el, label },
      );
    };
    const onDown = () => setState((s) => ({ ...s, down: true }));
    const onUp = () => setState((s) => ({ ...s, down: false }));
    const onLeave = () => {
      x.set(-100);
      y.set(-100);
    };

    // Enable on first pointer move so we never render a stray ring at 0,0.
    const enable = () => {
      raf = requestAnimationFrame(() => setState((s) => ({ ...s, enabled: true })));
      window.removeEventListener("pointermove", enable);
    };
    window.addEventListener("pointermove", enable, { once: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", enable);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  if (!state.enabled) return null;

  const size = state.label ? 72 : state.hover ? 44 : 18;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden [@media(pointer:fine)]:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent font-mono text-[10px] uppercase tracking-[0.18em] text-white"
        animate={{
          width: size,
          height: size,
          scale: state.down ? 0.85 : 1,
          backgroundColor: state.label
            ? "var(--accent)"
            : state.hover
              ? "color-mix(in oklab, var(--accent) 22%, transparent)"
              : "transparent",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      >
        {state.label}
      </motion.div>
    </motion.div>
  );
}
