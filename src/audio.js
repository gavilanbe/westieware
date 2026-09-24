// ============================================================================
//  audio — a small synth + step sequencer written for WESTIE WARE.
//  Everything is generated: pulses, triangle bass, FM bells, marimba, brass,
//  drums, barks and the "bla bla" voices of the dialogue.
//  Songs are strings of steps (see parseTrack) scheduled on the audio clock so
//  a microgame's music starts exactly with its first beat.
// ============================================================================
'use strict';

const AU = { ctx: null, master: null, mus: null, fx: null, on: true, waves: {}, noise: null, players: [], unlocked: false, vol: 1 };
AU.on = SAVE.opts.sound !== 0;
function auUnlock() {
  if (!AU.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { AU.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return; }
    const a = AU.ctx;
    const comp = a.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .18;
    AU.master = a.createGain(); AU.master.gain.value = AU.on ? .9 : 0;
    AU.master.connect(comp); comp.connect(a.destination);
    AU.mus = a.createGain(); AU.mus.gain.value = .5; AU.mus.connect(AU.master);
    AU.fx = a.createGain(); AU.fx.gain.value = .75; AU.fx.connect(AU.master);
    for (const d of [.125, .25, .5]) AU.waves[d] = pulseWave(d);
    const n = a.createBuffer(1, a.sampleRate, a.sampleRate), ch = n.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; AU.noise = n;
  }
  if (AU.ctx.state === 'suspended') AU.ctx.resume();
  if (!AU.unlocked) { AU.unlocked = true; const b = AU.ctx.createBuffer(1, 1, 22050), s = AU.ctx.createBufferSource(); s.buffer = b; s.connect(AU.ctx.destination); s.start(0); }
}
function auSuspend(hidden) { if (!AU.ctx) return; if (hidden) AU.ctx.suspend(); else if (AU.on) AU.ctx.resume(); }
function setSound(on) { AU.on = on; SAVE.opts.sound = on ? 1 : 0; persist(); if (AU.master) AU.master.gain.setTargetAtTime(on ? .9 : 0, AU.ctx.currentTime, .02); }
const auT = () => AU.ctx ? AU.ctx.currentTime : 0;
function pulseWave(duty) { const n = 40, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) { re[k] = Math.sin(2 * k * Math.PI * duty) / (k * Math.PI); im[k] = (1 - Math.cos(2 * k * Math.PI * duty)) / (k * Math.PI); } return AU.ctx.createPeriodicWave(re, im); }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const NOTE_IX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteMidi(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) return null; return 12 * (+m[3] + 1) + NOTE_IX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }

// ---------------------------------------------------------------- voices ----
function envAt(gn, t, a, d, s, r, dur, peak) { const g = gn.gain; g.setValueAtTime(0, t); g.linearRampToValueAtTime(peak, t + a); g.setTargetAtTime(peak * s, t + a, Math.max(.001, d / 3)); g.setTargetAtTime(0, t + Math.max(a, dur), Math.max(.001, r / 4)); return t + Math.max(a, dur) + r; }
function osc(type, f, t, end, dest, detune = 0) {
  const o = AU.ctx.createOscillator();
  if (typeof type === 'number') o.setPeriodicWave(AU.waves[type]); else o.type = type;
  o.frequency.setValueAtTime(f, t); if (detune) o.detune.setValueAtTime(detune, t);
  o.connect(dest); o.start(t); o.stop(end + .05); return o;
}
function noiseSrc(t, end, dest, rate = 1) { const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; s.loop = true; s.playbackRate.value = rate; s.connect(dest); s.start(t, Math.random() * .8); s.stop(end + .05); return s; }
function filt(type, f, q, dest) { const b = AU.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
function gainTo(dest, v = 1) { const g = AU.ctx.createGain(); g.gain.value = v; g.connect(dest); return g; }

// instrument table: play(f, t, dur, vel, dest)
const INST = {
  p12: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .004, .12, .55, .05, d, .22 * v); osc(.125, f, t, e, g); },
  p25: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .004, .14, .6, .06, d, .2 * v); osc(.25, f, t, e, g); },
  p50: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .004, .1, .5, .05, d, .17 * v); osc(.5, f, t, e, g); },
  lead: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .006, .2, .7, .08, d, .2 * v); const a = osc(.25, f, t, e, g); const lfo = AU.ctx.createOscillator(), lg = AU.ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .012, t + .25); lfo.connect(lg); lg.connect(a.frequency); lfo.start(t); lfo.stop(e + .05); },
  tri: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .003, .1, .8, .04, d, .42 * v); osc('triangle', f, t, e, g); },
  bass: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .003, .16, .45, .05, d, .38 * v); osc('triangle', f, t, e, g); const g2 = gainTo(o, 0); envAt(g2, t, .002, .05, .1, .03, Math.min(d, .06), .12 * v); osc(.5, f * 2, t, t + .12, g2); },
  pluck: (f, t, d, v, o) => { const lp = filt('lowpass', 3200, 2, o); lp.frequency.setValueAtTime(3200, t); lp.frequency.setTargetAtTime(420, t, .06); const g = gainTo(lp, 0); const e = envAt(g, t, .002, .18, .25, .06, d, .3 * v); osc('sawtooth', f, t, e, g); },
  bell: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .002, .6, .15, .3, Math.max(d, .2), .22 * v); const c = osc('sine', f, t, e, g); const m = AU.ctx.createOscillator(), mg = AU.ctx.createGain(); m.frequency.value = f * 3.5; mg.gain.setValueAtTime(f * 2.2, t); mg.gain.setTargetAtTime(f * .2, t, .08); m.connect(mg); mg.connect(c.frequency); m.start(t); m.stop(e + .05); },
  vib: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .002, .5, .3, .35, Math.max(d, .25), .2 * v); osc('sine', f, t, e, g); const g2 = gainTo(o, 0); envAt(g2, t, .002, .12, .05, .1, .1, .05 * v); osc('sine', f * 4, t, t + .2, g2); },
  mari: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .002, .16, .0, .08, .16, .3 * v); osc('sine', f, t, e, g); const g2 = gainTo(o, 0); envAt(g2, t, .001, .03, 0, .02, .03, .12 * v); osc('sine', f * 3.9, t, t + .06, g2); },
  brass: (f, t, d, v, o) => { const lp = filt('lowpass', 600, 1.5, o); lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(2600, t + .06); lp.frequency.setTargetAtTime(1200, t + .08, .1); const g = gainTo(lp, 0); const e = envAt(g, t, .02, .2, .7, .08, d, .24 * v); osc('sawtooth', f, t, e, g); osc('sawtooth', f, t, e, g, 9); },
  organ: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .01, .1, .9, .06, d, .13 * v); osc('sine', f, t, e, g); osc('sine', f * 2, t, e, g); osc('triangle', f * 3, t, e, gainTo(g, .4)); },
  pad: (f, t, d, v, o) => { const lp = filt('lowpass', 1400, .7, o); const g = gainTo(lp, 0); const e = envAt(g, t, .12, .3, .8, .25, d, .09 * v); osc('sawtooth', f, t, e, g, -8); osc('sawtooth', f, t, e, g, 8); },
  sub: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .004, .2, .7, .05, d, .45 * v); osc('sine', f, t, e, g); },
  squeak: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .003, .06, .5, .04, d, .14 * v); const a = osc(.125, f, t, e, g); a.frequency.setValueAtTime(f * 1.5, t); a.frequency.exponentialRampToValueAtTime(f, t + .04); },
  kalimba: (f, t, d, v, o) => { const g = gainTo(o, 0); const e = envAt(g, t, .001, .35, 0, .2, .3, .26 * v); osc('triangle', f, t, e, g); const g2 = gainTo(o, 0); envAt(g2, t, .001, .04, 0, .02, .04, .1 * v); osc('sine', f * 5.4, t, t + .08, g2); },
  // drums (f ignored)
  k: (f, t, d, v, o) => { const g = gainTo(o, 0); g.gain.setValueAtTime(.9 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .28); const a = osc('sine', 150, t, t + .3, g); a.frequency.exponentialRampToValueAtTime(42, t + .16); },
  s: (f, t, d, v, o) => { const bp = filt('bandpass', 1900, .8, o); const g = gainTo(bp, 0); g.gain.setValueAtTime(.55 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .16); noiseSrc(t, t + .17, g); const g2 = gainTo(o, 0); g2.gain.setValueAtTime(.3 * v, t); g2.gain.exponentialRampToValueAtTime(.001, t + .08); const a = osc('triangle', 210, t, t + .1, g2); a.frequency.exponentialRampToValueAtTime(140, t + .06); },
  h: (f, t, d, v, o) => { const hp = filt('highpass', 7200, .7, o); const g = gainTo(hp, 0); g.gain.setValueAtTime(.2 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .045); noiseSrc(t, t + .05, g); },
  o: (f, t, d, v, o) => { const hp = filt('highpass', 6800, .7, o); const g = gainTo(hp, 0); g.gain.setValueAtTime(.16 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .22); noiseSrc(t, t + .23, g); },
  c: (f, t, d, v, o) => { const bp = filt('bandpass', 1300, 1.2, o); const g = gainTo(bp, 0); for (const q of [0, .012, .024]) { g.gain.setValueAtTime(.55 * v, t + q); g.gain.exponentialRampToValueAtTime(.05, t + q + .011); } g.gain.setValueAtTime(.5 * v, t + .036); g.gain.exponentialRampToValueAtTime(.001, t + .18); noiseSrc(t, t + .2, g); },
  z: (f, t, d, v, o) => { const hp = filt('highpass', 5000, .6, o); const g = gainTo(hp, 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12 * v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .09); noiseSrc(t, t + .1, g); },
  r: (f, t, d, v, o) => { const bp = filt('bandpass', 3000, 3, o); const g = gainTo(bp, 0); g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); noiseSrc(t, t + .04, g); const g2 = gainTo(o, 0); g2.gain.setValueAtTime(.18 * v, t); g2.gain.exponentialRampToValueAtTime(.001, t + .03); osc('square', 1700, t, t + .04, g2); },
  t: (f, t, d, v, o) => { const g = gainTo(o, 0); g.gain.setValueAtTime(.6 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); const a = osc('sine', 190, t, t + .26, g); a.frequency.exponentialRampToValueAtTime(95, t + .2); },
  T: (f, t, d, v, o) => { const g = gainTo(o, 0); g.gain.setValueAtTime(.6 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); const a = osc('sine', 120, t, t + .31, g); a.frequency.exponentialRampToValueAtTime(62, t + .25); },
  b: (f, t, d, v, o) => { const bp = filt('bandpass', 800, 2, o); const g = gainTo(bp, 0); g.gain.setValueAtTime(.3 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); osc('square', 540, t, t + .13, g); osc('square', 800, t, t + .13, g); },
  x: (f, t, d, v, o) => { const hp = filt('highpass', 4200, .5, o); const g = gainTo(hp, 0); g.gain.setValueAtTime(.3 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.1); noiseSrc(t, t + 1.2, g, .8); },
  w: (f, t, d, v, o) => { const g = gainTo(o, 0); g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); const a = osc('triangle', 900, t, t + .1, g); a.frequency.exponentialRampToValueAtTime(300, t + .07); }, // woodblock-ish
};
const DRUMS = 'ksh ocrztTbxw';

// ---------------------------------------------------------------- sequencer --
// Track tokens (one per step): note "C5", chord "C4+E4+G4", drum "k" / "k+h",
// "." rest, "-" hold. Suffix "!" accent, "_" soft.
const _parsed = new Map();
function parseTrack(str) {
  let r = _parsed.get(str); if (r) return r;
  const toks = str.trim().split(/\s+/), ev = [];
  let cur = null;
  toks.forEach((tk, i) => {
    if (tk === '-') { if (cur) cur.len++; return; }
    cur = null;
    if (tk === '.') return;
    let vel = 1; if (tk.endsWith('!')) { vel = 1.3; tk = tk.slice(0, -1); } else if (tk.endsWith('_')) { vel = .55; tk = tk.slice(0, -1); }
    const parts = tk.split('+'), notes = [], drums = [];
    for (const p of parts) { if (p.length === 1 && DRUMS.includes(p)) drums.push(p); else { const m = noteMidi(p); if (m != null) notes.push(m); } }
    cur = { step: i, len: 1, notes, drums, vel }; ev.push(cur);
  });
  r = { ev, steps: toks.length }; _parsed.set(str, r); return r;
}
// play a song: { bpm, spb (steps per beat, default 4), tracks: [{ i, n, v, oct }] }
function playSong(song, o = {}) {
  if (!AU.ctx || !song) return null;
  const bpm = o.bpm || song.bpm || 120, spb = song.spb || 4, stepDur = 60 / bpm / spb;
  const tracks = song.tracks.map(tr => { const P = parseTrack(tr.n), byStep = {}; for (const e of P.ev) (byStep[e.step] = byStep[e.step] || []).push(e); return Object.assign({}, tr, P, { byStep }); });
  const len = Math.max(...tracks.map(t => t.steps));
  const pl = { song, t0: o.at || (auT() + .03), stepDur, len, tracks, loop: o.loop != null ? o.loop : !!song.loop, next: 0, dest: o.dest || AU.mus, stopped: false, vol: o.vol != null ? o.vol : 1, bus: null, xpose: o.xpose || 0 };
  pl.bus = gainTo(pl.dest, pl.vol);
  AU.players.push(pl); schedulePlayer(pl); return pl;
}
function stopSong(pl, fade = .06) { if (!pl || pl.stopped) return; pl.stopped = true; if (AU.ctx) { pl.bus.gain.setTargetAtTime(0, auT(), fade / 3); setTimeout(() => { try { pl.bus.disconnect(); } catch (e) { } }, (fade + .4) * 1000); } }
function stopAllMusic(fade) { for (const p of AU.players) stopSong(p, fade); AU.players = []; }
function schedulePlayer(pl) {
  const ahead = auT() + .16;
  for (; ;) {
    const t = pl.t0 + pl.next * pl.stepDur;
    if (t > ahead) break;
    if (!pl.loop && pl.next >= pl.len) { pl.done = true; break; }
    if (t >= auT() - .02) for (const tr of pl.tracks) {
      const list = tr.byStep[pl.next % tr.steps]; if (!list) continue;
      const v = tr.v != null ? tr.v : .7;
      for (const e of list) {
        const d = e.len * pl.stepDur * (tr.gate || .9);
        for (const m of e.notes) (INST[tr.i] || INST.p25)(mtof(m + (tr.oct || 0) * 12 + pl.xpose), t, d, v * e.vel, pl.bus);
        for (const dr of e.drums) INST[dr](0, t, d, v * e.vel, pl.bus);
      }
    }
    pl.next++;
  }
}
let _auLast = 0;
function auTick() {
  if (!AU.ctx) return;
  for (let i = AU.players.length - 1; i >= 0; i--) { const p = AU.players[i]; if (p.stopped || p.done) { AU.players.splice(i, 1); continue; } schedulePlayer(p); }
  _auLast = auT();
}
// background tabs throttle rAF; keep the scheduler alive from a timer too
setInterval(() => { if (AU.ctx && AU.players.length) auTick(); }, 50);

// ---------------------------------------------------------------- SFX -------
function sfx(name, o = {}) {
  if (!AU.ctx || !AU.on) return;
  const t = auT() + (o.delay || 0), d = AU.fx, p = o.pitch || 1, v = o.vol != null ? o.vol : 1;
  const f = SFX[name]; if (f) f(t, d, p, v, o);
}
const SFX = {
  touch: (t, d, p, v) => INST.w(0, t, 0, .25 * v, d),
  tap: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.3 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); const a = osc('sine', 900 * p, t, t + .1, g); a.frequency.exponentialRampToValueAtTime(420 * p, t + .08); },
  pop: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .08); const a = osc('sine', 600 * p, t, t + .1, g); a.frequency.exponentialRampToValueAtTime(1500 * p, t + .05); INST.h(0, t, 0, .5 * v, d); },
  squish: (t, d, p, v) => { const lp = filt('lowpass', 900, 3, d); const g = gainTo(lp, 0); g.gain.setValueAtTime(.5 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .14); noiseSrc(t, t + .15, g, .5); lp.frequency.setValueAtTime(1600 * p, t); lp.frequency.exponentialRampToValueAtTime(200, t + .12); const g2 = gainTo(d, 0); g2.gain.setValueAtTime(.25 * v, t); g2.gain.exponentialRampToValueAtTime(.001, t + .1); const a = osc('square', 180 * p, t, t + .1, g2); a.frequency.exponentialRampToValueAtTime(60, t + .1); },
  snip: (t, d, p, v) => { for (const q of [0, .05]) { const hp = filt('bandpass', 5200 * p, 4, d); const g = gainTo(hp, 0); g.gain.setValueAtTime(.5 * v, t + q); g.gain.exponentialRampToValueAtTime(.001, t + q + .03); noiseSrc(t + q, t + q + .04, g); } INST.w(0, t + .05, 0, .3 * v, d); },
  splash: (t, d, p, v) => { const bp = filt('bandpass', 1400 * p, .6, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.5 * v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .45); noiseSrc(t, t + .5, g, .7); for (let i = 0; i < 5; i++) SFX.pop(t + .03 + i * .04 + Math.random() * .03, d, 1.4 + Math.random() * .8, .25 * v); },
  swoosh: (t, d, p, v) => { const bp = filt('bandpass', 600, 1.2, d); bp.frequency.setValueAtTime(400 * p, t); bp.frequency.exponentialRampToValueAtTime(3000 * p, t + .18); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.45 * v, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + .22); noiseSrc(t, t + .25, g); },
  whoosh: (t, d, p, v) => { const bp = filt('bandpass', 300, 1, d); bp.frequency.setValueAtTime(2400 * p, t); bp.frequency.exponentialRampToValueAtTime(260, t + .32); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.5 * v, t + .1); g.gain.exponentialRampToValueAtTime(.001, t + .36); noiseSrc(t, t + .4, g); },
  zoom: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.18 * v, t + .12); g.gain.exponentialRampToValueAtTime(.001, t + .2); const a = osc(.25, 200 * p, t, t + .22, g); a.frequency.exponentialRampToValueAtTime(1600 * p, t + .2); SFX.swoosh(t, d, p * 1.2, v * .6); },
  boing: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.3 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); const a = osc('triangle', 180 * p, t, t + .36, g); a.frequency.exponentialRampToValueAtTime(720 * p, t + .12); const l = AU.ctx.createOscillator(), lg = AU.ctx.createGain(); l.frequency.value = 22; lg.gain.value = 60 * p; l.connect(lg); lg.connect(a.frequency); l.start(t); l.stop(t + .36); },
  ding: (t, d, p, v) => { INST.bell(1568 * p, t, .3, 1.2 * v, d); INST.bell(2093 * p, t + .06, .4, .9 * v, d); },
  coin: (t, d, p, v) => { INST.p25(988 * p, t, .06, 1.2 * v, d); INST.p25(1319 * p, t + .06, .2, 1.2 * v, d); },
  good: (t, d, p, v) => { const n = [0, 4, 7, 12]; n.forEach((s, i) => INST.p25(784 * p * Math.pow(2, s / 12), t + i * .045, .08, 1.1 * v, d)); INST.bell(3136 * p, t + .18, .3, .6 * v, d); },
  bad: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.22 * v, t); g.gain.setTargetAtTime(0, t + .25, .05); const a = osc('sawtooth', 190 * p, t, t + .4, g); osc('sawtooth', 201 * p, t, t + .4, g); a.frequency.linearRampToValueAtTime(150 * p, t + .3); },
  buzz: (t, d, p, v) => { const g = gainTo(filt('lowpass', 1400, 1, d), 0); g.gain.setValueAtTime(.3 * v, t); g.gain.setTargetAtTime(0, t + .18, .03); osc('square', 110 * p, t, t + .3, g); osc('square', 117 * p, t, t + .3, g); },
  bark: (t, d, p, v, o) => { const n = o.n || 1; for (let i = 0; i < n; i++) barkOne(t + i * .16, d, p * (1 + (i ? .06 : 0)), v); },
  yip: (t, d, p, v) => barkOne(t, d, p * 1.6, v * .8, .07),
  whine: (t, d, p, v) => { const bp = filt('bandpass', 1300 * p, 3, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.35 * v, t + .06); g.gain.setTargetAtTime(0, t + .45, .06); const a = osc('sawtooth', 780 * p, t, t + .7, g); a.frequency.linearRampToValueAtTime(980 * p, t + .15); a.frequency.linearRampToValueAtTime(520 * p, t + .55); },
  shutter: (t, d, p, v) => { INST.r(0, t, 0, 1.2 * v, d); const hp = filt('highpass', 2500, .7, d); const g = gainTo(hp, 0); g.gain.setValueAtTime(.4 * v, t + .03); g.gain.exponentialRampToValueAtTime(.001, t + .12); noiseSrc(t + .03, t + .13, g); INST.w(0, t + .1, 0, .5 * v, d); },
  stamp: (t, d, p, v) => { INST.k(0, t, 0, 1.1 * v, d); const bp = filt('bandpass', 900 * p, .8, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); noiseSrc(t, t + .13, g); },
  tick: (t, d, p, v) => INST.w(0, t, 0, .5 * v * p, d),
  fuse: (t, d, p, v) => { const hp = filt('bandpass', 5500, 2, d); const g = gainTo(hp, 0); g.gain.setValueAtTime(.12 * v, t); g.gain.linearRampToValueAtTime(.001, t + .12); noiseSrc(t, t + .13, g, 1.5); },
  boom: (t, d, p, v) => { const lp = filt('lowpass', 1200, .7, d); lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(120, t + .6); const g = gainTo(lp, 0); g.gain.setValueAtTime(.8 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .8); noiseSrc(t, t + .85, g, .6); INST.k(0, t, 0, 1.2 * v, d); INST.T(0, t + .02, 0, .8 * v, d); },
  fizz: (t, d, p, v) => { for (let i = 0; i < 9; i++) SFX.pop(t + i * .035 + Math.random() * .02, d, 1.6 + Math.random() * 1.4, .18 * v); },
  rub: (t, d, p, v) => { const bp = filt('bandpass', 2200 * p, 5, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.2 * v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .09); noiseSrc(t, t + .1, g); },
  squeaky: (t, d, p, v) => INST.squeak(1400 * p, t, .06, v, d),
  chalk: (t, d, p, v) => { const bp = filt('bandpass', 3800 * p, 8, d); const g = gainTo(bp, 0); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.18 * v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + .07); noiseSrc(t, t + .08, g, 1.3); },
  ratchet: (t, d, p, v) => { INST.r(0, t, 0, .8 * v, d); INST.w(0, t, 0, .2 * v * p, d); },
  select: (t, d, p, v) => { INST.p25(1047 * p, t, .05, v, d); INST.p25(1568 * p, t + .05, .1, v, d); },
  back: (t, d, p, v) => { INST.p25(784 * p, t, .05, v, d); INST.p25(523 * p, t + .05, .1, v, d); },
  cursor: (t, d, p, v) => INST.p12(1319 * p, t, .03, .7 * v, d),
  slam: (t, d, p, v) => { INST.k(0, t, 0, 1.3 * v, d); INST.s(0, t, 0, .8 * v, d); INST.x(0, t, 0, .35 * v, d); },
  sparkle: (t, d, p, v) => { [0, 4, 7, 11, 14].forEach((s, i) => INST.bell(2093 * p * Math.pow(2, s / 12), t + i * .03, .1, .5 * v, d)); },
  heart: (t, d, p, v) => { INST.bell(1319 * p, t, .1, .8 * v, d); INST.bell(1760 * p, t + .07, .2, .8 * v, d); },
  drip: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.25 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .09); const a = osc('sine', 700 * p, t, t + .1, g); a.frequency.exponentialRampToValueAtTime(1800 * p, t + .06); },
  gulp: (t, d, p, v) => { const g = gainTo(d, 0); g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); const a = osc('sine', 300 * p, t, t + .13, g); a.frequency.exponentialRampToValueAtTime(120 * p, t + .1); },
  blip: (t, d, p, v) => INST.p50(880 * p, t, .02, .45 * v, d),
};
function barkOne(t, d, p, v, len = .12) {
  // two formants over a falling buzzy source + a breathy onset: a small dog's "¡guau!"
  const src = AU.ctx.createOscillator(); src.type = 'sawtooth';
  src.frequency.setValueAtTime(420 * p, t); src.frequency.linearRampToValueAtTime(610 * p, t + len * .25); src.frequency.exponentialRampToValueAtTime(300 * p, t + len);
  const f1 = filt('bandpass', 950 * p, 3, d), f2 = filt('bandpass', 2300 * p, 4, d);
  const g = AU.ctx.createGain(); g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.9 * v, t + .012); g.gain.exponentialRampToValueAtTime(.001, t + len);
  src.connect(g); g.connect(f1); g.connect(f2); src.start(t); src.stop(t + len + .05);
  const nb = filt('bandpass', 1800 * p, 1.5, d), ng = gainTo(nb, 0); ng.gain.setValueAtTime(.35 * v, t); ng.gain.exponentialRampToValueAtTime(.001, t + .04); noiseSrc(t, t + .05, ng);
}
// dialogue voices: a short pitched blip per syllable
const VOICES = {
  anahi: { base: 72, scale: [0, 2, 4, 7, 9], inst: 'p25', len: .045 },
  keiko: { base: 81, scale: [0, 3, 5, 7, 10], inst: 'p12', len: .035 },
  bule: { base: 81, scale: [0, 3, 5, 7, 10], inst: 'p12', len: .035 },
  guru: { base: 55, scale: [0, 2, 3, 7], inst: 'tri', len: .06 },
  narr: { base: 67, scale: [0, 2, 4, 7, 9, 12], inst: 'p50', len: .03 },
};
function voiceBlip(who) {
  if (!AU.ctx || !AU.on) return;
  const vo = VOICES[who] || VOICES.narr, m = vo.base + pick(vo.scale);
  INST[vo.inst](mtof(m), auT(), vo.len, .55, AU.fx);
}
// light haptics where supported (Android); a no-op elsewhere
function buzz(ms) { if (SAVE.opts.haptic === 0) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }
