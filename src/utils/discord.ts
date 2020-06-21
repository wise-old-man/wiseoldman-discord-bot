import { GuildMember, StringResolvable, TextChannel } from 'discord.js';
import bot from '../bot';
import { Emoji } from '../types';

export const MAX_FIELD_SIZE = 25;

export function isAdmin(member: GuildMember | null): boolean {
  return member ? member?.hasPermission('ADMINISTRATOR') : false;
}

export function canManageMessages(member: GuildMember | null | undefined): boolean {
  return member ? member?.hasPermission('MANAGE_MESSAGES') : false;
}

export function getEmoji(metric: string): string {
  return (<any>Emoji)[metric] || '❌';
}

export function propagate(message: StringResolvable, channelIds: string[] | undefined): void {
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
