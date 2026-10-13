// A small isometric engine. World space is right-handed: x runs to the
// lower right of the screen, y to the lower left, z straight up. Everything
// is an axis-aligned solid, which lets the painter's algorithm be exact:
// two boxes that do not intersect are always separated along some axis, and
// the one on the low side of that axis is drawn first. A topological sort of
// those pairwise relations gives the draw order; no z-buffer, no guessing.
//
// Faces are shaded from one light direction (Lambert), so the light, the
// tube gradients and the highlights on spheres all agree.
import { interpolateRgb } from "d3-interpolate";

export const C = Math.sqrt(3) / 2;
export const S = 0.5;
/** Screen length of one world unit measured perpendicular to the view. */
export const K = Math.sqrt(1.5);

const norm = (v) => {
  const l = Math.hypot(...v);
  return v.map((c) => c / l);
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => a.map((c, i) => c - b[i]);
const scale = (a, k) => a.map((c) => c * k);

export const LIGHT = norm([0.35, 0.65, 1]);
export const VIEW = norm([1, 1, 1]);
const n2 = (n) => n.toFixed(1);

/** Lambert shade between a material's shadow and lit colours. */
export function shade(mat, normal) {
  const d = Math.max(0, dot(norm(normal), LIGHT));
  return interpolateRgb(mat[0], mat[1])(0.08 + 0.92 * d);
}

/** Projector anchored at screen point (ox, oy). */
export function projector(ox, oy) {
  const p = (x, y, z = 0) => [ox + (x - y) * C, oy + (x + y) * S - z];
  const lin = ([x, y, z]) => [(x - y) * C, (x + y) * S - z];
  const pt = (q) => p(...q);
  const xy = (q) => `${n2(q[0])} ${n2(q[1])}`;
  /** SVG path data for a 3D polyline. */
  const poly = (pts, close = false) => pts.map((q, i) => `${i ? "L" : "M"}${xy(pt(q))}`).join("") + (close ? "Z" : "");
  return { p, lin, pt, xy, poly, ox, oy };
}

/* ------------------------------------------------------------------ */
/* Scene and depth sorting                                             */
/* ------------------------------------------------------------------ */

export class Scene {
  constructor(t, P, prefix = "s") {
    this.t = t;
    this.P = P;
    this.items = [];
    this.defs = new Map();
    this.prefix = prefix;
    this.seq = 0;
  }
  uid(tag) {
    return `${this.prefix}${tag}${this.seq++}`;
  }
  def(id, svg) {
    if (!this.defs.has(id)) this.defs.set(id, svg);
    return id;
  }
  /** item: { box: [x0,x1,y0,y1,z0,z1], draw: () => svg, mask?: () => svg, after?: item[] } */
  add(item) {
    item.after ??= [];
    this.items.push(item);
    return item;
  }

  screenBox(b) {
    const xs = [], ys = [];
    for (const x of [b[0], b[1]]) for (const y of [b[2], b[3]]) for (const z of [b[4], b[5]]) {
      const [sx, sy] = this.P.p(x, y, z);
      xs.push(sx);
      ys.push(sy);
    }
    return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  }

  /** -1: a before b, 1: b before a, 0: no constraint. */
  static order(a, b) {
    const e = 0.001;
    for (const k of [0, 2, 4]) {
      if (a[k + 1] <= b[k] + e) return -1;
      if (b[k + 1] <= a[k] + e) return 1;
    }
    const da = a[0] + a[1] + a[2] + a[3] + a[4] + a[5];
    const db = b[0] + b[1] + b[2] + b[3] + b[4] + b[5];
    return da <= db ? -1 : 1;
  }

  sorted() {
    const n = this.items.length;
    const sb = this.items.map((it) => this.screenBox(it.box));
    const out = Array.from({ length: n }, () => []);
    const indeg = new Array(n).fill(0);
    const link = (i, j) => {
      out[i].push(j);
      indeg[j]++;
    };
    const index = new Map(this.items.map((it, i) => [it, i]));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const [a, b] = [sb[i], sb[j]];
        if (a[1] < b[0] || b[1] < a[0] || a[3] < b[2] || b[3] < a[2]) continue;
        const o = Scene.order(this.items[i].box, this.items[j].box);
        if (o < 0) link(i, j);
        else link(j, i);
      }
    }
    this.items.forEach((it, j) => it.after.forEach((dep) => index.has(dep) && link(index.get(dep), j)));
    const depth = (i) => {
      const b = this.items[i].box;
      return b[0] + b[2] + b[4];
    };
    const done = new Array(n).fill(false);
    const order = [];
    for (let k = 0; k < n; k++) {
      let pick = -1;
      for (let i = 0; i < n; i++) if (!done[i] && indeg[i] <= 0 && (pick < 0 || depth(i) < depth(pick))) pick = i;
      if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || indeg[i] < indeg[pick] || (indeg[i] === indeg[pick] && depth(i) < depth(pick)))) pick = i;
      done[pick] = true;
      order.push(this.items[pick]);
      for (const j of out[pick]) indeg[j]--;
    }
    return order;
  }

  render() {
    const order = this.sorted();
    const body = order.map((it) => it.draw()).join("");
    const mask = order.map((it) => (it.mask ? it.mask() : "")).join("");
    return { body, mask, defs: [...this.defs.values()].join("") };
  }
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const polygon = (P, pts, fill, stroke, sw = 1) =>
  `<path d="${P.poly(pts, true)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ""}/>`;

/** Affine frame of a box face, for drawing flat artwork onto it. */
export function faceMatrix(P, face, [x0, x1, y0, y1, , z1]) {
  const frames = {
    x: { o: [x1, y1, z1], u: [0, -1, 0], v: [0, 0, -1] },
    y: { o: [x0, y1, z1], u: [1, 0, 0], v: [0, 0, -1] },
    z: { o: [x0, y0, z1], u: [1, 0, 0], v: [0, 1, 0] },
  };
  const f = frames[face];
  const [ox, oy] = P.pt(f.o);
  const [ux, uy] = P.lin(f.u);
  const [vx, vy] = P.lin(f.v);
  return `matrix(${ux.toFixed(4)} ${uy.toFixed(4)} ${vx.toFixed(4)} ${vy.toFixed(4)} ${ox.toFixed(2)} ${oy.toFixed(2)})`;
}

/**
 * Box from (x, y, z) with size (w, d, h). Options: mat, deco (svg in face
 * frames: {x, y, z}), stroke, after.
 */
export function box(sc, { x, y, z = 0, w, d, h, mat, deco = {}, stroke, lw = 1 }) {
  const { P, t } = sc;
  const b = [x, x + w, y, y + d, z, z + h];
  const line = stroke ?? t.iso.line;
  const top = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
  const right = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
  const left = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
  const onFace = (f) => (deco[f] ? `<g transform="${faceMatrix(P, f, b)}">${deco[f]}</g>` : "");
  const item = {
    box: b,
    draw: () =>
      [
        polygon(P, left, shade(mat, [0, 1, 0]), line, lw),
        onFace("y"),
        polygon(P, right, shade(mat, [1, 0, 0]), line, lw),
        onFace("x"),
        polygon(P, top, shade(mat, [0, 0, 1]), line, lw),
        onFace("z"),
      ].join(""),
    mask: () => `<path d="${P.poly([[x, y, z + h], [x + w, y, z + h], [x + w, y, z], [x + w, y + d, z], [x, y + d, z], [x, y + d, z + h]], true)}" fill="#000"/>`,
  };
  return sc.add(item);
}

/** Horizontal circle of radius r at (cx, cy, z): screen centre and radii. */
export function ellipse(P, cx, cy, z, r) {
  const [sx, sy] = P.p(cx, cy, z);
  return { sx, sy, rx: r * Math.SQRT2 * C, ry: r * Math.SQRT2 * S };
}

/** Gradient across a vertical cylinder's visible side, from the light. */
function cylinderGradient(sc, mat, key) {
  const id = `${sc.prefix}cyl${key}`;
  const stops = [];
  for (let i = 0; i <= 12; i++) {
    const u = -1 + (2 * i) / 12;
    const psi = Math.acos(u);
    const theta = psi - Math.PI / 4;
    stops.push(`<stop offset="${(i / 12).toFixed(3)}" stop-color="${shade(mat, [Math.cos(theta), Math.sin(theta), 0])}"/>`);
  }
  return sc.def(id, `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">${stops.join("")}</linearGradient>`);
}

/** Vertical cylinder standing on (cx, cy, z). */
export function cylinder(sc, { cx, cy, z = 0, r, h, mat, matKey = "m", top, stroke, lw = 1 }) {
  const { P, t } = sc;
  const line = stroke ?? t.iso.line;
  const b = [cx - r, cx + r, cy - r, cy + r, z, z + h];
  const lo = ellipse(P, cx, cy, z, r);
  const hi = ellipse(P, cx, cy, z + h, r);
  const grad = cylinderGradient(sc, mat, matKey);
  const side = `M${n2(lo.sx - lo.rx)} ${n2(hi.sy)}V${n2(lo.sy)}A${n2(lo.rx)} ${n2(lo.ry)} 0 0 0 ${n2(lo.sx + lo.rx)} ${n2(lo.sy)}V${n2(hi.sy)}Z`;
  return sc.add({
    box: b,
    draw: () =>
      `<path d="${side}" fill="url(#${grad})" stroke="${line}" stroke-width="${lw}"/>` +
      `<ellipse cx="${n2(hi.sx)}" cy="${n2(hi.sy)}" rx="${n2(hi.rx)}" ry="${n2(hi.ry)}" fill="${shade(mat, [0, 0, 1])}" stroke="${line}" stroke-width="${lw}"/>` +
      (top ? top(hi) : ""),
    mask: () => `<path d="${side}" fill="#000"/><ellipse cx="${n2(hi.sx)}" cy="${n2(hi.sy)}" rx="${n2(hi.rx)}" ry="${n2(hi.ry)}" fill="#000"/>`,
  });
}

/** Inverted truncated pyramid (a hopper) centred on (cx, cy), from z0 to z1. */
export function hopper(sc, { cx, cy, z0, z1, a, b, mat, inner }) {
  const { P, t } = sc;
  const T = (sx, sy, s, z) => [cx + sx * s, cy + sy * s, z];
  const top = [T(-1, -1, a, z1), T(1, -1, a, z1), T(1, 1, a, z1), T(-1, 1, a, z1)];
  const bot = [T(-1, -1, b, z0), T(1, -1, b, z0), T(1, 1, b, z0), T(-1, 1, b, z0)];
  const slope = a - b, hgt = z1 - z0;
  const line = t.iso.line;
  // inner walls of the back sides, seen through the opening
  const innerBackX = [top[0], top[3], bot[3], bot[0]];
  const innerBackY = [top[0], top[1], bot[1], bot[0]];
  const outerX = [bot[1], bot[2], top[2], top[1]];
  const outerY = [bot[3], bot[2], top[2], top[3]];
  return sc.add({
    box: [cx - a, cx + a, cy - a, cy + a, z0, z1],
    draw: () =>
      [
        polygon(P, innerBackX, shade(inner ?? mat, [hgt, 0, slope]), line),
        polygon(P, innerBackY, shade(inner ?? mat, [0, hgt, slope]), line),
        polygon(P, outerY, shade(mat, [0, hgt, -slope]), line),
        polygon(P, outerX, shade(mat, [hgt, 0, -slope]), line),
        `<path d="${P.poly(top, true)}" fill="none" stroke="${line}" stroke-width="1.4"/>`,
      ].join(""),
    mask: () => `<path d="${P.poly([top[0], top[1], bot[1], bot[2], bot[3], top[3]], true)}" fill="#000"/><path d="${P.poly(top, true)}" fill="#000"/>`,
  });
}

/* ------------------------------------------------------------------ */
/* Pipes                                                               */
/* ------------------------------------------------------------------ */

/** Gradient across a tube along unit axis `a`, from the light. */
function tubeGradient(sc, mat, a, mid, r) {
  const { P } = sc;
  const e2 = norm(sub(VIEW, scale(a, dot(VIEW, a))));
  const e1 = cross(a, e2);
  const [px, py] = P.lin(e1);
  const id = sc.uid("tube");
  const stops = [];
  for (let i = 0; i <= 10; i++) {
    const s = -1 + (2 * i) / 10;
    const n = [0, 1, 2].map((k) => s * e1[k] + Math.sqrt(Math.max(0, 1 - s * s)) * e2[k]);
    stops.push(`<stop offset="${(i / 10).toFixed(2)}" stop-color="${shade(mat, n)}"/>`);
  }
  sc.def(id, `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n2(mid[0] - px * r)}" y1="${n2(mid[1] - py * r)}" x2="${n2(mid[0] + px * r)}" y2="${n2(mid[1] + py * r)}">${stops.join("")}</linearGradient>`);
  return id;
}

function sphereGradient(sc, mat) {
  const { P } = sc;
  const id = `${sc.prefix}sph${mat.join("")}`.replace(/[^\w]/g, "");
  const [lx, ly] = P.lin(LIGHT);
  const len = Math.hypot(lx, ly) || 1;
  const fx = 0.5 + (0.42 * lx) / len, fy = 0.5 + (0.42 * ly) / len;
  return sc.def(id, `<radialGradient id="${id}" cx="${fx.toFixed(2)}" cy="${fy.toFixed(2)}" r="0.75" fx="${fx.toFixed(2)}" fy="${fy.toFixed(2)}"><stop offset="0" stop-color="${shade(mat, LIGHT)}"/><stop offset="1" stop-color="${shade(mat, [-1, -1, -0.2])}"/></radialGradient>`);
}

/** Flat ring around a pipe where it meets a face: a circle in the face plane. */
function flange(sc, q, axis, r, mat) {
  const { P, t } = sc;
  const a = axis.map(Math.abs);
  const [u, v] = a[0] ? [[0, -1, 0], [0, 0, -1]] : a[1] ? [[1, 0, 0], [0, 0, -1]] : [[1, 0, 0], [0, 1, 0]];
  const [ox, oy] = P.pt(q);
  const [ux, uy] = P.lin(u);
  const [vx, vy] = P.lin(v);
  const m = `matrix(${ux.toFixed(4)} ${uy.toFixed(4)} ${vx.toFixed(4)} ${vy.toFixed(4)} ${ox.toFixed(2)} ${oy.toFixed(2)})`;
  const R = r * 1.45, th = 2;
  const bx = q.map((c, k) => (a[k] ? [c - th * (axis[k] < 0 ? 1 : 0), c + th * (axis[k] > 0 ? 1 : 0)] : [c - R, c + R]));
  return sc.add({
    box: bx.flat(),
    draw: () => `<circle transform="${m}" r="${R}" fill="${shade(mat, axis)}" stroke="${t.iso.line}" stroke-width="1"/>`,
    mask: () => `<circle transform="${m}" r="${R}" fill="#000"/>`,
  });
}

/**
 * A pipe through 3D points (axis-aligned runs). Each run is a shaded tube
 * with a sight slot along its axis; corners get spherical elbow fittings and
 * the two ends get flanges. Returns the projected centre path.
 */
export function pipe(sc, pts, { r = 8, mat, slot = true, flanges = [true, true] }) {
  const { P, t } = sc;
  const width = 2 * r * K;
  const items = [];
  const fit = r * 1.18;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const dir = sub(p1, p0);
    const len = Math.hypot(...dir);
    const a = scale(dir, 1 / len);
    // the tube's box, shortened where a fitting or flange takes over
    const lo = p0.map((c, k) => c + a[k] * (i > 0 ? fit : 2.01));
    const hi = p1.map((c, k) => c - a[k] * (i < pts.length - 2 ? fit : 2.01));
    const bx = [0, 1, 2].flatMap((k) => (a[k] ? [Math.min(lo[k], hi[k]), Math.max(lo[k], hi[k])] : [p0[k] - r, p0[k] + r]));
    const s0 = P.pt(p0), s1 = P.pt(p1);
    const mid = [(s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2];
    const grad = tubeGradient(sc, mat, a, mid, r);
    const seg = `M${n2(s0[0])} ${n2(s0[1])}L${n2(s1[0])} ${n2(s1[1])}`;
    items.push(
      sc.add({
        box: bx,
        draw: () =>
          `<path d="${seg}" stroke="${t.iso.line}" stroke-width="${(width + 2).toFixed(1)}" fill="none"/>` +
          `<path d="${seg}" stroke="url(#${grad})" stroke-width="${width.toFixed(1)}" fill="none"/>` +
          (slot ? `<path d="${seg}" stroke="${t.iso.groove}" stroke-width="${(width * 0.42).toFixed(1)}" fill="none"/>` : ""),
        mask: () => `<path d="${seg}" stroke="#000" stroke-width="${(width + 2).toFixed(1)}" fill="none"/>` + (slot ? `<path d="${seg}" stroke="#fff" stroke-width="${(width * 0.42).toFixed(1)}" fill="none"/>` : ""),
      }),
    );
  }
  const sph = sphereGradient(sc, mat);
  for (let i = 1; i < pts.length - 1; i++) {
    const q = pts[i];
    const [sx, sy] = P.pt(q);
    const R = fit * K;
    sc.add({
      box: [q[0] - fit, q[0] + fit, q[1] - fit, q[1] + fit, q[2] - fit, q[2] + fit],
      draw: () => `<circle cx="${n2(sx)}" cy="${n2(sy)}" r="${R.toFixed(1)}" fill="url(#${sph})" stroke="${t.iso.line}" stroke-width="1"/>`,
      mask: () => `<circle cx="${n2(sx)}" cy="${n2(sy)}" r="${R.toFixed(1)}" fill="#000"/>`,
    });
  }
  const axisAt = (i, j) => norm(sub(pts[j], pts[i]));
  if (flanges[0]) flange(sc, pts[0], scale(axisAt(1, 0), 1), r, mat);
  if (flanges[1]) flange(sc, pts.at(-1), axisAt(pts.length - 2, pts.length - 1), r, mat);
  return P.poly(pts);
}

/** Length of a projected polyline, for timing motion along it. */
export function screenLength(P, pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = P.pt(pts[i - 1]), b = P.pt(pts[i]);
    L += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return L;
}

/** Point at fraction f of a projected polyline. */
export function pointAt(P, pts, f) {
  const segs = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = P.pt(pts[i - 1]), b = P.pt(pts[i]);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push({ a, b, l, s: L });
    L += l;
  }
  const target = f * L;
  const seg = segs.find((s) => target <= s.s + s.l) ?? segs.at(-1);
  const k = seg.l ? (target - seg.s) / seg.l : 0;
  return [seg.a[0] + (seg.b[0] - seg.a[0]) * k, seg.a[1] + (seg.b[1] - seg.a[1]) * k];
}
