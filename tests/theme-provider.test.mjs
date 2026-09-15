import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = await fs.readFile(
  new URL("../src/components/providers/theme-provider.tsx", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
  },
});

function providerElement(isServer) {
  const testModule = { exports: {} };
  vm.runInNewContext(outputText, {
    module: testModule,
    exports: testModule.exports,
    require,
    ...(isServer ? {} : { window: {} }),
  });
  return testModule.exports.ThemeProvider({
    children: createElement("main", null, "Theme content"),
  });
}

test("server rendering retains the executable before-paint theme bootstrap", () => {
  const html = renderToStaticMarkup(providerElement(true));
  assert.match(html, /<script[^>]*type="text\/javascript"/);
  assert.match(html, /<main>Theme content<\/main>/);
});

test("client renders mark the bootstrap inert while retaining theme and motion providers", () => {
  const element = providerElement(false);
  const html = renderToStaticMarkup(element);
  assert.match(html, /<script[^>]*type="text\/plain"/);
  assert.equal(element.props.attribute, "class");
  assert.equal(element.props.defaultTheme, "system");
  assert.equal(element.props.enableSystem, true);
  assert.equal(element.props.disableTransitionOnChange, true);
  assert.equal(element.props.children.props.reducedMotion, "user");
  assert.match(html, /<main>Theme content<\/main>/);
});

const serverHtml = renderToStaticMarkup(providerElement(true));
const bootstrap = serverHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(bootstrap, "The initial theme script is missing");

for (const [stored, systemDark, expected] of [
  ["dark", false, "dark"],
  ["light", true, "light"],
  ["system", true, "dark"],
  [null, false, "light"],
]) {
  test(`initial theme uses ${stored ?? "the system default"}, resolving to ${expected}`, () => {
    const classes = new Set(["font-example", "light", "dark"]);
    const style = {};
    vm.runInNewContext(bootstrap, {
      document: {
        documentElement: {
          classList: {
            remove(...values) { values.forEach(value => classes.delete(value)); },
            add(value) { classes.add(value); },
          },
          style,
        },
      },
      localStorage: {
        getItem(key) {
          assert.equal(key, "theme");
          return stored;
        },
      },
      window: {
        matchMedia(query) {
          assert.equal(query, "(prefers-color-scheme: dark)");
          return { matches: systemDark };
        },
      },
    });
    assert.deepEqual([...classes].sort(), ["font-example", expected].sort());
    assert.equal(style.colorScheme, expected);
  });
}

test("unavailable browser storage does not break the initial page", () => {
  assert.doesNotThrow(() => vm.runInNewContext(bootstrap, {
    document: { documentElement: {} },
    localStorage: { getItem() { throw new Error("Storage blocked"); } },
  }));
});
