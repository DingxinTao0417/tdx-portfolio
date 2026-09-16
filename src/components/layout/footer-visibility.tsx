"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export function FooterVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/learn/")) return null;

  return children;
}
