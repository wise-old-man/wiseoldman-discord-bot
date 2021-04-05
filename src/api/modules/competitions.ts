import { durationBetween } from '../../utils';
import api from '../handler';
import { Competition } from '../types';
import { convertDates } from '../utils';

export function getCompetitionStatus(competition: Competition): string {
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

export function getCompetitionTimeLeft(competition: Competition): string {
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
 * Fetch competition details from the API.
 */
export async function fetchCompetition(id: number): Promise<Competition> {
  const URL = `/competitions/${id}`;
  const { data } = await api.get(URL);

  // Convert date strings into date instances
  convertDates(data, ['createdAt', 'updatedAt', 'startsAt', 'endsAt']);

  return data;
}
