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

const REVEAL_T = 3.4; // seconds each newly unlocked character gets to itself
const MENU = {
  enter(arg = {}) {
    stopAllMusic(.1); this.song = playSong(SONG_MENU, { bpm: 104 });
    this.t = 0; this.tab = arg.tab || 'juegos'; this.fx = new FX(); this.topFx = new FX();
    // back from something played in Juguetes (the Cine, the secret boss)
    if (arg.from && STAGES[arg.from] && STAGES[arg.from].menu === false) { this.tab = 'juguetes'; arg = {}; }
    if (arg.toy && typeof TOY_IMPL !== 'undefined' && TOY_IMPL[arg.toy]) { TOY.sel = arg.toy; TOY.playing = arg.toy; TOY_IMPL[arg.toy].enter(); }
    this.walkers = []; this.popFor = null; this.popT = 0; this.hold = null; this.btnPress = null; this.lockMsg = null;
    const ids = menuStageIds();
    // the locked ones queue up on the right, so the others keep off that strip
    this.area = { x0: 16, x1: ids.some(id => !stageUnlocked(id)) ? 212 : 240, y0: 72, y1: 156 };
    let li = 0;
    for (const id of ids) {
      const locked = !stageUnlocked(id), isNew = !locked && !SAVE.unlockSeen[id] && id !== 'anahi';
      // only the next one to unlock peeks in, as a silhouette; the rest stay a surprise
      if (locked) { if (li++ === 0) this.walkers.push({ id, locked, x: 230, y: 112, st: 'wait', t: 0, dir: -1, f: 0 }); continue; }
      const [x, y] = this.freeSpot();
      this.walkers.push({ id, locked, isNew, x, y, vx: 0, vy: 0, st: 'idle', t: rnd(.2, 1.6), dir: chance(.5) ? 1 : -1, f: 0, hop: 0, appear: isNew ? -.4 : 1 });
    }
    const [kx, ky] = this.freeSpot();
    this.walkers.push({ id: 'keiko', x: kx, y: ky, st: 'idle', t: 1, dir: 1, f: 0, hop: 0, appear: 1 });
    this.sel = arg.from && STAGES[arg.from] ? arg.from : (SAVE.lastSel && STAGES[SAVE.lastSel] && stageUnlocked(SAVE.lastSel) ? SAVE.lastSel : 'anahi');
    this.selT = 0;
    const fresh = this.walkers.filter(w => w.isNew);
    // a newly unlocked character drops in from above under a spotlight (WarioWare-style reveal);
    // if several are new at once they arrive one by one, each with its own moment
    fresh.forEach((w, i) => { w.appear = 1; w.drop = { t: -.45 - i * REVEAL_T }; });
    this.revealQ = fresh.map(w => w.id); this.reveal = null; this.nextReveal();
    for (const w of fresh) SAVE.unlockSeen[w.id] = 1;
    if (QS.get('pop')) { const w = this.walkers.find(w => w.id === QS.get('pop')); if (w) { this.popFor = w; this.sel = w.id; } }
    persist();
    for (const id of ids) if (stageUnlocked(id)) { const d = STAGES[id]; if (d.portrait) warm(() => d.portrait('menu')); if (d.chibi) warm(() => { d.chibi('walk0', 0); d.chibi('walk1', 0); }); }
  },
  exit() { },
  update(dt) {
    this.t += dt; this.selT += dt; this.popT += dt; this.fx.update(dt); this.topFx.update(dt);
    if (this.reveal) { this.reveal.t += dt; if (this.reveal.t > REVEAL_T) this.nextReveal(); }
    if (this.tab === 'juegos') this.updWalkers(dt);
    else if (this.tab === 'coleccion') this.updColeccion(dt);
    else if (this.tab === 'opciones') this.updOpciones(dt);
    else if (this.tab === 'juguetes') this.updJuguetes(dt);
    this.updTabs();
  },
  // ------------------------------------------------------------ walkers ---
  nextReveal() {
    const id = this.revealQ && this.revealQ.shift();
    this.reveal = id ? { id, t: 0 } : null;
    if (id) { this.sel = id; this.selT = 0; this.popFor = null; after(.3, () => { sfx('sparkle'); playSong(JINGLE.record, { bpm: 140 }); }); }
  },
  area: { x0: 16, x1: 240, y0: 72, y1: 156 },
  // best of a handful of random spots: the one farthest from everybody else
  freeSpot(from, reach) {
    const A = this.area; let best = null, bd = -1;
    for (let i = 0; i < 10; i++) {
      const x = from ? clamp(from.x + rnd(-reach, reach), A.x0, A.x1) : rnd(A.x0, A.x1), y = from ? clamp(from.y + rnd(-reach * .45, reach * .45), A.y0, A.y1) : rnd(A.y0, A.y1);
      let d = 1e9; for (const o of this.walkers) if (o !== from && !o.locked) d = Math.min(d, Math.hypot(o.x - x, (o.y - y) * 1.6));
      if (d > bd) { bd = d; best = [x, y]; }
    }
    return best;
  },
  popRects(w) {
    const right = w.x < 170, bx = right ? w.x + 14 : w.x - 72;
    return { jugar: { x: bx, y: w.y - 40, w: 58, h: 20 }, paso: { x: bx + 4, y: w.y - 16, w: 50, h: 18 } };
  },
  updWalkers(dt) {
    const A = this.area;
    for (const w of this.walkers) {
      w.f += dt; w.hop = Math.max(0, (w.hop || 0) - dt * 3); if (w.appear != null) w.appear = Math.min(1, w.appear + dt * 2);
      if (w.st === 'wait' || w === this.hold) continue;
      if (w.drop) { w.drop.t += dt; if (w.drop.landed && w.drop.t > 1.4) w.drop = null; }
      if (w.drop && !w.drop.landed) {
        w.st = 'idle';
        if (w.drop.t >= .55) { w.drop.landed = true; w.hop = 1; sfx('boing', { pitch: 1.4, vol: .6 }); sfx('bark', { n: 2, pitch: 1.2 }); shake('bot', 2, .15);
          this.fx.burst(w.x, w.y - 14, 26, { k: 'star', c: [C.yellow, '#ffffff', C.pinkL, C.mint], sp0: 60, sp1: 210 });
          if (this.reveal && this.reveal.id === w.id) { this.popFor = w; this.popT = 0; } }
        continue;
      }
      if (w.st === 'fall') { w.vy += 700 * dt; w.y += w.vy * dt; if (w.y >= w.floor) { w.y = w.floor; if (w.vy > 120) { w.vy = -w.vy * .35; sfx('boing', { pitch: 2, vol: .3 }); } else { w.st = 'idle'; w.t = rnd(.4, 1.2); } } continue; }
      if (this.popFor === w) { w.st = 'idle'; continue; }
      w.t -= dt;
      if (w.st === 'idle' && w.t <= 0) { [w.tx, w.ty] = this.freeSpot(w, 70); w.st = 'walk'; }
      if (w.st === 'walk') {
        const dx = w.tx - w.x, dy = w.ty - w.y, d = Math.hypot(dx, dy), sp = w.id === 'keiko' ? 34 : 20;
        if (d < 2) { w.st = 'idle'; w.t = rnd(.8, 2.6); }
        else { w.x += dx / d * sp * dt; w.y += dy / d * sp * dt; if (Math.abs(dx) > 1) w.dir = sgn(dx); }
      }
    }
    // a little personal space: nobody stands on anybody else's head
    const crowd = this.walkers.filter(w => !w.locked && w.st !== 'held' && w.st !== 'fall' && w !== this.hold);
    for (let i = 0; i < crowd.length; i++) for (let j = i + 1; j < crowd.length; j++) {
      const a = crowd[i], b = crowd[j], dx = b.x - a.x, dy = (b.y - a.y) * 1.6, d = Math.hypot(dx, dy) || .01;
      if (d >= 28) continue;
      const p = (28 - d) * dt * 2.5, ux = d > .02 ? dx / d : 1, uy = d > .02 ? dy / d : 0;
      const ka = this.popFor === a ? 0 : this.popFor === b ? 2 : 1, kb = 2 - ka;
      a.x -= ux * p * ka; a.y -= uy * p * ka / 1.6; b.x += ux * p * kb; b.y += uy * p * kb / 1.6;
    }
    for (const w of crowd) { w.x = clamp(w.x, A.x0, A.x1); w.y = clamp(w.y, A.y0, A.y1); }
    // popup buttons
    if (this.popFor) {
      const R = this.popRects(this.popFor);
      for (const [id, r] of Object.entries(R)) {
        const hit = IN.x >= r.x && IN.x < r.x + r.w && IN.y >= r.y && IN.y < r.y + r.h;
        if (IN.tap && hit) { this.btnPress = 'pop:' + id; return; }
        if (IN.rel && this.btnPress === 'pop:' + id) { this.btnPress = null; if (hit) { if (id === 'jugar') this.play(this.popFor.id); else { this.popFor = null; sfx('back'); } } return; }
      }
    }
    // pick / drag / tap
    // the tap box follows each little sprite (the sisters are wide, Rizos's afro is tall)
    const hitW = () => this.walkers.slice().sort((a, b) => b.y - a.y).find(w => Math.abs(IN.x - w.x) < Math.max(12, (w.iw || 24) / 2 + 2) && IN.y > w.y - Math.max(32, (w.ih || 32) + 2) && IN.y < w.y + 4);
    if (IN.tap && IN.y < 168) {
      const w = hitW();
      if (w) { this.hold = w; this.holdMoved = 0; this.holdFrom = [w.x, w.y]; }
      else if (this.popFor) { this.popFor = null; sfx('back'); }
    }
    if (this.hold) {
      const w = this.hold; this.holdMoved += Math.hypot(IN.dx, IN.dy);
      if (this.holdMoved > 6 && !w.locked && w.st !== 'held') { w.st = 'held'; this.popFor = null; sfx('pop', { pitch: .7 }); }
      if (w.st === 'held') { w.x = clamp(IN.x, 8, 248); w.y = clamp(IN.y + 16, 30, 160); }
      if (IN.rel || !IN.down) {
        if (w.st === 'held') { w.st = 'fall'; w.vy = 0; w.floor = clamp(w.y + 10, A.y0, A.y1); sfx('swoosh', { pitch: 1.5, vol: .4 }); }
        else if (this.holdMoved <= 6) this.tapWalker(w);
        this.hold = null;
      }
    }
  },
  tapWalker(w) {
    if (w.id === 'keiko') { w.hop = 1; sfx('bark', { n: 2, pitch: 1.2 }); this.fx.burst(w.x, w.y - 20, 6, { k: 'heart', c: C.pink, sp0: 20, sp1: 50, g: -30 }); return; }
    if (w.locked) { w.hop = 1; sfx('buzz', { vol: .4 }); this.lockMsg = { id: w.id, t: 0 }; return; }
    if (this.popFor === w && this.selT > .3) { this.play(w.id); return; }
    this.sel = w.id; this.selT = 0; this.popFor = w; this.popT = 0; SAVE.lastSel = w.id; persist();
    w.hop = 1; w.st = 'idle'; sfx('select'); sfx('bark', { pitch: 1.2 + rnd(.3), vol: .5 });
    this.fx.burst(w.x, w.y - 16, 8, { k: 'star', c: [C.yellow, '#fff'], sp0: 30, sp1: 90 });
  },
  play(id) {
    sfx('slam'); stopSong(this.song, .2);
    const w = this.walkers.find(w => w.id === id); if (w) { w.hop = 1; this.fx.burst(w.x, w.y - 16, 18, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 60, sp1: 200 }); }
    const d = STAGES[id];
    after(.25, () => transit('paw', d.scene || STG, d.sceneArg || { id }));
  },
  // ------------------------------------------------------------ tabs ------
  tabs: [['juegos', 'JUEGOS', '#2a55c8'], ['coleccion', 'ÁLBUM', '#8a2ab0'], ['juguetes', 'JUGUETES', '#2a9a4a'], ['opciones', 'OPCIONES', '#c89a1a']],
  tabRect(i) { const w = 62, x = 3 + i * 63; return { x, y: 171, w, h: 20 }; },
  updTabs() {
    this.tabs.forEach(([id], i) => {
      const r = this.tabRect(i), hit = IN.x >= r.x && IN.x < r.x + r.w && IN.y >= r.y - 2 && IN.y < r.y + r.h + 4;
      if (IN.tap && hit) this.btnPress = 'tab:' + id;
      if (IN.rel && this.btnPress === 'tab:' + id && hit && this.tab !== id) { this.tab = id; sfx('cursor'); this.subSel = null; this.scroll = 0; this.popFor = null; }
    });
    if (IN.rel) this.btnPress = this.btnPress && this.btnPress.startsWith('pop:') ? this.btnPress : null;
    if (IN.key === 'Enter' && this.tab === 'juegos' && this.sel && stageUnlocked(this.sel)) this.play(this.sel);
  },
  // ------------------------------------------------------------ drawing ---
  drawTop(g) {
    if (this.tab === 'juegos') this.drawCard(g);
    else if (this.tab === 'coleccion') this.drawColTop(g);
    else if (this.tab === 'juguetes') this.drawToyTop(g);
    else this.drawOptTop(g);
    this.topFx.draw(g);
  },
  // top screen: the sign, the top-3 bars, the character, the news ticker
  drawCard(g) {
    const id = this.sel, d = STAGES[id], t = this.selT;
    rect(g, 0, 0, SW, SH, '#7cc4f2');
    for (let y = 0; y < SH; y += 14) for (let x = ((y / 14) % 2) * 14; x < SW; x += 28) disc(g, x + (this.t * 6) % 28, y, 4, '#94d2f6');
    drawS(g, wbSign(), 96, 4, { ax: .5, ay: 0 });
    const top = (SAVE.top && SAVE.top[id]) || [], cols = [['#3fae4a', '#2a7a32'], ['#e0a81e', '#9c700c'], ['#a03ab8', '#6a1f80']], lab = ['1º', '2º', '3º'];
    for (let i = 0; i < 3; i++) {
      const y = 70 + i * 24, k = E.outBack(clamp((t - i * .08) / .3, 0, 1)), w = 150 * k;
      polyPx(g, [[0, y], [w, y], [w - 12, y + 20], [0, y + 20]], INK); polyPx(g, [[0, y + 1], [w - 2, y + 1], [w - 13, y + 19], [0, y + 19]], cols[i][0]);
      rect(g, 0, y + 1, w - 3, 3, 'rgba(255,255,255,.25)');
      if (k > .8) { mord(g, String(i + 1), 18, y + 2, { u: 1.2, r: 1.4, rim: 1, sy: 1 }); txt(g, '°', 28, y + 3, '#ffffff', { out: INK }); const v = top[i]; txt(g, v != null ? String(v) : '- - -', 96, y + 6, '#ffffff', { align: 'c', out: cols[i][1], bold: true }); }
    }
    const k = E.outBack(clamp(t / .35, 0, 1));
    if (d && d.portrait) drawS(g, d.portrait('menu', this.t), lerp(SW + 40, 206, k), 168, { ax: .5, ay: 1 });
    // ticker
    rect(g, 0, 166, SW, 26, INK); rect(g, 0, 167, SW, 1, '#44424f');
    const name = d ? d.name : '', msg = (typeof anyToyNew === 'function' && anyToyNew() ? '¡Hay un recuerdo nuevo en JUGUETES!   ' : '') + '¡Bienvenido a los microjuegos de Westie BLVRD!   ' + (this.lockMsg && this.lockMsg.t < 3 ? '🔒 Supera antes: ' + ((STAGES[STAGES[this.lockMsg.id].unlockBy] || {}).name || '¿?') : (name + ' · ' + (d && d.tip || 'Toca un personaje para jugar'))) + '   ';
    if (this.lockMsg) this.lockMsg.t += STEP;
    const w = txtW(msg), off = (this.t * 40) % (w + 40);
    g.save(); g.beginPath(); g.rect(0, 168, SW, 22); g.clip();
    for (let x = SW - off; x < SW + w; x += w + 40) txt(g, msg.replace('🔒', '♦'), x, 175, '#ffffff');
    g.restore();
    // the unlock stamp over the record bars while a new character arrives
    if (this.reveal && this.reveal.id === id) {
      const rt = this.reveal.t, k = spring(rt - .5, 2.4, 6), out = rt > REVEAL_T - .5 ? clamp((REVEAL_T - rt) * 2, 0, 1) : 1;
      if (k > 0) { g.save(); g.globalAlpha = out; g.translate(92, 104); g.rotate(-.12); g.scale(k, k);
        rect(g, -86, -22, 172, 44, INK); rect(g, -86, -19, 172, 38, '#e8303c'); rect(g, -86, -19, 172, 3, '#ff7a86');
        for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + rt * 3; drawStar(g, Math.cos(a) * 94, Math.sin(a) * 30, 2.5, '#fff27a'); }
        mord(g, '¡NUEVO!', 0, -17, { u: 1.5, r: 1.7, rim: 2, sy: 2, fill: ['#ffffff', '#fff27a', '#ffc23a'] });
        txt(g, (d && d.name || '') + ' se une a Westie BLVRD', 0, 8, '#ffffff', { align: 'c', out: INK });
        g.restore(); g.globalAlpha = 1; }
    }
    if (SAVE.cleared[id]) { const mk = spring(t - .4, 2.5, 6); g.save(); g.translate(236, 144); g.rotate(.3); g.scale(mk, mk); disc(g, 0, 0, 10, INK); disc(g, 0, 0, 9, RAMP.gold[3]); disc(g, -2, -2, 5, RAMP.gold[4]); txt(g, '✓', 0, -4, RAMP.green[1], { align: 'c', bold: true }); g.restore(); }
  },
  drawBot(g) {
    if (this.tab === 'juegos') this.drawWalkers(g);
    else {
      rect(g, 0, 0, SW, SH, '#fff4dc');
      for (let x = 0; x < SW; x += 24) { rect(g, x, 0, 12, SH, '#e6f2e8'); vline(g, x + 12, 0, SH, '#f2e2b8'); }
      if (this.tab === 'coleccion') this.drawColBot(g);
      else if (this.tab === 'juguetes') this.drawToyBot(g);
      else this.drawOptBot(g);
    }
    // tab bar: four coloured buttons with icons
    rect(g, 0, 169, SW, 23, INK);
    this.tabs.forEach(([id, label, col], i) => {
      const r = this.tabRect(i), on = this.tab === id, pr = this.btnPress === 'tab:' + id, oy = (on ? 0 : 2) + (pr ? 1 : 0);
      panel(g, r.x, r.y + oy, r.w, r.h, on ? col : mixHex(col, '#1d1424', .35), { r: 4, line: INK, hi: on ? mixHex(col, '#ffffff', .4) : null });
      menuTabIcon(g, id, r.x + 10, r.y + 9 + oy);
      tiny(g, label, r.x + 38, r.y + 8 + oy, '#ffffff', { align: 'c' });
      if (id === 'juguetes' && typeof anyToyNew === 'function' && anyToyNew()) { const k = 1 + Math.abs(Math.sin(this.t * 6)) * .25; g.save(); g.translate(r.x + r.w - 4, r.y + 1 + oy); g.scale(k, k); disc(g, 0, 0, 6, INK); disc(g, 0, 0, 5, '#e8303c'); txt(g, '!', 0, -3, '#ffffff', { align: 'c', bold: true }); g.restore(); }
    });
    this.fx.draw(g);
  },
  drawWalkers(g) {
    rect(g, 0, 0, SW, SH, '#57b8ee');
    for (let y = 0; y < 170; y += 12) for (let x = ((y / 12) % 2) * 12; x < SW; x += 24) disc(g, x, y, 3.5, '#77c8f4');
    const list = this.walkers.slice().sort((a, b) => a.y - b.y);
    for (const w of list) if (w.drop && w.drop.t < 1.4) {
      const a = w.drop.t < 0 ? clamp(1 + w.drop.t * 3, 0, 1) : w.drop.t < .9 ? 1 : clamp((1.4 - w.drop.t) * 2, 0, 1);
      g.globalAlpha = .28 * a; polyPx(g, [[w.x - 10, 0], [w.x + 10, 0], [w.x + 22, w.y + 2], [w.x - 22, w.y + 2]], '#fff7ae'); g.globalAlpha = .4 * a; ellipsePx(g, w.x, w.y + 1, 22, 4, '#fff7ae'); g.globalAlpha = 1;
    }
    for (const w of list) {
      const d = STAGES[w.id], held = w.st === 'held' || this.hold === w && w.st === 'held';
      const frame = held ? 'held' : (w.st === 'walk' ? (fl(w.f * 6) % 2 ? 'walk1' : 'walk0') : this.popFor === w || w.hop > 0 ? 'happy' : 'idle');
      const img = w.id === 'keiko' ? (typeof keikoChibi === 'function' ? keikoChibi(frame, this.t) : keikoSide(.34, w.st === 'walk' || w.hop > 0 ? 'wag' : 'stand', w.hop > 0 ? 'happy' : 'normal')) : menuChibi(w.id, frame, this.t);
      let hop = Math.sin(Math.min(1, w.hop) * Math.PI) * 6; const sw = held ? Math.sin(this.t * 8) * .25 : 0, s = w.appear != null && w.appear < 1 ? spring(Math.max(0, w.appear), 2.5, 5) : 1;
      if (w.drop && !w.drop.landed) { if (w.drop.t < 0) continue; hop = (1 - E.inQ(clamp(w.drop.t / .55, 0, 1))) * (w.y + 40); }
      if (!held) shadowOval(g, w.x, w.y + 1, 7, 2, .4);
      if (w.locked) { g.globalAlpha = .75; drawS(g, silhouette(img, '#2b4d7a'), w.x, w.y, { ax: .5, ay: 1 }); g.globalAlpha = 1; txt(g, '?', w.x, w.y - img.height - 8, '#ffffff', { align: 'c', out: INK, bold: true }); continue; }
      w.iw = img.width; w.ih = img.height;
      drawS(g, img, w.x, w.y - hop, { ax: .5, ay: 1, flip: w.dir < 0 && w.id !== 'keiko' ? true : w.id === 'keiko' && w.dir < 0, rot: sw, s });
      if (w.isNew && w.appear >= 1 && this.popFor !== w) { const bx = rd(w.x), by = rd(w.y - hop - img.height - 7 + Math.sin(this.t * 5 + w.x * .1) * 1.5); panel(g, bx - 13, by - 4, 26, 9, '#e8303c', { r: 2, line: INK }); tiny(g, 'NUEVO', bx, by - 2, '#ffffff', { align: 'c' }); polyPx(g, [[bx - 2, by + 5], [bx + 2, by + 5], [bx, by + 7]], INK); }
    }
    if (this.popFor) {
      const R = this.popRects(this.popFor), k = spring(this.popT, 2.6, 7);
      for (const [id, r] of Object.entries(R)) {
        const blue = id === 'jugar', pr = this.btnPress === 'pop:' + id;
        g.save(); g.translate(rd(r.x + r.w / 2), rd(r.y + r.h / 2 + (pr ? 1 : 0))); g.scale(k, k);
        ellipsePx(g, 0, 0, r.w / 2 + 1, r.h / 2 + 1, blue ? '#1c3aa8' : '#c0182e'); ellipsePx(g, 0, 0, r.w / 2 - 1, r.h / 2 - 1, '#ffffff'); ellipsePx(g, 0, 0, r.w / 2 - 3, r.h / 2 - 3, blue ? '#1c3aa8' : '#c0182e');
        txt(g, blue ? 'Jugar' : 'Paso', 0, -4, '#ffffff', { align: 'c', bold: true });
        g.restore();
      }
    }
  },
  // ------------------------------------------------------------ colección --
  colItems() { const rank = st => { const i = STORY_STAGES.concat(['superwestie', 'bonus']).indexOf(st); return i < 0 ? 99 : i; }; return MG_ORDER.filter(id => MG[id].stage && MG[id].stage !== 'test').sort((a, b) => rank(MG[a].stage) - rank(MG[b].stage)); },
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
    mord(g, 'ÁLBUM', SW / 2, 10, { u: 1.8, r: 1.9, rim: 2, sy: 2 });
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
        if (id === 'prologo') playCut('prologo', () => go(MENU, { tab: 'opciones' }));
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
    drawLogo(g, SW / 2, 62, 3 + this.t, { noSparkle: true });
    g.globalAlpha = .55; rect(g, 0, 145, SW, 43, INK); g.globalAlpha = 1;
    txt(g, 'Westie BLVRD · Grooming, Spa & Store', SW / 2, 149, '#ffffff', { align: 'c' });
    txt(g, 'Carrer de Viladomat, 185 · Barcelona', SW / 2, 161, '#ffffff', { align: 'c' });
    txt(g, 'Cita: 688 72 57 01 · Instagram: westie.blvrd', SW / 2, 173, C.yellowL, { align: 'c' });
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
    drawLogo(g, SW / 2, 62, this.t);
    g.globalAlpha = .45; rect(g, 0, 150, SW, 30, INK); g.globalAlpha = 1;
    txt(g, 'Un homenaje de fans a WarioWare: Touched!', SW / 2, 154, '#ffffff', { align: 'c' });
    txt(g, 'hecho para Westie BLVRD', SW / 2, 166, RAMP.cream[3], { align: 'c' });
  },
  drawBot(g) {
    rect(g, 0, 0, SW, SH, RAMP.green[2]);
    for (let y = 0; y < 150; y += 8) for (let x = ((y / 8) % 2) * 8; x < SW; x += 16) rect(g, x, y, 8, 8, RAMP.green[1]);
    const lines = ['PELUQUERÍA', 'Anahí Gavilán', '', 'MASCOTA', 'Keiko (y todos los peludos)', '', 'IDEA Y PRODUCCIÓN', 'Nahuel Gavilán', '', 'PROGRAMACIÓN, ARTE Y MÚSICA', 'Claude Opus 5.5', '', 'Grooming · Spa & Store', 'Carrer de Viladomat, 185', '688 72 57 01 · @westie.blvrd', '', '¡Gracias por jugar!'];
    // the names roll up above the floor…
    g.save(); g.beginPath(); g.rect(0, 0, SW, 150); g.clip();
    const y0 = 150 - this.t * 18;
    lines.forEach((l, i) => { const y = y0 + i * 12; if (y > -10 && y < 150) txt(g, l, SW / 2, y, l === l.toUpperCase() && l ? C.yellowL : '#ffffff', { align: 'c', out: INK, bold: l === l.toUpperCase() }); });
    g.restore();
    // …while the whole cast parades along it, Keiko leading
    rect(g, 0, 150, SW, 42, RAMP.wood[2]); rect(g, 0, 150, SW, 2, INK); for (let x = (-(this.t * 28) % 24 + 24) % 24 - 24; x < SW; x += 24) vline(g, rd(x), 152, SH, RAMP.wood[1]);
    const cast = ["keiko"].concat(menuStageIds().filter(id => id !== "mezcla" && id !== "unpelo")), gap = 40, span = Math.max(cast.length * gap, SW + gap);
    cast.forEach((id, i) => {
      const x = ((this.t * 28 + (cast.length - i) * gap) % span) - 30, step = fl(this.t * 6 + i) % 2, hop = Math.abs(Math.sin(this.t * 6 + i)) * 2;
      const img = id === 'keiko' ? (typeof keikoChibi === 'function' ? keikoChibi(step ? 'walk1' : 'walk0', this.t) : keikoSide(.34, 'wag', 'happy')) : menuChibi(id, step ? 'walk1' : 'walk0', this.t);
      shadowOval(g, x, 184, 8, 2, .35); drawS(g, img, x, 184 - hop, { ax: .5, ay: 1 });
    });
  },
};

// the little walker of a stage's character (its own chibi, or a tiny fallback)
function menuChibi(id, frame, t) {
  const d = STAGES[id];
  if (d && d.chibi) { try { return d.chibi(frame, t); } catch (e) { } }
  return mdl('chibiFallback:' + id + frame, () => {
    const f = d && d.face ? d.face() : buleHead('happy'), c = mkCanvas(24, 30), g = c.g;
    g.save(); g.translate(12, 11); g.scale(22 / Math.max(f.width, f.height), 22 / Math.max(f.width, f.height)); g.drawImage(f, -f.width / 2, -f.height / 2); g.restore();
    rect(g, 7, 22, 10, 5, INK); rect(g, 8, 22, 8, 4, d && d.rim || C.gold); const st = frame === 'walk1' ? 1 : 0; rect(g, 8 + st, 27, 3, 3, INK); rect(g, 13 - st, 27, 3, 3, INK);
    return c;
  });
}
// tab icons: gamepad, album, toy duck, wrench
function menuTabIcon(g, id, x, y) {
  if (id === 'juegos') { panel(g, x - 7, y - 4, 14, 8, '#ffffff', { r: 3 }); px(g, x - 4, y, INK); px(g, x - 5, y, INK); px(g, x - 3, y, INK); px(g, x - 4, y - 1, INK); px(g, x - 4, y + 1, INK); px(g, x + 3, y - 1, C.red); px(g, x + 4, y + 1, C.red); }
  else if (id === 'coleccion') { rect(g, x - 6, y - 5, 12, 10, INK); rect(g, x - 5, y - 4, 5, 8, '#ffffff'); rect(g, x + 1, y - 4, 4, 8, '#ffffff'); rect(g, x - 4, y - 2, 3, 2, C.pink); rect(g, x + 2, y + 1, 2, 2, C.sky); }
  else if (id === 'juguetes') { disc(g, x, y + 1, 5, INK); disc(g, x, y + 1, 4, C.yellow); disc(g, x + 3, y - 3, 3, INK); disc(g, x + 3, y - 3, 2, C.yellow); px(g, x + 6, y - 3, C.orange); px(g, x + 3, y - 4, INK); }
  else { thickLine(g, x - 4, y + 4, x + 3, y - 3, 1.5, '#ffffff'); disc(g, x + 4, y - 4, 3, '#ffffff'); disc(g, x + 5, y - 5, 1.2, mixHex('#c89a1a', '#1d1424', .35)); }
}
