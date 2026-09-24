// ============================================================================
//  Microgames of DON BIGOTES's stage (¡GIRA!): cranks, valves, caps and reels.
//  Every control is spun with circles of the finger (spinTracker).
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared ----
// the bot turns circles around a control (dir 1 = clockwise on screen)
function bigotesBotCircle(g, cx, cy, r, tps = 2.2, dir = 1, t0 = 0) { const a = (g.t - t0) * tps * TAU * dir; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, down: true }; }
// ratchet clicks while spinning (pitch climbs with speed)
function bigotesSpinClicks(g, trk, key = '_clk', step = Math.PI / 3) {
  const n = fl(Math.abs(trk.ang) / step);
  if (n !== g[key]) { g[key] = n; sfx('ratchet', { pitch: 1 + Math.min(1, Math.abs(trk.vel) / 25) * .7, vol: .45 }); }
}
// a crank: rim ring, spokes, hub and a big knob at `ang`; kind 'crank' | 'wheel'
function bigotesCrank(g, cx, cy, r, ang, o = {}) {
  const col = o.col || RAMP.red, S = RAMP.steel, kind = o.kind || 'crank';
  if (kind === 'wheel') {
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; thickLine(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.6, INK); }
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; thickLine(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.4, col[2]); }
    for (const rr of [r - 1, r, r + 1, r + 2]) ringPx(g, cx, cy, rr, rr === r + 2 || rr === r - 1 ? INK : col[rr === r ? 3 : 2]);
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; disc(g, cx + Math.cos(a) * (r + .5), cy + Math.sin(a) * (r + .5), 3.2, INK); disc(g, cx + Math.cos(a) * (r + .5), cy + Math.sin(a) * (r + .5), 2.2, col[3]); }
    disc(g, cx, cy, 5, INK); disc(g, cx, cy, 4, S[3]); px(g, cx - 1, cy - 1, S[4]);
    return;
  }
  // crank: a disc plate, an arm, a knob
  disc(g, cx, cy, r * .55 + 1, INK); disc(g, cx, cy, r * .55, S[2]); disc(g, cx - 2, cy - 2, r * .35, S[3]);
  for (let i = 0; i < 8; i++) { const a = ang * 1 + i / 8 * TAU; px(g, cx + Math.cos(a) * r * .45, cy + Math.sin(a) * r * .45, S[4]); }
  const kx = cx + Math.cos(ang) * r, ky = cy + Math.sin(ang) * r;
  thickLine(g, cx, cy, kx, ky, 3.4, INK); thickLine(g, cx, cy, kx, ky, 2.2, S[3]);
  const kr = o.knob || 6.5, pressed = o.hot;
  disc(g, kx, ky, kr + 1, INK); disc(g, kx, ky, kr, pressed ? col[4] : col[2]); disc(g, kx - kr * .3, ky - kr * .3, kr * .5, col[pressed ? 4 : 3]);
  disc(g, cx, cy, 3.5, INK); disc(g, cx, cy, 2.4, S[4]);
}
// animated circular arrow showing which way to spin
function bigotesSpinHint(g, cx, cy, r, t, dir = 1, col = '#ffffff') {
  // a bold dashed circular arrow + a finger going round it
  const a0 = t * 3 * dir;
  for (let i = 0; i < 26; i++) { if (i % 3 === 2) continue; const a = a0 + dir * i / 26 * TAU * .82; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; rect(g, x - 1, y - 1, 3, 3, INK); rect(g, x, y, 1, 1, col); px(g, x + 1, y, col); px(g, x, y + 1, col); }
  const ae = a0 + dir * TAU * .82, hx = cx + Math.cos(ae) * r, hy = cy + Math.sin(ae) * r, tx = -Math.sin(ae) * dir, ty = Math.cos(ae) * dir;
  polyPx(g, [[hx + tx * 8, hy + ty * 8], [hx - ty * 6 - tx * 2, hy + tx * 6 - ty * 2], [hx + ty * 6 - tx * 2, hy - tx * 6 - ty * 2]], INK);
  polyPx(g, [[hx + tx * 6, hy + ty * 6], [hx - ty * 4 - tx, hy + tx * 4 - ty], [hx + ty * 4 - tx, hy - tx * 4 - ty]], col);
  const fa = t * 5 * dir; drawHand(g, cx + Math.cos(fa) * (r - 4), cy + Math.sin(fa) * (r - 4), true);
}
function bigotesMeterV(g, x, y, w, h, v, col, lbl) {
  rect(g, x, y, w, h, INK); rect(g, x + 1, y + 1, w - 2, h - 2, '#2b2540');
  const fh = rd((h - 2) * clamp(v, 0, 1)); rect(g, x + 1, y + h - 1 - fh, w - 2, fh, col); rect(g, x + 1, y + h - 1 - fh, 1, fh, '#ffffff');
  if (lbl) tiny(g, lbl, x + w / 2, y + h + 3, '#ffffff', { align: 'c' });
}
function bigotesBarH(g, x, y, w, h, v, col) { rect(g, x, y, w, h, INK); rect(g, x + 1, y + 1, w - 2, h - 2, '#2b2540'); const fw = rd((w - 2) * clamp(v, 0, 1)); rect(g, x + 1, y + 1, fw, h - 2, col); rect(g, x + 1, y + 1, fw, 1, '#ffffff'); }
// a comically round, freshly blow-dried westie (90x70)
function bigotesPoofWestie() {
  return mdl('bigotes:poofW', () => {
    const F = RAMP.fur;
    const ballS = SD.circle(40, 36, 26), ball = SD.shag(SD.tufts(ballS, 40, 36, 4.2, 22, 1, 1.4), 1.6, .2, 3);
    const headS = SD.circle(66, 25, 12), head = SD.shag(SD.tufts(headS, 66, 25, 3, 16, 2, 1.5), 1, .3, 5);
    const earN = SD.grow(SD.poly([[62, 16], [66, 3], [71, 14]]), 1.2), earF = SD.grow(SD.poly([[55, 16], [57, 5], [62, 13]]), 1.1);
    const muzzle = SD.ellipse(75, 29, 6.5, 5), tail = SD.tufts(SD.circle(13, 22, 7), 13, 22, 2, 10, 0, 1.5);
    const legs = SD.union(SD.capsule(30, 58, 29, 66, 3, 2.6), SD.capsule(50, 58, 51, 66, 3, 2.6));
    const tx = clumpTex(5, .3, 21, 1.1);
    return model(92, 70, [
      { f: earF, ramp: F.map(c => mixHex(c, '#6c6f9a', .3)), z: 0, th: 3 }, { f: tail, ramp: F, z: .2, th: 5, tex: tx }, { f: legs, ramp: F, z: .4, th: 3 },
      { f: ball, fs: ballS, ramp: F, z: 1, th: 22, tex: tx },
      { f: head, fs: headS, ramp: F, z: 2, th: 11, tex: tx }, { f: earN, ramp: F, z: 2.2, th: 3 },
      { f: muzzle, ramp: F, z: 2.5, th: 5, amb: .4 },
      { f: SD.ellipse(81, 27, 2.6, 2.1), ramp: RAMP.black, z: 3, th: 2, gloss: true },
    ], { post: g => { const K = INK; px(g, 70, 21, K); px(g, 71, 20, K); px(g, 72, 21, K); hline(g, 74, 79, 33, K); rect(g, 75, 34, 3, 3, RAMP.pink[2]); for (let i = 0; i < 3; i++) { px(g, 60 + i * 3, 30, RAMP.pink[3]); } } });
  });
}

// ---------------------------------------------------------------- 1 SECADOR -
function bigotesDryerCage(g, cx, cy, r, blade) {
  // a caged fan: rings, rotating blades, hub
  disc(g, cx, cy, r + 2, INK); disc(g, cx, cy, r + 1, RAMP.steel[1]); disc(g, cx, cy, r - 1, '#2b2540');
  for (let i = 0; i < 4; i++) { const a = blade + i / 4 * TAU; polyPx(g, [[cx, cy], [cx + Math.cos(a - .35) * (r - 2), cy + Math.sin(a - .35) * (r - 2)], [cx + Math.cos(a + .25) * (r - 3), cy + Math.sin(a + .25) * (r - 3)]], i % 2 ? '#e38a45' : '#ffc58a'); }
  for (const rr of [r * .35, r * .7, r - .5]) ringPx(g, cx, cy, rr, RAMP.steel[3]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; linePx(g, cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), RAMP.steel[3]); }
  disc(g, cx, cy, 3, INK); disc(g, cx, cy, 2, RAMP.gold[3]);
}
function bigotesSecadorBg() {
  return mdl('bigotes:secadorBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 150);
    woodFloor(g, 0, 150, SW, 42); rect(g, 0, 148, SW, 2, '#b9cad0');
    // steam-stained lab poster
    rect(g, 12, 14, 40, 30, INK); rect(g, 13, 15, 38, 28, '#fff8e6'); tiny(g, 'SECAR', 32, 18, INK, { align: 'c' }); tiny(g, '=', 32, 25, INK, { align: 'c' }); tiny(g, 'GIRAR', 32, 32, '#c02d45', { align: 'c' });
    return c;
  });
}
defMG({
  id: 'secador', stage: 'bigotes', name: 'Secador a manivela', cmd: '¡SECA!', how: 'Gira la manivela para secar al perro', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'C5 . E5 . G5 . E5 . F5 . A5 . C6 . A5 . G5 . E5 . C5 . E5 . D5 . B4 . C5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . G2 . C3 . G2 . F2 . C3 . F2 . C3 . C3 . G2 . C3 . G2 . G2 . D3 . C3 . . .' },
    { i: 'd', v: .75, n: 'k . s . k . s . k . s . k . s . k . s . k . s . k . s . k s s s' }] }),
  init(g) {
    g.cx = 200; g.cy = 138; g.rad = 26;
    g.trk = spinTracker(g.cx, g.cy); g.dry = 0; g.blade = 0; g.need = [3, 4.2, 5.5][g.level - 1] / Math.sqrt(g.tempo); g.poofT = -1; g.shakeT = -1;
  },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    g.blade += (Math.abs(d) * 3 + .02);
    if (g.state === 'play' && d) {
      bigotesSpinClicks(g, g.trk);
      g.dry = Math.min(1, g.dry + Math.abs(d) / (TAU * g.need));
      // wind + flying drops
      if (FRAME % 2 === 0) g.fx.add({ k: 'spark', x: 172, y: 70 + g.r(-12, 12), vx: -g.r(160, 240), vy: g.r(-10, 10), life: .35, c: '#ffffff', r: 1 });
      if (g.dry < .8 && FRAME % 3 === 0) g.fx.add({ k: 'drop', x: 84 + g.r(-20, 20), y: 112 + g.r(-10, 10), vx: -g.r(60, 140), vy: g.r(-60, 0), g: 300, life: .6, c: pick(['#9bd6f7', '#dff4ff']), floor: 176 });
      if (g.dry > .45 && FRAME % 4 === 0) g.fx.add({ k: 'puff', x: 84 + g.r(-20, 20), y: 100, vx: g.r(-10, 10), vy: -g.r(20, 40), r: 3, life: .6, c: '#ffffff' });
      if (g.dry >= 1) {
        g.win(); g.poofT = g.t; HITSTOP = 4; sfx('boing', { pitch: .8 }); sfx('sparkle'); g.shake(3, .25);
        g.fx.burst(84, 106, 22, { k: 'puff', c: ['#ffffff', '#dfe3f1'], sp0: 40, sp1: 140, r: 5, life0: .4, life1: .8 });
        g.fx.burst(84, 106, 12, { k: 'star', c: [C.yellow, '#fff'], sp0: 60, sp1: 160 });
      }
    }
    if (g.state === 'lost' && g.shakeT < 0) g.shakeT = g.t;
  },
  draw(g, c) {
    c.drawImage(bigotesSecadorBg(), 0, 0);
    // the grooming table and the dog
    groomTable(c, 86, 150, 88);
    const t = g.t;
    if (g.state === 'won') {
      const k = spring(g.t - g.poofT, 2.2, 6);
      drawS(c, bigotesPoofWestie(), 86, 148, { ax: .5, ay: 1, sx: .6 + .4 * k, sy: .6 + .4 * k });
      if (g.t - g.poofT < 1) shout(c, '¡FLUFF!', 86, 42, g.t - g.poofT);
    } else if (g.state === 'lost') {
      const sk = g.t - g.shakeT, wig = Math.sin(sk * 50) * 4 * Math.max(0, 1 - sk);
      drawS(c, westieSide(1.1, 'wet', 'sad'), 86 + wig, 148, { ax: .5, ay: 1 });
      if (sk < .1) for (let i = 0; i < 24; i++) g.fx.add({ k: 'drop', x: 86 + g.r(-30, 30), y: 110 + g.r(-20, 10), vx: g.r(-200, 200), vy: g.r(-220, -40), g: 400, life: .8, c: '#9bd6f7' });
    } else {
      const wet = g.dry < .5, s = 1 + g.dry * .12, wob = Math.sin(t * 9) * g.dry * .02;
      drawS(c, westieSide(1.1, wet ? 'wet' : 'stand', wet ? 'sad' : g.dry > .8 ? 'happy' : 'normal'), 86, 148, { ax: .5, ay: 1, sx: s + wob, sy: s - wob });
      if (wet && fl(t * 8) % 2) px(c, 70 + fl(t * 7) % 30, 140 + fl(t * 23) % 6, '#9bd6f7');
    }
    // the contraption: fan in a cage on a pole, geared to the crank
    rect(c, 196, 72, 6, 60, INK); rect(c, 197, 72, 4, 60, RAMP.steel[2]); rect(c, 197, 72, 1, 60, RAMP.steel[4]);
    bigotesDryerCage(c, 198, 70, 24, g.blade);
    // belt from crank to fan
    linePx(c, 186, 70, 190, 138, '#44424f'); linePx(c, 210, 70, 214, 138, '#44424f');
    const hot = IN.down && dist(IN.x, IN.y, g.cx, g.cy) < 44;
    bigotesCrank(c, g.cx, g.cy, g.rad, g.trk.ang, { hot });
    // dryness gauge on the pole
    bigotesMeterV(c, 226, 90, 10, 50, g.dry, g.dry > .8 ? '#5bd18b' : '#ffdf4f', 'SECO');
    if (g.state === 'play' && Math.abs(g.trk.ang) < TAU * .4) bigotesSpinHint(c, g.cx, g.cy, g.rad + 10, t, 1);
    if (g.state === 'play' && g.dry < .5) txt(c, '¡Brrr!', 60, 70 + Math.sin(t * 20), '#ffffff', { out: INK });
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad, 2.3) : { down: false }; },
});

// ---------------------------------------------------------------- 2 GRIFO ---
function bigotesGlassTub(g, x, y, w, h, lvl, t, o = {}) {
  // a glass tub with graduations; lvl 0..1
  // glass: ink edges only, a pale tint so the tiles show through
  rect(g, x - 1, y, 1, h + 1, INK); rect(g, x + w, y, 1, h + 1, INK); rect(g, x - 1, y + h, w + 2, 1, INK);
  g.globalAlpha = .28; rect(g, x, y, w, h, '#dff4ff'); g.globalAlpha = 1;
  const wy = y + h - rd((h - 4) * lvl) - 2;
  if (lvl > 0) {
    for (let xx = x; xx < x + w; xx++) { const sy = wy + Math.round(Math.sin(xx * .25 + t * 6) * (o.calm ? .5 : 1.5)); g.fillStyle = '#5aaee6'; g.fillRect(xx, sy, 1, y + h - sy); g.fillStyle = '#9bd6f7'; g.fillRect(xx, sy, 1, 2); }
    g.globalAlpha = .35; for (let i = 0; i < 6; i++) { const bx = x + 6 + ((i * 37 + t * 20) % (w - 12)), by = y + h - 4 - ((t * 30 + i * 13) % Math.max(1, h - (wy - y) - 4)); px(g, bx, by, '#ffffff'); } g.globalAlpha = 1;
  }
  // glass highlights + graduations
  rect(g, x + 2, y + 2, 2, h - 4, 'rgba(255,255,255,.45)'); rect(g, x + w - 5, y + 4, 1, h - 8, 'rgba(255,255,255,.3)');
  for (let i = 1; i < 10; i++) { const gy2 = y + h - 2 - rd((h - 4) * i / 10); hline(g, x + w - (i % 5 ? 5 : 9), x + w - 1, gy2, '#dff4ff'); }
  rect(g, x - 3, y - 2, w + 6, 3, INK); rect(g, x - 2, y - 1, w + 4, 1, '#dff4ff');
  return wy;
}
defMG({
  id: 'grifo', stage: 'bigotes', name: 'Hasta la raya', cmd: '¡LLENA!', how: 'Gira el grifo y para justo en la raya', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'organ', v: .5, n: 'E5 - - D5 C5 . B4 . A4 - - . . . . . C5 - - B4 A4 . G#4 . A4 - - . . . . .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 C3 . E3 . A2 . . A2 C3 . E3 . E2 . . E2 G#2 . B2 . A2 . . A2 E2 . A2 .' },
    { i: 'd', v: .75, n: 'k . . s k . s . k . . s k . s . k . . s k . s . k . . s k s s .' }] }),
  init(g) {
    g.cx = 206; g.cy = 50; g.rad = 22;
    g.trk = spinTracker(g.cx, g.cy); g.lvl = 0; g.flow = 0; g.still = 0; g.duck = 0; g.jumpT = -1;
    g.target = [.55, .62, .66][g.level - 1] + g.r(-.04, .04); g.tol = [.09, .075, .06][g.level - 1];
    g.rate = [.16, .22, .27][g.level - 1] * Math.sqrt(g.tempo); // tub fraction per turn-per-second
  },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (d) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
    const want = Math.min(1.4, Math.abs(g.trk.vel) / TAU); // turns per second
    g.flow = IN.down && g.state === 'play' ? lerp(g.flow, want, .25) : g.flow * .75;
    if (g.flow < .02) g.flow = 0;
    g.lvl = Math.min(1, g.lvl + g.flow * g.rate * dt * 2.2);
    if (g.flow > .05 && FRAME % 2 === 0) g.fx.add({ k: 'drop', x: 60 + g.r(-3, 3), y: 176 - (176 - 70) * 0 - (106 * g.lvl) - 2 + 0, vx: g.r(-60, 60), vy: -g.r(40, 120), g: 400, life: .35, c: '#dff4ff' });
    if (g.state !== 'play') { if (g.state === 'won' && g.jumpT < 0) g.jumpT = g.t; return; }
    const top = g.target + g.tol, bot = g.target - g.tol;
    if (g.level === 1) { if (g.lvl >= bot) { g.win(); sfx('splash'); } return; }
    if (g.lvl > top) { g.lose(); sfx('splash', { pitch: .7 }); g.shake(3, .3); for (let i = 0; i < 20; i++) g.fx.add({ k: 'drop', x: g.r(40, 180), y: 70, vx: g.r(-120, 120), vy: -g.r(40, 160), g: 400, life: .8, c: '#9bd6f7' }); return; }
    if (g.lvl >= bot && g.flow === 0) { g.still += dt; if (g.still > .2) { g.win(); sfx('splash'); } } else g.still = 0;
  },
  draw(g, c) {
    c.drawImage(bathBg(), 0, 0);
    const tx = 30, ty = 70, tw = 150, th = 106, t = g.t;
    // the target line on the back of the glass
    const ly = ty + th - 2 - rd((th - 4) * g.target), band = rd((th - 4) * g.tol);
    const inBand = g.lvl >= g.target - g.tol && g.lvl <= g.target + g.tol;
    if (g.level > 1) { c.globalAlpha = .25; rect(c, tx, ly - band, tw, band * 2, inBand ? '#5bd18b' : '#ffdf4f'); c.globalAlpha = 1; }
    for (let x = tx; x < tx + tw; x += 6) rect(c, x, ly, 3, 1, inBand ? '#5bd18b' : '#ff4060');
    const wy = bigotesGlassTub(c, tx, ty, tw, th, g.lvl, t);
    // rubber duck on the water
    const dy = g.lvl > .05 ? wy - 6 + Math.sin(t * 4) * 1.2 : ty + th - 8;
    disc(c, 150, dy + 2, 6, INK); disc(c, 150, dy + 2, 5, '#ffdf4f'); disc(c, 154, dy - 3, 4, INK); disc(c, 154, dy - 3, 3, '#ffdf4f'); rect(c, 157, dy - 3, 3, 2, '#ff9f4f'); px(c, 155, dy - 4, INK);
    // arrow + label at the line
    polyPx(c, [[tx - 12, ly - 4], [tx - 4, ly], [tx - 12, ly + 4]], inBand ? '#5bd18b' : '#ff4060');
    // the lab tap: pipe, spout, stream
    rect(c, 40, 30, 180, 8, INK); rect(c, 41, 31, 178, 6, RAMP.bigotesCopper[2]); rect(c, 41, 31, 178, 1, RAMP.bigotesCopper[4]);
    rect(c, 52, 30, 16, 26, INK); rect(c, 53, 31, 14, 24, RAMP.steel[2]); rect(c, 55, 54, 10, 6, INK); rect(c, 56, 55, 8, 4, RAMP.steel[3]);
    if (g.flow > .03) { const w = Math.max(1, rd(g.flow * 5)); rect(c, 60 - fl(w / 2), 60, w, Math.max(0, wy - 60), '#9bd6f7'); for (let y = 62; y < wy; y += 5) px(c, 60 + ((y + fl(t * 30)) % 3) - 1, y, '#ffffff'); }
    bigotesCrank(c, g.cx, g.cy, g.rad, g.trk.ang, { kind: 'wheel', col: RAMP.red });
    // the dog waits, then jumps in
    if (g.jumpT >= 0) { const k = clamp((g.t - g.jumpT) / .5, 0, 1); drawS(c, westieSide(.7, 'wag', 'happy'), lerp(215, 120, k), lerp(170, wy - 4, k) - Math.sin(k * Math.PI) * 40, { ax: .5, ay: 1, flip: true }); }
    else drawS(c, westieSide(.7, g.state === 'lost' ? 'wet' : 'stand', g.state === 'lost' ? 'sad' : inBand ? 'happy' : 'wow'), 215, 178, { ax: .5, ay: 1, flip: true });
    if (g.state === 'play' && Math.abs(g.trk.ang) < TAU * .4) bigotesSpinHint(c, g.cx, g.cy, g.rad + 9, t, 1);
    if (g.state === 'lost') shout(c, '¡QUE SE SALE!', 110, 50, g.t - g.decidedAt);
    if (g.state === 'play' && inBand && g.level > 1) txt(c, '¡Para ya!', 105, ly - band - 12, '#ffffff', { align: 'c', out: INK, bold: true });
  },
  bot(g) {
    if (g.state !== 'play') return { down: false };
    const stopAt = g.level === 1 ? g.target : g.target - g.tol * .35;
    if (g.lvl + g.flow * g.rate * .45 >= stopAt) return { down: false };
    return bigotesBotCircle(g, g.cx, g.cy, g.rad, g.level === 1 ? 2.4 : 1.6);
  },
});

// ---------------------------------------------------------------- 3 TAPÓN ---
function bigotesShampoo() {
  return mdl('bigotes:shampooBig', () => {
    const G = RAMP.green;
    const body = SD.box(64, 70, 30, 44, 12), shoulder = SD.ellipse(64, 28, 24, 12), neck = SD.box(64, 16, 12, 8, 3);
    return model(128, 116, [{ f: neck, ramp: RAMP.mint, z: 0, th: 5 }, { f: SD.smooth(8, body, shoulder), ramp: RAMP.mint, z: 1, th: 18, gloss: true }], {
      post: g => {
        rect(g, 40, 52, 48, 44, INK); rect(g, 41, 53, 46, 42, '#fff8e6'); rect(g, 41, 53, 46, 3, G[2]);
        drawS(g, westieMini(), 64, 64); tiny(g, 'WB', 64, 74, G[2], { align: 'c' }); tiny(g, 'NATURAL', 64, 82, G[1], { align: 'c' }); tiny(g, 'CHAMPU', 64, 88, INK, { align: 'c' });
      },
    });
  });
}
defMG({
  id: 'tapon', stage: 'bigotes', name: 'El tapón rebelde', cmd: '¡ABRE!', how: 'Desenrosca el tapón (al revés que el reloj)', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'D6 . A5 . F#5 . A5 . D6 . E6 . F#6 . E6 . D6 . A5 . F#5 . A5 . G5 . E5 . D5 - . .' },
    { i: 'sub', v: .7, n: 'D3 . . . A2 . . . D3 . . . A2 . . . G2 . . . D3 . . . A2 . . . D3 . . .' },
    { i: 'd', v: .7, n: 'w . r . w . r . w . r . w . r r w . r . w . r . w . r . w r r r' }] }),
  init(g) {
    g.cx = 128; g.cy = 52; g.trk = spinTracker(g.cx, g.cy);
    g.need = [1.6, 2.2, 3][g.level - 1] / Math.sqrt(g.tempo); g.strict = g.level >= 2;
    g.open = 0; g.popT = -1; g.wrongT = -9; g.capY = 0; g.capVy = 0;
  },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (g.state === 'play' && d) {
      const loosen = g.strict ? -d : Math.abs(d); // counter-clockwise is negative on screen
      g.open = clamp(g.open + loosen / (TAU * g.need), 0, 1);
      if (loosen > 0) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
      else if (d > 0) { if (g.t - g.wrongT > .3) { sfx('ratchet', { pitch: .5 }); } g.wrongT = g.t; }
      if (g.open >= 1) {
        g.win(); g.popT = g.t; g.capVy = -420; HITSTOP = 4; sfx('pop', { pitch: .6 }); sfx('fizz'); sfx('boing', { pitch: 1.4 }); g.shake(4, .3);
        for (let i = 0; i < 40; i++) g.fx.add({ k: i % 3 ? 'puff' : 'bubble', x: 128 + g.r(-8, 8), y: 60, vx: g.r(-120, 120), vy: -g.r(120, 320), g: 380, drag: 1, r: g.r(3, 7), life: g.r(.6, 1.1), c: pick(['#ffffff', '#ffd1e4', '#d2f5e4', '#e2f4ff']) });
      }
    }
    if (g.popT >= 0) { g.capVy += 900 * dt; g.capY += g.capVy * dt; if (FRAME % 2 === 0 && g.t - g.popT < 2) g.fx.add({ k: 'puff', x: 128 + g.r(-6, 6), y: 58, vx: g.r(-40, 40), vy: -g.r(60, 200), g: 300, r: g.r(3, 6), life: .8, c: pick(['#ffffff', '#ffd1e4', '#d2f5e4']) }); }
  },
  draw(g, c) {
    // bathroom shelf backdrop
    c.drawImage(tilesBg(), 0, 0);
    rect(c, 0, 176, SW, 16, RAMP.wood[3]); rect(c, 0, 176, SW, 1, RAMP.wood[4]); rect(c, 0, 175, SW, 1, INK);
    // little bottles around
    for (const [x, col, h] of [[30, '#ff93bf', 34], [56, '#63a0ef', 26], [206, '#ffdf4f', 30], [230, '#bf95e9', 38]]) { rect(c, x - 8, 176 - h, 17, h, INK); rect(c, x - 7, 177 - h, 15, h - 1, col); rect(c, x - 4, 172 - h, 9, 5, INK); rect(c, x - 3, 173 - h, 7, 4, '#ffffff'); rect(c, x - 6, 178 - h, 2, h - 6, 'rgba(255,255,255,.5)'); }
    drawS(c, bigotesShampoo(), 128, 176, { ax: .5, ay: 1, sy: g.popT >= 0 ? 1 + Math.max(0, .15 - (g.t - g.popT) * .5) : 1 });
    // cap: rises with each turn, its ridges rotate with the angle
    const lift = g.open * 12, ang = g.trk.ang;
    if (g.popT < 0 || g.capY > -260) {
      const cy0 = 58 - lift + g.capY, rot = g.popT >= 0 ? (g.t - g.popT) * 14 : 0;
      c.save(); c.translate(128, cy0); c.rotate(rot);
      rect(c, -22, -12, 44, 24, INK); rect(c, -21, -11, 42, 22, '#ff5d9e'); rect(c, -21, -11, 42, 4, '#ff93bf'); rect(c, -21, 8, 42, 3, '#b33a6e');
      for (let i = 0; i < 10; i++) { const x = ((i * 4.2 + ang * 7) % 42 + 42) % 42 - 21; vline(c, rd(x), -7, 7, '#c0406f'); }
      c.restore();
    }
    // the thread showing between bottle and cap
    if (g.popT < 0 && lift > 1) for (let y = 70 - lift; y < 70; y += 2) hline(c, 118, 138, y, (y % 4) ? '#94dcbc' : '#5bb593');
    const wrong = g.t - g.wrongT < .5;
    if (g.state === 'play' && (Math.abs(g.trk.ang) < TAU * .5 || wrong)) bigotesSpinHint(c, g.cx, g.cy, 34, g.t, g.strict ? -1 : 1, wrong ? '#ff4060' : '#ffffff');
    if (wrong && g.state === 'play') txt(c, '¡AL REVÉS!', 128, 104, '#ffffff', { align: 'c', out: '#c02d45', bold: true });
    if (g.state === 'won' && g.t - g.popT < 1.2) shout(c, '¡PLOP!', 180, 40, g.t - g.popT);
    bigotesBarH(c, 88, 184, 80, 6, g.open, '#5bd18b');
  },
  top(g, c) {
    // the cap flies up through the hinge onto the top screen
    if (g.popT < 0) return;
    const yTop = 58 - 12 + g.capY + SH + HINGE;
    if (yTop > -30 && yTop < SH + 30) { c.save(); c.translate(128, yTop); c.rotate((g.t - g.popT) * 14); rect(c, -22, -12, 44, 24, INK); rect(c, -21, -11, 42, 22, '#ff5d9e'); rect(c, -21, -11, 42, 4, '#ff93bf'); c.restore(); }
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, 26, 2.2, -1) : { down: false }; },
});

// ---------------------------------------------------------------- 4 HELADERA
function bigotesParlorBg() {
  return mdl('bigotes:parlorBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#d2f5e4');
    for (let x = 0; x < SW; x += 16) rect(g, x, 0, 8, 150, '#c2ecd8');
    // striped awning
    for (let x = 0; x < SW; x += 20) { rect(g, x, 0, 10, 22, '#ff5d9e'); rect(g, x + 10, 0, 10, 22, '#ffffff'); }
    for (let x = 0; x < SW; x += 20) { disc(g, x + 5, 22, 5, '#ff5d9e'); disc(g, x + 15, 22, 5, '#ffffff'); }
    rect(g, 0, 26, SW, 1, 'rgba(0,0,0,.1)');
    // chalk menu
    rect(g, 16, 40, 60, 44, INK); rect(g, 17, 41, 58, 42, '#26332e'); tiny(g, 'HELADO', 46, 45, '#fff7ae', { align: 'c' }); txt(g, 'gato', 46, 55, '#ffd1e4', { align: 'c' }); txt(g, '& perro', 46, 67, '#b3d9ff', { align: 'c' });
    // counter
    rect(g, 0, 150, SW, 42, RAMP.wood[3]); rect(g, 0, 150, SW, 3, RAMP.wood[4]); rect(g, 0, 149, SW, 1, INK); for (let x = 0; x < SW; x += 32) rect(g, x, 153, 1, 39, RAMP.wood[1]);
    return c;
  });
}
function bigotesChurn(g, x, y, thick) {
  // wooden bucket with brass hoops, ice on top; (x,y) = bottom centre
  const W = 70, H = 70, Wd = RAMP.wood;
  polyPx(g, [[x - W / 2 - 1, y - H - 1], [x + W / 2 + 1, y - H - 1], [x + W / 2 - 5, y + 1], [x - W / 2 + 5, y + 1]], INK);
  polyPx(g, [[x - W / 2, y - H], [x + W / 2, y - H], [x + W / 2 - 6, y], [x - W / 2 + 6, y]], Wd[3]);
  for (let i = -W / 2 + 8; i < W / 2 - 4; i += 9) linePx(g, x + i, y - H, x + i * .85, y, Wd[1]);
  for (const hy of [y - H + 8, y - 12]) { rect(g, x - W / 2 + (hy > y - 20 ? 5 : 1), hy, W - (hy > y - 20 ? 10 : 2), 4, INK); rect(g, x - W / 2 + (hy > y - 20 ? 6 : 2), hy + 1, W - (hy > y - 20 ? 12 : 4), 2, RAMP.gold[3]); }
  // ice chunks rim
  for (let i = 0; i < 9; i++) { const ix = x - W / 2 + 6 + i * 7.5, iy = y - H - 3 + (i % 2) * 2; rect(g, ix, iy, 6, 5, INK); rect(g, ix + 1, iy + 1, 4, 3, i % 3 ? '#dff4ff' : '#9bd6f7'); px(g, ix + 1, iy + 1, '#ffffff'); }
  // cutaway window showing the mix thickening
  const wx = x - 14, wy = y - H + 18;
  rect(g, wx - 1, wy - 1, 30, 30, INK); rect(g, wx, wy, 28, 28, RAMP.steel[3]);
  const mixC = mixHex('#fff4f8', '#ffb3d1', thick);
  rect(g, wx + 2, wy + 2, 24, 24, mixC);
  if (thick < .6) { for (let i = 0; i < 4; i++) { const a = NOW * 6 + i * 1.6; ringPx(g, wx + 14 + Math.cos(a) * 5, wy + 14 + Math.sin(a) * 5, 2, '#ffffff'); } }
  else { for (let i = 0; i < 3; i++) { disc(g, wx + 8 + i * 6, wy + 10 + (i % 2) * 3, 4, '#ffd1e4'); disc(g, wx + 7 + i * 6, wy + 9 + (i % 2) * 3, 2, '#ffffff'); } }
}
defMG({
  id: 'heladera', stage: 'bigotes', name: 'Heladera de manivela', cmd: '¡BATE!', how: 'Gira la manivela hasta que el helado esté cremoso', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .55, n: 'C6 A5 F5 A5 C6 . D6 . C6 A5 F5 A5 G5 . . . A5 F5 C5 F5 A5 . Bb5 . A5 G5 E5 G5 F5 . . .' },
    { i: 'bass', v: .85, n: 'F2 . C3 . F2 . C3 . F2 . C3 . C2 . G2 . F2 . C3 . F2 . C3 . C2 . G2 . F2 . . .' },
    { i: 'd', v: .7, n: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s s s s' }] }),
  init(g) {
    g.cx = 176; g.cy = 70; g.rad = 22; g.trk = spinTracker(g.cx, g.cy);
    g.cream = 0; g.need = [3, 4.2, 5.4][g.level - 1] / Math.sqrt(g.tempo); g.serveT = -1; g.drool = 0;
  },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (g.state === 'play' && d) {
      bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
      // it gets heavier as it thickens: a fast spin still helps, a slow one barely
      const heavy = 1 + g.cream * (g.level >= 2 ? .8 : .3);
      g.cream = Math.min(1, g.cream + Math.abs(d) / (TAU * g.need * heavy) * 1.3);
      if (FRAME % 5 === 0) g.fx.add({ k: 'spark', x: 146 + g.r(-20, 20), y: 84, vx: g.r(-30, 30), vy: -g.r(20, 60), life: .4, c: '#dff4ff', r: 1 });
      if (g.cream >= 1) { g.win(); g.serveT = g.t; HITSTOP = 3; sfx('sparkle'); sfx('gulp', { delay: .3 }); g.shake(2, .15); g.fx.burst(146, 90, 16, { k: 'star', c: [C.yellow, '#fff', C.pinkL] }); }
    }
    g.drool = (g.drool + dt) % 1;
  },
  draw(g, c) {
    c.drawImage(bigotesParlorBg(), 0, 0);
    bigotesChurn(c, 146, 150, g.cream);
    // gearbox + crank on the lid
    rect(c, 128, 60, 36, 22, INK); rect(c, 129, 61, 34, 20, RAMP.steel[2]); rect(c, 129, 61, 34, 2, RAMP.steel[4]);
    bigotesGear(c, 146, 71, 7, g.trk.ang * 2, RAMP.gold);
    const hot = IN.down && dist(IN.x, IN.y, g.cx, g.cy) < 40;
    bigotesCrank(c, g.cx, g.cy, g.rad, g.trk.ang, { hot, col: RAMP.pink });
    // the customers: a westie and the black cat, drooling
    const happy = g.state === 'won';
    drawWestieSit(c, 48, 192, happy ? 'love' : g.state === 'lost' ? 'sad' : 'happy', { tilt: Math.sin(g.t * 3) * .2 });
    // the cat peeks over the counter
    drawS(c, mdl('bigotes:catHeadBig', () => { const c2 = mkCanvas(64, 56); drawCatHead(c2.g, 32, 28); return c2; }), 222, 146 + Math.sin(g.t * 2) * 1.5, {});
    rect(c, 190, 150, 66, 42, RAMP.wood[3]); rect(c, 190, 150, 66, 3, RAMP.wood[4]); rect(c, 190, 149, 66, 1, INK); for (let x = 192; x < SW; x += 32) rect(c, x, 153, 1, 39, RAMP.wood[1]);
    for (const px2 of [207, 237]) { disc(c, px2, 152, 3, INK); disc(c, px2, 151, 2.4, '#141020'); }
    if (!happy && g.state === 'play') { const k = g.drool; vline(c, 50, 170, 170 + k * 8, '#9bd6f7'); }
    // bowls, filled when served
    for (const bx of [48, 222]) { if (bx > 200) { ellipsePx(c, bx, 164, 14, 5, INK); ellipsePx(c, bx, 163, 13, 4, RAMP.steel[3]); if (happy) { const k = clamp((g.t - g.serveT) / .4, 0, 1); disc(c, bx, 160 - k * 4, 6 * k, '#ffd1e4'); disc(c, bx - 1, 158 - k * 5, 3 * k, '#ffffff'); } continue; } ellipsePx(c, bx, 184, 14, 5, INK); ellipsePx(c, bx, 183, 13, 4, RAMP.steel[3]); if (happy) { const k = clamp((g.t - g.serveT) / .4, 0, 1); disc(c, bx, 180 - k * 4, 6 * k, '#ffd1e4'); disc(c, bx - 1, 178 - k * 5, 3 * k, '#ffffff'); } }
    if (happy && g.t - g.serveT < 1.4) { drawHeart(c, 48, 120 - (g.t - g.serveT) * 30, '#ff4060', 1.3); drawHeart(c, 222, 110 - (g.t - g.serveT) * 30, '#ff4060', 1.3); shout(c, '¡CREMOSO!', 146, 38, g.t - g.serveT); }
    bigotesMeterV(c, 190, 96, 10, 50, g.cream, '#ff93bf', 'CREMA');
    if (g.state === 'play' && Math.abs(g.trk.ang) < TAU * .4) bigotesSpinHint(c, g.cx, g.cy, g.rad + 9, g.t, 1);
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad, 2.4) : { down: false }; },
});

// ---------------------------------------------------------------- 5 ENROLLA -
function bigotesStreetBg() {
  return mdl('bigotes:streetSideBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    eixampleFacade(g, 0, -60, SW, 186, 5);
    // the Westie BLVRD door at the far left
    rect(g, 0, 70, 34, 56, INK); rect(g, 0, 71, 33, 55, '#223a36'); rect(g, 3, 74, 27, 49, '#35605a'); ellipsePx(g, 16, 88, 9, 5, INK); ellipsePx(g, 16, 88, 8, 4, '#fffaf0'); tiny(g, 'OPEN', 16, 86, INK, { align: 'c' });
    fillPat(g, panotPat(), 0, 126, SW, 40); rect(g, 0, 124, SW, 2, '#8f8a82');
    rect(g, 0, 166, SW, 4, '#8f8a82'); rect(g, 0, 170, SW, 22, '#4a4852'); for (let x = 0; x < SW; x += 24) rect(g, x, 182, 12, 2, '#d8d6cf');
    planeTrunk(g, 150, 0, 126, 10);
    return c;
  });
}
function bigotesPigeon(g, x, y, t, fly) {
  const flap = fly ? Math.sin(t * 30) : 0;
  ellipsePx(g, x, y, 7, 5, INK); ellipsePx(g, x, y, 6, 4, '#8f8fa8'); disc(g, x + 6, y - 5, 3.5, INK); disc(g, x + 6, y - 5, 2.6, '#7a7a96'); px(g, x + 7, y - 6, '#ffffff'); rect(g, x + 9, y - 5, 2, 1, '#ff9f4f');
  ellipsePx(g, x - 1, y - 1 - flap * 4, 5, 2 + Math.abs(flap) * 2, '#b3b3c8'); px(g, x + 4, y - 2, '#5bd18b');
  if (!fly) { vline(g, x - 1, y + 4, y + 6, '#ff9f4f'); vline(g, x + 2, y + 4, y + 6, '#ff9f4f'); }
}
defMG({
  id: 'enrolla', stage: 'bigotes', name: '¡Que se escapa!', cmd: '¡RECOGE!', how: 'Gira la correa extensible antes de que llegue al charco', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p12', v: .5, n: 'E5 E5 . E5 G5 . E5 . D5 D5 . D5 F#5 . D5 . C5 C5 . C5 E5 . C5 . B4 . D#5 . F#5 . B5 .' },
    { i: 'bass', v: .85, n: 'E3 . B2 . E3 . B2 . D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . B2 . F#2 . B2 . D#3 .' },
    { i: 'd', v: .75, n: 'k s k s k s k s k s k s k s k s k s k s k s k s k s k s k s s s' }] }),
  init(g) {
    g.cx = 44; g.cy = 146; g.rad = 22; g.trk = spinTracker(g.cx, g.cy);
    g.x = [118, 126, 132][g.level - 1]; g.v = [22, 30, 36][g.level - 1] * g.tempo; g.home = 64; g.puddle = 206;
    g.splashT = -1; g.run = 0;
  },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    g.run += dt;
    if (g.state !== 'play') return;
    if (d) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
    const pull = Math.abs(d) * [4.4, 4.8, 5.2][g.level - 1];
    g.x += g.v * dt - pull;
    if (pull > .2 && FRAME % 3 === 0) g.fx.add({ k: 'puff', x: g.x + 6, y: 160, vx: g.r(10, 40), vy: -g.r(5, 20), r: 2.5, life: .4, c: '#dcd6c8' });
    if (g.x <= g.home) { g.x = g.home; g.win(); sfx('bark', { n: 2 }); g.fx.burst(g.x, 130, 10, { k: 'heart', c: '#ff4060', sp0: 20, sp1: 60 }); }
    else if (g.x >= g.puddle) { g.x = g.puddle; g.lose(); g.splashT = g.t; sfx('splash'); g.shake(3, .3); for (let i = 0; i < 26; i++) g.fx.add({ k: 'drop', x: g.puddle + g.r(-16, 16), y: 158, vx: g.r(-140, 140), vy: -g.r(80, 260), g: 500, life: .8, c: pick(['#7c5530', '#a07748', '#5b3a1d']) }); }
  },
  draw(g, c) {
    c.drawImage(bigotesStreetBg(), 0, 0);
    // puddle with the bigotesPigeon
    ellipsePx(c, g.puddle + 4, 162, 26, 5, INK); ellipsePx(c, g.puddle + 4, 161, 25, 4, '#6b5a44'); ellipsePx(c, g.puddle, 160, 16, 2, '#9c8a70');
    const fly = g.state === 'lost', pt = g.t;
    bigotesPigeon(c, g.puddle + 10 + (fly ? (pt - g.splashT) * 60 : 0), 154 - (fly ? (pt - g.splashT) * 90 : Math.abs(Math.sin(pt * 6)) * 2), pt, fly);
    // the dog (mud-covered if it made it)
    const muddy = g.state === 'lost', dragged = IN.down && g.state === 'play' && Math.abs(g.trk.vel) > 2;
    const bob = Math.abs(Math.sin(g.run * (dragged ? 30 : 18))) * 2;
    const dogImg = westieSide(.8, g.state === 'won' ? 'wag' : 'stand', g.state === 'won' ? 'happy' : muddy ? 'sad' : dragged ? 'wow' : 'normal', muddy ? RAMP.mud : RAMP.fur);
    drawS(c, dogImg, g.x, 166 - bob, { ax: .5, ay: 1, rot: dragged ? -.12 : .05 });
    // the leash: from the reel to the collar
    const colX = g.x + 16, colY = 166 - bob - 32;
    const midX = (g.cx + colX) / 2, sag = g.state === 'won' ? 10 : Math.max(0, 8 - Math.abs(g.trk.vel) * .4);
    for (let i = 0; i <= 24; i++) { const k = i / 24, x = lerp(g.cx + 6, colX, k), y = lerp(g.cy - 18, colY, k) + Math.sin(k * Math.PI) * sag; px(c, x, y, '#ff4060'); px(c, x, y + 1, '#7c1830'); }
    void midX;
    // the retractable leash handle (red plastic, big reel)
    rect(c, g.cx - 10, g.cy - 30, 20, 16, INK); rect(c, g.cx - 9, g.cy - 29, 18, 14, '#ec5e5e'); rect(c, g.cx - 9, g.cy - 29, 18, 3, '#ffa39a');
    disc(c, g.cx, g.cy, g.rad + 5, INK); disc(c, g.cx, g.cy, g.rad + 4, '#ec5e5e'); disc(c, g.cx - 3, g.cy - 3, g.rad, '#ffa39a'); disc(c, g.cx, g.cy, g.rad - 2, '#c02d45');
    bigotesCrank(c, g.cx, g.cy, g.rad - 4, g.trk.ang, { col: RAMP.yellow, knob: 5.5, hot: IN.down && dist(IN.x, IN.y, g.cx, g.cy) < 40 });
    // distance meter
    const k = clamp((g.x - g.home) / (g.puddle - g.home), 0, 1);
    bigotesBarH(c, 80, 8, 160, 8, 1 - k, k > .7 ? '#ff4060' : '#5bd18b'); tiny(c, 'CASA', 80, 18, '#ffffff'); tiny(c, 'CHARCO', 240, 18, '#ffffff', { align: 'r' });
    if (g.state === 'play' && Math.abs(g.trk.ang) < TAU * .4) bigotesSpinHint(c, g.cx, g.cy, g.rad + 12, g.t, 1);
    if (g.state === 'lost' && g.t - g.splashT < 1.2) shout(c, '¡CHOF!', 190, 60, g.t - g.splashT);
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad - 4, 2.4) : { down: false }; },
});
