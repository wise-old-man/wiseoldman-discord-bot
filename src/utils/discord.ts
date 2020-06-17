import { GuildMember } from 'discord.js';
import { Emoji } from '../types';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.hasPermission('ADMINISTRATOR') : false;
}

export function canManageMessages(member: GuildMember | null | undefined): boolean {
  return member ? member?.hasPermission('MANAGE_MESSAGES') : false;
}

export function getEmoji(metric: string): string {
  return (<any>Emoji)[metric];
}
