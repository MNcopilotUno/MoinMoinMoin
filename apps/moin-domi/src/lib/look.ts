import ferry from '@moin/assets/art/ferry-night.jpg';
import harbour from '@moin/assets/art/harbour-night.jpg';
import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
import market from '@moin/assets/art/market-night.jpg';
import type { Bubble, Meme, Where, Who } from '@moin/meme';
import type { PortraitOptions } from '@moin/ui';

/** The night paintings (the style board: "always after dark"). */
export const PAINTINGS: Readonly<Record<Where, string>> = { harbour, market, ferry, lighthouse };
export const PLACE_NAMES: Readonly<Record<Where, string>> = { harbour: 'Harbour', market: 'Market', ferry: 'Ferry', lighthouse: 'Light' };

export const CAST: readonly { who: Who; name: string }[] = [
  { who: 'captain', name: 'The grumpy captain' },
  { who: 'fisherman', name: 'A fisherman' },
  { who: 'market', name: 'The market woman' },
  { who: 'kid', name: 'A kid in a raincoat' },
  { who: 'chatterbox', name: 'The chatterbox' },
];

export function portraitOf(who: Who, mood: Meme['mood']): PortraitOptions {
  const base = { mood, facing: 'S', pips: false } as const;
  switch (who) {
    case 'captain': return { ...base, role: 'captain', tone: 0 };
    case 'fisherman': return { ...base, role: 'fisherman', tone: 1 };
    case 'market': return { ...base, role: 'market', tone: 0 };
    case 'kid': return { ...base, role: 'kid', tone: 2 };
    case 'chatterbox': return { ...base, role: 'fisherman', tone: 2, chatter: true };
  }
}

export const bubbleText = (b: Bubble): string => (b === 'moin' ? 'Moin' : b === 'moinmoin' ? 'Moin moin' : '');

export function describe(meme: Meme): string {
  const who = (CAST.find((c) => c.who === meme.who)?.name ?? 'Someone').toLowerCase();
  const extras = [meme.bubble !== 'none' ? `a “${bubbleText(meme.bubble)}” bubble` : '', meme.gull ? 'a gull' : ''].filter(Boolean);
  const caption = [meme.top, meme.bottom].filter(Boolean).join(' / ') || 'no words';
  return `Meme: ${who}, ${meme.mood}, at the ${PLACE_NAMES[meme.where].toLowerCase()}${extras.length ? `, with ${extras.join(' and ')}` : ''}. “${caption}”`;
}
