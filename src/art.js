// ============================================================================
//  art — the cast. Models are built from SDF parts (see gfx MODEL) and cached;
//  faces are painted on top by hand, pixel by pixel, per expression.
// ============================================================================
'use strict';

// eyes shared by the dogs: (x, y) is the top-left of a 5x5 eye
function dogEye(g, x, y, kind, K = RAMP.black) {
  switch (kind) {
    case 'happy': hline(g, x, x + 4, y + 2, K[0]); px(g, x - 1, y + 3, K[0]); px(g, x + 5, y + 3, K[0]); hline(g, x + 1, x + 3, y + 1, K[0]); return;
    case 'closed': hline(g, x, x + 4, y + 3, K[0]); px(g, x - 1, y + 2, K[0]); px(g, x + 5, y + 2, K[0]); return;
    case 'sad': rect(g, x, y + 2, 5, 3, K[0]); px(g, x + 1, y + 2, '#fff'); hline(g, x - 1, x + 2, y + (x < 32 ? 0 : 1), K[1]); hline(g, x + 3, x + 5, y + (x < 32 ? 1 : 0), K[1]); return;
    case 'wow': rect(g, x, y - 1, 5, 6, K[0]); rect(g, x + 1, y, 3, 4, K[1]); px(g, x + 1, y, '#fff'); px(g, x + 2, y, '#fff'); px(g, x + 3, y + 3, '#fff'); return;
    case 'spiral': rect(g, x, y, 5, 5, '#fff'); ringPx(g, x + 2.5, y + 2.5, 2.2, K[0]); px(g, x + 2, y + 2, K[0]); return;
    case 'x': linePx(g, x, y, x + 4, y + 4, K[0]); linePx(g, x + 4, y, x, y + 4, K[0]); return;
    case 'grr': rect(g, x, y + 2, 5, 3, K[0]); px(g, x + 1, y + 2, '#fff'); return;
    case 'heart': drawHeart(g, x + 2.5, y + 2, RAMP.pink[2], .9); px(g, x + 1, y + 1, '#fff'); return;
    case 'star': drawStar(g, x + 2.5, y + 2.5, 3.4, RAMP.yellow[3]); return;
    default: // round shiny eye
      rect(g, x + 1, y, 3, 5, K[0]); rect(g, x, y + 1, 5, 3, K[0]);
      rect(g, x + 1, y + 1, 3, 3, K[1]); px(g, x + 1, y + 1, '#ffffff'); px(g, x + 2, y + 1, '#ffffff'); px(g, x + 1, y + 2, '#ffffff'); px(g, x + 3, y + 3, K[3]);
  }
}

// ---------------------------------------------------------------- BULE ------
// The westie from the Westie BLVRD crest. Front view head, 64x60.
function buleHeadBase(F = RAMP.fur) {
  return mdl('buleHead' + F[0], () => {
    const earLs = SD.grow(SD.poly([[15.5, 22], [18, 2.5], [29.5, 13]]), 1.8), earRs = SD.grow(SD.poly([[48.5, 22], [46, 2.5], [34.5, 13]]), 1.8);
    const inL = SD.grow(SD.poly([[19.5, 17], [19.8, 7.5], [26, 13.5]]), .3), inR = SD.grow(SD.poly([[44.5, 17], [44.2, 7.5], [38, 13.5]]), .3);
    const headS = SD.ellipse(32, 29.5, 20, 17.5);
    const head = SD.shag(SD.tufts(headS, 32, 30, 2.6, 15, .7, 1.5), .9, .3, 3);
    const cheekS = SD.union(SD.ellipse(21, 38.5, 10, 8), SD.ellipse(43, 38.5, 10, 8));
    const cheeks = SD.shag(SD.tufts(cheekS, 32, 36, 2.2, 22, 2.3, 1.7), .8, .35, 8);
    const beardS = SD.ellipse(32, 45.5, 8.5, 5.5);
    const beard = SD.tufts(beardS, 32, 42, 1.8, 12, .4, 2);
    const muzzle = SD.ellipse(32, 38, 8.4, 6.2);
    const t1 = clumpTex(5, .34, 3, 1.35), t2 = clumpTex(4, .3, 5, 1.2), t3 = clumpTex(3.5, .22, 9, 1.5);
    return model(64, 60, [
      { f: earLs, ramp: F, z: 0, th: 5, tex: t3 }, { f: earRs, ramp: F, z: 0, th: 5, tex: t3 },
      { f: inL, ramp: RAMP.pink, z: .5, th: 3, amb: .55, dif: .25, edge: false, out: false }, { f: inR, ramp: RAMP.pink, z: .5, th: 3, amb: .55, dif: .25, edge: false, out: false },
      { f: head, fs: headS, ramp: F, z: 1, th: 16, tex: t1 },
      { f: beard, fs: beardS, ramp: F, z: 2, th: 6, tex: t3 },
      { f: cheeks, fs: cheekS, ramp: F, z: 2.5, th: 9, tex: t2 },
      { f: muzzle, ramp: F, z: 3, th: 7, amb: .42, tex: t3 },
      { f: SD.box(32, 34.6, 4.6, 3.3, 2.6), ramp: RAMP.black, z: 4, th: 3, gloss: true, amb: .3 },
    ]);
  });
}
// expressions painted over the base: normal, happy, wow, sad, wink, grr, dizzy, love
function buleHead(ex = 'normal', F = RAMP.fur) {
  return mdl('buleHead:' + ex + F[0], () => {
    const base = buleHeadBase(F), c = mkCanvas(base.width, base.height), g = c.g;
    g.drawImage(base, 0, 0);
    const K = RAMP.black;
    // a soft shadow under the brow fur
    for (const bx of [21, 38]) { px(g, bx, 26, F[2]); hline(g, bx + 1, bx + 3, 25, F[2]); px(g, bx + 4, 26, F[2]); }
    const eyes = { normal: ['', ''], happy: ['happy', 'happy'], wow: ['wow', 'wow'], sad: ['sad', 'sad'], wink: ['', 'closed'], grr: ['grr', 'grr'], dizzy: ['spiral', 'spiral'], love: ['heart', 'heart'], ko: ['x', 'x'] }[ex] || ['', ''];
    dogEye(g, 21, 27, eyes[0]); dogEye(g, 38, 27, eyes[1]);
    // mouth
    const P = RAMP.pink;
    if (ex === 'happy' || ex === 'wink' || ex === 'love') {
      hline(g, 29, 35, 41, K[0]); px(g, 28, 40, K[0]); px(g, 36, 40, K[0]);
      rect(g, 30, 42, 5, 4, P[2]); rect(g, 31, 42, 3, 1, P[1]); vline(g, 32, 43, 44, P[1]); hline(g, 31, 33, 46, P[0]);
    } else if (ex === 'wow') {
      rect(g, 30, 40, 5, 5, K[0]); rect(g, 31, 43, 3, 2, P[2]);
    } else if (ex === 'sad' || ex === 'ko' || ex === 'dizzy') {
      hline(g, 29, 35, 42, K[0]); px(g, 28, 43, K[0]); px(g, 36, 43, K[0]);
    } else if (ex === 'grr') {
      hline(g, 28, 36, 40, K[0]); for (const tx of [29, 31, 33, 35]) px(g, tx, 41, '#ffffff'); hline(g, 28, 36, 42, K[0]);
    } else {
      vline(g, 32, 38, 40, K[0]); hline(g, 29, 31, 41, K[0]); hline(g, 33, 35, 41, K[0]); px(g, 28, 40, K[1]); px(g, 36, 40, K[1]);
    }
    return c;
  });
}

// ---------------------------------------------------------------- ANAHÍ -----
// Upper body (she works behind the grooming table), 64x76. Poses move the arms
// (two-bone IK from the shoulders); the face is painted per expression.
const ANA_POSES = {
  //        left hand     right hand    expr      tools: l / r
  idle: { l: [21, 60], r: [44, 57], ex: 'smile', tl: 'comb', tr: 'scissors' },
  ready: { l: [19, 62], r: [50, 33], ex: 'wink', tl: 'comb', tr: 'scissorsUp' },
  win: { l: [11, 25], r: [53, 23], ex: 'joy', tl: 'comb', tr: 'scissorsUp' },
  lose: { l: [25, 31], r: [39, 31], ex: 'shock', tl: null, tr: null },
  speed: { l: [18, 62], r: [55, 43], ex: 'focus', tl: 'comb', tr: 'scissors' },
  boss: { l: [16, 44], r: [48, 44], ex: 'gasp', tl: 'comb', tr: 'scissors' },
  clear: { l: [9, 21], r: [55, 20], ex: 'joy', tl: 'comb', tr: 'scissorsUp' },
  over: { l: [23, 66], r: [41, 66], ex: 'cry', tl: null, tr: null },
  talk: { l: [21, 63], r: [52, 42], ex: 'talk', tl: null, tr: null },
  think: { l: [21, 63], r: [37, 32], ex: 'hmm', tl: null, tr: null },
};
function ik2(sx, sy, hx, hy, L1, L2, bend) {
  const d = Math.min(L1 + L2 - .01, Math.hypot(hx - sx, hy - sy)), a = Math.atan2(hy - sy, hx - sx);
  const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), A = Math.acos(cosA);
  const e = a + A * bend; return [sx + Math.cos(e) * L1, sy + Math.sin(e) * L1];
}
function anahiBody(pose = 'idle') {
  return mdl('anahi:' + pose, () => {
    const P = ANA_POSES[pose] || ANA_POSES.idle, SK = RAMP.skin, HR = RAMP.hair, BL = RAMP.black, GR = RAMP.green;
    const W = 64, H = 76, cx0 = 32;
    const sL = [22.5, 42.5], sR = [41.5, 42.5];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 12, 13, -1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 12, 13, 1);
    const head = SD.smooth(3, SD.ellipse(cx0, 19.6, 9.3, 10.3), SD.ellipse(cx0, 25.2, 6.3, 6.6));
    const hairCap = SD.sub(SD.ellipse(cx0, 16.3, 10.4, 9.9), SD.ellipse(cx0, 27.5, 10.3, 13.2));
    const bun = SD.circle(cx0, 4.8, 5.6), bunTie = SD.box(cx0, 9.6, 3.6, 1.1, .5);
    const earL = SD.ellipse(cx0 - 9.8, 21.5, 1.9, 2.8), earR = SD.ellipse(cx0 + 9.8, 21.5, 1.9, 2.8);
    const neck = SD.box(cx0, 33.5, 2.8, 4, 1);
    const torso = SD.smooth(3.5, SD.ellipse(cx0, 44.5, 11.8, 5), SD.poly([[cx0 - 10.5, 44], [cx0 + 10.5, 44], [cx0 + 8.2, 63], [cx0 + 9.5, 80], [cx0 - 9.5, 80], [cx0 - 8.2, 63]]));
    const apron = SD.grow(SD.poly([[cx0 - 6.5, 48.5], [cx0 + 6.5, 48.5], [cx0 + 7.2, 58], [cx0 + 9, 80], [cx0 - 9, 80], [cx0 - 7.2, 58]]), .8);
    const sleeveL = SD.capsule(sL[0], sL[1], lerp(sL[0], eL[0], .55), lerp(sL[1], eL[1], .55), 4.2, 3.6);
    const sleeveR = SD.capsule(sR[0], sR[1], lerp(sR[0], eR[0], .55), lerp(sR[1], eR[1], .55), 4.2, 3.6);
    const armL = SD.union(SD.capsule(sL[0], sL[1], eL[0], eL[1], 3, 2.6), SD.capsule(eL[0], eL[1], P.l[0], P.l[1], 2.6, 2.2));
    const armR = SD.union(SD.capsule(sR[0], sR[1], eR[0], eR[1], 3, 2.6), SD.capsule(eR[0], eR[1], P.r[0], P.r[1], 2.6, 2.2));
    const handL = SD.circle(P.l[0], P.l[1], 2.9), handR = SD.circle(P.r[0], P.r[1], 2.9);
    const armsFront = pose === 'lose' || pose === 'think'; // hands on the face sit in front
    const hairTex = (x, y) => (Math.sin((x - cx0) * 1.7 + y * .35) * .06);
    const c = model(W, H, [
      { f: bun, ramp: HR, z: 0, th: 5, tex: hairTex },
      { f: bunTie, ramp: RAMP.green, z: .5, th: 2 },
      { f: torso, ramp: BL, z: 1, th: 12 },
      { f: apron, ramp: GR, z: 1.5, th: 6, edge: true },
      { f: neck, ramp: SK, z: 1.2, th: 3, amb: .2 },
      { f: earL, ramp: SK, z: 1.8, th: 2 }, { f: earR, ramp: SK, z: 1.8, th: 2 },
      { f: head, ramp: SK, z: 2, th: 10, amb: .32 },
      { f: hairCap, ramp: HR, z: 2.5, th: 7, tex: hairTex },
      { f: armL, ramp: SK, z: armsFront ? 4 : 1.7, th: 3 }, { f: armR, ramp: SK, z: armsFront ? 4 : 1.7, th: 3 },
      { f: sleeveL, ramp: BL, z: armsFront ? 4.2 : 1.9, th: 4 }, { f: sleeveR, ramp: BL, z: armsFront ? 4.2 : 1.9, th: 4 },
      { f: handL, ramp: SK, z: armsFront ? 4.5 : 3, th: 2.5, amb: .35 }, { f: handR, ramp: SK, z: armsFront ? 4.5 : 3, th: 2.5, amb: .35 },
    ]);
    const g = c.g;
    anahiFace(g, cx0, P.ex);
    // apron: neck strap, WB monogram, waist tie, pocket
    linePx(g, cx0 - 6, 48, cx0 - 3, 38, GR[1]); linePx(g, cx0 + 6, 48, cx0 + 3, 38, GR[1]);
    tiny(g, 'WB', cx0 - 3, 51, RAMP.cream[3]); hline(g, cx0 - 3, cx0 + 3, 57, RAMP.gold[2]);
    hline(g, cx0 - 9, cx0 + 9, 61, GR[0]); hline(g, cx0 - 9, cx0 + 9, 62, GR[3]);
    rect(g, cx0 - 5, 66, 10, 1, GR[1]); rect(g, cx0 - 5, 67, 1, 5, GR[1]); rect(g, cx0 + 4, 67, 1, 5, GR[1]);
    // gold bangle on the right wrist, hoop earrings
    const wx = lerp(eR[0], P.r[0], .72), wy = lerp(eR[1], P.r[1], .72);
    px(g, wx - 1, wy, RAMP.gold[3]); px(g, wx, wy, RAMP.gold[4]); px(g, wx + 1, wy, RAMP.gold[2]);
    px(g, cx0 - 10, 25, RAMP.gold[3]); px(g, cx0 + 10, 25, RAMP.gold[3]);
    return c;
  });
}
// the face: brows, lined eyes, blush, red lips — drawn by hand for each mood
function anahiFace(g, cx0, ex) {
  const K = '#1b1016', SK = RAMP.skin, L = RAMP.red, HR = RAMP.hair;
  // hair: centre parting + shine
  vline(g, cx0, 8, 11, HR[3]); px(g, cx0 - 4, 9, HR[4]); px(g, cx0 - 5, 10, HR[4]); px(g, cx0 + 5, 10, HR[3]);
  const ey = 20, lx = cx0 - 6, rx = cx0 + 3;
  const brow = (x, dy, flip) => { const pts = flip ? [[x, 16 + dy], [x + 1, 15 + dy], [x + 2, 15 + dy], [x + 3, 16 + dy]] : [[x, 16 + dy], [x + 1, 15 + dy], [x + 2, 15 + dy], [x + 3, 16 + dy]]; for (const [a, b] of pts) px(g, a, b, K); };
  const eyeOpen = (x, look = 0) => {
    rect(g, x, ey - 1, 4, 1, K); px(g, x + (x < cx0 ? -1 : 4), ey - 2, K); // lid line + liner flick
    rect(g, x, ey, 4, 3, '#ffffff'); rect(g, x + 1 + look, ey, 2, 3, '#2b1a1a'); px(g, x + 1 + look, ey, '#ffffff'); px(g, x + 2 + look, ey + 2, '#4a2a22');
    hline(g, x, x + 3, ey + 3, SK[2]);
  };
  const eyeHappy = x => { px(g, x, ey + 1, K); hline(g, x + 1, x + 2, ey, K); px(g, x + 3, ey + 1, K); px(g, x + (x < cx0 ? -1 : 4), ey, K); };
  const eyeClosed = x => { hline(g, x, x + 3, ey + 1, K); px(g, x + (x < cx0 ? -1 : 4), ey, K); };
  const blush = () => { for (const bx of [cx0 - 8, cx0 + 5]) { px(g, bx, 24, RAMP.pink[3]); px(g, bx + 2, 24, RAMP.pink[3]); px(g, bx + 1, 25, RAMP.pink[3]); } };
  const lips = (kind) => {
    const y = 27;
    if (kind === 'o') { rect(g, cx0 - 1, y - 1, 3, 3, L[1]); px(g, cx0, y, '#3e0d1c'); return; }
    if (kind === 'open') { hline(g, cx0 - 2, cx0 + 2, y - 1, L[2]); rect(g, cx0 - 2, y, 5, 2, '#3e0d1c'); hline(g, cx0 - 1, cx0 + 1, y + 1, RAMP.pink[2]); hline(g, cx0 - 2, cx0 + 2, y + 2, L[2]); return; }
    if (kind === 'sad') { hline(g, cx0 - 1, cx0 + 1, y, L[2]); px(g, cx0 - 2, y + 1, L[1]); px(g, cx0 + 2, y + 1, L[1]); return; }
    if (kind === 'flat') { hline(g, cx0 - 2, cx0 + 2, y, L[1]); px(g, cx0, y + 1, L[2]); return; }
    // smile
    px(g, cx0 - 3, y - 1, L[1]); hline(g, cx0 - 2, cx0 + 2, y, L[2]); px(g, cx0 + 3, y - 1, L[1]); hline(g, cx0 - 1, cx0 + 1, y + 1, L[1]); px(g, cx0 - 1, y, L[3]);
  };
  px(g, cx0, 24, SK[2]); px(g, cx0 + 1, 23, SK[1] === undefined ? SK[2] : SK[2]); // nose
  switch (ex) {
    case 'wink': brow(lx, 0); brow(rx, -1, 1); eyeOpen(lx); eyeClosed(rx); blush(); lips('smile'); break;
    case 'joy': brow(lx, -1); brow(rx, -1, 1); eyeHappy(lx); eyeHappy(rx); blush(); lips('open'); break;
    case 'shock': brow(lx, -2); brow(rx, -2, 1); eyeOpen(lx); eyeOpen(rx); lips('o'); rect(g, cx0 + 9, 14, 1, 3, '#9bd6f7'); px(g, cx0 + 9, 17, '#dff4ff'); break;
    case 'focus': brow(lx, 1); brow(rx, 1, 1); eyeOpen(lx, 1); eyeOpen(rx, 1); lips('flat'); break;
    case 'gasp': brow(lx, -2); brow(rx, -2, 1); eyeOpen(lx); eyeOpen(rx); lips('open'); break;
    case 'cry': brow(lx, 0); brow(rx, 0, 1); eyeClosed(lx); eyeClosed(rx); vline(g, lx + 1, ey + 2, ey + 5, '#9bd6f7'); vline(g, rx + 2, ey + 2, ey + 5, '#9bd6f7'); lips('sad'); break;
    case 'talk': brow(lx, 0); brow(rx, 0, 1); eyeOpen(lx); eyeOpen(rx); blush(); lips('open'); break;
    case 'hmm': brow(lx, 1); brow(rx, -1, 1); eyeOpen(lx, 1); eyeOpen(rx, 1); lips('flat'); break;
    default: brow(lx, 0); brow(rx, 0, 1); eyeOpen(lx); eyeOpen(rx); blush(); lips('smile');
  }
}
// tools
function scissorsSpr() {
  return mdl('scissors', () => spr([
    '..kk.......',
    '.kbbk......',
    'kb..bk.....',
    'kb..bkkk...',
    '.kbbkswsk..',
    '..kkkkwwsk.',
    '.kbbkswsssk',
    'kb..bkkkkk.',
    'kb..bk.....',
    '.kbbk......',
    '..kk.......'], { k: INK, b: '#3565cc', s: '#a5afc4', w: '#e1e7f2' }));
}
function combSpr() {
  return mdl('comb', () => spr([
    'kkkkkkkkkkk',
    'kyyyYYYYYyk',
    'kkkkkkkkkkk',
    'k.k.k.k.k.k',
    'k.k.k.k.k.k',
    'k.k.k.k.k.k'], { k: INK, y: RAMP.gold[3], Y: RAMP.gold[4] }));
}
function drawAnahi(g, x, y, pose, t = 0, o = {}) {
  const P = ANA_POSES[pose] || ANA_POSES.idle, img = anahiBody(pose);
  const bob = o.bob != null ? o.bob : 0;
  const X = rd(x - 32), Y = rd(y - 76 + bob);
  g.drawImage(img, X, Y);
  // tools in the hands
  if (P.tr === 'scissors') drawS(g, scissorsSpr(), X + P.r[0] + 2, Y + P.r[1] - 1, { rot: -.5 + Math.sin(t * 20) * (o.snip ? .25 : 0) });
  if (P.tr === 'scissorsUp') drawS(g, scissorsSpr(), X + P.r[0] + 1, Y + P.r[1] - 5, { rot: -1.9 + Math.sin(t * 22) * .12 });
  if (P.tl === 'comb') drawS(g, combSpr(), X + P.l[0] - 3, Y + P.l[1] - 3, { rot: -.25 });
}

// ---------------------------------------------------------------- westie body
// Side view, facing right; k scales the whole dog (1 → 88x64). pose:
// stand | wag | wet | sit ; mood painted: normal | happy | sad | itchy | wow
function westieSide(k = 1, pose = 'stand', mood = 'normal', ramp = RAMP.fur) {
  return mdl('wside:' + k + pose + mood + ramp[0], () => {
    const F = ramp, W = Math.ceil(88 * k), H = Math.ceil(64 * k), s = v => v * k;
    const wet = pose === 'wet';
    const fuzz = wet ? .4 : 1.6;
    const bodyS = SD.ellipse(s(40), s(35), s(21), s(12.5));
    const body = SD.shag(SD.tufts(bodyS, s(40), s(30), s(fuzz * 1.3), 26, 2, 1.6), s(fuzz * .5), .35 / k, 4);
    const skirt = SD.tufts(SD.ellipse(s(40), s(43), s(17), s(5)), s(40), s(38), s(fuzz * 1.8), 20, 1, 2.5);
    const chestS = SD.ellipse(s(59), s(36), s(9), s(11.5));
    const chest = SD.tufts(chestS, s(59), s(36), s(fuzz * 1.4), 16, .6, 1.8);
    const headS = SD.ellipse(s(66), s(20), s(12), s(11));
    const head = SD.tufts(headS, s(66), s(20), s(fuzz * 1.5), 18, 1.4, 1.6);
    const muzzle = SD.smooth(s(2), SD.ellipse(s(76.5), s(25), s(7), s(5.2)), SD.ellipse(s(73), s(29), s(5), s(3.5)));
    const earN = SD.grow(SD.poly([[s(63), s(12)], [s(67), s(wet ? 4 : 1)], [s(71), s(11)]]), s(1.2));
    const earF = SD.grow(SD.poly([[s(57), s(12)], [s(59), s(wet ? 5 : 2)], [s(64), s(10)]]), s(1.1));
    const legFN = SD.capsule(s(59), s(42), s(60), s(56), s(3.6), s(3.2)), legFF = SD.capsule(s(54), s(42), s(54), s(56), s(3.3), s(3));
    const legBN = SD.smooth(s(2), SD.ellipse(s(27), s(40), s(7), s(8)), SD.capsule(s(25), s(44), s(24), s(56), s(3.8), s(3.2)));
    const legBF = SD.capsule(s(33), s(44), s(32), s(56), s(3.4), s(3));
    const pawFN = SD.ellipse(s(61), s(57), s(4), s(2.3)), pawBN = SD.ellipse(s(25), s(57), s(4.2), s(2.3));
    const tailA = pose === 'wag' ? -.35 : wet ? .6 : 0;
    const tail = SD.curve([s(21), s(29)], [s(14 + tailA * 6), s(20)], [s(15 + tailA * 14), s(9 + Math.abs(tailA) * 4)], s(4), s(1.8));
    const tx = clumpTex(Math.max(2.5, 4.5 * k), .3, 3, 1.3), tx2 = clumpTex(Math.max(2.2, 3.5 * k), .25, 7, 1.5);
    const D = F.map(c => mixHex(c, '#6c6f9a', .3));
    const c = model(W, H, [
      { f: legFF, ramp: D, z: 0, th: s(3) }, { f: legBF, ramp: D, z: 0, th: s(3) },
      { f: earF, ramp: D, z: .3, th: s(3) },
      { f: tail, ramp: F, z: .5, th: s(3), tex: tx2 },
      { f: body, fs: bodyS, ramp: F, z: 1, th: s(12), tex: tx },
      { f: skirt, ramp: F, z: 1.2, th: s(4), tex: tx2 },
      { f: legBN, ramp: F, z: 1.5, th: s(5), tex: tx2 },
      { f: legFN, ramp: F, z: 2, th: s(3.5), tex: tx2 },
      { f: pawFN, ramp: F, z: 2.1, th: s(2) }, { f: pawBN, ramp: F, z: 1.6, th: s(2) },
      { f: chest, fs: chestS, ramp: F, z: 2.2, th: s(8), tex: tx },
      { f: head, fs: headS, ramp: F, z: 3, th: s(10), tex: tx },
      { f: earN, ramp: F, z: 3.2, th: s(3) },
      { f: muzzle, ramp: F, z: 3.5, th: s(5), amb: .4, tex: tx2 },
      { f: SD.ellipse(s(82.5), s(23.2), s(2.6), s(2.1)), ramp: RAMP.black, z: 4, th: s(2), gloss: true },
    ]);
    const g = c.g, K = RAMP.black[0], P = RAMP.pink;
    // eye + mouth, scaled by hand
    const ex = rd(s(72)), ey = rd(s(17));
    if (mood === 'happy') { px(g, ex - 1, ey + 1, K); px(g, ex, ey, K); px(g, ex + 1, ey + 1, K); }
    else if (mood === 'sad') { rect(g, ex - 1, ey + 1, 2, 2, K); px(g, ex - 2, ey - 1, K); px(g, ex - 1, ey, K); }
    else if (mood === 'wow') { rect(g, ex - 1, ey - 1, 3, 4, K); px(g, ex, ey, '#fff'); }
    else if (mood === 'itchy') { linePx(g, ex - 1, ey - 1, ex + 1, ey + 1, K); linePx(g, ex + 1, ey - 1, ex - 1, ey + 1, K); }
    else { rect(g, ex - 1, ey, 2, Math.max(2, rd(s(3))), K); px(g, ex - 1, ey, '#ffffff'); }
    const my = rd(s(29));
    if (mood === 'happy' || mood === 'wow') { hline(g, rd(s(74)), rd(s(80)), my, K); rect(g, rd(s(75)), my + 1, Math.max(2, rd(s(3))), Math.max(2, rd(s(3.5))), P[2]); }
    else if (mood === 'itchy') { for (let i = 0; i < 3; i++) px(g, rd(s(75)) + i * 2, my, K); }
    else hline(g, rd(s(76)), rd(s(80)), my, K);
    return c;
  });
}
// sitting, front view: body under the big head (photo corner, bath), 64x96
function westieSitBody() {
  return mdl('wsitbody', () => {
    const F = RAMP.fur;
    const bodyS = SD.ellipse(32, 26, 16, 15);
    const body = SD.tufts(bodyS, 32, 22, 2, 22, .8, 1.6);
    const legL = SD.capsule(24, 26, 23, 40, 4.4, 4), legR = SD.capsule(40, 26, 41, 40, 4.4, 4);
    const pawL = SD.ellipse(23, 41, 5, 3), pawR = SD.ellipse(41, 41, 5, 3);
    const haunchL = SD.ellipse(15, 34, 6, 8), haunchR = SD.ellipse(49, 34, 6, 8);
    const tx = clumpTex(4.5, .3, 11, 1.3);
    return model(64, 46, [
      { f: haunchL, ramp: F, z: 0, th: 5, tex: tx }, { f: haunchR, ramp: F, z: 0, th: 5, tex: tx },
      { f: body, fs: bodyS, ramp: F, z: 1, th: 12, tex: tx },
      { f: legL, ramp: F, z: 2, th: 4, tex: tx }, { f: legR, ramp: F, z: 2, th: 4, tex: tx },
      { f: pawL, ramp: F, z: 2.5, th: 2.5 }, { f: pawR, ramp: F, z: 2.5, th: 2.5 },
    ]);
  });
}
function drawWestieSit(g, x, y, ex = 'normal', o = {}) {
  // (x, y) = centre of the base of the paws
  const tilt = o.tilt || 0;
  drawS(g, westieSitBody(), x, y, { ax: .5, ay: 1, sx: o.sx || 1, sy: o.sy || 1 });
  drawS(g, buleHead(ex), x + tilt * 4, y - 36 * (o.sy || 1), { ax: .5, ay: .75, rot: tilt * .18 });
}
// life icon: a westie waiting for its turn (18x16), with a sad variant
function lifeWestie(sad) {
  return mdl('lifeW' + (sad ? 's' : ''), () => spr([
    '..k..........k....',
    '.kwk........kwk...',
    '.kpwk......kwpk...',
    'kwwwwkkkkkkwwwwk..',
    'kwwwwwwwwwwwwwwgk.',
    'kwwwwwwwwwwwwwwgk.',
    sad ? 'kwwkkwwwwwwkkwwgk.' : 'kwwkkwwwwwwkkwwgk.',
    sad ? 'kwwwwwwwwwwwwwwgk.' : 'kwwkkwwwwwwkkwwgk.',
    'kwwwwwwkkkwwwwwgk.',
    '.kwwwwwwkwwwwwgk..',
    sad ? '.kwwwwwkwkwwwwgk..' : '.kwwwwkkpkkwwwgk..',
    '..kwwwwwwwwwwgk...',
    '...kkgggggggkk....',
    '....kkkkkkkkk.....'], { k: INK, w: '#ffffff', g: '#b3b8d4', p: RAMP.pink[2] }));
}

// Anahí's legs (black trousers + sneakers) so she can stand on the salon floor
function anahiLegs(pose = 'stand') {
  return mdl('anaLegs:' + pose, () => {
    const BL = RAMP.black, spread = pose === 'jump' ? 3 : 0;
    const hips = SD.box(32, 3, 9.5, 5, 3);
    const legL = SD.capsule(28 - spread, 4, 27 - spread * 1.6, 30, 3.8, 3.2), legR = SD.capsule(36 + spread, 4, 37 + spread * 1.6, 30, 3.8, 3.2);
    const shoeL = SD.box(26 - spread * 1.6, 33, 4.6, 2.4, 1.8), shoeR = SD.box(38 + spread * 1.6, 33, 4.6, 2.4, 1.8);
    return model(64, 37, [
      { f: hips, ramp: BL, z: 0, th: 5 }, { f: legL, ramp: BL, z: 1, th: 4 }, { f: legR, ramp: BL, z: 1, th: 4 },
      { f: shoeL, ramp: RAMP.steel, z: 2, th: 2 }, { f: shoeR, ramp: RAMP.steel, z: 2, th: 2 },
    ]);
  });
}
// full figure: feet at (x, y)
function drawAnahiFull(g, x, y, pose, t = 0, o = {}) {
  const jump = o.jump || 0, bob = o.bob || 0;
  g.drawImage(anahiLegs(jump > 0 ? 'jump' : 'stand'), rd(x - 32), rd(y - 36 - jump));
  drawAnahi(g, x, y - 30 - jump + bob, pose, t, o);
}
