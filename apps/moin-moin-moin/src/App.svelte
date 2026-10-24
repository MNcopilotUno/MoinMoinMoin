<script lang="ts">
  import { onMount } from 'svelte';
  import { createGame, initialState, isSolved, stars, tap, TICKS_PER_SECOND } from '@moin/core';
  import type { Game, MoinEvent, State } from '@moin/core';
  import { dailyLevel, dayId, levels, sets, setOf, toBoard } from '@moin/levels';
  import type { Level } from '@moin/levels';
  import { freshMemory, pickLine, triggerForTap } from '@moin/narration';
  import type { Cue, Line, NarratorMemory } from '@moin/narration';
  import { announceTap, Board, copy, frameAt, IconButton, noteFor, Scene, shareText, Stars } from '@moin/ui';
  import type { Frame } from '@moin/ui';
  import Icons from './components/Icons.svelte';
  import LevelSelect from './components/LevelSelect.svelte';
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
  /** Index into the story's `levels`, or -1 while playing the daily level. */
  let levelIndex = $state(0);
  let level = $state.raw<Level>(levels[0]!);
  let picking = $state(false);
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

  const today = (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  })();
  /** The daily level for the player's local calendar day; null if the generator found none. */
  const daily: Level | null = (() => {
    try {
      return dailyLevel(today);
    } catch {
      return null;
    }
  })();
  const isDaily = $derived(levelIndex < 0);
  const set = $derived(setOf(level.id));
  const solvedIn = (ids: readonly Level[]) => ids.filter((l) => best[l.id]).length;
  const frame = $derived<Frame | null>(playback ? frameAt(playback.events, tick) : null);
  const greetings = $derived.by(() => {
    if (!playback || !frame) return current.greetings;
    const { before } = playback;
    return game.people.map((p, i) =>
      Math.min(p.needs, (before.greetings[i] ?? 0) + (frame.greeted.get(`${p.x},${p.y}`) ?? 0)),
    );
  });
  const solved = $derived(playback === null && isSolved(game, current));
  // The story: a light morning mist over each part of town, lifting as its levels are solved.
  const fog = $derived(set ? 0.5 * (1 - solvedIn(set.levels) / set.levels.length) : solved ? 0 : 0.25);
  const bestStars = $derived(best[level.id] ? stars(best[level.id]!.bestTaps, level.par) : 0);

  function say(cue: Cue) {
    const picked = pickLine(cue, memory);
    memory = picked.memory;
    if (picked.line) {
      line = picked.line;
      lineKey += 1;
    }
  }

  function play(next: Level, index: number) {
    finishPlayback(false);
    picking = false;
    levelIndex = index;
    level = next;
    game = createGame(toBoard(next));
    current = initialState(game);
    history = [];
    announcement = '';
    say(index < 0 ? { trigger: 'dailyStart' } : { trigger: 'levelStart', levelId: next.id });
  }

  function startLevel(index: number) {
    play(levels[index]!, index);
  }

  function startDaily() {
    if (daily) play(daily, -1);
  }

  /** The first level of the story not solved yet (level 1 when everything is). */
  function firstUnsolved(progress: Record<string, LevelProgress>): number {
    const i = levels.findIndex((l) => !progress[l.id]);
    return i < 0 ? 0 : i;
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
      const id = level.id;
      const wasDone = set ? solvedIn(set.levels) === set.levels.length : true;
      const finishesSet = set !== undefined && !wasDone && set.levels.every((l) => l.id === id || best[l.id]);
      say(finishesSet ? { trigger: 'setComplete', levelId: set.id } : { trigger: taps <= level.par ? 'solvedPar' : 'solvedOver' });
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
      // The chain plays a tune: each Moin in the chain one note higher.
      const all = playback.events.filter((e) => e.type === 'launched');
      for (const launch of f.launches) sayMoin(noteFor(all.indexOf(launch)), launch.amount);
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
    if (isDaily) startLevel(firstUnsolved(best));
    else startLevel(levelIndex + 1 < levels.length ? levelIndex + 1 : 0);
  }

  const nextLabel = $derived(isDaily ? copy.backToStory : levelIndex === levels.length - 1 ? copy.fromTheTop : copy.next);

  async function share(): Promise<string | null> {
    const text = shareText(dayId(today), toBoard(level), current.taps, level.par, stars(current.taps, level.par));
    try {
      await navigator.clipboard.writeText(text);
      return null;
    } catch {
      return text;
    }
  }

  onMount(() => {
    startServiceWorker((apply) => (applyUpdate = apply));
    let settled = false;
    const begin = (progress: { levels: Record<string, LevelProgress>; muted: boolean | null }) => {
      if (settled) return;
      settled = true;
      best = progress.levels;
      muted = progress.muted;
      startLevel(firstUnsolved(progress.levels));
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
<Scene place={set?.id ?? 'daily'} {fog} />
{#if picking}
  <LevelSelect {sets} {best} daily={daily ? { day: dayId(today), level: daily } : null}
    current={level.id} onpick={startLevel} ondaily={startDaily} onclose={() => (picking = false)} />
{/if}

<div class="shell" class:ready>
  <header>
    <div class="topline">
      <p class="level-no">
        {#if isDaily}{copy.daily}<br />{dayId(today)}{:else}{set?.title ?? ''}<br />{copy.levelOf((set?.levels.findIndex((l) => l.id === level.id) ?? 0) + 1, set?.levels.length ?? levels.length)}{/if}
      </p>
    <div class="tools">
      <IconButton label={copy.levels} onclick={() => (picking = true)}><Icons name="levels" /></IconButton>
      <IconButton label={copy.undo} onclick={undo} disabled={history.length === 0}><Icons name="undo" /></IconButton>
      <IconButton label={copy.restart} onclick={restart} disabled={history.length === 0}><Icons name="restart" /></IconButton>
      <IconButton label={copy.mute} onclick={toggleMute} pressed={muted === true}>
        <Icons name={muted === true ? 'muted' : 'sound'} />
      </IconButton>
    </div>
    </div>
    <h1>{level.title}</h1>
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
      last={!isDaily && levelIndex === levels.length - 1} {nextLabel} onnext={next} onreplay={restart}
      share={isDaily ? share : null} />
  {/if}
  <p class="visually-hidden" aria-live="polite" data-testid="announcer">{announcement}</p>
</div>

<style>
  .shell {
    position: relative; z-index: 1;
    max-width: 640px; margin: 0 auto; min-height: 100dvh;
    display: flex; flex-direction: column;
    padding: max(14px, env(safe-area-inset-top)) 0 max(12px, env(safe-area-inset-bottom));
  }
  header { padding: 0 16px; }
  .topline { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .level-no {
    margin: 0; max-width: 11rem;
    font-size: 0.7rem; line-height: 1.5; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--ink-soft);
  }
  h1 {
    margin: 0.85rem 0 0; font-family: var(--serif); font-weight: 700; font-size: 2.5rem; line-height: 1;
    color: var(--ink); overflow-wrap: anywhere; text-shadow: 0 1px 8px rgba(251, 246, 234, 0.45);
  }
  .tools { display: flex; gap: 0.4rem; flex-shrink: 0; }
  .score {
    display: flex; align-items: center; gap: 0.4rem; margin: 0.5rem 16px 0; font-weight: 700; color: var(--ink-soft);
    font-variant-numeric: tabular-nums; font-size: 0.95rem;
  }
  .dot { opacity: 0.6; }
  .best { margin-left: auto; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 18px 14px 14px; }
</style>
