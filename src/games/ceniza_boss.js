// ============================================================================
//  BOSS — La Gran Pócima. Five ingredients, in order, while Pato the imp
//  knocks them off the shelves (and out of your paw); then stir in circles.
//  Three lumps ("grumos") and the cauldron blows.
// ============================================================================
'use strict';
function cenizaPocimaBg() {
  return mdl('cenizaPocimaBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    cenizaDenWall(g);
    for (const sy of [40, 80]) { rect(g, 6, sy, 244, 5, RAMP.wood[3]); rect(g, 6, sy, 244, 1, RAMP.wood[4]); rect(g, 6, sy + 5, 244, 1, INK); for (const bx of [16, 128, 240]) polyPx(g, [[bx - 3, sy + 5], [bx + 3, sy + 5], [bx, sy + 13]], RAMP.wood[1]); }
    // round window with the moon, top-right corner
    disc(g, 232, 18, 10, INK); disc(g, 232, 18, 9, RAMP.wood[2]); disc(g, 232, 18, 7, '#232a5e'); disc(g, 235, 15, 3, '#fff2c0'); disc(g, 236, 14, 2.4, '#232a5e');
    return c;
  });
}
const CENIZA_POCIMA_COLS = ['#5bd18b', '#4fc6c2', '#63a0ef', '#bf95e9', '#ff93bf', '#ffdf4f'];
defMG({
  id: 'pocima', stage: 'ceniza', boss: true, name: 'La Gran Pócima', cmd: '¡LA GRAN PÓCIMA!', how: 'Echa los cinco ingredientes en orden y luego remueve en círculos', mech: 'drag', beats: 16,
  song: () => CENIZA_SONGS.boss,
  init(g) {
    const good = cenizaShuffle(g, CENIZA_ING_GOOD.slice()).slice(0, 4).concat(['purpurina']);
    g.recipe = good; g.step = 0; g.lumps = 0; g.maxLumps = 3;
    const nBad = [3, 4, 5][g.level - 1];
    const ids = cenizaShuffle(g, g.recipe.concat(cenizaShuffle(g, CENIZA_ING_BAD.slice()).slice(0, nBad)));
    // two shelves
    const top = ids.slice(0, Math.ceil(ids.length / 2)), mid = ids.slice(Math.ceil(ids.length / 2));
    g.items = [];
    [top, mid].forEach((row, r) => row.forEach((id, i) => { const x = 22 + (i + .5) * (212 / row.length); g.items.push({ id, x, y: [25, 65][r], hx: x, hy: [25, 65][r], rot: 0, fall: false, in: false, sq: 0, wob: g.r(TAU) }); }));
    g.pot = { x: 128, y: 136 }; g.potCol = CENIZA_POCIMA_COLS[0]; g.flash = 0;
    g.held = null; g.phase = 'recipe';
    g.pato = { x: 60, y: 100, t: g.r(10), dive: null, cool: 2.4, dizzy: 0, mood: 'grin', flip: false };
    g.spin = spinTracker(g.pot.x, g.pot.y); g.turns = 0; g.needTurns = [3, 4, 5][g.level - 1];
    g.banner = 0; g.boomT = -1;
  },
  patoSpeed(g) { return [1, 1.25, 1.5][g.level - 1] * (g.tempo || 1); },
  update(g, dt) {
    const Pt = g.pato, sp = this.patoSpeed(g);
    g.flash = Math.max(0, g.flash - dt * 3); g.banner = Math.max(0, g.banner - dt);
    for (const it of g.items) { it.sq = Math.max(0, it.sq - dt * 5); it.wob += dt * 3; if (it.sink != null) it.sink += dt * 4; else if (it.fall) cenizaFall(it, dt, 176); }
    // ---- Pato: a lazy figure-eight, with dives at the next ingredient
    Pt.dizzy = Math.max(0, Pt.dizzy - dt); Pt.cool -= dt * sp;
    if (Pt.dive) {
      const D = Pt.dive; D.t += dt * 1.6 * sp; const k = Math.min(1, D.t);
      Pt.x = lerp(D.x0, D.tx, E.ioQ(k)); Pt.y = lerp(D.y0, D.ty, E.ioQ(k)) - Math.sin(k * Math.PI) * 18; Pt.flip = D.tx < D.x0;
      if (k >= 1) {
        const it = D.it;
        if (it && !it.in && it !== g.held && !it.fall && dist(it.x, it.y, Pt.x, Pt.y) < 30) { it.fall = true; it.vy = -80; it.vx = (Pt.flip ? -1 : 1) * 70; sfx('czQuack'); g.fx.add({ k: 'txt', s: '¡CUAC!', x: it.x, y: it.y - 16, life: .6, c: '#fff7ae' }); Pt.mood = 'laugh'; }
        Pt.dive = null; Pt.cool = g.r(2.2, 3.2);
      }
    } else if (Pt.dizzy <= 0) {
      Pt.t += dt * sp; const hx = 128 + Math.sin(Pt.t * .9) * 96, hy = 100 + Math.sin(Pt.t * 1.8) * 16;
      Pt.flip = Math.cos(Pt.t * .9) < 0; Pt.x = lerp(Pt.x, hx, .08); Pt.y = lerp(Pt.y, hy, .08);
      if (Pt.cool <= 0 && g.phase === 'recipe' && g.state === 'play') {
        const want = g.items.find(it => it.id === g.recipe[g.step] && !it.in && !it.fall && it !== g.held);
        if (want) Pt.dive = { t: 0, x0: Pt.x, y0: Pt.y, tx: want.x, ty: want.y - 8, it: want }; else Pt.cool = 1;
      }
      if (Pt.cool > 1.2) Pt.mood = 'grin';
    } else { Pt.y += Math.sin(g.t * 20) * .3; Pt.mood = 'dizzy'; }
    if (g.state !== 'play') { g.held = null; return; }
    // ---- recipe phase: drag the next ingredient in
    if (g.phase === 'recipe') {
      // tap Pato (with nothing in the paw) to bonk him
      if (!g.held && IN.tap && dist(IN.x, IN.y, Pt.x, Pt.y) < 16 && Pt.dizzy <= 0) { Pt.dizzy = 1.8; Pt.dive = null; Pt.cool = 2; sfx('czQuack', { pitch: 1.4 }); sfx('boing'); g.fx.burst(Pt.x, Pt.y, 8, { k: 'star', c: ['#fff27a', '#ffffff'] }); return; }
      if (!g.held) g.held = cenizaGrab(g, g.items, 17, it => !it.in && it.sink == null);
      if (g.held) {
        const it = g.held; it.fall = false; it.vy = 0; cenizaFollow(it, dt);
        // Pato bumps it out of your paw if he flies through it
        if (Pt.dizzy <= 0 && dist(it.x, it.y, Pt.x, Pt.y) < 14) { g.held = null; it.fall = true; it.vy = -100; it.vx = (Pt.flip ? -1 : 1) * 90; sfx('czQuack'); g.fx.add({ k: 'txt', s: '¡CUAC!', x: it.x, y: it.y - 16, life: .6, c: '#fff7ae' }); Pt.mood = 'laugh'; Pt.cool = Math.max(Pt.cool, 1.5); return; }
        if (IN.rel || !IN.down) {
          g.held = null;
          if (dist(it.x, it.y, g.pot.x, g.pot.y) < 36 && it.y < 158) {
            it.in = true; it.sink = 0; sfx('splash', { pitch: 1.3, vol: .6 });
            g.fx.burst(g.pot.x, g.pot.y - 4, 10, { k: 'drop', c: [g.potCol, '#ffffff'], sp0: 40, sp1: 120, g: 320, life0: .3, life1: .6 });
            if (it.id === g.recipe[g.step]) {
              g.step++; g.flash = 1; g.potCol = CENIZA_POCIMA_COLS[Math.min(CENIZA_POCIMA_COLS.length - 1, g.step)];
              cenizaSparkle(g, g.pot.x, g.pot.y - 10, g.potCol);
              g.fx.add({ k: 'txt', s: g.step + '/5', x: g.pot.x, y: g.pot.y - 36, life: .6, c: '#ffffff' });
              if (g.step >= g.recipe.length) { g.phase = 'stir'; g.banner = 1.4; g.spin = spinTracker(g.pot.x, g.pot.y); sfx('slam'); }
            } else {
              g.lumps++; cenizaPuaj(g, g.pot.x, g.pot.y - 10); g.potCol = mixHex(g.potCol, '#44424f', .5);
              // a wrong-but-good ingredient goes back to its shelf spot; junk stays gone
              if (CENIZA_ING[it.id].good) { it.in = false; it.sink = null; it.fall = true; it.x = it.hx; it.y = 20; it.vy = 0; }
              if (g.lumps >= g.maxLumps) { g.boomT = g.t; g.lose(); sfx('boom'); g.shake(5, .4); flash('bot', '#44424f', .2); for (let i = 0; i < 24; i++) g.fx.add({ k: 'puff', x: g.pot.x + g.r(-30, 30), y: g.pot.y - 10, vx: g.r(-120, 120), vy: g.r(-200, -40), g: 120, drag: 1.5, r: g.r(5, 12), life: g.r(.6, 1.2), c: pick(['#3d3a4a', '#26242e', '#5b5a66']) }); }
            }
          } else { it.fall = true; it.vy = 0; it.vx = IN.vx * .3; }
        }
      }
      return;
    }
    // ---- stir phase: circles around the brew
    if (g.phase === 'stir') {
      const d = g.spin.update(dt);
      if (IN.down) { const inc = Math.abs(d) / TAU; const before = fl(g.turns); g.turns += inc; if (fl(g.turns) > before) { sfx('czMagic', { pitch: 1 + g.turns * .08 }); g.fx.burst(g.pot.x, g.pot.y - 6, 10, { k: 'star', c: CENIZA_POCIMA_COLS, sp0: 40, sp1: 140 }); buzz(8); } if (fl(g.t * 8) % 2 === 0 && Math.abs(d) > .02) sfx('czBlub', { pitch: 1 + (g.turns % 1) }); }
      g.potCol = CENIZA_POCIMA_COLS[(fl(g.turns * 2) % CENIZA_POCIMA_COLS.length)];
      if (g.turns >= g.needTurns) {
        g.win(); sfx('boom', { vol: .5 }); sfx('sparkle'); HITSTOP = 6; flash('bot', '#ffffff', .2); g.shake(4, .35);
        for (let i = 0; i < 30; i++) g.fx.add({ k: i % 3 ? 'star' : 'heart', x: g.pot.x + g.r(-10, 10), y: g.pot.y - 12, vx: g.r(-160, 160), vy: g.r(-260, -80), g: 300, life: g.r(.8, 1.4), c: pick(CENIZA_POCIMA_COLS), r: 3 });
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaPocimaBg(), 0, 0);
    const P = g.pot, cs = cenizaCauldron(1.5), boom = g.boomT >= 0;
    cenizaFire(c, P.x, 186, g.t, 1.4);
    c.drawImage(cs, rd(P.x - cs.width / 2), rd(P.y - 18));
    cenizaPotion(c, P.x, P.y, 36, 7, boom ? '#26242e' : g.potCol, g.t, { boil: g.flash > 0 || g.phase === 'stir', swirl: g.phase === 'stir' && IN.down });
    if (g.flash > 0) { c.globalAlpha = g.flash * .6; ellipsePx(c, P.x, P.y, 38, 8, '#ffffff'); c.globalAlpha = 1; }
    // lumps float on the brew
    for (let i = 0; i < g.lumps; i++) { const lx = P.x - 16 + i * 16 + Math.sin(g.t * 2 + i) * 3; disc(c, lx, P.y + 1, 3.5, INK); disc(c, lx, P.y, 2.6, '#6b6977'); px(c, lx - 1, P.y - 1, '#9896a4'); }
    for (let i = 0; i < 3; i++) { const ph = (g.t * .7 + i * .33) % 1; c.globalAlpha = (1 - ph) * .4; disc(c, P.x - 14 + i * 14 + Math.sin(g.t * 2 + i) * 4, P.y - 12 - ph * 44, 4 + ph * 5, boom ? '#26242e' : '#dfe3f1'); } c.globalAlpha = 1;
    // stir phase: the big ladle follows the finger around the rim
    if (g.phase === 'stir') {
      const a = IN.down ? Math.atan2(IN.y - P.y, IN.x - P.x) : g.t * 2, lx = P.x + Math.cos(a) * 24, ly = P.y + Math.sin(a) * 5;
      cenizaLadle(c, lx, ly - 42, Math.PI / 2 + Math.cos(a) * .25, 40);
      if (!IN.down || g.t % 1 < .5) { for (let i = 0; i < 12; i++) { const q = g.t * 3 + i / 12 * TAU; if (i % 2) px(c, P.x + Math.cos(q) * 44, P.y + Math.sin(q) * 14, '#ffffff'); } }
      if (g.state === 'play') { const k = (g.t * 1.2) % 1; drawHand(c, P.x + Math.cos(g.t * 4) * 40, P.y - 4 + Math.sin(g.t * 4) * 12, true); void k; }
    }
    // ingredients
    for (const it of g.items) {
      if (it.sink != null) { if (it.sink < 1) drawS(c, cenizaIngIcon(it.id), it.x, P.y - 4 + it.sink * 8, { s: 1 - it.sink, rot: it.sink * 3 }); continue; }
      const held = it === g.held, next = g.phase === 'recipe' && it.id === g.recipe[g.step];
      if (held) shadowOval(c, it.x, Math.min(180, it.y + 30), 7, 2, .3);
      drawS(c, cenizaIngIcon(it.id), it.x, it.y + (!held && !it.fall ? Math.sin(it.wob) * .8 : 0), { rot: it.rot, s: 1 + it.sq * .25 + (held ? .15 : 0) });
      void next;
    }
    // Pato
    const Pt = g.pato;
    cenizaPato(c, Pt.x, Pt.y - 14, Pt.mood, g.t, { flip: Pt.flip, rot: Pt.dizzy > 0 ? g.t * 10 : 0 });
    if (Pt.dizzy > 0) for (let i = 0; i < 3; i++) { const a = g.t * 6 + i * TAU / 3; drawStar(c, Pt.x + Math.cos(a) * 10, Pt.y - 30 + Math.sin(a) * 3, 2, '#fff27a'); }
    if (g.banner > 0) { const k = spring(1.4 - g.banner, 2.4, 7); c.save(); c.translate(128, 60); c.scale(k, k); mord(c, '¡REMUEVE!', 0, -10, { u: 2, r: 2.1, rim: 2, sy: 3, fill: ['#ffffff', '#e5d3fa', '#bf95e9'] }); c.restore(); }
    if (g.state === 'won') mord(c, 'PÓCIMA Nº 5', 128, 40 + Math.sin(g.t * 5) * 2, { u: 1.5, r: 1.7, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] });
  },
  // boss HUD: the recipe scroll, lumps and the stir counter
  top(g, c) {
    panel(c, 8, 28, 240, 58, '#fff4dc', { r: 6, line: INK, lo: '#dcc08a' });
    txt(c, g.phase === 'stir' ? '¡REMUEVE!' : 'RECETA · Pócima Nº 5', 16, 33, '#5a1f2a', { bold: true });
    g.recipe.forEach((id, i) => {
      const x = 28 + i * 44, y = 62, done = i < g.step, cur = i === g.step && g.phase === 'recipe';
      if (cur) { const bob = Math.abs(Math.sin(g.t * 6)) * 3; polyPx(c, [[x - 4, y - 18 - bob], [x + 4, y - 18 - bob], [x, y - 13 - bob]], C.pink); ringPx(c, x, y, 13, C.pink); }
      drawS(c, cenizaIngIcon(id, cur ? 1.5 : 1.2), x, y, { alpha: done ? .45 : 1 });
      if (done) { disc(c, x + 8, y - 8, 5, INK); disc(c, x + 8, y - 8, 4, '#5bd18b'); txt(c, '✓', x + 8, y - 11, '#ffffff', { align: 'c' }); }
      if (i < 4) txt(c, '›', x + 21, y - 4, '#c9b28c', { align: 'c', bold: true });
    });
    // lumps meter
    panel(c, 8, 92, 118, 24, '#2a2440', { r: 5 }); txt(c, 'GRUMOS', 16, 100, '#e5d3fa', { bold: true });
    for (let i = 0; i < g.maxLumps; i++) { const x = 78 + i * 15, on = i < g.lumps; disc(c, x, 104, 5.5, INK); disc(c, x, 104, 4.5, on ? '#6b6977' : '#40395e'); if (on) { px(c, x - 2, 103, INK); px(c, x + 2, 103, INK); hline(c, x - 1, x + 1, 106, INK); } }
    // stir progress
    if (g.phase === 'stir') {
      panel(c, 132, 92, 116, 24, '#fff8e6', { r: 5 });
      const k = clamp(g.turns / g.needTurns, 0, 1); rect(c, 140, 101, 76, 7, INK); rect(c, 141, 102, 74, 5, '#dce7ea'); rect(c, 141, 102, rd(74 * k), 5, CENIZA_POCIMA_COLS[fl(g.t * 6) % CENIZA_POCIMA_COLS.length]);
      txt(c, fl(g.turns) + '/' + g.needTurns, 234, 100, INK, { align: 'c', bold: true });
    }
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (g.phase === 'stir') {
      if (!b.down) { b.ang = 0; b.x = g.pot.x + 30; b.y = g.pot.y; b.down = true; return b; }
      b.ang = (b.ang || 0) + .22; b.x = g.pot.x + Math.cos(b.ang) * 30; b.y = g.pot.y + Math.sin(b.ang) * 16; return b;
    }
    if (!g.held) {
      const it = g.items.find(it => it.id === g.recipe[g.step] && !it.in && it.sink == null && (!it.fall || Math.abs(it.vy || 0) < 40));
      if (!it || b.down) { b.down = false; return b; }
      b.x = it.x; b.y = it.y; b.down = true; return b;
    }
    // steer around Pato: if he is close to the straight path, hold still a moment
    const Pt = g.pato, it = g.held;
    if (Pt.dizzy <= 0 && dist(Pt.x, Pt.y, it.x, it.y) < 34) { const ax = it.x - (Pt.x - it.x) * .5, ay = it.y - (Pt.y - it.y) * .5; cenizaBotMove(b, clamp(ax, 10, 246), clamp(ay, 20, 180), 6); return b; }
    if (cenizaBotMove(b, g.pot.x, g.pot.y - 8, 8)) b.down = false;
    return b;
  },
});
