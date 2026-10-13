// Section headings and call-to-action buttons. Headings are transparent so
// they sit directly on GitHub's page colour, like a landing page section.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, measure, paragraph, linear, rect, arrowUpRight, path } from "./ui.mjs";

export function sectionHeader(t, { eyebrow, title, sub }) {
  const lines = paragraph(sub, { x: W / 2, y: 152, size: 19, maxWidth: 820, lineHeight: 29, fill: t.muted, anchor: "middle" });
  const H = 152 + lines.height + 10;
  const body = [
    text(eyebrow, { x: W / 2, y: 44, size: 15, weight: 700, tracking: 2.5, fill: "url(#accent)", anchor: "middle" }),
    text(title, { x: W / 2, y: 106, size: 50, family: "grotesk", weight: 700, tracking: -1.5, fill: t.text, anchor: "middle" }),
    lines.svg,
  ].join("");
  return svg({ width: W, height: H, title: `${title} ${sub}`, defs: linear("accent", t.accent), body });
}

const ICONS = {
  download: (x, y, c) => path(`M${x + 10} ${y}V${y + 14}M${x + 4} ${y + 9}L${x + 10} ${y + 15}L${x + 16} ${y + 9}M${x + 2} ${y + 20}H${x + 18}`, { stroke: c, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }),
  mail: (x, y, c) => rect({ x: x + 1, y: y + 3, width: 20, height: 15, rx: 3, fill: "none", stroke: c, "stroke-width": 2.2 }) + path(`M${x + 2} ${y + 5}L${x + 11} ${y + 12}L${x + 20} ${y + 5}`, { stroke: c, "stroke-width": 2.2, fill: "none", "stroke-linejoin": "round" }),
  play: (x, y, c) => `<circle cx="${x + 11}" cy="${y + 10}" r="10" fill="none" stroke="${c}" stroke-width="2.2"/>` + path(`M${x + 8.5} ${y + 5.5}L${x + 15} ${y + 10}L${x + 8.5} ${y + 14.5}Z`, { fill: c }),
  arrow: (x, y, c) => arrowUpRight(x + 3, y + 3, 14, c, 2.4),
};

/**
 * Pill button. primary: gradient fill. tone: "accent" | "amber".
 * Rendered at 76px tall; the README shows it at 50px.
 */
export function button(t, { label, icon = "arrow", primary = false, tone = "accent" }) {
  const H = 76, size = 25, iconW = 22, gap = 14, padX = 34;
  const labelW = measure(label, { size, weight: 600 });
  const w = Math.ceil(padX * 2 + iconW + gap + labelW);
  const colors = tone === "amber" ? t.amber : t.accent;
  const fg = primary ? t.buttonText : t.text;
  const defs = linear("btn", colors, { x1: 0, y1: 0, x2: 1, y2: 1 });
  const body = [
    rect({ x: 1, y: 1, width: w - 2, height: H - 2, rx: (H - 2) / 2, fill: primary ? "url(#btn)" : t.panel, stroke: primary ? "none" : t.border, "stroke-width": 1.5 }),
    ICONS[icon](padX, H / 2 - 10, primary ? fg : colors[1]),
    text(label, { x: padX + iconW + gap, y: H / 2 + 9, size, weight: 600, fill: fg }),
  ].join("");
  return svg({ width: w, height: H, title: label, defs, body, style: css() });
}
