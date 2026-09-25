import type Lenis from "lenis";

let instance: Lenis | null = null;
const locks = new Set<string>();

function sync() {
  if (!instance) return;
  if (locks.size > 0) instance.stop();
  else instance.start();
}

/** Registered by `SmoothScroll`; null on touch devices and under reduced motion. */
export function getLenis() {
  return instance;
}

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
  sync();
}

/** Stops smooth wheel scrolling while any lock is held (native/touch scrolling is unaffected). */
export function lockScroll(reason: string) {
  locks.add(reason);
  sync();
}

export function unlockScroll(reason: string) {
  locks.delete(reason);
  sync();
}

export function isScrollLocked() {
  return locks.size > 0;
}

/** Scrolls with Lenis when it is running, otherwise natively. */
export function scrollToTarget(
  target: number | string | HTMLElement,
  { offset = 0, immediate = false }: { offset?: number; immediate?: boolean } = {},
) {
  if (instance && !instance.isStopped) {
    instance.scrollTo(target, { offset, immediate });
    return;
  }
  const behavior: ScrollBehavior = immediate ? "instant" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }
  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}
