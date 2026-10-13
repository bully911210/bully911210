// The floor simulation: a seeded discrete-event model of one short loop on
// an outbound floor. Leads arrive from three ad creatives in proportion to
// live spend, go through the webhook and the dialler straight to the
// longest-idle free desk, the call fills the form, some calls close, sales
// are counted on the minute, and the count moves spend toward the creative
// that sells. Every number here is synthetic and never printed; the model
// only drives timing.
import { rng } from "./random9.mjs";

export const LOOP = 30; // seconds per loop
export const TICK = 5; // a "minute" of reporting, compressed
export const FEEDBACK_LAG = 1.6; // seconds for a count to travel back to the ads

const CREATIVES = [
  { key: "A", close: 0.12 },
  { key: "B", close: 0.48 },
  { key: "C", close: 0.24 },
];

/**
 * Runs the model. `desks` is a list of desk ids; `travel(lead, desk)`
 * returns the seconds a lead takes from its creative to that desk, and
 * `saleTravel(desk)` the seconds a sale takes to reach the client apps.
 */
export function simulate({ desks, travel, saleTravel, seed = 280 }) {
  const r = rng(seed);
  const free = new Map(desks.map((d) => [d, -1 - r()])); // desk -> free-from time
  let share = CREATIVES.map(() => 1 / CREATIVES.length);
  const shares = [{ t: 0, share }];
  const leads = [];
  const sales = [];
  const leadsBy = CREATIVES.map(() => 0);
  let t = 0.4;
  let nextTick = TICK;
  const ticks = [];
  while (t < LOOP - 10) {
    // Count on the minute: sales that reached the client apps by now.
    while (t >= nextTick) {
      const counted = CREATIVES.map((_, i) => sales.filter((s) => s.creative === i && s.at <= nextTick).length);
      const rate = counted.map((c, i) => (c + 1) / (leadsBy[i] + 3));
      const sum = rate.reduce((a, b) => a + b, 0);
      share = share.map((s, i) => 0.45 * s + 0.55 * (rate[i] / sum));
      ticks.push({ t: nextTick, counted, share });
      shares.push({ t: nextTick + FEEDBACK_LAG, share });
      nextTick += TICK;
    }
    // Pick the creative by current spend share.
    let u = r(), creative = 0;
    while (creative < share.length - 1 && u > share[creative]) u -= share[creative++];
    leadsBy[creative]++;
    // Longest-idle free desk: the dialler never lets a lead wait for a person.
    const lead = { id: leads.length, creative, t0: t };
    const candidates = [...free.entries()].filter(([, at]) => at <= t + 1.5).sort((a, b) => a[1] - b[1]);
    const [desk] = candidates[0] ?? [...free.entries()].sort((a, b) => a[1] - b[1])[0];
    lead.desk = desk;
    lead.t1 = t + travel(lead, desk); // reaches the desk: the dial
    lead.callEnd = lead.t1 + 3.2 + r() * 3.6;
    lead.sold = r() < CREATIVES[creative].close;
    free.set(desk, lead.callEnd + 0.4);
    leads.push(lead);
    if (lead.sold) sales.push({ lead: lead.id, creative, desk, t0: lead.callEnd, at: lead.callEnd + saleTravel(desk) });
    t += -Math.log(1 - r()) / 1.35; // about 1.35 leads a second
  }
  // Finish the counting ticks for the rest of the loop.
  while (nextTick < LOOP) {
    const counted = CREATIVES.map((_, i) => sales.filter((s) => s.creative === i && s.at <= nextTick).length);
    const rate = counted.map((c, i) => (c + 1) / (leadsBy[i] + 3));
    const sum = rate.reduce((a, b) => a + b, 0);
    share = share.map((s, i) => 0.45 * s + 0.55 * (rate[i] / sum));
    ticks.push({ t: nextTick, counted, share });
    if (nextTick + FEEDBACK_LAG < LOOP) shares.push({ t: nextTick + FEEDBACK_LAG, share });
    nextTick += TICK;
  }
  return { leads, sales, ticks, shares, creatives: CREATIVES.map((c) => c.key) };
}

/** Shapes the state at time `at`, for the static frame. */
export function stateAt(sim, at) {
  const onCall = new Set(sim.leads.filter((l) => l.t1 <= at && at < l.callEnd).map((l) => l.desk));
  const share = [...sim.shares].reverse().find((s) => s.t <= at).share;
  const tick = [...sim.ticks].reverse().find((k) => k.t <= at) ?? { counted: sim.creatives.map(() => 0) };
  return { onCall, share, counted: tick.counted };
}

/**
 * SMIL keyframes from (time, value) steps over one loop. Discrete: each
 * value holds until the next step. Returns keyTimes and values strings.
 */
export function steps(points, initial) {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  const kt = [0], vals = [initial];
  for (const [time, v] of sorted) {
    const k = Math.min(0.9999, Math.max(0, time / LOOP));
    if (k <= kt.at(-1)) { vals[vals.length - 1] = v; continue; }
    kt.push(k);
    vals.push(v);
  }
  return { keyTimes: kt.map((k) => k.toFixed(4)).join(";"), values: vals.join(";") };
}

/** Linear keyframes from (time, value) points, strictly increasing in time. */
export function ramps(points, initial) {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  const kt = [0], vals = [initial];
  for (const [time, v] of sorted) {
    let k = Math.min(0.9999, Math.max(0, time / LOOP));
    if (k <= kt.at(-1)) k = kt.at(-1) + 0.0001;
    kt.push(k);
    vals.push(v);
  }
  kt.push(1);
  vals.push(initial);
  return { keyTimes: kt.map((k) => k.toFixed(4)).join(";"), values: vals.map((v) => +(+v).toFixed(1)).join(";") };
}
