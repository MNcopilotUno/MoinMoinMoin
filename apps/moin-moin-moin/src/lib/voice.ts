/**
 * The narrator's voice (`.agents/features/narrator-voice.md`): the phone's own speech synthesis,
 * on-device voices only (`localService`) — never a cloud voice that would send the line away.
 */
function synth(): SpeechSynthesis | null {
  return typeof speechSynthesis === 'undefined' ? null : speechSynthesis;
}

export function localVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const local = s.getVoices().filter((v) => v.localService);
  return local.find((v) => v.lang === 'en-GB') ?? local.find((v) => v.lang.startsWith('en')) ?? null;
}

/** Calls `f` when the list of voices arrives (it loads late on some browsers). */
export function onVoices(f: () => void): () => void {
  const s = synth();
  if (!s) return () => {};
  s.addEventListener('voiceschanged', f);
  return () => s.removeEventListener('voiceschanged', f);
}

export function speak(text: string, volume: number): void {
  const s = synth();
  const voice = localVoice();
  if (!s || !voice) return;
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.95;
  u.pitch = 0.9;
  u.volume = Math.max(0, Math.min(1, volume / 100));
  s.speak(u);
}

export function hush(): void {
  synth()?.cancel();
}
