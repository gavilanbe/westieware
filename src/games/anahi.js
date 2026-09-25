// ============================================================================
//  Microgames of ANAHÍ's stage (¡TOCA!). The boss (¡PREPARA EL PERRO!, Lady Di
//  before the 12:00 show) lives in anahi_boss.js.
//  Every game here has a hint(g) → { x, y, mech } for the ghost hand.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared art
// the salon's rubber stamp, slammed onto the scene when a job is judged: Westie
// green for a job well done, red for a mess (same family as Hacienda's APROBADO).
// t = seconds since the verdict; (x, y) = its centre
const ANA_OK = '#2a9a5a', ANA_KO = '#e0283c';
const ANA_SCRATCH = mkCanvas(1, 1); // to prebuild pictures by drawing them once, off screen
function anaStamp(c, word, t, ok, x = SW / 2, y = 56, rot) {
  if (!(t >= 0)) return; // no verdict yet (or a timeout: the bath bomb says it all)
  const k = clamp(t / .14, 0, 1), img = hacStamp(word, ok ? ANA_OK : ANA_KO);
  const s = k < 1 ? lerp(2.4, 1, E.inQ(k)) : 1 + Math.max(0, .06 - (t - .14) * .3) * Math.sin((t - .14) * 40);
  c.globalAlpha = k < 1 ? .4 + .6 * k : 1;
  drawS(c, img, x, y, { rot: rot != null ? rot : ok ? -.1 : .08, s });
  c.globalAlpha = 1;
}
// call on the verdict: the thump of the stamp lands a beat after
function anaStampHit(g, ok) { g.stampT = g.t; g.stampOk = ok; sfx('stamp', { delay: .12 }); if (typeof after === 'function') after(.14, () => { if (g.shake) g.shake(ok ? 2 : 3, .15); }); }
function splatSpr() { return mdl('splat', () => spr(['.k...k.', 'k.kkk.k', '.kbbbk.', 'kbbBbbk', '.kbbbk.', 'k.kkk.k', '.k...k.'], { k: INK, b: '#5b3a1d', B: '#a07748' })); }

// ---------------------------------------------------------------- 1 PULGAS --
// Keiko on the grooming table, fleas hopping on her coat: squash them all
function pulgasBg() {
  return mdl('pulgasBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 150);
    // the gilt mirror behind, the grooming arm
    drawPortalFrame(g, 'mirror', 150, 18, 98, 70, 0); rect(g, 150, 18, 98, 70, '#dfe9ee'); for (let i = 0; i < 4; i++) linePx(g, 168 + i * 18, 18, 150 + i * 18, 87, '#f5fbfd');
    rect(g, 22, 40, 4, 128, RAMP.steel[1]); rect(g, 23, 40, 1, 128, RAMP.steel[3]); rect(g, 22, 40, 60, 4, RAMP.steel[1]); rect(g, 22, 41, 60, 1, RAMP.steel[3]);
    woodFloor(g, 0, 150, SW, 42); rect(g, 0, 148, SW, 2, '#b9cad0');
    groomTable(g, 128, 164, 150);
    return c;
  });
}
// a cheeky flea, ~16x12: shiny brown body, big eye, angry brow, busy legs
function drawFlea(g, x, y, f, flip) {
  const d = flip ? -1 : 1, lx = (n) => x + d * n;
  for (let i = 0; i < 3; i++) { const lg = (f + i) % 2 ? 2 : 0; linePx(g, lx(-3 + i * 3), y + 3, lx(-5 + i * 3 + lg), y + 7, INK); }
  ellipsePx(g, x, y, 7, 5.5, INK); ellipsePx(g, x, y, 6, 4.5, '#6b4424'); ellipsePx(g, x - d, y - 1.5, 3.5, 2, '#a86f3a'); px(g, lx(-3), y - 3, '#e8b27a');
  disc(g, lx(6), y - 2, 3.6, INK); disc(g, lx(6), y - 2, 2.8, '#6b4424');
  rect(g, lx(6) - 1, y - 4, 3, 3, '#ffffff'); px(g, lx(7), y - 3, INK); linePx(g, lx(4), y - 6, lx(8), y - 5, INK);
  linePx(g, lx(7), y - 4, lx(10), y - 9, INK); linePx(g, lx(8), y - 4, lx(12), y - 7, INK);
}
defMG({
  id: 'pulgas', stage: 'anahi', name: 'Pulgas fuera', cmd: '¡APLASTA!', how: 'Toca cada pulga que salta sobre Keiko', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p12', v: .55, n: 'E5 . E5 . G5 . E5 . D5 . C5 . D5 - . . E5 . E5 . G5 . A5 . G5 . E5 . C5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . E3 . G3 . A3 . F3 . A3 . C4 . A3 . C3 . E3 . G3 . A3 . G3 . F3 . E3 . D3 .' },
    { i: 'd', v: .7, n: 'k . h h s . h h k . h h s . h s k . h h s . h h k . h h s s s s' }] }),
  init(g) {
    const n = [2, 3, 4][g.level - 1];
    g.fleas = [];
    for (let i = 0; i < n; i++) g.fleas.push(this.spot(g, { dead: false, jump: 0, sit: g.r(.3, .8), f: 0, flip: g.r() < .5 }));
    g.bounce = 0; g.scr = 0;
    hacStamp('¡SIN PULGAS!', ANA_OK); keikoSide(2, 'wag', 'happy'); // built now, not mid-game
  },
  // landing spots on Keiko's coat (back, flank, head)
  spot(g, q) {
    if (g.r() < .2) { q.x = g.r(160, 186); q.y = g.r(58, 70); }
    else { const x = g.r(86, 152), top = 106 - 25 * Math.sqrt(Math.max(0, 1 - ((x - 120) / 42) ** 2)); q.x = x; q.y = top + g.r(6, 24); }
    return q;
  },
  update(g, dt) {
    const sp = [1, 1.25, 1.55][g.level - 1] * g.tempo;
    g.bounce = Math.max(0, g.bounce - dt * 4); g.scr += dt;
    for (const f of g.fleas) {
      if (f.dead) { f.dt = (f.dt || 0) + dt; continue; }
      if (f.jump > 0) {
        f.jump += dt * 3 * sp; const k = Math.min(1, f.jump);
        f.x = lerp(f.x0, f.x1, k); f.y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * f.h;
        if (k >= 1) { f.jump = 0; f.sit = g.r(.35, .8) / sp; g.fx.add({ k: 'puff', x: f.x, y: f.y + 4, r: 3, life: .25, c: '#ffffff' }); }
      } else {
        f.sit -= dt;
        if (f.sit <= 0 && g.state === 'play') { f.x0 = f.x; f.y0 = f.y; this.spot(g, f); f.x1 = f.x; f.y1 = f.y; f.flip = f.x1 < f.x0; f.x = f.x0; f.y = f.y0; f.h = g.r(22, 50); f.jump = .001; sfx('boing', { pitch: 2.4, vol: .25 }); }
      }
      f.f = (f.f + dt * (f.jump > 0 ? 20 : 9)) % 2;
    }
    if (IN.tap && g.state === 'play') {
      let best = null, bd = 18;
      for (const f of g.fleas) if (!f.dead) { const d = dist(IN.x, IN.y, f.x, f.y); if (d < bd) { bd = d; best = f; } }
      if (best) {
        best.dead = true; best.dt = 0; HITSTOP = 3; sfx('squish', { pitch: 1 + g.fleas.filter(f => f.dead).length * .12 }); buzz(8);
        g.fx.burst(best.x, best.y, 10, { k: 'star', c: [C.yellow, '#fff'], sp0: 40, sp1: 100, life0: .25, life1: .45 });
        g.fx.add({ k: 'txt', s: '¡PAF!', x: best.x, y: best.y - 12, life: .5, c: '#ffffff' });
        g.bounce = 1; g.shake(1.5, .1);
        if (g.fleas.every(f => f.dead)) {
          g.win(); anaStampHit(g, true); sfx('bark', { pitch: 1.3, delay: .15 });
          for (let i = 0; i < 6; i++) g.fx.add({ k: 'heart', x: 176 + g.r(-20, 20), y: 50, vx: g.r(-20, 20), vy: g.r(-60, -30), life: 1, c: C.pink });
          g.fx.burst(120, 100, 16, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 40, sp1: 130 });
        }
      } else g.fx.add({ k: 'ring', x: IN.x, y: IN.y, r: 3, life: .25, c: '#ffffff' });
    }
  },
  draw(g, c) {
    c.drawImage(pulgasBg(), 0, 0);
    const itchy = g.state !== 'won', mood = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'itchy';
    const jig = itchy && g.state === 'play' ? Math.sin(g.t * 30) * .8 : 0;
    drawS(c, keikoSide(2, g.state === 'won' ? 'wag' : 'stand', mood), 128 + jig, 164 - g.bounce * 3, { ax: .5, ay: 1 });
    if (itchy && g.state === 'play') { if (fl(g.t * 5) % 2) txt(c, '¡Me pica!', 190, 30, '#ffffff', { align: 'c', out: INK, bold: true }); for (let i = 0; i < 3; i++) { const a = g.t * 9 + i * 2; linePx(c, 80 + Math.cos(a) * 6, 132 + Math.sin(a) * 4, 84 + Math.cos(a) * 9, 136 + Math.sin(a) * 6, INK); } }
    for (const f of g.fleas) {
      if (f.dead) { if (f.dt < .6) drawS(c, splatSpr(), f.x, f.y, { alpha: 1 - f.dt / .6, s: 1.6 }); continue; }
      if (f.jump > 0) shadowOval(c, lerp(f.x0, f.x1, Math.min(1, f.jump)), lerp(f.y0, f.y1, Math.min(1, f.jump)) + 6, 5, 1.5, .6);
      drawFlea(c, rd(f.x), rd(f.y), fl(f.f), f.flip);
    }
    const dead = g.fleas.filter(f => f.dead).length, n = g.fleas.length;
    panel(c, 6, 6, 62, 18, '#ffffff', { r: 5 }); drawFlea(c, 18, 15, 0, false); txt(c, dead + '/' + n, 30, 11, dead === n ? ANA_OK : INK, { bold: true });
    // a clean, shiny coat once they're all gone
    if (g.state === 'won') { const st = g.t - g.decidedAt; for (let i = 0; i < 4; i++) { const a = st * 3 + i * 1.6; drawStar(c, 100 + i * 22 + Math.cos(a) * 4, 96 + Math.sin(a * 1.3) * 12, 2 + Math.sin(st * 9 + i) * 1.2, '#fff27a'); } }
    if (g.state === 'won') anaStamp(c, '¡SIN PULGAS!', g.t - g.stampT, true, 118, 50);
  },
  bot(g) { const f = g.fleas.find(f => !f.dead && f.jump === 0); if (!f) return { down: false }; return { x: f.x, y: f.y, down: fl(g.t * 10) % 3 === 0 }; },
  hint(g) { const f = g.fleas.find(f => !f.dead) || g.fleas[0]; return { x: f.x, y: f.y, mech: 'tap' }; },
});

// ---------------------------------------------------------------- 2 UÑAS ----
const UNAS_TOES = [[110, 54], [122, 82], [122, 112], [110, 140]];
function pawBig() {
  return mdl('pawBig', () => {
    const F = RAMP.fur;
    const leg = SD.capsule(-30, 104, 66, 98, 34, 30);
    const pad = SD.smooth(8, SD.ellipse(88, 96, 30, 42), leg);
    const toes = UNAS_TOES.map(([x, y]) => SD.circle(x, y, 14));
    const toeU = SD.union(...toes);
    const all = SD.shag(SD.smooth(5, pad, toeU), 2.2, .12, 5);
    const tx = clumpTex(6, .3, 4, 1.2);
    return model(SW, SH, [{ f: all, fs: SD.smooth(5, pad, toeU), ramp: F, z: 1, th: 26, tex: tx }]);
  });
}
function anaHandBig() {
  return mdl('anaHandBig', () => {
    const SK = RAMP.skin;
    const palm = SD.smooth(5, SD.ellipse(62, 160, 32, 17), SD.capsule(-10, 182, 36, 170, 17, 15));
    const thumb = SD.capsule(78, 154, 100, 136, 7.5, 6.5);
    return model(SW, SH, [{ f: palm, ramp: SK, z: 1, th: 12 }, { f: thumb, ramp: SK, z: 2, th: 6 }], {
      post: g => { for (let x = 4; x < 26; x++) { px(g, x, 170 + (x % 3 === 0 ? 1 : 0), RAMP.gold[3]); px(g, x, 171, RAMP.gold[4]); px(g, x, 172, RAMP.gold[1]); } disc(g, 98, 138, 2.5, '#ffd0c4'); },
    });
  });
}
// a calm dark-green backdrop with a spotlight where Anahí checks the quick
function unasBg() {
  return mdl('unasBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, G = RAMP.green;
    rect(g, 0, 0, SW, SH, G[1]);
    for (let x = -SH; x < SW; x += 12) linePx(g, x, SH, x + SH, 0, G[0]);
    for (let r = 90; r > 0; r -= 15) { g.globalAlpha = .08; disc(g, 180, 100, r, '#fff7ae'); } g.globalAlpha = 1;
    return c;
  });
}
// the "OK" paw from the user's video: index toe and dewclaw make the O, beans out
function okPaw() {
  return mdl('okPaw', () => {
    const F = RAMP.fur;
    const leg = SD.capsule(66, 172, 64, 118, 27, 26), palm = SD.ellipse(64, 104, 32, 26);
    const ring = SD.sub(SD.circle(40, 70, 16), SD.circle(40, 70, 7));
    const toes = SD.union(SD.capsule(62, 88, 62, 42, 10, 9), SD.capsule(80, 92, 88, 50, 9.5, 8.5), SD.capsule(94, 100, 106, 66, 9, 8));
    const handS = SD.smooth(6, SD.smooth(5, leg, palm), SD.union(ring, toes));
    const hand = SD.shag(handS, 1.6, .16, 7);
    return model(130, 176, [{ f: hand, fs: handS, ramp: F, z: 1, th: 20, tex: clumpTex(6, .3, 9, 1.2) }], { post: g => {
      const P = RAMP.pink;
      // big heart-shaped main bean + toe beans
      for (const [x, y] of [[57, 104], [71, 104]]) { disc(g, x, y, 8, P[1]); disc(g, x, y, 7, P[2]); }
      polyPx(g, [[50, 106], [78, 106], [64, 122]], P[2]); disc(g, 60, 101, 2.5, P[3]);
      for (const [x, y, r] of [[62, 46, 5.5], [87, 55, 5], [104, 70, 4.5]]) { disc(g, x, y, r + 1, P[1]); disc(g, x, y, r, P[2]); px(g, x - 1, y - 1, P[4]); }
      // black claws peeking over the toes and the O
      for (const [x, y] of [[62, 32], [89, 41], [108, 57], [30, 58]]) { polyPx(g, [[x - 3, y + 4], [x + 3, y + 4], [x, y - 3]], INK); px(g, x - 1, y + 2, '#6e6390'); }
    } });
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
    okPaw(); // the victory paw is heavy: build it before the game starts
  },
  // claw centre line: from the toe, 48px long, hooking down; radius tapers
  clawAt(i, t) { const [x, y] = UNAS_TOES[i]; return [x + 12 + t * 58, y - 1 + t * t * 13 + (i - 1.5) * t * 7, 5.4 - t * 3.8]; },
  update(g, dt) {
    g.jerk = Math.max(0, g.jerk - dt * 3);
    if (g.state !== 'play') return;
    const ph = (g.t / g.period) % 1; g.blade = .5 - .5 * Math.cos(ph * TAU);
    if (IN.tap) {
      const ni = g.order[g.cur], safe = g.blade >= 1 - g.zone;
      if (safe) {
        const [bx, by] = this.clawAt(ni, g.blade);
        g.nails[ni].cut = true; g.nails[ni].at = g.blade; sfx('snip'); buzz(10); HITSTOP = 3;
        g.flyers.push({ x: bx + 6, y: by, vx: g.r(60, 120), vy: g.r(-160, -90), rot: 0, len: (1 - g.blade) * 58 + 4 });
        g.fx.burst(bx, by, 10, { k: 'star', c: [C.yellow, '#fff', C.mint], sp0: 50, sp1: 120 });
        g.fx.add({ k: 'txt', s: '¡CLIC!', x: bx, y: by - 16, life: .5, c: '#ffffff' });
        g.cur++; if (g.cur >= g.need) { g.win(); sfx('boing', { pitch: 1.3, delay: .16 }); sfx('ding', { delay: .3 }); }
      } else { g.ouch = g.t; g.jerk = 1; sfx('whine', { pitch: 1.1 }); g.shake(4, .3); g.lose(); }
    }
    for (const f of g.flyers) { f.vy += 500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += dt * 14; }
  },
  draw(g, c) {
    c.drawImage(unasBg(), 0, 0);
    if (g.state === 'won' && g.t - g.decidedAt > .16) {
      // job done: the paw pops up and says OK
      const k = spring(g.t - g.decidedAt - .16, 2.4, 6);
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + g.t * .6; polyPx(c, [[128, 110], [128 + Math.cos(a - .1) * 220, 110 + Math.sin(a - .1) * 220], [128 + Math.cos(a + .1) * 220, 110 + Math.sin(a + .1) * 220]], '#3a3258'); }
      drawS(c, okPaw(), 128, SH + 6 + (1 - k) * 90, { ax: .5, ay: 1, rot: Math.sin(g.t * 5) * .04 });
      shout(c, '¡OK!', 196, 52, g.t - g.decidedAt - .3);
      return;
    }
    const jx = -g.jerk * 30;
    c.save(); c.translate(rd(jx), 0);
    // nails first: long curved black claws; the quick (el vivo) is the pink vein inside
    const qk = 1 - g.zone, tgt = g.state === 'play' ? g.order[g.cur] : -1, pulse = .5 + .5 * Math.sin(g.t * 12);
    for (let i = 0; i < 4; i++) {
      const cut = g.nails[i].cut, end = cut ? g.nails[i].at : 1, isT = i === tgt && !cut;
      const P = t => this.clawAt(i, t);
      if (isT) { c.globalAlpha = .35 + .25 * pulse; for (let q = qk; q <= 1; q += .02) { const [x, y, r] = P(q); disc(c, x, y, r + 5, '#8dffb0'); } c.globalAlpha = 1; }
      for (let q = 0; q <= end; q += .02) { const [x, y, r] = P(q); disc(c, x, y, r + 1, isT ? '#ffffff' : INK); }
      for (let q = 0; q <= end; q += .02) { const [x, y, r] = P(q); disc(c, x, y, r, '#2b2540'); }
      for (let q = .05; q <= end - .04; q += .02) { const [x, y, r] = P(q); px(c, x, y - r + 1, '#6e6390'); }
      for (let q = .02; q <= Math.min(qk, end); q += .015) { const [x, y, r] = P(q); disc(c, x, y + .5, Math.max(.8, r * .42), '#ff6b8a'); }
      if (isT && g.level < 3) {
        // a dotted cut line where the quick ends
        const [cx0, cy0] = P(qk + .04), [ax, ay] = P(qk + .06), nx = -(ay - cy0), ny = ax - cx0, nl = Math.hypot(nx, ny) || 1;
        for (let k = -9; k <= 9; k += 3) px(c, rd(cx0 + nx / nl * k), rd(cy0 + ny / nl * k), fl(g.t * 8 + k) % 2 ? '#ffffff' : '#5bd18b');
      }
      if (isT && g.level === 1) {
        const [gx, gy] = P((qk + 1) / 2 + .06), [rx, ry] = P(qk * .45);
        panel(c, gx - 17, gy - 22, 34, 11, '#5bd18b', { r: 3 }); tiny(c, 'CORTA', gx, gy - 19, INK, { align: 'c' });
        panel(c, rx - 14, ry - 22, 28, 11, '#ff4060', { r: 3 }); tiny(c, 'VIVO', rx, ry - 19, '#ffffff', { align: 'c' });
      }
    }
    c.drawImage(pawBig(), 0, 0);
    c.drawImage(anaHandBig(), 0, 0);
    c.restore();
    for (const f of g.flyers) { c.save(); c.translate(rd(f.x), rd(f.y)); c.rotate(f.rot); rect(c, -f.len / 2, -2, f.len, 4, INK); rect(c, -f.len / 2 + 1, -1, f.len - 2, 2, '#40395e'); px(c, f.len / 2 - 1, 0, INK); c.restore(); }
    // the blue scissor-clipper (as in the video) riding along the target nail
    if (g.state === 'play') {
      const [bx, by] = this.clawAt(g.order[g.cur], g.blade), safe = g.blade >= 1 - g.zone;
      for (const [dx, col] of [[-6, '#3565cc'], [5, '#63a0ef']]) { thickLine(c, bx + dx * .4, by + 8, bx + dx + 12, by + 50, 4.6, INK); thickLine(c, bx + dx * .4, by + 8, bx + dx + 12, by + 50, 3.4, col); px(c, bx + dx * .4 + 5, by + 24, '#bcd8ff'); }
      disc(c, bx + 4, by + 24, 2.8, INK); disc(c, bx + 4, by + 24, 1.8, RAMP.steel[3]);
      ringPx(c, bx, by, 9, INK); ringPx(c, bx, by, 8, RAMP.steel[2]); ringPx(c, bx, by, 7, RAMP.steel[4]); ringPx(c, bx, by, 6, INK);
      disc(c, bx - 6, by - 6, 1.5, '#ffffff');
      // a traffic light on the clipper: green = safe to cut
      disc(c, bx + 10, by - 10, 4, INK); disc(c, bx + 10, by - 10, 3, safe ? '#5bd18b' : '#ff4060'); px(c, bx + 9, by - 11, '#ffffff');
    }
    if (g.ouch && g.t - g.ouch < 1.5) shout(c, '¡AY!', 60, 40, g.t - g.ouch);
    panel(c, 6, 6, 62, 18, '#ffffff', { r: 5 }); for (let i = 0; i < g.need; i++) { const x = 16 + i * 10, done = i < g.cur; polyPx(c, [[x - 3, 19], [x + 3, 19], [x, 10]], INK); if (!done) polyPx(c, [[x - 2, 18], [x + 2, 18], [x, 12]], '#6e6390'); else { rect(c, x - 3, 14, 7, 6, '#ffffff'); linePx(c, x - 3, 13, x + 3, 13, '#5bd18b'); } }
    txt(c, g.cur + '/' + g.need, 64, 11, INK, { bold: true, align: 'r' });
  },
  bot(g) { return { x: 128, y: 96, down: g.state === 'play' && g.blade > 1 - g.zone * .5 && fl(g.t * 30) % 4 === 0 }; },
  hint(g) { const [x, y] = this.clawAt(g.order[g.cur] || 0, 1 - g.zone * .5); return { x, y, mech: 'tap' }; },
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
    g.moods = shuffle(['away', 'scratch', 'yawn', 'sneeze']);
    g.shot = null; g.flashT = -1; g.posed = false;
  },
  mood(g) {
    const b = g.b;
    if (b >= g.win0 && b < g.win1) return 'pose';
    if (b >= g.fake && b < g.fake + .5) return 'almost';
    return g.moods[fl(b / .9) % g.moods.length];
  },
  update(g) {
    if (g.state !== 'play') return;
    // a little chime the instant she strikes the pose (your cue)
    if (!g.posed && this.mood(g) === 'pose') { g.posed = true; sfx('sparkle', { vol: .7 }); }
    if (IN.tap) {
      const m = this.mood(g); g.shot = m; g.flashT = g.t; sfx('shutter'); flash('bot', '#ffffff', .12);
      g.snap = mkCanvas(SW, SH); this.scene(g, g.snap.g, m, false);
      if (m === 'pose') { g.win(); sfx('heart', { delay: .2 }); } else g.lose();
    }
  },
  // the photo corner and Keiko in her current mood (also what the snapshot shows)
  scene(g, c, m, live) {
    c.drawImage(photoCornerBg(), 0, 0);
    const t = g.t;
    let ex = 'normal', tilt = 0, dx = 0, sy = 1;
    if (m === 'pose') { ex = 'happy'; tilt = Math.sin(t * 5) * .3 + .4; }
    else if (m === 'almost') { ex = 'wink'; tilt = .2; }
    else if (m === 'away') { ex = 'normal'; dx = Math.sin(t * 2) * 4; tilt = -.5; }
    else if (m === 'scratch') { ex = 'grr'; dx = Math.sin(t * 30) * 1.5; }
    else if (m === 'yawn') { ex = 'wow'; sy = 1.04; }
    else if (m === 'sneeze') { ex = 'dizzy'; dx = Math.sin(t * 40) * 1; }
    drawKeikoSit(c, SW / 2 + dx, 150, ex, { tilt, sy });
    if (m === 'away') { const bx = 40 + Math.sin(t * 2.4) * 16, by = 60 + Math.sin(t * 4.8) * 10, fl2 = fl(t * 12) % 2; for (const s2 of [-1, 1]) polyPx(c, [[bx, by], [bx + s2 * (fl2 ? 7 : 4), by - 6], [bx + s2 * (fl2 ? 6 : 3), by + 4]], s2 < 0 ? '#ff93bf' : '#fff27a'); vline(c, bx, by - 3, by + 3, INK); txt(c, '?', SW / 2 - 34, 40, '#ffffff', { out: INK, bold: true }); }
    if (m === 'scratch') { const lx = SW / 2 + 24, ly = 120 + Math.sin(t * 40) * 3; disc(c, lx, ly, 6, INK); disc(c, lx, ly, 5, '#ffffff'); for (let i = 0; i < 3; i++) linePx(c, lx + 8, ly - 6 + i * 5, lx + 14, ly - 8 + i * 5, INK); if (live && FRAME % 6 === 0) g.fx.add({ k: 'puff', x: lx, y: ly, vx: g.r(10, 30), vy: -10, r: 2, life: .3, c: '#ffffff' }); }
    if (m === 'yawn' && g.state === 'play') txt(c, 'Zzz', SW / 2 + 30, 44 - (t * 10 % 6), '#ffffff', { out: INK, bold: true });
    if (m === 'sneeze' && g.state === 'play') shout(c, '¡ACHÍS!', SW / 2 + 50, 50, (t * 2) % 1);
    if (m === 'pose' && g.state !== 'lost') for (let i = 0; i < 4; i++) drawStar(c, SW / 2 - 54 + i * 36, 46 + Math.sin(t * 8 + i) * 5, 3.5 + Math.sin(t * 12 + i) * 1.5, '#fff27a');
  },
  draw(g, c) {
    const m = g.shot || this.mood(g), t = g.t;
    this.scene(g, c, m, true);
    // viewfinder
    if (!g.shot) {
      const K = '#ffffff';
      for (const [x, y, fx, fy] of [[8, 8, 1, 1], [SW - 9, 8, -1, 1], [8, SH - 9, 1, -1], [SW - 9, SH - 9, -1, -1]]) { rect(c, x, y, fx * 14, 2 * fy, K); rect(c, x, y, 2 * fx, fy * 14, K); }
      if (fl(t * 2) % 2) { disc(c, 20, 20, 3, '#ff4060'); txt(c, 'REC', 27, 17, '#ffffff', { out: INK }); }
      const fs = m === 'pose' ? 28 : 36 + Math.sin(t * 6) * 3, fc = m === 'pose' ? '#5bd18b' : '#ffffff', fy = 64 - fs * .7;
      for (const [x, y, fx, fy2] of [[SW / 2 - fs, fy, 1, 1], [SW / 2 + fs, fy, -1, 1], [SW / 2 - fs, fy + fs * 1.4, 1, -1], [SW / 2 + fs, fy + fs * 1.4, -1, -1]]) { rect(c, x, y, fx * 8, fy2 * 2, fc); rect(c, x, y, fx * 2, fy2 * 8, fc); }
      if (m === 'pose') { disc(c, SW / 2 + fs - 4, fy + 5, 3, '#5bd18b'); px(c, SW / 2 + fs - 5, fy + 4, '#ffffff'); }
    } else if (g.snap) {
      // the shot: a polaroid pinned over the scene
      const k = spring(g.t - g.flashT, 2, 6), ok = g.state === 'won';
      c.save(); c.translate(SW / 2, SH / 2); c.rotate((ok ? -.08 : .1) * k); c.scale(.2 + .5 * k, .2 + .5 * k);
      rect(c, -SW / 2 - 10, -SH / 2 - 10, SW + 20, SH + 44, INK); rect(c, -SW / 2 - 9, -SH / 2 - 9, SW + 18, SH + 42, '#fffaf0');
      if (ok) c.drawImage(g.snap, -SW / 2, -SH / 2); else { c.globalAlpha = .35; for (let i = -4; i <= 4; i += 2) c.drawImage(g.snap, -SW / 2 + i * 3, -SH / 2 + i); c.globalAlpha = 1; }
      txt(c, ok ? '#MONÍSIMA' : '¡BORROSA!', 0, SH / 2 + 12, ok ? '#e05b98' : '#6b6977', { align: 'c', bold: true });
      c.restore();
    }
  },
  top(g, c) {
    if (!g.shot || g.state !== 'won') return;
    // it goes straight to Instagram
    const k = clamp((g.t - g.flashT) / .6, 0, 1), likes = fl(k * 1234), pk = spring(g.t - g.flashT, 2.2, 6);
    c.save(); c.translate(196, 112); c.scale(pk, pk);
    panel(c, -52, -60, 104, 118, '#ffffff', { r: 8 });
    disc(c, -40, -48, 6, RAMP.green[2]); tiny(c, 'WB', -40, -50, '#ffffff', { align: 'c' }); txt(c, 'westie.blvrd', -30, -52, INK, { bold: true });
    c.drawImage(g.snap, 64, 20, 128, 110, -46, -38, 92, 70);
    drawHeart(c, -38, 42, '#ff4060', 1.2); txt(c, likes.toLocaleString('es-ES'), -28, 38, INK, { bold: true });
    c.restore();
  },
  bot(g) { const m = this.mood(g); return { x: 128, y: 96, down: m === 'pose' && g.b > g.win0 + .15 }; },
  hint(g) { return { x: SW / 2, y: 70, mech: 'tap' }; },
});

// Keiko sitting (front): the westie body with her bandana head on top
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
// the ice-cream counter outside the shop: striped awning, rail, pavement
function heladoBg() {
  return mdl('heladoBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, 118, '#e3cfaf'); for (let i = 0; i < 300; i++) px(g, hash2(i, 9) * SW, 16 + hash2(9, i) * 100, '#d4bd98');
    // the shop window with the salon inside
    rect(g, 18, 30, 220, 84, INK); rect(g, 20, 32, 216, 80, RAMP.green[1]); subwayTiles(g, 23, 35, 210, 60); rect(g, 23, 95, 210, 14, RAMP.wood[3]);
    for (let i = 0; i < 3; i++) linePx(g, 120 + i * 8, 35, 96 + i * 8, 108, 'rgba(255,255,255,.3)');
    tiny(g, 'HELADO PARA GATO & PERRO', 128, 42, RAMP.green[1], { align: 'c' });
    // striped awning + scalloped edge + the rail the scooper rides on
    for (let x = 0; x < SW; x += 16) { rect(g, x, 0, 8, 18, '#ff93bf'); rect(g, x + 8, 0, 8, 18, '#fff8f0'); }
    for (let x = 0; x < SW; x += 16) { disc(g, x + 8, 18, 8, INK); disc(g, x + 8, 17, 7, x % 32 ? '#fff8f0' : '#ff93bf'); }
    rect(g, 0, 24, SW, 3, INK); rect(g, 0, 25, SW, 1, RAMP.steel[3]);
    // pavement (Barcelona panots)
    fillPat(g, panotPat(), 0, 118, SW, 74); rect(g, 0, 118, SW, 2, '#8f8a82');
    return c;
  });
}
function heladoCone() {
  return mdl('heladoCone', () => {
    const c = mkCanvas(22, 30), g = c.g, Y = ['#b0703a', '#d58c4c', '#f2b978'];
    polyPx(g, [[1, 1], [21, 1], [11, 29]], INK); polyPx(g, [[2, 2], [20, 2], [11, 27]], Y[1]);
    for (let i = -20; i < 24; i += 5) { linePx(g, 2 + i, 2, 12 + i, 27, Y[0]); linePx(g, 20 - i, 2, 10 - i, 27, Y[0]); }
    polyPx(g, [[1, 1], [21, 1], [21, 0], [1, 0]], INK); hline(g, 2, 20, 2, Y[2]);
    g.globalCompositeOperation = 'destination-in'; polyPx(g, [[1, 0], [22, 0], [11, 30]], '#000');
    return c;
  });
}
function heladoScoop(col) { return mdl('hscoop' + col, () => { const c = mkCanvas(26, 22), g = c.g; disc(g, 13, 11, 10, INK); disc(g, 13, 11, 9, col); disc(g, 10, 8, 4, '#ffffff'); for (let x = 3; x < 24; x += 4) disc(g, x, 17, 2.6, col); for (const [x, y] of [[16, 7], [8, 13], [17, 14]]) px(g, x, y, '#c0662c'); return c; }); }
defMG({
  id: 'helado', stage: 'anahi', name: 'Helado perruno', cmd: '¡SIRVE!', how: 'Suelta la bola justo encima del cucurucho', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .7, n: 'G5 E5 C5 E5 G5 . C6 . A5 F5 C5 F5 A5 . C6 . G5 E5 C5 E5 G5 . E6 . D6 . B5 . G5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . . . G2 . . . F2 . . . C3 . . . C3 . . . G2 . . . G2 . . . D3 . G2 .' },
    { i: 'd', v: .6, n: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s s s s' }] }),
  init(g) {
    g.need = g.level >= 2 ? 2 : 1; g.stack = 0; g.drop = null;
    g.coneX = g.level === 1 ? 160 : g.r(130, 200); g.coneV = [0, 22, 36][g.level - 1] * g.tempo * (g.r() < .5 ? -1 : 1);
    g.swingT = g.r(TAU); g.cols = ['#ffb3d1', '#fff7ae', '#b3d9ff']; g.splats = []; g.squash = 0;
    hacStamp('¡ÑAM!', ANA_OK); hacStamp('¡PLOF!', ANA_KO);
    for (const ex of ['love', 'sad']) drawKeikoSit(ANA_SCRATCH.g, 0, 0, ex); // her reactions, prebuilt
  },
  armX(g) { return 150 + Math.sin(g.swingT) * 92; },
  coneTop(g) { return 118 - g.stack * 12; },
  update(g, dt) {
    g.swingT += dt * [2.1, 2.6, 3.1][g.level - 1] * g.tempo;
    if (g.state === 'play') { g.coneX += g.coneV * dt; if (g.coneX < 118 || g.coneX > 226) { g.coneV *= -1; g.coneX = clamp(g.coneX, 118, 226); } }
    if (g.drop) {
      const d = g.drop; d.vy += 700 * dt; d.y += d.vy * dt;
      if (d.y >= this.coneTop(g) - 4 && !d.done) {
        if (Math.abs(d.x - g.coneX) < 14) { d.done = true; g.stack++; g.drop = null; sfx('pop', { pitch: .7 }); sfx('gulp', { delay: .1 }); HITSTOP = 2; g.fx.burst(g.coneX, this.coneTop(g), 12, { k: 'star', c: [C.yellow, '#fff', C.pinkL] }); g.squash = 1; if (g.stack >= g.need) { g.win(); anaStampHit(g, true); sfx('bark', { pitch: 1.4, delay: .15 }); for (let i = 0; i < 5; i++) g.fx.add({ k: 'heart', x: 56 + g.r(-12, 12), y: 110, vx: g.r(-20, 20), vy: g.r(-60, -30), life: 1, c: C.pink }); } }
        else if (d.y > 176) { d.done = true; g.splats.push({ x: d.x, col: d.col }); g.drop = null; sfx('squish', { pitch: .8 }); g.lose(); anaStampHit(g, false); g.shake(2, .15); g.fx.burst(d.x, 178, 10, { k: 'drop', c: [d.col, '#ffffff'], sp0: 40, sp1: 110, g: 300, life0: .3, life1: .5 }); }
      }
    } else if (IN.tap && g.state === 'play') { g.drop = { x: this.armX(g), y: 44, vy: 0, col: g.cols[g.stack % 3] }; sfx('swoosh', { pitch: 1.4 }); }
    g.squash = Math.max(0, g.squash - dt * 4);
  },
  draw(g, c) {
    c.drawImage(heladoBg(), 0, 0);
    for (const s2 of g.splats) { ellipsePx(c, s2.x, 181, 15, 5, INK); ellipsePx(c, s2.x, 180, 14, 4, s2.col); disc(c, s2.x - 8, 176, 2, s2.col); }
    // Keiko waiting, tongue out (and licking the floor if it went wrong)
    const mood = g.state === 'won' ? 'love' : g.state === 'lost' ? 'sad' : 'happy';
    drawKeikoSit(c, 54, 186, mood, { tilt: g.state === 'play' ? Math.sin(g.t * 3) * .4 : 0 });
    if (g.state === 'play' && fl(g.t * 3) % 2) disc(c, 56, 124 + (g.t * 20 % 6), 1.5, '#9bd6f7'); // drool
    // the cone in its little wheeled stand
    const x = rd(g.coneX), b = g.squash * 3;
    rect(c, x - 16, 146, 32, 6, INK); rect(c, x - 15, 147, 30, 4, RAMP.wood[3]); rect(c, x - 15, 147, 30, 1, RAMP.wood[4]);
    for (const lx of [x - 12, x + 10]) { rect(c, lx, 152, 3, 20, INK); rect(c, lx + 1, 152, 1, 20, RAMP.wood[2]); }
    if (g.level >= 2) for (const wx of [x - 11, x + 11]) { disc(c, wx, 175, 4, INK); disc(c, wx, 175, 3, RAMP.steel[3]); px(c, wx, 175, INK); }
    drawS(c, heladoCone(), x, 120 + b, { ax: .5, ay: 0 });
    for (let i = 0; i < g.stack; i++) drawS(c, heladoScoop(g.cols[i % 3]), x, 118 - i * 12 + b, { ax: .5, ay: .75, sy: i === g.stack - 1 ? 1 - g.squash * .3 : 1 });
    if (g.state === 'won') for (let i = 0; i < 3; i++) drawHeart(c, 60 + i * 12, 96 - ((g.t * 30 + i * 10) % 30), '#ff4060', 1);
    // the scooper riding the rail
    const ax = this.armX(g);
    rect(c, ax - 8, 20, 16, 12, INK); rect(c, ax - 7, 21, 14, 10, '#ff93bf'); rect(c, ax - 7, 21, 14, 2, '#ffd1e4');
    rect(c, ax - 1, 32, 3, 8, INK); rect(c, ax, 32, 1, 8, RAMP.steel[3]);
    if (!g.drop && g.state === 'play') drawS(c, heladoScoop(g.cols[g.stack % 3]), ax, 46, {});
    if (g.drop) drawS(c, heladoScoop(g.drop.col), g.drop.x, g.drop.y, { sy: 1 + Math.min(.3, g.drop.vy / 2000) });
    if (g.state === 'play' && !g.drop && g.level < 3) { const hit = Math.abs(ax - g.coneX) < 14; for (let y = 58; y < 112; y += 6) px(c, ax, y, hit ? '#5bd18b' : '#ffffff'); }
    if (g.state !== 'play') anaStamp(c, g.state === 'won' ? '¡ÑAM!' : '¡PLOF!', g.t - g.stampT, g.state === 'won', 150, 76);
  },
  bot(g) {
    // predict where the cone will be when a scoop dropped now arrives
    const fall = Math.sqrt(2 * Math.max(1, this.coneTop(g) - 4 - 44) / 700);
    let cx2 = g.coneX + g.coneV * fall; if (cx2 < 118) cx2 = 236 - cx2; if (cx2 > 226) cx2 = 452 - cx2;
    return { x: 128, y: 96, down: !g.drop && Math.abs(this.armX(g) - cx2) < 5 && g.state === 'play' };
  },
  hint(g) { return { x: g.coneX, y: 70, mech: 'tap' }; },
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
// the white enamel clawfoot tub (front), 224x56
function burbTub() {
  return mdl('burbTub', () => {
    const body = SD.smooth(8, SD.box(112, 24, 104, 18, 14), SD.ellipse(112, 30, 96, 20));
    const rim = SD.capsule(8, 8, 216, 8, 6.5, 6.5);
    const feet = SD.union(SD.ellipse(30, 49, 8, 6), SD.ellipse(194, 49, 8, 6));
    const c = model(224, 56, [
      CEL(feet, [RAMP.gold[1], RAMP.gold[3], RAMP.gold[4]], 0, { th: 4 }),
      CEL(body, ['#9fb8c8', '#dfeaf1', '#ffffff'], 1, { th: 14 }),
      CEL(rim, ['#b7cbd8', '#eef5f9', '#ffffff'], 2, { th: 5 }),
    ], { selout: false });
    drawHeart(c.g, 112, 32, '#ff93bf', 2); tiny(c.g, 'WB', 112, 28, '#ffffff', { align: 'c' });
    return c;
  });
}
// a towel on its rail and a rubber duck, so the bathroom reads at a glance
function burbTowel(g) {
  thickLine(g, 6, 66, 60, 66, 1.6, INK); thickLine(g, 6, 66, 60, 66, .8, RAMP.steel[3]);
  rect(g, 13, 66, 38, 40, INK); rect(g, 14, 67, 36, 38, RAMP.green[2]); rect(g, 14, 67, 36, 3, RAMP.green[3]);
  for (const y of [92, 96]) rect(g, 14, y, 36, 2, RAMP.cream[4]); rect(g, 14, 103, 36, 2, RAMP.green[1]);
  for (let x = 15; x < 50; x += 3) px(g, x, 105, RAMP.green[1]); tiny(g, 'WB', 32, 76, RAMP.cream[4], { align: 'c' });
}
function burbDuck(g, x, y) {
  disc(g, x, y, 7, INK); disc(g, x + 5, y - 7, 5, INK); polyPx(g, [[x + 9, y - 8], [x + 15, y - 6], [x + 9, y - 4]], INK);
  disc(g, x, y, 6, '#ffd23f'); disc(g, x + 5, y - 7, 4, '#ffd23f'); polyPx(g, [[x + 9, y - 7], [x + 14, y - 6], [x + 9, y - 5]], '#ff8f3f');
  linePx(g, x - 3, y - 1, x + 2, y + 1, '#e2a91b'); px(g, x + 6, y - 8, INK); px(g, x + 3, y - 9, '#fff7ae'); px(g, x - 3, y - 3, '#fff7ae');
}
defMG({
  id: 'burbujas', stage: 'anahi', name: 'Burbujas', cmd: '¡EXPLOTA!', how: 'Revienta todas las pompas antes de que acabe el baño', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'C6 . G5 . E6 . G5 . D6 . G5 . F6 . E6 . C6 . G5 . E6 . G5 . D6 . B5 . C6 - . .' },
    { i: 'sub', v: .7, n: 'C3 . . . . . . . G2 . . . . . . . A2 . . . . . . . G2 . . . G2 . . .' },
    { i: 'd', v: .55, n: 'k . z z . . z . k . z z . . z z k . z z . . z . k . z z s . s .' }] }),
  init(g) {
    g.need = [5, 7, 9][g.level - 1]; g.popped = 0; g.bubbles = []; g.spawned = 0; g.spawnT = 0; g.combo = 0;
    hacStamp('¡LIMPITA!', ANA_OK);
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
        g.fx.add({ k: 'txt', s: '¡PLOP!', x: hit.x, y: hit.y - hit.r - 4, life: .45, c: '#ffffff' });
        if (g.popped >= g.need) { g.win(); anaStampHit(g, true); sfx('sparkle', { delay: .2 }); g.fx.burst(128, 150, 20, { k: 'bubble', c: '#ffffff', sp0: 40, sp1: 140, r: 4 }); g.fx.burst(128, 110, 12, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 40, sp1: 120 }); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(bathBg(), 0, 0); burbTowel(c);
    // Keiko in the tub, foam hat
    drawS(c, keikoHead(g.state === 'won' ? 'happy' : g.popped > 0 ? 'wink' : 'wow'), SW / 2, 128 + Math.sin(g.t * 4) * 1.5, {});
    for (const [dx, dy, r] of [[-12, -30, 8], [0, -36, 10], [12, -30, 8], [22, -24, 6], [-20, -22, 6]]) { disc(c, SW / 2 + dx, 128 + dy, r + 1, '#b9cad0'); disc(c, SW / 2 + dx, 128 + dy, r, '#ffffff'); }
    c.drawImage(burbTub(), 16, 140);
    for (let x = 30; x < 228; x += 7) { const y = 142 + Math.sin(x + g.t * 3) * 1.5; disc(c, x, y, 5, '#ffffff'); ringPx(c, x, y, 5, '#dce7ea'); }
    burbDuck(c, 204, 134 + Math.sin(g.t * 5) * 1.2);
    for (const b of g.bubbles) {
      const cols = ['#ff93bf', '#9bd6f7', '#fff7ae', '#94dcbc'], ci = fl((b.hue + g.t * 2) % 4), r = b.r;
      c.globalAlpha = .22; disc(c, b.x, b.y, r, '#ffffff'); c.globalAlpha = 1;
      ringPx(c, b.x, b.y, r, INK); ringPx(c, b.x, b.y, r - 1, cols[ci]); ringPx(c, b.x, b.y, r - 2, cols[(ci + 1) % 4]);
      for (let a = 3.6; a < 4.6; a += .12) px(c, b.x + Math.cos(a) * (r - 3.5), b.y + Math.sin(a) * (r - 3.5), '#ffffff');
      disc(c, b.x - r * .45, b.y - r * .45, 1.5, '#ffffff');
    }
    panel(c, SW - 66, 6, 60, 18, '#ffffff', { r: 5 }); ringPx(c, SW - 54, 15, 5, '#63a0ef'); px(c, SW - 56, 13, '#ffffff'); txt(c, g.popped + '/' + g.need, SW - 44, 11, g.state === 'won' ? ANA_OK : INK, { bold: true });
    if (g.state === 'won') anaStamp(c, '¡LIMPITA!', g.t - g.stampT, true, 118, 58);
  },
  bot(g) { const b = g.bubbles.find(b => b.y < 160 && b.y > 10); if (!b) return { down: false }; return { x: b.x, y: b.y + b.vy * .02, down: fl(g.t * 20) % 3 === 0 }; },
  hint(g) { const b = g.bubbles[0]; return b ? { x: b.x, y: Math.max(40, b.y - 30), mech: 'tap' } : { x: 128, y: 120, mech: 'tap' }; },
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
    hacStamp('¡TODOS LIMPIOS!', ANA_OK); hacStamp('¡ES UN GATO!', ANA_KO);
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
      if (h.st === 'cheer') { if (g.t >= h.cheerAt) h.up = Math.min(1, h.up + dt * 8); continue; }
      if (h.st === 'rise') { h.up = Math.min(1, h.up + dt * 7 * sp); if (h.up >= 1) { h.st = 'up'; h.t = 0; } }
      else if (h.st === 'up') { if (h.t > h.dur) { h.st = 'sink'; } }
      else if (h.st === 'sink' || h.st === 'clean') { h.up = Math.max(0, h.up - dt * (h.st === 'clean' ? 3 : 6) * sp); if (h.up <= 0) { h.st = 'down'; } }
    }
    if (IN.tap && g.state === 'play') {
      for (const h of g.holes) if ((h.st === 'up' || h.st === 'rise') && Math.abs(IN.x - h.x) < 26 && IN.y > h.y - 50 * h.up - 10 && IN.y < h.y + 8) {
        if (h.kind === 'cat') { sfx('whine', { pitch: 1.8 }); g.fx.add({ k: 'txt', s: '¡FFFSH!', x: h.x, y: h.y - 56, life: .7, c: '#ffd1e4' }); g.lose(); anaStampHit(g, false); g.shake(3, .2); h.hiss = g.t; break; }
        h.st = 'clean'; h.sprayT = g.t; g.washed++; sfx('splash', { vol: .5 }); sfx('sparkle', { pitch: 1 + g.washed * .1 }); HITSTOP = 2; buzz(8);
        g.fx.burst(h.x, h.y - 30, 12, { k: 'bubble', c: '#ffffff', sp0: 40, sp1: 120, r: 3 });
        g.fx.burst(h.x, h.y - 30, 8, { k: 'star', c: [C.yellow, '#fff'] });
        if (g.washed >= g.need) {
          g.win(); anaStampHit(g, true); sfx('bark', { n: 2, pitch: 1.3, delay: .2 });
          // curtain call: every basin pops a clean, happy westie
          for (const q of g.holes) { q.st = 'cheer'; q.kind = 'mud'; q.cheerAt = g.t + g.r(.05, .3); }
        }
        break;
      }
    }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#dce7ea'); subwayTiles(c, 0, 0, SW, 60);
    rect(c, 0, 60, SW, SH - 60, '#b9cad0'); for (let y = 62; y < SH; y += 12) for (let x = (y / 12 % 2) * 12; x < SW; x += 24) rect(c, x, y, 12, 12, '#c9d8dd');
    for (const h of g.holes) {
      // a steel wash basin full of soapy water
      ellipsePx(c, h.x, h.y + 3, 31, 10, INK); ellipsePx(c, h.x, h.y + 1, 30, 9, RAMP.steel[2]); ellipsePx(c, h.x, h.y, 28, 7.5, RAMP.steel[4]); ellipsePx(c, h.x, h.y, 25, 6, '#3d6f7a'); ellipsePx(c, h.x - 4, h.y - 1, 15, 3, '#5aaee6');
      if (h.up > 0) {
        c.save(); c.beginPath(); c.rect(h.x - 32, h.y - 90, 64, 90); c.clip();
        const cheer = h.st === 'cheer', hop = cheer ? Math.abs(Math.sin((g.t - h.cheerAt) * 9)) * 4 : 0, y = h.y + 40 - h.up * 52 - hop;
        if (h.kind === 'cat') drawCatHead(c, h.x + (h.hiss && g.t - h.hiss < .6 ? Math.sin(g.t * 60) * 2 : 0), y);
        else drawS(c, buleHead(h.st === 'clean' || cheer ? 'happy' : 'grr', h.st === 'clean' || cheer ? RAMP.fur : RAMP.mud), h.x, y, { s: 1 });
        c.restore();
      }
      // foam rim in front
      for (let i = -24; i <= 24; i += 8) { disc(c, h.x + i, h.y + 5, 4, '#ffffff'); ringPx(c, h.x + i, h.y + 5, 4, '#dce7ea'); }
      // shower spray when you wash one
      if (h.sprayT != null && g.t - h.sprayT < .4) {
        const k = (g.t - h.sprayT) / .4, sx = h.x + 8, sy = h.y - 74;
        c.globalAlpha = Math.min(1, 2 - k * 2); for (let i = -3; i <= 3; i++) linePx(c, sx + i * 2, sy + 6, h.x + i * 7, h.y - 22 + Math.abs(i) * 2, i % 2 ? '#9bd6f7' : '#dff4ff'); c.globalAlpha = 1;
        thickLine(c, sx + 6, sy - 4, SW + 10, sy - 40, 2.2, INK); thickLine(c, sx + 6, sy - 4, SW + 10, sy - 40, 1.2, RAMP.steel[3]);
        c.save(); c.translate(sx, sy); c.rotate(-.5); rect(c, -2, -14, 5, 12, INK); rect(c, -1, -13, 3, 11, RAMP.steel[3]); ellipsePx(c, 0, 0, 8, 4, INK); ellipsePx(c, 0, -1, 7, 3, RAMP.steel[4]); for (let i = -4; i <= 4; i += 2) px(c, i, 1, INK); c.restore();
      }
    }
    panel(c, 6, 6, 58, 18, '#ffffff', { r: 5 });
    polyPx(c, [[17, 8], [22, 16], [12, 16]], INK); disc(c, 17, 16, 5, INK); polyPx(c, [[17, 10], [21, 16], [13, 16]], '#63a0ef'); disc(c, 17, 16, 4, '#63a0ef'); px(c, 15, 15, '#dff4ff'); px(c, 15, 16, '#dff4ff');
    txt(c, g.washed + '/' + g.need, 28, 11, g.state === 'won' ? ANA_OK : INK, { bold: true });
    // sparkles over the clean heads, then the salon's verdict
    if (g.state === 'won') for (const h of g.holes) if (h.up > .8) drawStar(c, h.x + 16, h.y - 58 + Math.sin(g.t * 8 + h.x) * 3, 2 + Math.sin(g.t * 12 + h.x) * 1, '#fff27a');
    if (g.state !== 'play') anaStamp(c, g.state === 'won' ? '¡TODOS LIMPIOS!' : '¡ES UN GATO!', g.t - g.stampT, g.state === 'won', 142, 46);
  },
  bot(g) { const h = g.holes.find(h => (h.st === 'up') && h.kind === 'mud'); if (!h) return { down: false }; return { x: h.x, y: h.y - 30, down: fl(g.t * 20) % 3 === 0 }; },
  hint(g) { const h = g.holes.find(h => h.st !== 'down') || g.holes[1]; return { x: h.x, y: h.y - 30, mech: 'tap' }; },
});
function drawCatHead(g, x, y) {
  const img = mdl('catHead', () => {
    const B = RAMP.black;
    const head = SD.ellipse(32, 32, 17, 15), eL = SD.grow(SD.poly([[17, 24], [18, 8], [29, 19]]), 1.5), eR = SD.grow(SD.poly([[47, 24], [46, 8], [35, 19]]), 1.5);
    return model(64, 56, [{ f: eL, ramp: B, z: 0, th: 3 }, { f: eR, ramp: B, z: 0, th: 3 }, { f: head, ramp: B, z: 1, th: 12 }], { post: g => { for (const ex of [24, 37]) { rect(g, ex, 28, 4, 5, '#c8f05a'); rect(g, ex + 1, 29, 2, 4, INK); px(g, ex, 28, '#ffffff'); } polyPx(g, [[30, 36], [34, 36], [32, 38]], '#ff93bf'); hline(g, 29, 35, 40, '#5f5883'); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) linePx(g, 32 + s * 6, 37 + i, 32 + s * 16, 35 + i * 2, '#9896a4'); } });
  });
  drawS(g, img, x, y);
}

// ============================================================================
//  From the user's own WarioWare parody video: ¡SECA!, ¡ELIGE EL MODELO!,
//  ¡EMPAREJA! (+ the OK paw on ¡CORTA!). Clean cartoon look: bold ink
//  outlines, three-tone cel shading, big glossy eyes, rosy cheeks.
// ============================================================================
// three-tone cel ramps for people and props
const ANAB = {
  purple: ['#4b2a7a', '#7b4fc0', '#a98ae6'], purpleD: ['#35205a', '#5a3a96', '#7d5fc4'],
  skin: ['#c98a6e', '#f2c4a4', '#ffe0cc'], grey: ['#8f8c99', '#c4c1cc', '#eceaf2'], suit: ['#3a3f52', '#565d78', '#7a82a0'],
  shirt: ['#b9c3d6', '#e6ecf5', '#ffffff'], red: ['#8c1c2c', '#d0344a', '#ff6b7a'], paper: ['#cfc8b8', '#f2ede2', '#ffffff'],
  wood: ['#6b4424', '#9a6634', '#c48a4a'], mauve: ['#6e3f63', '#a0648f', '#c98fb8'], hairG: ['#8a8799', '#bdbac8', '#e6e4ee'],
};
const CEL = (f, ramp, z, o = {}) => Object.assign({ f, ramp, z, th: 5, dith: 0, amb: .34, dif: .8 }, o);

// ---------------------------------------------------------------- 7 ¡SECA! --
// the purple hair dryer, nozzle to the right (angle 0), handle down
function secaDryer() {
  return mdl('secaDryer', () => {
    const P = ANAB.purple;
    const barrel = SD.smooth(3, SD.capsule(16, 18, 40, 18, 11, 9), SD.circle(15, 18, 12));
    const nozzle = SD.capsule(38, 18, 54, 18, 7.5, 6);
    const handle = SD.capsule(24, 24, 20, 44, 5.5, 5);
    const c = model(64, 56, [
      CEL(handle, ANAB.purpleD, 0, { th: 4 }), CEL(barrel, P, 1, { th: 9 }), CEL(nozzle, ANAB.purpleD, 2, { th: 5 }),
    ], { selout: false });
    const g = c.g;
    disc(g, 14, 18, 7, P[0]); for (let a = 0; a < TAU; a += TAU / 8) linePx(g, 14, 18, 14 + Math.cos(a) * 6, 18 + Math.sin(a) * 6, P[1]); disc(g, 14, 18, 2, P[2]);
    rect(g, 52, 13, 3, 11, INK); rect(g, 53, 14, 1, 9, '#2b2540');
    rect(g, 26, 29, 3, 5, '#ffdf4f'); px(g, 26, 29, '#fff7ae');
    hline(g, 22, 36, 9, P[2]); hline(g, 20, 30, 10, P[2]);
    return c;
  });
}
// the dried westie: a round, happy cotton ball (Keiko), 96x92
function secaFluffBall() {
  return mdl('secaFluff', () => {
    const F = RAMP.fur;
    const bodyS = SD.ellipse(48, 62, 38, 27);
    const body = SD.shag(SD.tufts(bodyS, 48, 58, 4.2, 26, 1.7, 1.5), 1.4, .22, 17);
    const pawL = SD.ellipse(33, 86, 8, 5), pawR = SD.ellipse(63, 86, 8, 5), tail = SD.tufts(SD.circle(86, 56, 8), 86, 56, 2.5, 9, 1, 1.4);
    const c = model(96, 94, [
      { f: tail, fs: SD.circle(86, 56, 8), ramp: F, z: 0, th: 5, tex: clumpTex(3, .25, 4, 1.2) },
      { f: body, fs: bodyS, ramp: F, z: 1, th: 22, tex: clumpTex(6, .34, 8, 1.2) },
      { f: pawL, ramp: F, z: 2, th: 4 }, { f: pawR, ramp: F, z: 2, th: 4 },
    ]);
    drawS(c.g, keikoHead('happy'), 48, 31, {});
    return c;
  });
}
function secaBg() {
  return mdl('secaBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#f5b3d4');
    for (let y = 6; y < SH; y += 16) for (let x = ((y / 16) % 2) * 8 + 4; x < SW; x += 16) disc(g, x, y, 2.5, '#f9c9e1');
    panel(g, 60, 136, 136, 30, '#ffffff', { r: 12, line: INK, lo: '#e9d9e6' });
    for (let x = 70; x < 190; x += 6) { px(g, x, 139, '#f3e6f0'); px(g, x + 3, 160, '#f3e6f0'); }
    return c;
  });
}
defMG({
  id: 'seca', stage: 'anahi', name: 'Secado exprés', cmd: '¡SECA!', how: 'Toca cuando el secador apunte a la perrita', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'G5 . B5 . D6 . B5 . C6 . A5 . F#5 . A5 . G5 . B5 . D6 . G6 . F#6 . D6 . A5 - . .' },
    { i: 'bass', v: .85, n: 'G2 . . G2 . . D3 . C3 . . C3 . . D3 . G2 . . G2 . . B2 . D3 . . D3 . . F#2 .' },
    { i: 'd', v: .65, n: 'k . h h s . h . k . h h s . h h k . h h s . h . k k h . s s s s' }] }),
  init(g) {
    g.need = [3, 4, 4][g.level - 1]; g.dry = 0; g.puffs = []; g.cool = 0;
    g.orbit = g.r(TAU); g.om = [1.4, 1.8, 2.3][g.level - 1] * g.tempo * (g.r() < .5 ? -1 : 1);
    // the sweep lingers on the dog (sin³), then swings far away; first window comes early
    g.sw = g.r(-.6, .6) + (g.r() < .5 ? Math.PI : 0); g.swSp = [2.2, 2.7, 3.2][g.level - 1] * g.tempo; g.tol = [.3, .24, .19][g.level - 1];
    g.cx = 128; g.cy = 108; g.bounce = 0; g.popT = -1;
  },
  dryerAt(g) {
    const x = g.cx + Math.cos(g.orbit) * 98, y = g.cy - 10 + Math.sin(g.orbit) * 62;
    const toDog = Math.atan2(g.cy - y, g.cx - x), sn = Math.sin(g.sw), off = sn * sn * sn * 1.3;
    return { x, y, ang: toDog + off, off };
  },
  update(g, dt) {
    g.bounce = Math.max(0, g.bounce - dt * 4); g.cool = Math.max(0, g.cool - dt);
    if (g.state === 'play') { g.orbit += g.om * dt; g.sw += g.swSp * dt; }
    const D = this.dryerAt(g);
    if (IN.tap && g.state === 'play' && g.cool <= 0) {
      g.cool = .2;
      const hit = Math.abs(D.off) < g.tol, nx = D.x + Math.cos(D.ang) * 26, ny = D.y + Math.sin(D.ang) * 26;
      g.puffs.push({ x: nx, y: ny, ang: D.ang, t: 0, hit, sx: nx, sy: ny });
      sfx('whoosh', { pitch: hit ? 1.4 : .9, vol: .7 });
      if (!hit) g.fx.add({ k: 'txt', s: '¡fsss!', x: nx, y: ny - 10, life: .45, c: '#ffffff' });
    }
    for (const p of g.puffs) {
      p.t += dt;
      if (p.hit) { const k = Math.min(1, p.t / .2); p.x = lerp(p.sx, g.cx, k); p.y = lerp(p.sy, g.cy - 6, k); if (k >= 1 && !p.done) { p.done = true; this.gotPuff(g); } }
      else { p.x += Math.cos(p.ang) * 220 * dt; p.y += Math.sin(p.ang) * 220 * dt; }
    }
    g.puffs = g.puffs.filter(p => p.t < .6);
    // the wet dog drips and shivers
    if (g.dry < 1 && FRAME % 5 === 0) g.fx.add({ k: 'drop', x: g.cx + g.r(-26, 26), y: g.cy + g.r(-8, 16), vx: g.r(-10, 10), vy: g.r(20, 60), g: 300, life: .5, c: pick(['#5aaee6', '#9bd6f7']) });
    // about to fail: she shakes the water all over you
    if (g.state === 'play' && g.b > g.def.beats - .9 && FRAME % 2 === 0) g.fx.add({ k: 'drop', x: g.cx, y: g.cy, vx: g.r(-240, 240), vy: g.r(-200, 40), g: 200, life: .5, c: pick(['#5aaee6', '#9bd6f7', '#dff4ff']) });
  },
  gotPuff(g) {
    g.dry = Math.min(1, g.dry + 1 / g.need); g.bounce = 1; HITSTOP = 2; buzz(8);
    sfx('splash', { pitch: 1.6, vol: .5 });
    g.fx.burst(g.cx, g.cy - 4, 14, { k: 'drop', c: ['#5aaee6', '#9bd6f7', '#dff4ff'], sp0: 80, sp1: 180, g: 260, life0: .3, life1: .6 });
    g.fx.add({ k: 'txt', s: '¡FUUU!', x: g.cx + 30, y: g.cy - 40, life: .5, c: '#ffffff' });
    if (g.dry >= 1) { g.popT = g.t; sfx('boing', { pitch: .8 }); sfx('sparkle'); g.fx.burst(g.cx, g.cy - 6, 22, { k: 'puff', c: ['#ffffff', '#fff4fa'], sp0: 40, sp1: 140, r: 6, life0: .3, life1: .6 }); for (let i = 0; i < 5; i++) g.fx.add({ k: 'heart', x: g.cx + g.r(-30, 30), y: g.cy - 40, vy: -40, vx: g.r(-20, 20), life: 1, c: '#ff5d9e' }); g.win(); }
  },
  draw(g, c) {
    c.drawImage(secaBg(), 0, 0);
    const shake = g.state === 'play' && g.b > g.def.beats - .9 ? Math.sin(g.t * 70) * 3 : g.dry < 1 ? Math.sin(g.t * 38) * .8 : 0;
    const sq = 1 + g.bounce * .08;
    if (g.dry >= 1) { const k = spring(g.t - g.popT, 2.2, 6); drawS(c, secaFluffBall(), g.cx, g.cy + 50, { ax: .5, ay: 1, s: .6 + .4 * k }); }
    else {
      const img = g.dry < .34 ? keikoSide(1.25, 'wet', 'sad') : g.dry < .67 ? keikoSide(1.25, 'stand', 'sad') : keikoSide(1.25, 'wag', 'happy');
      drawS(c, img, g.cx + shake, g.cy + 40, { ax: .5, ay: 1, sx: sq, sy: 2 - sq });
      // clinging drops on the coat
      const n = rd((1 - g.dry) * 9);
      for (let i = 0; i < n; i++) { const x = g.cx - 30 + (i * 37 % 64), y = g.cy - 14 + (i * 23 % 34); disc(c, x + shake, y, 1.6, '#5aaee6'); px(c, x - 1 + shake, y - 1, '#dff4ff'); }
    }
    // air puffs
    for (const p of g.puffs) { const k = Math.min(1, p.t / .5), r = 8 + k * 12; c.globalAlpha = 1 - (p.hit ? Math.max(0, p.t - .2) * 3 : k * .8); for (const [dx, dy] of [[0, 0], [-r * .6, r * .3], [r * .5, r * .4]]) { disc(c, p.x + dx, p.y + dy, r * .7 + 1, '#b3b8d4'); disc(c, p.x + dx, p.y + dy, r * .7, '#ffffff'); } c.globalAlpha = 1; }
    // the dryer, its cord and (early levels) an aim hint
    const D = this.dryerAt(g);
    const cordX = D.x - Math.cos(D.ang) * 12 + 4, cordY = D.y + 22;
    for (let i = 0; i < 20; i++) { const k = i / 20; px(c, lerp(cordX, D.x < 128 ? -4 : SW + 4, k), cordY + Math.sin(k * 6) * 5 + k * 40, '#3d2266'); }
    if (g.state === 'play' && g.level < 3) { const aimed = Math.abs(D.off) < g.tol; for (let q = 30; q < 70; q += 5) px(c, D.x + Math.cos(D.ang) * q, D.y + Math.sin(D.ang) * q, aimed ? '#5bd18b' : '#ffffff'); if (aimed) ringPx(c, g.cx, g.cy, 40 + Math.sin(g.t * 20) * 2, '#5bd18b'); }
    // mirror (not flip over) when aiming left, so the handle always hangs down
    if (Math.cos(D.ang) >= 0) drawS(c, secaDryer(), D.x, D.y, { rot: D.ang, ax: .45, ay: .32 });
    else drawS(c, secaDryer(), D.x, D.y, { rot: D.ang - Math.PI, flip: true, ax: .45, ay: .32 });
    if (g.state === 'won') shout(c, '¡ESPONJOSA!', g.cx, 30, g.t - g.popT);
    // dryness meter
    panel(c, 8, 8, 70, 14, '#ffffff', { r: 4 }); rect(c, 12, 12, 62, 6, '#9bd6f7'); rect(c, 12, 12, rd(62 * g.dry), 6, '#ffdf4f'); tiny(c, 'SECO', 43, 13, INK, { align: 'c' });
  },
  bot(g) { const D = this.dryerAt(g); return { x: 128, y: 96, down: g.state === 'play' && g.cool <= 0 && Math.abs(D.off) < g.tol * .7 && fl(g.t * 30) % 2 === 0 }; },
  hint(g) { return { x: g.cx, y: g.cy - 8, mech: 'tap' }; },
});

// ---------------------------------------------------------------- 8 ¡ELIGE EL MODELO!
// the self-employed joke: the right Hacienda form, or "DENEGADO"
const MODELO_REQ = [
  { n: '303', a: 'El IVA del trimestre' }, { n: '390', a: 'El resumen anual del IVA' },
  { n: '130', a: 'El pago fraccionado del IRPF' }, { n: '115', a: 'Las retenciones del alquiler' },
  { n: '111', a: 'Las retenciones de las nóminas' }, { n: '036', a: 'El alta de autónoma' },
  { n: '100', a: 'La declaración de la renta' }, { n: '347', a: 'Las operaciones con terceros' },
];
const MODELO_FAKE = ['715', '404', '007'];
// civil servants: 'clerk' (glasses, neat dark hair) or 'inspector' (bald, grey fringe, big moustache)
function funcionario(kind = 'clerk', mood = 'neutral') {
  return mdl('func:' + kind + mood, () => {
    const insp = kind === 'inspector', SK = mood === 'angry' ? ['#b0584e', '#e0806e', '#f7a894'] : ANAB.skin;
    const head = SD.smooth(3, SD.ellipse(45, 27, 14.5, 16), SD.ellipse(45, 36, 11, 9));
    const earL = SD.ellipse(30.5, 29, 3, 4.5), earR = SD.ellipse(59.5, 29, 3, 4.5);
    const neck = SD.box(45, 46, 6, 5, 2);
    const body = SD.smooth(4, SD.box(45, 66, 30, 16, 8), SD.ellipse(45, 52, 22, 8));
    const hair = insp ? SD.union(SD.ellipse(31.5, 25, 5, 8), SD.ellipse(58.5, 25, 5, 8)) : SD.sub(SD.ellipse(45, 20, 15.5, 12.5), SD.ellipse(47, 31, 15, 11));
    const shirt = SD.poly([[37, 50], [53, 50], [45, 66]]);
    const c = model(90, 82, [
      CEL(earL, SK, 0), CEL(earR, SK, 0), CEL(neck, SK, .5), CEL(body, insp ? ['#4a3222', '#7a5436', '#a07448'] : ANAB.suit, 1, { th: 12 }),
      CEL(shirt, ANAB.shirt, 1.5, { th: 3, edge: true }), CEL(head, SK, 2, { th: 12 }), CEL(hair, insp ? ANAB.hairG : ['#1e1620', '#3a2a30', '#5a4448'], 2.5, { th: 5 }),
    ], { selout: false });
    const g = c.g, K = INK;
    // tie
    polyPx(g, [[43, 52], [47, 52], [48, 64], [45, 68], [42, 64]], K); polyPx(g, [[44, 53], [46, 53], [47, 63], [45, 66], [43, 63]], insp ? '#d0344a' : '#3565cc');
    // glasses
    for (const ex of [38, 52]) { ringRect(g, ex - 5, 25, 10, 7, 1, K); rect(g, ex - 4, 26, 8, 5, '#dff4ff'); px(g, ex - 3, 26, '#ffffff'); }
    hline(g, 43, 47, 27, K);
    const eye = (x, y) => {
      if (mood === 'happy') { px(g, x - 1, y + 1, K); px(g, x, y, K); px(g, x + 1, y + 1, K); return; }
      if (mood === 'angry' || mood === 'glare') { hline(g, x - 2, x + 2, y, K); hline(g, x - 1, x + 1, y + 1, K); return; }
      rect(g, x - 1, y - 1, 2, 3, K); px(g, x - 1, y - 1, '#ffffff');
    };
    eye(38, 28); eye(52, 28);
    // brows
    if (mood === 'angry' || mood === 'glare') { linePx(g, 33, 21, 42, 24, K); linePx(g, 57, 21, 48, 24, K); }
    else { hline(g, 34, 41, 22, insp ? '#8a8799' : K); hline(g, 49, 56, 22, insp ? '#8a8799' : K); }
    // mouth / moustache
    if (insp) { polyPx(g, [[36, 39], [54, 39], [56, 43], [45, 41], [34, 43]], '#8a8799'); hline(g, 37, 53, 39, '#bdbac8'); }
    if (mood === 'happy') { hline(g, 40, 50, 43, K); px(g, 39, 42, K); px(g, 51, 42, K); rect(g, 41, 44, 9, 2, '#8c1c2c'); }
    else if (mood === 'angry') { rect(g, 39, 42, 12, 5, K); for (let x = 40; x < 51; x += 2) vline(g, x, 43, 45, '#ffffff'); }
    else hline(g, 41, 49, 43, K);
    if (mood !== 'angry') { disc(g, 34, 35, 2, '#f39a90'); disc(g, 56, 35, 2, '#f39a90'); }
    return c;
  });
}
function modeloForm(num, stamp) {
  return mdl('form:' + num + (stamp || ''), () => {
    const c = mkCanvas(48, 62), g = c.g;
    rect(g, 1, 2, 46, 60, INK); rect(g, 2, 1, 44, 60, INK);
    rect(g, 2, 2, 44, 58, '#fdfbf5'); rect(g, 44, 2, 2, 58, '#e3ddd0'); rect(g, 2, 58, 44, 2, '#e3ddd0');
    rect(g, 4, 4, 40, 9, '#cfe5f7'); tiny(g, 'MODELO', 24, 6, '#2a4f7a', { align: 'c' });
    mord(g, num, 24, 15, { u: 1.15, r: 1.25, rim: 1, sy: 1, fill: ['#1d1424', '#1d1424', '#2a2440'], line: '#fdfbf5', shadow: '#cfc8b8', slant: .05 });
    for (let y = 38; y < 56; y += 4) { hline(g, 7, 41, y, '#c8c6d3'); rect(g, 30, y - 2, 11, 3, '#eef1f6'); }
    return c;
  });
}
// a rubber stamp ("APROBADO" green / "DENEGADO" red / "¡MULTA!" red), ink-roughened
function hacStamp(word, col) {
  return mdl('stamp:' + word + col, () => {
    const st = { u: 1.6, r: 1.8, rim: 0, sy: 0, sx: 0, fill: [col, col, col], line: col, shadow: col, slant: 0 };
    const w = rd(mordW(word, st)) + 24, h = 44, c = mkCanvas(w, h), g = c.g;
    ringRect(g, 2, 2, w - 4, h - 4, 3, col); ringRect(g, 7, 7, w - 14, h - 14, 1, col);
    mord(g, word, w / 2, 11, st);
    // worn ink: knock out a sprinkle of pixels
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < w * h * .07; i++) g.fillRect(fl(hash2(i, 5) * w), fl(hash2(7, i) * h), 1, 1);
    return c;
  });
}
function anaHandOpen() {
  return mdl('anaHandOpen', () => {
    const SK = ANAB.skin;
    const palm = SD.ellipse(20, 26, 12, 10), fingers = SD.union(...[[9, 13], [15, 10], [22, 9], [28, 12]].map(([x, y]) => SD.capsule(x + 2, y + 10, x, y, 3.2, 2.8)));
    const thumb = SD.capsule(33, 26, 38, 18, 3.3, 2.8), wrist = SD.capsule(20, 34, 22, 48, 8, 8);
    return model(44, 48, [CEL(wrist, SK, 0), CEL(fingers, SK, .5, { th: 3 }), CEL(palm, SK, 1, { th: 6 }), CEL(thumb, SK, 1.2, { th: 3 })], { selout: false, post: g => { for (let x = 14; x < 31; x++) { px(g, x, 40 + (x % 4 === 0 ? 1 : 0), RAMP.gold[3]); px(g, x, 41, RAMP.gold[4]); } } });
  });
}
function modeloOffice() {
  return mdl('modeloOffice', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#d6e0e3'); for (let y = 0; y < 118; y += 12) hline(g, 0, SW, y, '#cbd6da');
    rect(g, 0, 116, SW, 76, '#bfc9cd');
    // the table (front view, a little perspective)
    polyPx(g, [[26, 112], [230, 112], [246, 132], [10, 132]], INK); polyPx(g, [[27, 113], [229, 113], [244, 131], [12, 131]], ANAB.wood[2]);
    hline(g, 28, 228, 114, '#d9a462'); rect(g, 10, 132, 236, 10, INK); rect(g, 11, 132, 234, 8, ANAB.wood[1]); rect(g, 11, 139, 234, 1, ANAB.wood[0]);
    for (const x of [22, 226]) { rect(g, x, 141, 10, 51, INK); rect(g, x + 1, 141, 8, 51, ANAB.wood[1]); rect(g, x + 1, 141, 2, 51, ANAB.wood[2]); }
    return c;
  });
}
defMG({
  id: 'modelo', stage: 'anahi', name: 'Papeles de autónoma', cmd: '¡ELIGE EL MODELO!', how: 'Dale a Hacienda el formulario que pide', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'organ', v: .45, n: 'D5 . F5 . A5 . F5 . E5 . G5 . Bb5 . G5 . F5 . A5 . D6 . A5 . C#6 - E5 - A4 - . .' },
    { i: 'pluck', v: .5, n: 'D4 . . D4 . . D4 . C4 . . C4 . . C4 . Bb3 . . Bb3 . . Bb3 . A3 . . A3 . C#4 . .' },
    { i: 'd', v: .6, n: 'r . r . r . r r r . r . r . r r r . r . r . r r r r r r s . . .' }] }),
  init(g) {
    const n = [2, 3, 4][g.level - 1], pool = MODELO_REQ.slice();
    shuffle(pool); g.req = pool[0];
    const opts = [g.req.n];
    const wrongs = shuffle(pool.slice(1).map(r => r.n).concat(MODELO_FAKE));
    while (opts.length < n) opts.push(wrongs.pop());
    shuffle(opts);
    const xs = { 2: [84, 172], 3: [62, 128, 194], 4: [46, 101, 156, 211] }[n];
    g.forms = opts.map((num, i) => ({ num, x: xs[i], y: 86, tx: xs[i], rot: g.r(-.12, .12), hand: 0 }));
    g.pick = null; g.handT = -1; g.verdictT = -1; g.hand = { x: 128, y: 196 }; g.shuf = g.level >= 3 ? .9 : -1;
    hacStamp('APROBADO', '#2a9a5a'); hacStamp('DENEGADO', '#e0283c');
  },
  update(g, dt) {
    // level 3: the forms swap places once, just to keep you honest
    if (g.shuf > 0 && g.t > g.shuf && !g.didShuf) { g.didShuf = true; const xs = g.forms.map(f => f.tx); shuffle(xs); g.forms.forEach((f, i) => f.tx = xs[i]); sfx('swoosh', { pitch: 1.3 }); }
    for (const f of g.forms) f.x = lerp(f.x, f.tx, .18);
    if (IN.tap && g.state === 'play' && !g.pick) {
      const f = g.forms.find(f => Math.abs(IN.x - f.x) < 26 && IN.y > f.y - 36 && IN.y < f.y + 36);
      if (f) { g.pick = f; g.handT = g.t; sfx('pop', { pitch: .7 }); }
    }
    if (g.pick) {
      const k = (g.t - g.handT) / .22, f = g.pick;
      if (k < 1) { g.hand.x = lerp(128, f.x, E.outQ(k)); g.hand.y = lerp(196, f.y + 20, E.outQ(k)); }
      else { const k2 = Math.min(1, (k - 1) * 1.6); g.hand.y = lerp(f.y + 20, -60, E.inQ(k2)); f.y = g.hand.y - 20; f.x = g.hand.x; if (k2 >= 1 && g.verdictT < 0) { g.verdictT = g.t; this.verdict(g); } }
    }
  },
  verdict(g) {
    const ok = g.pick.num === g.req.n;
    sfx('stamp'); sfx('slam'); HITSTOP = 4; g.shake(ok ? 3 : 5, .3); buzz(ok ? 15 : [40, 30, 40]);
    if (ok) { g.win(); g.fx.burst(128, 96, 18, { k: 'star', c: ['#5bd18b', '#fff', C.yellow], sp0: 60, sp1: 170 }); } else g.lose();
  },
  draw(g, c) {
    c.drawImage(modeloOffice(), 0, 0);
    g.forms.forEach((f, i) => { if (f === g.pick && g.verdictT >= 0) return; const idle = f === g.pick ? 0 : Math.sin(g.t * 3 + i * 1.7) * 1.2; drawS(c, modeloForm(f.num), f.x, f.y + idle, { rot: f === g.pick ? 0 : f.rot + idle * .02 }); });
    const wait = g.handT < 0 ? -12 + Math.sin(g.t * 4) * 2 : 0; // her hand hovers, ready to grab a form
    drawS(c, anaHandOpen(), g.hand.x, g.hand.y + wait, { ax: .45, ay: .3 });
    if (g.verdictT >= 0) {
      const k = spring(g.t - g.verdictT, 2.6, 7), ok = g.state === 'won';
      drawS(c, hacStamp(ok ? 'APROBADO' : 'DENEGADO', ok ? '#2a9a5a' : '#e0283c'), 128, 92, { rot: -.16, s: lerp(2.6, 1, Math.min(1, k)) * (k > 1 ? 1 : 1) });
    }
  },
  top(g, c) {
    // the Hacienda counter with the clerk and his request
    rect(c, 0, 44, SW, 148, '#e7eef0'); for (let y = 50; y < 150; y += 10) hline(c, 0, SW, y, '#dde6e9');
    panel(c, 12, 52, 50, 22, INK, { r: 3, line: INK }); tiny(c, 'TURNO', 37, 56, '#ffb0b8', { align: 'c' }); txt(c, '47', 37, 63, '#ff6b7a', { align: 'c', bold: true });
    const mood = g.verdictT >= 0 ? (g.state === 'won' ? 'happy' : 'angry') : 'neutral';
    drawS(c, funcionario('clerk', mood), 76, 150, { ax: .5, ay: 1 });
    rect(c, 18, 140, 118, 40, INK); rect(c, 19, 141, 116, 38, ANAB.wood[1]); rect(c, 19, 141, 116, 3, ANAB.wood[2]);
    panel(c, 46, 146, 60, 14, '#ffffff', { r: 2 }); tiny(c, 'HACIENDA', 76, 150, INK, { align: 'c' });
    if (g.verdictT >= 0 && g.state === 'won') drawS(c, modeloForm(g.pick.num), 110, 128, { rot: .1, s: 1 });
    // speech bubble with the request
    const bx = 140, by = 56, bw = 108, bh = 58;
    panel(c, bx, by, bw, bh, '#ffffff', { r: 8 }); polyPx(c, [[bx + 4, by + 34], [bx - 12, by + 44], [bx + 4, by + 44]], INK); polyPx(c, [[bx + 5, by + 36], [bx - 8, by + 43], [bx + 5, by + 42]], '#ffffff');
    const say = g.verdictT >= 0 ? (g.state === 'won' ? '¡Todo en orden!' : '¡Este no es!') : g.req.a + (g.level < 3 ? ' (el ' + g.req.n + ')' : '') + ', por favor.';
    txt(c, say, bx + 8, by + 8, INK, { wrap: bw - 14 });
  },
  bot(g) { const f = g.forms.find(f => f.num === g.req.n); return { x: f.x, y: f.y, down: g.t > .25 && !g.pick && fl(g.t * 20) % 3 === 0 }; },
  hint(g) { const f = g.forms.find(f => f.num === g.req.n); return { x: f.tx, y: f.y, mech: 'tap' }; },
});

// ---------------------------------------------------------------- 9 ¡EMPAREJA!
// a sweet grandma thinks of her dog; tap the right one and her red leash zips to it
function abuela(mood = 'think') {
  return mdl('abuela:' + mood, () => {
    const SK = ANAB.skin, P = ANAB.purple;
    const head = SD.smooth(2, SD.ellipse(22, 18, 10.5, 11), SD.ellipse(22, 24, 8, 6));
    const curls = SD.curls(SD.sub(SD.ellipse(22, 12, 12.5, 10), SD.ellipse(22, 22, 10, 9.5)), 1.6, .9, 2);
    const body = SD.smooth(3, SD.box(22, 44, 12, 14, 5), SD.ellipse(22, 33, 11, 4));
    const skirt = SD.poly([[11, 52], [33, 52], [36, 66], [8, 66]]);
    const legs = SD.union(SD.capsule(17, 64, 17, 74, 2.8, 2.5), SD.capsule(27, 64, 27, 74, 2.8, 2.5));
    const shoes = SD.union(SD.ellipse(16, 75, 4, 2.2), SD.ellipse(28, 75, 4, 2.2));
    const armR = mood === 'hug' ? SD.capsule(31, 36, 40, 44, 3.2, 3) : SD.capsule(31, 36, 38, 46, 3.2, 3);
    const handR = SD.circle(mood === 'hug' ? 40 : 38.5, mood === 'hug' ? 45 : 47, 3);
    const c = model(46, 80, [
      CEL(legs, ['#b98e7a', '#e8c4b0', '#fbe0d0'], 0, { th: 2 }), CEL(shoes, ['#3a2a2a', '#5a4444', '#7a6060'], .2, { th: 2 }),
      CEL(skirt, ANAB.mauve, .5, { th: 5 }), CEL(body, P, 1, { th: 10 }), CEL(armR, P, 1.6, { th: 3 }), CEL(handR, SK, 1.8, { th: 2 }),
      CEL(head, SK, 2, { th: 9 }), CEL(curls, ANAB.hairG, 2.5, { th: 4 }),
    ], { selout: false });
    const g = c.g, K = INK;
    // glasses, eyes, cheeks, mouth, cardigan buttons + collar
    for (const ex of [18, 26]) { ringPx(g, ex, 19, 3.2, K); px(g, ex - 1, 18, '#ffffff'); }
    hline(g, 21, 23, 19, K);
    const e = (x) => { if (mood === 'happy' || mood === 'hug') { px(g, x - 1, 20, K); px(g, x, 19, K); px(g, x + 1, 20, K); } else if (mood === 'cross') { hline(g, x - 1, x + 1, 19, K); } else rect(g, x, 18, 1, 2, K); };
    e(18); e(26);
    disc(g, 14, 24, 1.6, '#f39a90'); disc(g, 30, 24, 1.6, '#f39a90');
    if (mood === 'cross') { hline(g, 20, 24, 27, K); px(g, 19, 28, K); px(g, 25, 28, K); linePx(g, 15, 14, 19, 16, K); linePx(g, 29, 14, 25, 16, K); }
    else { px(g, 19, 26, K); hline(g, 20, 24, 27, K); px(g, 25, 26, K); }
    polyPx(g, [[17, 31], [27, 31], [22, 36]], '#fff8f0'); for (const y of [39, 45, 51]) disc(g, 22, y, 1, '#fff27a');
    return c;
  });
}
// small side-view dogs for the line-up (45x34-ish); coll = collar colour
const EMP_BREEDS = ['westie', 'teckel', 'husky', 'caniche', 'carlino'];
function empDog(breed, coll, pose = 'stand') {
  return mdl('empDog:' + breed + coll + pose, () => {
    const W = 50, H = 38, hop = pose === 'hop';
    let parts, post;
    const legs = (x0, x1, y, r, ramp, len = 8) => [CEL(SD.capsule(x0, y, x0, y + len - (hop ? 3 : 0), r, r * .9), ramp, .2, { th: 2 }), CEL(SD.capsule(x1, y, x1, y + len - (hop ? 3 : 0), r, r * .9), ramp, .2, { th: 2 })];
    if (breed === 'westie') { return westieSide(.52, hop ? 'wag' : 'stand', 'happy'); }
    if (breed === 'teckel') {
      const R = RAMP.caramel.slice(1, 4);
      const body = SD.capsule(12, 22, 34, 22, 7, 7), head = SD.ellipse(39, 16, 6.5, 5.5), snout = SD.capsule(40, 18, 48, 19, 3.2, 2.4), ear = SD.ellipse(36, 20, 3, 6, .3), tail = SD.capsule(11, 20, 4, 14, 1.8, 1.1);
      parts = [CEL(tail, R, 0, { th: 2 }), ...legs(15, 32, 26, 2.4, R, 7), CEL(body, R, 1, { th: 7 }), CEL(head, R, 2, { th: 5 }), CEL(snout, R, 2.2, { th: 3 }), CEL(ear, ['#4e2616', '#7c3f1f', '#ab6130'], 2.5, { th: 3 })];
      post = g => { rect(g, 39, 14, 2, 2, INK); px(g, 39, 14, '#fff'); disc(g, 48, 18, 1.4, INK); };
    } else if (breed === 'husky') {
      const G = ['#4a4e5e', '#7a8096', '#aab0c4'], Wt = ANAB.shirt;
      const body = SD.ellipse(24, 21, 13, 8), head = SD.ellipse(38, 13, 7, 6.5), snout = SD.ellipse(44, 16, 4, 3), earA = SD.poly([[34, 8], [35, 1], [38.5, 7]]), earB = SD.poly([[38, 7], [41, 1], [42, 8]]), tail = SD.curve([12, 18], [4, 12], [10, 7], 2.8, 2);
      parts = [CEL(tail, G, 0, { th: 2 }), ...legs(15, 31, 26, 2.6, Wt, 8), CEL(body, G, 1, { th: 8 }), CEL(earA, G, 1.5, { th: 2 }), CEL(earB, G, 1.5, { th: 2 }), CEL(head, G, 2, { th: 5 }), CEL(snout, Wt, 2.3, { th: 3 })];
      post = g => { polyPx(g, [[34, 14], [42, 12], [44, 17], [36, 19]], '#eef0f6'); rect(g, 38, 12, 2, 2, '#63a0ef'); px(g, 38, 12, INK); disc(g, 47, 15, 1.3, INK); polyPx(g, [[16, 24], [30, 24], [28, 28], [18, 28]], '#e6ecf5'); };
    } else if (breed === 'caniche') {
      const A = ['#c98a4a', '#f0b573', '#ffdfa8'];
      const body = SD.curls(SD.ellipse(23, 19, 11, 8), 1.4, 1.1, 3), head = SD.curls(SD.circle(37, 11, 7), 1.2, 1.2, 5), snout = SD.ellipse(44, 14, 4, 2.5), tail = SD.curls(SD.circle(9, 10, 4), 1, 1.3, 1);
      parts = [CEL(tail, A, 0, { th: 3 }), ...legs(16, 29, 24, 2.2, A, 10), CEL(body, A, 1, { th: 7 }), CEL(head, A, 2, { th: 5 }), CEL(snout, A, 2.2, { th: 2 })];
      post = g => { rect(g, 38, 9, 2, 2, INK); px(g, 38, 9, '#fff'); disc(g, 47, 13, 1.3, INK); };
    } else { // carlino (pug)
      const F = ['#b58a55', '#e0b77e', '#f5d6a0'];
      const body = SD.ellipse(23, 21, 12, 8.5), head = SD.circle(37, 14, 8), tail = SD.curve([12, 17], [7, 12], [12, 10], 2.4, 1.8), ear = SD.ellipse(34, 8, 3, 2.5);
      parts = [CEL(tail, F, 0, { th: 2 }), ...legs(15, 31, 26, 2.8, F, 7), CEL(body, F, 1, { th: 8 }), CEL(head, F, 2, { th: 6 }), CEL(ear, ['#2b2540', '#40395e', '#5f5883'], 2.5, { th: 2 })];
      post = g => { ellipsePx(g, 40, 16, 5, 4, '#2b2540'); rect(g, 36, 11, 2, 2, INK); px(g, 36, 11, '#fff'); rect(g, 41, 11, 2, 2, INK); disc(g, 42, 15, 1.2, '#0b0810'); };
    }
    const c = model(W, H, parts, { selout: false, post });
    return c;
  });
}
function drawEmpDog(g, d, x, y, hop) {
  const img = empDog(d.breed, d.coll, hop ? 'hop' : 'stand');
  drawS(g, img, x, y, { ax: .5, ay: 1, flip: d.flip });
  // a colour bandana at the neck, so look-alikes can be told apart at a glance
  const cxo = d.breed === 'westie' ? (d.flip ? -13 : 13) : (d.flip ? -9 : 9), cyo = d.breed === 'westie' ? -20 : -22;
  const bx = x + cxo, by = y + cyo;
  polyPx(g, [[bx - 5, by - 1], [bx + 5, by - 1], [bx, by + 7]], INK); polyPx(g, [[bx - 4, by], [bx + 4, by], [bx, by + 5]], d.coll); px(g, bx - 1, by + 1, '#ffffff');
}
defMG({
  id: 'empareja', stage: 'anahi', name: 'Cada oveja con su pareja', cmd: '¡EMPAREJA!', how: 'Toca el perro en el que piensa la abuela', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'vib', v: .6, n: 'F5 . A5 . C6 . A5 . Bb5 . G5 . E5 . G5 . F5 . A5 . C6 . F6 . E6 . C6 . G5 - . .' },
    { i: 'bell', v: .35, n: '. . . . . . . . . . . . . . . . . . . . . . . . C7 . . . A6 . . .' },
    { i: 'bass', v: .8, n: 'F2 . . F2 . . C3 . Bb2 . . Bb2 . . C3 . F2 . . F2 . . A2 . C3 . . C3 . . E2 .' },
    { i: 'd', v: .5, n: 'k . z . s . z z k . z . s . z . k . z . s . z z k . z . s z s .' }] }),
  init(g) {
    const n = [3, 4, 5][g.level - 1], cols = ['#e23b4e', '#3565cc', '#ffdf4f', '#5bd18b'];
    let breeds = shuffle(EMP_BREEDS.slice()).slice(0, n);
    // level 2+: a look-alike (same breed, different collar) to make you check the bubble
    if (g.level >= 2) breeds[n - 1] = breeds[0];
    g.dogs = breeds.map((b, i) => ({ breed: b, coll: cols[(i + (b === breeds[0] && i > 0 ? 1 : 0)) % 4], x: 0, y: 176, vx: 0, hopT: g.r(TAU), flip: g.r() < .5 }));
    // same-breed dogs get different collars
    const seen = {}; g.dogs.forEach((d, i) => { if (seen[d.breed]) d.coll = cols[(seen[d.breed] + i) % 4]; seen[d.breed] = (seen[d.breed] || 0) + 1; });
    shuffle(g.dogs);
    const x0 = 96, x1 = 236; g.dogs.forEach((d, i) => { d.x = n === 1 ? 170 : lerp(x0, x1, i / (n - 1)); d.vx = g.level >= 3 ? g.r(18, 34) * (g.r() < .5 ? -1 : 1) * g.tempo : 0; });
    g.target = g.dogs[fl(g.r(n))];
    g.leash = null; g.hugT = -1; g.ab = { x: 38, y: 176 };
    for (const m of ['happy', 'hug', 'cross']) abuela(m); empDog(g.target.breed, g.target.coll, 'hop'); // the endings, prebuilt
  },
  update(g, dt) {
    for (const d of g.dogs) {
      d.hopT += dt * 6;
      if (d.vx && !d.caught) { d.x += d.vx * dt; if (d.x < 92 || d.x > 238) { d.vx *= -1; d.x = clamp(d.x, 92, 238); } d.flip = d.vx < 0; }
      if (d.run) { d.x += d.run * dt; }
    }
    if (IN.tap && g.state === 'play' && !g.leash) {
      let best = null, bd = 24; for (const d of g.dogs) { const dd = dist(IN.x, IN.y, d.x, d.y - 14); if (dd < bd) { bd = dd; best = d; } }
      if (best) { g.leash = { d: best, t: 0 }; sfx('swoosh', { pitch: 1.6 }); }
    }
    if (g.leash) {
      g.leash.t += dt;
      if (g.leash.t > .18 && !g.leash.done) {
        g.leash.done = true; const d = g.leash.d;
        if (d === g.target) { d.caught = true; g.hugT = g.t + .35; sfx('bark', { pitch: 1.3 }); sfx('heart', { delay: .2 }); HITSTOP = 3; g.fx.burst(d.x, d.y - 14, 12, { k: 'heart', c: '#ff5d9e', sp0: 30, sp1: 90, life0: .5, life1: .9 }); g.win(); }
        else { d.run = (d.x > 128 ? 1 : -1) * 220; sfx('yip', { pitch: 1.3 }); g.fx.add({ k: 'txt', s: '¡Ese no!', x: 60, y: 96, life: .8, c: '#ffffff' }); g.shake(3, .2); g.lose(); }
      }
    }
    if (g.hugT > 0 && g.t > g.hugT) { const d = g.target; d.x = lerp(d.x, g.ab.x + 26, .12); }
  },
  draw(g, c) {
    // sky, clouds, the park grass
    bandsV(c, 0, 0, SW, 150, ['#8fd0f5', '#a8dbf7', '#c2e6f9']);
    for (const [x, y, r] of [[40, 30, 12], [58, 26, 9], [190, 40, 14], [212, 36, 10]]) disc(c, x + Math.sin(g.t * .5) * 3, y, r, '#ffffff');
    rect(c, 0, 150, SW, 42, '#56ab4a'); for (let x = 0; x < SW; x += 3) px(c, x, 150 + (x % 2), '#3e8f3a'); rect(c, 0, 176, SW, 16, '#3e8f3a');
    for (let x = 4; x < SW; x += 9) { px(c, x, 160 + (x * 7 % 9), '#6fc25f'); px(c, x + 3, 168 + (x * 5 % 6), '#6fc25f'); }
    // grandma + her thought
    const mood = g.state === 'won' ? 'hug' : g.state === 'lost' ? 'cross' : 'think';
    drawS(c, abuela(mood), g.ab.x, g.ab.y, { ax: .5, ay: 1 });
    const tb = { x: 54, y: 34, w: 64, h: 48 };
    for (const [x, y, r] of [[40, 90, 2.5], [46, 84, 3.5]]) { disc(c, x, y, r + 1, INK); disc(c, x, y, r, '#ffffff'); }
    panel(c, tb.x, tb.y, tb.w, tb.h, '#ffffff', { r: 14 });
    drawEmpDog(c, g.target, tb.x + tb.w / 2, tb.y + tb.h - 6, false);
    // dogs
    for (const d of g.dogs) { if (d.run && (d.x < -30 || d.x > SW + 30)) continue; drawEmpDog(c, d, rd(d.x), rd(d.y - (Math.sin(d.hopT) > .7 ? 2 : 0)), d.caught); }
    // the leash zipping out of her hand
    if (g.leash) {
      const k = Math.min(1, g.leash.t / .18), d = g.leash.d, hx = g.ab.x + 17, hy = g.ab.y - 33, tx = lerp(hx, d.x, k), ty = lerp(hy, d.y - 18, k);
      thickLine(c, hx, hy, tx, ty, 1.2, INK); linePx(c, hx, hy, tx, ty, '#e23b4e');
      if (g.state === 'lost' && k >= 1) { c.globalAlpha = .6; linePx(c, hx, hy, hx + 20, hy + 20, '#e23b4e'); c.globalAlpha = 1; }
    }
    // the reunion, in close-up
    if (g.state === 'won' && g.t > g.hugT) {
      const k = spring(g.t - g.hugT, 2.2, 6); c.save(); c.translate(SW / 2, 96); c.scale(k, k);
      panel(c, -86, -60, 172, 120, '#ffd1e4', { r: 12 });
      c.save(); c.beginPath(); c.rect(-84, -58, 168, 116); c.clip();
      for (let i = 0; i < 10; i++) drawHeart(c, -70 + i * 16, -48 + (i % 2) * 90, '#ff93bf', 1);
      drawS(c, abuela('happy'), -34, 110, { ax: .5, ay: 1, s: 2 });
      const T = g.target; drawS(c, empDog(T.breed, T.coll, 'hop'), 36, 50, { ax: .5, ay: 1, s: 2, flip: true });
      c.restore(); c.restore();
    }
  },
  bot(g) { const d = g.target; return { x: d.x, y: d.y - 14, down: g.t > .3 && !g.leash && fl(g.t * 20) % 3 === 0 }; },
  hint(g) { const d = g.target; return { x: d.x, y: d.y - 14, mech: 'tap' }; },
});

// ============================================================================
//  Two more from a day at the salon: ¡SUBE! (the shop opens at 9:30 sharp)
//  and ¡ABRE! (the doorbell: open only to whoever brings a dog).
// ============================================================================
// a speech box with a tail pointing at (tx, ty)
function anaSay(g, x, y, w, s, tx, ty) {
  const lines = wrapText(s, w - 12), h = lines.length * 10 + 9, mx = clamp(tx, x + 8, x + w - 8), up = ty < y;
  polyPx(g, [[mx - 5, up ? y + 1 : y + h - 1], [tx, ty], [mx + 5, up ? y + 1 : y + h - 1]], INK);
  panel(g, x, y, w, h, '#ffffff', { r: 6 });
  polyPx(g, [[mx - 4, up ? y + 2 : y + h - 2], [tx + (tx < mx ? 1 : -1), ty + (up ? 2 : -2)], [mx + 4, up ? y + 2 : y + h - 2]], '#ffffff');
  lines.forEach((l, i) => txt(g, l, x + w / 2, y + 5 + i * 10, INK, { align: 'c' }));
}

// ---------------------------------------------------------------- 10 ¡SUBE! -
// 9:29 in Carrer de Viladomat: the clients are already queueing and the metal
// shutter is still down. Mash to crank it up before it slides back down.
const PERS = { x: 26, y: 36, w: 204, h: 136 };
function persianaShutter() {
  return mdl('persShutter', () => {
    const W = PERS.w, H = PERS.h, c = mkCanvas(W, H), g = c.g;
    const slat = ['#4e4d5a', '#d6d4df', '#c2c0cc', '#b0aebd', '#9c9aab', '#85839a'];
    for (let y = 0; y < H; y++) { g.fillStyle = slat[y % 6]; g.fillRect(0, y, W, 1); }
    for (let i = 0; i < 420; i++) { const x = fl(hash2(i, 3) * W), y = fl(hash2(7, i) * H); if (y % 6) px(g, x, y, hash2(i, 11) < .5 ? '#cfcdd8' : '#8e8c9c'); }
    // the mural: Keiko's face in spray paint, dripping
    const P = '#ff5d9e', blobs = [[58, 62, 30], [34, 78, 10], [82, 78, 10], [45, 90, 9], [71, 90, 9]];
    const ears = [[[28, 48], [33, 12], [56, 36]], [[60, 36], [83, 12], [88, 48]]];
    for (const e of ears) polyPx(g, e.map(([x, y]) => [x + (x < 58 ? -3 : 3), y - (y < 20 ? 3 : 0)]), P);
    for (const [x, y, r] of blobs) { disc(g, x, y, r + 3, P); for (let i = 0; i < r * 4; i++) { const a = hash2(i, x + y) * TAU, d = r + 3 + hash2(y, i + x) * 3; px(g, x + Math.cos(a) * d, y + Math.sin(a) * d, P); } }
    for (const [x, y0, len] of [[27, 82, 16], [42, 97, 12], [66, 98, 20], [90, 84, 10]]) { vline(g, x, y0, y0 + len, P); vline(g, x + 1, y0, y0 + len - 3, P); disc(g, x + .5, y0 + len, 1.6, P); }
    for (const e of ears) polyPx(g, e, '#ffffff');
    for (const [x, y, r] of blobs) disc(g, x, y, r, '#ffffff');
    polyPx(g, [[34, 42], [36, 22], [51, 36]], '#ffc2da'); polyPx(g, [[65, 36], [80, 22], [82, 42]], '#ffc2da');
    for (const ex of [46, 70]) { disc(g, ex, 60, 5, INK); disc(g, ex - 2, 58, 1.6, '#ffffff'); }
    ellipsePx(g, 58, 73, 7, 5, INK); px(g, 55, 71, '#ffffff'); px(g, 56, 71, '#ffffff');
    vline(g, 58, 77, 81, INK); linePx(g, 58, 81, 52, 84, INK); linePx(g, 58, 81, 64, 84, INK);
    disc(g, 58, 87, 3.5, INK); disc(g, 58, 87, 2.6, '#ff93bf');
    polyPx(g, [[32, 99], [84, 99], [58, 123]], INK); polyPx(g, [[35, 100], [81, 100], [58, 120]], '#3fb56f');
    for (const [x, y] of [[48, 104], [62, 103], [56, 111], [68, 107]]) { px(g, x, y, '#ffffff'); px(g, x + 1, y, '#ffffff'); }
    // the tag: KEIKO in bubble letters, WB and a heart
    mord(g, 'KEIKO', 150, 18, { u: 1.9, r: 2.5, rim: 2, sy: 2, fill: ['#fff27a', '#ffc23a', '#ff9f4f'], line: INK, shadow: '#7b4fc0', slant: .15 });
    mord(g, 'WB', 140, 64, { u: 1.7, r: 2.3, rim: 2, sy: 2, fill: ['#b6ffd0', '#5bd18b', '#2a9a5a'], line: INK, shadow: INK, slant: .1 });
    drawHeart(g, 176, 76, P, 2);
    // scribbled little tags, like on every shutter in town
    for (const [x0, y0, col] of [[112, 112, INK], [150, 118, '#3565cc'], [178, 106, INK]]) for (let i = 0; i < 16; i++) linePx(g, x0 + i, y0 + Math.sin(i * .9 + x0) * 4, x0 + i + 1, y0 + Math.sin((i + 1) * .9 + x0) * 4, col);
    tiny(g, 'BCN', 186, 126, INK);
    return c;
  });
}
function persianaFacade() {
  return mdl('persFacade', () => {
    const c = mkCanvas(SW, SH), g = c.g, X = PERS.x, Y = PERS.y, W = PERS.w, H = PERS.h;
    rect(g, 0, 0, SW, SH, '#e3cfaf');
    for (let i = 0; i < 520; i++) px(g, hash2(i, 9) * SW, hash2(9, i) * SH, hash2(i, 2) < .5 ? '#d4bd98' : '#eadbc0');
    // stone surround and the shutter box
    rect(g, X - 7, Y - 9, W + 14, H + 9, INK); rect(g, X - 6, Y - 8, W + 12, H + 8, '#cfae84'); rect(g, X - 6, Y - 8, W + 12, 2, '#e2c69c');
    rect(g, X - 1, Y - 8, W + 2, 8, INK); rect(g, X, Y - 7, W, 6, '#6b6977'); rect(g, X, Y - 7, W, 1, '#9896a4');
    for (let x = X + 8; x < X + W; x += 26) px(g, x, Y - 4, '#c8c6d3');
    drawS(g, wbSign({ noCrest: true, noTag: true }), SW / 2, Y - 10, { ax: .5, ay: 1 });
    // the street number on its blue enamel plate
    panel(g, 237, 146, 17, 11, '#2f5fb3', { r: 2 }); tiny(g, '185', 246, 149, '#ffffff', { align: 'c' });
    // pavement
    fillPat(g, panotPat(), 0, Y + H, SW, SH - Y - H); rect(g, 0, Y + H, SW, 1, '#8f8a82');
    return c;
  });
}
// the street (top screen): façades, the plane tree and the pharmacy's clock
function persianaStreet() {
  return mdl('persStreet', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 60, ['#9cc8ff', '#b3d5ff', '#cae2ff', '#e0eeff']);
    eixampleFacade(g, 0, 36, SW, 124, 11);
    rect(g, 0, 150, SW, 4, '#cfae84'); fillPat(g, panotPat(), 0, 154, SW, 38); rect(g, 0, 154, SW, 1, '#8f8a82');
    planeTrunk(g, 236, 40, 170, 10);
    for (let i = 0; i < 12; i++) disc(g, 214 + hash2(i, 5) * 48, 20 + hash2(5, i) * 30, 11, i % 2 ? '#5a8f3e' : '#6fa64a');
    // the farmacia's green LED cross on its bracket: the time
    thickLine(g, 0, 70, 22, 70, 1.2, INK); thickLine(g, 0, 70, 22, 70, .6, '#6b6977');
    return c;
  });
}
function pharmaClock(g, x, y, time, t) {
  const s = 12, cells = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of cells) rect(g, x + dx * s - s / 2 - 1, y + dy * s - s / 2 - 1, s + 2, s + 2, INK);
  for (const [dx, dy] of cells) { const bx = x + dx * s - s / 2, by = y + dy * s - s / 2; rect(g, bx, by, s, s, '#1f8a3a'); for (let i = 1; i < s; i += 2) for (let j = 1; j < s; j += 2) px(g, bx + i, by + j, (i + j + fl(t * 6)) % 6 ? '#48e070' : '#c8ffd4'); }
  rect(g, x - s * 1.5, y - 5, s * 3, 10, '#0d2a14'); tiny(g, time, x, y - 2, '#8dffb0', { align: 'c' });
}
defMG({
  id: 'persiana', stage: 'anahi', name: 'Las nueve y media', cmd: '¡SUBE!', how: 'Toca sin parar para subir la persiana', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'G5 . E5 . C5 . E5 . G5 . C6 . B5 . G5 . A5 . F5 . D5 . F5 . A5 . D6 . C6 . B5 .' },
    { i: 'bell', v: .3, n: 'C6 . . . . . . . . . . . . . . . F6 . . . . . . . . . . . G6 . . .' },
    { i: 'bass', v: .85, n: 'C3 . G2 . C3 . G2 . E3 . G2 . E3 . G2 . F2 . C3 . F2 . C3 . D3 . G2 . B2 . G2 .' },
    { i: 'd', v: .7, n: 'k . h h s . h . k . h h s . h h k . h h s . h . k k h h s s s s' }] }),
  init(g) {
    g.need = Math.max(6, Math.round([8, 11, 14][g.level - 1] * Math.min(1, 1.1 / g.tempo)));
    g.fall = [.3, .42, .55][g.level - 1];
    g.open = 0; g.lastTap = -9; g.crank = 0; g.crankTo = 0; g.kick = 0;
  },
  update(g, dt) {
    g.kick = Math.max(0, g.kick - dt * 6);
    g.crank = lerp(g.crank, g.crankTo, Math.min(1, dt * 18));
    if (g.state === 'won') { g.open = Math.min(1, g.open + dt * 3); return; }
    if (g.state === 'lost') { if (g.open > 0 && g.open - dt * 5 <= 0) { sfx('slam'); g.shake(3, .2); g.fx.add({ k: 'txt', s: '¡CLONC!', x: 128, y: 150, life: .8, c: '#ffffff' }); } g.open = Math.max(0, g.open - dt * 5); return; }
    if (IN.tap) {
      g.open = Math.min(1, g.open + 1 / g.need); g.lastTap = g.t; g.kick = 1; g.crankTo += Math.PI / 2;
      sfx('ratchet', { pitch: .8 + g.open * .7 }); buzz(5);
      for (let i = 0; i < 2; i++) g.fx.add({ k: 'puff', x: PERS.x + g.r(PERS.w), y: PERS.y + 1, vx: g.r(-12, 12), vy: g.r(10, 30), r: g.r(1.5, 3), life: .4, c: '#cfc8b8' });
      if (g.open >= 1) {
        g.win(); HITSTOP = 3; flash('bot', '#fff7ae', .15);
        sfx('bark', { n: 2, pitch: 1.2, delay: .12 }); sfx('sparkle', { delay: .05 });
        g.fx.burst(128, 110, 16, { k: 'star', c: [C.yellow, '#ffffff'], sp0: 50, sp1: 140 });
      }
    } else if (g.t - g.lastTap > .3) g.open = Math.max(0, g.open - g.fall * g.tempo * dt);
  },
  draw(g, c) {
    const X = PERS.x, Y = PERS.y, W = PERS.w, H = PERS.h, won = g.state === 'won', lost = g.state === 'lost';
    c.drawImage(persianaFacade(), 0, 0);
    // the salon behind the glass, dark until the lights come on
    c.drawImage(salonBackdrop(), X, 52, W, H, X, Y, W, H);
    const wt = won ? g.t - g.decidedAt : 0;
    drawKeikoSit(c, X + W * .64, Y + H - 2 - (won ? Math.abs(Math.sin(wt * 9)) * 8 : 0), won ? 'happy' : lost ? 'sad' : g.open > .45 ? 'wow' : 'normal');
    const lit = won ? clamp(wt / .15, 0, 1) : 0;
    if (lit < 1) { c.globalAlpha = (1 - lit) * .7; rect(c, X, Y, W, H, '#141a2a'); c.globalAlpha = 1; }
    c.globalAlpha = .22; for (let i = 0; i < 3; i++) thickLine(c, X + 118 + i * 9, Y, X + 70 + i * 9, Y + H, .8, '#ffffff'); c.globalAlpha = 1;
    if (won && wt > .1) { const k = spring(wt - .1, 2.4, 6); c.save(); c.translate(X + 52, Y + 44); c.scale(k, k); panel(c, -30, -9, 60, 18, '#ff5d9e', { r: 9, line: INK }); tiny(c, 'ABIERTO', 0, -2, '#ffffff', { align: 'c' }); c.restore(); }
    // the shutter: whatever is still down of it
    const hv = rd(H * clamp(1 - g.open, 0, 1)) - (g.state === 'play' ? rd(g.kick * 2) : 0);
    if (hv > 0) {
      c.drawImage(persianaShutter(), 0, H - hv, W, hv, X, Y, W, hv);
      const yb = Y + hv;
      rect(c, X, yb - 5, W, 5, INK); rect(c, X, yb - 4, W, 3, '#6b6977'); rect(c, X, yb - 4, W, 1, '#b3b1bd');
      for (const hx of [X + 30, X + W - 30]) { rect(c, hx - 6, yb - 2, 12, 4, INK); rect(c, hx - 5, yb - 1, 10, 2, RAMP.steel[4]); }
      disc(c, X + W / 2, yb - 2, 3, INK); disc(c, X + W / 2, yb - 2, 2, RAMP.gold[3]);
    }
    // the crank on the pillar turns with every tap
    const cx = 246, cy = 124, a = g.crank, ex = cx + Math.cos(a) * 8, ey = cy + 2 + Math.sin(a) * 3;
    thickLine(c, cx, Y - 4, cx, cy, 1.4, INK); vline(c, cx, Y - 3, cy, RAMP.steel[3]);
    thickLine(c, cx, cy, ex, ey, 1.6, INK); linePx(c, cx, cy, ex, ey, RAMP.steel[4]);
    rect(c, ex - 2, ey, 5, 9, INK); rect(c, ex - 1, ey + 1, 3, 7, '#e23b4e'); px(c, ex - 1, ey + 1, '#ff9aa6');
    if (g.state === 'play' && g.kick > .6) txt(c, '¡ÑIC!', cx - 8, cy - 18, '#ffffff', { align: 'c', out: INK });
    if (won && wt > .2) shout(c, '¡BUENOS DÍAS!', 128, 150, wt - .2);
  },
  top(g, c) {
    c.drawImage(persianaStreet(), 0, 0);
    const won = g.state === 'won', lost = g.state === 'lost', t = g.t;
    pharmaClock(c, 36, 84, won ? '9:30' : lost ? '9:31' : '9:29', t);
    // the queue: a grandma walking three dogs, all waiting for the shop to open
    const ax = 128, ay = 184, hy = ay - 33;
    const dogs = [['teckel', 76, '#3565cc'], ['carlino', 176, '#e23b4e'], ['caniche', 222, '#ffdf4f']];
    for (const [br, x, col] of dogs) {
      const hop = won ? fl(t * 8 + x) % 2 === 0 : !lost && fl(t * 3 + x * .1) % 4 === 0, flip = x < ax, y = 186 - (hop ? 3 : 0);
      linePx(c, ax + (flip ? -15 : 15), hy, x + (flip ? 10 : -10), y - 22, '#e23b4e');
      drawEmpDog(c, { breed: br, coll: col, flip }, x, y, hop);
    }
    drawS(c, abuela(won ? 'happy' : lost ? 'cross' : 'think'), ax, ay - (won ? Math.abs(Math.sin(t * 9)) * 3 : 0), { ax: .5, ay: 1 });
    anaSay(c, 146, 62, 100, won ? '¡Buenos días, Keiko!' : lost ? '¡Ya son y media pasadas!' : '¿Abrís ya o qué?', ax + 6, ay - 80);
    if (won) for (let i = 0; i < 3; i++) drawHeart(c, 110 + i * 40, 120 - ((t * 30 + i * 13) % 30), '#ff5d9e', 1);
  },
  bot(g) { return { x: 128, y: 110, down: g.state === 'play' && fl(g.t * 60) % 4 < 2 }; },
  hint(g) { return { x: 128, y: 110, mech: 'tap' }; },
});

// ---------------------------------------------------------------- 11 ¡ABRE! -
// ding-dong at the salon door: open only to whoever brings a dog
const TIMB = { x: 78, y: 12, w: 100, h: 166 };
function timbreGuiri() {
  return mdl('timbreGuiri', () => {
    const SK = ['#c9705a', '#f5a38a', '#ffd2c0'], KH = ['#8a7a4a', '#c9b47a', '#eadca8'], SHI = ['#1f5fa8', '#3f8fe0', '#8cc4ff'];
    const head = SD.smooth(2, SD.ellipse(25, 22, 9.5, 10.5), SD.ellipse(25, 28, 7.5, 5));
    const hat = SD.smooth(2, SD.ellipse(25, 14, 14, 3.6), SD.box(25, 10, 8.5, 5.5, 3));
    const body = SD.smooth(3, SD.box(25, 46, 12.5, 12, 5), SD.ellipse(25, 35, 11.5, 4.5));
    const shorts = SD.box(25, 62, 12, 6, 2);
    const legs = SD.union(SD.capsule(20, 66, 20, 80, 3.2, 2.8), SD.capsule(30, 66, 30, 80, 3.2, 2.8));
    const sandals = SD.union(SD.ellipse(19, 83, 4.6, 2), SD.ellipse(31, 83, 4.6, 2));
    const armL = SD.capsule(13, 38, 9, 54, 3.3, 3), armR = SD.capsule(37, 38, 42, 50, 3.3, 3);
    const c = model(52, 88, [
      CEL(legs, SK, 0, { th: 2 }), CEL(sandals, ['#5a3a22', '#8a5a34', '#b07c4c'], .2, { th: 2 }),
      CEL(shorts, KH, .5, { th: 4 }), CEL(armL, SK, .8, { th: 3 }), CEL(body, SHI, 1, { th: 9 }), CEL(armR, SK, 1.6, { th: 3 }),
      CEL(head, SK, 2, { th: 9 }), CEL(hat, KH, 2.5, { th: 4 }),
    ], { selout: false });
    const g = c.g, K = INK;
    // sunglasses, sunburnt nose, a big grin
    rect(g, 18, 20, 6, 3, K); rect(g, 26, 20, 6, 3, K); hline(g, 24, 26, 20, K); px(g, 19, 20, '#8cc4ff'); px(g, 27, 20, '#8cc4ff');
    disc(g, 25, 25, 1.5, '#ff7a6a'); hline(g, 22, 28, 28, K); px(g, 21, 27, K); px(g, 29, 27, K);
    // flowered shirt, camera, white socks
    for (const [x, y] of [[18, 40], [31, 44], [22, 52], [33, 54], [17, 56], [27, 38]]) { px(g, x, y, '#fff27a'); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) px(g, x + dx, y + dy, '#ff93bf'); }
    linePx(g, 17, 36, 22, 46, K); linePx(g, 33, 36, 28, 46, K); rect(g, 20, 45, 10, 7, K); rect(g, 21, 46, 8, 5, '#44424f'); disc(g, 25, 48, 1.6, '#8cc4ff');
    rect(g, 17, 78, 6, 3, '#ffffff'); rect(g, 27, 78, 6, 3, '#ffffff');
    // the unfolded map
    polyPx(g, [[38, 43], [51, 41], [51, 57], [38, 59]], K); polyPx(g, [[39, 44], [50, 42], [50, 56], [39, 58]], '#f2ede2');
    vline(g, 44, 44, 57, '#cfc8b8'); linePx(g, 40, 55, 48, 46, '#e23b4e'); disc(g, 48, 46, 1, '#e23b4e');
    return c;
  });
}
// a pink balloon dog on a string (the trick visitor)
function balloonDog(g, x, y) {
  const P = ['#c2336f', '#ff5d9e', '#ffc2da'];
  const sausage = (x0, y0, x1, y1, r) => { thickLine(g, x0, y0, x1, y1, r + 1, INK); };
  const fill = (x0, y0, x1, y1, r) => { thickLine(g, x0, y0, x1, y1, r, P[1]); linePx(g, x0, y0 - r * .5, x1, y1 - r * .5, P[2]); };
  const parts = [[x - 10, y, x + 8, y, 4], [x - 9, y + 2, x - 11, y + 12, 2.6], [x - 5, y + 2, x - 4, y + 12, 2.6], [x + 5, y + 2, x + 4, y + 12, 2.6], [x + 8, y + 2, x + 10, y + 12, 2.6], [x + 9, y - 2, x + 12, y - 12, 3], [x + 12, y - 12, x + 20, y - 11, 3], [x - 11, y - 1, x - 16, y - 8, 2.2]];
  for (const p of parts) sausage(...p); for (const p of parts) fill(...p);
  disc(g, x + 11, y - 17, 3.4, INK); disc(g, x + 11, y - 17, 2.4, P[1]); disc(g, x + 14, y - 16, 3.4, INK); disc(g, x + 14, y - 16, 2.4, P[1]);
  px(g, x + 16, y - 12, INK); px(g, x + 10, y - 16, P[2]);
}
function timbreCat(g, x, y) {
  ellipsePx(g, x, y - 12, 13, 12, INK); ellipsePx(g, x, y - 12, 12, 11, '#2b2540'); ellipsePx(g, x - 3, y - 16, 6, 4, '#40395e');
  for (let i = 0; i < 12; i++) disc(g, x + 12 + Math.sin(i * .5) * 3, y - 4 - i * 2, 2.6, INK); for (let i = 0; i < 12; i++) disc(g, x + 12 + Math.sin(i * .5) * 3, y - 4 - i * 2, 1.7, '#2b2540');
  drawCatHead(g, x, y - 32);
}
function timbreRoom() {
  return mdl('timbreRoom', () => {
    const c = mkCanvas(SW, SH), g = c.g, D = TIMB;
    subwayTiles(g, 0, 0, SW, 178); woodFloor(g, 0, 178, SW, 14);
    rect(g, 0, 176, SW, 2, INK);
    // door surround
    rect(g, D.x - 7, D.y - 7, D.w + 14, D.h + 7, INK); rect(g, D.x - 6, D.y - 6, D.w + 12, D.h + 6, RAMP.green[1]); rect(g, D.x - 6, D.y - 6, D.w + 12, 2, RAMP.green[2]);
    // doormat inside
    rect(g, D.x + 14, 180, D.w - 28, 9, INK); rect(g, D.x + 15, 181, D.w - 30, 7, '#8a5a34'); tiny(g, 'HOLA', D.x + D.w / 2, 182, '#eadca8', { align: 'c' });
    // hooks with leashes, and a monstera in a pot
    rect(g, 12, 38, 50, 4, INK); rect(g, 13, 39, 48, 2, RAMP.wood[3]);
    for (const [x, col] of [[20, '#e23b4e'], [36, '#3fb56f'], [52, '#3565cc']]) { rect(g, x - 1, 41, 3, 4, INK); for (let i = 0; i < 26; i++) { px(g, x + Math.sin(i * .35) * 3, 45 + i, col); px(g, x + 1 + Math.sin(i * .35) * 3, 45 + i, col); } disc(g, x + Math.sin(26 * .35) * 3, 72, 2.5, RAMP.steel[3]); }
    rect(g, 22, 150, 26, 27, INK); rect(g, 23, 151, 24, 25, '#c0662c'); rect(g, 23, 151, 24, 3, '#e08a4a');
    for (const [a, l] of [[-2.3, 30], [-1.9, 38], [-1.5, 40], [-1.2, 34], [-.8, 30], [-2.7, 24], [-.4, 22]]) {
      const ex = 35 + Math.cos(a) * l, ey = 150 + Math.sin(a) * l;
      thickLine(g, 35, 150, ex, ey, 1, '#2f6b3a'); disc(g, ex, ey, 7, INK); disc(g, ex, ey, 6, '#3f9a4e'); disc(g, ex - 2, ey - 2, 2.5, '#6fc25f'); px(g, ex + 2, ey + 1, '#2f6b3a');
    }
    // the bell's curly bracket
    thickLine(g, D.x + D.w + 8, 18, D.x + D.w + 24, 18, 1.2, INK); ringPx(g, D.x + D.w + 24, 22, 4, INK);
    return c;
  });
}
// the street across the road, seen through the door
function timbreStreet() {
  return mdl('timbreStreet', () => {
    const c = mkCanvas(TIMB.w, TIMB.h), g = c.g, W = TIMB.w, H = TIMB.h;
    eixampleFacade(g, -20, -30, W + 40, 120, 4);
    // the bakery opposite: FORN DE PA
    rect(g, 0, 88, W, 34, INK); rect(g, 0, 89, W, 32, '#6b4424'); rect(g, 6, 96, W - 12, 24, '#fff2c0'); for (let x = 10; x < W - 10; x += 12) { disc(g, x + 4, 112, 4, '#d8a24a'); disc(g, x + 4, 111, 2, '#f2c46c'); }
    for (let i = 0; i < W; i += 10) { polyPx(g, [[i, 84], [i + 10, 84], [i + 10, 92], [i + 5, 95], [i, 92]], i % 20 ? '#e23b4e' : '#ffffff'); }
    tiny(g, 'FORN DE PA', W / 2, 98, '#6b4424', { align: 'c' });
    rect(g, 0, 122, W, 18, '#4a4852'); for (let x = 4; x < W; x += 20) rect(g, x, 130, 10, 2, '#d8d6cf');
    rect(g, 0, 140, W, 3, '#8f8a82'); fillPat(g, panotPat(), 0, 143, W, H - 143);
    return c;
  });
}
function timbreLeaf() {
  return mdl('timbreLeaf', () => {
    const W = TIMB.w, H = TIMB.h, c = mkCanvas(W, H), g = c.g, G = RAMP.green;
    rect(g, 0, 0, W, H, INK); rect(g, 1, 1, W - 2, H - 2, G[2]); rect(g, 1, 1, W - 2, 2, G[3]); rect(g, 1, 1, 2, H - 2, G[3]);
    // the glass (left see-through, lightly tinted), kick plate, brass handle
    g.clearRect(9, 9, W - 18, H - 32); g.globalAlpha = .16; rect(g, 9, 9, W - 18, H - 32, '#cfe8ff'); g.globalAlpha = .3;
    for (let i = 0; i < 3; i++) linePx(g, 40 + i * 7, 9, 12 + i * 7, H - 24, '#ffffff'); g.globalAlpha = 1;
    ringRect(g, 8, 8, W - 16, H - 30, 1, INK);
    rect(g, 6, H - 18, W - 12, 12, INK); rect(g, 7, H - 17, W - 14, 10, RAMP.gold[3]); rect(g, 7, H - 17, W - 14, 2, RAMP.gold[4]);
    rect(g, W - 14, 84, 4, 14, INK); rect(g, W - 13, 85, 2, 12, RAMP.gold[3]); rect(g, W - 22, 88, 10, 4, INK); rect(g, W - 21, 89, 9, 2, RAMP.gold[4]);
    // the opening-hours sticker
    panel(g, W - 42, 14, 30, 14, '#ffffff', { r: 2 }); tiny(g, '9:30', W - 27, 17, INK, { align: 'c' });
    return c;
  });
}
const TIMB_SAY = { guiri: '¿Sagrada Família?', inspector: 'Inspección. ¿Los papeles?', gato: '¡MIAU!', globo: '¡Mi perrito!', cliente: '¡Buenos días, Keiko!', miss: '¡Pues me voy!' };
defMG({
  id: 'timbre', stage: 'anahi', name: 'Ding dong', cmd: '¡ABRE!', how: 'Abre la puerta solo si viene un perro', mech: 'tap', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'vib', v: .55, n: 'E6 . C6 . . . . . D6 . G5 . . . . . A5 . C6 . E6 . D6 . C6 . . . G5 . . .' },
    { i: 'pluck', v: .45, n: '. . C5+E5 . . . C5+E5 . . . B4+D5 . . . B4+D5 . . . A4+C5 . . . A4+C5 . . . G4+B4 . G4+B4 . . .' },
    { i: 'bass', v: .8, n: 'C3 . . . G2 . . . G2 . . . D3 . . . A2 . . . E3 . . . F2 . . . G2 . . .' },
    { i: 'd', v: .5, n: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s . s .' }] }),
  init(g) {
    const n = [2, 3, 3][g.level - 1], pool = shuffle(g.level >= 3 ? ['guiri', 'inspector', 'gato', 'globo'] : ['guiri', 'inspector', 'gato']);
    const ci = g.level === 1 ? 1 : g.ri(1, n - 1); // level 1: first someone you mustn't let in, then the dog
    g.q = []; let di = 0;
    for (let i = 0; i < n; i++) g.q.push(i === ci ? { kind: 'cliente', breed: g.pick(EMP_BREEDS), coll: g.pick(['#e23b4e', '#3565cc', '#ffdf4f']) } : { kind: pool[di++ % pool.length] });
    g.slot = [2.2, 2, 1.8][g.level - 1]; g.t0 = .6; g.rang = -1;
    g.openT = -1; g.who = null; g.fb = 0; g.bellT = -9; g.rattleT = -9;
  },
  // who is at the door now, and how far into their visit (0 arrive … 1 gone)
  now(g) {
    const bb = g.openT >= 0 || g.state !== 'play' ? g.fb : g.b, u = (bb - g.t0) / g.slot, i = fl(u);
    return i >= 0 && i < g.q.length ? { v: g.q[i], i, p: u - i } : null;
  },
  update(g, dt) {
    if (g.state !== 'play') return;
    const n = this.now(g);
    if (n && n.p > .18 && g.rang < n.i) {
      g.rang = n.i; g.bellT = g.t;
      if (n.v.kind === 'gato') sfx('yip', { pitch: 2 }); else if (n.v.kind === 'inspector') { sfx('tick', { pitch: .5 }); sfx('tick', { pitch: .5, delay: .14 }); } else { sfx('ding'); sfx('ding', { pitch: .8, delay: .2 }); }
      if (n.v.kind === 'cliente') sfx('yip', { pitch: 1.3, delay: .3 });
    }
    // the client gave up
    if (n && n.v.kind === 'cliente' && n.p > .86) { g.fb = g.b; g.who = n.v; g.missed = true; sfx('whine', { pitch: .9 }); g.lose(); return; }
    if (IN.tap) {
      if (n && n.p > .1 && n.p < .86) {
        g.openT = g.t; g.fb = g.b; g.who = n.v; sfx('swoosh', { pitch: 1.2 });
        if (n.v.kind === 'cliente') { g.win(); sfx('bark', { n: 2, pitch: 1.3, delay: .15 }); sfx('heart', { delay: .3 }); g.fx.burst(128, 120, 12, { k: 'heart', c: '#ff5d9e', sp0: 30, sp1: 90, life0: .5, life1: .9 }); }
        else { g.lose(); g.shake(3, .25); if (n.v.kind === 'globo') { sfx('pop', { pitch: .6 }); g.fx.burst(150, 60, 14, { k: 'conf', c: ['#ff5d9e', '#ffc2da', '#ffffff'], sp0: 40, sp1: 120, g: 200 }); } if (n.v.kind === 'gato') sfx('bark', { n: 3, pitch: 1.1, delay: .1 }); }
      } else { g.rattleT = g.t; sfx('tick', { pitch: 1.6 }); }
    }
  },
  drawVisitor(g, c, v, x, y, open) {
    const k = v.kind;
    if (k === 'cliente') {
      const won = g.state === 'won';
      drawS(c, abuela(won ? 'happy' : g.missed ? 'cross' : 'think'), x - 12, y, { ax: .5, ay: 1 });
      if (!(won && open >= 1)) { linePx(c, x + 5, y - 33, x + 18, y - 24, '#e23b4e'); drawEmpDog(c, { breed: v.breed, coll: v.coll, flip: true }, x + 22, y - (fl(g.t * 6) % 2 ? 2 : 0), fl(g.t * 6) % 2 === 0); }
    } else if (k === 'guiri' || k === 'globo') {
      drawS(c, timbreGuiri(), x, y, { ax: .5, ay: 1 });
      if (k === 'globo' && !(open > 0 && g.state === 'lost')) { linePx(c, x + 23, y - 36, x + 22, y - 70, '#ffffff'); balloonDog(c, x + 20, y - 84 + Math.sin(g.t * 3) * 2); }
    } else if (k === 'inspector') drawS(c, funcionario('inspector', open > 0 ? 'glare' : 'neutral'), x, y - 6, { ax: .5, ay: 1 });
    else if (k === 'gato' && !(open >= 1 && g.state === 'lost')) timbreCat(c, x, y);
  },
  draw(g, c) {
    const D = TIMB, won = g.state === 'won', lost = g.state === 'lost';
    c.drawImage(timbreRoom(), 0, 0);
    const n = this.now(g), open = g.openT >= 0 ? clamp((g.t - g.openT) / .2, 0, 1) : 0;
    // the street and the visitor, seen through the doorway
    c.save(); c.beginPath(); c.rect(D.x, D.y, D.w, D.h); c.clip();
    c.drawImage(timbreStreet(), D.x, D.y);
    let vx = 0;
    if (n) {
      const p = n.p; vx = p < .18 ? lerp(D.x + D.w + 40, 128, E.outC(p / .18)) : p > .82 && !g.who ? lerp(128, D.x - 50, (p - .82) / .18) : 128;
      this.drawVisitor(g, c, n.v, vx, D.y + D.h - 16, open);
    }
    c.restore();
    // the door leaf swings open on its left hinge
    const lw = rd(D.w * Math.cos(open * 1.3));
    if (lw > 2) c.drawImage(timbreLeaf(), 0, 0, D.w, D.h, D.x + (g.rattleT > 0 && g.t - g.rattleT < .15 ? rd(Math.sin(g.t * 90)) : 0), D.y, lw, D.h);
    // the bell
    const bk = clamp((g.t - g.bellT) / .6, 0, 1), rot = bk < 1 ? Math.sin(g.t * 40) * .5 * (1 - bk) : 0, bx = D.x + D.w + 24, by = 26;
    c.save(); c.translate(bx, by); c.rotate(rot); polyPx(c, [[-7, 12], [-5, 2], [0, -1], [5, 2], [7, 12]], INK); polyPx(c, [[-6, 11], [-4, 3], [0, 0], [4, 3], [6, 11]], RAMP.gold[3]); rect(c, -4, 4, 2, 5, RAMP.gold[4]); disc(c, 0, 13, 2, INK); c.restore();
    if (bk < 1 && n) { const kind = n.v.kind, s = kind === 'gato' ? '¡MIAU!' : kind === 'inspector' ? '¡TOC TOC!' : '¡DING DONG!'; txt(c, s, bx + (kind === 'gato' ? -48 : 2), 42 - bk * 6, '#ffffff', { align: 'c', out: INK, bold: true }); }
    // what came in
    if (g.who && open >= 1) {
      const dt2 = g.t - g.openT - .2, k = g.who.kind;
      if (k === 'cliente') { const q = clamp(dt2 / .5, 0, 1); drawEmpDog(c, { breed: g.who.breed, coll: g.who.coll, flip: false }, lerp(150, 196, q), 186 - Math.abs(Math.sin(dt2 * 12)) * 6 * (1 - q * .5), true); }
      if (k === 'gato') { const q = clamp(dt2 / .4, 0, 1); if (q < 1) timbreCat(c, lerp(128, 300, q), 186); }
    }
    // Keiko keeps an eye on the door
    const kk = n ? n.v.kind : '', kex = won ? 'love' : lost ? (g.who && g.who.kind === 'gato' ? 'grr' : 'sad') : kk === 'cliente' ? 'happy' : kk === 'gato' ? 'grr' : kk === 'inspector' ? 'wow' : 'normal';
    drawKeikoSit(c, 222, 190, kex, { tilt: kk === 'cliente' && !lost ? Math.sin(g.t * 10) * .3 : 0 });
    if (g.who && (open >= 1 || g.missed)) {
      const s = g.missed ? TIMB_SAY.miss : TIMB_SAY[g.who.kind];
      anaSay(c, 8, 60, 76, s, 104, 96);
    }
  },
  bot(g) { const n = this.now(g); return { x: 128, y: 100, down: !!(n && n.v.kind === 'cliente' && n.p > .3 && n.p < .7) && fl(g.t * 20) % 3 === 0 }; },
  // the ghost hand only presses while the dog's owner is at the door
  hint(g) { const n = this.now(g); return n && n.v.kind === 'cliente' ? { x: 128, y: 100, mech: 'tap' } : null; },
});
if (STAGES.anahi) for (const id of ['persiana', 'timbre']) if (!STAGES.anahi.games.includes(id)) STAGES.anahi.games.push(id);
