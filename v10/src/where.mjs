// "Where it runs": every business on one composed panel. SIG leads as the
// flagship; the rest sit in a 2x2 index. Adapted from v5 without the glows,
// with each line kept to what the brief can stand behind.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, measure, paragraph, panel, linear, rect, arrowUpRight } from "../../v5/src/ui.mjs";

export const BUSINESSES = [
  { key: "acorn", name: "Acorn Brokers", url: "https://acornbrokers.co.za", category: "INSURANCE", line: "Insurance distribution." },
  { key: "licenceready", name: "LicenceReady", url: "https://licenceready.co.za", category: "FIREARM LICENSING", line: "Firearm licence motivation letters, built on local crime data." },
  { key: "civilsociety", name: "Civil Society SA", url: "https://civilsocietysouthafrica.co.za", category: "ADVOCACY", line: "Digital acquisition and advocacy." },
  { key: "stacked", name: "Stacked Marketing", url: "https://stackedmarketing.co.za", category: "PERFORMANCE", line: "Performance infrastructure." },
];

const domainOf = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function flagship(t, y) {
  const sigW = measure("SIG", { size: 60, family: "grotesk", weight: 700, tracking: -1.5 });
  const blurb = paragraph("An outbound call centre. The sales floor this whole plant was built for.", { x: 640, y: y + 34, size: 19, maxWidth: 496, lineHeight: 29, fill: t.muted });
  return [
    text("FLAGSHIP  ·  OUTBOUND SALES", { x: 64, y: y + 6, size: 15, family: "mono", weight: 700, tracking: 1.5, fill: t.faint }),
    text("SIG", { x: 62, y: y + 72, size: 60, family: "grotesk", weight: 700, tracking: -1.5, fill: "url(#accent)" }),
    text("Solutions", { x: 62 + sigW + 14, y: y + 72, size: 60, family: "grotesk", weight: 500, tracking: -1.5, fill: t.text }),
    text("sigsolutions.co.za", { x: 64, y: y + 112, size: 17, family: "mono", weight: 500, fill: t.accent[1] }),
    arrowUpRight(64 + measure("sigsolutions.co.za", { size: 17, family: "mono", weight: 500 }) + 10, y + 99, 11, t.accent[1], 2),
    blurb.svg,
    text("Built by operators. Priced like a partner.", { x: 640, y: y + 34 + blurb.height + 22, size: 19, weight: 650, fill: t.text }),
  ].join("");
}

function entry(t, b, x, y, color) {
  const domain = domainOf(b.url);
  const dw = measure(domain, { size: 16, family: "mono", weight: 500 });
  return [
    `<circle cx="${x + 5}" cy="${y - 5}" r="5" fill="${color}"/>`,
    text(b.category, { x: x + 20, y, size: 15, family: "mono", weight: 700, tracking: 1.5, fill: t.faint }),
    text(b.name, { x, y: y + 42, size: 30, family: "grotesk", weight: 700, tracking: -0.6, fill: t.text }),
    paragraph(b.line, { x, y: y + 74, size: 17, maxWidth: 480, lineHeight: 25, fill: t.muted }).svg,
    text(domain, { x, y: y + 132, size: 16, family: "mono", weight: 500, fill: color }),
    arrowUpRight(x + dw + 10, y + 120, 10, color, 2),
  ].join("");
}

export function whereItRuns(t) {
  const H = 850;
  const grid = BUSINESSES.map((b, i) => entry(t, b, i % 2 ? 640 : 64, 448 + Math.floor(i / 2) * 212, t.layers[i % t.layers.length])).join("");
  const defs = linear("accent", t.accent);
  const body = [
    panel(t, W, H),
    text("06  ·  WHERE IT RUNS", { x: 64, y: 64, size: 15, weight: 700, tracking: 2.5, fill: "url(#accent)" }),
    text("Built for the floor, not the demo.", { x: 64, y: 116, size: 44, family: "grotesk", weight: 700, tracking: -1.2, fill: t.text }),
    flagship(t, 190),
    rect({ x: 64, y: 384, width: W - 128, height: 1, fill: t.hairline }),
    rect({ x: 600, y: 414, width: 1, height: 400, fill: t.hairline }),
    rect({ x: 64, y: 622, width: W - 128, height: 1, fill: t.hairline }),
    grid,
  ].join("");
  const names = ["SIG Solutions", ...BUSINESSES.map((b) => b.name)].join(", ");
  return svg({ width: W, height: H, title: `Where it runs: ${names}.`, defs, body, style: css() });
}
