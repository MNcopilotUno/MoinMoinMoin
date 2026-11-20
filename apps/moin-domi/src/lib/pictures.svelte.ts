/**
 * Pictures on screen (A8). A meme names its picture by id; this keeps an object URL per id, made
 * from bytes kept on this phone (IndexedDB) or opened from the relay with the key the meme carries.
 * The relay never gets a plain picture, and nothing here is sent anywhere but Cursus.
 */
import type { ImageRef, Meme } from '@moin/meme';
import { downloadMedia, secretFromText, type Relay } from '@moin/tessera';
import { getPicture, pictureIds, putPicture, removePicture } from './db.js';

const urls = $state<Record<string, string>>({});
const loading = new Map<string, Promise<boolean>>();

/** The picture's object URL, once it is here (reactive). */
export const pictureUrl = (id: string): string | undefined => urls[id];

function show(id: string, bytes: ArrayBuffer, type: string): void {
  if (!urls[id]) urls[id] = URL.createObjectURL(new Blob([bytes], { type }));
}

/** A picture this phone made or opened: kept, and shown. */
export async function remember(id: string, bytes: Uint8Array<ArrayBuffer>, type: string): Promise<void> {
  const copy = bytes.slice().buffer;
  show(id, copy, type);
  await putPicture({ id, type, bytes: copy });
}

export async function bytesOf(id: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const p = await getPicture(id);
  return p ? new Uint8Array(p.bytes) : null;
}

/**
 * Makes sure a meme's picture can be shown: from this phone, else from the relay. `false` when it
 * cannot be had (offline, gone, or a key that does not open it) — the meme then shows its ground.
 */
export function ensurePicture(relay: Relay | null, chainId: string, image: ImageRef): Promise<boolean> {
  if (urls[image.id]) return Promise.resolve(true);
  const key = `${chainId}/${image.id}`;
  let p = loading.get(key);
  if (!p) {
    p = (async () => {
      const kept = await getPicture(image.id);
      if (kept) {
        show(image.id, kept.bytes, kept.type);
        return true;
      }
      if (!relay) return false;
      try {
        await remember(image.id, await downloadMedia(relay, chainId, image.id, secretFromText(image.key)), image.type);
        return true;
      } catch {
        return false;
      }
    })().finally(() => loading.delete(key));
    loading.set(key, p);
  }
  return p;
}

/** Drops kept pictures no meme on this phone names any more. */
export async function prune(memes: Iterable<Meme | null | undefined>): Promise<void> {
  const wanted = new Set<string>();
  for (const m of memes) if (m?.image) wanted.add(m.image.id);
  for (const id of await pictureIds()) {
    if (wanted.has(id)) continue;
    await removePicture(id);
    const url = urls[id];
    if (url) {
      URL.revokeObjectURL(url);
      delete urls[id];
    }
  }
}

/** Settings → "Forget everything on this phone". */
export function forgetPictures(): void {
  for (const [id, url] of Object.entries(urls)) {
    URL.revokeObjectURL(url);
    delete urls[id];
  }
}
