import { GuildMember } from 'discord.js';
import { Emoji } from '../types';

export function isAdmin(member: GuildMember | null) {
  return member?.hasPermission('ADMINISTRATOR');
}

export function getEmoji(metric: string) {
  return (<any>Emoji)[metric];
}

// Source: https://github.com/gc/oldschooljs/blob/master/src/util/util.ts
export function toKMB(number: number): string {
  function round(number: number): string {
    return (Math.round(number * 100) / 100).toString();
  }

  if (number > 999999999 || number < -999999999) {
    return round(number / 1000000000) + 'b';
  } else if (number > 999999 || number < -999999) {
    return round(number / 1000000) + 'm';
  } else if (number > 999 || number < -999) {
    return round(number / 1000) + 'k';
  } else {
    return round(number);
  }
}
