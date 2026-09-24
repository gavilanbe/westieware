// ============================================================================
//  FINAL BOSS — ¡PREPARA EL PERRO!  (the user's own idea, from his parody video)
//  One super scruffy client, the full Westie BLVRD service, phase by phase:
//  CEPILLA · CHAMPÚ · FROTA · ACLARA · SECA · CORTA · COBRA.
//  Where your tool passes, the dog changes: each state is revealed cell by cell.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- palette ---
const PREP_DIRTY = ['#46310f', '#765622', '#a4823d', '#c9ac66', '#e3cd8f'];
const PREP_BRUSHED = ['#5a4420', '#8f7338', '#bca264', '#dcc68e', '#f1e3b6'];
const PREP_WET = ['#4a4860', '#737089', '#9f9cb3', '#c7c3d4', '#e7e4ee'];
const PREP_CLEAN = ['#7c6e8c', '#b1a6be', '#dfd8e4', '#f6f1ee', '#fffdf8'];
const PREP_MINT = ['#1f5c4a', '#2f8866', '#5bb593', '#8fd6b5', '#c8f0de'];

// ---------------------------------------------------------------- the client
// Nube, front view, sitting. States: scruffy | brushed | wet | frizzy | clean.
// Canvas 104x112 (x k), anchor = bottom centre (52, 110).
function prepDog(state, k = 1, expr) {
  const ex = expr || { scruffy: 'grumpy', brushed: 'meh', wet: 'sad', frizzy: 'happy', clean: 'proud' }[state];
  return mdl('prepDog:' + state + ':' + k + ':' + ex, () => {
    const s = v => v * k, W = Math.ceil(104 * k), H = Math.ceil(112 * k);
    const P = { scruffy: [PREP_DIRTY, 5.5, 1.1, 2.6], brushed: [PREP_BRUSHED, 2.6, 1.5, 1], wet: [PREP_WET, .6, 2, .3], frizzy: [PREP_CLEAN, 9, 3.2, 1.2], clean: [PREP_CLEAN, 2.2, 1.6, .6] }[state];
    const [R, amp, sharp, shag] = P, slim = state === 'wet' ? .86 : 1, big = state === 'frizzy' ? 1.08 : 1;
    const headS = SD.ellipse(s(52), s(42), s(24 * slim * big), s(21 * slim * big));
    const head = SD.shag(SD.tufts(headS, s(52), s(42), s(amp), 22, 1.3, sharp), s(shag), .3 / k, 11);
    const bodyS = SD.ellipse(s(52), s(80), s(25 * slim * big), s(22 * slim));
    const body = SD.shag(SD.tufts(bodyS, s(52), s(76), s(amp * .9), 20, 2.1, sharp), s(shag), .3 / k, 5);
    const chestS = SD.ellipse(s(52), s(71), s(15 * slim), s(13));
    const chest = SD.tufts(chestS, s(52), s(71), s(amp * .7), 14, .4, sharp);
    const droop = state === 'wet' ? 7 : 0;
    const earL = SD.grow(SD.poly([[s(36), s(29)], [s(34 - droop), s(14 + droop * 1.2)], [s(45), s(23)]]), s(2.2)), earR = SD.grow(SD.poly([[s(68), s(29)], [s(70 + droop), s(14 + droop * 1.2)], [s(59), s(23)]]), s(2.2));
    const muzzle = SD.smooth(s(2), SD.ellipse(s(52), s(52), s(11), s(8)), SD.ellipse(s(52), s(57), s(8), s(5)));
    const legL = SD.capsule(s(42), s(86), s(41), s(103), s(5.6), s(5)), legR = SD.capsule(s(62), s(86), s(63), s(103), s(5.6), s(5));
    const pawL = SD.ellipse(s(41), s(105), s(6.8), s(3.8)), pawR = SD.ellipse(s(63), s(105), s(6.8), s(3.8));
    const hauL = SD.ellipse(s(30), s(95), s(9), s(10)), hauR = SD.ellipse(s(74), s(95), s(9), s(10));
    const tail = SD.curve([s(75), s(84)], [s(90), s(74)], [s(87), s(58 + (state === 'wet' ? 20 : 0))], s(4.2), s(2));
    const tx = clumpTex(Math.max(2.5, 5 * k), .3, state.length, 1.3), tx2 = clumpTex(Math.max(2.2, 3.6 * k), .25, 3, 1.5);
    const c = model(W, H, [
      { f: tail, ramp: R, z: 0, th: s(3), tex: tx2 },
      { f: earL, ramp: R, z: .5, th: s(4), tex: tx2 }, { f: earR, ramp: R, z: .5, th: s(4), tex: tx2 },
      { f: SD.union(hauL, hauR), ramp: R, z: .8, th: s(6), tex: tx },
      { f: body, fs: bodyS, ramp: R, z: 1, th: s(14), tex: tx },
      { f: legL, ramp: R, z: 1.6, th: s(4), tex: tx2 }, { f: legR, ramp: R, z: 1.6, th: s(4), tex: tx2 },
      { f: pawL, ramp: R, z: 1.8, th: s(3) }, { f: pawR, ramp: R, z: 1.8, th: s(3) },
      { f: chest, fs: chestS, ramp: R, z: 2, th: s(8), tex: tx },
      { f: head, fs: headS, ramp: R, z: 3, th: s(14), tex: tx },
      { f: muzzle, ramp: R, z: 3.5, th: s(6), amb: .42, tex: tx2 },
      { f: SD.ellipse(s(52), s(47), s(4.6), s(3.6)), ramp: RAMP.black, z: 4, th: s(3), gloss: true },
    ]);
    const g = c.g;
    // inner ears (pink), mud, knots are separate sprites; the face is painted by hand
    if (k >= .8 && (state === 'clean' || state === 'frizzy')) { polyPx(g, [[s(38), s(26)], [s(37), s(19)], [s(42), s(24)]], RAMP.pink[3]); polyPx(g, [[s(66), s(26)], [s(67), s(19)], [s(62), s(24)]], RAMP.pink[3]); }
    // bushy terrier brows + beard strands while she's a mess
    if (state === 'scruffy' || state === 'brushed') { const n = state === 'scruffy' ? 7 : 3; for (let i = 0; i < n; i++) { linePx(g, s(40 + i * 1.6), s(33), s(38 + i * 1.8), s(37 + (i % 2)), R[1]); linePx(g, s(64 - i * 1.6), s(33), s(66 - i * 1.8), s(37 + (i % 2)), R[1]); linePx(g, s(46 + i * 2), s(58), s(45 + i * 2.2), s(64 + (i % 3)), R[1]); } }
    if (state === 'scruffy' || state === 'brushed') for (let i = 0; i < (state === 'scruffy' ? 9 : 5); i++) { const mx = s(30 + hash2(i, 3) * 44), my = s(56 + hash2(3, i) * 44), r = s(2 + hash2(i, 9) * 3); disc(g, mx, my, r, '#6b4a22'); disc(g, mx - r * .3, my - r * .3, r * .5, '#8a6534'); }
    if (state === 'scruffy') for (let i = 0; i < 14; i++) { const a = hash2(i, 7) * TAU, rr = s(20 + hash2(7, i) * 6); linePx(g, s(52) + Math.cos(a) * rr * .6, s(44) + Math.sin(a) * rr * .5, s(52) + Math.cos(a) * rr, s(44) + Math.sin(a) * rr * .9, R[1]); }
    prepFace(g, s(52), s(42), ex, k);
    if (state === 'wet') for (const [dx, dy] of [[-18, -8], [16, -12], [-6, -20], [20, 8]]) { disc(g, s(52 + dx), s(42 + dy), s(1.6), '#9bd6f7'); px(g, s(52 + dx) - 1, s(42 + dy) - 1, '#ffffff'); }
    return c;
  });
}
// big cartoon eyes, rosy cheeks, expressive mouth — scaled by k
function prepFace(g, cx, cy, ex, k = 1) {
  const s = v => rd(v * k), K = INK, eyeY = cy + s(-2), lx = cx - s(9), rx = cx + s(9), er = Math.max(1, s(2.6));
  const cheek = (x) => { const w = Math.max(2, s(4)); rect(g, x - w / 2, cy + s(7), w, Math.max(1, s(2)), '#f29aa8'); };
  const round = (x, look = 0) => { disc(g, x, eyeY, er + .6, K); if (k >= .8) { px(g, x - 1 + look, eyeY - 1, '#ffffff'); px(g, x + look, eyeY - 1, '#ffffff'); } };
  const arc = (x, up = true) => { for (let i = -er; i <= er; i++) px(g, x + i, eyeY + (up ? -Math.round(Math.sqrt(Math.max(0, er * er - i * i)) * .7) : Math.round(Math.sqrt(Math.max(0, er * er - i * i)) * .7)), K); };
  const my = cy + s(13);
  switch (ex) {
    case 'grumpy': // half-lidded, frowning
      for (const x of [lx, rx]) { rect(g, x - er, eyeY - 1, er * 2 + 1, 2, K); px(g, x, eyeY + 1, K); }
      linePx(g, lx - er - 1, eyeY - s(4), lx + er, eyeY - s(2), K); linePx(g, rx + er + 1, eyeY - s(4), rx - er, eyeY - s(2), K);
      hline(g, cx - s(4), cx + s(4), my + 1, K); px(g, cx - s(5), my + 2, K); px(g, cx + s(5), my + 2, K); break;
    case 'meh': round(lx); round(rx); hline(g, cx - s(3), cx + s(3), my, K); break;
    case 'sad':
      round(lx); round(rx); linePx(g, lx - er, eyeY - s(4), lx + er, eyeY - s(5), K); linePx(g, rx + er, eyeY - s(4), rx - er, eyeY - s(5), K);
      hline(g, cx - s(3), cx + s(3), my + 1, K); px(g, cx - s(4), my + 2, K); px(g, cx + s(4), my + 2, K);
      disc(g, lx - s(2), eyeY + s(5), Math.max(1, s(1.4)), '#63a0ef'); break;
    case 'shock': disc(g, lx, eyeY, er + 1.4, K); disc(g, rx, eyeY, er + 1.4, K); px(g, lx - 1, eyeY - 1, '#fff'); px(g, rx - 1, eyeY - 1, '#fff'); ellipsePx(g, cx, my + 1, s(3), s(3), K); break;
    case 'relax': arc(lx, false); arc(rx, false); cheek(cx - s(15)); cheek(cx + s(15)); px(g, cx - s(2), my, K); hline(g, cx - s(1), cx + s(1), my + 1, K); px(g, cx + s(2), my, K); break;
    case 'happy':
      arc(lx); arc(rx); cheek(cx - s(15)); cheek(cx + s(15));
      hline(g, cx - s(5), cx + s(5), my - 1, K); rect(g, cx - s(4), my, s(8) + 1, Math.max(2, s(3)), '#5a1a2a'); rect(g, cx - s(2), my + Math.max(1, s(2)), s(5), Math.max(2, s(4)), RAMP.pink[2]); break;
    default: // proud
      round(lx); round(rx); cheek(cx - s(15)); cheek(cx + s(15));
      if (k >= .8) { drawStar(g, lx + 1, eyeY - 1, 1.6, '#ffffff'); }
      hline(g, cx - s(4), cx + s(4), my, K); px(g, cx - s(5), my - 1, K); px(g, cx + s(5), my - 1, K);
  }
}
function prepKnot(g, x, y, hp) {
  const r = 4 + hp * .5;
  disc(g, x, y, r + 1, INK); disc(g, x, y, r, '#5a3d17');
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + x; ringPx(g, x + Math.cos(a) * r * .3, y + Math.sin(a) * r * .3, r * .55, '#8a6534'); }
}
// the mud crust it arrives in (breaks at the start)
function prepCrust() { return mdl('prepCrust', () => { const M = RAMP.mud, bodyS = SD.smooth(8, SD.ellipse(52, 56, 42, 40), SD.ellipse(52, 90, 46, 18)); return model(104, 112, [{ f: SD.shag(bodyS, 2, .15, 4), fs: bodyS, ramp: M, z: 0, th: 30, tex: clumpTex(6, .35, 4, 1) }], { post: g => { for (const ex of [40, 64]) { disc(g, ex, 50, 5, INK); disc(g, ex, 50, 4, '#fff27a'); px(g, ex + 1, 51, INK); } } }); }); }

// which cells are dog in ANY of her states (the brush, the dryer and the clipper all work on this map)
function prepCells(cs = 8) {
  return mdl('prepCells:' + cs, () => {
    const pics = ['scruffy', 'brushed', 'wet', 'frizzy', 'clean'].map(st => prepDog(st)), W = pics[0].width, H = pics[0].height;
    const data = pics.map(p => p.g.getImageData(0, 0, W, H).data), cols = Math.ceil(W / cs), rows = Math.ceil(H / cs);
    const inside = new Uint8Array(cols * rows); let n = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      let hits = 0;
      for (let yy = 1; yy < cs; yy += 3) for (let xx = 1; xx < cs; xx += 3) { const x = i * cs + xx, y = j * cs + yy; if (x < W && y < H && data.some(d => d[(y * W + x) * 4 + 3] > 0)) hits++; }
      if (hits >= 3) { inside[j * cols + i] = 1; n++; }
    }
    return { cols, rows, cs, inside, n };
  });
}
const _prepTmp = { c: null };
// draw state A, then state B only where cells are revealed (soft pixel discs)
function prepReveal(g, A, B, grid, cells, x, y) {
  g.drawImage(A, rd(x), rd(y));
  if (!_prepTmp.c || _prepTmp.c.width < B.width || _prepTmp.c.height < B.height) _prepTmp.c = mkCanvas(Math.max(B.width, 120), Math.max(B.height, 120));
  const t = _prepTmp.c, tg = t.g;
  tg.globalCompositeOperation = 'source-over'; tg.clearRect(0, 0, t.width, t.height);
  tg.fillStyle = '#000';
  for (let j = 0; j < cells.rows; j++) for (let i = 0; i < cells.cols; i++) if (grid[j * cells.cols + i] >= 1) disc(tg, i * cells.cs + cells.cs / 2, j * cells.cs + cells.cs / 2, cells.cs * .78);
  tg.globalCompositeOperation = 'source-in'; tg.drawImage(B, 0, 0);
  tg.globalCompositeOperation = 'source-over';
  g.drawImage(t, 0, 0, B.width, B.height, rd(x), rd(y), B.width, B.height);
}
function prepCoverage(grid, cells, want = 1) { let n = 0; for (let i = 0; i < grid.length; i++) if (cells.inside[i] && grid[i] >= want) n++; return n / Math.max(1, cells.n); }
// hit all cells within radius r of (px, py) in the picture's frame
function prepPaint(grid, cells, ox, oy, px0, py0, r, amt, cap = 1) {
  let changed = 0;
  const c0 = Math.max(0, fl((px0 - ox - r) / cells.cs)), c1 = Math.min(cells.cols - 1, fl((px0 - ox + r) / cells.cs));
  const r0 = Math.max(0, fl((py0 - oy - r) / cells.cs)), r1 = Math.min(cells.rows - 1, fl((py0 - oy + r) / cells.cs));
  for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) {
    const cx0 = ox + i * cells.cs + cells.cs / 2, cy0 = oy + j * cells.cs + cells.cs / 2, idx = j * cells.cols + i;
    if (!cells.inside[idx] || dist(cx0, cy0, px0, py0) > r + cells.cs * .5) continue;
    if (amt > 0 ? grid[idx] < cap : grid[idx] > 0) { grid[idx] = clamp(grid[idx] + amt, 0, cap); changed++; }
  }
  return changed;
}

// ---------------------------------------------------------------- rooms -----
function prepZigzag(g, y, flipIt) {
  rect(g, 0, y, SW, 8, PREP_MINT[2]); rect(g, 0, flipIt ? y : y + 7, SW, 1, PREP_MINT[1]);
  for (let x = -4; x < SW; x += 8) { const pts = flipIt ? [[x, y + 8], [x + 4, y + 3], [x + 8, y + 8]] : [[x, y], [x + 4, y + 5], [x + 8, y]]; polyPx(g, pts, '#9a6a44'); }
}
function prepTableRoom() {
  return mdl('prepTableRoom', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    rect(g, 0, 0, SW, SH, '#ece3cf');
    for (let j = 0; j * 10 < 150; j++) { hline(g, 0, SW, j * 10 + 9, '#dcd0b6'); for (let x = (j % 2) * 12; x < SW; x += 24) vline(g, x, j * 10, j * 10 + 9, '#dcd0b6'); }
    // gilt mirror with dark green glass and a streak of reflection
    rect(g, 44, 18, 168, 76, '#3d5a45'); rect(g, 44, 18, 168, 12, '#46654f');
    for (let i = 0; i < 3; i++) linePx(g, 150 + i * 5, 18, 118 + i * 5, 93, '#5a7a62');
    PORTAL_FRAMES.mirror(g, 44, 18, 168, 76, 0);
    woodFloor(g, 0, 148, SW, 44); rect(g, 0, 146, SW, 2, '#b9a98a');
    prepZigzag(g, 0, false); prepZigzag(g, SH - 8, true);
    return c;
  });
}
function prepTable(g, x, y) {
  // mint grooming table with a scissor base and the grooming arm (x, y) = top centre
  const M = PREP_MINT;
  // arm
  rect(g, x - 58, y - 72, 5, 72, INK); rect(g, x - 57, y - 71, 3, 70, M[1]); px(g, x - 57, y - 71, M[3]);
  rect(g, x - 58, y - 74, 52, 5, INK); rect(g, x - 57, y - 73, 50, 3, M[1]);
  ringPx(g, x - 14, y - 60, 5, INK); ringPx(g, x - 14, y - 60, 4, M[2]); vline(g, x - 14, y - 70, y - 65, INK);
  // scissor legs
  thickLine(g, x - 44, y + 8, x + 44, y + 36, 2.5, INK); thickLine(g, x + 44, y + 8, x - 44, y + 36, 2.5, INK);
  thickLine(g, x - 44, y + 8, x + 44, y + 36, 1.5, M[1]); thickLine(g, x + 44, y + 8, x - 44, y + 36, 1.5, M[1]);
  rect(g, x - 52, y + 35, 104, 5, INK); rect(g, x - 51, y + 36, 102, 3, M[1]);
  // top slab
  rect(g, x - 64, y - 1, 128, 11, INK); rect(g, x - 63, y, 126, 9, M[2]); rect(g, x - 63, y, 126, 2, M[4]); rect(g, x - 63, y + 7, 126, 2, M[1]);
}
function prepShowerRoom() {
  return mdl('prepShowerRoom', () => {
    const c = mkCanvas(SW, SH), g = c.g, T = '#f4eee2', L = '#cfc5b1', D = '#e5ddcc';
    const bx0 = 60, bx1 = 196, by0 = 18, by1 = 128, vx = 128, vy = 72;
    rect(g, 0, 0, SW, SH, D);
    // side walls (perspective)
    polyPx(g, [[0, 0], [bx0, by0], [bx0, by1], [0, SH]], '#ebe4d4'); polyPx(g, [[SW, 0], [bx1, by0], [bx1, by1], [SW, SH]], '#ebe4d4');
    for (let i = 1; i < 10; i++) { const k = i / 10; linePx(g, 0, lerp(0, SH, k), bx0, lerp(by0, by1, k), L); linePx(g, SW, lerp(0, SH, k), bx1, lerp(by0, by1, k), L); }
    for (let i = 1; i < 4; i++) { const x = bx0 * i / 4; vline(g, x, lerp(0, by0, i / 4), lerp(SH, by1, i / 4), L); vline(g, SW - x, lerp(0, by0, i / 4), lerp(SH, by1, i / 4), L); }
    // back wall tiles
    rect(g, bx0, by0, bx1 - bx0, by1 - by0, T);
    for (let y = by0; y < by1; y += 9) { hline(g, bx0, bx1, y, L); for (let x = bx0 + ((y - by0) / 9 % 2) * 8; x < bx1; x += 16) vline(g, x, y, Math.min(by1, y + 9), L); }
    // floor tiles converging to the vanishing point
    polyPx(g, [[bx0, by1], [bx1, by1], [SW, SH], [0, SH]], '#efe8d9');
    for (let i = -6; i <= 6; i++) linePx(g, vx + i * 11, by1, vx + i * 42, SH, L);
    for (const yy of [138, 152, 170]) hline(g, 0, SW, yy, L);
    rect(g, bx0, by0, 1, by1 - by0, '#b9ae98'); rect(g, bx1, by0, 1, by1 - by0, '#b9ae98'); hline(g, bx0, bx1, by1, '#b9ae98');
    ellipsePx(g, 128, 162, 9, 3, '#9a9282'); ellipsePx(g, 128, 162, 7, 2, '#6b6477'); void vy;
    // hose hook + a Westie BLVRD sticker
    rect(g, 82, 34, 6, 4, INK); rect(g, 83, 35, 4, 2, '#6b6977');
    prepZigzag(g, 0, false); prepZigzag(g, SH - 8, true);
    return c;
  });
}
function prepTillRoom() {
  return mdl('prepTillRoom', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    // big window onto Viladomat: sky, a plane tree, a parked car, the façade opposite
    rect(g, 0, 0, SW, SH, '#20303a');
    rect(g, 6, 10, 244, 100, INK); bandsV(g, 7, 11, 242, 98, ['#8fc6ee', '#a9d4f2', '#c4e2f5']);
    eixampleFacade(g, 7, 40, 242, 60, 5);
    planeTrunk(g, 40, 30, 100, 8); for (let i = 0; i < 10; i++) disc(g, 30 + hash2(i, 2) * 40, 22 + hash2(2, i) * 16, 9, i % 2 ? '#5a8f3e' : '#6fa64a');
    // a little blue car
    const cx0 = 176, cy0 = 88; rect(g, cx0 - 24, cy0 - 8, 48, 14, INK); rect(g, cx0 - 23, cy0 - 7, 46, 12, '#3565cc'); rect(g, cx0 - 14, cy0 - 16, 26, 9, INK); rect(g, cx0 - 13, cy0 - 15, 24, 8, '#a8d8ff'); disc(g, cx0 - 14, cy0 + 6, 5, INK); disc(g, cx0 + 14, cy0 + 6, 5, INK); disc(g, cx0 - 14, cy0 + 6, 2, '#9896a4'); disc(g, cx0 + 14, cy0 + 6, 2, '#9896a4');
    rect(g, 7, 100, 242, 9, '#8f8a82');
    for (let x = 6; x < 250; x += 61) rect(g, x, 10, 3, 100, INK);
    // counter
    rect(g, 0, 126, SW, 66, '#2b2025'); rect(g, 0, 126, SW, 4, '#4a3a3e'); rect(g, 0, 129, SW, 1, INK);
    return c;
  });
}
// the reception: laptop POS + card terminal + cash drawer
function prepLaptop(g, x, y, S, t) {
  // screen
  rect(g, x - 47, y - 44, 94, 46, INK); rect(g, x - 45, y - 42, 90, 42, '#dfe8f0'); rect(g, x - 45, y - 42, 90, 8, '#3565cc');
  tiny(g, 'ARTICULO', x - 42, y - 40, '#ffffff');
  txt(g, 'Arreglo completo', x - 42, y - 31, INK); txt(g, S.amount, x + 42, y - 20, INK, { align: 'r', bold: true });
  hline(g, x - 42, x + 42, y - 9, '#9896a4'); tiny(g, 'TOTAL', x - 42, y - 7, '#6b6977');
  // base / keyboard
  polyPx(g, [[x - 50, y + 2], [x + 50, y + 2], [x + 56, y + 12], [x - 56, y + 12]], INK); polyPx(g, [[x - 49, y + 3], [x + 49, y + 3], [x + 54, y + 11], [x - 54, y + 11]], '#9896a4');
  for (let i = -46; i < 46; i += 6) hline(g, x + i, x + i + 3, y + 7, '#6b6977');
  void t;
}
function prepMaite(g, x, y, ex, t) {
  // the client: blonde bob, green top, behind the counter (x, y) = chin
  const img = mdl('prepMaite', () => model(56, 64, [
    { f: SD.ellipse(28, 22, 16, 18), ramp: RAMP.yellow, z: 0, th: 10 },
    { f: SD.box(28, 58, 19, 14, 7), ramp: RAMP.mint, z: 1, th: 10 },
    { f: SD.box(28, 40, 4, 5, 2), ramp: RAMP.skin, z: 1.5, th: 3 },
    { f: SD.smooth(3, SD.ellipse(28, 26, 11, 13), SD.ellipse(28, 32, 8, 7)), ramp: RAMP.skin, z: 2, th: 8 },
    { f: SD.sub(SD.ellipse(28, 20, 13, 11), SD.ellipse(28, 30, 11, 12)), ramp: RAMP.yellow, z: 3, th: 6 },
  ]));
  drawS(g, img, x, y + Math.sin(t * 2) * 1, { ax: .5, ay: .55 });
  const fx = rd(x), fy = rd(y + Math.sin(t * 2) * 1 - 10);
  if (ex === 'happy') { px(g, fx - 5, fy, INK); px(g, fx - 4, fy - 1, INK); px(g, fx - 3, fy, INK); px(g, fx + 3, fy, INK); px(g, fx + 4, fy - 1, INK); px(g, fx + 5, fy, INK); hline(g, fx - 3, fx + 3, fy + 6, '#8c1d30'); hline(g, fx - 2, fx + 2, fy + 7, '#c02d45'); }
  else { rect(g, fx - 5, fy - 1, 2, 3, INK); rect(g, fx + 3, fy - 1, 2, 3, INK); hline(g, fx - 2, fx + 2, fy + 6, '#8c1d30'); }
  rect(g, fx - 8, fy + 3, 3, 2, '#f29aa8'); rect(g, fx + 6, fy + 3, 3, 2, '#f29aa8');
}
// the tools that follow the finger
function prepBrush(g, x, y, rot) { const img = mdl('prepBrush', () => spr([
  '..kkkkkkkkkkkk..',
  '.kwwwwwwwwwwwwk.',
  '.kw.w.w.w.w.wwk.',
  '.kw.w.w.w.w.wwk.',
  '.kkkkkkkkkkkkkk.',
  '......kook......',
  '......kook......',
  '......kook......',
  '......kook......',
  '......kOOk......',
  '......kOOk......',
  '.......kk.......'], { k: INK, w: '#dfe3f1', o: '#f07820', O: '#b0480f' })); drawS(g, img, x, y, { ax: .5, ay: .15, rot, s: 1.7 }); }
function prepBottle(g, x, y, press) {
  const sq = press * 3;
  rect(g, x - 11, y - 34 + sq, 22, 40 - sq, INK); rect(g, x - 10, y - 33 + sq, 20, 38 - sq, PREP_MINT[2]); rect(g, x - 10, y - 33 + sq, 4, 38 - sq, PREP_MINT[3]);
  disc(g, x, y - 12 + sq / 2, 7, '#fffaf0'); ringPx(g, x, y - 12 + sq / 2, 7, RAMP.green[2]); drawS(g, westieMini(), x, y - 14 + sq / 2, {});
  rect(g, x - 3, y - 44 + sq * 1.5, 6, 10, INK); rect(g, x - 2, y - 43 + sq * 1.5, 4, 9, '#ffffff');
  rect(g, x - 2, y - 47 + sq * 1.5, 12, 4, INK); rect(g, x - 1, y - 46 + sq * 1.5, 10, 2, '#ffffff');
  tiny(g, 'WESTIE', x, y - 2, '#ffffff', { align: 'c' });
}
function prepHands(g, x, y, t) {
  const img = mdl('prepHands', () => spr([
    '...k.k.k.k...',
    '..kskskskskk.',
    '..kskskskskk.',
    '..kskskskskk.',
    '.kkssssssssk.',
    'ksk.sssssssk.',
    'kssssssssssk.',
    '.kssssssssk..',
    '..kssssssk...',
    '...kkkkkk....'], { k: INK, s: '#f1bea6' }));
  drawS(g, img, x + Math.sin(t * 30) * 2, y, { s: 2.2 });
}
function prepShower(g, x, y, on, t) {
  // hose from the wall hook to the head at (x, y)
  const hx = 85, hy = 38;
  for (let i = 0; i <= 20; i++) { const k = i / 20, px0 = lerp(hx, x, k), py0 = lerp(hy, y, k) + Math.sin(k * Math.PI) * 26; disc(g, px0, py0, 2.4, INK); }
  for (let i = 0; i <= 20; i++) { const k = i / 20, px0 = lerp(hx, x, k), py0 = lerp(hy, y, k) + Math.sin(k * Math.PI) * 26; disc(g, px0, py0, 1.2, '#44424f'); }
  disc(g, x, y, 11, INK); disc(g, x, y, 10, '#2b2540'); disc(g, x, y + 1, 7, '#6b6977'); disc(g, x - 3, y - 3, 3, '#9896a4');
  for (let i = -3; i <= 3; i++) px(g, x + i * 2, y + 5, '#9bd6f7');
  if (on) for (let i = 0; i < 9; i++) { const ox = (i - 4) * 2.5, ph = (t * 8 + i * .37) % 1; for (let q = 0; q < 5; q++) px(g, x + ox * (1 + ph), y + 8 + ph * 60 + q * 2, q % 2 ? '#5aaee6' : '#9bd6f7'); }
}
function prepDryer(g, x, y, ang, on, t) {
  const img = mdl('prepDryer', () => { const c = mkCanvas(46, 40), q = c.g; const M = PREP_MINT;
    rect(q, 16, 20, 9, 18, INK); rect(q, 17, 21, 7, 16, M[1]); // handle
    disc(q, 17, 14, 13, INK); disc(q, 17, 14, 12, M[2]); disc(q, 14, 11, 7, M[3]); // body
    rect(q, 24, 7, 20, 14, INK); rect(q, 24, 8, 19, 12, M[2]); rect(q, 24, 8, 19, 3, M[3]); // barrel
    rect(q, 42, 6, 4, 16, INK); ringPx(q, 17, 14, 5, M[1]); return c; });
  drawS(g, img, x, y, { ax: .35, ay: .35, rot: ang + (on ? Math.sin(t * 50) * .03 : 0) });
}
function prepClipper(g, x, y, rot, on, t) {
  const img = mdl('prepClipper', () => spr([
    '.kkkkkkkkkk.',
    'kwkwkwkwkwwk',
    'kssssssssssk',
    'krrrrrrrrrRk',
    'krRRrrrrrrRk',
    'krRRrrrrrrRk',
    'krrrrrrrrrRk',
    'krrrrrrrrrRk',
    'krrrrrrrrrRk',
    '.krrrrrrrRk.',
    '..krrrrrRk..',
    '...kkkkkk...',
    '.....kk.....',
    '.....kk.....'], { k: INK, w: '#e1e7f2', s: '#a5afc4', r: '#b3202e', R: '#e8505e' }));
  drawS(g, img, x + (on ? Math.sin(t * 90) : 0), y, { ax: .5, ay: .1, rot, s: 1.8 });
}
function prepTerminal(g, x, y, S, press) {
  // the card terminal ("datáfono"): screen + keypad (big keys for thumbs)
  rect(g, x - 34, y - 4, 68, 118, INK); rect(g, x - 33, y - 3, 66, 116, '#2b2540'); rect(g, x - 33, y - 3, 66, 3, '#44424f');
  rect(g, x - 28, y + 2, 56, 18, '#bfe9c8'); txt(g, S.typed || '_', x + 24, y + 7, '#153a24', { align: 'r', bold: true });
  for (const k of prepKeys(x, y, S.level)) {
    const pr = press === k.id;
    panel(g, k.x, k.y + (pr ? 1 : 0), k.w, k.h, k.col, { r: 3, line: INK, hi: '#ffffff', lo: pr ? null : '#1d1424' });
    txt(g, k.label, k.x + k.w / 2, k.y + k.h / 2 - 3 + (pr ? 1 : 0), k.id === 'ok' || k.id === 'cobrar' ? '#ffffff' : INK, { align: 'c', bold: true });
  }
}
function prepKeys(x, y, level) {
  if (level <= 1) return [{ id: 'cobrar', label: 'COBRAR', x: x - 29, y: y + 30, w: 58, h: 40, col: '#35a869' }];
  const keys = [], labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
  labels.forEach((l, i) => keys.push({ id: l === 'OK' ? 'ok' : l, label: l, x: x - 31 + (i % 3) * 21, y: y + 24 + fl(i / 3) * 21, w: 19, h: 19, col: l === 'OK' ? '#35a869' : l === 'C' ? '#ffb020' : '#fff8e6' }));
  return keys;
}

// ---------------------------------------------------------------- transitions
// the "room turn": the old room folds away like a cube face, the new one swings in
function prepTurn(g, from, to, k, dir = 1) {
  const e = E.ioC(k), wOld = SW * (1 - e), wNew = SW * e, slices = 32;
  rect(g, 0, 0, SW, SH, '#20303a');
  const face = (img, x0, w, shrinkLeft) => {
    if (w < 1) return;
    for (let i = 0; i < slices; i++) {
      const u0 = i / slices, u1 = (i + 1) / slices, sx = u0 * SW, sw = SW / slices;
      const persp = shrinkLeft ? lerp(.82, 1, u0) : lerp(1, .82, u0);
      const h = SH * lerp(1, persp, Math.min(1, (1 - w / SW) * 1.6)), dy = (SH - h) / 2;
      g.drawImage(img, sx, 0, sw, SH, rd(x0 + u0 * w), rd(dy), Math.ceil(w * (u1 - u0)) + 1, rd(h));
    }
  };
  if (dir > 0) { face(from, 0, wOld, false); face(to, wOld, wNew, true); }
  else { face(to, 0, wNew, false); face(from, wNew, wOld, true); }
  // a crease of shadow where the faces meet
  const cxp = dir > 0 ? wOld : wNew; g.globalAlpha = .35; rect(g, cxp - 2, 0, 4, SH, INK); g.globalAlpha = 1;
}
// door wipe: two mint panels close/open over the scene (k: 0 open → 1 shut)
function prepDoors(g, k) {
  if (k <= 0) return;
  const w = rd(SW / 2 * E.outC(Math.min(1, k)));
  for (const side of [0, 1]) {
    const x0 = side ? SW - w : 0;
    rect(g, x0, 0, w, SH, PREP_MINT[2]);
    for (let y = 12; y < SH; y += 24) { ringRect(g, x0 + (side ? 6 : w - 34), y, 28, 18, 1, PREP_MINT[1]); }
    rect(g, side ? x0 : x0 + w - 2, 0, 2, SH, INK);
    disc(g, side ? x0 + 8 : x0 + w - 9, SH / 2, 3, RAMP.gold[3]);
  }
}

// ---------------------------------------------------------------- sounds ----
SFX.prepBuzz = (t, d, p, v) => { const g = gainTo(filt('lowpass', 2400, 1, d), 0); g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.12 * v, t + .01); g.gain.linearRampToValueAtTime(.001, t + .09); osc('sawtooth', 118 * p, t, t + .1, g); osc('square', 236 * p, t, t + .1, gainTo(g, .3)); };
SFX.prepBlow = (t, d, p, v) => { const bp = filt('bandpass', 900 * p, .5, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(.3 * v, t + .03); g.gain.linearRampToValueAtTime(.001, t + .18); noiseSrc(t, t + .2, g, .6); };
SFX.prepPump = (t, d, p, v) => { SFX.squish(t, d, 1.4 * p, .8 * v); INST.w(0, t + .02, 0, .5 * v, d); };
SFX.prepKaching = (t, d, p, v) => { INST.b(0, t, 0, 1.2 * v, d); INST.bell(2093 * p, t + .05, .2, 1 * v, d); INST.bell(2637 * p, t + .12, .4, 1 * v, d); for (let i = 0; i < 6; i++) SFX.coin(t + .1 + i * .06, d, 1 + i * .08, .5 * v); };

const PREP_PH = [
  ['¡CEPILLA!', 'Quítale los nudos', 'rub'], ['¡CHAMPÚ!', 'Toca el bote encima', 'tap'], ['¡FROTA!', 'Mucha espuma', 'rub'],
  ['¡ACLARA!', 'Pasa la ducha', 'drag'], ['¡SECA!', 'Rodéala con el secador', 'drag'], ['¡CORTA!', 'Repasa con la máquina', 'drag'], ['¡COBRA!', 'Diez euros', 'tap']];
const PREP_SONG = { spb: 4, loop: true, tracks: [
  { i: 'brass', v: .55, n: 'C5 . E5 G5 . E5 D5 . C5 . A4 . G4 - . . C5 . E5 G5 . A5 G5 . E5 . D5 . C5 - . . F5 . E5 D5 . C5 A4 . G4 . E4 . G4 - A4 . C5 . D5 . E5 . G5 . A5 . G5 . C6! - . .' },
  { i: 'p25', v: .3, n: 'E4 . G4 . C5 . G4 . F4 . A4 . C5 . A4 . E4 . G4 . C5 . G4 . G4 . B4 . D5 . B4 . F4 . A4 . C5 . A4 . E4 . G4 . C5 . G4 . G4 . B4 . D5 . F5 . E5 - . .' },
  { i: 'bass', v: .9, n: 'C3 . C3 G2 . C3 E3 . F2 . F2 C3 . F2 A2 . C3 . C3 G2 . C3 E3 . G2 . G2 D3 . G2 B2 . F2 . F2 C3 . F2 A2 . C3 . C3 G2 . C3 E3 . G2 . G2 D3 . G2 B2 . C3 . G2 . C3! - . .' },
  { i: 'd', v: .85, n: 'k . h s . k s h k . h s k s s h k . h s . k s h k . h s k s s h k . h s . k s h k . h s k s s h k . h s . k s h k k s s s s s+x .' }] };

// ---------------------------------------------------------------- the boss --
const PREP_TABLE = { x: 128, y: 120 };           // table top centre
const PREP_DOG_T = { x: 128, y: 120 };           // dog anchor on the table (feet)
const PREP_DOG_S = { x: 128, y: 170 };           // dog anchor in the shower
defMG({
  id: 'prepara', stage: 'superwestie', boss: true, name: '¡Prepara el perro!', cmd: '¡PREPARA EL PERRO!', how: 'El servicio completo: cepilla, champú, frota, aclara, seca, corta… y cobra', mech: 'mix', beats: 16,
  song: () => PREP_SONG,
  init(g) {
    g.ph = 0; g.phT = 0; g.room = 'table'; g.turn = null; g.patience = 100; g.enterT = 0; g.cmdT = 0;
    g.drain = [.9, 1.2, 1.5][g.level - 1];
    g.piles = []; g.tufts = [];
    // phase grids (built lazily from the dog pictures)
    const cells = prepCells();
    g.cells = cells; g.grid = new Float32Array(cells.cols * cells.rows);
    g.knots = []; const nk = [3, 4, 5][g.level - 1];
    for (let i = 0; i < nk; i++) { let cx0, cy0, tries = 0; do { cx0 = g.ri(2, cells.cols - 3); cy0 = g.ri(3, cells.rows - 3); tries++; } while (!cells.inside[cy0 * cells.cols + cx0] && tries < 60); g.knots.push({ x: cx0 * cells.cs + 4, y: cy0 * cells.cs + 4, hp: 8 + g.level * 2 }); }
    g.bottle = { x: 128, dir: 1, press: 0, hits: 0, need: [3, 4, 5][g.level - 1] }; g.blobs = [];
    g.foam = new Float32Array(cells.cols * cells.rows); g.puddle = 0;
    g.shower = { x: 92, y: 44, on: false };
    g.dry = new Float32Array(cells.cols * cells.rows); g.puffs = []; g.puffT = 0; g.dryer = { x: 40, y: 70, ang: 0 };
    g.clip = new Float32Array(cells.cols * cells.rows); g.clipT = 0;
    g.pay = { amount: '10,00 €', typed: '', paid: -1, level: g.level, press: null, wrong: 0 };
    g.crust = 1; g.drop = 0;
    g.tool = { x: 128, y: 96 };
  },
  // where the dog picture sits right now (top-left of its 104x112 canvas)
  dogXY(g) { const A = g.room === 'shower' ? PREP_DOG_S : PREP_DOG_T; return [A.x - 52, A.y - 110]; },
  next(g) {
    g.ph++; g.phT = 0; g.cmdT = 0;
    sfx('good'); sfx('sparkle'); HITSTOP = 4; g.shake(2, .2);
    const [dx, dy] = this.dogXY(g); g.fx.burst(dx + 52, dy + 56, 16, { k: 'star', c: ['#fff27a', '#ffffff', '#ffd1e4'], sp0: 60, sp1: 170 });
    g.patience = Math.min(100, g.patience + 12);
    if (g.ph === 1) this.turnTo(g, 'shower', 1);
    if (g.ph === 4) this.turnTo(g, 'table', -1);
    if (g.ph === 6) this.turnTo(g, 'till', 1);
    if (g.ph >= 7) { g.win(); }
  },
  turnTo(g, room, dir) { g.turn = { from: g.room, to: room, t: 0, dir }; sfx('whoosh'); },
  roomPic(g, room) { return room === 'shower' ? prepShowerRoom() : room === 'till' ? prepTillRoom() : prepTableRoom(); },
  update(g, dt) {
    g.phT += dt; g.cmdT += dt; g.enterT += dt;
    for (const b of g.bottle ? [g.bottle] : []) b.press = Math.max(0, b.press - dt * 6);
    // flying fur tufts land on the table or the floor and stay there
    for (const tf of g.tufts) { tf.vy += 420 * dt; tf.x += tf.vx * dt; tf.y += tf.vy * dt; tf.rot += tf.vr * dt;
      const onTable = g.room === 'table' && Math.abs(tf.x - PREP_TABLE.x) < 62, floorY = onTable ? PREP_TABLE.y - 2 : 186;
      if (tf.y >= floorY && tf.vy > 0) { tf.dead = true; if (g.piles.length < 120) { const near = g.piles.filter(p => p.room === g.room && Math.abs(p.x - tf.x) < 6 && p.base === floorY).length; g.piles.push({ x: tf.x, y: floorY - near * 2.2, base: floorY, room: g.room, r: tf.r, col: tf.col, lite: tf.lite, dark: tf.dark, rot: tf.rot }); } } }
    g.tufts = g.tufts.filter(t => !t.dead);
    if (g.turn) { g.turn.t += dt / .75; if (g.turn.t >= 1) { g.room = g.turn.to; g.turn = null; g.cmdT = 0; } return; }
    if (g.state !== 'play') return;
    if (g.enterT < .9) return; // doors + the crust falling off
    g.patience = Math.max(0, g.patience - dt * g.drain * (g.ph === 6 ? .5 : 1));
    if (g.patience <= 0) { g.lose(); sfx('whine'); sfx('bark', { n: 3, pitch: .8 }); g.shake(5, .5); return; }
    const [dx, dy] = this.dogXY(g), C = g.cells;
    const moving = IN.down && Math.hypot(IN.dx, IN.dy) > .6;
    if (IN.down) { g.tool.x = lerp(g.tool.x, IN.x, .6); g.tool.y = lerp(g.tool.y, IN.y, .6); }
    switch (g.ph) {
      case 0: { // ¡CEPILLA!
        if (!moving) break;
        const hx = g.tool.x, hy = g.tool.y + 4;
        const n = prepPaint(g.grid, C, dx, dy, hx, hy, 11, .34, 1);
        for (const kn of g.knots) if (kn.hp > 0 && dist(hx, hy, dx + kn.x, dy + kn.y) < 12) { kn.hp -= 1; if (FRAME % 3 === 0) sfx('rub', { pitch: .7 }); if (kn.hp <= 0) { sfx('pop', { pitch: .6 }); HITSTOP = 2; this.tuft(g, dx + kn.x, dy + kn.y, 6, PREP_DIRTY); } }
        if (n && FRAME % 2 === 0) this.tuft(g, hx, hy, 1, PREP_DIRTY);
        if (FRAME % 6 === 0) sfx('rub', { pitch: 1 + Math.random() * .3 });
        if (prepCoverage(g.grid, C) > .86 && g.knots.every(k => k.hp <= 0)) this.next(g);
        break;
      }
      case 1: { // ¡CHAMPÚ!: the bottle swings, tap when it's over her
        const B = g.bottle, sp = [60, 80, 100][g.level - 1] * g.tempo;
        B.x += B.dir * sp * dt; if (B.x < 44 || B.x > 212) { B.dir *= -1; B.x = clamp(B.x, 44, 212); }
        if (IN.tap) { B.press = 1; sfx('prepPump'); g.blobs.push({ x: B.x, y: 46, vy: 40, hit: Math.abs(B.x - PREP_DOG_S.x) < 26 }); }
        for (const b of g.blobs) { if (b.done) continue; b.vy += 600 * dt; b.y += b.vy * dt; const target = b.hit ? PREP_DOG_S.y - 70 : 150;
          if (b.y >= target) { b.done = true; if (b.hit) { B.hits++; sfx('squish', { pitch: 1.3 }); prepPaint(g.foam, C, dx, dy, b.x, b.y + 8, 12, .6, 1); g.fx.burst(b.x, b.y, 8, { k: 'bubble', c: '#c8f0de', sp0: 20, sp1: 70, r: 2 }); if (B.hits >= B.need) this.next(g); }
            else { g.patience -= 8; sfx('splash', { pitch: 1.6, vol: .5 }); g.fx.add({ k: 'txt', s: '¡Fuera!', x: b.x, y: b.y - 12, life: .6, c: '#ffffff' }); } } }
        g.blobs = g.blobs.filter(b => !b.done || false);
        break;
      }
      case 2: { // ¡FROTA!: rub the foam all over
        if (!moving) break;
        const n = prepPaint(g.foam, C, dx, dy, g.tool.x, g.tool.y, 12, .28, 1);
        // foam spreads a little to its neighbours
        if (n && FRAME % 5 === 0) for (let i = 0; i < g.foam.length; i++) if (g.foam[i] >= 1) { const c0 = i % C.cols, r0 = fl(i / C.cols); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (r0 + b) * C.cols + c0 + a; if (C.inside[j] && g.foam[j] < 1 && Math.random() < .05) g.foam[j] = 1; } }
        if (n && FRAME % 3 === 0) { g.fx.add({ k: 'bubble', x: g.tool.x + g.r(-10, 10), y: g.tool.y + g.r(-8, 8), vy: -30, life: .6, r: g.r(1.5, 3), c: '#e8fff4' }); sfx('fizz', { vol: .3 }); }
        if (prepCoverage(g.foam, C) > .86) this.next(g);
        break;
      }
      case 3: { // ¡ACLARA!: the shower rinses what's under its stream
        const S = g.shower; S.on = IN.down;
        if (IN.down) { S.x = lerp(S.x, IN.x, .5); S.y = lerp(S.y, clamp(IN.y, 30, 110), .5); }
        else { S.x = lerp(S.x, 92, .15); S.y = lerp(S.y, 44, .15); }
        if (S.on) {
          let n = 0; for (let yy = S.y + 10; yy < S.y + 72; yy += 8) n += prepPaint(g.foam, C, dx, dy, S.x, yy, 11, -.18, 1);
          g.puddle = Math.min(1, g.puddle + dt * .15);
          if (FRAME % 4 === 0) { sfx('drip', { pitch: .8 + Math.random() * .6, vol: .4 }); g.fx.add({ k: 'drop', x: S.x + g.r(-12, 12), y: Math.min(S.y + 70, 168), vx: g.r(-60, 60), vy: -g.r(40, 100), g: 400, life: .5, c: '#9bd6f7' }); }
          if (n && FRAME % 6 === 0) g.fx.add({ k: 'bubble', x: S.x + g.r(-10, 10), y: S.y + 50, vy: 20, life: .4, r: 2, c: '#c8f0de' });
        }
        if (prepCoverage(g.foam, C, .05) < .07) this.next(g);
        break;
      }
      case 4: { // ¡SECA!: circle around her with the dryer; the air frizzes where it lands
        const D = g.dryer;
        if (IN.down) { D.x = lerp(D.x, IN.x, .5); D.y = lerp(D.y, IN.y, .5); }
        const cx0 = dx + 52, cy0 = dy + 64, vx = cx0 - D.x, vy = cy0 - D.y, dd = Math.hypot(vx, vy) || 1;
        D.ang = Math.atan2(vy, vx);
        if (IN.down) { g.puffT -= dt; if (g.puffT <= 0) { g.puffT = .09; const reach = clamp(dd - 22, 8, 40); const ix = cx0 - vx / dd * reach, iy = cy0 - vy / dd * reach; g.puffs.push({ x: D.x + Math.cos(D.ang) * 20, y: D.y + Math.sin(D.ang) * 20, tx: ix, ty: iy, t: 0 }); sfx('prepBlow', { pitch: .9 + Math.random() * .2, vol: .5 }); } }
        for (const p of g.puffs) { p.t += dt * 3.2; if (p.t >= 1 && !p.done) { p.done = true; const n = prepPaint(g.dry, C, dx, dy, p.tx, p.ty, 15, .5, 1); if (n) { for (let i = 0; i < 3; i++) g.fx.add({ k: 'drop', x: p.tx, y: p.ty, vx: g.r(-90, 90) + vx / dd * 60, vy: -g.r(20, 120), g: 380, life: .5, c: '#9bd6f7' }); } } }
        g.puffs = g.puffs.filter(p => p.t < 1.4);
        if (prepCoverage(g.dry, C) > .86) { this.next(g); sfx('boing', { pitch: .9 }); }
        break;
      }
      case 5: { // ¡CORTA!: the clipper tidies the frizz
        if (!moving) break;
        const n = prepPaint(g.clip, C, dx, dy, g.tool.x, g.tool.y - 6, 10, .5, 1);
        g.clipT -= dt; if (g.clipT <= 0) { g.clipT = .07; sfx('prepBuzz', { pitch: .9 + (n ? .2 : 0) }); }
        if (n && FRAME % 2 === 0) this.tuft(g, g.tool.x, g.tool.y - 6, 1, PREP_CLEAN);
        if (prepCoverage(g.clip, C) > .9) { this.next(g); sfx('ding'); }
        break;
      }
      case 6: { // ¡COBRA!: charge the ten euros
        const P = g.pay; if (P.paid >= 0) { if (g.phT - P.paid > 1.1) this.next(g); break; }
        const keys = prepKeys(206, 64, P.level);
        for (const k of keys) {
          const hit = IN.x >= k.x && IN.x < k.x + k.w && IN.y >= k.y && IN.y < k.y + k.h;
          if (IN.tap && hit) { P.press = k.id; sfx('cursor');
            if (k.id === 'cobrar' || k.id === 'ok') { if (P.level <= 1 || P.typed === '10') this.paid(g); else { P.wrong++; P.typed = ''; g.patience -= 10; sfx('buzz', { vol: .5 }); g.fx.add({ k: 'txt', s: '¡Son 10!', x: 206, y: 70, life: .7, c: '#ffffff' }); } }
            else if (k.id === 'C') P.typed = '';
            else if (P.typed.length < 4) P.typed += k.id; }
        }
        if (IN.rel) P.press = null;
        break;
      }
    }
  },
  paid(g) {
    const P = g.pay; P.paid = g.phT; sfx('prepKaching'); flash('bot', '#fff7ae', .12); HITSTOP = 5; buzz([20, 30, 20]);
    for (let i = 0; i < 26; i++) g.fx.add({ k: 'txt', s: '€', x: g.r(20, 236), y: g.r(-20, 0), vx: g.r(-20, 20), vy: g.r(40, 120), g: 160, life: 1.6, c: '#fff27a' });
  },
  tuft(g, x, y, n, ramp) { for (let i = 0; i < n; i++) g.tufts.push({ x, y, vx: g.r(-120, 120), vy: -g.r(60, 200), rot: g.r(TAU), vr: g.r(-10, 10), r: g.r(2.5, 4.2), col: ramp[3], lite: ramp[4], dark: ramp[1] }); },
  // ------------------------------------------------------------ drawing ----
  drawRoom(g, c, room) {
    c.drawImage(this.roomPic(g, room), 0, 0);
    if (room === 'table') prepTable(c, PREP_TABLE.x, PREP_TABLE.y);
    for (const p of g.piles) if (p.room === room) prepFluff(c, p.x, p.y - 2, p.r, p, p.rot);
    if (room === 'shower' && g.puddle > 0) { ellipsePx(c, PREP_DOG_S.x, PREP_DOG_S.y + 2, 20 + g.puddle * 40, 4 + g.puddle * 5, '#5aaee6'); ellipsePx(c, PREP_DOG_S.x - 6, PREP_DOG_S.y + 1, 10 + g.puddle * 20, 2 + g.puddle * 2, '#9bd6f7'); }
  },
  drawDog(g, c, room) {
    const A = room === 'shower' ? PREP_DOG_S : PREP_DOG_T, dx = A.x - 52, dy = A.y - 110, C = g.cells;
    const ph = g.ph, bob = Math.sin(g.t * 3) * .6;
    if (room === 'till') return;
    if (ph === 0) {
      const drop = clamp((g.enterT - .35) / .35, 0, 1), yy = dy - (1 - E.outBounce(drop)) * 120;
      prepReveal(c, prepDog('scruffy'), prepDog('brushed'), g.grid, C, dx, yy + bob);
      for (const kn of g.knots) if (kn.hp > 0) prepKnot(c, dx + kn.x, yy + kn.y, kn.hp);
      if (g.enterT < .95) { const k = clamp((g.enterT - .6) / .35, 0, 1); if (k < 1) drawS(c, prepCrust(), dx + 52, yy + 56, { alpha: 1 - k, sy: 1 + k * .2 }); }
      if (g.enterT > .6 && g.enterT < .66 && !g.crustFx) { g.crustFx = 1; sfx('stamp'); g.shake(4, .25); for (let i = 0; i < 20; i++) g.fx.add({ k: 'puff', x: dx + 52 + g.r(-40, 40), y: yy + 60 + g.r(-40, 40), vx: g.r(-120, 120), vy: -g.r(20, 160), g: 400, life: .7, r: g.r(3, 6), c: pick(['#5b3a1d', '#7c5530', '#3d2512']) }); }
    } else if (ph <= 3) {
      const base = ph < 3 ? prepDog('brushed', 1, ph === 2 ? 'relax' : 'meh') : prepDog('wet');
      c.drawImage(base, rd(dx), rd(dy + bob));
      // foam: fat mint clouds over the covered cells
      const blobs = [];
      for (let j = 0; j < C.rows; j++) for (let i = 0; i < C.cols; i++) { const f = g.foam[j * C.cols + i]; if (f < .2) continue; blobs.push([dx + i * C.cs + 4 + (hash2(i, j, 5) - .5) * 5, dy + j * C.cs + 4 + bob + (hash2(j, i, 6) - .5) * 5, 3.2 + f * 3.4 + hash2(i, j, 7) * 2 + Math.sin(g.t * 5 + i * .7 + j) * .5]); }
      for (const [x, y, r] of blobs) disc(c, x, y, r + 1.2, '#2f8866');
      for (const [x, y, r] of blobs) disc(c, x, y, r, '#8fd6b5');
      for (const [x, y, r] of blobs) disc(c, x - r * .25, y - r * .3, r * .55, '#c8f0de');
      for (const [x, y, r] of blobs) if (r > 5) px(c, x - r * .4, y - r * .45, '#ffffff');
    } else {
      const A2 = ph === 4 ? prepDog('wet') : prepDog('frizzy'), B2 = ph === 4 ? prepDog('frizzy') : prepDog('clean', 1, ph >= 6 || g.state === 'won' ? 'proud' : 'happy');
      if (ph >= 6) c.drawImage(prepDog('clean', 1, 'proud'), rd(dx), rd(dy + bob));
      else prepReveal(c, A2, B2, ph === 4 ? g.dry : g.clip, C, dx, dy + bob);
      if (ph >= 6 || (ph === 5 && prepCoverage(g.clip, C) > .9)) for (let i = 0; i < 4; i++) { const a = g.t * 2 + i * TAU / 4; drawStar(c, dx + 52 + Math.cos(a) * 40, dy + 50 + Math.sin(a) * 34, 2 + Math.sin(g.t * 9 + i) * 1.2, '#fff27a'); }
    }
  },
  drawTools(g, c) {
    const T = g.tool, ph = g.ph;
    if (g.state !== 'play' && ph < 6) return;
    if (ph === 0) prepBrush(c, T.x, T.y, IN.down ? Math.sin(g.t * 30) * .2 : -.3);
    if (ph === 1) { const B = g.bottle; prepBottle(c, B.x, 60, B.press); for (let y = 70; y < 104; y += 6) px(c, B.x, y, Math.abs(B.x - PREP_DOG_S.x) < 26 ? '#5bd18b' : 'rgba(255,255,255,.6)'); for (const b of g.blobs) if (!b.done) { disc(c, b.x, b.y, 4, INK); disc(c, b.x, b.y, 3, '#5bd18b'); px(c, b.x - 1, b.y - 1, '#e8fff4'); } }
    if (ph === 2 && IN.down) prepHands(c, T.x, T.y, g.t);
    if (ph === 3) prepShower(c, g.shower.x, g.shower.y, g.shower.on, g.t);
    if (ph === 4) { const D = g.dryer; for (const p of g.puffs) { const k = Math.min(1, p.t); const x = lerp(p.x, p.tx, k), y = lerp(p.y, p.ty, k), r = 3 + k * 5; if (p.t < 1.2) { disc(c, x, y, r + 1, '#c8c6d3'); disc(c, x, y, r, '#ffffff'); } } prepDryer(c, D.x, D.y, D.ang, IN.down, g.t); }
    if (ph === 5) prepClipper(c, T.x, T.y - 10, -.5 + (IN.down ? Math.sin(g.t * 20) * .1 : 0), IN.down, g.t);
  },
  drawTill(g, c) {
    const P = g.pay, t = g.t, paid = P.paid >= 0, pk = paid ? clamp((g.phT - P.paid) / .4, 0, 1) : 0;
    prepMaite(c, 62, 104, paid ? 'happy' : 'wait', t);
    // Nube, gleaming, sits on the counter next to her owner
    drawS(c, prepDog('clean', .56, 'proud'), 26, 126, { ax: .5, ay: 1 });
    prepLaptop(c, 122, 124, P, t);
    prepTerminal(c, 206, 64, P, P.press);
    // cash drawer slides out with coins and a banknote when paid
    const dw = rd(pk * 22);
    rect(c, 60, 150 + dw * 0, 136, 12 + dw, INK); rect(c, 61, 151, 134, 10 + dw, '#44424f');
    if (dw > 4) { for (let i = 0; i < 6; i++) { disc(c, 70 + i * 10, 160 + dw * .6, 3, INK); disc(c, 70 + i * 10, 160 + dw * .6, 2.2, i % 2 ? '#e7c35f' : '#c8c6d3'); } rect(c, 140, 156, 34, 12, INK); rect(c, 141, 157, 32, 10, '#8fd6b5'); tiny(c, '10€', 157, 159, '#1f5c4a', { align: 'c' }); }
    // Anahí swings round from the bottom with euros in her eyes
    if (paid) { const ak = spring(g.phT - P.paid, 2.2, 6); drawAnahiFull(c, 132, SH + 150 - ak * 96, 'euro', t); shout(c, '¡KA-CHING!', 128, 30, g.phT - P.paid); }
  },
  draw(g, c) {
    if (g.turn) {
      const from = prepCanvasOnce('prepA'), to = prepCanvasOnce('prepB');
      this.drawScene(g, from.g, g.turn.from); this.drawScene(g, to.g, g.turn.to);
      prepTurn(c, from, to, clamp(g.turn.t, 0, 1), g.turn.dir);
    } else this.drawScene(g, c, g.room);
    // doors open at the start
    if (g.enterT < .5) prepDoors(c, 1 - g.enterT / .5);
    // phase stamp
    if (g.state === 'play' && !g.turn && g.enterT > .9 && g.cmdT < 1.25) {
      const [cmd, sub, mech] = PREP_PH[g.ph] || PREP_PH[0], a = g.cmdT > .95 ? 1 - (g.cmdT - .95) / .3 : 1;
      mord(c, cmd, SW / 2, 14, fitMord(cmd, 200, { u: 1.9, r: 2.1, rim: 2, sy: 2 }), { anim: i => ({ s: Math.max(0, spring(g.cmdT - i * .03, 2.6, 8)), a }) });
      c.globalAlpha = a; txt(c, sub, SW / 2, 48, '#ffffff', { align: 'c', out: INK }); c.globalAlpha = 1;
      if (typeof drawMechMini === 'function') { c.globalAlpha = a; drawMechMini(c, SW - 22, 26, mech, g.t); c.globalAlpha = 1; }
    }
    if (g.state === 'lost') { c.globalAlpha = .45; rect(c, 0, 0, SW, SH, INK); c.globalAlpha = 1; shout(c, '¡SE HA HARTADO!', SW / 2, 90, g.t - g.decidedAt); }
  },
  drawScene(g, c, room) {
    this.drawRoom(g, c, room);
    if (room === 'till') { this.drawTill(g, c); }
    else { this.drawDog(g, c, room); }
    if (room === g.room && !g.turn) this.drawTools(g, c);
    // flying tufts in the current room
    if (room === g.room) for (const tf of g.tufts) prepFluff(c, tf.x, tf.y, tf.r, tf, tf.rot);
  },
  top(g, c) {
    // HUD: the seven steps, the client's patience, Súper Keiko cheering
    rect(c, 0, 44, SW, SH - 44, '#fff8e6');
    prepZigzag(c, 44, false);
    const icons = ['CEPILLA', 'CHAMPU', 'FROTA', 'ACLARA', 'SECA', 'CORTA', 'COBRA'];
    icons.forEach((l, i) => {
      const x = 12 + i * 34, y = 58, done = i < g.ph, cur = i === g.ph && g.state === 'play';
      panel(c, x, y + (cur ? -2 + Math.sin(g.t * 8) : 0), 30, 26, done ? PREP_MINT[3] : cur ? '#ffdf4f' : '#ffffff', { r: 4, line: INK, lo: '#dce7ea' });
      prepStepIcon(c, i, x + 15, y + 11 + (cur ? -2 + Math.sin(g.t * 8) : 0));
      tiny(c, l, x + 15, y + 29, cur ? INK : '#6b6977', { align: 'c' });
      if (done) { disc(c, x + 26, y + 3, 4, INK); disc(c, x + 26, y + 3, 3, '#35a869'); px(c, x + 25, y + 3, '#ffffff'); px(c, x + 26, y + 4, '#ffffff'); px(c, x + 27, y + 2, '#ffffff'); }
    });
    // client card
    panel(c, 8, 94, 96, 92, '#ffffff', { r: 6, lo: '#dce7ea' });
    const st = g.ph === 0 ? 'scruffy' : g.ph <= 2 ? 'brushed' : g.ph === 3 ? 'wet' : g.ph === 4 ? 'wet' : g.ph === 5 ? 'frizzy' : 'clean';
    const mood = g.patience < 30 ? 'grumpy' : g.patience < 60 ? 'meh' : undefined;
    drawS(c, prepDog(st, .6, g.state === 'won' ? 'proud' : mood), 56, 170, { ax: .5, ay: 1 });
    tiny(c, 'CLIENTA: NUBE', 56, 98, INK, { align: 'c' });
    // patience bar
    panel(c, 110, 94, 138, 34, '#ffffff', { r: 6, lo: '#dce7ea' });
    txt(c, 'PACIENCIA', 118, 99, INK, { bold: true });
    rect(c, 118, 111, 122, 11, INK); rect(c, 119, 112, 120, 9, '#dce7ea');
    const w = rd(120 * g.patience / 100), col = g.patience > 60 ? '#35a869' : g.patience > 30 ? '#ffb020' : '#e23b4e';
    rect(c, 119, 112, w, 9, col); rect(c, 119, 112, w, 2, '#ffffff');
    // Súper Keiko cheering from her corner
    prepKeikoCheer(c, 212, 196, g.t, g.state === 'lost' ? 'sad' : g.patience < 30 ? 'wow' : 'happy');
    const say = g.state === 'lost' ? '¡Nooo!' : g.patience < 30 ? '¡Rápido!' : g.state === 'won' ? '¡GUAU!' : fl(g.t * .6) % 3 === 0 ? '¡Ánimo!' : '';
    if (say) { const k = spring((g.t * .6) % 1, 3, 8); c.save(); c.translate(144, 158); c.scale(k, k); panel(c, -30, -9, 60, 18, '#ffffff', { r: 5 }); polyPx(c, [[26, 2], [36, 6], [26, 7]], '#ffffff'); txt(c, say, 0, -4, g.patience < 30 ? '#e23b4e' : INK, { align: 'c', bold: true }); c.restore(); }
  },
  bot(g) {
    if (g.turn || g.enterT < .95) return { down: false };
    const [dx, dy] = this.dogXY(g), C = g.cells, ph = g.ph;
    const findCell = (grid, want, cap) => { let best = -1, bd = 1e9; for (let i = 0; i < grid.length; i++) { if (!C.inside[i]) continue; const ok = want ? grid[i] < cap : grid[i] > .05; if (!ok) continue; const x = dx + (i % C.cols) * C.cs + 4, y = dy + fl(i / C.cols) * C.cs + 4, d = dist(x, y, g.tool.x, g.tool.y); if (d < bd) { bd = d; best = i; } } return best < 0 ? null : [dx + (best % C.cols) * C.cs + 4, dy + fl(best / C.cols) * C.cs + 4]; };
    const wig = (x, y) => ({ x: x + Math.sin(g.t * 45) * 7, y: y + Math.cos(g.t * 38) * 5, down: true });
    if (ph === 0) { const kn = g.knots.find(k => k.hp > 0); if (kn) return wig(dx + kn.x, dy + kn.y - 4); const p = findCell(g.grid, true, 1); return p ? wig(p[0], p[1] - 4) : { down: false }; }
    if (ph === 1) { const B = g.bottle; const fall = .38, ahead = B.x + B.dir * [60, 80, 100][g.level - 1] * g.tempo * fall * .0; return { x: 128, y: 96, down: Math.abs(ahead - PREP_DOG_S.x) < 12 && g.blobs.every(b => b.done) && fl(g.t * 30) % 2 === 0 }; }
    if (ph === 2) { const p = findCell(g.foam, true, 1); return p ? wig(p[0], p[1]) : { down: false }; }
    if (ph === 3) { const p = findCell(g.foam, false); return p ? { x: p[0], y: p[1] - 40, down: true } : { down: false }; }
    if (ph === 4) { const p = findCell(g.dry, true, 1); if (!p) return { down: false }; const cx0 = dx + 52, cy0 = dy + 64, vx = p[0] - cx0, vy = p[1] - cy0, d = Math.hypot(vx, vy) || 1; return { x: p[0] + vx / d * 30, y: p[1] + vy / d * 30, down: true }; }
    if (ph === 5) { const p = findCell(g.clip, true, 1); return p ? wig(p[0], p[1] + 6) : { down: false }; }
    if (ph === 6) { const P = g.pay; if (P.paid >= 0) return { down: false }; const keys = prepKeys(206, 64, P.level); const want = P.level <= 1 ? 'cobrar' : P.typed === '10' ? 'ok' : P.typed === '' ? '1' : P.typed === '1' ? '0' : 'C'; const k = keys.find(k => k.id === want); const tapNow = fl(g.t * 8) % 2 === 0; return { x: k.x + k.w / 2, y: k.y + k.h / 2, down: tapNow }; }
    return { down: false };
  },
});
// a scratch canvas per name (for the room turn)
const _prepCanvases = {};
function prepCanvasOnce(name) { return _prepCanvases[name] || (_prepCanvases[name] = mkCanvas(SW, SH)); }
// tiny pictograms for the step list
function prepStepIcon(g, i, x, y) {
  switch (i) {
    case 0: rect(g, x - 7, y - 6, 14, 5, INK); rect(g, x - 6, y - 5, 12, 3, '#dfe3f1'); rect(g, x - 1, y - 1, 3, 9, INK); rect(g, x, y, 1, 7, '#f07820'); break;
    case 1: rect(g, x - 4, y - 5, 8, 12, INK); rect(g, x - 3, y - 4, 6, 10, PREP_MINT[2]); rect(g, x - 1, y - 8, 2, 3, INK); rect(g, x - 1, y - 9, 5, 2, INK); break;
    case 2: for (const [a, b] of [[-4, 0], [3, -2], [0, 4]]) { disc(g, x + a, y + b, 4, '#2f8866'); disc(g, x + a, y + b, 3, '#8fd6b5'); } break;
    case 3: disc(g, x - 2, y - 4, 4, INK); disc(g, x - 2, y - 4, 3, '#6b6977'); for (let k = 0; k < 4; k++) vline(g, x - 4 + k * 2, y, y + 6, '#5aaee6'); break;
    case 4: disc(g, x - 3, y - 2, 5, INK); disc(g, x - 3, y - 2, 4, PREP_MINT[2]); rect(g, x, y - 4, 7, 5, INK); rect(g, x, y - 3, 6, 3, PREP_MINT[2]); rect(g, x - 4, y + 2, 3, 5, INK); break;
    case 5: rect(g, x - 3, y - 6, 7, 13, INK); rect(g, x - 2, y - 5, 5, 11, '#b3202e'); hline(g, x - 2, x + 2, y - 6, '#e1e7f2'); break;
    default: txt(g, '€', x, y - 4, '#35a869', { align: 'c', bold: true, out: INK });
  }
}

// Súper Keiko cheering in the HUD corner: her head, the green cape, the mask
function prepKeikoCheer(g, x, y, t, ex) {
  const bob = Math.abs(Math.sin(t * 5)) * 3;
  polyPx(g, [[x - 18, y - 40 - bob], [x + 18, y - 40 - bob], [x + 30 + Math.sin(t * 9) * 3, y], [x - 30 - Math.sin(t * 9) * 3, y]], INK);
  polyPx(g, [[x - 17, y - 39 - bob], [x + 17, y - 39 - bob], [x + 28 + Math.sin(t * 9) * 3, y - 1], [x - 28 - Math.sin(t * 9) * 3, y - 1]], RAMP.green[2]);
  const head = keikoHead(ex === 'sad' ? 'sad' : ex === 'wow' ? 'wow' : fl(t * 1.5) % 4 === 0 ? 'wink' : 'happy');
  drawS(g, head, x, y - 30 - bob, { ax: .5, ay: .5 });
  const hx = rd(x - 32), hy = rd(y - 30 - bob - 33);
  swKeikoMask(g, hx, hy);
}

// a clump of cut fur: three puffs and a couple of strands
function prepFluff(g, x, y, r, col, rot = 0) {
  const pts = [[0, 0], [Math.cos(rot) * r * .8, Math.sin(rot) * r * .4], [-Math.cos(rot) * r * .7, -Math.sin(rot) * r * .5]];
  for (const [a, b] of pts) disc(g, x + a, y + b, r * .75 + 1, INK);
  for (const [a, b] of pts) disc(g, x + a, y + b, r * .75, col.col);
  disc(g, x - r * .3, y - r * .3, r * .35, col.lite);
  linePx(g, x + r * .6, y - r * .2, x + r * 1.3, y - r * .8, col.dark);
}
// the euro sign, for the small font (the till needs it)
if (typeof PEL !== 'undefined' && !PEL['€']) PEL['€'] = { start: 0, rows: ['..###', '.#...', '####.', '.#...', '####.', '.#...', '..###'], w: 5 };
