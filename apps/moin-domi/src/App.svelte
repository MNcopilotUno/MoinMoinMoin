<script lang="ts">
  import { FIRST_MEME, tidy, WHERE, type Meme, type Where } from '@moin/meme';
  import { playMoin } from '@moin/assets';
  import { tick } from 'svelte';
  import { relay, today } from './lib/config.js';
  import { defaultSettings, forgetEverything, listItems, listOutbox, loadSettings, putItem, putOutgoing, removeItem, removeOutgoing, saveSettings, type Item, type Outgoing, type Settings as SettingsValue } from './lib/db.js';
  import { startServiceWorker } from './lib/sw.js';
  import Queued from './screens/Queued.svelte';
  import About from './screens/About.svelte';
  import { errorText, linkInShare, lock, passOn, receive, start, tree, unlock, type LinkChoice, type Node, type Rules as RulesValue } from './lib/flow.js';
  import { lockNameIn, LockRefusal, slugify } from '@moin/tessera';
  import Unlock from './screens/Unlock.svelte';
  import Create from './screens/Create.svelte';
  import Finale from './screens/Finale.svelte';
  import Gone from './screens/Gone.svelte';
  import Home from './screens/Home.svelte';
  import Postcard from './screens/Postcard.svelte';
  import Ready from './screens/Ready.svelte';
  import Rules from './screens/Rules.svelte';
  import Settings from './screens/Settings.svelte';
  import Tree from './screens/Tree.svelte';
  import Turn from './screens/Turn.svelte';
  import Yours from './screens/Yours.svelte';
  import Icon from './components/Icon.svelte';
  import { domi } from '@moin/ui/copy/domi';

  type Screen =
    | { name: 'home' } | { name: 'create' } | { name: 'rules' } | { name: 'yours' } | { name: 'settings' }
    | { name: 'opening' }
    | { name: 'ready'; item: Item; started: boolean }
    | { name: 'turn'; item: Item }
    | { name: 'postcard'; item: Item }
    | { name: 'queued'; outgoing: Outgoing }
    | { name: 'about' }
    | { name: 'unlock'; lockName: string; waitUntil: number | null }
    | { name: 'tree'; item: Item; nodes: Node[]; maxStops: number; expiresDay: number; stale?: number }
    | { name: 'finale'; item: Item; nodes: Node[]; maxStops: number; expiresDay: number; finalId: string }
    | { name: 'gone'; title: string; text: string };

  let screen = $state<Screen>({ name: 'home' });
  let items = $state<Item[]>([]);
  let settings = $state<SettingsValue>(defaultSettings);
  let draft = $state<Meme>({ ...FIRST_MEME });
  let rules = $state<RulesValue>({ kind: 'chain', maxStops: 6, maxBranches: 1 });
  let link = $state<LinkChoice>({ kind: 'plain', password: '', name: '' });
  let busy = $state(false);
  let error = $state<string | null>(null);
  let online = $state(typeof navigator === 'undefined' ? true : navigator.onLine);
  let outbox = $state<Outgoing[]>([]);
  let sentNote = $state<string | null>(null);
  let applyUpdate = $state<(() => void) | null>(null);

  const blocked = $derived(relay === null ? domi.blocked : null);
  const waiting = $derived(items.filter((i) => i.status === 'your-turn' || i.status === 'postcard-in'));

  $effect(() => {
    const calm = settings.calm ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.toggleAttribute('data-calm', calm);
  });

  async function go(next: Screen) {
    screen = next;
    error = null;
    await tick();
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('main h1')?.focus();
  }

  async function refresh() {
    items = await listItems();
    outbox = await listOutbox();
  }

  const isOffline = (e: unknown) => (e as { reason?: string }).reason === 'offline';

  /** §6 Offline: keep it here, say so plainly, send it when the relay can be reached. */
  async function enqueue(o: Outgoing) {
    await putOutgoing(o);
    await refresh();
    await go({ name: 'queued', outgoing: o });
    retryLater();
  }

  let flushing = false;
  /**
   * The phone says it is online but the relay can't be reached (the `online` event fires before
   * the network really works; a café portal; a flapping tunnel): try again, 2 s, 4 s … up to a
   * minute, instead of waiting for an `online` event that already came (.agents/lessons/code.md).
   */
  let retryIn = 2000;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  function retryLater() {
    if (retryTimer || !navigator.onLine) return;
    retryTimer = setTimeout(() => { retryTimer = null; void flush(); }, retryIn);
    retryIn = Math.min(retryIn * 2, 60_000);
  }

  async function flush() {
    if (!relay || flushing || !navigator.onLine) return;
    flushing = true;
    try {
      for (const o of await listOutbox()) {
        if (o.problem) continue;
        try {
          const item = o.kind === 'start' ? await withLock(await start(relay, o.rules!, o.meme), o.lock) : await passOn(relay, o.parent!, o.meme);
          await putItem(item);
          await removeOutgoing(o.id);
          retryIn = 2000;
          sentNote = item.kind === 'postcard' ? domi.sent.postcard : domi.sent.chain;
          if (screen.name === 'queued' && screen.outgoing.id === o.id) await go({ name: 'ready', item, started: o.kind === 'start' });
        } catch (e) {
          if (isOffline(e)) {
            retryLater();
            break;
          }
          await putOutgoing({ ...o, problem: errorText(e) });
        }
      }
    } finally {
      flushing = false;
      await refresh();
    }
  }

  /**
   * While something waits to be sent, look every 5 s as well: Firefox does not always deliver the
   * `online` event to a page that was loaded offline (CI trace, 2026-11-01), and an event that
   * never comes must not leave a Moin in the outbox for good.
   */
  $effect(() => {
    if (outbox.length === 0) return;
    const timer = setInterval(() => {
      online = navigator.onLine;
      if (online) void flush();
    }, 5000);
    return () => clearInterval(timer);
  });

  /** D12, D13: the password opens the lock; the hop is then read like any link. */
  async function openLock(lockName: string, password: string) {
    if (!relay || busy) return;
    busy = true;
    error = null;
    try {
      const item = await unlock(relay, lockName, password, (chainId) => items.find((i) => i.chainId === chainId) ?? null);
      await putItem(item);
      await refresh();
      busy = false;
      await openItem(item);
    } catch (e) {
      busy = false;
      if (e instanceof LockRefusal) {
        screen = { name: 'unlock', lockName, waitUntil: e.waitUntil };
        error = e.reason === 'wait' ? null : errorText(e);
      } else if ((e as { reason?: string }).reason === 'not-found') await go({ name: 'gone', title: domi.gone.tide, text: domi.gone.tideText });
      else error = errorText(e);
    }
  }

  async function discard(o: Outgoing) {
    await removeOutgoing(o.id);
    await refresh();
  }

  let audio: AudioContext | null = null;
  function moin() {
    if (!settings.sound) return;
    try {
      audio ??= new AudioContext();
      void audio.resume();
      playMoin(audio);
    } catch {
      // sound is optional and never blocking (CLAUDE.md §7)
    }
  }

  async function changeSettings(next: SettingsValue) {
    settings = next;
    await saveSettings(next);
  }

  function newMeme(kind: RulesValue['kind']) {
    draft = { ...FIRST_MEME, nick: settings.rememberNick ? settings.nick : '' };
    rules = { ...rules, kind };
    link = { kind: 'plain', password: '', name: '' };
    lockNote = null;
    void go({ name: 'create' });
  }

  async function rememberNick(nick: string) {
    if (settings.rememberNick && tidy(nick) !== settings.nick) await changeSettings({ ...settings, nick: tidy(nick) });
  }

  const lockRequest = () => (link.kind === 'plain' ? undefined : { password: link.password, ...(link.kind === 'custom' ? { name: slugify(link.name) } : {}) });

  /** After a chain is made: put the password on it. If that fails, the key link still works. */
  async function withLock(item: Item, request: Outgoing['lock']): Promise<Item> {
    if (!relay || !request) return item;
    try {
      return await lock(relay, item, request.password, request.name);
    } catch (e) {
      lockNote = domi.ready.lockFailed(errorText(e));
      return item;
    }
  }
  let lockNote = $state<string | null>(null);
  /** The password of the link just locked: shown once on Ready, never stored. */
  let shownPassword = $state<string | null>(null);

  /** D12/D13 for any link you hand on — also after a turn — from the Ready screen. */
  async function addLock(item: Item, started: boolean, password: string, rawName: string): Promise<string | null> {
    if (!relay) return domi.ready.lockOff;
    const name = rawName.trim() ? slugify(rawName) : undefined;
    try {
      if (name) {
        const taken = await relay.getLock(name).then(() => true, (e: unknown) => ((e as { reason?: string }).reason === 'not-found' ? false : Promise.reject(e)));
        if (taken) return domi.errors.conflict;
      }
      const locked = await lock(relay, item, password, name);
      await putItem(locked);
      await refresh();
      shownPassword = password;
      screen = { name: 'ready', item: locked, started };
      return null;
    } catch (e) {
      return errorText(e);
    }
  }

  async function make() {
    if (!relay || busy) return;
    const outgoing: Outgoing = { id: crypto.randomUUID(), kind: 'start', meme: { ...draft, nick: tidy(draft.nick) }, rules, created: Date.now(), ...(lockRequest() ? { lock: lockRequest()! } : {}) };
    if (!navigator.onLine) return enqueue(outgoing);
    busy = true;
    error = null;
    try {
      const request = lockRequest();
      if (request?.name) {
        // D13: a name is unique while its chain lives — ask before making the chain.
        const taken = await relay.getLock(request.name).then(() => true, (e: unknown) => ((e as { reason?: string }).reason === 'not-found' ? false : Promise.reject(e)));
        if (taken) {
          busy = false;
          error = domi.errors.conflict;
          return;
        }
      }
      lockNote = null;
      shownPassword = request?.password ?? null;
      const item = await withLock(await start(relay, rules, { ...draft, nick: tidy(draft.nick) }), request);
      await putItem(item);
      await rememberNick(draft.nick);
      await refresh();
      moin();
      busy = false;
      await go({ name: 'ready', item, started: true });
    } catch (e) {
      busy = false;
      if (isOffline(e)) return enqueue(outgoing);
      error = errorText(e);
    }
  }

  async function pass(item: Item, meme: Meme) {
    if (!relay || busy) return;
    const outgoing: Outgoing = { id: crypto.randomUUID(), kind: 'turn', meme, parent: item, created: Date.now() };
    if (!navigator.onLine) return enqueue(outgoing);
    busy = true;
    error = null;
    try {
      const mine = await passOn(relay, item, meme);
      await putItem(mine);
      await rememberNick(meme.nick);
      await refresh();
      moin();
      busy = false;
      if (mine.status === 'finale') await openTree(mine, true);
      else await go({ name: 'ready', item: mine, started: false });
    } catch (e) {
      busy = false;
      if (isOffline(e)) return enqueue(outgoing);
      error = errorText(e);
    }
  }

  async function openTree(item: Item, finale = false) {
    if (!relay) return go({ name: 'postcard', item });
    try {
      const t = await tree(relay, item);
      const finals = t.nodes.filter((n) => n.depth >= t.maxStops);
      const status = finals.length && item.chainSecret && item.kind === 'chain' ? 'finale' : item.status;
      item = { ...item, status, expiresDay: t.expiresDay, snapshot: { ...t, seen: Date.now() } };
      await putItem(item);
      await refresh();
      const finalId = finals.find((f) => f.hopId === item.hopId)?.hopId ?? finals[0]?.hopId;
      if (finale && finalId) await go({ name: 'finale', item, ...t, finalId });
      else await go({ name: 'tree', item, ...t });
    } catch (e) {
      const reason = (e as { reason?: string }).reason;
      if (item.snapshot && reason !== 'not-found') {
        const s = item.snapshot;
        return go({ name: 'tree', item, nodes: [...s.nodes], maxStops: s.maxStops, expiresDay: s.expiresDay, stale: s.seen });
      }
      await go({ name: 'gone', title: reason === 'not-found' ? domi.gone.tide : domi.gone.tree, text: reason === 'not-found' ? domi.gone.tideText : errorText(e) });
    }
  }

  /**
   * Yours, kept honest: a chain you are in may have reached its finale or gone since you looked.
   * Ask for the trees you can read (newest ten), quietly; anything that fails stays as it was.
   */
  let refreshing = false;
  async function refreshStatuses() {
    if (!relay || refreshing || !navigator.onLine) return;
    refreshing = true;
    try {
      for (const it of items.filter((i) => i.kind === 'chain' && i.chainSecret && i.status === 'travelling').slice(0, 10)) {
        try {
          const t = await tree(relay, it);
          const finale = t.nodes.some((n) => n.depth >= t.maxStops);
          await putItem({ ...it, status: finale ? 'finale' : it.status, expiresDay: t.expiresDay, snapshot: { ...t, seen: Date.now() } });
        } catch (e) {
          const reason = (e as { reason?: string }).reason;
          if (reason === 'not-found') await putItem({ ...it, status: 'gone' });
          else if (reason === 'offline') break;
        }
      }
      // Past its day on this phone's clock: gone, whether or not the relay was asked.
      for (const it of items.filter((i) => i.status !== 'gone' && i.expiresDay < today())) await putItem({ ...it, status: 'gone' });
    } finally {
      refreshing = false;
      await refresh();
    }
  }

  async function forget(item: Item) {
    await removeItem(item.chainId);
    await refresh();
  }

  async function openItem(item: Item) {
    if (item.status === 'gone') return go({ name: 'gone', title: domi.gone.tide, text: domi.gone.tideText });
    if (item.status === 'your-turn') return go({ name: 'turn', item });
    if (item.kind === 'postcard' || !item.chainSecret) return go({ name: 'postcard', item });
    return openTree(item);
  }

  /** A link someone sent: read it, keep the key here, and take the key out of the address bar. */
  async function openLink(href: string) {
    const lockName = lockNameIn(href);
    if (lockName) {
      history.replaceState(null, '', import.meta.env.BASE_URL);
      return go({ name: 'unlock', lockName, waitUntil: null });
    }
    await go({ name: 'opening' });
    history.replaceState(null, '', import.meta.env.BASE_URL);
    if (!relay) return go({ name: 'gone', title: domi.gone.notYet, text: domi.gone.notYetText });
    try {
      const item = await receive(relay, href, (chainId) => items.find((i) => i.chainId === chainId) ?? null);
      await putItem(item);
      await refresh();
      await openItem(item);
    } catch (e) {
      const reason = (e as { reason?: string }).reason;
      // Offline: put the link back, key and all, so a reload when the network returns opens it.
      if (reason === 'offline' && new URL(href).origin === location.origin) history.replaceState(null, '', href);
      if (reason === 'not-found') await go({ name: 'gone', title: domi.gone.tide, text: domi.gone.tideText });
      else if (reason === 'offline') await go({ name: 'gone', title: domi.gone.offline, text: domi.gone.offlineText });
      else await go({ name: 'gone', title: domi.gone.broken, text: errorText(e) });
    }
  }

  /** S4, the bridge: a solved puzzle level opens a ready-made meme from its part of town. */
  async function fromPuzzle(levelId: string) {
    history.replaceState(null, '', import.meta.env.BASE_URL);
    const part = levelId.split('-')[0] ?? '';
    const where: Where = (WHERE as readonly string[]).includes(part) ? (part as Where) : 'harbour';
    draft = { ...FIRST_MEME, where, top: domi.bridge.top[where], bottom: domi.bridge.bottom, nick: settings.rememberNick ? settings.nick : '' };
    rules = { ...rules, kind: 'chain' };
    await go({ name: 'create' });
  }

  async function startUp() {
    settings = await loadSettings();
    await refresh();
    const href = location.href;
    const url = new URL(href);
    if (/\/m\/[^/]+\/?$/.test(url.pathname) || url.searchParams.has('m')) await openLink(href);
    else if (url.searchParams.has('from')) await fromPuzzle(url.searchParams.get('from') ?? '');
    else if (['share-text', 'share-url', 'share-title'].some((k) => url.searchParams.has(k))) {
      // From the phone's share sheet (installed app): open the Moin in what was shared.
      const shared = linkInShare(url.searchParams.get('share-url'), url.searchParams.get('share-text'), url.searchParams.get('share-title'));
      if (shared) await openLink(shared);
      else {
        history.replaceState(null, '', import.meta.env.BASE_URL);
        await go({ name: 'gone', title: domi.gone.noLink, text: domi.gone.noLinkText });
      }
    }
    else document.querySelector<HTMLElement>('main h1')?.focus();
  }

  $effect(() => {
    void startUp().then(flush);
    startServiceWorker((apply) => (applyUpdate = apply));
    const up = () => { online = true; void flush(); }, down = () => (online = false);
    addEventListener('online', up);
    addEventListener('offline', down);
    return () => {
      removeEventListener('online', up);
      removeEventListener('offline', down);
    };
  });
</script>

{#if screen.name === 'home'}
  <Home {waiting} {outbox} {sentNote} sendingOff={relay === null} onchain={() => newMeme('chain')} onsend={() => newMeme('postcard')}
    onopen={openItem} onyours={() => { void go({ name: 'yours' }); void refreshStatuses(); }} onsettings={() => go({ name: 'settings' })}
    ondiscard={discard} ondismiss={() => (sentNote = null)} />
{:else if screen.name === 'create'}
  <Create {draft} postcard={rules.kind === 'postcard'} onchange={(m) => (draft = m)} onback={() => go({ name: 'home' })} onnext={() => go({ name: 'rules' })} />
{:else if screen.name === 'rules'}
  <Rules {rules} {draft} {busy} {blocked} {error} offline={!online} {link} onlink={(l) => (link = l)} onrules={(r) => (rules = r)} ondraft={(m) => (draft = m)} onback={() => go({ name: 'create' })} onmake={make} />
{:else if screen.name === 'ready'}
  {@const s = screen}
  {#if lockNote}<p class="locknote" role="alert">{lockNote}</p>{/if}
  <Ready item={s.item} started={s.started} password={s.item.lockName ? shownPassword : null}
    canLock={relay !== null && online} onlock={(pw, name) => addLock(s.item, s.started, pw, name)} onback={() => go({ name: 'home' })} ondone={() => go({ name: 'home' })} ontree={() => openTree(s.item)} />
{:else if screen.name === 'turn'}
  {@const s = screen}
  <Turn item={s.item} nick={settings.rememberNick ? settings.nick : ''} {busy} {error} {blocked} offline={!online} onback={() => go({ name: 'home' })} onpass={(m) => pass(s.item, m)} />
{:else if screen.name === 'postcard'}
  {@const s = screen}
  <Postcard item={s.item} onback={() => go({ name: 'home' })} onreply={() => newMeme('postcard')} onlink={() => go({ name: 'ready', item: s.item, started: true })} />
{:else if screen.name === 'tree'}
  {@const s = screen}
  <Tree item={s.item} nodes={s.nodes} maxStops={s.maxStops} expiresDay={s.expiresDay} stale={s.stale} onback={() => go({ name: 'home' })}
    onlink={() => go({ name: 'ready', item: s.item, started: s.item.depth === 1 })}
    onfinale={(finalId) => go({ name: 'finale', item: s.item, nodes: s.nodes, maxStops: s.maxStops, expiresDay: s.expiresDay, finalId })} />
{:else if screen.name === 'finale'}
  {@const s = screen}
  <Finale nodes={s.nodes} finalId={s.finalId} maxStops={s.maxStops} onback={() => go({ name: 'tree', item: s.item, nodes: s.nodes, maxStops: s.maxStops, expiresDay: s.expiresDay })} onnew={() => newMeme('chain')} />
{:else if screen.name === 'yours'}
  <Yours {items} onback={() => go({ name: 'home' })} onopen={openItem} onforget={forget} />
{:else if screen.name === 'settings'}
  <Settings {settings} onchange={changeSettings} onabout={() => go({ name: 'about' })} onback={() => go({ name: 'home' })} onforget={async () => { await forgetEverything(); settings = defaultSettings; await refresh(); await go({ name: 'home' }); }} />
{:else if screen.name === 'unlock'}
  {@const s = screen}
  <Unlock name={s.lockName} {busy} {error} waitUntil={s.waitUntil} onopen={(pw) => openLock(s.lockName, pw)} onhome={() => go({ name: 'home' })} />
{:else if screen.name === 'about'}
  <About onback={() => go({ name: 'settings' })} />
{:else if screen.name === 'queued'}
  {@const s = screen}
  <Queued outgoing={s.outgoing} {online} onhome={() => go({ name: 'home' })} />
{:else if screen.name === 'gone'}
  {@const s = screen}
  <Gone title={s.title} text={s.text} onnew={() => newMeme('chain')} onhome={() => go({ name: 'home' })} />
{:else}
  <main class="screen opening" aria-busy="true">
    <h1 tabindex="-1" class="title">{domi.opening.title}</h1>
    <p class="soft">{domi.opening.body} <Icon name="lock" size={16} color="#F2C46B" /></p>
  </main>
{/if}

{#if applyUpdate}
  <div class="update" role="status">
    <span>{domi.update.ready}</span>
    <button type="button" class="chip" onclick={() => applyUpdate?.()}>{domi.update.reload}</button>
  </div>
{/if}

<style>
  .locknote { position: fixed; z-index: 9; left: 12px; right: 12px; top: max(12px, env(safe-area-inset-top)); margin: 0 auto; max-width: 28rem; padding: 10px 14px; border-radius: 14px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--gold); font-size: 13.5px; line-height: 1.4; }
  .update {
    position: fixed; left: 50%; bottom: max(12px, env(safe-area-inset-bottom)); transform: translateX(-50%);
    width: min(calc(100% - 24px), 28rem); display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 8px 8px 8px 16px; border-radius: 999px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--gold), 0 10px 30px #000;
    font-size: 14px; font-weight: 700; z-index: 10;
  }
  .opening { justify-content: center; gap: 10px; text-align: center; }
</style>
