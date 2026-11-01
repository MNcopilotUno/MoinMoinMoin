import { TesseraError } from './errors.js';
import { isId, secretFromText, secretToText, type Secret } from './keys.js';

/** `<base>m/<hopId>#<key>` (D11). `base` ends with `/`, e.g. `https://host/domi/`. */
export function formatLink(base: string, hopId: string, secret: Secret): string {
  if (!isId(hopId)) throw new TesseraError('bad-id');
  return `${base.endsWith('/') ? base : `${base}/`}m/${hopId}#${secretToText(secret)}`;
}

export interface ParsedLink {
  readonly hopId: string;
  readonly secret: Secret;
}

/**
 * Reads `…/m/<id>#<key>` or the static host's redirect form `…?m=<id>#<key>`.
 * Throws `not-a-link`, `bad-id`, `no-key` or `bad-key`.
 */
export function parseLink(href: string): ParsedLink {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    throw new TesseraError('not-a-link');
  }
  const path = /\/m\/([^/]*)\/?$/.exec(url.pathname);
  const id = path ? decodeURIComponent(path[1] ?? '') : url.searchParams.get('m');
  if (id === null) throw new TesseraError('not-a-link');
  if (!isId(id)) throw new TesseraError('bad-id');
  const key = url.hash.replace(/^#/, '');
  if (key === '') throw new TesseraError('no-key');
  return { hopId: id, secret: secretFromText(key) };
}
