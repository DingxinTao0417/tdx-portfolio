// Draw the architecture article's cover and inline diagrams as vector art, then re-encode to WebP.
// Usage: node scripts/build-architecture-art.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const outDir = path.join(root, "public/images/blog");

const paper = { from: "#f7f1e4", to: "#eee3d2" };
const ink = "#2c2a26";
const muted = "#8b8478";
const accent = "#c2552f";
const teal = "#4f7566";
const zhFont = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif";
const latinFont = "'Georgia', 'Cambria', serif";

const defs = `
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${paper.from}"/>
      <stop offset="1" stop-color="${paper.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#fffaf0" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#fffaf0" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1.1" fill="${ink}" opacity="0.10"/>
    </pattern>
  </defs>`;

const frame = (width, height) => `
  <rect width="${width}" height="${height}" fill="url(#paper)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>`;

/* ---------------------------------------------------------------- cover */

// A boundary with five gates: one route enters through a gate, one shortcut is turned away.
function cover() {
  const left = 372;
  const right = 1180;
  const top = 268;
  const bottom = 764;
  const gates = [
    { x: left, y: 420, side: "left" },
    { x: left, y: 612, side: "left" },
    { x: 640, y: top, side: "top" },
    { x: 900, y: top, side: "top" },
    { x: right, y: 520, side: "right" },
  ];
  const blocks = [
    { x: 452, y: 348, w: 196, h: 88, tint: false },
    { x: 452, y: 470, w: 84, h: 190, tint: false },
    { x: 570, y: 470, w: 150, h: 88, tint: false },
    { x: 570, y: 590, w: 150, h: 70, tint: true },
    { x: 770, y: 348, w: 120, h: 130, tint: true },
    { x: 770, y: 512, w: 120, h: 148, tint: false },
    { x: 928, y: 470, w: 196, h: 88, tint: true },
    { x: 928, y: 590, w: 148, h: 70, tint: false },
  ];
  const links = [
    "M648 392 H700 V413 H770",
    "M536 470 V448 H770",
    "M890 512 V528",
    "M928 514 H890",
    "M890 660 H928",
    "M720 590 H770",
  ];
  const gapMarks = gates
    .map((g) => {
      const horizontal = g.side === "top";
      return horizontal
        ? `<line x1="${g.x - 18}" y1="${g.y}" x2="${g.x + 18}" y2="${g.y}" stroke="${paper.from}" stroke-width="8"/>
           <line x1="${g.x}" y1="${g.y - 34}" x2="${g.x}" y2="${g.y - 16}" stroke="${muted}" stroke-width="1.6"/>`
        : `<line x1="${g.x}" y1="${g.y - 18}" x2="${g.x}" y2="${g.y + 18}" stroke="${paper.from}" stroke-width="8"/>
           <line x1="${g.x + (g.side === "left" ? -34 : 34)}" y1="${g.y}" x2="${g.x + (g.side === "left" ? -16 : 16)}" y2="${g.y}" stroke="${muted}" stroke-width="1.6"/>`;
    })
    .join("");
  const gateDots = gates
    .map(
      (g) => `
      <circle cx="${g.x}" cy="${g.y}" r="17" fill="none" stroke="${accent}" stroke-opacity="0.3" stroke-width="1.4"/>
      <circle cx="${g.x}" cy="${g.y}" r="6" fill="${accent}"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
    ${defs}
    ${frame(1536, 1024)}

    <!-- a request that enters through the left gate -->
    <path d="M196 420 H320" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M320 420 H${left}" stroke="${muted}" stroke-width="2" stroke-dasharray="8 8" stroke-linecap="round" fill="none"/>
    <path d="M${left} 420 H436" stroke="${ink}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M${left - 8} 412 L${left} 420 L${left - 8} 428" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <path d="M428 412 L436 420 L428 428" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" fill="none"/>

    <!-- a shortcut that crosses away from any gate and stops -->
    <path d="M1352 660 H1218" stroke="${muted}" stroke-width="2" stroke-dasharray="8 8" stroke-linecap="round" fill="none"/>
    <g stroke="${accent}" stroke-width="2.6" stroke-linecap="round">
      <path d="M1218 648 L1198 672"/>
      <path d="M1198 648 L1218 672"/>
    </g>

    <!-- the boundary -->
    <rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" rx="12" fill="none" stroke="${ink}" stroke-width="2.2"/>
    ${gapMarks}
    ${gateDots}

    <!-- what sits inside -->
    ${blocks
      .map(
        (b) =>
          `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="4" fill="${b.tint ? teal : ink}" fill-opacity="${b.tint ? 0.12 : 0.06}" stroke="${ink}" stroke-opacity="0.4" stroke-width="1.4"/>`,
      )
      .join("")}
    ${links
      .map((d) => `<path d="${d}" stroke="${ink}" stroke-opacity="0.32" stroke-width="1.6" fill="none"/>`)
      .join("")}
  </svg>`;
}

/* -------------------------------------------------------------- diagram */

const rowsZh = [
  ["数据以哪里为准", "云端是唯一正式存储，刷新必须能读回", "cloud"],
  ["先写合同再填实现", "业务只通过 WorkspaceIO 接触存储", "contract"],
  ["并发用一个数字", "保存带上 expectedRevision，返回必须加一", "revision"],
  ["长任务离开请求", "任务进表，带租约和重试上限", "queue"],
  ["密钥只在服务端", "特权 key 不进客户端，不出现在构建产物里", "key"],
];

const rowsEn = [
  ["One authoritative store", "Cloud is the only store; a refresh must read it back", "cloud"],
  ["Write the contract first", "Business code reaches storage only through WorkspaceIO", "contract"],
  ["Concurrency as one number", "Saves send expectedRevision; the reply must be +1", "revision"],
  ["Long tasks leave the request", "Jobs go to a table with leases and a retry cap", "queue"],
  ["Secrets stay server-side", "The privileged key never reaches the client", "key"],
];

function glyph(kind, cx, cy) {
  const s = (body) => `<g transform="translate(${cx - 50} ${cy - 40}) scale(1.15)">${body}</g>`;
  switch (kind) {
    case "cloud":
      return s(`
        <path d="M16 48 a15 15 0 0 1 4-29 a19 19 0 0 1 35-2 a14 14 0 0 1 1 31 Z" fill="none" stroke="${ink}" stroke-width="2" stroke-linejoin="round" opacity="0.75"/>
        <path d="M48 52 v14" stroke="${accent}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M43 61 L48 68 L53 61" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="32" y="70" width="32" height="12" rx="2" fill="none" stroke="${ink}" stroke-width="2" opacity="0.75"/>
      `);
    case "contract":
      return s(`
        <path d="M22 16 h-8 v48 h8" fill="none" stroke="${ink}" stroke-width="2" stroke-linejoin="round" opacity="0.75"/>
        <path d="M78 16 h8 v48 h-8" fill="none" stroke="${ink}" stroke-width="2" stroke-linejoin="round" opacity="0.75"/>
        <line x1="34" y1="40" x2="48" y2="40" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="52" y1="40" x2="66" y2="40" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="50" cy="40" r="3" fill="${accent}"/>
      `);
    case "revision":
      return s(`
        <g fill="none" stroke="${ink}" stroke-width="2" opacity="0.7">
          <circle cx="16" cy="40" r="7"/><circle cx="40" cy="40" r="7"/><circle cx="64" cy="40" r="7"/>
        </g>
        <path d="M23 40 h10 M47 40 h10" stroke="${ink}" stroke-width="2" opacity="0.7"/>
        <path d="M64 40 h26" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M84 33 L92 40 L84 47" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      `);
    case "queue":
      return s(`
        <g fill="none" stroke="${ink}" stroke-width="2" opacity="0.7">
          <rect x="10" y="30" width="20" height="30" rx="2"/>
          <rect x="38" y="30" width="20" height="30" rx="2"/>
          <rect x="66" y="30" width="20" height="30" rx="2" stroke-dasharray="4 4"/>
        </g>
        <path d="M12 20 h70" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M76 14 L84 20 L76 26" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      `);
    case "key":
      return s(`
        <rect x="18" y="16" width="64" height="48" rx="4" fill="none" stroke="${ink}" stroke-width="2" opacity="0.7"/>
        <circle cx="40" cy="40" r="8" fill="none" stroke="${accent}" stroke-width="2.4"/>
        <path d="M48 40 h22 M62 40 v7 M70 40 v5" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
      `);
    default:
      return "";
  }
}

function diagram(rows, heading, subheading, font) {
  const top = 250;
  const rowH = 138;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
    ${defs}
    ${frame(1536, 1024)}
    <text x="120" y="128" font-family="${font}" font-size="46" fill="${ink}" letter-spacing="0.5">${heading}</text>
    <text x="120" y="180" font-family="${font}" font-size="24" fill="${muted}">${subheading}</text>
    <line x1="120" y1="212" x2="1416" y2="212" stroke="${ink}" stroke-opacity="0.25" stroke-width="1.5"/>
    ${rows
      .map(([title, detail, kind], i) => {
        const y = top + i * rowH;
        return `
        <text x="120" y="${y}" font-family="'Georgia', serif" font-size="26" fill="${accent}" letter-spacing="1">0${i + 1}</text>
        <text x="196" y="${y}" font-family="${font}" font-size="38" fill="${ink}">${title}</text>
        <text x="196" y="${y + 52}" font-family="${font}" font-size="25" fill="${muted}">${detail}</text>
        ${glyph(kind, 1300, y + 6)}
        <line x1="120" y1="${y + 92}" x2="1416" y2="${y + 92}" stroke="${ink}" stroke-opacity="0.13" stroke-width="1.4"/>`;
      })
      .join("")}
  </svg>`;
}

/* ----------------------------------------------------------------- run */

await fs.mkdir(outDir, { recursive: true });
const assets = [
  { name: "architecture-before-ai-cover.webp", svg: cover(), quality: 86 },
  {
    name: "architecture-before-ai-constraints-zh.webp",
    svg: diagram(rowsZh, "五条约束与对应的检查", "Conuo Web：每条约束都要落到一个能查的地方", zhFont),
    quality: 88,
  },
  {
    name: "architecture-before-ai-constraints-en.webp",
    svg: diagram(rowsEn, "Five constraints, five checks", "Conuo web: every constraint lands somewhere checkable", latinFont),
    quality: 88,
  },
];

for (const asset of assets) {
  const output = path.join(outDir, asset.name);
  await sharp(Buffer.from(asset.svg), { density: 144 })
    .resize(1536, 1024)
    .webp({ quality: asset.quality })
    .toFile(output);
  const { size } = await fs.stat(output);
  console.log(`${asset.name}  ${(size / 1024).toFixed(0)} KB`);
}
