// ============================================================================
//  ui — the console itself (frame, hinge, lid), transitions between scenes.
// ============================================================================
'use strict';

// The console: Westie-BLVRD green, cream piping, a brass plate on the hinge.
function buildFrame(W, H) {
  const c = mkCanvas(W, H), g = c.g;
  const G = RAMP.green;
  // body
  panel(g, 0, 0, W, H, G[2], { r: 8, line: '#04140d' });
  g.fillStyle = G[3]; g.fillRect(8, 1, W - 16, 1); g.fillRect(1, 8, 1, H - 16);
  g.fillStyle = G[1]; g.fillRect(8, H - 2, W - 16, 1); g.fillRect(W - 2, 8, 1, H - 16);
  const T0 = LAY.top, B0 = LAY.bot;
  // lid seam: the two halves meet at the hinge
  const hy0 = T0.y + SH + 1, hy1 = B0.y - 2;
  // screen wells (ink border + dark inner lip)
  for (const s of [T0, B0]) {
    rect(g, s.x - 2, s.y - 2, SW + 4, SH + 4, '#04140d');
    rect(g, s.x - 1, s.y - 1, SW + 2, SH + 2, INK);
  }
  // hinge: a cylinder across, knuckles at the ends
  const hh = hy1 - hy0 + 1;
  bandsV(g, 0, hy0, W, hh, [G[1], G[2], G[3], G[2], G[1], G[0]]);
  rect(g, 0, hy0, W, 1, G[0]); rect(g, 0, hy1, W, 1, '#04140d');
  for (const kx of [0, W - 40]) {
    bandsV(g, kx, hy0 + 1, 40, hh - 2, [G[2], G[3], G[4], G[3], G[2], G[1]]);
    rect(g, kx === 0 ? 39 : kx, hy0 + 1, 1, hh - 2, G[0]);
  }
  // brass plate + power LED
  const pw = 76, px0 = rd(W / 2 - pw / 2), py0 = rd(hy0 + hh / 2 - 5);
  panel(g, px0, py0, pw, 10, RAMP.gold[3], { r: 2, line: RAMP.gold[0], hi: RAMP.gold[4], lo: RAMP.gold[1] });
  txt(g, 'WESTIE BLVRD', W / 2, py0 + 2, RAMP.gold[0], { align: 'c' });
  // lid (only on tall phones): speaker grilles + logo
  if (LAY.lid >= 14) {
    const ly = FR, lh = LAY.lid - 4;
    for (const sx of [14, W - 30]) for (let j = 0; j < Math.min(5, fl(lh / 5)); j++) for (let i = 0; i < 4; i++) { px(g, sx + i * 4, ly + 4 + j * 4, G[0]); px(g, sx + i * 4 + 1, ly + 4 + j * 4, G[1]); }
    if (lh >= 22) {
      FRAME_LOGO = { y: ly + lh / 2 };
    }
  } else FRAME_LOGO = null;
  const base = H - (B0.y + SH);
  if (base >= 16) {
    // a stylus parked in its slot along the bottom
    const sy = B0.y + SH + fl(base / 2) - 1;
    rect(g, 30, sy, W - 60, 3, G[0]);
    rect(g, 32, sy + 1, W - 64, 1, RAMP.steel[2]);
    rect(g, W - 36, sy, 5, 3, RAMP.gold[2]);
  }
  return c;
}
let FRAME_LOGO = null;
// live details on the frame: LED and the lid logo
const LED = { mode: 'on', t: 0 };
function drawFrameOver(g) {
  const hy = LAY.top.y + SH + 1 + rd(HINGE / 2) - 1, x = LAY.W - 22;
  let on = true;
  if (LED.mode === 'blink') on = (NOW * 6 | 0) % 2 === 0;
  rect(g, x, hy, 3, 2, on ? '#7dff9a' : '#1f5a30');
  if (on) { px(g, x + 1, hy - 1, '#c8ffd4'); }
  if (FRAME_LOGO && typeof drawLidLogo === 'function') drawLidLogo(g, LAY.W / 2, FRAME_LOGO.y);
}

// ---------------------------------------------------------------- transitions
// drawn across both screens as one tall picture (the hinge is skipped)
function tallRect(fn) { // fn(g, oy) is called for top (oy=0) and bottom (oy=SH+HINGE)
  fn(T, 0); fn(B, SH + HINGE);
}
function pawHole(g, cx, cy, s, oy) {
  // paw print: main pad + four toes, as a hole (destination-out)
  if (s <= 0) return;
  g.save(); g.globalCompositeOperation = 'destination-out';
  ellipsePx(g, cx, cy - oy + s * .35, s * .62, s * .5, '#000');
  const toes = [[-.62, -.32, .2], [-.24, -.62, .21], [.24, -.62, .21], [.62, -.32, .2]];
  for (const [tx, ty, tr] of toes) ellipsePx(g, cx + tx * s, cy - oy + ty * s, tr * s * 1.05, tr * s * 1.25, '#000');
  g.restore();
}
function drawTransition(tr) {
  const k = tr.t / tr.dur, half = k < .5, q = half ? k * 2 : (k - .5) * 2; // q: 0→1 in each half
  const cxp = SW / 2, cyp = SH + HINGE / 2;
  if (tr.kind === 'paw') {
    // paw iris: closes on the centre, opens again
    const s = half ? lerp(420, 0, E.inC(q)) : lerp(0, 420, E.outC(q));
    tallRect((g, oy) => {
      const ov = mkOverlay(); ov.g.clearRect(0, 0, SW, SH); ov.g.fillStyle = tr.col; ov.g.fillRect(0, 0, SW, SH);
      pawHole(ov.g, cxp, cyp, s, oy);
      g.drawImage(ov, 0, 0);
    });
  } else if (tr.kind === 'white' || tr.kind === 'fade') {
    const a = half ? E.inQ(q) : 1 - E.outQ(q);
    tallRect(g => { g.globalAlpha = a; g.fillStyle = tr.kind === 'white' ? '#ffffff' : tr.col; g.fillRect(0, 0, SW, SH); g.globalAlpha = 1; });
  } else if (tr.kind === 'blinds') {
    // venetian blinds in brand stripes
    tallRect((g, oy) => {
      for (let y = -((oy) % 16); y < SH; y += 16) {
        const h = half ? rd(16 * E.inQ(q)) : rd(16 * (1 - E.outQ(q)));
        g.fillStyle = ((y + oy) / 16 | 0) % 2 ? RAMP.green[1] : RAMP.green[2]; g.fillRect(0, y, SW, h);
      }
    });
  } else if (tr.kind === 'curtain') {
    // green velvet curtains meet in the middle
    const w = half ? lerp(0, SW / 2 + 8, E.outBounce(q)) : lerp(SW / 2 + 8, 0, E.inQ(q));
    tallRect((g, oy) => {
      for (const side of [0, 1]) {
        const x0 = side ? SW - w : 0;
        g.fillStyle = RAMP.green[1]; g.fillRect(rd(x0), 0, rd(w), SH);
        for (let fx = 0; fx < w; fx += 12) { const xx = side ? SW - fx - 6 : fx + 6; g.fillStyle = RAMP.green[2]; g.fillRect(rd(xx - 2), 0, 3, SH); g.fillStyle = RAMP.green[0]; g.fillRect(rd(xx + 2), 0, 1, SH); }
        g.fillStyle = RAMP.gold[2]; g.fillRect(rd(side ? SW - w : w - 2), 0, 2, SH);
      }
      if (oy === 0) { g.fillStyle = RAMP.gold[1]; g.fillRect(0, 0, SW, 6); g.fillStyle = RAMP.gold[3]; g.fillRect(0, 1, SW, 2); }
    });
  }
}
let _ov = null;
function mkOverlay() { if (!_ov) _ov = mkCanvas(SW, SH); return _ov; }

function drawRotateHint(g) {
  const W = LAY.W, H = LAY.H;
  g.globalAlpha = .88; g.fillStyle = INK; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const cx0 = W / 2, cy0 = H / 2 - 20, a = Math.sin(NOW * 2) * .5 + .3;
  g.save(); g.translate(cx0, cy0); g.rotate(a);
  panel(g, -18, -30, 36, 60, '#ffffff', { r: 5 }); rect(g, -14, -24, 28, 46, RAMP.green[2]); drawS(g, lifeWestie(), 0, 0);
  g.restore();
  txt(g, 'WESTIE WARE se juega en vertical', cx0, cy0 + 50, '#ffffff', { align: 'c', bold: true });
  txt(g, 'Gira el móvil ↻  (o toca para seguir)', cx0, cy0 + 64, RAMP.mint[3], { align: 'c' });
}
