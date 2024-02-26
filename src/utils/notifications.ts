import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { getServers, getNotificationPreferences } from '../services/prisma';

export const NotificationType = {
  DEFAULT: 'DEFAULT',
  COMPETITION_STATUS: 'COMPETITION_STATUS',
  MEMBER_ACHIEVEMENTS: 'MEMBER_ACHIEVEMENTS',
  MEMBER_NAME_CHANGED: 'MEMBER_NAME_CHANGED',
  MEMBER_HCIM_DIED: 'MEMBER_HCIM_DIED',
  MEMBERS_JOINED: 'MEMBERS_JOINED',
  MEMBERS_LEFT: 'MEMBERS_LEFT',
  MEMBERS_ROLES_CHANGED: 'MEMBERS_ROLES_CHANGED'
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationName = {
  [NotificationType.DEFAULT]: 'Default',
  [NotificationType.COMPETITION_STATUS]: 'Competition Status',
  [NotificationType.MEMBER_ACHIEVEMENTS]: 'Member Achievements',
  [NotificationType.MEMBER_NAME_CHANGED]: 'Member Name Changed',
  [NotificationType.MEMBER_HCIM_DIED]: 'Member (HCIM) Died',
  [NotificationType.MEMBERS_JOINED]: 'Members Joined',
  [NotificationType.MEMBERS_LEFT]: 'Members Left',
  [NotificationType.MEMBERS_ROLES_CHANGED]: 'Members Roles Changed'
};

export async function propagateMessage(
  client: Client,
  groupId: number,
  type: string,
  message: EmbedBuilder
) {
  const servers = await getServers(groupId);

  const preferredChannelsMap = await getNotificationPreferences(
    servers.map(s => s.guildId),
    type
  );

  const results = await Promise.allSettled(
    servers.map(async server => {
      // This notification type has been disabled for this server
      if (preferredChannelsMap[server.guildId] === null) {
        return;
      }

      // If the server has configured a prefered channel for this notification type, use that.
      // otherwise, use the default bot channel (if it exists)
      const targetChannelId = preferredChannelsMap[server.guildId] || server.botChannelId;
      if (!targetChannelId) return;

      const channel = await client.channels.fetch(targetChannelId);

      if (!channel) return;
      if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(channel))
        return;

      try {
        await channel.send({ embeds: [message] });
      } catch (error) {
        console.log(error);
        throw error;
      }
    })
  );

  const failedPropagations = results.filter(r => r.status === 'rejected');

  if (failedPropagations.length > 0) {
    throw new Error(
      `Failed to fully propagate notification message. (${failedPropagations.length}/${servers.length})`
    );
  }
}
