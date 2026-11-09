// src/ladder.mjs — the ladder page's logic, pure. tally() reads one rung's committed verdicts as they are (a claim
// marked not testable in that rung's sealed text is counted apart, never as held); totals() adds the rungs up;
// digits() reads Rung 1's held-out file; frames() replays Rung 1's own settle, flip by flip, for the page to show.
import C from '../vendor/settling-cell/src/cell.mjs';

export const B = 4;

/** tally(verdicts, pending) → { measured, held, failed, notTested, failedIds } from a rung's verdicts, or null. */
export function tally(verdicts, pending = []) {
  if (!Array.isArray(verdicts)) return null;
  let held = 0, failed = 0, notTested = 0;
  const failedIds = [];
  for (const v of verdicts) {
    if (pending.includes(v.id)) notTested++;
    else if (v.pass === true) held++;
    else { failed++; failedIds.push(v.id); }
  }
  return { measured: held + failed, held, failed, notTested, failedIds };
}
/** totals(tallies) → the ladder's sums over the rungs whose records loaded (null entries are counted as missing). */
export function totals(tallies) {
  const t = { rungs: 0, missing: 0, measured: 0, held: 0, failed: 0, notTested: 0 };
  for (const x of tallies) {
    if (!x) { t.missing++; continue; }
    t.rungs++; t.measured += x.measured; t.held += x.held; t.failed += x.failed; t.notTested += x.notTested;
  }
  return t;
}
/** digits(text) → [{ x: 64 ink values, y: class }] from a UCI optdigits file; malformed lines are skipped. */
export function digits(text) {
  const out = [];
  for (const line of String(text).split('\n')) {
    const v = line.trim().split(',').map(Number);
    if (v.length !== 65 || v.some((n) => !Number.isInteger(n) || n < 0 || n > 16)) continue;
    if (v[64] > 9) continue;
    out.push({ x: v.slice(0, 64), y: v[64] });
  }
  return out;
}
/** frames(c, pixels) → Rung 1's settle replayed: the ink and the one-step read before any flip and after every flip. */
export function frames(c, pixels) {
  const bits = C.encode(pixels, B), r = C.settle(c, bits, { trace: true });
  if (!r) return null;
  const s = Uint8Array.from(bits), out = [{ ink: C.inkOf(s, B), ...C.readout(c, s), flipped: -1 }];
  for (const i of r.path) { s[i] ^= 1; out.push({ ink: C.inkOf(s, B), ...C.readout(c, s), flipped: i }); }
  return { frames: out, answer: r.answer, fit: r.fit, flips: r.flips, sweeps: r.sweeps };
}
export default { B, tally, totals, digits, frames };
