import { expect, test, type Page } from '@playwright/test';
import { freshStart, solveCurrent } from './helpers';

// The narrator's voice (.agents/features/narrator-voice.md). Speech is stubbed in the page: headless
// browsers have no voices, and the test must see what *would* be said, and with which voice.
type Voice = { name: string; lang: string; localService: boolean };

async function stubSpeech(page: Page, voices: Voice[]) {
  await page.addInitScript((list: Voice[]) => {
    const spoken: { text: string; voice: string; volume: number }[] = [];
    let cancels = 0;
    (window as unknown as { __speech: () => unknown }).__speech = () => ({ spoken, cancels });
    class Utterance { text: string; voice: Voice | null = null; lang = ''; rate = 1; pitch = 1; volume = 1; constructor(t: string) { this.text = t; } }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => list,
        speak: (u: Utterance) => spoken.push({ text: u.text, voice: u.voice?.name ?? '', volume: u.volume }),
        cancel: () => { cancels += 1; },
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  }, voices);
}

const speech = (page: Page) => page.evaluate(() => (window as unknown as { __speech: () => { spoken: { text: string; voice: string; volume: number }[]; cancels: number } }).__speech());

async function settings(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
  return page.getByRole('dialog', { name: 'Settings' });
}

const VOICES: Voice[] = [
  { name: 'Cloud English', lang: 'en-GB', localService: false },
  { name: 'Local German', lang: 'de-DE', localService: true },
  { name: 'Local British', lang: 'en-GB', localService: true },
];

test('off by default: the narrator is read, never heard', async ({ page }) => {
  await stubSpeech(page, VOICES);
  await freshStart(page);
  await solveCurrent(page, 0);
  expect((await speech(page)).spoken).toEqual([]);
});

test('switched on: the next line is spoken in an on-device English voice, never a cloud one', async ({ page }) => {
  await stubSpeech(page, VOICES);
  await freshStart(page);
  const sheet = await settings(page);
  const voice = sheet.getByRole('switch', { name: /^Read it aloud/ });
  await expect(voice).toHaveAttribute('aria-checked', 'false');
  await voice.click();
  await expect(voice).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await solveCurrent(page, 0);
  const { spoken } = await speech(page);
  expect(spoken.length).toBeGreaterThan(0);
  expect(spoken.every((s) => s.voice === 'Local British')).toBe(true);
  expect(spoken.every((s) => s.text.length > 0 && s.volume > 0)).toBe(true);
});

test('muted means silent, also for the narrator', async ({ page }) => {
  await stubSpeech(page, VOICES);
  await freshStart(page);
  const sheet = await settings(page);
  await sheet.getByRole('switch', { name: /^Read it aloud/ }).click();
  const sound = sheet.getByRole('switch', { name: /^Sound/ });
  if ((await sound.getAttribute('aria-checked')) === 'true') await sound.click();
  await expect(sound).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press('Escape');
  await solveCurrent(page, 0);
  expect((await speech(page)).spoken).toEqual([]);
});

test('no on-device voice: the switch is off, disabled, and says why', async ({ page }) => {
  await stubSpeech(page, [{ name: 'Cloud English', lang: 'en-GB', localService: false }]);
  await freshStart(page);
  const sheet = await settings(page);
  const voice = sheet.getByRole('switch', { name: /^Read it aloud/ });
  await expect(voice).toBeDisabled();
  await expect(voice).toHaveAttribute('aria-checked', 'false');
  await expect(voice).toHaveAccessibleDescription('This phone has no voice that works without the internet');
  await sheet.getByRole('switch', { name: /^Narrator/ }).click();
  await expect(voice).toHaveAccessibleDescription('Turn the narrator on first');
});
