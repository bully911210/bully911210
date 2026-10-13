// 02 · On the floor: the same loop as the plant above, played out on a
// floor plan. Rebuilt from v9 for legibility at GitHub's 846px column:
// fewer, bigger desks (3 x 5), every label at 17px or more, and unlit
// desks drawn with enough contrast to read as furniture, not shadow.
// A seeded simulation (sim.mjs, from v9) decides every event; SMIL replays
// it on a 30 s loop. Desks light when a call connects, three form fields
// fill while the agent talks, sales fly to the client apps, the board
// recounts on the "minute", and spend moves toward the creative that sells.
import { svg } from "../../lib/svg.mjs";
import { W } from "./theme.mjs";
import { THEMES as FLOOR, css, glowFilter, bloom } from "./floortheme.mjs";
import { label as rawLabel, text, rect, paragraph, measure } from "./chassis.mjs";
import { simulate, stateAt, steps, ramps, LOOP, TICK, FEEDBACK_LAG } from "./sim.mjs";
import { rng } from "./random9.mjs";

const H = 1160;
const B = { x0: 280, x1: 1136, y0: 252, y1: 712 }; // building walls
const DOOR = { y: 456, h: 76 };
const ADS = { x: 64, w: 178, cy: [338, 456, 574], h: 100 };
const WEBHOOK = { x: 330, y: DOOR.y };
const DIALLER = { x: 420, y: DOOR.y, w: 80 };
const SPINE = 486;
const ROWS = [298, 428, 558];
const DESK = { x0: 520, pitch: 84, n: 5, w: 64, h: 48 };
const CORRIDOR = 934;
const APPS = { x: 954, y: 274, w: 168, h: 196 };
const BOARD = { x: 954, y: 494, w: 168, h: 190 };
const RETURN_Y = 760;
const SPEED = 330;
const STATIC_AT = 22.2;
const KEY_Y = 870;

const STAGES = [
  { tag: "LEAD LANDS", title: "Meta Lead Ads webhook", line: "Every form fill hits a webhook, not an inbox." },
  { tag: "STRAIGHT TO DIAL", title: "Lead to dialler bridge", line: "Straight into ViciDial, no export, no import." },
  { tag: "ON THE CALL", title: "Speech-to-form", line: "The record fills in while the agent talks." },
  { tag: "CLOSED", title: "Client apps on Supabase", line: "Applications, referrals and appointments." },
  { tag: "COUNTED", title: "Reports synced every minute", line: "Read-only web reports for the floor." },
  { tag: "BACK TO THE AD", title: "Live spend picks the creative", line: "The loop closes on money, not clicks." },
];

/** v9's wallboard palette, re-skinned onto v8's panel and text colours, with stronger furniture contrast. */
function palette(t) {
  const dark = t.name === "dark";
  return {
    ...FLOOR[t.name],
    name: t.name,
    panel: t.panel, border: t.border, hairline: t.hairline, text: t.text, muted: t.muted, faint: t.muted,
    floor: dark ? "#121110" : "#f7f4ee",
    desk: dark ? "#24211c" : "#ebe5d9",
    deskEdge: dark ? "#6b6355" : "#9c9384",
    wall: dark ? "#5a5347" : "#a69d8d",
    raised: dark ? "#181613" : "#faf8f4",
  };
}

const LABEL = 17;
const label = (t, str, o = {}) => rawLabel(t, str, { size: LABEL, tracking: 1.4, fill: t.muted, ...o });

const f = (n) => +n.toFixed(1);
const deskAt = (id) => {
  const row = Math.floor(id / DESK.n), col = id % DESK.n;
  return { row, col, x: DESK.x0 + col * DESK.pitch, y: ROWS[row] };
};
const aisleY = (row) => ROWS[row] - 20;

function leadRoute(creative, deskId) {
  const d = deskAt(deskId);
  const cy = ADS.cy[creative];
  const cx = d.x + DESK.w / 2;
  return [[ADS.x + ADS.w, cy], [262, cy], [262, DOOR.y], [WEBHOOK.x, DOOR.y], [DIALLER.x, DOOR.y], [SPINE, DOOR.y], [SPINE, aisleY(d.row)], [cx, aisleY(d.row)], [cx, d.y + 6]];
}

function saleRoute(deskId) {
  const d = deskAt(deskId);
  const cx = d.x + DESK.w / 2;
  const y = aisleY(d.row);
  const targetY = Math.min(APPS.y + APPS.h - 36, Math.max(APPS.y + 60, y));
  return [[cx, d.y + 6], [cx, y], [CORRIDOR, y], [CORRIDOR, targetY], [APPS.x + 10, targetY]];
}

const RETURN = [[BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h], [BOARD.x + BOARD.w / 2, RETURN_Y], [ADS.x + ADS.w / 2, RETURN_Y], [ADS.x + ADS.w / 2, ADS.cy[2] + ADS.h / 2 + 10]];

const length = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const d = (pts) => `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}`;
const kt = (s) => Math.min(0.9995, Math.max(0.0005, s / LOOP));

/** A token that travels a route once per loop, hidden outside its window. */
function token(shape, pts, t0, t1, cls = "mv") {
  const a = kt(t0), b = Math.max(a + 0.0005, kt(t1));
  return `<g opacity="0" class="${cls}"><set attributeName="opacity" to="1" begin="0s"/>` +
    `<g opacity="0"><animate attributeName="opacity" calcMode="discrete" dur="${LOOP}s" repeatCount="indefinite" keyTimes="0;${a.toFixed(4)};${b.toFixed(4)}" values="0;1;0"/>${shape}` +
    `<animateMotion dur="${LOOP}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${a.toFixed(4)};${b.toFixed(4)};1" path="${d(pts)}"/></g></g>`;
}

function adsColumn(t, sim, st) {
  const out = [label(t, "ADS", { x: ADS.x, y: 266, fill: t.text }), label(t, "SPEND", { x: ADS.x + ADS.w, y: 266, anchor: "end" })];
  sim.creatives.forEach((key, i) => {
    const y = ADS.cy[i] - ADS.h / 2;
    const track = { x: ADS.x + 16, y: y + ADS.h - 28, w: ADS.w - 32 };
    const widths = sim.shares.map((s) => [s.t, f(track.w * Math.min(1, s.share[i] * 1.8))]);
    const anim = steps(widths.slice(1), widths[0][1]);
    out.push(
      rect({ x: ADS.x, y, width: ADS.w, height: ADS.h, rx: 12, fill: t.raised, stroke: t.deskEdge, "stroke-width": 1.5 }),
      label(t, "CREATIVE", { x: ADS.x + 16, y: y + 34, fill: t.text }),
      text(key, { x: ADS.x + ADS.w - 18, y: y + 38, size: 28, family: "mono", weight: 700, fill: t.led, anchor: "end" }),
      rect({ x: track.x, y: track.y, width: track.w, height: 10, rx: 5, fill: t.ledOff }),
      `<rect x="${track.x}" y="${track.y}" width="${f(track.w * Math.min(1, st.share[i] * 1.8))}" height="10" rx="5" fill="${t.led}"><animate attributeName="width" calcMode="discrete" dur="${LOOP}s" repeatCount="indefinite" keyTimes="${anim.keyTimes}" values="${anim.values}"/></rect>`,
    );
  });
  return out.join("");
}

function building(t) {
  const { x0, x1, y0, y1 } = B;
  const walls = `<path d="M${x0} ${DOOR.y - DOOR.h / 2}V${y0}H${x1}V${y1}H${x0}V${DOOR.y + DOOR.h / 2}" fill="none" stroke="${t.wall}" stroke-width="6"/>`;
  const dash = { stroke: t.deskEdge, "stroke-width": 2, "stroke-dasharray": "2 7", "stroke-opacity": 0.6 };
  const a = (p) => `<path d="${p}" stroke="${dash.stroke}" stroke-width="2" stroke-dasharray="2 7" stroke-opacity="0.6"/>`;
  const aisles = [a(`M${SPINE} ${aisleY(0)}V${aisleY(2)}`), ...ROWS.map((_, r) => a(`M${SPINE} ${aisleY(r)}H${CORRIDOR}`)), a(`M${CORRIDOR} ${aisleY(0)}V${aisleY(2)}`)].join("");
  const guides = ADS.cy.map((cy) => `<path d="${d([[ADS.x + ADS.w, cy], [262, cy], [262, DOOR.y], [SPINE, DOOR.y]])}" fill="none" stroke="${t.led}" stroke-opacity="0.45" stroke-width="2.5"/>`).join("");
  return rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: t.floor }) + aisles + guides + walls;
}

function desks(t, sim, st) {
  const calls = new Map();
  for (const l of sim.leads) calls.set(l.desk, [...(calls.get(l.desk) ?? []), l]);
  const out = [];
  for (let id = 0; id < ROWS.length * DESK.n; id++) {
    const { x, y } = deskAt(id);
    const mine = calls.get(id) ?? [];
    const lit = st.onCall.has(id);
    out.push(
      rect({ x, y, width: DESK.w, height: DESK.h, rx: 6, fill: t.desk, stroke: t.deskEdge, "stroke-width": 1.5 }),
      `<circle cx="${x + DESK.w / 2}" cy="${y + 68}" r="12" fill="${t.desk}" stroke="${t.deskEdge}" stroke-width="2"/>`,
    );
    if (!mine.length) continue;
    const on = steps(mine.flatMap((l) => [[l.t1, 1], [l.callEnd, 0]]), 0);
    out.push(`<g opacity="${lit ? 1 : 0}"><animate attributeName="opacity" calcMode="discrete" dur="${LOOP}s" repeatCount="indefinite" keyTimes="${on.keyTimes}" values="${on.values}"/>` +
      rect({ x, y, width: DESK.w, height: DESK.h, rx: 6, fill: t.led }) +
      `<circle cx="${x + DESK.w / 2}" cy="${y + 68}" r="12" fill="${t.led}"/>` +
      formLines(t, x, y, mine, lit) + "</g>");
  }
  return `<g${bloom(t)}>${out.join("")}</g>`;
}

/** Speech-to-form: three record fields fill in, one after another, during the call. */
function formLines(t, x, y, calls, lit) {
  const full = [46, 34, 40];
  return full.map((w, k) => {
    const pts = calls.flatMap((l) => {
      const q = (l.callEnd - l.t1) / 4;
      return [[l.t1 + k * q, 0], [l.t1 + (k + 1) * q, w], [l.callEnd - 0.01, w], [l.callEnd, 0]];
    });
    const a = ramps(pts, 0);
    return `<rect x="${x + 9}" y="${y + 10 + k * 11}" width="${lit ? w : 0}" height="5" rx="2.5" fill="${t.ink}"><animate attributeName="width" dur="${LOOP}s" repeatCount="indefinite" calcMode="linear" keyTimes="${a.keyTimes}" values="${a.values}"/></rect>`;
  }).join("");
}

function apps(t, sim) {
  const r = rng(4);
  const kinds = ["Applications", "Referrals", "Appointments"];
  const hits = kinds.map(() => []);
  sim.sales.forEach((s) => hits[Math.floor(r() * 3)].push(s.at));
  const rows = kinds.map((k, i) => {
    const y = APPS.y + 84 + i * 38;
    const blink = steps(hits[i].flatMap((at) => [[at, 1], [at + 0.6, 0.3]]), 0.3);
    return `<circle cx="${APPS.x + 20}" cy="${y - 6}" r="6" fill="${t.led}" opacity="0.3"><animate attributeName="opacity" calcMode="discrete" dur="${LOOP}s" repeatCount="indefinite" keyTimes="${blink.keyTimes}" values="${blink.values}"/></circle>` +
      text(k, { x: APPS.x + 36, y, size: 18, fill: t.text });
  }).join("");
  return [
    rect({ x: APPS.x, y: APPS.y, width: APPS.w, height: APPS.h, rx: 12, fill: t.raised, stroke: t.deskEdge, "stroke-width": 1.5 }),
    label(t, "CLIENT APPS", { x: APPS.x + 16, y: APPS.y + 36, fill: t.text }),
    rect({ x: APPS.x + 16, y: APPS.y + 50, width: APPS.w - 32, height: 1.5, fill: t.deskEdge }),
    rows,
  ].join("");
}

function board(t, sim, st) {
  const max = Math.max(1, ...sim.ticks.at(-1).counted);
  const seg = 8, segW = 11, gap = 3;
  const rows = sim.creatives.map((key, i) => {
    const y = BOARD.y + 80 + i * 36;
    const segs = Array.from({ length: seg }, (_, k) => {
      const need = ((k + 1) / seg) * max;
      const pts = sim.ticks.map((tk) => [tk.t, tk.counted[i] >= need - 1e-9 ? 1 : 0.2]);
      const a = steps(pts, 0.2);
      const now = st.counted[i] >= need - 1e-9 ? 1 : 0.2;
      return `<rect x="${f(BOARD.x + 44 + k * (segW + gap))}" y="${y - 16}" width="${segW}" height="20" rx="2" fill="${t.led}" opacity="${now}"><animate attributeName="opacity" calcMode="discrete" dur="${LOOP}s" repeatCount="indefinite" keyTimes="${a.keyTimes}" values="${a.values}"/></rect>`;
    }).join("");
    return text(key, { x: BOARD.x + 18, y, size: 20, family: "mono", weight: 700, fill: t.text }) + segs;
  }).join("");
  return [
    rect({ x: BOARD.x, y: BOARD.y, width: BOARD.w, height: BOARD.h, rx: 12, fill: t.well, stroke: t.deskEdge, "stroke-width": 1.5 }),
    label(t, "REPORTS", { x: BOARD.x + 16, y: BOARD.y + 36, fill: t.text }),
    `<g${bloom(t)}>${rows}</g>`,
  ].join("");
}

function intake(t) {
  return [
    rect({ x: WEBHOOK.x - 17, y: WEBHOOK.y - 17, width: 34, height: 34, rx: 8, fill: t.raised, stroke: t.led, "stroke-width": 2.5 }),
    `<circle cx="${WEBHOOK.x}" cy="${WEBHOOK.y}" r="6" fill="${t.led}"/>`,
    rect({ x: DIALLER.x - DIALLER.w / 2, y: DIALLER.y - 36, width: DIALLER.w, height: 72, rx: 10, fill: t.raised, stroke: t.deskEdge, "stroke-width": 1.5 }),
    ...[0, 1, 2].map((k) => `<circle cx="${DIALLER.x - 18 + k * 18}" cy="${DIALLER.y}" r="5" fill="${t.led}" class="pulse" style="animation-delay:${k * 0.25}s"/>`),
  ].join("");
}

const marker = (t, n, x, y, r = 16) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${t.led}"/>` + text(String(n), { x, y: y + 6, size: 18, family: "mono", weight: 700, fill: t.ink, anchor: "middle" });

/** Stage markers with their short labels, placed where each stage happens. */
function markers(t) {
  const tagged = (n, x, y, word, bg = t.floor) => {
    const w = measure(word, { size: LABEL, family: "mono", weight: 700, tracking: 1.4 });
    return rect({ x: x - 20, y: y - 20, width: w + 58, height: 40, rx: 20, fill: bg }) + marker(t, n, x, y) + label(t, word, { x: x + 26, y: y + 6, fill: t.text });
  };
  return [
    tagged(1, WEBHOOK.x - 6, WEBHOOK.y - 66, "WEBHOOK"),
    tagged(2, DIALLER.x - 18, DIALLER.y + 76, "DIALLER"),
    tagged(3, DESK.x0 + 8, B.y0 - 30, "ON THE CALL", t.panel),
    marker(t, 4, APPS.x + APPS.w - 2, APPS.y + 2),
    marker(t, 5, BOARD.x + BOARD.w - 2, BOARD.y + 2),
  ].join("");
}

function feedback(t, sim) {
  const pulses = sim.ticks.filter((k) => k.t + FEEDBACK_LAG < LOOP).map((k) => token(`<circle r="6" fill="${t.ledHot}"/>`, RETURN, k.t, k.t + FEEDBACK_LAG)).join("");
  const lbl = "LIVE SPEND PICKS THE CREATIVE";
  const lw = measure(lbl, { size: LABEL, family: "mono", weight: 700, tracking: 1.4 });
  const lx = 600;
  const end = RETURN.at(-1);
  return [
    `<path d="${d(RETURN)}" fill="none" stroke="${t.led}" stroke-width="2.5" stroke-dasharray="4 8" stroke-linecap="round"/>`,
    `<path d="M${end[0] - 8} ${end[1] + 10}L${end[0]} ${end[1]}L${end[0] + 8} ${end[1] + 10}" fill="none" stroke="${t.led}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    rect({ x: lx - 46, y: RETURN_Y - 18, width: lw + 64, height: 36, fill: t.panel }),
    marker(t, 6, lx - 24, RETURN_Y),
    label(t, lbl, { x: lx, y: RETURN_Y + 6, fill: t.led }),
    `<g${bloom(t)}>${pulses}</g>`,
    `<path d="M${BOARD.x + BOARD.w / 2} ${APPS.y + APPS.h}V${BOARD.y}" stroke="${t.led}" stroke-width="2.5" stroke-dasharray="4 6"/>`,
    ...sim.ticks.filter((k) => k.t - 0.5 > 0).map((k) => token(`<circle r="5" fill="${t.led}"/>`, [[BOARD.x + BOARD.w / 2, APPS.y + APPS.h], [BOARD.x + BOARD.w / 2, BOARD.y]], k.t - 0.5, k.t)),
  ].join("");
}

function traffic(t, sim) {
  const leads = sim.leads.map((l) => token(`<circle r="6" fill="${t.ledHot}" stroke="${t.panel}" stroke-width="1.5"/>`, leadRoute(l.creative, l.desk), l.t0, l.t1)).join("");
  const sales = sim.sales.map((s) => token(`<path d="M0 -9L9 0L0 9L-9 0Z" fill="${t.ledHot}" stroke="${t.panel}" stroke-width="2"/>`, saleRoute(s.desk), s.t0, s.at)).join("");
  return `<g${bloom(t)}>${leads}${sales}</g>`;
}

function key(t) {
  const colW = (W - 128 - 64) / 3;
  return STAGES.map((s, i) => {
    const x = 64 + (i % 3) * (colW + 32);
    const y = KEY_Y + Math.floor(i / 3) * 156;
    return [
      marker(t, i + 1, x + 16, y - 6),
      label(t, s.tag, { x: x + 42, y, fill: t.led }),
      text(s.title, { x, y: y + 40, size: 22, weight: 650, tracking: -0.2, fill: t.text }),
      paragraph(s.line, { x, y: y + 70, size: 18, maxWidth: colW, lineHeight: 26, fill: t.muted }).svg,
    ].join("");
  }).join("");
}

function legend(t) {
  const x = W - 64, y = 130;
  const a = "SALE", b = "CALL CONNECTED";
  const wa = measure(a, { size: LABEL, family: "mono", weight: 700, tracking: 1.4 });
  const wb = measure(b, { size: LABEL, family: "mono", weight: 700, tracking: 1.4 });
  const xa = x - wa, xb = xa - 52 - wb;
  return [
    `<path d="M${xa - 20} ${y - 15}L${xa - 11} ${y - 6}L${xa - 20} ${y + 3}L${xa - 29} ${y - 6}Z" fill="${t.ledHot}"/>`,
    label(t, a, { x: xa, y, fill: t.text }),
    rect({ x: xb - 34, y: y - 16, width: 24, height: 18, rx: 3, fill: t.led }),
    label(t, b, { x: xb, y, fill: t.text }),
  ].join("");
}

export function floorPlan(theme) {
  const t = palette(theme);
  const travel = (lead, desk) => length(leadRoute(lead.creative, desk)) / SPEED;
  const saleTravel = (desk) => length(saleRoute(desk)) / (SPEED * 0.9);
  const sim = simulate({ desks: Array.from({ length: ROWS.length * DESK.n }, (_, i) => i), travel, saleTravel });
  const st = stateAt(sim, STATIC_AT);
  const body = [
    rect({ x: 0.5, y: 0.5, width: W - 1, height: H - 1, rx: 24, fill: t.panel, stroke: t.border }),
    `<circle cx="69" cy="67" r="5" fill="${t.led}"/>`,
    text("02  ·  ON THE FLOOR", { x: 84, y: 72, size: 15, weight: 700, tracking: 2.5, fill: t.led }),
    text("The same loop, on the floor.", { x: 62, y: 130, size: 46, family: "grotesk", weight: 700, tracking: -1.3, fill: t.text }),
    text("Each lead goes to the next free desk. An illustration, not live data.", { x: 64, y: 172, size: 20, fill: t.muted }),
    legend(t),
    building(t),
    adsColumn(t, sim, st),
    intake(t),
    desks(t, sim, st),
    apps(t, sim),
    board(t, sim, st),
    feedback(t, sim),
    traffic(t, sim),
    markers(t),
    rect({ x: 64, y: 818, width: W - 128, height: 1, fill: t.hairline }),
    key(t),
  ].join("");
  const title = "The same loop, on the floor. An illustration, not live data: 1 a lead lands on a Meta Lead Ads webhook, 2 the dialler bridge puts it straight into ViciDial to the next free desk, 3 speech-to-form fills the record while the agent talks, 4 sales land in client apps on Supabase, 5 reports synced every minute recount them, 6 live spend picks the creative.";
  const extra = "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}.pulse{animation:pulse 1.2s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.mv{display:none}}";
  return svg({ width: W, height: H, title, defs: glowFilter(t), body, style: css(extra) });
}
