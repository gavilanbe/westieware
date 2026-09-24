// ============================================================================
//  FINAL — SÚPER WESTIE · ¡TODO!  (Wario-Man homage)
//  Bule eats the whole "Pack de Chuches" and becomes Súper Westie. Every
//  microgame of every stage, faster and faster, then the Mud Monster.
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
  // domino mask over the eye + gold collar with a star tag
  const ex = x + dir * 28, ey = y - 15 + bob;
  rect(g, ex - 6, ey - 3, 12, 6, INK); rect(g, ex - 5, ey - 2, 10, 4, RAMP.green[2]); rect(g, ex - 2, ey - 1, 4, 2, '#ffffff'); px(g, ex + dir, ey, INK);
  rect(g, x + dir * 14 - 3, y - 12 + bob, 6, 2, RAMP.gold[3]); drawStar(g, x + dir * 15, y - 8 + bob, 2.5, RAMP.gold[4]);
}
function heroPortrait() {
  return mdl('heroPortrait2', () => {
    const c = mkCanvas(110, 116), g = c.g;
    // cape billowing to the right behind the sitting hero
    const pts = [[34, 58], [62, 56], [80, 66], [104, 84], [108, 100], [96, 110], [70, 112], [36, 112], [24, 96]];
    polyPx(g, pts.map(([x, y]) => [x + 1, y + 1]), INK); polyPx(g, pts.map(([x, y]) => [x - 1, y - 1]), INK); polyPx(g, pts, RAMP.green[2]);
    for (const [a, b] of [[[50, 60], [60, 110]], [[64, 62], [86, 108]], [[76, 70], [102, 100]]]) linePx(g, a[0], a[1], b[0], b[1], RAMP.green[1]);
    linePx(g, 36, 112, 96, 110, RAMP.gold[3]); linePx(g, 96, 110, 108, 100, RAMP.gold[3]);
    drawWestieSit(g, 48, 114, 'happy');
    // domino mask across both eyes (head drawn at 16,31 by drawWestieSit)
    rect(g, 34, 56, 32, 8, INK); rect(g, 35, 57, 30, 6, RAMP.green[2]); rect(g, 35, 57, 30, 1, RAMP.green[3]);
    for (const ex of [38, 55]) { rect(g, ex, 58, 5, 4, '#ffffff'); rect(g, ex + 1, 59, 2, 2, INK); }
    // collar + gold W medal
    rect(g, 34, 84, 28, 3, RAMP.gold[2]); disc(g, 48, 90, 6, INK); disc(g, 48, 90, 5, RAMP.gold[3]); tiny(g, 'W', 48, 88, RAMP.green[1], { align: 'c' });
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
// Nube: the giant sheepdog under all that mud
function nubeModel() {
  return mdl('nube', () => {
    const F = RAMP.fur, G2 = RAMP.grey;
    const bodyS = SD.smooth(8, SD.ellipse(60, 58, 42, 34), SD.ellipse(60, 82, 50, 18));
    const body = SD.shag(SD.tufts(bodyS, 60, 50, 3.5, 22, 1, 1.5), 1.8, .18, 5);
    const back = SD.ellipse(60, 80, 48, 20);
    return model(120, 104, [{ f: back, ramp: G2, z: 0, th: 12, tex: clumpTex(6, .3, 3, 1.3) }, { f: body, fs: bodyS, ramp: F, z: 1, th: 30, tex: clumpTex(6, .32, 9, 1.4) }], { post: g => {
      // fringe over the eyes, a big black nose, a smile
      for (let i = 0; i < 26; i++) linePx(g, 38 + i * 1.7, 30 + (i % 3), 38 + i * 1.7 + 1, 44 + (i % 4), F[1 + (i % 2)]);
      ellipsePx(g, 60, 54, 7, 5, INK); px(g, 58, 52, '#6e6390');
      hline(g, 52, 68, 64, INK); px(g, 51, 63, INK); px(g, 69, 63, INK); rect(g, 57, 65, 7, 5, RAMP.pink[2]);
    } });
  });
}

defStage({
  id: 'superwestie', name: 'SÚPER WESTIE', sub: '«¡Por un Eixample sin barro!»', verb: '¡TODO!', mech: 'mix', bpm: 126,
  games: () => allStoryGames(), boss: 'barro', bossAt: 20, speedAt: [5, 10, 15],
  unlockBy: ['anahi', 'rizos', 'pompon', 'hermanas', 'ceniza', 'bigotes'],
  portrait: () => heroPortrait(),
  face: () => mdl('heroFace', () => { const c = mkCanvas(64, 60); c.g.drawImage(buleHead('wink'), 0, 0); rect(c.g, 18, 26, 28, 5, RAMP.green[2]); rect(c.g, 18, 26, 28, 1, INK); rect(c.g, 18, 30, 28, 1, INK); for (const ex of [22, 39]) { rect(c.g, ex, 27, 4, 3, '#fff'); px(c.g, ex + 1, 28, INK); } return faceCrop(c, 12, 4, 40, 40); }),
  rim: '#ffdf4f', cardCols: ['#141848', '#231f5e'], nameFill: ['#ffffff', '#b3d9ff', '#63a0ef'], tip: 'Todos los microjuegos… ¡y el jefe final!',
  songs: HERO_SONGS, intro: 'superwestie_in', outro: 'superwestie_out', creditsOnClear: true,
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 },
    mini: (g, x, y, st) => drawSuperWestie(g, 44, SH - 22, NOW, { mood: st === 'lose' ? 'sad' : 'happy' }),
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
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 }, portal: { x: 64, y: 22, w: 128, h: 96 }, staticCols: ['#3d2066', '#5a3396'], playCols: ['#3d2066', '#5a3396'], cardCol: RAMP.purple },
});
defStage({
  id: 'unpelo', name: 'A UN PELO', sub: '«Una vida. Nivel 2. Sin piedad»', verb: '¡TODO!', mech: 'mix', bpm: 128, endless: true, lives: 1, startLevel: 2, noSpeed: true,
  games: () => allStoryGames(), boss: null, unlockBy: 'superwestie',
  portrait: () => heroPortrait(), face: () => modeIcon('hair'), rim: '#ff5d5d', cardCols: ['#5a0f1e', '#7c1830'], tip: 'Un fallo y se acabó',
  songs: HERO_SONGS,
  room: { top: heroRoomTop, bot: heroRoomBot, frame: 'hero', life: heroLife, lifeY: 150, lifeSpacing: 34, counter: { x: SW / 2, y: 6 }, portal: { x: 64, y: 22, w: 128, h: 96 }, staticCols: ['#5a0f1e', '#7c1830'], playCols: ['#5a0f1e', '#7c1830'], cardCol: RAMP.red },
});

// ---------------------------------------------------------------- story -----
WHO.nube = { name: 'Nube', col: '#8587ab', voice: 'guru' };
defCut('superwestie_in', {
  song: { spb: 4, loop: true, tracks: HERO_SONGS.play.tracks },
  shots: [
    { dur: 0, lines: [['narr', 'Esa tarde, en el mostrador de Westie BLVRD…'], ['bule', '¿Un Pack de Chuches? ¿Naturales? ¿Para mí?'], ['bule', '*ñam* *ñam* *ÑAM* *ÑAM*']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 200, 170, 'idle', t); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); const eating = CUT.li >= 2; drawWestieSit(g, 128, 188, eating ? 'happy' : 'wow', { tilt: eating ? Math.sin(t * 20) * .3 : 0 });
        // the kraft treat bag with the round WB label
        const bx = 70, by = 150; rect(g, bx - 14, by - 30, 28, 34, INK); rect(g, bx - 13, by - 29, 26, 32, '#c9a26b'); disc(g, bx, by - 14, 8, '#fffaf0'); ringPx(g, bx, by - 14, 8, RAMP.green[2]); tiny(g, 'WB', bx, by - 16, RAMP.green[2], { align: 'c' });
        if (eating) for (let i = 0; i < 3; i++) { const k = (t * 3 + i * .33) % 1; disc(g, bx + 20 + k * 30, by - 20 - Math.sin(k * Math.PI) * 30, 3, '#d58c4c'); } } },
    { dur: 3.2, box: 'none', sfx: [[.1, 'boom'], [.3, 'sparkle'], [1.2, 'slam']],
      tall(g, t) {
        rect(g, 0, 0, SW, TALL_H, '#ffffff');
        const k = clamp(t / 1, 0, 1);
        for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t; polyPx(g, [[SW / 2, TALL_H / 2], [SW / 2 + Math.cos(a) * 400, TALL_H / 2 + Math.sin(a) * 400], [SW / 2 + Math.cos(a + .13) * 400, TALL_H / 2 + Math.sin(a + .13) * 400]], i % 2 ? '#ffdf4f' : '#ff9f4f'); }
        drawSuperWestie(g, SW / 2, TALL_H / 2 + 10, t, { lift: 1 });
        if (t > 1.1) mord(g, '¡SÚPER WESTIE!', SW / 2, 40, { u: 2, r: 2.2, rim: 2, sy: 3, fill: ['#ffffff', '#b3d9ff', '#63a0ef'] }, { anim: i => ({ s: Math.max(0, spring(t - 1.1 - i * .04, 2.4, 7)) }) });
        void k;
      } },
    { dur: 0, song: HERO_SONGS.boss, lines: [['narr', '¡¡GLOOORGH!!'], ['anahi', '¡Algo sale de la alcantarilla de Viladomat! ¡Y viene directo al escaparate!'], ['bule', '¡Nadie ensucia Westie BLVRD! ¡SÚPER WESTIE, AL RESCATE!']],
      sfx: [[0, 'boom'], [.2, 'splash', { pitch: .5 }]],
      tall(g, t) { streetTall(g, 0, 1, t, { sunUp: 1 }); const gy = SH + HINGE; drawMudMonster(g, 128, gy + 150 - clamp(t / 1.2, 0, 1) * 60, t); for (let i = 0; i < 5; i++) { const k = (t * .8 + i * .2) % 1; disc(g, 128 + (i - 2) * 30 * k, gy + 100 - Math.sin(k * Math.PI) * 60, 4, '#5b3a1d'); } if (CUT.li >= 2) drawSuperWestie(g, 200, 80 + Math.sin(t * 3) * 6, t, { flip: true }); } },
  ],
});
defCut('superwestie_out', {
  get song() { return { spb: 4, loop: true, tracks: SONG_TITLE.tracks }; }, // title.js loads later
  shots: [
    { dur: 0, lines: [['nube', '¿…Guau?'], ['anahi', '¡Pero si debajo del barro había un perrete! ¡Un pastor gigante!'], ['anahi', 'Se habría caído a la alcantarilla, pobrecito. ¿Cómo te llamas?'], ['nube', '¡Nube! ¡Guau!']],
      tall(g, t) { streetTall(g, 0, 1, t, { sunUp: 1 }); const gy = SH + HINGE; g.drawImage(nubeModel(), 68, gy + 40); for (let i = 0; i < 6; i++) drawStar(g, 70 + i * 22, gy + 40 + Math.sin(t * 4 + i) * 6, 2.5, '#fff27a'); drawAnahiFull(g, 210, gy + 128, 'win', t); } },
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
  drawAnahiFull(g, SW / 2 + 60, floor, t > 4.2 ? 'win' : 'ready', t);
  drawS(g, heroPortrait(), SW / 2 - 20, floor - 70, { ax: .5, ay: 1 });
  g.drawImage(nubeModel(), 2, floor - 110);
  // countdown, flash, polaroid
  if (t > 1.2 && t < 4.2) mord(g, String(3 - fl(t - 1.2)), SW / 2, 150, { u: 4, r: 4 }, { anim: () => ({ s: spring((t - 1.2) % 1, 2.5, 6) }) });
  if (t > 4.2) {
    const k = clamp((t - 4.2) / .25, 0, 1); if (k < 1) { g.globalAlpha = 1 - k; rect(g, 0, 0, SW, TALL_H, '#ffffff'); g.globalAlpha = 1; }
    if (t > 4.8) { const pk = spring(t - 4.8, 2, 6); g.save(); g.translate(SW / 2, SH + HINGE + 90); g.rotate(-.06); g.scale(pk, pk); panel(g, -80, -26, 160, 52, '#fffaf0', { r: 3 }); mord(g, 'FIN', 0, -22, { u: 2, r: 2.2 }); txt(g, 'Westie BLVRD · la familia al completo', 0, 12, INK, { align: 'c' }); g.restore(); }
  }
}
