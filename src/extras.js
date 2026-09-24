// ============================================================================
//  extras — Juguetes (the souvenir room): Caricias, Pizarra, Cine, Piano Guau,
//  Gramola and the secret ¡PAPELEO! boss, opening one by one as you clear stages.
// ============================================================================
'use strict';

const TOYS = [
  { id: 'caricias', name: 'Caricias', how: 'Frota a Keiko, tócale la nariz… ¡mímala!', need: 0 },
  { id: 'pizarra', name: 'Pizarra', how: 'Dibuja con tizas de colores y sellos, como la de la puerta.', need: 1 },
  { id: 'cine', name: 'Cine', how: 'Vuelve a ver el prólogo y las historias que ya has visto.', need: 2 },
  { id: 'piano', name: 'Piano Guau', how: 'Cada perrete ladra una nota. ¡Toca una canción!', need: 3 },
  { id: 'gramola', name: 'Gramola', how: 'La música de cada personaje, para escucharla tranquilamente.', need: 5 },
  { id: 'papeleo', name: '¡PAPELEO!', how: 'Jefe secreto: el Inspector de Hacienda viene a por Anahí.', need: 7, launch: () => transit('paw', STG, { id: 'bonus', story: false }) },
];
const clearedCount = () => STORY_STAGES.filter(id => SAVE.cleared[id]).length + (SAVE.cleared.superwestie ? 1 : 0);
const toyOpen = t => clearedCount() >= t.need;
// a toy is "new" from the moment it opens until you first look at it
const toyNew = t => t.need > 0 && toyOpen(t) && !(SAVE.toysSeen || {})[t.id];
const anyToyNew = () => TOYS.some(toyNew);
function toySeen(t) { if (toyNew(t)) { SAVE.toysSeen = SAVE.toysSeen || {}; SAVE.toysSeen[t.id] = 1; persist(); } }
const toyRect = i => ({ x: 10 + (i % 3) * 80, y: 4 + fl(i / 3) * 72, w: 72, h: 62 });

const TOY = { sel: null, playing: null };
function toysUpdate(M, dt) {
  if (TOY.playing) { TOY_IMPL[TOY.playing].update(dt); if (IN.tap && IN.y > 150 && IN.x > 196 && IN.y < 168) { const T = TOY_IMPL[TOY.playing]; if (T.exit) T.exit(); TOY.playing = null; sfx('back'); } return; }
  TOYS.forEach((t, i) => {
    const r = toyRect(i), hit = IN.x >= r.x && IN.x < r.x + r.w && IN.y >= r.y && IN.y < r.y + r.h;
    if (IN.tap && hit) {
      if (!toyOpen(t)) { sfx('buzz', { vol: .4 }); TOY.sel = t.id; return; }
      toySeen(t);
      if (TOY.sel === t.id) { sfx('slam'); if (t.launch) t.launch(); else { TOY.playing = t.id; TOY_IMPL[t.id].enter(); } }
      else { TOY.sel = t.id; sfx('select'); }
    }
  });
  void M; void dt;
}
function toysDrawBot(M, g) {
  if (TOY.playing) { TOY_IMPL[TOY.playing].drawBot(g); panel(g, 196, 150, 56, 18, '#ffffff', { r: 4 }); txt(g, 'SALIR', 224, 155, INK, { align: 'c', bold: true }); return; }
  // two wooden shelves, three souvenirs on each
  for (const y of [68, 140]) { rect(g, 6, y, 244, 4, RAMP.wood[3]); rect(g, 6, y, 244, 1, RAMP.wood[4]); rect(g, 6, y + 4, 244, 1, INK); }
  TOYS.forEach((t, i) => {
    const r = toyRect(i), open = toyOpen(t), sel = TOY.sel === t.id, bob = sel ? Math.sin(NOW * 6) * 2 : 0;
    panel(g, r.x, r.y + bob, r.w, r.h, open ? '#ffffff' : '#c8c6d3', { r: 6, line: sel ? C.pink : INK, lo: '#dce7ea' });
    if (open) toyIcon(g, t.id, r.x + r.w / 2, r.y + 26 + bob); else mord(g, '?', r.x + r.w / 2, r.y + 12 + bob, { u: 1.8, r: 2 });
    tiny(g, open ? t.name : '???', r.x + r.w / 2, r.y + 52 + bob, INK, { align: 'c' });
    if (toyNew(t)) { const k = 1 + Math.sin(NOW * 8) * .08; g.save(); g.translate(r.x + r.w - 8, r.y + 4 + bob); g.rotate(.25); g.scale(k, k); panel(g, -14, -5, 28, 10, '#e8303c', { r: 2, line: INK }); tiny(g, 'NUEVO', 0, -2, '#ffffff', { align: 'c' }); g.restore(); }
  });
  const st = TOYS.find(t => t.id === TOY.sel);
  txt(g, st ? (toyOpen(st) ? 'Toca otra vez para ' + (st.launch ? 'jugar' : 'abrirlo') : 'Supera más fases para abrirlo') : 'Elige un recuerdo', SW / 2, 152, INK, { align: 'c' });
  void M;
}
function toysDrawTop(M, g) {
  if (TOY.playing && TOY_IMPL[TOY.playing].drawTop) { TOY_IMPL[TOY.playing].drawTop(g); return; }
  rect(g, 0, 0, SW, SH, RAMP.orange[2]);
  for (let i = 0; i < 16; i++) drawPawPrint(g, (i * 71 + NOW * 10) % (SW + 20) - 10, (i * 47) % SH, RAMP.orange[3], i);
  mord(g, 'JUGUETES', SW / 2, 16, { u: 1.8, r: 2, rim: 2, sy: 2 });
  const t = TOYS.find(t => t.id === TOY.sel);
  if (t) { panel(g, 16, 70, 224, 70, '#fff8e6', { r: 6 }); txt(g, toyOpen(t) ? t.name : '???', SW / 2, 78, INK, { align: 'c', bold: true }); txt(g, toyOpen(t) ? t.how : 'Se abre al superar ' + t.need + ' fase' + (t.need > 1 ? 's' : '') + '.', SW / 2, 96, '#44424f', { align: 'c', wrap: 200 }); }
  else txt(g, 'Recuerdos de Westie BLVRD para jugar sin prisas', SW / 2, 100, '#ffffff', { align: 'c', out: INK });
  const n = TOYS.filter(toyOpen).length;
  txt(g, n + ' de ' + TOYS.length + ' recuerdos', SW / 2, 170, '#ffffff', { align: 'c', out: INK });
  void M;
}
function toyIcon(g, id, x, y) {
  if (id === 'caricias') drawS(g, keikoHead('love'), x, y, { s: .62 });
  else if (id === 'pizarra') drawS(g, aFrameSign(), x, y + 20, { ax: .5, ay: 1, s: .7 });
  else if (id === 'piano') { for (let i = 0; i < 7; i++) { rect(g, x - 21 + i * 6, y - 11, 6, 24, INK); rect(g, x - 20 + i * 6, y - 10, 4, 22, '#ffffff'); } for (const i of [0, 1, 3, 4, 5]) rect(g, x - 17 + i * 6, y - 11, 4, 13, INK); }
  else if (id === 'cine') { // clapperboard
    rect(g, x - 18, y - 6, 36, 22, INK); rect(g, x - 17, y - 5, 34, 20, '#2a2440'); for (let i = 0; i < 4; i++) hline(g, x - 14, x + 14, y + 1 + i * 4, '#6b6977');
    g.save(); g.translate(x - 18, y - 7); g.rotate(-.3); rect(g, 0, -6, 37, 7, INK); for (let i = 0; i < 6; i++) rect(g, 1 + i * 6, -5, 3, 5, '#ffffff'); g.restore();
  } else if (id === 'gramola') { // jukebox
    ellipsePx(g, x, y - 8, 16, 12, INK); rect(g, x - 16, y - 8, 32, 26, INK); ellipsePx(g, x, y - 8, 15, 11, '#c0392b'); rect(g, x - 15, y - 8, 30, 25, '#c0392b');
    ellipsePx(g, x, y - 7, 10, 7, '#fff27a'); rect(g, x - 10, y - 7, 20, 10, '#fff27a'); for (let i = 0; i < 5; i++) vline(g, x - 8 + i * 4, y - 9, y + 3, i % 2 ? '#ff9f4f' : '#ffd23f');
    rect(g, x - 11, y + 6, 22, 8, INK); for (let i = 0; i < 4; i++) rect(g, x - 10 + i * 5, y + 7, 4, 6, ['#5bd18b', '#63a0ef', '#ff5d9e', '#ffdf4f'][i]);
  } else { // a stamped tax form
    g.save(); g.translate(x, y); g.rotate(-.12); rect(g, -15, -18, 30, 38, INK); rect(g, -14, -17, 28, 36, '#fffaf0'); tiny(g, '303', 0, -13, INK, { align: 'c' }); for (let i = 0; i < 4; i++) hline(g, -10, 10, -4 + i * 4, '#c8c6d3'); g.restore();
    g.save(); g.translate(x + 4, y + 8); g.rotate(.3); ringPx(g, 0, 0, 9, '#e23b4e'); ringPx(g, 0, 0, 8, '#e23b4e'); tiny(g, 'OK', 0, -2, '#e23b4e', { align: 'c' }); g.restore();
  }
}
// ---------------------------------------------------------------- Cine ------
// the prologue and every story you have already seen, on film
function cineFilms() {
  const L = [{ id: 'prologo', name: 'PRÓLOGO', open: !!SAVE.prologue || !!(SAVE.cutsSeen || {}).prologo }];
  for (const sid of STORY_STAGES.concat(['superwestie'])) {
    const d = STAGES[sid]; if (!d) continue; const seen = SAVE.cutsSeen || {};
    if (d.intro && CUTS[d.intro]) L.push({ id: d.intro, name: d.name + ' · 1', open: !!(seen[d.intro] || SAVE.cleared[sid] || SAVE.best[sid] != null) });
    if (d.outro && CUTS[d.outro]) L.push({ id: d.outro, name: d.name + ' · 2', open: !!(seen[d.outro] || SAVE.cleared[sid]) });
  }
  return L;
}
// ---------------------------------------------------------------- Gramola ---
function gramolaTracks() {
  const L = [{ name: 'Título', song: SONG_TITLE, bpm: 116 }, { name: 'Menú', song: SONG_MENU, bpm: 104 }];
  for (const sid of STORY_STAGES.concat(['superwestie'])) {
    const d = STAGES[sid]; if (!d || !stageUnlocked(sid) || !d.songs) continue;
    if (d.songs.play) L.push({ name: d.name, song: d.songs.play, bpm: d.bpm });
    const b = d.boss && MG[d.boss]; let bs = null; try { bs = b && b.song ? b.song({ level: 1, r: Math.random, ri: (a, c) => a }) : null; } catch (e) { bs = null; }
    if (bs || (d.songs && d.songs.boss)) L.push({ name: d.name + ' · JEFE', song: bs || d.songs.boss, bpm: d.bpm });
  }
  return L;
}

const TOY_IMPL = {
  // ------------------------------------------------ Cine Viladomat -----------
  cine: {
    enter() { this.sel = null; this.films = cineFilms(); },
    rect(i) { return { x: 6 + (i % 3) * 82, y: 6 + fl(i / 3) * 27, w: 78, h: 24 }; },
    update() {
      if (!IN.tap || IN.y > 146) return;
      this.films.forEach((f, i) => {
        const r = this.rect(i); if (IN.x < r.x || IN.x >= r.x + r.w || IN.y < r.y || IN.y >= r.y + r.h) return;
        if (!f.open) { sfx('buzz', { vol: .4 }); this.sel = f.id; return; }
        if (this.sel === f.id) { sfx('slam'); playCut(f.id, () => go(MENU, { tab: 'juguetes', toy: 'cine' })); }
        else { this.sel = f.id; sfx('select'); }
      });
    },
    drawBot(g) {
      rect(g, 0, 0, SW, SH, '#2a2440'); for (let y = 0; y < SH; y += 6) hline(g, 0, SW, y, '#30294a');
      this.films.forEach((f, i) => {
        const r = this.rect(i), sel = this.sel === f.id;
        // a cinema ticket with torn edges
        panel(g, r.x, r.y, r.w, r.h, f.open ? (sel ? '#fff27a' : '#ffd1e4') : '#6b6977', { r: 3, line: INK });
        for (let k = 0; k < 4; k++) { disc(g, r.x, r.y + 4 + k * 5, 1.5, '#2a2440'); disc(g, r.x + r.w, r.y + 4 + k * 5, 1.5, '#2a2440'); }
        vline(g, r.x + 16, r.y + 3, r.y + r.h - 4, f.open ? '#c0392b' : '#44424f');
        tiny(g, String(i + 1).padStart(2, '0'), r.x + 9, r.y + 10, f.open ? '#c0392b' : '#44424f', { align: 'c' });
        tiny(g, f.open ? f.name : '???', r.x + 47, r.y + 10, f.open ? INK : '#44424f', { align: 'c' });
      });
      txt(g, this.sel ? 'Toca otra vez para verla' : 'Elige una película', 96, 155, '#ffffff', { align: 'c' });
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, '#3b2757');
      // the marquee of the Cine Viladomat, with chasing bulbs
      rect(g, 20, 20, 216, 76, INK); rect(g, 22, 22, 212, 72, '#c0392b'); rect(g, 26, 26, 204, 64, '#fff8e6');
      for (let i = 0; i < 26; i++) { const on = (fl(NOW * 8) + i) % 3 === 0, x = 24 + i * 8.2; disc(g, x, 22, 2, on ? '#fff27a' : '#8a5f3a'); disc(g, x, 94, 2, on ? '#fff27a' : '#8a5f3a'); }
      mord(g, 'CINE', SW / 2, 30, { u: 1.8, r: 2, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] });
      txt(g, 'VILADOMAT', SW / 2, 74, '#c0392b', { align: 'c', bold: true });
      const f = this.films && this.films.find(f => f.id === this.sel);
      txt(g, 'EN CARTELERA:', SW / 2, 118, '#ffd1e4', { align: 'c' });
      txt(g, f ? (f.open ? f.name : 'Sigue jugando para verla') : '. . .', SW / 2, 132, '#ffffff', { align: 'c', out: INK, bold: true });
      for (let i = 0; i < 9; i++) { const x = 18 + i * 28; ellipsePx(g, x, 178, 12, 10, '#1d1424'); ellipsePx(g, x, 176, 9, 8, '#2a2440'); }
    },
  },
  // ------------------------------------------------ Gramola -------------------
  gramola: {
    enter() { this.tracks = gramolaTracks(); this.on = -1; this.t = 0; stopAllMusic(.1); },
    exit() { stopAllMusic(.1); if (MENU.song !== undefined) MENU.song = playSong(SONG_MENU, { bpm: 104 }); },
    rect(i) { return { x: 6 + (i % 2) * 124, y: 6 + fl(i / 2) * 17, w: 120, h: 15 }; },
    update(dt) {
      this.t += dt;
      if (!IN.tap || IN.y > 146) return;
      this.tracks.forEach((tr, i) => {
        const r = this.rect(i); if (IN.x < r.x || IN.x >= r.x + r.w || IN.y < r.y || IN.y >= r.y + r.h) return;
        stopAllMusic(.05);
        if (this.on === i) { this.on = -1; sfx('back'); return; }
        this.on = i; sfx('select'); playSong(tr.song, { bpm: tr.bpm, loop: true });
      });
    },
    drawBot(g) {
      rect(g, 0, 0, SW, SH, '#fff4dc'); for (let x = 0; x < SW; x += 24) { rect(g, x, 0, 12, SH, '#ffe8c4'); }
      this.tracks.forEach((tr, i) => {
        const r = this.rect(i), on = this.on === i;
        panel(g, r.x, r.y, r.w, r.h, on ? '#ffdf4f' : '#ffffff', { r: 3, line: INK });
        disc(g, r.x + 8, r.y + 7, 5, INK); disc(g, r.x + 8, r.y + 7, 4, on ? '#c0392b' : '#2b2540'); disc(g, r.x + 8, r.y + 7, 1.5, '#fff8e6');
        if (on) { const a = NOW * 8; px(g, r.x + 8 + Math.cos(a) * 3, r.y + 7 + Math.sin(a) * 3, '#fff27a'); }
        tiny(g, tr.name, r.x + 18, r.y + 5, INK);
      });
      txt(g, this.on >= 0 ? 'Toca otra vez para parar' : 'Toca un disco', 96, 155, INK, { align: 'c' });
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, '#2a1052');
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + NOW * .3; polyPx(g, [[SW / 2, 120], [SW / 2 + Math.cos(a - .05) * 300, 120 + Math.sin(a - .05) * 300], [SW / 2 + Math.cos(a + .05) * 300, 120 + Math.sin(a + .05) * 300]], '#3b1a6a'); }
      // the jukebox: arch, bubbling tubes, spinning record, the track title
      const x = SW / 2, y = 30;
      ellipsePx(g, x, y + 30, 62, 40, INK); rect(g, x - 62, y + 30, 124, 132, INK); ellipsePx(g, x, y + 30, 60, 38, '#c0392b'); rect(g, x - 60, y + 30, 120, 130, '#c0392b');
      ellipsePx(g, x, y + 32, 46, 28, '#fff8e6'); rect(g, x - 46, y + 32, 92, 40, '#fff8e6');
      for (let i = 0; i < 6; i++) { const bx = x - 56 + (i < 3 ? i * 5 : 97 + (i - 3) * 5); for (let k = 0; k < 7; k++) { const by = y + 150 - ((NOW * 40 + k * 20 + i * 7) % 110); disc(g, bx, by, 1.5, ['#ffdf4f', '#5bd18b', '#63a0ef'][k % 3]); } }
      const spin = this.on >= 0 ? NOW * 6 : 0;
      disc(g, x, y + 50, 20, INK); disc(g, x, y + 50, 19, '#2b2540'); for (let r = 7; r < 18; r += 4) ringPx(g, x, y + 50, r, '#40395e'); disc(g, x, y + 50, 6, '#ff5d9e'); px(g, x + Math.cos(spin) * 4, y + 50 + Math.sin(spin) * 4, '#ffffff');
      const tr = this.tracks && this.tracks[this.on];
      rect(g, x - 50, y + 84, 100, 16, INK); rect(g, x - 49, y + 85, 98, 14, '#1d1424');
      tiny(g, tr ? tr.name : 'ELIGE UN DISCO', x, y + 90, tr ? '#5bd18b' : '#6b6977', { align: 'c' });
      for (let i = 0; i < 10; i++) { const h = tr ? 3 + Math.abs(Math.sin(NOW * (5 + i) + i)) * 14 : 2; rect(g, x - 45 + i * 9, y + 124 - h, 6, h, ['#ff5d9e', '#ffdf4f', '#5bd18b'][i % 3]); }
      mord(g, 'GRAMOLA', x, 6, { u: 1.3, r: 1.5, rim: 1, sy: 2, fill: ['#ffffff', '#ffd49b', '#ff9f4f'] });
    },
  },
  // ------------------------------------------------ Caricias: pet Keiko -------
  caricias: {
    enter() { this.joy = .3; this.ex = 'normal'; this.exT = 0; this.rub = rubTracker(); this.fx = new FX(); this.wag = 0; this.sneeze = 0; },
    update(dt) {
      this.fx.update(dt); this.exT -= dt; this.wag = Math.max(0, this.wag - dt); this.sneeze = Math.max(0, this.sneeze - dt);
      const onHead = dist(IN.x, IN.y, 128, 80) < 40;
      const gain = this.rub.update(dt, onHead && IN.y < 150);
      if (gain > 0) { this.joy = Math.min(1, this.joy + gain * .002); this.wag = .6; this.ex = 'happy'; this.exT = .4; if (FRAME % 12 === 0) this.fx.add({ k: 'heart', x: 128 + rnd(-30, 30), y: 50, vy: -30, life: .9, c: C.pink }); }
      if (IN.tap && dist(IN.x, IN.y, 128, 87) < 7) { this.sneeze = .6; sfx('yip', { pitch: 1.3 }); this.ex = 'wow'; this.exT = .6; this.fx.add({ k: 'txt', s: '¡ACHÍS!', x: 128, y: 30, life: .7, c: '#ffffff' }); }
      else if (IN.tap && onHead) { sfx('bark', { pitch: 1 + this.joy * .4 }); }
      this.joy = Math.max(0, this.joy - dt * .03);
      if (this.exT <= 0) this.ex = this.joy > .8 ? 'love' : this.joy > .4 ? 'normal' : 'sad';
    },
    drawBot(g) {
      g.drawImage(salonBotBackdrop(), 0, 0);
      drawKeikoSit(g, 128 + (this.wag > 0 ? Math.sin(NOW * 30) * 1.5 : 0), 150 + 36, this.ex, { tilt: this.sneeze > 0 ? Math.sin(this.sneeze * 30) * .3 : 0 });
      this.fx.draw(g);
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, RAMP.pink[3]); for (let i = 0; i < 12; i++) drawHeart(g, (i * 53 + NOW * 12) % SW, (i * 37 + NOW * 6) % SH, RAMP.pink[4], 1.2);
      mord(g, 'CARICIAS', SW / 2, 20, { u: 1.6, r: 1.8, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] });
      txt(g, 'FELICIDAD DE KEIKO', SW / 2, 80, INK, { align: 'c', bold: true });
      rect(g, 40, 94, 176, 14, INK); rect(g, 41, 95, 174, 12, '#ffffff'); rect(g, 41, 95, rd(174 * this.joy), 12, '#ff5d9e'); rect(g, 41, 95, rd(174 * this.joy), 3, '#ffd1e4');
      txt(g, 'Frótale la cabeza · tócale la nariz', SW / 2, 124, '#44424f', { align: 'c' });
    },
  },
  // ------------------------------------------------ Pizarra: chalk drawing ----
  pizarra: {
    enter() { if (!this.cv) this.cv = mkCanvas(220, 118); this.col = 0; this.stamp = null; this.last = null; this.clear(); },
    cols: ['#f2f2ea', '#ffd1e4', '#b3d9ff', '#fff7ae', '#b8f0d0'],
    clear() { const g = this.cv.g; g.fillStyle = '#26332e'; g.fillRect(0, 0, 220, 118); for (let i = 0; i < 300; i++) px(g, rnd(220), rnd(118), '#2c3a34'); },
    update() {
      // palette + stamps + clear along the bottom
      if (IN.tap && IN.y > 140 && IN.y < 168 && IN.x < 190) {
        const i = fl((IN.x - 8) / 26);
        if (i >= 0 && i < 5) { this.col = i; this.stamp = null; sfx('cursor'); }
        else if (i >= 5 && i < 7) { this.stamp = i === 5 ? 'paw' : 'heart'; sfx('cursor'); }
      }
      if (IN.tap && dist(IN.x, IN.y, 236, 132) < 10) { this.clear(); sfx('swoosh'); }
      const lx = IN.x - 18, ly = IN.y - 16;
      if (IN.down && lx >= 0 && ly >= 0 && lx < 220 && ly < 118) {
        const g = this.cv.g;
        if (this.stamp) { if (IN.tap) { if (this.stamp === 'paw') drawPawPrint(g, lx, ly, this.cols[this.col]); else drawHeart(g, lx, ly, this.cols[this.col], 1.4); sfx('pop'); } }
        else {
          const p = this.last && IN.held > 0 ? this.last : [lx, ly];
          g.fillStyle = this.cols[this.col];
          const d = Math.hypot(lx - p[0], ly - p[1]), n = Math.max(1, Math.ceil(d));
          for (let i = 0; i <= n; i++) { const x = lerp(p[0], lx, i / n), y = lerp(p[1], ly, i / n); g.fillRect(rd(x), rd(y), 2, 2); if (hash2(fl(x * 3), fl(y * 3)) < .3) g.fillRect(rd(x) + 1, rd(y) - 1, 1, 1); }
          if (d > 1 && FRAME % 3 === 0) sfx('chalk', { vol: .5 });
        }
        this.last = [lx, ly];
      } else this.last = null;
    },
    drawBot(g) {
      rect(g, 0, 0, SW, SH, RAMP.wood[3]);
      rect(g, 14, 12, 228, 126, INK); rect(g, 16, 14, 224, 122, RAMP.wood[2]); g.drawImage(this.cv, 18, 16);
      this.cols.forEach((c, i) => { panel(g, 8 + i * 26, 144, 22, 20, c, { r: 3, line: this.col === i && !this.stamp ? C.pink : INK }); });
      panel(g, 138, 144, 22, 20, '#ffffff', { r: 3, line: this.stamp === 'paw' ? C.pink : INK }); drawPawPrint(g, 149, 154, INK);
      panel(g, 164, 144, 22, 20, '#ffffff', { r: 3, line: this.stamp === 'heart' ? C.pink : INK }); drawHeart(g, 175, 154, C.red, 1);
      disc(g, 236, 132, 9, INK); disc(g, 236, 132, 8, '#ffffff'); tiny(g, 'X', 236, 130, INK, { align: 'c' });
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, '#3e8f3a'); for (let y = 0; y < SH; y += 2) for (let x = y % 4; x < SW; x += 4) px(g, x, y, '#56ab4a');
      rect(g, 0, 0, SW, 80, '#e3cfaf');
      // the drawing shows up on the A-frame outside the shop
      const s = .6; g.save(); g.translate(62, 64); g.scale(s, s); rect(g, -6, -6, 232, 130, INK); rect(g, -4, -4, 228, 126, RAMP.wood[3]); g.drawImage(this.cv, 0, 0); g.restore();
      mord(g, 'PIZARRA', 196, 20, { u: 1.2, r: 1.4, rim: 1, sy: 2 });
      txt(g, 'Tu obra, en la puerta', 196, 44, INK, { align: 'c' });
    },
  },
  // ------------------------------------------------ Piano Guau ---------------
  piano: {
    enter() { this.fx = new FX(); this.hit = new Float32Array(8); this.notes = []; },
    keys: [0, 2, 4, 5, 7, 9, 11, 12],
    ramps: () => [RAMP.fur, RAMP.apricot, RAMP.grey, RAMP.caramel, RAMP.merleBlue, RAMP.cream, RAMP.black, RAMP.mud],
    update(dt) {
      this.fx.update(dt); for (let i = 0; i < 8; i++) this.hit[i] = Math.max(0, this.hit[i] - dt * 3);
      for (const n of this.notes) { n.y -= 40 * dt; n.t += dt; } this.notes = this.notes.filter(n => n.t < 3);
      if (IN.tap && IN.y > 20 && IN.y < 140) {
        const i = clamp(fl((IN.x - 8) / 30), 0, 7);
        const semis = this.keys[i]; this.hit[i] = 1;
        sfx('bark', { pitch: Math.pow(2, semis / 12) * .9, vol: .9 }); INST.p25(mtof(72 + semis), auT(), .12, .5, AU.fx);
        this.fx.burst(23 + i * 30, 50, 6, { k: 'star', c: [C.yellow, '#fff'] });
        this.notes.push({ x: 40 + i * 22, y: 150, t: 0, i });
      }
    },
    drawBot(g) {
      rect(g, 0, 0, SW, SH, '#fff4dc');
      const R = this.ramps();
      for (let i = 0; i < 8; i++) {
        const x = 8 + i * 30, h = this.hit[i];
        panel(g, x, 96 + h * 3, 28, 44, '#ffffff', { r: 3, lo: '#c8c6d3' });
        drawS(g, buleHead(h > .2 ? 'wow' : 'normal', R[i]), x + 14, 64 - h * 8, { sy: 1 + h * .1 });
      }
      this.fx.draw(g);
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, '#fff8e6');
      for (let l = 0; l < 5; l++) hline(g, 10, 246, 90 + l * 8, '#c8c6d3');
      for (const n of this.notes) { const y = 90 + (7 - n.i) * 4 - (n.t * 10), x = 20 + n.t * 70 + n.i * 4; if (x > 250) continue; ellipsePx(g, x, y, 3, 2.3, INK); vline(g, x + 2, y - 10, y, INK); }
      mord(g, 'PIANO GUAU', SW / 2, 20, { u: 1.4, r: 1.6, rim: 2, sy: 2 });
    },
  },
};
