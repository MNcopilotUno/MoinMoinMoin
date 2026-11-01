import { httpRelay, type Relay } from '@moin/tessera';

/** The relay chosen at build time (`VITE_CURSUS_URL`); `null` until Cursus has a home. */
const relayUrl: string | undefined = import.meta.env.VITE_CURSUS_URL || undefined;
export const relay: Relay | null = relayUrl ? httpRelay(relayUrl) : null;

/** Where the app lives, e.g. `https://host/MoinMoinMoin/domi/`; links are `<appBase>m/<id>#<key>`. */
export const appBase = new URL(import.meta.env.BASE_URL, location.origin).href;

export const today = (): number => Math.floor(Date.now() / 86_400_000);

export function dayLabel(day: number): string {
  return new Date(day * 86_400_000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}
