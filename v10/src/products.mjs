// Product cards drawn as vector UI, adapted from v5 for the v8 amber system:
// no glows, warm screen neutrals, amber status colours instead of green, and
// generated wallpapers kept to warm hues. Device screens use a fixed dark
// palette in both themes, like a real screen would.
import { svg } from "../../lib/svg.mjs";
import { W, css } from "./theme.mjs";
import { text, measure, paragraph, pill, panel, linear, rect, group, cardClip, cta } from "../../v5/src/ui.mjs";
import { rng } from "../../v5/src/random.mjs";

const aurora = () => ({ defs: "", body: "" });
const BREATHE = "@keyframes breathe{0%,100%{opacity:1}50%{opacity:.55}}.breathe{animation:breathe 4.5s ease-in-out infinite}@keyframes flow{to{stroke-dashoffset:-24}}.flow{animation:flow 1.6s linear infinite}";

const SCREEN = { bg: "#100f0d", raised: "#1a1814", line: "#2e2a24", text: "#ece7df", muted: "#9a9287", faint: "#6d665b" };

const repoOf = (data, name) => data.publicRepos.find((r) => r.name === name) ?? {};
const bar = (x, y, w, h = 10, o = 1) => rect({ x, y, width: w, height: h, rx: h / 2, fill: SCREEN.line, opacity: o });
const dots = (x, y) => ["#ff5f57", "#febc2e", "#28c840"].map((c, i) => `<circle cx="${x + i * 20}" cy="${y}" r="6" fill="${c}"/>`).join("");

/** Numbered marker that ties a UI region to its description below. */
function marker(t, n, x, y) {
  return `<circle cx="${x}" cy="${y}" r="15" fill="url(#accent)"/>` + text(String(n), { x, y: y + 5.5, size: 16, family: "mono", weight: 700, fill: t.buttonText, anchor: "middle" });
}

/* ---------- claude-code-mods: one Claude Code window, all three mods in place ---------- */

const TELEMETRY = ["34% 5h", "+1.5/min", "2h 16m left", "58% wk", "41% ctx", "96% cache"];
const NEXT = [["Add a test for the retry path", true], ["Update the README", true], ["Check the webhook logs", false]];

function telemetryRow(x, y, w) {
  let cx = x + 14;
  const chips = TELEMETRY.map((label, i) => {
    const cw = measure(label, { size: 15, family: "mono", weight: 500 }) + 18;
    const out = (i === 0 ? rect({ x: cx, y: y + 8, width: cw, height: 28, rx: 6, fill: "#3a2a08" }) : "") +
      text(label, { x: cx + 9, y: y + 27, size: 15, family: "mono", weight: 500, fill: i === 0 ? "#ffd27a" : SCREEN.muted });
    cx += cw + 4;
    return out;
  }).join("");
  const q = `<circle cx="${x + w - 24}" cy="${y + 22}" r="13" fill="url(#accent)"/>` + text("?", { x: x + w - 24, y: y + 28, size: 17, weight: 700, fill: "#0b0d12", anchor: "middle" });
  return rect({ x, y, width: w, height: 44, rx: 10, fill: SCREEN.raised, stroke: "#5a3f0c" }) + chips + q;
}

function nextStepsPane(x, y, w) {
  const rows = NEXT.map(([label, on], i) => {
    const ry = y + 56 + i * 44;
    return rect({ x: x + 16, y: ry - 16, width: 20, height: 20, rx: 5, fill: on ? "url(#accent)" : "none", stroke: on ? "none" : SCREEN.faint, "stroke-width": 1.5 }) +
      (on ? `<path d="M${x + 21} ${ry - 6}l4 4 7-8" stroke="#0b0d12" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "") +
      text(label, { x: x + 48, y: ry, size: 15, fill: on ? SCREEN.text : SCREEN.muted });
  }).join("");
  return [
    rect({ x, y, width: w, height: 236, rx: 12, fill: SCREEN.raised, stroke: SCREEN.line }),
    text("NEXT STEPS", { x: x + 16, y: y + 26, size: 15, family: "mono", weight: 700, tracking: 1.5, fill: SCREEN.faint }),
    rows,
    rect({ x: x + 16, y: y + 182, width: 118, height: 36, rx: 8, fill: "url(#accent)" }),
    text("Insert 2", { x: x + 75, y: y + 206, size: 15, weight: 700, fill: "#0b0d12", anchor: "middle" }),
    text("in tick order", { x: x + 148, y: y + 206, size: 15, fill: SCREEN.faint }),
  ].join("");
}

function docsToast(x, y) {
  return rect({ x, y, width: 300, height: 40, rx: 10, fill: "#2a1d06", stroke: "#5a3f0c" }) +
    `<circle cx="${x + 20}" cy="${y + 20}" r="5" fill="#ffb000"/>` +
    text("docs: sync with a1b2c3d", { x: x + 36, y: y + 26, size: 15, family: "mono", weight: 500, fill: "#ffd27a" });
}

function claudeWindow(t, x, y, w, h) {
  const chatW = w - 330;
  const convo = [
    bar(x + 32, y + 78, chatW * 0.36), bar(x + 32, y + 98, chatW * 0.44, 10, 0.7), bar(x + 32, y + 118, chatW * 0.28, 10, 0.7),
    rect({ x: x + chatW - 220, y: y + 146, width: 200, height: 34, rx: 10, fill: SCREEN.raised }), bar(x + chatW - 204, y + 158, 150, 10, 0.8),
    bar(x + 32, y + 206, chatW * 0.66), bar(x + 32, y + 226, chatW * 0.5, 10, 0.7),
  ].join("");
  const promptY = y + h - 60;
  return [
    rect({ x, y, width: w, height: h, rx: 16, fill: SCREEN.bg, stroke: t.border }),
    dots(x + 24, y + 22),
    text("Claude Code  ·  mods enabled", { x: x + w / 2, y: y + 28, size: 15, fill: SCREEN.faint, anchor: "middle" }),
    rect({ x, y: y + 44, width: w, height: 1, fill: SCREEN.line }),
    convo,
    docsToast(x + chatW - 320, y + 60),
    nextStepsPane(x + w - 314, y + 62, 296),
    telemetryRow(x + 16, promptY - 56, chatW - 4),
    rect({ x: x + 16, y: promptY, width: w - 32, height: 44, rx: 10, fill: SCREEN.raised, stroke: SCREEN.line }),
    text("ok, ship it", { x: x + 34, y: promptY + 28, size: 15, fill: SCREEN.muted }),
    `<rect class="caret" x="${x + 34 + measure("ok, ship it", { size: 15 }) + 3}" y="${promptY + 12}" width="2" height="20" fill="${SCREEN.text}"/>`,
    marker(t, 1, x + 16, promptY - 56),
    marker(t, 2, x + w - 314, y + 62),
    marker(t, 3, x + chatW - 320, y + 60),
  ].join("");
}

const MODS = [
  { name: "token-ledger", desc: "Plan limits in one row above the prompt. Press ? and Haiku suggests what to ask next." },
  { name: "next-steps", desc: "Suggested next prompts in a pane. Tick several, insert them in order." },
  { name: "auto-docs", desc: "A follow-up docs commit keeps the README in step with every commit." },
];

export function claudeModsCardV2(t, data) {
  const repo = repoOf(data, "claude-code-mods");
  const win = { x: 64, y: 196, w: W - 128, h: 400 };
  const colY = win.y + win.h + 56;
  const H = colY + 170;
  const glow = aurora("cg", [{ x: 1080, y: 40, rx: 420, ry: 200, color: t.aurora.violet, cls: "dA" }, { x: 120, y: H, rx: 380, ry: 200, color: t.aurora.indigo, cls: "dB" }]);
  const tagline = paragraph("Function-hook mods for Claude Code: plan limits, next prompts and docs, built into the interface itself.", { x: 640, y: 104, size: 19, maxWidth: 496, lineHeight: 29, fill: t.muted });
  const colW = (W - 128 - 48) / 3;
  const columns = MODS.map((m, i) => {
    const x = 64 + i * (colW + 24);
    return marker(t, i + 1, x + 15, colY + 2) +
      text(m.name, { x: x + 42, y: colY + 9, size: 22, family: "mono", weight: 700, fill: t.text }) +
      paragraph(m.desc, { x, y: colY + 48, size: 17, maxWidth: colW, lineHeight: 26, fill: t.muted }).svg;
  }).join("");
  const defs = [cardClip("card", W, H), glow.defs, linear("accent", t.accent)].join("");
  const body = [
    panel(t, W, H),
    group(glow.body, { "clip-path": "url(#card)" }),
    pill(t, { x: 64, y: 56, label: ["Open source", repo.language ?? "TypeScript", "MIT"].join(" · "), dot: t.accent[1], size: 15 }).svg,
    text("claude-code-mods", { x: 62, y: 160, size: 56, family: "grotesk", weight: 700, fill: t.text, tracking: -1.5 }),
    tagline.svg,
    claudeWindow(t, win.x, win.y, win.w, win.h),
    columns,
  ].join("");
  const extra = "@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}.caret{animation:blink 1.1s step-end infinite}";
  return svg({ width: W, height: H, title: "claude-code-mods: 1 token-ledger, plan limits in a row above the prompt; 2 next-steps, suggested prompts you tick and insert; 3 auto-docs, a docs commit after every commit.", defs, body, style: css(extra) });
}

/* ---------- Half cards with drawn visuals ---------- */

const HALF = { w: 600, h: 556, vis: { x: 24, y: 24, w: 552, h: 284 } };

function halfShell(t, { name, badge, description, visual, glowColor, extraCss = "" }) {
  const { w, h, vis } = HALF;
  const glow = aurora("hc", [{ x: w, y: h, rx: 360, ry: 260, color: glowColor, cls: "dA" }]);
  const desc = paragraph(description, { x: 40, y: 456, size: 19, maxWidth: w - 80, lineHeight: 29, fill: t.muted });
  const defs = [cardClip("card", w, h), glow.defs, linear("accent", t.accent), `<clipPath id="vis"><rect x="${vis.x}" y="${vis.y}" width="${vis.w}" height="${vis.h}" rx="14"/></clipPath>`].join("");
  const body = [
    panel(t, w, h),
    group(glow.body, { "clip-path": "url(#card)" }),
    rect({ x: vis.x, y: vis.y, width: vis.w, height: vis.h, rx: 14, fill: SCREEN.bg, stroke: t.border }),
    group(visual, { "clip-path": "url(#vis)" }),
    pill(t, { x: 40, y: 334, label: badge, dot: t.accent[1], size: 15 }).svg,
    text(name, { x: 38, y: 412, size: 40, family: "grotesk", weight: 700, fill: t.text, tracking: -1 }),
    desc.svg,
  ].join("");
  return svg({ width: w, height: h, title: `${name}: ${description}`, defs, body, style: css(BREATHE + extraCss) });
}

/** The same three people in every scene: identity-locked, drawn. */
function family(cx, groundY, fill) {
  const person = (x, hgt) => {
    const head = hgt * 0.17;
    return `<circle cx="${x}" cy="${(groundY - hgt + head).toFixed(1)}" r="${head.toFixed(1)}" fill="${fill}"/>` +
      `<path d="M${(x - hgt * 0.2).toFixed(1)} ${groundY}V${(groundY - hgt * 0.5).toFixed(1)}Q${x} ${(groundY - hgt * 0.72).toFixed(1)} ${(x + hgt * 0.2).toFixed(1)} ${(groundY - hgt * 0.5).toFixed(1)}V${groundY}Z" fill="${fill}"/>`;
  };
  return person(cx - 20, 58) + person(cx + 18, 53) + person(cx - 1, 36);
}

/** A seeded "photo": sky gradient, sun, three layered hills. No real faces needed. */
function wallpaper(seed, x, y, w, h, id) {
  const r = rng(seed);
  const hue = 16 + Math.floor(r() * 26);
  const sky = [`hsl(${hue},55%,${12 + r() * 8}%)`, `hsl(${hue + 14},85%,${52 + r() * 10}%)`];
  const hills = [0.62, 0.72, 0.84].map((base, i) => {
    const pts = Array.from({ length: 7 }, (_, k) => [x + (k * w) / 6, y + h * (base - r() * 0.12)]);
    const d = `M${x} ${y + h}L${pts.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join("L")}L${x + w} ${y + h}Z`;
    return `<path d="${d}" fill="hsl(${hue - 4 + i * 4},${28 + i * 8}%,${30 - i * 8}%)"/>`;
  }).join("");
  const sun = `<circle cx="${(x + w * (0.25 + r() * 0.5)).toFixed(1)}" cy="${(y + h * (0.28 + r() * 0.12)).toFixed(1)}" r="${(h * 0.11).toFixed(1)}" fill="hsl(${hue + 26},95%,80%)" opacity="0.9"/>`;
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>` +
    rect({ x, y, width: w, height: h, fill: `url(#${id})` }) + sun + hills + family(x + w * 0.64, y + h * 0.9, `hsl(${hue},30%,7%)`);
}

function nanowallVisual() {
  const mon = { x: 96, y: 40, w: 408, h: 200 };
  const SLIDES = 3, CYCLE = 9;
  const slides = Array.from({ length: SLIDES }, (_, i) =>
    `<g class="slide" style="animation-delay:${(i * CYCLE) / SLIDES - CYCLE}s"${i === 0 ? "" : ' opacity="0"'}>${wallpaper(50 + i * 7, mon.x, mon.y, mon.w, mon.h, `wp${i}`)}</g>`).join("");
  const strip = Array.from({ length: 50 }, (_, i) => {
    const x = 60 + i * 9.0;
    return rect({ x: x.toFixed(1), y: 266, width: 6.4, height: 18, rx: 2, fill: i < 3 ? "#ffb000" : SCREEN.line });
  }).join("");
  return [
    rect({ x: mon.x - 8, y: mon.y - 8, width: mon.w + 16, height: mon.h + 16, rx: 10, fill: "#1d1b17", stroke: "#38332b" }),
    slides,
    rect({ x: 280, y: mon.y + mon.h + 8, width: 40, height: 14, fill: "#1d1b17" }),
    `<g class="playhead">${rect({ x: 58, y: 263, width: 10, height: 24, rx: 3, fill: "none", stroke: "#f5f7fb", "stroke-width": 2 })}</g>`,
    strip,
    text("50", { x: 548, y: 282, size: 15, family: "mono", weight: 700, fill: SCREEN.muted, anchor: "end" }),
  ].join("");
}

export function nanowallCardV2(t, data) {
  const repo = repoOf(data, "nanowall");
  const badge = [repo.language ?? "Python", repo.release?.tagName].filter(Boolean).join(" · ");
  const css = "@keyframes slide{0%,30%{opacity:1}36%,94%{opacity:0}100%{opacity:1}}.slide{animation:slide 9s linear infinite}" +
    "@keyframes play{from{transform:translateX(0)}to{transform:translateX(441px)}}.playhead{animation:play 9s steps(49) infinite}";
  return halfShell(t, {
    name: "nanowall", badge, glowColor: t.aurora.amber, extraCss: css,
    description: "Family photos in, a 50-wallpaper Windows desktop carousel out. Nano Banana Pro keeps every face recognisable.",
    visual: nanowallVisual(),
  });
}

function vsmVisual() {
  const rows = [["Thandi M.", "Pretoria"], ["Johan V.", "Centurion"], ["Ayanda K.", "Midrand"], ["Pieter B.", "Pretoria"]];
  const table = rows.map(([a, b], i) => {
    const y = 128 + i * 30;
    return `<g class="row" style="animation-delay:${i * 0.6}s">${rect({ x: 252, y: y - 19, width: 284, height: 28, rx: 4, fill: i % 2 ? "transparent" : "#181612" })}${text(a, { x: 264, y, size: 15, fill: SCREEN.text })}${text(b, { x: 400, y, size: 15, fill: SCREEN.muted })}</g>`;
  }).join("");
  return [
    // the human's own screen, left
    rect({ x: 24, y: 40, width: 196, height: 224, rx: 10, fill: "#181612", stroke: SCREEN.line }),
    text("YOUR SCREEN", { x: 40, y: 66, size: 15, family: "mono", weight: 700, tracking: 1, fill: SCREEN.faint }),
    bar(40, 86, 150), bar(40, 106, 120, 10, 0.7), bar(40, 126, 140, 10, 0.7),
    // the virtual secondary monitor, right
    rect({ x: 236, y: 40, width: 316, height: 224, rx: 10, fill: "#181612", stroke: "#5a3f0c", "stroke-width": 1.5 }),
    text("VSM", { x: 252, y: 66, size: 15, family: "mono", weight: 700, tracking: 1, fill: "#ffd27a" }),
    rect({ x: 444, y: 50, width: 96, height: 24, rx: 12, fill: "#2a1d06" }),
    `<circle class="breathe" cx="458" cy="62" r="4" fill="#ffb000"/>`,
    text("agent", { x: 470, y: 67, size: 15, fill: "#ffd27a" }),
    text("Extract the table", { x: 252, y: 96, size: 15, weight: 600, fill: SCREEN.text }),
    table,
    rect({ x: 252, y: 230, width: 128, height: 26, rx: 6, fill: "url(#accent)" }),
    text("Take over", { x: 316, y: 248, size: 15, weight: 700, fill: "#0b0d12", anchor: "middle" }),
    text("Monitor · Mini · Hide", { x: 536, y: 248, size: 15, fill: SCREEN.faint, anchor: "end" }),
    `<path class="cursor" d="M180 190l0 22 6-6 5 10 4-2-5-10 8 0z" fill="#f5f7fb" stroke="#0b0d12" stroke-width="1.2"/>`,
  ].join("");
}

export function vsmCardV2(t, data) {
  const repo = repoOf(data, "vsm-for-ai-agents");
  const css = "@keyframes rowIn{0%,8%{opacity:.35}20%,100%{opacity:1}}.row{animation:rowIn 5s ease-out infinite}" +
    "@keyframes reach{0%,60%{transform:translate(0,0)}80%,100%{transform:translate(118px,40px)}}.cursor{animation:reach 5s ease-in-out infinite alternate}";
  return halfShell(t, {
    name: "vsm-for-ai-agents", badge: `${repo.language ?? "Python"} · Skills and connectors`, glowColor: t.aurora.cyan, extraCss: css,
    description: "A second screen for your AI agent. It works where you can see it, and you take over with one click.",
    visual: vsmVisual(),
  });
}

/* ---------- snipe-loop: a phone receiving a snipe card, inside the loop ---------- */

const ORBIT = { cx: 900, cy: 204, rx: 262, ry: 168 };
const ORBIT_STEPS = [
  { label: "Sweep", deg: 210 },
  { label: "Spot", deg: 330 },
  { label: "Send", deg: 30 },
  { label: "Learn", deg: 150 },
];

const onOrbit = (deg) => {
  const a = (deg * Math.PI) / 180;
  return [ORBIT.cx + ORBIT.rx * Math.cos(a), ORBIT.cy + ORBIT.ry * Math.sin(a)];
};

function snipeBubble(t, x, y, w) {
  const rows = [["Under market", t.accent[0]], ["Seller checks out", t.accent[1]], ["Market grade: buy", t.accent[2]]];
  return [
    rect({ x, y, width: w, height: 168, rx: 14, fill: t.panelRaised, stroke: t.chipStroke }),
    rect({ x: x + 12, y: y + 12, width: w - 24, height: 52, rx: 9, fill: "url(#accentV)", opacity: 0.85 }),
    text("SNIPE", { x: x + 24, y: y + 44, size: 15, family: "mono", weight: 700, tracking: 2, fill: t.buttonText }),
    ...rows.map(([label, c], i) => `<circle cx="${x + 20}" cy="${y + 86 + i * 26}" r="4" fill="${c}"/>` + text(label, { x: x + 32, y: y + 91 + i * 26, size: 15, weight: 500, fill: t.text })),
  ].join("");
}

function phone(t) {
  const w = 214, h = 316, x = ORBIT.cx - w / 2, y = ORBIT.cy - h / 2;
  return [
    rect({ x, y, width: w, height: h, rx: 32, fill: t.deviceBody, stroke: t.deviceEdge, "stroke-width": 2 }),
    rect({ x: x + 10, y: y + 10, width: w - 20, height: h - 20, rx: 24, fill: t.panel }),
    rect({ x: x + w / 2 - 30, y: y + 18, width: 60, height: 8, rx: 4, fill: t.deviceEdge }),
    `<circle cx="${x + 32}" cy="${y + 52}" r="11" fill="url(#accentV)"/>`,
    text("snipe-loop", { x: x + 50, y: y + 57, size: 15, weight: 600, fill: t.text }),
    `<circle class="breathe" cx="${x + w - 30}" cy="${y + 52}" r="5" fill="#25d366"/>`,
    rect({ x: x + 10, y: y + 72, width: w - 20, height: 1, fill: t.hairline }),
    snipeBubble(t, x + 20, y + 92, w - 40),
    text("Snipe cards, straight to WhatsApp.", { x: ORBIT.cx, y: y + h - 26, size: 15, fill: t.faint, anchor: "middle" }),
  ].join("");
}

function orbitLoop(t) {
  const { cx, cy, rx, ry } = ORBIT;
  const d = `M${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`;
  const nodes = ORBIT_STEPS.map(({ label, deg }, i) => {
    const [x, y] = onOrbit(deg);
    const w = measure(label, { size: 16, weight: 650 }) + 46;
    return rect({ x: x - w / 2, y: y - 19, width: w, height: 38, rx: 19, fill: t.panel, stroke: t.chipStroke }) +
      text(String(i + 1), { x: x - w / 2 + 18, y: y + 5, size: 15, family: "mono", weight: 700, fill: t.accent[1], anchor: "middle" }) +
      text(label, { x: x - w / 2 + 32, y: y + 6, size: 16, weight: 650, fill: t.text });
  }).join("");
  return [
    `<path d="${d}" fill="none" stroke="${t.chipStroke}" stroke-width="2" stroke-dasharray="4 8" class="flow"/>`,
    `<circle r="6" fill="${t.accent[2]}" opacity="0"><set attributeName="opacity" to="1" begin="0s"/><animateMotion dur="10s" repeatCount="indefinite" path="${d}"/></circle>`,
    nodes,
  ].join("");
}

export function snipeLoopCardV2(t) {
  const H = 420;
  const glow = aurora("sl", [{ x: 960, y: 210, rx: 420, ry: 240, color: t.aurora.violet, cls: "dB" }]);
  const desc = paragraph(
    "An agent skill that sweeps Facebook Marketplace and AutoTrader for underpriced listings, sends snipe cards to WhatsApp, and tunes its own sweep from how the market grades its picks.",
    { x: 64, y: 214, size: 19, maxWidth: 470, lineHeight: 29, fill: t.muted },
  );
  const defs = [cardClip("card", W, H), glow.defs, linear("accent", t.accent), linear("accentV", t.accent, { x1: 0, y1: 0, x2: 1, y2: 1 })].join("");
  const body = [
    panel(t, W, H),
    group(glow.body + orbitLoop(t) + phone(t), { "clip-path": "url(#card)" }),
    pill(t, { x: 64, y: 60, label: "Agent skill · Self-tuning", dot: t.accent[2], size: 15 }).svg,
    text("snipe-loop", { x: 62, y: 166, size: 52, family: "grotesk", weight: 700, fill: t.text, tracking: -1.5 }),
    desc.svg,
    cta(t, { x: 64, y: H - 40, label: "View the repo", gradId: "accent" }),
  ].join("");
  const title = "snipe-loop: an agent skill that sweeps Facebook Marketplace and AutoTrader for underpriced listings, sends snipe cards to WhatsApp, and retunes its sweep from how the market grades its picks.";
  return svg({ width: W, height: H, title, defs, body, style: css(BREATHE) });
}
