// ============================================================================
//  BOSS — La Gran Maraña. Five knots in Rizos' afro: rub each loose while
//  Pulgui hops around re-tangling them (touch him to knock him off). With every
//  knot undone Pulgui has nowhere to hide: brush him out of the afro.
// ============================================================================
'use strict';
const RIZOS_KNOTS = [[52, 52], [128, 38], [204, 54], [82, 112], [174, 110]];
function rizosAfroWall() {
  return mdl('rizosAfroWall', () => {
    const F = RIZOS_FUR, big = SD.circle(128, 176, 210);
    return model(SW, SH, [{ f: big, ramp: F, z: 0, th: 90, tex: clumpTex(5.2, .44, 31, 1, 1.2), dith: .55, amb: .3 }], { outline: false, post: g => {
      // depth: darker towards the top corners (the afro curves away from us)
      for (let y = 0; y < 40; y++) for (let x = 0; x < SW; x++) { const k = (1 - y / 40) * Math.min(1, Math.abs(x - 128) / 128); if (bayer(x, y) < k * .45) { g.fillStyle = F[1]; g.fillRect(x, y, 1, 1); } }
      for (let i = 0; i < 26; i++) { const x = hash2(i, 31) * SW, y = hash2(32, i) * SH, r = 4 + hash2(i, 33) * 3; for (let a = 3.2; a < 6.4; a += .25) px(g, x + Math.cos(a) * r, y + Math.sin(a) * r, F[1]); }
      // a sprinkle of bright little C-curls on the lit side of the clumps
      for (let i = 0; i < 180; i++) {
        const x = hash2(i, 11) * SW, y = hash2(12, i) * SH, r = 1.6 + hash2(i, 13) * 1.6, a0 = Math.PI * .9 + hash2(i, 14) * .6;
        for (let a = a0; a < a0 + 2.4; a += .45) px(g, x + Math.cos(a) * r, y + Math.sin(a) * r, F[4]);
      }
    } });
  });
}
function rizosFaceCrop(ex) { return mdl('rizosFaceCrop:' + ex, () => faceCrop(rizosHead(ex), 16, 30, 52, 44)); }
function rizosDrawKnot(g, x, y, k, t, seed, hot, sq = 0) {
  // k: 0 (loose) .. 1 (tight): a lumpy snarl of dark hair with a frizzy halo.
  // sq squashes it wide (+) or tall (−) while it's being rubbed.
  const r = 10 + k * 7, wob = Math.sin(t * 9 + seed) * (hot ? 1.5 : .6);
  const sqx = 1 + sq, sqy = 1 - sq, S = ([a, b]) => [x + (a - x) * sqx, y + (b - y) * sqy];
  // frizz halo sticking out all round
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + hash2(i, seed) * .4, l = r + 4 + hash2(seed, i) * 6; const [x0, y0] = S([x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)]), [x1, y1] = S([x + Math.cos(a + .25 + wob * .05) * l, y + Math.sin(a + .25) * l]); linePx(g, x0, y0, x1, y1, i % 3 ? '#f0b573' : '#3e2016'); }
  // lumpy body
  const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, rr = r * (.78 + hash2(i, seed + 2) * .34) + Math.sin(t * 7 + i) * (hot ? 1 : 0); pts.push(S([x + Math.cos(a) * rr, y + Math.sin(a) * rr * .88])); }
  polyPx(g, pts.map(([a, b]) => [a + 1, b + 2]), '#3e1a0c');
  polyPx(g, pts, INK); polyPx(g, pts.map(([a, b]) => [lerp(a, x, .1), lerp(b, y, .1)]), mixHex('#4a2210', '#9c5a30', 1 - k));
  polyPx(g, pts.map(([a, b]) => [lerp(a, x - r * .3, .5), lerp(b, y - r * .3, .5)]), mixHex('#6e3520', '#d4874c', 1 - k));
  // tangled loops inside
  const n = 6 + fl(k * 10);
  for (let i = 0; i < n; i++) {
    const a0 = hash2(i, seed) * TAU, rr = r * (.25 + hash2(seed, i) * .55), ox = (hash2(i, seed + 3) - .5) * r * .9, oy = (hash2(i, seed + 5) - .5) * r * .8;
    let lx = null, ly = null;
    for (let a = a0; a < a0 + 4.8; a += .34) { const [px0, py0] = S([x + ox + Math.cos(a + wob * .1) * rr, y + oy + Math.sin(a) * rr * .8]); if (lx != null) linePx(g, lx, ly, px0, py0, i % 3 === 0 ? '#1e0c05' : i % 3 === 1 ? '#f0b573' : '#8a4a24'); lx = px0; ly = py0; }
  }
}
defMG({
  id: 'marana', stage: 'rizos', boss: true, name: 'La Gran Maraña', cmd: '¡DESENREDA!', how: 'Frota los nudos del afro hasta soltarlos, toca a Pulgui y, al final, cepíllalo fuera', mech: 'rub', beats: 16,
  song: () => RIZOS_SONGS.boss,
  init(g) {
    const hp = [100, 106, 112][g.level - 1];
    g.knots = RIZOS_KNOTS.map(([x, y], i) => ({ x, y, hp, max: hp, done: false, seed: i * 13 + 5, shake: 0, doneT: -1 }));
    g.rub = rubTracker(); g.itch = 0; g.phase = 1; g.face = 'cool';
    g.pul = { x: 128, y: -20, st: 'jump', t: 0, x0: 128, y0: -40, x1: RIZOS_KNOTS[1][0], y1: RIZOS_KNOTS[1][1] - 6, dur: .7, sit: 1.2, hp: 3, inv: 0, target: 1, taunt: 0 };
    g.itchRate = [2.6, 2.8, 3][g.level - 1]; g.hopMul = [1, 1.1, 1.2][g.level - 1];
    g.flyT = -1; g.introT = 0;
  },
  jumpPul(g, to) {
    const P = g.pul, alive = g.knots.filter(k => !k.done);
    let tgt = to;
    if (tgt == null) tgt = g.phase === 2 ? -1 : (alive.length && g.r() < .72 ? g.knots.indexOf(g.pick(alive)) : fl(g.r(5)));
    const [x1, y1] = tgt >= 0 ? [g.knots[tgt].x, g.knots[tgt].y - 6] : [g.r(30, 226), g.r(24, 140)];
    Object.assign(P, { st: 'jump', t: 0, x0: P.x, y0: P.y, x1, y1, dur: g.phase === 2 ? .32 : .5 / g.hopMul, target: tgt });
    sfx('boing', { pitch: 2.2, vol: .3 });
  },
  update(g, dt) {
    const P = g.pul;
    P.inv = Math.max(0, P.inv - dt); P.taunt = Math.max(0, P.taunt - dt);
    for (const k of g.knots) k.shake = Math.max(0, k.shake - dt * 4);
    if (g.state === 'won') { if (g.flyT >= 0) { P.x += 120 * dt; P.y -= 320 * dt; P.rot = (P.rot || 0) + dt * 18; } return; }
    if (g.state === 'lost') return;
    // --- Pulgui
    P.t += dt;
    if (P.st === 'jump') {
      const k = Math.min(1, P.t / P.dur);
      P.x = lerp(P.x0, P.x1, k); P.y = lerp(P.y0, P.y1, k) - Math.sin(k * Math.PI) * 26;
      if (k >= 1) {
        P.st = 'sit'; P.t = 0; P.sit = g.phase === 2 ? g.r(.25, .45) : g.r(.9, 1.3) / g.hopMul;
        const kn = P.target >= 0 ? g.knots[P.target] : null;
        if (kn && kn.done && g.phase === 1 && g.r() < .55) { kn.done = false; kn.hp = kn.max * .45; kn.shake = 1; g.fx.add({ k: 'txt', s: '¡TOMA NUDO!', x: kn.x, y: kn.y - 22, life: .8, c: '#ff93bf' }); sfx('squish', { pitch: .8 }); }
        if (g.r() < .4) P.taunt = .8;
      }
    } else if (P.st === 'sit') {
      const kn = P.target >= 0 ? g.knots[P.target] : null;
      if (kn && !kn.done && g.phase === 1) { kn.hp = Math.min(kn.max, kn.hp + 18 * dt * g.hopMul); g.itch += 3.5 * dt; kn.shake = Math.max(kn.shake, .4); }
      if (P.t > P.sit) this.jumpPul(g);
    } else if (P.st === 'stun') {
      if (P.t > 1.2) this.jumpPul(g);
    } else if (P.st === 'hit') {
      P.x += P.vx * dt; P.y += P.vy * dt; P.vy += 400 * dt;
      if (P.t > .35) { P.st = g.phase === 2 ? 'sit' : 'stun'; P.t = 0; P.sit = .3; P.x = clamp(P.x, 20, 236); P.y = clamp(P.y, 20, 150); }
    }
    // --- rubbing
    const nearKnot = g.knots.find(k => !k.done && dist(IN.x, IN.y, k.x, k.y) < 22);
    const nearPul = IN.down && dist(IN.x, IN.y, P.x, P.y) < 18 && (P.st === 'sit' || P.st === 'stun' || (g.phase === 2 && P.st === 'jump'));
    const gain = g.rub.update(dt, !!nearKnot || nearPul);
    // knock Pulgui off (phase 1: a touch stuns him; phase 2: every brush is a hit)
    if (nearPul && P.inv <= 0 && (IN.tap || gain > 2)) {
      if (g.phase === 1) {
        if (P.st !== 'stun') { P.st = 'hit'; P.t = 0; P.vx = g.r(-80, 80); P.vy = -160; P.inv = .5; sfx('squish', { pitch: 1.5 }); sfx('yip', { pitch: 2.4, vol: .5 }); HITSTOP = 3; g.fx.add({ k: 'txt', s: '¡AY!', x: P.x, y: P.y - 14, life: .5, c: '#ffffff' }); g.fx.burst(P.x, P.y, 8, { k: 'star', c: [C.yellow, '#fff'] }); }
      } else {
        P.hp--; P.inv = .45; P.st = 'hit'; P.t = 0; P.vx = (P.x < 128 ? 1 : -1) * g.r(60, 120); P.vy = -180; HITSTOP = 5; g.shake(3, .2); buzz(20);
        sfx('squish', { pitch: 1.3 }); sfx('stamp'); g.fx.burst(P.x, P.y, 12, { k: 'star', c: [C.yellow, '#fff', RIZOS_NEON.pink], sp0: 60, sp1: 150 });
        g.fx.add({ k: 'txt', s: ['¡UY!', '¡OUCH!', '¡NOOO!'][clamp(2 - P.hp, 0, 2)], x: P.x, y: P.y - 16, life: .6, c: '#ffffff' });
        if (P.hp <= 0) { g.win(); g.flyT = g.t; g.face = 'love'; sfx('whoosh'); sfx('bark', { n: 2, pitch: 1.1 }); for (let i = 0; i < 24; i++) g.fx.add({ k: 'conf', x: g.r(SW), y: g.r(-10, 60), vx: g.r(-30, 30), vy: g.r(20, 90), g: 60, life: 1.8, c: pick(['#ff4fa3', '#4ff2ff', '#fff04f', '#ffffff']), rot: g.r(TAU), vr: g.r(-8, 8) }); }
      }
    }
    if (nearKnot && gain > 0 && g.phase === 1) {
      const kn = nearKnot; kn.hp -= gain * [.14, .14, .135][g.level - 1]; kn.shake = 1;
      g.itch = Math.max(0, g.itch - gain * .004);
      if (fl(g.t * 30) % 3 === 0) g.fx.add({ k: 'hair', x: kn.x + g.r(-8, 8), y: kn.y + g.r(-8, 8), vx: g.r(-90, 90), vy: g.r(-120, -30), g: 260, life: .5, r: 2, c: pick([RIZOS_FUR[1], RIZOS_FUR[2], '#3e2016']), rot: g.r(TAU) });
      if (kn.hp <= 0) {
        kn.done = true; kn.doneT = g.t; kn.hp = 0; HITSTOP = 4; g.shake(2, .15); buzz(12);
        sfx('boingy', { pitch: 1 + g.knots.filter(k => k.done).length * .08 });
        g.fx.burst(kn.x, kn.y, 18, { k: 'hair', c: [RIZOS_FUR[3], RIZOS_FUR[4], RIZOS_FUR[2]], sp0: 60, sp1: 170, r: 3, life0: .4, life1: .8 });
        g.fx.burst(kn.x, kn.y, 8, { k: 'star', c: [C.yellow, '#fff'] });
        g.fx.add({ k: 'txt', s: '¡BOING!', x: kn.x, y: kn.y - 20, life: .6, c: '#fff04f' });
        if (P.target === g.knots.indexOf(kn) && P.st === 'sit') this.jumpPul(g);
      }
    }
    // --- phase change: nowhere left to hide
    if (g.phase === 1 && g.knots.every(k => k.done)) {
      g.phase = 2; g.face = 'grin'; sfx('slam'); flash('bot', '#ffffff', .12); g.shake(3, .25);
      g.fx.add({ k: 'txt', s: '¡A POR PULGUI!', x: 128, y: 80, life: 1.2, c: '#ffffff' });
      this.jumpPul(g, -1);
    }
    // --- the itch
    if (g.phase === 1) g.itch += g.knots.filter(k => !k.done).length * g.itchRate * dt;
    else g.itch = Math.max(0, g.itch - 8 * dt);
    g.itch = Math.max(0, g.itch - 1.5 * dt);
    g.face = g.phase === 2 ? 'grin' : g.itch > 70 ? 'itch' : g.itch > 40 ? 'shock' : 'cool';
    if (g.itch >= 100) { g.lose(); g.face = 'itch'; sfx('whine'); g.shake(5, .6); g.fx.add({ k: 'txt', s: '¡QUÉ PICOR!', x: 128, y: 150, life: 1.2, c: '#ffffff' }); }
  },
  draw(g, c) {
    c.drawImage(rizosAfroWall(), 0, 0);
    // his face peeking at the bottom: we're on top of his head
    const scratch = g.state === 'lost' ? Math.sin(g.t * 50) * 3 : 0;
    drawS(c, rizosFaceCrop(g.state === 'won' ? 'love' : g.face), 128 + scratch, 192, { ax: .5, ay: 1 });
    for (const k of g.knots) {
      if (k.done) {
        // a neat springy curl where the knot was
        const dt0 = g.t - k.doneT, s = dt0 < .4 ? spring(dt0, 3, 6) : 1;
        for (let a = 0; a < TAU * 1.6; a += .3) { const r = 2 + a * 1.4 * s; px(c, k.x + Math.cos(a) * r, k.y + Math.sin(a) * r * .8, a % 1.2 < .6 ? RIZOS_FUR[4] : RIZOS_FUR[3]); }
        if (dt0 < .8) drawStar(c, k.x + 8, k.y - 8, 3 * (1 - dt0 / .8) + .5, '#ffffff', dt0 * 8);
        continue;
      }
      const kk = clamp(k.hp / k.max, 0, 1), sh = k.shake ? Math.sin(g.t * 60) * k.shake * 1.5 : 0, sq = k.shake > .5 ? Math.sin(g.t * 34) * .12 * k.shake : 0;
      // life ring: a bold arc on a dark track, so you can read how loose it is
      for (let a = 0; a < TAU; a += .1) px(c, k.x + Math.cos(a) * 20, k.y + Math.sin(a) * 20, 'rgba(29,20,36,.35)');
      for (let a = 0; a < kk * TAU; a += .07) { const ca = Math.cos(a - Math.PI / 2), sa = Math.sin(a - Math.PI / 2), col = kk > .5 ? '#ff4060' : kk > .25 ? '#ffb020' : '#5bd18b'; px(c, k.x + ca * 20, k.y + sa * 20, col); px(c, k.x + ca * 21, k.y + sa * 21, col); }
      rizosDrawKnot(c, k.x + sh, k.y, kk, g.t, k.seed, k.shake > .5, sq);
      if (kk < .25 && fl(g.t * 10) % 2) drawStar(c, k.x + 12, k.y - 12, 2.5, '#fff27a', g.t * 5); // nearly loose!
    }
    // Pulgui
    const P = g.pul;
    if (P.y > -20 && !(g.state === 'won' && P.y < -20)) {
      const fr = P.st === 'jump' || P.st === 'hit' ? 'jump' : P.st === 'stun' ? 'hit' : 'sit';
      const blink = P.inv > 0 && fl(P.inv * 20) % 2;
      if (P.st === 'jump' && P.t / P.dur < .95) shadowOval(c, P.x1, P.y1 + 6, 4, 1.5, .6);
      if (!blink) drawS(c, rizosPulguiSpr(fr), P.x, P.y, { s: 2, rot: P.rot || 0, flip: P.x1 != null && P.x1 < P.x0 });
      if (P.st === 'stun') for (let i = 0; i < 3; i++) { const a = g.t * 6 + i * TAU / 3; drawStar(c, P.x + Math.cos(a) * 9, P.y - 12 + Math.sin(a) * 3, 2, '#fff04f'); }
      if (P.taunt > 0 && g.state === 'play') shout(c, g.phase === 2 ? '¡SOCORRO!' : '¡JI, JI!', clamp(P.x + 22, 40, 216), clamp(P.y - 22, 20, 170), .8 - P.taunt);
      if (P.st === 'sit' && g.phase === 1 && P.target >= 0 && !g.knots[P.target].done) txt(c, '~', P.x + 8, P.y - 10 + Math.sin(g.t * 20) * 2, '#ff93bf', { out: INK });
    }
    if (g.phase === 2 && g.state === 'play') for (let i = 0; i < 3; i++) drawHeart(c, P.x - 8 + i * 8, P.y - 20, i < P.hp ? '#ff4060' : '#5a2a9a', .7);
    if (g.state === 'won' && g.t - g.flyT < 1.6) shout(c, '¡VOLVERÉEE!', clamp(g.pul.x, 50, 206), clamp(g.pul.y - 20, 70, 150), g.t - g.flyT);
    if (g.state === 'won') rizosStamp(c, g, '¡AFRO LIBRE!', 128, 26, .25);
  },
  top(g, c) {
    // HUD: the five knots and the itch meter
    panel(c, 6, 26, 124, 40, '#fff8e6', { r: 5 });
    txt(c, 'LA GRAN MARAÑA', 68, 31, INK, { align: 'c', bold: true });
    g.knots.forEach((k, i) => {
      const x = 22 + i * 23, y = 52;
      if (k.done) { for (let a = 0; a < TAU * 1.4; a += .4) { const r = 1 + a * 1.1; px(c, x + Math.cos(a) * r, y + Math.sin(a) * r, RIZOS_FUR[2]); } }
      else { disc(c, x, y, 7, INK); disc(c, x, y, 6, '#6e3520'); for (let q = 0; q < 4; q++) ringPx(c, x + (q % 2) * 2 - 1, y + fl(q / 2) * 2 - 1, 2.5, '#3e2016'); }
    });
    panel(c, 136, 26, 114, 40, '#fff8e6', { r: 5 });
    c.save(); c.beginPath(); c.rect(138, 28, 42, 36); c.clip(); drawS(c, rizosFaceCrop(g.face), 159, 70, { ax: .5, ay: 1 }); c.restore();
    txt(c, 'PICOR', 186, 31, INK, { bold: true });
    rect(c, 186, 44, 58, 10, INK); rect(c, 187, 45, 56, 8, '#dce7ea');
    const w = rd(clamp(g.itch, 0, 100) / 100 * 56), col = g.itch > 70 ? '#ff4060' : g.itch > 40 ? '#ffb020' : '#5bd18b';
    rect(c, 187, 45, w, 8, col); rect(c, 187, 45, w, 2, '#ffffff');
    if (g.phase === 2 && g.state === 'play') { const k = .9 + Math.sin(g.t * 8) * .1; mord(c, '¡A POR PULGUI!', SW / 2, 120, { u: 1.3, r: 1.4, rim: 1, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] }, { anim: i => ({ s: k, dy: Math.sin(g.t * 9 + i * .6) * 1.5 }) }); }
    // Pulgui's escape across the top screen
    if (g.state === 'won' && g.flyT >= 0) { const ty = g.pul.y + SH + HINGE; if (ty > -20 && ty < SH + 20) drawS(c, rizosPulguiSpr('jump'), g.pul.x, ty, { s: 2, rot: g.pul.rot || 0 }); }
  },
  bot(g) {
    // a human-ish player: the hand travels at a limited speed and rubs ~600px/s
    const P = g.pul, down = g.t > .3 && g.state === 'play', w = Math.sin(g.t * 44) * 7, v = Math.cos(g.t * 37) * 4;
    let tx, ty;
    if (g.phase === 2 || ((P.st === 'sit') && P.target >= 0 && !g.knots[P.target].done && P.t > .25)) { tx = P.x; ty = P.y; }
    else { const alive = g.knots.filter(k => !k.done); const k = alive.length ? alive.reduce((a, b) => (a.hp < b.hp ? a : b)) : P; tx = k.x; ty = k.y; }
    if (g.bx == null) { g.bx = 128; g.by = 150; }
    const d = dist(g.bx, g.by, tx, ty), step = 380 * STEP;
    if (d > step) { g.bx += (tx - g.bx) / d * step; g.by += (ty - g.by) / d * step; } else { g.bx = tx; g.by = ty; }
    return { x: g.bx + w, y: g.by + v, down };
  },
});
