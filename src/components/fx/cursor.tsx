"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { rafThrottle, useFinePointer, usePrefersReducedMotion } from "./hooks";

const INTERACTIVE =
  "a[href], button:not(:disabled), [role='button'], [role='link'], [role='tab'], [role='menuitem'], [role='option'], [role='switch'], summary, label[for], select, [data-cursor]";
const TEXT_ENTRY =
  "input:not([type]), input[type='text'], input[type='email'], input[type='search'], input[type='url'], input[type='tel'], input[type='password'], input[type='number'], textarea, [contenteditable]:not([contenteditable='false'])";

const RING_IDLE = 24;
const RING_HOVER = 40;
const SNAP_PAD = 10;

type Mode = "idle" | "hover" | "snap" | "label" | "text" | "hidden";
type Target = { mode: Mode; label: string | null; element: HTMLElement | null };

function resolve(target: EventTarget | null): Target {
  const node = target instanceof Element ? target : null;
  if (!node || node.closest("[data-cursor='hide']")) return { mode: node ? "hidden" : "idle", label: null, element: null };
  if (node.closest(TEXT_ENTRY)) return { mode: "text", label: null, element: null };
  const labelled = node.closest<HTMLElement>("[data-cursor-text]");
  if (labelled?.dataset.cursorText) return { mode: "label", label: labelled.dataset.cursorText, element: labelled };
  const interactive = node.closest<HTMLElement>(INTERACTIVE);
  if (!interactive) return { mode: "idle", label: null, element: null };
  return { mode: interactive.dataset.cursor === "snap" ? "snap" : "hover", label: null, element: interactive };
}

/**
 * Calm contextual cursor: a precise accent dot plus a lagging ring that only appears over
 * interactive elements. `data-cursor-text` shows a label pill, `data-cursor="snap"` wraps the
 * ring around the element, `data-cursor="hide"` hides it; it steps aside over text fields.
 * The native cursor stays visible. Mounts only for fine pointers without reduced motion.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  if (!fine || reduced) return null;
  return <CursorLayer />;
}

function CursorLayer() {
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const ringW = useMotionValue(RING_IDLE);
  const ringH = useMotionValue(RING_IDLE);
  const ringR = useMotionValue(RING_IDLE / 2);
  const dotX = useSpring(pointerX, { stiffness: 1400, damping: 70, mass: 0.25 });
  const dotY = useSpring(pointerY, { stiffness: 1400, damping: 70, mass: 0.25 });
  const followX = useSpring(ringX, { stiffness: 420, damping: 36, mass: 0.7 });
  const followY = useSpring(ringY, { stiffness: 420, damping: 36, mass: 0.7 });
  const width = useSpring(ringW, { stiffness: 380, damping: 32 });
  const height = useSpring(ringH, { stiffness: 380, damping: 32 });
  const radius = useSpring(ringR, { stiffness: 380, damping: 32 });

  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let pointer: [number, number] | null = null;
    let snap: { element: HTMLElement; rect: DOMRect } | null = null;
    let current: Mode = "idle";
    let shown = false;
    let refreshTimer = 0;

    const place = () => {
      if (!pointer) return;
      const [px, py] = pointer;
      if (snap) {
        const { rect } = snap;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        ringX.set(cx + (px - cx) * 0.14);
        ringY.set(cy + (py - cy) * 0.14);
      } else {
        ringX.set(px);
        ringY.set(py);
      }
    };

    const size = (w: number, h: number, r: number) => {
      ringW.set(w);
      ringH.set(h);
      ringR.set(r);
    };

    const apply = (next: Target) => {
      if (next.mode === "snap" && next.element) {
        const rect = next.element.getBoundingClientRect();
        const corner = parseFloat(getComputedStyle(next.element).borderTopLeftRadius) || 8;
        snap = { element: next.element, rect };
        size(rect.width + SNAP_PAD, rect.height + SNAP_PAD, Math.min(corner + SNAP_PAD / 2, (rect.height + SNAP_PAD) / 2));
      } else {
        snap = null;
        const ring = next.mode === "hover" ? RING_HOVER : RING_IDLE;
        size(ring, ring, ring / 2);
      }
      if (next.label) setLabel(next.label);
      if (next.mode !== current) {
        current = next.mode;
        setMode(next.mode);
      }
      place();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = [event.clientX, event.clientY];
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      if (!shown) {
        // Appear in place instead of flying in from the corner.
        shown = true;
        dotX.jump(event.clientX);
        dotY.jump(event.clientY);
        followX.jump(event.clientX);
        followY.jump(event.clientY);
        setVisible(true);
      }
      place();
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse") apply(resolve(event.target));
    };
    // Content can change under a still pointer (route changes, menus closing).
    const refresh = () => {
      if (pointer) apply(resolve(document.elementFromPoint(pointer[0], pointer[1])));
    };
    const onClick = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refresh, 700);
    };
    const onScroll = rafThrottle(() => {
      if (!snap) return;
      if (!snap.element.isConnected) return refresh();
      snap.rect = snap.element.getBoundingClientRect();
      place();
    });
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPressed(true);
    };
    const onUp = () => setPressed(false);
    const onOut = (event: MouseEvent) => {
      if (event.relatedTarget) return;
      pointer = null;
      shown = false;
      setVisible(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      window.clearTimeout(refreshTimer);
      onScroll.cancel();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onOut);
    };
  }, [pointerX, pointerY, ringX, ringY, ringW, ringH, ringR, dotX, dotY, followX, followY]);

  return (
    <div
      aria-hidden="true"
      className="fx-cursor"
      data-mode={mode}
      data-visible={visible ? "" : undefined}
      data-pressed={pressed ? "" : undefined}
    >
      <motion.div className="fx-cursor-anchor" style={{ x: followX, y: followY }}>
        <motion.span className="fx-cursor-ring" style={{ width, height, borderRadius: radius }} />
        <span className="fx-cursor-label">{label}</span>
      </motion.div>
      <motion.div className="fx-cursor-anchor" style={{ x: dotX, y: dotY }}>
        <span className="fx-cursor-dot" />
      </motion.div>
    </div>
  );
}
