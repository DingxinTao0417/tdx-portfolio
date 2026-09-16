"use client";

import { Check, Circle, RotateCcw } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
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
      <Button type="button" variant={read ? "secondary" : "primary"} onClick={() => {
        const current = getSnapshot();
        const next = read ? current.read.filter((id) => id !== lessonId) : [...new Set([...current.read, lessonId])];
        setUnavailable(!saveRecord({ ...current, read: next }));
      }}>
        {read ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {read ? copy.undo : copy.mark}
      </Button>
      {unavailable && <p role="status" className="mt-2 text-xs text-muted">{copy.storageUnavailable}</p>}
    </div>
  );
}

export function LearningRecord({ locale }: { locale: string }) {
  const copy = getFdeCopy(locale);
  const record = useLearningRecord();
  const [confirming, setConfirming] = useState(false);
  const next = fdeLessons.find((lesson) => !record.read.includes(lesson.id));
  return (
    <section aria-label={copy.progress} className="rounded-2xl border border-line bg-bg-elevated p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">{copy.progress}</h2>
          <p className="mt-2 max-w-xl text-xs leading-6 text-muted">{copy.progressBody}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {confirming ? <>
            <Button size="sm" variant="secondary" type="button" onClick={() => { saveRecord(EMPTY_FDE_PROGRESS); setConfirming(false); }}>{copy.confirmClear}</Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setConfirming(false)}>{copy.cancel}</Button>
          </> : <Button size="sm" variant="ghost" type="button" onClick={() => setConfirming(true)}><RotateCcw className="h-3.5 w-3.5" />{copy.clear}</Button>}
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {[{ label: copy.readingProgress, value: record.read.length, total: fdeLessons.length }, { label: copy.quizProgress, value: record.correct.length, total: questionIds.length }].map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between gap-4 text-xs"><span>{item.label}</span><span className="font-mono">{item.value} / {item.total}</span></div>
            <progress value={item.value} max={item.total} aria-label={item.label} className="learning-progress h-1.5 w-full" />
          </div>
        ))}
      </div>
      {memoryOnly && <p role="status" className="mt-3 text-xs text-muted">{copy.storageUnavailable}</p>}
      {record.read.length > 0 && next && <a href={(locale === "en" ? "/en" : "") + "/learn/fde/" + next.slug} className="mt-5 inline-flex min-h-11 items-center text-sm text-accent">{copy.continue} · {next.title}</a>}
    </section>
  );
}
