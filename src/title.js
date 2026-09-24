// ============================================================================
//  title — the WESTIE WARE ¡Tocados! logo and the title screen.
// ============================================================================
'use strict';

const SONG_TITLE = { spb: 4, loop: true, tracks: [
  { i: 'p25', v: .6, n: 'C5 . E5 G5 . A5 G5 . E5 . C5 . D5 . E5 . C5 . E5 G5 . A5 C6 . A5 . G5 . E5 . D5 . F5 . A5 C6 . D6 C6 . A5 . F5 . G5 . A5 . G5 . E5 C5 . D5 E5 . C5 . . . . . . .' },
  { i: 'p12', v: .3, n: 'E4 . G4 C5 . E5 C5 . G4 . E4 . F4 . G4 . E4 . G4 C5 . E5 G5 . E5 . C5 . G4 . F4 . A4 . C5 F5 . A5 F5 . C5 . A4 . B4 . D5 . B4 . G4 E4 . F4 G4 . E4 . . . . . . .' },
  { i: 'bass', v: .85, n: 'C3 . . C3 . . G2 . A2 . . A2 . . E2 . F2 . . F2 . . C3 . G2 . . G2 . . D3 . F2 . . F2 . . A2 . Bb2 . . Bb2 . . F2 . C3 . . G2 . . E2 . C3 . G2 . C3 . . .' },
  { i: 'd', v: .75, n: 'k . h k s . h . k . h k s . h h k . h k s . h . k k h . s s s s' }] };

// ---------------------------------------------------------------- the logo --
const LOGO_ST = { u: 2.35, r: 2.45, rim: 2, sy: 4, sx: 1, fill: ['#ffffff', '#fff27a', '#ffc23a'], line: INK, shadow: RAMP.green[0] };
const LOGO_ST2 = { u: 1.7, r: 1.9, rim: 2, sy: 2, sx: 1, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'], line: INK, shadow: '#7a1f4a', slant: .28 };
// (x, y) = centre of the word line; t = seconds since it appeared
function drawLogo(g, x, y, t, o = {}) {
  const T = Math.max(0, t);
  // emblem: the crest westie in a gilt badge, popping up behind the letters
  const ek = spring(T - .35, 2.2, 6), ex = x - 2, ey = y - 22 - ek * 6;
  if (ek > 0) {
    // a gilt sunburst medallion behind the westie
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + T * .4; polyPx(g, [[ex, ey + 2], [ex + Math.cos(a - .1) * 36 * ek, ey + 2 + Math.sin(a - .1) * 36 * ek], [ex + Math.cos(a + .1) * 36 * ek, ey + 2 + Math.sin(a + .1) * 36 * ek]], i % 2 ? RAMP.gold[3] : RAMP.gold[2]); }
    disc(g, ex, ey + 2, 31 * ek, INK); disc(g, ex, ey + 2, 30 * ek, RAMP.gold[3]); disc(g, ex, ey + 2, 27 * ek, RAMP.green[2]); disc(g, ex - 2, ey, 22 * ek, RAMP.green[3]);
    if (ek > .6) drawS(g, keikoHead(fl(T * 1.3) % 5 === 0 ? 'wink' : 'happy'), ex, ey + 6, { s: 1 });
  }
  // WESTIE WARE: letters drop in one by one, then keep a lazy wave
  mord(g, 'WESTIE WARE', x, y - 6, LOGO_ST, { anim: (i) => {
    const lt = T - i * .05; if (lt <= 0) return { s: 0 };
    const drop = lt < .35 ? -40 * (1 - E.outBounce(lt / .35)) : 0;
    return { dy: drop + Math.sin(T * 3 + i * .6) * 1.6, s: 1, rot: Math.sin(T * 2.2 + i) * .03 };
  } });
  // ¡Tocados! — a pink sticker slapped under it
  const sk = spring(T - .9, 2.6, 7);
  if (sk > 0) {
    g.save(); g.translate(rd(x + 34), rd(y + 34)); g.rotate(-.08 + Math.sin(T * 2) * .02); g.scale(sk, sk);
    mord(g, '¡Tocados!'.toUpperCase(), 0, -10, LOGO_ST2, {});
    g.restore();
  }
  if (!o.noSparkle) for (let i = 0; i < 4; i++) { const ph = (T * .7 + i * .25) % 1; if (ph < .3) drawStar(g, x - 110 + i * 70 + (i % 2) * 20, y - 20 + (i % 3) * 22, 3.5 * (1 - ph / .3) + .5, '#ffffff', ph * 6); }
}
// small version on the console lid (tall phones)
function drawLidLogo(g, x, y) {
  mord(g, 'WESTIE WARE', x, y - 8, { u: 1.2, r: 1.3, rim: 1, sy: 1, fill: ['#fff8e6', '#f2e2b8', '#dcc08a'], line: RAMP.green[0], shadow: RAMP.green[0] }, { anim: i => ({ dy: Math.sin(NOW * 2 + i * .6) * .8 }) });
}

// ---------------------------------------------------------------- TITLE -----
const TITLE = {
  enter() { this.t = 0; this.idle = 0; this.out = -1; stopAllMusic(.1); this.song = playSong(SONG_TITLE, { bpm: 128 }); this.fx = new FX(); },
  exit() { },
  update(dt) {
    this.t += dt; this.fx.update(dt); this.idle = REALTAP ? 0 : this.idle + dt;
    if (this.idle > 25 && this.out < 0 && !TESTING) { this.out = 0; transit('blinds', DEMO, {}); return; }
    if (this.out < 0 && this.t > .8 && (IN.tap || IN.anyTap)) {
      this.out = 0; sfx('bark', { n: 2, pitch: 1.1 }); sfx('slam'); flash('both', '#ffffff', .15); shake('top', 3, .25);
      this.fx.burst(IN.x || SW / 2, IN.y || 100, 18, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 180 });
      stopSong(this.song, .3);
      after(.55, () => { if (!SAVE.prologue) playCut('prologo', () => { SAVE.prologue = true; persist(); go(MENU, { first: true }); }); else transit('paw', MENU, {}); });
    }
    if (this.out >= 0) this.out += dt;
  },
  drawTop(g) {
    const t = this.t;
    // WarioWare-orange sunburst tempered with Westie cream
    rect(g, 0, 0, SW, SH, '#ffb347');
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .15; polyPx(g, [[SW / 2, SH / 2 + 10], [SW / 2 + Math.cos(a) * 300, SH / 2 + 10 + Math.sin(a) * 300], [SW / 2 + Math.cos(a + .2) * 300, SH / 2 + 10 + Math.sin(a + .2) * 300]], '#ffc56b'); }
    // paw prints drifting
    for (let i = 0; i < 14; i++) { const x = (i * 47 + t * 14) % (SW + 30) - 15, y = (i * 83 + t * 9) % (SH + 30) - 15; drawPawPrint(g, x, y, '#ffd28c', i % 2 ? .5 : -.4); }
    drawLogo(g, SW / 2, 86, t - .2);
    // unlocked characters peeking from the bottom edge
    const peek = titlePeekers();
    peek.forEach((p, i) => { const px0 = 30 + i * (196 / Math.max(1, peek.length - 1 || 1)), bob = Math.abs(Math.sin(t * 3 + i)) * 3; p(g, px0, SH + 8 - bob, t); });
  },
  drawBot(g) {
    const t = this.t, G = RAMP.green;
    rect(g, 0, 0, SW, SH, G[2]);
    for (let y = 0; y < SH; y += 12) for (let x = ((y / 12) % 2) * 12; x < SW; x += 24) rect(g, x + fl(t * 8) % 24 - 12, y, 12, 12, G[3]);
    drawS(g, wbSign(), SW / 2, 44, {});
    const k = .9 + Math.sin(t * 5) * .06;
    if (this.out < 0 && t > .8) {
      mord(g, 'TOCA PARA EMPEZAR', SW / 2, 104, { u: 1.25, r: 1.4, rim: 1, sy: 2, fill: ['#ffffff', '#fff27a', '#ffc23a'] }, { anim: (i) => ({ s: k, dy: Math.sin(t * 6 + i * .4) * 1.5 }) });
      drawHand(g, SW / 2 + 70, 128 + (fl(t * 2) % 2) * 3, fl(t * 2) % 2);
    }
    txt(g, '© 2026 Westie BLVRD · by Anahí Gavilán', SW / 2, 172, RAMP.cream[3], { align: 'c' });
    txt(g, 'C/ Viladomat 185 · Barcelona', SW / 2, 182, RAMP.mint[2], { align: 'c' });
    this.fx.draw(g);
  },
};
function drawPawPrint(g, x, y, col, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (dx, dy) => [x + dx * c - dy * s, y + dx * s + dy * c];
  const [mx, my] = P(0, 2); ellipsePx(g, mx, my, 4, 3.4, col);
  for (const [dx, dy] of [[-4.5, -2.5], [-1.6, -5], [1.6, -5], [4.5, -2.5]]) { const [tx, ty] = P(dx, dy); disc(g, tx, ty, 1.7, col); }
}
// who peeks on the title screen: everyone you've met so far
function titlePeekers() {
  const out = [(g, x, y) => drawS(g, keikoHead('happy'), x, y - 8, { ax: .5, ay: 1 })];
  out.push((g, x, y, t) => drawAnahiFull(g, x, y + 86, fl(t * .5) % 2 ? 'thumbs' : 'idle', t, { k: .6 }));
  for (const id of STORY_STAGES.concat(['superwestie'])) {
    const d = STAGES[id]; if (!d || id === 'anahi' || !stageUnlocked(id) || !d.face) continue;
    out.push((g, x, y) => { const f = d.face(); drawS(g, f, x, y + 4, { ax: .5, ay: 1 }); });
  }
  return out;
}
// ---------------------------------------------------------------- DEMO ------
// the attract mode: the bot plays random microgames until someone touches
defStage({ id: 'demo', menu: false, name: 'DEMO', sub: '«Toca para volver al título»', verb: '¡MIRA!', mech: 'mix', bpm: 124, endless: true,
  games: () => { const l = allStoryGames().filter(id => SAVE.seen[id] || MG[id].stage === 'anahi'); return l.length ? l : allStoryGames(); },
  boss: null, speedEvery: 5, get room() { return STAGES.anahi.room; }, get songs() { return STAGES.anahi.songs; }, cardCols: [RAMP.green[1], RAMP.green[2]], portrait: (k, t) => STAGES.anahi.portrait(k, t) });
const DEMO = {
  enter() { BOTIN.on = true; go(STG, { id: 'demo', story: false }); SCENE = DEMO_WRAP; },
};
// wraps the stage scene: draws a DEMO banner and leaves on a real touch
const DEMO_WRAP = {
  wrapsStage: true,
  update(dt) { if (REALTAP) { BOTIN.on = false; stopAllMusic(.1); transit('blinds', TITLE, {}); SCENE = STG_ONLY; return; } STG.update(dt); if (STG.S.phase === 'results') { BOTIN.on = false; transit('blinds', TITLE, {}); SCENE = STG_ONLY; } },
  always(dt) { STG.always(dt); },
  drawTop(g) { STG.drawTop(g); if (fl(NOW * 2) % 2 === 0) { panel(g, SW / 2 - 30, SH - 20, 60, 15, INK, { r: 4, line: '#ffffff' }); txt(g, 'DEMO', SW / 2, SH - 16, '#ffffff', { align: 'c', bold: true }); } },
  drawBot(g) { STG.drawBot(g); },
  exit() { BOTIN.on = false; STG.exit(); },
};
const STG_ONLY = { wrapsStage: true, update(dt) { STG.update(dt); }, always(dt) { STG.always(dt); }, drawTop(g) { STG.drawTop(g); }, drawBot(g) { STG.drawBot(g); }, exit() { STG.exit(); } };
