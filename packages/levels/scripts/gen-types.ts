// Generate src/level.generated.ts from level.schema.json (CLAUDE.md §7: level types come from the schema).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';

export async function generate(): Promise<string> {
  const schemaPath = fileURLToPath(new URL('../level.schema.json', import.meta.url));
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  return compile(schema, 'Level', {
    bannerComment: '/* Generated from level.schema.json by `pnpm --filter @moin/levels gen:types`. Do not edit. */',
    additionalProperties: false,
    style: { singleQuote: true },
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = fileURLToPath(new URL('../src/level.generated.ts', import.meta.url));
  writeFileSync(out, await generate());
  console.log(`wrote ${out}`);
}
