/**
 * The meme template library (packages/assets/library): open-licensed backgrounds only, each one
 * credited, each one a small square JPEG. See library/README.md and .agents/features/meme-library.md.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface Entry {
  id: string;
  title: string;
  creator: string;
  year?: string;
  license: string;
  source: string;
  tags: string[];
}

const DIR = fileURLToPath(new URL('../library/', import.meta.url));
const LICENSES = ['Public domain', 'CC0 1.0'];
const KEYS = ['id', 'title', 'creator', 'year', 'license', 'source', 'tags'];
const SIZE = 1080;
const MAX_BYTES = 200 * 1024;

const entries = JSON.parse(readFileSync(join(DIR, 'library.json'), 'utf8')) as Entry[];
const files = readdirSync(DIR).filter((name) => name.endsWith('.jpg'));

/** Width and height from a JPEG's first start-of-frame marker; null if the bytes are not a JPEG. */
export function jpegSize(bytes: Uint8Array): { width: number; height: number; progressive: boolean } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let at = 2;
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1] ?? 0;
    if (marker === 0xff) { at += 1; continue; }
    if (marker === 0xd9 || marker === 0xda) return null;
    const length = ((bytes[at + 2] ?? 0) << 8) | (bytes[at + 3] ?? 0);
    // SOF0–SOF15 except DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = ((bytes[at + 5] ?? 0) << 8) | (bytes[at + 6] ?? 0);
      const width = ((bytes[at + 7] ?? 0) << 8) | (bytes[at + 8] ?? 0);
      return { width, height, progressive: marker === 0xc2 };
    }
    at += 2 + length;
  }
  return null;
}

/** True if any APP1 (EXIF/XMP) or APP13 (IPTC) segment comes before the image data. */
function hasMetadata(bytes: Uint8Array): boolean {
  let at = 2;
  while (at + 4 <= bytes.length && bytes[at] === 0xff) {
    const marker = bytes[at + 1] ?? 0;
    if (marker === 0xda) return false;
    if (marker === 0xe1 || marker === 0xed) return true;
    at += 2 + (((bytes[at + 2] ?? 0) << 8) | (bytes[at + 3] ?? 0));
  }
  return false;
}

describe('the meme library', () => {
  it('has a couple of dozen backgrounds', () => {
    expect(entries.length).toBeGreaterThanOrEqual(20);
  });

  it('pairs every entry with a file and every file with an entry', () => {
    expect(files.map((f) => f.replace(/\.jpg$/, '')).sort()).toEqual(entries.map((e) => e.id).sort());
  });

  it('keeps ids unique and kebab-case', () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(entries.map((e) => [e.id, e] as const))('%s is credited and open-licensed', (_, e) => {
    for (const key of Object.keys(e)) expect(KEYS).toContain(key);
    expect(LICENSES).toContain(e.license);
    expect(e.title.trim()).not.toBe('');
    expect(e.creator.trim()).not.toBe('');
    if (e.year !== undefined) expect(typeof e.year).toBe('string');
    expect(new URL(e.source).protocol).toBe('https:');
    expect(Array.isArray(e.tags) && e.tags.length > 0).toBe(true);
    for (const tag of e.tags) expect(tag).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(files)('%s is a clean 1080 × 1080 JPEG under 200 KB', (name) => {
    const path = join(DIR, name);
    expect(statSync(path).size).toBeLessThanOrEqual(MAX_BYTES);
    const bytes = new Uint8Array(readFileSync(path));
    expect(jpegSize(bytes)).toEqual({ width: SIZE, height: SIZE, progressive: true });
    expect(hasMetadata(bytes)).toBe(false);
  });
});

describe('the JPEG header reader', () => {
  it('rejects bytes that are not a JPEG', () => {
    expect(jpegSize(new TextEncoder().encode('\x89PNG\r\n'))).toBeNull();
    expect(jpegSize(Uint8Array.of(0xff, 0xd8, 0xff))).toBeNull();
  });
  it('reads a baseline frame header', () => {
    // SOI, SOF0 (length 17, precision 8, height 2, width 3).
    const bytes = Uint8Array.of(0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x02, 0x00, 0x03, 0x03);
    expect(jpegSize(bytes)).toEqual({ width: 3, height: 2, progressive: false });
  });
});
