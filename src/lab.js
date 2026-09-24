// ============================================================================
//  lab — art bench (?escena=lab): fonts, models and palettes side by side.
// ============================================================================
'use strict';
const LAB = {
  page: +(QS.get('p') || 0),
  update() { if (IN.tap || IN.topTap) this.page++; },
  // p=6: every menu walker, frame by frame (top: first five, bottom: the rest + Keiko)
  drawChibis(g, ids) {
    rect(g, 0, 0, SW, SH, '#57b8ee');
    ids.forEach((id, r) => {
      const y = 44 + r * 47; tiny(g, id, 4, y - 40, INK);
      ['walk0', 'walk1', 'idle', 'happy', 'held'].forEach((f, i) => {
        const img = id === 'keiko' ? (typeof keikoChibi === 'function' ? keikoChibi(f, 0) : keikoSide(.34, i < 2 ? 'wag' : 'stand', f === 'happy' ? 'happy' : 'normal')) : menuChibi(id, f, 0);
        shadowOval(g, 60 + i * 44, y + 1, 7, 2, .4); drawS(g, img, 60 + i * 44, y, { ax: .5, ay: 1 });
      });
    });
  },
  drawTop(g) {
    if (this.page === 6 || this.page === 7) { this.drawChibis(g, menuStageIds().concat(['keiko']).slice((this.page - 6) * 8, (this.page - 6) * 8 + 4)); return; }
    rect(g, 0, 0, SW, SH, '#2a2440');
    txt(g, 'PELUSA: ¡Hola! ¿Qué tal, Anahí?', 6, 6, '#ffffff');
    txt(g, 'áéíóú ñÑ ÁÉÍÓÚÜ «0123456789» ♥★♪', 6, 20, C.yellow);
    txt(g, 'Frota, corta, dibuja, arrastra y gira.', 6, 34, C.mint, { out: INK });
    mord(g, '¡TOCA!', SW / 2, 58, {});
    mord(g, 'ÑÁÉ?¿ 1234', SW / 2, 100, { u: 1.4, r: 1.5, rim: 1, sy: 1, fill: ['#ffffff', '#b3d9ff', '#63a0ef'] });
    mord(g, 'WESTIE WARE', SW / 2, 136, { u: 1.8, r: 1.9, fill: ['#fff8e6', '#f2e2b8', '#dcc08a'], line: RAMP.green[0], shadow: RAMP.green[1] });
    mord(g, '0567 89%', SW / 2, 168, { u: 1.1, r: 1.1, rim: 1, sy: 1, fill: ['#ffffff', '#ffd1e4', '#ff93bf'] });
  },
  drawBot(g) {
    if (this.page === 6 || this.page === 7) { this.drawChibis(g, menuStageIds().concat(['keiko']).slice((this.page - 6) * 8 + 4, (this.page - 6) * 8 + 8)); return; }
    if (this.page === 2) { g.drawImage(salonBackdrop(), 0, 0); drawS(g, westieSide(1, 'stand', 'normal'), 60, 150, { ax: .5, ay: 1 }); drawS(g, westieSide(.55, 'wag', 'happy'), 160, 150, { ax: .5, ay: 1 }); drawS(g, westieSide(.55, 'wet', 'sad'), 215, 150, { ax: .5, ay: 1 }); drawWestieSit(g, 120, 190, 'happy'); drawS(g, lifeWestie(), 150, 20); drawS(g, lifeWestie(true), 175, 20); drawS(g, wbSign(), 128, 60); return; }
    if (this.page === 3) { rect(g, 0, 0, SW, SH, '#8fd0ff'); g.drawImage(anahiSprite('thumbs', 1), 8, -12); g.drawImage(anahiSprite('headhand', 1), 110, -12); return; }
    if (this.page === 4) { rect(g, 0, 0, SW, SH, '#ffd1e4'); ['idle', 'thumbs', 'sad', 'wow', 'euro', 'work', 'cheer', 'talk'].forEach((p, i) => drawAnahiFull(g, 18 + i * 31, 186, p, 0, { k: .45 })); return; }
    if (this.page % 2 === 1) { rect(g, 0, 0, SW, SH, '#dce7ea'); ['idle', 'thumbs', 'sad', 'wow', 'euro'].forEach((p, i) => drawAnahiFull(g, 26 + i * 51, 188, p, 0, { k: .6 })); return; }
    rect(g, 0, 0, SW, SH, '#8f7fb0');
    const exs = ['normal', 'happy', 'wow', 'sad', 'wink', 'grr'];
    exs.forEach((e, i) => drawS(g, buleHead(e), 36 + (i % 3) * 92, 40 + fl(i / 3) * 70));
    let y = 150; for (const k of ['fur', 'green', 'gold', 'apricot', 'pink', 'skin', 'hair', 'mustard']) { RAMP[k].forEach((c, i) => rect(g, 4 + i * 5 + (y > 170 ? 128 : 0), (y > 170 ? y - 32 : y), 5, 7, c)); y += 8; }
  },
};
// single microgame bench: ?escena=mg&id=pulgas&lv=2&ff=1.5&bot=1
const MGT = {
  enter() { this.g = mgNew(QS.get('id') || 'pulgas', +(QS.get('lv') || 1), +(QS.get('bpm') || 120)); },
  update(dt) { mgUpdate(this.g, dt); if (this.g.b > this.g.def.beats + 1 && !this.g.def.boss && QS.has('loop')) this.enter(); },
  drawTop(g) { rect(g, 0, 0, SW, SH, RAMP.green[2]); if (this.g.def.top) this.g.def.top(this.g, g); txt(g, this.g.id + ' L' + this.g.level + ' ' + this.g.state + ' b' + this.g.b.toFixed(1), 6, 180, '#fff', { out: INK }); },
  drawBot(g) { g.drawImage(mgDraw(this.g), 0, 0); },
};
// ?test=mg — every microgame × level × runs, played by its bot, synchronously.
// Writes a JSON report into <html data-result> (read with --dump-dom).
function runMgTests() {
  const only = QS.get('only'), runs = +(QS.get('runs') || 6), out = {};
  const ids = MG_ORDER.filter(id => MG[id].stage !== 'test' && (!only || only.split(',').includes(id) || only.split(',').includes(MG[id].stage)));
  BOTIN.on = true;
  for (const id of ids) {
    const def = MG[id]; out[id] = {};
    for (let lv = 1; lv <= 3; lv++) {
      let wins = 0, errs = 0, avgT = 0;
      for (let r = 0; r < runs; r++) {
        RNG = mulberry32(1000 + r * 7 + lv);
        try {
          const bpm = 120 * (1 + .13 * (r % 3));
          const g = mgNew(id, lv, bpm); IN.down = false; BOTIN.down = false;
          const maxT = def.boss ? 60 : def.beats * g.spb;
          while (g.t < maxT && !(def.boss && g.state !== 'play')) {
            const o = def.bot ? def.bot(g) || {} : {};
            BOTIN.x = o.x != null ? o.x : BOTIN.x; BOTIN.y = o.y != null ? o.y : BOTIN.y; BOTIN.down = !!o.down;
            pollInput(); botInput(); if (HITSTOP > 0) HITSTOP = 0;
            mgUpdate(g, STEP);
            if (fl(g.t * 60) % 30 === 0) mgDraw(g);
          }
          if (g.state === 'play') { if (def.survive) g.state = 'won'; else g.state = 'lost'; }
          if (g.state === 'won') wins++;
          avgT += g.decidedAt >= 0 ? g.decidedAt : g.t;
        } catch (e) { errs++; out[id].err = String(e && e.message || e); }
      }
      out[id]['L' + lv] = wins + '/' + runs + (errs ? ' E' + errs : '') + ' t' + (avgT / runs).toFixed(1);
    }
  }
  document.documentElement.setAttribute('data-result', JSON.stringify(out));
}

// ?test=perf[&only=rizos] — what one frame of each microgame costs (update + draw), bot playing
function runPerfTest() {
  const only = QS.get('only'), out = {};
  const ids = MG_ORDER.filter(id => MG[id].stage !== 'test' && (!only || only.split(',').includes(id) || only.split(',').includes(MG[id].stage)));
  BOTIN.on = true;
  for (const id of ids) {
    const def = MG[id]; RNG = mulberry32(77);
    const g = mgNew(id, 2, 140); IN.down = false; BOTIN.down = false;
    const times = [], maxT = def.boss ? 20 : def.beats * g.spb; let first = 0, n = 0;
    while (g.t < maxT && n < 600 && !(def.boss && g.state !== 'play')) {
      const o = def.bot ? def.bot(g) || {} : {};
      BOTIN.x = o.x != null ? o.x : BOTIN.x; BOTIN.y = o.y != null ? o.y : BOTIN.y; BOTIN.down = !!o.down;
      pollInput(); botInput(); if (HITSTOP > 0) HITSTOP = 0;
      const t0 = performance.now(); mgUpdate(g, STEP); mgDraw(g); const ms = performance.now() - t0;
      if (n++ === 0) first = ms; else times.push(ms);
    }
    times.sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b, 0) / Math.max(1, times.length);
    out[id] = { first: +first.toFixed(0), avg: +avg.toFixed(2), p95: +(times[fl(times.length * .95)] || 0).toFixed(1), max: +(times[times.length - 1] || 0).toFixed(1), n };
  }
  document.documentElement.setAttribute('data-result', JSON.stringify(out));
}

// ?test=stage&id=anahi&secs=240 — a whole stage played by the bot, synchronously
function runStageTest() {
  BOTIN.on = true; RNG = mulberry32(+(QS.get('seed') || 5));
  const id = QS.get('id') || 'anahi', secs = +(QS.get('secs') || 240), rep = { id, snaps: [] };
  if (QS.has('replay')) SAVE.cleared[id] = 1; // play it as an already-cleared stage (endless, harder, faster)
  go(STG, { id, story: false });
  let last = '';
  for (let i = 0; i < secs * 60; i++) {
    try { tick(STEP); } catch (e) { rep.err = String(e && e.stack || e); break; }
    const S = STG.S; if (!S) continue;
    const ph = S.phase + (S.special ? ':' + S.special : '');
    if (ph !== last) { rep.snaps.push(fl(i / 60) + 's ' + ph + ' n' + S.count + ' L' + S.lives); last = ph; }
    if (S.phase === 'results') break;
  }
  const S = STG.S; rep.log = S.log; rep.count = S.count; rep.lives = S.lives; rep.phase = S.phase; rep.cleared = !!SAVE.cleared[id];
  document.documentElement.setAttribute('data-result', JSON.stringify(rep));
}
// ?escena=icon — the app icon, drawn in a 192x192 square in the middle of the top screen
const ICON = {
  drawTop(g) {
    rect(g, 0, 0, SW, SH, '#000');
    const x0 = 32, s = 192, cx0 = x0 + s / 2, cy0 = s / 2, mask = QS.has('mask');
    // green tile with a gilt sunburst
    rect(g, x0, 0, s, s, RAMP.green[1]);
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; polyPx(g, [[cx0, cy0], [cx0 + Math.cos(a - .08) * 150, cy0 + Math.sin(a - .08) * 150], [cx0 + Math.cos(a + .08) * 150, cy0 + Math.sin(a + .08) * 150]], i % 2 ? RAMP.green[2] : RAMP.green[1]); }
    g.save(); g.beginPath(); g.rect(x0, 0, s, s); g.clip();
    const R = mask ? 58 : 74;
    disc(g, cx0, cy0 + 4, R + 4, INK); disc(g, cx0, cy0 + 4, R + 2, RAMP.gold[3]); disc(g, cx0, cy0 + 4, R - 3, RAMP.green[2]); disc(g, cx0 - 4, cy0, R - 14, RAMP.green[3]);
    const head = keikoHead('happy'); g.save(); g.translate(cx0, cy0 + (mask ? 10 : -2)); const k = mask ? 1.6 : 1.85; g.scale(k, k); g.drawImage(head, -32, -33); g.restore();
    if (!mask) mord(g, 'WW', cx0, s - 38, { u: 1.9, r: 2.1, rim: 2, sy: 3 });
    g.restore();
  },
  drawBot(g) { rect(g, 0, 0, SW, SH, '#000'); },
};
// ?test=progress — the unlock chain: each stage opens only after the one before
function runProgressTest() {
  const rep = { steps: [], ok: true };
  SAVE = defaultSave();
  const chain = STORY_STAGES.concat(['superwestie']);
  for (const id of chain) {
    const d = STAGES[id]; if (!d) { rep.steps.push(id + ': FALTA'); rep.ok = false; continue; }
    const before = stageUnlocked(id);
    rep.steps.push(id + ': ' + (before ? 'abierta' : 'CERRADA') + ' · juegos ' + stageGames(d).length + (d.boss ? ' + jefe ' + d.boss : ''));
    if (!before) rep.ok = false;
    SAVE.cleared[id] = 1;
  }
  rep.extras = ['mezcla', 'unpelo'].map(id => id + ':' + (stageUnlocked(id) ? 'abierta' : 'CERRADA'));
  rep.menu = menuStageIds();
  rep.totalGames = allStoryGames().length;
  document.documentElement.setAttribute('data-result', JSON.stringify(rep));
}
// ?test=audio — every instrument, sfx and song is parsed and scheduled for real
function runAudioTest() {
  const rep = { errors: [], warnings: [], songs: 0, sfx: 0, inst: 0 };
  try { auUnlock(); } catch (e) { rep.errors.push('unlock: ' + e.message); }
  if (!AU.ctx) { rep.errors.push('sin AudioContext'); document.documentElement.setAttribute('data-result', JSON.stringify(rep)); return; }
  const t0 = auT() + .05;
  for (const k in INST) { try { INST[k](440, t0, .1, .5, AU.fx); rep.inst++; } catch (e) { rep.errors.push('inst ' + k + ': ' + e.message); } }
  for (const k in SFX) { try { sfx(k, { n: 2 }); rep.sfx++; } catch (e) { rep.errors.push('sfx ' + k + ': ' + e.message); } }
  for (const who in VOICES) { try { voiceBlip(who); } catch (e) { rep.errors.push('voz ' + who + ': ' + e.message); } }
  const check = (name, song, beats) => {
    if (!song || !song.tracks) { rep.errors.push(name + ': sin pistas'); return; }
    for (const tr of song.tracks) {
      if (tr.i && tr.i !== 'd' && !INST[tr.i]) rep.errors.push(name + ': instrumento desconocido ' + tr.i);
      for (const tk of tr.n.trim().split(/\s+/)) { const t = tk.replace(/[!_]$/, ''); if (t === '.' || t === '-') continue; for (const p of t.split('+')) if (!(p.length === 1 && DRUMS.includes(p)) && noteMidi(p) == null) rep.errors.push(name + ': nota rara «' + p + '»'); }
      const steps = tr.n.trim().split(/\s+/).length, spb = song.spb || 4;
      if (beats && steps !== beats * spb && (beats * spb) % steps !== 0) rep.warnings.push(name + ': pista de ' + steps + ' pasos para ' + beats + ' pulsos');
    }
    try { const pl = playSong(song, { bpm: 120, vol: .01 }); stopSong(pl, .01); rep.songs++; } catch (e) { rep.errors.push(name + ': ' + e.message); }
  };
  for (const k in JINGLE) check('JINGLE.' + k, JINGLE[k]);
  for (const id of STAGE_ORDER) { const d = STAGES[id]; if (d.songs) for (const k in d.songs) {
    if (k === 'jingles') { for (const j in d.songs.jingles) check(id + '.jingles.' + j, d.songs.jingles[j], 4); continue; } // the themed announcements: 4 beats each
    check(id + '.' + k, d.songs[k], ['win', 'lose', 'next', 'ready'].includes(k) ? 2 : 0);
  } }
  for (const id of MG_ORDER) { const d = MG[id]; if (d.song) { try { const g = mgNew(id, 1, 120); check('mg.' + id, d.song(g), d.boss ? 0 : d.beats); } catch (e) { rep.errors.push('mg.' + id + ': ' + e.message); } } }
  for (const id in CUTS) { const c = CUTS[id]; if (c.song) check('cut.' + id, c.song); (c.shots || []).forEach((s, i) => { if (s.song) check('cut.' + id + '#' + i, s.song); }); }
  stopAllMusic(.01);
  document.documentElement.setAttribute('data-result', JSON.stringify(rep));
}
// ?test=cut[&id=prologo] — every cutscene runs to its end on its own (auto lines, bot plays)
function runCutTest() {
  BOTIN.on = true; const rep = {}, ids = QS.get('id') ? [QS.get('id')] : Object.keys(CUTS).filter(id => !id.endsWith('_art'));
  for (const id of ids) {
    let done = false, err = null, t = 0;
    try {
      playCut(id, () => { done = true; });
      for (let i = 0; i < 240 * 60 && !done; i++) { tick(STEP); t += STEP; if (TRANS && TRANS.t > TRANS.dur) TRANS = null; }
    } catch (e) { err = String(e && e.message || e); }
    rep[id] = err ? 'ERROR ' + err : done ? 'ok ' + t.toFixed(1) + 's' : 'NO TERMINA (' + t.toFixed(0) + 's) plano ' + CUT.i + '/' + CUT.def.shots.length + ' línea ' + CUT.li + ' fin=' + CUT._finished + ' escena=' + (SCENE === CUT ? 'CUT' : '?');
    _cutDone = null; TRANS = null;
  }
  document.documentElement.setAttribute('data-result', JSON.stringify(rep));
}
// ?test=icon[&mask=1] — the app icon at its native 192x192 (tools/icons.sh scales it)
function runIcon() {
  const c = mkCanvas(SW, SH); ICON.drawTop(c.g);
  const o = mkCanvas(192, 192); o.g.drawImage(c, 32, 0, 192, 192, 0, 0, 192, 192);
  document.documentElement.setAttribute('data-result', o.toDataURL('image/png'));
}
// ?test=thumb — the 320x200 portfolio label (scaled x2 to 640x400 by tools)
function runThumb() {
  const c = mkCanvas(320, 200), g = c.g, t = 3.2;
  rect(g, 0, 0, 320, 200, '#ffb347');
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; polyPx(g, [[160, 96], [160 + Math.cos(a - .1) * 400, 96 + Math.sin(a - .1) * 400], [160 + Math.cos(a + .1) * 400, 96 + Math.sin(a + .1) * 400]], '#ffc56b'); }
  for (let i = 0; i < 14; i++) drawPawPrint(g, (i * 47) % 330, (i * 83) % 210, '#ffd28c', i % 2 ? .5 : -.4);
  // the cast along the bottom
  const cast = STORY_STAGES.filter(id => STAGES[id] && STAGES[id].face && id !== 'anahi');
  rect(g, 0, 150, 320, 50, RAMP.green[2]); rect(g, 0, 150, 320, 2, INK); for (let x = 0; x < 320; x += 16) rect(g, x, 152, 8, 48, RAMP.green[3]);
  cast.forEach((id, i) => { const d = STAGES[id]; drawS(g, bubbleImg(id, 19, d.face(), d.rim || RAMP.gold[3], false), 104 + i * 42, 172); });
  drawAnahi(g, 40, 206, 'win', 0);
  drawSuperWestie(g, 272, 124, 1, { flip: true });
  drawLogo(g, 150, 70, t, { noSparkle: true });
  document.documentElement.setAttribute('data-result', c.toDataURL('image/png'));
}
