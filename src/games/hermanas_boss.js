// ============================================================================
//  BOSS — La Gaviota Ladrona. She flew off with the sisters' frisbee and now
//  she's after their bocatas. Phase 1: lasso her (draw a loop around her)
//  while she patrols and dives for the basket. Phase 2: she drops the frisbee
//  — draw its flight back to Nala before she snatches it again.
// ============================================================================
'use strict';

// the boss herself: the stage's seagull, bigger and far more expressive
function hermanasBossGull(frame = 0, holding = false, mood = 'smug') {
  return mdl('hermanas:bossGull' + frame + holding + mood, () => {
    const Wt = ['#6b6977', '#9a98a8', '#c8c6d3', '#ecebf3', '#ffffff'], Gy = ['#3a3848', '#5a5870', '#86849a', '#aeacc0', '#d4d2e2'];
    const body = SD.ellipse(40, 35, 20, 11.5, -.08), head = SD.circle(59, 24, 9.5), tail = SD.poly([[15, 31], [3, 26], [6, 38], [20, 39]]);
    const wy = [4, 22, 45][frame];
    const wing = SD.grow(SD.poly([[28, 29], [49, 29], [32 - (frame === 1 ? 6 : 0), wy], [17, wy + (frame === 0 ? 4 : 0)]]), 2.2);
    const wingTip = SD.circle(17 + (frame === 1 ? -6 : 0), wy + (frame === 0 ? 4 : 0), 4.4);
    const beak = SD.union(SD.poly([[65, 21], [78, 24], [77, 29], [65, 29]]), SD.circle(76.5, 27, 2.4)); // a hooked beak
    const legs = SD.union(SD.capsule(37, 45, 36, 52, 1.3, 1.1), SD.capsule(45, 45, 46, 52, 1.3, 1.1));
    const parts = [
      { f: tail, ramp: Wt, z: 0, th: 4 },
      { f: body, ramp: Wt, z: 1, th: 11 },
      { f: head, ramp: Wt, z: 2, th: 8 },
      { f: beak, ramp: RAMP.yellow, z: 2.5, th: 3, amb: .5 },
      { f: wing, ramp: Gy, z: 3, th: 7 }, { f: wingTip, ramp: RAMP.black, z: 3.1, th: 3 },
    ];
    if (frame === 1 && !holding) parts.push({ f: legs, ramp: RAMP.orange, z: .5, th: 1.5 });
    const c = model(90, 58, parts, { selout: false });
    const g = c.g, K = INK, ex = 60, ey = 21;
    // feathers along the wing's trailing edge
    const tx = 17 + (frame === 1 ? -6 : 0), ty = wy + (frame === 0 ? 4 : 0);
    for (let i = 1; i <= 3; i++) { const k = i / 4, x = lerp(tx, 28, k), y = lerp(ty, 29, k); linePx(g, x + 2, y, x + 7, y + (frame === 2 ? -2 : frame === 1 ? -1 : 1), Gy[4]); }
    px(g, 74, 27, '#e23b4e'); px(g, 75, 27, '#e23b4e'); px(g, 74, 28, '#e23b4e'); // the red spot
    if (mood === 'dizzy') { rect(g, ex - 2, ey - 2, 7, 7, K); rect(g, ex - 1, ey - 1, 5, 5, '#ffffff'); ringPx(g, ex + 1, ey + 1, 1.6, K); px(g, ex + 1, ey + 1, K); for (let i = 0; i < 3; i++) px(g, 52 + i * 2, 12 - i, '#8fd0ff'); }
    else {
      rect(g, ex - 2, ey - 2, 7, 7, K); rect(g, ex - 1, ey - 1, 5, 5, '#ffffff');
      if (mood === 'shock') { px(g, ex + 2, ey + 1, K); rect(g, 66, 29, 9, 3, K); rect(g, 67, 29, 7, 2, '#b22c44'); }
      else rect(g, ex + 1, ey, 3, 3, K), px(g, ex + 1, ey, '#ffffff');
      if (mood === 'smug') { rect(g, ex - 1, ey - 1, 5, 2, Wt[2]); hline(g, ex - 1, ex + 3, ey + 1, K); linePx(g, ex - 4, ey - 7, ex + 4, ey - 5, K); linePx(g, ex - 4, ey - 6, ex + 4, ey - 4, K); }
      else if (mood === 'angry') { linePx(g, ex - 4, ey - 6, ex + 5, ey - 2, K); linePx(g, ex - 4, ey - 5, ex + 5, ey - 1, K); }
      else if (mood === 'shy') { hline(g, ex - 1, ex + 3, ey - 3, K); hline(g, 55, 58, ey + 5, '#ff8fb3'); vline(g, 52, 10, 13, '#8fd0ff'); px(g, 52, 14, '#8fd0ff'); }
    }
    if (holding) g.drawImage(hermanasFrisbeeSpr('#ff6b3d', 20), 66, 25);
    return c;
  });
}
// a real bocata: a baguette with tomato, ham and lettuce peeking out
function hermanasBocata(g, x, y, s = 1) {
  const L = 13 * s, H = 5 * s;
  ellipsePx(g, x, y + 1, L + 1, H + 1, INK);
  ellipsePx(g, x, y + 2, L - 1, H * .6, '#b8782e');
  for (let i = -L + 3; i < L - 2; i += 2) { px(g, x + i, y + 1, i % 4 ? '#e23b4e' : '#5bd18b'); px(g, x + i + 1, y + 1, '#ffb3c8'); }
  ellipsePx(g, x, y - 1, L, H * .72, '#d9963e'); ellipsePx(g, x - 1, y - 2, L - 2, H * .45, '#f0b860');
  for (let i = -2; i <= 2; i++) linePx(g, x + i * 4 * s - 1, y - 2, x + i * 4 * s + 1, y - 3, '#b8782e');
}
function hermanasFeather(g, x, y, on) {
  const c1 = on ? '#ffffff' : '#6b6977', c2 = on ? '#c8c6d3' : '#44424f';
  polyPx(g, [[x, y - 7], [x + 4, y - 2], [x + 2, y + 6], [x - 2, y + 6], [x - 4, y - 2]], INK);
  polyPx(g, [[x, y - 6], [x + 3, y - 2], [x + 1, y + 5], [x - 1, y + 5], [x - 3, y - 2]], c1);
  vline(g, x, y - 4, y + 7, c2);
}
const HERMANAS_BASKET = { x: 170, y: 176 };
function hermanasBasket(g, n, t) {
  const { x, y } = HERMANAS_BASKET;
  // the handle behind, the bocatas, then the wicker front
  for (let a = Math.PI; a <= TAU; a += .05) { const hx = x + Math.cos(a) * 20, hy = y - 6 + Math.sin(a) * 18; disc(g, hx, hy, 1.8, INK); }
  for (let a = Math.PI; a <= TAU; a += .05) px(g, x + Math.cos(a) * 20, y - 6 + Math.sin(a) * 18, '#c08a4a');
  const spots = [[x - 9, y - 12], [x + 9, y - 12], [x, y - 19]];
  for (let i = 0; i < n; i++) hermanasBocata(g, spots[i][0], spots[i][1] + Math.sin(t * 3 + i) * .4);
  rect(g, x - 24, y - 8, 48, 18, INK); rect(g, x - 23, y - 7, 46, 16, '#c08a4a');
  for (let yy = 0; yy < 16; yy += 4) for (let xx = 0; xx < 46; xx += 6) { rect(g, x - 23 + xx + ((yy / 4) % 2) * 3, y - 7 + yy, 3, 2, '#8a5a2c'); }
  hline(g, x - 23, x + 22, y - 7, '#e0aa66'); rect(g, x - 24, y - 9, 48, 3, INK); rect(g, x - 23, y - 8, 46, 1, '#e0aa66');
}
function hermanasTowelBg() {
  return mdl('hermanas:hTowel2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 34, ['#5ab4f0', '#8fd3ff', '#c8e8fc']);
    bandsV(g, 0, 34, SW, 24, ['#23609e', '#2f7cc4', '#5aaee6']);
    hermanasVelaHotel(g, 222, 35);
    for (let i = 0; i < 40; i++) hline(g, hash2(i, 3) * SW, hash2(i, 3) * SW + 3, 36 + hash2(3, i) * 20, '#7cc0ee');
    for (let x = 0; x < SW; x++) { const y = 58 + Math.round(Math.sin(x * .1) * 1.5); px(g, x, y, '#ffffff'); }
    bandsV(g, 0, 60, SW, 132, ['#ecca8e', '#f2d59a', '#f6dea8', '#f2d59a']);
    for (let i = 0; i < 700; i++) px(g, hash2(i, 71) * SW, 60 + hash2(71, i) * 132, hash2(i, 8) < .5 ? '#e3c283' : '#fff0c8');
    // the sisters' towel (bottom-left), with a fringe
    rect(g, 6, 150, 110, 36, INK); for (let i = 0; i < 108; i += 12) { rect(g, 7 + i, 151, 6, 34, '#e23b4e'); rect(g, 13 + i, 151, 6, 34, '#ffffff'); }
    for (let x = 8; x < 116; x += 3) { vline(g, x, 186, 189, INK); px(g, x, 187, '#ffffff'); }
    // a parasol pole and its shadow
    shadowOval(g, 132, 186, 30, 4, .25);
    return c;
  });
}
defMG({
  id: 'gaviota', stage: 'hermanas', boss: true, name: 'La Gaviota Ladrona', cmd: '¡A POR ELLA!', how: 'Rodéala con el dedo hasta que suelte el frisbee. Luego, dibuja su vuelo hasta Nala', mech: 'draw', beats: 16,
  song: () => HERMANAS_SONGS.boss,
  init(g) {
    g.hp = g.maxHp = [3, 4, 4][g.level - 1]; g.snacks = 3; g.phase = 1;
    g.sp = [1, 1.2, 1.35][g.level - 1] * g.tempo;
    g.gl = { mode: 'patrol', t: 0, pt: 1.2, x: 128, y: 80, stun: 0, holding: true, fl: false, nextDive: 4, upT: 0, nextUp: 6.5, snack: false, hurt: 0 };
    g.fz = null; g.st = hermanasStrokes(); g.lasso = null; g.catch = { x: 70, y: 142, r: 26 };
    g.msg = null; g.caught = false; g.nala = 0; g.tried = false; g.p2t = -1;
  },
  patrolPos(g, pt) { return [128 + Math.sin(pt * .9) * 92, 92 + Math.sin(pt * 1.8 + .5) * 34]; },
  diveTo() { return [HERMANAS_BASKET.x - 4, HERMANAS_BASKET.y - 22]; },
  say(g, s, dur = 1.4) { g.msg = { s, t: g.t, dur }; },
  update(g, dt) {
    const G = g.gl;
    g.st.update();
    if (g.st.done) g.tried = true;
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .07, { pitch: 1.1 });
    G.t += dt; G.stun = Math.max(0, G.stun - dt); G.hurt = Math.max(0, G.hurt - dt);
    if (g.state === 'won') { G.x = lerp(G.x, 280, dt * 1.5); G.y = lerp(G.y, 20, dt * 1.5); g.nala = Math.max(0, g.nala - dt); return; }
    if (g.state === 'lost') { G.y -= 90 * dt; G.x += 40 * dt; return; }
    // ---- the seagull's brain
    const [dx0, dy0] = this.diveTo();
    if (G.stun > 0) { G.fl = fl(G.t * 8) % 2 === 0; }
    else if (G.mode === 'patrol') {
      G.pt += dt * g.sp * (1 + (g.maxHp - g.hp) * .15);
      const [x, y] = this.patrolPos(g, G.pt); G.fl = x < G.x; G.x = x; G.y = y;
      if (g.phase === 1) {
        G.nextDive -= dt; G.nextUp -= dt;
        if (G.nextDive <= 0) { G.mode = 'dive'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.dur = 1.3 / g.sp; this.say(g, '¡Va a por los bocatas! ¡Rodéala!', 1.3); sfx('hermanasCruac', { pitch: 1.2 }); }
        else if (G.nextUp <= 0) { G.mode = 'up'; G.t = 0; G.x0 = G.x; G.y0 = G.y; }
      } else if (g.fz && !g.fz.fly && g.fz.rest > 3.6 / g.sp) { G.mode = 'snatch'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.dur = 1.3 / g.sp; this.say(g, '¡Viene a por el frisbee!', 1.2); sfx('hermanasCruac'); }
    } else if (G.mode === 'dive') {
      const k = Math.min(1, G.t / G.dur), e = E.inQ(k); G.x = lerp(G.x0, dx0, e); G.y = lerp(G.y0, dy0, e); G.fl = dx0 < G.x0;
      if (k >= 1) { g.snacks--; G.snack = true; sfx('gulp'); sfx('hermanasCruac', { pitch: .9 }); g.shake(2, .2); this.say(g, '¡ÑAM! ¡Se lleva un bocata!', 1.2); G.mode = 'escape'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.nextDive = g.r(4, 5.5) / g.sp; g.fx.burst(HERMANAS_BASKET.x, HERMANAS_BASKET.y - 14, 8, { k: 'dot', c: ['#f0b860', '#d9963e'], sp0: 30, sp1: 90, g: 200 }); if (g.snacks <= 0) g.lose(); }
    } else if (G.mode === 'escape' || G.mode === 'up') {
      const k = Math.min(1, G.t / (G.mode === 'up' ? 1.6 : 1)); G.y = lerp(G.y0, -90, E.inQ(k)); G.x = lerp(G.x0, G.x0 + (G.mode === 'up' ? 40 : -60), k); G.fl = G.mode !== 'up';
      if (k >= 1) { G.mode = 'return'; G.t = 0; G.snack = false; G.nextUp = g.r(6, 8); }
    } else if (G.mode === 'return') {
      const [tx, ty] = this.patrolPos(g, G.pt), k = Math.min(1, G.t / .9); G.x = lerp(G.x, tx, k); G.y = lerp(-90, ty, E.outQ(k));
      if (k >= 1) G.mode = 'patrol';
    } else if (G.mode === 'snatch') {
      const f = g.fz, k = Math.min(1, G.t / G.dur), e = E.inQ(k); G.x = lerp(G.x0, f.x, e); G.y = lerp(G.y0, f.y - 8, e); G.fl = f.x < G.x0;
      if (k >= 1) { g.fz = null; G.holding = true; g.phase = 1; g.hp = 1; G.mode = 'escape'; G.t = 0; G.x0 = G.x; G.y0 = G.y; sfx('hermanasCruac'); this.say(g, '¡Otra vez el frisbee! ¡Rodéala!', 1.6); }
    } else if (G.mode === 'drop') {
      G.pt += dt * .6; const [x, y] = this.patrolPos(g, G.pt); G.x = lerp(G.x, x, dt * 2); G.y = lerp(G.y, y - 24, dt * 2);
      if (G.t > 1.2) { G.mode = 'patrol'; }
    }
    // ---- the player's loops
    const s = g.st.done;
    if (s && G.stun <= 0 && G.y > 16 && (G.mode === 'patrol' || G.mode === 'dive' || G.mode === 'return' || G.mode === 'snatch')) {
      const poly = hermanasLoopOf(s, 36);
      if (poly) {
        let n = 0; for (const [ox, oy] of [[0, 0], [10, 0], [-10, 0], [0, 7], [0, -7]]) if (hermanasInPoly(G.x + ox, G.y + oy, poly)) n++;
        if (n >= 3) {
          g.lasso = { poly, t: g.t }; G.stun = 1; G.hurt = .4; HITSTOP = 5; buzz(25); sfx('hermanasCruac', { pitch: .7 }); sfx('stamp'); g.shake(3, .25);
          for (let i = 0; i < 10; i++) g.fx.add({ k: 'hair', x: G.x, y: G.y, vx: g.r(-80, 80), vy: g.r(-90, 10), g: 60, r: 3, life: 1.2, c: '#ffffff', rot: g.r(TAU), vr: g.r(-4, 4) });
          if (G.mode === 'dive') { G.mode = 'patrol'; G.nextDive = g.r(3.5, 5) / g.sp; }
          if (G.mode === 'snatch') { G.mode = 'patrol'; if (g.fz) g.fz.rest = 0; }
          if (g.phase === 1) {
            g.hp--;
            if (g.hp <= 0) { g.phase = 2; G.holding = false; G.mode = 'drop'; G.t = 0; g.fz = { x: G.x, y: G.y, vy: -60, fly: false, falling: true, path: [], rest: 0 }; this.say(g, '¡Ha soltado el frisbee! ¡Dibuja su vuelo!', 2); sfx('sparkle'); }
            else this.say(g, pick(['¡Toma lazo!', '¡Rodeada!', '¡Cruac!']) + (g.hp === 1 ? ' ¡Una más!' : ''), .9);
          }
        }
      }
    }
    // ---- phase 2: the frisbee follows the drawn flight
    const F = g.fz;
    if (F) {
      if (F.falling) { F.vy += 300 * dt; F.y += F.vy * dt; if (F.y >= 132) { F.y = 132; F.falling = false; g.p2t = g.t; sfx('tap', { pitch: .8 }); } }
      if (IN.tap && !F.falling && dist(IN.x, IN.y, F.x, F.y) < 30) { g.owner = true; F.path = []; }
      if (g.owner && g.st.cur) for (const p of g.st.fresh) F.path.push([p[0], p[1]]);
      if (IN.rel) g.owner = false;
      let move = 190 * g.tempo * dt; F.fly = F.path.length > 0;
      while (move > 0 && F.path.length) { const [tx, ty] = F.path[0], d = dist(F.x, F.y, tx, ty); if (d <= move) { F.x = tx; F.y = ty; F.path.shift(); move -= d; } else { F.x += (tx - F.x) / d * move; F.y += (ty - F.y) / d * move; move = 0; } }
      F.spin = (F.spin || 0) + dt * (F.fly ? 16 : 1);
      if (!F.fly && !F.falling) F.rest += dt; else F.rest = 0;
      if (dist(F.x, F.y, g.catch.x, g.catch.y) < g.catch.r && !F.falling) { g.caught = true; g.nala = 1; g.fz = null; g.win(); sfx('bark', { n: 2, pitch: 1.3 }); sfx('sparkle'); HITSTOP = 4; g.fx.burst(g.catch.x, g.catch.y - 20, 20, { k: 'star', c: ['#fff27a', '#ffffff', '#ff9f4f'], sp0: 50, sp1: 160 }); this.say(g, '¡La tengo! ¡Adiós, gaviota!', 2); }
    }
  },
  draw(g, c) {
    const G = g.gl, F = g.fz;
    c.drawImage(hermanasTowelBg(), 0, 0);
    // the sisters on their towel; the basket of bocatas next to them
    drawS(c, hermanasAussieSide('kira', g.state === 'lost' ? 'lie' : 'stand', g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : G.mode === 'dive' ? 'wow' : 'focus', .75), 22, 178, { ax: .5, ay: 1 });
    const nj = g.nala > 0 ? Math.abs(Math.sin((1 - g.nala) * 6)) * 16 : 0;
    drawS(c, hermanasAussieSide('nala', g.caught ? 'jump' : 'stand', g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'wow', .75), 92, 170 - nj, { ax: .5, ay: 1, flip: true });
    if (g.caught) drawS(c, hermanasFrisbeeSpr(), 66, 136 - nj, { rot: .3 });
    hermanasBasket(c, Math.max(0, g.snacks), g.t);
    // the catch zone (phase 2): a big ring on Nala with her name
    if (g.phase === 2 && g.state === 'play') { hermanasTarget(c, g.catch.x, g.catch.y, g.catch.r - 6, g.t, '#fff27a'); hermanasTag(c, g.catch.x, g.catch.y - g.catch.r - 2, 'NALA', '#fff27a'); }
    // dive warning: her dive path to the basket, in red
    if (G.mode === 'dive' && g.state === 'play') {
      const [tx, ty] = this.diveTo(); hermanasDashes(c, [[G.x, G.y], [tx, ty]], g.t, '#ff4060', 4, 3, 2);
      if (fl(g.t * 10) % 2 === 0) { ringPx(c, HERMANAS_BASKET.x, HERMANAS_BASKET.y - 6, 30, '#ff4060'); txt(c, '¡!', HERMANAS_BASKET.x, HERMANAS_BASKET.y - 44, '#ff4060', { align: 'c', out: INK, bold: true }); }
    }
    // the frisbee: its drawn flight and the disc itself
    if (F) {
      if (F.path.length > 1) hermanasDashes(c, [[F.x, F.y]].concat(F.path), g.t, '#fff27a', 4, 3, 2);
      if (!F.falling) shadowOval(c, F.x, F.y + 9, 9, 2, .35);
      drawS(c, hermanasFrisbeeSpr('#ff6b3d', 22), F.x, F.y, { rot: Math.sin(F.spin) * .25 });
      if (!F.fly && !F.falling && g.state === 'play') {
        hermanasTarget(c, F.x, F.y, 13, g.t, '#fff27a');
        // first seconds on the sand: the way home, dashed, with a hand drawing it
        if (!F.path.length && g.p2t >= 0 && g.t - g.p2t < 2.4) {
          const P = [[F.x, F.y], [(F.x + g.catch.x) / 2, Math.min(F.y, g.catch.y) - 34], [g.catch.x, g.catch.y]];
          hermanasDashes(c, P, g.t, '#ffffff', 3, 3); const k = ((g.t - g.p2t) * .8) % 1, seg = k < .5 ? 0 : 1, f = (k % .5) * 2;
          c.globalAlpha = .85; drawHand(c, lerp(P[seg][0], P[seg + 1][0], f), lerp(P[seg][1], P[seg + 1][1], f), true); c.globalAlpha = 1;
        }
      }
    }
    if (g.st.cur && !g.owner && g.state === 'play') for (let i = 1; i < g.st.cur.length; i++) thickLine(c, g.st.cur[i - 1][0], g.st.cur[i - 1][1], g.st.cur[i][0], g.st.cur[i][1], 1.2, '#ffffff');
    // the gull (on this screen)
    if (G.y > -40) {
      shadowOval(c, G.x, 150 + (G.y - 92) * .2, 16, 3, clamp((G.y + 30) / 150, .15, .4));
      const mood = G.hurt > 0 ? 'shock' : G.stun > 0 ? 'dizzy' : G.mode === 'dive' || G.mode === 'snatch' ? 'angry' : g.phase === 1 && g.hp <= 1 ? 'shy' : 'smug';
      const img = hermanasBossGull(G.stun > 0 ? 1 : fl(G.t * (G.mode === 'dive' ? 16 : 9)) % 3, G.holding, mood);
      drawS(c, img, G.x, G.y, { flip: G.fl, rot: G.stun > 0 ? Math.sin(G.t * 20) * .3 : G.mode === 'dive' ? (G.fl ? -.45 : .45) : 0 });
      if (G.snack) drawS(c, mdl('hermanas:bocataSpr', () => { const q = mkCanvas(30, 14); hermanasBocata(q.g, 15, 6); return q; }), G.x + (G.fl ? -22 : 22), G.y + 12, {});
      if (G.stun > 0) for (let i = 0; i < 3; i++) { const a = G.t * 6 + i * TAU / 3; drawStar(c, G.x + Math.cos(a) * 20, G.y - 22 + Math.sin(a) * 6, 3, '#fff27a'); }
      // how to beat her, shown until you've tried: a dashed ring round her and a hand drawing it
      if (!g.tried && g.phase === 1 && g.state === 'play' && G.y > 30 && G.stun <= 0) {
        const P = hermanasCirclePts(G.x, G.y, 38, 30, 0, 1); hermanasDashes(c, P, g.t, '#ffffff', 4, 3);
        const a = g.t * 5; c.globalAlpha = .85; drawHand(c, G.x + Math.cos(a) * 38, G.y + Math.sin(a) * 34, true); c.globalAlpha = 1;
        hermanasTag(c, clamp(G.x, 40, 216), G.y - 40, '¡RODÉALA!', '#fff27a');
      }
    }
    // the lasso tightening
    if (g.lasso && g.t - g.lasso.t < .7) {
      const k = clamp((g.t - g.lasso.t) / .3, 0, 1), P = g.lasso.poly.map(([x, y]) => [lerp(x, G.x, k * .7), lerp(y, G.y, k * .7)]);
      for (let i = 0; i < P.length; i += 1) { const p = P[i], q = P[(i + 1) % P.length]; thickLine(c, p[0], p[1], q[0], q[1], 2, '#c0662c'); }
      if (g.t - g.lasso.t < .5) shout(c, '¡ZAS!', clamp(G.x, 40, 216), clamp(G.y - 36, 22, 170), g.t - g.lasso.t);
    }
    if (g.state === 'won') hermanasStamp(c, '¡ATRAPADO!', 128, 30, g.t - g.decidedAt);
    if (g.state === 'lost') hermanasStamp(c, '¡SIN BOCATAS!', 128, 30, g.t - g.decidedAt, false);
    if (g.msg && g.t - g.msg.t < g.msg.dur) { const k = E.outBack(clamp((g.t - g.msg.t) / .2, 0, 1)); g.msg.w = g.msg.w || txtW(g.msg.s) + 14; panel(c, SW / 2 - g.msg.w / 2, rd(4 - (1 - k) * 20), g.msg.w, 15, '#ffffff', { r: 4 }); txt(c, g.msg.s, SW / 2, rd(8 - (1 - k) * 20), INK, { align: 'c' }); }
  },
  top(g, c) {
    const G = g.gl;
    // the score of the fight, under the command
    panel(c, 6, 46, 120, 44, '#fff8e6', { r: 5 });
    drawS(c, hermanasGullStand(g.phase === 2 ? 'shy' : g.hp <= 1 ? 'shy' : 'smug'), 24, 68, { s: 1 });
    txt(c, 'GAVIOTA', 44, 51, INK, { bold: true });
    for (let i = 0; i < g.maxHp; i++) hermanasFeather(c, 50 + i * 13, 76, i < g.hp);
    panel(c, 130, 46, 120, 44, '#fff8e6', { r: 5 });
    txt(c, 'BOCATAS', 190, 51, INK, { bold: true, align: 'c' });
    for (let i = 0; i < 3; i++) { const x = 152 + i * 38; if (i < g.snacks) hermanasBocata(c, x, 76, .8); else txt(c, '✗', x, 70, '#c02d45', { align: 'c', bold: true }); }
    const goal = g.phase === 2 ? '¡Dibuja el vuelo del frisbee hasta Nala!' : g.hp <= 1 ? '¡Un lazo más y suelta el frisbee!' : 'Rodéala con el dedo: ' + g.hp + ' lazos más';
    if (g.state === 'play') txt(c, goal, SW / 2, 98, '#ffffff', { align: 'c', out: INK });
    // she flies over the top screen when she climbs out of the bottom one
    if (G.y < -8) { const ty = G.y + SH + HINGE; drawS(c, hermanasBossGull(fl(G.t * 9) % 3, G.holding, 'smug'), G.x, ty, { flip: G.fl }); if (G.snack) hermanasBocata(c, G.x + (G.fl ? -22 : 22), ty + 12); }
  },
  bot(g) {
    const G = g.gl, F = g.fz;
    if (g.state !== 'play') return { down: false };
    if (g._bot && !g._bot.done) return hermanasBot(g, g.plan, g.planSp || 12);
    if (g.phase === 2 && F && !F.falling && !F.fly) { g._bot = null; g.plan = [[[F.x, F.y], [(F.x + g.catch.x) / 2, Math.min(F.y, g.catch.y) - 30], [g.catch.x, g.catch.y]]]; g.planSp = 8; return hermanasBot(g, g.plan, 8); }
    if (G.stun <= 0 && G.y > 30 && (G.mode === 'patrol' || G.mode === 'dive' || G.mode === 'return' || G.mode === 'snatch')) {
      // aim where she'll be when the loop closes
      const ahead = .32; let px0 = G.x, py0 = G.y;
      if (G.mode === 'patrol') [px0, py0] = this.patrolPos(g, G.pt + ahead * g.sp * (1 + (g.maxHp - g.hp) * .15));
      else if (G.mode === 'dive') { const [tx, ty] = this.diveTo(), k = Math.min(1, (G.t + ahead) / G.dur), e = E.inQ(k); px0 = lerp(G.x0, tx, e); py0 = lerp(G.y0, ty, e); }
      else if (G.mode === 'snatch' && F) { const k = Math.min(1, (G.t + ahead) / G.dur), e = E.inQ(k); px0 = lerp(G.x0, F.x, e); py0 = lerp(G.y0, F.y - 8, e); }
      if (py0 < 30) return { down: false };
      g._bot = null; g.plan = [hermanasCirclePts(px0, py0, 36, 30, -Math.PI / 2, 1.18)]; g.planSp = 14;
      return hermanasBot(g, g.plan, 14);
    }
    return { down: false };
  },
});
