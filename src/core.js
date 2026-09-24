// ============================================================================
//  WESTIE WARE ¡Tocados! — core
//  Two DS-style screens (256x192 each). Every scene draws the top screen and
//  the touch screen separately (or one tall picture that spans both, hinge
//  included). Input only lives on the bottom screen, like a real stylus.
// ============================================================================
'use strict';

const SW = 256, SH = 192;            // one screen
const FR = 4;                        // console frame at the sides of the screens
const HINGE = 18;                    // gap between the screens
const TALL_H = SH * 2 + HINGE;       // a tall picture covers both screens + hinge
const STEP = 1 / 60;

const QS = new URLSearchParams(location.search);
const TESTING = QS.has('test');
const SCENE_ARG = QS.get('escena');

// ---------------------------------------------------------------- math ----
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const TAU = Math.PI * 2;
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
const sgn = v => v < 0 ? -1 : v > 0 ? 1 : 0;
const fl = Math.floor, rd = Math.round;

const E = {
  lin: t => t,
  inQ: t => t * t,
  outQ: t => 1 - (1 - t) * (1 - t),
  ioQ: t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2,
  inC: t => t * t * t,
  outC: t => 1 - (1 - t) ** 3,
  ioC: t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
  outQuint: t => 1 - (1 - t) ** 5,
  inBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  outBack: t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  outBack2: t => 1 + 4 * (t - 1) ** 3 + 3 * (t - 1) ** 2,
  outElastic: t => t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1,
  outBounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
  ioSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};
// damped spring 0 → 1 with overshoot ("boing"); freq = wobbles per second, damp = decay
const spring = (t, freq = 2.2, damp = 7) => t <= 0 ? 0 : 1 - Math.exp(-damp * t) * Math.cos(freq * TAU * t);

// ---------------------------------------------------------------- rng -----
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let RNG = mulberry32(QS.has('seed') ? +QS.get('seed') : (Date.now() & 0xffffff));
const rnd = (a = 1, b) => b === undefined ? RNG() * a : a + RNG() * (b - a);
const rndi = (a, b) => fl(rnd(a, b + 1));
const pick = arr => arr[fl(RNG() * arr.length)];
const chance = p => RNG() < p;
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = fl(RNG() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// cheap deterministic hash noise (for textures that must not shimmer)
const hash2 = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function vnoise(x, y, s = 0) {
  const xi = fl(x), yi = fl(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
const fbm = (x, y, s = 0) => (vnoise(x, y, s) * .6 + vnoise(x * 2.1, y * 2.1, s + 7) * .3 + vnoise(x * 4.3, y * 4.3, s + 13) * .1);

// ---------------------------------------------------------------- canvases -
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; c.g = g; return c; }
const cv = document.getElementById('c');
const cx = cv.getContext('2d');
const TOPC = mkCanvas(SW, SH), BOTC = mkCanvas(SW, SH), TALLC = mkCanvas(SW, TALL_H);
const T = TOPC.g, B = BOTC.g, TL = TALLC.g;

// ---------------------------------------------------------------- save ----
const SAVE_KEY = 'westieware-save-v1';
function defaultSave() {
  return { v: 1, prologue: false, cleared: {}, best: {}, seen: {}, bestMg: {}, unlockSeen: {}, toys: {}, opts: { sound: 1, layout: 'auto' }, plays: 0 };
}
function loadSave() {
  if (QS.has('nosave') || TESTING) return defaultSave();
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) { const d = defaultSave(); return Object.assign(d, s, { opts: Object.assign(d.opts, s.opts || {}) }); } } catch (e) { }
  return defaultSave();
}
let SAVE = loadSave();
function persist() { if (QS.has('nosave') || TESTING) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } }

// ---------------------------------------------------------------- layout --
// Portrait first: the two screens are stacked at full width and centred; on
// tall phones the leftover height becomes console body (lid above, base below).
const LAY = { W: 0, H: 0, s: 1, top: { x: FR, y: FR }, bot: { x: FR, y: FR + SH + HINGE }, frame: null, lid: 0 };
function relayout() {
  const vw = Math.max(1, innerWidth), vh = Math.max(1, innerHeight);
  const W = SW + FR * 2, minH = SH * 2 + HINGE + FR * 2;
  const H = clamp(rd(W * vh / vw), minH, minH + 150);
  let s = Math.min(vw / W, vh / H); s = s >= 2 ? fl(s) : Math.max(.5, s);
  const extra = H - minH, lid = rd(extra * .56);
  LAY.W = W; LAY.H = H; LAY.s = s; LAY.lid = lid;
  LAY.top = { x: FR, y: FR + lid };
  LAY.bot = { x: FR, y: FR + lid + SH + HINGE };
  cv.width = W; cv.height = H; cx.imageSmoothingEnabled = false;
  cv.style.width = fl(W * s) + 'px'; cv.style.height = fl(H * s) + 'px';
  LAY.frame = typeof buildFrame === 'function' ? buildFrame(W, H) : null;
  if (SCENE) render(); // resizing wipes the canvas
}

// ---------------------------------------------------------------- input ---
// IN.* is what scenes read. Edge flags (tap/rel) last exactly one update step.
const IN = {
  x: 128, y: 96, down: false, tap: false, rel: false, dx: 0, dy: 0, vx: 0, vy: 0, sx: 0, sy: 0, held: 0,
  moved: 0, path: [], topTap: false, anyTap: false, key: null, has: false, id: null,
};
const _q = [];
function toScreen(e) {
  const r = cv.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width * LAY.W, ny = (e.clientY - r.top) / r.height * LAY.H;
  const bx = nx - LAY.bot.x, by = ny - LAY.bot.y, tx = nx - LAY.top.x, ty = ny - LAY.top.y;
  const onBot = bx >= -8 && by >= -8 && bx < SW + 8 && by < SH + 8;
  const onTop = !onBot; // anywhere else on the console counts as "tap to continue"
  return { x: clamp(bx, 0, SW - 1), y: clamp(by, 0, SH - 1), onBot, onTop, tx, ty };
}
cv.addEventListener('pointerdown', e => { e.preventDefault(); auUnlock(); const p = toScreen(e); try { cv.setPointerCapture(e.pointerId); } catch (_) { } _q.push({ k: 'd', p, id: e.pointerId }); });
cv.addEventListener('pointermove', e => { const p = toScreen(e); _q.push({ k: 'm', p, id: e.pointerId }); });
const _up = e => { const p = toScreen(e); _q.push({ k: 'u', p, id: e.pointerId }); };
cv.addEventListener('pointerup', _up); cv.addEventListener('pointercancel', _up);
cv.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => { auUnlock(); if (e.repeat) return; _q.push({ k: 'key', key: e.key }); if ([' ', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); });
let _touchOnTop = false;
let REALTAP = false; // a genuine press this step (the demo bot can't fake it)
function pollInput() {
  IN.tap = false; IN.rel = false; IN.topTap = false; IN.anyTap = false; IN.key = null; REALTAP = false;
  const px = IN.x, py = IN.y;
  let dx = 0, dy = 0;
  while (_q.length) {
    const ev = _q.shift();
    if (ev.k === 'key') { IN.key = ev.key; REALTAP = true; if (ev.key === ' ' || ev.key === 'Enter') IN.anyTap = true; continue; }
    const p = ev.p;
    if (ev.k === 'd') {
      REALTAP = true;
      if (IN.down) continue;
      IN.id = ev.id;
      if (p.onBot) {
        IN.down = true; IN.tap = true; IN.anyTap = true; IN.has = true; _touchOnTop = false;
        IN.x = p.x; IN.y = p.y; IN.sx = p.x; IN.sy = p.y; IN.held = 0; IN.moved = 0; IN.path = [{ x: p.x, y: p.y }];
        touchRipple(p.x, p.y);
        if (typeof sfx === 'function') sfx('touch');
      } else if (p.onTop) { IN.topTap = true; IN.anyTap = true; IN.tx = p.tx; IN.ty = p.ty; _touchOnTop = true; }
      break; // one press per step so taps are never merged
    } else if (ev.k === 'm') {
      if (ev.id !== IN.id && IN.down) continue;
      if (IN.down) { dx += p.x - IN.x; dy += p.y - IN.y; IN.moved += Math.hypot(p.x - IN.x, p.y - IN.y); IN.x = p.x; IN.y = p.y; const lp = IN.path[IN.path.length - 1]; if (!lp || Math.hypot(lp.x - p.x, lp.y - p.y) >= 1) IN.path.push({ x: p.x, y: p.y }); if (IN.path.length > 600) IN.path.shift(); }
      else if (p.onBot) { IN.x = p.x; IN.y = p.y; }
    } else if (ev.k === 'u') {
      if (IN.down && (ev.id === IN.id || ev.id == null)) { IN.down = false; IN.rel = true; IN.x = p.x; IN.y = p.y; break; }
      _touchOnTop = false;
    }
  }
  IN.dx = dx; IN.dy = dy;
  IN.vx = lerp(IN.vx, dx / STEP, .5); IN.vy = lerp(IN.vy, dy / STEP, .5);
  if (!IN.down) { IN.vx *= .8; IN.vy *= .8; }
  if (IN.down) IN.held += STEP;
  void px; void py;
}
// the bot (tests + attract mode) drives input through this
const BOTIN = { on: false, x: 0, y: 0, down: false };
function botInput() {
  if (!BOTIN.on) return;
  IN.tap = false; IN.rel = false; IN.anyTap = false; IN.topTap = false;
  const nx = clamp(BOTIN.x, 0, SW - 1), ny = clamp(BOTIN.y, 0, SH - 1);
  IN.dx = BOTIN.down && IN.down ? nx - IN.x : 0; IN.dy = BOTIN.down && IN.down ? ny - IN.y : 0;
  if (BOTIN.down && !IN.down) { IN.down = true; IN.tap = true; IN.anyTap = true; IN.sx = nx; IN.sy = ny; IN.held = 0; IN.moved = 0; IN.path = [{ x: nx, y: ny }]; }
  else if (!BOTIN.down && IN.down) { IN.down = false; IN.rel = true; }
  if (IN.down) { IN.moved += Math.hypot(IN.dx, IN.dy); if (IN.dx || IN.dy) IN.path.push({ x: nx, y: ny }); IN.held += STEP; }
  IN.x = nx; IN.y = ny; IN.vx = IN.dx / STEP; IN.vy = IN.dy / STEP;
}

// touch ripples: every press on the touch screen leaves a small stylus ring
const RIPPLES = [];
function touchRipple(x, y) { RIPPLES.push({ x, y, t: 0 }); }
function drawRipples(g) {
  for (let i = RIPPLES.length - 1; i >= 0; i--) {
    const r = RIPPLES[i]; r.t += STEP;
    if (r.t > .3) { RIPPLES.splice(i, 1); continue; }
    const k = r.t / .3, rad = 3 + k * 9;
    g.globalAlpha = 1 - k; ringPx(g, r.x, r.y, rad, '#ffffff'); g.globalAlpha = (1 - k) * .6; ringPx(g, r.x, r.y, rad + 1, '#1d1424'); g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- time ----
let NOW = 0;             // game clock (seconds)
let FRAME = 0;
let HITSTOP = 0;         // frames of freeze for impacts
let SLOWMO = 1;
const TIMERS = [];
function after(sec, fn) { TIMERS.push({ at: NOW + sec, fn }); }
function runTimers() { for (let i = TIMERS.length - 1; i >= 0; i--) if (NOW >= TIMERS[i].at) { const t = TIMERS.splice(i, 1)[0]; t.fn(); } }

// tweens: tween(obj, {x: 10}, 0.3, E.outBack, delay)
const TWEENS = [];
function tween(o, to, dur, ease = E.outQ, delay = 0, done) {
  const tw = { o, to, from: null, dur: Math.max(1e-4, dur), ease, t: -delay, done };
  TWEENS.push(tw); return tw;
}
function runTweens(dt) {
  for (let i = TWEENS.length - 1; i >= 0; i--) {
    const tw = TWEENS[i]; tw.t += dt; if (tw.t < 0) continue;
    if (!tw.from) { tw.from = {}; for (const k in tw.to) tw.from[k] = tw.o[k]; }
    const k = Math.min(1, tw.t / tw.dur), e = tw.ease(k);
    for (const p in tw.to) tw.o[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
    if (k >= 1) { TWEENS.splice(i, 1); tw.done && tw.done(); }
  }
}

// ---------------------------------------------------------------- shake ---
const SHAKE = { top: { a: 0, t: 0 }, bot: { a: 0, t: 0 } };
function shake(which, amp, dur = .25) { for (const w of which === 'both' ? ['top', 'bot'] : [which]) { const s = SHAKE[w]; if (amp >= s.a * (s.t > 0 ? 1 : 0)) { s.a = amp; s.t = dur; s.d = dur; } } }
function shakeOff(w) { const s = SHAKE[w]; if (s.t <= 0) return [0, 0]; const k = s.t / s.d, a = s.a * k; return [rd((RNG() * 2 - 1) * a), rd((RNG() * 2 - 1) * a)]; }
// full-screen colour flashes (per screen)
const FLASH = { top: null, bot: null };
function flash(which, col = '#ffffff', dur = .12, a = 1) { for (const w of which === 'both' ? ['top', 'bot'] : [which]) FLASH[w] = { col, dur, t: dur, a }; }

// ---------------------------------------------------------------- scenes --
let SCENE = null, NEXT = null;
function go(scene, arg) {
  if (SCENE && SCENE.exit) SCENE.exit();
  SCENE = scene; SCENE._t = 0;
  if (scene.enter) scene.enter(arg);
}
// A transition covers both screens, swaps scene at its midpoint.
let TRANS = null;
function transit(kind, scene, arg, dur = .7, col) {
  if (TRANS) return;
  TRANS = { kind, scene, arg, dur, t: 0, swapped: false, col: col || '#1d1424' };
}
function runTransition(dt) {
  if (!TRANS) return;
  TRANS.t += dt;
  if (!TRANS.swapped && TRANS.t >= TRANS.dur / 2) { TRANS.swapped = true; if (TRANS.scene) go(TRANS.scene, TRANS.arg); }
  if (TRANS.t >= TRANS.dur) TRANS = null;
}

// ---------------------------------------------------------------- loop ----
let _last = 0, _acc = 0, PAUSED = false, FROZEN = QS.has('freeze');
function tick(dt) {
  FRAME++;
  pollInput();
  if (BOTIN.on && typeof botDrive === 'function') botDrive();
  botInput();
  if (SCENE && SCENE.always) SCENE.always(dt); // clocks that must not stop during hit-stop (the beat!)
  if (HITSTOP > 0) { HITSTOP--; return; }
  const sdt = dt * SLOWMO;
  NOW += sdt;
  runTimers();
  runTweens(sdt);
  for (const w of ['top', 'bot']) { const s = SHAKE[w]; if (s.t > 0) s.t -= dt; const f = FLASH[w]; if (f) { f.t -= dt; if (f.t <= 0) FLASH[w] = null; } }
  if (SCENE) { SCENE._t += sdt; SCENE.update && SCENE.update(sdt); }
  runTransition(dt);
  if (typeof auTick === 'function') auTick();
}
function render() {
  const sc = SCENE;
  if (sc) {
    if (sc.drawTall) {
      TL.save(); sc.drawTall(TL); TL.restore();
      T.drawImage(TALLC, 0, 0, SW, SH, 0, 0, SW, SH);
      B.drawImage(TALLC, 0, SH + HINGE, SW, SH, 0, 0, SW, SH);
      if (sc.drawTopOver) { T.save(); sc.drawTopOver(T); T.restore(); }
      if (sc.drawBotOver) { B.save(); sc.drawBotOver(B); B.restore(); }
    } else {
      T.save(); sc.drawTop && sc.drawTop(T); T.restore();
      B.save(); sc.drawBot && sc.drawBot(B); B.restore();
    }
  }
  if (TRANS && typeof drawTransition === 'function') drawTransition(TRANS);
  drawRipples(B);
  for (const w of ['top', 'bot']) { const f = FLASH[w]; if (f) { const g = w === 'top' ? T : B; g.globalAlpha = f.a * clamp(f.t / f.dur, 0, 1); g.fillStyle = f.col; g.fillRect(0, 0, SW, SH); g.globalAlpha = 1; } }
  // composite
  cx.fillStyle = '#0c0a10'; cx.fillRect(0, 0, LAY.W, LAY.H);
  if (LAY.frame) cx.drawImage(LAY.frame, 0, 0);
  const [tx, ty] = shakeOff('top'), [bx, by] = shakeOff('bot');
  cx.save(); cx.beginPath(); cx.rect(LAY.top.x, LAY.top.y, SW, SH); cx.clip(); cx.fillStyle = '#000'; cx.fillRect(LAY.top.x, LAY.top.y, SW, SH); cx.drawImage(TOPC, LAY.top.x + tx, LAY.top.y + ty); cx.restore();
  cx.save(); cx.beginPath(); cx.rect(LAY.bot.x, LAY.bot.y, SW, SH); cx.clip(); cx.fillStyle = '#000'; cx.fillRect(LAY.bot.x, LAY.bot.y, SW, SH); cx.drawImage(BOTC, LAY.bot.x + bx, LAY.bot.y + by); cx.restore();
  if (typeof drawFrameOver === 'function') drawFrameOver(cx);
  if (LANDSCAPE_HINT.on && typeof drawRotateHint === 'function') drawRotateHint(cx);
}
// phones held sideways get a friendly "play it upright" card (tap to dismiss)
const LANDSCAPE_HINT = { on: false, dismissed: false };
function checkOrientation() {
  const coarse = matchMedia && matchMedia('(pointer: coarse)').matches;
  LANDSCAPE_HINT.on = coarse && innerWidth > innerHeight * 1.15 && !LANDSCAPE_HINT.dismissed;
}
addEventListener('resize', checkOrientation);
addEventListener('pointerdown', () => { if (LANDSCAPE_HINT.on) { LANDSCAPE_HINT.dismissed = true; LANDSCAPE_HINT.on = false; } });
document.addEventListener('gesturestart', e => e.preventDefault());
function frame(now) {
  requestAnimationFrame(frame);
  if (!_last) _last = now;
  let dt = (now - _last) / 1000; _last = now;
  if (dt > .25) dt = .25;
  if (PAUSED || FROZEN) { render(); return; }
  _acc += dt;
  let n = 0;
  try {
    while (_acc >= STEP && n < 8) { _acc -= STEP; tick(STEP); n++; }
    if (n === 8) _acc = 0;
    render();
  } catch (e) { reportError(e); }
  if (typeof warmStep === 'function' && WARM.length) warmStep(n > 1 ? 4 : 9);
}
// errors never freeze the console: they are noted (visible in ?debug) and the game carries on
const ERRORS = [];
function reportError(e) { if (ERRORS.length < 20) ERRORS.push(String(e && e.stack || e)); document.documentElement.setAttribute('data-err', String(e && e.message || e)); if (QS.has('debug')) console.error(e); }
addEventListener('resize', relayout);
document.addEventListener('visibilitychange', () => { if (typeof auSuspend === 'function') auSuspend(document.hidden); });
