// ============================================================================
//  Stage 3 — POMPÓN · ¡CORTA!  "Un pompón, mil corazones"
//  A toy-poodle pop idol (#1 in «Los 40 Perrunos») and her rival Vanesa,
//  an Afghan hound with a silky mane and purple sunglasses.
// ============================================================================
'use strict';

const POMPON_FUR = ['#7a1f4c', '#c2427f', '#f06aa4', '#ffa8cc', '#ffe0ee'];   // cotton-candy curls
const POMPON_SKIN = ['#9a5e58', '#d09384', '#f4c6b4', '#ffe4d8', '#fff6f0'];  // the shaved parts (warm cream)
const POMPON_BOW = ['#5e0c33', '#a3185a', '#f0327f', '#ff82b4', '#ffd1e4'];
const POMPON_VAN_FUR = ['#5e4024', '#9c7646', '#d2ad73', '#efd7a4', '#fff4da'];   // Afghan silk
const POMPON_VAN_LILAC = ['#2b1450', '#4c2a86', '#7a4fc0', '#a987e6', '#d8c6fa'];
WHO.pompon = { name: 'Pompón', col: '#e05b98', voice: 'pompon' };
WHO.vanesa = { name: 'Vanesa', col: '#6b3fb0', voice: 'vanesa' };
WHO.publico = { name: 'Público', col: '#3b2757', voice: 'narr' };
VOICES.pompon = { base: 81, scale: [0, 4, 7, 9, 12], inst: 'p12', len: .04 };
VOICES.vanesa = { base: 62, scale: [0, 1, 5, 7], inst: 'p50', len: .055 };

// ---------------------------------------------------------------- textures --
const pomponCurlTex = (seed = 1, sz = 3.2) => { const c = clumpTex(sz * 1.15, .34, seed, 1, 1.05); return (x, y) => c(x, y) + .05; };
const pomponSilkTex = (x, y) => Math.sin(x * 1.25 + Math.sin(y * .11) * 2.2) * .13 + (hash2(fl(x), 0, 3) - .5) * .06;
const pomponCurlEdge = (f, seed = 0, amp = 1.1) => SD.curls(f, amp, 1.15, seed);

// ---------------------------------------------------------------- POMPÓN ----
// Upright idol, front view, 64x100. Hands move by pose (two-bone IK).
const POMPON_POSES = {
  idle: { l: [15, 68], r: [49, 68], ex: 'smile' },
  ready: { l: [15, 67], r: [51, 36], ex: 'wink' },
  sing: { l: [13, 62], r: [38, 45], ex: 'sing' },
  win: { l: [13, 33], r: [51, 33], ex: 'joy' },
  lose: { l: [25, 41], r: [39, 41], ex: 'cry' },
  speed: { l: [11, 52], r: [53, 50], ex: 'focus' },
  boss: { l: [21, 44], r: [43, 44], ex: 'shock' },
  clear: { l: [11, 29], r: [53, 29], ex: 'star' },
  over: { l: [17, 75], r: [47, 75], ex: 'sob' },
  angry: { l: [16, 62], r: [48, 62], ex: 'angry' },
  gum: { l: [24, 22], r: [40, 22], ex: 'shock' },
};
function pomponBody(pose = 'idle') {
  return mdl('pomponBody:' + pose, () => {
    const P = POMPON_POSES[pose] || POMPON_POSES.idle, F = POMPON_FUR, K = POMPON_SKIN, cx0 = 32;
    const sL = [23.5, 52], sR = [40.5, 52];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 10, 11, -1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 10, 11, 1);
    const front = pose === 'lose' || pose === 'boss' || pose === 'gum' || pose === 'sing';
    const wrist = (e, h) => { const dx = h[0] - e[0], dy = h[1] - e[1], m = Math.hypot(dx, dy) || 1; return [h[0] - dx / m * 3.4, h[1] - dy / m * 3.4]; };
    const wL = wrist(eL, P.l), wR = wrist(eR, P.r);
    const tail = pomponCurlEdge(SD.circle(50.5, 70, 5.4), 3), tailS = SD.circle(50.5, 70, 5.4);
    const legL = SD.capsule(27.5, 75, 26.5, 92, 3.1, 2.5), legR = SD.capsule(36.5, 75, 37.5, 92, 3.1, 2.5);
    const ankL = SD.circle(26.5, 89, 5), ankR = SD.circle(37.5, 89, 5);
    const footL = SD.ellipse(26, 96, 3.6, 2.1), footR = SD.ellipse(38, 96, 3.6, 2.1);
    const waist = SD.ellipse(cx0, 72, 7.4, 7.2);
    const maneS = SD.ellipse(cx0, 58, 13.4, 11.2), mane = pomponCurlEdge(maneS, 5, 1.3);
    const arm = (s, e, h) => SD.union(SD.capsule(s[0], s[1], e[0], e[1], 2.9, 2.5), SD.capsule(e[0], e[1], h[0], h[1], 2.5, 2.2));
    const armL = arm(sL, eL, P.l), armR = arm(sR, eR, P.r);
    const cuffL = SD.circle(wL[0], wL[1], 3.9), cuffR = SD.circle(wR[0], wR[1], 3.9);
    const pawL = SD.circle(P.l[0], P.l[1], 2.5), pawR = SD.circle(P.r[0], P.r[1], 2.5);
    const earLS = SD.ellipse(19.3, 38, 5.8, 11.8), earRS = SD.ellipse(44.7, 38, 5.8, 11.8);
    const headS = SD.ellipse(cx0, 29.5, 11, 10.4);
    const face = SD.smooth(2.5, SD.ellipse(cx0, 32, 8.8, 8), SD.ellipse(cx0, 36.4, 5.8, 5));
    const knotS = SD.circle(cx0, 15, 11.4), knot = pomponCurlEdge(knotS, 7, 1.2);
    const aZ = front ? 8 : 3.5;
    const c = model(64, 100, [
      { f: tail, fs: tailS, ramp: F, z: 0, th: 4, tex: pomponCurlTex(2) },
      { f: legL, ramp: K, z: 1, th: 3 }, { f: legR, ramp: K, z: 1, th: 3 },
      { f: pomponCurlEdge(ankL, 1), fs: ankL, ramp: F, z: 1.5, th: 4, tex: pomponCurlTex(3) }, { f: pomponCurlEdge(ankR, 2), fs: ankR, ramp: F, z: 1.5, th: 4, tex: pomponCurlTex(4) },
      { f: footL, ramp: K, z: 1.6, th: 2 }, { f: footR, ramp: K, z: 1.6, th: 2 },
      { f: waist, ramp: K, z: 2, th: 6 },
      { f: mane, fs: maneS, ramp: F, z: 3, th: 11, tex: pomponCurlTex(5) },
      { f: armL, ramp: K, z: aZ, th: 2.5 }, { f: armR, ramp: K, z: aZ, th: 2.5 },
      { f: pomponCurlEdge(cuffL, 6, .8), fs: cuffL, ramp: F, z: aZ + .2, th: 3, tex: pomponCurlTex(6, 2.6) }, { f: pomponCurlEdge(cuffR, 7, .8), fs: cuffR, ramp: F, z: aZ + .2, th: 3, tex: pomponCurlTex(7, 2.6) },
      { f: pawL, ramp: K, z: aZ + .3, th: 2, amb: .35 }, { f: pawR, ramp: K, z: aZ + .3, th: 2, amb: .35 },
      { f: pomponCurlEdge(earLS, 8), fs: earLS, ramp: F, z: 4, th: 5, tex: pomponCurlTex(8) }, { f: pomponCurlEdge(earRS, 9), fs: earRS, ramp: F, z: 4, th: 5, tex: pomponCurlTex(9) },
      { f: knot, fs: knotS, ramp: F, z: 4.5, th: 9, tex: pomponCurlTex(10) },
      { f: pomponCurlEdge(headS, 11, .8), fs: headS, ramp: F, z: 5, th: 9, tex: pomponCurlTex(11) },
      { f: face, ramp: K, z: 6, th: 6, amb: .4 },
      { f: SD.ellipse(cx0, 36.6, 2.3, 1.7), ramp: RAMP.black, z: 7, th: 1.5, gloss: true },
    ]);
    const g = c.g;
    pomponFace(g, cx0, P.ex);
    // collar with a heart tag
    hline(g, cx0 - 6, cx0 + 6, 46, POMPON_BOW[2]); hline(g, cx0 - 5, cx0 + 5, 47, POMPON_BOW[1]);
    drawHeart(g, cx0, 49.5, RAMP.gold[3], .55); px(g, cx0 - 1, 48, RAMP.gold[4]);
    // headset: boom mic from the right ear to the mouth
    linePx(g, cx0 + 11, 31, cx0 + 5, 38, INK); rect(g, cx0 + 3, 38, 3, 2, INK); px(g, cx0 + 4, 38, '#6f7a92');
    pomponBowAt(g, cx0, 5, 1); pomponBowAt(g, 19, 28, .55); pomponBowAt(g, 45, 28, .55);
    return c;
  });
}
// a pink ribbon bow painted at (x, y), size s
function pomponBowAt(g, x, y, s) {
  const B = POMPON_BOW, w = 7 * s, h = 5 * s;
  polyPx(g, [[x, y], [x - w - 1, y - h - 1], [x - w - 1, y + h + 1]], INK); polyPx(g, [[x, y], [x + w + 1, y - h - 1], [x + w + 1, y + h + 1]], INK);
  polyPx(g, [[x, y], [x - w, y - h], [x - w, y + h]], B[2]); polyPx(g, [[x, y], [x + w, y - h], [x + w, y + h]], B[2]);
  if (s > .7) { polyPx(g, [[x - 1, y], [x - w + 1, y - h + 2], [x - w + 1, y]], B[3]); polyPx(g, [[x + 1, y], [x + w - 1, y - h + 2], [x + w - 1, y]], B[3]); }
  disc(g, x, y, 2.2 * s + .6, INK); disc(g, x, y, 1.6 * s + .4, B[1]); px(g, x - 1, y - 1, B[4]);
}
// idol face: big glossy eyes with lashes, blush, singing mouth
function pomponFace(g, cx0, ex) {
  const K = '#2a0f22', L = RAMP.pink, ey = 28, lx = cx0 - 8, rx = cx0 + 2;
  const eye = (x, look = 0) => {
    rect(g, x + 1, ey - 1, 4, 8, K); rect(g, x, ey, 6, 6, K);
    rect(g, x + 1, ey, 4, 6, '#5a2350'); rect(g, x + 1, ey + 3, 4, 3, '#b0508f'); hline(g, x + 2, x + 3, ey + 5, '#ff9ccb');
    rect(g, x + 1 + look, ey, 2, 2, '#ffffff'); px(g, x + 1 + look, ey + 2, '#ffffff'); px(g, x + 4, ey + 4, '#ffd1e4');
    // lashes on the outer corner
    if (x < cx0) { px(g, x - 1, ey, K); px(g, x - 2, ey - 1, K); px(g, x, ey - 2, K); } else { px(g, x + 6, ey, K); px(g, x + 7, ey - 1, K); px(g, x + 5, ey - 2, K); }
  };
  const shut = (x, up) => { if (up) { px(g, x, ey + 3, K); hline(g, x + 1, x + 3, ey + 2, K); px(g, x + 4, ey + 3, K); } else { hline(g, x, x + 4, ey + 3, K); } if (x < cx0) px(g, x - 1, ey + 2, K); else px(g, x + 5, ey + 2, K); };
  const star = x => { drawStar(g, x + 2.5, ey + 3, 3.6, '#fff27a'); px(g, x + 2, ey + 3, '#ffffff'); };
  const blush = () => { for (const bx of [cx0 - 9, cx0 + 6]) { rect(g, bx, 35, 3, 2, '#ff8fb8'); px(g, bx + 1, 35, '#ffc2da'); } };
  const mouth = kind => {
    const y = 40;
    if (kind === 'sing') { rect(g, cx0 - 1, y - 1, 3, 3, INK); px(g, cx0, y, L[2]); return; }
    if (kind === 'open') { hline(g, cx0 - 2, cx0 + 2, y - 1, INK); rect(g, cx0 - 2, y, 5, 2, '#3e0d1c'); hline(g, cx0 - 1, cx0 + 1, y + 1, L[2]); return; }
    if (kind === 'sad') { hline(g, cx0 - 1, cx0 + 1, y, INK); px(g, cx0 - 2, y + 1, INK); px(g, cx0 + 2, y + 1, INK); return; }
    if (kind === 'o') { rect(g, cx0 - 1, y - 1, 3, 3, INK); px(g, cx0, y, '#3e0d1c'); return; }
    if (kind === 'grit') { hline(g, cx0 - 3, cx0 + 3, y - 1, INK); hline(g, cx0 - 2, cx0 + 2, y, '#ffffff'); hline(g, cx0 - 3, cx0 + 3, y + 1, INK); return; }
    if (kind === 'flat') { hline(g, cx0 - 2, cx0 + 2, y, INK); return; }
    px(g, cx0 - 3, y - 1, INK); hline(g, cx0 - 2, cx0 + 2, y, INK); px(g, cx0 + 3, y - 1, INK); px(g, cx0, y + 1, L[2]);
  };
  switch (ex) {
    case 'wink': eye(lx); shut(rx, true); blush(); mouth('smile'); break;
    case 'sing': shut(lx, true); shut(rx, true); blush(); mouth('sing'); break;
    case 'joy': shut(lx, true); shut(rx, true); blush(); mouth('open'); break;
    case 'cry': shut(lx); shut(rx); vline(g, lx + 1, ey + 4, ey + 8, '#9bd6f7'); vline(g, rx + 3, ey + 4, ey + 8, '#9bd6f7'); mouth('sad'); break;
    case 'sob': shut(lx); shut(rx); vline(g, lx + 2, ey + 4, ey + 9, '#9bd6f7'); vline(g, rx + 2, ey + 4, ey + 9, '#9bd6f7'); px(g, lx + 2, ey + 10, '#dff4ff'); mouth('o'); break;
    case 'focus': eye(lx, 1); eye(rx, 1); hline(g, lx, lx + 4, ey - 2, K); hline(g, rx, rx + 4, ey - 2, K); mouth('flat'); break;
    case 'shock': eye(lx); eye(rx); mouth('o'); rect(g, cx0 + 11, 22, 1, 3, '#9bd6f7'); break;
    case 'star': star(lx); star(rx); blush(); mouth('open'); break;
    case 'angry': eye(lx); eye(rx); linePx(g, lx - 1, ey - 3, lx + 4, ey - 1, K); linePx(g, rx, ey - 1, rx + 5, ey - 3, K); mouth('grit'); break;
    default: eye(lx); eye(rx); blush(); mouth('smile');
  }
}
function pomponDraw(g, x, y, pose, o = {}) {
  // (x, y) = between the feet on the floor
  drawS(g, pomponBody(pose), x, y - (o.jump || 0), { ax: .5, ay: .985, sx: o.sx || 1, sy: o.sy || 1, flip: o.flip });
}
// just the head (bubbles, HUD, close-ups): a crop of the idle body
function pomponHead(pose = 'idle') { return mdl('pomponHead:' + pose, () => faceCrop(pomponBody(pose), 12, 0, 40, 50)); }

// ---------------------------------------------------------------- VANESA ----
// The rival: Afghan hound, silk to the floor, purple cat-eye sunglasses. 64x104.
function pomponVanBody(kind = 'smug') {
  return mdl('pomponVanBody:' + kind, () => {
    const F = POMPON_VAN_FUR, cx0 = 32, wig = kind === 'wig' || kind === 'booed';
    const gownS = SD.smooth(5, SD.poly([[cx0 - 9, 34], [cx0 + 9, 34], [cx0 + 19, 94], [cx0 - 19, 94]]), SD.ellipse(cx0, 94, 19, 5));
    const gown = SD.shag(gownS, 1.4, .25, 4);
    const earL = SD.curve([cx0 - 7, 17], [cx0 - 15, 50], [cx0 - 17, 88], 5.6, 4.6), earR = SD.curve([cx0 + 7, 17], [cx0 + 15, 50], [cx0 + 17, 88], 5.6, 4.6);
    const headS = SD.ellipse(cx0, 21, 7.4, 8.6), snout = SD.ellipse(cx0, 33, 3.7, 8);
    const fringe = SD.curve([cx0 - 6, 15], [cx0 + 2, 5], [cx0 + 11, 11], 4.6, 2.4);
    const pawL = SD.ellipse(cx0 - 6, 98.5, 3.8, 2.3), pawR = SD.ellipse(cx0 + 6, 98.5, 3.8, 2.3);
    const shade = (x, y) => pomponSilkTex(x, y) - clamp((y - 60) / 90, 0, .25);
    const parts = [
      { f: gown, fs: gownS, ramp: F, z: 0, th: 14, tex: shade },
      { f: pawL, ramp: F, z: .2, th: 2 }, { f: pawR, ramp: F, z: .2, th: 2 },
      { f: SD.shag(earL, .7, .35, 2), fs: earL, ramp: F, z: 1, th: 5, tex: shade }, { f: SD.shag(earR, .7, .35, 3), fs: earR, ramp: F, z: 1, th: 5, tex: shade },
      { f: headS, ramp: F, z: 2, th: 7, tex: pomponSilkTex },
      { f: snout, ramp: F, z: 2.5, th: 4, amb: .4 },
      { f: SD.ellipse(cx0, 40.4, 2.3, 1.7), ramp: RAMP.black, z: 3, th: 1.5, gloss: true },
    ];
    if (!wig) parts.push({ f: fringe, ramp: F, z: 2.4, th: 4, tex: pomponSilkTex });
    else { const wS = SD.circle(cx0, 11, 10.5); parts.push({ f: pomponCurlEdge(wS, 13, 1.2), fs: wS, ramp: POMPON_FUR, z: 2.3, th: 8, tex: pomponCurlTex(13) }); }
    if (kind === 'throw') parts.push({ f: SD.union(SD.capsule(cx0 + 9, 50, cx0 + 19, 40, 3, 2.6), SD.capsule(cx0 + 19, 40, cx0 + 22, 27, 2.6, 2.4)), ramp: F, z: 3.5, th: 3, tex: pomponSilkTex });
    const c = model(64, 104, parts);
    const g = c.g, V = POMPON_VAN_LILAC;
    // strand lines down the gown
    for (let i = 0; i < 6; i++) { const x = cx0 - 12 + i * 5; for (let y = 58 + (i % 2) * 6; y < 90; y += 2) px(g, x + Math.round(Math.sin(y * .2 + i) * 1), y, F[1]); }
    // rhinestone cat-eye glasses
    const gy = 20;
    for (const side of [-1, 1]) {
      const pts = [[1, 0], [9, -2], [10, 2], [7, 5], [2, 5], [1, 3]].map(([x, y]) => [cx0 + side * x, gy + y]);
      polyPx(g, pts.map(([x, y]) => [x + side * .5, y]), INK); polyPx(g, pts.map(([x, y]) => [x - side * .5 * 0, y]).map(([x, y], i) => [x, y + (i === 0 ? .5 : 0)]), V[1]);
      polyPx(g, [[cx0 + side * 2, gy + 1], [cx0 + side * 8, gy - 1], [cx0 + side * 8, gy + 2], [cx0 + side * 6, gy + 4], [cx0 + side * 3, gy + 4]], V[2]);
      px(g, cx0 + side * 4, gy + 1, '#ffffff'); px(g, cx0 + side * 9, gy - 1, '#ffffff');
    }
    hline(g, cx0 - 1, cx0 + 1, gy + 1, INK);
    if (kind === 'booed') { vline(g, cx0 - 5, gy + 6, gy + 11, '#9bd6f7'); vline(g, cx0 + 5, gy + 6, gy + 11, '#9bd6f7'); }
    const my = 43;
    if (kind === 'angry' || kind === 'throw') { hline(g, cx0 - 3, cx0 + 3, my, INK); for (const t of [-2, 0, 2]) px(g, cx0 + t, my + 1, '#ffffff'); hline(g, cx0 - 3, cx0 + 3, my + 2, INK); }
    else if (kind === 'booed') { px(g, cx0 - 2, my + 1, INK); hline(g, cx0 - 1, cx0 + 1, my, INK); px(g, cx0 + 2, my + 1, INK); }
    else { px(g, cx0 - 2, my, INK); hline(g, cx0 - 1, cx0 + 2, my + 1, INK); px(g, cx0 + 3, my, INK); }
    // lilac silk scarf
    polyPx(g, [[cx0 - 8, 46], [cx0 + 8, 46], [cx0 + 6, 51], [cx0 - 6, 51]], INK); polyPx(g, [[cx0 - 7, 47], [cx0 + 7, 47], [cx0 + 5, 50], [cx0 - 5, 50]], V[2]); hline(g, cx0 - 6, cx0 + 6, 47, V[3]);
    polyPx(g, [[cx0 + 3, 50], [cx0 + 9, 62], [cx0 + 5, 63]], INK); polyPx(g, [[cx0 + 4, 50], [cx0 + 8, 61], [cx0 + 6, 61]], V[1]);
    return c;
  });
}
function pomponDrawVanesa(g, x, y, kind, o = {}) { drawS(g, pomponVanBody(kind), x, y, { ax: .5, ay: .98, flip: o.flip, sx: o.sx || 1, sy: o.sy || 1 }); }
function pomponSprayCan(g, x, y, rot, s = 1) {
  const img = mdl('pomponCan', () => spr([
    '..kkk...',
    '..kwk...',
    '.kkkkk..',
    'kvvVVvk.',
    'kvVVVvk.',
    'kvVWVvk.',
    'kvVWVvk.',
    'kvVVVvk.',
    'kvvvvvk.',
    'kvvvvvk.',
    '.kkkkk..'], { k: INK, v: POMPON_VAN_LILAC[1], V: POMPON_VAN_LILAC[2], W: POMPON_VAN_LILAC[4], w: '#ffffff' }));
  drawS(g, img, x, y, { rot, s });
}

// ---------------------------------------------------------------- the room --
function pomponArenaBg() {
  return mdl('pomponArena', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 132, ['#12082a', '#1e1036', '#2b1450', '#381e63']);
    for (let y = 14; y < 124; y += 6) for (let x = (y / 6 % 2) * 3; x < SW; x += 6) px(g, x, y, '#3b2470');
    // truss with lamps
    rect(g, 0, 0, SW, 8, INK); for (let x = 0; x < SW; x += 8) { linePx(g, x, 1, x + 7, 6, '#6f7a92'); linePx(g, x + 7, 1, x, 6, '#454d63'); } rect(g, 0, 0, SW, 1, '#a5afc4'); rect(g, 0, 7, SW, 1, '#454d63');
    for (const lx of [24, 62, 194, 232]) { rect(g, lx - 4, 8, 9, 7, INK); rect(g, lx - 3, 9, 7, 5, '#454d63'); rect(g, lx - 2, 14, 5, 2, '#fff7ae'); }
    // speaker stacks
    for (const sx of [2, 222]) { for (let j = 0; j < 3; j++) { const y = 92 + j * 22; rect(g, sx, y, 32, 21, INK); rect(g, sx + 1, y + 1, 30, 19, '#2b2540'); disc(g, sx + 16, y + 11, 7, '#1b1627'); ringPx(g, sx + 16, y + 11, 7, '#5f5883'); disc(g, sx + 16, y + 11, 2, '#5f5883'); } }
    // stage floor
    rect(g, 0, 132, SW, 32, '#5a1d52');
    for (let y = 133; y < 164; y += 3) rect(g, 0, y, SW, 1, y % 2 ? '#6e2665' : '#4a1745');
    for (let i = 0; i < 9; i++) polyPx(g, [[20 + i * 28, 133], [28 + i * 28, 133], [34 + i * 30, 163], [26 + i * 30, 163]], 'rgba(255,209,228,.08)');
    rect(g, 0, 132, SW, 1, '#ff82b4'); rect(g, 0, 163, SW, 2, INK);
    // the giant LED screen frame (the counter shows on it)
    rect(g, 82, 10, 92, 40, INK); rect(g, 84, 12, 88, 36, '#101a3a');
    for (let y = 13; y < 48; y += 2) for (let x = 85; x < 172; x += 2) px(g, x, y, '#16244c');
    rect(g, 124, 50, 8, 8, '#454d63');
    return c;
  });
}
// dog-shaped crowd silhouettes with glowsticks, bouncing on the beat
function pomponCrowd(g, y0, beat, t, hype = 0) {
  const cols = ['#ff5d9e', '#63e6ff', '#fff27a', '#94ffb4', '#c49aff'];
  for (let i = 0; i < 17; i++) {
    const x = 6 + i * 15.5 + (i % 2) * 3, jump = Math.abs(Math.sin(beat * Math.PI + i * .7)) * (2 + hype * 4), y = y0 + 10 + (i % 3) * 3 - jump;
    const ear = i % 4;
    disc(g, x, y, 7, '#12082a');
    if (ear === 0) { polyPx(g, [[x - 6, y - 2], [x - 4, y - 11], [x - 1, y - 5]], '#12082a'); polyPx(g, [[x + 6, y - 2], [x + 4, y - 11], [x + 1, y - 5]], '#12082a'); }
    else if (ear === 1) { disc(g, x - 6, y + 2, 4, '#12082a'); disc(g, x + 6, y + 2, 4, '#12082a'); }
    else if (ear === 2) { disc(g, x, y - 7, 5, '#12082a'); }
    rect(g, x - 6, y + 4, 13, 20, '#12082a');
    // glowstick waving
    const a = Math.sin(t * 5 + i) * (.5 + hype * .4) - Math.PI / 2 + (i % 2 ? .3 : -.3), L = 9, hx = x + (i % 2 ? 5 : -5), hy = y + 2;
    const c = cols[i % cols.length];
    thickLine(g, hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L, 1, c);
    if (fl(t * 8 + i) % 3 === 0) px(g, hx + Math.cos(a) * (L + 2), hy + Math.sin(a) * (L + 2), '#ffffff');
  }
}
function pomponBeams(g, t, n = 4, a = .12, cols = ['#ff82b4', '#63e6ff']) {
  for (let i = 0; i < n; i++) {
    const lx = [24, 62, 194, 232][i % 4], sw = Math.sin(t * (1.1 + i * .23) + i * 2) * 60, tx = lx + (lx < 128 ? 40 : -40) + sw;
    g.globalAlpha = a; polyPx(g, [[lx - 2, 15], [lx + 2, 15], [tx + 16, 162], [tx - 16, 162]], cols[i % cols.length]); g.globalAlpha = 1;
  }
}
function pomponLedScreen(g, S, t) {
  // hearts and sparkles scrolling behind the counter
  g.save(); g.beginPath(); g.rect(84, 12, 88, 36); g.clip();
  for (let i = 0; i < 6; i++) drawHeart(g, 84 + ((i * 19 + t * 20) % 104) - 8, 20 + (i % 2) * 18, i % 2 ? '#ff5d9e' : '#63a0ef', .9);
  if (S.react === 'lose' && (S.reactT || 0) < 1.2) { rect(g, 84, 12, 88, 36, '#3a0a1a'); }
  g.restore();
}
const POMPON_REACT = { ready: 'ready', win: 'win', lose: 'lose', clear: 'clear', over: 'over' };
function pomponRoomTop(g, S) {
  const t = S.pt || 0, beat = S.pb || 0, rt = S.reactT || 0;
  g.drawImage(pomponArenaBg(), 0, 0);
  let pose = rt < 1.3 ? (POMPON_REACT[S.react] || 'sing') : (fl(beat / 2) % 2 ? 'sing' : 'idle');
  const special = S.phase === 'inter' && S.special && S.pb >= 2 ? S.special : null;
  if (special === 'speed') pose = 'speed';
  if (special === 'boss') pose = 'boss';
  if (S.react === 'clear' || S.react === 'over') pose = POMPON_REACT[S.react];
  const hype = pose === 'win' || pose === 'clear' ? 1 : pose === 'lose' || pose === 'over' ? -.6 : 0;
  // light show
  if (pose === 'lose' || pose === 'over') { g.globalAlpha = .55; rect(g, 0, 0, SW, 164, '#05020c'); g.globalAlpha = 1; g.globalAlpha = .22; polyPx(g, [[124, 8], [132, 8], [158, 160], [98, 160]], '#fff7ae'); g.globalAlpha = 1; }
  else pomponBeams(g, t, 4, special === 'speed' ? .18 : .1, special === 'boss' ? ['#ff4060', '#ff9f4f'] : ['#ff82b4', '#63e6ff']);
  if (special === 'speed' && fl(t * 16) % 2) { g.globalAlpha = .15; rect(g, 0, 0, SW, 164, '#ffffff'); g.globalAlpha = 1; }
  pomponLedScreen(g, S, t);
  // Vanesa lurks in the wings before a boss
  if (special === 'boss') { const k = clamp((S.pb - 2) * .8, 0, 1); pomponDrawVanesa(g, lerp(290, 226, E.outBack(k)), 162, 'smug', { flip: true }); }
  // the idol
  const jump = pose === 'win' || pose === 'clear' ? Math.abs(Math.sin(rt * (pose === 'clear' ? 7 : 5))) * 10 : 0;
  const bob = Math.round(Math.abs(Math.sin(beat * Math.PI)) * 2);
  shadowOval(g, 128, 160, 16 - jump * .5, 3, .6);
  pomponDraw(g, 128, 160 - bob, pose, { jump, sy: 1 + (bob ? .02 : 0) });
  // hearts fly when the crowd loves it
  if ((pose === 'win' || pose === 'clear') && fl(t * 10) % 3 === 0 && S.topFx) S.topFx.add({ k: 'heart', x: 40 + rnd(176), y: 170, vx: rnd(-20, 20), vy: rnd(-90, -50), life: 1, c: pick(['#ff5d9e', '#ff93bf', '#ffffff']) });
  if (pose === 'win' && rt < .8) txt(g, '¡KYAAA!', 60 + Math.sin(t * 20) * 2, 118, '#ffffff', { out: INK, bold: true });
  if (pose === 'lose' && rt < 1) txt(g, 'oooh…', 176, 124, '#c49aff', { out: INK });
  pomponCrowd(g, 158, beat, t, hype);
}
function pomponCurtainBg() {
  return mdl('pomponCurtain', () => {
    const c = mkCanvas(SW, SH), g = c.g, B = POMPON_BOW;
    for (let x = 0; x < SW; x++) { const f = Math.sin(x / 9) * .5 + .5; g.fillStyle = f > .8 ? B[3] : f > .5 ? B[2] : f > .2 ? B[1] : B[0]; g.fillRect(x, 0, 1, SH); }
    for (let i = 0; i < 90; i++) { const x = hash2(i, 9) * SW, y = hash2(9, i) * 140; drawStar(g, x, y, 1.6, 'rgba(255,240,166,.45)'); }
    rect(g, 0, 0, SW, 7, RAMP.gold[2]); rect(g, 0, 0, SW, 2, RAMP.gold[4]); for (let x = 3; x < SW; x += 6) { vline(g, x, 7, 11, RAMP.gold[3]); px(g, x, 12, RAMP.gold[1]); }
    // stage apron with footlights
    rect(g, 0, 150, SW, 42, '#3a0f33'); rect(g, 0, 150, SW, 2, '#ff82b4'); for (let y = 154; y < SH; y += 5) rect(g, 0, y, SW, 1, '#4d1545');
    return c;
  });
}
function pomponRoomBot(g, S) {
  g.drawImage(pomponCurtainBg(), 0, 0);
  const t = S.pt || 0, beat = S.pb || 0;
  for (let i = 0; i < 16; i++) { const x = 8 + i * 16, on = (i + fl(beat * 2)) % 3 !== 0; disc(g, x, 186, 2.5, INK); disc(g, x, 186, 2, on ? '#fff27a' : '#8a5a12'); if (on) px(g, x - 1, 185, '#ffffff'); }
  void t;
}
// portal: a marquee with chasing bulbs and a name plate
PORTAL_FRAMES.stage = function (g, x, y, w, h, beat) {
  const B = POMPON_BOW, b = 7;
  ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
  ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 1, B[1]);
  rect(g, x - b, y - b, w + b * 2, 1, B[3]); rect(g, x - b, y + h + b - 1, w + b * 2, 1, B[0]);
  ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  // bulbs around the frame, chasing with the beat
  const per = [], step = 9;
  for (let i = x - b / 2; i < x + w + b / 2; i += step) per.push([i, y - b / 2 - .5]);
  for (let j = y - b / 2 + step; j < y + h + b / 2; j += step) per.push([x + w + b / 2 - .5, j]);
  for (let i = x + w + b / 2 - step; i > x - b / 2; i -= step) per.push([i, y + h + b / 2 - .5]);
  for (let j = y + h + b / 2 - step; j > y - b / 2; j -= step) per.push([x - b / 2 - .5, j]);
  const ph = fl(beat * 4);
  per.forEach(([bx, by], i) => { const on = (i + ph) % 3 !== 0; disc(g, bx, by, 2.4, INK); disc(g, bx, by, 1.9, on ? '#fff27a' : '#8a5a12'); if (on) px(g, bx - 1, by - 1, '#ffffff'); });
  // name plate
  const pw = 64, px0 = rd(x + w / 2 - pw / 2), py0 = rd(y - b - 12);
  panel(g, px0, py0, pw, 12, B[2], { r: 3, line: INK, hi: B[3] });
  txt(g, '★ POMPÓN ★', x + w / 2, py0 + 3, '#ffffff', { align: 'c', out: B[0] });
};
// lives: pink bows. Losing one: it unties and the loops tumble away.
function pomponLifeBow() { return mdl('pomponLifeBow', () => { const c = mkCanvas(24, 18); pomponBowAt(c.g, 12, 8, 1.35); const B = POMPON_BOW; polyPx(c.g, [[11, 9], [8, 17], [11, 16]], INK); polyPx(c.g, [[13, 9], [16, 17], [13, 16]], INK); polyPx(c.g, [[11, 10], [9, 16], [11, 15]], B[1]); polyPx(c.g, [[13, 10], [15, 16], [13, 15]], B[1]); pomponBowAt(c.g, 12, 8, 1.35); return c; }); }
function pomponLoop(side) { return mdl('pomponLoop' + side, () => { const c = mkCanvas(14, 14), g = c.g, B = POMPON_BOW; const x = side < 0 ? 12 : 2; polyPx(g, [[x, 7], [x - side * 10, 1], [x - side * 10, 13]], INK); polyPx(g, [[x, 7], [x - side * 9, 2], [x - side * 9, 12]], B[2]); return c; }); }
function pomponLife(g, x, y, st, bt) {
  if (st === 'gone') { g.globalAlpha = .3; drawS(g, mdl('pomLifeGone', () => silhouette(pomponLifeBow(), '#ffd1e4')), x, y); g.globalAlpha = 1; return; }
  if (st === 'break') {
    const k = clamp(bt / 1.1, 0, 1);
    for (const s of [-1, 1]) drawS(g, pomponLoop(s), x + s * (4 + k * 22), y + E.inQ(k) * 34 - Math.sin(k * Math.PI) * 10, { rot: s * k * 4, alpha: 1 - k * .6 });
    if (bt < .5) txt(g, '¡Nooo!', x, y - 20 - bt * 12, '#ffffff', { align: 'c', out: INK });
    return;
  }
  drawS(g, pomponLifeBow(), x, y, { rot: Math.sin(NOW * 3 + x) * .08 });
}
function pomponMiniLife(g, x, y, alive) { if (alive) pomponBowAt(g, x, y, .6); else ringPx(g, x, y, 3, 'rgba(255,255,255,.5)'); }
function pomponMini(g, x, y, st, S) {
  const pose = st === 'win' ? 'joy' : st === 'lose' ? 'lose' : 'idle';
  drawS(g, pomponBody(pose === 'joy' ? 'win' : pose), 34, SH + 52 - (st === 'win' ? 5 : 0), { ax: .5, ay: 1 });
  void S;
}
function pomponPlayTop(g, S) {
  const t = S.pt || 0;
  rect(g, 0, 0, SW, SH, '#ff82b4');
  for (let y = -12; y < SH + 12; y += 16) for (let x = -12; x < SW + 12; x += 16) { const ox = ((y / 16) % 2) * 8 + (t * 10 % 16); disc(g, x + ox, y + (t * 6 % 16), 3, '#ffa3c7'); }
  for (let i = 0; i < 6; i++) { const ph = (t * .6 + i / 6) % 1; drawStar(g, 20 + i * 44, 170 - ph * 150, 3 * (1 - ph) + 1, '#fff7ae', ph * 5); }
  pomponMini(g, 60, 140, S.g.state === 'play' ? 'watch' : S.g.state === 'won' ? 'win' : 'lose', S);
}

// ---------------------------------------------------------------- music -----
const POMPON_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'bell', v: .7, n: 'A5 . C#6 . E6 . A6 . G#6 . E6 . A6! - - -' },
    { i: 'p12', v: .35, n: 'A4 C#5 E5 A5 A4 C#5 E5 A5 D5 F#5 A5 D6 E5 G#5 B5 E6' },
    { i: 'bass', v: .8, n: 'A2 . A3 . A2 . A3 . D3 . D3 . E3 - - -' },
    { i: 'd', v: .75, n: 'k . c . k . c . k . c . k+c+x - - -' }] },
  ready: { spb: 4, tracks: [{ i: 'p25', v: .65, n: 'E5 . A5 . C#6 . E6 .' }, { i: 'bass', v: .8, n: 'A2 . A3 . E3 . A3 .' }, { i: 'd', v: .75, n: 'k . c . k c c .' }] },
  win: { spb: 4, tracks: [{ i: 'p25', v: .7, n: 'A5 C#6 E6 A6! - E6 A6 .' }, { i: 'bell', v: .5, n: 'E6 . . . A6 - . .' }, { i: 'bass', v: .85, n: 'A2 . E3 . A3 . . .' }, { i: 'd', v: .8, n: 'k . c . k k c+x .' }] },
  lose: { spb: 4, tracks: [{ i: 'p50', v: .7, n: 'F5 - E5 - D#5 - D5 -' }, { i: 'bass', v: .85, n: 'D3 . C#3 . C3 . B2 .' }, { i: 'd', v: .7, n: 'k . . . k . . .' }] },
  next: { spb: 4, tracks: [{ i: 'p25', v: .6, n: 'E5 . F#5 . G#5 . B5 .' }, { i: 'bass', v: .85, n: 'E2 . E3 . E2 . E3 .' }, { i: 'd', v: .8, n: 'k . c . k c c c' }] },
  play: { spb: 4, tracks: [
    { i: 'lead', v: .5, n: 'A5 . G#5 . F#5 . E5 . F#5 - E5 . C#5 . E5 - A5 . B5 . C#6 . B5 . A5 - F#5 . E5 - . .' },
    { i: 'p12', v: .28, n: 'C#5 E5 A5 E5 C#5 E5 A5 E5 D5 F#5 A5 F#5 D5 F#5 A5 F#5 C#5 E5 A5 E5 C#5 E5 A5 E5 B4 E5 G#5 E5 B4 E5 G#5 E5' },
    { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 . D2 . D3 . D2 . D3 . A2 . A3 . A2 . A3 . E2 . E3 . E2 . E3 .' },
    { i: 'd', v: .75, n: 'k . h . k+c . h . k . h . k+c . h h k . h . k+c . h . k . h . k+c c c c' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .5, n: 'F#5 - A5 - C#6 - B5 A5 G#5 - E5 - F#5 - . . D5 - F#5 - A5 - G#5 F#5 F5 - C#5 - F#5 - . .' },
    { i: 'p12', v: .3, n: 'F#4 A4 C#5 F#5 F#4 A4 C#5 F#5 D4 F#4 A4 D5 D4 F#4 A4 D5 B3 D4 F#4 B4 B3 D4 F#4 B4 C#4 F4 G#4 C#5 C#4 F4 G#4 C#5' },
    { i: 'bass', v: .9, n: 'F#2 F#3 F#2 F#3 F#2 F#3 F#2 F#3 D2 D3 D2 D3 D2 D3 D2 D3 B1 B2 B1 B2 B1 B2 B1 B2 C#2 C#3 C#2 C#3 C#2 C#3 C#2 C#3' },
    { i: 'd', v: .85, n: 'k h c h k k c h k h c h k k c c k h c h k k c h k h c h k+x c c c' }] },
};

// ---------------------------------------------------------------- stage -----
defStage({
  id: 'pompon', name: 'POMPÓN', sub: '«Un pompón, mil corazones»', verb: '¡CORTA!', mech: 'cut', bpm: 126,
  games: ['flequillo', 'pompones', 'nudos', 'chuches', 'cinta'], boss: 'gala', bossAt: 10, speedAt: [4, 7], unlockBy: 'rizos',
  portrait: (k) => mdl('pomponPortrait' + (k === 'sad' ? 'S' : ''), () => { const c = mkCanvas(64, 112); c.g.drawImage(pomponBody(k === 'sad' ? 'over' : 'ready'), 0, 12); return c; }),
  face: () => pomponHead('idle'),
  rim: POMPON_BOW[3], cardCols: ['#2b1557', '#4b2590'], nameFill: ['#ffffff', '#ffd1e4', '#ff5d9e'], tip: 'Desliza el dedo rápido y en línea: ¡tijeretazo!',
  songs: POMPON_SONGS, intro: 'pompon_in', outro: 'pompon_out',
  peek: (g, x, y, t) => drawS(g, pomponHead(fl(t * .7) % 2 ? 'win' : 'idle'), x, y - 8, { ax: .5, ay: 1 }),
  room: {
    top: pomponRoomTop, bot: pomponRoomBot, frame: 'stage',
    cardTop: (g, S) => { const t = S.pt || 0; g.drawImage(pomponArenaBg(), 0, 0); pomponBeams(g, t, 4, .12); pomponLedScreen(g, S, t); pomponCrowd(g, 158, t * 2.1, t, .6); }, life: pomponLife, lifeY: 164, lifeSpacing: 34, miniLife: pomponMiniLife,
    counter: { x: SW / 2, y: 16 }, counterFill: ['#ffffff', '#ffd1e4', '#ff5d9e'], mini: pomponMini, playTop: pomponPlayTop,
    portal: { x: 64, y: 30, w: 128, h: 96 }, staticCols: [POMPON_BOW[1], POMPON_BOW[0]], cardCol: RAMP.pink,
  },
});

// ---------------------------------------------------------------- story -----
function pomponDressingRoom(g, t) {
  // backstage: a vanity mirror ringed with bulbs, a clothes rail, a star on the door
  rect(g, 0, 0, SW, SH, '#3b2757'); for (let x = 0; x < SW; x += 12) rect(g, x, 0, 6, 140, '#44305f');
  rect(g, 0, 140, SW, 52, '#6b3f5a'); for (let y = 142; y < SH; y += 8) rect(g, 0, y, SW, 1, '#5a3350');
  rect(g, 72, 18, 112, 88, INK); rect(g, 75, 21, 106, 82, '#c9d8ef'); for (let i = 0; i < 4; i++) linePx(g, 100 + i * 16, 21, 84 + i * 16, 102, '#e6eefa');
  for (let i = 0; i < 7; i++) for (const yy of [16, 106]) { const on = (i + fl(t * 3)) % 4 !== 0; disc(g, 78 + i * 17, yy, 3, INK); disc(g, 78 + i * 17, yy, 2.3, on ? '#fff27a' : '#8a5a12'); }
  rect(g, 60, 106, 136, 8, RAMP.wood[3]); rect(g, 60, 106, 136, 1, RAMP.wood[4]); rect(g, 60, 114, 136, 26, RAMP.wood[2]);
  for (const [x, col] of [[76, '#ff93bf'], [88, '#c49aff'], [168, '#63e6ff']]) { rect(g, x - 3, 96, 7, 10, INK); rect(g, x - 2, 97, 5, 9, col); rect(g, x - 1, 93, 3, 3, INK); }
  drawStar(g, 30, 60, 12, '#fff27a'); drawStar(g, 30, 60, 8, '#ffd23f'); txt(g, 'POMPÓN', 30, 76, '#fff27a', { align: 'c', out: INK });
}
function pomponPalauFront(g, t) {
  rect(g, 0, 0, SW, SH, '#101a3a'); for (let i = 0; i < 40; i++) px(g, hash2(i, 2) * SW, hash2(2, i) * 80, '#ffffff');
  // the "Palau Sant Guau": a dome with a neon marquee
  ellipsePx(g, SW / 2, 110, 110, 60, '#2b3a6b'); rect(g, 18, 110, 220, 82, '#2b3a6b'); for (let x = 30; x < 230; x += 20) rect(g, x, 120, 10, 60, '#3d4f8a');
  panel(g, 40, 70, 176, 26, '#fff27a', { r: 5 }); txt(g, 'PALAU SANT GUAU', SW / 2, 74, INK, { align: 'c', bold: true }); txt(g, 'HOY: ¡POMPÓN!', SW / 2, 85, '#e05b98', { align: 'c', bold: true });
  for (let i = 0; i < 20; i++) { const on = (i + fl(t * 6)) % 2; disc(g, 44 + i * 8.7, 68, 1.5, on ? '#ffffff' : '#ff9f4f'); disc(g, 44 + i * 8.7, 98, 1.5, on ? '#ff9f4f' : '#ffffff'); }
}
defCut('pompon_in', {
  song: { spb: 4, loop: true, tracks: POMPON_SONGS.play.tracks },
  shots: [
    { dur: 0, lines: [['narr', 'Palau Sant Guau. Esta noche, concierto de Pompón, número 1 de «Los 40 Perrunos».'], ['pompon', '¡Entradas agotadas! ¡Hoy estreno flequillo nuevo!']],
      top(g, t) { pomponPalauFront(g, t); caption(g, 'Palau Sant Guau · 20:30'); },
      bot(g, t) { pomponDressingRoom(g, t); pomponDraw(g, 128, 150, fl(t * 2) % 2 ? 'sing' : 'ready', { jump: Math.abs(Math.sin(t * 4)) * 3 }); } },
    { dur: 0, sfx: [[.6, 'squish', { pitch: .6 }], [1.1, 'buzz']], lines: [['vanesa', 'Uy, perdona, querida… se me ha caído el chicle. Justo ahí.'], ['pompon', '¡¡MI FLEQUILLO!! ¡¡VANESAAA!!'], ['vanesa', 'Suerte en el concierto, estrellita. La vas a necesitar.']],
      top(g, t) { pomponDressingRoom(g, t); pomponDrawVanesa(g, 200, 176, CUT.li === 0 ? 'throw' : 'smug', { flip: true }); if (CUT.li === 1) speedLines(g, 90, 90, t, '#ffffff', 26, 40); pomponDraw(g, 80, 176, CUT.li >= 1 ? 'gum' : 'sing'); if (CUT.li >= 1) pomponGum(g, 80, 104, t, .5); },
      bot(g, t) { rect(g, 0, 0, SW, SH, '#ffd1e4'); for (let i = 0; i < 10; i++) drawHeart(g, (i * 37 + t * 20) % SW, (i * 53) % SH, '#ffb3cf', 1.2); const sh = CUT.li >= 1 ? Math.sin(t * 40) * 1.5 : 0; g.save(); g.translate(rd(sh), 0); g.drawImage(pomponBigHead(), 0, 0); g.drawImage(pomponBangs(), 0, 0); if (CUT.li >= 1) pomponGum(g, 128, 96, t, 2); g.restore(); if (CUT.li >= 1) shout(g, '¡CHICLE!', 200, 40, CUT.lineT); } },
    { dur: 0, lines: [['anahi', 'Respira, Pompón. Cuidado, calma y detalle.'], ['anahi', 'Tú sonríe al espejo… ¡que de las tijeras me encargo yo!']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 190, 170, CUT.li === 1 ? 'ready' : 'talk', t); pomponDraw(g, 110, 166, 'lose'); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawPortalFrame(g, 'mirror', 64, 24, 128, 96, t); rect(g, 64, 24, 128, 96, '#dfe9ee'); drawS(g, pomponHead('idle'), 128, 118, { ax: .5, ay: 1 }); drawS(g, scissorsSpr(), 170, 40 + Math.sin(t * 6) * 3, { s: 2, rot: -.6 + Math.sin(t * 20) * .2 }); } },
  ],
});
defCut('pompon_out', {
  song: { spb: 4, loop: true, tracks: POMPON_SONGS.card.tracks.concat([]) },
  shots: [
    { dur: 0, sfx: [[.2, 'slam'], [.5, 'sparkle']], lines: [['pompon', '¡¡Gracias, Barcelonaaa!! ¡Os quiero, perretes!'], ['publico', '¡POM-PÓN! ¡POM-PÓN! ¡POM-PÓN!']],
      top(g, t) { const S = { pt: t, pb: t * 2.1, react: 'clear', reactT: t, phase: 'inter', topFx: null }; pomponRoomTop(g, S); },
      bot(g, t) { g.drawImage(pomponCurtainBg(), 0, 0); for (let i = 0; i < 24; i++) { const x = (i * 29 + t * 40) % SW, y = (i * 41 + t * 90) % SH; rect(g, x, y, 2, 3, [C.yellow, C.pink, C.mint, C.sky][i % 4]); } mord(g, '¡BRAVO!', SW / 2, 70, { u: 2.4, r: 2.5, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] }, { anim: i => ({ dy: Math.sin(t * 6 + i) * 3 }) }); } },
    { dur: 0, sfx: [[1.2, 'bad']], lines: [['vanesa', '¡Quietos todos! Soy… eh… ¡POMPÓN! ¡La auténtica!'], ['publico', '¡¡BUUUUUU!!'], ['vanesa', '¡Esto no quedará así! ¡Ni esta peluca!']],
      top(g, t) { g.drawImage(pomponArenaBg(), 0, 0); pomponDrawVanesa(g, 128 + (CUT.li === 2 ? (t * 220) : 0), 160, CUT.li === 0 ? 'wig' : 'booed', { flip: CUT.li === 2 }); pomponCrowd(g, 158, t * 2, t, CUT.li >= 1 ? 1 : 0); if (CUT.li >= 1) for (let i = 0; i < 6; i++) { const k = (t * 1.3 + i / 6) % 1; drawS(g, pomponBiscuit(), 30 + i * 40 + k * 20, 170 - Math.sin(k * Math.PI) * 120, { rot: t * 8 + i }); } if (CUT.li === 1) shout(g, '¡BUUU!', 60, 60, CUT.lineT); },
      bot(g, t) { g.drawImage(pomponCurtainBg(), 0, 0); g.drawImage(pomponBigHead(), 0, 24); if (CUT.li >= 1) for (let i = 0; i < 3; i++) drawStar(g, 60 + i * 68, 40 + Math.sin(t * 6 + i) * 4, 4, '#fff27a'); } },
    { dur: 0, lines: [['pompon', '¡Vanesa, pásate un día por Westie BLVRD!'], ['pompon', 'Ese pelo pide a gritos un buen corte. ¡Con cariño, eh!'], ['narr', 'Y así, Pompón siguió siendo la número 1… con flequillo de gala.']],
      top(g, t) { g.drawImage(pomponArenaBg(), 0, 0); pomponBeams(g, t); pomponDraw(g, 128, 160, CUT.li === 1 ? 'ready' : 'win', { jump: Math.abs(Math.sin(t * 5)) * 5 }); pomponCrowd(g, 158, t * 2, t, 1); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawPortalFrame(g, 'mirror', 64, 24, 128, 96, t); rect(g, 64, 24, 128, 96, '#dfe9ee'); drawS(g, pomponHead('win'), 128, 118, { ax: .5, ay: 1 }); rosette(g, 180, 70, '#ff5d9e', '#ffffff'); } },
  ],
});
// a dog biscuit (thrown by the crowd, also the treat in "chuches")
function pomponBiscuit() { return mdl('pomponBiscuit', () => spr(['.kk...kk.', 'kyyk.kyyk', 'kyYykyYyk', '.kyYYYyk.', 'kyYykyYyk', 'kyyk.kyyk', '.kk...kk.'], { k: INK, y: '#d58c4c', Y: '#f2b978' })); }

// a stretchy blob of mint bubblegum tangled in the fringe (with strings)
function pomponGum(g, x, y, t, s = 1) {
  const blobs = [[-12, 0, 6], [-4, -2, 7], [5, 1, 6.5], [13, -1, 5], [0, 5, 5]];
  for (const [dx, dy, r] of blobs) disc(g, x + dx * s, y + dy * s, r * s + 1, INK);
  for (const [dx, dy, r] of blobs) disc(g, x + dx * s, y + dy * s, r * s, '#7fe3b0');
  for (const [dx, dy, r] of blobs) { disc(g, x + (dx - 1.5) * s, y + (dy - 1.5) * s, r * s * .45, '#c8ffe0'); px(g, x + (dx - 2) * s, y + (dy - 2) * s, '#ffffff'); }
  // strings stretching down
  for (let i = 0; i < 3; i++) { const sx = x + (-8 + i * 8) * s, len = (10 + Math.sin(t * 3 + i) * 3) * s; for (let q = 0; q < len; q++) px(g, sx + Math.sin(q * .4 + i) * s, y + 5 * s + q, q % 3 ? '#7fe3b0' : '#c8ffe0'); }
}

// ---------------------------------------------------------------- chibi -----
