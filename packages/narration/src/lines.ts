/**
 * The narrator's lines (CLAUDE.md §7): one sentence each, dry northern humour.
 * Placeholder set for Phase 1 (~20 lines + one intro per level). Data only.
 */
export type Trigger =
  | 'levelStart'
  | 'setComplete'
  | 'dailyStart'
  | 'longChain'
  | 'chatterbox'
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
  /** Only for `levelStart`: the level this intro belongs to; for `setComplete`: the set. */
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

  { id: 'intro-market-01', trigger: 'levelStart', levelId: 'market-01', text: 'The fog lifts off the market, and the first stall-holder clears her throat.' },
  { id: 'intro-market-02', trigger: 'levelStart', levelId: 'market-02', text: 'At the market nobody says Moin once when Moin moin will do.' },
  { id: 'intro-market-03', trigger: 'levelStart', levelId: 'market-03', text: 'The fish stall opens grumpy, as fish stalls do.' },
  { id: 'intro-market-04', trigger: 'levelStart', levelId: 'market-04', text: 'Two captains buying herring, and neither will greet first.' },
  { id: 'intro-market-05', trigger: 'levelStart', levelId: 'market-05', text: 'Gossip travels faster than a Moin, but only just.' },
  { id: 'intro-market-06', trigger: 'levelStart', levelId: 'market-06', text: 'Somebody has to start talking, and it will not be the captain.' },
  { id: 'intro-market-07', trigger: 'levelStart', levelId: 'market-07', text: 'Round the stalls the long way, like everyone on a Saturday.' },
  { id: 'intro-market-08', trigger: 'levelStart', levelId: 'market-08', text: 'The gull at the bakery has had three buns and wants a Moin for afters.' },
  { id: 'intro-market-09', trigger: 'levelStart', levelId: 'market-09', text: 'Two captains and one chatterbox — guess who will be doing the talking.' },
  { id: 'intro-market-10', trigger: 'levelStart', levelId: 'market-10', text: 'Market day in full swing, and still half of them are scowling.' },
  { id: 'intro-ferry-01', trigger: 'levelStart', levelId: 'ferry-01', text: 'The fog is off the water and the ferry queue is not amused.' },
  { id: 'intro-ferry-02', trigger: 'levelStart', levelId: 'ferry-02', text: 'On the car deck everyone faces forward, which helps, mostly.' },
  { id: 'intro-ferry-03', trigger: 'levelStart', levelId: 'ferry-03', text: 'The ticket office opens at seven, the ticket man wakes up at ten past.' },
  { id: 'intro-ferry-04', trigger: 'levelStart', levelId: 'ferry-04', text: 'Mind the gangway — Moins bounce off it like everything else.' },
  { id: 'intro-ferry-05', trigger: 'levelStart', levelId: 'ferry-05', text: 'Bow to stern is a long way for a Moin, so plan the route.' },
  { id: 'intro-ferry-06', trigger: 'levelStart', levelId: 'ferry-06', text: 'Late for the ferry and grumpy about it, all of them.' },
  { id: 'intro-ferry-07', trigger: 'levelStart', levelId: 'ferry-07', text: 'The foghorn says Moin too, but nobody counts it.' },
  { id: 'intro-ferry-08', trigger: 'levelStart', levelId: 'ferry-08', text: 'Rush hour at the ferry: thirteen grumps, three of them captains.' },
  { id: 'intro-ferry-09', trigger: 'levelStart', levelId: 'ferry-09', text: 'Halfway across, the captain finally looks up.' },
  { id: 'intro-ferry-10', trigger: 'levelStart', levelId: 'ferry-10', text: 'Last crossing of the morning, and the whole town on board.' },
  { id: 'intro-lighthouse-01', trigger: 'levelStart', levelId: 'lighthouse-01', text: 'The fog sits longest on the lighthouse, and so do the grumps on the mole.' },
  { id: 'intro-lighthouse-02', trigger: 'levelStart', levelId: 'lighthouse-02', text: 'The keeper\'s wife says Moin moin to the kettle, and to nobody else yet.' },
  { id: 'intro-lighthouse-03', trigger: 'levelStart', levelId: 'lighthouse-03', text: 'Waves on the breakwater, fenders on the rocks, and not a smile between them.' },
  { id: 'intro-lighthouse-04', trigger: 'levelStart', levelId: 'lighthouse-04', text: 'A hundred and twelve steps up to the lamp, and not one Moin on any of them.' },
  { id: 'intro-lighthouse-05', trigger: 'levelStart', levelId: 'lighthouse-05', text: 'Two gulls on the gallery rail, eyeing every Moin like a chip.' },
  { id: 'intro-lighthouse-06', trigger: 'levelStart', levelId: 'lighthouse-06', text: 'Four captains on the mole, each waiting for the other three to go first.' },
  { id: 'intro-lighthouse-07', trigger: 'levelStart', levelId: 'lighthouse-07', text: 'Tea at the keeper\'s, where one guest says Moin moin and the rest say nothing.' },
  { id: 'intro-lighthouse-08', trigger: 'levelStart', levelId: 'lighthouse-08', text: 'The fog bell rings every half minute, which is more than the captains manage.' },
  { id: 'intro-lighthouse-09', trigger: 'levelStart', levelId: 'lighthouse-09', text: 'Up in the lamp room the brass is polished, unlike the captains\' manners.' },
  { id: 'intro-lighthouse-10', trigger: 'levelStart', levelId: 'lighthouse-10', text: 'Every light in town is on, and the lighthouse is waiting for the last Moin.' },

  { id: 'set-harbour', trigger: 'setComplete', levelId: 'harbour', text: 'The harbour is awake; next door, the market still has its shutters down.' },
  { id: 'set-market', trigger: 'setComplete', levelId: 'market', text: 'The market is talking again, and the ferry is about to leave without a single Moin.' },
  { id: 'set-ferry', trigger: 'setComplete', levelId: 'ferry', text: 'The ferry is smiling, but out on the mole the lighthouse is still wrapped in fog.' },
  { id: 'set-lighthouse', trigger: 'setComplete', levelId: 'lighthouse', text: 'The lamp is lit, the whole town is smiling, and the herring festival is jealous.' },

  { id: 'daily-1', trigger: 'dailyStart', text: 'A new day, a new crowd of grumps — same as yesterday, really.' },
  { id: 'daily-2', trigger: 'dailyStart', text: 'Today\'s grumps, freshly delivered with the morning fog.' },

  { id: 'chain-1', trigger: 'longChain', text: 'That Moin got further than the ferry does.' },
  { id: 'chain-2', trigger: 'longChain', text: 'Moin, moin, moin — that is practically a speech up here.' },
  { id: 'chain-3', trigger: 'longChain', text: 'Steady on, that is more talking than we do all winter.' },

  { id: 'chatty-1', trigger: 'chatterbox', text: 'Moin moin — that is the captain told, twice, in one breath.' },
  { id: 'chatty-2', trigger: 'chatterbox', text: 'She said Moin moin, which round here counts as a whole conversation.' },

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
