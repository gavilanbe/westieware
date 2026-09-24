// ============================================================================
//  menu — the character bubbles (grab them, fling them, tap to choose), plus
//  Colección (every microgame you've seen), Juguetes and Opciones.
// ============================================================================
'use strict';

const SONG_MENU = { spb: 4, loop: true, tracks: [
  { i: 'mari', v: .55, n: 'E5 . G5 . . B5 . A5 . . G5 . E5 . . . D5 . F5 . . A5 . G5 . . F5 . D5 . . . C5 . E5 . . G5 . F5 . . E5 . C5 . . . D5 . . F5 . E5 . D5 . B4 . C5 . . .' },
  { i: 'vib', v: .35, n: 'C5+E5+G5 - - - - - - - - - - - - - - - D5+F5+A5 - - - - - - - - - - - - - - - E5+G5+B5 - - - - - - - - - - - - - - - D5+F5+A5 - - - - - - - G4+B4+D5 - - - - - - -' },
  { i: 'bass', v: .8, n: 'C3 . . G2 . . C3 . . . G2 . . . C3 . D3 . . A2 . . D3 . . . A2 . . . D3 . E3 . . B2 . . E3 . . . B2 . . . E3 . D3 . . A2 . . D3 . G2 . . D3 . . G2 .' },
  { i: 'd', v: .5, n: 'k . r z . r k . z r . z k r z . k . r z . r k . z r . z k r z r' }] };

function faceCrop(src, x, y, w, h) { const c = mkCanvas(w, h); c.g.drawImage(src, -x, -y); return c; }
// round badge with a face, used by the menu bubbles (cached per face + size)
function bubbleImg(id, r, face, rim, locked) {
  return mdl('bub:' + id + r + (locked ? 'L' : ''), () => {
    const d = r * 2 + 4, c = mkCanvas(d, d), g = c.g, cx0 = d / 2, cy0 = d / 2;
    disc(g, cx0, cy0 + 1, r + 2, INK); disc(g, cx0, cy0, r + 1, INK); disc(g, cx0, cy0, r, rim);
    disc(g, cx0, cy0, r - 3, locked ? '#6b6977' : '#fffaf0'); disc(g, cx0 - 2, cy0 - 3, r - 6, locked ? '#7b7987' : '#ffffff');
    // face clipped to the disc
    const f = mkCanvas(d, d); f.g.drawImage(face, rd(cx0 - face.width / 2), rd(cy0 - face.height / 2 + 2));
    if (locked) { f.g.globalCompositeOperation = 'source-in'; f.g.fillStyle = '#44424f'; f.g.fillRect(0, 0, d, d); }
    const m = mkCanvas(d, d); disc(m.g, cx0, cy0, r - 3, '#000'); m.g.globalCompositeOperation = 'source-in'; m.g.drawImage(f, 0, 0);
    g.drawImage(m, 0, 0);
    // glossy rim highlight
    for (let a = 3.5; a < 4.6; a += .05) px(g, cx0 + Math.cos(a) * (r - 1), cy0 + Math.sin(a) * (r - 1), '#ffffff');
    return c;
  });
}

const MENU = {
  enter(arg = {}) {
    stopAllMusic(.1); this.song = playSong(SONG_MENU, { bpm: 104 });
    this.t = 0; this.tab = 'juegos'; this.fx = new FX(); this.topFx = new FX();
    this.bubbles = []; this.drag = null; this.press = null; this.btnPress = null;
    const ids = menuStageIds();
    ids.forEach((id, i) => {
      const d = STAGES[id], locked = !stageUnlocked(id);
      const ang = i / ids.length * TAU - Math.PI / 2, hx = SW / 2 + Math.cos(ang) * 78, hy = 78 + Math.sin(ang) * 46;
      const isNew = !locked && !SAVE.unlockSeen[id] && id !== 'anahi';
      this.bubbles.push({ id, x: hx, y: hy, hx, hy, vx: rnd(-20, 20), vy: rnd(-20, 20), r: d.bubbleR || 22, locked, isNew, pop: isNew ? -.4 - i * .1 : 1, wob: rnd(TAU), squash: 0 });
    });
    this.sel = arg.from && STAGES[arg.from] ? arg.from : (SAVE.lastSel && STAGES[SAVE.lastSel] ? SAVE.lastSel : 'anahi');
    this.selT = 0;
    const fresh = this.bubbles.filter(b => b.isNew);
    if (fresh.length) { this.sel = fresh[0].id; after(.5, () => { sfx('sparkle'); playSong(JINGLE.record, { bpm: 140 }); }); }
    for (const b of fresh) SAVE.unlockSeen[b.id] = 1;
    persist();
    // warm the pictures of the next stage while we sit here
    for (const id of ids) if (!stageUnlocked(id)) continue; else { const d = STAGES[id]; if (d.portrait) warm(() => d.portrait()); if (d.face) warm(() => d.face()); }
  },
  exit() { },
  update(dt) {
    this.t += dt; this.selT += dt; this.fx.update(dt); this.topFx.update(dt);
    if (this.tab === 'juegos') this.updBubbles(dt);
    else if (this.tab === 'coleccion') this.updColeccion(dt);
    else if (this.tab === 'opciones') this.updOpciones(dt);
    else if (this.tab === 'juguetes') this.updJuguetes(dt);
    this.updTabs();
  },
  // ------------------------------------------------------------ bubbles ---
  updBubbles(dt) {
    const B = this.bubbles;
    for (const b of B) {
      b.pop = Math.min(1, b.pop + dt * 2.2); b.squash = Math.max(0, b.squash - dt * 4); b.wob += dt;
      if (this.drag === b) continue;
      // drift home + float
      b.vx += (b.hx - b.x) * 1.2 * dt + Math.cos(b.wob * .9) * 6 * dt; b.vy += (b.hy - b.y) * 1.2 * dt + Math.sin(b.wob * 1.1) * 6 * dt;
      b.vx *= Math.exp(-1.2 * dt); b.vy *= Math.exp(-1.2 * dt);
      b.x += b.vx * dt; b.y += b.vy * dt;
      const top = 6 + b.r, bot = 148 - b.r;
      if (b.x < b.r + 2) { b.x = b.r + 2; b.vx = Math.abs(b.vx) * .7; b.squash = Math.min(1, Math.abs(b.vx) / 200); if (Math.abs(b.vx) > 60) sfx('boing', { pitch: 1.8, vol: .3 }); }
      if (b.x > SW - b.r - 2) { b.x = SW - b.r - 2; b.vx = -Math.abs(b.vx) * .7; b.squash = Math.min(1, Math.abs(b.vx) / 200); if (Math.abs(b.vx) > 60) sfx('boing', { pitch: 1.8, vol: .3 }); }
      if (b.y < top) { b.y = top; b.vy = Math.abs(b.vy) * .7; }
      if (b.y > bot) { b.y = bot; b.vy = -Math.abs(b.vy) * .7; b.squash = Math.min(1, Math.abs(b.vy) / 200); }
    }
    // soft collisions
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
      const a = B[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, min = a.r + b.r + 3;
      if (d < min) { const push = (min - d) / 2, nx = dx / d, ny = dy / d; if (this.drag !== a) { a.x -= nx * push; a.y -= ny * push; a.vx -= nx * 30; a.vy -= ny * 30; } if (this.drag !== b) { b.x += nx * push; b.y += ny * push; b.vx += nx * 30; b.vy += ny * 30; } }
    }
    // input: grab / drag / fling / tap-select
    if (IN.tap && IN.y < 152) {
      const hit = B.slice().reverse().find(b => dist(IN.x, IN.y, b.x, b.y) < b.r + 4 && b.pop > .5);
      if (hit) { this.drag = hit; this.grabOff = [hit.x - IN.x, hit.y - IN.y]; this.grabT = 0; this.grabMoved = 0; hit.squash = .6; sfx('pop', { pitch: .7 }); }
    }
    if (this.drag) {
      const b = this.drag; this.grabT += dt; this.grabMoved += Math.hypot(IN.dx, IN.dy);
      const tx = IN.x + this.grabOff[0], ty = IN.y + this.grabOff[1];
      b.vx = (tx - b.x) / dt * .5; b.vy = (ty - b.y) / dt * .5; b.x = lerp(b.x, tx, .5); b.y = lerp(b.y, ty, .5);
      if (IN.rel || !IN.down) {
        this.drag = null;
        if (this.grabMoved < 6) this.tapBubble(b); else { b.vx = IN.vx * .9; b.vy = IN.vy * .9; sfx('swoosh', { pitch: 1.4, vol: .5 }); }
      }
    }
  },
  tapBubble(b) {
    if (b.locked) { b.squash = 1; sfx('buzz', { vol: .4 }); this.lockMsg = { id: b.id, t: 0 }; return; }
    if (this.sel === b.id && this.selT > .25) { this.play(b.id); return; }
    this.sel = b.id; this.selT = 0; SAVE.lastSel = b.id; persist();
    b.squash = 1; sfx('select'); sfx('bark', { pitch: 1.2 + rnd(.3), vol: .6 });
    this.fx.burst(b.x, b.y, 10, { k: 'star', c: [C.yellow, '#fff'], sp0: 40, sp1: 110 });
  },
  play(id) {
    sfx('slam'); sfx('bark', { n: 2 }); stopSong(this.song, .2);
    const b = this.bubbles.find(b => b.id === id); if (b) { b.squash = 1; this.fx.burst(b.x, b.y, 20, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 200 }); }
    const d = STAGES[id];
    after(.25, () => transit('paw', d.scene || STG, d.sceneArg || { id }));
  },
  // ------------------------------------------------------------ tabs ------
  tabs: [['juegos', 'JUEGOS'], ['coleccion', 'COLECCIÓN'], ['juguetes', 'JUGUETES'], ['opciones', 'OPCIONES']],
  tabRect(i) { const w = 62, x = 3 + i * 63; return { x, y: 172, w, h: 18 }; },
  updTabs() {
    this.tabs.forEach(([id], i) => {
      const r = this.tabRect(i), hit = IN.x >= r.x && IN.x < r.x + r.w && IN.y >= r.y - 2 && IN.y < r.y + r.h + 4;
      if (IN.tap && hit) this.btnPress = 'tab:' + id;
      if (IN.rel && this.btnPress === 'tab:' + id && hit && this.tab !== id) { this.tab = id; sfx('cursor'); this.subSel = null; this.scroll = 0; }
    });
    // big play button
    if (this.tab === 'juegos' && this.sel && stageUnlocked(this.sel)) {
      const hit = IN.x >= 70 && IN.x < 186 && IN.y >= 150 && IN.y < 170;
      if (IN.tap && hit) this.btnPress = 'play';
      if (IN.rel && this.btnPress === 'play' && hit) this.play(this.sel);
    }
    if (IN.rel || !IN.down) { if (IN.rel) this.btnPress = null; }
    if (IN.key === 'Enter' && this.tab === 'juegos' && this.sel) this.play(this.sel);
  },
  // ------------------------------------------------------------ drawing ---
  drawTop(g) {
    if (this.tab === 'juegos') this.drawCard(g);
    else if (this.tab === 'coleccion') this.drawColTop(g);
    else if (this.tab === 'juguetes') this.drawToyTop(g);
    else this.drawOptTop(g);
    this.topFx.draw(g);
  },
  drawCard(g) {
    const id = this.sel, d = STAGES[id], t = this.selT;
    const R = d.cardCols || [RAMP.green[1], RAMP.green[2]];
    rect(g, 0, 0, SW, SH, R[0]);
    for (let i = -2; i < 12; i++) { const x = i * 28 + fl(this.t * 10) % 28; polyPx(g, [[x, 0], [x + 14, 0], [x - 30, SH], [x - 44, SH]], R[1]); }
    // portrait slides in
    const k = E.outBack(clamp(t / .35, 0, 1));
    if (d.portrait) drawS(g, d.portrait('menu', this.t), lerp(-60, 64, k), 186, { ax: .5, ay: 1 });
    // name
    const nst = fitMord(d.name, 164, { u: 1.9, r: 2, rim: 2, sy: 3, fill: d.nameFill || ['#ffffff', '#fff27a', '#ffc23a'] });
    mord(g, d.name, 172, 18 + (1.9 - nst.u) * 6, nst, { anim: i => ({ s: Math.max(0, spring(t - .05 - i * .04, 2.4, 7)) }) });
    if (t > .2) txt(g, d.sub, 172, 52, '#ffffff', { align: 'c', out: INK });
    // mechanic badge
    if (t > .3) { const bk = spring(t - .3, 2.5, 7); g.save(); g.translate(172, 82); g.scale(bk, bk); panel(g, -40, -12, 80, 24, '#ffffff', { r: 6, lo: '#dce7ea' }); mord(g, d.verb, 0, -7, { u: 1.1, r: 1.3, rim: 1, sy: 1 }); g.restore(); }
    const best = SAVE.best[id] || 0, cleared = !!SAVE.cleared[id];
    if (t > .4) {
      panel(g, 120, 104, 104, 34, '#fff8e6', { r: 5 });
      txt(g, 'RÉCORD', 172, 109, '#6b6977', { align: 'c' });
      mord(g, String(best), 172, 118, { u: 1, r: 1.2, rim: 1, sy: 1 });
      if (cleared) { const mk = spring(t - .5, 2.5, 6); g.save(); g.translate(222, 106); g.rotate(.3); g.scale(mk, mk); disc(g, 0, 0, 12, INK); disc(g, 0, 0, 11, RAMP.gold[3]); disc(g, -2, -2, 7, RAMP.gold[4]); txt(g, '✓', 0, -4, RAMP.green[1], { align: 'c', bold: true }); g.restore(); }
    }
    if (this.lockMsg && this.lockMsg.t < 2) { this.lockMsg.t += STEP; const need = STAGES[STAGES[this.lockMsg.id].unlockBy]; panel(g, 20, 150, 216, 26, '#ffffff', { r: 6 }); txt(g, '🔒 Supera antes: ' + (need ? need.name : '¿?'), SW / 2, 159, INK, { align: 'c' }); }
    else if (t > .6) { const tip = d.tip || 'Toca otra vez el personaje para jugar'; txt(g, tip, SW / 2, 164, '#ffffff', { align: 'c', out: INK }); }
  },
  drawBot(g) {
    const t = this.t, G = RAMP.green;
    // boulevard wallpaper: cream and mint stripes with gold pinstripe
    rect(g, 0, 0, SW, SH, '#fff4dc');
    for (let x = 0; x < SW; x += 24) { rect(g, x, 0, 12, SH, '#e6f2e8'); px(g, x + 12, 0, RAMP.gold[3]); vline(g, x + 12, 0, SH, '#f2e2b8'); }
    if (this.tab === 'juegos') this.drawBubbles(g);
    else if (this.tab === 'coleccion') this.drawColBot(g);
    else if (this.tab === 'juguetes') this.drawToyBot(g);
    else this.drawOptBot(g);
    // tab bar
    rect(g, 0, 170, SW, 22, G[2]); rect(g, 0, 170, SW, 1, INK);
    this.tabs.forEach(([id, label], i) => {
      const r = this.tabRect(i), on = this.tab === id, pr = this.btnPress === 'tab:' + id;
      panel(g, r.x, r.y + (on ? 0 : 2) + (pr ? 1 : 0), r.w, r.h, on ? '#ffffff' : G[3], { r: 4, line: INK, lo: on ? '#dce7ea' : G[1] });
      tiny(g, label, r.x + r.w / 2, r.y + 7 + (on ? 0 : 2), on ? INK : '#ffffff', { align: 'c' });
    });
    this.fx.draw(g);
    void t;
  },
  drawBubbles(g) {
    const t = this.t;
    for (const b of this.bubbles) {
      if (b.pop <= 0) continue;
      const d = STAGES[b.id], s = b.pop < 1 ? spring(b.pop, 2.5, 5) : 1;
      const sq = Math.sin(b.squash * Math.PI * 2) * b.squash * .18;
      const face = d.face ? d.face() : buleHead('happy');
      const img = bubbleImg(b.id, b.r, face, d.rim || RAMP.gold[3], b.locked);
      shadowOval(g, b.x, b.y + b.r + 4, b.r * .7, 2.5, .35);
      drawS(g, img, b.x, b.y + Math.sin(b.wob * 2) * 1.5, { sx: s * (1 + sq), sy: s * (1 - sq) });
      if (b.locked) { txt(g, '?', b.x, b.y - 4, '#ffffff', { align: 'c', out: INK, bold: true }); }
      if (this.sel === b.id) { const k = 1 + Math.sin(t * 6) * .05; ringPx(g, b.x, b.y, (b.r + 5) * k, C.pink); ringPx(g, b.x, b.y, (b.r + 6) * k, '#ffffff'); drawS(g, mdl('selArrow', () => spr(['kkkkkkk', '.kyyyk.', '..kyk..', '...k...'], { k: INK, y: C.yellow })), b.x, b.y - b.r - 10 + Math.sin(t * 8) * 2); }
      if (b.isNew && b.pop > .5) { const nk = 1 + Math.sin(t * 8) * .1; g.save(); g.translate(rd(b.x + b.r - 4), rd(b.y - b.r + 2)); g.rotate(.3); g.scale(nk, nk); panel(g, -16, -6, 32, 12, C.pink, { r: 3 }); tiny(g, 'NUEVO', 0, -2, '#ffffff', { align: 'c' }); g.restore(); }
      if (!b.locked) { const d2 = STAGES[b.id]; if (SAVE.cleared[b.id]) { disc(g, b.x + b.r * .7, b.y + b.r * .7, 5, INK); disc(g, b.x + b.r * .7, b.y + b.r * .7, 4, RAMP.gold[3]); px(g, b.x + b.r * .7 - 1, b.y + b.r * .7 - 1, '#fff'); } void d2; }
    }
    if (this.sel && stageUnlocked(this.sel)) {
      const pr = this.btnPress === 'play', k = 1 + Math.sin(this.t * 5) * .04;
      g.save(); g.translate(128, 160 + (pr ? 1 : 0)); g.scale(k, k);
      panel(g, -58, -10, 116, 20, C.yellow, { r: 6, hi: '#ffffff', lo: pr ? null : '#c08a10' });
      mord(g, '¡A JUGAR!', 0, -6, { u: 1, r: 1.25, rim: 1, sy: 1 });
      g.restore();
    }
  },
  // ------------------------------------------------------------ colección --
  colItems() { return MG_ORDER.filter(id => MG[id].stage && MG[id].stage !== 'test'); },
  updColeccion() {
    const items = this.colItems(), cols = 6, cw = 40, ch = 34, x0 = 8, y0 = 8 - (this.scroll || 0);
    if (IN.down && this.dragCol != null) { this.scroll = clamp((this.scroll || 0) - IN.dy, 0, Math.max(0, Math.ceil(items.length / cols) * ch - 150)); if (Math.abs(IN.y - this.dragCol) > 4) this.colMoved = true; }
    if (IN.tap && IN.y < 166) { this.dragCol = IN.y; this.colMoved = false; }
    if (IN.rel && this.dragCol != null) {
      if (!this.colMoved) items.forEach((id, i) => { const x = x0 + (i % cols) * cw, y = y0 + fl(i / cols) * ch; if (IN.x >= x && IN.x < x + cw - 4 && IN.y >= y && IN.y < y + ch - 4) { if (!SAVE.seen[id]) { sfx('buzz', { vol: .4 }); return; } if (this.subSel === id) { sfx('slam'); transit('paw', STG, { id: MG[id].stage, practice: id }); } else { this.subSel = id; sfx('select'); } } });
      this.dragCol = null;
    }
  },
  drawColBot(g) {
    const items = this.colItems(), cols = 6, cw = 40, ch = 34, x0 = 8, y0 = 8 - (this.scroll || 0);
    items.forEach((id, i) => {
      const x = x0 + (i % cols) * cw, y = y0 + fl(i / cols) * ch; if (y < -30 || y > 170) return;
      const seen = SAVE.seen[id], sel = this.subSel === id, d = MG[id], st = STAGES[d.stage];
      panel(g, x, y, cw - 4, ch - 4, seen ? (st && st.rim) || '#ffffff' : '#9896a4', { r: 4, line: sel ? C.pink : INK });
      if (seen) { const th = mgThumb(id); g.drawImage(th, x + 2, y + 2); if (d.boss) { disc(g, x + cw - 8, y + 4, 4, C.red); tiny(g, 'J', x + cw - 8, y + 2, '#fff', { align: 'c' }); } }
      else txt(g, '?', x + (cw - 4) / 2, y + 10, '#ffffff', { align: 'c', bold: true });
    });
  },
  drawColTop(g) {
    rect(g, 0, 0, SW, SH, RAMP.purple[2]); for (let y = 0; y < SH; y += 8) rect(g, 0, y, SW, 1, RAMP.purple[1]);
    const seen = this.colItems().filter(id => SAVE.seen[id]).length, total = this.colItems().length;
    mord(g, 'COLECCIÓN', SW / 2, 10, { u: 1.6, r: 1.7, rim: 2, sy: 2 });
    txt(g, seen + ' / ' + total + ' microjuegos descubiertos', SW / 2, 44, '#ffffff', { align: 'c', out: INK });
    const id = this.subSel;
    if (id) {
      const d = MG[id];
      panel(g, 12, 60, 232, 118, '#fff8e6', { r: 6 });
      g.drawImage(mgThumb(id, 2), 20, 68);
      txt(g, d.name, 100, 70, INK, { bold: true }); mord(g, d.cmd, 170, 84, { u: 1, r: 1.2, rim: 1, sy: 1 });
      txt(g, d.how, 100, 108, '#44424f', { wrap: 136 });
      txt(g, 'Récord: ' + (SAVE.best['mg:' + id] || 0), 100, 150, RAMP.green[2], { bold: true });
      txt(g, 'Toca otra vez para practicar', 128, 164, '#6b6977', { align: 'c' });
    } else txt(g, 'Toca un microjuego para verlo', SW / 2, 110, '#ffffff', { align: 'c', out: INK });
  },
  // ------------------------------------------------------------ opciones ---
  optItems() { return [
    ['sound', 'Sonido: ' + (AU.on ? 'SÍ' : 'NO')], ['haptic', 'Vibración: ' + (SAVE.opts.haptic === 0 ? 'NO' : 'SÍ')],
    ['prologo', 'Ver el prólogo otra vez'], ['credits', 'Créditos'], ['erase', this.eraseArm ? '¿SEGURO? Toca otra vez' : 'Borrar partida']]; },
  updOpciones() {
    this.optItems().forEach(([id], i) => {
      const y = 12 + i * 30, hit = IN.x >= 24 && IN.x < 232 && IN.y >= y && IN.y < y + 24;
      if (IN.tap && hit) this.btnPress = 'opt:' + id;
      if (IN.rel && this.btnPress === 'opt:' + id && hit) {
        sfx('select');
        if (id === 'sound') setSound(!AU.on);
        if (id === 'haptic') { SAVE.opts.haptic = SAVE.opts.haptic === 0 ? 1 : 0; persist(); buzz(30); }
        if (id === 'prologo') playCut('prologo', () => go(MENU, {}));
        if (id === 'credits') transit('curtain', CREDITS, {});
        if (id === 'erase') { if (this.eraseArm) { SAVE = defaultSave(); persist(); this.eraseArm = false; transit('paw', BOOT, {}); } else this.eraseArm = true; }
      }
    });
  },
  drawOptBot(g) {
    this.optItems().forEach(([id, label], i) => {
      const y = 12 + i * 30, pr = this.btnPress === 'opt:' + id;
      panel(g, 24, y + (pr ? 1 : 0), 208, 24, id === 'erase' ? '#ffd1e4' : '#ffffff', { r: 6, lo: pr ? null : '#c8c6d3' });
      txt(g, label, SW / 2, y + 8 + (pr ? 1 : 0), INK, { align: 'c', bold: true });
    });
  },
  drawOptTop(g) {
    rect(g, 0, 0, SW, SH, RAMP.teal[2]); for (let i = 0; i < 20; i++) drawPawPrint(g, (i * 57) % SW, (i * 37) % SH, RAMP.teal[3], i);
    drawLogo(g, SW / 2, 70, 3 + this.t, { noSparkle: true });
    txt(g, 'Westie BLVRD · Grooming, Spa & Store', SW / 2, 130, '#ffffff', { align: 'c', out: INK });
    txt(g, 'Carrer de Viladomat, 185 · Barcelona', SW / 2, 144, '#ffffff', { align: 'c', out: INK });
    txt(g, 'Cita: 688 72 57 01 · @westie.blvrd', SW / 2, 158, C.yellowL, { align: 'c', out: INK });
  },
  // ------------------------------------------------------------ juguetes ---
  updJuguetes(dt) { if (typeof toysUpdate === 'function') toysUpdate(this, dt); },
  drawToyBot(g) { if (typeof toysDrawBot === 'function') toysDrawBot(this, g); else txt(g, 'Próximamente…', SW / 2, 80, INK, { align: 'c' }); },
  drawToyTop(g) { if (typeof toysDrawTop === 'function') toysDrawTop(this, g); else { rect(g, 0, 0, SW, SH, RAMP.orange[2]); mord(g, 'JUGUETES', SW / 2, 80, { u: 1.6, r: 1.7 }); } },
};
// which stages appear in the menu, in order
function menuStageIds() {
  const story = ['anahi', 'rizos', 'pompon', 'hermanas', 'ceniza', 'bigotes', 'superwestie', 'mezcla', 'unpelo'];
  const rank = id => { const i = story.indexOf(id); return i < 0 ? 99 : i; };
  return STAGE_ORDER.filter(id => STAGES[id].menu !== false && id !== 'test').sort((a, b) => rank(a) - rank(b));
}
function stageUnlocked(id) { const d = STAGES[id]; if (!d) return false; if (!d.unlockBy) return true; const req = Array.isArray(d.unlockBy) ? d.unlockBy : [d.unlockBy]; return req.every(r => SAVE.cleared[r]); }
// thumbnail of a microgame's first frame (for the collection)
function mgThumb(id, sc = 1) {
  return mdl('thumb:' + id + sc, () => {
    const w = 32 * sc, h = 24 * sc, c = mkCanvas(w, h);
    const saved = RNG; RNG = mulberry32(3);
    const g2 = mgNew(id, 1, 120); for (let i = 0; i < 20; i++) mgUpdate(g2, STEP);
    const img = mgDraw(g2); RNG = saved;
    // a soft downscale reads better than nearest-neighbour at 1/8 size
    c.g.imageSmoothingEnabled = true; c.g.imageSmoothingQuality = 'high'; c.g.drawImage(img, 0, 0, w, h);
    return c;
  });
}

// ---------------------------------------------------------------- credits ---
const CREDITS = {
  enter() { this.t = 0; stopAllMusic(.1); playSong(SONG_TITLE, { bpm: 116 }); },
  update(dt) { this.t += dt; if (this.t > 2 && IN.anyTap) transit('curtain', MENU, {}); },
  drawTop(g) {
    rect(g, 0, 0, SW, SH, RAMP.green[1]);
    drawLogo(g, SW / 2, 70, this.t);
    txt(g, 'Un homenaje de fans a WarioWare: Touched!', SW / 2, 140, '#ffffff', { align: 'c' });
    txt(g, 'hecho para Westie BLVRD', SW / 2, 152, RAMP.cream[3], { align: 'c' });
  },
  drawBot(g) {
    rect(g, 0, 0, SW, SH, RAMP.green[2]);
    const lines = ['PELUQUERÍA', 'Anahí Gavilán', '', 'MASCOTA', 'Bule (y todos los peludos)', '', 'IDEA Y PRODUCCIÓN', 'Nahuel Gavilán', '', 'PROGRAMACIÓN, ARTE Y MÚSICA', 'Claude Opus 5.5', '', 'Grooming · Spa & Store', 'Carrer de Viladomat, 185', '688 72 57 01 · @westie.blvrd', '', '¡Gracias por jugar!'];
    const y0 = SH - this.t * 18;
    lines.forEach((l, i) => { const y = y0 + i * 12; if (y > -10 && y < SH) txt(g, l, SW / 2, y, l === l.toUpperCase() && l ? C.yellowL : '#ffffff', { align: 'c', out: INK, bold: l === l.toUpperCase() }); });
  },
};
