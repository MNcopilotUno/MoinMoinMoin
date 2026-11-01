<script lang="ts">
  import { NICK_MAX, tidy, type Meme } from '@moin/meme';
  import Icon from '../components/Icon.svelte';
  import { passwordProblem, slugify, isCustomName } from '@moin/tessera';
  import type { LinkChoice, Rules } from '../lib/flow.js';
  import { suggestPassphrase } from '../lib/passphrase.js';

  interface Props {
    rules: Rules;
    draft: Meme;
    busy: boolean;
    blocked: string | null;
    error: string | null;
    offline: boolean;
    link: LinkChoice;
    onlink: (l: LinkChoice) => void;
    onrules: (r: Rules) => void;
    ondraft: (m: Meme) => void;
    onback: () => void;
    onmake: () => void;
  }
  let { rules, draft, busy, blocked, error, offline, link, onlink, onrules, ondraft, onback, onmake }: Props = $props();
  const LINKS = [
    { kind: 'plain', title: 'Private link', hint: 'The key lives only in the link' },
    { kind: 'password', title: 'With a password', hint: 'For a link that might be forwarded' },
    { kind: 'custom', title: 'A name you choose', hint: 'Always with a password' },
  ] as const;
  const slug = $derived(slugify(link.name));
  const pwProblem = $derived(link.kind === 'plain' ? null : link.password === '' ? 'empty' : passwordProblem(link.password));
  const nameProblem = $derived(link.kind !== 'custom' ? null : !isCustomName(slug) ? 'bad' : null);
  const linkReady = $derived(pwProblem === null && nameProblem === null);
  const pwHint = $derived(pwProblem === 'common' ? 'Too common — anyone would guess it.' : pwProblem === 'too-short' ? 'Three words, or twelve characters.' : pwProblem === 'empty' ? 'Choose one, or take the suggestion.' : 'Good. Send it another way than the link.');
  const chain = $derived(rules.kind === 'chain');
  const say = (v: number, one: string, many: string) => (v === 1 ? one : `${v} ${many}`);
  const steppers = $derived([
    { key: 'maxStops', label: 'Stops', hint: 'How many people before the reveal', value: rules.maxStops, min: 3, max: 12, spoken: `${rules.maxStops} people` },
    { key: 'maxBranches', label: 'Each passes to', hint: '1 is a straight line, classic Stille Post', value: rules.maxBranches, min: 1, max: 3, spoken: say(rules.maxBranches, 'one person', 'people') },
    { key: 'budget', label: 'Words to change', hint: 'How many words each person may swap', value: draft.budget, min: 1, max: 3, spoken: say(draft.budget, 'one word', 'words') },
  ] as const);
  function step(key: 'maxStops' | 'maxBranches' | 'budget', by: number, min: number, max: number) {
    if (key === 'budget') ondraft({ ...draft, budget: Math.min(max, Math.max(min, draft.budget + by)) });
    else onrules({ ...rules, [key]: Math.min(max, Math.max(min, rules[key] + by)) });
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Back to the meme" onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">How it travels</h1>
    <span class="step">2 of 3</span>
  </div>

  <div class="seg" role="radiogroup" aria-label="Kind">
    <button type="button" role="radio" aria-checked={chain} onclick={() => onrules({ ...rules, kind: 'chain' })}>A chain</button>
    <button type="button" role="radio" aria-checked={!chain} onclick={() => onrules({ ...rules, kind: 'postcard' })}>Just send</button>
  </div>

  {#if chain}
    <section class="panel rules" aria-label="Rules of the chain">
      {#each steppers as r (r.key)}
        <div class="rule">
          <div class="txt"><strong>{r.label}</strong><span>{r.hint}</span></div>
          <button type="button" class="pm" aria-label={`Fewer: ${r.label}, now ${r.spoken}`} disabled={r.value <= r.min} onclick={() => step(r.key, -1, r.min, r.max)}>−</button>
          <output aria-live="polite">{r.value}</output>
          <button type="button" class="pm" aria-label={`More: ${r.label}, now ${r.spoken}`} disabled={r.value >= r.max} onclick={() => step(r.key, 1, r.min, r.max)}>+</button>
        </div>
      {/each}
    </section>
    <p class="hint">Each stop also gets <strong>one small touch</strong>. Passing it on unchanged is fine too. At most 100 stops in a whole tree.</p>
  {:else}
    <section class="panel card">
      <strong>A meme postcard</strong>
      <ul>
        <li>Whoever has the link sees your meme exactly as you made it.</li>
        <li>Nobody can change it or pass a new version on.</li>
        <li>Send the same link to one person or to a small group.</li>
      </ul>
    </section>
  {/if}

  <label class="field sign"><span class="soft">Sign it</span>
    <input value={draft.nick} maxlength={NICK_MAX} placeholder="a nickname, or leave it blank" autocomplete="nickname"
      oninput={(e) => ondraft({ ...draft, nick: e.currentTarget.value })} onblur={() => ondraft({ ...draft, nick: tidy(draft.nick) })} /></label>

  <section aria-labelledby="lk" class="links">
    <h2 id="lk" class="label">The link</h2>
    <div role="radiogroup" aria-labelledby="lk">
      {#each LINKS as l (l.kind)}
        <button type="button" role="radio" aria-checked={link.kind === l.kind} class="link" class:on={link.kind === l.kind}
          onclick={() => onlink({ ...link, kind: l.kind, password: l.kind !== 'plain' && !link.password ? suggestPassphrase() : link.password })}>
          <span class="dot" aria-hidden="true"></span><span class="txt"><strong>{l.title}</strong><span>{l.hint}</span></span>
        </button>
      {/each}
    </div>
    {#if link.kind === 'custom'}
      <label class="field lockfield"><span class="soft">Name</span>
        <input value={link.name} maxlength={40} placeholder="kapitaen-hein" autocomplete="off" autocapitalize="none" spellcheck="false"
          aria-describedby="name-hint" oninput={(e) => onlink({ ...link, name: e.currentTarget.value })} /></label>
      <p id="name-hint" class="hint" class:bad={nameProblem && link.name}>{slug ? `…/m/${slug}` : 'Letters, numbers and hyphens, 3 to 32.'}{nameProblem && link.name ? ' — too short or not allowed' : ''}</p>
    {/if}
    {#if link.kind !== 'plain'}
      <div class="field lockfield">
        <label for="lock-pw" class="soft">Password</label>
        <input id="lock-pw" value={link.password} autocomplete="new-password" autocapitalize="none" spellcheck="false"
          aria-describedby="pw-hint" oninput={(e) => onlink({ ...link, password: e.currentTarget.value })} />
        <button type="button" class="chip suggest" onclick={() => onlink({ ...link, password: suggestPassphrase() })}>New</button>
      </div>
      <p id="pw-hint" class="hint" class:bad={pwProblem && pwProblem !== 'empty'} aria-live="polite">{pwHint}</p>
    {/if}
  </section>

  <div class="foot">
    <p class="warn" role={error || blocked ? 'alert' : undefined}>
      {error ?? blocked ?? (offline ? 'You’re offline. It will be locked and sent when you’re back.' : chain ? 'Everyone after you will see your version.' : 'Anyone with the link can open it, for 30 days.')}
    </p>
    <button type="button" class="primary" disabled={busy || blocked !== null || !linkReady} onclick={onmake}>
      <Icon name="lock" size={20} />
      {busy ? 'Locking it…' : offline ? 'Send it when I’m back online' : chain ? 'Lock it and make the first link' : 'Lock it and make the link'}
    </button>
  </div>
</main>

<style>
  .seg { margin-top: 10px; padding: 4px; display: flex; gap: 4px; border-radius: 999px; background: #0e0e12; box-shadow: inset 0 0 0 1px var(--hair); }
  .seg button { flex: 1; min-height: 44px; border: 0; border-radius: 999px; background: transparent; font-size: 15px; font-weight: 800; }
  .seg button[aria-checked='true'] { background: var(--paper); color: var(--black); }
  .rules { margin-top: 12px; }
  .rule { display: flex; align-items: center; gap: 6px; padding: 12px 12px 12px 16px; }
  .rule + .rule { border-top: 1px solid var(--hair); }
  .txt { flex: 1; display: flex; flex-direction: column; gap: 2px; text-align: left; }
  .txt strong { font-size: 16px; }
  .txt span { font-size: 13px; line-height: 1.3; color: var(--mist); }
  .pm { width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); font-size: 22px; font-weight: 700; }
  .pm:disabled { opacity: 0.3; }
  output { width: 34px; text-align: center; font-family: var(--sans); font-size: 24px; font-weight: 800; color: var(--gold); font-variant-numeric: tabular-nums; }
  .hint { margin: 8px 4px 0; font-size: 13px; line-height: 1.4; color: var(--mist); }
  .hint strong { color: var(--paper); }
  .card { margin-top: 12px; padding: 16px; }
  .card strong { font-family: var(--serif); font-size: 24px; }
  .card ul { margin: 10px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; line-height: 1.4; color: #d9d3e9; }
  .sign { margin-top: 12px; }
  .sign .soft { font-size: 14px; font-weight: 700; }
  .links { margin-top: 12px; }
  .links h2 { margin: 0 4px 6px; }
  .links [role='radiogroup'] { display: flex; flex-direction: column; gap: 6px; }
  .link { min-height: 56px; display: flex; align-items: center; gap: 12px; padding: 8px 12px; border: 0; border-radius: 16px; background: var(--card); box-shadow: inset 0 0 0 1px var(--hair); }
  .link.on { background: var(--raised); box-shadow: inset 0 0 0 2px var(--paper); }
  .dot { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--quiet); }
  .on .dot { border: 6px solid var(--paper); }
  .lockfield { margin-top: 8px; }
  .lockfield input { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 15px; }
  .suggest { min-height: 36px; padding: 0 12px; font-size: 13px; }
  .hint { margin: 6px 6px 0; font-size: 12.5px; line-height: 1.35; color: var(--mist); overflow-wrap: anywhere; }
  .hint.bad { color: var(--gold); }
  .warn { margin: 0 4px; font-size: 13px; line-height: 1.4; color: var(--lilac); text-align: center; }
</style>
