import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PersonSprite from '../src/components/PersonSprite.svelte';

// .agents/features/canvas-parity.md — the rules readable on the tile itself.
describe('tile marks', () => {
  it.each([[0, 0], [1, 1], [2, 2]])('a captain with %i greeting(s) shows %i filled pip chip(s)', (greetings, filled) => {
    const { container } = render(PersonSprite, { role: 'captain', facing: 'E', needs: 2, greetings });
    const pips = container.querySelectorAll('.pips .pip');
    expect(pips).toHaveLength(2);
    expect(container.querySelectorAll('.pips .pip.filled')).toHaveLength(filled);
    // The pips moved out of the portrait: its SVG draws none.
    expect(container.querySelector('svg .pip')).toBeNull();
  });

  it('a fisherman has neither pips nor a badge', () => {
    const { container } = render(PersonSprite, { role: 'fisherman', facing: 'E', needs: 1, greetings: 0 });
    expect(container.querySelector('.pips')).toBeNull();
    expect(container.querySelector('.badge')).toBeNull();
  });

  it('a chatterbox wears a ×2 badge, hidden from screen readers (her label says chatterbox)', () => {
    const { container } = render(PersonSprite, { role: 'market', facing: 'S', needs: 1, greetings: 0, chatterbox: true });
    const badge = container.querySelector('.badge');
    expect(badge?.textContent).toBe('×2');
    expect(badge?.getAttribute('aria-hidden')).toBe('true');
  });
});
