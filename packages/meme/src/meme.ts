/**
 * A Moin Domi meme (docs/MOIN_DOMI.md D1–D6): our own cast on a night painting, two free-text
 * captions and a few touches. Pure data — rendering lives in the app. This is what Tessera seals.
 */
/** `none`: nobody in front — the picture or the library image is the star (A8). */
export const WHO = ['captain', 'fisherman', 'market', 'kid', 'chatterbox', 'gull', 'harbourmaster', 'netmender', 'none'] as const;
/** Pictures people may upload (A8); GIFs stay animated, the rest is re-encoded as JPEG on the phone. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

/** An uploaded picture: where its sealed box is on the relay, and the key that opens it (A8). */
export interface ImageRef {
  readonly id: string;
  readonly key: string;
  readonly type: ImageType;
  readonly w: number;
  readonly h: number;
}
export const WHERE = ['harbour', 'market', 'ferry', 'lighthouse', 'water', 'mudflats'] as const;
/** A touch over the painting (D4 "and similar"): clear sky, rain, fog, or the lighthouse beam. */
export const WEATHER = ['clear', 'rain', 'fog', 'beam'] as const;
export const BUBBLES = ['none', 'moin', 'moinmoin'] as const;
export const MOODS = ['grumpy', 'smiling'] as const;

export type Who = (typeof WHO)[number];
export type Where = (typeof WHERE)[number];
export type Bubble = (typeof BUBBLES)[number];
export type Mood = (typeof MOODS)[number];
export type Weather = (typeof WEATHER)[number];

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
  /** Optional in stored memes (added 2026-11-01): absent means clear. */
  readonly weather: Weather;
  /** D6: optional, per hop. Empty means anonymous. */
  readonly nick: string;
  /** D3: words each person may swap, 1–3. A chain rule the relay never sees, so it travels sealed. */
  readonly budget: number;
  /** A8: an uploaded picture instead of the painting — private chains and postcards only. */
  readonly image?: ImageRef;
  /** A8: an image from the open-licensed library (its id) instead of the painting. */
  readonly template?: string;
}

export const FIRST_MEME: Meme = {
  v: 1, who: 'captain', where: 'harbour', top: 'When the captain', bottom: 'finally says Moin',
  bubble: 'moin', gull: false, mood: 'smiling', weather: 'clear', nick: '', budget: 1,
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

const KEYS = ['v', 'who', 'where', 'top', 'bottom', 'bubble', 'gull', 'mood', 'weather', 'nick', 'budget', 'image', 'template'] as const;
const IMAGE_KEYS = ['id', 'key', 'type', 'w', 'h'];
const ID = /^[A-Za-z0-9_-]{8}$/;
const KEY = /^[A-Za-z0-9_-]{22}$/;
const TEMPLATE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function imageRef(value: unknown): ImageRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new MemeError('image is not an object');
  const o = value as Record<string, unknown>;
  for (const key of Object.keys(o)) if (!IMAGE_KEYS.includes(key)) throw new MemeError(`unknown image field ${key}`);
  if (typeof o.id !== 'string' || !ID.test(o.id)) throw new MemeError('image id is not an id');
  if (typeof o.key !== 'string' || !KEY.test(o.key)) throw new MemeError('image key is not a key');
  const size = (v: unknown) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 4096;
  if (!size(o.w) || !size(o.h)) throw new MemeError('image size is not 1–4096');
  return { id: o.id, key: o.key, type: oneOf(IMAGE_TYPES, o.type, 'image type'), w: o.w as number, h: o.h as number };
}

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
  if (o.image !== undefined && o.template !== undefined) throw new MemeError('a picture or a library image, not both');
  return {
    v: 1,
    who: oneOf(WHO, o.who, 'who'),
    where: oneOf(WHERE, o.where, 'where'),
    top: textField(o.top, 'top', CAPTION_MAX),
    bottom: textField(o.bottom, 'bottom', CAPTION_MAX),
    bubble: oneOf(BUBBLES, o.bubble, 'bubble'),
    gull: o.gull,
    mood: oneOf(MOODS, o.mood, 'mood'),
    weather: o.weather === undefined ? 'clear' : oneOf(WEATHER, o.weather, 'weather'),
    nick: textField(o.nick, 'nick', NICK_MAX),
    budget: o.budget as number,
    ...(o.image !== undefined ? { image: imageRef(o.image) } : {}),
    ...(o.template !== undefined ? { template: templateId(o.template) } : {}),
  };
}

function templateId(value: unknown): string {
  if (typeof value !== 'string' || value.length > 40 || !TEMPLATE.test(value)) throw new MemeError('template is not a library id');
  return value;
}

/** A8: an uploaded picture never goes to the public feed. */
export function isPublishable(meme: Meme): boolean {
  return meme.image === undefined;
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
