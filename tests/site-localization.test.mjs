import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { parse } from "@formatjs/icu-messageformat-parser";

const messages = Object.fromEntries(await Promise.all(
  ["zh", "en"].map(async (locale) => [
    locale,
    JSON.parse(await fs.readFile(new URL(`../src/messages/${locale}.json`, import.meta.url), "utf8")),
  ]),
));

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

function flatten(value, prefix = "") {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}.${key}`));
}

function argumentsIn(nodes, result = new Set()) {
  for (const node of nodes) {
    if (node.type >= 1 && node.type <= 6) result.add(node.value);
    if (node.options) {
      for (const option of Object.values(node.options)) argumentsIn(option.value, result);
    }
    if (node.children) argumentsIn(node.children, result);
  }
  return [...result].sort();
}

test("Chinese and English messages retain matching keys, types, and array lengths", () => {
  assert.deepEqual(shape(messages.zh), shape(messages.en));
});

test("every localized message is non-empty and valid ICU", () => {
  for (const [locale, catalog] of Object.entries(messages)) {
    for (const [key, value] of flatten(catalog)) {
      assert.ok(value.trim(), `${locale}${key} is empty`);
      assert.doesNotThrow(() => parse(value), `${locale}${key} has invalid ICU syntax`);
    }
  }
});

test("localized message rewrites preserve the same interpolation arguments", () => {
  const english = new Map(flatten(messages.en));
  for (const [key, value] of flatten(messages.zh)) {
    assert.deepEqual(argumentsIn(parse(value)), argumentsIn(parse(english.get(key))), key);
  }
});
