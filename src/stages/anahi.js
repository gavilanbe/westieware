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

// the shopfront on Carrer de Viladomat, as in the user's video: tan stucco,
// the green sign with its crest, the window, the door, grass and the A-frame
function anahiShopTop() {
  return mdl('anahiShopTop', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#c9a27a');
    for (let i = 0; i < 700; i++) px(g, hash2(i, 11) * SW, hash2(11, i) * SH, hash2(i, 2) < .5 ? '#bb946c' : '#d4b088');
    for (const x of [0, 246]) { rect(g, x, 0, 10, SH, '#8a5f3a'); rect(g, x + 1, 0, 1, SH, '#a8764c'); }
    // the shop opening: window (left) + door (right)
    const oy = 78;
    rect(g, 14, oy, 228, 90, INK);
    rect(g, 16, oy + 2, 150, 86, '#16362c'); rect(g, 18, oy + 4, 146, 82, '#1f4a3c');
    for (const lx of [40, 80, 120]) { rect(g, lx, oy + 6, 10, 2, '#fff7ae'); rect(g, lx + 2, oy + 8, 6, 1, '#fff2c0'); }
    rect(g, 30, oy + 26, 40, 30, '#2a5a48'); ringRect(g, 88, oy + 20, 26, 32, 2, RAMP.gold[2]); rect(g, 90, oy + 22, 22, 28, '#dce7ea');
    rect(g, 22, oy + 58, 138, 4, '#caa27a'); rect(g, 22, oy + 62, 138, 22, '#8e6a44'); for (let x = 26; x < 156; x += 26) rect(g, x, oy + 64, 22, 18, '#a67e54');
    drawS(g, aFrameSign(), 60, oy + 86, { ax: .5, ay: 1, s: .8 });
    for (let i = 0; i < 4; i++) linePx(g, 100 + i * 7, oy + 2, 70 + i * 7, oy + 88, 'rgba(255,255,255,.12)');
    // door
    rect(g, 170, oy + 2, 70, 86, '#0f1a17'); rect(g, 174, oy + 6, 62, 80, '#1d3a33'); rect(g, 178, oy + 10, 54, 72, '#2c5a50');
    ellipsePx(g, 205, oy + 26, 13, 7, INK); ellipsePx(g, 205, oy + 26, 12, 6, '#fffaf0'); tiny(g, 'OPEN', 205, oy + 24, INK, { align: 'c' });
    rect(g, 228, oy + 44, 3, 12, RAMP.gold[3]);
    // grass strip, water bowl, pavement
    rect(g, 14, oy + 90, 228, 6, '#3e8f3a'); for (let x = 14; x < 242; x += 2) px(g, x, oy + 89, '#56ab4a');
    ellipsePx(g, 150, oy + 92, 9, 3, INK); ellipsePx(g, 150, oy + 91, 8, 2.4, RAMP.steel[3]); ellipsePx(g, 150, oy + 91, 5.5, 1.4, '#9bd6f7');
    rect(g, 0, oy + 96, SW, SH - oy - 96, '#6d7ea0');
    for (let y = oy + 96; y < SH; y += 9) { rect(g, 0, y, SW, 1, '#556486'); for (let x = ((y / 9) % 2) * 9; x < SW; x += 18) rect(g, x, y, 1, 9, '#556486'); }
    // the sign over the opening
    drawS(g, wbSign(), SW / 2, oy - 4, { ax: .5, ay: 1 });
    return c;
  });
}
const ANA_REACT = { ready: 'ready', win: 'thumbs', lose: 'sad', clear: 'cheer', over: 'over' };
function anahiRoomTop(g, S) {
  g.drawImage(anahiShopTop(), 0, 0);
  const beat = S.pb || 0, rt = S.reactT || 0;
  let pose = rt < 1.6 ? (ANA_REACT[S.react] || 'idle') : 'idle';
  if (S.phase === 'inter' && S.special === 'speed' && S.pb >= 2) pose = 'work';
  if (S.phase === 'inter' && S.special === 'boss' && S.pb >= 2) pose = 'wow';
  if (S.react === 'clear' || S.react === 'over') pose = ANA_REACT[S.react];
  // Keiko sits by the door and cheers with you
  const happy = pose === 'thumbs' || pose === 'cheer', sad = pose === 'sad' || pose === 'over';
  const kb = happy ? Math.abs(Math.sin(rt * 10)) * 3 : 0;
  drawS(g, keikoSide(.46, happy ? 'wag' : 'stand', happy ? 'happy' : sad ? 'sad' : 'normal'), 212, 166 - kb, { ax: .5, ay: 1, flip: true });
  // Anahí, big, in front of the shop (cut at the thighs)
  const jump = (pose === 'thumbs' || pose === 'cheer') ? Math.max(0, Math.sin(Math.min(1, rt / .4) * Math.PI)) * 7 : 0;
  const bob = Math.round(Math.abs(Math.sin(beat * Math.PI)) * -1.5);
  drawAnahiFull(g, 124, 262, pose, S.pt || 0, { k: .9, jump, bob, snip: pose === 'work' });
  // the counter pops inside the crest of the sign
  const sinceInc = S.phase === 'inter' && S.result !== null ? S.pb : 9;
  if (S.phase === 'inter' || S.phase === 'over') {
    if (sinceInc < 2.6 || S.phase === 'over') {
      const k = S.countPop > 0 ? 1 + S.countPop * .5 : 1;
      rect(g, SW / 2 - 12, 14, 24, 21, RAMP.green[2]);
      mord(g, String(S.count), SW / 2, 13, { u: 1.5, r: 1.8, rim: 2, sy: 2, fill: ['#ffffff', '#fff8e6', '#f2e2b8'] }, { anim: () => ({ s: k }) });
    }
  }
  // reaction garnish
  if (S.topFx && S.phase === 'inter') {
    if (S.react === 'win' && rt < .05 && S._burst !== S.count) { S._burst = S.count; S.topFx.burst(100, 110, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 60, sp1: 150, g: 120, life0: .4, life1: .8 }); S.topFx.burst(212, 140, 6, { k: 'heart', c: '#ff5d9e', sp0: 30, sp1: 70, g: -20, life0: .6, life1: 1 }); }
    if (S.react === 'lose' && rt < .05 && S._burst !== -S.count) { S._burst = -S.count; S.topFx.burst(124, 96, 10, { k: 'puff', c: ['#9896a4', '#b3b8d4'], sp0: 20, sp1: 60, r: 4, life0: .4, life1: .7 }); }
  }
  if (pose === 'over') { const k = Math.min(1, rt * 3); drawRainCloud(g, 124, 70 + (1 - k) * -30, rt); }
  if (pose === 'work') { for (let i = 0; i < 7; i++) { const yy = 96 + i * 12, xx = (i * 53 + fl((S.pt || 0) * 300)) % 90; rect(g, 8 + xx * .3, yy, 18, 1, '#ffffff'); } }
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
function anahiLife(g, x, y, st, bt, S) {
  const sadNow = S && S.phase === 'inter' && S.react === 'lose' && S.reactT < 1.3;
  if (st === 'gone') return;
  if (st === 'break') { const k = clamp(bt / .9, 0, 1); if (k < 1) drawS(g, lifeWestie(true), x, y + E.inQ(k) * 6, { s: 1 - E.inQ(k), rot: k * .6 }); return; }
  drawS(g, lifeWestie(sadNow), x, y + (sadNow ? 1 : 0));
}
function anahiMini(g, x, y, st, S) {
  const pose = st === 'win' ? 'win' : st === 'lose' ? 'lose' : 'idle';
  drawAnahiFull(g, 34, SH + 84 - (st === 'win' ? 5 : 0), st === 'win' ? 'thumbs' : st === 'lose' ? 'sad' : 'idle', S.pt, { k: .6 });
}

defStage({
  id: 'anahi', name: 'ANAHÍ', sub: '«Cuidado, calma y detalle»', verb: '¡TOCA!', mech: 'tap', bpm: 118,
  games: ['pulgas', 'unas', 'foto', 'helado', 'burbujas', 'topos', 'seca', 'modelo', 'empareja'].filter(id => MG[id] || true), boss: 'hacienda', bossAt: 10, speedAt: [4, 7],
  portrait: (k, t) => anahiSprite(k === 'sad' ? 'sad' : k === 'card' || k === 'menu' ? 'headhand' : 'thumbs', .62),
  face: () => mdl('anaFace2', () => faceCrop(anahiSprite('idle', .62), 12, 6, 38, 38)),
  slogan: 'Tu perro es nuestra familia', cardBg: 'waves', cardCols: ['#c93aa8', '#e45ec0'], chibi: (f, t) => anahiChibi(f, t),
  rim: RAMP.green[3], tip: 'Toca las pulgas, las uñas, las pompas…',
  songs: ANAHI_SONGS,
  intro: 'anahi_in', outro: 'anahi_out',
  room: {
    top: anahiRoomTop, bot: anahiRoomBot, frame: 'mirror', life: anahiLife, lifePos: { screen: 'top', x0: 22, y: 16, sp: 22 },
    counter: 'none', mini: anahiMini, portal: { x: 64, y: 24, w: 128, h: 96 },
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
