import { createHmac, randomBytes } from 'node:crypto';

/**
 * Rate limits for a public relay (cursus.md, Risks). Token buckets in memory only, keyed by an
 * HMAC of the address with a salt that lives as long as the process: the relay never holds a
 * readable address, never writes one anywhere, and forgets every bucket on restart.
 */
export type Kind = 'create' | 'write' | 'read';
export interface Rate { readonly capacity: number; readonly everyMs: number }

export const RATES: Readonly<Record<Kind, Rate>> = {
  create: { capacity: 10, everyMs: 6 * 60_000 }, // 10 chains at once, then one every 6 minutes
  write: { capacity: 60, everyMs: 10_000 }, // turns: 60 at once, then one every 10 s
  read: { capacity: 120, everyMs: 500 },
};

interface Bucket { tokens: number; at: number }

export function createLimiter({ now = () => Date.now(), rates = RATES, salt = randomBytes(32), maxEntries = 10_000 }: {
  now?: () => number; rates?: Readonly<Record<Kind, Rate>>; salt?: Buffer; maxEntries?: number;
} = {}) {
  const buckets = new Map<string, Bucket>();
  const keyOf = (kind: Kind, address: string) => `${kind}:${createHmac('sha256', salt).update(address).digest('base64url').slice(0, 22)}`;
  return {
    /** 0 when allowed; otherwise the seconds to wait. */
    take(kind: Kind, address: string): number {
      const rate = rates[kind];
      const key = keyOf(kind, address);
      const t = now();
      const old = buckets.get(key);
      const tokens = old ? Math.min(rate.capacity, old.tokens + (t - old.at) / rate.everyMs) : rate.capacity;
      buckets.delete(key);
      if (tokens >= 1) {
        buckets.set(key, { tokens: tokens - 1, at: t });
        if (buckets.size > maxEntries) buckets.delete(buckets.keys().next().value!);
        return 0;
      }
      buckets.set(key, { tokens, at: t });
      return Math.max(1, Math.ceil(((1 - tokens) * rate.everyMs) / 1000));
    },
    /** Test and audit hook: what is held in memory. */
    keys: () => [...buckets.keys()],
    size: () => buckets.size,
  };
}

export type Limiter = ReturnType<typeof createLimiter>;
