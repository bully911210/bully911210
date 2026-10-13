// v8 palette: amber on charcoal. Same keys as v5 so v5's helpers still work,
// plus an `iso` block: the materials the isometric engine shades.
// Every material is a [shadow, lit] pair; the engine mixes between them by
// the dot product of each face normal with the light direction.
import { THEMES as BASE } from "../../v5/src/theme.mjs";

export const W = 1200;

export const THEMES = {
  dark: {
    ...BASE.dark,
    panel: "#0d0c0b",
    panelRaised: "#15130f",
    border: "#30363d",
    hairline: "rgba(255,236,200,0.08)",
    text: "#f6f3ee",
    muted: "#aaa398",
    faint: "#7a7368",
    chipFill: "rgba(255,236,200,0.04)",
    chipStroke: "rgba(255,236,200,0.12)",
    grid: "rgba(255,214,150,0.05)",
    deviceBody: "#1d1b17",
    deviceEdge: "#38332b",
    iso: {
      steel: ["#16140f", "#4a443b"],
      plinth: ["#121110", "#2c2924"],
      ground: ["#0f0e0c", "#1b1915"],
      amber: ["#7a3d00", "#ffc53d"],
      pipe: ["#1d1a15", "#6d6455"],
      line: "rgba(255,226,170,0.32)",
      edge: "rgba(255,226,170,0.16)",
      groove: "#080706",
      screen: "#0b0a08",
      ink: "#f6f3ee",
      lead: "#ffc53d",
      lamp: "#ffc53d",
      signal: "#ff8a00",
    },
  },
  light: {
    ...BASE.light,
    panel: "#ffffff",
    panelRaised: "#f8f6f3",
    border: "#d0d7de",
    hairline: "rgba(40,30,15,0.10)",
    text: "#14110d",
    muted: "#5d564c",
    faint: "#8a8378",
    chipFill: "#f8f6f3",
    chipStroke: "#e2ddd5",
    grid: "rgba(120,80,20,0.06)",
    deviceBody: "#24211c",
    deviceEdge: "#3d382f",
    iso: {
      steel: ["#cfc8bd", "#ffffff"],
      plinth: ["#ddd6cb", "#fbfaf7"],
      ground: ["#efebe4", "#fbfaf7"],
      amber: ["#9a3412", "#f59e0b"],
      pipe: ["#a69d90", "#f4f1ec"],
      line: "rgba(50,38,20,0.55)",
      edge: "rgba(50,38,20,0.22)",
      groove: "#2a241c",
      screen: "#1c1915",
      ink: "#14110d",
      lead: "#ffc53d",
      lamp: "#d97706",
      signal: "#ea580c",
    },
  },
};

export const css = (extra = "") => `${extra}@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;
