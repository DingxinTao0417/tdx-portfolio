import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { EMPTY_FDE_PROGRESS, gradeFdeQuestion, parseFdeProgress } from "../src/lib/fde-quiz.ts";

const bank = JSON.parse(await fs.readFile(new URL("../content/courses/fde/questions.json", import.meta.url), "utf8"));
const key = JSON.parse(await fs.readFile(new URL("../content/courses/fde/answer-key.json", import.meta.url), "utf8"));

test("all 64 objective questions accept exactly their answer set, independent of order", () => {
  const questions = bank.questions.filter((q) => q.type !== "open_response");
  assert.equal(questions.length, 64);
  for (const question of questions) {
    const answer = key.answers.find((item) => item.question_id === question.id);
    assert.equal(gradeFdeQuestion(question, answer, answer.correct_option_ids), true, question.id);
    assert.equal(gradeFdeQuestion(question, answer, [...answer.correct_option_ids].reverse()), true, question.id);
    assert.equal(gradeFdeQuestion(question, answer, []), false);
    assert.equal(gradeFdeQuestion(question, answer, ["unknown"]), false);
    assert.equal(gradeFdeQuestion(question, answer, [...answer.correct_option_ids, answer.correct_option_ids[0]]), false);
    if (answer.correct_option_ids.length > 1) assert.equal(gradeFdeQuestion(question, answer, answer.correct_option_ids.slice(1)), false);
    const wrong = question.options.find((option) => !answer.correct_option_ids.includes(option.id));
    if (wrong) assert.equal(gradeFdeQuestion(question, answer, [...answer.correct_option_ids, wrong.id]), false);
  }
});

test("invalid input, mismatched answer keys and open responses cannot be auto-passed", () => {
  const question = bank.questions[0];
  const answer = key.answers[0];
  for (const invalid of [null, undefined, "B", {}, [1], ["B", "C"]]) assert.equal(gradeFdeQuestion(question, answer, invalid), false);
  assert.equal(gradeFdeQuestion(question, { ...answer, question_id: "other" }, ["B"]), false);
  for (const item of bank.questions.filter((q) => q.type === "open_response")) assert.equal(gradeFdeQuestion(item, key.answers.find((a) => a.question_id === item.id), ["A"]), false);
});

test("local progress rejects malformed records and filters duplicated, stale or invented IDs", () => {
  const lessons = ["m01-l01", "m01-l02"];
  const questions = ["m01-l01-q01"];
  for (const invalid of [null, "", "{", "null", "42", "[]"]) assert.deepEqual(parseFdeProgress(invalid, lessons, questions), EMPTY_FDE_PROGRESS);
  assert.deepEqual(parseFdeProgress(JSON.stringify({ read: ["m01-l01", "m01-l01", "m99-l99", null], correct: ["m01-l01-q01", "m01-case01", "fake"] }), lessons, questions), { read: ["m01-l01"], correct: ["m01-l01-q01"] });
  assert.deepEqual(parseFdeProgress(JSON.stringify({ read: {}, correct: "bad" }), lessons, questions), EMPTY_FDE_PROGRESS);
});
