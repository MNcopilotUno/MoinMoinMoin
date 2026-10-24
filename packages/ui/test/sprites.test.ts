import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import FenderSprite from '../src/components/FenderSprite.svelte';
import SeagullSprite from '../src/components/SeagullSprite.svelte';

const MOIN_RED = /#c8102e/i;

describe('board pieces (north-german-art)', () => {
  it('the herring gull is not red unless it holds a stolen Moin', () => {
    const { container } = render(SeagullSprite, {});
    expect(container.innerHTML).not.toMatch(MOIN_RED);
    expect(container.querySelector('.post')).not.toBeNull(); // stands on a mooring post
    const thief = render(SeagullSprite, { holding: true }).container.innerHTML;
    expect(thief).toMatch(MOIN_RED);
  });

  it('the rope fender leans the way of its slant', () => {
    const rising = render(FenderSprite, { slant: 'rising' }).container.innerHTML;
    const falling = render(FenderSprite, { slant: 'falling' }).container.innerHTML;
    expect(rising).toContain('rotate(45 50 50)'); // drawn /
    expect(falling).toContain('rotate(-45 50 50)'); // drawn \
    expect(rising).not.toMatch(MOIN_RED);
  });
});
