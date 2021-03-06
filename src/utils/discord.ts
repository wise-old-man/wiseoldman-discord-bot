import { Guild, GuildChannel, GuildMember, StringResolvable, TextChannel } from 'discord.js';
import bot from '../bot';
import { Emoji } from '../types';
import { getAbbreviation } from './metrics';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.hasPermission('ADMINISTRATOR') : false;
}

export function canManageMessages(member: GuildMember | null | undefined): boolean {
  return member ? member?.hasPermission('MANAGE_MESSAGES') : false;
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
