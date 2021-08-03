import { Message, MessageAttachment, StringResolvable } from 'discord.js';
import { Server } from './database';

export interface Command {
  name: string;
  template: string;
  requiresAdmin?: boolean;
  requiresGroup?: boolean;
  requiresPagination?: boolean;
  activated(message: ParsedMessage): boolean;
  execute(message: ParsedMessage): void;
}

export interface CustomCommand {
  command: string;
  message: string;
  image?: string;
  public: boolean;
}

export interface Event {
  type: string;
  execute(data: Object): void;
}

export interface EventPayload {
  type: string;
  data: Object;
}

export interface CanvasAttachment {
  attachment: MessageAttachment;
  fileName: string;
}

export interface Renderable {
  render(props: any): Promise<CanvasAttachment>;
}

export interface ParsedMessage {
  sourceMessage: Message;
  originServer?: Server;
  prefix: string;
  command: string;
  args: string[];
  respond(response: StringResolvable): void;
}

export interface TimeGap {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export enum BroadcastType {
  CompetitionStatus = 'COMPETITION_STATUS',
  MemberAchievements = 'MEMBER_ACHIEVEMENTS',
  MemberNameChanged = 'MEMBER_NAME_CHANGED',
  MemberHardcoreDied = 'MEMBER_HCIM_DIED',
  MembersListChanged = 'MEMBERS_LIST_CHANGED'
}

export enum Emoji {
  // Skill emojis
  overall = '<:overall:720446212356177951>',
  attack = '<:attack:706462610840879146>',
  defence = '<:defence:706462611000000589>',
  strength = '<:strength:706462610916114483>',
  hitpoints = '<:hitpoints:706462611050332258>',
  ranged = '<:ranged:706462611222429796>',
  prayer = '<:prayer:706462610949931049>',
  magic = '<:magic:706462611243532330>',
  cooking = '<:cooking:706462611075629128>',
  woodcutting = '<:woodcutting:706462611205783562>',
  fletching = '<:fletching:706462611075629138>',
  fishing = '<:fishing:706462611415236618>',
  firemaking = '<:firemaking:706462611209977907>',
  crafting = '<:crafting:706462610920308761>',
  smithing = '<:smithing:706462610945736706>',
  mining = '<:mining:706462611134349413>',
  herblore = '<:herblore:706462611012583456>',
  agility = '<:agility:706462611121897483>',
  thieving = '<:thieving:706462611214172240>',
  slayer = '<:slayer:706462611222298654>',
  farming = '<:farming:706462611364904980>',
  runecrafting = '<:runecrafting:706462611327287347>',
  hunter = '<:hunter:706462611218366534>',
  construction = '<:construction:706462610853330986>',
  combat = '<:combat:795682554896318465>',

  // Boss emojis
  abyssal_sire = '<:abyssal_sire:729839920969023519>',
  alchemical_hydra = '<:alchemical_hydra:729839921207967765>',
  barrows_chests = '<:barrows_chests:729839921484923000>',
  bryophyta = '<:bryophyta:730167225226362952>',
  callisto = '<:callisto:729839921170481153>',
  cerberus = '<:cerberus:729839921401167954>',
  chambers_of_xeric = '<:chambers_of_xeric:729839921640112177>',
  chambers_of_xeric_challenge_mode = '<:chambers_of_xeric_challenge_mode:729839921841438750>',
  chaos_elemental = '<:chaos_elemental:729839921401167916>',
  chaos_fanatic = '<:chaos_fanatic:730168253258793063>',
  commander_zilyana = '<:commander_zilyana:729839921430396970>',
  corporeal_beast = '<:corporeal_beast:729839921585717310>',
  crazy_archaeologist = '<:crazy_archaeologist:729839922021662822>',
  dagannoth_prime = '<:dagannoth_prime:729839922101485649>',
  dagannoth_rex = '<:dagannoth_rex:729839922097422336>',
  dagannoth_supreme = '<:dagannoth_supreme:729839921959010345>',
  deranged_archaeologist = '<:deranged_archaeologist:729839922139234374>',
  general_graardor = '<:general_graardor:729839922298618026>',
  giant_mole = '<:giant_mole:729839922076319875>',
  grotesque_guardians = '<:grotesque_guardians:729839922286166086>',
  hespori = '<:hespori:730169239339794624>',
  kalphite_queen = '<:kalphite_queen:729840084609663027>',
  king_black_dragon = '<:king_black_dragon:729840084609794099>',
  kraken = '<:kraken:729840084798406767>',
  kreearra = '<:kreearra:729840085033287680>',
  kril_tsutsaroth = '<:kril_tsutsaroth:729840084781760574>',
  mimic = '<:mimic:730169728357761145>',
  nightmare = '<:nightmare:729840084844675103>',
  phosanis_nightmare = '<:phosanis_nightmare:859756301651148850>',
  obor = '<:obor:729840084907589674>',
  sarachnis = '<:sarachnis:729840085377220628>',
  scorpia = '<:scorpia:729840084962115666>',
  skotizo = '<:skotizo:729840085398454273>',
  tempoross = '<:tempoross:823292463456059452>',
  the_gauntlet = '<:the_gauntlet:729840085473820805>',
  the_corrupted_gauntlet = '<:the_corrupted_gauntlet:729840085159247873>',
  theatre_of_blood = '<:theatre_of_blood:729840085406711819>',
  theatre_of_blood_hard_mode = '<:theatre_of_blood_hard_mode:850017967164751933>',
  thermonuclear_smoke_devil = '<:thermonuclear_smoke_devil:729840085729673326>',
  tzkal_zuk = '<:tzkal_zuk:729840085373157497>',
  tztok_jad = '<:tztok_jad:729840085805170698>',
  venenatis = '<:venenatis:729840086795157595>',
  vetion = '<:vetion:729840085553381387>',
  vorkath = '<:vorkath:729840086056960100>',
  wintertodt = '<:wintertodt:730170636189696071>',
  zalcano = '<:zalcano:729840085587066882>',
  zulrah = '<:zulrah:729840085721284629>',

  // Activity emojis
  league_points = '<:league_points:729840084865515593>',
  last_man_standing = '<:last_man_standing:729840085176025088>',
  bounty_hunter_hunter = '<:bounty_hunter_hunter:730171196410298378>',
  bounty_hunter_rogue = '<:bounty_hunter_rogue:730171196561293392>',
  clue = '<:clue_scrolls_all:729844134004785204>',
  soul_wars_zeal = '<:soul_wars_zeal:796447053160906772>',

  ehp = '<:ehp:766260738221670432>',
  ehb = '<:ehb:766260773617795103>',

  success = '✅',
  error = '❌',
  warning = '⚠️',
  tada = '🎉',
  wave = '👋',
  speaker = '📢',
  gold_medal = '🥇',
  silver_medal = '🥈',
  bronze_medal = '🥉',
  clock = '🕒',
  crown = '👑',
  heart = '❤️',
  info = 'ℹ️',
  grave = '🪦'
}
