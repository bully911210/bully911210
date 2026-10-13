// README.md assembly. Every visual is a themed <picture>; anything that is a
// destination is wrapped in its own link. Alt text says what the picture says.
import { esc } from "../../lib/svg.mjs";
import { districts } from "./city.mjs";
import { BUSINESSES } from "./where.mjs";

const GH = "https://github.com/bully911210";

export function picture(name, alt, { width = "100%", height } = {}) {
  const size = height ? `height="${height}"` : `width="${width}"`;
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="generated/${name}-dark.svg"><source media="(prefers-color-scheme: light)" srcset="generated/${name}-light.svg"><img alt="${esc(alt)}" src="generated/${name}-light.svg" ${size}></picture>`;
}

const link = (href, inner) => `<a href="${href}">${inner}</a>`;

export function readme(data) {
  const t = data.totals;
  const u = data.user;
  const share = Math.round((100 * t.privateContributionsLastYear) / t.contributionsLastYear);
  const stackAlt = districts(data).map((d) => `${d.key.toLowerCase()}: ${d.items.map((i) => `${i.label} ${i.count}`).join(", ")}`).join("; ");
  const mb = (t.languageBytes / 1e6).toFixed(1);
  return `<div align="center">

${picture("hero", "Franz Badenhorst, revenue infrastructure engineer, Pretoria. I fix what happens after the lead comes in. Most businesses don't have a marketing problem. They have an operational delay problem. Below, his revenue system drawn as one isometric plant, six systems in one loop: 01 lead lands, a Meta Lead Ads webhook; 02 straight to dial, a lead to dialler bridge into ViciDial; 03 on the call, speech-to-form fills the record while the agent talks; 04 closed, client apps on Supabase; 05 counted, read-only web reports synced every minute; 06 back to the ad, where live spend picks the creative. Leads flow through the pipes; a return pipe carries the spend signal back to the ad.")}

${picture("floor", "02, on the floor. The same loop, played out on a floor plan, an illustration and not live data: leads from ad creatives A, B and C pass the webhook (1) and the dialler (2) and go to the next free desk; desks light when a call connects and speech-to-form fills the record (3); sales go to client apps on Supabase for applications, referrals and appointments (4); the reports board recounts every minute (5); and live spend picks the creative (6).")}

${picture("stack", `Full stack, literally: an isometric city of ${t.repos} repositories, ${t.privateRepos} of them private. Each tower is a technology and its height is how many repos depend on it. ${stackAlt}. The city stands on ${mb} MB of code, layered by language.`)}

${picture("section-projects", "04, shipped in public. Open source. I give away the working system. Taking it from 1 to 100 is the work you do in your business.")}

${link(`${GH}/homecast`, picture("homecast", "HomeCast, drawn as a PC and a TV inside a wireframe house: your PC's films, music and photos on any TV browser on your home Wi-Fi. One exe with NVENC, QSV and AMF encoding, a 9.3 KB TV client, no cloud and no accounts."))}

${link(`${GH}/homecast/releases/latest/download/HomeCast-win-x64.zip`, picture("btn-homecast", "Download HomeCast for Windows", { height: 50 }))}

${link(`${GH}/claude-code-mods`, picture("claude-code-mods", "claude-code-mods, drawn as a Claude Code window with three mods in place: token-ledger, plan limits in a row above the prompt and a ? that asks Haiku what to ask next; next-steps, suggested prompts you tick and insert in order; auto-docs, a follow-up docs commit that keeps the README in step."))}

${link("https://bully911210.github.io/claude-code-mods/", picture("btn-ccm-demo", "Try the claude-code-mods interactive demo", { height: 50 }))}

${link(`${GH}/nanowall`, picture("nanowall", "nanowall: family photos in, an identity-locked 50-wallpaper Windows desktop carousel out, made with Nano Banana Pro.", { width: "49%" }))} ${link(`${GH}/vsm-for-ai-agents`, picture("vsm-for-ai-agents", "vsm-for-ai-agents: a supervised virtual secondary monitor for Windows. The AI agent works on its own screen in Monitor, Mini or Hide mode, and a human takes over with one click.", { width: "49%" }))}

${link(`${GH}/snipe-loop`, picture("snipe-loop", "snipe-loop: an agent skill that sweeps Facebook Marketplace and AutoTrader for underpriced listings, sends snipe cards to WhatsApp and retunes its sweep from how the market grades its picks."))}

${picture("receipts", `04, count the stock. If it isn't documented, it didn't happen. ${t.contributionsLastYear} contributions in the last 12 months, ${share}% in private repositories, ${t.commitsOnDefaultBranches} commits on default branches, ${t.prsLastYear} pull requests and ${t.reposCreatedLastYear} new repositories, drawn as one pallet per week and one crate per day.`)}

${picture("where-it-runs", `05, where it runs. SIG Solutions, an outbound call centre: built by operators, priced like a partner. Then ${BUSINESSES.map((b) => `${b.name}, ${b.line.replace(/\.$/, "")}`).join("; ")}.`)}

<sub>${[["SIG Solutions", "https://sigsolutions.co.za"], ...BUSINESSES.map((b) => [b.name, b.url])].map(([n, href]) => `<a href="${href}">${n}</a>`).join(" &nbsp;·&nbsp; ")}</sub>

${picture("section-contact", "06, contact. Let's talk: revenue systems, dialler integrations, or anything between an ad click and a paid invoice.")}

${link("mailto:franz@sigsolutions.co.za", picture("btn-email", "Email franz@sigsolutions.co.za", { height: 50 }))} ${link("https://linkedin.com/in/franzbadenhorst", picture("btn-linkedin", "Franz Badenhorst on LinkedIn", { height: 50 }))} ${link(`https://x.com/${u.twitter}`, picture("btn-x", `@${u.twitter} on X`, { height: 50 }))}

</div>
`;
}
