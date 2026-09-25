"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { REDUCED_MOTION_QUERY, useHydrated } from "./hooks";
import { INTRO_EVENT, INTRO_OPEN_MS, INTRO_STORAGE_KEY, markIntroDone, useIntroSkipped } from "./intro-store";
import { lockScroll, unlockScroll } from "./lenis";

/**
 * Runs during HTML parsing, before hydration: decides skip vs play (sessionStorage + reduced
 * motion) and blocks wheel/touch/key scrolling until the curtain opens, even if React never loads.
 */
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${INTRO_STORAGE_KEY}")||matchMedia("${REDUCED_MOTION_QUERY}").matches){d.dataset.intro="skip";return}sessionStorage.setItem("${INTRO_STORAGE_KEY}","1")}catch(e){d.dataset.intro="skip";return}d.dataset.intro="play";var o={passive:false},t=["wheel","touchmove","keydown"],k=/^( |Spacebar|PageUp|PageDown|End|Home|ArrowUp|ArrowDown)$/;function b(e){if(e.type!=="keydown"||k.test(e.key))e.preventDefault()}t.forEach(function(n){addEventListener(n,b,o)});setTimeout(function(){t.forEach(function(n){removeEventListener(n,b,o)});if(d.dataset.intro==="play"){d.dataset.intro="done";document.dispatchEvent(new Event("${INTRO_EVENT}"))}},${INTRO_OPEN_MS})})();`;

const GLYPHS = [
  "M8 8H94V27H61V92H41V27H8Z",
  "M112 8H150C184 8 204 26 204 50C204 74 184 92 150 92H112ZM131 27V73H148C171 73 184 64 184 50C184 36 171 27 148 27Z",
  "M216 8H239L256 35L273 8H296L268 50L296 92H273L256 65L239 92H216L244 50Z",
];

/**
 * First-visit-per-session intro: counter 000→100, the TDX mark drawn then filled, then a
 * two-panel curtain. The whole timeline is CSS (it starts at first paint and finishes even
 * without JS); React only syncs `useIntroDone()` to the curtain and unmounts the overlay.
 */
export function Preloader() {
  const t = useTranslations("FX.common.preloader");
  const ref = useRef<HTMLDivElement>(null);
  const skipped = useIntroSkipped();
  const hydrated = useHydrated();
  // Only an overlay that came with the server HTML may play; a client-only remount would replay it.
  const [fromServer] = useState(!hydrated);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const overlay = ref.current;
    if (skipped || !overlay) return;
    let cancelled = false;
    let openTimer = 0;
    const open = () => {
      markIntroDone();
      unlockScroll("intro");
    };
    lockScroll("intro");

    const animations = overlay.getAnimations({ subtree: true });
    const curtain = animations.find((animation) => (animation as CSSAnimation).animationName === "fx-pre-top");
    const elapsed = Number(curtain?.currentTime ?? 0);
    const wait = curtain ? Number(curtain.effect?.getTiming().delay ?? 0) - elapsed : 0;
    if (wait > 0) openTimer = window.setTimeout(open, wait);
    else open();

    const finish = () => {
      if (!cancelled) setGone(true);
    };
    Promise.all(animations.map((animation) => animation.finished)).then(finish, finish);
    return () => {
      cancelled = true;
      window.clearTimeout(openTimer);
      unlockScroll("intro");
    };
  }, [skipped]);

  if (!fromServer || skipped || gone) return null;

  return (
    <>
      <div ref={ref} className="fx-preloader" aria-hidden="true">
        <div className="fx-pre-panel fx-pre-top" />
        <div className="fx-pre-panel fx-pre-bottom" />
        <div className="fx-pre-seam" />
        <div className="fx-pre-stage">
          <span className="fx-pre-corner" data-corner="tl" />
          <span className="fx-pre-corner" data-corner="tr" />
          <span className="fx-pre-corner" data-corner="bl" />
          <span className="fx-pre-corner" data-corner="br" />
          <p className="fx-pre-label">TDX / {t("label")}</p>
          <svg className="fx-pre-mark" viewBox="0 0 300 100" fill="none">
            <defs>
              <linearGradient id="fx-pre-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="100">
                <stop offset="0" style={{ stopColor: "var(--accent)" }} />
                <stop offset="0.6" style={{ stopColor: "var(--amber)" }} />
                <stop offset="1" style={{ stopColor: "var(--accent-strong)" }} />
              </linearGradient>
            </defs>
            {GLYPHS.map((d, i) => (
              <path
                key={i}
                d={d}
                pathLength={1}
                fill="url(#fx-pre-gradient)"
                fillRule="evenodd"
                className="fx-pre-glyph"
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          </svg>
          <div className="fx-pre-meta">
            <span className="fx-pre-bar" />
            <span className="fx-pre-count" />
            <span className="fx-pre-status">
              <span>{t("loading")}</span>
              <span>{t("ready")}</span>
            </span>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
    </>
  );
}
