import { httpRelay, type Relay } from '@moin/tessera';

/** The relay chosen at build time (`VITE_CURSUS_URL`); `null` until Cursus has a home. */
const relayUrl: string | undefined = import.meta.env.VITE_CURSUS_URL || undefined;
export const relay: Relay | null = relayUrl ? httpRelay(relayUrl) : null;

/** Where the app lives, e.g. `https://host/MoinMoinMoin/domi/`; links are `<appBase>m/<id>#<key>`. */
export const appBase = new URL(import.meta.env.BASE_URL, location.origin).href;

/**
 * The operator's address (DSA Arts. 11, 12, 16 — `.agents/features/dsa.md`), from the repository
 * variable `DOMI_CONTACT` at build time. `null` hides *Report* and says so in About.
 */
const contactRaw: string = import.meta.env.VITE_DOMI_CONTACT ?? '';
export const contact: string | null = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(contactRaw) ? contactRaw : null;

export const today = (): number => Math.floor(Date.now() / 86_400_000);

export function dayLabel(day: number): string {
  return new Date(day * 86_400_000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}
