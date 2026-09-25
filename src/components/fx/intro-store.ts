import { useSyncExternalStore } from "react";

/** sessionStorage key: the intro plays once per tab session. */
export const INTRO_STORAGE_KEY = "tdx-intro-seen";
/** Dispatched on `document` when the curtain opens (or the intro is skipped late). */
export const INTRO_EVENT = "tdx:intro";
/** When the curtain starts opening; mirrors the `fx-pre-*` CSS timeline in globals.css. */
export const INTRO_OPEN_MS = 1200;

/**
 * `<html data-intro>` is written by the preloader's inline script before hydration:
 * "play" while the overlay runs, "done" once the curtain opens, "skip" when it never shows.
 * No attribute (e.g. a page without the preloader) counts as done.
 */
export type IntroState = "play" | "done" | "skip";

function readIntro() {
  return document.documentElement.dataset.intro as IntroState | undefined;
}

/** Whether page entrances may start (true when skipped, finished or absent). */
export function getIntroDone() {
  return typeof document !== "undefined" && readIntro() !== "play";
}

/** Whether this page load skipped the intro entirely. */
export function getIntroSkipped() {
  return typeof document !== "undefined" && readIntro() === "skip";
}

export function subscribeIntro(notify: () => void) {
  document.addEventListener(INTRO_EVENT, notify);
  return () => document.removeEventListener(INTRO_EVENT, notify);
}

/** Flips "play" to "done" and notifies subscribers. Idempotent. */
export function markIntroDone() {
  const root = document.documentElement;
  if (root.dataset.intro !== "play") return;
  root.dataset.intro = "done";
  document.dispatchEvent(new Event(INTRO_EVENT));
}

/** False during SSR/hydration and while the intro plays; flips when the curtain opens. */
export function useIntroDone() {
  return useSyncExternalStore(subscribeIntro, getIntroDone, () => false);
}

/** True (after hydration) when this load never showed the intro. */
export function useIntroSkipped() {
  return useSyncExternalStore(subscribeIntro, getIntroSkipped, () => false);
}
