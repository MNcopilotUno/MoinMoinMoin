/**
 * The open-licensed meme library (A8, `packages/assets/library/`): public-domain and CC0 images,
 * each with its credit. Files are not precached (3.6 MB); the worker keeps each one once seen.
 */
import entries from '@moin/assets/library/library.json';

export interface LibraryImage {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly year: string;
  readonly license: string;
  readonly source: string;
  readonly url: string;
}

// Vite emits each file with a hashed name and gives its URL; nothing is inlined.
const files = import.meta.glob<string>('../../../../packages/assets/library/*.jpg', { eager: true, query: '?url', import: 'default' });
const urlOf = (id: string): string | undefined => Object.entries(files).find(([path]) => path.endsWith(`/${id}.jpg`))?.[1];

export const LIBRARY: readonly LibraryImage[] = (entries as Omit<LibraryImage, 'url'>[])
  .map((e) => ({ ...e, url: urlOf(e.id) ?? '' }))
  .filter((e) => e.url !== '');

const byId = new Map(LIBRARY.map((e) => [e.id, e]));
/** `undefined` for an id this build does not have (an older or newer phone made the meme). */
export const libraryImage = (id: string): LibraryImage | undefined => byId.get(id);
export const credit = (e: LibraryImage): string => `“${e.title}”, ${e.creator}, ${e.year} · ${e.license}`;
