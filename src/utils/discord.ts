import { GroupRole, Metric } from '@wise-old-man/utils';
import {
  Channel,
  DMChannel,
  Guild,
  GuildMember,
  EmbedBuilder,
  NewsChannel,
  PermissionResolvable,
  TextChannel,
  User,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';
import config from '../config';
import { parseMetricAbbreviation } from '../services/wiseoldman';

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
  [Metric.AMOXLIATL]: '<:amoxliatl:1288583172342288515>',
  [Metric.ARAXXOR]: '<:araxxor:1278337345069781082>',
  [Metric.ARTIO]: '<:callisto:729839921170481153>',
  [Metric.BARROWS_CHESTS]: '<:barrows_chests:729839921484923000>',
  [Metric.BRYOPHYTA]: '<:bryophyta:1283096848017391646>',
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
  [Metric.DUKE_SUCELLUS]: '<:duke_sucellus:1133832623458881586>',
  [Metric.GENERAL_GRAARDOR]: '<:general_graardor:729839922298618026>',
  [Metric.GIANT_MOLE]: '<:giant_mole:729839922076319875>',
  [Metric.GROTESQUE_GUARDIANS]: '<:grotesque_guardians:729839922286166086>',
  [Metric.HESPORI]: '<:hespori:730169239339794624>',
  [Metric.KALPHITE_QUEEN]: '<:kalphite_queen:729840084609663027>',
  [Metric.KING_BLACK_DRAGON]: '<:king_black_dragon:729840084609794099>',
  [Metric.KRAKEN]: '<:kraken:729840084798406767>',
  [Metric.KREEARRA]: '<:kreearra:729840085033287680>',
  [Metric.KRIL_TSUTSAROTH]: '<:kril_tsutsaroth:729840084781760574>',
  [Metric.LUNAR_CHESTS]: '<:lunar_chests:1220023608383115275>',
  [Metric.MIMIC]: '<:mimic:730169728357761145>',
  [Metric.NEX]: '<:nex:927846096611475466>',
  [Metric.NIGHTMARE]: '<:nightmare:729840084844675103>',
  [Metric.PHOSANIS_NIGHTMARE]: '<:phosanis_nightmare:859756301651148850>',
  [Metric.OBOR]: '<:obor:729840084907589674>',
  [Metric.PHANTOM_MUSPAH]: '<:phantom_muspah:1097840588000337973>',
  [Metric.SARACHNIS]: '<:sarachnis:729840085377220628>',
  [Metric.SCORPIA]: '<:scorpia:729840084962115666>',
  [Metric.SCURRIUS]: '<:scurrius:1199712038193217606>',
  [Metric.SKOTIZO]: '<:skotizo:729840085398454273>',
  [Metric.SOL_HEREDIT]: '<:sol_heredit:1220023750339334154>',
  [Metric.SPINDEL]: '<:venenatis:729840086795157595>',
  [Metric.TEMPOROSS]: '<:tempoross:823292463456059452>',
  [Metric.THE_GAUNTLET]: '<:the_gauntlet:729840085473820805>',
  [Metric.THE_CORRUPTED_GAUNTLET]: '<:the_corrupted_gauntlet:729840085159247873>',
  [Metric.THE_HUEYCOATL]: '<:the_hueycoatl:1288583174217269358>',
  [Metric.THE_LEVIATHAN]: '<:the_leviathan:1133832625006592021>',
  [Metric.THE_WHISPERER]: '<:the_whisperer:1133832628114567242>',
  [Metric.THEATRE_OF_BLOOD]: '<:theatre_of_blood:729840085406711819>',
  [Metric.THEATRE_OF_BLOOD_HARD_MODE]: '<:theatre_of_blood_hard_mode:850017967164751933>',
  [Metric.THERMONUCLEAR_SMOKE_DEVIL]: '<:thermonuclear_smoke_devil:729840085729673326>',
  [Metric.TOMBS_OF_AMASCUT]: '<:tombs_of_amascut:1011399670125314108>',
  [Metric.TOMBS_OF_AMASCUT_EXPERT]: '<:tombs_of_amascut_expert:1011399690908078190>',
  [Metric.TZKAL_ZUK]: '<:tzkal_zuk:729840085373157497>',
  [Metric.TZTOK_JAD]: '<:tztok_jad:729840085805170698>',
  [Metric.VARDORVIS]: '<:vardorvis:1133832631419670700>',
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
  [Metric.COLOSSEUM_GLORY]: '<:colosseum_glory:1220023685881139312>',
  // Computed metric emojis
  [Metric.EHP]: '<:ehp:766260738221670432>',
  [Metric.EHB]: '<:ehb:766260773617795103>'
} as const;

const GroupRoleEmoji = {
  [GroupRole.ACHIEVER]: '<:achiever:1159528170580627517>',
  [GroupRole.ADAMANT]: '<:adamant:1159528172593885264>',
  [GroupRole.ADEPT]: '<:adept:1159528174707806252>',
  [GroupRole.ADMINISTRATOR]: '<:administrator:1159528176234537062>',
  [GroupRole.ADVENTURER]: '<:adventurer:1159528178323308665>',
  [GroupRole.AIR]: '<:air:1159528235290329118>',
  [GroupRole.ANCHOR]: '<:anchor:1159528236104044616>',
  [GroupRole.APOTHECARY]: '<:apothecary:1159528238423486614>',
  [GroupRole.ARCHER]: '<:archer:1159528240034091028>',
  [GroupRole.ARMADYLEAN]: '<:armadylean:1159528242131255367>',
  [GroupRole.ARTILLERY]: '<:artillery:1159528311626670200>',
  [GroupRole.ARTISAN]: '<:artisan:1159528314487177328>',
  [GroupRole.ASGARNIAN]: '<:asgarnian:1159528315963592806>',
  [GroupRole.ASSASSIN]: '<:assassin:1159528318446600312>',
  [GroupRole.ASSISTANT]: '<:assistant:1159528319847514172>',
  [GroupRole.ASTRAL]: '<:astral:1159528414617800724>',
  [GroupRole.ATHLETE]: '<:athlete:1159528417079869552>',
  [GroupRole.ATTACKER]: '<:attacker:1159528418665304095>',
  [GroupRole.BANDIT]: '<:bandit:1159528420192047105>',
  [GroupRole.BANDOSIAN]: '<:bandosian:1159528422406623312>',
  [GroupRole.BARBARIAN]: '<:barbarian:1159528469118591127>',
  [GroupRole.BATTLEMAGE]: '<:battlemage:1159528495572062308>',
  [GroupRole.BEAST]: '<:beast:1159528508855431209>',
  [GroupRole.BERSERKER]: '<:berserker:1159528521299939428>',
  [GroupRole.BLISTERWOOD]: '<:blisterwood:1159528531148144640>',
  [GroupRole.BLOOD]: '<:blood:1159528541768122518>',
  [GroupRole.BLUE]: '<:blue:1159528554627862579>',
  [GroupRole.BOB]: '<:bob:1159528565365293177>',
  [GroupRole.BODY]: '<:body:1159528576790581338>',
  [GroupRole.BRASSICAN]: '<:brassican:1159528585837674627>',
  [GroupRole.BRAWLER]: '<:brawler:1159528595920801853>',
  [GroupRole.BRIGADIER]: '<:brigadier:1159528610051395726>',
  [GroupRole.BRIGAND]: '<:brigand:1159528621724139660>',
  [GroupRole.BRONZE]: '<:bronze:1159528638845292674>',
  [GroupRole.BRUISER]: '<:bruiser:1159528651474342039>',
  [GroupRole.BULWARK]: '<:bulwark:1159528665172934686>',
  [GroupRole.BURGLAR]: '<:burglar:1159528677248348231>',
  [GroupRole.BURNT]: '<:burnt:1159528690040979597>',
  [GroupRole.CADET]: '<:cadet:1159528703269818469>',
  [GroupRole.CAPTAIN]: '<:captain:1159528714430853181>',
  [GroupRole.CARRY]: '<:carry:1159528729656180776>',
  [GroupRole.CHAMPION]: '<:champion:1159528758999527484>',
  [GroupRole.CHAOS]: '<:chaos:1159528774480711720>',
  [GroupRole.ADMIRAL]: '<:admiral:1159528784484126801>',
  [GroupRole.CLERIC]: '<:cleric:1159528798602133666>',
  [GroupRole.COLLECTOR]: '<:collector:1159528810316828734>',
  [GroupRole.COLONEL]: '<:colonel:1159528823138828389>',
  [GroupRole.COMMANDER]: '<:commander:1159530393503027312>',
  [GroupRole.COMPETITOR]: '<:competitor:1159530424989655163>',
  [GroupRole.COMPLETIONIST]: '<:completionist:1159530440789598259>',
  [GroupRole.CONSTRUCTOR]: '<:constructor:1159532063238672395>',
  [GroupRole.COOK]: '<:cook:1159532065541333044>',
  [GroupRole.COORDINATOR]: '<:coordinator:1159532066904477747>',
  [GroupRole.CORPORAL]: '<:corporal:1159532068355702784>',
  [GroupRole.COSMIC]: '<:cosmic:1159532070490607720>',
  [GroupRole.COUNCILLOR]: '<:councillor:1159532086223450212>',
  [GroupRole.CRAFTER]: '<:crafter:1159532121623375905>',
  [GroupRole.CREW]: '<:crew:1159532132545351794>',
  [GroupRole.CRUSADER]: '<:crusader:1159532144713023589>',
  [GroupRole.CUTPURSE]: '<:cutpurse:1159532155530129602>',
  [GroupRole.DEATH]: '<:death:1159532166275928164>',
  [GroupRole.DEFENDER]: '<:defender:1159532179420872736>',
  [GroupRole.DEFILER]: '<:defiler:1159532191957647390>',
  [GroupRole.DEPUTY_OWNER]: '<:deputy_owner:1159532203114516560>',
  [GroupRole.DESTROYER]: '<:destroyer:1159532213147275304>',
  [GroupRole.DIAMOND]: '<:diamond:1159532225973473381>',
  [GroupRole.DISEASED]: '<:diseased:1159532239126790294>',
  [GroupRole.DOCTOR]: '<:doctor:1159532255379738775>',
  [GroupRole.DOGSBODY]: '<:dogsbody:1159532266666606653>',
  [GroupRole.DRAGON]: '<:dragon:1159532279668932618>',
  [GroupRole.DRAGONSTONE]: '<:dragonstone:1159532293380120636>',
  [GroupRole.DRUID]: '<:druid:1159532305363259434>',
  [GroupRole.DUELLIST]: '<:duellist:1159532315672842330>',
  [GroupRole.EARTH]: '<:earth:1159532326657736734>',
  [GroupRole.ELITE]: '<:elite:1159532338909286471>',
  [GroupRole.EMERALD]: '<:emerald:1159532350015807600>',
  [GroupRole.ENFORCER]: '<:enforcer:1159532367870951425>',
  [GroupRole.EPIC]: '<:epic:1159532382144188508>',
  [GroupRole.EXECUTIVE]: '<:executive:1159532393347174450>',
  [GroupRole.EXPERT]: '<:expert:1159532404587888690>',
  [GroupRole.EXPLORER]: '<:explorer:1159532415157543042>',
  [GroupRole.FARMER]: '<:farmer:1159532426121461893>',
  [GroupRole.FEEDER]: '<:feeder:1159532437412515860>',
  [GroupRole.FIGHTER]: '<:fighter:1159532448657453096>',
  [GroupRole.FIRE]: '<:fire:1159532460942569583>',
  [GroupRole.FIREMAKER]: '<:firemaker:1159532476394389615>',
  [GroupRole.FIRESTARTER]: '<:firestarter:1159532487979040898>',
  [GroupRole.FISHER]: '<:fisher:1159532498594844693>',
  [GroupRole.FLETCHER]: '<:fletcher:1159532508891852881>',
  [GroupRole.FORAGER]: '<:forager:1159532520589770812>',
  [GroupRole.FREMENNIK]: '<:fremennik:1159532535718617168>',
  [GroupRole.GAMER]: '<:gamer:1159532551686340737>',
  [GroupRole.GATHERER]: '<:gatherer:1159532562734120980>',
  [GroupRole.GENERAL]: '<:general:1159532573584789524>',
  [GroupRole.GNOME_CHILD]: '<:gnome_child:1159532586255790290>',
  [GroupRole.GNOME_ELDER]: '<:gnome_elder:1159532597261647932>',
  [GroupRole.GOBLIN]: '<:goblin:1159532625636098149>',
  [GroupRole.GOLD]: '<:gold:1159532637183021157>',
  [GroupRole.GOON]: '<:goon:1159532648243417138>',
  [GroupRole.GREEN]: '<:green:1159532658217455616>',
  [GroupRole.GREY]: '<:grey:1159535994299760681>',
  [GroupRole.GUARDIAN]: '<:guardian:1159535996795375756>',
  [GroupRole.GUTHIXIAN]: '<:guthixian:1159535999806873732>',
  [GroupRole.HARPOON]: '<:harpoon:1159536002210201681>',
  [GroupRole.HEALER]: '<:healer:1159536003413987400>',
  [GroupRole.HELLCAT]: '<:hellcat:1159536006337413191>',
  [GroupRole.HELPER]: '<:helper:1159536008308740127>',
  [GroupRole.HERBOLOGIST]: '<:herbologist:1159536010703687751>',
  [GroupRole.HERO]: '<:hero:1159536012771467315>',
  [GroupRole.HOARDER]: '<:hoarder:1159536025920602206>',
  [GroupRole.HOLY]: '<:holy:1159536047730982992>',
  [GroupRole.HUNTER]: '<:hunter:1159536059613466654>',
  [GroupRole.IGNITOR]: '<:ignitor:1159536068429885480>',
  [GroupRole.ILLUSIONIST]: '<:illusionist:1159536081293811878>',
  [GroupRole.IMP]: '<:imp:1159536100969304075>',
  [GroupRole.INFANTRY]: '<:infantry:1159536110326784103>',
  [GroupRole.INQUISITOR]: '<:inquisitor:1159536120393121864>',
  [GroupRole.IRON]: '<:iron:1159536292594450442>',
  [GroupRole.JADE]: '<:jade:1159536302136512604>',
  [GroupRole.JUSTICIAR]: '<:justiciar:1159536333144993843>',
  [GroupRole.KANDARIN]: '<:kandarin:1159536366502301696>',
  [GroupRole.KARAMJAN]: '<:karamjan:1159536369031467138>',
  [GroupRole.KHARIDIAN]: '<:kharidian:1159536370826616902>',
  [GroupRole.KITTEN]: '<:kitten:1159536373636808875>',
  [GroupRole.KNIGHT]: '<:knight:1159536374999957574>',
  [GroupRole.LABOURER]: '<:labourer:1159536405312188567>',
  [GroupRole.LAW]: '<:law:1159536407455481876>',
  [GroupRole.LEADER]: '<:leader:1159536408902504529>',
  [GroupRole.LEARNER]: '<:learner:1159536410290819215>',
  [GroupRole.LEGACY]: '<:legacy:1159536412727705652>',
  [GroupRole.LEGEND]: '<:legend:1159536446663839825>',
  [GroupRole.LEGIONNAIRE]: '<:legionnaire:1159536448861638758>',
  [GroupRole.LIEUTENANT]: '<:lieutenant:1159536450199629955>',
  [GroupRole.LOOTER]: '<:looter:1159536451525038181>',
  [GroupRole.LUMBERJACK]: '<:lumberjack:1159536453634752532>',
  [GroupRole.MAGIC]: '<:magic:1159536481753374932>',
  [GroupRole.MAGICIAN]: '<:magician:1159536483087175760>',
  [GroupRole.MAJOR]: '<:major:1159536485222064179>',
  [GroupRole.MAPLE]: '<:maple:1159536486874632192>',
  [GroupRole.MARSHAL]: '<:marshal:1159536489512828969>',
  [GroupRole.MASTER]: '<:master:1159536508282339339>',
  [GroupRole.MAXED]: '<:maxed:1159536531866923008>',
  [GroupRole.MEDIATOR]: '<:mediator:1159536546580549633>',
  [GroupRole.MEDIC]: '<:medic:1159536557162778847>',
  [GroupRole.MENTOR]: '<:mentor:1159536571607961660>',
  [GroupRole.MERCHANT]: '<:merchant:1159536587193974945>',
  [GroupRole.MIND]: '<:mind:1159536599059681341>',
  [GroupRole.MINER]: '<:miner:1159536614637305887>',
  [GroupRole.MINION]: '<:minion:1159537406974890144>',
  [GroupRole.MEMBER]: '<:minion:1159537406974890144>', // Member is minion as default
  [GroupRole.MISTHALINIAN]: '<:misthalinian:1159537434837667851>',
  [GroupRole.MITHRIL]: '<:mithril:1159537441598877727>',
  [GroupRole.MODERATOR]: '<:moderator:1159537443276607649>',
  [GroupRole.MONARCH]: '<:monarch:1159537444836872234>',
  [GroupRole.MORYTANIAN]: '<:morytanian:1159537446560727100>',
  [GroupRole.MYSTIC]: '<:mystic:1159537448649502721>',
  [GroupRole.MYTH]: '<:myth:1159537450557915246>',
  [GroupRole.NATURAL]: '<:natural:1159537453154173089>',
  [GroupRole.NATURE]: '<:nature:1159537454613803059>',
  [GroupRole.NECROMANCER]: '<:necromancer:1159537457239429212>',
  [GroupRole.NINJA]: '<:ninja:1159537492026982400>',
  [GroupRole.NOBLE]: '<:noble:1159537505373257828>',
  [GroupRole.NOVICE]: '<:novice:1159537514642685962>',
  [GroupRole.NURSE]: '<:nurse:1159537522993528862>',
  [GroupRole.OAK]: '<:oak:1159537537279344851>',
  [GroupRole.OFFICER]: '<:officer:1159537546817196033>',
  [GroupRole.ONYX]: '<:onyx:1159537556556349491>',
  [GroupRole.OPAL]: '<:opal:1159537570674397310>',
  [GroupRole.ORACLE]: '<:oracle:1159537578945564722>',
  [GroupRole.ORANGE]: '<:orange:1159537613523398707>',
  [GroupRole.OWNER]: '<:owner:1159537616211955762>',
  [GroupRole.PAGE]: '<:page:1159537618061631549>',
  [GroupRole.PALADIN]: '<:paladin:1159537620188135485>',
  [GroupRole.PAWN]: '<:pawn:1159537621630976040>',
  [GroupRole.PILGRIM]: '<:pilgrim:1159537623140945980>',
  [GroupRole.PINE]: '<:pine:1159537625330360381>',
  [GroupRole.PINK]: '<:pink:1159537626760618016>',
  [GroupRole.PREFECT]: '<:prefect:1159537629411426415>',
  [GroupRole.PRIEST]: '<:priest:1159537630938144798>',
  [GroupRole.PRIVATE]: '<:private:1159537680179265596>',
  [GroupRole.PRODIGY]: '<:prodigy:1159537682574225511>',
  [GroupRole.PROSELYTE]: '<:proselyte:1159537684033835108>',
  [GroupRole.PROSPECTOR]: '<:prospector:1159537686755950614>',
  [GroupRole.PROTECTOR]: '<:protector:1159537688177819738>',
  [GroupRole.PURE]: '<:pure:1159537740451418132>',
  [GroupRole.PURPLE]: '<:purple:1159537742670205139>',
  [GroupRole.PYROMANCER]: '<:pyromancer:1159537745509753053>',
  [GroupRole.QUESTER]: '<:quester:1159537749016182884>',
  [GroupRole.RACER]: '<:racer:1159537751373398077>',
  [GroupRole.RAIDER]: '<:raider:1159537794159476817>',
  [GroupRole.RANGER]: '<:ranger:1159537796978057327>',
  [GroupRole.RECORD_CHASER]: '<:recordchaser:1159537799314288682>',
  [GroupRole.RECRUIT]: '<:recruit:1159537802430660722>',
  [GroupRole.RECRUITER]: '<:recruiter:1159537805354094673>',
  [GroupRole.RED]: '<:red:1159537823196659752>',
  [GroupRole.RED_TOPAZ]: '<:red_topaz:1159537831765622784>',
  [GroupRole.ROGUE]: '<:rogue:1159537840720449680>',
  [GroupRole.RUBY]: '<:ruby:1159537856226799689>',
  [GroupRole.RUNE]: '<:rune:1159537866238595194>',
  [GroupRole.RUNECRAFTER]: '<:runecrafter:1159538891020308622>',
  [GroupRole.SAGE]: '<:sage:1159538893167804476>',
  [GroupRole.SAPPHIRE]: '<:sapphire:1159538894707109888>',
  [GroupRole.SARADOMINIST]: '<:saradominist:1159538896179306616>',
  [GroupRole.SAVIOUR]: '<:saviour:1159538898192584704>',
  [GroupRole.SCAVENGER]: '<:scavenger:1159538899039817822>',
  [GroupRole.SCHOLAR]: '<:scholar:1159538900893716490>',
  [GroupRole.SCOURGE]: '<:scourge:1159538903548698624>',
  [GroupRole.SCOUT]: '<:scout:1159538904672763965>',
  [GroupRole.SCRIBE]: '<:scribe:1159538907013185577>',
  [GroupRole.SEER]: '<:seer:1159538957852352575>',
  [GroupRole.SENATOR]: '<:senator:1159538960394104913>',
  [GroupRole.SENTRY]: '<:sentry:1159538961576902659>',
  [GroupRole.SERENIST]: '<:serenist:1159538963577569300>',
  [GroupRole.SERGEANT]: '<:sergeant:1159538965603434576>',
  [GroupRole.SHAMAN]: '<:shaman:1159538966958182420>',
  [GroupRole.SHERIFF]: '<:sheriff:1159538969252479087>',
  [GroupRole.SHORT_GREEN_GUY]: '<:short_green_guy:1159538970649178132>',
  [GroupRole.SKILLER]: '<:skiller:1159538971957805057>',
  [GroupRole.SKULLED]: '<:skulled:1159538974155620363>',
  [GroupRole.SLAYER]: '<:slayer:1159539033907666954>',
  [GroupRole.SMITER]: '<:smiter:1159539035593789450>',
  [GroupRole.SMITH]: '<:smith:1159539037841932358>',
  [GroupRole.SMUGGLER]: '<:smuggler:1159539039272177714>',
  [GroupRole.SNIPER]: '<:sniper:1159539041419669646>',
  [GroupRole.SOUL]: '<:soul:1159539042812186734>',
  [GroupRole.SPECIALIST]: '<:specialist:1159539045458788454>',
  [GroupRole.SPEED_RUNNER]: '<:speedrunner:1159539046796771348>',
  [GroupRole.SPELLCASTER]: '<:spellcaster:1159539048294142022>',
  [GroupRole.SQUIRE]: '<:squire:1159539050210938890>',
  [GroupRole.STAFF]: '<:staff:1159539132708683866>',
  [GroupRole.STEEL]: '<:steel:1159539135787319357>',
  [GroupRole.STRIDER]: '<:strider:1159539137108525156>',
  [GroupRole.STRIKER]: '<:striker:1159539139570573322>',
  [GroupRole.SUMMONER]: '<:summoner:1159539141202149498>',
  [GroupRole.SUPERIOR]: '<:superior:1159539144037519361>',
  [GroupRole.SUPERVISOR]: '<:supervisor:1159539145920753674>',
  [GroupRole.TEACHER]: '<:teacher:1159539149125201960>',
  [GroupRole.TEMPLAR]: '<:templar:1159539150521905192>',
  [GroupRole.THERAPIST]: '<:therapist:1159539152887484506>',
  [GroupRole.THIEF]: '<:thief:1159539212102680576>',
  [GroupRole.TIRANNIAN]: '<:tirannian:1159539214833160273>',
  [GroupRole.TRIALIST]: '<:trialist:1159539216536064020>',
  [GroupRole.TRICKSTER]: '<:trickster:1159539218549321750>',
  [GroupRole.TZKAL]: '<:tzkal:1159539220369657931>',
  [GroupRole.TZTOK]: '<:tztok:1159539221841846344>',
  [GroupRole.UNHOLY]: '<:unholy:1159539224463290430>',
  [GroupRole.VAGRANT]: '<:vagrant:1159539226262646955>',
  [GroupRole.VANGUARD]: '<:vanguard:1159539227801944064>',
  [GroupRole.WALKER]: '<:walker:1159539230146560020>',
  [GroupRole.WANDERER]: '<:wanderer:1159539583000780881>',
  [GroupRole.WARDEN]: '<:warden:1159539584359727247>',
  [GroupRole.WARLOCK]: '<:warlock:1159539586666610749>',
  [GroupRole.WARRIOR]: '<:warrior:1159539589178990642>',
  [GroupRole.WATER]: '<:water:1159539590479229100>',
  [GroupRole.WILD]: '<:wild:1159539592236650597>',
  [GroupRole.WILLOW]: '<:willow:1159539594178596956>',
  [GroupRole.WILY]: '<:wily:1159539595772444723>',
  [GroupRole.WINTUMBER]: '<:wintumber:1159539597513080842>',
  [GroupRole.WITCH]: '<:witch:1159539599807348838>',
  [GroupRole.WIZARD]: '<:wizard:1159539614239948850>',
  [GroupRole.WORKER]: '<:worker:1159539617293402282>',
  [GroupRole.WRATH]: '<:wrath:1159539619109552179>',
  [GroupRole.XERICIAN]: '<:xerician:1159539621097652264>',
  [GroupRole.YELLOW]: '<:yellow:1159539622678896771>',
  [GroupRole.YEW]: '<:yew:1159539624331448461>',
  [GroupRole.ZAMORAKIAN]: '<:zamorakian:1159539626650894387>',
  [GroupRole.ZAROSIAN]: '<:zarosian:1159539628068585516>',
  [GroupRole.ZEALOT]: '<:zealot:1159539629876334644>',
  [GroupRole.ZENYTE]: '<:zenyte:1159539675942371328>'
} as const;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.permissions.has(PermissionFlagsBits.Administrator) : false;
}

export function hasRole(member: GuildMember | null, roleId: string): boolean {
  if (!member) return false;
  if (!member.roles || !member.roles.cache) return false;

  return member.roles.cache.some(r => r.id === roleId);
}

export function hasModeratorRole(member: GuildMember | null): boolean {
  return hasRole(member, config.discord.roles.moderator);
}

export function getMissingPermissions(channel: TextChannel) {
  return [...config.requiredPermissions, PermissionFlagsBits.SendMessages].filter(permission => {
    return !clientUserPermissions(channel)?.has(permission as PermissionResolvable);
  });
}

export function isChannelSendable(channel: Channel | undefined | null): channel is TextChannel {
  if (!channel) return false;
  if (channel.type !== ChannelType.GuildText) return false;
  if (!('guild' in channel)) return true;

  const canView = clientUserPermissions(channel as TextChannel)?.has(PermissionFlagsBits.ViewChannel);

  if (
    !(channel instanceof DMChannel) &&
    !(channel instanceof NewsChannel) &&
    !(channel instanceof TextChannel) &&
    canView
  ) {
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

export function getGroupRoleEmoji(role: string): string {
  return GroupRoleEmoji[role.toLowerCase().replace(/[\s-]+/g, '_')];
}

const clientUserPermissions = (channel: TextChannel) =>
  channel.client.user ? channel.permissionsFor(channel.client.user) : null;

export function sendModLog(
  guild: Guild | null,
  message: string,
  mod?: User | null,
  requester?: User | null
) {
  if (!guild || !guild.channels) return;

  const modLogsChannel = guild.channels.cache.get(config.discord.channels.modLogs);

  if (!modLogsChannel) return;
  if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(modLogsChannel))
    return;

  let embedMessage = message;
  if (requester && requester.username) embedMessage += ` | Requested by: <@${requester.id}>`;

  const logMessage = new EmbedBuilder().setDescription(embedMessage);

  if (mod) {
    logMessage.setFooter({ text: `Mod: ${mod.username}` });
  }

  modLogsChannel.send({ embeds: [logMessage] });
}
