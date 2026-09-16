"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFdeCopy } from "@/data/fde";
import { gradeFdeQuestion, type FdeAnswer, type FdeQuestion } from "@/lib/fde-quiz";
import { recordCorrectFdeAnswer } from "./learning-record";

function QuestionForm({ question, answer, locale, number }: { question: FdeQuestion; answer: FdeAnswer; locale: string; number: number }) {
  const copy = getFdeCopy(locale);
  const id = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"empty" | "correct" | "incorrect" | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saveUnavailable, setSaveUnavailable] = useState(false);
  const multiple = question.type === "multiple_choice";
  const feedbackId = id + "-feedback";
  return (
    <form className="rounded-2xl border border-line bg-bg-elevated p-5 sm:p-7" onSubmit={(event) => {
      event.preventDefault();
      if (selected.length === 0) { setResult("empty"); return; }
      const correct = gradeFdeQuestion(question, answer, selected);
      setResult(correct ? "correct" : "incorrect");
      if (correct) { setSaveUnavailable(!recordCorrectFdeAnswer(question.id)); setRevealed(true); }
    }}>
      <fieldset aria-describedby={result ? feedbackId : undefined}>
        <legend className="w-full text-base font-medium leading-7">
          <span className="mb-3 flex items-center gap-3 font-mono text-xs text-muted"><span className="text-accent">0{number}</span>{multiple ? copy.multiple : copy.single}</span>
          <span lang="zh-CN">{question.stem}</span>
        </legend>
        {multiple && <p className="mt-2 text-xs leading-6 text-muted">{copy.exact}</p>}
        <div className="mt-5 space-y-2">
          {question.options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label key={option.id} className={"flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 transition-colors focus-within:ring-2 focus-within:ring-accent " + (checked ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong")}>
                <input type={multiple ? "checkbox" : "radio"} name={id} value={option.id} checked={checked} className="mt-1 h-4 w-4 shrink-0 accent-accent" onChange={() => {
                  setSelected(multiple ? checked ? selected.filter((value) => value !== option.id) : [...selected, option.id] : [option.id]);
                  setResult(null);
                  setRevealed(false);
                }} />
                <span className="font-mono text-xs text-muted">{option.id}</span>
                <span lang="zh-CN">{option.text}</span>
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
      {result && <p id={feedbackId} role={result === "empty" ? "alert" : "status"} className={"mt-4 flex items-start gap-2 text-sm leading-6 " + (result === "correct" ? "text-fg" : "text-accent")}>{result === "correct" && <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />}{copy[result]}</p>}
      {hint && <p id={id + "-hint"} lang="zh-CN" className="mt-4 rounded-xl bg-bg p-4 text-sm leading-7 text-muted">{question.hint}</p>}
      {saveUnavailable && <p role="status" className="mt-3 text-xs leading-6 text-muted">{copy.storageUnavailable}</p>}
      {revealed && <div id={id + "-answer"} className="mt-4 rounded-xl border border-line bg-bg p-4 text-sm leading-7">
        <p className="font-medium">{copy.answer} · {answer.correct_option_ids.join("、")}</p>
        <p lang="zh-CN" className="mt-2 text-muted">{answer.explanation}</p>
      </div>}
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
