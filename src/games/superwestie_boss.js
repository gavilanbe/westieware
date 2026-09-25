// ============================================================================
//  FINAL BOSS — El Monstruo de Barro. Six phases, one per mechanic of the game:
//  TOCA · FROTA · CORTA · DIBUJA · ARRASTRA · GIRA. Wash it all off → Nube,
//  Maite's westie, lost in the sewers for a month (see the stage's ending).
// ============================================================================
'use strict';
function streetBottom() { return mdl('streetBottom', () => { const c = mkCanvas(SW, SH); TL.save(); TL.clearRect(0, 0, SW, TALL_H); streetTall(TL, 0, 1, 0, { sunUp: 1 }); TL.restore(); c.g.drawImage(TALLC, 0, SH + HINGE, SW, SH, 0, 0, SW, SH); return c; }); }
const BARRO_PH = [['¡TOCA!', 'Revienta el barro'], ['¡FROTA!', 'Limpia el escaparate'], ['¡CORTA!', 'Sus tentáculos'], ['¡DIBUJA!', 'Una pompa alrededor'], ['¡ARRASTRA!', 'El champú hasta él'], ['¡GIRA!', 'La boca de riego']];
const BARRO_WIN = { x: 22, y: 60, w: 100, h: 66 }; // the shop window on the touch screen
defMG({
  id: 'barro', stage: 'superwestie', boss: true, name: 'El Monstruo de Barro', cmd: '¡A LAVARLO!', how: 'Seis fases: toca, frota, corta, dibuja, arrastra y gira', mech: 'mix', beats: 16,
  song: () => HERO_SONGS.boss,
  init(g) {
    g.ph = 0; g.phT = 0; g.mud = 0; g.mx = 172; g.my = 118;
    g.balls = []; g.thrown = 0; g.ballT = .6;
    g.dirt = new Float32Array(10 * 5).fill(0); g.rub = rubTracker();
    g.tent = []; g.slice = sliceTracker(220);
    g.loop = null; g.bubble = 0;
    g.bottle = { x: 40, y: 150, held: false, done: false };
    g.spin = spinTracker(226, 160); g.wash = 0;
    g.shakeM = 0; g.phaseCmdT = 0;
  },
  nextPhase(g) {
    g.ph++; g.phT = 0; g.phaseCmdT = 0; sfx('slam'); sfx('bark', { pitch: 1.2 }); HITSTOP = 4; g.shake(3, .25);
    g.fx.burst(g.mx, g.my - 30, 16, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 180 });
    // the monster takes the hit: it squashes, its eyes cross, mud flies and it shrinks a little
    g.hurtT = .6; g.stepPop = { i: g.ph - 1, t: 0 };
    g.fx.burst(g.mx, g.my - 34, 14, { k: 'puff', c: ['#7c5530', '#5b3a1d', '#a07748'], sp0: 60, sp1: 170, r: 4, g: 260 });
    if (g.ph < 6) g.fx.add({ k: 'txt', s: ['¡GLORGH!', '¡BLURP!', '¡GLUP!', '¡PLOF!', '¡BLOB!'][(g.ph - 1) % 5], x: g.mx, y: g.my - 88, life: .8, c: '#ffdf4f' });
    if (g.ph === 1) for (let i = 0; i < g.dirt.length; i++) g.dirt[i] = Math.max(g.dirt[i], g.r() < .55 ? g.r(.6, 1) : g.dirt[i]);
    if (g.ph === 2) g.tent = [0, 1, 2].map(i => ({ ang: -2.2 + i * .6, cut: false, sw: g.r(TAU) }));
    if (g.ph === 6) { g.win(); sfx('sparkle'); flash('bot', '#ffffff', .3); g.fx.burst(g.mx, g.my - 40, 30, { k: 'conf', c: [C.yellow, C.pink, C.mint, C.sky, '#ffffff'], sp0: 80, sp1: 220, g: 200 }); }
  },
  update(g, dt) {
    g.phT += dt; g.phaseCmdT += dt; g.shakeM = Math.max(0, g.shakeM - dt * 3);
    g.hurtT = Math.max(0, (g.hurtT || 0) - dt); if (g.stepPop) g.stepPop.t += dt; g.jet = Math.max(0, (g.jet || 0) - dt * 4);
    for (const tn of g.tent) if (tn.cut) tn.fall = (tn.fall || 0) + dt; // cut tentacles keep falling in every phase
    if (g.state !== 'play') { if (g.state === 'won') g.wash = Math.min(1, g.wash + dt * .8); return; } // only a win washes it off
    // the shop gets dirtier if you dawdle
    if (g.phT > 7) g.mud = Math.min(100, g.mud + dt * 5);
    const sp = [1, 1.15, 1.3][g.level - 1];
    if (g.ph === 0) { // TAP the mud balls
      g.ballT -= dt;
      if (g.ballT <= 0 && g.thrown < 6) { g.thrown++; g.ballT = g.r(.5, .8) / sp; g.balls.push({ x: g.mx - 30, y: g.my - 40, t: 0, dur: g.r(1.1, 1.5) / sp, tx: g.r(BARRO_WIN.x + 10, BARRO_WIN.x + BARRO_WIN.w - 10), ty: g.r(BARRO_WIN.y + 10, BARRO_WIN.y + BARRO_WIN.h - 10), h: g.r(40, 70), dead: false }); sfx('squish', { pitch: .6, vol: .5 }); g.shakeM = .6; }
      for (const b of g.balls) if (!b.dead) {
        b.t += dt; const k = Math.min(1, b.t / b.dur); b.cx = lerp(g.mx - 30, b.tx, k); b.cy = lerp(g.my - 40, b.ty, k) - Math.sin(k * Math.PI) * b.h;
        if (k >= 1) { b.dead = true; b.hit = true; g.mud = Math.min(100, g.mud + 12); sfx('splash', { pitch: .6, vol: .6 }); g.shake(2, .15); const ci = clamp(fl((b.tx - BARRO_WIN.x) / BARRO_WIN.w * 10), 0, 9), cj = clamp(fl((b.ty - BARRO_WIN.y) / BARRO_WIN.h * 5), 0, 4); for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const i = ci + di, j = cj + dj; if (i >= 0 && i < 10 && j >= 0 && j < 5) g.dirt[j * 10 + i] = 1; } }
      }
      if (IN.tap) for (const b of g.balls) if (!b.dead && dist(IN.x, IN.y, b.cx, b.cy) < 16) { b.dead = true; sfx('pop', { pitch: .9 + g.balls.filter(q => q.dead && !q.hit).length * .1 }); HITSTOP = 2; g.fx.burst(b.cx, b.cy, 10, { k: 'puff', c: ['#7c5530', '#5b3a1d'], sp0: 30, sp1: 90, r: 3 }); break; }
      if (g.thrown >= 6 && g.balls.every(b => b.dead)) this.nextPhase(g);
    } else if (g.ph === 1) { // RUB the window clean
      const inside = IN.x > BARRO_WIN.x && IN.x < BARRO_WIN.x + BARRO_WIN.w && IN.y > BARRO_WIN.y && IN.y < BARRO_WIN.y + BARRO_WIN.h;
      const gain = g.rub.update(dt, inside);
      if (gain > 0) { const i = clamp(fl((IN.x - BARRO_WIN.x) / BARRO_WIN.w * 10), 0, 9), j = clamp(fl((IN.y - BARRO_WIN.y) / BARRO_WIN.h * 5), 0, 4); for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a >= 0 && a < 10 && b >= 0 && b < 5) g.dirt[b * 10 + a] = Math.max(0, g.dirt[b * 10 + a] - gain * .02 * (di || dj ? .5 : 1)); } if (FRAME % 4 === 0) g.fx.add({ k: 'bubble', x: IN.x + g.r(-6, 6), y: IN.y + g.r(-6, 6), vy: -20, life: .5, r: 2, c: '#ffffff' }); }
      const dirty = g.dirt.reduce((a, b) => a + (b > .15 ? 1 : 0), 0);
      if (dirty <= 3) this.nextPhase(g);
    } else if (g.ph === 2) { // CUT the tentacles
      g.slice.update();
      for (const tn of g.tent) {
        tn.sw += dt * 2.4 * sp; if (tn.cut) continue;
        const a = tn.ang + Math.sin(tn.sw) * .35, x0 = g.mx + Math.cos(a) * 30, y0 = g.my - 30 + Math.sin(a) * 20, x1 = g.mx + Math.cos(a) * 88, y1 = g.my - 30 + Math.sin(a) * 70;
        tn.p = [x0, y0, x1, y1];
        for (const s of g.slice.segs) if (segCross([s[0], s[1]], [s[2], s[3]], [lerp(x0, x1, .35), lerp(y0, y1, .35)], [x1, y1])) { tn.cut = true; sfx('snip'); sfx('squish', { pitch: .7 }); HITSTOP = 3; g.shake(2, .15); g.fx.burst((x0 + x1) / 2, (y0 + y1) / 2, 12, { k: 'puff', c: ['#7c5530', '#5b3a1d'], sp0: 40, sp1: 120, r: 3 }); }
      }
      if (g.tent.every(t => t.cut)) this.nextPhase(g);
    } else if (g.ph === 3) { // DRAW a loop around it
      if (IN.rel && IN.path.length > 12) {
        const P = IN.path, s0 = P[0], e0 = P[P.length - 1];
        let ins = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if (((a.y > g.my - 40) !== (b.y > g.my - 40)) && (g.mx < (b.x - a.x) * (g.my - 40 - a.y) / (b.y - a.y) + a.x)) ins = !ins; }
        let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; for (const p of P) { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); }
        if (ins && dist(s0.x, s0.y, e0.x, e0.y) < 50 && maxx - minx > 70 && maxy - miny > 50) { g.loop = P.slice(); this.nextPhase(g); sfx('boing', { pitch: .7 }); }
        else { sfx('buzz', { vol: .4 }); g.fx.add({ k: 'txt', s: '¡Rodéalo entero!', x: SW / 2, y: 30, life: .9, c: '#ffffff' }); }
      }
    } else if (g.ph === 4) { // DRAG the shampoo onto it
      g.bubble = Math.min(1, g.bubble + dt * 2);
      const B = g.bottle;
      if (IN.tap && dist(IN.x, IN.y, B.x, B.y - 14) < 24) { B.held = true; sfx('pop', { pitch: .8 }); }
      if (B.held) { B.x = lerp(B.x, IN.x, .5); B.y = lerp(B.y, IN.y + 14, .5); if (!IN.down) { B.held = false; if (dist(B.x, B.y - 14, g.mx, g.my - 40) < 44) { B.done = true; sfx('splash'); sfx('fizz'); for (let i = 0; i < 30; i++) g.fx.add({ k: 'puff', x: g.mx + g.r(-40, 40), y: g.my - 40 + g.r(-30, 30), vy: -g.r(10, 40), life: g.r(.6, 1.2), r: g.r(3, 7), c: pick(['#ffffff', '#ffd1e4', '#e2f4ff']) }); this.nextPhase(g); } else sfx('back'); } }
      else if (!B.done) { B.x = lerp(B.x, 40, .1); B.y = lerp(B.y, 150, .1); }
    } else if (g.ph === 5) { // SPIN the hydrant
      const d = g.spin.update(dt);
      if (Math.abs(d) > 0) { g.jet = 1; g.wash = clamp(Math.abs(g.spin.ang) / (TAU * [2.5, 3, 3.5][g.level - 1]), 0, 1); if (FRAME % 5 === 0) sfx('ratchet', { vol: .5 }); if (FRAME % 2 === 0) g.fx.add({ k: 'drop', x: 214, y: 150, vx: -g.r(160, 240), vy: -g.r(60, 140), g: 260, life: .7, c: pick(['#9bd6f7', '#dff4ff', '#5aaee6']) }); }
      if (g.wash >= 1) this.nextPhase(g);
    }
    if (g.mud >= 100) { g.lose(); sfx('boom'); sfx('splash', { pitch: .5 }); g.shake(5, .4); }
  },
  draw(g, c) {
    c.drawImage(streetBottom(), 0, 0);
    // the window grime
    for (let j = 0; j < 5; j++) for (let i = 0; i < 10; i++) { const d = g.dirt[j * 10 + i]; if (d > .1) { const x = BARRO_WIN.x + i * BARRO_WIN.w / 10, y = BARRO_WIN.y + j * BARRO_WIN.h / 5; c.globalAlpha = Math.min(1, d); disc(c, x + 5, y + 6, 6, '#5b3a1d'); disc(c, x + 3, y + 4, 3, '#7c5530'); c.globalAlpha = 1; } }
    // the monster (or Nube underneath, as the water washes it)
    const mx = g.mx + Math.sin(g.t * 20) * g.shakeM * 3, my = g.my;
    const hurt = g.hurtT > 0 ? g.hurtT / .6 : 0, sc = 1 - Math.min(g.ph, 5) * .045, sq = hurt ? Math.sin((1 - hurt) * Math.PI * 3) * .14 * hurt : 0;
    if (g.wash < 1) {
      drawS(c, mudMonsterModel(fl(g.t * 3) % 2), mx, my - 30, { sx: sc * (1 + sq), sy: sc * (1 - sq) * (1 + Math.sin(g.t * 4) * .03) });
      if (hurt > .15) for (const ex of [-16, 14]) { const x0 = rd(mx + ex * sc), y0 = rd(my - 38 * sc - 30 + 30 * (1 - sc)); disc(c, x0, y0, 6 * sc, '#5b3a1d'); linePx(c, x0 - 4, y0 - 4, x0 + 4, y0 + 4, INK); linePx(c, x0 + 4, y0 - 4, x0 - 4, y0 + 4, INK); }
    }
    // the fire hydrant's jet, arcing onto the monster while you spin the valve
    if (g.ph === 5 && g.jet > 0) {
      const x0 = 214, y0 = 150, x1 = mx + 10, y1 = my - 44, w = 3 + g.jet * 2;
      for (let q = 0; q <= 1.001; q += .04) { const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * 40; disc(c, x, y, w + 1, '#2f6fb0'); }
      for (let q = 0; q <= 1.001; q += .04) { const x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * 40; disc(c, x, y, w, '#9bd6f7'); if (((q * 25 + fl(g.t * 30)) % 3) < 1) px(c, x, y - w + 1, '#ffffff'); }
      if (FRAME % 2 === 0) g.fx.add({ k: 'drop', x: x1 + g.r(-14, 14), y: y1 + g.r(-8, 8), vx: g.r(-120, 120), vy: -g.r(40, 140), g: 380, life: .5, c: pick(['#9bd6f7', '#dff4ff']) });
    }
    if (g.wash > 0) { c.save(); c.beginPath(); c.rect(mx - 60, my - 90 + (1 - g.wash) * 112, 120, 112 * g.wash + 4); c.clip(); c.drawImage(prepDog('clean', 1, g.wash >= 1 ? 'proud' : 'happy'), rd(mx - 52), rd(my - 90)); c.restore(); }
    // tentacles: tapered, curling mud with drips
    if (g.ph === 2 || g.tent.some(t => t.cut && (t.fall || 0) < .8)) for (const tn of g.tent) {
      if (!tn.p || (tn.cut && (tn.fall || 0) > .8)) continue;
      const [x0, y0, x1, y1] = tn.p, fy = tn.cut ? E.inQ(Math.min(1, (tn.fall || 0) / .8)) * 80 : 0;
      const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, curl = Math.sin(g.t * 5 + tn.sw) * 14;
      const P = q => [lerp(x0, x1, q) + nx / L * Math.sin(q * Math.PI) * curl, lerp(y0, y1, q) + ny / L * Math.sin(q * Math.PI) * curl + (tn.cut ? fy * q : 0)];
      for (const [col, extra] of [[INK, 1], ['#5b3a1d', 0]]) for (let q = 0; q <= 1; q += .04) { const [x, y] = P(q); disc(c, x, y, lerp(7, 2, q) + extra, col); }
      for (let q = .05; q <= .95; q += .08) { const [x, y] = P(q); px(c, x - 1, y - lerp(5, 1, q), '#a07748'); }
      const [tx, ty] = P(1); disc(c, tx, ty + 3 + (g.t * 20 % 6), 1.5, '#5b3a1d');
    }
    // soap bubble around it
    if (g.ph >= 4 && g.wash < 1) { const r = 58 * E.outBack(g.bubble); ringPx(c, mx, my - 40, r, '#ffffff'); ringPx(c, mx, my - 40, r - 1, '#9bd6f7'); ringPx(c, mx, my - 40, r - 2, '#ffd1e4'); for (let a = 3.6; a < 4.5; a += .1) px(c, mx + Math.cos(a) * (r - 6), my - 40 + Math.sin(a) * (r - 6), '#ffffff'); }
    if (g.loop && g.ph === 4 && g.bubble < .5) { c.globalAlpha = 1 - g.bubble * 2; for (let i = 1; i < g.loop.length; i++) linePx(c, g.loop[i - 1].x, g.loop[i - 1].y, g.loop[i].x, g.loop[i].y, '#ffffff'); c.globalAlpha = 1; }
    // mud balls in flight
    for (const b of g.balls) if (!b.dead) { disc(c, b.cx, b.cy, 6, INK); disc(c, b.cx, b.cy, 5, '#5b3a1d'); px(c, b.cx - 2, b.cy - 2, '#a07748'); }
    // live drawing trace for the loop phase
    if (g.ph === 3 && IN.down && IN.path.length > 1) for (let i = 1; i < IN.path.length; i++) thickLine(c, IN.path[i - 1].x, IN.path[i - 1].y, IN.path[i].x, IN.path[i].y, 1.2, '#ffffff');
    // the shampoo bottle
    if (g.ph === 4 && !g.bottle.done) {
      const B = g.bottle, near = B.held && dist(B.x, B.y - 14, g.mx, g.my - 40) < 44;
      // the same Westie BLVRD shampoo as in the salon; the monster's bubble glows when it's close enough to drop
      if (near) { ringPx(c, g.mx, g.my - 40, 50 + Math.sin(g.t * 12) * 2, '#5bd18b'); ringPx(c, g.mx, g.my - 40, 49 + Math.sin(g.t * 12) * 2, '#5bd18b'); }
      if (typeof prepBottle === 'function') prepBottle(c, B.x, B.y - 6, B.held ? .4 : 0);
      else { rect(c, B.x - 10, B.y - 34, 20, 34, INK); rect(c, B.x - 9, B.y - 33, 18, 32, '#5bb593'); }
      if (!B.held) drawHand(c, B.x + 16, B.y - 20 + Math.sin(g.t * 6) * 2, false);
    }
    // the hydrant + its valve
    if (g.ph >= 5) { rect(c, 218, 150, 18, 30, INK); rect(c, 219, 151, 16, 29, '#e23b4e'); rect(c, 219, 151, 4, 29, '#ff6b7a'); disc(c, 226, 160, 10, INK); disc(c, 226, 160, 9, RAMP.steel[3]); const a = g.spin.ang; for (let i = 0; i < 4; i++) { const q = a + i * Math.PI / 2; thickLine(c, 226, 160, 226 + Math.cos(q) * 12, 160 + Math.sin(q) * 12, 1.5, INK); } disc(c, 226, 160, 3, RAMP.gold[3]); if (g.wash < .1) ringPx(c, 226, 160, 16 + Math.sin(g.t * 8) * 2, '#ffffff'); }
    // phase caption: a comic box drops in at the top-left with the gesture, then flies off
    if (g.state === 'play' && g.phaseCmdT < 1.5) {
      const [cmd, sub] = BARRO_PH[g.ph] || BARRO_PH[0], out = g.phaseCmdT > 1.2 ? E.inQ((g.phaseCmdT - 1.2) / .3) : 0, dy = rd((1 - E.outBack(clamp(g.phaseCmdT / .3, 0, 1))) * -60 - out * 70);
      c.save(); c.translate(0, dy);
      rect(c, 8, 4, 176, 44, INK); rect(c, 10, 6, 172, 40, '#ffdf4f'); for (let y = 8; y < 44; y += 3) for (let x = 12 + (y % 2) * 2; x < 180; x += 5) px(c, x, y, '#f2c330');
      rect(c, 10, 6, 172, 2, '#fff7ae');
      mord(c, cmd, 92, 8, fitMord(cmd, 150, { u: 1.6, r: 1.8, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] }), { anim: i => ({ s: Math.max(0, spring(g.phaseCmdT - .06 - i * .03, 2.6, 8)) }) });
      txt(c, sub, 92, 34, INK, { align: 'c' });
      if (typeof drawMechMini === 'function') drawMechMini(c, 200, 26, ['tap', 'rub', 'cut', 'draw', 'drag', 'spin'][g.ph] || 'tap', g.t);
      c.restore();
    }
    if (g.state === 'lost') { // the shop drowns in mud
      const k = clamp((g.t - g.decidedAt) / .5, 0, 1);
      for (let x = 0; x < SW; x += 6) { const h = k * (70 + Math.sin(x * .2 + g.t * 3) * 10); rect(c, x, SH - h, 6, h, x % 12 ? '#5b3a1d' : '#6b4527'); }
      shout(c, '¡PUAJ! ¡BARRO!', SW / 2, 60, g.t - g.decidedAt - .3, '#e0b070');
    }
    if (g.state === 'won' && g.wash >= 1) shout(c, '¿¡…GUAU!?', g.mx, g.my - 96, g.t - g.decidedAt - 1);
  },
  top(g, c) {
    // a comic page under the command: the monster's panel, the six gestures, the mud meter, Súper Keiko
    rect(c, 0, 44, SW, SH - 44, '#231f5e'); for (let y = 46; y < SH; y += 4) for (let x = (y % 8) / 2; x < SW; x += 4) px(c, x, y, '#2c2870');
    const pan = (x, y, w, h, fill) => { rect(c, x - 2, y - 2, w + 4, h + 4, INK); rect(c, x, y, w, h, fill); };
    // the villain's panel: halftone red, the monster wobbling, its name
    pan(6, 48, 92, 84, '#c0392b'); for (let y = 50; y < 130; y += 4) for (let x = 8 + (y % 8) / 2; x < 96; x += 4) px(c, x, y, '#d9534f');
    const hurt = g.hurtT > 0 ? Math.sin(g.t * 40) * 2 * (g.hurtT / .6) : 0;
    drawS(c, mudMonsterModel(fl(g.t * 3) % 2), 52 + hurt, 86, { s: .62 * (1 - Math.min(g.ph, 5) * .045), sy: .62 * (1 + Math.sin(g.t * 4) * .04) });
    rect(c, 6, 118, 92, 14, INK); tiny(c, 'EL MONSTRUO', 52, 121, '#ffdf4f', { align: 'c' }); tiny(c, 'DE BARRO', 52, 127, '#ffffff', { align: 'c' });
    // the six gestures, ticked off as they're done
    pan(104, 48, 146, 44, '#fff8e6');
    tiny(c, 'SEIS GESTOS PARA LAVARLO', 177, 51, INK, { align: 'c' });
    const mechs = ['tap', 'rub', 'cut', 'draw', 'drag', 'spin'];
    for (let i = 0; i < 6; i++) {
      const x = 108 + i * 23, y = 60, done = i < g.ph, cur = i === g.ph && g.state === 'play';
      const pop = g.stepPop && g.stepPop.i === i && g.stepPop.t < .6 ? 1 + Math.sin(Math.min(1, g.stepPop.t / .6) * Math.PI) * .35 : 1;
      c.save(); c.translate(x + 10, y + 10); c.scale(pop, pop); c.translate(-(x + 10), -(y + 10));
      panel(c, x, y + (cur ? Math.sin(g.t * 8) * 1.5 : 0), 20, 20, done ? '#9be3b8' : cur ? '#ffdf4f' : '#ffffff', { r: 3, line: INK });
      if (typeof drawMechMini === 'function') drawMechMini(c, x + 10, y + 10 + (cur ? Math.sin(g.t * 8) * 1.5 : 0), mechs[i], g.t);
      if (done) { disc(c, x + 17, y + 3, 4, INK); disc(c, x + 17, y + 3, 3, '#35a869'); px(c, x + 16, y + 3, '#ffffff'); px(c, x + 17, y + 4, '#ffffff'); px(c, x + 18, y + 2, '#ffffff'); }
      c.restore();
    }
    // the mud meter: if it fills up, the shop is lost
    pan(104, 98, 146, 34, '#fff8e6');
    txt(c, 'BARRO EN LA TIENDA', 110, 102, INK, { bold: true });
    const shake = g.mud > 66 && g.state === 'play' ? Math.sin(g.t * 50) : 0;
    rect(c, 110 + shake, 116, 134, 10, INK); rect(c, 111 + shake, 117, 132, 8, '#dce7ea');
    const w = rd(132 * g.mud / 100); rect(c, 111 + shake, 117, w, 8, g.mud > 66 ? '#e23b4e' : g.mud > 33 ? '#ffb020' : '#7c5530'); rect(c, 111 + shake, 117, w, 2, 'rgba(255,255,255,.4)');
    for (let i = 1; i < 4; i++) vline(c, 111 + i * 33 + shake, 117, 124, 'rgba(29,20,36,.25)');
    // Súper Keiko in her inset, with a word for the moment
    pan(104, 136, 146, 31, '#63a0ef'); for (let y = 138; y < 167; y += 4) for (let x = 106 + (y % 8) / 2; x < 250; x += 4) px(c, x, y, '#7ab3f5');
    // her little menu self fits the inset: walking on the spot, cheering when it's over
    const hero = STAGES.superwestie.chibi ? STAGES.superwestie.chibi(g.state === 'won' ? 'happy' : g.state === 'lost' ? 'idle' : (fl(g.t * 6) % 2 ? 'walk1' : 'walk0'), g.t) : null;
    if (hero) drawS(c, hero, 222, 166 - (g.state === 'won' ? Math.abs(Math.sin(g.t * 8)) * 3 : 0), { ax: .5, ay: 1, flip: true });
    else drawSuperWestie(c, 220, 154, g.t, { flip: true });
    const say = g.state === 'lost' ? '¡Nooo!' : g.state === 'won' ? '¡Lo logramos!' : g.mud > 66 ? '¡Rápido!' : ['¡A por él!', '¡Frota fuerte!', '¡Zas, zas!', '¡Rodéalo!', '¡Espuma!', '¡Agua va!'][g.ph] || '¡Vamos!';
    panel(c, 110, 142, 76, 18, '#ffffff', { r: 5, line: INK }); polyPx(c, [[184, 148], [192, 151], [184, 154]], INK);
    txt(c, say, 148, 147, g.mud > 66 ? '#e23b4e' : INK, { align: 'c', bold: true });
  },
  bot(g) {
    if (g.ph === 0) { const b = g.balls.find(b => !b.dead && b.t > .15); return b ? { x: b.cx, y: b.cy, down: fl(g.t * 20) % 3 === 0 } : { down: false }; }
    if (g.ph === 1) { let best = -1, bd = .15; for (let i = 0; i < g.dirt.length; i++) if (g.dirt[i] > bd) { bd = g.dirt[i]; best = i; } if (best < 0) return { down: false }; const i = best % 10, j = fl(best / 10); return { x: BARRO_WIN.x + (i + .5) * BARRO_WIN.w / 10 + Math.sin(g.t * 40) * 8, y: BARRO_WIN.y + (j + .5) * BARRO_WIN.h / 5, down: true }; }
    if (g.ph === 2) { const tn = g.tent.find(t => !t.cut && t.p); if (!tn) return { down: false }; const [x0, y0, x1, y1] = tn.p, mx = lerp(x0, x1, .7), my = lerp(y0, y1, .7), nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, ph = (g.t * 5) % 1; return { x: mx + nx / L * lerp(-30, 30, ph), y: my + ny / L * lerp(-30, 30, ph), down: ph < .9 }; }
    if (g.ph === 3) { const k = (g.phT * .7) % 1.2; if (k > 1.05) return { down: false }; const a = Math.min(1, k) * TAU * 1.05; return { x: g.mx + Math.cos(a) * 64, y: g.my - 40 + Math.sin(a) * 52, down: k <= 1.02 }; }
    if (g.ph === 4) { const B = g.bottle; if (!B.held) return { x: B.x, y: B.y - 14, down: fl(g.t * 10) % 2 === 0 }; return { x: g.mx, y: g.my - 54, down: dist(B.x, B.y - 14, g.mx, g.my - 40) > 20 }; }
    if (g.ph === 5) { const a = g.t * 9; return { x: 226 + Math.cos(a) * 18, y: 160 + Math.sin(a) * 18, down: true }; }
    return { down: false };
  },
});
