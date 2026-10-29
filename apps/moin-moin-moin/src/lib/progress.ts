/**
 * Progress and settings, in IndexedDB — the only storage the app uses (CLAUDE.md §7: no
 * localStorage, no cookies). If IndexedDB is unavailable (some private modes) progress lives in
 * memory for the session and play continues.
 */
const DB_NAME = 'moin';
const STORE = 'kv';
const VERSION = 1;

export interface LevelProgress {
  readonly bestTaps: number;
}

export type ThemeSetting = 'auto' | 'light' | 'dark';

/** The settings sheet (.agents/features/settings.md); one IndexedDB key each. */
export interface Settings {
  /** `null` until the player touches the sound switch (sound starts after the first tap). */
  readonly muted: boolean | null;
  /** Morning, night, or follow the phone. */
  readonly theme: ThemeSetting;
  /** Master volume, 0–100. */
  readonly volume: number;
  readonly haptics: boolean;
  readonly narrator: boolean;
  /** `null` follows the phone's reduce-motion setting until the player switches it. */
  readonly calm: boolean | null;
}

export const defaultSettings: Settings = { muted: null, theme: 'auto', volume: 100, haptics: true, narrator: true, calm: null };

export interface Progress extends Settings {
  readonly levels: Readonly<Record<string, LevelProgress>>;
}

const memory = new Map<string, unknown>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function get<T>(key: string): Promise<T | undefined> {
  const db = await open();
  if (!db) return memory.get(key) as T | undefined;
  return new Promise((resolve) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => resolve(memory.get(key) as T | undefined);
  });
}

async function set(key: string, value: unknown): Promise<void> {
  memory.set(key, value);
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

const bool = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);

export async function loadProgress(): Promise<Progress> {
  const [levels, muted, theme, volume, haptics, narrator, calm] = await Promise.all([
    get<Record<string, LevelProgress>>('levels'),
    get<unknown>('muted'),
    get<unknown>('theme'),
    get<unknown>('volume'),
    get<unknown>('haptics'),
    get<unknown>('narrator'),
    get<unknown>('calm'),
  ]);
  return {
    levels: levels ?? {},
    muted: bool(muted),
    theme: theme === 'light' || theme === 'dark' ? theme : 'auto',
    volume: typeof volume === 'number' && volume >= 0 && volume <= 100 ? Math.round(volume) : defaultSettings.volume,
    haptics: bool(haptics) ?? defaultSettings.haptics,
    narrator: bool(narrator) ?? defaultSettings.narrator,
    calm: bool(calm),
  };
}

/** Record a solve; keeps the best tap count. Returns the updated record. */
export async function saveSolved(id: string, taps: number): Promise<Record<string, LevelProgress>> {
  const levels = { ...((await get<Record<string, LevelProgress>>('levels')) ?? {}) };
  const best = levels[id]?.bestTaps;
  levels[id] = { bestTaps: best === undefined ? taps : Math.min(best, taps) };
  await set('levels', levels);
  return levels;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await set(key, value);
}

/** Start over: forget every solved level and best tap count. Settings stay. */
export async function clearLevels(): Promise<void> {
  await set('levels', {});
}
