/**
 * A picture from this phone, made ready to travel (A8, `.agents/features/domi-uploads.md`): a
 * photo is shrunk to 1080 px on its long side and re-encoded as JPEG, which also drops its EXIF
 * (place, camera, time); a GIF is kept as it is, so it still moves, if it is at most 2 MB.
 */
import type { ImageType } from '@moin/meme';

export const LONG_SIDE = 1080;
export const GIF_MAX = 2 * 1024 * 1024;

export interface Picked {
  readonly bytes: Uint8Array<ArrayBuffer>;
  readonly type: ImageType;
  readonly w: number;
  readonly h: number;
}

export class PictureError extends Error {
  constructor(readonly reason: 'too-big' | 'not-a-picture') {
    super(reason);
  }
}

/** Width and height from the GIF header (bytes 6–9, little-endian), or null if it is not a GIF. */
export function gifSize(bytes: Uint8Array): { w: number; h: number } | null {
  const sig = String.fromCharCode(...bytes.subarray(0, 6));
  if (sig !== 'GIF87a' && sig !== 'GIF89a') return null;
  const w = bytes[6]! | (bytes[7]! << 8), h = bytes[8]! | (bytes[9]! << 8);
  return w > 0 && h > 0 ? { w, h } : null;
}

/** The size a photo is drawn at: the long side at most `LONG_SIDE`, never enlarged. */
export function fitted(w: number, h: number): { w: number; h: number } {
  const scale = Math.min(1, LONG_SIDE / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

export async function pickPicture(file: File): Promise<Picked> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const gif = gifSize(bytes);
  if (gif) {
    if (bytes.length > GIF_MAX) throw new PictureError('too-big');
    if (gif.w > 4096 || gif.h > 4096) throw new PictureError('not-a-picture');
    return { bytes, type: 'image/gif', ...gif };
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(new Blob([bytes], { type: file.type || 'application/octet-stream' }), { imageOrientation: 'from-image' });
  } catch {
    throw new PictureError('not-a-picture');
  }
  const { w, h } = fitted(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PictureError('not-a-picture');
  ctx.fillStyle = '#000'; // a transparent PNG becomes a picture on black, the app's own ground
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new PictureError('not-a-picture');
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: 'image/jpeg', w, h };
}
