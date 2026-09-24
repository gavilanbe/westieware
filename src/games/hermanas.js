// ============================================================================
//  Microgames of KIRA & NALA's stage (¡DIBUJA!) — everything is drawn with the
//  finger: trace, guide, join, ramp, lasso.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared ----
// Stroke recorder: dense polylines (points every ~2.5px even if the finger jumps).
// .fresh holds the points added this step (to paint them into a layer once).
function hermanasStrokes() {
  return {
    list: [], cur: null, done: null, fresh: [], len: 0,
    update() {
      this.done = null; this.fresh.length = 0;
      if (IN.tap) { this.cur = [[IN.x, IN.y]]; this.list.push(this.cur); this.fresh.push([IN.x, IN.y, 1]); }
      else if (IN.down && this.cur) this.add(IN.x, IN.y);
      if (IN.rel && this.cur) { this.add(IN.x, IN.y); this.done = this.cur; this.cur = null; }
    },
    add(x, y) {
      const c = this.cur, lp = c[c.length - 1], d = Math.hypot(x - lp[0], y - lp[1]); if (d < 1.4) return;
      const n = Math.ceil(d / 2.5); for (let i = 1; i <= n; i++) { const p = [lerp(lp[0], x, i / n), lerp(lp[1], y, i / n)]; c.push(p); this.fresh.push(p); }
      this.len += d;
    },
  };
}
// chalk: a grainy round nib stamped into a layer
function hermanasChalkDot(g, x, y, col = '#f4f1e6', r = 1.7, seed = 0) {
  g.fillStyle = col; const R = Math.ceil(r);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (dx * dx + dy * dy > r * r + .4) continue;
    const X = rd(x + dx), Y = rd(y + dy); if (hash2(X, Y, seed) < .2) continue;
    g.fillRect(X, Y, 1, 1);
  }
}
function hermanasChalkSeg(g, x0, y0, x1, y1, col, r, seed) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 1.2)); for (let i = 0; i <= n; i++) hermanasChalkDot(g, lerp(x0, x1, i / n), lerp(y0, y1, i / n), col, r, seed); }
// an erased-chalk smudge: faint dust pixels in a wide ellipse
function hermanasSmudge(g, x, y, w, h, seed) { g.fillStyle = '#2f3d36'; for (let i = 0; i < w * h * .35; i++) { const a = hash2(i, seed) * TAU, r = Math.sqrt(hash2(seed, i)); g.fillRect(rd(x + Math.cos(a) * r * w), rd(y + Math.sin(a) * r * h), 1, 1); } g.fillStyle = '#34443c'; for (let i = 0; i < w * .8; i++) g.fillRect(rd(x - w * .6 + hash2(i, seed + 3) * w * 1.2), rd(y - 2 + hash2(seed + 3, i) * 4), 2, 1); }
// point in polygon (pts = [[x,y],…])
function hermanasInPoly(x, y, pts) { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins; } return ins; }
// a finished stroke → its enclosed polygon (self-crossing or ends close), or null
function hermanasLoopOf(st, close = 30) {
  if (!st || st.length < 12) return null;
  let L = 0; for (let i = 1; i < st.length; i++) L += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
  if (L < 70) return null;
  for (let j = st.length - 1; j > 6; j -= 1) for (let i = 0; i < j - 6; i += 1) if (segCross(st[i], st[i + 1] || st[i], st[j - 1], st[j])) return st.slice(i + 1, j);
  if (Math.hypot(st[0][0] - st[st.length - 1][0], st[0][1] - st[st.length - 1][1]) < close) return st;
  return null;
}
// the bot draws planned strokes: plan = [[pts…], [pts…]] ; it lifts between them
function hermanasBot(g, plan, speed = 5, startAt = 0) {
  const B = g._bot || (g._bot = { si: 0, d: 0, lift: 0, done: false });
  if (g.t < startAt || B.done || !plan || !plan.length) return { down: false };
  if (B.lift > 0) { B.lift--; return { down: false }; }
  const st = plan[B.si]; if (!st) { B.done = true; return { down: false }; }
  // walk along the polyline by arc length
  let d = B.d, i = 0, p = st[0];
  for (i = 1; i < st.length; i++) { const L = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); if (d <= L) { const k = L ? d / L : 0; p = [lerp(st[i - 1][0], st[i][0], k), lerp(st[i - 1][1], st[i][1], k)]; break; } d -= L; }
  if (i >= st.length) { B.si++; B.d = 0; B.lift = 3; return { x: st[st.length - 1][0], y: st[st.length - 1][1], down: false }; }
  B.d += speed;
  return { x: p[0], y: p[1], down: true };
}
const hermanasCirclePts = (cx0, cy0, r, n = 28, a0 = 0, turns = 1.12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + i / n * TAU * turns; return [cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r * .9]; });
function hermanasThrottleSfx(g, name, every = .07, o) { g._sf = (g._sf || 0) - STEP; if (g._sf <= 0) { sfx(name, o); g._sf = every; } }

// small dog heads (for the leash game): westie, doodle, schnauzer, black lab, aussie
const HERMANAS_PUPS = [
  { ramp: RAMP.fur, ear: 'up', face: null }, { ramp: RAMP.apricot, ear: 'flop', face: null },
  { ramp: RAMP.grey, ear: 'fold', face: RAMP.fur }, { ramp: RAMP.black, ear: 'flop', face: null }, { ramp: RAMP.caramel, ear: 'fold', face: RAMP.fur },
];
function hermanasPupHead(i, happy) {
  return mdl('hermanas:pup' + i + (happy ? 'h' : ''), () => {
    const P = HERMANAS_PUPS[i % HERMANAS_PUPS.length];
    const head = SD.tufts(SD.ellipse(18, 17, 11, 10), 18, 17, .9, 14, i, 1.6), muz = SD.ellipse(18, 22.5, 6.5, 4.6);
    const ears = P.ear === 'up' ? SD.union(SD.grow(SD.poly([[8, 12], [9, 1], [15, 7]]), 1), SD.grow(SD.poly([[28, 12], [27, 1], [21, 7]]), 1))
      : P.ear === 'flop' ? SD.union(SD.ellipse(7, 17, 3.6, 7, -.3), SD.ellipse(29, 17, 3.6, 7, .3))
        : SD.union(SD.grow(SD.poly([[7, 12], [10, 3], [15, 9]]), 1.2), SD.grow(SD.poly([[29, 12], [26, 3], [21, 9]]), 1.2));
    const c = model(36, 32, [
      { f: ears, ramp: P.ramp.map(c => mixHex(c, '#3a3450', .2)), z: P.ear === 'flop' ? 2 : 0, th: 3 },
      { f: head, ramp: P.ramp, z: 1, th: 8, tex: clumpTex(3, .2, i + 3, 1.3) },
      { f: muz, ramp: P.face || P.ramp, z: 1.5, th: 4, amb: .4 },
      { f: SD.ellipse(18, 20, 2.4, 1.8), ramp: RAMP.black, z: 2, th: 2, gloss: true },
    ]);
    const g = c.g, K = '#140c14', ec = i === 3 ? '#e8e0f0' : K;
    if (happy) { for (const ex of [12, 22]) { px(g, ex, 15, ec); px(g, ex + 1, 14, ec); px(g, ex + 2, 15, ec); } hline(g, 16, 20, 24, K); rect(g, 17, 25, 3, 2, RAMP.pink[2]); }
    else { for (const ex of [12, 22]) { rect(g, ex, 14, 2, 3, ec === K ? K : '#140c14'); px(g, ex, 14, '#ffffff'); } hline(g, 17, 19, 24, K); }
    return c;
  });
}
function hermanasTennisBall(g, x, y, rot = 0) {
  disc(g, x, y, 5.5, INK); disc(g, x, y, 4.6, '#d8ef3a'); disc(g, x - 1.2, y - 1.4, 2.2, '#f2ff8a');
  for (let a = 0; a < Math.PI; a += .3) px(g, x + Math.cos(a + rot) * 3.4, y + Math.sin(a + rot) * 1.6 - 1, '#ffffff');
}

// ---------------------------------------------------------------- 1 PIZARRA -
// a closed outline sampled into points (normalised to ±1, y down)
const HERMANAS_SHAPES = {
  corazón: n => Array.from({ length: n }, (_, i) => { const t = i / n * TAU; return [Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 + .1]; }),
  pelota: n => Array.from({ length: n }, (_, i) => { const t = i / n * TAU; return [Math.cos(t) * .9, Math.sin(t) * .9]; }),
  estrella: n => { const v = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; v.push([Math.cos(a) * r, Math.sin(a) * r + .08]); } return hermanasResample(v, n); },
  hueso: n => { const v = []; const knob = (cx0, cy0, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; v.push([cx0 + Math.cos(a) * .32, cy0 + Math.sin(a) * .32]); } }; knob(.72, -.28, -2.6, .4); knob(.72, .28, -.4, 2.6); v.push([.45, .2], [-.45, .2]); knob(-.72, .28, .55, 3.7); knob(-.72, -.28, 2.55, 5.7); v.push([-.45, -.2], [.45, -.2]); return hermanasResample(v, n); },
  pez: n => { const v = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI * .8 + i / 16 * Math.PI * 1.6; v.push([.15 + Math.cos(a) * .7, Math.sin(a) * .5]); } v.push([-.7, .45], [-.95, .55], [-.95, -.55], [-.7, -.45]); return hermanasResample(v, n); },
  cucurucho: n => { const v = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; v.push([Math.cos(a) * .55, -.25 + Math.sin(a) * .55]); } v.push([.55, -.25], [0, 1], [-.55, -.25]); return hermanasResample(v, n); },
};
function hermanasResample(v, n) {
  const P = v.concat([v[0]]), L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; }
  const out = []; for (let k = 0; k < n; k++) { let d = k / n * tot, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const t = L[i] ? d / L[i] : 0; out.push([lerp(P[i][0], P[i + 1][0], t), lerp(P[i][1], P[i + 1][1], t)]); }
  return out;
}
function hermanasChalkboardBg() {
  return mdl('hermanas:hBoard', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wd = RAMP.wood;
    rect(g, 0, 0, SW, SH, Wd[2]); for (let y = 0; y < SH; y += 5) hline(g, 0, SW, y, Wd[1]);
    rect(g, 12, 8, SW - 24, SH - 20, INK); rect(g, 13, 9, SW - 26, SH - 22, '#243029');
    for (let i = 0; i < 14; i++) hermanasSmudge(g, 24 + hash2(i, 3) * 200, 20 + hash2(3, i) * 140, 18 + hash2(i, 9) * 26, 6 + hash2(9, i) * 8, i);
    ringRect(g, 8, 4, SW - 16, SH - 12, 4, Wd[3]); rect(g, 8, 4, SW - 16, 1, Wd[4]); ringRect(g, 12, 8, SW - 24, SH - 20, 1, INK);
    rect(g, 18, SH - 12, SW - 36, 5, INK); rect(g, 19, SH - 12, SW - 38, 3, Wd[3]);
    rect(g, 40, SH - 14, 12, 2, '#ffffff'); rect(g, 56, SH - 14, 9, 2, '#ffb3d1'); rect(g, 190, SH - 16, 22, 4, INK); rect(g, 191, SH - 15, 20, 2, '#3565cc');
    return c;
  });
}
defMG({
  id: 'pizarra', stage: 'hermanas', name: 'Pizarra del día', cmd: '¡DIBUJA!', how: 'Repasa el dibujo punteado con tiza', mech: 'draw', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'E5 . G5 . A5 . G5 . E5 . D5 . E5 - . . C5 . E5 . G5 . E5 . D5 . C5 . D5 - . .' },
    { i: 'pluck', v: .4, n: 'C4+E4 . . . C4+E4 . . . A3+C4 . . . A3+C4 . . . F3+A3 . . . F3+A3 . . . G3+B3 . . . G3+B3 . . .' },
    { i: 'bass', v: .8, n: 'C3 . . . G2 . . . A2 . . . E2 . . . F2 . . . C3 . . . G2 . . . G2 . B2 .' },
    { i: 'd', v: .6, n: 'k . z . r . z z k . z . r . z . k . z . r . z z k . z . r r r .' }] }),
  init(g) {
    const pool = [['corazón', 'pelota', 'estrella'], ['estrella', 'hueso', 'pez'], ['hueso', 'pez', 'cucurucho']][g.level - 1];
    g.name = g.pick(pool);
    const sc = [58, 52, 46][g.level - 1], cx0 = SW / 2, cy0 = 106;
    const n = fl(({ corazón: 40, pelota: 36, estrella: 44, hueso: 48, pez: 42, cucurucho: 40 })[g.name] * sc / 52);
    g.dots = HERMANAS_SHAPES[g.name](n).map(([x, y]) => ({ x: cx0 + x * sc * 1.25, y: cy0 + y * sc, on: false, t: 0 }));
    g.need = [.85, .88, .9][g.level - 1];
    g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH); g.cov = 0; g.fill = 0;
  },
  update(g, dt) {
    g.st.update();
    for (const p of g.st.fresh) {
      hermanasChalkDot(g.layer.g, p[0], p[1], '#f4f1e6', 1.8, 7);
      if (g.state === 'play') for (const d of g.dots) if (!d.on && Math.abs(d.x - p[0]) < 7 && Math.abs(d.y - p[1]) < 7 && Math.hypot(d.x - p[0], d.y - p[1]) < 7) { d.on = true; d.t = g.t; }
    }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) { hermanasThrottleSfx(g, 'chalk', .06, { pitch: .9 + g.r(.3) }); if (fl(g.t * 60) % 3 === 0) g.fx.add({ k: 'dot', x: IN.x + g.r(-2, 2), y: IN.y + g.r(-2, 2), vx: g.r(-20, 20), vy: g.r(10, 50), g: 120, r: 1, life: .35, c: '#e8e8e0' }); }
    const on = g.dots.filter(d => d.on).length, prev = g.cov; g.cov = on / g.dots.length;
    if (fl(g.cov * 10) > fl(prev * 10)) sfx('pop', { pitch: 1 + g.cov, vol: .35 });
    if (g.state === 'play' && g.cov >= g.need) { g.win(); sfx('sparkle'); for (let i = 0; i < 16; i++) g.fx.add({ k: 'star', x: g.r(60, 196), y: g.r(50, 160), vx: g.r(-30, 30), vy: g.r(-60, -20), life: .8, r: 3, c: g.pick(['#fff27a', '#ffb3d1', '#b3d9ff']) }); }
    if (g.state === 'won') g.fill = Math.min(1, g.fill + dt * 3);
  },
  draw(g, c) {
    c.drawImage(hermanasChalkboardBg(), 0, 0);
    txt(c, 'HOY DIBUJAMOS:', SW / 2, 16, '#e8e8e0', { align: 'c' });
    mord(c, g.name.toUpperCase(), SW / 2, 27, { u: .9, r: 1, rim: 1, sy: 1, fill: ['#ffffff', '#ffd1e4', '#ff93bf'], line: '#1b2420', shadow: '#1b2420' });
    // the coloured-in drawing when it's done (wiggles for joy)
    if (g.fill > 0) {
      const wig = Math.sin(g.t * 14) * 2 * g.fill, pts = g.dots.map(d => [d.x + (d.x - SW / 2) * .03 * Math.sin(g.t * 10), d.y + wig * .5]);
      c.globalAlpha = .75 * g.fill; polyPx(c, pts, { corazón: '#ff5d9e', pelota: '#ffd23f', estrella: '#fff27a', hueso: '#f2e2b8', pez: '#63a0ef', cucurucho: '#ffb070' }[g.name] || '#ffb3d1'); c.globalAlpha = 1;
    }
    // guide dots
    for (const d of g.dots) {
      if (d.on) { const k = clamp((g.t - d.t) * 6, 0, 1); disc(c, d.x, d.y, 2.2 - k * .6, k < 1 ? '#fff27a' : '#ffffff'); }
      else { const pulse = (fl(g.t * 6 + d.x * .1) % 3) === 0; px(c, d.x, d.y, pulse ? '#ffffff' : '#9fb1a8'); px(c, d.x + 1, d.y, '#6f8a80'); }
    }
    c.drawImage(g.layer, 0, 0);
    // a stick of chalk under the finger
    if (IN.down && g.state === 'play') { rect(c, IN.x + 2, IN.y - 9, 3, 9, INK); rect(c, IN.x + 3, IN.y - 8, 1, 7, '#ffffff'); }
    const w = rd(g.cov * 60); rect(c, SW - 78, SH - 26, 62, 6, INK); rect(c, SW - 77, SH - 25, 60, 4, '#3a4a42'); rect(c, SW - 77, SH - 25, w, 4, g.cov >= g.need ? '#5bd18b' : '#fff27a');
    if (g.state === 'won') { mord(c, '¡PRECIOSO!', SW / 2, 148, { u: 1.2, r: 1.3, rim: 1, sy: 1 }, { anim: i => ({ s: Math.max(0, spring(g.t - g.decidedAt - i * .04, 2.5, 7)) }) }); }
  },
  bot(g) { if (!g.plan) g.plan = [g.dots.map(d => [d.x, d.y]).concat([[g.dots[0].x, g.dots[0].y], [g.dots[1].x, g.dots[1].y]])]; return hermanasBot(g, g.plan, 5.2, .15); },
});

// ---------------------------------------------------------------- 2 REBAÑO --
// Parc de Joan Miró: sheep on the loose, Dona i Ocell watching.
function hermanasSheepSpr(f = 0) {
  return mdl('hermanas:sheep' + f, () => {
    const W = RAMP.fur, K = ['#140c14', '#221a28', '#342a3c', '#4a4056', '#645a70'];
    const body = SD.curls(SD.ellipse(15, 13, 11, 8), 1.1, 1.1, 2), head = SD.ellipse(27, 11, 4.6, 4), ear = SD.ellipse(25, 7.5, 3, 1.5, -.5);
    const legs = f ? SD.union(SD.capsule(9, 18, 7, 25, 1.2, 1), SD.capsule(20, 18, 22, 25, 1.2, 1)) : SD.union(SD.capsule(9, 18, 10, 25, 1.2, 1), SD.capsule(20, 18, 19, 25, 1.2, 1));
    const c = model(34, 27, [
      { f: legs, ramp: K, z: 0, th: 1.2 }, { f: body, fs: SD.ellipse(15, 13, 11, 8), ramp: W, z: 1, th: 8, tex: clumpTex(2.6, .25, 5, 1) },
      { f: head, ramp: K, z: 2, th: 4 }, { f: ear, ramp: K, z: 2.2, th: 1.5 },
    ]);
    px(c.g, 29, 10, '#ffffff'); px(c.g, 29, 11, '#140c14');
    return c;
  });
}
function hermanasDonaIOcell(g, x, base) {
  // the tall trencadís sculpture in Parc de Joan Miró, on its pond
  ellipsePx(g, x, base + 2, 26, 5, '#23609e'); ellipsePx(g, x, base + 1, 24, 4, '#5aaee6');
  const cols = ['#e2b21b', '#c02d45', '#3565cc', '#2a9a6a', '#ffffff'];
  for (let y = base - 62; y < base; y++) { const w = y < base - 44 ? 4 : 6 + Math.sin((y - base) * .15) * 1.5; for (let i = -w; i <= w; i++) px(g, x + i, y, cols[fl(hash2(fl((x + i) / 2), fl(y / 2), 9) * 5)]); }
  ringRect(g, x - 7, base - 72, 14, 12, 1, INK); rect(g, x - 6, base - 71, 12, 10, '#e2b21b'); rect(g, x - 2, base - 76, 4, 6, '#c02d45');
  vline(g, x - 7, base - 62, base, INK); vline(g, x + 8, base - 62, base, INK);
}
function hermanasParkBg(pond) {
  return mdl('hermanas:hPark' + (pond ? 'p' : ''), () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 36, ['#8fd3ff', '#b8e4ff', '#dff4ff']);
    for (let i = 0; i < 9; i++) disc(g, 10 + i * 30, 36 + (i % 2) * 3, 16, i % 2 ? '#4a8a3e' : '#5a9a48');
    rect(g, 0, 40, SW, SH - 40, '#6fb04e');
    for (let i = 0; i < 900; i++) { const x = hash2(i, 13) * SW, y = 40 + hash2(13, i) * 152; px(g, x, y, hash2(i, 2) < .5 ? '#5a9a48' : '#86c25e'); }
    // a sandy path of the park
    for (let x = 0; x < SW; x++) { const y = 176 + Math.sin(x * .03) * 4; rect(g, x, y, 1, 16, '#e3cfaf'); px(g, x, y, '#c9b28c'); }
    hermanasDonaIOcell(g, 30, 78);
    return c;
  });
}
const HERMANAS_PEN = { x: 186, y: 64, w: 58, h: 92, gate0: 92, gate1: 132 };
function hermanasPenFence(g, front) {
  const Wd = RAMP.wood, { x, y, w, h, gate0, gate1 } = HERMANAS_PEN;
  const post = (px0, py0) => { rect(g, px0 - 2, py0 - 12, 4, 14, INK); rect(g, px0 - 1, py0 - 11, 2, 12, Wd[3]); };
  const rail = (x0, y0, x1, y1) => { thickLine(g, x0, y0 - 4, x1, y1 - 4, 1.2, INK); thickLine(g, x0, y0 - 4, x1, y1 - 4, .6, Wd[4]); thickLine(g, x0, y0 - 9, x1, y1 - 9, 1.2, INK); thickLine(g, x0, y0 - 9, x1, y1 - 9, .6, Wd[4]); };
  if (!front) { rail(x, y, x + w, y); for (let i = 0; i <= w; i += 14.5) post(x + i, y); rail(x + w, y, x + w, y + h); rail(x, y, x, gate0); post(x, gate0); }
  else { rail(x, y + h, x + w, y + h); for (let i = 0; i <= w; i += 14.5) post(x + i, y + h); rail(x, gate1, x, y + h); post(x, gate1); post(x + w, y + h); }
}
const HERMANAS_PEN_SEGS = [[[HERMANAS_PEN.x, HERMANAS_PEN.y], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y]], [[HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y + HERMANAS_PEN.h]], [[HERMANAS_PEN.x, HERMANAS_PEN.y + HERMANAS_PEN.h], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y + HERMANAS_PEN.h]], [[HERMANAS_PEN.x, HERMANAS_PEN.y], [HERMANAS_PEN.x, HERMANAS_PEN.gate0]], [[HERMANAS_PEN.x, HERMANAS_PEN.gate1], [HERMANAS_PEN.x, HERMANAS_PEN.y + HERMANAS_PEN.h]]];
defMG({
  id: 'rebano', stage: 'hermanas', name: 'Ovejas en el parque', cmd: '¡GUÍA!', how: 'Dibuja el camino de la oveja hasta el corral', mech: 'draw', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .55, n: 'G4 . G4 A4 B4 . G4 . C5 . B4 A4 G4 . E4 . F#4 . F#4 G4 A4 . F#4 . D4 . E4 F#4 G4 - . .' },
    { i: 'kalimba', v: .4, n: '. . D5 . . . D5 . . . E5 . . . E5 . . . D5 . . . D5 . . . B4 . G4 . . .' },
    { i: 'bass', v: .85, n: 'G2 . . G2 D3 . . . C3 . . C3 G2 . . . D3 . . D3 A2 . . . G2 . D3 . G2 . . .' },
    { i: 'd', v: .65, n: 'k . h . s . h k k . h . s . h . k . h . s . h k k . h . s s h .' }] }),
  init(g) {
    g.pond = g.level >= 2;
    const n = g.level >= 3 ? 2 : 1;
    g.sheep = [];
    for (let i = 0; i < n; i++) g.sheep.push({ x: 36 + i * 10, y: n === 1 ? 120 : 96 + i * 52, path: [], fl: false, inPen: false, wet: false, f: 0, bump: 0 });
    g.pondE = { x: 118, y: 120, rx: 26, ry: 16 };
    g.st = hermanasStrokes(); g.speed = 92 * g.tempo; g.dogX = 10; g.dogY = 130;
  },
  update(g, dt) {
    g.st.update();
    // a stroke that starts near a sheep becomes that sheep's route
    if (IN.tap && g.state === 'play') {
      let best = null, bd = 26; for (const s of g.sheep) { const d = dist(IN.x, IN.y, s.x, s.y); if (!s.inPen && d < bd) { bd = d; best = s; } }
      g.owner = best; if (best) { best.path = []; sfx('hermanasBleat', { pitch: 1 + g.r(.2), vol: .4 }); }
    }
    if (g.owner && g.st.cur) for (const p of g.st.fresh) g.owner.path.push([p[0], p[1]]);
    if (IN.rel) g.owner = null;
    for (const s of g.sheep) {
      s.bump = Math.max(0, s.bump - dt * 3);
      if (s.inPen || s.wet) continue;
      let move = g.speed * dt;
      while (move > 0 && s.path.length) {
        const [tx, ty] = s.path[0], d = dist(s.x, s.y, tx, ty);
        if (d <= move) { if (this.blocked(s.x, s.y, tx, ty)) { s.path.length = 0; s.bump = 1; sfx('stamp', { vol: .3 }); sfx('hermanasBleat', { pitch: 1.4, vol: .5 }); break; } s.x = tx; s.y = ty; s.path.shift(); move -= d; }
        else { const nx = s.x + (tx - s.x) / d * move, ny = s.y + (ty - s.y) / d * move; if (this.blocked(s.x, s.y, nx, ny)) { s.path.length = 0; s.bump = 1; sfx('hermanasBleat', { pitch: 1.4, vol: .5 }); break; } s.fl = tx < s.x; s.x = nx; s.y = ny; move = 0; }
        s.f += dt * 10;
      }
      s.x = clamp(s.x, 8, SW - 8); s.y = clamp(s.y, 48, 184);
      if (g.pond && ((s.x - g.pondE.x) / g.pondE.rx) ** 2 + ((s.y - g.pondE.y) / g.pondE.ry) ** 2 < 1) { s.wet = true; s.path.length = 0; sfx('splash'); g.fx.burst(s.x, s.y, 14, { k: 'drop', c: ['#9bd6f7', '#dff4ff'], sp0: 40, sp1: 120, g: 300 }); if (g.state === 'play') g.lose(); }
      if (s.x > HERMANAS_PEN.x + 6 && s.x < HERMANAS_PEN.x + HERMANAS_PEN.w - 6 && s.y > HERMANAS_PEN.y + 6 && s.y < HERMANAS_PEN.y + HERMANAS_PEN.h - 4) { s.inPen = true; s.path.length = 0; sfx('hermanasBleat', { pitch: 1.2 }); sfx('coin'); g.fx.burst(s.x, s.y - 8, 10, { k: 'star', c: ['#fff27a', '#ffffff'] }); }
    }
    if (g.state === 'play' && g.sheep.every(s => s.inPen)) { g.win(); sfx('bark', { n: 2, pitch: 1.2 }); }
    // Kira herds behind the first loose sheep
    const tgt = g.sheep.find(s => !s.inPen) || g.sheep[0];
    const hx = tgt.x - (tgt.fl ? -26 : 26), hy = tgt.y + 6;
    g.dogX = lerp(g.dogX, hx, Math.min(1, dt * 4)); g.dogY = lerp(g.dogY, hy, Math.min(1, dt * 4)); g.dogFl = tgt.x < g.dogX;
  },
  blocked(x0, y0, x1, y1) { for (const [a, b] of HERMANAS_PEN_SEGS) if (segCross([x0, y0], [x1, y1], a, b)) return true; return false; },
  draw(g, c) {
    c.drawImage(hermanasParkBg(g.pond), 0, 0);
    if (g.pond) { const P = g.pondE; ellipsePx(c, P.x, P.y + 1, P.rx + 1, P.ry + 1, '#3f7a38'); ellipsePx(c, P.x, P.y, P.rx, P.ry, '#2f7cc4'); ellipsePx(c, P.x - 4, P.y - 3, P.rx - 8, P.ry - 7, '#5aaee6'); for (let i = 0; i < 4; i++) { const x = P.x - 16 + i * 10, y = P.y - 2 + Math.sin(g.t * 3 + i) * 2; hline(c, x, x + 3, y, '#dff4ff'); } }
    hermanasPenFence(c, false);
    // routes
    for (const s of g.sheep) { let i = 0; for (const p of s.path) { if (i++ % 3 === 0) { px(c, p[0], p[1], '#ffffff'); px(c, p[0] + 1, p[1], '#dff4ff'); } } if (s.path.length) { const e = s.path[s.path.length - 1]; ringPx(c, e[0], e[1], 3, '#ffffff'); } }
    if (g.st.cur && !g.owner) for (let i = 0; i < g.st.cur.length; i += 2) px(c, g.st.cur[i][0], g.st.cur[i][1], 'rgba(255,255,255,.5)');
    const ents = g.sheep.map(s => ({ y: s.y, draw: () => { shadowOval(c, s.x, s.y + 12, 11, 2.5, .4); drawS(c, s.wet ? silhouette(hermanasSheepSpr(0), '#9bd6f7') : hermanasSheepSpr(fl(s.f) % 2), s.x + Math.sin(s.bump * 20) * 2, s.y, { flip: s.fl }); if (s.inPen) drawHeart(c, s.x, s.y - 18 - (g.t * 10 % 6), '#ff4060', .8); } }));
    ents.push({ y: g.dogY, draw: () => { shadowOval(c, g.dogX, g.dogY + 10, 12, 2.5, .4); drawS(c, hermanasAussieSide('kira', g.state === 'won' ? 'bow' : 'run', g.state === 'lost' ? 'sad' : 'focus', .5), g.dogX, g.dogY + 12, { ax: .5, ay: 1, flip: g.dogFl }); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    hermanasPenFence(c, true);
    txt(c, 'CORRAL', HERMANAS_PEN.x + HERMANAS_PEN.w / 2, HERMANAS_PEN.y - 22, '#ffffff', { align: 'c', out: INK });
    const ld = g.sheep.find(s => !s.inPen && !s.path.length);
    if (g.state === 'play' && ld && g.t < 1.2 * g.spb * 4) { const k = (g.t * 2) % 1; ringPx(c, ld.x, ld.y, 12 + k * 8, '#ffffff'); }
    if (g.state === 'lost' && g.sheep.some(s => s.wet)) shout(c, '¡PLOF!', g.pondE.x, g.pondE.y - 30, g.t - g.decidedAt);
  },
  bot(g) {
    if (!g.plan) {
      g.plan = g.sheep.map(s => {
        const pts = [[s.x, s.y]];
        if (g.pond) pts.push([s.x + 40, s.y < 120 ? 78 : 160], [150, s.y < 120 ? 80 : 158]);
        pts.push([HERMANAS_PEN.x - 16, 112], [HERMANAS_PEN.x + 8, 112], [HERMANAS_PEN.x + HERMANAS_PEN.w / 2, 112]);
        return pts;
      });
    }
    return hermanasBot(g, g.plan, 6, .1);
  },
});

// ---------------------------------------------------------------- 3 CORREAS -
const HERMANAS_LEASH_COLS = [['#e23b4e', '#ff8d9b', '#8c1d30'], ['#3565cc', '#8fc0ff', '#1a2a6b'], ['#e2b21b', '#fff27a', '#9c700c'], ['#2a9a6a', '#8ef0b4', '#155d3f']];
function hermanasLeashRackBg() {
  return mdl('hermanas:hRack', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, SH);
    // the dogs wait on the green bench; the rack on the right
    rect(g, 0, 0, 70, SH, RAMP.green[2]); rect(g, 69, 0, 2, SH, RAMP.green[0]); for (let y = 12; y < SH; y += 24) hline(g, 0, 68, y, RAMP.green[1]);
    rect(g, SW - 40, 6, 30, SH - 12, INK); rect(g, SW - 39, 7, 28, SH - 14, RAMP.wood[3]); for (let y = 10; y < SH - 8; y += 6) hline(g, SW - 38, SW - 12, y, RAMP.wood[2]);
    tiny(g, 'CORREAS', SW - 25, 1, INK, { align: 'c' });
    return c;
  });
}
function hermanasLeashCoil(g, x, y, ci, t) {
  const C3 = HERMANAS_LEASH_COLS[ci];
  rect(g, x - 2, y - 3, 5, 4, INK); rect(g, x - 1, y - 2, 3, 2, RAMP.steel[3]);
  for (let i = 0; i < 3; i++) { const r = 7 - i * .8, yy = y + 8 + i * 2; ringPx(g, x - 1, yy, r + 1, INK); ringPx(g, x - 1, yy, r, C3[0]); }
  for (let a = 3.6; a < 5; a += .2) px(g, x - 1 + Math.cos(a) * 6, y + 8 + Math.sin(a) * 6, C3[1]);
  rect(g, x - 3, y + 16, 5, 6, INK); rect(g, x - 2, y + 17, 3, 4, RAMP.steel[2]);
}
function hermanasRopeLine(g, x0, y0, x1, y1, ci, sag = 14) {
  const C3 = HERMANAS_LEASH_COLS[ci], n = Math.max(24, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.2)), mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
  let lx = x0, ly = y0;
  const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, cc = t * t; pts.push([a * x0 + b * mx + cc * x1, a * y0 + b * my + cc * y1]); }
  for (const [x, y] of pts) { disc(g, x, y, 2.1, INK); }
  for (const [x, y] of pts) { disc(g, x, y, 1.3, C3[0]); }
  for (let i = 0; i < pts.length; i += 3) px(g, pts[i][0], pts[i][1] - 1, C3[1]);
  for (let i = 5; i < pts.length; i += 9) px(g, pts[i][0], pts[i][1], C3[2]);
  void lx; void ly;
}
defMG({
  id: 'correas', stage: 'hermanas', name: 'Cada uno su correa', cmd: '¡UNE!', how: 'Une cada perro con la correa de su color', mech: 'draw', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .6, n: 'A4 C5 E5 . A4 C5 E5 . G4 B4 D5 . G4 B4 D5 . F4 A4 C5 . F4 A4 C5 . E4 G#4 B4 . E4 G#4 B4 .' },
    { i: 'pluck', v: .4, n: 'A5 . . . . . E5 . D5 . . . . . B4 . C5 . . . . . A4 . B4 . . . G#4 . . .' },
    { i: 'bass', v: .85, n: 'A2 . A2 . E2 . E2 . G2 . G2 . D2 . D2 . F2 . F2 . C3 . C3 . E2 . E2 . B2 . E2 .' },
    { i: 'd', v: .65, n: 'k . h . s . h . k k h . s . h . k . h . s . h . k k h . s s s .' }] }),
  init(g) {
    const n = g.level + 1;
    const cols = shuffle([0, 1, 2, 3]).slice(0, n), order = shuffle(cols.slice());
    if (n > 1 && order.every((c2, i) => c2 === cols[i])) order.push(order.shift());
    const sp = SH / (n + 1);
    const breeds = shuffle([0, 1, 2, 3, 4]);
    g.dogs = cols.map((ci, i) => ({ ci, x: 34, y: rd(sp * (i + 1)) + 4, pup: breeds[i], ok: false, t: -1 }));
    g.hooks = order.map((ci, i) => ({ ci, x: SW - 25, y: rd(sp * (i + 1)) - 8 }));
    g.links = []; g.st = hermanasStrokes(); g.bad = null;
  },
  anchorD(d) { return [d.x + 14, d.y + 10]; },
  anchorH(h) { return [h.x - 1, h.y + 18]; },
  update(g) {
    g.st.update();
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .08, { pitch: 1.3 });
    const s = g.st.done;
    if (s && g.state === 'play' && s.length > 4) {
      const a = s[0], b = s[s.length - 1];
      const nearD = p => g.dogs.find(d => !d.ok && dist(p[0], p[1], ...this.anchorD(d)) < 22 || !d.ok && Math.abs(p[0] - d.x) < 20 && Math.abs(p[1] - d.y) < 18);
      const nearH = p => g.hooks.find(h => dist(p[0], p[1], ...this.anchorH(h)) < 22 || Math.abs(p[0] - h.x) < 16 && Math.abs(p[1] - h.y - 8) < 20);
      let d = nearD(a), h = nearH(b); if (!d || !h) { d = nearD(b); h = nearH(a); }
      if (d && h) {
        if (d.ci === h.ci && !g.links.some(l => l.h === h)) { d.ok = true; d.t = g.t; g.links.push({ d, h }); sfx('coin'); sfx('bark', { pitch: 1.3 + g.links.length * .1, vol: .7 }); HITSTOP = 2; g.fx.burst(...this.anchorD(d), 10, { k: 'star', c: [HERMANAS_LEASH_COLS[d.ci][1], '#ffffff'] }); if (g.dogs.every(x => x.ok)) g.win(); }
        else { g.bad = { a, b, t: g.t }; g.lose(); g.shake(3, .2); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(hermanasLeashRackBg(), 0, 0);
    for (const h of g.hooks) { const used = g.links.some(l => l.h === h); if (!used) hermanasLeashCoil(c, h.x, h.y, h.ci, g.t); else { rect(c, h.x - 2, h.y - 3, 5, 4, INK); rect(c, h.x - 1, h.y - 2, 3, 2, RAMP.steel[3]); } }
    for (const l of g.links) { const [x0, y0] = this.anchorD(l.d), [x1, y1] = this.anchorH(l.h); hermanasRopeLine(c, x0, y0, x1, y1, l.d.ci, 10 + Math.sin(g.t * 4) * 2); }
    for (const d of g.dogs) {
      const bounce = d.ok ? Math.abs(Math.sin((g.t - d.t) * 9)) * 3 : Math.sin(g.t * 3 + d.y) * .8;
      drawS(c, hermanasPupHead(d.pup, d.ok), d.x, d.y - bounce, {});
      // collar with its colour
      const C3 = HERMANAS_LEASH_COLS[d.ci]; rect(c, d.x - 10, d.y + 12 - bounce, 21, 4, INK); rect(c, d.x - 9, d.y + 13 - bounce, 19, 2, C3[0]); disc(c, d.x + 12, d.y + 14 - bounce, 2.4, INK); disc(c, d.x + 12, d.y + 14 - bounce, 1.5, RAMP.gold[3]);
    }
    // the line being drawn
    if (g.st.cur) for (let i = 1; i < g.st.cur.length; i++) linePx(c, g.st.cur[i - 1][0], g.st.cur[i - 1][1], g.st.cur[i][0], g.st.cur[i][1], '#ffffff');
    if (g.bad) { const k = g.t - g.bad.t; if (fl(k * 12) % 2 === 0) thickLine(c, g.bad.a[0], g.bad.a[1], g.bad.b[0], g.bad.b[1], 1.5, '#ff4060'); shout(c, '¡ESA NO ES!', SW / 2, 40, k); }
  },
  bot(g) {
    if (!g.plan) g.plan = g.dogs.map(d => { const h = g.hooks.find(h => h.ci === d.ci); const [x0, y0] = this.anchorD(d), [x1, y1] = this.anchorH(h); return [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 6], [x1, y1]]; });
    return hermanasBot(g, g.plan, 9, .1);
  },
});

// ---------------------------------------------------------------- 4 RAMPA ---
function hermanasTideBg() {
  return mdl('hermanas:hTide', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 60, ['#5ab4f0', '#8fd3ff', '#c8e8fc']);
    bandsV(g, 0, 60, SW, 26, ['#23609e', '#2f7cc4', '#5aaee6']);
    hermanasVelaHotel(g, 222, 61);
    bandsV(g, 0, 86, SW, 106, ['#ecca8e', '#f2d59a', '#f6dea8']);
    for (let i = 0; i < 500; i++) px(g, hash2(i, 51) * SW, 86 + hash2(51, i) * 106, hash2(i, 6) < .5 ? '#e3c283' : '#fff0c8');
    // a rock pool between them (where balls get lost)
    ellipsePx(g, 96, 178, 58, 13, '#8a8f98'); ellipsePx(g, 96, 177, 55, 11, '#2f7cc4'); ellipsePx(g, 90, 175, 40, 6, '#5aaee6');
    for (const [x, y] of [[48, 172], [140, 170], [60, 186], [128, 188]]) { disc(g, x, y, 5, INK); disc(g, x, y, 4, '#9896a4'); px(g, x - 1, y - 2, '#cac8d3'); }
    // the lifeguard platform
    rect(g, 4, 60, 52, 6, INK); rect(g, 5, 61, 50, 4, RAMP.wood[3]); rect(g, 5, 61, 50, 1, RAMP.wood[4]);
    for (const x of [10, 46]) { rect(g, x - 2, 66, 4, 110, INK); rect(g, x - 1, 66, 2, 110, RAMP.wood[2]); }
    for (let y = 76; y < 170; y += 14) linePx(g, 10, y, 46, y + 10, RAMP.wood[1]);
    rect(g, 2, 44, 3, 16, INK); polyPx(g, [[5, 44], [18, 48], [5, 52]], '#e23b4e');
    return c;
  });
}
defMG({
  id: 'rampa', stage: 'hermanas', name: 'Pelota a la boca', cmd: '¡RAMPA!', how: 'Dibuja una rampa para que la pelota llegue a Nala', mech: 'draw', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'D5 . F#5 . A5 . F#5 . G5 . B5 . A5 - . . D5 . F#5 . A5 . D6 . C#6 . A5 . E5 - . .' },
    { i: 'pluck', v: .4, n: 'D4+F#4 . . D4+F#4 . . . . G3+B3 . . G3+B3 . . . . D4+F#4 . . D4+F#4 . . . . A3+C#4 . . A3+C#4 . . . .' },
    { i: 'bass', v: .85, n: 'D2 . D3 . A2 . D3 . G2 . G3 . D3 . B2 . D2 . D3 . A2 . F#2 . A2 . A3 . E3 . C#3 .' },
    { i: 'd', v: .65, n: 'k . h h s . h . k k h . s . h h k . h h s . h . k k h . s s s s' }] }),
  init(g) {
    g.ball = { x: 30, y: 54, vx: 0, vy: 0, rot: 0, live: false, done: false };
    g.dogX = [196, 206, 204][g.level - 1]; g.dogY = 174; g.dogV = g.level >= 3 ? 18 * g.tempo : 0;
    g.segs = [[[4, 60], [56, 60]]];
    g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH); g.release = 1.1; g.caught = false;
  },
  mouth(g) { return [g.dogX - 31, g.dogY - 39]; },
  update(g, dt) {
    g.st.update();
    for (const p of g.st.fresh) { const c = g.layer.g; disc(c, p[0], p[1], 2.6, INK); }
    if (g.st.cur && g.st.cur.length > 1) { const s = g.st.cur, n = s.length; for (let i = Math.max(1, n - g.st.fresh.length); i < n; i++) g.segs.push([s[i - 1], s[i]]); }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .07, { pitch: .7 });
    if (g.dogV && g.state === 'play') { g.dogX += g.dogV * dt; if (g.dogX < 184 || g.dogX > 226) { g.dogV *= -1; g.dogX = clamp(g.dogX, 184, 226); } }
    const b = g.ball;
    if (!b.live && g.b >= g.release && !b.done) { b.live = true; b.vx = 55 * g.tempo; sfx('boing', { pitch: 1.6, vol: .4 }); }
    if (b.live && !b.done) {
      const sub = 5, h = dt / sub;
      for (let k = 0; k < sub; k++) {
        b.vy += 520 * g.tempo * g.tempo * h; b.x += b.vx * h; b.y += b.vy * h;
        for (const [p, q] of g.segs) {
          const dx = q[0] - p[0], dy = q[1] - p[1], L = dx * dx + dy * dy || 1; let t = ((b.x - p[0]) * dx + (b.y - p[1]) * dy) / L; t = clamp(t, 0, 1);
          const cx0 = p[0] + dx * t, cy0 = p[1] + dy * t, ex = b.x - cx0, ey = b.y - cy0, d = Math.hypot(ex, ey);
          if (d < 5 && d > 0) {
            const nx = ex / d, ny = ey / d; b.x += nx * (5 - d); b.y += ny * (5 - d);
            const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.25 * vn * nx; b.vy -= 1.25 * vn * ny; if (vn < -60) sfx('tap', { pitch: 1.4, vol: .25 }); }
            b.vx *= .998; b.vy *= .998;
          }
        }
      }
      b.rot += b.vx * dt * .2;
      const [mx, my] = this.mouth(g);
      if (dist(b.x, b.y, mx, my) < 17 && g.state === 'play') { b.done = true; g.caught = true; g.win(); sfx('gulp'); sfx('bark', { n: 2, pitch: 1.3 }); HITSTOP = 3; g.fx.burst(mx, my, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#d8ef3a'] }); }
      if ((b.y > 168 && b.x > 40 && b.x < 150) && g.state === 'play') { b.done = true; g.lose(); sfx('splash'); g.fx.burst(b.x, 172, 14, { k: 'drop', c: ['#9bd6f7', '#dff4ff'], sp0: 40, sp1: 130, g: 300 }); }
      if ((b.y > 200 || b.x > 270 || b.x < -20) && g.state === 'play') { b.done = true; g.lose(); }
    }
  },
  draw(g, c) {
    c.drawImage(hermanasTideBg(), 0, 0);
    // drawn ramps: a sandy plank with a highlight
    c.drawImage(g.layer, 0, 0);
    for (const s of g.st.list) for (let i = 1; i < s.length; i++) { thickLine(c, s[i - 1][0], s[i - 1][1], s[i][0], s[i][1], 1.2, '#ff9f4f'); }
    for (const s of g.st.list) for (let i = 2; i < s.length; i += 2) px(c, s[i][0], s[i][1] - 1, '#ffd49b');
    // Nala waiting with her mouth open
    const caught = g.caught, mood = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'wow';
    shadowOval(c, g.dogX - 4, g.dogY + 1, 24, 3, .4);
    drawS(c, hermanasAussieSide('nala', caught ? 'jump' : 'stand', mood, .9), g.dogX, g.dogY - (caught ? Math.abs(Math.sin(g.t * 8)) * 8 : 0), { ax: .5, ay: 1, flip: true });
    const [mx, my] = this.mouth(g);
    if (g.state === 'play' && !g.ball.done) { const k = (g.t * 2) % 1; ringPx(c, mx, my, 8 + k * 6, 'rgba(255,255,255,.7)'); }
    const b = g.ball; if (!b.done || g.caught) hermanasTennisBall(c, g.caught ? mx : b.x, g.caught ? my : b.y, b.rot);
    if (!b.live && !b.done) { const k = clamp(g.b / g.release, 0, 1); rect(c, 18, 40, 24, 4, INK); rect(c, 19, 41, rd(22 * k), 2, '#fff27a'); }
    if (g.state === 'lost') shout(c, '¡PLOF!', 96, 140, g.t - g.decidedAt);
  },
  bot(g) {
    if (!g.plan) { const [mx, my] = this.mouth(g); g.plan = [[[58, 72], [100, 94], [mx - 14, my - 3]]]; }
    return hermanasBot(g, g.plan, 9, .05);
  },
});

// ---------------------------------------------------------------- 5 LAZO ----
// Plaça de Catalunya: one of the pigeons has the frisbee
function hermanasPigeonSpr(f = 0, item = null) {
  return mdl('hermanas:pigeon' + f + (item || ''), () => {
    const B = ['#2c3040', '#4a5068', '#6f7894', '#9aa3bf', '#c8cfe4'];
    const body = SD.ellipse(12, 12, 8, 6, -.1), head = SD.circle(19, 6.5 + (f ? 1.5 : 0), 3.6), tail = SD.poly([[5, 11], [0, 9], [1, 15], [6, 15]]);
    const neck = SD.ellipse(17, 10, 3.5, 4);
    const c = model(34, 22, [
      { f: tail, ramp: B.map(x => mixHex(x, '#000000', .2)), z: 0, th: 2 }, { f: body, ramp: B, z: 1, th: 6 },
      { f: neck, ramp: ['#1f3a3a', '#2f6a60', '#4f9a80', '#8e6ab8', '#b98ee0'], z: 1.5, th: 3 },
      { f: head, ramp: B, z: 2, th: 3.5 },
    ]);
    const g = c.g, hy = 6 + (f ? 1.5 : 0);
    px(g, 20, hy - 1, '#ff9f4f'); px(g, 20, hy - 2, INK);
    rect(g, 22, hy, 3, 1, '#e8c0a0'); px(g, 25, hy, INK);
    for (const x of [10, 13]) { vline(g, x, 17, 19, '#e23b4e'); hline(g, x - 1, x + 1, 20, '#e23b4e'); }
    hline(g, 8, 14, 11, B[1]); hline(g, 9, 13, 13, B[1]);
    if (item === 'frisbee') g.drawImage(hermanasFrisbeeSpr('#ff6b3d', 12), 21, hy - 2);
    if (item === 'galleta') { disc(g, 25, hy + 1, 2.6, INK); disc(g, 25, hy + 1, 1.9, '#d58c4c'); px(g, 25, hy, '#5b3a1d'); }
    if (item === 'moneda') { disc(g, 25, hy + 1, 2.6, INK); disc(g, 25, hy + 1, 1.9, '#e7c35f'); px(g, 24, hy, '#fff0a6'); }
    return c;
  });
}
function hermanasPlazaBg() {
  return mdl('hermanas:hPlaza', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#d8d3c8');
    for (let y = 0; y < SH; y += 12) for (let x = ((y / 12) % 2) * 12; x < SW; x += 24) rect(g, x, y, 12, 12, '#cec8bb');
    // the great compass-rose star of the square
    const cx0 = SW / 2, cy0 = 104;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 40 : 70; polyPx(g, [[cx0, cy0], [cx0 + Math.cos(a - .18) * 18, cy0 + Math.sin(a - .18) * 12], [cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r * .62], [cx0 + Math.cos(a + .18) * 18, cy0 + Math.sin(a + .18) * 12]], i % 2 ? '#9896a4' : '#e8e4da'); }
    ellipsePx(g, cx0, cy0, 12, 8, '#c0662c'); ellipsePx(g, cx0, cy0, 8, 5, '#e8e4da');
    // fountain rim at the top, benches
    rect(g, 0, 0, SW, 22, '#5aaee6'); for (let x = 0; x < SW; x += 6) px(g, x + (x * 7) % 5, 8 + (x % 3) * 3, '#dff4ff'); rect(g, 0, 22, SW, 5, INK); rect(g, 0, 22, SW, 4, '#b9b3a6'); hline(g, 0, SW, 22, '#e8e4da');
    for (const x of [30, 196]) { rect(g, x, 178, 34, 5, INK); rect(g, x + 1, 179, 32, 3, RAMP.wood[3]); rect(g, x + 3, 183, 2, 6, INK); rect(g, x + 29, 183, 2, 6, INK); }
    for (const x of [10, 246]) { rect(g, x - 1, 30, 3, 60, INK); vline(g, x, 30, 90, '#44424f'); rect(g, x - 4, 26, 9, 6, INK); rect(g, x - 3, 27, 7, 4, '#fff7ae'); rect(g, x - 3, 88, 7, 3, INK); }
    for (let i = 0; i < 60; i++) px(g, 20 + hash2(i, 61) * 216, 40 + hash2(61, i) * 130, hash2(i, 4) < .5 ? '#c8a878' : '#e8d8b8');
    panel(g, 150, 176, 70, 12, RAMP.green[2], { r: 3 }); tiny(g, 'PL.CATALUNYA', 185, 180, '#ffffff', { align: 'c' });
    return c;
  });
}
defMG({
  id: 'lazo', stage: 'hermanas', name: 'Paloma ladrona', cmd: '¡RODEA!', how: 'Rodea con el dedo a la paloma del frisbee', mech: 'draw', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .55, n: 'B4 . D5 . E5 . D5 B4 A4 . B4 . G4 - . . B4 . D5 . E5 . G5 E5 D5 . B4 . A4 - . .' },
    { i: 'kalimba', v: .4, n: '. . . . G5 . . . . . . . E5 . . . . . . . B5 . . . . . . . F#5 . . .' },
    { i: 'bass', v: .85, n: 'E2 . . E2 . . B2 . C3 . . C3 . . G2 . E2 . . E2 . . B2 . D3 . . D3 . . A2 .' },
    { i: 'd', v: .65, n: 'k . h . s . h h k . h . s . h . k . h . s . h h k k h . s . s s' }] }),
  init(g) {
    const n = [5, 7, 9][g.level - 1];
    g.birds = [];
    for (let i = 0; i < n; i++) g.birds.push({ x: g.r(30, 226), y: g.r(46, 168), tx: 0, ty: 0, wait: g.r(.1, .6), f: 0, fl: g.r() < .5, item: null, thief: false, fly: 0, vx: 0, vy: 0 });
    g.birds[0].thief = true; g.birds[0].item = 'frisbee';
    if (g.level >= 3) { g.birds[1].item = 'galleta'; g.birds[2].item = 'moneda'; }
    g.speed = [26, 36, 44][g.level - 1] * g.tempo; g.st = hermanasStrokes(); g.lasso = null; g.miss = null;
  },
  update(g, dt) {
    g.st.update();
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .07, { pitch: 1.1 });
    for (const b of g.birds) {
      if (b.fly > 0) { b.fly -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 60 * dt; b.f += dt * 20; if (b.fly <= 0) { b.x = clamp(b.x, 20, 236); b.y = clamp(b.y, 44, 170); } continue; }
      if (b.caught) continue;
      b.wait -= dt;
      if (b.wait <= 0) { b.tx = clamp(b.x + g.r(-50, 50), 20, 236); b.ty = clamp(b.y + g.r(-30, 30), 44, 170); b.wait = g.r(.5, 1.2); }
      const d = dist(b.x, b.y, b.tx, b.ty), sp = g.speed * (b.thief ? 1.25 : 1);
      if (d > 1) { b.x += (b.tx - b.x) / d * Math.min(d, sp * dt); b.y += (b.ty - b.y) / d * Math.min(d, sp * dt); b.fl = b.tx < b.x; b.f += dt * 8; }
      else b.f += dt * 3;
    }
    const s = g.st.done;
    if (s && g.state === 'play') {
      const poly = hermanasLoopOf(s);
      if (poly) {
        const inside = g.birds.filter(b => !b.fly && hermanasInPoly(b.x, b.y + 2, poly));
        const thief = inside.find(b => b.thief);
        if (thief) { thief.caught = true; g.lasso = { poly, t: g.t, b: thief }; g.win(); sfx('hermanasCruac'); sfx('sparkle', { delay: .2 }); HITSTOP = 4; g.fx.burst(thief.x, thief.y, 16, { k: 'star', c: ['#fff27a', '#ffffff', '#ff9f4f'] }); for (const b of g.birds) if (!b.thief) { b.fly = .8; b.vx = (b.x - thief.x) * 2; b.vy = -120; } }
        else if (inside.length) { g.miss = { poly, t: g.t }; g.lose(); sfx('hermanasCruac', { pitch: .8 }); for (const b of inside) { b.fly = .9; b.vx = g.r(-120, 120); b.vy = -140; } g.shake(2, .2); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(hermanasPlazaBg(), 0, 0);
    const bs = g.birds.slice().sort((a, b) => a.y - b.y);
    for (const b of bs) {
      if (!b.fly) shadowOval(c, b.x, b.y + 10, 7, 1.5, .35);
      const img = hermanasPigeonSpr(b.fly > 0 ? 1 : fl(b.f) % 2, b.thief && !(g.lasso && g.t - g.lasso.t > .5) ? 'frisbee' : b.item);
      drawS(c, img, b.x, b.y - (b.fly > 0 ? 6 : 0), { flip: b.fl, rot: b.fly > 0 ? Math.sin(b.f) * .2 : 0 });
    }
    if (g.st.cur) for (let i = 1; i < g.st.cur.length; i++) { thickLine(c, g.st.cur[i - 1][0], g.st.cur[i - 1][1], g.st.cur[i][0], g.st.cur[i][1], 1, '#ffffff'); }
    if (g.lasso) {
      // the chalk loop tightens into a rope around the thief
      const k = clamp((g.t - g.lasso.t) / .35, 0, 1), b = g.lasso.b, P = g.lasso.poly.map(([x, y]) => [lerp(x, b.x, k * .7), lerp(y, b.y, k * .7)]);
      for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; thickLine(c, p[0], p[1], q[0], q[1], 1.6, '#c0662c'); }
      if (g.t - g.lasso.t > .5) { const fk = clamp((g.t - g.lasso.t - .5) / .4, 0, 1); drawS(c, hermanasFrisbeeSpr(), lerp(b.x + 8, b.x + 30, fk), lerp(b.y, b.y + 12, fk) - Math.sin(fk * Math.PI) * 20, { rot: fk * 6 }); }
      shout(c, '¡TE PILLÉ!', clamp(b.x, 50, 206), clamp(b.y - 34, 30, 160), g.t - g.lasso.t);
    }
    if (g.miss) { const k = g.t - g.miss.t; if (fl(k * 10) % 2 === 0) for (let i = 0; i < g.miss.poly.length; i += 2) px(c, g.miss.poly[i][0], g.miss.poly[i][1], '#ff4060'); shout(c, '¡ESA NO!', SW / 2, 36, k); }
    if (g.state === 'play') { const th = g.birds[0]; if (fl(g.t * 4) % 2 === 0 && g.t < 1.4) drawS(c, mdl('hermanas:hArrow', () => spr(['kkkkk', 'kyyyk', '.kyk.', '..k..'], { k: INK, y: '#fff27a' })), th.x + 2, th.y - 16); }
  },
  bot(g) {
    const th = g.birds[0];
    if (!g.plan || (g._bot && g._bot.done && g.state === 'play')) {
      // where will the thief be when the loop closes (~.3s)?
      const d = dist(th.x, th.y, th.tx, th.ty), sp = g.speed * 1.25 * .32, k = d > 1 ? Math.min(1, sp / d) : 0;
      const cx0 = th.x + (th.tx - th.x) * k, cy0 = th.y + (th.ty - th.y) * k;
      g.plan = [hermanasCirclePts(cx0, cy0 + 2, 30, 30, -Math.PI / 2, 1.15)]; g._bot = null;
    }
    return hermanasBot(g, g.plan, 12, .1);
  },
});
