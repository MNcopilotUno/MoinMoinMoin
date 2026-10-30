import type { Moin, Random } from '../src/index.js';

/** Deterministic "randomness" for exact tests: bytes counting up from `start`. */
export const counting = (start = 1): Random => {
  let k = start;
  return (n) => Uint8Array.from({ length: n }, () => k++ & 0xff);
};

export const anna: Moin = {
  wave: 'quay', words: 'Saw your boat this morning. Moin!', holders: ['Anna'], held: 1,
  day: '2026-10-30', fade: 'week', passOn: true, reach: true,
};
