// ============================================================================
//  main — boot + debug hooks (?escena=… &ff=seconds &bot=1 for captures/tests).
// ============================================================================
'use strict';
const SCENE_TABLE = {
  lab: () => go(LAB),
  stage: () => go(STG, { id: QS.get('id') || 'anahi', story: !QS.has('nostory') }),
  mg: () => go(MGT),
  title: () => go(TITLE),
  icon: () => go(ICON),
  boot: () => go(BOOT),
  menu: () => { if (QS.has('all')) for (const id of STAGE_ORDER) SAVE.cleared[id] = 1; go(MENU, {}); },
  cut: () => playCut(QS.get('id') || 'prologo', () => go(MENU, {})),
};
function boot() {
  relayout(); checkOrientation();
  if (QS.get('test') === 'mg') { runMgTests(); return; }
  if (QS.get('test') === 'stage') { runStageTest(); return; }
  if (QS.get('test') === 'progress') { runProgressTest(); return; }
  if (QS.get('test') === 'audio') { runAudioTest(); return; }
  if (QS.get('test') === 'cut') { runCutTest(); return; }
  if (QS.get('test') === 'thumb') { runThumb(); return; }
  if (QS.get('test') === 'list') { const d = STAGES[QS.get('id')]; document.documentElement.setAttribute('data-result', d ? stageGames(d).concat(d.boss ? [d.boss] : []).join(' ') : ''); return; }
  if (QS.has('bot')) BOTIN.on = true;
  const f = SCENE_TABLE[SCENE_ARG];
  if (f) f(); else if (typeof BOOT !== 'undefined') go(BOOT); else go(LAB);
  // fast-forward for deterministic captures: run the simulation n seconds ahead
  const ff = +(QS.get('ff') || 0);
  for (let i = 0; i < ff * 60; i++) { try { tick(STEP); } catch (e) { reportError(e); } }
  try { render(); } catch (e) { reportError(e); }
  requestAnimationFrame(frame);
}
// the bot plays whatever microgame is running (tests + captures)
function botDrive() {
  let g = null;
  if ((SCENE === STG || (SCENE && SCENE.wrapsStage)) && STG.S && STG.S.phase === 'play') g = STG.S.g;
  if (SCENE === CUT && CUT.mg) g = CUT.mg;
  if (typeof MGT !== 'undefined' && SCENE === MGT) g = MGT.g;
  if (g && g.def.bot) { const o = g.def.bot(g) || {}; BOTIN.x = o.x != null ? o.x : BOTIN.x; BOTIN.y = o.y != null ? o.y : BOTIN.y; BOTIN.down = !!o.down; }
  else BOTIN.down = false;
}
boot();
