import {
  Guild,
  GuildChannel,
  GuildMember,
  PermissionResolvable,
  StringResolvable,
  TextChannel
} from 'discord.js';
import bot from '../bot';
import config from '../config';
import { Emoji } from '../types';
import { getAbbreviation } from './metrics';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.hasPermission('ADMINISTRATOR') : false;
}

export function hasModeratorRole(member: GuildMember | null): boolean {
  if (!member) return false;
  if (!member.roles || !member.roles.cache) return false;

  return member.roles.cache.some(r => r.id === config.womGuild.moderatorRoleId);
}

export function getMissingPermissions(member: GuildMember | null | undefined): string[] | null {
  if (!member) return null;

  return config.requiredPermissions.filter(
    permission => !member?.hasPermission(permission as PermissionResolvable)
  );
}

export function canDoPagination(member: GuildMember | null | undefined): boolean {
  if (!member) return false;
  return member?.hasPermission('MANAGE_MESSAGES') && member?.hasPermission('ADD_REACTIONS');
}

export function getEmoji(metric: string): string {
  const emojiKey = metric.startsWith('clue') ? 'clue' : getAbbreviation(metric);
  return (<any>Emoji)[emojiKey] || '❌';
}

export function propagateMessage(message: StringResolvable, channelIds: string[] | undefined): void {
  if (!channelIds) {
    return;
  }

  channelIds.forEach(id => {
    const channel = bot.client.channels.cache.get(id);

    if (!channel) return;
    if (!((channel): channel is TextChannel => channel.type === 'text')(channel)) return;

    channel.send(message);
  });
}

/**
 * Finds the first text channel where the bot has
 * permissions to send messages to.
 */
export function findOpenChannel(guild: Guild): GuildChannel | undefined {
  const channel = guild.channels.cache.find(channel => {
    return !!(channel.type === 'text' && guild.me?.hasPermission('SEND_MESSAGES'));
  });

  return channel;
}
