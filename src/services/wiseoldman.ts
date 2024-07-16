import {
  WOMClient,
  CompetitionDetails,
  CompetitionListItem,
  CompetitionStatus,
  GroupListItem,
  NameChange,
  Player,
  NameChangeDetails,
  isMetric,
  Metric
} from '@wise-old-man/utils';
import env from '../env';
import { durationBetween } from '../utils/dates';

import config from '../config';

const womClient = new WOMClient({
  userAgent: 'WiseOldMan Discord Bot',
  baseAPIUrl: config.baseAPIUrl,
  apiKey: config.apiKey
});

export function getCompetitionStatus(competition: CompetitionDetails | CompetitionListItem) {
  const now = new Date();
  const endsAt = competition.endsAt;
  const startsAt = competition.startsAt;

  if (endsAt.getTime() < now.getTime()) {
    return CompetitionStatus.FINISHED;
  }

  if (startsAt.getTime() < now.getTime()) {
    return CompetitionStatus.ONGOING;
  }

  return CompetitionStatus.UPCOMING;
}

export function getCompetitionTimeLeft(competition: CompetitionDetails | CompetitionListItem): string {
  const now = new Date();
  const endsAt = competition.endsAt;
  const startsAt = competition.startsAt;

  if (endsAt.getTime() < now.getTime()) {
    return `Ended at ${endsAt.toLocaleDateString()}`;
  }

  if (startsAt.getTime() < now.getTime()) {
    const timeLeft = durationBetween(now, endsAt, 2);
    return `Ends in ${timeLeft}`;
  }

  const timeLeft = durationBetween(now, startsAt, 2);
  return `Starting in ${timeLeft}`;
}

/**
 * Send an API request attempting to reset a competition's verification code.
 */
export async function resetCompetitionCode(competitionId: number): Promise<{ newCode: string }> {
  return womClient.competitions.putRequest(`/competitions/${competitionId}/reset-code`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to reset a group's verification code.
 */
export async function resetGroupCode(groupId: number): Promise<{ newCode: string }> {
  return womClient.groups.putRequest(`/groups/${groupId}/reset-code`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to verify a group.
 */
export async function verifyGroup(groupId: number): Promise<GroupListItem> {
  return womClient.groups.putRequest(`/groups/${groupId}/verify`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request to remove a player from a group.
 */
export async function removeFromGroup(groupId: number, username: string): Promise<{ message: string }> {
  return womClient.groups.deleteRequest(`/groups/${groupId}/members`, {
    adminPassword: env.ADMIN_PASSWORD,
    members: [username]
  });
}

/**
 * Send an API request to remove a player from a competition.
 */
export async function removeFromCompetition(
  competitionId: number,
  username: string
): Promise<{ message: string }> {
  return womClient.groups.deleteRequest(`/competitions/${competitionId}/participants`, {
    adminPassword: env.ADMIN_PASSWORD,
    participants: [username]
  });
}

/**
 * Send an API request to delete a group.
 */
export async function deleteGroup(groupId: number): Promise<{ message: string }> {
  return womClient.groups.deleteRequest(`/groups/${groupId}`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request to set visibility of a group to true.
 */
export async function setGroupVisible(groupId: number): Promise<{ message: string }> {
  return womClient.groups.putRequest(`/groups/${groupId}/visibility`, {
    visible: true,
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request to delete a competition.
 */
export async function deleteCompetition(competitionId: number): Promise<{ message: string }> {
  return womClient.competitions.deleteRequest(`/competitions/${competitionId}`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function approveNameChange(id: number): Promise<NameChange> {
  return womClient.nameChanges.postRequest(`/names/${id}/approve`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function fetchNameChangeDetails(id: number): Promise<NameChangeDetails> {
  return womClient.nameChanges.getRequest(`/names/${id}`);
}

export async function denyNameChange(id: number): Promise<NameChange> {
  return womClient.nameChanges.postRequest(`/names/${id}/deny`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to delete a player (and all its data)
 */
export async function deletePlayer(username: string): Promise<{ message: string }> {
  return womClient.players.deleteRequest(`/players/${username}`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to delete a player's name change history
 */
export async function clearNameChangeHistory(
  username: string
): Promise<{ count: number; message: string }> {
  return womClient.players.postRequest(`/names/${username}/clear-history`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function createAPIKey(application: string, developer: string): Promise<{ id: string }> {
  return womClient.postRequest(`/api-key`, {
    application,
    developer,
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function toggleUnderAttackMode(state: boolean): Promise<boolean> {
  return womClient.postRequest(`/under-attack-mode`, {
    state,
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function claimBenefits(
  discordId: string,
  username: string,
  groupId?: number
): Promise<void> {
  return womClient.putRequest(`/patrons/claim/${discordId}`, {
    username,
    groupId,
    adminPassword: env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to update a player's country
 */
export async function updateCountry(username: string, country: string): Promise<Player> {
  return womClient.players.putRequest(`/players/${username}/country`, {
    country,
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function rollback(username: string, untilLastChange: boolean) {
  return womClient.players.postRequest(`/players/${username}/rollback`, {
    adminPassword: env.ADMIN_PASSWORD,
    untilLastChange
  });
}

export async function archive(username: string) {
  return womClient.players.postRequest<Player>(`/players/${username}/archive`, {
    adminPassword: env.ADMIN_PASSWORD
  });
}

export async function forceUpdate(username: string) {
  return womClient.players.postRequest(`/players/${username}`, {
    adminPassword: env.ADMIN_PASSWORD,
    force: true
  });
}

export function parseMetricAbbreviation(abbreviation: string): Metric | null {
  if (!abbreviation || abbreviation.length === 0) {
    return null;
  }

  const fixedAbbreviation = abbreviation.toLowerCase();

  if (isMetric(fixedAbbreviation)) {
    return fixedAbbreviation;
  }

  switch (fixedAbbreviation) {
    // Bosses
    case 'sire':
      return Metric.ABYSSAL_SIRE;

    case 'hydra':
      return Metric.ALCHEMICAL_HYDRA;

    case 'barrows':
      return Metric.BARROWS_CHESTS;

    case 'bryo':
      return Metric.BRYOPHYTA;

    case 'cerb':
      return Metric.CERBERUS;

    case 'cox':
    case 'xeric':
    case 'chambers':
    case 'olm':
    case 'raids':
      return Metric.CHAMBERS_OF_XERIC;

    case 'cox-cm':
    case 'xeric-cm':
    case 'chambers-cm':
    case 'olm-cm':
    case 'raids-cm':
      return Metric.CHAMBERS_OF_XERIC_CM;

    case 'chaos-ele':
      return Metric.CHAOS_ELEMENTAL;

    case 'fanatic':
      return Metric.CHAOS_FANATIC;

    case 'sara':
    case 'saradomin':
    case 'zilyana':
    case 'zily':
      return Metric.COMMANDER_ZILYANA;

    case 'corp':
      return Metric.CORPOREAL_BEAST;

    case 'crazy-arch':
      return Metric.CRAZY_ARCHAEOLOGIST;

    case 'prime':
      return Metric.DAGANNOTH_PRIME;
    case 'rex':
      return Metric.DAGANNOTH_REX;
    case 'supreme':
      return Metric.DAGANNOTH_SUPREME;

    case 'deranged-arch':
      return Metric.DERANGED_ARCHAEOLOGIST;

    case 'bandos':
    case 'graardor':
      return Metric.GENERAL_GRAARDOR;

    case 'mole':
      return Metric.GIANT_MOLE;

    case 'dusk':
    case 'dawn':
    case 'gargs':
    case 'guardians':
    case 'ggs':
      return Metric.GROTESQUE_GUARDIANS;

    case 'phantom':
    case 'muspah':
      return Metric.PHANTOM_MUSPAH;

    case 'kq':
      return Metric.KALPHITE_QUEEN;

    case 'kbd':
      return Metric.KING_BLACK_DRAGON;

    case 'kree':
    case 'kreearra':
    case 'armadyl':
    case 'arma':
      return Metric.KREEARRA;

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril-tsutsaroth':
      return Metric.KRIL_TSUTSAROTH;

    case 'gaunt':
    case 'gauntlet':
    case 'the-gauntlet':
      return Metric.THE_GAUNTLET;

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
    case 'corrupted-gauntlet':
    case 'the-corrupted-gauntlet':
      return Metric.THE_CORRUPTED_GAUNTLET;

    case 'tob':
    case 'theatre':
    case 'verzik':
    case 'tob-normal':
      return Metric.THEATRE_OF_BLOOD;

    case 'tob-hm':
    case 'tob-cm':
    case 'tob-hard-mode':
    case 'tob-hard':
      return Metric.THEATRE_OF_BLOOD_HARD_MODE;

    case 'toa':
    case 'tombs':
    case 'amascut':
      return Metric.TOMBS_OF_AMASCUT;

    case 'toa-expert':
    case 'toa-hm':
    case 'tombs-expert':
    case 'tombs-hm':
    case 'amascut-expert':
    case 'amascut-hm':
      return Metric.TOMBS_OF_AMASCUT_EXPERT;

    case 'nm':
    case 'tnm':
    case 'nmare':
    case 'the-nightmare':
      return Metric.NIGHTMARE;

    case 'pnm':
    case 'phosani':
    case 'phosanis':
    case 'phosani-nm':
    case 'phosani-nightmare':
    case 'phosanis nightmare':
      return Metric.PHOSANIS_NIGHTMARE;

    case 'thermy':
    case 'smoke-devil':
      return Metric.THERMONUCLEAR_SMOKE_DEVIL;

    case 'zuk':
    case 'inferno':
      return Metric.TZKAL_ZUK;

    case 'jad':
    case 'fight-caves':
    case 'fc':
      return Metric.TZTOK_JAD;

    case 'vork':
    case 'vorky':
      return Metric.VORKATH;

    case 'wt':
      return Metric.WINTERTODT;

    case 'snek':
    case 'zul':
      return Metric.ZULRAH;

    // Minigames and others

    case 'all-clues':
    case 'clues':
      return Metric.CLUE_SCROLLS_ALL;

    case 'beginner':
    case 'beginner-clues':
    case 'beg-clues':
    case 'beginners':
      return Metric.CLUE_SCROLLS_BEGINNER;

    case 'easy':
    case 'easy-clues':
    case 'easies':
      return Metric.CLUE_SCROLLS_EASY;

    case 'medium':
    case 'med':
    case 'meds':
    case 'medium-clues':
    case 'med-clues':
    case 'mediums':
      return Metric.CLUE_SCROLLS_MEDIUM;

    case 'hard':
    case 'hard-clues':
    case 'hards':
      return Metric.CLUE_SCROLLS_HARD;

    case 'elite':
    case 'elite-clues':
    case 'elites':
      return Metric.CLUE_SCROLLS_ELITE;

    case 'master':
    case 'master-clues':
    case 'masters':
      return Metric.CLUE_SCROLLS_MASTER;

    case 'lms':
      return Metric.LAST_MAN_STANDING;

    case 'league':
    case 'lp':
    case 'lps':
      return Metric.LEAGUE_POINTS;

    case 'sw':
    case 'zeal':
    case 'soul-wars':
      return Metric.SOUL_WARS_ZEAL;

    case 'rifts-closed':
    case 'gotr':
    case 'rifts':
      return Metric.GUARDIANS_OF_THE_RIFT;

    // Skills

    case 'runecraft':
    case 'rc':
      return Metric.RUNECRAFTING;

    case 'att':
    case 'atk':
    case 'attk':
      return Metric.ATTACK;

    case 'def':
    case 'defense':
      return Metric.DEFENCE;

    case 'str':
      return Metric.STRENGTH;

    case 'hp':
      return Metric.HITPOINTS;

    case 'range':
      return Metric.RANGED;

    case 'pray':
      return Metric.PRAYER;

    case 'mage':
      return Metric.MAGIC;

    case 'cook':
      return Metric.COOKING;

    case 'wc':
      return Metric.WOODCUTTING;

    case 'fletch':
      return Metric.FLETCHING;

    case 'fish':
      return Metric.FISHING;

    case 'fm':
    case 'burning':
      return Metric.FIREMAKING;

    case 'craft':
      return Metric.CRAFTING;

    case 'sm':
    case 'smith':
      return Metric.SMITHING;

    case 'mine':
    case 'smash':
      return Metric.MINING;

    case 'herb':
      return Metric.HERBLORE;

    case 'agi':
    case 'agil':
      return Metric.AGILITY;

    case 'thief':
      return Metric.THIEVING;

    case 'slay':
      return Metric.SLAYER;

    case 'farm':
      return Metric.FARMING;

    case 'hunt':
    case 'hunting':
      return Metric.HUNTER;

    case 'con':
    case 'cons':
    case 'const':
      return Metric.CONSTRUCTION;

    default:
      return null;
  }
}

export default womClient;
