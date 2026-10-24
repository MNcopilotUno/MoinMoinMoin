// Procedural impressionist paintings for Moin Moin Moin: thousands of short, seeded brush strokes.
// Deterministic — the same seed paints the same picture — so the committed images can be
// re-rendered exactly with `pnpm --filter @moin/assets art`. Build-time tool; nothing here ships.
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const jitter = (c, r, amt) => { const A = hex(c); return '#' + A.map((v) => Math.max(0, Math.min(255, Math.round(v + (r() - 0.5) * amt))).toString(16).padStart(2, '0')).join(''); };
// gradient sampler: stops [[t, color], ...]
const ramp = (stops, t) => { for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return mixc(c0, c1, (t - t0) / (t1 - t0)); } return stops[stops.length - 1][1]; };

/** A stroke: a rounded tapered dab. */
function stroke(x, y, len, w, angle, color, opacity) {
  const h = w / 2;
  return `<path d="M${(-len / 2).toFixed(1)} 0 Q${(-len / 4).toFixed(1)} ${(-h).toFixed(1)} ${(len / 2).toFixed(1)} ${(-h * 0.4).toFixed(1)} Q${(len / 2 + h * 0.6).toFixed(1)} 0 ${(len / 2).toFixed(1)} ${(h * 0.4).toFixed(1)} Q${(-len / 4).toFixed(1)} ${h.toFixed(1)} ${(-len / 2).toFixed(1)} 0Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})" fill="${color}" fill-opacity="${opacity.toFixed(2)}"/>`;
}

const DAY = {
  sky: [[0, '#B8C3DE'], [0.35, '#D4CBE2'], [0.7, '#EDD2CF'], [1, '#F5DCC4']],
  water: [[0, '#C7CFDC'], [0.18, '#A6BCCF'], [0.55, '#86A5BF'], [1, '#6787A6']],
  glow: ['#F7B88E', '#F3C2A0'], skyA: '#C9C2E4', skyB: '#F6E6D6', near: '#F5BE98',
  sun: '#EC7448', sunStrokes: ['#F08A5A', '#E2603C'], shore: ['#9A95B8', '#B9AEC8'],
  tower: '#8F89AE', lamp: '#F2C7A4', band: '#B8B0CC', crane: '#8E89AE',
  hull: '#34436C', mast: '#33406A', boatStroke: '#3B4A73', boatRefl: '#56638C',
  waterSpecial: ['#E4E2EE', '#A7BFA3', '#EFD3BE', '#5F7AA0'], refl: ['#EE8452', '#F5B98F'],
  haze: '#E9DDE6', night: false,
};
const NIGHT = {
  sky: [[0, '#141A33'], [0.4, '#232B52'], [0.75, '#3B3D6B'], [1, '#5A4F78']],
  water: [[0, '#2E3560'], [0.18, '#232B50'], [0.55, '#1A2242'], [1, '#121831']],
  glow: ['#F4E7B8', '#C9C7E6'], skyA: '#2E3768', skyB: '#4A4778', near: '#C9C3E2',
  sun: '#F3E9C2', sunStrokes: ['#FFF6D8', '#E9DCAA'], shore: ['#1C2140', '#2A2B52'],
  tower: '#1F2445', lamp: '#FFD27A', band: '#3A3F6A', crane: '#262B50',
  hull: '#0E1226', mast: '#0E1226', boatStroke: '#151A33', boatRefl: '#2A3160',
  waterSpecial: ['#5A6496', '#3B4E5E', '#E9C98A', '#10162C'], refl: ['#F3E7B8', '#D9C98E'],
  haze: '#2A2B52', night: true,
};

export function harbour({ w = 390, h = 844, seed = 11, horizon = 0.40, sunX = 0.72, sunY = 0.17, density = 1, scene = 'harbour', night = false } = {}) {
  const P = night ? NIGHT : DAY;
  const r = rng(seed);
  const out = [];
  const sky = P.sky;
  const water = P.water;
  const hy = h * horizon;
  const n = (k) => Math.round(k * density);
  out.push(`<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">${sky.map(([t, c]) => `<stop offset="${t}" stop-color="${c}"/>`).join('')}</linearGradient>`);
  out.push(`<linearGradient id="wa" x1="0" y1="0" x2="0" y2="1">${water.map(([t, c]) => `<stop offset="${t}" stop-color="${c}"/>`).join('')}</linearGradient>`);
  out.push(`<radialGradient id="glow"><stop offset="0" stop-color="${P.glow[0]}" stop-opacity="${night ? 0.45 : 0.9}"/><stop offset="0.35" stop-color="${P.glow[1]}" stop-opacity="0.45"/><stop offset="1" stop-color="#F3C2A0" stop-opacity="0"/></radialGradient>`);
  const body = [];
  body.push(`<rect width="${w}" height="${hy + 2}" fill="url(#sk)"/>`, `<rect y="${hy}" width="${w}" height="${h - hy}" fill="url(#wa)"/>`);
  body.push(`<circle cx="${sunX * w}" cy="${sunY * h}" r="${w * 0.32}" fill="url(#glow)"/>`);
  for (let i = 0; i < n(2200); i++) {
    const y = r() * hy, x = r() * w, t = y / hy;
    let c = jitter(ramp(sky, t), r, 22);
    const roll = r();
    if (roll < 0.12) c = jitter(P.skyA, r, 16); else if (roll < 0.2) c = jitter(P.skyB, r, 14);
    const dx = (x - sunX * w) / w, dy = (y - sunY * h) / h, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.25) c = mixc(c, P.near, (0.25 - d) * (night ? 1.4 : 2.6));
    body.push(stroke(x, y, 12 + r() * 24, 4 + r() * 6, -10 + r() * 12, c, 0.30 + r() * 0.35));
  }
  if (night) {
    for (let i = 0; i < 160; i++) {
      const sx = r() * w, sy = r() * hy * 0.85, sr = 0.4 + r() * 1.1;
      body.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(2)}" fill="#FFF6DA" fill-opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`);
    }
  }
  // sun (or moon): soft disc of strokes inside a radius
  const R = 13;
  body.push(`<circle cx="${sunX * w}" cy="${sunY * h}" r="${R}" fill="${P.sun}" fill-opacity="${night ? 0.95 : 0.85}"/>`);
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * (R - 3);
    body.push(stroke(sunX * w + Math.cos(a) * rr, sunY * h + Math.sin(a) * rr, 5 + r() * 4, 3 + r() * 2, r() * 180, jitter(r() < 0.5 ? P.sunStrokes[0] : P.sunStrokes[1], r, 20), 0.8));
  }
  // far shore: hazy lilac town with roofs, cranes and a lighthouse
  for (let i = 0; i < n(700); i++) {
    const x = r() * w; const base = hy;
    const top = base - (5 + 9 * Math.abs(Math.sin(x / 29)) + 6 * Math.abs(Math.sin(x / 11)) + r() * 4);
    const y = top + r() * (base - top);
    body.push(stroke(x, y, 5 + r() * 7, 3 + r() * 3, -8 + r() * 16, jitter(mixc(P.shore[0], P.shore[1], r()), r, 16), night ? 0.85 : 0.55));
  }
  // lighthouse and cranes as hazy silhouettes
  const lx = w * 0.12;
  body.push(`<path d="M${lx - 5} ${hy} L${lx - 3} ${hy - 46} L${lx + 3} ${hy - 46} L${lx + 5} ${hy} Z" fill="${P.tower}" fill-opacity="0.8"/>`);
  body.push(`<rect x="${lx - 4}" y="${hy - 52}" width="8" height="7" fill="${P.lamp}" fill-opacity="0.9"/>`);
  body.push(`<path d="M${lx - 4.5} ${hy - 30} H${lx + 4.5} M${lx - 4} ${hy - 16} H${lx + 4}" stroke="${P.band}" stroke-width="3" stroke-opacity="0.8"/>`);
  const crane = (x, ht, arm) => body.push(`<path d="M${x} ${hy} V${hy - ht} H${x + arm} M${x} ${hy - ht + 6} L${x + arm * 0.6} ${hy - ht} M${x + arm - 2} ${hy - ht} V${hy - ht + 12}" fill="none" stroke="${P.crane}" stroke-width="2" stroke-opacity="0.75" stroke-linecap="round"/>`);
  crane(w * 0.84, 40, -26); crane(w * 0.93, 30, -18);
  if (night) {
    // lit windows along the shore, and their warm wobble on the water
    for (let i = 0; i < 46; i++) {
      const x = r() * w, y = hy - 3 - r() * 12;
      body.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="2.4" height="2.8" fill="#FFD27A" fill-opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`);
      for (let k = 0; k < 4; k++) body.push(stroke(x + (r() - 0.5) * 4, hy + 6 + k * (6 + r() * 10), 5 + r() * 6, 1.6 + r() * 1.4, -3 + r() * 6, jitter('#F2B65E', r, 20), 0.45 - k * 0.08));
    }
  }
  // dark-blue boats and masts, the Impression-Sunrise accents
  const fore = [];
  const boat = (x, y, s) => {
    const body = fore;
    body.push(`<path d="M${x - 15 * s} ${y - 2 * s} Q${x} ${y + 5 * s} ${x + 15 * s} ${y - 3 * s} Q${x} ${y + 1 * s} ${x - 15 * s} ${y - 2 * s} Z" fill="${P.hull}" fill-opacity="0.85"/>`);
    body.push(`<path d="M${x + 2 * s} ${y - 1 * s} Q${x + 1 * s} ${y - 16 * s} ${x + 2.5 * s} ${y - 30 * s}" fill="none" stroke="${P.mast}" stroke-width="${1.4 * s}" stroke-linecap="round"/>`);
    body.push(`<path d="M${x - 4 * s} ${y - 4 * s} q1 -5 3 -6 q2 1 2 6 z" fill="${P.hull}"/>`);
    for (let i = 0; i < 18; i++) body.push(stroke(x + (r() - 0.5) * 26 * s, y - 2 * s + (r() - 0.5) * 3 * s, (5 + r() * 6) * s, (2 + r() * 2) * s, -4 + r() * 8, jitter(P.boatStroke, r, 18), 0.6));
    for (let i = 0; i < 24; i++) body.push(stroke(x + (r() - 0.5) * 24 * s, y + 6 * s + r() * 16 * s, (6 + r() * 8) * s, (2 + r() * 2) * s, -3 + r() * 6, jitter(P.boatRefl, r, 18), 0.35));
  };
  if (scene === 'ferry') boat(w * 0.84, hy + 40, 0.8);
  if (scene === 'harbour') { boat(w * 0.28, hy + 26, 1); boat(w * 0.08, hy + 58, 1.4); boat(w * 0.56, hy + 14, 0.7); }
  if (scene === 'market') {
    // striped market awnings along the quay, painted loosely
    for (let k = 0; k < 6; k++) {
      const x0 = w * (0.02 + k * 0.17), y0 = hy - 4;
      body.push(`<path d="M${x0} ${y0} L${x0 + 8} ${y0 - 18} H${x0 + 52} L${x0 + 60} ${y0} Z" fill="#FBF3E6" fill-opacity="0.92"/>`);
      for (let j = 0; j < 4; j++) body.push(`<path d="M${x0 + 4 + j * 14} ${y0} L${x0 + 11 + j * 13} ${y0 - 18} H${x0 + 17 + j * 13} L${x0 + 11 + j * 14} ${y0} Z" fill="${['#3552A6', '#8FAE8A', '#3552A6', '#B7A9D3'][(k + j) % 4]}" fill-opacity="0.85"/>`);
      body.push(`<rect x="${x0 + 4}" y="${y0}" width="52" height="12" fill="#D9B98C" fill-opacity="0.9"/>`);
      for (let j = 0; j < 8; j++) body.push(`<circle cx="${x0 + 8 + j * 6}" cy="${y0 + 5}" r="2.2" fill="${['#F2B47E', '#A9C08A', '#EFD27A', '#E9A27A'][(j + k) % 4]}"/>`);
      for (let i = 0; i < 46; i++) body.push(stroke(x0 + 4 + r() * 54, y0 - 18 + r() * 30, 4 + r() * 6, 2 + r() * 2.5, -20 + r() * 40, jitter(['#F6EFE2', '#5F78C0', '#A9C29F', '#C9BCE0', '#E8CFA0'][Math.floor(r() * 5)], r, 20), 0.45));
    }
    body.push(`<rect x="0" y="${hy - 26}" width="${w}" height="40" fill="${P.haze}" fill-opacity="${night ? 0.62 : 0.28}"/>`);
  }
  if (scene === 'ferry') {
    const fx = w * 0.30, fy = hy + 26;
    body.push(`<path d="M${fx - 70} ${fy - 14} H${fx + 86} L${fx + 72} ${fy + 6} H${fx - 58} Z" fill="${night ? '#4E5684' : '#F3F0EA'}" fill-opacity="0.95"/>`);
    body.push(`<path d="M${fx - 64} ${fy - 4} H${fx + 80}" stroke="#3552A6" stroke-width="4"/>`);
    body.push(`<rect x="${fx - 36}" y="${fy - 30}" width="84" height="16" fill="${night ? '#5C6492' : '#F7F5F0'}"/><rect x="${fx - 2}" y="${fy - 44}" width="14" height="14" fill="#3552A6"/>`);
    for (let j = 0; j < 6; j++) body.push(`<rect x="${fx - 30 + j * 13}" y="${fy - 26}" width="8" height="6" rx="1.5" fill="#1F2F5C" fill-opacity="0.8"/>`);
    for (let i = 0; i < 40; i++) body.push(stroke(fx + (r() - 0.5) * 130, fy + 10 + r() * 20, 8 + r() * 10, 2 + r() * 2, -3 + r() * 6, jitter(night ? '#6A6F9A' : '#E9E6EE', r, 16), 0.35));
    for (let i = 0; i < 160; i++) body.push(stroke(fx - 66 + r() * 150, fy - 44 + r() * 48, 4 + r() * 8, 2 + r() * 2.5, -15 + r() * 30, jitter((night ? ['#5C6492', '#4E5684', '#3B4E8A', '#6A6F9A'] : ['#F6F3EE', '#E6E3EA', '#5F78C0', '#D5D2DE'])[Math.floor(r() * 4)], r, 18), 0.4));
    body.push(`<rect x="0" y="${hy - 50}" width="${w}" height="80" fill="${P.haze}" fill-opacity="${night ? 0.6 : 0.22}"/>`);
    if (night) for (let j = 0; j < 6; j++) body.push(`<rect x="${fx - 30 + j * 13}" y="${fy - 26}" width="8" height="6" rx="1.5" fill="#FFD27A" fill-opacity="0.9"/>`);
  }
  // water: dense horizontal strokes
  for (let i = 0; i < n(7000); i++) {
    const t = Math.pow(r(), 1.05), y = hy + t * (h - hy), x = r() * w;
    let c = jitter(ramp(water, t), r, 26);
    const roll = r();
    const [s0, s1, s2, s3] = P.waterSpecial;
    if (roll < 0.09) c = jitter(s0, r, 16); else if (roll < 0.15) c = jitter(s1, r, 18); else if (roll < (night ? 0.17 : 0.21)) c = jitter(s2, r, 16); else if (roll < 0.27) c = jitter(s3, r, 16);
    const near = Math.abs(x - sunX * w) < 10 + t * 46;
    if (near && r() < 0.6) c = jitter(r() < 0.45 ? P.refl[0] : P.refl[1], r, 26);
    const len = (7 + r() * 14) * (0.55 + t * 1.2), wd = (2 + r() * 2.6) * (0.6 + t * 1.1);
    body.push(stroke(x, y, len, wd, -3 + r() * 6, c, 0.5 + r() * 0.4));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"><defs>${out.join('')}<filter id="p"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="2.5"/></filter></defs><g filter="url(#p)">${body.join('')}</g><g>${fore.join('')}</g></svg>`;
}

/** Painted water for the board: short horizontal strokes, no horizon. */
export function water({ w = 340, h = 230, seed = 5, night = false } = {}) {
  const r = rng(seed); const o = [];
  for (let i = 0; i < 1600; i++) {
    const x = r() * w, y = r() * h; const roll = r();
    const c = night
      ? (roll < 0.08 ? '#5A6496' : roll < 0.13 ? '#E9C98A' : roll < 0.3 ? '#10162C' : ['#2E3863', '#273058', '#1E264A'][Math.floor(r() * 3)])
      : (roll < 0.1 ? '#E6E3EF' : roll < 0.18 ? '#A9C0A4' : roll < 0.25 ? '#F0D4BF' : roll < 0.4 ? '#6F8FB0' : ['#9DB7CC', '#8AA9C2', '#7D9DB8'][Math.floor(r() * 3)]);
    const len = 8 + r() * 14, wd = 2.4 + r() * 2.6;
    o.push(`<path d="M${-len / 2} 0 Q0 ${-wd / 2} ${len / 2} 0 Q0 ${wd / 2} ${-len / 2} 0Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-4 + r() * 8).toFixed(1)})" fill="${c}" fill-opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="${night ? '#222B52' : '#8EADC5'}"/>${o.join('')}</svg>`;
}

/** Sun-bleached pier planks for the people's tiles. */
export function plank({ seed = 3 } = {}) {
  const r = rng(seed); const o = [];
  for (let i = 0; i < 140; i++) {
    const x = r() * 100, y = r() * 100;
    o.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} h${(4 + r() * 10).toFixed(1)}" stroke="${['#E9D1A6', '#D8B989', '#C9A877', '#F2DDB8'][Math.floor(r() * 4)]}" stroke-width="${(2 + r() * 3).toFixed(1)}" stroke-linecap="round" stroke-opacity="0.8"/>`);
  }
  for (const x of [33, 66]) o.push(`<path d="M${x} 0 V100" stroke="#9C7A50" stroke-width="1.2" stroke-opacity="0.55"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" preserveAspectRatio="none"><rect width="100" height="100" fill="#DDC195"/>${o.join('')}</svg>`;
}

/** The three parts of town (ROADMAP Phase 2 story), painted at phone size. */
export const SCENES = {
  harbour: { seed: 11, sunX: 0.7, sunY: 0.15, scene: 'harbour' },
  market: { seed: 23, sunX: 0.78, sunY: 0.13, scene: 'market' },
  ferry: { seed: 37, sunX: 0.8, sunY: 0.12, scene: 'ferry' },
};
