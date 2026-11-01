/**
 * A Moin Domi meme (docs/MOIN_DOMI.md D1–D6): our own cast on a night painting, two free-text
 * captions and a few touches. Pure data — rendering lives in the app. This is what Tessera seals.
 */
export const WHO = ['captain', 'fisherman', 'market', 'kid', 'chatterbox'] as const;
export const WHERE = ['harbour', 'market', 'ferry', 'lighthouse'] as const;
export const BUBBLES = ['none', 'moin', 'moinmoin'] as const;
export const MOODS = ['grumpy', 'smiling'] as const;

export type Who = (typeof WHO)[number];
export type Where = (typeof WHERE)[number];
export type Bubble = (typeof BUBBLES)[number];
export type Mood = (typeof MOODS)[number];

/** D2. */
export const CAPTION_MAX = 140;
export const NICK_MAX = 24;
export const WORD_MAX = 24;

export interface Meme {
  readonly v: 1;
  readonly who: Who;
  readonly where: Where;
  readonly top: string;
  readonly bottom: string;
  /** Touches (D4). The bubble is always Moin red: a touch changes its words, never its colour. */
  readonly bubble: Bubble;
  readonly gull: boolean;
  readonly mood: Mood;
  /** D6: optional, per hop. Empty means anonymous. */
  readonly nick: string;
  /** D3: words each person may swap, 1–3. A chain rule the relay never sees, so it travels sealed. */
  readonly budget: number;
}

export const FIRST_MEME: Meme = {
  v: 1, who: 'captain', where: 'harbour', top: 'When the captain', bottom: 'finally says Moin',
  bubble: 'moin', gull: false, mood: 'smiling', nick: '', budget: 1,
};

export class MemeError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = 'MemeError';
  }
}

/** One space between words, no control characters, trimmed. */
export function tidy(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim();
}

const KEYS = ['v', 'who', 'where', 'top', 'bottom', 'bubble', 'gull', 'mood', 'nick', 'budget'] as const;

function oneOf<T extends string>(list: readonly T[], value: unknown, name: string): T {
  if (typeof value !== 'string' || !(list as readonly string[]).includes(value)) throw new MemeError(`${name} is not one of ${list.join(', ')}`);
  return value as T;
}

function textField(value: unknown, name: string, max: number): string {
  if (typeof value !== 'string') throw new MemeError(`${name} is not text`);
  if (tidy(value) !== value) throw new MemeError(`${name} is not tidy`);
  if ([...value].length > max) throw new MemeError(`${name} is longer than ${max}`);
  return value;
}

/** Checks a value that came from outside (a decrypted hop, storage). Throws `MemeError`. */
export function toMeme(value: unknown): Meme {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new MemeError('not an object');
  const o = value as Record<string, unknown>;
  for (const key of Object.keys(o)) if (!(KEYS as readonly string[]).includes(key)) throw new MemeError(`unknown field ${key}`);
  if (o.v !== 1) throw new MemeError('unknown version');
  if (typeof o.gull !== 'boolean') throw new MemeError('gull is not true or false');
  if (!Number.isInteger(o.budget) || (o.budget as number) < 1 || (o.budget as number) > 3) throw new MemeError('budget is not 1, 2 or 3');
  return {
    v: 1,
    who: oneOf(WHO, o.who, 'who'),
    where: oneOf(WHERE, o.where, 'where'),
    top: textField(o.top, 'top', CAPTION_MAX),
    bottom: textField(o.bottom, 'bottom', CAPTION_MAX),
    bubble: oneOf(BUBBLES, o.bubble, 'bubble'),
    gull: o.gull,
    mood: oneOf(MOODS, o.mood, 'mood'),
    nick: textField(o.nick, 'nick', NICK_MAX),
    budget: o.budget as number,
  };
}

export function encodeMeme(meme: Meme): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify(toMeme(meme)));
}

export function decodeMeme(bytes: Uint8Array): Meme {
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new MemeError('not JSON');
  }
  return toMeme(value);
}

export function memeTitle(meme: Meme): string {
  return [meme.top, meme.bottom].filter(Boolean).join(' ') || 'A Moin';
}
