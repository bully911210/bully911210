// HomeCast as an isometric product drawing: a PC and a TV inside a house
// drawn in wireframe. Media travels from one to the other in an arc and never
// crosses the outline of the house: no cloud, no accounts.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, paragraph, pill, panel, linear, measure } from "../../v5/src/ui.mjs";
import { Scene, projector, box, faceMatrix } from "./iso.mjs";

const H = 540;
const repoOf = (data, name) => data.publicRepos.find((r) => r.name === name) ?? {};

/** The TV's screen: a small media library in the browser, one tile playing. */
function tvScreen(t, w, h) {
  const tiles = [];
  const tw = (w - 34) / 3, th = (h - 44) / 2;
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const on = r === 0 && c === 1;
      tiles.push(`<rect x="${(10 + c * (tw + 7)).toFixed(1)}" y="${(20 + r * (th + 6)).toFixed(1)}" width="${tw.toFixed(1)}" height="${th.toFixed(1)}" rx="2" fill="${on ? t.iso.lead : "#2c2822"}"/>`);
    }
  return `<rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="2" fill="${t.iso.screen}"/>` +
    `<rect x="10" y="9" width="30" height="4" rx="2" fill="#4a443b"/>` + tiles.join("") +
    `<rect x="10" y="${h - 12}" width="${w - 20}" height="3" rx="1.5" fill="#2c2822"/>` +
    `<rect x="10" y="${h - 12}" width="${((w - 20) * 0.38).toFixed(1)}" height="3" rx="1.5" fill="${t.iso.lead}"><animate attributeName="width" values="0;${(w - 20).toFixed(1)}" dur="12s" repeatCount="indefinite"/></rect>`;
}

function pcFront(t, w, h) {
  return `<rect x="8" y="10" width="${w - 16}" height="5" rx="1" fill="${t.iso.edge}"/><rect x="8" y="20" width="${w - 16}" height="5" rx="1" fill="${t.iso.edge}"/>` +
    `<circle cx="${w / 2}" cy="${h - 16}" r="4" fill="${t.iso.lamp}"><animate attributeName="opacity" values="1;0.35;1" dur="2.6s" repeatCount="indefinite"/></circle>`;
}

function vents(t, w, h) {
  return Array.from({ length: 7 }, (_, i) => `<rect x="${14 + i * ((w - 28) / 7)}" y="16" width="3" height="${h - 50}" rx="1.5" fill="${t.iso.edge}"/>`).join("");
}

function scene(t, ox, oy) {
  const P = projector(ox, oy);
  const sc = new Scene(t, P, "hc");
  // floor of the room
  box(sc, { x: -20, y: -120, z: -6, w: 270, d: 240, h: 6, mat: t.iso.plinth, stroke: t.iso.edge });
  // the PC
  box(sc, { x: 6, y: 8, w: 46, d: 100, h: 112, mat: t.iso.steel, deco: { x: pcFront(t, 100, 112), y: vents(t, 46 + 60, 112) } });
  // the TV on its stand
  box(sc, { x: 160, y: -92, w: 40, d: 24, h: 6, mat: t.iso.steel });
  box(sc, { x: 176, y: -84, w: 8, d: 8, h: 30, z: 6, mat: t.iso.steel });
  box(sc, { x: 104, y: -84, z: 36, w: 140, d: 8, h: 86, mat: t.iso.steel, deco: { y: tvScreen(t, 140, 86) } });
  const s = sc.render();

  // the arc the media takes, through the room's air
  const a = [29, 58, 114], b = [170, -78, 124];
  const pts = Array.from({ length: 25 }, (_, i) => {
    const f = i / 24;
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f + Math.sin(Math.PI * f) * 52];
  });
  const sp = pts.map((q) => P.pt(q));
  const d = sp.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const N = 7, DUR = 4.2;
  const frames = Array.from({ length: N }, (_, i) => {
    const f = i / N;
    const [x, y] = sp[Math.round(f * 24)];
    const rel = sp.map(([px, py], k) => `${k ? "L" : "M"}${(px - x).toFixed(1)} ${(py - y).toFixed(1)}`).join("");
    return `<rect x="${(x - 5).toFixed(1)}" y="${(y - 3.5).toFixed(1)}" width="10" height="7" rx="1.5" fill="${t.iso.lead}"><animateMotion path="${rel}" dur="${DUR}s" begin="${(-f * DUR).toFixed(2)}s" repeatCount="indefinite"/></rect>`;
  }).join("");
  const arc = `<path d="${d}" fill="none" stroke="${t.accent[1]}" stroke-width="1.5" stroke-dasharray="3 5" opacity="0.7"/>`;

  // the house, as a wireframe: walls and a pitched roof
  const [x0, x1, y0, y1, zt, zr] = [-20, 250, -120, 120, 168, 222];
  const ridge = (y0 + y1) / 2;
  const edges = [
    [[x0, y1, 0], [x1, y1, 0]], [[x1, y1, 0], [x1, y0, 0]],
    [[x0, y1, 0], [x0, y1, zt]], [[x1, y1, 0], [x1, y1, zt]], [[x1, y0, 0], [x1, y0, zt]],
    [[x0, y1, zt], [x1, y1, zt]], [[x1, y1, zt], [x1, y0, zt]], [[x0, y0, zt], [x1, y0, zt]], [[x0, y0, zt], [x0, y1, zt]],
    [[x0, y1, zt], [x0, ridge, zr]], [[x0, y0, zt], [x0, ridge, zr]], [[x1, y1, zt], [x1, ridge, zr]], [[x1, y0, zt], [x1, ridge, zr]],
    [[x0, ridge, zr], [x1, ridge, zr]],
  ];
  const house = `<path d="${edges.map((e) => P.poly(e)).join("")}" fill="none" stroke="${t.faint}" stroke-width="1.2" stroke-dasharray="5 5" stroke-linejoin="round"/>`;
  return { defs: s.defs, body: house + s.body + arc + frames, P };
}

function callout(t, [ax, ay], [lx, ly], title, line, anchor = "start") {
  return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${lx.toFixed(1)} ${ay.toFixed(1)}" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>` +
    text(title, { x: lx, y: ly, size: 17, weight: 650, fill: t.text, anchor }) +
    text(line, { x: lx, y: ly + 22, size: 15, fill: t.muted, anchor });
}

/** Leader that runs vertically from the anchor, then out to a right-aligned note. */
function corner(t, [ax, ay], [lx, ly], title, line) {
  const above = ly < ay;
  const ty = above ? ly : ly;
  const lineY = above ? ly + 34 : ly - 26;
  return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}V${lineY}H${lx}" fill="none" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>` +
    text(title, { x: lx, y: ty, size: 17, weight: 650, fill: t.text, anchor: "end" }) +
    text(line, { x: lx, y: ty + 22, size: 15, fill: t.muted, anchor: "end" });
}

export function homecastIso(t, data) {
  const repo = repoOf(data, "homecast");
  const s = scene(t, 712, 300);
  const { P } = s;
  const intro = paragraph("Your PC's films, music and photos on any TV in the house.", { x: 64, y: 226, size: 24, weight: 600, maxWidth: 440, lineHeight: 33, fill: t.text, tracking: -0.3 });
  const detail = paragraph("Open the TV's browser, pick something, press play. It all stays on your home Wi-Fi.", { x: 64, y: 226 + intro.height + 8, size: 18, maxWidth: 420, lineHeight: 28, fill: t.muted });
  const pc = P.p(6, 70, 66);
  const tv = P.p(244, -80, 60);
  const roof = P.p(250, 0, 222);
  const notes = [
    callout(t, pc, [64, 460], "One exe", "GPU encoding: NVENC, QSV and AMF.", "start"),
    corner(t, tv, [1136, 490], "9.3 KB TV client", "The whole client, in the TV's browser."),
    corner(t, roof, [1136, 76], "No cloud, no accounts", "Nothing leaves the house."),
  ];
  // the PC callout runs left along its own height, then drops to the copy
  notes[0] = `<path d="M${pc[0].toFixed(1)} ${pc[1].toFixed(1)}H${(pc[0] - 70).toFixed(1)}V${434}H64" fill="none" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
    `<circle cx="${pc[0].toFixed(1)}" cy="${pc[1].toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>` +
    text("One exe", { x: 64, y: 462, size: 17, weight: 650, fill: t.text }) +
    text("GPU encoding: NVENC, QSV and AMF.", { x: 64, y: 484, size: 15, fill: t.muted });
  const badge = ["Open source", repo.language ?? "TypeScript", repo.release?.tagName].filter(Boolean).join(" · ");
  const defs = [linear("accent", t.accent), s.defs].join("");
  const body = [
    panel(t, W, H),
    s.body,
    pill(t, { x: 64, y: 56, label: badge, dot: t.accent[1], size: 15 }).svg,
    text("HomeCast", { x: 62, y: 166, size: 64, family: "grotesk", weight: 700, fill: t.text, tracking: -2 }),
    intro.svg,
    detail.svg,
    notes.join(""),
  ].join("");
  const title = "HomeCast: your PC's films, music and photos on any TV browser on your home Wi-Fi. One exe, no cloud, no accounts, a 9.3 KB TV client, NVENC, QSV and AMF hardware encoding.";
  return svg({ width: W, height: H, title, defs, body, style: css() });
}
