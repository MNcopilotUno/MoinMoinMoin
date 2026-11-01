import { tidy, WORD_MAX, type Meme } from './meme.js';

/** Words of both captions, top first: the positions a turn may swap. */
export function words(meme: Meme): string[] {
  return [...split(meme.top), ...split(meme.bottom)];
}

function split(text: string): string[] {
  return text === '' ? [] : text.split(' ');
}

/** Replaces word `index` (over top then bottom). The word is tidied; a phrase becomes one word. */
export function swapWord(meme: Meme, index: number, word: string): Meme {
  const top = split(meme.top), bottom = split(meme.bottom);
  const w = tidy(word).replace(/ /g, '');
  if (w === '' || [...w].length > WORD_MAX) return meme;
  if (index < top.length) top[index] = w;
  else if (index - top.length < bottom.length) bottom[index - top.length] = w;
  return { ...meme, top: top.join(' '), bottom: bottom.join(' ') };
}

export type Touch = 'bubble' | 'gull' | 'mood';

export function touchesChanged(before: Meme, after: Meme): Touch[] {
  const out: Touch[] = [];
  if (before.bubble !== after.bubble) out.push('bubble');
  if (before.gull !== after.gull) out.push('gull');
  if (before.mood !== after.mood) out.push('mood');
  return out;
}

export function wordsChanged(before: Meme, after: Meme): number | null {
  const a = split(before.top), b = split(after.top), c = split(before.bottom), d = split(after.bottom);
  if (a.length !== b.length || c.length !== d.length) return null;
  return [...a.map((w, i) => w !== b[i]), ...c.map((w, i) => w !== d[i])].filter(Boolean).length;
}

export type TurnProblem = 'template' | 'shape' | 'words' | 'touch';

/**
 * D3–D5: a turn may swap up to `budget` words in place, change one touch, or nothing at all.
 * The cast member and the place stay. The nickname is the new hop's own and is not compared.
 * Client-enforced only (§3): a modified client can break it.
 */
export function checkTurn(before: Meme, after: Meme, budget: number): TurnProblem | null {
  if (before.who !== after.who || before.where !== after.where) return 'template';
  const changed = wordsChanged(before, after);
  if (changed === null) return 'shape';
  if (changed > budget) return 'words';
  if (touchesChanged(before, after).length > 1) return 'touch';
  return null;
}
