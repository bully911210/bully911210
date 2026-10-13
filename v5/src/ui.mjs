// Small drawing primitives shared by every visual. All return SVG strings
// (or {svg, width/height} when the caller needs the measured size).
import { text as rawText, measure as rawMeasure } from "../../lib/svg.mjs";

// NaN-safe wrappers around the shared toolkit: a NaN kerning pair counts as
// zero, so a glyph can never vanish from a heading.
const pairKern = (a, b, o) => {
  const k = rawMeasure(a + b, { ...o, tracking: 0 }) - rawMeasure(a, { ...o, tracking: 0 }) - rawMeasure(b, { ...o, tracking: 0 });
  return Number.isFinite(k) ? k : 0;
};

function advances(str, o) {
  const chars = [...String(str)];
  const xs = [];
  let x = 0;
  chars.forEach((ch, i) => {
    xs.push(x);
    const w = rawMeasure(ch, { ...o, tracking: 0 });
    x += (Number.isFinite(w) ? w : 0) + (o.tracking ?? 0) + (i < chars.length - 1 ? pairKern(ch, chars[i + 1], o) : 0);
  });
  return { chars, xs, width: Math.max(0, x - (o.tracking ?? 0)) };
}

export function measure(str, o = {}) {
  const w = rawMeasure(str, o);
  return Number.isFinite(w) ? w : advances(str, o).width;
}

// opentype.js's path serialiser occasionally emits "NaN" for a coordinate
// at particular sub-pixel offsets. Nudging the origin by a hundredth of a
// pixel avoids it without any visible change.
function cleanText(str, o) {
  for (let i = 0; i < 8; i++) {
    const out = rawText(str, { ...o, x: (o.x ?? 0) + i * 0.013, y: (o.y ?? 0) + i * 0.007 });
    if (!out.includes("NaN")) return out;
  }
  return null;
}

export function text(str, o = {}) {
  const out = cleanText(str, o);
  if (out !== null) return out;
  const { chars, xs, width } = advances(str, o);
  const x0 = (o.x ?? 0) - (o.anchor === "middle" ? width / 2 : o.anchor === "end" ? width : 0);
  return chars.map((ch, i) => (ch.trim() ? cleanText(ch, { ...o, anchor: "start", x: x0 + xs[i] }) ?? "" : "")).join("");
}

/** Greedy word wrap using the NaN-safe measure. */
export function wrap(str, maxWidth, o) {
  const lines = [];
  let line = "";
  for (const word of String(str ?? "").split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, o) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

export const rect = (o) => `<rect ${attrs(o)}/>`;
export const path = (d, o = {}) => `<path ${attrs({ d, ...o })}/>`;
export const group = (body, o = {}) => `<g ${attrs(o)}>${body}</g>`;
export const fmt = (n) => Number(n).toLocaleString("en-US");

export function linear(id, colors, { x1 = 0, y1 = 0, x2 = 1, y2 = 0, opacity } = {}) {
  const stops = colors
    .map((c, i) => `<stop offset="${(i / Math.max(1, colors.length - 1)).toFixed(3)}" stop-color="${c}"${opacity != null ? ` stop-opacity="${opacity}"` : ""}/>`)
    .join("");
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
}

export const radialFade = (id, color, opacity) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="0.55" stop-color="${color}" stop-opacity="${(opacity * 0.45).toFixed(3)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;

/** The rounded card every visual lives on. */
export const panel = (t, w, h, { r = 24, fill = t.panel } = {}) =>
  rect({ x: 0.5, y: 0.5, width: w - 1, height: h - 1, rx: r, fill, stroke: t.border, "stroke-width": 1 });

export const cardClip = (id, w, h, r = 24) => `<clipPath id="${id}"><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}"/></clipPath>`;

/** Soft drifting colour fields. blobs: [{x,y,rx,ry,color:[hex,opacity],cls}] */
export function aurora(prefix, blobs) {
  const defs = blobs.map((b, i) => radialFade(`${prefix}${i}`, b.color[0], b.color[1])).join("");
  const body = blobs
    .map((b, i) => group(`<ellipse cx="${b.x}" cy="${b.y}" rx="${b.rx}" ry="${b.ry}" fill="url(#${prefix}${i})"/>`, { class: b.cls }))
    .join("");
  return { defs, body };
}

/** Faint engineering grid that fades out from a focal point. */
export function fadedGrid(t, id, { w, h, cx, cy, r, cell = 44 }) {
  const defs = `<pattern id="${id}p" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><path d="M${cell} 0H0V${cell}" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>
<radialGradient id="${id}g" cx="${cx / w}" cy="${cy / h}" r="${r}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${id}m"><rect width="${w}" height="${h}" fill="url(#${id}g)"/></mask>`;
  return { defs, body: rect({ width: w, height: h, fill: `url(#${id}p)`, mask: `url(#${id}m)` }) };
}

/** Wrapped text block. Returns the svg and the height it used. */
export function paragraph(str, { x, y, size, maxWidth, lineHeight = Math.round(size * 1.5), family = "inter", weight = 400, fill, anchor = "start", tracking = 0 }) {
  const lines = wrap(str, maxWidth, { size, family, weight, tracking });
  const svg = lines.map((l, i) => text(l, { x, y: y + i * lineHeight, size, family, weight, fill, anchor, tracking })).join("");
  return { svg, height: lines.length * lineHeight, lines: lines.length };
}

/** Rounded label with optional leading dot. x is the left edge, y the top. */
export function pill(t, { x, y, label, size = 15, h = 34, dot, fill = t.chipFill, stroke = t.chipStroke, color = t.muted, weight = 500, family = "inter" }) {
  const pad = 14;
  const dotSpace = dot ? 16 : 0;
  const width = pad * 2 + dotSpace + measure(label, { size, family, weight });
  const cy = y + h / 2;
  const svg = [
    rect({ x, y, width, height: h, rx: h / 2, fill, stroke, "stroke-width": 1 }),
    dot ? `<circle cx="${x + pad + 4}" cy="${cy}" r="4" fill="${dot}"/>` : "",
    text(label, { x: x + pad + dotSpace, y: cy + size * 0.36, size, family, weight, fill: color }),
  ].join("");
  return { svg, width };
}

/** Thin up-right arrow, drawn as strokes so it never depends on a glyph. */
export const arrowUpRight = (x, y, s, color, w = 2) =>
  path(`M${x} ${y + s}L${x + s} ${y}M${x + s * 0.3} ${y}H${x + s}V${y + s * 0.7}`, { fill: "none", stroke: color, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" });

/** Embedded raster clipped to a rounded rectangle. */
export function image(id, href, { x, y, w, h, r = 0, align = "xMidYMid" }) {
  const clip = `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`;
  return { defs: clip, body: `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${align} slice" clip-path="url(#${id})"/>` };
}

/** "View repo" call to action used at the foot of each card. */
export function cta(t, { x, y, label, gradId, anchor = "start", arrow = t.accent[2] }) {
  const size = 17;
  const width = measure(label, { size, weight: 600 }) + 22;
  const x0 = anchor === "end" ? x - width : x;
  return text(label, { x: x0, y, size, weight: 600, fill: `url(#${gradId})` }) + arrowUpRight(x0 + width - 13, y - 12, 11, arrow, 2);
}

/** Chips flowed into at most `maxLines` lines, overflow summarised as "+N more". */
export function chipFlow(t, items, { x, y, maxWidth, maxLines = 2, color, h = 36, gap = 10, lineGap = 10 }) {
  const size = 17;
  const chipWidth = (it) => 28 + measure(it.label, { size, weight: 500 }) + 10 + measure(String(it.count), { size: 16, family: "mono", weight: 700 });
  const lines = [[]];
  let used = 0;
  let placed = 0;
  for (const it of items) {
    const w = chipWidth(it);
    if (used + w > maxWidth) {
      if (lines.length === maxLines) break;
      lines.push([]);
      used = 0;
    }
    lines.at(-1).push({ ...it, w });
    used += w + gap;
    placed++;
  }
  const rest = items.length - placed;
  if (rest > 0) {
    const more = { label: `+${rest} more`, w: 28 + measure(`+${rest} more`, { size, weight: 500 }), more: true };
    const last = lines.at(-1);
    const lineWidth = () => last.reduce((s, c) => s + c.w + gap, 0);
    while (last.length && lineWidth() + more.w > maxWidth) {
      last.pop();
      more.label = `+${rest + 1} more`;
    }
    last.push(more);
  }
  const svg = lines
    .map((line, li) => {
      let cx = x;
      const cy = y + li * (h + lineGap);
      return line
        .map((c) => {
          const s = [
            rect({ x: cx, y: cy, width: c.w, height: h, rx: 10, fill: t.chipFill, stroke: t.chipStroke }),
            text(c.label, { x: cx + 14, y: cy + h / 2 + 6, size, weight: 500, fill: c.more ? t.faint : t.text }),
            c.more ? "" : text(String(c.count), { x: cx + c.w - 14, y: cy + h / 2 + 6, size: 16, family: "mono", weight: 700, fill: color, anchor: "end" }),
          ].join("");
          cx += c.w + gap;
          return s;
        })
        .join("");
    })
    .join("");
  return { svg, height: lines.length * (h + lineGap) - lineGap };
}
