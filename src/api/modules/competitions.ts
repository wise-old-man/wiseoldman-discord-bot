import { CompetitionDetails, CompetitionListItem } from '@wise-old-man/utils';
import { durationBetween } from '../../utils';
import api from '../handler';

export function getCompetitionStatus(competition: CompetitionDetails | CompetitionListItem): string {
  const now = new Date();
  const endsAt = competition.endsAt;
  const startsAt = competition.startsAt;

  if (endsAt.getTime() < now.getTime()) {
    return 'finished';
  }

  if (startsAt.getTime() < now.getTime()) {
    return 'ongoing';
  }

  return 'upcoming';
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
export async function resetCode(competitionId: number): Promise<{ newCode: string }> {
  const URL = `/competitions/${competitionId}/reset-code`;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const { data } = await api.put(URL, { adminPassword });

  return data;
}
