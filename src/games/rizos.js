// ============================================================================
//  Microgames of RIZOS' stage (¡FROTA!): lather, towel, scratch, mirror, belly,
//  brush, lice, disco ball and afro.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared ----
const RIZOS_DRUM2 = 'k h o h k+c h o h k h o k k+c h o h';
// a sitting doodle (front), curly body under Rizos' head; style fluffy|damp|wet
function rizosSitBody(style = 'fluffy') {
  return mdl('rizosSit:' + style, () => {
    const F = style === 'wet' ? RIZOS_WET : style === 'damp' ? RIZOS_DAMP : RIZOS_FUR, wet = style === 'wet';
    const bodyS = SD.ellipse(40, 30, wet ? 17 : 20, wet ? 18 : 19);
    const body = wet ? SD.union(bodyS, ...[22, 30, 50, 58].map((x, i) => SD.capsule(x, 36, x + (x < 40 ? -1 : 1), 50 + (i % 2) * 3, 2.6, 1.3))) : SD.curls(bodyS, 1.8, .6, 3);
    const legL = SD.curls(SD.capsule(31, 30, 30, 48, 5.4, 5), wet ? .4 : 1.1, .9, 1), legR = SD.curls(SD.capsule(49, 30, 50, 48, 5.4, 5), wet ? .4 : 1.1, .9, 4);
    const pawL = SD.curls(SD.ellipse(29, 49, 6.2, 3.8), .8, 1, 2), pawR = SD.curls(SD.ellipse(51, 49, 6.2, 3.8), .8, 1, 6);
    const hL = SD.curls(SD.ellipse(18, 40, 8, 9), 1.2, .8, 7), hR = SD.curls(SD.ellipse(62, 40, 8, 9), 1.2, .8, 9);
    const tx = wet ? clumpTex(3, .24, 5, 2.4, .45) : clumpTex(3.4, .38, 5, 1, 1.2);
    return model(80, 54, [
      { f: hL, ramp: F, z: 0, th: 6, tex: tx }, { f: hR, ramp: F, z: 0, th: 6, tex: tx },
      { f: body, fs: bodyS, ramp: F, z: 1, th: 14, tex: tx },
      { f: legL, ramp: F, z: 2, th: 5, tex: tx }, { f: legR, ramp: F, z: 2, th: 5, tex: tx },
      { f: pawL, ramp: F, z: 2.5, th: 3, tex: tx }, { f: pawR, ramp: F, z: 2.5, th: 3, tex: tx },
    ]);
  });
}
function rizosDrawSit(g, x, y, ex, style = 'fluffy', o = {}) {
  // (x, y) = base of the front paws
  drawS(g, rizosSitBody(style), x, y, { ax: .5, ay: 1, sx: o.sx || 1, sy: o.sy || 1 });
  drawS(g, rizosHead(ex, style), x + (o.dx || 0), y - 44 * (o.sy || 1) + (o.dy || 0), { ax: .5, ay: .8, rot: o.rot || 0 });
}
// light specks from a disco ball sweeping over any wall
function rizosSpecks(g, t, n = 14, x0 = 0, y0 = 0, w = SW, h = SH) {
  const cols = ['#ff93bf', '#9bd6f7', '#fff7ae', '#c49ae8'];
  for (let i = 0; i < n; i++) { const x = x0 + ((i * 47 + t * (30 + (i % 3) * 12)) % w), y = y0 + ((i * 29 + Math.sin(t * .7 + i) * 16 + h) % h); rect(g, x, y, 2, 2, cols[i % 4]); }
}
// fog/foam dither tiles (4x4) by density level 1..4
function rizosDitherTile(col, lvl) { return mdl('rizosDT' + col + lvl, () => { const c = mkCanvas(4, 4); c.g.fillStyle = col; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (bayer(x, y) < lvl / 4) c.g.fillRect(x, y, 1, 1); return c; }); }

// ---------------------------------------------------------------- 1 ESPUMA --
// Rizos comes back from the park with mud in his afro: lather every splotch.
function rizosMudSplat(seed, r) {
  return mdl('rizosMud' + seed + r, () => {
    const d = rd(r * 2 + 8), c = mkCanvas(d, d + 6), g = c.g, cx0 = d / 2, cy0 = d / 2;
    const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, rr = r * (.75 + hash2(i, seed) * .45); pts.push([cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr * .85]); }
    polyPx(g, pts.map(([x, y]) => [x + 1, y + 1]), '#3d2512'); polyPx(g, pts, '#6b4520'); polyPx(g, pts.map(([x, y]) => [lerp(x, cx0 - 2, .45), lerp(y, cy0 - 2, .45)]), '#8a5c2c');
    for (let i = 0; i < 3; i++) { const x = cx0 - r * .5 + i * r * .5; vline(g, x, cy0 + r * .6, cy0 + r * .6 + 3 + (i % 2) * 3, '#6b4520'); disc(g, x, cy0 + r * .6 + 4 + (i % 2) * 3, 1.3, '#6b4520'); }
    px(g, cx0 - r * .35, cy0 - r * .4, '#a8773f');
    return c;
  });
}
function rizosDuck(g, x, y, t) {
  const b = Math.sin(t * 4) * 1.5;
  ellipsePx(g, x, y + b, 9, 6, INK); ellipsePx(g, x, y - 1 + b, 8, 5, '#ffdf4f'); disc(g, x + 5, y - 7 + b, 5, INK); disc(g, x + 5, y - 7 + b, 4, '#ffdf4f');
  rect(g, x + 8, y - 7 + b, 4, 2, '#ff9f4f'); px(g, x + 6, y - 9 + b, INK); px(g, x - 4, y - 3 + b, '#fff7ae');
}
defMG({
  id: 'espuma', stage: 'rizos', name: 'Baño de espuma', cmd: '¡ENJABONA!', how: 'Frota cada mancha de barro hasta taparla de espuma', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .6, n: 'A5 . E5 . C6 . E5 . B5 . E5 . G5 . E5 . A5 . E5 . C6 . E6 . D6 . C6 . B5 . G5 .' },
    { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 . F2 . F3 . F2 . F3 . G2 . G3 . G2 . G3 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM + ' ' + RIZOS_DRUM }] }),
  init(g) {
    const n = [3, 5, 6][g.level - 1];
    const cand = [[-16, -12], [0, -19], [16, -12], [-22, 6], [22, 6], [-14, 58], [14, 58], [-8, -4]];
    g.spots = shuffle(cand.slice()).slice(0, n).map(([dx, dy], i) => ({ dx, dy, r: g.r(6, 8.5), v: 0, clean: false, seed: i * 13 + 5 }));
    g.rate = [1 / 70, 1 / 80, 1 / 90][g.level - 1] * Math.sqrt(g.tempo);
    g.rub = rubTracker(); g.dogX = 0; g.face = 'sadwet'; g.foam = mkCanvas(SW, SH); g.sway = [0, 8, 16][g.level - 1]; g.afroK = 0;
  },
  update(g, dt) {
    g.dogX = Math.sin(g.t * 2.4 * g.tempo) * g.sway * (g.state === 'play' ? 1 : .3);
    const hx = 128 + g.dogX, hy = 71;
    const onDog = IN.down && (dist(IN.x, IN.y, hx, hy) < 44 || (Math.abs(IN.x - hx) < 44 && IN.y > hy && IN.y < 146));
    const gain = g.rub.update(dt, onDog);
    if (g.state === 'won') g.afroK = Math.min(1, g.afroK + dt * 2.2);
    if (gain > 0 && g.state === 'play') {
      // visual lather where the finger goes
      if (FRAME % 2 === 0) this.blob(g, IN.x - g.dogX + g.r(-5, 5), IN.y + g.r(-5, 5), g.r(3, 6));
      if (fl(g.t * 30) % 3 === 0) g.fx.add({ k: 'bubble', x: IN.x + g.r(-8, 8), y: IN.y + g.r(-8, 8), vx: g.r(-20, 20), vy: g.r(-60, -20), life: g.r(.4, .8), r: g.r(1.5, 3.5), c: pick(['#ffffff', '#b3d9ff', '#ffd1e4']) });
      for (const sp of g.spots) {
        if (sp.clean) continue;
        const sx = hx + sp.dx, sy = hy + sp.dy;
        if (dist(IN.x, IN.y, sx, sy) > sp.r + 11) continue;
        sp.v += gain * g.rate;
        if (sp.v >= 1) {
          sp.clean = true; HITSTOP = 2; buzz(8);
          for (let i = 0; i < 5; i++) this.blob(g, sp.dx + 128 + g.r(-7, 7), sp.dy + hy + g.r(-6, 6), g.r(5, 8));
          const done = g.spots.filter(q => q.clean).length;
          sfx('pop', { pitch: .8 + done * .15 }); sfx('fizz', { vol: .4 });
          g.fx.burst(sx, sy, 8, { k: 'star', c: ['#ffffff', '#9bd6f7', '#fff27a'], sp0: 40, sp1: 110 });
          g.fx.add({ k: 'txt', s: '¡LIMPIO!', x: sx, y: sy - 14, life: .55, c: '#ffffff' });
          g.face = done >= g.spots.length / 2 ? 'grin' : 'cool';
          if (g.spots.every(q => q.clean)) { g.win(); g.face = 'love'; sfx('boingy', { pitch: .8 }); g.fx.burst(hx, 50, 26, { k: 'bubble', c: '#ffffff', sp0: 60, sp1: 170, r: 4, life0: .6, life1: 1.1 }); }
        }
      }
    }
    if (g.state === 'lost') g.face = 'sadwet';
  },
  blob(g, x, y, r) {
    const f = g.foam.g;
    disc(f, x, y + 1, r + 1, '#9fb4c8'); disc(f, x, y, r, '#dfe9f2'); disc(f, x - r * .2, y - r * .25, r * .72, '#ffffff'); px(f, x - r * .45, y - r * .5, '#ffffff');
    if (r > 5 && Math.random() < .3) ringPx(f, x + r * .5, y - r * .6, 2, '#b3d9ff');
    // his face always stays clear of foam
    f.save(); f.globalCompositeOperation = 'destination-out'; ellipsePx(f, 128, 90, 15, 13, '#000'); f.restore();
  },
  draw(g, c) {
    c.drawImage(bathBg(), 0, 0);
    rizosSpecks(c, g.t, 16, 0, 0, SW, 120);
    rizosDiscoBall(c, 222, 66, 7, g.t, { noChain: true }); vline(c, 222, 58, 59, RAMP.steel[2]);
    const dx = rd(g.dogX), hx = 128 + dx, hy = 71;
    const clean = g.spots.filter(q => q.clean).length / g.spots.length;
    drawS(c, rizosSitBody('damp'), hx, 150, { ax: .5, ay: 1 });
    drawS(c, rizosHead(g.state === 'won' ? 'love' : g.face === 'sadwet' ? 'sad' : g.face, 'damp'), hx, 104, { ax: .5, ay: .8 });
    // wet shine
    for (const [ox, oy] of [[-14, -26], [10, -30], [-26, -10]]) { px(c, hx + ox, hy + oy, '#dff4ff'); px(c, hx + ox + 1, hy + oy, '#b3d9ff'); }
    // mud splotches still to clean
    for (const sp of g.spots) if (!sp.clean) {
      const img = rizosMudSplat(sp.seed, rd(sp.r)), k = 1 - sp.v * .5;
      drawS(c, img, hx + sp.dx, hy + sp.dy, { s: k });
      if (sp.v > 0) { ringPx(c, hx + sp.dx, hy + sp.dy, sp.r + 3, '#ffffff'); }
    }
    c.drawImage(g.foam, dx, 0);
    // the giant foam afro when you win
    if (g.afroK > 0) {
      const k = spring(g.afroK, 2, 5);
      // a crown of lather over the afro (the face stays visible)
      for (let i = 0; i < 13; i++) { const a = Math.PI + i / 12 * Math.PI, R = 36 * k; this.blobAt(c, hx + Math.cos(a) * R, hy - 4 + Math.sin(a) * R * .9, 9 * k); }
      for (let i = 0; i < 7; i++) { const a = Math.PI * 1.15 + i / 6 * Math.PI * .7; this.blobAt(c, hx + Math.cos(a) * 22 * k, hy - 8 + Math.sin(a) * 22 * k, 8 * k); }
    }
    tubFront(c, 20, 146, 216);
    for (let x = 22; x < 234; x += 7) { const yy = 147 + Math.sin(x + g.t * 3) * 1.5; disc(c, x, yy, 5, '#ffffff'); ringPx(c, x, yy, 5, '#dce7ea'); }
    rizosDuck(c, 204, 143, g.t);
    // HUD: mud left
    const left = g.spots.filter(q => !q.clean).length;
    panel(c, 6, 6, 74, 18, '#ffffff', { r: 5 }); drawS(c, rizosMudSplat(3, 5), 20, 15, {}); txt(c, 'BARRO: ' + left, 30, 11, INK, { bold: true });
    if (g.state === 'won' && g.afroK > .5) shout(c, '¡AFRO DE ESPUMA!', 176, 30, g.afroK - .5);
    if (g.state === 'lost') txt(c, 'Sigue sucio…', 128, 26, '#6b4520', { align: 'c', out: '#ffffff', bold: true });
  },
  blobAt(c, x, y, r) { if (r < 1) return; disc(c, x, y + 1, r + 1, '#9fb4c8'); disc(c, x, y, r, '#dfe9f2'); disc(c, x - r * .2, y - r * .25, r * .72, '#ffffff'); },
  hint(g) { const sp = g.spots.find(q => !q.clean); return sp && { x: 128 + g.dogX + sp.dx, y: 71 + sp.dy }; },
  bot(g) {
    const sp = g.spots.find(q => !q.clean); if (!sp || g.state !== 'play') return { down: false };
    return { x: 128 + g.dogX + sp.dx + Math.sin(g.t * 55) * 8, y: 71 + sp.dy + Math.cos(g.t * 47) * 4, down: g.t > .15 };
  },
});

// ---------------------------------------------------------------- 2 TOALLA --
// fresh out of the bath, dripping and shivering: rub him dry with a big towel
function rizosTowelSpr() {
  return mdl('rizosTowel2', () => {
    const c = mkCanvas(52, 38), g = c.g;
    panel(g, 0, 0, 52, 38, '#ff93bf', { r: 7, line: INK, hi: '#ffd1e4', lo: '#e05b98' });
    for (const y of [7, 27]) { rect(g, 2, y, 48, 3, '#ffffff'); rect(g, 2, y + 3, 48, 1, '#ffd1e4'); }
    // terry-cloth texture + the salon's monogram
    for (let y = 12; y < 26; y += 2) for (let x = 4 + (y / 2 % 2); x < 48; x += 3) px(g, x, y, '#ffb3d1');
    panel(g, 17, 13, 18, 11, '#ffffff', { r: 3, line: '#e05b98' }); tiny(g, 'WB', 26, 16, RAMP.green[2], { align: 'c' });
    for (let x = 3; x < 50; x += 3) { px(g, x, 36, '#e05b98'); vline(g, x, 37, 38, INK); }
    return c;
  });
}
defMG({
  id: 'toalla', stage: 'rizos', name: 'Secado a toalla', cmd: '¡SECA!', how: 'Frota a Rizos con la toalla hasta que el afro vuelva a esponjarse', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D5 . D5 F5 . D5 . C5 D5 . . F5 G5 . F5 . D5 . D5 F5 . D5 . A5 G5 . F5 . D5 . C5 .' },
    { i: 'bass', v: .85, n: 'D2 . D3 . . D2 D3 . C2 . C3 . . C2 C3 . Bb1 . Bb2 . . Bb1 Bb2 . A1 . A2 . C3 . A2 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM2 + ' ' + RIZOS_DRUM }] }),
  init(g) {
    g.need = [560, 740, 900][g.level - 1] / Math.sqrt(g.tempo);
    g.rub = rubTracker(); g.dry = 0; g.stage = 0; g.tx = 180; g.ty = 150; g.trot = 0; g.shakeT = -1; g.sway = [0, 0, 14][g.level - 1]; g.dogX = 128;
  },
  update(g, dt) {
    g.dogX = 128 + Math.sin(g.t * 2 * g.tempo) * g.sway * (g.state === 'play' ? 1 : 0);
    const over = IN.down && Math.abs(IN.x - g.dogX) < 52 && IN.y > 36 && IN.y < 178;
    if (IN.down) { g.trot = lerp(g.trot, clamp(IN.vx / 900, -.5, .5), .2); g.tx = lerp(g.tx, IN.x, .6); g.ty = lerp(g.ty, IN.y, .6); }
    else g.trot = lerp(g.trot, 0, .1);
    const gain = g.rub.update(dt, over);
    if (gain > 0 && g.state === 'play') {
      g.dry = Math.min(1, g.dry + gain / g.need);
      if (fl(g.t * 60) % 2 === 0) g.fx.add({ k: 'drop', x: IN.x + g.r(-14, 14), y: IN.y + g.r(-6, 6), vx: g.r(-140, 140), vy: g.r(-170, -40), g: 420, life: .6, c: pick(['#9bd6f7', '#dff4ff', '#5aaee6']) });
      const st = g.dry >= .95 ? 3 : g.dry >= .62 ? 2 : g.dry >= .3 ? 1 : 0;
      if (st > g.stage) {
        g.stage = st; sfx('boingy', { pitch: 1 + st * .1 }); HITSTOP = 3; g.shake(2, .15); buzz(10);
        g.fx.burst(g.dogX, 86, 18, { k: 'hair', c: [RIZOS_FUR[3], RIZOS_FUR[4], RIZOS_FUR[2]], sp0: 60, sp1: 160, r: 3, life0: .4, life1: .7 });
        g.fx.add({ k: 'txt', s: ['', '¡POF!', '¡POOF!', '¡PUFFF!'][st], x: g.dogX, y: 30, life: .6, c: '#ffffff' });
      }
      if (g.dry >= 1) { g.win(); g.fx.burst(g.dogX, 90, 16, { k: 'star', c: [C.yellow, '#fff', RIZOS_NEON.pink], sp0: 60, sp1: 160 }); }
    }
    if (g.state === 'lost' && g.shakeT < 0) { g.shakeT = g.t; sfx('splash'); g.shake(3, .4); for (let i = 0; i < 26; i++) g.fx.add({ k: 'drop', x: g.dogX + g.r(-30, 30), y: 100 + g.r(-30, 30), vx: g.r(-260, 260), vy: g.r(-260, 60), g: 300, life: .9, c: pick(['#9bd6f7', '#5aaee6']) }); }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#dce7ea'); subwayTiles(c, 0, 0, SW, 150);
    woodFloor(c, 0, 150, SW, 42);
    const X = g.dogX;
    // the puddle shrinks as he dries
    const pud = 1 - g.dry; if (pud > .05) { ellipsePx(c, X, 178, 62 * pud + 10, 7 * pud + 2, '#5aaee6'); ellipsePx(c, X - 4, 177, 42 * pud + 6, 4 * pud + 1, '#9bd6f7'); }
    const style = g.stage >= 2 ? 'fluffy' : g.stage === 1 ? 'damp' : 'wet';
    const ex = g.state === 'won' ? 'love' : g.state === 'lost' ? 'sadwet' : g.stage >= 2 ? 'cool' : g.stage === 1 ? 'itch' : 'sadwet';
    const sh = g.shakeT >= 0 ? Math.sin((g.t - g.shakeT) * 50) * 5 * Math.max(0, 1 - (g.t - g.shakeT)) : 0;
    const shiver = g.stage === 0 && g.state === 'play' ? Math.sin(g.t * 60) * .8 : 0;
    const puff = g.stage >= 3 ? 1.04 + Math.sin(g.t * 6) * .02 : 1;
    rizosDrawSit(c, X + sh + shiver, 176, ex, style, { sx: puff, sy: puff, rot: sh * .03 });
    // unmistakably wet: shiny streaks, falling drips, brrr lines
    if (g.stage < 2 && g.state !== 'won') {
      for (let i = 0; i < 6 - g.stage * 3; i++) { const yy = 110 + ((g.t * 80 + i * 29) % 60), xx = X - 36 + i * 14; vline(c, xx, yy, yy + 3, '#5aaee6'); px(c, xx, yy + 4, '#dff4ff'); }
      for (const [ox, oy] of [[-18, -52], [8, -58], [-26, -38], [22, -44]]) { px(c, X + ox, 108 + oy, '#ffffff'); px(c, X + ox + 1, 108 + oy, '#b3d9ff'); }
      if (g.stage === 0) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) linePx(c, X + s * (50 + i * 3), 90 + i * 8, X + s * (54 + i * 3), 92 + i * 8, '#5aaee6');
      if (g.stage === 0 && fl(g.t * 2) % 2) txt(c, 'Brrr…', X + 42, 60, '#5aaee6', { out: '#ffffff' });
    }
    // the towel follows the finger
    drawS(c, rizosTowelSpr(), g.tx, g.ty, { rot: g.trot, sx: 1 + Math.abs(g.trot) * .2, sy: 1 - Math.abs(g.trot) * .15, alpha: IN.down ? 1 : .75 });
    // splash on the "lens" when he shakes it all off at you
    if (g.shakeT >= 0) for (let i = 0; i < 9; i++) { const k = clamp((g.t - g.shakeT) * 4 - i * .1, 0, 1); if (k > 0) { disc(c, 24 + i * 27, 30 + (i % 3) * 44 + k * 20, 7, 'rgba(155,214,247,.55)'); px(c, 21 + i * 27, 27 + (i % 3) * 44 + k * 20, '#ffffff'); } }
    // dryness meter: a drop that empties into a sun
    panel(c, 6, 6, 92, 18, '#ffffff', { r: 5 });
    polyPx(c, [[18, 9], [13, 17], [23, 17]], '#5aaee6'); disc(c, 18, 18, 5, '#5aaee6'); px(c, 16, 16, '#dff4ff');
    rect(c, 28, 12, 62, 7, INK); rect(c, 29, 13, rd(60 * g.dry), 5, g.dry > .9 ? '#ffd23f' : '#ffb020'); rect(c, 29, 13, rd(60 * g.dry), 1, '#fff7ae');
    if (g.state === 'won') shout(c, '¡AFRO LISTO!', 176, 36, g.t - g.decidedAt);
  },
  hint(g) { return { x: g.dogX, y: 104 }; },
  bot(g) { return { x: g.dogX + Math.sin(g.t * 34) * 30, y: 96 + Math.sin(g.t * 5) * 30, down: g.t > .2 && g.state === 'play' }; },
});

// ---------------------------------------------------------------- 3 VINILO --
function rizosRecordSpr() {
  return mdl('rizosRecord', () => {
    const c = mkCanvas(122, 122), g = c.g, R = 60, cx = 61, cy = 61;
    disc(g, cx, cy, R + 1, INK); disc(g, cx, cy, R, '#15111f');
    for (let r = 20; r < R - 1; r += 3) ringPx(g, cx, cy, r, r % 2 ? '#211b30' : '#1a1528');
    // label: Club Champú, pink with a star
    disc(g, cx, cy, 18, INK); disc(g, cx, cy, 17, '#ff3d8b'); disc(g, cx - 2, cy - 2, 13, '#ff8fbd');
    polyPx(g, rizosStarPts(cx, cy - 5, 5, 2.4, 0), '#fff04f');
    tiny(g, 'CLUB', cx, cy + 2, '#2a1052', { align: 'c' }); tiny(g, 'CHAMPU', cx, cy + 8, '#2a1052', { align: 'c' });
    disc(g, cx, cy, 1.6, INK);
    return c;
  });
}
function rizosCrowd(g, t, hype, beat) {
  // dancing dogs in silhouette with neon rim light; they jump higher with the hype
  const cols = ['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff'];
  for (let i = 0; i < 13; i++) {
    const x = 10 + i * 20, ph = beat * Math.PI + i * 1.3, jump = Math.abs(Math.sin(ph)) * (2 + hype * 10), y = 60 - jump - (i % 2) * 4;
    const rim = cols[(i + fl(beat)) % 4], col = '#1a0a38';
    const shape = (dx, dy, c) => { disc(g, x + dx, y + dy, 8, c); disc(g, x - 5 + dx, y - 6 + dy, 3.2, c); disc(g, x + 5 + dx, y - 6 + dy, 3.2, c); rect(g, x - 6 + dx, y + 4 + dy, 12, 20, c); };
    shape(-1, -1, rim); shape(0, 0, col);
    if (hype > .45 && (i + fl(beat)) % 2) { thickLine(g, x - 6, y + 6, x - 11, y - 9, 1.8, rim); thickLine(g, x + 6, y + 6, x + 11, y - 9, 1.8, rim); thickLine(g, x - 6, y + 6, x - 10, y - 8, 1.2, col); thickLine(g, x + 6, y + 6, x + 10, y - 8, 1.2, col); }
    rect(g, x - 3, y - 1, 2, 1, '#ffffff'); rect(g, x + 2, y - 1, 2, 1, '#ffffff');
  }
}
defMG({
  id: 'vinilo', stage: 'rizos', name: 'DJ Rizos', cmd: '¡PINCHA!', how: 'Frota el disco adelante y atrás: cada cambio de sentido es un scratch', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'brass', v: .55, n: 'E4 . . . . . E4 . . . G4 . . . E4 . E4 . . . . . E4 . . . B4 . A4 . G4 .' },
    { i: 'bass', v: .9, n: 'E2 . . E2 . . E3 . D2 . . D2 . . D3 . C2 . . C2 . . C3 . B1 . . B1 . D2 E2 .' },
    { i: 'd', v: .85, n: 'k . h r s . h k . k h r s . h h k . h r s . h k . k h r s s s s' }] }),
  init(g) {
    g.need = [7, 10, 13][g.level - 1]; g.count = 0; g.hype = 0;
    g.ang = 0; g.acc = 0; g.dir = 0; g.last = null; g.wiki = []; g.flash = 0;
    g.cx = 150; g.cy = 132;
  },
  update(g, dt) {
    g.flash = Math.max(0, g.flash - dt * 4); g.hype = lerp(g.hype, g.count / g.need, .1);
    const on = IN.down && dist(IN.x, IN.y, g.cx, g.cy) < 62;
    if (on) {
      // the record follows the hand; a reversal after enough travel is one scratch
      const a = Math.atan2(IN.y - g.cy, IN.x - g.cx);
      if (g.last != null) {
        let da = angDiff(g.last, a); if (dist(IN.x, IN.y, g.cx, g.cy) < 12) da = 0;
        const lin = Math.abs(IN.dx) > Math.abs(IN.dy) ? IN.dx : IN.dy, mv = Math.abs(da) > .002 ? da * 40 : lin;
        g.ang += da || lin * .02;
        const d = sgn(mv);
        if (d !== 0) {
          if (d !== g.dir && g.acc > 7 && g.dir !== 0 && g.state === 'play') {
            g.count++; g.flash = 1; HITSTOP = 1;
            sfx('scratch', { pitch: .8 + Math.min(.8, Math.abs(IN.vx + IN.vy) / 1200) + (g.count % 2) * .15 }); buzz(6);
            g.wiki.push({ x: IN.x, y: IN.y - 10, t: 0, s: pick(['¡WIKI!', '¡WAKA!', '¡ZIKI!', '¡WUB!']) });
            if (g.count >= g.need) { g.win(); sfx('slam'); for (let i = 0; i < 30; i++) g.fx.add({ k: 'conf', x: g.r(SW), y: g.r(-10, 40), vx: g.r(-30, 30), vy: g.r(20, 90), g: 60, life: 1.6, c: pick(['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff', '#ffffff']), rot: g.r(TAU), vr: g.r(-8, 8) }); }
            g.acc = 0;
          }
          if (d !== g.dir) g.acc = 0;
          g.dir = d; g.acc += Math.abs(mv) * (Math.abs(da) > .002 ? .06 : 1) + Math.hypot(IN.dx, IN.dy) * .5;
        }
      }
      g.last = a;
    } else { g.last = null; g.ang += dt * 3.5; }
    for (const w of g.wiki) w.t += dt;
    g.wiki = g.wiki.filter(w => w.t < .6);
  },
  draw(g, c) {
    // club behind the booth
    bandsV(c, 0, 0, SW, 80, ['#2a1052', '#3b1a6a', '#5a2a9a', '#8f4fd0']);
    rizosDiscoBall(c, 128, 12, 9, g.t);
    rizosBeams(c, g.t, g.b); rizosSpecks(c, g.t, 18, 0, 0, SW, 76);
    rizosCrowd(c, g.t, g.hype, g.b);
    if (g.flash > 0) { c.globalAlpha = g.flash * .25; rect(c, 0, 0, SW, 80, pick(['#ff4fa3', '#4ff2ff', '#fff04f'])); c.globalAlpha = 1; }
    // DJ Rizos himself behind the booth, headphones on, dancing on every scratch
    const pose = g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : g.count % 2 ? 'dance2' : 'dance1';
    const rx = 44, ry = 150 - Math.abs(Math.sin(g.b * Math.PI)) * 2;
    rizosDraw(c, rx, ry, pose, { ex: g.state === 'won' ? 'love' : g.state === 'lost' ? 'shock' : g.flash > .3 ? 'grin' : 'cool', noPop: true });
    const hy = ry - 128 + 44 - 30;
    for (let a = Math.PI * 1.08; a < Math.PI * 1.92; a += .03) { const x = rx + Math.cos(a) * 34, y = hy + 18 + Math.sin(a) * 30; disc(c, x, y, 2, INK); }
    for (let a = Math.PI * 1.08; a < Math.PI * 1.92; a += .03) { const x = rx + Math.cos(a) * 34, y = hy + 18 + Math.sin(a) * 30; px(c, x, y, '#4ff2ff'); }
    for (const sx of [-1, 1]) { panel(c, rx + sx * 34 - 6, hy + 12, 12, 16, '#ff3d8b', { r: 3, line: INK, hi: '#ff8fbd' }); }
    // the booth
    rect(c, 0, 78, SW, 114, INK); rect(c, 0, 79, SW, 2, RAMP.steel[4]); rect(c, 0, 81, SW, 111, '#2b2540');
    for (let x = 4; x < SW; x += 6) px(c, x, 188, '#3d3656');
    // mixer on the left: faders, knobs and a VU meter dancing with the hype
    panel(c, 8, 90, 66, 94, '#3d3656', { r: 4, line: INK, hi: '#5f5883' });
    for (let i = 0; i < 3; i++) { rect(c, 18 + i * 18, 102, 3, 50, INK); const fy = 142 - (i === 1 ? g.hype * 36 : 18 + Math.sin(g.t * 3 + i) * 10); rect(c, 14 + i * 18, fy, 11, 6, '#cfd6e8'); rect(c, 14 + i * 18, fy + 2, 11, 1, INK); }
    for (let i = 0; i < 3; i++) { disc(c, 22 + i * 18, 164, 5, INK); disc(c, 22 + i * 18, 164, 4, '#6b6977'); const a = g.t * (i + 1) + i; linePx(c, 22 + i * 18, 164, 22 + i * 18 + Math.cos(a) * 3, 164 + Math.sin(a) * 3, '#ffffff'); }
    for (let j = 0; j < 8; j++) { const lit = j < 1 + g.hype * 7 + Math.abs(Math.sin(g.t * 9)) * 1.5; rect(c, 62, 170 - j * 7, 6, 5, lit ? (j > 5 ? '#ff4060' : j > 3 ? '#fff04f' : '#4fff9a') : '#2b2540'); }
    // the deck: platter, record, tonearm
    disc(c, g.cx, g.cy, 66, INK); disc(c, g.cx, g.cy, 65, RAMP.steel[2]); disc(c, g.cx - 2, g.cy - 2, 62, RAMP.steel[3]);
    for (let a = 0; a < TAU; a += TAU / 36) px(c, g.cx + Math.cos(a) * 64, g.cy + Math.sin(a) * 64, INK);
    drawS(c, rizosRecordSpr(), g.cx, g.cy, { rot: g.ang });
    // shine on the vinyl (stays put while the record turns)
    c.globalAlpha = .3; for (let r = 24; r < 58; r += 3) for (let a = -2.4; a < -1.6; a += .08) px(c, g.cx + Math.cos(a) * r, g.cy + Math.sin(a) * r, '#ffffff'); c.globalAlpha = 1;
    rect(c, 232, 80, 10, 10, INK); disc(c, 237, 85, 4, RAMP.steel[4]);
    thickLine(c, 237, 85, 214, 150, 2, INK); thickLine(c, 237, 85, 214, 150, 1, RAMP.steel[4]); rect(c, 208, 148, 10, 6, INK); rect(c, 209, 149, 8, 4, '#ff3d8b');
    // ‹ › chevrons: the record wants to go back and forth
    if (g.count < 2 && g.state === 'play') { const k = (g.t * 3) % 1; for (const sgn2 of [-1, 1]) for (let q = 0; q < 2; q++) { const x = g.cx + sgn2 * (74 + k * 5 + q * 5), y = g.cy; linePx(c, x, y - 5, x + sgn2 * 4, y, '#fff04f'); linePx(c, x + sgn2 * 4, y, x, y + 5, '#fff04f'); } }
    for (const w of g.wiki) { txt(c, w.s, w.x, w.y - w.t * 30, ['#ff4fa3', '#4ff2ff', '#fff04f'][fl(w.t * 10) % 3], { align: 'c', out: INK, bold: true }); }
    txt(c, 'SCRATCH ' + Math.min(g.count, g.need) + '/' + g.need, 8, 82, '#ffffff', { out: INK, bold: true });
    if (g.state === 'won') shout(c, '¡OTRA, OTRA!', 128, 26, g.t - g.decidedAt);
    if (g.state === 'lost') { txt(c, 'Buuu…', 128, 26, '#b3b8d4', { align: 'c', out: INK, bold: true }); }
  },
  hint(g) { return { x: g.cx + 30, y: g.cy - 28 }; },
  bot(g) { const ph = Math.sin(g.t * 20); return { x: g.cx + 36 + ph * 16, y: g.cy - 30, down: g.t > .2 && g.state === 'play' }; },
});

// ---------------------------------------------------------------- 4 ESPEJO --
// after his bath the salon mirror is all steamed up: wipe it to see who's there
function rizosClothSpr() {
  return mdl('rizosCloth', () => {
    const c = mkCanvas(28, 22), g = c.g;
    polyPx(g, [[2, 4], [24, 1], [27, 17], [5, 21]], INK); polyPx(g, [[3, 5], [23, 2], [25, 16], [6, 19]], '#63a0ef');
    for (let i = 0; i < 5; i++) linePx(g, 5 + i * 4, 4, 7 + i * 4, 18, '#b3d9ff');
    linePx(g, 4, 5, 22, 2, '#dff4ff');
    return c;
  });
}
defMG({
  id: 'espejo', stage: 'rizos', name: 'Espejo empañado', cmd: '¡LIMPIA!', how: 'Frota el vaho del espejo hasta ver quién hay detrás', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'vib', v: .6, n: 'E5 . G5 . B5 . . . A5 . G5 . E5 . . . D5 . F5 . A5 . . . G5 - - - . . . .' },
    { i: 'pad', v: .42, n: 'C4+E4+G4+B4 - - - - - - - A3+C4+E4+G4 - - - - - - - D4+F4+A4+C5 - - - - - - - G3+B3+D4+F4 - - - - - - -' },
    { i: 'bass', v: .85, n: 'C3 . . C3 . . G2 . A2 . . A2 . . E2 . D3 . . D3 . . A2 . G2 . . G2 . . B2 .' },
    { i: 'd', v: .6, n: 'k . z . k+c . z z k . z . k+c . z . k . z . k+c . z z k . z . k+c z c c' }] }),
  init(g) {
    g.need = [.56, .66, .74][g.level - 1]; g.regrow = [0, 0, .07][g.level - 1];
    g.rub = rubTracker(); g.mx = 60; g.my = 26; g.mw = 136; g.mh = 116;
    g.cw = g.mw / 4; g.ch = g.mh / 4; g.fog = new Float32Array(g.cw * g.ch).fill(1); g.clear = 0; g.saidHi = false;
    g.drips = []; g.cx = 180; g.cy = 150; g.crot = 0;
    // a heart doodled in the steam
    for (let i = 0; i < g.fog.length; i++) { const x = i % g.cw, y = fl(i / g.cw); const dx = (x - g.cw * .76) / 4, dy = (y - g.ch * .2) / 4; const hv = Math.pow(dx * dx + dy * dy - 1, 3) - dx * dx * dy * dy * dy; if (Math.abs(hv) < .09) g.fog[i] = .45; }
  },
  update(g, dt) {
    const over = IN.down && IN.x > g.mx - 6 && IN.x < g.mx + g.mw + 6 && IN.y > g.my - 6 && IN.y < g.my + g.mh + 6;
    if (IN.down) { g.cx = lerp(g.cx, IN.x, .6); g.cy = lerp(g.cy, IN.y, .6); g.crot = lerp(g.crot, clamp(IN.vx / 800, -.5, .5), .25); }
    const gain = g.rub.update(dt, over);
    if (g.regrow && g.state === 'play') for (let i = 0; i < g.fog.length; i++) g.fog[i] = Math.min(1, g.fog[i] + g.regrow * dt);
    if (gain > 0 && g.state === 'play') {
      const cx = (IN.x - g.mx) / 4, cy = (IN.y - g.my) / 4, R = 4.4;
      for (let y = fl(cy - R); y <= cy + R; y++) for (let x = fl(cx - R); x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= g.cw || y >= g.ch) continue;
        const d = Math.hypot(x + .5 - cx, y + .5 - cy); if (d > R) continue;
        const i = y * g.cw + x; g.fog[i] = Math.max(0, g.fog[i] - gain * .03 * (1 - d / R * .7));
      }
      // condensation runs down from where you wiped
      if (FRAME % 5 === 0 && g.drips.length < 40) g.drips.push({ x: IN.x + g.r(-8, 8), y: IN.y + 4, v: g.r(14, 30), L: g.r(3, 7) });
    }
    for (const d of g.drips) { d.y += d.v * dt; }
    g.drips = g.drips.filter(d => d.y < g.my + g.mh);
    let clr = 0; for (let i = 0; i < g.fog.length; i++) clr += 1 - g.fog[i];
    g.clear = clr / g.fog.length;
    if (g.clear > .35 && !g.saidHi) { g.saidHi = true; sfx('heart', { pitch: 1.2 }); }
    if (g.clear >= g.need && g.state === 'play') { g.win(); sfx('sparkle'); g.fx.burst(128, 70, 16, { k: 'star', c: ['#fff', C.yellow, RIZOS_NEON.pink], sp0: 50, sp1: 140 }); }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#dce7ea'); subwayTiles(c, 0, 0, SW, SH);
    const { mx, my, mw, mh } = g;
    // the reflection: Rizos, fluffy and fabulous, in front of the salon's green wall
    c.save(); c.beginPath(); c.rect(mx, my, mw, mh); c.clip();
    greenWall(c, mx, my, mw, mh);
    const ex = g.state === 'won' ? 'love' : g.clear > .35 ? 'grin' : 'cool';
    drawS(c, rizosHead(ex), mx + mw / 2 + Math.sin(g.t * 2) * 2, my + mh - 30, { ax: .5, ay: .8 });
    rect(c, mx + mw / 2 - 20, my + mh - 20, 40, 20, RIZOS_SHIRT[3]); ringRect(c, mx + mw / 2 - 20, my + mh - 20, 40, 21, 1, RIZOS_SHIRT[1]);
    // glass glint across the cleaned parts
    c.globalAlpha = .35; for (let i = 0; i < 3; i++) linePx(c, mx + 20 + i * 8 + g.clear * 40, my, mx - 10 + i * 8 + g.clear * 40, my + mh, '#ffffff'); c.globalAlpha = 1;
    // steam: thicker towards the bottom, with beads of condensation
    const cols = ['#f2f7f9', '#e1ecf1', '#cfdfe6'];
    for (let y = 0; y < g.ch; y++) for (let x = 0; x < g.cw; x++) {
      const v = g.fog[y * g.cw + x]; if (v < .1) continue;
      const lvl = Math.min(4, Math.ceil(v * 4)), col = y > g.ch * .7 ? cols[1] : (x + y) % 7 === 0 ? cols[2] : cols[0];
      c.drawImage(rizosDitherTile(col, lvl), mx + x * 4, my + y * 4);
      if (v > .9 && hash2(x, y, 7) < .06) { px(c, mx + x * 4 + 1, my + y * 4 + 1, '#ffffff'); px(c, mx + x * 4 + 2, my + y * 4 + 2, '#b9cad0'); }
    }
    for (const d of g.drips) { vline(c, d.x, d.y - d.L, d.y, '#b3d9ff'); px(c, d.x, d.y + 1, '#ffffff'); }
    c.restore();
    // steam curling up from below
    for (let i = 0; i < 7; i++) { const ph = (g.t * .6 + i * .14) % 1, x = 40 + i * 30 + Math.sin(g.t * 2 + i) * 8, y = 190 - ph * 70; c.globalAlpha = (1 - ph) * .5; disc(c, x, y, 6 + ph * 8, '#ffffff'); c.globalAlpha = 1; }
    drawPortalFrame(c, 'mirror', mx, my, mw, mh, g.b);
    // the cloth in your hand
    drawS(c, rizosClothSpr(), g.cx, g.cy, { rot: g.crot, alpha: IN.down ? 1 : .7 });
    if (g.state === 'won') shout(c, '¡GUAPÍSIMO!', 196, 40, g.t - g.decidedAt);
    // clear-o-meter as a gold tag under the frame
    panel(c, SW / 2 - 40, 170, 80, 16, '#fff8e6', { r: 4 }); txt(c, 'LIMPIO ' + fl(Math.min(1, g.clear / g.need) * 100) + '%', SW / 2, 175, INK, { align: 'c', bold: true });
  },
  hint(g) { return { x: g.mx + g.mw / 2, y: g.my + g.mh / 2 }; },
  bot(g) {
    // wipe row by row across the glass
    const row = fl(g.t * 3.2) % 7, dir = row % 2 ? -1 : 1, ph = (g.t * 3.2) % 1;
    return { x: 128 + dir * (ph - .5) * 120 + Math.sin(g.t * 55) * 8, y: g.my + 10 + row * 16 + Math.cos(g.t * 47) * 5, down: g.t > .2 && g.state === 'play' };
  },
});

// ---------------------------------------------------------------- 5 RASCAR --
// Rizos belly-up on a shaggy rug: short bent paws in the air (pink beans), a
// cream tummy, one hind leg tucked and the other one — its own sprite — kicking.
function rizosBellyUp() {
  return mdl('rizosBelly2', () => {
    const F = RIZOS_FUR, cream = RAMP.cream;
    const bodyS = SD.ellipse(118, 114, 56, 25), body = SD.curls(bodyS, 1.5, .55, 4);
    const belly = SD.ellipse(114, 104, 36, 13);
    const fl1 = SD.curls(SD.curve([146, 100], [158, 84], [150, 72], 6.5, 5.5), 1, .8, 2), fp1 = SD.curls(SD.ellipse(149, 69, 7, 5.5), .8, .9, 3);
    const fl2 = SD.curls(SD.curve([160, 104], [174, 90], [168, 78], 6.5, 5.5), 1, .8, 5), fp2 = SD.curls(SD.ellipse(167, 75, 7, 5.5), .8, .9, 6);
    const hl = SD.curls(SD.curve([80, 104], [68, 84], [80, 72], 8, 6), 1.1, .8, 8), hp = SD.curls(SD.ellipse(83, 70, 8, 6), .9, .9, 9);
    const tail = SD.curls(SD.circle(58, 120, 10), 1.6, .8, 2);
    const tx = clumpTex(3.6, .38, 21, 1, 1.2), tx2 = clumpTex(3, .3, 22, 1, 1);
    return model(SW, 170, [
      { f: tail, ramp: F, z: 0, th: 6, tex: tx2 },
      { f: hl, ramp: F, z: .4, th: 6, tex: tx2 }, { f: hp, ramp: F, z: .5, th: 5, amb: .38 },
      { f: body, fs: bodyS, ramp: F, z: 1, th: 22, tex: tx },
      { f: belly, ramp: cream, z: 1.4, th: 12, tex: (x, y) => (hash2(fl(x), fl(y), 3) - .5) * .1, edge: false, out: false },
      { f: fl1, ramp: F, z: 1.6, th: 6, tex: tx2 }, { f: fp1, ramp: F, z: 1.7, th: 5, amb: .38 },
      { f: fl2, ramp: F, z: 1.8, th: 6, tex: tx2 }, { f: fp2, ramp: F, z: 1.9, th: 5, amb: .38 },
    ], { post: g => {
      for (const [x, y] of [[149, 68], [167, 74], [83, 69]]) { disc(g, x, y + 1, 2.2, RAMP.pink[2]); for (const [dx, dy] of [[-3, -3], [0, -4], [3, -3]]) px(g, x + dx, y + dy, RAMP.pink[2]); }
      for (let i = 0; i < 6; i++) px(g, 100 + (i % 3) * 12, 102 + fl(i / 3) * 7, RAMP.pink[3]);
      disc(g, 112, 108, 1.6, RAMP.cream[1]); // belly button
    } });
  });
}
function rizosKickLeg() {
  return mdl('rizosKickLeg2', () => {
    const F = RIZOS_FUR, thigh = SD.curls(SD.ellipse(12, 40, 12, 10), 1.2, .8, 2), leg = SD.curls(SD.capsule(14, 36, 38, 14, 7, 6), 1.1, .8, 3), paw = SD.curls(SD.ellipse(42, 11, 8.5, 7), 1, .9, 5);
    return model(56, 54, [{ f: thigh, ramp: F, z: 0, th: 8, tex: clumpTex(3.4, .34, 24, 1, 1.1) }, { f: leg, ramp: F, z: 1, th: 6, tex: clumpTex(3, .3, 23, 1, 1) }, { f: paw, ramp: F, z: 2, th: 5, amb: .36 }], { post: g => { disc(g, 43, 12, 2.4, RAMP.pink[2]); for (const [dx, dy] of [[-3, -4], [1, -5], [4, -3]]) px(g, 43 + dx, 12 + dy, RAMP.pink[2]); } });
  });
}
function rizosRug() {
  return mdl('rizosRug', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, SH, ['#2a1052', '#3b1a6a', '#4a2590']);
    // a big shaggy purple rug
    ellipsePx(g, 128, 142, 128, 50, INK); ellipsePx(g, 128, 141, 126, 48, '#8959c5');
    for (let i = 0; i < 900; i++) { const a = hash2(i, 1) * TAU, r = Math.sqrt(hash2(1, i)); const x = 128 + Math.cos(a) * r * 122, y = 141 + Math.sin(a) * r * 45; vline(g, x, y, y + 2, hash2(i, 7) < .5 ? '#bf95e9' : '#5a3396'); }
    return c;
  });
}
defMG({
  id: 'rascar', stage: 'rizos', name: 'Gustito en la barriga', cmd: '¡RASCA!', how: 'Frota la barriga justo en el círculo rojo, donde le pica: ¡verás la pata!', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'squeak', v: .6, n: 'G5 . . G5 . A5 . B5 . . D6 . . B5 . G5 . . G5 . A5 . B5 . . A5 . G5 . . E5 .' },
    { i: 'bass', v: .85, n: 'G2 . G3 . G2 . G3 . C3 . C4 . C3 . C4 . G2 . G3 . G2 . G3 . D3 . D4 . D3 . D4 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM + ' ' + RIZOS_DRUM2 }] }),
  init(g) {
    g.need = [1, 1, 1][g.level - 1]; g.joy = 0; g.kick = 0; g.kickA = 0; g.rub = rubTracker();
    g.rad = [20, 16, 13][g.level - 1];
    g.sx = g.r(98, 136); g.sy = g.r(114, 124); g.tsx = g.sx; g.tsy = g.sy; g.hopT = 1.1;
    g.rate = [1 / 560, 1 / 700, 1 / 800][g.level - 1];
  },
  update(g, dt) {
    // the itch wanders (level 2) or jumps around (level 3)
    if (g.level === 2) { g.tsx = 118 + Math.sin(g.t * 1.3 * g.tempo) * 24; g.tsy = 119 + Math.cos(g.t * 1.1 * g.tempo) * 6; }
    if (g.level === 3) { g.hopT -= dt * g.tempo; if (g.hopT <= 0) { g.hopT = g.r(.8, 1.1); g.tsx = g.r(92, 146); g.tsy = g.r(112, 128); sfx('boing', { pitch: 2, vol: .3 }); } }
    g.sx = lerp(g.sx, g.tsx, .15); g.sy = lerp(g.sy, g.tsy, .15);
    const on = IN.down && dist(IN.x, IN.y, g.sx, g.sy) < g.rad + 6;
    const gain = g.rub.update(dt, on);
    if (gain > 0 && g.state === 'play') {
      g.joy = Math.min(1, g.joy + gain * g.rate); g.kick = Math.min(1, g.kick + gain * .012);
      if (fl(g.t * 20) % 4 === 0) g.fx.add({ k: 'heart', x: g.sx + g.r(-10, 10), y: g.sy - 10, vx: g.r(-20, 20), vy: g.r(-60, -30), life: .7, c: '#ff4060' });
      if (g.joy >= g.need) { g.win(); sfx('heart'); sfx('bark', { pitch: 1.3, n: 2 }); for (let i = 0; i < 10; i++) g.fx.add({ k: 'heart', x: 200 + g.r(-20, 20), y: 80, vx: g.r(-40, 40), vy: g.r(-80, -30), life: 1.2, c: pick(['#ff4060', '#ff93bf']) }); }
    }
    g.kick = Math.max(0, g.kick - dt * (g.state === 'won' ? 0 : .9));
    g.kickA += dt * (4 + g.kick * 40 + (g.state === 'won' ? 30 : 0));
    if (g.kick > .3 && fl(g.kickA / Math.PI) !== fl((g.kickA - dt * (4 + g.kick * 40)) / Math.PI)) sfx('tick', { pitch: 1.6 + g.kick, vol: .4 });
  },
  draw(g, c) {
    c.drawImage(rizosRug(), 0, 0);
    rizosSpecks(c, g.t, 14, 0, 0, SW, 90);
    // the kicking hind leg (the famous reflex), behind the body
    const a = Math.sin(g.kickA) * (.15 + g.kick * .6);
    drawS(c, rizosKickLeg(), 98, 128, { ax: .2, ay: .75, rot: -1.2 + a, flip: true });
    if (g.kick > .35) for (let i = 0; i < 3; i++) { const an = -2.4 - a + i * .25; linePx(c, 98 + Math.cos(an) * 46, 124 + Math.sin(an) * 46, 98 + Math.cos(an) * 54, 124 + Math.sin(an) * 54, '#ffffff'); }
    c.drawImage(rizosBellyUp(), 0, 16);
    // head at the right, lying on its side, tongue out
    const ex = g.state === 'won' ? 'love' : g.state === 'lost' ? 'itch' : g.joy > .5 ? 'grin' : 'itch';
    drawS(c, rizosHead(ex), 200, 124, { rot: -1.45 + Math.sin(g.t * 3) * .05 });
    // the itchy spot
    if (g.state !== 'won') {
      const p = 1 + Math.sin(g.t * 12) * .12, R = g.rad * p;
      ringPx(c, g.sx, g.sy, R, '#ff4060'); ringPx(c, g.sx, g.sy, R - 1, '#ffa39a'); ringPx(c, g.sx, g.sy, R * .5, '#ff4060');
      for (let i = 0; i < 4; i++) { const an = i / 4 * TAU + g.t * 2; linePx(c, g.sx + Math.cos(an) * (R + 3), g.sy + Math.sin(an) * (R + 3), g.sx + Math.cos(an) * (R + 7), g.sy + Math.sin(an) * (R + 7), '#ffffff'); }
      txt(c, '!', g.sx, g.sy - R - 12 + Math.sin(g.t * 10) * 2, '#ff4060', { align: 'c', out: '#ffffff', bold: true });
    }
    // gustómetro: a row of hearts filling up
    for (let i = 0; i < 5; i++) { const on = g.joy * 5 > i + .5; drawHeart(c, 88 + i * 20, 18, on ? '#ff4060' : '#5a3396', 1.4); if (on) px(c, 86 + i * 20, 15, '#ffffff'); }
    if (g.state === 'won') shout(c, '¡QUÉ GUSTAZO!', 128, 44, g.t - g.decidedAt);
    else if (g.kick > .5) txt(c, '¡AHÍ, AHÍ!', g.sx, g.sy + 24, '#ffffff', { align: 'c', out: INK, bold: true });
  },
  hint(g) { return { x: g.sx, y: g.sy }; },
  bot(g) { return { x: g.sx + Math.sin(g.t * 40) * Math.min(12, g.rad - 3), y: g.sy + Math.cos(g.t * 33) * 4, down: g.t > .2 && g.state === 'play' }; },
});

// ---------------------------------------------------------------- 6 CEPILLA -
// (from the user's own WarioWare parody) a long-haired cream dog on the grooming
// table: brush the knots out of its coat until it goes silky.
const RIZOS_MOPA_MATTED = ['#5e4428', '#8f6d40', '#bf9d66', '#dfc692', '#f1e3bf'];
const RIZOS_MOPA_SILKY = ['#8c7856', '#c7b085', '#ead8ae', '#fff2d3', '#ffffff'];
// a long-haired cream bichon: round head with a fringe, curtain ears, a seated
// body under a flowing skirt of hair, two front paws peeping out.
function rizosMopaBase(silky) {
  return mdl('rizosMopa2:' + (silky ? 's' : 'm'), () => {
    const F = silky ? RIZOS_MOPA_SILKY : RIZOS_MOPA_MATTED, rough = silky ? 0 : 1;
    const locks = clumpTex(4.2, silky ? .2 : .3, silky ? 41 : 43, 3.2, .6);
    const tex = (x, y) => locks(x, y) + (silky ? Math.sin(x * .9 + Math.sin(y * .07) * 2) * .05 : (fbm(x * .12, y * .12, 5) - .5) * .25);
    const headS = SD.ellipse(55, 38, 25, 22);
    const head = SD.shag(SD.tufts(headS, 55, 34, 1.6 + rough * 1.4, 18, 1.3, 1.5), .5 + rough * .8, .25, 7);
    const knotS = SD.ellipse(55, 15, 8, 7), knot = SD.tufts(knotS, 55, 15, 1.4, 9, .4, 1.6);
    const bodyS = SD.smooth(9, SD.ellipse(55, 84, 29, 25), SD.box(55, 104, 34, 13, 8));
    const body = SD.shag(SD.tufts(bodyS, 55, 80, 1.6 + rough * 1.6, 30, 2, 2.2), .5 + rough, .22, 3);
    const earL = SD.shag(SD.curve([31, 32], [22, 60], [24, 92], 10, 7), .5 + rough * .8, .25, 5);
    const earR = SD.shag(SD.curve([79, 32], [88, 60], [86, 92], 10, 7), .5 + rough * .8, .25, 9);
    const muzzle = SD.ellipse(55, 50, 11, 8.5);
    const pawL = SD.ellipse(44, 113, 7, 4.5), pawR = SD.ellipse(66, 113, 7, 4.5);
    return model(110, 120, [
      { f: pawL, ramp: F, z: 0, th: 4 }, { f: pawR, ramp: F, z: 0, th: 4 },
      { f: body, fs: bodyS, ramp: F, z: 1, th: 22, tex },
      { f: earL, ramp: F, z: 1.6, th: 8, tex }, { f: earR, ramp: F, z: 1.6, th: 8, tex },
      { f: knot, fs: knotS, ramp: F, z: 1.8, th: 6, tex },
      { f: head, fs: headS, ramp: F, z: 2, th: 16, tex },
      { f: muzzle, ramp: F, z: 2.5, th: 7, amb: .42, tex: (x, y) => tex(x, y) * .5 },
      { f: SD.ellipse(55, 47, 5.2, 3.8), ramp: RAMP.black, z: 3, th: 3, gloss: true },
    ], { post: g => {
      if (silky) for (let i = 0; i < 7; i++) { const x = 32 + i * 8; linePx(g, x, 70 + (i % 3) * 4, x + 2, 100 + (i % 2) * 6, F[4]); }
    } });
  });
}
function rizosMopa(face, silky) {
  return mdl('rizosMopaF2:' + face + (silky ? 's' : 'm'), () => {
    const base = rizosMopaBase(silky), c = mkCanvas(base.width, base.height), g = c.g;
    g.drawImage(base, 0, 0);
    const F = silky ? RIZOS_MOPA_SILKY : RIZOS_MOPA_MATTED, K = RAMP.black[0];
    if (face === 'grump' || face === 'wince') {
      // messy fringe hanging over the eyes, a grumpy little mouth
      for (let i = 0; i < 13; i++) { const x = 36 + i * 3; linePx(g, x, 24 + (i % 3), x + (i < 7 ? -2 : 2), 38 + (i % 2) * 2, i % 2 ? F[1] : F[2]); }
      if (face === 'wince') { linePx(g, 43, 36, 48, 38, K); linePx(g, 62, 38, 67, 36, K); } else { hline(g, 44, 48, 38, K); hline(g, 62, 66, 38, K); }
      hline(g, 52, 58, 54, K); px(g, 51, 55, K); px(g, 59, 55, K);
    } else {
      // brushed: the fringe parts, happy closed eyes, rosy cheeks, a smile — and a bow
      for (let i = 0; i < 5; i++) { linePx(g, 40 + i * 2, 24 + i, 35 + i * 2, 36, F[2]); linePx(g, 70 - i * 2, 24 + i, 75 - i * 2, 36, F[2]); }
      for (const ex of [45, 65]) { px(g, ex - 2, 38, K); hline(g, ex - 1, ex + 1, 37, K); px(g, ex + 2, 38, K); }
      for (const bx of [39, 71]) ellipsePx(g, bx, 44, 3.2, 1.8, '#ff9db4');
      hline(g, 51, 59, 53, K); rect(g, 52, 54, 7, 4, RAMP.pink[2]); hline(g, 53, 57, 57, RAMP.pink[1]);
      // pink bow on the topknot
      const bx = 55, by = 12;
      polyPx(g, [[bx, by], [bx - 9, by - 5], [bx - 9, by + 5]], INK); polyPx(g, [[bx, by], [bx + 9, by - 5], [bx + 9, by + 5]], INK);
      polyPx(g, [[bx, by], [bx - 8, by - 4], [bx - 8, by + 4]], '#ff5d9e'); polyPx(g, [[bx, by], [bx + 8, by - 4], [bx + 8, by + 4]], '#ff5d9e');
      px(g, bx - 6, by - 2, '#ffd1e4'); px(g, bx + 5, by - 2, '#ffd1e4'); disc(g, bx, by, 2.2, INK); disc(g, bx, by, 1.4, '#ffd1e4');
    }
    return c;
  });
}
// the big orange paddle brush of the video (cepilla): bristles at the top edge
function rizosPaddleSpr() {
  return mdl('rizosPaddle3', () => {
    const c = mkCanvas(38, 40), g = c.g;
    // handle
    panel(g, 15, 18, 9, 21, '#e56f1d', { r: 3, line: INK, hi: '#ff9f4f', lo: '#9c410f' });
    rect(g, 18, 22, 2, 14, '#ff9f4f');
    // paddle head
    panel(g, 1, 6, 36, 17, '#e56f1d', { r: 6, line: INK, hi: '#ffb070', lo: '#9c410f' });
    rect(g, 5, 9, 28, 10, '#ffd49b'); ringRect(g, 5, 9, 28, 10, 1, '#c0501a');
    for (let x = 7; x < 32; x += 3) for (let y = 11; y < 18; y += 3) px(g, x, y, '#9c410f');
    // bristle tips poking out of the top
    for (let x = 5; x < 34; x += 2) { vline(g, x, 1, 6, INK); px(g, x, 1, '#ffe45c'); px(g, x, 2, '#fff7ae'); }
    return c;
  });
}
function rizosBrushSpr() {
  // the video's brush: long wooden handle, red head, yellow bristles (pointing down-left)
  return mdl('rizosBrush2', () => {
    const c = mkCanvas(40, 26), g = c.g;
    // handle
    thickLine(g, 16, 12, 37, 3, 3.6, INK); thickLine(g, 16, 12, 37, 3, 2.6, '#a8713c'); linePx(g, 18, 10, 35, 3, '#cf9759');
    // head
    polyPx(g, [[2, 10], [18, 5], [22, 14], [5, 20]], INK); polyPx(g, [[3, 10], [17, 6], [20, 13], [6, 18]], '#c02d45'); linePx(g, 4, 10, 16, 6, '#ec5e5e');
    // bristles
    for (let i = 0; i < 8; i++) { const x = 5 + i * 2, y = 18 - i * .7; linePx(g, x, y, x - 1, y + 5, i % 2 ? '#ffd23f' : '#fff7ae'); }
    return c;
  });
}
function rizosGroomTableBack(g, t) {
  // the navy backdrop of the video, with a sprinkle of disco specks
  rect(g, 0, 0, SW, SH, '#1f2548');
  for (let y = 0; y < SH; y += 4) for (let x = (y / 4 % 2) * 4; x < SW; x += 8) px(g, x, y, '#252c55');
  rizosSpecks(g, t, 12, 0, 0, SW, 120);
  // grooming arm: pole, bar, loop
  rect(g, 40, 30, 4, 118, INK); rect(g, 41, 31, 2, 116, RAMP.steel[3]);
  rect(g, 40, 28, 64, 4, INK); rect(g, 41, 29, 62, 2, RAMP.steel[3]);
  vline(g, 100, 32, 48, INK); ringPx(g, 100, 54, 6, INK);
  // table top + folding legs
  rect(g, 20, 146, 216, 8, INK); rect(g, 21, 147, 214, 6, '#6b6977'); rect(g, 21, 147, 214, 2, '#9896a4');
  for (const [x0, x1] of [[40, 70], [70, 40], [186, 216], [216, 186]]) { thickLine(g, x0, 154, x1, 190, 1.5, INK); linePx(g, x0, 154, x1, 190, '#9896a4'); }
}
defMG({
  id: 'cepilla', stage: 'rizos', name: 'Cepillado', cmd: '¡CEPILLA!', how: 'Frota los nudos con el cepillo hasta que el pelo quede sedoso', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'C5 . Eb5 . F5 . G5 . . Bb5 . G5 . F5 Eb5 . C5 . Eb5 . F5 . G5 . . C6 . Bb5 . G5 . .' },
    { i: 'bass', v: .9, n: 'C2 . C3 . C2 . C3 . Bb1 . Bb2 . Bb1 . Bb2 . Ab1 . Ab2 . Ab1 . Ab2 . G1 . G2 . Bb1 . B1 .' },
    { i: 'p12', v: .3, n: '. . G4+C5 . . . G4+C5 . . . F4+Bb4 . . . F4+Bb4 . . . Eb4+Ab4 . . . Eb4+Ab4 . . . D4+G4 . . . D4+G4 .' },
    { i: 'd', v: .8, n: RIZOS_DRUM + ' ' + RIZOS_DRUM2 }] }),
  init(g) {
    const n = [3, 4, 4][g.level - 1];
    const spots = [[28, 74], [82, 72], [26, 98], [84, 98], [42, 104], [68, 104], [55, 80]];
    const pick2 = shuffle(spots.slice()).slice(0, n);
    g.knots = pick2.map(([x, y], i) => ({ x, y, hp: 1, wob: g.r(TAU), seed: i * 7 + 3, dir: g.level >= 3 }));
    g.need = [115, 105, 90][g.level - 1] / Math.sqrt(g.tempo);
    g.rub = rubTracker(); g.dogX = 128; g.fid = [0, 10, 12][g.level - 1];
    g.bx = 200; g.by = 120; g.brot = -.6; g.face = 'grump'; g.silky = false; g.relief = 0;
  },
  update(g, dt) {
    g.dogX = 128 + Math.sin(g.t * 3.1 * g.tempo) * g.fid * (g.state === 'play' ? 1 : 0);
    if (IN.down) { g.bx = lerp(g.bx, IN.x, .7); g.by = lerp(g.by, IN.y, .7); g.brot = lerp(g.brot, -.6 + clamp(IN.vx / 700, -.5, .5), .25); }
    const ox = g.dogX - 55, oy = 150 - 120; // dog canvas origin (feet on the table)
    const near = g.knots.find(k => k.hp > 0 && IN.down && dist(IN.x, IN.y, ox + k.x, oy + k.y) < 20);
    const gain = g.rub.update(dt, !!near);
    g.relief = Math.max(0, g.relief - dt * 2);
    if (near && gain > 0 && g.state === 'play') {
      const ok = !near.dir || IN.dy > .4; // level 3: brush down, with the lie of the coat
      if (ok) {
        near.hp -= gain / g.need; near.wob += gain * .05; g.face = 'wince';
        if (FRAME % 3 === 0) g.fx.add({ k: 'hair', x: IN.x + g.r(-6, 6), y: IN.y + g.r(-4, 4), vx: g.r(-40, 40), vy: g.r(-50, 10), g: 60, drag: 1.5, life: g.r(.5, 1), r: g.r(2, 4), c: pick(RIZOS_MOPA_MATTED.slice(1, 4)) });
        if (FRAME % 6 === 0) sfx('rub', { pitch: 1.4 + g.r(.3) });
        if (near.hp <= 0) {
          near.hp = 0; g.relief = 1; HITSTOP = 3; buzz(10); g.shake(1.5, .1);
          const done = g.knots.filter(k => k.hp <= 0).length;
          sfx('pop', { pitch: .9 + done * .15 }); sfx('boingy', { pitch: 1.2 + done * .1, vol: .6 });
          g.fx.burst(ox + near.x, oy + near.y, 14, { k: 'hair', c: RIZOS_MOPA_MATTED.slice(1, 4), sp0: 50, sp1: 150, g: 80, r: 3, life0: .5, life1: 1 });
          g.fx.burst(ox + near.x, oy + near.y, 6, { k: 'star', c: ['#fff', C.yellow], sp0: 40, sp1: 100 });
          g.fx.add({ k: 'txt', s: pick(['¡ZIP!', '¡FUERA!', '¡SUAVE!']), x: ox + near.x, y: oy + near.y - 14, life: .6, c: '#ffffff' });
          if (g.knots.every(k => k.hp <= 0)) { g.win(); g.silky = true; g.face = 'bliss'; sfx('sparkle'); g.fx.burst(g.dogX, 90, 18, { k: 'star', c: ['#ffffff', '#fff27a', RIZOS_NEON.pink], sp0: 50, sp1: 160, life0: .5, life1: 1 }); }
        }
      } else if (FRAME % 20 === 0) g.fx.add({ k: 'txt', s: '↓ a favor del pelo', x: IN.x, y: IN.y - 18, life: .5, c: '#fff27a' });
    } else if (g.state === 'play' && g.relief <= 0) g.face = 'grump';
    for (const k of g.knots) k.wob += dt * 3;
  },
  draw(g, c) {
    rizosGroomTableBack(c, g.t);
    const ox = rd(g.dogX - 55), oy = 30;
    // a soft shadow on the table, then the dog
    shadowOval(c, g.dogX, 148, 46, 3, .5);
    const face = g.state === 'won' ? 'bliss' : g.state === 'lost' ? 'grump' : g.face;
    c.drawImage(rizosMopa(face, g.silky), ox, oy);
    // the knots: tangled hairballs with stray strands; they unravel as you brush
    for (const k of g.knots) {
      if (k.hp <= 0) continue;
      const x = ox + k.x, y = oy + k.y, r = 3 + k.hp * 5, loops = 3 + Math.ceil(k.hp * 5);
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + k.seed + Math.sin(k.wob + i) * .3, L = r + 4 + (i % 3) * 2; linePx(c, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L * .8, i % 2 ? '#5e4428' : '#8f6d40'); }
      for (let i = 0; i < loops; i++) { const a = k.wob * .3 + i * 2.1 + k.seed, rr = 1.5 + (i % 3) * 1.2, xx = x + Math.cos(a) * r * .5, yy = y + Math.sin(a) * r * .45; ringPx(c, xx, yy, rr + .8, '#3d2a14'); ringPx(c, xx, yy, rr, i % 2 ? '#8f6d40' : '#bf9d66'); }
      if (k.dir) { const bob = (g.t * 3) % 1; for (let q = 0; q < 2; q++) { const yy = y - r - 10 + bob * 4 + q * 3; linePx(c, x - 3, yy, x, yy + 3, '#fff27a'); linePx(c, x + 3, yy, x, yy + 3, '#fff27a'); } }
    }
    // the big paddle brush in the hand
    drawS(c, rizosPaddleSpr(), g.bx, g.by, { rot: g.brot + .6, ax: .5, ay: .08 });
    const left = g.knots.filter(k => k.hp > 0).length;
    panel(c, 6, 6, 70, 14, '#ffffff', { r: 4 }); txt(c, 'NUDOS: ' + left, 12, 9, INK, { bold: true });
    if (g.state === 'won') { shout(c, '¡QUÉ SUAVECITO!', 150, 26, g.t - g.decidedAt); if (fl(g.t * 8) % 2) for (let i = 0; i < 4; i++) drawStar(c, g.dogX - 40 + i * 26, 50 + (i % 2) * 40, 3.2, '#ffffff', g.t * 5); }
    if (g.state === 'lost') txt(c, '¡Grrr!', g.dogX, 22, '#ffffff', { align: 'c', out: INK, bold: true });
  },
  hint(g) { const k = g.knots.find(k => k.hp > 0); return k && { x: g.dogX - 55 + k.x, y: 30 + k.y }; },
  bot(g) {
    const ox = g.dogX - 55, oy = 30, k = g.knots.find(k => k.hp > 0);
    if (!k || g.state !== 'play') return { down: false };
    // saw down across the knot; on level 3 only the downward half counts
    const ph = (g.t * 9) % 1, dy = g.level >= 3 ? (ph < .5 ? lerp(-7, 7, ph * 2) : lerp(7, -7, (ph - .5) * 2)) : Math.sin(g.t * 50) * 7;
    return { x: ox + k.x + Math.cos(g.t * 43) * 5, y: oy + k.y + dy, down: g.t > .15 };
  },
});

// ---------------------------------------------------------------- 7 DESPIOJA -
// (from the user's video) a big close-up of fur crawling with lice: sweep them
// off with the brush; then cut to the happy, fluffy dog on the grass.
function rizosFurCloseUp() {
  return mdl('rizosFurClose', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#f6ead0');
    // speckled paper-like fur + light brown strands, as in the video
    for (let i = 0; i < 700; i++) px(g, hash2(i, 3) * SW, hash2(3, i) * SH, hash2(i, 9) < .5 ? '#efdfbf' : '#fbf3e1');
    for (let i = 0; i < 70; i++) {
      const x = hash2(i, 11) * SW, y = hash2(11, i) * SH, a = -1.2 + hash2(i, 5) * .8, L = 14 + hash2(5, i) * 18, bend = (hash2(i, 13) - .5) * 1.2;
      for (let q = 0; q < L; q++) { const k = q / L, xx = x + Math.cos(a + bend * k) * q, yy = y + Math.sin(a + bend * k) * q; px(g, xx, yy, '#e0c28f'); if (q % 3 === 0) px(g, xx + 1, yy, '#d4b17a'); }
    }
    // a soft darker vignette keeps the eye on the middle of the coat
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const d = Math.hypot((x - SW / 2) / (SW / 2), (y - SH / 2) / (SH / 2)); if (d > .78 && bayer(x, y) < (d - .78) * 1.6) px(g, x, y, '#ead6ad'); }
    return c;
  });
}
function rizosLouse(frame, happy) {
  return mdl('rizosLouse2' + frame + (happy ? 'h' : ''), () => {
    const c = mkCanvas(22, 20), g = c.g, K = '#1b1627', up = frame % 2;
    for (const [x0, y0, x1, y1, x2, y2] of [[8, 9, 3, 6, 1, 3 - up], [8, 11, 2, 11, 0, 13], [9, 14, 4, 16, 2, 19 - up], [13, 9, 18, 6, 20, 3 - up], [13, 11, 19, 11, 21, 13], [12, 14, 17, 16, 19, 19 - up]]) { linePx(g, x0, y0, x1, y1, K); linePx(g, x1, y1, x2, y2, K); }
    ellipsePx(g, 10.5, 12, 5.5, 6, K); ellipsePx(g, 10.5, 6.5, 3.8, 3.2, K);
    px(g, 8, 9, '#5f5883'); px(g, 9, 9, '#5f5883'); px(g, 8, 10, '#40395e');
    rect(g, 8, 5, 2, 2, '#ffffff'); rect(g, 12, 5, 2, 2, '#ffffff'); px(g, 9, 6, K); px(g, 13, 6, K);
    linePx(g, 9, 3, 7, 0, K); linePx(g, 12, 3, 14, 0, K);
    if (happy) { px(g, 10, 8, '#ff93bf'); }
    return c;
  });
}
function rizosFluffyOnGrass() {
  return mdl('rizosFluffyGrass', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#dfeaf2');
    for (let i = 0; i < 40; i++) { const x = hash2(i, 2) * SW, y = hash2(2, i) * 110; px(g, x, y, '#ffffff'); }
    // a little patch of grass
    ellipsePx(g, 128, 168, 92, 16, INK); ellipsePx(g, 128, 166, 90, 14, '#5bb54a'); ellipsePx(g, 124, 163, 76, 8, '#7ccf61');
    for (let x = 42; x < 214; x += 3) { const h = 2 + (x * 7 % 4); vline(g, x, 160 - h, 160, x % 2 ? '#4a9a3c' : '#6cc257'); }
    // the fluffy dog, sitting pretty
    const img = rizosMopa('bliss', true); drawS(g, img, 128, 164, { ax: .5, ay: 1, s: 1 });
    return c;
  });
}
defMG({
  id: 'despioja', stage: 'rizos', name: 'Despiojado', cmd: '¡DESPIOJA!', how: 'Barre los piojos del pelo con el cepillo', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'squeak', v: .55, n: 'E5 . E5 G5 . E5 . D5 C5 . . D5 E5 . . . E5 . E5 G5 . A5 . G5 E5 . D5 . C5 . . .' },
    { i: 'bass', v: .9, n: 'A1 . A2 . A1 A2 . A1 D2 . D3 . D2 D3 . D2 A1 . A2 . A1 A2 . A1 E2 . E3 . E2 . G2 .' },
    { i: 'mari', v: .35, n: '. . . A5 . . . A5 . . . A5 . . . A5 . . . A5 . . . A5 . . . B5 . . . B5' },
    { i: 'd', v: .8, n: RIZOS_DRUM2 + ' ' + RIZOS_DRUM }] }),
  init(g) {
    const n = [3, 5, 5][g.level - 1];
    g.lice = [];
    for (let i = 0; i < n; i++) g.lice.push({ x: g.r(40, 216), y: g.r(40, 150), a: g.r(TAU), sp: g.r(14, 26), fr: 0, gone: false, hidden: false, vx: 0, vy: 0, rot: 0, t: 0 });
    if (g.level >= 3) { const h = g.lice[0]; h.hidden = true; h.x = g.r(70, 190); h.y = g.r(70, 130); h.peek = 0; }
    g.flee = g.level >= 2; g.bx = 200; g.by = 150; g.brot = -.5; g.bvx = 0; g.bvy = 0; g.winT = -1; g.count = 0;
  },
  update(g, dt) {
    const px0 = g.bx, py0 = g.by;
    if (IN.down) { g.bx = IN.x; g.by = IN.y; g.brot = lerp(g.brot, -.5 + clamp(IN.vx / 800, -.6, .6), .3); }
    g.bvx = lerp(g.bvx, (g.bx - px0) / dt, .5); g.bvy = lerp(g.bvy, (g.by - py0) / dt, .5);
    const speed = Math.hypot(g.bvx, g.bvy);
    for (const l of g.lice) {
      l.t += dt;
      if (l.gone) { l.x += l.vx * dt; l.y += l.vy * dt; l.vy += 300 * dt; l.rot += dt * 20; continue; }
      if (l.hidden) {
        // buried deep in the fur: brushing nearby parts the coat and reveals it
        if (IN.down && dist(g.bx, g.by, l.x, l.y) < 34 && speed > 60) { l.peek += dt * 3; if (l.peek >= 1) { l.hidden = false; sfx('squeaky', { pitch: 1.8 }); g.fx.add({ k: 'txt', s: '¡AHÍ ESTÁ!', x: l.x, y: l.y - 16, life: .7, c: '#ff4060' }); } }
        continue;
      }
      // wander, and (level 2+) scurry away from the brush
      l.a += (hash2(fl(l.t * 3), fl(l.x)) - .5) * .5;
      let vx = Math.cos(l.a) * l.sp * g.tempo, vy = Math.sin(l.a) * l.sp * g.tempo;
      const d = dist(g.bx, g.by, l.x, l.y);
      if (g.flee && IN.down && d < 46 && d > 1) { vx += (l.x - g.bx) / d * 70 * g.tempo; vy += (l.y - g.by) / d * 70 * g.tempo; }
      l.x += vx * dt; l.y += vy * dt;
      if (l.x < 20 || l.x > 236) { l.a = Math.PI - l.a; l.x = clamp(l.x, 20, 236); }
      if (l.y < 30 || l.y > 170) { l.a = -l.a; l.y = clamp(l.y, 30, 170); }
      l.fr += dt * (8 + Math.hypot(vx, vy) * .2);
      // a quick sweep over it flicks it off
      if (g.state === 'play' && IN.down && speed > 120 && segDist(l.x, l.y, px0, py0, g.bx, g.by) < 16) {
        l.gone = true; l.vx = g.bvx * .5 + g.r(-60, 60); l.vy = Math.min(-120, g.bvy * .4 - 160); g.count++;
        HITSTOP = 2; buzz(8); g.shake(1.5, .08);
        sfx('coin', { pitch: .9 + g.count * .12 }); sfx('squeaky', { pitch: 1.5 });
        g.fx.burst(l.x, l.y, 10, { k: 'star', c: ['#ff4060', '#ffd23f', '#ffffff'], sp0: 50, sp1: 130, life0: .25, life1: .5 });
        g.fx.add({ k: 'txt', s: '¡PING!', x: l.x, y: l.y - 12, life: .5, c: '#ff4060' });
        if (g.lice.every(q => q.gone)) { g.win(); g.winT = g.t; sfx('sparkle'); }
      }
    }
    if (g.state === 'lost' && !g.said) { g.said = true; sfx('whine', { pitch: 1.4 }); }
  },
  draw(g, c) {
    if (g.state === 'won' && g.t - g.winT > .45) {
      // cut to the happy dog on the grass (iris opening)
      const k = clamp((g.t - g.winT - .45) / .35, 0, 1);
      c.drawImage(rizosFurCloseUp(), 0, 0);
      c.save(); c.beginPath(); c.arc(SW / 2, SH / 2, 10 + k * 180, 0, TAU); c.clip(); c.drawImage(rizosFluffyOnGrass(), 0, 0); c.restore();
      if (k >= 1) { shout(c, '¡SIN BICHOS!', 128, 28, g.t - g.winT - .8); for (let i = 0; i < 5; i++) drawStar(c, 60 + i * 34, 64 + Math.sin(g.t * 6 + i) * 6, 3, '#fff27a', g.t * 3); }
      return;
    }
    c.drawImage(rizosFurCloseUp(), 0, 0);
    for (const l of g.lice) {
      if (l.hidden) { const w = Math.sin(g.t * 9 + l.x) > .7; if (w || l.peek > 0) { px(c, l.x - 1, l.y, '#1b1627'); px(c, l.x + 1, l.y, '#1b1627'); if (l.peek > .3) { px(c, l.x - 1, l.y - 1, '#ffffff'); px(c, l.x + 1, l.y - 1, '#ffffff'); } } for (let i = 0; i < 3; i++) linePx(c, l.x - 6 + i * 6, l.y + 4, l.x - 4 + i * 6, l.y - 3, '#e0c28f'); continue; }
      if (l.gone) { if (l.y < 220) drawS(c, rizosLouse(0, false), l.x, l.y, { rot: l.rot }); continue; }
      drawS(c, rizosLouse(fl(l.fr) % 2, false), l.x, l.y, { rot: l.a + Math.PI / 2 });
    }
    // the brush follows the finger, with motion streaks when sweeping fast
    const sp = Math.hypot(g.bvx, g.bvy);
    if (IN.down && sp > 140) { c.globalAlpha = .4; for (let i = 1; i < 4; i++) drawS(c, rizosBrushSpr(), g.bx - g.bvx * .012 * i, g.by - g.bvy * .012 * i, { rot: g.brot + .5, ax: .2, ay: .85 }); c.globalAlpha = 1; }
    drawS(c, rizosBrushSpr(), g.bx, g.by, { rot: g.brot + .5, ax: .2, ay: .85 });
    const left = g.lice.filter(l => !l.gone).length;
    panel(c, 6, 6, 60, 16, '#ffffff', { r: 4 }); drawS(c, rizosLouse(0, false), 18, 14); txt(c, 'x ' + left, 32, 10, INK, { bold: true });
    if (g.state === 'lost') txt(c, '¡Pica, pica!', 128, 24, '#ff4060', { align: 'c', out: '#ffffff', bold: true });
  },
  hint(g) { const l = g.lice.find(l => !l.gone && !l.hidden); return l && { x: l.x, y: l.y }; },
  bot(g) {
    // swing the brush through the nearest visible louse; comb the fur where the hidden one lurks
    const vis = g.lice.filter(l => !l.gone && !l.hidden), hid = g.lice.find(l => l.hidden && !l.gone);
    let target = null, bd = 1e9; for (const l of vis) { const d = dist(g.bx, g.by, l.x, l.y); if (d < bd) { bd = d; target = l; } }
    if (!target && hid) return { x: hid.x + Math.sin(g.t * 40) * 20, y: hid.y + Math.cos(g.t * 30) * 8, down: true };
    if (!target || g.state !== 'play') return { down: false };
    const ph = (g.t * 6) % 1, sweep = lerp(-34, 34, ph);
    return { x: target.x + sweep, y: target.y + sweep * .15, down: g.t > .12 };
  },
});

// ---------------------------------------------------------------- 8 DISCOBOLA
// Club Champú before opening: the lights are off and the big mirror ball is
// grey with dust (and a cobweb). Polish it; once it shines the party starts.
const RIZOS_BOLA_SHINY = ['#2f3550', '#56608a', '#9aa6cc', '#dfe5f5', '#ffffff'];
const RIZOS_BOLA_DUSTY = ['#51474a', '#6e6462', '#8b8177', '#a69c8c', '#bdb3a1'];
const RIZOS_BOLA_PAL = [0, .4, .72, 1].map(k => RIZOS_BOLA_SHINY.map((c, i) => mixHex(c, RIZOS_BOLA_DUSTY[i], k)));
const RIZOS_BOLA_TINT = ['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff'].map(t => RIZOS_BOLA_SHINY.map((c, i) => mixHex(c, t, i > 3 ? .2 : .55)));
function rizosChamoisSpr() {
  return mdl('rizosChamois', () => {
    const c = mkCanvas(30, 24), g = c.g;
    polyPx(g, [[2, 7], [13, 1], [28, 5], [27, 18], [15, 23], [1, 17]], INK);
    polyPx(g, [[3, 7], [13, 2], [27, 6], [26, 17], [15, 22], [2, 16]], '#e0a93a');
    polyPx(g, [[4, 7], [13, 3], [25, 7], [22, 12], [12, 11], [4, 13]], '#ffd36b');
    linePx(g, 7, 16, 19, 13, '#b57f22'); linePx(g, 10, 20, 23, 16, '#b57f22');
    px(g, 11, 5, '#fff3c4'); px(g, 12, 5, '#fff3c4'); px(g, 12, 4, '#fff3c4');
    return c;
  });
}
// the ball hangs from the ceiling truss; levels 2-3 it swings on its chain
function rizosBolaPos(g) {
  const damp = g.state === 'won' ? Math.max(0, 1 - (g.t - g.decidedAt) * 2) : 1;
  g.th = g.swingA * Math.sin(g.t * g.swingW) * damp;
  g.bx = 128 + Math.sin(g.th) * 76; g.by = 8 + Math.cos(g.th) * 76;
}
// mean dust around a point in ball coordinates (3x3 facets)
function rizosBolaDustAt(g, lx, ly) {
  const i = clamp(fl((lx + g.R) / 4), 0, g.n - 1), j = clamp(fl((ly + g.R) / 4), 0, g.n - 1);
  let s = 0, k = 0;
  for (let b = j - 1; b <= j + 1; b++) for (let a = i - 1; a <= i + 1; a++) { if (a < 0 || b < 0 || a >= g.n || b >= g.n) continue; const idx = b * g.n + a; if (g.inB[idx]) { s += g.dust[idx]; k++; } }
  return k ? s / k : 0;
}
function rizosBolaDraw(g, c) {
  const R = g.R, n = g.n, X = rd(g.bx - R), Y = rd(g.by - R);
  // fuzz on the silhouette wherever it is still dusty
  for (let a = 0; a < TAU; a += .09) { const cx = Math.cos(a), cy = Math.sin(a); if (rizosBolaDustAt(g, cx * (R - 3), cy * (R - 3)) < .5) continue; const h = hash2(fl(a * 10), 3, 9), L = 1.5 + h * 2.5; rect(c, g.bx + cx * (R + L * .5) - 1, g.by + cy * (R + L * .5) - 1, 2, 2, h < .5 ? '#8b8177' : '#6e6462'); px(c, g.bx + cx * (R + L), g.by + cy * (R + L), '#a69c8c'); }
  disc(c, g.bx, g.by, R + 1, INK); disc(c, g.bx, g.by, R, '#231d2b');
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const idx = j * n + i; if (!g.inB[idx]) continue;
    const d = g.dust[idx], q = d < .2 ? 0 : d < .5 ? 1 : d < .8 ? 2 : 3, l = g.lq[idx], x = X + i * 4, y = Y + j * 4;
    if (q >= 2) {
      // dust is a felt that hides the grout; clean facets are crisp mirror tiles
      rect(c, x, y, 4, 4, RIZOS_BOLA_PAL[q][l]);
      const h = hash2(i, j, 5);
      if (h < .4) px(c, x + fl(hash2(i, j, 6) * 4), y + fl(hash2(i, j, 7) * 4), hash2(i, j, 8) < .6 ? '#cfc6b4' : '#3e3538');
      else if (q === 3 && h > .93) { rect(c, x, y, 3, 2, '#cfc6b4'); px(c, x + 1, y + 2, '#6e6462'); }
    } else {
      rect(c, x, y, 3, 3, q === 0 && g.tint[idx] >= 0 ? RIZOS_BOLA_TINT[g.tint[idx]][l] : RIZOS_BOLA_PAL[q][l]);
      if (q === 0 && l >= 3) px(c, x, y, '#ffffff');
    }
  }
  // the clean facets twinkle
  for (let k = 0; k < 4; k++) {
    const h = fl(g.t * 5) * 7 + k * 131, i = fl(hash2(h, 1, 21) * n), j = fl(hash2(h, 2, 23) * n), idx = j * n + i;
    if (!g.inB[idx] || g.dust[idx] >= .2) continue;
    drawStar(c, X + i * 4 + 1.5, Y + j * 4 + 1.5, 2.5 + 2 * (1 - (g.t * 5) % 1), '#ffffff', g.t * 4);
  }
  // cobweb between the chain and the ball, until that corner gets polished
  if (g.web) {
    const ax = lerp(128, g.bx, .62), ay = lerp(8, g.by - R, .62);
    const pts = [-1.25, -.85, -.45].map(a => [g.bx + Math.cos(a) * R, g.by + Math.sin(a) * R]);
    c.globalAlpha = .75;
    for (const [x, y] of pts) linePx(c, ax, ay, x, y, '#d9d2e6');
    for (const k of [.35, .7]) for (let q = 0; q < 2; q++) linePx(c, lerp(ax, pts[q][0], k), lerp(ay, pts[q][1], k) + 2, lerp(ax, pts[q + 1][0], k), lerp(ay, pts[q + 1][1], k) + 2, '#b9b1cc');
    c.globalAlpha = 1;
  }
  // dust bunnies dangling underneath
  for (const b of g.bunnies) {
    if (!b.on) continue;
    const x = g.bx + b.u * R * .9, y = g.by + R * Math.sqrt(1 - b.u * b.u * .81) - 2, sw = -g.th * 14;
    linePx(c, x, y, x + sw, y + b.L, '#9b8f7a');
    disc(c, x + sw, y + b.L + 3, 4, INK); disc(c, x + sw, y + b.L + 3, 3, '#7d7166'); px(c, x + sw - 1, y + b.L + 2, '#a69a86'); px(c, x + sw + 1, y + b.L + 4, '#51464a');
    for (let q = 0; q < 5; q++) { const a = q * 1.3 + b.u * 5; px(c, x + sw + Math.cos(a) * 5, y + b.L + 3 + Math.sin(a) * 5, '#8a7e6c'); }
  }
}
defMG({
  id: 'discobola', stage: 'rizos', name: 'Bola de discoteca', cmd: '¡SACA BRILLO!', how: 'Frota la bola hasta quitarle el polvo: cuando brille, ¡se encienden las luces!', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .45, n: 'D5 . F5 . A5 . . . G5 . F5 . E5 . . . F5 . A5 . C6 . . . A5 - - - . . . .' },
    { i: 'pad', v: .36, n: 'D4+F4+A4 - - - - - - - C4+E4+G4 - - - - - - - A#3+D4+F4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .9, n: 'D2 D3 D2 D3 D2 D3 D2 D3 C2 C3 C2 C3 C2 C3 C2 C3 A#1 A#2 A#1 A#2 A#1 A#2 A#1 A#2 A1 A2 A1 A2 A1 A2 C#2 C#3' },
    { i: 'd', v: .8, n: RIZOS_DRUM + ' k h o h k+c h o h k h o h k+c c c+x c' }] }),
  init(g) {
    const R = 44, n = 22;
    g.R = R; g.n = n; g.need = [.6, .66, .7][g.level - 1];
    g.swingA = [0, .26, .36][g.level - 1]; g.swingW = [0, 2.3, 2.9][g.level - 1] * Math.sqrt(g.tempo);
    g.regrow = [0, 0, .12][g.level - 1]; g.rate = .022;
    g.dust = new Float32Array(n * n); g.lq = new Uint8Array(n * n); g.tint = new Int8Array(n * n).fill(-1); g.inB = new Uint8Array(n * n); g.cnt = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = -R + i * 4 + 1.5, y = -R + j * 4 + 1.5, idx = j * n + i;
      if (x * x + y * y > (R - 1.5) * (R - 1.5)) continue;
      const nx = x / R, ny = y / R, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lum = .12 + .95 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) + (hash2(i, j, 3) - .5) * .5;
      g.inB[idx] = 1; g.cnt++; g.dust[idx] = 1; g.lq[idx] = clamp(fl(lum * 5), 0, 4);
      if (hash2(i, j, 11) < .16) g.tint[idx] = fl(hash2(i, j, 12) * 4);
    }
    g.shine = 0; g.rub = rubTracker(); g.cx = 204; g.cy = 150; g.crot = 0; g.web = true;
    g.bunnies = [-.4, .05, .45].map((u, k) => ({ u, L: 4 + k * 2, on: true }));
    rizosBolaPos(g);
  },
  update(g, dt) {
    rizosBolaPos(g);
    const R = g.R, n = g.n, lx = IN.x - g.bx, ly = IN.y - g.by;
    if (IN.down) { g.cx = lerp(g.cx, IN.x, .6); g.cy = lerp(g.cy, IN.y, .6); g.crot = lerp(g.crot, clamp(IN.vx / 700, -.6, .6), .25); }
    const gain = g.rub.update(dt, IN.down && lx * lx + ly * ly < (R + 10) * (R + 10));
    if (g.state === 'lost' && !g.said) { g.said = true; sfx('whine', { pitch: 1.2 }); }
    if (g.state !== 'play') return;
    if (g.regrow) {
      // level 3: dust keeps sifting down from the ceiling onto the top of the ball
      for (let j = 0; j < n; j++) { const w = clamp(.5 - (j / n - .5) * 2, 0, 1.5) * g.regrow * dt; if (w <= 0) continue; for (let i = 0; i < n; i++) { const idx = j * n + i; if (g.inB[idx]) g.dust[idx] = Math.min(1, g.dust[idx] + w); } }
      if (FRAME % 3 === 0) g.fx.add({ k: 'dot', x: g.bx + g.r(-34, 34), y: g.r(8, 16), vx: g.r(-5, 5), vy: g.r(40, 60), life: .8, r: 1, c: pick(['#a69a86', '#8a7e6c']) });
    }
    if (gain > 0) {
      const Rb = 13, i0 = Math.max(0, fl((lx - Rb + R) / 4)), i1 = Math.min(n - 1, fl((lx + Rb + R) / 4)), j0 = Math.max(0, fl((ly - Rb + R) / 4)), j1 = Math.min(n - 1, fl((ly + Rb + R) / 4));
      let sparks = 0;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const idx = j * n + i; if (!g.inB[idx]) continue;
        const d = Math.hypot(-R + i * 4 + 1.5 - lx, -R + j * 4 + 1.5 - ly); if (d > Rb) continue;
        const was = g.dust[idx]; g.dust[idx] = Math.max(0, was - gain * g.rate * (1 - d / Rb * .6));
        if (was >= .2 && g.dust[idx] < .2 && sparks < 2 && g.r() < .25) { sparks++; g.fx.add({ k: 'star', x: g.bx - R + i * 4 + 1.5, y: g.by - R + j * 4 + 1.5, life: .3, r: 2.5, c: '#ffffff' }); }
      }
      if (FRAME % 3 === 0) g.fx.add({ k: 'puff', x: IN.x + g.r(-8, 8), y: IN.y + g.r(-5, 5), vx: g.r(-25, 25), vy: g.r(-15, 10), g: 40, life: .6, r: g.r(2, 4), c: pick(['#8a7e6c', '#a69a86', '#6f6458']) });
    }
    let s = 0; for (let i = 0; i < g.dust.length; i++) if (g.inB[i]) s += 1 - g.dust[i];
    g.shine = s / g.cnt;
    if (g.web && rizosBolaDustAt(g, 26, -26) < .35) {
      g.web = false; sfx('pop', { pitch: 1.5 });
      for (let k = 0; k < 7; k++) g.fx.add({ k: 'hair', x: g.bx + 20 + g.r(-10, 10), y: g.by - R + g.r(-10, 6), vx: g.r(-20, 20), vy: g.r(10, 40), g: 60, life: .8, r: g.r(2, 4), c: '#d9d2e6', rot: g.r(TAU) });
    }
    for (const b of g.bunnies) if (b.on && rizosBolaDustAt(g, b.u * R * .9, R * Math.sqrt(1 - b.u * b.u * .81) - 5) < .35) {
      b.on = false; sfx('pop', { pitch: .8 });
      g.fx.add({ k: 'puff', x: g.bx + b.u * R * .9, y: g.by + R + b.L, vx: g.r(-10, 10), vy: 20, g: 260, life: .7, r: 4, c: '#7d7166' });
    }
    if (g.shine >= g.need) {
      // the lights come on
      g.win(); g.dust.fill(0); HITSTOP = 3; buzz(12); g.shake(2, .15);
      sfx('sparkle'); sfx('slam'); sfx('boingy', { pitch: 1.2 });
      for (let i = 0; i < 36; i++) g.fx.add({ k: 'conf', x: g.r(SW), y: g.r(-10, 30), vx: g.r(-30, 30), vy: g.r(30, 90), g: 60, life: 1.8, c: pick(['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff', '#ffffff']), rot: g.r(TAU), vr: g.r(-8, 8) });
      g.fx.burst(g.bx, g.by, 20, { k: 'star', c: ['#ffffff', '#fff04f', '#4ff2ff', '#ff4fa3'], sp0: 60, sp1: 170 });
    }
  },
  draw(g, c) {
    const won = g.state === 'won', k = won ? g.t - g.decidedAt : 0, R = g.R;
    c.drawImage(rizosClubBack(), 0, 0);
    rizosNeonText(c, 'CLUB CHAMPÚ', 198, 20, won ? RIZOS_NEON.pink : '#4a2a5e', g.t, won ? 1 : 0);
    if (won) { rizosBeams(c, g.t, g.b); rizosSpecks(c, g.t, 26, 0, 10, SW, 140); }
    rizosDanceFloor(c, 150, won ? g.b : 0, 4);
    // Rizos: waiting in the dark pointing at the ball; dancing once it shines
    const pose = won ? (fl(g.b) % 2 ? 'dance2' : 'win') : g.state === 'lost' ? 'over' : 'ready';
    rizosDraw(c, 42, 198, pose, { ex: won ? 'joy' : g.state === 'lost' ? 'sad' : g.shine > .45 ? 'grin' : 'cool', jump: won ? Math.abs(Math.sin(g.b * Math.PI)) * 8 : 0, noPop: true });
    // lights off: the room is dim, only the ball glows under the work lamp
    const dark = won ? Math.max(0, 1 - k * 6) : 1;
    if (dark > 0) { c.globalAlpha = .62 * dark; rect(c, 0, 0, SW, SH, '#06010e'); c.globalAlpha = .5 * dark; rect(c, 0, 150, SW, 42, '#06010e'); c.globalAlpha = 1; }
    if (!won) { for (const [r, a] of [[R + 26, .05], [R + 16, .06], [R + 8, .08]]) { c.globalAlpha = a; disc(c, g.bx, g.by, r, '#ffe9b0'); } c.globalAlpha = 1; }
    else for (let i = 0; i < 12; i++) {
      const a = g.t * .7 + i * TAU / 12, w = .05;
      c.globalAlpha = .16; polyPx(c, [[g.bx, g.by], [g.bx + Math.cos(a - w) * 220, g.by + Math.sin(a - w) * 220], [g.bx + Math.cos(a + w) * 220, g.by + Math.sin(a + w) * 220]], ['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff'][i % 4]); c.globalAlpha = 1;
    }
    // chain and cap
    const tx = g.bx - Math.sin(g.th) * R, ty = g.by - Math.cos(g.th) * R;
    for (let q = 0; q <= 1; q += 1 / 18) rect(c, lerp(128, tx, q) - 1, lerp(8, ty, q) - 1, 2, 3, fl(q * 18) % 2 ? '#5d566f' : '#a9a2c2');
    rect(c, tx - 4, ty - 4, 8, 5, INK); rect(c, tx - 3, ty - 3, 6, 2, '#8f88a8');
    if (won) rizosDiscoBall(c, g.bx, g.by, R, g.t * 1.6, { noChain: true });
    else rizosBolaDraw(g, c);
    if (!won) drawS(c, rizosChamoisSpr(), g.cx, g.cy, { rot: g.crot, alpha: IN.down ? 1 : .75 });
    panel(c, 6, 6, 78, 16, '#fff8e6', { r: 4 }); txt(c, 'BRILLO ' + fl(Math.min(1, g.shine / g.need) * 100) + '%', 45, 10, INK, { align: 'c', bold: true });
    if (won) shout(c, '¡A BAILAR!', 188, 150, k);
    if (g.state === 'lost') txt(c, 'Sin brillo no hay fiesta…', 164, 176, '#b3b8d4', { align: 'c', out: INK, bold: true });
    if (won && k < .25) { c.globalAlpha = (1 - k / .25) * .7; rect(c, 0, 0, SW, SH, '#ffffff'); c.globalAlpha = 1; }
  },
  hint(g) { return { x: g.bx, y: g.by }; },
  bot(g) {
    // rub the dustiest patch; move on as soon as it shines
    if (g.state !== 'play' || g.t < .15) return { down: false };
    if (!g.bt || rizosBolaDustAt(g, g.bt[0], g.bt[1]) < .15) {
      let best = -1; for (let j = 1; j < g.n - 1; j++) for (let i = 1; i < g.n - 1; i++) { const x = -g.R + i * 4 + 1.5, y = -g.R + j * 4 + 1.5; if (!g.inB[j * g.n + i]) continue; const s = rizosBolaDustAt(g, x, y) - Math.hypot(x, y) * .002; if (s > best) { best = s; g.bt = [x, y]; } }
    }
    return { x: g.bx + g.bt[0] + Math.sin(g.t * 47) * 9, y: g.by + g.bt[1] + Math.cos(g.t * 39) * 7, down: true };
  },
});

// ---------------------------------------------------------------- 9 AFRO XXL -
// showtime in a minute, and Rizos has slept on his afro: it's as flat as a
// pancake. Rub it up with the afro pick until it fills the dotted XXL outline.
function rizosBaldHead() {
  // Rizos' head without the afro (same shapes as his head): the afro is drawn live
  return mdl('rizosBald', () => {
    const F = RIZOS_FUR, curl2 = clumpTex(3.6, .26, 8, 1, .8);
    const earL = SD.curls(SD.ellipse(16.5, 51, 8.5, 13, .15), 1.4, .8, 1), earR = SD.curls(SD.ellipse(67.5, 51, 8.5, 13, -.15), 1.4, .8, 5);
    const faceS = SD.ellipse(42, 49, 16, 14), face = SD.curls(faceS, 1.1, .9, 7);
    return model(84, 80, [
      { f: earL, ramp: F, z: 1, th: 6, tex: curl2 }, { f: earR, ramp: F, z: 1, th: 6, tex: curl2 },
      { f: face, fs: faceS, ramp: F, z: 2, th: 10, tex: curl2, amb: .32, dith: .2 },
      { f: SD.ellipse(42, 57, 9.6, 7.2), ramp: RIZOS_MUZ, z: 3, th: 6, amb: .5, dith: .15 },
      { f: SD.box(42, 53, 4.9, 3.4, 2.6), ramp: RAMP.black, z: 4, th: 3, gloss: true, amb: .3 },
    ]);
  });
}
function rizosBaldFace(ex) {
  return mdl('rizosBaldF:' + ex, () => {
    const c = mkCanvas(84, 80), g = c.g, K = RAMP.black, P = RAMP.pink, cx0 = 42, ey = 44, my = 61;
    g.drawImage(rizosBaldHead(), 0, 0);
    const eyes = kind => { for (const s of [-1, 1]) dogEye(g, cx0 + s * 8 - 2, ey, kind); };
    const blush = () => { for (const bx of [cx0 - 13, cx0 + 10]) { rect(g, bx, ey + 9, 3, 2, RIZOS_PINK[3]); px(g, bx + 1, ey + 9, '#ffd3e6'); } };
    const worried = () => { linePx(g, cx0 - 13, ey - 2, cx0 - 7, ey - 5, K[0]); linePx(g, cx0 + 13, ey - 2, cx0 + 7, ey - 5, K[0]); };
    const frown = () => { hline(g, cx0 - 3, cx0 + 3, my + 1, K[0]); px(g, cx0 - 4, my + 2, K[0]); px(g, cx0 + 4, my + 2, K[0]); };
    if (ex === 'sad') { eyes(''); worried(); frown(); rect(g, 70, 30, 2, 4, '#9bd6f7'); px(g, 70, 34, '#dff4ff'); }
    else if (ex === 'cry') { eyes('sad'); worried(); frown(); vline(g, cx0 - 9, 51, 55, '#9bd6f7'); vline(g, cx0 + 9, 51, 56, '#9bd6f7'); }
    else if (ex === 'hope') { eyes(''); hline(g, cx0 - 4, cx0 + 3, my, K[0]); px(g, cx0 + 4, my - 1, K[0]); px(g, cx0 - 5, my - 1, K[0]); }
    else {
      eyes('happy'); blush();
      if (ex === 'joy') { hline(g, cx0 - 6, cx0 + 6, my - 1, K[0]); px(g, cx0 - 7, my - 2, K[0]); px(g, cx0 + 7, my - 2, K[0]); rect(g, cx0 - 5, my, 11, 4, '#3e0d1c'); hline(g, cx0 - 4, cx0 + 4, my, '#ffffff'); }
      else { hline(g, cx0 - 5, cx0 + 5, my, K[0]); px(g, cx0 - 6, my - 1, K[0]); px(g, cx0 + 6, my - 1, K[0]); rect(g, cx0 - 4, my + 1, 8, 3, '#3e0d1c'); }
      rect(g, cx0 - 2, my + 2, 5, 4, P[2]); hline(g, cx0 - 1, cx0 + 1, my + 3, P[1]); hline(g, cx0 - 1, cx0 + 1, my + 6, P[0]);
    }
    return c;
  });
}
// an afro pick with a disco-star handle; the teeth tips are the hot spot
function rizosPickSpr() {
  return mdl('rizosPick', () => {
    const c = mkCanvas(24, 40), g = c.g;
    polyPx(g, rizosStarPts(12, 9, 9.5, 4.6, 0), INK); polyPx(g, rizosStarPts(12, 9, 8.2, 4, 0), '#ff3d8b'); polyPx(g, rizosStarPts(11.5, 8.4, 6.6, 3.1, 0), '#ff8fbd');
    px(g, 9, 6, '#ffffff'); px(g, 10, 5, '#ffffff');
    rect(g, 2, 16, 20, 6, INK); rect(g, 3, 17, 18, 4, '#ff3d8b'); hline(g, 3, 20, 17, '#ff8fbd');
    for (let i = 0; i < 5; i++) { const x = 3 + i * 4; rect(g, x, 21, 3, 18, INK); vline(g, x + 1, 21, 37, i % 2 ? '#ffd3e6' : '#ffb3d6'); }
    return c;
  });
}
// the afro is a cloud of curls on a golden-angle spiral, shaped by how fluffed it is
const RIZOS_CURLS = Array.from({ length: 72 }, (_, i) => { const r = Math.sqrt((i + .5) / 72), a = i * 2.39996; return { u: r * Math.cos(a), v: r * Math.sin(a), s: .82 + hash2(i, 3, 17) * .36, ph: hash2(i, 5, 19) * TAU, sh: clamp(rd(1 + (r * Math.cos(a) * LIGHT[0] + r * Math.sin(a) * LIGHT[1]) * 1.5), 0, 2) }; }).sort((p, q) => (q.u * q.u + q.v * q.v) - (p.u * p.u + p.v * p.v));
function rizosAfroShape(f) { return { cy: lerp(36, 20, f), rx: lerp(37, 50, f), ry: lerp(12, 46, f), cr: lerp(4.4, 8.6, f) }; }
function rizosAfroCurls(g, X, Y) {
  const S = rizosAfroShape(g.fv), w = g.wob, rx = S.rx * (1 - w * .05), ry = S.ry * (1 + w * .1), cy = S.cy - w * 3;
  return RIZOS_CURLS.map((q, i) => { const r = S.cr * q.s + (g.pop[i] || 0) * 2.4 + Math.sin(g.b * TAU + q.ph) * .35; return [X + 42 + q.u * Math.max(1, rx - r * .7), Y + cy + q.v * Math.max(1, ry - r * .7), r, q]; });
}
function rizosAfroDraw(g, c, X, Y) {
  const F = RIZOS_FUR, P = rizosAfroCurls(g, X, Y);
  for (const [x, y, r] of P) disc(c, x, y, r + 1, INK);
  for (const [x, y, r, q] of P) { disc(c, x, y, r, F[q.sh]); disc(c, x - .8, y - 1, r - 1.4, F[q.sh + 1]); disc(c, x - r * .3, y - r * .38, r * .36, F[q.sh + 2]); }
  if (g.fv < .3) {
    // hat hair: the dent the cap left, pressed flat across the top
    const S = rizosAfroShape(g.fv); c.globalAlpha = 1 - g.fv / .3;
    hline(c, X + 42 - S.rx * .7, X + 42 + S.rx * .7, Y + S.cy - S.ry * .35, F[1]); hline(c, X + 42 - S.rx * .6, X + 42 + S.rx * .6, Y + S.cy - S.ry * .35 + 1, F[0]);
    c.globalAlpha = 1;
  }
}
function rizosCurtainBack() {
  return mdl('rizosCurtain', () => {
    const c = mkCanvas(SW, SH), g = c.g, V = ['#2a0718', '#4d0c2c', '#7a1444', '#a91f5e', '#d6377c'];
    // velvet folds (dithered between tones), then the scalloped valance with gold fringe
    for (let x = 0; x < SW; x++) {
      const f = (Math.sin(x * .21 + Math.sin(x * .047) * 1.6) * .5 + .5) * 3.4;
      for (let y = 0; y < SH; y++) { const v = f + (y / SH) * -.4, lo = clamp(fl(v), 0, 4), hi = Math.min(4, lo + 1); g.fillStyle = V[bayer(x, y) < v - lo ? hi : lo]; g.fillRect(x, y, 1, 1); }
    }
    for (let x = 0; x < SW; x++) { const s = 14 + Math.abs(Math.sin(x / 32 * Math.PI)) * 7; vline(g, x, 0, s, V[1 + (Math.sin(x * .3) > .3 ? 1 : 0)]); px(g, x, s + 1, INK); if (x % 3 === 0) vline(g, x, s + 1, s + 4, '#ffcf4f'); else px(g, x, s + 2, '#c98a1e'); }
    rect(g, 0, 0, SW, 3, V[0]); hline(g, 0, SW, 3, '#ffcf4f');
    // the stage floor
    rect(g, 0, 172, SW, 20, '#6b3f22'); hline(g, 0, SW, 172, INK); hline(g, 0, SW, 173, '#b0713f');
    for (let y = 178; y < SH; y += 6) hline(g, 0, SW, y, '#4f2d18');
    for (let x = 10; x < SW; x += 40) vline(g, x + (fl(x / 40) % 2) * 20, 174, SH, '#4f2d18');
    return c;
  });
}
function rizosCapOnFloor(c, x, y) {
  shadowOval(c, x, y + 2, 16, 3, .5);
  ellipsePx(c, x + 14, y, 9, 3, INK); ellipsePx(c, x + 14, y - 1, 8, 2, '#c42a6a');
  disc(c, x, y - 3, 12, INK); rect(c, x - 13, y - 3, 27, 5, INK); disc(c, x, y - 3, 11, '#ff3d8b'); rect(c, x - 11, y - 3, 23, 4, '#ff3d8b');
  disc(c, x - 3, y - 7, 5, '#ff8fbd'); rect(c, x - 11, y, 23, 1, '#c42a6a'); disc(c, x, y - 13, 1.6, '#fff04f');
  polyPx(c, rizosStarPts(x + 1, y - 4, 3.6, 1.7, 0), '#fff04f');
}
function rizosAfroMeter(c, f, t) {
  const x = 234, y0 = 40, h = 112, fh = rd(h * clamp(f, 0, 1));
  panel(c, x - 5, y0 - 4, 14, h + 8, '#12062a', { r: 4 });
  const cols = ['#ff3d8b', '#ff6fa8', '#ffa05f', '#ffd24f', '#fff04f'];
  for (let y = 0; y < fh; y++) hline(c, x - 2, x + 5, y0 + h - 1 - y, cols[clamp(fl((y / h) * 5), 0, 4)]);
  if (fh > 1) hline(c, x - 2, x + 5, y0 + h - fh, '#ffffff');
  for (const [k, s] of [[0, 'S'], [.25, 'M'], [.5, 'L'], [.75, 'XL'], [1, 'XXL']]) {
    const yy = y0 + h - rd(h * k); hline(c, x - 4, x - 3, yy, '#ffffff');
    txt(c, s, x - 7, yy - 3, f >= k - .001 ? '#fff04f' : '#c7a6de', { align: 'r', out: INK, bold: true });
  }
}
defMG({
  id: 'afroxxl', stage: 'rizos', name: 'Afro chafado', cmd: '¡AHUECA!', how: 'Frota el afro aplastado para ahuecarlo hasta la línea de puntos', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'brass', v: .5, n: '. . A4 C5 . . A4 . . . G4 A4 . . . . . . A4 C5 . . D5 . E5 . D5 C5 A4 - - .' },
    { i: 'bass', v: .9, n: 'A1 . . A2 . A1 G1 . A1 . . A2 . C2 D2 . A1 . . A2 . A1 G1 . E2 . E2 . D2 . C2 .' },
    { i: 'kalimba', v: .4, n: '. . . . E5 . . . . . . . E5 . G5 . . . . . E5 . . . . . . . A5 . G5 .' },
    { i: 'd', v: .8, n: 'k . h . k+c . h o k . h k k+c . h h k . h . k+c . h o k h k . k+c c c+x .' }] }),
  init(g) {
    g.need = [620, 760, 880][g.level - 1] / Math.sqrt(g.tempo);
    g.decay = [0, .22, .32][g.level - 1]; g.sway = [0, 0, 12][g.level - 1];
    g.f = 0; g.fv = 0; g.vel = 0; g.wob = 0; g.idle = 0; g.size = 0;
    g.pop = new Float32Array(RIZOS_CURLS.length); g.rub = rubTracker();
    g.px = 196; g.py = 150; g.prot = 0; g.hx = 128;
  },
  update(g, dt) {
    g.hx = 128 + (g.sway ? Math.sin(g.b * Math.PI) * g.sway : 0);
    const X = rd(g.hx - 42), Y = 82, S = rizosAfroShape(g.fv), acx = X + 42, acy = Y + S.cy;
    if (IN.down) { g.px = lerp(g.px, IN.x, .6); g.py = lerp(g.py, IN.y, .6); g.prot = lerp(g.prot, clamp(IN.vx / 600, -.5, .5), .25); }
    const inside = IN.down && (Math.hypot((IN.x - acx) / (S.rx + 16), (IN.y - acy) / (S.ry + 18)) < 1 || dist(IN.x, IN.y, acx, Y + 50) < 30);
    const gain = g.rub.update(dt, inside);
    for (let i = 0; i < g.pop.length; i++) g.pop[i] = Math.max(0, g.pop[i] - dt * 5);
    if (g.state === 'play') {
      if (gain > 0) {
        g.f = Math.min(1, g.f + gain / g.need); g.idle = 0;
        // the curls under the pick spring up
        const P = rizosAfroCurls(g, X, Y);
        for (let i = 0; i < P.length; i++) if (dist(P[i][0], P[i][1], IN.x, IN.y) < 16) g.pop[i] = 1;
        if (FRAME % 4 === 0) g.fx.add({ k: 'hair', x: IN.x + g.r(-8, 8), y: IN.y + g.r(-6, 4), vx: g.r(-40, 40), vy: g.r(-60, -20), g: 120, life: .45, r: g.r(1.5, 3), c: pick(RIZOS_FUR.slice(2)), rot: g.r(TAU) });
      } else {
        g.idle += dt;
        // levels 2-3: stop rubbing and the afro sags back down
        if (g.decay && g.idle > .12 && g.f > 0) { g.f = Math.max(0, g.f - g.decay * dt); if (FRAME % 8 === 0) g.fx.add({ k: 'puff', x: acx + g.r(-S.rx, S.rx), y: acy - S.ry, vx: 0, vy: -20, life: .5, r: 2, c: '#ffffff' }); }
      }
      const size = Math.min(4, fl(g.f * 4 + .0001));
      if (size > g.size) {
        g.size = size; g.vel += 3.2; sfx('boingy', { pitch: .9 + size * .15 }); buzz(6);
        g.fx.add({ k: 'txt', s: '¡' + ['S', 'M', 'L', 'XL', 'XXL'][size] + '!', x: g.hx - S.rx - 22, y: acy - S.ry * .4, life: .7, c: '#fff04f' });
        g.fx.burst(acx, acy - S.ry, 8, { k: 'dot', c: RIZOS_FUR.slice(2), sp0: 40, sp1: 110, r: 2.5 });
      } else if (size < g.size) g.size = size;
      if (g.f >= 1) {
        g.win(); g.vel += 5; HITSTOP = 3; buzz(14); g.shake(2, .15);
        sfx('boingy', { pitch: 1.6 }); sfx('sparkle'); sfx('slam');
        for (let a = 0; a < TAU; a += TAU / 18) g.fx.add({ k: 'star', x: acx + Math.cos(a) * 52, y: Y + 20 + Math.sin(a) * 48, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, life: .6, r: 3, c: pick(['#fff04f', '#ffffff', '#ff4fa3']) });
        for (let i = 0; i < 30; i++) g.fx.add({ k: 'conf', x: g.r(SW), y: g.r(-10, 30), vx: g.r(-30, 30), vy: g.r(30, 90), g: 60, life: 1.8, c: pick(['#ff4fa3', '#4ff2ff', '#fff04f', '#b04fff', '#ffffff']), rot: g.r(TAU), vr: g.r(-8, 8) });
      }
    }
    if (g.state === 'lost') { g.f = 0; if (!g.said) { g.said = true; sfx('whine', { pitch: 1.3 }); } }
    // springy display value: the afro overshoots and wobbles as it grows
    const target = g.state === 'won' ? 1 : g.f;
    g.vel += (target - g.fv) * 260 * dt; g.vel *= Math.exp(-9 * dt); g.fv = clamp(g.fv + g.vel * dt, 0, 1.08);
    g.wob = clamp(g.vel * .25, -1, 1);
  },
  draw(g, c) {
    const won = g.state === 'won', lost = g.state === 'lost', k = won ? g.t - g.decidedAt : 0, X = rd(g.hx - 42), Y = 82;
    c.drawImage(rizosCurtainBack(), 0, 0);
    // spotlight
    c.globalAlpha = won ? .2 + .06 * Math.sin(g.t * 12) : .1; polyPx(c, [[112, 0], [144, 0], [206, SH], [50, SH]], won ? ['#fff04f', '#ff8fbd', '#4ff2ff'][fl(g.b) % 3] : '#fff3d6'); c.globalAlpha = 1;
    c.globalAlpha = .25; ellipsePx(c, 128, 184, 70, 7, '#fff3d6'); c.globalAlpha = 1;
    // the target: a dotted XXL outline
    const T = rizosAfroShape(1), tcy = Y + T.cy;
    for (let a = 0; a < TAU; a += TAU / 60) {
      if (fl(a / TAU * 60 + g.t * 4) % 2) continue;
      const x = g.hx + Math.cos(a) * (T.rx + 4), y = tcy + Math.sin(a) * (T.ry + 4);
      rect(c, x - 1, y - 1, 3, 3, INK); rect(c, x, y, 2, 2, won ? '#fff04f' : '#ffffff');
    }
    if (!won) { panel(c, g.hx - 16, tcy - T.ry - 18, 32, 13, '#fff04f', { r: 3 }); txt(c, 'XXL', g.hx, tcy - T.ry - 15, INK, { align: 'c', bold: true }); }
    // the culprit: the cap he slept in, dropped on the floor
    rizosCapOnFloor(c, 44, 183);
    // Rizos sitting in the spotlight
    drawS(c, rizosSitBody('fluffy'), g.hx, 190, { ax: .5, ay: 1 });
    rizosAfroDraw(g, c, X, Y);
    const ex = won ? 'joy' : lost ? 'cry' : g.f > .5 ? 'grin' : g.f > .2 ? 'hope' : 'sad';
    c.drawImage(rizosBaldFace(ex), X, Y);
    if (won) drawS(c, rizosGlassesSpr(), g.hx, Y + 46 - 70 * (1 - E.outBounce(clamp(k / .4, 0, 1))), {});
    // the afro pick in your hand
    if (!won) drawS(c, rizosPickSpr(), g.px, g.py, { ax: .5, ay: .92, rot: g.prot, alpha: IN.down ? 1 : .75 });
    rizosAfroMeter(c, won ? 1 : g.fv, g.t);
    if (won) shout(c, '¡AFRO XXL!', 128, 24, k);
    if (lost) txt(c, '¡Pelo chafado!', 128, 26, '#ffb3d6', { align: 'c', out: INK, bold: true });
  },
  hint(g) { return { x: g.hx, y: 82 + rizosAfroShape(g.fv).cy - 4 }; },
  bot(g) {
    if (g.state !== 'play' || g.t < .15) return { down: false };
    const cy = 82 + rizosAfroShape(g.fv).cy;
    return { x: g.hx + Math.sin(g.t * 40) * 22, y: cy + Math.cos(g.t * 33) * 8, down: true };
  },
});

// the new ones join Rizos' stage (the stage file belongs to another pass right now)
if (STAGES.rizos) for (const id of ['cepilla', 'despioja', 'discobola', 'afroxxl']) if (!STAGES.rizos.games.includes(id)) STAGES.rizos.games.push(id);
