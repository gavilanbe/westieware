// ============================================================================
//  cutscene — comic-strip storytelling across both screens.
//  defCut(id, { song, shots: [ { dur, tall(g,t,st) | top(g,t,st) + bot(g,t,st),
//     lines: [[who, text], …], box: 'bot'|'top'|'none', sfx: [[t, name, o]],
//     play: microgameId, enter(st), song } ] })
//  A shot with lines waits for taps; one without lines runs for `dur` seconds.
// ============================================================================
'use strict';

const CUTS = {};
function defCut(id, def) { CUTS[id] = def; }
let _cutDone = null;
function playCut(id, done) { _cutDone = done; go(CUT, { id }); }

const WHO = {
  anahi: { name: 'Anahí', col: '#2a7356', voice: 'anahi' },
  keiko: { name: 'Keiko', col: '#8587ab', voice: 'keiko' },
  bule: { name: 'Keiko', col: '#8587ab', voice: 'keiko' }, // old key, kept as an alias
  guru: { name: 'Gurú', col: '#6b3fb0', voice: 'guru' },
  narr: { name: '', col: '#1d1424', voice: 'narr' },
};

const CUT = {
  enter(arg) {
    const def = CUTS[arg.id];
    this.def = def; this.id = arg.id; this.i = -1; this.st = {}; this.fx = new FX(); this.topFx = new FX(); this._finished = false;
    stopAllMusic(.1);
    if (def.song) this.song = playSong(def.song, { loop: true });
    this.next();
  },
  exit() { stopAllMusic(.15); },
  next() {
    this.i++;
    const sh = this.def.shots[this.i];
    if (!sh) { this.i = this.def.shots.length; this.finish(); return; }
    this.sh = sh; this.t = 0; this.li = 0; this.chars = 0; this.lineT = 0; this.fired = {};
    if (sh.song) { stopAllMusic(.1); playSong(sh.song, { loop: sh.songLoop !== false }); }
    if (sh.enter) sh.enter(this.st, this);
    if (sh.play) { this.mg = mgNew(sh.play, 1, sh.bpm || 116); this.mgT = 0; this.mgTry = 0; this.mgDone = false; sfx('stamp'); }
    else this.mg = null;
  },
  finish() {
    if (this._finished) return; this._finished = true;
    const d = _cutDone; _cutDone = null;
    stopAllMusic(.2);
    if (d) transit('paw', null, null, .7), after(.35, () => { this._finished = false; d(); });
  },
  update(dt) {
    const sh = this.sh; if (!sh || this._finished) return;
    this.t += dt; this.fx.update(dt); this.topFx.update(dt);
    // scheduled sound effects
    if (sh.sfx) sh.sfx.forEach(([at, name, o], k) => { if (!this.fired[k] && this.t >= at) { this.fired[k] = 1; sfx(name, o || {}); } });
    if (sh.update) sh.update(this.st, this.t, dt, this);
    // skip everything (top-right corner of the top screen)
    if (IN.topTap && IN.tx > SW - 60 && IN.ty < 20 && this.t > .2) { sfx('back'); this.i = this.def.shots.length; this.finish(); return; }
    if (this.mg) { this.updateMg(dt); return; }
    const lines = sh.lines || [];
    if (lines.length && this.li < lines.length) {
      const line = lines[this.li][1];
      const startAt = this.li === 0 ? (sh.wait || 0) : 0;
      if (this.t < startAt) return;
      this.lineT += dt;
      const before = this.chars;
      this.chars = Math.min(line.length, this.chars + dt * 42);
      if (fl(this.chars / 2) !== fl(before / 2) && this.chars < line.length && line[fl(this.chars)] !== ' ') voiceBlip((WHO[lines[this.li][0]] || WHO.narr).voice);
      const autoNext = QS.has('auto') && this.chars >= line.length && this.lineT > .9;
      if ((IN.anyTap && this.lineT > .12) || autoNext) {
        if (this.chars < line.length) this.chars = line.length;
        else { this.li++; this.chars = 0; this.lineT = 0; sfx('cursor', { vol: .6 }); if (this.li >= lines.length) { if (!sh.dur) this.next(); } }
      }
      return;
    }
    if (sh.dur && this.t >= sh.dur) this.next();
    else if (!sh.dur && !lines.length) this.next();
    else if (sh.dur && sh.tapSkip !== false && IN.anyTap && this.t > .3 && lines.length === 0) this.next();
  },
  updateMg(dt) {
    const g = this.mg; this.mgT += dt;
    const beats = g.def.beats, b = this.mgT / g.spb;
    if (!this.mgDone) {
      mgUpdate(g, dt);
      if (g.state === 'won') { this.mgDone = true; this.mgEnd = this.mgT + 1.2; }
      else if (b >= beats || g.state === 'lost') { // try again, gently
        this.mgTry++; this.mg = mgNew(this.sh.play, 1, this.sh.bpm || 116); this.mgT = 0; sfx('back'); this.retry = 1.2;
      }
    } else { mgUpdate(g, dt); if (this.mgT >= this.mgEnd) { this.mg = null; this.t = 0; this.next(); } }
    if (this.retry) this.retry = Math.max(0, this.retry - dt);
  },
  drawTop(g) {
    const sh = this.sh; if (!sh) return;
    if (sh.tall) { this._tall(); g.drawImage(TALLC, 0, 0, SW, SH, 0, 0, SW, SH); }
    else if (sh.top) { g.save(); sh.top(g, this.t, this.st, this); g.restore(); }
    this.topFx.draw(g);
    if ((sh.box === 'top') && sh.lines) this.drawBox(g);
    this.drawSkip(g);
  },
  drawBot(g) {
    const sh = this.sh; if (!sh) return;
    if (this.mg) { g.drawImage(mgDraw(this.mg), 0, 0); this.drawMgCmd(g); }
    else if (sh.tall) g.drawImage(TALLC, 0, SH + HINGE, SW, SH, 0, 0, SW, SH);
    else if (sh.bot) { g.save(); sh.bot(g, this.t, this.st, this); g.restore(); }
    this.fx.draw(g);
    if (sh.box !== 'top' && sh.box !== 'none' && sh.lines && !this.mg) this.drawBox(g);
  },
  _tall() { if (this._tallFrame === FRAME) return; this._tallFrame = FRAME; TL.save(); TL.clearRect(0, 0, SW, TALL_H); this.sh.tall(TL, this.t, this.st, this); TL.restore(); },
  drawSkip(g) { const a = this.t < 1.5 ? 1 : .55; g.globalAlpha = a; panel(g, SW - 56, 4, 52, 13, '#ffffff', { r: 3 }); txt(g, 'SALTAR ▸', SW - 30, 7, INK, { align: 'c' }); g.globalAlpha = 1; },
  drawBox(g) {
    const sh = this.sh, lines = sh.lines || [];
    if (this.li >= lines.length) return;
    if (this.t < (this.li === 0 ? (sh.wait || 0) : 0)) return;
    const [who, text] = lines[this.li], W0 = WHO[who] || WHO.narr;
    const y0 = sh.boxY != null ? sh.boxY : SH - 50, pop = E.outBack(clamp(this.lineT / .18, 0, 1));
    const bx = 6, bw = SW - 12, bh = 44;
    g.save();
    if (pop < 1) { g.translate(SW / 2, y0 + bh / 2); g.scale(1, pop); g.translate(-SW / 2, -(y0 + bh / 2)); }
    panel(g, bx, y0, bw, bh, '#fffaf0', { r: 6, line: INK, lo: '#e8dcc0' });
    if (W0.name) { const nw = txtW(W0.name) + 12; panel(g, bx + 8, y0 - 8, nw, 13, W0.col, { r: 4 }); txt(g, W0.name, bx + 14, y0 - 5, '#ffffff'); }
    const shown = text.slice(0, fl(this.chars));
    const ls = wrapText(text, bw - 16); let rem = shown.length;
    ls.forEach((l, i) => { const part = l.slice(0, Math.max(0, rem)); rem -= l.length + 1; txt(g, part, bx + 8, y0 + 8 + i * 11, INK); });
    if (this.chars >= text.length && fl(NOW * 3) % 2 === 0) txt(g, '▸', bx + bw - 10, y0 + bh - 11, W0.col === INK ? INK : W0.col);
    g.restore();
  },
  drawMgCmd(g) {
    const t = this.mgT, gm = this.mg; const bd = gm.spb;
    if (t < .8 * bd) mord(g, gm.def.cmd, SW / 2, 70, { u: 2.6, r: 2.7, rim: 2, sy: 3 }, { anim: (i) => { const lt = t - i * .035; return { s: lt <= 0 ? 0 : spring(lt, 2.6, 8), a: t > .55 * bd ? 1 - (t - .55 * bd) / (.25 * bd) : 1 }; } });
    if (this.retry > 0) { g.globalAlpha = Math.min(1, this.retry * 2); panel(g, SW / 2 - 50, 6, 100, 16, '#ffffff', { r: 4 }); txt(g, '¡Otra vez!', SW / 2, 10, INK, { align: 'c' }); g.globalAlpha = 1; }
    // bath bomb here too (it's the same world)
    const rem = gm.def.beats - t / gm.spb;
    if (!this.mgDone && rem <= 4) { const L = rem / 4 * 222; for (let x = 0; x < L; x++) px(g, 23 + x, 177, x % 3 ? '#dcc08a' : '#8a6a44'); drawStar(g, 23 + L, 177, 3.5, '#fff27a', NOW * 8); drawBathBomb(g, 14, 176, 1, Math.ceil(rem), NOW); }
  },
};

// ---------------------------------------------------------------- helpers ----
// comic panel border
function comicFrame(g, x, y, w, h, col = INK) { rect(g, x, y, w, 2, col); rect(g, x, y + h - 2, w, 2, col); rect(g, x, y, 2, h, col); rect(g, x + w - 2, y, 2, h, col); }
// radial speed lines (emphasis)
function speedLines(g, cx0, cy0, t, col = '#ffffff', n = 28, r0 = 40) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + hash2(i, 3) * .2, len = 30 + hash2(i, fl(t * 12)) * 60, rr = r0 + hash2(i, fl(t * 12) + 1) * 20; for (let q = 0; q < len; q += 1) { const x = cx0 + Math.cos(a) * (rr + q), y = cy0 + Math.sin(a) * (rr + q); if (q % 2 === 0) g.fillRect(rd(x), rd(y), 1, 1); } }
}
// caption band (narration) on top of a shot
function caption(g, s, y = 21, bg = INK, fg = '#fff8e6') { const w = txtW(s) + 14; panel(g, SW / 2 - w / 2, y, w, 15, bg, { r: 3, line: bg }); txt(g, s, SW / 2, y + 4, fg, { align: 'c' }); }
// a big shout bubble with jagged edge
function shout(g, s, x, y, t, col = '#ffffff') {
  const k = spring(t, 2.8, 7); if (k <= 0) return;
  const w = txtW(s) * 1 + 18, h = 20;
  g.save(); g.translate(rd(x), rd(y)); g.scale(k, k);
  const pts = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, r = i % 2 ? 1 : 1.2; pts.push([Math.cos(a) * w * .62 * r, Math.sin(a) * h * .8 * r]); }
  polyPx(g, pts.map(p => [p[0] + 1, p[1] + 2]), INK); polyPx(g, pts, col);
  txt(g, s, 0, -4, INK, { align: 'c', bold: true });
  g.restore();
}
