/** Interface copy (CLAUDE.md §7): plain English; *Moin* stays *Moin*. */
export const copy = {
  facing: { N: 'north', E: 'east', S: 'south', W: 'west' },
  role: { fisherman: 'fisherman', captain: 'captain', market: 'market woman', kid: 'kid' },
  count: { 1: 'one', 2: 'two' } as Record<number, string>,

  chatterbox: 'chatterbox',
  moin: (amount: number) => (amount === 2 ? 'Moin moin' : 'Moin'),
  seagull: 'Seagull',
  seagullHolding: 'Seagull, holding a stolen Moin',
  fender: {
    rising: 'Fender, slanted like a forward slash: turns a Moin from east to north or west to south',
    falling: 'Fender, slanted like a backslash: turns a Moin from east to south or west to north',
  },

  board: 'Harbour',
  undo: 'Undo',
  restart: 'Restart',
  mute: 'Sound off',
  unmute: 'Sound on',
  taps: (n: number) => `${n} ${n === 1 ? 'tap' : 'taps'}`,
  par: (n: number) => `par ${n}`,
  level: (place: string, n: number, of: number) => `${place} · level ${n} of ${of}`,
  levelOf: (n: number, of: number) => `level ${n} of ${of}`,
  backToStory: 'Back to the town',
  stars: (n: number) => `${n} of 3 stars`,

  solvedTitle: 'Everyone is smiling!',
  solvedBody: (taps: number, par: number) =>
    taps <= par ? `${taps} ${taps === 1 ? 'tap' : 'taps'} — that is par.` : `${taps} taps. Par is ${par}.`,
  next: 'Next level',
  replay: 'Play again',
  allDone: 'The whole harbour is awake. More harbour soon.',
  fromTheTop: 'Back to the first level',

  levels: 'Levels',
  levelsTitle: 'The town',
  close: 'Close',
  daily: 'Daily Moin',
  todaysHarbour: "Today's harbour",
  dailyHint: (day: string) => `Today's harbour, ${day}`,
  dailyUnavailable: 'No daily Moin today — the fog is too thick.',
  copyResult: 'Copy result',
  copied: 'Copied — paste it anywhere.',
  copyFailed: 'Could not copy; select the text below instead.',
  starTotal: (got: number, of: number) => `${got} of ${of} stars`,
  levelTile: (n: number, title: string, stars: number) =>
    `Level ${n}, ${title}${stars > 0 ? `, ${stars} of 3 stars` : ', not solved yet'}`,
  onlooker: (who: string) => `Onlooker, a ${who}: say Moin`,
  gull: 'A gull overhead: shoo it',
  boat: 'A boat on the water: toot',
  theme: 'Theme',
  themes: { auto: 'Auto', light: 'Day', dark: 'Night' } as Record<'auto' | 'light' | 'dark', string>,
  narratorDismiss: 'Dismiss',
  updateReady: 'A new version of the harbour is ready.',
  reload: 'Reload',
  later: 'Later',
  offlineReady: 'Ready to play offline.',

  announce: {
    smiled: (n: number) => (n === 1 ? 'One person smiled.' : `${copyCount(n)} people smiled.`),
    seagull: 'A seagull stole the Moin.',
    edge: 'The Moin flew out to sea.',
    alreadySmiling: 'They smiled back.',
    waiting: 'The captain is half-greeted and needs one more.',
    solved: 'Everyone is smiling.',
  },
} as const;

function copyCount(n: number): string {
  return ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][n] ?? String(n);
}

export type Copy = typeof copy;
