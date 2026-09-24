// ============================================================================
//  Stage 6 — DON BIGOTES · ¡GIRA!  "La ciencia del secado"
//  An old salt-and-pepper schnauzer inventor (after Dr. Crygor): enormous white
//  brows and beard, brass goggles, lab coat, green bow tie. His lab, his
//  Secador Supersónico 3000, and a lot of cranks to turn.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- palette ---
RAMP.bigotesSalt = ['#1d1c24', '#383742', '#5b5a67', '#858492', '#b2b1be'];
RAMP.bigotesBeard = ['#686775', '#9796a3', '#c3c2cc', '#e4e3ea', '#ffffff'];
// a pale sky-blue lab coat, so the white beard never melts into it
RAMP.bigotesCoat = ['#3d6690', '#6a98c4', '#98c2e4', '#c8e2f5', '#f0f9ff'];
RAMP.bigotesLens = ['#0f3f4a', '#1c6b76', '#34a3a6', '#7fe0d6', '#d8fff6'];
RAMP.bigotesCopper = ['#4a1c0e', '#7e3517', '#b85a26', '#e38a45', '#ffc58a'];
RAMP.bigotesWall = ['#101a24', '#17283a', '#20394f', '#2e5068', '#4a7390'];
WHO.bigotes = { name: 'Don Bigotes', col: '#5b5a67', voice: 'bigotes' };
VOICES.bigotes = { base: 50, scale: [0, 3, 5, 7, 10, 12], inst: 'p50', len: .055 };

// ---------------------------------------------------------------- head ------
// brow: 'n' normal, 'up' raised (joy/shock), 'dn' knitted (focus), 'sad'
const BIGOTES_BROWS = { n: [.22, 0], up: [-.1, -2.5], dn: [.5, 1.5], sad: [-.45, 1] };
function bigotesHeadBase(brow = 'n', soot = 0) {
  return mdl('bigotes:bigHead:' + brow + soot, () => {
    const SP = soot ? RAMP.bigotesSalt.map(c => mixHex(c, '#0b0810', .55)) : RAMP.bigotesSalt;
    const BD = soot ? RAMP.bigotesBeard.map(c => mixHex(c, '#2b2540', .5)) : RAMP.bigotesBeard;
    const [ba, bdy] = BIGOTES_BROWS[brow] || BIGOTES_BROWS.n;
    // natural V ears folded forward: base on top of the skull, tips hanging by the eyes
    const earL = SD.grow(SD.poly([[15, 12], [27, 10], [17.5, 25]]), 1.8), earR = SD.grow(SD.poly([[49, 12], [37, 10], [46.5, 25]]), 1.8);
    const EAR = SP.map((c, i) => i < 4 ? SP[Math.max(0, i - 1)] : SP[3]);
    const skull = SD.box(32, 23, 13.5, 12.5, 7);
    const cheeks = SD.box(32, 33, 12.5, 7, 5);
    const strap = SD.box(32, 13.5, 14.5, 1.6, .8);
    const gL = SD.circle(25, 12.5, 5.2), gR = SD.circle(39, 12.5, 5.2), lL = SD.circle(25, 12.5, 3.4), lR = SD.circle(39, 12.5, 3.4);
    const browLs = SD.ellipse(21.5, 20 + bdy, 10.2, 4.2, ba), browRs = SD.ellipse(42.5, 20 + bdy, 10.2, 4.2, -ba);
    const browL = SD.tufts(browLs, 26, 23 + bdy, 2.2, 13, .7, 2.2), browR = SD.tufts(browRs, 38, 23 + bdy, 2.2, 13, 2.1, 2.2);
    const muzzle = SD.box(32, 35.5, 8.5, 6, 4);
    const mouS = SD.union(SD.ellipse(25.5, 38.5, 7.6, 4.8, .35), SD.ellipse(38.5, 38.5, 7.6, 4.8, -.35));
    const mous = SD.tufts(mouS, 32, 36, 1.5, 16, 1.3, 2);
    const beardS = SD.grow(SD.poly([[22, 40], [42, 40], [41, 50], [36, 57], [32, 60], [28, 57], [23, 50]]), 1.5);
    const beard = SD.tufts(beardS, 32, 44, 2.2, 14, .2, 2.4);
    const speck = (x, y) => (hash2(fl(x), fl(y), 11) - .5) * .42;
    const t1 = clumpTex(4.5, .28, 6, 1.2), tb = clumpTex(3, .22, 8, 1.9);
    return model(64, 62, [
      { f: earL, ramp: EAR, z: 1.5, th: 4, tex: speck }, { f: earR, ramp: EAR, z: 1.5, th: 4, tex: speck },
      { f: skull, ramp: SP, z: 1, th: 13, tex: (x, y) => speck(x, y) + t1(x, y) },
      { f: cheeks, ramp: SP, z: 1.2, th: 8, tex: speck },
      { f: strap, ramp: RAMP.wood, z: 1.55, th: 2 },
      { f: gL, ramp: RAMP.gold, z: 1.7, th: 3 }, { f: gR, ramp: RAMP.gold, z: 1.7, th: 3 },
      { f: lL, ramp: RAMP.bigotesLens, z: 1.8, th: 3, gloss: true, edge: false }, { f: lR, ramp: RAMP.bigotesLens, z: 1.8, th: 3, gloss: true, edge: false },
      { f: muzzle, ramp: SP, z: 2, th: 6, tex: speck },
      { f: beard, fs: beardS, ramp: BD, z: 2.6, th: 7, tex: tb },
      { f: browL, fs: browLs, ramp: BD, z: 2.8, th: 4, tex: tb }, { f: browR, fs: browRs, ramp: BD, z: 2.8, th: 4, tex: tb },
      { f: mous, fs: mouS, ramp: BD, z: 3, th: 5, tex: tb },
      { f: SD.box(32, 33.2, 4.2, 2.9, 2.3), ramp: RAMP.black, z: 4, th: 3, gloss: true },
    ]);
  });
}
// expressions: normal, joy (laughing), shock, focus, sad, soot (singed), wink, mad
const BIGOTES_EX = { normal: 'n', joy: 'up', laugh: 'up', shock: 'up', focus: 'dn', sad: 'sad', soot: 'sad', wink: 'n', mad: 'dn', talk: 'n', eureka: 'up' };
function bigotesHead(ex = 'normal') {
  return mdl('bigotes:bigHeadEx:' + ex, () => {
    const soot = ex === 'soot' ? 1 : 0, base = bigotesHeadBase(BIGOTES_EX[ex] || 'n', soot), c = mkCanvas(base.width, base.height), g = c.g;
    g.drawImage(base, 0, 0);
    const K = '#0b0810', br = BIGOTES_BROWS[BIGOTES_EX[ex] || 'n'][1], ey = 25 + Math.max(0, br * .6);
    const eye = (x, kind, side) => {
      // closed: a droopy lid; happy: a bold ∩; laugh: > <
      if (kind === 'closed') { hline(g, x, x + 4, ey + 1, K); hline(g, x + 1, x + 3, ey + 2, K); px(g, side < 0 ? x - 1 : x + 5, ey + 2, K); return; }
      if (kind === 'happy') { hline(g, x + 1, x + 3, ey, K); hline(g, x + 1, x + 3, ey - 1, K); rect(g, x, ey + 1, 1, 2, K); rect(g, x + 4, ey + 1, 1, 2, K); return; }
      if (kind === 'laugh') { const a = side < 0 ? x : x + 4, b = side < 0 ? x + 4 : x; for (const o of [0, side < 0 ? 1 : -1]) { linePx(g, a + o, ey - 1, b + o, ey + 1, K); linePx(g, b + o, ey + 1, a + o, ey + 3, K); } return; }
      if (kind === 'wide') { rect(g, x, ey - 1, 4, 4, '#ffffff'); rect(g, x + 1, ey, 2, 2, K); ringRect(g, x - 1, ey - 2, 6, 6, 1, K); return; }
      if (kind === 'x') { linePx(g, x, ey - 1, x + 3, ey + 2, K); linePx(g, x + 3, ey - 1, x, ey + 2, K); return; }
      rect(g, x, ey, 5, 4, K); rect(g, x + 1, ey - 1, 3, 1, K); rect(g, x + 1, ey, 2, 2, '#ffffff'); px(g, x + 3, ey + 3, '#6b6977');
    };
    const kinds = { joy: ['happy', 'happy'], laugh: ['laugh', 'laugh'], shock: ['wide', 'wide'], sad: ['closed', 'closed'], soot: ['x', 'x'], wink: ['', 'happy'], eureka: ['wide', 'wide'] }[ex] || ['', ''];
    eye(23, kinds[0], -1); eye(37, kinds[1], 1);
    // rosy cheeks peeking over the moustache when he's delighted
    if (ex === 'joy' || ex === 'laugh' || ex === 'wink' || ex === 'eureka') for (const bx of [16, 45]) { rect(g, bx, ey + 5, 4, 2, '#f08aa8'); px(g, bx + 1, ey + 5, '#ffc2d4'); }
    // mouth peeking under the moustache
    if (ex === 'joy' || ex === 'laugh' || ex === 'eureka' || ex === 'talk') {
      const w = ex === 'talk' ? 4 : 7, x0 = 32 - w / 2;
      rect(g, x0, 42, w, ex === 'talk' ? 2 : 4, '#3e0d1c'); if (ex !== 'talk') { hline(g, x0 + 1, x0 + w - 2, 42, '#ffffff'); rect(g, x0 + 2, 44, w - 4, 2, RAMP.pink[2]); }
    } else if (ex === 'shock') { rect(g, 30, 42, 4, 4, '#3e0d1c'); rect(g, 31, 44, 2, 2, RAMP.pink[1]); }
    else if (ex === 'mad') { hline(g, 28, 36, 43, K); for (const tx of [29, 31, 33, 35]) px(g, tx, 44, '#ffffff'); hline(g, 28, 36, 45, K); }
    if (soot) { for (const [sx, sy] of [[20, 8], [44, 6], [30, 2]]) { disc(g, sx, sy, 2.5, '#8f8a99'); disc(g, sx - 1, sy - 1, 1.2, '#c8c6d3'); } }
    return c;
  });
}

// ---------------------------------------------------------------- body ------
// Upper body in his lab coat (64x78); paws hold his gadgets. Two-bone IK arms.
const BIGOTES_POSES = {
  idle: { l: [19, 64], r: [46, 62], ex: 'normal', tl: 'flask', tr: null },
  ready: { l: [18, 64], r: [51, 30], ex: 'eureka', tl: null, tr: 'finger' },
  win: { l: [9, 27], r: [55, 25], ex: 'laugh', tl: null, tr: 'wrench' },
  lose: { l: [22, 70], r: [42, 70], ex: 'soot', tl: null, tr: null },
  speed: { l: [18, 64], r: [56, 50], ex: 'focus', tl: null, tr: 'lever' },
  boss: { l: [14, 44], r: [52, 38], ex: 'shock', tl: null, tr: 'finger' },
  clear: { l: [8, 22], r: [56, 20], ex: 'joy', tl: null, tr: 'wrench' },
  over: { l: [24, 72], r: [40, 72], ex: 'sad', tl: null, tr: null },
  talk: { l: [19, 64], r: [53, 44], ex: 'talk', tl: null, tr: null },
  point: { l: [18, 64], r: [58, 40], ex: 'joy', tl: null, tr: 'finger' },
};
function bigotesBody(pose = 'idle') {
  return mdl('bigotes:bigBody:' + pose, () => {
    const P = BIGOTES_POSES[pose] || BIGOTES_POSES.idle, CO = RAMP.bigotesCoat, SP = RAMP.bigotesSalt;
    const W = 64, H = 80, cx0 = 32, sL = [21.5, 45], sR = [42.5, 45];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 12, 13, -1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 12, 13, 1);
    const torso = SD.smooth(4, SD.ellipse(cx0, 47, 13.5, 6), SD.poly([[cx0 - 12, 46], [cx0 + 12, 46], [cx0 + 13, 82], [cx0 - 13, 82]]));
    const shirt = SD.poly([[cx0 - 5, 42], [cx0 + 5, 42], [cx0 + 2.5, 60], [cx0 - 2.5, 60]]);
    const lapL = SD.poly([[cx0 - 6, 42], [cx0 - 1.5, 58], [cx0 - 8.5, 52]]), lapR = SD.poly([[cx0 + 6, 42], [cx0 + 1.5, 58], [cx0 + 8.5, 52]]);
    const neckFur = SD.tufts(SD.ellipse(cx0, 42, 8, 4), cx0, 40, 1.2, 10, 0, 2);
    const armL = SD.union(SD.capsule(sL[0], sL[1], eL[0], eL[1], 4.2, 3.8), SD.capsule(eL[0], eL[1], P.l[0], P.l[1], 3.8, 3.4));
    const armR = SD.union(SD.capsule(sR[0], sR[1], eR[0], eR[1], 4.2, 3.8), SD.capsule(eR[0], eR[1], P.r[0], P.r[1], 3.8, 3.4));
    const pawL = SD.circle(P.l[0], P.l[1], 3.4), pawR = SD.circle(P.r[0], P.r[1], 3.4);
    const front = pose === 'lose' || pose === 'over';
    const speck = (x, y) => (hash2(fl(x), fl(y), 13) - .5) * .4;
    const c = model(W, H, [
      { f: torso, ramp: CO, z: 1, th: 12 },
      { f: shirt, ramp: RAMP.tile, z: 1.3, th: 3 },
      { f: neckFur, ramp: RAMP.bigotesBeard, z: 1.35, th: 3 },
      { f: lapL, ramp: CO, z: 1.5, th: 3 }, { f: lapR, ramp: CO, z: 1.5, th: 3 },
      { f: armL, ramp: CO, z: front ? 3 : 1.8, th: 5 }, { f: armR, ramp: CO, z: front ? 3 : 1.8, th: 5 },
      { f: pawL, ramp: SP, z: front ? 3.2 : 2.5, th: 3, tex: speck }, { f: pawR, ramp: SP, z: front ? 3.2 : 2.5, th: 3, tex: speck },
    ]);
    const g = c.g;
    // green bow tie (Westie BLVRD green), pocket with pens, buttons
    polyPx(g, [[cx0, 44], [cx0 - 5, 41], [cx0 - 5, 47]], RAMP.green[1]); polyPx(g, [[cx0, 44], [cx0 + 5, 41], [cx0 + 5, 47]], RAMP.green[1]);
    polyPx(g, [[cx0, 44], [cx0 - 4, 42], [cx0 - 4, 46]], RAMP.green[3]); polyPx(g, [[cx0, 44], [cx0 + 4, 42], [cx0 + 4, 46]], RAMP.green[3]);
    rect(g, cx0 - 1, 43, 2, 2, RAMP.green[4]);
    rect(g, cx0 + 5, 58, 6, 1, CO[1]); vline(g, cx0 + 6, 54, 58, '#ff4060'); vline(g, cx0 + 8, 55, 58, '#3565cc'); vline(g, cx0 + 9, 53, 58, '#e2b21b');
    for (const by of [62, 69, 76]) { px(g, cx0 - 1, by, CO[0]); px(g, cx0, by, CO[1]); }
    // fingers (paw beans) hint
    for (const [hx, hy] of [P.l, P.r]) { px(g, hx - 1, hy + 2, SP[0]); px(g, hx + 1, hy + 2, SP[0]); }
    return c;
  });
}
function bigotesWrenchSpr() { return mdl('bigotes:wrench', () => spr(['.kk...kk.', 'kssk.kssk', 'ksssksssk', '.kssssk..', '..kssk...', '..kssk...', '..kssk...', '..kssk...', '..kssk...', '...kk....'], { k: INK, s: RAMP.steel[3] })); }
function bigotesFlaskSpr() { return mdl('bigotes:flaskS', () => spr(['..kkk..', '..kwk..', '..kwk..', '.kwwwk.', 'kgggggk', 'kgGgggk', 'kggggGk', '.kkkkk.'], { k: INK, w: '#dff4ff', g: '#5bd18b', G: '#b8f0d0' })); }
function bigotesLeverSpr() { return mdl('bigotes:leverS', () => spr(['.kk.', 'krrk', 'krrk', '.kk.', '.ks.', '.ks.', '.ks.', '.ks.', '.ks.', 'kkkk', 'kssk'], { k: INK, r: '#ec5e5e', s: RAMP.steel[3] })); }
function drawBigotes(g, x, y, pose, t = 0, o = {}) {
  // (x, y) = bottom of the upper body (lab bench line)
  const P = BIGOTES_POSES[pose] || BIGOTES_POSES.idle, body = bigotesBody(pose), head = bigotesHead(o.ex || P.ex);
  const X = rd(x - 32), Y = rd(y - 78 + (o.bob || 0));
  g.drawImage(body, X, Y);
  const tilt = pose === 'over' ? .18 : pose === 'lose' ? -.08 : 0;
  drawS(g, head, X + 32, Y + 22 - (o.hop || 0) * 0, { ax: .5, ay: .6, rot: tilt + (o.headRot || 0) });
  if (P.tr === 'wrench') drawS(g, bigotesWrenchSpr(), X + P.r[0] + 1, Y + P.r[1] - 6, { rot: -.6 + Math.sin(t * 16) * .15 });
  if (P.tr === 'lever') drawS(g, bigotesLeverSpr(), X + P.r[0], Y + P.r[1] - 2, { ay: .15, rot: .5 + Math.sin(t * 20) * .2 });
  if (P.tr === 'finger') { px(g, X + P.r[0], Y + P.r[1] - 5, RAMP.bigotesSalt[2]); rect(g, X + P.r[0] - 1, Y + P.r[1] - 7, 2, 4, RAMP.bigotesSalt[3]); }
  if (P.tl === 'flask') drawS(g, bigotesFlaskSpr(), X + P.l[0], Y + P.l[1] - 5, { rot: Math.sin(t * 3) * .1 });
}
// legs (furry, with paws) for full-figure shots
function bigotesLegs() {
  return mdl('bigotes:bigLegs', () => {
    const SP = RAMP.bigotesSalt, CO = RAMP.bigotesCoat, speck = (x, y) => (hash2(fl(x), fl(y), 17) - .5) * .4;
    const coatHem = SD.poly([[18, 0], [46, 0], [48, 10], [16, 10]]);
    const legL = SD.capsule(26, 6, 25, 26, 4.2, 3.8), legR = SD.capsule(38, 6, 39, 26, 4.2, 3.8);
    const pawL = SD.ellipse(24, 28, 5.5, 3), pawR = SD.ellipse(40, 28, 5.5, 3);
    return model(64, 32, [{ f: legL, ramp: SP, z: 0, th: 4, tex: speck }, { f: legR, ramp: SP, z: 0, th: 4, tex: speck }, { f: pawL, ramp: SP, z: 1, th: 2, tex: speck }, { f: pawR, ramp: SP, z: 1, th: 2, tex: speck }, { f: coatHem, ramp: CO, z: 2, th: 6 }]);
  });
}
function drawBigotesFull(g, x, y, pose, t = 0, o = {}) {
  // (x, y) = feet on the floor
  const hop = o.hop || 0;
  g.drawImage(bigotesLegs(), rd(x - 32), rd(y - 31 - hop));
  drawBigotes(g, x, y - 22 - hop, pose, t, o);
}

// ---------------------------------------------------------------- lab props --
function bigotesTeslaCoil(g, x, y, t, charge = .5) {
  // (x, y) = base centre on the floor
  const S = RAMP.steel, CU = RAMP.bigotesCopper;
  rect(g, x - 14, y - 12, 28, 12, INK); rect(g, x - 13, y - 11, 26, 11, S[2]); rect(g, x - 13, y - 11, 26, 2, S[3]); for (let i = -10; i <= 10; i += 5) px(g, x + i, y - 5, S[4]);
  rect(g, x - 5, y - 58, 10, 47, INK); for (let j = 0; j < 46; j++) { g.fillStyle = j % 2 ? CU[2] : CU[3]; g.fillRect(x - 4, y - 57 + j, 8, 1); px(g, x - 4, y - 57 + j, CU[1]); px(g, x + 3, y - 57 + j, CU[4]); }
  ellipsePx(g, x, y - 64, 15, 6, INK); ellipsePx(g, x, y - 64, 14, 5, S[2]); ellipsePx(g, x - 2, y - 66, 9, 2.5, S[4]);
  // arcs
  const n = 1 + fl(charge * 3);
  for (let k = 0; k < n; k++) {
    const seed = fl(t * 14) + k * 17, ang = hash2(seed, 3) * TAU, len = 18 + hash2(seed, 5) * 22 * (.5 + charge);
    let px0 = x + Math.cos(ang) * 14, py0 = y - 64 + Math.sin(ang) * 5;
    for (let s = 0; s < 6; s++) { const nx = px0 + Math.cos(ang) * len / 6 + (hash2(seed, s) - .5) * 8, ny = py0 + Math.sin(ang) * len / 6 + (hash2(s, seed) - .5) * 8; linePx(g, px0, py0, nx, ny, s % 2 ? '#b3f3ff' : '#ffffff'); px0 = nx; py0 = ny; }
  }
}
function bigotesFlask(g, x, y, col, t, i) {
  // round-bottom flask with bubbling liquid, (x,y) = bottom centre
  disc(g, x, y - 7, 7, INK); rect(g, x - 2, y - 20, 5, 10, INK);
  disc(g, x, y - 7, 6, '#dff4ff'); rect(g, x - 1, y - 19, 3, 9, '#dff4ff');
  g.save(); g.beginPath(); g.rect(x - 7, y - 9, 14, 9); g.clip(); disc(g, x, y - 7, 6, col); g.restore();
  px(g, x - 3, y - 10, '#ffffff');
  const b = (t * 1.5 + i * .37) % 1; disc(g, x + Math.sin(i + t * 4) * 2, y - 8 - b * 16, 1 + b, 'rgba(255,255,255,.7)');
}
function bigotesGauge(g, x, y, r, v, t, label) {
  disc(g, x, y, r + 2, INK); disc(g, x, y, r + 1, RAMP.gold[2]); disc(g, x, y, r - 1, '#fffaf0');
  for (let i = 0; i <= 8; i++) { const a = Math.PI * .75 + i / 8 * Math.PI * 1.5; px(g, x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), i > 5 ? '#ff4060' : INK); }
  const a = Math.PI * .75 + clamp(v, 0, 1) * Math.PI * 1.5 + Math.sin(t * 30) * .03 * v;
  linePx(g, x, y, x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4), '#ff4060'); disc(g, x, y, 1.5, INK);
  if (label) tiny(g, label, x, y + r * .35, INK, { align: 'c' });
}
// the Secador Supersónico 3000: chrome dome, fins, nozzle, dials (w ~ 80)
function bigotesMachine(heat = 0) {
  return mdl('bigotes:supersonico' + heat, () => {
    const S = RAMP.steel, CH = RAMP.steel.map((c, i) => i === 4 ? '#ffffff' : c);
    const dome = SD.ellipse(40, 30, 26, 20), nozzle = SD.capsule(58, 34, 78, 40, 8, 5.5), ring = SD.sub(SD.ellipse(40, 30, 28, 22), SD.ellipse(40, 30, 25, 19));
    const fins = SD.union(...[0, 1, 2, 3].map(i => SD.box(14 + i * 7, 16 - i * 1.5, 1.6, 10, .6, -.4)));
    const stand = SD.union(SD.box(40, 58, 3, 12, 1), SD.box(40, 70, 16, 3, 2));
    const handle = SD.capsule(24, 46, 16, 62, 3, 3);
    return model(84, 76, [
      { f: stand, ramp: S, z: 0, th: 3 }, { f: handle, ramp: RAMP.red, z: .5, th: 3 },
      { f: fins, ramp: S, z: .8, th: 2 },
      { f: dome, ramp: CH, z: 1, th: 14, gloss: true },
      { f: ring, ramp: RAMP.gold, z: 1.2, th: 3 },
      { f: nozzle, ramp: CH, z: 1.5, th: 6, gloss: true },
    ], { post: g => {
      ellipsePx(g, 78, 40, 3, 5, INK); ellipsePx(g, 78, 40, 2, 4, heat ? '#ff9f4f' : '#2b2540');
      for (const [dx, col] of [[30, '#5bd18b'], [38, '#ffdf4f'], [46, heat ? '#ff4060' : '#6b6977']]) { disc(g, dx, 34, 2.5, INK); disc(g, dx, 34, 1.8, col); px(g, dx - 1, 33, '#ffffff'); }
      tiny(g, '3000', 40, 24, INK, { align: 'c' });
    } });
  });
}
// the machine at 1.5x built from its geometry (crisp pixels), fan and nozzle included
function bigotesMachineBig(g, x, y, heat = 0, t = 0) {
  drawS(g, bigotesMachineAt(1.5, heat), x, y, { ax: .5, ay: 1 });
  bigotesDryerCage(g, x, y - 66, 16, t * 8);
  drawS(g, bigotesNozzleSpr(heat), x + 33, y - 63, { ax: .06, ay: .5 });
}
// light bulb life icon (Edison bulb in a brass socket)
function bigotesBulbSpr(state) {
  return mdl('bigotes:bulb' + state, () => {
    const lit = state === 'on', broken = state === 'broken';
    const c = mkCanvas(18, 26), g = c.g;
    disc(g, 9, 9, 8, INK); disc(g, 9, 9, 7, broken ? '#4a4852' : lit ? '#fff7ae' : '#8f8a99'); if (lit) { disc(g, 8, 8, 5, '#ffffff'); disc(g, 9, 9, 3, '#fff27a'); }
    rect(g, 5, 14, 8, 3, INK); rect(g, 6, 14, 6, 2, broken ? '#4a4852' : lit ? '#fff7ae' : '#8f8a99');
    // filament
    linePx(g, 7, 12, 8, 7, lit ? '#ff9f4f' : '#44424f'); linePx(g, 8, 7, 10, 7, lit ? '#ff9f4f' : '#44424f'); linePx(g, 10, 7, 11, 12, lit ? '#ff9f4f' : '#44424f');
    if (!broken) { px(g, 5, 5, '#ffffff'); px(g, 5, 6, '#ffffff'); }
    else { linePx(g, 4, 4, 9, 10, INK); linePx(g, 9, 10, 13, 5, INK); rect(g, 3, 1, 12, 5, 'rgba(0,0,0,0)'); }
    rect(g, 5, 17, 8, 7, INK); for (let j = 0; j < 6; j++) { g.fillStyle = j % 2 ? RAMP.gold[2] : RAMP.gold[3]; g.fillRect(6, 17 + j, 6, 1); } rect(g, 7, 24, 4, 2, INK);
    return c;
  });
}

// ---------------------------------------------------------------- the lab ---
function bigotesLabBackdrop() {
  return mdl('bigotes:labBackdrop', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wl = RAMP.bigotesWall, S = RAMP.steel;
    // riveted wall panels
    rect(g, 0, 0, SW, 150, Wl[1]);
    for (let py = 0; py < 150; py += 30) for (let pxx = (py / 30 % 2) * 24; pxx < SW; pxx += 48) {
      rect(g, pxx, py, 47, 29, Wl[2]); rect(g, pxx, py, 47, 1, Wl[3]); rect(g, pxx, py, 1, 29, Wl[3]); rect(g, pxx, py + 28, 47, 1, Wl[0]);
      for (const [rx, ry] of [[3, 3], [43, 3], [3, 25], [43, 25]]) { px(g, pxx + rx, py + ry, Wl[4]); px(g, pxx + rx + 1, py + ry + 1, Wl[0]); }
    }
    // pipes along the ceiling
    rect(g, 0, 8, SW, 6, INK); rect(g, 0, 9, SW, 4, RAMP.bigotesCopper[2]); rect(g, 0, 9, SW, 1, RAMP.bigotesCopper[4]);
    for (let x = 20; x < SW; x += 60) { rect(g, x, 6, 6, 10, INK); rect(g, x + 1, 7, 4, 8, RAMP.bigotesCopper[3]); }
    // blueprint pinned on the wall
    rect(g, 92, 26, 50, 36, INK); rect(g, 93, 27, 48, 34, '#2a5ab0');
    for (let i = 0; i < 48; i += 6) vline(g, 93 + i, 27, 60, '#3a6fc8'); for (let j = 0; j < 34; j += 6) hline(g, 93, 140, 27 + j, '#3a6fc8');
    ringPx(g, 110, 44, 9, '#dff4ff'); linePx(g, 119, 44, 134, 50, '#dff4ff'); linePx(g, 104, 30, 108, 36, '#dff4ff'); tiny(g, '3000', 128, 30, '#dff4ff', { align: 'c' });
    px(g, 117, 28, C.red); px(g, 139, 28, C.red);
    // shelves of flasks (static glass; bubbles are animated on top)
    for (const sy of [50, 84]) { rect(g, 196, sy, 56, 3, S[3]); rect(g, 196, sy + 3, 56, 1, INK); }
    // floor: black & white checker in perspective-free rows
    for (let y = 150; y < SH; y += 7) for (let x = ((y - 150) / 7 % 2) * 14; x < SW; x += 28) { rect(g, x, y, 14, 7, '#e8e8f0'); }
    for (let y = 150; y < SH; y += 7) for (let x = ((y - 150) / 7 % 2 === 0 ? 14 : 0); x < SW; x += 28) rect(g, x, y, 14, 7, '#2b2540');
    rect(g, 0, 148, SW, 2, INK);
    return c;
  });
}
function bigotesLabBench(g, x, y, w) {
  // steel bench, top at y
  const S = RAMP.steel;
  rect(g, x - w / 2, y, w, 6, INK); rect(g, x - w / 2 + 1, y + 1, w - 2, 4, S[3]); rect(g, x - w / 2 + 1, y + 1, w - 2, 1, S[4]);
  rect(g, x - w / 2 + 4, y + 6, 4, 40, INK); rect(g, x - w / 2 + 5, y + 6, 2, 40, S[2]); rect(g, x + w / 2 - 8, y + 6, 4, 40, INK); rect(g, x + w / 2 - 7, y + 6, 2, 40, S[2]);
  rect(g, x - w / 2 + 4, y + 26, w - 8, 3, INK); rect(g, x - w / 2 + 5, y + 27, w - 10, 1, S[2]);
}
function bigotesLabBotBackdrop() {
  return mdl('bigotes:labBot', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wl = RAMP.bigotesWall, S = RAMP.steel;
    rect(g, 0, 0, SW, SH, Wl[1]);
    for (let py = 0; py < 150; py += 16) for (let pxx = (py / 16 % 2) * 16; pxx < SW; pxx += 32) { rect(g, pxx, py, 31, 15, Wl[2]); rect(g, pxx, py, 31, 1, Wl[3]); px(g, pxx + 2, py + 2, Wl[4]); px(g, pxx + 28, py + 12, Wl[0]); }
    // pipe rail for the bulbs
    rect(g, 0, 128, SW, 6, INK); rect(g, 0, 129, SW, 4, RAMP.bigotesCopper[2]); rect(g, 0, 129, SW, 1, RAMP.bigotesCopper[4]);
    // hazard stripes at the bottom
    rect(g, 0, 170, SW, 22, '#ffd23f'); for (let x = -22; x < SW; x += 22) polyPx(g, [[x, 170], [x + 11, 170], [x + 33, 192], [x + 22, 192]], INK);
    rect(g, 0, 168, SW, 2, INK);
    return c;
  });
}
// the riveted porthole the microgames zoom out of
PORTAL_FRAMES.bigotesLab = function (g, x, y, w, h, beat) {
  const S = RAMP.steel, b = 7;
  ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
  ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 2, S[2]);
  rect(g, x - b, y - b, w + b * 2, 1, S[4]); rect(g, x - b, y - b, 1, h + b * 2, S[3]);
  rect(g, x - b, y + h + b - 1, w + b * 2, 1, S[0]); rect(g, x + w + b - 1, y - b, 1, h + b * 2, S[1]);
  ringRect(g, x - 2, y - 2, w + 4, h + 4, 1, S[1]); ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  // rivets
  for (let i = 4; i < w + b * 2 - 2; i += 12) for (const yy of [y - b + 2, y + h + b - 4]) { px(g, x - b + i, yy, S[4]); px(g, x - b + i + 1, yy + 1, S[0]); }
  for (let i = 10; i < h + b * 2 - 6; i += 12) for (const xx of [x - b + 2, x + w + b - 4]) { px(g, xx, y - b + i, S[4]); px(g, xx + 1, y - b + i + 1, S[0]); }
  // pressure gauge on top, needle ticking with the beat
  const gx = x + w / 2, gy = y - b - 6, v = .35 + (beat % 1) * .5;
  bigotesGauge(g, gx, gy, 8, v, NOW, null);
  // warning lamp top-right, blinking on beats
  const on = (beat % 1) < .5; disc(g, x + w + b - 1, y - b + 1, 4, INK); disc(g, x + w + b - 1, y - b + 1, 3, on ? '#ff4060' : '#7a1f30'); if (on) px(g, x + w + b - 2, y - b, '#ffffff');
};

// ---------------------------------------------------------------- the room ---
const BIGOTES_REACT = { ready: 'ready', win: 'win', lose: 'lose', clear: 'clear', over: 'over' };
function bigotesRoomTop(g, S) {
  const t = NOW, beat = S.pb || 0, rt = S.reactT || 0;
  g.drawImage(bigotesLabBackdrop(), 0, 0);
  // flasks bubbling on the shelves
  [['#5bd18b', 204, 50], ['#ff93bf', 218, 50], ['#63a0ef', 233, 50], ['#ffdf4f', 246, 50], ['#bf95e9', 208, 84], ['#ff9f4f', 226, 84], ['#5bd18b', 242, 84]].forEach(([col, x, y], i) => bigotesFlask(g, x, y, col, t, i));
  // counter display: a riveted panel with a glass window
  rect(g, SW / 2 - 34, 16, 68, 40, INK); rect(g, SW / 2 - 33, 17, 66, 38, RAMP.steel[2]); rect(g, SW / 2 - 33, 17, 66, 2, RAMP.steel[4]);
  rect(g, SW / 2 - 30, 20, 60, 32, '#0b1a12'); rect(g, SW / 2 - 30, 20, 60, 1, '#1f4a33');
  for (let yy = 22; yy < 52; yy += 3) hline(g, SW / 2 - 29, SW / 2 + 28, yy, '#0f2419');
  for (const [rx, ry] of [[-31, 18], [31, 18], [-31, 52], [31, 52]]) px(g, SW / 2 + rx, ry, RAMP.steel[4]);
  let pose = rt < 1.2 ? (BIGOTES_REACT[S.react] || 'idle') : 'idle';
  if (S.phase === 'inter' && S.special === 'speed' && S.pb >= 2) pose = 'speed';
  if (S.phase === 'inter' && S.special === 'boss' && S.pb >= 2) pose = 'boss';
  if (S.react === 'clear' || S.react === 'over') pose = BIGOTES_REACT[S.react];
  const charge = pose === 'win' || pose === 'clear' ? 1 : pose === 'speed' ? .8 : .3 + (beat % 1) * .2;
  bigotesTeslaCoil(g, 32, 148, t, charge);
  // the machine on its stand
  drawS(g, bigotesMachine(pose === 'boss' || pose === 'lose' ? 1 : 0), 214, 150, { ax: .5, ay: 1, rot: pose === 'boss' ? Math.sin(t * 40) * .02 : 0 });
  if (pose === 'boss' || (pose === 'speed' && fl(t * 8) % 2)) { for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; disc(g, 244 + k * 8, 110 - k * 30, 3 + k * 5, `rgba(220,220,230,${.6 * (1 - k)})`); } }
  // Don Bigotes behind his bench
  const hop = (pose === 'win' || pose === 'clear') ? Math.max(0, Math.sin(Math.min(1, rt / .45) * Math.PI)) * 8 + (pose === 'clear' ? Math.abs(Math.sin(rt * 6)) * 5 : 0) : 0;
  const bob = Math.round(Math.abs(Math.sin(beat * Math.PI)) * -1.4);
  drawBigotes(g, 122, 132 - hop, pose, S.pt || 0, { bob });
  bigotesLabBench(g, 122, 128, 92);
  // things on the bench: a beaker, a toolbox, a wet tennis ball
  bigotesFlask(g, 96, 128, '#5bd18b', t, 9); rect(g, 136, 120, 18, 8, INK); rect(g, 137, 121, 16, 6, '#ec5e5e'); rect(g, 137, 121, 16, 1, '#ffa39a'); rect(g, 142, 118, 6, 3, INK);
  // reaction garnish
  if (pose === 'win' && rt < .6) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rt * 4; drawStar(g, 122 + Math.cos(a) * 34 * Math.min(1, rt * 4), 70 + Math.sin(a) * 22 * Math.min(1, rt * 4), 3, '#fff27a', a); } }
  if (pose === 'win' && rt < 1.2 && fl(rt * 4) % 2 === 0) txt(g, '¡JA, JA, JA!', 158, 52, '#ffffff', { out: INK, bold: true });
  if (pose === 'lose' || pose === 'over') {
    // a little lab explosion just happened: smoke rising from his head
    for (let i = 0; i < 4; i++) { const k = (rt * .8 + i * .25) % 1; disc(g, 122 + Math.sin(k * 6 + i) * 6, 50 - k * 36, 3 + k * 6, `rgba(90,88,105,${.7 * (1 - k)})`); }
    if (rt < .5) { const k = rt / .5; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; drawStar(g, 122 + Math.cos(a) * 30 * k, 60 + Math.sin(a) * 20 * k, 3 * (1 - k) + .5, i % 2 ? '#ff9f4f' : '#fff27a'); } }
    if (pose === 'lose' && rt < 1.1) txt(g, '*cof, cof*', 150, 48, '#ffffff', { out: INK });
  }
  if (pose === 'speed') { for (let i = 0; i < 6; i++) { const yy = 60 + i * 13, xx = (i * 53 + fl((S.pt || 0) * 300)) % 80; rect(g, 150 + xx * .3, yy, 18, 1, '#b3f3ff'); } }
  if (pose === 'boss' && fl(t * 6) % 2) txt(g, '¡PELIGRO!', 214, 64, '#ff4060', { align: 'c', out: INK, bold: true });
}
function bigotesRoomBot(g, S) {
  g.drawImage(bigotesLabBotBackdrop(), 0, 0);
  // two spinning gears in the corners, turning with the beat
  const a = (S.pb || 0) * Math.PI / 2;
  bigotesGear(g, 18, 22, 14, a, RAMP.bigotesCopper); bigotesGear(g, 238, 22, 11, -a * 1.3, RAMP.steel);
}
function bigotesGear(g, x, y, r, a, ramp) {
  const n = Math.max(6, fl(r * .8)), pts = [];
  for (let i = 0; i < n * 2; i++) { const aa = a + i / (n * 2) * TAU, rr = i % 2 ? r : r * .78; pts.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); }
  polyPx(g, pts.map(([px0, py0]) => [px0 + 1, py0 + 1]), INK); polyPx(g, pts, ramp[2]);
  disc(g, x, y, r * .55, ramp[3]); disc(g, x - 1, y - 1, r * .35, ramp[4]); disc(g, x, y, r * .2, INK);
}
function bigotesLife(g, x, y, st, bt) {
  const sy = y + 2;
  if (st === 'gone') { drawS(g, bigotesBulbSpr('broken'), x, sy, { ay: .95 }); return; }
  if (st === 'break') {
    const k = clamp(bt / 1.1, 0, 1);
    drawS(g, bigotesBulbSpr(fl(bt * 20) % 2 && bt < .45 ? 'on' : 'broken'), x, sy, { ay: .95 });
    if (bt < .5) { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; px(g, x + Math.cos(a) * bt * 60, sy - 18 + Math.sin(a) * bt * 40 + bt * bt * 120, '#dff4ff'); } txt(g, '¡PLOF!', x, sy - 34 - bt * 10, '#ffffff', { align: 'c', out: INK }); }
    void k; return;
  }
  // alive: glowing
  g.globalAlpha = .18 + Math.sin(NOW * 5 + x) * .05; disc(g, x, sy - 16, 12, '#fff7ae'); g.globalAlpha = 1;
  drawS(g, bigotesBulbSpr('on'), x, sy, { ay: .95 });
}
function bigotesMiniLife(g, x, y, alive) { drawS(g, bigotesBulbSpr(alive ? 'on' : 'broken'), x, y + 5, { s: .5, ay: .9 }); }
// blueprint paper behind the command during microgames, Don Bigotes watching bottom-right
function bigotesPlayTop(g, S) {
  rect(g, 0, 0, SW, SH, '#1f4aa0');
  const off = fl(S.pt * 12 * S.bpm / 120) % 12;
  for (let x = -12; x < SW + 12; x += 12) vline(g, x + off, 0, SH, '#2a5ab0');
  for (let y = -12; y < SH + 12; y += 12) hline(g, 0, SW, y + off, '#2a5ab0');
  for (let x = -48; x < SW + 48; x += 48) vline(g, x + off * 4 % 48, 0, SH, '#3a6fc8');
  // schematic doodles
  ringPx(g, 60, 110, 26, '#8fb8ff'); ringPx(g, 60, 110, 18, '#8fb8ff'); linePx(g, 86, 110, 140, 96, '#8fb8ff'); linePx(g, 60, 84, 60, 70, '#8fb8ff'); tiny(g, 'FIG. 3', 40, 146, '#8fb8ff');
  const st = S.g.state === 'play' ? 'watch' : S.g.state === 'won' ? 'win' : 'lose';
  bigotesMini(g, 0, 0, st, S);
}
function bigotesMini(g, x, y, st, S) {
  const pose = st === 'win' ? 'win' : st === 'lose' ? 'lose' : 'idle';
  const peek = st === 'win' ? 6 : 0;
  drawBigotes(g, SW - 40, SH + 34 - peek, pose, S.pt || 0, { ex: st === 'watch' ? (fl((S.pt || 0) * 2) % 4 === 0 ? 'focus' : 'normal') : null });
}

// ---------------------------------------------------------------- music ------
const BIGOTES_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'organ', v: .55, n: 'A4 . . A4 C5 . E5 . A5! - - - G#5 . A5 .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 C3 . E3 . A2 . . A2 E2 . A2 .' },
    { i: 'd', v: .75, n: 'k . . s k . s . k . . s k+x . . .' }] },
  ready: { spb: 4, tracks: [{ i: 'organ', v: .55, n: 'E5 . E5 . A5! - . .' }, { i: 'bass', v: .85, n: 'A2 . . A2 E3 . A2 .' }, { i: 'd', v: .75, n: 'k . . s k . s .' }] },
  win: { spb: 4, tracks: [{ i: 'p25', v: .7, n: 'C5 E5 G5 C6 E6! - C6 .' }, { i: 'organ', v: .4, n: 'C5+E5 . . . G5+C6 - . .' }, { i: 'bass', v: .85, n: 'C3 . G2 . C3 . . .' }, { i: 'd', v: .8, n: 'k . s . k k s+x .' }] },
  lose: { spb: 4, tracks: [{ i: 'p50', v: .7, n: 'E5 - Eb5 - D5 - Db5 -' }, { i: 'bass', v: .85, n: 'A2 . Ab2 . G2 . Gb2 .' }, { i: 'd', v: .7, n: 'k . . . T . T .' }] },
  next: { spb: 4, tracks: [{ i: 'p25', v: .6, n: 'E4 . G#4 . B4 . E5 .' }, { i: 'bass', v: .85, n: 'E2 . . E2 B2 . E2 .' }, { i: 'd', v: .8, n: 'k . . s k . s s' }] },
  play: { spb: 4, tracks: [
    { i: 'organ', v: .45, n: 'A4 . C5 . E5 . A5 . G#5 . E5 . B4 . D5 . C5 . A4 . E5 . D5 . C5 . B4 . A4 - . .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 C3 . E3 . E2 . . E2 G#2 . B2 . A2 . . A2 C3 . E3 . E2 . . E2 A2 . . .' },
    { i: 'd', v: .7, n: 'k . . s k . s . k . . s k . s s k . . s k . s . k . . s k s s s' }] },
  boss: { spb: 4, loop: true, tracks: [
    { i: 'brass', v: .55, n: 'D5 - . D5 F5 . A5 . G5 - F5 . E5 . D5 . C#5 - . C#5 E5 . G5 . A5 - G5 . F5 . E5 .' },
    { i: 'organ', v: .3, n: 'D4+F4+A4 . . . . . . . A3+C#4+E4 . . . . . . . D4+F4+A4 . . . . . . . A3+C#4+G4 . . . . . . .' },
    { i: 'bass', v: .9, n: 'D2 . . D2 F2 . A2 . A1 . . A1 C#2 . E2 . D2 . . D2 F2 . A2 . A1 . . A1 E2 . A1 .' },
    { i: 'd', v: .85, n: 'k . . s k . s h k . . s k . s s k . . s k . s h T . T . T T T+x T' }] },
};

// ---------------------------------------------------------------- story -----
function bigotesLabTall(g, t, o = {}) {
  // a tall view of the lab: roof + sky above (top screen), lab below
  const gy = SH + HINGE;
  bandsV(g, 0, 0, SW, gy, ['#0b1030', '#131a48', '#1f2a66', '#2d3b80']);
  for (let i = 0; i < 40; i++) px(g, hash2(i, 9) * SW, hash2(9, i) * (gy - 30), i % 5 ? '#8fa0ff' : '#ffffff');
  // Barcelona rooftops at night + the lab's roof (a dome with a hatch)
  rect(g, 0, gy - 40, SW, 40, '#1b2233'); for (let x = 0; x < SW; x += 32) { rect(g, x + 4, gy - 52 - (x * 7 % 18), 22, 60, '#232c42'); for (let wy = gy - 46 - (x * 7 % 18); wy < gy - 10; wy += 9) rect(g, x + 8, wy, 4, 4, (x + wy) % 3 ? '#3a4560' : '#ffdf4f'); }
  ellipsePx(g, SW / 2, gy - 6, 70, 24, INK); ellipsePx(g, SW / 2, gy - 6, 68, 22, RAMP.steel[2]); ellipsePx(g, SW / 2 - 10, gy - 14, 40, 10, RAMP.steel[3]);
  if (o.hole) { ellipsePx(g, SW / 2 + (o.holeX || 0), gy - 20, 12, 5, INK); }
  g.drawImage(bigotesLabBackdrop(), 0, gy);
}
defCut('bigotes_in', {
  song: { spb: 4, loop: true, tracks: BIGOTES_SONGS.play.tracks },
  shots: [
    { dur: 0, lines: [['bigotes', '¡Bienvenidos a mi laboratorio! ¡Contemplad…!'], ['bigotes', '¡…el SECADOR SUPERSÓNICO 3000! ¡Seca a un perro en cuatro segundos! ¡Ja, ja, JA!'], ['keiko', '¿Guau…? ¿Y es seguro?']],
      sfx: [[.1, 'slam']],
      update(st, t, dt, cut) { if (cut.li >= 1 && st.revT == null) { st.revT = t; sfx('sparkle'); } },
      top(g, t) { g.drawImage(bigotesLabBackdrop(), 0, 0); bigotesTeslaCoil(g, 32, 148, t, .6); drawBigotesFull(g, 128, 176, CUT.li >= 1 ? 'point' : 'ready', t, { hop: CUT.li === 1 ? Math.abs(Math.sin(t * 6)) * 3 : 0 }); if (CUT.li >= 1) { txt(g, '¡JA, JA, JA!', 180, 40, '#ffffff', { out: INK, bold: true }); } },
      bot(g, t, st, cut) {
        g.drawImage(bigotesLabBotBackdrop(), 0, 0);
        if (cut.li === 0) { // a sheet over the machine
          polyPx(g, [[70, 150], [90, 40], [128, 28], [166, 40], [186, 150]], INK); polyPx(g, [[72, 148], [92, 42], [128, 31], [164, 42], [184, 148]], '#dce7ea');
          for (let i = 0; i < 5; i++) linePx(g, 100 + i * 14, 50, 92 + i * 16, 146, '#b9cad0');
          txt(g, '?', 128, 80, '#6b6977', { align: 'c', bold: true });
        } else {
          const k = st.revT == null ? 0 : Math.min(1, spring(t - st.revT, 2.4, 6));
          for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t; drawStar(g, 128 + Math.cos(a) * 80, 90 + Math.sin(a) * 50, 2.5, '#fff27a', a); }
          if (k > .98) bigotesMachineBig(g, 138, 136, 0, t); else drawS(g, bigotesMachine(0), 138, 136, { ax: .5, ay: 1, s: Math.max(.05, k) });
          drawS(g, keikoHead(cut.li === 2 ? 'wow' : 'normal'), 40, 136, { ax: .5, ay: 1 });
        }
      } },
    { dur: 0, sfx: [[1.0, 'boom'], [1.05, 'whoosh'], [2.2, 'sparkle']], lines: [['bigotes', 'Primera prueba: una pelota de tenis mojada. ¡A TODO GAS!'], ['keiko', '¡Eh! ¡Esa era MI pelota!'], ['bigotes', 'Pequeño ajuste de potencia… ¡Necesito un perro mojado de verdad!']],
      tall(g, t, st, cut) {
        const gy = SH + HINGE, fired = t > 1.0;
        bigotesLabTall(g, t, { hole: fired });
        drawS(g, bigotesMachine(fired && t < 2 ? 1 : 0), 150, gy + 132, { ax: .5, ay: 1 });
        drawBigotesFull(g, 70, gy + 138, fired ? (cut.li >= 2 ? 'talk' : 'boss') : 'speed', t);
        drawS(g, westieSide(.62, cut.li === 1 ? 'stand' : 'wag', cut.li === 1 ? 'wow' : 'normal'), 222, gy + 138, { ax: .5, ay: 1, flip: true });
        // the tennis ball: in front of the nozzle, then up through the roof and away
        const bx = 196, by0 = gy + 96;
        if (!fired) { disc(g, bx, by0, 5, INK); disc(g, bx, by0, 4, '#d4e84a'); px(g, bx - 1, by0 - 2, '#ffffff'); for (let i = 0; i < 3; i++) px(g, bx - 3 + i * 3, by0 + 5 + (t * 20 + i * 3) % 6, '#9bd6f7'); }
        else {
          const k = clamp((t - 1) / 1.2, 0, 1), y = lerp(by0, -30, E.inQ(k));
          if (k < 1) { disc(g, bx - k * 20, y, 5, INK); disc(g, bx - k * 20, y, 4, '#d4e84a'); for (let i = 1; i < 6; i++) px(g, bx - k * 20 + (i % 2), y + i * 5, '#ffffff'); }
          if (t > 2.1) { const tw = (t * 6) % 1; drawStar(g, 60, 30, 2 + tw * 3, '#ffffff', t); }
          if (t > 1 && t < 1.4) { g.globalAlpha = 1 - (t - 1) / .4; rect(g, 0, gy, SW, SH, '#ffffff'); g.globalAlpha = 1; }
          for (let i = 0; i < 5; i++) { const k2 = ((t - 1) * .7 + i * .2) % 1; disc(g, 180 + k2 * 40, gy + 96 - k2 * 50, 4 + k2 * 8, `rgba(220,220,230,${.5 * (1 - k2)})`); }
        }
      } },
  ],
});
defCut('bigotes_out', {
  song: { spb: 4, loop: true, tracks: BIGOTES_SONGS.card.tracks },
  shots: [
    { dur: 0, lines: [['bigotes', '¡Funciona! ¡Cuatro segundos por perro! ¡Soy un genio!'], ['anahi', 'Don Bigotes, está genial… pero no se meta usted debajo, ¿eh?'], ['bigotes', 'La ciencia exige sacrificios. ¡Prueba definitiva: YO MISMO!']],
      top(g, t) { g.drawImage(bigotesLabBackdrop(), 0, 0); bigotesTeslaCoil(g, 32, 148, t, .9); drawBigotesFull(g, 150, 176, CUT.li === 2 ? 'point' : 'win', t, { hop: CUT.li === 0 ? Math.abs(Math.sin(t * 7)) * 5 : 0 }); drawAnahiFull(g, 70, 176, CUT.li === 1 ? 'talk' : 'idle', t); },
      bot(g, t) { g.drawImage(bigotesLabBotBackdrop(), 0, 0); bigotesMachineBig(g, 150, 136, 0, t); drawS(g, bigotesPoofWestie(), 46, 138, { ax: .5, ay: 1, flip: true }); for (let i = 0; i < 4; i++) drawStar(g, 40 + i * 60, 16 + Math.sin(t * 4 + i) * 5, 2.5, '#fff27a'); } },
    { dur: 0, sfx: [[.4, 'boom'], [.45, 'whoosh'], [2.5, 'sparkle']], lines: [['narr', '¡FIUUUUUUUUM!'], ['bigotes', '¡El universo es mi peluquería! ¡JA, JA, JAAA!'], ['narr', 'Don Bigotes volverá… cuando baje.']],
      wait: 1.3,
      tall(g, t) {
        const gy = SH + HINGE;
        if (t < .5) { bigotesLabTall(g, t); drawS(g, bigotesMachine(1), 110, gy + 132, { ax: .5, ay: 1 }); drawBigotesFull(g, 170, gy + 138, 'boss', t); return; }
        // space: the Earth below, Don Bigotes orbiting with a colossal blow-dried beard
        rect(g, 0, 0, SW, TALL_H, '#070a1e');
        for (let i = 0; i < 90; i++) { const tw = (hash2(i, 2) * 10 + t * 2) % 1; px(g, hash2(i, 7) * SW, hash2(7, i) * TALL_H, tw < .15 ? '#ffffff' : '#6f7ab0'); }
        ellipsePx(g, SW / 2, TALL_H + 120, 260, 190, '#1f5aa8'); ellipsePx(g, SW / 2 - 20, TALL_H + 110, 200, 160, '#2d7ad0');
        for (let i = 0; i < 6; i++) ellipsePx(g, 40 + i * 40 + Math.sin(t + i) * 4, TALL_H - 40 + (i % 2) * 14, 18, 7, '#5bb593');
        const k = clamp((t - .5) / 2, 0, 1), ang = t * .6;
        const x = SW / 2 + Math.cos(ang) * 50 * k, y = lerp(TALL_H - 40, 70, E.outQ(k)) + Math.sin(ang) * 18 * k;
        // the enormous fluffy beard trailing behind
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * 2; disc(g, x + Math.cos(a) * 16, y + 18 + Math.sin(a) * 10, 11, INK); }
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * 2; disc(g, x + Math.cos(a) * 16, y + 18 + Math.sin(a) * 10, 10, '#ffffff'); }
        drawBigotes(g, x, y + 30, 'clear', t, { headRot: Math.sin(t * 3) * .3 });
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - t * 3; drawStar(g, x + Math.cos(a) * 46, y + Math.sin(a) * 34, 3, '#fff27a', a); }
      } },
  ],
});

// ---------------------------------------------------------------- the stage --
defStage({
  id: 'bigotes', name: 'DON BIGOTES', sub: '«¡La ciencia del secado!»', verb: '¡GIRA!', mech: 'spin', bpm: 122,
  games: ['secador', 'grifo', 'tapon', 'heladera', 'enrolla'], boss: 'supersonico', bossAt: 10, speedAt: [4, 7],
  unlockBy: 'ceniza',
  portrait: (k) => mdl('bigotes:bigPortrait' + (k === 'sad' ? 'S' : ''), () => { const c = mkCanvas(64, 112); c.g.drawImage(bigotesLegs(), 0, 80); drawBigotes(c.g, 32, 90, k === 'sad' ? 'over' : 'ready', 0); return c; }),
  face: () => mdl('bigotes:bigFace', () => faceCrop(bigotesHead('joy'), 10, 6, 44, 44)),
  peek: (g, x, y, t) => drawS(g, bigotesHead(fl(t * .7) % 3 === 0 ? 'laugh' : 'normal'), x, y - 6, { ax: .5, ay: 1 }),
  rim: RAMP.steel[3], cardCols: [RAMP.bigotesWall[1], RAMP.bigotesWall[2]], nameFill: ['#ffffff', '#d8fff6', '#7fe0d6'],
  tip: 'Haz círculos con el dedo: ¡manivelas, grifos y tapones!',
  songs: BIGOTES_SONGS,
  intro: 'bigotes_in', outro: 'bigotes_out',
  room: {
    top: bigotesRoomTop, bot: bigotesRoomBot, frame: 'bigotesLab', life: bigotesLife, miniLife: bigotesMiniLife, lifeY: 150, lifeSpacing: 34,
    counter: { x: SW / 2, y: 22 }, counterFill: ['#ffffff', '#b8ffcf', '#5bd18b'], mini: bigotesMini, playTop: bigotesPlayTop,
    portal: { x: 64, y: 24, w: 128, h: 92 },
    staticCols: [RAMP.bigotesWall[1], RAMP.bigotesWall[2]], cardCol: RAMP.teal,
  },
});

// ---------------------------------------------------------------- art bench --
// ?escena=cut&id=bigotes_art&p=0..2 (debug only; never shown in the game)
defCut('bigotes_art', { shots: [{ dur: 9999, box: 'none',
  top(g, t) {
    const p = +(QS.get('p') || 0);
    if (p === 0) { g.drawImage(bigotesLabBackdrop(), 0, 0); const exs = ['normal', 'joy', 'laugh', 'shock', 'focus', 'sad', 'soot', 'mad']; exs.forEach((e, i) => drawS(g, bigotesHead(e), 32 + (i % 4) * 64, 40 + fl(i / 4) * 70)); }
    else if (p === 1) { rect(g, 0, 0, SW, SH, '#dce7ea'); const ps = Object.keys(BIGOTES_POSES); ps.forEach((q, i) => drawBigotes(g, 26 + (i % 5) * 51, 90 + fl(i / 5) * 96, q, 0)); }
    else { bigotesRoomTop(g, { pb: t * 2, reactT: t % 2, react: ['ready', 'win', 'lose'][fl(t / 2) % 3], pt: t, phase: 'inter' }); }
  },
  bot(g, t) {
    const p = +(QS.get('p') || 0);
    if (p === 2) { bigotesRoomBot(g, { pb: t * 2 }); PORTAL_FRAMES.bigotesLab(g, 64, 24, 128, 92, t * 2); for (let i = 0; i < 4; i++) bigotesLife(g, 77 + i * 34, 150, i < 3 ? 'alive' : 'break', .2); return; }
    rect(g, 0, 0, SW, SH, '#8f7fb0'); drawBigotesFull(g, 50, 180, 'ready', t); drawS(g, bigotesMachine(0), 160, 120, { ax: .5, ay: 1 }); bigotesTeslaCoil(g, 230, 180, t, .7);
    for (let i = 0; i < 4; i++) drawS(g, bigotesBulbSpr(['on', 'off', 'broken', 'on'][i]), 110 + i * 22, 180, { ay: 1 });
    bigotesGear(g, 120, 150, 14, t, RAMP.bigotesCopper);
  },
}] });

// ---------------------------------------------------------------- chibi -----
