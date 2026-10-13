// v10: v8 "Build the pipe" plus v9's floor as chapter 02: an isometric plant. Reads ../data/snapshot.json and
// writes generated/<name>-{dark,light}.svg plus README.md and copy.txt.
// Deterministic: no clocks, seeded randomness only.
// Usage: node generate.mjs [visual-name]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { THEMES } from "./src/theme.mjs";
import { hero } from "./src/hero.mjs";
import { floorPlan } from "./src/floor.mjs";
import { stackCity } from "./src/city.mjs";
import { receipts } from "./src/receipts.mjs";
import { homecastIso } from "./src/homecast.mjs";
import { whereItRuns } from "./src/where.mjs";
import { readme } from "./src/readme.mjs";
import { copyText } from "./src/copy.mjs";
import { sectionHeader, button } from "../v5/src/sections.mjs";
import { claudeModsCardV2, nanowallCardV2, vsmCardV2, snipeLoopCardV2 } from "./src/products.mjs";

const ROOT = new URL("./", import.meta.url);
const OUT = new URL("generated/", ROOT);
const data = JSON.parse(readFileSync(new URL("../data/snapshot.json", ROOT), "utf8"));

export const SECTIONS = {
  projects: { eyebrow: "04  ·  SHIPPED IN PUBLIC", title: "Open source.", sub: "I give away the working system. Taking it from 1 to 100 is the work you do in your business." },
  contact: { eyebrow: "07  ·  CONTACT", title: "Let's talk.", sub: "Revenue systems, dialler integrations, or anything between an ad click and a paid invoice." },
};

export const VISUALS = {
  hero: (t, d) => hero(t, d),
  floor: (t) => floorPlan(t),
  stack: (t, d) => stackCity(t, d),
  receipts: (t, d) => receipts(t, d),
  homecast: (t, d) => homecastIso(t, d),
  "claude-code-mods": (t, d) => claudeModsCardV2(t, d),
  nanowall: (t, d) => nanowallCardV2(t, d),
  "vsm-for-ai-agents": (t, d) => vsmCardV2(t, d),
  "snipe-loop": (t) => snipeLoopCardV2(t),
  "section-projects": (t) => sectionHeader(t, SECTIONS.projects),
  "btn-homecast": (t) => button(t, { label: "Download for Windows", icon: "download", primary: true }),
  "btn-ccm-demo": (t) => button(t, { label: "Try the interactive demo", icon: "play", primary: true }),
  "where-it-runs": (t) => whereItRuns(t),
  "section-contact": (t) => sectionHeader(t, SECTIONS.contact),
  "btn-email": (t) => button(t, { label: "franz@sigsolutions.co.za", icon: "mail", primary: true }),
  "btn-linkedin": (t) => button(t, { label: "LinkedIn", icon: "arrow" }),
  "btn-x": (t, d) => button(t, { label: `@${d.user.twitter}`, icon: "arrow" }),
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const only = process.argv[2];
  for (const [name, render] of Object.entries(VISUALS)) {
    if (only && only !== name) continue;
    for (const t of Object.values(THEMES)) {
      const out = render(t, data);
      if (out.includes("NaN")) throw new Error(`${name}-${t.name}: NaN in output`);
      writeFileSync(new URL(`${name}-${t.name}.svg`, OUT), out);
    }
  }
  if (!only) {
    const md = readme(data);
    writeFileSync(new URL("README.md", ROOT), md);
    writeFileSync(new URL("copy.txt", ROOT), copyText(data, SECTIONS, md));
  }
}

await main();
