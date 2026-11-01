import { describe, expect, it } from 'vitest';
import { formatLink, newId, newSecret, parseLink, type TesseraError } from '../src/index.js';

const base = 'https://example.org/MoinMoinMoin/domi/';
function reason(f: () => unknown): string {
  try {
    f();
    return 'parsed';
  } catch (error) {
    return (error as TesseraError).reason;
  }
}

describe('links', () => {
  it('round-trips, and is 33 characters after the base (D11, A5)', () => {
    const id = newId(), secret = newSecret();
    const link = formatLink(base, id, secret);
    expect(link.length - base.length).toBe(33);
    expect(parseLink(link)).toEqual({ hopId: id, secret });
  });
  it('reads the static host redirect form ?m=<id>#<key>', () => {
    const secret = newSecret();
    const key = formatLink(base, 'abcdEFGH', secret).split('#')[1];
    expect(parseLink(`${base}?m=abcdEFGH#${key}`)).toEqual({ hopId: 'abcdEFGH', secret });
  });
  it('adds the missing slash to a base', () => {
    expect(formatLink('https://h/domi', 'abcdEFGH', newSecret())).toMatch(/^https:\/\/h\/domi\/m\/abcdEFGH#/);
  });
  it.each([
    ['not a url', 'not-a-link'],
    [`${base}`, 'not-a-link'],
    [`${base}m/abcdEFGH`, 'no-key'],
    [`${base}m/abcdEFGH#`, 'no-key'],
    [`${base}m/abcdEFGH#AAAAAAAAAAAAAAAAAAAAA`, 'bad-key'],
    [`${base}m/abcdEFGH#AAAAAAAAAAAAAAAAAAAAAAA`, 'bad-key'],
    [`${base}m/abcdEFGH#AAAAAAAAAAAAAAAAAAAA+A`, 'bad-key'],
    [`${base}m/abcdEFGH#AAAAAAAAAAAAAAAAAAAAAB`, 'bad-key'],
    [`${base}m/abc#AAAAAAAAAAAAAAAAAAAAAA`, 'bad-id'],
    [`${base}m/abcd%2FGH#AAAAAAAAAAAAAAAAAAAAAA`, 'bad-id'],
  ])('%s → %s', (href, expected) => {
    expect(reason(() => parseLink(href))).toBe(expected);
  });
  it('refuses to format a bad id', () => {
    expect(reason(() => formatLink(base, 'x', newSecret()))).toBe('bad-id');
  });
});
