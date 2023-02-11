import {
  WOMClient,
  CompetitionDetails,
  CompetitionListItem,
  CompetitionStatus,
  GroupListItem,
  NameChange,
  Player
} from '@wise-old-man/utils';
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
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to reset a group's verification code.
 */
export async function resetGroupCode(groupId: number): Promise<{ newCode: string }> {
  return womClient.groups.putRequest(`/groups/${groupId}/reset-code`, {
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to verify a group.
 */
export async function verifyGroup(groupId: number): Promise<GroupListItem> {
  return womClient.groups.putRequest(`/groups/${groupId}/verify`, {
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

export async function approveNameChange(id: number): Promise<NameChange> {
  return womClient.nameChanges.postRequest(`/names/${id}/approve`, {
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

export async function denyNameChange(id: number): Promise<NameChange> {
  return womClient.nameChanges.postRequest(`/names/${id}/deny`, {
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to delete a player (and all its data)
 */
export async function deletePlayer(username: string): Promise<{ message: string }> {
  return womClient.players.deleteRequest(`/players/${username}`, {
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

/**
 * Send an API request attempting to update a player's country
 */
export async function updateCountry(username: string, country: string): Promise<Player> {
  return womClient.players.putRequest(`/players/${username}/country`, {
    country,
    adminPassword: process.env.ADMIN_PASSWORD
  });
}

export default womClient;
