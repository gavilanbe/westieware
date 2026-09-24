// ============================================================================
//  Stage 5 — CENIZA · ¡ARRASTRA!  "Una pizca de magia… y mucha espuma"
//  The black cat witch of the back storeroom and Pato, her rubber-duck imp.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- music -----
// spooky harpsichord (pluck) + organ swing, D minor
const CENIZA_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'pluck', v: .75, n: 'D5 . F5 A5 . D6 . C#6 A5 . F5 . D5! - - -' },
    { i: 'organ', v: .6, n: 'D4+F4+A4 - - - - - - - A3+C#4+E4 - - - D4+F4+A4 - - -' },
    { i: 'bass', v: .8, n: 'D3 . . . F2 . . . A2 . . . D2 - - -' },
    { i: 'd', v: .7, n: 'k . w . s . w w k . w . s+o - - -' }] },
  ready: { spb: 4, tracks: [{ i: 'pluck', v: .75, n: 'A5 . F5 . D5 . A4 .' }, { i: 'organ', v: .45, n: 'D4+F4+A4 - - - - - - -' }, { i: 'bass', v: .8, n: 'D3 . . . A2 . . .' }, { i: 'd', v: .7, n: 'k . w . s . w .' }] },
  win: { spb: 4, tracks: [{ i: 'bell', v: .6, n: 'D6 F#6 A6 D7! - . . .' }, { i: 'pluck', v: .6, n: 'D5 F#5 A5 D6 - . . .' }, { i: 'bass', v: .85, n: 'D3 . A2 . D3 . . .' }, { i: 'd', v: .8, n: 'k . s . k k s .' }] },
  lose: { spb: 4, tracks: [{ i: 'organ', v: .7, n: 'F4+A4 - E4+G#4 - Eb4+G4 - D4+F4 -' }, { i: 'bass', v: .85, n: 'D3 . C#3 . C3 . B2 .' }, { i: 'd', v: .7, n: 'T . . . T . . .' }] },
  next: { spb: 4, tracks: [{ i: 'pluck', v: .65, n: 'A4 . Bb4 . C#5 . E5 .' }, { i: 'bass', v: .85, n: 'A2 . . . A2 . A2 .' }, { i: 'd', v: .8, n: 'k . w . s . s s' }] },
  play: { spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D5 . F5 . A5 . F5 . E5 . G5 . Bb5 . G5 . F5 . A5 . D6 . A5 . C#6 - A5 - E5 - C#5 -' },
    { i: 'organ', v: .4, n: 'D4+F4 - - - - - - - C4+E4+G4 - - - - - - - Bb3+D4+F4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .85, n: 'D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . Bb2 . F2 . Bb2 . F2 . A2 . E2 . A2 . C#3 .' },
    { i: 'd', v: .7, n: 'k . w w s . w . k . w w s . w w k . w w s . w . k . w . s s s .' }] },
  boss: { spb: 4, tracks: [
    { i: 'organ', v: .5, n: 'D4+F4+A4 . D4+F4+A4 . . . D4+F4+A4 . C#4+E4+G4 . C#4+E4+G4 . . . C#4+E4+G4 . Bb3+D4+F4 . Bb3+D4+F4 . . . Bb3+D4+F4 . A3+C#4+E4 . . . A3+C#4+E4 . . .' },
    { i: 'pluck', v: .45, n: 'D6 A5 F5 A5 D6 A5 F5 A5 E6 A5 G5 A5 E6 A5 G5 A5 F6 D6 Bb5 D6 F6 D6 Bb5 D6 E6 C#6 A5 C#6 E6 C#6 A5 C#6' },
    { i: 'bass', v: .9, n: 'D2 . D3 . D2 . D3 . A1 . A2 . A1 . A2 . Bb1 . Bb2 . Bb1 . Bb2 . A1 . A2 . C#2 . E2 .' },
    { i: 'd', v: .85, n: 'k . s h k k s h k . s h k s s s k . s h k k s h k . s h k s s+x s' }] },
};

// ---------------------------------------------------------------- voices ----
WHO.ceniza = { name: 'Ceniza', col: '#5a3396', voice: 'ceniza' };
WHO.pato = { name: 'Pato', col: '#c98a10', voice: 'pato' };
VOICES.ceniza = { base: 64, scale: [0, 3, 5, 7, 10], inst: 'tri', len: .05 };
VOICES.pato = { base: 81, scale: [0, 2, 5, 7], inst: 'squeak', len: .04 };
// a cat's "miau", a rubber duck's squeak-quack, a cauldron's blub and a magic swish
SFX.czMeow = (t, d, p, v) => {
  const src = AU.ctx.createOscillator(); src.type = 'sawtooth';
  src.frequency.setValueAtTime(520 * p, t); src.frequency.linearRampToValueAtTime(780 * p, t + .12); src.frequency.linearRampToValueAtTime(430 * p, t + .38);
  const f1 = filt('bandpass', 900 * p, 3, d), f2 = filt('bandpass', 2400 * p, 5, d);
  f1.frequency.setValueAtTime(700 * p, t); f1.frequency.linearRampToValueAtTime(1300 * p, t + .15); f1.frequency.linearRampToValueAtTime(800 * p, t + .38);
  const g = AU.ctx.createGain(); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.55 * v, t + .05); g.gain.setTargetAtTime(0, t + .3, .04);
  src.connect(g); g.connect(f1); g.connect(f2); src.start(t); src.stop(t + .5);
};
SFX.czQuack = (t, d, p, v) => { INST.squeak(1100 * p, t, .06, 1.1 * v, d); INST.squeak(900 * p, t + .07, .08, .9 * v, d); };
SFX.czBlub = (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.28 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); const a = osc('sine', 180 * p, t, t + .13, g); a.frequency.exponentialRampToValueAtTime(420 * p, t + .1); };
SFX.czMagic = (t, d, p, v) => { SFX.swoosh(t, d, p * 1.5, v * .6); [0, 3, 7, 10, 14, 17].forEach((s, i) => INST.bell(1175 * p * Math.pow(2, s / 12), t + i * .035, .12, .45 * v, d)); };
SFX.czGlass = (t, d, p, v) => { for (let i = 0; i < 5; i++) INST.bell((2600 + Math.random() * 1800) * p, t + i * .025, .05, .35 * v, d); INST.r(0, t, 0, .8 * v, d); };
SFX.czPuaj = (t, d, p, v) => { const lp = filt('lowpass', 600, 2, d); const g = gainTo(lp, 0); g.gain.setValueAtTime(.4 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); noiseSrc(t, t + .42, g, .4); const g2 = gainTo(d, 0); g2.gain.setValueAtTime(.2 * v, t); g2.gain.exponentialRampToValueAtTime(.001, t + .3); const a = osc('sawtooth', 150 * p, t, t + .32, g2); a.frequency.linearRampToValueAtTime(70 * p, t + .3); };

// ---------------------------------------------------------------- CENIZA ----
// Black cat witch, 64x96: crooked purple hat (ears poke through the brim),
// Westie-green cape, yellow-green eyes. Poses move the front paws (IK).
const CENIZA_POSES = {
  //        left paw   right paw   face     extras
  stir0: { l: [11, 59], r: [42, 76], ex: 'normal', ladle: 1 },
  stir1: { l: [13, 62], r: [42, 76], ex: 'normal', ladle: 1 },
  stir2: { l: [10, 64], r: [42, 76], ex: 'normal', ladle: 1 },
  stir3: { l: [8, 61], r: [42, 76], ex: 'normal', ladle: 1 },
  fast0: { l: [11, 59], r: [42, 76], ex: 'focus', ladle: 1 },
  fast1: { l: [13, 62], r: [42, 76], ex: 'focus', ladle: 1 },
  fast2: { l: [10, 64], r: [42, 76], ex: 'focus', ladle: 1 },
  fast3: { l: [8, 61], r: [42, 76], ex: 'focus', ladle: 1 },
  ready: { l: [22, 76], r: [51, 44], ex: 'wink', ladleUp: 1 },
  win: { l: [13, 44], r: [51, 44], ex: 'happy', beans: 1 },
  lose: { l: [26, 55], r: [38, 55], ex: 'sooty' },
  boss: { l: [15, 60], r: [49, 60], ex: 'wow', puff: 1, beans: 1 },
  clear: { l: [12, 42], r: [52, 42], ex: 'happy', beans: 1 },
  over: { l: [25, 80], r: [39, 80], ex: 'sad', droop: 1 },
  talk: { l: [22, 78], r: [50, 58], ex: 'talk' },
  smug: { l: [22, 78], r: [42, 76], ex: 'normal' },
  angry: { l: [20, 70], r: [44, 70], ex: 'angry', puff: 1 },
};
function cenizaBody(pose = 'stir0', white = false) {
  return mdl('cz:cen:' + pose + (white ? 'W' : ''), () => {
    const P = CENIZA_POSES[pose] || CENIZA_POSES.stir0;
    const F = white ? RAMP.fur : RAMP.black, IN_EAR = white ? RAMP.pink : RAMP.lilac, HAT = RAMP.purple, GR = RAMP.green;
    const cx0 = 32;
    const sL = [25, 61], sR = [39, 61];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 9, 9, -1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 9, 9, 1);
    const headS = SD.smooth(3, SD.ellipse(cx0, 46, 14, 12.5), SD.ellipse(cx0, 51, 10, 7));
    const cheeks = SD.tufts(SD.union(SD.ellipse(21, 51, 6.5, 5), SD.ellipse(43, 51, 6.5, 5)), cx0, 50, 1.6, 20, 1.2, 2.2);
    const earL = SD.grow(SD.poly([[19.5, 41], [19, 24], [30, 34]]), 1.1), earR = SD.grow(SD.poly([[44.5, 41], [45, 24], [34, 34]]), 1.1);
    const inL = SD.poly([[21.5, 38], [21.2, 28], [27.5, 34]]), inR = SD.poly([[42.5, 38], [42.8, 28], [36.5, 34]]);
    const cone = P.droop ? SD.grow(SD.poly([[21.5, 35], [25, 22], [33, 19], [45, 25], [38, 23], [42.5, 35]]), .6)
      : SD.grow(SD.poly([[21.5, 35], [24.5, 21], [32, 13], [47, 8], [38, 19], [42.5, 35]]), .6);
    const band = SD.poly([[22.2, 31], [41.8, 31], [42.5, 35], [21.5, 35]]);
    const brim = SD.ellipse(cx0, 35.5, 21, 3.6);
    const bodyS = SD.smooth(4, SD.ellipse(cx0, 76, 13.5, 15), SD.ellipse(cx0, 63, 9.5, 8));
    const cape = SD.grow(SD.poly([[18, 60], [46, 60], [51, 92], [13, 92]]), 1);
    const haunchL = SD.ellipse(20, 86, 7.5, 7), haunchR = SD.ellipse(44, 86, 7.5, 7);
    const tail = P.puff
      ? SD.shag(SD.curve([44, 86], [62, 82], [58, 58], 6, 5.2), 1.6, .45, 7)
      : SD.curve([44, 88], [60, 86], [56, 64], 3.4, 2.1);
    const armL = SD.union(SD.capsule(sL[0], sL[1], eL[0], eL[1], 3.2, 2.9), SD.capsule(eL[0], eL[1], P.l[0], P.l[1], 2.9, 2.6));
    const armR = SD.union(SD.capsule(sR[0], sR[1], eR[0], eR[1], 3.2, 2.9), SD.capsule(eR[0], eR[1], P.r[0], P.r[1], 2.9, 2.6));
    const pawL = SD.circle(P.l[0], P.l[1], 3.4), pawR = SD.circle(P.r[0], P.r[1], 3.4);
    const armsFront = pose === 'lose';
    const fx = clumpTex(3.5, white ? .24 : .12, 21, 1.3);
    const c = model(64, 96, [
      { f: tail, ramp: F, z: 0, th: 4, tex: fx },
      { f: cape, ramp: GR, z: .3, th: 6 },
      { f: haunchL, ramp: F, z: .8, th: 5 }, { f: haunchR, ramp: F, z: .8, th: 5 },
      { f: bodyS, ramp: F, z: 1, th: 12, tex: fx },
      { f: armL, ramp: F, z: armsFront ? 3.5 : 1.6, th: 3 }, { f: armR, ramp: F, z: armsFront ? 3.5 : 1.6, th: 3 },
      { f: pawL, ramp: F, z: armsFront ? 3.6 : 1.7, th: 2.5 }, { f: pawR, ramp: F, z: armsFront ? 3.6 : 1.7, th: 2.5 },
      { f: headS, ramp: F, z: 2, th: 11, tex: fx, amb: white ? .3 : .34 },
      { f: cheeks, ramp: F, z: 2.2, th: 4, tex: fx },
      { f: cone, ramp: HAT, z: 2.4, th: 6 },
      { f: band, ramp: GR, z: 2.45, th: 2, lit: false, flatV: .72 },
      { f: brim, ramp: HAT, z: 2.5, th: 2.5 },
      { f: earL, ramp: F, z: 2.7, th: 3 }, { f: earR, ramp: F, z: 2.7, th: 3 },
      { f: inL, ramp: IN_EAR, z: 2.75, th: 2, amb: .45, dif: .3, edge: false, out: false }, { f: inR, ramp: IN_EAR, z: 2.75, th: 2, amb: .45, dif: .3, edge: false, out: false },
    ]);
    const g = c.g;
    // hat buckle + star on the cone + neck bow
    rect(g, 30, 31, 5, 4, RAMP.gold[1]); rect(g, 31, 32, 3, 2, RAMP.gold[4]); px(g, 32, 32, RAMP.gold[2]);
    if (!P.droop) { drawStar(g, 35, 22, 2.2, RAMP.yellow[3]); px(g, 35, 22, '#ffffff'); }
    const bw = RAMP.green; polyPx(g, [[32, 60], [27, 57], [27, 63]], bw[1]); polyPx(g, [[32, 60], [37, 57], [37, 63]], bw[1]); disc(g, 32, 60, 1.6, RAMP.gold[3]);
    cenizaFace(g, cx0, P.ex, white);
    // toe beans when the paws face us
    if (P.beans) for (const p of [P.l, P.r]) { px(g, p[0] - 1, p[1] - 1, RAMP.pink[3]); px(g, p[0] + 1, p[1] - 1, RAMP.pink[3]); px(g, p[0], p[1] + 1, RAMP.pink[2]); }
    return c;
  });
}
function cenizaFace(g, cx0, ex, white) {
  const K = INK, EY = ['#3d5a0a', '#7fb11c', '#b9e04a', '#e6f79a'], ey = 45, lx = cx0 - 9, rx = cx0 + 3;
  const lid = white ? '#56557a' : '#0b0712';
  // almond eye with a slit pupil; look = pupil shift, open = 0..1 lid opening
  const eye = (x, look = 0, open = 1, round = false) => {
    const h = open >= 1 ? 5 : open > .5 ? 4 : 3, top = ey + (5 - h);
    rect(g, x, top, 6, h, EY[1]); rect(g, x, top, 6, 1, EY[0]); rect(g, x + 1, top + h - 1, 4, 1, EY[2]); px(g, x + 1, top + 1, EY[3]);
    // lid line with a flick outward
    hline(g, x - 1, x + 6, top - 1, lid); px(g, x < cx0 ? x - 2 : x + 7, top - 2, lid);
    if (round) { rect(g, x + 2 + look, top + 1, 2, h - 1, K); px(g, x + 2 + look, top + 1, '#ffffff'); }
    else { vline(g, x + 3 + look, top, top + h - 1, K); if (h > 3) px(g, x + 3 + look, top + 1, K); }
    px(g, x + 1, top + 1, '#ffffff');
  };
  const closed = x => { px(g, x, ey + 3, lid); hline(g, x + 1, x + 4, ey + 2, lid); px(g, x + 5, ey + 3, lid); };
  const shut = x => { hline(g, x, x + 5, ey + 3, lid); px(g, x < cx0 ? x - 1 : x + 6, ey + 2, lid); };
  const nose = () => { hline(g, cx0 - 1, cx0 + 1, 50, RAMP.pink[2]); px(g, cx0, 51, RAMP.pink[1]); };
  const mouth = (kind) => {
    const y = 52;
    if (kind === 'open') { px(g, cx0 - 2, y, K); rect(g, cx0 - 1, y, 3, 3, '#3e0d1c'); px(g, cx0, y + 2, RAMP.pink[2]); px(g, cx0 + 2, y, K); px(g, cx0 - 1, y + 1, '#ffffff'); return; }
    if (kind === 'o') { rect(g, cx0 - 1, y, 3, 3, K); px(g, cx0, y + 1, '#3e0d1c'); return; }
    if (kind === 'sad') { px(g, cx0 - 2, y + 1, K); hline(g, cx0 - 1, cx0 + 1, y, K); px(g, cx0 + 2, y + 1, K); return; }
    if (kind === 'flat') { hline(g, cx0 - 2, cx0 + 2, y, K); px(g, cx0 + 1, y + 1, '#ffffff'); return; }
    // the cat "w", with a tiny fang
    px(g, cx0 - 2, y - 1, K); px(g, cx0 - 1, y, K); px(g, cx0, y - 1, K); px(g, cx0 + 1, y, K); px(g, cx0 + 2, y - 1, K); px(g, cx0 + 1, y + 1, '#ffffff');
  };
  const whiskers = () => { const wc = white ? '#8587ab' : '#9896a4'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) linePx(g, cx0 + s * 9, 50 + i * 1.5, cx0 + s * 17, 48 + i * 3, wc); };
  const blush = () => { for (const bx of [cx0 - 11, cx0 + 8]) { px(g, bx, 49, white ? RAMP.pink[3] : '#8f5cc7'); px(g, bx + 2, 49, white ? RAMP.pink[3] : '#8f5cc7'); } };
  whiskers(); nose();
  switch (ex) {
    case 'happy': closed(lx); closed(rx); mouth('open'); blush(); break;
    case 'wink': eye(lx, 1, .8); shut(rx); mouth('w'); blush(); break;
    case 'wow': eye(lx, 0, 1, true); eye(rx, 0, 1, true); mouth('o'); break;
    case 'sad': eye(lx, 0, .5); eye(rx, 0, .5); mouth('sad'); vline(g, lx + 5, ey + 5, ey + 8, '#9bd6f7'); break;
    case 'focus': eye(lx, 1, .6); eye(rx, 1, .6); mouth('flat'); linePx(g, lx - 1, ey - 3, lx + 5, ey - 2, K); linePx(g, rx, ey - 2, rx + 6, ey - 3, K); break;
    case 'angry': eye(lx, 0, .6); eye(rx, 0, .6); mouth('flat'); linePx(g, lx - 1, ey - 4, lx + 5, ey - 2, K); linePx(g, rx, ey - 2, rx + 6, ey - 4, K); break;
    case 'talk': eye(lx, 0, .8); eye(rx, 0, .8); mouth('open'); break;
    case 'sooty': {
      // soot smudges + dizzy eyes after a little explosion
      for (const [x, y] of [[20, 44], [23, 47], [40, 43], [43, 48], [28, 53], [36, 41], [31, 38]]) { px(g, x, y, '#6b6977'); px(g, x + 1, y, '#44424f'); px(g, x, y + 1, '#44424f'); }
      for (const x of [lx, rx]) { ringPx(g, x + 3, ey + 2.5, 2.4, EY[2]); px(g, x + 3, ey + 2, EY[3]); }
      mouth('o'); break;
    }
    default: eye(lx, 1, .7); eye(rx, 1, .7); mouth('w');
  }
}
// the wooden ladle she stirs with; (x, y) = paw, angle a
function cenizaLadle(g, x, y, a, len = 30) {
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  thickLine(g, x, y, ex, ey, 1.6, INK); thickLine(g, x, y, ex, ey, 1, RAMP.wood[3]);
  linePx(g, x + Math.cos(a) * 2, y + Math.sin(a) * 2 - 1, ex, ey - 1, RAMP.wood[4]);
  ellipsePx(g, ex + Math.cos(a) * 3, ey + Math.sin(a) * 3, 4, 3, INK); ellipsePx(g, ex + Math.cos(a) * 3, ey + Math.sin(a) * 3, 3, 2, RAMP.wood[3]);
}
// full figure: feet on (x, y)
function cenizaDraw(g, x, y, pose, t = 0, o = {}) {
  let key = pose;
  if (pose === 'stir' || pose === 'speed') key = (pose === 'stir' ? 'stir' : 'fast') + (fl(t * (pose === 'speed' ? 14 : 6)) % 4);
  const img = cenizaBody(key, o.white), P = CENIZA_POSES[key];
  const X = rd(x - 32), Y = rd(y - 96 - (o.jump || 0) + (o.bob || 0));
  if (P.ladle) cenizaLadle(g, X + P.l[0], Y + P.l[1], 2.4 + Math.sin(t * (pose === 'speed' ? 14 : 6)) * .12, o.ladleLen || 30);
  g.drawImage(img, X, Y);
  if (P.ladleUp) { cenizaLadle(g, X + P.r[0], Y + P.r[1], -1.35, 22); for (let i = 0; i < 3; i++) drawStar(g, X + P.r[0] + 10 + Math.cos(t * 5 + i * 2) * 6, Y + P.r[1] - 22 + Math.sin(t * 5 + i * 2) * 6, 2, '#fff27a', t * 4); }
}

// ---------------------------------------------------------------- PATO ------
// her imp: a rubber duck with little devil horns and a trident. 34x32
function cenizaPatoSpr(mood = 'grin') {
  return mdl('cz:pato:' + mood, () => {
    const Y = RAMP.yellow, O = RAMP.orange, R = RAMP.red;
    const body = SD.smooth(2, SD.ellipse(14, 21, 11, 8), SD.poly([[2, 13], [7, 18], [4, 22]]));
    const head = SD.circle(20, 11, 6.8), beak = SD.smooth(1, SD.ellipse(28, 13, 4.6, 2.2), SD.ellipse(27, 15, 3.6, 1.6));
    const wing = SD.ellipse(12, 20, 5.5, 3.6, -.3);
    const hornL = SD.grow(SD.poly([[16, 6], [15, 0], [19, 5]]), .5), hornR = SD.grow(SD.poly([[21, 5], [24, 0], [24, 6]]), .5);
    const c = model(34, 32, [
      { f: hornL, ramp: R, z: 0, th: 2 }, { f: hornR, ramp: R, z: 0, th: 2 },
      { f: body, ramp: Y, z: 1, th: 8 }, { f: head, ramp: Y, z: 2, th: 6 },
      { f: wing, ramp: Y.map(c => mixHex(c, '#c08a10', .35)), z: 2.5, th: 3 },
      { f: beak, ramp: O, z: 3, th: 2 },
    ]);
    const g = c.g, K = INK;
    if (mood === 'laugh') { hline(g, 20, 23, 10, K); px(g, 19, 11, K); px(g, 24, 11, K); rect(g, 26, 14, 5, 2, '#7c1830'); }
    else if (mood === 'dizzy') { ringPx(g, 22, 10, 2, K); px(g, 22, 10, K); }
    else if (mood === 'shock') { rect(g, 21, 8, 3, 4, '#ffffff'); rect(g, 22, 9, 2, 2, K); ringPx(g, 22.5, 10, 2.5, K); }
    else { rect(g, 21, 9, 3, 3, K); px(g, 21, 9, '#ffffff'); linePx(g, 19, 7, 24, 8, K); } // evil little brow
    if (mood !== 'laugh') { hline(g, 25, 31, 13, O[0]); px(g, 31, 12, O[0]); }
    // the trident, held by the wing
    linePx(g, 8, 30, 3, 8, '#7c1830'); linePx(g, 9, 30, 4, 8, R[2]);
    for (const dx of [-2, 0, 2]) linePx(g, 3 + dx, 8, 3 + dx * 1.4, 4, R[2]);
    hline(g, 1, 6, 8, R[1]);
    return c;
  });
}
function cenizaPato(g, x, y, mood, t, o = {}) {
  const bob = Math.sin(t * 3 + (o.ph || 0)) * 3, flipK = o.flip ? -1 : 1;
  shadowOval(g, x, y + 24, 7, 1.5, .25);
  drawS(g, cenizaPatoSpr(mood), x, y + bob, { flip: o.flip, rot: (o.rot || 0) + Math.sin(t * 2.5) * .06 * flipK, s: o.s || 1 });
}

// ---------------------------------------------------------------- cauldron --
// iron cauldron, k scales it; the potion surface is drawn live on top
function cenizaCauldron(k = 1) {
  return mdl('cz:cauldron' + k, () => {
    const s = v => v * k, W = Math.ceil(64 * k), H = Math.ceil(50 * k), IR = RAMP.black.map(c => mixHex(c, '#3d4a5a', .35));
    const pot = SD.smooth(s(3), SD.ellipse(s(32), s(28), s(26), s(18)), SD.box(s(32), s(16), s(23), s(4), s(3)));
    const legs = SD.union(SD.capsule(s(14), s(40), s(11), s(48), s(3), s(2.4)), SD.capsule(s(50), s(40), s(53), s(48), s(3), s(2.4)), SD.capsule(s(32), s(44), s(32), s(49), s(3), s(2.4)));
    const rim = SD.sub(SD.ellipse(s(32), s(12), s(28), s(6.5)), SD.ellipse(s(32), s(12), s(22.5), s(4)));
    const handleL = SD.sub(SD.circle(s(4), s(20), s(5)), SD.circle(s(4), s(20), s(3))), handleR = SD.sub(SD.circle(s(60), s(20), s(5)), SD.circle(s(60), s(20), s(3)));
    return model(W, H, [
      { f: legs, ramp: IR, z: 0, th: s(3) },
      { f: handleL, ramp: IR, z: .5, th: s(2) }, { f: handleR, ramp: IR, z: .5, th: s(2) },
      { f: pot, ramp: IR, z: 1, th: s(16), gloss: true, glossCol: '#8a93a8' },
      { f: rim, ramp: RAMP.steel, z: 2, th: s(3) },
    ]);
  });
}
// potion surface + bubbles + foam, sitting in the rim of a cauldron drawn at (x, y) = rim centre
function cenizaPotion(g, x, y, rx, ry, col, t, o = {}) {
  const c2 = mixHex(col, '#ffffff', .35), c0 = mixHex(col, '#000000', .3);
  ellipsePx(g, x, y, rx, ry, c0); ellipsePx(g, x, y - .5, rx - 1, ry - 1, col); ellipsePx(g, x - rx * .25, y - ry * .3, rx * .45, ry * .35, c2);
  if (o.swirl) for (let i = 0; i < 3; i++) { const a = t * 6 + i * TAU / 3; for (let q = 0; q < 8; q++) { const r = (q / 8) * rx * .8; px(g, x + Math.cos(a + q * .5) * r, y + Math.sin(a + q * .5) * r * (ry / rx), c2); } }
  const n = o.boil ? 7 : 4;
  for (let i = 0; i < n; i++) {
    const ph = (t * (o.boil ? 2.6 : 1.3) + i * .37) % 1, bx = x + Math.sin(i * 2.7 + fl(t * 1.3 + i * .37) * 1.9) * rx * .7, by = y + Math.cos(i * 1.3) * ry * .4;
    const r = ph < .8 ? 1 + ph * 3 : 3 - (ph - .8) * 12;
    if (r > .5) { ringPx(g, bx, by - ph * 2, r, c2); px(g, bx - r * .4, by - ph * 2 - r * .4, '#ffffff'); }
  }
  // suds on the rim
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, fx = x + Math.cos(a) * (rx - 1), fy = y + Math.sin(a) * (ry - 1) + 1; disc(g, fx, fy, 2 + (i % 3 === 0 ? 1 : 0), '#ffffff'); }
}
function cenizaFire(g, x, y, t, s = 1) {
  for (let i = -2; i <= 2; i++) {
    const h = (9 + Math.sin(t * 16 + i * 1.7) * 3 + (2 - Math.abs(i)) * 4) * s, fx = x + i * 5 * s;
    polyPx(g, [[fx - 3 * s, y], [fx + 3 * s, y], [fx + Math.sin(t * 11 + i) * 2, y - h]], '#ff6a1a');
    polyPx(g, [[fx - 1.6 * s, y], [fx + 1.6 * s, y], [fx + Math.sin(t * 13 + i) * 1.5, y - h * .6]], '#ffd23f');
  }
  for (const dx of [-8, -3, 3, 8]) { rect(g, x + dx * s - 3, y, 6 * s, 2, RAMP.wood[1]); }
}
function cenizaCandle(g, x, y, t, h = 10, col = '#fff4dc') {
  rect(g, x - 2, y - h, 5, h, INK); rect(g, x - 1, y - h + 1, 3, h - 1, col); px(g, x - 1, y - h + 1, '#ffffff');
  rect(g, x - 3, y, 7, 2, RAMP.gold[1]);
  const f = Math.sin(t * 17 + x) * .6;
  polyPx(g, [[x - 1.5, y - h], [x + 2.5, y - h], [x + .5 + f, y - h - 6]], '#ff9f4f'); px(g, x + .5, y - h - 2, '#fff7ae');
  g.globalAlpha = .12; disc(g, x + .5, y - h - 3, 7, '#fff7ae'); g.globalAlpha = 1;
}

// ---------------------------------------------------------------- the den ---
function cenizaStoneWall(g, x, y, w, h, cols = [RAMP.purple[0], RAMP.purple[1], '#2a1c44']) {
  rect(g, x, y, w, h, cols[0]);
  for (let j = 0; j * 8 < h; j++) for (let i = -1; i * 16 < w + 16; i++) {
    const bx = x + i * 16 + (j % 2) * 8, by = y + j * 8, v = hash2(i, j, 5);
    rect(g, bx + 1, by + 1, 14, 6, v < .4 ? cols[1] : v < .7 ? cols[2] : mixHex(cols[1], cols[2], .5));
    rect(g, bx + 1, by + 1, 14, 1, mixHex(cols[1], '#ffffff', .08));
  }
}
function cenizaJar(g, x, y, w, h, col, lid = RAMP.wood[3]) {
  rect(g, x - 1, y - 1, w + 2, h + 2, INK); rect(g, x, y, w, h, '#cfe6f0'); rect(g, x, y + fl(h * .35), w, h - fl(h * .35), col);
  rect(g, x, y + fl(h * .35), w, 1, mixHex(col, '#ffffff', .4)); px(g, x + 1, y + 1, '#ffffff'); vline(g, x + 1, y + 2, y + h - 2, 'rgba(255,255,255,.5)');
  rect(g, x - 1, y - 3, w + 2, 3, INK); rect(g, x, y - 2, w, 2, lid);
}
function cenizaRoomBg() {
  return mdl('cenizaRoomBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    cenizaStoneWall(g, 0, 0, SW, 150);
    // round window with the moon
    disc(g, 40, 40, 19, INK); disc(g, 40, 40, 18, RAMP.wood[2]); disc(g, 40, 40, 15, '#1a1f4a'); disc(g, 40, 40, 14, '#232a5e');
    disc(g, 45, 35, 6, '#fff2c0'); disc(g, 48, 33, 5, '#232a5e');
    for (const [sx, sy] of [[30, 34], [34, 48], [47, 47], [29, 44]]) px(g, sx, sy, '#ffffff');
    rect(g, 39, 22, 2, 36, RAMP.wood[1]); rect(g, 22, 39, 36, 2, RAMP.wood[1]);
    // hanging herbs (lavender bunches) and cobwebs
    for (const hx of [72, 88, 166]) { vline(g, hx, 0, 10, RAMP.wood[1]); for (let i = 0; i < 6; i++) { linePx(g, hx, 10, hx - 4 + i * 1.6, 22, '#5bb593'); px(g, hx - 4 + i * 1.6, 22, '#8959c5'); px(g, hx - 4 + i * 1.6, 21, '#bf95e9'); px(g, hx - 4 + i * 1.6, 23, '#8959c5'); } rect(g, hx - 2, 9, 5, 2, RAMP.red[2]); }
    for (const [cx0, fx] of [[0, 1], [SW - 1, -1]]) { for (let i = 0; i < 5; i++) linePx(g, cx0, 0, cx0 + fx * (26 - i * 2), i * 6, '#8a7aa8'); for (let r = 6; r <= 24; r += 6) for (let i = 0; i < 5; i++) { const a0 = i * .3, a1 = (i + 1) * .3; linePx(g, cx0 + fx * Math.cos(a0) * r, Math.sin(a0) * r, cx0 + fx * Math.cos(a1) * r, Math.sin(a1) * r, '#6b5a8a'); } }
    // shelves of jars, bottles and grimoires on the right
    for (const sy of [52, 86]) { rect(g, 178, sy, 76, 4, RAMP.wood[3]); rect(g, 178, sy, 76, 1, RAMP.wood[4]); rect(g, 178, sy + 4, 76, 1, INK); for (const bx of [184, 246]) { rect(g, bx, sy + 4, 2, 5, RAMP.wood[1]); } }
    cenizaJar(g, 182, 38, 10, 14, '#5bd18b'); cenizaJar(g, 196, 42, 8, 10, '#ff93bf'); cenizaJar(g, 208, 36, 12, 16, '#e2b21b', RAMP.purple[2]);
    for (const [bx, col] of [[226, '#63a0ef'], [236, '#bf95e9']]) { rect(g, bx - 1, 36, 8, 16, INK); rect(g, bx, 37, 6, 15, col); rect(g, bx + 1, 32, 4, 5, INK); rect(g, bx + 2, 33, 2, 4, '#ffffff'); rect(g, bx + 1, 42, 4, 4, '#fff8e6'); tiny(g, 'W', bx + 2, 42, RAMP.green[2]); }
    // books
    for (const [bx, h, col] of [[182, 16, '#7c1830'], [187, 14, '#233b8c'], [192, 17, '#17543e'], [197, 13, '#8a5a12']]) { rect(g, bx, 86 - h, 5, h, INK); rect(g, bx + 1, 86 - h + 1, 3, h - 1, col); px(g, bx + 2, 86 - h + 3, RAMP.gold[3]); }
    cenizaJar(g, 206, 74, 9, 12, '#9bd6f7'); cenizaJar(g, 219, 70, 11, 16, '#ff9f4f', RAMP.purple[2]);
    // a bone-shaped soap on display (it's still a dog salon)
    rect(g, 234, 80, 12, 4, INK); rect(g, 235, 81, 10, 2, '#fff8e6'); disc(g, 234, 79, 2.2, INK); disc(g, 234, 84, 2.2, INK); disc(g, 246, 79, 2.2, INK); disc(g, 246, 84, 2.2, INK); disc(g, 234, 79, 1.4, '#fff8e6'); disc(g, 234, 84, 1.4, '#fff8e6'); disc(g, 246, 79, 1.4, '#fff8e6'); disc(g, 246, 84, 1.4, '#fff8e6');
    // floor + round rug
    rect(g, 0, 150, SW, 42, RAMP.wood[1]);
    for (let j = 150; j < SH; j += 7) { rect(g, 0, j, SW, 1, RAMP.wood[0]); for (let i = ((j / 7) % 2) * 20; i < SW; i += 40) rect(g, i, j, 1, 7, RAMP.wood[0]); rect(g, 0, j + 1, SW, 1, RAMP.wood[2]); }
    ellipsePx(g, 96, 170, 62, 14, INK); ellipsePx(g, 96, 169, 61, 13, RAMP.gold[2]); ellipsePx(g, 96, 169, 57, 11, RAMP.purple[2]); ellipsePx(g, 96, 169, 48, 8, RAMP.purple[3]);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; drawStar(g, 96 + Math.cos(a) * 53, 169 + Math.sin(a) * 10, 1.4, RAMP.gold[4]); }
    return c;
  });
}
// hanging crescent-moon board for the counter
function cenizaCounterBoard(g, x, y) {
  vline(g, x - 18, 0, y + 1, '#6b5a8a'); vline(g, x + 18, 0, y + 1, '#6b5a8a');
  panel(g, x - 28, y, 56, 26, RAMP.wood[1], { r: 5, line: INK, hi: RAMP.wood[2] });
  ringRectRound(g, x - 26, y + 2, 52, 22, RAMP.gold[2]);
  // crescent moons on the corners
  for (const sx of [-21, 21]) { disc(g, x + sx, y + 13, 3.5, RAMP.yellow[3]); disc(g, x + sx + (sx < 0 ? 1.8 : -1.8), y + 12, 3, RAMP.wood[1]); }
}
function cenizaPoseFor(S) {
  const rt = S.reactT || 0;
  let pose = rt < 1.3 ? ({ ready: 'ready', win: 'win', lose: 'lose', clear: 'clear', over: 'over' }[S.react] || 'stir') : 'stir';
  if (S.phase === 'inter' && S.special === 'speed' && S.pb >= 2) pose = 'speed';
  if (S.phase === 'inter' && S.special === 'boss' && S.pb >= 2) pose = 'boss';
  if (S.react === 'clear' || S.react === 'over') pose = S.react;
  return pose;
}
function cenizaRoomTop(g, S) {
  const t = S.pt || 0, rt = S.reactT || 0, pose = cenizaPoseFor(S);
  g.drawImage(cenizaRoomBg(), 0, 0);
  // candles flicker on the shelves
  cenizaCandle(g, 200, 86, NOW, 9); cenizaCandle(g, 176, 52, NOW, 12, '#ffd1e4'); cenizaCandle(g, 248, 52, NOW, 8);
  cenizaCounterBoard(g, SW / 2, 4);
  // the cauldron on its fire
  const cx0 = 92, cy0 = 164, k = 1.15;
  const boss = pose === 'boss', cold = pose === 'over';
  if (!cold) cenizaFire(g, cx0, cy0 + 2, NOW, 1);
  const cs = cenizaCauldron(k); g.drawImage(cs, rd(cx0 - cs.width / 2), rd(cy0 - cs.height + 4));
  const potCol = boss ? '#ff4060' : pose === 'win' || pose === 'clear' ? '#ff93bf' : pose === 'lose' ? '#5b5a66' : '#5bd18b';
  cenizaPotion(g, cx0, cy0 - cs.height + 4 + 12 * k, 24 * k, 4.5 * k, potCol, NOW, { boil: boss || pose === 'speed', swirl: pose === 'speed' });
  // steam wisps
  for (let i = 0; i < 4; i++) { const ph = (NOW * .6 + i * .25) % 1, sx = cx0 - 12 + i * 8 + Math.sin(NOW * 2 + i) * 4, sy = cy0 - 50 - ph * 40; g.globalAlpha = (1 - ph) * .45; disc(g, sx, sy, 3 + ph * 4, '#dfe3f1'); } g.globalAlpha = 1;
  // Ceniza stirring from the right; Pato floating over the pot
  const jump = pose === 'win' || pose === 'clear' ? Math.max(0, Math.sin(Math.min(1, rt / .45) * Math.PI)) * 9 + (pose === 'clear' ? Math.abs(Math.sin(rt * 6)) * 6 : 0) : 0;
  const bob = Math.round(Math.abs(Math.sin((S.pb || 0) * Math.PI)) * -1.3);
  cenizaDraw(g, 160, 176, pose, t, { jump, bob });
  const pm = pose === 'lose' || pose === 'over' ? 'laugh' : pose === 'win' || pose === 'clear' ? 'grin' : pose === 'boss' ? 'shock' : 'grin';
  const pflip = pose === 'win' ? rt < .6 : false;
  cenizaPato(g, 54, 74, pm, NOW, { rot: pflip ? rt * TAU / .6 : 0 });
  // reactions
  if (pose === 'win' || pose === 'clear') { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rt * 2, r = 16 + rt * 30; if (rt < 1) drawHeart(g, cx0 + Math.cos(a) * r, 108 + Math.sin(a) * r * .6 - rt * 20, i % 2 ? '#ff93bf' : '#fff7ae', 1); } }
  if (pose === 'lose') {
    // a puff of soot from the cauldron right into her face
    const k2 = clamp(rt * 2.5, 0, 1), fade = 1 - clamp((rt - 1) * 2, 0, 1), rise = rt * 10;
    if (fade > 0) {
      const blobs = [[-12, 2, 10], [2, -8, 12], [16, 0, 9], [4, 9, 8], [-4, -2, 9]];
      g.globalAlpha = fade;
      for (const [dx, dy, r] of blobs) disc(g, 156 + dx, 92 + dy - rise, r * k2 + 1, INK);
      for (const [dx, dy, r] of blobs) disc(g, 156 + dx, 92 + dy - rise, r * k2, '#6b6977');
      for (const [dx, dy, r] of blobs) disc(g, 154 + dx, 89 + dy - rise, r * k2 * .55, '#9896a4');
      g.globalAlpha = 1;
    }
    if (rt < .8) shout(g, '¡PUF!', 112, 64, rt);
  }
  if (pose === 'speed') for (let i = 0; i < 6; i++) { const yy = 96 + i * 10, xx = (i * 53 + fl(t * 300)) % 60; rect(g, 196 + xx * .4, yy, 14, 1, '#ffffff'); }
  if (boss && fl(NOW * 8) % 2) { g.globalAlpha = .12; rect(g, 0, 0, SW, SH, '#ff4060'); g.globalAlpha = 1; }
}
// velvet tablecloth with gold stars and moons + the shelf that holds the flasks
function cenizaBotBg() {
  return mdl('cenizaBotBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, Pp = RAMP.purple;
    rect(g, 0, 0, SW, SH, Pp[1]);
    for (let y = 0; y < SH; y += 2) for (let x = (y % 4 === 0 ? 0 : 2); x < SW; x += 4) px(g, x, y, '#331b58');
    for (let i = 0; i < 26; i++) { const x = (i * 71) % SW + (i % 3) * 4, y = (i * 47) % 150; if (i % 4 === 0) { disc(g, x, y, 3, RAMP.gold[2]); disc(g, x + 1.5, y - 1, 2.6, Pp[1]); } else drawStar(g, x, y, i % 2 ? 2 : 1.4, i % 2 ? RAMP.gold[3] : RAMP.gold[2]); }
    // garland of little bats along the top
    for (let x = 8; x < SW; x += 24) { const y = 5 + Math.sin(x * .2) * 2; polyPx(g, [[x - 5, y], [x, y + 3], [x + 5, y], [x + 3, y + 2], [x, y + 5], [x - 3, y + 2]], INK); }
    linePx(g, 0, 4, SW, 4, '#6b5a8a');
    // shelf
    rect(g, 0, 154, SW, 38, RAMP.wood[1]); for (let y = 158; y < SH; y += 6) rect(g, 0, y, SW, 1, RAMP.wood[0]);
    rect(g, 0, 150, SW, 5, RAMP.wood[3]); rect(g, 0, 150, SW, 1, RAMP.wood[4]); rect(g, 0, 155, SW, 1, INK);
    return c;
  });
}
function cenizaRoomBot(g, S) { g.drawImage(cenizaBotBg(), 0, 0); }
// lives: shampoo potion flasks with a bubbling brew
const CENIZA_FLASK_COLS = ['#ff93bf', '#5bd18b', '#bf95e9', '#ffdf4f'];
function cenizaFlaskSpr(i) {
  return mdl('cz:flask' + i, () => {
    const c = mkCanvas(20, 24), g = c.g, col = CENIZA_FLASK_COLS[i % 4], cd = mixHex(col, '#000000', .3), cl = mixHex(col, '#ffffff', .45);
    disc(g, 10, 16, 8, INK); rect(g, 7, 3, 6, 8, INK);
    disc(g, 10, 16, 7, '#dff4ff'); rect(g, 8, 4, 4, 8, '#dff4ff');
    disc(g, 10, 17, 6, col); rect(g, 4, 12, 13, 2, '#dff4ff'); hline(g, 5, 15, 13, cl); disc(g, 12, 19, 3, cd);
    px(g, 6, 12, '#ffffff'); vline(g, 5, 14, 17, '#ffffff'); px(g, 9, 5, '#ffffff');
    rect(g, 7, 1, 6, 3, INK); rect(g, 8, 1, 4, 2, RAMP.wood[3]);
    rect(g, 7, 15, 6, 3, '#fff8e6'); px(g, 9, 16, RAMP.purple[2]); px(g, 10, 16, RAMP.purple[2]);
    return c;
  });
}
function cenizaLife(g, x, y, st, bt, S) {
  const i = ((rd((x - (SW / 2 - 1.5 * 34)) / 34) % 4) + 4) % 4; // which flask (0..3), whatever the spacing
  if (st === 'gone') { ellipsePx(g, x, y + 11, 9, 2, mixHex(CENIZA_FLASK_COLS[i % 4], '#000000', .35)); rect(g, x - 2, y + 7, 4, 3, RAMP.wood[3]); return; }
  if (st === 'break') {
    const k = clamp(bt / 1.1, 0, 1);
    if (bt < .25) { drawS(g, cenizaFlaskSpr(i), x + Math.sin(bt * 60) * 2, y, {}); linePx(g, x - 3, y + 8, x + 2, y + 14, '#ffffff'); linePx(g, x + 2, y + 14, x + 5, y + 10, '#ffffff'); return; }
    if (!S['_shard' + i]) { S['_shard' + i] = 1; S.fx.burst(x, y + 6, 14, { k: 'drop', c: [CENIZA_FLASK_COLS[i % 4], '#dff4ff'], sp0: 60, sp1: 150, g: 400, life0: .4, life1: .8 }); S.fx.burst(x, y + 4, 10, { k: 'spark', c: ['#dff4ff', '#ffffff'], sp0: 50, sp1: 120, g: 300 }); S.fx.add({ k: 'puff', x, y: y - 2, r: 7, life: .6, c: mixHex(CENIZA_FLASK_COLS[i % 4], '#ffffff', .5) }); sfx('czGlass'); }
    ellipsePx(g, x, y + 11, 9 * k, 2, mixHex(CENIZA_FLASK_COLS[i % 4], '#000000', .35));
    if (bt < .6) txt(g, '¡CRAC!', x, y - 18 - bt * 10, '#ffffff', { align: 'c', out: INK });
    return;
  }
  S['_shard' + i] = 0;
  drawS(g, cenizaFlaskSpr(i), x, y, {});
  const ph = (NOW * 1.2 + i * .3) % 1; if (ph < .7) px(g, x - 2 + (i % 3), y + 6 - ph * 8, '#ffffff');
}
function cenizaMini(g, x, y, st, S) {
  const pose = st === 'win' ? 'win' : st === 'lose' ? 'lose' : 'smug';
  cenizaDraw(g, SW - 34, SH + 36 - (st === 'win' ? 4 : 0), pose, S.pt);
}
// a tiny hand-drawn flask for the mini lives (8x10)
function cenizaFlaskTiny(alive) {
  return mdl('cz:flaskTiny' + (alive ? 1 : 0), () => spr(alive ? [
    '..kkk...',
    '..kwk...',
    '.kkwkk..',
    'kwwwwwk.',
    'kpppppk.',
    'kpPpppk.',
    'kpppppk.',
    '.kkkkk..'] : [
    '........',
    '........',
    '........',
    '........',
    '........',
    '.k...k..',
    'kpp.ppk.',
    '.kkkkk..'], { k: INK, w: '#dff4ff', p: '#ff93bf', P: '#ffffff' }));
}
function cenizaMiniLife(g, x, y, alive) { drawS(g, cenizaFlaskTiny(alive), x, y, {}); }
// the gothic arch that frames the portal
PORTAL_FRAMES.gothic = function (g, x, y, w, h, beat) {
  const St = ['#2a1c44', '#3d2766', '#5a3d8a', '#7a5aa8'], G = RAMP.gold, b = 7;
  ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
  ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 2, St[1]);
  // stone blocks along the frame
  for (let i = 0; i < w + b * 2; i += 12) { vline(g, x - b + i, y - b, y - 3, St[0]); vline(g, x - b + i + 6, y + h + 2, y + h + b - 1, St[0]); }
  for (let i = 0; i < h + b * 2; i += 10) { hline(g, x - b, x - 3, y - b + i, St[0]); hline(g, x + w + 2, x + w + b - 1, y - b + i + 5, St[0]); }
  rect(g, x - b, y - b, w + b * 2, 1, St[3]); rect(g, x - b, y - b, 1, h + b * 2, St[2]);
  ringRect(g, x - 2, y - 2, w + 4, h + 4, 1, G[2]); ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  // pointed arch above, keystone with a green gem
  const ax = x + w / 2, ay = y - b - 22, bob = Math.abs(Math.sin(beat * Math.PI)) * 1;
  const arch = []; for (let i = 0; i <= 16; i++) { const k = i / 16, s = k < .5 ? k * 2 : (1 - k) * 2; arch.push([lerp(x - b, x + w + b, k), lerp(y - b, ay, Math.pow(s, .6))]); }
  for (let i = 1; i < arch.length; i++) { thickLine(g, arch[i - 1][0], arch[i - 1][1], arch[i][0], arch[i][1], 3.5, INK); }
  for (let i = 1; i < arch.length; i++) { thickLine(g, arch[i - 1][0], arch[i - 1][1], arch[i][0], arch[i][1], 2.4, St[2]); linePx(g, arch[i - 1][0], arch[i - 1][1] - 1, arch[i][0], arch[i][1] - 1, St[3]); }
  polyPx(g, [[ax - 7, ay - 2 - bob], [ax + 7, ay - 2 - bob], [ax + 5, ay + 10], [ax - 5, ay + 10]], INK);
  polyPx(g, [[ax - 6, ay - 1 - bob], [ax + 6, ay - 1 - bob], [ax + 4, ay + 9], [ax - 4, ay + 9]], St[2]);
  disc(g, ax, ay + 3 - bob * .5, 3, INK); disc(g, ax, ay + 3 - bob * .5, 2.2, '#5bd18b'); px(g, ax - 1, ay + 2 - bob * .5, '#d2f5e4');
  // two candles on the sill corners
  cenizaCandle(g, x - b + 3, y + h + b + 1, NOW, 8); cenizaCandle(g, x + w + b - 3, y + h + b + 1, NOW + .4, 8);
};

// ---------------------------------------------------------------- the stage -
defStage({
  id: 'ceniza', name: 'CENIZA', sub: '«Magia… y mucha espuma»', verb: '¡ARRASTRA!', mech: 'drag', bpm: 116,
  games: ['pocion', 'estante', 'lazo2', 'banera', 'correa2'], boss: 'pocima', bossAt: 10, speedAt: [4, 7], unlockBy: 'hermanas',
  portrait: () => mdl('cz:cenPortrait', () => { const c = mkCanvas(80, 112); cenizaDraw(c.g, 36, 110, 'ready', .3); drawS(c.g, cenizaPatoSpr('grin'), 66, 26, { flip: true }); return c; }),
  face: () => mdl('cz:cenFace', () => faceCrop(cenizaBody('smug'), 12, 20, 40, 42)),
  rim: RAMP.purple[3], cardCols: [RAMP.purple[1], RAMP.purple[2]], nameFill: ['#ffffff', '#e5d3fa', '#bf95e9'],
  tip: 'Arrastra con el dedo: ingredientes, lazos, correas…',
  peek: (g, x, y, t) => cenizaDraw(g, x, y + 58, 'smug', t),
  songs: CENIZA_SONGS,
  intro: 'ceniza_in', outro: 'ceniza_out',
  room: {
    top: cenizaRoomTop, bot: cenizaRoomBot, frame: 'gothic', life: cenizaLife, lifeY: 136, lifeSpacing: 34, miniLife: cenizaMiniLife,
    counter: { x: SW / 2, y: 7 }, mini: cenizaMini, portal: { x: 64, y: 34, w: 128, h: 88 },
    staticCols: [RAMP.purple[1], RAMP.purple[2]], playCols: [RAMP.purple[1], RAMP.purple[2]], cardCol: RAMP.purple,
    counterFill: ['#ffffff', '#e5d3fa', '#bf95e9'],
  },
});

// ---------------------------------------------------------------- story -----
function cenizaGrimoire(g, t, items) {
  // the open book of recipes on the touch screen
  rect(g, 0, 0, SW, SH, RAMP.purple[1]);
  for (let i = 0; i < 20; i++) drawStar(g, (i * 53) % SW, (i * 37) % SH, 1.4, RAMP.purple[3]);
  const bx = 22, by = 14, bw = 212, bh = 124;
  rect(g, bx - 3, by - 3, bw + 6, bh + 6, INK); rect(g, bx - 2, by - 2, bw + 4, bh + 4, '#5a1f2a');
  rect(g, bx, by, bw / 2 - 1, bh, '#fff4dc'); rect(g, bx + bw / 2 + 1, by, bw / 2 - 1, bh, '#fff4dc');
  rect(g, bx + bw / 2 - 1, by, 2, bh, '#c9b28c');
  for (let y = by + 6; y < by + bh; y += 9) { hline(g, bx + 6, bx + bw / 2 - 8, y, '#f2e2b8'); hline(g, bx + bw / 2 + 8, bx + bw - 6, y, '#f2e2b8'); }
  txt(g, 'Pócima Nº 5', bx + bw / 4, by + 6, '#5a1f2a', { align: 'c', bold: true });
  txt(g, 'el champú', bx + bw / 4, by + 20, '#6b6977', { align: 'c' }); txt(g, 'definitivo', bx + bw / 4, by + 30, '#6b6977', { align: 'c' });
  drawS(g, cenizaCauldron(.7), bx + bw / 4, by + 80, {});
  cenizaPotion(g, bx + bw / 4, by + 70, 15, 3, '#5bd18b', t);
  items.forEach((id, i) => { const k = spring(t - .2 - i * .18, 2.4, 7); if (k <= 0) return; const y = by + 10 + i * 22; drawS(g, cenizaIngIcon(id, 1), bx + bw / 2 + 16, y + 8, { s: k }); txt(g, CENIZA_ING[id].name, bx + bw / 2 + 28, y + 4, INK); });
}
defCut('ceniza_in', {
  song: { spb: 4, loop: true, tracks: CENIZA_SONGS.play.tracks },
  shots: [
    { dur: 0, sfx: [[.3, 'czMeow'], [1.4, 'czQuack']], lines: [['narr', 'Mientras tanto, en el almacén de Westie BLVRD…'], ['ceniza', 'Pato, el aloe. Anahí quiere un champú nuevo: natural, suave… y con MUCHA espuma.'], ['pato', '¡Cuac! ¿Y si le echamos una guindilla?'], ['ceniza', 'Ni se te ocurra. Esto es la Pócima Nº 5.']],
      top(g, t) { cenizaRoomTop(g, { pt: t, pb: t * 2, reactT: 9, react: 'ready', phase: 'cut' }); const k = clamp(t / .5, 0, 1); caption(g, 'Almacén · 23:59', 22 - (1 - k) * 40); },
      bot(g, t) { g.drawImage(cenizaBotBg(), 0, 0); cenizaPato(g, 128, 78, CUT.li === 2 ? 'laugh' : 'grin', t, { s: 1 }); if (CUT.li === 2) { drawS(g, cenizaIngIcon('guindilla'), 158, 70, { rot: Math.sin(t * 8) * .3 }); } } },
    { dur: 0, sfx: [[.2, 'czMagic']], lines: [['ceniza', 'Aloe, avena, lavanda, manzanilla… y una pizca de purpurina.'], ['pato', '(Esto va a explotar…) ¡Cuac, cuac!'], ['ceniza', '¿Has dicho algo?'], ['pato', '¡Que qué bien huele, jefa!']],
      top(g, t) { rect(g, 0, 0, SW, SH, RAMP.purple[0]); cenizaStoneWall(g, 0, 0, SW, 150); rect(g, 0, 150, SW, 42, RAMP.wood[1]); cenizaDraw(g, 90, 180, CUT.li === 2 ? 'angry' : 'ready', t); cenizaPato(g, 190, 90, CUT.li === 1 ? 'laugh' : CUT.li === 2 ? 'shock' : 'grin', t, { flip: true }); speedLines(g, 128, 96, t, '#bf95e9', 20, 80); },
      bot(g, t) { cenizaGrimoire(g, t, ['aloe', 'avena', 'lavanda', 'manzanilla', 'purpurina']); } },
  ],
});
defCut('ceniza_out', {
  song: { spb: 4, loop: true, tracks: CENIZA_SONGS.card.tracks },
  shots: [
    { dur: 3, box: 'none', sfx: [[.1, 'czBlub'], [.5, 'czBlub'], [.9, 'czBlub'], [1.2, 'fizz'], [1.9, 'boom'], [2.0, 'fizz']],
      tall(g, t) {
        // the whole den, top screen to floor, and the brew about to blow
        g.drawImage(cenizaRoomBg(), 0, 0);
        cenizaStoneWall(g, 0, 150, SW, TALL_H - 150);
        const gy = SH + HINGE; rect(g, 0, gy + 150, SW, TALL_H - gy - 150, RAMP.wood[1]); for (let j = gy + 150; j < TALL_H; j += 7) { rect(g, 0, j, SW, 1, RAMP.wood[0]); rect(g, 0, j + 1, SW, 1, RAMP.wood[2]); }
        const cx0 = 110, cy0 = gy + 150, shakeK = t < 1.9 ? t * 1.6 : 0;
        const jx = Math.sin(t * 60) * shakeK, cs = cenizaCauldron(1.6);
        cenizaFire(g, cx0, cy0 + 4, t, 1.5);
        g.drawImage(cs, rd(cx0 - cs.width / 2 + jx), rd(cy0 - cs.height + 6));
        cenizaPotion(g, cx0 + jx, cy0 - cs.height + 6 + 19, 38, 7, t < 1.9 ? mixHex('#5bd18b', '#ff93bf', t / 1.9) : '#ff93bf', t, { boil: true });
        // Ceniza, fur on end; Pato hiding behind her hat
        cenizaDraw(g, 206, cy0 + 2, 'boss', t);
        cenizaPato(g, 226, gy + 44 + Math.sin(t * 30) * 1.5, 'shock', t, { flip: true });
        if (t < 1.9) { shout(g, '¡Burbujea DEMASIADO!', 118, gy + 26, t); for (let i = 0; i < 5; i++) { const ph = (t * 2 + i * .2) % 1; disc(g, cx0 - 30 + i * 15, cy0 - 70 - ph * 40, 3 + ph * 3, '#ffd1e4'); } }
        // the foam explosion fills both screens
        if (t > 1.9) { const k = clamp((t - 1.9) / .6, 0, 1); for (let i = 0; i < 44; i++) { const a = i * 2.4, r = k * (40 + (i % 7) * 30); disc(g, cx0 + Math.cos(a) * r, cy0 - 40 + Math.sin(a) * r * 1.7, (10 + (i % 5) * 4) * k, i % 3 ? '#ffffff' : '#ffd1e4'); } if (t < 2.05) { rect(g, 0, 0, SW, TALL_H, '#ffffff'); } }
      } },
    { dur: 0, sfx: [[.2, 'czMeow', { pitch: 1.3 }], [2.2, 'bark']], lines: [['narr', 'Cuando la espuma se disipó…'], ['ceniza', '…¿Qué? ¿Por qué me miráis así?'], ['bule', '¿…Hermana?'], ['ceniza', 'Ni. Una. Palabra.'], ['pato', '¡CUAC, JA, JA, JA!']],
      top(g, t) {
        g.drawImage(cenizaRoomBg(), 0, 0);
        for (let i = 0; i < 14; i++) { const x = (i * 37) % SW, y = 150 + (i % 3) * 6; disc(g, x, y, 5 + (i % 3), '#ffffff'); }
        cenizaDraw(g, 150, 178, CUT.li >= 3 ? 'angry' : CUT.li === 1 ? 'talk' : 'smug', t, { white: true });
        cenizaPato(g, 70, 70, CUT.li === 4 ? 'laugh' : 'dizzy', t);
        if (CUT.li === 0) for (let i = 0; i < 5; i++) { const ph = (t * .5 + i * .2) % 1; g.globalAlpha = 1 - ph; disc(g, 40 + i * 44, 120 - ph * 60, 8 + ph * 8, '#ffffff'); g.globalAlpha = 1; }
      },
      bot(g, t) { g.drawImage(cenizaBotBg(), 0, 0); if (CUT.li >= 2) drawWestieSit(g, 72, 150, CUT.li === 2 ? 'wow' : 'happy'); drawS(g, cenizaBody(CUT.li >= 3 ? 'angry' : 'smug', true), 176, 120, { s: 1 }); if (CUT.li >= 2) txt(g, '?', 100, 40 + Math.sin(t * 6) * 2, '#ffffff', { out: INK, bold: true }); } },
    { dur: 0, lines: [['anahi', '¡Qué espuma más perfecta! Ceniza, ¿esto lo podemos vender?'], ['ceniza', '…Miau.'], ['narr', 'Y así nació la Pócima Nº 5, el champú más espumoso de Westie BLVRD.']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 190, 170, 'win', t); cenizaDraw(g, 90, 178, 'smug', t, { white: true }); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); for (let i = 0; i < 5; i++) { const x = 60 + i * 34, y = 130; rect(g, x - 7, y - 26, 14, 28, INK); rect(g, x - 6, y - 25, 12, 26, '#ff93bf'); rect(g, x - 3, y - 32, 6, 7, INK); rect(g, x - 2, y - 31, 4, 6, '#ffffff'); rect(g, x - 5, y - 17, 10, 9, '#fff8e6'); tiny(g, 'N5', x, y - 15, RAMP.purple[2], { align: 'c' }); px(g, x - 4, y - 22, '#ffffff'); } txt(g, 'NOVEDAD · Pócima Nº 5', SW / 2, 146, INK, { align: 'c', bold: true }); } },
  ],
});
