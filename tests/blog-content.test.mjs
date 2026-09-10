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
const posts = [];
for (const locale of ["zh", "en"]) {
  const dir = path.join(root, "content/blog", locale);
  for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".mdx"))) {
    const { data, content } = matter(await fs.readFile(path.join(dir, file), "utf8"));
    posts.push({ locale, file, data, content });
  }
}

test("the tutorial exists in both locales and keeps its teaching-example boundary", () => {
  const tutorial = posts.filter((post) => post.file === "structured-workflows.mdx");
  assert.deepEqual(tutorial.map((post) => post.locale).sort(), ["en", "zh"]);
  for (const post of tutorial) {
    assert.equal(post.data.verification, "original-synthesis-not-empirically-validated");
    assert.equal((post.content.match(/^```text/gm) ?? []).length, 4);
    assert.equal((post.content.match(/<BlogImage\b/g) ?? []).length, 3);
    assert.ok(!post.content.includes("./assets/"));
  }
});

test("all current articles have a local cover and a localized alt description", async () => {
  for (const post of posts) {
    assert.match(post.data.cover, /^\/images\/blog\/[a-z0-9-]+\.webp$/);
    assert.ok(post.data.coverAlt.trim().length > 0, post.file);
    const metadata = await sharp(path.join(root, "public", post.data.cover)).metadata();
    assert.equal(metadata.width, 1536);
    assert.equal(metadata.height, 1024);
  }
});

test("every inline illustration exists and has correct layout dimensions", async () => {
  for (const post of posts) {
    const images = [...post.content.matchAll(/<BlogImage\s+([\s\S]*?)\/>/g)];
    assert.ok(images.length > 0, post.file);
    for (const [, props] of images) {
      const src = /src="([^"]+)"/.exec(props)?.[1];
      const width = Number(/width="(\d+)"/.exec(props)?.[1]);
      const height = Number(/height="(\d+)"/.exec(props)?.[1]);
      assert.match(src, /^\/images\/blog\/[a-z0-9-]+\.webp$/);
      assert.match(props, /alt="[^"]+"/);
      assert.match(props, /caption="[^"]+"/);
      const metadata = await sharp(path.join(root, "public", src)).metadata();
      assert.equal(metadata.width, width);
      assert.equal(metadata.height, height);
    }
  }
});

test("all bilingual MDX articles compile with the site's Markdown table support", async () => {
  for (const post of posts) {
    await assert.doesNotReject(compile(post.content, { remarkPlugins: [remarkGfm] }), `${post.locale}/${post.file}`);
  }
});

test("image dimensions survive the real MDX renderer's default JavaScript filtering", async () => {
  for (const post of posts) {
    let renderedImages = 0;
    const { content } = await compileMDX({
      source: post.content,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
      components: {
        BlogImage: ({ src, alt, width, height }) => {
          assert.ok(Number(width) > 0, `Missing rendered width in ${post.locale}/${post.file}: ${src}`);
          assert.ok(Number(height) > 0, `Missing rendered height in ${post.locale}/${post.file}: ${src}`);
          renderedImages++;
          return React.createElement("img", { src, alt, width, height });
        },
      },
    });
    renderToStaticMarkup(content);
    assert.ok(renderedImages > 0, post.file);
  }
});

test("the artwork manifest documents twelve compact, consistently sized assets", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, "docs/blog-visual-assets.json"), "utf8"));
  assert.equal(manifest.assets.length, 12);
  assert.equal(new Set(manifest.assets.map((asset) => asset.output)).size, 12);
  for (const asset of manifest.assets) {
    assert.ok(asset.prompt.length > 0);
    const file = path.join(root, asset.output);
    assert.ok((await fs.stat(file)).size < 256 * 1024, asset.name);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, asset.width);
    assert.equal(metadata.height, asset.height);
  }
});
