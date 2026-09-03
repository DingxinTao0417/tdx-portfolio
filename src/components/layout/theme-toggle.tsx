"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-fg transition-colors hover:border-accent hover:text-accent",
        className,
      )}
    >
      {/* Both icons are rendered; CSS decides which is visible so there is no hydration flicker. */}
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
    </motion.button>
  );
}
