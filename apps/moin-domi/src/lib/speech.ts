/** D9: say it out loud with this phone's own voice only (`localService`), never a cloud voice. */
export function localVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices().filter((v) => v.localService);
  return voices.find((v) => v.lang.startsWith('de')) ?? voices.find((v) => v.lang.startsWith('en')) ?? voices[0] ?? null;
}

export function onVoices(f: () => void): () => void {
  if (typeof speechSynthesis === 'undefined') return () => {};
  speechSynthesis.addEventListener('voiceschanged', f);
  return () => speechSynthesis.removeEventListener('voiceschanged', f);
}

export function say(text: string): boolean {
  const voice = localVoice();
  if (!voice) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  speechSynthesis.speak(u);
  return true;
}
