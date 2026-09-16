import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import questions from "../../content/courses/fde/questions.json";
import answers from "../../content/courses/fde/answer-key.json";
import { fdeModules, findFdeLesson } from "@/data/fde";
import type { FdeAnswer, FdeQuestion } from "./fde-quiz";

const questionBank = questions.questions as FdeQuestion[];
const answerBank = answers.answers as FdeAnswer[];

export async function getFdeLesson(slug: string) {
  const lesson = findFdeLesson(slug);
  if (!lesson) return null;
  const raw = await fs.readFile(path.join(process.cwd(), "content/courses/fde", lesson.content_path), "utf8");
  const { content } = matter(raw);
  const body = content.trim().replace(/^# .+\r?\n/, "").trim()
    .replace(/^## 学完能做什么\r?\n[\s\S]*?(?=\r?\n## )/, "").trim();
  return { ...lesson, content: body };
}

export function getFdeQuiz(lessonId: string) {
  return questionBank.filter((question) => question.lesson_id === lessonId).map((question) => ({
    question,
    answer: answerBank.find((answer) => answer.question_id === question.id)!,
  }));
}

export function getFdeCase(moduleId: string) {
  const courseModule = fdeModules.find((item) => item.id === moduleId);
  if (!courseModule) return null;
  const question = questionBank.find((item) => item.id === courseModule.case_question_id);
  const answer = answerBank.find((item) => item.question_id === courseModule.case_question_id);
  return question && answer ? { question, answer } : null;
}
