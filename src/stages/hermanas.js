// ============================================================================
//  Stage — KIRA & NALA · ¡DIBUJA!  "Pastoras de playa"
//  Two Australian shepherd sisters (a blue merle and a red merle) who herd
//  anything that moves… and a seagull that stole their frisbee.
//  (A tribute to Kat & Ana of WarioWare: Touched!, the drawing stage.)
// ============================================================================
'use strict';

// the display font has no '&' yet: add one (only if missing) for "KIRA & NALA"
if (typeof MORD_SRC !== 'undefined' && !MORD_SRC['&']) MORD_SRC['&'] = { w: 6.4, s: [[[6.2, 10], [1.6, 4.2], ..._arc(3.1, 2.4, 2, 2.2, 160, 380, 10).slice(1), [1.2, 6.8], ..._arc(3.3, 7.6, 3, 2.4, 190, 60, 10).slice(1), [6.4, 5.4]]] };

// ---------------------------------------------------------------- coats -----
const HERMANAS_AUS = {
  kira: { base: ['#2a2f40', '#4d5670', '#7b87a0', '#a9b4c8', '#d4dbe6'], dark: ['#0e0b16', '#1b1627', '#2b2540', '#3d3656', '#524a70'], nose: RAMP.black, eyeN: '#4f9ff0', eyeF: '#7c3f1f', band: ['#1a2a6b', '#233b8c', '#3565cc', '#63a0ef', '#b3d9ff'], seed: 3 },
  nala: { base: ['#5a2c1e', '#8c4c33', '#bd7c56', '#dfa77e', '#f5d2ad'], dark: ['#361208', '#5a2410', '#7e3a1c', '#9e532e', '#b96c42'], nose: ['#2a1210', '#4a2018', '#6e3226', '#8e4a38', '#a8604a'], eyeN: '#e2a21b', eyeF: '#e2a21b', band: ['#4a0f1e', '#8c1d30', '#d0344a', '#f06a6a', '#ffb0a0'], seed: 11 },
};
const HERMANAS_AUS_W = ['#6a6580', '#9a96b0', '#c8c6d8', '#ecebf3', '#ffffff'];
const HERMANAS_AUS_CU = RAMP.copper;
const hermanasRotPoly = (pts, cx0, cy0, a) => pts.map(([x, y]) => [cx0 + (x - cx0) * Math.cos(a) - (y - cy0) * Math.sin(a), cy0 + (x - cx0) * Math.sin(a) + (y - cy0) * Math.cos(a)]);

// ---------------------------------------------------------------- side view --
// facing right, 92x72 at k=1. poses: stand | bow | jump | run | lie
const HERMANAS_AUS_POSE = {
  stand: { body: [42, 37, 21, 12, 0], chest: [61, 40, 9.5, 12], neck: [63, 28, 8, 9], head: [70, 19, 11, 9.5], muz: [80, 24, 7.5, 5], nose: [86.8, 22.6, 2.4], eye: [73, 16],
    earN: [[63, 13], [66, 3], [75, 7], [71, 13]], earF: [[58, 13], [61, 4], [69, 8], [66, 13]],
    FN: [62, 47, 63, 63, 3.6, 3], FF: [56, 47, 56, 63, 3.3, 2.8], BN: [25, 47, 23, 63, 3.8, 3], BF: [33, 47, 33, 63, 3.4, 2.8], thigh: [27, 42, 8, 9], tail: [20, 31, 4.5, 3.5] },
  bow: { body: [45, 38, 21, 11.5, .28], chest: [63, 47, 9, 10.5], neck: [66, 42, 7.5, 8], head: [74, 39, 11, 9.5], muz: [84, 43, 7.5, 5], nose: [90.5, 41.6, 2.4], eye: [77, 36],
    earN: [[67, 33], [70, 23], [79, 27], [75, 33]], earF: [[62, 33], [65, 24], [73, 28], [70, 33]],
    FN: [64, 53, 83, 64, 3.4, 2.8], FF: [59, 53, 77, 64, 3.2, 2.7], BN: [26, 42, 24, 64, 3.8, 3], BF: [34, 44, 33, 64, 3.4, 2.8], thigh: [28, 38, 8, 9], tail: [21, 25, 4.5, 3.5] },
  jump: { body: [44, 44, 20, 11.5, -.35], chest: [60, 37, 9, 11], neck: [62, 27, 7.5, 8.5], head: [68, 19, 10.5, 9.5], muz: [77, 15, 7, 4.8], nose: [83.5, 13.2, 2.3], eye: [70, 16], open: 1,
    earN: [[61, 13], [62, 4], [71, 7], [68, 13]], earF: [[56, 14], [57, 5], [65, 8], [63, 14]],
    FN: [60, 46, 71, 50, 3.4, 2.8], FF: [56, 47, 66, 54, 3.2, 2.7], BN: [28, 50, 11, 60, 3.8, 3], BF: [33, 52, 18, 64, 3.4, 2.8], thigh: [29, 47, 8, 9], tail: [22, 53, 4.5, 3.5] },
  run: { body: [44, 36, 22, 11, -.05], chest: [63, 38, 9, 11], neck: [65, 27, 7.5, 8.5], head: [73, 19, 10.5, 9.5], muz: [82, 23, 7.5, 5], nose: [88.8, 21.6, 2.4], eye: [75, 16],
    earN: [[66, 13], [66, 3], [76, 8], [73, 13]], earF: [[61, 13], [61, 4], [69, 8], [67, 13]],
    FN: [64, 44, 81, 52, 3.4, 2.8], FF: [59, 45, 72, 58, 3.2, 2.7], BN: [26, 42, 9, 50, 3.8, 3], BF: [33, 44, 19, 58, 3.4, 2.8], thigh: [28, 40, 8, 9], tail: [20, 32, 4.5, 3.5] },
  lie: { body: [44, 53, 21, 9.5, 0], chest: [62, 53, 8.5, 9], neck: [65, 45, 7.5, 8], head: [72, 44, 10.5, 9.5], muz: [81, 49, 7, 4.8], nose: [87.5, 47.8, 2.3], eye: [75, 41],
    earN: [[66, 39], [68, 29], [76, 33], [72, 39]], earF: [[61, 39], [63, 30], [70, 34], [67, 39]],
    FN: [62, 59, 81, 64, 3.3, 2.8], FF: [57, 59, 75, 64, 3.1, 2.7], BN: [30, 57, 43, 63, 3.8, 3], BF: [34, 58, 47, 64, 3.4, 2.8], thigh: [31, 53, 9, 7], tail: [22, 56, 4.5, 3.5] },
};
function hermanasAussieSide(who, pose = 'stand', mood = 'normal', k = 1) {
  return mdl('hermanas:aus:' + who + pose + mood + k, () => {
    const A = HERMANAS_AUS[who], P = HERMANAS_AUS_POSE[pose] || HERMANAS_AUS_POSE.stand, s = v => v * k, S = f => (x, y) => f(x / k, y / k) * k;
    const W = Math.ceil(92 * k), H = Math.ceil(72 * k);
    const droop = mood === 'sad' || pose === 'lie' && mood !== 'happy' ? .95 : 0;
    const merle = (x, y) => { const X = x / k, Y = y / k; return fbm(X * .085 + A.seed, Y * .11, A.seed) > .6 ? A.dark : null; };
    const Dk = r => r.map(c => mixHex(c, '#3a3450', .28));
    const [bx, by, brx, bry, brot] = P.body, [hx, hy, hrx, hry] = P.head;
    const bodyS = SD.ellipse(bx, by, brx, bry, brot);
    const body = SD.shag(SD.tufts(bodyS, bx, by - 4, 1.5, 24, A.seed, 1.6), .6, .3, A.seed);
    const chestS = SD.ellipse(...P.chest), chest = SD.tufts(chestS, P.chest[0], P.chest[1], 2, 14, .5, 1.8);
    const neck = SD.ellipse(...P.neck), headS = SD.ellipse(hx, hy, hrx, hry);
    const muz = SD.smooth(1.5, SD.ellipse(...P.muz), SD.ellipse(P.muz[0] - 2, P.muz[1] + 3, P.muz[2] * .7, P.muz[3] * .7));
    let eN = P.earN, eF = P.earF;
    if (droop) { eN = hermanasRotPoly(eN, eN[0][0] + 3, eN[0][1], droop); eF = hermanasRotPoly(eF, eF[0][0] + 3, eF[0][1], droop); }
    const earN = SD.grow(SD.poly(eN), 1), earF = SD.grow(SD.poly(eF), 1);
    // folded tips of the ears (aussies' ears break forward)
    const tipN = SD.circle(eN[2][0] - 1.5, eN[2][1] + 1, 2.3), tipF = SD.circle(eF[2][0] - 1.5, eF[2][1] + 1, 2.1);
    const leg = L => SD.capsule(L[0], L[1], L[2], L[3], L[4], L[5]);
    const thigh = SD.ellipse(...P.thigh), tail = SD.tufts(SD.ellipse(...P.tail), P.tail[0], P.tail[1], 1.2, 9, 1, 2);
    const paw = L => SD.ellipse(L[2] + 1, L[3] - .5, 3.8, 2.2);
    const legPaint = L => (x, y) => { const Y = y / k, t = (Y - L[1]) / Math.max(1, L[3] - L[1]); return t > .78 ? HERMANAS_AUS_W : t > .42 ? HERMANAS_AUS_CU : merle(x, y); };
    // the face: white blaze on the front, copper cheek
    const headPaint = (x, y) => { const X = x / k, Y = y / k; if (X > hx + hrx * .42 && Y < hy + 2) return HERMANAS_AUS_W; if (Math.hypot(X - (P.eye[0] - 1), Y - (P.eye[1] + 5)) < 2.6) return HERMANAS_AUS_CU; if (Math.hypot(X - (P.eye[0] + 1), Y - (P.eye[1] - 3.3)) < 1.3) return HERMANAS_AUS_CU; return merle(x, y); };
    const tx = clumpTex(Math.max(2.4, 4 * k), .26, A.seed, 1.3), tx2 = clumpTex(Math.max(2.2, 3.2 * k), .22, A.seed + 4, 1.5);
    const parts = [
      { f: S(leg(P.FF)), ramp: Dk(A.base), z: 0, th: s(3), paint: (x, y) => { const r = legPaint(P.FF)(x, y); return r ? Dk(r) : null; } },
      { f: S(leg(P.BF)), ramp: Dk(A.base), z: 0, th: s(3), paint: (x, y) => { const r = legPaint(P.BF)(x, y); return r ? Dk(r) : null; } },
      { f: S(paw(P.FF)), ramp: Dk(HERMANAS_AUS_W), z: .05, th: s(2) }, { f: S(paw(P.BF)), ramp: Dk(HERMANAS_AUS_W), z: .05, th: s(2) },
      { f: S(earF), ramp: Dk(A.base), z: .3, th: s(3), paint: merle }, { f: S(tipF), ramp: Dk(A.base), z: .35, th: s(2) },
      { f: S(tail), ramp: A.base, z: .5, th: s(3), tex: tx2, paint: merle },
      { f: S(body), fs: S(bodyS), ramp: A.base, z: 1, th: s(12), tex: tx, paint: merle },
      { f: S(thigh), ramp: A.base, z: 1.4, th: s(6), tex: tx2, paint: merle },
      { f: S(leg(P.BN)), ramp: A.base, z: 1.5, th: s(4), tex: tx2, paint: legPaint(P.BN) },
      { f: S(paw(P.BN)), ramp: HERMANAS_AUS_W, z: 1.55, th: s(2) },
      { f: S(neck), ramp: A.base, z: 1.8, th: s(6), paint: merle },
      { f: S(leg(P.FN)), ramp: A.base, z: 2, th: s(3.5), tex: tx2, paint: legPaint(P.FN) },
      { f: S(paw(P.FN)), ramp: HERMANAS_AUS_W, z: 2.05, th: s(2) },
      { f: S(chest), fs: S(chestS), ramp: HERMANAS_AUS_W, z: 2.2, th: s(8), tex: tx },
      { f: S(headS), ramp: A.base, z: 3, th: s(9), tex: tx2, paint: headPaint },
      { f: S(earN), ramp: A.base, z: 3.2, th: s(3), paint: merle }, { f: S(tipN), ramp: A.base, z: 3.25, th: s(2), paint: merle },
      { f: S(muz), ramp: HERMANAS_AUS_W, z: 3.5, th: s(5), amb: .42, tex: tx2 },
      { f: S(SD.circle(...P.nose)), ramp: A.nose, z: 4, th: s(2), gloss: true },
    ];
    const c = model(W, H, parts);
    const g = c.g, K = '#140c14', q = v => rd(v * k);
    // eye
    const ex = q(P.eye[0]), ey = q(P.eye[1]), LT = A.base[4];
    if (k < .8) {
      // small sizes keep the compact eye
      if (mood === 'happy') { px(g, ex - 1, ey + 1, K); px(g, ex, ey, K); px(g, ex + 1, ey, K); px(g, ex + 2, ey + 1, K); }
      else if (mood === 'sad') { rect(g, ex - 1, ey + 1, 3, 2, K); px(g, ex, ey + 1, A.eyeN); linePx(g, ex - 2, ey - 1, ex + 1, ey, K); }
      else if (mood === 'wow') { rect(g, ex - 1, ey - 1, 3, 4, K); px(g, ex, ey, '#fff'); px(g, ex, ey + 1, A.eyeN); }
      else if (mood === 'focus') { rect(g, ex - 1, ey + 1, 3, 2, K); px(g, ex, ey + 1, A.eyeN); linePx(g, ex - 2, ey - 1, ex + 2, ey, K); }
      else { rect(g, ex - 1, ey, 3, Math.max(2, q(3)), K); px(g, ex, ey + 1, A.eyeN); px(g, ex - 1, ey, '#ffffff'); }
    } else {
      // big cartoon eye: white sclera, iris looking ahead, a glint; a light lash line so it reads on dark merle
      const open = (h, brow) => {
        rect(g, ex - 2, ey - 1, 5, h, K); rect(g, ex - 1, ey - 2, 3, h + 2, K);
        rect(g, ex - 1, ey - 1, 3, h, '#ffffff');
        rect(g, ex, ey - 1, 2, h, A.eyeN); rect(g, ex + 1, ey, 1, h - 1, K); px(g, ex, ey - 1, '#ffffff');
        if (brow) linePx(g, ex - 3, ey - 3 + brow, ex + 2, ey - 3, K);
      };
      if (mood === 'happy') { hline(g, ex - 1, ex + 2, ey, K); hline(g, ex - 1, ex + 2, ey - 1, K); px(g, ex - 2, ey + 1, K); px(g, ex + 3, ey + 1, K); hline(g, ex - 1, ex + 2, ey + 1, LT); }
      else if (mood === 'sad') { open(2, 0); linePx(g, ex - 3, ey - 4, ex + 2, ey - 2, K); }
      else if (mood === 'wow') { open(4, 0); }
      else if (mood === 'focus') { open(2, -1); }
      else open(3, 0);
      if (mood === 'happy' || mood === 'normal') { rect(g, ex - 2, ey + 4, 3, 2, '#ff8fb8'); px(g, ex - 1, ey + 4, '#ffc2da'); }
    }
    // mouth
    const mx0 = q(P.muz[0] - 2), my = q(P.muz[1] + 3.5);
    if (P.open || mood === 'happy' || mood === 'wow') {
      hline(g, mx0, mx0 + q(7), my, K); rect(g, mx0 + 1, my + 1, Math.max(2, q(4)), Math.max(2, q(3.5)), RAMP.pink[2]); px(g, mx0 + 1, my + 1, RAMP.pink[1]);
    } else hline(g, mx0 + 1, mx0 + q(7), my, K);
    return c;
  });
}

// ---------------------------------------------------------------- front head --
function hermanasAussieHead(who, ex = 'normal') {
  return mdl('hermanas:ausH:' + who + ex, () => {
    const A = HERMANAS_AUS[who];
    const merle = (x, y) => fbm(x * .09 + A.seed * 3, y * .1, A.seed + 2) > .6 ? A.dark : null;
    const earL = SD.grow(SD.poly([[13, 25], [14, 6], [27, 13]]), 1.6), earR = SD.grow(SD.poly([[51, 25], [50, 6], [37, 13]]), 1.6);
    const flapL = SD.grow(SD.poly([[12, 9], [21, 8], [16, 17]]), 1), flapR = SD.grow(SD.poly([[52, 9], [43, 8], [48, 17]]), 1);
    const headS = SD.smooth(4, SD.ellipse(32, 27, 18, 15.5), SD.ellipse(32, 36, 13, 9));
    const head = SD.tufts(headS, 32, 30, 1.2, 22, A.seed, 1.8);
    const muz = SD.ellipse(32, 39, 9.5, 7);
    const blaze = SD.poly([[30.5, 11], [33.5, 11], [36, 33], [28, 33]]);
    const ruff = SD.tufts(SD.ellipse(32, 52, 17, 9), 32, 48, 2, 16, 1, 2);
    const headPaint = (x, y) => { if (Math.hypot(x - 24.5, y - 22.5) < 2.1 || Math.hypot(x - 39.5, y - 22.5) < 2.1) return HERMANAS_AUS_CU; if (Math.hypot(x - 19.5, y - 36) < 4 || Math.hypot(x - 44.5, y - 36) < 4) return HERMANAS_AUS_CU; return merle(x, y); };
    const tx = clumpTex(4, .26, A.seed, 1.3);
    const c = model(64, 60, [
      { f: ruff, ramp: HERMANAS_AUS_W, z: 0, th: 8, tex: tx },
      { f: earL, ramp: A.base, z: .5, th: 4, paint: merle }, { f: earR, ramp: A.base, z: .5, th: 4, paint: merle },
      { f: head, fs: headS, ramp: A.base, z: 1, th: 14, tex: tx, paint: headPaint },
      { f: flapL, ramp: A.base, z: 1.5, th: 2.5, paint: merle }, { f: flapR, ramp: A.base, z: 1.5, th: 2.5, paint: merle },
      { f: blaze, ramp: HERMANAS_AUS_W, z: 2, th: 3, edge: false, out: false, amb: .5 },
      { f: muz, ramp: HERMANAS_AUS_W, z: 2.5, th: 7, amb: .42 },
      { f: SD.box(32, 35.4, 4.6, 3.2, 2.6), ramp: A.nose, z: 4, th: 3, gloss: true, amb: .3 },
    ]);
    const g = c.g, K = '#140c14';
    const eye = (x, y, iris, kind) => {
      switch (kind) {
        case 'happy': hline(g, x, x + 4, y + 2, K); px(g, x - 1, y + 3, K); px(g, x + 5, y + 3, K); hline(g, x + 1, x + 3, y + 1, K); return;
        case 'closed': hline(g, x, x + 4, y + 3, K); px(g, x - 1, y + 2, K); px(g, x + 5, y + 2, K); return;
        case 'sad': rect(g, x, y + 2, 5, 3, K); rect(g, x + 1, y + 2, 3, 2, iris); px(g, x + 1, y + 2, '#fff'); hline(g, x - 1, x + 2, y + (x < 32 ? 0 : 1), K); hline(g, x + 3, x + 5, y + (x < 32 ? 1 : 0), K); return;
        case 'wow': rect(g, x, y - 1, 5, 6, K); rect(g, x + 1, y, 3, 4, iris); px(g, x + 2, y + 1, K); px(g, x + 1, y, '#fff'); return;
        case 'focus': rect(g, x, y + 1, 5, 4, K); rect(g, x + 1, y + 2, 3, 2, iris); px(g, x + 2, y + 2, K); hline(g, x - 1, x + 5, y - 1 + (x < 32 ? 0 : 0), K); linePx(g, x - 1, y - 1 + (x < 32 ? -1 : 1), x + 5, y - 1 + (x < 32 ? 1 : -1), K); return;
        case 'heart': drawHeart(g, x + 2.5, y + 2, RAMP.pink[2], .9); px(g, x + 1, y + 1, '#fff'); return;
        default: rect(g, x + 1, y, 3, 5, K); rect(g, x, y + 1, 5, 3, K); rect(g, x + 1, y + 1, 3, 3, iris); px(g, x + 2, y + 2, K); px(g, x + 1, y + 1, '#ffffff'); px(g, x + 3, y + 3, mixHex(iris, '#ffffff', .4));
      }
    };
    const kinds = { normal: ['', ''], happy: ['happy', 'happy'], sad: ['sad', 'sad'], wow: ['wow', 'wow'], wink: ['', 'closed'], focus: ['focus', 'focus'], love: ['heart', 'heart'], sleep: ['closed', 'closed'] }[ex] || ['', ''];
    eye(21, 25, A.eyeF, kinds[0]); eye(38, 25, A.eyeN, kinds[1]);
    const P = RAMP.pink;
    if (ex === 'happy' || ex === 'wink' || ex === 'love') { hline(g, 29, 35, 41, K); px(g, 28, 40, K); px(g, 36, 40, K); rect(g, 30, 42, 5, 4, P[2]); rect(g, 31, 42, 3, 1, P[1]); vline(g, 32, 43, 44, P[1]); hline(g, 31, 33, 46, P[0]); }
    else if (ex === 'wow') { rect(g, 30, 40, 5, 5, K); rect(g, 31, 43, 3, 2, P[2]); }
    else if (ex === 'sad') { hline(g, 29, 35, 42, K); px(g, 28, 43, K); px(g, 36, 43, K); }
    else if (ex === 'focus') { hline(g, 28, 36, 41, K); px(g, 36, 40, K); }
    else { vline(g, 32, 38, 40, K); hline(g, 29, 31, 41, K); hline(g, 33, 35, 41, K); }
    if (ex === 'happy' || ex === 'wink' || ex === 'love') for (const bx of [16, 45]) { rect(g, bx, 31, 3, 2, '#ff8fb8'); px(g, bx + 1, 31, '#ffc2da'); }
    return c;
  });
}
// the hermanasBandana knotted around the neck, over the ruff
function hermanasBandana(g, x, y, who, w = 26) {
  const B = HERMANAS_AUS[who].band, h = w * .55;
  polyPx(g, [[x - w / 2 - 1, y - 1], [x + w / 2 + 1, y - 1], [x, y + h + 1]], INK);
  polyPx(g, [[x - w / 2, y], [x + w / 2, y], [x, y + h]], B[2]);
  hline(g, x - w / 2 + 1, x + w / 2 - 1, y, B[3]);
  for (let i = 0; i < 6; i++) { const px0 = x - w * .3 + hash2(i, 3) * w * .6, py0 = y + 2 + hash2(3, i) * h * .55; if (Math.abs(px0 - x) < (h - (py0 - y)) * .8) px(g, px0, py0, '#ffffff'); }
  disc(g, x + w / 2 - 1, y, 2, INK); disc(g, x + w / 2 - 1, y, 1.3, B[1]);
}
// sitting, front view: aussie body + head + hermanasBandana (feet at x, y)
function hermanasAussieSitBody(who) {
  return mdl('hermanas:ausSit:' + who, () => {
    const A = HERMANAS_AUS[who], merle = (x, y) => fbm(x * .09 + A.seed, y * .1, A.seed + 5) > .6 ? A.dark : null;
    const bodyS = SD.ellipse(32, 26, 16, 15), body = SD.tufts(bodyS, 32, 22, 1.8, 22, A.seed, 1.6);
    const chest = SD.tufts(SD.ellipse(32, 20, 9, 12), 32, 20, 1.6, 12, 2, 1.8);
    const legL = SD.capsule(24, 26, 23, 40, 4.4, 4), legR = SD.capsule(40, 26, 41, 40, 4.4, 4);
    const pawL = SD.ellipse(23, 41, 5, 3), pawR = SD.ellipse(41, 41, 5, 3);
    const hL = SD.ellipse(15, 34, 6, 8), hR = SD.ellipse(49, 34, 6, 8);
    const legPaint = (x, y) => y > 33 ? HERMANAS_AUS_CU : merle(x, y);
    const tx = clumpTex(4.5, .28, A.seed + 1, 1.3);
    return model(64, 46, [
      { f: hL, ramp: A.base, z: 0, th: 5, tex: tx, paint: merle }, { f: hR, ramp: A.base, z: 0, th: 5, tex: tx, paint: merle },
      { f: body, fs: bodyS, ramp: A.base, z: 1, th: 12, tex: tx, paint: merle },
      { f: chest, ramp: HERMANAS_AUS_W, z: 1.5, th: 6, tex: tx },
      { f: legL, ramp: A.base, z: 2, th: 4, tex: tx, paint: legPaint }, { f: legR, ramp: A.base, z: 2, th: 4, tex: tx, paint: legPaint },
      { f: pawL, ramp: HERMANAS_AUS_W, z: 2.5, th: 2.5 }, { f: pawR, ramp: HERMANAS_AUS_W, z: 2.5, th: 2.5 },
    ]);
  });
}
function hermanasDrawAussieSit(g, x, y, who, ex = 'normal', o = {}) {
  const tilt = o.tilt || 0;
  drawS(g, hermanasAussieSitBody(who), x, y, { ax: .5, ay: 1, sx: o.sx || 1, sy: o.sy || 1 });
  drawS(g, hermanasAussieHead(who, ex), x + tilt * 4, y - 38 * (o.sy || 1), { ax: .5, ay: .75, rot: tilt * .18 });
  hermanasBandana(g, x + tilt * 3, y - 38 * (o.sy || 1) + 10, who);
}

// ---------------------------------------------------------------- props -----
// the frisbee, seen from above (w x w/2) or on edge
function hermanasFrisbeeSpr(col = '#ff6b3d', w = 18) {
  return mdl('hermanas:frisbee' + col + w, () => {
    const h = rd(w * .5), c = mkCanvas(w + 2, h + 3), g = c.g, cx0 = (w + 2) / 2, cy0 = h / 2 + 1;
    ellipsePx(g, cx0, cy0 + 1, w / 2 + 1, h / 2 + 1, INK); ellipsePx(g, cx0, cy0, w / 2 + 1, h / 2 + 1, INK);
    ellipsePx(g, cx0, cy0, w / 2, h / 2, mixHex(col, '#000000', .25)); ellipsePx(g, cx0, cy0 - .5, w / 2 - 1, h / 2 - 1, col);
    ellipsePx(g, cx0, cy0 - .5, w / 2 - 4, h / 2 - 2.5, mixHex(col, '#ffffff', .25));
    for (let a = 3.5; a < 5.2; a += .12) px(g, cx0 + Math.cos(a) * (w / 2 - 2), cy0 + Math.sin(a) * (h / 2 - 1.2), '#ffffff');
    return c;
  });
}
// the seagull: side view, wings frame 0 (up) / 1 (mid) / 2 (down); holding: frisbee in the beak
function hermanasGullSpr(frame = 0, holding = false, mood = 'smug') {
  return mdl('hermanas:gull' + frame + holding + mood, () => {
    const Wt = ['#6b6977', '#9a98a8', '#c8c6d3', '#ecebf3', '#ffffff'], Gy = ['#2c2a38', '#4a4858', '#6f6d80', '#9896a8', '#c4c2d0'];
    const body = SD.ellipse(28, 24, 14, 8, -.08), head = SD.circle(41, 17, 6.5), tail = SD.poly([[10, 21], [2, 18], [4, 26], [14, 27]]);
    const wy = [4, 16, 30][frame];
    const wing = SD.grow(SD.poly([[20, 20], [34, 20], [22 - (frame === 1 ? 4 : 0), wy], [12, wy + (frame === 0 ? 3 : 0)]]), 1.5);
    const wingTip = SD.circle(12 + (frame === 1 ? -4 : 0), wy + (frame === 0 ? 3 : 0), 3.2);
    const beak = SD.poly([[46, 16], [55, 18.5], [46, 20]]);
    const legs = SD.union(SD.capsule(26, 31, 26, 36, .9, .8), SD.capsule(31, 31, 32, 36, .9, .8));
    const parts = [
      { f: tail, ramp: Wt, z: 0, th: 3 },
      { f: body, ramp: Wt, z: 1, th: 8 },
      { f: head, ramp: Wt, z: 2, th: 6 },
      { f: beak, ramp: RAMP.yellow, z: 2.5, th: 2, amb: .5 },
      { f: wing, ramp: Gy, z: 3, th: 5 }, { f: wingTip, ramp: RAMP.black, z: 3.1, th: 2 },
    ];
    if (frame === 1 && !holding) parts.push({ f: legs, ramp: RAMP.orange, z: .5, th: 1 });
    const c = model(58, 40, parts);
    const g = c.g, K = INK;
    px(g, 51, 18, '#e23b4e'); // the red spot on the beak
    if (mood === 'angry') { rect(g, 42, 15, 2, 2, K); linePx(g, 40, 12, 45, 14, K); } else if (mood === 'dizzy') { ringPx(g, 43, 16, 1.6, K); } else { rect(g, 42, 15, 2, 2, K); px(g, 42, 15, '#ffffff'); hline(g, 40, 45, 13, Gy[1]); }
    if (holding) g.drawImage(hermanasFrisbeeSpr('#ff6b3d', 14), 45, 17);
    return c;
  });
}
function hermanasGullStand(mood = 'smug') {
  return mdl('hermanas:gullStand' + mood, () => {
    const Wt = ['#6b6977', '#9a98a8', '#c8c6d3', '#ecebf3', '#ffffff'], Gy = ['#2c2a38', '#4a4858', '#6f6d80', '#9896a8', '#c4c2d0'];
    const body = SD.ellipse(18, 24, 10, 12), head = SD.circle(22, 10, 6.5), wing = SD.ellipse(13, 24, 7, 10, .2), tipW = SD.ellipse(9, 33, 4, 4);
    const beak = SD.poly([[27, 9], [35, 11.5], [27, 13]]), legs = SD.union(SD.capsule(16, 35, 15, 42, 1, .9), SD.capsule(21, 35, 22, 42, 1, .9));
    const c = model(38, 46, [
      { f: legs, ramp: RAMP.orange, z: 0, th: 1 },
      { f: body, ramp: Wt, z: 1, th: 9 }, { f: wing, ramp: Gy, z: 2, th: 5 }, { f: tipW, ramp: RAMP.black, z: 2.1, th: 2 },
      { f: head, ramp: Wt, z: 3, th: 6 }, { f: beak, ramp: RAMP.yellow, z: 3.5, th: 2, amb: .5 },
    ]);
    const g = c.g; px(g, 32, 11, '#e23b4e');
    if (mood === 'shy') { hline(g, 22, 24, 9, INK); px(g, 18, 12, RAMP.pink[3]); px(g, 20, 12, RAMP.pink[3]); }
    else if (mood === 'happy') { px(g, 22, 8, INK); px(g, 23, 7, INK); px(g, 24, 8, INK); }
    else { rect(g, 22, 8, 2, 2, INK); px(g, 22, 8, '#ffffff'); linePx(g, 20, 6, 25, 7, INK); }
    return c;
  });
}

// ---------------------------------------------------------------- places ----
// the "Vela" (W hotel sail) on the horizon
function hermanasVelaHotel(g, x, base) {
  const h = 52, pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([x + Math.sin(t * Math.PI * .5) * 16 - 2, base - t * h]); }
  pts.push([x + 20, base - h + 6], [x + 22, base]);
  polyPx(g, pts.map(([a, b]) => [a - 1, b]), '#6f8fb0'); polyPx(g, pts, '#a9c7e3');
  for (let y = base - 4; y > base - h + 6; y -= 4) hline(g, x + 1, x + 19, y, '#8fb0d0');
  for (let y = base - 6; y > base - h + 10; y -= 8) px(g, x + 12, y, '#ffffff');
}
function hermanasBeachBg() {
  return mdl('hermanas:beachTop', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 100, ['#5ab4f0', '#7cc6f5', '#a3d8fa', '#c8e8fc', '#e6f5ff']);
    // clouds
    for (const [cx0, cy0, w] of [[40, 30, 26], [170, 18, 34], [226, 44, 20]]) { for (let i = 0; i < 5; i++) disc(g, cx0 - w / 2 + i * w / 4, cy0 + (i % 2 ? -3 : 0), w / 5 + 3, '#ffffff'); rect(g, cx0 - w / 2 - 2, cy0 + 2, w + 4, 3, '#ffffff'); hline(g, cx0 - w / 2, cx0 + w / 2, cy0 + 5, '#c8e8fc'); }
    // sea + horizon
    bandsV(g, 0, 98, SW, 30, ['#23609e', '#2f7cc4', '#3d93d6', '#5aaee6']);
    hermanasVelaHotel(g, 208, 99);
    for (let i = 0; i < 70; i++) { const x = hash2(i, 9) * SW, y = 100 + hash2(9, i) * 26; hline(g, x, x + 2 + (i % 3), y, i % 4 ? '#7cc0ee' : '#ffffff'); }
    // a sailing boat far away
    polyPx(g, [[60, 96], [60, 84], [68, 95]], '#ffffff'); rect(g, 56, 96, 14, 2, '#c02d45');
    // sand
    bandsV(g, 0, 126, SW, 66, ['#d9b77a', '#ecca8e', '#f2d59a', '#f6dea8', '#f2d59a']);
    for (let i = 0; i < 700; i++) { const x = hash2(i, 21) * SW, y = 130 + hash2(21, i) * 62; px(g, x, y, hash2(i, i) < .5 ? '#e3c283' : '#fff0c8'); }
    // wet shoreline + foam
    for (let x = 0; x < SW; x++) { const y = 126 + Math.round(Math.sin(x * .09) * 1.5); px(g, x, y, '#ffffff'); px(g, x, y + 1, '#dff4ff'); px(g, x, y + 2, '#c9a86e'); }
    // umbrella + towel (left), sandcastle (right)
    rect(g, 18, 150, 44, 16, INK); for (let i = 0; i < 42; i += 6) rect(g, 19 + i, 151, 3, 14, '#3565cc'); for (let i = 3; i < 42; i += 6) rect(g, 19 + i, 151, 3, 14, '#ffffff');
    vline(g, 30, 108, 158, INK); vline(g, 31, 108, 158, '#9896a4');
    for (let i = 0; i < 8; i++) { const a0 = Math.PI + i * Math.PI / 8, a1 = a0 + Math.PI / 8; polyPx(g, [[31, 108], [31 + Math.cos(a0) * 26, 116 + Math.sin(a0) * 10], [31 + Math.cos(a1) * 26, 116 + Math.sin(a1) * 10]], i % 2 ? '#ffffff' : '#e23b4e'); }
    hline(g, 5, 57, 116, INK);
    const sx = 226, sy = 170;
    polyPx(g, [[sx - 16, sy], [sx + 16, sy], [sx + 12, sy - 12], [sx - 12, sy - 12]], '#c9a86e'); rect(g, sx - 8, sy - 22, 16, 10, '#d9b77a'); rect(g, sx - 2, sy - 30, 4, 8, '#d9b77a');
    for (let i = -8; i < 8; i += 4) rect(g, sx + i, sy - 25, 2, 3, '#d9b77a');
    vline(g, sx, sy - 38, sy - 30, INK); polyPx(g, [[sx + 1, sy - 38], [sx + 8, sy - 35], [sx + 1, sy - 32]], '#ff6b3d');
    return c;
  });
}
function hermanasBeachBotBg() {
  return mdl('hermanas:beachBot', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    // the promenade boards at the top, sand below
    rect(g, 0, 0, SW, 14, RAMP.wood[3]); for (let x = 0; x < SW; x += 16) { vline(g, x, 0, 13, RAMP.wood[1]); } hline(g, 0, SW, 13, RAMP.wood[0]); hline(g, 0, SW, 1, RAMP.wood[4]);
    bandsV(g, 0, 14, SW, 178, ['#ecca8e', '#f2d59a', '#f6dea8', '#f2d59a']);
    for (let i = 0; i < 900; i++) { const x = hash2(i, 31) * SW, y = 14 + hash2(31, i) * 178; px(g, x, y, hash2(i, 5) < .5 ? '#e3c283' : '#fff0c8'); }
    // paw-print trail, shells, a starfish
    for (let i = 0; i < 9; i++) drawPawPrint(g, 14 + i * 28, 176 - Math.sin(i * .8) * 6 + (i % 2) * 4, '#dcb97c', .4);
    for (const [x, y] of [[26, 40], [236, 60], [214, 142]]) { disc(g, x, y, 3, INK); disc(g, x, y, 2.3, '#ffd1e4'); linePx(g, x - 1, y + 1, x + 1, y - 2, '#ff93bf'); }
    const stx = 36, sty = 128; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; thickLine(g, stx, sty, stx + Math.cos(a) * 6, sty + Math.sin(a) * 6, 1.6, '#ff9f4f'); } disc(g, stx, sty, 2, '#ff9f4f'); px(g, stx, sty - 3, '#ffd49b');
    return c;
  });
}
// the chalk doodles board used under the command during a microgame
function hermanasChalkTopBg() {
  return mdl('hermanas:chalkTop', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#243029');
    for (let i = 0; i < 12; i++) hermanasSmudge(g, 20 + hash2(i, 41) * 216, 16 + hash2(41, i) * 160, 20 + hash2(i, 2) * 24, 6 + hash2(2, i) * 8, i + 40);
    ringRect(g, 0, 0, SW, SH, 4, RAMP.wood[3]); ringRect(g, 0, 0, SW, SH, 1, RAMP.wood[1]); ringRect(g, 3, 3, SW - 6, SH - 6, 1, RAMP.wood[4]);
    g.globalAlpha = .35;
    for (const [x, y, r] of [[40, 60, .3], [214, 70, -.2], [180, 150, .5], [30, 150, 0]]) drawPawPrint(g, x, y, '#e8e8e0', r);
    txt(g, 'Kira ♥ Nala', 196, 118, '#e8e8e0', { align: 'c' });
    for (let i = 0; i < 4; i++) vline(g, 24 + i * 4, 104, 114, '#e8e8e0'); linePx(g, 22, 112, 38, 106, '#e8e8e0');
    g.globalAlpha = 1;
    return c;
  });
}
// the A-frame chalkboard frame, as a portal (wood, nails, chalk tray)
PORTAL_FRAMES.hermanasChalk = function (g, x, y, w, h, beat) {
  const Wd = RAMP.wood, b = 6;
  ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
  ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 1, Wd[3]);
  rect(g, x - b, y - b, w + b * 2, 1, Wd[4]); rect(g, x - b, y + h + b - 1, w + b * 2, 1, Wd[1]);
  for (let i = x - b + 3; i < x + w + b - 3; i += 7) { px(g, i, y - b + 2, Wd[2]); px(g, i + 3, y + h + b - 3, Wd[2]); }
  for (let i = y - b + 4; i < y + h + b - 3; i += 7) { px(g, x - b + 2, i, Wd[2]); px(g, x + w + b - 3, i + 3, Wd[2]); }
  ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  for (const [nx, ny] of [[x - b + 2, y - b + 2], [x + w + b - 3, y - b + 2], [x - b + 2, y + h + b - 3], [x + w + b - 3, y + h + b - 3]]) { px(g, nx, ny, RAMP.steel[3]); px(g, nx + 1, ny + 1, RAMP.steel[1]); }
  // chalk tray with a pink and a white stick and the felt eraser
  rect(g, x - b + 4, y + h + b - 1, w + b * 2 - 8, 4, INK); rect(g, x - b + 5, y + h + b - 1, w + b * 2 - 10, 2, Wd[2]);
  rect(g, x + 14, y + h + b - 3, 10, 2, '#ffffff'); rect(g, x + 28, y + h + b - 3, 8, 2, '#ffb3d1');
  rect(g, x + w - 30, y + h + b - 5, 18, 4, INK); rect(g, x + w - 29, y + h + b - 4, 16, 2, '#3565cc'); rect(g, x + w - 29, y + h + b - 5, 16, 1, '#b9955f');
  // wooden tag on top with a chalk paw
  const cx0 = x + w / 2, bob = Math.abs(Math.sin(beat * Math.PI)) * 1;
  rect(g, cx0 - 12, y - b - 9 - bob, 24, 10, INK); rect(g, cx0 - 11, y - b - 8 - bob, 22, 8, Wd[3]); rect(g, cx0 - 11, y - b - 8 - bob, 22, 1, Wd[4]);
  drawPawPrint(g, cx0, y - b - 4 - bob, '#ffffff', 0);
};

// ---------------------------------------------------------------- room ------
function hermanasRoomTop(g, S) {
  if (S.phase === 'inter') { hermanasPrewarm(); if (hermanasPrewarm.done) hermanasStampWarm(); }
  // build every pose the interlude will need in the background, once
  if (!hermanasRoomTop.warmed) { hermanasRoomTop.warmed = 1; for (const w of ['kira', 'nala']) for (const [p, m] of [['bow', 'happy'], ['jump', 'happy'], ['lie', 'sad'], ['run', 'focus'], ['stand', 'wow'], ['stand', 'normal'], ['jump', 'normal']]) warm(() => hermanasAussieSide(w, p, m)); }
  g.drawImage(hermanasBeachBg(), 0, 0);
  const t = S.pt || 0, beat = S.pb || 0, rt = S.reactT || 0;
  // the sun holds the counter
  const sx = SW / 2, sy = 20;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + NOW * .5; polyPx(g, [[sx + Math.cos(a - .12) * 22, sy + Math.sin(a - .12) * 22], [sx + Math.cos(a) * 31, sy + Math.sin(a) * 31], [sx + Math.cos(a + .12) * 22, sy + Math.sin(a + .12) * 22]], '#ffe45c'); }
  disc(g, sx, sy, 22, '#ffb020'); disc(g, sx, sy, 20, '#ffd23f'); disc(g, sx - 4, sy - 5, 12, '#ffe98a');
  // who does what
  let react = rt < Math.max(1.3, 3.2 * 60 / (S.bpm || 120)) ? (S.react || 'ready') : 'idle'; // the reaction holds until the portal zooms in
  if (S.react === 'clear' || S.react === 'over') react = S.react;
  let poseK = 'stand', poseN = 'stand', moodK = 'normal', moodN = 'normal';
  const special = S.phase === 'inter' && S.special && S.pb >= 2 ? S.special : null;
  if (react === 'ready') { poseK = 'bow'; poseN = 'bow'; moodK = 'happy'; moodN = 'happy'; }
  else if (react === 'win' || react === 'clear') { poseK = 'jump'; poseN = 'jump'; moodK = 'happy'; moodN = 'happy'; }
  else if (react === 'lose' || react === 'over') { poseK = 'lie'; poseN = 'lie'; moodK = 'sad'; moodN = 'sad'; }
  if (special === 'speed') { poseK = poseN = 'run'; moodK = moodN = 'focus'; }
  if (special === 'boss') { poseK = poseN = 'stand'; moodK = moodN = 'wow'; }
  // frisbee flight between them while idle / on a win
  const kx = 66, nx = 190, gy = 176;
  let fbx = null, fby = null;
  if (react === 'idle' || react === 'win' || react === 'clear') {
    const ph = (beat / 2) % 2, k = ph % 1, dir = ph < 1 ? 1 : -1;
    fbx = lerp(dir > 0 ? kx + 20 : nx - 20, dir > 0 ? nx - 20 : kx + 20, k); fby = 130 - Math.sin(k * Math.PI) * 40;
    if (react === 'idle') { if (k > .75) { if (dir > 0) poseN = 'jump'; else poseK = 'jump'; } }
  }
  const jumpK = poseK === 'jump' ? Math.abs(Math.sin((react === 'idle' ? t * 5 : rt * 7))) * 10 : 0, jumpN = poseN === 'jump' ? Math.abs(Math.sin((react === 'idle' ? t * 5 : rt * 7) + 1)) * 10 : 0;
  const bob = Math.round(Math.abs(Math.sin(beat * Math.PI)) * -1);
  shadowOval(g, kx, gy + 1, 26, 3, .45); shadowOval(g, nx, gy + 1, 26, 3, .45);
  const runOff = special === 'speed' ? Math.sin(t * 20) * 2 : 0;
  drawS(g, hermanasAussieSide('kira', poseK, moodK), kx + runOff, gy - jumpK + bob, { ax: .5, ay: 1 });
  drawS(g, hermanasAussieSide('nala', poseN, moodN), nx - runOff, gy - jumpN + bob, { ax: .5, ay: 1, flip: true });
  if (fbx != null) { shadowOval(g, fbx, gy - 2, 7, 1.5, .3); drawS(g, hermanasFrisbeeSpr(), fbx, fby, { rot: Math.sin(t * 6) * .2 }); }
  if (react === 'lose' || react === 'over') { const k = Math.min(1, rt * 3); drawS(g, hermanasFrisbeeSpr('#ff6b3d', 18), 128, lerp(80, 172, E.outBounce(k)), { rot: rt * 3 }); drawRainCloud(g, 128, 50 + (1 - k) * -30, rt); }
  if (react === 'win' && rt < .6) for (let i = 0; i < 3; i++) drawHeart(g, 128 + (i - 1) * 16, 150 - rt * 40 - i * 4, '#ff4060', 1);
}
function hermanasRoomBot(g, S) { g.drawImage(hermanasBeachBotBg(), 0, 0); }
function hermanasLife(g, x, y, st, bt) {
  if (st === 'gone') { for (let a = 0; a < TAU; a += .5) px(g, x + Math.cos(a) * 9, y + Math.sin(a) * 4.5, '#c9a86e'); return; }
  if (st === 'break') {
    // a cheeky seagull swoops and steals the frisbee
    const k = clamp(bt / 1.1, 0, 1);
    const gx = k < .35 ? lerp(x + 70, x, E.outQ(k / .35)) : lerp(x, x - 60, E.inQ((k - .35) / .65)), gy = k < .35 ? lerp(y - 60, y - 6, E.outQ(k / .35)) : lerp(y - 6, y - 110, E.inQ((k - .35) / .65));
    if (k < .35) drawS(g, hermanasFrisbeeSpr(), x, y);
    drawS(g, hermanasGullSpr(fl(bt * 12) % 3, k >= .35, 'smug'), gx, gy, { flip: true });
    if (bt > .35 && bt < .9) txt(g, '¡Cruac!', x, y - 26, '#ffffff', { align: 'c', out: INK });
    return;
  }
  drawS(g, hermanasFrisbeeSpr(), x, y);
}
function hermanasMiniLife(g, x, y, alive) { if (alive) drawS(g, hermanasFrisbeeSpr('#ff6b3d', 10), x, y); else for (let a = 0; a < TAU; a += .7) px(g, x + Math.cos(a) * 5, y + Math.sin(a) * 2.5, 'rgba(255,255,255,.6)'); }
function hermanasMini(g, x, y, st, S) {
  const ex = st === 'win' ? 'happy' : st === 'lose' ? 'sad' : 'focus';
  drawS(g, hermanasAussieHead('kira', ex === 'focus' ? 'normal' : ex), SW - 76, SH + 26 - (st === 'win' ? 6 : 0), { ax: .5, ay: 1 });
  drawS(g, hermanasAussieHead('nala', ex), SW - 36, SH + 22 - (st === 'win' ? 8 : 0), { ax: .5, ay: 1 });
}
function hermanasPlayTop(g, S) {
  g.drawImage(hermanasChalkTopBg(), 0, 0);
  hermanasMini(g, 60, 140, S.g.state === 'play' ? 'watch' : S.g.state === 'won' ? 'win' : 'lose', S);
}

// ---------------------------------------------------------------- announcements
// Kira & Nala's own ¡MÁS RÁPIDO! / ¡JUEGO DEL JEFE! / ¡MÁS DIFÍCIL! (room.special):
// a wave they surf, the thief gull's shadow and her WANTED poster, a storm and
// the lifeguard's red flag. Lettering: their surf face from the title card.
const HERMANAS_WORDS = { speed: ['¡MÁS', 'RÁPIDO!'], boss: ['¡JUEGO', 'DEL JEFE!'], level: ['¡MÁS', 'DIFÍCIL!'] };
const HERMANAS_LABELS = { speed: '¡Viene una ola gorda!', boss: '¡La gaviota ladrona ataca!', level: '¡Bandera roja: más difícil!' };
let HERMANAS_FACES = null; // built on first use: the card faces live in cards.js, later in the bundle
function hermanasFaces() {
  if (HERMANAS_FACES) return HERMANAS_FACES;
  const F = CARD_SURF_FACE;
  HERMANAS_FACES = {
    speed: F,
    boss: Object.assign({}, F, { id: 'hnBoss', fill: ['#ffffff', '#ffd49b', '#ff6b3d'], line: '#2a0610', shadow: ['#c02d45', '#7c1830', '#3a0010'], hi: '#fff7ae' }),
    level: Object.assign({}, F, { id: 'hnStorm', fill: ['#ffffff', '#d7e6f5', '#9fb4cc'], shadow: ['#4d5670', '#2b2540', '#141c47'], hi: '#ffffff' }),
  };
  return HERMANAS_FACES;
}
function hermanasFitWord(kind, w) { return cardFit(w, kind === 'boss' ? 132 : 200, hermanasFaces()[kind]); }
// rasterise the letters ahead of time, one per frame (called from the room every frame)
function hermanasPrewarm() {
  if (typeof cardPrewarm !== 'function' || hermanasPrewarm.done) return;
  const list = []; for (const k in HERMANAS_WORDS) for (const w of HERMANAS_WORDS[k]) list.push([w, hermanasFitWord(k, w)]);
  cardPrewarm(list);
  if (list.every(([w, st]) => [...w].every(ch => ch === ' ' || CARD_GLYPHS.has(ch + '|' + cardStyle(st).id + '|' + cardStyle(st).u + '|' + cardStyle(st).r + '|')))) hermanasPrewarm.done = 1;
}
// ---------------------------------------------------------------- result stamps
// Every Kira & Nala microgame ends on the same stamp: their surf letters from the
// card, sunny for a win and stormy for a miss, slammed in with a ring of sand
// and foam. (Warmed up letter by letter from the room, like the announcements.)
const HERMANAS_STAMP_WORDS = { ok: ['¡PRECIOSO!', '¡A SALVO!', '¡A PASEAR!', '¡ÑAM!', '¡TE PILLÉ!', '¡SALVADO!', '¡AL PARQUE!', '¡ATRAPADO!', '¡UN CORAZÓN!', '¡UNA ESTRELLA!', '¡UN PEZ!', '¡UN HUESO!', '¡UNA CASETA!', '¡KEIKO!'], bad: ['¡A MEDIAS!', '¡PLOF!', '¡NOOOO!', '¡SIN TIEMPO!', '¡NO LLEGAMOS!', '¡SIN BOCATAS!'] };
function hermanasStampFace(ok) { const F = hermanasFaces(); return ok ? F.speed : F.level; }
function hermanasStamp(c, word, x, y, t, ok = true, maxW = 196) {
  if (t < 0) return;
  if (typeof cardWord !== 'function') { shout(c, word, x, y + 10, t); return; }
  const st = cardFit(word, maxW, hermanasStampFace(ok));
  if (t < .6) { // sand and foam fly out as the letters land
    const k = E.outQ(t / .6), n = 16;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + word.length * .7, r = 12 + k * 64; disc(c, x + Math.cos(a) * r * 1.6, y + 11 + Math.sin(a) * r * .55, Math.max(0, 3.4 * (1 - k)), ok ? (i % 3 === 0 ? '#ffd1e4' : i % 3 === 1 ? '#fff7ae' : '#ffffff') : (i % 2 ? '#d7e6f5' : '#9fb4cc')); }
  }
  cardWord(c, word, x, y, st, { anim: i => cardAnimSlam(t, i, { stagger: .035, from: 2 }) });
}
function hermanasStampWarm() {
  if (typeof cardPrewarm !== 'function' || hermanasStampWarm.done) return;
  const list = [];
  for (const w of HERMANAS_STAMP_WORDS.ok) list.push([w, cardFit(w, 196, hermanasStampFace(true))]);
  for (const w of HERMANAS_STAMP_WORDS.bad) list.push([w, cardFit(w, 196, hermanasStampFace(false))]);
  cardPrewarm(list);
  if (list.every(([w, st]) => [...w].every(ch => ch === ' ' || CARD_GLYPHS.has(ch + '|' + cardStyle(st).id + '|' + cardStyle(st).u + '|' + cardStyle(st).r + '|')))) hermanasStampWarm.done = 1;
}
// one-shot sounds inside a draw: once per announcement
function hermanasOnce(S, key) { S._hnOnce = S._hnOnce || {}; const k = S.count + ':' + key; if (S._hnOnce[k]) return false; S._hnOnce[k] = 1; return true; }
function hermanasBoard(col = '#ff6b3d') {
  return mdl('hermanas:board' + col, () => {
    const c = mkCanvas(34, 9), g = c.g;
    ellipsePx(g, 17, 4.5, 16.5, 4, INK); ellipsePx(g, 17, 4, 15.5, 3, '#fff8e6'); ellipsePx(g, 16, 3.5, 13, 2, '#ffffff');
    rect(g, 3, 4, 28, 1, col); rect(g, 3, 5, 28, 1, mixHex(col, '#000000', .3));
    polyPx(g, [[25, 8], [29, 8], [27, 9]], INK);
    return c;
  });
}
// ---- ¡MÁS RÁPIDO!: a wall of water rises and the sisters surf its face
function hermanasSpeedFx(g, S, t) {
  const b = t * S.bpm / 60, H = 104 * E.outBack(clamp(b / .9, 0, 1)), xc = lerp(268, 190, E.outQ(clamp(b / 3.5, 0, 1))), base = 150, w = 92;
  const crest = x => x <= xc ? base - H * Math.exp(-Math.pow((xc - x) / w, 2) * 1.5) : base - H * lerp(1, .78, clamp((x - xc) / 70, 0, 1));
  g.drawImage(hermanasBeachBg(), 0, 0);
  // wind lines across the sky
  for (let i = 0; i < 11; i++) { const y = 10 + i * 11, x = SW - ((i * 53 + b * 190) % (SW + 90)); rect(g, x, y, 20 + (i % 3) * 9, 1, 'rgba(255,255,255,.75)'); }
  // the water wall, column by column in depth bands
  const bands = [[0, 2, '#ffffff'], [2, 6, '#c8ecff'], [6, 18, '#7cc6f5'], [18, 40, '#3d93d6'], [40, 80, '#2f7cc4'], [80, 999, '#1b4f8c']];
  for (let x = 0; x < SW; x++) { const cy = rd(crest(x)); for (const [a0, z, col] of bands) { const y0 = cy + a0, y1 = Math.min(SH, cy + z); if (y1 > y0) { g.fillStyle = col; g.fillRect(x, y0, 1, y1 - y0); } } }
  // streaks running up the face
  for (let i = 0; i < 16; i++) { const q = (i * .37 + b * .8) % 1, x = rd(lerp(-10, xc - 8, (i * .61) % 1)), y = rd(crest(x) + 10 + q * 60); if (y < SH) hline(g, x, x + 7 + (i % 3) * 3, y, i % 2 ? '#9bd6f7' : '#5aaee6'); }
  // the lip curls over, spitting spray
  if (H > 30) {
    const cy = crest(xc), k = clamp((H - 30) / 70, 0, 1);
    const lip = [[xc + 6, cy - 1], [xc - 10, cy - 11 * k], [xc - 34 * k, cy - 8 * k], [xc - 46 * k, cy + 4 * k], [xc - 40 * k, cy + 12 * k], [xc - 28 * k, cy + 6 * k], [xc - 12, cy + 7]];
    polyPx(g, lip.map(([x, y]) => [x - 1, y - 1]), '#ffffff'); polyPx(g, lip, '#c8ecff'); polyPx(g, lip.slice(2, 6).map(([x, y]) => [x + 3, y + 1]), '#9bd6f7');
    for (let i = 0; i < 14; i++) { const q = (b * 1.7 + i * .29) % 1, an = -2.4 - hash2(i, 7) * 1.2, v = 26 + hash2(7, i) * 30; disc(g, xc - 40 * k + Math.cos(an) * v * q, cy + Math.sin(an) * v * q + 40 * q * q, 1.6 - q, '#ffffff'); }
  }
  // the sisters ride down the face ahead of the curl (facing left), well apart
  const ek = E.outBack(clamp((b - .3) / .6, 0, 1));
  if (ek > 0) for (const [who, dx, ph, col] of [['nala', 124, 1.7, '#e23b4e'], ['kira', 62, 0, '#3565cc']]) {
    const x = xc - dx + (1 - ek) * 170, y = crest(x), sl = clamp(Math.atan2(crest(x + 5) - crest(x - 5), 10), -.55, .55), bob = Math.sin(b * TAU * .5 + ph) * 2;
    for (let i = 1; i <= 5; i++) disc(g, x + 13 + i * 5, y + 1 + Math.sin(b * 9 + i) * 1.5, 2.3 - i * .3, '#ffffff');
    drawS(g, hermanasBoard(col), x, y - 1 + bob, { ax: .5, ay: .8, rot: sl, flip: true });
    drawS(g, hermanasAussieSide(who, 'run', 'happy', .55), x - 2, y - 3 + bob, { ax: .5, ay: 1, rot: sl * .8, flip: true });
  }
  // the words, in their surf face, blown in from the right
  const nk = t - .12, [w1, w2] = HERMANAS_WORDS.speed;
  if (nk > 0) {
    cardWord(g, w1, 58, 8, hermanasFitWord('speed', w1), { anim: i => cardAnimSlide(nk, i, { from: 200, rot: -.5, stagger: .05 }) });
    cardWord(g, w2, 96, 38, hermanasFitWord('speed', w2), { anim: i => cardAnimSlide(nk - .15, i, { from: 200, rot: -.5, stagger: .05 }) });
  }
  if (b > .3 && hermanasOnce(S, 'wave')) sfx('splash', { vol: .7, pitch: .8 });
}
// the thief's shadow on the sand: a huge gull shape flattened on the ground
function hermanasGullShadow(g, x, y, s, b) {
  const f = Math.sin(b * 9) * 6 * s;
  g.globalAlpha = .45;
  polyPx(g, [[x - 26 * s, y - 2 * s], [x - 6 * s, y - 5 * s - f * .4], [x + 2 * s, y - 2 * s], [x + 10 * s, y - 5 * s - f * .4], [x + 30 * s, y - 2 * s], [x + 8 * s, y + 2 * s], [x - 6 * s, y + 2 * s]], '#0e0b16');
  ellipsePx(g, x + 2 * s, y, 12 * s, 3 * s, '#0e0b16'); ellipsePx(g, x + 14 * s, y - 1 * s, 4 * s, 2 * s, '#0e0b16');
  g.globalAlpha = 1;
}
// SE BUSCA: the gull's wanted poster
function hermanasWanted() {
  return mdl('hermanas:wanted', () => {
    const W = 100, Hh = 116, c = mkCanvas(W, Hh), g = c.g;
    const edge = []; for (let i = 0; i <= 10; i++) edge.push([4 + i * 9.2, 4 + (i % 2 ? 1.5 : 0)]); for (let i = 0; i <= 12; i++) edge.push([W - 4 + (i % 2 ? -1.5 : 0), 4 + i * 9]); for (let i = 10; i >= 0; i--) edge.push([4 + i * 9.2, Hh - 4 - (i % 2 ? 1.5 : 0)]); for (let i = 12; i >= 0; i--) edge.push([4 + (i % 2 ? 1.5 : 0), 4 + i * 9]);
    polyPx(g, edge.map(([x, y]) => [x + 1, y + 2]), '#5a2c1e'); polyPx(g, edge, '#f2e2b8');
    for (let i = 0; i < 120; i++) px(g, 6 + hash2(i, 81) * (W - 12), 6 + hash2(81, i) * (Hh - 12), hash2(i, 5) < .5 ? '#e6d2a0' : '#fff4d6');
    txt(g, 'SE BUSCA', W / 2, 9, '#7c1830', { align: 'c', bold: true });
    hline(g, 12, W - 12, 20, '#7c1830');
    rect(g, 26, 25, 48, 54, INK); rect(g, 27, 26, 46, 52, '#a8d8ff'); rect(g, 27, 62, 46, 16, '#f2d59a');
    g.drawImage(hermanasGullStand('smug'), 31, 30);
    txt(g, 'LA GAVIOTA', W / 2, 83, INK, { align: 'c', bold: true });
    txt(g, 'LADRONA', W / 2, 93, INK, { align: 'c', bold: true });
    tiny(g, 'RECOMPENSA: 1 FRISBI', W / 2, 105, '#7c1830', { align: 'c' });
    disc(g, W / 2, 5, 3, INK); disc(g, W / 2, 5, 2, '#c8c6d3'); px(g, W / 2 - 1, 4, '#ffffff');
    return c;
  });
}
// ---- ¡JUEGO DEL JEFE!: the sky darkens, a shadow sweeps the beach, SE BUSCA
function hermanasBossFx(g, S, t) {
  const b = t * S.bpm / 60;
  g.drawImage(hermanasBeachBg(), 0, 0);
  g.globalAlpha = Math.min(.55, b * .7); rect(g, 0, 0, SW, SH, '#1b1030'); g.globalAlpha = 1;
  const sk = clamp(b / 1.3, 0, 1); if (sk < 1) hermanasGullShadow(g, lerp(-90, 340, E.ioQ(sk)), 164, 2.6, b);
  // the sisters freeze, looking up, trembling
  const tr = b > .4 ? Math.sin(b * 40) * .8 : 0;
  shadowOval(g, 46, 185, 20, 2.5, .45); shadowOval(g, 106, 185, 20, 2.5, .45);
  drawS(g, hermanasAussieSide('kira', 'stand', 'wow', .62), 46 + tr, 184, { ax: .5, ay: 1 });
  drawS(g, hermanasAussieSide('nala', 'stand', 'wow', .62), 106 - tr, 184, { ax: .5, ay: 1, flip: true });
  if (b > .5 && b < 2.2) { txt(g, '!', 58, 126 - Math.min(1, (b - .5) * 4) * 6, '#ffffff', { align: 'c', out: INK, bold: true }); txt(g, '!', 96, 126 - Math.min(1, (b - .5) * 4) * 6, '#ffffff', { align: 'c', out: INK, bold: true }); }
  // the poster drops on its nail and swings to rest
  const pk = clamp((b - .9) / .55, 0, 1);
  if (pk > 0) { const drop = (1 - E.outBounce(pk)) * -170, sw = Math.sin(b * 6) * .08 * Math.max(0, 1 - (b - 1.4) / 2.2); g.save(); g.translate(194, 44 + drop); g.rotate(sw); g.drawImage(hermanasWanted(), -50, -4); g.restore(); if (pk >= 1 && hermanasOnce(S, 'poster')) sfx('stamp'); }
  // the words, in the storm-red surf face
  const nk = t - .08, [w1, w2] = HERMANAS_WORDS.boss;
  if (nk > 0) {
    cardWord(g, w1, 70, 22, hermanasFitWord('boss', w1), { anim: i => cardAnimDrop(nk, i, { h: -40, stagger: .045 }) });
    cardWord(g, w2, 74, 54, hermanasFitWord('boss', w2), { anim: i => cardAnimDrop(nk - .14, i, { h: -40, stagger: .045 }) });
  }
  // the gull herself crosses over everything with the frisbee, cackling
  const gk = (b - 2.1) / 1.4; if (gk > 0 && gk < 1) { const gx = lerp(290, -60, gk), gy = 110 - Math.sin(gk * Math.PI) * 26; drawS(g, hermanasGullSpr(fl(b * 10) % 3, true, 'smug'), gx, gy, { flip: true }); if (gk > .15 && gk < .7) shout(g, '¡CRUAC!', gx + 8, gy - 28, (gk - .15) * 2); if (hermanasOnce(S, 'cruac')) sfx('hermanasCruac'); }
}
// the lifeguard's pole and flag (yellow, then red)
function hermanasFlag(g, x, y, b, red) {
  vline(g, x - 1, y, 162, INK); vline(g, x, y, 162, '#c8c6d3'); vline(g, x + 1, y, 162, '#9896a4'); disc(g, x, y - 1, 2, INK); disc(g, x, y - 1, 1.3, '#ffdf4f');
  const col = red ? '#e23b4e' : '#ffdf4f', dark = red ? '#8c1d30' : '#c98a10', pts = [], n = 10, len = 34;
  for (let i = 0; i <= n; i++) pts.push([x + 2 + i * len / n, y + 2 + Math.sin(b * 8 - i * .6) * (1 + i * .3)]);
  for (let i = n; i >= 0; i--) pts.push([x + 2 + i * len / n, y + 22 + Math.sin(b * 8 - i * .6) * (1 + i * .3)]);
  polyPx(g, pts.map(([a, c]) => [a + 1, c + 1]), INK); polyPx(g, pts, col);
  for (let i = 1; i < n; i += 3) { const [a, c] = pts[i]; vline(g, a, c + 2, c + 18, dark); }
}
function hermanasStormCloud(g, x, y, i) {
  const s = .8 + (i % 3) * .2;
  for (const [dx, dy, r] of [[0, 4, 9], [10, 0, 12], [22, 4, 10], [12, 8, 9]]) disc(g, x + dx * s, y + dy * s + 1, r * s + 1, '#1b1627');
  for (const [dx, dy, r] of [[0, 4, 9], [10, 0, 12], [22, 4, 10], [12, 8, 9]]) disc(g, x + dx * s, y + dy * s, r * s, '#4d5670');
  disc(g, x + 8 * s, y - 2 * s, 6 * s, '#6a6580');
}
// ---- ¡MÁS DIFÍCIL!: storm clouds roll in, lightning, the flag turns red
function hermanasLevelFx(g, S, t) {
  const b = t * S.bpm / 60, dk = clamp(b / .8, 0, 1);
  g.drawImage(hermanasBeachBg(), 0, 0);
  g.globalAlpha = .5 * dk; rect(g, 0, 0, SW, SH, '#243248'); g.globalAlpha = 1;
  // the sisters huddle under the umbrella, ears down
  shadowOval(g, 48, 186, 22, 2.5, .45); shadowOval(g, 104, 186, 22, 2.5, .45);
  drawS(g, hermanasAussieSide('kira', 'lie', 'sad', .6), 50, 186, { ax: .5, ay: 1 });
  drawS(g, hermanasAussieSide('nala', 'lie', 'sad', .6), 104, 186, { ax: .5, ay: 1, flip: true });
  for (let i = 0; i < 9; i++) hermanasStormCloud(g, lerp(-80, -10, E.outQ(dk)) + i * 32 + Math.sin(b * .9 + i) * 3, lerp(-40, 4 + (i % 3) * 9, E.outQ(dk)), i);
  for (let i = 0; i < 44; i++) { const x = (i * 29 + b * 70) % (SW + 40) - 10, y = (i * 47 + b * 240) % SH; if (y > 18) linePx(g, x, y, x - 3, y + 7, 'rgba(200,220,255,.7)'); }
  const red = b > 1.25;
  hermanasFlag(g, 212, 64, b, red);
  if (b > 1.18 && b < 1.5) {
    const k = (1.5 - b) / .32; g.globalAlpha = k * .8; rect(g, 0, 0, SW, SH, '#ffffff'); g.globalAlpha = 1;
    const bolt = [[150, 10], [138, 44], [150, 44], [132, 86], [158, 38], [146, 38], [160, 10]]; polyPx(g, bolt.map(([x, y]) => [x + 1, y + 1]), INK); polyPx(g, bolt, '#fff7ae');
    if (hermanasOnce(S, 'thunder')) { sfx('boom', { vol: .6, pitch: .7 }); shake('top', 3, .3); }
  }
  if (red && b < 2.6) shout(g, '¡BANDERA ROJA!', 196, 46, (b - 1.25) * 1.6);
  const f = hermanasFaces(), nk = t - .15, [w1, w2] = HERMANAS_WORDS.level, jolt = b > 1.2 && b < 1.6 ? Math.sin(b * 80) * 2 : 0;
  if (nk > 0) {
    cardWord(g, w1, 70 + jolt, 44, hermanasFitWord('level', w1), { anim: i => cardAnimDrop(nk, i, { stagger: .05 }) });
    cardWord(g, w2, 96 + jolt, 76, hermanasFitWord('level', w2), { anim: i => cardAnimDrop(nk - .12, i, { stagger: .05 }) });
  }
}
function hermanasSpecial(g, S, kind, t) {
  if (typeof cardWord !== 'function') return false;
  if (kind === 'speed') hermanasSpeedFx(g, S, t);
  else if (kind === 'boss') hermanasBossFx(g, S, t);
  else if (kind === 'level') hermanasLevelFx(g, S, t);
  else return false;
}
// the bottom screen: a lifeguard's wooden board with the news in chalk
function hermanasSpecialBot(g, S, kind, t) {
  const lbl = HERMANAS_LABELS[kind]; if (!lbl) return false;
  const b = t * S.bpm / 60, k = E.outBack(clamp(b * 1.6, 0, 1)), w = txtW(lbl) + lbl.length + 44, x0 = rd(SW / 2 - w / 2), y = rd(3 - (1 - k) * 36);
  rect(g, x0 - 1, y - 1, w + 2, 26, INK); rect(g, x0, y, w, 24, RAMP.wood[3]); rect(g, x0, y, w, 1, RAMP.wood[4]); rect(g, x0, y + 23, w, 1, RAMP.wood[1]);
  for (let i = 0; i < 4; i++) hline(g, x0 + 22 + i * 34, x0 + 38 + i * 34, y + 5 + (i % 3) * 7, RAMP.wood[2]);
  for (const nx of [x0 + 3, x0 + w - 4]) { px(g, nx, y + 3, RAMP.steel[3]); px(g, nx, y + 20, RAMP.steel[3]); }
  // a chalk pictogram: a wave, the gull, the red flag
  const ix = x0 + 13, iy = y + 12, ch = '#ffffff';
  if (kind === 'speed') { for (let i = 0; i < 9; i++) px(g, ix - 6 + i, iy + 3 - rd(Math.sin(i * .7) * 4), ch); px(g, ix + 2, iy - 3, ch); px(g, ix + 1, iy - 4, ch); }
  else if (kind === 'boss') { linePx(g, ix - 7, iy - 1, ix - 2, iy + 2, ch); linePx(g, ix - 2, iy + 2, ix, iy, ch); linePx(g, ix, iy, ix + 2, iy + 2, ch); linePx(g, ix + 2, iy + 2, ix + 7, iy - 1, ch); }
  else { vline(g, ix - 4, iy - 7, iy + 7, ch); rect(g, ix - 3, iy - 7, 9, 6, '#e23b4e'); }
  const col = kind === 'boss' ? '#ffd49b' : kind === 'level' ? '#ffc2c2' : '#ffffff';
  txt(g, lbl, x0 + 26 + (w - 30) / 2, y + 8, col, { align: 'c', out: RAMP.wood[0], bold: true });
}

// ---------------------------------------------------------------- music -----
const HERMANAS_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'pluck', v: .75, n: 'E4 . E4 G4 . E4 A4 . B4 . A4 G4 E4 - - .' },
    { i: 'kalimba', v: .45, n: '. . . . . . . . E5 . D5 B4 E5 - - .' },
    { i: 'bass', v: .85, n: 'E2 . E2 . E2 . E2 . A2 . A2 . B2 - - .' },
    { i: 'd', v: .75, n: 'k . h . s . h h k . h . s+x - - .' }] },
  ready: { spb: 4, tracks: [{ i: 'kalimba', v: .7, n: 'B4 . E5 . G#5 . B5 .' }, { i: 'bass', v: .8, n: 'E3 . . . B2 . . .' }, { i: 'd', v: .7, n: 'k . h . s . h h' }] },
  win: { spb: 4, tracks: [{ i: 'kalimba', v: .7, n: 'E5 G#5 B5 E6 G#6! - E6 .' }, { i: 'pluck', v: .45, n: 'E4+G#4+B4 . . . E5+G#5+B5 - . .' }, { i: 'bass', v: .85, n: 'E3 . B2 . E3 . . .' }, { i: 'd', v: .8, n: 'k . s . k k s .' }] },
  lose: { spb: 4, tracks: [{ i: 'pluck', v: .75, n: 'G4 - F#4 - F4 - E4 -' }, { i: 'bass', v: .85, n: 'C3 . B2 . Bb2 . A2 .' }, { i: 'd', v: .7, n: 'k . . . k . . .' }] },
  next: { spb: 4, tracks: [{ i: 'kalimba', v: .6, n: 'B4 . C#5 . D#5 . F#5 .' }, { i: 'bass', v: .85, n: 'B2 . . . B2 . B2 .' }, { i: 'd', v: .8, n: 'k . h . s . s s' }] },
  play: { spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'E4 . E4 E4 G4 . E4 . A4 . G4 . E4 . D4 . E4 . E4 E4 G4 . B4 . A4 . G4 . E4 - . .' },
    { i: 'bass', v: .85, n: 'E2 . E2 . E2 . E2 . A2 . A2 . A2 . A2 . E2 . E2 . G2 . G2 . A2 . B2 . E2 . . .' },
    { i: 'd', v: .75, n: 'k . h . s . h . k k h . s . h . k . h . s . h . k k h . s s s s' }] },
  boss: { spb: 4, tracks: [
    { i: 'pluck', v: .62, n: 'E4 E4 G4 E4 A4 E4 Bb4 A4 G4 E4 D4 E4 G4 . . . E4 E4 G4 E4 A4 E4 C5 B4 A4 G4 E4 G4 E4 . . .' },
    { i: 'p25', v: .35, n: 'E5 . . . . . . . G5 . . . A5 . . . E5 . . . . . . . C6 . B5 . A5 . G5 .' },
    { i: 'bass', v: .9, n: 'E2 E2 E2 E2 E2 E2 E2 E2 C3 C3 C3 C3 D3 D3 D3 D3 E2 E2 E2 E2 E2 E2 E2 E2 C3 C3 D3 D3 E2 E2 B1 B1' },
    { i: 'd', v: .85, n: 'k h s h k h s h k h s h k s s s k h s h k h s h k h s h k s s+x s' }] },
};

// the announcements' own jingles (4 beats): surf rock, the gull's alarm, a storm
HERMANAS_SONGS.jingles = {
  speed: { spb: 4, tracks: [
    { i: 'pluck', v: .75, n: 'E4 G#4 B4 E5 G#5 B5 E6 B5 G#5 E5 G#5 B5 E6! - - .' },
    { i: 'kalimba', v: .45, n: '. . . . . . . . E5 . G#5 . B5! - - .' },
    { i: 'bass', v: .85, n: 'E2 E2 E3 E2 E2 E2 E3 E2 A2 A2 A3 A2 E2! - . .' },
    { i: 'd', v: .85, n: 'k h s h k h s h k s s s k+x - . .' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .75, n: 'E3 - - . E3 - - . G3 - - . A#3! - - -' },
    { i: 'squeak', v: .55, n: '. . . . . . . . B5 . A5 . . . . .' },
    { i: 'bass', v: .85, n: 'E2 - - . E2 - - . G2 - - . A#2! - - -' },
    { i: 'd', v: .9, n: 'T . . T T . . T T . T T T T k+x .' }] },
  level: { spb: 4, tracks: [
    { i: 'pluck', v: .72, n: 'E5 D#5 D5 C#5 C5 B4 A#4 A4 E4 G4 A#4 C#5 E5! - - .' },
    { i: 'bass', v: .85, n: 'E2 . E2 . D2 . D2 . C2 . C2 . B1! - . .' },
    { i: 'd', v: .85, n: 'k . h . k . h . k . s s k+x - . x' }] },
};

// ---------------------------------------------------------------- voices ----
VOICES.kira = { base: 74, scale: [0, 2, 4, 7, 9], inst: 'kalimba', len: .04 };
VOICES.nala = { base: 79, scale: [0, 2, 5, 7, 9], inst: 'p12', len: .035 };
VOICES.gaviota = { base: 62, scale: [0, 1, 6, 7], inst: 'squeak', len: .05 };
WHO.kira = { name: 'Kira', col: '#3565cc', voice: 'kira' };
WHO.nala = { name: 'Nala', col: '#c02d45', voice: 'nala' };
WHO.gaviota = { name: 'Gaviota', col: '#6b6977', voice: 'gaviota' };
WHO.chuche = { name: 'Chuche', col: '#e2b21b', voice: 'gaviota' };
// a sheep's "¡beee!" and a seagull's "¡cruac!", made here, for this stage
SFX.hermanasBleat = (t, d, p, v) => { const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(420 * p, t); o.frequency.linearRampToValueAtTime(380 * p, t + .35); const l = AU.ctx.createOscillator(), lg = AU.ctx.createGain(); l.frequency.value = 18; lg.gain.value = 30 * p; l.connect(lg); lg.connect(o.frequency); const f1 = filt('bandpass', 900 * p, 3, d), f2 = filt('bandpass', 2400 * p, 4, d); const g = AU.ctx.createGain(); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.7 * v, t + .04); g.gain.exponentialRampToValueAtTime(.001, t + .42); o.connect(g); g.connect(f1); g.connect(f2); o.start(t); o.stop(t + .45); l.start(t); l.stop(t + .45); };
SFX.hermanasCruac = (t, d, p, v) => { for (const q of [0, .13]) { const o = AU.ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1300 * p, t + q); o.frequency.exponentialRampToValueAtTime(700 * p, t + q + .1); const f = filt('bandpass', 1800 * p, 2, d), g = AU.ctx.createGain(); g.gain.setValueAtTime(.001, t + q); g.gain.exponentialRampToValueAtTime(.4 * v, t + q + .01); g.gain.exponentialRampToValueAtTime(.001, t + q + .11); o.connect(g); g.connect(f); o.start(t + q); o.stop(t + q + .12); } };

// ---------------------------------------------------------------- story -----
defCut('hermanas_in', {
  song: { spb: 4, loop: true, tracks: HERMANAS_SONGS.play.tracks },
  shots: [
    { dur: 3.6, box: 'none', sfx: [[.4, 'swoosh'], [1.9, 'hermanasCruac'], [2.1, 'whoosh'], [2.6, 'bark', { n: 2, pitch: 1.2 }]],
      tall(g, t) {
        // top: sky + sea; bottom: the beach where they play
        g.drawImage(hermanasBeachBg(), 0, 0, SW, 130, 0, 0, SW, 130);
        bandsV(g, 0, 130, SW, SH + HINGE - 130 + 20, ['#2f7cc4', '#3d93d6', '#5aaee6', '#7cc0ee']);
        g.drawImage(hermanasBeachBotBg(), 0, SH + HINGE);
        const gy = SH + HINGE + 150;
        const k = clamp((t - .3) / 1.6, 0, 1), fx = lerp(70, 180, k), fyy = gy - 40 - Math.sin(k * Math.PI) * 150;
        drawS(g, hermanasAussieSide('kira', t < .6 ? 'bow' : 'stand', 'happy'), 56, gy, { ax: .5, ay: 1 });
        drawS(g, hermanasAussieSide('nala', t > 1.4 && t < 2.4 ? 'jump' : 'stand', t > 2.2 ? 'wow' : 'happy'), 196, gy - (t > 1.4 && t < 2.4 ? 14 : 0), { ax: .5, ay: 1, flip: true });
        // the seagull swoops and snatches it at the top of its arc
        const gk = clamp((t - 1.2) / 2.2, 0, 1), gx = lerp(-40, 300, gk), gyy = lerp(40, SH + 40, Math.sin(gk * Math.PI)) - gk * 120;
        const has = t > 1.9;
        if (!has) drawS(g, hermanasFrisbeeSpr(), fx, fyy, { rot: t * 8 });
        drawS(g, hermanasGullSpr(fl(t * 10) % 3, has, 'smug'), has ? gx : gx, has ? gyy : gyy);
        if (t > .3 && t < 1.1) shout(g, '¡TUYA!', 70, gy - 70, t - .3);
        if (t > 1.9 && t < 3) shout(g, '¡CRUAAC!', clamp(gx, 60, 196), clamp(gyy - 30, 30, 360), t - 1.9);
      } },
    { dur: 0, lines: [['nala', '¡EH! ¡Nuestro frisbee!'], ['gaviota', '¡Cruac! ¡Qué plato volador tan bonito! Me lo quedo.'], ['kira', 'Tranquila, Nala. Somos pastoras australianas.'], ['kira', 'Y las pastoras siempre tienen un PLAN.']],
      top(g, t) { g.drawImage(hermanasBeachBg(), 0, 0); vline(g, 200, 70, 170, INK); vline(g, 201, 70, 170, '#6b6977'); rect(g, 192, 66, 18, 6, INK); rect(g, 193, 67, 16, 4, '#9896a4'); drawS(g, hermanasGullStand('smug'), 201, 66, { ax: .5, ay: 1 }); drawS(g, hermanasFrisbeeSpr(), 208, 52, { rot: .2 }); },
      bot(g, t) { g.drawImage(hermanasBeachBotBg(), 0, 0); hermanasDrawAussieSit(g, 86, 170, 'kira', CUT.li >= 2 ? 'focus' : 'wow'); hermanasDrawAussieSit(g, 170, 170, 'nala', CUT.li === 0 ? 'wow' : CUT.li >= 2 ? 'happy' : 'sad', { tilt: CUT.li === 1 ? -.5 : 0 }); } },
    { dur: 0, lines: [['kira', 'Paso uno: rodearla. Paso dos: recuperar el frisbee. Paso tres: ¡merienda!'], ['nala', '¿Y si le dibujamos un bocata para despistarla?'], ['kira', '¡A dibujar!']],
      top(g, t) { g.drawImage(hermanasBeachBg(), 0, 0); hermanasDrawAussieSit(g, 96, 188, 'kira', 'focus'); hermanasDrawAussieSit(g, 164, 188, 'nala', CUT.li >= 1 ? 'happy' : 'normal', { tilt: Math.sin(t * 3) * .3 }); },
      bot(g, t) {
        rect(g, 0, 0, SW, SH, '#243029'); ringRect(g, 0, 0, SW, SH, 5, RAMP.wood[3]); ringRect(g, 0, 0, SW, SH, 1, INK);
        txt(g, 'PLAN «FRISBEE»', SW / 2, 12, '#e8e8e0', { align: 'c', bold: true });
        // chalk plan animating in: the gull, a loop around it, an arrow back home, a sandwich
        const k = clamp(t / 2.4, 0, 1);
        drawS(g, silhouette(hermanasGullStand('smug'), '#e8e8e0'), 64, 90, { alpha: .9 });
        const n = fl(k * 40); for (let i = 0; i < n; i++) { const a = i / 40 * TAU; px(g, 64 + Math.cos(a) * 28, 80 + Math.sin(a) * 24, '#ffb3d1'); px(g, 64 + Math.cos(a) * 28 + 1, 80 + Math.sin(a) * 24, '#ffb3d1'); }
        if (k > .5) { const q = (k - .5) * 2; for (let i = 0; i < q * 60; i++) px(g, 100 + i * 1.6, 80 + Math.sin(i * .12) * 8, '#e8e8e0'); if (q > .9) polyPx(g, [[196, 72], [206, 80], [196, 88]], '#e8e8e0'); }
        if (CUT.li >= 1) { const bx = 200, by = 130; rect(g, bx - 18, by, 36, 4, '#e8c07a'); rect(g, bx - 17, by + 4, 34, 3, '#5bd18b'); rect(g, bx - 17, by + 7, 34, 3, '#ec5e5e'); rect(g, bx - 18, by + 10, 36, 5, '#e8c07a'); }
        txt(g, '1', 30, 40, '#fff27a', { bold: true }); txt(g, '2', 150, 56, '#fff27a', { bold: true }); if (CUT.li >= 1) txt(g, '3', 170, 120, '#fff27a', { bold: true });
      } },
  ],
});
defCut('hermanas_out', {
  song: { spb: 4, loop: true, tracks: HERMANAS_SONGS.card.tracks },
  shots: [
    { dur: 0, lines: [['gaviota', 'Vale, vale… me rindo. Solo quería que alguien jugara conmigo.'], ['nala', '¿Jugar? ¡Haberlo dicho antes! ¡Tuya!']],
      top(g, t) { g.drawImage(hermanasBeachBg(), 0, 0); g.globalAlpha = .35; rect(g, 0, 0, SW, SH, '#ff7a4a'); g.globalAlpha = 1; disc(g, 128, 98, 18, '#ffd23f'); rect(g, 0, 98, SW, 3, '#ff9f4f'); },
      bot(g, t) { g.drawImage(hermanasBeachBotBg(), 0, 0); hermanasDrawAussieSit(g, 70, 170, 'kira', 'happy'); hermanasDrawAussieSit(g, 186, 170, 'nala', CUT.li === 1 ? 'happy' : 'normal'); drawS(g, hermanasGullStand('shy'), 128, 172, { ax: .5, ay: 1 }); if (CUT.li === 1) drawS(g, hermanasFrisbeeSpr(), 150, 120 - Math.abs(Math.sin(t * 5)) * 10, { rot: t * 6 }); } },
    { dur: 0, lines: [['kira', 'Se queda con nosotras. La llamaremos… Chuche.'], ['chuche', '¿Chuche? …¡Me encanta! ¡CRUAC!'], ['narr', 'Desde entonces, Chuche vigila la Barceloneta. Y los bocatas.']],
      top(g, t) { g.drawImage(hermanasBeachBg(), 0, 0); const gx = 128 + Math.sin(t * 1.5) * 70, gy = 60 + Math.cos(t * 3) * 14; drawS(g, hermanasGullSpr(fl(t * 10) % 3, true, 'smug'), gx, gy, { flip: Math.cos(t * 1.5) < 0 }); for (let i = 0; i < 3; i++) drawHeart(g, gx - 20 + i * 10, gy - 20 - (t * 20 + i * 7) % 20, '#ff4060', .8); },
      bot(g, t) { g.drawImage(hermanasBeachBotBg(), 0, 0); hermanasDrawAussieSit(g, 90, 170, 'kira', 'love'); hermanasDrawAussieSit(g, 166, 170, 'nala', 'happy', { tilt: Math.sin(t * 4) * .4 }); for (let i = 0; i < 5; i++) drawStar(g, 30 + i * 50, 40 + Math.sin(t * 5 + i) * 6, 3, '#fff27a'); } },
  ],
});

// ---------------------------------------------------------------- stage -----
defStage({
  id: 'hermanas', name: 'KIRA & NALA', sub: '«Pastoras de playa»', verb: '¡DIBUJA!', mech: 'draw', bpm: 120,
  games: ['pizarra', 'rebano', 'correas', 'rampa', 'lazo'], boss: 'gaviota', bossAt: 10, speedAt: [4, 7], unlockBy: 'pompon',
  portrait: (k) => mdl('hermanas:hermPortrait' + (k === 'sad' ? 'S' : ''), () => { const c = mkCanvas(100, 112), g = c.g, sad = k === 'sad'; hermanasDrawAussieSit(g, 34, 108, 'kira', sad ? 'sad' : 'happy'); hermanasDrawAussieSit(g, 66, 110, 'nala', sad ? 'sad' : 'wink'); return c; }),
  face: () => mdl('hermanas:hermFace', () => { const c = mkCanvas(44, 40), g = c.g; drawS(g, hermanasAussieHead('kira', 'happy'), 10, 24, { ax: .5, ay: .5 }); drawS(g, hermanasAussieHead('nala', 'happy'), 34, 26, { ax: .5, ay: .5 }); return c; }),
  peek: (g, x, y, t) => { drawS(g, hermanasAussieHead('kira', 'happy'), x - 12, y - 8, { ax: .5, ay: 1 }); drawS(g, hermanasAussieHead('nala', fl(t) % 3 ? 'happy' : 'wink'), x + 14, y - 4, { ax: .5, ay: 1 }); },
  rim: '#3d93d6', cardCols: ['#2f7cc4', '#3d93d6'], nameFill: ['#ffffff', '#b3d9ff', '#63a0ef'],
  tip: 'Traza, guía, une, rodea… ¡con el dedo!',
  songs: HERMANAS_SONGS,
  intro: 'hermanas_in', outro: 'hermanas_out',
  room: {
    top: hermanasRoomTop, bot: hermanasRoomBot, frame: 'hermanasChalk', life: hermanasLife, lifeY: 150, lifeSpacing: 36, miniLife: hermanasMiniLife,
    counter: { x: SW / 2, y: 7 }, counterFill: ['#ffffff', '#ffffff', '#fff2c0'], mini: hermanasMini, playTop: hermanasPlayTop, portal: { x: 64, y: 26, w: 128, h: 96 },
    staticCols: ['#243029', '#2c3b35'], cardCol: RAMP.water, special: hermanasSpecial, specialBot: hermanasSpecialBot,
  },
});

// ---------------------------------------------------------------- chibi -----
// the two sisters trotting side by side (menu walker); frames walk0 | walk1 | idle | happy | held
function hermanasChibi(fr = 'idle') {
  return mdl('chibi:hermanas:' + fr, () => {
    const W = 38, H = 28, c = mkCanvas(W, H), g = c.g;
    const layer = fn => { const L = mkCanvas(W, H); fn(L.g); g.drawImage(outlined(L, INK, false), -1, -1); };
    const st = fr === 'walk0' ? 1 : fr === 'walk1' ? -1 : 0, held = fr === 'held', happy = fr === 'happy';
    const dog = (who, bx, by, phase) => {
      const A = HERMANAS_AUS[who], base = A.base[3], mid = A.base[2], dark = A.dark[1], W2 = '#ffffff', Wd = '#c8c6d8', CU = RAMP.copper[3];
      const s = st * phase, lift = happy ? 3 : held ? 2 : 0, y0 = by - lift;
      // legs (4), white socks
      layer(q => {
        const legs = held ? [[-6, 2], [-3, 2], [3, 2], [6, 2]] : [[-6, s], [-3, -s], [3, s], [6, -s]];
        for (const [dx, o] of legs) { const lx = bx + dx + (held ? (dx < 0 ? -1 : 1) : 0), top = y0 + 2, bot = y0 + 7 + (held ? 1 : 0) - Math.max(0, -o); rect(q, lx, top, 2, bot - top, dx < 0 ? mid : base); rect(q, lx, bot - 2, 2, 2, W2); }
      });
      // body + bob tail + white chest
      layer(q => {
        ellipsePx(q, bx, y0, 7, 4.2, base); ellipsePx(q, bx - 1, y0 - 1, 4.5, 2.2, A.base[4]);
        disc(q, bx - 7, y0 - 3, 1.8, base);
        for (const [dx, dy, r] of [[-3, 1, 1.6], [1, -2, 1.3], [-5, -1, 1.1]]) disc(q, bx + dx, y0 + dy, r, dark);
        ellipsePx(q, bx + 5, y0 + 1, 2.4, 2.6, W2); px(q, bx + 5, y0 + 3, Wd);
      });
      // head, ears, blaze, muzzle, bandana
      layer(q => {
        const hx = bx + 7, hy = y0 - 5 + (happy ? -1 : 0);
        disc(q, hx, hy, 4.4, base); disc(q, hx - 1, hy - 1, 2.2, A.base[4]);
        polyPx(q, [[hx - 3, hy - 3], [hx - 1, hy - 8], [hx + 1, hy - 3]], base); px(q, hx - 1, hy - 7, dark); px(q, hx, hy - 6, dark);
        disc(q, hx + 2, hy - 2, 1.2, dark);
        rect(q, hx, hy - 4, 1, 4, W2);
        ellipsePx(q, hx + 4, hy + 1.5, 2.6, 1.9, W2);
      });
      layer(q => { const hx = bx + 7, hy = y0 - 5 + (happy ? -1 : 0); polyPx(q, [[hx - 4, hy + 3], [hx + 3, hy + 3], [hx - 1, hy + 7]], A.band[2]); hline(q, hx - 3, hx + 2, hy + 3, A.band[3]); });
      // face details
      const hx = bx + 7, hy = y0 - 5 + (happy ? -1 : 0);
      if (happy) { px(g, hx + 1, hy - 1, INK); px(g, hx + 2, hy - 2, INK); px(g, hx + 3, hy - 1, INK); rect(g, hx + 4, hy + 2, 2, 2, RAMP.pink[2]); }
      else if (held) { rect(g, hx + 1, hy - 2, 2, 3, INK); px(g, hx + 1, hy - 2, '#ffffff'); rect(g, hx + 5, hy + 2, 1, 2, '#3e0d1c'); }
      else { rect(g, hx + 1, hy - 2, 2, 2, INK); px(g, hx + 2, hy - 1, who === 'kira' ? A.eyeN : A.eyeF); px(g, hx + 1, hy - 2, '#ffffff'); }
      px(g, hx + 1, hy - 4, CU);
      rect(g, hx + 6, hy + 0, 2, 2, INK);
      px(g, hx + 2, hy + 1, RAMP.pink[3]);
    };
    dog('kira', 11, 18, 1);
    dog('nala', 25, 19, -1);
    return c;
  });
}
STAGES.hermanas.chibi = hermanasChibi;
