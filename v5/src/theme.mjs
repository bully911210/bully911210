// Two palettes with identical keys, so every visual is written once and
// rendered twice. Dark sits on GitHub's #0d1117, light on #ffffff.

export const W = 1200;

export const THEMES = {
  dark: {
    name: "dark",
    panel: "#0a0b11",
    panelRaised: "#10121a",
    border: "#30363d",
    hairline: "rgba(255,255,255,0.08)",
    text: "#f5f7fb",
    muted: "#a4adbb",
    faint: "#6e7786",
    chipFill: "rgba(255,255,255,0.045)",
    chipStroke: "rgba(255,255,255,0.11)",
    accent: ["#ffc53d", "#ffb000", "#ff8a00"],
    cyan: "#d6b48a",
    amber: ["#fbbf24", "#f97316"],
    layers: ["#ffe08a", "#ffc53d", "#ffb000", "#ff9500", "#ff7a1a"],
    aurora: { indigo: ["#b86e00", 0.42], violet: ["#ff9500", 0.24], cyan: ["#7c2d12", 0.4], amber: ["#ffb000", 0.24] },
    grid: "rgba(255,255,255,0.055)",
    slabFace: 0.16,
    slabSide: 0.07,
    screenGlow: 0.45,
    buttonText: "#0a0b11",
    deviceBody: "#1a1d26",
    deviceEdge: "#2c313d",
  },
  light: {
    name: "light",
    panel: "#ffffff",
    panelRaised: "#f6f8fa",
    border: "#d0d7de",
    hairline: "rgba(15,23,42,0.09)",
    text: "#0b0d12",
    muted: "#57606a",
    faint: "#8c959f",
    chipFill: "#f6f8fa",
    chipStroke: "#d8dee4",
    accent: ["#b45309", "#d97706", "#ea580c"],
    cyan: "#8a6a45",
    amber: ["#d97706", "#ea580c"],
    layers: ["#a16207", "#b45309", "#d97706", "#ea580c", "#c2410c"],
    aurora: { indigo: ["#fcd34d", 0.4], violet: ["#fdba74", 0.36], cyan: ["#fde68a", 0.42], amber: ["#fed7aa", 0.45] },
    grid: "rgba(15,23,42,0.055)",
    slabFace: 0.1,
    slabSide: 0.16,
    screenGlow: 0.3,
    buttonText: "#ffffff",
    deviceBody: "#1f232c",
    deviceEdge: "#3a404d",
  },
};

// Motion: every animation starts from the static, fully visible state.
// Pass any card-specific rules as `extra`; reduced motion always comes last.
export const css = (extra = "") => `${MOTION_CSS}${extra}${REDUCED}`;
const REDUCED = "@media (prefers-reduced-motion: reduce){*{animation:none!important}}";
const MOTION_CSS = `
@keyframes driftA{from{transform:translate(0,0)}to{transform:translate(-80px,36px)}}
@keyframes driftB{from{transform:translate(0,0)}to{transform:translate(60px,-30px)}}
@keyframes driftC{from{transform:translate(0,0)}to{transform:translate(-40px,-44px)}}
@keyframes flow{to{stroke-dashoffset:-24}}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.55}}
.dA{animation:driftA 19s ease-in-out infinite alternate}
.dB{animation:driftB 23s ease-in-out infinite alternate}
.dC{animation:driftC 17s ease-in-out infinite alternate}
.flow{animation:flow 1.6s linear infinite}
.breathe{animation:breathe 4.5s ease-in-out infinite}`;
