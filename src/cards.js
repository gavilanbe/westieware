// ============================================================================
//  cards — each character's title card (the "pre-level" before a stage),
//  with its own lettering, shapes and colours. STAGES[id].card = { top(g, S, t) }
//  The four parts every card keeps (portrait, name, motto, first-visit pill)
//  come from the card kit next to STG.drawCardTop, on the same clock.
// ============================================================================
'use strict';

// ---------------------------------------------------------------- lettering
// MORDISCO's pen skeletons, re-inked: other nibs (round, square, flat
// calligraphic), serifs, gothic spikes, neon tubes, bevels, rubber-stamp ink.
// Same letters, a different face for every character.
//   st: { id, u, nib: 'round'|'square'|'flat', r, ang, ratio, serif, spike, slant, gap,
//         fill: [top, mid, bottom] | (x, y, k, depth) => colour, tube: [edge, mid, core],
//         line, rim, line2, rim2, glow: [ring colours…], sx, sy, shadow: colour | [near…far],
//         hi, lo, rough }
const CARD_GLYPHS = new Map();
const CARD_RGBA = new Map();
function cardRGBA(c) {
  let v = CARD_RGBA.get(c); if (v) return v;
  let m;
  if (/^#[0-9a-f]{6}$/i.test(c)) v = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255];
  else if ((m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/))) v = [+m[1], +m[2], +m[3], m[4] != null ? rd(+m[4] * 255) : 255];
  else { const cv = mkCanvas(1, 1); cv.g.fillStyle = c; cv.g.fillRect(0, 0, 1, 1); const d = cv.g.getImageData(0, 0, 1, 1).data; v = [d[0], d[1], d[2], d[3]]; }
  CARD_RGBA.set(c, v); return v;
}
const CARD_STYLES = new WeakMap();
function cardStyle(o) {
  let st = CARD_STYLES.get(o); if (st) return st;
  st = cardStyleNew(o); CARD_STYLES.set(o, st); return st;
}
function cardStyleNew(o) {
  return Object.assign({ id: 'x', u: 2, nib: 'round', r: 2, ang: -.6, ratio: .35, serif: 0, spike: 0, slant: .1, gap: .9, dot: 1.15,
    fill: ['#ffffff', '#fff27a', '#ffc23a'], tube: null, line: INK, rim: 2, line2: null, rim2: 0, glow: null,
    sx: 0, sy: 0, shadow: INK, hi: null, lo: null, rough: 0 }, o);
}
// the skeleton of a letter in font units, plus serifs / spikes at its free ends
function cardStrokes(ch, st) {
  const src = MORD_SRC[ch] || MORD_SRC['?'];
  const out = src.s.map(s => ({ pts: s.map(p => [p[0], p[1]]), taper: false }));
  if (st.serif || st.spike) for (const s of src.s) {
    if (s.length < 2) continue;
    for (const [end, nb] of [[s[0], s[1]], [s[s.length - 1], s[s.length - 2]]]) {
      const side = Math.abs(end[1]) < .35 ? -1 : Math.abs(end[1] - 10) < .35 ? 1 : 0; if (!side) continue;
      const dx = end[0] - nb[0], dy = end[1] - nb[1], L = Math.hypot(dx, dy) || 1;
      if (Math.abs(dy) / L < .45) continue; // flat strokes keep their ends
      if (st.serif) out.push({ pts: [[end[0] - st.serif, end[1]], [end[0] + st.serif, end[1]]], taper: false, serif: true });
      if (st.spike) out.push({ pts: [[end[0], end[1]], [end[0] + dx / L * st.spike * .5, end[1] + side * st.spike]], taper: true });
    }
  }
  return { strokes: out, w: src.w, fill: src.fill, poly: src.fill ? src.s[0] : null };
}
// distance transform (chamfer, ≈ euclidean): distance from every pixel to the nearest set one
function cardDT(M, W, H) {
  const D = new Float32Array(W * H), a = 1, b = Math.SQRT2;
  for (let i = 0; i < W * H; i++) D[i] = M[i] ? 0 : 1e6;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; let v = D[i];
    if (x > 0) v = Math.min(v, D[i - 1] + a);
    if (y > 0) { v = Math.min(v, D[i - W] + a); if (x > 0) v = Math.min(v, D[i - W - 1] + b); if (x < W - 1) v = Math.min(v, D[i - W + 1] + b); }
    D[i] = v;
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x; let v = D[i];
    if (x < W - 1) v = Math.min(v, D[i + 1] + a);
    if (y < H - 1) { v = Math.min(v, D[i + W] + a); if (x < W - 1) v = Math.min(v, D[i + W + 1] + b); if (x > 0) v = Math.min(v, D[i + W - 1] + b); }
    D[i] = v;
  }
  return D;
}
function cardGlyph(ch, st) {
  const key = ch + '|' + st.id + '|' + st.u + '|' + st.r + '|' + (st.variant || '');
  let G = CARD_GLYPHS.get(key); if (G) return G;
  const S = cardStrokes(ch, st), u = st.u, r = st.r;
  const halo = (st.rim || 0) + (st.rim2 || 0) + (st.glow ? st.glow.length : 0);
  const pad = Math.ceil(r + halo + Math.max(st.sx, st.sy) + (st.serif + st.spike) * u) + 2;
  const top = -4, bot = 11.5 + st.spike;
  const W = Math.ceil(S.w * u + 10 * u * Math.abs(st.slant) + pad * 2), H = Math.ceil((bot - top) * u + pad * 2);
  const ox = pad + (st.slant < 0 ? 10 * u * -st.slant : 0), oy = pad - top * u;
  const T = p => [ox + (p[0] + (10 - p[1]) * st.slant) * u, oy + p[1] * u];
  const M = new Uint8Array(W * H);
  const ca = Math.cos(st.ang), sa = Math.sin(st.ang);
  const inNib = (dx, dy, rr) => {
    if (st.nib === 'square') return Math.abs(dx) <= rr && Math.abs(dy) <= rr;
    if (st.nib === 'flat') { const a1 = dx * ca + dy * sa, b1 = -dx * sa + dy * ca, rb = Math.max(.55, rr * st.ratio); return (a1 * a1) / (rr * rr) + (b1 * b1) / (rb * rb) <= 1; }
    return dx * dx + dy * dy <= rr * rr;
  };
  const stamp = (cx, cy, rr) => {
    const x0 = Math.max(0, fl(cx - rr - 1)), x1 = Math.min(W - 1, Math.ceil(cx + rr + 1)), y0 = Math.max(0, fl(cy - rr - 1)), y1 = Math.min(H - 1, Math.ceil(cy + rr + 1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!M[y * W + x] && inNib(x + .5 - cx, y + .5 - cy, rr)) M[y * W + x] = 1;
  };
  for (const s of S.strokes) {
    const pts = s.pts.map(T), rS = s.serif ? r * .7 : r;
    if (pts.length === 1) { stamp(pts[0][0], pts[0][1], r * st.dot); continue; }
    for (let i = 1; i < pts.length; i++) {
      const [a0, a1] = pts[i - 1], [b0, b1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b0 - a0, b1 - a1) / .35));
      for (let j = 0; j <= n; j++) { const q = j / n; stamp(lerp(a0, b0, q), lerp(a1, b1, q), s.taper ? lerp(rS, .45, q) : rS); }
    }
  }
  if (S.poly) { // solid glyphs (♥ ★)
    const poly = S.poly.map(T);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > y + .5) !== (yj > y + .5)) && (x + .5 < (xj - xi) * (y + .5 - yi) / (yj - yi) + xi)) ins = !ins; }
      if (ins) M[y * W + x] = 1;
    }
  }
  // ink erosion for rubber stamps: speckles and bitten edges
  if (st.rough) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!M[i]) continue;
    const n = vnoise(x * .45, y * .45, 7) * .7 + hash2(x, y, 3) * .3;
    if (n < st.rough * .62) M[i] = 0;
  }
  const notM = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) notM[i] = M[i] ? 0 : 1;
  const out = cardDT(M, W, H), depth = cardDT(notM, W, H);
  const f0 = oy - r, f1 = oy + 10 * u + r;
  const names = ['glow', 'line2', 'line', 'fill', 'outer'], buf = {};
  for (const k of names) buf[k] = new Uint8ClampedArray(W * H * 4);
  const put = (k, i, col) => { const c = cardRGBA(col), b = buf[k], o = i * 4; b[o] = c[0]; b[o + 1] = c[1]; b[o + 2] = c[2]; b[o + 3] = c[3]; };
  const rim = st.rim || 0, rim2 = st.rim2 || 0, g0 = rim + rim2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, d = out[i];
    if (M[i]) {
      const k = (y + .5 - f0) / (f1 - f0), dep = depth[i];
      let col;
      if (st.tube) col = dep <= 1.01 ? st.tube[0] : dep <= 2.01 ? st.tube[1] : st.tube[2];
      else if (typeof st.fill === 'function') col = st.fill(x, y, k, dep, W, H);
      else col = k < .16 ? st.fill[0] : k < .56 ? st.fill[1] : st.fill[Math.min(st.fill.length - 1, 2)];
      if (st.hi && ((x > 0 && !M[i - 1]) || (y > 0 && !M[i - W])) && !(x < W - 1 && !M[i + 1] && y < H - 1 && !M[i + W])) col = st.hi;
      if (st.lo && ((x < W - 1 && !M[i + 1]) || (y < H - 1 && !M[i + W])) && !(x > 0 && !M[i - 1])) col = st.lo;
      if (col) put('fill', i, col);
      put('outer', i, '#000000');
    } else if (d <= rim + .01) { put('line', i, st.line); put('outer', i, '#000000'); }
    else if (st.line2 && d <= g0 + .01) { put('line2', i, st.line2); put('outer', i, '#000000'); }
    else if (st.glow && d <= g0 + st.glow.length + .01) put('glow', i, st.glow[Math.min(st.glow.length - 1, Math.ceil(d - g0) - 1)]);
  }
  const L = {};
  for (const k of names) { const c = mkCanvas(W, H); c.g.putImageData(new ImageData(buf[k], W, H), 0, 0); L[k] = c; }
  const outer = L.outer; delete L.outer; L.shadow = mkCanvas(W, H);
  // extrusion: the silhouette smeared down-right, nearest steps on top
  const n = Math.max(st.sx, st.sy);
  const sil = {};
  if (n > 0) for (let s = n; s >= 1; s--) {
    const col = Array.isArray(st.shadow) ? st.shadow[Math.min(st.shadow.length - 1, fl((s - 1) / n * st.shadow.length))] : st.shadow;
    L.shadow.g.drawImage(sil[col] || (sil[col] = silhouette(outer, col)), rd(st.sx * s / n), rd(st.sy * s / n));
  }
  G = Object.assign(L, { W, H, ox, oy, adv: S.w * u + r * 2 + u * st.gap, M });
  CARD_GLYPHS.set(key, G); return G;
}
// the advance of a letter, known without drawing it (fitting a word must stay cheap)
function cardAdv(ch, S) { return (MORD_SRC[ch] || MORD_SRC['?']).w * S.u + S.r * 2 + S.u * S.gap; }
function cardWordW(s, st) { let w = 0; [...s].forEach((ch, i) => { const S = typeof st === 'function' ? cardStyle(st(i, ch)) : cardStyle(st); w += ch === ' ' ? 4 * S.u : cardAdv(ch, S); }); return w; }
// draw a word (y = cap line). st may be a function (i, ch) → style for per-letter faces.
// o.anim(i, n) → { dx, dy, s, sx, sy, rot, a }; o.layers limits the passes. Returns the letter boxes.
function cardWord(g, s, x, y, st, o = {}) {
  const chars = [...s], n = chars.length, total = cardWordW(s, st);
  let xx = o.align === 'l' ? x : o.align === 'r' ? x - total : x - total / 2;
  const items = [], boxes = [];
  chars.forEach((ch, i) => {
    const S = cardStyle(typeof st === 'function' ? st(i, ch) : st);
    if (ch === ' ') { xx += 4 * S.u; return; }
    const G = cardGlyph(ch, S), a = o.anim ? o.anim(i, n) : null;
    const gw = (MORD_SRC[ch] || MORD_SRC['?']).w * S.u;
    items.push({ G, x: xx, a, S }); boxes.push({ x: xx + G.ox - S.r, w: gw + S.r * 2, cx: xx + G.ox + gw / 2 + S.slant * 5 * S.u, ch, i, a, u: S.u });
    xx += G.adv;
  });
  for (const layer of (o.layers || ['glow', 'shadow', 'line2', 'line', 'fill'])) for (const it of items) {
    const a = it.a || {}, sc = a.s != null ? a.s : 1; if (sc <= 0 || a.a === 0) continue;
    const img = it.G[layer], cxl = it.x + it.G.ox + (it.G.W - it.G.ox * 2) * .5, cyl = y + 5 * it.S.u;
    if (sc === 1 && !a.rot && a.a == null && !a.sx && !a.sy) g.drawImage(img, rd(it.x + (a.dx || 0)), rd(y - it.G.oy + (a.dy || 0)));
    else {
      g.save(); g.translate(rd(cxl + (a.dx || 0)), rd(cyl + (a.dy || 0))); if (a.rot) g.rotate(a.rot); g.scale(sc * (a.sx || 1), sc * (a.sy || 1)); if (a.a != null) g.globalAlpha = a.a;
      g.drawImage(img, -rd(cxl - it.x), -rd(cyl - (y - it.G.oy))); g.restore();
    }
  }
  return boxes;
}
// shrink a face until the word fits in maxW pixels
const CARD_FITS = new Map();
function cardFit(s, maxW, st) {
  const key = s + '|' + maxW + '|' + st.id; let f = CARD_FITS.get(key); if (f) return f;
  f = Object.assign({}, st); let tries = 0;
  // a fresh object per try: resolved styles are cached per object
  while (cardWordW(s, f) > maxW && f.u > .9 && tries++ < 14) f = Object.assign({}, f, { u: +(f.u * .93).toFixed(2), r: +(Math.max(.8, f.r * .93)).toFixed(2) });
  CARD_FITS.set(key, f); return f;
}
// rasterise the letters a card will need, one per frame, before they appear
function cardPrewarm(list) {
  for (const [word, st] of list) for (const [i, ch] of [...word].entries()) {
    if (ch === ' ') continue;
    const S = cardStyle(typeof st === 'function' ? st(i, ch) : st);
    if (!CARD_GLYPHS.has(ch + '|' + S.id + '|' + S.u + '|' + S.r + '|' + (S.variant || ''))) { cardGlyph(ch, S); return; }
  }
}
// entrances (nk = seconds since the name started, i = letter)
function cardAnimDrop(nk, i, o = {}) { const lt = nk - i * (o.stagger || .06); if (lt <= 0) return { s: 0 }; const k = spring(lt, 2.4, 6); return { dy: (1 - k) * (o.h || -34), s: 1, sy: lt < .12 ? 1.25 : 1, sx: lt < .12 ? .82 : 1 }; }
function cardAnimRise(nk, i, o = {}) { const lt = nk - i * (o.stagger || .07); if (lt <= 0) return { s: 0 }; const k = E.outC(clamp(lt / .35, 0, 1)); return { dy: (1 - k) * 8, a: k, s: lerp(.8, 1, k) }; }
function cardAnimSlide(nk, i, o = {}) { const lt = nk - i * (o.stagger || .05); if (lt <= 0) return { s: 0 }; const k = E.outBack(clamp(lt / .4, 0, 1)); return { dx: (1 - k) * (o.from || 140), rot: (1 - k) * (o.rot || -.4) }; }
function cardAnimSlam(nk, i, o = {}) { const lt = nk - i * (o.stagger || .06); if (lt <= 0) return { s: 0 }; const k = clamp(lt / .12, 0, 1); return { s: lerp(o.from || 2.2, 1, E.inQ(k)), a: Math.min(1, lt * 10), rot: (1 - k) * (i % 2 ? .25 : -.25) }; }
// the stage's clock for loops that should keep moving after the entrance
function cardBeat(S, t) { return t * (S.bpm || 120) / 60; }

// ---------------------------------------------------------------- designs
const CARD_DESIGNS = {};

// ---- ANAHÍ · the salon: green damask, gilt pinstripes, the gold oval mirror
// behind her, her name in gold Roman capitals on a hanging plaque with the
// scissors & comb as its crest
function cardSalonBg() {
  return mdl('cardSalonBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, G = RAMP.green, Au = RAMP.gold;
    rect(g, 0, 0, SW, SH, G[1]);
    // damask trellis with a little fleuron at every crossing
    for (let k = -SH; k < SW + SH; k += 18) { linePx(g, k, 0, k + SH, SH, G[2]); linePx(g, k + SH, 0, k, SH, G[2]); }
    for (let y = 0; y <= SH + 9; y += 9) for (let x = ((y / 9) % 2) * 9; x <= SW + 9; x += 18) {
      px(g, x, y, G[3]); px(g, x - 1, y, G[2]); px(g, x + 1, y, G[2]); px(g, x, y - 1, G[3]); px(g, x, y + 1, G[2]);
    }
    // darker corners
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const v = Math.hypot((x - SW / 2) / (SW / 2), (y - SH / 2) / (SH / 2)); if (v > 1 && bayerK(x, y) < (v - 1) * 1.6) px(g, x, y, G[0]); }
    // gilt pinstripe frame with corner flourishes
    ringRect(g, 3, 3, SW - 6, SH - 6, 1, Au[2]); ringRect(g, 6, 6, SW - 12, SH - 12, 1, Au[1]);
    for (const [cx, cy, sx, sy] of [[3, 3, 1, 1], [SW - 4, 3, -1, 1], [3, SH - 4, 1, -1], [SW - 4, SH - 4, -1, -1]]) {
      for (let i = 0; i < 9; i++) { px(g, cx + sx * i, cy + sy * 3, Au[3]); px(g, cx + sx * 3, cy + sy * i, Au[3]); }
      disc(g, cx + sx * 6, cy + sy * 6, 1.6, Au[3]); px(g, cx + sx * 6, cy + sy * 6, Au[4]);
    }
    return c;
  });
}
function bayerK(x, y) { return (((x & 1) << 1 | (y & 1)) * 4 + ((x >> 1 & 1) << 1 | (y >> 1 & 1))) / 16; }
// the salon's gold oval mirror (a little glass shine that slides)
function cardMirror(g, cx, cy, rx, ry, t) {
  const Au = RAMP.gold;
  ellipsePx(g, cx, cy, rx + 5, ry + 5, INK); ellipsePx(g, cx, cy, rx + 4, ry + 4, Au[1]); ellipsePx(g, cx, cy, rx + 3, ry + 3, Au[3]);
  ellipsePx(g, cx - 1, cy - 1, rx + 1, ry + 1, Au[4]); ellipsePx(g, cx, cy, rx + 1, ry + 1, Au[2]);
  ellipsePx(g, cx, cy, rx, ry, INK); ellipsePx(g, cx, cy, rx - 1, ry - 1, '#9fb3bb'); ellipsePx(g, cx - 2, cy - 3, rx - 4, ry - 5, '#c9d8dd'); ellipsePx(g, cx - 4, cy - 6, rx - 10, ry - 14, '#dce7ea');
  // shine: two slanted streaks sliding across the glass
  const sh = ((t * 40) % (rx * 4)) - rx * 2;
  for (let y = -ry + 3; y < ry - 3; y++) {
    const hw = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) - 2;
    for (const [o, w] of [[0, 5], [9, 2]]) { const x0 = sh + o - y * .5; for (let x = x0; x < x0 + w; x++) if (Math.abs(x) < hw) px(g, cx + x, cy + y, 'rgba(255,255,255,.55)'); }
  }
  // gilt beads round the frame and a little crown on top
  for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; px(g, cx + Math.cos(a) * (rx + 3), cy + Math.sin(a) * (ry + 3), Au[4]); }
  polyPx(g, [[cx - 9, cy - ry - 3], [cx - 6, cy - ry - 11], [cx - 2, cy - ry - 6], [cx, cy - ry - 13], [cx + 2, cy - ry - 6], [cx + 6, cy - ry - 11], [cx + 9, cy - ry - 3]], INK);
  polyPx(g, [[cx - 8, cy - ry - 4], [cx - 6, cy - ry - 9], [cx - 2, cy - ry - 5], [cx, cy - ry - 11], [cx + 2, cy - ry - 5], [cx + 6, cy - ry - 9], [cx + 8, cy - ry - 4]], Au[3]);
  px(g, cx, cy - ry - 9, Au[4]);
}
function cardChain(g, x0, y0, x1, y1) {
  const n = Math.max(2, fl(Math.hypot(x1 - x0, y1 - y0) / 4));
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n); if (i % 2) { disc(g, x, y, 1.6, INK); px(g, x, y, RAMP.gold[3]); } else { rect(g, x - 1, y - 2, 2, 4, INK); px(g, x, y - 1, RAMP.gold[4]); } }
}
// the crest: open shears engraved in gold on a green medallion
function cardShears() {
  return mdl('cardShears', () => outlined(spr([
    'hh...........hh',
    '.hh.........hh.',
    '..hh.......hh..',
    '...hh.....hh...',
    '....hh...hh....',
    '.....hh.hh.....',
    '......hph......',
    '.....hh.hh.....',
    '....hh...hh....',
    '..ggggg.ggggg..',
    '.g....g.g....g.',
    '.g....g.g....g.',
    '..gggg...gggg..'], { h: '#fff0a6', p: '#bf8d2f', g: '#e7c35f' }), '#4d3310', false));
}
function cardCrest(g, x, y, t, k) {
  if (k <= 0) return;
  const Au = RAMP.gold, G = RAMP.green;
  g.save(); g.translate(x, y); g.scale(k, k);
  disc(g, 0, 0, 13, INK); disc(g, 0, 0, 12, Au[2]); disc(g, -1, -1, 11, Au[3]); disc(g, 0, 0, 10, INK); disc(g, 0, 0, 9, G[2]); disc(g, -1, -2, 7, G[3]);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; px(g, Math.cos(a) * 11.5, Math.sin(a) * 11.5, Au[4]); }
  const snip = t > .6 && t < 1.4 && Math.sin(t * 18) > .3 ? 1 : 0;
  drawS(g, cardShears(), 0, snip ? .5 : 0, { sx: snip ? .85 : 1 });
  g.restore();
}
const CARD_ANAHI_FACE = { id: 'anahi', u: 2.9, nib: 'flat', r: 2.6, ang: -.75, ratio: .3, serif: 1.3, slant: 0, gap: 1,
  fill: ['#fff0a6', '#e7c35f', '#bf8d2f'], line: '#07261c', rim: 1, line2: '#e7c35f', rim2: 1, sy: 2, shadow: '#04150f', hi: '#fffbe0' };
CARD_DESIGNS.anahi = {
  top(g, S, t) {
    const G = RAMP.green, Au = RAMP.gold, d = S.def;
    g.drawImage(cardSalonBg(), 0, 0);
    // the mirror opens behind her, then she slams in
    const mk = E.outBack(clamp(t / .35, 0, 1));
    if (mk > 0) { g.save(); g.translate(58, 104); g.scale(mk, mk); cardMirror(g, 0, 0, 38, 56, t); g.restore(); }
    STG.cardPortrait(g, S, t, { x: 58, y: 188 });
    // the plaque drops in on its chains and swings to rest
    const pk = clamp((t - .12) / .4, 0, 1), drop = (1 - E.outBack(pk)) * -90, sw = Math.sin(t * 7) * .09 * Math.exp(-Math.max(0, t - .3) * 2.2) * (pk > 0 ? 1 : 0);
    g.save(); g.translate(176, 4 + drop); g.rotate(sw);
    cardChain(g, -46, -4, -60, 16); cardChain(g, 46, -4, 60, 16);
    panel(g, -70, 14, 140, 58, Au[2], { r: 7, line: INK }); panel(g, -67, 17, 134, 52, G[2], { r: 5, line: Au[1] });
    rect(g, -63, 19, 126, 2, G[3]); hline(g, -60, 60, 66, G[1]);
    for (const [x, y] of [[-63, 21], [63, 21], [-63, 64], [63, 64]]) { disc(g, x, y, 1.4, INK); px(g, x, y, Au[4]); }
    const nk = t - .3, st = cardFit(d.name, 124, CARD_ANAHI_FACE);
    if (nk > 0) cardWord(g, d.name, 0, 34, st, { anim: i => cardAnimRise(nk, i, { stagger: .06 }) }); else cardPrewarm([[d.name, st]]);
    cardCrest(g, 0, 14, t, E.outBack(clamp((t - .55) / .3, 0, 1)));
    g.restore();
    // a glint runs over the gold once the name has settled
    const gl = (t - 1) % 2.6;
    if (gl > 0 && gl < .5) for (let i = 0; i < 3; i++) { const x = 130 + gl * 190 + i * 6, y = 30 + ((i * 7) % 20); drawStar(g, x, y, 2.4 - i * .5, '#fffbe0'); }
    // motto on a gilt rule
    STG.cardSub(g, S, t, 178, 84, { col: '#fff4dc', out: G[0] });
    if (t > .75) { const rk = E.outC(clamp((t - .75) / .4, 0, 1)); hline(g, 178 - 62 * rk, 178 + 62 * rk, 97, Au[2]); hline(g, 178 - 62 * rk, 178 + 62 * rk, 98, Au[1]); polyPx(g, [[178, 94], [181, 97.5], [178, 101], [175, 97.5]], Au[3]); }
    // the visit ribbon: green with gilt edges and forked tails
    STG.cardPill(g, S, t, 178, 122, { rot: -.02, draw: (g, k, label, first) => {
      const w = Math.max(96, txtW(label) + 26), h = 18;
      for (const s of [-1, 1]) { const x0 = s * (w / 2 - 6), x1 = s * (w / 2 + 12); polyPx(g, [[x0, -h / 2 + 4], [x1, -h / 2 + 4], [x1 - s * 5, 3], [x1, h / 2 + 4], [x0, h / 2 + 4]], INK); polyPx(g, [[x0, -h / 2 + 5], [x1 - s * 1, -h / 2 + 5], [x1 - s * 5.5, 3], [x1 - s * 1, h / 2 + 3], [x0, h / 2 + 3]], G[1]); }
      panel(g, -w / 2, -h / 2, w, h, first ? G[2] : Au[3], { r: 2, line: INK }); hline(g, -w / 2 + 2, w / 2 - 3, -h / 2 + 2, Au[3]); hline(g, -w / 2 + 2, w / 2 - 3, h / 2 - 3, Au[3]);
      txt(g, label, 0, -4, first ? '#fff4dc' : INK, { align: 'c', bold: true });
    } });
    // a westie trots across the carpet: paw prints appear and fade
    for (let i = 0; i < 9; i++) { const at = 1.1 + i * .16, a = clamp((t - at) * 3, 0, 1) * clamp(1 - (t - at - 1.6) * 1.5, 0, 1); if (a <= 0) continue; g.globalAlpha = a * .8; drawPawPrint(g, 120 + i * 15, 164 + (i % 2) * 8, G[3], 1.45); g.globalAlpha = 1; }
    for (let i = 0; i < 5; i++) { const p = (t * .6 + i * .37) % 1, x = 116 + (i * 53) % 130, y = 146 + (i * 29) % 38; if (p < .22) drawStar(g, x, y, 2.4 * Math.sin(p / .22 * Math.PI), Au[4]); }
  },
};

// ---- RIZOS · Club Champú: a mirror ball, sweeping spots, a light-up floor,
// his name in pink neon tubes that flicker on inside a marquee of bulbs
const CARD_NEON = ['#ff3d8b', '#ff9fcb', '#fff4fa'];
const CARD_RIZOS_ON = { id: 'rizosOn', u: 3, r: 1.6, slant: .18, gap: 1.1, tube: CARD_NEON, line: '#4a0b2e', rim: 1, glow: ['rgba(255,61,139,.6)', 'rgba(255,61,139,.34)', 'rgba(255,61,139,.17)', 'rgba(255,61,139,.07)'] };
const CARD_RIZOS_OFF = Object.assign({}, CARD_RIZOS_ON, { id: 'rizosOff', tube: ['#4d1230', '#6a1c42', '#7c2550'], glow: null });
function cardDiscoBall(g, x, y, r, t) {
  vline(g, x, 0, y - r, '#8f6cff');
  disc(g, x, y, r + 1, INK); disc(g, x, y, r, '#5f6485');
  for (let j = -r + 1; j < r; j += 3) for (let i = -r + 1; i < r; i += 3) {
    if (i * i + j * j > (r - 1) * (r - 1)) continue;
    const v = hash2(fl(i / 3 + t * 5), fl(j / 3), 5), shade = (i + j) / (2 * r);
    rect(g, x + i - 1, y + j - 1, 2, 2, v > .86 ? '#ffffff' : shade < -.3 ? '#c7cbe0' : shade < .2 ? '#8a8fb0' : '#6b7093');
  }
  disc(g, x - r * .4, y - r * .4, 2, '#ffffff');
}
function cardDanceFloor(g, y0, beat) {
  const cols = ['#ff3d8b', '#8f6cff', '#4fc6c2', '#ffdf4f'], rows = [[y0, 9, 10], [y0 + 10, 12, 8], [y0 + 23, 16, 6]];
  rect(g, 0, y0 - 1, SW, SH - y0 + 1, INK);
  rows.forEach(([y, h, n], r) => { const w = SW / n; for (let i = 0; i < n; i++) { const on = hash2(i, r, fl(beat)) > .5, c = cols[(i + r + fl(beat)) % 4]; rect(g, i * w + 1, y, w - 2, h - 1, on ? c : mixHex(c, '#1d1424', .72)); if (on) hline(g, i * w + 2, i * w + w - 3, y, '#ffffff'); } });
}
function cardVinyl(g, x, y, r, t, label = '#ff3d8b') {
  disc(g, x, y, r + 1, INK); disc(g, x, y, r, '#1b1627');
  for (let q = 5; q < r - 1; q += 2) ringPx(g, x, y, q, q % 4 ? '#2b2540' : '#40395e');
  const a = t * 5; for (let q = 0; q < 3; q++) { const aa = a + q * .5; linePx(g, x + Math.cos(aa) * 7, y + Math.sin(aa) * 7, x + Math.cos(aa) * (r - 2), y + Math.sin(aa) * (r - 2), 'rgba(255,255,255,.18)'); }
  disc(g, x, y, 6, label); disc(g, x - 1, y - 1, 3, mixHex(label, '#ffffff', .4)); px(g, x, y, INK);
}
CARD_DESIGNS.rizos = {
  top(g, S, t) {
    const d = S.def, beat = cardBeat(S, t);
    rect(g, 0, 0, SW, SH, '#2a1052');
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .35; polyPx(g, [[212, 16], [212 + Math.cos(a - .08) * 320, 16 + Math.sin(a - .08) * 320], [212 + Math.cos(a + .08) * 320, 16 + Math.sin(a + .08) * 320]], '#3b1a6a'); }
    // two coloured spots sweeping the room
    for (const [x0, c, ph] of [[30, 'rgba(79,198,194,.16)', 0], [150, 'rgba(255,61,139,.16)', 2]]) { const a = Math.PI / 2 + Math.sin(t * 1.3 + ph) * .55; polyPx(g, [[x0, -4], [x0 + Math.cos(a - .16) * 260, -4 + Math.sin(a - .16) * 260], [x0 + Math.cos(a + .16) * 260, -4 + Math.sin(a + .16) * 260]], c); }
    // light specks thrown by the ball
    for (let i = 0; i < 34; i++) { const a = hash2(i, 1) * TAU + t * .6, dd = 30 + hash2(i, 2) * 230, x = 212 + Math.cos(a) * dd, y = 16 + Math.sin(a) * dd * .7; if (y < 0 || y > 156) continue; const c = ['#ff9fcb', '#a6f0e2', '#fff27a', '#ffffff'][i % 4]; if (hash2(i, fl(t * 8)) > .25) rect(g, x, y, 2, 2, c); }
    cardDanceFloor(g, 158, beat);
    cardVinyl(g, 226, 138, 20, t);
    // the marquee board with chasing bulbs
    const bk = E.outBack(clamp((t - .1) / .35, 0, 1));
    g.save(); g.translate(178, lerp(-60, 44, bk));
    panel(g, -76, -34, 152, 66, '#130726', { r: 8, line: INK }); panel(g, -71, -29, 142, 56, '#1b0b34', { r: 5, line: '#3b1a6a' });
    const per = [];
    for (let x = -70; x <= 70; x += 8) { per.push([x, -31]); } for (let y = -23; y <= 23; y += 8) per.push([73, y]); for (let x = 70; x >= -70; x -= 8) per.push([x, 29]); for (let y = 23; y >= -23; y -= 8) per.push([-73, y]);
    per.forEach(([x, y], i) => { const on = (i + fl(beat * 2)) % 3 === 0; disc(g, x, y, 2, INK); disc(g, x, y, 1.4, on ? '#fff27a' : '#5a3d14'); if (on) { px(g, x - 3, y, 'rgba(255,242,122,.35)'); px(g, x + 3, y, 'rgba(255,242,122,.35)'); px(g, x, y - 3, 'rgba(255,242,122,.35)'); px(g, x, y + 3, 'rgba(255,242,122,.35)'); } });
    // the neon name: each tube flickers on, and now and then one buzzes
    cardPrewarm([[d.name, CARD_RIZOS_OFF], [d.name, CARD_RIZOS_ON]]);
    const lit = i => { const on = .3 + i * .09; if (t < on) return false; if (t < on + .28) return hash2(fl(t * 30), i, 9) > .45; return (t * 1.3 + i * .37) % 3.1 >= .06; };
    cardWord(g, d.name, 0, -16, i => lit(i) ? CARD_RIZOS_ON : CARD_RIZOS_OFF);
    g.restore();
    // music notes float off the dancer
    for (let i = 0; i < 4; i++) { const p = (t * .45 + i * .25) % 1, x = 76 + i * 9 + Math.sin(p * 9 + i) * 5, y = 70 - p * 60; if (t > .5) txt(g, '♪', x, y, i % 2 ? '#ff9fcb' : '#a6f0e2', { out: INK }); }
    STG.cardPortrait(g, S, t, { x: 66, y: 190 });
    STG.cardSub(g, S, t, 178, 88, { col: '#a6f0e2', out: '#130726' });
    // a neon tag for the visit
    STG.cardPill(g, S, t, 172, 116, { rot: -.04, draw: (g, k, label, first) => {
      const w = Math.max(98, txtW(label) + 24);
      panel(g, -w / 2 - 2, -13, w + 4, 26, 'rgba(79,198,194,.25)', { r: 7, line: 'rgba(79,198,194,.35)' });
      panel(g, -w / 2, -11, w, 22, '#130726', { r: 6, line: '#4fc6c2' }); ringRect(g, -w / 2 + 2, -9, w - 4, 18, 1, '#a6f0e2');
      txt(g, label, 0, -4, first ? '#fff4fa' : '#fff27a', { align: 'c', bold: true, out: '#4a0b2e' });
    } });
  },
};

// ---- POMPÓN · pop idol: stage lights, a huge spinning star, rising hearts,
// her name in glossy bubble letters with a heart for an accent, and an LED ticker
const CARD_POMPON_FACE = { id: 'pompon', u: 2.3, r: 3.3, slant: .06, gap: .75, fill: ['#ffffff', '#ffd1e4', '#ff93bf'], line: '#ffffff', rim: 2, line2: '#6b1a45', rim2: 1, sy: 2, shadow: '#3b0f2a', hi: '#ffffff' };
function cardBigStar(g, x, y, r, rot, fill, line) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  polyPx(g, pts.map(([px0, py0]) => [x + (px0 - x) * 1.06, y + (py0 - y) * 1.06]), line); polyPx(g, pts, fill);
}
function cardLedTicker(g, y, text, t, col) {
  rect(g, 0, y, SW, 16, '#12061f'); hline(g, 0, SW, y, '#3b1a6a'); hline(g, 0, SW, y + 15, '#3b1a6a');
  for (let x = 1; x < SW; x += 2) for (let j = 2; j < 14; j += 2) px(g, x, y + j, '#241036');
  const w = text.length * 8, off = fl(t * 34) % w;
  g.save(); g.beginPath(); g.rect(0, y + 1, SW, 14); g.clip();
  for (let x0 = -off; x0 < SW; x0 += w) { g.save(); g.translate(x0, y + 3); g.scale(2, 2); tiny(g, text, 0, 0, col); g.restore(); }
  g.restore();
  for (let x = 0; x < SW; x += 2) for (let j = 3; j < 14; j += 2) px(g, x, y + j, 'rgba(18,6,31,.55)');
}
CARD_DESIGNS.pompon = {
  top(g, S, t) {
    const d = S.def;
    bandsV(g, 0, 0, SW, SH, ['#1e0d3d', '#2b1557', '#4b2590', '#6b2a8f']);
    // two white spots from the rig, criss-crossing
    for (const [x0, ph] of [[20, 0], [236, 1.6]]) { const a = Math.PI / 2 + Math.sin(t * 1.1 + ph) * .5; polyPx(g, [[x0, -6], [x0 + Math.cos(a - .13) * 240, -6 + Math.sin(a - .13) * 240], [x0 + Math.cos(a + .13) * 240, -6 + Math.sin(a + .13) * 240]], 'rgba(255,255,255,.1)'); }
    const sk = E.outBack(clamp((t - .05) / .45, 0, 1));
    if (sk > 0) { g.save(); g.translate(172, 50); g.scale(sk, sk); cardBigStar(g, 0, 0, 62, t * .4, '#ff5d9e', '#ffd1e4'); cardBigStar(g, 0, 0, 44, t * .4, '#ff93bf', '#ff5d9e'); g.restore(); }
    // hearts drifting up, sparkles blinking
    for (let i = 0; i < 9; i++) { const p = (t * .22 + hash2(i, 4)) % 1, x = 100 + hash2(i, 5) * 150 + Math.sin(p * 7 + i) * 6, y = 176 - p * 190; drawHeart(g, x, y, i % 3 ? '#ff93bf' : '#ffffff', .8 + hash2(i, 6) * .5); }
    for (let i = 0; i < 10; i++) { const p = (t * 1.2 + hash2(i, 7)) % 1; if (p < .3) drawStar(g, 96 + hash2(i, 8) * 156, 8 + hash2(i, 9) * 150, 3 * Math.sin(p / .3 * Math.PI), '#ffffff'); }
    STG.cardPortrait(g, S, t, { x: 60, y: 176 });
    // the name drops in, bounces, and a heart sits on the second O
    const nk = t - .3, word = d.name.replace('Ó', 'O'), st = cardFit(word, 132, CARD_POMPON_FACE);
    cardPrewarm([[word, st]]);
    if (nk > 0) {
      const boxes = cardWord(g, word, 170, 34, st, { anim: i => cardAnimDrop(nk, i, { h: -46, stagger: .06 }) });
      const o2 = boxes.filter(b => b.ch === 'O')[1];
      if (o2) { const hk = spring(nk - .5, 2.6, 6); if (hk > 0) { g.save(); g.translate(o2.cx - 1, 22); g.scale(hk, hk); g.rotate(Math.sin(t * 4) * .15); drawHeart(g, 0, 0, '#ffffff', 2.9); drawHeart(g, 0, 0, INK, 2.4); drawHeart(g, 0, -1, '#ff3d8b', 2); disc(g, -3, -3, 1, '#ffffff'); g.restore(); } }
      for (const b of boxes) if (b.a && b.a.s !== 0) { const ya = 34 + (b.a.dy || 0); px(g, b.cx - b.u * 2, ya + 3, '#ffffff'); px(g, b.cx - b.u * 2 + 1, ya + 3, '#ffffff'); px(g, b.cx - b.u * 2, ya + 4, '#ffffff'); }
    }
    STG.cardSub(g, S, t, 172, 96, { col: '#ffffff', out: '#6b1a45' });
    STG.cardPill(g, S, t, 172, 126, { rot: .04, draw: (g, k, label, first) => {
      const w = Math.max(112, txtW(label) + 44);
      panel(g, -w / 2, -11, w, 22, first ? '#ff5d9e' : '#fff7ae', { r: 10, line: INK, hi: '#ffffff' });
      for (const s of [-1, 1]) { drawHeart(g, s * (w / 2 - 9), 1, INK, 1.3); drawHeart(g, s * (w / 2 - 9), 0, first ? '#ffffff' : '#ff5d9e', 1); }
      txt(g, label, 0, -4, first ? '#ffffff' : '#6b1a45', { align: 'c', bold: true });
    } });
    cardLedTicker(g, 176, '♥ POMPÓN ♥ LOS 40 PERRUNOS ♥ ¡A LA GALA! ', t, '#ff93bf');
  },
};

// ---- KIRA & NALA · the beach: sun, sea and sand, the names in chunky surf
// letters riding a surfboard, a lifeguard-flag tag
const CARD_SURF_FACE = { id: 'surf', u: 2.2, nib: 'square', r: 2.1, slant: .22, gap: .9, fill: ['#fff7ae', '#ffdf4f', '#ff9f4f'], line: '#141c47', rim: 2, sx: 2, sy: 3, shadow: ['#3565cc', '#233b8c', '#141c47'], hi: '#ffffff' };
function cardBeachBg() {
  return mdl('cardBeachBg', () => {
    const c = mkCanvas(SW, SH), g = c.g;
    bandsV(g, 0, 0, SW, 104, ['#4a86d6', '#76b3f0', '#a8d8ff', '#e2f4ff']);
    bandsV(g, 0, 104, SW, 44, ['#2f7cc4', '#1b4f8c']);
    rect(g, 0, 146, SW, SH - 146, '#f2e2b8'); hline(g, 0, SW, 146, '#dcc08a');
    for (let i = 0; i < 260; i++) px(g, hash2(i, 31) * SW, 148 + hash2(31, i) * 44, hash2(i, 2) < .5 ? '#dcc08a' : '#fff8e6');
    return c;
  });
}
function cardStarfish(g, x, y, r) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  polyPx(g, pts.map(([a, b]) => [x + (a - x) * 1.2, y + (b - y) * 1.2]), '#141c47'); polyPx(g, pts, '#ff9f4f');
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; for (let q = 2; q < r - 1; q += 2) px(g, x + Math.cos(a) * q, y + Math.sin(a) * q, '#fff7ae'); }
  disc(g, x, y, 1.5, '#e56f1d');
}
CARD_DESIGNS.hermanas = {
  top(g, S, t) {
    const d = S.def;
    g.drawImage(cardBeachBg(), 0, 0);
    // the sun and its turning rays
    const sx = 34, sy = 24;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .5; polyPx(g, [[sx + Math.cos(a - .12) * 20, sy + Math.sin(a - .12) * 20], [sx + Math.cos(a) * 34, sy + Math.sin(a) * 34], [sx + Math.cos(a + .12) * 20, sy + Math.sin(a + .12) * 20]], i % 2 ? '#fff7ae' : '#ffdf4f'); }
    disc(g, sx, sy, 18, '#ff9f4f'); disc(g, sx, sy, 16, '#ffdf4f'); disc(g, sx - 4, sy - 4, 8, '#fff7ae');
    // clouds and gulls
    for (let i = 0; i < 3; i++) { const x = ((i * 97 + t * 8) % 300) - 30, y = 14 + i * 16; for (const [dx, dy, r] of [[0, 0, 6], [7, -3, 7], [15, 0, 6]]) disc(g, x + dx, y + dy, r, '#ffffff'); }
    for (let i = 0; i < 3; i++) { const x = ((i * 70 + t * 20) % 280) - 10, y = 60 + i * 9 + Math.sin(t * 3 + i) * 3, f = Math.sin(t * 12 + i) > 0 ? 2 : 0; linePx(g, x - 4, y - f, x, y, INK); linePx(g, x, y, x + 4, y - f, INK); }
    // waves rolling in
    for (let row = 0; row < 4; row++) { const y = 110 + row * 10; for (let x = 0; x < SW; x++) { const yy = y + Math.sin(x * .12 + t * 2.4 + row * 1.7) * 1.6; if (((x + fl(t * 20) + row * 9) % 26) < 10) px(g, x, yy, '#dff4ff'); } }
    for (let x = 0; x < SW; x++) px(g, x, 146 + Math.sin(x * .2 + t * 3) * 1.2, '#ffffff');
    // the surfboard slides in, the names ride it
    const bk = E.outBack(clamp((t - .12) / .4, 0, 1));
    g.save(); g.translate(lerp(SW + 140, 176, bk), 44); g.rotate(-.07);
    ellipsePx(g, 0, 0, 80, 19, INK); ellipsePx(g, 0, 0, 79, 18, '#fff8e6'); ellipsePx(g, -4, -3, 72, 12, '#ffffff');
    rect(g, -78, -2, 156, 4, '#e23b4e'); rect(g, -78, -1, 156, 1, '#ff8a8a');
    polyPx(g, [[46, 17], [56, 27], [60, 17]], INK); polyPx(g, [[48, 17], [56, 25], [58, 17]], '#3565cc');
    g.restore();
    const nk = t - .3, st = cardFit('KIRA', 64, CARD_SURF_FACE);
    cardPrewarm([['KIRANL', st]]);
    if (nk > 0) {
      cardWord(g, 'KIRA', 132, 18, st, { anim: i => cardAnimSlide(nk, i, { from: 150, rot: -.5, stagger: .05 }) });
      const fk = spring(nk - .22, 2.4, 6); if (fk > 0) { g.save(); g.translate(170, 40); g.scale(fk, fk); g.rotate(t * 1.5); cardStarfish(g, 0, 0, 9); g.restore(); }
      cardWord(g, 'NALA', 207, 34, st, { anim: i => cardAnimSlide(nk - .25, i, { from: 150, rot: -.5, stagger: .05 }) });
      // spray where the board lands
      const sp = nk - .45; if (sp > 0 && sp < .6) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (hash2(i, 12) - .5) * 2.2, v = 40 + hash2(i, 13) * 50; disc(g, 110 + Math.cos(a) * v * sp, 60 + Math.sin(a) * v * sp + 90 * sp * sp, 1.5, '#dff4ff'); }
    }
    STG.cardPortrait(g, S, t, { x: 58, y: 186 });
    STG.cardSub(g, S, t, 178, 84, { col: '#ffffff', out: '#141c47' });
    // lifeguard flag tag: red and yellow
    STG.cardPill(g, S, t, 176, 128, { rot: -.05, draw: (g, k, label, first) => {
      const w = Math.max(100, txtW(label) + 24);
      panel(g, -w / 2, -11, w, 22, first ? '#e23b4e' : '#ffdf4f', { r: 4, line: INK });
      g.save(); g.beginPath(); g.rect(-w / 2 + 1, -10, w - 2, 20); g.clip();
      polyPx(g, [[-w / 2, 10], [w / 2, -10], [w / 2, 10]], first ? '#ffdf4f' : '#ff9f4f');
      g.restore();
      txt(g, label, 0, -4, '#ffffff', { align: 'c', bold: true, out: '#141c47' });
    } });
  },
};

// ---- CENIZA · a witch's night: full moon, bats, a turning magic circle, her
// name in spiky gothic letters glowing potion-green and dripping
const CARD_WITCH_FACE = { id: 'witch', u: 2.7, nib: 'flat', r: 2.9, ang: .75, ratio: .26, spike: 1.7, slant: 0, gap: .8, fill: ['#f2e8ff', '#bf95e9', '#8959c5'], line: '#0e0b16', rim: 1, line2: '#5bd18b', rim2: 1, glow: ['rgba(91,209,139,.42)', 'rgba(91,209,139,.18)'] };
function cardBat(g, x, y, t, s = 1) {
  const f = Math.sin(t * 18) > 0 ? -3 : 2;
  polyPx(g, [[x, y], [x - 7 * s, y + f * s], [x - 4 * s, y + 1], [x - 2 * s, y + 3], [x, y + 1], [x + 2 * s, y + 3], [x + 4 * s, y + 1], [x + 7 * s, y + f * s]], '#0e0b16');
  px(g, x - 1, y, '#5bd18b'); px(g, x + 1, y, '#5bd18b');
}
CARD_DESIGNS.ceniza = {
  top(g, S, t) {
    const d = S.def;
    bandsV(g, 0, 0, SW, SH, ['#0e0b16', '#1e1036', '#2d1850', '#381e63']);
    for (let i = 0; i < 40; i++) { const x = hash2(i, 41) * SW, y = hash2(41, i) * 150, tw = Math.sin(t * (2 + hash2(i, 3) * 3) + i); if (tw > .2) px(g, x, y, tw > .8 ? '#ffffff' : '#bf95e9'); }
    // the moon with its halo
    const mx = 206, my = 52;
    for (let r = 44; r > 30; r -= 4) { g.globalAlpha = .08; disc(g, mx, my, r, '#e5d3fa'); } g.globalAlpha = 1;
    disc(g, mx, my, 30, '#e8e0c4'); disc(g, mx - 3, my - 3, 26, '#fff7d6'); for (const [dx, dy, r] of [[-8, 6, 5], [9, -9, 3], [6, 10, 4], [-12, -8, 2]]) { disc(g, mx + dx, my + dy, r, '#e0d6b0'); px(g, mx + dx - 1, my + dy - 1, '#d2c79c'); }
    // bats cross the moon
    for (let i = 0; i < 3; i++) { const p = (t * .18 + i * .34) % 1; cardBat(g, lerp(300, -40, p), 24 + i * 22 + Math.sin(p * 20 + i) * 6, t + i, .9 + i * .15); }
    // mist
    for (let row = 0; row < 3; row++) { const y = 166 + row * 8; for (let x = 0; x < SW; x += 2) { const v = Math.sin(x * .05 + t * (.8 + row * .3) + row * 2); if (v > .1) rect(g, x, y + v * 3, 2, 3 + row, 'rgba(191,149,233,.18)'); } }
    // the magic circle turns behind her
    const ck = E.outBack(clamp(t / .4, 0, 1));
    if (ck > 0) {
      g.save(); g.translate(62, 128); g.scale(ck, ck * .42);
      for (let q = 0; q < 2; q++) ringPx(g, 0, 0, 44 - q * 6, q ? 'rgba(91,209,139,.55)' : '#5bd18b');
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .8; const x = Math.cos(a) * 41, y = Math.sin(a) * 41; if (i % 2) drawStar(g, x, y, 2.6, '#94dcbc'); else { disc(g, x, y, 2.4, '#94dcbc'); disc(g, x + 1, y - 1, 2, '#1e1036'); } }
      g.restore();
    }
    STG.cardPortrait(g, S, t, { x: 62, y: 186 });
    // the name: letters condense out of green smoke, then drip
    const nk = t - .3, st = cardFit(d.name, 150, CARD_WITCH_FACE);
    cardPrewarm([[d.name, st]]);
    if (nk > 0) {
      const boxes = cardWord(g, d.name, 172, 26, st, { anim: i => { const lt = nk - i * .07; if (lt <= 0) return { s: 0 }; const k = E.outC(clamp(lt / .3, 0, 1)); return { s: lerp(1.5, 1, k), a: k, rot: (1 - k) * .3 }; } });
      boxes.forEach((b, i) => {
        const lt = nk - i * .07; if (lt > 0 && lt < .35) for (let q = 0; q < 4; q++) { const a = q / 4 * TAU + lt * 3; disc(g, b.cx + Math.cos(a) * (6 + lt * 30), 40 + Math.sin(a) * (4 + lt * 16), 3 - lt * 7, 'rgba(148,220,188,.5)'); }
        const dp = (t * .55 + hash2(i, 51)) % 1; if (t > .9 && hash2(i, 52) > .25) { const x = rd(b.cx + (hash2(i, 53) - .5) * 6), y0 = 26 + 10 * st.u + 1; const L = Math.min(1, dp * 2.5) * 6; rect(g, x - 1, y0, 2, L, '#5bd18b'); px(g, x - 1, y0, '#94dcbc'); if (dp < .4) { disc(g, x, y0 + L, 1.6, '#5bd18b'); } else { const fy = y0 + 7 + (dp - .4) * 70; disc(g, x, fy, 1.6, '#5bd18b'); px(g, x - 1, fy - 1, '#d2f5e4'); } }
      });
    }
    STG.cardSub(g, S, t, 172, 88, { col: '#e5d3fa', out: '#0e0b16' });
    // a parchment label with ragged ends
    STG.cardPill(g, S, t, 170, 118, { rot: -.06, draw: (g, k, label, first) => {
      const w = Math.max(100, txtW(label) + 24), pts = [];
      for (let i = 0; i <= 6; i++) pts.push([-w / 2 + (i % 2 ? -3 : 0), -11 + i * 22 / 6]);
      for (let i = 6; i >= 0; i--) pts.push([w / 2 + (i % 2 ? 3 : 0), -11 + i * 22 / 6]);
      polyPx(g, pts.map(([x, y]) => [x + sgn(x), y + sgn(y)]), '#0e0b16'); polyPx(g, pts, first ? '#f2e2b8' : '#e5d3fa');
      hline(g, -w / 2 + 4, w / 2 - 4, -8, '#fff8e6'); hline(g, -w / 2 + 4, w / 2 - 4, 8, '#dcc08a');
      txt(g, label, 0, -4, '#5a3396', { align: 'c', bold: true });
    } });
    // potion bubbles
    for (let i = 0; i < 6; i++) { const p = (t * .5 + hash2(i, 61)) % 1; ringPx(g, 110 + hash2(i, 62) * 140, 190 - p * 50, 1 + p * 2, 'rgba(148,220,188,.7)'); }
  },
};

// ---- DON BIGOTES · the workshop: a blueprint of the Secador 3000, turning
// gears, his name stamped in brass on a riveted steel plate, a teletype motto
const CARD_BRASS_FACE = { id: 'brass', u: 2.4, nib: 'square', r: 1.8, slant: 0, gap: 1.2, fill: ['#fff0a6', '#e7c35f', '#bf8d2f'], hi: '#fffbe0', lo: '#83591c', line: '#1d1424', rim: 1, sy: 2, shadow: '#4d3310' };
const CARD_BRASS_SMALL = Object.assign({}, CARD_BRASS_FACE, { id: 'brassS', u: 1.3, r: 1.1, gap: 1.4 });
function cardBlueprint() {
  return mdl('cardBlueprint', () => {
    const c = mkCanvas(SW, SH), g = c.g, L = '#cfe6ff', D = 'rgba(207,230,255,.45)';
    rect(g, 0, 0, SW, SH, '#1c4a78');
    for (let x = 0; x < SW; x += 8) vline(g, x, 0, SH, x % 32 ? '#245a8c' : '#3a72a8');
    for (let y = 0; y < SH; y += 8) hline(g, 0, SW, y, y % 32 ? '#245a8c' : '#3a72a8');
    // the Secador 3000, in section
    const x = 196, y = 150;
    ringPx(g, x, y, 22, L); ringPx(g, x, y, 14, D); ringPx(g, x, y, 5, L);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; linePx(g, x + Math.cos(a) * 6, y + Math.sin(a) * 6, x + Math.cos(a + .5) * 13, y + Math.sin(a + .5) * 13, D); }
    ringRect(g, x - 70, y - 9, 48, 18, 1, L); linePx(g, x - 22, y - 9, x - 18, y - 16, L); linePx(g, x - 22, y + 9, x - 18, y + 16, L);
    ringRect(g, x - 6, y + 22, 12, 30, 1, L);
    // dimension lines
    linePx(g, x - 70, y - 20, x + 22, y - 20, D); for (const xx of [x - 70, x + 22]) vline(g, xx, y - 23, y - 17, D);
    tiny(g, 'SECADOR 3000', x - 24, y - 29, L, { align: 'c' }); tiny(g, 'Ø 44', x + 26, y - 3, D);
    tiny(g, 'PATENTE D. BIGOTES', SW - 8, SH - 9, D, { align: 'r' });
    return c;
  });
}
function cardGear(g, x, y, r, teeth, rot, col, dark) {
  const pts = []; for (let i = 0; i < teeth * 4; i++) { const a = rot + i / (teeth * 4) * TAU, rr = (i % 4 < 2) ? r : r - 3; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  polyPx(g, pts.map(([px0, py0]) => [x + (px0 - x) * 1.08, y + (py0 - y) * 1.08]), INK); polyPx(g, pts, col);
  disc(g, x, y, r * .55, dark); disc(g, x, y, r * .3, col); disc(g, x, y, r * .14, INK);
}
CARD_DESIGNS.bigotes = {
  top(g, S, t) {
    const d = S.def, St = RAMP.steel;
    g.drawImage(cardBlueprint(), 0, 0);
    // gears behind the plate
    cardGear(g, 108, 22, 17, 9, t * 1.2, '#bf8d2f', '#83591c');
    cardGear(g, 238, 84, 12, 7, -t * 1.8, '#a5afc4', '#6f7a92');
    // the steel plate slides up, rivets and all
    const pk = E.outBack(clamp((t - .1) / .38, 0, 1)), shake = t > .3 && t < 1 ? (hash2(fl(t * 40), 7) - .5) * 2 * Math.max(0, 1 - (t - .3) * 3) : 0;
    g.save(); g.translate(176 + shake, lerp(-70, 44, pk));
    rect(g, -74, -34, 148, 70, INK); rect(g, -73, -33, 146, 68, St[3]); rect(g, -73, -33, 146, 2, St[4]); rect(g, -73, 33, 146, 2, St[2]); rect(g, -73, -33, 2, 68, St[4]); rect(g, 71, -33, 2, 68, St[2]);
    for (let y = -28; y < 30; y += 3) hline(g, -69, 69, y, 'rgba(255,255,255,.12)');
    for (const [x, y] of [[-67, -27], [67, -27], [-67, 29], [67, 29]]) { disc(g, x, y, 2.5, INK); disc(g, x, y, 1.8, St[2]); px(g, x - 1, y - 1, St[4]); }
    const nk = t - .3, small = CARD_BRASS_SMALL, word = d.name.replace(/^DON\s+/, ''), st = cardFit(word, 132, CARD_BRASS_FACE);
    cardPrewarm([['DON', small], [word, st]]);
    if (nk > 0) {
      cardWord(g, 'DON', 0, -27, small, { anim: i => cardAnimSlam(nk, i, { from: 1.6, stagger: .06 }) });
      cardWord(g, word, 0, -10, st, { anim: i => cardAnimSlam(nk - .15, i, { from: 1.7, stagger: .06 }) });
    }
    g.restore();
    STG.cardPortrait(g, S, t, { x: 56, y: 188 });
    // teletype motto on a dark strip, with a blinking block cursor
    if (t > .7) {
      const sub = d.sub, n = Math.min(sub.length, fl((t - .75) * 30)), w = txtW(sub) + 12;
      rect(g, 176 - w / 2, 88, w, 14, '#0f2a44'); ringRect(g, 176 - w / 2, 88, w, 14, 1, '#3a72a8');
      STG.cardSub(g, S, t, 176 - w / 2 + 6, 91, { col: '#d8fff6', out: null, align: 'l', cps: 30 });
      if (fl(t * 3) % 2 === 0 || n < sub.length) rect(g, 176 - w / 2 + 7 + txtW(sub.slice(0, n)), 91, 4, 8, '#7fe0d6');
    }
    // a brass tag on a string
    STG.cardPill(g, S, t, 178, 126, { rot: .05, draw: (g, k, label, first) => {
      const w = Math.max(100, txtW(label) + 30);
      linePx(g, -w / 2 + 8, 0, -w / 2 - 6, -18, '#dcc08a');
      panel(g, -w / 2, -11, w, 22, first ? '#e7c35f' : '#a5afc4', { r: 3, line: INK, hi: first ? '#fff0a6' : '#e1e7f2' });
      disc(g, -w / 2 + 8, 0, 3, INK); disc(g, -w / 2 + 8, 0, 2, '#1c4a78');
      txt(g, label, 6, -4, INK, { align: 'c', bold: true });
    } });
  },
};

// ---- SÚPER KEIKO · a comic-book splash: halftone burst, speed lines, a POW
// star, "SÚPER" on top of a huge 3-D "KEIKO", the motto in a caption box
const CARD_HERO_FACE = { id: 'hero', u: 3, r: 3.1, slant: .28, gap: .7, fill: (x, y, k, dep) => k < .2 ? '#fff7ae' : k < .55 ? '#ffdf4f' : ((x + y) % 3 === 0 && k > .7 ? '#e56f1d' : '#ff9f4f'), line: INK, rim: 2, sx: 4, sy: 5, shadow: ['#ec5e5e', '#c02d45', '#7c1830'], hi: '#ffffff' };
const CARD_HERO_SMALL = { id: 'heroS', u: 1.7, r: 1.9, slant: .28, gap: .8, fill: ['#ffffff', '#ffd1e4', '#ff93bf'], line: INK, rim: 1, line2: '#ffffff', rim2: 1, sx: 1, sy: 2, shadow: INK };
CARD_DESIGNS.superwestie = {
  top(g, S, t) {
    const d = S.def, cx = 176, cy = 44;
    rect(g, 0, 0, SW, SH, '#ffdf4f');
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + t * .15; polyPx(g, [[cx, cy], [cx + Math.cos(a - .08) * 330, cy + Math.sin(a - .08) * 330], [cx + Math.cos(a + .08) * 330, cy + Math.sin(a + .08) * 330]], '#ff9f4f'); }
    // halftone: dots grow toward the edges
    for (let y = 2; y < SH; y += 6) for (let x = ((y / 6) % 2) * 3 + 2; x < SW; x += 6) { const v = Math.hypot(x - cx, (y - cy) * 1.3) / 220; if (v > .35) disc(g, x, y, Math.min(2.2, (v - .35) * 4), '#e56f1d'); }
    // speed lines behind the hero
    for (let i = 0; i < 12; i++) { const y = 70 + i * 10, x = SW - ((t * 360 + i * 97) % 420); rect(g, x, y, 40 + (i % 3) * 20, 2, '#ffffff'); }
    // POW star behind the title
    const pk = spring(t - .38, 2, 5);
    if (pk > 0) { const pts = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + .1, rr = (i % 2 ? 46 : 76) * (1 + (hash2(i, 71) - .5) * .25); pts.push([cx + Math.cos(a) * rr * pk, cy + 2 + Math.sin(a) * rr * .62 * pk]); } polyPx(g, pts.map(([x, y]) => [cx + (x - cx) * 1.05, cy + (y - cy) * 1.06]), INK); polyPx(g, pts, '#ffffff'); }
    STG.cardPortrait(g, S, t, { x: 62, y: 192, from: -120 });
    const nk = t - .3, bang = nk > .12 && nk < .3 ? (hash2(fl(t * 50), 3) - .5) * 4 : 0, [a, b = ''] = d.name.split(' '), stB = cardFit(b, 134, CARD_HERO_FACE);
    cardPrewarm([[a, CARD_HERO_SMALL], [b, stB]]);
    if (nk > 0) {
      g.save(); g.translate(bang, bang * .5);
      cardWord(g, a, cx - 30, 15, CARD_HERO_SMALL, { anim: i => cardAnimSlide(nk, i, { from: -160, rot: .3, stagger: .04 }) });
      cardWord(g, b, cx - 10, 33, stB, { anim: i => cardAnimSlam(nk - .06, i, { from: 2.6, stagger: .05 }) });
      g.restore();
    }
    // caption box motto
    if (t > .72) { const w = txtW(d.sub) + 12; rect(g, cx - w / 2 - 1, 86, w + 2, 16, INK); rect(g, cx - w / 2, 87, w, 14, '#fff7ae'); STG.cardSub(g, S, t, cx, 90, { col: INK, out: null }); }
    // a speech bubble for the visit
    STG.cardPill(g, S, t, 180, 124, { rot: -.03, draw: (g, k, label, first) => {
      const w = Math.max(96, txtW(label) + 26);
      ellipsePx(g, 0, 0, w / 2 + 1, 13, INK); polyPx(g, [[-w / 4, 8], [-w / 4 - 12, 20], [-w / 4 + 8, 10]], INK);
      ellipsePx(g, 0, 0, w / 2, 12, '#ffffff'); polyPx(g, [[-w / 4 + 1, 8], [-w / 4 - 9, 17], [-w / 4 + 7, 9]], '#ffffff');
      txt(g, label, 0, -4, first ? '#c02d45' : INK, { align: 'c', bold: true });
    } });
    // the comic panel border
    ringRect(g, 0, 0, SW, SH, 2, '#ffffff'); ringRect(g, 2, 2, SW - 4, SH - 4, 3, INK);
  },
};

// ---- MEZCLA MAESTRA · a mixtape: stripes in the six gesture colours, a
// spinning record, the title as a pile of stickers that bounce to the beat
const CARD_MIX_COLS = ['#ff5d9e', '#ff9f4f', '#ffdf4f', '#5bd18b', '#63a0ef', '#bf95e9'];
const CARD_MIX_FACES = {};
function cardMixFace(i, line) {
  const key = i + ':' + line; if (CARD_MIX_FACES[key]) return CARD_MIX_FACES[key];
  const c = CARD_MIX_COLS[(i + line * 3) % 6];
  return (CARD_MIX_FACES[key] = { id: 'mix' + key, u: 2, r: 2.4, slant: (hash2(i, line, 3) - .5) * .3, gap: .6, fill: [mixHex(c, '#ffffff', .5), c, mixHex(c, '#1d1424', .2)], line: '#ffffff', rim: 2, line2: INK, rim2: 1, sy: 2, shadow: INK });
}
CARD_DESIGNS.mezcla = {
  top(g, S, t) {
    const d = S.def, beat = cardBeat(S, t);
    rect(g, 0, 0, SW, SH, '#1d1424');
    const off = (t * 18) % 72;
    for (let i = -2; i < 10; i++) { const x = i * 36 + off - 36; polyPx(g, [[x, 0], [x + 18, 0], [x - 80, SH], [x - 98, SH]], mixHex(CARD_MIX_COLS[(i + 12) % 6], '#1d1424', .55)); }
    cardVinyl(g, 176, 52, 46, t * .8, '#ffdf4f');
    STG.cardPortrait(g, S, t, { x: 60, y: 192 });
    const nk = t - .3;
    {
      const face = (i, ch, line) => cardMixFace(i, line);
      const [l1, l2 = ''] = d.name.split(' ');
      cardPrewarm([[l1, (i, ch) => face(i, ch, 0)], [l2, (i, ch) => face(i, ch, 1)]]);
      if (nk > 0) {
      const flip = (line) => i => { const lt = nk - line * .2 - i * .05; if (lt <= 0) return { s: 0 }; const k = E.outBack(clamp(lt / .3, 0, 1)); return { sx: Math.max(.05, k), rot: (hash2(i, line, 5) - .5) * .35, dy: -Math.abs(Math.sin((beat + i * .25 + line * .5) * Math.PI)) * 3 }; };
      cardWord(g, l1, 176, 16, (i, ch) => face(i, ch, 0), { anim: flip(0) });
      cardWord(g, l2, 176, 44, (i, ch) => face(i, ch, 1), { anim: flip(1) });
      }
    }
    STG.cardSub(g, S, t, 176, 94, { col: '#ffffff', out: INK });
    STG.cardPill(g, S, t, 176, 124, { rot: .06, draw: (g, k, label, first) => {
      const w = Math.max(100, txtW(label) + 24);
      panel(g, -w / 2 - 2, -13, w + 4, 26, '#ffffff', { r: 6, line: INK }); panel(g, -w / 2, -11, w, 22, first ? '#ff5d9e' : '#ffdf4f', { r: 5, line: INK });
      txt(g, label, 0, -4, first ? '#ffffff' : INK, { align: 'c', bold: true });
    } });
    // the gestures, stuck on like stickers
    ['tap', 'rub', 'cut', 'draw', 'drag', 'spin'].forEach((m, i) => { const k = spring(t - .9 - i * .08, 2.4, 6); if (k <= 0) return; g.save(); g.translate(116 + i * 24, 164); g.scale(k * .8, k * .8); drawMechMini(g, 0, 0, m, t + i * .3); g.restore(); });
  },
};

// ---- A UN PELO · one life: a dark red room that pulses like a heartbeat, a
// single hair across it, the title in hairline capitals that won't sit still
const CARD_HAIR_FACE = { id: 'hair', u: 3.1, r: 1.05, slant: 0, gap: 1.3, fill: ['#ffffff', '#ffffff', '#ffd1d1'], line: '#1d0508', rim: 1, glow: ['rgba(255,93,93,.5)', 'rgba(255,93,93,.22)'] };
CARD_DESIGNS.unpelo = {
  top(g, S, t) {
    const d = S.def, beat = cardBeat(S, t), pulse = Math.max(0, Math.sin((beat % 1) * Math.PI)) ** 6;
    rect(g, 0, 0, SW, SH, '#3e0d1c');
    for (let r = 150; r > 20; r -= 14) { g.globalAlpha = .06 + pulse * .05; disc(g, 176, 70, r, '#c02d45'); } g.globalAlpha = 1;
    mord(g, '1', 214, 14, { u: 9, r: 7, rim: 0, sy: 0, sx: 0, fill: ['#5a0f1e', '#5a0f1e', '#5a0f1e'], line: '#5a0f1e', shadow: '#5a0f1e' });
    // the hair itself, and the glint of a blade running along it
    let prev = null;
    for (let x = -4; x <= SW + 4; x += 2) { const y = 110 - x * .35 + Math.sin(x * .05 + t) * 8; if (prev) linePx(g, prev[0], prev[1], x, y, '#f2e2b8'); prev = [x, y]; }
    const gx = (t * 90) % (SW + 60) - 30, gy = 110 - gx * .35 + Math.sin(gx * .05 + t) * 8; drawStar(g, gx, gy, 4, '#ffffff');
    // heartbeat trace
    let px0 = null; for (let x = 100; x < SW - 6; x++) { const ph = ((x - 100) / 60 - beat) % 1, bump = ph < 0 ? 0 : ph < .06 ? -Math.sin(ph / .06 * Math.PI) * 14 : ph < .12 ? Math.sin((ph - .06) / .06 * Math.PI) * 6 : 0; const y = 160 + bump; if (px0) linePx(g, px0[0], px0[1], x, y, '#ff5d5d'); px0 = [x, y]; }
    STG.cardPortrait(g, S, t, { x: 60, y: 192 });
    const nk = t - .3, st = cardFit(d.name, 150, CARD_HAIR_FACE);
    cardPrewarm([[d.name, st]]);
    if (nk > 0) {
      const boxes = cardWord(g, d.name, 176, 24, st, { anim: i => { const lt = nk - i * .05; if (lt <= 0) return { s: 0 }; const j = t > 1 ? 1 : 0; return { a: Math.min(1, lt * 8), dx: j * (hash2(i, fl(t * 14), 1) - .5) * 2, dy: j * (hash2(i, fl(t * 14), 2) - .5) * 2 }; } });
      boxes.forEach((b, i) => { const lt = nk - i * .05; if (lt > 0 && lt < .1) linePx(g, b.cx - 10, 60, b.cx + 10, 20, '#ffffff'); });
    }
    STG.cardSub(g, S, t, 176, 76, { col: '#ffd1d1', out: '#1d0508' });
    STG.cardPill(g, S, t, 176, 104, { rot: 0, draw: (g, k, label, first) => {
      const w = Math.max(100, txtW(label) + 24);
      panel(g, -w / 2, -11, w, 22, '#1d0508', { r: 2, line: '#ff5d5d' });
      txt(g, label, 0, -4, '#ffffff', { align: 'c', bold: true });
    } });
  },
};

// ---- ¡PAPELEO! · the secret Hacienda bonus: an official form, a rubber
// stamp for a title, APROBADO / DENEGADO thumping down, a typewriter motto
const CARD_STAMP_FACE = { id: 'stamp', u: 2.3, nib: 'square', r: 2, slant: 0, gap: 1, fill: ['#c02d45', '#c02d45', '#b0283e'], rim: 0, rough: .45 };
function cardFormPaper() {
  return mdl('cardFormPaper', () => {
    const c = mkCanvas(SW, SH), g = c.g, blue = '#b9cfe0', ink = '#6b7fa0';
    rect(g, 0, 0, SW, SH, '#f6f2e4');
    for (let y = 10; y < SH; y += 8) hline(g, 0, SW, y, '#e4ecf0');
    vline(g, 16, 0, SH, '#f2b8b8');
    // header and fields
    rect(g, 104, 6, 146, 12, '#e8e2cc'); tiny(g, 'HACIENDA · MODELO 303', 108, 9, ink);
    for (const [x, y, w, l] of [[104, 22, 46, 'NIF'], [154, 22, 44, 'EJERCICIO'], [202, 22, 48, 'PERIODO 3T']]) { ringRect(g, x, y, w, 12, 1, blue); tiny(g, l, x + 2, y + 2, ink); }
    // a barcode and a coffee ring
    for (let x = 0; x < 50; x++) if (hash2(x, 88) > .45) vline(g, 198 + x, 176, 188, '#44424f');
    for (let a = 0; a < TAU * .8; a += .02) { const r = 13 + Math.sin(a * 3) * .5; px(g, 150 + Math.cos(a) * r, 176 + Math.sin(a) * r * .8, 'rgba(128,82,43,.35)'); }
    return c;
  });
}
function cardStampFrame(g, w, h, col, rough) {
  for (const [ins, th] of [[0, 2], [4, 1]]) for (let y = -h / 2 + ins; y < h / 2 - ins; y++) for (let x = -w / 2 + ins; x < w / 2 - ins; x++) {
    const edge = x < -w / 2 + ins + th || x >= w / 2 - ins - th || y < -h / 2 + ins + th || y >= h / 2 - ins - th;
    if (edge && vnoise((x + 60) * .4, (y + 60) * .4, 11) > rough * .55) px(g, x, y, col);
  }
}
function cardStampFace(col, u) { return { id: 'stampS' + col, u, nib: 'square', r: u * .7, slant: 0, gap: 1, fill: [col, col, col], rim: 0, rough: .4 }; }
function cardStamp(g, word, x, y, rot, k, col, u) {
  if (k <= 0) return;
  const face = cardStampFace(col, u);
  const w = cardWordW(word, face) + 12, h = 10 * u + 12;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.globalAlpha = .88;
  cardStampFrame(g, w, h, col, .4); cardWord(g, word, 0, -5 * u, face);
  g.restore();
}
CARD_DESIGNS.bonus = {
  top(g, S, t) {
    const d = S.def;
    g.drawImage(cardFormPaper(), 0, 0);
    // a clip holds the form
    rect(g, 30, -2, 22, 14, '#6f7a92'); rect(g, 32, 0, 18, 10, '#a5afc4'); rect(g, 34, 2, 14, 2, '#e1e7f2');
    STG.cardPortrait(g, S, t, { x: 56, y: 190 });
    // the title stamp slams down, the ink splats
    const nk = t - .3, st = cardFit(d.name, 132, CARD_STAMP_FACE);
    cardPrewarm([[d.name, st], ['DENEGADO', cardStampFace('#c02d45', 1.15)], ['APROBADO', cardStampFace('#2f8866', 1.3)]]);
    if (nk > 0) {
      const k = clamp(nk / .12, 0, 1), s = lerp(1.9, 1, E.inQ(k)), w = cardWordW(d.name, st) + 16, h = 10 * st.u + 18;
      g.save(); g.translate(178, 50); g.rotate(-.08); g.scale(s, s); g.globalAlpha = Math.min(1, nk * 8) * .92;
      cardStampFrame(g, w, h, '#c02d45', .45);
      cardWord(g, d.name, 0, -5 * st.u - 1, st);
      g.restore();
      if (k >= 1 && nk < .5) for (let i = 0; i < 12; i++) { const a = hash2(i, 91) * TAU, r = 60 + hash2(i, 92) * 30; disc(g, 178 + Math.cos(a) * r * (nk - .1) * 2, 50 + Math.sin(a) * r * .5 * (nk - .1) * 2, 1 + hash2(i, 93), 'rgba(192,45,69,.7)'); }
    }
    cardStamp(g, 'DENEGADO', 198, 144, .22, t > .95 ? clamp(lerp(1.8, 1, E.inQ(clamp((t - .95) / .1, 0, 1))), 1, 1.8) : 0, '#c02d45', 1.15);
    cardStamp(g, 'APROBADO', 166, 162, -.14, t > 1.35 ? clamp(lerp(1.8, 1, E.inQ(clamp((t - 1.35) / .1, 0, 1))), 1, 1.8) : 0, '#2f8866', 1.3);
    // typewriter motto
    const tx0 = rd(178 - txtW(d.sub) / 2);
    STG.cardSub(g, S, t, tx0, 92, { col: '#1d1424', out: null, cps: 32, align: 'l' });
    if (t > .75 && (fl(t * 3) % 2 === 0 || t < .75 + d.sub.length / 32)) { const n = Math.min(d.sub.length, fl((t - .75) * 32)); rect(g, tx0 + txtW(d.sub.slice(0, n)) + 1, 91, 1, 9, '#1d1424'); }
    // a form field for the visit, ticked in blue biro
    STG.cardPill(g, S, t, 176, 118, { rot: -.02, draw: (g, k, label, first) => {
      const w = Math.max(104, txtW(label) + 34);
      rect(g, -w / 2, -11, w, 22, '#ffffff'); ringRect(g, -w / 2, -11, w, 22, 1, '#6b7fa0');
      ringRect(g, -w / 2 + 5, -6, 12, 12, 1, '#44424f');
      linePx(g, -w / 2 + 7, 0, -w / 2 + 10, 4, '#233b8c'); linePx(g, -w / 2 + 10, 4, -w / 2 + 17, -8, '#233b8c'); linePx(g, -w / 2 + 8, 0, -w / 2 + 11, 4, '#233b8c');
      txt(g, label, 10, -4, '#233b8c', { align: 'c', bold: true });
    } });
  },
};

// the designs live on each stage (the stage's card field), found by id
for (const id in CARD_DESIGNS) if (STAGES[id]) STAGES[id].card = CARD_DESIGNS[id];
