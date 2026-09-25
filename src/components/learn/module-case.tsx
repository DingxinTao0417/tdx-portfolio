"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState, type CSSProperties } from "react";
import { burst } from "@/components/blog/burst";
import { RollingNumber } from "@/components/blog/rolling-number";
import { Button } from "@/components/ui/button";
import { getFdeCopy } from "@/data/fde";
import type { FdeAnswer, FdeQuestion } from "@/lib/fde-quiz";
import { cn } from "@/lib/utils";

export function ModuleCase({ question, answer, locale }: { question: FdeQuestion; answer: FdeAnswer; locale: string }) {
  const copy = getFdeCopy(locale);
  const id = useId();
  const scoreRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const score = checked.reduce((sum, index) => sum + answer.rubric[index].max_points, 0);
  const full = score >= question.points;

  return (
    <section id="module-case" className="relative mt-12 scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-bg-elevated p-5 sm:p-7">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-28 opacity-40 mask-fade-b" />
      <p className="eyebrow relative flex items-center gap-3 text-accent">
        <span aria-hidden="true" className="h-px w-6 bg-accent" />
        {copy.caseTitle}
      </p>
      <h2 lang="zh-CN" className="relative mt-3 text-xl font-semibold leading-8">{question.title}</h2>
      <p className="mt-3 text-xs leading-6 text-muted">{copy.caseBody}</p>
      <p lang="zh-CN" className="mt-5 text-sm leading-7">{question.stem}</p>
      <label htmlFor={id} className="mt-6 block text-xs text-muted">{copy.caseDraft}</label>
      <div className="pfx-field relative mt-2">
        <textarea id={id} rows={7} maxLength={12000} placeholder={copy.casePlaceholder} className="block w-full resize-y rounded-xl border border-line bg-bg p-4 text-sm leading-7 outline-none transition-[border-color,box-shadow] duration-300 focus:border-accent/50 focus:shadow-[0_0_0_4px_var(--accent-soft)]" />
        <svg aria-hidden="true" className="pfx-trace">
          <rect width="100%" height="100%" rx="12" pathLength={1} />
        </svg>
      </div>
      <Button type="button" size="sm" variant="secondary" className="mt-4" aria-expanded={revealed} aria-controls={id + "-reference"} onClick={() => setRevealed(!revealed)}>{copy.showReference}</Button>
      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            key="reference"
            id={id + "-reference"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 space-y-6 border-t border-line pt-6"
          >
            <div><h3 className="text-sm font-semibold">{copy.answer}</h3><p lang="zh-CN" className="mt-3 whitespace-pre-wrap text-sm leading-8 text-muted">{answer.reference_answer}</p></div>
            <fieldset>
              <legend className="text-sm font-semibold">{copy.rubric}</legend>
              <p className="mt-2 text-xs leading-6 text-muted">{copy.caseScoreNote}</p>
              <div className="mt-3 space-y-2">{answer.rubric.map((item, index) => {
                const on = checked.includes(index);
                return (
                  <label key={item.criterion} className={cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-7 transition-[border-color,background-color] duration-300 focus-within:ring-2 focus-within:ring-accent", on ? "border-accent/50 bg-accent-soft" : "border-line hover:border-line-strong")}>
                    <input type="checkbox" checked={on} className="mt-1.5 h-4 w-4 shrink-0 accent-accent" onChange={() => setChecked(on ? checked.filter((value) => value !== index) : [...checked, index])} />
                    <span lang="zh-CN">{item.criterion}</span><span className={cn("ml-auto shrink-0 font-mono text-xs transition-colors", on ? "text-accent" : "text-muted")}>{item.max_points}</span>
                  </label>
                );
              })}</div>
              <div className="mt-5">
                <p role="status" className="sr-only">{copy.caseScore} · {score} / {question.points}</p>
                <div aria-hidden="true" className="flex items-baseline gap-2 font-mono text-sm">
                  <span className="text-muted">{copy.caseScore} ·</span>
                  <span ref={scoreRef}>
                    <RollingNumber value={score} pad={2} className={cn("text-lg transition-colors", full ? "text-accent" : "text-fg")} />
                  </span>
                  <span className="text-muted">/ {question.points}</span>
                </div>
                <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    style={{ "--p": question.points ? score / question.points : 0 } as CSSProperties}
                    className="h-full origin-left scale-x-(--p) rounded-full bg-[linear-gradient(90deg,var(--accent),var(--amber))] transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    onTransitionEnd={() => { if (full) burst(scoreRef.current, { count: 12, radius: 40 }); }}
                  />
                </div>
              </div>
            </fieldset>
            <div className="rounded-xl bg-accent-soft p-4">
              <h3 className="text-sm font-medium">{copy.critical}</h3>
              <ul lang="zh-CN" className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">{answer.critical_failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
