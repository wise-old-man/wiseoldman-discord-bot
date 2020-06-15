import { durationBetween } from '../../utils';
import { Competition } from '../types';

export function getCompetitionStatus(competition: Competition): string {
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
