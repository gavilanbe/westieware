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

// ---------------------------------------------------------------- KEIKO -----
// Anahí's sister's westie and the game's mascot: the westie head plus her
// Westie-green bandana with tiny white paw prints.
function keikoHead(ex = 'normal') {
  return mdl('keikoHead:' + ex, () => {
    const base = buleHead(ex), c = mkCanvas(base.width, base.height + 6), g = c.g;
    g.drawImage(base, 0, 0);
    const G = RAMP.green, pts = [[17, 47], [47, 47], [32, 64]];
    polyPx(g, pts.map(([x, y]) => [x, y + 1]), INK); polyPx(g, [[18, 47], [46, 47], [32, 62]], G[2]);
    hline(g, 18, 46, 47, INK); hline(g, 19, 45, 48, G[3]);
    for (const [x, y] of [[26, 51], [36, 51], [31, 56]]) { px(g, x, y, '#ffffff'); px(g, x + 1, y, '#ffffff'); px(g, x, y - 1, '#d2f5e4'); }
    disc(g, 32, 48, 2, INK); disc(g, 32, 48, 1.3, G[3]);
    return c;
  });
}
// Keiko as "la jefa": grumpy, wearing a green Westie BLVRD cap (from the user's video)
function keikoBossHead() {
  return mdl('keikoBoss', () => {
    const base = keikoHead('grr'), c = mkCanvas(base.width + 8, base.height + 4), g = c.g;
    g.drawImage(base, 4, 4);
    const G = RAMP.green;
    // cap dome between the ears, visor to the left
    ellipsePx(g, 36, 17, 15, 9, INK); ellipsePx(g, 36, 17, 14, 8, G[2]); ellipsePx(g, 33, 14, 9, 4, G[3]);
    rect(g, 20, 19, 32, 5, INK); rect(g, 21, 20, 30, 3, G[1]);
    polyPx(g, [[20, 20], [6, 23], [8, 27], [22, 25]], INK); polyPx(g, [[20, 21], [8, 23.5], [9, 26], [22, 24]], G[3]);
    rect(g, 30, 11, 12, 6, '#fffaf0'); tiny(g, 'WB', 36, 12, G[1], { align: 'c' });
    disc(g, 36, 8, 1.6, G[3]);
    // grumpy brows
    linePx(g, 25, 29, 31, 31, INK); linePx(g, 47, 29, 41, 31, INK);
    return c;
  });
}

// Keiko from the side / sitting, always with her green bandana
function keikoSide(k = 1, pose = 'stand', mood = 'normal') {
  return mdl('keikoSide:' + k + pose + mood, () => {
    const base = westieSide(k, pose, mood), c = mkCanvas(base.width, base.height), g = c.g;
    g.drawImage(base, 0, 0);
    const q = v => rd(v * k), G = RAMP.green;
    polyPx(g, [[q(55), q(29)], [q(64), q(31)], [q(58), q(42)]], INK); polyPx(g, [[q(56), q(30)], [q(63), q(31.5)], [q(58), q(40)]], G[2]);
    if (k >= .5) px(g, q(58), q(33), '#ffffff');
    return c;
  });
}
function drawKeikoSit(g, x, y, ex = 'normal', o = {}) {
  const tilt = o.tilt || 0;
  drawS(g, westieSitBody(), x, y, { ax: .5, ay: 1, sx: o.sx || 1, sy: o.sy || 1 });
  drawS(g, keikoHead(ex), x + tilt * 4, y - 36 * (o.sy || 1), { ax: .5, ay: .7, rot: tilt * .18 });
}
