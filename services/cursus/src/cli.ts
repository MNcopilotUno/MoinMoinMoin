import { openStore } from './store.ts';

// Operator commands (DSA Art. 6, dsa.md):
//   takedown <hopId|chainId|lockName|postId>  deletes the whole chain, or the public post;
//   hide <postId>                             the post stops being shown in the feed and at its link.
const [command, id] = process.argv.slice(2);
if ((command !== 'takedown' && command !== 'hide') || !id) {
  console.error('usage: node src/cli.ts takedown <hopId|chainId|lockName|postId>\n       node src/cli.ts hide <postId>');
  process.exit(2);
}
const store = openStore(process.env.CURSUS_DB ?? 'cursus.sqlite');
const done = command === 'hide' ? store.hidePost(id) : store.takedown(id);
store.close();
console.log(done ? `cursus: ${command === 'hide' ? 'post hidden' : 'deleted'}: ${id}` : `cursus: nothing found for ${id}`);
process.exit(done ? 0 : 1);
