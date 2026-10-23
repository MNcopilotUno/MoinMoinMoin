import { Ajv } from 'ajv';
import type { ErrorObject } from 'ajv';
import { BoardError, createGame, solve, MAX_PEOPLE, MAX_SIZE } from '@moin/core';
import type { Solution } from '@moin/core';
import schema from '../level.schema.json' with { type: 'json' };
import type { Level } from './level.generated.js';

export const SUPPORTED_MAJOR = 1;

export interface Report {
  readonly ok: boolean;
  /** Each error names the problem (CLAUDE.md §6). */
  readonly errors: readonly string[];
  /** R10 and CLAUDE.md §8: worth a look, not a failure. */
  readonly warnings: readonly string[];
  readonly solution?: Solution;
}

export interface ValidateOptions {
  /** Tutorial levels may have many minimum solutions and many par-first taps. */
  readonly tutorial?: boolean;
}

const ajv = new Ajv({ allErrors: true, discriminator: true, strict: false });
const checkSchema = ajv.compile<Level>(schema);

const at = (path: string) =>
  path.replace(/^\/cells\/(\d+)/, 'cells[$1]').replace(/^\//, '').replace(/\//g, '.') || 'level';

function describe(error: ErrorObject, data: unknown): string {
  const where = at(error.instancePath);
  const field = error.instancePath.split('/').pop();
  switch (error.keyword) {
    case 'discriminator': {
      const value = (error.params as { tagValue?: unknown }).tagValue;
      return `unknown kind ${JSON.stringify(value)} at ${where} (expected person, seagull or fender)`;
    }
    case 'required': {
      const missing = (error.params as { missingProperty: string }).missingProperty;
      const index = /^\/cells\/(\d+)$/.exec(error.instancePath)?.[1];
      const cell = index === undefined ? undefined : (data as { cells?: { kind?: string }[] }).cells?.[Number(index)];
      const what = cell?.kind === 'person' ? 'a person' : cell?.kind === 'fender' ? 'a fender' : cell?.kind ?? 'the level';
      return `missing "${missing}" on ${what} at ${where}`;
    }
    case 'enum':
    case 'type':
      if (field === 'needs') return `needs outside 1–2 at ${where}: got ${JSON.stringify(valueAt(data, error.instancePath))}`;
      return `${where} ${error.message ?? 'is invalid'}`;
    case 'pattern':
      if (field === 'formatVersion') {
        return `formatVersion ${JSON.stringify(valueAt(data, error.instancePath))} is not MAJOR.MINOR.PATCH`;
      }
      return `${where} ${error.message ?? 'is invalid'}`;
    default:
      return `${where} ${error.message ?? 'is invalid'}`;
  }
}

function valueAt(data: unknown, pointer: string): unknown {
  return pointer
    .split('/')
    .slice(1)
    .reduce<unknown>((v, key) => (v !== null && typeof v === 'object' ? (v as Record<string, unknown>)[key] : undefined), data);
}

function boardProblem(error: BoardError): string {
  const m = error.message;
  if (/^0 people/.test(m)) return 'unsolvable level: there is nobody to make smile (0 people)';
  if (/people; a level has/.test(m)) return `more than ${MAX_PEOPLE} people: ${m}`;
  if (/larger than/.test(m)) return `grid larger than ${MAX_SIZE} × ${MAX_SIZE}: ${m}`;
  if (/outside the/.test(m)) return `cell out of bounds: ${m}`;
  if (/two cells on square/.test(m)) return `overlapping cells: ${m}`;
  return m;
}

/** Schema, board rules and the solver on one level (CLAUDE.md §6). */
export function validateLevel(data: unknown, options: ValidateOptions = {}): Report {
  if (!checkSchema(data)) {
    const errors = [...new Set((checkSchema.errors ?? []).map((e) => describe(e, data)))];
    return { ok: false, errors, warnings: [] };
  }
  const level = data;
  const major = Number(level.formatVersion.split('.')[0]);
  if (major !== SUPPORTED_MAJOR) {
    return { ok: false, errors: [`unsupported formatVersion ${level.formatVersion} (this build reads ${SUPPORTED_MAJOR}.x)`], warnings: [] };
  }
  let game;
  try {
    game = createGame(level);
  } catch (error) {
    if (error instanceof BoardError) return { ok: false, errors: [boardProblem(error)], warnings: [] };
    throw error;
  }
  const solution = solve(game);
  if (solution === null) return { ok: false, errors: ['unsolvable level: the solver found no way to make everyone smile'], warnings: [] };

  const errors: string[] = [];
  const warnings: string[] = [];
  if (level.par !== solution.par) {
    errors.push(`wrong par: the file says ${level.par}, the solver says ${solution.par}`);
  }
  if (!options.tutorial) {
    if (solution.minimumSolutions > 3) {
      warnings.push(`R10: ${solution.minimumSolutions}${solution.capped ? '+' : ''} minimum solutions (more than 3)`);
    }
    if (solution.firstTapsToPar * 2 > solution.people) {
      warnings.push(`random tapping: ${solution.firstTapsToPar} of ${solution.people} first taps can still finish at par`);
    }
  }
  return { ok: errors.length === 0, errors, warnings, solution };
}
