// Re-encode approved, already-generated PNGs without cropping or resizing.
// Usage: node scripts/import-blog-art.mjs <image-generation-output-directory> [manifest-path]
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDir = process.argv[2];
if (!sourceDir) throw new Error("Provide the directory containing the approved generated PNGs.");
const manifestPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(root, "docs/blog-visual-assets.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
await fs.mkdir(path.join(root, "public/images/blog"), { recursive: true });
for (const asset of manifest.assets) {
  const source = path.resolve(asset.sourceBase === "workspace" ? root : sourceDir, asset.source);
  const output = path.resolve(root, asset.output);
  const metadata = await sharp(source).metadata();
  if (metadata.width !== asset.width || metadata.height !== asset.height) {
    throw new Error(`Unexpected dimensions for ${asset.name}: ${metadata.width}x${metadata.height}`);
  }
  const info = await sharp(source).webp({ quality: asset.quality ?? 88 }).toFile(output);
  console.log(`${asset.name}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}
