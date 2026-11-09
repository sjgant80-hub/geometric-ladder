// The ladder's logic: the tally reads verdicts exactly as committed, the totals add up, the digit reader takes only
// well-formed lines, and the replay is Rung 1's own settle, flip for flip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Lad from '../src/ladder.mjs';
import C from '../vendor/settling-cell/src/cell.mjs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const f = C.parseCell(read('vendor/settling-cell/data/cell.txt')), cell = C.cell(f.shape, { R: f.R, n: f.n });

test('tally: held, failed and not-tested, counted apart', () => {
  const v = [{ id: 'A', pass: true }, { id: 'B', pass: false }, { id: 'P', pass: false }, { id: 'C', pass: true }, { id: 'D', pass: 'yes' }];
  assert.deepEqual(Lad.tally(v, ['P']), { measured: 4, held: 2, failed: 2, notTested: 1, failedIds: ['B', 'D'] });
  assert.deepEqual(Lad.tally(v), { measured: 5, held: 2, failed: 3, notTested: 0, failedIds: ['B', 'P', 'D'] });
  assert.deepEqual(Lad.tally([], ['P']), { measured: 0, held: 0, failed: 0, notTested: 0, failedIds: [] });
  assert.deepEqual(Lad.tally([{ id: 'P', pass: true }], ['P']), { measured: 0, held: 0, failed: 0, notTested: 1, failedIds: [] }, 'a pending claim is never held');
  assert.equal(Lad.tally(null), null);
  assert.equal(Lad.tally({ verdicts: [] }), null);
});
test('totals: sums over the loaded rungs, the missing counted', () => {
  const a = { measured: 9, held: 5, failed: 4, notTested: 0 }, b = { measured: 6, held: 5, failed: 1, notTested: 1 };
  assert.deepEqual(Lad.totals([a, null, b]), { rungs: 2, missing: 1, measured: 15, held: 10, failed: 5, notTested: 1 });
  assert.deepEqual(Lad.totals([]), { rungs: 0, missing: 0, measured: 0, held: 0, failed: 0, notTested: 0 });
});
test('digits: only well-formed optdigits lines', () => {
  const good = Array.from({ length: 64 }, (_, i) => i % 17).join(',');
  assert.deepEqual(Lad.digits(good + ',7\n'), [{ x: Array.from({ length: 64 }, (_, i) => i % 17), y: 7 }]);
  assert.deepEqual(Lad.digits(' ' + good + ',0 \r\n' + good + ',9'), [{ x: Array.from({ length: 64 }, (_, i) => i % 17), y: 0 }, { x: Array.from({ length: 64 }, (_, i) => i % 17), y: 9 }]);
  for (const bad of [good, good + ',10', good + ',-1', good + ',3,3', good.replace(/^0/, '17') + ',3', good.replace(/^0/, '-1') + ',3', good.replace(/^0/, '1.5') + ',3', good.replace(/^0/, 'x') + ',3', ''])
    assert.deepEqual(Lad.digits(bad), [], 'refused: ' + bad.slice(0, 12) + '…' + bad.slice(-6));
  assert.deepEqual(Lad.digits(good.replace(/^0/, '16') + ',3')[0].x[0], 16, 'ink 16 is the top of the scale');
  const all = Lad.digits(read('vendor/settling-cell/data/optdigits.tes'));
  assert.equal(all.length, 1797, 'the UCI held-out file has 1,797 digits');
  assert.equal(Lad.B, 4);
});
test('frames: Rung 1\'s settle replayed flip by flip, ending where the settle ends', () => {
  const ds = Lad.digits(read('vendor/settling-cell/data/optdigits.tes'));
  let moved = 0;
  for (const d of ds.slice(0, 40)) {
    const r = Lad.frames(cell, d.x), s = C.settle(cell, C.encode(d.x, 4), { trace: true });
    assert.equal(r.frames.length, s.flips + 1);
    assert.deepEqual([r.answer, r.fit, r.flips, r.sweeps], [s.answer, s.fit, s.flips, s.sweeps]);
    assert.deepEqual(r.frames[0].ink, d.x.map((v) => [2, 6, 10, 14].filter((t) => v >= t).length), 'the first frame is the encoded digit');
    assert.deepEqual(r.frames[0], { ink: r.frames[0].ink, ...C.readout(cell, C.encode(d.x, 4)), flipped: -1 });
    const last = r.frames[r.frames.length - 1];
    assert.deepEqual([last.answer, last.fit], [s.answer, s.fit], 'the last frame reads what the settle settled to');
    assert.deepEqual(last.ink, C.inkOf(s.state, 4));
    assert.deepEqual(r.frames.slice(1).map((x) => x.flipped), s.path);
    for (let k = 1; k !== r.frames.length; k++) assert.ok(r.frames[k].fit > r.frames[k - 1].fit, 'every flip raises the fit');
    if (s.flips > 0) moved++;
  }
  assert.ok(moved > 10, 'the settle moves most digits: ' + moved);
  assert.equal(Lad.frames(cell, [1, 2, 3]), null);
  assert.equal(Lad.frames(null, ds[0].x), null);
});
