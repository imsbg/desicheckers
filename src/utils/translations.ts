/**
 * Multilingual Translation Dictionaries (English & Odia)
 * Note: Odia strings contain pure Odia script with no English in brackets.
 */

export type Language = 'en' | 'or';

export interface Translations {
  home: string;
  homeTitle: string;
  appTitle: string;
  appSubtitle: string;
  heroKicker: string;
  heroHeading: string;
  heroDesc: string;
  rulesBtn: string;
  yourName: string;
  namePlaceholder: string;
  mandatoryJumpTitle: string;
  mandatoryJumpDesc: string;
  aiLevelLabel: string;
  onlineModeLabel: string;
  casualLabel: string;
  smartLabel: string;
  masterLabel: string;
  tournamentBadge: string;
  movesLimitUnit: string;
  playVsAi: string;
  playVsAiDesc: string;
  playBtn: string;
  twoPlayersPhone: string;
  twoPlayersPhoneDesc: string;
  twoPBadge: string;
  shareWithFriend: string;
  onlineMatchTitle: string;
  onlineMatchDesc: string;
  publicLobby: string;
  privateInvite: string;
  createOnlineRoom: string;
  joinExistingRoom: string;
  joinExistingRoomDesc: string;
  roomCodeLabel: string;
  invalidCodeError: string;
  joinAsPlayer: string;
  watchLive: string;
  liveOpenRooms: string;
  activeCount: string;
  noLiveRooms: string;
  waitingOpponentShort: string;
  inProgressShort: string;
  joinShort: string;
  watchShort: string;
  connected: string;
  connecting: string;
  offline: string;
  howToPlay: string;
  soundOn: string;
  soundOff: string;
  darkMode: string;
  lightMode: string;
  fullscreenEnter: string;
  fullscreenExit: string;
  settings: string;
  termsPrivacy: string;
  leave: string;
  leaveMatch: string;
  soloVsAi: string;
  twoPOnePhone: string;
  onlineMatchBadge: string;
  roundLabel: string;
  spectating: string;
  waitingForOpponent: string;
  winsRound: string;
  roundDraw: string;
  aiThinking: string;
  multiJumpNotice: string;
  yourTurn: string;
  turnSuffix: string;
  piecesLabel: string;
  winsLabel: string;
  movesLabel: string;
  lastMoveLabel: string;
  noMovesYet: string;
  roomReadyTitle: string;
  roomReadyDesc: string;
  copyInviteLink: string;
  copiedLink: string;
  undo: string;
  flip: string;
  autoFlip: string;
  onLabel: string;
  offLabel: string;
  resign: string;
  restart: string;
  reactLabel: string;
  matchDrawn: string;
  winsHeadline: string;
  waitingShort: string;
  acceptRematch: string;
  rematch: string;
  playAgain: string;
  matchTime: string;
  roundTime: string;
  capturesSuffix: string;
  moveLog: string;
  movesCountSuffix: string;
  makeOpeningMove: string;
  roundHistory: string;
  completedSuffix: string;
  wonRoundText: string;
  drawText: string;
  sponsoredBadge: string;
  sponsoredDesc: string;
  downloadNow: string;
  howToPlayTitle: string;
  rule1Title: string;
  rule1Desc: string;
  rule2Title: string;
  rule2Desc: string;
  rule3Title: string;
  rule3Desc: string;
  rule4Title: string;
  rule4Desc: string;
  ruleModesTitle: string;
  ruleCasualDesc: string;
  ruleSmartDesc: string;
  ruleMasterDesc: string;
  gotIt: string;
  settingsTitle: string;
  appearanceTheme: string;
  soundEffects: string;
  languageLabel: string;
  done: string;
  inviteQrTitle: string;
  shareModalTitle: string;
  copyMessage: string;
  shareNow: string;
  copiedToast: string;
  roomInviteBadge: string;
  roomInviteDesc: string;
  joinGame: string;
  cancel: string;
  leaveConfirmTitle: string;
  leaveConfirmDesc: string;
  stayBtn: string;
  hostLeftTitle: string;
  hostLeftDesc: string;
  backToLobby: string;
  backToGame: string;
  termsBody1: string;
  termsBody2: string;
  player1Default: string;
  player2Default: string;
  youDefault: string;
  aiNamePrefix: string;
  waitingGuest: string;
  hostCrimson: string;
  languageName: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    home: 'Home',
    homeTitle: 'Back to DesiGames Home',
    appTitle: 'DesiCheckers',
    appSubtitle: 'Online · Smart AI · 2-Player',
    heroKicker: 'Classic 8×8 Draughts',
    heroHeading: 'Play Checkers Anywhere',
    heroDesc:
      'Challenge our Smart Minimax AI, pass & play with 2 players on one phone, or battle friends in online rooms.',
    rulesBtn: 'Info & Rules',
    yourName: 'Your Display Name',
    namePlaceholder: 'Enter your name...',
    mandatoryJumpTitle: 'Mandatory Jump Rule (Tournament Standard)',
    mandatoryJumpDesc:
      'When a capture jump is available, it must be taken. Multi-jumps chain automatically.',
    aiLevelLabel: 'AI Level & Total Moves',
    onlineModeLabel: 'Match Mode & Total Moves',
    casualLabel: 'Casual',
    smartLabel: 'Smart',
    masterLabel: 'Master',
    tournamentBadge: 'Tournament',
    movesLimitUnit: 'moves',
    playVsAi: 'Play vs AI Bot',
    playVsAiDesc: 'Instant solo match · Minimax strategy',
    playBtn: 'Play',
    twoPlayersPhone: '2 Players (One Phone)',
    twoPlayersPhoneDesc: 'Pass & play offline with a friend nearby',
    twoPBadge: '2P',
    shareWithFriend: 'Share DesiCheckers with a Friend',
    onlineMatchTitle: 'Online Match',
    onlineMatchDesc: 'Create an SBXXXX room and share the link or QR code',
    publicLobby: 'Public Lobby',
    privateInvite: 'Private Invite',
    createOnlineRoom: 'Create Online Room',
    joinExistingRoom: 'Join Existing Room',
    joinExistingRoomDesc: "Enter a friend's room code (e.g. SB4821)",
    roomCodeLabel: 'Room Code',
    invalidCodeError: 'Enter a valid 6-character room code (e.g. SB4821)',
    joinAsPlayer: 'Join as Player',
    watchLive: 'Watch Live',
    liveOpenRooms: 'Live Open Rooms (This Device / Tabs)',
    activeCount: 'active',
    noLiveRooms:
      'No public rooms active yet. Create one above to invite a friend or test across two browser tabs!',
    waitingOpponentShort: 'Waiting for opponent',
    inProgressShort: 'In Progress',
    joinShort: 'Join',
    watchShort: 'Watch',
    connected: 'Connected',
    connecting: 'Connecting',
    offline: 'Offline',
    howToPlay: 'Info & Rules',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    fullscreenEnter: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    settings: 'Settings',
    termsPrivacy: 'Terms & Privacy',
    leave: 'Leave',
    leaveMatch: 'Leave Match',
    soloVsAi: 'Solo vs AI',
    twoPOnePhone: '2P One Phone',
    onlineMatchBadge: 'Online Match',
    roundLabel: 'Round',
    spectating: 'Spectating',
    waitingForOpponent: 'Waiting for opponent...',
    winsRound: 'Wins Round',
    roundDraw: 'Ended in a Draw',
    aiThinking: 'is thinking...',
    multiJumpNotice: 'Multi-Jump! Continue capturing',
    yourTurn: 'Your Turn',
    turnSuffix: "'s Turn",
    piecesLabel: 'pieces',
    winsLabel: 'Wins',
    movesLabel: 'Moves',
    lastMoveLabel: 'Last Move',
    noMovesYet: 'None yet',
    roomReadyTitle: 'Room Ready',
    roomReadyDesc: 'Share the room code or link to start.',
    copyInviteLink: 'Copy Link',
    copiedLink: 'Copied!',
    undo: 'Undo',
    flip: 'Flip',
    autoFlip: 'Auto-Flip',
    onLabel: 'On',
    offLabel: 'Off',
    resign: 'Resign',
    restart: 'Restart',
    reactLabel: 'React:',
    matchDrawn: 'Match Drawn!',
    winsHeadline: 'Wins!',
    waitingShort: 'Waiting...',
    acceptRematch: 'Accept Rematch',
    rematch: 'Rematch',
    playAgain: 'Play Again',
    matchTime: 'Match Time',
    roundTime: 'Round Time',
    capturesSuffix: 'Captures',
    moveLog: 'Move Log',
    movesCountSuffix: 'moves',
    makeOpeningMove: 'Make your opening diagonal move to begin.',
    roundHistory: 'Round History',
    completedSuffix: 'completed',
    wonRoundText: 'won',
    drawText: 'Draw',
    sponsoredBadge: 'Sponsored',
    sponsoredDesc: 'Learn & Read Odia effortlessly — Free Android App by Sandeep Biswal G',
    downloadNow: 'Download Now',
    howToPlayTitle: 'Game Info & Rules',
    rule1Title: '1. Movement',
    rule1Desc:
      'Pieces move diagonally forward one square onto dark teal squares. After each win, loss, or draw, the opponent opens the next round.',
    rule2Title: '2. Capturing & Multi-Jumps',
    rule2Desc:
      'Jump diagonally over an adjacent opponent piece into an empty square behind it to capture it. Multi-jump chains continue automatically with the same piece.',
    rule3Title: '3. King Promotion',
    rule3Desc:
      "Reach the opponent's back row to crown your piece as a King. Kings move and capture diagonally both forward and backward.",
    rule4Title: '4. Three Ways to Play',
    rule4Desc:
      'Play solo against our Minimax AI, share one phone for 2-player Pass & Play, or create an Online Match room (SBXXXX) with live spectator support.',
    ruleModesTitle: '5. Match Modes & Total Moves Limit',
    ruleCasualDesc: 'Casual — ∞ (Unlimited moves until checkmate or capture)',
    ruleSmartDesc: 'Smart — 50 total moves limit (decided by piece score if reached)',
    ruleMasterDesc: 'Master (Tournament) — 40 total moves limit with standard tournament rules',
    gotIt: 'Got It',
    settingsTitle: 'Game Settings',
    appearanceTheme: 'Appearance Theme',
    soundEffects: 'Sound Effects',
    languageLabel: 'Language',
    done: 'Done',
    inviteQrTitle: 'Invite via QR Code',
    shareModalTitle: 'Share with a Friend',
    copyMessage: 'Copy Message',
    shareNow: 'Share Now',
    copiedToast: 'Invite message copied to clipboard!',
    roomInviteBadge: 'Room Invite',
    roomInviteDesc: 'Enter your name to join this online Checkers match.',
    joinGame: 'Join Game',
    cancel: 'Cancel',
    leaveConfirmTitle: 'Leave Current Match?',
    leaveConfirmDesc: 'Returning to the lobby will end your active game session.',
    stayBtn: 'Stay',
    hostLeftTitle: 'Host Left the Room',
    hostLeftDesc: 'The host closed this room. Return to the lobby to start a new match.',
    backToLobby: 'Back to Lobby',
    backToGame: 'Back to Game',
    termsBody1:
      'DesiCheckers is a free browser-based Checkers game created by Sandeep Biswal G. Online matches connect directly between players without accounts or passwords.',
    termsBody2:
      'Display names, language choices, sound settings, and theme preferences are stored locally in your browser.',
    player1Default: 'Player 1',
    player2Default: 'Player 2',
    youDefault: 'You',
    aiNamePrefix: 'AI',
    waitingGuest: 'Waiting Guest...',
    hostCrimson: 'Host',
    languageName: 'English',
  },
  or: {
    home: 'ହୋମ୍',
    homeTitle: 'ଦେଶୀଗେମ୍ସ ହୋମ୍ କୁ ଫେରନ୍ତୁ',
    appTitle: 'ଦେଶୀ ଚେକର୍ସ',
    appSubtitle: 'ଅନଲାଇନ୍ · ଏଆଇ · ୨-ଖେଳାଳି',
    heroKicker: 'କ୍ଲାସିକ୍ ୮×୮ ଚେକର୍ସ',
    heroHeading: 'ଯେକୌଣସି ସ୍ଥାନରେ ଚେକର୍ସ ଖେଳନ୍ତୁ',
    heroDesc:
      'ଆମର ସ୍ମାର୍ଟ ଏଆଇ ସହିତ ଏକାକୀ ଖେଳନ୍ତୁ, ଗୋଟିଏ ଫୋନ୍‌ରେ ୨ ଜଣ ଖେଳନ୍ତୁ କିମ୍ବା ଅନଲାଇନ୍ ରୁମ୍‌ରେ ସାଙ୍ଗମାନଙ୍କ ସହିତ ଖେଳନ୍ତୁ।',
    rulesBtn: 'ସୂଚନା ଓ ନିୟମ',
    yourName: 'ଆପଣଙ୍କ ନାମ',
    namePlaceholder: 'ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ...',
    mandatoryJumpTitle: 'ବାଧ୍ୟତାମୂଳକ ଜମ୍ପ୍ ନିୟମ',
    mandatoryJumpDesc:
      'ବିପକ୍ଷ ଗୋଟି କାଟିବାର ସୁଯୋଗ ଥିଲେ ତାହା ଖେଳିବା ବାଧ୍ୟତାମୂଳକ। ଏକାଧିକ ଜମ୍ପ୍ ଆପେ ଆପେ ଯୋଡ଼ି ହୁଏ।',
    aiLevelLabel: 'ଏଆଇ ସ୍ତର ଓ ମୋଟ ଚାଲ୍',
    onlineModeLabel: 'ମ୍ୟାଚ୍ ମୋଡ୍ ଓ ମୋଟ ଚାଲ୍',
    casualLabel: 'ସାଧାରଣ',
    smartLabel: 'ଚତୁର',
    masterLabel: 'ମାଷ୍ଟର',
    tournamentBadge: 'ଟୁର୍ଣ୍ଣାମେଣ୍ଟ',
    movesLimitUnit: 'ଚାଲ୍',
    playVsAi: 'ଏଆଇ ବିପକ୍ଷରେ ଖେଳନ୍ତୁ',
    playVsAiDesc: 'ତୁରନ୍ତ ଏକାକୀ ମ୍ୟାଚ୍ · ସ୍ମାର୍ଟ ରଣନୀତି',
    playBtn: 'ଖେଳନ୍ତୁ',
    twoPlayersPhone: '୨ ଖେଳାଳି ଗୋଟିଏ ଫୋନ୍‌ରେ',
    twoPlayersPhoneDesc: 'ପାଖରେ ଥିବା ସାଙ୍ଗଙ୍କ ସହିତ ଅଫଲାଇନ୍ ଖେଳନ୍ତୁ',
    twoPBadge: '୨ ଜଣ',
    shareWithFriend: 'ସାଙ୍ଗଙ୍କ ସହିତ ସେୟାର କରନ୍ତୁ',
    onlineMatchTitle: 'ଅନଲାଇନ୍ ମ୍ୟାଚ୍',
    onlineMatchDesc: 'ଏକ ରୁମ୍ କୋଡ୍ ତିଆରି କରି ଲିଙ୍କ୍ କିମ୍ବା କ୍ୟୁଆର୍ ସେୟାର କରନ୍ତୁ',
    publicLobby: 'ସାର୍ବଜନୀନ ରୁମ୍',
    privateInvite: 'ବ୍ୟକ୍ତିଗତ ନିମନ୍ତ୍ରଣ',
    createOnlineRoom: 'ଅନଲାଇନ୍ ରୁମ୍ ତିଆରି କରନ୍ତୁ',
    joinExistingRoom: 'ରୁମ୍‌ରେ ଯୋଗ ଦିଅନ୍ତୁ',
    joinExistingRoomDesc: 'ସାଙ୍ଗଙ୍କ ରୁମ୍ କୋଡ୍ ଲେଖନ୍ତୁ',
    roomCodeLabel: 'ରୁମ୍ କୋଡ୍',
    invalidCodeError: 'ଦୟାକରି ସଠିକ୍ ୬-ଅକ୍ଷର ରୁମ୍ କୋଡ୍ ଦିଅନ୍ତୁ',
    joinAsPlayer: 'ଖେଳାଳି ଭାବେ ଯୋଗ ଦିଅନ୍ତୁ',
    watchLive: 'ଲାଇଭ୍ ଦେଖନ୍ତୁ',
    liveOpenRooms: 'ସକ୍ରିୟ ଖୋଲା ରୁମ୍',
    activeCount: 'ସକ୍ରିୟ',
    noLiveRooms:
      'ଏବେ କୌଣସି ଖୋଲା ରୁମ୍ ନାହିଁ। ଉପରେ ନୂଆ ରୁମ୍ ତିଆରି କରି ସାଙ୍ଗଙ୍କୁ ନିମନ୍ତ୍ରଣ କରନ୍ତୁ।',
    waitingOpponentShort: 'ବିପକ୍ଷ ଖେଳାଳିଙ୍କୁ ଅପେକ୍ଷା',
    inProgressShort: 'ଖେଳ ଚାଲିଛି',
    joinShort: 'ଯୋଗ ଦିଅନ୍ତୁ',
    watchShort: 'ଦେଖନ୍ତୁ',
    connected: 'ସଂଯୁକ୍ତ',
    connecting: 'ସଂଯୋଗ ହେଉଛି',
    offline: 'ଅଫଲାଇନ୍',
    howToPlay: 'ସୂଚନା ଓ ନିୟମ',
    soundOn: 'ଶବ୍ଦ ଚାଲୁ',
    soundOff: 'ଶବ୍ଦ ବନ୍ଦ',
    darkMode: 'ଡାର୍କ ମୋଡ୍',
    lightMode: 'ଲାଇଟ୍ ମୋଡ୍',
    fullscreenEnter: 'ଫୁଲ୍ ସ୍କ୍ରିନ୍',
    fullscreenExit: 'ଫୁଲ୍ ସ୍କ୍ରିନ୍ ବନ୍ଦ',
    settings: 'ସେଟିଂସ୍',
    termsPrivacy: 'ନିୟମ ଓ ଗୋପନୀୟତା',
    leave: 'ବାହାରନ୍ତୁ',
    leaveMatch: 'ମ୍ୟାଚ୍ ଛାଡ଼ନ୍ତୁ',
    soloVsAi: 'ଏକାକୀ ଏଆଇ ମ୍ୟାଚ୍',
    twoPOnePhone: '୨ ଖେଳାଳି ଫୋନ୍',
    onlineMatchBadge: 'ଅନଲାଇନ୍ ମ୍ୟାଚ୍',
    roundLabel: 'ରାଉଣ୍ଡ',
    spectating: 'ଦର୍ଶକ ମୋଡ୍',
    waitingForOpponent: 'ବିପକ୍ଷ ଖେଳାଳିଙ୍କୁ ଅପେକ୍ଷା...',
    winsRound: 'ରାଉଣ୍ଡ ଜିତିଲେ',
    roundDraw: 'ମ୍ୟାଚ୍ ଡ୍ର ହେଲା',
    aiThinking: 'ଚିନ୍ତା କରୁଛି...',
    multiJumpNotice: 'ଏକାଧିକ ଜମ୍ପ୍! ଆଗକୁ କାଟନ୍ତୁ',
    yourTurn: 'ଆପଣଙ୍କ ପାଳି',
    turnSuffix: 'ଙ୍କ ପାଳି',
    piecesLabel: 'ଗୋଟି',
    winsLabel: 'ବିଜୟ',
    movesLabel: 'ଚାଲ୍',
    lastMoveLabel: 'ଶେଷ ଚାଲ୍',
    noMovesYet: 'ଏପର୍ଯ୍ୟନ୍ତ ନାହିଁ',
    roomReadyTitle: 'ରୁମ୍ ପ୍ରସ୍ତୁତ',
    roomReadyDesc: 'ଖେଳ ଆରମ୍ଭ କରିବାକୁ ରୁମ୍ କୋଡ୍ ସେୟାର କରନ୍ତୁ।',
    copyInviteLink: 'ଲିଙ୍କ୍ କପି କରନ୍ତୁ',
    copiedLink: 'କପି ହେଲା!',
    undo: 'ଫେରାନ୍ତୁ',
    flip: 'ଓଲଟାନ୍ତୁ',
    autoFlip: 'ସ୍ୱୟଂ ଓଲଟା',
    onLabel: 'ଚାଲୁ',
    offLabel: 'ବନ୍ଦ',
    resign: 'ହାର ମାନନ୍ତୁ',
    restart: 'ପୁନଃ ଆରମ୍ଭ',
    reactLabel: 'ଭାବନା:',
    matchDrawn: 'ମ୍ୟାଚ୍ ଡ୍ର ହେଲା!',
    winsHeadline: 'ଜିତିଲେ!',
    waitingShort: 'ଅପେକ୍ଷା...',
    acceptRematch: 'ପୁନଃ ମ୍ୟାଚ୍ ଗ୍ରହଣ',
    rematch: 'ପୁନଃ ମ୍ୟାଚ୍',
    playAgain: 'ପୁଣି ଖେଳନ୍ତୁ',
    matchTime: 'ମୋଟ ସମୟ',
    roundTime: 'ରାଉଣ୍ଡ ସମୟ',
    capturesSuffix: 'କଟା ଗୋଟି',
    moveLog: 'ଚାଲ୍ ତାଲିକା',
    movesCountSuffix: 'ଚାଲ୍',
    makeOpeningMove: 'ଖେଳ ଆରମ୍ଭ କରିବାକୁ ପ୍ରଥମ ଚାଲ୍ ଖେଳନ୍ତୁ।',
    roundHistory: 'ରାଉଣ୍ଡ ଇତିହାସ',
    completedSuffix: 'ସମାପ୍ତ',
    wonRoundText: 'ଜିତିଲେ',
    drawText: 'ଡ୍ର',
    sponsoredBadge: 'ପ୍ରାୟୋଜିତ',
    sponsoredDesc: 'ସହଜରେ ଓଡ଼ିଆ ଶିଖନ୍ତୁ ଓ ପଢ଼ନ୍ତୁ — ସନ୍ଦୀପ ବିଶ୍ୱାଳଙ୍କ ମାଗଣା ଆପ୍',
    downloadNow: 'ଡାଉନଲୋଡ୍',
    howToPlayTitle: 'ଖେଳ ସୂଚନା ଓ ନିୟମ',
    rule1Title: '୧. ଗୋଟି ଚାଳନା',
    rule1Desc:
      'ଗୋଟିଗୁଡ଼ିକ ଗାଢ଼ ସବୁଜ ଘରେ ତେରଛା ଭାବେ ଆଗକୁ ଗୋଟିଏ ଘର ଚାଲେ। ପ୍ରତି ବିଜୟ, ପରାଜୟ କିମ୍ବା ଡ୍ର ପରେ ପରବର୍ତ୍ତୀ ରାଉଣ୍ଡରେ ବିପକ୍ଷ ଖେଳାଳି ପ୍ରଥମେ ଚାଲ୍ ଖେଳନ୍ତି।',
    rule2Title: '୨. କାଟିବା ଓ ଏକାଧିକ ଜମ୍ପ୍',
    rule2Desc:
      'ବିପକ୍ଷ ଗୋଟି ଉପରେ ତେରଛା ଭାବେ ଡେଇଁ ଖାଲି ଘରେ ବସିଲେ ସେହି ଗୋଟି କଟିଯାଏ। ଆଗକୁ ଆଉ କାଟିବାର ଥିଲେ ଏକାଧିକ ଜମ୍ପ୍ ଜାରି ରହେ।',
    rule3Title: '୩. ରାଜା ଗୋଟି',
    rule3Desc:
      'ବିପକ୍ଷର ଶେଷ ଧାଡ଼ିରେ ପହଞ୍ଚିଲେ ଗୋଟି ରାଜା ହୋଇଯାଏ। ରାଜା ଗୋଟି ଆଗକୁ ଓ ପଛକୁ ଉଭୟ ଦିଗରେ ଚାଲିପାରେ ଓ କାଟିପାରେ।',
    rule4Title: '୪. ତିନୋଟି ଖେଳ ମୋଡ୍',
    rule4Desc:
      'ଏଆଇ ବିପକ୍ଷରେ ଏକାକୀ ଖେଳନ୍ତୁ, ଗୋଟିଏ ଫୋନ୍‌ରେ ୨ ଜଣ ଖେଳନ୍ତୁ କିମ୍ବା ଅନଲାଇନ୍ ମ୍ୟାଚ୍‌ରେ ଦର୍ଶକଙ୍କ ସହ ଖେଳନ୍ତୁ।',
    ruleModesTitle: '୫. ମ୍ୟାଚ୍ ମୋଡ୍ ଓ ମୋଟ ଚାଲ୍ ସୀମା',
    ruleCasualDesc: 'ସାଧାରଣ — ∞ ଅସୀମିତ ଚାଲ୍',
    ruleSmartDesc: 'ଚତୁର — ମୋଟ ୫୦ ଚାଲ୍ ସୀମା',
    ruleMasterDesc: 'ମାଷ୍ଟର ଟୁର୍ଣ୍ଣାମେଣ୍ଟ — ମୋଟ ୪୦ ଚାଲ୍ ସୀମା',
    gotIt: 'ବୁଝିଲି',
    settingsTitle: 'ଖେଳ ସେଟିଂସ୍',
    appearanceTheme: 'ଥିମ୍ ରଙ୍ଗ',
    soundEffects: 'ଶବ୍ଦ ପ୍ରଭାବ',
    languageLabel: 'ଭାଷା',
    done: 'ସମ୍ପୂର୍ଣ୍ଣ',
    inviteQrTitle: 'କ୍ୟୁଆର୍ କୋଡ୍ ନିମନ୍ତ୍ରଣ',
    shareModalTitle: 'ସାଙ୍ଗଙ୍କ ସହିତ ସେୟାର କରନ୍ତୁ',
    copyMessage: 'ବାର୍ତ୍ତା କପି କରନ୍ତୁ',
    shareNow: 'ଏବେ ସେୟାର କରନ୍ତୁ',
    copiedToast: 'ନିମନ୍ତ୍ରଣ ବାର୍ତ୍ତା କପି ହୋଇଗଲା!',
    roomInviteBadge: 'ରୁମ୍ ନିମନ୍ତ୍ରଣ',
    roomInviteDesc: 'ଅନଲାଇନ୍ ଚେକର୍ସ ମ୍ୟାଚ୍‌ରେ ଯୋଗ ଦେବାକୁ ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ।',
    joinGame: 'ଖେଳରେ ଯୋଗ ଦିଅନ୍ତୁ',
    cancel: 'ବାତିଲ୍',
    leaveConfirmTitle: 'ଚାଲୁଥିବା ମ୍ୟାଚ୍ ଛାଡ଼ିବେ କି?',
    leaveConfirmDesc: 'ଲବିକୁ ଫେରିଲେ ଆପଣଙ୍କ ଚାଲୁଥିବା ଖେଳ ସମାପ୍ତ ହୋଇଯିବ।',
    stayBtn: 'ରହନ୍ତୁ',
    hostLeftTitle: 'ହୋଷ୍ଟ ରୁମ୍ ଛାଡ଼ିଦେଲେ',
    hostLeftDesc: 'ହୋଷ୍ଟ ଏହି ରୁମ୍ ବନ୍ଦ କରିଦେଇଛନ୍ତି। ନୂଆ ମ୍ୟାଚ୍ ପାଇଁ ଲବିକୁ ଫେରନ୍ତୁ।',
    backToLobby: 'ଲବିକୁ ଫେରନ୍ତୁ',
    backToGame: 'ଖେଳକୁ ଫେରନ୍ତୁ',
    termsBody1:
      'ଦେଶୀ ଚେକର୍ସ ସନ୍ଦୀପ ବିଶ୍ୱାଳଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏକ ମାଗଣା ବ୍ରାଉଜର୍ ଖେଳ। ଅନଲାଇନ୍ ମ୍ୟାଚ୍ ବିନା କୌଣସି ଆକାଉଣ୍ଟ କିମ୍ବା ପାସ୍‌ୱାର୍ଡରେ ସିଧାସଳଖ ଖେଳାଳିଙ୍କୁ ସଂଯୋଗ କରେ।',
    termsBody2:
      'ଆପଣଙ୍କ ନାମ, ଭାଷା, ଶବ୍ଦ ଏବଂ ଥିମ୍ ପସନ୍ଦ କେବଳ ଆପଣଙ୍କ ବ୍ରାଉଜର୍‌ରେ ସୁରକ୍ଷିତ ରହେ।',
    player1Default: 'ଖେଳାଳି ୧',
    player2Default: 'ଖେଳାଳି ୨',
    youDefault: 'ଆପଣ',
    aiNamePrefix: 'ଏଆଇ',
    waitingGuest: 'ଅତିଥିଙ୍କୁ ଅପେକ୍ଷା...',
    hostCrimson: 'ହୋଷ୍ଟ',
    languageName: 'ଓଡ଼ିଆ',
  },
};
