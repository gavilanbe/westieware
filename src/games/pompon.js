// ============================================================================
//  Microgames of POMPÓN's stage (¡CORTA!): every one is a quick swipe of the
//  scissors. A shared blade leaves a pink trail and snips as you slice.
//  House rules for clarity: the thing to cut always pulses or wears a thick
//  dashed guide with an arrow; every result ends in a big stamp word.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- the blade --
// Tracks the finger while it is down. seg = what the finger swept this step
// (only when it moves fast enough to count as a cut). Draws trail + scissors.
function pomponBlade(minSpeed = 110) {
  return {
    pts: [], seg: null, ang: 0, snip: 0, sfxT: 0, minSpeed,
    update(g, dt) {
      this.seg = null; this.snip = Math.max(0, this.snip - dt * 6); this.sfxT -= dt;
      if (IN.tap) this.pts = [];
      if (IN.down) {
        this.pts.push({ x: IN.x, y: IN.y, t: g.t });
        const d = Math.hypot(IN.dx, IN.dy), sp = d / STEP;
        if (d > .5) this.ang = Math.atan2(IN.dy, IN.dx);
        if (!IN.tap && d > .3 && sp >= this.minSpeed) { this.seg = [IN.x - IN.dx, IN.y - IN.dy, IN.x, IN.y]; if (sp >= 110 && this.sfxT <= 0) { sfx('swoosh', { pitch: 1.6 + Math.random() * .4, vol: .35 }); this.sfxT = .18; } }
      }
      while (this.pts.length && g.t - this.pts[0].t > .13) this.pts.shift();
    },
    // does this step's swipe cross the circle (x, y, r)?
    hitsCircle(x, y, r) { const s = this.seg; return !!s && segDist(x, y, s[0], s[1], s[2], s[3]) <= r; },
    // does it cross the segment a→b?
    crosses(ax, ay, bx, by) { const s = this.seg; return !!s && segCross([s[0], s[1]], [s[2], s[3]], [ax, ay], [bx, by]); },
    draw(c, t) {
      const P = this.pts;
      for (let i = 1; i < P.length; i++) { const k = i / P.length; thickLine(c, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y, .6 + k * 2.4, '#ff82b4'); }
      for (let i = 1; i < P.length; i++) { const k = i / P.length; thickLine(c, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y, .3 + k * 1.3, '#ffffff'); }
      if (IN.down) pomponScissors(c, IN.x, IN.y, this.ang, .15 + Math.abs(Math.sin(t * 22)) * .45 * (this.seg ? 1 : .4));
    },
  };
}
// Anahí's blue shears, drawn live (open by `open` radians), tip toward `ang`
function pomponScissors(c, x, y, ang, open) {
  const bl = (a, len) => [x + Math.cos(a) * len, y + Math.sin(a) * len];
  for (const s of [-1, 1]) {
    const a = ang + s * open / 2, [tx, ty] = bl(a, 15), [hx, hy] = bl(a + Math.PI + s * .25, 7);
    thickLine(c, x, y, tx, ty, 2.2, INK); thickLine(c, x, y, tx, ty, 1.3, '#e1e7f2'); px(c, (x + tx) / 2, (y + ty) / 2 - 1, '#ffffff');
    thickLine(c, x, y, hx, hy, 1.8, INK); disc(c, hx, hy, 4, INK); disc(c, hx, hy, 3, '#3565cc'); disc(c, hx, hy, 1.5, '#ffd1e4');
  }
  disc(c, x, y, 1.8, INK); px(c, x, y, '#fff27a');
}
// the cut guide: a soft white glow band, bold marching dashes (ink + white
// core), a scissors badge where to start and an arrowhead where to finish
function pomponGuide(c, pts, t, done, col = '#ffffff') {
  if (done) return;
  c.globalAlpha = .3 + Math.sin(t * 8) * .1;
  for (let i = 1; i < pts.length; i++) thickLine(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 4.5, '#ffffff');
  c.globalAlpha = 1;
  const dash = (size, colr) => {
    let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay);
      for (let q = 0; q < L; q += 1) { if (fl((acc + q - t * 26) / 5) % 2) continue; const x = lerp(ax, bx, q / L), y = lerp(ay, by, q / L); rect(c, x - size / 2, y - size / 2, size, size, colr); }
      acc += L;
    }
  };
  dash(4, INK); dash(2, col);
  // arrowhead at the end
  const [ex, ey] = pts[pts.length - 1], [px0, py0] = pts[pts.length - 2], a = Math.atan2(ey - py0, ex - px0);
  const tip = [ex + Math.cos(a) * 5, ey + Math.sin(a) * 5], l1 = [ex + Math.cos(a + 2.5) * 7, ey + Math.sin(a + 2.5) * 7], r1 = [ex + Math.cos(a - 2.5) * 7, ey + Math.sin(a - 2.5) * 7];
  polyPx(c, [tip.map(v => v + 1), l1.map(v => v + 1), r1.map(v => v + 1)], INK); polyPx(c, [tip, l1, r1], '#fff27a');
  // scissors badge at the start
  const [sx, sy] = pts[0], bob = Math.sin(t * 8) * 1.5;
  disc(c, sx - 9, sy - 10 + bob, 8, INK); disc(c, sx - 9, sy - 10 + bob, 7, '#ffffff'); pomponScissors(c, sx - 9, sy - 10 + bob, 0, .55);
}
// sample a polyline into n points (for coverage)
function pomponSample(pts, n) {
  const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(L); tot += L; }
  const out = [];
  for (let k = 0; k < n; k++) { let d = (k + .5) / n * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; } const u = segs[i] ? d / segs[i] : 0; out.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]); }
  return out;
}
// a coverage tracker for tracing a guide in one stroke
function pomponTrace(pts, n = 26, tol = 8) {
  return { pts, samp: pomponSample(pts, n), cov: new Array(n).fill(false), done: false, tol,
    frac() { return this.cov.filter(Boolean).length / this.cov.length; },
    feed() { if (this.done || !IN.down) return; const x0 = IN.x - IN.dx, y0 = IN.y - IN.dy; this.samp.forEach((p, i) => { if (!this.cov[i] && segDist(p[0], p[1], x0, y0, IN.x, IN.y) < this.tol) this.cov[i] = true; }); },
    reset() { this.cov.fill(false); },
  };
}
// green beads on the part of a guide already traced
function pomponCovDots(c, tr) { if (!tr.done) tr.samp.forEach((p, i) => { if (tr.cov[i]) { disc(c, p[0], p[1], 2.2, INK); disc(c, p[0], p[1], 1.4, '#5bd18b'); } }); }
// split a canvas along a line: returns the part on the far side (and erases it from src)
function pomponSplitBelow(src, ax, ay, bx, by, xmin = -1e9, xmax = 1e9) {
  const w = src.width, h = src.height, sg = src.g, im = sg.getImageData(0, 0, w, h), D = im.data;
  const out = mkCanvas(w, h), oi = out.g.createImageData(w, h), O = oi.data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (!D[i + 3]) continue;
    if (x < xmin || x > xmax) continue;
    const side = (bx - ax) * (y + .5 - ay) - (by - ay) * (x + .5 - ax);
    if (side > 0) { O[i] = D[i]; O[i + 1] = D[i + 1]; O[i + 2] = D[i + 2]; O[i + 3] = D[i + 3]; D[i + 3] = 0; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  sg.putImageData(im, 0, 0); out.g.putImageData(oi, 0, 0);
  if (x1 < x0) return null;
  const piece = mkCanvas(x1 - x0 + 1, y1 - y0 + 1); piece.g.drawImage(out, -x0, -y0);
  return { img: piece, x: x0 + (x1 - x0) / 2, y: y0 + (y1 - y0) / 2 };
}
// falling cut pieces
function pomponUpdPieces(list, dt) { for (const p of list) { p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; } }
function pomponDrawPieces(c, list) { for (const p of list) if (p.y < SH + 80) drawS(c, p.img, p.x, p.y, { rot: p.rot }); }
function pomponHairBurst(g, x, y, n = 10) { g.fx.burst(x, y, n, { k: 'hair', c: [POMPON_FUR[2], POMPON_FUR[3], POMPON_FUR[4]], sp0: 30, sp1: 110, g: 240, life0: .4, life1: .8, r: 2.5 }); }
function pomponSparkle(g, x, y, n = 10) { g.fx.burst(x, y, n, { k: 'star', c: ['#ffffff', '#fff27a', '#ffd1e4'], sp0: 50, sp1: 140, life0: .3, life1: .6 }); }
// the result stamp: a big word that springs in, slightly tilted
function pomponStamp(c, word, dt, y = 30, fill = ['#ffffff', '#fff27a', '#ffc23a']) {
  const k = spring(dt, 2.4, 6); if (k <= 0) return;
  c.save(); c.translate(SW / 2, y); c.rotate(-.05); c.scale(k, k);
  mord(c, word, 0, -9, fitMord(word, 230, { u: 1.5, r: 1.7, rim: 2, sy: 2, fill }), {});
  c.restore();
}
const POMPON_STAMP_BAD = ['#ffffff', '#b3d9ff', '#63a0ef'];
// a speech bubble with a tail pointing at (tx, ty)
function pomponSay(c, s, x, y, tx, ty) {
  const w = txtW(s) + 12;
  polyPx(c, [[x - 5, y + 6], [x + 5, y + 6], [tx, ty]], INK); polyPx(c, [[x - 3, y + 5], [x + 3, y + 5], [tx, ty - 1]], '#ffffff');
  panel(c, x - w / 2, y - 8, w, 15, '#ffffff', { r: 5 }); txt(c, s, x, y - 4, INK, { align: 'c' });
}
// a HUD tag sized to its bold text (x = left edge, or right edge if right)
function pomponTag(c, s, x, y, col, right = false) {
  const w = txtW(s) + s.length + 12, x0 = right ? x - w : x;
  panel(c, x0, y, w, 15, '#ffffff', { r: 4 }); txt(c, s, x0 + w / 2, y + 4, col, { align: 'c', bold: true });
}
// cartoon puff clouds, the house look for poodle fur: ink silhouette, a thin
// darker line between puffs, flat shadow crescent, base tone and a highlight.
// P = [[x, y, r, dark?], …] drawn back to front.
function pomponPuffs(g, P, R, line = INK) {
  for (const [x, y, r] of P) disc(g, x, y, r + 1.6, line);
  for (const [x, y, r, dk] of P) {
    const Q = dk ? [R[0], R[0], R[1], R[2], R[3]] : R;
    disc(g, x, y, r + .3, Q[1]); disc(g, x, y, r - .7, Q[2]);
    disc(g, x - r * .14, y - r * .18, r * .78, Q[3]);
    // a curl stroke in the shadow tone and a little arc of shine: fur, not balloons
    const th = r >= 10 ? .8 : 0;
    if (r >= 6) for (let a = .5; a < 2.4; a += 1 / r) disc(g, x - r * .1 + Math.cos(a) * r * .42, y - r * .1 + Math.sin(a) * r * .42, th, Q[2]);
    if (r >= 3) for (let a = 3.5; a < 4.8; a += 1 / r) disc(g, x + Math.cos(a) * r * .56, y + Math.sin(a) * r * .56, th, Q[4]);
  }
}
const POMPON_FRINGE = ['#4a0a2c', '#8e1450', '#d0266e', '#f0529a', '#ffb0d4'];   // her dyed idol fringe
// after a split, ink the fresh cut so it reads as a clean snip, not a glitch
function pomponSealCut(cv, ax, ay, bx, by) {
  const w = cv.width, h = cv.height, im = cv.g.getImageData(0, 0, w, h), D = im.data, x0 = Math.max(0, fl(Math.min(ax, bx))), x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx)));
  for (let x = x0; x <= x1; x++) {
    const y = fl(lerp(ay, by, (x - ax) / ((bx - ax) || 1)));
    for (let k = 0; k < 3; k++) { const yy = y - k; if (yy < 0 || yy >= h) continue; if (D[(yy * w + x) * 4 + 3]) { cv.g.fillStyle = INK; cv.g.fillRect(x, yy, 1, 1); if (yy > 0 && D[((yy - 1) * w + x) * 4 + 3]) { cv.g.fillStyle = POMPON_FRINGE[1]; cv.g.fillRect(x, yy - 1, 1, 1); } break; } }
  }
}

// ---------------------------------------------------------------- 1 FLEQUILLO
// Close-up of Pompón: a hot-pink fringe hangs over her eyes. Cut along the line.
function pomponBigHead() {
  return mdl('pomponBigHead3', () => {
    const c = mkCanvas(SW, SH), g = c.g, F = POMPON_FUR, K = POMPON_SKIN;
    const ear = sd => [[80, 108, 12], [54, 130, 12], [60, 78, 14], [82, 150, 13], [66, 98, 17], [70, 122, 18], [68, 146, 18], [62, 168, 17], [70, 188, 15]].map(([v, y, r]) => [128 + sd * v, y, r, v > 74 && y > 120]);
    pomponPuffs(g, ear(-1), F); pomponPuffs(g, ear(1), F);
    pomponPuffs(g, [[128, 12, 12], [112, 20, 13], [144, 20, 13], [104, 38, 15], [152, 38, 15], [128, 30, 19]], F);
    // the shaved face: cream, with a snout
    ellipsePx(g, 128, 118, 43.6, 39.6, INK); ellipsePx(g, 128, 146, 27.6, 21.6, INK);
    ellipsePx(g, 128, 118, 42, 38, K[2]); ellipsePx(g, 128, 146, 26, 20, K[2]);
    ellipsePx(g, 126, 115, 39, 34, K[3]); ellipsePx(g, 127, 143, 23, 17, K[3]);
    ellipsePx(g, 110, 96, 14, 7, K[4]); ellipsePx(g, 118, 136, 7, 3, K[4]);
    pomponPuffs(g, [[84, 72, 14], [172, 72, 14], [102, 62, 16], [154, 62, 16], [128, 56, 17]], F);
    // big idol eyes (hidden by the fringe until the cut)
    const E2 = '#2a0f22';
    for (const [ex, sd] of [[108, -1], [148, 1]]) {
      ellipsePx(g, ex, 114, 9.5, 11.5, E2); ellipsePx(g, ex, 115, 8, 10, '#5a2350'); ellipsePx(g, ex, 119, 6.5, 5.5, '#9c3f7d'); ellipsePx(g, ex, 122, 4, 2.6, '#e08cc0');
      disc(g, ex - 3, 109, 3.4, '#ffffff'); disc(g, ex + 3.5, 119, 1.6, '#ffffff'); px(g, ex + 3, 108, '#ffffff');
      for (let i = 0; i < 3; i++) thickLine(g, ex + sd * (7 + i * 2.5), 106 - i * 1.5, ex + sd * (12 + i * 3), 100 - i * 2.5, .9, E2);
    }
    for (const bx of [92, 164]) { ellipsePx(g, bx, 134, 8, 4, '#ff93bf'); px(g, bx - 3, 132, '#ffd1e4'); px(g, bx - 2, 132, '#ffd1e4'); }
    ellipsePx(g, 128, 141, 7, 5, INK); ellipsePx(g, 128, 141, 5.5, 3.6, '#2a0f22'); rect(g, 124, 139, 3, 1, '#6f5a78');
    thickLine(g, 119, 153, 124, 157, .8, INK); thickLine(g, 124, 157, 128, 154, .8, INK); thickLine(g, 128, 154, 132, 157, .8, INK); thickLine(g, 132, 157, 137, 153, .8, INK);
    ellipsePx(g, 128, 160, 3.5, 2.4, RAMP.pink[2]);
    // headset boom from the right ear to the mouth
    thickLine(g, 184, 118, 150, 150, 1.4, INK); thickLine(g, 184, 118, 150, 150, .6, '#6f7a92'); ellipsePx(g, 147, 151, 5, 3.5, INK); ellipsePx(g, 147, 151, 3.6, 2.2, '#6f7a92'); px(g, 145, 150, '#e1e7f2');
    pomponBowAt(g, 128, 7, 2.2); pomponBowAt(g, 60, 80, 1.1); pomponBowAt(g, 196, 80, 1.1);
    return c;
  });
}
// the fringe: seven dyed ringlets hanging over the eyes (its own canvas, so it can be cut)
function pomponBangs() {
  return mdl('pomponBangs3', () => {
    const c = mkCanvas(SW, SH), g = c.g, xs = [80, 96, 112, 128, 144, 160, 176];
    for (const i of [0, 6, 1, 5, 2, 4, 3]) {
      const P = []; for (let j = 0; j < 6; j++) P.push([xs[i] + (j % 2 ? 2 : -2) * (i % 2 ? 1 : -1), 62 + j * 13, 10.5 - j * .6]);
      pomponPuffs(g, P, POMPON_FRINGE);
    }
    return c;
  });
}
defMG({
  id: 'flequillo', stage: 'pompon', name: 'Flequillo de estrella', cmd: '¡CORTA!', how: 'Corta el flequillo siguiendo la línea, sin levantar el dedo', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .6, n: 'E6 . C#6 . A5 . C#6 . E6 . F#6 . E6 - - . D6 . B5 . G#5 . B5 . D6 . E6 . D6 - - .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 . . A3 . E2 . . E2 . . E3 . D2 . . D2 . . D3 . E2 . . E2 . . E3 .' },
    { i: 'd', v: .75, n: 'k . c . k . c . k . c . k . c c k . c . k . c . k . c . k c c c' }] }),
  init(g) {
    const L = g.level;
    const lines = L === 1 ? [[[62, 86], [194, 86]]] : L === 2 ? [[[62, 78], [194, 94]]] : [[[60, 80], [128, 92]], [[128, 92], [196, 80]]];
    g.cuts = lines.map(p => pomponTrace(p, 24, L === 1 ? 12 : 9));
    g.blade = pomponBlade(0); g.pieces = []; g.bangs = mkCanvas(SW, SH); g.bangs.g.drawImage(pomponBangs(), 0, 0);
    g.revealT = -1; g.flashes = [];
  },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.pieces, dt);
    if (g.state === 'won' && g.r() < .08) g.flashes.push({ x: g.r(20, 236), y: g.r(20, 170), t: g.t });
    if (g.state !== 'play') return;
    for (const cut of g.cuts) {
      if (cut.done) continue;
      cut.feed();
      if (cut.frac() >= .8) {
        cut.done = true;
        const [a, b] = [cut.pts[0], cut.pts[cut.pts.length - 1]];
        const pc = pomponSplitBelow(g.bangs, a[0], a[1], b[0], b[1], Math.min(a[0], b[0]) - (g.cuts.length > 1 ? 0 : 40), Math.max(a[0], b[0]) + (g.cuts.length > 1 ? 0 : 40));
        if (pc) g.pieces.push({ img: pc.img, x: pc.x, y: pc.y, vx: g.r(-30, 30), vy: -40, rot: 0, vr: g.r(-2, 2) });
        pomponSealCut(g.bangs, a[0], a[1], b[0], b[1]);
        sfx('snip'); sfx('snip', { delay: .06, pitch: 1.2 }); HITSTOP = 3; g.shake(2, .15); buzz(12);
        cut.samp.forEach((p, i) => { if (i % 3 === 0) pomponHairBurst(g, p[0], p[1], 3); });
      }
    }
    if (IN.rel && g.level > 1) for (const cut of g.cuts) if (!cut.done) cut.reset(); // from level 2: one stroke per cut
    if (g.cuts.every(c => c.done)) { g.win(); g.revealT = g.t; pomponSparkle(g, 107, 106, 12); pomponSparkle(g, 149, 106, 12); sfx('sparkle', { delay: .1 }); sfx('shutter', { delay: .35 }); }
  },
  draw(g, c) {
    // vanity-mirror backdrop with bulbs
    rect(c, 0, 0, SW, SH, '#ffd1e4'); for (let y = 0; y < SH; y += 10) for (let x = (y / 10 % 2) * 10; x < SW; x += 20) rect(c, x, y, 10, 10, '#ffc3d8');
    for (let i = 0; i < 9; i++) { const on = (i + fl(g.t * 6)) % 3 !== 0; for (const [x, y] of [[8, 16 + i * 21], [SW - 9, 16 + i * 21]]) { disc(c, x, y, 4, INK); disc(c, x, y, 3.2, on ? '#fff27a' : '#c69420'); if (on) px(c, x - 1, y - 1, '#fff'); } }
    c.drawImage(pomponBigHead(), 0, 0);
    if (g.state === 'won' && g.t - g.revealT < 3) { const k = spring(g.t - g.revealT, 2.5, 6); for (const ex of [107, 149]) drawStar(c, ex + 8, 97 - k * 3, 3 + k * 2, '#fff27a', g.t * 3); }
    c.drawImage(g.bangs, 0, 0);
    // before the cut she is blind: sweat drop + bubble
    if (g.state === 'play') { const bob = Math.sin(g.t * 5) * 1.5; rect(c, 194, 60 + bob, 3, 6, '#9bd6f7'); px(c, 194, 59 + bob, '#dff4ff'); if (g.t < 2.2) pomponSay(c, '¡No veo nada!', 200, 30, 170, 58); }
    for (const cut of g.cuts) { pomponGuide(c, cut.pts, g.t, cut.done); pomponCovDots(c, cut); }
    pomponDrawPieces(c, g.pieces);
    for (const f of g.flashes) if (g.t - f.t < .1) { disc(c, f.x, f.y, 6, '#ffffff'); drawStar(c, f.x, f.y, 10, '#ffffff'); }
    if (g.state === 'won') pomponStamp(c, '¡GUAPÍSIMA!', g.t - g.revealT - .1, 172, ['#ffffff', '#ffd1e4', '#ff5d9e']);
    if (g.state === 'lost') pomponStamp(c, '¡SIGO SIN VER!', g.t - g.decidedAt, 172, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const cut = g.cuts.find(c => !c.done) || g.cuts[0]; return { mech: 'cut', x: cut.pts[0][0], y: cut.pts[0][1], path: cut.pts }; },
  bot(g) {
    const cut = g.cuts.find(c => !c.done); if (!cut) return { down: false };
    const b = g._b || (g._b = { i: -1, k: 0 });
    const ci = g.cuts.indexOf(cut);
    if (b.i !== ci) { b.i = ci; b.k = -3; }
    b.k++;
    if (b.k < 0) return { x: cut.pts[0][0], y: cut.pts[0][1], down: false };
    const P = pomponSample(cut.pts, 40), p = P[Math.min(P.length - 1, b.k)];
    if (b.k >= P.length + 2) { b.i = -1; return { x: p[0], y: p[1], down: false }; }
    return { x: p[0], y: p[1], down: true };
  },
});

// ---------------------------------------------------------------- 2 POMPONES
// The tail pompom has stray locks sticking out of the dotted circle: slice
// each one off until it's a perfect ball. Pompón peeks back, worried.
function pomponBall() {
  return mdl('pomponBall3', () => {
    const c = mkCanvas(80, 80), g = c.g, P = [];
    for (let i = 0; i < 10; i++) { const a = -2.2 + i / 10 * TAU; P.push([40 + Math.cos(a) * 21, 40 + Math.sin(a) * 21, 11.5, Math.cos(a - .8) > .35]); }
    for (let i = 0; i < 5; i++) { const a = -1.6 + i / 5 * TAU; P.push([39 + Math.cos(a) * 10, 39 + Math.sin(a) * 10, 11, false]); }
    P.push([37, 37, 10, false]);
    pomponPuffs(g, P, POMPON_FUR);
    return c;
  });
}
// a stray lock: a tapering strand that ends in a cartoon curl
function pomponLock(c, P, line = INK, dx = 0, dy = 0) {
  const n = P.length - 1, [tx, ty] = P[n], a = Math.atan2(ty - P[n - 1][1], tx - P[n - 1][0]), nx = -Math.sin(a), ny = Math.cos(a);
  const C = [tx + nx * 4, ty + ny * 4], a0 = a - Math.PI / 2, Q = P.map(p => [p[0], p[1]]);
  for (let i = 1; i <= 12; i++) { const q = i / 12, ang = a0 + q * 6.6, rr = 4 * (1 - q * .55); Q.push([C[0] + Math.cos(ang) * rr, C[1] + Math.sin(ang) * rr]); }
  const R = (i, big) => (big ? 3.1 : 2.1) - i / Q.length * (big ? 1.7 : 1.4);
  for (let i = 1; i < Q.length; i++) thickLine(c, Q[i - 1][0] + dx, Q[i - 1][1] + dy, Q[i][0] + dx, Q[i][1] + dy, R(i, true), line);
  for (let i = 1; i < Q.length; i++) thickLine(c, Q[i - 1][0] + dx, Q[i - 1][1] + dy, Q[i][0] + dx, Q[i][1] + dy, R(i, false), POMPON_FUR[3]);
  for (let i = 1; i < P.length; i++) px(c, P[i][0] + dx - nx, P[i][1] + dy - ny, POMPON_FUR[4]);
}
function pomponRearBg() {
  return mdl('pomponRearBg3', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#e8f4ff'); for (let x = 0; x < SW; x += 16) rect(g, x, 0, 8, SH, '#dcecfb');
    for (let i = 0; i < 26; i++) drawStar(g, hash2(i, 4) * SW, hash2(4, i) * 120, 1.8, '#ffffff');
    rect(g, 0, 160, SW, 32, '#2b2540'); rect(g, 0, 160, SW, 2, '#5f5883');
    // her fluffy rump, bottom-left (the tail grows from it)
    pomponPuffs(g, [[-8, 150, 20], [18, 142, 19], [44, 150, 18, 1], [62, 166, 17, 1], [-10, 178, 24], [22, 172, 24], [50, 184, 20, 1], [74, 190, 15, 1]], POMPON_FUR);
    return c;
  });
}
defMG({
  id: 'pompones', stage: 'pompon', name: 'Pompón perfecto', cmd: '¡REDONDEA!', how: 'Corta los mechones que se salen del círculo', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'A5 . A5 . . . E5 . A5 . B5 . C#6 . . . B5 . B5 . . . F#5 . B5 . C#6 . D6 . . .' },
    { i: 'bass', v: .85, n: 'A2 . . . E3 . . . A2 . . . E3 . . . B2 . . . F#3 . . . E2 . . . G#2 . . .' },
    { i: 'd', v: .75, n: 'k . h c . h k . k . h c . h k h k . h c . h k . k . h c k c c c' }] }),
  init(g) {
    const n = [3, 4, 5][g.level - 1];
    g.tufts = [];
    const base = g.r(TAU);
    for (let i = 0; i < n; i++) { const a = base + i / n * TAU + g.r(-.3, .3); g.tufts.push({ a, len: g.r(22, 30), wig: g.r(TAU), cut: false }); }
    g.blade = pomponBlade(); g.flying = []; g.wag = [0, 18, 28][g.level - 1];
  },
  center(g) { const w = Math.sin(g.t * 4.2 * g.tempo) * g.wag; return [120 + w, 84 - Math.abs(w) * .2]; },
  // a stray lock's spine: from the ball's rim outwards, swaying
  tuftPts(g, tf) { const [cx0, cy0] = this.center(g), a = tf.a, r0 = 30, pts = []; for (let i = 0; i <= 6; i++) { const q = i / 6, r = r0 + q * tf.len, sw = Math.sin(q * 5 + tf.wig + g.t * 6) * 3 * q; pts.push([cx0 + Math.cos(a) * r - Math.sin(a) * sw, cy0 + Math.sin(a) * r + Math.cos(a) * sw]); } return pts; },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.flying, dt);
    if (g.state !== 'play') return;
    for (const tf of g.tufts) {
      if (tf.cut) continue;
      const P = this.tuftPts(g, tf);
      for (let i = 2; i < P.length; i++) if (g.blade.crosses(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]) || g.blade.hitsCircle(P[i][0], P[i][1], 4)) {
        tf.cut = true;
        const piece = mkCanvas(64, 64), off = [P[i - 1][0] - 32, P[i - 1][1] - 32];
        pomponLock(piece.g, P.slice(i - 1), INK, -off[0], -off[1]);
        g.flying.push({ img: piece, x: P[i - 1][0], y: P[i - 1][1], vx: Math.cos(tf.a) * 90, vy: Math.sin(tf.a) * 90 - 80, rot: 0, vr: g.r(-10, 10) });
        sfx('snip', { pitch: 1 + g.tufts.filter(t => t.cut).length * .1 }); HITSTOP = 2; buzz(8); pomponHairBurst(g, P[i - 1][0], P[i - 1][1], 6);
        g.fx.add({ k: 'txt', s: '¡ZAS!', x: P[i - 1][0], y: P[i - 1][1] - 12, life: .45, c: '#ffffff' });
        break;
      }
    }
    if (g.tufts.every(t => t.cut)) { g.win(); const [cx0, cy0] = this.center(g); pomponSparkle(g, cx0, cy0, 16); sfx('sparkle'); }
  },
  draw(g, c) {
    c.drawImage(pomponRearBg(), 0, 0);
    const [cx0, cy0] = this.center(g);
    // the tail stalk from the rump to the pompom
    const tx0 = 70, ty0 = 150;
    for (let i = 0; i <= 12; i++) { const q = i / 12, x = lerp(tx0, cx0, q) + Math.sin(q * Math.PI) * -12, y = lerp(ty0, cy0 + 20, q); disc(c, x, y, 6.2 - q * 1.5, INK); }
    for (let i = 0; i <= 12; i++) { const q = i / 12, x = lerp(tx0, cx0, q) + Math.sin(q * Math.PI) * -12, y = lerp(ty0, cy0 + 20, q); disc(c, x, y, 5.2 - q * 1.5, POMPON_SKIN[3]); px(c, x - 2, y - 1, POMPON_SKIN[4]); }
    // the ideal round: a dotted circle just outside the ball
    if (g.state === 'play') for (let i = 0; i < 40; i++) { if ((i + fl(g.t * 8)) % 2) continue; const a = i / 40 * TAU; rect(c, cx0 + Math.cos(a) * 36 - 1, cy0 + Math.sin(a) * 36 - 1, 3, 3, INK); px(c, cx0 + Math.cos(a) * 36, cy0 + Math.sin(a) * 36, '#ffffff'); }
    // stray locks: curly fur beads with a pulsing magenta rim = "the bits that go"
    for (const tf of g.tufts) if (!tf.cut) {
      const P = this.tuftPts(g, tf), hot = Math.sin(g.t * 12 + tf.a * 3) > 0;
      pomponLock(c, P, hot ? '#ff2d8a' : INK);
    }
    const sq = g.state === 'won' ? 1 + Math.sin((g.t - g.decidedAt) * 18) * .06 * Math.max(0, 1 - (g.t - g.decidedAt) * 2) : 1;
    drawS(c, pomponBall(), cx0, cy0, { sx: sq, sy: 2 - sq });
    if (g.state === 'won') for (let i = 0; i < 4; i++) { const a = g.t * 2 + i / 4 * TAU; drawStar(c, cx0 + Math.cos(a) * 44, cy0 + Math.sin(a) * 44, 3, '#fff27a'); }
    pomponDrawPieces(c, g.flying);
    // Pompón looks back over her shoulder at her tail
    drawS(c, pomponHead(g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : 'boss'), 222, 158, { ax: .5, ay: 1, flip: true });
    // how many locks are left
    const left = g.tufts.filter(t => !t.cut).length;
    pomponTag(c, 'MECHONES: ' + left, 6, 6, left ? '#e05b98' : '#2a9a6a');
    if (g.state === 'won') pomponStamp(c, '¡REDONDITO!', g.t - g.decidedAt, 176, ['#ffffff', '#ffd1e4', '#ff5d9e']);
    if (g.state === 'lost') pomponStamp(c, '¡QUÉ DESASTRE!', g.t - g.decidedAt, 176, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const tf = g.tufts.find(t => !t.cut) || g.tufts[0], P = this.tuftPts(g, tf), m = P[3], a = tf.a + Math.PI / 2; return { mech: 'cut', x: m[0], y: m[1], path: [[m[0] + Math.cos(a) * 18, m[1] + Math.sin(a) * 18], [m[0] - Math.cos(a) * 18, m[1] - Math.sin(a) * 18]] }; },
  bot(g) {
    const tf = g.tufts.find(t => !t.cut); if (!tf) return { down: false };
    const P = this.tuftPts(g, tf), m = P[4], a = tf.a + Math.PI / 2, ph = (g._p = (g._p || 0) + 1) % 10;
    if (ph < 2) return { x: m[0] + Math.cos(a) * 14, y: m[1] + Math.sin(a) * 14, down: false };
    const q = (ph - 2) / 7; return { x: m[0] + Math.cos(a) * lerp(14, -14, q), y: m[1] + Math.sin(a) * lerp(14, -14, q), down: true };
  },
});

// ---------------------------------------------------------------- 3 NUDOS ---
// Knots are tossed up: slice them in the air. From level 2, pink bows fly
// too — those are Pompón's, never cut them.
function pomponKnot(v) {
  return mdl('pomponKnot3' + v, () => {
    const c = mkCanvas(44, 44), g = c.g, R = [RAMP.caramel, RAMP.mud, RAMP.apricot][v % 3];
    // wiry hairs poking out all round
    for (let i = 0; i < 11; i++) {
      const a = i / 11 * TAU + v * .7, r1 = 19 + (i % 3) * 1.5, x1 = 22 + Math.cos(a) * r1, y1 = 22 + Math.sin(a) * r1, cx0 = 22 + Math.cos(a + .35) * 15, cy0 = 22 + Math.sin(a + .35) * 15;
      thickLine(g, 22 + Math.cos(a) * 11, 22 + Math.sin(a) * 11, cx0, cy0, 1.1, INK); thickLine(g, cx0, cy0, x1, y1, 1.1, INK);
      linePx(g, 22 + Math.cos(a) * 11, 22 + Math.sin(a) * 11, cx0, cy0, R[2]); linePx(g, cx0, cy0, x1, y1, R[3]);
    }
    pomponPuffs(g, [[22, 13, 8], [13, 19, 8], [31, 19, 8], [15, 29, 8, 1], [29, 29, 8, 1], [22, 22, 10]], R);
    // tangles scribbled across
    for (let i = 0; i < 3; i++) { let lx = 13 + i * 6, ly = 16 + i * 5; for (let q = 1; q <= 8; q++) { const x = 13 + i * 6 + Math.sin(q * 1.3 + i) * 5 + q * 1.2, y = 16 + i * 5 + Math.cos(q * 1.7 + i) * 4; linePx(g, lx, ly, x, y, q % 2 ? R[1] : R[4]); lx = x; ly = y; } }
    // an angry little face: white eyes, V brows, gritted teeth
    for (const [ex, sd] of [[16, -1], [28, 1]]) { ellipsePx(g, ex, 21, 4, 4.4, INK); ellipsePx(g, ex, 21, 3, 3.4, '#ffffff'); rect(g, ex - 1 - sd, 21, 2, 3, INK); thickLine(g, ex - 4 * sd, 15, ex + 2 * sd, 18, .9, INK); }
    rect(g, 17, 28, 10, 5, INK); rect(g, 18, 29, 8, 3, '#ffffff'); vline(g, 20, 29, 31, INK); vline(g, 23, 29, 31, INK);
    return c;
  });
}
function pomponBowBig() { return mdl('pomponBowBig', () => { const c = mkCanvas(34, 26); pomponBowAt(c.g, 17, 12, 1.9); const B = POMPON_BOW; polyPx(c.g, [[15, 13], [11, 25], [15, 23]], INK); polyPx(c.g, [[19, 13], [23, 25], [19, 23]], INK); polyPx(c.g, [[15, 14], [12, 24], [15, 22]], B[1]); polyPx(c.g, [[19, 14], [22, 24], [19, 22]], B[1]); pomponBowAt(c.g, 17, 12, 1.9); return c; }); }
function pomponHalf(img, side) { const w = img.width, h = img.height, c = mkCanvas(w, h); c.g.drawImage(img, 0, 0); c.g.clearRect(side < 0 ? w / 2 : 0, 0, w / 2, h); return c; }
function pomponVanityBg() {
  return mdl('pomponVanityBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, SH, ['#3b2757', '#4c2a6b', '#6b3f8a', '#8a5aa8']);
    for (let i = 0; i < 40; i++) drawStar(g, hash2(i, 7) * SW, hash2(7, i) * SH, 1.5 + hash2(i, 8) * 1.5, 'rgba(255,240,200,.5)');
    rect(g, 0, 176, SW, 16, '#2b1a40'); rect(g, 0, 176, SW, 1, '#bf95e9');
    return c;
  });
}
defMG({
  id: 'nudos', stage: 'pompon', name: 'Nudos voladores', cmd: '¡CORTA!', how: 'Corta los nudos al vuelo. ¡Los lazos rosas, no!', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'lead', v: .5, n: 'C#6 B5 A5 B5 C#6 . E6 . D6 C#6 B5 C#6 D6 . F#6 . E6 D6 C#6 D6 E6 . A6 . G#6 . E6 . B5 - - .' },
    { i: 'bass', v: .85, n: 'A2 A3 A2 A3 A2 A3 A2 A3 B2 B3 B2 B3 B2 B3 B2 B3 C#3 C#4 C#3 C#4 C#3 C#4 C#3 C#4 E2 E3 E2 E3 E2 E3 E2 E3' },
    { i: 'd', v: .8, n: 'k h c h k h c h k h c h k h c c k h c h k h c h k h c h k c c c' }] }),
  init(g) {
    g.need = [3, 4, 5][g.level - 1]; g.bows = [0, 1, 3][g.level - 1]; g.sliced = 0; g.objs = []; g.halves = []; g.nextT = .05; g.bowsLeft = g.bows; g.combo = 0;
    g.blade = pomponBlade();
  },
  toss(g, kind) {
    const x = g.r(46, 210), tx = clamp(x + g.r(-60, 60), 46, 210), up = g.r(360, 420) * Math.sqrt(g.tempo);
    const T = 2 * up / 520; g.objs.push({ kind, x, y: SH + 14, vx: (tx - x) / T, vy: -up, rot: 0, vr: g.r(-4, 4), v: g.ri(0, 2), dead: false, born: g.t });
    sfx('boing', { pitch: kind === 'bow' ? 2 : 1.3, vol: .25 });
  },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.halves, dt);
    g.nextT -= dt;
    if (g.state === 'play' && g.nextT <= 0) {
      const live = g.objs.filter(o => !o.dead && o.kind === 'knot').length;
      if (live < 2) { this.toss(g, 'knot'); if (g.level >= 2 && g.r() < .6) this.toss(g, 'knot'); if (g.bowsLeft > 0 && g.r() < .5) { this.toss(g, 'bow'); g.bowsLeft--; } }
      g.nextT = g.r(.45, .7) / g.tempo;
    }
    for (const o of g.objs) {
      if (o.dead) continue;
      o.vy += 520 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt;
      if (o.y > SH + 30 && o.vy > 0) o.dead = true;
      if (g.state !== 'play') continue;
      const r = o.kind === 'bow' ? 12 : 16;
      if (g.blade.hitsCircle(o.x, o.y, r)) {
        o.dead = true;
        const img = o.kind === 'bow' ? pomponBowBig() : pomponKnot(o.v);
        for (const s of [-1, 1]) g.halves.push({ img: pomponHalf(img, s), x: o.x, y: o.y, vx: s * 90 + o.vx * .3, vy: o.vy * .3 - 60, rot: o.rot, vr: s * 8 });
        if (o.kind === 'bow') { sfx('bad'); g.fx.add({ k: 'txt', s: '¡MI LAZO!', x: o.x, y: o.y - 16, life: .8, c: '#ff5d9e' }); g.shake(3, .2); g.lose(); }
        else {
          g.sliced++; g.combo++; sfx('snip', { pitch: .9 + g.sliced * .1 }); HITSTOP = 2; buzz(8); pomponHairBurst(g, o.x, o.y, 9); g.fx.add({ k: 'ring', x: o.x, y: o.y, r: 8, grow: 16, life: .25, c: '#ffffff' });
          if (g.combo >= 2) g.fx.add({ k: 'txt', s: '¡x' + g.combo + '!', x: o.x, y: o.y - 18, life: .6, c: '#fff27a' });
          if (g.sliced >= g.need) { g.win(); pomponSparkle(g, o.x, o.y, 14); }
        }
      }
    }
    if (!IN.down) g.combo = 0;
  },
  draw(g, c) {
    c.drawImage(pomponVanityBg(), 0, 0);
    // Pompón watches from the bottom, arms up
    pomponDraw(c, 128, SH + 38, g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : 'boss');
    for (const o of g.objs) if (!o.dead) {
      if (o.kind === 'bow') {
        // a warning halo: pink ring + "NO" badge while it's fresh
        c.globalAlpha = .5 + Math.sin(g.t * 14) * .3; ringPx(c, o.x, o.y, 17, '#ff5d9e'); c.globalAlpha = 1;
        drawS(c, pomponBowBig(), o.x, o.y, { rot: o.rot * .3 });
        if (g.t - o.born < 1.1) { panel(c, o.x + 10, o.y - 22, 20, 11, '#ff4060', { r: 3 }); txt(c, 'NO', o.x + 20, o.y - 20, '#ffffff', { align: 'c', bold: true }); }
      } else drawS(c, pomponKnot(o.v), o.x, o.y, { rot: o.rot });
    }
    pomponDrawPieces(c, g.halves);
    // knots to go, as little knot icons
    for (let i = 0; i < g.need; i++) { const on = i < g.sliced, x = SW - 14 - i * 16; disc(c, x, 13, 7, INK); disc(c, x, 13, 6, on ? '#5bd18b' : '#8a5aa8'); if (on) { thickLine(c, x - 3, 13, x - 1, 16, .7, INK); thickLine(c, x - 1, 16, x + 3, 9, .7, INK); } else drawS(c, pomponKnot(0), x, 13, { s: .35 }); }
    if (g.state === 'won') pomponStamp(c, '¡SIN NUDOS!', g.t - g.decidedAt, 36, ['#ffffff', '#ffd1e4', '#ff5d9e']);
    if (g.state === 'lost') pomponStamp(c, g.objs.some(o => o.kind === 'bow' && o.dead && o.y < SH) ? '¡EL LAZO NO!' : '¡QUEDAN NUDOS!', g.t - g.decidedAt, 36, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const o = g.objs.find(o => !o.dead && o.kind === 'knot'); const x = o ? clamp(o.x + o.vx * .5, 50, 206) : 128, y = 80; return { mech: 'cut', x, y, path: [[x - 24, y - 14], [x + 24, y + 14]] }; },
  bot(g) {
    const o = g.objs.filter(o => !o.dead && o.kind === 'knot' && o.y < SH - 10 && o.y > 10).sort((a, b) => a.vy - b.vy)[0];
    if (!o) return { down: false };
    const bow = g.objs.find(b => !b.dead && b.kind === 'bow' && dist(b.x, b.y, o.x, o.y) < 38); if (bow) return { down: false };
    const ph = (g._p = (g._p || 0) + 1) % 8;
    if (ph < 2) return { x: o.x - 16, y: o.y - 10, down: false };
    const q = (ph - 2) / 5; return { x: o.x - 16 + q * 32 + o.vx * STEP * ph, y: o.y - 10 + q * 20 + o.vy * STEP * ph, down: true };
  },
});

// ---------------------------------------------------------------- 4 CHUCHES -
// One long treat, N hungry puppies: cut it into fair pieces along the marks.
function pomponPuppy(v) {
  return mdl('pomponPup3' + v, () => {
    const R = [POMPON_FUR, RAMP.cream, RAMP.grey, RAMP.apricot][v % 4], c = mkCanvas(40, 40), g = c.g;
    const ear = sd => [[20 + sd * 12, 17, 5], [20 + sd * 13, 24, 5.2, 1], [20 + sd * 12, 31, 4.6, 1]];
    pomponPuffs(g, ear(-1), R); pomponPuffs(g, ear(1), R);
    pomponPuffs(g, [[13, 11, 6], [27, 11, 6], [20, 8, 6.5], [12, 20, 6.5], [28, 20, 6.5], [15, 28, 6, 1], [25, 28, 6, 1], [20, 18, 9]], R);
    // muzzle, nose, eyes, mouth, blush
    ellipsePx(g, 20, 28, 7.6, 5.6, INK); ellipsePx(g, 20, 28, 6.4, 4.4, R[4]);
    ellipsePx(g, 20, 25.5, 2.8, 2, INK); px(g, 19, 25, '#8a8699');
    for (const ex of [14, 26]) { rect(g, ex - 2, 17, 4, 5, INK); px(g, ex - 1, 18, '#ffffff'); px(g, ex, 18, '#ffffff'); }
    px(g, 18, 29, INK); px(g, 19, 30, INK); px(g, 20, 29, INK); px(g, 21, 30, INK); px(g, 22, 29, INK);
    for (const bx of [9, 29]) { px(g, bx, 24, '#ff93bf'); px(g, bx + 1, 24, '#ff93bf'); }
    return c;
  });
}
// a long twisted treat stick; the outer pieces keep the rounded ends
function pomponTreatBar(len, capL = false, capR = false) {
  return mdl('pomponTreat3' + rd(len) + (capL ? 'L' : '') + (capR ? 'R' : ''), () => {
    const w = Math.max(4, rd(len)), c = mkCanvas(w + 2, 18), g = c.g, T = RAMP.caramel, top = 3, h = 12, r = 6;
    const inside = (x, y, grow) => {
      const cx = x + .5, cy = y + .5;
      if (cy < top - grow || cy > top + h + grow) return false;
      const a = 1 + (capL ? r : 0), b = w - (capR ? r : 0);
      if (cx >= a - (capL ? 0 : grow) && cx <= b + (capR ? 0 : grow)) return true;
      if (capL && Math.hypot(cx - (1 + r), cy - (top + r)) <= r + grow) return true;
      if (capR && Math.hypot(cx - (w - r), cy - (top + r)) <= r + grow) return true;
      return false;
    };
    for (let y = 0; y < 18; y++) for (let x = 0; x < w + 2; x++) {
      if (inside(x, y, 0)) { const d = y - top, st = ((x + d) % 6 + 6) % 6; g.fillStyle = d <= 0 ? T[4] : d >= h - 2 ? T[1] : st < 2 ? T[3] : st === 2 ? T[4] : T[2]; g.fillRect(x, y, 1, 1); }
      else if (inside(x, y, 1.2)) { g.fillStyle = INK; g.fillRect(x, y, 1, 1); }
    }
    return c;
  });
}
defMG({
  id: 'chuches', stage: 'pompon', name: 'Reparto justo', cmd: '¡REPARTE!', how: 'Corta la chuche en trozos iguales: uno por cachorro', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .65, n: 'A5 C#6 E6 C#6 A5 . . . F#5 A5 D6 A5 F#5 . . . E5 G#5 B5 G#5 E5 . . . A5 C#6 E6 A6 E6 . . .' },
    { i: 'bass', v: .8, n: 'A2 . . . . . . . D3 . . . . . . . E3 . . . . . . . A2 . . . E3 . . .' },
    { i: 'd', v: .6, n: 'k . z . c . z . k . z . c . z z k . z . c . z . k . z . c c c .' }] }),
  init(g) {
    g.n = g.level + 1; g.x0 = 38; g.x1 = 218; g.y = 70; g.cuts = []; g.blade = pomponBlade(); g.drop = -1; g.fair = null;
    g.pups = []; for (let i = 0; i < g.n; i++) g.pups.push({ x: lerp(52, 204, g.n === 1 ? .5 : i / (g.n - 1)), v: g.ri(0, 3), got: null });
    g.tol = [2.1, 1.85, 1.6][g.level - 1];
  },
  pieces(g) { const xs = [g.x0, ...g.cuts.slice().sort((a, b) => a - b), g.x1]; const out = []; for (let i = 1; i < xs.length; i++) out.push([xs[i - 1], xs[i]]); return out; },
  update(g, dt) {
    g.blade.update(g, dt);
    if (g.state === 'play' && g.drop < 0) {
      const s = g.blade.seg;
      if (s && Math.abs(s[3] - s[1]) > 1 && (s[1] - (g.y + 8)) * (s[3] - (g.y + 8)) <= 0) {
        const q = (g.y + 8 - s[1]) / (s[3] - s[1]), cx0 = lerp(s[0], s[2], q);
        if (cx0 > g.x0 + 8 && cx0 < g.x1 - 8 && g.cuts.every(c => Math.abs(c - cx0) > 10)) {
          g.cuts.push(cx0); sfx('snip'); HITSTOP = 2; buzz(8); g.shake(1.5, .1);
          g.fx.burst(cx0, g.y + 8, 8, { k: 'dot', c: ['#c0662c', '#e2934a', '#8a3e1c'], sp0: 20, sp1: 80, g: 300, r: 1.4 });
          if (g.cuts.length >= g.n - 1) {
            const L = this.pieces(g).map(([a, b]) => b - a), ratio = Math.max(...L) / Math.min(...L);
            g.fair = ratio <= g.tol; g.drop = g.t;
            this.pieces(g).forEach((p, k) => { g.pups[k].got = k; });
            if (g.fair) { g.win(); sfx('gulp', { delay: .45 }); sfx('heart', { delay: .6 }); } else { g.lose(); sfx('whine', { delay: .45, pitch: 1.6 }); }
          }
        }
      }
    }
  },
  draw(g, c) {
    // the salon counter, a tape measure and a chopping board
    rect(c, 0, 0, SW, SH, '#fff4dc'); subwayTiles(c, 0, 0, SW, 104);
    dresser(c, -4, 102, SW + 8, 28);
    rect(c, 26, 60, 204, 30, INK); rect(c, 27, 61, 202, 28, RAMP.wood[3]); rect(c, 27, 61, 202, 1, RAMP.wood[4]); for (let x = 32; x < 228; x += 18) rect(c, x, 64, 10, 1, RAMP.wood[2]);
    // tape measure with ticks (the fair spots glow at level 1, show as ticks at 2)
    rect(c, 26, 42, 204, 12, INK); rect(c, 27, 43, 202, 10, '#ffdf4f');
    for (let x = g.x0; x <= g.x1; x += 6) vline(c, x, 43, 43 + ((x - g.x0) % 30 === 0 ? 6 : 3), INK);
    const P = this.pieces(g), ideal = (g.x1 - g.x0) / g.n;
    const pieceAt = (i, a, b) => {
      let x = a, y = g.y - 1, rot = 0;
      if (g.drop >= 0) { const k = clamp((g.t - g.drop) / .5, 0, 1), pup = g.pups.findIndex(p => p.got === i); if (pup >= 0) { const tx = g.pups[pup].x - (b - a) / 2; x = lerp(a, tx, E.outQ(k)); y = lerp(g.y - 1, 172, E.inQ(k)) - Math.sin(k * Math.PI) * 30; rot = (1 - k) * k * 4 * (i - (g.n - 1) / 2) * .3; } }
      return { x, y, rot };
    };
    const drawPiece = (i, a, b) => { const q = pieceAt(i, a, b), img = pomponTreatBar(b - a, i === 0, i === P.length - 1); drawS(c, img, q.x + (b - a) / 2, q.y + 9, { rot: q.rot }); };
    if (g.drop < 0) P.forEach(([a, b], i) => drawPiece(i, a, b));
    // where the fair cuts go: a full guide at level 1, just red ticks on the tape at 2, nothing at 3
    if (g.drop < 0) for (let i = 1; i < g.n; i++) {
      const x = g.x0 + ideal * i;
      if (g.level <= 2) rect(c, x - 1, 42, 3, 12, '#ff4060');
      if (g.level === 1) pomponGuide(c, [[x, 58], [x, 98]], g.t, false);
    }
    // the puppies wait on a rug, each dreaming of a piece
    rect(c, 0, 130, SW, 62, RAMP.wood[2]); for (let y = 136; y < SH; y += 8) rect(c, 0, y, SW, 1, RAMP.wood[1]);
    ellipsePx(c, 128, 184, 118, 10, '#ff93bf'); ellipsePx(c, 128, 183, 112, 8, '#ffb3d1');
    g.pups.forEach((p, i) => {
      const got = g.drop >= 0 && g.t - g.drop > .5, L = got && p.got != null ? P[p.got][1] - P[p.got][0] : 0, small = got && L < ideal / g.tol * 1.02;
      const bob = Math.abs(Math.sin(g.t * 6 + i)) * (got && !small ? 4 : 1.5);
      drawS(c, pomponPuppy(p.v), p.x, 184 - bob, { ax: .5, ay: 1 });
      if (!got) { panel(c, p.x + 8, 132 - bob, 18, 12, '#ffffff', { r: 5 }); rect(c, p.x + 11, 136 - bob, 12, 4, '#c0662c'); px(c, p.x + 1, 172, '#9bd6f7'); }
      else if (small && g.state === 'lost') { txt(c, '¡No es justo!', clamp(p.x, 40, 216), 134, '#ffffff', { align: 'c', out: INK }); vline(c, p.x - 5, 162, 168, '#9bd6f7'); }
      else if (g.state === 'won') drawHeart(c, p.x, 138 - ((g.t * 2 + i) % 1) * 16, '#ff5d9e', 1);
    });
    if (g.drop >= 0) P.forEach(([a, b], i) => drawPiece(i, a, b));
    if (g.state === 'play') pomponTag(c, 'CORTES: ' + g.cuts.length + '/' + (g.n - 1), 6, 6, INK);
    if (g.state === 'won') pomponStamp(c, '¡A PARTES IGUALES!', g.t - g.decidedAt - .5, 26, ['#ffffff', '#d2f5e4', '#5bb593']);
    if (g.state === 'lost') pomponStamp(c, '¡INJUSTO!', g.t - g.decidedAt - .3, 26, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const x = g.x0 + (g.x1 - g.x0) / g.n; return { mech: 'cut', x, y: g.y - 18, path: [[x, g.y - 18], [x, g.y + 30]] }; },
  bot(g) {
    const ideal = (g.x1 - g.x0) / g.n, next = g.cuts.length + 1; if (next > g.n - 1 || g.drop >= 0) return { down: false };
    const x = g.x0 + ideal * next, ph = (g._p = (g._p || 0) + 1) % 10;
    if (ph < 2) return { x, y: g.y - 18, down: false };
    return { x, y: g.y - 18 + (ph - 2) * 8, down: true };
  },
});

// ---------------------------------------------------------------- 5 CINTA ---
// Opening night at the Palau Sant Guau: cut the red ribbon. Later it sways,
// then there are two.
function pomponGala() {
  return mdl('pomponGalaBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 110, ['#101a3a', '#1c2a5a', '#2b3a6b']);
    for (let i = 0; i < 30; i++) px(g, hash2(i, 5) * SW, hash2(5, i) * 60, '#ffffff');
    ellipsePx(g, SW / 2, 118, 130, 56, '#3d4f8a'); rect(g, 0, 110, SW, 40, '#3d4f8a');
    for (let x = 12; x < SW; x += 22) rect(g, x, 116, 10, 34, '#4f63a6');
    panel(g, 58, 60, 140, 18, '#fff27a', { r: 4 }); txt(g, 'PALAU SANT GUAU', SW / 2, 65, INK, { align: 'c', bold: true });
    // red carpet
    rect(g, 0, 150, SW, 42, '#b3a6c9'); polyPx(g, [[96, 150], [160, 150], [206, SH], [50, SH]], '#c02d45'); polyPx(g, [[100, 150], [156, 150], [200, SH], [56, SH]], '#d83a52');
    return c;
  });
}
function pomponPost(c, x) { rect(c, x - 4, 176, 9, 4, INK); rect(c, x - 3, 177, 7, 2, RAMP.gold[2]); rect(c, x - 2, 110, 5, 67, INK); rect(c, x - 1, 111, 3, 65, RAMP.gold[3]); px(c, x - 1, 112, RAMP.gold[4]); disc(c, x, 108, 4, INK); disc(c, x, 108, 3, RAMP.gold[3]); px(c, x - 1, 107, RAMP.gold[4]); }
defMG({
  id: 'cinta', stage: 'pompon', name: 'Inauguración', cmd: '¡INAUGURA!', how: 'Corta la cinta roja de un tijeretazo', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'brass', v: .55, n: 'A4 - C#5 - E5 - A5 - - - E5 - A5 - C#6 - B5 - A5 - G#5 - E5 - F#5 - G#5 - A5 - - -' },
    { i: 'p12', v: .3, n: 'A5 . A5 . A5 . A5 . A5 . A5 . A5 . A5 . B5 . B5 . B5 . B5 . C#6 . C#6 . C#6 . C#6 .' },
    { i: 'bass', v: .85, n: 'A2 . A2 . A2 . A2 . F#2 . F#2 . F#2 . F#2 . D2 . D2 . E2 . E2 . A2 . E2 . A2 . . .' },
    { i: 'd', v: .75, n: 'k . s . k . s . k . s . k s s s k . s . k . s . k . s . k+x . . .' }] }),
  init(g) {
    const L = g.level;
    g.ribbons = (L === 3 ? [118, 150] : [134]).map((y, i) => ({ y, amp: L === 1 ? 0 : 12 + i * 4, sp: (L === 3 ? 3.4 : 2.6) * g.tempo, ph: i * 2, cut: -1, cutT: 0 }));
    g.blade = pomponBlade(); g.flashes = [];
  },
  ribY(g, r, x) { return r.y + Math.sin(g.t * r.sp + r.ph + x * .02) * r.amp * Math.sin(Math.PI * (x - 28) / 200); },
  update(g, dt) {
    g.blade.update(g, dt);
    if (g.state === 'play') for (const r of g.ribbons) {
      if (r.cut >= 0) continue;
      for (let x = 30; x < 226; x += 6) {
        if (g.blade.crosses(x, this.ribY(g, r, x), x + 6, this.ribY(g, r, x + 6))) {
          r.cut = x; r.cutT = g.t; sfx('snip'); HITSTOP = 3; buzz(15); g.shake(2, .15);
          g.fx.burst(x, this.ribY(g, r, x), 10, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 50, sp1: 140 });
          break;
        }
      }
    }
    if (g.state === 'play' && g.ribbons.every(r => r.cut >= 0)) {
      g.win(); sfx('slam'); sfx('sparkle', { delay: .1 });
      for (const [x, dir] of [[20, 1], [236, -1]]) for (let i = 0; i < 30; i++) g.fx.add({ k: 'conf', x, y: 150, vx: dir * g.r(40, 160), vy: -g.r(120, 300), g: 260, life: 1.6, c: g.pick(['#ff5d9e', '#fff27a', '#63e6ff', '#94ffb4', '#ffffff']), rot: g.r(TAU), vr: g.r(-10, 10) });
    }
    if (g.r() < (g.state === 'won' ? .14 : .03)) g.flashes.push({ x: g.r(20, 236), y: g.r(90, 140), t: g.t });
  },
  draw(g, c) {
    c.drawImage(pomponGala(), 0, 0);
    for (const f of g.flashes) if (g.t - f.t < .12) { disc(c, f.x, f.y, 6, '#ffffff'); drawStar(c, f.x, f.y, 9, '#ffffff'); }
    // Pompón waits behind the ribbon, mic in paw
    pomponDraw(c, 158, 184, g.state === 'won' ? 'clear' : g.state === 'lost' ? 'lose' : 'sing', { jump: g.state === 'won' ? Math.abs(Math.sin(g.t * 8)) * 6 : 0 });
    pomponPost(c, 24); pomponPost(c, 232);
    for (const r of g.ribbons) {
      const drawSeg = (xa, xb, pull) => { for (let x = xa; x < xb; x++) { const y = this.ribY(g, r, x) + pull(x); rect(c, x, y - 5, 1, 11, INK); } for (let x = xa; x < xb; x++) { const y = this.ribY(g, r, x) + pull(x); rect(c, x, y - 4, 1, 9, '#d0344a'); px(c, x, y - 4, '#ff8a8a'); px(c, x, y - 3, '#ff8a8a'); px(c, x, y + 4, '#8c1d30'); } };
      if (r.cut < 0) { drawSeg(28, 229, () => 0); pomponBowAt(c, 128, this.ribY(g, r, 128), 2); }
      else {
        const k = clamp((g.t - r.cutT) / .5, 0, 1), sp = spring(g.t - r.cutT, 3, 6);
        drawSeg(28, r.cut - rd(k * (r.cut - 40)), x => (x - 28) * .15 * k + Math.sin(x * .3 + g.t * 20) * (1 - sp) * 2);
        drawSeg(r.cut + rd(k * (220 - r.cut)), 229, x => (229 - x) * .15 * k + Math.sin(x * .3 + g.t * 20) * (1 - sp) * 2);
        const bk = g.t - r.cutT; drawS(c, pomponBowBig(), 128 + bk * 20, this.ribY(g, r, 128) + bk * bk * 300, { rot: bk * 6 });
      }
    }
    if (g.state === 'won') pomponStamp(c, '¡INAUGURADO!', g.t - g.decidedAt - .1, 30);
    if (g.state === 'lost') pomponStamp(c, '¡SIN CORTAR!', g.t - g.decidedAt, 30, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const r = g.ribbons.find(r => r.cut < 0) || g.ribbons[0], x = 90, y = this.ribY(g, r, x); return { mech: 'cut', x, y: y - 22, path: [[x, y - 22], [x + 8, y + 22]] }; },
  bot(g) {
    const r = g.ribbons.find(r => r.cut < 0); if (!r) return { down: false };
    const x = 128 + (g.ribbons.indexOf(r) ? 30 : -30), y = this.ribY(g, r, x), ph = (g._p = (g._p || 0) + 1) % 8;
    if (ph < 2) return { x, y: y - 22, down: false };
    return { x, y: y - 22 + (ph - 2) * 9, down: true };
  },
});

// ---------------------------------------------------------------- 6 PODA ----
// NEW · The Palau garden: a hedge being clipped into a topiary poodle. Leafy
// clumps stick out of the dotted poodle outline — slice them off.
const POMPON_LEAF = ['#1d4a24', '#2f6e32', '#4a9a3e', '#78c25a', '#b4e58a'];
function pomponTopiary() {
  return mdl('pomponTopiary', () => {
    const body = SD.ellipse(128, 104, 34, 20), chest = SD.circle(158, 90, 18), head = SD.circle(172, 58, 15), knot = SD.circle(170, 38, 11);
    const ear = SD.ellipse(160, 70, 7, 13), legs = SD.union(SD.capsule(104, 110, 102, 142, 5, 4.5), SD.capsule(152, 106, 154, 142, 5, 4.5));
    const cuffs = SD.union(SD.circle(102, 138, 9), SD.circle(154, 138, 9)), tail = SD.union(SD.capsule(94, 96, 80, 72, 3.2, 3), SD.circle(78, 66, 11)), snout = SD.ellipse(188, 62, 9, 6);
    const S = SD.union(body, chest, head, knot, legs, cuffs, tail, snout, ear);
    const c = model(SW, SH, [{ f: SD.curls(S, 1.8, .55, 5), fs: S, ramp: POMPON_LEAF, z: 1, th: 16, tex: clumpTex(4, .34, 11, 1, 1), dith: 0 }], { selout: false });
    return c;
  });
}
// the clumps to trim: [attach x, y, out angle, size]
const POMPON_CLUMPS = [[126, 84, -1.6, 17], [172, 44, -1.2, 15], [80, 56, -2.3, 13], [194, 70, -.2, 13], [128, 124, 1.6, 15], [148, 78, -.9, 13], [104, 150, 2.4, 13], [60, 72, 3.1, 12]];
// an overgrown clump: lime leaves and twigs poking every which way (the neat
// hedge is dark green, so what has to go is obvious at a glance)
function pomponClump(sz, seed) {
  return mdl('pomponClump2:' + sz + ':' + seed, () => {
    const R = sz + 8, c = mkCanvas(R * 2, R * 2), g = c.g, L = ['#2c5a12', '#4f8a1c', '#86c93a', '#bfe860', '#effbb0'];
    const leaf = (x, y, a, l, col, grow = 0) => { const ca = Math.cos(a), sa = Math.sin(a), w = l * .42 + grow, P = []; for (let i = 0; i <= 8; i++) { const q = i / 8 * TAU, u = Math.cos(q) * (l + grow), v = Math.sin(q) * w * (Math.cos(q) > 0 ? 1 - Math.cos(q) * .35 : 1); P.push([x + ca * u - sa * v, y + sa * u + ca * v]); } polyPx(g, P, col); };
    for (let i = 0; i < 5; i++) { const a = hash2(seed, i) * TAU, l = sz * (.95 + hash2(i, seed) * .35), x1 = R + Math.cos(a) * l, y1 = R + Math.sin(a) * l; thickLine(g, R, R, x1, y1, 1.3, INK); linePx(g, R, R, x1, y1, '#8a5a2a'); leaf(x1, y1, a, 3.2, INK, 1.2); leaf(x1, y1, a, 3.2, L[3]); }
    const leaves = [];
    for (let i = 0; i < 15; i++) { const a = i / 15 * TAU + hash2(seed, i + 9) * .6, d = sz * (.3 + hash2(i + 3, seed) * .45); leaves.push([R + Math.cos(a) * d, R + Math.sin(a) * d, a + (hash2(i, 7) - .5) * .8]); }
    const l = sz * .5;
    for (const [x, y, a] of leaves) leaf(x, y, a, l, INK, 1.3);
    for (const [x, y, a] of leaves) { leaf(x, y, a, l, L[1]); leaf(x - 1, y - 1, a, l * .82, L[2]); thickLine(g, x - Math.cos(a) * l * .5, y - Math.sin(a) * l * .5, x + Math.cos(a) * l * .6, y + Math.sin(a) * l * .6, 0, L[3]); }
    for (let i = 0; i < 4; i++) px(g, R + (hash2(i, seed + 1) - .5) * sz, R + (hash2(seed + 1, i) - .5) * sz, L[4]);
    return c;
  });
}
function pomponPlanter(c) {
  rect(c, 82, 140, 94, 28, INK); rect(c, 83, 141, 92, 26, '#c9744a'); for (let x = 92; x < 172; x += 18) rect(c, x, 148, 2, 16, '#a45a3a');
  rect(c, 78, 136, 102, 7, INK); rect(c, 79, 137, 100, 5, '#e8996a'); hline(c, 79, 178, 137, '#ffc39a'); rect(c, 83, 143, 92, 2, '#8e4a2c');
}
function pomponGardenBg() {
  return mdl('pomponGardenBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 120, ['#8fd0ff', '#a8dcff', '#c8ecff', '#e2f6ff']);
    for (const [x, y, r] of [[40, 30, 12], [58, 26, 15], [76, 32, 11], [196, 22, 13], [214, 26, 10]]) { disc(g, x, y, r + 1, '#dff4ff'); disc(g, x, y, r, '#ffffff'); }
    // the Palau in the distance
    rect(g, 150, 80, 100, 40, '#b7c7e0'); ellipsePx(g, 200, 82, 50, 18, '#9fb4d6'); for (let x = 156; x < 246; x += 10) rect(g, x, 92, 4, 26, '#9fb4d6');
    for (let x = 0; x < SW; x += 16) { disc(g, x + 8, 118, 11, POMPON_LEAF[1]); disc(g, x + 6, 115, 7, POMPON_LEAF[2]); }
    rect(g, 0, 124, SW, 68, '#6dbb4f'); for (let y = 126; y < SH; y += 3) for (let x = (y % 6); x < SW; x += 6) px(g, x, y, '#5aa844');
    // gravel path + planter
    polyPx(g, [[96, 124], [160, 124], [200, SH], [56, SH]], '#e8d9b8'); for (let i = 0; i < 90; i++) px(g, 70 + hash2(i, 3) * 120, 130 + hash2(3, i) * 60, '#c9b690');
    return c;
  });
}
defMG({
  id: 'poda', stage: 'pompon', name: 'Poda de gala', cmd: '¡PODA!', how: 'Corta las matas que se salen del caniche de seto', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .65, n: 'E5 G#5 B5 E6 . B5 G#5 . F#5 A5 C#6 F#6 . C#6 A5 . E5 G#5 B5 E6 . B5 G#5 . D#6 . B5 . E6 - - .' },
    { i: 'bass', v: .85, n: 'E2 . . E3 . . E2 . F#2 . . F#3 . . F#2 . G#2 . . G#3 . . G#2 . B2 . . B2 . E3 . .' },
    { i: 'd', v: .7, n: 'k . h . c . h h k . h . c . h . k . h . c . h h k k h . c c c .' }] }),
  init(g) {
    const n = [3, 4, 5][g.level - 1], idx = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = idx.length - 1; i > 0; i--) { const j = g.ri(0, i); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    idx.length = n;
    g.clumps = idx.map((i, k) => { const [x, y, a, sz] = POMPON_CLUMPS[i]; const s = g.level === 3 ? sz - 2 : sz; return { x, y, a, sz: s, cut: false, seed: i + 1, fall: null, sway: g.r(TAU) }; });
    g.blade = pomponBlade();
  },
  // a clump's centre sits out along its angle; the "neck" is the cut segment
  clumpPos(g, cl) { const sw = g.level === 3 ? Math.sin(g.t * 5 + cl.sway) * 3 : 0, r = cl.sz * .9; return [cl.x + Math.cos(cl.a) * r + sw, cl.y + Math.sin(cl.a) * r]; },
  update(g, dt) {
    g.blade.update(g, dt);
    for (const cl of g.clumps) if (cl.fall) { cl.fall.vy += 520 * dt; cl.fall.x += cl.fall.vx * dt; cl.fall.y += cl.fall.vy * dt; cl.fall.rot += cl.fall.vr * dt; }
    if (g.state !== 'play') return;
    for (const cl of g.clumps) {
      if (cl.cut) continue;
      // the stalk runs from inside the hedge out through the clump: any slice across it cuts
      const [cx0, cy0] = this.clumpPos(g, cl), ca = Math.cos(cl.a), sa = Math.sin(cl.a), far = cl.sz * 1.6;
      if (g.blade.crosses(cl.x - ca * 4, cl.y - sa * 4, cl.x + ca * far, cl.y + sa * far) || g.blade.hitsCircle(cx0, cy0, cl.sz * .6)) {
        cl.cut = true; cl.fall = { x: cx0, y: cy0, vx: Math.cos(cl.a) * 80, vy: Math.sin(cl.a) * 80 - 90, rot: 0, vr: g.r(-6, 6) };
        sfx('snip', { pitch: .9 + g.clumps.filter(c => c.cut).length * .1 }); HITSTOP = 2; buzz(8);
        g.fx.burst(cx0, cy0, 12, { k: 'dot', c: POMPON_LEAF.slice(1), sp0: 30, sp1: 110, g: 260, r: 1.6, life0: .4, life1: .8 });
        g.fx.add({ k: 'txt', s: '¡CHAS!', x: cx0, y: cy0 - 14, life: .45, c: '#ffffff' });
      }
    }
    if (g.clumps.every(c => c.cut)) { g.win(); sfx('sparkle'); pomponSparkle(g, 150, 80, 18); }
  },
  draw(g, c) {
    c.drawImage(pomponGardenBg(), 0, 0);
    c.drawImage(pomponTopiary(), 0, 0); pomponPlanter(c);
    for (const cl of g.clumps) {
      if (cl.cut) { if (cl.fall && cl.fall.y < SH + 30) drawS(c, pomponClump(cl.sz, cl.seed), cl.fall.x, cl.fall.y, { rot: cl.fall.rot }); continue; }
      const [cx0, cy0] = this.clumpPos(g, cl), pulse = .5 + .5 * Math.sin(g.t * 10 + cl.seed);
      drawS(c, pomponClump(cl.sz, cl.seed), cx0, cy0, { s: 1 + pulse * .07 });
      // a spinning dashed ring = "this bit goes"
      const R = cl.sz * 1.45 + pulse * 1.5, n = 18;
      for (let i = 0; i < n; i++) { if (i % 3 === 2) continue; const a = i / n * TAU + g.t * 1.5, x = cx0 + Math.cos(a) * R, y = cy0 + Math.sin(a) * R; disc(c, x, y, 1.9, INK); disc(c, x, y, 1, '#ffffff'); }
    }
    if (g.state === 'won') { pomponBowAt(c, 170, 30, 1.6); for (let i = 0; i < 5; i++) { const a = g.t * 2 + i / 5 * TAU; drawStar(c, 140 + Math.cos(a) * 70, 92 + Math.sin(a) * 50, 3, '#fff27a'); } }
    // Pompón supervises from the path
    pomponDraw(c, 44, 190, g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : 'ready', { jump: g.state === 'won' ? Math.abs(Math.sin(g.t * 8)) * 5 : 0 });
    const left = g.clumps.filter(c => !c.cut).length;
    pomponTag(c, 'MATAS: ' + left, 250, 6, left ? '#2f6e32' : '#e05b98', true);
    if (g.state === 'won') pomponStamp(c, '¡OBRA DE ARTE!', g.t - g.decidedAt, 176, ['#ffffff', '#d2f5e4', '#5bb593']);
    if (g.state === 'lost') pomponStamp(c, '¡ESTÁ HECHO UN ZARZAL!', g.t - g.decidedAt, 176, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const cl = g.clumps.find(c => !c.cut) || g.clumps[0], n = cl.a + Math.PI / 2, x = cl.x + Math.cos(cl.a) * 4, y = cl.y + Math.sin(cl.a) * 4, P = [[x + Math.cos(n) * 22, y + Math.sin(n) * 22], [x - Math.cos(n) * 22, y - Math.sin(n) * 22]]; return { mech: 'cut', x: P[0][0], y: P[0][1], path: P }; },
  bot(g) {
    const cl = g.clumps.find(c => !c.cut); if (!cl) return { down: false };
    const n = cl.a + Math.PI / 2, x = cl.x + Math.cos(cl.a) * 4, y = cl.y + Math.sin(cl.a) * 4, ph = (g._p = (g._p || 0) + 1) % 9;
    if (ph < 2) return { x: x + Math.cos(n) * 20, y: y + Math.sin(n) * 20, down: false };
    const q = (ph - 2) / 6; return { x: x + Math.cos(n) * lerp(20, -20, q), y: y + Math.sin(n) * lerp(20, -20, q), down: true };
  },
});

// ---------------------------------------------------------------- 7 PATRÓN --
// NEW · Stage costume: cut the chalk shape out of the sequinned fabric in one
// go. It becomes the appliqué on Pompón's jacket.
const POMPON_SHAPES = {
  heart: (() => { const p = []; for (let i = 0; i <= 32; i++) { const t = i / 32 * TAU; p.push([128 + 16 * Math.sin(t) ** 3 * 3.1, 96 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 3.1]); } return p; })(),
  star: (() => { const p = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 24 : 58; p.push([128 + Math.cos(a) * r, 100 + Math.sin(a) * r]); } return p; })(),
  note: [[104, 132], [96, 124], [98, 112], [110, 108], [122, 112], [122, 50], [160, 42], [168, 50], [168, 62], [132, 70], [132, 126], [124, 138], [110, 140], [104, 132]],
};
function pomponFabricBg() {
  return mdl('pomponFabricBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, RAMP.wood[3]); for (let y = 0; y < SH; y += 12) rect(g, 0, y, SW, 1, RAMP.wood[2]);
    rect(g, 14, 14, 228, 170, INK); rect(g, 15, 15, 226, 168, '#ff82b4');
    for (let y = 18; y < 182; y += 6) for (let x = 18 + ((y / 6) % 2) * 3; x < 240; x += 6) { disc(g, x, y, 2, '#ff9fc6'); px(g, x - 1, y - 1, '#ffd1e4'); }
    // tape measure + pins
    rect(g, 0, 186, SW, 6, '#ffdf4f'); for (let x = 0; x < SW; x += 6) vline(g, x, 186, 188, INK);
    for (const [x, y] of [[26, 26], [230, 26], [26, 172], [230, 172]]) { disc(g, x, y, 3, INK); disc(g, x, y, 2, '#63a0ef'); px(g, x - 1, y - 1, '#ffffff'); }
    return c;
  });
}
defMG({
  id: 'patron', stage: 'pompon', name: 'Patronaje estelar', cmd: '¡RECORTA!', how: 'Recorta la figura siguiendo la línea, sin levantar el dedo', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .6, n: 'B5 . D#6 . F#6 . D#6 . B5 . A#5 . B5 - - . G#5 . B5 . E6 . B5 . G#5 . F#5 . G#5 - - .' },
    { i: 'p12', v: .28, n: 'B4 D#5 F#5 D#5 B4 D#5 F#5 D#5 B4 D#5 F#5 D#5 B4 D#5 F#5 D#5 E4 G#4 B4 G#4 E4 G#4 B4 G#4 F#4 A#4 C#5 A#4 F#4 A#4 C#5 A#4' },
    { i: 'bass', v: .85, n: 'B2 . . B2 . . B3 . B2 . . B2 . . B3 . E2 . . E2 . . E3 . F#2 . . F#2 . . F#3 .' },
    { i: 'd', v: .75, n: 'k . c . k . c h k . c . k . c c k . c . k . c h k . c . k c c c' }] }),
  init(g) {
    g.shape = ['heart', 'star', 'note'][g.level - 1];
    g.trace = pomponTrace(POMPON_SHAPES[g.shape], 40, g.level === 1 ? 12 : 10);
    g.blade = pomponBlade(0); g.popT = -1; g.tear = null;
  },
  update(g, dt) {
    g.blade.update(g, dt);
    if (g.state !== 'play') return;
    const tr = g.trace;
    tr.feed();
    if (tr.frac() >= .8) { tr.done = true; g.popT = g.t; g.win(); sfx('snip'); sfx('snip', { delay: .07, pitch: 1.2 }); sfx('sparkle', { delay: .15 }); HITSTOP = 3; buzz(15); pomponSparkle(g, 128, 96, 18); }
    if (IN.rel && g.level > 1 && !tr.done && tr.frac() > 0) { // let go halfway: the fabric rips
      if (tr.frac() > .25) { g.tear = { x: IN.x, y: IN.y, t: g.t }; sfx('bad'); g.shake(2, .2); g.lose(); } else tr.reset();
    }
  },
  draw(g, c) {
    c.drawImage(pomponFabricBg(), 0, 0);
    const P = POMPON_SHAPES[g.shape];
    if (g.popT >= 0) {
      // the cut piece lifts out: a hole in the fabric + the shape floating up
      polyPx(c, P, '#8a2350');
      const k = spring(g.t - g.popT, 2, 5), lift = Math.min(1, (g.t - g.popT) * 2);
      c.save(); c.translate(128, 96 - lift * 26); c.rotate(Math.sin(g.t * 3) * .12 * lift); c.scale(.55 + .45 * k, .55 + .45 * k); c.translate(-128, -96);
      polyPx(c, P.map(([x, y]) => [x + 2, y + 3]), 'rgba(29,20,36,.4)'); polyPx(c, P.map(([x, y]) => [x - 1, y - 1]), INK); polyPx(c, P, '#ffdf4f');
      for (let i = 0; i < 18; i++) { const [x, y] = P[fl(i / 18 * P.length)]; disc(c, lerp(x, 128, .3), lerp(y, 96, .3), 2, '#fff7ae'); }
      c.restore();
      // on Pompón's jacket
      if (g.t - g.popT > .6) { const kk = spring(g.t - g.popT - .6, 2.4, 6); panel(c, 180, 110, 64, 70, '#ffffff', { r: 8 }); drawS(c, pomponHead('win'), 212, 172, { ax: .5, ay: 1, s: kk }); drawStar(c, 226, 152, 5 * kk, '#ffdf4f'); }
    } else {
      pomponGuide(c, P, g.t, false, '#ffffff'); pomponCovDots(c, g.trace);
      const pct = fl(g.trace.frac() * 100); pomponTag(c, pct + '%', 238, 18, pct ? '#2a9a6a' : INK, true);
    }
    if (g.tear) { const k = Math.min(1, (g.t - g.tear.t) * 4); for (let i = 0; i < 8; i++) linePx(c, g.tear.x + (i - 4) * 5 * k, g.tear.y - 12 * k + (i % 2) * 8, g.tear.x + (i - 3) * 5 * k, g.tear.y - 12 * k + ((i + 1) % 2) * 8, INK); shout(c, '¡RAAAS!', clamp(g.tear.x, 50, 206), clamp(g.tear.y - 26, 20, 170), g.t - g.tear.t); }
    if (g.state === 'won') pomponStamp(c, '¡ME ENCANTA!', g.t - g.popT - .2, 26, ['#ffffff', '#ffd1e4', '#ff5d9e']);
    if (g.state === 'lost') pomponStamp(c, g.tear ? '¡QUÉ ESTROPICIO!' : '¡A MEDIAS!', g.t - g.decidedAt, 26, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const P = POMPON_SHAPES[g.shape], n = fl(P.length * .45); return { mech: 'cut', x: P[0][0], y: P[0][1], path: P.slice(0, n + 1) }; },
  bot(g) {
    const P = pomponSample(POMPON_SHAPES[g.shape], 60), b = g._b || (g._b = { k: -3 });
    b.k++;
    if (b.k < 0) return { x: P[0][0], y: P[0][1], down: false };
    const p = P[Math.min(P.length - 1, b.k)]; return { x: p[0], y: p[1], down: b.k < P.length + 1 };
  },
});

// ---------------------------------------------------------------- 8 TELÓN ---
// NEW · Backstage: the cue light goes green when Pompón is ready — only then
// cut the rope and the curtain flies up. Too soon and she's still in curlers.
function pomponBackstageBg() {
  return mdl('pomponBackstageBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#20162e'); for (let x = 0; x < SW; x += 12) rect(g, x, 0, 1, SH, '#2a1f3c');
    rect(g, 0, 176, SW, 16, '#3b2a2a'); for (let x = 0; x < SW; x += 20) rect(g, x, 176, 1, 16, '#2a1c1c');
    // pulley rig
    rect(g, 30, 6, 196, 5, INK); rect(g, 30, 7, 196, 3, RAMP.steel[2]);
    for (const x of [46, 206]) { disc(g, x, 12, 6, INK); disc(g, x, 12, 5, RAMP.steel[3]); disc(g, x, 12, 2, INK); }
    // wall cleat for the rope
    rect(g, 36, 150, 20, 5, INK); rect(g, 37, 151, 18, 3, RAMP.steel[3]);
    return c;
  });
}
function pomponCurtainHalf(t, side, lift) {
  // one velvet half of the main curtain (lift 0 closed → 1 flown out)
  return { draw(c) {
    const x0 = side < 0 ? 62 : 128, w = 66, y1 = 176 - lift * 170;
    rect(c, x0, 12, w, y1 - 12, '#8c1d30');
    for (let x = x0 + 4; x < x0 + w; x += 10) { rect(c, x, 12, 4, y1 - 12, '#c02d45'); rect(c, x + 4, 12, 1, y1 - 12, '#5e0c1e'); }
    for (let x = x0; x < x0 + w; x += 2) px(c, x, y1 - 1 + Math.sin(x * .7 + t * 3) * 1, RAMP.gold[3]);
    rect(c, x0, 12, w, 4, RAMP.gold[2]);
  } };
}
defMG({
  id: 'telon', stage: 'pompon', name: '¡Arriba el telón!', cmd: '¡CORTA EN VERDE!', how: 'Cuando la luz se ponga VERDE, corta la cuerda', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p12', v: .45, n: 'E5 . E5 . E5 . E5 . F5 . F5 . F5 . F5 . F#5 . F#5 . F#5 . F#5 . G5 . G#5 . A5 - - .' },
    { i: 'pad', v: .45, n: 'A3+C#4+E4 - - - - - - - D4+F4+A4 - - - - - - - D#4+F#4+A#4 - - - - - - - E4+G#4+B4 - - - E4+A4+C#5 - - -' },
    { i: 'd', v: .7, n: 'k . . . s . . . k . . . s . . . k . k . s . . . k . s s s s s s' }] }),
  init(g) {
    const bd = g.spb;
    g.goT = g.r(2.4, 3.6) * bd; g.goLen = [3.4, 2, 1.3][g.level - 1] * bd;
    g.fakeT = g.level >= 3 ? g.goT - bd * 1.1 : -9;
    g.blade = pomponBlade(); g.cutT = -1; g.early = false; g.lift = 0;
  },
  light(g) { if (g.t >= g.goT && g.t < g.goT + g.goLen) return 'go'; if (g.t >= g.fakeT && g.t < g.fakeT + g.spb * .45) return 'almost'; return 'wait'; },
  update(g, dt) {
    g.blade.update(g, dt);
    if (g.cutT >= 0) g.lift = Math.min(1, g.lift + dt * (g.early ? 1.8 : 2.6));
    if (g.state !== 'play') return;
    // the rope: from the pulley down to the cleat
    if (g.blade.crosses(46, 30, 46, 146)) {
      g.cutT = g.t; sfx('snip'); sfx('whoosh', { delay: .05 }); HITSTOP = 3; buzz(15); g.shake(2, .2);
      g.fx.burst(46, IN.y, 12, { k: 'hair', c: ['#d2ad73', '#9c7646', '#efd7a4'], sp0: 30, sp1: 110, g: 240, r: 2.5 });
      if (this.light(g) === 'go') { g.win(); sfx('slam', { delay: .3 }); sfx('sparkle', { delay: .35 }); for (let i = 0; i < 30; i++) g.fx.add({ k: 'conf', x: g.r(70, 186), y: -4, vx: g.r(-30, 30), vy: g.r(40, 120), g: 80, life: 1.8, c: g.pick(['#ff5d9e', '#fff27a', '#63e6ff', '#ffffff']), rot: g.r(TAU), vr: g.r(-8, 8) }); }
      else { g.early = true; g.lose(); sfx('bad', { delay: .25 }); }
    }
    if (this.light(g) === 'wait' && g.t > g.goT + g.goLen && g.cutT < 0) { g.lose(); }
  },
  draw(g, c) {
    c.drawImage(pomponBackstageBg(), 0, 0);
    const ready = g.state === 'won' || (g.cutT < 0 && this.light(g) === 'go');
    // Pompón behind the curtain (visible when it rises)
    if (g.lift > 0) {
      for (let i = 0; i < 3; i++) { c.globalAlpha = .12; polyPx(c, [[110 + i * 4, 12], [146 - i * 4, 12], [176, 176], [80, 176]], '#fff7ae'); } c.globalAlpha = 1;
      if (g.early) {
        // not ready: bathrobe + curlers + a biscuit in her mouth
        pomponDraw(c, 128, 178, 'boss');
        for (const [x, y] of [[118, 112], [128, 106], [138, 112]]) { rect(c, x - 4, y - 3, 8, 6, INK); rect(c, x - 3, y - 2, 6, 4, '#63a0ef'); }
        rect(c, 110, 150, 36, 22, INK); rect(c, 111, 151, 34, 20, '#ffffff'); for (let y = 153; y < 170; y += 3) rect(c, 111, y, 34, 1, '#dce7ea');
        drawS(c, pomponBiscuit(), 138, 132, {});
      } else pomponDraw(c, 128, 178, 'clear', { jump: Math.abs(Math.sin(g.t * 8)) * 5 });
    }
    pomponCurtainHalf(g.t, -1, g.lift).draw(c); pomponCurtainHalf(g.t, 1, g.lift).draw(c);
    if (g.lift < .25) {
      // backlit behind the velvet: fussing with her hair, then striking a pose
      const pose = ready ? 'ready' : (fl(g.t * 3) % 2 ? 'gum' : 'boss');
      drawS(c, mdl('pomponShadow:' + pose, () => silhouette(pomponBody(pose), '#2a0410')), 128 + (ready ? 0 : Math.sin(g.t * 5) * 3), 178, { ax: .5, ay: .985, s: 1.3, alpha: .4 * (1 - g.lift * 4) });
      if (ready) drawStar(c, 142, 76 + Math.sin(g.t * 9) * 2, 4, '#fff27a', g.t * 4);
    }
    // rope + sandbag
    const rope = (y0, y1, sw = 0) => { for (let y = fl(y0); y < y1; y++) { const x0 = 43 + rd(sw * (y - y0) / 40); rect(c, x0, y, 7, 1, INK); for (let x = 0; x < 5; x++) { const m = (x + y) % 5; px(c, x0 + 1 + x, y, m === 0 ? '#efd7a4' : m === 3 ? '#8a6232' : '#c79a5a'); } } };
    if (g.cutT < 0) {
      rope(18, 150);
      if (this.light(g) === 'go') { c.globalAlpha = .45 + Math.sin(g.t * 16) * .25; ringRect(c, 40, 30, 13, 116, 1, '#5bd18b'); c.globalAlpha = 1; }
      ellipsePx(c, 46, 150, 6, 4, INK); ellipsePx(c, 46, 150, 4.6, 2.8, '#c79a5a'); px(c, 44, 149, '#efd7a4');
    } else {
      const k = Math.min(1, (g.t - g.cutT) * 3);
      rope(18, 18 + 70 * (1 - k), k * 6); rope(150 - 50 * (1 - k), 150, -k * 4);
      ellipsePx(c, 46, 150, 6, 4, INK); ellipsePx(c, 46, 150, 4.6, 2.8, '#c79a5a');
    }
    // the stage-manager's cue light box
    const L = g.state === 'won' ? 'go' : this.light(g), on = L === 'go' ? '#5bd18b' : L === 'almost' ? '#ffdf4f' : '#ff4060';
    panel(c, 188, 24, 60, 62, '#2b2540', { r: 6, line: INK });
    for (const [y, col, lit] of [[40, '#ff4060', L === 'wait'], [58, '#ffdf4f', L === 'almost'], [76, '#5bd18b', L === 'go']]) { disc(c, 204, y, 7, INK); disc(c, 204, y, 6, lit ? col : mixHex(col, '#20162e', .7)); if (lit) { disc(c, 202, y - 2, 2, '#ffffff'); c.globalAlpha = .25; disc(c, 204, y, 12, col); c.globalAlpha = 1; } }
    txt(c, L === 'go' ? '¡YA!' : L === 'almost' ? '¿...?' : 'ESPERA', 231, 52, on, { align: 'c', bold: true, out: INK });
    // Keiko runs the show tonight: headset on, she calls the cue
    const kx = 222, ky = 180, kex = g.state === 'won' ? 'star' : g.state === 'lost' ? (g.early ? 'x' : 'sad') : L === 'go' ? 'wow' : L === 'almost' ? 'spiral' : 'normal';
    drawS(c, westieSitBody(), kx, ky, { ax: .5, ay: 1, s: .62 });
    drawS(c, keikoHead(kex), kx, ky - 22, { ax: .5, ay: .7, s: .62 });
    disc(c, kx + 13, ky - 33, 3, INK); disc(c, kx + 13, ky - 33, 2, RAMP.steel[3]); thickLine(c, kx + 12, ky - 31, kx + 5, ky - 24, .6, INK); disc(c, kx + 4, ky - 23, 1.6, INK);
    if (g.state === 'play' && L === 'go') pomponSay(c, '¡YA!', kx - 6, ky - 66, kx - 2, ky - 52);
    if (g.cutT < 0 && L === 'go') { if (fl(g.t * 8) % 2) { thickLine(c, 30, 96, 62, 96, 1, '#5bd18b'); drawS(c, mdl('pomponMiniScis2', () => { const k = mkCanvas(20, 14); pomponScissors(k.g, 10, 7, 0, .6); return k; }), 20, 96, {}); } shout(c, '¡CORTA!', 92, 118, g.t - g.goT, '#94ffb4'); }
    if (g.state === 'won') pomponStamp(c, '¡A ESCENA!', g.t - g.decidedAt - .2, 30);
    if (g.state === 'lost') pomponStamp(c, g.early ? '¡AÚN NO!' : '¡SE PASÓ LA HORA!', g.t - g.decidedAt - (g.early ? .3 : 0), 30, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  // the gesture only makes sense once the light is green (a ghost cut on red would teach the wrong thing)
  hint(g) { return this.light(g) === 'go' ? { mech: 'cut', x: 24, y: 96, path: [[24, 96], [68, 104]] } : null; },
  bot(g) {
    if (this.light(g) !== 'go' || g.state !== 'play') return { x: 20, y: 100, down: false };
    const ph = (g._p = (g._p || 0) + 1) % 8;
    if (ph < 2) return { x: 22, y: 98, down: false };
    return { x: 22 + (ph - 2) * 10, y: 98 + (ph - 2) * 2, down: true };
  },
});

// the three new ones join Pompón's set
STAGES.pompon.games.push('poda', 'patron', 'telon');
