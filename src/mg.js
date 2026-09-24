// ============================================================================
//  mg — microgame registry + runtime.
//  A microgame is a plain object:
//    { id, stage, name, cmd:'¡CAZA!', how:'Toca las pulgas', mech:'tap',
//      beats: 8 | 16, survive: false (true → winning by lasting),
//      boss: false, song(g) → song, init(g), update(g, dt), draw(g, c),
//      top(g, c) (optional top-screen picture), bot(g) (test player) }
//  g carries: level 1..3, bpm, spb (sec per beat), t (sec), b (beats), fx,
//  state 'play' | 'won' | 'lost', and helpers win(), lose().
// ============================================================================
'use strict';

const MG = {};
const MG_ORDER = [];
function defMG(def) {
  MG[def.id] = Object.assign({ beats: 8, survive: false, mech: 'tap', how: '' }, def);
  MG_ORDER.push(def.id);
}
const MGC = mkCanvas(SW, SH); // every microgame renders here, then gets composed (zooms, portals)

function mgNew(id, level = 1, bpm = 120, o = {}) {
  const def = MG[id];
  const g = {
    def, id, level, bpm, spb: 60 / bpm, t: 0, b: 0, state: 'play', fx: new FX(), rng: mulberry32((RNG() * 1e9) | 0),
    tempo: bpm / 120, decidedAt: -1, practice: !!o.practice, beats: def.beats, over: false,
    win() { if (this.state !== 'play') return; this.state = 'won'; this.decidedAt = this.t; mgOnDecide(this, true); },
    lose() { if (this.state !== 'play') return; this.state = 'lost'; this.decidedAt = this.t; mgOnDecide(this, false); },
    shake(a = 2, d = .2) { shake('bot', a, d); },
    // helpers bound to the game's own rng (deterministic replays)
    r(a = 1, b) { return b === undefined ? this.rng() * a : a + this.rng() * (b - a); },
    ri(a, b) { return fl(this.r(a, b + 1)); },
    pick(arr) { return arr[fl(this.rng() * arr.length)]; },
  };
  if (def.init) def.init(g);
  return g;
}
function mgOnDecide(g, won) {
  if (won) { sfx('good'); buzz(12); g.fx.burst(IN.x, IN.y, 10, { k: 'spark', c: ['#fff', C.yellow, C.mint], sp0: 30, sp1: 110 }); }
  else { sfx('bad'); buzz([30, 40, 30]); }
  if (g.onDecide) g.onDecide(won);
}
function mgUpdate(g, dt) {
  g.t += dt; g.b = g.t / g.spb;
  if (g.def.update) g.def.update(g, dt);
  g.fx.update(dt);
}
function mgDraw(g) {
  const c = MGC.g;
  c.save(); if (g.def.draw) g.def.draw(g, c); c.restore();
  g.fx.draw(c);
  return MGC;
}
// convenience: finger-over test for tap games
const tapOn = (x, y, r) => IN.tap && dist(IN.x, IN.y, x, y) <= r;
const touching = (x, y, r) => IN.down && dist(IN.x, IN.y, x, y) <= r;

// ---------------------------------------------------------------- gestures --
// rubbing: counts back-and-forth travel (direction reversals give a bonus)
function rubTracker() {
  return { amount: 0, lastDir: 0, flips: 0, sfxT: 0, update(dt, inside = true) {
    if (!IN.down || !inside) return 0;
    const d = Math.hypot(IN.dx, IN.dy); if (d < .3) return 0;
    const dir = Math.abs(IN.dx) > Math.abs(IN.dy) ? sgn(IN.dx) * 1 : sgn(IN.dy) * 2;
    let gain = d; if (dir !== this.lastDir && this.lastDir !== 0) { this.flips++; gain += 6; }
    this.lastDir = dir; this.amount += gain;
    this.sfxT -= dt; if (this.sfxT <= 0) { sfx('rub', { pitch: .8 + Math.random() * .5 }); this.sfxT = .07; }
    return gain;
  } };
}
// spinning: accumulates signed angle travelled around (cx, cy)
function spinTracker(cx, cy) {
  return { cx, cy, ang: 0, turns: 0, last: null, vel: 0, update(dt) {
    if (!IN.down) { this.last = null; this.vel *= .9; return 0; }
    const a = Math.atan2(IN.y - this.cy, IN.x - this.cx), r = dist(IN.x, IN.y, this.cx, this.cy);
    if (r < 6) { this.last = null; return 0; }
    if (this.last == null) { this.last = a; return 0; }
    const d = angDiff(this.last, a); this.last = a; this.ang += d; this.turns = this.ang / TAU; this.vel = lerp(this.vel, d / dt, .3);
    return d;
  } };
}
// slicing: a fast stroke; returns the segment when the finger moved fast enough
function sliceTracker(minSpeed = 260) {
  return { segs: [], update() {
    this.segs.length = 0;
    if (!IN.down) return;
    const sp = Math.hypot(IN.dx, IN.dy) / STEP;
    if (sp >= minSpeed) this.segs.push([IN.x - IN.dx, IN.y - IN.dy, IN.x, IN.y]);
  } };
}
// distance from point to segment
function segDist(px0, py0, x0, y0, x1, y1) { const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy; let t = L ? ((px0 - x0) * dx + (py0 - y0) * dy) / L : 0; t = clamp(t, 0, 1); return Math.hypot(px0 - x0 - dx * t, py0 - y0 - dy * t); }
// do segments intersect?
function segCross(a, b, c, d) { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); }
