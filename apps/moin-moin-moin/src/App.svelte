<script lang="ts">
  import { onMount, tick as nextDom } from 'svelte';
  import { createGame, initialState, isSolved, stars, tap } from '@moin/core';
  import type { Game, MoinEvent, State } from '@moin/core';
  import { dailyLevel, dayId, levels, sets, setOf, toBoard } from '@moin/levels';
  import type { Level } from '@moin/levels';
  import { freshMemory, pickLine, triggerForTap } from '@moin/narration';
  import type { Cue, Line, NarratorMemory } from '@moin/narration';
  import { announceTap, Board, copy, frameAt, IconButton, msAt, Onlookers, Scene, shareText, SkyLife, Stars, tickAt } from '@moin/ui';
  import type { Frame } from '@moin/ui';
  import Icons from './components/Icons.svelte';
  import LevelSelect from './components/LevelSelect.svelte';
  import Narrator from './components/Narrator.svelte';
  import SettingsSheet from './components/SettingsSheet.svelte';
  import UpdateToast from './components/UpdateToast.svelte';
  import WinCard from './components/WinCard.svelte';
  import { buzz, sayAmbient, sayUndo, sayWin, scheduleChain, setHaptics, setMuted, setVolume, unlockAudio } from './lib/audio';
  import type { ChainSound } from './lib/audio';
  import { applyCalm, applyTheme, effectiveCalm, effectiveTheme, watchSystemMotion, watchSystemTheme } from './lib/theme';
  import { clearLevels, defaultSettings, loadProgress, saveSetting, saveSolved } from './lib/progress';
  import type { LevelProgress, Progress, Settings, ThemeSetting } from './lib/progress';
  import { startServiceWorker } from './lib/sw';

  interface Playback {
    readonly events: readonly MoinEvent[];
    readonly before: State;
    readonly start: number;
    /** Tick of the last smile when this tap solves the level: the win moment. */
    readonly winTick: number | null;
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
  let themeSetting = $state<ThemeSetting>('auto');
  let volume = $state(defaultSettings.volume);
  let haptics = $state(defaultSettings.haptics);
  let narratorOn = $state(defaultSettings.narrator);
  let calmSetting = $state<boolean | null>(null);
  let systemTick = $state(0);
  let motionTick = $state(0);
  const theme = $derived((void systemTick, effectiveTheme(themeSetting)));
  const calm = $derived((void motionTick, effectiveCalm(calmSetting)));
  $effect(() => applyTheme(theme));
  $effect(() => applyCalm(calm));
  let settingsOpen = $state(false);
  let settingsButton = $state<HTMLButtonElement | null>(null);
  /** Bumped once per smile as the animation reaches it: the crowd on the quay cheers. */
  let cheer = $state(0);
  /** The win moment (board wave, bells) and, 600 ms later, the card (QA feel H1, H2). */
  let celebrating = $state(false);
  let showWin = $state(false);
  let winTimer = 0;
  let chainSound: ChainSound = { cancel() {} };
  let lastBuzz = 0;
  let memory: NarratorMemory = freshMemory;
  let line = $state.raw<Line | null>(null);
  let lineKey = $state(0);
  let announcement = $state('');
  let applyUpdate = $state.raw<(() => void) | null>(null);

  const localDay = () => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  };
  /** Today, refreshed whenever the menu opens: the daily rolls over at midnight (QA m5). */
  let today = $state(localDay());
  /** The daily level for the player's local calendar day; null if the generator found none. */
  const daily: Level | null = $derived.by(() => {
    try {
      return dailyLevel(today);
    } catch {
      return null;
    }
  });
  let levelsButton = $state<HTMLButtonElement | null>(null);
  let titleEl = $state<HTMLElement | null>(null);
  let dismissedUpdate = $state(false);
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
  const solved = $derived(isSolved(game, current));
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

  function resetWin() {
    clearTimeout(winTimer);
    celebrating = false;
    showWin = false;
  }

  /** Everyone is smiling: wave, buzz and bells now; the card a beat later. */
  function celebrateNow(delay = 600) {
    if (celebrating) return;
    celebrating = true;
    buzz([12, 40, 12]);
    const starCount = stars(current.taps, level.par);
    clearTimeout(winTimer);
    winTimer = window.setTimeout(() => {
      showWin = true;
      sayWin(starCount);
    }, delay);
  }

  function play(next: Level, index: number) {
    finishPlayback(false);
    resetWin();
    picking = false;
    levelIndex = index;
    level = next;
    game = createGame(toBoard(next));
    current = initialState(game);
    history = [];
    announcement = '';
    say(index < 0 ? { trigger: 'dailyStart' } : { trigger: 'levelStart', levelId: next.id });
  }

  function startLevel(index: number, focusTitle = false) {
    play(levels[index]!, index);
    if (focusTitle) void nextDom().then(() => titleEl?.focus());
  }

  function startDaily() {
    if (daily) play(daily, -1);
    void nextDom().then(() => titleEl?.focus());
  }

  function openLevels() {
    today = localDay();
    picking = true;
  }

  function closeLevels() {
    picking = false;
    void nextDom().then(() => levelsButton?.focus());
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
    if (done && !narrate) chainSound.cancel();
    if (done && isSolved(game, current)) celebrateNow(narrate ? 600 : 300);
    if (done && narrate) afterTap(done.events);
  }

  function afterTap(events: readonly MoinEvent[]) {
    if (isSolved(game, current)) {
      const taps = current.taps;
      const id = level.id;
      const wasDone = set ? solvedIn(set.levels) === set.levels.length : true;
      const finishesSet = set !== undefined && !wasDone && set.levels.every((l) => l.id === id || best[l.id]);
      say(finishesSet ? { trigger: 'setComplete', levelId: set.id } : { trigger: taps <= level.par ? 'solvedPar' : 'solvedOver' });
      void id;
      return;
    }
    const trigger = triggerForTap(events);
    if (trigger) say({ trigger });
  }

  function step(now: number) {
    if (!playback) return;
    // Long chains speed up a little (UI only); sounds were scheduled with the same mapping.
    tick = tickAt(playback.events, now - playback.start);
    const f = frameAt(playback.events, tick, lastTick);
    lastTick = tick;
    cheer += f.launches.length;
    if (f.launches.length > 0 && now - lastBuzz > 120) {
      buzz(5);
      lastBuzz = now;
    }
    if (playback.winTick !== null && tick >= playback.winTick) celebrateNow();
    if (f.done) finishPlayback(true);
    else raf = requestAnimationFrame(step);
  }

  function onTap(x: number, y: number) {
    unlockAudio();
    const result = tap(game, current, x, y);
    // A tap during an animation skips to its end; input is never gated. A tap the rules ignore
    // (R1, R2) finishes the animation *with* its remark and win, so nothing is lost (QA B1).
    finishPlayback(result.events.length === 0);
    if (result.events.length === 0) return;
    history = [...history, current];
    const before = current;
    current = result.state;
    buzz(8);
    const nowSolved = isSolved(game, current);
    // Save the solve the moment it happens, not when the animation ends (QA B1).
    if (nowSolved) {
      const solvedId = level.id;
      void saveSolved(solvedId, current.taps).then((levelsBest) => (best = levelsBest));
    }
    const text = announceTap(result.events, nowSolved);
    announcement = '';
    requestAnimationFrame(() => (announcement = text));
    const smiles = result.events.filter((e) => e.type === 'smiled');
    const winTick = nowSolved ? (smiles[smiles.length - 1]?.t ?? 0) : null;
    chainSound = scheduleChain(result.events, (t) => msAt(result.events, t));
    if (calm) {
      cheer += smiles.length;
      if (nowSolved) celebrateNow(300);
      afterTap(result.events);
      return;
    }
    playback = { events: result.events, before, start: performance.now(), winTick };
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
    resetWin();
    sayUndo();
    say({ trigger: 'undo' });
  }

  function restart() {
    finishPlayback(false);
    if (history.length === 0) return;
    current = initialState(game);
    history = [];
    announcement = '';
    resetWin();
    sayUndo();
    say({ trigger: 'restart' });
  }

  // The settings sheet (.agents/features/settings.md); each change is saved at once.
  function setSound(on: boolean) {
    unlockAudio();
    muted = !on;
    setMuted(muted);
    void saveSetting('muted', muted);
  }

  function setTheme(next: ThemeSetting) {
    themeSetting = next;
    void saveSetting('theme', next);
  }

  function changeVolume(percent: number) {
    volume = percent;
    setVolume(percent);
    void saveSetting('volume', percent);
  }

  function changeHaptics(on: boolean) {
    haptics = on;
    setHaptics(on);
    if (on) buzz(12);
    void saveSetting('haptics', on);
  }

  function changeNarrator(on: boolean) {
    narratorOn = on;
    void saveSetting('narrator', on);
  }

  function changeCalm(on: boolean) {
    calmSetting = on;
    void saveSetting('calm', on);
  }

  function openSettings() {
    settingsOpen = true;
  }

  function closeSettings() {
    settingsOpen = false;
    void nextDom().then(() => settingsButton?.focus());
  }

  /** Start over: forget every solve on this phone and wake level 1 grumpy again. */
  function startOver() {
    void clearLevels();
    best = {};
    settingsOpen = false;
    startLevel(0, true);
  }

  const totalStars = $derived(levels.reduce((n, l) => n + (best[l.id] ? stars(best[l.id]!.bestTaps, l.par) : 0), 0));

  function poke(kind: 'squawk' | 'horn' | 'moin', pitch = 0) {
    unlockAudio();
    if (muted !== true) sayAmbient(kind, pitch);
  }

  function next() {
    if (isDaily) startLevel(firstUnsolved(best), true);
    else startLevel(levelIndex + 1 < levels.length ? levelIndex + 1 : 0, true);
  }

  const nextLabel = $derived(isDaily ? copy.backToStory : levelIndex === levels.length - 1 ? copy.fromTheTop : copy.next);

  async function share(options: { copy: boolean } = { copy: true }): Promise<string | null> {
    const text = shareText(dayId(today), toBoard(level), current.taps, level.par, stars(current.taps, level.par));
    if (!options.copy) return text;
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
    const stopWatching = watchSystemTheme(() => (systemTick += 1));
    const stopWatchingMotion = watchSystemMotion(() => (motionTick += 1));
    // Create the AudioContext on the very first touch, before click handlers run (QA feel M7).
    document.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
    const applySettings = (p: Settings) => {
      themeSetting = p.theme;
      volume = p.volume;
      setVolume(p.volume);
      haptics = p.haptics;
      setHaptics(p.haptics);
      narratorOn = p.narrator;
      calmSetting = p.calm;
    };
    const begin = (progress: Progress) => {
      if (settled) {
        // Late storage (QA m3): merge, never undo what the player already did.
        best = { ...progress.levels, ...best };
        muted = muted ?? progress.muted;
        setMuted(muted === true);
        applySettings(progress);
        return;
      }
      settled = true;
      best = { ...progress.levels };
      muted = progress.muted;
      setMuted(progress.muted === true);
      applySettings(progress);
      startLevel(firstUnsolved(progress.levels));
      ready = true;
    };
    // Cold open must not wait on storage: play level 1 if IndexedDB is slow.
    const fallback = setTimeout(() => begin({ levels: {}, ...defaultSettings }), 600);
    void loadProgress().then((p) => {
      clearTimeout(fallback);
      begin(p);
    });
    return () => {
      stopWatching();
      stopWatchingMotion();
      finishPlayback(false);
    };
  });
</script>

{#if applyUpdate && !dismissedUpdate}<UpdateToast apply={applyUpdate} dismiss={() => (dismissedUpdate = true)} />{/if}
<Scene place={set?.id ?? 'daily'} {fog} night={theme === 'dark'} />
{#if picking}
  <LevelSelect {sets} {best} daily={daily ? { day: dayId(today), level: daily } : null}
    current={level.id} onpick={(i) => startLevel(i, true)} ondaily={startDaily} onclose={closeLevels}
    night={theme === 'dark'} />
{/if}
{#if settingsOpen}
  <SettingsSheet sound={muted !== true} {volume} {haptics} theme={themeSetting} narrator={narratorOn} {calm}
    stars={totalStars} maxStars={levels.length * 3} solved={levels.filter((l) => best[l.id]).length}
    onsound={setSound} onvolume={changeVolume} onhaptics={changeHaptics} ontheme={setTheme}
    onnarrator={changeNarrator} oncalm={changeCalm} onreset={startOver} onclose={closeSettings} />
{/if}

<div class="shell" class:ready inert={picking || settingsOpen}>
  <header>
    <div class="topline">
      <p class="level-no">
        {#if isDaily}{copy.todaysHarbour}<br />{dayId(today)}{:else}{set?.title ?? ''}<br />{copy.levelOf((set?.levels.findIndex((l) => l.id === level.id) ?? 0) + 1, set?.levels.length ?? levels.length)}{/if}
      </p>
    <div class="tools">
      <IconButton label={copy.levels} onclick={openLevels} bind:element={levelsButton}><Icons name="levels" /></IconButton>
      <IconButton label={copy.undo} onclick={undo} disabled={history.length === 0}><Icons name="undo" /></IconButton>
      <IconButton label={copy.restart} onclick={restart} disabled={history.length === 0}><Icons name="restart" /></IconButton>
      <IconButton label={copy.settings.open} onclick={openSettings} bind:element={settingsButton}><Icons name="settings" /></IconButton>
    </div>
    </div>
    <h1 tabindex="-1" bind:this={titleEl}>{level.title}</h1>
  </header>

  <p class="score" data-testid="score">
    <span>{copy.taps(current.taps)}</span><span class="dot">·</span><span>{copy.par(level.par)}</span>
    {#if bestStars > 0}<span class="best"><Stars count={bestStars} size="1rem" /></span>{/if}
  </p>

  <main>
    {#if ready}
      <Board width={game.width} height={game.height} cells={game.cells} {greetings} night={theme === 'dark'}
        arrivals={frame?.arrivals} {celebrating}
        moin={frame?.moin ?? null} thief={frame?.thief ?? null} bounce={frame?.bounce ?? null} ontap={onTap} />
    {/if}
  </main>

  <div class="sky-wrap"><SkyLife onsquawk={() => poke('squawk')} onhorn={() => poke('horn')} /></div>

  <div class="quay-wrap">
    <Onlookers {cheer} celebrate={celebrating} onpoke={(i) => poke('moin', [5, 2, 0, -5, 3, -2, 7][i] ?? 0)} />
  </div>

  <!-- On a win the line moves into the card; its space is kept so the board never shifts. -->
  {#if !showWin}{#if narratorOn}<Narrator {line} key={lineKey} />{/if}{:else}<div class="narrator-space" aria-hidden="true"></div>{/if}
  {#if showWin && solved}
    <WinCard autofocus={!picking && !settingsOpen} stars={stars(current.taps, level.par)} taps={current.taps} par={level.par}
      last={!isDaily && levelIndex === levels.length - 1} {nextLabel} onnext={next} onreplay={restart}
      share={isDaily ? share : null} quote={narratorOn ? (line?.text ?? null) : null} />
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
    color: var(--ink); overflow-wrap: anywhere; text-shadow: 0 1px 8px var(--title-glow);
  }
  .tools { display: flex; gap: 0.4rem; flex-shrink: 0; }
  .score {
    display: flex; align-items: center; gap: 0.4rem; margin: 0.5rem 16px 0; font-weight: 700; color: var(--ink-soft);
    font-variant-numeric: tabular-nums; font-size: 0.95rem;
  }
  .dot { opacity: 0.6; }
  .best { margin-left: auto; }
  /* Visual order ≠ tab order: the sky draws above the board but is tabbed after it (QA m7). */
  header { order: 1; } .score { order: 2; } .sky-wrap { order: 3; } main { order: 4; } .quay-wrap { order: 5; }
  .shell > :global(*:not(header):not(.score):not(.sky-wrap):not(main):not(.quay-wrap)) { order: 6; }
  h1:focus { outline: none; }
  h1:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; border-radius: 4px; }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 6px 14px 14px; }
  .quay-wrap { padding: 0 14px 10px; }
  .narrator-space { min-height: 5rem; }
</style>
