// The ladder page: every vendored file pinned (and Rung 1's cell and held-out file the ones Rung 1 sealed), no measured
// number typed in, every rung linked, the failures told, the page explains itself, talks only to itself, carries its credits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
const ROOT = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const sha = (p) => createHash('sha256').update(readFileSync(new URL(p, ROOT))).digest('hex');
const html = read('index.html'), app = read('app.mjs');
const REPOS = ['settling-cell', 'code-rsi', 'hybrid-gate', 'mesh-share', 'geometric-defence', 'nested-fabric', 'chip-immune'];

test('every vendored file is the pinned bytes; Rung 1\'s cell and held-out digits are the ones it sealed', () => {
  const pinned = new Map();
  for (const s of JSON.parse(read('vendor/SOURCES.json')).sources) for (const f of s.files) pinned.set(f.path, f.sha256);
  const files = [];
  (function walk(d) { for (const n of readdirSync(new URL(d, ROOT))) { const p = d + '/' + n; if (statSync(new URL(p, ROOT)).isDirectory()) walk(p); else files.push(p); } })('vendor');
  for (const f of files.filter((x) => x !== 'vendor/SOURCES.json')) { assert.ok(pinned.has(f), f + ' is not pinned'); assert.equal(sha(f), pinned.get(f), f + ' changed'); }
  assert.equal(sha('vendor/settling-cell/src/cell.mjs'), '590c8307b06148dbfa7c2e4a247336441e150d8235d62783c45efb53190d9101', 'Rung 1\'s sealed kernel');
  assert.equal(sha('vendor/settling-cell/data/cell.txt').slice(0, 8), '095d33a8', 'Rung 1\'s seal-2 cell');
});
test('no measured number is typed into the page: every count comes from the rungs\' records', () => {
  const visible = html.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<svg[\s\S]*?<\/svg>/, '').replace(/style="[^"]*"/g, '');
  assert.equal(/\d+(\.\d+)?%/.test(visible), false, 'no percentage typed in');
  assert.equal(/\b\d+ of \d+\b/.test(visible), false, 'no "x of y" typed in');
  assert.match(app, /Lad\.tally\(j\.verdicts/);
  assert.match(app, /'\/data\/record\.json'/);
});
test('every rung is linked, the failures are told, the page explains itself, talks only to itself, and carries its credits', () => {
  for (const r of REPOS) assert.match(app, new RegExp("repo: '" + r + "'"), r);
  assert.match(app, /pending: \['CI1'\]/, 'the untestable claim is counted as not tested, never as held');
  assert.match(app, /failed and are kept/);
  assert.match(html, /A claim that missed its bar is kept and shown as failed\./);
  for (const id of ['rungs', 'watch', 'finding', 'start', 'how', 'blueprint', 'adoption', 'paper', 'business']) assert.match(html, new RegExp('<section id="' + id + '"'), id);
  assert.match(html, /connect-src 'self'/);
  assert.match(html, /Powered by the Konomi architecture, created by Thomas Frumkin/);
  assert.match(html, /Alpaydin, E\., &amp; Kaynak, C\. \(1998\)/);
  assert.equal(/£\s?\d|\$\s?\d|per seat|\/mo\b/i.test(html), false, 'no price of ours on the page');
  assert.equal(/my-estate-graph/.test(html + app), false, 'no private repository named');
});
