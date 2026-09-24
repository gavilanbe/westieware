// ============================================================================
//  Stage 2 — RIZOS · ¡FROTA!  "¡A mover el esqueleto!"
//  An apricot goldendoodle with a huge afro who lives for Saturday night at
//  Club Champú (a nod to Jimmy T.). Pulgui, a cheeky flea, lives in the afro.
// ============================================================================
'use strict';

const RIZOS_FUR = RAMP.apricot;
const RIZOS_WET = RAMP.apricot.map(c => mixHex(c, '#4f5f80', .42));
const RIZOS_DAMP = RAMP.apricot.map(c => mixHex(c, '#8a6f86', .22));
const RIZOS_PINK = ['#5e0f3a', '#a3205f', '#ff3d8b', '#ff8fbd', '#ffd3e6'];
const RIZOS_NEON = { pink: '#ff4fa3', cyan: '#4ff2ff', yellow: '#fff04f', purple: '#b04fff', green: '#4fff9a' };

// ---------------------------------------------------------------- voices ----
VOICES.rizos = { base: 62, scale: [0, 3, 5, 7, 10, 12], inst: 'pluck', len: .05 };
VOICES.pulgui = { base: 86, scale: [0, 2, 4, 7], inst: 'squeak', len: .03 };
WHO.rizos = { name: 'Rizos', col: '#e56f1d', voice: 'rizos' };
WHO.pulgui = { name: 'Pulgui', col: '#5b3a1d', voice: 'pulgui' };
WHO.dj = { name: 'DJ Chucho', col: '#6b3fb0', voice: 'narr' };

// vinyl scratch: a band-passed rasp whose pitch follows the hand
SFX.scratch = (t, d, p, v) => {
  const bp = filt('bandpass', 900 * p, 2.2, d); bp.frequency.setValueAtTime(700 * p, t); bp.frequency.exponentialRampToValueAtTime(1900 * p, t + .06); bp.frequency.exponentialRampToValueAtTime(600 * p, t + .12);
  const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.5 * v, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .13);
  noiseSrc(t, t + .14, g, .9);
  const g2 = gainTo(d, 0); g2.gain.setValueAtTime(.12 * v, t); g2.gain.exponentialRampToValueAtTime(.001, t + .1); const a = osc('sawtooth', 180 * p, t, t + .12, g2); a.frequency.exponentialRampToValueAtTime(420 * p, t + .06); a.frequency.exponentialRampToValueAtTime(140 * p, t + .11);
};
// hair spring: a knot popping loose into curls
SFX.boingy = (t, d, p, v) => { SFX.boing(t, d, p * 1.3, v * .7); INST.kalimba(1047 * p, t + .02, .1, v * .8, d); INST.kalimba(1568 * p, t + .07, .1, v * .7, d); };

// ---------------------------------------------------------------- the afro --
// Rizos' head, front view, 84x80. style: fluffy | damp | wet
function rizosHeadBase(style = 'fluffy') {
  return mdl('rizosHeadB:' + style, () => {
    const F = style === 'wet' ? RIZOS_WET : style === 'damp' ? RIZOS_DAMP : RIZOS_FUR;
    let afroS, afro, earL, earR;
    if (style === 'wet') {
      afroS = SD.smooth(5, SD.ellipse(42, 34, 23, 17), SD.ellipse(42, 49, 28, 12));
      const strands = SD.union(...[16, 23, 30, 54, 61, 68].map((x, i) => SD.capsule(x, 44, x + (x < 42 ? -2 : 2), 64 + (i % 3) * 3, 3.2, 1.6)));
      afro = SD.smooth(3, SD.curls(afroS, .8, .6, 2), strands);
      earL = SD.ellipse(16, 56, 6, 14, .12); earR = SD.ellipse(68, 56, 6, 14, -.12);
    } else {
      const R = style === 'damp' ? 26 : 31;
      afroS = SD.circle(42, style === 'damp' ? 34 : 31, R);
      afro = SD.curls(afroS, style === 'damp' ? 1.5 : 2.5, .55, 3);
      earL = SD.curls(SD.ellipse(16.5, 51, 8.5, 13, .15), 1.4, .8, 1); earR = SD.curls(SD.ellipse(67.5, 51, 8.5, 13, -.15), 1.4, .8, 5);
    }
    const faceS = SD.ellipse(42, 49, 16, 14), face = SD.curls(faceS, style === 'wet' ? .4 : 1.1, .9, 7);
    const muzzle = SD.ellipse(42, 57, 9.6, 7.2);
    const curl = style === 'wet' ? clumpTex(3, .24, 4, 2.6, .45) : clumpTex(3.6, .42, 4, 1, 1.35);
    const curl2 = style === 'wet' ? clumpTex(2.6, .2, 8, 2.2, .4) : clumpTex(2.8, .3, 8, 1, .8);
    return model(84, 80, [
      { f: afro, fs: afroS, ramp: F, z: 0, th: 22, tex: curl, dith: .5 },
      { f: earL, ramp: F, z: 1, th: 6, tex: curl2 }, { f: earR, ramp: F, z: 1, th: 6, tex: curl2 },
      { f: face, fs: faceS, ramp: F, z: 2, th: 10, tex: curl2, amb: .32 },
      { f: muzzle, ramp: F, z: 3, th: 6, tex: curl2, amb: .46 },
      { f: SD.box(42, 53, 4.9, 3.4, 2.6), ramp: RAMP.black, z: 4, th: 3, gloss: true, amb: .3 },
    ]);
  });
}
// a 5-point star (for the sunglasses and sparkles)
function rizosStarPts(cx, cy, r, ri, rot = 0) { const p = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? ri : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }
function rizosStarGlasses(g, x, y, o = {}) {
  // (x, y) = centre between the lenses
  const tilt = o.tilt || 0, lens = o.lens || '#2b1a4a', frame = o.frame || '#ff3d8b', frameL = o.frameL || '#ffb3d6';
  for (const s of [-1, 1]) {
    const cx = x + s * 9, cy = y + s * tilt;
    polyPx(g, rizosStarPts(cx, cy, 9.2, 4.5, s * .08), INK);
    polyPx(g, rizosStarPts(cx, cy, 8, 3.9, s * .08), frame);
    polyPx(g, rizosStarPts(cx - .3, cy - .6, 7.1, 3.4, s * .08), frameL);
    if (o.heart) { drawHeart(g, cx, cy, '#ff4060', 1.05); px(g, cx - 2, cy - 2, '#ffffff'); }
    else { polyPx(g, rizosStarPts(cx, cy + .3, 6, 2.9, s * .08), lens); px(g, cx - 2, cy - 1, '#ffffff'); px(g, cx - 1, cy - 2, '#ffffff'); px(g, cx + 2, cy + 1, '#6b4fa0'); }
  }
  hline(g, x - 2, x + 2, y - 1, INK); hline(g, x - 2, x + 2, y, frame);
}
// expressions: cool | grin | itch | shock | sad | love | happy | wink
function rizosHead(ex = 'cool', style = 'fluffy') {
  return mdl('rizosHead:' + ex + style, () => {
    const base = rizosHeadBase(style), c = mkCanvas(base.width, base.height), g = c.g;
    g.drawImage(base, 0, 0);
    const K = RAMP.black, P = RAMP.pink, cx0 = 42, ey = 44;
    const eyes = kind => { for (const s of [-1, 1]) dogEye(g, cx0 + s * 8 - 2, ey, kind); };
    if (ex === 'shock') { eyes('wow'); }
    else if (ex === 'happy') { eyes('happy'); }
    else if (ex === 'wink') { dogEye(g, cx0 - 10, ey, ''); dogEye(g, cx0 + 6, ey, 'closed'); }
    else if (ex === 'sadwet') { eyes('sad'); }
    else rizosStarGlasses(g, cx0, ey + 2, { tilt: ex === 'itch' ? 1 : 0, heart: ex === 'love' });
    // mouth
    const my = 61;
    if (ex === 'grin' || ex === 'love' || ex === 'happy' || ex === 'wink') {
      hline(g, cx0 - 5, cx0 + 5, my, K[0]); px(g, cx0 - 6, my - 1, K[0]); px(g, cx0 + 6, my - 1, K[0]);
      rect(g, cx0 - 4, my + 1, 8, 3, '#3e0d1c'); rect(g, cx0 - 2, my + 2, 5, 4, P[2]); hline(g, cx0 - 1, cx0 + 1, my + 3, P[1]); hline(g, cx0 - 1, cx0 + 2, my + 6, P[0]);
    } else if (ex === 'itch') {
      hline(g, cx0 - 5, cx0 + 5, my, K[0]); for (let i = -4; i <= 4; i += 2) px(g, cx0 + i, my + 1, '#ffffff'); hline(g, cx0 - 5, cx0 + 5, my + 2, K[0]);
      rect(g, 70, 28, 2, 4, '#9bd6f7'); px(g, 70, 32, '#dff4ff'); rect(g, 13, 32, 2, 3, '#9bd6f7');
    } else if (ex === 'shock') {
      rect(g, cx0 - 2, my - 1, 5, 6, K[0]); rect(g, cx0 - 1, my + 2, 3, 2, P[2]);
    } else if (ex === 'sad' || ex === 'sadwet') {
      hline(g, cx0 - 3, cx0 + 3, my + 1, K[0]); px(g, cx0 - 4, my + 2, K[0]); px(g, cx0 + 4, my + 2, K[0]);
      if (ex === 'sad') { vline(g, cx0 - 9, 51, 55, '#9bd6f7'); vline(g, cx0 + 9, 51, 56, '#9bd6f7'); }
    } else { // cool smirk
      hline(g, cx0 - 4, cx0 + 3, my, K[0]); px(g, cx0 + 4, my - 1, K[0]); px(g, cx0 + 5, my - 2, K[0]);
    }
    return c;
  });
}

// ---------------------------------------------------------------- full body --
// Rizos on his hind legs (he's a dancer), 96x132. Arms and legs by two-bone IK.
const RIZOS_POSES = {
  //          l hand     r hand     l foot      r foot      head ex
  dance1: { l: [24, 90], r: [74, 60], lf: [38, 128], rf: [60, 128], ex: 'cool', tilt: .06 },
  dance2: { l: [22, 60], r: [72, 90], lf: [36, 128], rf: [58, 128], ex: 'cool', tilt: -.06 },
  ready: { l: [36, 96], r: [80, 54], lf: [34, 128], rf: [66, 124], ex: 'grin', tilt: .1 },
  win: { l: [18, 58], r: [78, 58], lf: [30, 124], rf: [66, 124], ex: 'grin', tilt: 0 },
  lose: { l: [30, 52], r: [66, 50], lf: [40, 128], rf: [56, 128], ex: 'itch', tilt: .12 },
  speed: { l: [12, 80], r: [84, 80], lf: [42, 128], rf: [54, 124], ex: 'grin', tilt: 0 },
  boss: { l: [32, 70], r: [64, 70], lf: [36, 128], rf: [60, 128], ex: 'shock', tilt: 0 },
  clear: { l: [16, 56], r: [80, 56], lf: [16, 126], rf: [80, 126], ex: 'love', tilt: 0 },
  over: { l: [36, 112], r: [60, 112], lf: [40, 128], rf: [56, 128], ex: 'sad', tilt: .18 },
  talk: { l: [26, 96], r: [76, 74], lf: [38, 128], rf: [58, 128], ex: 'grin', tilt: .04 },
};
const RIZOS_SHIRT = ['#6b5a96', '#a79bd0', '#dcd6f0', '#f5f3ff', '#ffffff'];
function rizosBodyBase(pose) {
  return mdl('rizosBody:' + pose, () => {
    const P = RIZOS_POSES[pose] || RIZOS_POSES.dance1, F = RIZOS_FUR, DN = RAMP.blue;
    const sL = [37, 78], sR = [59, 78], hL = [42, 110], hR = [54, 110];
    const eL = ik2(sL[0], sL[1], P.l[0], P.l[1], 13, 13, -1), eR = ik2(sR[0], sR[1], P.r[0], P.r[1], 13, 13, 1);
    const kL = ik2(hL[0], hL[1], P.lf[0], P.lf[1], 10, 10, 1), kR = ik2(hR[0], hR[1], P.rf[0], P.rf[1], 10, 10, -1);
    // white disco shirt with a big pointed collar, open to show the chain
    const shirt = SD.smooth(4, SD.ellipse(48, 88, 14.5, 16.5), SD.box(48, 102, 12.5, 5, 3));
    const vneck = SD.poly([[42.5, 70], [53.5, 70], [48, 86]]);
    const colL = SD.poly([[39, 70.5], [47, 72.5], [35.5, 85]]), colR = SD.poly([[57, 70.5], [49, 72.5], [60.5, 85]]);
    const sleeve = (a, e) => SD.capsule(a[0], a[1], lerp(a[0], e[0], .5), lerp(a[1], e[1], .5), 5.4, 5);
    const fore = (e, h) => SD.curls(SD.capsule(lerp(e[0], e[0], 0), e[1], h[0], h[1], 3.9, 3.5), 1, .9, e[0]);
    const upper = (a, e) => SD.capsule(a[0], a[1], e[0], e[1], 4.2, 3.9);
    // denim bell-bottoms flaring over platform shoes
    const hips = SD.box(48, 110, 12.5, 5.5, 3);
    const leg = (h, k, f) => SD.union(SD.capsule(h[0], h[1], k[0], k[1], 5.4, 4.6), SD.capsule(k[0], k[1], f[0], f[1] - 3, 4.6, 7.4));
    const shoe = f => SD.box(f[0], f[1] - 1, 6.4, 2.6, 1.4);
    const pawL = SD.curls(SD.circle(P.l[0], P.l[1], 4.7), 1, 1.1, 2), pawR = SD.curls(SD.circle(P.r[0], P.r[1], 4.7), 1, 1.1, 9);
    const curl2 = clumpTex(2.8, .32, 14, 1, 1.1);
    const denim = (x, y) => (hash2(fl(x), fl(y * .5), 5) - .5) * .12;
    const zA = 3.4;
    const arms = model(96, 132, [
      { f: upper(sL, eL), ramp: F, z: zA - .2, th: 4, tex: curl2 }, { f: upper(sR, eR), ramp: F, z: zA - .2, th: 4, tex: curl2 },
      { f: fore(eL, P.l), ramp: F, z: zA, th: 4, tex: curl2 }, { f: fore(eR, P.r), ramp: F, z: zA, th: 4, tex: curl2 },
      { f: sleeve(sL, eL), ramp: RIZOS_SHIRT, z: zA + .1, th: 4, amb: .36 }, { f: sleeve(sR, eR), ramp: RIZOS_SHIRT, z: zA + .1, th: 4, amb: .36 },
      { f: pawL, ramp: F, z: zA + .3, th: 3, tex: curl2, amb: .38 }, { f: pawR, ramp: F, z: zA + .3, th: 3, tex: curl2, amb: .38 },
    ]);
    const body = model(96, 132, [
      { f: leg(hL, kL, P.lf), ramp: DN, z: 1, th: 5, tex: denim }, { f: leg(hR, kR, P.rf), ramp: DN, z: 1, th: 5, tex: denim },
      { f: shoe(P.lf), ramp: RAMP.purple, z: 1.2, th: 2 }, { f: shoe(P.rf), ramp: RAMP.purple, z: 1.2, th: 2 },
      { f: hips, ramp: DN, z: 1.5, th: 5 },
      { f: shirt, ramp: RIZOS_SHIRT, z: 2, th: 12, amb: .34 },
      { f: vneck, ramp: F, z: 2.1, th: 3, tex: curl2, edge: false },
      { f: colL, ramp: RIZOS_SHIRT, z: 2.3, th: 2, amb: .45 }, { f: colR, ramp: RIZOS_SHIRT, z: 2.3, th: 2, amb: .45 },
    ], { post: g => {
      // gold chain + star medallion, belt with a big buckle, shirt buttons
      for (let i = 0; i <= 14; i++) { const a = Math.PI * (.2 + .6 * i / 14), x = 48 - Math.cos(a) * 6, y = 71 + Math.sin(a) * 9; px(g, x, y, i % 2 ? RAMP.gold[4] : RAMP.gold[2]); }
      polyPx(g, rizosStarPts(48, 81, 3.8, 1.8, 0), INK); polyPx(g, rizosStarPts(48, 81, 2.8, 1.3, 0), RAMP.gold[3]); px(g, 47, 80, RAMP.gold[4]);
      rect(g, 36, 104, 25, 2, '#2b1a4a'); rect(g, 45, 103, 7, 4, INK); rect(g, 46, 104, 5, 2, RAMP.gold[3]); px(g, 46, 104, RAMP.gold[4]);
      for (const by of [90, 96]) px(g, 48, by, '#b9b0d6');
    } });
    return { body, arms, raised: P.l[1] < 80 || P.r[1] < 80 };
  });
}
function rizosDraw(g, x, y, pose = 'dance1', o = {}) {
  // (x, y) = between the feet
  const P = RIZOS_POSES[pose] || RIZOS_POSES.dance1, B = rizosBodyBase(pose);
  const X = rd(x - 48), Y = rd(y - 128 - (o.jump || 0));
  g.drawImage(B.body, X, Y);
  if (!B.raised) g.drawImage(B.arms, X, Y);
  const tilt = (P.tilt || 0) + (o.tilt || 0), ex = o.ex || P.ex;
  drawS(g, rizosHead(ex, o.style || 'fluffy'), X + 48, Y + 44 + (o.headBob || 0), { rot: tilt });
  if (B.raised) g.drawImage(B.arms, X, Y);
  if (ex === 'shock' && !o.noPop) { drawS(g, rizosGlassesSpr(), X + 48 + Math.sin(NOW * 20) * 2, Y - 2 - Math.abs(Math.sin(NOW * 7)) * 5, { rot: .3 }); }
}
function rizosGlassesSpr() { return mdl('rizosGlasses', () => { const c = mkCanvas(40, 22); rizosStarGlasses(c.g, 20, 11, {}); return c; }); }

// ---------------------------------------------------------------- Pulgui ----
// the cheeky flea with a red cap; 16x14; frames: sit | jump | hit
function rizosPulguiSpr(fr = 'sit') {
  return mdl('pulgui:' + fr, () => {
    const Bn = RAMP.mud;
    const legsUp = fr === 'jump';
    const body = SD.ellipse(8, 9, 5.5, 4), head = SD.circle(11.5, 6, 3.2);
    const cap = SD.union(SD.ellipse(11.5, 3.6, 3.4, 2), SD.box(14.2, 4.6, 1.8, .8, .5));
    const legs = SD.union(...[0, 1, 2].map(i => legsUp ? SD.capsule(5 + i * 3, 11, 2 + i * 4, 14, .7, .6) : SD.capsule(5 + i * 3, 11, 4 + i * 3.2, 14, .7, .6)));
    return model(18, 16, [
      { f: legs, ramp: Bn, z: 0, th: 1 },
      { f: body, ramp: Bn, z: 1, th: 4, gloss: true },
      { f: head, ramp: Bn, z: 2, th: 3 },
      { f: cap, ramp: RAMP.red, z: 3, th: 2 },
    ], { post: g => {
      if (fr === 'hit') { linePx(g, 11, 5, 12, 6, INK); linePx(g, 12, 5, 11, 6, INK); }
      else { px(g, 12, 6, '#ffffff'); px(g, 13, 6, INK); }
      px(g, 14, 8, INK); px(g, 13, 8, '#fff'); // cheeky grin tooth
    } });
  });
}

// ---------------------------------------------------------------- Club Champú
function rizosNeonText(g, s, x, y, col, t, flick = 0) {
  const on = !(flick && (fl(t * 13) % 17 === 0 || fl(t * 7) % 23 === 0));
  txt(g, s, x, y, on ? col : '#3a2050', { align: 'c', bold: true, out: on ? mixHex(col, '#1a0830', .55) : '#1a0830' });
  if (on) { g.globalAlpha = .18; txt(g, s, x, y + 1, col, { align: 'c', bold: true }); g.globalAlpha = 1; }
}
function rizosClubBack() {
  return mdl('rizosClubBack', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 150, ['#12062a', '#1a0a38', '#220d45', '#2a1052', '#2f1260']);
    // studded wall panels
    for (let x = 4; x < SW; x += 36) { ringRect(g, x, 34, 30, 106, 1, '#3d1a70'); for (let y = 40; y < 136; y += 12) px(g, x + 15, y, '#5a2a9a'); }
    // ceiling truss
    rect(g, 0, 0, SW, 8, '#0b0418'); for (let x = 0; x < SW; x += 8) { linePx(g, x, 1, x + 4, 7, '#3a3350'); linePx(g, x + 4, 7, x + 8, 1, '#3a3350'); }
    rect(g, 0, 8, SW, 1, '#524a6e');
    // speaker stacks
    for (const sx of [4, 216]) {
      for (const [yy, hh] of [[96, 30], [126, 26]]) {
        rect(g, sx, yy, 36, hh, INK); rect(g, sx + 1, yy + 1, 34, hh - 2, '#26213a'); rect(g, sx + 1, yy + 1, 34, 1, '#3d3656');
      }
    }
    // the DJ booth sign plate behind the counter
    return c;
  });
}
function rizosSpeakerCones(g, beat) {
  const k = Math.max(0, 1 - (beat % 1) * 3);
  for (const sx of [22, 234]) for (const [cy, r] of [[111, 10], [139, 8]]) {
    disc(g, sx, cy, r + 1 + k * .8, INK); disc(g, sx, cy, r + k * .8, '#3d3656'); disc(g, sx, cy, r * .62 + k, '#15111f'); disc(g, sx - 1, cy - 1, r * .25, '#5f5883');
  }
}
function rizosDanceFloor(g, y0, beat, rows = 5, yEnd = SH) {
  // perspective light-up tiles: each beat a new pattern walks across the floor
  const vx = SW / 2, H = yEnd - y0, cols = [RIZOS_NEON.pink, RIZOS_NEON.cyan, RIZOS_NEON.yellow, RIZOS_NEON.purple, RIZOS_NEON.green];
  const b = fl(beat), fr = beat % 1, pat = fl(beat / 4) % 3;
  let yy = y0;
  for (let r = 0; r < rows; r++) {
    const h = rd(H * (r + 1) / (rows * (rows + 1) / 2) * 1), y1 = Math.min(yEnd, yy + Math.max(5, h));
    const n = 10, wTop = SW + 40 + r * 60, wBot = SW + 100 + r * 60;
    for (let i = 0; i < n; i++) {
      const xa = vx - wTop / 2 + wTop * i / n, xb = vx - wTop / 2 + wTop * (i + 1) / n, xc = vx - wBot / 2 + wBot * (i + 1) / n, xd = vx - wBot / 2 + wBot * i / n;
      const lit = pat === 0 ? (i + r + b) % 3 === 0 : pat === 1 ? (i + b) % 2 === (r % 2) : Math.abs(i - 4.5) + r < ((b % 6) + 1) * 1.6 && Math.abs(i - 4.5) + r >= (b % 6) * 1.6;
      const col = cols[(i * 3 + r * 2 + b) % cols.length];
      polyPx(g, [[xa + 1, yy + 1], [xb - 1, yy + 1], [xc - 1, y1 - 1], [xd + 1, y1 - 1]], lit ? mixHex(col, '#ffffff', fr < .15 ? .5 : 0) : mixHex(col, '#1a0a38', .72));
      if (lit) { g.globalAlpha = .35; polyPx(g, [[xa + 3, yy + 2], [xb - 3, yy + 2], [xb - 5, yy + 3], [xa + 5, yy + 3]], '#ffffff'); g.globalAlpha = 1; }
    }
    hline(g, 0, SW, yy, '#0b0418');
    yy = y1;
  }
}
function rizosDiscoBall(g, x, y, r, t, o = {}) {
  if (!o.noChain) vline(g, x, 0, y - r, '#8f88a8');
  disc(g, x, y, r + 1, INK);
  const rot = t * 1.4;
  disc(g, x, y, r, '#8f98b8');
  const st = r < 9 ? 2 : 3;
  for (let j = -r; j <= r; j += st) for (let i = -r; i <= r; i += st) {
    if (i * i + j * j > (r - .5) * (r - .5)) continue;
    const u = Math.asin(clamp(i / Math.sqrt(Math.max(1, r * r - j * j)), -1, 1)), f = fl((u * 4 + rot) * 1.3) + fl((j + r) / st);
    const lum = .55 + .45 * Math.sin(f * 2.1 + rot * 2) - (i + j) / (r * 3.2);
    rect(g, x + i, y + j, st - 1, st - 1, lum > .82 ? '#ffffff' : lum > .5 ? '#dfe4f2' : lum > .22 ? '#aab2cc' : '#6b7392');
  }
  disc(g, x - r * .35, y - r * .4, Math.max(1, r * .22), '#ffffff');
  // twinkles
  for (let k = 0; k < 3; k++) { const ph = (t * 1.7 + k * .37) % 1; if (ph < .25) drawStar(g, x - r * .5 + k * r * .5, y - r * .3 + (k % 2) * r * .5, 3 * (1 - ph * 4) + .5, '#ffffff', ph * 5); }
}
function rizosBeams(g, t, beat) {
  const cols = [RIZOS_NEON.pink, RIZOS_NEON.cyan, RIZOS_NEON.yellow];
  for (let i = 0; i < 3; i++) {
    const ox = i === 0 ? 10 : i === 1 ? SW - 10 : SW / 2, a = Math.sin(t * (.9 + i * .3) + i * 2) * .7 + Math.PI / 2;
    const L = 240, w = .1, x1 = ox + Math.cos(a - w) * L, y1 = 8 + Math.sin(a - w) * L, x2 = ox + Math.cos(a + w) * L, y2 = 8 + Math.sin(a + w) * L;
    g.globalAlpha = .1 + Math.max(0, 1 - (beat % 1) * 3) * .06; polyPx(g, [[ox, 8], [x1, y1], [x2, y2]], cols[(i + fl(beat / 2)) % 3]); g.globalAlpha = 1;
  }
}
function rizosFloatBubbles(g, t, n = 10, y0 = 150) {
  for (let i = 0; i < n; i++) { const r = 2 + (i % 3), x = (i * 53 + Math.sin(t + i) * 6) % SW, y = y0 - ((t * (14 + i % 4 * 5) + i * 37) % y0); ringPx(g, x, y, r, '#8f6cff'); px(g, x - r * .4, y - r * .4, '#e5d3fa'); }
}
// the interlude room — Rizos dances in the middle of Club Champú
function rizosPoseFor(S) {
  const rt = S.reactT || 0, beat = S.pb || 0;
  let pose = fl(beat) % 2 ? 'dance2' : 'dance1';
  if (S.react === 'ready' && rt < 1.4) pose = 'ready';
  if (S.react === 'win' && rt < 1.2) pose = 'win';
  if (S.react === 'lose' && rt < 1.4) pose = 'lose';
  if (S.phase === 'inter' && S.special === 'speed' && S.pb >= 2) pose = 'speed';
  if (S.phase === 'inter' && S.special === 'boss' && S.pb >= 2) pose = 'boss';
  if (S.react === 'clear') pose = 'clear';
  if (S.react === 'over') pose = 'over';
  return pose;
}
function rizosRoomTop(g, S) {
  const t = S.pt || 0, beat = S.pb || 0, rt = S.reactT || 0;
  g.drawImage(rizosClubBack(), 0, 0);
  rizosBeams(g, NOW, beat);
  rizosFloatBubbles(g, NOW, 9, 146);
  rizosSpeakerCones(g, beat);
  // neon sign on the right wall + the ball on the left
  rizosNeonText(g, 'CLUB', 214, 38, RIZOS_NEON.pink, NOW, 1);
  rizosNeonText(g, 'CHAMPÚ', 214, 50, RIZOS_NEON.cyan, NOW + 3, 1);
  ringPx(g, 238, 34, 4, RIZOS_NEON.cyan); ringPx(g, 244, 42, 3, RIZOS_NEON.pink);
  rizosDiscoBall(g, 44, 30, 13, NOW);
  // the plate the counter sits on
  panel(g, SW / 2 - 24, 2, 48, 30, '#1a0a38', { r: 6, line: RIZOS_NEON.pink });
  ringRect(g, SW / 2 - 22, 4, 44, 26, 1, '#5a2a9a');
  rizosDanceFloor(g, 150, beat);
  const pose = rizosPoseFor(S);
  const jump = pose === 'win' ? Math.max(0, Math.sin(Math.min(1, rt / .5) * Math.PI)) * 12 : pose === 'clear' ? Math.abs(Math.sin(rt * 5)) * 8 : pose === 'speed' ? Math.abs(Math.sin(t * 16)) * 3 : 0;
  shadowOval(g, 128, 170, 24, 3, .6);
  rizosDraw(g, 128, 170, pose, { jump, headBob: pose.startsWith('dance') ? Math.round(Math.abs(Math.sin(beat * Math.PI)) * 2) : 0, tilt: pose === 'speed' ? Math.sin(t * 20) * .1 : 0 });
  if (pose === 'lose' || pose === 'over') {
    // Pulgui bouncing on top of the afro
    const px0 = 128 + Math.sin(rt * 9) * 16, py0 = 170 - 128 - jump + 6 - Math.abs(Math.sin(rt * 11)) * 12;
    drawS(g, rizosPulguiSpr(fl(rt * 11) % 2 ? 'jump' : 'sit'), px0, py0);
    if (rt < 1) txt(g, '¡Ji, ji!', px0 + 18, py0 - 12, '#ffffff', { out: INK });
  }
  if (pose === 'win' && rt < .9) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rt * 4; drawStar(g, 128 + Math.cos(a) * 44, 100 + Math.sin(a) * 30, 3, [RIZOS_NEON.yellow, RIZOS_NEON.pink, RIZOS_NEON.cyan][i % 3]); }
  if (pose === 'speed') for (let i = 0; i < 8; i++) { const yy = 60 + i * 12, xx = (i * 41 + fl(t * 400)) % 60; rect(g, 64 - xx * .4 - 20, yy, 18, 1, '#ffffff'); rect(g, 192 + xx * .4, yy + 5, 18, 1, '#ffffff'); }
}
function rizosBotBack() {
  return mdl('rizosBotBack', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 150, ['#1d0b3d', '#26104c', '#2f1460', '#381872']);
    for (let i = 0; i < 40; i++) { const x = hash2(i, 2) * SW, y = hash2(3, i) * 140, r = 1 + fl(hash2(i, 9) * 3); ringPx(g, x, y, r, '#4a2590'); }
    // the DJ booth front (chrome + purple leatherette), lives sit on top
    rect(g, 0, 150, SW, 42, INK); rect(g, 0, 151, SW, 3, RAMP.steel[3]); rect(g, 0, 151, SW, 1, RAMP.steel[4]);
    rect(g, 0, 154, SW, 38, '#3b1a6a');
    for (let x = 6; x < SW; x += 14) for (let y = 160; y < SH; y += 10) { px(g, x + ((y / 10) % 2) * 7, y, '#5a2a9a'); }
    return c;
  });
}
function rizosRoomBot(g, S) {
  g.drawImage(rizosBotBack(), 0, 0);
  // light strip along the booth, chasing with the beat
  const b = fl((S.pb || 0) * 2);
  for (let x = 4, i = 0; x < SW; x += 8, i++) { const on = (i + b) % 4 === 0; rect(g, x, 152, 4, 1, on ? RIZOS_NEON.yellow : '#6b5a1a'); }
}
// the portal: a marquee frame of chasing bulbs around a pink neon tube
PORTAL_FRAMES.disco = function (g, x, y, w, h, beat) {
  const b = 7;
  ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
  ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 2, '#2a1052');
  ringRect(g, x - 3, y - 3, w + 6, h + 6, 1, '#ff3d8b'); ringRect(g, x - 2, y - 2, w + 4, h + 4, 1, '#ffb3d6'); ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  const ch = fl(beat * 3), cols = [RIZOS_NEON.yellow, RIZOS_NEON.pink, RIZOS_NEON.cyan];
  let i = 0;
  const bulb = (bx, by) => { const on = (i + ch) % 3 === 0, c = cols[fl(i / 3) % 3]; disc(g, bx, by, 2, INK); disc(g, bx, by, 1.5, on ? c : mixHex(c, '#2a1052', .7)); if (on) px(g, bx - 1, by - 1, '#ffffff'); i++; };
  for (let xx = x - b + 3; xx <= x + w + b - 3; xx += 8) bulb(xx, y - b + 2.5);
  for (let yy = y - b + 11; yy <= y + h + b - 3; yy += 8) bulb(x + w + b - 2.5, yy);
  for (let xx = x + w + b - 11; xx >= x - b + 3; xx -= 8) bulb(xx, y + h + b - 2.5);
  for (let yy = y + h + b - 11; yy >= y - b + 3; yy -= 8) bulb(x - b + 2.5, yy);
  // mini disco ball crowning the frame
  rizosDiscoBall(g, x + w / 2, y - b - 7, 6, beat * .5, { noChain: true });
};
// lives: little disco balls on the booth; losing one shatters it into shards
function rizosLifeBall() { return mdl('rizosLifeBall', () => { const c = mkCanvas(20, 20); rizosDiscoBall(c.g, 10, 10, 8, 1.3, { noChain: true }); return c; }); }
function rizosLife(g, x, y, st, bt) {
  if (st === 'gone') { ringPx(g, x, y, 8, '#5a2a9a'); for (let a = 0; a < TAU; a += .8) px(g, x + Math.cos(a) * 8, y + Math.sin(a) * 8, '#8f6cff'); return; }
  if (st === 'break') {
    const k = clamp(bt / 1.1, 0, 1);
    if (k < .12) { drawS(g, rizosLifeBall(), x + Math.sin(bt * 60) * 2, y); return; }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + hash2(i, 4), sp = 30 + hash2(i, 5) * 40, sx = x + Math.cos(a) * sp * k, sy = y + Math.sin(a) * sp * k + 90 * k * k; rect(g, sx, sy, 2 + (i % 2), 2, i % 3 ? '#cfd6e8' : '#ffffff'); }
    if (bt < .6) txt(g, '¡CRASH!', x, y - 22 - bt * 12, '#ffffff', { align: 'c', out: INK, bold: true });
    return;
  }
  drawS(g, rizosLifeBall(), x, y);
  if (fl((NOW + x * .01) * 3) % 5 === 0) drawStar(g, x - 3, y - 4, 2.5, '#ffffff', NOW * 6);
}
function rizosMiniLife(g, x, y, alive) { if (alive) { disc(g, x, y, 4.5, INK); disc(g, x, y, 3.5, '#cfd6e8'); px(g, x - 1, y - 2, '#ffffff'); px(g, x + 1, y, '#8f98b8'); } else ringPx(g, x, y, 3.5, 'rgba(255,255,255,.5)'); }
function rizosMini(g, x, y, st, S) {
  const ex = st === 'win' ? 'grin' : st === 'lose' ? 'shock' : 'cool';
  drawS(g, rizosHead(ex), 40, SH + 6 - (st === 'win' ? 6 : 0) + Math.round(Math.sin((S.pb || 0) * Math.PI)) , { ax: .5, ay: 1 });
}
function rizosPlayTop(g, S) {
  // purple/pink stripes that slide with the tempo, a shimmer of bubbles
  rect(g, 0, 0, SW, SH, '#2a1052');
  const off = fl((S.pt || 0) * 22 * S.bpm / 120) % 24;
  for (let x = -SH; x < SW + 24; x += 24) polyPx(g, [[x + off, SH], [x + 12 + off, SH], [x + 12 + SH + off, 0], [x + SH + off, 0]], '#3b1a6a');
  rizosFloatBubbles(g, NOW, 8, SH);
  rizosMini(g, 0, 0, S.g.state === 'play' ? 'watch' : S.g.state === 'won' ? 'win' : 'lose', S);
}

// ---------------------------------------------------------------- music -----
// disco-funk: four on the floor, octave bass, string stabs, clavinet plucks
const RIZOS_DRUM = 'k h o h k+c h o h k h o h k+c h o h';
const RIZOS_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'brass', v: .6, n: 'A4 . . A4 . . C5 . D5 - E5 - . . . . G5 - E5 . D5 . C5 . A4! - - - . . . .' },
    { i: 'pad', v: .5, n: 'A3+C4+E4 - - - - - - - D3+F3+A3 - - - - - - - E3+G3+B3 - - - - - - - A3+C4+E4 - - - . . . .' },
    { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 . D2 . D3 . D2 . D3 . E2 . E3 . E2 . E3 . A2 . A3 . A2 . . .' },
    { i: 'd', v: .8, n: RIZOS_DRUM + ' ' + 'k h o h k+c h o h k h o h k+x - - -' }] },
  ready: { spb: 4, tracks: [{ i: 'brass', v: .6, n: 'E5 . E5 . G5 . A5! .' }, { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 .' }, { i: 'd', v: .8, n: 'k h o h k+c h o h' }] },
  win: { spb: 4, tracks: [{ i: 'brass', v: .7, n: 'A4 C5 E5 A5! - G5 A5 .' }, { i: 'pad', v: .45, n: 'A4+C5+E5 - - - A4+C#5+E5 - - -' }, { i: 'bass', v: .9, n: 'A2 . A3 . E2 . A2 .' }, { i: 'd', v: .85, n: 'k h o h k+c c c .' }] },
  lose: { spb: 4, tracks: [{ i: 'pluck', v: .8, n: 'E4 - D#4 - D4 - C#4 -' }, { i: 'bass', v: .9, n: 'E2 . D#2 . D2 . C#2 .' }, { i: 'd', v: .7, n: 'k . . . k . . .' }] },
  next: { spb: 4, tracks: [{ i: 'pluck', v: .6, n: 'A4 A4 C5 . D5 D5 E5 .' }, { i: 'bass', v: .85, n: 'E2 . E3 . E2 . E3 .' }, { i: 'd', v: .8, n: 'k h o h k+c h c c' }] },
  play: { spb: 4, tracks: [
    { i: 'pluck', v: .5, n: 'A4 . C5 A4 . E5 . D5 C5 . A4 . G4 . A4 . A4 . C5 A4 . E5 . G5 E5 . D5 . C5 . A4 .' },
    { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 . G2 . G3 . G2 . G3 . F2 . F3 . F2 . F3 . E2 . E3 . E2 . E3 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM + ' ' + RIZOS_DRUM }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .55, n: 'E5 - E5 . D5 . E5 . G5 - E5 . D5 . C5 . D5 - D5 . C5 . D5 . E5 - C5 . A4 - - . E5 - E5 . D5 . E5 . A5 - G5 . E5 . D5 . C5 - D5 . E5 . C5 . B4 - - .' },
    { i: 'pad', v: .38, n: 'A3+C4+E4 - - - - - - - - - - - - - - - F3+A3+C4 - - - - - - - G3+B3+D4 - - - - - - - A3+C4+E4 - - - - - - - - - - - - - - - F3+A3+C4 - - - - - - - E3+G#3+B3 - - - - - - -' },
    { i: 'bass', v: .9, n: 'A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 G2 G3 G2 G3 F2 F3 F2 F3 F2 F3 F2 F3 G2 G3 G2 G3 G2 G3 G2 G3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 A2 A3 G2 G3 G2 G3 F2 F3 F2 F3 F2 F3 F2 F3 E2 E3 E2 E3 E2 E3 E2 E3' },
    { i: 'd', v: .85, n: RIZOS_DRUM + ' ' + RIZOS_DRUM + ' ' + RIZOS_DRUM + ' k h o h k+c h o h k+c c o c k+c c c+x c' }] },
};

// ---------------------------------------------------------------- the stage -
defStage({
  id: 'rizos', name: 'RIZOS', sub: '«¡A mover el esqueleto!»', verb: '¡FROTA!', mech: 'rub', bpm: 124,
  games: ['espuma', 'toalla', 'vinilo', 'espejo', 'rascar'], boss: 'marana', bossAt: 10, speedAt: [4, 7],
  unlockBy: 'anahi',
  portrait: () => mdl('rizosPortrait', () => { const c = mkCanvas(96, 136); rizosDraw(c.g, 48, 134, 'ready'); return c; }),
  face: () => mdl('rizosFace', () => faceCrop(rizosHead('cool'), 22, 22, 40, 44)),
  peek: (g, x, y) => drawS(g, rizosHead('grin'), x, y - 8, { ax: .5, ay: 1 }),
  rim: '#ff3d8b', cardCols: ['#2a1052', '#3b1a6a'], nameFill: ['#ffffff', '#ffd49b', '#ff9f4f'],
  tip: 'Frota espuma, toallas y vinilos… ¡y ese afro!',
  songs: RIZOS_SONGS,
  intro: 'rizos_in', outro: 'rizos_out',
  room: {
    top: rizosRoomTop, bot: rizosRoomBot, frame: 'disco', life: rizosLife, miniLife: rizosMiniLife, lifeY: 140, lifeSpacing: 34,
    counter: { x: SW / 2, y: 5 }, counterFill: ['#ffffff', '#ffd1e4', '#ff5d9e'], mini: rizosMini, playTop: rizosPlayTop, portal: { x: 64, y: 26, w: 128, h: 96 },
    staticCols: ['#2a1052', '#4a2590'], playCols: ['#2a1052', '#3b1a6a'], cardCol: ['#1d0b3d', '#2a1052', '#3b1a6a', '#5a2a9a', '#8f6cff'],
  },
});

// ---------------------------------------------------------------- story -----
// the club as a tall picture (both screens), Rizos dancing on the lower one
function rizosClubTall(g, t, o = {}) {
  const gy = SH + HINGE;
  bandsV(g, 0, 0, SW, TALL_H, ['#0b0418', '#12062a', '#1a0a38', '#220d45', '#2a1052', '#2f1260']);
  for (let x = 4; x < SW; x += 36) ringRect(g, x, 40, 30, gy + 100, 1, '#3d1a70');
  rizosBeams(g, t, t * 2);
  rizosFloatBubbles(g, t, 12, TALL_H - 40);
  rizosDiscoBall(g, o.ballX || 128, o.ballY || 60, 18, t);
  rizosNeonText(g, 'CLUB CHAMPÚ', SW / 2, 110, RIZOS_NEON.pink, t, 1);
  rizosDanceFloor(g, gy + 150, t * 2, 5, TALL_H);
}
function rizosPulguiChute(g, x, y, t) {
  // Pulgui drifting down under a cocktail-umbrella parachute
  const sw = Math.sin(t * 4) * .25;
  linePx(g, x, y, x - 8 + sw * 10, y - 14, INK); linePx(g, x, y, x + 8 + sw * 10, y - 14, INK);
  polyPx(g, [[x - 11 + sw * 10, y - 14], [x + sw * 10, y - 22], [x + 11 + sw * 10, y - 14]], '#ff3d8b');
  for (let i = -8; i <= 8; i += 4) px(g, x + i + sw * 10, y - 15, '#ffd3e6');
  drawS(g, rizosPulguiSpr('jump'), x, y, { s: 1.4, rot: sw });
}
defCut('rizos_in', {
  song: Object.assign({ loop: true }, RIZOS_SONGS.play),
  shots: [
    { dur: 0, lines: [['narr', 'Sábado, 23:59. Club Champú.'], ['rizos', '¡Yeah, baby! ¡Esta noche la pista es MÍA!'], ['dj', '¡Un aplauso para el rey del afro!']],
      top(g, t) { rizosRoomTop(g, { pt: t, pb: t * 2.07, reactT: t, react: fl(t) % 3 === 2 ? 'ready' : 'x', phase: 'cut', bpm: 124 }); if (fl(t * 2) % 2) rizosNeonText(g, '♪', 60 + Math.sin(t * 3) * 10, 70, RIZOS_NEON.yellow, t); },
      bot(g, t) { g.drawImage(rizosBotBack(), 0, 0); rizosCrowd(g, t, .8, t * 2.07); for (let i = 0; i < 6; i++) { const x = (i * 51 + t * 40) % SW; txt(g, i % 2 ? '¡RI-ZOS!' : '♪', x, 96 + Math.sin(t * 5 + i) * 4, [RIZOS_NEON.pink, RIZOS_NEON.cyan, RIZOS_NEON.yellow][i % 3], { out: INK, bold: true }); } } },
    { dur: 3.4, box: 'none', sfx: [[.2, 'swoosh', { pitch: 2 }], [2.6, 'boing', { pitch: 1.6 }], [2.7, 'yip', { pitch: 2.2 }]],
      tall(g, t) {
        const gy = SH + HINGE;
        rizosClubTall(g, t, { ballY: 50 });
        rizosDraw(g, 128, gy + 172, fl(t * 2) % 2 ? 'dance1' : 'dance2', { headBob: 1 });
        const k = clamp(t / 2.6, 0, 1), px0 = lerp(118, 128, k) + Math.sin(t * 3) * 14 * (1 - k), py0 = lerp(70, gy + 58, E.ioQ(k));
        if (t < 2.6) rizosPulguiChute(g, px0, py0, t);
        else { drawS(g, rizosPulguiSpr('sit'), 128 + Math.sin(t * 20) * 2, gy + 52, { s: 1.4 }); if (t > 2.7) shout(g, '¡AQUÍ ME QUEDO!', 168, gy + 30, t - 2.7); }
        caption(g, 'Pero alguien más bajaba a bailar…', 22);
      } },
    { dur: 0, lines: [['pulgui', '¡Qué pelazo! ¡Me hago aquí una casita con piscina!'], ['rizos', '¡Ay, ay, AY! ¡ME PICA EL AFRO!'], ['rizos', '¡Emergencia capilar! ¡A Westie BLVRD, YA!']],
      top(g, t) { rizosRoomTop(g, { pt: t, pb: t * 2.07, reactT: .2, react: 'lose', phase: 'cut', bpm: 124 }); },
      bot(g, t) {
        g.drawImage(rizosAfroWall(), 0, 0);
        // Pulgui's little camp in the afro: a tent and a flag
        polyPx(g, [[104, 120], [128, 88], [152, 120]], INK); polyPx(g, [[107, 119], [128, 91], [149, 119]], '#ff3d8b'); polyPx(g, [[124, 119], [128, 100], [132, 119]], '#5e0f3a');
        vline(g, 156, 84, 118, INK); polyPx(g, [[157, 84], [172, 88], [157, 93]], '#fff04f'); tiny(g, 'P', 162, 86, INK);
        drawS(g, rizosPulguiSpr(fl(t * 4) % 2 ? 'sit' : 'jump'), 92, 118 - Math.abs(Math.sin(t * 8)) * 6, { s: 1.6 });
        for (let i = 0; i < 5; i++) { const x = 30 + i * 50 + Math.sin(t * 30 + i) * 3, y = 40 + (i % 2) * 20; txt(g, '!', x, y, '#ff4060', { out: '#ffffff', bold: true }); }
      } },
    { dur: 2.8, box: 'none', sfx: [[.1, 'whoosh'], [1.2, 'swoosh']],
      tall(g, t) {
        streetTall(g, 0, 1, t, { sunUp: 0 });
        g.globalAlpha = .55; rect(g, 0, 0, SW, TALL_H, '#0b0a2a'); g.globalAlpha = 1;
        for (let i = 0; i < 40; i++) px(g, hash2(i, 3) * SW, hash2(3, i) * 120, '#ffffff');
        const gy = SH + HINGE, x = lerp(-40, 300, t / 2.6);
        rizosDraw(g, x, gy + 132, 'speed', { tilt: .2 });
        for (let i = 0; i < 5; i++) disc(g, x - 30 - i * 12, gy + 128 - (i % 2) * 3, 5 - i * .8, '#b3b8d4');
        caption(g, '¡Emergencia capilar!', 22);
      } },
  ],
});
defCut('rizos_out', {
  song: Object.assign({ loop: true }, RIZOS_SONGS.card, { loop: true }),
  shots: [
    { dur: 0, sfx: [[.2, 'slam'], [.4, 'sparkle']], lines: [['narr', 'Una hora (y mucho champú) después…'], ['rizos', '¡Afro PERFECTO, nena! ¡Gracias, Anahí!'], ['narr', '¡RI-ZOS! ¡RI-ZOS! ¡RI-ZOS!']],
      top(g, t) { rizosRoomTop(g, { pt: t, pb: t * 2.07, reactT: t, react: 'clear', phase: 'cut', bpm: 124 }); for (let i = 0; i < 16; i++) { const x = (i * 37 + t * 50) % SW, y = (i * 53 + t * 90) % SH; rect(g, x, y, 2, 2, [RIZOS_NEON.pink, RIZOS_NEON.cyan, RIZOS_NEON.yellow, '#ffffff'][i % 4]); } },
      bot(g, t) { g.drawImage(rizosBotBack(), 0, 0); rizosCrowd(g, t, 1, t * 2.07); } },
    { dur: 0, sfx: [[.1, 'swoosh', { pitch: 2 }], [.9, 'boing'], [1.1, 'slam']], lines: [['pulgui', '¡Holaaa! ¿Me habéis echado de menos?'], ['rizos', '¡¡OTRA VEZ NOOOO!!'], ['narr', 'Continuará… en el próximo lavado.']],
      top(g, t) { rizosRoomTop(g, { pt: t, pb: t * 2.07, reactT: .2, react: 'x', special: 'boss', phase: 'inter', bpm: 124 }); const k = clamp(t / .9, 0, 1); if (k < 1) rizosPulguiChute(g, 128 + Math.sin(t * 3) * 12, lerp(-10, 60, k), t); },
      bot(g, t) { g.drawImage(rizosAfroWall(), 0, 0); drawS(g, rizosPulguiSpr(fl(t * 5) % 2 ? 'sit' : 'jump'), 128, 96 - Math.abs(Math.sin(t * 7)) * 10, { s: 2 }); if (t > .9) shout(g, '¡JI, JI, JI!', 128, 56, t - .9); } },
  ],
});
