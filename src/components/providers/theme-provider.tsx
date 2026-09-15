"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Preserve the before-paint bootstrap in SSR. Client-created scripts do not
  // execute; next-themes handles hydration and subsequent theme changes.
  const scriptProps = {
    type: typeof window === "undefined" ? "text/javascript" : "text/plain",
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
