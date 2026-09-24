// ============================================================================
//  Microgames of DON BIGOTES's stage (¡GIRA!): his crank-powered inventions.
//  One visual language for everything you turn: a big knob on a crank (or a
//  valve wheel) circled by a dashed arrow ring that says which way to spin —
//  it lights up while your finger works it — and a meter with a badge at each
//  end that says where you're going ("gota → sol", "leche → helado"…).
// ============================================================================
'use strict';

// ---------------------------------------------------------------- shared ----
// the bot circles around a control (dir 1 = clockwise on screen)
function bigotesBotCircle(g, cx, cy, r, tps = 2.2, dir = 1, t0 = 0) { const a = (g.t - t0) * tps * TAU * dir; return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, down: true }; }
// ratchet clicks while spinning (pitch climbs with speed)
function bigotesSpinClicks(g, trk, key = '_clk', step = Math.PI / 3) {
  const n = fl(Math.abs(trk.ang) / step);
  if (n !== g[key]) { g[key] = n; sfx('ratchet', { pitch: 1 + Math.min(1, Math.abs(trk.vel) / 25) * .7, vol: .45 }); }
}
// a thick circle (or the arc a0→a1) stamped with discs
function bigotesThickRing(g, cx, cy, r, w, c, a0 = 0, a1 = TAU) {
  const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * r / Math.max(.6, w * .5)));
  for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); disc(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, w, c); }
}
// a crank (plate, arm, big knob at `ang`) or a valve wheel (kind: 'wheel')
function bigotesCrank(g, cx, cy, r, ang, o = {}) {
  const col = o.col || RAMP.red, S = RAMP.steel;
  if (o.kind === 'wheel') {
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; thickLine(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.8, INK); }
    bigotesThickRing(g, cx, cy, r, 3.6, INK);
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; thickLine(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5, col[2]); }
    bigotesThickRing(g, cx, cy, r, 2.4, col[2]);
    bigotesThickRing(g, cx, cy, r - .8, .8, col[4], Math.PI * .95, Math.PI * 1.65);
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU, x = cx + Math.cos(a) * (r + 1), y = cy + Math.sin(a) * (r + 1); disc(g, x, y, 3.8, INK); disc(g, x, y, 2.7, o.hot ? col[4] : col[3]); px(g, x - 1, y - 1, '#ffffff'); }
    disc(g, cx, cy, 5.5, INK); disc(g, cx, cy, 4.4, S[3]); px(g, cx - 1, cy - 1, S[4]); px(g, cx - 2, cy - 1, S[4]);
    return;
  }
  disc(g, cx, cy, r * .55 + 1.5, INK); disc(g, cx, cy, r * .55, S[2]); disc(g, cx - 2, cy - 2, r * .38, S[3]);
  for (let i = 0; i < 8; i++) { const a = ang + i / 8 * TAU; px(g, cx + Math.cos(a) * r * .45, cy + Math.sin(a) * r * .45, S[4]); }
  const kx = cx + Math.cos(ang) * r, ky = cy + Math.sin(ang) * r, kr = o.knob || 7, lit = o.hot;
  thickLine(g, cx, cy, kx, ky, 3.6, INK); thickLine(g, cx, cy, kx, ky, 2.3, S[3]); thickLine(g, cx - 1, cy - 1, kx - 1, ky - 1, .6, S[4]);
  disc(g, kx, ky, kr + 1.2, INK); disc(g, kx, ky, kr, lit ? col[3] : col[2]); disc(g, kx - kr * .28, ky - kr * .28, kr * .52, col[lit ? 4 : 3]); px(g, kx - kr * .4, ky - kr * .45, '#ffffff');
  disc(g, cx, cy, 3.8, INK); disc(g, cx, cy, 2.6, S[4]);
}
// dashed arrow ring around a control: which way to turn (dir 1 = clockwise).
// o.active brightens it (finger on it); o.dim turns it into a faint dotted guide.
function bigotesTurnRing(g, cx, cy, r, t, dir = 1, o = {}) {
  const a0 = t * 2.4 * dir, span = TAU * .8, step = 2.2 / r, n = fl(span / step);
  const ae = a0 + dir * span, hx = cx + Math.cos(ae) * r, hy = cy + Math.sin(ae) * r, tx = -Math.sin(ae) * dir, ty = Math.cos(ae) * dir, nx = Math.cos(ae), ny = Math.sin(ae);
  const head = s => [[hx + tx * 7 * s, hy + ty * 7 * s], [hx + nx * 6 * s - tx * 3, hy + ny * 6 * s - ty * 3], [hx - nx * 6 * s - tx * 3, hy - ny * 6 * s - ty * 3]];
  const pts = []; for (let i = 0; i < n; i++) if (i % 7 < 5) { const a = a0 + dir * i * step; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  if (o.dim) { for (let i = 0; i < pts.length; i += 3) px(g, pts[i][0], pts[i][1], 'rgba(255,255,255,.6)'); polyPx(g, head(.6), 'rgba(255,255,255,.6)'); return; }
  const col = o.col || (o.active ? '#fff27a' : '#ffffff');
  for (const [x, y] of pts) disc(g, x, y, 2.3, INK); polyPx(g, head(1.4), INK);
  for (const [x, y] of pts) disc(g, x, y, 1.2, col); polyPx(g, head(1), col);
}
// everything you turn: a glow while touched + crank/wheel + arrow ring
function bigotesTurnable(g, cx, cy, r, ang, t, o = {}) {
  if (o.active) { const rr = r + 6 + Math.sin(t * 20); ringPx(g, cx, cy, rr, '#fff27a'); ringPx(g, cx, cy, rr + 1, '#fff7ae'); }
  bigotesCrank(g, cx, cy, r, ang, { col: o.col, kind: o.kind, knob: o.knob, hot: o.active });
  if (o.ring !== false) bigotesTurnRing(g, cx, cy, r + (o.gap || 12), t, o.dir || 1, { active: o.active, dim: o.dim });
}
// the finger is working a control when it's down near it
const bigotesNear = (x, y, r) => IN.down && dist(IN.x, IN.y, x, y) < r;
// badge icons for the meters (7x7 on a round cream badge)
const BIGOTES_ICONS = {
  drop: ['...k...', '..kbk..', '.kbbbk.', 'kbwbbbk', 'kbwbbbk', '.kbbbk.', '..kkk..'],
  sun: ['o..o..o', '..yyy..', '.yywyy.', 'oyyyyyo', '.yyyyy.', '..yyy..', 'o..o..o'],
  cone: ['..kkk..', '.kpwpk.', 'kpppppk', 'kkkkkkk', '.kcdck.', '..kck..', '...k...'],
  milk: ['..kkk..', '..kwk..', '.kwwwk.', 'kwwwwwk', 'kbbbbbk', 'kwwwwwk', '.kkkkk.'],
  house: ['...k...', '..kgk..', '.kgggk.', 'kgggggk', '.kwkwk.', '.kwkdk.', '.kkkkk.'],
  puddle: ['.......', '..kkkk.', '.kmmmmk', 'kmmwmmk', 'kmmmmk.', '.kkkk..', '.......'],
  dog: ['k...k..', 'kwk.kwk', 'kwwwwwk', 'kwkwkwk', '.kwwwk.', '..kkk..', '.......'],
  spring: ['.kkkkk.', 'kssssk.', '.kkkkk.', '.kssssk', '.kkkkk.', 'kssssk.', '.kkkkk.'],
  bowl: ['.......', '..c.c..', '.ccccc.', 'kkkkkkk', 'krrrrrk', '.krrrk.', '..kkk..'],
};
const BIGOTES_ICON_COLS = { o: '#e56f1d', k: INK, b: '#5aaee6', w: '#ffffff', y: '#ffc21a', p: '#ff93bf', c: '#d58c4c', d: '#8a5a2a', m: '#7c5530', g: '#2a9a6a', s: '#a5afc4', r: '#ec5e5e' };
function bigotesBadge(g, name, x, y, fill = '#fff8e6') {
  x = rd(x); y = rd(y);
  disc(g, x + .5, y + .5, 6.8, INK); disc(g, x + .5, y + .5, 5.8, fill);
  drawS(g, mdl('bigotes:icon:' + name, () => spr(BIGOTES_ICONS[name], BIGOTES_ICON_COLS)), x, y);
}
// horizontal meter with a badge at each end ("from → to"); o.zones = [[a, b, col], …] mark stretches
function bigotesIconMeter(g, x, y, w, v, a, b, col, o = {}) {
  rect(g, x, y, w, 9, INK); rect(g, x + 1, y + 1, w - 2, 7, '#2b2540');
  for (const [za, zb, zc] of o.zones || []) { const z0 = x + 1 + rd((w - 2) * clamp(za, 0, 1)), z1 = x + 1 + rd((w - 2) * clamp(zb, 0, 1)); if (z1 > z0) rect(g, z0, y + 1, z1 - z0, 7, zc); }
  const fw = rd((w - 2) * clamp(v, 0, 1));
  if (fw > 0) { rect(g, x + 1, y + 1, fw, 7, col); rect(g, x + 1, y + 1, fw, 2, 'rgba(255,255,255,.45)'); rect(g, x + fw, y + 1, 1, 7, '#ffffff'); }
  bigotesBadge(g, a, x - 5, y + 4); bigotesBadge(g, b, x + w + 4, y + 4);
}
// a speech bubble centred at x (top y) whose tail points at (tx, ty)
function bigotesSay(g, s, x, y, tx, ty) {
  const w = txtW(s) + 10, h = 15;
  if (tx != null) polyPx(g, [[x - 5, y + h - 2], [x + 4, y + h - 2], [tx, ty]], INK);
  panel(g, x - w / 2, y, w, h, '#ffffff', { r: 4 });
  if (tx != null) polyPx(g, [[x - 3, y + h - 2], [x + 2, y + h - 2], [lerp(x, tx, .75), lerp(y + h - 2, ty, .75)]], '#ffffff');
  txt(g, s, x, y + 4, INK, { align: 'c' });
}
// Keiko sitting, facing us: the westie sit body + her head with the green bandana
function bigotesKeikoSit(g, x, y, ex = 'normal', o = {}) {
  const hd = keikoHead(ex), tilt = o.tilt || 0;
  drawS(g, westieSitBody(), x, y, { ax: .5, ay: 1 });
  drawS(g, hd, x + tilt * 4, y - 36, { ax: .5, ay: .75 * 60 / hd.height, rot: tilt * .18 });
}
// kept for the boss: the dashed arrow + a hand going round
function bigotesSpinHint(g, cx, cy, r, t, dir = 1, col = '#ffffff') {
  bigotesTurnRing(g, cx, cy, r, t, dir, { col });
  const fa = t * 5 * dir; drawHand(g, cx + Math.cos(fa) * (r - 4), cy + Math.sin(fa) * (r - 4), true);
}
function bigotesMeterV(g, x, y, w, h, v, col, lbl) {
  rect(g, x, y, w, h, INK); rect(g, x + 1, y + 1, w - 2, h - 2, '#2b2540');
  const fh = rd((h - 2) * clamp(v, 0, 1)); rect(g, x + 1, y + h - 1 - fh, w - 2, fh, col); rect(g, x + 1, y + h - 1 - fh, 1, fh, '#ffffff');
  if (lbl) tiny(g, lbl, x + w / 2, y + h + 3, '#ffffff', { align: 'c' });
}
function bigotesBarH(g, x, y, w, h, v, col) { rect(g, x, y, w, h, INK); rect(g, x + 1, y + 1, w - 2, h - 2, '#2b2540'); const fw = rd((w - 2) * clamp(v, 0, 1)); rect(g, x + 1, y + 1, fw, h - 2, col); rect(g, x + 1, y + 1, fw, 1, '#ffffff'); }
// a comically round, freshly blow-dried westie (92x70)
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
function bigotesDryerCage(g, cx, cy, r, blade) {
  // a caged fan: rings, rotating blades, hub
  disc(g, cx, cy, r + 2, INK); disc(g, cx, cy, r + 1, RAMP.steel[1]); disc(g, cx, cy, r - 1, '#2b2540');
  for (let i = 0; i < 4; i++) { const a = blade + i / 4 * TAU; polyPx(g, [[cx, cy], [cx + Math.cos(a - .35) * (r - 2), cy + Math.sin(a - .35) * (r - 2)], [cx + Math.cos(a + .25) * (r - 3), cy + Math.sin(a + .25) * (r - 3)]], i % 2 ? '#e38a45' : '#ffc58a'); }
  for (const rr of [r * .35, r * .7, r - .5]) ringPx(g, cx, cy, rr, RAMP.steel[3]);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; linePx(g, cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), RAMP.steel[3]); }
  disc(g, cx, cy, 3, INK); disc(g, cx, cy, 2, RAMP.gold[3]);
}
// bathroom: white tiles, a teal trim, blue-grey floor tiles
function bigotesBathBg() {
  return mdl('bigotes:bathBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, 176, '#b9cad0');
    for (let j = 0; j * 12 < 176; j++) for (let i = -1; i * 16 < SW + 16; i++) { const x = i * 16 + (j % 2) * 8, y = j * 12; rect(g, x + 1, y + 1, 15, 11, '#f2f8f8'); rect(g, x + 1, y + 1, 15, 1, '#ffffff'); rect(g, x + 1, y + 11, 15, 1, '#dce7ea'); }
    rect(g, 0, 132, SW, 4, '#3a9c8c'); rect(g, 0, 132, SW, 1, '#6fd0bf'); rect(g, 0, 136, SW, 1, '#1f5c4a');
    rect(g, 0, 176, SW, 16, '#8fa3ad'); for (let x = 0; x < SW; x += 16) rect(g, x, 177, 15, 15, (x / 16) % 2 ? '#a9bcc4' : '#9bb0b9'); rect(g, 0, 175, SW, 1, INK);
    return c;
  });
}

// ---------------------------------------------------------------- 1 SECADOR -
// Don Bigotes' crank blower: a brass horn aimed at the soaked dog. Turn the
// crank, the belt spins the fan and you SEE the wind blow the water off.
function bigotesHorn() {
  return mdl('bigotes:horn2', () => {
    const G = RAMP.gold, CU = RAMP.bigotesCopper;
    const bell = SD.smooth(4, SD.poly([[8, 4], [52, 24], [52, 44], [8, 64]]), SD.box(58, 34, 6, 9, 3));
    return model(94, 70, [
      { f: SD.circle(74, 34, 17), ramp: CU, z: 0, th: 12, gloss: true },
      { f: bell, ramp: G, z: 1, th: 16, gloss: true },
      { f: SD.ellipse(8, 34, 5, 31), ramp: G, z: 2, th: 4, amb: .45 },
    ], { post: g => { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; px(g, 74 + Math.cos(a) * 12, 34 + Math.sin(a) * 12, CU[4]); } disc(g, 74, 34, 3.5, INK); disc(g, 74, 34, 2.4, G[3]); } });
  });
}
defMG({
  id: 'secador', stage: 'bigotes', name: 'Secador a manivela', cmd: '¡SECA!', how: 'Gira la manivela: el aire secará al perro', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .55, n: 'C5 . E5 . G5 . E5 . F5 . A5 . C6 . A5 . G5 . E5 . C5 . E5 . D5 . B4 . C5 - . .' },
    { i: 'bass', v: .85, n: 'C3 . G2 . C3 . G2 . F2 . C3 . F2 . C3 . C3 . G2 . C3 . G2 . G2 . D3 . C3 . . .' },
    { i: 'd', v: .75, n: 'k . s . k . s . k . s . k . s . k . s . k . s . k . s . k s s s' }] }),
  init(g) {
    g.cx = 212; g.cy = 150; g.rad = 21;
    g.trk = spinTracker(g.cx, g.cy); g.dry = 0; g.air = 0; g.blade = 0; g.belt = 0;
    g.need = [3, 4.2, 5.5][g.level - 1] / Math.sqrt(g.tempo); g.poofT = -1; g.shakeT = -1; g.wind = [];
  },
  hint(g) { return { x: g.cx, y: g.cy, mech: 'spin' }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    g.air = lerp(g.air, g.state === 'play' ? Math.min(1, Math.abs(g.trk.vel) / 14) : 0, .15);
    g.blade += g.air * .9 + .01; g.belt += g.air * dt * 70;
    if (g.air > .1 && FRAME % Math.max(1, rd(4 - g.air * 3)) === 0) g.wind.push({ x: 144, y: 97 + g.r(-22, 20), ph: g.r(TAU), v: 200 + g.air * 180, L: 8 + g.r(0, 12) });
    for (const w of g.wind) { w.x -= w.v * dt; w.ph += dt * 12; }
    g.wind = g.wind.filter(w => w.x > 16);
    if (g.state === 'play' && d) {
      bigotesSpinClicks(g, g.trk);
      g.dry = Math.min(1, g.dry + Math.abs(d) / (TAU * g.need));
      if (g.dry < .85 && FRAME % 2 === 0) g.fx.add({ k: 'drop', x: 80 + g.r(-26, 22), y: 104 + g.r(-14, 12), vx: -g.r(90, 190), vy: g.r(-80, 10), g: 320, life: .6, c: pick(['#9bd6f7', '#dff4ff']), floor: 188 });
      if (g.dry > .45 && FRAME % 5 === 0) g.fx.add({ k: 'puff', x: 80 + g.r(-20, 20), y: 96, vx: -g.r(20, 60), vy: -g.r(10, 30), r: 3, life: .5, c: '#ffffff' });
      if (g.dry >= 1) {
        g.win(); g.poofT = g.t; HITSTOP = 4; sfx('boing', { pitch: .8 }); sfx('sparkle'); g.shake(3, .25);
        g.fx.burst(80, 110, 22, { k: 'puff', c: ['#ffffff', '#dfe3f1'], sp0: 40, sp1: 140, r: 5, life0: .4, life1: .8 });
        g.fx.burst(80, 110, 12, { k: 'star', c: [C.yellow, '#ffffff'], sp0: 60, sp1: 160 });
      }
    }
    if (g.state === 'lost' && g.shakeT < 0) { g.shakeT = g.t; sfx('splash'); for (let i = 0; i < 30; i++) g.fx.add({ k: 'drop', x: 80 + g.r(-30, 30), y: 112 + g.r(-20, 10), vx: g.r(-220, 220), vy: g.r(-240, -40), g: 420, life: .9, c: '#9bd6f7' }); }
  },
  draw(g, c) {
    c.drawImage(bigotesLabBotBackdrop(), 0, 0);
    const t = g.t, hot = bigotesNear(g.cx, g.cy, 46);
    panel(c, 150, 8, 98, 22, '#fff8e6', { r: 3 }); txt(c, 'SECADOR MANUAL', 199, 11, INK, { align: 'c' }); tiny(c, 'PATENTE BIGOTES', 199, 21, '#8a5a2a', { align: 'c' });
    groomTable(c, 80, 152, 100);
    // the dog: soaked → damp → a fluffy ball
    if (g.state === 'won') {
      const k = spring(g.t - g.poofT, 2.2, 6);
      drawS(c, bigotesPoofWestie(), 80, 150, { ax: .5, ay: 1, sx: .6 + .45 * k, sy: .6 + .45 * k });
      if (g.t - g.poofT < 1.2) shout(c, '¡FLUFF!', 84, 48, g.t - g.poofT);
    } else if (g.state === 'lost') {
      const sk = g.t - g.shakeT, wig = Math.sin(sk * 50) * 5 * Math.max(0, 1 - sk);
      drawS(c, westieSide(1.1, 'wet', 'sad'), 80 + wig, 150, { ax: .5, ay: 1 });
      if (sk < 1.2) shout(c, '¡SACUDIDA!', 90, 48, sk);
    } else {
      const wet = g.dry < .5;
      drawS(c, westieSide(1.1, wet ? 'wet' : 'stand', wet ? 'sad' : g.dry > .8 ? 'happy' : 'normal'), 80, 150, { ax: .5, ay: 1, rot: -g.air * .1 });
      if (wet) for (let i = 0; i < 3; i++) { const dy = (t * 40 + i * 13) % 24; rect(c, 62 + i * 14, 134 + dy, 1, 2, '#9bd6f7'); }
      if (g.air < .1 && wet) bigotesSay(c, '¡Brrr!', 96, 54, 104, 80);
    }
    // the blower: belt from the crank up to the fan drum, the horn aimed at the dog
    for (const bx of [205, 217]) { rect(c, bx - 1, 96, 4, 54, INK); rect(c, bx, 96, 2, 54, '#b9803f'); for (let y = 96 + (fl(g.belt) % 6); y < 150; y += 6) rect(c, bx, bx < 210 ? 245 - y : y, 2, 1, '#6e4520'); }
    drawS(c, bigotesHorn(), 138, 63, { ax: 0, ay: 0 });
    ellipsePx(c, 146, 97, 3, 27, '#1b1627');
    for (let i = 0; i < 3; i++) { const y = 97 + Math.sin(g.blade + i * TAU / 3) * 24; rect(c, 145, y - 1, 3, 3, '#ffc58a'); }
    // wind streaks
    for (const w of g.wind) for (let i = 0; i < w.L; i += 2) px(c, w.x + i, w.y + Math.sin(w.ph + i * .3) * 2, i ? '#9bd6f7' : '#ffffff');
    bigotesTurnable(c, g.cx, g.cy, g.rad, g.trk.ang, t, { active: hot, col: RAMP.red, dim: Math.abs(g.trk.ang) > TAU * 1.5 && g.state === 'play', ring: g.state === 'play' });
    bigotesIconMeter(c, 22, 12, 96, g.dry, 'drop', 'sun', g.dry > .8 ? '#5bd18b' : '#ffdf4f');
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad, 2.3) : { down: false }; },
});

// ---------------------------------------------------------------- 2 GRIFO ---
function bigotesGlassTub(g, x, y, w, h, lvl, t, o = {}) {
  // a glass tub with graduations; lvl 0..1 (can exceed 1: it spills). Returns the water line.
  rect(g, x - 1, y, 1, h + 1, INK); rect(g, x + w, y, 1, h + 1, INK); rect(g, x - 1, y + h, w + 2, 1, INK);
  g.globalAlpha = .28; rect(g, x, y, w, h, '#dff4ff'); g.globalAlpha = 1;
  const L = Math.min(1, lvl), wy = y + h - rd((h - 4) * L) - 2;
  if (L > 0) {
    for (let xx = x; xx < x + w; xx++) { const sy = wy + Math.round(Math.sin(xx * .25 + t * 6) * (o.calm ? .5 : 1.5)); g.fillStyle = '#5aaee6'; g.fillRect(xx, sy, 1, y + h - sy); g.fillStyle = '#9bd6f7'; g.fillRect(xx, sy, 1, 2); }
    g.globalAlpha = .35; for (let i = 0; i < 6; i++) { const bx = x + 6 + ((i * 37 + t * 20) % (w - 12)), by = y + h - 4 - ((t * 30 + i * 13) % Math.max(1, h - (wy - y) - 4)); px(g, bx, by, '#ffffff'); } g.globalAlpha = 1;
  }
  rect(g, x + 2, y + 2, 2, h - 4, 'rgba(255,255,255,.45)'); rect(g, x + w - 5, y + 4, 1, h - 8, 'rgba(255,255,255,.3)');
  for (let i = 1; i < 10; i++) { const gy2 = y + h - 2 - rd((h - 4) * i / 10); hline(g, x + w - (i % 5 ? 5 : 9), x + w - 1, gy2, '#dff4ff'); }
  rect(g, x - 3, y - 2, w + 6, 3, INK); rect(g, x - 2, y - 1, w + 4, 1, '#dff4ff');
  return wy;
}
defMG({
  id: 'grifo', stage: 'bigotes', name: 'Hasta la raya', cmd: '¡LLENA!', how: 'Gira el grifo y para cuando el agua llegue a la franja verde', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'organ', v: .5, n: 'E5 - - D5 C5 . B4 . A4 - - . . . . . C5 - - B4 A4 . G#4 . A4 - - . . . . .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 C3 . E3 . A2 . . A2 C3 . E3 . E2 . . E2 G#2 . B2 . A2 . . A2 E2 . A2 .' },
    { i: 'd', v: .75, n: 'k . . s k . s . k . . s k . s . k . . s k . s . k . . s k s s .' }] }),
  init(g) {
    g.cx = 214; g.cy = 52; g.rad = 21;
    g.trk = spinTracker(g.cx, g.cy); g.lvl = 0; g.flow = 0; g.still = 0; g.jumpT = -1; g.spill = 0;
    g.target = [.55, .62, .66][g.level - 1] + g.r(-.04, .04); g.tol = [.1, .075, .06][g.level - 1];
    g.rate = [.16, .22, .27][g.level - 1] * Math.sqrt(g.tempo);
  },
  hint(g) { return { x: g.cx, y: g.cy, mech: 'spin' }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (d) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
    const want = Math.min(1.4, Math.abs(g.trk.vel) / TAU);
    g.flow = IN.down && g.state === 'play' ? lerp(g.flow, want, .25) : g.flow * .75;
    if (g.flow < .02) g.flow = 0;
    g.lvl += g.flow * g.rate * dt * 2.2;
    if (g.flow > .05 && FRAME % 2 === 0) g.fx.add({ k: 'drop', x: 62 + g.r(-3, 3), y: 174 - 102 * Math.min(1, g.lvl), vx: g.r(-60, 60), vy: -g.r(40, 120), g: 400, life: .35, c: '#dff4ff' });
    if (g.state === 'lost') { g.spill = Math.min(1, g.spill + dt * 2); if (FRAME % 2 === 0) g.fx.add({ k: 'drop', x: pick([28, 182]), y: 70, vx: g.r(-30, 30), vy: g.r(10, 60), g: 400, life: .6, c: '#9bd6f7' }); }
    if (g.state !== 'play') { if (g.state === 'won' && g.jumpT < 0) g.jumpT = g.t; return; }
    const top = g.target + g.tol, bot = g.target - g.tol;
    if (g.level === 1) { if (g.lvl >= bot) { g.win(); sfx('splash'); sfx('ding'); } return; }
    if (g.lvl > top) { g.lose(); sfx('splash', { pitch: .7 }); sfx('bad'); g.shake(3, .3); return; }
    if (g.lvl >= bot && g.flow === 0) { g.still += dt; if (g.still > .2) { g.win(); sfx('splash'); sfx('ding'); } } else g.still = 0;
  },
  draw(g, c) {
    c.drawImage(bigotesBathBg(), 0, 0);
    const tx = 30, ty = 70, tw = 150, th = 106, t = g.t, hot = bigotesNear(g.cx, g.cy, 46);
    const ly = rd(ty + th - 2 - (th - 4) * g.target), band = Math.max(3, rd((th - 4) * g.tol));
    const inBand = g.lvl >= g.target - g.tol && g.lvl <= g.target + g.tol;
    // copper pipe from the valve to the brass tap
    rect(c, 50, 28, 166, 9, INK); rect(c, 51, 29, 164, 7, RAMP.bigotesCopper[2]); rect(c, 51, 29, 164, 2, RAMP.bigotesCopper[4]); rect(c, 51, 35, 164, 1, RAMP.bigotesCopper[0]);
    rect(c, 54, 28, 16, 26, INK); rect(c, 55, 29, 14, 24, RAMP.gold[2]); rect(c, 55, 29, 3, 24, RAMP.gold[4]); rect(c, 57, 52, 10, 7, INK); rect(c, 58, 53, 8, 5, RAMP.gold[3]);
    // the goal: a green stripe on the glass
    c.globalAlpha = .3; rect(c, tx, ly - band, tw, band * 2, '#5bd18b'); c.globalAlpha = 1;
    for (let x = tx; x < tx + tw; x += 6) { rect(c, x, ly - band, 3, 1, '#2a9a6a'); rect(c, x, ly + band, 3, 1, '#2a9a6a'); }
    const wy = bigotesGlassTub(c, tx, ty, tw, th, g.lvl, t);
    // rubber duck riding the water
    const dy = g.lvl > .05 ? wy - 5 + Math.sin(t * 4) * 1.2 : ty + th - 8;
    disc(c, 150, dy + 2, 6, INK); disc(c, 150, dy + 2, 5, '#ffdf4f'); disc(c, 154, dy - 3, 4, INK); disc(c, 154, dy - 3, 3, '#ffdf4f'); rect(c, 157, dy - 3, 3, 2, '#ff9f4f'); px(c, 155, dy - 4, INK);
    // the stream
    if (g.flow > .03) { const w = Math.max(1, rd(g.flow * 6)); rect(c, 62 - fl(w / 2), 59, w, Math.max(0, wy - 59), '#9bd6f7'); for (let y = 61; y < wy; y += 5) px(c, 62 + ((y + fl(t * 30)) % 3) - 1, y, '#ffffff'); }
    // arrows pointing at the stripe from both sides of the glass + its label
    for (const [ax, dir] of [[tx + 9, 1], [tx + tw - 10, -1]]) { const bx = ax + Math.sin(t * 10) * 2 * dir; polyPx(c, [[bx - 7 * dir, ly - 8], [bx + 6 * dir, ly], [bx - 7 * dir, ly + 8]], INK); polyPx(c, [[bx - 5 * dir, ly - 5], [bx + 3 * dir, ly], [bx - 5 * dir, ly + 5]], inBand ? '#5bd18b' : '#fff27a'); }
    if (g.state === 'play') { const s = inBand && g.level > 1 ? '¡PARA!' : '¡HASTA AQUÍ!', w = txtW(s) + 10; panel(c, 105 - w / 2, ly - band - 17, w, 14, inBand ? '#5bd18b' : '#ffffff', { r: 4 }); txt(c, s, 105, ly - band - 13, INK, { align: 'c' }); }
    // overflow: water sheets over both rims
    if (g.spill > 0) { for (const sx of [tx - 2, tx + tw + 1]) { const L = rd(g.spill * 106); rect(c, sx - 1, ty, 3, L, '#5aaee6'); px(c, sx, ty + (fl(t * 30) % Math.max(1, L)), '#ffffff'); } shout(c, '¡QUE SE SALE!', 110, 50, g.t - g.decidedAt); }
    bigotesTurnable(c, g.cx, g.cy, g.rad, g.trk.ang, t, { kind: 'wheel', col: RAMP.red, active: hot, gap: 11, dim: Math.abs(g.trk.ang) > TAU && g.state === 'play', ring: g.state === 'play' });
    // Keiko waits for her bath… and dives in
    if (g.jumpT >= 0) {
      const k = clamp((g.t - g.jumpT) / .45, 0, 1), hx = lerp(222, 112, k), hy = lerp(120, wy - 8, k) - Math.sin(k * Math.PI) * 40;
      if (k < 1) drawS(c, keikoHead('happy'), hx, hy, { rot: -k * 4 });
      else {
        drawS(c, keikoHead('happy'), 112, wy - 10 + Math.sin(t * 5) * 1.5, {});
        if (!g._splashed) { g._splashed = 1; sfx('splash', { pitch: 1.3 }); g.fx.burst(112, wy, 16, { k: 'drop', c: ['#9bd6f7', '#ffffff'], sp0: 60, sp1: 160, g: 400 }); }
        if (g.t - g.jumpT < 1.6) shout(c, '¡PERFECTO!', 110, 50, g.t - g.jumpT - .45);
      }
    } else {
      bigotesKeikoSit(c, 224, 186, g.state === 'lost' ? 'sad' : inBand ? 'happy' : 'normal', { tilt: Math.sin(t * 2) * .3 });
      if (g.state === 'play' && g.t < 1.4) bigotesSay(c, '¡Mi baño!', 222, 84, 224, 104);
    }
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
function bigotesCap(g, x, y, ang, rot = 0) {
  // a chunky pink screw cap (56x26): ridges roll with the angle, an engraved ↺ on top
  g.save(); g.translate(rd(x), rd(y)); if (rot) g.rotate(rot);
  rect(g, -28, -13, 56, 26, INK); rect(g, -27, -12, 54, 24, '#ff5d9e'); rect(g, -27, -12, 54, 5, '#ff93bf'); rect(g, -27, 9, 54, 3, '#b33a6e');
  for (let i = 0; i < 12; i++) { const xx = ((i * 4.6 - ang * 8) % 54 + 54) % 54 - 27; vline(g, rd(xx), -6, 8, '#c0406f'); }
  ellipsePx(g, 0, -9, 13, 3, '#ffd1e4'); ellipsePx(g, 0, -9, 11, 2, '#ff93bf'); polyPx(g, [[-10, -12], [-15, -9], [-9, -7]], '#ffffff');
  g.restore();
}
defMG({
  id: 'tapon', stage: 'bigotes', name: 'El tapón rebelde', cmd: '¡ABRE!', how: 'Gira el tapón al revés que las agujas del reloj', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'kalimba', v: .6, n: 'D6 . A5 . F#5 . A5 . D6 . E6 . F#6 . E6 . D6 . A5 . F#5 . A5 . G5 . E5 . D5 - . .' },
    { i: 'sub', v: .7, n: 'D3 . . . A2 . . . D3 . . . A2 . . . G2 . . . D3 . . . A2 . . . D3 . . .' },
    { i: 'd', v: .7, n: 'w . r . w . r . w . r . w . r r w . r . w . r . w . r . w r r r' }] }),
  init(g) {
    g.cx = 104; g.cy = 56; g.trk = spinTracker(g.cx, g.cy);
    g.need = [1.6, 2.2, 3][g.level - 1] / Math.sqrt(g.tempo); g.strict = g.level >= 2;
    g.open = 0; g.popT = -1; g.wrongT = -9; g.capY = 0; g.capVy = 0;
  },
  // the hand draws the circle counter-clockwise (the stage's spin hint only goes clockwise)
  hint(g) { const path = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 - i / 16 * TAU; path.push([g.cx + Math.cos(a) * 18, g.cy + Math.sin(a) * 18]); } return { x: g.cx, y: g.cy, mech: 'drag', path, dir: -1 }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (g.state === 'play' && d) {
      const loosen = g.strict ? -d : Math.abs(d); // counter-clockwise is negative on screen
      g.open = clamp(g.open + loosen / (TAU * g.need), 0, 1);
      if (loosen > 0) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
      else if (d > 0) { if (g.t - g.wrongT > .3) { sfx('ratchet', { pitch: .5 }); sfx('buzz', { vol: .3 }); } g.wrongT = g.t; }
      if (g.open >= 1) {
        g.win(); g.popT = g.t; g.capVy = -420; HITSTOP = 4; sfx('pop', { pitch: .6 }); sfx('fizz'); sfx('boing', { pitch: 1.4 }); g.shake(4, .3);
        for (let i = 0; i < 40; i++) g.fx.add({ k: i % 3 ? 'puff' : 'bubble', x: g.cx + g.r(-8, 8), y: 62, vx: g.r(-120, 120), vy: -g.r(120, 320), g: 380, drag: 1, r: g.r(3, 7), life: g.r(.6, 1.1), c: pick(['#ffffff', '#ffd1e4', '#d2f5e4', '#e2f4ff']) });
      }
    }
    if (g.popT >= 0) { g.capVy += 900 * dt; g.capY += g.capVy * dt; if (FRAME % 2 === 0 && g.t - g.popT < 2) g.fx.add({ k: 'puff', x: g.cx + g.r(-6, 6), y: 60, vx: g.r(-40, 40), vy: -g.r(60, 200), g: 300, r: g.r(3, 6), life: .8, c: pick(['#ffffff', '#ffd1e4', '#d2f5e4']) }); }
  },
  draw(g, c) {
    c.drawImage(bigotesBathBg(), 0, 0);
    // the shelf
    rect(c, 0, 176, SW, 16, RAMP.wood[3]); rect(c, 0, 176, SW, 2, RAMP.wood[4]); rect(c, 0, 175, SW, 1, INK); rect(c, 0, 190, SW, 2, RAMP.wood[1]);
    // Keiko, soaked in her little tub, waits for the shampoo
    const ex = g.state === 'won' ? 'love' : g.state === 'lost' ? 'sad' : 'wow';
    drawS(c, keikoHead(ex), 208, 128 + Math.sin(g.t * 3) * 1.5, {});
    rect(c, 170, 152, 78, 24, INK); rect(c, 171, 153, 76, 22, '#ffffff'); rect(c, 171, 153, 76, 3, '#dce7ea'); rect(c, 171, 171, 76, 4, '#b9cad0');
    for (let x = 174; x < 246; x += 7) { disc(c, x, 152, 4.5, INK); disc(c, x, 152, 3.5, '#ffffff'); }
    if (g.state === 'play' && g.t < 1.5) bigotesSay(c, '¡Champú, porfa!', 208, 66, 210, 94);
    if (g.state === 'won') for (let i = 0; i < 3; i++) drawHeart(c, 196 + i * 12, 86 - ((g.t - g.popT) * 30 + i * 8) % 30, '#ff4060', 1);
    drawS(c, bigotesShampoo(), g.cx, 176, { ax: .5, ay: 1, sy: g.popT >= 0 ? 1 + Math.max(0, .15 - (g.t - g.popT) * .5) : 1 });
    // the cap rises a little with each turn; the thread shows underneath
    const lift = g.open * 12;
    if (g.popT < 0 && lift > 1) for (let y = 71 - lift; y < 71; y += 2) hline(c, g.cx - 10, g.cx + 10, y, (y % 4) ? '#94dcbc' : '#5bb593');
    if (g.popT < 0 || g.capY > -260) bigotesCap(c, g.cx, 58 - lift + g.capY, g.trk.ang, g.popT >= 0 ? (g.t - g.popT) * 14 : 0);
    const wrong = g.t - g.wrongT < .5;
    if (g.state === 'play') bigotesTurnRing(c, g.cx, g.cy, 38, g.t, -1, { active: bigotesNear(g.cx, g.cy, 60), col: wrong ? '#ff4060' : null, dim: !wrong && Math.abs(g.trk.ang) > TAU * 1.2 });
    if (wrong && g.state === 'play') txt(c, '¡AL REVÉS!', g.cx, 104, '#ffffff', { align: 'c', out: '#c02d45', bold: true });
    if (g.state === 'won' && g.t - g.popT < 1.2) shout(c, '¡PLOP!', 160, 40, g.t - g.popT);
    // progress: how open it is
    bigotesBarH(c, 58, 181, 92, 8, g.open, '#5bd18b'); tiny(c, 'ABIERTO', 104, 183, '#ffffff', { align: 'c' });
  },
  top(g, c) {
    // (a microgame with top() doesn't get the stage's how line, so it's written here until the cap flies up)
    if (g.popT < 0) { if (g.t > .8 * g.spb) wrapText(g.def.how, 220).slice(0, 2).forEach((l, i) => txt(c, l, SW / 2, 48 + i * 11 + Math.sin(g.b * Math.PI) * 1.5, '#ffffff', { align: 'c', out: INK })); return; }
    const yTop = 58 - 12 + g.capY + SH + HINGE;
    if (yTop > -30 && yTop < SH + 30) bigotesCap(c, g.cx, yTop, 0, (g.t - g.popT) * 14);
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, 28, 2.2, -1) : { down: false }; },
});

// ---------------------------------------------------------------- 4 HELADERA
function bigotesParlorBg() {
  return mdl('bigotes:parlorBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#d2f5e4');
    for (let x = 0; x < SW; x += 16) rect(g, x, 0, 8, 150, '#c2ecd8');
    for (let x = 0; x < SW; x += 20) { rect(g, x, 0, 10, 22, '#ff5d9e'); rect(g, x + 10, 0, 10, 22, '#ffffff'); }
    for (let x = 0; x < SW; x += 20) { disc(g, x + 5, 22, 5, '#ff5d9e'); disc(g, x + 15, 22, 5, '#ffffff'); }
    rect(g, 0, 150, SW, 42, RAMP.wood[3]); rect(g, 0, 150, SW, 3, RAMP.wood[4]); rect(g, 0, 149, SW, 1, INK); for (let x = 0; x < SW; x += 32) rect(g, x, 153, 1, 39, RAMP.wood[1]);
    return c;
  });
}
function bigotesChurn(g, x, y, thick, t) {
  // wooden bucket with brass hoops, ice on top and a big window into the mix; (x,y) = bottom centre
  const W = 84, H = 84, Wd = RAMP.wood;
  polyPx(g, [[x - W / 2 - 1, y - H - 1], [x + W / 2 + 1, y - H - 1], [x + W / 2 - 5, y + 1], [x - W / 2 + 5, y + 1]], INK);
  polyPx(g, [[x - W / 2, y - H], [x + W / 2, y - H], [x + W / 2 - 6, y], [x - W / 2 + 6, y]], Wd[3]);
  for (let i = -W / 2 + 8; i < W / 2 - 4; i += 9) linePx(g, x + i, y - H, x + i * .86, y, Wd[1]);
  for (const [hy, ins] of [[y - H + 8, 1], [y - 14, 5]]) { rect(g, x - W / 2 + ins, hy, W - ins * 2, 4, INK); rect(g, x - W / 2 + ins + 1, hy + 1, W - ins * 2 - 2, 2, RAMP.gold[3]); }
  for (let i = 0; i < 10; i++) { const ix = x - W / 2 + 6 + i * 7.6, iy = y - H - 3 + (i % 2) * 2; rect(g, ix, iy, 6, 5, INK); rect(g, ix + 1, iy + 1, 4, 3, i % 3 ? '#dff4ff' : '#9bd6f7'); px(g, ix + 1, iy + 1, '#ffffff'); }
  // the window: runny milk → swirls → thick scoopable ice cream
  const wx = x - 22, wy = y - H + 20, ww = 44, wh = 42;
  rect(g, wx - 2, wy - 2, ww + 4, wh + 4, INK); rect(g, wx - 1, wy - 1, ww + 2, wh + 2, RAMP.steel[3]);
  rect(g, wx, wy, ww, wh, mixHex('#fff4f8', '#ff93bf', thick));
  if (thick < .55) { for (let xx = 0; xx < ww; xx++) px(g, wx + xx, wy + 6 + Math.sin(xx * .3 + t * 8) * 2, '#ffffff'); for (let i = 0; i < 5; i++) { const a = t * 7 + i * 1.3; ringPx(g, wx + ww / 2 + Math.cos(a) * 10, wy + wh / 2 + Math.sin(a) * 8, 2, '#ffffff'); } }
  else { for (let i = 0; i < 5; i++) { disc(g, wx + 7 + i * 8, wy + 16 + (i % 2) * 8, 6, mixHex('#ffd1e4', '#ff93bf', thick * .5)); disc(g, wx + 5 + i * 8, wy + 13 + (i % 2) * 8, 2.5, '#ffffff'); } for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; px(g, wx + ww / 2 + Math.cos(a) * 14, wy + wh / 2 + Math.sin(a) * 12, '#c0406f'); } }
  rect(g, wx, wy, 3, wh, 'rgba(255,255,255,.35)');
}
function bigotesCatHead(g, x, y, ex = 'look') {
  const img = mdl('bigotes:cat:' + ex, () => {
    const B = RAMP.black;
    const head = SD.ellipse(24, 22, 15, 13), eL = SD.grow(SD.poly([[11, 16], [12, 2], [21, 11]]), 1.4), eR = SD.grow(SD.poly([[37, 16], [36, 2], [27, 11]]), 1.4);
    return model(48, 40, [{ f: eL, ramp: B, z: 0, th: 3 }, { f: eR, ramp: B, z: 0, th: 3 }, { f: head, ramp: B, z: 1, th: 10 }], { post: g2 => {
      for (const ex0 of [16, 29]) {
        if (ex === 'happy') { px(g2, ex0, 20, '#c8f05a'); px(g2, ex0 + 1, 19, '#c8f05a'); px(g2, ex0 + 2, 19, '#c8f05a'); px(g2, ex0 + 3, 20, '#c8f05a'); }
        else if (ex === 'mad') { rect(g2, ex0, 20, 4, 2, '#c8f05a'); rect(g2, ex0 + 1, 20, 2, 2, INK); linePx(g2, ex0 - 1, ex0 < 20 ? 17 : 18, ex0 + 4, ex0 < 20 ? 18 : 17, INK); }
        else { rect(g2, ex0, 18, 4, 5, '#c8f05a'); rect(g2, ex0 + 1, 19, 2, 4, INK); px(g2, ex0, 18, '#ffffff'); }
      }
      polyPx(g2, [[22, 24], [26, 24], [24, 26]], '#ff93bf'); px(g2, 23, 28, '#5f5883'); px(g2, 25, 28, '#5f5883');
      for (const s of [-1, 1]) for (let i = 0; i < 2; i++) linePx(g2, 24 + s * 5, 25 + i, 24 + s * 13, 23 + i * 3, '#9896a4');
      ellipsePx(g2, 13, 25, 2.5, 1.5, '#8a4a7a'); ellipsePx(g2, 35, 25, 2.5, 1.5, '#8a4a7a');
    } });
  });
  drawS(g, img, x, y);
}
// a black cat with a white bib, sitting; (x, y) = its paws
function bigotesCatSit(g, x, y, ex, t = 0) {
  const body = mdl('bigotes:catBody', () => {
    const B = RAMP.black;
    return model(44, 40, [
      { f: SD.capsule(32, 34, 40, 12, 2.8, 2), ramp: B, z: 0, th: 3 },
      { f: SD.ellipse(21, 24, 13, 15), ramp: B, z: 1, th: 10 },
      { f: SD.union(SD.ellipse(15, 37, 4.5, 3), SD.ellipse(27, 37, 4.5, 3)), ramp: B, z: 2, th: 3 },
    ], { post: g2 => { ellipsePx(g2, 21, 22, 5, 7, '#e1e7f2'); ellipsePx(g2, 21, 21, 3, 4, '#ffffff'); rect(g2, 13, 37, 5, 2, '#e1e7f2'); rect(g2, 25, 37, 5, 2, '#e1e7f2'); } });
  });
  drawS(g, body, x, y, { ax: .48, ay: 1 });
  bigotesCatHead(g, x, y - 36 + Math.sin(t * 2.5) * 1, ex);
}
defMG({
  id: 'heladera', stage: 'bigotes', name: 'Heladera de manivela', cmd: '¡BATE!', how: 'Gira la manivela hasta que el helado esté cremoso', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .55, n: 'C6 A5 F5 A5 C6 . D6 . C6 A5 F5 A5 G5 . . . A5 F5 C5 F5 A5 . Bb5 . A5 G5 E5 G5 F5 . . .' },
    { i: 'bass', v: .85, n: 'F2 . C3 . F2 . C3 . F2 . C3 . C2 . G2 . F2 . C3 . F2 . C3 . C2 . G2 . F2 . . .' },
    { i: 'd', v: .7, n: 'k . h . s . h . k . h . s . h h k . h . s . h . k . h . s s s s' }] }),
  init(g) {
    g.cx = 202; g.cy = 74; g.rad = 21; g.trk = spinTracker(g.cx, g.cy);
    g.cream = 0; g.need = [3, 4.2, 5.4][g.level - 1] / Math.sqrt(g.tempo); g.serveT = -1; g.strain = 0;
  },
  hint(g) { return { x: g.cx, y: g.cy, mech: 'spin' }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    g.strain = Math.max(0, g.strain - dt * 2);
    if (g.state === 'play' && d) {
      bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
      const heavy = 1 + g.cream * (g.level >= 2 ? .8 : .3);
      g.cream = Math.min(1, g.cream + Math.abs(d) / (TAU * g.need * heavy) * 1.3);
      g.strain = Math.min(1, g.cream * (g.level >= 2 ? 1 : .5));
      if (FRAME % 5 === 0) g.fx.add({ k: 'spark', x: 106 + g.r(-30, 30), y: 64, vx: g.r(-30, 30), vy: -g.r(20, 60), life: .4, c: '#dff4ff', r: 1 });
      if (g.cream >= 1) { g.win(); g.serveT = g.t; HITSTOP = 3; sfx('sparkle'); sfx('gulp', { delay: .3 }); g.shake(2, .15); g.fx.burst(106, 90, 16, { k: 'star', c: [C.yellow, '#ffffff', C.pinkL] }); }
    }
  },
  draw(g, c) {
    c.drawImage(bigotesParlorBg(), 0, 0);
    const hot = bigotesNear(g.cx, g.cy, 46), won = g.state === 'won', t = g.t;
    bigotesChurn(c, 106, 150, g.cream, t);
    // gearbox on the bucket + shaft to the side crank
    rect(c, 146, g.cy - 4, g.cx - 146, 8, INK); rect(c, 147, g.cy - 3, g.cx - 147, 6, RAMP.steel[2]); rect(c, 147, g.cy - 3, g.cx - 147, 1, RAMP.steel[4]);
    rect(c, 136, g.cy - 12, 16, 24, INK); rect(c, 137, g.cy - 11, 14, 22, RAMP.steel[3]); bigotesGear(c, 144, g.cy, 6, g.trk.ang * 2, RAMP.gold);
    const sx = g.strain > .3 && hot ? Math.sin(t * 50) * g.strain * 1.5 : 0;
    bigotesTurnable(c, g.cx + sx, g.cy, g.rad, g.trk.ang, t, { active: hot, col: RAMP.pink, dim: Math.abs(g.trk.ang) > TAU * 1.5 && g.state === 'play', ring: g.state === 'play' });
    if (g.strain > .4 && hot && g.state === 'play') txt(c, '¡Cuesta!', g.cx, g.cy + 38, '#ffffff', { align: 'c', out: INK });
    // the customers: Keiko (left) and a black cat (right), bowls ready
    bigotesKeikoSit(c, 30, 170, won ? 'love' : g.state === 'lost' ? 'sad' : 'happy', { tilt: Math.sin(t * 3) * .3 });
    bigotesCatSit(c, 232, 172, won ? 'happy' : g.state === 'lost' ? 'mad' : 'look', t);
    if (g.state === 'play') { disc(c, 42, 88, 2, INK); disc(c, 42, 88, 1.2, '#ffffff'); disc(c, 46, 80, 3, INK); disc(c, 46, 80, 2.2, '#ffffff'); bigotesBadge(c, 'cone', 50, 68, '#ffffff'); }
    for (const bx of [30, 226]) {
      ellipsePx(c, bx, 180, 17, 6, INK); ellipsePx(c, bx, 179, 16, 5, RAMP.steel[3]); ellipsePx(c, bx, 178, 12, 3, RAMP.steel[1]);
      if (won) { const k = clamp((t - g.serveT) / .4, 0, 1); disc(c, bx, 174 - k * 3, 7 * k, '#ff93bf'); disc(c, bx - 2, 171 - k * 4, 3 * k, '#ffffff'); }
    }
    if (won && t - g.serveT < 1.4) { drawHeart(c, 30, 86 - (t - g.serveT) * 30, '#ff4060', 1.3); drawHeart(c, 232, 104 - (t - g.serveT) * 30, '#ff4060', 1.3); shout(c, '¡CREMOSO!', 106, 44, t - g.serveT); }
    bigotesIconMeter(c, 60, 32, 96, g.cream, 'milk', 'cone', '#ff93bf');
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad, 2.4) : { down: false }; },
});

// ---------------------------------------------------------------- 5 ENROLLA -
function bigotesStreetBg() {
  return mdl('bigotes:streetSideBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    eixampleFacade(g, 0, -60, SW, 186, 5);
    rect(g, 0, 70, 34, 56, INK); rect(g, 0, 71, 33, 55, '#223a36'); rect(g, 3, 74, 27, 49, '#35605a'); ellipsePx(g, 16, 88, 9, 5, INK); ellipsePx(g, 16, 88, 8, 4, '#fffaf0'); tiny(g, 'WB', 16, 86, RAMP.green[2], { align: 'c' });
    fillPat(g, panotPat(), 0, 126, SW, 40); rect(g, 0, 124, SW, 2, '#8f8a82');
    rect(g, 0, 166, SW, 4, '#8f8a82'); rect(g, 0, 170, SW, 22, '#4a4852'); for (let x = 0; x < SW; x += 24) rect(g, x, 182, 12, 2, '#d8d6cf');
    planeTrunk(g, 150, 0, 126, 10);
    return c;
  });
}
function bigotesPigeon(g, x, y, t, fly) {
  const flap = fly ? Math.sin(t * 30) : 0;
  ellipsePx(g, x, y, 8, 6, INK); ellipsePx(g, x, y, 7, 5, '#8f8fa8'); disc(g, x + 7, y - 6, 4, INK); disc(g, x + 7, y - 6, 3, '#7a7a96'); px(g, x + 8, y - 7, '#ffffff'); px(g, x + 8, y - 6, INK); rect(g, x + 10, y - 6, 3, 1, '#ff9f4f');
  ellipsePx(g, x - 1, y - 1 - flap * 5, 6, 2 + Math.abs(flap) * 3, '#b3b3c8'); px(g, x + 4, y - 2, '#5bd18b'); px(g, x + 5, y - 2, '#bf95e9');
  if (!fly) { vline(g, x - 1, y + 5, y + 7, '#ff9f4f'); vline(g, x + 2, y + 5, y + 7, '#ff9f4f'); }
}
defMG({
  id: 'enrolla', stage: 'bigotes', name: '¡Que se escapa!', cmd: '¡RECOGE!', how: 'Gira la manivela de la correa antes de que llegue al charco', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p12', v: .5, n: 'E5 E5 . E5 G5 . E5 . D5 D5 . D5 F#5 . D5 . C5 C5 . C5 E5 . C5 . B4 . D#5 . F#5 . B5 .' },
    { i: 'bass', v: .85, n: 'E3 . B2 . E3 . B2 . D3 . A2 . D3 . A2 . C3 . G2 . C3 . G2 . B2 . F#2 . B2 . D#3 .' },
    { i: 'd', v: .75, n: 'k s k s k s k s k s k s k s k s k s k s k s k s k s k s k s s s' }] }),
  init(g) {
    g.cx = 42; g.cy = 146; g.rad = 17; g.trk = spinTracker(g.cx, g.cy);
    g.x = [140, 146, 150][g.level - 1]; g.v = [22, 30, 36][g.level - 1] * g.tempo; g.home = 102; g.puddle = 210;
    g.splashT = -1; g.run = 0;
  },
  hint(g) { return { x: g.cx, y: g.cy, mech: 'spin' }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    g.run += dt;
    if (g.state !== 'play') return;
    if (d) bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
    const pull = Math.abs(d) * [4.4, 4.8, 5.2][g.level - 1];
    g.x += g.v * dt - pull;
    if (pull > .2 && FRAME % 3 === 0) g.fx.add({ k: 'puff', x: g.x + 6, y: 162, vx: g.r(10, 40), vy: -g.r(5, 20), r: 2.5, life: .4, c: '#dcd6c8' });
    if (g.x <= g.home) { g.x = g.home; g.win(); sfx('bark', { n: 2 }); g.fx.burst(g.x, 126, 10, { k: 'heart', c: '#ff4060', sp0: 20, sp1: 60 }); }
    else if (g.x >= g.puddle) { g.x = g.puddle; g.lose(); g.splashT = g.t; sfx('splash'); g.shake(3, .3); for (let i = 0; i < 26; i++) g.fx.add({ k: 'drop', x: g.puddle + g.r(-16, 16), y: 158, vx: g.r(-140, 140), vy: -g.r(80, 260), g: 500, life: .8, c: pick(['#7c5530', '#a07748', '#5b3a1d']) }); }
  },
  draw(g, c) {
    c.drawImage(bigotesStreetBg(), 0, 0);
    const k = clamp((g.x - g.home) / (g.puddle - g.home), 0, 1), danger = k > .7 && g.state === 'play', t = g.t;
    // the puddle (flashes red when the dog gets close) and the pigeon that lures him
    if (danger && fl(t * 8) % 2) { c.globalAlpha = .35; ellipsePx(c, g.puddle + 4, 162, 34, 9, '#ff4060'); c.globalAlpha = 1; }
    ellipsePx(c, g.puddle + 4, 162, 28, 6, INK); ellipsePx(c, g.puddle + 4, 161, 27, 5, '#6b5a44'); ellipsePx(c, g.puddle, 160, 18, 2, '#9c8a70');
    const fly = g.state === 'lost';
    bigotesPigeon(c, g.puddle + 14 + (fly ? (t - g.splashT) * 60 : 0), 152 - (fly ? (t - g.splashT) * 90 : Math.abs(Math.sin(t * 6)) * 2), t, fly);
    if (g.state === 'play' && g.t < 1.4) bigotesSay(c, '¡Cu-curru!', 214, 116, 222, 142);
    // the dog pulls towards the pigeon (muddy if he gets there)
    const muddy = g.state === 'lost', dragged = IN.down && g.state === 'play' && Math.abs(g.trk.vel) > 2;
    const bob = Math.abs(Math.sin(g.run * (dragged ? 30 : 18))) * 2;
    drawS(c, westieSide(.8, g.state === 'won' ? 'wag' : 'stand', g.state === 'won' ? 'happy' : muddy ? 'sad' : dragged ? 'wow' : 'normal', muddy ? RAMP.mud : RAMP.fur), g.x, 166 - bob, { ax: .5, ay: 1, rot: dragged ? -.12 : .08 });
    if (!dragged && g.state === 'play') for (let i = 0; i < 3; i++) px(c, g.x - 32 - i * 6, 152 + (i % 2) * 3, '#ffffff');
    // the leash: taut while reeling
    const colX = g.x + 16, colY = 166 - bob - 32, sag = g.state === 'won' ? 10 : Math.max(0, 8 - Math.abs(g.trk.vel) * .4), rx = g.cx + 10, ry = g.cy - 22;
    for (let i = 0; i <= 32; i++) { const q = i / 32, x = lerp(rx, colX, q), y = lerp(ry, colY, q) + Math.sin(q * Math.PI) * sag; px(c, x, y, '#ff4060'); px(c, x, y + 1, '#7c1830'); }
    // the retractable leash: a big red reel with a yellow crank on its face
    rect(c, g.cx - 3, g.cy - 30, 18, 12, INK); rect(c, g.cx - 2, g.cy - 29, 16, 10, '#ec5e5e'); rect(c, g.cx - 2, g.cy - 29, 16, 2, '#ffa39a');
    disc(c, g.cx, g.cy, 27, INK); disc(c, g.cx, g.cy, 26, '#ec5e5e'); disc(c, g.cx - 3, g.cy - 3, 21, '#ffa39a'); disc(c, g.cx, g.cy, 21, '#c02d45');
    const hot = bigotesNear(g.cx, g.cy, 46);
    bigotesTurnable(c, g.cx, g.cy, g.rad, g.trk.ang, t, { col: RAMP.yellow, knob: 6, active: hot, gap: 14, dim: Math.abs(g.trk.ang) > TAU * 1.5 && g.state === 'play', ring: g.state === 'play' });
    // the street in a strip: house ← dog → puddle
    const mx0 = 108, mx1 = 226, my = 14;
    rect(c, mx0, my - 2, mx1 - mx0, 5, INK); rect(c, mx0, my - 1, mx1 - mx0, 3, '#fff8e6'); rect(c, lerp(mx0, mx1, .7), my - 1, (mx1 - mx0) * .3, 3, '#ff9fae');
    bigotesBadge(c, 'house', mx0 - 5, my); bigotesBadge(c, 'puddle', mx1 + 5, my);
    bigotesBadge(c, 'dog', lerp(mx0 + 6, mx1 - 6, k), my + 1, danger ? '#ff4060' : '#5bd18b');
    if (g.state === 'lost' && g.t - g.splashT < 1.2) shout(c, '¡CHOF!', 190, 64, g.t - g.splashT);
    if (g.state === 'won') shout(c, '¡A CASA!', 128, 64, g.t - g.decidedAt);
  },
  bot(g) { return g.state === 'play' ? bigotesBotCircle(g, g.cx, g.cy, g.rad, 2.4) : { down: false }; },
});

// ---------------------------------------------------------------- 6 BIGOTE --
// Gala portrait: circle round each moustache tip to curl it into a spiral.
// Level 1: one side is already done (so you can see the goal). Level 3: stop
// inside the green stretch or the tip ties itself in a knot.
function bigotesStudioBg() {
  return mdl('bigotes:studioBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, R = RAMP.red;
    for (let x = 0; x < SW; x++) { const f = Math.sin(x / 13) * .5 + .5, k = 1 + clamp(fl(f * 2.99 + bayer(x, 0) * .4 - .2), 0, 2); g.fillStyle = f > .95 ? R[4] : R[k]; g.fillRect(x, 0, 1, SH); }
    for (let x = 0; x < SW; x++) { const e = Math.min(x, SW - 1 - x); if (e < 18) for (let y = 0; y < SH; y++) if (bayer(x, y) > e / 18) { g.fillStyle = R[0]; g.fillRect(x, y, 1, 1); } }
    g.globalAlpha = .18; disc(g, 128, 78, 78, '#ffffff'); g.globalAlpha = .12; disc(g, 128, 78, 56, '#ffffff'); g.globalAlpha = 1;
    rect(g, 0, 0, SW, 8, R[0]); for (let x = 0; x < SW; x += 16) rect(g, x, 8, 8, 3, R[0]); rect(g, 0, 0, SW, 3, RAMP.gold[2]);
    return c;
  });
}
// Don Bigotes' face close up (150x150): the stage head's design at portrait size
function bigotesGalaFace() {
  return mdl('bigotes:galaFace', () => {
    const SP = RAMP.bigotesSalt, BD = RAMP.bigotesBeard;
    const speck = (x, y) => (hash2(fl(x / 2), fl(y / 2), 11) - .5) * .42;
    const t1 = clumpTex(9, .26, 6, 1.2), tb = clumpTex(6, .22, 8, 1.9);
    const EAR = SP.map((c, i) => i < 4 ? SP[Math.max(0, i - 1)] : SP[3]);
    const MB = ['#8a8997', '#b9b8c4', '#dddce5', '#f3f3f7', '#ffffff'];
    const earL = SD.grow(SD.poly([[24, 36], [52, 22], [30, 64]]), 4), earR = SD.grow(SD.poly([[126, 36], [98, 22], [120, 64]]), 4);
    const skull = SD.smooth(10, SD.box(75, 62, 31, 24, 12), SD.ellipse(75, 44, 29, 21)), cheeks = SD.box(75, 79, 30, 16, 12);
    const strap = SD.box(75, 30, 34, 3.6, 1.8);
    const gL = SD.circle(58, 29, 12), gR = SD.circle(92, 29, 12), lL = SD.circle(58, 29, 8), lR = SD.circle(92, 29, 8);
    const browLs = SD.ellipse(52, 49, 22, 9, .18), browRs = SD.ellipse(98, 49, 22, 9, -.18);
    const browL = SD.tufts(browLs, 60, 54, 4, 13, .7, 2.2), browR = SD.tufts(browRs, 90, 54, 4, 13, 2.1, 2.2);
    const muzzle = SD.box(75, 83, 20, 14, 9);
    const mouS = SD.union(SD.ellipse(58, 92, 19, 11, .3), SD.ellipse(92, 92, 19, 11, -.3));
    const mous = SD.tufts(mouS, 75, 86, 3, 18, 1.3, 2);
    const beardS = SD.grow(SD.poly([[52, 96], [98, 96], [96, 118], [85, 134], [75, 141], [65, 134], [54, 118]]), 3);
    const beard = SD.tufts(beardS, 75, 104, 4.5, 16, .2, 2.4);
    return model(150, 150, [
      { f: earL, ramp: EAR, z: 1.5, th: 8, tex: speck }, { f: earR, ramp: EAR, z: 1.5, th: 8, tex: speck },
      { f: skull, ramp: SP, z: 1, th: 26, tex: (x, y) => speck(x, y) + t1(x, y) },
      { f: cheeks, ramp: SP, z: 1.2, th: 16, tex: speck },
      { f: strap, ramp: RAMP.wood, z: 1.55, th: 4 },
      { f: gL, ramp: RAMP.gold, z: 1.7, th: 6 }, { f: gR, ramp: RAMP.gold, z: 1.7, th: 6 },
      { f: lL, ramp: RAMP.bigotesLens, z: 1.8, th: 6, gloss: true, edge: false }, { f: lR, ramp: RAMP.bigotesLens, z: 1.8, th: 6, gloss: true, edge: false },
      { f: muzzle, ramp: SP, z: 2, th: 12, tex: speck },
      { f: beard, fs: beardS, ramp: BD, z: 2.6, th: 14, tex: tb },
      { f: browL, fs: browLs, ramp: BD, z: 2.8, th: 8, tex: tb }, { f: browR, fs: browRs, ramp: BD, z: 2.8, th: 8, tex: tb },
      { f: mous, fs: mouS, ramp: MB, z: 3, th: 10, tex: tb },
      { f: SD.box(75, 77, 10, 7, 5.4), ramp: RAMP.black, z: 4, th: 6, gloss: true },
    ], { post: g => { ellipsePx(g, 71, 79, 2, 1.5, '#0b0810'); ellipsePx(g, 79, 79, 2, 1.5, '#0b0810'); } });
  });
}
// eyes + rosy cheeks + mouth painted on the portrait (drawn at fx, fy); look = -1..1
function bigotesGalaExpr(g, fx, fy, ex, look) {
  const K = '#0b0810';
  for (const [ex0, ey0] of [[fx + 58, fy + 63], [fx + 92, fy + 63]]) {
    ellipsePx(g, ex0 + (ex0 < fx + 75 ? -7 : 7), ey0 + 10, 5, 2.5, '#e8878f');
    if (ex === 'joy') { for (let i = -4; i <= 4; i++) { const yy = ey0 + 1 - Math.round(Math.cos(i / 4 * 1.3) * 3); px(g, ex0 + i, yy, K); px(g, ex0 + i, yy + 1, K); } }
    else if (ex === 'sad') { hline(g, ex0 - 4, ex0 + 4, ey0 + 2, K); hline(g, ex0 - 3, ex0 + 3, ey0 + 3, K); px(g, ex0 + (ex0 < fx + 75 ? 3 : -3), ey0 + 6, '#9bd6f7'); }
    else { const o = rd(look * 1.5); ellipsePx(g, ex0, ey0, 5.5, 5, K); rect(g, ex0 - 3 + o, ey0 - 3, 3, 3, '#ffffff'); px(g, ex0 + 2 + o, ey0 + 2, '#8f8a99'); }
  }
  if (ex === 'joy') { ellipsePx(g, fx + 75, fy + 106, 9, 5, '#3e0d1c'); ellipsePx(g, fx + 75, fy + 108, 6, 3, RAMP.pink[2]); hline(g, fx + 68, fx + 82, fy + 102, '#ffffff'); }
  else if (ex === 'sad') { for (let i = -6; i <= 6; i++) px(g, fx + 75 + i, fy + 106 - Math.round(Math.cos(i / 6 * 1.2) * 2), K); }
}
// a moustache strand from its base (bx, by) out to a spiral around (sx, sy); curl 0..1+
function bigotesCurlStrand(g, side, bx, by, sx, sy, curl) {
  const R0 = 11, Tx = sx, Ty = sy + R0, pts = [];
  // the long hair from the moustache to where the spiral starts (a slight droop)
  const mx = lerp(bx, Tx, .5), my = lerp(by, Ty, .5) + 7;
  for (let i = 0; i <= 14; i++) { const q = i / 14, a = (1 - q) * (1 - q), b2 = 2 * (1 - q) * q, c2 = q * q; pts.push([a * bx + b2 * mx + c2 * Tx, a * by + b2 * my + c2 * Ty]); }
  // the spiral: outwards first, then up and back in (left tip clockwise, the right one mirrored)
  const turn = Math.min(curl, 1.45) * 1.25 * TAU, n = Math.ceil(turn / .2);
  for (let i = 1; i <= n; i++) { const th = Math.PI / 2 + turn * i / n, r = R0 * (1 - .6 * (th - Math.PI / 2) / (1.8 * TAU)); pts.push([sx - side * r * Math.cos(th), sy + r * Math.sin(th)]); }
  // the hair that isn't curled yet hangs limp, drooping as it goes
  const rest = Math.max(0, 1 - curl) * 22;
  if (rest > 0) {
    let [lx, ly] = pts[pts.length - 1];
    const th = Math.PI / 2 + turn; let dx = side * Math.sin(th), dy = Math.cos(th);
    for (let i = 1; i <= 6; i++) { dy += .35; const m = Math.hypot(dx, dy); dx /= m; dy /= m; lx += dx * rest / 6; ly += dy * rest / 6; pts.push([lx, ly]); }
  }
  const W = i => lerp(3.2, 1.4, i / (pts.length - 1));
  for (let i = 1; i < pts.length; i++) thickLine(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], W(i) + 1, INK);
  for (let i = 1; i < pts.length; i++) thickLine(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], W(i), RAMP.bigotesBeard[3]);
  for (let i = 2; i < pts.length - 1; i += 2) px(g, pts[i][0], pts[i][1] - 1, '#ffffff');
  return pts[pts.length - 1];
}
// a ring gauge around the tip, filling in the turning direction as the curl grows
function bigotesArcGauge(g, cx, cy, r, v, dir, o = {}) {
  const a0 = -Math.PI / 2, f = clamp(v, 0, 1), col = o.col || '#fff27a';
  bigotesThickRing(g, cx, cy, r, 3.4, INK);
  bigotesThickRing(g, cx, cy, r, 2.2, '#2b2540');
  if (o.zone) bigotesThickRing(g, cx, cy, r, 2.2, '#2d8a5f', a0 + dir * o.zone[0] * TAU, a0 + dir * o.zone[1] * TAU);
  if (f > .01) bigotesThickRing(g, cx, cy, r, 2.2, col, a0, a0 + dir * f * TAU);
  // arrowhead at the front of the fill
  const ae = a0 + dir * f * TAU, hx = cx + Math.cos(ae) * r, hy = cy + Math.sin(ae) * r, tx = -Math.sin(ae) * dir, ty = Math.cos(ae) * dir, nx = Math.cos(ae), ny = Math.sin(ae);
  polyPx(g, [[hx + tx * 9, hy + ty * 9], [hx + nx * 7 - tx * 2, hy + ny * 7 - ty * 2], [hx - nx * 7 - tx * 2, hy - ny * 7 - ty * 2]], INK);
  polyPx(g, [[hx + tx * 7, hy + ty * 7], [hx + nx * 5 - tx, hy + ny * 5 - ty], [hx - nx * 5 - tx, hy - ny * 5 - ty]], col);
}
const bigotesTipAt = side => [128 + side * 88, 90];
defMG({
  id: 'bigote', stage: 'bigotes', name: 'Bigote de gala', cmd: '¡RIZA!', how: 'Haz círculos en la punta del bigote para rizarlo', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'organ', v: .5, n: 'A4 - - E5 . . A5 . G#5 - - E5 . . B4 . C5 - - A4 . . E5 . D5 C5 B4 A4 G#4 - A4 .' },
    { i: 'bass', v: .85, n: 'A2 . . A2 E3 . A2 . E2 . . E2 B2 . E2 . A2 . . A2 E3 . A2 . E2 . . E2 B2 . A2 .' },
    { i: 'd', v: .7, n: 'k . . s k . s . k . . s k . s . k . . s k . s . k . . s k s s s' }] }),
  init(g) {
    g.sides = g.level === 1 ? [-1] : [-1, 1]; g.si = 0;
    g.curl = { '-1': 0, '1': g.level === 1 ? 1 : 0 };
    g.turns = [1.3, 1.4, 1.5][g.level - 1] / Math.sqrt(g.tempo); g.limit = g.level === 3 ? 1.4 : 99;
    g.idle = 0; g.doneT = -1; g.knotT = -1; g.nextT = -9;
    const [x, y] = bigotesTipAt(-1); g.trk = spinTracker(x, y);
  },
  hint(g) { const [x, y] = bigotesTipAt(g.sides[Math.min(g.si, g.sides.length - 1)]); return { x, y, mech: 'spin' }; },
  update(g, dt) {
    if (g.state !== 'play') return;
    const s = g.sides[g.si], d = g.trk.update(dt);
    if (d) {
      bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 2);
      g.curl[s] += Math.abs(d) / (TAU * g.turns);
      if (FRAME % 4 === 0) g.fx.add({ k: 'spark', x: g.trk.cx + g.r(-12, 12), y: g.trk.cy + g.r(-12, 12), vx: g.r(-30, 30), vy: -g.r(10, 40), life: .3, c: '#ffffff', r: 1.5 });
    }
    const cu = g.curl[s];
    if (cu > g.limit) { g.lose(); g.knotT = g.t; sfx('squish', { pitch: .6 }); sfx('bad'); g.shake(3, .3); return; }
    let done = false;
    if (g.level < 3) done = cu >= 1;
    else if (cu >= 1) { g.idle = !IN.down || Math.abs(g.trk.vel) < 1.5 ? g.idle + dt : 0; done = g.idle > .12; }
    if (!done) return;
    sfx('ding', { pitch: 1 + g.si * .25 }); g.fx.burst(g.trk.cx, g.trk.cy, 12, { k: 'star', c: [C.yellow, '#ffffff'], sp0: 40, sp1: 110 });
    g.si++; g.idle = 0;
    if (g.si >= g.sides.length) { g.win(); g.doneT = g.t; sfx('shutter', { delay: .15 }); sfx('sparkle', { delay: .2 }); flash('bot', '#ffffff', .15, .8); HITSTOP = 4; }
    else { const [x, y] = bigotesTipAt(g.sides[g.si]); g.trk = spinTracker(x, y); g.nextT = g.t; sfx('boing', { pitch: 1.3 }); }
  },
  draw(g, c) {
    c.drawImage(bigotesStudioBg(), 0, 0);
    const t = g.t, fx = 53, fy = 2, s = g.sides[Math.min(g.si, g.sides.length - 1)];
    // tuxedo + bow tie: it's a gala portrait
    polyPx(c, [[36, 192], [70, 150], [186, 150], [220, 192]], INK); polyPx(c, [[38, 192], [71, 152], [185, 152], [218, 192]], '#2b2540');
    polyPx(c, [[104, 150], [152, 150], [128, 192]], '#ffffff'); polyPx(c, [[92, 150], [108, 150], [124, 188], [86, 180]], '#40395e'); polyPx(c, [[164, 150], [148, 150], [132, 188], [170, 180]], '#40395e');
    const bw = Math.sin(t * 6) * .8;
    polyPx(c, [[128, 158], [104, 148 - bw], [104, 170 + bw]], INK); polyPx(c, [[128, 158], [152, 148 + bw], [152, 170 - bw]], INK);
    polyPx(c, [[128, 158], [106, 150 - bw], [106, 168 + bw]], '#e23b4e'); polyPx(c, [[128, 158], [150, 150 + bw], [150, 168 - bw]], '#e23b4e');
    disc(c, 128, 158, 5, INK); disc(c, 128, 158, 4, '#c02d45'); for (const [dx, dy] of [[-16, -3], [-12, 5], [14, -2], [16, 6]]) px(c, 128 + dx, 158 + dy, '#ffd1e4');
    const ex = g.state === 'won' ? 'joy' : g.state === 'lost' ? 'sad' : 'normal', hop = g.state === 'won' ? -Math.abs(Math.sin(t * 8)) * 2 : 0;
    drawS(c, bigotesGalaFace(), fx, fy + hop, { ax: 0, ay: 0 });
    bigotesGalaExpr(c, fx, fy + hop, ex, s);
    // the two strands (they come out from under the moustache)
    for (const sd of [-1, 1]) {
      const [sx, sy] = bigotesTipAt(sd);
      const end = bigotesCurlStrand(c, sd, 128 + sd * 33, 98 + hop, sx, sy, g.curl[sd]);
      if (g.knotT >= 0 && sd === s) { const [kx, ky] = end; disc(c, kx, ky, 8, INK); disc(c, kx, ky, 7, RAMP.bigotesBeard[2]); for (let i = 0; i < 5; i++) linePx(c, kx - 5 + i * 2, ky - 5, kx + 5 - i * 2, ky + 5, RAMP.bigotesBeard[0]); shout(c, '¡NUDO!', clamp(kx, 40, 216), ky - 34, g.t - g.knotT); }
    }
    if (g.level === 1 && g.state === 'play') { const [sx, sy] = bigotesTipAt(1); drawStar(c, sx + 16, sy - 14, 5, '#fff27a', t * 2); }
    // the tip to curl: a ring that fills as it curls (level 3: stop in the green)
    if (g.state === 'play') {
      const [sx, sy] = bigotesTipAt(s), dir = s < 0 ? 1 : -1, cu = g.curl[s];
      if (g.level === 3) bigotesArcGauge(c, sx, sy, 25, cu / g.limit, dir, { zone: [1 / g.limit, .97], col: cu >= 1 ? '#5bd18b' : '#fff27a' });
      else bigotesArcGauge(c, sx, sy, 25, cu, dir);
      if (g.t - g.nextT < .8) { const ax = lerp(128, sx - s * 36, E.outBack(Math.min(1, (g.t - g.nextT) * 2))); polyPx(c, [[ax - 12 * s, sy - 9], [ax, sy], [ax - 12 * s, sy + 9]], INK); polyPx(c, [[ax - 11 * s, sy - 6], [ax - 3 * s, sy], [ax - 11 * s, sy + 6]], '#fff27a'); }
      if (g.level === 3 && cu >= 1 && IN.down) txt(c, '¡SUELTA!', sx, sy + 33, '#ffffff', { align: 'c', out: '#2a9a6a', bold: true });
    }
    if (g.state === 'won' && g.t - g.doneT < 1.5) { shout(c, '¡MAGNÍFICO!', 128, 176, g.t - g.doneT); for (let i = 0; i < 5; i++) drawStar(c, 24 + i * 52, 22 + Math.sin(t * 8 + i) * 4, 3.5, '#fff27a', t * 3 + i); }
  },
  bot(g) {
    if (g.state !== 'play') return { down: false };
    const s = g.sides[g.si], cu = g.curl[s];
    if (g.level === 3 && cu >= 1.1) return { down: false };
    const [x, y] = bigotesTipAt(s);
    return bigotesBotCircle(g, x, y, 18, 2.3, s < 0 ? 1 : -1);
  },
});

// ---------------------------------------------------------------- 7 CUERDA --
// Robo-Keiko, Don Bigotes' tin westie: hold her and wind the key on her back
// (a ghost shows where she'll get to), then let go and she marches to her
// bowl. Level 3: wind past the red and the spring goes ¡SPROING!
function bigotesRobot(frame, broken) {
  return mdl('bigotes:robo' + frame + (broken ? 'b' : ''), () => {
    const T = ['#3f4a63', '#6b7a96', '#9fb0c9', '#d3deec', '#f4f8fd'], G = RAMP.green;
    const lp = frame === 1 ? 3 : frame === 2 ? -3 : 0;
    const body = SD.box(38, 38, 22, 13, 8), head = SD.box(64, 24, 13, 12, 6), snout = SD.box(78, 29, 6, 5, 3);
    const earA = SD.grow(SD.poly([[55, 14], [58, 1], [63, 12]]), 1.2), earB = SD.grow(SD.poly([[65, 13], [70, 1], [73, 13]]), 1.2);
    const legs = SD.union(SD.box(22 - lp, 55, 3.5, 6, 1.5), SD.box(33 + lp, 55, 3.5, 6, 1.5), SD.box(46 - lp, 55, 3.5, 6, 1.5), SD.box(55 + lp, 55, 3.5, 6, 1.5));
    const tail = SD.capsule(17, 30, 9, 18, 3, 2);
    const scarf = SD.poly([[52, 34], [72, 34], [62, 46]]);
    return model(90, 64, [
      { f: tail, ramp: T, z: 0, th: 3 }, { f: legs, ramp: T, z: .5, th: 3 },
      { f: body, ramp: T, z: 1, th: 12, gloss: true }, { f: earA, ramp: T, z: 1.5, th: 3 }, { f: earB, ramp: T, z: 1.5, th: 3 },
      { f: head, ramp: T, z: 2, th: 10, gloss: true }, { f: snout, ramp: T, z: 2.5, th: 4 },
      { f: scarf, ramp: G, z: 3, th: 3 },
    ], { post: g => {
      for (const [x, y] of [[21, 31], [31, 29], [41, 29], [51, 31], [21, 45], [31, 47], [41, 47], [51, 45]]) { px(g, x, y, T[4]); px(g, x + 1, y + 1, T[1]); }
      hline(g, 18, 58, 38, T[1]);
      // lamp eye, rosy cheek, nose, antenna, the bandana's paw prints
      disc(g, 66, 21, 3.5, INK); disc(g, 66, 21, 2.5, broken ? '#44424f' : '#fff27a'); px(g, 65, 20, '#ffffff');
      ellipsePx(g, 69, 29, 2.5, 1.5, '#ff8fa3'); disc(g, 83, 27, 2.2, INK); px(g, 82, 26, '#5f5883');
      vline(g, 60, 3, 12, INK); disc(g, 60, 3, 2.2, broken ? '#44424f' : '#ff4060'); px(g, 59, 2, '#ffffff');
      px(g, 59, 37, '#ffffff'); px(g, 64, 37, '#ffffff'); px(g, 62, 41, '#ffffff');
    } });
  });
}
function bigotesWindKey(g, x, y, ang, stub) {
  // butterfly key centred on its wings (x, y); as it turns, the wings flip edge-on
  const w = Math.cos(ang) * 11, aw = Math.max(1.5, Math.abs(w) / 2 + 1);
  rect(g, x - 2, y + 4, 4, 11, INK); rect(g, x - 1, y + 4, 2, 11, RAMP.gold[2]);
  if (stub) return;
  ellipsePx(g, x - w / 2, y, aw, 7, INK); ellipsePx(g, x + w / 2, y, aw, 7, INK);
  ellipsePx(g, x - w / 2, y, aw - 1, 6, RAMP.gold[3]); ellipsePx(g, x + w / 2, y, aw - 1, 6, RAMP.gold[w > 0 ? 4 : 2]);
  disc(g, x, y, 2.4, INK); px(g, x, y, RAMP.gold[4]);
}
const bigotesKeyAt = g => [g.x - 8, 104 - (g.held ? 4 : 0)];
defMG({
  id: 'cuerda', stage: 'bigotes', name: 'Robo-Keiko', cmd: '¡DA CUERDA!', how: 'Gira la llave hasta que su sombra llegue al cuenco… y suelta', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .5, n: 'C6 . G5 . E5 . G5 . C6 . D6 . E6 . C6 . A5 . F5 . A5 . C6 . B5 . G5 . D6 - . .' },
    { i: 'kalimba', v: .6, n: 'C4 . . . G3 . . . C4 . . . G3 . . . F3 . . . C4 . . . G3 . . . G3 . B3 .' },
    { i: 'd', v: .6, n: 'w . r . w . r . w . r . w . r r w . r . w . r . w . r . w r w r' }] }),
  init(g) {
    g.x0 = 62; g.x = g.x0; g.goal = [150, 180, 180][g.level - 1];
    const turns = [1.3, 1.8, 1.8][g.level - 1] / Math.sqrt(g.tempo);
    g.pxPerTurn = (g.goal - g.x0) / turns; g.fuel = 0; g.limit = g.level === 3 ? (g.goal - g.x0) * 1.3 : 1e9;
    g.speed = 125 * g.tempo; g.walkT = 0; g.keyA = 0; g.held = false; g.brokenT = -1; g.munchT = -1;
    const [kx, ky] = bigotesKeyAt(g); g.trk = spinTracker(kx, ky);
  },
  hint(g) { const [x, y] = bigotesKeyAt(g); return { x, y, mech: 'spin' }; },
  update(g, dt) {
    const [kx0, ky0] = bigotesKeyAt(g);
    g.held = g.state === 'play' && IN.down && dist(IN.x, IN.y, kx0, ky0) < 64;
    const [kx, ky] = bigotesKeyAt(g); g.trk.cx = kx; g.trk.cy = ky;
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (d && g.held) {
      g.fuel += Math.abs(d) / TAU * g.pxPerTurn; g.keyA += Math.abs(d) * 2; bigotesSpinClicks(g, g.trk, '_clk', Math.PI / 3);
      if (g.fuel > g.limit) { g.lose(); g.brokenT = g.t; g.fuel = 0; sfx('boing', { pitch: .5 }); sfx('bad'); g.shake(4, .3); g.fx.burst(kx, ky, 16, { k: 'spark', c: ['#ffffff', '#fff27a'], sp0: 60, sp1: 160 }); return; }
    }
    // let go and the spring drives the walk (slowing down as it runs out)
    if (!g.held && g.fuel > 0 && g.munchT < 0 && g.brokenT < 0) {
      const v = Math.min(g.speed, g.fuel * 7 + 36), dx = Math.min(g.fuel, v * dt);
      g.x += dx; g.fuel -= dx; g.walkT += dt; g.keyA -= dx / g.pxPerTurn * TAU;
      if (fl(g.walkT * 9) !== g._stp) { g._stp = fl(g.walkT * 9); sfx('tick', { pitch: 1.4 + (g._stp % 2) * .2, vol: .5 }); }
    }
    if (g.state === 'play' && g.x >= g.goal) { g.x = g.goal; g.fuel = 0; g.win(); g.munchT = g.t; sfx('gulp'); sfx('sparkle', { delay: .2 }); g.fx.burst(g.goal + 46, 148, 12, { k: 'star', c: [C.yellow, '#ffffff', C.pinkL] }); }
  },
  draw(g, c) {
    c.drawImage(bigotesLabBotBackdrop(), 0, 0);
    const t = g.t, bowlX = g.goal + 46;
    panel(c, 188, 40, 62, 18, '#fff8e6', { r: 3 }); tiny(c, 'ROBO-KEIKO', 219, 44, INK, { align: 'c' }); tiny(c, 'MODELO 1.0', 219, 51, '#8a5a2a', { align: 'c' });
    // the workbench
    rect(c, 0, 158, SW, 12, INK); rect(c, 0, 159, SW, 10, RAMP.wood[3]); rect(c, 0, 159, SW, 2, RAMP.wood[4]); for (let x = 8; x < SW; x += 40) rect(c, x, 162, 12, 1, RAMP.wood[2]);
    // the finish: a chequered line and the bowl of treats
    for (let y = 132; y < 158; y += 4) { rect(c, g.goal + 30, y, 2, 2, '#ffffff'); rect(c, g.goal + 32, y + 2, 2, 2, '#ffffff'); }
    ellipsePx(c, bowlX, 157, 17, 5, INK); ellipsePx(c, bowlX, 156, 16, 4, RAMP.red[3]); ellipsePx(c, bowlX, 154, 12, 2.5, RAMP.red[1]);
    if (g.munchT < 0) for (let i = 0; i < 5; i++) disc(c, bowlX - 8 + i * 4, 152 - (i % 2), 2, '#d58c4c');
    // where she'll get to with the spring as it is: a ghost of her
    const broken = g.brokenT >= 0, land = Math.min(g.goal, g.x + g.fuel), ok = g.x + g.fuel >= g.goal;
    if (g.state === 'play' && g.fuel > 2) {
      const gh = mdl('bigotes:roboGhost' + (ok ? 'ok' : ''), () => silhouette(bigotesRobot(0, false), ok ? '#5bd18b' : '#ffffff'));
      c.globalAlpha = .45; drawS(c, gh, land, 158, { ax: .45, ay: 1 }); c.globalAlpha = 1;
      for (let x = g.x + 26; x < land - 16; x += 6) rect(c, x, 154, 3, 1, ok ? '#5bd18b' : '#ffffff');
    }
    // Robo-Keiko: lifted while you hold her (legs kicking), marching once you let go
    const walking = !g.held && g.fuel > 0 && g.munchT < 0 && !broken;
    const frame = walking ? 1 + fl(g.walkT * 9) % 2 : g.held ? 1 + fl(t * 14) % 2 : 0;
    const lift = g.held ? 4 : walking ? fl(g.walkT * 9) % 2 : 0, tip = g.state === 'lost' && !broken ? Math.min(1, (g.t - g.decidedAt) * 4) * .5 : 0;
    drawS(c, bigotesRobot(frame, broken), g.x, 158 - lift, { ax: .45, ay: 1, rot: -tip });
    const [kx, ky] = bigotesKeyAt(g);
    bigotesWindKey(c, kx, ky - (g.held ? 0 : lift), g.keyA, broken);
    if (broken) { const k = g.t - g.brokenT; bigotesWindKey(c, kx - k * 50, ky - k * 140 + k * k * 300, k * 20, false); for (let i = 0; i < 6; i++) ringPx(c, kx + i * 2, ky + 8 - i * 4 - Math.min(1, k * 4) * 16, 4, '#e1e7f2'); shout(c, '¡SPROING!', 128, 56, k); }
    if (g.munchT >= 0) { shout(c, '¡ÑAM!', bowlX - 10, 100, g.t - g.munchT); drawHeart(c, g.x + 30, 92 - (g.t - g.munchT) * 20, '#ff4060', 1.2); }
    if (g.state === 'lost' && !broken) shout(c, '¡CLONC!', g.x, 86, g.t - g.decidedAt);
    // the controls: an arrow ring on the key, the spring's tension
    if (g.state === 'play' && !walking && !ok) bigotesTurnRing(c, kx, ky, 24, t, 1, { active: g.held });
    if (g.state === 'play' && ok && g.held) txt(c, '¡SUELTA!', g.x, 66, '#ffffff', { align: 'c', out: '#2a9a6a', bold: true });
    const cap = g.level === 3 ? g.limit : (g.goal - g.x0) * 1.2, tv = clamp(g.fuel / cap, 0, 1), need = clamp((g.goal - g.x) / cap, 0, 1);
    const zones = [[need, 1, '#2d5a45']]; if (g.level === 3) zones.push([.88, 1, '#7a1f30']);
    bigotesIconMeter(c, 70, 14, 116, tv, 'spring', 'bowl', g.level === 3 && tv > .88 ? '#ff4060' : tv >= need ? '#5bd18b' : '#fff27a', { zones });
    txt(c, 'CUERDA', 128, 26, '#ffffff', { align: 'c', out: INK });
  },
  bot(g) {
    if (g.state !== 'play') return { down: false };
    if (g.fuel >= g.goal - g.x + 10) return { down: false };
    const [kx, ky] = bigotesKeyAt(g);
    return bigotesBotCircle(g, kx, ky, 16, 2.4);
  },
});

// ---------------------------------------------------------------- 8 RELOJ ---
// The appointment clock: go round the clock to move the hands until they
// cover the green ghost hands (the time of the appointment), then stop.
function bigotesWallpaper() {
  return mdl('bigotes:wallpaper', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#f3e6c9');
    for (let y = 0; y < 124; y += 20) for (let x = (y / 20 % 2) * 16; x < SW + 16; x += 32) { disc(g, x, y + 8, 3, '#e3d0a8'); px(g, x, y + 3, '#e3d0a8'); px(g, x, y + 13, '#e3d0a8'); px(g, x - 5, y + 8, '#e3d0a8'); px(g, x + 5, y + 8, '#e3d0a8'); }
    rect(g, 0, 124, SW, 46, '#2a7356'); rect(g, 0, 124, SW, 3, '#4e9a79'); rect(g, 0, 127, SW, 1, '#17543e');
    for (let x = 12; x < SW; x += 40) { rect(g, x, 134, 28, 28, '#17543e'); rect(g, x + 1, 135, 26, 26, '#2a7356'); rect(g, x + 1, 135, 26, 1, '#4e9a79'); }
    woodFloor(g, 0, 170, SW, 22); rect(g, 0, 169, SW, 1, INK);
    return c;
  });
}
function bigotesClockFace(r) {
  return mdl('bigotes:clockFace' + r, () => {
    const c = mkCanvas(r * 2 + 12, r * 2 + 12), g = c.g, cx = r + 6, cy = r + 6;
    disc(g, cx, cy, r + 5, INK); disc(g, cx, cy, r + 4, RAMP.gold[2]); disc(g, cx - 1, cy - 1, r + 2, RAMP.gold[3]); disc(g, cx, cy, r, INK); disc(g, cx, cy, r - 1, '#fffaf0'); disc(g, cx - 3, cy - 3, r - 10, '#ffffff');
    for (let i = 0; i < 60; i++) { const a = -Math.PI / 2 + i / 60 * TAU, r0 = i % 5 ? r - 4 : r - 8; linePx(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), i % 5 ? '#b3b1bd' : INK); }
    for (let h = 1; h <= 12; h++) { const a = -Math.PI / 2 + h / 12 * TAU; txt(g, String(h), cx + Math.cos(a) * (r - 15), cy + Math.sin(a) * (r - 15) - 4, INK, { align: 'c' }); }
    return c;
  });
}
const bigotesHM = m => { m = ((Math.round(m) % 720) + 720) % 720; const h = fl(m / 60), mm = m % 60; return (h === 0 ? 12 : h) + ':' + String(mm).padStart(2, '0'); };
function bigotesClockHand(g, cx, cy, a, len, w, col) {
  const x = cx + Math.cos(a) * len, y = cy + Math.sin(a) * len;
  thickLine(g, cx, cy, x, y, w + 1, INK); thickLine(g, cx, cy, x, y, w, col);
}
defMG({
  id: 'reloj', stage: 'bigotes', name: 'La hora de la cita', cmd: '¡EN HORA!', how: 'Da vueltas al reloj hasta tapar las agujas verdes', mech: 'spin', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .5, n: 'E5 - - . C5 - - . D5 - - . G4 - - . G4 - - . D5 - - . E5 - - . C5 - - .' },
    { i: 'tri', v: .8, n: 'C3 . . . G2 . . . G2 . . . C3 . . . C3 . . . G2 . . . G2 . . . C3 . . .' },
    { i: 'd', v: .6, n: 'w . . . r . . . w . . . r . . . w . . . r . . . w . . . r . r r' }] }),
  init(g) {
    g.cx = 96; g.cy = 94; g.R = 54;
    g.start = (9 + g.ri(0, 1)) * 60;
    g.target = g.start + [120, 90 + g.ri(0, 1) * 15, 135 + g.ri(0, 2) * 15][g.level - 1]; g.tol = [10, 7, 5][g.level - 1];
    g.min = g.start; g.trk = spinTracker(g.cx, g.cy); g.still = 0; g.cuckooT = -1;
  },
  hint(g) { return { x: g.cx, y: g.cy, mech: 'spin' }; },
  update(g, dt) {
    const d = g.state === 'play' ? g.trk.update(dt) : 0;
    if (d) { g.min = g.start + g.trk.ang / TAU * 60; if (fl(g.min / 5) !== g._m5) { g._m5 = fl(g.min / 5); sfx('tick', { pitch: 1.2, vol: .5 }); } }
    if (g.state !== 'play') return;
    if (Math.abs(g.min - g.target) <= g.tol && (!IN.down || Math.abs(g.trk.vel) < .8)) {
      g.still += dt;
      if (g.still > .2) { g.win(); g.cuckooT = g.t; sfx('ding'); sfx('yip', { delay: .12 }); sfx('yip', { delay: .32 }); g.fx.burst(g.cx, g.cy - g.R - 24, 12, { k: 'star', c: [C.yellow, '#ffffff'] }); }
    } else g.still = 0;
  },
  draw(g, c) {
    c.drawImage(bigotesWallpaper(), 0, 0);
    const cx = g.cx, cy = g.cy, r = g.R, t = g.t;
    // the cuckoo clock: pendulum (behind), wooden house, little door
    const pa = Math.PI / 2 + Math.sin(t * 5) * .3, bx = cx + Math.cos(pa) * 32, by = cy + r + Math.sin(pa) * 32;
    thickLine(c, cx, cy + r, bx, by, 1.2, INK); linePx(c, cx, cy + r, bx, by, RAMP.gold[3]); disc(c, bx, by, 6, INK); disc(c, bx, by, 5, RAMP.gold[3]); px(c, bx - 2, by - 2, RAMP.gold[4]);
    polyPx(c, [[cx - r - 12, cy - r + 6], [cx, cy - r - 34], [cx + r + 12, cy - r + 6]], INK); polyPx(c, [[cx - r - 8, cy - r + 4], [cx, cy - r - 30], [cx + r + 8, cy - r + 4]], RAMP.wood[1]);
    for (let i = 1; i < 5; i++) linePx(c, cx - r - 8 + i * 12, cy - r + 4, cx, cy - r - 30, RAMP.wood[2]);
    rect(c, cx - r - 6, cy - r + 2, (r + 6) * 2, r * 2 + 6, INK); rect(c, cx - r - 5, cy - r + 3, (r + 5) * 2, r * 2 + 4, RAMP.wood[2]); rect(c, cx - r - 5, cy - r + 3, (r + 5) * 2, 2, RAMP.wood[4]);
    rect(c, cx - 9, cy - r - 22, 18, 17, INK); rect(c, cx - 8, cy - r - 21, 16, 16, '#1b1627');
    if (g.cuckooT >= 0) {
      const k = spring(g.t - g.cuckooT, 2.5, 5), px0 = cy - r - 14 - k * 18;
      for (let i = 0; i < 4; i++) linePx(c, cx - 3 + (i % 2) * 6, cy - r - 12 - i * k * 4.5, cx + 3 - (i % 2) * 6, cy - r - 12 - (i + 1) * k * 4.5, '#a5afc4');
      drawS(c, westieMini(), cx, px0, {});
      if (g.t - g.cuckooT < 1.4) shout(c, '¡CU-CÚ!', cx + 50, cy - r - 18, g.t - g.cuckooT);
    } else { rect(c, cx - 8, cy - r - 21, 7, 16, RAMP.wood[3]); rect(c, cx + 1, cy - r - 21, 7, 16, RAMP.wood[3]); px(c, cx - 3, cy - r - 13, RAMP.gold[3]); px(c, cx + 2, cy - r - 13, RAMP.gold[3]); }
    drawS(c, bigotesClockFace(r), cx, cy, {});
    // the ghost hands: the time of the appointment
    const gA = -Math.PI / 2 + ((g.target % 60) / 60) * TAU, gH = -Math.PI / 2 + ((g.target / 60) % 12) / 12 * TAU;
    c.globalAlpha = .5; thickLine(c, cx, cy, cx + Math.cos(gH) * r * .5, cy + Math.sin(gH) * r * .5, 3.4, '#2a9a6a'); thickLine(c, cx, cy, cx + Math.cos(gA) * r * .8, cy + Math.sin(gA) * r * .8, 2.6, '#2a9a6a'); c.globalAlpha = 1;
    // the real hands
    const mA = -Math.PI / 2 + ((g.min % 60) / 60) * TAU, hA = -Math.PI / 2 + ((g.min / 60) % 12) / 12 * TAU;
    bigotesClockHand(c, cx, cy, hA, r * .5, 2.2, '#44424f'); bigotesClockHand(c, cx, cy, mA, r * .8, 1.4, '#ff4060');
    disc(c, cx, cy, 4.5, INK); disc(c, cx, cy, 3.4, RAMP.gold[3]);
    if (g.state === 'play') bigotesTurnRing(c, cx, cy, r + 14, t, 1, { active: IN.down, dim: Math.abs(g.trk.ang) > TAU * .8 });
    // readout: the time now (green when it matches)
    const near = Math.abs(g.min - g.target) <= g.tol;
    panel(c, cx - 24, cy + r + 10, 48, 15, near ? '#5bd18b' : INK, { r: 3 }); txt(c, bigotesHM(g.min), cx, cy + r + 14, near ? INK : '#7dff9a', { align: 'c', bold: true });
    // Keiko and her appointment
    bigotesKeikoSit(c, 212, 168, g.state === 'won' ? 'love' : g.state === 'lost' ? 'sad' : 'normal', { tilt: Math.sin(t * 2) * .3 });
    panel(c, 170, 22, 84, 40, '#ffffff', { r: 6 }); polyPx(c, [[206, 61], [216, 61], [212, 72]], INK); polyPx(c, [[207, 60], [215, 60], [212, 68]], '#ffffff');
    txt(c, 'Mi cita es', 212, 27, INK, { align: 'c' }); txt(c, 'a las ' + bigotesHM(g.target), 212, 41, '#2a9a6a', { align: 'c', bold: true });
    if (g.state === 'lost') shout(c, '¡LLEGAS TARDE!', 128, 40, g.t - g.decidedAt);
  },
  bot(g) {
    if (g.state !== 'play') return { down: false };
    const left = g.target - g.min;
    if (Math.abs(left) <= g.tol * .5) return { down: false };
    const dir = left > 0 ? 1 : -1, sp = Math.min(2.2, Math.max(.4, Math.abs(left) / 40));
    g._ba = (g._ba != null ? g._ba : -Math.PI / 2) + dir * sp * TAU / 60;
    return { x: g.cx + Math.cos(g._ba) * 40, y: g.cy + Math.sin(g._ba) * 40, down: true };
  },
});

// the three new spin games join the stage
for (const id of ['bigote', 'cuerda', 'reloj']) if (!STAGES.bigotes.games.includes(id)) STAGES.bigotes.games.push(id);
// heavy portraits are rasterised in the background at boot
for (const f of [bigotesGalaFace, bigotesStudioBg, bigotesHorn, bigotesWallpaper, () => bigotesRobot(0, false), () => bigotesRobot(1, false), () => bigotesRobot(2, false), () => bigotesClockFace(54)]) warm(f);
