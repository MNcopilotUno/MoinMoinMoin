/**
 * Everything Moin Domi keeps, in IndexedDB on this phone only (CLAUDE.md §7). One record per
 * chain, and the settings. If IndexedDB is unavailable it lives in memory for the session.
 */
import { toMeme, type Meme } from '@moin/meme';

export type Status = 'your-turn' | 'travelling' | 'finale' | 'postcard-in' | 'postcard-out' | 'last-stop' | 'full' | 'gone';

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
  /** The tree as last read, for offline (§6): shown with the day it was seen. */
  readonly snapshot?: Snapshot;
}

export interface SnapshotNode {
  readonly hopId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly seq: number;
  readonly day: number;
  readonly meme: Meme | null;
}

export interface Snapshot {
  readonly nodes: readonly SnapshotNode[];
  readonly maxStops: number;
  readonly expiresDay: number;
  readonly seen: number;
}

/** Something made offline, waiting for the relay (§6: "create works offline and queues"). */
export interface Outgoing {
  readonly id: string;
  readonly kind: 'start' | 'turn';
  readonly meme: Meme;
  readonly rules?: { readonly kind: 'chain' | 'postcard'; readonly maxStops: number; readonly maxBranches: number };
  /** The hop received, for a turn. */
  readonly parent?: Item;
  readonly created: number;
  /** Set when the relay refused it for good (e.g. someone else took the stop). */
  readonly problem?: string;
}

export interface Settings {
  readonly rememberNick: boolean;
  readonly nick: string;
  readonly sound: boolean;
  readonly calm: boolean | null;
}

export const defaultSettings: Settings = { rememberNick: true, nick: '', sound: false, calm: null };

const memory = { items: new Map<string, Item>(), outbox: new Map<string, Outgoing>(), settings: defaultSettings };
let dbPromise: Promise<IDBDatabase | null> | null = null;

function open(): Promise<IDBDatabase | null> {
  dbPromise ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open('moin-domi', 2);
      req.onupgradeneeded = (event) => {
        if (event.oldVersion < 1) {
          req.result.createObjectStore('items', { keyPath: 'chainId' });
          req.result.createObjectStore('kv');
        }
        if (event.oldVersion < 2) req.result.createObjectStore('outbox', { keyPath: 'id' });
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

/**
 * Values from Svelte state are Proxies, which IndexedDB cannot clone: the write fails and, inside
 * `run`, fails silently (.agents/lessons/code.md). Everything stored is plain JSON data anyway.
 */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

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
    const snapshot = item.snapshot
      ? { ...item.snapshot, nodes: item.snapshot.nodes.map((n) => ({ ...n, meme: n.meme ? toMeme(n.meme) : null })) }
      : undefined;
    return { ...item, meme: toMeme(item.meme), ...(snapshot ? { snapshot } : {}) };
  } catch {
    return null;
  }
}

function validOut(value: unknown): Outgoing | null {
  if (typeof value !== 'object' || value === null) return null;
  try {
    const o = value as Outgoing;
    if (o.kind !== 'start' && o.kind !== 'turn') return null;
    if (o.kind === 'turn' && !valid(o.parent)) return null;
    return { ...o, meme: toMeme(o.meme) };
  } catch {
    return null;
  }
}

export async function listOutbox(): Promise<Outgoing[]> {
  const db = await open();
  const all = db ? ((await run('outbox', 'readonly', (s) => s.getAll())) ?? []) : [...memory.outbox.values()];
  return all.map(validOut).filter((x): x is Outgoing => x !== null).sort((a, b) => a.created - b.created);
}

export async function putOutgoing(o: Outgoing): Promise<void> {
  const db = await open();
  if (db) await run('outbox', 'readwrite', (s) => s.put(plain(o)));
  else memory.outbox.set(o.id, plain(o));
}

export async function removeOutgoing(id: string): Promise<void> {
  const db = await open();
  if (db) await run('outbox', 'readwrite', (s) => s.delete(id));
  else memory.outbox.delete(id);
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
  if (db) await run('items', 'readwrite', (s) => s.put(plain(item)));
  else memory.items.set(item.chainId, plain(item));
}

export async function removeItem(chainId: string): Promise<void> {
  const db = await open();
  if (db) await run('items', 'readwrite', (s) => s.delete(chainId));
  else memory.items.delete(chainId);
}

export async function loadSettings(): Promise<Settings> {
  const db = await open();
  const stored = db ? await run<Partial<Settings>>('kv', 'readonly', (s) => s.get('settings')) : memory.settings;
  return { ...defaultSettings, ...(stored ?? {}) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await open();
  if (db) await run('kv', 'readwrite', (s) => s.put(plain(settings), 'settings'));
  else memory.settings = plain(settings);
}

/** Settings → "Forget everything on this phone". */
export async function forgetEverything(): Promise<void> {
  const db = await open();
  memory.items.clear();
  memory.outbox.clear();
  memory.settings = defaultSettings;
  if (db) {
    await run('items', 'readwrite', (s) => s.clear());
    await run('outbox', 'readwrite', (s) => s.clear());
    await run('kv', 'readwrite', (s) => s.clear());
  }
}
