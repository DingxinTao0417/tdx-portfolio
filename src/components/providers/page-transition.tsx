"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Mounted via `template.tsx`, so every navigation replays the entrance. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
    >
      {children}
    </motion.div>
  );
}
