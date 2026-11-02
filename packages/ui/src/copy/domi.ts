/**
 * Moin Domi's interface copy (CLAUDE.md §7): plain English; *Moin* stays *Moin*; ’ not '.
 * Imported by Domi as `@moin/ui/copy/domi`, never through the `@moin/ui` barrel, which would pull
 * the puzzle's paintings into Domi's build. This module imports nothing.
 *
 * A sentence is one entry. Where markup sits inside a sentence, the entry is a tuple of parts,
 * `[before, marked, after]`, and the screen puts the middle part in its `<strong>` or `<em>`.
 */
/** How a link's path is shown, ahead of its id or name. */
const PATH = '…/m/';

export const domi = {
  name: 'Moin Domi',

  /** Words more than one screen uses. */
  common: {
    back: 'Back',
    home: 'Home',
    dismiss: 'Dismiss',
    copied: 'Copied',
    signIt: 'Sign it',
    password: 'Password',
    name: 'Name',
    suggest: 'New',
    locking: 'Locking it…',
    startNewChain: 'Start a new chain',
    step: (n: number) => `${n} of 3`,
    /** What is waiting in the outbox: a new chain or postcard, or a turn. */
    outgoing: { postcard: 'A postcard', chain: 'A new chain', turn: 'Your turn' },
  },

  /** Password links (D12, D13), on *How it travels* and on the link screen. */
  lock: {
    prefix: PATH,
    path: (name: string) => `${PATH}${name}`,
    tooCommon: 'Too common — anyone would guess it.',
    tooShort: 'Three words, or twelve characters.',
  },

  home: {
    art: 'The harbour at night: lamp-lit warehouses, a moon and the lighthouse beam.',
    settings: 'Settings',
    kicker: 'A private Stille Post',
    start: 'Start something',
    chainTitle: 'Start a chain',
    chainBody: 'Make a meme. Each friend changes one word and one touch. At the last stop, see how far it drifted.',
    sendTitle: 'Just send',
    sendBody: 'A private meme postcard for one person or a few. No game, no changes, gone in 30 days.',
    outbox: 'Waiting to send',
    outLine: (kind: string, title: string) => `${kind} · ${title}`,
    outPending: 'Goes out when you’re back online',
    discard: 'Discard',
    waiting: 'Waiting for you',
    empty: 'Nothing yet. When someone sends you a Moin, it opens here.',
    postcardFor: 'Sent just to you',
    chainTurn: 'Your turn in a chain',
    postcardLine: (title: string, day: string) => `${title} · until ${day}`,
    chainLine: (stop: number, of: number, title: string) => `Stop ${stop} of ${of} · ${title}`,
    all: 'All your chains and postcards',
    footOff: 'Sending isn’t switched on yet: the relay has no home. You can make memes and look around.',
    foot: 'No accounts, no feed. Memes are locked on your phone; the relay can’t read them.',
  },

  create: {
    title: 'Make the meme',
    who: 'Who',
    where: 'Where',
    captions: 'Captions',
    top: 'Top',
    topPlaceholder: 'Top caption',
    bottom: 'Bottom',
    bottomPlaceholder: 'Bottom caption',
    touch: 'A touch',
    moin: 'Moin',
    moinmoin: 'Moin moin',
    gull: 'A gull',
    smile: 'Smile',
    weather: 'Weather',
    clear: 'Clear',
    nextPostcard: 'Next: who can open it',
    nextChain: 'Next: how it travels',
    noCaption: 'Write a caption first',
  },

  rules: {
    back: 'Back to the meme',
    title: 'How it travels',
    kind: 'Kind',
    chain: 'A chain',
    postcard: 'Just send',
    rules: 'Rules of the chain',
    stops: { label: 'Stops', hint: 'How many people before the reveal', spoken: (n: number) => `${n} people` },
    branches: { label: 'Each passes to', hint: '1 is a straight line, classic Stille Post', spoken: (n: number) => (n === 1 ? 'one person' : `${n} people`) },
    budget: { label: 'Words to change', hint: 'How many words each person may swap', spoken: (n: number) => (n === 1 ? 'one word' : `${n} words`) },
    fewer: (label: string, spoken: string) => `Fewer: ${label}, now ${spoken}`,
    more: (label: string, spoken: string) => `More: ${label}, now ${spoken}`,
    touchHint: ['Each stop also gets ', 'one small touch', '. Passing it on unchanged is fine too. At most 100 stops in a whole tree.'] as const,
    postcardTitle: 'A meme postcard',
    postcardPoints: [
      'Whoever has the link sees your meme exactly as you made it.',
      'Nobody can change it or pass a new version on.',
      'Send the same link to one person or to a small group.',
    ] as const,
    nickPlaceholder: 'a nickname, or leave it blank',
    link: 'The link',
    links: {
      plain: { title: 'Private link', hint: 'The key lives only in the link' },
      password: { title: 'With a password', hint: 'For a link that might be forwarded' },
      custom: { title: 'A name you choose', hint: 'Always with a password' },
    },
    namePlaceholder: 'kapitaen-hein',
    nameHint: (slug: string, bad: boolean) =>
      `${slug ? `${PATH}${slug}` : 'Letters, numbers and hyphens, 3 to 32.'}${bad ? ' — too short or not allowed' : ''}`,
    pwEmpty: 'Choose one, or take the suggestion.',
    pwGood: 'Good. Send it another way than the link.',
    offline: 'You’re offline. It will be locked and sent when you’re back.',
    chainWarn: 'Everyone after you will see your version.',
    postcardWarn: 'Anyone with the link can open it, for 30 days.',
    sendLater: 'Send it when I’m back online',
    makeChain: 'Lock it and make the first link',
    makePostcard: 'Lock it and make the link',
  },

  ready: {
    postcardTitle: 'Your postcard is ready',
    chainTitle: 'Your chain is ready',
    passedTitle: 'Passed on',
    postcardBody: 'Send the link to whoever should see it.',
    chainBody: (stop: number, of: number) => `Send it to one person. They are stop ${stop} of ${of}.`,
    link: 'The link',
    locked: 'Locked with your password. Send the password another way — say it, or use a different app — never in the same message.',
    key: 'The gold part is the key. It stays in the link and never reaches the relay.',
    password: 'The password',
    passwordOnce: 'The password — shown only now',
    copyPassword: 'Copy password',
    lockBox: 'Send it with a password',
    namePlaceholder: 'optional, e.g. kapitaen-hein',
    noKey: 'The link will carry no key; the password opens it.',
    lockIt: 'Lock it with this password',
    withPassword: 'Send it with a password instead',
    share: 'Send it',
    copyLink: 'Copy link',
    tree: 'See the tree',
    done: 'Done',
    note: 'Gone 30 days after its last stop. You’ll find it under Yours.',
    /** App: the chain was made but the lock on it failed; `reason` ends with its own full stop. */
    lockFailed: (reason: string) => `The password couldn’t be set (${reason}) This link opens with its key instead.`,
    lockOff: 'Sending isn’t switched on yet.',
  },

  turn: {
    title: 'Your turn',
    intro: 'Someone passed you this. Who changed what, nobody knows.',
    youAre: (stop: number, of: number) => `You are stop ${stop} of ${of}`,
    tapWord: 'Tap a word to swap it',
    left: (left: number, budget: number) => `${left} of ${budget} ${budget === 1 ? 'word' : 'words'} left`,
    swapped: (word: string, was: string) => `${word}, was ${was}: tap to undo`,
    noSwaps: (word: string) => `${word}, no swaps left`,
    swapFor: (word: string) => `Swap “${word}” for…`,
    /** Suggested words to swap in. */
    ideas: ['gull', 'herring', 'Oma', 'Moin', 'Fischbrötchen', 'rain', 'ferry', 'tide', 'never', 'secretly', 'loudly', 'sings', 'steals', 'eats', 'captain', 'Hamburg'] as const,
    typeOwn: 'Type your own',
    oneWord: 'One word',
    newWordFor: (word: string) => `A new word for “${word}”`,
    useIt: 'Use it',
    oneTouch: 'One touch',
    touches: {
      none: 'None',
      bubbleOn: 'Moin bubble', bubbleMore: 'Moin moin', bubbleOff: 'No bubble',
      gullOn: 'A gull', gullOff: 'No gull',
      smile: 'A smile', frown: 'A frown',
    },
    nickPlaceholder: 'or stay anonymous',
    offline: 'You’re offline. It goes out when you’re back.',
    warn: 'Everyone after you will see your version.',
    passing: 'Passing it on…',
    passLater: 'Pass it on when I’m back online',
    lastChanged: 'Add the last version',
    lastUnchanged: 'Add it unchanged as the last',
    pass: 'Pass it on',
    passUnchanged: 'Pass it on unchanged',
    bubbleSays: (text: string) => `The bubble now says ${text || 'nothing'}`,
  },

  tree: {
    title: 'The tree opens',
    intro: (mine: boolean, day: string) => `${mine ? 'You’re in. Now you see every version.' : 'Every version so far.'} Gone after ${day}.`,
    stale: (date: string) => `Offline: this is the tree as you saw it on ${date}.`,
    label: (versions: number, deepest: number, stops: number) =>
      `A tree of ${versions} ${versions === 1 ? 'version' : 'versions'} over ${deepest} of ${stops} stops.`,
    node: (stop: number, yours: boolean, meme: { readonly top: string; readonly bottom: string } | null) =>
      `Stop ${stop}${yours ? ', yours' : ''}${meme ? `: ${meme.top} ${meme.bottom}` : ': unreadable'}`,
    unreadableTile: '?',
    you: 'You',
    detail: (stop: number, yours: boolean, nick: string) => `Stop ${stop}${yours ? ' · yours' : ''}${nick ? ` · ${nick}` : ''}`,
    started: 'Where it started.',
    unchanged: 'Passed on unchanged.',
    unreadable: 'This version won’t open: someone sent something that isn’t a meme.',
    replay: 'Replay the wave',
    finale: 'The finale',
    yourLink: 'Your link, to send it on',
    finaleLater: (stops: number) => `The finale opens when a branch reaches stop ${stops}.`,
  },

  finale: {
    back: 'Back to the tree',
    kicker: (stops: number) => `Stop ${stops} of ${stops} · the last stop`,
    title: 'Look how far it drifted',
    first: 'The first',
    last: 'The last',
    drift: 'How the words changed',
    touch: (note: string) => ` · ${note}`,
    unreadable: 'unreadable',
    say: 'Say it out loud',
    saveBoth: 'Save both',
    voice: 'The voice is your phone’s own; nothing is sent to read it.',
    noVoice: 'This phone has no voice of its own, and we won’t use one from the internet.',
  },

  postcard: {
    kicker: { postcard: 'A meme postcard', lastStop: 'The last stop', chain: 'A chain' },
    yours: 'Your postcard',
    from: (nick: string) => ['Moin from ', nick] as const,
    anonymous: 'A Moin for you',
    lastStop: 'This chain has reached its last stop; only the people in it see the finale.',
    full: 'Someone already passed this one on, so it can’t take another turn.',
    mine: 'Only people who have the link can open it.',
    received: 'Sent to you as a private link. Only people who have the link can open it.',
    until: 'Opens until',
    who: 'Who can see it',
    onlyLink: 'Only this link',
    showLink: 'Show the link',
    reply: 'Send one back',
    save: 'Save image',
    note: 'A saved image leaves the private link: it is yours to share, and it won’t expire.',
  },

  yours: {
    title: 'Yours',
    show: 'Show',
    tabs: { all: 'All', chain: 'Chains', postcard: 'Postcards' },
    empty: 'Nothing yet. Chains you start or receive, and postcards, are kept here — on this phone only.',
    emptyFilter: 'Nothing here.',
    tag: { gone: 'Gone', ending: 'Ending soon', turn: 'Your turn', finale: 'Finale', postcard: 'Postcard', seen: 'Seen', travelling: 'Travelling' },
    gone: 'Gone with the tide · nobody can open it now',
    until: (day: string) => `gone after ${day}`,
    line: (what: string, until: string) => `${what} · ${until}`,
    sent: 'You sent it',
    from: (nick: string) => `From ${nick}`,
    toYou: 'Sent to you',
    stop: (stop: number, of: number) => `Stop ${stop} of ${of}`,
    started: (stops: number) => `You started it · ${stops} stops`,
    were: (stop: number, of: number) => `You were stop ${stop} of ${of}`,
    forget: 'Remove from this phone',
    note: 'This list lives only on this phone. Everything goes 30 days after its last stop.',
  },

  gone: {
    art: 'The lighthouse on its mole at night, the tide far out.',
    aside: 'The gull says it wasn’t him.',
    tide: 'Gone with the tide',
    tideText: 'Nothing answers to this link any more. Chains vanish 30 days after their last stop — every version, everywhere — and then nobody can open them, not even us.',
    tree: 'The tree won’t open',
    notYet: 'Not yet',
    notYetText: 'This Moin needs the relay, and the relay isn’t switched on yet.',
    offline: 'Offline',
    offlineText: 'This Moin is waiting on the relay, and you’re offline. Keep this page open, or open the link again when you’re back.',
    broken: 'This link doesn’t open',
    noLink: 'No Moin in that',
    noLinkText: 'What was shared has no Moin Domi link in it. Share the whole link — the part after # is its key.',
  },

  settings: {
    title: 'Settings',
    prefs: 'Preferences',
    rememberNick: 'Remember my nickname',
    rememberNickHint: (nick: string) =>
      (nick ? `Keeps “${nick}” here, so you needn’t type it each time` : 'Keeps the name you sign with here, on this phone'),
    sound: 'The Moin sound',
    soundHint: 'Plays when you pass a Moin on',
    calm: 'Calm motion',
    calmHint: 'No wave, no drifting; the tree simply appears',
    relay: 'What the relay sees',
    never: 'Never',
    neverList: ['your memes', 'the captions', 'nicknames', 'the keys in links'] as const,
    only: 'Only this',
    onlyList: ['how the tree branches', 'how big each stop is', 'the day of each stop', 'when a phone asks for a stop'] as const,
    relayNote: 'Like any website it sees your connection while you use it, and keeps no record of it. No accounts, no cookies, no tracking.',
    data: 'Your data',
    forgetAsk: 'Forget everything?',
    forgetBody: 'Your list and every saved key leave this phone. Chains you’re in carry on without you.',
    keep: 'Keep it',
    forget: 'Forget',
    forgetAll: 'Forget everything on this phone',
    forgetNote: 'Removes your list and saved keys from this phone. Chains you’re in carry on without you.',
    about: 'About and the rules',
    tagline: 'Always after dark',
    version: 'Moin Domi 0.1 · relay v1',
  },

  about: {
    back: 'Back to settings',
    title: 'About and the rules',
    whatTitle: 'What Moin Domi is',
    what: 'A private Stille Post for memes between friends, from the cast of the Moin harbour. No accounts, no feed, no search: a meme reaches only the people its link is sent to, and every chain is deleted 30 days after its last stop.',
    notAllowed: 'Not allowed',
    rules: [
      'anything illegal where you or the people you send it to live;',
      'threats, harassment, or hounding someone;',
      'someone else’s private details — addresses, numbers, secrets.',
    ] as const,
    careTitle: 'How we look after it',
    care: 'The relay that passes memes on cannot read them. We see a chain only when someone sends us its full link. If it breaks these rules, we delete the whole chain, for everyone, and nobody can open it again. We don’t know who was in it, so we can’t tell anyone it went.',
    contactTitle: 'Contact and reports',
    people: 'People answer, not a machine.',
    reportHow: ['To report a chain, use ', 'Report this chain', ' under a meme: it puts the full link in the mail for you.'] as const,
    noContact: 'No contact address yet: the relay isn’t public, so there is nothing to report. One will be here before anyone can send a Moin.',
  },

  unlock: {
    title: 'A Moin is waiting',
    body: 'This link is locked with a password. Ask the person who sent it to you.',
    hide: 'Hide password',
    show: 'Show password',
    wait: (at: string) => `Too many tries. You can try again at ${at}.`,
    opening: 'Opening…',
    open: 'Open',
    note: 'Your password opens it on this phone. It is never sent anywhere.',
  },

  queued: {
    title: 'Waiting for the tide',
    online: 'Back online — sending it now…',
    offline: 'You’re offline. It’s kept on this phone and goes out the moment you’re back, while Moin Domi is open. Nothing is sent before then.',
    note: 'You’ll find it on Home under “Waiting to send”.',
  },

  /** App: a link is being read. */
  opening: {
    title: 'Opening your Moin…',
    body: 'Unlocking it here on your phone.',
  },

  /** App: a new service worker is waiting (CLAUDE.md §8). */
  update: { ready: 'A new Moin Domi is ready.', reload: 'Reload' },

  /** App: the relay has no home yet (`VITE_CURSUS_URL` unset). */
  blocked: 'Sending isn’t switched on yet: the relay has no home. Everything else works.',
  /** App, Home: something waiting in the outbox went out. */
  sent: {
    postcard: 'Your postcard was locked and sent to the relay. Its link is under Yours.',
    chain: 'Your Moin went out. Its link is under Yours.',
  },

  /** A notice under DSA Art. 16(2), written in the person's own mail app (`lib/flow.ts`). */
  report: {
    link: 'Report this chain',
    sent: 'Your mail app has the report with the full link. A person reads every report and answers by mail; a chain that breaks the rules is deleted for everyone.',
    subject: 'Moin Domi: report a chain',
    body: (link: string) => [
      'The Moin Domi link (keep all of it, with the part after #, or we cannot open it):',
      link,
      '',
      'Why it should come down:',
      '',
      '',
      'Your name:',
      '',
      'I believe in good faith that this report is accurate and complete.',
    ].join('\n'),
  },

  /** `errorText` in `lib/flow.ts`, by Tessera's `reason`. */
  errors: {
    offline: 'You’re offline. Try again when you’re back.',
    notFound: 'This Moin is gone, or it never existed.',
    broken: 'This link is broken. Ask for it again, all of it.',
    locked: 'This link doesn’t open. Ask for it again, all of it.',
    rejected: 'Someone was quicker: this stop is already taken.',
    slowDown: 'The relay needs a breather. Try again in a few minutes.',
    wrongPassword: 'That isn’t it. Check the spelling and try again.',
    weakPassword: 'Choose a longer password: three words, or twelve characters.',
    badName: 'That name can’t be used: 3 to 32 letters, numbers and single hyphens.',
    conflict: 'That name is taken while its chain lives. Pick another.',
    noAnswer: 'The relay didn’t answer. Try again in a moment.',
  },

  /** The cast (D3), by `Who`. */
  cast: {
    captain: 'The grumpy captain',
    fisherman: 'A fisherman',
    market: 'The market woman',
    kid: 'A kid in a raincoat',
    chatterbox: 'The chatterbox',
    harbourmaster: 'The harbour master',
    netmender: 'The net mender',
    gull: 'The gull',
  },
  /** By `Where`. */
  places: { harbour: 'Harbour', market: 'Market', ferry: 'Ferry', lighthouse: 'Light', water: 'Water', mudflats: 'Flats' },
  /** By `Weather`. */
  weather: { clear: 'Clear sky', rain: 'Rain', fog: 'Fog', beam: 'The beam' },
  /** By `Mood`. */
  moods: { grumpy: 'grumpy', smiling: 'smiling' },
  /** What the red bubble says, by `Bubble`. */
  bubble: { none: '', moin: 'Moin', moinmoin: 'Moin moin' },

  /** The spoken description of a meme (`lib/look.ts`). */
  meme: {
    label: (who: string, mood: string, place: string, extras: readonly string[], caption: string) =>
      `Meme: ${who}, ${mood}, ${place}${extras.length ? `, with ${extras.join(' and ')}` : ''}. “${caption}”`,
    someone: 'Someone',
    bubble: (text: string) => `a “${text}” bubble`,
    gull: 'a gull',
    caption: (top: string, bottom: string) => [top, bottom].filter(Boolean).join(' / ') || 'no words',
    onWater: 'on the open water',
    at: (place: string) => `at the ${place}`,
  },

  /** What a stop's touch changed, in the tree and the finale (`lib/diff.ts`). */
  changes: {
    clear: 'the sky cleared',
    rain: 'rain',
    fog: 'fog rolled in',
    beam: 'the lighthouse beam',
    gullJoined: 'a gull joined',
    gullLeft: 'the gull left',
    smile: 'a smile',
    frown: 'a frown',
    bubbleQuiet: 'the bubble went quiet',
    moinmoin: 'Moin moin',
    moin: 'a Moin bubble',
    list: (notes: readonly string[]) => notes.join(', '),
  },

  /** S4: a solved puzzle level opens a ready-made meme from its part of town, by `Where`. */
  bridge: {
    top: {
      harbour: 'When the whole harbour',
      market: 'When the whole market',
      ferry: 'When the whole ferry',
      lighthouse: 'When even the lighthouse',
      water: 'When the whole North Sea',
      mudflats: 'When even the last island',
    },
    bottom: 'finally says Moin',
  },
} as const;

export type DomiCopy = typeof domi;
