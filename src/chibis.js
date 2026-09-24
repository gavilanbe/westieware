// ============================================================================
//  chibis — the little characters that walk around the menu, hand-pixelled.
//  STAGES[id].chibi = (frame, t) => canvas; keikoChibi(frame, t) for Keiko.
//  Frames: walk0 | walk1 | idle | happy | held. Feet at the bottom centre.
//  Every sprite is built from pixel maps (rows of palette letters, '.' = clear)
//  stamped part by part (hair behind, legs, torso, head, arms in front) and then
//  ringed in ink, so all the walkers share one scale, one outline and one light.
// ============================================================================
'use strict';

const CHIBI = {
  // ---------------------------------------------------------------- pixels --
  // run-length rows: 'a h2 s8 .3' → 'ahhssssssss...'; a token without a count
  // is copied as it is ('ew' → 'ew')
  R(s) { return s.split(' ').filter(Boolean).map(tk => { const m = tk.match(/^(.)(\d+)$/); return m ? m[1].repeat(+m[2]) : tk; }).join(''); },
  map(rows, dx = 0, dy = 0) { const m = rows.map(r => CHIBI.R(r)); m.dx = dx; m.dy = dy; return m; },
  mirror(rows) { const m = rows.map(r => r.split('').reverse().join('')); m.dx = rows.dx; m.dy = rows.dy; return m; },
  grid(w, h) { return { w, h, p: new Array(w * h).fill(null) }; },
  stamp(G, rows, pal, x = 0, y = 0) {
    x += rows.dx || 0; y += rows.dy || 0;
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[i]; if (ch === '.' || ch === ' ') continue;
        const col = pal[ch]; if (col === undefined) throw new Error('chibi: no colour for "' + ch + '"');
        const xx = x + i, yy = y + j;
        if (xx >= 0 && yy >= 0 && xx < G.w && yy < G.h) G.p[yy * G.w + xx] = col;
      }
    }
    return G;
  },
  // the ink ring around the whole silhouette (grows the grid by one pixel all round)
  outline(G, col = INK) {
    const O = CHIBI.grid(G.w + 2, G.h + 2);
    for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) if (G.p[y * G.w + x]) O.p[(y + 1) * O.w + x + 1] = G.p[y * G.w + x];
    const on = (x, y) => x >= 0 && y >= 0 && x < G.w && y < G.h && !!G.p[y * G.w + x];
    for (let y = 0; y < O.h; y++) for (let x = 0; x < O.w; x++) {
      if (O.p[y * O.w + x]) continue;
      const gx = x - 1, gy = y - 1;
      if (on(gx - 1, gy) || on(gx + 1, gy) || on(gx, gy - 1) || on(gx, gy + 1)) O.p[y * O.w + x] = col;
    }
    return O;
  },
  canvas(G) {
    const c = mkCanvas(G.w, G.h);
    for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) { const col = G.p[y * G.w + x]; if (col) { c.g.fillStyle = col; c.g.fillRect(x, y, 1, 1); } }
    return c;
  },
  // ---------------------------------------------------------------- timing --
  // The menu flips walk0/walk1 six times a second per walker; the global clock
  // splits each of those into contact + passing, so the walk has four beats.
  pose(frame, t = 0, seed = 0) {
    const sub = Math.floor(t * 12 + seed) % 2;
    if (frame === 'walk0') return sub ? 'passA' : 'stepA';
    if (frame === 'walk1') return sub ? 'passB' : 'stepB';
    if (frame === 'happy') return Math.floor(t * 5 + seed) % 2 ? 'happyB' : 'happyA';
    if (frame === 'held') return Math.floor(t * 7 + seed) % 2 ? 'heldB' : 'heldA';
    const cyc = (t + seed * .37) % 3.4;
    return cyc > 3.25 ? 'blink' : cyc % 1.7 < .85 ? 'idle' : 'idleUp';
  },
  // outline, drop the empty rows on top (the feet stay on the bottom row), paint
  make(key, fn) { return mdl('chibiD:' + key, () => CHIBI.canvas(CHIBI.cropTop(CHIBI.outline(fn())))); },
  cropTop(G) {
    let top = 0; while (top < G.h - 1 && G.p.slice(top * G.w, top * G.w + G.w).every(c => !c)) top++;
    if (!top) return G;
    const O = CHIBI.grid(G.w, G.h - top); O.p = G.p.slice(top * G.w); return O;
  },
  // ---------------------------------------------------------------- shapes --
  // exact pixel-centre rasterising on a grid, plus rim light and ink seams, so a
  // part is drawn in one colour and comes out lit from the top-left
  ell(G, cx, cy, rx, ry, col) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const u = (x + .5 - cx) / rx, v = (y + .5 - cy) / ry; if (u * u + v * v <= 1) CHIBI.px(G, x, y, col); } return G; },
  poly(G, pts, col) {
    const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys)), xs = pts.map(p => p[0]), x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const px = x + .5, py = y + .5; let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
      if (inside) CHIBI.px(G, x, y, col);
    }
    return G;
  },
  rect(G, x, y, w, h, col) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) CHIBI.px(G, x + i, y + j, col); return G; },
  px(G, x, y, col) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < G.w && y < G.h) G.p[y * G.w + x] = col; return G; },
  at(G, x, y) { return x >= 0 && y >= 0 && x < G.w && y < G.h ? G.p[y * G.w + x] : null; },
  // draw a part: fn paints it flat in any colour on its own grid; tones [dark, mid, light]
  // shade it (light on the top-left rim, dark on the bottom-right rim) and lay it on G,
  // with an optional seam where it overlaps what is already there
  part(G, fn, tones, o = {}) {
    const T = CHIBI.grid(G.w, G.h); fn(T);
    const [dk, md, lt] = tones, hole = (x, y) => !CHIBI.at(T, x, y);
    for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
      if (!T.p[y * T.w + x]) continue;
      let c = md;
      if (!o.flat) { if (hole(x, y + 1) || (o.rimR !== false && hole(x + 1, y))) c = dk; else if (lt && (hole(x, y - 1) || hole(x - 1, y))) c = lt; }
      T.p[y * T.w + x] = c;
    }
    if (o.seam) for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) {
      if (T.p[y * T.w + x] || !CHIBI.at(G, x, y)) continue;
      if (CHIBI.at(T, x - 1, y) || CHIBI.at(T, x + 1, y) || CHIBI.at(T, x, y - 1) || CHIBI.at(T, x, y + 1)) G.p[y * G.w + x] = o.seam;
    }
    for (let i = 0; i < T.p.length; i++) if (T.p[i]) G.p[i] = T.p[i];
    return G;
  },
  // hand a stage its walker (partial builds may leave some stages out)
  put(id, fn) { if (typeof STAGES !== 'undefined' && STAGES[id]) STAGES[id].chibi = fn; },

  // ---------------------------------------------------------------- bipeds --
  // A: { W, H, x, headY, torsoY, pal, parts: { head: {…}, torso: {…}, legs: {…}, front: {…}, back: {…} } }
  // Each pose names one map per slot; legs stand on the bottom row, the rest bobs.
  POSES: {
    idle: { head: 'idle', torso: 'down', legs: 'stand' },
    idleUp: { head: 'idle', torso: 'down', legs: 'stand', bob: -1 },
    blink: { head: 'blink', torso: 'down', legs: 'stand' },
    stepA: { head: 'idle', torso: 'swingA', legs: 'stepA' },
    stepB: { head: 'idle', torso: 'swingB', legs: 'stepB' },
    passA: { head: 'idle', torso: 'down', legs: 'pass', bob: -1 },
    passB: { head: 'idle', torso: 'down', legs: 'pass', bob: -1 },
    happyA: { head: 'happy', torso: 'up', legs: 'stand', front: 'up' },
    happyB: { head: 'happy', torso: 'up', legs: 'pass', front: 'upB', bob: -1 },
    heldA: { head: 'held', torso: 'up', legs: 'dangleA', front: 'held' },
    heldB: { head: 'held', torso: 'up', legs: 'dangleB', front: 'held' },
  },
  biped(A, pose) {
    const G = CHIBI.grid(A.W, A.H), P = A.pal, X = A.x || 0, S = Object.assign({}, CHIBI.POSES[pose], A.poses && A.poses[pose]);
    const part = (slot, name) => { const set = A.parts[slot]; return set && (set[name] || set[Object.keys(set)[0]]); };
    const bob = S.bob || 0, lift = S.lift || 0;
    const back = S.back || 'main', head = part('head', S.head), torso = part('torso', S.torso), legs = part('legs', S.legs);
    if (A.parts.back) CHIBI.stamp(G, part('back', back), P, X, A.headY + bob);
    const legsY = A.H - legs.length + lift, torsoBottom = A.torsoY + bob + torso.length;
    for (let y = torsoBottom; y < legsY; y++) CHIBI.stamp(G, [legs[0]], P, X + (legs.dx || 0), y);   // no gap when the body bobs
    CHIBI.stamp(G, legs, P, X, legsY);
    CHIBI.stamp(G, torso, P, X, A.torsoY + bob);
    CHIBI.stamp(G, head, P, X, A.headY + bob);
    if (S.front && A.parts.front && A.parts.front[S.front]) CHIBI.stamp(G, A.parts.front[S.front], P, X, A.torsoY + bob);
    if (A.extra) A.extra(G, pose, bob);
    return G;
  },
};

// ============================================================================
//  ANAHÍ — long brown hair with the fringe swept from her parting, blush, black
//  tee, the crossbody strap and bag, mustard lattice trousers, black shoes.
// ============================================================================
const CHIBI_ANAHI = (() => {
  const M = CHIBI.map;
  const hair = [
    '.5 a6 .5',
    '.3 a2 h6 a2 .3',
    '.2 a h j3 h4 a h a .2',
    '. a h j2 J j h4 a h2 a .',
    '. a h j2 h6 a h2 a .',
    'a h2 j h11 a',
    'a h2 j h6 l3 h2 a',
    'a h7 S l4 h2 a',
    'a h4 S l7 h2 a',
  ];
  const face = (r9, r10, r11, r12) => M(hair.concat([r9, r10, r11, r12, 'a h4 S s4 S h4 a']));
  const head = {
    idle: face('a h s l ew l4 ew l S h a', 'a h s l e2 l4 e2 l S h a', 'a h s b l3 m2 l3 b S h a', 'a h2 S s8 S h2 a'),
    blink: face('a h s l3 l4 l3 S h a', 'a h s l e2 l4 e2 l S h a', 'a h s b l3 m2 l3 b S h a', 'a h2 S s8 S h2 a'),
    happy: face('a h s l e l5 e l2 S h a', 'a h s e l e l3 e l e l S h a', 'a h s b l2 M m2 M l2 b S h a', 'a h2 S s3 M2 s3 S h2 a'),
    held: face('a h s l ew l4 ew l S h a', 'a h s l e2 l4 e2 l S h a', 'a h s b l3 M2 l3 b S h a', 'a h2 S s3 M2 s3 S h2 a'),
  };
  const torso = {
    down: M([
      'a h3 A3 S2 A3 h3 a',
      'a h2 T g T t s2 t3 u h2 a',
      'a h2 T2 g t6 u h2 a',
      'a h l s T t g t4 u s S h a',
      'a h l s T t2 g t3 u s S h a',
      '. a l s T t3 g t2 u s S a .',
      '.2 s S T t4 g G y2 G .2',
      '.2 S2 u t5 G g2 G .2',
    ]),
    // arms lifted out of the picture: the front layer draws them
    up: M([
      'a h3 A3 S2 A3 h3 a',
      'a h2 T g T t s2 t3 u h2 a',
      'a h2 T2 g t6 u h2 a',
      'a h3 T t g t4 u h3 a',
      'a h3 T t2 g t3 u h3 a',
      '. a h2 T t3 g t2 u h2 a .',
      '.4 T t4 g G y2 G .2',
      '.4 u t5 G g2 G .2',
    ]),
  };
  // walking: the free hand swings (the other one is behind the bag)
  torso.swingA = M(['a h3 A3 S2 A3 h3 a', 'a h2 T g T t s2 t3 u h2 a', 'a h2 T2 g t6 u h2 a', 'a h l s T t g t4 u s S h a', 'a h l s T t2 g t3 u s S h a', '. a s S T t3 g t2 u s S a .', '.2 S2 T t4 g G y2 G .2', '.4 u t5 G g2 G .2']);
  torso.swingB = torso.down;
  // raised arms, drawn over the hair: fists up beside the head
  const front = {
    up: M(['l s .16 s S', 'S s .16 s S', '. l s .14 s S .', '. l s .14 s S .', '.2 s S .12 s S .2', '.2 s S .12 s S .2', '.3 T2 .10 u2 .3', '.4 T .10 u .4'], -2, -6),
    upB: M(['l s .16 s S', 'S s .16 s S', '. l s .14 s S .', '.2 s S .12 s S .2', '.2 s S .12 s S .2', '.3 T2 .10 u2 .3', '.4 T .10 u .4'], -2, -5),
  };
  front.held = front.up;
  // mustard trousers: one top for every pose, the hems and shoes change
  const top = ['.4 P8 .4', '.4 q p2 P q p2 P .4', '.4 q x p P q p x P .4', '.4 q p2 P q p2 P .4', '.3 q p x p P q p x p P .3', '.3 q p3 P q p3 P .3'];
  const legs = {
    stand: M(top.concat(['.3 q p2 P .2 q p2 P .3', '.3 i o3 .2 i o3 .3', '.3 O4 .2 O4 .3'])),
    stepA: M(top.concat(['.3 q p2 P .2 i o2 O .3', '.3 i o3 .2 O4 .3', '.3 O4 .9'])),
    dangleA: M(top.concat(['.3 q p2 P .2 q p2 P .3', '.4 i o O .2 q p2 P .3', '.9 i o2 O .3'])),
  };
  legs.pass = legs.stand;
  legs.stepB = CHIBI.mirror(legs.stepA);
  legs.dangleB = CHIBI.mirror(legs.dangleA);
  return {
    W: 20, H: 34, x: 2, headY: 3, torsoY: 17,
    parts: { head, torso, legs, front },
    pal: {
      A: '#1a0f0b', a: '#2f1b13', h: '#4a2c1e', j: '#6e4430', J: '#94603f',
      S: '#d4927a', s: '#f5c6a5', l: '#ffe0c8', b: '#f08a80', e: '#1d1424', w: '#ffffff', m: '#c9404a', M: '#6e1624',
      u: '#0f0d14', t: '#211d29', T: '#3a3446',
      G: '#6b3f14', g: '#c28a2e', y: '#e8b85c',
      P: '#a45a18', p: '#d68b27', q: '#f2b044', x: '#8a4a12',
      O: '#15101c', o: '#2b2433', i: '#4a4158', k: '#1d1424',
    },
  };
})();
CHIBI.put('anahi', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 0); return CHIBI.make('anahi:' + p, () => CHIBI.biped(CHIBI_ANAHI, p)); });

// ============================================================================
//  KEIKO — Anahí's westie: round white head, upright ears, carrot tail, the
//  Westie-green bandana with white paw dots. Drawn from shapes on the grid.
// ============================================================================
const CHIBI_FUR = { F: '#ffffff', f: '#e4e7f2', d: '#b3b8d4', D: '#8587ab' };
// A four-legged walker from a spec: coat tones, and shape painters for tail,
// body, far ear, head, near ear; details() adds the face, after() the extras.
CHIBI.dogBase = function (pose, S, G = CHIBI.grid(S.W || 24, S.H || 24), ox = 0, oy = 0) {
  const C = CHIBI, near = S.coat, far = S.coatFar;
  const happy = pose.startsWith('happy'), held = pose.startsWith('held');
  const bob = { idleUp: -1, passA: -1, passB: -1, happyB: -1 }[pose] || 0, Y = v => v + bob + 5 + oy;
  const X = v => v + ox, ground = 22 + oy;
  const wag = pose === 'idleUp' || pose === 'passA' || pose === 'happyB' || pose === 'heldB' ? 1 : 0;
  const st = pose === 'stepA' ? 1 : pose === 'stepB' ? -1 : 0;
  const legSet = held ? [[4, 0, 2], [6, 0, 2], [13, 0, 2], [15, 0, 2]] : [[3, -st, 0], [5, st, 0], [13, -st, 0], [15, st, 0]];
  const leg = (x, sh, ext, tones) => C.part(G, T => { const top = Y(13), bot = ground + ext; for (let y = top; y <= bot; y++) { const k = (y - top) / Math.max(1, bot - top); C.rect(T, X(Math.round(x + sh * k)), y, 2, 1, 1); } C.rect(T, X(Math.round(x + sh) - (sh < 0 ? 1 : 0)), bot, 3, 1, 2); }, tones, { seam: S.seam });
  leg(legSet[0][0], legSet[0][1], legSet[0][2], far); leg(legSet[2][0], legSet[2][1], legSet[2][2], far);
  C.part(G, T => S.tail(T, Y, X, wag), near, {});
  C.part(G, T => S.body(T, Y, X), near, { seam: S.seam });
  if (S.coatMarks) S.coatMarks(G, Y, X, pose);
  if (S.cape) S.cape(G, Y, X, wag, pose);
  leg(legSet[1][0], legSet[1][1], legSet[1][2], near); leg(legSet[3][0], legSet[3][1], legSet[3][2], near);
  if (S.socks) for (const [x, sh, ext] of legSet) { const bot = ground + ext; C.rect(G, X(Math.round(x + sh) - (sh < 0 ? 1 : 0)), bot, 3, 1, S.socks); C.rect(G, X(Math.round(x + sh)), bot - 1, 2, 1, S.socks); }
  const hy = happy ? -1 : 0;
  C.part(G, T => S.farEar(T, Y, X, hy), far, {});
  C.part(G, T => S.head(T, Y, X, hy), near, { seam: S.seam });
  C.part(G, T => S.nearEar(T, Y, X, hy), near, { seam: S.seam });
  S.details(G, Y, X, hy, pose);
  if (S.after) S.after(G, Y, X, hy, pose, wag);
  return G;
};
// the westie from the side: round head, pricked ears, carrot tail, black nose
CHIBI.WESTIE = {
  coat: [CHIBI_FUR.d, CHIBI_FUR.F, CHIBI_FUR.F], coatFar: [CHIBI_FUR.D, CHIBI_FUR.d, CHIBI_FUR.f], seam: CHIBI_FUR.d,
  tail: (T, Y, X, wag) => CHIBI.poly(T, [[X(2.2), Y(10)], [X(2.4 - wag), Y(4.2)], [X(4.6 - wag), Y(4.4)], [X(5.8), Y(10)]], 1),
  body: (T, Y, X) => { CHIBI.ell(T, X(9.5), Y(11.2), 7.6, 3.9, 1); for (let x = 3; x <= 15; x += 3) CHIBI.rect(T, X(x), Y(14.4), 2, 1, 1); },
  farEar: (T, Y, X, hy) => CHIBI.poly(T, [[X(12.6), Y(4 + hy)], [X(14.3), Y(-.6 + hy)], [X(16.2), Y(3.6 + hy)]], 1),
  head: (T, Y, X, hy) => { CHIBI.ell(T, X(16.6), Y(7 + hy), 5.6, 5.1, 1); CHIBI.ell(T, X(20.6), Y(8.6 + hy), 2.9, 2.2, 1); CHIBI.rect(T, X(13), Y(11.5 + hy), 2, 1, 1); CHIBI.rect(T, X(17), Y(11.6 + hy), 2, 1, 1); },
  nearEar: (T, Y, X, hy) => CHIBI.poly(T, [[X(16.4), Y(3.4 + hy)], [X(18.6), Y(-1.2 + hy)], [X(20), Y(3.8 + hy)]], 1),
  details(G, Y, X, hy, pose) {
    const C = CHIBI, happy = pose.startsWith('happy'), held = pose.startsWith('held');
    C.px(G, X(18.4), Y(1.8 + hy), '#ff93bf'); C.px(G, X(18.6), Y(2.6 + hy), '#ffb3cf'); C.px(G, X(14.4), Y(2.1 + hy), '#e27aa6');
    const ey = Y(5.4 + hy), ex = X(17);
    C.rect(G, X(22), Y(7.2 + hy), 2, 2, '#1d1424'); C.px(G, X(22), Y(7.2 + hy), '#4a4158');
    CHIBI.face(G, ex, ey, X(19.5), Y(10 + hy), pose);
  },
};
// eyes and mouth shared by the dogs: eye at (ex, ey), mouth corner at (mx, my)
CHIBI.face = function (G, ex, ey, mx, my, pose) {
  const C = CHIBI, happy = pose.startsWith('happy'), held = pose.startsWith('held');
  if (happy) { C.px(G, ex, ey + 1, INK); C.px(G, ex + 1, ey, INK); C.px(G, ex + 2, ey + 1, INK); C.rect(G, mx - .5, my, 3, 1, INK); C.rect(G, mx - .5, my + 1, 2, 2, '#ff5d9e'); C.px(G, mx + .5, my + 2, '#e0407a'); }
  else if (held) { C.rect(G, ex, ey - 1, 2, 3, INK); C.px(G, ex, ey - 1, '#ffffff'); C.px(G, mx + .5, my, INK); C.px(G, mx + .5, my + 1, '#ff5d9e'); }
  else if (pose === 'blink') { C.rect(G, ex, ey + 1, 2, 1, INK); C.px(G, mx + .5, my + .4, '#8587ab'); C.px(G, mx + 1.5, my + .4, '#8587ab'); }
  else { C.rect(G, ex, ey, 2, 2, INK); C.px(G, ex, ey, '#ffffff'); C.px(G, mx + .5, my + .4, '#8587ab'); C.px(G, mx + 1.5, my + .4, '#8587ab'); }
};
CHIBI.westie = (pose, o = {}) => CHIBI.dogBase(pose, Object.assign({}, CHIBI.WESTIE, o));
// the bandana: a triangle under the chin with little white dots (green for Keiko)
CHIBI.bandana = function (G, Y, X, hy, pose, wag, tones = ['#17543e', '#2a7356', '#4e9a79'], dx = 0) {
  const C = CHIBI;
  C.part(G, T => C.poly(T, [[X(11.6 + dx), Y(10.6 + hy)], [X(19.6 + dx), Y(10.6 + hy)], [X(14.8 + dx), Y(15.8 + hy)]], 1), tones, { seam: tones[0] });
  C.px(G, X(13.5 + dx), Y(11.5 + hy), '#ffffff'); C.px(G, X(16.5 + dx), Y(11.5 + hy), '#ffffff'); C.px(G, X(15 + dx), Y(13.2 + hy), '#ffffff');
};
function keikoChibi(frame = 'idle', t = 0) { const p = CHIBI.pose(frame, t, 1); return CHIBI.make('keiko:' + p, () => CHIBI.westie(p, { after: (G, Y, X, hy, pose, wag) => CHIBI.bandana(G, Y, X, hy, pose, wag) })); }

// ============================================================================
//  SÚPER KEIKO — the same westie with the hero's green mask, cape and gold badge
// ============================================================================
CHIBI.SUPER = {
  cape(G, Y, X, wag, pose) {
    const C = CHIBI, fly = pose.startsWith('happy') ? 2 : pose.startsWith('pass') || pose === 'idleUp' ? 1 : 0;
    C.part(G, T => C.poly(T, [[X(14.6), Y(7.6)], [X(6), Y(7.2)], [X(1), Y(6.4 - fly)], [X(-2.2), Y(7.4 - fly - wag)], [X(-2.6), Y(12.8 - fly + wag)], [X(1), Y(11.4 - fly)], [X(3.2), Y(10.2)], [X(13.6), Y(9.8)]], 1), ['#0e3a2b', '#2a7356', '#4e9a79'], { seam: '#07261c' });
    C.px(G, X(-.6), Y(9.4 - fly), '#17543e'); C.px(G, X(-.4), Y(10.6 - fly + wag), '#17543e'); C.px(G, X(1.4), Y(9 - fly), '#17543e');
    C.part(G, T => C.ell(T, X(14.4), Y(8.6), 1.4, 1.4, 1), ['#bf8d2f', '#e7c35f', '#fff0a6'], { seam: '#83591c' });
  },
  after(G, Y, X, hy, pose, wag) {
    const C = CHIBI, ey = Y(5.4 + hy), ex = X(17), held = pose.startsWith('held');
    // the mask: a green band with the eye inside, two tails fluttering back
    C.part(G, T => { C.rect(T, X(14.6), ey, 7, 2, 1); C.rect(T, X(12.4), ey + wag, 2, 1, 1); C.rect(T, X(11.4), ey + 1 - wag, 2, 1, 1); }, ['#17543e', '#2a7356', '#4e9a79'], { seam: '#0e3a2b', flat: true });
    C.rect(G, X(14.6), ey, 7, 1, '#2f8a62'); C.rect(G, X(14.6), ey + 1, 7, 1, '#17543e');
    if (pose.startsWith('happy')) { C.px(G, ex, ey + 1, INK); C.px(G, ex + 1, ey, INK); C.px(G, ex + 2, ey + 1, INK); }
    else if (pose === 'blink') C.rect(G, ex, ey + 1, 2, 1, INK);
    else { C.px(G, ex, ey, '#ffffff'); C.px(G, ex + 1, ey, held ? '#ffffff' : INK); C.px(G, ex + 1, ey + 1, INK); if (held) C.px(G, ex, ey + 1, '#ffffff'); }
    const my = Y(10 + hy), mx = X(19.5);
    if (pose.startsWith('happy')) { C.rect(G, mx - .5, my, 3, 1, INK); C.rect(G, mx - .5, my + 1, 2, 2, '#ff5d9e'); }
    else if (held) { C.px(G, mx + .5, my, INK); C.px(G, mx + .5, my + 1, '#ff5d9e'); }
    else { C.px(G, mx + .5, my + .4, '#8587ab'); C.px(G, mx + 1.5, my + .4, '#8587ab'); }
    // the gold badge on her chest
    C.part(G, T => C.ell(T, X(15.4), Y(12.4 + hy), 1.9, 1.9, 1), ['#bf8d2f', '#e7c35f', '#fff0a6'], { seam: '#83591c' });
    C.px(G, X(15.4), Y(12.4 + hy), '#fff8d0');
  },
};
CHIBI.put('superwestie', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 2); return CHIBI.make('super:' + p, () => CHIBI.dogBase(p, Object.assign({}, CHIBI.WESTIE, CHIBI.SUPER), CHIBI.grid(27, 24), 3)); });

// ============================================================================
//  KIRA & NALA — the Australian shepherd sisters, walking as a pair: Kira the
//  blue merle (one blue eye) in front, Nala the red tricolour just behind.
//  Bob tails, folded ears, white blaze, chest and socks, their bandanas.
// ============================================================================
CHIBI.AUSSIE = {
  tail: (T, Y, X) => CHIBI.poly(T, [[X(1.4), Y(9)], [X(1), Y(7)], [X(3.4), Y(6.8)], [X(4.4), Y(9)]], 1),
  body: (T, Y, X) => { CHIBI.ell(T, X(9.6), Y(11), 7.9, 4, 1); for (let x = 2; x <= 15; x += 3) CHIBI.rect(T, X(x), Y(14.2), 2, 1, 1); },
  farEar: (T, Y, X, hy) => CHIBI.poly(T, [[X(12.4), Y(4.6 + hy)], [X(13), Y(.8 + hy)], [X(15.8), Y(1.4 + hy)], [X(15.8), Y(4.2 + hy)]], 1),
  head: (T, Y, X, hy) => { CHIBI.ell(T, X(16.2), Y(6.6 + hy), 5.1, 4.6, 1); CHIBI.ell(T, X(20.6), Y(8.5 + hy), 3.6, 2.1, 1); CHIBI.rect(T, X(13), Y(10.8 + hy), 5, 2, 1); },
  nearEar: (T, Y, X, hy) => CHIBI.poly(T, [[X(15.4), Y(3.4 + hy)], [X(16.4), Y(-.4 + hy)], [X(19.8), Y(.6 + hy)], [X(19.2), Y(3.6 + hy)]], 1),
};
CHIBI.aussie = function (who) {
  const K = who === 'kira';
  const S = Object.assign({}, CHIBI.AUSSIE, {
    coat: K ? ['#4d5670', '#7b87a0', '#a9b4c8'] : ['#8c4c33', '#bd7c56', '#dfa77e'],
    coatFar: K ? ['#2a2f40', '#4d5670', '#6b7690'] : ['#5a2c1e', '#8c4c33', '#a8684a'],
    seam: K ? '#4d5670' : '#8c4c33', socks: '#ffffff',
    coatMarks(G, Y, X) {
      const C = CHIBI, dk = K ? '#1f2233' : '#6e3420', md = K ? '#3a3f55' : '#8c4c33';
      const blobs = K ? [[5, 8.6, 1.8, 1.2], [10.5, 10, 1.5, 1.1], [3.2, 11.5, 1.2, 1], [13, 8.6, 1.2, .9], [8, 12.6, 1, .8]] : [[6, 8.6, 5.4, 1.5], [11.6, 9, 2.4, 1.2]];
      for (const [x, y, rx, ry] of blobs) C.part(G, T => C.ell(T, X(x), Y(y), rx, ry, 1), [dk, md, md], { flat: !K });
      // white chest ruff
      C.part(G, T => C.ell(T, X(15.4), Y(12), 2.4, 2.2, 1), ['#c8c6d8', '#ffffff', '#ffffff'], {});
    },
    details(G, Y, X, hy, pose) {
      const C = CHIBI, ey = Y(5.6 + hy), ex = X(17);
      // merle patch on the head / dark ear tips, the white blaze, the copper points
      if (K) { C.part(G, T => C.ell(T, X(14.2), Y(5 + hy), 1.7, 1.5, 1), ['#1f2233', '#2b2f44', '#3a3f55'], {}); }
      C.px(G, X(18.8), Y(.8 + hy), K ? '#1f2233' : '#6e3420'); C.px(G, X(19.2), Y(1.6 + hy), K ? '#1f2233' : '#6e3420'); C.px(G, X(14.6), Y(1.4 + hy), K ? '#1f2233' : '#5a2c1e');
      C.part(G, T => { C.rect(T, X(18.4), Y(2.6 + hy), 1, 3, 1); C.rect(T, X(19), Y(5.4 + hy), 2, 2, 1); C.ell(T, X(20.8), Y(9.6 + hy), 3, 1.1, 1); }, ['#dcdae8', '#ffffff', '#ffffff'], { flat: true });
      C.px(G, ex + 1, ey - 1, '#e2934a'); C.px(G, X(16), Y(8.4 + hy), '#e2934a'); C.px(G, X(17), Y(8.8 + hy), '#e2934a');
      C.rect(G, X(22.6), Y(7.2 + hy), 1.6, 2, K ? '#1d1424' : '#6e3226'); C.px(G, X(22.6), Y(7.2 + hy), K ? '#4a4158' : '#a8604a');
      CHIBI.face(G, ex, ey, X(19.6), Y(10.2 + hy), pose);
      if (!pose.startsWith('happy') && !pose.startsWith('held') && pose !== 'blink') C.px(G, ex + 1, ey + 1, K ? '#4f9ff0' : '#e2a21b');
    },
    after: (G, Y, X, hy, pose, wag) => CHIBI.bandana(G, Y, X, hy, pose, wag, K ? ['#233b8c', '#3565cc', '#63a0ef'] : ['#7c1830', '#c02d45', '#ec5e5e'], .4),
  });
  return S;
};
CHIBI.put('hermanas', (frame = 'idle', t = 0) => {
  const p = CHIBI.pose(frame, t, 3), q = CHIBI.pose(frame, t + .09, 4).replace('stepA', 'stepX').replace('stepB', 'stepA').replace('stepX', 'stepB');
  return CHIBI.make('hermanas:' + p + ':' + q, () => { const G = CHIBI.grid(39, 25); CHIBI.dogBase(q, CHIBI.aussie('nala'), G, 15, -1); return CHIBI.dogBase(p, CHIBI.aussie('kira'), G, 0, 1); });
});

// ============================================================================
//  Two-legged walkers drawn from shapes (Rizos, Pompón, Ceniza, Don Bigotes):
//  the pose is decoded once; legs2/arms2 draw the limbs, each spec the rest.
// ============================================================================
CHIBI.decode = pose => ({
  pose, bob: { idleUp: -1, passA: -1, passB: -1, happyB: -1 }[pose] || 0,
  jump: false, cheer: pose.startsWith('happy'), held: pose.startsWith('held'),
  st: pose === 'stepA' ? 1 : pose === 'stepB' ? -1 : 0, kick: pose === 'heldB' ? 1 : 0, wave: pose === 'happyB' ? 1 : 0,
  arms: pose === 'stepA' ? 'swingA' : pose === 'stepB' ? 'swingB' : pose.startsWith('happy') ? 'up' : pose.startsWith('held') ? 'held' : 'down',
  face: pose === 'blink' ? 'blink' : pose.startsWith('happy') ? 'happy' : pose.startsWith('held') ? 'held' : 'idle',
});
// a stroke two pixels wide between two points
CHIBI.seg = function (T, x0, y0, x1, y1, w = 2, col = 1) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2));
  for (let i = 0; i <= n; i++) { const k = i / n, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k; CHIBI.rect(T, Math.round(x - w / 2 + .01), Math.round(y - .5), w, 1, col); }
  return T;
};
// legs: o = { xl, xr, w, top, ground, tones, shoe, shoeW, flare }
CHIBI.legs2 = function (G, P, o) {
  const C = CHIBI, w = o.w || 2, sw = o.shoeW || w + 1, ground = o.ground + (P.oy || 0), lift = P.jump ? -3 : 0;
  const legsFor = [[o.xl, -1], [o.xr, 1]];
  for (const [x, side] of legsFor) {
    const up = (P.st === 1 && side === 1) || (P.st === -1 && side === -1) ? 2 : 0;
    const dangle = P.held ? (side === (P.kick ? 1 : -1) ? -1 : 1) : 0;
    const top = o.top + P.bob, bot = ground + lift - up + (P.held ? 1 + dangle : 0) - (o.shoeH || 2);
    C.part(G, T => { for (let y = top; y <= bot; y++) { const f = o.flare ? o.flare(y - top, bot - top) : 0; C.rect(T, x - (side < 0 ? f : 0) + (P.held ? side * .5 : 0), y, w + f, 1, 1); } }, o.tones, { seam: o.seam });
    const sx = x - (sw - w) + (side > 0 ? sw - w : 0) - (side > 0 ? (sw - w) : 0) - (o.toeOut ? (side < 0 ? 1 : 0) : 0);
    C.part(G, T => C.rect(T, x - Math.floor((sw - w) / 2) - (side < 0 && sw > w ? 0 : 0), bot + 1, sw, o.shoeH || 2, 1), o.shoe, { seam: o.shoeSeam || o.shoe[0] });
  }
};
// arms: o = { xl, xr, y (shoulder row), len, tones, hand, w }
CHIBI.arms2 = function (G, P, o) {
  const C = CHIBI, y = o.y + P.bob, len = o.len || 6;
  for (const side of [-1, 1]) {
    const sx = side < 0 ? o.xl : o.xr;
    let hx = sx + side * 1, hy = y + len;
    if (P.arms === 'swingA') { hy -= side < 0 ? 1 : 0; hx += side < 0 ? 0 : side; }
    if (P.arms === 'swingB') { hy -= side > 0 ? 1 : 0; hx += side > 0 ? 0 : side; }
    if (P.arms === 'up' || P.arms === 'held') { hx = sx + side * 3; hy = y - len + 1 + (P.wave && side > 0 ? 1 : 0) + (P.wave && side < 0 ? -1 : 0); }
    C.part(G, T => C.seg(T, sx, y + 1, hx, hy, o.w || 2), o.tones, { seam: o.seam });
    C.part(G, T => C.ell(T, hx + (side < 0 ? 0 : 0), hy + (P.arms === 'up' || P.arms === 'held' ? -.5 : .5), 1.4, 1.4, 1), o.hand, { seam: o.seam });
  }
};
// padL widens the canvas on the left so the body sits on the centre line (a
// walker turning round must not jump sideways when a sidekick hangs off one side)
CHIBI.human = (S, pose) => {
  const oy = S.oy != null ? S.oy : 4, G = CHIBI.grid(S.W || 24, (S.H || 36) + oy), P = CHIBI.decode(pose); P.oy = oy; P.bob += oy; S.draw(G, P);
  if (!S.padL) return G;
  const O = CHIBI.grid(G.w + S.padL, G.h);
  for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) O.p[y * O.w + x + S.padL] = G.p[y * G.w + x];
  return O;
};

// ---------------------------------------------------------------- RIZOS -----
// the disco goldendoodle: huge apricot afro, pink star glasses, white shirt with
// the big collar and a gold medallion, blue bell-bottoms, purple platforms
CHIBI.RIZOS = {
  W: 26, H: 37,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, FUR = ['#a45a31', '#d4874c', '#f0b573'], FURd = ['#6e3520', '#a45a31', '#d4874c'];
    const MUZ = ['#cf9a66', '#ffe2bb', '#fff4e0'], SH = ['#a79bd0', '#eeeaff', '#ffffff'], JE = ['#233b8c', '#3565cc', '#63a0ef'], PL = ['#381e63', '#8959c5', '#bf95e9'];
    const up = P.arms === 'up' || P.arms === 'held';
    const arms = () => {
      if (P.held) return C.arms2(G, P, { xl: 7, xr: 18, y: 20, len: 6, tones: SH, hand: FUR, seam: '#6b5a96' });
      if (!P.cheer) return C.arms2(G, P, { xl: 7, xr: 18, y: 20, len: 6, tones: SH, hand: FUR, seam: '#6b5a96' });
      // happy: the disco point, one arm up to the sky, the other hand on the hip
      const r = P.wave ? -1 : 1, sx = r > 0 ? 18 : 7, ox = r > 0 ? 7 : 18;
      C.part(G, T => { C.seg(T, sx, Y(21), sx + r * 3, Y(16)); C.seg(T, sx + r * 3, Y(16), sx + r * 5, Y(11)); }, SH, { seam: '#6b5a96' });
      C.part(G, T => { C.ell(T, sx + r * 5.2, Y(10.4), 1.3, 1.3, 1); C.rect(T, sx + r * 5 + (r > 0 ? 1 : -1), Y(6.6), 1, 3, 1); }, FUR, { seam: '#6e3520' });
      C.part(G, T => { C.seg(T, ox, Y(21), ox - r * 3, Y(23)); C.seg(T, ox - r * 3, Y(23), ox - r * 1, Y(25.4)); }, SH, { seam: '#6b5a96' });
    };
    C.legs2(G, P, { xl: 9, xr: 14, w: 3, top: 27, ground: 36, tones: JE, seam: '#141c47', shoe: PL, shoeW: 5, shoeH: 3, flare: (k, n) => k >= n - 1 ? 1 : 0 });
    if (!up) arms();
    // shirt with the pointed collar, the open neck, the medallion, the belt
    C.part(G, T => { C.rect(T, 8, Y(20), 10, 7, 1); C.rect(T, 7, Y(21), 12, 2, 1); }, SH, { seam: '#6b5a96' });
    C.part(G, T => { C.poly(T, [[7.6, Y(19.4)], [12.6, Y(20)], [9.2, Y(24.2)]], 1); C.poly(T, [[18.4, Y(19.4)], [13.4, Y(20)], [16.8, Y(24.2)]], 1); }, ['#b8aee0', '#e8e4f8', '#ffffff'], { seam: '#8a7cc0' });
    C.part(G, T => C.poly(T, [[11.2, Y(20)], [14.8, Y(20)], [13, Y(23.6)]], 1), FUR, {});
    C.part(G, T => C.ell(T, 13, Y(23.4), 1.3, 1.3, 1), ['#bf8d2f', '#e7c35f', '#fff0a6'], { seam: '#83591c' });
    C.rect(G, 8, Y(26), 10, 1, '#2b1a4a'); C.rect(G, 12, Y(26), 2, 1, '#e7c35f');
    // curly ears, the afro, the cream face in front of it
    for (const x of [5.4, 20.6]) C.part(G, T => C.ell(T, x, Y(15.4), 2.4, 3.8, 1), FURd, { seam: '#6e3520' });
    C.part(G, T => { C.ell(T, 13, Y(7.6), 9.2, 5.8, 1); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + .1; C.ell(T, 13 + Math.cos(a) * 9.6, Y(7.6) + Math.sin(a) * 6.1, 2.3, 2.3, 1); } }, FUR, { seam: '#6e3520' });
    for (const [x, y] of [[7, 4], [11, 2], [16, 3], [19, 6], [6, 9], [15, 7], [10, 6], [20, 10], [4, 6], [18, 1], [22, 8], [13, 4]]) { C.px(G, x, Y(y), '#a45a31'); C.px(G, x + 1, Y(y + 1), '#a45a31'); }
    C.px(G, 8, Y(3), '#ffdfa8'); C.px(G, 9, Y(2), '#ffdfa8'); C.px(G, 7, Y(5), '#ffdfa8');
    C.part(G, T => C.ell(T, 13, Y(15.2), 6.3, 4.7, 1), MUZ, { seam: '#9c6238' });
    // the star glasses (pushed up onto the afro when he's grabbed)
    const gy = Y(P.held ? 9.6 : 13);
    const star = (x) => { C.px(G, x, gy, '#ff3d8b'); C.rect(G, x - 2, gy + 1, 5, 1, '#ff3d8b'); C.rect(G, x - 1, gy + 2, 3, 1, '#ff3d8b'); C.px(G, x, gy + 2, '#2b1a4a'); C.px(G, x - 1, gy + 3, '#ff3d8b'); C.px(G, x + 1, gy + 3, '#ff3d8b'); C.px(G, x - 1, gy + 1, '#ff8fbd'); };
    star(10); star(16); C.px(G, 13, gy + 1, '#ff3d8b');
    if (P.held) { C.rect(G, 10, Y(14), 1, 2, INK); C.rect(G, 16, Y(14), 1, 2, INK); C.px(G, 10, Y(14), '#ffffff'); C.px(G, 16, Y(14), '#ffffff'); }
    C.rect(G, 12, Y(16.6), 2, 1, '#2b1a2a'); C.px(G, 12, Y(16.6), '#5a4060');
    if (P.face === 'happy') { C.rect(G, 11, Y(18), 4, 1, '#3e0d1c'); C.rect(G, 12, Y(19), 2, 1, '#ff93bf'); }
    else if (P.held) C.rect(G, 12, Y(18), 2, 2, '#3e0d1c');
    else { C.px(G, 11, Y(18), '#9c6238'); C.rect(G, 12, Y(18.6), 2, 1, '#9c6238'); C.px(G, 14, Y(18), '#9c6238'); }
    C.px(G, 8, Y(17), '#ff93bf'); C.px(G, 18, Y(17), '#ff93bf');
    if (up) arms();
  },
};
CHIBI.put('rizos', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 5); return CHIBI.make('rizos:' + p, () => CHIBI.human(CHIBI.RIZOS, p)); });

// ---------------------------------------------------------------- POMPÓN ----
// the poodle pop idol: pink puffs (topknot, ears, chest, tail, wrists, ankles),
// cream face with big idol eyes, the magenta bow and her headset mic
CHIBI.puff = (T, cx, cy, rx, ry, n = 8, r = 1.8) => { CHIBI.ell(T, cx, cy, rx, ry, 1); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .3; CHIBI.ell(T, cx + Math.cos(a) * rx * .92, cy + Math.sin(a) * ry * .92, r, r, 1); } return T; };
CHIBI.curls = (G, pts, col, hi) => { for (const [x, y] of pts) { CHIBI.px(G, x, y, col); CHIBI.px(G, x + 1, y - 1, col); if (hi) CHIBI.px(G, x - 1, y - 1, hi); } };
CHIBI.POMPON = {
  W: 26, H: 36,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, PK = ['#d4508f', '#ff86ba', '#ffc2dc'], PKd = ['#a8356d', '#e05b98', '#ff9ec8'], CR = ['#e8b4a8', '#ffe8dd', '#fff6f0'], BOW = ['#5e0c33', '#a3185a', '#e0307a'];
    const up = P.arms === 'up' || P.arms === 'held', curl = '#c2427f';
    // tail pompom behind, legs with ankle puffs
    C.part(G, T => C.puff(T, 19.5, Y(25), 2.2, 2.2, 6, 1.2), PKd, { seam: '#7a1f4c' });
    C.legs2(G, P, { xl: 10, xr: 14, w: 2, top: 27, ground: 36, tones: CR, seam: '#b07a70', shoe: CR, shoeW: 3, shoeH: 2 });
    for (const [x, side] of [[11, -1], [15, 1]]) { const raised = (P.st === 1 && side === 1) || (P.st === -1 && side === -1) ? 2 : 0; C.part(G, T => C.puff(T, x, (P.jump ? 29.6 : 32.6) + P.oy - raised + (P.held ? 1 : 0), 1.9, 1.5, 5, 1.1), PK, { seam: '#7a1f4c' }); }
    const arms = () => { C.arms2(G, P, { xl: 8, xr: 17, y: 21, len: 5, tones: CR, hand: CR, seam: '#b07a70' });
      for (const side of [-1, 1]) { const sx = side < 0 ? 8 : 17, hx = up ? sx + side * 3 : sx + side, hy = up ? Y(21) - 4 : Y(21) + 5; C.part(G, T => C.puff(T, hx, hy + (up ? 2 : -1), 1.6, 1.3, 5, 1), PK, { seam: '#7a1f4c' }); } };
    if (!up) arms();
    // the chest puff (her stage outfit), with curls and a sparkle
    C.part(G, T => C.puff(T, 12.6, Y(24.2), 5, 3.8, 9, 1.6), PK, { seam: '#7a1f4c' });
    C.curls(G, [[10, Y(25)], [14, Y(24)], [12, Y(27)], [16, Y(26)]], curl);
    C.px(G, 10, Y(22.4), '#ffe0ee'); C.px(G, 11, Y(21.6), '#ffffff');
    // long ear puffs, the face, the topknot and the bow
    for (const x of [5.6, 19.6]) C.part(G, T => { C.puff(T, x, Y(13.6), 2.8, 3.4, 6, 1.4); C.puff(T, x, Y(18.2), 2.4, 2.2, 5, 1.3); }, PKd, { seam: '#7a1f4c' });
    C.curls(G, [[5, Y(13)], [6, Y(17)], [19, Y(12)], [19, Y(18)]], '#a8356d');
    C.part(G, T => C.ell(T, 12.6, Y(14.4), 5, 4.6, 1), CR, { seam: '#b07a70' });
    C.part(G, T => C.puff(T, 12.6, Y(6.6), 5.6, 3.8, 9, 1.8), PK, { seam: '#7a1f4c' });
    C.curls(G, [[9, Y(8)], [13, Y(5)], [15, Y(8)], [11, Y(10)]], curl);
    C.px(G, 9, Y(4.4), '#ffffff'); C.px(G, 10, Y(3.6), '#ffe0ee');
    C.part(G, T => { C.poly(T, [[12.6, Y(2.2)], [8.2, Y(-.6)], [8.4, Y(4.4)]], 1); C.poly(T, [[12.6, Y(2.2)], [17, Y(-.6)], [16.8, Y(4.4)]], 1); }, BOW, { seam: '#3a0620' });
    C.part(G, T => C.ell(T, 12.6, Y(2), 1.4, 1.4, 1), ['#a3185a', '#ff82b4', '#ffd1e4'], { seam: '#3a0620' });
    C.px(G, 9.4, Y(.6), '#ff82b4'); C.px(G, 15.8, Y(.6), '#ff82b4');
    // idol eyes (big, sparkly), lashes, blush, the tiny mouth, the headset mic
    for (const ex of [10, 14]) {
      const outer = ex < 12 ? ex - 1 : ex + 2;
      if (P.face === 'happy') { C.px(G, ex, Y(14), INK); C.px(G, ex + 1, Y(13), INK); C.px(G, ex + 2, Y(14), INK); }
      else if (P.face === 'blink') { C.rect(G, ex, Y(14), 2, 1, INK); C.px(G, outer, Y(13), INK); }
      else { C.rect(G, ex, Y(12), 2, 3, '#3a1030'); C.px(G, ex, Y(12), '#ffffff'); C.px(G, ex + 1, Y(14), '#c0508f'); C.px(G, outer, Y(11), INK); if (P.held) C.px(G, ex + 1, Y(12), '#ffffff'); }
    }
    C.px(G, 8.4, Y(15.6), '#ff86ba'); C.px(G, 17, Y(15.6), '#ff86ba');
    C.px(G, 12, Y(15.6), '#d4508f'); C.px(G, 13, Y(15.6), '#d4508f');
    if (P.face === 'happy') { C.rect(G, 11, Y(17), 4, 1, '#6e1624'); C.rect(G, 12, Y(18), 2, 1, '#ff5d9e'); }
    else if (P.held) C.rect(G, 12, Y(17), 2, 2, '#6e1624');
    else { C.px(G, 12, Y(17.4), '#6e1624'); C.px(G, 13, Y(17.4), '#6e1624'); }
    C.px(G, 16, Y(17.6), '#2b2540');
    if (up) arms();
  },
};
CHIBI.put('pompon', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 6); return CHIBI.make('pompon:' + p, () => CHIBI.human(CHIBI.POMPON, p)); });

// ---------------------------------------------------------------- CENIZA ----
// the witch cat: blue-black fur, lamp-green eyes, crooked purple hat with a
// green band and gold buckle, green cape, curly tail; Pato floats at her side
CHIBI.CENIZA = {
  W: 30, H: 36, padL: 6,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, FUR = ['#0a0c15', '#262f49', '#56679a'], FURd = ['#05060c', '#1b2136', '#3d4b6e'], HAT = ['#381e63', '#5a3396', '#8959c5'], CAPE = ['#0e3a2b', '#17543e', '#2a7356'];
    const up = P.arms === 'up' || P.arms === 'held';
    // cape behind, curly tail, legs
    C.part(G, T => C.poly(T, [[7, Y(20.6)], [17, Y(20.6)], [20.8, Y(32.4)], [3.2, Y(32.4)]], 1), CAPE, { seam: '#07261c' });
    C.px(G, 5, Y(30), '#2a7356'); C.px(G, 6, Y(27), '#2a7356');
    C.part(G, T => { C.seg(T, 17, Y(30), 21, Y(27)); C.seg(T, 21, Y(27), 21.5, Y(22)); C.ell(T, 20.6, Y(21.2), 1.5, 1.5, 1); }, FURd, { seam: '#05060c' });
    C.legs2(G, P, { xl: 9, xr: 13, w: 2, top: 28, ground: 36, tones: FURd, seam: '#05060c', shoe: FUR, shoeW: 3, shoeH: 2 });
    const arms = () => C.arms2(G, P, { xl: 7, xr: 17, y: 21, len: 5, tones: FUR, hand: ['#262f49', '#3d4b6e', '#6479a6'], seam: '#05060c' });
    if (!up) arms();
    C.part(G, T => { C.ell(T, 12, Y(25), 4.8, 4.4, 1); }, FUR, { seam: '#05060c' });
    C.part(G, T => C.ell(T, 12, Y(26), 2.4, 2.6, 1), ['#262f49', '#3d4b6e', '#4d5c82'], { flat: true });
    // head with ears poking out under the brim and cheek tufts
    for (const s of [-1, 1]) C.part(G, T => C.poly(T, [[12 + s * 4.8, Y(13.6)], [12 + s * 9.8, Y(10.8)], [12 + s * 6.4, Y(16.8)]], 1), FUR, { seam: '#05060c' });
    C.part(G, T => { C.ell(T, 12, Y(15.4), 6.2, 5, 1); C.poly(T, [[6.2, Y(16)], [3.8, Y(18.6)], [7.4, Y(19)]], 1); C.poly(T, [[17.8, Y(16)], [20.2, Y(18.6)], [16.6, Y(19)]], 1); }, FUR, { seam: '#05060c' });
    // the crooked hat
    C.part(G, T => { C.poly(T, [[7.4, Y(11)], [16.4, Y(11)], [15, Y(4)], [19.6, Y(-.8)], [12.4, Y(2.4)]], 1); }, HAT, { seam: '#1e1036' });
    C.part(G, T => C.ell(T, 12, Y(11.4), 8, 1.8, 1), HAT, { seam: '#1e1036' });
    C.px(G, 4, Y(12.6), '#b36a9a'); C.px(G, 3, Y(12), '#b36a9a'); C.px(G, 19, Y(12.6), '#b36a9a'); C.px(G, 20, Y(12), '#b36a9a');
    C.rect(G, 8, Y(8), 8, 2, '#2a7356'); C.rect(G, 8, Y(9), 8, 1, '#17543e'); C.rect(G, 11, Y(8), 2, 2, '#e7c35f'); C.px(G, 11, Y(8), '#fff0a6');
    C.px(G, 9, Y(5), '#bf95e9'); C.px(G, 10, Y(4), '#bf95e9');
    // lamp eyes with slit pupils, pink nose, the cat mouth, whiskers
    for (const ex of [9, 14]) {
      if (P.face === 'happy') { C.px(G, ex, Y(16), INK); C.px(G, ex + 1, Y(15), INK); C.px(G, ex + 2, Y(16), INK); }
      else if (P.face === 'blink') C.rect(G, ex, Y(16), 2, 1, '#b8e04a');
      else { C.rect(G, ex, Y(14), 2, 3, '#b8e04a'); C.px(G, ex, Y(14), '#e8ff9a'); C.rect(G, ex + (P.held ? 0 : 1), Y(14), 1, 3, INK); C.px(G, ex, Y(14), '#ffffff'); }
    }
    C.rect(G, 11.5, Y(17.4), 2, 1, '#ff93bf');
    if (P.face === 'happy') { C.rect(G, 11, Y(18.6), 3, 1, '#3e0d1c'); C.px(G, 12, Y(19.6), '#ff5d9e'); }
    else if (P.held) C.rect(G, 11.5, Y(18.6), 2, 2, '#3e0d1c');
    else { C.px(G, 11, Y(18.6), '#6479a6'); C.px(G, 13, Y(18.6), '#6479a6'); }
    for (const [x0, x1, y] of [[3, 6, 17.2], [3, 6, 18.6], [18, 21, 17.2], [18, 21, 18.6]]) for (let x = x0; x <= x1; x++) C.px(G, x, Y(y), '#6479a6');
    if (up) arms();
    // Pato, the horned rubber duck, floating at her shoulder
    const py = Y(13) + (P.pose === 'idleUp' || P.pose.startsWith('pass') ? 1 : 0) + (P.cheer ? -1 : 0);
    C.part(G, T => { C.ell(T, 25, py + 4, 3.2, 2.6, 1); C.ell(T, 25.6, py, 2.2, 2.2, 1); }, ['#c98a10', '#ffdf4f', '#fff7ae'], { seam: '#9c700c' });
    C.part(G, T => C.rect(T, 27.6, py + .4, 2, 1, 1), ['#c0662c', '#ff9f4f', '#ffd49b'], { flat: true });
    C.px(G, 24.6, py - 2.2, '#e23b4e'); C.px(G, 26.6, py - 2.2, '#e23b4e');
    C.px(G, 26, py - .6, INK); C.px(G, 23.4, py + 3.4, '#e2b21b'); C.px(G, 24.4, py + 3.4, '#e2b21b');
  },
};
CHIBI.put('ceniza', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 7); return CHIBI.make('ceniza:' + p, () => CHIBI.human(CHIBI.CENIZA, p)); });

// ---------------------------------------------------------------- DON BIGOTES
// the schnauzer inventor: grey head, huge white eyebrows and beard, brass
// goggles on his forehead, white lab coat, green bow tie, dark trousers
CHIBI.BIGOTES = {
  W: 26, H: 36,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, GR = ['#454d63', '#6f7a92', '#a5afc4'], GRd = ['#232838', '#454d63', '#6f7a92'], WH = ['#a5afc4', '#eef1f6', '#ffffff'], COAT = ['#9aa3b8', '#eef1f6', '#ffffff'];
    const up = P.arms === 'up' || P.arms === 'held';
    C.legs2(G, P, { xl: 9, xr: 14, w: 3, top: 28, ground: 36, tones: ['#1b1627', '#2b2540', '#40395e'], seam: '#0e0b16', shoe: ['#35200f', '#57361c', '#80522b'], shoeW: 4, shoeH: 2 });
    const arms = () => C.arms2(G, P, { xl: 7, xr: 18, y: 20, len: 6, tones: COAT, hand: GR, seam: '#6f7a92' });
    if (!up) arms();
    // the lab coat: long, open below the belt, pocket and pen
    C.part(G, T => { C.rect(T, 7.6, Y(20), 10.8, 9, 1); C.poly(T, [[7.6, Y(28)], [11.4, Y(28)], [11, Y(31)], [7, Y(31)]], 1); C.poly(T, [[14.6, Y(28)], [18.4, Y(28)], [19, Y(31)], [15, Y(31)]], 1); }, COAT, { seam: '#6f7a92' });
    C.part(G, T => { C.poly(T, [[9.4, Y(20)], [12.8, Y(20)], [11.6, Y(25)]], 1); C.poly(T, [[16.6, Y(20)], [13.2, Y(20)], [14.4, Y(25)]], 1); }, ['#c8cedc', '#dfe3ec', '#ffffff'], { seam: '#8a93a8' });
    C.rect(G, 12, Y(21), 2, 6, '#c8cedc'); C.px(G, 16, Y(24), '#3565cc'); C.px(G, 16, Y(25), '#3565cc'); C.rect(G, 15, Y(26), 3, 1, '#b8c0d0');
    C.part(G, T => { C.poly(T, [[13, Y(20.6)], [10.4, Y(19.2)], [10.4, Y(22)]], 1); C.poly(T, [[13, Y(20.6)], [15.6, Y(19.2)], [15.6, Y(22)]], 1); }, ['#0e3a2b', '#2a7356', '#4e9a79'], { seam: '#07261c' });
    C.px(G, 13, Y(20.6), '#17543e');
    // the head: folded ears, the grey block, goggles, eyebrows, the beard
    for (const s of [-1, 1]) C.part(G, T => C.poly(T, [[13 + s * 3, Y(4.6)], [13 + s * 7.8, Y(5.4)], [13 + s * 7.6, Y(10.6)], [13 + s * 5.2, Y(7.8)]], 1), GRd, { seam: '#232838' });
    C.part(G, T => { C.ell(T, 13, Y(9.8), 6.4, 5.6, 1); C.rect(T, 6.8, Y(9), 12.4, 6, 1); }, GR, { seam: '#232838' });
    C.px(G, 9, Y(5.4), '#c8cedc'); C.px(G, 10, Y(4.8), '#c8cedc');
    C.rect(G, 6.8, Y(6.4), 12.4, 1, '#57361c');
    for (const gx of [10, 16]) C.part(G, T => C.ell(T, gx, Y(6.8), 2.3, 2.1, 1), ['#83591c', '#bf8d2f', '#e7c35f'], { seam: '#4d3310' });
    for (const gx of [10, 16]) { C.px(G, gx - .5, Y(6.3), '#ffd49b'); C.px(G, gx + .5, Y(6.3), '#f2b044'); C.px(G, gx - .5, Y(7.3), '#e0892a'); C.px(G, gx + .5, Y(7.3), '#f2b044'); }
    const bu = P.face === 'held' || P.face === 'happy' ? -1 : 0;
    C.part(G, T => { C.poly(T, [[6.8, Y(9.8 + bu)], [12.4, Y(9 + bu)], [12.2, Y(11 + bu)], [7.4, Y(11.8 + bu)]], 1); C.poly(T, [[19.2, Y(9.8 + bu)], [13.6, Y(9 + bu)], [13.8, Y(11 + bu)], [18.6, Y(11.8 + bu)]], 1); }, WH, { seam: '#6f7a92' });
    // the bow tie peeks out either side of the beard's point
    C.part(G, T => { C.poly(T, [[13, Y(21)], [9, Y(19.6)], [9.2, Y(22.4)]], 1); C.poly(T, [[13, Y(21)], [17, Y(19.6)], [16.8, Y(22.4)]], 1); }, ['#0e3a2b', '#2a7356', '#4e9a79'], { seam: '#07261c' });
    C.part(G, T => { C.ell(T, 13, Y(16.2), 5.8, 3.2, 1); C.poly(T, [[7.4, Y(14.4)], [18.6, Y(14.4)], [16.4, Y(19.6)], [13, Y(21.4)], [9.6, Y(19.6)]], 1); }, WH, { seam: '#6f7a92' });
    for (const [x, y] of [[10, 17], [13, 19], [16, 17], [11, 16], [15, 19]]) C.px(G, x, Y(y), '#c8cedc');
    for (const ex of [9, 15]) {
      if (P.face === 'happy') { C.px(G, ex, Y(13.4), INK); C.px(G, ex + 1, Y(12.4), INK); C.px(G, ex + 2, Y(13.4), INK); }
      else if (P.face === 'blink') C.rect(G, ex, Y(13), 2, 1, INK);
      else { C.rect(G, ex, Y(12.4), 2, 2, INK); C.px(G, ex, Y(12.4), '#ffffff'); if (P.held) C.px(G, ex + 1, Y(13.4), '#ffffff'); }
    }
    C.rect(G, 12, Y(14.2), 2, 2, '#1d1424'); C.px(G, 12, Y(14.2), '#4a4158');
    if (P.face === 'happy') { C.rect(G, 11, Y(17.4), 4, 1, '#3e0d1c'); C.px(G, 12, Y(18.4), '#ff5d9e'); C.px(G, 13, Y(18.4), '#ff5d9e'); }
    else if (P.held) C.rect(G, 12, Y(17.4), 2, 2, '#3e0d1c');
    if (up) arms();
  },
};
CHIBI.put('bigotes', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 8); return CHIBI.make('bigotes:' + p, () => CHIBI.human(CHIBI.BIGOTES, p)); });

// ---------------------------------------------------------------- MEZCLA ----
// Mezcla Maestra's mascot: a walking vinyl with the rainbow of mechanics, a
// face on the label, DJ headphones, white cartoon gloves and pink sneakers
CHIBI.MEZCLA = {
  W: 26, H: 32,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, cx = 12.5, cy = 12.5;
    const up = P.arms === 'up' || P.arms === 'held';
    C.legs2(G, P, { xl: 9, xr: 14, w: 2, top: 22, ground: 32, tones: ['#1b1627', '#2b2540', '#40395e'], seam: '#0e0b16', shoe: ['#a8356d', '#ff5d9e', '#ffb3d1'], shoeW: 4, shoeH: 2 });
    const arms = () => C.arms2(G, P, { xl: 5, xr: 20, y: 12, len: 6, tones: ['#1b1627', '#2b2540', '#40395e'], hand: ['#c8c6d3', '#ffffff', '#ffffff'], seam: '#0e0b16', w: 1 });
    if (!up) arms();
    // the record: grooves, the rainbow, a glint that turns as it walks
    C.part(G, T => C.ell(T, cx, Y(cy), 9.6, 9.6, 1), ['#0e0b16', '#2b2540', '#40395e'], { seam: '#0e0b16' });
    for (const r of [7.6, 5.8]) for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; C.px(G, cx + Math.cos(a) * r - .5, Y(cy) + Math.sin(a) * r - .5, '#221d33'); }
    const cols = ['#ff5d9e', '#ffdf4f', '#5bd18b', '#63a0ef', '#bf95e9', '#ff9f4f'], turn = { stepA: 0, passA: 1, stepB: 2, passB: 3 }[P.pose] || 0;
    cols.forEach((c, i) => { const a = i / 6 * Math.PI * 2 + turn * .26; C.part(G, T => C.ell(T, cx + Math.cos(a) * 6.8, Y(cy) + Math.sin(a) * 6.8, 1.2, 1.2, 1), [c, c, '#ffffff'], {}); });
    const ga = -2.2 + turn * .5; for (let k = 0; k < 3; k++) C.px(G, cx + Math.cos(ga + k * .12) * 8.6 - .5, Y(cy) + Math.sin(ga + k * .12) * 8.6 - .5, '#8b84b0');
    // the label with the face
    C.part(G, T => C.ell(T, cx, Y(cy), 3.8, 3.8, 1), ['#e8d8b8', '#fff8e6', '#ffffff'], { seam: '#8a6a44' });
    if (P.face === 'happy') { C.px(G, 10.5, Y(11.6), INK); C.px(G, 11.5, Y(11), INK); C.px(G, 13.5, Y(11), INK); C.px(G, 14.5, Y(11.6), INK); C.rect(G, 11, Y(13.4), 3, 1, '#6e1624'); C.px(G, 12, Y(14.4), '#ff5d9e'); }
    else if (P.face === 'blink') { C.rect(G, 10.5, Y(12), 2, 1, INK); C.rect(G, 13, Y(12), 2, 1, INK); C.rect(G, 11.5, Y(14), 2, 1, '#6e1624'); }
    else { C.rect(G, 10.5, Y(11), 1, 2, INK); C.rect(G, 13.5, Y(11), 1, 2, INK); if (P.held) C.rect(G, 11.5, Y(13.6), 2, 2, '#6e1624'); else { C.px(G, 11, Y(14), '#6e1624'); C.rect(G, 12, Y(14.6), 1, 1, '#6e1624'); C.px(G, 13, Y(14), '#6e1624'); } }
    // DJ headphones
    for (const s of [-1, 1]) C.part(G, T => C.ell(T, cx + s * 10, Y(cy - .6), 1.7, 2.6, 1), ['#a8356d', '#ff5d9e', '#ffb3d1'], { seam: '#6b1a45' });
    if (up) arms();
  },
};
CHIBI.put('mezcla', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 9); return CHIBI.make('mezcla:' + p, () => CHIBI.human(CHIBI.MEZCLA, p)); });

// ---------------------------------------------------------------- A UN PELO -
// the one-life mascot: a red hair clipper with a single hair left on its blade,
// sweating it out
CHIBI.UNPELO = {
  W: 24, H: 34,
  draw(G, P) {
    const C = CHIBI, Y = v => v + P.bob, RED = ['#7c1830', '#c02d45', '#ec5e5e'];
    const up = P.arms === 'up' || P.arms === 'held';
    C.legs2(G, P, { xl: 8, xr: 13, w: 2, top: 25, ground: 34, tones: ['#26242e', '#44424f', '#6b6977'], seam: '#1b1627', shoe: ['#0e0b16', '#1b1627', '#44424f'], shoeW: 4, shoeH: 2 });
    const arms = () => C.arms2(G, P, { xl: 5, xr: 17, y: 13, len: 6, tones: ['#26242e', '#44424f', '#6b6977'], hand: ['#c8c6d3', '#ffffff', '#ffffff'], seam: '#1b1627', w: 1 });
    if (!up) arms();
    // body: a rounded red clipper with a white stripe and its switch
    C.part(G, T => { C.rect(T, 6, Y(8), 11, 18, 1); C.ell(T, 11.5, Y(25.2), 5.5, 2.2, 1); }, RED, { seam: '#3e0d1c' });
    C.rect(G, 7, Y(9), 1, 15, '#ffa39a'); C.rect(G, 15, Y(10), 1, 14, '#9c2238');
    C.part(G, T => C.rect(T, 9.5, Y(20), 4, 3, 1), ['#a5afc4', '#e1e7f2', '#ffffff'], { seam: '#454d63' });
    C.px(G, 10.5, Y(21), '#3fae4a'); C.px(G, 11.5, Y(21), '#3fae4a');
    // the blade and its teeth, the last hair
    C.part(G, T => C.rect(T, 5.6, Y(5), 12, 3, 1), ['#454d63', '#a5afc4', '#e1e7f2'], { seam: '#232838' });
    for (let x = 6; x <= 17; x += 2) C.px(G, x, Y(4), '#6f7a92');
    const sway = P.cheer ? (P.pose === "happyB" ? -1 : 1) : P.pose === "idleUp" ? -1 : 0;
    for (let i = 0; i < 7; i++) C.px(G, 12 + Math.round(Math.sin(i * .9) * 1.4) + (i > 3 ? sway : 0), Y(3 - i), '#2a1811');
    // the face: big worried eyes, a sweat drop
    for (const ex of [8.5, 12.5]) {
      if (P.face === 'happy') { C.px(G, ex, Y(13), INK); C.px(G, ex + 1, Y(12), INK); C.px(G, ex + 2, Y(13), INK); }
      else if (P.face === 'blink') C.rect(G, ex, Y(13), 3, 1, INK);
      else { C.rect(G, ex, Y(11), 3, 3, '#ffffff'); C.rect(G, ex + (P.held ? 1 : ex < 11 ? 1.4 : .6), Y(12), 1, P.held ? 1 : 2, INK); }
    }
    C.px(G, 8, Y(10), INK); C.px(G, 9, Y(9.6), INK); C.px(G, 15, Y(10), INK); C.px(G, 14, Y(9.6), INK);
    if (P.face === 'happy') { C.rect(G, 10, Y(16), 4, 1, '#3e0d1c'); C.rect(G, 11, Y(17), 2, 1, '#ff93bf'); }
    else if (P.held) C.rect(G, 10.5, Y(15.6), 3, 2, '#3e0d1c');
    else { C.rect(G, 10, Y(16.4), 4, 1, '#3e0d1c'); C.px(G, 10, Y(15.4), '#3e0d1c'); }
    if (P.face !== 'happy') { C.px(G, 17.6, Y(8.6), '#9bd6f7'); C.px(G, 17.6, Y(9.6), '#63a0ef'); C.px(G, 18.6, Y(9.6), '#dff4ff'); }
    if (up) arms();
  },
};
CHIBI.put('unpelo', (frame = 'idle', t = 0) => { const p = CHIBI.pose(frame, t, 10); return CHIBI.make('unpelo:' + p, () => CHIBI.human(CHIBI.UNPELO, p)); });
