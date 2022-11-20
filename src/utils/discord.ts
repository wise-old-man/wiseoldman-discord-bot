import { parseMetricAbbreviation } from '@wise-old-man/utils';
import { Guild, GuildMember, MessageEmbed, PermissionResolvable, TextChannel } from 'discord.js';
import bot from '../bot';
import config from '../config';
import { Emoji } from '../types';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.permissions.has('ADMINISTRATOR') : false;
}

export function hasModeratorRole(member: GuildMember | null): boolean {
  if (!member) return false;
  if (!member.roles || !member.roles.cache) return false;

  return member.roles.cache.some(r => r.id === config.discord.roles.moderator);
}

export function getMissingPermissions(member: GuildMember | null | undefined): string[] | null {
  if (!member) return null;

  return config.requiredPermissions.filter(
    permission => !member?.permissions.has(permission as PermissionResolvable)
  );
}

export function getEmoji(metric: string): string {
  const emojiKey = metric.startsWith('clue')
    ? 'clue'
    : parseMetricAbbreviation(metric) || metric.toLocaleLowerCase();
  return (<any>Emoji)[emojiKey] || '❌';
}

export function propagateMessage(message: MessageEmbed, channelIds: string[] | undefined): void {
  if (!channelIds) {
    return;
  }

  channelIds.forEach(async id => {
    const channel = await bot.client.channels.fetch(id);

    if (!channel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(channel)) return;

    channel.send({ embeds: [message] });
  });
}

/**
 * Finds the first text channel where the bot has
 * permissions to send messages to.
 */
export function findOpenChannel(guild: Guild) {
  const channel = guild.channels.cache.find(c => {
    return c.type === 'GUILD_TEXT' && guild.me?.permissions.has('SEND_MESSAGES');
  });

  return channel as TextChannel;
}
