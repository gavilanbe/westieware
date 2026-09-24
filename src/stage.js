// ============================================================================
//  stage — the WarioWare loop.
//  card → (story) → interlude ⇄ microgame … speed ups … boss → clear / game over
//  Everything is counted in beats of the stage's current tempo: the interlude
//  is 4 beats (8 with an announcement), a microgame 8 or 16, and the music of
//  each segment is scheduled to start exactly on its first beat.
// ============================================================================
'use strict';

const STAGES = {}, STAGE_ORDER = [];
function defStage(def) { STAGES[def.id] = def; STAGE_ORDER.push(def.id); }
const LIVES = 4;
const SPEED_MAX = 8; // speed tiers: tempo × (1 + .13 × tier), so the top is about twice the start

// ---------------------------------------------------------------- global jingles
const JINGLE = {
  speed: { spb: 4, tracks: [
    { i: 'p25', v: .8, n: 'C5 C#5 D5 D#5 E5 F5 F#5 G5 G#5 A5 A#5 B5 C6! - - .' },
    { i: 'p12', v: .45, n: 'E4 F4 F#4 G4 G#4 A4 A#4 B4 C5 C#5 D5 D#5 E5 - - .' },
    { i: 'bass', v: .8, n: 'C3 . C3 . C3 . C3 . C3 C3 C3 C3 C3! - . .' },
    { i: 'd', v: .8, n: 's_ s_ s s s_ s_ s s s s s s k+x - . .' }] },
  boss: { spb: 4, tracks: [
    { i: 'brass', v: .8, n: 'C3 - - . C3 - - . Eb3 - - . F#3! - - -' },
    { i: 'brass', v: .55, n: 'G2 - - . G2 - - . Bb2 - - . C3 - - -' },
    { i: 'd', v: .9, n: 'T . . T T . . T T . T T T T k+x .' }] },
  level: { spb: 4, tracks: [
    { i: 'p25', v: .8, n: 'C5 E5 G5 C6 D5 F#5 A5 D6 E5 G#5 B5 E6! - - . .' },
    { i: 'bell', v: .5, n: '. . . . . . . . . . . . E6 - G6 -' },
    { i: 'bass', v: .8, n: 'C3 . C3 . D3 . D3 . E3 . E3 . E3! - . .' },
    { i: 'd', v: .8, n: 'k . h . k . h . k . s s k+x - . .' }] },
  clear: { spb: 4, tracks: [
    { i: 'brass', v: .75, n: 'G4 - C5 - E5 - G5 - - - E5 - G5 - - - C6! - - - - - - - . . . . . . . .' },
    { i: 'p25', v: .45, n: 'E4 - G4 - C5 - E5 - - - C5 - E5 - - - G5 - - - - - - - . . . . . . . .' },
    { i: 'bell', v: .5, n: '. . . . . . . . . . . . . . . . C6 E6 G6 C7 E7 G7 C7 - . . . . . . . .' },
    { i: 'bass', v: .8, n: 'C3 . C3 . E3 . G3 . C3 . E3 . G3 . C4! - - - C3 - - - . . . . . . . .' },
    { i: 'd', v: .85, n: 'k . h . s . h . k . h . s s s s k+x - - - - - - - . . . . . . . .' }] },
  over: { spb: 4, tracks: [
    { i: 'p50', v: .7, n: 'E5 - - D#5 - - D5 - - C#5 - - - - - - - - - - - . . .' },
    { i: 'tri', v: .8, n: 'A3 - - - - - G#3 - - - - - G3 - - - - - F#3 - - - - - -' },
    { i: 'd', v: .6, n: 'k . . . . . k . . . . . k . . . . . T - - - - -' }] },
  record: { spb: 4, tracks: [
    { i: 'bell', v: .7, n: 'C6 E6 G6 C7 G6 C7 E7! - - -' },
    { i: 'p25', v: .4, n: 'C5 . E5 . G5 . C6 - - -' }] },
  start: { spb: 4, tracks: [
    { i: 'p25', v: .75, n: 'G5 . G5 . G5 . . . C6! - - - . . . .' },
    { i: 'bass', v: .7, n: 'G3 . G3 . G3 . . . C3 - - - . . . .' },
    { i: 'd', v: .8, n: 'r . r . r . . . k+x - - - . . . .' }] },
};
// fallback interlude music when a stage does not bring its own
const INTER_DEFAULT = {
  win: { spb: 4, tracks: [{ i: 'p25', v: .75, n: 'C5 E5 G5 C6! - . . .' }, { i: 'bass', v: .8, n: 'C3 . G3 . C3 . . .' }, { i: 'd', v: .8, n: 'k . s . k k s .' }] },
  lose: { spb: 4, tracks: [{ i: 'p25', v: .75, n: 'G4 - F#4 - F4 - E4 -' }, { i: 'bass', v: .8, n: 'G2 . F#2 . F2 . E2 .' }, { i: 'd', v: .8, n: 'k . . . k . . .' }] },
  next: { spb: 4, tracks: [{ i: 'p25', v: .6, n: 'G4 . C5 . E5 . G5 .' }, { i: 'bass', v: .8, n: 'C3 . . . G2 . . .' }, { i: 'd', v: .8, n: 'k . h . s . h h' }] },
};

// ---------------------------------------------------------------- STAGE scene
const STG = {
  enter(arg) {
    const def = STAGES[arg.id];
    const S = this.S = {
      def, id: def.id, first: !SAVE.cleared[def.id] && !arg.endless && !def.endless, lives: def.lives || LIVES, maxLives: def.lives || LIVES, count: 0, level: def.startLevel || 1, speed: 0,
      bpm: def.bpm || 120, phase: 'card', pt: 0, pb: 0, bag: [], last: null, g: null, result: null,
      react: 'ready', reactT: 0, special: null, breakI: -1, breakT: 0, bossTries: 0, cmdT: -1,
      paused: false, bombState: null, countPop: 0, zoom: 0, peek: 0, done: false, newRecord: false, lastLevel: 1, practice: arg.practice || null,
      fx: new FX(), topFx: new FX(), story: arg.story !== false,
    };
    if (arg.practice) { S.first = false; S.practiceId = arg.practice; }
    else if (def.bossFirst) S.nextIsBoss = true; // a boss-only stage (the secret ¡PAPELEO!)
    // build every microgame's pictures while the title card is up (no hitches later)
    for (const id of (arg.practice ? [arg.practice] : stageGames(def).concat(def.boss ? [def.boss] : []))) warm(() => { if (MG[id]) { const g = mgNew(id, 1, 120); mgUpdate(g, STEP); mgDraw(g); } });
    stopAllMusic(.1);
    this.setPhase('card');
    SAVE.plays++; persist();
  },
  exit() { stopAllMusic(.1); LED.mode = 'on'; },
  get beatDur() { return 60 / this.S.bpm; },
  setPhase(p) { const S = this.S; S.phase = p; S.pt = 0; S.pb = 0; S.phaseDone = false; },
  react(r) { this.S.react = r; this.S.reactT = 0; },

  // ------------------------------------------------------------- flow ----
  always(dt) {
    const S = this.S; if (!S || S.paused) return;
    S.pt += dt; S.pb += dt / this.beatDur; S.reactT += dt; S.countPop = Math.max(0, S.countPop - dt * 3);
    if (S.bpmAt2 && S.phase === 'inter' && S.pb >= 2) { S.pb = 2 + (S.pb - 2) * (S.bpmAt2 / S.bpm); S.bpm = S.bpmAt2; S.bpmAt2 = 0; }
    if (S.breakI >= 0) S.breakT += dt;
  },
  update(dt) {
    const S = this.S;
    // pause button (top-right of the top screen) or Esc
    if (!S.paused && (S.phase === 'inter' || S.phase === 'play') && ((IN.topTap && IN.tx > SW - 26 && IN.ty < 22) || IN.key === 'Escape')) { this.pause(true); return; }
    if (S.paused) { this.updatePause(); return; }
    S.fx.update(dt); S.topFx.update(dt);
    switch (S.phase) {
      case 'card': this.updCard(dt); break;
      case 'inter': this.updInter(dt); break;
      case 'play': this.updPlay(dt); break;
      case 'clear': this.updClear(dt); break;
      case 'over': this.updOver(dt); break;
      case 'results': this.updResults(dt); break;
    }
  },
  // -- title card: name + mechanic, then story, then the first interlude
  updCard() {
    const S = this.S;
    if (S.pt < .05 && !S.cardSong) { S.cardSong = true; playSong(S.def.songs && S.def.songs.card || JINGLE.start, { bpm: S.bpm }); sfx('slam'); }
    if (S.pt > 3.2 || (S.pt > .6 && (IN.tap || IN.anyTap))) {
      stopAllMusic(.08);
      const story = S.def.intro && S.story && CUTS[S.def.intro];
      if (story && !S.practice) { playCut(S.def.intro, () => { go(STG_RESUME); }); return; }
      this.startInter(null);
    }
  },
  startInter(result) {
    const S = this.S;
    S.result = result;
    this.setPhase('inter');
    if (result === true) { S.count++; S.countPop = 1; this.react('win'); }
    else if (result === false) { S.count++; S.countPop = 1; S.lives--; S.breakI = S.lives; S.breakT = 0; this.react('lose'); shake('top', 3, .3); }
    else this.react('ready');
    // announcements
    S.special = null;
    if (S.lives > 0) {
      const d = S.def;
      if (S.nextIsBoss) S.special = 'boss';
      else if (S.levelUp) { S.special = 'level'; S.levelUp = false; }
      else if (S.speedUp) { S.special = 'speed'; S.speedUp = false; }
      else if (result !== null && !d.noSpeed && S.speed < SPEED_MAX && (d.speedEvery ? this.countSinceBoss() % d.speedEvery === 0 && S.speed < 6 : (d.speedAt || [4, 7]).includes(this.countSinceBoss()))) S.special = 'speed';
    }
    if (QS.get('force') && result !== null && S.lives > 0) S.special = QS.get('force'); // debug captures
    S.len = S.special ? 8 : 4;
    if (S.lives <= 0) S.len = 3;
    // music: result (2 beats) [+ special 4] + next (2)
    stopAllMusic(.04);
    const songs = Object.assign({}, INTER_DEFAULT, S.def.songs || {}), bd = this.beatDur, t0 = auT() + .02;
    if (S.lives <= 0) { playSong(songs.lose, { bpm: S.bpm, at: t0 }); return; }
    playSong(result === true ? songs.win : result === false ? songs.lose : (songs.ready || songs.win), { bpm: S.bpm, at: t0 });
    // a speed-up takes effect on beat 2, exactly when its jingle starts
    let nbpm = S.bpm;
    if (S.special === 'speed') { S.speed = Math.min(SPEED_MAX, S.speed + 1); nbpm = (S.def.bpm || 120) * (1 + .13 * S.speed); S.bpmAt2 = nbpm; }
    const bd2 = 60 / nbpm;
    if (S.special) playSong((songs.jingles && songs.jingles[S.special]) || JINGLE[S.special], { bpm: nbpm, at: t0 + 2 * bd });
    playSong(songs.next, { bpm: nbpm, at: t0 + 2 * bd + (S.special ? 4 * bd2 : 0) });
    // choose the next microgame now so the portal can peek at it
    this.prepareNext();
    void bd2;
  },
  countSinceBoss() { return this.S.count - (this.S.bossCount || 0); },
  prepareNext() {
    const S = this.S, d = S.def;
    if (S.practice) { S.nextId = S.practiceId; }
    else if (S.special === 'boss' || S.nextIsBoss) { S.nextId = d.boss; }
    else {
      if (!S.bag.length) { S.bag = shuffle(stageGames(d).slice()); if (S.bag[0] === S.last && S.bag.length > 1) S.bag.push(S.bag.shift()); }
      S.nextId = S.bag.shift();
    }
    S.g = mgNew(S.nextId, S.level, S.bpm);
    SAVE.seen[S.nextId] = 1; SAVE.seen[S.nextId + ':n'] = (SAVE.seen[S.nextId + ':n'] || 0) + 1;
  },
  updInter() {
    const S = this.S;
    if (S.lives <= 0) { if (S.pb >= S.len) this.gameOver(); return; }
    // interlude beat events
    const nb = fl(S.pb);
    if (nb !== S.lastBeat) { S.lastBeat = nb; if (nb === S.len - 1) sfx('zoom', { pitch: S.bpm / 120 }); }
    if (S.special === 'boss') LED.mode = 'blink'; else LED.mode = 'on';
    if (S.pb >= S.len) this.startPlay();
  },
  startPlay() {
    const S = this.S, g = S.g;
    this.setPhase('play'); LED.mode = 'on';
    S.cmdT = 0; S.bombState = null; S.boomT = -1; S.nextIsBoss = false;
    g.bpm = S.bpm; g.spb = 60 / S.bpm; g.tempo = S.bpm / 120;
    const song = g.def.song ? g.def.song(g) : (S.def.songs && S.def.songs.play) || null;
    stopAllMusic(.03);
    S.mgSong = song ? playSong(song, { bpm: S.bpm, loop: !!g.def.boss }) : null;
    sfx('stamp'); sfx('swoosh', { pitch: 1.3 });
    shake('bot', 2, .12); flash('top', '#ffffff', .12, .85);
    S.fx.burst(SW / 2, 78, 14, { k: 'spark', c: ['#fff', C.yellowL, C.yellow], sp0: 60, sp1: 160, life0: .2, life1: .45 });
    S.last = S.nextId;
  },
  updPlay(dt) {
    const S = this.S, g = S.g;
    S.cmdT += dt;
    const prevState = g.state;
    mgUpdate(g, dt);
    if (prevState === 'play' && g.state !== 'play') this.onDecided(g.state === 'won');
    const beats = g.def.boss ? Infinity : g.def.beats;
    const rem = beats - S.pb;
    // bath bomb: lights in the last four beats
    if (!g.def.boss && g.state === 'play') {
      if (rem <= 4 && !S.bombState) { S.bombState = 'burn'; S.bombT = 0; sfx('boing', { pitch: 1.5, vol: .6 }); }
      if (S.bombState === 'burn') { LED.mode = 'blink'; S.bombT += dt; S.fuseSfx = (S.fuseSfx || 0) - dt; if (S.fuseSfx <= 0) { sfx('fuse'); S.fuseSfx = .09; }
        const beatNow = Math.ceil(rem); if (beatNow <= 3 && beatNow !== S.lastTick) { S.lastTick = beatNow; sfx('tick', { pitch: 1.4 }); } }
    }
    if (g.def.boss) {
      if (g.state !== 'play' && !S.bossEndAt) S.bossEndAt = S.pb + 2.5;
      if (S.bossEndAt && S.pb >= S.bossEndAt) { S.bossEndAt = 0; this.endPlay(); }
      return;
    }
    if (S.pb >= beats) {
      if (g.state === 'play') {
        if (g.def.survive) { g.state = 'won'; mgOnDecide(g, true); this.onDecided(true); }
        else { g.state = 'lost'; this.onDecided(false, true); sfx('boom'); shake('both', 4, .35); flash('bot', '#ffffff', .1); buzz(60); S.boomT = 0; this.foamBurst(); }
      }
      this.endPlay();
    }
  },
  onDecided(won, byTime) {
    const S = this.S;
    LED.mode = 'on';
    if (S.bombState === 'burn') S.bombState = won ? 'pop' : 'fizzle';
    if (won) { S.fx.burst(14, 176, 10, { k: 'star', c: [C.yellow, '#fff', C.pinkL], sp0: 40, sp1: 100, life0: .3, life1: .6, g: 120 }); }
    this.react(won ? 'win' : 'lose');
    void byTime;
  },
  foamBurst() {
    const S = this.S;
    for (let i = 0; i < 26; i++) S.fx.add({ k: 'puff', x: 14 + rnd(-6, 6), y: 176 + rnd(-6, 6), vx: rnd(-40, 140), vy: rnd(-160, -20), g: 160, drag: 2, r: rnd(3, 8), life: rnd(.4, .8), c: pick(['#ffffff', '#ffe3f0', '#ffd1e4', '#e2f4ff']) });
    S.fx.burst(14, 176, 12, { k: 'bubble', c: '#ffffff', sp0: 40, sp1: 140, r: 3, life0: .4, life1: .8 });
  },
  endPlay() {
    const S = this.S, g = S.g, won = g.state === 'won';
    SAVE.seen[g.id] = 1;
    (S.log = S.log || []).push(g.id + (g.def.boss ? '*' : '') + ':' + (won ? 'W' : 'L') + '@' + g.level + '/' + rd(S.bpm));
    if (g.def.boss) {
      S.bossCount = S.count + 1;
      if (won) {
        if (S.first) { S.count++; this.stageClear(); return; }
        if (S.level < 3) { S.level++; S.speed = 0; S.bpm = S.def.bpm || 120; S.levelUp = true; }
        else S.speedUp = true; // top difficulty: no reset, the tempo just keeps climbing
        if (S.lives < S.maxLives) S.lives++;
      } else S.nextIsBoss = true; // the boss comes back until it's beaten
    } else {
      const bossAt = S.def.bossAt || 10;
      if (S.def.boss && MG[S.def.boss] && this.countSinceBoss() + 1 >= bossAt && !S.practice) S.nextIsBoss = true;
    }
    this.startInter(won);
  },
  stageClear() {
    const S = this.S;
    this.setPhase('clear'); this.react('clear');
    stopAllMusic(.05); playSong(JINGLE.clear, { bpm: 132 });
    SAVE.cleared[S.id] = 1; persist();
    flash('both', '#ffffff', .25); shake('both', 3, .3);
  },
  updClear() {
    const S = this.S;
    if (S.pt < 4.5 && fl(S.pt * 20) % 2 === 0) S.topFx.add({ k: 'conf', x: rnd(SW), y: -4, vx: rnd(-20, 20), vy: rnd(40, 90), g: 30, life: 3, c: pick([C.yellow, C.pink, C.mint, C.sky, '#fff', C.gold]), rot: rnd(TAU), vr: rnd(-8, 8) });
    if (S.pt > 4.2 && (IN.anyTap || S.pt > 7)) {
      stopAllMusic(.1);
      const out = S.def.outro && CUTS[S.def.outro];
      if (out) { playCut(S.def.outro, () => { STG.showResults(true); go(STG_RESUME); }); return; }
      this.showResults(true);
    }
  },
  gameOver() {
    const S = this.S;
    this.setPhase('over'); this.react('over');
    stopAllMusic(.05); playSong(JINGLE.over, { bpm: 110 });
    shake('both', 3, .3);
  },
  updOver() { if (this.S.pt > 3.4 && (IN.anyTap || this.S.pt > 5)) this.showResults(false); },
  showResults(cleared) {
    const S = this.S;
    this.setPhase('results');
    S.cleared = cleared;
    const key = S.practice ? 'mg:' + S.practiceId : S.id, best = SAVE.best[key] || 0;
    S.best = Math.max(best, S.count); S.newRecord = S.count > best && S.count > 0;
    SAVE.best[key] = S.best;
    SAVE.top = SAVE.top || {}; const top = (SAVE.top[key] || []).concat([S.count]).sort((a, b) => b - a).slice(0, 3); SAVE.top[key] = top;
    persist();
    if (S.newRecord) after(.6, () => playSong(JINGLE.record, { bpm: 140 }));
    S.btns = [{ id: 'again', x: 18, y: 124, w: 104, h: 36, label: 'OTRA VEZ' }, { id: 'menu', x: 134, y: 124, w: 104, h: 36, label: 'MENÚ' }];
    if (navigator.share || QS.has('share')) S.btns.push({ id: 'share', x: 78, y: 76, w: 100, h: 26, label: 'COMPARTIR' });
    S.press = null;
  },
  updResults() {
    const S = this.S;
    if (S.pt < .5) return;
    for (const b of S.btns) {
      const hit = IN.x >= b.x && IN.x < b.x + b.w && IN.y >= b.y && IN.y < b.y + b.h;
      if (IN.tap && hit) { S.press = b.id; sfx('cursor'); }
      if (IN.rel && S.press === b.id) {
        if (hit && b.id === 'share') { sfx('select'); shareScore(S); S.press = null; continue; }
        if (hit) { sfx('select'); if (b.id === 'again') transit('paw', STG, { id: S.id, story: false, practice: S.practice ? S.practiceId : null }); else transit('paw', S.cleared && S.def.creditsOnClear ? CREDITS : MENU, { from: S.id }); }
        S.press = null;
      }
    }
    if (!IN.down) S.press = null;
  },
  // ------------------------------------------------------------- pause ---
  pause(on) {
    const S = this.S; S.paused = on;
    if (on) { if (AU.ctx) AU.ctx.suspend(); S.pbtn = null; sfx('back'); }
    else { if (AU.ctx && AU.on) AU.ctx.resume(); }
  },
  updatePause() {
    const S = this.S, bs = [{ id: 'go', x: 48, y: 72, w: 160, h: 32 }, { id: 'quit', x: 48, y: 116, w: 160, h: 32 }];
    if (IN.key === 'Escape') { this.pause(false); return; }
    for (const b of bs) {
      const hit = IN.x >= b.x && IN.x < b.x + b.w && IN.y >= b.y && IN.y < b.y + b.h;
      if (IN.tap && hit) S.pbtn = b.id;
      if (IN.rel && S.pbtn === b.id && hit) { if (b.id === 'go') { this.pause(false); sfx('select'); } else { this.pause(false); stopAllMusic(); transit('paw', MENU, { from: S.id }); } }
    }
  },

  // ------------------------------------------------------------- drawing ---
  drawTop(g) {
    const S = this.S, d = S.def, R = d.room;
    switch (S.phase) {
      case 'card': this.drawCardTop(g); break;
      case 'play': this.drawPlayTop(g); break;
      case 'results': this.drawResultsTop(g); break;
      default:
        R.top(g, S);
        if (R.lifePos && R.lifePos.screen === 'top') this.drawLives(g, S, R.lifePos);
        if (S.phase === 'inter' || S.phase === 'over') this.drawCounter(g, S);
        if (S.phase === 'inter' && S.special) this.drawSpecialTop(g, S);
        if (S.phase === 'clear') this.drawBanner(g, '¡SUPERADO!', S.pt, ['#ffffff', '#fff27a', '#ffc23a'], 34);
        if (S.phase === 'over') this.drawBanner(g, '¡SE ACABÓ!', S.pt, ['#ffffff', '#b3d9ff', '#63a0ef'], 128);
    }
    S.topFx.draw(g);
    if ((S.phase === 'inter' || S.phase === 'play') && !S.paused) this.drawPauseBtn(g);
    if (S.paused) { g.globalAlpha = .6; rect(g, 0, 0, SW, SH, INK); g.globalAlpha = 1; mord(g, 'PAUSA', SW / 2, 80, { u: 2.2, r: 2.2 }); }
  },
  drawBot(g) {
    const S = this.S, d = S.def, R = d.room;
    switch (S.phase) {
      case 'card': this.drawCardBot(g); break;
      case 'play': this.drawPlayBot(g); break;
      case 'results': this.drawResultsBot(g); break;
      default:
        R.bot(g, S);
        if (!(R.lifePos && R.lifePos.screen === 'top')) this.drawLives(g, S);
        this.drawPortal(g, S);
        if (S.phase === 'inter' && S.special) this.drawSpecialBot(g, S);
        if (S.phase === 'clear') (R.clearBot || drawClearBotDefault)(g, S);
    }
    S.fx.draw(g);
    if (S.paused) this.drawPauseBot(g);
  },
  // the big counter of microgames played
  drawCounter(g, S) {
    const R = S.def.room, pos = R.counter || { x: SW / 2, y: 18 };
    if (pos === 'none') return;
    const pop = S.countPop, beatBob = Math.sin(S.pb * Math.PI) * 1.2;
    const txtN = String(S.count).padStart(2, '0');
    mord(g, txtN, pos.x, pos.y + beatBob - pop * 3, { u: 2.6, r: 2.6, rim: 2, sy: 3, fill: R.counterFill || ['#ffffff', '#fff27a', '#ffc23a'], line: R.counterLine || INK }, { anim: () => ({ s: 1 + pop * .35 }) });
  },
  drawPauseBtn(g) {
    const x = SW - 20, y = 4;
    panel(g, x, y, 16, 14, '#ffffff', { r: 3, line: INK, lo: '#b3b8d4' });
    rect(g, x + 5, y + 4, 2, 6, INK); rect(g, x + 9, y + 4, 2, 6, INK);
  },
  drawPauseBot(g) {
    g.globalAlpha = .75; rect(g, 0, 0, SW, SH, INK); g.globalAlpha = 1;
    const bs = [['SEGUIR', 72, C.mint], ['SALIR AL MENÚ', 116, C.pinkL]];
    for (const [l, y, c] of bs) { panel(g, 48, y, 160, 32, c, { r: 5, line: INK, hi: '#ffffff' }); txt(g, l, SW / 2, y + 12, INK, { align: 'c', bold: true }); }
  },
  // big announcement across the top screen
  drawBanner(g, word, t, fill, y = 78) {
    const k = clamp(t / .5, 0, 1);
    g.globalAlpha = .7 * k; rect(g, 0, y - 8, SW, 52, INK); g.globalAlpha = 1;
    mord(g, word, SW / 2, y, fitMord(word, 244, { u: 2.5, r: 2.5, rim: 2, sy: 3, fill }), { anim: (i, n) => { const lt = t - i * .05; const s = lt <= 0 ? 0 : spring(lt, 2.2, 6); return { s, rot: (1 - Math.min(1, lt * 3)) * (i % 2 ? .3 : -.3), dy: Math.sin(t * 6 + i) * 1.5 }; } });
  },
  drawSpecialTop(g, S) {
    const t = (S.pb - 2) * this.beatDur; if (t < 0) return;
    // every character brings its own ¡MÁS RÁPIDO! / ¡JUEGO DEL JEFE! / ¡MÁS DIFÍCIL! (room.special)
    const R = S.def.room; if (R.special && R.special(g, S, S.special, t) !== false) return;
    if (S.special === 'speed') {
      // speed lines + brush lettering + Keiko cheering from below
      for (let i = 0; i < 18; i++) { const y = (i * 37 + fl(t * 400) * 3) % SH, x = (i * 71 + fl(t * 900)) % (SW + 60) - 30; rect(g, SW - x, y, 26 + (i % 3) * 10, 1, '#ffffff'); }
      const kk = spring(t - .25, 2.4, 6); if (kk > 0) drawS(g, keikoHead('happy'), SW / 2 + 8, 150, { s: kk, rot: Math.sin(t * 10) * .08 });
      drawBrushWords(g, ['¡MÁS', 'RÁPIDO!'], SW / 2 - 6, 52, t);
    } else if (S.special === 'boss') {
      g.globalAlpha = Math.min(.45, t * .8); rect(g, 0, 0, SW, SH, '#3a0010'); g.globalAlpha = 1;
      for (const yy of [8, SH - 18]) { rect(g, 0, yy, SW, 10, C.yellow); for (let x = -20 + (fl(t * 60) % 20); x < SW; x += 20) polyPx(g, [[x, yy], [x + 10, yy], [x + 5, yy + 10], [x - 5, yy + 10]], INK); }
      const kk = spring(t - .35, 2.2, 6); if (kk > 0) drawS(g, keikoBossHead(), 196, 128, { s: kk, rot: -.1 + Math.sin(t * 3) * .04 });
      drawBrushWords(g, ['¡JUEGO', 'DEL JEFE!'], 102, 46, t);
    } else if (S.special === 'level') {
      this.drawBanner(g, '¡MÁS DIFÍCIL!', t, ['#ffffff', '#d2f5e4', '#5bb593']);
    }
  },
  drawSpecialBot(g, S) {
    const t = (S.pb - 2) * this.beatDur; if (t < 0 || S.pb > 6) return;
    if (S.def.room.specialBot && S.def.room.specialBot(g, S, S.special, t) !== false) return;
    const R = S.def.room, SPEED_LBL = { tap: '¡Más ritmo, más tijera!', rub: '¡A frotar a toda mecha!', cut: '¡Tijeras a tope!', draw: '¡Tiza a toda velocidad!', drag: '¡Rapidito, rapidito!', spin: '¡Más vueltas, más rápido!', mix: '¡Todo a la vez!' };
    const lbl = S.special === 'speed' ? (R.speedLabel || SPEED_LBL[S.def.mech] || SPEED_LBL.tap) : S.special === 'boss' ? (R.bossLabel || '¡Se acerca algo gordo!') : (R.levelLabel || '¡Más difícil todavía!');
    const k = E.outBack(clamp(t * 3, 0, 1));
    panel(g, SW / 2 - 90, rd(8 - (1 - k) * 30), 180, 18, '#ffffff', { r: 4 });
    txt(g, lbl, SW / 2, rd(13 - (1 - k) * 30), INK, { align: 'c' });
  },
  // ---- portal: frame on the touch screen that the microgame zooms out of
  portalRect(S) { const R = S.def.room; return R.portal || { x: 64, y: 30, w: 128, h: 96 }; },
  drawPortal(g, S) {
    const R = S.def.room, P = this.portalRect(S), bd = this.beatDur;
    let x = P.x, y = P.y, w = P.w, h = P.h, frameA = 1;
    const len = S.len || 4;
    // zoom out of the last microgame during the first half beat
    const zOut = S.phase === 'inter' && S.result !== null && S.pb < .5 ? 1 - E.outC(S.pb / .5) : 0;
    const zIn = S.phase === 'inter' && S.lives > 0 && S.pb > len - .5 ? E.inC((S.pb - (len - .5)) / .5) : 0;
    const z = Math.max(zOut, zIn);
    if (z > 0) { x = lerp(P.x, 0, z); y = lerp(P.y, 0, z); w = lerp(P.w, SW, z); h = lerp(P.h, SH, z); frameA = 1 - z; }
    // beat pulse
    const pulse = S.phase === 'inter' && z === 0 ? Math.max(0, 1 - (S.pb % 1) * 4) : 0;
    const px0 = rd(x - pulse), py0 = rd(y - pulse), pw = rd(w + pulse * 2), ph = rd(h + pulse * 2);
    // inside
    g.save(); g.beginPath(); g.rect(px0, py0, pw, ph); g.clip();
    const showGame = zOut > 0 || zIn > 0 || (S.phase === 'inter' && S.pb > len - .75 && S.lives > 0);
    if (showGame && S.g) {
      const src = zOut > 0 && S.prevFrame ? S.prevFrame : mgDraw(S.g);
      g.drawImage(src, px0, py0, pw, ph);
      if (!zOut && !zIn) { g.globalAlpha = .7 * (1 - (S.pb - (len - .75)) / .25); rect(g, px0, py0, pw, ph, '#ffffff'); g.globalAlpha = 1; }
    } else this.drawStatic(g, S, px0, py0, pw, ph);
    // result stamp over the thumbnail right after zooming out
    if (S.phase === 'inter' && S.result !== null && S.pb >= .5 && S.pb < 2.2) {
      const k = spring((S.pb - .5) * bd, 2.5, 7), ok = S.result;
      drawStampMark(g, px0 + pw / 2, py0 + ph / 2, ok, k);
    }
    g.restore();
    if (frameA > 0) drawPortalFrame(g, R.frame || 'mirror', px0, py0, pw, ph, S.pb, frameA);
    // zoom rush: white streaks converging while the portal swallows the screen
    if (zIn > 0 && zIn < 1) {
      g.fillStyle = '#ffffff';
      for (let i = 0; i < 26; i++) {
        const a = i / 26 * TAU + hash2(i, 7), r0 = lerp(150, 60, zIn) + hash2(i, 3) * 30, L = 14 + zIn * 40;
        for (let q = 0; q < L; q += 2) g.fillRect(rd(SW / 2 + Math.cos(a) * (r0 + q)), rd(SH / 2 + Math.sin(a) * (r0 + q) * .75), 1, 1);
      }
    }
  },
  drawStatic(g, S, x, y, w, h) {
    const R = S.def.room, cols = R.staticCols || [RAMP.green[1], RAMP.green[2]];
    rect(g, x, y, w, h, cols[0]);
    g.fillStyle = cols[1];
    const off = fl(S.pt * 24);
    for (let yy = 0; yy < h; yy += 2) for (let xx = ((yy / 2 + off) % 8); xx < w; xx += 8) g.fillRect(x + xx, y + yy, 4, 1);
    // question mark bouncing on the beat
    const bob = Math.abs(Math.sin(S.pb * Math.PI)) * 5;
    mord(g, '?', x + w / 2, y + h / 2 - 12 - bob, { u: 2, r: 2.2, fill: ['#ffffff', '#fff8e6', '#f2e2b8'] });
  },
  drawLives(g, S, pos) {
    const R = S.def.room, n = S.maxLives, sp = pos ? pos.sp : (R.lifeSpacing || 30), y = pos ? pos.y : (R.lifeY || 158), x0 = pos ? pos.x0 : SW / 2 - (n - 1) * sp / 2;
    for (let i = 0; i < n; i++) {
      const alive = i < S.lives, breaking = i === S.breakI && S.breakT < 1.2 && S.phase !== 'results';
      const bob = alive ? Math.round(Math.sin(S.pb * Math.PI + i * .8) * 1.5) : 0;
      (R.life || drawLifeDefault)(g, x0 + i * sp, y + bob, alive ? 'alive' : breaking ? 'break' : 'gone', breaking ? S.breakT : 0, S);
    }
  },
  // ---- during a microgame
  drawPlayBot(g) {
    const S = this.S, gm = S.g;
    const img = mgDraw(gm);
    S.prevFrame = S.prevFrame || mkCanvas(SW, SH); S.prevFrame.g.drawImage(img, 0, 0);
    g.drawImage(img, 0, 0);
    // winning flash around the edge
    if (gm.state !== 'play' && gm.t - gm.decidedAt < .3) {
      const k = 1 - (gm.t - gm.decidedAt) / .3, col = gm.state === 'won' ? '#ffffff' : '#ff4060';
      g.globalAlpha = k; for (let i = 0; i < 3; i++) { g.fillStyle = col; g.fillRect(i, i, SW - i * 2, 1); g.fillRect(i, SH - 1 - i, SW - i * 2, 1); g.fillRect(i, i, 1, SH - i * 2); g.fillRect(SW - 1 - i, i, 1, SH - i * 2); } g.globalAlpha = 1;
    }
    this.drawBomb(g, S);
    drawMgHint(g, gm, S.pb, this.beatDur);
    this.drawCmdBot(g, S);
  },
  drawCmdBot(g, S) {
    const t = S.cmdT, bd = this.beatDur, t1 = .55 * bd, t2 = .8 * bd;
    if (t > t2) return;
    const word = S.g.def.cmd;
    let y = 70, fade = 1, sc = 1;
    if (t > t1) { const k = (t - t1) / (t2 - t1); y = lerp(70, -30, E.inQ(k)); sc = lerp(1, .6, k); fade = 1 - k * .3; }
    // burst behind
    const bk = clamp(t / (.35 * bd), 0, 1);
    if (bk < 1) { const r = 20 + bk * 90, pts = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, rr = i % 2 ? r * .55 : r; pts.push([SW / 2 + Math.cos(a) * rr * 1.3, y + 12 + Math.sin(a) * rr * .7]); } g.globalAlpha = (1 - bk) * .8; polyPx(g, pts, '#ffffff'); g.globalAlpha = 1; }
    mord(g, word, SW / 2, y, { u: 2.6, r: 2.7, rim: 2, sy: 3 }, { anim: (i) => { const lt = t - i * .035; const s = lt <= 0 ? 0 : spring(lt, 2.6, 8) * sc; return { s, rot: lt < .15 ? (i % 2 ? .25 : -.25) * (1 - lt / .15) : 0, a: fade }; } });
  },
  drawBomb(g, S) {
    const gm = S.g; if (gm.def.boss) return;
    const beats = gm.def.beats, rem = Math.max(0, beats - S.pb);
    const bx = 14, by = 176;
    if (S.bombState === 'burn' || (S.bombState == null && rem <= 4 && gm.state === 'play')) {
      const appear = clamp((4 - rem) * this.beatDur / .15, 0, 1), s = spring(appear * .5, 2.5, 6);
      const L = rem / 4 * 222;
      // fuse cord (twisted rope) to the right
      for (let x = 0; x < L; x++) { const xx = bx + 9 + x, yy = by + 1 + Math.round(Math.sin(x * .25 + S.pt * 3) * .8); px(g, xx, yy, x % 3 === 0 ? '#8a6a44' : '#dcc08a'); px(g, xx, yy + 1, '#8a6a44'); }
      // spark at the tip
      const sx = bx + 9 + L, sy = by + 1;
      if (fl(S.pt * 30) % 2) drawStar(g, sx, sy, 4.5, '#fff27a', S.pt * 9); else drawStar(g, sx, sy, 3.5, '#ffffff', -S.pt * 7);
      if (FRAME % 3 === 0) S.fx.add({ k: 'spark', x: sx, y: sy, vx: rnd(-30, 30), vy: rnd(-60, -10), g: 200, life: .3, c: pick(['#fff27a', '#ff9f4f', '#ffffff']), r: 1.5 });
      drawBathBomb(g, bx, by, s, Math.ceil(rem), S.pt);
    } else if (S.bombState === 'fizzle' || S.bombState === 'pop') {
      S.bombState = 'done';
      if (S.bombState === 'done') S.fx.burst(bx, by, 8, { k: 'puff', c: ['#ffffff', '#ffd1e4'], sp0: 10, sp1: 40, r: 4, life0: .3, life1: .5 });
    }
  },
  drawPlayTop(g) {
    const S = this.S, gm = S.g, R = S.def.room, bd = this.beatDur;
    (R.playTop || drawPlayTopDefault)(g, S);
    if (gm.def.top) { g.save(); gm.def.top(gm, g); g.restore(); }
    // the command lands here after flying up from the touch screen
    const t = S.cmdT, t1 = .55 * bd, t2 = .8 * bd;
    if (t > t1) {
      const k = clamp((t - t1) / (t2 - t1), 0, 1), y = lerp(SH + 20, 6, E.outBack(k)), bob = Math.sin(S.pb * Math.PI) * 1.5;
      const st = fitMord(gm.def.cmd, 190, { u: 1.9, r: 2, rim: 2, sy: 2 }), w = mordW(gm.def.cmd, st);
      mord(g, gm.def.cmd, SW / 2 - 10, y + bob, st);
      drawMechMini(g, SW / 2 - 10 + w / 2 + 22, y + 16 + bob, gm.def.mech === 'mix' ? S.def.mech : gm.def.mech, S.pt);
      if (k >= 1 && !gm.def.top) {
        if (gm.def.how) { const lines = wrapText(gm.def.how, 220); lines.slice(0, 2).forEach((l, i) => txt(g, l, SW / 2, 48 + i * 11 + bob, '#ffffff', { align: 'c', out: INK })); }
        else if (gm.def.name) txt(g, gm.def.name, SW / 2, 48 + bob, '#ffffff', { align: 'c', out: INK });
      }
    }
    this.drawMiniLives(g, S);
    txt(g, String(S.count + 1).padStart(2, '0'), 8, 6, '#ffffff', { out: INK, bold: true });
  },
  drawMiniLives(g, S) { for (let i = 0; i < S.maxLives; i++) { const alive = i < S.lives; (S.def.room.miniLife || drawMiniLifeDefault)(g, 10 + i * 12, SH - 12, alive); } },
  // ---- title card: every character brings its own (src/cards.js); this is the plain template
  drawCardTop(g) {
    const S = this.S, d = S.def, t = S.pt, cd = d.card || (typeof CARD_DESIGNS !== 'undefined' && CARD_DESIGNS[d.id]);
    if (cd && cd.top) { cd.top(g, S, t); return; }
    const cols = d.cardCols || [RAMP.green[1], RAMP.green[2]];
    // sunburst in the stage colours, a diagonal band for the name, portrait from the left
    rect(g, 0, 0, SW, SH, cols[0]);
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .25; polyPx(g, [[70, 120], [70 + Math.cos(a - .09) * 320, 120 + Math.sin(a - .09) * 320], [70 + Math.cos(a + .09) * 320, 120 + Math.sin(a + .09) * 320]], cols[1]); }
    const bk = E.outBack(clamp((t - .15) / .35, 0, 1));
    g.save(); g.translate(lerp(SW + 120, 170, bk), 58); g.rotate(-.06);
    rect(g, -110, -26, 240, 52, INK); rect(g, -110, -23, 240, 46, '#fff8e6'); rect(g, -110, -23, 240, 3, '#ffffff'); rect(g, -110, 20, 240, 3, '#e8dcc0');
    g.restore();
    this.cardPortrait(g, S, t);
    this.cardName(g, S, t, d.name, 172, 38, fitMord(d.name, 150, { u: 2.3, r: 2.4, sy: 3, fill: d.nameFill || ['#ffffff', '#fff27a', '#ffc23a'] }));
    this.cardSub(g, S, t, 172, 96);
    this.cardPill(g, S, t, 176, 128);
  },
  // the card kit — the four parts every title card keeps, on the same clock:
  // portrait slams in (0–.45 s), name pops in (.3 s), motto types in (.75 s), pill springs in (1.15 s)
  cardPortrait(g, S, t, o = {}) {
    const d = S.def; if (!d.portrait) return;
    const k = E.outBack(clamp((t - (o.delay || 0)) / .45, 0, 1)), x = lerp(o.from != null ? o.from : -80, o.x != null ? o.x : 64, k), y = o.y != null ? o.y : 190;
    if (o.shadow !== false) shadowOval(g, x, y - 4, 34, 5, .45);
    drawS(g, d.portrait('card', t), x, y, { ax: .5, ay: 1, flip: o.flip });
  },
  // letter-by-letter entrance: a springy pop with a little twist
  cardPop(nk, i) { const lt = nk - i * .05; return { s: lt <= 0 ? 0 : spring(lt, 2.2, 7), rot: lt < .2 && lt > 0 ? (i % 2 ? .3 : -.3) * (1 - lt / .2) : 0 }; },
  cardName(g, S, t, word, x, y, st, o = {}) {
    const nk = t - (o.t0 != null ? o.t0 : .3); if (nk <= 0) return;
    mord(g, word, x, y, st, { align: o.align, anim: o.anim ? i => o.anim(nk, i) : i => this.cardPop(nk, i) });
  },
  cardSub(g, S, t, x, y, o = {}) {
    const s = o.text || S.def.sub, t0 = o.t0 != null ? o.t0 : .75; if (t <= t0 || !s) return;
    const n = Math.min(s.length, fl((t - t0) * (o.cps || 42)));
    txt(g, s.slice(0, n), x, y, o.col || '#ffffff', { align: o.align || 'c', out: o.out === undefined ? INK : o.out, bold: o.bold });
  },
  // ¡PRIMERA VISITA! the first time, RÉCORD: n afterwards; o.draw(g, k, label, first) draws a custom shape
  cardPill(g, S, t, x, y, o = {}) {
    const t0 = o.t0 != null ? o.t0 : 1.15; if (t <= t0) return;
    const k = spring(t - t0, 2.5, 6), first = !!S.first, label = first ? '¡PRIMERA VISITA!' : 'RÉCORD: ' + (SAVE.best[S.id] || 0);
    g.save(); g.translate(rd(x), rd(y)); g.rotate(o.rot != null ? o.rot : .05); g.scale(k, k);
    if (o.draw) o.draw(g, k, label, first);
    else { const w = Math.max(100, txtW(label) + 22); panel(g, -w / 2, -11, w, 22, first ? (o.first || C.pink) : (o.rec || C.yellow), { r: o.r != null ? o.r : 5, hi: '#ffffff', line: o.line }); txt(g, label, 0, -4, first ? (o.firstInk || '#ffffff') : (o.recInk || INK), { align: 'c', bold: true }); }
    g.restore();
  },
  drawCardBot(g) {
    const S = this.S, d = S.def, t = S.pt;
    drawMechCard(g, d.mech, d.verb, t, d.room.cardCol || RAMP.green);
    if (t > 1.4 && fl(t * 2) % 2 === 0) txt(g, 'Toca para empezar', SW / 2, 178, '#ffffff', { align: 'c', out: INK });
  },
  // ---- results
  drawResultsTop(g) {
    const S = this.S, d = S.def, t = S.pt, cols = d.cardCols || [RAMP.green[1], RAMP.green[2]];
    rect(g, 0, 0, SW, SH, cols[0]);
    for (let i = -2; i < 14; i++) { const x = i * 24 + fl(t * 12) % 24; polyPx(g, [[x, 0], [x + 12, 0], [x - 40, SH], [x - 52, SH]], cols[1]); }
    // portrait (happy or sad) on the left
    if (d.portrait) drawS(g, d.portrait(S.cleared || S.newRecord ? 'card' : 'sad', t), 60, 192, { ax: .5, ay: 1 });
    // scoreboard card on the right
    const k = E.outBack(clamp(t / .4, 0, 1));
    g.save(); g.translate(lerp(SW + 90, 176, k), 94);
    panel(g, -70, -78, 140, 150, '#fff8e6', { r: 8, lo: '#e8dcc0' });
    rect(g, -70, -78, 140, 20, cols[1]); rect(g, -70, -59, 140, 1, INK);
    txt(g, S.practice ? (MG[S.practiceId].name || '').toUpperCase() : d.name, 0, -72, '#ffffff', { align: 'c', bold: true });
    txt(g, 'MICROJUEGOS', 0, -46, '#6b6977', { align: 'c' });
    const nk = spring(t - .25, 2, 6);
    mord(g, String(S.count), 0, -34, { u: 3, r: 3.1, rim: 2, sy: 4 }, { anim: () => ({ s: nk }) });
    hline(g, -56, 56, 26, '#e8dcc0');
    txt(g, 'RÉCORD', 0, 34, '#6b6977', { align: 'c' });
    mord(g, String(S.best), 0, 46, { u: 1.3, r: 1.5, rim: 1, sy: 2, fill: ['#ffffff', '#d2f5e4', '#5bb593'] });
    g.restore();
    if (S.newRecord && t > .7) { const b = spring(t - .7, 2.6, 5); g.save(); g.translate(176, 178); g.rotate(-.08); g.scale(b * 1.1, b * 1.1); panel(g, -46, -12, 92, 24, C.pink, { r: 4, line: INK, hi: '#ffd1e4' }); txt(g, '¡NUEVO RÉCORD!', 0, -4, '#ffffff', { align: 'c', bold: true }); g.restore(); if (fl(t * 10) % 4 === 0) S.topFx.add({ k: 'star', x: rnd(120, 236), y: rnd(160, 190), vy: -10, life: .5, r: 3, c: '#fff27a' }); }
  },
  drawResultsBot(g) {
    const S = this.S;
    (S.def.room.bot)(g, S);
    g.globalAlpha = .4; rect(g, 0, 0, SW, SH, INK); g.globalAlpha = 1;
    txt(g, S.cleared ? '¡Fase superada!' : S.practice ? 'Práctica terminada' : 'Vuelve a intentarlo', SW / 2, 40, '#ffffff', { align: 'c', out: INK, bold: true });
    for (const b of S.btns || []) { const pr = S.press === b.id; panel(g, b.x, b.y + (pr ? 2 : 0), b.w, b.h, b.id === 'again' ? C.yellow : b.id === 'share' ? C.pinkL : C.mint, { r: 6, hi: '#ffffff', lo: pr ? null : INK }); txt(g, b.label, b.x + b.w / 2, b.y + b.h / 2 - 3 + (pr ? 2 : 0), INK, { align: 'c', bold: true }); }
  },
};
// after a cutscene the stage scene is re-entered without resetting
const STG_RESUME = new Proxy({}, { get(_, k) { if (k === 'enter') return () => { const S = STG.S; if (S.phase === 'card') STG.startInter(null); }; return STG[k]; } });

// ---------------------------------------------------------------- pieces -----
function drawStampMark(g, x, y, ok, k) {
  const r = 22 * k; if (r < 1) return;
  disc(g, x, y, r + 2, INK); disc(g, x, y, r, ok ? '#5bd18b' : '#ff5a6e'); disc(g, x - r * .15, y - r * .2, r * .72, ok ? '#8ef0b4' : '#ff8d9b');
  if (ok) { thickLine(g, x - r * .45, y, x - r * .1, y + r * .38, 2.2 * k, '#ffffff'); thickLine(g, x - r * .1, y + r * .38, x + r * .5, y - r * .4, 2.2 * k, '#ffffff'); }
  else { thickLine(g, x - r * .4, y - r * .4, x + r * .4, y + r * .4, 2.2 * k, '#ffffff'); thickLine(g, x + r * .4, y - r * .4, x - r * .4, y + r * .4, 2.2 * k, '#ffffff'); }
}
// the bath bomb: a speckled pastel ball with a wick
function drawBathBomb(g, x, y, s, n, t) {
  const r = 9 * s; if (r < 1) return;
  disc(g, x, y, r + 1, INK);
  disc(g, x, y, r, '#ff9fc6'); disc(g, x - 1, y - 1, r - 2, '#ffc0da'); disc(g, x - 3, y - 3, r * .35, '#ffe6f1');
  for (const [dx, dy, c] of [[3, 2, '#7fd6c8'], [-2, 4, '#fff27a'], [4, -3, '#b3a0ff'], [-5, 0, '#7fd6c8'], [1, -5, '#fff27a']]) px(g, x + dx * s, y + dy * s, c);
  rect(g, x + r * .55, y - r * .25, 3, 3, '#8a6a44');
  if (n <= 3 && n >= 1 && s > .9) { const k = 1 - (t * 4 % 1) * .3; txt(g, String(n), x + 1, y - 3, '#ffffff', { align: 'c', out: INK, bold: true }); void k; }
}
function drawLifeDefault(g, x, y, st, bt) {
  const img = buleHead(st === 'alive' ? 'normal' : 'sad');
  if (st === 'gone') { ringPx(g, x, y, 7, 'rgba(255,255,255,.35)'); return; }
  if (st === 'break') { const k = clamp(bt / 1, 0, 1); drawS(g, img, x + Math.sin(bt * 40) * 2 * (1 - k), y + E.inQ(k) * 40, { s: .36 * (1 - k * .3), rot: k * 1.2, alpha: 1 - k }); return; }
  drawS(g, img, x, y, { s: .36 });
}
function drawMiniLifeDefault(g, x, y, alive) { if (alive) drawS(g, buleHead('normal'), x, y, { s: .2 }); else ringPx(g, x, y, 3.5, 'rgba(255,255,255,.5)'); }
function drawPlayTopDefault(g, S) {
  const cols = S.def.room.playCols || [RAMP.green[1], RAMP.green[2]];
  rect(g, 0, 0, SW, SH, cols[0]);
  g.fillStyle = cols[1]; const off = fl(S.pt * 20 * S.bpm / 120);
  for (let x = -SH; x < SW; x += 24) { polyPx(g, [[x + off % 24, SH], [x + 12 + off % 24, SH], [x + 12 + SH + off % 24, 0], [x + SH + off % 24, 0]], cols[1]); }
  if (S.def.room.mini) S.def.room.mini(g, 60, 140, S.g.state === 'play' ? 'watch' : S.g.state === 'won' ? 'win' : 'lose', S);
}
// portal frames — the salon's gilded mirror is the house style
function drawPortalFrame(g, kind, x, y, w, h, beat, a = 1) {
  if (a < 1) g.globalAlpha = a;
  const f = PORTAL_FRAMES[kind] || PORTAL_FRAMES.mirror; f(g, x, y, w, h, beat);
  g.globalAlpha = 1;
}
const PORTAL_FRAMES = {
  mirror(g, x, y, w, h, beat) {
    const G = RAMP.gold, b = 6;
    // moulding rings: dark outer, bright bevel, inner lip (the inside stays untouched)
    ringRect(g, x - b - 1, y - b - 1, w + b * 2 + 2, h + b * 2 + 2, 1, INK);
    ringRect(g, x - b, y - b, w + b * 2, h + b * 2, b - 3, G[2]);
    rect(g, x - b, y - b, w + b * 2, 1, G[4]); rect(g, x - b, y - b, 1, h + b * 2, G[3]);
    rect(g, x - b, y + h + b - 1, w + b * 2, 1, G[0]); rect(g, x + w + b - 1, y - b, 1, h + b * 2, G[1]);
    ringRect(g, x - 3, y - 3, w + 6, h + 6, 1, G[1]); ringRect(g, x - 2, y - 2, w + 4, h + 4, 1, G[3]); ringRect(g, x - 1, y - 1, w + 2, h + 2, 1, INK);
    // beading along the moulding
    for (let i = 4; i < w + b * 2 - 4; i += 4) { px(g, x - b + i, y - b + 2, G[4]); px(g, x - b + i, y + h + b - 3, G[3]); }
    for (let i = 4; i < h + b * 2 - 4; i += 4) { px(g, x - b + 2, y - b + i, G[4]); px(g, x + w + b - 3, y - b + i, G[3]); }
    // rococo corner shells + crest on top
    for (const [cx0, cy0, fx, fy] of [[x - b, y - b, 1, 1], [x + w + b, y - b, -1, 1], [x - b, y + h + b, 1, -1], [x + w + b, y + h + b, -1, -1]]) {
      disc(g, cx0 + fx * 2, cy0 + fy * 2, 5, INK); disc(g, cx0 + fx * 2, cy0 + fy * 2, 4, G[3]); disc(g, cx0 + fx * 1, cy0 + fy * 1, 2, G[4]); px(g, cx0 + fx * 3, cy0 + fy * 3, G[1]);
    }
    const cx0 = x + w / 2, cy0 = y - b - 2, bob = Math.abs(Math.sin(beat * Math.PI)) * 1;
    polyPx(g, [[cx0 - 14, cy0 + 4], [cx0 - 8, cy0 - 4 - bob], [cx0, cy0 - 8 - bob], [cx0 + 8, cy0 - 4 - bob], [cx0 + 14, cy0 + 4]], INK);
    polyPx(g, [[cx0 - 12, cy0 + 3], [cx0 - 7, cy0 - 3 - bob], [cx0, cy0 - 6 - bob], [cx0 + 7, cy0 - 3 - bob], [cx0 + 12, cy0 + 3]], G[3]);
    for (let i = -8; i <= 8; i += 4) linePx(g, cx0 + i * .4, cy0 + 2, cx0 + i, cy0 - 4 - bob + Math.abs(i) * .3, G[1]);
    disc(g, cx0, cy0 - 2 - bob, 2, G[4]);
  },
};
// the mechanic card: a hand demonstrating the gesture
function drawMechCard(g, mech, verb, t, ramp) {
  rect(g, 0, 0, SW, SH, ramp[2]);
  g.fillStyle = ramp[3]; for (let y = 0; y < SH; y += 16) for (let x = ((y / 16) % 2) * 16; x < SW; x += 32) g.fillRect(x + fl(t * 12) % 32 - 16, y, 16, 16);
  const k = spring(t - .1, 2.4, 7);
  mord(g, verb, SW / 2, 22, fitMord(verb, 240, { u: 3, r: 3, rim: 2, sy: 4 }), { anim: (i) => ({ s: Math.max(0, spring(t - .1 - i * .05, 2.4, 7)), rot: Math.sin(t * 3 + i) * .05 }) });
  void k;
  // the demo
  const cx0 = SW / 2, cy0 = 118;
  panel(g, cx0 - 60, cy0 - 30, 120, 60, '#ffffff', { r: 8, lo: '#dce7ea' });
  let hx = cx0, hy = cy0, press = false;
  const tt = t * 1.6;
  drawMechCard._orig = mech;
  if (mech === 'mix') { const all = ['tap', 'rub', 'cut', 'draw', 'drag', 'spin']; mech = all[fl(t * 1.2) % all.length]; }
  if (mech === 'tap') { const ph = tt % 1; press = ph > .5 && ph < .7; hy = cy0 - 4 + (press ? 4 : 0); if (press && !drawMechCard._p) { drawMechCard._p = 1; } if (!press) drawMechCard._p = 0; ringPx(g, cx0, cy0, 6 + (ph > .5 ? (ph - .5) * 30 : 0), press ? C.pink : '#dce7ea'); }
  else if (mech === 'rub') { hx = cx0 + Math.sin(tt * 9) * 22; hy = cy0 + Math.cos(tt * 18) * 3; press = true; for (let i = 0; i < 5; i++) { const q = cx0 + Math.sin((tt - i * .03) * 9) * 22; px(g, q, cy0 + 8, RAMP.pink[2 + (i % 2)]); } }
  else if (mech === 'cut') { const ph = tt % 1; hx = lerp(cx0 - 40, cx0 + 40, E.ioQ(Math.min(1, ph * 1.6))); hy = cy0 - 10 + ph * 20; press = ph < .65; if (press) thickLine(g, cx0 - 40, cy0 - 10, hx, hy, 1, C.pink); }
  else if (mech === 'draw') { const ph = tt % 1.4; press = ph < 1.1; const a = Math.min(1, ph / 1.1) * TAU; hx = cx0 + Math.cos(a) * 18; hy = cy0 + Math.sin(a) * 14; for (let q = 0; q < a; q += .12) px(g, cx0 + Math.cos(q) * 18, cy0 + Math.sin(q) * 14, C.purple); }
  else if (mech === 'drag') { const ph = tt % 1.4, k2 = E.ioQ(clamp(ph / 1, 0, 1)); hx = lerp(cx0 - 36, cx0 + 36, k2); hy = cy0 - Math.sin(k2 * Math.PI) * 10; press = ph < 1.05; rect(g, cx0 + 30, cy0 + 4, 14, 10, '#dce7ea'); disc(g, hx, hy + 6, 5, C.yellow); }
  else if (mech === 'spin') { const a = tt * 5; hx = cx0 + Math.cos(a) * 20; hy = cy0 + Math.sin(a) * 16; press = true; ringPx(g, cx0, cy0, 18, '#dce7ea'); }
  else { const ph = tt % 1; press = ph > .5 && ph < .7; hy = cy0 + (press ? 3 : 0); }
  drawHand(g, hx, hy, press);
  const tipText = { tap: 'Toca con el dedo', rub: 'Frota rápido, sin soltar', cut: 'Corta de un tajo rápido', draw: 'Dibuja sin levantar el dedo', drag: 'Arrastra y suelta', spin: 'Gira en círculos', mix: '¡De todo un poco!' }[drawMechCard._orig || mech];
  if (tipText) { panel(g, cx0 - 70, cy0 + 36, 140, 16, INK, { r: 4, line: INK }); txt(g, tipText, cx0, cy0 + 40, '#ffffff', { align: 'c' }); }
}
// a pointing hand (the player's finger) — tip at (x, y)
function drawHand(g, x, y, press) {
  const img = mdl('hand', () => spr([
    '....kk......',
    '...kwwk.....',
    '...kwwk.....',
    '...kwwk.....',
    '...kwwkkk...',
    '...kwwkwwkk.',
    '.kkkwwkwwkwk',
    'kwwkwwwwwkwk',
    'kwwwwwwwwwwk',
    '.kwwwwwwwwwk',
    '..kwwwwwwwsk',
    '..kswwwwwssk',
    '...kssssssk.',
    '....kkkkkk..'], { k: INK, w: '#fff4e4', s: '#e9c7a8' }));
  drawS(g, img, x + 1, y + (press ? 1 : 0), { ax: .38, ay: 0 });
}

// a stage's microgame list may be computed (mix stages gather everyone's games)
function stageGames(def) { const l = typeof def.games === 'function' ? def.games() : def.games; return l.filter(id => MG[id]); }
// every regular microgame of the six story stages
const STORY_STAGES = ['anahi', 'rizos', 'pompon', 'hermanas', 'ceniza', 'bigotes'];
function allStoryGames() { return MG_ORDER.filter(id => STORY_STAGES.includes(MG[id].stage) && !MG[id].boss); }

// stage clear on the touch screen: a huge first-prize rosette bounces in
function drawClearBotDefault(g, S) {
  const t = S.pt, k = spring(t - .2, 1.8, 5);
  g.globalAlpha = Math.min(.55, t); rect(g, 0, 0, SW, SH, INK); g.globalAlpha = 1;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .6; polyPx(g, [[SW / 2, 96], [SW / 2 + Math.cos(a - .09) * 200, 96 + Math.sin(a - .09) * 200], [SW / 2 + Math.cos(a + .09) * 200, 96 + Math.sin(a + .09) * 200]], i % 2 ? 'rgba(255,223,79,.25)' : 'rgba(255,255,255,.12)'); }
  if (k <= 0) return;
  g.save(); g.translate(SW / 2, 92); g.scale(k, k); g.rotate(Math.sin(t * 2) * .08);
  // ribbons
  for (const s of [-1, 1]) { polyPx(g, [[s * 8, 10], [s * 30, 80], [s * 18, 70], [s * 8, 84], [s * -2, 12]], INK); polyPx(g, [[s * 8, 12], [s * 28, 77], [s * 18, 67], [s * 9, 80], [s * 0, 14]], s < 0 ? '#e23b4e' : '#3565cc'); }
  disc(g, 0, 0, 40, INK); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; disc(g, Math.cos(a) * 34, Math.sin(a) * 34, 7, i % 2 ? '#ffdf4f' : '#ffc23a'); }
  disc(g, 0, 0, 29, INK); disc(g, 0, 0, 28, '#fffaf0'); disc(g, -3, -3, 22, '#ffffff');
  mord(g, '1', 0, -17, { u: 2, r: 2.2, rim: 2, sy: 2 });
  g.restore();
  if (t > .6) txt(g, '¡Primer premio!', SW / 2, 168, '#ffffff', { align: 'c', out: INK, bold: true });
  if (fl(t * 8) % 3 === 0) S.fx.add({ k: 'star', x: rnd(40, 216), y: rnd(20, 160), vy: -20, life: .6, r: 3, c: '#fff27a' });
}

// a tiny looping demo of the gesture next to the command (top screen)
function drawMechMini(g, x, y, mech, t) {
  panel(g, x - 13, y - 13, 26, 26, '#ffffff', { r: 6, lo: '#dce7ea' });
  const ph = (t * 2) % 1;
  if (mech === 'rub') { for (let i = -6; i <= 6; i += 3) px(g, x + i, y + 6, C.pink); drawHandMini(g, x + Math.sin(t * 14) * 5, y - 2, true); }
  else if (mech === 'cut') { const k = E.ioQ(ph); thickLine(g, x - 8, y + 5, lerp(x - 8, x + 8, k), lerp(y + 5, y - 5, k), .6, C.pink); drawS(g, scissorsSpr(), lerp(x - 8, x + 8, k), lerp(y + 5, y - 5, k), { rot: -.5 }); }
  else if (mech === 'draw') { const a = ph * TAU; for (let q = 0; q < a; q += .3) px(g, x + Math.cos(q) * 7, y + Math.sin(q) * 6, C.purple); drawHandMini(g, x + Math.cos(a) * 7, y + Math.sin(a) * 6 - 4, true); }
  else if (mech === 'drag') { const k = E.ioQ(Math.min(1, ph * 1.3)); disc(g, lerp(x - 6, x + 6, k), y + 3, 3, C.yellow); drawHandMini(g, lerp(x - 6, x + 6, k), y - 1, ph < .8); }
  else if (mech === 'spin') { ringPx(g, x, y, 8, '#dce7ea'); const a = t * 8; drawHandMini(g, x + Math.cos(a) * 7, y + Math.sin(a) * 7 - 4, true); }
  else { const pr = ph > .5 && ph < .75; if (pr) ringPx(g, x, y + 4, 5, C.pink); drawHandMini(g, x, y - 3 + (pr ? 2 : 0), pr); }
}
function drawHandMini(g, x, y, press) {
  const img = mdl('handMini', () => spr(['..k....', '.kwk...', '.kwkkk.', 'kkwwwwk', 'kwwwwwk', '.kwwwk.', '..kkk..'], { k: INK, w: '#fff4e4' }));
  drawS(g, img, x + 1, y + (press ? 1 : 0), { ax: .35, ay: 0 });
}

// the phone's own share sheet: score + link (helps the salon get known)
function shareScore(S) {
  const name = S.practice ? (MG[S.practiceId].name || '') : S.def.name;
  const text = '¡He aguantado ' + S.count + ' microjuegos en WESTIE WARE (' + name + ')! 🐶✂️ Peluquería canina Westie BLVRD, Barcelona.';
  const url = 'https://gavilanbe.github.io/westieware/';
  try { if (navigator.share) navigator.share({ title: 'WESTIE WARE ¡Tocados!', text, url }).catch(() => { }); } catch (e) { }
}

// Ghost hand: at the start of a microgame (always at level 1, and the first
// times you meet it) a translucent hand shows the gesture right where it
// goes. A microgame opts in with hint(g) → { x, y, mech?, path?: [[x,y],…], to?: [x,y] }.
const HINT_SEEN = {};
function drawMgHint(g, gm, beat, bd) {
  if (!gm.def.hint || gm.def.boss) return;
  const seen = SAVE.seen[gm.id + ':n'] || 0;
  if (gm.level > 1 && seen > 2) return;
  const T = beat * bd, dur = Math.max(.9, 1.6 * bd);
  if (T > dur || gm.state !== 'play') return;
  if (!HINT_SEEN[gm.id + gm.t0]) { HINT_SEEN[gm.id + gm.t0] = 1; }
  let h; try { h = gm.def.hint(gm); } catch (e) { return; }
  if (!h) return;
  const a = T < dur * .75 ? 1 : 1 - (T - dur * .75) / (dur * .25), mech = h.mech || gm.def.mech, ph = (T * 2.2) % 1;
  let x = h.x, y = h.y, press = false;
  if (mech === 'tap') { press = ph > .45 && ph < .7; if (press) { g.globalAlpha = a * .8; ringPx(g, x, y, 5 + (ph - .45) * 30, '#ffffff'); } }
  else if (mech === 'rub') { x += Math.sin(T * 16) * 14; press = true; }
  else if (mech === 'spin') { const an = T * 7 * (h.dir || 1), r = h.r || 16; x += Math.cos(an) * r; y += Math.sin(an) * r; press = true; }
  else if ((mech === 'cut' || mech === 'draw' || mech === 'drag') && (h.path || h.to)) {
    const P = h.path || [[h.x, h.y], h.to], k = Math.min(1, ph * 1.4), n = P.length - 1, seg = Math.min(n - 1, fl(k * n)), f = k * n - seg;
    x = lerp(P[seg][0], P[seg + 1][0], f); y = lerp(P[seg][1], P[seg + 1][1], f); press = k < 1;
    g.globalAlpha = a * .7; for (let i = 0; i < n; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1]; const L = Math.hypot(x1 - x0, y1 - y0); for (let q = 0; q < L; q += 4) px(g, lerp(x0, x1, q / L), lerp(y0, y1, q / L), '#ffffff'); }
  }
  g.globalAlpha = a * .85; drawHand(g, x, y, press); g.globalAlpha = 1;
}

// chunky white "brush" lettering with a heavy ink rim (the user's banner style)
function drawBrushWords(g, lines, x, y, t) {
  const st = { u: 2.4, r: 2.8, rim: 3, sy: 4, sx: 2, fill: ['#ffffff', '#ffffff', '#ececf2'], line: INK, shadow: INK, slant: .22 };
  lines.forEach((w, li) => {
    const s2 = fitMord(w, 220, st), lt0 = t - li * .18;
    mord(g, w, x + li * 10, y + li * 34, s2, { anim: (i) => { const lt = lt0 - i * .04; if (lt <= 0) return { s: 0 }; return { s: spring(lt, 2.6, 6), rot: -.12 + Math.sin(t * 5 + i) * .03, dy: Math.sin(t * 6 + i * .8) * 1.5 }; } });
  });
}
