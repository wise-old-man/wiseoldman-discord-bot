import { GuildMember } from 'discord.js';
import { Emoji } from '../types';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null) {
  return member?.hasPermission('ADMINISTRATOR');
}

export function getEmoji(metric: string) {
  return (<any>Emoji)[metric];
}
