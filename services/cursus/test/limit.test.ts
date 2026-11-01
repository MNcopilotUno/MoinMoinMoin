import { describe, expect, it } from 'vitest';
import { createLimiter } from '../src/limit.ts';

describe('the rate limiter', () => {
  const rates = { create: { capacity: 2, everyMs: 1000 }, write: { capacity: 1, everyMs: 1000 }, read: { capacity: 1, everyMs: 1000 } };

  it('allows a burst, then asks to wait, then refills', () => {
    let t = 0;
    const l = createLimiter({ now: () => t, rates });
    expect([l.take('create', '1.2.3.4'), l.take('create', '1.2.3.4'), l.take('create', '1.2.3.4')]).toEqual([0, 0, 1]);
    t = 1000;
    expect(l.take('create', '1.2.3.4')).toBe(0);
  });

  it('keeps kinds and addresses apart', () => {
    const l = createLimiter({ now: () => 0, rates });
    expect(l.take('write', 'a')).toBe(0);
    expect(l.take('write', 'a')).toBe(1);
    expect(l.take('write', 'b')).toBe(0);
    expect(l.take('read', 'a')).toBe(0);
  });

  it('never holds an address in readable form', () => {
    const l = createLimiter({ now: () => 0, rates });
    l.take('read', '203.0.113.7');
    l.take('read', '2001:db8::1');
    expect(l.keys().join(' ')).not.toMatch(/203\.0\.113|2001:db8/);
  });

  it('two processes (two salts) give one address different keys', () => {
    const a = createLimiter({ now: () => 0, rates }), b = createLimiter({ now: () => 0, rates });
    a.take('read', 'x');
    b.take('read', 'x');
    expect(a.keys()).not.toEqual(b.keys());
  });

  it('forgets the oldest bucket past its memory bound', () => {
    const l = createLimiter({ now: () => 0, rates, maxEntries: 3 });
    for (const a of ['a', 'b', 'c', 'd']) l.take('read', a);
    expect(l.size()).toBe(3);
    expect(l.take('read', 'a')).toBe(0); // forgotten, so full again
  });
});
