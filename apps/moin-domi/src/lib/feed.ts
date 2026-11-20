/**
 * The public feed (A8, `.agents/features/domi-feed.md`). Public by design: the meme is sent as
 * plain JSON. Every post is checked here with the strict meme validation, whatever the relay
 * accepted, and one with an uploaded picture is never shown or sent.
 */
import { isPublishable, toMeme, type Meme } from '@moin/meme';
import type { PublicPost, Relay } from '@moin/tessera';
import { domi } from '@moin/ui/copy/domi';
import { appBase, contact } from './config.js';

export interface Post {
  readonly id: string;
  readonly seq: number;
  readonly day: number;
  readonly meme: Meme;
}

/** A post as the phone will show it, or `null` if it is not a valid public meme. */
export function readPost(p: PublicPost): Post | null {
  try {
    const meme = toMeme(JSON.parse(p.content));
    return isPublishable(meme) ? { id: p.id, seq: p.seq, day: p.day, meme } : null;
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
