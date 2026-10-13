// Hardware primitives: the matte chassis every visual sits in, screws,
// recessed display wells, chapter rails. Restraint: hairlines and screws,
// no gradients-for-the-sake-of-it.
import { text as rawText, paragraph as rawParagraph, rect, measure } from "../../v5/src/ui.mjs";
import { offPattern, COPY } from "./led.mjs";

export { rect, measure, COPY };
export { path, group, fmt, arrowUpRight, wrap } from "../../v5/src/ui.mjs";

/** Text as paths; every string is also recorded for the copy lint. */
export const text = (str, o) => (COPY.add(String(str)), rawText(str, o));
export const paragraph = (str, o) => (COPY.add(String(str)), rawParagraph(str, o));

/** The chassis: a matte panel, an inset hairline and four screws. */
export function chassis(t, w, h, { r = 22, screws = true } = {}) {
  const s = screws ? [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]].map(([x, y]) => screw(t, x, y)).join("") : "";
  return [
    rect({ x: 0.5, y: 0.5, width: w - 1, height: h - 1, rx: r, fill: t.panel, stroke: t.border }),
    rect({ x: 10.5, y: 10.5, width: w - 21, height: h - 21, rx: r - 8, fill: "none", stroke: t.hairline }),
    s,
  ].join("");
}

/** A countersunk screw head with a slot at a fixed, slightly turned angle. */
export function screw(t, x, y, r = 5.5) {
  const a = ((x * 7 + y * 13) % 60) - 30;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${t.screw}" stroke="${t.screwSlot}" stroke-width="1"/><path d="M${x - r + 1.5} ${y}H${x + r - 1.5}" stroke="${t.screwSlot}" stroke-width="1.6" transform="rotate(${a} ${x} ${y})"/>`;
}

/**
 * Recessed display well with an unlit dot matrix. Returns defs, body and the
 * grid origin, so LED text can be snapped onto the same columns.
 */
export function well(t, id, { x, y, w, h, pitch, r, pad = 0, rx = 10 }) {
  const x0 = x + pad + ((w - 2 * pad) % pitch) / 2;
  const y0 = y + pad + ((h - 2 * pad) % pitch) / 2;
  const cols = Math.floor((w - 2 * pad) / pitch), rows = Math.floor((h - 2 * pad) / pitch);
  const defs = offPattern(id, { x0, y0, pitch, r, fill: t.ledOff });
  const body = [
    rect({ x, y, width: w, height: h, rx, fill: t.well, stroke: t.rule }),
    rect({ x: x0, y: y0, width: cols * pitch, height: rows * pitch, fill: `url(#${id})` }),
  ].join("");
  return { defs, body, x0, y0, cols, rows };
}

/** Engraved label: JetBrains Mono, tracked, uppercase. */
export const label = (t, str, o = {}) =>
  text(str, { size: 15, family: "mono", weight: 700, tracking: 1.6, fill: t.faint, ...o });

/** Chapter rail: "01 · THE CHAIN" with a status LED. */
export function chapter(t, n, name, { x = 64, y = 70, anchor = "start" } = {}) {
  const str = `${n} · ${name}`;
  const w = measure(str, { size: 15, family: "mono", weight: 700, tracking: 2 });
  const x0 = anchor === "middle" ? x - (w + 18) / 2 : x;
  return `<circle cx="${x0 + 5}" cy="${y - 5}" r="4.5" fill="${t.led}"/>` +
    text(str, { x: x0 + 18, y, size: 15, family: "mono", weight: 700, tracking: 2, fill: t.led });
}

/** Status LED, optionally pulsing (CSS, so reduced motion stops it). */
export const statusLed = (t, x, y, { r = 4.5, pulse = false } = {}) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${t.led}"${pulse ? ' class="pulse"' : ""}/>`;

export const PULSE_CSS = "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}.pulse{animation:pulse 2.4s ease-in-out infinite}";
