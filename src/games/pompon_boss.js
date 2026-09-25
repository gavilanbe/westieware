// ============================================================================
//  BOSS — «Estilismo de Gala». Sculpt Pompón's show cut along the dotted
//  guides (legs → tail pompom → topknot) while Vanesa, up on the top screen,
//  lobs hairspray cans down across the hinge. Slice the cans before they land.
// ============================================================================
'use strict';

const POMPON_OX = 40, POMPON_OY = 20, POMPON_PAD = 20; // where the side-view poodle sits on the touch screen (canvases carry a top margin)
// the finished show cut, side view, facing right (176x150), in the puff style
// of the microgames: shaved skin + clean pompoms (legs, hips, tail, mane, topknot)
function pomponShowPoodle(face = 'calm') {
  return mdl('pomponShow2:' + face, () => {
    const c = mkCanvas(176, 150 + POMPON_PAD), g = c.g; g.translate(0, POMPON_PAD);
    const F = POMPON_FUR, K = POMPON_SKIN, DF = F.map(v => mixHex(v, '#6a3a6a', .28)), DK = K.map(v => mixHex(v, '#7a5a8a', .28));
    const leg = (x0, y0, x1, y1, r0, r1, R) => { thickLine(g, x0, y0, x1, y1, r0 + 1.4, INK); for (let i = 0; i <= 12; i++) { const q = i / 12, x = lerp(x0, x1, q), y = lerp(y0, y1, q), r = lerp(r0, r1, q); disc(g, x, y, r, R[2]); disc(g, x - r * .3, y, r * .6, R[3]); } };
    const cuff = (x, y, r, R) => pomponPuffs(g, [[x - r * .45, y - r * .35, r * .55], [x + r * .45, y - r * .35, r * .55], [x - r * .5, y + r * .3, r * .55, 1], [x + r * .45, y + r * .3, r * .55, 1], [x, y, r * .62]], R);
    // far legs (a shade darker)
    leg(66, 84, 64, 128, 4.4, 3.6, DK); leg(96, 84, 96, 128, 4.4, 3.6, DK);
    cuff(64, 121, 8, DF); cuff(96, 121, 8, DF);
    // tail: shaved stalk + pompom
    leg(50, 63, 35, 40, 3.4, 2.6, K);
    pomponPuffs(g, [0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * TAU - 1.2; return [31 + Math.cos(a) * 6, 31 + Math.sin(a) * 6, 6.5, Math.cos(a - .8) > .5]; }).concat([[30, 30, 6.5]]), F);
    // body (shaved)
    ellipsePx(g, 80, 74, 31.6, 18.1, INK); ellipsePx(g, 80, 74, 30, 16.5, K[2]); ellipsePx(g, 78, 71, 27, 13, K[3]); ellipsePx(g, 72, 64, 12, 3.5, K[4]);
    // hip rosette
    pomponPuffs(g, [[56, 62, 6.5], [66, 61, 6.5], [54, 72, 6.5, 1], [66, 73, 6.5, 1], [61, 67, 7.5]], F);
    // near legs
    leg(56, 84, 53, 128, 5, 4, K); leg(106, 84, 107, 128, 5, 4, K);
    cuff(53, 122, 9, F); cuff(107, 122, 9, F);
    // the mane: chest and neck
    pomponPuffs(g, [[90, 60, 10], [92, 76, 10, 1], [104, 82, 10, 1], [118, 78, 10, 1], [126, 64, 9], [118, 48, 9], [113, 36, 8.5], [121, 31, 8], [103, 50, 11], [106, 67, 12]], F);
    // face (shaved) with a long snout
    ellipsePx(g, 131, 30, 13, 11.5, INK); ellipsePx(g, 148, 36, 12.6, 7.2, INK);
    ellipsePx(g, 131, 30, 11.5, 10, K[2]); ellipsePx(g, 148, 36, 11, 5.6, K[2]); ellipsePx(g, 130, 28, 9.5, 7.5, K[3]); ellipsePx(g, 148, 34, 9.5, 3.6, K[3]); ellipsePx(g, 127, 24, 4, 2, K[4]);
    // ear and topknot
    pomponPuffs(g, [[121, 34, 6.5], [119, 43, 7.5], [121, 52, 7.5, 1], [118, 59, 6, 1]], F);
    pomponPuffs(g, [[114, 11, 7], [132, 11, 7], [112, 20, 6.5, 1], [134, 20, 6.5, 1], [123, 6, 7.5], [123, 16, 9]], F);
    const E2 = '#2a0f22';
    disc(g, 158.5, 33.5, 3.4, INK); disc(g, 158.5, 33.5, 2.4, '#2a0f22'); px(g, 157, 32, '#6f5a78');
    if (face === 'star') { drawStar(g, 137, 27, 4.2, INK); drawStar(g, 137, 27, 3.4, '#fff27a'); }
    else if (face === 'ugh') { thickLine(g, 133, 28, 140, 28, .6, E2); px(g, 133, 27, E2); rect(g, 142, 22, 1, 3, '#9bd6f7'); }
    else { rect(g, 135, 24, 5, 6, E2); rect(g, 136, 25, 3, 4, '#5a2350'); px(g, 136, 25, '#ffffff'); px(g, 137, 25, '#ffffff'); px(g, 140, 23, E2); px(g, 141, 22, E2); }
    ellipsePx(g, 142, 34, 3, 1.5, '#ff93bf');
    if (face === 'star') { hline(g, 146, 153, 40, INK); rect(g, 148, 41, 3, 2, RAMP.pink[2]); } else if (face === 'ugh') { hline(g, 147, 151, 41, INK); px(g, 146, 42, INK); px(g, 152, 42, INK); } else hline(g, 147, 153, 40, INK);
    pomponBowAt(g, 123, 2, .9);
    return c;
  });
}
// overgrown fur, one layer per phase part (each falls away when trimmed): a
// dusty, unkempt tint with stray strands, so the extra reads as "extra"
const POMPON_MESSY = POMPON_FUR.map(v => mixHex(v, '#b6a2c8', .38));
function pomponExcess(part) {
  return mdl('pomponExcess2:' + part, () => {
    const c = mkCanvas(176, 150 + POMPON_PAD), g = c.g; g.translate(0, POMPON_PAD);
    const legs = x => [[x - 6, 96, 8], [x + 6, 95, 8], [x - 9, 106, 9], [x + 9, 106, 9], [x - 8, 118, 9, 1], [x + 8, 118, 9, 1], [x - 3, 128, 8, 1], [x + 6, 128, 8, 1], [x, 110, 10]];
    const ring = (cx0, cy0, rr, r, a0, a1, n) => { const P = []; for (let i = 0; i < n; i++) { const a = (a0 + (a1 - a0) * (i + .5) / n) * Math.PI / 180; P.push([cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr, r, Math.sin(a) > .3]); } return P; };
    const P = {
      legsB: legs(59), legsF: legs(102),
      tailA: ring(31, 31, 15, 7.5, 95, 265, 5), tailB: ring(31, 31, 15, 7.5, 265, 435, 5),
      knot: ring(123, 15, 16, 8, 180, 360, 6),
    }[part];
    // stray strands first, so the puffs cover their roots
    P.forEach(([x, y, r], i) => { const a = hash2(i, part.length) * TAU, l = r + 5; thickLine(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 1.4, INK); linePx(g, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, POMPON_MESSY[2]); });
    pomponPuffs(g, P, POMPON_MESSY);
    // a few frizz squiggles on top
    P.forEach(([x, y, r], i) => { if (i % 2) return; for (let q = 0; q < 5; q++) px(g, x - r * .3 + q, y + Math.sin(q * 1.6 + i) * 1.5, POMPON_MESSY[1]); });
    return c;
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
        g.falling.push({ img: ex, x: 88 + POMPON_OX, y: ex.height / 2 + POMPON_OY - POMPON_PAD, vx: (cxy[0] < 128 ? -1 : 1) * g.r(20, 60), vy: -60, rot: 0, vr: g.r(-1.2, 1.2) });
        tr.samp.forEach((p, i) => { if (i % 3 === 0) pomponHairBurst(g, p[0], p[1], 4); });
      }
    }
    if (IN.rel) for (const tr of g.traces) if (!tr.done) tr.reset();
    if (g.traces.every(t => t.done)) {
      if (g.phase < POMPON_PHASES.length - 1) g.fx.add({ k: 'txt', s: ['¡PATAS PERFECTAS!', '¡COLA PERFECTA!'][g.phase], x: 128, y: 30, life: .8, c: '#fff27a' });
      sfx('sparkle'); g.cheer = 1; g.phaseDoneT = g.t;
      g.phase++;
      if (g.phase >= POMPON_PHASES.length) {
        g.win(); g.fx.p = g.fx.p.filter(p => p.k !== 'txt'); // the stamp gets the stage to itself
        pomponSparkle(g, 150, 60, 24); sfx('slam'); sfx('shutter'); sfx('shutter', { delay: .18, pitch: 1.1 }); sfx('shutter', { delay: .41, pitch: .95 });
        // the whole Palau goes wild: confetti and hearts rain on the winner
        for (let i = 0; i < 34; i++) g.fx.add({ k: 'conf', x: g.r(SW), y: g.r(-20, 30), vx: g.r(-30, 30), vy: g.r(30, 110), g: 60, life: 2.2, c: pick(['#ff5d9e', '#fff27a', '#ffffff', '#c49aff', '#8fd6b5']), rot: g.r(TAU), vr: g.r(-8, 8) });
        for (let i = 0; i < 8; i++) g.fx.add({ k: 'heart', x: 150 + g.r(-50, 50), y: 150, vy: -g.r(30, 70), life: 1.2, c: '#ff5d9e' });
        return;
      }
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
    // dim the house, one warm spotlight on the model: pink fur pops off the pink velvet
    c.globalAlpha = .5; rect(c, 0, 0, SW, SH, '#240a30'); c.globalAlpha = .16; polyPx(c, [[104, 0], [152, 0], [214, 170], [42, 170]], '#fff2d8'); c.globalAlpha = 1;
    // pedestal
    ellipsePx(c, 128, 158, 70, 12, INK); ellipsePx(c, 128, 156, 69, 11, RAMP.gold[2]); ellipsePx(c, 126, 154, 60, 8, RAMP.gold[3]); rect(c, 60, 158, 136, 20, INK); rect(c, 61, 158, 134, 18, RAMP.gold[1]);
    for (let x = 70; x < 190; x += 16) { rect(c, x, 164, 8, 2, RAMP.gold[3]); }
    const face = g.state === 'won' ? 'star' : g.state === 'lost' || g.mists.some(m => m.t < .8) ? 'ugh' : 'calm';
    const bounce = g.state === 'won' ? Math.abs(Math.sin(g.t * 6)) * 4 : 0, oy = POMPON_OY - POMPON_PAD;
    c.drawImage(pomponShowPoodle(face), POMPON_OX, rd(oy - bounce));
    // remaining overgrowth; this phase's parts glow and breathe so the target is obvious
    const glow = .55 + .35 * Math.sin(g.t * 9);
    for (let p = POMPON_PHASES.length - 1; p >= g.phase; p--) for (const pt of POMPON_PHASES[p].parts) {
      const tr = p === g.phase && g.traces ? g.traces.find(t => t.ex === pt.ex) : null;
      if (tr && tr.done) continue;
      const img = pomponExcess(pt.ex);
      if (p === g.phase && g.state === 'play') { const sil = mdl('pomponExcessGlow:' + pt.ex, () => silhouette(img, '#fff27a')); for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2]]) drawS(c, sil, POMPON_OX + dx, oy + dy, { ax: 0, ay: 0, alpha: glow }); }
      c.drawImage(img, POMPON_OX, oy);
    }
    pomponDrawPieces(c, g.falling);
    // hairspray mist
    for (const m of g.mists) if (m.t < 1.2) { c.globalAlpha = .7 * (1 - m.t / 1.2); for (let i = 0; i < 7; i++) disc(c, m.x + Math.cos(i * 1.7) * 10 * (1 + m.t), m.y + Math.sin(i * 1.3) * 8 * (1 + m.t), 7 + m.t * 6, i % 2 ? POMPON_VAN_LILAC[3] : POMPON_VAN_LILAC[4]); c.globalAlpha = 1; }
    if (g.state === 'play' && g.traces) for (const tr of g.traces) { pomponGuide(c, tr.pts, g.t, tr.done); pomponCovDots(c, tr); }
    // cans coming down from the top screen, with a lilac target where each will land
    for (const cn of g.cans) {
      if (cn.dead) continue;
      const [x, yt] = this.canPos(cn), yb = yt - SH - HINGE, ly = cn.ey - SH - HINGE;
      if (cn.k > .35) { const k = clamp((cn.k - .35) / .65, 0, 1), r = 16 - k * 8; for (let i = 0; i < 12; i++) { if (i % 2) continue; const a = i / 12 * TAU + g.t * 3; disc(c, cn.ex + Math.cos(a) * r, ly + Math.sin(a) * r, 1.4, k > .6 && fl(g.t * 12) % 2 ? '#ff4060' : POMPON_VAN_LILAC[4]); } }
      if (yb > -12 && yb < SH + 12) { pomponSprayCan(c, x, yb, cn.rot); if (cn.k > .75 && fl(g.t * 12) % 2) ringPx(c, x, yb, 13, '#ff4060'); }
    }
    // phase tag
    const P = POMPON_PHASES[Math.min(2, g.phase)];
    if (g.state === 'play') { const s2 = 'FASE ' + Math.min(3, g.phase + 1) + '/3: ' + P.name, w = txtW(s2) + 16; panel(c, 4, 4, w, 14, '#ffffff', { r: 4 }); txt(c, s2, 4 + w / 2, 8, INK, { align: 'c' }); }
    if (g.state === 'won') pomponStamp(c, '¡DE GALA!', g.t - g.decidedAt, 36, ['#ffffff', '#ffd1e4', '#ff5d9e']);
    if (g.state === 'lost') pomponStamp(c, '¡QUÉ HORROR!', g.t - g.decidedAt, 36, POMPON_STAMP_BAD);
    g.blade.draw(c, g.t);
  },
  hint(g) { const tr = g.traces && g.traces.find(t => !t.done); if (!tr) return null; return { mech: 'cut', x: tr.pts[0][0], y: tr.pts[0][1], path: tr.pts }; },
  top(g, c) {
    const t = g.t;
    c.drawImage(pomponArenaBg(), 0, 0);
    pomponBeams(c, t, 4, .08, ['#c49aff', '#ff82b4']);
    pomponCrowd(c, 158, t * 2.1, t, g.cheer);
    // Vanesa up on the gantry, lobbing cans
    const pose = g.state === 'won' ? 'angry' : g.vanPose;
    pomponDrawVanesa(c, 218, 150, pose, { flip: true });
    if (g.state === 'play' && g.vanPose === 'smug' && fl(t * .6) % 3 === 0) pomponSay(c, '¡Un poquito de laca!', 172, 22, 206, 56);
    // camera flashes pop all over the stalls for the winner
    if (g.state === 'won') for (let i = 0; i < 7; i++) { const ph = ((g.t - g.decidedAt) * 2.3 + i * .37) % 1; if (ph < .18) { const fx0 = 14 + (i * 67) % 230, fy0 = 150 + (i * 23) % 30; drawStar(c, fx0, fy0, 7 * (1 - ph / .18), '#ffffff', i); disc(c, fx0, fy0, 2, '#fff7ae'); } }
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
