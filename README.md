# The geometric ladder

Live: **https://sjgant80-hub.github.io/geometric-ladder/**

Seven sealed builds testing whether small networks that **compute by settling** into a low-energy shape, instead of
large models, can do real work, improve themselves, share safely, defend themselves and fit on a small device. Each
rung wrote its claims and bars before any code, froze its results by hash, read its held-out data once, and kept every
failure. The live page reads every rung's committed verdicts and lets you watch a cell settle in your tab.

## The rungs (28 of 39 measured claims held, 11 failed and kept, 1 not tested)

| rung | the question | held | failed and kept |
|---|---|---|---|
| 1 [settling-cell](https://sjgant80-hub.github.io/settling-cell/) | can a network compute a real task by settling? | 5 of 9 | T1, T2, T7, T8 |
| 2 [code-rsi](https://sjgant80-hub.github.io/code-rsi/) | can code improve the shape with no model? | 5 of 6 | R3 |
| 3 [hybrid-gate](https://sjgant80-hub.github.io/hybrid-gate/) | settling plus exact code, the gate readable? | 3 of 5 | H3, H5 |
| 4 [mesh-share](https://sjgant80-hub.github.io/mesh-share/) | does a shape from A improve B over signed messages? | 4 of 4 | none |
| 5 [geometric-defence](https://sjgant80-hub.github.io/geometric-defence/) | is an attack a shape that won't settle? | 2 of 5 | D2, D3, D5 |
| 6 [nested-fabric](https://sjgant80-hub.github.io/nested-fabric/) | do clusters plus wide sharing degrade gracefully? | 4 of 4 | none |
| 7 [chip-immune](https://sjgant80-hub.github.io/chip-immune/) | does the layer fit a small device and fail safe? | 5 of 6 (+ CI1 not tested: no chip in hand) | CI5 |

**What the ladder found.** The structure around the cell held: signatures checked on raw bytes, each receiver's own exam
before any change, exact code behind the fuzzy reader, signed sharing, a layer that fails safe. The settle itself, as a
computation, kept losing information: reading the same shape in one step did at least as well (Rungs 1, 2), and an attack
that settles into a real digit's well looks, at the settled state, like that digit (Rungs 5, 7).

## Re-derive it

```bash
node --test test/ladder.test.mjs test/page.test.mjs
```

Each rung re-derives its own record in its own repository (`--check` on GitHub's runner and in the browser).
Powered by the Konomi architecture, created by Thomas Frumkin. MIT licence; credits in [`NOTICE`](NOTICE).
