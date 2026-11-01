/**
 * Everything Moin Domi keeps, in IndexedDB on this phone only (CLAUDE.md §7). One record per
 * chain, and the settings. If IndexedDB is unavailable it lives in memory for the session.
 */
import { toMeme, type Meme } from '@moin/meme';

export type Status = 'your-turn' | 'travelling' | 'finale' | 'postcard-in' | 'postcard-out' | 'last-stop' | 'full';

export interface Item {
  readonly chainId: string;
  readonly kind: 'chain' | 'postcard';
  readonly status: Status;
  /** The hop this phone holds a key for: received (your turn) or your own (after it). */
  readonly hopId: string;
  readonly parentId: string | null;
  readonly secret: string;
  /** `T`, once you have taken a turn or started the chain. */
  readonly chainSecret: string | null;
  readonly depth: number;
  readonly maxStops: number;
  readonly maxBranches: number;
  readonly meme: Meme;
  readonly expiresDay: number;
  readonly updated: number;
  readonly mine: boolean;
}

export interface Settings {
  readonly rememberNick: boolean;
  readonly nick: string;
  readonly sound: boolean;
  readonly calm: boolean | null;
}

export const defaultSettings: Settings = { rememberNick: true, nick: '', sound: false, calm: null };

const memory = { items: new Map<string, Item>(), settings: defaultSettings };
let dbPromise: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open('moin-domi', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('items', { keyPath: 'chainId' });
        req.result.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function run<T>(store: string, mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return open().then((db) => new Promise((resolve) => {
    if (!db) return resolve(undefined);
    try {
      const req = f(db.transaction(store, mode).objectStore(store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  }));
}

/** Stored values are re-checked: a record is dropped rather than trusted if its meme is not valid. */
function valid(value: unknown): Item | null {
  if (typeof value !== 'object' || value === null) return null;
  try {
    const item = value as Item;
    return { ...item, meme: toMeme(item.meme) };
  } catch {
    return null;
  }
}

export async function listItems(): Promise<Item[]> {
  const db = await open();
  const all = db ? ((await run('items', 'readonly', (s) => s.getAll())) ?? []) : [...memory.items.values()];
  return all.map(valid).filter((x): x is Item => x !== null).sort((a, b) => b.updated - a.updated);
}

export async function getItem(chainId: string): Promise<Item | null> {
  const db = await open();
  return valid(db ? await run('items', 'readonly', (s) => s.get(chainId)) : memory.items.get(chainId));
}

export async function putItem(item: Item): Promise<void> {
  const db = await open();
  if (db) await run('items', 'readwrite', (s) => s.put(item));
  else memory.items.set(item.chainId, item);
}

export async function loadSettings(): Promise<Settings> {
  const db = await open();
  const stored = db ? await run<Partial<Settings>>('kv', 'readonly', (s) => s.get('settings')) : memory.settings;
  return { ...defaultSettings, ...(stored ?? {}) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await open();
  if (db) await run('kv', 'readwrite', (s) => s.put(settings, 'settings'));
  else memory.settings = settings;
}

/** Settings → "Forget everything on this phone". */
export async function forgetEverything(): Promise<void> {
  const db = await open();
  memory.items.clear();
  memory.settings = defaultSettings;
  if (db) {
    await run('items', 'readwrite', (s) => s.clear());
    await run('kv', 'readwrite', (s) => s.clear());
  }
}
