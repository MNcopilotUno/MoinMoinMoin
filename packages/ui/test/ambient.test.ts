import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { Cell } from '@moin/core';
import { Board, Onlookers, portrait, SkyLife } from '../src/index.js';

describe('Onlookers (the crowd on the quay)', () => {
  it('seven townsfolk, each a labelled button that says Moin when poked', async () => {
    const onpoke = vi.fn();
    render(Onlookers, { onpoke });
    const crowd = screen.getAllByRole('button', { name: /^Onlooker, a .+: say Moin$/ });
    expect(crowd).toHaveLength(7);
    await fireEvent.click(crowd[2] as HTMLElement);
    expect(onpoke).toHaveBeenCalledWith(2);
    expect(screen.getByText('Moin!')).toBeTruthy();
    expect(crowd[2]?.className).toMatch(/waving/);
  });

  it('cheers react to the board: one onlooker per smile, everyone when solved', async () => {
    const { rerender, container } = render(Onlookers, { cheer: 0 });
    await rerender({ cheer: 2 });
    expect(container.querySelectorAll('.cheering').length).toBe(2);
    await rerender({ celebrate: true });
    expect(container.querySelector('.quay')?.className).toMatch(/celebrate/);
    // everyone smiles: Moin red in every face
    for (const face of container.querySelectorAll('.face')) expect(face.innerHTML).toMatch(/#C8102E/i);
  });

  it('onlookers are not in the puzzle: no captain pips', () => {
    expect(portrait({ role: 'captain', pips: false })).not.toMatch(/#FBF6EA" stroke="#2B3A5C" stroke-width="2"/);
  });
});

describe('Board ripples', () => {
  const cells: Cell[] = [{ x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 }];
  it('touching the water ripples it and is never a tap', async () => {
    const ontap = vi.fn();
    render(Board, { width: 3, height: 1, cells, greetings: [0], ontap });
    await fireEvent.pointerDown(screen.getByRole('group', { name: 'Harbour' }), { clientX: 80, clientY: 20 });
    expect(screen.getAllByTestId('ripple')).toHaveLength(1);
    expect(ontap).not.toHaveBeenCalled();
  });

  it('touching a person does not ripple', async () => {
    render(Board, { width: 3, height: 1, cells, greetings: [0], ontap: () => {} });
    await fireEvent.pointerDown(screen.getByRole('button'));
    expect(screen.queryAllByTestId('ripple')).toHaveLength(0);
  });
});

describe('SkyLife', () => {
  it('gulls can be shooed and the boat tooted', async () => {
    const onsquawk = vi.fn();
    const onhorn = vi.fn();
    render(SkyLife, { onsquawk, onhorn });
    const gulls = screen.getAllByRole('button', { name: 'A gull overhead: shoo it' });
    expect(gulls).toHaveLength(3);
    await fireEvent.click(gulls[0] as HTMLElement);
    await fireEvent.click(gulls[0] as HTMLElement); // already fleeing: one squawk
    expect(onsquawk).toHaveBeenCalledTimes(1);
    await fireEvent.click(screen.getByRole('button', { name: 'A boat on the water: toot' }));
    expect(onhorn).toHaveBeenCalledTimes(1);
  });
});
