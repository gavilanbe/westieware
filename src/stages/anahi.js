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
};

// the hanging oval plate that holds the counter
function counterPlate(g, x, y) {
  vline(g, x - 16, 0, y - 6, RAMP.gold[1]); vline(g, x + 16, 0, y - 6, RAMP.gold[1]);
  for (let i = 1; i < y - 6; i += 3) { px(g, x - 16, i, RAMP.gold[3]); px(g, x + 16, i, RAMP.gold[3]); }
  ellipsePx(g, x, y + 8, 27, 13, INK); ellipsePx(g, x, y + 8, 26, 12, RAMP.gold[2]); ellipsePx(g, x, y + 8, 24, 10, RAMP.green[1]); ellipsePx(g, x - 1, y + 7, 22, 8, RAMP.green[2]);
  for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; px(g, x + Math.cos(a) * 25, y + 8 + Math.sin(a) * 11.5, RAMP.gold[4]); }
}
const ANA_REACT = { ready: 'ready', win: 'win', lose: 'lose', clear: 'clear', over: 'over' };
function anahiRoomTop(g, S) {
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
  // the grooming table, Anahí behind it, the westie on top
  drawAnahiFull(g, 190, 170, pose, S.pt || 0, { jump, bob, snip: pose === 'speed' });
  groomTable(g, 138, 124, 70);
  const mood = pose === 'win' || pose === 'clear' ? 'happy' : pose === 'lose' || pose === 'over' ? 'sad' : pose === 'boss' ? 'wow' : 'normal';
  const dogBounce = mood === 'happy' ? Math.abs(Math.sin(rt * 9)) * 3 : 0;
  drawS(g, westieSide(.62, mood === 'happy' ? 'wag' : mood === 'sad' ? 'wet' : 'stand', mood), 132, 122 - dogBounce, { ax: .5, ay: 1 });
  shadowOval(g, 138, 170, 30, 3, .5);
  // reaction garnish: a shower of stars for a win, a puff for a miss
  if (S.topFx && S.phase === 'inter') {
    if (S.react === 'win' && rt < .05 && S._burst !== S.count) { S._burst = S.count; S.topFx.burst(186, 84, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 60, sp1: 150, g: 120, life0: .4, life1: .8 }); S.topFx.burst(132, 100, 8, { k: 'heart', c: '#ff5d9e', sp0: 30, sp1: 70, g: -20, life0: .6, life1: 1 }); }
    if (S.react === 'lose' && rt < .05 && S._burst !== -S.count) { S._burst = -S.count; S.topFx.burst(132, 104, 10, { k: 'puff', c: ['#9896a4', '#b3b8d4'], sp0: 20, sp1: 60, r: 4, life0: .4, life1: .7 }); }
  }
  if (pose === 'lose' || pose === 'over') { const k = Math.min(1, rt * 3); drawRainCloud(g, 188, 36 + (1 - k) * -30, rt); }
  if (pose === 'speed') { for (let i = 0; i < 6; i++) { const yy = 70 + i * 12, xx = (i * 53 + fl((S.pt || 0) * 300)) % 90; rect(g, 214 + xx * .3, yy, 16, 1, '#ffffff'); } }
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
function anahiLife(g, x, y, st, bt) {
  if (st === 'gone') { g.globalAlpha = .45; drawS(g, lifeWestie(true), x, y, { alpha: .25 }); g.globalAlpha = 1; ringPx(g, x, y + 2, 9, 'rgba(29,20,36,.25)'); return; }
  if (st === 'break') { const k = clamp(bt / 1.1, 0, 1); drawS(g, lifeWestie(true), x + E.inQ(k) * 90 * (x > SW / 2 ? 1 : -1), y - Math.sin(k * Math.PI) * 18, { flip: x < SW / 2 }); if (bt < .5) txt(g, '¡Aaay!', x, y - 22 - bt * 10, '#ffffff', { align: 'c', out: INK }); return; }
  drawS(g, lifeWestie(false), x, y);
}
function anahiMini(g, x, y, st, S) {
  const pose = st === 'win' ? 'win' : st === 'lose' ? 'lose' : 'idle';
  drawAnahi(g, 30, SH + 44 - (st === 'win' ? 4 : 0), pose, S.pt);
}

defStage({
  id: 'anahi', name: 'ANAHÍ', sub: '«Cuidado, calma y detalle»', verb: '¡TOCA!', mech: 'tap', bpm: 118,
  games: ['pulgas', 'unas', 'foto', 'helado', 'burbujas', 'topos'], boss: 'pulgon', bossAt: 10, speedAt: [4, 7],
  portrait: (k, t) => mdl('anaPortrait' + (k === 'sad' ? 'S' : ''), () => { const c = mkCanvas(64, 112); c.g.drawImage(anahiLegs('stand'), 0, 76); c.g.drawImage(anahiBody(k === 'sad' ? 'over' : 'ready'), 0, 6); if (k !== 'sad') { drawS(c.g, scissorsSpr(), 51, 34, { rot: -1.9 }); drawS(c.g, combSpr(), 16, 65, { rot: -.25 }); } return c; }),
  face: () => mdl('anaFace', () => faceCrop(anahiBody('idle'), 12, 0, 40, 36)),
  rim: RAMP.green[3], cardCols: [RAMP.green[1], RAMP.green[2]], tip: 'Toca las pulgas, las uñas, las pompas…',
  songs: ANAHI_SONGS,
  intro: 'anahi_in', outro: 'anahi_out',
  room: {
    top: anahiRoomTop, bot: anahiRoomBot, frame: 'mirror', life: anahiLife, lifeY: 141, lifeSpacing: 34,
    counter: { x: SW / 2, y: 7 }, mini: anahiMini, portal: { x: 64, y: 24, w: 128, h: 96 },
    staticCols: [RAMP.green[1], RAMP.green[2]], playCols: [RAMP.green[2], RAMP.green[3]], cardCol: RAMP.green,
  },
});

// ---------------------------------------------------------------- story -----
function lady(g, x, y, ex) {
  drawWestieSit(g, x, y, ex);
  // a big pink show bow on top of the head
  const bx = x + 12, by = y - 90;
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
    { dur: 0, lines: [['anahi', 'Y una más para la pared… ¡la número catorce!'], ['bule', '¿Ñam? ¿Se come?'], ['anahi', '¡BULE! ¡Las rosetas no se comen!'], ['narr', 'Y así llegaron las rosetas a la pared verde de Westie BLVRD.']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); rosette(g, 40, 64 + (CUT.li === 0 ? Math.max(0, 1 - t * 2) * -40 : 0), C.red, '#ffffff'); drawAnahiFull(g, 90, 170, CUT.li === 2 ? 'lose' : 'win', t); drawWestieSit(g, 190, 186, CUT.li === 1 ? 'wow' : CUT.li === 2 ? 'sad' : 'happy'); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawPortalFrame(g, 'mirror', 64, 24, 128, 96, t); rect(g, 64, 24, 128, 96, '#dfe9ee'); rosette(g, 128, 70, C.red, '#ffffff'); txt(g, '1er PREMIO', 128, 90, INK, { align: 'c', bold: true }); } },
  ],
});
WHO.lady = { name: 'Lady Di', col: '#e05b98', voice: 'bule' };
