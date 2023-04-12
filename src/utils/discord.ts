import { Metric, parseMetricAbbreviation } from '@wise-old-man/utils';
import { Channel, DMChannel, GuildMember, PermissionResolvable, TextChannel } from 'discord.js';
import config from '../config';

export const MAX_FIELD_SIZE = 25;

// To find the ID of an emoji, type: \:emoji: in Discord chat
// Ex: \:zulrah:
const MetricEmoji = {
  // Skill emojis
  [Metric.OVERALL]: '<:overall:720446212356177951>',
  [Metric.ATTACK]: '<:attack:706462610840879146>',
  [Metric.DEFENCE]: '<:defence:706462611000000589>',
  [Metric.STRENGTH]: '<:strength:706462610916114483>',
  [Metric.HITPOINTS]: '<:hitpoints:706462611050332258>',
  [Metric.RANGED]: '<:ranged:706462611222429796>',
  [Metric.PRAYER]: '<:prayer:706462610949931049>',
  [Metric.MAGIC]: '<:magic:706462611243532330>',
  [Metric.COOKING]: '<:cooking:706462611075629128>',
  [Metric.WOODCUTTING]: '<:woodcutting:706462611205783562>',
  [Metric.FLETCHING]: '<:fletching:706462611075629138>',
  [Metric.FISHING]: '<:fishing:706462611415236618>',
  [Metric.FIREMAKING]: '<:firemaking:706462611209977907>',
  [Metric.CRAFTING]: '<:crafting:706462610920308761>',
  [Metric.SMITHING]: '<:smithing:706462610945736706>',
  [Metric.MINING]: '<:mining:706462611134349413>',
  [Metric.HERBLORE]: '<:herblore:706462611012583456>',
  [Metric.AGILITY]: '<:agility:706462611121897483>',
  [Metric.THIEVING]: '<:thieving:706462611214172240>',
  [Metric.SLAYER]: '<:slayer:706462611222298654>',
  [Metric.FARMING]: '<:farming:706462611364904980>',
  [Metric.RUNECRAFTING]: '<:runecrafting:706462611327287347>',
  [Metric.HUNTER]: '<:hunter:706462611218366534>',
  [Metric.CONSTRUCTION]: '<:construction:706462610853330986>',
  // Boss emojis
  [Metric.ABYSSAL_SIRE]: '<:abyssal_sire:729839920969023519>',
  [Metric.ALCHEMICAL_HYDRA]: '<:alchemical_hydra:729839921207967765>',
  [Metric.ARTIO]: '<:callisto:729839921170481153>',
  [Metric.BARROWS_CHESTS]: '<:barrows_chests:729839921484923000>',
  [Metric.BRYOPHYTA]: '<:bryophyta:730167225226362952>',
  [Metric.CALLISTO]: '<:callisto:729839921170481153>',
  [Metric.CALVARION]: '<:vetion:729840085553381387>',
  [Metric.CERBERUS]: '<:cerberus:729839921401167954>',
  [Metric.CHAMBERS_OF_XERIC]: '<:chambers_of_xeric:729839921640112177>',
  [Metric.CHAMBERS_OF_XERIC_CM]: '<:chambers_of_xeric_challenge_mode:729839921841438750>',
  [Metric.CHAOS_ELEMENTAL]: '<:chaos_elemental:729839921401167916>',
  [Metric.CHAOS_FANATIC]: '<:chaos_fanatic:730168253258793063>',
  [Metric.COMMANDER_ZILYANA]: '<:commander_zilyana:729839921430396970>',
  [Metric.CORPOREAL_BEAST]: '<:corporeal_beast:729839921585717310>',
  [Metric.CRAZY_ARCHAEOLOGIST]: '<:crazy_archaeologist:729839922021662822>',
  [Metric.DAGANNOTH_PRIME]: '<:dagannoth_prime:729839922101485649>',
  [Metric.DAGANNOTH_REX]: '<:dagannoth_rex:729839922097422336>',
  [Metric.DAGANNOTH_SUPREME]: '<:dagannoth_supreme:729839921959010345>',
  [Metric.DERANGED_ARCHAEOLOGIST]: '<:deranged_archaeologist:729839922139234374>',
  [Metric.GENERAL_GRAARDOR]: '<:general_graardor:729839922298618026>',
  [Metric.GIANT_MOLE]: '<:giant_mole:729839922076319875>',
  [Metric.GROTESQUE_GUARDIANS]: '<:grotesque_guardians:729839922286166086>',
  [Metric.HESPORI]: '<:hespori:730169239339794624>',
  [Metric.KALPHITE_QUEEN]: '<:kalphite_queen:729840084609663027>',
  [Metric.KING_BLACK_DRAGON]: '<:king_black_dragon:729840084609794099>',
  [Metric.KRAKEN]: '<:kraken:729840084798406767>',
  [Metric.KREEARRA]: '<:kreearra:729840085033287680>',
  [Metric.KRIL_TSUTSAROTH]: '<:kril_tsutsaroth:729840084781760574>',
  [Metric.MIMIC]: '<:mimic:730169728357761145>',
  [Metric.NEX]: '<:nex:927846096611475466>',
  [Metric.NIGHTMARE]: '<:nightmare:729840084844675103>',
  [Metric.PHOSANIS_NIGHTMARE]: '<:phosanis_nightmare:859756301651148850>',
  [Metric.OBOR]: '<:obor:729840084907589674>',
  [Metric.PHANTOM_MUSPAH]: '<:phantom_muspah:1062744540307529738>',
  [Metric.SARACHNIS]: '<:sarachnis:729840085377220628>',
  [Metric.SCORPIA]: '<:scorpia:729840084962115666>',
  [Metric.SKOTIZO]: '<:skotizo:729840085398454273>',
  [Metric.SPINDEL]: '<:venenatis:729840086795157595>',
  [Metric.TEMPOROSS]: '<:tempoross:823292463456059452>',
  [Metric.THE_GAUNTLET]: '<:the_gauntlet:729840085473820805>',
  [Metric.THE_CORRUPTED_GAUNTLET]: '<:the_corrupted_gauntlet:729840085159247873>',
  [Metric.THEATRE_OF_BLOOD]: '<:theatre_of_blood:729840085406711819>',
  [Metric.THEATRE_OF_BLOOD_HARD_MODE]: '<:theatre_of_blood_hard_mode:850017967164751933>',
  [Metric.THERMONUCLEAR_SMOKE_DEVIL]: '<:thermonuclear_smoke_devil:729840085729673326>',
  [Metric.TOMBS_OF_AMASCUT]: '<:tombs_of_amascut:1011399670125314108>',
  [Metric.TOMBS_OF_AMASCUT_EXPERT]: '<:tombs_of_amascut_expert:1011399690908078190>',
  [Metric.TZKAL_ZUK]: '<:tzkal_zuk:729840085373157497>',
  [Metric.TZTOK_JAD]: '<:tztok_jad:729840085805170698>',
  [Metric.VENENATIS]: '<:venenatis:729840086795157595>',
  [Metric.VETION]: '<:vetion:729840085553381387>',
  [Metric.VORKATH]: '<:vorkath:729840086056960100>',
  [Metric.WINTERTODT]: '<:wintertodt:730170636189696071>',
  [Metric.ZALCANO]: '<:zalcano:729840085587066882>',
  [Metric.ZULRAH]: '<:zulrah:729840085721284629>',
  // Activity emojis
  [Metric.LEAGUE_POINTS]: '<:league_points:729840084865515593>',
  [Metric.LAST_MAN_STANDING]: '<:last_man_standing:729840085176025088>',
  [Metric.PVP_ARENA]: '<:pvp_arena:996966253765853244>',
  [Metric.BOUNTY_HUNTER_HUNTER]: '<:bounty_hunter_hunter:730171196410298378>',
  [Metric.BOUNTY_HUNTER_ROGUE]: '<:bounty_hunter_rogue:730171196561293392>',
  [Metric.CLUE_SCROLLS_ALL]: '<:clue_scrolls_all:729844134004785204>',
  [Metric.SOUL_WARS_ZEAL]: '<:soul_wars_zeal:1011956473615630396>',
  [Metric.GUARDIANS_OF_THE_RIFT]: '<:guardians_of_the_rift:963939589070934046>',
  // Computed metric emojis
  [Metric.EHP]: '<:ehp:766260738221670432>',
  [Metric.EHB]: '<:ehb:766260773617795103>'
} as const;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.permissions.has('ADMINISTRATOR') : false;
}

export function hasModeratorRole(member: GuildMember | null): boolean {
  if (!member) return false;
  if (!member.roles || !member.roles.cache) return false;

  return member.roles.cache.some(r => r.id === config.discord.roles.moderator);
}

export function getMissingPermissions(channel: TextChannel) {
  return [...config.requiredPermissions, 'SEND_MESSAGES'].filter(permission => {
    return !clientUserPermissions(channel)?.has(permission as PermissionResolvable);
  });
}

export function isChannelSendable(channel: Channel | undefined | null): channel is TextChannel {
  if (!channel) return false;
  if (!channel.isText()) return false;
  if (!('guild' in channel)) return true;

  const canView = clientUserPermissions(channel as TextChannel)?.has('VIEW_CHANNEL');

  if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel) && canView) {
    return false;
  }

  return true;
}

export function getEmoji(metric: string): string {
  const emojiKey = metric.startsWith('clue')
    ? Metric.CLUE_SCROLLS_ALL
    : parseMetricAbbreviation(metric) || metric.toLocaleLowerCase();

  return MetricEmoji[emojiKey];
}

const clientUserPermissions = (channel: TextChannel) =>
  channel.client.user ? channel.permissionsFor(channel.client.user) : null;
