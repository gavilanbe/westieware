// ============================================================================
//  salon — Westie BLVRD, Carrer de Viladomat 185: the sign, the green wall,
//  the mustard velvet chair, subway tiles, the gilded mirror, the shelves of
//  food bags, rosettes, the round clock, the wooden floor, the street outside.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- serif caps
// "WESTIE BLVRD" lettering: tall W and B, small caps for the rest (1px serifs)
const BLV_SRC = {
  W: ['###.###.###', '.#...#...#.', '.#...#...#.', '.#..#.#..#.', '..#.#.#.#..', '..#.#.#.#..', '..#.#.#.#..', '...#...#...', '...#...#...'],
  B: ['######.', '.#....#', '.#....#', '.#...#.', '.#####.', '.#....#', '.#....#', '.#....#', '######.'],
  E: ['######', '.#...#', '.#....', '.####.', '.#....', '.#...#', '######'],
  S: ['.####', '#...#', '#....', '.###.', '....#', '#...#', '####.'],
  T: ['#######', '#..#..#', '...#...', '...#...', '...#...', '...#...', '..###..'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  L: ['###...', '.#....', '.#....', '.#....', '.#....', '.#...#', '######'],
  V: ['###.###', '.#...#.', '.#...#.', '..#.#..', '..#.#..', '..#.#..', '...#...'],
  R: ['#####..', '.#...#.', '.#...#.', '.####..', '.#..#..', '.#...#.', '###..##'],
  D: ['#####..', '.#...#.', '.#....#', '.#....#', '.#....#', '.#...#.', '#####..'],
};
function blvWord(g, word, x, y, col, sh) {
  let xx = x;
  for (const ch of word) {
    if (ch === ' ') { xx += 5; continue; }
    const gl = BLV_SRC[ch]; if (!gl) continue;
    const off = gl.length === 9 ? 0 : 2;
    for (const [c, dx] of sh ? [[sh, 1], [col, 0]] : [[col, 0]]) { g.fillStyle = c; gl.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.fillRect(xx + i + dx, y + off + j + dx, 1, 1); }); }
    xx += gl[0].length + 2;
  }
  return xx - x - 2;
}
function blvW(word) { let w = 0; for (const ch of word) w += ch === ' ' ? 5 : (BLV_SRC[ch] ? BLV_SRC[ch][0].length + 2 : 0); return w - 2; }

// the shop sign: street-plaque, stepped crest with the westie between
// "GROOMING" and "SPA & STORE", and the "by Anahí Gavilán" tag hanging below
function wbSign(o = {}) {
  const key = 'wbSign' + (o.noCrest ? 'n' : '') + (o.noTag ? 't' : '');
  return mdl(key, () => {
    const G = RAMP.green, CR = RAMP.cream[4], tw = blvW('WESTIE BLVRD');
    const W = tw + 18, top = o.noCrest ? 1 : 19, ph = 19, H = top + ph + (o.noTag ? 2 : 14), c = mkCanvas(W, H), g = c.g;
    if (!o.noCrest) {
      const x0 = 5, x1 = W - 5, mx = W / 2, tw2 = 15;
      const pts = [[x0, top + 1], [x0, 9], [mx - tw2, 9], [mx - tw2, 4], [mx - 9, 4], [mx - 7, 0], [mx + 7, 0], [mx + 9, 4], [mx + tw2, 4], [mx + tw2, 9], [x1, 9], [x1, top + 1]];
      polyPx(g, pts.map(([x, y]) => [x + (x < mx ? -1 : 1), y - 1]), INK);
      polyPx(g, pts, G[2]);
      for (let i = 1; i < pts.length - 2; i++) linePx(g, pts[i][0] + (pts[i][0] < mx ? 2 : -2), pts[i][1] + 2, pts[i + 1][0] + (pts[i + 1][0] < mx ? 2 : -2), pts[i + 1][1] + 2, G[3]);
      drawS(g, westieMini(), mx, 9, {});
      tiny(g, 'GROOMING', (x0 + mx - tw2) / 2, 12, RAMP.cream[3], { align: 'c' });
      tiny(g, 'SPA&STORE', (x1 + mx + tw2) / 2, 12, RAMP.cream[3], { align: 'c' });
    }
    panel(g, 0, top, W, ph, G[2], { r: 4, line: INK, hi: G[3], lo: G[1] });
    ringRectRound(g, 2, top + 2, W - 4, ph - 4, RAMP.cream[3]);
    blvWord(g, 'WESTIE BLVRD', 9, top + 5, CR, G[0]);
    if (!o.noTag) {
      const s2 = 'by Anahí Gavilán', tw3 = txtW(s2) + 10, tx = rd(W / 2 - tw3 / 2), ty = top + ph;
      panel(g, tx, ty, tw3, 13, G[2], { r: 3, line: INK });
      txt(g, s2, W / 2, ty + 3, RAMP.cream[4], { align: 'c' });
    }
    return c;
  });
}
function ringRectRound(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x + 2, y, w - 4, 1); g.fillRect(x + 2, y + h - 1, w - 4, 1); g.fillRect(x, y + 2, 1, h - 4); g.fillRect(x + w - 1, y + 2, 1, h - 4); g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + w - 2, y + 1, 1, 1); g.fillRect(x + 1, y + h - 2, 1, 1); g.fillRect(x + w - 2, y + h - 2, 1, 1); }
// the crest westie, tiny (from the same model, drawn small by hand)
function westieMini() {
  return mdl('westieMini', () => spr([
    '..k.......k..',
    '.kwk.....kwk.',
    '.kpwkkkkkwpk.',
    'kwwwwwwwwwwwk',
    'kwwkwwwwwkwwk',
    'kwwwwwkwwwwwk',
    '.kwwwkkkwwwk.',
    '.kwwwwkwwwwk.',
    '..kwwwwwwwk..',
    '...kkkkkkk...'], { k: INK, w: '#ffffff', p: RAMP.pink[3] }));
}

// ---------------------------------------------------------------- materials --
function subwayTiles(g, x, y, w, h, o = {}) {
  const T = RAMP.tile, tw = o.tw || 10, th = o.th || 5;
  rect(g, x, y, w, h, T[1]);
  for (let j = 0; j * th < h; j++) for (let i = -1; i * tw < w + tw; i++) {
    const ox = (j % 2) * (tw / 2), tx = x + i * tw + ox, ty = y + j * th;
    const x0 = Math.max(x, tx + 1), x1 = Math.min(x + w, tx + tw), y0 = ty + 1, y1 = Math.min(y + h, ty + th);
    if (x1 <= x0 || y1 <= y0) continue;
    g.fillStyle = T[3]; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = T[4]; g.fillRect(x0, y0, x1 - x0, 1);
    g.fillStyle = T[2]; g.fillRect(x0, y1 - 1, x1 - x0, 1);
  }
}
function woodFloor(g, x, y, w, h) {
  const Wd = RAMP.wood;
  rect(g, x, y, w, h, Wd[3]);
  for (let j = 0; j < h; j += 6) {
    rect(g, x, y + j, w, 1, Wd[1]);
    for (let i = ((j / 6) % 2) * 17; i < w; i += 34) { rect(g, x + i, y + j, 1, 6, Wd[1]); }
    for (let i = 0; i < w; i += 3) if (hash2(i, j) < .25) px(g, x + i, y + j + 2 + fl(hash2(j, i) * 3), Wd[2]);
    rect(g, x, y + j + 1, w, 1, Wd[4]);
  }
}
function greenWall(g, x, y, w, h) {
  const G = RAMP.green;
  rect(g, x, y, w, h, G[2]);
  // soft wainscot
  rect(g, x, y + h - 26, w, 1, G[1]); rect(g, x, y + h - 25, w, 1, G[3]);
  for (let i = x + 6; i < x + w - 4; i += 22) { ringRect(g, i, y + h - 21, 16, 16, 1, G[1]); rect(g, i + 1, y + h - 20, 14, 1, G[3]); }
}
// food bags on a shelf (colourful, like the pink/blue/orange ones in the shop)
const BAG_COLS = [['#e05b98', '#ff93bf', '#ffd1e4'], ['#3565cc', '#63a0ef', '#b3d9ff'], ['#e56f1d', '#ff9f4f', '#ffd49b'], ['#2a9a6a', '#5bd18b', '#b8f0d0'], ['#8959c5', '#bf95e9', '#e5d3fa'], ['#e2b21b', '#ffdf4f', '#fff7ae']];
function foodBag(g, x, y, w, h, ci) {
  const c = BAG_COLS[ci % BAG_COLS.length];
  rect(g, x, y + 2, w, h - 2, INK); rect(g, x + 1, y + 1, w - 2, 1, INK);
  rect(g, x + 1, y + 2, w - 2, h - 3, c[0]); rect(g, x + 1, y + 2, 1, h - 3, c[1]); rect(g, x + 2, y + 2, w - 4, 2, c[1]);
  rect(g, x + 2, y + fl(h / 2), w - 4, 3, c[2]); px(g, x + fl(w / 2), y + fl(h / 2) + 1, INK);
}
function shelf(g, x, y, w, items = 5, seed = 0) {
  const Wd = RAMP.wood;
  let xx = x + 2;
  for (let i = 0; i < items; i++) { const bw = 8 + fl(hash2(i, seed) * 5), bh = 11 + fl(hash2(seed, i) * 5); if (xx + bw > x + w - 2) break; foodBag(g, xx, y - bh, bw, bh, fl(hash2(i + 7, seed) * 6)); xx += bw + 1; }
  rect(g, x, y, w, 3, Wd[3]); rect(g, x, y, w, 1, Wd[4]); rect(g, x, y + 3, w, 1, INK);
}
function rosette(g, x, y, col, col2) {
  polyPx(g, [[x - 3, y + 2], [x - 5, y + 12], [x - 2, y + 10], [x, y + 2]], col2); polyPx(g, [[x + 3, y + 2], [x + 5, y + 12], [x + 2, y + 10], [x, y + 2]], col2);
  disc(g, x, y, 5, INK); disc(g, x, y, 4, col); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; px(g, x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6, col2); } disc(g, x, y, 1.5, RAMP.gold[3]);
}
function wallClock(g, x, y, t) {
  disc(g, x, y, 9, INK); disc(g, x, y, 8, '#2b2540'); disc(g, x, y, 7, '#fffaf0'); disc(g, x - 1, y - 1, 5, '#ffffff');
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; px(g, x + Math.cos(a) * 6, y + Math.sin(a) * 6, INK); }
  const h = t / 60 * TAU / 12 - Math.PI / 2, m = t / 60 * TAU - Math.PI / 2;
  linePx(g, x, y, x + Math.cos(h) * 3.5, y + Math.sin(h) * 3.5, INK); linePx(g, x, y, x + Math.cos(m) * 5.5, y + Math.sin(m) * 5.5, INK); px(g, x, y, C.red);
}
function spotLight(g, x, y) { rect(g, x - 3, y, 7, 2, '#c8c6d3'); rect(g, x - 2, y + 2, 5, 1, '#fff7ae'); px(g, x, y + 3, '#ffffff'); }
// the mustard velvet chair (photo corner), front view
function velvetChair() {
  return mdl('velvetChair', () => {
    const M = RAMP.mustard, Wd = RAMP.wood;
    const back = SD.smooth(3, SD.box(24, 17, 15, 14, 7), SD.ellipse(24, 6, 11, 5));
    const frame = SD.sub(SD.grow(back, 2.2), back);
    const seat = SD.box(24, 36, 20, 6, 4), apron = SD.box(24, 43, 19, 2.5, 1.5);
    const legL = SD.capsule(8, 44, 6, 55, 1.8, 1.3), legR = SD.capsule(40, 44, 42, 55, 1.8, 1.3);
    const c = model(48, 58, [
      { f: legL, ramp: Wd, z: 0, th: 2 }, { f: legR, ramp: Wd, z: 0, th: 2 },
      { f: frame, ramp: Wd, z: 1, th: 2 },
      { f: back, ramp: M, z: 1.5, th: 8, tex: (x, y) => (hash2(fl(x), fl(y), 3) - .5) * .12 },
      { f: apron, ramp: Wd, z: 2, th: 2 },
      { f: seat, ramp: M, z: 3, th: 6, tex: (x, y) => (hash2(fl(x), fl(y), 4) - .5) * .12 },
    ]);
    const g = c.g; for (let x = 6; x < 43; x += 2) px(g, x, 45, M[4]); // gold fringe
    return c;
  });
}
// the round grooming table (black mat with a pattern of rings, chrome arm)
function groomTable(g, x, y, w) {
  const hw = w / 2;
  ellipsePx(g, x, y + 2, hw + 1, 6, INK); ellipsePx(g, x, y, hw + 1, 6, INK);
  ellipsePx(g, x, y, hw, 5, '#2b2540'); ellipsePx(g, x - 1, y - 1, hw - 3, 3.5, '#40395e');
  for (let i = -hw + 5; i < hw - 4; i += 6) ringPx(g, x + i, y - .5, 1.6, '#5f5883');
  rect(g, x - 2, y + 6, 4, 30, RAMP.steel[2]); rect(g, x - 2, y + 6, 1, 30, RAMP.steel[4]); rect(g, x + 1, y + 6, 1, 30, RAMP.steel[1]);
}

// ---------------------------------------------------------------- the room ---
// the interlude backdrop (top screen) — prerendered once
function salonBackdrop() {
  return mdl('salonBackdrop', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    // ceiling + walls
    rect(g, 0, 0, SW, 14, '#f2f1f6'); rect(g, 0, 13, SW, 1, '#c8c6d3');
    greenWall(g, 0, 14, 120, 132);
    subwayTiles(g, 120, 14, 136, 132);
    rect(g, 119, 14, 2, 132, RAMP.green[0]);
    for (const sx of [30, 78, 130, 182, 230]) spotLight(g, sx, 11);
    // the sign on the green wall, the rosettes
    drawS(g, wbSign({ noCrest: true, noTag: true }), 60, 32);
    rosette(g, 12, 62, C.red, '#ffffff'); rosette(g, 25, 58, '#3565cc', '#ffffff'); rosette(g, 106, 60, '#ffdf4f', C.red);
    // shelves of food on the tiles
    shelf(g, 198, 46, 54, 6, 1); shelf(g, 198, 74, 54, 6, 2);
    // floor
    woodFloor(g, 0, 146, SW, 46); rect(g, 0, 146, SW, 1, RAMP.wood[1]);
    // skirting
    rect(g, 0, 144, 120, 2, RAMP.green[0]); rect(g, 120, 144, 136, 2, '#b9cad0');
    // the chair in the photo corner
    drawS(g, velvetChair(), 58, 146, { ax: .5, ay: 1 });
    return c;
  });
}

// the vintage cream dresser with gilt trim (reception), used under the mirror
function dresser(g, x, y, w, h) {
  const CR = RAMP.cream, G = RAMP.gold;
  rect(g, x, y, w, h, INK);
  rect(g, x + 1, y + 1, w - 2, h - 1, CR[3]); rect(g, x + 1, y + 1, w - 2, 2, CR[4]); rect(g, x + 1, y + 3, w - 2, 1, G[2]);
  const n = 3, dw = (w - 10) / n;
  for (let i = 0; i < n; i++) {
    const dx = rd(x + 5 + i * dw), dww = rd(dw - 3);
    rect(g, dx, y + 8, dww, h - 12, CR[2]); ringRect(g, dx, y + 8, dww, h - 12, 1, G[1]); rect(g, dx + 1, y + 9, dww - 2, 1, CR[4]);
    disc(g, dx + dww / 2, y + 8 + (h - 12) / 2, 2, G[1]); px(g, dx + dww / 2 - 1, y + 7 + (h - 12) / 2, G[4]);
  }
}
function salonBotBackdrop() {
  return mdl('salonBot', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    subwayTiles(g, 0, 0, SW, 150);
    dresser(g, -4, 150, SW + 8, 44);
    // treat jars on the dresser, like the shop's
    for (const [jx, col] of [[22, '#c0662c'], [234, '#e2b21b']]) { rect(g, jx - 6, 134, 13, 16, INK); rect(g, jx - 5, 135, 11, 15, '#dff4ff'); rect(g, jx - 4, 142, 9, 7, col); rect(g, jx - 6, 132, 13, 3, RAMP.wood[3]); px(g, jx - 3, 137, '#ffffff'); }
    return c;
  });
}

// ---------------------------------------------------------------- the street -
// Barcelona "panot" flower tile, 10x10
function panotPat() {
  return pattern('panot', 10, 10, g => {
    rect(g, 0, 0, 10, 10, '#b8b3ab'); rect(g, 0, 0, 10, 1, '#9c978f'); rect(g, 0, 0, 1, 10, '#9c978f');
    for (const [x, y] of [[3, 3], [7, 3], [3, 7], [7, 7]]) { px(g, x, y, '#cdc8bf'); px(g, x + 1, y, '#a8a39b'); }
    px(g, 5, 5, '#cdc8bf');
  });
}
// plane tree trunk with its camouflage bark
function planeTrunk(g, x, y0, y1, w) {
  rect(g, x - 1, y0, w + 2, y1 - y0, INK);
  for (let y = y0; y < y1; y++) for (let i = 0; i < w; i++) {
    const n = fbm((x + i) * .22, y * .12, 4);
    g.fillStyle = n < .38 ? '#7f8a5e' : n < .5 ? '#a9ad86' : n < .62 ? '#d9d3b0' : '#8e9a70'; g.fillRect(x + i, y, 1, 1);
  }
}
// one Eixample façade band: stucco, green louvred shutters, iron balconies
function eixampleFacade(g, x, y, w, h, seed = 0) {
  rect(g, x, y, w, h, '#e3cfaf');
  for (let i = 0; i < 260; i++) px(g, x + hash2(i, seed) * w, y + hash2(seed, i) * h, '#d4bd98');
  const cols = Math.max(1, fl(w / 44));
  for (let fy = y + 8; fy < y + h - 30; fy += 46) for (let c = 0; c < cols; c++) {
    const wx = rd(x + 10 + c * (w - 20) / cols + ((w - 20) / cols - 22) / 2), wy = fy;
    rect(g, wx - 1, wy - 1, 24, 34, INK);
    for (let j = 0; j < 32; j += 2) { rect(g, wx, wy + j, 11, 2, j % 4 ? '#2f7a54' : '#3f9166'); rect(g, wx + 11, wy + j, 11, 2, j % 4 ? '#2f7a54' : '#3f9166'); }
    rect(g, wx + 10, wy, 2, 32, '#1f5a3c');
    // balcony
    rect(g, wx - 5, wy + 32, 32, 2, '#6b6977'); rect(g, wx - 5, wy + 34, 32, 1, INK);
    for (let b = wx - 4; b < wx + 27; b += 3) vline(g, b, wy + 22, wy + 32, INK);
    hline(g, wx - 5, wx + 26, wy + 21, INK);
    for (let b = wx - 3; b < wx + 26; b += 6) { px(g, b, wy + 25, INK); px(g, b + 1, wy + 26, INK); }
  }
  rect(g, x, y + h - 2, w, 2, '#c9b28c');
}
// the shopfront: shutter 0 (open) … 1 (closed)
function shopFront(g, x, y, shut = 0, lit = 1) {
  // (x, y) = top-left of the storefront opening, 150x70
  const W0 = 150, H0 = 70;
  rect(g, x - 6, y - 4, W0 + 12, H0 + 8, '#cfae84');
  rect(g, x, y, W0, H0, INK);
  // window (left) + door (right)
  const win = [x + 2, y + 2, 100, H0 - 4], door = [x + 106, y + 2, 42, H0 - 4];
  rect(g, win[0], win[1], win[2], win[3], '#f2efe6');
  // the lit interior seen through the glass: tiles, spotlights, the mirror, a dog statue
  subwayTiles(g, win[0], win[1], win[2], win[3] - 18);
  rect(g, win[0], win[1] + win[3] - 18, win[2], 18, RAMP.wood[3]);
  ringRect(g, win[0] + 60, win[1] + 10, 26, 30, 2, RAMP.gold[2]);
  foodBag(g, win[0] + 8, win[1] + win[3] - 30, 10, 14, 0); foodBag(g, win[0] + 20, win[1] + win[3] - 28, 9, 12, 1);
  drawS(g, lifeWestie(), win[0] + 44, win[1] + win[3] - 12);
  rect(g, door[0], door[1], door[2], door[3], '#223a36'); rect(g, door[0] + 3, door[1] + 3, door[2] - 6, door[3] - 6, '#35605a');
  subwayTiles(g, door[0] + 3, door[1] + 3, door[2] - 6, door[3] - 20);
  // "OPEN" oval sign
  ellipsePx(g, door[0] + 21, door[1] + 22, 12, 6, INK); ellipsePx(g, door[0] + 21, door[1] + 22, 11, 5, '#fffaf0'); tiny(g, 'OPEN', door[0] + 21, door[1] + 20, INK, { align: 'c' });
  if (lit < 1) { g.globalAlpha = (1 - lit) * .7; rect(g, win[0], win[1], win[2], win[3], '#10141c'); rect(g, door[0], door[1], door[2], door[3], '#10141c'); g.globalAlpha = 1; }
  // glass glare
  for (let i = 0; i < 3; i++) linePx(g, win[0] + 70 + i * 6, win[1], win[0] + 40 + i * 6, win[1] + win[3] - 1, 'rgba(255,255,255,.25)');
  // metal shutter rolling down from the top
  if (shut > 0) {
    const sh = rd(H0 * shut);
    for (let j = 0; j < sh; j++) { g.fillStyle = j % 3 === 0 ? '#6b6977' : j % 3 === 1 ? '#9896a4' : '#b3b1bd'; g.fillRect(x, y + j, W0, 1); }
    rect(g, x, y + sh - 1, W0, 2, INK);
    if (sh > 30) { txt(g, 'WB', x + 54, y + sh - 24, '#e05b98', { bold: true }); for (let i = 0; i < 12; i++) px(g, x + 50 + i * 3, y + sh - 12 + Math.sin(i) * 2, '#5bd18b'); }
  }
  // sign above
  drawS(g, wbSign(), x + W0 / 2, y - 4, { ax: .5, ay: 1 });
}
function manhole(g, x, y) { ellipsePx(g, x, y, 17, 5, INK); ellipsePx(g, x, y, 16, 4, '#5b5a66'); for (let i = -12; i <= 12; i += 4) hline(g, x + i - 1, x + i + 1, y, '#44424f'); tiny(g, 'BCN', x, y - 2, '#7a7887', { align: 'c' }); }
// the whole street picture for tall shots (256 x TALL_H)
function streetTall(g, shut, lit, t, o = {}) {
  // sky + skyline on the top screen
  const sky = ['#f7b267', '#f79d65', '#f4845f', '#f27059', '#e6a0c4', '#a0c4ff', '#7fb2ff'];
  bandsV(g, 0, 0, SW, 150, sky.slice().reverse());
  disc(g, 196, 120 - (o.sunUp || 0) * 30, 16, '#fff2c0'); disc(g, 196, 120 - (o.sunUp || 0) * 30, 12, '#ffffff');
  sagradaSilhouette(g, 60, 150);
  rect(g, 0, 150, SW, 42, '#caa98b');
  eixampleFacade(g, 0, 110, SW, 190, 3);
  // ground floor + shop (the whole sign sits on the touch screen)
  const gy = SH + HINGE; // top of the bottom screen in tall coords
  rect(g, 0, gy - 10, SW, 150, '#d8c29c');
  shopFront(g, 20, gy + 58, shut, lit);
  planeTrunk(g, 214, gy - 30, gy + 150, 12);
  for (let i = 0; i < 9; i++) disc(g, 200 + hash2(i, 5) * 56, gy - 20 + hash2(5, i) * 14, 10, i % 2 ? '#5a8f3e' : '#6fa64a');
  // grass strip, A-frame, bowl
  rect(g, 20, gy + 128, 150, 5, '#3e8f3a'); for (let x = 20; x < 170; x += 2) px(g, x, gy + 127, '#56ab4a');
  drawS(g, aFrameSign(), 186, gy + 136, { ax: .5, ay: 1, s: .7 });
  // sidewalk panots, kerb, road + manhole
  fillPat(g, panotPat(), 0, gy + 133, SW, 30);
  rect(g, 0, gy + 163, SW, 3, '#8f8a82'); rect(g, 0, gy + 166, SW, 26, '#4a4852');
  for (let x = 0; x < SW; x += 24) rect(g, x, gy + 180, 12, 2, '#d8d6cf');
  manhole(g, 120, gy + 176);
}
function sagradaSilhouette(g, x, base) {
  const col = '#8f6f8f';
  for (const [dx, h, w] of [[0, 70, 6], [9, 84, 6], [18, 84, 6], [27, 70, 6], [44, 58, 5], [52, 66, 5]]) {
    polyPx(g, [[x + dx, base], [x + dx, base - h + 10], [x + dx + w / 2, base - h], [x + dx + w, base - h + 10], [x + dx + w, base]], col);
    px(g, x + dx + w / 2, base - h - 2, '#fff2c0');
  }
  rect(g, x - 6, base - 30, 70, 30, col);
  // cranes (it's still being finished)
  linePx(g, x + 70, base - 10, x + 70, base - 90, '#a07ea0'); linePx(g, x + 70, base - 90, x + 40, base - 88, '#a07ea0');
}
