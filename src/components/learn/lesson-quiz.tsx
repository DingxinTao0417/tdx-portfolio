"use client";

import { Check, CheckCircle2, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { burst } from "@/components/blog/burst";
import { Button } from "@/components/ui/button";
import { getFdeCopy } from "@/data/fde";
import { gradeFdeQuestion, type FdeAnswer, type FdeQuestion } from "@/lib/fde-quiz";
import { cn } from "@/lib/utils";
import { recordCorrectFdeAnswer, useLearningRecord } from "./learning-record";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const SHAKE = [0, -10, 9, -6, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` }));
const panel = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function QuestionForm({ question, answer, locale, number }: { question: FdeQuestion; answer: FdeAnswer; locale: string; number: number }) {
  const copy = getFdeCopy(locale);
  const id = useId();
  const record = useLearningRecord();
  const form = useRef<HTMLFormElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"empty" | "correct" | "incorrect" | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saveUnavailable, setSaveUnavailable] = useState(false);
  const multiple = question.type === "multiple_choice";
  const feedbackId = id + "-feedback";
  const solved = record.correct.includes(question.id);

  return (
    <form
      ref={form}
      className={cn(
        "relative rounded-2xl border bg-bg-elevated p-5 transition-[border-color] duration-500 sm:p-7",
        result === "correct" ? "border-accent/60" : "border-line",
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const still = reducedMotion();
        if (selected.length === 0) {
          setResult("empty");
          if (!still) options.current?.animate(SHAKE, { duration: 380, easing: EASE });
          return;
        }
        const correct = gradeFdeQuestion(question, answer, selected);
        setResult(correct ? "correct" : "incorrect");
        if (!correct) {
          if (!still) options.current?.animate(SHAKE, { duration: 460, easing: EASE });
          return;
        }
        setSaveUnavailable(!recordCorrectFdeAnswer(question.id));
        setRevealed(true);
        burst((event.nativeEvent as SubmitEvent).submitter ?? form.current, { count: 18, radius: 72 });
        if (!still) {
          form.current?.animate(
            [
              { boxShadow: "0 0 0 0 var(--accent-glow)" },
              { boxShadow: "0 0 0 16px transparent" },
            ],
            { duration: 900, easing: EASE },
          );
        }
      }}
    >
      <fieldset aria-describedby={result ? feedbackId : undefined}>
        <legend className="w-full text-base font-medium leading-7">
          <span className="mb-3 flex items-center gap-3 font-mono text-xs text-muted">
            <span className="text-accent">0{number}</span>
            {multiple ? copy.multiple : copy.single}
            {solved && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] text-accent">
                <Check aria-hidden="true" className="h-3 w-3" />
                {copy.correct}
              </span>
            )}
          </span>
          <span lang="zh-CN">{question.stem}</span>
        </legend>
        {multiple && <p className="mt-2 text-xs leading-6 text-muted">{copy.exact}</p>}
        <div ref={options} className="mt-5 space-y-2">
          {question.options.map((option) => {
            const checked = selected.includes(option.id);
            const key = revealed && answer.correct_option_ids.includes(option.id);
            return (
              <label
                key={option.id}
                className={cn(
                  "relative flex min-h-12 cursor-pointer items-start gap-3 overflow-hidden rounded-xl border p-3.5 text-sm leading-6 transition-[border-color,background-color] duration-300 focus-within:ring-2 focus-within:ring-accent",
                  checked ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 w-0.5 origin-top bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    checked ? "scale-y-100" : "scale-y-0",
                  )}
                />
                <input type={multiple ? "checkbox" : "radio"} name={id} value={option.id} checked={checked} className="mt-1 h-4 w-4 shrink-0 accent-accent" onChange={() => {
                  setSelected(multiple ? checked ? selected.filter((value) => value !== option.id) : [...selected, option.id] : [option.id]);
                  setResult(null);
                  setRevealed(false);
                }} />
                <span className="font-mono text-xs text-muted">{option.id}</span>
                <span lang="zh-CN">{option.text}</span>
                <AnimatePresence>
                  {key && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-(--fx-on-accent)"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" size="sm">{copy.submit}</Button>
        <Button type="button" size="sm" variant="ghost" aria-expanded={hint} aria-controls={id + "-hint"} onClick={() => setHint(!hint)}><Lightbulb className="h-3.5 w-3.5" />{copy.hint}</Button>
        <Button type="button" size="sm" variant="ghost" aria-expanded={revealed} aria-controls={id + "-answer"} onClick={() => setRevealed(!revealed)}>{copy.explanation}</Button>
        {(selected.length > 0 || result || revealed) && <Button type="button" size="sm" variant="ghost" onClick={() => { setSelected([]); setResult(null); setHint(false); setRevealed(false); }}>{copy.reset}</Button>}
      </div>
      {result && (
        <motion.p
          key={result}
          id={feedbackId}
          role={result === "empty" ? "alert" : "status"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={"mt-4 flex items-start gap-2 text-sm leading-6 " + (result === "correct" ? "text-fg" : "text-accent")}
        >
          {result === "correct" && (
            <motion.span
              initial={{ scale: 0.3, rotate: -60 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="mt-1 shrink-0 text-accent"
            >
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            </motion.span>
          )}
          {copy[result]}
        </motion.p>
      )}
      <AnimatePresence initial={false}>
        {hint && (
          <motion.p key="hint" id={id + "-hint"} lang="zh-CN" className="mt-4 rounded-xl bg-bg p-4 text-sm leading-7 text-muted" {...panel}>
            {question.hint}
          </motion.p>
        )}
      </AnimatePresence>
      {saveUnavailable && <p role="status" className="mt-3 text-xs leading-6 text-muted">{copy.storageUnavailable}</p>}
      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div key="answer" id={id + "-answer"} className="mt-4 rounded-xl border border-line bg-bg p-4 text-sm leading-7" {...panel}>
            <p className="font-medium">{copy.answer} · {answer.correct_option_ids.join("、")}</p>
            <p lang="zh-CN" className="mt-2 text-muted">{answer.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export function LessonQuiz({ items, locale }: { items: { question: FdeQuestion; answer: FdeAnswer }[]; locale: string }) {
  const copy = getFdeCopy(locale);
  return (
    <section id="self-test" className="mt-14 scroll-mt-28 border-t border-line pt-9">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{copy.quiz}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{copy.quizBody}</p>
      <div className="mt-6 space-y-5">{items.map((item, index) => <QuestionForm key={item.question.id} {...item} locale={locale} number={index + 1} />)}</div>
    </section>
  );
}
