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

export interface Progress {
  readonly levels: Readonly<Record<string, LevelProgress>>;
  /** `null` until the player touches the mute toggle (sound starts after the first tap). */
  readonly muted: boolean | null;
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

export async function loadProgress(): Promise<Progress> {
  const [levels, muted] = await Promise.all([
    get<Record<string, LevelProgress>>('levels'),
    get<boolean>('muted'),
  ]);
  return { levels: levels ?? {}, muted: muted ?? null };
}

/** Record a solve; keeps the best tap count. Returns the updated record. */
export async function saveSolved(id: string, taps: number): Promise<Record<string, LevelProgress>> {
  const levels = { ...((await get<Record<string, LevelProgress>>('levels')) ?? {}) };
  const best = levels[id]?.bestTaps;
  levels[id] = { bestTaps: best === undefined ? taps : Math.min(best, taps) };
  await set('levels', levels);
  return levels;
}

export async function saveMuted(muted: boolean): Promise<void> {
  await set('muted', muted);
}
