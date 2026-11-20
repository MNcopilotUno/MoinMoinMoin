/**
 * The public feed (A8, `.agents/features/domi-feed.md`). Public by design: the meme is sent as
 * plain JSON. Every post is checked here with the strict meme validation, whatever the relay
 * accepted, and one with an uploaded picture is never shown or sent.
 */
import { isPublishable, toMeme, type Meme } from '@moin/meme';
import { newSecret, secretToText, type PublicPost, type Relay } from '@moin/tessera';
import { domi } from '@moin/ui/copy/domi';
import { appBase, contact, today } from './config.js';
import { loadLikes, saveLikes, type Likes } from './db.js';

export interface Post {
  readonly id: string;
  readonly seq: number;
  readonly day: number;
  readonly meme: Meme;
  readonly likes: number;
}

/** A post as the phone will show it, or `null` if it is not a valid public meme. */
export function readPost(p: PublicPost): Post | null {
  try {
    const meme = toMeme(JSON.parse(p.content));
    const likes = Number.isSafeInteger(p.likes) && p.likes >= 0 ? p.likes : 0;
    return isPublishable(meme) ? { id: p.id, seq: p.seq, day: p.day, meme, likes } : null;
  } catch {
    return null;
  }
}

export async function publish(relay: Relay, meme: Meme): Promise<string> {
  if (!isPublishable(meme)) throw new Error('a picture of your own cannot be posted');
  const { id } = await relay.createPost(JSON.stringify(meme));
  return id;
}

/** Newest first; `more` is false when the relay gave a short page. */
export async function page(relay: Relay, before?: number): Promise<{ posts: Post[]; more: boolean; last: number | null }> {
  const { posts } = await relay.listPosts(before);
  return { posts: posts.map(readPost).filter((p): p is Post => p !== null), more: posts.length >= 20, last: posts.at(-1)?.seq ?? null };
}

export async function one(relay: Relay, id: string): Promise<Post | null> {
  return readPost(await relay.getPost(id));
}

/** This phone's likes; tokens older than the posts can live (31 days) are dropped. */
export async function myLikes(): Promise<Likes> {
  const all = await loadLikes();
  const fresh = Object.fromEntries(Object.entries(all).filter(([, v]) => today() - v.day <= 31));
  if (Object.keys(fresh).length !== Object.keys(all).length) await saveLikes(fresh);
  return fresh;
}

/**
 * A9: say Moin to a post, or take it back. The token is made the first time and kept, so the same
 * phone counts once and only it can take its like back. Returns the new count and this phone's likes.
 */
export async function toggleLike(relay: Relay, id: string, on: boolean): Promise<{ likes: number; mine: Likes }> {
  const all = await loadLikes();
  const token = all[id]?.token ?? secretToText(newSecret());
  const { likes } = await relay.likePost(id, token, on);
  const mine: Likes = on ? { ...all, [id]: { token, day: today() } } : Object.fromEntries(Object.entries(all).filter(([k]) => k !== id));
  await saveLikes(mine);
  return { likes, mine };
}

export const postLink = (id: string): string => `${appBase}p/${id}`;

/** DSA Art. 16: the post's exact link, the reason, a name, good faith — from the person's mail app. */
export function postReportHref(id: string): string | null {
  if (!contact) return null;
  return `mailto:${contact}?subject=${encodeURIComponent(domi.feed.reportSubject)}&body=${encodeURIComponent(domi.feed.reportBody(postLink(id)))}`;
}

/** `…/domi/p/<id>` (or `?p=<id>` after the 404 page): the post a shared link names. */
export function postIdIn(url: URL): string | null {
  const m = /\/p\/([A-Za-z0-9_-]{8})\/?$/.exec(url.pathname);
  const q = url.searchParams.get('p');
  return m ? m[1]! : q && /^[A-Za-z0-9_-]{8}$/.test(q) ? q : null;
}
