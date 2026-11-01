<script lang="ts">
  import { FIRST_MEME, tidy, type Meme } from '@moin/meme';
  import { playMoin } from '@moin/assets';
  import { tick } from 'svelte';
  import { relay } from './lib/config.js';
  import { defaultSettings, forgetEverything, listItems, listOutbox, loadSettings, putItem, putOutgoing, removeOutgoing, saveSettings, type Item, type Outgoing, type Settings as SettingsValue } from './lib/db.js';
  import { startServiceWorker } from './lib/sw.js';
  import Queued from './screens/Queued.svelte';
  import About from './screens/About.svelte';
  import { errorText, passOn, receive, start, tree, type Node, type Rules as RulesValue } from './lib/flow.js';
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

  type Screen =
    | { name: 'home' } | { name: 'create' } | { name: 'rules' } | { name: 'yours' } | { name: 'settings' }
    | { name: 'opening' }
    | { name: 'ready'; item: Item; started: boolean }
    | { name: 'turn'; item: Item }
    | { name: 'postcard'; item: Item }
    | { name: 'queued'; outgoing: Outgoing }
    | { name: 'about' }
    | { name: 'tree'; item: Item; nodes: Node[]; maxStops: number; expiresDay: number; stale?: number }
    | { name: 'finale'; item: Item; nodes: Node[]; maxStops: number; expiresDay: number; finalId: string }
    | { name: 'gone'; title: string; text: string };

  let screen = $state<Screen>({ name: 'home' });
  let items = $state<Item[]>([]);
  let settings = $state<SettingsValue>(defaultSettings);
  let draft = $state<Meme>({ ...FIRST_MEME });
  let rules = $state<RulesValue>({ kind: 'chain', maxStops: 6, maxBranches: 1 });
  let busy = $state(false);
  let error = $state<string | null>(null);
  let online = $state(typeof navigator === 'undefined' ? true : navigator.onLine);
  let outbox = $state<Outgoing[]>([]);
  let sentNote = $state<string | null>(null);
  let applyUpdate = $state<(() => void) | null>(null);

  const blocked = $derived(relay === null ? 'Sending isn’t switched on yet: the relay has no home. Everything else works.' : null);
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
  }

  let flushing = false;
  async function flush() {
    if (!relay || flushing || !navigator.onLine) return;
    flushing = true;
    try {
      for (const o of await listOutbox()) {
        if (o.problem) continue;
        try {
          const item = o.kind === 'start' ? await start(relay, o.rules!, o.meme) : await passOn(relay, o.parent!, o.meme);
          await putItem(item);
          await removeOutgoing(o.id);
          sentNote = item.kind === 'postcard' ? 'Your postcard was locked and sent to the relay. Its link is under Yours.' : 'Your Moin went out. Its link is under Yours.';
          if (screen.name === 'queued' && screen.outgoing.id === o.id) await go({ name: 'ready', item, started: o.kind === 'start' });
        } catch (e) {
          if (isOffline(e)) break;
          await putOutgoing({ ...o, problem: errorText(e) });
        }
      }
    } finally {
      flushing = false;
      await refresh();
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
    void go({ name: 'create' });
  }

  async function rememberNick(nick: string) {
    if (settings.rememberNick && tidy(nick) !== settings.nick) await changeSettings({ ...settings, nick: tidy(nick) });
  }

  async function make() {
    if (!relay || busy) return;
    const outgoing: Outgoing = { id: crypto.randomUUID(), kind: 'start', meme: { ...draft, nick: tidy(draft.nick) }, rules, created: Date.now() };
    if (!navigator.onLine) return enqueue(outgoing);
    busy = true;
    error = null;
    try {
      const item = await start(relay, rules, { ...draft, nick: tidy(draft.nick) });
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
      await go({ name: 'gone', title: reason === 'not-found' ? 'Gone with the tide' : 'The tree won’t open', text: reason === 'not-found' ? goneText : errorText(e) });
    }
  }

  const goneText = 'Nothing answers to this link any more. Chains vanish 30 days after their last stop — every version, everywhere — and then nobody can open them, not even us.';

  async function openItem(item: Item) {
    if (item.status === 'your-turn') return go({ name: 'turn', item });
    if (item.kind === 'postcard' || !item.chainSecret) return go({ name: 'postcard', item });
    return openTree(item);
  }

  /** A link someone sent: read it, keep the key here, and take the key out of the address bar. */
  async function openLink(href: string) {
    await go({ name: 'opening' });
    history.replaceState(null, '', import.meta.env.BASE_URL);
    if (!relay) return go({ name: 'gone', title: 'Not yet', text: 'This Moin needs the relay, and the relay isn’t switched on yet.' });
    try {
      const item = await receive(relay, href, (chainId) => items.find((i) => i.chainId === chainId) ?? null);
      await putItem(item);
      await refresh();
      await openItem(item);
    } catch (e) {
      const reason = (e as { reason?: string }).reason;
      // Offline: put the link back, key and all, so a reload when the network returns opens it.
      if (reason === 'offline') history.replaceState(null, '', href);
      if (reason === 'not-found') await go({ name: 'gone', title: 'Gone with the tide', text: goneText });
      else if (reason === 'offline') await go({ name: 'gone', title: 'Offline', text: 'This Moin is waiting on the relay, and you’re offline. Keep this page open, or open the link again when you’re back.' });
      else await go({ name: 'gone', title: 'This link doesn’t open', text: errorText(e) });
    }
  }

  async function startUp() {
    settings = await loadSettings();
    await refresh();
    const href = location.href;
    const url = new URL(href);
    if (/\/m\/[^/]+\/?$/.test(url.pathname) || url.searchParams.has('m')) await openLink(href);
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
    onopen={openItem} onyours={() => go({ name: 'yours' })} onsettings={() => go({ name: 'settings' })}
    ondiscard={discard} ondismiss={() => (sentNote = null)} />
{:else if screen.name === 'create'}
  <Create {draft} postcard={rules.kind === 'postcard'} onchange={(m) => (draft = m)} onback={() => go({ name: 'home' })} onnext={() => go({ name: 'rules' })} />
{:else if screen.name === 'rules'}
  <Rules {rules} {draft} {busy} {blocked} {error} offline={!online} onrules={(r) => (rules = r)} ondraft={(m) => (draft = m)} onback={() => go({ name: 'create' })} onmake={make} />
{:else if screen.name === 'ready'}
  {@const s = screen}
  <Ready item={s.item} started={s.started} onback={() => go({ name: 'home' })} ondone={() => go({ name: 'home' })} ontree={() => openTree(s.item)} />
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
  <Yours {items} onback={() => go({ name: 'home' })} onopen={openItem} />
{:else if screen.name === 'settings'}
  <Settings {settings} onchange={changeSettings} onabout={() => go({ name: 'about' })} onback={() => go({ name: 'home' })} onforget={async () => { await forgetEverything(); settings = defaultSettings; await refresh(); await go({ name: 'home' }); }} />
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
    <h1 tabindex="-1" class="title">Opening your Moin…</h1>
    <p class="soft">Unlocking it here on your phone. <Icon name="lock" size={16} color="#F2C46B" /></p>
  </main>
{/if}

{#if applyUpdate}
  <div class="update" role="status">
    <span>A new Moin Domi is ready.</span>
    <button type="button" class="chip" onclick={() => applyUpdate?.()}>Reload</button>
  </div>
{/if}

<style>
  .update {
    position: fixed; left: 50%; bottom: max(12px, env(safe-area-inset-bottom)); transform: translateX(-50%);
    width: min(calc(100% - 24px), 28rem); display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 8px 8px 8px 16px; border-radius: 999px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--gold), 0 10px 30px #000;
    font-size: 14px; font-weight: 700; z-index: 10;
  }
  .opening { justify-content: center; gap: 10px; text-align: center; }
</style>
