import { describe, expect, it } from 'vitest';
import { downloadMedia, newSecret, openBytes, mediaAad, sealBytes, TesseraError, uploadMedia } from '../src/index.js';
import { fakeRelay } from './fake-relay.js';

const picture = () => Uint8Array.from({ length: 50_000 }, (_, i) => (i * 7919) & 255);

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (error) {
    return (error as TesseraError).reason;
  }
}

describe('pictures (A8)', () => {
  it('upload → download gives the same bytes; the stored box is not the picture', async () => {
    const { relay, media } = fakeRelay();
    const bytes = picture();
    const { mediaId, key } = await uploadMedia(relay, 'chainAAA', bytes);
    expect(await downloadMedia(relay, 'chainAAA', mediaId, key)).toEqual(bytes);
    const stored = media.get(mediaId)!.box;
    expect(stored.length).toBe(bytes.length + 1 + 12 + 16);
    expect(Buffer.from(stored).includes(Buffer.from(bytes.subarray(100, 140)))).toBe(false);
  });

  it('a wrong key, another chain, another id, or a changed byte is locked', async () => {
    const { relay, media } = fakeRelay();
    const { mediaId, key } = await uploadMedia(relay, 'chainAAA', picture());
    expect(await reason(downloadMedia(relay, 'chainAAA', mediaId, newSecret()))).toBe('locked');
    expect(await reason(downloadMedia(relay, 'chainBBB', mediaId, key))).toBe('locked');
    const box = media.get(mediaId)!.box;
    expect(await reason(openBytes(key, 'media', box, mediaAad('chainAAA', 'otherIdX')))).toBe('locked');
    const bad = box.slice();
    bad[100] = bad[100]! ^ 1;
    expect(await reason(openBytes(key, 'media', bad, mediaAad('chainAAA', mediaId)))).toBe('locked');
    expect(await reason(openBytes(key, 'media', box.slice(0, 20), mediaAad('chainAAA', mediaId)))).toBe('locked');
  });

  it('a media key cannot open a hop box (domain separation)', async () => {
    const key = newSecret();
    const box = await sealBytes(key, 'hop-content', picture(), 'x');
    expect(await reason(openBytes(key, 'media', box, 'x'))).toBe('locked');
  });
});
