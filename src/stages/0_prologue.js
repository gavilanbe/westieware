// ============================================================================
//  PRÓLOGO — how Westie BLVRD discovered micro-grooming.
//  (After WarioWare: Touched!'s opening: the manhole, the guru, the stylus.)
// ============================================================================
'use strict';

const SONG_MORNING = { spb: 4, tracks: [
  { i: 'vib', v: .55, n: 'E5 . G5 . B5 . A5 . G5 . E5 . D5 . E5 . G5 . . . . . . . C5 . E5 . G5 . F#5 . E5 . D5 . C5 . D5 . B4 . . . . . . .' },
  { i: 'bass', v: .75, n: 'C3 . . . G3 . . . A2 . . . E3 . . . F2 . . . C3 . . . G2 . . . D3 . . . C3 . . . G3 . . . A2 . . . E3 . . . F2 . . . G2 . . . C3 . . . . . . .' },
  { i: 'd', v: .45, n: 'k . z . r . z . k . z . r . z z' }], loop: true };
const SONG_PANIC = { spb: 4, tracks: [
  { i: 'p25', v: .55, n: 'C5 C#5 C5 C#5 C5 C#5 C5 C#5 D5 D#5 D5 D#5 D5 D#5 D5 D#5' },
  { i: 'bass', v: .85, n: 'C2 C2 C3 C2 C2 C2 C3 C2 D2 D2 D3 D2 D2 D2 D3 D2' },
  { i: 'd', v: .8, n: 'k h s h k h s h k h s h k s s s' }], loop: true };
const SONG_SEWER = { spb: 4, tracks: [
  { i: 'bell', v: .45, n: 'A4 . . . E5 . . . D5 . . . C5 . . . B4 . . . E5 . . . A4 - - - . . . .' },
  { i: 'pad', v: .5, n: 'A3+C4+E4 - - - - - - - - - - - - - - - F3+A3+C4 - - - - - - - E3+G#3+B3 - - - - - - -' },
  { i: 'd', v: .4, n: 'T . . . . . . . w . . . . . . . T . . . . . . . w . w . . . . .' }], loop: true };
const SONG_EUREKA = { spb: 4, tracks: [
  { i: 'brass', v: .6, n: 'C5 - E5 - G5 - C6 - - - B5 - C6 - D6 - E6! - - - - - - - . . . . . . . .' },
  { i: 'bell', v: .45, n: 'C6 E6 G6 C7 . . . . . . . . . . . . E6 G6 C7 E7 . . . . . . . . . . . .' },
  { i: 'bass', v: .85, n: 'C3 . C3 . E3 . G3 . F3 . F3 . G3 . G3 . C3 . . . . . . . . . . . . . . .' },
  { i: 'd', v: .8, n: 'k . h . s . h . k . h . s s s s k+x . . . . . . . . . . . . . . .' }] };

// ---------------------------------------------------------------- props -----
function guruRat(frame = 0) {
  return mdl('guru' + frame, () => {
    const Gr = RAMP.grey, Pk = RAMP.pink, Fw = RAMP.fur;
    const body = SD.ellipse(32, 44, 15, 13), head = SD.ellipse(32, 24, 11, 10), snout = SD.ellipse(32, 30, 5, 4);
    const earL = SD.circle(20, 15, 6.5), earR = SD.circle(44, 15, 6.5), inL = SD.circle(20, 15, 4), inR = SD.circle(44, 15, 4);
    const beardS = SD.poly([[24, 30], [40, 30], [36, 52], [32, 60], [28, 52]]);
    const beard = SD.tufts(beardS, 32, 40, 1.5, 12, frame, 2);
    const legs = SD.union(SD.ellipse(22, 55, 10, 4), SD.ellipse(42, 55, 10, 4));
    const tail = SD.curve([46, 52], [60, 52], [58, 36], 2, 1);
    return model(64, 64, [
      { f: tail, ramp: Pk, z: 0, th: 2 },
      { f: earL, ramp: Gr, z: .5, th: 4 }, { f: earR, ramp: Gr, z: .5, th: 4 },
      { f: inL, ramp: Pk, z: .6, th: 2, amb: .5 }, { f: inR, ramp: Pk, z: .6, th: 2, amb: .5 },
      { f: legs, ramp: Gr, z: .8, th: 4 },
      { f: body, ramp: RAMP.purple, z: 1, th: 10 }, // a purple robe
      { f: head, ramp: Gr, z: 2, th: 8 }, { f: snout, ramp: Gr, z: 2.5, th: 3 },
      { f: beard, fs: beardS, ramp: Fw, z: 3, th: 6, tex: clumpTex(3, .2, 2, 1.8) },
    ], { post: g => {
      for (const ex of [26, 38]) { ringPx(g, ex, 23, 4, RAMP.gold[3]); rect(g, ex - 1, 22, 2, 2, INK); px(g, ex - 1, 22, '#fff'); }
      hline(g, 30, 34, 23, RAMP.gold[3]);
      disc(g, 32, 29, 1.6, Pk[1]);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) linePx(g, 32 + s * 4, 31 + i, 32 + s * 12, 29 + i * 2, '#dfe3f1');
    } });
  });
}
function goldComb(g, x, y, rot, glow) {
  const img = mdl('goldCombBig', () => {
    const c = mkCanvas(34, 14), G = RAMP.gold; const q = c.g;
    rect(q, 0, 0, 34, 6, INK); rect(q, 1, 1, 32, 4, G[3]); rect(q, 1, 1, 32, 1, G[4]); rect(q, 1, 4, 32, 1, G[1]);
    for (let i = 1; i < 33; i += 3) { rect(q, i, 6, 2, 8, INK); rect(q, i, 6, 1, 7, G[2]); }
    return c;
  });
  if (glow) { for (let r = 22; r > 6; r -= 5) { g.globalAlpha = .12; disc(g, x, y, r + Math.sin(NOW * 8) * 2, '#fff7ae'); } g.globalAlpha = 1; }
  drawS(g, img, x, y, { rot });
}
function phoneChat(g, n, t) {
  // a big phone with a flood of WhatsApp messages
  panel(g, 64, 4, 128, 196, '#1d1424', { r: 12, line: INK });
  rect(g, 70, 18, 116, 172, '#e8dfd3');
  rect(g, 70, 18, 116, 18, '#075e54'); disc(g, 80, 27, 5, '#ffffff'); tiny(g, 'WB', 80, 25, RAMP.green[2], { align: 'c' }); txt(g, 'Westie BLVRD', 90, 23, '#ffffff');
  const msgs = ['¿Tenéis hueco hoy? 🐾', '¡Se ha revolcado en barro!', 'Corte + baño porfa', '¡URGENTE! Rastas', '¿Stripping hoy?', 'Uñas y oídos 🙏', '¡Mañana boda!', '¿Y para gatos?'];
  const shown = Math.min(msgs.length, fl(t * 5));
  for (let i = 0; i < shown; i++) {
    const m = msgs[i], y = 42 + i * 17 - Math.max(0, shown - 8) * 17, w = Math.min(108, txtW(m) + 10);
    if (y < 38 || y > 180) continue;
    const k = spring(t - i / 5, 3, 8);
    g.save(); g.translate(74, y); g.scale(k, 1);
    panel(g, 0, 0, w, 14, '#ffffff', { r: 4, line: '#b9b0a3' }); txt(g, m.replace('🐾', '♥').replace('🙏', '!'), 5, 4, INK);
    g.restore();
  }
  // unread badge
  const badge = n >= 99 ? '99+' : String(n), bw = txtW(badge) + 8;
  panel(g, 186 - bw / 2, 6, bw, 13, '#ff4060', { r: 6 }); txt(g, badge, 186, 9, '#ffffff', { align: 'c', bold: true });
}
// a crowd of dogs in a queue down the street
const QUEUE_RAMPS = [RAMP.fur, RAMP.apricot, RAMP.grey, RAMP.merleBlue, RAMP.caramel, RAMP.black, RAMP.cream, RAMP.mud];
function queueHead(ramp) { return mdl('qhead' + ramp[0], () => { const H = buleHead(pick(['normal', 'wow', 'happy']), ramp); return H; }); }

// ---------------------------------------------------------------- the cut ---
defCut('prologo', {
  song: SONG_MORNING,
  shots: [
    { dur: 4.2, box: 'none', tall(g, t) {
        streetTall(g, 1, 0, t, { sunUp: Math.min(1, t / 4) });
        for (let i = 0; i < 4; i++) { const x = (60 + i * 50 + t * 30) % 300 - 20, y = 60 + Math.sin(t * 4 + i) * 6; linePx(g, x - 3, y, x, y + 2, INK); linePx(g, x, y + 2, x + 3, y, INK); }
        const k = clamp(t / .6, 0, 1); caption(g, 'Barcelona · Carrer de Viladomat, 185', 22 - (1 - k) * 40);
      } },
    { dur: 0, box: 'bot', boxY: 6, wait: 3.2, lines: [['anahi', '¡Buenos días, Westie BLVRD! ¡A peinar se ha dicho!']],
      sfx: [[1.6, 'ratchet'], [1.7, 'ratchet'], [1.8, 'ratchet'], [1.9, 'ratchet'], [2.0, 'ratchet'], [2.35, 'sparkle']],
      tall(g, t) {
        const shut = clamp(1 - (t - 1.5) / .8, 0, 1);
        streetTall(g, shut, shut < 1 ? 1 : 0, t, { sunUp: 1 });
        const gy = SH + HINGE, walkK = clamp(t / 1.4, 0, 1), ax = lerp(-30, 110, E.outQ(walkK));
        const walking = walkK < 1, leg = walking && fl(t * 7) % 2;
        drawAnahiFull(g, ax, gy + 128 + (walking ? -Math.abs(Math.sin(t * 14)) * 2 : 0), t > 1.5 ? (t > 2.3 ? 'cheer' : 'thumbs') : walking && leg ? 'idle' : 'idle', t);
        if (t > 2.3 && t < 3) { const k = (t - 2.3) / .7; for (let i = 0; i < 6; i++) drawStar(g, 45 + i * 20, gy + 22 + Math.sin(i + t * 9) * 4, 3 * (1 - k) + 1, '#fff27a'); }
      } },
    { dur: 0, lines: [['anahi', 'Keiko, arriba, dormilona. Hoy será un día tranquilo…'], ['keiko', 'Zzz… ¿guau?… zzz…']],
      top(g, t) {
        g.drawImage(salonBackdrop(), 0, 0);
        drawKeikoSit(g, 58, 126, 'happy', { sy: 1 + Math.sin(t * 2) * .02 });
        const zk = (t * .8) % 1; txt(g, 'z', 74 + zk * 10, 56 - zk * 20, '#ffffff', { out: INK }); txt(g, 'Z', 80 + ((zk + .5) % 1) * 12, 48 - ((zk + .5) % 1) * 24, '#ffffff', { out: INK, bold: true });
        drawAnahiFull(g, 190, 170, 'talk', t);
      },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawPortalFrame(g, 'mirror', 64, 24, 128, 96, t); rect(g, 64, 24, 128, 96, '#dfe9ee'); for (let i = 0; i < 5; i++) linePx(g, 90 + i * 14, 24, 70 + i * 14, 119, '#ffffff'); } },
    { dur: 0, song: SONG_PANIC, lines: [['narr', '*bzzz* *bzzz* *bzzz*'], ['anahi', '¿¡NOVENTA Y NUEVE CITAS!? ¿¡PARA HOY!?']], sfx: [[0, 'buzz'], [.3, 'buzz'], [.6, 'buzz'], [.9, 'buzz'], [1.2, 'buzz']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 128, 176, 'lose', t); speedLines(g, 128, 90, t, '#ffffff', 36, 50); },
      bot(g, t) { rect(g, 0, 0, SW, SH, '#2a2440'); phoneChat(g, Math.min(99, fl(t * 30)), t); } },
    { dur: 3.4, box: 'none', sfx: [[.2, 'bark', { n: 2 }], [.9, 'yip'], [1.4, 'bark', { pitch: .7 }], [2.0, 'bark', { n: 3, pitch: 1.3 }]],
      tall(g, t) {
        // the queue: from the door, down the street, to the horizon
        const gy = SH + HINGE;
        bandsV(g, 0, 0, SW, 120, ['#7fb2ff', '#a0c4ff', '#e6a0c4', '#f4845f']);
        eixampleFacade(g, 0, 60, SW, 260, 7);
        fillPat(g, panotPat(), 0, gy + 40, SW, 170);
        rect(g, 0, 250, SW, 12, '#d8c29c');
        for (let i = 26; i >= 0; i--) {
          const k = i / 26, y = lerp(gy + 150, 150, Math.sqrt(k)), x = SW / 2 + Math.sin(i * 1.7) * lerp(60, 8, k);
          const bob = Math.abs(Math.sin(t * 8 + i)) * lerp(4, 1, k);
          if (k > .55) { disc(g, x, y - bob, lerp(4, 2, (k - .55) / .45), INK); disc(g, x, y - bob, lerp(3, 1.3, (k - .55) / .45), pick(['#ffffff', '#f2b973', '#9896a4'])); }
          else drawS(g, i < 6 ? queueHead(QUEUE_RAMPS[i % QUEUE_RAMPS.length]) : lifeWestie(false), x, y - bob, { s: 1 });
        }
        caption(g, '…y la cola llegaba hasta la Sagrada Família', 22);
      } },
    { dur: 3.6, box: 'none', sfx: [[.2, 'whoosh'], [.9, 'tick'], [1.2, 'tick'], [1.6, 'boing'], [2.2, 'whine'], [2.6, 'swoosh'], [3.1, 'splash']],
      tall(g, t) {
        streetTall(g, 0, 1, t, { sunUp: 1 });
        const gy = SH + HINGE;
        drawAnahiFull(g, 90, gy + 128, t < 1.8 ? 'lose' : 'boss', t);
        // the scissors spin out of her hands, bounce, and drop into the manhole
        const k = clamp(t / 1.8, 0, 1), sx = lerp(100, 120, k), sy = gy + 80 + (k < .5 ? -Math.sin(k * 2 * Math.PI) * 40 : (k - .5) * 2 * 110);
        if (t < 1.9) drawS(g, scissorsSpr(), sx, Math.min(sy, gy + 182), { rot: t * 14, s: 2 });
        if (t > 1.7 && t < 2.2) shout(g, '¡MIS TIJERAS!', 90, gy + 30, t - 1.7);
        // Keiko dives after them — from the door to the manhole and down
        if (t > 2.3) { const bk = clamp((t - 2.3) / 1, 0, 1); drawS(g, keikoSide(.7, 'wag', 'wow'), lerp(150, 120, bk), lerp(gy + 120, gy + 200, E.inQ(bk)), { rot: bk * 1.4, ax: .5, ay: .5 }); }
        if (t > 3.1) { g.globalAlpha = clamp((t - 3.1) * 3, 0, 1); rect(g, 0, 0, SW, TALL_H, INK); g.globalAlpha = 1; }
      } },
    { dur: 0, song: SONG_SEWER, lines: [['guru', 'Pequeña westie… ¿buscabas esto?'], ['keiko', '¡¿Guau?!'], ['guru', 'Y llévate también el Peine de Oro. Con él, cualquier arreglo… ¡en cuatro segundos!'], ['keiko', '¡GUAU!'], ['guru', '¡Eh, eh! ¡Que es de PRÉSTAMO!']],
      sfx: [[0, 'splash', { pitch: .6 }]],
      top(g, t) {
        rect(g, 0, 0, SW, SH, '#0d1d24');
        for (let y = 0; y < SH; y += 8) for (let x = ((y / 8) % 2) * 8; x < SW; x += 16) { rect(g, x, y, 15, 7, '#16303a'); rect(g, x, y, 15, 1, '#1f4250'); }
        // light shaft from the manhole
        g.globalAlpha = .22; polyPx(g, [[108, 0], [148, 0], [190, SH], [66, SH]], '#fff7ae'); g.globalAlpha = 1;
        ellipsePx(g, 128, 4, 22, 6, '#fff7ae');
        const bk = clamp(t / .8, 0, 1); drawS(g, keikoSide(.7, 'wag', 'wow'), 128, lerp(-20, 170, E.inQ(bk)), { rot: 1.2 - bk * 1.2 });
      },
      bot(g, t, st, cut) {
        rect(g, 0, 0, SW, SH, '#0d1d24');
        for (let y = 0; y < 120; y += 8) for (let x = ((y / 8) % 2) * 8; x < SW; x += 16) { rect(g, x, y, 15, 7, '#16303a'); rect(g, x, y, 15, 1, '#1f4250'); }
        rect(g, 0, 120, SW, 72, '#1b4a44'); for (let x = 0; x < SW; x += 4) px(g, x, 121 + Math.sin(x * .2 + t * 3) * 1.5, '#3d8f7a');
        const li = cut.li, fly = li >= 4;
        // the guru levitates on a rubber duck
        const gy2 = 70 + Math.sin(t * 2) * 3;
        disc(g, 100, gy2 + 34, 12, INK); disc(g, 100, gy2 + 33, 11, '#ffdf4f'); disc(g, 108, gy2 + 26, 6, INK); disc(g, 108, gy2 + 26, 5, '#ffdf4f'); rect(g, 112, gy2 + 25, 4, 2, '#ff9f4f');
        drawS(g, guruRat(fl(t * 2) % 2), 100, gy2 + 4, { ax: .5, ay: .5 });
        if (li < 2) drawS(g, scissorsSpr(), 124, gy2 - 6, { s: 2, rot: -.4 });
        if (li >= 2 && li < 3) { goldComb(g, 124, gy2 - 6, Math.sin(t * 3) * .2, true); drawS(g, scissorsSpr(), 80, gy2 - 8, { s: 2, rot: -.4 }); }
        // Keiko on a floating crate, then dashing off with both
        const bx = fly ? 180 + (t - (cut.flyT || (cut.flyT = t))) * 200 : 180;
        if (bx < 300) drawS(g, keikoSide(.7, fly ? 'wag' : 'stand', li === 3 ? 'wow' : 'normal'), bx, 118, { ax: .5, ay: 1, flip: true });
        if (li === 3) { goldComb(g, bx - 30, 96, 0, true); }
        if (li >= 4 && t % .2 < .1) g.fx && 0;
      } },
    { dur: 0, song: SONG_EUREKA, songLoop: false, lines: [['anahi', '¿Mis tijeras? ¡Keiko, eres un sol! ¿Y esto…?'], ['anahi', '¿Un peine… de oro?']],
      sfx: [[.1, 'whoosh'], [.9, 'sparkle'], [1.4, 'ding']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 180, 170, t < 1.4 ? 'boss' : 'win', t); const k = clamp((t - .6) / .8, 0, 1); goldComb(g, lerp(40, 208, E.outQ(k)), lerp(150, 86, k) - Math.sin(k * Math.PI) * 95, t * 12 * (1 - k), true); if (t > 1.4) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; drawStar(g, 200 + Math.cos(a) * 24, 80 + Math.sin(a) * 20, 2.5, '#fff27a'); } },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawS(g, keikoSide(1, 'wag', 'happy'), 128 + Math.sin(t * 20) * (t < .5 ? 3 : 0), 150, { ax: .5, ay: 1 }); drawS(g, scissorsSpr(), 170, 128, { s: 2, rot: -.2 }); } },
    { dur: 0, lines: [['anahi', '¡Ay, que viene uno lleno de barro! ¡Vamos a probarlo!']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 180, 170, 'ready', t); goldComb(g, 198, 106, -.5, true); },
      bot(g, t) { rect(g, 0, 0, SW, SH, '#b9cad0'); subwayTiles(g, 0, 0, SW, 60); drawS(g, buleHead('grr', RAMP.mud), 128, 110 + Math.sin(t * 5) * 2); for (let i = 0; i < 6; i++) disc(g, 128 + Math.sin(t * 7 + i) * 30, 150 + Math.cos(t * 5 + i) * 6, 3, '#5b3a1d'); } },
    { play: 'topos', bpm: 108, box: 'none', top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 180, 170, CUT.mg && CUT.mg.state === 'won' ? 'win' : 'speed', t, { snip: true }); goldComb(g, 150, 100, -.3, true); } },
    { dur: 0, song: SONG_EUREKA, songLoop: false, lines: [['anahi', '¡Limpio en cuatro segundos! ¡Brillante!'], ['anahi', 'Si cada perro me lleva cuatro segundos… ¡atiendo a toda Barcelona!'], ['keiko', '¡Guau, guau!']],
      top(g, t) { g.drawImage(salonBackdrop(), 0, 0); drawAnahiFull(g, 150, 170, 'win', t, { jump: Math.abs(Math.sin(t * 5)) * 5 }); goldComb(g, 178, 50, Math.sin(t * 4) * .3, true); },
      bot(g, t) { g.drawImage(salonBotBackdrop(), 0, 0); drawWestieSit(g, 90, 188, 'happy'); drawKeikoSit(g, 170, 188, 'love', { tilt: Math.sin(t * 3) * .4 }); for (let i = 0; i < 5; i++) drawStar(g, 40 + i * 44, 30 + Math.sin(t * 5 + i) * 6, 3, '#fff27a'); } },
    { dur: 4.2, box: 'none', sfx: [[.1, 'slam'], [1.6, 'slam'], [1.7, 'sparkle']], tall(g, t) {
        const G = RAMP.green;
        rect(g, 0, 0, SW, TALL_H, G[1]);
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .5; polyPx(g, [[SW / 2, TALL_H / 2], [SW / 2 + Math.cos(a) * 400, TALL_H / 2 + Math.sin(a) * 400], [SW / 2 + Math.cos(a + .26) * 400, TALL_H / 2 + Math.sin(a + .26) * 400]], G[2]); }
        mord(g, '¡MICRO-ESTILISMO', SW / 2, 60, { u: 1.45, r: 1.7, rim: 2, sy: 3 }, { anim: i => ({ s: Math.max(0, spring(t - i * .03, 2.4, 7)) }) });
        mord(g, 'CANINO!', SW / 2, 100, { u: 2.6, r: 2.7, rim: 2, sy: 3, fill: ['#ffffff', '#ffd1e4', '#ff5d9e'] }, { anim: i => ({ s: Math.max(0, spring(t - .4 - i * .05, 2.4, 7)) }) });
        if (t > 1.5) drawLogo(g, SW / 2, SH + HINGE + 70, t - 1.5);
      } },
  ],
});
