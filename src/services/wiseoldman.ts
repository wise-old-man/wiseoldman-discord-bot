import {
  WOMClient,
  CompetitionDetails,
  CompetitionListItem,
  CompetitionStatus,
  GroupListItem,
  NameChange,
  Player,
  NameChangeDetails
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
 * Send an API request to delete a group.
 */
export async function deleteGroup(groupId: number): Promise<{ message: string }> {
  return womClient.groups.deleteRequest(`/groups/${groupId}`, {
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

export default womClient;
