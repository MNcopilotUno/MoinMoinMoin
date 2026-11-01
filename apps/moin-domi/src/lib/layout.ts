import type { Node } from './flow.js';

/** A tidy tree: leaves side by side in the order they happened, parents over their children. */
export function layout(nodes: readonly Node[]): { x: Map<string, number>; width: number } {
  const kids = new Map<string | null, Node[]>();
  for (const n of [...nodes].sort((a, b) => a.seq - b.seq)) kids.set(n.parentId, [...(kids.get(n.parentId) ?? []), n]);
  const x = new Map<string, number>();
  let next = 0;
  const place = (n: Node): number => {
    const children = kids.get(n.hopId) ?? [];
    const v = children.length === 0 ? next++ : children.map(place).reduce((a, b) => a + b, 0) / children.length;
    x.set(n.hopId, v);
    return v;
  };
  const ids = new Set(nodes.map((n) => n.hopId));
  // Roots, and orphans whose parent is missing (unreadable boxes still have a place).
  for (const n of nodes) if (n.parentId === null || !ids.has(n.parentId)) if (!x.has(n.hopId)) place(n);
  return { x, width: Math.max(1, next) };
}
