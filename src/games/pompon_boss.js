// ============================================================================
//  BOSS — «Estilismo de Gala». Sculpt Pompón's show cut along the dotted
//  guides (legs → tail pompom → topknot) while Vanesa, up on the top screen,
//  lobs hairspray cans down across the hinge. Slice the cans before they land.
// ============================================================================
'use strict';

const POMPON_OX = 40, POMPON_OY = 20; // where the side-view poodle sits on the touch screen
// the finished show cut, side view, facing right (176x150)
function pomponShowPoodle(face = 'calm') {
  return mdl('pomponShow:' + face, () => {
    const F = POMPON_FUR, K = POMPON_SKIN, D = K.map(c => mixHex(c, '#7a5a8a', .25)), DF = F.map(c => mixHex(c, '#6a3a6a', .25));
    const cu = (f, s, a = 1.5) => SD.curls(f, a, .55, s), ct = s => clumpTex(3.6, .42, s, 1, 1.2);
    const legBF = SD.capsule(66, 84, 64, 128, 4.4, 3.6), legFF = SD.capsule(96, 84, 96, 128, 4.4, 3.6);
    const legBN = SD.capsule(56, 84, 53, 128, 5, 4), legFN = SD.capsule(106, 84, 107, 128, 5, 4);
    const brBF = SD.circle(64, 121, 8), brFF = SD.circle(96, 121, 8), brBN = SD.circle(53, 122, 9), brFN = SD.circle(107, 122, 9);
    const body = SD.ellipse(80, 74, 30, 16.5), mane = SD.smooth(4, SD.ellipse(106, 64, 23, 22), SD.capsule(112, 52, 121, 33, 11, 8));
    const hip = SD.circle(61, 67, 11), stalk = SD.capsule(50, 63, 35, 40, 3.4, 2.6), pomp = SD.circle(31, 31, 11);
    const face2 = SD.smooth(2, SD.ellipse(131, 30, 11.5, 10), SD.ellipse(148, 36, 11, 5.6)), ear = SD.ellipse(121, 45, 7.5, 15.5), knot = SD.circle(123, 14, 12);
    const c = model(176, 150, [
      { f: legBF, ramp: D, z: 0, th: 4 }, { f: legFF, ramp: D, z: 0, th: 4 },
      { f: cu(brBF, 1), fs: brBF, ramp: DF, z: .5, th: 6, tex: ct(1) }, { f: cu(brFF, 2), fs: brFF, ramp: DF, z: .5, th: 6, tex: ct(2) },
      { f: stalk, ramp: K, z: .6, th: 3 }, { f: cu(pomp, 3, 1.4), fs: pomp, ramp: F, z: .7, th: 9, tex: ct(3) },
      { f: body, ramp: K, z: 1, th: 12 },
      { f: cu(hip, 4), fs: hip, ramp: F, z: 1.5, th: 9, tex: ct(4) },
      { f: legBN, ramp: K, z: 2, th: 4 }, { f: legFN, ramp: K, z: 2, th: 4 },
      { f: cu(brBN, 5), fs: brBN, ramp: F, z: 2.5, th: 7, tex: ct(5) }, { f: cu(brFN, 6), fs: brFN, ramp: F, z: 2.5, th: 7, tex: ct(6) },
      { f: cu(mane, 7, 1.8), fs: mane, ramp: F, z: 3, th: 18, tex: ct(7) },
      { f: face2, ramp: K, z: 4, th: 8, amb: .4 },
      { f: cu(ear, 8), fs: ear, ramp: F, z: 4.5, th: 6, tex: ct(8) },
      { f: cu(knot, 9, 1.6), fs: knot, ramp: F, z: 4.2, th: 10, tex: ct(9) },
      { f: SD.circle(158.5, 33.5, 2.6), ramp: RAMP.black, z: 5, th: 2, gloss: true },
    ]);
    const g = c.g, E2 = '#2a0f22';
    // eye + mouth
    if (face === 'star') { drawStar(g, 137, 27, 3.6, '#fff27a'); }
    else if (face === 'ugh') { hline(g, 134, 139, 28, E2); px(g, 133, 27, E2); }
    else { rect(g, 135, 25, 4, 5, E2); rect(g, 136, 26, 2, 3, '#5a2350'); px(g, 136, 26, '#ffffff'); px(g, 139, 24, E2); px(g, 140, 23, E2); }
    if (face === 'star') { hline(g, 146, 153, 40, INK); rect(g, 148, 41, 3, 2, RAMP.pink[2]); } else hline(g, 147, 153, 40, INK);
    pomponBowAt(g, 123, 2, .9);
    return c;
  });
}
// overgrown fur layers, one per phase part (each falls away when trimmed)
function pomponExcess(part) {
  return mdl('pomponExcess:' + part, () => {
    const F = POMPON_FUR.map(c => mixHex(c, '#c9a0b8', .18));
    const shapes = {
      legsB: SD.union(SD.ellipse(54, 112, 15, 22), SD.ellipse(65, 112, 12, 21)),
      legsF: SD.union(SD.ellipse(107, 112, 15, 22), SD.ellipse(96, 112, 12, 21)),
      tailA: SD.inter(SD.circle(31, 31, 22), (x, y) => x - 31), // left half (x < 31)
      tailB: SD.inter(SD.circle(31, 31, 22), (x, y) => -(x - 31)),
      knot: SD.ellipse(124, 15, 23, 17),
    };
    const S0 = shapes[part];
    return model(176, 150, [{ f: SD.shag(S0, 3.4, .22, part.length), fs: S0, ramp: F, z: 1, th: 12, tex: clumpTex(4.4, .45, part.length * 3, 1.3, 1.2) }]);
  });
}
const POMPON_PHASES = [
  { name: 'PATAS', parts: [{ ex: 'legsB', pts: [[34, 101], [80, 101]] }, { ex: 'legsF', pts: [[84, 101], [128, 101]] }], focus: [80, 112] },
  { name: 'COLA', parts: [{ ex: 'tailA', arc: [31, 31, 17, 95, 265] }, { ex: 'tailB', arc: [31, 31, 17, 265, 395] }], focus: [31, 31] },
  { name: 'MOÑO', parts: [{ ex: 'knot', arc: [124, 15, 19, 185, 355] }], focus: [124, 15] },
];
function pomponArcPts(cx0, cy0, r, a0, a1) { const out = []; for (let i = 0; i <= 14; i++) { const a = (a0 + (a1 - a0) * i / 14) * Math.PI / 180; out.push([cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r]); } return out; }
defMG({
  id: 'gala', stage: 'pompon', boss: true, name: 'Estilismo de Gala', cmd: '¡DE GALA!', how: 'Recorta por las líneas: patas, cola y moño. ¡Y corta las latas de laca de Vanesa!', mech: 'cut', beats: 16,
  song: () => POMPON_SONGS.boss,
  init(g) {
    g.phase = 0; g.brillo = 3; g.blade = pomponBlade(); g.falling = []; g.cans = []; g.mists = [];
    g.canT = 2.2; g.canEvery = [3.3, 2.7, 2.2][g.level - 1]; g.canDur = [1.55, 1.35, 1.15][g.level - 1];
    g.vanPose = 'smug'; g.vanT = 0; g.phaseT = 0; g.cheer = 0;
    this.setupPhase(g);
  },
  setupPhase(g) {
    const P = POMPON_PHASES[g.phase];
    g.traces = P.parts.map(pt => { const pts = (pt.pts || pomponArcPts(...pt.arc)).map(([x, y]) => [x + POMPON_OX, y + POMPON_OY]); const tr = pomponTrace(pts, 24, 10); tr.ex = pt.ex; return tr; });
    g.phaseT = g.t;
  },
  target(g) { const f = POMPON_PHASES[Math.min(2, g.phase)].focus; return [f[0] + POMPON_OX, f[1] + POMPON_OY]; },
  update(g, dt) {
    g.blade.update(g, dt); pomponUpdPieces(g.falling, dt);
    g.vanT += dt; g.cheer = Math.max(0, g.cheer - dt);
    for (const m of g.mists) m.t += dt;
    if (g.state !== 'play') return;
    // tracing the guides of this phase
    for (const tr of g.traces) {
      if (tr.done) continue;
      tr.feed();
      if (tr.frac() >= .75) {
        tr.done = true; sfx('snip'); sfx('snip', { delay: .07, pitch: 1.15 }); HITSTOP = 3; g.shake(2.5, .15); buzz(14);
        const ex = pomponExcess(tr.ex), cxy = tr.samp[fl(tr.samp.length / 2)];
        g.falling.push({ img: ex, x: 88 + POMPON_OX, y: 75 + POMPON_OY, vx: (cxy[0] < 128 ? -1 : 1) * g.r(20, 60), vy: -60, rot: 0, vr: g.r(-1.2, 1.2) });
        tr.samp.forEach((p, i) => { if (i % 3 === 0) pomponHairBurst(g, p[0], p[1], 4); });
      }
    }
    if (IN.rel) for (const tr of g.traces) if (!tr.done) tr.reset();
    if (g.traces.every(t => t.done)) {
      g.fx.add({ k: 'txt', s: ['¡PATAS PERFECTAS!', '¡COLA PERFECTA!', '¡MOÑO PERFECTO!'][g.phase], x: 128, y: 30, life: 1, c: '#fff27a' });
      sfx('sparkle'); g.cheer = 1;
      g.phase++;
      if (g.phase >= POMPON_PHASES.length) { g.win(); pomponSparkle(g, 150, 60, 24); sfx('slam'); return; }
      this.setupPhase(g);
    }
    // Vanesa's hairspray
    g.canT -= dt;
    if (g.canT <= 0) {
      g.canT = g.canEvery / g.tempo * g.r(.85, 1.15);
      const [tx, ty] = this.target(g);
      g.cans.push({ sx: 214, sy: 96, ex: tx + g.r(-10, 10), ey: ty + SH + HINGE + g.r(-6, 6), k: 0, dur: g.canDur / g.tempo, rot: 0, dead: false });
      g.vanPose = 'throw'; g.vanT = 0; sfx('swoosh', { pitch: .8 });
    }
    if (g.vanPose === 'throw' && g.vanT > .35) g.vanPose = 'smug';
    for (const cn of g.cans) {
      if (cn.dead) continue;
      cn.k += dt / cn.dur; cn.rot += dt * 9;
      const [x, yt] = this.canPos(cn), yb = yt - SH - HINGE;
      if (yb > 0 && yb < SH && g.blade.hitsCircle(x, yb, 11)) {
        cn.dead = true; sfx('pop', { pitch: .8 }); sfx('fizz'); HITSTOP = 2; buzz(10);
        for (let i = 0; i < 12; i++) g.fx.add({ k: 'puff', x: x + g.r(-6, 6), y: yb + g.r(-6, 6), vx: g.r(-50, 50), vy: g.r(-50, 20), drag: 2, r: g.r(3, 6), life: g.r(.4, .7), c: g.pick([POMPON_VAN_LILAC[3], POMPON_VAN_LILAC[4], '#ffffff']) });
        g.fx.add({ k: 'txt', s: '¡Fuera laca!', x, y: yb - 14, life: .6, c: '#ffffff' });
        g.vanPose = 'angry'; g.vanT = -.4;
      } else if (cn.k >= 1) {
        cn.dead = true; g.brillo--; sfx('fizz'); sfx('bad'); g.shake(3, .25); buzz([20, 30, 20]);
        g.mists.push({ x, y: yb, t: 0 });
        for (const tr of g.traces) if (!tr.done) tr.reset();
        g.fx.add({ k: 'txt', s: '¡PSSSH!', x, y: yb - 18, life: .8, c: POMPON_VAN_LILAC[4] });
        if (g.brillo <= 0) { g.lose(); return; }
      }
    }
  },
  canPos(cn) { const k = Math.min(1, cn.k); return [lerp(cn.sx, cn.ex, k), lerp(cn.sy, cn.ey, k) - Math.sin(k * Math.PI) * 70]; },
  draw(g, c) {
    c.drawImage(pomponCurtainBg(), 0, 0);
    // pedestal
    ellipsePx(c, 128, 158, 70, 12, INK); ellipsePx(c, 128, 156, 69, 11, RAMP.gold[2]); ellipsePx(c, 126, 154, 60, 8, RAMP.gold[3]); rect(c, 60, 158, 136, 20, INK); rect(c, 61, 158, 134, 18, RAMP.gold[1]);
    const face = g.state === 'won' ? 'star' : g.mists.some(m => m.t < .8) ? 'ugh' : 'calm';
    const bounce = g.state === 'won' ? Math.abs(Math.sin(g.t * 6)) * 4 : 0;
    c.drawImage(pomponShowPoodle(face), POMPON_OX, rd(POMPON_OY - bounce));
    // remaining overgrowth for this phase and the ones after it
    for (let p = g.phase; p < POMPON_PHASES.length; p++) for (const pt of POMPON_PHASES[p].parts) {
      const tr = p === g.phase && g.traces ? g.traces.find(t => t.ex === pt.ex) : null;
      if (tr && tr.done) continue;
      c.drawImage(pomponExcess(pt.ex), POMPON_OX, POMPON_OY);
    }
    pomponDrawPieces(c, g.falling);
    // hairspray mist
    for (const m of g.mists) if (m.t < 1.2) { c.globalAlpha = .7 * (1 - m.t / 1.2); for (let i = 0; i < 7; i++) disc(c, m.x + Math.cos(i * 1.7) * 10 * (1 + m.t), m.y + Math.sin(i * 1.3) * 8 * (1 + m.t), 7 + m.t * 6, i % 2 ? POMPON_VAN_LILAC[3] : POMPON_VAN_LILAC[4]); c.globalAlpha = 1; }
    if (g.state === 'play' && g.traces) for (const tr of g.traces) { pomponGuide(c, tr.pts, g.t, tr.done); if (!tr.done) tr.samp.forEach((p, i) => { if (tr.cov[i]) { disc(c, p[0], p[1], 2, INK); disc(c, p[0], p[1], 1.3, '#5bd18b'); } }); }
    // cans coming down from the top screen
    for (const cn of g.cans) { if (cn.dead) continue; const [x, yt] = this.canPos(cn), yb = yt - SH - HINGE; if (yb > -12 && yb < SH + 12) { pomponSprayCan(c, x, yb, cn.rot); if (cn.k > .75 && fl(g.t * 12) % 2) ringPx(c, x, yb, 13, '#ff4060'); } }
    // phase tag
    const P = POMPON_PHASES[Math.min(2, g.phase)];
    panel(c, 4, 4, 86, 14, '#ffffff', { r: 4 }); txt(c, 'FASE ' + Math.min(3, g.phase + 1) + '/3: ' + P.name, 47, 8, INK, { align: 'c' });
    if (g.state === 'won') { const k = spring(g.t - g.decidedAt, 2.4, 6); c.save(); c.translate(SW / 2, 36); c.scale(k, k); mord(c, '¡DE GALA!', 0, -9, { u: 1.6, r: 1.8, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] }); c.restore(); }
    g.blade.draw(c, g.t);
  },
  top(g, c) {
    const t = g.t;
    c.drawImage(pomponArenaBg(), 0, 0);
    pomponBeams(c, t, 4, .08, ['#c49aff', '#ff82b4']);
    pomponCrowd(c, 158, t * 2.1, t, g.cheer);
    // Vanesa up on the gantry, lobbing cans
    const pose = g.state === 'won' ? 'angry' : g.vanPose;
    pomponDrawVanesa(c, 218, 150, pose, { flip: true });
    if (g.state === 'play' && g.vanPose === 'smug' && fl(t * .6) % 3 === 0) txt(c, '¡Un poquito de laca!', 180, 42, POMPON_VAN_LILAC[4], { align: 'c', out: INK });
    for (const cn of g.cans) { if (cn.dead) continue; const [x, yt] = this.canPos(cn); if (yt < SH + 12) pomponSprayCan(c, x, yt, cn.rot); }
    // HUD
    panel(c, 6, 40, 104, 70, '#fff8e6', { r: 6 });
    txt(c, 'ESTILISMO', 58, 45, INK, { align: 'c', bold: true }); txt(c, 'DE GALA', 58, 55, '#e05b98', { align: 'c', bold: true });
    POMPON_PHASES.forEach((P, i) => { const done = i < g.phase, cur = i === g.phase; const y = 68 + i * 12; rect(c, 14, y, 9, 9, INK); rect(c, 15, y + 1, 7, 7, done ? '#5bd18b' : cur ? '#fff27a' : '#dce7ea'); if (done) txt(c, '✓', 19, y + 1, INK, { align: 'c' }); txt(c, P.name, 28, y + 1, cur ? INK : '#6b6977', { bold: cur }); });
    panel(c, 6, 114, 104, 22, '#fff8e6', { r: 6 }); txt(c, 'BRILLO', 14, 121, INK, { bold: true });
    for (let i = 0; i < 3; i++) drawStar(c, 66 + i * 14, 125, 5, i < g.brillo ? '#ffd23f' : '#c8c6d3');
  },
  bot(g) {
    // a can in reach on the touch screen? slice it
    const cn = g.cans.find(cn => { if (cn.dead) return false; const [, yt] = this.canPos(cn), yb = yt - SH - HINGE; return yb > 20 && yb < 176; });
    const B = g._b || (g._b = { tr: -1, k: 0, cph: 0 });
    if (cn) {
      const [x, yt] = this.canPos(cn), yb = yt - SH - HINGE; B.tr = -1; B.cph = (B.cph + 1) % 6;
      if (B.cph < 2) return { x: x - 14, y: yb - 14, down: false };
      const q = (B.cph - 2) / 3; return { x: x - 14 + q * 28, y: yb - 14 + q * 28, down: true };
    }
    if (!g.traces) return { down: false };
    const ti = g.traces.findIndex(t => !t.done); if (ti < 0) return { down: false };
    const tr = g.traces[ti];
    if (B.tr !== ti || B.ph !== g.phase) { B.tr = ti; B.ph = g.phase; B.k = -3; }
    B.k++;
    const P = pomponSample(tr.pts, 36);
    if (B.k < 0) return { x: P[0][0], y: P[0][1], down: false };
    if (B.k >= P.length + 1) { B.tr = -1; return { x: P[P.length - 1][0], y: P[P.length - 1][1], down: false }; }
    const p = P[Math.min(P.length - 1, B.k)]; return { x: p[0], y: p[1], down: true };
  },
});
