import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, propagate } from '../../utils';

interface MemberJoinedData {
  groupId: number;
  playerId: number;
  displayName: string;
}

class MemberJoined implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBER_JOINED';
  }

  async execute(data: MemberJoinedData): Promise<void> {
    const { groupId, displayName, playerId } = data;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);
    const url = `https://wiseoldman.net/players/${playerId}`;

    const tadaEmoji = getEmoji('tada');
    const title = `${tadaEmoji} New group member: ${displayName}`;

    const message = new MessageEmbed().setColor(config.visuals.blue).setTitle(title).setURL(url);

    propagate(message, channelIds);
  }
}

export default new MemberJoined();
