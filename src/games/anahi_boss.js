// ============================================================================
//  BOSS — El Rey Pulgón. Tap him while he sits; squash his minions before they
//  bite; he leaps to the top screen and crashes down where his shadow shows.
// ============================================================================
'use strict';
function fleaKing(frame) {
  return mdl('fleaKing' + frame, () => fleaKingAt(frame, 1.6));
}
function fleaKingAt(frame, k) {
  return mdl('fleaKingK' + frame + k, () => {
    const Bn = RAMP.mud, R = RAMP.red, Gd = RAMP.gold, S = (f) => (x, y) => f(x / k, y / k) * k;
    const leg = frame === 'jump';
    const legs = S(SD.union(...[0, 1, 2].map(i => leg ? SD.capsule(14 + i * 6, 26, 8 + i * 8, 36, 1.3, 1) : SD.capsule(14 + i * 6, 26, 12 + i * 7, 33, 1.3, 1.1))));
    const body = S(SD.ellipse(22, 22, 12, 9)), head = S(SD.circle(33, 15, 6.5));
    const cape = S(SD.poly([[12, 12], [26, 12], [20, 30], [6, 28]]));
    const crown = S(SD.poly([[28, 9], [28, 3], [30.5, 6], [33, 1], [35.5, 6], [38, 3], [38, 9]]));
    return model(Math.ceil(44 * k), Math.ceil(38 * k), [
      { f: legs, ramp: Bn, z: 0, th: 1.5 },
      { f: cape, ramp: R, z: .5, th: 4 },
      { f: body, ramp: Bn, z: 1, th: 8, gloss: true },
      { f: head, ramp: Bn, z: 2, th: 5 },
      { f: crown, ramp: Gd, z: 3, th: 2, flatV: .8 },
    ], { post: g => {
      const K = INK, q = v => rd(v * k);
      rect(g, q(33.5), q(12.5), 3, 3, '#ffffff'); px(g, q(34.5) + 1, q(13.5), K); rect(g, q(29.5), q(12.5), 3, 3, '#ffffff'); px(g, q(30.5) + 1, q(13.5), K);
      linePx(g, q(28.5), q(10.5), q(32), q(12), K); linePx(g, q(37.5), q(10.5), q(34), q(12), K); // angry brows
      hline(g, q(29), q(38), q(18), K); hline(g, q(29), q(38), q(18) + 1, '#3d2512'); px(g, q(28), q(19), K); px(g, q(39), q(19), K); px(g, q(27), q(20), K); px(g, q(40), q(20), K); // moustache
      disc(g, q(33), q(3), 1.2, '#ff4060'); px(g, q(30.5), q(6), '#63a0ef'); px(g, q(35.5), q(6), '#63a0ef');
      thickLine(g, q(38), q(16), q(43), q(20), 1, K); // proboscis
    } });
  });
}
defMG({
  id: 'pulgon', stage: 'anahi', boss: true, name: 'El Rey Pulgón', cmd: '¡CAZA AL REY!', how: 'Toca al rey cuando se pare y aplasta a sus súbditos', mech: 'tap', beats: 16,
  song: () => ANAHI_SONGS.boss,
  init(g) {
    g.hp = g.maxHp = [6, 7, 8][g.level - 1]; g.itch = 0; g.mins = [];
    g.k = { x: 120, y: 120, st: 'sit', t: 0, sit: 1.1, air: false, high: false, flash: 0 };
    g.taunt = 0; g.face = 'normal'; g.deadT = -1;
  },
  landSpot(g) { const x = g.r(40, 178); const y = 196 - 92 * Math.sqrt(Math.max(0, 1 - ((x - 118) / 150) ** 2)) + g.r(14, 44); return [x, y]; },
  jump(g, high) {
    const K = g.k, [x1, y1] = this.landSpot(g);
    K.st = 'jump'; K.t = 0; K.x0 = K.x; K.y0 = K.y; K.x1 = x1; K.y1 = y1; K.high = high; K.dur = high ? 1.25 : .5; K.h = high ? 330 : g.r(30, 60);
    sfx('boing', { pitch: high ? .8 : 1.2, vol: .5 });
  },
  update(g, dt) {
    const K = g.k, rage = 1 + (g.maxHp - g.hp) * .12;
    K.flash = Math.max(0, K.flash - dt * 5); g.taunt = Math.max(0, g.taunt - dt);
    if (g.state === 'won') { K.x += 160 * dt; K.y -= 260 * dt; K.spin = (K.spin || 0) + dt * 14; return; }
    if (g.state === 'lost') return;
    K.t += dt;
    if (K.st === 'sit') {
      if (K.t > K.sit / rage) { g.itch = Math.min(100, g.itch + 7); g.fx.add({ k: 'txt', s: '¡ÑAM!', x: K.x, y: K.y - 18, life: .5, c: '#ff93bf' }); sfx('squish', { pitch: .6, vol: .4 }); this.jump(g, g.r() < .3 + (g.maxHp - g.hp) * .05); }
    } else if (K.st === 'jump') {
      const k = Math.min(1, K.t / K.dur);
      K.x = lerp(K.x0, K.x1, k); K.y = lerp(K.y0, K.y1, k) - Math.sin(k * Math.PI) * K.h;
      if (k >= 1) {
        K.st = 'sit'; K.t = 0; K.sit = g.r(.7, 1.1);
        if (K.high) { g.shake(4, .25); sfx('stamp'); g.fx.burst(K.x, K.y + 6, 12, { k: 'puff', c: ['#ffffff', '#dfe3f1'], sp0: 30, sp1: 90, r: 4 }); }
        const n = g.hp <= g.maxHp / 2 ? 2 : 1;
        for (let i = 0; i < n; i++) { const [mx, my] = this.landSpot(g); g.mins.push({ x: K.x, y: K.y, x0: K.x, y0: K.y, x1: mx, y1: my, j: 0, bite: 1.6 / rage, dead: false }); }
        if (g.r() < .5) { g.taunt = .8; sfx('yip', { pitch: 2.2, vol: .4 }); }
      }
    } else if (K.st === 'hit') {
      K.x += K.vx * dt; K.y += K.vy * dt; K.vy += 300 * dt;
      if (K.t > .35) this.jump(g, false);
    }
    for (const m of g.mins) {
      if (m.dead) { m.dt = (m.dt || 0) + dt; continue; }
      if (m.j < 1) { m.j = Math.min(1, m.j + dt * 2.6); m.x = lerp(m.x0, m.x1, m.j); m.y = lerp(m.y0, m.y1, m.j) - Math.sin(m.j * Math.PI) * 30; continue; }
      m.bite -= dt;
      if (m.bite <= 0) { g.itch = Math.min(100, g.itch + 12); m.dead = true; m.dt = 0; m.bitten = true; g.fx.add({ k: 'txt', s: '¡pica!', x: m.x, y: m.y - 10, life: .5, c: '#ff93bf' }); g.shake(1.5, .1); }
    }
    // taps
    if (IN.tap) {
      const onKing = K.st !== 'jump' || !K.high || K.t / K.dur > .9;
      if (onKing && dist(IN.x, IN.y, K.x, K.y - 8) < 28 && K.st !== 'hit') {
        g.hp--; K.flash = 1; K.st = 'hit'; K.t = 0; K.vx = (K.x < 128 ? 1 : -1) * 60; K.vy = -120; HITSTOP = 5; buzz(20);
        sfx('squish', { pitch: .7 }); sfx('stamp'); g.shake(3, .2);
        g.fx.burst(K.x, K.y, 14, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 160 });
        g.fx.add({ k: 'txt', s: pick(['¡AUCH!', '¡OUCH!', '¡MI CORONA!']), x: K.x, y: K.y - 24, life: .6, c: '#ffffff' });
        if (g.hp <= 0) { g.win(); g.deadT = g.t; sfx('whoosh'); for (const m of g.mins) if (!m.dead) { m.dead = true; m.dt = 0; } }
      } else {
        let best = null, bd = 15; for (const m of g.mins) if (!m.dead) { const d = dist(IN.x, IN.y, m.x, m.y); if (d < bd) { bd = d; best = m; } }
        if (best) { best.dead = true; best.dt = 0; sfx('squish', { pitch: 1.4 }); HITSTOP = 2; g.fx.burst(best.x, best.y, 6, { k: 'star', c: [C.yellow, '#fff'] }); }
      }
    }
    g.itch = Math.max(0, g.itch - dt * 2);
    if (g.itch >= 100) { g.lose(); sfx('whine'); }
  },
  draw(g, c) {
    c.drawImage(tilesBg(), 0, 0);
    c.drawImage(westieBackBig(), 0, 0);
    const face = g.state === 'won' ? 'happy' : g.state === 'lost' ? 'dizzy' : g.itch > 66 ? 'grr' : g.itch > 33 ? 'wow' : 'normal';
    drawS(c, buleHead(face), 214, 70 + (g.itch > 66 ? Math.sin(g.t * 40) * 1.5 : 0), { rot: -.12 });
    for (const m of g.mins) { if (m.dead) { if (m.dt < .5 && !m.bitten) drawS(c, splatSpr(), m.x, m.y, { alpha: 1 - m.dt / .5 }); continue; } drawS(c, fleaSpr(fl(g.t * 10) % 2), m.x, m.y); }
    const K = g.k;
    if (K.st === 'jump' && K.high) { const k = K.t / K.dur; shadowOval(c, K.x1, K.y1 + 6, 10 * k + 2, 3 * k + 1, .7); if (k > .6 && fl(g.t * 12) % 2) ringPx(c, K.x1, K.y1 + 6, 12, '#ff4060'); }
    const onBottom = !(K.st === 'jump' && K.high && K.y < -20);
    if (onBottom) {
      const img = K.flash > 0 && fl(K.flash * 10) % 2 ? silhouette(fleaKing('sit'), '#ffffff') : fleaKing(K.st === 'jump' ? 'jump' : 'sit');
      drawS(c, img, K.x, K.y, { ay: .8, rot: K.spin || 0, flip: K.st === 'jump' && K.x1 < K.x0 });
      if (g.taunt > 0 && g.state === 'play') shout(c, '¡JA, JA!', K.x + 20, K.y - 30, .8 - g.taunt);
    }
    if (g.state === 'won' && g.t - g.deadT < 1.4) shout(c, '¡VOLVERÉ!', clamp(K.x, 40, 216), clamp(K.y + 30, 30, 170), g.t - g.deadT);
  },
  top(g, c) {
    // boss HUD: name, crown hearts, itch meter
    const K = g.k;
    panel(c, 6, 26, 118, 38, '#fff8e6', { r: 5 });
    drawS(c, fleaKingAt('sit', 1), 24, 46, { s: 1 });
    txt(c, 'REY PULGÓN', 44, 32, INK, { bold: true });
    for (let i = 0; i < g.maxHp; i++) drawHeart(c, 48 + i * 10, 50, i < g.hp ? '#ff4060' : '#c8c6d3', 1);
    panel(c, 132, 26, 118, 38, '#fff8e6', { r: 5 });
    txt(c, 'PICOR', 140, 32, INK, { bold: true });
    rect(c, 140, 45, 102, 10, INK); rect(c, 141, 46, 100, 8, '#dce7ea');
    const w = rd(g.itch), col = g.itch > 66 ? '#ff4060' : g.itch > 33 ? '#ffb020' : '#5bd18b';
    rect(c, 141, 46, w, 8, col); rect(c, 141, 46, w, 2, '#ffffff');
    // the king flying over the top screen during a high jump
    if (K.st === 'jump' && K.high) {
      const k = K.t / K.dur, yy = lerp(K.y0, K.y1, k) - Math.sin(k * Math.PI) * K.h;
      const ty = yy + SH + HINGE; // same world, shifted up one screen
      if (ty > -30 && ty < SH + 30) drawS(c, fleaKing('jump'), K.x, ty, { ay: .8 });
    }
  },
  bot(g) {
    const K = g.k, m = g.mins.find(m => !m.dead && m.j >= 1);
    if (K.st === 'sit' && K.t > .05) return { x: K.x, y: K.y - 4, down: fl(g.t * 20) % 3 === 0 };
    if (m) return { x: m.x, y: m.y, down: fl(g.t * 20) % 3 === 0 };
    return { down: false };
  },
});
