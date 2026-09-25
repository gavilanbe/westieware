// ============================================================================
//  title — the WESTIE WARE ¡Grooming! logo and the title screen.
//  The logo: WESTIE in westie fur (the card pens' letters grown into tufts),
//  WARE in WarioWare gold, ¡Grooming! on a pink ribbon that the shears snip,
//  and Keiko peeking over the top with her paws on the letters.
// ============================================================================
'use strict';

const PROLOGUE_V = 2; // bump when the prologue changes so returning players see it again
const SONG_TITLE = { spb: 4, loop: true, tracks: [
  { i: 'p25', v: .6, n: 'C5 . E5 G5 . A5 G5 . E5 . C5 . D5 . E5 . C5 . E5 G5 . A5 C6 . A5 . G5 . E5 . D5 . F5 . A5 C6 . D6 C6 . A5 . F5 . G5 . A5 . G5 . E5 C5 . D5 E5 . C5 . . . . . . .' },
  { i: 'p12', v: .3, n: 'E4 . G4 C5 . E5 C5 . G4 . E4 . F4 . G4 . E4 . G4 C5 . E5 G5 . E5 . C5 . G4 . F4 . A4 . C5 F5 . A5 F5 . C5 . A4 . B4 . D5 . B4 . G4 E4 . F4 G4 . E4 . . . . . . .' },
  { i: 'bass', v: .85, n: 'C3 . . C3 . . G2 . A2 . . A2 . . E2 . F2 . . F2 . . C3 . G2 . . G2 . . D3 . F2 . . F2 . . A2 . Bb2 . . Bb2 . . F2 . C3 . . G2 . . E2 . C3 . G2 . C3 . . .' },
  { i: 'd', v: .75, n: 'k . h k s . h . k . h k s . h h k . h k s . h . k k h . s s s s' }] };
const TITLE_BPM = 128;

// ---------------------------------------------------------------- the logo --
// the pens: WESTIE is drawn from this round nib (then furred), WARE is chunky
// WarioWare gold, ¡Grooming! a flat-nib script in candy pink on the ribbon
const TITLE_FUR = { id: 'titleFur', u: 3.05, r: 4.2, nib: 'round', slant: 0, gap: .45, rim: 0, sx: 0, sy: 0 };
const TITLE_WARE = { id: 'titleWare', u: 2.45, r: 3, nib: 'round', slant: .14, gap: .8, fill: ['#fff7ae', '#ffd23f', '#f0981a'], line: INK, rim: 2, sx: 1, sy: 4, shadow: ['#a8510c', '#6b2e06', INK], hi: '#ffffff', lo: '#c56d12' };
const TITLE_GROOM = { id: 'titleGroom', u: 1.75, nib: 'flat', r: 2.35, ang: -.8, ratio: .34, slant: .3, gap: .45, fill: ['#ffffff', '#fff0f6', '#ffc9e0'], line: '#4a0f30', rim: 1, sx: 0, sy: 2, shadow: '#4a0f30' };
const TITLE_TAP = { id: 'titleTap', u: 1.3, r: 1.55, nib: 'round', slant: .08, gap: .9, fill: ['#fff7ae', '#ffd23f', '#f0981a'], line: INK, rim: 1, sx: 0, sy: 2, shadow: '#6b2e06', hi: '#ffffff' };

// one letter of WESTIE in fur: the pen's mask, tufted along the top and the
// sides, lit from the top-left with soft lilac shade and strands, inked round
function titleFurGlyph(ch) {
  return mdl('titleFur:' + ch, () => {
    const S = cardStyle(TITLE_FUR), G = cardGlyph(ch, S), P = 3, W = G.W + P * 2, H = G.H + P * 2;
    const M = new Uint8Array(W * H), seed = ch.charCodeAt(0);
    for (let y = 0; y < G.H; y++) for (let x = 0; x < G.W; x++) if (G.M[y * G.W + x]) M[(y + P) * W + x + P] = 1;
    // tufts: clumps of fur standing up off the top edges and out of the sides
    const grow = [];
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = y * W + x; if (!M[i]) continue;
      if (!M[i - W]) { const v = vnoise(x * .45 + seed, y * .3, 5); if (v > .48) { grow.push(i - W); if (v > .68) grow.push(i - 2 * W); } }
      for (const dx of [-1, 1]) if (!M[i + dx] && M[i - dx]) { const v = vnoise(x * .3, y * .45 + seed, 9 + dx); if (v > .6) { grow.push(i + dx); if (v > .8) grow.push(i + dx * 2); } }
    }
    for (const i of grow) M[i] = 1;
    const F = RAMP.fur, c = mkCanvas(W, H), img = c.g.createImageData(W, H), d = img.data;
    const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && M[y * W + x] === 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!M[y * W + x]) continue;
      let col = F[4];
      if (!inside(x + 1, y + 1) || !inside(x, y + 1)) col = F[2];
      else if (!inside(x + 2, y + 2) || !inside(x, y + 2)) col = F[3];
      else if (vnoise((x - y * .6) * .8, y * .2 + seed, 4) > .72) col = F[3]; // strands
      if (!inside(x - 1, y - 1) && !inside(x, y - 1) && inside(x, y + 1)) col = '#ffffff';
      const [r, gg, b] = cardRGBA(col), o = (y * W + x) * 4; d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
    }
    c.g.putImageData(img, 0, 0);
    return outlined(c, INK, true);
  });
}
function titleFurShadow(ch) { return mdl('titleFurSh:' + ch, () => silhouette(titleFurGlyph(ch), '#04150f')); }
// letter pen positions of a word, centred on 0
function titleWord(s, st) {
  return mdl('titleWord:' + s + ':' + st.id, () => {
    const S = cardStyle(st), w = cardWordW(s, st); let xx = -w / 2; const L = [];
    for (const ch of s) { L.push({ ch, x: xx }); xx += ch === ' ' ? 4 * S.u : cardAdv(ch, S); }
    return { L, w };
  });
}
// WARE, finished, split in two so the shine only runs over the gold
function titleWareCanvas(part) {
  return mdl('titleWare:' + part, () => {
    const S = cardStyle(TITLE_WARE), G = cardGlyph('W', S), w = cardWordW('WARE', TITLE_WARE), c = mkCanvas(Math.ceil(w) + 24, G.H + 6);
    cardWord(c.g, 'WARE', c.width / 2, G.oy + 1, TITLE_WARE, { layers: part === 'fill' ? ['fill'] : ['glow', 'shadow', 'line2', 'line'] });
    c.oy = G.oy + 1; return c;
  });
}
const TITLE_SCRATCH = { c: null };
function titleShine(g, src, X, Y, p) {
  let c = TITLE_SCRATCH.c; if (!c || c.width !== src.width || c.height !== src.height) c = TITLE_SCRATCH.c = mkCanvas(src.width, src.height);
  c.g.clearRect(0, 0, c.width, c.height); c.g.drawImage(src, 0, 0);
  c.g.globalCompositeOperation = 'source-atop';
  const bx = lerp(-24, c.width + 16, p);
  polyPx(c.g, [[bx, 0], [bx + 8, 0], [bx - 6, c.height], [bx - 14, c.height]], '#ffffff');
  polyPx(c.g, [[bx + 12, 0], [bx + 15, 0], [bx + 1, c.height], [bx - 2, c.height]], '#fffbe0');
  c.g.globalCompositeOperation = 'source-over';
  g.drawImage(c, rd(X), rd(Y));
}
// the shears that snip the ribbon: pivot at (x, y), blades pointing left
function titleShears(g, x, y, open, rot = 0) {
  const a = .05 + open * .36;
  // handles first (behind), then the blades crossing over the pivot
  for (const s of [1, -1]) {
    const ha = rot - s * a * 1.25, hx = x + Math.cos(ha) * 12, hy = y + Math.sin(ha) * 12 + s * 2.5;
    thickLine(g, x, y, hx, hy, 2.4, INK); thickLine(g, x, y, hx, hy, 1.3, '#c93a7c');
    disc(g, hx, hy, 6.4, INK); disc(g, hx, hy, 5.4, '#ff5d9e'); disc(g, hx - 1.5, hy - 1.5, 2.6, '#ffb3d1'); disc(g, hx, hy, 2.6, INK); disc(g, hx + .5, hy + .5, 1.4, '#6b1a45');
  }
  for (const s of [1, -1]) {
    const ang = Math.PI + rot + s * a, tx = x + Math.cos(ang) * 23, ty = y + Math.sin(ang) * 23, nx = -Math.sin(ang) * s, ny = Math.cos(ang) * s;
    polyPx(g, [[x + nx * 3.2, y + ny * 3.2], [tx, ty], [x - nx * 2.2, y - ny * 2.2]], INK);
    polyPx(g, [[x + nx * 2.1, y + ny * 2.1], [tx - Math.cos(ang), ty - Math.sin(ang)], [x - nx * 1.1, y - ny * 1.1]], '#c8ccdc');
    linePx(g, x + nx * 1.2 + Math.cos(ang) * 3, y + ny * 1.2 + Math.sin(ang) * 3, tx - Math.cos(ang) * 3, ty - Math.sin(ang) * 3, '#ffffff');
  }
  disc(g, x, y, 2.6, INK); disc(g, x, y, 1.6, '#e7c35f'); px(g, x - 1, y - 1, '#fff0a6');
}
// the pink ribbon: an arched band with forked tails; k = how far it has unrolled.
// Once it is all out it comes from a cached picture (it was ~1000 rects a frame).
function titleRibbon(g, x, cy, T, k, cut) {
  if (k >= 1) {
    const c = mdl('titleRibbon:' + (cut ? 1 : 0), () => { const cv = mkCanvas(240, 48); cv.info = titleRibbonDraw(cv.g, 120, 20, T, 1, cut); return cv; });
    g.drawImage(c, rd(x - 120), rd(cy - 20));
    const I = c.info; return { x0: I.x0 - 120 + rd(x), x1: I.x1 - 120 + rd(x), w: I.w, h: I.h, arch: xx => I.arch(xx - rd(x) + 120) };
  }
  return titleRibbonDraw(g, x, cy, T, k, cut);
}
function titleRibbonDraw(g, x, cy, T, k, cut) {
  const tw = titleWord('¡GROOMING!', TITLE_GROOM).w, w = Math.ceil(tw + 26), x0 = rd(x - w / 2), x1 = x0 + w, h = 18;
  const arch = xx => Math.round(Math.sin((xx - x0) / w * Math.PI) * -4);
  const reveal = x0 + w * E.outC(k), yTop = xx => cy + arch(xx) - (h >> 1);
  // tails behind the band (the right one is long until the shears get it)
  const tail = (xa, dir, len) => {
    const y0 = yTop(xa) + 4, y1 = y0 + h - 2, xe = xa + dir * len;
    polyPx(g, [[xa, y0 - 1], [xe + dir, y0 + 3], [xe - dir * 5, (y0 + y1) / 2 + 3], [xe + dir, y1 + 6], [xa, y1 + 1]], INK);
    polyPx(g, [[xa, y0], [xe, y0 + 4], [xe - dir * 5, (y0 + y1) / 2 + 3], [xe, y1 + 5], [xa, y1]], '#a1245f');
    linePx(g, xa, y0 + 1, xe - dir, y0 + 4, '#c93a7c');
  };
  if (k > .02) tail(x0 + 2, -1, 14);
  if (k > .98) tail(x1 - 2, 1, cut ? 12 : 24);
  for (let xx = x0; xx < Math.min(x1, reveal); xx++) {
    const y = yTop(xx);
    rect(g, xx, y - 1, 1, h + 2, INK); rect(g, xx, y, 1, h, '#d63c83');
    rect(g, xx, y, 1, 2, '#ff8fc0'); rect(g, xx, y + h - 3, 1, 3, '#a1245f');
    if (xx % 4 < 2 && xx > x0 + 2 && xx < x1 - 3) { px(g, xx, y + 3, '#ffc2dc'); px(g, xx, y + h - 5, '#e8659f'); } // stitching
  }
  if (reveal > x0) { rect(g, x0 - 1, yTop(x0) - 1, 1, h + 2, INK); if (reveal >= x1) rect(g, x1, yTop(x1 - 1) - 1, 1, h + 2, INK); }
  return { x0, x1, w, arch, h };
}
function titleGlow() {
  return mdl('titleGlow', () => {
    const W = 236, H = 150, c = mkCanvas(W, H), g = c.g, G = RAMP.green;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2));
      if (v < 1 && bayerK(x, y) < (1 - v) * 1.15) px(g, x, y, v < .55 && bayerK(x + 1, y + 2) < (.55 - v) * 1.4 ? G[3] : G[2]);
    }
    return c;
  });
}
// the whole logo; (x, y) = the middle of the WESTIE line, t = seconds since it began
const TITLE_T = { drop: .08, land: .32, keiko: .78, ware: .95, ribbon: 1.2, words: 1.3, shears: 1.55, snip: 1.93 };
function drawLogo(g, x, y, t, o = {}) {
  const T = Math.max(0, t), beat = T * TITLE_BPM / 60, bob = T > 2 ? Math.round(Math.sin(beat * Math.PI) * 1.2) : 0;
  const Sf = cardStyle(TITLE_FUR), capY = y - 17;
  // a soft pool of light behind the words (dithered, so it stays pixel art)
  if (!o.noSparkle) g.drawImage(titleGlow(), rd(x - 118), rd(y - 58));
  // sparkles on the beat and bubbles drifting up behind everything
  if (!o.noSparkle) {
    for (let i = 0; i < 10; i++) { const ph = (T * .16 + i * .137) % 1, bx = x - 110 + ((i * 71) % 220), by = y + 80 - ph * 150, r = 2 + (i % 3); if (T < 1 || ph < .05) continue; g.globalAlpha = Math.min(1, (1 - ph) * 2.5); ringPx(g, bx + Math.sin(T * 2 + i) * 4, by, r, '#dff4ff'); px(g, bx + Math.sin(T * 2 + i) * 4 - r * .4, by - r * .5, '#ffffff'); g.globalAlpha = 1; }
  }
  // Keiko climbs up behind the letters and peeks over them
  const kk = spring(T - TITLE_T.keiko, 2.4, 6.5), hx = x + 1;
  if (kk > 0) {
    const hy = capY + 20 - kk * 30 + bob, wink = fl(beat) % 8 === 7;
    drawS(g, keikoHead(T < TITLE_T.keiko + .45 ? 'wow' : wink ? 'wink' : 'happy'), hx, hy, { ax: .5, ay: .5, rot: T > 2 ? Math.sin(beat * Math.PI / 2) * .035 : 0 });
  }
  // WESTIE in westie fur: letters drop, land with a squash, then sway on the beat
  const Wd = titleWord('WESTIE', TITLE_FUR);
  Wd.L.forEach((L, i) => {
    const lt = T - i * TITLE_T.drop; if (lt <= 0) return;
    const img = titleFurGlyph(L.ch), sh = titleFurShadow(L.ch), G = cardGlyph(L.ch, Sf);
    const fall = clamp(lt / TITLE_T.land, 0, 1), dy = (1 - E.inQ(fall)) * -80;
    const land = lt - TITLE_T.land, sq = land > 0 ? Math.exp(-land * 8) * Math.cos(land * 24) : 0;
    const sy = 1 - sq * .24, sx = 1 + sq * .18, wave = T > 2 ? Math.round(Math.sin(beat * Math.PI / 2 + i * .9) * 1.4) : 0;
    const bx = x + L.x - 4 + img.width / 2, by = capY - G.oy - 4 + img.height + dy + wave + bob;
    for (let k = 3; k >= 1; k--) drawS(g, sh, bx, by + k, { ax: .5, ay: 1, sx, sy });
    drawS(g, img, bx, by, { ax: .5, ay: 1, sx, sy });
    if (land > 0 && land < .35 && !o.noSparkle) for (let q = 0; q < 3; q++) { const pk = land / .35, px0 = bx + (q - 1) * 9 * (1 + pk * 1.5), py0 = by + 3 - pk * 6; g.globalAlpha = 1 - pk; disc(g, px0, py0, 2.5 - pk * 1.5, '#ffffff'); g.globalAlpha = 1; }
  });
  // a twinkle hops across the fur
  if (!o.noSparkle && T > 2.2) { const tw = (T * .8) % 1, L = Wd.L[fl(T * .8) % Wd.L.length]; if (tw < .35) drawStar(g, x + L.x + 8 + (fl(T * .8) * 7) % 10, capY + 4 + (fl(T * .8) * 11) % 20, 3.2 * Math.sin(tw / .35 * Math.PI) + .4, '#ffffff'); }
  // her paws on top of the letters
  if (kk > .55) for (const s of [-1, 1]) {
    const px0 = hx + s * 21, py0 = capY + 2 + bob + (T > 2 && fl(beat) % 2 === (s > 0 ? 1 : 0) ? -1 : 0);
    ellipsePx(g, px0, py0, 6, 4.2, INK); ellipsePx(g, px0, py0 - .5, 5, 3.2, '#ffffff'); hline(g, px0 - 3, px0 + 2, py0 + 1, RAMP.fur[3]);
    px(g, px0 - 2, py0 + 2, INK); px(g, px0 + 1, py0 + 2, INK); px(g, px0 - 1, py0 - 2, '#ffffff');
  }
  // WARE slams in, then catches the light now and then
  const wk = T - TITLE_T.ware, wy = y + 25 + bob;
  if (wk > 0) {
    if (wk < .9) cardWord(g, 'WARE', x + 4, wy, TITLE_WARE, { anim: i => cardAnimSlam(wk, i, { stagger: .07, from: 2.6 }) });
    else {
      const R = titleWareCanvas('rest'), Fc = titleWareCanvas('fill'), X = x + 4 - R.width / 2, Y = wy - R.oy, sp = (T - 1.9) % 3;
      g.drawImage(R, rd(X), rd(Y));
      if (sp > 0 && sp < .5) titleShine(g, Fc, X, Y, sp / .5); else g.drawImage(Fc, rd(X), rd(Y));
    }
  } else cardPrewarm([['WARE', TITLE_WARE], ['¡GROOMING!', TITLE_GROOM]]);
  // ¡Grooming! on the pink ribbon, then the shears come and snip its tail
  const rk = clamp((T - TITLE_T.ribbon) / .3, 0, 1), cut = T > TITLE_T.snip, cy = y + 66 + bob;
  if (rk > 0) {
    const R = titleRibbon(g, x, cy, T, rk, cut), Wg = titleWord('¡GROOMING!', TITLE_GROOM), n = Wg.L.length;
    const tk = T - TITLE_T.words;
    if (tk > 0) cardWord(g, '¡GROOMING!', x, cy - 11, TITLE_GROOM, { anim: i => {
      const lt = tk - i * .045; if (lt <= 0) return { s: 0 };
      const a = R.arch(x + Wg.L[i].x + 6), hop = T > 2 && fl(beat) % 4 === 0 ? Math.round(Math.sin(clamp((beat % 1) / .5, 0, 1) * Math.PI) * -2 * (i % 2 ? 1 : .5)) : 0;
      return { s: spring(lt, 2.6, 7), dy: a + hop, rot: lt < .25 ? (1 - lt / .25) * (i % 2 ? .3 : -.3) : 0 };
    } });
    // the shears
    const st = T - TITLE_T.shears;
    if (st > 0) {
      const inK = E.outBack(clamp(st / .3, 0, 1)), ex = R.x1 + 14, ey = cy + 1;
      let open = .9;
      if (T > TITLE_T.shears + .3 && T < TITLE_T.snip + .15) open = Math.abs(Math.cos((T - TITLE_T.shears - .3) * 21));
      else if (T > 2.4 && (beat % 4) > 3.6) open = .15; // a little snip every bar
      else if (cut) open = .55;
      titleShears(g, lerp(ex + 70, ex, inK), lerp(ey - 40, ey, inK), open, cut ? -.35 : 0);
      if (cut && T < TITLE_T.snip + .3 && !o.noSparkle) { const k2 = (T - TITLE_T.snip) / .3; for (let q = 0; q < 4; q++) { const a = q / 4 * TAU + .4; drawStar(g, ex - 4 + Math.cos(a) * 10 * k2, ey + Math.sin(a) * 8 * k2, 3 * (1 - k2) + .5, '#fff27a'); } }
      // the snipped bit of ribbon tumbles away
      if (cut) { const ft = T - TITLE_T.snip; if (ft < 1.4) { const fx = R.x1 + 18 + ft * 26, fy = cy + 6 + ft * 40 + ft * ft * 140, fr = ft * 7; g.save(); g.translate(rd(fx), rd(fy)); g.rotate(fr); polyPx(g, [[-6, -5], [6, -3], [1, 3], [6, 6], [-6, 5]], INK); polyPx(g, [[-5, -4], [5, -2], [0, 3], [5, 5], [-5, 4]], '#a1245f'); g.restore(); } }
    }
  }
  // sparkles on the beat
  if (!o.noSparkle && T > 2) {
    const b = fl(beat), ph = beat - b;
    if (ph < .4) for (let q = 0; q < 2; q++) { const hs = hash2(b, q, 11), sx0 = x - 104 + hs * 208, sy0 = y - 40 + hash2(q, b, 12) * 118; drawStar(g, sx0, sy0, 4 * Math.sin(ph / .4 * Math.PI) + .5, q ? '#fff27a' : '#ffffff', ph * 3); }
  }
}
// small version on the console lid (tall phones)
function drawLidLogo(g, x, y) {
  mord(g, 'WESTIE WARE', x, y - 8, { u: 1.2, r: 1.3, rim: 1, sy: 1, fill: ['#fff8e6', '#f2e2b8', '#dcc08a'], line: RAMP.green[0], shadow: RAMP.green[0] }, { anim: i => ({ dy: Math.sin(NOW * 2 + i * .6) * .8 }) });
}

// ---------------------------------------------------------------- TITLE -----
// top: the salon wall in green damask and gilt, gold rays behind the logo and
// everyone you have met so far bopping on the counter; bottom: the shop sign
// and a big gilt START plaque
function titleTopBg() {
  return mdl('titleTopBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, G = RAMP.green, Au = RAMP.gold;
    g.drawImage(cardSalonBg(), 0, 0);
    // the counter everyone stands on
    rect(g, 0, 162, SW, SH - 162, G[0]); rect(g, 0, 162, SW, 1, INK); rect(g, 0, 163, SW, 2, Au[3]); rect(g, 0, 165, SW, 1, Au[1]);
    for (let x = 0; x < SW; x += 16) { rect(g, x, 168, 14, 22, G[1]); rect(g, x + 1, 169, 12, 1, G[2]); }
    return c;
  });
}
function titleBotBg() {
  return mdl('titleBotBg', () => {
    const c = mkCanvas(SW, SH), g = c.g, G = RAMP.green, Au = RAMP.gold;
    rect(g, 0, 0, SW, SH, G[1]);
    for (let y = 0; y < SH; y += 12) for (let x = ((y / 12) % 2) * 12; x < SW; x += 24) rect(g, x, y, 12, 12, G[2]);
    // the footer strip for the credits
    rect(g, 0, 164, SW, SH - 164, G[0]); rect(g, 0, 164, SW, 1, Au[1]); rect(g, 0, 165, SW, 1, Au[3]);
    ringRect(g, 3, 3, SW - 6, 158, 1, Au[2]); ringRect(g, 6, 6, SW - 12, 152, 1, Au[1]);
    for (const [cx, cy, sx, sy] of [[3, 3, 1, 1], [SW - 4, 3, -1, 1], [3, 160, 1, -1], [SW - 4, 160, -1, -1]]) { for (let i = 0; i < 7; i++) { px(g, cx + sx * i, cy + sy * 3, Au[3]); px(g, cx + sx * 3, cy + sy * i, Au[3]); } disc(g, cx + sx * 5, cy + sy * 5, 1.4, Au[3]); }
    return c;
  });
}
// who stands on the counter: Keiko, Anahí and everyone unlocked since
function titleCrew() {
  const L = ['keiko', 'anahi'];
  for (const id of STORY_STAGES.concat(['superwestie'])) if (id !== 'anahi' && STAGES[id] && stageUnlocked(id) && STAGES[id].chibi) L.push(id);
  return L;
}
const TITLE = {
  enter() { this.t = 0; this.idle = 0; this.out = -1; this.cue = {}; stopAllMusic(.1); this.song = playSong(SONG_TITLE, { bpm: TITLE_BPM }); this.fx = new FX(); this.press = 0; },
  exit() { },
  // the logo's little sounds, once each, in time with its entrance
  cues(t) {
    const C0 = .15, at = (k, time, fn) => { if (!this.cue[k] && t >= time + C0) { this.cue[k] = 1; fn(); } };
    for (let i = 0; i < 6; i++) at('l' + i, i * TITLE_T.drop + TITLE_T.land, () => sfx('pop', { pitch: .9 + i * .09, vol: .55 }));
    at('keiko', TITLE_T.keiko + .05, () => sfx('bark', { pitch: 1.35, vol: .45 }));
    at('ware', TITLE_T.ware + .1, () => { sfx('slam'); shake('top', 2, .18); });
    at('ribbon', TITLE_T.ribbon, () => sfx('swoosh', { pitch: 1.3, vol: .5 }));
    at('shears', TITLE_T.shears, () => sfx('whoosh', { pitch: 1.4, vol: .35 }));
    at('snip', TITLE_T.snip, () => { sfx('snip'); sfx('sparkle', { vol: .5 }); });
  },
  update(dt) {
    this.t += dt; this.fx.update(dt); this.idle = REALTAP ? 0 : this.idle + dt; this.press = Math.max(0, this.press - dt * 4);
    if (this.out < 0) this.cues(this.t);
    if (this.idle > 25 && this.out < 0 && !TESTING) { this.out = 0; transit('blinds', DEMO, {}); return; }
    if (this.out < 0 && this.t > .8 && (IN.tap || IN.anyTap)) {
      this.out = 0; this.press = 1; sfx('bark', { n: 2, pitch: 1.1 }); sfx('slam'); flash('both', '#ffffff', .15); shake('top', 3, .25);
      this.fx.burst(IN.x || SW / 2, IN.y || 100, 18, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 180 });
      this.fx.burst(SW / 2, 104, 12, { k: 'bubble', c: '#dff4ff', sp0: 30, sp1: 90, g: -60, r: 3, life0: .5, life1: .9 });
      stopSong(this.song, .3);
      // the prologue plays on the first visit, and once more for players of an older version (it was redrawn with Keiko)
      after(.55, () => { if (!SAVE.prologue || (SAVE.prologueV || 1) < PROLOGUE_V) playCut('prologo', () => { SAVE.prologue = true; SAVE.prologueV = PROLOGUE_V; persist(); go(MENU, { first: true }); }); else transit('paw', MENU, {}); });
    }
    if (this.out >= 0) this.out += dt;
  },
  drawTop(g) {
    const t = this.t, beat = t * TITLE_BPM / 60, Au = RAMP.gold;
    g.drawImage(titleTopBg(), 0, 0);
    // slow gold rays behind the logo, brighter on the downbeat
    const pulse = .08 + Math.max(0, 1 - (beat % 1) * 3) * .05 * (t > 2 ? 1 : 0);
    g.globalAlpha = pulse;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .12; polyPx(g, [[SW / 2, 78], [SW / 2 + Math.cos(a - .09) * 240, 78 + Math.sin(a - .09) * 240], [SW / 2 + Math.cos(a + .09) * 240, 78 + Math.sin(a + .09) * 240]], Au[4]); }
    g.globalAlpha = 1;
    drawLogo(g, SW / 2, 70, t - .15);
    // the crew on the counter, bopping on the beat (a cheer every two bars)
    const crew = titleCrew(), n = crew.length, sp = Math.min(34, 200 / Math.max(1, n - 1));
    crew.forEach((id, i) => {
      const k = E.outBack(clamp((t - .4 - i * .07) / .4, 0, 1)); if (k <= 0) return;
      const cx = n === 1 ? SW / 2 : SW / 2 + (i - (n - 1) / 2) * sp, ph = (beat + i * .25) % 1, hop = ph < .25 ? Math.round(Math.sin(ph / .25 * Math.PI) * 2) : 0;
      const cheer = fl(beat) % 8 === 0 || this.out >= 0, frame = cheer ? 'happy' : 'idle';
      const img = id === 'keiko' ? keikoChibi(frame, t) : menuChibi(id, frame, t);
      shadowOval(g, cx, 183, 8, 2, .45);
      drawS(g, img, cx, 184 - hop + (1 - k) * 40, { ax: .5, ay: 1, flip: cx > SW / 2 && id !== 'keiko' });
    });
  },
  drawBot(g) {
    const t = this.t, beat = t * TITLE_BPM / 60, G = RAMP.green, Au = RAMP.gold;
    g.drawImage(titleBotBg(), 0, 0);
    // soap bubbles rising through the green
    for (let i = 0; i < 8; i++) { const ph = (t * .12 + i * .19) % 1, bx = 14 + ((i * 97) % 228) + Math.sin(t * 1.6 + i) * 5, by = 160 - ph * 170, r = 2 + (i % 3); g.globalAlpha = Math.min(1, (1 - ph) * 3) * .8; ringPx(g, bx, by, r, G[4]); px(g, bx - 1, by - r + 1, '#ffffff'); g.globalAlpha = 1; }
    // the sign drops in and swings
    const sk = E.outBack(clamp((t - .1) / .45, 0, 1)), sw = Math.sin(t * 5) * .05 * Math.exp(-Math.max(0, t - .5) * 2);
    g.save(); g.translate(SW / 2, -40 + sk * 88); g.rotate(sw); drawS(g, wbSign(), 0, 0, {}); g.restore();
    // the START plaque, breathing on the beat
    if (t > .7) {
      const k = E.outBack(clamp((t - .7) / .35, 0, 1)), pulse = this.out < 0 ? 1 + Math.max(0, 1 - (beat % 1) * 4) * .04 : 1, press = this.press;
      g.save(); g.translate(SW / 2, 110); g.scale(k * pulse * (1 + press * .06), k * pulse * (1 - press * .12));
      panel(g, -94, -17, 188, 34, Au[2], { r: 8, line: INK }); panel(g, -91, -14, 182, 28, G[2], { r: 6, line: Au[1] });
      rect(g, -86, -12, 172, 2, G[3]); hline(g, -86, 86, 10, G[1]);
      for (const [px0, py0] of [[-86, -9], [86, -9], [-86, 9], [86, 9]]) { disc(g, px0, py0, 1.4, INK); px(g, px0, py0, Au[4]); }
      if (this.out < 0 || fl(this.out * 16) % 2 === 0) cardWord(g, 'TOCA PARA EMPEZAR', 0, -9, cardFit('TOCA PARA EMPEZAR', 168, TITLE_TAP), { anim: i => ({ dy: Math.round(Math.sin(beat * Math.PI + i * .45) * 1.2) }) });
      g.restore();
      if (this.out < 0) drawHand(g, SW / 2 + 82, 124 + (fl(beat) % 2) * 3, fl(beat) % 2);
      // paw prints trot along under the plaque
      for (let i = 0; i < 7; i++) { const a = clamp(1 - Math.abs(((t * .9) % 7) - i) / 2.2, 0, 1); if (a > 0) { g.globalAlpha = a * .7; drawPawPrint(g, 52 + i * 26, 146 + (i % 2) * 5, G[4], 1.45); g.globalAlpha = 1; } }
    }
    txt(g, '© 2026 Westie BLVRD · by Anahí Gavilán', SW / 2, 170, RAMP.cream[3], { align: 'c' });
    txt(g, 'C/ Viladomat 185 · Barcelona', SW / 2, 181, RAMP.mint[2], { align: 'c' });
    this.fx.draw(g);
  },
};
function drawPawPrint(g, x, y, col, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (dx, dy) => [x + dx * c - dy * s, y + dx * s + dy * c];
  const [mx, my] = P(0, 2); ellipsePx(g, mx, my, 4, 3.4, col);
  for (const [dx, dy] of [[-4.5, -2.5], [-1.6, -5], [1.6, -5], [4.5, -2.5]]) { const [tx, ty] = P(dx, dy); disc(g, tx, ty, 1.7, col); }
}
// ---------------------------------------------------------------- DEMO ------
// the attract mode: the bot plays random microgames until someone touches
defStage({ id: 'demo', menu: false, name: 'DEMO', sub: '«Toca para volver al título»', verb: '¡MIRA!', mech: 'mix', bpm: 124, endless: true,
  games: () => { const l = allStoryGames().filter(id => SAVE.seen[id] || MG[id].stage === 'anahi'); return l.length ? l : allStoryGames(); },
  boss: null, speedEvery: 5, get room() { return STAGES.anahi.room; }, get songs() { return STAGES.anahi.songs; }, cardCols: [RAMP.green[1], RAMP.green[2]], portrait: (k, t) => STAGES.anahi.portrait(k, t) });
const DEMO = {
  enter() { BOTIN.on = true; go(STG, { id: 'demo', story: false }); SCENE = DEMO_WRAP; },
};
// wraps the stage scene: draws a DEMO banner and leaves on a real touch
const DEMO_WRAP = {
  wrapsStage: true,
  update(dt) { if (REALTAP) { BOTIN.on = false; stopAllMusic(.1); transit('blinds', TITLE, {}); SCENE = STG_ONLY; return; } STG.update(dt); if (STG.S.phase === 'results') { BOTIN.on = false; transit('blinds', TITLE, {}); SCENE = STG_ONLY; } },
  always(dt) { STG.always(dt); },
  drawTop(g) { STG.drawTop(g); if (fl(NOW * 2) % 2 === 0) { panel(g, SW / 2 - 30, SH - 20, 60, 15, INK, { r: 4, line: '#ffffff' }); txt(g, 'DEMO', SW / 2, SH - 16, '#ffffff', { align: 'c', bold: true }); } },
  drawBot(g) { STG.drawBot(g); },
  exit() { BOTIN.on = false; STG.exit(); },
};
const STG_ONLY = { wrapsStage: true, update(dt) { STG.update(dt); }, always(dt) { STG.always(dt); }, drawTop(g) { STG.drawTop(g); }, drawBot(g) { STG.drawBot(g); }, exit() { STG.exit(); } };
