// ============================================================================
//  BOSS — El Secador Supersónico 3000. Three controls, one at a time:
//  1 AGUA: spin the valve to fill the tank · 2 TURBINA: crank the turbine
//  without overheating · 3 ¡FUEGO!: turn the dial to aim the nozzle at the
//  soaking dog (who bobs on a lift). The dog's patience is the clock.
// ============================================================================
'use strict';
// the machine at boss size (geometry scaled, not the pixels)
function bigotesMachineAt(k, heat) {
  return mdl('bigotes:supersonicoK' + k + heat, () => {
    const S = RAMP.steel, Q = f => (x, y) => f(x / k, y / k) * k;
    const dome = Q(SD.ellipse(40, 30, 26, 20)), ring = Q(SD.sub(SD.ellipse(40, 30, 28, 22), SD.ellipse(40, 30, 25, 19)));
    const fins = Q(SD.union(...[0, 1, 2, 3].map(i => SD.box(14 + i * 7, 16 - i * 1.5, 1.6, 10, .6, -.4))));
    const stand = Q(SD.union(SD.box(40, 58, 3, 12, 1), SD.box(40, 70, 16, 3, 2)));
    const collar = Q(SD.circle(62, 34, 7));
    return model(Math.ceil(84 * k), Math.ceil(76 * k), [
      { f: stand, ramp: S, z: 0, th: 3 }, { f: fins, ramp: S, z: .8, th: 2 },
      { f: dome, ramp: S, z: 1, th: 16, gloss: true }, { f: ring, ramp: RAMP.gold, z: 1.2, th: 3 },
      { f: collar, ramp: RAMP.gold, z: 1.4, th: 4 },
    ], { post: g => {
      for (const [dx, col] of [[30, '#5bd18b'], [40, '#ffdf4f'], [50, heat ? '#ff4060' : '#6b6977']]) { disc(g, dx * k, 36 * k, 3, INK); disc(g, dx * k, 36 * k, 2.2, col); px(g, dx * k - 1, 35 * k, '#ffffff'); }
      tiny(g, '3000', 40 * k, 22 * k, INK, { align: 'c' });
    } });
  });
}
function bigotesNozzleSpr(heat) {
  return mdl('bigotes:nozzleB' + heat, () => {
    const c = model(52, 22, [{ f: SD.capsule(4, 11, 44, 11, 9, 6.5), ramp: RAMP.steel, z: 1, th: 8, gloss: true }, { f: SD.box(46, 11, 4, 8, 1.5), ramp: RAMP.gold, z: 2, th: 3 }]);
    ellipsePx(c.g, 49, 11, 2, 5, INK); ellipsePx(c.g, 49, 11, 1.5, 4, heat ? '#ff9f4f' : '#2b2540');
    return c;
  });
}
function bigotesDialKnob(g, cx, cy, r, ang, lit) {
  disc(g, cx, cy, r + 2, INK); disc(g, cx, cy, r + 1, lit ? RAMP.yellow[3] : '#6b6977'); disc(g, cx - 2, cy - 2, r - 3, lit ? RAMP.yellow[4] : '#8f8a99');
  for (let i = 0; i < 12; i++) { const a = ang + i / 12 * TAU; px(g, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), lit ? RAMP.yellow[1] : '#5b5a67'); }
  thickLine(g, cx, cy, cx + Math.cos(ang) * (r - 3), cy + Math.sin(ang) * (r - 3), 1.6, INK); disc(g, cx, cy, 2.5, INK);
}
defMG({
  id: 'supersonico', stage: 'bigotes', boss: true, name: 'Secador Supersónico 3000', cmd: '¡A TODO GAS!', how: 'Llena el agua, carga la turbina sin quemarla y apunta al perro', mech: 'spin', beats: 16,
  song: () => BIGOTES_SONGS.boss,
  init(g) {
    const L = g.level - 1;
    g.ph = 1; g.phT = 0; g.water = 0; g.charge = 0; g.heat = 0; g.lock = 0; g.fired = -1; g.overT = -9;
    g.patience = 1; g.drain = 1 / [42, 36, 32][L];
    g.needW = [3, 3.5, 4][L]; g.needC = [3.4, 3.9, 4.4][L]; g.safe = [2.7, 2.45, 2.2][L];
    g.tol = [.16, .13, .11][L]; g.lockNeed = .5; g.shots = [3, 3, 4][L]; g.hits = 0; g.shotT = -9;
    g.valve = { x: 40, y: 160, r: 16, trk: spinTracker(40, 160) };
    g.crank = { x: 128, y: 158, r: 18, trk: spinTracker(128, 158) };
    g.dial = { x: 216, y: 160, r: 15, trk: spinTracker(216, 160) };
    g.noz = -.25; g.dogY = 84; g.dogPh = g.r(TAU); g.dogSp = [1.6, 2.1, 2.6][L];
    g.fan = 0; g.botA = 0; g.shoutT = 0;
  },
  pivot() { return [127, 61]; },
  // a control only turns when the finger circles near it (a finger sliding over from another control doesn't count)
  turn(ctl, dt) { if (IN.down && dist(IN.x, IN.y, ctl.x, ctl.y) > ctl.r * 3.2) { ctl.trk.last = null; return 0; } return ctl.trk.update(dt); },
  dogAng(g) { const [px0, py0] = this.pivot(); return Math.atan2(g.dogY - py0, 214 - px0); },
  nextPhase(g, to) { g.ph = to || g.ph + 1; g.phT = 0; sfx('slam'); sfx('select'); g.shake(2, .15); const ctl = [g.valve, g.crank, g.dial][g.ph - 1]; g.fx.burst(ctl.x, ctl.y, 12, { k: 'star', c: [C.yellow, '#fff'], sp0: 40, sp1: 120 }); },
  update(g, dt) {
    g.phT += dt; g.fan += dt * (2 + g.charge * 30 + (g.ph === 2 ? Math.abs(g.crank.trk.vel) : 0));
    if (g.state === 'won') { g.dogY = lerp(g.dogY, 84, .05); return; }
    if (g.state === 'lost') return;
    // the dog bobs on its lift (always), faster in the aiming phase
    g.dogPh += dt * (g.ph === 3 ? g.dogSp : .8);
    g.dogY = 84 + Math.sin(g.dogPh) * (g.ph === 3 ? 34 : 8);
    g.patience -= g.drain * dt;
    if (g.patience <= 0) {
      g.patience = 0; g.lose(); sfx('whine'); sfx('splash'); g.shake(4, .4); flash('bot', '#9bd6f7', .2);
      for (let i = 0; i < 40; i++) g.fx.add({ k: 'drop', x: 214 + g.r(-14, 14), y: g.dogY - 10 + g.r(-10, 10), vx: g.r(-240, 240), vy: -g.r(60, 260), g: 450, life: 1, c: pick(['#9bd6f7', '#dff4ff', '#5aaee6']) });
      return;
    }
    if (g.ph === 1) {
      const d = this.turn(g.valve, dt);
      if (d) { bigotesSpinClicks(g, g.valve.trk, '_c1', Math.PI / 2); g.water = Math.min(1, g.water + Math.abs(d) / (TAU * g.needW)); if (FRAME % 3 === 0) sfx('drip', { pitch: .7 + g.water, vol: .4 }); }
      if (g.water >= 1) this.nextPhase(g);
    } else if (g.ph === 2) {
      const d = this.turn(g.crank, dt), tps = Math.abs(g.crank.trk.vel) / TAU;
      if (d) { bigotesSpinClicks(g, g.crank.trk, '_c2', Math.PI / 3); g.charge = Math.min(1, g.charge + Math.abs(d) / (TAU * g.needC)); }
      if (IN.down && tps > g.safe) g.heat = Math.min(1, g.heat + (tps - g.safe) * .55 * dt + .25 * dt);
      else g.heat = Math.max(0, g.heat - .35 * dt);
      if (g.heat > .7 && FRAME % 4 === 0) g.fx.add({ k: 'puff', x: 70 + g.r(-20, 20), y: 30, vx: g.r(-20, 20), vy: -g.r(30, 70), r: 4, life: .7, c: '#c8c6d3' });
      if (g.heat >= 1) {
        g.heat = .35; g.charge = Math.max(0, g.charge - .28); g.patience = Math.max(.02, g.patience - .08); g.overT = g.t;
        sfx('boom', { vol: .5 }); sfx('buzz'); g.shake(4, .35); HITSTOP = 4; buzz([40, 30, 40]);
        for (let i = 0; i < 18; i++) g.fx.add({ k: 'puff', x: 90 + g.r(-30, 30), y: 60 + g.r(-20, 20), vx: g.r(-80, 80), vy: -g.r(20, 120), r: g.r(4, 9), life: g.r(.6, 1.1), c: pick(['#5b5a67', '#8f8a99', '#44424f']) });
      }
      if (g.charge >= 1) this.nextPhase(g);
    } else if (g.ph === 3) {
      const d = this.turn(g.dial, dt);
      if (d) { g.noz = clamp(g.noz + d * .5, -.95, .95); if (fl(Math.abs(g.dial.trk.ang) / .35) !== g._c3) { g._c3 = fl(Math.abs(g.dial.trk.ang) / .35); sfx('tick', { pitch: 1.6 }); } }
      const off = Math.abs(angDiff(g.noz, this.dogAng(g)));
      if (off < g.tol) { g.lock = Math.min(g.lockNeed, g.lock + dt); if (FRAME % 6 === 0) sfx('blip', { pitch: 1 + g.lock * 2 }); }
      else g.lock = Math.max(0, g.lock - dt * .5);
      if (g.lock >= g.lockNeed) {
        g.hits++; g.lock = 0; g.shotT = g.t; g.charge = 0;
        sfx('boom', { vol: .8 }); sfx('whoosh'); flash('bot', '#ffffff', .12); g.shake(4, .35); HITSTOP = 5; buzz(40);
        const [px0, py0] = this.pivot();
        for (let i = 0; i < 30; i++) { const a = g.noz + g.r(-.2, .2), sp = g.r(200, 420); g.fx.add({ k: i % 2 ? 'spark' : 'puff', x: px0 + Math.cos(g.noz) * 52, y: py0 + Math.sin(g.noz) * 52, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2, r: g.r(2, 5), life: g.r(.3, .7), c: pick(['#ffffff', '#fff7ae', '#ffd49b']) }); }
        for (let i = 0; i < 14; i++) g.fx.add({ k: 'drop', x: 214 + g.r(-12, 12), y: g.dogY - 8, vx: g.r(40, 200), vy: -g.r(40, 180), g: 420, life: .7, c: '#9bd6f7' });
        if (g.hits >= g.shots) { g.fired = g.t; g.win(); sfx('sparkle', { delay: .3 }); g.shake(5, .45); HITSTOP = 8; buzz(60); }
        else { g.dogSp *= 1.18; this.nextPhase(g, 2); sfx('boing', { pitch: .8 }); }
      }
    }
  },
  draw(g, c) {
    const t = g.t, heat = g.heat > .6 || g.t - g.overT < .6 ? 1 : 0;
    // backdrop: lab wall + checker floor
    c.drawImage(bigotesLabBotBackdrop(), 0, 0);
    rect(c, 0, 128, SW, 40, RAMP.bigotesWall[0]); rect(c, 0, 128, SW, 1, INK);
    // water tank (glass tube) on the left
    rect(c, 8, 26, 22, 96, INK); rect(c, 9, 27, 20, 94, 'rgba(223,244,255,.3)');
    const wh = rd(92 * g.water); rect(c, 10, 120 - wh, 18, wh, '#5aaee6'); rect(c, 10, 120 - wh, 18, 2, '#9bd6f7');
    for (let i = 0; i < 4; i++) { const by = 118 - ((t * 30 + i * 21) % Math.max(1, wh)); if (wh > 6) px(c, 14 + i * 3, by, '#ffffff'); }
    rect(c, 11, 28, 2, 90, 'rgba(255,255,255,.5)'); tiny(c, 'H2O', 19, 16, '#ffffff', { align: 'c' });
    rect(c, 29, 70, 20, 5, INK); rect(c, 30, 71, 18, 3, RAMP.bigotesCopper[2]);
    // the machine + its turbine (seen through the dome's grille)
    const mach = bigotesMachineAt(1.5, heat), mx = 94, my = 124;
    drawS(c, mach, mx, my, { ax: .5, ay: 1, sx: 1 + Math.sin(t * 50) * g.charge * .01 });
    bigotesDryerCage(c, 94, 58, 16, g.fan);
    // nozzle, rotating around its pivot
    const [px0, py0] = this.pivot();
    drawS(c, bigotesNozzleSpr(heat), px0, py0, { ax: .06, ay: .5, rot: g.noz });
    // aim line in phase 3
    if (g.ph === 3 && g.state === 'play') { for (let i = 54; i < 160; i += 6) { const x = px0 + Math.cos(g.noz) * i, y = py0 + Math.sin(g.noz) * i; px(c, x, y, g.lock > 0 ? '#5bd18b' : '#ff4060'); } }
    // the soaking dog on a hydraulic lift (right)
    rect(c, 208, g.dogY + 14, 12, 128 - (g.dogY + 14), INK); rect(c, 209, g.dogY + 14, 10, 128 - (g.dogY + 14), RAMP.steel[3]);
    rect(c, 194, g.dogY + 10, 40, 5, INK); rect(c, 195, g.dogY + 11, 38, 3, RAMP.steel[2]);
    if (g.state === 'won') { const k = spring(t - g.fired, 2.2, 6); drawS(c, bigotesPoofWestie(), 214, g.dogY + 12, { ax: .5, ay: 1, sx: .5 + k * .7, sy: .5 + k * .7, flip: true }); if (t - g.fired < 1.3) shout(c, '¡FIUUUM!', 150, 30, t - g.fired); }
    else {
      const shiver = g.patience < .3 ? Math.sin(t * 60) * 1.5 : 0;
      const dryK = g.hits / g.shots, fresh = g.t - g.shotT < .4 ? spring(g.t - g.shotT, 3, 6) : 1;
      drawS(c, westieSide(.7, dryK < .34 ? 'wet' : 'stand', g.patience < .3 ? 'itchy' : dryK > .6 ? 'normal' : 'sad'), 214 + shiver, g.dogY + 11, { ax: .5, ay: 1, flip: true, sx: (1 + dryK * .15) * fresh, sy: (1 + dryK * .15) * fresh });
      if (g.state === 'play' && fl(t * 6) % 2) px(c, 204 + fl(t * 13) % 20, g.dogY + 12 + (t * 40 % 10), '#9bd6f7');
      if (g.ph === 3 && g.state === 'play') { const k = g.lock / g.lockNeed, r = 16 - k * 6; ringPx(c, 214, g.dogY - 8, r, k > 0 ? '#5bd18b' : '#ff4060'); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + t * 2; linePx(c, 214 + Math.cos(a) * (r + 2), g.dogY - 8 + Math.sin(a) * (r + 2), 214 + Math.cos(a) * (r + 6), g.dogY - 8 + Math.sin(a) * (r + 6), k > 0 ? '#5bd18b' : '#ff4060'); } }
    }
    // control deck: valve, crank, dial (only the current one is live)
    rect(c, 0, 168, SW, 24, INK); rect(c, 0, 169, SW, 23, RAMP.steel[1]);
    const live = g.state === 'play';
    bigotesCrank(c, g.valve.x, g.valve.y, g.valve.r, g.valve.trk.ang, { kind: 'wheel', col: g.ph === 1 ? RAMP.blue : RAMP.steel });
    bigotesCrank(c, g.crank.x, g.crank.y, g.crank.r, g.crank.trk.ang, { col: g.ph === 2 ? RAMP.red : RAMP.steel, hot: g.ph === 2 && IN.down });
    bigotesDialKnob(c, g.dial.x, g.dial.y, g.dial.r, g.dial.trk.ang, g.ph === 3);
    [['AGUA', g.valve], ['TURBINA', g.crank], ['APUNTA', g.dial]].forEach(([lbl, ctl], i) => {
      const on = g.ph === i + 1; tiny(c, lbl, ctl.x, 184, on ? C.yellowL : '#8f8a99', { align: 'c' });
      if (!on && g.ph > i + 1) { disc(c, ctl.x + 14, ctl.y - 14, 5, INK); disc(c, ctl.x + 14, ctl.y - 14, 4, '#5bd18b'); px(c, ctl.x + 12, ctl.y - 14, '#fff'); px(c, ctl.x + 13, ctl.y - 13, '#fff'); px(c, ctl.x + 14, ctl.y - 14, '#fff'); px(c, ctl.x + 15, ctl.y - 15, '#fff'); }
      if (on && live && g.phT < 1.2 + (i === 2 ? 1 : 0)) bigotesSpinHint(c, ctl.x, ctl.y, ctl.r + 9, t, 1);
    });
    if (g.ph === 2 && live) { bigotesMeterV(c, 168, 60, 10, 56, g.charge, '#5bd18b', 'CARGA'); }
    if (live && g.phT < 1) { const lbl = ['', '¡AGUA!', g.hits ? '¡RECARGA!' : '¡POTENCIA!', '¡APUNTA!'][g.ph]; shout(c, lbl, 128, 20, g.phT); }
    if (live && g.t - g.shotT < .9) shout(c, '¡FSSSH! ' + g.hits + '/' + g.shots, 150, 44, g.t - g.shotT);
    if (g.t - g.overT < 1 && live) shout(c, '¡DEMASIADO RÁPIDO!', 110, 40, g.t - g.overT);
  },
  top(g, c) {
    const pn = ['AGUA', 'TURBINA', '¡FUEGO!'];
    // phase chips
    pn.forEach((p, i) => { const on = g.ph === i + 1, done = (i === 0 && g.ph > 1) || g.state === 'won', x = 14 + i * 80; panel(c, x, 38, 72, 18, done ? '#5bd18b' : on ? '#fff27a' : '#6b6977', { r: 4 }); txt(c, (i + 1) + ' ' + p, x + 36, 43, INK, { align: 'c', bold: on }); });
    for (let i = 0; i < g.shots; i++) { const x = 172 + i * 12, on = i < g.hits; disc(c, x, 110, 5, INK); disc(c, x, 110, 4, on ? '#fff27a' : '#44424f'); if (on) px(c, x - 1, 109, '#ffffff'); }
    txt(c, 'DISPAROS', 172 + (g.shots - 1) * 6, 118, '#ffffff', { align: 'c', out: INK });
    // patience of the soaking dog
    panel(c, 14, 64, 150, 34, '#fff8e6', { r: 5 });
    drawS(c, buleHead(g.patience < .3 ? 'grr' : 'sad'), 34, 82, { s: 1 });
    txt(c, 'PACIENCIA', 58, 69, INK, { bold: true });
    bigotesBarH(c, 58, 82, 100, 9, g.patience, g.patience < .3 ? '#ff4060' : g.patience < .6 ? '#ffb020' : '#5bd18b');
    // turbine temperature
    panel(c, 172, 60, 70, 40, '#fff8e6', { r: 5 });
    bigotesGauge(c, 207, 84, 14, g.heat, g.t, 'TEMP');
    if (g.heat > .7 && fl(g.t * 8) % 2) txt(c, '¡QUEMA!', 207, 64, '#ff4060', { align: 'c', out: INK, bold: true });
  },
  bot(g) {
    if (g.state !== 'play') return { down: false };
    if (g.ph === 1) return bigotesBotCircle(g, g.valve.x, g.valve.y, g.valve.r, 2.4);
    if (g.ph === 2) return bigotesBotCircle(g, g.crank.x, g.crank.y, g.crank.r, g.safe * .78);
    const diff = angDiff(g.noz, this.dogAng(g));
    if (Math.abs(diff) < g.tol * .45) return { x: g.dial.x + Math.cos(g.botA) * g.dial.r, y: g.dial.y + Math.sin(g.botA) * g.dial.r, down: true };
    const w = sgn(diff) * clamp(Math.abs(diff) * 9, 3, 12); // rad/s of finger travel; nozzle moves at half
    g.botA += w / 60;
    return { x: g.dial.x + Math.cos(g.botA) * g.dial.r, y: g.dial.y + Math.sin(g.botA) * g.dial.r, down: true };
  },
});
