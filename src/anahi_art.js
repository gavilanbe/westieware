// ============================================================================
//  ANAHÍ — redesigned after the user's own video: long loose brown hair with a
//  side parting, round face, big glossy eyes, rosy cheeks, black tee, a
//  crossbody bag with a gold strap and mustard monogram trousers.
//  Clean cartoon look: ink outline all round, flat 3-tone shading, the face
//  painted by hand per expression. Built in a 100x204 space and scaled (k).
// ============================================================================
'use strict';

const ANA_C = {
  skin: ['#d4927a', '#f5c6a5', '#ffe0c8'], hair: ['#20120d', '#3a2217', '#5a3524'],
  tee: ['#0f0d14', '#211d29', '#3a3446'], pants: ['#a45a18', '#d68b27', '#f2b044'],
  strap: ['#6b3f14', '#c28a2e', '#e8b85c'], shoe: ['#15101c', '#2b2433', '#453d52'],
  blush: '#f08a80', lip: '#b3303d', lipD: '#6e1624', brow: '#2a1811', eye: '#1d1424',
};
// pose: arms (hand targets in the 100x204 space), hand shapes, default face
const ANA2 = {
  idle: { l: [22, 133], r: [78, 133], hl: 'open', hr: 'open', ex: 'smile' },
  thumbs: { l: [15, 72], r: [78, 133], hl: 'thumb', hr: 'open', ex: 'grin' },
  ready: { l: [15, 72], r: [78, 133], hl: 'thumb', hr: 'open', ex: 'wink' },
  win: { l: [16, 70], r: [80, 126], hl: 'thumb', hr: 'open', ex: 'grin' },
  cheer: { l: [14, 50], r: [86, 50], hl: 'fist', hr: 'fist', ex: 'grin' },
  clear: { l: [14, 50], r: [86, 50], hl: 'fist', hr: 'fist', ex: 'grin' },
  sad: { l: [44, 126], r: [56, 126], hl: 'open', hr: 'open', ex: 'sad' },
  lose: { l: [44, 126], r: [56, 126], hl: 'open', hr: 'open', ex: 'sad' },
  over: { l: [30, 136], r: [70, 136], hl: 'open', hr: 'open', ex: 'cry' },
  wow: { l: [24, 66], r: [76, 66], hl: 'open', hr: 'open', ex: 'wow' },
  boss: { l: [24, 66], r: [76, 66], hl: 'open', hr: 'open', ex: 'gasp' },
  euro: { l: [45, 100], r: [55, 100], hl: 'fist', hr: 'fist', ex: 'euro' },
  headhand: { l: [36, 45], r: [78, 133], hl: 'hidden', hr: 'open', ex: 'smile' },
  work: { l: [22, 104], r: [78, 104], hl: 'fist', hr: 'fist', ex: 'focus', tl: 'scissors', tr: 'comb' },
  speed: { l: [18, 96], r: [80, 104], hl: 'fist', hr: 'fist', ex: 'focus', tl: 'scissors', tr: 'comb' },
  talk: { l: [22, 133], r: [85, 98], hl: 'open', hr: 'open', ex: 'talk' },
  think: { l: [21, 130], r: [58, 60], hl: 'open', hr: 'fist', ex: 'hmm' },
};
const ANA_POSES = ANA2; // old name, same table
function ik2(sx, sy, hx, hy, L1, L2, bend) {
  const d = Math.min(L1 + L2 - .01, Math.hypot(hx - sx, hy - sy)), a = Math.atan2(hy - sy, hx - sx);
  const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1), A = Math.acos(cosA);
  const e = a + A * bend; return [sx + Math.cos(e) * L1, sy + Math.sin(e) * L1];
}
// the body model (no face): k scales everything
function anahiModel(pose, k) {
  return mdl('ana2:' + pose + ':' + k, () => {
    const P = ANA2[pose] || ANA2.idle, S = f => (x, y) => f(x / k, y / k) * k;
    const W = Math.ceil(100 * k), H = Math.ceil(204 * k);
    const sL = [27, 88], sR = [73, 88];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 23, 23, P.l[1] < 80 ? -1 : 1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 23, 23, P.r[1] < 80 ? 1 : -1);
    // head + hair (the head sits low on a short neck, like her drawing)
    const HY = 5; // head drop
    const face = SD.smooth(5, SD.ellipse(50, 44 + HY, 21, 22), SD.ellipse(50, 55 + HY, 15.5, 11));
    const earL = SD.ellipse(29.5, 48 + HY, 3.4, 5), earR = SD.ellipse(70.5, 48 + HY, 3.4, 5);
    const hairBack = SD.smooth(6, SD.ellipse(50, 43 + HY, 27, 28), SD.shag(SD.box(50, 86, 25, 27, 11), 1.2, .18, 4));
    const crown = SD.sub(SD.ellipse(50, 38 + HY, 24.5, 22), SD.smooth(4, SD.ellipse(50, 57 + HY, 22, 22), SD.ellipse(40, 51 + HY, 18, 12)));
    // the fringe sweeps from the parting (her left) across the forehead to the right temple
    const fringe = SD.inter(SD.grow(SD.poly([[58, 16 + HY], [65, 23 + HY], [60, 29 + HY], [48, 32 + HY], [38, 37 + HY], [30, 44 + HY], [28, 31 + HY], [37, 20 + HY]]), .6), SD.ellipse(50, 39 + HY, 25, 23));
    const lockL = SD.curve([29, 44 + HY], [25, 70], [29, 100], 3.6, 2.2), lockR = SD.curve([71, 44 + HY], [75, 70], [71, 98], 3.4, 2.1);
    const neck = SD.box(50, 72, 7, 5.5, 2);
    // tee, arms, trousers, shoes
    const torso = SD.smooth(4, SD.ellipse(50, 88, 25, 9), SD.poly([[26, 88], [74, 88], [70, 130], [30, 130]]));
    const sleeveL = SD.capsule(sL[0], sL[1], lerp(sL[0], eL[0], .5), lerp(sL[1], eL[1], .5), 6.4, 5.8), sleeveR = SD.capsule(sR[0], sR[1], lerp(sR[0], eR[0], .5), lerp(sR[1], eR[1], .5), 6.4, 5.8);
    const upperL = SD.capsule(sL[0], sL[1], eL[0], eL[1], 4.6, 4), foreL = SD.capsule(eL[0], eL[1], P.l[0], P.l[1], 4, 3.4);
    const armL = SD.union(upperL, foreL);
    const armR = SD.union(SD.capsule(sR[0], sR[1], eR[0], eR[1], 4.6, 4), SD.capsule(eR[0], eR[1], P.r[0], P.r[1], 4, 3.4));
    const hand = (h, x, y, dir) => h === 'hidden' ? SD.circle(-99, -99, 1) : h === 'thumb' ? SD.union(SD.box(x, y + 3, 5, 5, 2.5), SD.capsule(x + dir * 1, y - 1, x + dir * 1.5, y - 10, 2.2, 2)) : h === 'fist' ? SD.box(x, y, 5, 5, 2.6) : SD.ellipse(x, y + 1, 4.6, 5.6);
    const handL = hand(P.hl, P.l[0], P.l[1], -1), handR = hand(P.hr, P.r[0], P.r[1], 1);
    const pants = SD.smooth(3, SD.box(50, 136, 21, 10, 3), SD.union(SD.poly([[29, 136], [50, 140], [48, 196], [27, 196]]), SD.poly([[71, 136], [50, 140], [52, 196], [73, 196]])));
    const shoes = SD.union(SD.box(38, 198, 11, 4, 3.5), SD.box(62, 198, 11, 4, 3.5));
    const strap = SD.capsule(71, 80, 34, 126, 2.3, 2.3);
    const bag = SD.box(31, 132, 9, 7.5, 4);
    const armsFront = pose === 'wow' || pose === 'boss' || pose === 'think' || pose === 'euro';
    const back = pose === 'headhand';
    const c = model(W, H, [
      { f: S(hairBack), ramp: ANA_C.hair, z: 0, th: 18 * k, dith: 0, amb: .35, tex: (x, y) => Math.sin(x / k * 1.1 + Math.sin(y / k * .09) * 2) * .06 },
      ...(back ? [{ f: S(upperL), ramp: ANA_C.skin, z: 2.45, th: 6 * k, dith: 0 }, { f: S(foreL), ramp: ANA_C.skin, z: .5, th: 6 * k, dith: 0 }, { f: S(SD.ellipse(P.l[0] + 2, P.l[1] - 3, 5, 6)), ramp: ANA_C.skin, z: .6, th: 5 * k, dith: 0, amb: .4 }]
        : [{ f: S(armL), ramp: ANA_C.skin, z: 2.4, th: 6 * k, dith: 0 }, { f: S(handL), ramp: ANA_C.skin, z: 2.5, th: 5 * k, dith: 0, amb: .4 }]),
      { f: S(shoes), ramp: ANA_C.shoe, z: 1, th: 5 * k, dith: 0, gloss: true },
      { f: S(pants), ramp: ANA_C.pants, z: 1.2, th: 12 * k, dith: 0, amb: .34 },
      { f: S(torso), ramp: ANA_C.tee, z: 1.5, th: 16 * k, dith: 0, amb: .3 },
      { f: S(neck), ramp: ANA_C.skin, z: 1.6, th: 4 * k, dith: 0, amb: .2 },
      { f: S(strap), ramp: ANA_C.strap, z: 1.8, th: 3 * k, dith: 0, flatV: .6, prof: 'flat', edge: true },
      { f: S(bag), ramp: ANA_C.strap, z: 1.9, th: 7 * k, dith: 0 },
      { f: S(earL), ramp: ANA_C.skin, z: 2, th: 3 * k, dith: 0 }, { f: S(earR), ramp: ANA_C.skin, z: 2, th: 3 * k, dith: 0 },
      { f: S(face), ramp: ANA_C.skin, z: 3, th: 20 * k, dith: 0, amb: .5, dif: .6 },
      { f: S(crown), ramp: ANA_C.hair, z: 3.4, th: 10 * k, dith: 0, amb: .4 },
      { f: S(fringe), ramp: ANA_C.hair, z: 3.5, th: 8 * k, dith: 0, amb: .45 },
      { f: S(lockL), ramp: ANA_C.hair, z: 3.3, th: 5 * k, dith: 0, amb: .35 }, { f: S(lockR), ramp: ANA_C.hair, z: 3.3, th: 5 * k, dith: 0, amb: .35 },
      { f: S(sleeveL), ramp: ANA_C.tee, z: armsFront ? 4 : 2.2, th: 7 * k, dith: 0, amb: .32 }, { f: S(sleeveR), ramp: ANA_C.tee, z: armsFront ? 4 : 2.2, th: 7 * k, dith: 0, amb: .32 },
      { f: S(armL), ramp: ANA_C.skin, z: armsFront ? 4.1 : -9, th: 6 * k, dith: 0, noCast: true }, { f: S(armR), ramp: ANA_C.skin, z: armsFront ? 4.1 : 2.4, th: 6 * k, dith: 0 },
      { f: S(handR), ramp: ANA_C.skin, z: armsFront ? 4.3 : 2.5, th: 5 * k, dith: 0, amb: .4 },
      ...(armsFront ? [{ f: S(handL), ramp: ANA_C.skin, z: 4.3, th: 5 * k, dith: 0, amb: .4 }] : []),
    ], { selout: false });
    const g = c.g;
    // trouser monogram: a diamond lattice with little marks (an invented pattern)
    const img = g.getImageData(0, 0, W, H), D = img.data;
    const isPants = (x, y) => S(pants)(x + .5, y + .5) < -.5 && !(S(bag)(x + .5, y + .5) < .5) && !(S(handL)(x + .5, y + .5) < .5) && !(S(handR)(x + .5, y + .5) < .5) && !(S(armL)(x + .5, y + .5) < .5) && !(S(armR)(x + .5, y + .5) < .5);
    const step = Math.max(4, rd(9 * k));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!isPants(x, y)) continue;
      const u = (x + y) % step, v = (x - y + 999 * step) % step;
      if (u === 0 || v === 0) { const i = (y * W + x) * 4; D[i] = 0x6b; D[i + 1] = 0x3a; D[i + 2] = 0x14; }
      else if (k >= .8 && u === fl(step / 2) && v === fl(step / 2)) { const i = (y * W + x) * 4; D[i] = 0x8a; D[i + 1] = 0x4a; D[i + 2] = 0x1a; }
    }
    g.putImageData(img, 0, 0);
    // strap + bag pattern, hair strands, the parting shine
    const q = v => rd(v * k);
    for (let i = 0; i <= 12; i++) { const t2 = i / 12, x = lerp(71, 34, t2) * k, y = lerp(80, 126, t2) * k; if (i % 2) px(g, x, y, ANA_C.strap[0]); }
    for (let yy = q(126); yy < q(139); yy += Math.max(2, q(3))) for (let xx = q(23); xx < q(40); xx += Math.max(2, q(3))) if (S(bag)(xx + .5, yy + .5) < -1) px(g, xx, yy, ANA_C.strap[0]);
    hline(g, q(23), q(39), q(129), ANA_C.strap[0]);
    if (k >= .5) {
      for (const [x0, y0, x1, y1] of [[44, 29, 34, 45], [50, 27, 40, 41], [61, 27, 66, 38], [24, 62, 26, 96], [76, 60, 74, 92]]) linePx(g, q(x0), q(y0), q(x1), q(y1), ANA_C.hair[0]);
      for (const [x0, y0, x1, y1] of [[49, 24, 57, 22], [37, 31, 45, 27]]) linePx(g, q(x0), q(y0), q(x1), q(y1), ANA_C.hair[2]);
      linePx(g, q(58), q(21), q(61), q(28), ANA_C.skin[1]); // the side parting
    }
    return c;
  });
}
// the face, painted by hand at scale k onto a copy of the body
function anahiFace2(g, k, ex) {
  const q = v => rd(v * k), qy = v => rd((v + 5) * k), E = ANA_C;
  const eyeW = Math.max(2, q(5)), eyeH = Math.max(3, q(7)), lx = q(41) - fl(eyeW / 2), rx = q(59) - fl(eyeW / 2), ey = qy(42);
  const eye = (x, look = 0) => {
    rect(g, x + look, ey, eyeW, eyeH, E.eye); px(g, x + look, ey, E.skin ? ANA_C.skin[1] : ''); px(g, x + look + eyeW - 1, ey, ANA_C.skin[1]); px(g, x + look, ey + eyeH - 1, ANA_C.skin[1]); px(g, x + look + eyeW - 1, ey + eyeH - 1, ANA_C.skin[1]);
    const gs = Math.max(1, q(2)); rect(g, x + look + 1, ey + 1, gs, gs, '#ffffff'); if (k >= .8) px(g, x + look + eyeW - 2, ey + eyeH - 2, '#6e6390');
    hline(g, x + look - (x < q(50) ? 1 : 0), x + look + eyeW - (x < q(50) ? 1 : 0), ey - 1, E.eye);
  };
  const happy = x => { for (let i = 0; i < eyeW; i++) px(g, x + i, ey + q(3) - Math.round(Math.sin(i / (eyeW - 1) * Math.PI) * q(2.2)), E.eye); for (let i = 0; i < eyeW; i++) px(g, x + i, ey + q(3) + 1 - Math.round(Math.sin(i / (eyeW - 1) * Math.PI) * q(2.2)), E.eye); };
  const closed = x => { hline(g, x, x + eyeW - 1, ey + q(4), E.eye); };
  const euroEye = x => { const cx0 = x + eyeW / 2, cy0 = ey + eyeH / 2; disc(g, cx0, cy0, Math.max(2, q(4.2)), '#ffdf4f'); ringPx(g, cx0, cy0, Math.max(2, q(4.2)), '#9c700c'); txt(g, '€', cx0, cy0 - 3, '#6b4a0a', { align: 'c' }); };
  const brow = (x, dy, tilt) => { const bx0 = x - 1, bx1 = x + eyeW; for (let i = bx0; i <= bx1; i++) { const t2 = (i - bx0) / (bx1 - bx0); px(g, i, ey - q(4) + dy + Math.round((tilt || 0) * (t2 - .5) * 2) - Math.round(Math.sin(t2 * Math.PI) * q(1)), E.brow); } };
  const cheeks = () => { for (const cx0 of [q(35), q(65)]) { ellipsePx(g, cx0, qy(53), Math.max(2, q(4)), Math.max(1.2, q(2.4)), E.blush); if (k >= .8) px(g, cx0 - q(2), qy(52), '#ffb3a8'); } };
  const mx = q(50), my = qy(58);
  const mouth = kind => {
    if (kind === 'smile') { for (let i = -q(4); i <= q(4); i++) px(g, mx + i, my + Math.round((i * i) / Math.max(1, q(16)) * -1) + q(1), E.lipD); px(g, mx - q(5), my - 1, E.lipD); px(g, mx + q(5), my - 1, E.lipD); return; }
    if (kind === 'grin') { const w = q(7), h = q(5); polyPx(g, [[mx - w, my - 1], [mx + w, my - 1], [mx + w * .6, my + h], [mx - w * .6, my + h]], E.lipD); rect(g, mx - w + 1, my - 1, w * 2 - 1, Math.max(1, q(1.6)), '#ffffff'); if (k >= .6) ellipsePx(g, mx, my + h - q(1.4), w * .45, Math.max(1, q(1.4)), '#e0607a'); return; }
    if (kind === 'o') { ellipsePx(g, mx, my + q(1.5), Math.max(1.5, q(2.6)), Math.max(2, q(3.4)), E.lipD); return; }
    if (kind === 'sad') { for (let i = -q(3.5); i <= q(3.5); i++) px(g, mx + i, my + q(2) + Math.round((i * i) / Math.max(1, q(12))), E.lipD); return; }
    if (kind === 'flat') { hline(g, mx - q(3), mx + q(3), my + q(1), E.lipD); return; }
    if (kind === 'talk') { ellipsePx(g, mx, my + q(1.5), Math.max(1.5, q(3.5)), Math.max(1.2, q(2.4)), E.lipD); if (k >= .6) hline(g, mx - q(2), mx + q(2), my + q(2.8), '#e0607a'); return; }
  };
  px(g, q(51), qy(51), ANA_C.skin[0]); if (k >= .8) px(g, q(50), qy(52), ANA_C.skin[0]); // nose
  switch (ex) {
    case 'grin': happy(lx); happy(rx); brow(lx, -q(1)); brow(rx, -q(1)); cheeks(); mouth('grin'); break;
    case 'wink': eye(lx); happy(rx); brow(lx, 0); brow(rx, -q(1)); cheeks(); mouth('grin'); break;
    case 'sad': eye(lx, 0); eye(rx, 0); brow(lx, 0, q(2)); brow(rx, 0, -q(2)); cheeks(); mouth('sad'); break;
    case 'cry': closed(lx); closed(rx); brow(lx, 0, q(2)); brow(rx, 0, -q(2)); cheeks(); mouth('sad'); vline(g, lx + 1, ey + q(5), ey + q(12), '#8fd0ff'); vline(g, rx + eyeW - 2, ey + q(5), ey + q(12), '#8fd0ff'); break;
    case 'wow': case 'gasp': eye(lx); eye(rx); brow(lx, -q(3)); brow(rx, -q(3)); cheeks(); mouth('o'); break;
    case 'euro': euroEye(lx); euroEye(rx); brow(lx, -q(2)); brow(rx, -q(2)); cheeks(); mouth('grin'); break;
    case 'focus': eye(lx, 1); eye(rx, 1); brow(lx, q(1), -q(1)); brow(rx, q(1), q(1)); cheeks(); mouth('flat'); break;
    case 'talk': eye(lx); eye(rx); brow(lx, 0); brow(rx, 0); cheeks(); mouth('talk'); break;
    case 'hmm': eye(lx, 1); eye(rx, 1); brow(lx, q(1)); brow(rx, -q(2)); cheeks(); mouth('flat'); break;
    default: eye(lx); eye(rx); brow(lx, 0); brow(rx, 0); cheeks(); mouth('smile');
  }
}
function anahiSprite(pose = 'idle', k = .6, ex) {
  const P = ANA2[pose] || ANA2.idle, e = ex || P.ex;
  return mdl('ana2s:' + pose + ':' + k + ':' + e, () => {
    const base = anahiModel(pose, k), c = mkCanvas(base.width, base.height);
    c.g.drawImage(base, 0, 0); anahiFace2(c.g, k, e);
    return c;
  });
}
// tools in the hands
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
// full figure, feet at (x, y). o.k = scale (default .6 ≈ 122px tall), o.jump, o.bob, o.ex
function drawAnahiFull(g, x, y, pose = 'idle', t = 0, o = {}) {
  const k = o.k || .6, P = ANA2[pose] || ANA2.idle, img = anahiSprite(pose, k, o.ex);
  const jump = o.jump || 0, bob = o.bob || 0;
  const X = rd(x - img.width / 2), Y = rd(y - img.height - jump + bob);
  g.drawImage(img, X, Y);
  const tool = (kind, hx, hy, rot) => { if (kind === 'scissors') drawS(g, scissorsSpr(), X + hx * k, Y + hy * k - 2, { rot: rot + Math.sin(t * 20) * (o.snip ? .25 : 0), s: Math.max(1, rd(k * 1.6)) }); if (kind === 'comb') drawS(g, combSpr(), X + hx * k, Y + hy * k - 2, { rot: rot, s: Math.max(1, rd(k * 1.6)) }); };
  if (P.tl) tool(P.tl, P.l[0], P.l[1], -.6);
  if (P.tr) tool(P.tr, P.r[0], P.r[1], .3);
}
// upper-body helper kept for older callers: (x, y) = her waist line
function drawAnahi(g, x, y, pose = 'idle', t = 0, o = {}) {
  const k = o.k || .6;
  drawAnahiFull(g, x, y + rd(70 * k), pose, t, Object.assign({}, o, { k }));
}
// old helpers still referenced here and there
function anahiBody(pose = 'idle') { return anahiSprite(pose, .6); }
function anahiLegs() { return mkCanvas(1, 1); }

// ---------------------------------------------------------------- chibi -----
// the tiny menu walker (WarioWare-Touched! menu style), 16x28
const ANA_CHIBI_HEAD = [
  '.....kkkkkk.....',
  '...kkhhhhhhkk...',
  '..khhhhhhhhhhk..',
  '.khhhhhhhhhhhhk.',
  '.khhhhhhhhhhhhk.',
  'khhhhhhhhhsshhhk',
  'khhhsssssssshhhk',
  'khhsseessseeshhk',
  'khhsseessseeshhk',
  'khhbsssssssbshhk',
  'khhhssssmmsshhhk',
  'khhhhsssssshhhhk',
  '.khhhkssssshhhk.',
];
const ANA_CHIBI_BODY = {
  stand: [
    '.khhttttttthhhk.',
    'kshtttttttgthhsk',
    'ksktttttttgtktsk',
    'ks.ttttttgttt.sk',
    'ks.tttttgtttt.sk',
    'kk.ttttgttttt.kk',
    '..kppggpppppk...',
    '..kpggPpppPpk...',
    '..kpPpppPpppk...',
    '..kppPpk.kpPk...',
    '..kpppk..kppk...',
    '..koook..kook...'],
  walk: [
    '.khhttttttthhhk.',
    'kshtttttttgthhsk',
    'ksktttttttgtktsk',
    'ks.ttttttgttt.sk',
    'ks.tttttgtttt.sk',
    'kk.ttttgttttt.kk',
    '..kppggpppppk...',
    '..kpggPpppPpk...',
    '..kpPpppPpppk...',
    '.kppPpk..kpPpk..',
    'kpppk.....kpppk.',
    'kooook.....kook.'],
  happy: [
    'skhhttttttthhhks',
    'kshtttttttgthhsk',
    '.kktttttttgtkk..',
    '...ttttttgttt...',
    '..ktttttgttttk..',
    '..kttttgtttttk..',
    '..kppggpppppk...',
    '..kpggPpppPpk...',
    '..kpPpppPpppk...',
    '..kppPpk.kpPk...',
    '..kpppk..kppk...',
    '..koook..kook...'],
};
const ANA_CHIBI_HAPPY = ANA_CHIBI_HEAD.map((r, i) => i === 7 ? 'khhssesssesshhhk' : i === 8 ? 'khhsesessesesshk' : i === 10 ? 'khhhsssmmmsshhhk' : r);
function anahiChibi(frame = 'walk0', t = 0) {
  const body = frame === 'walk1' ? 'walk' : frame === 'happy' ? 'happy' : 'stand';
  return mdl('anaChibi:' + frame, () => {
    const map = { k: INK, h: ANA_C.hair[1], H: ANA_C.hair[0], s: ANA_C.skin[1], S: ANA_C.skin[0], b: ANA_C.blush, e: ANA_C.eye, m: ANA_C.lip, t: ANA_C.tee[1], T: ANA_C.tee[2], g: ANA_C.strap[1], p: ANA_C.pants[1], P: '#6b3a14', o: ANA_C.shoe[1] };
    const head = frame === 'happy' || frame === 'held' ? ANA_CHIBI_HAPPY : ANA_CHIBI_HEAD;
    return spr(head.concat(ANA_CHIBI_BODY[body]), map);
  });
}
