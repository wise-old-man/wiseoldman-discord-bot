import { MessageEmbed } from 'discord.js';
import { getPreferredChannels } from '../database/services/channelPreferences';
import { getServers } from '../database/services/server';
import { BroadcastType } from '../types';
import { propagateMessage } from '../utils';

async function broadcastMessage(groupId: number, type: string, message: MessageEmbed): Promise<void> {
  const servers = await getServers(groupId);
  const preferredChannels = await getPreferredChannels(servers, type);

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
  }
}

export { broadcastMessage, getBroadcastName };
