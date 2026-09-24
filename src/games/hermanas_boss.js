// ============================================================================
//  BOSS — La Gaviota Ladrona. Lasso her (draw a loop around her) while she
//  swoops; guard the sandwiches from her dives; when she drops the frisbee,
//  draw its flight back into the sisters' paws.
// ============================================================================
'use strict';
function hermanasSandwich(g, x, y, bitten) {
  rect(g, x - 7, y - 3, 14, 3, INK); rect(g, x - 6, y - 2, 12, 2, '#e8c07a');
  rect(g, x - 7, y, 14, 2, '#5bd18b'); rect(g, x - 7, y + 2, 14, 1, '#ec5e5e');
  rect(g, x - 7, y + 3, 14, 3, INK); rect(g, x - 6, y + 3, 12, 2, '#d9a55a');
  if (bitten) { disc(g, x + 5, y, 3.5, bitten === 'gone' ? '#00000000' : '#fff8e6'); }
}
function hermanasFeather(g, x, y, on) {
  const c1 = on ? '#ffffff' : '#6b6977', c2 = on ? '#c8c6d3' : '#44424f';
  polyPx(g, [[x, y - 6], [x + 3, y - 2], [x + 2, y + 5], [x - 2, y + 5], [x - 3, y - 2]], INK);
  polyPx(g, [[x, y - 5], [x + 2, y - 2], [x + 1, y + 4], [x - 1, y + 4], [x - 2, y - 2]], c1);
  vline(g, x, y - 3, y + 6, c2);
}
function hermanasTowelBg() {
  return mdl('hermanas:hTowel', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 34, ['#5ab4f0', '#8fd3ff', '#c8e8fc']);
    bandsV(g, 0, 34, SW, 24, ['#23609e', '#2f7cc4', '#5aaee6']);
    hermanasVelaHotel(g, 222, 35);
    for (let i = 0; i < 40; i++) hline(g, hash2(i, 3) * SW, hash2(i, 3) * SW + 3, 36 + hash2(3, i) * 20, '#7cc0ee');
    for (let x = 0; x < SW; x++) { const y = 58 + Math.round(Math.sin(x * .1) * 1.5); px(g, x, y, '#ffffff'); }
    bandsV(g, 0, 60, SW, 132, ['#ecca8e', '#f2d59a', '#f6dea8', '#f2d59a']);
    for (let i = 0; i < 700; i++) px(g, hash2(i, 71) * SW, 60 + hash2(71, i) * 132, hash2(i, 8) < .5 ? '#e3c283' : '#fff0c8');
    // the sisters' towel (bottom-left)
    rect(g, 8, 150, 92, 34, INK); for (let i = 0; i < 90; i += 10) { rect(g, 9 + i, 151, 5, 32, '#e23b4e'); rect(g, 14 + i, 151, 5, 32, '#ffffff'); }
    return c;
  });
}
defMG({
  id: 'gaviota', stage: 'hermanas', boss: true, name: 'La Gaviota Ladrona', cmd: '¡A POR ELLA!', how: 'Rodéala tres veces y traza el vuelo del frisbee hasta las hermanas', mech: 'draw', beats: 16,
  song: () => HERMANAS_SONGS.boss,
  init(g) {
    g.hp = g.maxHp = [3, 4, 4][g.level - 1]; g.snacks = 3; g.phase = 1;
    g.sp = [1, 1.2, 1.35][g.level - 1] * g.tempo;
    g.gl = { mode: 'patrol', t: 0, pt: 1.2, x: 128, y: 80, stun: 0, holding: true, fl: false, nextDive: 4, upT: 0, nextUp: 6.5, snack: false };
    g.fz = null; g.st = hermanasStrokes(); g.lasso = null; g.catch = { x: 60, y: 150, r: 28 };
    g.msg = null; g.caught = false; g.nala = 0;
  },
  patrolPos(g, pt) { return [128 + Math.sin(pt * .9) * 96, 92 + Math.sin(pt * 1.8 + .5) * 36]; },
  say(g, s, dur = 1.4) { g.msg = { s, t: g.t, dur }; },
  update(g, dt) {
    const G = g.gl;
    g.st.update();
    if (IN.down && Math.hypot(IN.dx, IN.dy) > .5) hermanasThrottleSfx(g, 'chalk', .07, { pitch: 1.1 });
    G.t += dt; G.stun = Math.max(0, G.stun - dt);
    if (g.state === 'won') { G.x = lerp(G.x, 200, dt * 3); G.y = lerp(G.y, 160, dt * 3); g.nala = Math.max(0, g.nala - dt); return; }
    if (g.state === 'lost') { G.y -= 90 * dt; G.x += 40 * dt; return; }
    // ---- the seagull's brain
    if (G.stun > 0) { G.fl = fl(G.t * 8) % 2 === 0; }
    else if (G.mode === 'patrol') {
      G.pt += dt * g.sp * (1 + (g.maxHp - g.hp) * .15);
      const [x, y] = this.patrolPos(g, G.pt); G.fl = x < G.x; G.x = x; G.y = y;
      if (g.phase === 1) {
        G.nextDive -= dt; G.nextUp -= dt;
        if (G.nextDive <= 0) { G.mode = 'dive'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.dur = 1.25 / g.sp; this.say(g, '¡Va a por los bocatas!', 1.2); sfx('hermanasCruac', { pitch: 1.2 }); }
        else if (G.nextUp <= 0) { G.mode = 'up'; G.t = 0; G.x0 = G.x; G.y0 = G.y; }
      } else if (g.fz && !g.fz.fly && g.fz.rest > 3.6 / g.sp) { G.mode = 'snatch'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.dur = 1.3 / g.sp; this.say(g, '¡Que viene a por el frisbee!', 1.2); sfx('hermanasCruac'); }
    } else if (G.mode === 'dive') {
      const k = Math.min(1, G.t / G.dur), e = E.inQ(k); G.x = lerp(G.x0, 46, e); G.y = lerp(G.y0, 158, e); G.fl = true;
      if (k >= 1) { g.snacks--; G.snack = true; sfx('gulp'); sfx('hermanasCruac', { pitch: .9 }); g.shake(2, .2); this.say(g, '¡ÑAM! ¡Bocata robado!', 1.2); G.mode = 'escape'; G.t = 0; G.x0 = G.x; G.y0 = G.y; G.nextDive = g.r(4, 5.5) / g.sp; if (g.snacks <= 0) { g.lose(); } }
    } else if (G.mode === 'escape' || G.mode === 'up') {
      const k = Math.min(1, G.t / (G.mode === 'up' ? 1.6 : 1)); G.y = lerp(G.y0, -90, E.inQ(k)); G.x = lerp(G.x0, G.x0 + (G.mode === 'up' ? 40 : 60), k);
      if (k >= 1) { G.mode = 'return'; G.t = 0; G.snack = false; G.nextUp = g.r(6, 8); }
    } else if (G.mode === 'return') {
      const [tx, ty] = this.patrolPos(g, G.pt), k = Math.min(1, G.t / .9); G.x = lerp(G.x, tx, k); G.y = lerp(-90, ty, E.outQ(k));
      if (k >= 1) G.mode = 'patrol';
    } else if (G.mode === 'snatch') {
      const f = g.fz, k = Math.min(1, G.t / G.dur), e = E.inQ(k); G.x = lerp(G.x0, f.x, e); G.y = lerp(G.y0, f.y - 6, e); G.fl = f.x < G.x0;
      if (k >= 1) { g.fz = null; G.holding = true; g.phase = 1; g.hp = 1; G.mode = 'escape'; G.t = 0; G.x0 = G.x; G.y0 = G.y; sfx('hermanasCruac'); this.say(g, '¡Otra vez el frisbee! ¡Rodéala!', 1.6); }
    } else if (G.mode === 'drop') {
      G.pt += dt * .6; const [x, y] = this.patrolPos(g, G.pt); G.x = lerp(G.x, x, dt * 2); G.y = lerp(G.y, y - 20, dt * 2);
      if (G.t > 1.2) { G.mode = 'patrol'; }
    }
    // ---- the player's loops
    const s = g.st.done;
    if (s && G.stun <= 0 && G.y > 16 && (G.mode === 'patrol' || G.mode === 'dive' || G.mode === 'return' || G.mode === 'snatch')) {
      const poly = hermanasLoopOf(s, 36);
      if (poly) {
        let n = 0; for (const [ox, oy] of [[0, 0], [7, 0], [-7, 0], [0, 6], [0, -6]]) if (hermanasInPoly(G.x + ox, G.y + oy, poly)) n++;
        if (n >= 3) {
          g.lasso = { poly, t: g.t }; G.stun = 1; HITSTOP = 5; buzz(25); sfx('hermanasCruac', { pitch: .7 }); sfx('stamp'); g.shake(3, .25);
          for (let i = 0; i < 8; i++) g.fx.add({ k: 'hair', x: G.x, y: G.y, vx: g.r(-80, 80), vy: g.r(-90, 10), g: 60, r: 3, life: 1.2, c: '#ffffff', rot: g.r(TAU), vr: g.r(-4, 4) });
          if (G.mode === 'dive') { G.mode = 'patrol'; G.nextDive = g.r(3.5, 5) / g.sp; }
          if (G.mode === 'snatch') { G.mode = 'patrol'; if (g.fz) g.fz.rest = 0; }
          if (g.phase === 1) {
            g.hp--;
            if (g.hp <= 0) { g.phase = 2; G.holding = false; G.mode = 'drop'; G.t = 0; g.fz = { x: G.x, y: G.y, vy: -60, fly: false, falling: true, path: [], rest: 0 }; this.say(g, '¡Soltó el frisbee! ¡Dibuja su vuelo!', 2); sfx('sparkle'); }
            else this.say(g, pick(['¡Toma lazo!', '¡Rodeada!', '¡Cruac!']), .9);
          }
        }
      }
    }
    // ---- phase 2: the frisbee follows the drawn flight
    const F = g.fz;
    if (F) {
      if (F.falling) { F.vy += 300 * dt; F.y += F.vy * dt; if (F.y >= 140) { F.y = 140; F.falling = false; sfx('tap', { pitch: .8 }); } }
      if (IN.tap && !F.falling && dist(IN.x, IN.y, F.x, F.y) < 30) { g.owner = true; F.path = []; }
      if (g.owner && g.st.cur) for (const p of g.st.fresh) F.path.push([p[0], p[1]]);
      if (IN.rel) g.owner = false;
      let move = 190 * g.tempo * dt; F.fly = F.path.length > 0;
      while (move > 0 && F.path.length) { const [tx, ty] = F.path[0], d = dist(F.x, F.y, tx, ty); if (d <= move) { F.x = tx; F.y = ty; F.path.shift(); move -= d; } else { F.x += (tx - F.x) / d * move; F.y += (ty - F.y) / d * move; move = 0; } }
      F.spin = (F.spin || 0) + dt * (F.fly ? 16 : 1);
      if (!F.fly && !F.falling) F.rest += dt; else F.rest = 0;
      if (dist(F.x, F.y, g.catch.x, g.catch.y) < g.catch.r && !F.falling) { g.caught = true; g.nala = 1; g.fz = null; g.win(); sfx('bark', { n: 2, pitch: 1.3 }); sfx('sparkle'); HITSTOP = 4; g.fx.burst(g.catch.x, g.catch.y - 20, 20, { k: 'star', c: ['#fff27a', '#ffffff', '#ff9f4f'], sp0: 50, sp1: 160 }); this.say(g, '¡La tengo!', 2); }
    }
  },
  draw(g, c) {
    const G = g.gl;
    c.drawImage(hermanasTowelBg(), 0, 0);
    // the sisters and the sandwiches on the towel
    for (let i = 0; i < 3; i++) { const x = 70 + i * 12, y = 176; if (i < g.snacks) hermanasSandwich(c, x, y); else { for (let q = 0; q < 4; q++) px(c, x - 3 + q * 2, y + 2, '#d9a55a'); } }
    drawS(c, hermanasAussieSide('kira', g.state === 'lost' ? 'lie' : 'stand', g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'focus', .75), 24, 176, { ax: .5, ay: 1 });
    const nj = g.nala > 0 ? Math.abs(Math.sin((1 - g.nala) * 6)) * 16 : 0;
    drawS(c, hermanasAussieSide('nala', g.caught ? 'jump' : 'stand', g.state === 'won' ? 'happy' : g.state === 'lost' ? 'sad' : 'wow', .75), 90, 166 - nj, { ax: .5, ay: 1, flip: true });
    if (g.caught) drawS(c, hermanasFrisbeeSpr(), 66, 136 - nj, { rot: .3 });
    // the catch zone (phase 2)
    if (g.phase === 2 && g.state === 'play') { const k = (g.t * 1.5) % 1; ringPx(c, g.catch.x, g.catch.y, g.catch.r - 4 + k * 6, '#ffffff'); tiny(c, 'AQUÍ', g.catch.x, g.catch.y - g.catch.r - 6, '#ffffff', { align: 'c' }); }
    // dive warning over the sandwiches
    if (G.mode === 'dive' && fl(g.t * 10) % 2 === 0) { txt(c, '!', 82, 150, '#ff4060', { out: INK, bold: true }); ringPx(c, 82, 176, 18, '#ff4060'); }
    // flight path of the frisbee + the frisbee
    const F = g.fz;
    if (F) { for (let i = 0; i < F.path.length; i += 3) px(c, F.path[i][0], F.path[i][1], '#ffffff'); if (!F.falling) shadowOval(c, F.x, F.y + 8, 7, 1.5, .35); drawS(c, hermanasFrisbeeSpr(), F.x, F.y, { rot: Math.sin(F.spin) * .25 }); if (!F.fly && !F.falling && g.state === 'play') { const k = (g.t * 2) % 1; ringPx(c, F.x, F.y, 12 + k * 8, '#fff27a'); } }
    if (g.st.cur && !g.owner) for (let i = 1; i < g.st.cur.length; i++) thickLine(c, g.st.cur[i - 1][0], g.st.cur[i - 1][1], g.st.cur[i][0], g.st.cur[i][1], 1, '#ffffff');
    // the gull (on this screen)
    if (G.y > -30) {
      shadowOval(c, G.x, 150 + (G.y - 92) * .2, 12, 2.5, clamp((G.y + 30) / 150, .15, .4));
      const img = hermanasGullSpr(G.stun > 0 ? 1 : fl(G.t * (G.mode === 'dive' ? 16 : 9)) % 3, G.holding, G.stun > 0 ? 'dizzy' : G.mode === 'dive' || G.mode === 'snatch' ? 'angry' : 'smug');
      drawS(c, img, G.x, G.y, { flip: G.fl, rot: G.stun > 0 ? Math.sin(G.t * 20) * .3 : G.mode === 'dive' ? (G.fl ? -.5 : .5) : 0 });
      if (G.snack) hermanasSandwich(c, G.x + (G.fl ? -18 : 18), G.y + 4);
      if (G.stun > 0) for (let i = 0; i < 3; i++) { const a = G.t * 6 + i * TAU / 3; drawStar(c, G.x + Math.cos(a) * 16, G.y - 16 + Math.sin(a) * 5, 2.5, '#fff27a'); }
    }
    // the lasso tightening
    if (g.lasso && g.t - g.lasso.t < .7) {
      const k = clamp((g.t - g.lasso.t) / .3, 0, 1), P = g.lasso.poly.map(([x, y]) => [lerp(x, G.x, k * .75), lerp(y, G.y, k * .75)]);
      for (let i = 0; i < P.length; i += 1) { const p = P[i], q = P[(i + 1) % P.length]; thickLine(c, p[0], p[1], q[0], q[1], 1.6, '#c0662c'); }
    }
    if (g.msg && g.t - g.msg.t < g.msg.dur) { const k = E.outBack(clamp((g.t - g.msg.t) / .2, 0, 1)); g.msg.w = g.msg.w || txtW(g.msg.s) + 14; panel(c, SW / 2 - g.msg.w / 2, rd(4 - (1 - k) * 20), g.msg.w, 15, '#ffffff', { r: 4 }); txt(c, g.msg.s, SW / 2, rd(8 - (1 - k) * 20), INK, { align: 'c' }); }
  },
  top(g, c) {
    const G = g.gl;
    panel(c, 6, 26, 118, 40, '#fff8e6', { r: 5 });
    drawS(c, hermanasGullStand(g.hp <= 1 ? 'shy' : 'smug'), 22, 46, { s: 1 });
    txt(c, 'GAVIOTA', 42, 31, INK, { bold: true });
    for (let i = 0; i < g.maxHp; i++) hermanasFeather(c, 48 + i * 12, 52, i < g.hp);
    panel(c, 132, 26, 118, 40, '#fff8e6', { r: 5 });
    txt(c, 'BOCATAS', 140, 31, INK, { bold: true });
    for (let i = 0; i < 3; i++) { if (i < g.snacks) hermanasSandwich(c, 150 + i * 22, 52); else txt(c, '✗', 150 + i * 22, 48, '#c02d45', { align: 'c', bold: true }); }
    if (g.phase === 2 && g.state === 'play') txt(c, '¡Dibuja el vuelo del frisbee!', SW / 2, 74, '#fff27a', { align: 'c', out: INK });
    // she flies over the top screen when she climbs out of the bottom one
    if (G.y < -8) { const ty = G.y + SH + HINGE; drawS(c, hermanasGullSpr(fl(G.t * 9) % 3, G.holding, 'smug'), G.x, ty, { flip: G.fl }); if (G.snack) hermanasSandwich(c, G.x + (G.fl ? -18 : 18), ty + 4); }
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
      else if (G.mode === 'dive') { const k = Math.min(1, (G.t + ahead) / G.dur), e = E.inQ(k); px0 = lerp(G.x0, 46, e); py0 = lerp(G.y0, 158, e); }
      else if (G.mode === 'snatch' && F) { const k = Math.min(1, (G.t + ahead) / G.dur), e = E.inQ(k); px0 = lerp(G.x0, F.x, e); py0 = lerp(G.y0, F.y - 6, e); }
      if (py0 < 30) return { down: false };
      g._bot = null; g.plan = [hermanasCirclePts(px0, py0, 34, 30, -Math.PI / 2, 1.18)]; g.planSp = 14;
      return hermanasBot(g, g.plan, 14);
    }
    return { down: false };
  },
});
