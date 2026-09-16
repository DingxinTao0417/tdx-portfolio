"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFdeCopy } from "@/data/fde";
import type { FdeAnswer, FdeQuestion } from "@/lib/fde-quiz";

export function ModuleCase({ question, answer, locale }: { question: FdeQuestion; answer: FdeAnswer; locale: string }) {
  const copy = getFdeCopy(locale);
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const score = checked.reduce((sum, index) => sum + answer.rubric[index].max_points, 0);
  return (
    <section id="module-case" className="mt-12 scroll-mt-28 rounded-2xl border border-line bg-bg-elevated p-5 sm:p-7">
      <p className="eyebrow text-accent">{copy.caseTitle}</p>
      <h2 lang="zh-CN" className="mt-3 text-xl font-semibold leading-8">{question.title}</h2>
      <p className="mt-3 text-xs leading-6 text-muted">{copy.caseBody}</p>
      <p lang="zh-CN" className="mt-5 text-sm leading-7">{question.stem}</p>
      <label htmlFor={id} className="mt-6 block text-xs text-muted">{copy.caseDraft}</label>
      <textarea id={id} rows={7} maxLength={12000} placeholder={copy.casePlaceholder} className="mt-2 w-full resize-y rounded-xl border border-line bg-bg p-4 text-sm leading-7 outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
      <Button type="button" size="sm" variant="secondary" className="mt-4" aria-expanded={revealed} aria-controls={id + "-reference"} onClick={() => setRevealed(!revealed)}>{copy.showReference}</Button>
      {revealed && <div id={id + "-reference"} className="mt-6 space-y-6 border-t border-line pt-6">
        <div><h3 className="text-sm font-semibold">{copy.answer}</h3><p lang="zh-CN" className="mt-3 whitespace-pre-wrap text-sm leading-8 text-muted">{answer.reference_answer}</p></div>
        <fieldset>
          <legend className="text-sm font-semibold">{copy.rubric}</legend>
          <p className="mt-2 text-xs leading-6 text-muted">{copy.caseScoreNote}</p>
          <div className="mt-3 space-y-2">{answer.rubric.map((item, index) => (
            <label key={item.criterion} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-sm leading-7 focus-within:ring-2 focus-within:ring-accent">
              <input type="checkbox" checked={checked.includes(index)} className="mt-1.5 h-4 w-4 shrink-0 accent-accent" onChange={() => setChecked(checked.includes(index) ? checked.filter((value) => value !== index) : [...checked, index])} />
              <span lang="zh-CN">{item.criterion}</span><span className="ml-auto shrink-0 font-mono text-xs text-muted">{item.max_points}</span>
            </label>
          ))}</div>
          <p role="status" className="mt-4 font-mono text-sm">{copy.caseScore} · {score} / {question.points}</p>
        </fieldset>
        <div className="rounded-xl bg-accent-soft p-4">
          <h3 className="text-sm font-medium">{copy.critical}</h3>
          <ul lang="zh-CN" className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">{answer.critical_failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
        </div>
      </div>}
    </section>
  );
}
