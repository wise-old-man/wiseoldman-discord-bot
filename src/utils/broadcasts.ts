import { MessageEmbed, TextChannel } from 'discord.js';
import bot from '../bot';
import { getServers, getPreferredChannels } from '../services/prisma';

export enum BroadcastType {
  DEFAULT = 'DEFAULT',
  COMPETITION_STATUS = 'COMPETITION_STATUS',
  MEMBER_ACHIEVEMENTS = 'MEMBER_ACHIEVEMENTS',
  MEMBER_NAME_CHANGED = 'MEMBER_NAME_CHANGED',
  MEMBER_HCIM_DIED = 'MEMBER_HCIM_DIED',
  MEMBERS_LIST_CHANGED = 'MEMBERS_LIST_CHANGED'
}

export const BroadcastName = {
  [BroadcastType.DEFAULT]: 'Default',
  [BroadcastType.COMPETITION_STATUS]: 'Competition Status',
  [BroadcastType.MEMBER_ACHIEVEMENTS]: 'Member Achievements',
  [BroadcastType.MEMBER_NAME_CHANGED]: 'Member Name Changed',
  [BroadcastType.MEMBER_HCIM_DIED]: 'Member (HCIM) Died',
  [BroadcastType.MEMBERS_LIST_CHANGED]: 'Members List Changed'
};

export async function broadcastMessage(groupId: number, type: string, message: MessageEmbed) {
  const servers = await getServers(groupId);

  const preferredChannelIds = await getPreferredChannels(
    servers.map(s => s.guildId),
    type
  );

  if (!preferredChannelIds) {
    return;
  }

  preferredChannelIds.forEach(async id => {
    const channel = await bot.client.channels.fetch(id);

    if (!channel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(channel)) return;

    channel.send({ embeds: [message] });
  });
}
