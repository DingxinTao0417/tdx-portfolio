"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { lockScroll, setLenis, unlockScroll } from "@/components/fx/lenis";

const MODAL_OPEN = "dialog[open], [aria-modal='true']";

/**
 * Buttery wheel scrolling on desktop. Disabled for touch devices and users
 * who prefer reduced motion — native scrolling is used in those cases.
 * The instance is shared through `fx/lenis` (`getLenis`, `lockScroll`).
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: true,
    });
    setLenis(lenis);

    // A modal must also stop inertia that began before it opened.
    const syncDialogState = () => {
      if (document.querySelector(MODAL_OPEN)) lockScroll("dialog");
      else unlockScroll("dialog");
    };
    document.addEventListener("site:dialog-change", syncDialogState);
    syncDialogState();

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("site:dialog-change", syncDialogState);
      unlockScroll("dialog");
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
