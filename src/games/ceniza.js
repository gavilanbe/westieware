// ============================================================================
//  Microgames of CENIZA's stage (¡ARRASTRA!) — drag, drop, hook.
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
  it.ox *= .9; it.oy *= .9;
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
// a bot finger that walks towards points and presses
function cenizaBot(g) { return g._bot || (g._bot = { x: 128, y: 96, down: false }); }
function cenizaBotMove(b, tx, ty, sp = 8) { const d = dist(b.x, b.y, tx, ty); if (d <= sp) { b.x = tx; b.y = ty; return true; } b.x += (tx - b.x) / d * sp; b.y += (ty - b.y) / d * sp; return false; }
function cenizaShuffle(g, a) { for (let i = a.length - 1; i > 0; i--) { const j = fl(g.rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// "¡PUAJ!" skull smoke
function cenizaPuaj(g, x, y) {
  sfx('czPuaj'); g.shake(3, .25); buzz([30, 30, 30]);
  for (let i = 0; i < 16; i++) g.fx.add({ k: 'puff', x: x + g.r(-14, 14), y: y + g.r(-6, 6), vx: g.r(-30, 30), vy: g.r(-70, -20), drag: 1.5, r: g.r(4, 9), life: g.r(.5, 1), c: pick(['#3d3a4a', '#26242e', '#44424f']) });
  g.fx.add({ k: 'txt', s: '¡PUAJ!', x, y: y - 26, life: .9, c: '#c8f05a' });
}
function cenizaSparkle(g, x, y, col = '#fff27a') {
  sfx('czMagic'); HITSTOP = 3; buzz(8);
  g.fx.burst(x, y, 14, { k: 'star', c: [col, '#ffffff', '#ffd1e4'], sp0: 40, sp1: 140, life0: .3, life1: .7 });
  g.fx.add({ k: 'ring', x, y, r: 6, grow: 22, life: .35, c: '#ffffff' });
}
function cenizaDenWall(g) { cenizaStoneWall(g, 0, 0, SW, 150); rect(g, 0, 150, SW, 42, RAMP.wood[1]); for (let j = 150; j < SH; j += 7) { rect(g, 0, j, SW, 1, RAMP.wood[0]); rect(g, 0, j + 1, SW, 1, RAMP.wood[2]); } }

// ---------------------------------------------------------------- 1 POCIÓN --
function cenizaPocionBg() {
  return mdl('cenizaPocionBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    cenizaDenWall(g);
    // shelf with brackets
    rect(g, 10, 44, 236, 5, RAMP.wood[3]); rect(g, 10, 44, 236, 1, RAMP.wood[4]); rect(g, 10, 49, 236, 1, INK);
    for (const bx of [22, 128, 234]) { polyPx(g, [[bx - 3, 49], [bx + 3, 49], [bx, 58]], RAMP.wood[1]); }
    // hanging herbs + a candle
    for (const hx of [40, 216]) { vline(g, hx, 0, 8, RAMP.wood[1]); for (let i = 0; i < 5; i++) { linePx(g, hx, 8, hx - 3 + i * 1.5, 18, '#5bb593'); px(g, hx - 3 + i * 1.5, 18, '#bf95e9'); } }
    return c;
  });
}
defMG({
  id: 'pocion', stage: 'ceniza', name: 'Pócima exprés', cmd: '¡ECHA!', how: 'Echa en el caldero solo lo que pide la receta (¡arriba!)', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .6, n: 'D5 - - A4 . D5 . E5 F5 - - E5 . D5 . C#5 D5 - - A4 . F5 . E5 D5 - . C#5 - . . .' },
    { i: 'organ', v: .35, n: 'D4+F4+A4 - - - - - - - - - - - - - - - A3+C#4+E4 - - - - - - - - - - - - - - -' },
    { i: 'bass', v: .85, n: 'D3 . . D3 . . A2 . D3 . . D3 . . A2 . A2 . . A2 . . E2 . A2 . . C#3 . . . .' },
    { i: 'd', v: .7, n: 'k . . k . . s . k . . k . . s . k . . k . . s . k . k . s s s .' }] }),
  init(g) {
    const need = [1, 2, 3][g.level - 1];
    const good = cenizaShuffle(g, CENIZA_ING_GOOD.slice()), bad = cenizaShuffle(g, CENIZA_ING_BAD.slice());
    g.recipe = good.slice(0, need);
    const extra = g.level === 1 ? bad.slice(0, 2) : g.level === 2 ? bad.slice(0, 2) : bad.slice(0, 1).concat(good.slice(need, need + 1));
    const ids = cenizaShuffle(g, g.recipe.concat(extra));
    const n = ids.length, sp = 216 / n;
    g.items = ids.map((id, i) => ({ id, x: 20 + sp * (i + .5), y: 29, hx: 20 + sp * (i + .5), hy: 29, rot: 0, fall: false, in: false, sq: 0, wob: g.r(TAU) }));
    g.done = []; g.held = null; g.potCol = '#5bd18b'; g.flash = 0; g.pot = { x: 128, y: 126 };
  },
  update(g, dt) {
    g.flash = Math.max(0, g.flash - dt * 3);
    for (const it of g.items) { it.sq = Math.max(0, it.sq - dt * 5); it.wob += dt * 3; if (it.sink != null) { it.sink += dt * 4; } else if (it.fall) cenizaFall(it, dt, 172); }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) g.held = cenizaGrab(g, g.items, 17, it => !it.in && it.sink == null);
    if (g.held) {
      const it = g.held; cenizaFollow(it, dt);
      if (IN.rel || !IN.down) {
        g.held = null;
        if (dist(it.x, it.y, g.pot.x, g.pot.y) < 34 && it.y < 150) {
          it.in = true; it.sink = 0; it.x = lerp(it.x, g.pot.x, .5);
          sfx('splash', { pitch: 1.3, vol: .6 }); g.fx.burst(g.pot.x, g.pot.y - 4, 10, { k: 'drop', c: [g.potCol, '#ffffff'], sp0: 40, sp1: 120, g: 320, life0: .3, life1: .6 });
          if (g.recipe.includes(it.id) && !g.done.includes(it.id)) {
            g.done.push(it.id); g.flash = 1; g.potCol = ['#5bd18b', '#4fc6c2', '#bf95e9', '#ff93bf'][g.done.length];
            cenizaSparkle(g, g.pot.x, g.pot.y - 10, '#c8f05a'); g.fx.add({ k: 'txt', s: '¡BIEN!', x: g.pot.x, y: g.pot.y - 34, life: .6, c: '#ffffff' });
            if (g.done.length >= g.recipe.length) { g.win(); for (let i = 0; i < 8; i++) g.fx.add({ k: 'heart', x: g.pot.x + g.r(-30, 30), y: g.pot.y - 10, vx: g.r(-30, 30), vy: g.r(-90, -40), life: 1, c: '#ff93bf' }); }
          } else { g.potCol = '#5b5a66'; cenizaPuaj(g, g.pot.x, g.pot.y - 10); g.lose(); }
        } else { it.fall = true; it.vy = 0; it.vx = IN.vx * .3; }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaPocionBg(), 0, 0);
    // cauldron + fire + brew
    const cs = cenizaCauldron(1.5), P = g.pot;
    cenizaFire(c, P.x, 180, g.t, 1.3);
    c.drawImage(cs, rd(P.x - cs.width / 2), rd(P.y - 18));
    cenizaPotion(c, P.x, P.y, 36, 7, g.potCol, g.t, { boil: g.flash > 0 || g.state === 'won' });
    if (g.flash > 0) { c.globalAlpha = g.flash * .6; ellipsePx(c, P.x, P.y, 38, 8, '#ffffff'); c.globalAlpha = 1; }
    for (let i = 0; i < 3; i++) { const ph = (g.t * .7 + i * .33) % 1; c.globalAlpha = (1 - ph) * .4; disc(c, P.x - 14 + i * 14 + Math.sin(g.t * 2 + i) * 4, P.y - 12 - ph * 50, 4 + ph * 5, g.state === 'lost' ? '#44424f' : '#dfe3f1'); } c.globalAlpha = 1;
    // items
    for (const it of g.items) {
      if (it.sink != null) { if (it.sink < 1) drawS(c, cenizaIngIcon(it.id), it.x, P.y - 4 + it.sink * 8, { s: 1 - it.sink, rot: it.sink * 3 }); continue; }
      const held = it === g.held, bob = !held && !it.fall && it.y < 36 ? Math.sin(it.wob) * .8 : 0;
      if (held) shadowOval(c, it.x, Math.min(176, it.y + 30), 7, 2, .3);
      drawS(c, cenizaIngIcon(it.id), it.x, it.y + bob, { rot: it.rot, s: 1 + it.sq * .25 + (held ? .15 : 0) });
    }
    if (g.state === 'won') mord(c, '¡OLÉ!', P.x, 64 - Math.min(1, g.t - g.decidedAt) * 8, { u: 1.5, r: 1.7, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] });
  },
  // the recipe card, on the top screen
  top(g, c) {
    const n = g.recipe.length, w = 30 + n * 50, x0 = SW / 2 - w / 2;
    panel(c, x0, 44, w, 76, '#fff4dc', { r: 6, line: INK, lo: '#dcc08a' });
    rect(c, x0 + 3, 44, w - 6, 2, '#f2e2b8'); disc(c, x0, 82, 6, '#dcc08a'); disc(c, x0 + w, 82, 6, '#dcc08a');
    txt(c, 'RECETA', SW / 2, 50, '#5a1f2a', { align: 'c', bold: true });
    g.recipe.forEach((id, i) => {
      const x = x0 + 40 + i * 50, done = g.done.includes(id), bob = done ? 0 : Math.sin(g.t * 6 + i) * 1.5;
      drawS(c, cenizaIngIcon(id, 1.5), x, 78 + bob, {});
      txt(c, CENIZA_ING[id].name, x, 98, INK, { align: 'c' });
      if (done) { disc(c, x + 10, 72, 6, INK); disc(c, x + 10, 72, 5, '#5bd18b'); txt(c, '✓', x + 10, 69, '#ffffff', { align: 'c', bold: true }); }
      if (i < n - 1) txt(c, '+', x + 25, 78, '#5a1f2a', { align: 'c', bold: true });
    });
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!g.held) {
      const it = g.items.find(it => g.recipe.includes(it.id) && !g.done.includes(it.id) && !it.in && !it.fall);
      if (!it || b.down) { b.down = false; return b; }
      b.x = it.x; b.y = it.y; b.down = true; return b;
    }
    if (cenizaBotMove(b, g.pot.x, g.pot.y - 6, 9)) b.down = false;
    return b;
  },
});

// ---------------------------------------------------------------- 2 ESTANTE -
function cenizaBagSpr(w, h, ci) { return mdl('cz:bag' + w + 'x' + h + ci, () => { const c = mkCanvas(w + 2, h + 2); foodBag(c.g, 1, 1, w, h, ci); return c; }); }
function cenizaEstanteBg() {
  return mdl('cz:estanteBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g, Wd = RAMP.wood;
    subwayTiles(g, 0, 0, SW, 152);
    rect(g, 0, 150, SW, 42, Wd[2]); for (let j = 152; j < SH; j += 6) { rect(g, 0, j, SW, 1, Wd[1]); rect(g, 0, j + 1, SW, 1, Wd[3]); }
    // the shelf unit: top board, two shelves
    rect(g, 26, 44, 204, 108, INK); rect(g, 27, 45, 202, 106, Wd[1]); rect(g, 30, 48, 196, 100, '#4a2e18');
    for (const sy of [98, 148]) { rect(g, 27, sy - 4, 202, 5, Wd[3]); rect(g, 27, sy - 4, 202, 1, Wd[4]); rect(g, 27, sy + 1, 202, 1, INK); }
    rect(g, 22, 38, 212, 7, INK); rect(g, 23, 39, 210, 5, Wd[3]); rect(g, 23, 39, 210, 1, Wd[4]);
    // a price card and a paw sticker on the side
    panel(g, 234, 70, 18, 12, '#fff8e6', { r: 2 }); tiny(g, '9€', 243, 73, INK, { align: 'c' });
    return c;
  });
}
defMG({
  id: 'estante', stage: 'ceniza', name: 'Estantería gatuna', cmd: '¡COLOCA!', how: 'Devuelve cada saco a su hueco (Ceniza los tira)', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'mari', v: .6, n: 'A5 . G5 . F5 . E5 . D5 . E5 . F5 - . . G5 . F5 . E5 . D5 . C#5 . D5 . E5 - . .' },
    { i: 'pluck', v: .35, n: 'D4 . A4 . D4 . A4 . Bb3 . F4 . Bb3 . F4 . A3 . E4 . A3 . E4 . A3 . C#4 . E4 . A4 .' },
    { i: 'bass', v: .8, n: 'D3 . . . . . . . Bb2 . . . . . . . A2 . . . . . . . A2 . . . C#3 . . .' },
    { i: 'd', v: .6, n: 'k . w . s . w w k . w . s . w . k . w . s . w w k . w w s s s .' }] }),
  init(g) {
    // three shelves, packed with bags; some gaps are the slots
    g.rows = [94, 144]; g.fixed = []; const spots = [];
    const nBags = g.level === 1 ? 1 : 2;
    const slotSpots = cenizaShuffle(g, [[0, 1], [1, 3], [0, 4], [1, 0], [0, 5], [1, 5]]).slice(0, 3);
    for (let r = 0; r < 2; r++) {
      let x = 34;
      for (let i = 0; i < 7; i++) {
        const w = 18 + fl(hash2(i, r + 3) * 8), h = 28 + fl(hash2(r, i + 5) * 12), ci = fl(hash2(i + 9, r) * 6);
        const slot = { x: x + w / 2, y: g.rows[r] - 4 - h / 2, w, h, ci, r }, k = slotSpots.findIndex(q => q[0] === r && q[1] === i);
        if (k >= 0) spots[k] = slot; else g.fixed.push(slot);
        x += w + 3;
      }
    }
    g.slots = []; g.bags = [];
    for (let i = 0; i < 3; i++) {
      const s = spots[i];
      if (i < nBags) { g.slots.push(s); g.bags.push({ slot: s, w: s.w, h: s.h, ci: s.ci, x: 40 + i * 70 + g.r(0, 30), y: 176, rot: (i % 2 ? .7 : -.7) + g.r(-.2, .2), fall: false, placed: false, sq: 0 }); }
      else if (g.level >= 3 && i === 2) { g.slots.push(s); g.bags.push({ slot: s, w: s.w, h: s.h, ci: s.ci, x: s.x, y: s.y, rot: 0, fall: false, placed: true, sq: 0, knock: true }); }
      else g.fixed.push(s);
    }
    g.held = null; g.cat = { knockAt: g.level >= 3 ? 1.2 : 99, done: g.level < 3, paw: 0 };
  },
  update(g, dt) {
    for (const b of g.bags) { b.sq = Math.max(0, b.sq - dt * 5); if (b.fall) cenizaFall(b, dt, 176); if (b.snap) { b.x = lerp(b.x, b.slot.x, .4); b.y = lerp(b.y, b.slot.y, .4); b.rot = lerp(b.rot, 0, .4); } }
    const cat = g.cat; cat.paw = Math.max(0, cat.paw - dt * 3);
    // L3: Ceniza paws one more bag off the shelf
    if (!cat.done && g.b >= cat.knockAt && g.state === 'play') {
      cat.done = true; cat.paw = 1; const b = g.bags.find(b => b.knock); if (b) { b.placed = false; b.snap = false; b.fall = true; b.vx = g.r(-80, 80); b.vy = -120; b.rot = .4; sfx('czMeow', { pitch: 1.2 }); g.fx.add({ k: 'txt', s: '¡Miau!', x: 128, y: 14, life: .7, c: '#e5d3fa' }); }
    }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.bags, 22, b => !b.placed); if (g.held) { g.held.fall = false; g.held.vy = 0; } }
    if (g.held) {
      const b = g.held; cenizaFollow(b, dt);
      if (IN.rel || !IN.down) {
        g.held = null;
        const s = b.slot;
        if (Math.abs(b.x - s.x) < 16 && Math.abs(b.y - s.y) < 18) {
          b.placed = true; b.snap = true; b.sq = 1; sfx('stamp'); sfx('coin', { delay: .05 }); HITSTOP = 3; buzz(10);
          g.fx.burst(s.x, s.y + s.h / 2, 8, { k: 'puff', c: ['#dcc08a', '#fff4dc'], sp0: 20, sp1: 60, r: 3, life0: .3, life1: .5 });
          g.fx.burst(s.x, s.y, 8, { k: 'star', c: ['#fff27a', '#ffffff'] });
          if (g.cat.done && g.bags.every(q => q.placed)) { g.win(); g.fx.add({ k: 'txt', s: '¡PERFECTO!', x: 128, y: 40, life: .9, c: '#ffffff' }); }
        } else {
          // near a wrong gap? a little bump; otherwise it drops
          const wrong = g.slots.find(o => o !== s && Math.abs(b.x - o.x) < 16 && Math.abs(b.y - o.y) < 18);
          if (wrong) { sfx('buzz', { vol: .4 }); g.fx.add({ k: 'txt', s: '¡Ahí no!', x: b.x, y: b.y - 24, life: .6, c: '#ffd1e4' }); }
          b.fall = true; b.vy = -60; b.vx = IN.vx * .25;
        }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaEstanteBg(), 0, 0);
    for (const f of g.fixed) foodBag(c, rd(f.x - f.w / 2), rd(f.y - f.h / 2), f.w, f.h, f.ci);
    // the empty slots: a glowing dashed outline in the bag's colour + a bobbing arrow
    for (const s of g.slots) {
      const b = g.bags.find(q => q.slot === s); if (b && b.placed) continue;
      const cols = BAG_COLS[s.ci % BAG_COLS.length], x0 = rd(s.x - s.w / 2), y0 = rd(s.y - s.h / 2);
      c.globalAlpha = .35 + Math.sin(g.t * 6) * .12; rect(c, x0 + 1, y0 + 1, s.w - 2, s.h - 2, cols[1]); c.globalAlpha = 1;
      for (let i = 0; i < s.w; i += 2) { const on = fl(i / 2 + g.t * 8) % 2; px(c, x0 + i, y0, on ? '#ffffff' : cols[0]); px(c, x0 + i, y0 + s.h - 1, on ? '#ffffff' : cols[0]); }
      for (let i = 0; i < s.h; i += 2) { const on = fl(i / 2 + g.t * 8) % 2; px(c, x0, y0 + i, on ? '#ffffff' : cols[0]); px(c, x0 + s.w - 1, y0 + i, on ? '#ffffff' : cols[0]); }
      if (!b || !b.knock || !b.placed) { const ay = y0 - 7 - Math.abs(Math.sin(g.t * 6)) * 4; polyPx(c, [[s.x - 5, ay], [s.x + 5, ay], [s.x, ay + 5]], INK); polyPx(c, [[s.x - 3.5, ay + .5], [s.x + 3.5, ay + .5], [s.x, ay + 4]], cols[1]); }
    }
    // Ceniza lying on top of the unit (she did it), paws hanging over the edge
    const cat = g.cat, catPose = g.state === 'won' ? 'wow' : cat.paw > 0 ? 'angry' : 'smug';
    c.save(); c.beginPath(); c.rect(0, 0, SW, 40); c.clip(); c.drawImage(cenizaBody(catPose), 146, -17); c.restore();
    const pawL = [166, 42], pawR = [190, 42];
    if (cat.paw > 0) { const kb = g.bags.find(q => q.knock); const tx = kb ? kb.slot.x : 190, ty = kb ? kb.slot.y : 70; const k = Math.sin(cat.paw * Math.PI); thickLine(c, pawR[0], pawR[1], lerp(pawR[0], tx, k), lerp(pawR[1], ty, k), 3.4, INK); thickLine(c, pawR[0], pawR[1], lerp(pawR[0], tx, k), lerp(pawR[1], ty, k), 2.4, RAMP.black[2]); }
    for (const [x, y] of [pawL, pawR]) { ellipsePx(c, x, y + 1, 4.5, 3.5, INK); ellipsePx(c, x, y, 3.6, 2.6, RAMP.black[2]); px(c, x - 1, y - 1, RAMP.black[3]); }
    for (const b of g.bags) {
      if (b === g.held) shadowOval(c, b.x, 180, b.w * .5, 2, .3);
      drawS(c, cenizaBagSpr(b.w, b.h, b.ci), b.x, b.y, { rot: b.rot, sx: 1 + b.sq * .2, sy: 1 - b.sq * .15, ay: .5 });
    }
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!g.held) {
      const bag = g.bags.find(q => !q.placed && (!q.fall || Math.abs(q.vy || 0) < 30));
      if (!bag || b.down) { b.down = false; return b; }
      b.x = bag.x; b.y = bag.y; b.down = true; return b;
    }
    const s = g.held.slot; if (cenizaBotMove(b, s.x, s.y, 9) && dist(g.held.x, g.held.y, s.x, s.y) < 6) b.down = false;
    return b;
  },
});

// ---------------------------------------------------------------- 3 LAZO ----
function cenizaBowSpr(col = '#ff5d9e') {
  return mdl('cz:bow' + col, () => {
    const c = mkCanvas(26, 16), g = c.g, cd = mixHex(col, '#000000', .3), cl = mixHex(col, '#ffffff', .45);
    polyPx(g, [[13, 8], [1, 1], [1, 15]], INK); polyPx(g, [[13, 8], [25, 1], [25, 15]], INK);
    polyPx(g, [[12, 8], [2, 3], [2, 13]], col); polyPx(g, [[14, 8], [24, 3], [24, 13]], col);
    linePx(g, 3, 4, 10, 7, cl); linePx(g, 23, 4, 16, 7, cl); linePx(g, 3, 12, 10, 9, cd); linePx(g, 23, 12, 16, 9, cd);
    disc(g, 13, 8, 3.2, INK); disc(g, 13, 8, 2.3, col); px(g, 12, 7, cl);
    return c;
  });
}
function cenizaLazoBg() {
  return mdl('cz:lazoBg2', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 120); rect(g, 0, 118, SW, 2, '#b9cad0');
    woodFloor(g, 0, 120, SW, 72);
    // round rug
    ellipsePx(g, 140, 176, 84, 12, INK); ellipsePx(g, 140, 175, 83, 11, '#e05b98'); ellipsePx(g, 140, 175, 76, 8, '#ff93bf'); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; px(g, 140 + Math.cos(a) * 80, 175 + Math.sin(a) * 9.6, '#ffd1e4'); }
    // the little table with a wicker basket of bows
    rect(g, 6, 50, 50, 5, RAMP.wood[3]); rect(g, 6, 50, 50, 1, RAMP.wood[4]); rect(g, 6, 55, 50, 1, INK); rect(g, 10, 55, 3, 65, RAMP.wood[1]); rect(g, 49, 55, 3, 65, RAMP.wood[1]);
    rect(g, 34, 38, 20, 12, INK); rect(g, 35, 39, 18, 11, '#c38a21'); for (let x = 36; x < 52; x += 3) vline(g, x, 40, 49, '#8a5a12'); for (let y = 41; y < 50; y += 3) hline(g, 36, 52, y, '#e6b33e');
    for (const [x, col] of [[38, '#63a0ef'], [44, '#ffdf4f'], [50, '#5bd18b']]) { polyPx(g, [[x, 38], [x - 4, 35], [x - 4, 41]], col); polyPx(g, [[x, 38], [x + 4, 35], [x + 4, 41]], col); px(g, x, 38, INK); }
    // framed photo of a champion + a plant
    rect(g, 100, 18, 30, 34, INK); rect(g, 101, 19, 28, 32, RAMP.gold[2]); rect(g, 104, 22, 22, 22, '#fff8e6'); drawS(g, lifeWestie(false), 115, 32, {}); tiny(g, '1', 115, 45, INK, { align: 'c' });
    drawS(g, wbSign({ noCrest: true, noTag: true }), 190, 30, {});
    rect(g, 226, 96, 20, 22, INK); rect(g, 227, 97, 18, 21, '#c0662c'); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35; thickLine(g, 236, 96, 236 + Math.cos(a) * 18, 96 + Math.sin(a) * 18, 2, i % 2 ? '#2a9a6a' : '#5bd18b'); }
    return c;
  });
}
defMG({
  id: 'lazo2', stage: 'ceniza', name: 'Lazo de gala', cmd: '¡PONLE!', how: 'Arrastra el lazo hasta la cabeza del perro', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'bell', v: .55, n: 'F5 . A5 . C6 . A5 . G5 . Bb5 . D6 . Bb5 . A5 . C6 . F6 . C6 . E6 - C#6 - A5 - . .' },
    { i: 'pluck', v: .4, n: 'F4 . . C5 . . F4 . G4 . . D5 . . G4 . F4 . . C5 . . F4 . A4 . . C#5 . . E5 .' },
    { i: 'bass', v: .8, n: 'F2 . . . C3 . . . G2 . . . D3 . . . F2 . . . C3 . . . A2 . . . E2 . . .' },
    { i: 'd', v: .55, n: 'k . z . r . z . k . z . r . z z k . z . r . z . k . z z r . r .' }] }),
  init(g) {
    const n = g.level >= 3 ? 2 : 1, sp = [26, 46, 38][g.level - 1] * g.tempo;
    g.dogs = []; for (let i = 0; i < n; i++) g.dogs.push({ x: n === 1 ? g.r(110, 170) : 90 + i * 90, v: sp * (g.r() < .5 ? -1 : 1) * (1 + i * .25), bow: null, hop: g.r(TAU), stopT: 0, happy: 0 });
    g.bows = []; for (let i = 0; i < n; i++) g.bows.push({ x: 18 + i * 18, y: 42, hx: 18 + i * 18, hy: 42, rot: 0, sq: 0, fall: false, on: null, col: i ? '#63a0ef' : '#ff5d9e' });
    g.held = null;
  },
  headOf(d) { const k = .95, W = Math.ceil(88 * k), H = Math.ceil(64 * k), face = d.v >= 0 ? 1 : -1, bx = d.x - W / 2, top = 172 - H - Math.abs(Math.sin(d.hop)) * 4; const hx = face > 0 ? bx + 66 * k : d.x + W / 2 - 66 * k; return { x: hx, y: top + 9 * k, face }; },
  update(g, dt) {
    for (const d of g.dogs) {
      d.happy = Math.max(0, d.happy - dt);
      if (d.stopT > 0) d.stopT -= dt; else { d.x += d.v * dt; d.hop += dt * 10 * Math.min(1.6, Math.abs(d.v) / 30); }
      if (d.x < 50 || d.x > 214) { d.v *= -1; d.x = clamp(d.x, 50, 214); }
      if (g.level >= 2 && g.r() < dt * .5 && !d.bow) { d.stopT = .35; }
    }
    for (const b of g.bows) { b.sq = Math.max(0, b.sq - dt * 5); if (b.fall) cenizaFall(b, dt, 170); if (b.on) { const h = this.headOf(b.on); b.x = h.x - h.face * 2; b.y = h.y - 3; } }
    if (g.state !== 'play') { g.held = null; return; }
    if (!g.held) { g.held = cenizaGrab(g, g.bows, 20, b => !b.on); if (g.held) { g.held.fall = false; g.held.vy = 0; } }
    if (g.held) {
      const b = g.held; cenizaFollow(b, dt, .6);
      // drop it on a head (on release)
      if (IN.rel || !IN.down) {
        g.held = null;
        const d = g.dogs.find(d => !d.bow && dist(b.x, b.y, this.headOf(d).x, this.headOf(d).y) < 17);
        if (d) {
          d.bow = b; b.on = d; d.happy = 1.2; b.sq = 1; sfx('sparkle'); sfx('bark', { pitch: 1.3, delay: .08 }); HITSTOP = 3; buzz(8);
          const h = this.headOf(d); g.fx.burst(h.x, h.y, 14, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 40, sp1: 120 });
          g.fx.add({ k: 'txt', s: '¡MONÍSIMO!', x: h.x, y: h.y - 22, life: .8, c: '#ffffff' });
          if (g.dogs.every(d => d.bow)) g.win();
        } else { b.fall = true; b.vy = -40; b.vx = IN.vx * .2; }
      }
    }
  },
  draw(g, c) {
    c.drawImage(cenizaLazoBg(), 0, 0);
    for (const d of g.dogs) {
      const mood = d.bow ? 'happy' : 'normal', pose = d.bow || d.happy > 0 ? 'wag' : 'stand';
      shadowOval(c, d.x, 173, 26, 3, .35);
      drawS(c, westieSide(.95, pose, mood), d.x, 172 - Math.abs(Math.sin(d.hop)) * 4, { ax: .5, ay: 1, flip: d.v < 0 });
    }
    // target ring over the next head while dragging
    if (g.held) for (const d of g.dogs) if (!d.bow) { const h = this.headOf(d), r = 13 + Math.sin(g.t * 10) * 1.5; ringPx(c, h.x, h.y, r, '#ffffff'); ringPx(c, h.x, h.y, r + 1, C.pink); }
    for (const b of g.bows) drawS(c, cenizaBowSpr(b.col), b.x, b.y, { rot: b.rot, s: 1 + b.sq * .3 + (b === g.held ? .15 : 0) });
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!g.held) {
      const bow = g.bows.find(q => !q.on && (!q.fall || Math.abs(q.vy || 0) < 30));
      if (!bow || b.down) { b.down = false; return b; }
      b.x = bow.x; b.y = bow.y; b.down = true; return b;
    }
    const d = g.dogs.find(d => !d.bow); const h = this.headOf(d);
    const lead = d.stopT > 0 ? 0 : d.v * .12;
    if (cenizaBotMove(b, h.x + lead, h.y, 10) && dist(g.held.x, g.held.y, h.x, h.y) < 9) b.down = false;
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
  return mdl('cz:bathScene', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 132);
    rect(g, 0, 132, SW, 60, '#b9cad0'); for (let y = 134; y < SH; y += 10) for (let x = (y / 10 % 2) * 10; x < SW; x += 20) rect(g, x, y, 10, 10, '#c9d8dd');
    rect(g, 0, 132, SW, 2, '#8fa3ad');
    // towel rail + a WB towel
    rect(g, 20, 40, 60, 3, RAMP.steel[3]); rect(g, 28, 43, 30, 34, '#ff93bf'); rect(g, 28, 43, 30, 3, '#ffd1e4'); tiny(g, 'WB', 43, 58, '#ffffff', { align: 'c' });
    return c;
  });
}
defMG({
  id: 'banera', stage: 'ceniza', name: 'Al agua, patos', cmd: '¡AL AGUA!', how: 'Arrastra al perro remolón hasta la bañera', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'p25', v: .5, n: 'D5 D5 . F5 . . A5 . G#5 . A5 . . F5 . . D5 D5 . F5 . . A5 . Bb5 . A5 . F5 - . .' },
    { i: 'kalimba', v: .45, n: 'A5 . . . D6 . . . A5 . . . F5 . . . A5 . . . D6 . . . G5 . E5 . C#5 . . .' },
    { i: 'bass', v: .85, n: 'D3 . A2 . D3 . A2 . D3 . A2 . D3 . A2 . Bb2 . F2 . Bb2 . F2 . A2 . E2 . A2 . C#3 .' },
    { i: 'd', v: .6, n: 'k . w . s . w . k k w . s . w w k . w . s . w . k k w . s s s .' }] }),
  init(g) {
    g.anchor = { x: 58, y: 172 }; g.dog = { x: 58, y: 172, rot: 0, st: 'floor', t: 0, sx: 1, sy: 1 };
    g.tub = { x: 188, y: 150, rx: 44 };
    g.res = [.55, .45, .35][g.level - 1]; g.grip = 0; g.wriggle = [9999, 520, 420][g.level - 1] / Math.max(1, g.tempo * .8);
    g.held = false; g.slipT = 0;
  },
  update(g, dt) {
    const d = g.dog; d.t += dt; g.slipT = Math.max(0, g.slipT - dt);
    if (d.st === 'back') { d.x = lerp(d.x, g.anchor.x, .18); d.y = lerp(d.y, g.anchor.y, .18); d.rot *= .8; if (dist(d.x, d.y, g.anchor.x, g.anchor.y) < 1) { d.st = 'floor'; sfx('tap', { pitch: .6 }); } }
    if (d.st === 'splash') { d.y = lerp(d.y, g.tub.y - 4, .15); d.x = lerp(d.x, g.tub.x, .15); return; }
    if (g.state !== 'play') { g.held = false; return; }
    if (!g.held && IN.tap && dist(IN.x, IN.y, d.x, d.y - 22) < 30 && d.st !== 'splash') { g.held = true; g.grip = 0; g.yank = 0; d.st = 'held'; sfx('whine', { pitch: 1.3, vol: .6 }); buzz(8); }
    if (g.held) {
      g.grip = Math.min(1, g.grip + dt * 1.2);
      const f = lerp(g.res, 1, g.grip), tx = g.anchor.x + (IN.x - g.anchor.x) * f, ty = g.anchor.y + (IN.y + 22 - g.anchor.y) * f;
      d.x = lerp(d.x, tx, .35); d.y = lerp(d.y, Math.min(176, ty), .35);
      const tension = clamp(dist(IN.x, IN.y + 22, d.x, d.y) / 50, 0, 1);
      d.sx = 1 + tension * .25; d.sy = 1 - tension * .12; d.rot = clamp(Math.atan2(IN.y + 22 - d.y, IN.x - d.x) * tension * .6, -.8, .8);
      // wriggles free if yanked too hard
      g.yank = lerp(g.yank || 0, Math.hypot(IN.vx, IN.vy), .12); // sustained speed, not a single jittery frame
      if (g.yank > g.wriggle && g.grip < .9) { g.held = false; d.st = 'back'; g.slipT = 1; sfx('whine', { pitch: 1.6 }); g.shake(2, .2); g.fx.add({ k: 'txt', s: '¡Se escapa!', x: d.x, y: d.y - 50, life: .8, c: '#ffd1e4' }); return; }
      if (IN.rel || !IN.down) {
        g.held = false; d.sx = d.sy = 1;
        if (Math.abs(d.x - g.tub.x) < g.tub.rx && d.y < g.tub.y + 16) {
          d.st = 'splash'; g.win(); sfx('splash'); sfx('bark', { n: 2, pitch: 1.2, delay: .2 }); HITSTOP = 4; g.shake(3, .25); buzz(20);
          g.fx.burst(g.tub.x, g.tub.y - 10, 26, { k: 'drop', c: ['#9bd6f7', '#dff4ff', '#ffffff'], sp0: 60, sp1: 200, g: 420, life0: .4, life1: .9, a0: -Math.PI, spread: Math.PI });
          g.fx.burst(g.tub.x, g.tub.y - 14, 14, { k: 'bubble', c: '#ffffff', sp0: 30, sp1: 120, r: 4, life0: .5, life1: 1 });
        } else { d.st = 'back'; sfx('boing', { pitch: .8 }); }
      }
    } else if (d.st === 'held') d.st = 'back';
  },
  draw(g, c) {
    c.drawImage(cenizaBathBg(), 0, 0);
    const T = g.tub, tub = cenizaClawTub();
    // the tub back, then the dog (if inside), then the tub front rim foam
    const d = g.dog;
    // scratch marks where it clings
    for (let i = 0; i < 3; i++) linePx(c, g.anchor.x - 20 + i * 4, 178, g.anchor.x - 14 + i * 4, 186, '#8fa3ad');
    if (d.st === 'splash') {
      c.drawImage(tub, rd(T.x - 56), rd(T.y - 30));
      drawS(c, buleHead(g.t - g.decidedAt < .4 ? 'wow' : 'happy'), d.x, d.y - 22 - Math.abs(Math.sin(g.t * 6)) * 2, {});
      for (const [dx, dy, r] of [[-12, -46, 7], [0, -52, 9], [12, -46, 7]]) { disc(c, d.x + dx, d.y + dy, r + 1, '#b9cad0'); disc(c, d.x + dx, d.y + dy, r, '#ffffff'); }
      for (let x = T.x - 50; x < T.x + 50; x += 7) disc(c, x, T.y - 10 + Math.sin(x + g.t * 4) * 1.5, 5, '#ffffff');
      cenizaPato(c, T.x + 30, T.y - 42, 'laugh', g.t, { s: 1 });
    } else {
      c.drawImage(tub, rd(T.x - 56), rd(T.y - 30));
      for (let x = T.x - 50; x < T.x + 50; x += 7) disc(c, x, T.y - 10 + Math.sin(x + g.t * 4) * 1.5, 5, '#ffffff');
      cenizaPato(c, T.x + 30, T.y - 42, g.slipT > 0 ? 'laugh' : 'grin', g.t, { s: 1 });
      const mood = d.st === 'held' ? 'wow' : 'sad', pose = d.st === 'held' ? 'wet' : 'stand';
      shadowOval(c, d.x, Math.min(186, g.anchor.y + 6), 24, 3, .35);
      drawS(c, westieSide(1, pose, mood), d.x, d.y + (d.st === 'floor' ? Math.sin(g.t * 20) * .6 : 0), { ax: .5, ay: 1, sx: d.sx, sy: d.sy, rot: d.rot });
      if (d.st === 'floor' && g.state === 'play') { const k = (g.t * 1.5) % 1; if (k < .6) shout(c, '¡NO QUIERO!', g.anchor.x + 10, 94, k); }
      if (g.held) { ringPx(c, T.x, T.y - 14, 18 + Math.sin(g.t * 10) * 2, '#ffffff'); }
    }
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    const d = g.dog;
    if (!g.held) { if (b.down || d.st === 'back') { b.down = false; return b; } b.x = d.x; b.y = d.y - 22; b.down = true; return b; }
    // pull slowly (too fast and it slips) and wait for it to give in
    const sp = g.level >= 2 ? 3.2 : 6;
    const tx = g.tub.x, ty = g.tub.y - 36;
    const at = cenizaBotMove(b, tx, ty, sp);
    if (at && Math.abs(d.x - g.tub.x) < g.tub.rx - 8 && d.y < g.tub.y + 8) b.down = false;
    return b;
  },
});

// ---------------------------------------------------------------- 5 CORREA --
function cenizaCorreaBg() {
  return mdl('cenizaCorreaBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    greenWall(g, 0, 0, SW, 140);
    woodFloor(g, 0, 140, SW, 52); rect(g, 0, 138, SW, 2, RAMP.green[0]);
    // coat hook
    rect(g, 16, 22, 26, 8, RAMP.wood[1]); rect(g, 16, 22, 26, 2, RAMP.wood[3]); disc(g, 29, 34, 3, INK); disc(g, 29, 34, 2, RAMP.gold[3]);
    drawS(g, wbSign({ noCrest: true, noTag: true }), 160, 24, {});
    return c;
  });
}
defMG({
  id: 'correa2', stage: 'ceniza', name: 'A pasear', cmd: '¡ENGANCHA!', how: 'Lleva el mosquetón de la correa hasta la anilla del collar', mech: 'drag', beats: 8,
  song: () => ({ spb: 4, tracks: [
    { i: 'pluck', v: .55, n: 'D6 C#6 D6 A5 . . F5 . G5 F5 E5 D5 . . A4 . D6 C#6 D6 A5 . . F5 . E5 F5 G5 A5 - . . .' },
    { i: 'organ', v: .3, n: 'D4+F4+A4 - - - - - - - G3+Bb3+D4 - - - - - - - D4+F4+A4 - - - - - - - A3+C#4+E4 - - - - - - -' },
    { i: 'bass', v: .85, n: 'D3 . . D3 A2 . . A2 G2 . . G2 D3 . . D3 D3 . . D3 A2 . . A2 A2 . . A2 C#3 . E3 .' },
    { i: 'd', v: .7, n: 'k . h k s . h . k . h k s . h h k . h k s . h . k k h . s s s s' }] }),
  init(g) {
    g.hook = { x: 29, y: 36 }; g.clip = { x: 29, y: 92, vx: 0, vy: 0, rot: 0 }; g.held = false; g.hooked = false;
    g.dog = { x: 150, y: 172, ph: g.r(TAU), face: 1 };
    g.sp = [1, 1.35, 1.7][g.level - 1] * g.tempo;
  },
  dogPos(g) {
    const d = g.dog, p = d.ph;
    if (g.hooked) return { x: d.x, y: 172, face: d.face, hop: 0 };
    if (g.level === 1) return { x: 150 + Math.sin(p) * 40, y: 172, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 3)) * 3 };
    if (g.level === 2) return { x: 150 + Math.sin(p) * 48, y: 172, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 2)) * 16 };
    return { x: 150 + Math.sin(p) * 55, y: 166 + Math.cos(p) * 8, face: Math.cos(p) >= 0 ? 1 : -1, hop: Math.abs(Math.sin(p * 2.5)) * 10 };
  },
  ring(g) { const P = this.dogPos(g), k = 1, W = Math.ceil(88 * k), H = Math.ceil(64 * k), top = P.y - H - P.hop; const nx = P.face > 0 ? P.x - W / 2 + 60 * k : P.x + W / 2 - 60 * k; return { x: nx, y: top + 36 * k, P }; },
  update(g, dt) {
    const d = g.dog;
    if (!g.hooked) { d.ph += dt * 1.6 * g.sp; const P = this.dogPos(g); d.x = P.x; d.face = P.face; }
    const C0 = g.clip;
    if (g.hooked) { const R = this.ring(g); C0.x = R.x; C0.y = R.y + 3; return; }
    if (g.state !== 'play') return;
    if (!g.held && IN.tap && dist(IN.x, IN.y, C0.x, C0.y) < 20) { g.held = true; sfx('pop', { pitch: .8 }); buzz(6); }
    if (g.held) {
      C0.x = lerp(C0.x, IN.x, .6); C0.y = lerp(C0.y, IN.y, .6); C0.rot = clamp(IN.vx / 800, -.6, .6);
      const R = this.ring(g);
      if (dist(C0.x, C0.y, R.x, R.y) < 9) {
        g.hooked = true; g.held = false; g.win(); sfx('snip', { pitch: .7 }); sfx('bark', { n: 2, pitch: 1.2, delay: .1 }); HITSTOP = 4; buzz(15);
        g.fx.burst(R.x, R.y, 14, { k: 'star', c: ['#fff27a', '#ffffff'], sp0: 40, sp1: 130 }); g.fx.add({ k: 'txt', s: '¡CLIC!', x: R.x, y: R.y - 20, life: .7, c: '#ffffff' });
      }
      if (IN.rel || !IN.down) { g.held = false; }
    } else {
      // swing back to hang under the hook (damped pendulum)
      const rest = { x: g.hook.x, y: g.hook.y + 56 };
      C0.vx += (rest.x - C0.x) * 30 * dt; C0.vy += (rest.y - C0.y) * 30 * dt; C0.vx *= Math.exp(-3 * dt); C0.vy *= Math.exp(-3 * dt);
      C0.x += C0.vx * dt; C0.y += C0.vy * dt; C0.rot = clamp(C0.vx / 200, -.8, .8);
    }
  },
  draw(g, c) {
    c.drawImage(cenizaCorreaBg(), 0, 0);
    const R = this.ring(g), P = R.P;
    const mood = g.hooked ? 'happy' : 'wow', pose = g.hooked ? 'wag' : 'wag';
    shadowOval(c, P.x, 174, 24 - P.hop * .4, 3, .35);
    drawS(c, westieSide(1, pose, mood), P.x, P.y - P.hop, { ax: .5, ay: 1, flip: P.face < 0 });
    // collar + ring on the neck
    const k = 1, W = Math.ceil(88 * k), H = Math.ceil(64 * k), top = P.y - H - P.hop;
    const cxn = P.face > 0 ? P.x - W / 2 + 59 * k : P.x + W / 2 - 59 * k;
    for (let i = -6; i <= 6; i++) { const yy = top + 29 + i * .9, xx = cxn - 3 * P.face + Math.abs(i) * .35 * P.face; rect(c, xx - 2, yy, 5, 1, INK); rect(c, xx - 1, yy, 3, 1, i < 0 ? RAMP.green[3] : RAMP.green[2]); }
    disc(c, R.x, R.y, 3.6, INK); ringPx(c, R.x, R.y, 2.6, RAMP.gold[4]); ringPx(c, R.x, R.y, 2, RAMP.gold[2]);
    if (!g.hooked && g.held) { const r = 7 + Math.sin(g.t * 12) * 1.5; ringPx(c, R.x, R.y, r, '#ffffff'); }
    // the leash: a sagging rope from the hook to the clip
    const H0 = g.hook, C0 = g.clip, sag = Math.max(8, 70 - dist(H0.x, H0.y, C0.x, C0.y) * .35);
    const mx = (H0.x + C0.x) / 2, my = (H0.y + C0.y) / 2 + sag;
    let lx = H0.x, ly = H0.y;
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([(1 - t) * (1 - t) * H0.x + 2 * (1 - t) * t * mx + t * t * C0.x, (1 - t) * (1 - t) * H0.y + 2 * (1 - t) * t * my + t * t * C0.y]); }
    for (let i = 1; i < pts.length; i++) thickLine(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2, INK);
    for (let i = 1; i < pts.length; i++) thickLine(c, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 1.2, RAMP.green[3]);
    for (let i = 1; i < pts.length; i += 2) px(c, pts[i][0], pts[i][1] - 1, RAMP.green[4]);
    // the clip (carabiner)
    c.save(); c.translate(rd(C0.x), rd(C0.y)); c.rotate(C0.rot || 0);
    rect(c, -3, -9, 6, 12, INK); rect(c, -2, -8, 4, 10, RAMP.steel[3]); rect(c, -2, -8, 1, 10, RAMP.steel[4]); ringPx(c, 0, 4, 3, INK); ringPx(c, 0, 4, 2, RAMP.steel[3]);
    c.restore();
    if (g.state === 'play' && !g.held && g.t < 1.2) { const hk = (g.t * 2) % 1; drawHand(c, C0.x + 10, C0.y + 6 + hk * 3, hk > .5); }
  },
  bot(g) {
    const b = cenizaBot(g); if (g.state !== 'play') { b.down = false; return b; }
    if (!g.held) { if (b.down) { b.down = false; return b; } b.x = g.clip.x; b.y = g.clip.y; b.down = true; return b; }
    const R = this.ring(g); cenizaBotMove(b, R.x, R.y, 11); return b;
  },
});
