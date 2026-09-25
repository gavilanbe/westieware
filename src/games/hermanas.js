// ============================================================================
//  Microgames of KIRA & NALA's stage (¡DIBUJA!) — everything is drawn with the
//  finger: trace, guide, join, ramp, lasso, sand walls, dots, city routes.
//  Every game shows its goal at a glance: a glowing target, a dashed guide,
//  a label, and the sisters reacting in a corner.
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
    const X = rd(x + dx), Y = rd(y + dy); if (hash2(X, Y, seed) < .16) continue;
    g.fillRect(X, Y, 1, 1);
  }
}
// an erased-chalk smudge: faint dust pixels in a wide ellipse (also used by the stage file)
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
  let d = B.d, i = 0, p = st[0];
  for (i = 1; i < st.length; i++) { const L = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); if (d <= L) { const k = L ? d / L : 0; p = [lerp(st[i - 1][0], st[i][0], k), lerp(st[i - 1][1], st[i][1], k)]; break; } d -= L; }
  if (i >= st.length) { B.si++; B.d = 0; B.lift = 3; return { x: st[st.length - 1][0], y: st[st.length - 1][1], down: false }; }
  B.d += speed;
  return { x: p[0], y: p[1], down: true };
}
const hermanasCirclePts = (cx0, cy0, r, n = 28, a0 = 0, turns = 1.12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + i / n * TAU * turns; return [cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r * .9]; });
function hermanasThrottleSfx(g, name, every = .07, o) { g._sf = (g._sf || 0) - STEP; if (g._sf <= 0) { sfx(name, o); g._sf = every; } }
// ---- guides that make every goal readable
// marching dashed line along a polyline
function hermanasDashes(g, pts, t, col = '#ffffff', dash = 4, gap = 3, w = 1) {
  let acc = -((t * 24) % (dash + gap));
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0);
    for (let q = 0; q < L; q += 1) { const ph = (acc + q) % (dash + gap); if (ph >= 0 && ph < dash) { const x = lerp(x0, x1, q / L), y = lerp(y0, y1, q / L); if (w > 1) rect(g, rd(x) - 1, rd(y) - 1, 2, 2, col); else px(g, x, y, col); } }
    acc += L;
  }
}
// a double pulsing ring round a target
function hermanasTarget(g, x, y, r, t, col = '#fff27a') { const k = (t * 1.8) % 1; ringPx(g, x, y, r + k * 6, col); ringPx(g, x, y, r + k * 6 + 1, INK); if (k < .5) ringPx(g, x, y, r - 2, '#ffffff'); }
// a chunky arrow pointing at angle a (tip at x, y)
function hermanasArrow(g, x, y, a, col = '#5bd18b', s = 1) {
  const c = Math.cos(a), sn = Math.sin(a), P = (u, v) => [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s];
  const pts = [P(0, 0), P(-9, -7), P(-9, -3), P(-18, -3), P(-18, 3), P(-9, 3), P(-9, 7)];
  polyPx(g, pts.map(([px0, py0]) => [px0 + 1, py0 + 1]), INK); polyPx(g, pts.map(([px0, py0]) => [px0 - 1, py0]), INK); polyPx(g, pts.map(([px0, py0]) => [px0, py0 - 1]), INK);
  polyPx(g, pts, col); linePx(g, ...P(-16, -2), ...P(-9, -2), '#ffffff');
}
// a little pointer label ("AQUÍ", "ENTRADA", "¡LADRONA!")
function hermanasTag(g, x, y, s, col = '#ffffff', fg = INK) {
  const w = txtW(s) + 10; panel(g, rd(x - w / 2), rd(y - 14), w, 13, col, { r: 4 });
  polyPx(g, [[x - 4, y - 2], [x + 4, y - 2], [x, y + 3]], INK); polyPx(g, [[x - 3, y - 2], [x + 3, y - 2], [x, y + 2]], col);
  txt(g, s, x, y - 11, fg, { align: 'c' });
}
// one of the sisters peeking from a corner, reacting to the result
function hermanasPeek(g, who, x, y, gm, flip) {
  const ex = gm.state === 'won' ? 'happy' : gm.state === 'lost' ? 'sad' : fl(gm.t * .9) % 4 === 3 ? 'wink' : 'normal';
  const bob = gm.state === 'won' ? -Math.abs(Math.sin(gm.t * 9)) * 5 : Math.sin(gm.t * 3) * 1.2;
  drawS(g, hermanasAussieHead(who, ex), x, y + bob, { ax: .5, ay: .5, flip });
  if (gm.state === 'won' && fl(gm.t * 6) % 2 === 0) drawHeart(g, x + (flip ? -26 : 26), y - 26 - (gm.t * 12 % 8), '#ff4060', 1);
}

// small dog heads (for the leash game): westie, doodle, schnauzer, black lab, aussie
const HERMANAS_PUPS = [
  { ramp: RAMP.fur, ear: 'up', face: null }, { ramp: RAMP.apricot, ear: 'flop', face: null },
  { ramp: RAMP.grey, ear: 'fold', face: RAMP.fur }, { ramp: RAMP.black, ear: 'flop', face: null }, { ramp: RAMP.caramel, ear: 'fold', face: RAMP.fur },
];
function hermanasPupHead(i, mood) {
  const happy = mood === true || mood === 'happy', sad = mood === 'sad';
  return mdl('hermanas:pup2' + i + (happy ? 'h' : sad ? 's' : ''), () => {
    const P = HERMANAS_PUPS[i % HERMANAS_PUPS.length];
    const head = SD.tufts(SD.ellipse(22, 20, 13, 12), 22, 20, 1, 14, i, 1.6), muz = SD.ellipse(22, 27, 7.5, 5.2);
    const ears = P.ear === 'up' ? SD.union(SD.grow(SD.poly([[10, 14], [11, 1], [18, 8]]), 1.2), SD.grow(SD.poly([[34, 14], [33, 1], [26, 8]]), 1.2))
      : P.ear === 'flop' ? SD.union(SD.ellipse(8, 20, 4.2, 8.5, -.3), SD.ellipse(36, 20, 4.2, 8.5, .3))
        : SD.union(SD.grow(SD.poly([[8, 14], [12, 3], [18, 10]]), 1.4), SD.grow(SD.poly([[36, 14], [32, 3], [26, 10]]), 1.4));
    const c = model(44, 38, [
      { f: ears, ramp: P.ramp.map(c => mixHex(c, '#3a3450', .2)), z: P.ear === 'flop' ? 2 : 0, th: 3 },
      { f: head, ramp: P.ramp, z: 1, th: 9, tex: clumpTex(3, .18, i + 3, 1.3) },
      { f: muz, ramp: P.face || P.ramp, z: 1.5, th: 4, amb: .45 },
      { f: SD.ellipse(22, 24, 2.8, 2), ramp: RAMP.black, z: 2, th: 2, gloss: true },
    ], { selout: false });
    const g = c.g, K = '#140c14', ec = i === 3 ? '#e8e0f0' : K;
    if (happy) { for (const ex of [14, 27]) { px(g, ex, 18, ec); px(g, ex + 1, 17, ec); px(g, ex + 2, 17, ec); px(g, ex + 3, 18, ec); } hline(g, 19, 25, 29, K); rect(g, 20, 30, 5, 3, RAMP.pink[2]); px(g, 22, 31, RAMP.pink[1]); }
    else if (sad) { for (const ex of [14, 27]) { rect(g, ex, 18, 3, 3, ec); px(g, ex, 18, '#ffffff'); hline(g, ex - 1, ex + 2, 16 + (ex < 22 ? 1 : 0), K); } px(g, 20, 30, K); hline(g, 21, 23, 29, K); px(g, 24, 30, K); vline(g, 17, 21, 24, '#8fd0ff'); }
    else { for (const ex of [14, 27]) { rect(g, ex, 16, 3, 4, ec); px(g, ex, 16, '#ffffff'); } hline(g, 20, 24, 29, K); }
    for (const cx0 of [11, 33]) { px(g, cx0, 25, '#ff9ab0'); px(g, cx0 + 1, 25, '#ff9ab0'); }
    return c;
  });
}
function hermanasTennisBall(g, x, y, rot = 0, r = 5.5) {
  disc(g, x, y, r, INK); disc(g, x, y, r - .9, '#d8ef3a'); disc(g, x - r * .22, y - r * .26, r * .4, '#f2ff8a');
  for (let a = 0; a < Math.PI; a += .25) px(g, x + Math.cos(a + rot) * r * .62, y + Math.sin(a + rot) * r * .3 - 1, '#ffffff');
}
// the sisters' songs share one sunny key; each game gets its own tune
const hermanasSong = (lead, chords, bass, drums, li = 'kalimba') => ({ spb: 4, tracks: [{ i: li, v: .6, n: lead }, { i: 'pluck', v: .38, n: chords }, { i: 'bass', v: .85, n: bass }, { i: 'd', v: .62, n: drums }] });

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
const HERMANAS_SHAPE_COL = { corazón: '#ff5d9e', pelota: '#ffd23f', estrella: '#fff27a', hueso: '#f2e2b8', pez: '#63a0ef', cucurucho: '#ffb070' };
function hermanasResample(v, n) {
  const P = v.concat([v[0]]), L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; }
  const out = []; for (let k = 0; k < n; k++) { let d = k / n * tot, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const t = L[i] ? d / L[i] : 0; out.push([lerp(P[i][0], P[i + 1][0], t), lerp(P[i][1], P[i + 1][1], t)]); }
  return out;
}
function hermanasChalkboardBg() {
  return mdl('hermanas:hBoard2', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wd = RAMP.wood;
    rect(g, 0, 0, SW, SH, Wd[2]); for (let y = 0; y < SH; y += 5) hline(g, 0, SW, y, Wd[1]);
    rect(g, 10, 6, SW - 20, SH - 16, INK); rect(g, 11, 7, SW - 22, SH - 18, '#243029');
    for (let i = 0; i < 12; i++) hermanasSmudge(g, 24 + hash2(i, 3) * 200, 20 + hash2(3, i) * 140, 18 + hash2(i, 9) * 26, 6 + hash2(9, i) * 8, i);
    ringRect(g, 6, 2, SW - 12, SH - 8, 4, Wd[3]); rect(g, 6, 2, SW - 12, 1, Wd[4]); ringRect(g, 10, 6, SW - 20, SH - 16, 1, INK);
    rect(g, 16, SH - 9, SW - 32, 5, INK); rect(g, 17, SH - 9, SW - 34, 3, Wd[3]);
    rect(g, 40, SH - 11, 12, 2, '#ffffff'); rect(g, 56, SH - 11, 9, 2, '#ffb3d1'); rect(g, 190, SH - 13, 22, 4, INK); rect(g, 191, SH - 12, 20, 2, '#3565cc');
    return c;
  });
}
defMG({
  id: 'pizarra', stage: 'hermanas', name: 'Pizarra del día', cmd: '¡DIBUJA!', how: 'Repasa con el dedo el dibujo de puntos', mech: 'draw', beats: 8,
  song: () => hermanasSong('E5 . G5 . A5 . G5 . E5 . D5 . E5 - . . C5 . E5 . G5 . E5 . D5 . C5 . D5 - . .', 'C4+E4 . . . C4+E4 . . . A3+C4 . . . A3+C4 . . . F3+A3 . . . F3+A3 . . . G3+B3 . . . G3+B3 . . .', 'C3 . . . G2 . . . A2 . . . E2 . . . F2 . . . C3 . . . G2 . . . G2 . B2 .', 'k . z . r . z z k . z . r . z . k . z . r . z z k . z . r r r .'),
  init(g) {
    const pool = [['corazón', 'pelota', 'estrella'], ['estrella', 'hueso', 'pez'], ['hueso', 'pez', 'cucurucho']][g.level - 1];
    g.name = g.pick(pool);
    const sc = [52, 48, 44][g.level - 1], cx0 = 132, cy0 = 102;
    const n = fl(({ corazón: 36, pelota: 32, estrella: 40, hueso: 44, pez: 38, cucurucho: 36 })[g.name] * sc / 52);
    g.dots = HERMANAS_SHAPES[g.name](n).map(([x, y]) => ({ x: cx0 + x * sc * 1.25, y: cy0 + y * sc, on: false, t: 0 }));
    g.need = [.84, .87, .9][g.level - 1];
    g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH); g.cov = 0; g.fill = 0;
  },
  update(g, dt) {
    g.st.update();
    for (const p of g.st.fresh) {
      hermanasChalkDot(g.layer.g, p[0], p[1], '#fbf8ee', 2.3, 7);
      if (g.state === 'play') for (const d of g.dots) if (!d.on && Math.abs(d.x - p[0]) < 8 && Math.abs(d.y - p[1]) < 8 && Math.hypot(d.x - p[0], d.y - p[1]) < 8) { d.on = true; d.t = g.t; }
    }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) { hermanasThrottleSfx(g, 'chalk', .06, { pitch: .9 + g.r(.3) }); if (fl(g.t * 60) % 3 === 0) g.fx.add({ k: 'dot', x: IN.x + g.r(-2, 2), y: IN.y + g.r(-2, 2), vx: g.r(-20, 20), vy: g.r(10, 50), g: 120, r: 1, life: .35, c: '#e8e8e0' }); }
    const on = g.dots.filter(d => d.on).length, prev = g.cov; g.cov = on / g.dots.length;
    if (fl(g.cov * 10) > fl(prev * 10)) sfx('pop', { pitch: 1 + g.cov, vol: .35 });
    if (g.state === 'play' && g.cov >= g.need) { g.win(); sfx('sparkle'); for (let i = 0; i < 18; i++) g.fx.add({ k: 'star', x: g.r(60, 200), y: g.r(46, 160), vx: g.r(-30, 30), vy: g.r(-60, -20), life: .8, r: 3, c: g.pick(['#fff27a', '#ffb3d1', '#b3d9ff']) }); }
    if (g.state === 'won') g.fill = Math.min(1, g.fill + dt * 3);
  },
  draw(g, c) {
    c.drawImage(hermanasChalkboardBg(), 0, 0);
    // title written on the board
    txt(c, 'HOY DIBUJAMOS:', 132, 13, '#e8e8e0', { align: 'c' });
    mord(c, g.name.toUpperCase(), 132, 24, { u: 1, r: 1.1, rim: 1, sy: 1, fill: ['#ffffff', '#ffd1e4', '#ff93bf'], line: '#1b2420', shadow: '#1b2420' });
    const col = HERMANAS_SHAPE_COL[g.name] || '#ffb3d1';
    // ghost of the picture: you can see what it will be
    const pts = g.dots.map(d => [d.x, d.y]);
    if (g.fill === 0) { c.globalAlpha = .13; polyPx(c, pts, col); c.globalAlpha = 1; }
    else { const wig = Math.sin(g.t * 14) * 2 * g.fill, P = g.dots.map(d => [d.x + (d.x - 132) * .03 * Math.sin(g.t * 10), d.y + wig * .5]); c.globalAlpha = .85 * g.fill; polyPx(c, P, col); c.globalAlpha = 1; }
    // the dotted guide: a marching dashed outline, bright dots; traced parts glow yellow
    if (g.state === 'play') hermanasDashes(c, pts.concat([pts[0]]), g.t * .5, '#7f968a', 3, 4);
    for (let i = 0; i < g.dots.length; i++) {
      const d = g.dots[i];
      if (d.on) { const k = clamp((g.t - d.t) * 6, 0, 1); disc(c, d.x, d.y, 2.6 - k * .6, k < 1 ? '#fff27a' : '#ffffff'); }
      else { const pulse = (fl(g.t * 8 - i * .5) % 6) === 0; disc(c, d.x, d.y, pulse ? 2 : 1.5, pulse ? '#ffffff' : '#c8d8ce'); }
    }
    // start marker on the first untraced dot
    const st0 = g.dots.find(d => !d.on);
    if (g.state === 'play' && st0 && g.cov < .15) { hermanasTarget(c, st0.x, st0.y, 5, g.t, '#fff27a'); }
    c.drawImage(g.layer, 0, 0);
    if (IN.down && g.state === 'play') { rect(c, IN.x + 2, IN.y - 10, 4, 10, INK); rect(c, IN.x + 3, IN.y - 9, 2, 8, '#ffffff'); rect(c, IN.x + 3, IN.y - 2, 2, 1, '#dcd6c4'); }
    // progress: chalk bar on the tray
    const w = rd(g.cov / g.need * 58); rect(c, 186, SH - 22, 60, 7, INK); rect(c, 187, SH - 21, 58, 5, '#3a4a42'); rect(c, 187, SH - 21, Math.min(58, w), 5, g.cov >= g.need ? '#5bd18b' : '#fff27a');
    if (g.cov > .6 && g.state === 'play') txt(c, '¡Casi!', 216, SH - 34, '#fff27a', { align: 'c', out: '#1b2420' });
    hermanasPeek(c, 'kira', 26, 170, g);
    if (g.state === 'won') hermanasStamp(c, '¡PRECIOSO!', 142, 142, g.t - g.decidedAt);
    if (g.state === 'lost') hermanasStamp(c, '¡A MEDIAS!', 142, 142, g.t - g.decidedAt, false);
  },
  hint(g) { const n = g.dots.length, P = g.dots.slice(0, Math.ceil(n * .45)).map(d => [d.x, d.y]); return { x: P[0][0], y: P[0][1], mech: 'draw', path: P }; },
  bot(g) { if (!g.plan) g.plan = [g.dots.map(d => [d.x, d.y]).concat([[g.dots[0].x, g.dots[0].y], [g.dots[1].x, g.dots[1].y]])]; return hermanasBot(g, g.plan, 5.2, .15); },
});

// ---------------------------------------------------------------- 2 REBAÑO --
// Parc de Joan Miró: a lost sheep, the pen with its open gate, Kira helping.
function hermanasSheepBig(f = 0, mood = 'normal') {
  return mdl('hermanas:sheep2' + f + mood, () => {
    const W = mood === 'wet' ? ['#4f7fa8', '#7aa8cc', '#a8cce6', '#d2e8f6', '#ecf6ff'] : RAMP.fur;
    const K = ['#140c14', '#221a28', '#342a3c', '#4a4056', '#645a70'];
    const bodyS = SD.ellipse(20, 19, 15, 11), body = SD.curls(bodyS, 1.3, 1.05, 2);
    const head = SD.ellipse(35, 17, 7, 6.5), tuft = SD.curls(SD.ellipse(34, 10, 5, 3.2), .9, 1.4, 5);
    const earB = SD.ellipse(29.5, 15, 3.5, 1.8, -.4), earF = SD.ellipse(40, 13, 3.5, 1.8, .5);
    const legs = f ? SD.union(SD.capsule(11, 26, 8, 34, 1.7, 1.4), SD.capsule(27, 26, 30, 34, 1.7, 1.4)) : SD.union(SD.capsule(11, 26, 13, 34, 1.7, 1.4), SD.capsule(27, 26, 25, 34, 1.7, 1.4));
    const legsB = f ? SD.union(SD.capsule(15, 26, 17, 34, 1.5, 1.3), SD.capsule(23, 26, 21, 34, 1.5, 1.3)) : SD.union(SD.capsule(15, 26, 13, 34, 1.5, 1.3), SD.capsule(23, 26, 25, 34, 1.5, 1.3));
    const c = model(46, 38, [
      { f: legsB, ramp: K.map(x => mixHex(x, '#000000', .2)), z: 0, th: 1.5 }, { f: legs, ramp: K, z: .2, th: 1.5 },
      { f: body, fs: bodyS, ramp: W, z: 1, th: 10, tex: clumpTex(2.8, .22, 5, 1) },
      { f: earB, ramp: K, z: 1.5, th: 1.5 }, { f: head, ramp: K, z: 2, th: 5 }, { f: earF, ramp: K, z: 2.2, th: 1.5 },
      { f: tuft, ramp: W, z: 2.5, th: 3 },
    ], { selout: false });
    const g = c.g;
    // a big friendly eye, a rosy cheek, a small smile
    if (mood === 'happy') { px(g, 36, 16, '#ffffff'); px(g, 37, 15, '#ffffff'); px(g, 38, 16, '#ffffff'); }
    else if (mood === 'scared') { rect(g, 35, 13, 4, 5, '#ffffff'); px(g, 37, 15, INK); vline(g, 32, 8, 11, '#8fd0ff'); }
    else { rect(g, 35, 14, 3, 4, '#ffffff'); rect(g, 36, 15, 2, 2, INK); px(g, 35, 14, '#ffffff'); }
    px(g, 39, 19, '#ff8fb3'); px(g, 40, 19, '#ff8fb3');
    hline(g, 37, 39, 21, '#645a70');
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
function hermanasParkBg() {
  return mdl('hermanas:hPark2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 36, ['#8fd3ff', '#b8e4ff', '#dff4ff']);
    for (let i = 0; i < 9; i++) disc(g, 10 + i * 30, 36 + (i % 2) * 3, 16, i % 2 ? '#4a8a3e' : '#5a9a48');
    rect(g, 0, 40, SW, SH - 40, '#6fb04e');
    for (let i = 0; i < 900; i++) { const x = hash2(i, 13) * SW, y = 40 + hash2(13, i) * 152; px(g, x, y, hash2(i, 2) < .5 ? '#5a9a48' : '#86c25e'); }
    for (let x = 0; x < SW; x++) { const y = 178 + Math.sin(x * .03) * 4; rect(g, x, y, 1, 16, '#e3cfaf'); px(g, x, y, '#c9b28c'); }
    hermanasDonaIOcell(g, 30, 78);
    return c;
  });
}
const HERMANAS_PEN = { x: 184, y: 62, w: 62, h: 96, gate0: 90, gate1: 134 };
function hermanasPenFence(g, front, t) {
  const Wd = RAMP.wood, { x, y, w, h, gate0, gate1 } = HERMANAS_PEN;
  const post = (px0, py0) => { rect(g, px0 - 2, py0 - 13, 5, 15, INK); rect(g, px0 - 1, py0 - 12, 3, 13, Wd[3]); px(g, px0 - 1, py0 - 12, Wd[4]); };
  const rail = (x0, y0, x1, y1) => { for (const dy of [4, 9]) { thickLine(g, x0, y0 - dy, x1, y1 - dy, 1.3, INK); thickLine(g, x0, y0 - dy, x1, y1 - dy, .6, Wd[4]); } };
  if (!front) {
    // straw floor inside the pen
    rect(g, x + 2, y + 2, w - 3, h - 3, '#c9b060'); for (let i = 0; i < 90; i++) px(g, x + 3 + hash2(i, 7) * (w - 6), y + 3 + hash2(7, i) * (h - 6), hash2(i, 2) < .5 ? '#e0cc80' : '#a8923e');
    rail(x, y, x + w, y); for (let i = 0; i <= w; i += 15.5) post(x + i, y); rail(x + w, y, x + w, y + h); rail(x, y, x, gate0); post(x, gate0);
  } else {
    rail(x, y + h, x + w, y + h); for (let i = 0; i <= w; i += 15.5) post(x + i, y + h); rail(x, gate1, x, y + h); post(x, gate1); post(x + w, y + h);
    // the gate swung open towards the field, and a green way-in
    for (const [gy, dir] of [[gate0, -1], [gate1, 1]]) { thickLine(g, x, gy - 6, x - 16, gy - 6 + dir * 8, 1.4, INK); thickLine(g, x, gy - 6, x - 16, gy - 6 + dir * 8, .7, Wd[4]); }
  }
}
const HERMANAS_PEN_SEGS = [[[HERMANAS_PEN.x, HERMANAS_PEN.y], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y]], [[HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y + HERMANAS_PEN.h]], [[HERMANAS_PEN.x, HERMANAS_PEN.y + HERMANAS_PEN.h], [HERMANAS_PEN.x + HERMANAS_PEN.w, HERMANAS_PEN.y + HERMANAS_PEN.h]], [[HERMANAS_PEN.x, HERMANAS_PEN.y], [HERMANAS_PEN.x, HERMANAS_PEN.gate0]], [[HERMANAS_PEN.x, HERMANAS_PEN.gate1], [HERMANAS_PEN.x, HERMANAS_PEN.y + HERMANAS_PEN.h]]];
defMG({
  id: 'rebano', stage: 'hermanas', name: 'Ovejas en el parque', cmd: '¡GUÍA!', how: 'Dibuja un camino desde la oveja hasta dentro del corral', mech: 'draw', beats: 8,
  song: () => hermanasSong('G4 . G4 A4 B4 . G4 . C5 . B4 A4 G4 . E4 . F#4 . F#4 G4 A4 . F#4 . D4 . E4 F#4 G4 - . .', '. . D5 . . . D5 . . . E5 . . . E5 . . . D5 . . . D5 . . . B4 . G4 . . .', 'G2 . . G2 D3 . . . C3 . . C3 G2 . . . D3 . . D3 A2 . . . G2 . D3 . G2 . . .', 'k . h . s . h k k . h . s . h . k . h . s . h k k . h . s s h .', 'pluck'),
  init(g) {
    g.pond = g.level >= 2;
    const n = g.level >= 3 ? 2 : 1;
    g.sheep = [];
    for (let i = 0; i < n; i++) g.sheep.push({ x: 40 + i * 8, y: n === 1 ? 128 : 100 + i * 54, path: [], fl: false, inPen: false, wet: false, f: 0, bump: 0 });
    g.pondE = { x: 118, y: 124, rx: 26, ry: 16 };
    g.st = hermanasStrokes(); g.speed = 96 * g.tempo; g.dogX = 10; g.dogY = 138;
  },
  update(g, dt) {
    g.st.update();
    // a stroke that starts near a sheep becomes that sheep's route
    if (IN.tap && g.state === 'play') {
      let best = null, bd = 30; for (const s of g.sheep) { const d = dist(IN.x, IN.y, s.x, s.y); if (!s.inPen && d < bd) { bd = d; best = s; } }
      g.owner = best; if (best) { best.path = []; sfx('hermanasBleat', { pitch: 1 + g.r(.2), vol: .4 }); }
      else { g.fx.add({ k: 'txt', s: '¡Empieza en la oveja!', x: IN.x, y: IN.y - 10, life: .7, c: '#ffffff' }); }
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
      if (s.x > HERMANAS_PEN.x + 6 && s.x < HERMANAS_PEN.x + HERMANAS_PEN.w - 6 && s.y > HERMANAS_PEN.y + 6 && s.y < HERMANAS_PEN.y + HERMANAS_PEN.h - 4) { s.inPen = true; s.path.length = 0; sfx('hermanasBleat', { pitch: 1.2 }); sfx('coin'); g.fx.burst(s.x, s.y - 8, 12, { k: 'star', c: ['#fff27a', '#ffffff'] }); }
    }
    if (g.state === 'play' && g.sheep.every(s => s.inPen)) { g.win(); sfx('bark', { n: 2, pitch: 1.2 }); }
    // Kira herds behind the first loose sheep
    const tgt = g.sheep.find(s => !s.inPen) || g.sheep[0];
    const hx = tgt.x - (tgt.fl ? -28 : 28), hy = tgt.y + 8;
    g.dogX = lerp(g.dogX, hx, Math.min(1, dt * 4)); g.dogY = lerp(g.dogY, hy, Math.min(1, dt * 4)); g.dogFl = tgt.x < g.dogX;
  },
  blocked(x0, y0, x1, y1) { for (const [a, b] of HERMANAS_PEN_SEGS) if (segCross([x0, y0], [x1, y1], a, b)) return true; return false; },
  draw(g, c) {
    c.drawImage(hermanasParkBg(), 0, 0);
    if (g.pond) {
      const P = g.pondE; ellipsePx(c, P.x, P.y + 1, P.rx + 1, P.ry + 1, '#3f7a38'); ellipsePx(c, P.x, P.y, P.rx, P.ry, '#2f7cc4'); ellipsePx(c, P.x - 4, P.y - 3, P.rx - 8, P.ry - 7, '#5aaee6');
      for (let i = 0; i < 4; i++) { const x = P.x - 16 + i * 10, y = P.y - 2 + Math.sin(g.t * 3 + i) * 2; hline(c, x, x + 3, y, '#dff4ff'); }
      // "no swimming" sign
      rect(c, P.x + 28, P.y - 22, 2, 18, INK); panel(c, P.x + 20, P.y - 34, 18, 13, '#ffffff', { r: 2, line: INK }); ringPx(c, P.x + 29, P.y - 28, 4.5, '#e23b4e'); linePx(c, P.x + 26, P.y - 31, P.x + 32, P.y - 25, '#e23b4e'); px(c, P.x + 29, P.y - 28, '#3565cc');
    }
    hermanasPenFence(c, false, g.t);
    // the way in: glowing ground + a big arrow into the gate
    const gm = (HERMANAS_PEN.gate0 + HERMANAS_PEN.gate1) / 2;
    if (g.state === 'play') { const k = (g.t * 2) % 1; c.globalAlpha = .35 + .25 * (1 - k); ellipsePx(c, HERMANAS_PEN.x + 4, gm - 4, 14, 18, '#8ef0b4'); c.globalAlpha = 1; hermanasArrow(c, HERMANAS_PEN.x + 12 + Math.sin(g.t * 6) * 3, gm - 6, 0, '#5bd18b'); }
    // the routes: dashed white with a ring at the end
    for (const s of g.sheep) { if (s.path.length > 1) hermanasDashes(c, [[s.x, s.y]].concat(s.path), g.t, '#ffffff', 5, 3, 2); if (s.path.length) { const e = s.path[s.path.length - 1]; ringPx(c, e[0], e[1], 3.5, '#ffffff'); } }
    if (g.st.cur && !g.owner) for (let i = 0; i < g.st.cur.length; i += 2) px(c, g.st.cur[i][0], g.st.cur[i][1], 'rgba(255,255,255,.5)');
    const ents = g.sheep.map(s => ({ y: s.y, draw: () => {
      shadowOval(c, s.x, s.y + 16, 13, 2.8, .4);
      const mood = s.wet ? 'wet' : s.inPen ? 'happy' : s.bump > 0 ? 'scared' : 'normal';
      drawS(c, hermanasSheepBig(fl(s.f) % 2, mood), s.x + Math.sin(s.bump * 20) * 2, s.y, { flip: s.fl });
      if (s.inPen) drawHeart(c, s.x, s.y - 22 - (g.t * 10 % 6), '#ff4060', 1);
    } }));
    ents.push({ y: g.dogY, draw: () => { shadowOval(c, g.dogX, g.dogY + 10, 12, 2.5, .4); drawS(c, hermanasAussieSide('kira', g.state === 'won' ? 'bow' : 'run', g.state === 'lost' ? 'sad' : 'focus', .5), g.dogX, g.dogY + 12, { ax: .5, ay: 1, flip: g.dogFl }); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
    hermanasPenFence(c, true, g.t);
    txt(c, 'CORRAL', HERMANAS_PEN.x + HERMANAS_PEN.w / 2, HERMANAS_PEN.y - 24, '#ffffff', { align: 'c', out: INK, bold: true });
    // point at the sheep that still needs a route
    const ld = g.sheep.find(s => !s.inPen && !s.path.length && !s.wet);
    if (g.state === 'play' && ld) { hermanasTarget(c, ld.x, ld.y, 16, g.t, '#ffffff'); if (g.t < 2 * g.spb) hermanasTag(c, ld.x, ld.y - 22, 'DESDE AQUÍ', '#fff27a'); }
    if (g.state === 'lost' && g.sheep.some(s => s.wet)) hermanasStamp(c, '¡PLOF!', clamp(g.pondE.x, 60, 196), clamp(g.pondE.y - 46, 12, 140), g.t - g.decidedAt, false);
    if (g.state === 'won') hermanasStamp(c, '¡A SALVO!', 112, 16, g.t - g.decidedAt);
  },
  hint(g) { const s = g.sheep[0], gm = (HERMANAS_PEN.gate0 + HERMANAS_PEN.gate1) / 2, P = [[s.x, s.y]]; if (g.pond) P.push([s.x + 40, s.y < 120 ? 80 : 164], [150, s.y < 120 ? 82 : 162]); P.push([HERMANAS_PEN.x - 14, gm - 6], [HERMANAS_PEN.x + 26, gm - 6]); return { x: s.x, y: s.y, mech: 'draw', path: P }; },
  bot(g) {
    if (!g.plan) {
      const gm = (HERMANAS_PEN.gate0 + HERMANAS_PEN.gate1) / 2 - 4;
      g.plan = g.sheep.map(s => {
        const pts = [[s.x, s.y]];
        if (g.pond) pts.push([s.x + 40, s.y < 120 ? 80 : 164], [150, s.y < 120 ? 82 : 162]);
        pts.push([HERMANAS_PEN.x - 16, gm], [HERMANAS_PEN.x + 8, gm], [HERMANAS_PEN.x + HERMANAS_PEN.w / 2, gm]);
        return pts;
      });
    }
    return hermanasBot(g, g.plan, 6, .1);
  },
});

// ---------------------------------------------------------------- 3 CORREAS -
// colour + symbol, so it reads for everyone
const HERMANAS_LEASH_COLS = [['#e23b4e', '#ff8d9b', '#8c1d30', '♥'], ['#3565cc', '#8fc0ff', '#1a2a6b', '★'], ['#e2b21b', '#fff27a', '#9c700c', '●'], ['#2a9a6a', '#8ef0b4', '#155d3f', '♦']];
function hermanasLeashRackBg() {
  return mdl('hermanas:hRack2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, SH);
    // the dogs wait on the green bench (left); the leash rack (right)
    rect(g, 0, 0, 74, SH, RAMP.green[2]); rect(g, 73, 0, 2, SH, RAMP.green[0]); for (let y = 12; y < SH; y += 24) hline(g, 0, 72, y, RAMP.green[1]);
    rect(g, SW - 46, 4, 40, SH - 8, INK); rect(g, SW - 45, 5, 38, SH - 10, RAMP.wood[3]); for (let y = 8; y < SH - 6; y += 6) hline(g, SW - 44, SW - 8, y, RAMP.wood[2]);
    panel(g, SW - 44, 6, 36, 11, RAMP.green[2], { r: 2 }); tiny(g, 'CORREAS', SW - 26, 9, '#ffffff', { align: 'c' });
    return c;
  });
}
function hermanasLeashCoil(g, x, y, ci) {
  const C3 = HERMANAS_LEASH_COLS[ci];
  // the hook, a big coiled leash (thick rope loops), the clip, a round tag with the symbol
  rect(g, x - 3, y - 4, 7, 5, INK); rect(g, x - 2, y - 3, 5, 3, RAMP.steel[3]);
  for (let i = 0; i < 3; i++) {
    const r = 11 - i * 1.5, yy = y + 12 + i * 2;
    ringPx(g, x, yy, r + 1.6, INK); ringPx(g, x, yy, r + .8, C3[2]); ringPx(g, x, yy, r, C3[0]); ringPx(g, x, yy, r - .8, C3[0]); ringPx(g, x, yy, r - 1.6, INK);
  }
  for (let a = 3.5; a < 5.2; a += .12) px(g, x + Math.cos(a) * 10, y + 12 + Math.sin(a) * 10, C3[1]);
  rect(g, x - 3, y + 24, 7, 8, INK); rect(g, x - 2, y + 25, 5, 6, RAMP.steel[2]); px(g, x - 1, y + 25, RAMP.steel[4]);
  disc(g, x - 17, y + 14, 7, INK); disc(g, x - 17, y + 14, 6, C3[0]); disc(g, x - 18, y + 12, 2, C3[1]); txt(g, C3[3], x - 17, y + 10, '#ffffff', { align: 'c' });
  linePx(g, x - 12, y + 10, x - 9, y + 8, INK);
}
function hermanasRopeLine(g, x0, y0, x1, y1, ci, sag = 14) {
  const C3 = HERMANAS_LEASH_COLS[ci], n = Math.max(24, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.2)), mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
  const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, cc = t * t; pts.push([a * x0 + b * mx + cc * x1, a * y0 + b * my + cc * y1]); }
  for (const [x, y] of pts) disc(g, x, y, 3, INK);
  for (const [x, y] of pts) disc(g, x, y, 2.1, C3[0]);
  for (let i = 0; i < pts.length; i += 3) px(g, pts[i][0], pts[i][1] - 1, C3[1]);
  for (let i = 5; i < pts.length; i += 9) px(g, pts[i][0], pts[i][1], C3[2]);
}
function hermanasBandanaCol(g, x, y, ci, w = 22) {
  const C3 = HERMANAS_LEASH_COLS[ci], h = w * .55;
  polyPx(g, [[x - w / 2 - 1, y - 1], [x + w / 2 + 1, y - 1], [x, y + h + 1]], INK);
  polyPx(g, [[x - w / 2, y], [x + w / 2, y], [x, y + h]], C3[0]); hline(g, x - w / 2 + 1, x + w / 2 - 1, y, C3[1]);
  txt(g, C3[3], x, y + 1, '#ffffff', { align: 'c' });
}
defMG({
  id: 'correas', stage: 'hermanas', name: 'Cada uno su correa', cmd: '¡UNE!', how: 'Une cada perro con la correa de su color', mech: 'draw', beats: 8,
  song: () => hermanasSong('A4 C5 E5 . A4 C5 E5 . G4 B4 D5 . G4 B4 D5 . F4 A4 C5 . F4 A4 C5 . E4 G#4 B4 . E4 G#4 B4 .', 'A5 . . . . . E5 . D5 . . . . . B4 . C5 . . . . . A4 . B4 . . . G#4 . . .', 'A2 . A2 . E2 . E2 . G2 . G2 . D2 . D2 . F2 . F2 . C3 . C3 . E2 . E2 . B2 . E2 .', 'k . h . s . h . k k h . s . h . k . h . s . h . k k h . s s s .', 'mari'),
  init(g) {
    const n = g.level + 1;
    const cols = shuffle([0, 1, 2, 3]).slice(0, n), order = shuffle(cols.slice());
    if (n > 1 && order.every((c2, i) => c2 === cols[i])) order.push(order.shift());
    const sp = (SH - 16) / (n + 1);
    const breeds = shuffle([0, 1, 2, 3, 4]);
    g.dogs = cols.map((ci, i) => ({ ci, x: n >= 3 ? 28 + (i % 2) * 16 : 36, y: rd(8 + sp * (i + 1)) - 6, pup: breeds[i], ok: false, t: -1 }));
    g.hooks = order.map((ci, i) => ({ ci, x: SW - 22, y: rd(8 + sp * (i + 1)) - 18, used: false }));
    g.links = []; g.st = hermanasStrokes(); g.bad = null;
  },
  anchorD(d) { return [d.x + 22, d.y + 20]; },
  anchorH(h) { return [h.x, h.y + 30]; },
  // the closest free dog / leash to a point (generous: anywhere on the head or the coil)
  nearest(p, list, ok, cx0, cy0, rx, ry) { let best = null, bd = 1e9; for (const o of list) { if (!ok(o)) continue; const dx = (p[0] - cx0(o)) / rx, dy = (p[1] - cy0(o)) / ry, d = dx * dx + dy * dy; if (d < 1 && d < bd) { bd = d; best = o; } } return best; },
  nearD(g, p) { return this.nearest(p, g.dogs, d => !d.ok, d => d.x + 6, d => d.y + 6, 36, 26); },
  nearH(g, p) { return this.nearest(p, g.hooks, h => !h.used, h => h.x - 4, h => h.y + 14, 30, 26); },
  update(g) {
    g.st.update();
    if (IN.tap) { g.from = this.nearD(g, [IN.x, IN.y]) || this.nearH(g, [IN.x, IN.y]); if (g.from) sfx('pop', { pitch: 1.4, vol: .4 }); }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .08, { pitch: 1.3 });
    const s = g.st.done;
    if (s && g.state === 'play' && s.length > 4) {
      const a = s[0], b = s[s.length - 1];
      let d = this.nearD(g, a), h = this.nearH(g, b); if (!d || !h) { d = this.nearD(g, b); h = this.nearH(g, a); }
      if (d && h) {
        if (d.ci === h.ci) { d.ok = true; d.t = g.t; h.used = true; g.links.push({ d, h }); sfx('coin'); sfx('bark', { pitch: 1.3 + g.links.length * .1, vol: .7 }); HITSTOP = 2; g.fx.burst(...this.anchorD(d), 12, { k: 'star', c: [HERMANAS_LEASH_COLS[d.ci][1], '#ffffff'] }); if (g.dogs.every(x => x.ok)) g.win(); }
        else { g.bad = { a, b, t: g.t, d }; g.lose(); g.shake(3, .2); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(hermanasLeashRackBg(), 0, 0);
    for (const h of g.hooks) { if (!h.used) hermanasLeashCoil(c, h.x, h.y, h.ci); else { rect(c, h.x - 3, h.y - 4, 7, 5, INK); rect(c, h.x - 2, h.y - 3, 5, 3, RAMP.steel[3]); } }
    for (const l of g.links) { const [x0, y0] = this.anchorD(l.d), [x1, y1] = this.anchorH(l.h); hermanasRopeLine(c, x0, y0, x1, y1, l.d.ci, 10 + Math.sin(g.t * 4) * 2); }
    for (const d of g.dogs) {
      const bounce = d.ok ? Math.abs(Math.sin((g.t - d.t) * 9)) * 3 : Math.sin(g.t * 3 + d.y) * .8;
      const mood = d.ok ? 'happy' : g.bad && g.bad.d === d ? 'sad' : 'normal';
      drawS(c, hermanasPupHead(d.pup, mood), d.x, d.y - bounce, {});
      hermanasBandanaCol(c, d.x, d.y + 14 - bounce, d.ci);
      if (!d.ok && g.state === 'play') { const k = (g.t * 1.6 + d.y * .01) % 1; ringPx(c, ...this.anchorD(d), 3 + k * 4, HERMANAS_LEASH_COLS[d.ci][1]); }
    }
    // the line being drawn: a leash in the colour you picked up
    if (g.st.cur) {
      const P = g.st.cur, col = g.from && g.state === 'play' ? HERMANAS_LEASH_COLS[g.from.ci] : null;
      for (let i = 0; i < P.length; i++) disc(c, P[i][0], P[i][1], col ? 2.6 : 1.8, INK);
      for (let i = 0; i < P.length; i++) disc(c, P[i][0], P[i][1], col ? 1.7 : 1, col ? col[0] : '#ffffff');
    }
    if (g.bad) { const k = g.t - g.bad.t; if (fl(k * 12) % 2 === 0) thickLine(c, g.bad.a[0], g.bad.a[1], g.bad.b[0], g.bad.b[1], 1.5, '#ff4060'); shout(c, '¡NO ES SU COLOR!', 140, 40, k); }
    if (g.state === 'won') hermanasStamp(c, '¡A PASEAR!', 140, 22, g.t - g.decidedAt);
  },
  hint(g) { const d = g.dogs[0], h = g.hooks.find(h => h.ci === d.ci), [x0, y0] = this.anchorD(d), [x1, y1] = this.anchorH(h); return { x: x0, y: y0, mech: 'draw', path: [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 8], [x1, y1]] }; },
  bot(g) {
    if (!g.plan) g.plan = g.dogs.map(d => { const h = g.hooks.find(h => h.ci === d.ci); const [x0, y0] = this.anchorD(d), [x1, y1] = this.anchorH(h); return [[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 6], [x1, y1]]; });
    return hermanasBot(g, g.plan, 9, .1);
  },
});

// ---------------------------------------------------------------- 4 RAMPA ---
function hermanasTideBg() {
  return mdl('hermanas:hTide2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 60, ['#5ab4f0', '#8fd3ff', '#c8e8fc']);
    bandsV(g, 0, 60, SW, 26, ['#23609e', '#2f7cc4', '#5aaee6']);
    hermanasVelaHotel(g, 222, 61);
    bandsV(g, 0, 86, SW, 106, ['#ecca8e', '#f2d59a', '#f6dea8']);
    for (let i = 0; i < 500; i++) px(g, hash2(i, 51) * SW, 86 + hash2(51, i) * 106, hash2(i, 6) < .5 ? '#e3c283' : '#fff0c8');
    ellipsePx(g, 96, 178, 58, 13, '#8a8f98'); ellipsePx(g, 96, 177, 55, 11, '#2f7cc4'); ellipsePx(g, 90, 175, 40, 6, '#5aaee6');
    for (const [x, y] of [[48, 172], [140, 170], [60, 186], [128, 188]]) { disc(g, x, y, 5, INK); disc(g, x, y, 4, '#9896a4'); px(g, x - 1, y - 2, '#cac8d3'); }
    rect(g, 4, 60, 52, 6, INK); rect(g, 5, 61, 50, 4, RAMP.wood[3]); rect(g, 5, 61, 50, 1, RAMP.wood[4]);
    for (const x of [10, 46]) { rect(g, x - 2, 66, 4, 110, INK); rect(g, x - 1, 66, 2, 110, RAMP.wood[2]); }
    for (let y = 76; y < 170; y += 14) linePx(g, 10, y, 46, y + 10, RAMP.wood[1]);
    rect(g, 2, 44, 3, 16, INK); polyPx(g, [[5, 44], [18, 48], [5, 52]], '#e23b4e');
    return c;
  });
}
defMG({
  id: 'rampa', stage: 'hermanas', name: 'Pelota a la boca', cmd: '¡RAMPA!', how: 'Dibuja una rampa: la pelota tiene que caer en la boca de Nala', mech: 'draw', beats: 8,
  song: () => hermanasSong('D5 . F#5 . A5 . F#5 . G5 . B5 . A5 - . . D5 . F#5 . A5 . D6 . C#6 . A5 . E5 - . .', 'D4+F#4 . . D4+F#4 . . . . G3+B3 . . G3+B3 . . . . D4+F#4 . . D4+F#4 . . . . A3+C#4 . . A3+C#4 . . . .', 'D2 . D3 . A2 . D3 . G2 . G3 . D3 . B2 . D2 . D3 . A2 . F#2 . A2 . A3 . E3 . C#3 .', 'k . h h s . h . k k h . s . h h k . h h s . h . k k h . s s s s'),
  init(g) {
    g.ball = { x: 30, y: 54, vx: 0, vy: 0, rot: 0, live: false, done: false };
    g.dogX = [196, 206, 204][g.level - 1]; g.dogY = 174; g.dogV = g.level >= 3 ? 18 * g.tempo : 0;
    g.segs = [[[4, 60], [56, 60]]];
    g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH); g.release = 1.25; g.caught = false;
  },
  mouth(g) { return [g.dogX - 31, g.dogY - 39]; },
  update(g, dt) {
    g.st.update();
    for (const p of g.st.fresh) { const c = g.layer.g; disc(c, p[0], p[1], 3, INK); }
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
          if (d < 6 && d > 0) {
            const nx = ex / d, ny = ey / d; b.x += nx * (6 - d); b.y += ny * (6 - d);
            const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.25 * vn * nx; b.vy -= 1.25 * vn * ny; if (vn < -60) sfx('tap', { pitch: 1.4, vol: .25 }); }
            b.vx *= .998; b.vy *= .998;
          }
        }
      }
      b.rot += b.vx * dt * .2;
      const [mx, my] = this.mouth(g);
      if (dist(b.x, b.y, mx, my) < 18 && g.state === 'play') { b.done = true; g.caught = true; g.win(); sfx('gulp'); sfx('bark', { n: 2, pitch: 1.3 }); HITSTOP = 3; g.fx.burst(mx, my, 16, { k: 'star', c: ['#fff27a', '#ffffff', '#d8ef3a'] }); }
      if ((b.y > 168 && b.x > 40 && b.x < 150) && g.state === 'play') { b.done = true; g.lose(); sfx('splash'); g.fx.burst(b.x, 172, 14, { k: 'drop', c: ['#9bd6f7', '#dff4ff'], sp0: 40, sp1: 130, g: 300 }); }
      if ((b.y > 200 || b.x > 270 || b.x < -20) && g.state === 'play') { b.done = true; g.lose(); }
    }
  },
  draw(g, c) {
    c.drawImage(hermanasTideBg(), 0, 0);
    const [mx, my] = this.mouth(g), b = g.ball;
    // before the release: where the ball would fall (into the pool!) and where it must go
    if (!b.live && !b.done && g.state === 'play') {
      const fall = [[30, 54]]; for (let i = 0; i <= 16; i++) { const t = i / 16 * .7; fall.push([62 + 55 * t, 54 + 260 * t * t]); }
      hermanasDashes(c, fall.filter(p => p[1] < 170), g.t, '#ff4060', 3, 3, 2);
      if (fl(g.t * 4) % 2 === 0) txt(c, '¡AL AGUA NO!', 100, 146, '#ffffff', { align: 'c', out: '#c0283c', bold: true });
    }
    // drawn ramps: a wooden plank with a light top edge
    c.drawImage(g.layer, 0, 0);
    for (const s of g.st.list) for (let i = 1; i < s.length; i++) thickLine(c, s[i - 1][0], s[i - 1][1], s[i][0], s[i][1], 1.6, RAMP.wood[3]);
    for (const s of g.st.list) for (let i = 2; i < s.length; i += 2) px(c, s[i][0], s[i][1] - 2, RAMP.wood[4]);
    // Nala waiting with her mouth open, a big target on it
    const caught = g.caught, mood = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'wow';
    shadowOval(c, g.dogX - 4, g.dogY + 1, 24, 3, .4);
    drawS(c, hermanasAussieSide('nala', caught ? 'jump' : 'stand', mood, .9), g.dogX, g.dogY - (caught ? Math.abs(Math.sin(g.t * 8)) * 8 : 0), { ax: .5, ay: 1, flip: true });
    if (g.state === 'play' && !b.done) { hermanasTarget(c, mx, my, 9, g.t, '#fff27a'); if (g.t < 2.2 * g.spb) hermanasTag(c, mx, my - 16, 'BOCA', '#fff27a'); }
    const left = Math.max(0, g.release - g.b), wob = !b.live && !b.done && left < .5 ? Math.sin(g.t * 40) : 0;
    if (!b.done || g.caught) hermanasTennisBall(c, g.caught ? mx : b.x + wob, g.caught ? my : b.y, b.rot, 6.5);
    // countdown on the platform: 3, 2, 1… ¡YA!
    if (!b.live && !b.done) { const n = Math.ceil(left * 2); if (n > 0) txt(c, String(n), 30, 34 - (left * 2 % 1) * 4, '#ffffff', { align: 'c', out: INK, bold: true }); }
    else if (b.live && g.b < g.release + .5) txt(c, '¡YA!', 34, 32, '#fff27a', { align: 'c', out: INK, bold: true });
    if (g.state === 'lost') hermanasStamp(c, '¡PLOF!', 96, 118, g.t - g.decidedAt, false);
    if (g.state === 'won') hermanasStamp(c, '¡ÑAM!', clamp(mx - 30, 60, 196), clamp(my - 52, 12, 130), g.t - g.decidedAt);
  },
  hint(g) { const [mx, my] = this.mouth(g); return { x: 58, y: 72, mech: 'draw', path: [[58, 72], [100, 94], [mx - 14, my - 3]] }; },
  bot(g) {
    if (!g.plan) { const [mx, my] = this.mouth(g); g.plan = [[[58, 72], [100, 94], [mx - 14, my - 3]]]; }
    return hermanasBot(g, g.plan, 9, .05);
  },
});

// ---------------------------------------------------------------- 5 LAZO ----
// Plaça de Catalunya: one of the pigeons is a masked thief with the frisbee
function hermanasPigeon2(f = 0, item = null, thief = false, mood = 'normal') {
  return mdl('hermanas:pigeon3' + f + (item || '') + thief + mood, () => {
    const B = ['#2c3040', '#4a5068', '#6f7894', '#9aa3bf', '#c8cfe4'], hy = 11 + (f ? 2 : 0);
    const body = SD.ellipse(17, 19, 12, 9, -.1), head = SD.circle(29, hy, 6), tail = SD.poly([[6, 17], [0, 14], [1, 23], [8, 23]]);
    const neck = SD.ellipse(24, 15, 5.5, 6.5), wing = SD.ellipse(14, 19, 8.5, 5.5, -.2);
    const c = model(48, 34, [
      { f: tail, ramp: B.map(x => mixHex(x, '#000000', .2)), z: 0, th: 2 }, { f: body, ramp: B, z: 1, th: 9 },
      { f: neck, ramp: ['#1f3a3a', '#2f6a60', '#4f9a80', '#8e6ab8', '#b98ee0'], z: 1.5, th: 4 },
      { f: wing, ramp: B.map(x => mixHex(x, '#000000', .12)), z: 1.7, th: 4 },
      { f: head, ramp: B, z: 2, th: 5 },
    ], { selout: false });
    const g = c.g;
    for (const [x, y] of [[11, 17], [14, 20], [17, 18]]) hline(g, x, x + 2, y, B[0]); // wing bars
    // a big round cartoon eye (or a bandit mask for the thief)
    if (thief) { rect(g, 22, hy - 4, 13, 5, INK); rect(g, 28, hy - 4, 5, 5, '#ffffff'); if (mood === 'dizzy') ringPx(g, 30, hy - 2, 1.4, INK); else rect(g, 30, hy - 3, 2, 2, INK); linePx(g, 22, hy - 2, 18, hy - 4, INK); linePx(g, 22, hy, 18, hy + 1, INK); }
    else if (mood === 'dizzy') { rect(g, 28, hy - 4, 5, 5, '#ffffff'); ringPx(g, 30, hy - 2, 1.4, INK); }
    else { rect(g, 28, hy - 4, 5, 5, INK); rect(g, 29, hy - 3, 3, 3, '#ffffff'); rect(g, 30, hy - 2, 2, 2, INK); px(g, 29, hy - 3, '#ffffff'); }
    polyPx(g, [[34, hy], [39, hy + 1.5], [34, hy + 3]], INK); polyPx(g, [[34, hy + .5], [38, hy + 1.5], [34, hy + 2.5]], '#e8c0a0');
    hline(g, 26, 27, hy + 3, '#ff9ab0');
    for (const x of [14, 20]) { vline(g, x, 27, 31, '#e23b4e'); hline(g, x - 1, x + 2, 32, '#e23b4e'); }
    if (item === 'galleta') { disc(g, 41, hy + 3, 4, INK); disc(g, 41, hy + 3, 3.2, '#d58c4c'); px(g, 40, hy + 2, '#5b3a1d'); px(g, 42, hy + 4, '#5b3a1d'); }
    if (item === 'moneda') { disc(g, 41, hy + 3, 4, INK); disc(g, 41, hy + 3, 3.2, '#e7c35f'); px(g, 40, hy + 2, '#fff0a6'); vline(g, 41, hy + 1, hy + 5, '#b8902c'); }
    return c;
  });
}
function hermanasPlazaBg() {
  return mdl('hermanas:hPlaza2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#d8d3c8');
    for (let y = 0; y < SH; y += 12) for (let x = ((y / 12) % 2) * 12; x < SW; x += 24) rect(g, x, y, 12, 12, '#cec8bb');
    const cx0 = SW / 2, cy0 = 104;
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 40 : 70; polyPx(g, [[cx0, cy0], [cx0 + Math.cos(a - .18) * 18, cy0 + Math.sin(a - .18) * 12], [cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r * .62], [cx0 + Math.cos(a + .18) * 18, cy0 + Math.sin(a + .18) * 12]], i % 2 ? '#bab5aa' : '#e8e4da'); }
    ellipsePx(g, cx0, cy0, 12, 8, '#9a958a'); ellipsePx(g, cx0, cy0, 9, 6, '#e8e4da'); ellipsePx(g, cx0, cy0, 4, 3, '#bab5aa');
    rect(g, 0, 0, SW, 22, '#5aaee6'); for (let x = 0; x < SW; x += 6) px(g, x + (x * 7) % 5, 8 + (x % 3) * 3, '#dff4ff'); rect(g, 0, 22, SW, 5, INK); rect(g, 0, 22, SW, 4, '#b9b3a6'); hline(g, 0, SW, 22, '#e8e4da');
    for (const x of [30, 196]) { rect(g, x, 178, 34, 5, INK); rect(g, x + 1, 179, 32, 3, RAMP.wood[3]); rect(g, x + 3, 183, 2, 6, INK); rect(g, x + 29, 183, 2, 6, INK); }
    for (const x of [10, 246]) { rect(g, x - 1, 30, 3, 60, INK); vline(g, x, 30, 90, '#44424f'); rect(g, x - 4, 26, 9, 6, INK); rect(g, x - 3, 27, 7, 4, '#fff7ae'); rect(g, x - 3, 88, 7, 3, INK); }
    for (let i = 0; i < 60; i++) px(g, 20 + hash2(i, 61) * 216, 40 + hash2(61, i) * 130, hash2(i, 4) < .5 ? '#c8a878' : '#e8d8b8');
    panel(g, 150, 176, 70, 12, RAMP.green[2], { r: 3 }); tiny(g, 'PL.CATALUNYA', 185, 180, '#ffffff', { align: 'c' });
    return c;
  });
}
defMG({
  id: 'lazo', stage: 'hermanas', name: 'Paloma ladrona', cmd: '¡RODEA!', how: 'Haz un círculo con el dedo alrededor de la paloma del antifaz', mech: 'draw', beats: 8,
  song: () => hermanasSong('B4 . D5 . E5 . D5 B4 A4 . B4 . G4 - . . B4 . D5 . E5 . G5 E5 D5 . B4 . A4 - . .', '. . . . G5 . . . . . . . E5 . . . . . . . B5 . . . . . . . F#5 . . .', 'E2 . . E2 . . B2 . C3 . . C3 . . G2 . E2 . . E2 . . B2 . D3 . . D3 . . A2 .', 'k . h . s . h h k . h . s . h . k . h . s . h h k k h . s . s s', 'pluck'),
  init(g) {
    const n = [5, 7, 9][g.level - 1];
    g.birds = [];
    const cells = shuffle(Array.from({ length: 12 }, (_, i) => i)), inner = cells.findIndex(cc => cc % 4 === 1 || cc % 4 === 2);
    [cells[0], cells[inner]] = [cells[inner], cells[0]]; // the thief starts away from the edges
    for (let i = 0; i < n; i++) { const cc = cells[i], cx0 = 40 + (cc % 4) * 58, cy0 = 58 + fl(cc / 4) * 46; g.birds.push({ x: cx0 + g.r(-10, 10), y: cy0 + g.r(-8, 8), tx: 0, ty: 0, wait: g.r(.1, .6), f: 0, fl: g.r() < .5, item: null, thief: false, fly: 0, vx: 0, vy: 0 }); }
    g.birds[0].thief = true; g.birds[0].item = 'frisbee';
    if (g.level >= 3) { g.birds[1].item = 'galleta'; g.birds[2].item = 'moneda'; }
    g.speed = [24, 34, 42][g.level - 1] * g.tempo; g.st = hermanasStrokes(); g.lasso = null; g.miss = null;
  },
  update(g, dt) {
    g.st.update();
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .07, { pitch: 1.1 });
    for (const b of g.birds) {
      if (b.fly > 0) { b.fly -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 60 * dt; b.f += dt * 20; if (b.fly <= 0) { b.x = clamp(b.x, 20, 236); b.y = clamp(b.y, 44, 170); } continue; }
      if (b.caught) continue;
      b.wait -= dt;
      if (b.wait <= 0) { const m = b.thief ? 40 : 22; b.tx = clamp(b.x + g.r(-50, 50), m, SW - m); b.ty = clamp(b.y + g.r(-30, 30), b.thief ? 58 : 46, b.thief ? 158 : 168); b.wait = g.r(.5, 1.2); }
      const d = dist(b.x, b.y, b.tx, b.ty), sp = g.speed * (b.thief ? 1.2 : 1);
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
    const bs = g.birds.slice().sort((a, b) => a.y - b.y), th = g.birds[0];
    // the thief glows until you catch her
    if (g.state === 'play') { c.globalAlpha = .35; disc(c, th.x + (th.fl ? -4 : 4), th.y + 3, 23 + Math.sin(g.t * 8) * 2, '#fff27a'); c.globalAlpha = 1; }
    for (const b of bs) {
      if (!b.fly) shadowOval(c, b.x, b.y + 16, 11, 2.2, .35);
      const img = hermanasPigeon2(b.fly > 0 ? 1 : fl(b.f) % 2, b.item === 'frisbee' ? null : b.item, b.thief, b.caught ? 'dizzy' : 'normal');
      drawS(c, img, b.x, b.y, { flip: b.fl, rot: b.fly > 0 ? Math.sin(b.f) * .2 : 0 });
      if (b.thief && !(g.lasso && g.t - g.lasso.t > .5)) drawS(c, hermanasFrisbeeSpr('#ff6b3d', 18), b.x + (b.fl ? -19 : 19), b.y + 2, { rot: b.fl ? .3 : -.3 });
    }
    if (g.st.cur) for (let i = 1; i < g.st.cur.length; i++) thickLine(c, g.st.cur[i - 1][0], g.st.cur[i - 1][1], g.st.cur[i][0], g.st.cur[i][1], 1.2, '#ffffff');
    if (g.state === 'play' && g.t < 2.2 * g.spb) hermanasTag(c, th.x, th.y - 20, '¡LADRONA!', '#ff8d9b', INK);
    if (g.lasso) {
      const k = clamp((g.t - g.lasso.t) / .35, 0, 1), b = g.lasso.b, P = g.lasso.poly.map(([x, y]) => [lerp(x, b.x, k * .7), lerp(y, b.y, k * .7)]);
      for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; thickLine(c, p[0], p[1], q[0], q[1], 1.8, '#c0662c'); }
      if (g.t - g.lasso.t > .5) { const fk = clamp((g.t - g.lasso.t - .5) / .4, 0, 1); drawS(c, hermanasFrisbeeSpr('#ff6b3d', 18), lerp(b.x + 8, b.x + 34, fk), lerp(b.y, b.y + 14, fk) - Math.sin(fk * Math.PI) * 22, { rot: fk * 6 }); }
      hermanasStamp(c, '¡TE PILLÉ!', clamp(b.x, 86, 170), clamp(b.y - 56, 12, 130), g.t - g.lasso.t);
    }
    if (g.miss) { const k = g.t - g.miss.t; if (fl(k * 10) % 2 === 0) for (let i = 0; i < g.miss.poly.length; i += 2) px(c, g.miss.poly[i][0], g.miss.poly[i][1], '#ff4060'); shout(c, '¡ESA NO!', SW / 2, 40, k); }
  },
  hint(g) { const th = g.birds[0]; const P = hermanasCirclePts(th.x, th.y + 2, 26, 20, -Math.PI / 2, 1.1); return { x: P[0][0], y: P[0][1], mech: 'draw', path: P }; },
  bot(g) {
    const th = g.birds[0];
    // like a person, it draws faster (and a bit wider) when the tempo climbs, and aims where she'll be when the loop closes
    const hk = clamp(Math.pow(g.tempo || 1, .6), 1, 1.6), spd = 12 * hk, R = 30 + (hk - 1) * 10;
    if (!g.plan || (g._bot && g._bot.done && g.state === 'play')) {
      const T = TAU * R * 1.15 / spd / 60 + .05, d = dist(th.x, th.y, th.tx, th.ty), sp = g.speed * 1.2 * T, k = d > 1 ? Math.min(1, sp / d) : 0;
      const cx0 = th.x + (th.tx - th.x) * k, cy0 = th.y + (th.ty - th.y) * k;
      g.plan = [hermanasCirclePts(cx0, cy0 + 2, R, 30, -Math.PI / 2, 1.15)]; g._bot = null;
    }
    return hermanasBot(g, g.plan, spd, .1);
  },
});

// ---------------------------------------------------------------- 6 CASTILLO (new)
// Barceloneta: Nala's sandcastle, and a wave on its way. Draw a sand wall.
function hermanasCastleSpr(w, wrecked) {
  return mdl('hermanas:castle2' + w + (wrecked ? 'x' : ''), () => {
    const H = 66, c = mkCanvas(w + 8, H), g = c.g, S = ['#6a4424', '#a8743a', '#d39a52', '#eab874', '#ffd9a0'], B = H - 3;
    const put = (pts, col) => { for (const [dx, dy] of [[1, 1], [-1, 0], [0, -1], [1, 0], [0, 1]]) polyPx(g, pts.map(([x, y]) => [x + dx, y + dy]), INK); polyPx(g, pts, col); };
    if (wrecked) { put([[3, B], [w * .22, B - 8], [w * .5, B - 13], [w * .78, B - 7], [w + 4, B]], S[2]); for (let i = 0; i < w; i += 3) px(g, 5 + i, B - 3 - (i % 2), S[1]); for (let i = 2; i < w; i += 6) px(g, 6 + i, B - 8 + (i % 3), S[3]); return c; }
    const tower = (x, tw, th) => {
      const top = B - th;
      for (let i = 0; i + 3 <= tw; i += 5) { rect(g, x + i - 1, top - 5, 5, 6, INK); rect(g, x + i, top - 4, 3, 4, S[3]); }
      put([[x, B], [x, top], [x + tw, top], [x + tw, B]], S[2]);
      for (let y = top + 6; y < B; y += 7) hline(g, x + 1, x + tw - 1, y, S[1]);
      vline(g, x + 1, top + 1, B - 1, S[4]); vline(g, x + tw - 1, top + 1, B - 1, S[1]);
      rect(g, rd(x + tw / 2 - 1), top + 5, 3, 5, INK); px(g, rd(x + tw / 2), top + 5, S[0]);
    };
    put([[4, B], [w + 4, B], [w + 4, B - 16], [4, B - 16]], S[2]); for (let i = 6; i < w + 2; i += 5) { rect(g, i - 1, B - 21, 5, 6, INK); rect(g, i, B - 20, 3, 4, S[3]); }
    hline(g, 5, w + 3, B - 8, S[1]);
    tower(3, 14, 30); tower(w - 9, 14, 30); tower(rd(w / 2 - 6), 18, 42);
    // the door (an arch) and the flag with a paw on the tallest tower
    const dx = rd(w / 2 + 3); rect(g, dx - 5, B - 12, 11, 12, INK); rect(g, dx - 4, B - 11, 9, 11, '#5b3a1d'); rect(g, dx - 4, B - 11, 1, 1, INK); rect(g, dx + 4, B - 11, 1, 1, INK); vline(g, dx, B - 10, B - 1, '#3e2512');
    const fx = rd(w / 2 + 3), fy = B - 42 - 5; vline(g, fx, fy - 13, fy, INK);
    polyPx(g, [[fx + 1, fy - 14], [fx + 13, fy - 10], [fx + 1, fy - 5]], INK); polyPx(g, [[fx + 1, fy - 13], [fx + 11, fy - 10], [fx + 1, fy - 6]], '#e23b4e');
    px(g, fx + 4, fy - 10, '#ffffff'); px(g, fx + 6, fy - 11, '#ffffff'); px(g, fx + 6, fy - 9, '#ffffff'); px(g, fx + 5, fy - 10, '#ffffff');
    for (let i = 0; i < 26; i++) px(g, 5 + hash2(i, 77) * (w - 2), B - 14 + hash2(77, i) * 13, hash2(i, 1) < .5 ? S[1] : S[3]);
    return c;
  });
}
// a pink scallop shell lying on the sand
function hermanasShell(g, x, y, col = '#ffb3c8') {
  polyPx(g, [[x - 5, y + 1], [x, y - 5], [x + 5, y + 1], [x + 2, y + 3], [x - 2, y + 3]], INK);
  polyPx(g, [[x - 4, y + 1], [x, y - 4], [x + 4, y + 1], [x + 2, y + 2], [x - 2, y + 2]], col);
  for (const k of [-2, 0, 2]) linePx(g, x + k * .5, y - 3, x + k, y + 1, '#e07a9a'); px(g, x - 1, y - 2, '#ffffff');
}
function hermanasShoreBg() {
  return mdl('hermanas:shore', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, SH, ['#f6dea8', '#f2d59a', '#ecca8e', '#e6c283']);
    for (let i = 0; i < 700; i++) px(g, hash2(i, 91) * SW, hash2(91, i) * SH, hash2(i, 3) < .5 ? '#e3c283' : '#fff0c8');
    for (const [x, y, col] of [[18, 150, '#ffb3c8'], [238, 138, '#fff0c8'], [226, 186, '#ffb3c8'], [14, 96, '#fff0c8']]) hermanasShell(g, x, y, col);
    return c;
  });
}
defMG({
  id: 'castillo', stage: 'hermanas', name: 'El castillo de Nala', cmd: '¡PROTEGE!', how: 'Dibuja un muro de arena entre la ola y el castillo', mech: 'draw', beats: 8,
  song: () => hermanasSong('E5 . E5 G5 A5 . G5 E5 D5 . D5 E5 G5 . E5 . C5 . C5 E5 G5 . A5 G5 E5 . D5 . E5 - . .', 'A3+C4+E4 . . . . . . . G3+B3+D4 . . . . . . . F3+A3+C4 . . . . . . . G3+B3+D4 . . . . . . .', 'A2 . A2 . A2 . A2 . G2 . G2 . G2 . G2 . F2 . F2 . F2 . F2 . G2 . G2 . E2 . E2 .', 'k . h s . h k h k . h s . h k h k . h s . h k h k . s s s s s s', 'p25'),
  init(g) {
    const w = [52, 70, 44][g.level - 1];
    g.castles = g.level >= 3 ? [{ x: 34, w }, { x: 176, w }] : [{ x: rd(128 - w / 2), w }];
    for (const k of g.castles) { k.base = 170; k.top = 170 - 44; k.wrecked = false; }
    g.impact = [5.4, 5.0, 4.8][g.level - 1]; // beat when the wave reaches the castles
    g.waveY = 34; g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH);
    g.cols = new Float32Array(SW).fill(999); // per column: the lowest wall point (999 = no wall)
    g.hit = false; g.saved = false; g.flood = 0; g.recede = 0; g.ebb = 0;
  },
  wallAt(g, x) { let y = 999; for (let d = -1; d <= 1; d++) { const v = g.cols[clamp(rd(x) + d, 0, SW - 1)]; if (v < 900 && (y > 900 || v > y)) y = v; } return y; },
  frontAt(g, x) { // where the water ends in this column
    let y = g.waveY + Math.sin(x * .09 + g.t * 5) * 3;
    const wy = this.wallAt(g, x);
    if (wy < 900) y = Math.min(y, wy - 5);
    else if (g.hit && !g.saved) { const surge = lerp(y, 182, E.outQ(g.flood)); y = lerp(surge, 58 + Math.sin(x * .09 + g.t * 5) * 3, E.ioQ(g.ebb)); } // crashes over the castle, then ebbs away
    return y;
  },
  update(g, dt) {
    g.st.update();
    // sand only builds on dry sand (not in the water) and above the castles
    for (const p of g.st.fresh) {
      if (g.hit || p[1] > 122 || p[1] < this.frontAt(g, p[0]) + 5) continue;
      // wet sand: darker than the beach so the wall reads at a glance
      const L = g.layer.g; disc(L, p[0], p[1] + 2, 5, INK); disc(L, p[0], p[1] + 1.5, 4.4, '#8a5a2c'); disc(L, p[0], p[1], 4, '#c98f4c'); disc(L, p[0] - .5, p[1] - 1.5, 2.2, '#e8b070');
      for (let dx = -4; dx <= 4; dx++) { const X = clamp(rd(p[0] + dx), 0, SW - 1); g.cols[X] = g.cols[X] > 900 ? p[1] : Math.max(g.cols[X], p[1]); }
      if (hash2(fl(p[0]), fl(p[1])) < .2) g.fx.add({ k: 'dot', x: p[0] + g.r(-3, 3), y: p[1] - 2, vx: g.r(-30, 30), vy: g.r(-60, -20), g: 200, r: 1, life: .4, c: '#c9a86a' });
    }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5 && !g.hit) hermanasThrottleSfx(g, 'rub', .07, { pitch: .6 });
    // the wave creeps in, faster and faster, and crashes at the impact beat
    const k = clamp(g.b / g.impact, 0, 1);
    g.waveY = lerp(34, 124, E.inQ(k));
    if (g.saved) { g.recede = Math.min(1, g.recede + dt * 1.4); g.waveY = lerp(124, 44, E.outQ(g.recede)); }
    if (!g.hit && g.b >= g.impact) {
      g.hit = true;
      // a castle is safe when (almost) every column in front of it has a wall
      let okAll = true;
      for (const cs of g.castles) { let covered = 0, tot = 0; for (let x = cs.x - 4; x <= cs.x + cs.w + 4; x += 2) { tot++; if (this.wallAt(g, x) < 900) covered++; } cs.ok = covered / tot >= .82; if (!cs.ok) okAll = false; }
      if (g.state === 'play') {
        if (okAll) {
          g.saved = true; g.win(); sfx('splash', { pitch: .8 }); sfx('bark', { n: 2, pitch: 1.2, delay: .25 }); g.shake(3, .25); HITSTOP = 3;
          for (const cs of g.castles) for (let i = 0; i < 16; i++) { const x = g.r(cs.x - 4, cs.x + cs.w + 4), wy = this.wallAt(g, x); g.fx.add({ k: 'drop', x, y: (wy < 900 ? wy : 118) - 6, vx: g.r(-50, 50), vy: g.r(-200, -80), g: 380, life: .8, r: 2, c: g.pick(['#dff4ff', '#9bd6f7', '#ffffff']) }); }
        } else { for (const cs of g.castles) if (!cs.ok) cs.wrecked = true; g.lose(); sfx('splash'); sfx('whine', { delay: .3 }); g.shake(4, .3); }
      }
    }
    if (g.hit && !g.saved) { g.flood = Math.min(1, g.flood + dt * 1.8); if (g.flood >= 1) g.ebb = Math.min(1, g.ebb + dt * 1.1); }
  },
  draw(g, c) {
    c.drawImage(hermanasShoreBg(), 0, 0);
    // the sea: deep blue, a light band, a white foamy crest
    for (let x = 0; x < SW; x++) {
      const y = rd(this.frontAt(g, x));
      c.fillStyle = '#2f7cc4'; c.fillRect(x, 0, 1, y - 7); c.fillStyle = '#5aaee6'; c.fillRect(x, y - 7, 1, 4);
      c.fillStyle = INK; c.fillRect(x, y + 1, 1, 1); c.fillStyle = '#ffffff'; c.fillRect(x, y - 3, 1, 4);
      if (hash2(x, fl(g.t * 8)) < .12) px(c, x, y - 5, '#dff4ff');
    }
    for (let i = 0; i < 10; i++) { const x = (i * 29 + g.t * 20) % SW, y = 10 + (i % 3) * 7; if (y < g.waveY - 10) hline(c, x, x + 5, y, '#5aaee6'); }
    if (!g.hit && g.state === 'play' && fl(g.t * 5) % 2 === 0) txt(c, '¡OLA!', 128, Math.max(4, g.waveY - 24), '#ffffff', { align: 'c', out: INK, bold: true });
    c.drawImage(g.layer, 0, 0);
    // the guide: dashes across every castle's width; each part disappears once it has a wall in front
    if (!g.hit && g.state === 'play') for (const cs of g.castles) {
      const y = cs.top - 18, ph = fl(g.t * 16);
      for (let x = cs.x - 6; x <= cs.x + cs.w + 6; x++) if (this.wallAt(g, x) > 900 && (x + ph) % 7 < 4) rect(c, x, y - 1, 1, 2, '#ffffff');
      if (g.t < 2.4 * g.spb && g.cols.every(v => v > 900)) hermanasTag(c, cs.x + cs.w / 2, y - 5, 'MURO AQUÍ', '#fff27a');
    }
    // after the wave: a band of wet, darker sand where the water reached
    if (g.hit && !g.saved && g.ebb > 0) { c.globalAlpha = .38 * Math.min(1, g.ebb * 3); for (let x = 0; x < SW; x += 2) { const y = rd(this.frontAt(g, x)); if (this.wallAt(g, x) > 900 && y < 182) rect(c, x, y + 2, 2, 182 - y, '#b98a52'); } c.globalAlpha = 1; }
    for (const cs of g.castles) drawS(c, hermanasCastleSpr(cs.w, cs.wrecked && g.flood > .45), cs.x - 4, cs.base + 3, { ax: 0, ay: 1 });
    // the surge rolls over the castles before it ebbs
    if (g.hit && !g.saved && g.ebb < 1) { c.globalAlpha = .8 * (1 - g.ebb); for (let x = 0; x < SW; x++) { const y = rd(this.frontAt(g, x)); if (y > 118) { c.fillStyle = '#3d8ad0'; c.fillRect(x, 118, 1, y - 121); c.fillStyle = '#ffffff'; c.fillRect(x, y - 3, 1, 3); } } c.globalAlpha = 1; }
    // Nala guarding her castle
    const nx = g.castles.length > 1 ? 128 : clamp(g.castles[0].x + g.castles[0].w + 26, 30, 226), mood = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'wow';
    shadowOval(c, nx, 186, 16, 2.5, .35);
    drawS(c, hermanasAussieSide('nala', g.state === 'won' ? 'jump' : 'stand', mood, .55), nx, 186 - (g.state === 'won' ? Math.abs(Math.sin(g.t * 8)) * 6 : 0), { ax: .5, ay: 1, flip: true });
    if (g.state === 'won') hermanasStamp(c, '¡SALVADO!', 128, 44, g.t - g.decidedAt);
    if (g.state === 'lost') hermanasStamp(c, '¡NOOOO!', 128, 44, g.t - g.decidedAt, false);
  },
  hint(g) { const a = g.castles[0], b = g.castles[g.castles.length - 1], y = a.top - 18; return { x: a.x - 6, y, mech: 'draw', path: [[a.x - 6, y], [b.x + b.w + 6, y]] }; },
  bot(g) { if (!g.plan) { const a = g.castles[0], b = g.castles[g.castles.length - 1], y = a.top - 16; g.plan = [[[a.x - 10, y], [b.x + b.w + 10, y]]]; } return hermanasBot(g, g.plan, 6, .15); },
});

// ---------------------------------------------------------------- 7 PUNTOS (new)
// wet sand at the shore: numbered shells to join in order; a picture appears
const HERMANAS_DOTS = {
  casa: { col: '#ff9f4f', pts: [[-.8, .9], [-.8, -.1], [0, -.9], [.8, -.1], [.8, .9]], close: true, name: '¡UNA CASETA!' },
  corazón: { col: '#ff5d9e', pts: [[0, .9], [-.9, 0], [-.6, -.7], [0, -.3], [.6, -.7], [.9, 0]], close: true, name: '¡UN CORAZÓN!' },
  pez: { col: '#63a0ef', pts: [[-.9, -.5], [-.5, 0], [-.9, .5], [-.3, .5], [.4, .6], [.95, 0], [.4, -.6], [-.3, -.5]], close: true, name: '¡UN PEZ!' },
  westie: { col: '#ffffff', pts: [[-.8, .8], [-.9, -.2], [-.6, -.95], [-.25, -.35], [.25, -.35], [.6, -.95], [.9, -.2], [.8, .8]], close: true, name: '¡KEIKO!' },
  hueso: { col: '#f2e2b8', pts: [[-.95, -.45], [-.6, -.3], [.6, -.3], [.95, -.45], [.8, 0], [.95, .45], [.6, .3], [-.6, .3], [-.95, .45], [-.8, 0]], close: true, name: '¡UN HUESO!' },
  estrella: { col: '#fff27a', pts: [[0, -.95], [.25, -.3], [.95, -.3], [.4, .12], [.6, .9], [0, .45], [-.6, .9], [-.4, .12], [-.95, -.3], [-.25, -.3]], close: true, name: '¡UNA ESTRELLA!' },
};
// the finished picture comes alive (normalised coordinates → screen via P)
function hermanasDotsFace(c, pic, P, t) {
  const eye = (x, y) => { const [X, Y] = P(x, y); rect(c, X - 1, Y - 2, 3, 4, INK); px(c, X, Y - 1, '#ffffff'); };
  const cheek = (x, y) => { const [X, Y] = P(x, y); hline(c, X - 1, X + 1, Y, '#ff8fb3'); };
  const smile = (x, y, w = 3) => { const [X, Y] = P(x, y); px(c, X - w, Y - 1, INK); hline(c, X - w + 1, X + w - 1, Y, INK); px(c, X + w, Y - 1, INK); };
  const blink = fl(t * 1.3) % 4 === 3;
  if (pic === 'casa') { // a dog house: arched door and a bone over it
    const [dx, dy] = P(0, .45), [, by] = P(0, .9); disc(c, dx, dy, 11, INK); rect(c, dx - 11, dy, 23, by - dy, INK); disc(c, dx, dy, 10, '#5b3a1d'); rect(c, dx - 10, dy, 21, by - dy - 1, '#5b3a1d');
    const [bx, bb] = P(0, -.12); rect(c, bx - 7, bb - 1, 15, 3, INK); for (const e of [-7, 7]) { disc(c, bx + e, bb - 1, 2, INK); disc(c, bx + e, bb + 2, 2, INK); } rect(c, bx - 6, bb, 13, 1, '#ffffff'); for (const e of [-7, 7]) { px(c, bx + e, bb - 1, '#ffffff'); px(c, bx + e, bb + 2, '#ffffff'); }
  }
  if (pic === 'corazón' || pic === 'estrella') { if (blink) { const [a] = P(-.18, .05); hline(c, a - 1, a + 1, P(0, .05)[1], INK); const [b] = P(.18, .05); hline(c, b - 1, b + 1, P(0, .05)[1], INK); } else { eye(-.18, .05); eye(.18, .05); } cheek(-.36, .2); cheek(.36, .2); smile(0, .24, 2); }
  if (pic === 'pez') { eye(.55, -.12); smile(.72, .12, 2); const [gx, gy] = P(.25, 0); for (let a = -1; a <= 1; a += .25) px(c, gx + Math.cos(a) * 6, gy + Math.sin(a) * 10, '#3565cc'); }
  if (pic === 'westie') { eye(-.35, .12); eye(.35, .12); const [nx, ny] = P(0, .42); rect(c, nx - 3, ny - 2, 7, 4, INK); px(c, nx - 1, ny - 1, '#6a6478'); cheek(-.55, .4); cheek(.55, .4); smile(0, .6, 2); }
  if (pic === 'hueso') { const [a, b] = P(-.3, -.12), [e] = P(.3, -.12); hline(c, a, e, b, '#ffffff'); }
}
defMG({
  id: 'puntos', stage: 'hermanas', name: 'Une los puntos', cmd: '¡CONECTA!', how: 'Pasa por las conchas en orden: 1, 2, 3…', mech: 'draw', beats: 8,
  song: () => hermanasSong('C5 D5 E5 . G5 . E5 . F5 E5 D5 . C5 . . . A4 B4 C5 . E5 . D5 . C5 B4 A4 . G4 - . .', 'C4+E4 . . . . . . . F3+A3 . . . . . . . A3+C4 . . . . . . . G3+B3 . . . . . . .', 'C3 . G2 . C3 . G2 . F2 . C3 . F2 . C3 . A2 . E2 . A2 . E2 . G2 . D3 . G2 . B2 .', 'k . z . r . z z k . z . r . z . k . z . r . z z k . z . r r r .'),
  init(g) {
    const pool = [['casa', 'corazón'], ['pez', 'westie'], ['hueso', 'estrella']][g.level - 1];
    g.pic = g.pick(pool); const P = HERMANAS_DOTS[g.pic];
    const sc = [60, 62, 66][g.level - 1], cx0 = 140, cy0 = 106;
    g.P = (x, y) => [cx0 + x * sc * 1.2, cy0 + y * sc * .95];
    g.dots = P.pts.map(([x, y], i) => { const [X, Y] = g.P(x, y); return { x: X, y: Y, n: i + 1, on: false, t: 0 }; });
    g.next = 0; g.st = hermanasStrokes(); g.layer = mkCanvas(SW, SH); g.fill = 0;
  },
  update(g, dt) {
    g.st.update();
    for (const p of g.st.fresh) {
      const L = g.layer.g; disc(L, p[0], p[1] + 1, 1.8, '#a08050'); disc(L, p[0], p[1], 1.4, '#c9a86a');
      if (g.state !== 'play') continue;
      const d = g.dots[g.next];
      if (d && dist(p[0], p[1], d.x, d.y) < 10) { d.on = true; d.t = g.t; g.next++; sfx('ding', { pitch: .8 + g.next * .08 }); g.fx.burst(d.x, d.y, 8, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 30, sp1: 80 }); if (g.next >= g.dots.length) { g.win(); sfx('sparkle'); sfx('bark', { n: 2, pitch: 1.3, delay: .15 }); } }
    }
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'rub', .08, { pitch: 1.2 });
    if (g.state === 'won') g.fill = Math.min(1, g.fill + dt * 2.5);
  },
  draw(g, c) {
    c.drawImage(hermanasShoreBg(), 0, 0);
    // a strip of sea at the top; the wet sand is darker
    bandsV(c, 0, 0, SW, 26, ['#2f7cc4', '#5aaee6']); for (let x = 0; x < SW; x++) { const y = 26 + Math.sin(x * .08 + g.t * 3) * 2; c.fillStyle = '#ffffff'; c.fillRect(x, rd(y), 1, 2); }
    c.globalAlpha = .18; rect(c, 0, 28, SW, 100, '#8a6a44'); c.globalAlpha = 1;
    const P = HERMANAS_DOTS[g.pic], pts = g.dots.map(d => [d.x, d.y]);
    if (g.fill > 0) { c.globalAlpha = .9 * g.fill; polyPx(c, pts, P.col); c.globalAlpha = 1; if (g.fill >= 1) hermanasDotsFace(c, g.pic, g.P, g.t); }
    c.drawImage(g.layer, 0, 0);
    // the joined part as a neat groove in the sand
    for (let i = 1; i < g.next; i++) { thickLine(c, g.dots[i - 1].x, g.dots[i - 1].y + 1, g.dots[i].x, g.dots[i].y + 1, 1.6, '#8a6a44'); thickLine(c, g.dots[i - 1].x, g.dots[i - 1].y, g.dots[i].x, g.dots[i].y, 1, '#fff0c8'); }
    if (g.state === 'won') { const a = g.dots[g.dots.length - 1], b = g.dots[0]; thickLine(c, a.x, a.y, b.x, b.y, 1, '#fff0c8'); }
    // dotted hint from the last reached shell to the next one
    const nd = g.dots[g.next];
    if (g.state === 'play' && nd) { if (g.next > 0) hermanasDashes(c, [[g.dots[g.next - 1].x, g.dots[g.next - 1].y], [nd.x, nd.y]], g.t, 'rgba(255,255,255,.8)', 3, 3); hermanasTarget(c, nd.x, nd.y, 7, g.t, '#fff27a'); }
    // numbered shells
    for (const d of g.dots) {
      const on = d.on, pulse = !on && d === nd;
      disc(c, d.x, d.y, 5.5, INK); disc(c, d.x, d.y, 4.6, on ? '#fff27a' : '#fffaf0'); for (let a = -1; a <= 1; a++) linePx(c, d.x, d.y + 3, d.x + a * 3, d.y - 2, on ? '#e2b21b' : '#e3c9a8');
      panel(c, rd(d.x - 6), rd(d.y - 17), 12, 10, pulse ? '#fff27a' : '#ffffff', { r: 3 }); txt(c, String(d.n), d.x, d.y - 15, INK, { align: 'c' });
    }
    // Kira supervising from the corner
    shadowOval(c, 34, 186, 16, 2.5, .35);
    drawS(c, hermanasAussieSide('kira', g.state === 'won' ? 'jump' : 'stand', g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'normal', .55), 34, 186, { ax: .5, ay: 1 });
    if (g.state === 'won') hermanasStamp(c, P.name, 142, 152, g.t - g.decidedAt, true, 190);
    if (g.state === 'lost') hermanasStamp(c, '¡SIN TIEMPO!', 142, 152, g.t - g.decidedAt, false);
  },
  hint(g) { const P = g.dots.slice(0, 3).map(d => [d.x, d.y]); return { x: P[0][0], y: P[0][1], mech: 'draw', path: P }; },
  bot(g) { if (!g.plan) g.plan = [g.dots.map(d => [d.x, d.y])]; return hermanasBot(g, g.plan, 7, .1); },
});

// ---------------------------------------------------------------- 8 EIXAMPLE (new)
// Top-down Eixample: octagonal blocks. Draw Kira's route from Westie BLVRD to the park.
function hermanasEixGrid(level) {
  const nx = level === 1 ? 4 : 5, ny = level === 1 ? 3 : 4, x0 = 28, y0 = 30, x1 = 228, y1 = 170;
  return { nx, ny, dx: (x1 - x0) / (nx - 1), dy: (y1 - y0) / (ny - 1), x0, y0, street: 7 };
}
function hermanasEixNode(G, i, j) { return [G.x0 + i * G.dx, G.y0 + j * G.dy]; }
function hermanasEixBlocks(G) {
  const out = [];
  for (let j = -1; j < G.ny; j++) for (let i = -1; i < G.nx; i++) { // the city goes on past the screen
    const [ax, ay] = hermanasEixNode(G, i, j), s = G.street, cham = 7;
    const L = ax + s, R = ax + G.dx - s, T = ay + s, B = ay + G.dy - s;
    out.push({ i, j, poly: [[L + cham, T], [R - cham, T], [R, T + cham], [R, B - cham], [R - cham, B], [L + cham, B], [L, B - cham], [L, T + cham]], cx: (L + R) / 2, cy: (T + B) / 2, w: R - L, h: B - T });
  }
  return out;
}
function hermanasEixBg(level) {
  return mdl('hermanas:eix' + level, () => {
    const G = hermanasEixGrid(level), c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#7d828c');
    // street centre lines
    for (let j = 0; j < G.ny; j++) { const [, y] = hermanasEixNode(G, 0, j); for (let x = 0; x < SW; x += 8) hline(g, x, x + 3, y, '#a9aeb8'); }
    for (let i = 0; i < G.nx; i++) { const [x] = hermanasEixNode(G, i, 0); for (let y = 0; y < SH; y += 8) vline(g, x, y, y + 3, '#a9aeb8'); }
    for (const b of hermanasEixBlocks(G)) {
      polyPx(g, b.poly.map(([x, y]) => [x + 1, y + 1]), INK); polyPx(g, b.poly, '#e3cfaf');
      // inner courtyard (the green "interior de manzana") and rooftops
      const inset = b.poly.map(([x, y]) => [lerp(x, b.cx, .45), lerp(y, b.cy, .45)]); polyPx(g, inset, '#86b85e');
      for (let q = 0; q < 10; q++) { const px0 = b.cx + (hash2(q, b.i * 7 + b.j + 20) - .5) * b.w * .8, py0 = b.cy + (hash2(b.i * 7 + b.j + 20, q) - .5) * b.h * .8; if (!hermanasInPoly(px0, py0, inset)) px(g, px0, py0, '#c9b28c'); }
      // a couple of trees in the courtyard
      for (let q = 0; q < 2; q++) { const tx = b.cx + (q ? 5 : -4), ty = b.cy + (q ? 3 : -3); disc(g, tx, ty + 1, 3.2, '#3f6a2c'); disc(g, tx, ty, 3, '#5a9a48'); px(g, tx - 1, ty - 1, '#86c25e'); }
    }
    return c;
  });
}
// Westie BLVRD seen from above: cream front, striped green awning, a paw on the sign
function hermanasMiniShop(g, x, y) {
  rect(g, x - 14, y - 12, 28, 24, INK); rect(g, x - 13, y - 11, 26, 22, '#fff8e6');
  for (let i = 0; i < 26; i += 4) { rect(g, x - 13 + i, y - 11, 2, 8, RAMP.green[2]); rect(g, x - 11 + i, y - 11, 2, 8, '#ffffff'); }
  for (let i = 0; i < 26; i += 4) disc(g, x - 12 + i, y - 3, 1.5, RAMP.green[2]);
  rect(g, x - 11, y + 1, 10, 8, INK); rect(g, x - 10, y + 2, 8, 6, '#8fd3ff'); px(g, x - 9, y + 3, '#ffffff');
  rect(g, x + 3, y + 1, 8, 10, INK); rect(g, x + 4, y + 2, 6, 9, RAMP.green[1]); px(g, x + 8, y + 6, '#ffd23f');
  disc(g, x, y - 16, 5, INK); disc(g, x, y - 16, 4, RAMP.green[2]); px(g, x, y - 15, '#ffffff'); px(g, x - 2, y - 17, '#ffffff'); px(g, x + 2, y - 17, '#ffffff'); px(g, x - 1, y - 19, '#ffffff'); px(g, x + 1, y - 19, '#ffffff');
}
defMG({
  id: 'eixample', stage: 'hermanas', name: 'Paseo por el Eixample', cmd: '¡LLEGA!', how: 'Dibuja el camino por las calles hasta el parque, sin pisar las manzanas', mech: 'draw', beats: 8,
  song: () => hermanasSong('G4 . B4 . D5 . B4 . C5 . E5 . D5 . B4 . A4 . C5 . E5 . C5 . B4 . D5 . G5 - . .', 'G3+B3 . . . . . . . C4+E4 . . . . . . . A3+C4 . . . . . . . D4+F#4 . . . . . . .', 'G2 . D3 . G2 . D3 . C3 . G2 . C3 . G2 . A2 . E3 . A2 . E3 . D3 . A2 . D3 . F#2 .', 'k h . h s . h h k h . h s . h . k h . h s . h h k h . h s s s s', 'mari'),
  init(g) {
    const G = g.G = hermanasEixGrid(g.level); g.blocks = hermanasEixBlocks(G);
    g.start = [0, G.ny - 1]; g.goal = [G.nx - 1, 0];
    // roadworks on some street segments, never cutting every route
    g.closed = [];
    const want = [0, 2, 4][g.level - 1];
    const edges = []; for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { if (i < G.nx - 1) edges.push([i, j, i + 1, j]); if (j < G.ny - 1) edges.push([i, j, i, j + 1]); }
    const tries = shuffle(edges.slice());
    for (const e of tries) { if (g.closed.length >= want) break; if ((e[0] === g.start[0] && e[1] === g.start[1]) || (e[2] === g.goal[0] && e[3] === g.goal[1])) continue; g.closed.push(e); if (!this.route(g)) g.closed.pop(); }
    g.st = hermanasStrokes(); g.bad = null; g.walk = null; g.okPath = null;
  },
  isClosed(g, a, b) { return g.closed.some(e => (e[0] === a[0] && e[1] === a[1] && e[2] === b[0] && e[3] === b[1]) || (e[0] === b[0] && e[1] === b[1] && e[2] === a[0] && e[3] === a[1])); },
  route(g) { // BFS over the street grid
    const G = g.G, key = (i, j) => i + ',' + j, prev = { [key(...g.start)]: null }, q = [g.start];
    while (q.length) { const [i, j] = q.shift(); if (i === g.goal[0] && j === g.goal[1]) break; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= G.nx || nj >= G.ny) continue; const k2 = key(ni, nj); if (k2 in prev || this.isClosed(g, [i, j], [ni, nj])) continue; prev[k2] = [i, j]; q.push([ni, nj]); } }
    if (!(key(...g.goal) in prev)) return null;
    const out = []; let cur = g.goal; while (cur) { out.unshift(hermanasEixNode(G, cur[0], cur[1])); cur = prev[key(...cur)]; }
    return out;
  },
  onStreet(g, x, y) {
    for (const b of g.blocks) if (hermanasInPoly(x, y, b.poly)) return false;
    const G = g.G;
    for (const e of g.closed) { const [ax, ay] = hermanasEixNode(G, e[0], e[1]), [bx, by] = hermanasEixNode(G, e[2], e[3]); if (segDist(x, y, lerp(ax, bx, .35), lerp(ay, by, .35), lerp(ax, bx, .65), lerp(ay, by, .65)) < G.street + 1) return false; }
    return true;
  },
  update(g, dt) {
    g.st.update();
    const G = g.G, [sx, sy] = hermanasEixNode(G, ...g.start), [gx, gy] = hermanasEixNode(G, ...g.goal);
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .08, { pitch: 1.2 });
    if (g.st.cur && g.state === 'play') {
      const cur = g.st.cur;
      if (dist(cur[0][0], cur[0][1], sx, sy) > 20) { if (!g.warned) { g.warned = true; g.fx.add({ k: 'txt', s: '¡Empieza en la tienda!', x: sx + 40, y: sy - 16, life: .8, c: '#ffffff' }); } }
      else for (const p of g.st.fresh) if (!this.onStreet(g, p[0], p[1])) { g.bad = { t: g.t, x: p[0], y: p[1], path: cur.slice() }; g.st.cur = null; sfx('buzz', { vol: .5 }); g.shake(2, .15); break; }
    }
    if (IN.rel) g.warned = false;
    const s = g.st.done;
    if (s && g.state === 'play' && dist(s[0][0], s[0][1], sx, sy) <= 20 && dist(s[s.length - 1][0], s[s.length - 1][1], gx, gy) < 22 && s.every(p => this.onStreet(g, p[0], p[1]))) {
      g.okPath = s.slice(); g.walk = { d: 0 }; g.win(); sfx('coin'); sfx('bark', { n: 2, pitch: 1.3 });
    }
    if (g.walk) g.walk.d += 170 * g.tempo * dt;
  },
  draw(g, c) {
    const G = g.G;
    c.drawImage(hermanasEixBg(g.level), 0, 0);
    // roadworks: the closed stretch is hatched, with a striped barrier and two cones
    for (const e of g.closed) {
      const [ax, ay] = hermanasEixNode(G, e[0], e[1]), [bx, by] = hermanasEixNode(G, e[2], e[3]), mx = (ax + bx) / 2, my = (ay + by) / 2, horiz = ay === by;
      const len = (horiz ? Math.abs(bx - ax) : Math.abs(by - ay)) * .3, w = G.street * 2 - 2;
      const rx = horiz ? mx - len / 2 : mx - w / 2, ry = horiz ? my - w / 2 : my - len / 2, rw = horiz ? len : w, rh = horiz ? w : len;
      c.save(); c.beginPath(); c.rect(rd(rx), rd(ry), rd(rw), rd(rh)); c.clip();
      rect(c, rx, ry, rw, rh, '#5a5e68'); for (let k = -40; k < 40; k += 6) thickLine(c, mx + k - 20, my - 20, mx + k + 20, my + 20, 1, '#e8a23a');
      c.restore(); ringRect(c, rx, ry, rw, rh, 1, INK);
      if (horiz) { rect(c, mx - 3, my - 9, 6, 18, INK); for (let y = -8; y < 8; y += 4) rect(c, mx - 2, my + y, 4, 2, (y / 4) % 2 ? '#ffffff' : '#e23b4e'); }
      else { rect(c, mx - 9, my - 3, 18, 6, INK); for (let x = -8; x < 8; x += 4) rect(c, mx + x, my - 2, 2, 4, (x / 4) % 2 ? '#ffffff' : '#e23b4e'); }
      for (const sgn of [-1, 1]) { const cx0 = horiz ? mx + sgn * (len / 2 + 3) : mx + sgn * 4, cy0 = horiz ? my + sgn * 4 : my + sgn * (len / 2 + 3); polyPx(c, [[cx0 - 3, cy0 + 3], [cx0, cy0 - 4], [cx0 + 3, cy0 + 3]], INK); polyPx(c, [[cx0 - 2, cy0 + 2], [cx0, cy0 - 3], [cx0 + 2, cy0 + 2]], '#ff8a2a'); hline(c, cx0 - 1, cx0 + 1, cy0, '#ffffff'); }
    }
    // start: the shop; goal: the park
    const [sx, sy] = hermanasEixNode(G, ...g.start), [gx, gy] = hermanasEixNode(G, ...g.goal);
    hermanasMiniShop(c, sx, sy);
    panel(c, gx - 16, gy - 12, 32, 24, '#5a9a48', { r: 5, line: INK, hi: '#86c25e' }); for (const [tx, ty] of [[-8, -3], [0, -6], [8, -3]]) { disc(c, gx + tx, gy + ty, 4, INK); disc(c, gx + tx, gy + ty, 3, '#3f7a38'); } tiny(c, 'PARC', gx, gy + 3, '#ffffff', { align: 'c' });
    if (g.state === 'play') hermanasTarget(c, gx, gy, 16, g.t, '#fff27a');
    // what you're drawing (white), what failed (red)
    if (g.st.cur) hermanasDashes(c, g.st.cur, g.t, '#ffffff', 4, 2, 2);
    if (g.bad && g.t - g.bad.t < .8) { for (let i = 0; i < g.bad.path.length; i += 2) px(c, g.bad.path[i][0], g.bad.path[i][1], '#ff4060'); shout(c, '¡POR LA CALLE!', clamp(g.bad.x, 60, 196), clamp(g.bad.y - 24, 20, 170), g.t - g.bad.t); }
    if (g.okPath) for (let i = 1; i < g.okPath.length; i++) thickLine(c, g.okPath[i - 1][0], g.okPath[i - 1][1], g.okPath[i][0], g.okPath[i][1], 1.2, '#fff27a');
    // Kira: waiting at the shop, then trotting along the route
    let kx = sx + 30, ky = sy + 6;
    if (g.walk && g.okPath) { let d = g.walk.d; for (let i = 1; i < g.okPath.length; i++) { const L = dist(g.okPath[i - 1][0], g.okPath[i - 1][1], g.okPath[i][0], g.okPath[i][1]); if (d <= L) { kx = lerp(g.okPath[i - 1][0], g.okPath[i][0], L ? d / L : 0); ky = lerp(g.okPath[i - 1][1], g.okPath[i][1], L ? d / L : 0); break; } d -= L; kx = g.okPath[i][0]; ky = g.okPath[i][1]; } }
    const fr = g.walk ? (g.walk.d > this.pathLen(g) ? 'happy' : fl(g.t * 10) % 2 ? 'walk0' : 'walk1') : g.state === 'lost' ? 'idle' : fl(g.t * 2) % 2 ? 'idle' : 'walk0';
    shadowOval(c, kx, ky + 2, 12, 2.5, .45);
    drawS(c, hermanasChibi(fr), kx, ky + 2, { ax: .5, ay: 1, flip: g.walk && g.okPath && this.heading(g) < 0 });
    if (g.state === 'play' && g.t < 2.2 * g.spb && !g.st.cur) hermanasTag(c, sx + 30, sy - 14, 'EMPIEZA AQUÍ', '#fff27a');
    if (g.state === 'won' && g.walk && g.walk.d > 60) hermanasStamp(c, '¡AL PARQUE!', 128, 12, g.t - g.decidedAt);
    if (g.state === 'lost') hermanasStamp(c, '¡NO LLEGAMOS!', 128, 12, g.t - g.decidedAt, false);
  },
  pathLen(g) { let L = 0; const P = g.okPath || []; for (let i = 1; i < P.length; i++) L += dist(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]); return L; },
  heading(g) { let d = g.walk.d; const P = g.okPath; for (let i = 1; i < P.length; i++) { const L = dist(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]); if (d <= L) return Math.sign(P[i][0] - P[i - 1][0]) || 1; d -= L; } return 1; },
  hint(g) { const P = this.route(g) || []; const p = P.slice(0, Math.min(3, P.length)); return p.length > 1 ? { x: p[0][0], y: p[0][1], mech: 'draw', path: p } : null; },
  bot(g) { if (!g.plan) { const P = this.route(g); g.plan = [P]; } return hermanasBot(g, g.plan, 7, .1); },
});

// the three new games join the stage's rotation (the stage file is someone else's)
if (STAGES.hermanas) for (const id of ['castillo', 'puntos', 'eixample']) if (!STAGES.hermanas.games.includes(id)) STAGES.hermanas.games.push(id);
