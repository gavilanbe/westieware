// ============================================================================
//  BONUS BOSS — El Inspector de Hacienda (¡PAPELEO!), unlocked in Juguetes.
//  He turns up at Westie BLVRD at the worst moment. Hand him the form he asks
//  for (tap it) while clients' dogs pop up over the counter and the phone
//  rings. His patience is the clock. The pay-off: "APROBADO"… and his own
//  scruffy dog: "¿Tienes hueco para un corte?".
// ============================================================================
'use strict';

const HACIENDA_SONG = { spb: 4, loop: true, tracks: [
  { i: 'brass', v: .5, n: 'E4 . G4 . B4 . G4 . A4 . C5 . B4 . G4 . E4 . G4 . B4 . E5 . D#5 . B4 . F#4 . B4 .' },
  { i: 'pluck', v: .45, n: 'E5 E5 . E5 G5 . E5 . A5 A5 . A5 G5 . F#5 . E5 E5 . E5 G5 . B5 . C6 B5 A5 G5 F#5 . D#5 .' },
  { i: 'bass', v: .9, n: 'E2 . E2 E3 . E2 B2 . A2 . A2 A3 . A2 E3 . E2 . E2 E3 . E2 B2 . B1 . B1 B2 . B1 F#2 .' },
  { i: 'd', v: .85, n: 'k r h r s r h r k r h r s r s r k r h r s r h r k k h r s s s+x s' }] };

// his own dog, for the punchline: a scruffy grey mop with a tongue
function hacScruffy() {
  return mdl('hacScruffy', () => {
    const G = ['#5d5b69', '#8f8c99', '#c4c1cc', '#eceaf2'];
    const bodyS = SD.ellipse(24, 26, 14, 11), headS = SD.circle(24, 13, 10);
    return model(48, 42, [
      { f: SD.shag(bodyS, 2.6, .35, 2), fs: bodyS, ramp: G, z: 0, th: 8, tex: clumpTex(3.5, .3, 3, 1.5) },
      { f: SD.shag(headS, 2.8, .4, 6), fs: headS, ramp: G, z: 1, th: 8, tex: clumpTex(3, .3, 5, 1.6) },
    ], { post: g => { disc(g, 24, 16, 2.2, INK); px(g, 23, 15, '#6e6390'); rect(g, 22, 19, 5, 4, RAMP.pink[2]); rect(g, 23, 19, 3, 1, RAMP.pink[1]); for (const x of [18, 29]) { hline(g, x - 2, x + 2, 11, G[0]); px(g, x, 12, '#ffffff'); } } });
  });
}
// the counter top at Westie BLVRD, seen from above (bottom screen)
function hacCounter() {
  return mdl('hacCounter', () => {
    const c = mkCanvas(SW, SH), g = c.g, CR = RAMP.cream;
    rect(g, 0, 0, SW, SH, CR[3]);
    for (let y = 0; y < SH; y += 6) for (let x = (y / 6 % 2) * 24; x < SW; x += 48) rect(g, x, y, 24, 1, CR[2]);
    for (let i = 0; i < 140; i++) px(g, hash2(i, 3) * SW, hash2(3, i) * SH, CR[4]);
    rect(g, 0, 0, SW, 8, RAMP.gold[2]); rect(g, 0, 8, SW, 2, RAMP.gold[1]); rect(g, 0, 1, SW, 1, RAMP.gold[4]);
    rect(g, 0, 176, SW, 16, CR[2]); rect(g, 0, 176, SW, 2, RAMP.gold[2]); rect(g, 0, 178, SW, 1, RAMP.gold[4]);
    // pen pot with Anahí's scissors, the little WB bell
    rect(g, 226, 18, 18, 22, INK); rect(g, 227, 19, 16, 20, RAMP.green[2]); rect(g, 227, 19, 16, 3, RAMP.green[3]);
    drawS(g, scissorsSpr(), 232, 14, { rot: -1.4 }); linePx(g, 238, 18, 242, 6, INK); px(g, 242, 5, '#e23b4e');
    disc(g, 16, 30, 7, INK); disc(g, 16, 30, 6, RAMP.gold[3]); disc(g, 14, 28, 2, RAMP.gold[4]); rect(g, 15, 21, 3, 3, INK);
    return c;
  });
}
function hacPhone(ring) {
  return mdl('hacPhone' + (ring ? 'R' : ''), () => {
    const c = mkCanvas(40, 30), g = c.g, CR = ['#c9b99a', '#efe3c8', '#fffaf0'];
    polyPx(g, [[5, 28], [35, 28], [31, 12], [9, 12]], INK); polyPx(g, [[6, 27], [34, 27], [30, 13], [10, 13]], CR[1]); hline(g, 10, 30, 14, CR[2]);
    for (const [x, y] of [[14, 18], [20, 18], [26, 18], [14, 22], [20, 22], [26, 22]]) { disc(g, x, y, 1.6, INK); px(g, x, y, CR[0]); }
    const lift = ring ? -2 : 0; rect(g, 4, 6 + lift, 32, 6, INK); rect(g, 5, 7 + lift, 30, 4, CR[1]); rect(g, 3, 5 + lift, 7, 8, INK); rect(g, 30, 5 + lift, 7, 8, INK); rect(g, 4, 6 + lift, 5, 6, CR[1]); rect(g, 31, 6 + lift, 5, 6, CR[1]);
    return c;
  });
}
const HAC_DOGS = () => [RAMP.fur, RAMP.apricot, RAMP.grey, RAMP.caramel, RAMP.cream];

defMG({
  id: 'hacienda', stage: 'bonus', boss: true, name: 'El Inspector de Hacienda', cmd: '¡PAPELEO!', mech: 'tap', beats: 16,
  how: 'Dale el formulario que pide y atiende a perros y teléfono antes de que pierda la paciencia',
  song: () => HACIENDA_SONG,
  init(g) {
    g.rounds = [4, 5, 6][g.level - 1]; g.round = 0; g.patience = 100; g.pile = 3;
    g.used = []; g.forms = []; g.fly = null; g.denyT = -9; g.stampT = -9; g.nextAt = .4;
    g.dogs = []; g.dogT = 1.3; g.phone = { ring: false, t: 0, next: [5.5, 4.5, 3.6][g.level - 1] };
    g.mood = 'neutral'; g.endT = -1; g.hitT = -9;
  },
  newRound(g) {
    const pool = MODELO_REQ.filter(r => !g.used.includes(r.n));
    g.req = pool[fl(g.r(pool.length))]; g.used.push(g.req.n);
    const n = [3, 4, 5][g.level - 1], opts = [g.req.n], wr = shuffle(MODELO_REQ.filter(r => r.n !== g.req.n).map(r => r.n).concat(MODELO_FAKE));
    while (opts.length < n) opts.push(wr.pop());
    shuffle(opts);
    const slots = shuffle([[46, 52], [110, 48], [174, 52], [68, 116], [134, 118], [200, 114], [30, 118]]).slice(0, n);
    g.forms = opts.map((num, i) => ({ num, x: -40, y: slots[i][1], tx: slots[i][0], ty: slots[i][1], rot: g.r(-.15, .15), wob: g.r(TAU) }));
    g.shufAt = g.level >= 2 ? g.t + [9, 1.4, 1][g.level - 1] : -1;
    sfx('swoosh', { pitch: .9 }); g.pile++;
  },
  update(g, dt) {
    if (g.state === 'play') {
      g.patience -= [2, 2.8, 3.6][g.level - 1] * dt;
      // rounds
      if (!g.forms.length && !g.fly && g.t > g.nextAt) this.newRound(g);
      for (const f of g.forms) { f.x = lerp(f.x, f.tx, .16); f.y = lerp(f.y, f.ty, .16); f.wob += dt * 3; }
      if (g.shufAt > 0 && g.t > g.shufAt && g.forms.length) { const ps = shuffle(g.forms.map(f => [f.tx, f.ty])); g.forms.forEach((f, i) => { f.tx = ps[i][0]; f.ty = ps[i][1]; }); g.shufAt = g.level >= 3 ? g.t + 1.6 : -1; sfx('swoosh', { pitch: 1.4, vol: .5 }); }
      // clients' dogs pop up over the counter edge
      g.dogT -= dt;
      if (g.dogT <= 0) {
        g.dogT = g.r(...[[2.2, 3], [1.6, 2.4], [1.2, 1.9]][g.level - 1]);
        const free = [40, 96, 152, 208].filter(x => !g.dogs.some(d => Math.abs(d.x - x) < 30 && d.st !== 'gone'));
        if (free.length) { g.dogs.push({ x: g.pick(free), t: 0, st: 'up', wait: [1.7, 1.45, 1.2][g.level - 1], ramp: g.pick(HAC_DOGS()) }); sfx('boing', { pitch: 1.7, vol: .35 }); }
      }
      for (const d of g.dogs) {
        d.t += dt;
        if (d.st === 'up' && d.t > d.wait + .25) { d.st = 'bark'; d.t = 0; g.patience -= 10; g.hitT = g.t; sfx('bark', { n: 2 }); g.shake(2, .15); }
        else if ((d.st === 'bark' || d.st === 'happy') && d.t > .6) d.st = 'gone';
      }
      g.dogs = g.dogs.filter(d => d.st !== 'gone');
      // the phone
      const P = g.phone; P.next -= dt;
      if (!P.ring && P.next <= 0) { P.ring = true; P.t = 0; }
      if (P.ring) { P.t += dt; if (FRAME % 18 === 0) sfx('blip', { pitch: 2.2 }); if (P.t > 2) { P.ring = false; P.next = g.r(3.5, 5.5); g.patience -= 8; g.hitT = g.t; sfx('buzz', { vol: .5 }); } }
      // taps: dogs and phone first (they're quick), then forms
      if (IN.tap) {
        const d = g.dogs.find(d => d.st === 'up' && Math.abs(IN.x - d.x) < 24 && IN.y > 128);
        if (d) { d.st = 'happy'; d.t = 0; sfx('gulp'); sfx('yip', { pitch: 1.4, delay: .08 }); g.fx.burst(d.x, 150, 6, { k: 'heart', c: '#ff5d9e', sp0: 20, sp1: 60 }); }
        else if (P.ring && dist(IN.x, IN.y, 212, 150) < 22) { P.ring = false; P.next = g.r(3.5, 5.5); sfx('select'); g.fx.add({ k: 'txt', s: '¡Ahora no!', x: 212, y: 128, life: .6, c: '#ffffff' }); }
        else if (!g.fly) {
          const f = g.forms.find(f => Math.abs(IN.x - f.x) < 26 && Math.abs(IN.y - f.y) < 32);
          if (f) {
            if (f.num === g.req.n) { g.fly = { f, t: 0 }; g.forms = g.forms.filter(q => q !== f); sfx('swoosh', { pitch: 1.6 }); }
            else { g.denyT = g.t; g.patience -= 20; g.hitT = g.t; sfx('stamp'); sfx('buzz'); HITSTOP = 4; g.shake(4, .25); buzz([40, 30, 40]); f.tx = f.tx + g.r(-10, 10); }
          }
        }
      }
      if (g.fly) {
        g.fly.t += dt;
        if (g.fly.t > .3 && !g.fly.done) {
          g.fly.done = true; g.stampT = g.t; g.round++; g.patience = Math.min(100, g.patience + 9); sfx('stamp'); sfx('coin', { delay: .1 }); HITSTOP = 3;
          g.forms.forEach(q => { q.tx = -60; }); // clear the counter for the next round
          if (g.round >= g.rounds) { g.win(); g.endT = g.t; g.mood = 'happy'; sfx('sparkle', { delay: .2 }); sfx('bark', { pitch: .8, delay: .9 }); }
          else g.nextAt = g.t + .6;
        }
        if (g.fly.t > .8) { g.fly = null; if (g.state === 'play') g.forms = []; }
      }
      if (g.patience <= 0) { g.patience = 0; g.lose(); g.endT = g.t; g.mood = 'angry'; sfx('boom'); g.shake(5, .4); }
      else g.mood = g.t - g.hitT < .6 || g.t - g.denyT < .6 ? 'angry' : g.patience < 35 ? 'glare' : 'neutral';
    }
  },
  draw(g, c) {
    c.drawImage(hacCounter(), 0, 0);
    // the paper pile grows with every round
    for (let i = 0; i < Math.min(14, g.pile); i++) { rect(c, 6 + (i % 2), 150 - i * 3, 34, 20, INK); rect(c, 7 + (i % 2), 151 - i * 3, 32, 18, i % 3 ? '#fdfbf5' : '#eef1f6'); }
    // forms on the counter
    for (const f of g.forms) drawS(c, modeloForm(f.num), f.x, f.y + Math.sin(f.wob) * 1, { rot: f.rot });
    if (g.fly) { const k = Math.min(1, g.fly.t / .3); drawS(c, modeloForm(g.fly.f.num), lerp(g.fly.f.x, 128, k), lerp(g.fly.f.y, -40, E.inQ(k)), { rot: g.fly.f.rot * (1 - k) }); }
    // the phone
    const P = g.phone, shakeX = P.ring ? Math.sin(g.t * 60) * 2 : 0;
    drawS(c, hacPhone(P.ring && fl(g.t * 12) % 2), 212 + shakeX, 152, {});
    if (P.ring) { txt(c, '¡RIIING!', 212, 126 + Math.sin(g.t * 20), '#e23b4e', { align: 'c', out: '#ffffff', bold: true }); ringPx(c, 212, 150, 18 + (g.t * 40 % 8), '#e23b4e'); }
    // dogs popping over the counter edge
    for (const d of g.dogs) {
      const up = d.st === 'up' ? Math.min(1, d.t / .22) : d.st === 'happy' ? 1 - Math.min(1, d.t / .4) : d.st === 'bark' ? 1 : 0;
      const ex = d.st === 'happy' ? 'love' : d.st === 'bark' ? 'grr' : 'wow';
      c.save(); c.beginPath(); c.rect(0, 0, SW, 178); c.clip();
      drawS(c, buleHead(ex, d.ramp), d.x, 204 - up * 60, {});
      c.restore();
      // paws on the counter edge
      if (up > .6) for (const s of [-1, 1]) { ellipsePx(c, d.x + s * 14, 176, 6, 4, INK); ellipsePx(c, d.x + s * 14, 175, 5, 3, d.ramp[3]); }
      if (d.st === 'bark') txt(c, '¡GUAU!', d.x, 124, '#ffffff', { align: 'c', out: INK, bold: true });
      if (d.st === 'up' && d.t > d.wait * .6 && fl(g.t * 8) % 2) txt(c, '!', d.x + 22, 138, '#e23b4e', { out: '#ffffff', bold: true });
    }
    // DENEGADO
    if (g.t - g.denyT < .7) { const k = spring(g.t - g.denyT, 2.6, 7); drawS(c, hacStamp('DENEGADO', '#e0283c'), 128, 90, { rot: -.18, s: lerp(2.4, 1, Math.min(1, k)) }); }
  },
  top(g, c) {
    c.drawImage(salonBackdrop(), 0, 0);
    c.globalAlpha = .35; rect(c, 0, 0, SW, SH, INK); c.globalAlpha = 1;
    // the inspector behind the reception counter
    const shake = g.mood === 'angry' ? Math.sin(g.t * 50) * 1.5 : 0;
    drawS(c, funcionario('inspector', g.mood), 70 + shake, 150, { ax: .5, ay: 1 });
    if (g.mood === 'angry') for (const s of [-1, 1]) { const k = (g.t * 2) % 1; disc(c, 70 + s * 18, 70 - k * 12, 3 + k * 3, '#ffffff'); }
    if (g.state === 'won' && g.t - g.endT > .6) { const k = spring(g.t - g.endT - .6, 2.4, 6); drawS(c, hacScruffy(), 108, 146 - Math.abs(Math.sin(g.t * 6)) * 3, { ax: .5, ay: 1, s: 1.35 * Math.min(1.1, k) }); }
    rect(c, 10, 140, 124, 31, INK); rect(c, 11, 141, 122, 29, RAMP.cream[3]); rect(c, 11, 141, 122, 3, RAMP.gold[2]);
    for (const x of [20, 60, 100]) { rect(c, x, 147, 30, 19, RAMP.cream[2]); ringRect(c, x, 147, 30, 19, 1, RAMP.gold[1]); disc(c, x + 15, 156, 1.6, RAMP.gold[1]); }
    // his last stamped form in hand
    if (g.t - g.stampT < .9 && g.stampT > 0) { const k = spring(g.t - g.stampT, 2.4, 7); drawS(c, modeloForm(g.used[g.used.length - 1] || '303'), 108, 118, { rot: .08, s: .7 + .3 * Math.min(1, k) }); drawS(c, hacStamp('APROBADO', '#2a9a5a'), 108, 118, { rot: -.2, s: .5 }); }
    // speech bubble
    const bx = 138, by = 50, bw = 112, bh = 62;
    panel(c, bx, by, bw, bh, '#ffffff', { r: 8 }); polyPx(c, [[bx + 4, by + 30], [bx - 14, by + 40], [bx + 4, by + 42]], INK); polyPx(c, [[bx + 5, by + 32], [bx - 10, by + 39], [bx + 5, by + 40]], '#ffffff');
    let say;
    if (g.state === 'won') say = g.t - g.endT > .6 ? 'Por cierto… ¿tienes hueco para un corte?' : '¡Todo en regla!';
    else if (g.state === 'lost') say = '¡Se acabó! ¡Multa por desorden!';
    else if (g.req && g.forms.length) say = g.req.a + (g.level < 3 ? ' (el ' + g.req.n + ')' : '') + '. ¡Rapidito!';
    else say = g.round ? 'Muy bien… ¡el siguiente!' : 'Inspección de Hacienda. Papeles, por favor.';
    txt(c, say, bx + 8, by + 8, INK, { wrap: bw - 14 });
    // rounds: little forms, stamped ones get a tick
    for (let i = 0; i < g.rounds; i++) { const x = 140 + i * 18, y = 118; rect(c, x, y, 13, 16, INK); rect(c, x + 1, y + 1, 11, 14, i < g.round ? '#d2f5e4' : '#fdfbf5'); if (i < g.round) { linePx(c, x + 3, y + 8, x + 5, y + 11, '#2a9a5a'); linePx(c, x + 5, y + 11, x + 10, y + 4, '#2a9a5a'); } }
    // patience meter (right column, clear of the stage's little lives at the bottom)
    const pshake = g.patience < 25 && g.state === 'play' ? Math.sin(g.t * 50) : 0;
    panel(c, 138, 140, 112, 28, '#fff8e6', { r: 4 });
    txt(c, 'PACIENCIA', 144, 144, INK, { bold: true });
    const w = rd(clamp(g.patience, 0, 100) * .98), col = g.patience > 55 ? '#5bd18b' : g.patience > 25 ? '#ffb020' : '#e23b4e';
    rect(c, 144 + pshake, 155, 100, 9, INK); rect(c, 145 + pshake, 156, 98, 7, '#dce7ea'); rect(c, 145 + pshake, 156, w, 7, col); rect(c, 145 + pshake, 156, w, 2, '#ffffff');
    if (g.state === 'won' && g.t - g.endT < .75) { const k = spring(g.t - g.endT, 2.4, 6); drawS(c, hacStamp('¡APROBADO!', '#2a9a5a'), 96, 96, { rot: -.12, s: lerp(2.2, 1, Math.min(1, k)), alpha: g.t - g.endT > .55 ? (.75 - (g.t - g.endT)) / .2 : 1 }); }
    if (g.state === 'lost') { const k = spring(g.t - g.endT, 2.4, 6); drawS(c, hacStamp('¡MULTA!', '#e0283c'), 128, 96, { rot: .1, s: lerp(2.4, 1.2, Math.min(1, k)) }); }
  },
  bot(g) {
    const pulse = fl(g.t * 20) % 3 === 0;
    const d = g.dogs.find(d => d.st === 'up' && d.t > .2); if (d) return { x: d.x, y: 160, down: pulse };
    if (g.phone.ring && g.phone.t > .25) return { x: 212, y: 150, down: pulse };
    if (!g.fly && g.req) { const f = g.forms.find(f => f.num === g.req.n && Math.abs(f.x - f.tx) < 3 && Math.abs(f.y - f.ty) < 3); if (f) return { x: f.x, y: f.y, down: pulse }; }
    return { down: false };
  },
  hint(g) {
    const d = g.dogs.find(d => d.st === 'up'); if (d) return { x: d.x, y: 160, mech: 'tap' };
    const f = g.req && g.forms.find(f => f.num === g.req.n); return f ? { x: f.tx, y: f.ty, mech: 'tap' } : null;
  },
});

// a hidden stage to play it from Juguetes, dressed as Anahí's salon
defStage({
  id: 'bonus', menu: false, name: '¡PAPELEO!', sub: '«Hacienda llama a la puerta»', verb: '¡TOCA!', mech: 'tap', bpm: 120,
  games: ['hacienda'], boss: 'hacienda', bossFirst: true, get room() { return STAGES.anahi.room; }, get songs() { return STAGES.anahi.songs; },
  cardCols: [RAMP.green[1], RAMP.green[2]], portrait: (k, t) => STAGES.anahi.portrait(k, t), face: () => STAGES.anahi.face(), rim: RAMP.green[3], tip: '',
});
