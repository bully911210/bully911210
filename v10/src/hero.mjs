// Hero: Franz's positioning above, his revenue system below, drawn as one
// isometric plant. The picture is the claim: he builds the pipe.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, paragraph, pill, panel, linear, rect } from "../../v5/src/ui.mjs";
import { plant } from "./plant.mjs";

const H = 1090;

/** Key to the drawing, as on any plant schematic. */
function legend(t, x, y) {
  return text("KEY", { x, y: y - 30, size: 15, family: "mono", weight: 700, tracking: 1.5, fill: t.faint }) +
    `<rect x="${x}" y="${y - 11}" width="22" height="10" rx="5" fill="${t.iso.groove}"/><circle cx="${x + 11}" cy="${y - 6}" r="3.1" fill="${t.iso.lead}"/>` +
    text("A lead", { x: x + 32, y, size: 16, fill: t.muted }) +
    `<path d="M${x + 110} ${y - 6}h24" stroke="${t.iso.signal}" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>` +
    text("The spend signal", { x: x + 144, y, size: 16, fill: t.muted });
}

export function hero(t) {
  const eyebrow = pill(t, { x: 64, y: 56, label: "Revenue infrastructure engineer · Pretoria", dot: t.accent[1], size: 15 });
  const thesis = paragraph("Most businesses don't have a marketing problem. They have an operational delay problem.", {
    x: 64, y: 290, size: 21, maxWidth: 520, lineHeight: 31, fill: t.text, weight: 500,
  });
  const operator = paragraph("Operator first. I build the systems a sales floor runs on, from the ad to the dial to the money.", {
    x: 640, y: 290, size: 19, maxWidth: 496, lineHeight: 29, fill: t.muted,
  });
  const p = plant(t, { ox: 330, oy: 752, labelTop: 436 });
  const [vx] = p.P.p(p.returnX, p.back, 0);
  const vy = 752 + 110;
  const defs = [linear("accent", t.accent), p.defs].join("");
  const body = [
    panel(t, W, H),
    eyebrow.svg,
    text("Franz Badenhorst", { x: 60, y: 172, size: 92, family: "grotesk", weight: 700, fill: t.text, tracking: -3 }),
    text("I fix what happens after the lead comes in.", { x: 64, y: 238, size: 38, weight: 650, fill: "url(#accent)", tracking: -0.9 }),
    thesis.svg,
    operator.svg,
    rect({ x: 64, y: 362, width: W - 128, height: 1, fill: t.hairline }),
    text("01  ·  BUILD THE PIPE", { x: 64, y: 398, size: 15, weight: 700, tracking: 2.5, fill: "url(#accent)" }),
    text("Six systems I built. One loop.", { x: W - 64, y: 398, size: 17, fill: t.muted, anchor: "end" }),
    p.body,
    legend(t, 64, 1012),
    text("Speed to dial.", { x: vx, y: vy, size: 34, family: "grotesk", weight: 700, fill: t.text, anchor: "middle", tracking: -0.8 }),
    text("Most lead quality problems are timing problems.", { x: vx, y: vy + 28, size: 16, fill: t.muted, anchor: "middle" }),
  ].join("");
  const title = "Franz Badenhorst, revenue infrastructure engineer in Pretoria. I fix what happens after the lead comes in. His revenue system drawn as an isometric plant: six systems, one loop.";
  return svg({ width: W, height: H, title, defs, body, style: css(p.css) });
}
