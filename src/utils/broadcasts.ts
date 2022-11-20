import { MessageEmbed } from 'discord.js';
import { getServers, getPreferredChannels } from '../services/prisma';
import { propagateMessage } from '.';

export enum BroadcastType {
  Default = 'DEFAULT',
  CompetitionStatus = 'COMPETITION_STATUS',
  MemberAchievements = 'MEMBER_ACHIEVEMENTS',
  MemberNameChanged = 'MEMBER_NAME_CHANGED',
  MemberHardcoreDied = 'MEMBER_HCIM_DIED',
  MembersListChanged = 'MEMBERS_LIST_CHANGED'
}

async function broadcastMessage(groupId: number, type: string, message: MessageEmbed): Promise<void> {
  const servers = await getServers(groupId);

  const preferredChannels = await getPreferredChannels(
    servers.map(s => s.guildId),
    type
  );

  propagateMessage(message, preferredChannels);
}

function getBroadcastName(type: BroadcastType): string {
  switch (type) {
    case BroadcastType.CompetitionStatus:
      return 'Competition Status';
    case BroadcastType.MemberAchievements:
      return 'Member Achievements';
    case BroadcastType.MemberHardcoreDied:
      return 'Member (HCIM) Died';
    case BroadcastType.MemberNameChanged:
      return 'Member Name Changed';
    case BroadcastType.MembersListChanged:
      return 'Members List Changed';
    default:
      return 'Default';
  }
}

export { broadcastMessage, getBroadcastName };
