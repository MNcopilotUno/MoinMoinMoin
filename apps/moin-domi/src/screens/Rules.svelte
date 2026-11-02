<script lang="ts">
  import { NICK_MAX, tidy, type Meme } from '@moin/meme';
  import Icon from '../components/Icon.svelte';
  import { passwordProblem, slugify, isCustomName } from '@moin/tessera';
  import type { LinkChoice, Rules } from '../lib/flow.js';
  import { suggestPassphrase } from '../lib/passphrase.js';
  import { domi } from '@moin/ui/copy/domi';

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
  const t = domi.rules;
  const LINKS = (['plain', 'password', 'custom'] as const).map((kind) => ({ kind, ...t.links[kind] }));
  const slug = $derived(slugify(link.name));
  const pwProblem = $derived(link.kind === 'plain' ? null : link.password === '' ? 'empty' : passwordProblem(link.password));
  const nameProblem = $derived(link.kind !== 'custom' ? null : !isCustomName(slug) ? 'bad' : null);
  const linkReady = $derived(pwProblem === null && nameProblem === null);
  const pwHint = $derived(pwProblem === 'common' ? domi.lock.tooCommon : pwProblem === 'too-short' ? domi.lock.tooShort : pwProblem === 'empty' ? t.pwEmpty : t.pwGood);
  const chain = $derived(rules.kind === 'chain');
  const steppers = $derived([
    { key: 'maxStops', label: t.stops.label, hint: t.stops.hint, value: rules.maxStops, min: 3, max: 12, spoken: t.stops.spoken(rules.maxStops) },
    { key: 'maxBranches', label: t.branches.label, hint: t.branches.hint, value: rules.maxBranches, min: 1, max: 3, spoken: t.branches.spoken(rules.maxBranches) },
    { key: 'budget', label: t.budget.label, hint: t.budget.hint, value: draft.budget, min: 1, max: 3, spoken: t.budget.spoken(draft.budget) },
  ] as const);
  function step(key: 'maxStops' | 'maxBranches' | 'budget', by: number, min: number, max: number) {
    if (key === 'budget') ondraft({ ...draft, budget: Math.min(max, Math.max(min, draft.budget + by)) });
    else onrules({ ...rules, [key]: Math.min(max, Math.max(min, rules[key] + by)) });
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={t.back} onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">{t.title}</h1>
    <span class="step">{domi.common.step(2)}</span>
  </div>

  <div class="seg" role="radiogroup" aria-label={t.kind}>
    <button type="button" role="radio" aria-checked={chain} onclick={() => onrules({ ...rules, kind: 'chain' })}>{t.chain}</button>
    <button type="button" role="radio" aria-checked={!chain} onclick={() => onrules({ ...rules, kind: 'postcard' })}>{t.postcard}</button>
  </div>

  {#if chain}
    <section class="panel rules" aria-label={t.rules}>
      {#each steppers as r (r.key)}
        <div class="rule">
          <div class="txt"><strong>{r.label}</strong><span>{r.hint}</span></div>
          <button type="button" class="pm" aria-label={t.fewer(r.label, r.spoken)} disabled={r.value <= r.min} onclick={() => step(r.key, -1, r.min, r.max)}>−</button>
          <output aria-live="polite">{r.value}</output>
          <button type="button" class="pm" aria-label={t.more(r.label, r.spoken)} disabled={r.value >= r.max} onclick={() => step(r.key, 1, r.min, r.max)}>+</button>
        </div>
      {/each}
    </section>
    <p class="hint">{t.touchHint[0]}<strong>{t.touchHint[1]}</strong>{t.touchHint[2]}</p>
  {:else}
    <section class="panel card">
      <strong>{t.postcardTitle}</strong>
      <ul>
        {#each t.postcardPoints as point (point)}<li>{point}</li>{/each}
      </ul>
    </section>
  {/if}

  <label class="field sign"><span class="soft">{domi.common.signIt}</span>
    <input value={draft.nick} maxlength={NICK_MAX} placeholder={t.nickPlaceholder} autocomplete="nickname"
      oninput={(e) => ondraft({ ...draft, nick: e.currentTarget.value })} onblur={() => ondraft({ ...draft, nick: tidy(draft.nick) })} /></label>

  <section aria-labelledby="lk" class="links">
    <h2 id="lk" class="label">{t.link}</h2>
    <div role="radiogroup" aria-labelledby="lk">
      {#each LINKS as l (l.kind)}
        <button type="button" role="radio" aria-checked={link.kind === l.kind} class="link" class:on={link.kind === l.kind}
          onclick={() => onlink({ ...link, kind: l.kind, password: l.kind !== 'plain' && !link.password ? suggestPassphrase() : link.password })}>
          <span class="dot" aria-hidden="true"></span><span class="txt"><strong>{l.title}</strong><span>{l.hint}</span></span>
        </button>
      {/each}
    </div>
    {#if link.kind === 'custom'}
      <label class="field lockfield"><span class="soft">{domi.common.name}</span>
        <input value={link.name} maxlength={40} placeholder={t.namePlaceholder} autocomplete="off" autocapitalize="none" spellcheck="false"
          aria-describedby="name-hint" oninput={(e) => onlink({ ...link, name: e.currentTarget.value })} /></label>
      <p id="name-hint" class="hint" class:bad={nameProblem && link.name}>{t.nameHint(slug, Boolean(nameProblem && link.name))}</p>
    {/if}
    {#if link.kind !== 'plain'}
      <div class="field lockfield">
        <label for="lock-pw" class="soft">{domi.common.password}</label>
        <input id="lock-pw" value={link.password} autocomplete="new-password" autocapitalize="none" spellcheck="false"
          aria-describedby="pw-hint" oninput={(e) => onlink({ ...link, password: e.currentTarget.value })} />
        <button type="button" class="chip suggest" onclick={() => onlink({ ...link, password: suggestPassphrase() })}>{domi.common.suggest}</button>
      </div>
      <p id="pw-hint" class="hint" class:bad={pwProblem && pwProblem !== 'empty'} aria-live="polite">{pwHint}</p>
    {/if}
  </section>

  <div class="foot">
    <p class="warn" role={error || blocked ? 'alert' : undefined}>
      {error ?? blocked ?? (offline ? t.offline : chain ? t.chainWarn : t.postcardWarn)}
    </p>
    <button type="button" class="primary" disabled={busy || blocked !== null || !linkReady} onclick={onmake}>
      <Icon name="lock" size={20} />
      {busy ? domi.common.locking : offline ? t.sendLater : chain ? t.makeChain : t.makePostcard}
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
