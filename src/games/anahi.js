// ============================================================================
//  Microgames of ANAHÍ's stage (¡TOCA!) + the boss, the Flea King.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared art
// a westie's back in close-up (fills the touch screen), the head turned to us
function westieBackBig() {
  return mdl('wBackBig', () => {
    const F = RAMP.fur;
    const backS = SD.ellipse(118, 176, 150, 92);
    const back = SD.shag(SD.tufts(backS, 118, 150, 4.5, 70, 1.3, 1.5), 1.8, .12, 21);
    const tailS = SD.curve([22, 110], [8, 70], [24, 38], 11, 5);
    const tail = SD.shag(tailS, 1.6, .2, 5);
    const legS = SD.ellipse(50, 150, 34, 38);
    const tx = clumpTex(7, .32, 17, 1.35), tx2 = clumpTex(5, .3, 9, 1.4);
    return model(SW, SH, [
      { f: tail, fs: tailS, ramp: F, z: 0, th: 8, tex: tx2 },
      { f: back, fs: backS, ramp: F, z: 1, th: 40, tex: tx, dith: .5 },
      { f: SD.shag(legS, 1.4, .2, 3), fs: legS, ramp: F, z: 1.5, th: 18, tex: tx2 },
    ]);
  });
}
function tilesBg() { return mdl('tilesBg', () => { const c = mkCanvas(SW, SH); subwayTiles(c.g, 0, 0, SW, SH); return c; }); }
function fleaSpr(f) {
  return mdl('flea' + f, () => spr(f ? [
    '...kk...',
    '..kbBk.k',
    '.kbBbbkk',
    'kbbbbbbk',
    '.kbbbbk.',
    '.k.k.k..',
    'k.k.k...'] : [
    '...kk...',
    '..kbBk.k',
    '.kbBbbkk',
    'kbbbbbbk',
    '.kbbbbk.',
    '..k.k.k.',
    '..k.k.k.'], { k: INK, b: '#5b3a1d', B: '#a07748' }));
}
function splatSpr() { return mdl('splat', () => spr(['.k...k.', 'k.kkk.k', '.kbbbk.', 'kbbBbbk', '.kbbbk.', 'k.kkk.k', '.k...k.'], { k: INK, b: '#5b3a1d', B: '#a07748' })); }

// ---------------------------------------------------------------- 1 PULGAS --
defMG({
  id: 'pulgas', stage: 'anahi', name: 'Pulgas fuera', cmd: '¡CAZA!', how: 'Toca las pulgas antes de que salten', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p12', v: .55, n: 'E5 . E5 . G5 . E5 . D5 . C5 . D5 - . . E5 . E5 . G5 . A5 . G5 . E5 . C5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . E3 . G3 . A3 . F3 . A3 . C4 . A3 . C3 . E3 . G3 . A3 . G3 . F3 . E3 . D3 .' },
    { i: 'd', v: .7, n: 'k . h h s . h h k . h h s . h s k . h h s . h h k . h h s s s s' }] }),
  init(g) {
    const n = [2, 3, 4][g.level - 1];
    g.fleas = [];
    for (let i = 0; i < n; i++) g.fleas.push(this.spot(g, { dead: false, jump: 0, sit: g.r(.1, .5), f: 0 }));
    g.face = 'grr'; g.bounce = 0;
  },
  spot(g, fl0) { const x = g.r(40, 188), y = 196 - 92 * Math.sqrt(Math.max(0, 1 - ((x - 118) / 150) ** 2)) + g.r(10, 50); fl0.x = x; fl0.y = y; return fl0; },
  update(g, dt) {
    const sp = [1, 1.25, 1.55][g.level - 1] * g.tempo;
    g.bounce = Math.max(0, g.bounce - dt * 4);
    for (const f of g.fleas) {
      if (f.dead) { f.dt = (f.dt || 0) + dt; continue; }
      if (f.jump > 0) {
        f.jump += dt * 3.4 * sp; const k = Math.min(1, f.jump);
        f.x = lerp(f.x0, f.x1, k); f.y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * f.h;
        if (k >= 1) { f.jump = 0; f.sit = g.r(.25, .7) / sp; g.fx.add({ k: 'puff', x: f.x, y: f.y + 3, r: 2, life: .25, c: '#ffffff' }); }
      } else {
        f.sit -= dt;
        if (f.sit <= 0 && g.state === 'play') { f.x0 = f.x; f.y0 = f.y; this.spot(g, f); f.x1 = f.x; f.y1 = f.y; f.x = f.x0; f.y = f.y0; f.h = g.r(18, 44); f.jump = .001; sfx('boing', { pitch: 2.4, vol: .25 }); }
      }
      f.f = (f.f + dt * (f.jump > 0 ? 20 : 8)) % 2;
    }
    if (IN.tap && g.state === 'play') {
      let best = null, bd = 16;
      for (const f of g.fleas) if (!f.dead) { const d = dist(IN.x, IN.y, f.x, f.y); if (d < bd) { bd = d; best = f; } }
      if (best) {
        best.dead = true; best.dt = 0; HITSTOP = 3; sfx('squish', { pitch: 1 + g.fleas.filter(f => f.dead).length * .12 }); buzz(8);
        g.fx.burst(best.x, best.y, 8, { k: 'star', c: [C.yellow, '#fff'], sp0: 40, sp1: 90, life0: .25, life1: .45 });
        g.fx.add({ k: 'txt', s: '¡PAF!', x: best.x, y: best.y - 10, life: .5, c: '#ffffff' });
        g.bounce = 1; g.shake(1.5, .1);
        if (g.fleas.every(f => f.dead)) { g.win(); g.face = 'love'; for (let i = 0; i < 6; i++) g.fx.add({ k: 'heart', x: 212 + g.r(-20, 20), y: 60, vx: g.r(-20, 20), vy: g.r(-60, -30), life: 1, c: C.pink }); }
      } else { g.fx.add({ k: 'ring', x: IN.x, y: IN.y, r: 3, life: .25, c: '#ffffff' }); }
    }
    if (g.state === 'lost') g.face = 'grr';
  },
  draw(g, c) {
    c.drawImage(tilesBg(), 0, 0);
    c.drawImage(westieBackBig(), 0, 0);
    // head turned to us at the right
    const face = g.state === 'won' ? 'love' : g.state === 'lost' ? 'grr' : (fl(g.t * 4) % 2 ? 'grr' : 'wow');
    drawS(c, buleHead(face), 214, 70 - g.bounce * 4, { rot: -.12 + Math.sin(g.t * 3) * .03 });
    if (g.state === 'play' && fl(g.t * 6) % 2) { txt(c, '¡Me pica!', 214, 20, '#ffffff', { align: 'c', out: INK }); }
    for (const f of g.fleas) {
      if (f.dead) { if (f.dt < .6) drawS(c, splatSpr(), f.x, f.y, { alpha: 1 - f.dt / .6 }); continue; }
      if (f.jump > 0) shadowOval(c, lerp(f.x0, f.x1, Math.min(1, f.jump)), lerp(f.y0, f.y1, Math.min(1, f.jump)) + 4, 3, 1, .6);
      drawS(c, fleaSpr(fl(f.f)), f.x, f.y, { flip: f.x1 != null && f.x1 < f.x0 });
    }
  },
  bot(g) { const f = g.fleas.find(f => !f.dead && f.jump === 0); if (!f) return { down: false }; const tapNow = fl(g.t * 10) % 3 === 0; return { x: f.x, y: f.y, down: tapNow }; },
});

// ---------------------------------------------------------------- 2 UÑAS ----
function pawBig() {
  return mdl('pawBig', () => {
    const F = RAMP.fur;
    const leg = SD.capsule(-30, 120, 70, 108, 30, 26);
    const pad = SD.smooth(8, SD.ellipse(92, 106, 32, 30), leg);
    const toes = [[118, 80], [126, 100], [124, 122], [112, 140]].map(([x, y]) => SD.circle(x, y, 13));
    const toeU = SD.union(...toes);
    const all = SD.shag(SD.smooth(5, pad, toeU), 2.2, .12, 5);
    const tx = clumpTex(6, .3, 4, 1.2);
    return model(SW, SH, [{ f: all, fs: SD.smooth(5, pad, toeU), ramp: F, z: 1, th: 26, tex: tx }]);
  });
}
function anaHandBig() {
  return mdl('anaHandBig', () => {
    const SK = RAMP.skin;
    const palm = SD.smooth(5, SD.ellipse(58, 150, 30, 18), SD.capsule(0, 170, 40, 158, 16, 14));
    const thumb = SD.capsule(80, 142, 104, 128, 7, 6);
    return model(SW, SH, [{ f: palm, ramp: SK, z: 1, th: 12 }, { f: thumb, ramp: SK, z: 2, th: 6 }], {
      post: g => { for (let x = 8; x < 30; x++) { px(g, x, 158 + (x % 3 === 0 ? 1 : 0), RAMP.gold[3]); px(g, x, 159, RAMP.gold[4]); px(g, x, 160, RAMP.gold[1]); } },
    });
  });
}
defMG({
  id: 'unas', stage: 'anahi', name: 'Uñas negras', cmd: '¡CORTA!', how: 'Corta la punta, ¡nunca el vivo!', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'vib', v: .6, n: 'A5 . . E5 . . A5 . G5 . . E5 . . D5 . C5 . . A4 . . C5 . D5 . . E5 - - . .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 . . E3 . D3 . . D3 . . A2 . F2 . . F2 . . C3 . E2 . . E2 . . B2 .' },
    { i: 'd', v: .65, n: 'k . r . s . r . k . r . s . r r k . r . s . r . k k r . s . s s' }] }),
  init(g) {
    g.need = g.level; g.done = 0; g.cur = 0;
    g.zone = [.42, .34, .27][g.level - 1];
    g.period = [1.5, 1.15, .9][g.level - 1] / g.tempo;
    g.nails = [0, 1, 2, 3].map(i => ({ cut: false, tip: 0 }));
    g.order = shuffle([0, 1, 2, 3]).slice(0, g.need);
    g.blade = 0; g.flyers = []; g.ouch = 0; g.jerk = 0;
  },
  // claw centre line: from the toe, 48px long, hooking down; radius tapers
  clawAt(i, t) { const toes = [[118, 80], [126, 100], [124, 122], [112, 140]]; const [x, y] = toes[i]; return [x + 10 + t * 46, y - 2 + t * t * 14 + (i - 1.5) * t * 3, 4 - t * 2.6]; },
  update(g, dt) {
    g.jerk = Math.max(0, g.jerk - dt * 3);
    if (g.state !== 'play') return;
    const ph = (g.t / g.period) % 1; g.blade = .5 - .5 * Math.cos(ph * TAU);
    if (IN.tap) {
      const ni = g.order[g.cur], safe = g.blade >= 1 - g.zone;
      if (safe) {
        const [bx, by] = this.clawAt(ni, g.blade);
        g.nails[ni].cut = true; g.nails[ni].at = g.blade; sfx('snip'); buzz(10); HITSTOP = 3;
        g.flyers.push({ x: bx + 6, y: by, vx: g.r(60, 120), vy: g.r(-160, -90), rot: 0, len: (1 - g.blade) * 47 + 4 });
        g.fx.burst(bx, by, 10, { k: 'star', c: [C.yellow, '#fff', C.mint], sp0: 50, sp1: 120 });
        g.fx.add({ k: 'txt', s: '¡CLIC!', x: bx, y: by - 16, life: .5, c: '#ffffff' });
        g.cur++; if (g.cur >= g.need) g.win();
      } else { g.ouch = g.t; g.jerk = 1; sfx('whine', { pitch: 1.1 }); g.shake(4, .3); g.lose(); }
    }
    for (const f of g.flyers) { f.vy += 500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += dt * 14; }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#2b2540');
    for (let y = 8; y < SH; y += 14) for (let x = (y / 14 % 2) * 7 + 4; x < SW; x += 14) ringPx(c, x, y, 3, '#40395e');
    // a warm spotlight behind the nails (Anahí checks the quick against the light)
    for (let r = 70; r > 0; r -= 14) { c.globalAlpha = .07; disc(c, 180, 100, r, '#fff7ae'); } c.globalAlpha = 1;
    const jx = -g.jerk * 30;
    c.save(); c.translate(rd(jx), 0);
    // nails first: curved black claws; the quick shows faintly through them
    for (let i = 0; i < 4; i++) {
      const cut = g.nails[i].cut, end = cut ? g.nails[i].at : 1;
      const P = t => this.clawAt(i, t);
      for (let q = 0; q <= end; q += .02) { const [x, y, r] = P(q); disc(c, x, y, r + 1, INK); }
      for (let q = 0; q <= end; q += .02) { const [x, y, r] = P(q); disc(c, x, y, r, '#2b2540'); }
      for (let q = .05; q <= end - .04; q += .02) { const [x, y, r] = P(q); px(c, x, y - r + 1, '#6e6390'); }
      const qk = 1 - g.zone;
      c.globalAlpha = .5; for (let q = 0; q <= Math.min(qk, end); q += .02) { const [x, y] = P(q); px(c, x, y, '#ff6b8a'); px(c, x, y + 1, '#ff6b8a'); } c.globalAlpha = 1;
      const isTarget = g.state === 'play' && g.order[g.cur] === i;
      if (isTarget && !cut) for (let q = qk; q <= 1; q += .05) { const [x, y, r] = P(q); if (fl(q * 40 + g.t * 12) % 2) { px(c, x, y - r - 3, '#5bd18b'); px(c, x, y + r + 3, '#5bd18b'); } }
    }
    c.drawImage(pawBig(), 0, 0);
    c.drawImage(anaHandBig(), 0, 0);
    c.restore();
    for (const f of g.flyers) { c.save(); c.translate(rd(f.x), rd(f.y)); c.rotate(f.rot); rect(c, -f.len / 2, -2, f.len, 4, INK); rect(c, -f.len / 2 + 1, -1, f.len - 2, 2, '#40395e'); px(c, f.len / 2 - 1, 0, INK); c.restore(); }
    // the clipper riding along the target nail
    if (g.state === 'play') {
      const [bx, by] = this.clawAt(g.order[g.cur], g.blade);
      rect(c, bx - 2, by - 22, 5, 44, INK); rect(c, bx - 1, by - 21, 3, 42, RAMP.steel[3]); rect(c, bx - 1, by - 21, 1, 42, RAMP.steel[4]);
      rect(c, bx - 5, by - 34, 11, 14, INK); rect(c, bx - 4, by - 33, 9, 12, '#ff8a2a'); rect(c, bx - 4, by - 33, 9, 3, '#ffb070');
      rect(c, bx - 5, by + 20, 11, 14, INK); rect(c, bx - 4, by + 21, 9, 12, '#ff8a2a'); rect(c, bx - 4, by + 30, 9, 3, '#c0501a');
    }
    if (g.ouch && g.t - g.ouch < 1.5) shout(c, '¡AY!', 60, 40, g.t - g.ouch);
    txt(c, 'uñas: ' + g.cur + '/' + g.need, 6, 6, '#ffffff', { out: INK });
  },
  bot(g) { return { x: 128, y: 96, down: g.state === 'play' && g.blade > 1 - g.zone * .5 && fl(g.t * 30) % 4 === 0 }; },
});

// ---------------------------------------------------------------- 3 FOTO ----
function photoCornerBg() {
  return mdl('photoCorner', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    greenWall(g, 0, 0, SW, 150);
    drawS(g, wbSign({ noCrest: true }), SW / 2, 22);
    woodFloor(g, 0, 150, SW, 42); rect(g, 0, 148, SW, 2, RAMP.green[0]);
    // big chair, drawn at double size from the chair model
    const ch = velvetChair(); g.save(); g.translate(SW / 2 - ch.width, 190 - ch.height * 2); g.scale(2, 2); g.drawImage(ch, 0, 0); g.restore();
    return c;
  });
}
defMG({
  id: 'foto', stage: 'anahi', name: 'Foto para Insta', cmd: '¡FOTO!', how: 'Dispara cuando pose mirando a cámara', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .5, n: 'C5 . . G4 . . C5 . E5 . . D5 . . C5 . A4 . . F4 . . A4 . G4 - - - . . . .' },
    { i: 'vib', v: .45, n: 'E5+G5 . . . . . . . F5+A5 . . . . . . . F5+A5 . . . . . . . E5+G5 . . . D5+G5 . . .' },
    { i: 'bass', v: .8, n: 'C3 . . C3 . . G2 . F2 . . F2 . . C3 . F2 . . F2 . . C3 . G2 . . G2 . . D3 .' },
    { i: 'd', v: .6, n: 'k . z . s . z z k . z . s . z . k . z . s . z z k . z . s s s .' }] }),
  init(g) {
    // timeline of moods in beats; one real pose window
    const pw = [1.4, 1, .75][g.level - 1];
    const at = g.r(2.4, 4.2);
    g.win0 = at; g.win1 = at + pw;
    g.fake = g.level >= 3 ? at - 1.1 : -9;
    g.moods = ['away', 'scratch', 'yawn', 'sneeze'];
    g.shot = null; g.flashT = -1;
  },
  mood(g) {
    const b = g.b;
    if (b >= g.win0 && b < g.win1) return 'pose';
    if (b >= g.fake && b < g.fake + .5) return 'almost';
    return g.moods[fl(b / .9) % g.moods.length];
  },
  update(g) {
    if (g.state !== 'play') return;
    if (IN.tap) {
      const m = this.mood(g); g.shot = m; g.flashT = g.t; sfx('shutter'); flash('bot', '#ffffff', .12);
      g.snap = mkCanvas(SW, SH); g.snap.g.drawImage(MGC, 0, 0);
      if (m === 'pose') { g.win(); sfx('heart', { delay: .2 }); } else g.lose();
    }
  },
  draw(g, c) {
    c.drawImage(photoCornerBg(), 0, 0);
    const m = g.shot || this.mood(g), t = g.t;
    let ex = 'normal', tilt = 0, dx = 0, sy = 1;
    if (m === 'pose') { ex = 'happy'; tilt = Math.sin(t * 5) * .3 + .4; }
    else if (m === 'almost') { ex = 'wink'; tilt = .2; }
    else if (m === 'away') { ex = 'normal'; dx = Math.sin(t * 2) * 4; tilt = -.5; }
    else if (m === 'scratch') { ex = 'grr'; dx = Math.sin(t * 30) * 1.5; }
    else if (m === 'yawn') { ex = 'wow'; sy = 1.04; }
    else if (m === 'sneeze') { ex = 'dizzy'; dx = Math.sin(t * 40) * 1; }
    drawWestieSit(c, SW / 2 + dx, 150, ex, { tilt, sy });
    if (m === 'scratch') { const lx = SW / 2 + 22, ly = 118; c.fillStyle = '#ffffff'; disc(c, lx + Math.sin(t * 40) * 3, ly, 5, '#ffffff'); ringPx(c, lx + Math.sin(t * 40) * 3, ly, 5, INK); }
    if (m === 'yawn' && g.state === 'play') txt(c, 'Zzz', SW / 2 + 30, 44, '#ffffff', { out: INK });
    if (m === 'sneeze' && g.state === 'play') shout(c, '¡ACHÍS!', SW / 2 + 50, 50, (t * 2) % 1);
    if (m === 'pose' && g.state !== 'lost') for (let i = 0; i < 3; i++) drawStar(c, SW / 2 - 40 + i * 40, 50 + Math.sin(t * 8 + i) * 4, 3 + Math.sin(t * 12 + i) * 1.5, '#fff27a');
    // viewfinder
    if (!g.shot) {
      const K = '#ffffff';
      for (const [x, y, fx, fy] of [[8, 8, 1, 1], [SW - 9, 8, -1, 1], [8, SH - 9, 1, -1], [SW - 9, SH - 9, -1, -1]]) { rect(c, x, y, fx * 14, 2 * fy, K); rect(c, x, y, 2 * fx, fy * 14, K); }
      if (fl(t * 2) % 2) { disc(c, 20, 20, 3, '#ff4060'); txt(c, 'REC', 27, 17, '#ffffff', { out: INK }); }
      const fs = m === 'pose' ? 26 : 34 + Math.sin(t * 6) * 3; ringRect(c, SW / 2 - fs, 60 - fs * .7, fs * 2, fs * 1.4, 1, m === 'pose' ? '#5bd18b' : '#ffffff');
    } else if (g.snap) {
      // the shot: a polaroid pinned over the scene
      const k = spring(g.t - g.flashT, 2, 6), ok = g.state === 'won';
      c.save(); c.translate(SW / 2, SH / 2); c.rotate((ok ? -.08 : .1) * k); c.scale(.2 + .5 * k, .2 + .5 * k);
      rect(c, -SW / 2 - 10, -SH / 2 - 10, SW + 20, SH + 44, INK); rect(c, -SW / 2 - 9, -SH / 2 - 9, SW + 18, SH + 42, '#fffaf0');
      if (ok) c.drawImage(g.snap, -SW / 2, -SH / 2); else { c.globalAlpha = .35; for (let i = -4; i <= 4; i += 2) c.drawImage(g.snap, -SW / 2 + i * 3, -SH / 2 + i); c.globalAlpha = 1; }
      txt(c, ok ? '#MONÍSIMO' : '¡BORROSA!', 0, SH / 2 + 12, ok ? '#e05b98' : '#6b6977', { align: 'c', bold: true });
      c.restore();
    }
  },
  top(g, c) {
    if (!g.shot || g.state !== 'won') return;
    const k = clamp((g.t - g.flashT) / .6, 0, 1), likes = fl(k * 1234);
    panel(c, 150, 90, 96, 30, '#ffffff', { r: 8 }); drawHeart(c, 166, 104, '#ff4060', 1.2); txt(c, likes.toLocaleString('es-ES'), 178, 100, INK, { bold: true });
  },
  bot(g) { const m = this.mood(g); return { x: 128, y: 96, down: m === 'pose' && g.b > g.win0 + .15 }; },
});

// ---------------------------------------------------------------- 4 HELADO --
function aFrameSign() {
  return mdl('aframe', () => {
    const c = mkCanvas(52, 64), g = c.g, Wd = RAMP.wood;
    polyPx(g, [[4, 63], [14, 2], [38, 2], [48, 63], [44, 63], [36, 8], [16, 8], [8, 63]], INK);
    polyPx(g, [[5, 62], [15, 3], [37, 3], [47, 62], [44, 62], [36, 7], [16, 7], [8, 62]], Wd[3]);
    polyPx(g, [[9, 60], [17, 8], [35, 8], [43, 60]], '#1f2a26'); polyPx(g, [[11, 58], [18, 10], [34, 10], [41, 58]], '#26332e');
    txt(g, 'Tenemos', 26, 14, '#e8e8e0', { align: 'c' });
    tiny(g, 'HELADO', 26, 26, '#fff7ae', { align: 'c' });
    txt(g, 'gato', 26, 34, '#ffd1e4', { align: 'c' }); txt(g, '&', 26, 42, '#e8e8e0', { align: 'c' }); txt(g, 'perro', 26, 49, '#b3d9ff', { align: 'c' });
    return c;
  });
}
function grassBg() {
  return mdl('grassBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    // shop window + beige façade behind, artificial grass in front
    rect(g, 0, 0, SW, 120, '#e3cfaf'); for (let i = 0; i < 400; i++) px(g, hash2(i, 1) * SW, hash2(i, 2) * 120, '#d4bd98');
    rect(g, 30, 10, 196, 100, INK); rect(g, 32, 12, 192, 96, '#1f3a3f'); rect(g, 34, 14, 188, 92, '#2c5560');
    for (let i = 0; i < 6; i++) linePx(g, 60 + i * 30, 14, 40 + i * 30, 106, '#3d6f7a');
    rect(g, 0, 118, SW, 74, '#3e8f3a');
    for (let y = 118; y < SH; y += 2) for (let x = (y % 4); x < SW; x += 4) px(g, x, y, hash2(x, y) < .5 ? '#56ab4a' : '#2f7a2f');
    rect(g, 0, 118, SW, 2, '#2a6a2a');
    return c;
  });
}
function coneSpr() { return mdl('cone', () => spr(['kkkkkkkkkk', 'kyYyYyYyyk', '.kyYyYyYk.', '.kYyYyYyk.', '..kyYyYk..', '..kYyYyk..', '...kyYk...', '...kYyk...', '....kk....'], { k: INK, y: '#d58c4c', Y: '#f2b978' })); }
function scoopSpr(col) { return mdl('scoop' + col, () => { const c = mkCanvas(20, 16), g = c.g; disc(g, 10, 8, 8, INK); disc(g, 10, 8, 7, col); disc(g, 8, 6, 3, '#ffffff'); for (let x = 2; x < 19; x += 3) disc(g, x, 13, 2, col); px(g, 12, 5, '#c0662c'); px(g, 6, 10, '#c0662c'); return c; }); }
defMG({
  id: 'helado', stage: 'anahi', name: 'Helado perruno', cmd: '¡SIRVE!', how: 'Suelta la bola sobre el cucurucho', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .7, n: 'G5 E5 C5 E5 G5 . C6 . A5 F5 C5 F5 A5 . C6 . G5 E5 C5 E5 G5 . E6 . D6 . B5 . G5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . . . G2 . . . F2 . . . C3 . . . C3 . . . G2 . . . G2 . . . D3 . G2 .' },
    { i: 'd', v: .6, n: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s s s s' }] }),
  init(g) {
    g.need = g.level >= 2 ? 2 : 1; g.stack = 0; g.drop = null; g.missed = false;
    g.dogX = SW / 2; g.dogV = [0, 20, 32][g.level - 1] * g.tempo * (g.r() < .5 ? -1 : 1);
    g.swingT = g.r(TAU); g.cols = ['#ffb3d1', '#fff7ae', '#b3d9ff'];
    g.face = 'normal'; g.splats = [];
  },
  armX(g) { return SW / 2 + Math.sin(g.swingT) * 84; },
  update(g, dt) {
    g.swingT += dt * [2.2, 2.7, 3.2][g.level - 1] * g.tempo;
    if (g.state === 'play') { g.dogX += g.dogV * dt; if (g.dogX < 70 || g.dogX > 186) { g.dogV *= -1; g.dogX = clamp(g.dogX, 70, 186); } }
    const coneTop = 128 - g.stack * 11;
    if (g.drop) {
      const d = g.drop; d.vy += 700 * dt; d.y += d.vy * dt;
      if (d.y >= coneTop - 6 && !d.done) {
        if (Math.abs(d.x - g.dogX) < 13) { d.done = true; g.stack++; g.drop = null; sfx('pop', { pitch: .7 }); sfx('gulp', { delay: .1 }); HITSTOP = 2; g.fx.burst(g.dogX, coneTop, 10, { k: 'star', c: [C.yellow, '#fff', C.pinkL] }); g.squash = 1; if (g.stack >= g.need) { g.win(); g.face = 'love'; } }
        else if (d.y > 168) { d.done = true; g.splats.push({ x: d.x, col: d.col }); g.drop = null; sfx('squish', { pitch: .8 }); g.face = 'sad'; g.lose(); g.shake(2, .15); }
      }
    } else if (IN.tap && g.state === 'play') { g.drop = { x: this.armX(g), y: 26, vy: 0, col: g.cols[g.stack % 3] }; sfx('swoosh', { pitch: 1.4 }); }
    g.squash = Math.max(0, (g.squash || 0) - dt * 4);
  },
  draw(g, c) {
    c.drawImage(grassBg(), 0, 0);
    drawS(c, aFrameSign(), 34, 176, { ax: .5, ay: 1 });
    // steel water bowl
    ellipsePx(c, 222, 176, 16, 5, INK); ellipsePx(c, 222, 175, 15, 4, RAMP.steel[3]); ellipsePx(c, 222, 174, 11, 2.5, '#9bd6f7');
    for (const s of g.splats) { ellipsePx(c, s.x, 178, 14, 4, INK); ellipsePx(c, s.x, 177, 13, 3, s.col); }
    // the dog in profile, a cone standing up in its mouth
    const dx = g.dogX, bounce = g.squash * 3, face = g.dogV < 0 ? -1 : 1;
    const mood = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'normal';
    drawS(c, westieSide(1, g.state === 'won' ? 'wag' : 'stand', mood), dx - face * 34, 180 + bounce * .3, { ax: .5, ay: 1, flip: face < 0 });
    drawS(c, coneSpr(), dx, 128 + bounce, { ax: .5, ay: 0 });
    for (let i = 0; i < g.stack; i++) drawS(c, scoopSpr(g.cols[i % 3]), dx, 126 - i * 11 + bounce, { ax: .5, ay: .7, sy: i === g.stack - 1 ? 1 - g.squash * .3 : 1 });
    if (g.state === 'won') drawHeart(c, dx - face * 20, 100 - (g.t % 1) * 20, '#ff4060', 1.2);
    // swinging scoop dispenser
    const ax = this.armX(g);
    rect(c, 0, 4, SW, 4, INK); rect(c, 0, 5, SW, 2, RAMP.steel[3]);
    rect(c, ax - 6, 6, 12, 10, INK); rect(c, ax - 5, 7, 10, 8, '#ff93bf'); rect(c, ax - 5, 7, 10, 2, '#ffd1e4');
    if (!g.drop && g.state === 'play') drawS(c, scoopSpr(g.cols[g.stack % 3]), ax, 24, {});
    if (g.drop) drawS(c, scoopSpr(g.drop.col), g.drop.x, g.drop.y, { sy: 1 + Math.min(.3, g.drop.vy / 2000) });
    if (g.state === 'play' && !g.drop) { for (let y = 34; y < 120; y += 6) px(c, ax, y, 'rgba(255,255,255,.5)'); }
  },
  bot(g) {
    // predict where the dog will be when a scoop dropped now reaches the cone
    const fall = Math.sqrt(2 * Math.max(1, 128 - g.stack * 11 - 6 - 26) / 700);
    let dx = g.dogX + g.dogV * fall; if (dx < 70) dx = 140 - dx; if (dx > 186) dx = 372 - dx;
    return { x: 128, y: 96, down: !g.drop && Math.abs(this.armX(g) - dx) < 5 && g.state === 'play' };
  },
});

// ---------------------------------------------------------------- 5 BURBUJAS -
function bathBg() {
  return mdl('bathBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, SH);
    // shower hose + shelf of bottles
    thickLine(g, 222, 0, 222, 60, 2, INK); thickLine(g, 222, 0, 222, 60, 1, RAMP.steel[2]);
    for (const [x, col] of [[20, '#5bb593'], [32, '#ff93bf'], [44, '#63a0ef']]) { rect(g, x - 4, 30, 9, 18, INK); rect(g, x - 3, 31, 7, 16, col); rect(g, x - 2, 26, 5, 5, INK); rect(g, x - 1, 27, 3, 4, '#ffffff'); px(g, x - 2, 33, '#ffffff'); }
    rect(g, 10, 48, 46, 3, RAMP.wood[3]); rect(g, 10, 51, 46, 1, INK);
    return c;
  });
}
function tubFront(g, x, y, w) {
  // the salon's deep grey tub
  rect(g, x, y, w, SH - y, INK); rect(g, x + 1, y + 1, w - 2, SH - y, '#6b6977'); rect(g, x + 1, y + 1, w - 2, 3, '#9896a4'); rect(g, x + 1, y + 4, w - 2, 1, '#44424f');
  for (let i = x + 8; i < x + w - 8; i += 16) rect(g, i, y + 10, 1, SH - y - 10, '#5d5b69');
}
defMG({
  id: 'burbujas', stage: 'anahi', name: 'Burbujas', cmd: '¡EXPLOTA!', how: 'Revienta todas las pompas', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'C6 . G5 . E6 . G5 . D6 . G5 . F6 . E6 . C6 . G5 . E6 . G5 . D6 . B5 . C6 - . .' },
    { i: 'sub', v: .7, n: 'C3 . . . . . . . G2 . . . . . . . A2 . . . . . . . G2 . . . G2 . . .' },
    { i: 'd', v: .55, n: 'k . z z . . z . k . z z . . z z k . z z . . z . k . z z s . s .' }] }),
  init(g) {
    g.need = [5, 7, 9][g.level - 1]; g.popped = 0; g.bubbles = []; g.spawned = 0; g.spawnT = 0; g.combo = 0;
  },
  spawn(g) { const r = g.r(10, 16); g.bubbles.push({ x: g.r(30, 226), y: 170 + r, r, vy: -g.r(22, 40) * [1, 1.2, 1.45][g.level - 1] * g.tempo, ph: g.r(TAU), hue: g.r(TAU) }); g.spawned++; },
  update(g, dt) {
    g.spawnT -= dt;
    if (g.spawned < g.need && g.spawnT <= 0) { this.spawn(g); g.spawnT = .22 / g.tempo; }
    for (const b of g.bubbles) { b.y += b.vy * dt; b.ph += dt * 3; b.x += Math.sin(b.ph) * .3; if (b.y < -b.r) { b.y = 180 + b.r; b.x = g.r(30, 226); } }
    if (IN.tap && g.state === 'play') {
      let hit = null; for (const b of g.bubbles) if (dist(IN.x, IN.y, b.x, b.y) < b.r + 8) { hit = b; break; }
      if (hit) {
        g.bubbles.splice(g.bubbles.indexOf(hit), 1); g.popped++;
        sfx('pop', { pitch: .8 + g.popped * .12 }); buzz(6);
        g.fx.add({ k: 'ring', x: hit.x, y: hit.y, r: hit.r * .8, grow: 10, life: .25, c: '#ffffff' });
        g.fx.burst(hit.x, hit.y, 8, { k: 'drop', c: ['#dff4ff', '#9bd6f7'], sp0: 40, sp1: 110, g: 300, life0: .3, life1: .5 });
        if (g.popped >= g.need) { g.win(); g.fx.burst(128, 150, 20, { k: 'bubble', c: '#ffffff', sp0: 40, sp1: 140, r: 4 }); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(bathBg(), 0, 0);
    // the westie in the tub, foam hat
    drawS(c, buleHead(g.state === 'won' ? 'happy' : g.popped > 0 ? 'wink' : 'normal'), SW / 2, 128 + Math.sin(g.t * 4) * 1.5, {});
    for (const [dx, dy, r] of [[-12, -30, 8], [0, -36, 10], [12, -30, 8], [22, -24, 6], [-20, -22, 6]]) { disc(c, SW / 2 + dx, 128 + dy, r + 1, '#b9cad0'); disc(c, SW / 2 + dx, 128 + dy, r, '#ffffff'); }
    tubFront(c, 20, 146, 216);
    for (let x = 22; x < 234; x += 7) { disc(c, x, 147 + Math.sin(x + g.t * 3) * 1.5, 5, '#ffffff'); ringPx(c, x, 147 + Math.sin(x + g.t * 3) * 1.5, 5, '#dce7ea'); }
    for (const b of g.bubbles) {
      const cols = ['#ff93bf', '#9bd6f7', '#fff7ae', '#94dcbc'], ci = fl((b.hue + g.t * 2) % 4), r = b.r;
      c.globalAlpha = .22; disc(c, b.x, b.y, r, '#ffffff'); c.globalAlpha = 1;
      ringPx(c, b.x, b.y, r, INK); ringPx(c, b.x, b.y, r - 1, cols[ci]); ringPx(c, b.x, b.y, r - 2, cols[(ci + 1) % 4]);
      for (let a = 3.6; a < 4.6; a += .12) px(c, b.x + Math.cos(a) * (r - 3.5), b.y + Math.sin(a) * (r - 3.5), '#ffffff');
      disc(c, b.x - r * .45, b.y - r * .45, 1.5, '#ffffff');
    }
    txt(c, g.popped + '/' + g.need, SW - 8, 6, '#ffffff', { align: 'r', out: INK, bold: true });
  },
  bot(g) { const b = g.bubbles.find(b => b.y < 160 && b.y > 10); if (!b) return { down: false }; return { x: b.x, y: b.y + b.vy * .02, down: fl(g.t * 20) % 3 === 0 }; },
});

// ---------------------------------------------------------------- 6 TOPOS ---
// whack-a-dog: muddy westies pop out of bubble tubs (also the prologue's first "¡TOCA!")
defMG({
  id: 'topos', stage: 'anahi', name: 'Lavado exprés', cmd: '¡LAVA!', how: 'Toca los perros sucios cuando asomen', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'C5 . D5 . E5 . C5 . G5 - E5 . C5 . . . A4 . C5 . F5 . E5 . D5 - B4 . G4 . . .' },
    { i: 'bass', v: .85, n: 'C3 . C3 . G2 . G2 . C3 . C3 . E3 . G3 . F2 . F2 . C3 . C3 . G2 . G2 . B2 . D3 .' },
    { i: 'd', v: .7, n: 'k . h . s . h . k k h . s . h . k . h . s . h . k k h . s s s s' }] }),
  init(g) {
    g.need = [3, 4, 5][g.level - 1]; g.washed = 0;
    g.holes = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) g.holes.push({ x: 50 + i * 78, y: 88 + j * 72, up: 0, st: 'down', t: 0, dur: 0, kind: 'mud' });
    g.nextT = .2;
  },
  update(g, dt) {
    const sp = [1, 1.2, 1.4][g.level - 1] * g.tempo;
    g.nextT -= dt;
    if (g.nextT <= 0 && g.state === 'play') {
      const free = g.holes.filter(h => h.st === 'down'); if (free.length) { const h = g.pick(free); h.st = 'rise'; h.t = 0; h.dur = g.r(.9, 1.3) / sp; h.kind = g.level >= 3 && g.r() < .2 ? 'cat' : 'mud'; sfx('boing', { pitch: 1.6, vol: .3 }); }
      g.nextT = g.r(.25, .45) / sp;
    }
    for (const h of g.holes) {
      h.t += dt;
      if (h.st === 'rise') { h.up = Math.min(1, h.up + dt * 7 * sp); if (h.up >= 1) { h.st = 'up'; h.t = 0; } }
      else if (h.st === 'up') { if (h.t > h.dur) { h.st = 'sink'; } }
      else if (h.st === 'sink' || h.st === 'clean') { h.up = Math.max(0, h.up - dt * (h.st === 'clean' ? 3 : 6) * sp); if (h.up <= 0) { h.st = 'down'; } }
    }
    if (IN.tap && g.state === 'play') {
      for (const h of g.holes) if ((h.st === 'up' || h.st === 'rise') && Math.abs(IN.x - h.x) < 26 && IN.y > h.y - 50 * h.up - 10 && IN.y < h.y + 8) {
        if (h.kind === 'cat') { sfx('whine', { pitch: 1.8 }); g.fx.add({ k: 'txt', s: '¡MIAU!', x: h.x, y: h.y - 50, life: .7, c: '#ffd1e4' }); g.lose(); break; }
        h.st = 'clean'; g.washed++; sfx('splash', { vol: .5 }); sfx('sparkle', { pitch: 1 + g.washed * .1 }); HITSTOP = 2; buzz(8);
        g.fx.burst(h.x, h.y - 30, 12, { k: 'bubble', c: '#ffffff', sp0: 40, sp1: 120, r: 3 });
        g.fx.burst(h.x, h.y - 30, 8, { k: 'star', c: [C.yellow, '#fff'] });
        if (g.washed >= g.need) g.win();
        break;
      }
    }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#dce7ea'); subwayTiles(c, 0, 0, SW, 60);
    rect(c, 0, 60, SW, SH - 60, '#b9cad0'); for (let y = 62; y < SH; y += 12) for (let x = (y / 12 % 2) * 12; x < SW; x += 24) rect(c, x, y, 12, 12, '#c9d8dd');
    for (const h of g.holes) {
      ellipsePx(c, h.x, h.y + 2, 30, 9, INK); ellipsePx(c, h.x, h.y, 29, 8, '#6b6977'); ellipsePx(c, h.x, h.y - 1, 25, 5.5, '#3d6f7a'); ellipsePx(c, h.x - 4, h.y - 2, 14, 2.5, '#5aaee6');
      if (h.up > 0) {
        c.save(); c.beginPath(); c.rect(h.x - 32, h.y - 90, 64, 90); c.clip();
        const y = h.y + 40 - h.up * 52;
        if (h.kind === 'cat') drawCatHead(c, h.x, y);
        else drawS(c, buleHead(h.st === 'clean' ? 'happy' : 'grr', h.st === 'clean' ? RAMP.fur : RAMP.mud), h.x, y, { s: 1 });
        c.restore();
      }
      // foam rim in front
      for (let i = -24; i <= 24; i += 8) { disc(c, h.x + i, h.y + 4, 4, '#ffffff'); }
    }
    txt(c, 'Lavados: ' + g.washed + '/' + g.need, 6, 6, INK, { bold: true });
  },
  bot(g) { const h = g.holes.find(h => (h.st === 'up') && h.kind === 'mud'); if (!h) return { down: false }; return { x: h.x, y: h.y - 30, down: fl(g.t * 20) % 3 === 0 }; },
});
function drawCatHead(g, x, y) {
  const img = mdl('catHead', () => {
    const B = RAMP.black;
    const head = SD.ellipse(32, 32, 17, 15), eL = SD.grow(SD.poly([[17, 24], [18, 8], [29, 19]]), 1.5), eR = SD.grow(SD.poly([[47, 24], [46, 8], [35, 19]]), 1.5);
    return model(64, 56, [{ f: eL, ramp: B, z: 0, th: 3 }, { f: eR, ramp: B, z: 0, th: 3 }, { f: head, ramp: B, z: 1, th: 12 }], { post: g => { for (const ex of [24, 37]) { rect(g, ex, 28, 4, 5, '#c8f05a'); rect(g, ex + 1, 29, 2, 4, INK); px(g, ex, 28, '#ffffff'); } polyPx(g, [[30, 36], [34, 36], [32, 38]], '#ff93bf'); hline(g, 29, 35, 40, '#5f5883'); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) linePx(g, 32 + s * 6, 37 + i, 32 + s * 16, 35 + i * 2, '#9896a4'); } });
  });
  drawS(g, img, x, y);
}
