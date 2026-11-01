import ferry from '@moin/assets/art/ferry-night.jpg';
import harbour from '@moin/assets/art/harbour-night.jpg';
import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
import market from '@moin/assets/art/market-night.jpg';
import water from '@moin/assets/art/water-night.jpg';
import type { Bubble, Meme, Weather, Where, Who } from '@moin/meme';
// Deep imports: the barrel pulls in the puzzle's scene and every day painting.
import type { PortraitOptions } from '@moin/ui/portrait';

/** The night paintings (the style board: "always after dark"). */
export const PAINTINGS: Readonly<Record<Where, string>> = { harbour, market, ferry, lighthouse, water };
export const PLACE_NAMES: Readonly<Record<Where, string>> = { harbour: 'Harbour', market: 'Market', ferry: 'Ferry', lighthouse: 'Light', water: 'Water' };
export const WEATHER_NAMES: Readonly<Record<Weather, string>> = { clear: 'Clear sky', rain: 'Rain', fog: 'Fog', beam: 'The beam' };

export const CAST: readonly { who: Who; name: string }[] = [
  { who: 'captain', name: 'The grumpy captain' },
  { who: 'fisherman', name: 'A fisherman' },
  { who: 'market', name: 'The market woman' },
  { who: 'kid', name: 'A kid in a raincoat' },
  { who: 'chatterbox', name: 'The chatterbox' },
  { who: 'harbourmaster', name: 'The harbour master' },
  { who: 'netmender', name: 'The net mender' },
  { who: 'gull', name: 'The gull' },
];

/** A portrait for everyone but the gull, who is drawn as itself (`SeagullSprite`). */
export function portraitOf(who: Exclude<Who, 'gull'>, mood: Meme['mood']): PortraitOptions {
  const base = { mood, facing: 'S', pips: false } as const;
  switch (who) {
    case 'captain': return { ...base, role: 'captain', tone: 0 };
    case 'fisherman': return { ...base, role: 'fisherman', tone: 1 };
    case 'market': return { ...base, role: 'market', tone: 0 };
    case 'kid': return { ...base, role: 'kid', tone: 2 };
    case 'chatterbox': return { ...base, role: 'fisherman', tone: 2, chatter: true };
    case 'harbourmaster': return { ...base, role: 'captain', tone: 2 };
    case 'netmender': return { ...base, role: 'market', tone: 1 };
  }
}

export const bubbleText = (b: Bubble): string => (b === 'moin' ? 'Moin' : b === 'moinmoin' ? 'Moin moin' : '');

export function describe(meme: Meme): string {
  const who = (CAST.find((c) => c.who === meme.who)?.name ?? 'Someone').toLowerCase();
  const extras = [meme.bubble !== 'none' ? `a “${bubbleText(meme.bubble)}” bubble` : '', meme.gull ? 'a gull' : '', meme.weather !== 'clear' ? WEATHER_NAMES[meme.weather].toLowerCase() : ''].filter(Boolean);
  const caption = [meme.top, meme.bottom].filter(Boolean).join(' / ') || 'no words';
  const place = meme.where === 'water' ? 'on the open water' : `at the ${PLACE_NAMES[meme.where].toLowerCase()}`;
  return `Meme: ${who}, ${meme.mood}, ${place}${extras.length ? `, with ${extras.join(' and ')}` : ''}. “${caption}”`;
}
