// ============================================================================
//  Microgames of RIZOS' stage (¡FROTA!): lather, towel, scratch, mirror, belly.
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
defMG({
  id: 'espuma', stage: 'rizos', name: 'Baño de espuma', cmd: '¡ENJABONA!', how: 'Frota a Rizos hasta cubrirlo de espuma', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .6, n: 'A5 . E5 . C6 . E5 . B5 . E5 . G5 . E5 . A5 . E5 . C6 . E6 . D6 . C6 . B5 . G5 .' },
    { i: 'bass', v: .85, n: 'A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 . F2 . F3 . F2 . F3 . G2 . G3 . G2 . G3 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM + ' ' + RIZOS_DRUM }] }),
  init(g) {
    g.need = [.52, .64, .76][g.level - 1];
    g.rub = rubTracker(); g.dogX = 0; g.cov = 0; g.face = 'sad';
    // foam cells over the dog (head + shoulders), in dog space (dog centred at 128)
    g.cells = [];
    const head = rizosHeadBase('wet');
    const hg = head.getContext('2d').getImageData(0, 0, head.width, head.height).data;
    for (let y = 44; y < 154; y += 7) for (let x = 78; x < 180; x += 7) {
      let inside = false;
      const hx = x - (128 - 42), hy = y - (104 - 64);
      if (hx >= 0 && hy >= 0 && hx < head.width && hy < head.height && hg[(hy * head.width + hx) * 4 + 3] > 0) inside = true;
      if (!inside && y > 126 && Math.abs(x - 128) < 44) inside = true; // shoulders above the water
      if (((x - 128) / 19) ** 2 + ((y - 90) / 17) ** 2 < 1) inside = false; // his face stays clear
      if (inside) g.cells.push({ x, y, v: 0, lv: 0, seed: g.r(1000) });
    }
    g.foam = mkCanvas(SW, SH);
    g.sway = [0, 0, 16][g.level - 1];
  },
  update(g, dt) {
    g.dogX = Math.sin(g.t * 2.4 * g.tempo) * g.sway;
    const fx = IN.x - g.dogX, fy = IN.y;
    const inside = IN.down && g.cells.some(c => Math.abs(c.x - fx) < 12 && Math.abs(c.y - fy) < 12);
    const gain = g.rub.update(dt, inside);
    if (gain > 0 && g.state === 'play') {
      for (const c of g.cells) {
        const d = dist(c.x, c.y, fx, fy); if (d > 17) continue;
        c.v = Math.min(1.3, c.v + gain * .018 * (1 - d / 17));
        while (c.lv < 4 && c.v >= (c.lv + 1) * .25) { c.lv++; this.blob(g, c); }
      }
      if (fl(g.t * 30) % 3 === 0) g.fx.add({ k: 'bubble', x: IN.x + g.r(-8, 8), y: IN.y + g.r(-8, 8), vx: g.r(-20, 20), vy: g.r(-60, -20), life: g.r(.4, .8), r: g.r(1.5, 3.5), c: pick(['#ffffff', '#b3d9ff', '#ffd1e4']) });
      g.cov = g.cells.reduce((s, c) => s + Math.min(1, c.v), 0) / g.cells.length;
      g.face = g.cov > .6 * g.need / .64 ? 'love' : g.cov > .25 ? 'cool' : 'sad';
      if (g.cov >= g.need) { g.win(); sfx('fizz'); g.face = 'love'; g.fx.burst(128 + g.dogX, 90, 24, { k: 'bubble', c: '#ffffff', sp0: 50, sp1: 160, r: 4, life0: .5, life1: 1 }); g.fx.add({ k: 'txt', s: '¡Qué gustito!', x: 128, y: 30, life: 1.2, c: '#ffffff' }); }
    }
    if (g.state === 'lost') g.face = 'sadwet';
  },
  blob(g, c) {
    const f = g.foam.g, h = hash2(fl(c.seed), c.lv), r = 3.5 + c.lv * 1.1 + h * 1.5;
    const x = c.x + (hash2(c.lv, fl(c.seed)) - .5) * 6, y = c.y + (h - .5) * 6;
    disc(f, x, y + 1, r + 1, '#9fb4c8'); disc(f, x, y, r, '#dfe9f2'); disc(f, x - r * .2, y - r * .25, r * .72, '#ffffff'); px(f, x - r * .45, y - r * .5, '#ffffff');
    if (c.lv >= 3 && h > .6) ringPx(f, x + r * .5, y - r * .6, 2, '#b3d9ff');
    sfx('pop', { pitch: 1.6 + h, vol: .25 });
  },
  draw(g, c) {
    c.drawImage(bathBg(), 0, 0);
    rizosSpecks(c, g.t, 16, 0, 0, SW, 120);
    // a tiny disco ball on the shower pipe
    rizosDiscoBall(c, 222, 66, 7, g.t, { noChain: true }); vline(c, 222, 58, 59, RAMP.steel[2]);
    const dx = rd(g.dogX);
    drawS(c, rizosHead(g.state === 'won' ? 'love' : g.face, g.cov > .55 ? 'damp' : 'wet'), 128 + dx, 104, { ax: .5, ay: .8 });
    drawS(c, rizosSitBody('wet'), 128 + dx, 176, { ax: .5, ay: 1 });
    c.drawImage(g.foam, dx, 0);
    tubFront(c, 20, 146, 216);
    for (let x = 22; x < 234; x += 7) { const yy = 147 + Math.sin(x + g.t * 3) * 1.5; disc(c, x, yy, 5, '#ffffff'); ringPx(c, x, yy, 5, '#dce7ea'); }
    // coverage gauge as a little bubble thermometer on the tub
    const w = 60, fillW = rd(clamp(g.cov / g.need, 0, 1) * (w - 2));
    panel(c, SW / 2 - w / 2, 172, w, 10, '#ffffff', { r: 4 }); rect(c, SW / 2 - w / 2 + 1, 173, fillW, 8, '#9bd6f7'); rect(c, SW / 2 - w / 2 + 1, 173, fillW, 2, '#dff4ff');
    for (let i = 0; i < 4; i++) ringPx(c, SW / 2 - w / 2 + 6 + i * 16, 177, 2, '#ffffff');
  },
  bot(g) {
    // sweep the dog in a raster while rubbing fast
    const row = fl(g.t * 2.6) % 6, dir = row % 2 ? -1 : 1, ph = (g.t * 2.6) % 1;
    const x = 128 + g.dogX + dir * (ph - .5) * 84 + Math.sin(g.t * 60) * 9, y = 58 + row * 16 + Math.cos(g.t * 50) * 5;
    return { x, y, down: g.t > .25 && g.state === 'play' };
  },
});

// ---------------------------------------------------------------- 2 TOALLA --
function rizosTowelSpr() {
  return mdl('rizosTowel', () => {
    const c = mkCanvas(34, 26), g = c.g;
    panel(g, 0, 0, 34, 26, '#ff93bf', { r: 6, line: INK, hi: '#ffd1e4', lo: '#e05b98' });
    for (const y of [6, 18]) { rect(g, 2, y, 30, 2, '#ffffff'); rect(g, 2, y + 2, 30, 1, '#ffd1e4'); }
    tiny(g, 'WB', 17, 10, RAMP.green[2], { align: 'c' });
    for (let x = 3; x < 32; x += 3) { px(g, x, 24, '#e05b98'); px(g, x + 1, 25, INK); }
    return c;
  });
}
defMG({
  id: 'toalla', stage: 'rizos', name: 'Secado a toalla', cmd: '¡SECA!', how: 'Frota con la toalla hasta que el afro vuelva a ser un afro', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D5 . D5 F5 . D5 . C5 D5 . . F5 G5 . F5 . D5 . D5 F5 . D5 . A5 G5 . F5 . D5 . C5 .' },
    { i: 'bass', v: .85, n: 'D2 . D3 . . D2 D3 . C2 . C3 . . C2 C3 . Bb1 . Bb2 . . Bb1 Bb2 . A1 . A2 . C3 . A2 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM2 + ' ' + RIZOS_DRUM }] }),
  init(g) {
    g.need = [620, 820, 1000][g.level - 1];
    g.rub = rubTracker(); g.dry = 0; g.stage = 0; g.tx = 150; g.ty = 110; g.trot = 0; g.shakeT = -1; g.drips = [];
  },
  update(g, dt) {
    const over = IN.down && Math.abs(IN.x - 128) < 50 && IN.y > 40 && IN.y < 180;
    if (IN.down) { g.trot = lerp(g.trot, clamp(IN.vx / 900, -.5, .5), .2); g.tx = lerp(g.tx, IN.x, .6); g.ty = lerp(g.ty, IN.y, .6); }
    else g.trot = lerp(g.trot, 0, .1);
    const gain = g.rub.update(dt, over);
    if (gain > 0 && g.state === 'play') {
      g.dry = Math.min(1, g.dry + gain / g.need);
      if (fl(g.t * 60) % 2 === 0) g.fx.add({ k: 'drop', x: IN.x + g.r(-10, 10), y: IN.y + g.r(-6, 6), vx: g.r(-120, 120), vy: g.r(-160, -40), g: 420, life: .6, c: pick(['#9bd6f7', '#dff4ff', '#5aaee6']) });
      const st = g.dry >= .95 ? 3 : g.dry >= .62 ? 2 : g.dry >= .3 ? 1 : 0;
      if (st > g.stage) {
        g.stage = st; sfx('boingy', { pitch: 1 + st * .1 }); HITSTOP = 3; g.shake(2, .15); buzz(10);
        g.fx.burst(128, 86, 18, { k: 'hair', c: [RIZOS_FUR[3], RIZOS_FUR[4], RIZOS_FUR[2]], sp0: 60, sp1: 160, r: 3, life0: .4, life1: .7 });
        g.fx.add({ k: 'txt', s: ['', '¡POF!', '¡POOF!', '¡PUFFF!'][st], x: 128, y: 34, life: .6, c: '#ffffff' });
      }
      if (g.dry >= 1) { g.win(); g.fx.burst(128, 90, 16, { k: 'star', c: [C.yellow, '#fff', RIZOS_NEON.pink], sp0: 60, sp1: 160 }); }
    }
    if (g.state === 'lost' && g.shakeT < 0) { g.shakeT = g.t; sfx('splash'); g.shake(3, .4); for (let i = 0; i < 26; i++) g.fx.add({ k: 'drop', x: 128 + g.r(-30, 30), y: 100 + g.r(-30, 30), vx: g.r(-260, 260), vy: g.r(-260, 60), g: 300, life: .9, c: pick(['#9bd6f7', '#5aaee6']) }); }
  },
  draw(g, c) {
    rect(c, 0, 0, SW, SH, '#dce7ea'); subwayTiles(c, 0, 0, SW, 150);
    woodFloor(c, 0, 150, SW, 42);
    // puddle growing under him while wet
    const pud = 1 - g.dry; if (pud > .05) { ellipsePx(c, 128, 178, 60 * pud + 10, 7 * pud + 2, '#9bd6f7'); ellipsePx(c, 124, 177, 40 * pud + 6, 4 * pud + 1, '#dff4ff'); }
    const style = g.stage >= 2 ? 'fluffy' : g.stage === 1 ? 'damp' : 'wet';
    const ex = g.state === 'won' ? 'love' : g.state === 'lost' ? 'sadwet' : g.stage >= 2 ? 'cool' : g.stage === 1 ? 'itch' : 'sad';
    const sh = g.shakeT >= 0 ? Math.sin((g.t - g.shakeT) * 50) * 5 * Math.max(0, 1 - (g.t - g.shakeT)) : 0;
    const puff = g.stage >= 3 ? 1.04 + Math.sin(g.t * 6) * .02 : 1;
    rizosDrawSit(c, 128 + sh, 176, ex, style, { sx: puff, sy: puff, rot: sh * .03 });
    // drips from the wet coat
    if (g.stage < 2 && g.state !== 'won') for (let i = 0; i < 5 - g.stage * 2; i++) { const yy = 120 + ((g.t * 70 + i * 31) % 50), xx = 96 + i * 16; vline(c, xx, yy, yy + 2, '#5aaee6'); }
    // the towel follows the finger
    if (IN.down || g.state === 'play') drawS(c, rizosTowelSpr(), g.tx, g.ty, { rot: g.trot, sx: 1 + Math.abs(g.trot) * .2, sy: 1 - Math.abs(g.trot) * .15, alpha: IN.down ? 1 : .6 });
    // splash drops on the "lens" when he shakes it all off at you
    if (g.shakeT >= 0) for (let i = 0; i < 9; i++) { const k = clamp((g.t - g.shakeT) * 4 - i * .1, 0, 1); if (k > 0) { disc(c, 24 + i * 27, 30 + (i % 3) * 44 + k * 20, 7, 'rgba(155,214,247,.55)'); px(c, 21 + i * 27, 27 + (i % 3) * 44 + k * 20, '#ffffff'); } }
  },
  bot(g) { return { x: 128 + Math.sin(g.t * 34) * 30, y: 96 + Math.sin(g.t * 5) * 30, down: g.t > .2 && g.state === 'play' }; },
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
  id: 'vinilo', stage: 'rizos', name: 'DJ Rizos', cmd: '¡PINCHA!', how: 'Frota el disco adelante y atrás para hacer scratch', mech: 'rub', beats: 8,
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
    for (const w of g.wiki) { txt(c, w.s, w.x, w.y - w.t * 30, ['#ff4fa3', '#4ff2ff', '#fff04f'][fl(w.t * 10) % 3], { align: 'c', out: INK, bold: true }); }
    txt(c, 'SCRATCH ' + Math.min(g.count, g.need) + '/' + g.need, 8, 82, '#ffffff', { out: INK, bold: true });
    if (g.state === 'won') shout(c, '¡OTRA, OTRA!', 128, 26, g.t - g.decidedAt);
    if (g.state === 'lost') { txt(c, 'Buuu…', 128, 26, '#b3b8d4', { align: 'c', out: INK, bold: true }); }
  },
  bot(g) { const ph = Math.sin(g.t * 20); return { x: g.cx + 36 + ph * 16, y: g.cy - 30, down: g.t > .2 && g.state === 'play' }; },
});

// ---------------------------------------------------------------- 4 ESPEJO --
defMG({
  id: 'espejo', stage: 'rizos', name: 'Espejo empañado', cmd: '¡LIMPIA!', how: 'Frota el vaho del espejo para ver quién hay', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'vib', v: .6, n: 'E5 . G5 . B5 . . . A5 . G5 . E5 . . . D5 . F5 . A5 . . . G5 - - - . . . .' },
    { i: 'pad', v: .42, n: 'C4+E4+G4+B4 - - - - - - - A3+C4+E4+G4 - - - - - - - D4+F4+A4+C5 - - - - - - - G3+B3+D4+F4 - - - - - - -' },
    { i: 'bass', v: .85, n: 'C3 . . C3 . . G2 . A2 . . A2 . . E2 . D3 . . D3 . . A2 . G2 . . G2 . . B2 .' },
    { i: 'd', v: .6, n: 'k . z . k+c . z z k . z . k+c . z . k . z . k+c . z z k . z . k+c z c c' }] }),
  init(g) {
    g.need = [.58, .68, .76][g.level - 1]; g.regrow = [0, 0, .07][g.level - 1];
    g.rub = rubTracker(); g.mx = 60; g.my = 26; g.mw = 136; g.mh = 116;
    g.cw = g.mw / 4; g.ch = g.mh / 4; g.fog = new Float32Array(g.cw * g.ch).fill(1); g.clear = 0; g.saidHi = false;
    // a finger doodle drawn in the steam: a heart
    for (let i = 0; i < g.fog.length; i++) { const x = i % g.cw, y = fl(i / g.cw); const dx = (x - g.cw * .76) / 4, dy = (y - g.ch * .2) / 4; const hv = Math.pow(dx * dx + dy * dy - 1, 3) - dx * dx * dy * dy * dy; if (Math.abs(hv) < .09) g.fog[i] = .45; }
  },
  update(g, dt) {
    const over = IN.down && IN.x > g.mx - 6 && IN.x < g.mx + g.mw + 6 && IN.y > g.my - 6 && IN.y < g.my + g.mh + 6;
    const gain = g.rub.update(dt, over);
    if (g.regrow && g.state === 'play') for (let i = 0; i < g.fog.length; i++) g.fog[i] = Math.min(1, g.fog[i] + g.regrow * dt);
    if (gain > 0 && g.state === 'play') {
      const cx = (IN.x - g.mx) / 4, cy = (IN.y - g.my) / 4, R = 4.2;
      for (let y = fl(cy - R); y <= cy + R; y++) for (let x = fl(cx - R); x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= g.cw || y >= g.ch) continue;
        const d = Math.hypot(x + .5 - cx, y + .5 - cy); if (d > R) continue;
        const i = y * g.cw + x; g.fog[i] = Math.max(0, g.fog[i] - gain * .03 * (1 - d / R * .7));
      }
      if (fl(g.t * 30) % 4 === 0) g.fx.add({ k: 'drop', x: IN.x + g.r(-6, 6), y: IN.y + 6, vx: 0, vy: g.r(20, 50), g: 200, life: .7, c: '#dff4ff' });
    }
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
    rect(c, mx, my, mw, mh, RAMP.green[2]); greenWall(c, mx, my, mw, mh);
    const ex = g.state === 'won' ? 'love' : g.clear > .35 ? 'grin' : 'cool';
    drawS(c, rizosHead(ex), mx + mw / 2 + Math.sin(g.t * 2) * 2, my + mh - 30, { ax: .5, ay: .8 });
    rect(c, mx + mw / 2 - 20, my + mh - 20, 40, 20, RIZOS_SHIRT[3]); ringRect(c, mx + mw / 2 - 20, my + mh - 20, 40, 21, 1, RIZOS_SHIRT[1]);
    // fog on top
    const cols = ['#eef5f8', '#d9e8ee'];
    for (let y = 0; y < g.ch; y++) for (let x = 0; x < g.cw; x++) {
      const v = g.fog[y * g.cw + x]; if (v < .1) continue;
      const lvl = Math.min(4, Math.ceil(v * 4)), col = (x + y) % 5 === 0 ? cols[1] : cols[0];
      c.drawImage(rizosDitherTile(col, lvl), mx + x * 4, my + y * 4);
    }
    c.restore();
    // steam curling up from below
    for (let i = 0; i < 7; i++) { const ph = (g.t * .6 + i * .14) % 1, x = 40 + i * 30 + Math.sin(g.t * 2 + i) * 8, y = 190 - ph * 70; c.globalAlpha = (1 - ph) * .5; disc(c, x, y, 6 + ph * 8, '#ffffff'); c.globalAlpha = 1; }
    drawPortalFrame(c, 'mirror', mx, my, mw, mh, g.b);
    if (g.state === 'won') shout(c, '¡Guapísimo!', 196, 40, g.t - g.decidedAt);
    // clear-o-meter as a gold tag under the frame
    panel(c, SW / 2 - 34, 172, 68, 14, '#fff8e6', { r: 4 }); txt(c, fl(Math.min(1, g.clear / g.need) * 100) + '%', SW / 2, 176, INK, { align: 'c', bold: true });
  },
  bot(g) {
    // wipe row by row across the glass
    const row = fl(g.t * 3.2) % 7, dir = row % 2 ? -1 : 1, ph = (g.t * 3.2) % 1;
    return { x: 128 + dir * (ph - .5) * 120 + Math.sin(g.t * 55) * 8, y: g.my + 10 + row * 16 + Math.cos(g.t * 47) * 5, down: g.t > .2 && g.state === 'play' };
  },
});

// ---------------------------------------------------------------- 5 RASCAR --
// Rizos belly-up on a shaggy rug; the hind leg is its own sprite so it can kick
function rizosBellyUp() {
  return mdl('rizosBelly', () => {
    const F = RIZOS_FUR, cream = RAMP.cream;
    const bodyS = SD.ellipse(120, 118, 58, 30), body = SD.curls(bodyS, 1.6, .55, 4);
    const belly = SD.ellipse(116, 110, 36, 17);
    const legs = [[82, 100, 70, 62], [104, 96, 100, 58], [148, 98, 156, 60]].map(([a, b, c2, d]) => SD.curls(SD.capsule(a, b, c2, d, 7.5, 6), 1.1, .8, a));
    const paws = [[70, 58], [100, 54], [158, 56]].map(([x, y]) => SD.curls(SD.circle(x, y, 7.5), 1, .9, x));
    const tail = SD.curls(SD.circle(62, 128, 9), 1.5, .8, 2);
    const tx = clumpTex(3.6, .38, 21, 1, 1.2), tx2 = clumpTex(3, .3, 22, 1, 1);
    return model(SW, 170, [
      { f: tail, ramp: F, z: 0, th: 6, tex: tx2 },
      ...legs.map(f => ({ f, ramp: F, z: .5, th: 6, tex: tx2 })),
      ...paws.map(f => ({ f, ramp: F, z: .6, th: 5, tex: tx2, amb: .36 })),
      { f: body, fs: bodyS, ramp: F, z: 1, th: 22, tex: tx },
      { f: belly, ramp: cream, z: 1.4, th: 14, tex: (x, y) => (hash2(fl(x), fl(y), 3) - .5) * .12, edge: false, out: false },
    ], { post: g => { for (let i = 0; i < 6; i++) px(g, 104 + (i % 3) * 12, 106 + fl(i / 3) * 9, RAMP.pink[3]); } });
  });
}
function rizosKickLeg() {
  return mdl('rizosKickLeg', () => {
    const F = RIZOS_FUR, thigh = SD.curls(SD.ellipse(12, 40, 12, 10), 1.2, .8, 2), leg = SD.curls(SD.capsule(14, 36, 40, 12, 7.5, 6), 1.1, .8, 3), paw = SD.curls(SD.ellipse(44, 9, 8.5, 7), 1, .9, 5);
    return model(56, 54, [{ f: thigh, ramp: F, z: 0, th: 8, tex: clumpTex(3.4, .34, 24, 1, 1.1) }, { f: leg, ramp: F, z: 1, th: 6, tex: clumpTex(3, .3, 23, 1, 1) }, { f: paw, ramp: F, z: 2, th: 5, amb: .36 }], { post: g => { for (const [x, y] of [[41, 6], [45, 5], [48, 8]]) { px(g, x, y, '#3e2016'); } disc(g, 45, 12, 2, RAMP.pink[2]); } });
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
  id: 'rascar', stage: 'rizos', name: 'Gustito en la barriga', cmd: '¡RASCA!', how: 'Frota justo donde le pica: ¡la pata se volverá loca!', mech: 'rub', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'squeak', v: .6, n: 'G5 . . G5 . A5 . B5 . . D6 . . B5 . G5 . . G5 . A5 . B5 . . A5 . G5 . . E5 .' },
    { i: 'bass', v: .85, n: 'G2 . G3 . G2 . G3 . C3 . C4 . C3 . C4 . G2 . G3 . G2 . G3 . D3 . D4 . D3 . D4 .' },
    { i: 'd', v: .75, n: RIZOS_DRUM + ' ' + RIZOS_DRUM2 }] }),
  init(g) {
    g.need = [1, 1, 1][g.level - 1]; g.joy = 0; g.kick = 0; g.kickA = 0; g.rub = rubTracker();
    g.rad = [20, 16, 13][g.level - 1];
    g.sx = g.r(96, 140); g.sy = g.r(104, 118); g.tsx = g.sx; g.tsy = g.sy; g.hopT = 1.1;
    g.rate = [1 / 560, 1 / 700, 1 / 800][g.level - 1];
  },
  update(g, dt) {
    // the itch wanders (level 2) or jumps around (level 3)
    if (g.level === 2) { g.tsx = 118 + Math.sin(g.t * 1.3 * g.tempo) * 26; g.tsy = 110 + Math.cos(g.t * 1.1 * g.tempo) * 8; }
    if (g.level === 3) { g.hopT -= dt * g.tempo; if (g.hopT <= 0) { g.hopT = g.r(.8, 1.1); g.tsx = g.r(84, 152); g.tsy = g.r(100, 122); sfx('boing', { pitch: 2, vol: .3 }); } }
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
    c.drawImage(rizosBellyUp(), 0, 16);
    // the kicking hind leg (the famous reflex)
    const a = Math.sin(g.kickA) * (.15 + g.kick * .6);
    drawS(c, rizosKickLeg(), 158, 132, { ax: .2, ay: .75, rot: -.25 + a });
    if (g.kick > .35) for (let i = 0; i < 3; i++) { const an = -.9 + a + i * .25; linePx(c, 158 + Math.cos(an) * 46, 128 + Math.sin(an) * 46, 158 + Math.cos(an) * 54, 128 + Math.sin(an) * 54, '#ffffff'); }
    // head thrown back at the right, tongue out
    const ex = g.state === 'won' ? 'love' : g.state === 'lost' ? 'itch' : g.joy > .5 ? 'grin' : 'itch';
    drawS(c, rizosHead(ex), 204, 120, { rot: -1.9 + Math.sin(g.t * 3) * .05 });
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
  bot(g) { return { x: g.sx + Math.sin(g.t * 40) * Math.min(12, g.rad - 3), y: g.sy + Math.cos(g.t * 33) * 4, down: g.t > .2 && g.state === 'play' }; },
});
