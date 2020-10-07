import { MetricType } from '../api/types';

const SKILLS_MAP = [
  { key: 'attack', name: 'Attack' },
  { key: 'strength', name: 'Strength' },
  { key: 'defence', name: 'Defence' },
  { key: 'ranged', name: 'Ranged' },
  { key: 'prayer', name: 'Prayer' },
  { key: 'magic', name: 'Magic' },
  { key: 'runecrafting', name: 'Runecrafting' },
  { key: 'construction', name: 'Construction' },
  { key: 'hitpoints', name: 'Hitpoints' },
  { key: 'agility', name: 'Agility' },
  { key: 'herblore', name: 'Herblore' },
  { key: 'thieving', name: 'Thieving' },
  { key: 'crafting', name: 'Crafting' },
  { key: 'fletching', name: 'Fletching' },
  { key: 'slayer', name: 'Slayer' },
  { key: 'hunter', name: 'Hunter' },
  { key: 'mining', name: 'Mining' },
  { key: 'smithing', name: 'Smithing' },
  { key: 'fishing', name: 'Fishing' },
  { key: 'cooking', name: 'Cooking' },
  { key: 'firemaking', name: 'Firemaking' },
  { key: 'woodcutting', name: 'Woodcutting' },
  { key: 'farming', name: 'Farming' },
  { key: 'overall', name: 'Overall' }
];

const ACTIVITIES_MAP = [
  { key: 'league_points', name: 'League Points' },
  { key: 'last_man_standing', name: 'Last Man Standing' },
  { key: 'bounty_hunter_hunter', name: 'Bounty Hunter (Hunter)' },
  { key: 'bounty_hunter_rogue', name: 'Bounty Hunter (Rogue)' },
  { key: 'clue_scrolls_beginner', name: 'Clue Scrolls (Beginner)' },
  { key: 'clue_scrolls_easy', name: 'Clue Scroll (Easy)' },
  { key: 'clue_scrolls_medium', name: 'Clue Scroll (Medium)' },
  { key: 'clue_scrolls_hard', name: 'Clue Scroll (Hard)' },
  { key: 'clue_scrolls_elite', name: 'Clue Scroll (Elite)' },
  { key: 'clue_scrolls_master', name: 'Clue Scroll (Master)' },
  { key: 'clue_scrolls_all', name: 'Clue Scrolls (All)' }
];

const BOSSES_MAP = [
  { key: 'abyssal_sire', name: 'Abyssal Sire' },
  { key: 'alchemical_hydra', name: 'Alchemical Hydra' },
  { key: 'barrows_chests', name: 'Barrows Chests' },
  { key: 'bryophyta', name: 'Bryophyta' },
  { key: 'callisto', name: 'Callisto' },
  { key: 'cerberus', name: 'Cerberus' },
  { key: 'chambers_of_xeric', name: 'Chambers Of Xeric' },
  { key: 'chambers_of_xeric_challenge_mode', name: 'Chambers Of Xeric (CM)' },
  { key: 'chaos_elemental', name: 'Chaos Elemental' },
  { key: 'chaos_fanatic', name: 'Chaos Fanatic' },
  { key: 'commander_zilyana', name: 'Commander Zilyana' },
  { key: 'corporeal_beast', name: 'Corporeal Beast' },
  { key: 'crazy_archaeologist', name: 'Crazy Archaeologist' },
  { key: 'dagannoth_prime', name: 'Dagannoth Prime' },
  { key: 'dagannoth_rex', name: 'Dagannoth Rex' },
  { key: 'dagannoth_supreme', name: 'Dagannoth Supreme' },
  { key: 'deranged_archaeologist', name: 'Deranged Archaeologist' },
  { key: 'general_graardor', name: 'General Graardor' },
  { key: 'giant_mole', name: 'Giant Mole' },
  { key: 'grotesque_guardians', name: 'Grotesque Guardians' },
  { key: 'hespori', name: 'Hespori' },
  { key: 'kalphite_queen', name: 'Kalphite Queen' },
  { key: 'king_black_dragon', name: 'King Black Dragon' },
  { key: 'kraken', name: 'Kraken' },
  { key: 'kreearra', name: "Kree'Arra" },
  { key: 'kril_tsutsaroth', name: "K'ril Tsutsaroth" },
  { key: 'mimic', name: 'Mimic' },
  { key: 'nightmare', name: 'Nightmare' },
  { key: 'obor', name: 'Obor' },
  { key: 'sarachnis', name: 'Sarachnis' },
  { key: 'scorpia', name: 'Scorpia' },
  { key: 'skotizo', name: 'Skotizo' },
  { key: 'the_gauntlet', name: 'The Gauntlet' },
  { key: 'the_corrupted_gauntlet', name: 'The Corrupted Gauntlet' },
  { key: 'theatre_of_blood', name: 'Theatre Of Blood' },
  { key: 'thermonuclear_smoke_devil', name: 'Therm. Smoke Devil' },
  { key: 'tzkal_zuk', name: 'TzKal-Zuk' },
  { key: 'tztok_jad', name: 'TzTok-Jad' },
  { key: 'venenatis', name: 'Venenatis' },
  { key: 'vetion', name: "Vet'ion" },
  { key: 'vorkath', name: 'Vorkath' },
  { key: 'wintertodt', name: 'Wintertodt' },
  { key: 'zalcano', name: 'Zalcano' },
  { key: 'zulrah', name: 'Zulrah' }
];

export const SKILLS = SKILLS_MAP.map(s => s.key);
export const ACTIVITIES = ACTIVITIES_MAP.map(s => s.key);
export const BOSSES = BOSSES_MAP.map(s => s.key);
export const ALL_METRICS = [...SKILLS, ...ACTIVITIES, ...BOSSES];

export function isSkill(metric: string): boolean {
  return SKILLS.includes(metric);
}

export function isActivity(metric: string): boolean {
  return ACTIVITIES.includes(metric);
}

export function isBoss(metric: string): boolean {
  return BOSSES.includes(metric);
}

export function getType(metric: string): MetricType | null {
  if (isSkill(metric)) {
    return MetricType.Skill;
  }

  if (isActivity(metric)) {
    return MetricType.Activity;
  }

  if (isBoss(metric)) {
    return MetricType.Boss;
  }

  return null;
}

export function getMeasure(metric: string): string {
  if (isSkill(metric)) {
    return 'experience';
  }

  if (isActivity(metric)) {
    return 'score';
  }

  return 'kills';
}

export function getMetricName(metric: string): string {
  if (metric === 'combat') {
    return 'Combat';
  }

  const allMetricConfigs = [...SKILLS_MAP, ...ACTIVITIES_MAP, ...BOSSES_MAP];

  for (let i = 0; i < allMetricConfigs.length; i += 1) {
    if (allMetricConfigs[i].key === metric) {
      return allMetricConfigs[i].name;
    }
  }

  return 'Invalid metric name';
}

export function getAbbreviation(abbr: string): string {
  switch (abbr) {
    case 'sire':
      return 'abyssal_sire';

    case 'hydra':
      return 'alchemical_hydra';

    case 'barrows':
      return 'barrows_chests';

    case 'bryo':
      return 'bryophyta';

    case 'cerb':
      return 'cerberus';

    case 'cox':
    case 'xeric':
    case 'chambers':
    case 'olm':
    case 'raids':
      return 'chambers_of_xeric';

    case 'cox-cm':
    case 'xeric-cm':
    case 'chambers-cm':
    case 'olm-cm':
    case 'raids-cm':
      return 'chambers_of_xeric_challenge_mode';

    case 'chaos ele':
      return 'chaos_elemental';

    case 'fanatic':
      return 'chaos_fanatic';

    case 'sara':
    case 'saradomin':
    case 'zilyana':
    case 'zily':
      return 'commander_zilyana';

    case 'corp':
      return 'corporeal_beast';

    case 'crazy arch':
      return 'crazy_archaeologist';

    case 'prime':
      return 'dagannoth_prime';
    case 'rex':
      return 'dagannoth_rex';
    case 'supreme':
      return 'dagannoth_supreme';

    case 'deranged arch':
      return 'deranged_archaeologist';

    case 'bandos':
    case 'graardor':
      return 'general_graardor';

    case 'mole':
      return 'giant_mole';

    case 'dusk':
    case 'dawn':
    case 'gargs':
    case 'guardians':
      return 'grotesque_guardians';

    case 'kq':
      return 'kalphite_queen';

    case 'kbd':
      return 'king_black_dragon';

    case 'kree':
    case 'kreearra':
    case 'armadyl':
      return 'kreearra';

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril trutsaroth':
      return 'kril_tsutsaroth';

    case 'gaunt':
    case 'gauntlet':
      return 'the_gauntlet';

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
      return 'the_corrupted_gauntlet';

    case 'tob':
    case 'theatre':
    case 'verzik':
      return 'theatre_of_blood';

    case 'thermy':
      return 'thermonuclear_smoke_devil';

    case 'zuk':
    case 'inferno':
      return 'tzkal_zuk';

    case 'jad':
      return 'tztok_jad';

    case 'vork':
      return 'vorkath';

    case 'wt':
      return 'wintertodt';

    case 'snek':
      return 'zulrah';

    // Minigames and others

    case 'all-clues':
    case 'clues':
      return 'clue_scrolls_all';

    case 'beginner-clues':
    case 'beg-clues':
    case 'beginners':
      return 'clue_scrolls_beginner';

    case 'easy-clues':
    case 'easies':
      return 'clue_scrolls_easy';

    case 'medium-clues':
    case 'med-clues':
    case 'mediums':
      return 'clue_scrolls_medium';

    case 'hard-clues':
    case 'hards':
      return 'clue_scrolls_hard';

    case 'elite-clues':
    case 'elites':
      return 'clue_scrolls_elite';

    case 'master-clues':
    case 'masters':
      return 'clue_scrolls_master';

    case 'lms':
      return 'last_man_standing';

    case 'league':
    case 'lp':
    case 'lps':
      return 'league_points';

    default:
      return abbr;
  }
}
