import { touchesChanged, words, type Meme } from '@moin/meme';
import { domi } from '@moin/ui/copy/domi';

export interface Piece { readonly text: string; readonly changed: boolean }

/** The words of `after`, marking those that differ from `before` at the same place. */
export function marked(before: Meme | null, after: Meme): Piece[] {
  const a = before ? words(before) : [];
  return words(after).map((w, i) => ({ text: w, changed: before !== null && a[i] !== w }));
}

export function touchNote(before: Meme | null, after: Meme): string {
  if (!before) return '';
  const c = domi.changes;
  const notes = touchesChanged(before, after).map((t) =>
    t === 'weather' ? (after.weather === 'clear' ? c.clear : after.weather === 'rain' ? c.rain : after.weather === 'fog' ? c.fog : c.beam)
      : t === 'gull' ? (after.gull ? c.gullJoined : c.gullLeft)
      : t === 'mood' ? (after.mood === 'smiling' ? c.smile : c.frown)
        : after.bubble === 'none' ? c.bubbleQuiet : after.bubble === 'moinmoin' ? c.moinmoin : c.moin);
  return c.list(notes);
}
