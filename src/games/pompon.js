// ============================================================================
//  Microgames of POMPÓN's stage (¡CORTA!): every one is a quick swipe of the
//  scissors. A shared blade leaves a pink trail and snips as you slice.
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
        if (!IN.tap && sp >= this.minSpeed) { this.seg = [IN.x - IN.dx, IN.y - IN.dy, IN.x, IN.y]; if (this.sfxT <= 0) { sfx('swoosh', { pitch: 1.6 + Math.random() * .4, vol: .35 }); this.sfxT = .18; } }
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
// dotted guide with marching ants + a scissors badge at the start
function pomponGuide(c, pts, t, done, col = '#ffffff') {
  if (done) return;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay);
    for (let q = 0; q < L; q += 1) { const on = fl((acc + q - t * 24) / 4) % 2 === 0; if (!on) continue; const x = lerp(ax, bx, q / L), y = lerp(ay, by, q / L); rect(c, x - 1, y - 1, 3, 3, INK); }
    acc += L;
  }
  acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay);
    for (let q = 0; q < L; q += 1) { const on = fl((acc + q - t * 24) / 4) % 2 === 0; if (!on) continue; px(c, lerp(ax, bx, q / L), lerp(ay, by, q / L), col); }
    acc += L;
  }
  const [sx, sy] = pts[0], bob = Math.sin(t * 8) * 1.5;
  disc(c, sx - 8, sy - 9 + bob, 6, INK); disc(c, sx - 8, sy - 9 + bob, 5, '#ffffff'); pomponScissors(c, sx - 8, sy - 9 + bob, 0, .5);
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

// ---------------------------------------------------------------- 1 FLEQUILLO
// Close-up of Pompón: the fringe hides her eyes; cut it along the dotted line.
function pomponBigHead() {
  return mdl('pomponBigHead', () => {
    const k = 4.3, cx0 = 128, S = f => (x, y) => f((x - cx0) / k + 32, (y - 104) / k + 30) * k;
    const F = POMPON_FUR, K = POMPON_SKIN;
    const knotS = S(SD.circle(32, 13, 11.4)), earL = S(SD.ellipse(18.8, 38, 6, 12.5)), earR = S(SD.ellipse(45.2, 38, 6, 12.5));
    const headS = S(SD.ellipse(32, 29.5, 11.2, 10.6));
    const face = S(SD.smooth(2.5, SD.ellipse(32, 32.5, 7.8, 7.4), SD.ellipse(32, 36.5, 5.4, 4.8)));
    const nose = S(SD.ellipse(32, 36.7, 2.1, 1.5));
    const ct = (seed) => clumpTex(7, .4, seed, 1, 1.2);
    const c = model(SW, SH, [
      { f: SD.curls(earL, 3.2, .3, 1), fs: earL, ramp: F, z: 1, th: 18, tex: ct(1) }, { f: SD.curls(earR, 3.2, .3, 2), fs: earR, ramp: F, z: 1, th: 18, tex: ct(2) },
      { f: SD.curls(knotS, 3.6, .28, 3), fs: knotS, ramp: F, z: 2, th: 34, tex: ct(3) },
      { f: SD.curls(headS, 3, .3, 4), fs: headS, ramp: F, z: 3, th: 36, tex: ct(4) },
      { f: face, ramp: K, z: 4, th: 26, amb: .42 },
      { f: nose, ramp: RAMP.black, z: 5, th: 6, gloss: true },
    ]);
    const g = c.g, E2 = '#2a0f22';
    // big idol eyes (hidden by the fringe until the cut)
    for (const [ex, fx] of [[107, -1], [149, 1]]) {
      ellipsePx(g, ex, 106, 8.5, 10, E2); ellipsePx(g, ex, 107, 7, 8.6, '#5a2350'); ellipsePx(g, ex, 110, 5.6, 4.8, '#9c3f7d'); ellipsePx(g, ex, 112, 3.4, 2.4, '#d77fb8');
      disc(g, ex - 3, 102, 2.8, '#ffffff'); disc(g, ex + 3, 111, 1.4, '#ffffff'); px(g, ex + 3, 102, '#ffffff');
      for (let i = 0; i < 3; i++) thickLine(g, ex + fx * (6 + i * 2), 98 - i, ex + fx * (10 + i * 3), 92 - i * 2, .8, E2);
    }
    // blush, mouth, headset
    for (const bx of [84, 162]) for (let i = 0; i < 4; i++) { px(g, bx + i * 3, 122, RAMP.pink[3]); px(g, bx + i * 3 + 1, 124, RAMP.pink[3]); }
    thickLine(g, 120, 146, 128, 150, 1, INK); thickLine(g, 128, 150, 136, 146, 1, INK); ellipsePx(g, 128, 152, 3, 2, RAMP.pink[2]);
    thickLine(g, 186, 120, 150, 146, 1.2, INK); rect(g, 142, 144, 9, 5, INK); rect(g, 143, 145, 7, 3, '#6f7a92');
    pomponBowAt(g, 128, 14, 2.4);
    return c;
  });
}
function pomponBangs() {
  return mdl('pomponBangs', () => {
    const F = POMPON_FUR, rings = [];
    // curly ringlets: stacks of shrinking curls swinging left-right
    for (let i = 0; i < 9; i++) {
      const x0 = 70 + i * 14.5, n = 6 + (i % 3 === 1 ? 1 : 0);
      for (let j = 0; j < n; j++) rings.push(SD.circle(x0 + Math.sin(j * 1.4 + i * 1.1) * 4, 54 + j * 11.5, 10.5 - j * .75));
    }
    const all = SD.union(...rings), shape = SD.curls(all, 1.6, .5, 6);
    return model(SW, SH, [{ f: shape, fs: all, ramp: F, z: 1, th: 14, tex: clumpTex(5, .45, 21, 1, 1.25) }]);
  });
}
defMG({
  id: 'flequillo', stage: 'pompon', name: 'Flequillo de estrella', cmd: '¡CORTA!', how: 'Recorta el flequillo siguiendo la línea, de un tijeretazo', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .6, n: 'E6 . C#6 . A5 . C#6 . E6 . F#6 . E6 - - . D6 . B5 . G#5 . B5 . D6 . E6 . D6 - - .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 . . A3 . E2 . . E2 . . E3 . D2 . . D2 . . D3 . E2 . . E2 . . E3 .' },
    { i: 'd', v: .75, n: 'k . c . k . c . k . c . k . c c k . c . k . c . k . c . k c c c' }] }),
  init(g) {
    const L = g.level;
    const lines = L === 1 ? [[[62, 84], [194, 84]]] : L === 2 ? [[[62, 76], [194, 92]]] : [[[60, 78], [128, 90]], [[128, 90], [196, 78]]];
    g.cuts = lines.map(p => pomponTrace(p, 24, 9));
    g.blade = pomponBlade(0); g.pieces = []; g.bangs = mkCanvas(SW, SH); g.bangs.g.drawImage(pomponBangs(), 0, 0);
    g.revealT = -1;
  },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.pieces, dt);
    if (g.state !== 'play') return;
    for (const cut of g.cuts) {
      if (cut.done) continue;
      cut.feed();
      if (cut.frac() >= .8) {
        cut.done = true;
        const [a, b] = [cut.pts[0], cut.pts[cut.pts.length - 1]];
        const pc = pomponSplitBelow(g.bangs, a[0], a[1], b[0], b[1], Math.min(a[0], b[0]) - (g.cuts.length > 1 ? 0 : 40), Math.max(a[0], b[0]) + (g.cuts.length > 1 ? 0 : 40));
        if (pc) g.pieces.push({ img: pc.img, x: pc.x, y: pc.y, vx: g.r(-30, 30), vy: -40, rot: 0, vr: g.r(-2, 2) });
        sfx('snip'); sfx('snip', { delay: .06, pitch: 1.2 }); HITSTOP = 3; g.shake(2, .15); buzz(12);
        cut.samp.forEach((p, i) => { if (i % 3 === 0) pomponHairBurst(g, p[0], p[1], 3); });
      }
    }
    if (IN.rel) for (const cut of g.cuts) if (!cut.done) cut.reset(); // one stroke per cut
    if (g.cuts.every(c => c.done)) { g.win(); g.revealT = g.t; pomponSparkle(g, 107, 106, 12); pomponSparkle(g, 149, 106, 12); sfx('sparkle', { delay: .1 }); }
  },
  draw(g, c) {
    // vanity-mirror backdrop
    rect(c, 0, 0, SW, SH, '#ffd1e4'); for (let y = 0; y < SH; y += 10) for (let x = (y / 10 % 2) * 10; x < SW; x += 20) rect(c, x, y, 10, 10, '#ffc3d8');
    for (let i = 0; i < 9; i++) { const on = (i + fl(g.t * 6)) % 3 !== 0; for (const [x, y] of [[8, 16 + i * 21], [SW - 9, 16 + i * 21]]) { disc(c, x, y, 4, INK); disc(c, x, y, 3.2, on ? '#fff27a' : '#c69420'); if (on) px(c, x - 1, y - 1, '#fff'); } }
    c.drawImage(pomponBigHead(), 0, 0);
    if (g.state === 'won' && g.t - g.revealT < 3) { const k = spring(g.t - g.revealT, 2.5, 6); for (const ex of [107, 149]) drawStar(c, ex + 8, 97 - k * 3, 3 + k * 2, '#fff27a', g.t * 3); }
    c.drawImage(g.bangs, 0, 0);
    for (const cut of g.cuts) pomponGuide(c, cut.pts, g.t, cut.done);
    // live coverage feedback on the line being traced
    for (const cut of g.cuts) if (!cut.done) cut.samp.forEach((p, i) => { if (cut.cov[i]) { disc(c, p[0], p[1], 2, INK); disc(c, p[0], p[1], 1.3, '#5bd18b'); } });
    pomponDrawPieces(c, g.pieces);
    if (g.state === 'won') { const k = spring(g.t - g.revealT - .1, 2.4, 6); if (k > 0) { c.save(); c.translate(SW / 2, 172); c.scale(k, k); panel(c, -52, -9, 104, 18, '#ffffff', { r: 6 }); txt(c, '¡Guapísima!', 0, -4, '#e05b98', { align: 'c', bold: true }); c.restore(); } }
    if (g.state === 'lost') txt(c, '¡Sigo sin ver!', SW / 2, 170, '#ffffff', { align: 'c', out: INK, bold: true });
    g.blade.draw(c, g.t);
  },
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
// The tail pompom has stray tufts: slice each off until it's perfectly round.
function pomponBall() {
  return mdl('pomponBall', () => {
    const S0 = SD.circle(40, 40, 32);
    return model(80, 80, [{ f: SD.curls(S0, 2.6, .34, 4), fs: S0, ramp: POMPON_FUR, z: 1, th: 26, tex: clumpTex(6, .42, 31, 1, 1.2) }]);
  });
}
function pomponRearBg() {
  return mdl('pomponRearBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#e8f4ff'); for (let x = 0; x < SW; x += 16) rect(g, x, 0, 8, SH, '#dcecfb');
    for (let i = 0; i < 26; i++) drawStar(g, hash2(i, 4) * SW, hash2(4, i) * 120, 1.8, '#ffffff');
    // the grooming table edge + Pompón's curly rump in the corner
    rect(g, 0, 160, SW, 32, '#2b2540'); rect(g, 0, 160, SW, 2, '#5f5883');
    const rump = SD.circle(12, 206, 74);
    const m = model(120, 90, [{ f: (x, y) => SD.curls(rump, 3, .3, 2)(x, y + 100), fs: (x, y) => rump(x, y + 100), ramp: POMPON_FUR, z: 1, th: 40, tex: clumpTex(7, .4, 8, 1, 1.2) }]);
    g.drawImage(m, 0, 102);
    return c;
  });
}
defMG({
  id: 'pompones', stage: 'pompon', name: 'Pompón perfecto', cmd: '¡REDONDEA!', how: 'Corta los pelillos que sobresalen del pompón', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'A5 . A5 . . . E5 . A5 . B5 . C#6 . . . B5 . B5 . . . F#5 . B5 . C#6 . D6 . . .' },
    { i: 'bass', v: .85, n: 'A2 . . . E3 . . . A2 . . . E3 . . . B2 . . . F#3 . . . E2 . . . G#2 . . .' },
    { i: 'd', v: .75, n: 'k . h c . h k . k . h c . h k h k . h c . h k . k . h c k c c c' }] }),
  init(g) {
    const n = [3, 4, 5][g.level - 1];
    g.tufts = [];
    const base = g.r(TAU);
    for (let i = 0; i < n; i++) { const a = base + i / n * TAU + g.r(-.3, .3); g.tufts.push({ a, len: g.r(20, 28), wig: g.r(TAU), cut: false }); }
    g.blade = pomponBlade(); g.flying = []; g.wag = [0, 22, 32][g.level - 1]; g.face = 0;
  },
  center(g) { const w = Math.sin(g.t * 4.2 * g.tempo) * g.wag; return [128 + w, 84 - Math.abs(w) * .2]; },
  tuftPts(g, tf) { const [cx0, cy0] = this.center(g), a = tf.a, r0 = 30, pts = []; for (let i = 0; i <= 6; i++) { const q = i / 6, r = r0 + q * tf.len, sw = Math.sin(q * 5 + tf.wig + g.t * 6) * 2.6 * q; pts.push([cx0 + Math.cos(a) * r - Math.sin(a) * sw, cy0 + Math.sin(a) * r + Math.cos(a) * sw]); } return pts; },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.flying, dt);
    if (g.state !== 'play') return;
    for (const tf of g.tufts) {
      if (tf.cut) continue;
      const P = this.tuftPts(g, tf);
      for (let i = 2; i < P.length; i++) if (g.blade.crosses(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1])) {
        tf.cut = true;
        const piece = mkCanvas(40, 40); const off = [P[i - 1][0] - 20, P[i - 1][1] - 20];
        for (let j = i; j < P.length; j++) { thickLine(piece.g, P[j - 1][0] - off[0], P[j - 1][1] - off[1], P[j][0] - off[0], P[j][1] - off[1], 2.4, INK); }
        for (let j = i; j < P.length; j++) { thickLine(piece.g, P[j - 1][0] - off[0], P[j - 1][1] - off[1], P[j][0] - off[0], P[j][1] - off[1], 1.4, POMPON_FUR[3]); }
        g.flying.push({ img: piece, x: P[i - 1][0], y: P[i - 1][1], vx: Math.cos(tf.a) * 90, vy: Math.sin(tf.a) * 90 - 80, rot: 0, vr: g.r(-10, 10) });
        sfx('snip', { pitch: 1 + g.tufts.filter(t => t.cut).length * .1 }); HITSTOP = 2; buzz(8); pomponHairBurst(g, P[i - 1][0], P[i - 1][1], 6);
        g.fx.add({ k: 'txt', s: '¡ZAS!', x: P[i - 1][0], y: P[i - 1][1] - 12, life: .45, c: '#ffffff' });
        break;
      }
    }
    if (g.tufts.every(t => t.cut)) { g.win(); const [cx0, cy0] = this.center(g); pomponSparkle(g, cx0, cy0, 16); g.fx.add({ k: 'txt', s: '¡Redondito!', x: cx0, y: cy0 - 46, life: 1.2, c: '#ff5d9e' }); }
  },
  draw(g, c) {
    c.drawImage(pomponRearBg(), 0, 0);
    const [cx0, cy0] = this.center(g);
    // the tail stalk from the rump to the pompom
    const tx0 = 70, ty0 = 150;
    for (let i = 0; i <= 12; i++) { const q = i / 12, x = lerp(tx0, cx0, q) + Math.sin(q * Math.PI) * -12, y = lerp(ty0, cy0 + 20, q); disc(c, x, y, 6.2 - q * 1.5, INK); }
    for (let i = 0; i <= 12; i++) { const q = i / 12, x = lerp(tx0, cx0, q) + Math.sin(q * Math.PI) * -12, y = lerp(ty0, cy0 + 20, q); disc(c, x, y, 5.2 - q * 1.5, POMPON_SKIN[3]); px(c, x - 2, y - 1, POMPON_SKIN[4]); }
    // stray tufts behind + over the ball edge
    for (const tf of g.tufts) if (!tf.cut) { const P = this.tuftPts(g, tf); for (let i = 1; i < P.length; i++) thickLine(c, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], 2.6 - i * .2, INK); for (let i = 1; i < P.length; i++) thickLine(c, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], 1.6 - i * .15, POMPON_FUR[3]); const e = P[P.length - 1]; ringPx(c, e[0], e[1], 2.5, POMPON_FUR[2]); }
    const sq = g.state === 'won' ? 1 + Math.sin((g.t - g.decidedAt) * 18) * .06 * Math.max(0, 1 - (g.t - g.decidedAt) * 2) : 1;
    drawS(c, pomponBall(), cx0, cy0, { sx: sq, sy: 2 - sq });
    if (g.state === 'won') for (let i = 0; i < 4; i++) { const a = g.t * 2 + i / 4 * TAU; drawStar(c, cx0 + Math.cos(a) * 44, cy0 + Math.sin(a) * 44, 3, '#fff27a'); }
    pomponDrawPieces(c, g.flying);
    g.blade.draw(c, g.t);
  },
  bot(g) {
    const tf = g.tufts.find(t => !t.cut); if (!tf) return { down: false };
    const P = this.tuftPts(g, tf), m = P[4], a = tf.a + Math.PI / 2, ph = (g._p = (g._p || 0) + 1) % 10;
    if (ph < 2) return { x: m[0] + Math.cos(a) * 14, y: m[1] + Math.sin(a) * 14, down: false };
    const q = (ph - 2) / 7; return { x: m[0] + Math.cos(a) * lerp(14, -14, q), y: m[1] + Math.sin(a) * lerp(14, -14, q), down: true };
  },
});

// ---------------------------------------------------------------- 3 NUDOS ---
// Knots are tossed up: slice them in the air. From level 2, bows fly too.
function pomponKnot(v) {
  return mdl('pomponKnot' + v, () => {
    const S0 = SD.circle(14, 14, 9.5), F = [POMPON_FUR, RAMP.apricot, RAMP.lilac][v % 3];
    const c = model(28, 28, [{ f: SD.shag(S0, 2.2, .55, v * 3), fs: S0, ramp: F, z: 1, th: 9, tex: clumpTex(3, .45, v, 1, 1.3) }]);
    const g = c.g;
    // loose tangled loops of hair around the ball
    for (let i = 0; i < 5; i++) { const a0 = i * 1.3 + v, r = 7 + (i % 3) * 2; let lx = 14 + Math.cos(a0) * r, ly = 14 + Math.sin(a0) * r; for (let q = 1; q <= 8; q++) { const a = a0 + q * .5, rr = r + Math.sin(q * 1.7 + i) * 3, x = 14 + Math.cos(a) * rr, y = 14 + Math.sin(a) * rr; linePx(g, lx, ly, x, y, q % 2 ? F[0] : F[3]); lx = x; ly = y; } }
    // grumpy little face
    rect(g, 9, 12, 3, 3, INK); rect(g, 16, 12, 3, 3, INK); px(g, 10, 12, '#ffffff'); px(g, 17, 12, '#ffffff');
    linePx(g, 8, 9, 12, 11, INK); linePx(g, 20, 9, 16, 11, INK); hline(g, 11, 17, 18, INK); px(g, 10, 19, INK); px(g, 18, 19, INK);
    return c;
  });
}
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
  id: 'nudos', stage: 'pompon', name: 'Nudos voladores', cmd: '¡CORTA!', how: 'Corta los nudos en el aire. ¡Los lazos no!', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'lead', v: .5, n: 'C#6 B5 A5 B5 C#6 . E6 . D6 C#6 B5 C#6 D6 . F#6 . E6 D6 C#6 D6 E6 . A6 . G#6 . E6 . B5 - - .' },
    { i: 'bass', v: .85, n: 'A2 A3 A2 A3 A2 A3 A2 A3 B2 B3 B2 B3 B2 B3 B2 B3 C#3 C#4 C#3 C#4 C#3 C#4 C#3 C#4 E2 E3 E2 E3 E2 E3 E2 E3' },
    { i: 'd', v: .8, n: 'k h c h k h c h k h c h k h c c k h c h k h c h k h c h k c c c' }] }),
  init(g) {
    g.need = [3, 4, 5][g.level - 1]; g.bows = [0, 1, 3][g.level - 1]; g.sliced = 0; g.objs = []; g.halves = []; g.nextT = .05; g.bowsLeft = g.bows; g.combo = 0;
    g.blade = pomponBlade();
  },
  toss(g, kind) {
    const x = g.r(40, 216), tx = clamp(x + g.r(-60, 60), 40, 216), up = g.r(360, 430) * Math.sqrt(g.tempo);
    const T = 2 * up / 520; g.objs.push({ kind, x, y: SH + 12, vx: (tx - x) / T, vy: -up, rot: 0, vr: g.r(-4, 4), v: g.ri(0, 2), dead: false });
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
      const r = o.kind === 'bow' ? 11 : 13;
      if (g.blade.hitsCircle(o.x, o.y, r)) {
        o.dead = true;
        const img = o.kind === 'bow' ? pomponLifeBow() : pomponKnot(o.v);
        for (const s of [-1, 1]) g.halves.push({ img: pomponHalf(img, s), x: o.x, y: o.y, vx: s * 90 + o.vx * .3, vy: o.vy * .3 - 60, rot: o.rot, vr: s * 8 });
        if (o.kind === 'bow') { sfx('bad'); g.fx.add({ k: 'txt', s: '¡MI LAZO!', x: o.x, y: o.y - 16, life: .8, c: '#ff5d9e' }); g.shake(3, .2); g.lose(); }
        else {
          g.sliced++; g.combo++; sfx('snip', { pitch: .9 + g.sliced * .1 }); HITSTOP = 2; buzz(8); pomponHairBurst(g, o.x, o.y, 9); g.fx.add({ k: 'ring', x: o.x, y: o.y, r: 6, grow: 14, life: .25, c: '#ffffff' });
          if (g.combo >= 2) g.fx.add({ k: 'txt', s: '¡x' + g.combo + '!', x: o.x, y: o.y - 18, life: .6, c: '#fff27a' });
          if (g.sliced >= g.need) { g.win(); pomponSparkle(g, o.x, o.y, 14); }
        }
      }
    }
    if (!IN.down) g.combo = 0;
  },
  draw(g, c) {
    c.drawImage(pomponVanityBg(), 0, 0);
    // watching idol at the bottom
    drawS(c, pomponHead(g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : 'boss'), 128, SH + 18, { ax: .5, ay: 1 });
    for (const o of g.objs) if (!o.dead) drawS(c, o.kind === 'bow' ? pomponLifeBow() : pomponKnot(o.v), o.x, o.y, { rot: o.rot });
    pomponDrawPieces(c, g.halves);
    for (let i = 0; i < g.need; i++) { const on = i < g.sliced; disc(c, SW - 12 - i * 12, 12, 5, INK); disc(c, SW - 12 - i * 12, 12, 4, on ? '#5bd18b' : '#6b3f8a'); if (on) px(c, SW - 13 - i * 12, 11, '#fff'); }
    g.blade.draw(c, g.t);
  },
  bot(g) {
    const o = g.objs.filter(o => !o.dead && o.kind === 'knot' && o.y < SH - 10 && o.y > 10).sort((a, b) => a.vy - b.vy)[0];
    if (!o) return { down: false };
    const bow = g.objs.find(b => !b.dead && b.kind === 'bow' && dist(b.x, b.y, o.x, o.y) < 34); if (bow) return { down: false };
    const ph = (g._p = (g._p || 0) + 1) % 8;
    if (ph < 2) return { x: o.x - 16, y: o.y - 10, down: false };
    const q = (ph - 2) / 5; return { x: o.x - 16 + q * 32 + o.vx * STEP * ph, y: o.y - 10 + q * 20 + o.vy * STEP * ph, down: true };
  },
});

// ---------------------------------------------------------------- 4 CHUCHES -
// One long treat, N hungry puppies: cut it into fair pieces.
function pomponPuppy(v) {
  return mdl('pomponPup' + v, () => {
    const F = [POMPON_FUR, RAMP.cream, RAMP.black, RAMP.apricot][v % 4];
    const head = SD.circle(20, 20, 13), earL = SD.ellipse(8, 24, 5, 9), earR = SD.ellipse(32, 24, 5, 9), snout = SD.ellipse(20, 26, 6, 4.6);
    const c = model(40, 38, [
      { f: SD.curls(earL, 1.2, .8, v), fs: earL, ramp: F, z: 0, th: 4, tex: clumpTex(3, .38, v, 1, 1.2) }, { f: SD.curls(earR, 1.2, .8, v + 1), fs: earR, ramp: F, z: 0, th: 4, tex: clumpTex(3, .38, v + 1, 1, 1.2) },
      { f: SD.curls(head, 1.4, .7, v + 2), fs: head, ramp: F, z: 1, th: 12, tex: clumpTex(3.2, .38, v + 2, 1, 1.2) },
      { f: snout, ramp: F === RAMP.black ? RAMP.grey : POMPON_SKIN, z: 2, th: 4, amb: .42 },
      { f: SD.ellipse(20, 24.5, 2, 1.5), ramp: RAMP.black, z: 3, th: 1.5, gloss: true },
    ]);
    const g = c.g; for (const ex of [13, 23]) { rect(g, ex, 16, 4, 5, INK); rect(g, ex + 1, 17, 2, 3, '#3a1f40'); px(g, ex + 1, 17, '#ffffff'); px(g, ex + 2, 17, '#ffffff'); }
    return c;
  });
}
function pomponTreatBar(len) {
  return mdl('pomponTreat' + rd(len), () => {
    const c = mkCanvas(rd(len) + 2, 16), g = c.g, w = rd(len);
    rect(g, 1, 1, w, 14, INK); rect(g, 0, 3, w + 2, 10, INK);
    rect(g, 2, 2, w - 2, 12, '#c0662c'); rect(g, 1, 4, w, 8, '#c0662c');
    for (let x = -10; x < w + 10; x += 7) linePx(g, x, 14, x + 9, 2, '#e2934a');
    for (let x = -8; x < w + 10; x += 7) linePx(g, x, 14, x + 9, 2, '#8a3e1c');
    rect(g, 2, 3, w - 2, 1, '#f6bf7c');
    const tmp = mkCanvas(w + 2, 16); tmp.g.drawImage(c, 0, 0); g.clearRect(0, 0, w + 2, 16);
    // keep only the stick's silhouette
    rect(g, 1, 1, w, 14, INK); rect(g, 0, 3, w + 2, 10, INK); g.globalCompositeOperation = 'source-atop'; g.drawImage(tmp, 0, 0); g.globalCompositeOperation = 'source-over';
    return c;
  });
}
defMG({
  id: 'chuches', stage: 'pompon', name: 'Reparto justo', cmd: '¡COMPARTE!', how: 'Corta la chuche en trozos iguales, uno por cachorro', mech: 'cut', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .65, n: 'A5 C#6 E6 C#6 A5 . . . F#5 A5 D6 A5 F#5 . . . E5 G#5 B5 G#5 E5 . . . A5 C#6 E6 A6 E6 . . .' },
    { i: 'bass', v: .8, n: 'A2 . . . . . . . D3 . . . . . . . E3 . . . . . . . A2 . . . E3 . . .' },
    { i: 'd', v: .6, n: 'k . z . c . z . k . z . c . z z k . z . c . z . k . z . c c c .' }] }),
  init(g) {
    g.n = g.level + 1; g.x0 = 34; g.x1 = 222; g.y = 76; g.cuts = []; g.blade = pomponBlade(); g.drop = -1; g.fair = null;
    g.pups = []; for (let i = 0; i < g.n; i++) g.pups.push({ x: lerp(46, 210, g.n === 1 ? .5 : i / (g.n - 1)), v: g.ri(0, 3), got: null });
    g.tol = [2.1, 1.85, 1.6][g.level - 1];
  },
  pieces(g) { const xs = [g.x0, ...g.cuts.slice().sort((a, b) => a - b), g.x1]; const out = []; for (let i = 1; i < xs.length; i++) out.push([xs[i - 1], xs[i]]); return out; },
  update(g, dt) {
    g.blade.update(g, dt);
    if (g.state === 'play' && g.drop < 0) {
      const s = g.blade.seg;
      if (s && Math.abs(s[3] - s[1]) > 1 && (s[1] - g.y) * (s[3] - g.y) <= 0) {
        const q = (g.y - s[1]) / (s[3] - s[1]), cx0 = lerp(s[0], s[2], q);
        if (cx0 > g.x0 + 8 && cx0 < g.x1 - 8 && g.cuts.every(c => Math.abs(c - cx0) > 10)) {
          g.cuts.push(cx0); sfx('snip'); HITSTOP = 2; buzz(8); g.shake(1.5, .1);
          g.fx.burst(cx0, g.y, 8, { k: 'dot', c: ['#c0662c', '#e2934a', '#8a3e1c'], sp0: 20, sp1: 80, g: 300, r: 1.4 });
          if (g.cuts.length >= g.n - 1) {
            const L = this.pieces(g).map(([a, b]) => b - a), ratio = Math.max(...L) / Math.min(...L);
            g.fair = ratio <= g.tol; g.drop = g.t;
            // biggest piece goes to the first pup, the tiniest to whoever is left
            const order = this.pieces(g).map((p, i) => i); order.forEach((pi, k) => { g.pups[k].got = pi; });
            if (g.fair) { g.win(); sfx('gulp', { delay: .45 }); sfx('heart', { delay: .6 }); } else { g.lose(); sfx('whine', { delay: .45, pitch: 1.6 }); }
          }
        }
      }
    }
  },
  draw(g, c) {
    // salon counter: the cream dresser top with the tray
    rect(c, 0, 0, SW, SH, '#fff4dc'); subwayTiles(c, 0, 0, SW, 100);
    dresser(c, -4, 98, SW + 8, 30);
    rect(c, 20, 88, 216, 8, INK); rect(c, 21, 89, 214, 6, RAMP.wood[3]); rect(c, 21, 89, 214, 1, RAMP.wood[4]);
    // floor where the puppies wait
    rect(c, 0, 128, SW, 64, RAMP.wood[2]); for (let y = 134; y < SH; y += 8) rect(c, 0, y, SW, 1, RAMP.wood[1]);
    const P = this.pieces(g), ideal = (g.x1 - g.x0) / g.n;
    // guide ticks at the fair spots (clear at level 1, faint at 2)
    if (g.level < 3 && g.drop < 0) for (let i = 1; i < g.n; i++) { const x = g.x0 + ideal * i; c.globalAlpha = g.level === 1 ? .9 : .35; for (let y = g.y - 16; y < g.y + 16; y += 4) rect(c, x, y, 1, 2, '#e05b98'); c.globalAlpha = 1; }
    P.forEach(([a, b], i) => {
      let x = a, y = g.y - 8;
      if (g.drop >= 0) { const k = clamp((g.t - g.drop) / .45, 0, 1), pup = g.pups.findIndex(p => p.got === i); if (pup >= 0) { const tx = g.pups[pup].x - (b - a) / 2; x = lerp(a, tx, E.inQ(k)); y = lerp(g.y - 8, 150, E.inQ(k)); } }
      const bar = pomponTreatBar(b - a); c.drawImage(bar, rd(x - 1), rd(y));
    });
    g.pups.forEach((p, i) => {
      const got = g.drop >= 0 && g.t - g.drop > .45, L = got && p.got != null ? P[p.got][1] - P[p.got][0] : 0, small = got && L < ideal / g.tol * 1.02;
      const bob = Math.abs(Math.sin(g.t * 6 + i)) * (got && !small ? 4 : 1.5);
      drawS(c, pomponPuppy(p.v), p.x, 176 - bob, { ax: .5, ay: 1 });
      if (!got) { txt(c, '♥', p.x + 12, 138 - bob, '#ff5d9e'); px(c, p.x + 2, 164, '#9bd6f7'); }
      else if (small && g.state === 'lost') { txt(c, '¡No es justo!', clamp(p.x, 40, 216), 128, '#ffffff', { align: 'c', out: INK }); }
      else if (g.state === 'won') drawHeart(c, p.x, 130 - ((g.t * 2 + i) % 1) * 16, '#ff5d9e', 1);
    });
    txt(c, g.cuts.length + '/' + (g.n - 1) + ' cortes', 6, 6, INK, { bold: true });
    g.blade.draw(c, g.t);
  },
  bot(g) {
    const ideal = (g.x1 - g.x0) / g.n, next = g.cuts.length + 1; if (next > g.n - 1 || g.drop >= 0) return { down: false };
    const x = g.x0 + ideal * next + (g.cuts.length ? 0 : 0), ph = (g._p = (g._p || 0) + 1) % 10;
    if (ph < 2) return { x, y: g.y - 26, down: false };
    return { x, y: g.y - 26 + (ph - 2) * 8, down: true };
  },
});

// ---------------------------------------------------------------- 5 CINTA ---
// Opening night: cut the ribbon — later it sways, then there are two.
function pomponGala() {
  return mdl('pomponGalaBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 110, ['#101a3a', '#1c2a5a', '#2b3a6b']);
    for (let i = 0; i < 30; i++) px(g, hash2(i, 5) * SW, hash2(5, i) * 60, '#ffffff');
    ellipsePx(g, SW / 2, 118, 130, 56, '#3d4f8a'); rect(g, 0, 110, SW, 40, '#3d4f8a');
    for (let x = 12; x < SW; x += 22) rect(g, x, 116, 10, 34, '#4f63a6');
    panel(g, 58, 70, 140, 18, '#fff27a', { r: 4 }); txt(g, 'PALAU SANT GUAU', SW / 2, 75, INK, { align: 'c', bold: true });
    // red carpet
    rect(g, 0, 150, SW, 42, '#b3a6c9'); polyPx(g, [[96, 150], [160, 150], [206, SH], [50, SH]], '#c02d45'); polyPx(g, [[100, 150], [156, 150], [200, SH], [56, SH]], '#d83a52');
    return c;
  });
}
function pomponPost(c, x) { rect(c, x - 4, 176, 9, 4, INK); rect(c, x - 3, 177, 7, 2, RAMP.gold[2]); rect(c, x - 2, 110, 5, 67, INK); rect(c, x - 1, 111, 3, 65, RAMP.gold[3]); px(c, x - 1, 112, RAMP.gold[4]); disc(c, x, 108, 4, INK); disc(c, x, 108, 3, RAMP.gold[3]); px(c, x - 1, 107, RAMP.gold[4]); }
defMG({
  id: 'cinta', stage: 'pompon', name: 'Inauguración', cmd: '¡INAUGURA!', how: 'Corta la cinta de un tijeretazo', mech: 'cut', beats: 8,
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
    if (g.state === 'won' && g.r() < .12) g.flashes.push({ x: g.r(20, 236), y: g.r(96, 140), t: g.t });
  },
  draw(g, c) {
    c.drawImage(pomponGala(), 0, 0);
    for (const f of g.flashes) if (g.t - f.t < .12) { disc(c, f.x, f.y, 6, '#ffffff'); drawStar(c, f.x, f.y, 9, '#ffffff'); }
    pomponPost(c, 24); pomponPost(c, 232);
    for (const r of g.ribbons) {
      const drawSeg = (xa, xb, pull) => { for (let x = xa; x < xb; x++) { const y = this.ribY(g, r, x) + pull(x); rect(c, x, y - 3, 1, 7, INK); } for (let x = xa; x < xb; x++) { const y = this.ribY(g, r, x) + pull(x); rect(c, x, y - 2, 1, 5, '#d0344a'); px(c, x, y - 2, '#ff8a8a'); px(c, x, y + 2, '#8c1d30'); } };
      if (r.cut < 0) { drawSeg(28, 229, () => 0); pomponBowAt(c, 128, this.ribY(g, r, 128), 1.6); }
      else {
        const k = clamp((g.t - r.cutT) / .5, 0, 1), sp = spring(g.t - r.cutT, 3, 6);
        drawSeg(28, r.cut - rd(k * (r.cut - 40)), x => (x - 28) * .15 * k + Math.sin(x * .3 + g.t * 20) * (1 - sp) * 2);
        drawSeg(r.cut + rd(k * (220 - r.cut)), 229, x => (229 - x) * .15 * k + Math.sin(x * .3 + g.t * 20) * (1 - sp) * 2);
        const bk = g.t - r.cutT; drawS(c, pomponLifeBow(), 128 + bk * 20, this.ribY(g, r, 128) + bk * bk * 300, { rot: bk * 6 });
      }
    }
    if (g.state === 'won') { const k = spring(g.t - g.decidedAt - .15, 2.4, 6); if (k > 0) { c.save(); c.translate(SW / 2, 42); c.scale(k, k); mord(c, '¡INAUGURADO!', 0, -8, { u: 1.3, r: 1.5, rim: 1, sy: 2, fill: ['#ffffff', '#fff27a', '#ffc23a'] }); c.restore(); } }
    g.blade.draw(c, g.t);
  },
  bot(g) {
    const r = g.ribbons.find(r => r.cut < 0); if (!r) return { down: false };
    const x = 128 + (g.ribbons.indexOf(r) ? 30 : -30), y = this.ribY(g, r, x), ph = (g._p = (g._p || 0) + 1) % 8;
    if (ph < 2) return { x, y: y - 22, down: false };
    return { x, y: y - 22 + (ph - 2) * 9, down: true };
  },
});
