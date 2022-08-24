export interface Player {
  id: number;
  username: string;
  displayName: string;
  type: string;
  build: string;
  combatLevel: number;
  registeredAt: Date;
  updatedAt: Date;
  lastImportedAt?: Date;
  latestSnapshot: Snapshot;
  ttm: number;
  tt200m: number;
  ehp: number;
  ehb: number;
  exp: number;

  // Only in group related lists
  role?: string;
}

export interface Competition {
  id: number;
  title: string;
  metric: string;
  type: string;
  score: number;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
  duration?: string;
  groupId?: number;
  participantCount?: number;
  totalGained?: number;
  participants: Participant[];
}

export interface Participant {
  id: number;
  displayName: string;
  teamName: string | null;
  progress: {
    start: number;
    end: number;
    gained: number;
  };
}

export interface Group {
  id: number;
  name: string;
  clanChat?: string;
  score: number;
  verified: boolean;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NameChange {
  id: number;
  playerId: number;
  oldName: string;
  newName: string;
  status: number;
  resolvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupHiscoresEntry {
  player: {
    id: number;
    username: string;
    displayName: string;
    type: string;
    lastImportedAt?: Date;
    registeredAt: Date;
    updatedAt: Date;
  };
  rank: number;
  experience?: number;
  kills?: number;
  score?: number;
  level?: number;
  value?: number;
}

export interface GroupGainedEntry {
  startDate: Date;
  endDate: Date;
  gained: number;
  player: Player;
}

export interface GroupRecordEntry {
  player: {
    username: string;
    displayName: string;
    type: string;
  };
  playerId: number;
  value: number;
  updatedAt: Date;
}

export enum MetricType {
  Skill = 'Skill',
  Boss = 'Boss',
  Activity = 'Activity',
  Virtual = 'Virtual'
}

export interface SkillResult {
  name: string;
  type: MetricType;
  rank: number;
  experience: number;
  ehp: number;
  level?: number;
}

export interface BossResult {
  name: string;
  type: MetricType;
  rank: number;
  kills: number;
  ehb: number;
}

export interface ActivityResult {
  name: string;
  type: MetricType;
  rank: number;
  score: number;
}

export type MetricResult = SkillResult | BossResult | ActivityResult;

export interface Snapshot {
  createdAt: string;
  importedAt: string;

  // Skills
  overall: SnapshotSkill;
  attack: SnapshotSkill;
  defence: SnapshotSkill;
  strength: SnapshotSkill;
  hitpoints: SnapshotSkill;
  ranged: SnapshotSkill;
  prayer: SnapshotSkill;
  magic: SnapshotSkill;
  cooking: SnapshotSkill;
  woodcutting: SnapshotSkill;
  fletching: SnapshotSkill;
  fishing: SnapshotSkill;
  firemaking: SnapshotSkill;
  crafting: SnapshotSkill;
  smithing: SnapshotSkill;
  mining: SnapshotSkill;
  herblore: SnapshotSkill;
  agility: SnapshotSkill;
  thieving: SnapshotSkill;
  slayer: SnapshotSkill;
  farming: SnapshotSkill;
  runecrafting: SnapshotSkill;
  hunter: SnapshotSkill;
  construction: SnapshotSkill;

  // Bosses
  abyssal_sire: SnapshotBoss;
  alchemical_hydra: SnapshotBoss;
  barrows_chests: SnapshotBoss;
  bryophyta: SnapshotBoss;
  callisto: SnapshotBoss;
  cerberus: SnapshotBoss;
  chambers_of_xeric: SnapshotBoss;
  chambers_of_xeric_challenge_mode: SnapshotBoss;
  chaos_elemental: SnapshotBoss;
  chaos_fanatic: SnapshotBoss;
  commander_zilyana: SnapshotBoss;
  corporeal_beast: SnapshotBoss;
  crazy_archaeologist: SnapshotBoss;
  dagannoth_prime: SnapshotBoss;
  dagannoth_rex: SnapshotBoss;
  dagannoth_supreme: SnapshotBoss;
  deranged_archaeologist: SnapshotBoss;
  general_graardor: SnapshotBoss;
  giant_mole: SnapshotBoss;
  grotesque_guardians: SnapshotBoss;
  hespori: SnapshotBoss;
  kalphite_queen: SnapshotBoss;
  king_black_dragon: SnapshotBoss;
  kraken: SnapshotBoss;
  kreearra: SnapshotBoss;
  kril_tsutsaroth: SnapshotBoss;
  mimic: SnapshotBoss;
  nex: SnapshotBoss;
  nightmare: SnapshotBoss;
  phosanis_nightmare: SnapshotBoss;
  obor: SnapshotBoss;
  sarachnis: SnapshotBoss;
  scorpia: SnapshotBoss;
  skotizo: SnapshotBoss;
  tempoross: SnapshotBoss;
  the_gauntlet: SnapshotBoss;
  the_corrupted_gauntlet: SnapshotBoss;
  theatre_of_blood: SnapshotBoss;
  theatre_of_blood_hard_mode: SnapshotBoss;
  thermonuclear_smoke_devil: SnapshotBoss;
  tombs_of_amascut: SnapshotBoss;
  tombs_of_amascut_expert: SnapshotBoss;
  tzkal_zuk: SnapshotBoss;
  tztok_jad: SnapshotBoss;
  venenatis: SnapshotBoss;
  vetion: SnapshotBoss;
  vorkath: SnapshotBoss;
  wintertodt: SnapshotBoss;
  zalcano: SnapshotBoss;
  zulrah: SnapshotBoss;

  // Activities
  league_points: SnapshotActivity;
  bounty_hunter_hunter: SnapshotActivity;
  bounty_hunter_rogue: SnapshotActivity;
  clue_scrolls_all: SnapshotActivity;
  clue_scrolls_beginner: SnapshotActivity;
  clue_scrolls_easy: SnapshotActivity;
  clue_scrolls_medium: SnapshotActivity;
  clue_scrolls_hard: SnapshotActivity;
  clue_scrolls_elite: SnapshotActivity;
  clue_scrolls_master: SnapshotActivity;
  last_man_standing: SnapshotActivity;
  pvp_arena: SnapshotActivity;
  soul_wars_zeal: SnapshotActivity;
  guardians_of_the_rift: SnapshotActivity;

  // Virtuals
  ehp: VirtualActivity;
  ehb: VirtualActivity;
}

export interface SnapshotSkill {
  rank: number;
  experience: number;
  level?: number;
}

export interface SnapshotBoss {
  rank: number;
  kills: number;
}

export interface SnapshotActivity {
  rank: number;
  score: number;
}

export interface VirtualActivity {
  rank: number;
  value: number;
}

export interface PlayerGains {
  period: string;
  startsAt: Date | null;
  endsAt: Date | null;
  data: {
    [key: string]: {
      rank: {
        start: number;
        end: number;
        gained: number;
      };
      // Defined in skill gains
      experience?: {
        start: number;
        end: number;
        gained: number;
      };
      // Defined in boss gains
      kills?: {
        start: number;
        end: number;
        gained: number;
      };
      // Defined in activity gains
      score?: {
        start: number;
        end: number;
        gained: number;
      };
      // Defined in virtual gains
      value?: {
        start: number;
        end: number;
        gained: number;
      };
    };
  };
}

export interface PlayerRecord {
  value: number;
  period: string;
  metric: string;
  updatedAt: Date;
}

export interface PlayerAchievement {
  playerId: number;
  threshold: number;
  name: string;
  metric: string;
  measure: string;
  createdAt: Date;
}
