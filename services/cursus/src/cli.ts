import { openStore } from './store.ts';

// Operator commands. `takedown <hopId|chainId>`: deletes the whole chain (DSA Art. 6, dsa.md).
const [command, id] = process.argv.slice(2);
if (command !== 'takedown' || !id) {
  console.error('usage: node src/cli.ts takedown <hopId|chainId>');
  process.exit(2);
}
const store = openStore(process.env.CURSUS_DB ?? 'cursus.sqlite');
const removed = store.takedown(id);
store.close();
console.log(removed ? `cursus: chain of ${id} deleted` : `cursus: nothing found for ${id}`);
process.exit(removed ? 0 : 1);
