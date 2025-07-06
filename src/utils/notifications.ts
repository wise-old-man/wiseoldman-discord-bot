import { AsyncResult, combineAsync, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { ChannelType, Client, EmbedBuilder } from 'discord.js';
import prisma from '../services/prisma';

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

export type MessagePropagationError =
  | {
      code: 'FAILED_TO_FETCH_SERVERS';
      subError: unknown;
    }
  | {
      code: 'FAILED_TO_FETCH_NOTIFICATION_PREFERENCES';
      subError: unknown;
    }
  | {
      code: 'FAILED_TO_PROPAGATE_NOTIFICATION';
      subError: unknown;
    };

export async function propagateMessage(
  client: Client,
  groupId: number,
  type: string,
  message: EmbedBuilder
): AsyncResult<true, MessagePropagationError> {
  const serversResult = await fromPromise(
    prisma.server.findMany({
      where: {
        groupId
      }
    })
  );

  if (isErrored(serversResult)) {
    return errored({
      code: 'FAILED_TO_FETCH_SERVERS',
      subError: serversResult.error
    });
  }

  const notificationPreferencesResult = await fromPromise(
    prisma.notificationPreference.findMany({
      where: {
        guildId: { in: serversResult.value.map(s => s.guildId) },
        type
      },
      select: {
        guildId: true,
        channelId: true
      }
    })
  );

  if (isErrored(notificationPreferencesResult)) {
    return errored({
      code: 'FAILED_TO_FETCH_NOTIFICATION_PREFERENCES',
      subError: notificationPreferencesResult.error
    });
  }

  const preferredChannelsMap = Object.fromEntries(
    notificationPreferencesResult.value.map(p => [p.guildId, p.channelId])
  );

  const propagationResults = await combineAsync(
    serversResult.value.map(async server => {
      // This notification type has been disabled for this server
      if (preferredChannelsMap[server.guildId] === null) {
        return complete(false);
      }

      // If the server has configured a prefered channel for this notification type, use that.
      // otherwise, use the default bot channel (if it exists)
      const targetChannelId = preferredChannelsMap[server.guildId] || server.botChannelId;
      if (!targetChannelId) {
        return complete(false);
      }

      const channel = await client.channels.fetch(targetChannelId);

      if (
        !channel ||
        (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)
      ) {
        return complete(false);
      }

      const sendResult = await fromPromise(
        channel.send({
          embeds: [message]
        })
      );

      if (isErrored(sendResult)) {
        return errored(sendResult.error);
      }

      return complete(true);
    })
  );

  if (isErrored(propagationResults)) {
    console.error('Failed to propagate notification', propagationResults.error);

    return errored({
      code: 'FAILED_TO_PROPAGATE_NOTIFICATION',
      subError: propagationResults.error
    });
  }

  return complete(true);
}
