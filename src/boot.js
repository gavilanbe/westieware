// ============================================================================
//  boot — the DS-style health & safety screen (a parody), then the
//  Westie BLVRD sign drops in and barks, then the title.
// ============================================================================
'use strict';
const BOOT = {
  enter() {
    this.t = 0; this.st = 'warn'; this.k = 0; this.fx = new FX();
    // build the heavy pictures while the player reads
    for (const f of [() => wbSign(), () => buleHead('happy'), () => buleHead('wink'), () => salonBackdrop(), () => salonBotBackdrop(), () => anahiSprite('headhand', .62), () => anahiSprite('thumbs', .9), () => anahiSprite('idle', .9), () => STAGES.anahi.chibi('walk0', 0), () => STAGES.anahi.chibi('walk1', 0), () => westieSide(.62, 'stand', 'normal'), () => westieSide(1, 'wag', 'happy'), () => lifeWestie(false), () => lifeWestie(true), () => velvetChair()]) warm(f);
  },
  update(dt) {
    this.t += dt; this.k += dt; this.fx.update(dt);
    if (this.st === 'warn') {
      if (this.t > .6 && (IN.tap || IN.anyTap)) { this.st = 'logo'; this.k = 0; sfx('select'); }
    } else if (this.st === 'logo') {
      if (this.k > .55 && !this.barked) { this.barked = 1; sfx('bark', { n: 2 }); this.fx.burst(SW / 2, 70, 16, { k: 'star', c: [C.yellow, '#ffffff'], sp0: 50, sp1: 150 }); shake('top', 2, .2); }
      if (this.k > 2.6 || (this.k > 1 && IN.anyTap)) { this.st = 'out'; transit('white', TITLE, null, .6); }
    }
  },
  drawTop(g) {
    if (this.st === 'warn') {
      rect(g, 0, 0, SW, SH, '#ffffff');
      // warning triangle with a paw
      polyPx(g, [[128, 14], [146, 44], [110, 44]], INK); polyPx(g, [[128, 18], [142, 42], [114, 42]], '#ffd23f'); drawPawPrint(g, 128, 34, INK);
      txt(g, 'AVISO: SALUD Y SEGURIDAD', SW / 2, 52, INK, { align: 'c', bold: true });
      hline(g, 30, 226, 64, '#c8c6d3');
      txt(g, 'ANTES DE JUGAR, ACARICIA A TU PERRO.', SW / 2, 74, '#44424f', { align: 'c' });
      txt(g, 'Si no tienes perro, pide cita para', SW / 2, 90, '#44424f', { align: 'c' });
      txt(g, 'acariciar uno en Westie BLVRD.', SW / 2, 101, '#44424f', { align: 'c' });
      txt(g, 'Información importante sobre tu pelo en:', SW / 2, 124, '#6b6977', { align: 'c' });
      txt(g, 'instagram.com/westie.blvrd', SW / 2, 136, '#2a7356', { align: 'c', bold: true });
      hline(g, 30, 226, 152, '#c8c6d3');
      txt(g, 'Juego de fans · no es un producto de Nintendo', SW / 2, 164, '#9896a4', { align: 'c' });
    } else {
      rect(g, 0, 0, SW, SH, '#ffffff');
      const k = this.k, drop = k < .5 ? -120 * (1 - E.outBounce(k / .5)) : 0;
      // Keiko pops up from behind the sign when it barks, then ducks back down
      const pk = k < .5 ? 0 : k < 1.9 ? spring(k - .5, 2.6, 7) : Math.max(0, 1 - (k - 1.9) * 3), tilt = Math.sin(k * 9) * .06 * (k < 1.2 ? 1 : 0);
      if (pk > 0) drawS(g, keikoHead(k < 1.4 ? 'happy' : 'wink'), SW / 2 + 42, 78 - pk * 17, { rot: tilt, s: .62 });
      drawS(g, wbSign(), SW / 2, 84 + drop, {});
      if (k > .55 && k < 1.5) { const bk = spring(k - .55, 3, 8); g.save(); g.translate(SW / 2 + 76, 30); g.scale(bk, bk); panel(g, -24, -9, 48, 16, '#ffffff', { r: 5 }); polyPx(g, [[-14, 6], [-22, 13], [-8, 6]], '#ffffff'); txt(g, '¡GUAU!', 0, -5, INK, { align: 'c', bold: true }); g.restore(); }
      this.fx.draw(g);
    }
  },
  drawBot(g) {
    rect(g, 0, 0, SW, SH, '#ffffff');
    if (this.st === 'warn') {
      if (fl(this.t * 1.6) % 2 === 0 || this.t < .6) txt(g, 'Toca la pantalla táctil para continuar.', SW / 2, 90, '#44424f', { align: 'c' });
    } else {
      const k = this.k;
      if (k > .7) { const a = clamp((k - .7) * 3, 0, 1); g.globalAlpha = a; txt(g, 'presenta', SW / 2, 60, '#6b6977', { align: 'c' }); g.globalAlpha = 1; }
      if (k > 1.1) { g.globalAlpha = clamp((k - 1.1) * 3, 0, 1); txt(g, 'un juego hecho con mucho cariño', SW / 2, 110, '#9896a4', { align: 'c' }); txt(g, 'para Anahí y sus peludos', SW / 2, 122, '#9896a4', { align: 'c' }); drawHeart(g, SW / 2, 142, '#ff4060', 1.4 + Math.max(0, Math.sin(k * 7)) * .25); g.globalAlpha = 1; }
    }
  },
};
