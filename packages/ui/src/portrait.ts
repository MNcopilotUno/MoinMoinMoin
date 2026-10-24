import type { Facing } from '@moin/core';

/**
 * Gouache-style portraits (the impressionist art direction, `.agents/features/impressionist-art.md`),
 * dressed for the North German coast (`.agents/features/north-german-art.md`): sou'wester and
 * oilskin, Elbsegler cap, Kopftuch, raincoat over a Fischerhemd.
 * role × mood × facing × skin tone → an SVG string, viewBox 0 0 200 220. Pure and deterministic.
 * Red (#C8102E) appears only in a smile and in a captain's received-greeting pips: red means Moin.
 */
export type PortraitRole = 'fisherman' | 'captain' | 'market' | 'kid';
export type Mood = 'grumpy' | 'half' | 'smiling';

export interface PortraitOptions {
  readonly role?: PortraitRole;
  readonly mood?: Mood;
  readonly facing?: Facing;
  /** 0, 1 or 2 (light to dark). */
  readonly tone?: number;
  readonly chatter?: boolean;
  /** Prefix for SVG ids; must be unique on the page. */
  readonly id?: string;
  /** Draw a captain's greeting pips (off for onlookers, who are not in the puzzle). */
  readonly pips?: boolean;
}

const SKIN: readonly { base: string; shade: string; light: string; lip: string }[] = [
  { base: '#F0CDB0', shade: '#C98F70', light: '#FBE6D4', lip: '#B9706A' },
  { base: '#D9A47E', shade: '#A86E4E', light: '#EFC7A6', lip: '#9E5A4E' },
  { base: '#9C6A4C', shade: '#6B4330', light: '#BE8A68', lip: '#7A4438' },
];
const LOOK: Readonly<Record<Facing, readonly [number, number]>> = { N: [0, -2.2], E: [3.2, 0.2], S: [0, 2.4], W: [-3.2, 0.2] };
const TURN: Readonly<Record<Facing, readonly [number, number]>> = { N: [0, -1.5], E: [4, 0], S: [0, 2], W: [-4, 0] };

export function portrait({ role = 'fisherman', mood = 'grumpy', facing = 'E', tone = 0, chatter = false, id = 'p', pips = true }: PortraitOptions = {}): string {
  const k = SKIN[((tone % 3) + 3) % 3]!;
  const [lx, ly] = LOOK[facing];
  const [tx, ty] = TURN[facing];
  const kid = role === 'kid', captain = role === 'captain', market = role === 'market';
  const smile = mood === 'smiling', half = mood === 'half', grumpy = mood === 'grumpy';
  const head = kid
    ? 'M100 50 C128 50 142 70 142 96 C142 122 132 140 120 150 C113 156 107 159 100 159 C93 159 87 156 80 150 C68 140 58 122 58 96 C58 70 72 50 100 50Z'
    : 'M100 42 C130 42 146 64 146 94 C146 120 137 140 125 152 C117 160 108 165 100 165 C92 165 83 160 75 152 C63 140 54 120 54 94 C54 64 70 42 100 42Z';
  const ex = 20, ey = kid ? 100 : 98, cx = 100 + tx, cy = ty;
  const eyeL: [number, number] = [cx - ex, ey + cy], eyeR: [number, number] = [cx + ex, ey + cy];
  const s: string[] = [];
  s.push(`<defs>
    <clipPath id="${id}-head"><path d="${head}"/></clipPath>
    <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${id}-soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0.35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <filter id="${id}-wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
  </defs>`);
  const coat = ({ captain: ['#1E2D57', '#2E4278'], fisherman: ['#D6A12E', '#F0C95C'], market: ['#9E8FBF', '#B7A9D3'], kid: ['#DDA935', '#F2CC62'] } as const)[role];
  const g: string[] = [];
  // shoulders and clothes
  g.push(`<path d="M10 220 C14 186 50 176 100 174 C150 176 186 186 190 220Z" fill="${coat[0]}"/>`);
  g.push(`<path d="M30 220 C34 196 62 186 100 184 C120 185 140 190 152 198" fill="none" stroke="${coat[1]}" stroke-width="10" stroke-opacity="0.35" stroke-linecap="round"/>`);
  if (kid) { g.push(`<path d="M76 178 L100 220 L124 178 Q100 186 76 178Z" fill="#F6F2EA"/>`); for (let y = 182; y < 220; y += 7) g.push(`<path d="M${78 + (y - 178) * 0.5} ${y} H${122 - (y - 178) * 0.5}" stroke="#2F4A8C" stroke-width="3.2"/>`); g.push(`<path d="M70 176 L100 220 M130 176 L100 220" stroke="#B8862A" stroke-width="3" fill="none"/><circle cx="78" cy="204" r="3" fill="#8C6420"/><circle cx="122" cy="204" r="3" fill="#8C6420"/>`); }
  if (role === 'fisherman') { g.push(`<path d="M66 182 L86 168 L100 186 L114 168 L134 182 L118 192 L100 186 L82 192Z" fill="#C48F24"/><path d="M100 186 V220" stroke="#A97A1E" stroke-width="2"/>`); for (const x of [92, 108]) g.push(`<circle cx="${x}" cy="${x === 92 ? 204 : 214}" r="2.6" fill="#3A2E1A"/>`); for (let x = 30; x <= 170; x += 18) g.push(`<path d="M${x} 196 q6 10 2 24" fill="none" stroke="#F6DA8A" stroke-width="3" stroke-opacity="0.45"/>`); }
  if (captain) { g.push(`<path d="M100 176 L86 220 M100 176 L114 220" stroke="#13203F" stroke-width="2.5"/>`); for (const y of [196, 210]) g.push(`<circle cx="90" cy="${y}" r="3" fill="#D9B46A"/><circle cx="110" cy="${y}" r="3" fill="#D9B46A"/>`); }
  if (market) { g.push(`<path d="M74 220 L80 186 Q100 182 120 186 L126 220Z" fill="#FBF7EE"/><path d="M80 186 L70 178 M120 186 L130 178" stroke="#FBF7EE" stroke-width="4"/>`); }
  // neck
  g.push(`<path d="M84 146 C86 162 84 172 80 180 Q100 190 120 180 C116 172 114 162 116 146Z" fill="${k.base}"/>`);
  g.push(`<path d="M84 160 Q100 172 116 160 L116 176 Q100 184 84 176Z" fill="${k.shade}" fill-opacity="0.55"/>`);
  // ears
  g.push(`<path d="M56 96 C46 92 44 106 50 114 C53 118 57 118 59 114Z" fill="${k.base}"/><path d="M144 96 C154 92 156 106 150 114 C147 118 143 118 141 114Z" fill="${k.base}"/>`);
  g.push(`<path d="M52 100 Q50 106 54 112" fill="none" stroke="${k.shade}" stroke-width="1.6" stroke-opacity="0.7"/><path d="M148 100 Q150 106 146 112" fill="none" stroke="${k.shade}" stroke-width="1.6" stroke-opacity="0.7"/>`);
  if (market) g.push(`<circle cx="52" cy="120" r="3.2" fill="#D9B46A"/><circle cx="148" cy="120" r="3.2" fill="#D9B46A"/>`);
  // head with shading
  g.push(`<path d="${head}" fill="${k.base}"/>`);
  g.push(`<g clip-path="url(#${id}-head)">
    <ellipse cx="146" cy="104" rx="30" ry="74" fill="${k.shade}" fill-opacity="0.55" filter="url(#${id}-soft)"/>
    <ellipse cx="100" cy="168" rx="50" ry="14" fill="${k.shade}" fill-opacity="0.5" filter="url(#${id}-soft)"/>
    <ellipse cx="82" cy="70" rx="24" ry="14" fill="${k.light}" fill-opacity="0.7" filter="url(#${id}-soft)"/>
    <ellipse cx="${74 + tx}" cy="${116 + ty}" rx="13" ry="8" fill="${smile ? '#EBA28E' : k.light}" fill-opacity="${smile ? 0.6 : 0.45}" filter="url(#${id}-soft)"/>
    <ellipse cx="${126 + tx}" cy="${116 + ty}" rx="13" ry="8" fill="${smile ? '#EBA28E' : k.shade}" fill-opacity="${smile ? 0.55 : 0.25}" filter="url(#${id}-soft)"/>
    <ellipse cx="${100 + tx}" cy="${ey + cy - 4}" rx="34" ry="9" fill="${k.shade}" fill-opacity="0.22" filter="url(#${id}-soft2)"/>
  </g>`);
  // eyes
  for (const [x, y] of [eyeL, eyeR]) {
    if (smile) {
      g.push(`<path d="M${x - 11} ${y + 1} Q${x} ${y - 9} ${x + 11} ${y + 1}" fill="none" stroke="#2A1D18" stroke-width="2.8" stroke-linecap="round"/>`);
      g.push(`<path d="M${x - 8} ${y + 5} Q${x} ${y + 9} ${x + 8} ${y + 5}" fill="none" stroke="${k.shade}" stroke-width="1.4" stroke-opacity="0.8" stroke-linecap="round"/>`);
      g.push(`<path d="M${x + (x < 100 ? -13 : 13)} ${y - 1} l${x < 100 ? -4 : 4} -2 M${x + (x < 100 ? -13 : 13)} ${y + 3} l${x < 100 ? -4 : 4} 1" stroke="${k.shade}" stroke-width="1.2" stroke-linecap="round"/>`);
    } else {
      const lid = grumpy ? 4.2 : half ? 2.2 : 0;
      const eid = `${id}-e${x}`;
      g.push(`<clipPath id="${eid}"><path d="M${x - 11} ${y} Q${x} ${y - 9} ${x + 11} ${y} Q${x} ${y + 7} ${x - 11} ${y}Z"/></clipPath>`);
      g.push(`<path d="M${x - 11} ${y} Q${x} ${y - 9} ${x + 11} ${y} Q${x} ${y + 7} ${x - 11} ${y}Z" fill="#FBF7F1"/>`);
      g.push(`<g clip-path="url(#${eid})"><circle cx="${x + lx}" cy="${y + ly}" r="${kid ? 6.4 : 5.6}" fill="${kid ? '#5E7F4E' : market ? '#6A4630' : '#4C6E96'}"/><circle cx="${x + lx}" cy="${y + ly}" r="${kid ? 6.4 : 5.6}" fill="none" stroke="#1E2A3A" stroke-width="1.2" stroke-opacity="0.6"/><circle cx="${x + lx}" cy="${y + ly}" r="2.6" fill="#111"/><circle cx="${x + lx - 1.8}" cy="${y + ly - 1.8}" r="1.3" fill="#FFF"/>
        <path d="M${x - 12} ${y - 10} H${x + 12} V${y - 6 + lid} Q${x} ${y - 9 + lid * 1.6} ${x - 12} ${y - 6 + lid}Z" fill="${k.base}"/></g>`);
      g.push(`<path d="M${x - 11.5} ${y + 0.5} Q${x} ${y - 9 + lid * 1.1} ${x + 11.5} ${y + 0.5}" fill="none" stroke="#2A1D18" stroke-width="2.4" stroke-linecap="round"/>`);
      g.push(`<path d="M${x - 9} ${y + 3} Q${x} ${y + 7.5} ${x + 9} ${y + 3}" fill="none" stroke="${k.shade}" stroke-width="1.1" stroke-opacity="0.8"/>`);
      if (market) g.push(`<path d="M${x + (x < 100 ? -11 : 11)} ${y} l${x < 100 ? -3 : 3} -3" stroke="#2A1D18" stroke-width="1.5" stroke-linecap="round"/>`);
    }
  }
  // brows: clusters of hair strokes
  const browColor = captain ? '#F1F1EE' : kid ? '#5A3A22' : market ? '#5C3E2C' : '#6A5040';
  const bw = captain ? 3.2 : market ? 1.5 : 2;
  for (const side of [-1, 1]) {
    const x0 = cx + side * 9, x1 = cx + side * 31;
    const yIn = ey + cy - (grumpy ? 9 : half ? (side < 0 ? 11 : 13) : 15), yOut = ey + cy - (grumpy ? 15 : half ? 14 : 15);
    const arch = smile ? -4 : 0;
    for (let i = 0; i < (captain ? 7 : market ? 3 : 5); i++) {
      const o = (i - 2) * (captain ? 1.4 : 1);
      g.push(`<path d="M${x0} ${yIn + o} Q${(x0 + x1) / 2} ${(yIn + yOut) / 2 + arch + o - 1} ${x1} ${yOut + o * 0.6}" fill="none" stroke="${browColor}" stroke-width="${bw - i * 0.15}" stroke-linecap="round" stroke-opacity="${0.85 - i * 0.08}"/>`);
    }
  }
  const mx = cx, my = 140 + cy;
  // nose
  const nx = cx, ny = (kid ? 104 : 100) + cy;
  g.push(`<path d="M${nx + 3} ${ny} Q${nx + 6} ${ny + 18} ${nx + 9} ${ny + 24} Q${nx + 2} ${ny + 30} ${nx - 8} ${ny + 25}" fill="none" stroke="${k.shade}" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.9"/>`);
  g.push(`<ellipse cx="${nx - 5}" cy="${ny + 25}" rx="2.4" ry="1.5" fill="${k.shade}" fill-opacity="0.9"/><ellipse cx="${nx + 5}" cy="${ny + 25}" rx="2.4" ry="1.5" fill="${k.shade}" fill-opacity="0.9"/>`);
  g.push(`<ellipse cx="${nx - 1}" cy="${ny + 18}" rx="3.5" ry="5" fill="${k.light}" fill-opacity="0.7" filter="url(#${id}-soft2)"/>`);
  // role headgear and hair
  if (role === 'fisherman') {
    g.push(`<path d="M30 92 Q34 74 54 70 Q100 56 146 70 Q166 74 170 92 Q172 112 160 120 Q150 96 100 88 Q50 96 40 120 Q28 112 30 92Z" fill="#B8861F"/>`);
    g.push(`<path d="M54 80 C50 42 74 26 100 26 C126 26 150 42 146 80 Q100 70 54 80Z" fill="#E2AE36"/>`);
    for (const x of [72, 86, 100, 114, 128]) g.push(`<path d="M${x} ${x === 100 ? 26 : 30} Q${100 + (x - 100) * 1.25} 52 ${100 + (x - 100) * 1.45} 78" fill="none" stroke="#B8861F" stroke-width="1.6" stroke-opacity="0.8"/>`);
    g.push(`<ellipse cx="80" cy="44" rx="16" ry="9" fill="#F8DC8C" fill-opacity="0.7" filter="url(#${id}-soft2)"/>`);
    g.push(`<path d="M34 90 Q100 66 166 90" fill="none" stroke="#F2C95A" stroke-width="3" stroke-opacity="0.8"/><path d="M52 80 Q100 70 148 80" fill="none" stroke="#9C711A" stroke-width="2.5"/>`);
    g.push(`<g clip-path="url(#${id}-head)">`);
    for (let i = 0; i < 90; i++) { const a = (i * 2.399) % (Math.PI * 2), rr = (i % 13) / 13; const x = 100 + Math.cos(a) * (14 + rr * 34), y = 150 + Math.abs(Math.sin(a)) * (6 + rr * 10); g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.75" fill="${k.shade}" fill-opacity="0.6"/>`); }
    g.push(`</g>`);
  } else if (captain) {
    g.push(`<path d="M58 118 C58 160 78 184 100 186 C122 184 142 160 142 118 C136 132 126 138 118 136 Q118 158 100 158 Q82 158 82 136 C74 138 64 132 58 118Z" fill="#ECEDEA"/>`);
    g.push(`<path d="M84 138 Q100 162 116 138" fill="none" stroke="#C3C8CF" stroke-width="1.2"/>`);
    for (let i = 0; i < 26; i++) { const x = 62 + i * 3.1; const y0 = 128 + Math.abs(x - 100) * -0.2 + 10; g.push(`<path d="M${x.toFixed(1)} ${y0.toFixed(1)} q${(x < 100 ? -2 : 2)} 18 ${(x < 100 ? -1 : 1)} ${30 - Math.abs(x - 100) * 0.35}" fill="none" stroke="#C3C8CF" stroke-width="1.2" stroke-opacity="0.8"/>`); }
    g.push(`<path d="M44 56 C44 18 156 18 156 56 Q100 46 44 56Z" fill="#1E2D57"/><path d="M58 30 Q100 18 142 30" fill="none" stroke="#3A5090" stroke-width="5" stroke-opacity="0.7"/><ellipse cx="78" cy="34" rx="16" ry="6" fill="#5A70B0" fill-opacity="0.45" filter="url(#${id}-soft2)"/>`);
    g.push(`<path d="M46 52 Q100 44 154 52 L154 64 Q100 57 46 64Z" fill="#1A2550"/>`);
    g.push(`<circle cx="100" cy="53" r="6.5" fill="#D9B46A" stroke="#8A6A2A" stroke-width="1.2"/><path d="M100 49 V57 M97 54 Q100 58 103 54" fill="none" stroke="#7B5B22" stroke-width="1.2"/>`);
    g.push(`<path d="M52 64 Q100 57 148 64 Q146 76 100 73 Q54 76 52 64Z" fill="#0F1220"/><path d="M60 66 Q100 61 140 66" fill="none" stroke="#4A5272" stroke-width="1.5"/><path d="M50 61 Q100 54 150 61" fill="none" stroke="#D9B46A" stroke-width="2.4"/>`);
    g.push(`<path d="M56 70 Q100 76 144 70 L144 80 Q100 82 56 80Z" fill="${k.shade}" fill-opacity="0.3"/>`);
  } else if (market) {
    g.push(`<path d="M48 104 C40 50 70 30 100 30 C130 30 160 50 152 104 C146 80 130 64 100 62 C70 64 54 80 48 104Z" fill="#5F79B8"/>`);
    for (let i = 0; i < 26; i++) { const x = 58 + (i * 37) % 86, y = 38 + (i * 23) % 36; g.push(`<circle cx="${x}" cy="${y}" r="2" fill="#F4F0E6" fill-opacity="0.95"/>`); }
    g.push(`<path d="M60 66 Q100 52 140 66" fill="none" stroke="#46609E" stroke-width="3" stroke-opacity="0.7"/>`);
    g.push(`<path d="M148 96 C164 104 166 120 156 128 C152 118 148 112 142 108Z" fill="#5F79B8"/><path d="M150 100 C160 108 160 118 154 124" fill="none" stroke="#46609E" stroke-width="2"/>`);
    g.push(`<path d="M58 76 Q100 60 142 76 Q100 68 58 80Z" fill="#5C3E2C" fill-opacity="0.9"/>`);
  } else if (kid) {
    g.push(`<path d="M56 100 C48 56 74 36 102 36 C132 36 152 58 144 98 C142 86 136 76 128 70 C126 80 118 78 114 68 C108 78 98 78 94 68 C88 78 78 78 76 70 C66 76 60 86 56 100Z" fill="#7A5236"/>`);
    for (const [x, y, dx] of [[70, 52, -6], [84, 44, -4], [98, 42, 2], [112, 44, 6], [126, 50, 8], [78, 60, -5], [118, 60, 6]] as const) g.push(`<path d="M${x} ${y} q${dx} 8 ${dx * 0.4} 18" fill="none" stroke="#5A3A22" stroke-width="2" stroke-linecap="round" stroke-opacity="0.75"/>`);
    g.push(`<path d="M80 40 Q100 30 124 42" fill="none" stroke="#A8784E" stroke-width="3" stroke-opacity="0.6" stroke-linecap="round"/>`);
    g.push(`<path d="M96 38 Q92 26 100 22 M108 38 Q114 28 120 30" fill="none" stroke="#5A3A22" stroke-width="2.6" stroke-linecap="round"/>`);
    for (const [fx, fy] of [[70, 118], [76, 122], [80, 116], [74, 126], [124, 118], [130, 122], [126, 126], [134, 116]] as const) g.push(`<circle cx="${fx + tx}" cy="${fy + ty}" r="1.2" fill="#9A5A3A" fill-opacity="0.75"/>`);
  }
  // mouth
  if (smile) {
    g.push(`<path d="M${mx - 18} ${my - 3} Q${mx} ${my + 16} ${mx + 18} ${my - 3} Q${mx} ${my + 2} ${mx - 18} ${my - 3}Z" fill="#6E1020"/>`);
    g.push(`<path d="M${mx - 14} ${my - 1} Q${mx} ${my + 4} ${mx + 14} ${my - 1} L${mx + 12} ${my + 2} Q${mx} ${my + 6} ${mx - 12} ${my + 2}Z" fill="#FBF6EE"/>`);
    g.push(`<path d="M${mx - 19} ${my - 3.5} Q${mx} ${my + 1.5} ${mx + 19} ${my - 3.5} M${mx - 17} ${my - 1} Q${mx} ${my + 18} ${mx + 17} ${my - 1}" fill="none" stroke="#C8102E" stroke-width="3" stroke-linecap="round"/>`);
    g.push(`<path d="M${mx - 22} ${my - 6} q-3 4 -1 8 M${mx + 22} ${my - 6} q3 4 1 8" fill="none" stroke="${k.shade}" stroke-width="1.5" stroke-linecap="round"/>`);
  } else if (half) {
    g.push(`<path d="M${mx - 14} ${my + 1} Q${mx - 2} ${my + 2} ${mx + 6} ${my} Q${mx + 11} ${my - 1} ${mx + 15} ${my - 5}" fill="none" stroke="#4A2A22" stroke-width="2.2" stroke-linecap="round"/>`);
    g.push(`<path d="M${mx - 10} ${my + 3} Q${mx} ${my + 8} ${mx + 10} ${my + 2} Q${mx} ${my + 4} ${mx - 10} ${my + 3}Z" fill="${k.lip}" fill-opacity="0.75"/>`);
  } else {
    g.push(`<path d="M${mx - 15} ${my + 4} Q${mx - 8} ${my - 1} ${mx} ${my} Q${mx + 8} ${my - 1} ${mx + 15} ${my + 4}" fill="none" stroke="#4A2A22" stroke-width="2.2" stroke-linecap="round"/>`);
    g.push(`<path d="M${mx - 9} ${my + 3} Q${mx} ${my + 8} ${mx + 9} ${my + 3} Q${mx} ${my + 5} ${mx - 9} ${my + 3}Z" fill="${k.lip}" fill-opacity="0.7"/>`);
    g.push(`<path d="M${mx - 6} ${my + 11} Q${mx} ${my + 13} ${mx + 6} ${my + 11}" fill="none" stroke="${k.shade}" stroke-width="1.4" stroke-opacity="0.7"/>`);
  }
  if (captain) {
    g.push(`<path d="M${mx - 24} ${my - 6} Q${mx - 12} ${my - 14} ${mx} ${my - 9} Q${mx + 12} ${my - 14} ${mx + 24} ${my - 6} Q${mx + 14} ${my - 3} ${mx} ${my - 5} Q${mx - 14} ${my - 3} ${mx - 24} ${my - 6}Z" fill="#F4F4F1" stroke="#C3C8CF" stroke-width="1"/>`);
  }
  // chatterbox marks
  if (chatter) g.push(`<path d="M160 64 Q174 56 172 40 M172 74 Q190 64 190 44" fill="none" stroke="#2B3A5C" stroke-width="3" stroke-linecap="round"/>`);
  // pips for the captain
  if (captain && pips) {
    const n = smile ? 2 : half ? 1 : 0;
    for (let i = 0; i < 2; i++) g.push(`<circle class="pip${i < n ? ' filled' : ''}${i === n - 1 ? ' newest' : ''}" cx="${18 + i * 20}" cy="18" r="7" fill="${i < n ? '#C8102E' : '#FBF6EA'}" stroke="#2B3A5C" stroke-width="2"/>`);
  }
  s.push(`<g filter="url(#${id}-wob)">${g.join('')}</g>`);
  s.push(`<rect width="200" height="220" fill="#000" filter="url(#${id}-grain)" opacity="0.5" clip-path="url(#${id}-head)"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" aria-hidden="true" focusable="false">${s.join('')}</svg>`;
}
