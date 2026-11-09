// app.mjs — the ladder page's glue. Every count is read live from each rung's committed record (same origin on GitHub
// Pages) and tallied by src/ladder.mjs; the settle demo is Rung 1's own cell, replayed by src/ladder.mjs. No measured
// number is typed into index.html.
import { mintCase, sourcesOf } from './vendor/liveware/mintcase.mjs';
import Lad from './src/ladder.mjs';
import C from './vendor/settling-cell/src/cell.mjs';
const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) if (k === 'class') e.className = v; else e.setAttribute(k, v); for (const c of kids) e.append(c); return e; };
const json = (p) => fetch(p).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const text = (p) => fetch(p).then((r) => (r.ok ? r.text() : null)).catch(() => null);
const SITE = 'https://sjgant80-hub.github.io/';
const RUNGS = [
  { n: 1, repo: 'settling-cell', q: 'Can a network compute a real task by settling?', showed: 'Settling reads unseen handwriting and ranks real digits far above scrambled ones. But reading the same shape in one step did better than settling, and a nearest-neighbour baseline beat it.' },
  { n: 2, repo: 'code-rsi', q: 'Can code improve the shape with no model, on fresh exams each cycle?', showed: 'Yes: the model-free loop improved the shape a long way and beat its frozen-weights twin. The evolved shape still did not read reliably better by settling than in one step.' },
  { n: 3, repo: 'hybrid-gate', q: 'Settling where it fits, exact code for exact work, the gate readable?', showed: 'Exact code behind the settle cut wrong accepts sharply, and every decision carried its reason. Accepted numbers were not right often enough, and repairs were right less than half the time.' },
  { n: 4, repo: 'mesh-share', q: 'Does a shape from node A improve node B over signed messages?', showed: 'Yes, and every forgery was refused before parsing; a validly signed bad shape was refused by the receiver\'s own exam. Every claim held.' },
  { n: 5, repo: 'geometric-defence', q: 'Is an attack a shape that won\'t settle?', showed: 'The signature floor refused every tampered message and mimics were rejected. But scrambled digits settle into real digits\' wells and pass, and a harmless-looking share was adopted.' },
  { n: 6, repo: 'nested-fabric', q: 'Do clusters plus wide sharing degrade gracefully under node and link loss?', showed: 'Yes: sharing beat isolation, and losing a quarter or half of the nodes, or 30% of the messages, stayed within the bars. Every adoption was earned and every rogue refused. The nodes themselves stayed weak, after only a few dozen cycles each.' },
  { n: 7, repo: 'chip-immune', q: 'Does the whole layer fit a small device and fail safe?', pending: ['CI1'], showed: 'On an emulator: the whole layer fits a small device\'s memory, settles exactly as Rung 1\'s cell, and failed safe under every injected fault. But it never improved itself: its own keep rule could not be met, and attacks that pass settle onto real patterns. Not yet run on a real chip.' },
];
const base = () => '../';
async function ladder() {
  const recs = await Promise.all(RUNGS.map((r) => json(base() + r.repo + '/data/record.json')));
  const tallies = recs.map((j, i) => (j ? Lad.tally(j.verdicts, RUNGS[i].pending || []) : null)), t = Lad.totals(tallies);
  $('verdictline').textContent = t.rungs
    ? 'Across ' + t.rungs + ' rungs, ' + t.held + ' of ' + t.measured + ' measured claims held and ' + t.failed + ' failed and are kept' + (t.notTested ? '; ' + t.notTested + ' could not be tested here (no chip in hand)' : '') + '.' + (t.missing ? ' ' + t.missing + ' records did not load.' : '')
    : 'The rungs\' records did not load here; open this page on its live site.';
  const tb = $('ladder').querySelector('tbody'); tb.replaceChildren();
  RUNGS.forEach((r, i) => {
    const x = tallies[i], j = recs[i];
    const fails = x && x.failedIds.length ? el('span', {}, ...x.failedIds.map((id, k) => el('span', { title: (j.verdicts.find((v) => v.id === id) || {}).what || '' }, (k ? ', ' : '') + id))) : (x ? 'none' : '—');
    tb.append(el('tr', {}, el('td', {}, el('a', { href: SITE + r.repo + '/' }, el('b', {}, String(r.n)), ' · ' + r.repo)), el('td', {}, r.q), el('td', { class: 'num' }, x ? x.held + ' of ' + x.measured + (x.notTested ? ' (' + x.notTested + ' not tested)' : '') : 'did not load'), el('td', {}, fails), el('td', {}, r.showed)));
  });
  const pl = $('paper-list'); pl.replaceChildren();
  RUNGS.forEach((r, i) => { const j = recs[i]; if (!j) return; pl.append(el('li', {}, el('b', {}, 'Rung ' + r.n + ' · ' + r.repo + ': '), j.verdicts.map((v) => v.id + (r.pending && r.pending.includes(v.id) ? ' not tested' : v.pass ? ' held' : ' failed')).join(', ') + '.')); });
  $('finding-text').textContent = 'Read across the rungs, one pattern repeats. The structure around the cell held: signatures checked on raw bytes, each receiver\'s own exam before any change, exact code behind the fuzzy reader, signed sharing between nodes, and a layer that fails safe. The settle itself, as a computation, kept losing information: settling never reliably beat reading the same shape in one step, and an attack that settles into a real digit\'s well looks, at the settled state, like that digit.';
  $('finding-list').replaceChildren(...[['What held', 'the trust machinery: sealing, signatures, own-exam gates, exact code, fail-safe memory, determinism.'], ['What failed, more than once', 'settling against a one-step read (Rungs 1 and 2), and the settled fit as an attack detector (Rungs 5 and 7).'], ['What it means for the next step', 'read first and settle second, as a check, not as the reader; and look for the attack before the settle erases it.']].map(([a, b]) => el('li', {}, el('b', {}, a + ': '), b)));
  $('parts').replaceChildren(...RUNGS.map((r) => el('div', { class: 'card' }, el('div', { class: 'k' }, 'Rung ' + r.n), el('p', { style: 'font-size:14.5px;margin-top:4px' }, el('a', { href: SITE + r.repo + '/' }, r.repo), ' · ', el('a', { href: 'https://github.com/sjgant80-hub/' + r.repo }, 'source')), el('p', { class: 'muted', style: 'font-size:13px;margin-top:4px' }, r.q))));
}
let CELLS = {}, CELL = null, DIGITS = [], RUN = null, K = 0, TIMER = null;
const INK = ['--px0', '--px1'];
function draw(frame) {
  const cv = $('w-canvas'), g = cv.getContext('2d'), st = getComputedStyle(document.documentElement), on = st.getPropertyValue(INK[1]).trim() || '#000', off = st.getPropertyValue(INK[0]).trim() || '#fff', s = cv.width / 8;
  g.fillStyle = off; g.fillRect(0, 0, cv.width, cv.height);
  frame.ink.forEach((v, p) => { if (!v) return; g.globalAlpha = v / Lad.B; g.fillStyle = on; g.fillRect((p % 8) * s, Math.floor(p / 8) * s, s, s); });
  g.globalAlpha = 1;
  if (frame.flipped >= 0) { const p = Math.floor(frame.flipped / Lad.B); g.strokeStyle = st.getPropertyValue('--accent').trim() || '#3f6b47'; g.lineWidth = 3; g.strokeRect((p % 8) * s + 1.5, Math.floor(p / 8) * s + 1.5, s - 3, s - 3); }
  $('w-read').textContent = frame.answer < 0 ? 'no class (zero fit)' : 'reads as ' + frame.answer;
  $('w-fit').textContent = 'fit ' + frame.fit.toLocaleString('en-GB') + ' · flip ' + K + ' of ' + (RUN.frames.length - 1);
}
function load() {
  stop();
  CELL = CELLS[$('w-cell').value] || CELLS.r1;
  const i = Math.max(0, Math.min(DIGITS.length - 1, Math.floor(Number($('w-i').value) || 0))), d = DIGITS[i], mode = $('w-mode').value;
  const x = mode === 'noise' ? C.noisy(d.x, 16, 5000 + i) : mode === 'scrambled' ? C.scrambled(d.x, 5000 + i) : d.x;
  RUN = Lad.frames(CELL, x); K = 0; draw(RUN.frames[0]);
  const settledTo = RUN.answer < 0 ? 'no class' : String(RUN.answer), firstRead = RUN.frames[0].answer < 0 ? 'no class' : String(RUN.frames[0].answer);
  $('w-what').textContent = (mode === 'scrambled' ? 'An attack: a ' + d.y + ' with its pixels shuffled.' : 'A handwritten ' + d.y + (mode === 'noise' ? ', with a quarter of its pixels replaced at random.' : ', from a writer the cell never saw.')) + ' Read in one step it is ' + firstRead + '; settled, it is ' + settledTo + ', after ' + RUN.flips + ' flips' + (mode === 'scrambled' && RUN.fit > 0 ? ' — and the settled state has a real fit, so a fit-check alone would let it through.' : '.');
}
function step() { if (!RUN || K === RUN.frames.length - 1) { stop(); return false; } K++; draw(RUN.frames[K]); return true; }
function stop() { if (TIMER) clearInterval(TIMER); TIMER = null; $('w-play').textContent = 'Settle it'; }
$('w-play').onclick = () => { if (TIMER) { stop(); return; } if (!RUN || K === RUN.frames.length - 1) load(); $('w-play').textContent = 'Pause'; TIMER = setInterval(() => { if (!step()) stop(); }, 90); };
$('w-step').onclick = () => { if (!RUN) load(); step(); };
for (const id of ['w-i', 'w-mode', 'w-cell']) $(id).addEventListener('change', load);
const gbp = (x) => '£' + Math.round(x).toLocaleString('en-GB');
let BASIS = null;
function renderCost() {
  if (!BASIS) { $('c-head').textContent = 'The sourced basis did not load; reload the page.'; return; }
  const v = (id) => Number($(id).value);
  const r = mintCase(BASIS, { hoursPerWeek: v('c-hours'), share: v('c-share') / 100, seats: v('c-seats'), casesPerWeek: v('c-cases'), years: v('c-years') });
  if (!r.ok) { $('c-head').textContent = 'Check the inputs: ' + r.why + '.'; return; }
  const yrs = r.inputs.years + (r.inputs.years === 1 ? ' year' : ' years');
  $('c-overh').textContent = 'Over ' + yrs;
  $('c-head').textContent = `This process costs you ${gbp(r.perYear.today)} a year in staff time today. Owning it: ${gbp(r.perYear.own)} a year, which is ${gbp(r.savingPerYear)} a year back and ${gbp(r.savingOver)} over ${yrs}.`;
  const rows = [['Today', 'Your team does all of it.', 'today'], ['Rent AI assistant seats', `Microsoft 365 Copilot for ${r.inputs.seats} people (${gbp(r.lines.seats)} a year). It helps each person; the work, and the staff time, stay.`, 'rentSeats'],
    ['Call a cloud AI on every case', `Takes the same share off, billed per case at Claude Sonnet 5 API rates (${gbp(r.lines.api)} a year at your volume), and every case leaves your building.`, 'cloudApi'],
    ['Own it', `Takes the same share off on a machine you already have, for about ${gbp(r.lines.power)} a year of electricity. No seats, no meter, nothing leaves.`, 'own']];
  const tb = $('c-table').querySelector('tbody'); tb.replaceChildren();
  for (const [a, b, k] of rows) tb.append(el('tr', {}, el('td', {}, el('b', {}, a)), el('td', {}, b), el('td', { class: 'num' }, gbp(r.perYear[k])), el('td', { class: 'num' }, gbp(r.over[k]))));
  $('c-note').textContent = `Owning beats the cloud route by ${gbp(r.versusCloudOver)} over ${yrs} at this volume. Staff time is a floor: the UK median wage, with on-costs left out.`;
  $('c-board').textContent = `Seven sealed builds tested a new way to compute and published what failed. The trust machinery held and carries over to whatever reader you use. Pick one process you run by hand. Today it costs ${gbp(r.perYear.today)} a year in staff time. If an owned system takes off the share you estimate, that is ${gbp(r.savingPerYear)} a year back, with nothing leaving the building, and the fee is due only on a receipt that it beat your current way on your own data.`;
}
async function main() {
  const [cellText, nodeText, tes] = await Promise.all([text('vendor/settling-cell/data/cell.txt'), text('vendor/mesh-share/data/cell-after.txt'), text('vendor/settling-cell/data/optdigits.tes')]);
  BASIS = await json('vendor/liveware/basis.json');
  $('c-src').replaceChildren(...sourcesOf(BASIS || {}).map((s) => { const li = el('li', {}, s.what + (s.source ? ': ' : '')); if (s.source) { const a = el('a', { href: s.source, target: '_blank', rel: 'noopener' }); try { a.textContent = new URL(s.source).hostname; } catch { a.textContent = s.source; } li.append(a); } return li; }));
  for (const id of ['c-hours', 'c-share', 'c-seats', 'c-cases', 'c-years']) $(id).addEventListener('input', renderCost);
  renderCost();
  const f = cellText && C.parseCell(cellText), g = nodeText && C.parseCell(nodeText);
  if (f && g && tes) { CELLS = { r1: C.cell(f.shape, { R: f.R, n: f.n }), r4: C.cell(g.shape, { R: g.R, n: g.n }) }; DIGITS = Lad.digits(tes); $('w-i').max = String(DIGITS.length - 1); load(); $('w-status').textContent = 'running in your tab'; }
  else $('w-status').textContent = 'the cell did not load; reload the page';
  ladder();
}
main();
