// The revenue plant: the six-stage chain drawn as one isometric machine.
// Leads enter at the ad (06), drop into the intake hopper (01) and run
// through a pipe into the dialler bridge (02), the call (03), the closing
// apps (04) and the reporting unit (05). A return pipe carries the spend
// signal back to the ad, which is what closes the loop.
//
// Every solid goes through the depth-sorted Scene. Leads are drawn as one
// particle layer clipped by a mask that the same Scene renders: white only
// where a pipe's sight slot is visible. So a lead is seen exactly where the
// pipe it travels in is seen, and vanishes behind any machine in front.
import { Scene, projector, box, cylinder, hopper, pipe, pointAt, screenLength, faceMatrix, shade } from "./iso.mjs";
import { text, measure, rect } from "../../v5/src/ui.mjs";

export const SPACING = 100; // world units between neighbouring machines
const HW = 34; // half the footprint of a machine
const PZ = 24; // pipe centre height
const R = 8; // pipe radius
const AD = [-SPACING, SPACING]; // the ad, in line before the intake
const RETURN_X = SPACING * 4 + HW + 30;

const U = (i) => [i * SPACING, -i * SPACING];

export const STAGES = [
  { n: "01", tag: "LEAD LANDS", title: "Meta Lead Ads webhook", line: "Every form fill hits a webhook, not an inbox." },
  { n: "02", tag: "STRAIGHT TO DIAL", title: "Lead to dialler bridge", line: "Straight into ViciDial." },
  { n: "03", tag: "ON THE CALL", title: "Speech-to-form", line: "Fills the record while the agent talks." },
  { n: "04", tag: "CLOSED", title: "Client apps on Supabase", line: "Applications, referrals, appointments." },
  { n: "05", tag: "COUNTED", title: "Read-only web reports", line: "Synced every minute." },
  { n: "06", tag: "BACK TO THE AD", title: "Live spend picks the creative", line: "The loop closes on spend." },
];

/* ---------- machines ---------- */

function pad(sc, [cx, cy], hw = HW + 8) {
  box(sc, { x: cx - hw, y: cy - hw, z: -6, w: hw * 2, d: hw * 2, h: 6, mat: sc.t.iso.plinth, stroke: sc.t.iso.edge });
}

/** A row of small status lamps on a face, one lit, cycling. */
function lamps(t, x, y, n, dur, gap = 11) {
  return Array.from({ length: n }, (_, i) => {
    const begin = (-(dur * (n - i)) / n).toFixed(2);
    return `<rect x="${x + i * gap}" y="${y}" width="6" height="6" rx="1.5" fill="${t.iso.lamp}" opacity="0.18"><animate attributeName="opacity" values="1;0.18;0.18" keyTimes="0;0.25;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></rect>`;
  }).join("");
}

function intake(sc) {
  const { t } = sc;
  const [cx, cy] = U(0);
  pad(sc, U(0));
  box(sc, {
    x: cx - HW, y: cy - HW, w: HW * 2, d: HW * 2, h: 56, mat: t.iso.steel,
    deco: { y: lamps(t, 10, 12, 4, 1.6) + `<rect x="10" y="30" width="48" height="3" rx="1.5" fill="${t.iso.edge}"/>` },
  });
  hopper(sc, { cx, cy, z0: 56, z1: 96, a: HW, b: 18, mat: t.iso.steel, inner: t.iso.plinth });
}

function dialler(sc) {
  const { t } = sc;
  const [cx, cy] = U(1);
  pad(sc, U(1));
  box(sc, { x: cx - HW, y: cy - HW, w: HW * 2, d: HW * 2, h: 50, mat: t.iso.steel, deco: { y: lamps(t, 10, 12, 5, 1.1), x: lamps(t, 10, 12, 5, 1.1) } });
  cylinder(sc, {
    cx, cy, z: 50, r: 25, h: 12, mat: t.iso.steel, matKey: "steel",
    top: (e) => {
      // twelve line ports around the dial; the lit one walks the ring
      return Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = e.sx + Math.cos(a) * e.rx * 0.68, y = e.sy + Math.sin(a) * e.ry * 0.68;
        const begin = (-(2.4 * (12 - i)) / 12).toFixed(2);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="${t.iso.lamp}" opacity="0.25"><animate attributeName="opacity" values="1;0.25;0.25" keyTimes="0;0.3;1" dur="2.4s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
      }).join("") + `<circle cx="${e.sx.toFixed(1)}" cy="${e.sy.toFixed(1)}" r="4" fill="${t.iso.amber[1]}"/>`;
    },
  });
}

/** The record filling in: five form rows whose values grow in turn. */
function formFace(t, w, h) {
  const rows = 5, top = 12, gap = (h - 22) / rows;
  return Array.from({ length: rows }, (_, i) => {
    const y = top + i * gap;
    const full = (w - 34) * [0.8, 0.55, 0.7, 0.45, 0.62][i];
    const k0 = (i / rows).toFixed(2), k1 = ((i + 1) / rows).toFixed(2);
    return `<rect x="8" y="${y.toFixed(1)}" width="10" height="5" rx="1" fill="${t.iso.edge}"/>` +
      `<rect x="22" y="${y.toFixed(1)}" width="${full.toFixed(1)}" height="5" rx="1" fill="${t.iso.lead}"><animate attributeName="width" values="0;0;${full.toFixed(1)};${full.toFixed(1)};0" keyTimes="0;${k0};${k1};0.94;1" dur="6s" repeatCount="indefinite"/></rect>`;
  }).join("");
}

/** A speech waveform: bars breathing at seeded rates. */
function waveFace(t, w, h) {
  const n = 9;
  return Array.from({ length: n }, (_, i) => {
    const x = 9 + i * ((w - 18) / n);
    const hi = 6 + ((i * 7) % 5) * 3;
    const cy = h / 2;
    return `<rect x="${x.toFixed(1)}" y="${(cy - hi / 2).toFixed(1)}" width="3.5" height="${hi}" rx="1.5" fill="${t.iso.lead}" opacity="0.85"><animate attributeName="height" values="${hi};${(hi * 0.35).toFixed(1)};${hi}" dur="${(0.7 + (i % 4) * 0.17).toFixed(2)}s" repeatCount="indefinite"/><animate attributeName="y" values="${(cy - hi / 2).toFixed(1)};${(cy - hi * 0.175).toFixed(1)};${(cy - hi / 2).toFixed(1)}" dur="${(0.7 + (i % 4) * 0.17).toFixed(2)}s" repeatCount="indefinite"/></rect>`;
  }).join("");
}

function screenFace(t, w, h, inner) {
  return `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="3" fill="${t.iso.screen}"/>` + inner;
}

function call(sc) {
  const { t } = sc;
  const [cx, cy] = U(2);
  pad(sc, U(2));
  box(sc, { x: cx - HW, y: cy - HW, w: HW * 2, d: HW * 2, h: 40, mat: t.iso.steel, deco: { x: screenFace(t, HW * 2, 40, waveFace(t, HW * 2, 40)) } });
  box(sc, { x: cx - 30, y: cy - 3, z: 40, w: 60, d: 7, h: 70, mat: t.iso.steel, deco: { y: screenFace(t, 60, 70, formFace(t, 60, 70)) } });
}

function closing(sc) {
  const { t } = sc;
  const [cx, cy] = U(3);
  pad(sc, U(3));
  box(sc, { x: cx - HW, y: cy - HW, w: HW * 2, d: HW * 2, h: 12, mat: t.iso.steel });
  [12, 36, 60].forEach((z, i) =>
    cylinder(sc, {
      cx, cy, z: z + 2, r: 27, h: 20, mat: i === 2 ? t.iso.amber : t.iso.steel, matKey: i === 2 ? "amber" : "steel",
    }));
}

/** Bars of a report, plus the minute: a hand that turns once every 60 s. */
function reportFace(t, w, h) {
  const vals = [0.35, 0.55, 0.42, 0.7, 0.62, 0.88];
  const bw = (w - 22) / vals.length;
  const bars = vals.map((v, i) => {
    const bh = v * (h - 26);
    return `<rect x="${(11 + i * bw).toFixed(1)}" y="${(h - 9 - bh).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${i === vals.length - 1 ? t.iso.lead : t.iso.edge}"/>`;
  }).join("");
  return screenFace(t, w, h, bars);
}

function clockFace(t, cx, cy, r) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<path d="M${(cx + Math.cos(a) * r * 0.78).toFixed(1)} ${(cy + Math.sin(a) * r * 0.78).toFixed(1)}L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}" stroke="${t.iso.edge}" stroke-width="1.4"/>`;
  }).join("");
  return `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="${t.iso.screen}"/>` + ticks +
    `<path d="M${cx} ${cy}V${(cy - r * 0.8).toFixed(1)}" stroke="${t.iso.lead}" stroke-width="2.4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="60s" repeatCount="indefinite"/></path>` +
    `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${t.iso.lead}"/>`;
}

function reports(sc) {
  const { t } = sc;
  const [cx, cy] = U(4);
  pad(sc, U(4));
  box(sc, { x: cx - HW, y: cy - HW, w: HW * 2, d: HW * 2, h: 58, mat: t.iso.steel, deco: { x: clockFace(t, 17, 17, 10) } });
  box(sc, { x: cx - 32, y: cy - 4, z: 58, w: 64, d: 8, h: 58, mat: t.iso.steel, deco: { y: reportFace(t, 64, 58) } });
}

/** The ad: three creatives in a rack; the one live spend picked stands proud. */
function adRack(sc) {
  const { t } = sc;
  const [cx, cy] = AD;
  pad(sc, AD, 38);
  box(sc, { x: cx - 30, y: cy - 30, w: 60, d: 60, h: 26, mat: t.iso.steel, deco: { y: lamps(t, 9, 9, 3, 2.2, 14) } });
  [-18, 0, 18].forEach((dy, i) => {
    const live = i === 1;
    const art = live
      ? `<rect x="5" y="5" width="34" height="14" rx="2" fill="${t.iso.screen}"/><rect x="5" y="23" width="26" height="4" rx="1" fill="${t.iso.screen}" opacity="0.7"/><rect x="5" y="31" width="18" height="4" rx="1" fill="${t.iso.screen}" opacity="0.7"/>`
      : `<rect x="5" y="5" width="34" height="14" rx="2" fill="${t.iso.edge}"/><rect x="5" y="23" width="24" height="4" rx="1" fill="${t.iso.edge}"/>`;
    box(sc, { x: cx - 22, y: cy + dy - 2, z: live ? 40 : 26, w: 44, d: 4, h: 46, mat: live ? t.iso.amber : t.iso.steel, deco: { y: art } });
  });
}

/* ---------- pipes and flow ---------- */

function routes() {
  const [ax, ay] = AD;
  const feed = [[ax, ay - 30, PZ], [ax, ay - 50, PZ], [ax, ay - 50, 116], [ax, 0, 116], [0, 0, 116], [0, 0, 104]];
  const links = [0, 1, 2, 3].map((i) => {
    const [x, y] = U(i);
    return [[x + HW, y, PZ], [x + SPACING, y, PZ], [x + SPACING, y - SPACING + HW, PZ]];
  });
  const [x5, y5] = U(4);
  const back = [[x5 + HW, y5, PZ], [RETURN_X, y5, PZ], [RETURN_X, ay, PZ], [ax + 30, ay, PZ]];
  // the routes leads and signal actually travel: through each machine's core
  const leadRoute = [[ax, ay, PZ], ...feed, [0, 0, PZ]];
  for (let i = 0; i < 4; i++) {
    const [x, y] = U(i);
    leadRoute.push([x + SPACING, y, PZ], [...U(i + 1), PZ]);
  }
  const signalRoute = [[x5, y5, PZ], ...back, [ax, ay, PZ]];
  return { feed, links, back, leadRoute, signalRoute };
}

/** Leads: discrete particles spaced evenly along the route, each phase-shifted. */
function leads(sc, route, { speed = 46, spacing = 30 }) {
  const { P, t } = sc;
  const L = screenLength(P, route);
  const dur = L / speed;
  const n = Math.floor(L / spacing);
  const pts = route.map((q) => P.pt(q));
  return Array.from({ length: n }, (_, i) => {
    const f = i / n;
    const [x, y] = pointAt(P, route, f);
    const rel = pts.map(([px, py], k) => `${k ? "L" : "M"}${(px - x).toFixed(1)} ${(py - y).toFixed(1)}`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.1" fill="${t.iso.lead}"><animateMotion path="${rel}" dur="${dur.toFixed(2)}s" begin="${(-f * dur).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
  }).join("");
}

/* ---------- labels ---------- */

const TAG = { size: 15, family: "mono", weight: 700, tracking: 1.2 };
const TITLE = { size: 18, weight: 650, tracking: -0.2 };
const LINE = { size: 15 };

/**
 * A stage label centred over its leader, clamped inside the card. Tiers
 * alternate, so a leader from the upper tier always passes between two
 * lower-tier labels: label half-width stays under the machine spacing.
 */
function label(t, s, { y, ax, ay, minX = 64, maxX = 1136 }) {
  const w = Math.max(measure(`${s.n}  ${s.tag}`, TAG), measure(s.title, TITLE), measure(s.line, LINE));
  const x0 = Math.min(Math.max(ax - w / 2, minX), maxX - w);
  const cx = x0 + w / 2;
  const leader = `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}V${(y + 60).toFixed(1)}" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>`;
  return leader +
    text(`${s.n}  ${s.tag}`, { x: cx, y, fill: t.accent[1], anchor: "middle", ...TAG }) +
    text(s.title, { x: cx, y: y + 25, fill: t.text, anchor: "middle", ...TITLE }) +
    text(s.line, { x: cx, y: y + 47, fill: t.muted, anchor: "middle", ...LINE });
}

/* ---------- assembly ---------- */

/**
 * Draws the plant with its origin at screen (ox, oy). Returns {defs, body}
 * plus the screen anchor of each machine for labelling.
 */
export function plant(t, { ox, oy, labelTop }) {
  const P = projector(ox, oy);
  const sc = new Scene(t, P, "pl");
  intake(sc);
  dialler(sc);
  call(sc);
  closing(sc);
  reports(sc);
  adRack(sc);
  const r = routes();
  pipe(sc, r.feed, { r: R, mat: t.iso.pipe, flanges: [false, true] });
  r.links.forEach((l) => pipe(sc, l, { r: R, mat: t.iso.pipe }));
  pipe(sc, r.back, { r: R, mat: t.iso.pipe });
  const scene = sc.render();

  const maskId = "plFlow";
  const maskDef = `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1400"><rect x="0" y="0" width="1200" height="1400" fill="#000"/>${scene.mask}</mask>`;
  const signal = `<path class="sig" d="${P.poly(r.signalRoute)}" fill="none" stroke="${t.iso.signal}" stroke-width="3" stroke-dasharray="7 9" stroke-linecap="round"/>`;
  const flow = `<g mask="url(#${maskId})">${signal}${leads(sc, r.leadRoute, {})}</g>`;

  // labels: from each machine's highest point to one of two tiers
  const anchors = [
    [STAGES[5], P.p(...AD, 96)],
    [STAGES[0], P.p(...U(0), 130)],
    [STAGES[1], P.p(...U(1), 68)],
    [STAGES[2], P.p(...U(2), 116)],
    [STAGES[3], P.p(...U(3), 86)],
    [STAGES[4], P.p(...U(4), 124)],
  ];
  const labels = anchors.map(([s, [ax, ay]], i) => label(t, s, { y: labelTop + (i % 2 ? 80 : 0), ax, ay }));

  // the floor: a faint isometric grid under the machines
  const grid = [];
  for (let k = -3; k <= 6; k++) {
    const v = k * SPACING;
    grid.push(P.poly([[v, -520, -6], [v, 260, -6]]), P.poly([[-160, -v + SPACING, -6], [RETURN_X + 40, -v + SPACING, -6]]));
  }
  const floor = `<path d="${grid.join("")}" stroke="${t.grid}" stroke-width="1" fill="none"/>`;
  return {
    defs: scene.defs + maskDef,
    body: floor + scene.body + flow + labels.join(""),
    css: "@keyframes sig{to{stroke-dashoffset:-32}}.sig{animation:sig 1.4s linear infinite}",
    P,
    returnX: RETURN_X,
    back: AD[1],
  };
}
