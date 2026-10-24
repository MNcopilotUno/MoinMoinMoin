import { describe, expect, it } from 'vitest';
import { portrait } from '../src/index.js';
import type { Mood, PortraitRole } from '../src/index.js';

const roles: PortraitRole[] = ['fisherman', 'captain', 'market', 'kid'];
const moods: Mood[] = ['grumpy', 'half', 'smiling'];
const MOIN_RED = /#C8102E/gi;

describe('portrait (impressionist art direction)', () => {
  it.each(roles.flatMap((role) => moods.map((mood) => [role, mood] as const)))('%s %s is a well-formed SVG', (role, mood) => {
    const svg = portrait({ role, mood, id: 'x' });
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(svg).toContain('aria-hidden="true"');
  });

  it('red means Moin: only a smile (and a captain\'s received pips) use Moin red', () => {
    for (const role of ['fisherman', 'market', 'kid'] as const) {
      expect(portrait({ role, mood: 'grumpy' }).match(MOIN_RED)).toBeNull();
      expect(portrait({ role, mood: 'half' }).match(MOIN_RED)).toBeNull();
      expect(portrait({ role, mood: 'smiling' }).match(MOIN_RED)?.length).toBeGreaterThan(0);
    }
    expect(portrait({ role: 'captain', mood: 'grumpy' }).match(MOIN_RED)).toBeNull();
    expect(portrait({ role: 'captain', mood: 'half' }).match(MOIN_RED)).toHaveLength(1);
  });

  it('ids are prefixed so many portraits can share one page', () => {
    const a = portrait({ id: 'p0-0' });
    const ids = [...a.matchAll(/id="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(3);
    for (const id of ids) expect(id.startsWith('p0-0')).toBe(true);
    for (const ref of a.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref[1]);
  });

  it('draws each role\'s details', () => {
    expect(portrait({ role: 'captain' })).toContain('#D9B46A'); // brass anchor badge
    expect(portrait({ role: 'fisherman' })).toContain('#3552A6'); // knit beanie
    expect(portrait({ role: 'market' })).toContain('#8FAE8A'); // headscarf
    expect(portrait({ role: 'kid' })).toContain('#9A5A3A'); // freckles
    expect(portrait({ role: 'market', chatter: true }).length).toBeGreaterThan(portrait({ role: 'market' }).length);
  });

  it('eyes look where the person faces', () => {
    const pupil = (facing: 'N' | 'E' | 'S' | 'W') =>
      Number(/<circle cx="([\d.]+)" cy="[\d.]+" r="2.6" fill="#111"\/>/.exec(portrait({ facing }))?.[1]);
    expect(pupil('E')).toBeGreaterThan(pupil('W'));
  });

  it('is deterministic', () => {
    expect(portrait({ role: 'kid', mood: 'half', facing: 'S', tone: 2, id: 'k' })).toBe(portrait({ role: 'kid', mood: 'half', facing: 'S', tone: 2, id: 'k' }));
  });
});
