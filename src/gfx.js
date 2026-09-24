// ============================================================================
//  gfx — pixel toolkit made for this game.
//  · named palette + material ramps (dark → light, hue-shifted)
//  · aliased primitives (discs, rings, thick lines, polygons, dithers)
//  · string sprites
//  · MODEL: a part rasteriser. Every part is a signed-distance shape with a
//    material ramp; pixels are lit from the top-left, quantised to the ramp
//    with a light ordered dither, then get contact shadows, part-edge lines and
//    a selective outline (coloured on the lit side, ink on the shadow side).
// ============================================================================
'use strict';

const INK = '#1d1424';
const RAMP = {
  fur: ['#56557a', '#8587ab', '#b3b8d4', '#dfe3f1', '#ffffff'],          // westie white
  cream: ['#8a6a44', '#b9955f', '#dcc08a', '#f2e2b8', '#fff8e6'],
  apricot: ['#6e3520', '#a45a31', '#d4874c', '#f0b573', '#ffdfa8'],
  caramel: ['#4e2616', '#7c3f1f', '#ab6130', '#d58c4c', '#f2b978'],
  black: ['#0e0b16', '#1b1627', '#2b2540', '#40395e', '#5f5883'],
  grey: ['#26242e', '#44424f', '#6b6977', '#9896a4', '#cac8d3'],
  merleBlue: ['#2a2d3d', '#4e5468', '#7b8398', '#a9b1c3', '#d7dde8'],
  copper: ['#5a2412', '#8a3e1c', '#c0662c', '#e2934a', '#f6bf7c'],
  red: ['#3e0d1c', '#7c1830', '#c02d45', '#ec5e5e', '#ffa39a'],
  pink: ['#6b1a45', '#a8356d', '#e05b98', '#ff93bf', '#ffd1e4'],
  skin: ['#6e3b38', '#a8645a', '#d7917c', '#f1bea6', '#ffe3d3'],
  hair: ['#0c060a', '#170c12', '#25141a', '#382027', '#523039'],
  green: ['#07261c', '#0e3a2b', '#17543e', '#2a7356', '#4e9a79'],
  mint: ['#1f5c4a', '#35876b', '#5bb593', '#94dcbc', '#d2f5e4'],
  gold: ['#4d3310', '#83591c', '#bf8d2f', '#e7c35f', '#fff0a6'],
  mustard: ['#553509', '#8a5a12', '#c38a21', '#e6b33e', '#f8dc86'],
  wood: ['#35200f', '#57361c', '#80522b', '#a8713c', '#cf9759'],
  blue: ['#141c47', '#233b8c', '#3565cc', '#63a0ef', '#b3d9ff'],
  sky: ['#2d5aa8', '#4a86d6', '#76b3f0', '#a8d8ff', '#e2f4ff'],
  purple: ['#1e1036', '#381e63', '#5a3396', '#8959c5', '#bf95e9'],
  teal: ['#0c3440', '#155d6b', '#23909a', '#4fc6c2', '#a6f0e2'],
  yellow: ['#5c3c06', '#9c700c', '#e2b21b', '#ffdf4f', '#fff7ae'],
  orange: ['#5a2108', '#9c410f', '#e56f1d', '#ff9f4f', '#ffd49b'],
  steel: ['#232838', '#454d63', '#6f7a92', '#a5afc4', '#e1e7f2'],
  tile: ['#8fa3ad', '#b9cad0', '#dce7ea', '#f2f8f8', '#ffffff'],
  mud: ['#241509', '#3d2512', '#5b3a1d', '#7c5530', '#a07748'],
  lilac: ['#3b2757', '#5e4486', '#8a6cb8', '#b99ce0', '#e5d3fa'],
  water: ['#1b4f8c', '#2f7cc4', '#5aaee6', '#9bd6f7', '#dff4ff'],
};
const C = {
  ink: INK, white: '#ffffff', black: '#0b0810', cream: '#fff4dc', paper: '#fffaf0',
  green: '#17543e', greenD: '#0e3a2b', greenDD: '#07261c', greenL: '#2a7356', mint: '#94dcbc',
  gold: '#e7c35f', goldD: '#bf8d2f', goldDD: '#83591c', goldL: '#fff0a6',
  pink: '#ff5d9e', pinkL: '#ffb3d1', red: '#e23b4e', yellow: '#ffd23f', yellowL: '#fff27a', orange: '#ff8a2a',
  blue: '#3f7fe0', sky: '#8fd0ff', purple: '#6b3fb0', teal: '#2fb3b0', grey: '#9896a4', greyD: '#44424f',
  shadow: 'rgba(29,20,36,.35)',
};

// ---------------------------------------------------------------- primitives
function px(g, x, y, c) { if (c) g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); }
function rect(g, x, y, w, h, c) { if (c) g.fillStyle = c; g.fillRect(rd(x), rd(y), rd(w), rd(h)); }
function hline(g, x0, x1, y, c) { if (c) g.fillStyle = c; if (x1 < x0) [x0, x1] = [x1, x0]; g.fillRect(rd(x0), rd(y), rd(x1) - rd(x0) + 1, 1); }
function vline(g, x, y0, y1, c) { if (c) g.fillStyle = c; if (y1 < y0) [y0, y1] = [y1, y0]; g.fillRect(rd(x), rd(y0), 1, rd(y1) - rd(y0) + 1); }
// filled disc of radius r centred on (cx, cy) — aliased; half-pixel centres make even sizes
function disc(g, cx, cy, r, c) {
  if (c) g.fillStyle = c;
  if (r < .75) { g.fillRect(fl(cx), fl(cy), 1, 1); return; }
  const R = r + .01;
  for (let y = -Math.ceil(R); y <= Math.ceil(R); y++) {
    const yy = y + .5 - (cy - fl(cy)) + 0;
    const hw = Math.sqrt(Math.max(0, R * R - (y + (fl(cy) + .5 - cy)) ** 2));
    if (hw <= 0) continue;
    const x0 = Math.round(cx - hw), x1 = Math.round(cx + hw);
    if (x1 > x0) g.fillRect(x0, fl(cy) + y, x1 - x0, 1);
    void yy;
  }
}
function ellipsePx(g, cx, cy, rx, ry, c) {
  if (c) g.fillStyle = c;
  for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) {
    const t = (y + fl(cy) + .5 - cy) / (ry + .01); if (Math.abs(t) > 1) continue;
    const hw = rx * Math.sqrt(1 - t * t);
    const x0 = Math.round(cx - hw), x1 = Math.round(cx + hw);
    if (x1 > x0) g.fillRect(x0, fl(cy) + y, x1 - x0, 1);
  }
}
function ringPx(g, cx, cy, r, c) {
  if (c) g.fillStyle = c;
  const n = Math.max(8, fl(r * 7));
  let lx = null, ly = null;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, x = rd(cx + Math.cos(a) * r - .5), y = rd(cy + Math.sin(a) * r - .5); if (x !== lx || y !== ly) g.fillRect(x, y, 1, 1); lx = x; ly = y; }
}
function linePx(g, x0, y0, x1, y1, c) {
  if (c) g.fillStyle = c;
  x0 = rd(x0); y0 = rd(y0); x1 = rd(x1); y1 = rd(y1);
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0;
  for (; ;) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1 || n++ > 2000) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function thickLine(g, x0, y0, x1, y1, r, c) {
  if (c) g.fillStyle = c;
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / Math.max(.5, r * .5)));
  for (let i = 0; i <= n; i++) disc(g, lerp(x0, x1, i / n), lerp(y0, y1, i / n), r);
}
function polyPx(g, pts, c) {
  if (c) g.fillStyle = c;
  let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = fl(y0); y <= Math.ceil(y1); y++) {
    const yc = y + .5, xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > yc) !== (yj > yc)) xs.push(xi + (yc - yi) / (yj - yi) * (xj - xi)); }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.round(xs[k]), b = Math.round(xs[k + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
  }
}
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => BAYER4[(y & 3) * 4 + (x & 3)] / 16;
// dither a rect with colour c at density k (0..1)
function ditherRect(g, x, y, w, h, c, k) {
  g.fillStyle = c; x = rd(x); y = rd(y);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bayer(x + i, y + j) < k) g.fillRect(x + i, y + j, 1, 1);
}
// vertical gradient in hard bands (with a one-row dither between bands)
function bandsV(g, x, y, w, h, cols) {
  const n = cols.length;
  for (let j = 0; j < h; j++) {
    const v = j / h * n, i = fl(v), f = v - i;
    g.fillStyle = cols[Math.min(n - 1, i)]; g.fillRect(x, y + j, w, 1);
    if (f > .75 && i + 1 < n) { g.fillStyle = cols[i + 1]; for (let q = (j & 1); q < w; q += 2) g.fillRect(x + q, y + j, 1, 1); }
  }
}

// ---------------------------------------------------------------- sprites ---
// rows of characters; map: char → colour ('.' and ' ' are transparent)
const SPRCACHE = new Map();
function spr(rows, map, key) {
  if (key && SPRCACHE.has(key)) return SPRCACHE.get(key);
  if (typeof rows === 'string') rows = rows.replace(/^\n+|\n+\s*$/g, '').split('\n').map(r => r.replace(/^\s+/, m => m.replace(/ /g, '')));
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const c = mkCanvas(w, h), g = c.g;
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) { const ch = rows[y][x]; if (ch === '.' || ch === ' ') continue; const col = map[ch]; if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } }
  if (key) SPRCACHE.set(key, c);
  return c;
}
function flipX(src) { const c = mkCanvas(src.width, src.height); c.g.translate(src.width, 0); c.g.scale(-1, 1); c.g.drawImage(src, 0, 0); return c; }
// solid silhouette (for hit flashes, shadows, masks)
function silhouette(src, col) { const c = mkCanvas(src.width, src.height); c.g.drawImage(src, 0, 0); c.g.globalCompositeOperation = 'source-in'; c.g.fillStyle = col; c.g.fillRect(0, 0, c.width, c.height); return c; }
// 1px outline around opaque pixels (grows canvas by 1 on each side)
function outlined(src, col = INK, diag = false) {
  const w = src.width, h = src.height, c = mkCanvas(w + 2, h + 2), s = silhouette(src, col);
  const offs = diag ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] : [[0, -1], [-1, 0], [1, 0], [0, 1]];
  for (const [dx, dy] of offs) c.g.drawImage(s, 1 + dx, 1 + dy);
  c.g.drawImage(src, 1, 1); return c;
}
// draw an image with anchor / scale / rotation / flip / alpha. Integer origin keeps pixels on the grid.
function drawS(g, img, x, y, o) {
  if (!img) return;
  const ax = o && o.ax != null ? o.ax : .5, ay = o && o.ay != null ? o.ay : .5;
  const sx = (o && o.sx != null ? o.sx : 1) * (o && o.s != null ? o.s : 1), sy = (o && o.sy != null ? o.sy : 1) * (o && o.s != null ? o.s : 1);
  const rot = o && o.rot || 0, flip = o && o.flip;
  const a = o && o.alpha != null ? o.alpha : 1;
  if (a <= 0 || sx === 0 || sy === 0) return;
  if (!rot && sx === 1 && sy === 1 && !flip) {
    if (a < 1) g.globalAlpha = a;
    g.drawImage(img, rd(x - img.width * ax), rd(y - img.height * ay));
    if (a < 1) g.globalAlpha = 1;
    return;
  }
  g.save(); g.translate(rd(x), rd(y)); if (rot) g.rotate(rot); g.scale(flip ? -sx : sx, sy); g.globalAlpha = a;
  g.drawImage(img, -rd(img.width * ax), -rd(img.height * ay)); g.restore();
}

const LIGHT = (() => { const l = [-.55, -.72, .62], m = Math.hypot(...l); return l.map(v => v / m); })();
// ---------------------------------------------------------------- SDF shapes
const SD = {
  circle: (cx, cy, r) => (x, y) => Math.hypot(x - cx, y - cy) - r,
  ellipse: (cx, cy, rx, ry, rot = 0) => { const c = Math.cos(rot), s = Math.sin(rot); return (x, y) => { const dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c; const k0 = Math.hypot(u / rx, v / ry); if (k0 === 0) return -Math.min(rx, ry); const k1 = Math.hypot(u / (rx * rx), v / (ry * ry)); return k0 * (k0 - 1) / k1; }; },
  capsule: (x0, y0, x1, y1, r0, r1 = r0) => (x, y) => { const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy; let t = L ? ((x - x0) * dx + (y - y0) * dy) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(x - (x0 + dx * t), y - (y0 + dy * t)) - (r0 + (r1 - r0) * t); },
  box: (cx, cy, hw, hh, r = 0, rot = 0) => { const c = Math.cos(rot), s = Math.sin(rot); return (x, y) => { const dx = x - cx, dy = y - cy, u = Math.abs(dx * c + dy * s) - hw + r, v = Math.abs(-dx * s + dy * c) - hh + r; return Math.hypot(Math.max(u, 0), Math.max(v, 0)) + Math.min(Math.max(u, v), 0) - r; }; },
  poly: pts => (x, y) => {
    let d = Infinity, s = 1;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j], ex = xj - xi, ey = yj - yi, wx = x - xi, wy = y - yi;
      const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey || 1), 0, 1), bx = wx - ex * t, by = wy - ey * t;
      d = Math.min(d, bx * bx + by * by);
      const c1 = y >= yi, c2 = y < yj, c3 = ex * wy > ey * wx;
      if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    }
    return s * Math.sqrt(d);
  },
  // quadratic-ish tapered curve through 3 points (for tails, strands, horns)
  curve: (p0, p1, p2, r0, r1, n = 12) => { const segs = []; let lp = p0; for (let i = 1; i <= n; i++) { const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; const p = [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]; segs.push(SD.capsule(lp[0], lp[1], p[0], p[1], lerp(r0, r1, (i - 1) / n), lerp(r0, r1, i / n))); lp = p; } return (x, y) => { let d = Infinity; for (const f of segs) d = Math.min(d, f(x, y)); return d; }; },
  union: (...fs) => (x, y) => { let d = Infinity; for (const f of fs) d = Math.min(d, f(x, y)); return d; },
  smooth: (k, ...fs) => (x, y) => { let d = fs[0](x, y); for (let i = 1; i < fs.length; i++) { const e = fs[i](x, y), h = clamp(.5 + .5 * (e - d) / k, 0, 1); d = lerp(e, d, h) - k * h * (1 - h); } return d; },
  sub: (a, b) => (x, y) => Math.max(a(x, y), -b(x, y)),
  inter: (a, b) => (x, y) => Math.max(a(x, y), b(x, y)),
  grow: (f, o) => (x, y) => f(x, y) - o,
  move: (f, dx, dy) => (x, y) => f(x - dx, y - dy),
  // fluffy edge: tufts around a centre (n tufts, pointy when sharp is high)
  tufts: (f, cx, cy, amp, n, seed = 0, sharp = 2) => (x, y) => { const a = Math.atan2(y - cy, x - cx); const w = Math.abs(Math.sin(a * n / 2 + seed + Math.sin(a * 3 + seed) * .6)); return f(x, y) - amp * (Math.pow(w, sharp) - .35); },
  // fur by noise (irregular clumps along any edge)
  shag: (f, amp, freq, seed = 0) => (x, y) => f(x, y) - amp * (fbm(x * freq, y * freq, seed) - .45) * 2,
  // bumpy curls (poodles, doodles)
  curls: (f, amp, freq, seed = 0) => (x, y) => f(x, y) - amp * (Math.abs(Math.sin(x * freq + Math.sin(y * freq * .8 + seed) * 1.7) * Math.sin(y * freq * 1.1 + Math.cos(x * freq * .7 + seed) * 1.7)) - .25),
};

// Fur clumps: a jittered cell pattern, each cell a tiny lit dome (light top-left),
// darker at its rim. stretch > 1 makes clumps longer vertically (hanging fur).
function clumpTex(size = 5, str = .35, seed = 1, stretch = 1.3, rim = .5) {
  return (x, y) => {
    const ci = fl(x / size), cj = fl(y / (size * stretch));
    let best = 1e9, bdx = 0, bdy = 0;
    for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
      const sx = (i + .15 + hash2(i, j, seed) * .7) * size, sy = (j + .15 + hash2(i, j, seed + 9) * .7) * size * stretch;
      const dx = x - sx, dy = (y - sy) / stretch, d = dx * dx + dy * dy;
      if (d < best) { best = d; bdx = dx; bdy = dy; }
    }
    const r = Math.sqrt(best) / (size * .62);
    return (-(bdx * LIGHT[0] + bdy * LIGHT[1]) / size) * str - r * r * str * rim;
  };
}
// ---------------------------------------------------------------- MODEL -----
// parts: { f, ramp, z=0, th=6 (thickness), prof:'dome'|'flat'|'cyl', amb=.28, dif=1, tex:(x,y)=>dv,
//          paint:(x,y)=>ramp|null, dith=.45, edge=true, gloss=false, out=true, lineCol }
function model(w, h, parts, opt = {}) {
  const N = w * h, pid = new Int16Array(N).fill(-1), val = new Float32Array(N);
  const order = parts.map((p, i) => [p.z || 0, i]).sort((a, b) => b[0] - a[0]).map(v => v[1]);
  const prof = (p, d) => { const th = p.th || 6, t = clamp(-d / th, 0, 1); if (p.prof === 'flat') return t > 0 ? 1 : 0; if (p.prof === 'cyl') return Math.sqrt(1 - (1 - t) * (1 - t)) * .7 + .3 * t; return Math.sqrt(1 - (1 - t) * (1 - t)); };
  // coarse occupancy per part (cells of CS px): skip parts far from a pixel
  const CS = 4, gw = Math.ceil(w / CS), gh = Math.ceil(h / CS), margin = CS * .75 + 7;
  const occ = parts.map(p => { const m = new Uint8Array(gw * gh); for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) if (p.f((i + .5) * CS, (j + .5) * CS) < margin) m[j * gw + i] = 1; return m; });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = x + .5, Y = y + .5, cell = fl(y / CS) * gw + fl(x / CS);
    for (const i of order) {
      if (!occ[i][cell]) continue;
      const p = parts[i], d = p.f(X, Y);
      if (d < 0) {
        const idx = y * w + x; pid[idx] = i;
        let v;
        if (p.prof === 'flat' || p.lit === false) v = p.flatV != null ? p.flatV : .62;
        else {
          const th = p.th || 6, e = .8, fs = p.fs || p.f; // fs: smooth shape used for lighting (fur keeps its tufts out of the shading)
          const h0 = prof(p, fs === p.f ? d : fs(X, Y)) * th, hx1 = prof(p, fs(X + e, Y)) * th, hy1 = prof(p, fs(X, Y + e)) * th;
          let nx = -(hx1 - h0) / e, ny = -(hy1 - h0) / e, nz = 1; const m = Math.hypot(nx, ny, nz); nx /= m; ny /= m; nz /= m;
          const dot = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
          v = (p.amb != null ? p.amb : .26) + (p.dif != null ? p.dif : .9) * Math.max(0, dot);
          if (p.gloss && dot > .93) v = 9;
        }
        if (p.tex) v += p.tex(X, Y);
        val[idx] = v;
        break;
      }
    }
  }
  const c = mkCanvas(w, h), g = c.g, img = g.createImageData(w, h), D = img.data;
  const hex = {}; const rgb = s => hex[s] || (hex[s] = [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]);
  const put = (idx, col) => { const q = rgb(col); D[idx * 4] = q[0]; D[idx * 4 + 1] = q[1]; D[idx * 4 + 2] = q[2]; D[idx * 4 + 3] = 255; };
  const at = (x, y) => x < 0 || y < 0 || x >= w || y >= h ? -1 : pid[y * w + x];
  const zOf = i => i < 0 ? -1e9 : (parts[i].z || 0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const idx = y * w + x, i = pid[idx];
    if (i < 0) continue;
    const p = parts[i];
    let ramp = p.ramp;
    if (p.paint) { const r2 = p.paint(x + .5, y + .5); if (r2) ramp = r2; }
    const n = ramp.length;
    let v = val[idx];
    if (v >= 9) { put(idx, p.glossCol || '#ffffff'); continue; }
    const dth = p.dith != null ? p.dith : .45;
    let k = fl(v * n + (bayer(x, y) - .5) * dth);
    // contact shadow: something in front of us sits toward the light
    if (p.cast !== false) for (const [ox, oy] of [[-1, -1], [-1, -2], [0, -2]]) { const j = at(x + ox, y + oy); if (j >= 0 && j !== i && zOf(j) > zOf(i) && !parts[j].noCast) { k -= 1; break; } }
    k = clamp(k, 0, n - 1);
    let col = ramp[k];
    // part edge line where we meet something behind us
    if (p.edge !== false) {
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const j = at(x + ox, y + oy);
        if (j >= 0 && j !== i && zOf(j) < zOf(i) && parts[j].ramp !== p.ramp) { col = p.lineCol || ramp[0]; break; }
      }
    }
    put(idx, col);
  }
  // selective outline around the whole model
  if (opt.outline !== false) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const idx = y * w + x; if (pid[idx] >= 0) continue;
      let best = -1, lit = false;
      for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = at(x + ox, y + oy); if (j >= 0 && parts[j].out !== false) { best = j; if (ox > 0 || oy > 0) lit = true; } }
      if (best < 0) continue;
      const p = parts[best];
      put(idx, lit && opt.selout !== false && !p.inkOut ? (p.outCol || darker(p.ramp[0])) : (opt.ink || INK));
    }
  }
  g.putImageData(img, 0, 0);
  if (opt.post) opt.post(g, c);
  return c;
}
function darker(hexs) { const q = [parseInt(hexs.slice(1, 3), 16), parseInt(hexs.slice(3, 5), 16), parseInt(hexs.slice(5, 7), 16)].map(v => clamp(rd(v * .62 + 29 * .38 * .3), 0, 255)); return '#' + q.map(v => v.toString(16).padStart(2, '0')).join(''); }
function mixHex(a, b, t) { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), Bq = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => rd(lerp(v, Bq[i], t)).toString(16).padStart(2, '0')).join(''); }
const MODELS = new Map();
// memoised model: key → canvas
function mdl(key, fn) { let c = MODELS.get(key); if (!c) { c = fn(); MODELS.set(key, c); } return c; }

// ---------------------------------------------------------------- patterns --
const PATS = new Map();
function pattern(key, w, h, fn) { let p = PATS.get(key); if (!p) { const c = mkCanvas(w, h); fn(c.g, w, h); p = c; PATS.set(key, p); } return p; }
// fill a rect with a pattern canvas, scrolled by (ox, oy)
function fillPat(g, pat, x, y, w, h, ox = 0, oy = 0) {
  const pw = pat.width, ph = pat.height;
  const sx = ((rd(ox) % pw) + pw) % pw, sy = ((rd(oy) % ph) + ph) % ph;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let yy = y - sy; yy < y + h; yy += ph) for (let xx = x - sx; xx < x + w; xx += pw) g.drawImage(pat, xx, yy);
  g.restore();
}

// ---------------------------------------------------------------- particles -
// A particle layer; each microgame / scene owns one so zooms carry it along.
class FX {
  constructor() { this.p = []; }
  add(o) { const p = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0, life: .6, t: 0, k: 'spark', c: '#fff', r: 2, rot: 0, vr: 0 }, o); this.p.push(p); return p; }
  burst(x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = (o.a0 != null ? o.a0 : 0) + (o.spread != null ? o.spread : TAU) * (i + rnd(.8)) / n, sp = rnd(o.sp0 != null ? o.sp0 : 30, o.sp1 != null ? o.sp1 : 90);
      this.add(Object.assign({}, o, { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rnd(o.life0 || .35, o.life1 || .7), c: Array.isArray(o.c) ? pick(o.c) : o.c, r: o.r != null ? o.r : rnd(1, 2.5), rot: rnd(TAU), vr: rnd(-12, 12) }));
    }
  }
  update(dt) {
    for (let i = this.p.length - 1; i >= 0; i--) {
      const p = this.p[i]; p.t += dt;
      if (p.t >= p.life) { this.p.splice(i, 1); continue; }
      p.vy += p.g * dt; if (p.drag) { const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.floor != null && p.y > p.floor) { p.y = p.floor; p.vy *= -.35; p.vx *= .6; }
    }
  }
  draw(g) {
    for (const p of this.p) {
      const k = p.t / p.life, x = p.x, y = p.y;
      switch (p.k) {
        case 'spark': { const r = p.r * (1 - k); if (r < .5) { px(g, x, y, p.c); break; } g.fillStyle = p.c; const R = Math.max(1, rd(r * 1.6)); g.fillRect(rd(x) - R, rd(y), R * 2 + 1, 1); g.fillRect(rd(x), rd(y) - R, 1, R * 2 + 1); if (R > 1) g.fillRect(rd(x) - 1, rd(y) - 1, 3, 3); break; }
        case 'dot': disc(g, x, y, p.r * (1 - k * .7), p.c); break;
        case 'star': drawStar(g, x, y, p.r * (1 - k * .5) + 1, p.c, p.rot); break;
        case 'ring': { g.globalAlpha = 1 - k; ringPx(g, x, y, p.r + k * (p.grow || 14), p.c); g.globalAlpha = 1; break; }
        case 'bubble': { const r = p.r * (1 + k * .2); ringPx(g, x, y, r, p.c); px(g, x - r * .4, y - r * .4, '#ffffff'); break; }
        case 'drop': { const len = clamp(Math.hypot(p.vx, p.vy) * .03, 1, 4); g.fillStyle = p.c; const ang = Math.atan2(p.vy, p.vx); for (let q = 0; q < len; q++) g.fillRect(rd(x - Math.cos(ang) * q), rd(y - Math.sin(ang) * q), q === 0 ? 2 : 1, q === 0 ? 2 : 1); break; }
        case 'hair': { g.fillStyle = p.c; const L = p.r * 2 + 2; for (let q = 0; q < L; q++) g.fillRect(rd(x + Math.cos(p.rot) * q + Math.sin(q * .9) * .6), rd(y + Math.sin(p.rot) * q), 1, 1); break; }
        case 'conf': { g.fillStyle = p.c; const w2 = Math.max(1, rd(Math.abs(Math.cos(p.rot)) * 3)); g.fillRect(rd(x), rd(y), w2, 2); break; }
        case 'puff': { const r = p.r * (.6 + k * .9); g.globalAlpha = 1 - k * k; disc(g, x, y, r, p.c); g.globalAlpha = 1; break; }
        case 'txt': { const a = k < .7 ? 1 : 1 - (k - .7) / .3; g.globalAlpha = a; txt(g, p.s, x, y - k * 6, p.c, { align: 'c', out: p.out || INK }); g.globalAlpha = 1; break; }
        case 'heart': drawHeart(g, x, y, p.c, 1 - k * .3); break;
        case 'spr': drawS(g, p.img, x, y, { rot: p.rot, alpha: k > .7 ? 1 - (k - .7) / .3 : 1, s: p.s || 1 }); break;
      }
    }
  }
  clear() { this.p.length = 0; }
}
function drawStar(g, x, y, r, c, rot = 0) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  polyPx(g, pts, c);
}
function drawHeart(g, x, y, c, s = 1) {
  const r = 2.2 * s; disc(g, x - r * .9, y - r * .3, r, c); disc(g, x + r * .9, y - r * .3, r, c);
  polyPx(g, [[x - r * 1.9, y], [x + r * 1.9, y], [x, y + r * 2.1]], c);
}

// ---------------------------------------------------------------- misc -----
// soft ground shadow ellipse (dithered)
function shadowOval(g, x, y, rx, ry, k = .55) {
  g.fillStyle = INK;
  for (let j = -Math.ceil(ry); j <= Math.ceil(ry); j++) {
    const t = j / (ry + .01); if (Math.abs(t) > 1) continue;
    const hw = rx * Math.sqrt(1 - t * t);
    for (let i = Math.round(-hw); i < Math.round(hw); i++) { const xx = rd(x) + i, yy = rd(y) + j; if (bayer(xx, yy) < k) g.fillRect(xx, yy, 1, 1); }
  }
}
// rectangular ring of thickness t (a frame that leaves the inside alone)
function ringRect(g, x, y, w, h, t, c) { x = rd(x); y = rd(y); w = rd(w); h = rd(h); if (c) g.fillStyle = c; g.fillRect(x, y, w, t); g.fillRect(x, y + h - t, w, t); g.fillRect(x, y + t, t, h - t * 2); g.fillRect(x + w - t, y + t, t, h - t * 2); }
// rounded panel with 1px ink outline + light top rim
function panel(g, x, y, w, h, fill, o = {}) {
  x = rd(x); y = rd(y); w = rd(w); h = rd(h);
  const r = o.r != null ? o.r : 3, line = o.line || INK;
  g.fillStyle = line;
  g.fillRect(x + r, y, w - r * 2, h); g.fillRect(x, y + r, w, h - r * 2);
  for (let i = 0; i < r; i++) { const k = r - Math.round(Math.sqrt(r * r - (r - i - .5) ** 2)); g.fillRect(x + k, y + i, w - k * 2, 1); g.fillRect(x + k, y + h - 1 - i, w - k * 2, 1); }
  g.fillStyle = fill;
  const x1 = x + 1, y1 = y + 1, w1 = w - 2, h1 = h - 2, r1 = Math.max(0, r - 1);
  g.fillRect(x1 + r1, y1, w1 - r1 * 2, h1); g.fillRect(x1, y1 + r1, w1, h1 - r1 * 2);
  for (let i = 0; i < r1; i++) { const k = r1 - Math.round(Math.sqrt(r1 * r1 - (r1 - i - .5) ** 2)); g.fillRect(x1 + k, y1 + i, w1 - k * 2, 1); g.fillRect(x1 + k, y1 + h1 - 1 - i, w1 - k * 2, 1); }
  if (o.hi) { g.fillStyle = o.hi; g.fillRect(x1 + r1, y1, w1 - r1 * 2, 1); }
  if (o.lo) { g.fillStyle = o.lo; g.fillRect(x1 + r1, y1 + h1 - 1, w1 - r1 * 2, 1); }
}

// ---------------------------------------------------------------- warm-up ---
// Heavy pictures are built in the background, one job per frame, so the game
// never hitches on a phone (boot and title screens give it time).
const WARM = [];
function warm(fn) { WARM.push(fn); }
function warmStep(budgetMs = 9) {
  const t0 = performance.now();
  while (WARM.length && performance.now() - t0 < budgetMs) { try { WARM.shift()(); } catch (e) { } }
}
