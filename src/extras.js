// ============================================================================
//  extras — Juguetes (the souvenir room): Caricias, Pizarra, Piano Guau.
//  Pick a toy on the shelf, play with it on the touch screen.
// ============================================================================
'use strict';

const TOYS = [
  { id: 'caricias', name: 'Caricias', how: 'Frota a Bule, tócale la nariz… ¡mímalo!', need: 0 },
  { id: 'pizarra', name: 'Pizarra', how: 'Dibuja con tizas de colores y sellos, como la de la puerta.', need: 1 },
  { id: 'piano', name: 'Piano Guau', how: 'Cada perrete ladra una nota. ¡Toca una canción!', need: 3 },
];
const clearedCount = () => STORY_STAGES.filter(id => SAVE.cleared[id]).length + (SAVE.cleared.superwestie ? 1 : 0);
const toyOpen = t => clearedCount() >= t.need;

const TOY = { sel: null, playing: null };
function toysUpdate(M, dt) {
  if (TOY.playing) { TOY_IMPL[TOY.playing].update(dt); if (IN.tap && IN.y > 150 && IN.x > 196 && IN.y < 168) { TOY.playing = null; sfx('back'); } return; }
  TOYS.forEach((t, i) => {
    const x = 20 + i * 76, y = 34, hit = IN.x >= x && IN.x < x + 64 && IN.y >= y && IN.y < y + 90;
    if (IN.tap && hit) {
      if (!toyOpen(t)) { sfx('buzz', { vol: .4 }); TOY.sel = t.id; return; }
      if (TOY.sel === t.id) { TOY.playing = t.id; TOY_IMPL[t.id].enter(); sfx('slam'); }
      else { TOY.sel = t.id; sfx('select'); }
    }
  });
  void M; void dt;
}
function toysDrawBot(M, g) {
  if (TOY.playing) { TOY_IMPL[TOY.playing].drawBot(g); panel(g, 196, 150, 56, 18, '#ffffff', { r: 4 }); txt(g, 'SALIR', 224, 155, INK, { align: 'c', bold: true }); return; }
  // a wooden shelf with the three toys
  rect(g, 8, 126, 240, 5, RAMP.wood[3]); rect(g, 8, 126, 240, 1, RAMP.wood[4]); rect(g, 8, 131, 240, 1, INK);
  TOYS.forEach((t, i) => {
    const x = 20 + i * 76, y = 34, open = toyOpen(t), sel = TOY.sel === t.id, bob = sel ? Math.sin(NOW * 6) * 2 : 0;
    panel(g, x, y + bob, 64, 90, open ? '#ffffff' : '#c8c6d3', { r: 6, line: sel ? C.pink : INK, lo: '#dce7ea' });
    if (open) toyIcon(g, t.id, x + 32, y + 40 + bob); else { mord(g, '?', x + 32, y + 26 + bob, { u: 2, r: 2.2 }); }
    tiny(g, open ? t.name : '???', x + 32, y + 78 + bob, INK, { align: 'c' });
  });
  txt(g, TOY.sel ? (toyOpen(TOYS.find(t => t.id === TOY.sel)) ? 'Toca otra vez para jugar' : 'Supera más fases para abrirlo') : 'Elige un juguete', SW / 2, 146, INK, { align: 'c' });
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
  void M;
}
function toyIcon(g, id, x, y) {
  if (id === 'caricias') drawS(g, buleHead('love'), x, y, {});
  else if (id === 'pizarra') drawS(g, aFrameSign(), x, y + 30, { ax: .5, ay: 1, s: 1 });
  else { for (let i = 0; i < 7; i++) { rect(g, x - 28 + i * 8, y - 14, 8, 30, INK); rect(g, x - 27 + i * 8, y - 13, 6, 28, '#ffffff'); } for (const i of [0, 1, 3, 4, 5]) rect(g, x - 24 + i * 8, y - 14, 5, 17, INK); }
}

const TOY_IMPL = {
  // ------------------------------------------------ Caricias: pet Bule --------
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
      drawWestieSit(g, 128 + (this.wag > 0 ? Math.sin(NOW * 30) * 1.5 : 0), 150 + 36, this.ex, { tilt: this.sneeze > 0 ? Math.sin(this.sneeze * 30) * .3 : 0 });
      this.fx.draw(g);
    },
    drawTop(g) {
      rect(g, 0, 0, SW, SH, RAMP.pink[3]); for (let i = 0; i < 12; i++) drawHeart(g, (i * 53 + NOW * 12) % SW, (i * 37 + NOW * 6) % SH, RAMP.pink[4], 1.2);
      mord(g, 'CARICIAS', SW / 2, 20, { u: 1.6, r: 1.8, rim: 2, sy: 2, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] });
      txt(g, 'FELICIDAD DE BULE', SW / 2, 80, INK, { align: 'c', bold: true });
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
