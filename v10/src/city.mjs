// "Full stack, literally": the stack census as an isometric city block.
// Each tower is one technology and its height is the number of repositories
// that depend on it (4 px per repo, a floor line every 5). Towers are grouped
// into five districts, the five layers of the stack. The ground they stand on
// is the code itself: strata whose thickness is each language's share of
// 18.6 MB of source, measured in bytes.
import { interpolateRgb } from "d3-interpolate";
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, measure, paragraph, panel, linear, fmt } from "../../v5/src/ui.mjs";
import { Scene, projector, box, faceMatrix } from "./iso.mjs";

const PX_PER_REPO = 3.6;
const FLOOR = 5; // repos per floor line
const PITCH = 34, TOWER = 26, PAD = 10, GAP = 26, ROWS = 3;
const STRATA_H = 72;

const by = (stack, ...cats) => stack.filter((s) => cats.includes(s.category)).map((s) => ({ label: s.label, count: s.repos }));
const desc = (a) => [...a].sort((p, q) => q.count - p.count || p.label.localeCompare(q.label));

/** The five districts, computed from the census. */
export function districts(data) {
  const { stack, infra, languages } = data;
  const plpgsql = languages.find((l) => l.name === "PLpgSQL");
  return [
    { key: "INTERFACE", items: desc(by(stack, "Frontend")), cols: 4 },
    { key: "SERVICES", items: desc(by(stack, "Backend", "Integrations")).map((i) => ({ ...i, label: i.label.replace("Email (SendGrid/Resend)", "SendGrid/Resend") })), cols: 2 },
    { key: "DATA", items: desc([...by(stack, "Data"), ...(plpgsql ? [{ label: "PL/pgSQL", count: plpgsql.repos }] : [])]), cols: 2 },
    {
      key: "INFRA AND DELIVERY",
      items: desc([
        { label: "GitHub Actions", count: infra.workflows },
        { label: "Vercel", count: infra.vercel },
        { label: "Docker", count: infra.docker },
        ...by(stack, "Testing & Tooling").filter((s) => s.label !== "TypeScript"),
      ].filter((i) => i.count > 0)),
      cols: 2,
    },
    { key: "AI", items: desc(by(stack, "AI")), cols: 1 },
  ];
}

/** Language strata, top to bottom, largest first; the tail folds into Other. */
function strata(data) {
  const total = data.totals.languageBytes;
  const top = data.languages.slice(0, 5);
  const other = total - top.reduce((s, l) => s + l.bytes, 0);
  return [...top.map((l) => ({ name: l.name, bytes: l.bytes })), { name: "Other", bytes: other }].map((s) => ({ ...s, share: s.bytes / total }));
}

const darken = (c, k) => interpolateRgb(c, "#000")(k);
const lighten = (c, k) => interpolateRgb(c, "#fff")(k);

/** Plot rectangles along the x axis, three tower rows deep. */
function layout(ds) {
  let x = 16;
  return ds.map((d) => {
    const w = d.cols * PITCH + PAD * 2 - (PITCH - TOWER);
    const plot = { x, y: 16, w, d: ROWS * PITCH + PAD * 2 - (PITCH - TOWER) };
    x += w + GAP;
    // slots back to front, so the tallest towers stand at the back
    const slots = [];
    for (let c = 0; c < d.cols; c++) for (let r = 0; r < ROWS; r++) slots.push({ c, r });
    slots.sort((a, b) => a.c + a.r - (b.c + b.r) || b.c - a.c);
    const towers = d.items.map((it, i) => ({ ...it, x: plot.x + PAD + slots[i].c * PITCH, y: plot.y + PAD + slots[i].r * PITCH }));
    return { ...d, plot, towers };
  });
}

function floorLines(t, count, hgt) {
  let out = "";
  for (let k = FLOOR; k < count; k += FLOOR) {
    const v = hgt - k * PX_PER_REPO;
    out += `<path d="M0 ${v}H${TOWER}" stroke="${t.iso.edge}" stroke-width="1"/>`;
  }
  return out;
}

export function city(t, data) {
  const ds = layout(districts(data));
  const layers = strata(data);
  const extentX = ds.at(-1).plot.x + ds.at(-1).plot.w + 16;
  const extentY = ds[0].plot.d + 32;
  const ox = 196, oy = 452;
  const P = projector(ox, oy);
  const sc = new Scene(t, P, "ct");

  // the ground: one box per language, thickness by bytes
  let z = 0;
  const ramp = [t.accent[1], t.accent[0], t.accent[2], t.layers[3], t.layers[4], t.faint];
  const strataPos = [];
  layers.forEach((l, i) => {
    const h = l.share * STRATA_H;
    z -= h;
    const c = ramp[i];
    // alternate the depth of tint so neighbouring strata separate
    const k = [0.36, 0.62, 0.4, 0.66, 0.44, 0.3][i];
    const lit = t.name === "dark" ? interpolateRgb("#1d1914", c)(k) : interpolateRgb("#f3efe8", c)([0.6, 0.36, 0.52, 0.3, 0.46, 0.2][i]);
    const mat = [darken(lit, t.name === "dark" ? 0.55 : 0.18), lit];
    box(sc, { x: 0, y: 0, z, w: extentX, d: extentY, h, mat, stroke: t.iso.edge, lw: 0.6 });
    strataPos.push({ ...l, z0: z, z1: z + h, color: c });
  });
  // a pale top skin for the whole block
  box(sc, { x: 0, y: 0, z: 0, w: extentX, d: extentY, h: 3, mat: t.iso.plinth });

  // districts and towers
  ds.forEach((d) => {
    box(sc, { x: d.plot.x, y: d.plot.y, z: 3, w: d.plot.w, d: d.plot.d, h: 5, mat: t.iso.steel });
    d.towers.forEach((tw, i) => {
      const h = tw.count * PX_PER_REPO;
      const lead = i === 0;
      const roof = lead ? t.iso.amber : t.iso.steel;
      tw.h = h;
      box(sc, {
        x: tw.x, y: tw.y, z: 8, w: TOWER, d: TOWER, h, mat: t.iso.steel,
        deco: { x: floorLines(t, tw.count, h), y: floorLines(t, tw.count, h) },
      });
      // the roof cap carries the district's accent on its tallest tower
      box(sc, { x: tw.x, y: tw.y, z: 8 + h, w: TOWER, d: TOWER, h: 2, mat: roof });
    });
  });
  const scene = sc.render();
  return { ds, strataPos, scene, P, extentX, extentY, ox, oy };
}

/* ---------- annotation ---------- */

const MONO = { size: 15, family: "mono", weight: 700, tracking: 1.2 };
const ITEM = { size: 16, weight: 500 };
const NUM = { size: 16, family: "mono", weight: 700 };

/** A callout block: district name, then every technology with its count. */
function callout(t, d, { x, y, colW, cols }) {
  const rows = Math.ceil(d.items.length / cols);
  let out = text(d.key, { x, y, fill: t.accent[1], ...MONO });
  d.items.forEach((it, i) => {
    const c = Math.floor(i / rows), r = i % rows;
    const ix = x + c * colW, iy = y + 28 + r * 23;
    out += text(it.label, { x: ix, y: iy, fill: i === 0 ? t.text : t.muted, ...ITEM, weight: i === 0 ? 650 : 500 }) +
      text(String(it.count), { x: ix + colW - 22, y: iy, fill: i === 0 ? t.accent[1] : t.text, anchor: "end", ...NUM });
  });
  return { svg: out, height: 28 + rows * 23 };
}

const leader = (t, pts) =>
  `<path d="M${pts.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join("L")}" fill="none" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
  `<circle cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>`;

export function stackCity(t, data) {
  const c = city(t, data);
  const { P } = c;
  // callouts: a column on the right, one block per district, each as close
  // as it can get to the height of its tallest tower without overlapping
  const colX = 776, colW = 180;
  let floor = 236;
  const under = [], over = [];
  const blocks = c.ds.map((d) => {
    const tw = d.towers[0];
    const [ax, ay] = P.p(tw.x + TOWER, tw.y, 8 + tw.h + 2);
    const y = Math.max(floor, ay + 5);
    const block = callout(t, d, { x: colX, y, colW, cols: 2 });
    floor = y + block.height + 22;
    under.push(`<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}V${(y - 5).toFixed(1)}H${colX - 14}" fill="none" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>`);
    over.push(`<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3" fill="${t.panel}" stroke="${t.accent[1]}" stroke-width="1.5"/>`);
    return block.svg;
  });

  // strata labels: a staircase under the slab's long face, one per layer,
  // each hanging from its own layer
  const strataLabels = c.strataPos.map((s, i) => {
    const along = 176 + i * 66;
    const [ax, ay] = P.p(along, c.extentY, (s.z0 + s.z1) / 2);
    const [, by] = P.p(along, c.extentY, -STRATA_H);
    const ly = by + 34;
    const pct = `${(s.share * 100).toFixed(1)}%`;
    const pctW = measure(pct, { size: 16, family: "mono", weight: 500 });
    return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}V${(ly - 16).toFixed(1)}" stroke="${t.faint}" stroke-width="1" stroke-dasharray="2 3"/>` +
      `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.5" fill="${s.color}"/>` +
      text(pct, { x: ax + 2, y: ly, size: 16, family: "mono", weight: 500, fill: t.muted, anchor: "end" }) +
      text(s.name, { x: ax + 2 - pctW - 8, y: ly, size: 16, weight: 600, fill: t.text, anchor: "end" });
  });
  const mb = (data.totals.languageBytes / 1e6).toFixed(1);
  const lastY = P.p(176 + 5 * 66, c.extentY, -STRATA_H)[1] + 34;
  const H = Math.ceil(Math.max(lastY + 44, floor + 20));

  const header = [
    text("03  ·  FULL STACK, LITERALLY", { x: 64, y: 72, size: 15, weight: 700, tracking: 2.5, fill: "url(#accent)" }),
    text("Every layer, counted from the repos.", { x: 64, y: 124, size: 44, family: "grotesk", weight: 700, tracking: -1.2, fill: t.text }),
    paragraph(
      `${fmt(data.totals.repos)} repositories, ${fmt(data.totals.privateRepos)} of them private. Each tower is a technology; its height is the number of repos that depend on it. One floor line is five repos.`,
      { x: 64, y: 164, size: 18, maxWidth: 700, lineHeight: 27, fill: t.muted },
    ).svg,
  ].join("");

  const defs = [linear("accent", t.accent), c.scene.defs].join("");
  const ground = text("THE GROUND", { x: 64, y: lastY - 28, ...MONO, fill: t.accent[1] }) +
    text(`${mb} MB of source, by language`, { x: 64, y: lastY - 4, size: 16, fill: t.muted });
  const body = [panel(t, W, H), header, under.join(""), c.scene.body, over.join(""), blocks.join(""), strataLabels.join(""), ground].join("");
  const title = `Full stack, literally: an isometric city of ${data.totals.repos} repositories. ${c.ds.map((d) => `${d.key.toLowerCase()}: ${d.items.map((i) => `${i.label} ${i.count}`).join(", ")}`).join("; ")}. Standing on ${mb} MB of code: ${c.strataPos.map((s) => `${s.name} ${(s.share * 100).toFixed(1)}%`).join(", ")}.`;
  return svg({ width: W, height: H, title, defs, body, style: css() });
}
