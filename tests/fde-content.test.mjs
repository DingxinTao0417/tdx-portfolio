import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import matter from "gray-matter";
import sharp from "sharp";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";

const root = fileURLToPath(new URL("../", import.meta.url));
const courseDir = path.join(root, "content/courses/fde");
const course = JSON.parse(await fs.readFile(path.join(courseDir, "course.json"), "utf8"));
const questions = JSON.parse(await fs.readFile(path.join(courseDir, "questions.json"), "utf8")).questions;
const answers = JSON.parse(await fs.readFile(path.join(courseDir, "answer-key.json"), "utf8")).answers;
const lessons = course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module })));

test("every lesson and case has an unambiguous question and answer mapping", () => {
  assert.equal(course.modules.length, 8);
  assert.equal(lessons.length, course.lesson_count);
  assert.equal(questions.length, course.question_counts.total);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  assert.equal(new Set(answers.map((answer) => answer.question_id)).size, answers.length);
  assert.equal(answers.length, questions.length);
  for (const lesson of lessons) {
    assert.match(lesson.content_path, /^lessons\/\d{2}-\d{2}\.md$/);
    assert.equal(lesson.objective_question_ids.length, 2);
    for (const id of lesson.objective_question_ids) {
      const question = questions.find((item) => item.id === id);
      assert.equal(question?.lesson_id, lesson.id);
      assert.equal(question?.module_id, lesson.module.id);
      assert.ok(["single_choice", "multiple_choice"].includes(question.type));
      const answer = answers.find((item) => item.question_id === id);
      assert.ok(answer.correct_option_ids.length > 0);
      assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
      assert.ok(answer.correct_option_ids.every((option) => question.options.some((item) => item.id === option)));
      assert.ok(answer.explanation.trim().length > 0);
    }
  }
  for (const courseModule of course.modules) {
    const question = questions.find((item) => item.id === courseModule.case_question_id);
    assert.equal(question?.type, "open_response");
    assert.equal(question?.module_id, courseModule.id);
    const answer = answers.find((item) => item.question_id === question.id);
    assert.ok(answer.reference_answer.trim().length > 0);
    assert.equal(answer.rubric.reduce((sum, item) => sum + item.max_points, 0), question.points);
  }
});

test("all 32 teaching notes keep their identity and compile with tables and copyable templates", async () => {
  for (const lesson of lessons) {
    const { data, content } = matter(await fs.readFile(path.join(courseDir, lesson.content_path), "utf8"));
    assert.equal(data.id, lesson.id);
    assert.equal(data.title, lesson.title);
    assert.equal(data.module, lesson.module.order);
    assert.equal(data.lesson, lesson.order);
    assert.match(content, /## 动手/);
    assert.match(content, /### 检查/);
    assert.match(content, /~~~text/);
    await assert.doesNotReject(compile(content, { remarkPlugins: [remarkGfm] }), lesson.id);
    const { content: rendered } = await compileMDX({ source: content, options: { mdxOptions: { remarkPlugins: [remarkGfm] } } });
    const html = renderToStaticMarkup(React.createElement(React.Fragment, null, rendered));
    assert.ok(html.includes("<pre>"), lesson.id);
    assert.ok(html.includes("检查"), lesson.id);
  }
});

test("all six localized teaching images exist and match their declared layout dimensions", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, "docs/fde-visual-assets.json"), "utf8"));
  assert.equal(manifest.assets.length, 6);
  assert.equal(new Set(manifest.assets.map((asset) => asset.output)).size, 6);
  for (const asset of manifest.assets) {
    assert.ok(asset.prompt.length > 0);
    const metadata = await sharp(path.join(root, asset.output)).metadata();
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
  }
});
