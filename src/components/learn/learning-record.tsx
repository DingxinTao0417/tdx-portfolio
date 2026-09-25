"use client";

import { ArrowRight, Check, Circle, RotateCcw } from "lucide-react";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { burst } from "@/components/blog/burst";
import { RollingNumber } from "@/components/blog/rolling-number";
import { FxTrigger } from "@/components/fx/trigger";
import { Button } from "@/components/ui/button";
import { fdeCourse, fdeLessons, getFdeCopy } from "@/data/fde";
import { EMPTY_FDE_PROGRESS, parseFdeProgress, type FdeProgress } from "@/lib/fde-quiz";

const storageKey = fdeCourse.id + ":learning-record:1";
const changeEvent = "fde-learning-record";
const lessonIds = fdeLessons.map((lesson) => lesson.id);
const questionIds = fdeLessons.flatMap((lesson) => lesson.objective_question_ids);
let cachedRaw: string | null | undefined;
let cachedRecord = EMPTY_FDE_PROGRESS;
let memoryRecord = EMPTY_FDE_PROGRESS;
let memoryOnly = false;

function getSnapshot() {
  if (memoryOnly) return memoryRecord;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedRecord = parseFdeProgress(raw, lessonIds, questionIds);
    }
    return cachedRecord;
  } catch {
    return memoryRecord;
  }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) callback(); };
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function saveRecord(record: FdeProgress): boolean {
  memoryRecord = record;
  let saved = true;
  try { window.localStorage.setItem(storageKey, JSON.stringify(record)); cachedRaw = undefined; } catch { saved = false; }
  memoryOnly = !saved;
  window.dispatchEvent(new Event(changeEvent));
  return saved;
}

export function recordCorrectFdeAnswer(questionId: string) {
  if (!questionIds.includes(questionId)) return false;
  const current = getSnapshot();
  if (!current.correct.includes(questionId)) return saveRecord({ ...current, correct: [...current.correct, questionId] });
  return !memoryOnly;
}

export function useLearningRecord() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_FDE_PROGRESS);
}

export function LessonReadButton({ lessonId, locale }: { lessonId: string; locale: string }) {
  const copy = getFdeCopy(locale);
  const record = useLearningRecord();
  const [unavailable, setUnavailable] = useState(false);
  const read = record.read.includes(lessonId);
  return (
    <div>
      <Button type="button" variant={read ? "secondary" : "primary"} onClick={(event) => {
        const current = getSnapshot();
        const next = read ? current.read.filter((id) => id !== lessonId) : [...new Set([...current.read, lessonId])];
        setUnavailable(!saveRecord({ ...current, read: next }));
        if (!read) burst(event.currentTarget, { count: 16, radius: 64 });
      }}>
        {read ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {read ? copy.undo : copy.mark}
      </Button>
      {unavailable && <p role="status" className="mt-2 text-xs text-muted">{copy.storageUnavailable}</p>}
    </div>
  );
}

/** Segmented HUD meter: one tick per lesson/question, filled with a gradient sweep once in view. */
function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-4 text-xs">
        <span>{label}</span>
        <span className="flex items-baseline font-mono text-muted">
          <RollingNumber value={value} pad={2} className="text-base text-fg" />
          <span aria-hidden="true">&nbsp;/ {total}</span>
        </span>
      </div>
      <progress value={value} max={total} aria-label={label} className="sr-only" />
      <div aria-hidden="true" className="relative h-2 overflow-hidden rounded-full bg-line">
        <div
          style={{ "--p": total ? value / total : 0 } as CSSProperties}
          className="h-full origin-left scale-x-0 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--amber))] shadow-[0_0_12px_var(--accent-glow)] transition-[scale] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[fx-state=play]/fx:scale-x-(--p)"
        />
        <div
          style={{ "--n": total } as CSSProperties}
          className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_calc(100%/var(--n)-1px),var(--bg-elevated)_0_calc(100%/var(--n)))]"
        />
      </div>
    </div>
  );
}

export function LearningRecord({ locale }: { locale: string }) {
  const copy = getFdeCopy(locale);
  const record = useLearningRecord();
  const [confirming, setConfirming] = useState(false);
  const next = fdeLessons.find((lesson) => !record.read.includes(lesson.id));
  return (
    <section aria-label={copy.progress} className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-sm font-semibold">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
            {copy.progress}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-muted">{copy.progressBody}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {confirming ? <>
            <Button size="sm" variant="secondary" type="button" onClick={() => { saveRecord(EMPTY_FDE_PROGRESS); setConfirming(false); }}>{copy.confirmClear}</Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setConfirming(false)}>{copy.cancel}</Button>
          </> : <Button size="sm" variant="ghost" type="button" onClick={() => setConfirming(true)}><RotateCcw className="h-3.5 w-3.5" />{copy.clear}</Button>}
        </div>
      </div>
      <FxTrigger className="mt-6 grid gap-6 sm:grid-cols-2">
        <Meter label={copy.readingProgress} value={record.read.length} total={fdeLessons.length} />
        <Meter label={copy.quizProgress} value={record.correct.length} total={questionIds.length} />
      </FxTrigger>
      {memoryOnly && <p role="status" className="mt-3 text-xs text-muted">{copy.storageUnavailable}</p>}
      {record.read.length > 0 && next && (
        <a
          href={(locale === "en" ? "/en" : "") + "/learn/fde/" + next.slug}
          className="group/next mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-accent"
        >
          <span>{copy.continue} · <span lang="zh-CN">{next.title}</span></span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/next:translate-x-1" />
        </a>
      )}
    </section>
  );
}
