/**
 * The narrator's lines (CLAUDE.md §7): one sentence each, dry northern humour.
 * Placeholder set for Phase 1 (~20 lines + one intro per level). Data only.
 */
export type Trigger =
  | 'levelStart'
  | 'longChain'
  | 'stolen'
  | 'waiting'
  | 'edge'
  | 'solvedPar'
  | 'solvedOver'
  | 'undo'
  | 'restart';

export interface Line {
  readonly id: string;
  readonly trigger: Trigger;
  /** Only for `levelStart`: the level this intro belongs to. */
  readonly levelId?: string;
  readonly text: string;
}

export const lines: readonly Line[] = [
  { id: 'intro-01', trigger: 'levelStart', levelId: 'harbour-01', text: 'Foggy morning in the harbour, and nobody has said Moin yet.' },
  { id: 'intro-02', trigger: 'levelStart', levelId: 'harbour-02', text: 'Folk here look where they are facing, and not an inch further.' },
  { id: 'intro-03', trigger: 'levelStart', levelId: 'harbour-03', text: 'Two crowds, one harbour, zero conversation.' },
  { id: 'intro-04', trigger: 'levelStart', levelId: 'harbour-04', text: 'Mind the seagull: it steals chips, and it steals Moins.' },
  { id: 'intro-05', trigger: 'levelStart', levelId: 'harbour-05', text: 'The captain needs telling twice, about everything.' },
  { id: 'intro-06', trigger: 'levelStart', levelId: 'harbour-06', text: 'Start where nobody is looking — that is where a Moin is missing.' },
  { id: 'intro-07', trigger: 'levelStart', levelId: 'harbour-07', text: 'A fender bends a Moin round the corner, which is more than the harbour master does.' },
  { id: 'intro-08', trigger: 'levelStart', levelId: 'harbour-08', text: 'A Moin will go the long way round if you let it.' },
  { id: 'intro-09', trigger: 'levelStart', levelId: 'harbour-09', text: 'Two greetings for the captain, and he still will not say thank you.' },
  { id: 'intro-10', trigger: 'levelStart', levelId: 'harbour-10', text: 'The whole harbour, still grumpy — time to wake the lot.' },

  { id: 'chain-1', trigger: 'longChain', text: 'That Moin got further than the ferry does.' },
  { id: 'chain-2', trigger: 'longChain', text: 'Moin, moin, moin — that is practically a speech up here.' },
  { id: 'chain-3', trigger: 'longChain', text: 'Steady on, that is more talking than we do all winter.' },

  { id: 'gull-1', trigger: 'stolen', text: 'The gull took it — of course the gull took it.' },
  { id: 'gull-2', trigger: 'stolen', text: 'Seagull one, harbour nil.' },
  { id: 'gull-3', trigger: 'stolen', text: 'Never turn your back on a gull with a Moin.' },

  { id: 'wait-1', trigger: 'waiting', text: 'The captain heard that; he is choosing not to react yet.' },
  { id: 'wait-2', trigger: 'waiting', text: 'Half a smile from the captain — somebody write down the date.' },

  { id: 'edge-1', trigger: 'edge', text: 'That one is off to Denmark.' },
  { id: 'edge-2', trigger: 'edge', text: 'Out to sea it goes, Moin and all.' },

  { id: 'par-1', trigger: 'solvedPar', text: 'Everyone smiling, and not a word wasted.' },
  { id: 'par-2', trigger: 'solvedPar', text: 'Par, and even the captain is impressed, quietly.' },

  { id: 'over-1', trigger: 'solvedOver', text: 'Everyone is smiling — it took a while, but so does the tide.' },
  { id: 'over-2', trigger: 'solvedOver', text: 'Done, though there is a shorter way and somebody is counting.' },

  { id: 'undo-1', trigger: 'undo', text: 'Fine, we will pretend that did not happen.' },
  { id: 'restart-1', trigger: 'restart', text: 'Back to the fog, then.' },
];
