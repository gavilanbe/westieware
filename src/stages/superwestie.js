// ============================================================================
//  FINAL — SÚPER KEIKO · ¡TODO!  (Wario-Man homage)
//  Keiko (Anahí's westie) eats the whole "Pack de Chuches" and becomes Súper
//  Keiko. Every microgame of every stage, faster and faster, then the boss:
//  El Monstruo de Barro (washing it reveals Nube, lost in the sewers).
//  + the extra modes unlocked after the ending: MEZCLA MAESTRA and A UN PELO.
// ============================================================================
'use strict';

const HERO_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'brass', v: .65, n: 'C5 - - G4 C5 - E5 - G5 - - - E5 - G5 - C6! - - - - - - - . . . . . . . .' },
    { i: 'bass', v: .85, n: 'C3 . C3 . G2 . C3 . E3 . E3 . G3 . C4 - - - C3 - - - . . . . . . . .' },
    { i: 'd', v: .85, n: 'k . h . s . h . k . h . s s s s k+x - - - - - - - . . . . . . . .' }] },
  ready: { spb: 4, tracks: [{ i: 'brass', v: .6, n: 'G4 . C5 . E5 . G5 .' }, { i: 'bass', v: .85, n: 'C3 . . . G2 . . .' }, { i: 'd', v: .8, n: 'k . h . s . s s' }] },
  win: { spb: 4, tracks: [{ i: 'brass', v: .65, n: 'C5 E5 G5 C6 E6! - C6 .' }, { i: 'p25', v: .4, n: 'G5 C6 E6 G6 C7 - G6 .' }, { i: 'bass', v: .9, n: 'C3 . G2 . C3 . . .' }, { i: 'd', v: .85, n: 'k . s . k k s+x .' }] },
  lose: { spb: 4, tracks: [{ i: 'brass', v: .6, n: 'Ab4 - G4 - Gb4 - F4 -' }, { i: 'bass', v: .9, n: 'Db3 . C3 . B2 . Bb2 .' }, { i: 'd', v: .8, n: 'k . . . T . . .' }] },
  next: { spb: 4, tracks: [{ i: 'brass', v: .55, n: 'G4 . A4 . B4 . D5 .' }, { i: 'bass', v: .9, n: 'G2 . G2 . G2 . G2 .' }, { i: 'd', v: .85, n: 'k . s . k s s s' }] },
  play: { spb: 4, tracks: [
    { i: 'brass', v: .5, n: 'C5 . C5 . G4 . C5 . Eb5 . D5 . C5 - . . Bb4 . Bb4 . F4 . Bb4 . D5 . C5 . Bb4 - . .' },
    { i: 'bass', v: .9, n: 'C3 . C3 C3 . C3 G2 . C3 . C3 C3 . Eb3 F3 . Bb2 . Bb2 Bb2 . Bb2 F2 . Bb2 . Bb2 Bb2 . D3 C3 .' },
    { i: 'd', v: .85, n: 'k . h s k k s h k . h s k s s s k . h s k k s h k . h s k s+x s s' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .6, n: 'C4 - Eb4 - F4 - F#4 - G4 - - - Bb4 - G4 - Ab4 - G4 - F4 - Eb4 - F4 - - - C4 - - -' },
    { i: 'pluck', v: .4, n: 'C5 C5 G5 C5 Eb5 C5 G5 C5 F5 C5 G5 C5 Eb5 C5 D5 C5 C5 C5 G5 C5 Eb5 C5 G5 C5 Ab5 G5 F5 Eb5 D5 C5 B4 G4' },
    { i: 'bass', v: .95, n: 'C2 C2 C3 C2 C2 C2 C3 C2 Ab1 Ab1 Ab2 Ab1 Bb1 Bb1 Bb2 Bb1 C2 C2 C3 C2 C2 C2 C3 C2 Ab1 Ab1 Ab2 Ab1 G1 G1 G2 G1' },
    { i: 'd', v: .9, n: 'k h s h k k s h k h s h k s s s k h s h k k s h k h s h s s s+x s' }] },
};

// ---------------------------------------------------------------- the hero --
function heroCape(g, x, y, t, dir = 1, len = 48, lift = 0) {
  // a big billowing cape pinned at the neck (x, y), streaming back over the body
  const top = [], bot = [];
  for (let i = 0; i <= 10; i++) {
    const k = i / 10, wave = Math.sin(t * 11 - k * 5.5) * 5 * k, up = lift * k * 12;
    top.push([x - dir * k * len, y - 2 - k * 6 + wave - up]);
    bot.push([x - dir * k * len * .96, y + 7 + k * 20 + wave * 1.3 - up]);
  }
  const poly = top.concat(bot.slice().reverse());
  polyPx(g, poly.map(([a, b]) => [a + dir, b + 1]), INK); polyPx(g, poly.map(([a, b]) => [a - dir, b - 1]), INK);
  polyPx(g, poly, RAMP.green[2]);
  // lining + folds
  for (let i = 1; i < 10; i += 3) linePx(g, top[i][0], top[i][1] + 2, bot[i + 1][0], bot[i + 1][1] - 2, RAMP.green[1]);
  for (let i = 0; i < 10; i++) linePx(g, top[i][0], top[i][1] + 1, top[i + 1][0], top[i + 1][1] + 1, RAMP.green[3]);
  for (let i = 0; i < 10; i++) linePx(g, bot[i][0], bot[i][1], bot[i + 1][0], bot[i + 1][1], RAMP.gold[3]);
  // gold clasp at the neck and the W crest on the cloth
  disc(g, x, y + 2, 3, INK); disc(g, x, y + 2, 2, RAMP.gold[4]);
  const mi = 5, mx = (top[mi][0] + bot[mi][0]) / 2, my = (top[mi][1] + bot[mi][1]) / 2;
  disc(g, mx, my, 6, INK); disc(g, mx, my, 5, RAMP.gold[3]); disc(g, mx - 1, my - 1, 3, RAMP.gold[4]); tiny(g, 'W', mx, my - 2, RAMP.green[1], { align: 'c' });
}
function drawSuperWestie(g, x, y, t, o = {}) {
  // (x, y) = centre of the flying dog
  const dir = o.flip ? -1 : 1, mood = o.mood || 'happy', bob = Math.sin(t * 4) * 2;
  heroCape(g, x + dir * 16, y - 14 + bob, t, dir, 56, o.lift || 0);
  drawS(g, westieSide(1, 'wag', mood), x, y + bob, { flip: o.flip, rot: (o.rot || 0) * dir });
  // Keiko's green bandana at the neck
  const nx = x + dir * 13, ny = y - 6 + bob;
  polyPx(g, [[nx - 7, ny - 4], [nx + 7, ny - 4], [nx + dir * 2, ny + 8]], INK); polyPx(g, [[nx - 6, ny - 3], [nx + 6, ny - 3], [nx + dir * 2, ny + 6]], RAMP.green[2]);
  px(g, nx, ny, '#ffffff'); px(g, nx - 3 * dir, ny - 2, '#ffffff');
  // domino mask over the eye + gold collar with a star tag
  const ex = x + dir * 28, ey = y - 15 + bob;
  rect(g, ex - 6, ey - 3, 12, 6, INK); rect(g, ex - 5, ey - 2, 10, 4, RAMP.green[2]); rect(g, ex - 2, ey - 1, 4, 2, '#ffffff'); px(g, ex + dir, ey, INK);
  rect(g, x + dir * 14 - 3, y - 12 + bob, 6, 2, RAMP.gold[3]); drawStar(g, x + dir * 15, y - 8 + bob, 2.5, RAMP.gold[4]);
}
// Súper Keiko sitting: cape, green domino mask (eyes still show through), W medal
function swKeikoMask(g, hx, hy) {
  // hx, hy = top-left of a 64x60 westie head: a green domino mask built from
  // strips AROUND the eyes, so whatever expression she has still shows
  const G = RAMP.green[2], L = RAMP.green[3], x0 = hx + 16, y0 = hy + 24;
  const strip = (x, y, w, h) => { rect(g, x, y, w, h, G); };
  rect(g, x0, y0, 32, 2, INK); rect(g, x0, y0 + 10, 32, 2, INK);           // top and bottom edges
  strip(x0, y0 + 2, 32, 2); strip(x0, y0 + 8, 32, 2); hline(g, x0 + 1, x0 + 30, y0 + 2, L);
  strip(x0, y0 + 4, 4, 4); strip(x0 + 11, y0 + 4, 10, 4); strip(x0 + 28, y0 + 4, 4, 4); // sides + bridge
  rect(g, x0 - 1, y0, 1, 12, INK); rect(g, x0 + 32, y0, 1, 12, INK);
  rect(g, x0 + 4, y0 + 4, 7, 1, INK); rect(g, x0 + 21, y0 + 4, 7, 1, INK); // lids of the eye holes
}
function heroPortrait() {
  return mdl('heroPortraitK', () => {
    const c = mkCanvas(110, 118), g = c.g;
    // cape billowing to the right behind the sitting hero
    const pts = [[34, 60], [62, 58], [80, 68], [104, 86], [108, 102], [96, 112], [70, 114], [36, 114], [24, 98]];
    polyPx(g, pts.map(([x, y]) => [x + 1, y + 1]), INK); polyPx(g, pts.map(([x, y]) => [x - 1, y - 1]), INK); polyPx(g, pts, RAMP.green[2]);
    for (const [a, b] of [[[50, 62], [60, 112]], [[64, 64], [86, 110]], [[76, 72], [102, 102]]]) linePx(g, a[0], a[1], b[0], b[1], RAMP.green[1]);
    linePx(g, 36, 114, 96, 112, RAMP.gold[3]); linePx(g, 96, 112, 108, 102, RAMP.gold[3]);
    drawS(g, westieSitBody(), 48, 116, { ax: .5, ay: 1 });
    // the head (with her bandana), masked
    const head = mkCanvas(64, 66); head.g.drawImage(keikoHead('happy'), 0, 0); swKeikoMask(head.g, 0, 0);
    g.drawImage(head, 16, 116 - 36 - 45);
    // gold W medal pinned to the bandana
    disc(g, 48, 93, 6, INK); disc(g, 48, 93, 5, RAMP.gold[3]); disc(g, 47, 92, 2, RAMP.gold[4]); tiny(g, 'W', 48, 91, RAMP.green[1], { align: 'c' });
    return c;
  });
}
// ---------------------------------------------------------------- the room --
function nightSky(g, t) {
  bandsV(g, 0, 0, SW, SH, ['#0b0c2a', '#141848', '#231f5e', '#3b2a6e', '#5a3470']);
  for (let i = 0; i < 40; i++) { const tw = (Math.sin(t * 3 + i * 1.7) + 1) / 2; if (tw > .3) px(g, hash2(i, 1) * SW, hash2(1, i) * 120, tw > .8 ? '#ffffff' : '#9fa8ff'); }
  disc(g, 212, 34, 13, '#fff7d6'); disc(g, 206, 30, 13, '#141848');
}
function torreGlories(g, x, base, t) {
  // the bullet-shaped tower with its coloured LED skin
  const h = 92, w = 26;
  for (let y = 0; y < h; y++) {
    const k = y / h, hw = y < 30 ? Math.sqrt(y / 30) * w / 2 : w / 2;
    for (let i = -hw; i < hw; i += 1) { const n = (Math.sin(t * 2 + y * .2 + i * .4) + 1) / 2; g.fillStyle = fl(i + y) % 3 === 0 ? (n > .5 ? '#ff5d9e' : '#3565cc') : n > .7 ? '#63a0ef' : '#233b8c'; g.fillRect(rd(x + i), rd(base - h + y), 1, 1); }
    void k;
  }
}
function barcelonaNight(g, t) {
  nightSky(g, t);
  // Sagrada Família (lit) + Torre Glòries + Eixample rooftops
  const col = '#2a2450';
  for (const [dx, h, w] of [[0, 70, 6], [9, 84, 6], [18, 84, 6], [27, 70, 6], [44, 58, 5], [52, 66, 5]]) { polyPx(g, [[30 + dx, 150], [30 + dx, 150 - h + 10], [30 + dx + w / 2, 150 - h], [30 + dx + w, 150 - h + 10], [30 + dx + w, 150]], col); px(g, 30 + dx + w / 2, 150 - h - 1, '#fff27a'); }
  torreGlories(g, 206, 150, t);
  for (let x = 0; x < SW; x += 22) { const hh = 26 + hash2(x, 9) * 18; rect(g, x, SH - hh, 22, hh, '#1b1742'); for (let wy = SH - hh + 5; wy < SH - 4; wy += 7) for (let wx = x + 3; wx < x + 20; wx += 6) if (hash2(wx, wy) < .45) rect(g, wx, wy, 3, 3, '#ffd87a'); }
}
function heroRoomTop(g, S) {
  const t = S.pt || 0, rt = S.reactT || 0;
  if (typeof cardPrewarm === 'function') cardPrewarm(swAnnWords(S.def.id === 'mezcla')); // the announcements' letters, one per frame
  barcelonaNight(g, NOW);
  let x = 128, y = 98, rot = 0, mood = 'happy', flip = false;
  const r = S.react;
  if (r === 'win' && rt < 1.2) { const a = rt / 1.2 * TAU; x = 128 + Math.sin(a) * 40; y = 98 - Math.sin(a * 2) * 20; rot = Math.sin(a) * .5; }
  else if (r === 'lose' && rt < 1.4) { mood = 'dizzy'; rot = Math.sin(rt * 20) * .3; y = 110 + Math.sin(rt * 9) * 3; }
  else if (r === 'over') { mood = 'ko'; rot = .9; y = 150; }
  else if (r === 'clear') { x = 128 + Math.sin(rt * 3) * 20; y = 90 - Math.abs(Math.sin(rt * 5)) * 12; }
  if (S.special === 'boss' && S.pb >= 2) mood = 'grr';
  drawSuperWestie(g, x, y, NOW, { mood: mood === 'dizzy' ? 'sad' : mood === 'ko' ? 'sad' : mood === 'grr' ? 'itchy' : 'happy', rot, flip });
  if (r === 'lose' && rt < 1.4) for (let i = 0; i < 4; i++) { const a = rt * 6 + i * TAU / 4; drawStar(g, x + 20 + Math.cos(a) * 14, y - 30 + Math.sin(a) * 4, 2.5, '#fff27a'); }
  if (S.special === 'boss' && S.pb >= 2) { const k = clamp((S.pb - 2) / 3, 0, 1); drawMudMonster(g, 128, SH + 60 - k * 70, NOW, .7); }
  if (S.special === 'speed' && S.pb >= 2) for (let i = 0; i < 12; i++) rect(g, (i * 37 + t * 600) % (SW + 40) - 40, 20 + i * 14, 30, 1, '#ffffff');
}
function heroRoomBot(g, S) {
  const t = NOW;
  rect(g, 0, 0, SW, SH, '#1b1742');
  for (let i = 0; i < 30; i++) px(g, hash2(i, 4) * SW, hash2(4, i) * 60, '#9fa8ff');
  // rooftops of the Eixample (terrats) with water tanks and TV aerials
  for (let x = -10; x < SW; x += 46) { rect(g, x, 118, 44, 74, '#2a2450'); rect(g, x, 118, 44, 3, '#3b3470'); rect(g, x + 6, 104, 10, 14, '#3b3470'); linePx(g, x + 30, 118, x + 30, 96, '#5a5490'); hline(g, x + 24, x + 36, 100, '#5a5490'); }
  void t;
}
function heroLife(g, x, y, st, bt) {
  const bone = mdl('lifeBone', () => spr([
    '.kk.......kk.',
    'kwwk.....kwwk',
    'kwwwkkkkkwwwk',
    '.kwwwwwwwwwk.',
    'kwwwkkkkkwwwk',
    'kwwk.....kwwk',
    '.kk.......kk.'], { k: INK, w: '#fff8e6' }));
  if (st === 'gone') { drawS(g, bone, x, y, { alpha: .25 }); return; }
  if (st === 'break') { const k = clamp(bt / 1, 0, 1); drawS(g, bone, x - 4 - k * 10, y + E.inQ(k) * 30, { rot: -k * 2, alpha: 1 - k }); drawS(g, bone, x + 4 + k * 10, y + E.inQ(k) * 30, { rot: k * 2, alpha: 1 - k }); return; }
  drawS(g, bone, x, y); drawStar(g, x + 6, y - 5, 2.2, '#fff27a', NOW * 3);
}
PORTAL_FRAMES.hero = function (g, x, y, w, h, beat) {
  // comic-book panel: thick ink border, yellow burst corners, halftone
  ringRect(g, x - 5, y - 5, w + 10, h + 10, 5, INK); ringRect(g, x - 4, y - 4, w + 8, h + 8, 3, '#ffdf4f'); ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
  for (const [cx0, cy0] of [[x - 4, y - 4], [x + w + 4, y - 4], [x - 4, y + h + 4], [x + w + 4, y + h + 4]]) drawStar(g, cx0, cy0, 7 + Math.abs(Math.sin(beat * Math.PI)) * 2, '#ff5d5d');
  tiny(g, '¡POW!', x + w - 14, y - 12, '#ffdf4f');
};

// ---------------------------------------------------------------- the monster
function mudMonsterModel(f) {
  return mdl('mudMonster' + f, () => {
    const M = RAMP.mud;
    const bodyS = SD.smooth(8, SD.ellipse(60, 58, 42, 34), SD.ellipse(60, 82, 50, 18));
    const body = SD.shag(SD.tufts(bodyS, 60, 50, 3, 18, f * 1.3, 1.4), 1.6, .15, 3 + f);
    const drips = SD.union(...[20, 38, 58, 80, 98].map((x, i) => SD.capsule(x, 86, x + Math.sin(i + f) * 2, 96 + (i % 2) * 5, 4, 2.5)));
    return model(120, 104, [{ f: drips, ramp: M, z: 0, th: 3 }, { f: body, fs: bodyS, ramp: M, z: 1, th: 30, tex: clumpTex(6, .35, 7 + f, 1) }], { post: g => {
      for (const ex of [44, 74]) { disc(g, ex, 44, 7, INK); disc(g, ex, 44, 6, '#fff27a'); disc(g, ex + 1, 45, 3, INK); px(g, ex - 2, 41, '#ffffff'); }
      linePx(g, 36, 34, 50, 38, INK); linePx(g, 82, 34, 68, 38, INK);
      ellipsePx(g, 60, 66, 18, 7, INK); for (let i = -14; i <= 14; i += 7) polyPx(g, [[60 + i - 3, 60], [60 + i + 3, 60], [60 + i, 66]], '#fffaf0');
      for (let i = 0; i < 12; i++) px(g, 30 + hash2(i, f) * 60, 20 + hash2(f, i) * 50, M[4]);
    } });
  });
}
function drawMudMonster(g, x, y, t, s = 1) { drawS(g, mudMonsterModel(fl(t * 3) % 2), x, y, { s, sy: s * (1 + Math.sin(t * 4) * .03) }); }
// ---------------------------------------------------------------- announcements
// ¡MÁS RÁPIDO! · ¡JUEGO DEL JEFE! · ¡MÁS DIFÍCIL!, as comic-book splash panels:
// Súper Keiko zooming through speed lines, the Mud Monster bursting out of the
// sewer, a new chapter with her cape snapping. Mezcla Maestra gets a mixtape.
// Lettering: the comic faces of her title card (src/cards.js, read at run time).
let SW_FACES = null;
function swFaces() {
  return SW_FACES || (SW_FACES = {
    mud: { id: 'swMud', u: 2.4, r: 2.6, slant: .2, gap: .7, fill: ['#f2d49a', '#b8894f', '#7a5226'], line: INK, rim: 2, sx: 3, sy: 4, shadow: ['#4a2f14', '#2a1a0a'], hi: '#fff2c0' },
    sfx: { id: 'swSfx', u: 1.9, r: 2.1, slant: .3, gap: .6, fill: ['#ffffff', '#b3f3ff', '#63a0ef'], line: INK, rim: 2, sx: 2, sy: 3, shadow: '#1c3aa8' },
    glorgh: { id: 'swGlorgh', u: 1.7, r: 1.9, slant: -.15, gap: .6, fill: ['#e8ffc9', '#9cff6b', '#4fa83a'], line: INK, rim: 2, sx: 2, sy: 2, shadow: '#1f4a1a' },
  });
}
const SW_ANN_WORDS = {};
function swAnnWords(mix) {
  const k = mix ? 'mix' : 'hero'; if (SW_ANN_WORDS[k]) return SW_ANN_WORDS[k];
  const F = swFaces();
  return (SW_ANN_WORDS[k] = mix ? [['¡MÁS RÁPIDO!', i => cardMixFace(i, 0)]] : [
    ['¡MÁS RÁPIDO!', cardFit('¡MÁS RÁPIDO!', 214, CARD_HERO_FACE)], ['¡ZOOM!', cardFit('¡ZOOM!', 92, F.sfx)],
    ['¡JUEGO', cardFit('¡JUEGO', 160, F.mud)], ['DEL JEFE!', cardFit('DEL JEFE!', 210, F.mud)], ['¡GLORGH!', cardFit('¡GLORGH!', 80, F.glorgh)],
    ['¡MÁS DIFÍCIL!', cardFit('¡MÁS DIFÍCIL!', 228, CARD_HERO_FACE)], ['¡FLAP!', cardFit('¡FLAP!', 64, CARD_HERO_SMALL)]]);
}
function swPanelFrame(g) { ringRect(g, 0, 0, SW, SH, 2, '#ffffff'); ringRect(g, 2, 2, SW - 4, SH - 4, 3, INK); }
// a jagged comic burst (SFX balloon), centred at (x, y)
function swBurst(g, x, y, rx, ry, n, fill, t, seed = 0) {
  const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + seed, k = i % 2 ? .62 : 1 + (hash2(i, seed * 9 | 0, 5) - .5) * .25 + Math.sin(t * 12 + i) * .03; pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  polyPx(g, pts.map(([a, b]) => [a + 2, b + 2]), INK); polyPx(g, pts.map(([a, b]) => [x + (a - x) * 1.06, y + (b - y) * 1.08]), INK); polyPx(g, pts, fill);
}
function swAnnSpeedBg() {
  return mdl('sw:annSpeedBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, SH, ['#fff7ae', '#ffec94', '#ffdf6e', '#ffc94a', '#ffab52']);
    for (let y = 2; y < SH; y += 6) for (let x = ((y / 6) % 2) * 3 + 2; x < SW; x += 6) { const v = x / SW * .45 + y / SH * .75; if (v > .6) disc(g, x, y, Math.min(2.2, (v - .6) * 5), '#ec8a3a'); }
    return c;
  });
}
function swAnnSpeed(g, S, t) {
  g.drawImage(swAnnSpeedBg(), 0, 0);
  for (let i = 0; i < 16; i++) { const y = 52 + i * 8 + (i % 3) * 2, len = 30 + (i * 37 % 60), x = SW - ((t * 820 + i * 131) % (SW + 160)); rect(g, x, y, len, i % 4 === 0 ? 2 : 1, i % 3 ? '#ffffff' : '#ec5e5e'); }
  const W = swAnnWords(false);
  // ¡ZOOM! bursts where she took off
  const zk = spring(t - .3, 2.6, 7);
  if (zk > 0) { g.save(); g.translate(64, 84); g.rotate(-.14); g.scale(zk, zk); swBurst(g, 0, 0, 58, 30, 14, '#ec5e5e', t, 1); swBurst(g, 0, 0, 48, 23, 14, '#ffdf4f', t, 1.2); cardWord(g, W[1][0], 0, -12, W[1][1]); g.restore(); }
  // Súper Keiko shoots across with afterimages
  const fk = E.outQuint(clamp(t / .55, 0, 1)), kx = lerp(-80, 156, fk) + (t > .55 ? Math.sin(t * 5) * 4 : 0), ky = 132 + Math.sin(t * 11) * 2;
  // motion streaks trail her, plus a single ghost of where she just was
  for (let j = 0; j < 8; j++) { const yy = rd(ky - 20 + j * 6), len = rd((36 + (j * 23 % 50)) * (1.6 - fk * .6)); rect(g, rd(kx - 44 - len), yy, len, j % 3 === 0 ? 2 : 1, j % 2 ? '#ffffff' : '#fff27a'); }
  g.globalAlpha = .22; drawSuperWestie(g, kx - 30, ky, NOW * 2 - .1, { lift: 1 }); g.globalAlpha = 1;
  drawSuperWestie(g, kx, ky, NOW * 2, { lift: 1 });
  const nk = t - .12; if (nk > 0) cardWord(g, W[0][0], 122, 20, W[0][1], { anim: i => cardAnimSlam(nk, i, { from: 2.2, stagger: .04 }) });
  swPanelFrame(g);
}
function swAnnBossBg() {
  return mdl('sw:annBossBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 130, ['#0b0c2a', '#141848', '#1f1d52', '#2b2458']);
    for (let x = -4; x < SW; x += 42) { const h = 70 + hash2(x + 9, 3) * 30; rect(g, x, 130 - h, 40, h, '#1b1742'); rect(g, x, 130 - h, 40, 2, '#2a2450'); for (let wy = 130 - h + 8; wy < 124; wy += 12) for (let wx = x + 5; wx < x + 36; wx += 10) rect(g, wx, wy, 5, 7, hash2(wx, wy) < .4 ? '#ffd87a' : '#2a2450'); }
    fillPat(g, panotPat(), 0, 130, SW, 34); g.globalAlpha = .6; rect(g, 0, 130, SW, 34, '#140c2a'); g.globalAlpha = 1;
    rect(g, 0, 164, SW, 3, '#5b5a66'); rect(g, 0, 167, SW, 25, '#2a2838'); for (let x = 0; x < SW; x += 24) rect(g, x, 184, 12, 2, '#6b6977');
    ellipsePx(g, 128, 176, 23, 8, INK); ellipsePx(g, 128, 176, 21, 6.5, '#0b0810');
    return c;
  });
}
function swAnnBoss(g, S, t) {
  g.drawImage(swAnnBossBg(), 0, 0);
  const W = swAnnWords(false), F = swFaces();
  // green sewer light pouring out of the hole
  const gl = .5 + .5 * Math.sin(t * 7);
  g.globalAlpha = .1 + .06 * gl; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .28; polyPx(g, [[118, 176], [138, 176], [128 + Math.cos(a - .1) * 170, 176 + Math.sin(a - .1) * 170], [128 + Math.cos(a + .1) * 170, 176 + Math.sin(a + .1) * 170]], '#9cff6b'); } g.globalAlpha = 1;
  // the manhole cover rattles, then flies off
  const lt = t - .15;
  if (lt < 1.4) {
    const lx = lt < 0 ? 128 + (hash2(fl(t * 40), 3) - .5) * 3 : 128 + lt * 90, ly = lt < 0 ? 175 : 175 - (lt * 300 - lt * lt * 420), rot = lt < 0 ? 0 : lt * 9;
    g.save(); g.translate(rd(lx), rd(ly)); g.rotate(rot); ellipsePx(g, 0, 0, 21, 7, INK); ellipsePx(g, 0, 0, 20, 6, '#5b5a66'); for (let i = -14; i <= 14; i += 4) hline(g, i - 1, i + 1, 0, '#44424f'); g.restore();
  }
  // the Mud Monster heaves itself up out of the sewer
  const mk = E.outBack(clamp((t - .28) / .6, 0, 1)), my = rd(lerp(236, 122, mk));
  g.save(); g.beginPath(); g.rect(0, 0, SW, 177); g.clip(); drawMudMonster(g, 128 + Math.sin(t * 5) * 2, my, NOW, .85); g.restore();
  ellipsePx(g, 128, 177, 21, 4, '#0b0810'); for (let a = 0; a <= Math.PI; a += .06) { px(g, 128 + Math.cos(a) * 23, 176 + Math.sin(a) * 8, INK); px(g, 128 + Math.cos(a) * 22, 176 + Math.sin(a) * 7, '#5b5a66'); }
  // mud splats flying out and landing on the pavement
  const st = t - .38;
  if (st > 0) for (let j = 0; j < 10; j++) {
    const a = -Math.PI / 2 + (hash2(j, 1, 7) - .5) * 2.6, v = 110 + hash2(1, j, 7) * 130, tt = Math.min(st, 1.4);
    const x = 128 + Math.cos(a) * v * tt, y = 168 + Math.sin(a) * v * tt + 280 * tt * tt;
    if (y < 170) { disc(g, x, y, 4 + (j % 3), INK); disc(g, x, y, 3 + (j % 3), '#7a5226'); px(g, x - 1, y - 1, '#b8894f'); }
    else { const land = (-Math.sin(a) * v + Math.sqrt(Math.sin(a) * Math.sin(a) * v * v + 4 * 280 * 2)) / (2 * 280), lx = 128 + Math.cos(a) * v * land; ellipsePx(g, clamp(lx, 8, SW - 8), 170 + (j % 3) * 5, 6 + (j % 3), 2, '#5b3a1d'); }
  }
  // ¡GLORGH!
  const gk = spring(t - .62, 2.6, 7);
  if (gk > 0) { g.save(); g.translate(196, 106); g.rotate(.12); g.scale(gk, gk); swBurst(g, 0, 0, 44, 22, 12, '#4fa83a', t, 2); swBurst(g, 0, 0, 36, 16, 12, '#1f4a1a', t, 2.3); cardWord(g, W[4][0], 0, -9, W[4][1]); g.restore(); }
  // Súper Keiko in an inset panel, frowning behind her mask
  const ik = spring(t - .8, 2.4, 6);
  if (ik > 0) {
    g.save(); g.translate(40, 150); g.scale(ik, ik);
    disc(g, 0, 0, 31, INK); disc(g, 0, 0, 29, '#ffdf4f'); for (let y = -26; y < 28; y += 5) for (let x = -26 + ((y / 5 | 0) % 2) * 2; x < 28; x += 5) if (x * x + y * y < 700) px(g, x, y, '#ffb84a');
    g.beginPath(); g.arc(0, 0, 28, 0, TAU); g.clip();
    const head = mdl('sw:grrHead', () => { const c = mkCanvas(64, 66); c.g.drawImage(keikoHead('grr'), 0, 0); swKeikoMask(c.g, 0, 0); return c; });
    g.drawImage(head, -32, -26);
    g.restore();
  }
  // the title, in mud that drips
  const nk = t - .18;
  if (nk > 0) {
    cardWord(g, W[2][0], 128, 8, W[2][1], { anim: i => cardAnimSlam(nk, i, { from: 2, stagger: .05 }) });
    const boxes = cardWord(g, W[3][0], 128, 38, W[3][1], { anim: i => cardAnimSlam(nk - .2, i, { from: 2, stagger: .05 }) });
    const dk = t - 1.05;
    if (dk > 0) for (const b of boxes) if (b.i % 2 === 0) { const x = rd(b.cx), y0 = 38 + 10 * b.u + 4, len = Math.min(9, dk * 14) * (.6 + hash2(b.i, 4) * .6); thickLine(g, x, y0, x, y0 + len, 1.3, '#7a5226'); disc(g, x, y0 + len + 1, 1.8, '#7a5226'); }
  }
  swPanelFrame(g);
}
function swAnnLevelBg() {
  return mdl('sw:annLevelBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, SH, ['#0b0c2a', '#141848', '#231f5e', '#3b2a6e', '#4a2f76']);
    for (let y = 2; y < SH; y += 6) for (let x = ((y / 6) % 2) * 3 + 2; x < SW; x += 6) { const v = y / SH; if (v > .55) disc(g, x, y, Math.min(1.8, (v - .55) * 4), '#5a3a8e'); }
    for (let i = 0; i < 30; i++) px(g, hash2(i, 21) * SW, hash2(21, i) * 110, i % 4 ? '#9fa8ff' : '#ffffff');
    return c;
  });
}
function swAnnLevel(g, S, t) {
  g.drawImage(swAnnLevelBg(), 0, 0);
  const W = swAnnWords(false);
  // her cape sweeps across the whole panel and snaps
  const ck = E.outBack(clamp(t / .3, 0, 1)), amp = 8 + 16 * Math.max(0, 1 - Math.abs(t - .32) * 3), ox = (1 - ck) * 280, top = [], bot = [];
  for (let i = 0; i <= 18; i++) { const k = i / 18, x = 280 - k * 310 + ox, w = Math.sin(NOW * 8 - k * 6) * amp * (.3 + k); top.push([x, 30 + k * 18 + w]); bot.push([x, 128 + k * 34 + w * 1.25]); }
  const poly = top.concat(bot.slice().reverse());
  polyPx(g, poly.map(([a, b]) => [a + 2, b + 3]), INK); polyPx(g, poly.map(([a, b]) => [a - 1, b - 1]), INK); polyPx(g, poly, RAMP.green[2]);
  for (let i = 1; i < 18; i += 3) linePx(g, top[i][0], top[i][1] + 3, bot[i + 1][0], bot[i + 1][1] - 3, RAMP.green[1]);
  for (let i = 0; i < 18; i++) { linePx(g, top[i][0], top[i][1] + 1, top[i + 1][0], top[i + 1][1] + 1, RAMP.green[3]); thickLine(g, bot[i][0], bot[i][1] - 1, bot[i + 1][0], bot[i + 1][1] - 1, .8, RAMP.gold[3]); }
  const cx = (top[7][0] + bot[7][0]) / 2, cy = (top[7][1] + bot[7][1]) / 2; disc(g, cx, cy, 9, INK); disc(g, cx, cy, 8, RAMP.gold[3]); disc(g, cx - 2, cy - 2, 4, RAMP.gold[4]); txt(g, 'W', cx, cy - 4, RAMP.green[1], { align: 'c', bold: true });
  // ¡FLAP!
  const fk = spring(t - .26, 2.8, 7);
  if (fk > 0 && t < 1.6) { g.save(); g.translate(46, 150); g.rotate(-.2); g.scale(fk, fk); swBurst(g, 0, 0, 34, 16, 10, '#ffffff', t, 3); cardWord(g, W[6][0], 0, -9, W[6][1]); g.restore(); }
  // the hero strikes a pose; the chapter caption; the title; one star per difficulty step
  const hk = E.outBack(clamp((t - .35) / .4, 0, 1)); drawS(g, heroPortrait(), rd(lerp(SW + 70, 204, hk)), 192, { ax: .5, ay: 1 });
  const bk = E.outBack(clamp((t - .08) / .3, 0, 1)), bw = txtW('…y la cosa se complica') + 12, bx = rd(lerp(-bw - 10, 8, bk));
  rect(g, bx - 1, 7, bw + 2, 17, INK); rect(g, bx, 8, bw, 15, '#fff7ae'); txt(g, '…y la cosa se complica', bx + 6, 12, INK);
  const nk = t - .2; if (nk > 0) cardWord(g, W[5][0], 118, 60, W[5][1], { anim: i => cardAnimSlam(nk, i, { from: 2.2, stagger: .04 }) });
  for (let i = 0; i < 3; i++) { const sk = spring(t - .7 - i * .12, 2.6, 6); if (sk <= 0) continue; const on = i < (S.level || 1), x = 62 + i * 24; g.save(); g.translate(x, 116); g.scale(sk, sk); drawStar(g, 0, 0, 10, INK); drawStar(g, 0, 0, 8, on ? RAMP.gold[3] : '#3b2a6e'); if (on) drawStar(g, -1, -1, 4, RAMP.gold[4]); g.restore(); }
  swPanelFrame(g);
}
// Mezcla Maestra: a mixtape speeding up, sticker letters bouncing on the beat
function swAnnMix(g, S, t) {
  const bt = t * (S.bpm || 120) / 60, off = (t * 90) % 132;
  for (let i = -4; i < 16; i++) { const x = i * 22 + off; polyPx(g, [[x, 0], [x + 22, 0], [x - 44, SH], [x - 66, SH]], CARD_MIX_COLS[((i % 6) + 6) % 6]); }
  g.globalAlpha = .45; rect(g, 0, 6, SW, 44, INK); g.globalAlpha = 1;
  // the record spins faster and faster under the tonearm
  const vk = E.outBack(clamp(t / .4, 0, 1)), vx = rd(lerp(-60, 78, vk)), vy = 128, a = t * (7 + t * 9);
  disc(g, vx, vy, 49, INK); disc(g, vx, vy, 47, '#1d1424'); for (let r = 20; r < 46; r += 4) ringPx(g, vx, vy, r, '#2b2540');
  for (const q of [a, a + Math.PI]) { thickLine(g, vx + Math.cos(q) * 22, vy + Math.sin(q) * 22, vx + Math.cos(q + .5) * 42, vy + Math.sin(q + .5) * 42, .8, '#5a5490'); }
  disc(g, vx, vy, 16, INK); disc(g, vx, vy, 15, '#ff5d9e'); disc(g, vx + Math.cos(a) * 8, vy + Math.sin(a) * 8, 3, '#ffd1e4'); disc(g, vx, vy, 2, '#fff8e6');
  thickLine(g, 150, 70, vx + 30, vy - 22, 1.6, INK); thickLine(g, 150, 70, vx + 30, vy - 22, .8, RAMP.steel[4]); disc(g, 150, 70, 6, INK); disc(g, 150, 70, 5, RAMP.steel[3]); rect(g, vx + 26, vy - 26, 8, 6, INK);
  // the tempo sticker
  const tk = spring(t - .45, 2.6, 6);
  if (tk > 0) { g.save(); g.translate(200, 128); g.rotate(-.18); g.scale(tk, tk); disc(g, 0, 0, 27, INK); disc(g, 0, 0, 25, '#ffffff'); disc(g, 0, 0, 22, '#ffdf4f'); txt(g, 'x' + (1 + .13 * (S.speed || 0)).toFixed(2).replace('.', ','), 0, -6, INK, { align: 'c', bold: true }); tiny(g, 'TEMPO', 0, 6, INK, { align: 'c' }); g.restore(); }
  const W = swAnnWords(true), nk = t - .1;
  if (nk > 0) cardWord(g, W[0][0], 122, 16, W[0][1], { anim: i => { const e = cardAnimDrop(nk, i, { stagger: .05, h: -40 }); if (!e.s) return e; e.dy = (e.dy || 0) - Math.abs(Math.sin((bt * .5 + i * .13) * Math.PI)) * 4; return e; } });
  ringRect(g, 0, 0, SW, SH, 3, '#ffffff'); ringRect(g, 3, 3, SW - 6, SH - 6, 1, INK);
}
function swSpecial(g, S, kind, t) {
  if (S.def.id === 'mezcla' && kind === 'speed') swAnnMix(g, S, t);
  else if (kind === 'speed') swAnnSpeed(g, S, t);
  else if (kind === 'boss') swAnnBoss(g, S, t);
  else if (kind === 'level') swAnnLevel(g, S, t);
  else return false;
}
// bottom screen: a comic caption box sliding in
function swSpecialBot(g, S, kind, t) {
  const lbl = S.def.id === 'mezcla' ? '¡Sube el tempo de la mezcla!' : { speed: '¡Súper Keiko pisa el acelerador!', boss: '¡Algo sale de la alcantarilla!', level: '¡Agárrate bien la capa!' }[kind];
  if (!lbl) return false;
  const k = E.outBack(clamp(t * 3, 0, 1)), w = txtW(lbl) + 16, x = rd(SW / 2 - w / 2 - (1 - k) * 220), y = 6;
  rect(g, x - 1, y - 1, w + 2, 20, INK); rect(g, x, y, w, 18, '#fff7ae'); rect(g, x, y + 15, w, 3, '#ffdf4f'); txt(g, lbl, x + w / 2, y + 5, INK, { align: 'c' });
}
HERO_SONGS.jingles = {
  speed: { spb: 4, tracks: [
    { i: 'p25', v: .7, n: 'C5 D5 E5 F5 G5 A5 B5 C6 D6 E6 F6 G6 C7! - - .' },
    { i: 'brass', v: .6, n: 'C4 . . . E4 . . . G4 . . . C5! - - -' },
    { i: 'bass', v: .9, n: 'C3 . C3 . C3 . C3 . C3 C3 C3 C3 C3! - . .' },
    { i: 'd', v: .85, n: 'k . s . k . s . k s k s k+x - z .' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .8, n: 'C3 - - . C3 - - . Db3 - - . G2! - - -' },
    { i: 'sub', v: .7, n: 'C2 - - - C2 - - - Db2 - - - G1 - - -' },
    { i: 'squeak', v: .3, n: '. . G5 . . . Ab5 . . . G5 . . . C5 .' },
    { i: 'd', v: .9, n: 'k . . T k . . T k . T T T T k+x .' }] },
  level: { spb: 4, tracks: [
    { i: 'brass', v: .75, n: 'G4 - C5 - E5 - G5 - E5 - G5 - C6! - - -' },
    { i: 'bell', v: .5, n: '. . . . . . . . . . . . C6 E6 G6 C7' },
    { i: 'bass', v: .85, n: 'C3 . G2 . C3 . G2 . C3 . G2 . C3! - . .' },
    { i: 'd', v: .85, n: 'k . h . s . h . k . s s k+x - . .' }] },
};

defStage({
  id: 'superwestie', name: 'SÚPER KEIKO', sub: '«¡Por un Eixample sin greñas!»', verb: '¡TODO!', mech: 'mix', bpm: 126,
  games: () => allStoryGames(), boss: 'barro', bossAt: 20, speedAt: [5, 10, 15],
  unlockBy: ['anahi', 'rizos', 'pompon', 'hermanas', 'ceniza', 'bigotes'],
  portrait: () => heroPortrait(),
  face: () => mdl('heroFaceK', () => { const c = mkCanvas(64, 66); c.g.drawImage(keikoHead('wink'), 0, 0); swKeikoMask(c.g, 0, 0); return faceCrop(c, 12, 6, 40, 42); }),
  rim: '#ffdf4f', cardCols: ['#141848', '#231f5e'], nameFill: ['#ffffff', '#b3d9ff', '#63a0ef'], tip: 'Todos los microjuegos… ¡y el Monstruo de Barro!',
  songs: HERO_SONGS, intro: 'superwestie_in', outro: 'superwestie_out', creditsOnClear: true,
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 }, special: swSpecial, specialBot: swSpecialBot,
    mini: (g, x, y, st) => drawSuperWestie(g, 44, SH - 22, NOW, { mood: st === 'lose' ? 'sad' : 'happy' }), bossLabel: '¡Sale de la alcantarilla!',
    portal: { x: 64, y: 22, w: 128, h: 96 }, staticCols: ['#231f5e', '#3b2a6e'], playCols: ['#141848', '#231f5e'], cardCol: RAMP.purple },
});

// ---------------------------------------------------------------- extras ----
function modeIcon(kind) {
  return mdl('modeIcon' + kind, () => {
    const c = mkCanvas(40, 40), g = c.g;
    if (kind === 'mix') { // a DJ vinyl with a rainbow of mechanics
      disc(g, 20, 20, 17, INK); disc(g, 20, 20, 16, '#2b2540'); for (let r = 6; r < 15; r += 3) ringPx(g, 20, 20, r, '#40395e');
      ['#ff5d9e', '#ffdf4f', '#5bd18b', '#63a0ef', '#bf95e9', '#ff9f4f'].forEach((col, i) => { const a = i / 6 * TAU; disc(g, 20 + Math.cos(a) * 11, 20 + Math.sin(a) * 11, 2.5, col); });
      disc(g, 20, 20, 5, '#fff8e6'); px(g, 20, 20, INK);
    } else { // a single hair, a razor's edge
      disc(g, 20, 20, 17, INK); disc(g, 20, 20, 16, '#ff5d5d'); disc(g, 18, 18, 11, '#ff8d8d');
      for (let i = 0; i < 20; i++) px(g, 10 + i, 26 - Math.sin(i * .4) * 10, INK);
      mord(g, '1', 26, 6, { u: .8, r: 1, rim: 1, sy: 1 });
    }
    return c;
  });
}
defStage({
  id: 'mezcla', name: 'MEZCLA MAESTRA', sub: '«Todos los microjuegos, sin fin»', verb: '¡TODO!', mech: 'mix', bpm: 120, endless: true,
  games: () => allStoryGames(), boss: null, speedEvery: 5, unlockBy: 'superwestie',
  portrait: () => heroPortrait(), face: () => modeIcon('mix'), rim: '#bf95e9', cardCols: ['#3d2066', '#5a3396'], tip: '¿Hasta dónde llegas?',
  songs: HERO_SONGS,
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 }, special: swSpecial, specialBot: swSpecialBot, portal: { x: 64, y: 22, w: 128, h: 96 }, staticCols: ['#3d2066', '#5a3396'], playCols: ['#3d2066', '#5a3396'], cardCol: RAMP.purple },
});
defStage({
  id: 'unpelo', name: 'A UN PELO', sub: '«Una vida. Nivel 2. Sin piedad»', verb: '¡TODO!', mech: 'mix', bpm: 128, endless: true, lives: 1, startLevel: 2, noSpeed: true,
  games: () => allStoryGames(), boss: null, unlockBy: 'superwestie',
  portrait: () => heroPortrait(), face: () => modeIcon('hair'), rim: '#ff5d5d', cardCols: ['#5a0f1e', '#7c1830'], tip: 'Un fallo y se acabó',
  songs: HERO_SONGS,
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 }, special: swSpecial, specialBot: swSpecialBot, portal: { x: 64, y: 22, w: 128, h: 96 }, staticCols: ['#5a0f1e', '#7c1830'], playCols: ['#5a0f1e', '#7c1830'], cardCol: RAMP.red },
});

// ---------------------------------------------------------------- story -----
WHO.nube = { name: 'Nube', col: '#8587ab', voice: 'keiko' };
WHO.maite = { name: 'Maite', col: '#35a869', voice: 'anahi' };
// Keiko sitting (her bandana under the chin)
function swKeikoSit(g, x, y, ex = 'normal', o = {}) {
  drawS(g, westieSitBody(), x, y, { ax: .5, ay: 1 });
  drawS(g, keikoHead(ex), x + (o.tilt || 0) * 4, y - 36, { ax: .5, ay: 45 / 66, rot: (o.tilt || 0) * .18 });
}
defCut('superwestie_in', {
  song: { spb: 4, loop: true, tracks: HERO_SONGS.play.tracks },
  shots: [
    { dur: 0, lines: [['narr', 'Esa tarde, en el mostrador de Westie BLVRD…'], ['keiko', '¿Un Pack de Chuches? ¿Naturales? ¿Para mí?'], ['keiko', '*ñam* *ñam* *ÑAM* *ÑAM*'], ['anahi', '¡Keiko! ¡Que eran para vender!']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 200, 170, CUT.li >= 3 ? 'wow' : 'idle', t); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); const eating = CUT.li >= 2; swKeikoSit(g, 128, 188, eating ? 'happy' : 'wow', { tilt: eating ? Math.sin(t * 20) * .3 : 0 });
        // the kraft treat bag with the round WB label
        const bx = 70, by = 150; rect(g, bx - 14, by - 30, 28, 34, INK); rect(g, bx - 13, by - 29, 26, 32, '#c9a26b'); disc(g, bx, by - 14, 8, '#fffaf0'); ringPx(g, bx, by - 14, 8, RAMP.green[2]); tiny(g, 'WB', bx, by - 16, RAMP.green[2], { align: 'c' });
        if (eating) for (let i = 0; i < 3; i++) { const k = (t * 3 + i * .33) % 1; disc(g, bx + 20 + k * 30, by - 20 - Math.sin(k * Math.PI) * 30, 3, '#d58c4c'); } } },
    { dur: 3.2, box: 'none', sfx: [[.1, 'boom'], [.3, 'sparkle'], [1.2, 'slam']],
      tall(g, t) {
        rect(g, 0, 0, SW, TALL_H, '#ffffff');
        for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t; polyPx(g, [[SW / 2, TALL_H / 2], [SW / 2 + Math.cos(a) * 400, TALL_H / 2 + Math.sin(a) * 400], [SW / 2 + Math.cos(a + .13) * 400, TALL_H / 2 + Math.sin(a + .13) * 400]], i % 2 ? '#ffdf4f' : '#ff9f4f'); }
        const rise = E.outBack(clamp(t / .7, 0, 1));
        drawSuperWestie(g, SW / 2, SH + HINGE + 150 - rise * 56, t, { lift: 1 });
        for (let i = 0; i < 6; i++) { const a = t * 3 + i * TAU / 6; drawStar(g, SW / 2 + Math.cos(a) * 70, SH + HINGE + 96 + Math.sin(a) * 40, 3 + Math.sin(t * 9 + i) * 1.5, '#ffffff'); }
        if (t > 1.1) mord(g, '¡SÚPER KEIKO!', SW / 2, 70, { u: 2.2, r: 2.4, rim: 2, sy: 3, fill: ['#ffffff', '#b3d9ff', '#63a0ef'] }, { anim: i => ({ s: Math.max(0, spring(t - 1.1 - i * .04, 2.4, 7)) }) });
      } },
    { dur: 0, song: HERO_SONGS.boss, lines: [['narr', '¡¡GLOOORGH!!'], ['anahi', '¡Algo sale de la alcantarilla de Viladomat! ¡Es… es una bola de barro con patas!'], ['keiko', '¡Nadie ensucia Westie BLVRD! ¡SÚPER KEIKO, AL RESCATE!'], ['anahi', '¡Se escapa por el Eixample! ¡Síguela, Keiko! ¡Y que no se nos escape ni un perro sin peinar!']],
      sfx: [[0, 'boom'], [.2, 'splash', { pitch: .5 }]],
      tall(g, t) { streetTall(g, 0, 1, t, { sunUp: 1 }); const gy = SH + HINGE; drawMudMonster(g, CUT.li >= 3 ? 128 + (t - (CUT.st.fleeT || (CUT.st.fleeT = t))) * 120 : 128, gy + 150 - clamp(t / 1.2, 0, 1) * 60, t); for (let i = 0; i < 5; i++) { const k = (t * .8 + i * .2) % 1; disc(g, 128 + (i - 2) * 30 * k, gy + 100 - Math.sin(k * Math.PI) * 60, 4, '#5b3a1d'); } if (CUT.li >= 2) drawSuperWestie(g, 200, 80 + Math.sin(t * 3) * 6, t, { flip: true }); } },
  ],
});
defCut('superwestie_out', {
  get song() { return { spb: 4, loop: true, tracks: SONG_TITLE.tracks }; }, // title.js loads later
  shots: [
    { dur: 0, boxY: 4, lines: [['maite', '¡NUBE! ¡Por fin! Se me escapó por una alcantarilla hace un mes…'], ['nube', '¡Guau, guau!'], ['anahi', 'Venía un pelín greñuda, pero ha quedado monísima.'], ['maite', '¡Está preciosa! Toma los diez euros… ¡y quédate con el cambio!'], ['anahi', '…ka-ching.']],
      top(g, t) { g.drawImage(prepTillRoom(), 0, 0); prepMaite(g, 70, 104, 'happy', t); drawS(g, prepDog('clean', .56, 'proud'), 30, 126, { ax: .5, ay: 1 }); prepLaptop(g, 150, 124, { amount: '10,00 €' }, t); for (let i = 0; i < 4; i++) drawStar(g, 30 + Math.cos(t * 2 + i * 1.6) * 24, 90 + Math.sin(t * 2 + i * 1.6) * 16, 2.5, '#fff27a'); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); const euro = CUT.li >= 4; drawAnahiFull(g, 128, 196, euro ? 'euro' : CUT.li >= 2 ? 'thumbs' : 'idle', t); if (euro) for (let i = 0; i < 8; i++) { const k = (t * .8 + i / 8) % 1; txt(g, '€', 20 + i * 30, k * 200 - 20, '#fff27a', { out: INK, bold: true }); } swKeikoSit(g, 212, 190, 'happy'); } },
    { dur: 0, lines: [['guru', '¡Ejem! ¿Alguien ha visto mi Peine de Oro?'], ['anahi', 'Todo tuyo, Gurú. Gracias por el préstamo.'], ['anahi', 'Para peinar con cuidado, calma y detalle… me bastan mis tijeras.']],
      top(g, t) { streetTall(TL, 0, 1, t, { sunUp: 1 }); g.drawImage(TALLC, 0, SH + HINGE, SW, SH, 0, 0, SW, SH); drawS(g, guruRat(fl(t * 2) % 2), 110, 150 - Math.min(40, t * 60)); if (CUT.li >= 1) goldComb(g, 140, 120, Math.sin(t * 3) * .2, true); },
      bot(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 128, 176, CUT.li >= 2 ? 'ready' : 'talk', t); } },
    { dur: 7.5, box: 'none', sfx: [[1.4, 'tick'], [2.4, 'tick'], [3.4, 'tick'], [4.2, 'shutter'], [4.3, 'sparkle'], [5.2, 'bark', { n: 3 }]],
      tall(g, t) { familyPhoto(g, t); } },
  ],
});
// the group photo on the mustard chair: everyone you met
function familyPhoto(g, t) {
  rect(g, 0, 0, SW, TALL_H, RAMP.green[2]);
  greenWall(g, 0, 0, SW, TALL_H - 60); woodFloor(g, 0, TALL_H - 60, SW, 60);
  drawS(g, wbSign({ noCrest: true }), SW / 2, 40);
  const ch = velvetChair(); g.save(); g.translate(SW / 2 - ch.width * 1.5, TALL_H - 60 - ch.height * 3 + 30); g.scale(3, 3); g.drawImage(ch, 0, 0); g.restore();
  const floor = TALL_H - 40;
  const cast = STORY_STAGES.filter(id => STAGES[id] && STAGES[id].portrait && id !== 'anahi');
  cast.forEach((id, i) => { const p = STAGES[id].portrait('photo', t); const x = 24 + i * (208 / Math.max(1, cast.length - 1)); drawS(g, p, x, floor - 20 - (i % 2) * 12, { ax: .5, ay: 1 }); });
  drawAnahiFull(g, SW / 2 + 60, floor, t > 4.2 ? 'thumbs' : 'headhand', t);
  drawS(g, heroPortrait(), SW / 2 - 20, floor - 70, { ax: .5, ay: 1 });
  drawS(g, prepDog('clean', 1, 'proud'), 40, floor + 6, { ax: .5, ay: 1 });
  // countdown, flash, polaroid
  if (t > 1.2 && t < 4.2) mord(g, String(3 - fl(t - 1.2)), SW / 2, 150, { u: 4, r: 4 }, { anim: () => ({ s: spring((t - 1.2) % 1, 2.5, 6) }) });
  if (t > 4.2) {
    const k = clamp((t - 4.2) / .25, 0, 1); if (k < 1) { g.globalAlpha = 1 - k; rect(g, 0, 0, SW, TALL_H, '#ffffff'); g.globalAlpha = 1; }
    if (t > 4.8) { const pk = spring(t - 4.8, 2, 6); g.save(); g.translate(SW / 2, SH + HINGE + 90); g.rotate(-.06); g.scale(pk, pk); panel(g, -80, -26, 160, 52, '#fffaf0', { r: 3 }); mord(g, 'FIN', 0, -22, { u: 2, r: 2.2 }); txt(g, 'Westie BLVRD · la familia al completo', 0, 12, INK, { align: 'c' }); g.restore(); }
  }
}

// ---------------------------------------------------------------- chibis ----
// debug bench (not reachable from the game): ?escena=cut&id=superwestie_art
defCut('superwestie_art', { shots: [{ dur: 0, box: 'none', lines: [['narr', '…']],
  top(g, t) { rect(g, 0, 0, SW, SH, '#8f7fb0'); drawS(g, heroPortrait(), 60, 186, { ax: .5, ay: 1 }); drawS(g, STAGES.superwestie.face(), 150, 60); drawS(g, STAGES.mezcla.face(), 200, 60); drawS(g, STAGES.unpelo.face(), 240, 60); prepKeikoCheer(g, 190, 190, t, 'happy'); },
  bot(g, t) { rect(g, 0, 0, SW, SH, '#bfe3f7'); for (let y = 0; y < SH; y += 12) for (let x = (y / 12 % 2) * 12; x < SW; x += 24) disc(g, x, y, 3, '#a9d6f0');
    ['superwestie', 'mezcla', 'unpelo'].forEach((id, r) => ['walk0', 'walk1', 'idle', 'happy', 'held'].forEach((f, i) => drawS(g, STAGES[id].chibi(f, t), 30 + i * 46, 40 + r * 56, { ax: .5, ay: 1, s: 1 })));
    drawS(g, prepDog('scruffy', .56), 30, 188, { ax: .5, ay: 1 }); drawS(g, prepDog('wet', .56), 90, 188, { ax: .5, ay: 1 }); drawS(g, prepDog('frizzy', .56), 150, 188, { ax: .5, ay: 1 }); drawS(g, prepDog('clean', .56), 210, 188, { ax: .5, ay: 1 }); } }] });
