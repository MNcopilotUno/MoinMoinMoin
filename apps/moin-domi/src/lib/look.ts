import ferry from '@moin/assets/art/ferry-night.jpg';
import harbour from '@moin/assets/art/harbour-night.jpg';
import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
import market from '@moin/assets/art/market-night.jpg';
import mudflats from '@moin/assets/art/mudflats-night.jpg';
import water from '@moin/assets/art/water-night.jpg';
import type { Bubble, Meme, Mood, Weather, Where, Who } from '@moin/meme';
// Deep imports: the barrel pulls in the puzzle's scene and every day painting.
import type { PortraitOptions } from '@moin/ui/portrait';
import { domi } from '@moin/ui/copy/domi';

/** The night paintings (the style board: "always after dark"). */
export const PAINTINGS: Readonly<Record<Where, string>> = { harbour, market, ferry, lighthouse, water, mudflats };
export const PLACE_NAMES: Readonly<Record<Where, string>> = domi.places;
export const WEATHER_NAMES: Readonly<Record<Weather, string>> = domi.weather;

export const CAST: readonly { who: Who; name: string }[] = [
  { who: 'captain', name: domi.cast.captain },
  { who: 'fisherman', name: domi.cast.fisherman },
  { who: 'market', name: domi.cast.market },
  { who: 'kid', name: domi.cast.kid },
  { who: 'chatterbox', name: domi.cast.chatterbox },
  { who: 'harbourmaster', name: domi.cast.harbourmaster },
  { who: 'netmender', name: domi.cast.netmender },
  { who: 'gull', name: domi.cast.gull },
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

const BUBBLE_TEXT: Readonly<Record<Bubble, string>> = domi.bubble;
const MOOD_NAMES: Readonly<Record<Mood, string>> = domi.moods;
export const bubbleText = (b: Bubble): string => BUBBLE_TEXT[b];

export function describe(meme: Meme): string {
  const m = domi.meme;
  const who = (CAST.find((c) => c.who === meme.who)?.name ?? m.someone).toLowerCase();
  const extras = [meme.bubble !== 'none' ? m.bubble(bubbleText(meme.bubble)) : '', meme.gull ? m.gull : '', meme.weather !== 'clear' ? WEATHER_NAMES[meme.weather].toLowerCase() : ''].filter(Boolean);
  const place = meme.where === 'water' ? m.onWater : m.at(PLACE_NAMES[meme.where].toLowerCase());
  return m.label(who, MOOD_NAMES[meme.mood], place, extras, m.caption(meme.top, meme.bottom));
}
