import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Cell } from '@moin/core';
import { Board } from '../src/index.js';

const cells: Cell[] = [
  { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 },
  { x: 1, y: 0, kind: 'seagull' },
  { x: 2, y: 0, kind: 'person', facing: 'W', needs: 2 },
  { x: 0, y: 1, kind: 'fender', slant: 'falling' },
];

describe('Board', () => {
  it('every person is a focusable, labelled button; nothing else is a button', () => {
    render(Board, { width: 3, height: 2, cells, greetings: [0, 1], ontap: () => {} });
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Grumpy fisherman, facing east, needs one greeting',
      'Grumpy captain, facing west, half-greeted, needs one more',
    ]);
    expect(screen.getByRole('img', { name: 'Seagull' })).toBeTruthy();
    expect(screen.getByRole('img', { name: /^Fender/ })).toBeTruthy();
  });

  it('a tap reports the square', async () => {
    const ontap = vi.fn();
    render(Board, { width: 3, height: 2, cells, greetings: [0, 0], ontap });
    await fireEvent.click(screen.getAllByRole('button')[1] as HTMLElement);
    expect(ontap).toHaveBeenCalledWith(2, 0);
  });

  it('draws the Moin in flight at its sub-unit position', () => {
    render(Board, { width: 3, height: 2, cells, greetings: [1, 0], moin: { px: 18, py: 6 }, ontap: () => {} });
    const moin = screen.getByTestId('moin');
    expect(moin.style.left).toBe('50%');
    expect(moin.style.top).toBe('25%');
  });

  it('a seagull holding a stolen Moin says so', () => {
    render(Board, { width: 3, height: 2, cells, greetings: [1, 0], thief: { x: 1, y: 0 }, ontap: () => {} });
    expect(screen.getByRole('img', { name: 'Seagull, holding a stolen Moin' })).toBeTruthy();
  });
});
