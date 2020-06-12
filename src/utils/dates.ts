import { TimeGap } from '../types';

export function durationSince(date: Date, maxDepth = 10, shortNames = false): string {
  return durationBetween(date, new Date(), maxDepth, shortNames);
}

export function durationBetween(start: Date, end: Date, maxDepth = 10, shortNames = false): string {
  if (!start || !end) {
    return '0 seconds';
  }

  const diff = end.getTime() - start.getTime();
  const { days, hours, minutes, seconds } = durationOf(diff);

  const periods = [];

  if (days > 0 && periods.length < maxDepth) {
    periods.push(`${days} days`);
  }

  if (hours > 0 && periods.length < maxDepth) {
    periods.push(`${hours} hours`);
  }

  if (minutes > 0 && periods.length < maxDepth) {
    periods.push(`${minutes} ${shortNames ? 'mins' : 'minutes'}`);
  }

  if (seconds > 0 && periods.length < maxDepth) {
    periods.push(`${seconds}  ${shortNames ? 'secs' : 'seconds'}`);
  }

  if (periods.length === 0) {
    return '0 seconds';
  }

  return periods.join(', ');
}

export function durationOf(millisDiff: number): TimeGap {
  if (millisDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  seconds = Math.floor(millisDiff / 1000);
  minutes = Math.floor(seconds / 60);
  seconds %= 60;
  hours = Math.floor(minutes / 60);
  minutes %= 60;
  days = Math.floor(hours / 24);
  hours %= 24;

  return { days, hours, minutes, seconds };
}
