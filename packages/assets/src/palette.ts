/**
 * Palette tokens (CLAUDE.md §7): royal blue and royal red over soft harbour greys and sand.
 * **Red means Moin** — the speech bubble and smiles — and is used for nothing else.
 */
export const palette = {
  moin: '#c8102e',
  moinDeep: '#9c0c24',
  royal: '#2346b8',
  royalDeep: '#183282',
  ink: '#1c2333',
  fog: '#eef1f4',
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
