// ============================================================================
//  Stage 1 — ANAHÍ · ¡TOCA!  "Cuidado, calma y detalle"
// ============================================================================
'use strict';

const ANAHI_SONGS = {
  card: { spb: 4, tracks: [
    { i: 'vib', v: .7, n: 'C5 . E5 . G5 . A5 . G5 . E5 . C6! - - -' },
    { i: 'bass', v: .8, n: 'C3 . . . A2 . . . F2 . G2 . C3 - - -' },
    { i: 'd', v: .7, n: 'k . h . s . h h k . h . s+x - - -' }] },
  ready: { spb: 4, tracks: [{ i: 'vib', v: .7, n: 'G5 . E5 . G5 . C6 .' }, { i: 'bass', v: .8, n: 'C3 . . . G2 . . .' }, { i: 'd', v: .7, n: 'k . h . s . h h' }] },
  win: { spb: 4, tracks: [{ i: 'p25', v: .7, n: 'C5 E5 G5 C6 E6! - C6 .' }, { i: 'vib', v: .5, n: 'E5+G5 . . . G5+C6 - . .' }, { i: 'bass', v: .85, n: 'C3 . G2 . C3 . . .' }, { i: 'd', v: .8, n: 'k . s . k k s .' }] },
  lose: { spb: 4, tracks: [{ i: 'p50', v: .7, n: 'Eb5 - D5 - Db5 - C5 -' }, { i: 'bass', v: .85, n: 'F2 . E2 . Eb2 . D2 .' }, { i: 'd', v: .7, n: 'k . . . k . . .' }] },
  next: { spb: 4, tracks: [{ i: 'p25', v: .6, n: 'G4 . A4 . B4 . D5 .' }, { i: 'bass', v: .85, n: 'G2 . . . G2 . G2 .' }, { i: 'd', v: .8, n: 'k . h . s . s s' }] },
  play: { spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'E5 . G5 . A5 . G5 . E5 . D5 . C5 - . . E5 . G5 . A5 . C6 . A5 . G5 . E5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . E3 . G3 . A3 . F3 . A3 . C4 . A3 . C3 . E3 . G3 . A3 . G3 . F3 . E3 . D3 .' },
    { i: 'd', v: .7, n: 'k . h h s . h h k . h h s . h s k . h h s . h h k . h h s s s s' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .55, n: 'G4 - F4 Eb4 . C4 . . Eb4 F4 G4 - Bb4 - G4 . C5 - Bb4 G4 . F4 . . Eb4 F4 G4 - F4 - Eb4 .' },
    { i: 'bass', v: .9, n: 'C3 . C3 Eb3 . C3 F3 . G3 . Bb2 . C3 . . . Ab2 . Ab2 C3 . Ab2 Bb2 . G2 . G2 B2 . D3 G2 .' },
    { i: 'p12', v: .35, n: 'C6 . Eb6 . C6 . Eb6 . C6 . Eb6 . G6 . Eb6 . Ab5 . C6 . Ab5 . C6 . B5 . D6 . G6 . D6 .' },
    { i: 'd', v: .85, n: 'k . h s . k s h k . h s k s s s k . h s . k s h k . h s k s s+x s' }] },
  // the three announcements, each 4 beats long, played at the new tempo
  jingles: {
    // her vibraphone motif in fast-forward, bass pumping, a snare roll into the crash
    speed: { spb: 4, tracks: [
      { i: 'vib', v: .75, n: 'C5 E5 G5 C6 D5 F5 A5 D6 E5 G5 B5 E6 G6! - - .' },
      { i: 'p25', v: .42, n: 'C4 . E4 . G4 . C5 . D5 . F#5 . G5! - - .' },
      { i: 'bass', v: .85, n: 'C3 C3 G2 G2 C3 C3 G2 G2 C3 C3 D3 D3 E3! - - .' },
      { i: 'd', v: .85, n: 'k h s h k h s h k s s s k+x - . .' }] },
    // the shop's door bell (ding-dong), then brass and toms: Lady Di has arrived
    boss: { spb: 4, tracks: [
      { i: 'bell', v: .75, n: 'E6 - C6 - . . . . . . . . . . . .' },
      { i: 'brass', v: .7, n: '. . . . C4 - - . Eb4 - - . F#4! - - -' },
      { i: 'vib', v: .45, n: '. . . . G5 . G5 . Bb5 . Bb5 . C6! - - -' },
      { i: 'bass', v: .9, n: '. . . . C2 . C2 . C2 . C2 . F#2! - - -' },
      { i: 'd', v: .9, n: '. . . . T . . T T . T T T T k+x .' }] },
    // rolling up her sleeves: a slow climb that lands on a bright chord
    level: { spb: 4, tracks: [
      { i: 'vib', v: .75, n: 'G4 . C5 . E5 . G5 . C6 . E6 . G6+C7! - - -' },
      { i: 'bell', v: .5, n: '. . . . . . . . . . . . C7 - E7 -' },
      { i: 'bass', v: .85, n: 'C3 . . . E3 . . . G3 . . . C4! - - -' },
      { i: 'd', v: .8, n: 'k . . . k . . . k . s s k+x - . .' }] },
  },
};

// the hanging oval plate that holds the counter
function counterPlate(g, x, y) {
  vline(g, x - 16, 0, y - 6, RAMP.gold[1]); vline(g, x + 16, 0, y - 6, RAMP.gold[1]);
  for (let i = 1; i < y - 6; i += 3) { px(g, x - 16, i, RAMP.gold[3]); px(g, x + 16, i, RAMP.gold[3]); }
  ellipsePx(g, x, y + 8, 27, 13, INK); ellipsePx(g, x, y + 8, 26, 12, RAMP.gold[2]); ellipsePx(g, x, y + 8, 24, 10, RAMP.green[1]); ellipsePx(g, x - 1, y + 7, 22, 8, RAMP.green[2]);
  for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; px(g, x + Math.cos(a) * 25, y + 8 + Math.sin(a) * 11.5, RAMP.gold[4]); }
}
const ANA_REACT = { ready: 'ready', win: 'win', lose: 'lose', clear: 'clear', over: 'over' };
// the salon: Anahí behind the grooming table, Keiko on top of it, the counter
// hanging from the ceiling in its gilt oval
function anahiRoomTop(g, S) {
  anahiPrewarm();
  g.drawImage(salonBackdrop(), 0, 0);
  wallClock(g, 168, 38, 600 + NOW * 30);
  counterPlate(g, SW / 2, 8);
  const beat = S.pb || 0, rt = S.reactT || 0;
  let pose = rt < 1.2 ? (ANA_REACT[S.react] || 'idle') : 'idle';
  if (S.phase === 'inter' && S.special === 'speed' && S.pb >= 2) pose = 'speed';
  if (S.phase === 'inter' && S.special === 'boss' && S.pb >= 2) pose = 'boss';
  if (S.react === 'clear' || S.react === 'over') pose = ANA_REACT[S.react];
  const jump = (pose === 'win' || pose === 'clear') ? Math.max(0, Math.sin(Math.min(1, rt / .45) * Math.PI)) * 10 + (pose === 'clear' ? Math.abs(Math.sin(rt * 6)) * 6 : 0) : 0;
  const bob = Math.round(Math.abs(Math.sin(beat * Math.PI)) * -1.4);
  drawAnahiFull(g, 192, 170, pose, S.pt || 0, { jump, bob, snip: pose === 'speed' });
  groomTable(g, 132, 124, 72);
  const mood = pose === 'win' || pose === 'clear' ? 'happy' : pose === 'lose' || pose === 'over' ? 'sad' : pose === 'boss' ? 'wow' : 'normal';
  const dogBounce = mood === 'happy' ? Math.abs(Math.sin(rt * 9)) * 3 : 0;
  drawS(g, keikoSide(.62, mood === 'happy' ? 'wag' : mood === 'sad' ? 'wet' : 'stand', mood), 126, 122 - dogBounce, { ax: .5, ay: 1 });
  shadowOval(g, 132, 170, 30, 3, .5);
  // reaction garnish: a shower of stars for a win, a puff for a miss
  if (S.topFx && S.phase === 'inter') {
    if (S.react === 'win' && rt < .05 && S._burst !== S.count) { S._burst = S.count; S.topFx.burst(188, 84, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 60, sp1: 150, g: 120, life0: .4, life1: .8 }); S.topFx.burst(126, 100, 8, { k: 'heart', c: '#ff5d9e', sp0: 30, sp1: 70, g: -20, life0: .6, life1: 1 }); }
    if (S.react === 'lose' && rt < .05 && S._burst !== -S.count) { S._burst = -S.count; S.topFx.burst(126, 104, 10, { k: 'puff', c: ['#9896a4', '#b3b8d4'], sp0: 20, sp1: 60, r: 4, life0: .4, life1: .7 }); }
  }
  if (pose === 'lose' || pose === 'over') { const k = Math.min(1, rt * 3); drawRainCloud(g, 190, 30 + (1 - k) * -30, rt); }
  if (pose === 'speed') { for (let i = 0; i < 6; i++) { const yy = 70 + i * 12, xx = (i * 53 + fl((S.pt || 0) * 300)) % 90; rect(g, 216 + xx * .3, yy, 16, 1, '#ffffff'); } }
}
function drawRainCloud(g, x, y, t) {
  for (const [dx, dy, r] of [[-8, 2, 6], [0, -2, 8], [9, 2, 6]]) disc(g, x + dx, y + dy, r + 1, INK);
  for (const [dx, dy, r] of [[-8, 2, 6], [0, -2, 8], [9, 2, 6]]) disc(g, x + dx, y + dy, r, '#8587ab');
  disc(g, x - 2, y - 4, 4, '#b3b8d4');
  for (let i = 0; i < 4; i++) { const yy = y + 8 + ((t * 60 + i * 9) % 22); vline(g, x - 9 + i * 6, yy, yy + 2, '#63a0ef'); }
}
function anahiRoomBot(g, S) {
  g.drawImage(salonBotBackdrop(), 0, 0);
}
// a life: Keiko's little head on the cabinet under the mirror; a lost one runs off
function anahiLife(g, x, y, st, bt) {
  if (st === 'gone') { g.globalAlpha = .45; drawS(g, lifeKeiko(true), x, y, { alpha: .25 }); g.globalAlpha = 1; ringPx(g, x, y + 2, 9, 'rgba(29,20,36,.25)'); return; }
  if (st === 'break') { const k = clamp(bt / 1.1, 0, 1); drawS(g, lifeKeiko(true), x + E.inQ(k) * 90 * (x > SW / 2 ? 1 : -1), y - Math.sin(k * Math.PI) * 18, { flip: x < SW / 2 }); if (bt < .5) txt(g, '¡Aaay!', x, y - 22 - bt * 10, '#ffffff', { align: 'c', out: INK }); return; }
  drawS(g, lifeKeiko(false), x, y);
}
function anahiMini(g, x, y, st, S) {
  drawAnahiFull(g, 34, SH + 84 - (st === 'win' ? 5 : 0), st === 'win' ? 'thumbs' : st === 'lose' ? 'sad' : 'idle', S.pt, { k: .6 });
}

// ---------------------------------------------------------------- announcements
// Anahí's own ¡MÁS RÁPIDO! / ¡JUEGO DEL JEFE! / ¡MÁS DIFÍCIL! (room.special):
// the salon in fast-forward, Lady Di's red-carpet arrival four minutes before
// the 12:00 show, and Anahí getting serious. Her gold Roman capitals (the face
// of her title card) on green-and-gold plaques; never the generic overlay.
const ANAHI_SAY_MAX = { speed: 214, boss: 226, level: 214 };
const ANAHI_SAY = { speed: '¡MÁS RÁPIDO!', boss: '¡JUEGO DEL JEFE!', level: '¡MÁS DIFÍCIL!' };
function anahiSayFace(kind) { return cardFit(ANAHI_SAY[kind], ANAHI_SAY_MAX[kind], CARD_ANAHI_FACE); }
// warm the heavy pictures once and rasterise the lettering a glyph per frame, during ordinary interludes
function anahiPrewarm() {
  if (typeof cardFit !== 'function') return;
  if (!anahiPrewarm.done) {
    anahiPrewarm.done = true;
    for (const f of [() => anahiSprite('speed', .6), () => anahiSprite('boss', .6, 'gasp'), () => anahiSprite('pro', .62, 'focus'),
      () => keikoSide(.46, 'stand', 'wow'), () => keikoSide(.5, 'wag', 'happy'), () => keikoSide(.5, 'stand', 'normal'), () => cardSalonBg(),
      () => { if (typeof prepDog === 'function') prepDog('scruffy', .56, 'grumpy'); }]) warm(f);
  }
  cardPrewarm(Object.keys(ANAHI_SAY).map(k => [ANAHI_SAY[k], anahiSayFace(k)]));
}
// the plaque: gilt frame, green (or red velvet) field, rivets, a gold rule
function anahiPlaque(g, cx, y, w, h, red) {
  const Au = RAMP.gold, F = red ? ['#3d0610', '#6b0f1e', '#8e1a2c', '#b3263c'] : RAMP.green;
  const x = rd(cx - w / 2);
  panel(g, x, y, w, h, Au[2], { r: 6, line: INK }); panel(g, x + 3, y + 3, w - 6, h - 6, F[2], { r: 4, line: Au[1] });
  rect(g, x + 6, y + 5, w - 12, 2, F[3]); hline(g, x + 8, x + w - 9, y + h - 6, F[1]);
  for (const [px0, py0] of [[x + 7, y + 7], [x + w - 8, y + 7], [x + 7, y + h - 8], [x + w - 8, y + h - 8]]) { disc(g, px0, py0, 1.5, INK); px(g, px0, py0, Au[4]); }
}
// a big wall clock with a gilt rim (minutes as the clock's time, sec 0–60 for the red hand)
function anahiBigClock(g, x, y, r, minutes, sec, glow) {
  const Au = RAMP.gold;
  if (glow) { g.globalAlpha = .25 + .2 * glow; disc(g, x, y, r + 7, '#ff5d5d'); g.globalAlpha = 1; }
  disc(g, x, y, r + 3, INK); disc(g, x, y, r + 2, Au[2]); disc(g, x - 1, y - 1, r + 1, Au[3]); disc(g, x, y, r, INK); disc(g, x, y, r - 1, '#fffaf0'); disc(g, x - 2, y - 2, r - 5, '#ffffff');
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, rr = r - 3; if (i % 3 === 0) rect(g, rd(x + Math.cos(a) * rr) - 1, rd(y + Math.sin(a) * rr) - 1, 2, 2, INK); else px(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, INK); }
  const h = minutes / 60 * TAU / 12 - Math.PI / 2, m = minutes / 60 * TAU - Math.PI / 2;
  thickLine(g, x, y, x + Math.cos(h) * r * .5, y + Math.sin(h) * r * .5, 1.1, INK); thickLine(g, x, y, x + Math.cos(m) * r * .8, y + Math.sin(m) * r * .8, .7, INK);
  if (sec != null) { const a = sec / 60 * TAU - Math.PI / 2; linePx(g, x, y, x + Math.cos(a) * r * .85, y + Math.sin(a) * r * .85, '#e23b4e'); }
  disc(g, x, y, 1.6, '#e23b4e');
}
// a tuft of white fur
function anahiTuft(g, x, y, r) { disc(g, x, y, r + 1, '#9896a4'); disc(g, x, y, r, '#ffffff'); disc(g, x + r * .6, y + r * .3, r * .7, '#ffffff'); px(g, x - r * .4, y - r * .4, '#f6f1ee'); }
// the words on their plaque, entrance by kind
function anahiSay(g, kind, cx, y, t, beat) {
  const st = anahiSayFace(kind), word = ANAHI_SAY[kind];
  const anim = kind === 'speed' ? (i => { const a = cardAnimSlide(t - .1, i, { stagger: .025, from: 70, rot: -.2 }); if (a.s !== 0 && beat < .14) a.dy = -1; return a; })
    : kind === 'boss' ? (i => cardAnimDrop(t - .22, i, { stagger: .03, h: -30 }))
      : (i => cardAnimSlam(t - .2, i, { stagger: .05, from: 2.4 }));
  cardWord(g, word, cx, y, st, { anim });
}

// ¡MÁS RÁPIDO!: the salon in fast-forward
function anahiSpeedScene(g, S, t) {
  const b = t * (S.bpm || 118) / 60, beat = b % 1, sh = beat < .1 ? (fl(t * 60) % 2 ? 1 : -1) : 0;
  g.drawImage(salonBackdrop(), sh, 0);
  // the tape rolls: pale bars climbing up the screen, like a VCR in fast-forward
  for (let i = 0; i < 3; i++) { const y = SH - ((t * 240 + i * 74) % (SH + 24)); g.globalAlpha = .16; rect(g, 0, y, SW, 3, '#ffffff'); g.globalAlpha = .08; rect(g, 0, y + 3, SW, 6, '#ffffff'); g.globalAlpha = 1; }
  // the big clock whirring on the green wall
  anahiBigClock(g, 30, 100, 16, 600 + t * 170, (t * 900) % 60);
  // Keiko on the table, fur blowing off her in tufts
  groomTable(g, 132, 124, 72);
  drawS(g, keikoSide(.62, 'wag', 'happy'), 126 + (fl(t * 24) % 2), 122, { ax: .5, ay: 1 });
  for (let i = 0; i < 11; i++) { const p = (t * 1.5 + i * .137) % 1, x = 116 - p * 118 - (i % 3) * 7, y = 94 + (i % 4) * 5 - Math.sin(p * Math.PI) * 26; anahiTuft(g, x, y, Math.max(1, 3 - p * 2)); }
  // Anahí at double speed: two ghosts trail her, the scissors never stop
  drawS(g, anahiSprite('speed', .6), 192 + 14, 170, { ax: .5, ay: 1, alpha: .2 });
  drawS(g, anahiSprite('speed', .6), 192 + 7, 170, { ax: .5, ay: 1, alpha: .35 });
  drawAnahiFull(g, 192 + sh, 170, 'speed', S.pt || t, { snip: true });
  if (fl(t * 12) % 2 === 0) { const a = t * 20; drawStar(g, 172 + Math.cos(a) * 3, 104 + Math.sin(a) * 3, 2.5, '#ffffff'); }
  // speed lines racing right to left
  for (let i = 0; i < 14; i++) { const y = 58 + (i * 23) % 92, x = SW - ((t * 520 + i * 97) % (SW + 80)); rect(g, x, y, 22 + (i % 3) * 12, 1, 'rgba(255,255,255,.85)'); }
  // ▶▶ and the new tempo in the corner, blinking like a VCR display
  if (fl(t * 4) % 2 === 0) { for (const dx of [0, 7]) polyPx(g, [[8 + dx, 170], [15 + dx, 175], [8 + dx, 180]], '#ffffff'); txt(g, 'x' + (1 + .13 * (S.speed || 1)).toFixed(1), 25, 172, '#ffffff', { out: INK }); }
  // the plaque slides in from the left and jolts on every beat
  const pk = E.outBack(clamp(t / .3, 0, 1));
  g.save(); g.translate(rd(lerp(-270, 0, pk)), beat < .1 ? 1 : 0);
  anahiPlaque(g, 128, 6, 242, 46);
  anahiSay(g, 'speed', 128, 17, t, beat);
  g.restore();
}
// ¡JUEGO DEL JEFE!: Lady Di's grand arrival, four minutes before the show
function anahiBossScene(g, S, t) {
  const b = t * (S.bpm || 118) / 60, beat = b % 1, Au = RAMP.gold;
  g.drawImage(salonBackdrop(), 0, 0);
  // the lights go down…
  g.globalAlpha = Math.min(.66, t * 2.2); rect(g, 0, 0, SW, SH, '#0b0612'); g.globalAlpha = 1;
  // …a red carpet rolls out from the door…
  const ck = E.outC(clamp((t - .1) / .55, 0, 1)), cx0 = rd(lerp(SW + 8, 92, ck));
  if (ck > 0) {
    rect(g, cx0, 165, SW - cx0, 15, INK); rect(g, cx0, 166, SW - cx0, 13, '#9e1b2d'); rect(g, cx0, 167, SW - cx0, 2, '#c93a4c'); hline(g, cx0, SW, 166, Au[3]); hline(g, cx0, SW, 178, Au[2]);
    if (ck < 1) { ellipsePx(g, cx0, 172, 5, 8, INK); ellipsePx(g, cx0, 172, 4, 7, '#c93a4c'); ellipsePx(g, cx0, 172, 1.5, 3, '#6b0f1e'); }
  }
  // …and a spotlight picks her out
  const sk = clamp((t - .35) / .2, 0, 1);
  if (sk > 0) { g.globalAlpha = .2 * sk; polyPx(g, [[160, 50], [184, 50], [220, 178], [124, 178]], '#fff7ae'); g.globalAlpha = .32 * sk; ellipsePx(g, 172, 176, 48, 6, '#fff7ae'); g.globalAlpha = 1; }
  // the clock: 11:59, the red hand creeping towards twelve
  const pulse = beat < .2 ? 1 : 0;
  anahiBigClock(g, 222, 76, 15, 11 * 60 + 59, 48 + Math.min(11.5, t * 4), pulse);
  panel(g, 204, 96, 36, 12, INK, { r: 2, line: '#44424f' }); txt(g, fl(t * 2) % 2 ? '11 59' : '11:59', 222, 99, '#ff5d5d', { align: 'c' });
  // the door bell rings
  const bw = t < 1.2 ? Math.sin(t * 30) * .5 * (1 - t / 1.2) : 0;
  g.save(); g.translate(198, 62); g.rotate(bw); vline(g, 0, -6, -2, INK); polyPx(g, [[-5, 6], [-4, -1], [0, -3], [4, -1], [5, 6]], INK); polyPx(g, [[-4, 5], [-3, 0], [0, -2], [3, 0], [4, 5]], Au[3]); px(g, -1, 1, Au[4]); disc(g, 0, 7, 1.5, Au[2]); g.restore();
  if (t < 1.1) { const k = spring(t, 3, 8); g.save(); g.translate(150, 66); g.scale(k, k); panel(g, -37, -8, 74, 15, '#ffffff', { r: 4 }); polyPx(g, [[32, -2], [44, -5], [36, 3]], '#ffffff'); txt(g, '¡DING DONG!', 0, -4, INK, { align: 'c', bold: true }); g.restore(); }
  // Lady Di struts in along the carpet: a champion, and an absolute mess
  const lk = clamp((t - .45) / .85, 0, 1), lx = lerp(296, 176, E.outC(lk)), strut = lk < 1 ? Math.abs(Math.sin(t * 10)) * 2 : Math.abs(Math.sin(t * 3)) * .6;
  if (typeof prepDog === 'function') {
    drawS(g, prepDog('scruffy', .56, 'grumpy'), lx, 175 - strut, { ax: .5, ay: 1 });
    if (typeof prepLadyBow === 'function') { g.save(); g.translate(rd(lx + 6), rd(175 - strut - 51)); g.rotate(.45); prepLadyBow(g, 0, 0, .7); g.restore(); }
    if (lk >= 1) for (let i = 0; i < 4; i++) { const a = t * 2 + i * TAU / 4; drawStar(g, lx + Math.cos(a) * 34, 142 + Math.sin(a) * 14, 1.5 + (i % 2), '#fff7ae'); }
  }
  // Anahí gasps; Keiko peeks out from behind her
  drawS(g, keikoSide(.46, 'stand', 'wow'), 92, 178, { ax: .5, ay: 1 });
  drawAnahiFull(g, 50, 180, 'boss', S.pt || t, { ex: 'gasp' });
  if (t > .5 && t < 1.8) { const k = spring(t - .5, 3, 8); g.save(); g.translate(78, 56); g.scale(k, k); txt(g, '¡¿LADY DI?!', 0, 0, '#fff4dc', { align: 'c', out: INK, bold: true }); g.restore(); }
  // the plaque: red velvet in a gilt frame, dropping on its chains
  const pk = clamp(t / .35, 0, 1), drop = (1 - E.outBack(pk)) * -70, sw = Math.sin(t * 7) * .05 * Math.exp(-t * 1.8);
  g.save(); g.translate(128, drop); g.rotate(sw);
  if (typeof cardChain === 'function') { cardChain(g, -90, -6, -100, 8); cardChain(g, 90, -6, 100, 8); }
  anahiPlaque(g, 0, 4, 246, 44, true);
  anahiSay(g, 'boss', 0, 15, t, beat);
  g.restore();
}
// her eyes, close up, drawn big and crisp for the cut-in (no giant sprite to render)
function anahiEyeBand(g, t) {
  const C2 = ANA_C, cy = 82;
  // long hair framing the face, the face, the swept fringe
  rect(g, 0, 62, SW, 40, C2.hair[1]);
  for (let x = 2; x < SW; x += 7) vline(g, x, 62, 102, (x * 7) % 3 ? C2.hair[2] : C2.hair[0]);
  polyPx(g, [[70, 102], [66, 76], [80, 62], [176, 62], [190, 76], [186, 102]], C2.skin[1]);
  for (let y = 64; y < 102; y += 2) hline(g, 72, 184, y, C2.skin[1]);
  polyPx(g, [[64, 62], [192, 62], [192, 70], [176, 68], [166, 73], [150, 67], [136, 72], [118, 66], [100, 71], [86, 66], [64, 74]], C2.hair[1]);
  for (let i = 0; i < 9; i++) linePx(g, 70 + i * 14, 62, 76 + i * 14, 69 - (i % 2) * 2, C2.hair[2]);
  // determined brows, sloping in
  thickLine(g, 84, 74, 110, 80, 1.4, C2.brow); thickLine(g, 146, 80, 172, 74, 1.4, C2.brow);
  // the eyes: dark, lashes, two glints each
  for (const ex0 of [90, 154]) {
    rect(g, ex0 - 1, 83, 16, 2, C2.eye); panel(g, ex0, 84, 12, 14, C2.eye, { r: 3, line: C2.eye });
    rect(g, ex0 + 2, 86, 4, 4, '#ffffff'); rect(g, ex0 + 8, 93, 2, 2, '#ffffff'); rect(g, ex0 + 1, 96, 10, 1, '#3a3446');
  }
  // blush and the nose
  ellipsePx(g, 82, 100, 7, 2.5, C2.blush); ellipsePx(g, 174, 100, 7, 2.5, C2.blush); px(g, 129, 99, C2.skin[0]); px(g, 128, 100, C2.skin[0]);
  // a gold glint runs across her right eye
  const gk = (t * 2.2) % 1; if (gk < .35) drawStar(g, 166, 88, 4 * Math.sin(gk / .35 * Math.PI), '#fffbe0', t * 4);
}
// ¡MÁS DIFÍCIL!: Anahí gets serious
function anahiLevelScene(g, S, t) {
  const b = t * (S.bpm || 118) / 60, beat = b % 1, Au = RAMP.gold;
  // her card's damask, darker, with gold rays turning behind her (a white flash as it cuts in)
  g.drawImage(cardSalonBg(), 0, 0);
  g.globalAlpha = .45; rect(g, 0, 0, SW, SH, '#04150f'); g.globalAlpha = 1;
  g.globalAlpha = .16; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .5; polyPx(g, [[128, 118], [128 + Math.cos(a - .07) * 300, 118 + Math.sin(a - .07) * 300], [128 + Math.cos(a + .07) * 300, 118 + Math.sin(a + .07) * 300]], Au[3]); } g.globalAlpha = 1;
  if (t < .16) { g.globalAlpha = 1 - t / .16; rect(g, 0, 0, SW, SH, '#ffffff'); g.globalAlpha = 1; }
  // calm first; then, eyes narrowed, the scissors go up
  const serious = t > .75, pop = serious ? spring(t - .75, 2.6, 7) : 1;
  g.save(); g.translate(128, 192); g.scale(1, pop);
  if (serious) drawAnahiFull(g, 0, 0, 'pro', S.pt || t, { k: .62, ex: 'focus', ts: 2 }); else drawAnahiFull(g, 0, 0, 'idle', S.pt || t);
  g.restore();
  if (serious) {
    // the blade glints: ¡ting!
    const gk = t - .95;
    if (gk > 0 && gk < .5) { const r = 7 * Math.sin(gk / .5 * Math.PI); drawStar(g, 93, 80, r, '#fffbe0', gk * 3); drawStar(g, 93, 80, r * .5, '#ffffff', -gk * 3); }
    if (gk > 0 && S._anaTing !== S.count) { S._anaTing = S.count; sfx('sparkle'); }
  }
  // Keiko, bottom right, getting serious too
  drawS(g, keikoSide(.5, serious ? 'wag' : 'stand', serious ? 'happy' : 'normal'), 218, 188, { ax: .5, ay: 1, flip: true });
  // the eye cut-in: a gilt-edged band with her eyes, close up, sliding across
  const ek = t - .25;
  if (ek > 0 && ek < .95) {
    const inK = E.outC(clamp(ek / .18, 0, 1)), outK = E.inQ(clamp((ek - .75) / .2, 0, 1)), dx = rd((1 - inK) * -SW + outK * SW);
    g.save(); g.translate(dx, 0);
    rect(g, 0, 60, SW, 44, INK);
    anahiEyeBand(g, t);
    for (let i = 0; i < 8; i++) { const y = 64 + (i * 11) % 36, x = (i * 67 + t * 700) % (SW + 40) - 40; if (x < 60 || x > 190) rect(g, x, y, 24, 1, 'rgba(231,195,95,.5)'); }
    hline(g, 0, SW, 61, Au[3]); hline(g, 0, SW, 102, Au[3]); hline(g, 0, SW, 60, Au[1]); hline(g, 0, SW, 103, Au[1]);
    g.restore();
  }
  // the words slam onto a plaque
  const pk = E.outBack(clamp(t / .25, 0, 1));
  if (pk > 0) { g.save(); g.translate(128, 30); g.scale(pk, pk); anahiPlaque(g, 0, -24, 236, 46); anahiSay(g, 'level', 0, -13, t, beat); g.restore(); }
}
function anahiSpecial(g, S, kind, t) {
  if (typeof cardWord !== 'function') return false;
  if (kind === 'speed') anahiSpeedScene(g, S, t);
  else if (kind === 'boss') anahiBossScene(g, S, t);
  else if (kind === 'level') anahiLevelScene(g, S, t);
  else return false;
  return true;
}
// the bottom-screen label: a little green-and-gold plaque with an icon
function anahiSpecialBot(g, S, kind, t) {
  const lbl = kind === 'speed' ? '¡Más ritmo, más tijera!' : kind === 'boss' ? '¡Lady Di, lista a las 12:00!' : kind === 'level' ? 'Cuidado, calma… ¡y más detalle!' : null;
  if (!lbl) return false;
  const k = E.outBack(clamp(t * 3, 0, 1)), w = txtW(lbl) + 34, x = rd(SW / 2 - w / 2), y = rd(6 - (1 - k) * 36), Au = RAMP.gold;
  panel(g, x, y, w, 22, Au[2], { r: 4, line: INK }); panel(g, x + 2, y + 2, w - 4, 18, kind === 'boss' ? '#6b0f1e' : RAMP.green[2], { r: 3, line: Au[1] });
  txt(g, lbl, x + 20 + (w - 24) / 2, y + 7, '#fff4dc', { align: 'c' });
  const ix = x + 12, iy = y + 11;
  if (kind === 'speed') { for (const dx of [-4, 1]) polyPx(g, [[ix + dx, iy - 4], [ix + dx + 5, iy], [ix + dx, iy + 4]], Au[3]); }
  else if (kind === 'boss') { polyPx(g, [[ix - 4, iy + 4], [ix - 3, iy - 2], [ix, iy - 4], [ix + 3, iy - 2], [ix + 4, iy + 4]], Au[3]); disc(g, ix, iy + 5, 1.2, Au[2]); }
  else if (typeof cardShears === 'function') drawS(g, cardShears(), ix, iy, { s: 1 });
  return true;
}

defStage({
  id: 'anahi', name: 'ANAHÍ', sub: '«Cuidado, calma y detalle»', verb: '¡TOCA!', mech: 'tap', bpm: 118,
  games: ['pulgas', 'unas', 'foto', 'helado', 'burbujas', 'topos', 'seca', 'modelo', 'empareja'], boss: 'prepara', bossAt: 10, speedAt: [4, 7],
  portrait: (k, t) => k === 'sad' ? anahiSprite('sad', .62) : mdl('anaPortraitPro', () => { const s = anahiSprite('pro', .62), c = mkCanvas(s.width + 28, s.height + 14); drawAnahiFull(c.g, rd(c.width / 2), c.height, 'pro', 0, { k: .62, ts: 2 }); return c; }),
  face: () => mdl('anaFace2', () => faceCrop(anahiSprite('idle', .62), 12, 6, 38, 38)),
  cardCols: [RAMP.green[1], RAMP.green[2]],
  rim: RAMP.green[3], tip: 'Toca las pulgas, las uñas, las pompas…',
  songs: ANAHI_SONGS,
  intro: 'anahi_in', outro: 'anahi_out',
  room: {
    top: anahiRoomTop, bot: anahiRoomBot, frame: 'mirror', life: anahiLife, lifeY: 141, lifeSpacing: 34,
    counter: { x: SW / 2, y: 7 }, mini: anahiMini, portal: { x: 64, y: 24, w: 128, h: 96 }, bossLabel: '¡Lady Di, lista para las 12:00!',
    special: anahiSpecial, specialBot: anahiSpecialBot,
    staticCols: [RAMP.green[1], RAMP.green[2]], playCols: [RAMP.green[2], RAMP.green[3]], cardCol: RAMP.green,
  },
});

// ---------------------------------------------------------------- story -----
function lady(g, x, y, ex) {
  drawWestieSit(g, x, y, ex);
  // a big pink show bow on top of the head
  const bx = x + 3, by = y - 77;
  polyPx(g, [[bx, by], [bx - 10, by - 6], [bx - 10, by + 6]], INK); polyPx(g, [[bx, by], [bx + 10, by - 6], [bx + 10, by + 6]], INK);
  polyPx(g, [[bx, by], [bx - 9, by - 5], [bx - 9, by + 5]], '#ff5d9e'); polyPx(g, [[bx, by], [bx + 9, by - 5], [bx + 9, by + 5]], '#ff5d9e');
  disc(g, bx, by, 2.5, INK); disc(g, bx, by, 1.6, '#ffd1e4');
}
function podium(g, t) {
  rect(g, 0, 0, SW, SH, '#2a2440');
  for (let i = 0; i < 6; i++) { g.globalAlpha = .12; polyPx(g, [[40 + i * 36, 0], [60 + i * 36, 0], [128 + (i - 2.5) * 20, 150], [128 + (i - 2.5) * 8, 150]], '#fff7ae'); } g.globalAlpha = 1;
  rect(g, 88, 140, 80, 52, INK); rect(g, 89, 141, 78, 51, RAMP.gold[2]); rect(g, 89, 141, 78, 3, RAMP.gold[4]); mord(g, '1', 128, 150, { u: 1.6, r: 1.8 });
  rect(g, 20, 160, 68, 32, INK); rect(g, 21, 161, 66, 31, '#b3b8d4'); rect(g, 168, 166, 68, 26, INK); rect(g, 169, 167, 66, 25, '#d58c4c');
  for (let i = 0; i < 30; i++) { const x = (i * 37 + t * 40) % SW, y = (i * 53 + t * 70) % SH; rect(g, x, y, 2, 2, [C.yellow, C.pink, C.mint, C.sky][i % 4]); }
}
defCut('anahi_in', {
  song: ANAHI_SONGS.card && { spb: 4, loop: true, tracks: ANAHI_SONGS.play.tracks },
  shots: [
    { dur: 0, lines: [['narr', 'Sábado, 11:56. El Concurso Canino de Barcelona empieza a las 12:00.'], ['lady', 'Soy Lady Di Viladomat. Tres veces campeona. Vengo a por la cuarta.'], ['anahi', '¿A las doce? ¡Pero si quedan cuatro minutos!'], ['anahi', 'Tranquila, Lady. Cuidado, calma… y detalle.']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); wallClock(g, 168, 38, 716 + t * 20); drawAnahiFull(g, 190, 170, CUT.li >= 2 ? (CUT.li === 3 ? 'ready' : 'boss') : 'idle', t); const k = clamp(t / .5, 0, 1); caption(g, '11:56', 6 - (1 - k) * 30); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); lady(g, 128, 150 + Math.abs(Math.sin(t * 2)) * -1, CUT.li === 1 ? 'wink' : 'normal'); } },
  ],
});
defCut('anahi_out', {
  song: { spb: 4, loop: true, tracks: ANAHI_SONGS.card.tracks },
  shots: [
    { dur: 0, sfx: [[.2, 'slam'], [.4, 'sparkle']], lines: [['narr', '12:00 en punto. Y la ganadora es…'], ['lady', '¡LADY DI VILADOMAT! ¡Cuatro de cuatro!']],
      top(g, t) { podium(g, t); lady(g, 128, 140, 'happy'); if (CUT.li >= 1) rosette(g, 146, 112, C.red, '#ffffff'); },
      bot(g, t) { rect(g, 0, 0, SW, SH, '#3b2757'); for (let i = 0; i < 18; i++) { const x = 8 + i * 14, y = 150 + Math.abs(Math.sin(t * 6 + i)) * -6; drawS(g, lifeWestie(i % 5 === 0), x, y); } txt(g, '¡GUAU! ¡GUAU! ¡GUAU!', SW / 2, 40 + Math.sin(t * 8) * 2, '#ffffff', { align: 'c', out: INK, bold: true }); } },
    { dur: 0, lines: [['anahi', 'Y una más para la pared… ¡la número catorce!'], ['keiko', '¿Ñam? ¿Se come?'], ['anahi', '¡KEIKO! ¡Las rosetas no se comen!'], ['narr', 'Y así llegaron las rosetas a la pared verde de Westie BLVRD.']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); rosette(g, 40, 64 + (CUT.li === 0 ? Math.max(0, 1 - t * 2) * -40 : 0), C.red, '#ffffff'); drawAnahiFull(g, 90, 170, CUT.li === 2 ? 'lose' : 'win', t); drawKeikoSit(g, 190, 186, CUT.li === 1 ? 'wow' : CUT.li === 2 ? 'sad' : 'happy'); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawPortalFrame(g, 'mirror', 64, 24, 128, 96, t); rect(g, 64, 24, 128, 96, '#dfe9ee'); rosette(g, 128, 70, C.red, '#ffffff'); txt(g, '1er PREMIO', 128, 90, INK, { align: 'c', bold: true }); } },
  ],
});
WHO.lady = { name: 'Lady Di', col: '#e05b98', voice: 'keiko' };
