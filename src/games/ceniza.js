// ============================================================================
//  Microgames of CENIZA's stage (¡ARRASTRA!) — drag, drop, hook, trap.
//  Every game shows WHAT to grab (a pulsing outline hugging it) and WHERE it
//  goes (a glowing bead ring + a bouncing arrow while you hold it), stamps a
//  big word on success or failure, and offers hint(g) for the ghost hand.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- ingredients
// good ones go in the shampoo; the others never (onion and chocolate are
// toxic for dogs — Ceniza knows).
const CENIZA_ING = {
  aloe: { name: 'Aloe', good: 1 }, avena: { name: 'Avena', good: 1 }, lavanda: { name: 'Lavanda', good: 1 }, manzanilla: { name: 'Manzanilla', good: 1 },
  coco: { name: 'Coco', good: 1 }, miel: { name: 'Miel', good: 1 }, rosa: { name: 'Rosa', good: 1 }, purpurina: { name: 'Purpurina', good: 1 },
  guindilla: { name: 'Guindilla', good: 0 }, cebolla: { name: 'Cebolla', good: 0 }, chocolate: { name: 'Chocolate', good: 0 },
  calcetin: { name: 'Calcetín', good: 0 }, espina: { name: 'Espina', good: 0 }, bota: { name: 'Bota vieja', good: 0 },
};
const CENIZA_ING_GOOD = ['aloe', 'avena', 'lavanda', 'manzanilla', 'coco', 'miel', 'rosa'];
const CENIZA_ING_BAD = ['guindilla', 'cebolla', 'chocolate', 'calcetin', 'espina', 'bota'];
function cenizaIngIcon(id, k = 1.5) {
  return mdl('cz:ing:' + id + k, () => {
    const n = Math.ceil(20 * k), c = mkCanvas(n, n), g = c.g, S = v => v * k;
    const P = (x, y, col) => rect(g, S(x), S(y), Math.max(1, rd(k * .8)), Math.max(1, rd(k * .8)), col);
    const L = (x0, y0, x1, y1, col) => (k > 1.2 ? thickLine(g, S(x0), S(y0), S(x1), S(y1), k * .55, col) : linePx(g, S(x0), S(y0), S(x1), S(y1), col));
    const D = (x, y, r, col) => disc(g, S(x), S(y), r * k, col), EL = (x, y, rx, ry, col) => ellipsePx(g, S(x), S(y), rx * k, ry * k, col);
    const R = (x, y, w, h, col) => rect(g, S(x), S(y), Math.max(1, S(w)), Math.max(1, S(h)), col), PL = (pts, col) => polyPx(g, pts.map(([x, y]) => [S(x), S(y)]), col);
    switch (id) {
      case 'aloe':
        for (const [x0, y0, x1, y1] of [[10, 18, 4, 3], [10, 18, 16, 2], [10, 18, 10, 1]]) { PL([[x0 - 2.6, y0], [x0 + 2.6, y0], [x1, y1]], '#2a9a6a'); L(x0, y0 - 1, x1, y1 + 2, '#8ef0b4'); }
        for (const [x, y] of [[6, 9], [14, 8], [8, 13], [12, 12]]) P(x, y, '#d2f5e4');
        R(6, 16, 8, 3, RAMP.wood[3]); R(6, 16, 8, 1, RAMP.wood[4]); break;
      case 'avena':
        L(10, 19, 11, 3, '#b9955f'); for (let i = 0; i < 5; i++) { const y = 4 + i * 3; EL(8, y + 1, 2.1, 1.5, '#f2e2b8'); EL(13, y, 2.1, 1.5, '#dcc08a'); P(7, y, '#ffffff'); } break;
      case 'lavanda':
        for (const sx of [7, 13]) { L(10, 19, sx, 5, '#5bb593'); for (let i = 0; i < 5; i++) D(sx + (i % 2 ? .8 : -.8), 3 + i * 2, 1.6, i % 2 ? '#8959c5' : '#bf95e9'); } R(8, 15, 5, 2, RAMP.red[2]); break;
      case 'manzanilla':
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; EL(10 + Math.cos(a) * 5, 9 + Math.sin(a) * 5, 2.5, 2.5, '#ffffff'); }
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; P(10 + Math.cos(a) * 6.3, 9 + Math.sin(a) * 6.3, '#dfe3f1'); }
        D(10, 9, 3.3, '#ffdf4f'); D(9, 8, 1.5, '#fff7ae'); L(10, 13, 9, 19, '#5bb593'); break;
      case 'coco':
        EL(10, 11, 9, 8, '#7c3f1f'); EL(10, 10, 7, 6, '#ffffff'); EL(10, 10, 5, 4, '#fff8e6');
        for (let i = 0; i < 6; i++) P(3 + i * 2.5, 15 + (i % 2), '#4e2616'); P(7, 7, '#ffffff'); break;
      case 'miel':
        R(4, 6, 12, 13, '#e2b21b'); R(5, 7, 10, 11, '#ffdf4f'); R(5, 7, 3, 11, '#fff7ae'); R(3, 3, 14, 4, RAMP.wood[3]); R(3, 3, 14, 1, RAMP.wood[4]);
        R(6, 10, 8, 5, '#fff8e6'); P(9, 12, '#c38a21'); P(10, 12, '#c38a21'); L(14, 1, 17, 8, RAMP.wood[2]); break;
      case 'rosa':
        D(10, 8, 6, '#c02d45'); D(10, 8, 4.4, '#ec5e5e'); ringPx(g, S(10), S(8), 2.4 * k, '#c02d45'); P(10, 8, '#ffa39a'); P(8, 6, '#ffa39a');
        L(10, 14, 10, 19, '#2a7356'); PL([[10, 16], [15, 13], [13, 17]], '#5bb593'); break;
      case 'purpurina':
        R(6, 7, 8, 12, '#ff5d9e'); R(7, 8, 6, 10, '#ff93bf'); R(7, 8, 2, 10, '#ffd1e4'); R(7, 3, 6, 4, '#dfe3f1'); R(6, 2, 8, 2, RAMP.gold[3]);
        for (const [x, y] of [[9, 11], [11, 14], [8, 16], [12, 10]]) P(x, y, '#ffffff'); drawStar(g, S(16), S(5), 2.4 * k, '#fff27a'); drawStar(g, S(3), S(12), 1.8 * k, '#fff27a'); break;
      case 'guindilla':
        for (let i = 0; i < 12; i++) { const q = i / 11; D(4 + q * 12, 6 + Math.sin(q * 2.6) * 8, 3.2 - q * 2, '#e23b4e'); }
        L(5, 5, 8, 8, '#ff8d9b'); R(2, 3, 4, 3, '#2a9a6a'); P(1, 2, '#2a9a6a'); break;
      case 'cebolla':
        EL(10, 12, 7, 7, '#8a3f7a'); EL(10, 12, 5, 6, '#b35a9e'); L(10, 6, 10, 18, '#8a3f7a'); L(7, 7, 6, 17, '#8a3f7a'); L(13, 7, 14, 17, '#8a3f7a');
        PL([[9, 6], [11, 6], [10, 1]], '#5bb593'); P(7, 9, '#e5b3d8'); break;
      case 'chocolate':
        R(3, 5, 14, 11, '#4e2616'); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { R(4 + i * 4.5, 6 + j * 5, 3.5, 4, '#7c3f1f'); P(4 + i * 4.5, 6 + j * 5, '#ab6130'); }
        R(3, 14, 14, 4, '#c02d45'); tiny(g, 'NO', S(10), S(14.3), '#ffffff', { align: 'c' }); break;
      case 'calcetin':
        PL([[6, 1], [13, 1], [13, 12], [17, 14], [17, 18], [9, 18], [6, 14]], '#ffffff');
        for (let y = 3; y < 13; y += 3) R(6, y, 7, 1, '#ec5e5e'); R(14, 15, 3, 3, '#6b6977'); P(11, 16, '#c8c6d3'); break;
      case 'espina':
        L(3, 10, 15, 10, '#dfe3f1'); for (let x = 5; x < 14; x += 2) { L(x, 6, x + 1, 10, '#dfe3f1'); L(x, 14, x + 1, 10, '#dfe3f1'); }
        PL([[14, 10], [19, 6], [19, 14]], '#dfe3f1'); D(3, 10, 2.5, '#dfe3f1'); P(3, 9, INK); break;
      case 'bota':
        PL([[5, 2], [11, 2], [11, 12], [18, 13], [18, 18], [4, 18]], '#80522b'); PL([[6, 3], [10, 3], [10, 12], [17, 14], [17, 16], [5, 16]], '#a8713c');
        R(4, 17, 15, 2, '#35200f'); for (let y = 5; y < 11; y += 2) P(9, y, '#fff4dc'); P(15, 14, INK); break;
    }
    return outlined(c, INK, false);
  });
}

// ---------------------------------------------------------------- shared ----
// grab the nearest draggable under the finger; returns it (or null)
function cenizaGrab(g, list, r = 16, can = () => true) {
  if (!IN.tap) return null;
  let best = null, bd = r;
  for (const it of list) { if (!can(it)) continue; const d = dist(IN.x, IN.y, it.x, it.y); if (d < bd) { bd = d; best = it; } }
  if (best) { best.ox = best.x - IN.x; best.oy = best.y - IN.y; best.sq = 1; sfx('pop', { pitch: .8 }); buzz(6); }
  return best;
}
// follow the finger with a touch of lag and swing (tilt from speed)
function cenizaFollow(it, dt, lag = .55) {
  const tx = IN.x + (it.ox || 0) * .5, ty = IN.y + (it.oy || 0) * .5;
  it.ox = (it.ox || 0) * .9; it.oy = (it.oy || 0) * .9;
  it.x = lerp(it.x, tx, lag); it.y = lerp(it.y, ty, lag);
  it.rot = lerp(it.rot || 0, clamp(IN.vx / 900, -.6, .6), .25);
}
// gravity drop to a floor line with a small bounce
function cenizaFall(it, dt, floor) {
  it.vy = (it.vy || 0) + 900 * dt; it.y += it.vy * dt; it.x += (it.vx || 0) * dt; it.vx = (it.vx || 0) * .98;
  if (it.x < 14 || it.x > SW - 14) { it.x = clamp(it.x, 14, SW - 14); it.vx = -(it.vx || 0) * .4; } // never lost off-screen
  it.rot = (it.rot || 0) * .95;
  if (it.y > floor) { it.y = floor; if (Math.abs(it.vy) > 60) { it.vy *= -.35; sfx('tap', { pitch: .7, vol: .5 }); } else { it.vy = 0; it.fall = false; } }
}
// A bot finger that plays like a person: a moment to react, it travels to
// what it wants (finger up), presses, then drags at hand speed — and, like a
// person, it hurries when the tempo climbs (b.k, up to 1.6× at 250 bpm).
function cenizaBot(g) { if (!g._bot) { const k = clamp(Math.pow(g.tempo || 1, .6), 1, 1.6); g._bot = { x: 128, y: 150, down: false, k, wait: .28 / k }; } return g._bot; }
function cenizaBotMove(b, tx, ty, sp = 5) { sp *= b.k || 1; const d = dist(b.x, b.y, tx, ty); if (d <= sp) { b.x = tx; b.y = ty; return true; } b.x += (tx - b.x) / d * sp; b.y += (ty - b.y) / d * sp; return false; }
function cenizaBotReady(b) { if (b.wait > 0) { b.wait -= STEP; return false; } return true; }
// reach (x, y) with the finger up, then press. true = pressing on it now
function cenizaBotGrab(b, x, y) {
  if (b.down) return true;
  if (cenizaBotMove(b, x, y, 7)) { b.down = true; return true; }
  return false;
}
function cenizaShuffle(g, a) { for (let i = a.length - 1; i > 0; i--) { const j = fl(g.rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// "¡PUAJ!" skull smoke
function cenizaPuaj(g, x, y) {
  sfx('czPuaj'); g.shake(3, .25); buzz([30, 30, 30]);
  for (let i = 0; i < 16; i++) g.fx.add({ k: 'puff', x: x + g.r(-14, 14), y: y + g.r(-6, 6), vx: g.r(-30, 30), vy: g.r(-70, -20), drag: 1.5, r: g.r(4, 9), life: g.r(.5, 1), c: pick(['#3d3a4a', '#26242e', '#44424f']) });
}
function cenizaSparkle(g, x, y, col = '#fff27a') {
  sfx('czMagic'); HITSTOP = 3; buzz(8);
  g.fx.burst(x, y, 14, { k: 'star', c: [col, '#ffffff', '#ffd1e4'], sp0: 40, sp1: 140, life0: .3, life1: .7 });
  g.fx.add({ k: 'ring', x, y, r: 6, grow: 22, life: .35, c: '#ffffff' });
}
function cenizaDenWall(g) { cenizaStoneWall(g, 0, 0, SW, 150); rect(g, 0, 150, SW, 42, RAMP.wood[1]); for (let j = 150; j < SH; j += 7) { rect(g, 0, j, SW, 1, RAMP.wood[0]); rect(g, 0, j + 1, SW, 1, RAMP.wood[2]); } }
// WHERE IT GOES: a soft pulsing fill ringed by marching beads (ink-rimmed, so
// they read on white tiles and on dark stone alike)
function cenizaZone(c, x, y, rx, ry, t, col = '#fff27a', strong = true) {
  const pulse = 1 + Math.sin(t * 8) * .06, RX = rx * pulse, RY = ry * pulse;
  c.globalAlpha = (strong ? .32 : .16) + Math.sin(t * 6) * .06; ellipsePx(c, x, y, RX, RY, col); c.globalAlpha = 1;
  const n = Math.max(10, rd((RX + RY) * .5)), sh = t * (strong ? 1.6 : .8);
  for (let i = 0; i < n; i++) { const a = (i + sh) / n * TAU, bx = x + Math.cos(a) * RX, by = y + Math.sin(a) * RY; disc(c, bx, by, strong ? 2 : 1.6, INK); disc(c, bx, by, strong ? 1.2 : .9, i % 2 ? '#ffffff' : col); }
}
// a chunky arrow pointing down at (x, y), bouncing
function cenizaArrow(c, x, y, t, col = '#ffdf4f') {
  const b = Math.abs(Math.sin(t * 7)) * 4, Y = y - 12 - b;
  polyPx(c, [[x - 7, Y], [x + 7, Y], [x + 7, Y + 5], [x + 11, Y + 5], [x, Y + 14], [x - 11, Y + 5], [x - 7, Y + 5]], INK);
  polyPx(c, [[x - 5, Y + 1.5], [x + 5, Y + 1.5], [x + 5, Y + 6.5], [x + 8, Y + 6.5], [x, Y + 12], [x - 8, Y + 6.5], [x - 5, Y + 6.5]], col);
  hline(c, x - 4, x + 4, Y + 2, '#ffffff');
}
// a dotted arc from A to B (the way to drag), beads marching toward B
function cenizaTrail(c, x0, y0, x1, y1, lift, t, col = '#ffffff') {
  const L = dist(x0, y0, x1, y1), n = Math.max(3, fl(L / 10)), off = (t * 1.4) % 1;
  for (let i = 0; i < n; i++) { const q = (i + off) / n, x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * lift; disc(c, x, y, 2, INK); disc(c, x, y, 1.2, col); }
}
// WHAT TO GRAB: a pulsing outline that hugs the sprite's silhouette
function cenizaRing(img, col) {
  const m = img._czRing || (img._czRing = {});
  if (m[col]) return m[col];
  const s = silhouette(img, col), c = mkCanvas(img.width + 4, img.height + 4), g = c.g;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if ((dx || dy) && dx * dx + dy * dy <= 5) g.drawImage(s, 2 + dx, 2 + dy);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(img, 2, 2); g.globalCompositeOperation = 'source-over';
  return (m[col] = c);
}
function cenizaHalo(c, img, x, y, t, col = '#ffffff', o = {}) {
  const k = .5 + Math.sin(t * 8) * .5, s = o.s || 1, ax = o.ax != null ? o.ax : .5, ay = o.ay != null ? o.ay : .5;
  drawS(c, cenizaRing(img, col), x + (ax - .5) * 4 * s * (o.flip ? -1 : 1), y + (ay - .5) * 4 * s, Object.assign({}, o, { alpha: .4 + k * .6 }));
}
// a big word stamped on the screen (success / failure), springing in
const CENIZA_WIN_FILL = ['#ffffff', '#d2f5e4', '#5bd18b'], CENIZA_BAD_FILL = ['#ffffff', '#d7dde8', '#7b8398'], CENIZA_PINK_FILL = ['#ffffff', '#ffd1e4', '#ff5d9e'];
const CENIZA_PUAJ_FILL = ['#ffffff', '#e5f7a0', '#8ec63f'], CENIZA_WATER_FILL = ['#ffffff', '#dff4ff', '#5aaee6'], CENIZA_GOLD_FILL = ['#ffffff', '#fff7ae', '#e2b21b'], CENIZA_LILAC_FILL = ['#ffffff', '#e5d3fa', '#8959c5'];
// Every Ceniza microgame ends on her gothic card lettering (green glow and all),
// tinted per game; a miss fizzles out in grey. The letters condense out of smoke
// like her name on the card, and stars and smoke burst out as they land.
const CENIZA_STAMP_FACES = {};
const cenizaStampBad = fill => fill === CENIZA_BAD_FILL || fill === CENIZA_PUAJ_FILL;
function cenizaStampFace(fill) {
  fill = fill || CENIZA_PINK_FILL; const key = fill.join('');
  if (CENIZA_STAMP_FACES[key]) return CENIZA_STAMP_FACES[key];
  const F = CARD_WITCH_FACE, bad = cenizaStampBad(fill);
  return (CENIZA_STAMP_FACES[key] = Object.assign({}, F, { id: 'czSt' + key, fill }, bad ? { line2: '#44424f', glow: null } : {}));
}
function cenizaStamp(c, word, x, y, t, fill) {
  if (t < 0) return;
  fill = fill || CENIZA_PINK_FILL;
  if (typeof cardWord !== 'function') { const st = fitMord(word, 230, { u: 1.9, r: 2.1, rim: 2, sy: 3, fill }); mord(c, word, x, y, st, { anim: i => ({ s: Math.max(0, spring(t - i * .03, 2.6, 7)) }) }); return; }
  const bad = cenizaStampBad(fill), st = cardFit(word, 224, cenizaStampFace(fill));
  if (t < .7) { const k = E.outQ(t / .7), n = 14;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + word.length, r = 10 + k * 62, px0 = x + Math.cos(a) * r * 1.5, py0 = y + 11 + Math.sin(a) * r * .55;
      if (bad) disc(c, px0, py0, Math.max(0, 4 * (1 - k)), i % 2 ? '#7b8398' : '#b3b8d4');
      else if (i % 2) drawStar(c, px0, py0, Math.max(0, 3.2 * (1 - k)), fill[1]); else disc(c, px0, py0, Math.max(0, 3.6 * (1 - k)), 'rgba(191,149,233,.7)'); } }
  cardWord(c, word, x, y, st, { anim: i => { const lt = t - i * .05; if (lt <= 0) return { s: 0 }; const k = E.outC(clamp(lt / .28, 0, 1)); return { s: lerp(1.6, 1, k), a: k, rot: (1 - k) * .3 }; } });
}
// letter by letter, from the room, so the stamps never hitch
const CENIZA_STAMPS = [['¡OLÉ!', CENIZA_PINK_FILL], ['¡PUAJ!', CENIZA_PUAJ_FILL], ['¡PERFECTO!', CENIZA_WIN_FILL], ['¡GUAPÍSIMA!', CENIZA_PINK_FILL], ['¡GUAPÍSIMAS!', CENIZA_PINK_FILL], ['¡AL AGUA!', CENIZA_WATER_FILL], ['¡A PASEAR!', CENIZA_WIN_FILL], ['¡MAGIA!', CENIZA_GOLD_FILL], ['¡SE ESCAPAN!', CENIZA_BAD_FILL], ['¡A DORMIR!', CENIZA_LILAC_FILL], ['¡PILLADO!', CENIZA_WIN_FILL], ['¡PÓCIMA PERFECTA!', CENIZA_PINK_FILL], ['¡BUUUM!', CENIZA_BAD_FILL]];
function cenizaStampWarm() {
  if (typeof cardPrewarm !== 'function' || cenizaStampWarm.done) return;
  const list = CENIZA_STAMPS.map(([w, f]) => [w, cardFit(w, 224, cenizaStampFace(f))]);
  cardPrewarm(list);
  if (list.every(([w, st]) => [...w].every(ch => ch === ' ' || CARD_GLYPHS.has(ch + '|' + cardStyle(st).id + '|' + cardStyle(st).u + '|' + cardStyle(st).r + '|')))) cenizaStampWarm.done = 1;
}
// Keiko in profile: the westie body plus her Westie-green bandana (cached)
function cenizaKeikoSpr(k, pose, mood) {
  return mdl('cz:keikoSide' + k + pose + mood, () => {
    const base = westieSide(k, pose, mood), c = mkCanvas(base.width, base.height), g = c.g, S = v => v * k, G = RAMP.green;
    g.drawImage(base, 0, 0);
    polyPx(g, [[S(56), S(27)], [S(70), S(30)], [S(64), S(41)]], INK);
    polyPx(g, [[S(57.5), S(28)], [S(68.5), S(30.5)], [S(63.8), S(39)]], G[2]);
    linePx(g, S(57.5), S(28.2), S(68.5), S(30.7), G[4]);
    for (const [x, y] of [[61, 31.5], [65, 32.5], [63.5, 35]]) px(g, S(x), S(y), '#ffffff');
    rect(g, rd(S(69.5)), rd(S(22)), 2, 1, RAMP.pink[3]); // rosy cheek
    return c;
  });
}
// westieSide(k) leaves this many blank rows (× k) under the paws
const CENIZA_FEET = 4.5;

// ---------------------------------------------------------------- 1 POCIÓN --
// the ingredients levitate in magic bubbles; drag the ones on the recipe
// (top screen) into the cauldron. Ceniza watches from the side.
function cenizaPocionBg() {
  return mdl('cenizaPocionBg4', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    cenizaDenWall(g);
    // a string of little witchy flags
    for (let x = 0; x < SW; x++) px(g, x, 2 + Math.sin(x / SW * Math.PI * 3) * 1.5, INK);
    for (let i = 0; i < 12; i++) { const x = 4 + i * 21, y = 2 + Math.sin((x + 8) / SW * Math.PI * 3) * 1.5; polyPx(g, [[x, y], [x + 15, y], [x + 7.5, y + 11]], INK); polyPx(g, [[x + 1.5, y + 1], [x + 13.5, y + 1], [x + 7.5, y + 9]], [RAMP.purple[3], RAMP.mint[2], RAMP.gold[3]][i % 3]); }
    // round window with the moon (top right, over Ceniza)
    disc(g, 226, 36, 17, INK); disc(g, 226, 36, 16, RAMP.wood[2]); disc(g, 226, 36, 13, '#232a5e'); disc(g, 230, 32, 5, '#fff2c0'); disc(g, 232, 31, 4.5, '#232a5e');
    for (let i = 0; i < 5; i++) px(g, 216 + hash2(i, 1) * 20, 28 + hash2(1, i) * 16, '#ffffff');
    rect(g, 225, 23, 2, 26, RAMP.wood[1]); rect(g, 213, 35, 26, 2, RAMP.wood[1]);
    // a little shelf of jars on the left
    rect(g, 4, 110, 46, 4, RAMP.wood[3]); rect(g, 4, 110, 46, 1, RAMP.wood[4]); rect(g, 4, 114, 46, 1, INK);
    cenizaJar(g, 8, 98, 8, 12, '#5bd18b'); cenizaJar(g, 34, 94, 10, 16, '#ff93bf');
    return c;
  });
}
function cenizaBubble(c, x, y, r, t, ph) {
  const cols = ['#ff93bf', '#9bd6f7', '#fff7ae', '#94dcbc'], ci = fl((ph + t * 1.5) % 4);
  c.globalAlpha = .22; disc(c, x, y, r, '#e5d3fa'); c.globalAlpha = 1;
  ringPx(c, x, y, r, INK); ringPx(c, x, y, r - 1, cols[ci]); ringPx(c, x, y, r - 2, cols[(ci + 1) % 4]);
  for (let a = 3.7; a < 4.6; a += .12) px(c, x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4), '#ffffff');
  disc(c, x - r * .45, y - r * .45, 1.4, '#ffffff');
}
defMG({
  id: 'pocion', stage: 'ceniza', name: 'Pócima exprés', cmd: '¡ECHA!', how: 'Arrastra al caldero solo lo que pide la receta de arriba', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D5 - - A4 . D5 . E5 F5 - - E5 . D5 . C#5 D5 - - A4 . F5 . E5 D5 - . C#5 - . . .' },
    { i: 'organ', v: .35, n: 'D4+F4+A4 - - - - - - - - - - - - - - - A3+C#4+E4 - - - - - - - - - - - - - - -' },
    { i: 'bass', v: .85, n: 'D3 . . D3 . . A2 . D3 . . D3 . . A2 . A2 . . A2 . . E2 . A2 . . C#3 . . . .' },
    { i: 'd', v: .7, n: 'k . . k . . s . k . . k . . s . k . . k . . s . k . k . s s s .' }] }),
  init(g) {
    const need = [1, 2, 3][g.level - 1];
    const good = cenizaShuffle(g, CENIZA_ING_GOOD.slice()), bad = cenizaShuffle(g, CENIZA_ING_BAD.slice());
    g.recipe = good.slice(0, need);
    const extra = g.level === 3 ? bad.slice(0, 1).concat(good.slice(need, need + 1)) : bad.slice(0, 2);
    const ids = cenizaShuffle(g, g.recipe.concat(extra)), n = ids.length, R = n >= 5 ? 16 : 18, x0 = n >= 5 ? 24 : 32, x1 = n >= 5 ? 184 : 176;
    // an arc of floating bubbles over the cauldron
    g.items = ids.map((id, i) => { const k = n === 1 ? .5 : i / (n - 1), x = lerp(x0, x1, k), y = 50 - Math.sin(k * Math.PI) * 14 + (i % 2) * 5; return { id, x, y, hx: x, hy: y, r: R, rot: 0, in: false, sq: 0, wob: g.r(TAU), ph: g.r(4), back: 0 }; });
    g.done = []; g.held = null; g.potCol = '#5bd18b'; g.flash = 0; g.pot = { x: 104, y: 132 }; g.stampT = -1; g.happy = 0;
  },
  update(g, dt) {
    g.flash = Math.max(0, g.flash - dt * 3); g.happy = Math.max(0, g.happy - dt);
    for (const it of g.items) {
      it.sq = Math.max(0, it.sq - dt * 5); it.wob += dt * 2.4;
      if (it.sink != null) { it.sink += dt * 4; continue; }
      if (it !== g.held && !it.in) { it.x = lerp(it.x, it.hx, .12); it.y = lerp(it.y, it.hy + Math.sin(it.wob) * 2.5, .12); it.rot *= .85; it.back = Math.max(0, it.back - dt * 3); }
    }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.items, 20, it => !it.in && it.sink == null); if (g.held) { sfx('pop', { pitch: 1.4 }); g.fx.add({ k: 'ring', x: g.held.x, y: g.held.y, r: 10, grow: 12, life: .25, c: '#ffffff' }); } }
    if (g.held) {
      const it = g.held; cenizaFollow(it, dt);
      if (IN.rel || !IN.down) {
        g.held = null;
        if (dist(it.x, it.y, g.pot.x, g.pot.y - 4) < 38 && it.y < 150) {
          it.in = true; it.sink = 0; it.x = lerp(it.x, g.pot.x, .5);
          sfx('splash', { pitch: 1.3, vol: .6 }); g.fx.burst(g.pot.x, g.pot.y - 4, 10, { k: 'drop', c: [g.potCol, '#ffffff'], sp0: 40, sp1: 120, g: 320, life0: .3, life1: .6 });
          if (g.recipe.includes(it.id) && !g.done.includes(it.id)) {
            g.done.push(it.id); g.flash = 1; g.happy = .6; g.potCol = ['#5bd18b', '#4fc6c2', '#bf95e9', '#ff93bf'][g.done.length];
            cenizaSparkle(g, g.pot.x, g.pot.y - 10, '#c8f05a'); g.fx.add({ k: 'txt', s: '¡Bien!', x: g.pot.x, y: g.pot.y - 34, life: .6, c: '#ffffff' });
            if (g.done.length >= g.recipe.length) { g.win(); g.stampT = g.t; for (let i = 0; i < 10; i++) g.fx.add({ k: 'heart', x: g.pot.x + g.r(-30, 30), y: g.pot.y - 10, vx: g.r(-30, 30), vy: g.r(-90, -40), life: 1, c: '#ff93bf' }); }
          } else { g.potCol = '#5b5a66'; cenizaPuaj(g, g.pot.x, g.pot.y - 10); g.lose(); g.stampT = g.t; }
        } else { it.back = 1; sfx('boing', { pitch: 1.6, vol: .4 }); } // it floats back to its bubble
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaPocionBg(), 0, 0);
    cenizaCandle(c, 20, 110, g.t, 9); cenizaCandle(c, 27, 110, g.t + 1, 6, '#e5d3fa');
    const cs = cenizaCauldron(1.5), P = g.pot;
    cenizaFire(c, P.x, 184, g.t, 1.3);
    c.drawImage(cs, rd(P.x - cs.width / 2), rd(P.y - 18));
    cenizaPotion(c, P.x, P.y, 36, 7, g.potCol, g.t, { boil: g.flash > 0 || g.state === 'won' });
    if (g.flash > 0) { c.globalAlpha = g.flash * .6; ellipsePx(c, P.x, P.y, 38, 8, '#ffffff'); c.globalAlpha = 1; }
    for (let i = 0; i < 3; i++) { const ph = (g.t * .7 + i * .33) % 1; c.globalAlpha = (1 - ph) * .4; disc(c, P.x - 14 + i * 14 + Math.sin(g.t * 2 + i) * 4, P.y - 12 - ph * 44, 4 + ph * 5, g.state === 'lost' ? '#44424f' : '#dfe3f1'); } c.globalAlpha = 1;
    // Ceniza by the fire, reacting to every ingredient
    const pose = g.state === 'won' ? 'win' : g.state === 'lost' ? 'lose' : g.happy > 0 ? 'ready' : g.held ? 'talk' : 'smug';
    cenizaDraw(c, 216, 191, pose, g.t, { bob: g.state === 'won' ? -Math.abs(Math.sin(g.t * 9)) * 4 : 0 });
    if (g.held && g.state === 'play') { cenizaZone(c, P.x, P.y - 1, 40, 11, g.t, '#c8f05a'); cenizaArrow(c, P.x, P.y - 22, g.t, '#c8f05a'); }
    for (const it of g.items) {
      if (it.sink != null) { if (it.sink < 1) drawS(c, cenizaIngIcon(it.id), it.x, P.y - 4 + it.sink * 8, { s: 1 - it.sink, rot: it.sink * 3 }); continue; }
      if (it.in) continue;
      if (it === g.held) { shadowOval(c, it.x, Math.min(178, it.y + 34), 8, 2, .3); drawS(c, cenizaIngIcon(it.id), it.x, it.y, { rot: it.rot, s: 1.2 + it.sq * .2 }); continue; }
      cenizaBubble(c, it.x, it.y, it.r, g.t, it.ph);
      drawS(c, cenizaIngIcon(it.id), it.x, it.y, { s: 1 + it.sq * .25 - it.back * .15, rot: Math.sin(it.wob) * .08 });
    }
    if (g.state === 'won') cenizaStamp(c, '¡OLÉ!', P.x, 70, g.t - g.stampT);
    if (g.state === 'lost' && g.stampT >= 0) cenizaStamp(c, '¡PUAJ!', P.x, 70, g.t - g.stampT, CENIZA_PUAJ_FILL);
  },
  // the recipe card, on the top screen
  top(g, c) {
    const n = g.recipe.length, w = 60 + n * 50, x0 = SW / 2 - w / 2;
    panel(c, x0, 46, w, 84, '#fff4dc', { r: 6, line: INK, lo: '#dcc08a' });
    rect(c, x0 + 3, 46, w - 6, 2, '#f2e2b8'); disc(c, x0, 88, 6, '#dcc08a'); disc(c, x0 + w, 88, 6, '#dcc08a');
    txt(c, 'Al caldero:', SW / 2, 53, '#5a1f2a', { align: 'c', bold: true });
    g.recipe.forEach((id, i) => {
      const x = x0 + 55 + i * 50, done = g.done.includes(id), bob = done ? 0 : Math.sin(g.t * 6 + i) * 1.5;
      drawS(c, cenizaIngIcon(id, 1.5), x, 84 + bob, {});
      txt(c, CENIZA_ING[id].name, x, 104, INK, { align: 'c' });
      if (done) { disc(c, x + 11, 76, 7, INK); disc(c, x + 11, 76, 6, '#5bd18b'); txt(c, '✓', x + 11, 73, '#ffffff', { align: 'c', bold: true }); }
      if (i < n - 1) txt(c, '+', x + 25, 83, '#5a1f2a', { align: 'c', bold: true });
    });
    txt(c, '¡y nada más!', SW / 2, 117, '#8a3f7a', { align: 'c' });
  },
  hint(g) { const it = g.items.find(it => g.recipe.includes(it.id) && !it.in); return it ? { x: it.x, y: it.y, to: [g.pot.x, g.pot.y - 6] } : null; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    if (!g.held) {
      const it = g.items.find(it => g.recipe.includes(it.id) && !g.done.includes(it.id) && !it.in);
      if (!it) { b.down = false; return b; }
      if (b.down && dist(b.x, b.y, it.x, it.y) > 6) { b.down = false; return b; }
      cenizaBotGrab(b, it.x, it.y); return b;
    }
    if (cenizaBotMove(b, g.pot.x, g.pot.y - 8, 5)) { b.down = false; b.wait = .15 / b.k; }
    return b;
  },
});

// ---------------------------------------------------------------- 2 ESTANTE -
// the missing bag as a shimmering checkerboard ghost (true colours, half the pixels)
function cenizaGhostBag(w, h, ci, ph) {
  return mdl('cz:ghost' + w + 'x' + h + ci + ph, () => {
    const c = mkCanvas(w, h); foodBag(c.g, 0, 0, w, h, ci);
    const d = c.g.getImageData(0, 0, w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x + y + ph) % 2) d.data[(y * w + x) * 4 + 3] = 0;
    c.g.putImageData(d, 0, 0); return c;
  });
}
function cenizaBagSpr(w, h, ci) { return mdl('cz:bag' + w + 'x' + h + ci, () => { const c = mkCanvas(w + 2, h + 2); foodBag(c.g, 1, 1, w, h, ci); return c; }); }
function cenizaEstanteBg() {
  return mdl('cz:estanteBg3', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wd = RAMP.wood;
    subwayTiles(g, 0, 0, SW, 156);
    rect(g, 0, 156, SW, 36, Wd[2]); for (let j = 158; j < SH; j += 6) { rect(g, 0, j, SW, 1, Wd[1]); rect(g, 0, j + 1, SW, 1, Wd[3]); }
    // the shelf unit: top board, two shelves (the back is dark wood)
    rect(g, 26, 56, 204, 100, INK); rect(g, 27, 57, 202, 98, Wd[1]); rect(g, 30, 60, 196, 92, '#4a2e18');
    for (const sy of [106, 154]) { rect(g, 27, sy - 4, 202, 5, Wd[3]); rect(g, 27, sy - 4, 202, 1, Wd[4]); rect(g, 27, sy + 1, 202, 1, INK); }
    rect(g, 22, 50, 212, 7, INK); rect(g, 23, 51, 210, 5, Wd[3]); rect(g, 23, 51, 210, 1, Wd[4]);
    panel(g, 234, 80, 18, 12, '#fff8e6', { r: 2 }); tiny(g, '9€', 243, 83, INK, { align: 'c' });
    return c;
  });
}
defMG({
  id: 'estante', stage: 'ceniza', name: 'Estantería gatuna', cmd: '¡COLOCA!', how: 'Ceniza tira los sacos: devuélvelos a su hueco del mismo color', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .6, n: 'A5 . G5 . F5 . E5 . D5 . E5 . F5 - . . G5 . F5 . E5 . D5 . C#5 . D5 . E5 - . .' },
    { i: 'pluck', v: .35, n: 'D4 . A4 . D4 . A4 . Bb3 . F4 . Bb3 . F4 . A3 . E4 . A3 . E4 . A3 . C#4 . E4 . A4 .' },
    { i: 'bass', v: .8, n: 'D3 . . . . . . . Bb2 . . . . . . . A2 . . . . . . . A2 . . . C#3 . . .' },
    { i: 'd', v: .6, n: 'k . w . s . w w k . w . s . w . k . w . s . w w k . w w s s s .' }] }),
  init(g) {
    g.rows = [102, 150]; g.fixed = []; const spots = [];
    const nBags = g.level === 1 ? 1 : 2;
    const slotSpots = cenizaShuffle(g, [[0, 1], [1, 3], [0, 4], [1, 0], [0, 5], [1, 5]]).slice(0, 3);
    for (let r = 0; r < 2; r++) {
      let x = 34;
      for (let i = 0; i < 7; i++) {
        const w = 18 + fl(hash2(i, r + 3) * 8), h = 28 + fl(hash2(r, i + 5) * 10), ci = fl(hash2(i + 9, r) * 6);
        const slot = { x: x + w / 2, y: g.rows[r] - 4 - h / 2, w, h, ci, r }, k = slotSpots.findIndex(q => q[0] === r && q[1] === i);
        if (k >= 0) spots[k] = slot; else g.fixed.push(slot);
        x += w + 3;
      }
    }
    // the empty gaps get colours that no other bag on the shelf shows, so each reads at a glance
    const cols = cenizaShuffle(g, [0, 1, 2, 3, 4, 5]);
    g.slots = []; g.bags = [];
    for (let i = 0; i < 3; i++) {
      const s = spots[i]; s.ci = cols[i];
      if (i < nBags) { g.slots.push(s); g.bags.push({ slot: s, w: s.w, h: s.h, ci: s.ci, x: 56 + i * 96 + g.r(0, 16), y: 170, rot: (i % 2 ? .6 : -.6) + g.r(-.2, .2), fall: false, placed: false, sq: 0 }); }
      else if (g.level >= 3 && i === 2) { g.slots.push(s); g.bags.push({ slot: s, w: s.w, h: s.h, ci: s.ci, x: s.x, y: s.y, rot: 0, fall: false, placed: true, sq: 0, knock: true }); }
      else g.fixed.push(s);
    }
    const used = g.slots.map(s => s.ci), avail = [0, 1, 2, 3, 4, 5].filter(q => !used.includes(q));
    const off = fl(g.r(avail.length)); g.fixed.sort((a, q) => a.r - q.r || a.x - q.x).forEach((f, i) => { f.ci = avail[(i * 2 + f.r + off) % avail.length]; });
    g.held = null; g.cat = { knockAt: g.level >= 3 ? 1.2 : 99, done: g.level < 3, paw: 0 }; g.stampT = -1;
  },
  update(g, dt) {
    for (const b of g.bags) { b.sq = Math.max(0, b.sq - dt * 5); if (b.fall) cenizaFall(b, dt, 170); if (b.snap) { b.x = lerp(b.x, b.slot.x, .4); b.y = lerp(b.y, b.slot.y, .4); b.rot = lerp(b.rot, 0, .4); } }
    const cat = g.cat; cat.paw = Math.max(0, cat.paw - dt * 3);
    // L3: Ceniza paws one more bag off the shelf
    if (!cat.done && g.b >= cat.knockAt && g.state === 'play') {
      cat.done = true; cat.paw = 1; const b = g.bags.find(b => b.knock); if (b) { b.placed = false; b.snap = false; b.fall = true; b.vx = g.r(-80, 80); b.vy = -120; b.rot = .4; sfx('czMeow', { pitch: 1.2 }); g.fx.add({ k: 'txt', s: '¡Miau!', x: 190, y: 20, life: .7, c: '#e5d3fa' }); }
    }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.bags, 24, b => !b.placed); if (g.held) { g.held.fall = false; g.held.vy = 0; } }
    if (g.held) {
      const b = g.held; cenizaFollow(b, dt);
      if (IN.rel || !IN.down) {
        g.held = null;
        const s = b.slot;
        if (Math.abs(b.x - s.x) < 17 && Math.abs(b.y - s.y) < 20) {
          b.placed = true; b.snap = true; b.sq = 1; sfx('stamp'); sfx('coin', { delay: .05 }); HITSTOP = 3; buzz(10);
          g.fx.burst(s.x, s.y + s.h / 2, 8, { k: 'puff', c: ['#dcc08a', '#fff4dc'], sp0: 20, sp1: 60, r: 3, life0: .3, life1: .5 });
          g.fx.burst(s.x, s.y, 10, { k: 'star', c: ['#fff27a', '#ffffff'] });
          g.fx.add({ k: 'txt', s: '¡Encaja!', x: s.x, y: s.y - s.h / 2 - 8, life: .6, c: '#ffffff' });
          if (g.cat.done && g.bags.every(q => q.placed)) { g.win(); g.stampT = g.t; }
        } else {
          const wrong = g.slots.find(o => o !== s && Math.abs(b.x - o.x) < 16 && Math.abs(b.y - o.y) < 18);
          if (wrong) { sfx('buzz', { vol: .4 }); g.fx.add({ k: 'txt', s: '¡Ese color no!', x: b.x, y: b.y - 24, life: .7, c: '#ffd1e4' }); }
          b.fall = true; b.vy = -60; b.vx = IN.vx * .25;
        }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaEstanteBg(), 0, 0);
    for (const f of g.fixed) foodBag(c, rd(f.x - f.w / 2), rd(f.y - f.h / 2), f.w, f.h, f.ci);
    // empty slots: a lit hole with a ghost of the missing bag in its colour and a marching dashed rim
    const open = [];
    for (const s of g.slots) {
      const b = g.bags.find(q => q.slot === s); if (b && b.placed) continue;
      const cols = BAG_COLS[s.ci % BAG_COLS.length], x0 = rd(s.x - s.w / 2), y0 = rd(s.y - s.h / 2), hot = g.held && g.held.slot === s, k = Math.sin(g.t * 6) * .1;
      c.globalAlpha = (hot ? .5 : .3) + k; rect(c, x0, y0, s.w, s.h, cols[2]); c.globalAlpha = 1; c.drawImage(cenizaGhostBag(s.w, s.h, s.ci, fl(g.t * (hot ? 8 : 4)) % 2), x0, y0);
      for (let i = 0; i < s.w; i += 2) { const on = fl(i / 2 + g.t * 8) % 2; px(c, x0 + i, y0, on ? '#ffffff' : cols[1]); px(c, x0 + i, y0 + s.h - 1, on ? '#ffffff' : cols[1]); }
      for (let i = 0; i < s.h; i += 2) { const on = fl(i / 2 + g.t * 8) % 2; px(c, x0, y0 + i, on ? '#ffffff' : cols[1]); px(c, x0 + s.w - 1, y0 + i, on ? '#ffffff' : cols[1]); }
      if (hot || !g.held) open.push([s.x, y0 - 2, cols[1]]);
    }
    // Ceniza sits on top of the unit (she did it), tail swishing
    const cat = g.cat, catPose = g.state === 'won' ? 'boss' : cat.paw > 0 ? 'angry' : 'smug';
    c.save(); c.beginPath(); c.rect(0, 0, SW, 54); c.clip(); c.drawImage(cenizaBody(catPose), 150, -40); c.restore();
    for (const [x, y, col] of open) cenizaArrow(c, x, y, g.t + x, col);
    if (cat.paw > 0) { const kb = g.bags.find(q => q.knock); const tx = kb ? kb.slot.x : 190, ty = kb ? kb.slot.y : 80, k = Math.sin(cat.paw * Math.PI); thickLine(c, 180, 50, lerp(180, tx, k), lerp(50, ty, k), 3.4, INK); thickLine(c, 180, 50, lerp(180, tx, k), lerp(50, ty, k), 2.4, RAMP.black[2]); }
    for (const b of g.bags) {
      const img = cenizaBagSpr(b.w, b.h, b.ci), o = { rot: b.rot, sx: 1 + b.sq * .2, sy: 1 - b.sq * .15 };
      if (!b.placed && b !== g.held && g.state === 'play') cenizaHalo(c, img, b.x, b.y, g.t, '#ffffff', o);
      if (b === g.held) shadowOval(c, b.x, 184, b.w * .5, 2, .3);
      drawS(c, img, b.x, b.y, o);
    }
    if (g.state === 'won') cenizaStamp(c, '¡PERFECTO!', 110, 22, g.t - g.stampT, CENIZA_WIN_FILL);
  },
  hint(g) { const b = g.bags.find(q => !q.placed); return b ? { x: b.x, y: b.y, to: [b.slot.x, b.slot.y] } : null; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    if (!g.held) {
      const bag = g.bags.find(q => !q.placed && (!q.fall || Math.abs(q.vy || 0) < 30));
      if (!bag) { b.down = false; return b; }
      if (b.down && dist(b.x, b.y, bag.x, bag.y) > 8) { b.down = false; return b; }
      cenizaBotGrab(b, bag.x, bag.y); return b;
    }
    const s = g.held.slot; if (cenizaBotMove(b, s.x, s.y, 5) && dist(g.held.x, g.held.y, s.x, s.y) < 6) { b.down = false; b.wait = .12 / b.k; }
    return b;
  },
});

// ---------------------------------------------------------------- 3 LAZO ----
// a proper bow on a velvet cushion; Keiko trots around the rug
function cenizaBowBig(col = '#ff5d9e') {
  return mdl('cz:bowBig' + col, () => {
    const c = mkCanvas(38, 26), g = c.g, cd = mixHex(col, '#000000', .3), cl = mixHex(col, '#ffffff', .45), cx0 = 19, cy0 = 10;
    for (const s of [-1, 1]) { polyPx(g, [[cx0 + s * 1, cy0 + 2], [cx0 + s * 7, cy0 + 15], [cx0 + s * 4, cy0 + 14], [cx0 + s * 3, cy0 + 16]], INK); polyPx(g, [[cx0 + s * 1.5, cy0 + 3], [cx0 + s * 6, cy0 + 13], [cx0 + s * 4, cy0 + 12.5]], cd); }
    for (const s of [-1, 1]) {
      polyPx(g, [[cx0, cy0], [cx0 + s * 17, cy0 - 9], [cx0 + s * 18, cy0 + 1], [cx0 + s * 15, cy0 + 8]], INK);
      polyPx(g, [[cx0 + s * 1, cy0], [cx0 + s * 15.5, cy0 - 7], [cx0 + s * 16.5, cy0 + 1], [cx0 + s * 14, cy0 + 6.5]], col);
      linePx(g, cx0 + s * 3, cy0 - 1, cx0 + s * 13, cy0 - 6, cl); linePx(g, cx0 + s * 4, cy0 + 3, cx0 + s * 13, cy0 + 5, cd);
      px(g, cx0 + s * 14, cy0 - 5, '#ffffff');
    }
    disc(g, cx0, cy0, 4.2, INK); disc(g, cx0, cy0, 3.2, col); px(g, cx0 - 1, cy0 - 1, cl); px(g, cx0, cy0 - 1, '#ffffff');
    return c;
  });
}
function cenizaLazoBg() {
  return mdl('cz:lazoBg4', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 120); rect(g, 0, 118, SW, 2, '#b9cad0');
    woodFloor(g, 0, 120, SW, 72);
    ellipsePx(g, 148, 180, 86, 11, INK); ellipsePx(g, 148, 179, 85, 10, '#e05b98'); ellipsePx(g, 148, 179, 78, 7, '#ff93bf'); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; px(g, 148 + Math.cos(a) * 82, 179 + Math.sin(a) * 8.6, '#ffd1e4'); }
    // the little table with a velvet cushion (the bow rests on it)
    rect(g, 6, 70, 52, 5, RAMP.wood[3]); rect(g, 6, 70, 52, 1, RAMP.wood[4]); rect(g, 6, 75, 52, 1, INK); rect(g, 10, 75, 3, 48, RAMP.wood[1]); rect(g, 51, 75, 3, 48, RAMP.wood[1]);
    ellipsePx(g, 32, 66, 23, 7, INK); ellipsePx(g, 32, 65, 22, 6, '#8959c5'); ellipsePx(g, 29, 63, 13, 3, '#bf95e9'); for (const [x, y] of [[11, 66], [53, 66], [13, 62], [51, 62]]) disc(g, x, y, 2, RAMP.gold[3]);
    rect(g, 100, 18, 30, 34, INK); rect(g, 101, 19, 28, 32, RAMP.gold[2]); rect(g, 104, 22, 22, 22, '#fff8e6'); drawS(g, lifeWestie(false), 115, 32, {}); tiny(g, '1', 115, 45, INK, { align: 'c' });
    drawS(g, wbSign({ noCrest: true, noTag: true }), 196, 30, {});
    rect(g, 228, 96, 20, 22, INK); rect(g, 229, 97, 18, 21, '#c0662c'); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35; thickLine(g, 238, 96, 238 + Math.cos(a) * 18, 96 + Math.sin(a) * 18, 2, i % 2 ? '#2a9a6a' : '#5bd18b'); }
    return c;
  });
}
const CENIZA_LAZO_FLOOR = 184;
defMG({
  id: 'lazo2', stage: 'ceniza', name: 'Lazo de gala', cmd: '¡PONLE EL LAZO!', how: 'Arrastra el lazo del cojín hasta la cabeza de Keiko', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .55, n: 'F5 . A5 . C6 . A5 . G5 . Bb5 . D6 . Bb5 . A5 . C6 . F6 . C6 . E6 - C#6 - A5 - . .' },
    { i: 'pluck', v: .4, n: 'F4 . . C5 . . F4 . G4 . . D5 . . G4 . F4 . . C5 . . F4 . A4 . . C#5 . . E5 .' },
    { i: 'bass', v: .8, n: 'F2 . . . C3 . . . G2 . . . D3 . . . F2 . . . C3 . . . A2 . . . E2 . . .' },
    { i: 'd', v: .55, n: 'k . z . r . z . k . z . r . z z k . z . r . z . k . z z r . r .' }] }),
  init(g) {
    const n = g.level >= 3 ? 2 : 1, sp = [24, 40, 34][g.level - 1] * g.tempo;
    g.dogs = []; for (let i = 0; i < n; i++) g.dogs.push({ x: n === 1 ? g.r(128, 180) : 112 + i * 72, v: sp * (g.r() < .5 ? -1 : 1) * (1 + i * .25), bow: null, hop: g.r(TAU), stopT: 0, happy: 0, keiko: i === 0 });
    const spots = n === 1 ? [[32, 56]] : [[20, 58], [45, 50]];
    g.bows = spots.map(([x, y], i) => ({ x, y, hx: x, hy: y, rot: 0, sq: 0, fall: false, on: null, col: i ? '#63a0ef' : '#ff5d9e' }));
    g.held = null; g.stampT = -1;
  },
  headOf(d) { const k = .95, W = Math.ceil(88 * k), H = Math.ceil(64 * k), face = d.v >= 0 ? 1 : -1, top = CENIZA_LAZO_FLOOR - H - Math.abs(Math.sin(d.hop)) * 4; const hx = face > 0 ? d.x - W / 2 + 66 * k : d.x + W / 2 - 66 * k; return { x: hx, y: top + 9 * k, face }; },
  update(g, dt) {
    for (const d of g.dogs) {
      d.happy = Math.max(0, d.happy - dt);
      if (d.bow) { d.hop += dt * 12; continue; } // prancing happily in place
      if (d.stopT > 0) d.stopT -= dt; else { d.x += d.v * dt; d.hop += dt * 10 * Math.min(1.6, Math.abs(d.v) / 30); }
      if (d.x < 92 || d.x > 212) { d.v *= -1; d.x = clamp(d.x, 92, 212); }
      if (g.level >= 2 && g.r() < dt * .5) d.stopT = .35;
    }
    for (const b of g.bows) { b.sq = Math.max(0, b.sq - dt * 5); if (b.fall) cenizaFall(b, dt, 172); if (b.on) { const h = this.headOf(b.on); b.x = h.x - h.face * 2; b.y = h.y - 4; } }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.bows, 22, b => !b.on); if (g.held) { g.held.fall = false; g.held.vy = 0; } }
    if (g.held) {
      const b = g.held; cenizaFollow(b, dt, .6);
      if (IN.rel || !IN.down) {
        g.held = null;
        const snap = 20 * clamp(Math.pow(g.tempo || 1, .3), 1, 1.25); // a touch more forgiving when everything is flying
        const d = g.dogs.find(d => !d.bow && dist(b.x, b.y, this.headOf(d).x, this.headOf(d).y) < snap);
        if (d) {
          d.bow = b; b.on = d; d.happy = 1.2; b.sq = 1; sfx('sparkle'); sfx('bark', { pitch: 1.3, delay: .08 }); HITSTOP = 3; buzz(8);
          const h = this.headOf(d); g.fx.burst(h.x, h.y, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 40, sp1: 120 });
          for (let i = 0; i < 5; i++) g.fx.add({ k: 'heart', x: h.x + g.r(-10, 10), y: h.y - 6, vx: g.r(-20, 20), vy: g.r(-60, -30), life: .9, c: '#ff5d9e' });
          if (g.dogs.every(d => d.bow)) { g.win(); g.stampT = g.t; }
        } else { b.fall = true; b.vy = -40; b.vx = IN.vx * .2; sfx('boing', { pitch: 1.4, vol: .4 }); }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaLazoBg(), 0, 0);
    for (const d of g.dogs) {
      const mood = d.bow ? 'happy' : 'normal', pose = d.bow || d.happy > 0 ? 'wag' : 'stand', hop = Math.abs(Math.sin(d.hop)) * 4;
      shadowOval(c, d.x, CENIZA_LAZO_FLOOR - 4, 26 - hop, 3, .35);
      drawS(c, d.keiko ? cenizaKeikoSpr(.95, pose, mood) : westieSide(.95, pose, mood), d.x, CENIZA_LAZO_FLOOR - hop, { ax: .5, ay: 1, flip: d.v < 0 });
      // where the bow goes: a pink bead ring on the head (brighter while you hold a bow)
      if (!d.bow && g.state === 'play') { const h = this.headOf(d); cenizaZone(c, h.x, h.y - 1, 13, 10, g.t, '#ff5d9e', !!g.held); if (g.held) cenizaArrow(c, h.x, h.y - 12, g.t, '#ff93bf'); }
    }
    for (const b of g.bows) {
      const img = cenizaBowBig(b.col), o = { rot: b.rot, s: (b.on ? .8 : 1) + b.sq * .3 + (b === g.held ? .1 : 0) };
      if (!b.on && b !== g.held && g.state === 'play') cenizaHalo(c, img, b.x, b.y, g.t, '#ffffff', o);
      drawS(c, img, b.x, b.y, o);
    }
    if (g.state === 'won') cenizaStamp(c, g.dogs.length > 1 ? '¡GUAPÍSIMAS!' : '¡GUAPÍSIMA!', 128, 40, g.t - g.stampT);
  },
  hint(g) { const b = g.bows.find(q => !q.on), d = g.dogs.find(d => !d.bow); if (!b || !d) return null; const h = this.headOf(d); return { x: b.x, y: b.y, to: [h.x, h.y] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    if (!g.held) {
      const bow = g.bows.find(q => !q.on && (!q.fall || Math.abs(q.vy || 0) < 30));
      if (!bow) { b.down = false; return b; }
      if (b.down && dist(b.x, b.y, bow.x, bow.y) > 8) { b.down = false; return b; }
      cenizaBotGrab(b, bow.x, bow.y); return b;
    }
    const d = g.dogs.find(d => !d.bow); const h = this.headOf(d);
    const nearEdge = (d.v > 0 && d.x > 200) || (d.v < 0 && d.x < 104); // about to turn round: don't lead
    const lead = d.stopT > 0 || nearEdge ? 0 : d.v * .08;
    if (cenizaBotMove(b, h.x + lead, h.y, 5.5) && dist(g.held.x, g.held.y, h.x, h.y) < 11) { b.down = false; b.wait = .15 / b.k; }
    return b;
  },
});

// ---------------------------------------------------------------- 4 BAÑERA --
function cenizaClawTub() {
  return mdl('cenizaClawTub', () => {
    const W0 = RAMP.tile, G = RAMP.gold;
    const body = SD.smooth(4, SD.box(56, 34, 50, 18, 12), SD.ellipse(56, 20, 52, 9));
    const inner = SD.ellipse(56, 18, 46, 6);
    const feet = SD.union(SD.ellipse(16, 56, 6, 5), SD.ellipse(96, 56, 6, 5));
    return model(112, 64, [
      { f: feet, ramp: G, z: 0, th: 3 },
      { f: body, ramp: W0, z: 1, th: 16, gloss: true },
      { f: inner, ramp: ['#5aaee6', '#7fc6f0', '#9bd6f7', '#c9ecff', '#e8f8ff'], z: 2, th: 3, prof: 'flat', flatV: .5, out: false },
    ], { post: g => { for (let x = 12; x < 100; x += 2) px(g, x, 24, '#ffffff'); } });
  });
}
function cenizaBathBg() {
  return mdl('cz:bathScene2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 132);
    rect(g, 0, 132, SW, 60, '#b9cad0'); for (let y = 134; y < SH; y += 10) for (let x = (y / 10 % 2) * 10; x < SW; x += 20) rect(g, x, y, 10, 10, '#c9d8dd');
    rect(g, 0, 132, SW, 2, '#8fa3ad');
    // towel rail with a pink WB towel, a shelf with shampoo
    rect(g, 14, 30, 50, 3, RAMP.steel[3]); rect(g, 14, 33, 50, 1, INK); rect(g, 22, 33, 30, 34, INK); rect(g, 23, 33, 28, 33, '#ff93bf'); rect(g, 23, 33, 28, 3, '#ffd1e4'); for (let y = 40; y < 64; y += 4) hline(g, 24, 49, y, '#ff7eb2'); tiny(g, 'WB', 37, 50, '#ffffff', { align: 'c' });
    rect(g, 168, 64, 70, 4, RAMP.wood[3]); rect(g, 168, 68, 70, 1, INK);
    for (let i = 0; i < 4; i++) { const x = 176 + i * 16, h = 14 + (i % 2) * 4, col = ['#63a0ef', '#ff93bf', '#5bd18b', '#ffdf4f'][i]; rect(g, x - 5, 64 - h, 10, h, INK); rect(g, x - 4, 65 - h, 8, h - 1, col); rect(g, x - 2, 60 - h, 4, 4, INK); rect(g, x - 1, 61 - h, 2, 3, '#ffffff'); rect(g, x - 3, 68 - h, 2, h - 8, '#ffffff'); }
    return c;
  });
}
defMG({
  id: 'banera', stage: 'ceniza', name: 'Al agua, patos', cmd: '¡AL AGUA!', how: 'Keiko no quiere bañarse: arrástrala a la bañera sin tirones', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .5, n: 'D5 D5 . F5 . . A5 . G#5 . A5 . . F5 . . D5 D5 . F5 . . A5 . Bb5 . A5 . F5 - . .' },
    { i: 'kalimba', v: .45, n: 'A5 . . . D6 . . . A5 . . . F5 . . . A5 . . . D6 . . . G5 . E5 . C#5 . . .' },
    { i: 'bass', v: .85, n: 'D3 . A2 . D3 . A2 . D3 . A2 . D3 . A2 . Bb2 . F2 . Bb2 . F2 . A2 . E2 . A2 . C#3 .' },
    { i: 'd', v: .6, n: 'k . w . s . w . k k w . s . w w k . w . s . w . k k w . s s s .' }] }),
  init(g) {
    g.anchor = { x: 58, y: 180 }; g.dog = { x: 58, y: 180, rot: 0, st: 'floor', t: 0, sx: 1, sy: 1 };
    g.tub = { x: 188, y: 150, rx: 44 };
    g.res = [.6, .48, .38][g.level - 1]; g.grip = 0; g.wriggle = [9999, 560, 440][g.level - 1] * Math.max(1, g.tempo);
    g.held = false; g.slipT = 0; g.warn = 0; g.stampT = -1; g.grabbed = false;
  },
  update(g, dt) {
    const d = g.dog; d.t += dt; g.slipT = Math.max(0, g.slipT - dt); g.warn = Math.max(0, g.warn - dt * 2);
    if (d.st === 'back') { d.x = lerp(d.x, g.anchor.x, .18); d.y = lerp(d.y, g.anchor.y, .18); d.rot *= .8; d.sx = lerp(d.sx, 1, .3); d.sy = lerp(d.sy, 1, .3); if (dist(d.x, d.y, g.anchor.x, g.anchor.y) < 1) { d.st = 'floor'; sfx('tap', { pitch: .6 }); } }
    if (d.st === 'splash') { d.y = lerp(d.y, g.tub.y - 4, .15); d.x = lerp(d.x, g.tub.x, .15); return; }
    if (g.state !== 'play') { g.held = false; return; }
    if (!g.held && IN.tap && dist(IN.x, IN.y, d.x, d.y - 24) < 32 && d.st !== 'splash') { g.held = true; g.grabbed = true; g.grip = 0; g.yank = 0; d.st = 'held'; sfx('whine', { pitch: 1.3, vol: .6 }); buzz(8); }
    if (g.held) {
      g.grip = Math.min(1, g.grip + dt * 1.2 * Math.max(1, g.tempo));
      const f = lerp(g.res, 1, g.grip), tx = g.anchor.x + (IN.x - g.anchor.x) * f, ty = g.anchor.y + (IN.y + 24 - g.anchor.y) * f;
      d.x = lerp(d.x, tx, .35); d.y = lerp(d.y, Math.min(g.anchor.y, ty), .35);
      const tension = clamp(dist(IN.x, IN.y + 24, d.x, d.y) / 50, 0, 1);
      d.sx = 1 + tension * .25; d.sy = 1 - tension * .12; d.rot = clamp(Math.atan2(IN.y + 24 - d.y, IN.x - d.x) * tension * .6, -.8, .8);
      if (FRAME % 6 === 0 && tension > .3 && d.y > g.anchor.y - 6) g.fx.add({ k: 'puff', x: d.x - 18, y: g.anchor.y - 4, vx: -20, vy: -10, r: 2.5, life: .35, c: '#dce7ea' });
      g.yank = lerp(g.yank || 0, Math.hypot(IN.vx, IN.vy), .12);
      if (g.yank > g.wriggle * .7 && g.grip < .9) g.warn = 1;
      if (g.yank > g.wriggle && g.grip < .9) { g.held = false; d.st = 'back'; g.slipT = 1; sfx('whine', { pitch: 1.6 }); g.shake(2, .2); g.fx.add({ k: 'txt', s: '¡Se escapa!', x: d.x, y: d.y - 50, life: .8, c: '#ffd1e4' }); return; }
      if (IN.rel || !IN.down) {
        g.held = false;
        if (Math.abs(d.x - g.tub.x) < g.tub.rx && d.y < g.tub.y + 14) {
          d.st = 'splash'; g.win(); g.stampT = g.t; sfx('splash'); sfx('bark', { n: 2, pitch: 1.2, delay: .2 }); HITSTOP = 4; g.shake(3, .25); buzz(20);
          g.fx.burst(g.tub.x, g.tub.y - 10, 26, { k: 'drop', c: ['#9bd6f7', '#dff4ff', '#ffffff'], sp0: 60, sp1: 200, g: 420, life0: .4, life1: .9, a0: -Math.PI, spread: Math.PI });
          g.fx.burst(g.tub.x, g.tub.y - 14, 14, { k: 'bubble', c: '#ffffff', sp0: 30, sp1: 120, r: 4, life0: .5, life1: 1 });
        } else { d.st = 'back'; sfx('boing', { pitch: .8 }); }
      }
    } else if (d.st === 'held') d.st = 'back';
  },
  draw(g, c) {
    c.drawImage(cenizaBathBg(), 0, 0);
    const T = g.tub, tub = cenizaClawTub(), d = g.dog;
    c.drawImage(tub, rd(T.x - 56), rd(T.y - 30));
    if (d.st === 'splash') {
      drawS(c, keikoHead(g.t - g.decidedAt < .4 ? 'wow' : 'happy'), d.x, d.y - 24 - Math.abs(Math.sin(g.t * 6)) * 2, {});
      for (const [dx, dy, r] of [[-12, -50, 7], [0, -56, 9], [12, -50, 7]]) { disc(c, d.x + dx, d.y + dy, r + 1, '#b9cad0'); disc(c, d.x + dx, d.y + dy, r, '#ffffff'); }
      for (let x = T.x - 50; x < T.x + 50; x += 7) disc(c, x, T.y - 10 + Math.sin(x + g.t * 4) * 1.5, 5, '#ffffff');
      cenizaPato(c, T.x + 32, T.y - 42, 'laugh', g.t, { s: 1 });
    } else {
      for (let x = T.x - 50; x < T.x + 50; x += 7) disc(c, x, T.y - 10 + Math.sin(x + g.t * 4) * 1.5, 5, '#ffffff');
      cenizaPato(c, T.x + 32, T.y - 42, g.slipT > 0 ? 'laugh' : 'grin', g.t, { s: 1 });
      // where she goes (the water) and the way there
      if (g.state === 'play') {
        cenizaZone(c, T.x - 6, T.y - 12, 36, 9, g.t, '#fff27a', g.held);
        if (g.held) cenizaArrow(c, T.x - 6, T.y - 22, g.t, '#fff27a');
        else if (d.st === 'floor') cenizaTrail(c, d.x + 22, d.y - 44, T.x - 10, T.y - 30, 26, g.t, '#9bd6f7');
      }
      const mood = d.st === 'held' ? 'wow' : 'sad', pose = d.st === 'held' ? 'wet' : 'stand', lift = g.anchor.y - d.y;
      shadowOval(c, d.x, g.anchor.y - CENIZA_FEET + 1, Math.max(8, 24 - lift * .2), 3, .35);
      const img = cenizaKeikoSpr(1, pose, mood), o = { ax: .5, ay: 1, sx: d.sx, sy: d.sy, rot: d.rot };
      const jitter = d.st === 'floor' ? Math.sin(g.t * 20) * .6 : 0;
      if (d.st === 'floor' && !g.grabbed && g.state === 'play') cenizaHalo(c, img, d.x + jitter, d.y, g.t, '#ffffff', o);
      drawS(c, img, d.x + jitter, d.y, o);
      if (d.st === 'floor' && g.state === 'play') {
        const k = (g.t * 1.5) % 1; if (k < .6) shout(c, '¡NO QUIERO!', g.anchor.x + 6, 104, k);
        // sweat drops of a dog who knows what a bath is
        for (let i = 0; i < 2; i++) { const ph = (g.t * 2 + i * .5) % 1; c.globalAlpha = 1 - ph; disc(c, d.x + 34 + i * 6, d.y - 58 + ph * 10, 1.6, '#9bd6f7'); c.globalAlpha = 1; }
      }
      if (g.held && g.warn > 0) { c.globalAlpha = g.warn; panel(c, d.x - 30, d.y - 80, 60, 14, '#ffffff', { r: 4 }); txt(c, '¡Despacio!', d.x, d.y - 76, '#c02d45', { align: 'c', bold: true }); c.globalAlpha = 1; }
    }
    if (g.state === 'won') cenizaStamp(c, '¡AL AGUA!', 128, 22, g.t - g.stampT, CENIZA_WATER_FILL);
  },
  hint(g) { const d = g.dog; return { x: d.x, y: d.y - 24, path: [[d.x, d.y - 24], [118, d.y - 70], [g.tub.x - 6, g.tub.y - 34]] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    const d = g.dog;
    if (!g.held) { if (d.st === 'back') { b.down = false; return b; } if (b.down && dist(b.x, b.y, d.x, d.y - 24) > 10) { b.down = false; return b; } cenizaBotGrab(b, d.x, d.y - 24); return b; }
    // pull at a calm pace (too fast and she slips away) and wait for her to give in
    const sp = g.level >= 2 ? 3 : 5, tx = g.tub.x - 6, ty = g.tub.y - 38;
    const at = cenizaBotMove(b, tx, ty, sp);
    if (at && Math.abs(d.x - g.tub.x) < g.tub.rx - 8 && d.y < g.tub.y + 6) b.down = false;
    return b;
  },
});

// ---------------------------------------------------------------- 5 CORREA --
function cenizaCorreaBg() {
  return mdl('cenizaCorreaBg3', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    greenWall(g, 0, 0, SW, 140);
    woodFloor(g, 0, 140, SW, 52); rect(g, 0, 138, SW, 2, RAMP.green[0]);
    rect(g, 14, 20, 30, 9, INK); rect(g, 15, 21, 28, 7, RAMP.wood[2]); rect(g, 15, 21, 28, 2, RAMP.wood[4]); disc(g, 29, 34, 3.5, INK); disc(g, 29, 34, 2.5, RAMP.gold[3]);
    tiny(g, 'CORREAS', 29, 11, '#d2f5e4', { align: 'c' });
    drawS(g, wbSign({ noCrest: true, noTag: true }), 164, 24, {});
    // the open street door (they're off for a walk)
    rect(g, 214, 58, 36, 82, INK); rect(g, 216, 60, 32, 80, '#9bd6f7'); rect(g, 216, 60, 32, 14, '#c9ecff'); rect(g, 216, 110, 32, 30, '#b9cad0'); rect(g, 216, 104, 32, 6, '#7b8398');
    for (let i = 0; i < 3; i++) rect(g, 220 + i * 10, 90 - i * 6, 6, 14 + i * 6, '#94dcbc');
    return c;
  });
}
function cenizaClipSpr() {
  return mdl('cz:clip2', () => {
    const c = mkCanvas(18, 28), g = c.g, S = RAMP.steel;
    ringPx(g, 9, 4.5, 4, INK); ringPx(g, 9, 4.5, 3, S[3]); ringPx(g, 9, 4.5, 2.2, INK); // swivel eye
    rect(g, 3, 8, 12, 18, INK); rect(g, 4, 9, 10, 16, S[3]); rect(g, 4, 9, 2, 16, S[4]); rect(g, 12, 9, 2, 16, S[1]);
    rect(g, 7, 11, 4, 11, S[1]); rect(g, 8, 12, 2, 9, '#2b2540'); // the gate slot
    rect(g, 13, 13, 4, 4, INK); rect(g, 14, 14, 2, 2, RAMP.gold[3]); // thumb lever
    rect(g, 5, 23, 8, 3, INK); rect(g, 6, 23, 6, 2, S[2]); // the hook's lip
    return c;
  });
}
defMG({
  id: 'correa2', stage: 'ceniza', name: 'A pasear', cmd: '¡ENGANCHA!', how: 'Lleva el mosquetón de la correa hasta la anilla dorada del collar', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .55, n: 'D6 C#6 D6 A5 . . F5 . G5 F5 E5 D5 . . A4 . D6 C#6 D6 A5 . . F5 . E5 F5 G5 A5 - . . .' },
    { i: 'organ', v: .3, n: 'D4+F4+A4 - - - - - - - G3+Bb3+D4 - - - - - - - D4+F4+A4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .85, n: 'D3 . . D3 A2 . . A2 G2 . . G2 D3 . . D3 D3 . . D3 A2 . . A2 A2 . . A2 C#3 . E3 .' },
    { i: 'd', v: .7, n: 'k . h k s . h . k . h k s . h h k . h k s . h . k k h . s s s s' }] }),
  init(g) {
    g.hook = { x: 29, y: 36 }; g.clip = { x: 29, y: 92, vx: 0, vy: 0, rot: 0 }; g.held = false; g.hooked = false;
    g.dog = { x: 140, y: 180, ph: g.r(TAU), face: 1 };
    g.sp = [1, 1.3, 1.6][g.level - 1] * g.tempo; g.stampT = -1;
  },
  dogPos(g) {
    const d = g.dog, p = d.ph;
    if (g.hooked) return { x: d.x, y: d.y, face: d.face, hop: 0 };
    if (g.level === 1) return { x: 136 + Math.sin(p) * 40, y: 180, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 3)) * 3 };
    if (g.level === 2) return { x: 136 + Math.sin(p) * 48, y: 180, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 2)) * 14 };
    return { x: 136 + Math.sin(p) * 55, y: 178 + Math.cos(p) * 5, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 2.5)) * 10 };
  },
  // the collar's D-ring, in screen space
  ring(g) { const P = this.dogPos(g), W = 88, H = 64, top = P.y - H - P.hop; const nx = P.face > 0 ? P.x - W / 2 + 60 : P.x + W / 2 - 60; return { x: nx, y: top + 38, P }; },
  update(g, dt) {
    const d = g.dog;
    if (!g.hooked) { d.ph += dt * 1.6 * g.sp; const P = this.dogPos(g); d.x = P.x; d.y = P.y; d.face = P.face; }
    const C0 = g.clip;
    if (g.hooked) { const R = this.ring(g); C0.x = R.x; C0.y = R.y + 12; C0.rot = 0; return; }
    if (g.state !== 'play') return;
    if (!g.held && IN.tap && dist(IN.x, IN.y, C0.x, C0.y) < 24) { g.held = true; sfx('pop', { pitch: .8 }); buzz(6); }
    if (g.held) {
      C0.x = lerp(C0.x, IN.x, .6); C0.y = lerp(C0.y, IN.y, .6); C0.rot = clamp(IN.vx / 800, -.6, .6);
      const R = this.ring(g);
      if (dist(C0.x, C0.y - 10, R.x, R.y) < 11) {
        g.hooked = true; g.held = false; g.win(); g.stampT = g.t; sfx('snip', { pitch: .7 }); sfx('bark', { n: 2, pitch: 1.2, delay: .1 }); HITSTOP = 4; buzz(15);
        g.fx.burst(R.x, R.y, 14, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 40, sp1: 130 }); g.fx.add({ k: 'txt', s: '¡CLIC!', x: R.x, y: R.y - 20, life: .7, c: '#ffffff' });
      }
      if (IN.rel || !IN.down) g.held = false;
    } else {
      const rest = { x: g.hook.x, y: g.hook.y + 58 };
      C0.vx += (rest.x - C0.x) * 30 * dt; C0.vy += (rest.y - C0.y) * 30 * dt; C0.vx *= Math.exp(-3 * dt); C0.vy *= Math.exp(-3 * dt);
      C0.x += C0.vx * dt; C0.y += C0.vy * dt; C0.rot = clamp(C0.vx / 200, -.8, .8);
    }
  },
  draw(g, c) {
    c.drawImage(cenizaCorreaBg(), 0, 0);
    const R = this.ring(g), P = R.P;
    shadowOval(c, P.x, P.y - CENIZA_FEET + 1, 24 - P.hop * .4, 3, .35);
    drawS(c, westieSide(1, 'wag', g.hooked ? 'happy' : 'wow'), P.x, P.y - P.hop, { ax: .5, ay: 1, flip: P.face < 0 });
    // a proper red collar with a big gold D-ring
    const top = P.y - 64 - P.hop, cxn = P.face > 0 ? P.x - 44 + 59 : P.x + 44 - 59;
    for (let i = -7; i <= 7; i++) { const yy = top + 30 + i * .9, xx = cxn - 3 * P.face + Math.abs(i) * .35 * P.face; rect(c, xx - 3, yy, 7, 1, INK); rect(c, xx - 2, yy, 5, 1, i < 0 ? '#ff6b6b' : '#e23b4e'); }
    if (!g.hooked && g.state === 'play') { cenizaZone(c, R.x, R.y, 10, 10, g.t, '#ffdf4f', g.held); if (g.held) cenizaArrow(c, R.x, R.y - 12, g.t, '#ffdf4f'); }
    disc(c, R.x, R.y, 5.5, INK); ringPx(c, R.x, R.y, 4, RAMP.gold[4]); ringPx(c, R.x, R.y, 3.2, RAMP.gold[2]); px(c, R.x - 2, R.y - 3, '#ffffff');
    // the leash: a sagging rope from the hook to the clip
    const H0 = g.hook, C0 = g.clip, sag = Math.max(8, 70 - dist(H0.x, H0.y, C0.x, C0.y) * .35);
    const mx = (H0.x + C0.x) / 2, my = (H0.y + C0.y) / 2 + sag, pts = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([(1 - t) * (1 - t) * H0.x + 2 * (1 - t) * t * mx + t * t * C0.x, (1 - t) * (1 - t) * H0.y + 2 * (1 - t) * t * my + t * t * (C0.y - 12)]); }
    for (let i = 1; i < pts.length; i++) thickLine(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2.4, INK);
    for (let i = 1; i < pts.length; i++) thickLine(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1.5, '#e05b98');
    for (let i = 1; i < pts.length; i += 2) px(c, pts[i][0], pts[i][1] - 1, '#ffd1e4');
    const img = cenizaClipSpr(), o = { rot: C0.rot || 0, ay: .8, s: g.held ? 1.1 : 1 };
    if (!g.held && !g.hooked && g.state === 'play') cenizaHalo(c, img, C0.x, C0.y, g.t, '#fff27a', o);
    drawS(c, img, C0.x, C0.y, o);
    if (g.state === 'won') cenizaStamp(c, '¡A PASEAR!', 128, 70, g.t - g.stampT, CENIZA_WIN_FILL);
  },
  hint(g) { const R = this.ring(g); return { x: g.clip.x, y: g.clip.y, to: [R.x, R.y + 10] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    if (!g.held) { if (b.down && dist(b.x, b.y, g.clip.x, g.clip.y) > 10) { b.down = false; return b; } cenizaBotGrab(b, g.clip.x, g.clip.y); return b; }
    const R = this.ring(g); cenizaBotMove(b, R.x, R.y + 10, 5.5); return b;
  },
});

// ---------------------------------------------------------------- 6 ESCOBA (new)
// Ceniza on her broom over the Eixample at night: drag her to catch the
// falling stars of shampoo magic before they sink behind the rooftops.
function cenizaBroomSpr(f = 0) {
  return mdl('cz:broom3' + f, () => {
    const F = RAMP.black, HAT = RAMP.purple, GR = RAMP.green, WD = RAMP.wood, ST = WD.map(q => mixHex(q, '#e6b33e', .4));
    const stick = SD.capsule(12, 45, 64, 34, 2, 1.7);
    const bristleS = SD.poly([[16, 42], [2, 37 - f], [0, 45], [3, 53 + f], [16, 48]]);
    const bristle = SD.tufts(bristleS, 10, 45, 1.3, 11, f * 1.7, 2);
    const band = SD.box(16.5, 45, 1.6, 3.6, .5, -.2);
    const body = SD.smooth(2, SD.ellipse(37, 38, 9.5, 7.5), SD.ellipse(42, 32, 6, 5));
    const head = SD.ellipse(45, 25, 9, 8);
    const cheeks = SD.tufts(SD.union(SD.ellipse(38, 28, 4, 3.4), SD.ellipse(52, 28, 4, 3.4)), 45, 27, 1, 14, .8, 2);
    const earL = SD.grow(SD.poly([[37, 20], [34, 11], [42, 16]]), .7), earR = SD.grow(SD.poly([[49, 16], [55, 11], [54, 21]]), .7);
    const brim = SD.ellipse(45.5, 17.5, 12, 2.6);
    const cone = SD.grow(SD.poly([[38, 17], [52, 17], [47, 9], [31, 3 + f], [41, 10]]), .5);
    const cape = SD.grow(SD.poly([[33, 31], [43, 31], [26, 46 + f * 2], [18, 41 + f * 2]]), .6);
    const tail = SD.curve([30, 42], [20, 40 + f * 2], [17, 31 - f], 2, 1.3);
    const pawF = SD.circle(51, 37.5, 2.6), pawB = SD.circle(33, 43, 2.6);
    const fx = clumpTex(3, .12, 21, 1.3);
    const c = model(68, 56, [
      { f: tail, ramp: F, z: 0, th: 2.5, tex: fx },
      { f: cape, ramp: GR, z: .3, th: 3 },
      { f: body, ramp: F, z: 1, th: 8, tex: fx },
      { f: bristle, fs: bristleS, ramp: ST, z: 1.4, th: 5 },
      { f: stick, ramp: WD, z: 1.6, th: 2.5 },
      { f: band, ramp: RAMP.red, z: 1.7, th: 1.5 },
      { f: pawB, ramp: F, z: 1.8, th: 2 }, { f: pawF, ramp: F, z: 1.8, th: 2 },
      { f: head, ramp: F, z: 2, th: 8, tex: fx, amb: .34 },
      { f: cheeks, ramp: F, z: 2.1, th: 3, tex: fx },
      { f: earL, ramp: F, z: 1.9, th: 2.5 }, { f: earR, ramp: F, z: 2.2, th: 2.5 },
      { f: cone, ramp: HAT, z: 2.4, th: 4 }, { f: brim, ramp: HAT, z: 2.5, th: 2 },
    ]);
    const g = c.g, EY = ['#3d5a0a', '#7fb11c', '#b9e04a', '#e6f79a'];
    // eyes (almond, slit pupils), nose, "w" mouth, blush — like her portrait
    for (const ex of [40, 48]) { rect(g, ex, 23, 4, 4, EY[1]); hline(g, ex, ex + 3, 23, EY[0]); px(g, ex + 1, 24, EY[3]); vline(g, ex + 2, 23, 26, INK); hline(g, ex - 1, ex + 4, 22, '#0b0712'); }
    hline(g, 45, 46, 28, RAMP.pink[2]); px(g, 44, 29, INK); px(g, 45, 30, INK); px(g, 46, 29, INK); px(g, 47, 30, INK); px(g, 48, 29, INK);
    px(g, 38, 28, '#8f5cc7'); px(g, 39, 28, '#8f5cc7'); px(g, 51, 28, '#8f5cc7'); px(g, 52, 28, '#8f5cc7');
    hline(g, 39, 51, 16, GR[3]); hline(g, 39, 51, 15, GR[2]); rect(g, 44, 15, 3, 2, RAMP.gold[3]);
    drawStar(g, 40, 9, 1.8, RAMP.yellow[3]);
    return c;
  });
}
function cenizaNightBg() {
  return mdl('cz:nightBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 150, ['#0e0b2a', '#16123e', '#211a52', '#2d2066', '#3d2a78']);
    for (let i = 0; i < 50; i++) px(g, hash2(i, 3) * SW, hash2(3, i) * 120, hash2(i, 9) < .3 ? '#ffffff' : '#8f86d8');
    disc(g, 40, 30, 14, '#fff2c0'); disc(g, 46, 25, 12, '#16123e');
    // the Sagrada Família (and its eternal crane) behind the Eixample rooftops
    const SF = '#2a1f5e', SFl = '#3a2d78';
    for (const [dx, h] of [[0, 78], [11, 96], [22, 96], [33, 78]]) {
      const bx = 152 + dx, top = 150 - h;
      polyPx(g, [[bx, 150], [bx + 1, top + 18], [bx + 4.5, top], [bx + 8, top + 18], [bx + 9, 150]], SF);
      disc(g, bx + 4.5, top, 1.8, '#fff27a'); for (let y = top + 22; y < 138; y += 8) px(g, bx + 4.5, y, SFl);
    }
    polyPx(g, [[160, 150], [174, 96], [188, 150]], SF);
    rect(g, 206, 38, 2, 112, SF); rect(g, 188, 38, 40, 2, SF); linePx(g, 207, 32, 190, 38, SF); linePx(g, 207, 32, 226, 38, SF); vline(g, 222, 40, 58, SFl); rect(g, 220, 58, 5, 4, SF);
    for (let x = -8; x < SW; x += 40) {
      const h = 16 + hash2(x, 2) * 14; rect(g, x, 150 - h, 38, h + 42, '#130e2e'); rect(g, x, 150 - h, 38, 2, '#2a2150'); rect(g, x + 26, 150 - h - 8, 6, 8, '#2a2150');
      for (let wy = 150 - h + 6; wy < 186; wy += 8) for (let wx = x + 4; wx < x + 34; wx += 8) if (hash2(wx, wy) < .35) rect(g, wx, wy, 3, 4, '#ffd87a');
    }
    // a tiny green WB sign glowing on one building
    rect(g, 96, 136, 16, 8, INK); rect(g, 97, 137, 14, 6, RAMP.green[2]); tiny(g, 'WB', 104, 137, '#d2f5e4', { align: 'c' });
    rect(g, 0, 176, SW, 16, '#0b0820');
    return c;
  });
}
function cenizaBatSpr(f) {
  return mdl('cz:bat2' + f, () => {
    const c = mkCanvas(24, 16), g = c.g, B = '#2b2540', wy = f ? -4 : 3;
    for (const s of [-1, 1]) polyPx(g, [[12, 8], [12 + s * 11, 7 + wy], [12 + s * 9, 10 + wy * .4], [12 + s * 6, 10], [12 + s * 4, 12]], B);
    disc(g, 12, 9, 3.6, B); polyPx(g, [[9, 7], [9.5, 2.5], [11.5, 6]], B); polyPx(g, [[15, 7], [14.5, 2.5], [12.5, 6]], B);
    px(g, 10, 8, '#ff5a6e'); px(g, 13, 8, '#ff5a6e'); px(g, 11, 11, '#ffffff'); px(g, 12, 11, '#ffffff');
    return outlined(c, INK, false);
  });
}
defMG({
  id: 'escoba', stage: 'ceniza', name: 'Vuelo nocturno', cmd: '¡ATRAPA!', how: 'Arrastra a Ceniza y atrapa las estrellas antes de que caigan', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .5, n: 'D6 . . A5 . . F5 . D6 . . Bb5 . . G5 . C#6 . . A5 . . E5 . C#6 . E6 . A6 - . .' },
    { i: 'pad', v: .45, n: 'D4+F4+A4 - - - - - - - G3+Bb3+D4 - - - - - - - A3+C#4+E4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .8, n: 'D3 . . . A2 . . . G2 . . . D3 . . . A2 . . . E2 . . . A2 . C#3 . E3 . . .' },
    { i: 'd', v: .55, n: 'k . . . z . . . s . . . z . . . k . . . z . . . s . z . s s . .' }] }),
  init(g) {
    g.need = [3, 4, 5][g.level - 1]; g.got = 0;
    g.cat = { x: 128, y: 104, vx: 0, rot: 0, bump: 0 }; g.held = false; g.grabbed = false;
    g.stars = []; g.spawnT = .1; g.spawned = 0; g.total = g.need + 1;
    g.bats = []; for (let i = 0; i < g.level - 1; i++) g.bats.push({ x: i ? 250 : 6, y: 62 + i * 36, v: (i ? -1 : 1) * [0, 46, 60][g.level - 1] * g.tempo, f: 0 });
    g.stampT = -1;
  },
  update(g, dt) {
    const sp = [1, 1.15, 1.3][g.level - 1] * g.tempo, Cc = g.cat;
    Cc.bump = Math.max(0, Cc.bump - dt * 2);
    g.spawnT -= dt;
    if (g.spawned < g.total && g.spawnT <= 0) { const x = g.spawned === 0 ? (g.r() < .5 ? g.r(40, 90) : g.r(166, 216)) : clamp(g.lastX + g.r(-70, 70), 28, 228); g.lastX = x; g.stars.push({ x, y: -8, vy: g.r(28, 40) * sp, spin: g.r(TAU), got: false, lost: false }); g.spawned++; g.spawnT = g.r(.35, .6) / sp; }
    for (const s of g.stars) { if (s.got || s.lost) continue; s.y += s.vy * dt; s.spin += dt * 4; if (s.y > 150) { s.lost = true; g.fx.add({ k: 'puff', x: s.x, y: 150, r: 3, life: .4, c: '#8f86d8' }); } }
    for (const b of g.bats) { b.x += b.v * dt; b.f += dt * 10; if (b.x < 0 || b.x > SW) b.v *= -1; if (g.state === 'play' && Cc.bump <= 0 && dist(b.x, b.y, Cc.x, Cc.y) < 18) { Cc.bump = 1; Cc.vx = sgn(Cc.x - b.x) * 160; sfx('czMeow', { pitch: 1.5 }); g.shake(2, .15); g.fx.add({ k: 'txt', s: '¡Uy!', x: Cc.x, y: Cc.y - 26, life: .5, c: '#ffd1e4' }); } }
    if (g.state === 'play') {
      if (!g.held && IN.tap && dist(IN.x, IN.y, Cc.x, Cc.y) < 32) { g.held = true; g.grabbed = true; sfx('czMagic', { vol: .4 }); }
      if (g.held) {
        const tx = clamp(IN.x, 24, 232), ty = clamp(IN.y, 24, 148), px0 = Cc.x;
        Cc.x = lerp(Cc.x, tx, Cc.bump > 0 ? .08 : .3); Cc.y = lerp(Cc.y, ty, Cc.bump > 0 ? .08 : .3);
        Cc.rot = lerp(Cc.rot, clamp((Cc.x - px0) / 12, -.5, .5), .3);
        if (FRAME % 3 === 0) g.fx.add({ k: 'spark', x: Cc.x - 28, y: Cc.y + 8, vx: -30, vy: 10, life: .4, r: 1.5, c: pick(['#fff27a', '#c8f05a', '#ff93bf']) });
        if (IN.rel || !IN.down) g.held = false;
      } else { Cc.rot *= .9; Cc.y += Math.sin(g.t * 3) * .15; }
      Cc.x += Cc.vx * dt; Cc.vx *= Math.exp(-4 * dt); Cc.x = clamp(Cc.x, 24, 232);
      for (const s of g.stars) if (!s.got && !s.lost && dist(s.x, s.y, Cc.x + 6, Cc.y - 6) < 22) {
        s.got = true; g.got++; sfx('coin', { pitch: 1 + g.got * .08 }); HITSTOP = 2; buzz(6);
        g.fx.burst(s.x, s.y, 12, { k: 'star', c: ['#fff27a', '#ffffff', '#c8f05a'], sp0: 30, sp1: 110 });
        g.fx.add({ k: 'txt', s: g.got + '/' + g.need, x: s.x, y: s.y - 14, life: .5, c: '#fff27a' });
        if (g.got >= g.need) { g.win(); g.stampT = g.t; sfx('czMagic'); }
      }
      // not enough stars left in the sky to make it: fail early
      const left = g.stars.filter(s => !s.got && !s.lost).length + (g.total - g.spawned);
      if (g.state === 'play' && g.got + left < g.need) { g.lose(); g.stampT = g.t; sfx('czMeow', { pitch: .8 }); }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaNightBg(), 0, 0);
    for (const s of g.stars) {
      if (s.got || s.lost) continue;
      c.globalAlpha = .18; disc(c, s.x, s.y, 12 + Math.sin(g.t * 9 + s.spin) * 1.5, '#fff7ae'); c.globalAlpha = 1;
      for (let i = 1; i < 5; i++) px(c, s.x, s.y - 7 - i * 3, i % 2 ? '#fff27a' : '#ffffff');
      drawStar(c, s.x, s.y, 9.5, INK, s.spin); drawStar(c, s.x, s.y, 7.8, '#ffdf4f', s.spin); drawStar(c, s.x - 1, s.y - 1, 3.6, '#fff7ae', s.spin); px(c, s.x - 2, s.y - 2, '#ffffff');
    }
    for (const b of g.bats) drawS(c, cenizaBatSpr(fl(b.f) % 2), b.x, b.y, { flip: b.v < 0 });
    const Cc = g.cat, img = cenizaBroomSpr(fl(g.t * 8) % 2), o = { rot: Cc.rot + (Cc.bump > 0 ? Math.sin(g.t * 30) * .3 : 0) };
    if (!g.held && g.state === 'play') cenizaHalo(c, img, Cc.x, Cc.y, g.t, g.grabbed ? '#c8f05a' : '#ffffff', o);
    drawS(c, img, Cc.x, Cc.y, o);
    // the stars she still needs
    panel(c, 6, 170, 14 + g.need * 14, 18, '#1b1627', { r: 5 });
    for (let i = 0; i < g.need; i++) { const x = 17 + i * 14, on = i < g.got; drawStar(c, x + 1, 180, 5.5, INK); drawStar(c, x, 179, 5, on ? '#ffdf4f' : '#40395e'); }
    if (g.state === 'won') cenizaStamp(c, '¡MAGIA!', 128, 60, g.t - g.stampT, CENIZA_GOLD_FILL);
    if (g.state === 'lost' && g.stampT >= 0) cenizaStamp(c, '¡SE ESCAPAN!', 128, 60, g.t - g.stampT, CENIZA_BAD_FILL);
  },
  hint(g) { const s = g.stars.find(s => !s.got && !s.lost); const Cc = g.cat; return { x: Cc.x, y: Cc.y, to: s ? [s.x, Math.min(140, s.y + 30)] : [Cc.x + 50, Cc.y - 30] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    const Cc = g.cat;
    if (!g.held) { if (b.down && dist(b.x, b.y, Cc.x, Cc.y) > 12) { b.down = false; return b; } cenizaBotGrab(b, Cc.x, Cc.y); return b; }
    // chase the lowest star, meeting it a little ahead of its fall
    const s = g.stars.filter(s => !s.got && !s.lost).sort((a, q) => q.y - a.y)[0];
    if (s) cenizaBotMove(b, s.x - 6, Math.min(146, s.y + s.vy * .25 + 6), 5.5);
    return b;
  },
});

// ---------------------------------------------------------------- 7 CESTAS (new)
// kittens and puppies loose in the salon's nap corner: each to its own basket
function cenizaKitten(col, mood = 'normal') {
  return mdl('cz:kit3:' + col[2] + mood, () => {
    const head = SD.ellipse(17, 15, 11, 9), body = SD.ellipse(17, 26, 9, 7);
    const earL = SD.grow(SD.poly([[8, 11], [6, 2], [14, 7]]), .7), earR = SD.grow(SD.poly([[26, 11], [28, 2], [20, 7]]), .7);
    const tail = SD.curve([24, 28], [32, 28], [30, 16], 2, 1.3), paws = SD.union(SD.ellipse(13, 32, 3, 2), SD.ellipse(21, 32, 3, 2));
    const fx = clumpTex(3, .1, 5, 1.2);
    const c = model(34, 35, [{ f: tail, ramp: col, z: 0, th: 2 }, { f: body, ramp: col, z: 1, th: 6, tex: fx }, { f: paws, ramp: col, z: 1.5, th: 2 }, { f: head, ramp: col, z: 2, th: 8, tex: fx }, { f: earL, ramp: col, z: 1.9, th: 2 }, { f: earR, ramp: col, z: 1.9, th: 2 }]);
    const g = c.g, K = INK, P = RAMP.pink;
    for (const [x, y] of [[8, 6], [9, 8], [26, 6], [25, 8]]) px(g, x, y, P[3]);
    if (mood === 'angry') { linePx(g, 10, 12, 14, 14, K); linePx(g, 24, 12, 20, 14, K); rect(g, 11, 14, 3, 2, K); rect(g, 20, 14, 3, 2, K); rect(g, 15, 20, 4, 1, K); px(g, 16, 21, '#ffffff'); }
    else if (mood === 'happy') { hline(g, 11, 13, 14, K); px(g, 10, 15, K); px(g, 14, 15, K); hline(g, 21, 23, 14, K); px(g, 20, 15, K); px(g, 24, 15, K); }
    else if (col === RAMP.black) { for (const ex of [11, 20]) { rect(g, ex, 13, 3, 4, '#b9e04a'); vline(g, ex + 1, 13, 16, K); px(g, ex, 13, '#ffffff'); } }
    else { rect(g, 11, 13, 3, 4, K); px(g, 11, 13, '#ffffff'); rect(g, 20, 13, 3, 4, K); px(g, 20, 13, '#ffffff'); }
    hline(g, 16, 18, 18, P[2]); px(g, 17, 19, P[1]);
    if (mood !== 'angry') { px(g, 15, 20, K); px(g, 16, 21, K); px(g, 17, 20, K); px(g, 18, 21, K); px(g, 19, 20, K); }
    for (const s of [-1, 1]) { linePx(g, 17 + s * 4, 19, 17 + s * 11, 18, '#dfe3f1'); linePx(g, 17 + s * 4, 20, 17 + s * 11, 22, '#dfe3f1'); }
    px(g, 9, 18, P[3]); px(g, 10, 18, P[3]); px(g, 24, 18, P[3]); px(g, 25, 18, P[3]);
    return c;
  });
}
function cenizaPuppy(ramp, mood = 'normal') {
  return mdl('cz:pup3:' + ramp[2] + mood, () => {
    const headS = SD.ellipse(17, 14, 11, 9.5), head = SD.shag(headS, .9, .5, 3), body = SD.ellipse(17, 26, 9, 6.5);
    const dark = ramp.map(q => mixHex(q, '#000000', .14));
    const earL = SD.ellipse(6, 15, 3.6, 7, .3), earR = SD.ellipse(28, 15, 3.6, 7, -.3), muzzle = SD.ellipse(17, 19, 5.5, 4);
    const tail = SD.curve([25, 26], [31, 23], [30, 16], 2, 1.3), paws = SD.union(SD.ellipse(12, 32, 3.2, 2), SD.ellipse(22, 32, 3.2, 2));
    const c = model(34, 35, [{ f: tail, ramp, z: 0, th: 2 }, { f: body, ramp, z: 1, th: 6 }, { f: paws, ramp, z: 1.5, th: 2 }, { f: head, fs: headS, ramp, z: 2, th: 9, tex: clumpTex(3, .2, 5, 1.3) }, { f: earL, ramp: dark, z: 2.2, th: 3 }, { f: earR, ramp: dark, z: 2.2, th: 3 }, { f: muzzle, ramp, z: 2.4, th: 3, amb: .45 }]);
    const g = c.g, K = INK, P = RAMP.pink;
    if (mood === 'angry') { linePx(g, 10, 10, 14, 12, K); linePx(g, 24, 10, 20, 12, K); rect(g, 11, 12, 3, 2, K); rect(g, 20, 12, 3, 2, K); }
    else if (mood === 'happy') { hline(g, 11, 13, 12, K); px(g, 10, 13, K); px(g, 14, 13, K); hline(g, 21, 23, 12, K); px(g, 20, 13, K); px(g, 24, 13, K); rect(g, 16, 22, 3, 3, P[2]); px(g, 17, 24, P[1]); }
    else { rect(g, 11, 11, 3, 4, K); px(g, 11, 11, '#ffffff'); rect(g, 20, 11, 3, 4, K); px(g, 20, 11, '#ffffff'); }
    rect(g, 15, 16, 5, 3, K); px(g, 15, 16, '#6e6390'); hline(g, 16, 18, 21, K);
    px(g, 9, 17, P[3]); px(g, 10, 17, P[3]); px(g, 24, 17, P[3]); px(g, 25, 17, P[3]);
    return c;
  });
}
// the sign over each basket: a cat face or a westie face, big and chunky
function cenizaCatFace() {
  return mdl('cz:catFace', () => spr([
    '.k..........k.',
    'kpk........kpk',
    'kppk......kppk',
    'kwwwkkkkkkwwwk',
    'kwwwwwwwwwwwwk',
    'kwkkwwwwwwkkwk',
    'kwkgwwwwwwkgwk',
    'kwwwwwwwwwwwwk',
    'kwrwwwppwwwrwk',
    '.kwwwkwwkwwwk.',
    '..kwwwkkwwwk..',
    '...kkkkkkkk...'], { k: INK, w: '#5f5883', p: RAMP.pink[3], g: '#b9e04a', r: '#8f5cc7' }));
}
function cenizaDogFace() {
  return mdl('cz:dogFace', () => spr([
    '...kkkkkkkk...',
    '..kwwwwwwwwk..',
    '.kbwwwwwwwwbk.',
    'kbbwgkwwgkwbbk',
    'kbbwkkwwkkwbbk',
    'kbbwwwwwwwwbbk',
    'kbbrwwkkwwrbbk',
    '.kbwwwkkwwwbk.',
    '..kwwkwwkwwk..',
    '..kwwwkkwwwk..',
    '...kwwppwwk...',
    '....kkkkkk....'], { k: INK, w: '#f2e2b8', b: '#ab6130', g: '#ffffff', p: RAMP.pink[2], r: RAMP.pink[3] }));
}
function cenizaBasket(c, x, y, kind, t, glow) {
  const cush = kind === 'cat' ? ['#8959c5', '#bf95e9'] : ['#2a9a6a', '#5bd18b'];
  if (glow) cenizaZone(c, x, y - 4, 34, 12, t, cush[1], true);
  ellipsePx(c, x, y + 4, 32, 11, INK); ellipsePx(c, x, y + 3, 31, 10, '#c38a21'); ellipsePx(c, x, y, 26, 7, '#8a5a12');
  for (let i = -28; i <= 28; i += 4) vline(c, x + i, y + 2 + Math.abs(i) * .05, y + 10 - Math.abs(i) * .12, '#e6b33e');
  ellipsePx(c, x, y - 1, 24, 6, cush[0]); ellipsePx(c, x - 3, y - 3, 14, 3, cush[1]);
}
function cenizaBasketSign(c, x, kind, t) {
  const y = 62 + Math.sin(t * 2 + x) * 1.2;
  linePx(c, x - 14, 0, x - 12, y - 16, INK); linePx(c, x + 14, 0, x + 12, y - 16, INK);
  panel(c, x - 22, y - 18, 44, 44, RAMP.wood[3], { r: 5 }); rect(c, x - 19, y - 15, 38, 38, RAMP.wood[4]); rect(c, x - 18, y - 14, 36, 36, '#fff8e6');
  drawS(c, kind === 'cat' ? cenizaCatFace() : cenizaDogFace(), x, y, { s: 2 });
}
function cenizaCestasBg() {
  return mdl('cz:cestasBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, G = RAMP.green;
    subwayTiles(g, 0, 0, SW, 104);
    rect(g, 0, 104, SW, 18, G[2]); rect(g, 0, 104, SW, 2, G[3]); rect(g, 0, 121, SW, 1, G[0]);
    for (let i = 6; i < SW; i += 22) { rect(g, i, 108, 16, 10, G[1]); rect(g, i + 1, 109, 14, 1, G[3]); }
    woodFloor(g, 0, 122, SW, 70);
    // a round rug in the middle where the little ones play
    ellipsePx(g, 128, 150, 52, 16, INK); ellipsePx(g, 128, 149, 51, 15, '#94dcbc'); ellipsePx(g, 128, 149, 44, 11, '#d2f5e4'); ellipsePx(g, 128, 149, 36, 8, '#94dcbc');
    // ball of wool + a bone toy on the floor
    disc(g, 104, 176, 5, INK); disc(g, 104, 176, 4, '#ff93bf'); linePx(g, 101, 174, 107, 178, '#ffd1e4'); linePx(g, 108, 178, 118, 184, '#ff93bf');
    rect(g, 146, 178, 10, 3, '#dcc08a'); for (const [dx, dy] of [[-1, 177], [-1, 181], [11, 177], [11, 181]]) disc(g, 146 + dx, dy, 1.8, '#dcc08a');
    drawS(g, wbSign({ noCrest: true, noTag: true }), 128, 22, {});
    return c;
  });
}
defMG({
  id: 'cestas', stage: 'ceniza', name: 'Cada uno a su cesta', cmd: '¡A SU CESTA!', how: 'Gatitos a la cesta del gato y perritos a la del perro', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .55, n: 'F5 . A5 . C6 . A5 . G5 . E5 . C5 . . . F5 . A5 . C6 . F6 . E6 . C6 . G5 - . .' },
    { i: 'mari', v: .4, n: 'F4 . . . C5 . . . C4 . . . G4 . . . F4 . . . A4 . . . C5 . . . E4 . . .' },
    { i: 'bass', v: .8, n: 'F2 . . . C3 . . . C2 . . . G2 . . . F2 . . . A2 . . . C3 . . . C2 . . .' },
    { i: 'd', v: .55, n: 'k . r . s . r . k . r . s . r r k . r . s . r . k . r r s . s .' }] }),
  init(g) {
    const n = [2, 3, 3][g.level - 1], kinds = cenizaShuffle(g, n === 2 ? ['cat', 'dog'] : ['cat', 'dog', g.r() < .5 ? 'cat' : 'dog']);
    const catCols = [RAMP.orange, RAMP.grey, RAMP.black, RAMP.cream], dogRamps = [RAMP.fur, RAMP.apricot, RAMP.caramel, RAMP.merleBlue];
    g.bask = { cat: { x: 40, y: 168 }, dog: { x: 216, y: 168 } };
    if (g.r() < .5) { g.bask.cat.x = 216; g.bask.dog.x = 40; }
    const sp = [1, 1.3, 2][g.level - 1] * g.tempo;
    g.pets = kinds.map((kind, i) => ({ kind, col: kind === 'cat' ? catCols[i % 4] : dogRamps[i % 4], x: 84 + i * (88 / Math.max(1, n - 1)), row: i % 2, y: i % 2 ? 158 : 124, vx: (g.r() < .5 ? -1 : 1) * g.r(12, 22) * sp, hop: g.r(TAU), in: false, mad: 0, sq: 0, fall: false }));
    g.held = null; g.stampT = -1;
  },
  petImg(p, mood) { return p.kind === 'cat' ? cenizaKitten(p.col, mood) : cenizaPuppy(p.col, mood); },
  update(g, dt) {
    for (const p of g.pets) {
      p.sq = Math.max(0, p.sq - dt * 5); p.mad = Math.max(0, p.mad - dt);
      if (p.in) { const B = g.bask[p.kind]; p.x = lerp(p.x, B.x + (p.slot || 0), .3); p.y = lerp(p.y, B.y - 10, .3); continue; }
      if (p === g.held) continue;
      if (p.fall) { cenizaFall(p, dt, p.row ? 158 : 124); continue; }
      p.hop += dt * 8; p.x += p.vx * dt; if (p.x < 80 || p.x > 176) { p.vx *= -1; p.x = clamp(p.x, 80, 176); }
      for (const q of g.pets) if (q !== p && !q.in && q !== g.held && q.row === p.row && Math.abs(q.x - p.x) < 34 && sgn(q.x - p.x) === sgn(p.vx)) p.vx *= -1;
    }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.pets, 20, p => !p.in); if (g.held) { g.held.fall = false; sfx(g.held.kind === 'cat' ? 'czMeow' : 'yip', { pitch: 1.4, vol: .6 }); } }
    if (g.held) {
      const p = g.held; cenizaFollow(p, dt);
      if (IN.rel || !IN.down) {
        g.held = null;
        const into = ['cat', 'dog'].find(k => dist(p.x, p.y, g.bask[k].x, g.bask[k].y - 8) < 38);
        if (into === p.kind) {
          p.in = true; p.slot = (g.pets.filter(q => q.in && q.kind === p.kind).length - 1) * 14 - 7; p.sq = 1; sfx('pop', { pitch: 1.2 }); sfx(p.kind === 'cat' ? 'czMeow' : 'bark', { pitch: 1.3, delay: .05 }); HITSTOP = 2; buzz(8);
          g.fx.burst(p.x, p.y, 10, { k: 'heart', c: '#ff93bf', sp0: 20, sp1: 60, g: -30, life0: .5, life1: .9 });
          if (g.pets.every(q => q.in)) { g.win(); g.stampT = g.t; }
        } else if (into) {
          p.mad = 1; p.fall = true; p.vy = -220; p.vx = (p.x < 128 ? 1 : -1) * 90; sfx(p.kind === 'cat' ? 'czMeow' : 'bark', { pitch: .8 }); g.shake(2, .15);
          g.fx.add({ k: 'txt', s: p.kind === 'cat' ? '¡Fff! ¡Esa no!' : '¡Grr! ¡Esa no!', x: p.x, y: p.y - 22, life: .8, c: '#ffd1e4' });
        } else { p.fall = true; p.vy = -40; }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaCestasBg(), 0, 0);
    for (const k of ['cat', 'dog']) { cenizaBasketSign(c, g.bask[k].x, k, g.t); cenizaBasket(c, g.bask[k].x, g.bask[k].y, k, g.t, !!g.held && g.held.kind === k); }
    if (g.held && g.state === 'play') { const B = g.bask[g.held.kind]; cenizaArrow(c, B.x, B.y - 14, g.t, g.held.kind === 'cat' ? '#bf95e9' : '#5bd18b'); }
    const order = g.pets.slice().sort((a, q) => (a === g.held) - (q === g.held) || a.y - q.y);
    for (const p of order) {
      const held = p === g.held, img = this.petImg(p, p.mad > 0 ? 'angry' : p.in ? 'happy' : 'normal');
      const o = { s: 1 + p.sq * .2 + (held ? .1 : 0), rot: held ? Math.sin(g.t * 12) * .15 : 0 }, y = p.y - (p.in || held ? 0 : Math.abs(Math.sin(p.hop)) * 3);
      if (!p.in && !held) { shadowOval(c, p.x, p.y + 15, 11, 2.5, .3); if (!g.held && g.state === 'play') cenizaHalo(c, img, p.x, y, g.t + p.hop * .1, '#ffffff', o); }
      drawS(c, img, p.x, y, o);
    }
    if (g.state === 'won') cenizaStamp(c, '¡A DORMIR!', 128, 100, g.t - g.stampT, CENIZA_LILAC_FILL);
  },
  hint(g) { const p = g.pets.find(q => !q.in); if (!p) return null; const B = g.bask[p.kind]; return { x: p.x, y: p.y, to: [B.x, B.y - 10] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    if (!g.held) {
      const p = g.pets.find(q => !q.in && !q.fall);
      if (!p) { b.down = false; return b; }
      if (b.down && dist(b.x, b.y, p.x, p.y) > 8) { b.down = false; return b; }
      cenizaBotGrab(b, p.x + p.vx * .05, p.y); return b;
    }
    const B = g.bask[g.held.kind]; if (cenizaBotMove(b, B.x, B.y - 10, 5.5)) { b.down = false; b.wait = .12 / b.k; }
    return b;
  },
});

// ---------------------------------------------------------------- 8 BOTE (new)
// Pato the imp is loose in the storeroom: drag the glass jar over him and
// let go — the lid slams shut. At level 3 plain rubber ducks muddle the air.
function cenizaDuck() {
  return mdl('cz:duck', () => {
    const Y = RAMP.yellow, O = RAMP.orange;
    const body = SD.smooth(2, SD.ellipse(14, 21, 11, 8), SD.poly([[2, 13], [7, 18], [4, 22]])), head = SD.circle(20, 11, 6.8);
    const beak = SD.smooth(1, SD.ellipse(28, 13, 4.6, 2.2), SD.ellipse(27, 15, 3.6, 1.6)), wing = SD.ellipse(12, 20, 5.5, 3.6, -.3);
    const c = model(34, 32, [{ f: body, ramp: Y, z: 1, th: 8 }, { f: head, ramp: Y, z: 2, th: 6 }, { f: wing, ramp: Y.map(q => mixHex(q, '#c08a10', .35)), z: 2.5, th: 3 }, { f: beak, ramp: O, z: 3, th: 2 }]);
    const g = c.g; rect(g, 21, 9, 3, 3, INK); px(g, 21, 9, '#ffffff'); px(g, 18, 13, RAMP.pink[3]); px(g, 19, 13, RAMP.pink[3]);
    return c;
  });
}
function cenizaJarGlass() {
  return mdl('cz:jarGlass', () => {
    const c = mkCanvas(50, 56), g = c.g;
    // a big glass jar, mouth up: ink rim, faint blue body, bright highlights
    rect(g, 3, 11, 44, 42, INK); rect(g, 5, 9, 40, 2, INK); rect(g, 5, 53, 40, 2, INK);
    g.globalCompositeOperation = 'destination-out'; rect(g, 5, 12, 40, 40, '#000'); g.globalCompositeOperation = 'source-over';
    g.globalAlpha = .3; rect(g, 5, 12, 40, 40, '#bfe3f2'); g.globalAlpha = 1;
    for (let y = 15; y < 48; y++) { px(g, 8, y, '#ffffff'); if (y % 4) px(g, 10, y, '#ffffff'); }
    for (let y = 18; y < 44; y += 2) px(g, 41, y, '#e8f8ff');
    // neck rim
    rect(g, 6, 4, 38, 7, INK); rect(g, 7, 5, 36, 5, '#e1e7f2'); rect(g, 7, 5, 36, 1, '#ffffff'); rect(g, 7, 9, 36, 1, '#a5afc4');
    // label
    rect(g, 11, 38, 28, 12, INK); rect(g, 12, 39, 26, 10, '#fff4dc'); tiny(g, 'PATO', 25, 41, '#c02d45', { align: 'c' });
    return c;
  });
}
function cenizaJarLid() {
  return mdl('cz:jarLid', () => {
    const c = mkCanvas(44, 10), g = c.g, G = RAMP.gold;
    rect(g, 1, 2, 42, 8, INK); rect(g, 2, 3, 40, 6, G[3]); rect(g, 2, 3, 40, 1, G[4]); rect(g, 2, 8, 40, 1, G[1]);
    for (let x = 5; x < 40; x += 4) vline(g, x, 4, 7, G[2]);
    rect(g, 18, 0, 8, 3, INK); rect(g, 19, 1, 6, 1, G[4]);
    return c;
  });
}
function cenizaStoreBg() {
  return mdl('cz:storeBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    cenizaDenWall(g);
    for (const sy of [52, 104]) { rect(g, 4, sy, 248, 4, RAMP.wood[3]); rect(g, 4, sy, 248, 1, RAMP.wood[4]); rect(g, 4, sy + 4, 248, 1, INK); for (const bx of [14, 128, 242]) polyPx(g, [[bx - 3, sy + 5], [bx + 3, sy + 5], [bx, sy + 12]], RAMP.wood[1]); }
    const cols = ['#5bd18b', '#ff93bf', '#63a0ef', '#e2b21b', '#bf95e9', '#4fc6c2'];
    for (let i = 0; i < 11; i++) { const x = 12 + i * 22, h = 12 + (i * 7 % 3) * 3; cenizaJar(g, x, 52 - h, 9, h, cols[i % 6]); }
    for (let i = 0; i < 9; i++) { const x = 16 + i * 27, h = 14 + (i % 2) * 5, col = cols[(i + 3) % 6]; rect(g, x - 5, 104 - h, 11, h, INK); rect(g, x - 4, 105 - h, 9, h - 1, col); rect(g, x - 2, 100 - h, 5, 5, INK); rect(g, x - 1, 101 - h, 3, 4, '#ffffff'); rect(g, x - 3, 108 - h, 2, h - 8, '#ffffff'); }
    // crates on the floor
    for (const [x, w] of [[196, 40], [206, 26]]) { const y = x === 196 ? 160 : 136; rect(g, x, y, w, 24, INK); rect(g, x + 1, y + 1, w - 2, 22, RAMP.wood[2]); rect(g, x + 1, y + 1, w - 2, 1, RAMP.wood[4]); linePx(g, x + 2, y + 2, x + w - 3, y + 21, RAMP.wood[1]); }
    return c;
  });
}
defMG({
  id: 'bote', stage: 'ceniza', name: 'Pato al bote', cmd: '¡AL BOTE!', how: 'Pon el bote encima de Pato (el de los cuernos) y suéltalo', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D6 D6 C#6 D6 E6 D6 C#6 A5 Bb5 Bb5 A5 Bb5 C#6 Bb5 A5 F5 G5 G5 F5 G5 A5 G5 F5 E5 F5 E5 D5 C#5 D5 - . .' },
    { i: 'organ', v: .3, n: 'D4+F4+A4 - - - - - - - G3+Bb3+D4 - - - - - - - E4+G4+Bb4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .9, n: 'D2 D3 D2 D3 D2 D3 D2 D3 G2 G3 G2 G3 G2 G3 G2 G3 C3 C4 C3 C4 C3 C4 C3 C4 A2 A3 A2 A3 A2 C#3 E3 A2' },
    { i: 'd', v: .75, n: 'k h s h k h s h k h s h k h s s k h s h k h s h k h s h s s s s' }] }),
  init(g) {
    g.jar = { x: 60, y: 150, rot: 0, sq: 0, wob: 0 }; g.held = false; g.trapped = false; g.grabbed = false; g.lidT = -1;
    // Pato speeds up with the beat, but not as much as the clock: your hand doesn't get faster
    const sp = [40, 60, 70][g.level - 1] * (.55 + .45 * g.tempo);
    g.pato = { x: 150, y: 96, vx: sp, vy: sp * .6, mood: 'grin', flip: false, dodgeT: 0 };
    g.decoys = g.level >= 3 ? [{ x: 100, y: 76, vx: -sp * .8, vy: sp * .5 }, { x: 208, y: 120, vx: sp * .7, vy: -sp * .6 }] : [];
    g.stampT = -1; g.missT = 0;
  },
  moveFlyer(f, dt) {
    f.x += f.vx * dt; f.y += f.vy * dt;
    if (f.x < 30 || f.x > 226) { f.vx *= -1; f.x = clamp(f.x, 30, 226); }
    if (f.y < 40 || f.y > 146) { f.vy *= -1; f.y = clamp(f.y, 40, 146); }
  },
  update(g, dt) {
    const J = g.jar, Pt = g.pato; g.missT = Math.max(0, g.missT - dt); J.sq = Math.max(0, J.sq - dt * 4); J.wob = Math.max(0, J.wob - dt * 2);
    if (!g.trapped) {
      this.moveFlyer(Pt, dt); Pt.flip = Pt.vx < 0; Pt.dodgeT = Math.max(0, Pt.dodgeT - dt);
      if (Pt.dodgeT <= 0 && g.missT <= 0) Pt.mood = 'grin';
      // from level 2 he darts away when the jar comes near
      if (g.level >= 2 && g.held && Pt.dodgeT <= 0 && dist(J.x, J.y, Pt.x, Pt.y) < 40 && g.r() < dt * 2.4) {
        const a = Math.atan2(Pt.y - J.y, Pt.x - J.x), s = Math.hypot(Pt.vx, Pt.vy) * 1.1; Pt.vx = Math.cos(a) * s; Pt.vy = Math.sin(a) * s; Pt.mood = 'laugh'; Pt.dodgeT = .9; sfx('czQuack', { pitch: 1.3, vol: .5 });
      }
      for (const d of g.decoys) this.moveFlyer(d, dt);
    } else { Pt.x = lerp(Pt.x, J.x, .3); Pt.y = lerp(Pt.y, J.y - 4, .3); }
    if (g.state !== 'play') { g.held = false; return; }
    if (!g.held && IN.tap && dist(IN.x, IN.y, J.x, J.y) < 30) { g.held = true; g.grabbed = true; J.sq = 1; sfx('pop', { pitch: .7 }); }
    if (g.held) {
      J.x = lerp(J.x, clamp(IN.x, 26, 230), .5); J.y = lerp(J.y, clamp(IN.y, 34, 160), .5); J.rot = clamp(IN.vx / 900, -.4, .4);
      if (IN.rel || !IN.down) {
        g.held = false; J.rot = 0; sfx('swoosh', { pitch: 1.3 });
        if (dist(J.x, J.y, Pt.x, Pt.y) < 24) {
          g.trapped = true; g.lidT = g.t; g.win(); g.stampT = g.t; Pt.mood = 'shock'; sfx('stamp'); sfx('czQuack', { pitch: 1.2, delay: .08 }); HITSTOP = 4; g.shake(2, .15); buzz(15);
          g.fx.burst(J.x, J.y - 24, 16, { k: 'star', c: ['#fff27a', '#ffffff', '#c8f05a'], sp0: 40, sp1: 140 });
        } else {
          const d = g.decoys.find(d => dist(J.x, J.y, d.x, d.y) < 24);
          g.missT = 1; J.wob = 1; Pt.mood = 'laugh'; sfx('czQuack', { pitch: .8 }); buzz(20);
          g.fx.add({ k: 'txt', s: d ? '¡Ese no tiene cuernos!' : '¡Fallaste!', x: clamp(J.x, 60, 196), y: J.y - 40, life: .8, c: '#ffd1e4' });
        }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaStoreBg(), 0, 0);
    for (const d of g.decoys) drawS(c, cenizaDuck(), d.x, d.y, { flip: d.vx < 0 });
    const Pt = g.pato, J = g.jar, glass = cenizaJarGlass();
    const jo = { rot: J.rot + Math.sin(g.t * 30) * J.wob * .15, sx: 1 + J.sq * .12, sy: 1 - J.sq * .1 };
    if (!g.trapped) {
      // where the jar goes: a lime bead ring around Pato
      if (g.state === 'play') cenizaZone(c, Pt.x, Pt.y + 2, 21, 19, g.t, '#c8f05a', g.held);
      cenizaPato(c, Pt.x, Pt.y, Pt.mood, g.t, { flip: Pt.flip });
      shadowOval(c, J.x, 184, 18, 3, .3);
      if (!g.held && g.state === 'play') cenizaHalo(c, glass, J.x, J.y, g.t, g.grabbed ? '#c8f05a' : '#ffffff', jo);
      drawS(c, glass, J.x, J.y, jo);
    } else {
      // Pato inside the glass, lid slammed shut
      shadowOval(c, J.x, 184, 18, 3, .3);
      cenizaPato(c, J.x, J.y - 4, Pt.mood, g.t * 3, { flip: Pt.flip, s: .9, rot: Math.sin(g.t * 20) * .15 });
      drawS(c, glass, J.x, J.y, jo);
      // the lid drops from above and slams shut
      const k = clamp((g.t - g.lidT) / .14, 0, 1), sq = g.t - g.lidT < .3 ? Math.sin((g.t - g.lidT - .14) / .16 * Math.PI) * .2 * (k >= 1) : 0;
      drawS(c, cenizaJarLid(), J.x, lerp(J.y - 70, J.y - 27, E.inQ(k)), { sx: 1 + sq, sy: 1 - sq });
      for (let i = 0; i < 3; i++) { const a = g.t * 6 + i * TAU / 3; drawStar(c, J.x + Math.cos(a) * 20, J.y - 44 + Math.sin(a) * 4, 2.4, '#fff27a'); }
    }
    if (g.state === 'won') cenizaStamp(c, '¡PILLADO!', 128, 24, g.t - g.stampT, CENIZA_WIN_FILL);
  },
  hint(g) { return { x: g.jar.x, y: g.jar.y, to: [g.pato.x, g.pato.y] }; },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!cenizaBotReady(b)) return b;
    const J = g.jar, Pt = g.pato;
    if (!g.held) { if (b.down && dist(b.x, b.y, J.x, J.y) > 10) { b.down = false; return b; } cenizaBotGrab(b, J.x, J.y); return b; }
    // chase Pato (a hair ahead of him) and let go as soon as the jar is over him
    cenizaBotMove(b, Pt.x + Pt.vx * .08, Pt.y + Pt.vy * .08, 6);
    if (dist(J.x, J.y, Pt.x, Pt.y) < 13) { b.down = false; b.wait = .2 / b.k; }
    return b;
  },
});

// the three new games join Ceniza's stage (the stage file lists the originals)
(() => {
  const d = STAGES.ceniza, add = ['escoba', 'cestas', 'bote'];
  if (!d) return;
  if (Array.isArray(d.games)) { for (const id of add) if (!d.games.includes(id)) d.games.push(id); }
  else if (typeof d.games === 'function') { const f = d.games; d.games = () => { const l = f(); return l.concat(add.filter(id => !l.includes(id))); }; }
})();
