import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, propagate } from '../../utils';

interface MemberLeftData {
  groupId: number;
  playerId: number;
  displayName: string;
}

class MemberLeft implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBER_LEFT';
  }

  async execute(data: MemberLeftData): Promise<void> {
    const { groupId, displayName, playerId } = data;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    const waveEmoji = getEmoji('wave');
    const title = `${waveEmoji} Group member left: ${displayName}`;
    const url = `https://wiseoldman.net/players/${playerId}`;

    const message = new MessageEmbed().setColor(config.visuals.blue).setTitle(title).setURL(url);

    propagate(message, channelIds);
  }
}

export default new MemberLeft();
