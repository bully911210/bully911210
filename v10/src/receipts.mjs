// "Count the stock": twelve months of contributions as stock on pallets.
// One pallet per week, set corner to corner so the row reads left to right;
// on each pallet, one crate per day, its height the day's contributions.
// You can count the crates: the drawing is the ledger.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, panel, linear, fmt, measure } from "../../v5/src/ui.mjs";
import { Scene, projector, box, C } from "./iso.mjs";

const H = 640;
const CELL = 11.6; // pallet footprint, world units
const BASE_Y = 548; // screen y of the pallet row
const MAX_H = 206; // height of the busiest week
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function weeks(calendar) {
  const out = [];
  calendar.forEach((d, i) => {
    const w = Math.floor(i / 7);
    (out[w] ??= { days: [], total: 0, start: d.date }).days.push(d);
    out[w].total += d.count;
  });
  return out;
}

function stats(t, data) {
  const tot = data.totals;
  const share = Math.round((100 * tot.privateContributionsLastYear) / tot.contributionsLastYear);
  const items = [
    [fmt(tot.contributionsLastYear), "contributions, 12 months"],
    [`${share}%`, "of them in private repos"],
    [fmt(tot.commitsOnDefaultBranches), "commits on default branches"],
    [fmt(tot.prsLastYear), "pull requests"],
    [fmt(tot.reposCreatedLastYear), "new repositories"],
  ];
  const widths = items.map(([v, l]) => Math.max(measure(v, { size: 38, family: "grotesk", weight: 700, tracking: -1 }), measure(l, { size: 15 })));
  const gap = (W - 128 - widths.reduce((a, b) => a + b, 0)) / (items.length - 1);
  let x = 64;
  return items.map(([v, l], i) => {
    const x0 = x;
    x += widths[i] + gap;
    return [x0, v, l, i];
  }).map(([x, v, l, i]) => {
    return text(v, { x, y: 236, size: 38, family: "grotesk", weight: 700, tracking: -1, fill: i === 0 ? "url(#accent)" : t.text }) +
      text(l, { x, y: 264, size: 15, fill: t.muted });
  }).join("");
}

export function receipts(t, data) {
  const ws = weeks(data.calendar);
  const peak = ws.reduce((b, w, i) => (w.total > ws[b].total ? i : b), 0);
  const scale = MAX_H / ws[peak].total;
  const step = 2 * CELL * C; // screen distance between pallets
  const x0 = (W - step * ws.length) / 2 + CELL * C;
  const P = projector(x0, BASE_Y);
  const sc = new Scene(t, P, "rc");
  const tops = [];
  ws.forEach((w, i) => {
    const X = i * CELL, Y = -i * CELL;
    box(sc, { x: X, y: Y, z: -5, w: CELL, d: CELL, h: 5, mat: t.iso.plinth, stroke: t.iso.edge, lw: 0.6 });
    let z = 0;
    const hot = i === peak;
    w.days.forEach((d) => {
      if (!d.count) return;
      const h = d.count * scale;
      box(sc, { x: X + 0.8, y: Y + 0.8, z, w: CELL - 1.6, d: CELL - 1.6, h, mat: hot ? t.iso.amber : t.iso.steel, stroke: t.iso.edge, lw: 0.6 });
      z += h;
    });
    tops.push(P.p(X + CELL, Y, z));
  });
  const scene = sc.render();

  // a scanner light walks the row, week by week, like a stock count
  const DUR = 10;
  const scan = tops.map(([x, y], i) => {
    const b = ((i / tops.length) * DUR - DUR).toFixed(2);
    return `<circle cx="${(x - CELL * C).toFixed(1)}" cy="${(y - CELL * 0.5).toFixed(1)}" r="2.6" fill="${t.iso.lamp}" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.02;0.12;1" dur="${DUR}s" begin="${b}s" repeatCount="indefinite"/></circle>`;
  }).join("");

  // month ticks under the first pallet of each month
  let lastMonth = -1;
  const axis = ws.map((w, i) => {
    const m = Number(w.start.slice(5, 7)) - 1;
    if (m === lastMonth) return "";
    lastMonth = m;
    if (i === 0) return "";
    const [x] = P.p(i * CELL, -i * CELL + CELL, -5);
    return `<path d="M${x.toFixed(1)} ${BASE_Y + 22}v8" stroke="${t.faint}" stroke-width="1"/>` + text(MONTHS[m], { x: x + 5, y: BASE_Y + 44, size: 15, fill: t.faint });
  }).join("");

  const [px, py] = tops[peak];
  const label = `Busiest week: ${fmt(ws[peak].total)} contributions`;
  const lw = measure(label, { size: 16, weight: 600 });
  const lx = Math.min(px - CELL * C, W - 64 - lw / 2);
  const callout = `<path d="M${(px - CELL * C).toFixed(1)} ${(py - 8).toFixed(1)}V${(py - 38).toFixed(1)}" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
    text(label, { x: lx, y: py - 46, size: 16, weight: 600, fill: t.text, anchor: "middle" });

  const defs = [linear("accent", t.accent), scene.defs].join("");
  const body = [
    panel(t, W, H),
    text("05  ·  COUNT THE STOCK", { x: 64, y: 72, size: 15, weight: 700, tracking: 2.5, fill: "url(#accent)" }),
    text("If it isn't documented, it didn't happen.", { x: 64, y: 124, size: 44, family: "grotesk", weight: 700, tracking: -1.2, fill: t.text }),
    text("Twelve months of contributions as stock: a pallet per week, a crate per day.", { x: 64, y: 162, size: 18, fill: t.muted }),
    stats(t, data),
    scene.body,
    scan,
    callout,
    axis,
  ].join("");
  const title = `Count the stock: ${data.totals.contributionsLastYear} contributions in the last 12 months, drawn as one pallet per week and one crate per day. ${label}.`;
  return svg({ width: W, height: H, title, defs, body, style: css() });
}
