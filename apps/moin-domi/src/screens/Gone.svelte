<script lang="ts">
  import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
  import SeagullSprite from '@moin/ui/SeagullSprite.svelte';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { title: string; text: string; onnew: () => void; onhome: () => void }
  let { title, text, onnew, onhome }: Props = $props();
</script>

<main class="screen gone">
  <img class="sky" src={lighthouse} alt={domi.gone.art} />
  <div class="gull" aria-hidden="true"><SeagullSprite /></div>
  <section>
    <h1 tabindex="-1">{title}</h1>
    <p class="t">{text}</p>
    <p class="aside">{domi.gone.aside}</p>
  </section>
  <div class="foot">
    <button type="button" class="primary" onclick={onnew}>{domi.common.startNewChain}</button>
    <button type="button" class="ghost" onclick={onhome}>{domi.common.home}</button>
  </div>
</main>

<style>
  .gone { padding-top: 0; }
  .sky { position: absolute; left: 0; top: 0; width: 100%; height: 470px; object-fit: cover; object-position: center 40%; opacity: 0.7; -webkit-mask-image: linear-gradient(#000 50%, transparent); mask-image: linear-gradient(#000 50%, transparent); animation: none; }
  .gull { position: absolute; right: 28px; top: 300px; width: 110px; transform: scaleX(-1); filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.7)); }
  section { position: relative; margin-top: 420px; padding: 0 8px; }
  h1 { font-family: var(--serif); font-weight: 700; font-size: 44px; line-height: 0.95; }
  .t { margin-top: 12px; font-size: 16px; line-height: 1.45; color: #d9d3e9; }
  .aside { margin-top: 10px; font-size: 14px; color: var(--mist); font-style: italic; }
  .foot { position: relative; }
</style>
