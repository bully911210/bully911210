// A 5x7 dot-matrix display face, generated: every lit pixel is a circle,
// every unlit pixel a faint dot from a pattern aligned to the same grid.
// Glyphs sit on whole grid columns, so text and the unlit matrix line up the
// way a real wallboard module does.
import { rng } from "./random9.mjs";

/** Every visible string, collected for copy.txt. */
export const COPY = new Set();

const G = {
  "0": "01110 10001 10011 10101 11001 10001 01110",
  "1": "00100 01100 00100 00100 00100 00100 01110",
  "2": "01110 10001 00001 00010 00100 01000 11111",
  "3": "11111 00010 00100 00010 00001 10001 01110",
  "4": "00010 00110 01010 10010 11111 00010 00010",
  "5": "11111 10000 11110 00001 00001 10001 01110",
  "6": "00110 01000 10000 11110 10001 10001 01110",
  "7": "11111 00001 00010 00100 01000 01000 01000",
  "8": "01110 10001 10001 01110 10001 10001 01110",
  "9": "01110 10001 10001 01111 00001 00010 01100",
  A: "01110 10001 10001 11111 10001 10001 10001",
  B: "11110 10001 10001 11110 10001 10001 11110",
  C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11100 10010 10001 10001 10001 10010 11100",
  E: "11111 10000 10000 11110 10000 10000 11111",
  F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100",
  K: "10001 10010 10100 11000 10100 10010 10001",
  L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001",
  N: "10001 10001 11001 10101 10011 10001 10001",
  O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  Q: "01110 10001 10001 10001 10101 10010 01101",
  R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100",
  W: "10001 10001 10001 10101 10101 10101 01010",
  X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 10001 01010 00100 00100 00100",
  Z: "11111 00001 00010 00100 01000 10000 11111",
  "%": "11000 11001 00010 00100 01000 10011 00011",
  ".": "0 0 0 0 0 0 1",
  ",": "0 0 0 0 0 1 1",
  ":": "0 1 1 0 1 1 0",
  "-": "0000 0000 0000 1111 0000 0000 0000",
  "+": "00000 00100 00100 11111 00100 00100 00000",
  "/": "00000 00001 00010 00100 01000 10000 00000",
  " ": "00 00 00 00 00 00 00",
};

/** Lit cells of one glyph as [col,row] pairs, plus its width in columns. */
export function glyph(ch) {
  const rows = (G[ch] ?? G[String(ch).toUpperCase()] ?? G[" "]).split(" ");
  const cells = [];
  rows.forEach((row, r) => [...row].forEach((v, c) => v === "1" && cells.push([c, r])));
  return { cells, w: rows[0].length };
}

/** Lays a string out on grid columns: one blank column between glyphs. */
export function layout(str, gap = 1) {
  COPY.add(String(str));
  const chars = [];
  let col = 0;
  for (const ch of String(str)) {
    const g = glyph(ch);
    chars.push({ ch, col, ...g });
    col += g.w + gap;
  }
  return { chars, cols: Math.max(0, col - gap) };
}

const f1 = (n) => +n.toFixed(1);

/** Circles as one path: much smaller than one <circle> per pixel. */
export function dotsPath(points, r) {
  const d = 2 * r;
  return points.map(([x, y]) => `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(d)} 0a${r} ${r} 0 1 0 ${f1(-d)} 0`).join("");
}

/** Cell centres for a set of glyph cells placed at grid origin (x0,y0). */
export const centres = (cells, x0, y0, pitch, colOffset = 0) =>
  cells.map(([c, r]) => [x0 + (c + colOffset + 0.5) * pitch, y0 + (r + 0.5) * pitch]);

/** Unlit matrix as a pattern, aligned to the same grid origin. */
export function offPattern(id, { x0, y0, pitch, r, fill }) {
  return `<pattern id="${id}" x="${x0}" y="${y0}" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><circle cx="${pitch / 2}" cy="${pitch / 2}" r="${r}" fill="${fill}"/></pattern>`;
}

/** Width in px of a string at a given pitch. */
export const ledWidth = (str, pitch, gap = 1) => layout(str, gap).cols * pitch;

/**
 * Static LED text. x is the left edge (or centre/right per anchor) and y the
 * top of the 7-row cell box; snap with `snap` to keep it on an off-grid.
 */
export function ledText(str, { x, y, pitch, r, fill, anchor = "start", gap = 1, attrs = "" }) {
  const { chars, cols } = layout(str, gap);
  const w = cols * pitch;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const pts = chars.flatMap((c) => centres(c.cells, x0, y, pitch, c.col));
  return { svg: `<path d="${dotsPath(pts, r)}" fill="${fill}" ${attrs}/>`, width: w, x0 };
}

/**
 * A readout that scrambles like a split-flap and settles on the real value.
 * The static frame shows the real value: the final glyphs carry no opacity
 * attribute, the scramble frames start hidden. SMIL drives the reveal and
 * repeats every `dur` seconds, like a wallboard refresh.
 */
export function ledReadout(value, { x, y, pitch, r, fill, seed = 1, dur = 12, start = 0.2, step = 0.14, frames = 7, frameLen = 0.065, gap = 1 }) {
  const rand = rng(seed);
  const { chars } = layout(value, gap);
  const kt = (s) => Math.min(0.999, Math.max(0.0005, s / dur)).toFixed(4);
  let digitIndex = 0;
  const parts = chars.map((c) => {
    const pts = centres(c.cells, x, y, pitch, c.col);
    if (!/[0-9]/.test(c.ch)) return `<path d="${dotsPath(pts, r)}" fill="${fill}"/>`;
    const settle = start + digitIndex++ * step;
    const finalAnim = `<animate attributeName="opacity" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="0;${kt(settle)}" values="0;1"/>`;
    const scramble = Array.from({ length: frames }, (_, k) => {
      const d = String(Math.floor(rand() * 10));
      const g = glyph(d);
      const t0 = settle - (frames - k) * frameLen;
      if (t0 < 0) return "";
      const p = centres(g.cells, x, y, pitch, c.col);
      return `<path d="${dotsPath(p, r)}" fill="${fill}" opacity="0"><animate attributeName="opacity" calcMode="discrete" dur="${dur}s" repeatCount="indefinite" keyTimes="0;${kt(t0)};${kt(t0 + frameLen)}" values="0;1;0"/></path>`;
    }).join("");
    return `<path d="${dotsPath(pts, r)}" fill="${fill}">${finalAnim}</path>${scramble}`;
  });
  return parts.join("");
}
