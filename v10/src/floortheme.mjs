// "The floor": a wallboard palette. Amber LED on matte warm black in dark
// mode; amber ink on warm off-white in light mode. Same keys in both themes,
// so every visual is written once and rendered twice.

export const W = 1200;

export const THEMES = {
  dark: {
    name: "dark",
    panel: "#0d0c0a",
    raised: "#151310",
    well: "#070605",
    border: "#30363d",
    rule: "#2a2621",
    hairline: "rgba(255,236,200,0.09)",
    text: "#f4efe6",
    muted: "#aaa194",
    faint: "#7b7367",
    chipFill: "rgba(255,240,210,0.04)",
    chipStroke: "rgba(255,240,210,0.12)",
    accent: ["#ffc53d", "#ffb000", "#ff8a00"],
    led: "#ffb000",
    ledHot: "#ffc53d",
    ledDeep: "#ff8a00",
    ledOff: "rgba(255,176,0,0.10)",
    ledLevels: [0.28, 0.5, 0.75, 1],
    glow: true,
    screw: "#24211c",
    screwSlot: "#3b362e",
    floor: "#100f0c",
    wall: "#3a352d",
    desk: "#1b1915",
    deskEdge: "#3a352d",
    ink: "#0d0c0a",
    layers: ["#ffd27a", "#ffc53d", "#ffb000", "#ff9500", "#ff7a1a"],
  },
  light: {
    name: "light",
    panel: "#fbf9f4",
    raised: "#f4f0e7",
    well: "#f2ede3",
    border: "#d0d7de",
    rule: "#e2dccf",
    hairline: "rgba(60,40,10,0.11)",
    text: "#1c1810",
    muted: "#5d554a",
    faint: "#8a8174",
    chipFill: "#f4f0e7",
    chipStroke: "#ddd5c6",
    accent: ["#b45309", "#d97706", "#ea580c"],
    led: "#b45309",
    ledHot: "#c2410c",
    ledDeep: "#9a3412",
    ledOff: "rgba(180,83,9,0.13)",
    ledLevels: [0.3, 0.52, 0.76, 1],
    glow: false,
    screw: "#e7e1d5",
    screwSlot: "#bdb4a4",
    floor: "#f6f2ea",
    wall: "#b9b0a0",
    desk: "#ece6da",
    deskEdge: "#c9c0b0",
    ink: "#fffaf0",
    layers: ["#92400e", "#b45309", "#d97706", "#ea580c", "#c2410c"],
  },
};

const REDUCED = "@media (prefers-reduced-motion: reduce){*{animation:none!important}}";
/** CSS for a visual: card-specific rules, then reduced motion last. */
export const css = (extra = "") => `${extra}${REDUCED}`;

/** LED bloom in dark mode only; light mode is flat ink. */
export const glowFilter = (t, id = "bloom") =>
  t.glow
    ? `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feComponentTransfer in="b" result="b2"><feFuncA type="linear" slope="0.75"/></feComponentTransfer><feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : "";

export const bloom = (t, id = "bloom") => (t.glow ? ` filter="url(#${id})"` : "");
