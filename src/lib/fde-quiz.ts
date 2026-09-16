export type FdeQuestion = {
  id: string;
  module_id: string;
  lesson_id: string | null;
  type: "single_choice" | "multiple_choice" | "open_response";
  title: string;
  stem: string;
  options: { id: string; text: string }[];
  hint: string;
  points: number;
};

export type FdeAnswer = {
  question_id: string;
  correct_option_ids: string[];
  explanation: string;
  reference_answer: string | null;
  rubric: { criterion: string; max_points: number }[];
  critical_failures: string[];
};

/** Learning-only exact-set grading; reject blank, duplicate and unknown choices. */
export function gradeFdeQuestion(question: FdeQuestion, answer: FdeAnswer, selected: unknown): boolean {
  if (question.type === "open_response" || answer.question_id !== question.id) return false;
  if (!Array.isArray(selected) || selected.length === 0 || selected.some((id) => typeof id !== "string")) return false;
  if (new Set(selected).size !== selected.length) return false;
  if (question.type === "single_choice" && selected.length !== 1) return false;
  const allowed = new Set(question.options.map((option) => option.id));
  if (selected.some((id) => !allowed.has(id))) return false;
  const expected = new Set(answer.correct_option_ids);
  return expected.size === selected.length && selected.every((id) => expected.has(id));
}

export type FdeProgress = { read: string[]; correct: string[] };
export const EMPTY_FDE_PROGRESS: FdeProgress = { read: [], correct: [] };

/** Ignore stale or malformed local records, including invented lesson/question IDs. */
export function parseFdeProgress(raw: string | null, lessonIds: readonly string[], questionIds: readonly string[]): FdeProgress {
  if (!raw) return EMPTY_FDE_PROGRESS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return EMPTY_FDE_PROGRESS;
    const value = parsed as Record<string, unknown>;
    const filter = (items: unknown, allowed: readonly string[]) =>
      Array.isArray(items) ? [...new Set(items.filter((item): item is string => typeof item === "string" && allowed.includes(item)))] : [];
    return { read: filter(value.read, lessonIds), correct: filter(value.correct, questionIds) };
  } catch {
    return EMPTY_FDE_PROGRESS;
  }
}
