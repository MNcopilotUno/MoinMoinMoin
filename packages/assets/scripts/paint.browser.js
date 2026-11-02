// The painter for Moin Moin Moin (.agents/features/north-german-art.md). Runs in the local
// Chromium, loaded by render-art.mjs; build-time only, nothing here ships.
// 1. Underpainting: a composed North German scene on a canvas — Speicherstadt gables, the Michel,
//    a shrimp cutter, the fish auction hall, the dyke, the lighthouse, a Hallig on the mudflats —
//    with a real, rippled reflection.
// 2. Brushwork: seeded strokes, coarse to fine, that take the underpainting's colour, follow the
//    edge they sit on, stop where the colour changes and lie flat on the water; some are broken
//    towards lilac, peach and sage. Same seed, same strokes on the same Chromium.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const alpha = (c, a) => { const A = hx(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };

const DAY = {
  sky: ['#8FA7CF', '#B7B8DD', '#D9C7DE', '#F1D3C3', '#F7DDC4'], sun: '#FFE7C4', glow: '#F7BE93',
  cloud: ['#F4E3E0', '#E2D6EA', '#F7D9C2', '#C9C4E2'], haze: '#B9B2CF', hazeDark: '#9C98BE', michel: '#7FA79A',
  brick: ['#A9604D', '#B86E57', '#94503F', '#C27C62'], brickShade: '#6E4A55', copper: '#79A596', frame: '#EFE4D2',
  glass: '#4D5A7E', stone: '#7E7A92', quayTop: '#B9AFA6', water: ['#C6CADB', '#A3B6CC', '#8299B8', '#62789F'],
  hull: '#2F5A50', hullBand: '#EFEBE2', cabin: '#F2EEE6', rig: '#3A3F5C', net: '#4A5368', light: '#FFFFFF', night: false,
  dyke: ['#9DB58A', '#B9C79A'], sand: '#EBD6B4', thatch: '#9C8763', sheep: '#F4EFE6', ferry: '#F4F1EC', ferryBand: '#3D5A9C',
  mud: ['#CDBDC2', '#B9A89F', '#A08C80'], mudDark: '#6E5E62',
};
const NIGHT = {
  sky: ['#0E1430', '#1A2147', '#2A2E5C', '#3E3A68', '#54496F'], sun: '#F6EFCF', glow: '#C9C3E6',
  cloud: ['#2F3563', '#3A3B6C', '#4A4472', '#262C55'], haze: '#262A52', hazeDark: '#1C2044', michel: '#3D5A60',
  brick: ['#4A3346', '#553A4C', '#3F2C40', '#5E4252'], brickShade: '#241D36', copper: '#36545A', frame: '#8E8AA8',
  glass: '#FFC970', stone: '#2A2B48', quayTop: '#3E3F5E', water: ['#2D3460', '#222A50', '#1A2142', '#111731'],
  hull: '#16272F', hullBand: '#6C6E8E', cabin: '#5E6088', rig: '#0E1226', net: '#1A2036', light: '#FFE3A0', night: true,
  dyke: ['#22344A', '#2B3D52'], sand: '#4A4868', thatch: '#3A3446', sheep: '#8C8AA6', ferry: '#55597F', ferryBand: '#1F2D5A',
  mud: ['#3A3C64', '#302F55', '#25243F'], mudDark: '#14142A',
};

function grad(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }

function sky(ctx, w, hy, P, r, sun) {
  ctx.fillStyle = grad(ctx, 0, 0, 0, hy, P.sky); ctx.fillRect(0, 0, w, hy + 2);
  const g = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, w * 0.55);
  g.addColorStop(0, alpha(P.glow, P.night ? 0.35 : 0.85)); g.addColorStop(0.4, alpha(P.glow, P.night ? 0.12 : 0.3)); g.addColorStop(1, alpha(P.glow, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, hy);
  // soft cumulus banks, lit from the sun side
  ctx.save(); ctx.filter = `blur(${Math.round(w * 0.012)}px)`;
  for (let i = 0; i < 46; i++) {
    const cy = hy * (0.12 + r() * 0.7), cx = r() * w, rx = w * (0.06 + r() * 0.16), ry = rx * (0.22 + r() * 0.2);
    ctx.fillStyle = alpha(P.cloud[Math.floor(r() * P.cloud.length)], 0.35 + r() * 0.35);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  if (P.night) { for (let i = 0; i < 220; i++) { ctx.fillStyle = alpha('#FFF6DA', 0.3 + r() * 0.6); ctx.fillRect(r() * w, r() * hy * 0.8, 1.2 + r() * 1.6, 1.2 + r() * 1.6); } }
  ctx.fillStyle = P.sun; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2); ctx.fill();
}

function farShore(ctx, w, hy, P, r, s, opts = {}) {
  // a low hazy city: roofs, port cranes, the Michel's copper spire
  ctx.fillStyle = P.haze; ctx.beginPath(); ctx.moveTo(0, hy);
  for (let x = 0; x <= w; x += 6 * s) ctx.lineTo(x, hy - (4 + 6 * Math.abs(Math.sin(x / (37 * s))) + 4 * Math.abs(Math.sin(x / (13 * s))) + r() * 2) * s);
  ctx.lineTo(w, hy); ctx.fill();
  ctx.strokeStyle = P.hazeDark; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
  for (const [cx, ch, arm] of opts.cranes || []) {
    const x = cx * w; ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, hy - ch * s); ctx.lineTo(x + arm * s, hy - ch * s);
    ctx.moveTo(x, hy - (ch - 8) * s); ctx.lineTo(x + arm * 0.5 * s, hy - ch * s); ctx.moveTo(x + arm * 0.8 * s, hy - ch * s); ctx.lineTo(x + arm * 0.8 * s, hy - (ch - 14) * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 6 * s, hy); ctx.lineTo(x, hy - 14 * s); ctx.lineTo(x + 6 * s, hy); ctx.stroke();
  }
  if (opts.michel != null) {
    const x = opts.michel * w, b = hy - 6 * s;
    ctx.fillStyle = P.hazeDark; ctx.fillRect(x - 5 * s, b - 34 * s, 10 * s, 36 * s);
    ctx.fillStyle = P.michel; ctx.beginPath(); ctx.moveTo(x - 6 * s, b - 34 * s); ctx.lineTo(x - 3 * s, b - 48 * s); ctx.lineTo(x - 1.4 * s, b - 64 * s); ctx.lineTo(x, b - 76 * s); ctx.lineTo(x + 1.4 * s, b - 64 * s); ctx.lineTo(x + 3 * s, b - 48 * s); ctx.lineTo(x + 6 * s, b - 34 * s); ctx.fill();
    ctx.fillStyle = alpha(P.light, 0.35); ctx.fillRect(x - 3 * s, b - 42 * s, 2 * s, 6 * s);
  }
  if (P.night) for (let i = 0; i < 70; i++) { ctx.fillStyle = alpha('#FFD27A', 0.5 + r() * 0.5); ctx.fillRect(r() * w, hy - (2 + r() * 10) * s, 1.4 * s, 1.6 * s); }
}

function lighthouse(ctx, x, base, s, P) {
  // a North Sea tower: white with ink bands (red is kept for Moin)
  const h = 58 * s;
  ctx.fillStyle = P.night ? '#6C6E92' : '#F6F2EA';
  ctx.beginPath(); ctx.moveTo(x - 7 * s, base); ctx.lineTo(x - 4.5 * s, base - h); ctx.lineTo(x + 4.5 * s, base - h); ctx.lineTo(x + 7 * s, base); ctx.fill();
  ctx.fillStyle = P.night ? '#1E2246' : '#2F3E66';
  for (const t of [0.22, 0.5, 0.78]) { const y = base - h * t, hw = 7 * s - 2.5 * s * t; ctx.fillRect(x - hw, y - 5 * s, hw * 2, 8 * s); }
  ctx.fillStyle = P.night ? '#2A2E52' : '#3A4466'; ctx.fillRect(x - 6 * s, base - h - 3 * s, 12 * s, 3 * s);
  ctx.fillStyle = P.night ? '#FFE7A6' : '#F7E4C4'; ctx.fillRect(x - 3.5 * s, base - h - 11 * s, 7 * s, 8 * s);
  ctx.fillStyle = P.night ? '#1E2246' : '#2F3E66'; ctx.beginPath(); ctx.moveTo(x - 5 * s, base - h - 11 * s); ctx.lineTo(x, base - h - 17 * s); ctx.lineTo(x + 5 * s, base - h - 11 * s); ctx.fill();
  if (P.night) { const g = ctx.createRadialGradient(x, base - h - 7 * s, 0, x, base - h - 7 * s, 60 * s); g.addColorStop(0, 'rgba(255,230,160,.55)'); g.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - 60 * s, base - h - 67 * s, 120 * s, 120 * s); }
}

/** Speicherstadt / Lübeck brick warehouses with stepped gables, facing the water. */
function warehouses(ctx, x0, x1, base, P, r, s, opts = {}) {
  let x = x0; let i = 0;
  const scaleAt = (xx) => opts.recede ? 1 - 0.45 * ((xx - x0) / (x1 - x0)) : 1;
  while (x < x1) {
    const k = scaleAt(x) * s;
    const bw = (44 + r() * 26) * k, bh = (opts.height || 92) * k * (0.85 + r() * 0.35);
    const top = base - bh, brick = P.brick[i % P.brick.length];
    // body
    ctx.fillStyle = grad(ctx, 0, top, 0, base, [mix(brick, P.night ? '#000000' : '#F3C9A6', P.night ? 0.2 : 0.18), brick, mix(brick, P.brickShade, 0.35)]);
    ctx.fillRect(x, top, bw, bh);
    // stepped gable
    const steps = 4, gh = bw * 0.55;
    ctx.beginPath(); ctx.moveTo(x, top);
    for (let j = 0; j < steps; j++) { const sx = x + (bw / 2) * (j / steps), sy = top - gh * (j / steps); ctx.lineTo(sx, sy - gh / steps); ctx.lineTo(sx + (bw / 2) / steps, sy - gh / steps); }
    for (let j = steps - 1; j >= 0; j--) { const sx = x + bw - (bw / 2) * (j / steps), sy = top - gh * (j / steps); ctx.lineTo(sx - (bw / 2) / steps, sy - gh / steps); ctx.lineTo(sx, sy - gh / steps); }
    ctx.lineTo(x + bw, top); ctx.closePath(); ctx.fill();
    // hoist beam under the gable top, the Speicherstadt winch
    ctx.fillStyle = P.night ? '#1E1A2E' : '#3E3346'; ctx.fillRect(x + bw / 2 - 1.2 * k, top - gh * 0.75, 2.4 * k, gh * 0.5);
    ctx.fillRect(x + bw / 2 - 1 * k, top - gh * 0.78, 9 * k, 2 * k);
    // copper turret on some
    if (i % 3 === 1) { ctx.fillStyle = P.copper; ctx.beginPath(); ctx.moveTo(x + bw * 0.38, top - gh * 0.9); ctx.lineTo(x + bw / 2, top - gh * 1.45); ctx.lineTo(x + bw * 0.62, top - gh * 0.9); ctx.fill(); }
    // windows: rows of arched openings with cream frames
    const cols = Math.max(2, Math.round(bw / (12 * k))), rows = Math.max(3, Math.round(bh / (17 * k)));
    for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) {
      const ww = bw / cols * 0.48, wh = bh / rows * 0.52;
      const wx = x + (cc + 0.26) * (bw / cols), wy = top + (rr + 0.24) * (bh / rows);
      const lit = P.night && r() < 0.42;
      ctx.fillStyle = P.frame; ctx.fillRect(wx - 1 * k, wy - 1 * k, ww + 2 * k, wh + 2 * k);
      ctx.fillStyle = lit ? mix('#FFC970', '#FFE6A8', r()) : P.night ? '#141830' : mix(P.glass, '#8FA2C4', r() * 0.4);
      ctx.fillRect(wx, wy, ww, wh);
      if (!P.night && r() < 0.25) { ctx.fillStyle = alpha('#F7D8BE', 0.5); ctx.fillRect(wx, wy, ww * 0.4, wh); }
    }
    // gable windows
    ctx.fillStyle = P.night && r() < 0.5 ? '#FFD27A' : P.glass; ctx.fillRect(x + bw / 2 - 3 * k, top - gh * 0.42, 6 * k, 8 * k);
    // side shade between houses
    ctx.fillStyle = alpha(P.brickShade, 0.55); ctx.fillRect(x + bw - 3 * k, top, 3 * k, bh);
    if (opts.recede) { const f = Math.max(0, (x - x0) / (x1 - x0)) * 0.42; ctx.fillStyle = alpha(P.haze, f); ctx.fillRect(x - 1, top - gh * 1.5, bw + 2, bh + gh * 1.5); }
    x += bw + 1 * k; i++;
  }
  // quay wall: granite with a lighter coping, bollards
  const qh = 12 * s;
  ctx.fillStyle = P.stone; ctx.fillRect(x0, base, x1 - x0, qh);
  ctx.fillStyle = P.quayTop; ctx.fillRect(x0, base - 2 * s, x1 - x0, 3 * s);
  ctx.fillStyle = P.night ? '#141830' : '#3A3F5C';
  for (let bx = x0 + 18 * s; bx < x1 - 8 * s; bx += 46 * s) { ctx.fillRect(bx, base - 7 * s, 5 * s, 6 * s); ctx.fillRect(bx - 1.5 * s, base - 8 * s, 8 * s, 2 * s); }
  return base + qh;
}

/** A Krabbenkutter: green hull, white band, wheelhouse, net booms raised in a V. */
function cutter(ctx, x, wl, s, P, r, flip = 1) {
  ctx.save(); ctx.translate(x, wl); ctx.scale(flip * s, s);
  // booms and rigging first (behind)
  ctx.strokeStyle = P.rig; ctx.lineCap = 'round';
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-4, -14); ctx.lineTo(-4, -78); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -20); ctx.lineTo(-62, -64); ctx.moveTo(-4, -20); ctx.lineTo(54, -66); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-4, -78); ctx.lineTo(-62, -64); ctx.moveTo(-4, -78); ctx.lineTo(54, -66); ctx.stroke();
  // nets hanging from the booms
  ctx.fillStyle = alpha(P.net, 0.8);
  for (const [bx, by] of [[-62, -64], [54, -66]]) { ctx.beginPath(); ctx.moveTo(bx - 3, by); ctx.quadraticCurveTo(bx - 8, by + 18, bx - 1, by + 34); ctx.lineTo(bx + 4, by + 30); ctx.quadraticCurveTo(bx + 6, by + 14, bx + 3, by); ctx.fill(); }
  // hull
  ctx.fillStyle = P.hull; ctx.beginPath(); ctx.moveTo(-66, -16); ctx.quadraticCurveTo(-20, -10, 58, -20); ctx.quadraticCurveTo(60, -2, 46, 4); ctx.lineTo(-54, 4); ctx.quadraticCurveTo(-64, -2, -66, -16); ctx.fill();
  ctx.fillStyle = P.hullBand; ctx.beginPath(); ctx.moveTo(-66, -16); ctx.quadraticCurveTo(-20, -10, 58, -20); ctx.lineTo(58, -16); ctx.quadraticCurveTo(-20, -6, -65, -12); ctx.fill();
  ctx.fillStyle = alpha('#000000', P.night ? 0.3 : 0.18); ctx.fillRect(-56, -2, 102, 6);
  // wheelhouse
  ctx.fillStyle = P.cabin; ctx.fillRect(14, -40, 26, 24);
  ctx.fillStyle = P.night ? '#FFD27A' : '#46557C'; for (let j = 0; j < 3; j++) ctx.fillRect(17 + j * 8, -35, 5, 7);
  ctx.fillStyle = P.hull; ctx.fillRect(12, -43, 30, 4);
  ctx.fillStyle = P.night ? '#2A2E52' : '#2F3E66'; ctx.fillRect(30, -52, 4, 10);
  // registration letters and a fender rope
  ctx.restore();
}

function dinghy(ctx, x, wl, s, P, c) {
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 16 * s, wl - 5 * s); ctx.quadraticCurveTo(x, wl + 1 * s, x + 16 * s, wl - 6 * s); ctx.lineTo(x + 13 * s, wl + 1 * s); ctx.lineTo(x - 13 * s, wl + 1 * s); ctx.fill();
  ctx.fillStyle = P.night ? '#4A4C74' : '#F4EEE4'; ctx.beginPath(); ctx.moveTo(x - 16 * s, wl - 5 * s); ctx.quadraticCurveTo(x, wl - 1 * s, x + 16 * s, wl - 6 * s); ctx.lineTo(x + 16 * s, wl - 4.5 * s); ctx.quadraticCurveTo(x, wl + 0.6 * s, x - 15.5 * s, wl - 3.6 * s); ctx.fill();
  ctx.strokeStyle = P.night ? '#141830' : '#3A3F5C'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x - 14 * s, wl - 4 * s); ctx.lineTo(x - 22 * s, wl - 14 * s); ctx.stroke();
}

function gulls(ctx, w, hy, s, r, n, P) {
  ctx.strokeStyle = P.night ? '#C9C7E2' : '#F8F6F2'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = hy * (0.15 + r() * 0.65), k = (0.6 + r() * 0.8) * s;
    ctx.lineWidth = 2.2 * k; ctx.beginPath(); ctx.moveTo(x - 9 * k, y - 2 * k); ctx.quadraticCurveTo(x - 4 * k, y - 7 * k, x, y); ctx.quadraticCurveTo(x + 4 * k, y - 7 * k, x + 9 * k, y - 2 * k); ctx.stroke();
    ctx.strokeStyle = P.night ? '#8E8CB0' : '#6E7898'; ctx.lineWidth = 1 * k; ctx.beginPath(); ctx.moveTo(x - 9 * k, y - 2 * k); ctx.lineTo(x - 6 * k, y - 4 * k); ctx.moveTo(x + 9 * k, y - 2 * k); ctx.lineTo(x + 6 * k, y - 4 * k); ctx.stroke();
    ctx.strokeStyle = P.night ? '#C9C7E2' : '#F8F6F2';
  }
}

function windmill(ctx, x, base, s, P) {
  ctx.fillStyle = P.night ? '#2C2E4E' : '#5E6B84';
  ctx.beginPath(); ctx.moveTo(x - 12 * s, base); ctx.lineTo(x - 7 * s, base - 46 * s); ctx.lineTo(x + 7 * s, base - 46 * s); ctx.lineTo(x + 12 * s, base); ctx.fill();
  ctx.fillStyle = P.night ? '#232542' : '#3E4A66'; ctx.beginPath(); ctx.moveTo(x - 9 * s, base - 46 * s); ctx.quadraticCurveTo(x, base - 60 * s, x + 9 * s, base - 46 * s); ctx.fill();
  ctx.fillStyle = P.night ? '#FFD27A' : '#EFE4D2'; ctx.fillRect(x - 2.5 * s, base - 20 * s, 5 * s, 7 * s);
  ctx.strokeStyle = P.night ? '#3C3E62' : '#EFE8DC'; ctx.lineWidth = 3 * s;
  const hub = [x, base - 50 * s];
  for (const a of [0.35, 0.35 + Math.PI / 2, 0.35 + Math.PI, 0.35 + Math.PI * 1.5]) {
    ctx.beginPath(); ctx.moveTo(hub[0], hub[1]); ctx.lineTo(hub[0] + Math.cos(a) * 34 * s, hub[1] + Math.sin(a) * 34 * s); ctx.stroke();
    ctx.save(); ctx.translate(hub[0], hub[1]); ctx.rotate(a); ctx.fillStyle = alpha(P.night ? '#4A4C74' : '#F4EEE4', 0.75); ctx.fillRect(8 * s, 0, 26 * s, 7 * s); ctx.restore();
  }
}

function thatchedHouse(ctx, x, base, s, P) {
  ctx.fillStyle = P.brick[2]; ctx.fillRect(x, base - 22 * s, 62 * s, 22 * s);
  ctx.fillStyle = P.thatch; ctx.beginPath(); ctx.moveTo(x - 6 * s, base - 20 * s); ctx.quadraticCurveTo(x + 31 * s, base - 64 * s, x + 68 * s, base - 20 * s); ctx.fill();
  ctx.fillStyle = alpha('#000000', 0.18); ctx.fillRect(x - 6 * s, base - 22 * s, 74 * s, 3 * s);
  for (let j = 0; j < 4; j++) { ctx.fillStyle = P.frame; ctx.fillRect(x + (6 + j * 14) * s, base - 17 * s, 8 * s, 9 * s); ctx.fillStyle = P.night ? '#FFD27A' : P.glass; ctx.fillRect(x + (7 + j * 14) * s, base - 16 * s, 6 * s, 7 * s); }
  ctx.fillStyle = P.night ? '#1E2246' : '#2F4A7A'; ctx.fillRect(x + 27 * s, base - 14 * s, 8 * s, 14 * s);
}

/** Strandkorb: the hooded wicker beach chair, striped canvas. */
function strandkorb(ctx, x, base, s, P, stripe) {
  ctx.fillStyle = P.night ? '#5A5070' : '#D9BB86'; ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - 22 * s); ctx.quadraticCurveTo(x + 10 * s, base - 30 * s, x + 20 * s, base - 22 * s); ctx.lineTo(x + 20 * s, base); ctx.fill();
  ctx.fillStyle = P.night ? '#2E3054' : '#F6F1E6'; ctx.fillRect(x + 3 * s, base - 18 * s, 14 * s, 9 * s);
  ctx.fillStyle = stripe; for (let j = 0; j < 3; j++) ctx.fillRect(x + (3 + j * 5) * s, base - 18 * s, 2.5 * s, 9 * s);
  ctx.fillStyle = alpha('#000', 0.15); ctx.fillRect(x, base - 2 * s, 20 * s, 2 * s);
}

function ferry(ctx, x, wl, s, P) {
  ctx.save(); ctx.translate(x, wl); ctx.scale(s, s);
  ctx.fillStyle = P.ferry; ctx.beginPath(); ctx.moveTo(-70, -12); ctx.lineTo(74, -12); ctx.lineTo(64, 4); ctx.lineTo(-62, 4); ctx.fill();
  ctx.fillStyle = P.ferryBand; ctx.fillRect(-66, -4, 134, 4);
  ctx.fillStyle = P.ferry; ctx.fillRect(-42, -28, 92, 16); ctx.fillRect(-10, -40, 40, 12);
  for (let j = 0; j < 8; j++) { ctx.fillStyle = P.night ? '#FFD27A' : '#3B4A72'; ctx.fillRect(-38 + j * 11, -24, 7, 6); }
  ctx.fillStyle = P.ferryBand; ctx.fillRect(10, -50, 10, 10);
  ctx.restore();
}

/**
 * The lighthouse on the mole (lighthouse.md): a tall North Sea tower, white with ink bands —
 * never red, red means Moin — gallery and railing, a glazed lantern, an ink dome. At night the
 * lamp is lit. Light comes from the left, so the right flank is in lilac shade.
 */
function tower(ctx, x, base, s, P) {
  const H = 150 * s, bw = 15 * s, tw = 10 * s, top = base - H;
  const ink = P.night ? '#1B1F40' : '#2B3860', inkShade = P.night ? '#12152E' : '#1E2848';
  // plinth
  ctx.fillStyle = P.stone; ctx.fillRect(x - bw - 5 * s, base - 9 * s, (bw + 5 * s) * 2, 10 * s);
  ctx.fillStyle = P.quayTop; ctx.fillRect(x - bw - 5 * s, base - 10 * s, (bw + 5 * s) * 2, 2.5 * s);
  // the body, rounded by a gradient, banded in ink
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x - bw, base - 9 * s); ctx.lineTo(x - tw, top); ctx.lineTo(x + tw, top); ctx.lineTo(x + bw, base - 9 * s); ctx.closePath(); ctx.clip();
  ctx.fillStyle = grad(ctx, x - bw, 0, x + bw, 0, P.night ? ['#8E90B4', '#7A7CA2', '#5A5C84', '#3E4068'] : ['#FFFBF3', '#F7F2E8', '#E2DCE6', '#BDB6CF']);
  ctx.fillRect(x - bw, top, bw * 2, H);
  for (const [a, b] of [[0.1, 0.22], [0.38, 0.5], [0.66, 0.78]]) {
    ctx.fillStyle = grad(ctx, x - bw, 0, x + bw, 0, [ink, ink, inkShade]);
    ctx.fillRect(x - bw, base - 9 * s - (H - 9 * s) * b, bw * 2, (H - 9 * s) * (b - a));
  }
  ctx.restore();
  // door and a stair of small windows (lit at night)
  ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(x - 4 * s, base - 9 * s); ctx.lineTo(x - 4 * s, base - 19 * s); ctx.quadraticCurveTo(x, base - 24 * s, x + 4 * s, base - 19 * s); ctx.lineTo(x + 4 * s, base - 9 * s); ctx.fill();
  for (const [t, dx] of [[0.31, -3], [0.59, 2], [0.87, -1]]) {
    ctx.fillStyle = P.night ? '#FFD27A' : '#46557C';
    ctx.fillRect(x + dx * s - 1.6 * s, base - 9 * s - (H - 9 * s) * t - 3 * s, 3.2 * s, 5.5 * s);
  }
  // gallery deck and railing
  ctx.fillStyle = ink; ctx.fillRect(x - tw - 5 * s, top - 3 * s, (tw + 5 * s) * 2, 4 * s);
  ctx.strokeStyle = ink; ctx.lineWidth = 0.9 * s;
  ctx.beginPath(); ctx.moveTo(x - tw - 5 * s, top - 10 * s); ctx.lineTo(x + tw + 5 * s, top - 10 * s);
  for (let k = 0; k <= 8; k++) { const px = x - tw - 5 * s + k * ((tw + 5 * s) * 2) / 8; ctx.moveTo(px, top - 3 * s); ctx.lineTo(px, top - 10 * s); }
  ctx.stroke();
  // lantern room: glass between ink bars, then the dome, vent ball and rod
  const lw = 7.5 * s, lh = 17 * s, lt = top - 3 * s - lh;
  ctx.fillStyle = ink; ctx.fillRect(x - lw - 1 * s, top - 6 * s, (lw + 1 * s) * 2, 3 * s);
  ctx.fillStyle = P.night ? '#FFF1C2' : grad(ctx, x - lw, 0, x + lw, 0, ['#E9EEF6', '#C4D0E2', '#9FAFCB']);
  ctx.fillRect(x - lw, lt, lw * 2, lh - 3 * s);
  ctx.fillStyle = ink; for (const dx of [-lw, -lw / 3, lw / 3, lw - 1.2 * s]) ctx.fillRect(x + dx, lt, 1.2 * s, lh - 3 * s);
  ctx.beginPath(); ctx.moveTo(x - lw - 2 * s, lt); ctx.quadraticCurveTo(x, lt - 16 * s, x + lw + 2 * s, lt); ctx.fill();
  ctx.beginPath(); ctx.arc(x, lt - 9.5 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(x, lt - 11 * s); ctx.lineTo(x, lt - 19 * s); ctx.stroke();
  return { lampX: x, lampY: lt + (lh - 3 * s) / 2 };
}

/** The lamp at night: a halo and two pale beams across the sky (warm light, never red). */
function beams(ctx, x, y, w, s) {
  for (const [dir, spread, a] of [[-1, 0.16, 0.34], [1, 0.1, 0.22]]) {
    const len = w * 0.95, g = ctx.createLinearGradient(x, y, x + dir * len, y);
    g.addColorStop(0, `rgba(255,236,176,${a})`); g.addColorStop(1, 'rgba(255,236,176,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - 2 * s); ctx.lineTo(x + dir * len, y - len * spread * 0.9); ctx.lineTo(x + dir * len, y + len * spread * 0.35); ctx.lineTo(x, y + 2 * s); ctx.fill();
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, 70 * s); g.addColorStop(0, 'rgba(255,236,176,.75)'); g.addColorStop(0.25, 'rgba(255,226,150,.3)'); g.addColorStop(1, 'rgba(255,226,150,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 70 * s, y - 70 * s, 140 * s, 140 * s);
}

/** The keeper's cottage: whitewashed, a slate hip roof, sage shutters, a chimney. */
function cottage(ctx, x, base, s, P) {
  const cw = 54 * s, ch = 22 * s;
  ctx.fillStyle = grad(ctx, x, 0, x + cw, 0, P.night ? ['#6E7096', '#55577E'] : ['#F6F0E4', '#DCD4DC']); ctx.fillRect(x, base - ch, cw, ch);
  ctx.fillStyle = P.night ? '#202445' : '#4A5578';
  ctx.beginPath(); ctx.moveTo(x - 4 * s, base - ch); ctx.lineTo(x + 10 * s, base - ch - 18 * s); ctx.lineTo(x + cw - 10 * s, base - ch - 18 * s); ctx.lineTo(x + cw + 4 * s, base - ch); ctx.fill();
  ctx.fillRect(x + cw - 16 * s, base - ch - 26 * s, 6 * s, 12 * s);
  for (let j = 0; j < 3; j++) {
    const wx = x + (7 + j * 16) * s;
    ctx.fillStyle = P.night ? '#2E4252' : '#8FAE8A'; ctx.fillRect(wx - 3 * s, base - ch + 5 * s, 3 * s, 9 * s); ctx.fillRect(wx + 7 * s, base - ch + 5 * s, 3 * s, 9 * s);
    ctx.fillStyle = P.frame; ctx.fillRect(wx, base - ch + 5 * s, 7 * s, 9 * s);
    ctx.fillStyle = P.night ? '#FFD27A' : P.glass; ctx.fillRect(wx + 1 * s, base - ch + 6 * s, 5 * s, 7 * s);
  }
  ctx.fillStyle = P.night ? '#1E2246' : '#2F4A7A'; ctx.fillRect(x + cw - 9 * s, base - 13 * s, 6 * s, 13 * s);
  // a wisp of peat smoke
  ctx.save(); ctx.filter = `blur(${Math.max(1, 2 * s)}px)`; ctx.fillStyle = alpha(P.night ? '#8E8AA8' : '#E8E2EE', 0.6);
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(x + cw - 13 * s + k * 5 * s, base - ch - 30 * s - k * 6 * s, (4 + k) * s, (2.5 + k * 0.5) * s, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/** The mole: a granite pier running out from the near left to the tower, rocks heaped in front. */
function mole(ctx, x0, y0, x1, y1, s, P, r) {
  // it slopes towards us, then runs flat for its head, where the tower and the cottage stand
  const HEAD = 0.6, u = (t) => Math.min(1, t / HEAD);
  const face = (t) => (24 - 14 * u(t)) * s, yAt = (t) => y0 + (y1 - y0) * u(t), xAt = (t) => x0 + (x1 - x0) * t;
  const edge = (f) => { ctx.moveTo(x0, y0 + face(0) * f); ctx.lineTo(xAt(HEAD), y1 + face(1) * f); ctx.lineTo(x1, y1 + face(1) * f); };
  // top surface and front face, blocks drawn as courses that thin with distance
  ctx.fillStyle = P.quayTop; ctx.beginPath(); ctx.moveTo(x0, y0 - 6 * s); ctx.lineTo(xAt(HEAD), y1 - 3 * s); ctx.lineTo(x1, y1 - 3 * s); ctx.lineTo(x1, y1); ctx.lineTo(xAt(HEAD), y1); ctx.lineTo(x0, y0); ctx.fill();
  ctx.fillStyle = grad(ctx, 0, y1, 0, y0 + face(0), [mix(P.stone, P.night ? '#000000' : '#FFFFFF', 0.12), P.stone]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xAt(HEAD), y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 + face(1)); ctx.lineTo(xAt(HEAD), y1 + face(1)); ctx.lineTo(x0, y0 + face(0)); ctx.fill();
  ctx.strokeStyle = alpha(P.night ? '#0E1226' : '#55536E', 0.55); ctx.lineWidth = 0.8 * s;
  for (const f of [0.35, 0.7]) { ctx.beginPath(); edge(f); ctx.stroke(); }
  for (let t = 0; t < 1; t += 0.025 + 0.02 * u(t)) { const bx = xAt(t), by = yAt(t); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + face(t)); ctx.stroke(); }
  // bollards along the edge
  ctx.fillStyle = P.night ? '#141830' : '#3A3F5C';
  for (const t of [0.12, 0.38]) { const bx = xAt(t), by = yAt(t), k = 1 - 0.45 * u(t); ctx.fillRect(bx, by - 6 * s * k, 4 * s * k, 6 * s * k); ctx.fillRect(bx - 1.2 * s * k, by - 7 * s * k, 6.4 * s * k, 1.8 * s * k); }
  // the breakwater: granite boulders, bigger near us
  const rocks = [];
  for (let i = 0; i < 90; i++) {
    const t = r(), k = 1.3 - 0.8 * u(t), bx = x0 + (x1 + 18 * s - x0) * t, by = yAt(t) + face(t) * (0.55 + r() * 0.5) + (r() * 7 - 1) * s * k;
    rocks.push([by, bx, (6 + r() * 9) * s * k, 0.5 + r() * 0.3, r(), (r() - 0.5) * 0.7]);
  }
  rocks.sort((a, b) => a[0] - b[0]);
  for (const [by, bx, rx, flat, tone, rot] of rocks) {
    const ry = rx * flat;
    ctx.fillStyle = alpha(P.night ? '#080B1C' : '#3E3A56', 0.55); ctx.beginPath(); ctx.ellipse(bx + rx * 0.12, by + ry * 0.25, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.night ? mix('#262846', '#4E5074', tone) : mix('#6F6A84', '#BDB4C4', tone);
    ctx.beginPath(); ctx.ellipse(bx, by, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = alpha(P.night ? '#9A98BC' : '#F6EEE8', P.night ? 0.3 : 0.5); ctx.beginPath(); ctx.ellipse(bx - rx * 0.3, by - ry * 0.4, rx * 0.5, ry * 0.32, rot, 0, Math.PI * 2); ctx.fill();
  }
  return { top: yAt, x: xAt, foamY: (t) => yAt(t) + face(t) + 7 * s * (1.25 - 0.75 * u(t)) };
}

/** A herring gull standing on the mole (white, grey back, a yellow bill — no red). */
function perched(ctx, x, y, s, P) {
  ctx.fillStyle = P.night ? '#B8B6D2' : '#FBF9F4'; ctx.beginPath(); ctx.ellipse(x, y - 4 * s, 5 * s, 3 * s, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 4.5 * s, y - 7.5 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.night ? '#6E6C92' : '#9BA3BC'; ctx.beginPath(); ctx.ellipse(x - 1 * s, y - 5 * s, 4 * s, 1.8 * s, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.night ? '#B8A060' : '#F0C64A'; ctx.fillRect(x + 6.2 * s, y - 8 * s, 2.6 * s, 1 * s);
}

/**
 * A warft (mudflats.md): the grass mound a Hallig family builds its houses on, so that at storm
 * tide ("Land unter") only the warfts stand out of the sea. Whitewashed houses under reed roofs,
 * wind-bent ash trees, sheep on the slopes. Returns the mound's top.
 */
function warft(ctx, x, base, s, P, r) {
  const bw = 90 * s, tw = 52 * s, mh = 26 * s, top = base - mh;
  // trees behind the houses: dark sage clumps, leaning away from the westerly wind
  for (const [dx, k] of [[-40, 1], [-31, 0.8], [36, 0.9], [44, 0.7]]) {
    const tx = x + dx * s, th = 34 * s * k;
    ctx.fillStyle = P.night ? '#141A30' : '#4A5A4C'; ctx.fillRect(tx - 1 * s, top - th * 0.55, 2 * s, th * 0.55 + 1);
    ctx.fillStyle = P.night ? '#1C2A38' : '#6E8A6A';
    for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(tx + (j - 1) * 4 * s * k + 4 * s * k, top - th * (0.6 + 0.12 * (j % 2)), 9 * s * k, 7 * s * k, -0.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = alpha(P.night ? '#2E4252' : '#A9C08A', 0.6); ctx.beginPath(); ctx.ellipse(tx + 1 * s * k, top - th * 0.82, 6 * s * k, 4 * s * k, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  // the mound: grass, lit from the left, a darker flank on the right
  ctx.fillStyle = grad(ctx, x - bw, 0, x + bw, 0, P.night ? ['#2B3D52', '#22344A', '#1A2A3E'] : ['#B9C79A', '#9DB58A', '#7F9A78']);
  ctx.beginPath(); ctx.moveTo(x - bw, base); ctx.bezierCurveTo(x - bw * 0.7, base - mh * 0.15, x - tw * 1.05, top, x - tw, top);
  ctx.lineTo(x + tw, top); ctx.bezierCurveTo(x + tw * 1.05, top, x + bw * 0.7, base - mh * 0.15, x + bw, base); ctx.closePath(); ctx.fill();
  // houses on top: whitewashed, under deep reed roofs, one long house and one turned gable-on
  halligHouse(ctx, x - 44 * s, top + 0.5 * s, s * 0.95, P, 46);
  halligHouse(ctx, x + 6 * s, top + 0.5 * s, s * 0.95, P, 30);
  // sheep grazing on the slopes
  for (let j = 0; j < 6; j++) {
    const t = r(), side = j % 2 ? 1 : -1, sx = x + side * (tw + (bw - tw) * (0.25 + 0.6 * t)), sy = base - mh * (0.75 - 0.6 * t) - 1 * s;
    ctx.fillStyle = P.sheep; ctx.beginPath(); ctx.ellipse(sx, sy, 3.4 * s, 2.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.night ? '#141830' : '#3A3F5C'; ctx.fillRect(sx + side * 2.6 * s - 0.8 * s, sy - 1.6 * s, 1.8 * s, 1.8 * s);
  }
  return top;
}

/** A Hallig house: whitewashed walls, a deep reed roof with a dark ridge, sage shutters. */
function halligHouse(ctx, x, base, s, P, len) {
  const L = len * s, wh = 11 * s, rh = 19 * s;
  ctx.fillStyle = grad(ctx, x, 0, x + L, 0, P.night ? ['#76789E', '#5A5C84'] : ['#F7F1E6', '#E2D8DC']); ctx.fillRect(x, base - wh, L, wh);
  ctx.fillStyle = grad(ctx, 0, base - wh - rh, 0, base - wh, P.night ? ['#3A3446', '#2A2638'] : ['#A08C66', '#7E6C52']);
  ctx.beginPath(); ctx.moveTo(x - 3 * s, base - wh + 1 * s); ctx.quadraticCurveTo(x + 2 * s, base - wh - rh * 0.9, x + 9 * s, base - wh - rh);
  ctx.lineTo(x + L - 9 * s, base - wh - rh); ctx.quadraticCurveTo(x + L - 2 * s, base - wh - rh * 0.9, x + L + 3 * s, base - wh + 1 * s); ctx.fill();
  ctx.fillStyle = P.night ? '#1E1A2E' : '#5A4A3A'; ctx.fillRect(x + 9 * s, base - wh - rh - 1.2 * s, L - 18 * s, 2 * s);
  for (let wx = x + 4 * s; wx < x + L - 7 * s; wx += 9 * s) {
    if (Math.abs(wx - (x + L * 0.5 - 2 * s)) < 4 * s) { ctx.fillStyle = P.night ? '#1E2246' : '#3E5A6E'; ctx.fillRect(wx, base - 8 * s, 4.5 * s, 8 * s); continue; }
    ctx.fillStyle = P.night ? '#2E4252' : '#8FAE8A'; ctx.fillRect(wx - 1.6 * s, base - 8 * s, 1.4 * s, 5 * s); ctx.fillRect(wx + 4.2 * s, base - 8 * s, 1.4 * s, 5 * s);
    ctx.fillStyle = P.night ? '#FFD27A' : P.glass; ctx.fillRect(wx, base - 8 * s, 4 * s, 5 * s);
  }
}

/** A Hallig on the horizon: a flat sliver of marsh with one tiny warft, in the haze. */
function farHallig(ctx, x, hy, s, P, wide) {
  ctx.fillStyle = P.hazeDark; ctx.fillRect(x - wide / 2, hy - 2 * s, wide, 3 * s);
  ctx.beginPath(); ctx.moveTo(x - 16 * s, hy - 1 * s); ctx.quadraticCurveTo(x, hy - 8 * s, x + 16 * s, hy - 1 * s); ctx.fill();
  ctx.fillStyle = P.haze; ctx.fillRect(x - 7 * s, hy - 9 * s, 6 * s, 3 * s); ctx.fillRect(x + 1 * s, hy - 8 * s, 6 * s, 2 * s);
  ctx.fillStyle = P.hazeDark; ctx.beginPath(); ctx.moveTo(x - 8 * s, hy - 8 * s); ctx.lineTo(x - 4 * s, hy - 12 * s); ctx.lineTo(x, hy - 8 * s); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, hy - 7 * s); ctx.lineTo(x + 4 * s, hy - 11 * s); ctx.lineTo(x + 8 * s, hy - 7 * s); ctx.fill();
  if (P.night) { ctx.fillStyle = 'rgba(255,214,140,.8)'; ctx.fillRect(x - 5 * s, hy - 8 * s, 1.4 * s, 1.4 * s); }
}

/** A sail trolley (Segellore): the Hallig's little rail wagon, pushed across the flats by a sail. */
function lore(ctx, x, y, s, P) {
  const ink = P.night ? '#141830' : '#2B3860';
  ctx.fillStyle = ink; ctx.fillRect(x - 9 * s, y - 4 * s, 18 * s, 3 * s);
  ctx.beginPath(); ctx.arc(x - 5 * s, y - 0.5 * s, 1.6 * s, 0, Math.PI * 2); ctx.arc(x + 5 * s, y - 0.5 * s, 1.6 * s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(x - 2 * s, y - 4 * s); ctx.lineTo(x - 2 * s, y - 30 * s); ctx.stroke();
  ctx.fillStyle = P.night ? '#8E8CB0' : '#F7F2E8'; ctx.beginPath(); ctx.moveTo(x - 1 * s, y - 29 * s); ctx.lineTo(x + 11 * s, y - 7 * s); ctx.lineTo(x - 1 * s, y - 6 * s); ctx.fill();
  ctx.fillStyle = P.night ? '#6E6C92' : '#E4DCEA'; ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 26 * s); ctx.lineTo(x - 3 * s, y - 7 * s); ctx.lineTo(x - 11 * s, y - 7 * s); ctx.fill();
}

/** A Pricke: a birch twig stuck in the mud to mark the way through the flats. */
function pricke(ctx, x, y, k, P) {
  ctx.strokeStyle = P.night ? '#141830' : '#4A4258'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(0.6, 1.3 * k);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.6 * k, y - 16 * k);
  ctx.moveTo(x + 0.3 * k, y - 9 * k); ctx.lineTo(x + 3.5 * k, y - 14 * k); ctx.moveTo(x + 0.4 * k, y - 12 * k); ctx.lineTo(x - 2.5 * k, y - 17 * k); ctx.stroke();
  ctx.fillStyle = alpha(P.night ? '#0E1226' : '#4A4258', 0.3); ctx.fillRect(x - 2 * k, y, 4 * k, 1 * k);
}

function water(ctx, w, hy, h, P, r, sun, reflectFrom) {
  ctx.fillStyle = grad(ctx, 0, hy, 0, h, P.water); ctx.fillRect(0, hy, w, h - hy);
  const src = reflectFrom, k = src.width / w, band = Math.min(hy, h - hy);
  ctx.save(); ctx.filter = 'blur(1px)';
  for (let y = 0; y < band; y += 1.5) {
    const sy = hy - y; if (sy < 0) break;
    const off = Math.sin(y * 0.045 + 1.3) * (1.5 + y * 0.04) + Math.sin(y * 0.013) * 2.5 + (r() - 0.5) * (1 + y * 0.03);
    ctx.globalAlpha = (P.night ? 0.66 : 0.52) * Math.pow(1 - y / band, 1.3);
    ctx.drawImage(src, 0, sy * k - 1.5 * k, src.width, 1.5 * k, off, hy + y, w, 1.6);
  }
  ctx.restore();
  // sun glitter path
  ctx.save();
  for (let i = 0; i < 520; i++) {
    const t = Math.pow(r(), 0.8), y = hy + 4 + t * (h - hy) * 0.9, spread = 6 + t * w * 0.18;
    const x = sun.x + (r() - 0.5) * spread * 2;
    ctx.fillStyle = alpha(r() < 0.5 ? P.sun : P.glow, (P.night ? 0.5 : 0.65) * (1 - t * 0.7));
    ctx.fillRect(x, y, (5 + r() * 12) * (0.6 + t), 1.4 + t * 2.5);
  }
  // lilac and sage ripple accents
  for (let i = 0; i < 900; i++) {
    const t = r(), y = hy + t * (h - hy), x = r() * w;
    ctx.fillStyle = alpha([P.night ? '#4A5288' : '#E6E2EE', P.night ? '#2E4252' : '#A9BFA0', P.night ? '#0C1126' : '#566F99'][Math.floor(r() * 3)], 0.35);
    ctx.fillRect(x, y, (6 + r() * 16) * (0.5 + t), 1.2 + t * 2.4);
  }
  ctx.restore();
}

/** The scenes. Units are logical px; `s` scales every object. */
const SCENES = {
  harbour(ctx, w, h, P, r, o) {
    const s = o.s, hy = h * o.horizon, sun = { x: w * o.sunX, y: h * o.sunY, r: 15 * s };
    sky(ctx, w, hy, P, r, sun); ctx.fillStyle = grad(ctx, 0, hy, 0, h, P.water); ctx.fillRect(0, hy, w, h - hy);
    farShore(ctx, w, hy, P, r, s, { cranes: [[0.66, 44, -30], [0.74, 36, -22], [0.95, 40, -26]], michel: 0.55 });
    lighthouse(ctx, w * 0.86, hy - 2 * s, s * 0.8, P);
    warehouses(ctx, -10 * s, w * o.rowEnd, hy + 6 * s, P, r, s * o.rowScale, { recede: true, height: 96 });
    gulls(ctx, w, hy, s, r, o.gulls, P);
    const above = document.createElement('canvas'); above.width = ctx.canvas.width; above.height = ctx.canvas.height; above.getContext('2d').drawImage(ctx.canvas, 0, 0);
    { const top = hy + 6 * s + 12 * s * o.rowScale; ctx.fillStyle = P.water[0]; ctx.fillRect(w * o.rowEnd, hy, w, top - hy); water(ctx, w, top, h, P, r, sun, above); }
    { const top = hy + 6 * s + 12 * s * o.rowScale; const g = ctx.createLinearGradient(0, hy, 0, top + 30 * s); g.addColorStop(0, alpha(P.water[0], 0)); g.addColorStop(0.5, alpha(P.water[0], 0.5)); g.addColorStop(1, alpha(P.water[0], 0)); ctx.fillStyle = g; ctx.fillRect(w * o.rowEnd - 30 * s, hy, w, top + 30 * s - hy);
      const cols = P.night ? ['#2B3A5A', '#3E3048', '#2F4A44'] : ['#3D5A9C', '#5E7FA6', '#2F5A50'];
      for (let j = 0; j < (o.dinghies || 3); j++) dinghy(ctx, w * (0.06 + j * 0.13 * (0.55 / o.rowEnd)), top + (10 + (j % 2) * 6) * s * o.rowScale, s * o.rowScale * 0.9, P, cols[j % 3]); }
    cutter(ctx, w * o.cutterX, hy + o.cutterY * s, s * o.cutterS, P, r, -1);
    // cutter's own reflection
    ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(0, 2 * (hy + o.cutterY * s)); ctx.scale(1, -1); cutter(ctx, w * o.cutterX, hy + o.cutterY * s, s * o.cutterS, P, r, -1); ctx.restore();
  },
  market(ctx, w, h, P, r, o) {
    const s = o.s, hy = h * o.horizon, sun = { x: w * o.sunX, y: h * o.sunY, r: 14 * s };
    sky(ctx, w, hy, P, r, sun);
    farShore(ctx, w, hy, P, r, s, { cranes: [[0.9, 40, -24]], michel: 0.82 });
    // the fish auction hall: brick nave, great arched window, copper roof and dome
    const hw = Math.min(w * 0.62, 250 * s), hx0 = Math.max(w * 0.06, w * 0.36 - hw / 2), hb = hy + 4 * s, ht = 70 * s;
    ctx.fillStyle = grad(ctx, 0, hb - ht, 0, hb, [mix(P.brick[1], P.night ? '#000000' : '#F3C9A6', 0.15), P.brick[0], mix(P.brick[2], P.brickShade, 0.3)]);
    ctx.fillRect(hx0, hb - ht, hw, ht);
    ctx.fillStyle = P.copper; ctx.beginPath(); ctx.moveTo(hx0 - 4 * s, hb - ht); ctx.lineTo(hx0 + hw * 0.5, hb - ht - 26 * s); ctx.lineTo(hx0 + hw + 4 * s, hb - ht); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx0 + hw * 0.5, hb - ht - 26 * s, 13 * s, 16 * s, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(hx0 + hw * 0.5 - 1.5 * s, hb - ht - 52 * s, 3 * s, 12 * s);
    ctx.fillStyle = P.frame; ctx.beginPath(); ctx.ellipse(hx0 + hw * 0.5, hb - ht + 40 * s, 26 * s, 34 * s, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(hx0 + hw * 0.5 - 26 * s, hb - ht + 40 * s, 52 * s, 22 * s);
    ctx.fillStyle = P.night ? '#FFC970' : P.glass; ctx.beginPath(); ctx.ellipse(hx0 + hw * 0.5, hb - ht + 40 * s, 23 * s, 31 * s, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(hx0 + hw * 0.5 - 23 * s, hb - ht + 40 * s, 46 * s, 20 * s);
    ctx.strokeStyle = P.frame; ctx.lineWidth = 1.4 * s; for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(hx0 + hw * 0.5 + j * 9 * s, hb - ht + 10 * s); ctx.lineTo(hx0 + hw * 0.5 + j * 9 * s, hb - ht + 60 * s); ctx.stroke(); }
    for (let j = 0; j < 8; j++) { const wx = hx0 + 8 * s + j * (hw - 16 * s) / 8; if (Math.abs(wx - (hx0 + hw * 0.5)) < 34 * s) continue; ctx.fillStyle = P.frame; ctx.fillRect(wx, hb - ht + 22 * s, 11 * s, 30 * s); ctx.fillStyle = P.night && j % 2 ? '#FFD27A' : P.glass; ctx.fillRect(wx + 1.5 * s, hb - ht + 24 * s, 8 * s, 26 * s); }
    warehouses(ctx, hx0 + hw + 8 * s, w + 20 * s, hy + 4 * s, P, r, s * 0.7, { height: 80 });
    // market stalls along the quay: striped awnings, crates of fish and flowers
    const qy = hy + 16 * s;
    ctx.fillStyle = P.stone; ctx.fillRect(0, qy - 12 * s, w, 14 * s); ctx.fillStyle = P.quayTop; ctx.fillRect(0, qy - 13 * s, w, 3 * s);
    for (let k = 0; k < 5; k++) {
      const x0 = w * (0.01 + k * 0.205), aw = w * 0.18, y0 = hy + 4 * s;
      const colors = [P.ferryBand, '#8FAE8A', P.ferryBand, '#B7A9D3', '#3E6B8A'];
      ctx.fillStyle = '#F7F2E8'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + 6 * s, y0 - 14 * s); ctx.lineTo(x0 + aw - 6 * s, y0 - 14 * s); ctx.lineTo(x0 + aw, y0); ctx.fill();
      ctx.fillStyle = P.night ? mix(colors[k], '#000000', 0.4) : colors[k]; for (let j = 0; j < 5; j++) { const sx = x0 + j * aw / 5; ctx.beginPath(); ctx.moveTo(sx + 2 * s, y0); ctx.lineTo(sx + 6 * s + j * 0.2, y0 - 14 * s); ctx.lineTo(sx + 6 * s + aw / 10, y0 - 14 * s); ctx.lineTo(sx + aw / 10 + 2 * s, y0); ctx.fill(); }
      ctx.fillStyle = P.night ? '#3A3446' : '#C9A877'; ctx.fillRect(x0 + 3 * s, y0, aw - 6 * s, 8 * s);
      for (let j = 0; j < 7; j++) { ctx.fillStyle = (P.night ? ['#6A6080', '#5A6A7A', '#8A7A60'] : ['#C9D3DC', '#E8B07A', '#EFD27A', '#A9C08A', '#9FB2C8'])[(j + k) % (P.night ? 3 : 5)]; ctx.beginPath(); ctx.arc(x0 + 7 * s + j * (aw - 14 * s) / 6, y0 + 3 * s, 2.4 * s, 0, Math.PI * 2); ctx.fill(); }
      if (P.night) { const g = ctx.createRadialGradient(x0 + aw / 2, y0 - 6 * s, 0, x0 + aw / 2, y0 - 6 * s, 30 * s); g.addColorStop(0, 'rgba(255,214,140,.5)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(x0 - 10 * s, y0 - 40 * s, aw + 20 * s, 70 * s); }
    }
    gulls(ctx, w, hy, s, r, o.gulls, P);
    const above = document.createElement('canvas'); above.width = ctx.canvas.width; above.height = ctx.canvas.height; above.getContext('2d').drawImage(ctx.canvas, 0, 0);
    water(ctx, w, qy + 2 * s, h, P, r, sun, above);
  },
  ferry(ctx, w, h, P, r, o) {
    const s = o.s, hy = h * o.horizon, sun = { x: w * o.sunX, y: h * o.sunY, r: 14 * s };
    sky(ctx, w, hy, P, r, sun); ctx.fillStyle = grad(ctx, 0, hy, 0, h, P.water); ctx.fillRect(0, hy, w, h - hy);
    farShore(ctx, w, hy, P, r, s, { cranes: [[0.72, 38, -26], [0.8, 30, -20]] });
    // a container ship in the haze
    ctx.fillStyle = P.hazeDark; ctx.fillRect(w * 0.5, hy - 10 * s, 90 * s, 8 * s); ctx.fillRect(w * 0.5 + 70 * s, hy - 20 * s, 14 * s, 10 * s);
    for (let j = 0; j < 7; j++) { ctx.fillStyle = alpha(['#B7A9D3', '#8FAE8A', '#C9BCE0', '#9FB2C8'][j % 4], 0.7); ctx.fillRect(w * 0.5 + 4 * s + j * 9 * s, hy - 16 * s, 8 * s, 6 * s); }
    // the dyke: a long green bank with sheep, a windmill and a thatched house
    ctx.fillStyle = grad(ctx, 0, hy - 28 * s, 0, hy + 10 * s, [P.dyke[1], P.dyke[0]]);
    ctx.beginPath(); ctx.moveTo(-10, hy + 10 * s); ctx.quadraticCurveTo(w * 0.15, hy - 30 * s, w * 0.48, hy - 8 * s); ctx.lineTo(w * 0.52, hy + 10 * s); ctx.fill();
    windmill(ctx, w * 0.12, hy - 20 * s, s, P);
    thatchedHouse(ctx, w * 0.22, hy - 6 * s, s * 0.8, P);
    for (let j = 0; j < 9; j++) { const x = w * (0.02 + r() * 0.44), y = hy - 2 * s - r() * 14 * s; ctx.fillStyle = P.sheep; ctx.beginPath(); ctx.ellipse(x, y, 4 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3A3F5C'; ctx.fillRect(x + 3 * s, y - 1.5 * s, 2 * s, 2 * s); }
    // a beach of sand with Strandkörbe
    ctx.fillStyle = P.sand; ctx.beginPath(); ctx.moveTo(w * 0.45, hy + 18 * s); ctx.quadraticCurveTo(w * 0.75, hy + 4 * s, w + 10, hy + 2 * s); ctx.lineTo(w + 10, hy + 22 * s); ctx.lineTo(w * 0.45, hy + 22 * s); ctx.fill();
    [[0.6, '#3D5A9C'], [0.68, '#8FAE8A'], [0.76, '#3D5A9C'], [0.86, '#B7A9D3'], [0.94, '#3E6B8A']].forEach(([fx, c], j) => strandkorb(ctx, w * fx, hy + (14 - j * 1.6) * s, s * 0.9, P, P.night ? mix(c, '#000000', 0.4) : c));
    gulls(ctx, w, hy, s, r, o.gulls, P);
    const above = document.createElement('canvas'); above.width = ctx.canvas.width; above.height = ctx.canvas.height; above.getContext('2d').drawImage(ctx.canvas, 0, 0);
    water(ctx, w, hy + 20 * s, h, P, r, sun, above);
    ferry(ctx, w * 0.32, hy + 46 * s, s * 0.85, P);
  },
  lighthouse(ctx, w, h, P, r, o) {
    const s = o.s, hy = h * o.horizon, sun = { x: w * o.sunX, y: h * o.sunY, r: 14 * s };
    sky(ctx, w, hy, P, r, sun);
    // the open North Sea: a low island of dunes far off, a coaster on the horizon
    ctx.fillStyle = P.haze; ctx.beginPath(); ctx.moveTo(w * 0.62, hy);
    for (let x = w * 0.62; x <= w; x += 5 * s) ctx.lineTo(x, hy - (3 + 4 * Math.abs(Math.sin(x / (29 * s))) + r() * 1.5) * s);
    ctx.lineTo(w, hy); ctx.fill();
    ctx.fillStyle = P.hazeDark; ctx.fillRect(w * 0.08, hy - 7 * s, 46 * s, 5 * s); ctx.fillRect(w * 0.08 + 34 * s, hy - 13 * s, 8 * s, 6 * s);
    const tx = w * o.towerX, tb = hy + o.towerBase * s;
    const lamp = { lampX: tx, lampY: tb - 163 * s };
    if (P.night) beams(ctx, lamp.lampX, lamp.lampY, w, s);
    const land = () => { cottage(ctx, tx - o.cottage * s, tb - 2 * s, s * 0.95, P); tower(ctx, tx, tb, s, P); };
    land();
    gulls(ctx, w, hy, s, r, o.gulls, P);
    const above = document.createElement('canvas'); above.width = ctx.canvas.width; above.height = ctx.canvas.height; above.getContext('2d').drawImage(ctx.canvas, 0, 0);
    water(ctx, w, hy + 1 * s, h, P, r, sun, above);
    // the mole runs from the near left out to the tower; the tower and cottage stand on it
    const x0 = -20 * s, y0 = hy + o.moleNear * s, x1 = tx + 34 * s, y1 = tb + 1 * s;
    const pier = mole(ctx, x0, y0, x1, y1, s, P, r);
    if (P.night) { const g = ctx.createRadialGradient(lamp.lampX, lamp.lampY, 0, lamp.lampX, lamp.lampY, 40 * s); g.addColorStop(0, 'rgba(255,236,176,.45)'); g.addColorStop(1, 'rgba(255,236,176,0)'); ctx.fillStyle = g; ctx.fillRect(lamp.lampX - 40 * s, lamp.lampY - 40 * s, 80 * s, 80 * s); }
    land();
    perched(ctx, pier.x(0.12) + 2 * s, pier.top(0.12) - 6 * s, s * 1.15, P);
    perched(ctx, pier.x(0.38) + 1.5 * s, pier.top(0.38) - 5 * s, s * 0.95, P);
    // surf where the sea meets the boulders
    for (let i = 0; i < 160; i++) {
      const t = r() * 1.05, k = 1.25 - 0.75 * Math.min(1, t / 0.6), fx = x0 + (x1 + 18 * s - x0) * t, fy = pier.foamY(Math.min(1, t)) + (r() * 5 - 1) * s * k;
      ctx.fillStyle = alpha(P.night ? '#A9A7CC' : '#FFFFFF', P.night ? 0.12 + r() * 0.28 : 0.35 + r() * 0.45);
      ctx.beginPath(); ctx.ellipse(fx, fy, (3 + r() * 9) * s * k, (1 + r() * 1.6) * s * k, 0, 0, Math.PI * 2); ctx.fill();
    }
    // a sail coming home on the right
    const bx = w * o.sailX, by = hy + o.sailY * s;
    ctx.fillStyle = P.night ? '#141830' : '#2B3860'; ctx.beginPath(); ctx.moveTo(bx - 14 * s, by); ctx.lineTo(bx + 16 * s, by); ctx.lineTo(bx + 11 * s, by + 5 * s); ctx.lineTo(bx - 11 * s, by + 5 * s); ctx.fill();
    ctx.fillStyle = P.night ? '#8E8CB0' : '#F7F2E8'; ctx.beginPath(); ctx.moveTo(bx, by - 2 * s); ctx.lineTo(bx, by - 34 * s); ctx.lineTo(bx + 14 * s, by - 3 * s); ctx.fill();
    ctx.fillStyle = P.night ? '#6E6C92' : '#E4DCEA'; ctx.beginPath(); ctx.moveTo(bx - 1.5 * s, by - 4 * s); ctx.lineTo(bx - 1.5 * s, by - 26 * s); ctx.lineTo(bx - 12 * s, by - 4 * s); ctx.fill();
  },
  /**
   * The mudflats (mudflats.md): a Hallig in the Wadden Sea at low tide. The warft with its
   * thatched houses on the right, other Halligen on the horizon, the sea far out; in front the
   * wet flats mirror the sky, a tidal creek winds towards us between birch-twig markers, and the
   * Hallig's little railway runs off across the mud on its causeway, a sail trolley on the rails.
   */
  mudflats(ctx, w, h, P, r, o) {
    const s = o.s, hy = h * o.horizon, sun = { x: w * o.sunX, y: h * o.sunY, r: 14 * s };
    sky(ctx, w, hy, P, r, sun);
    ctx.fillStyle = grad(ctx, 0, hy, 0, h, P.water); ctx.fillRect(0, hy, w, h - hy);
    // far off: the mainland dyke as a pale line, two more Halligen
    ctx.fillStyle = P.haze; ctx.fillRect(0, hy - 2 * s, w * o.mainland, 2.5 * s);
    farHallig(ctx, w * o.farX, hy, s, P, 54 * s);
    farHallig(ctx, w * o.farX2, hy, s * 0.7, P, 34 * s);
    // the Hallig: a flat salt marsh with a low edge where the turf breaks off, and the warft
    const hb = hy + o.halligY * s, mx = w * o.marshFrom;
    const hallig = () => {
      ctx.fillStyle = grad(ctx, 0, hb - 4 * s, 0, hb + 4 * s, P.night ? ['#2B3D52', '#22344A'] : ['#AFC197', '#93AD84']);
      ctx.beginPath(); ctx.moveTo(mx, hb + 3 * s); ctx.quadraticCurveTo(mx + 14 * s, hb - 4 * s, mx + 40 * s, hb - 4 * s); ctx.lineTo(w + 10, hb - 5 * s); ctx.lineTo(w + 10, hb + 3 * s); ctx.fill();
      ctx.fillStyle = P.night ? '#1A1C36' : '#6E6276'; ctx.beginPath(); ctx.moveTo(mx, hb + 3 * s); ctx.lineTo(w + 10, hb + 3 * s); ctx.lineTo(w + 10, hb + 5 * s); ctx.lineTo(mx + 6 * s, hb + 5 * s); ctx.fill();
      return warft(ctx, w * o.warftX, hb - 3 * s, s * (o.warftS ?? 1), P, rng(o.seedWarft ?? 7));
    };
    hallig();
    gulls(ctx, w, hy, s, r, o.gulls, P);
    const above = document.createElement('canvas'); above.width = ctx.canvas.width; above.height = ctx.canvas.height; above.getContext('2d').drawImage(ctx.canvas, 0, 0);
    water(ctx, w, hy + 1 * s, h, P, r, sun, above);
    const wet = document.createElement('canvas'); wet.width = ctx.canvas.width; wet.height = ctx.canvas.height; wet.getContext('2d').drawImage(ctx.canvas, 0, 0);
    // the flats: the tide is out to the horizon; wet mud, lilac where it mirrors the sky
    const top = hy + o.flatsTop * s, near = (y) => Math.max(0, (y - top) / (h - top));
    ctx.fillStyle = grad(ctx, 0, top, 0, h, P.mud); ctx.fillRect(0, top, w, h - top);
    ctx.fillStyle = alpha(P.mud[0], 0.9); ctx.beginPath(); ctx.moveTo(0, top + 1 * s);
    for (let x = 0; x <= w; x += 8 * s) ctx.lineTo(x, top - (0.5 + r() * 1.2) * s);
    ctx.lineTo(w, top + 2 * s); ctx.fill();
    for (let i = 0; i < 900; i++) {
      const t = Math.pow(r(), 1.5), y = top + t * (h - top), k = 0.25 + t * 1.6;
      ctx.fillStyle = alpha(r() < 0.6 ? P.sky[2 + Math.floor(r() * 3)] : P.glow, (P.night ? 0.16 : 0.3) * (0.5 + r()));
      ctx.beginPath(); ctx.ellipse(r() * w, y, (8 + r() * 34) * k * s, (0.5 + r() * 1.4) * k * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    // ripple marks the tide left behind, bigger towards us
    ctx.strokeStyle = alpha(P.mudDark, P.night ? 0.35 : 0.22); ctx.lineCap = 'round';
    for (let i = 0; i < 700; i++) {
      const t = Math.pow(r(), 0.8), y = top + t * (h - top), k = (0.3 + t * 1.5) * s, x = r() * w;
      ctx.lineWidth = 0.7 * k; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5 * k, y - 1.6 * k, x + 10 * k, y); ctx.stroke();
    }
    // sea lettuce and darker wet streaks: the flats are not one colour
    for (let i = 0; i < 160; i++) {
      const t = Math.pow(r(), 1.2), y = top + t * (h - top), k = (0.3 + t * 1.6) * s;
      ctx.fillStyle = alpha(r() < 0.5 ? (P.night ? '#2E4252' : '#A9BFA0') : P.mudDark, P.night ? 0.3 : r() < 0.5 ? 0.35 : 0.14);
      ctx.beginPath(); ctx.ellipse(r() * w, y, (6 + r() * 26) * k, (1 + r() * 2) * k, 0, 0, Math.PI * 2); ctx.fill();
    }
    // the sun lies on the wet mud too
    for (let i = 0; i < 260; i++) {
      const t = Math.pow(r(), 0.9), y = top + 2 * s + t * (h - top) * 0.85, spread = 5 * s + t * w * 0.16;
      ctx.fillStyle = alpha(r() < 0.5 ? P.sun : P.glow, (P.night ? 0.35 : 0.45) * (1 - t * 0.7));
      ctx.fillRect(sun.x + (r() - 0.5) * spread * 2, y, (4 + r() * 10) * (0.5 + t), 1 + t * 2);
    }
    // the tidal creeks: a spline through (x, y, half-width) with the water — and its reflection — left in
    const creek = (pts) => {
      const P2 = pts.map(([fx, fy, hw]) => [w * fx, top + (h - top) * fy, hw * s]);
      const at = (i) => P2[Math.max(0, Math.min(P2.length - 1, i))];
      const line = [];
      for (let i = 0; i < P2.length - 1; i++) for (let k = 0; k < 16; k++) {
        const t = k / 16, [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
        const cr = (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t * t * t);
        line.push([cr(0), cr(1), cr(2)]);
      }
      line.push(P2[P2.length - 1]);
      const L = [], R = [];
      // banks are never straight: each side wanders on its own
      const wob = (i, ph) => 1 + 0.22 * Math.sin(i * 0.45 + ph) + 0.12 * Math.sin(i * 1.7 + ph * 2) + (r() - 0.5) * 0.12;
      line.forEach(([x, y, hw], i) => {
        const [ax, ay] = line[Math.max(0, i - 1)], [bx, by] = line[Math.min(line.length - 1, i + 1)];
        const n = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / n, ny = (bx - ax) / n * 0.35;
        const a = hw * wob(i, 0.7), b = hw * wob(i, 2.9);
        L.push([x + nx * a, y + ny * a]); R.push([x - nx * b, y - ny * b]);
      });
      const path = () => { ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); L.forEach(([x, y]) => ctx.lineTo(x, y)); R.reverse().forEach(([x, y]) => ctx.lineTo(x, y)); R.reverse(); ctx.closePath(); };
      ctx.save(); path(); ctx.clip(); ctx.drawImage(wet, 0, 0, w, h);
      // at night the creek holds the moonlight, so it reads as water and not as a path
      if (P.night) {
        ctx.fillStyle = alpha('#7C7AB0', 0.22); ctx.fillRect(0, top, w, h - top);
        for (let i = 0; i < 260; i++) { const [x, y, hw] = line[Math.floor(r() * line.length)], k = 0.3 + near(y) * 1.6; ctx.fillStyle = alpha('#D9D4F0', 0.25 + r() * 0.35); ctx.fillRect(x + (r() - 0.5) * hw * 1.6, y + (r() - 0.5) * 3 * k * s, (3 + r() * 8) * k * s, 0.8 * k * s); }
      }
      ctx.restore();
      // wet banks: a dark lip on the near side, a pale shine on the far one
      ctx.lineCap = 'round';
      for (const [side, c, a, wd] of [[R, P.mudDark, P.night ? 0.6 : 0.45, 1.6], [L, P.night ? '#7C7AA6' : '#F4ECEE', P.night ? 0.35 : 0.6, 1]]) {
        for (let i = 1; i < side.length; i++) {
          const k = 0.3 + near(side[i][1]) * 1.6;
          ctx.strokeStyle = alpha(c, a); ctx.lineWidth = wd * k * s; ctx.beginPath(); ctx.moveTo(side[i - 1][0], side[i - 1][1]); ctx.lineTo(side[i][0], side[i][1]); ctx.stroke();
        }
      }
      return line;
    };
    const main = creek(o.creek);
    if (o.creek2) creek(o.creek2);
    // puddles left in the hollows, each with a piece of sky in it
    for (let i = 0; i < o.pools; i++) {
      const t = 0.15 + r() * 0.85, y = top + t * t * (h - top), k = (0.3 + t * 1.5) * s, x = r() * w;
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, (10 + r() * 22) * k, (1.5 + r() * 2.5) * k, 0, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(wet, 0, 0, w, h); ctx.restore();
    }
    // birch twigs mark the way along the creek, from the Hallig out into the flats
    for (let i = 4; i < main.length; i += o.prickeStep) {
      const [x, y, hw] = main[i], k = (0.3 + near(y) * 1.7) * s;
      pricke(ctx, x - hw * 1.6 - 8 * k, y + 1 * k, k, P);
    }
    // the Hallig and warft again, over the mud, then the railway out on its causeway
    hallig();
    const [d0x, d0y] = [w * o.dam[0], hb + 3 * s], [d1x, d1y] = [w * o.dam[1], top + (h - top) * o.dam[2]];
    const dam = (t) => [d0x + (d1x - d0x) * t, d0y + (d1y - d0y) * t];
    const dw = (t) => (3 + 18 * t) * s;
    ctx.fillStyle = P.night ? '#2A2B48' : '#8E8296';
    ctx.beginPath(); ctx.moveTo(d0x, d0y); ctx.lineTo(d1x, d1y); ctx.lineTo(d1x, d1y + dw(1) * 0.55); ctx.lineTo(d0x, d0y + 1.5 * s); ctx.fill();
    ctx.fillStyle = P.quayTop; ctx.beginPath(); ctx.moveTo(d0x, d0y - 1 * s); ctx.lineTo(d1x, d1y - dw(1) * 0.25); ctx.lineTo(d1x, d1y); ctx.lineTo(d0x, d0y); ctx.fill();
    ctx.strokeStyle = P.night ? '#0E1226' : '#3A3F5C'; ctx.lineWidth = 0.9 * s;
    for (const f of [0.35, 0.8]) { ctx.beginPath(); ctx.moveTo(d0x, d0y - 1 * s + f * 1 * s); ctx.lineTo(d1x, d1y - dw(1) * 0.25 * (1 - f)); ctx.stroke(); }
    for (let t = 0.03; t < 1; t += 0.02 + 0.03 * t) { const [x, y] = dam(t); ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(x - 0.5 * s, y - dw(t) * 0.25 * 0.2); ctx.lineTo(x + 0.5 * s, y - dw(t) * 0.25 * 0.9); ctx.stroke(); }
    { const [x, y] = dam(o.loreAt); lore(ctx, x, y - dw(o.loreAt) * 0.12, s * (0.6 + o.loreAt * 0.8), P); }
    // gulls resting out on the flats
    for (const [fx, fy, k] of o.perched) perched(ctx, w * fx, top + (h - top) * fy, s * k, P);
  },
};

SCENES.water = function (ctx, w, h, P, r) {
  ctx.fillStyle = grad(ctx, 0, 0, 0, h, [P.water[1], P.water[2]]); ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    const roll = r();
    const c = P.night
      ? (roll < 0.08 ? '#5A6496' : roll < 0.13 ? '#E9C98A' : roll < 0.3 ? '#10162C' : ['#2E3863', '#273058', '#1E264A'][Math.floor(r() * 3)])
      : (roll < 0.1 ? '#E6E3EF' : roll < 0.18 ? '#A9C0A4' : roll < 0.25 ? '#F0D4BF' : roll < 0.4 ? '#6F8FB0' : ['#9DB7CC', '#8AA9C2', '#7D9DB8'][Math.floor(r() * 3)]);
    ctx.fillStyle = alpha(c, 0.55 + r() * 0.4); ctx.fillRect(r() * w, r() * h, 8 + r() * 16, 2 + r() * 2.5);
  }
};

/** Monet pass: strokes follow edges, lie flat on water, colour broken with lilac and peach. */
function paintify(src0, o, r) {
  const p = 40, W = src0.width + 2 * p, H = src0.height + 2 * p, W0 = src0.width, H0 = src0.height;
  const src = document.createElement('canvas'); src.width = W; src.height = H; const sc = src.getContext('2d');
  sc.drawImage(src0, p, p); sc.drawImage(src0, 0, 0, 1, H0, 0, p, p, H0); sc.drawImage(src0, W0 - 1, 0, 1, H0, W0 + p, p, p, H0);
  sc.drawImage(src, 0, p, W, 1, 0, 0, W, p); sc.drawImage(src, 0, p + H0 - 1, W, 1, 0, p + H0, W, p);
  const out = document.createElement('canvas'); out.width = W; out.height = H; const c = out.getContext('2d');
  c.filter = 'blur(18px)'; c.drawImage(src, 0, 0); c.filter = 'none';
  const lum = (d, i) => 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
  const waterY = p + o.waterY * H0;
  for (const R of o.radii) {
    const b = document.createElement('canvas'); b.width = W; b.height = H; const bc = b.getContext('2d');
    bc.filter = `blur(${Math.max(0.5, R * 0.45)}px)`; bc.drawImage(src, 0, 0);
    const ref = bc.getImageData(0, 0, W, H).data; const cur = c.getImageData(0, 0, W, H).data;
    const at = (x, y) => ((Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))) * 4);
    const strokes = [];
    const grid = Math.max(1, Math.round(R * 0.9));
    for (let y = 0; y < H; y += grid) for (let x = 0; x < W; x += grid) {
      let err = 0, mx = x, my = y, me = -1;
      for (let k = 0; k < 4; k++) { const sx = x + r() * grid, sy = y + r() * grid, i = at(sx, sy); const e = Math.abs(ref[i] - cur[i]) + Math.abs(ref[i + 1] - cur[i + 1]) + Math.abs(ref[i + 2] - cur[i + 2]); err += e; if (e > me) { me = e; mx = sx; my = sy; } }
      if (R === o.radii[0] || err / 4 > o.threshold) strokes.push([mx, my]);
    }
    for (let i = strokes.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [strokes[i], strokes[j]] = [strokes[j], strokes[i]]; }
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const [x0, y0] of strokes) {
      const i0 = at(x0, y0); let col = [ref[i0], ref[i0 + 1], ref[i0 + 2]];
      const roll = r();
      if (roll < o.broken) { const tint = (o.night ? [[70, 80, 140], [190, 170, 120]] : [[200, 185, 230], [245, 205, 180], [160, 190, 165]])[Math.floor(r() * (o.night ? 2 : 3))]; col = col.map((v, k) => v + (tint[k] - v) * 0.22); }
      col = col.map((v) => Math.max(0, Math.min(255, v + (r() - 0.5) * o.jitter)));
      const pts = [[x0, y0]]; let x = x0, y = y0, pdx = 0, pdy = 0;
      const maxLen = y0 > waterY ? o.waterLen : o.len;
      for (let k = 0; k < maxLen; k++) {
        let dx, dy;
        if (y > waterY) { dx = 1; dy = (r() - 0.5) * 0.12; }
        else {
          const gx = lum(ref, at(x + 1, y)) - lum(ref, at(x - 1, y)), gy = lum(ref, at(x, y + 1)) - lum(ref, at(x, y - 1));
          const m = Math.hypot(gx, gy);
          if (m < 1.2) { dx = Math.cos(o.skyAngle) ; dy = Math.sin(o.skyAngle) + (r() - 0.5) * 0.3; } else { dx = -gy / m; dy = gx / m; }
        }
        if (dx * pdx + dy * pdy < 0) { dx = -dx; dy = -dy; }
        const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n; pdx = dx; pdy = dy;
        x += dx * R; y += dy * R;
        const ii = at(x, y); const d = Math.abs(ref[ii] - ref[i0]) + Math.abs(ref[ii + 1] - ref[i0 + 1]) + Math.abs(ref[ii + 2] - ref[i0 + 2]);
        if (k > 0 && d > o.stop) break;
        pts.push([x, y]);
      }
      c.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${o.opacity})`; c.lineWidth = R * (0.8 + r() * 0.5);
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      if (pts.length === 1) c.lineTo(x0 + 0.6, y0 + 0.3);
      for (let k = 1; k < pts.length; k++) { const [px, py] = pts[k - 1], [qx, qy] = pts[k]; c.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2); }
      c.stroke();
    }
  }
  // canvas weave and a faint warm varnish
  const g = c.getImageData(0, 0, W, H), d = g.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; const n = ((x * 7 + y * 13) % 5 === 0 ? -6 : 0) + (r() - 0.5) * 8; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  c.putImageData(g, 0, 0);
  const fin = document.createElement('canvas'); fin.width = W0; fin.height = H0; fin.getContext('2d').drawImage(out, -p, -p);
  return fin;
}

window.render = function (spec) {
  const { scene, w, h, scale, seed, night, paint } = spec;
  const P = night ? NIGHT : DAY;
  const cv = document.createElement('canvas'); cv.width = w * scale; cv.height = h * scale;
  const ctx = cv.getContext('2d'); ctx.scale(scale, scale);
  const r = rng(seed);
  SCENES[scene](ctx, w, h, P, r, spec.o);
  const out = paint ? paintify(cv, { ...paint, night }, rng(seed + 1)) : cv;
  return { painted: out.toDataURL('image/jpeg', 0.78), under: spec.under ? cv.toDataURL('image/jpeg', 0.86) : null };
};
