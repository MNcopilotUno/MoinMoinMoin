<script lang="ts">
  import { onMount } from 'svelte';
  import { createGame, initialState, isSolved, personAt, stars, tap, TICKS_PER_SECOND } from '@moin/core';
  import type { Game, MoinEvent, State } from '@moin/core';
  import { levels, toBoard } from '@moin/levels';
  import { freshMemory, pickLine, triggerForTap } from '@moin/narration';
  import type { Cue, Line, NarratorMemory } from '@moin/narration';
  import { announceTap, Board, copy, frameAt, IconButton, roleOf, Stars } from '@moin/ui';
  import type { Frame } from '@moin/ui';
  import Icons from './components/Icons.svelte';
  import Narrator from './components/Narrator.svelte';
  import UpdateToast from './components/UpdateToast.svelte';
  import WinCard from './components/WinCard.svelte';
  import { sayMoin, unlockAudio } from './lib/audio';
  import { loadProgress, saveMuted, saveSolved } from './lib/progress';
  import type { LevelProgress } from './lib/progress';
  import { startServiceWorker } from './lib/sw';

  interface Playback {
    readonly events: readonly MoinEvent[];
    readonly before: State;
    readonly start: number;
  }

  let ready = $state(false);
  let levelIndex = $state(0);
  const firstGame = createGame(toBoard(levels[0]!));
  let game = $state.raw<Game>(firstGame);
  let current = $state.raw<State>(initialState(firstGame));
  let history = $state.raw<State[]>([]);
  let playback = $state.raw<Playback | null>(null);
  let tick = $state(0);
  let lastTick = -1;
  let raf = 0;

  let best = $state.raw<Record<string, LevelProgress>>({});
  let muted = $state<boolean | null>(null);
  let memory: NarratorMemory = freshMemory;
  let line = $state.raw<Line | null>(null);
  let lineKey = $state(0);
  let announcement = $state('');
  let applyUpdate = $state.raw<(() => void) | null>(null);

  const level = $derived(levels[levelIndex]!);
  const frame = $derived<Frame | null>(playback ? frameAt(playback.events, tick) : null);
  const greetings = $derived.by(() => {
    if (!playback || !frame) return current.greetings;
    const { before } = playback;
    return game.people.map((p, i) =>
      Math.min(p.needs, (before.greetings[i] ?? 0) + (frame.greeted.get(`${p.x},${p.y}`) ?? 0)),
    );
  });
  const solved = $derived(playback === null && isSolved(game, current));
  const bestStars = $derived(best[level.id] ? stars(best[level.id]!.bestTaps, level.par) : 0);

  function say(cue: Cue) {
    const picked = pickLine(cue, memory);
    memory = picked.memory;
    if (picked.line) {
      line = picked.line;
      lineKey += 1;
    }
  }

  function startLevel(index: number) {
    finishPlayback(false);
    levelIndex = index;
    game = createGame(toBoard(levels[index]!));
    current = initialState(game);
    history = [];
    announcement = '';
    say({ trigger: 'levelStart', levelId: levels[index]!.id });
  }

  /** Stop animating; `narrate` decides whether the finished tap gets its remark. */
  function finishPlayback(narrate: boolean) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    const done = playback;
    playback = null;
    lastTick = -1;
    if (done && narrate) afterTap(done.events);
  }

  function afterTap(events: readonly MoinEvent[]) {
    if (isSolved(game, current)) {
      const taps = current.taps;
      say({ trigger: taps <= level.par ? 'solvedPar' : 'solvedOver' });
      const id = level.id;
      void saveSolved(id, taps).then((levelsBest) => (best = levelsBest));
      return;
    }
    const trigger = triggerForTap(events);
    if (trigger) say({ trigger });
  }

  function step(now: number) {
    if (!playback) return;
    tick = Math.floor(((now - playback.start) * TICKS_PER_SECOND) / 1000);
    const f = frameAt(playback.events, tick, lastTick);
    lastTick = tick;
    if (muted !== true) {
      for (const launch of f.launches) {
        const who = game.people[personAt(game, launch.x, launch.y)];
        const role = who ? roleOf(who) : 'fisherman';
        sayMoin(role === 'captain' ? -5 : role === 'kid' ? 5 : role === 'market' ? 2 : 0);
      }
    }
    if (f.done) finishPlayback(true);
    else raf = requestAnimationFrame(step);
  }

  function onTap(x: number, y: number) {
    unlockAudio();
    // A tap during an animation skips to its end; input is never gated.
    finishPlayback(false);
    const result = tap(game, current, x, y);
    if (result.events.length === 0) return;
    history = [...history, current];
    const before = current;
    current = result.state;
    announcement = announceTap(result.events, isSolved(game, current));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      afterTap(result.events);
      return;
    }
    playback = { events: result.events, before, start: performance.now() };
    tick = 0;
    lastTick = -1;
    raf = requestAnimationFrame(step);
  }

  function undo() {
    finishPlayback(false);
    const previous = history[history.length - 1];
    if (!previous) return;
    history = history.slice(0, -1);
    current = previous;
    announcement = '';
    say({ trigger: 'undo' });
  }

  function restart() {
    finishPlayback(false);
    if (history.length === 0) return;
    current = initialState(game);
    history = [];
    announcement = '';
    say({ trigger: 'restart' });
  }

  function toggleMute() {
    unlockAudio();
    muted = !(muted ?? false);
    void saveMuted(muted);
  }

  function next() {
    startLevel(levelIndex + 1 < levels.length ? levelIndex + 1 : 0);
  }

  onMount(() => {
    startServiceWorker((apply) => (applyUpdate = apply));
    let settled = false;
    const begin = (progress: { levels: Record<string, LevelProgress>; muted: boolean | null }) => {
      if (settled) return;
      settled = true;
      best = progress.levels;
      muted = progress.muted;
      const firstUnsolved = levels.findIndex((l) => !progress.levels[l.id]);
      startLevel(firstUnsolved < 0 ? 0 : firstUnsolved);
      ready = true;
    };
    // Cold open must not wait on storage: play level 1 if IndexedDB is slow.
    const fallback = setTimeout(() => begin({ levels: {}, muted: null }), 600);
    void loadProgress().then((p) => {
      clearTimeout(fallback);
      begin({ levels: { ...p.levels }, muted: p.muted });
    });
    return () => finishPlayback(false);
  });
</script>

{#if applyUpdate}<UpdateToast apply={applyUpdate} />{/if}

<div class="shell" class:ready>
  <header>
    <div class="title">
      <p class="level-no">{copy.level(levelIndex + 1, levels.length)}</p>
      <h1>{level.title}</h1>
    </div>
    <div class="tools">
      <IconButton label={copy.undo} onclick={undo} disabled={history.length === 0}><Icons name="undo" /></IconButton>
      <IconButton label={copy.restart} onclick={restart} disabled={history.length === 0}><Icons name="restart" /></IconButton>
      <IconButton label={copy.mute} onclick={toggleMute} pressed={muted === true}>
        <Icons name={muted === true ? 'muted' : 'sound'} />
      </IconButton>
    </div>
  </header>

  <p class="score" data-testid="score">
    <span>{copy.taps(current.taps)}</span><span class="dot">·</span><span>{copy.par(level.par)}</span>
    {#if bestStars > 0}<span class="best"><Stars count={bestStars} size="1rem" /></span>{/if}
  </p>

  <main>
    {#if ready}
      <Board width={game.width} height={game.height} cells={game.cells} {greetings}
        moin={frame?.moin ?? null} thief={frame?.thief ?? null} bounce={frame?.bounce ?? null} ontap={onTap} />
    {/if}
  </main>

  <Narrator {line} key={lineKey} />
  {#if solved}
    <WinCard stars={stars(current.taps, level.par)} taps={current.taps} par={level.par}
      last={levelIndex === levels.length - 1} onnext={next} onreplay={restart} />
  {/if}
  <p class="visually-hidden" aria-live="polite" data-testid="announcer">{announcement}</p>
</div>

<style>
  .shell {
    max-width: 640px; margin: 0 auto; min-height: 100dvh;
    display: flex; flex-direction: column;
    padding: max(10px, env(safe-area-inset-top)) 0 max(10px, env(safe-area-inset-bottom));
  }
  header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0 16px; }
  .title { min-width: 0; }
  .level-no { margin: 0; font-size: 0.8rem; font-weight: 700; color: var(--slate); text-transform: uppercase; letter-spacing: 0.06em; }
  h1 { margin: 0; font-size: 1.3rem; line-height: 1.15; overflow-wrap: anywhere; }
  .tools { display: flex; gap: 0.4rem; flex-shrink: 0; }
  .score {
    display: flex; align-items: center; gap: 0.4rem; margin: 0.5rem 16px 0; font-weight: 700; color: var(--deep);
    font-variant-numeric: tabular-nums;
  }
  .dot { color: var(--stone); }
  .best { margin-left: auto; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px 16px; }
</style>
