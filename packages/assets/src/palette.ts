/**
 * Palette tokens (CLAUDE.md §7): a Monet morning — lilac, dawn peach, harbour water and sage —
 * with harbour ink for lines and text. **Red means Moin** — the speech bubble and smiles — and
 * is used for nothing else; stars are ochre-gold so they never read as Moin.
 */
export const palette = {
  moin: '#c8102e',
  moinDeep: '#9c0c24',
  royal: '#2346b8',
  royalDeep: '#183282',
  ink: '#1e2b4c',
  inkSoft: '#3e4c70',
  paper: '#fbf6ea',
  fog: '#f6f1e7',
  lilac: '#d4cbe2',
  peach: '#f3dfd0',
  sage: '#a9bfa0',
  gold: '#d9a441',
  mist: '#dfe4ea',
  stone: '#c3cbd3',
  slate: '#7c8894',
  deep: '#4a5664',
  water: '#c9d6e3',
  waterDeep: '#a9bccf',
  sand: '#ecdcb8',
  sandDeep: '#d4bc8c',
  wood: '#a77b4f',
  white: '#ffffff',
  skin: ['#f2cba8', '#d9a47c', '#a8714c'],
} as const;

export type Palette = typeof palette;
