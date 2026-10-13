// Shared SVG toolkit for the profile designs.
// GitHub serves README images through its camo proxy as <img>, which means:
// no scripts, no external fonts, no external images. So text is converted to
// vector paths and images are embedded as data URIs.
import opentype from "opentype.js";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FONT_FILES = {
  inter: { 400: "inter-latin-400-normal", 500: "inter-latin-500-normal", 600: "inter-latin-600-normal", 700: "inter-latin-700-normal", 800: "inter-latin-800-normal" },
  mono: { 400: "jetbrains-mono-latin-400-normal", 500: "jetbrains-mono-latin-500-normal", 700: "jetbrains-mono-latin-700-normal" },
  grotesk: { 500: "space-grotesk-latin-500-normal", 700: "space-grotesk-latin-700-normal" },
};
const PKG = { inter: "@fontsource/inter", mono: "@fontsource/jetbrains-mono", grotesk: "@fontsource/space-grotesk" };
const cache = new Map();

export function font(family = "inter", weight = 400) {
  const weights = FONT_FILES[family];
  if (!weights) throw new Error(`unknown font family ${family}`);
  const w = weights[weight] ? weight : Number(Object.keys(weights).reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a)));
  const key = `${family}-${w}`;
  if (!cache.has(key)) {
    const file = require.resolve(`${PKG[family]}/files/${weights[w]}.woff`);
    const buf = readFileSync(file);
    cache.set(key, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return cache.get(key);
}

// Manual layout: one glyph per character plus pair kerning. opentype.js's
// shaper cannot handle Inter's contextual lookups, and plain Latin labels
// need no shaping.
function layout(str, size, family, weight, tracking) {
  const f = font(family, weight);
  const scale = size / f.unitsPerEm;
  const glyphs = [];
  let x = 0, prev = null;
  for (const ch of String(str)) {
    const g = f.charToGlyph(ch);
    if (prev) x += f.getKerningValue(prev, g) * scale;
    glyphs.push({ g, x });
    x += g.advanceWidth * scale + tracking;
    prev = g;
  }
  return { glyphs, width: Math.max(0, x - tracking) };
}

/** Width in px of a string at a size, including letter spacing. */
export function measure(str, { size = 16, family = "inter", weight = 400, tracking = 0 } = {}) {
  return layout(str, size, family, weight, tracking).width;
}

const round = (d) => d.replace(/(-?\d+\.\d)\d+/g, "$1");

/**
 * Text as an SVG <path>. Options: x, y (baseline), size, family, weight,
 * fill, anchor ("start" | "middle" | "end"), tracking (px between glyphs),
 * attrs (extra attribute string, e.g. 'opacity="0.6"').
 */
export function text(str, { x = 0, y = 0, size = 16, family = "inter", weight = 400, fill = "currentColor", anchor = "start", tracking = 0, attrs = "" } = {}) {
  const s = String(str);
  if (!s) return "";
  const { glyphs, width } = layout(s, size, family, weight, tracking);
  const x0 = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const d = glyphs.map(({ g, x: gx }) => g.getPath(x0 + gx, y, size).toPathData(2)).join("");
  return `<path d="${round(d)}" fill="${fill}" ${attrs}/>`;
}

/** Truncates a string with an ellipsis so it fits maxWidth. */
export function fit(str, maxWidth, opts) {
  let s = String(str ?? "");
  if (measure(s, opts) <= maxWidth) return s;
  while (s.length > 1 && measure(s + "…", opts) > maxWidth) s = s.slice(0, -1);
  return s.trimEnd() + "…";
}

/** Greedy word wrap into lines no wider than maxWidth. */
export function wrap(str, maxWidth, opts) {
  const lines = [];
  let line = "";
  for (const word of String(str ?? "").split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, opts) > maxWidth) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Fetches an image (URL or local path), resizes it, and returns a data URI.
 * frame: which frame of an animated GIF to take.
 */
export async function embedImage(src, { width = 640, height, quality = 72, frame = 0, fit: fitMode = "cover", position = "top" } = {}) {
  let input;
  if (/^https?:/.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`image ${src}: HTTP ${res.status}`);
    input = Buffer.from(await res.arrayBuffer());
  } else input = readFileSync(src);
  const out = await sharp(input, { page: frame, pages: 1 })
    .resize({ width, height, fit: fitMode, position })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

/** Escapes text for use inside XML attributes or <title>. */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

/** Wraps content in a root <svg> with a <title> for screen readers. */
export function svg({ width, height, title, body, defs = "", style = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${style ? `<style>${style}</style>` : ""}${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;
}

export const compact = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1e3)}k` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(n));
