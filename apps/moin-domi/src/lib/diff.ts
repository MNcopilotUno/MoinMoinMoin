import { touchesChanged, words, type Meme } from '@moin/meme';

export interface Piece { readonly text: string; readonly changed: boolean }

/** The words of `after`, marking those that differ from `before` at the same place. */
export function marked(before: Meme | null, after: Meme): Piece[] {
  const a = before ? words(before) : [];
  return words(after).map((w, i) => ({ text: w, changed: before !== null && a[i] !== w }));
}

export function touchNote(before: Meme | null, after: Meme): string {
  if (!before) return '';
  const notes = touchesChanged(before, after).map((t) =>
    t === 'gull' ? (after.gull ? 'a gull joined' : 'the gull left')
      : t === 'mood' ? (after.mood === 'smiling' ? 'a smile' : 'a frown')
        : after.bubble === 'none' ? 'the bubble went quiet' : after.bubble === 'moinmoin' ? 'Moin moin' : 'a Moin bubble');
  return notes.join(', ');
}
