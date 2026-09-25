import type { NavKey } from "@/data/nav";

/** "closing" plays the exit animation; an instant close skips straight to "closed". */
export type Phase = "closed" | "open" | "closing";

export type CloseOptions = {
  /** Skip the exit animation (navigation and theme swaps take over the screen). */
  instant?: boolean;
  /** Runs once the palette is gone: focus restored, page unlocked, Lenis released. */
  then?: () => void;
};

/** Serializable, localized index the server hands to the client palette. */
export type CommandData = {
  pages: { key: NavKey; href: string; label: string; alias: string }[];
  projects: { slug: string; index: string; title: string; tagline: string; kind: string; stack: string[] }[];
  posts: { slug: string; title: string; tags: string[]; date: string }[];
};
