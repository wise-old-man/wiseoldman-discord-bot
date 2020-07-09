import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getUserId } from '../../database/services/alias';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, propagate } from '../../utils';

interface MemberAchievementData {
  groupId: number;
  player: {
    id: number;
    displayName: string;
  };
  achievement: {
    type: string;
    metric: string;
  };
}

class MemberAchievement implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_ACHIEVEMENT';
  }

  async execute(data: MemberAchievementData): Promise<void> {
    const { groupId, player, achievement } = data;
    const { id, displayName } = player;
    const { type, metric } = achievement;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);
    const url = `https://wiseoldman.net/players/${id}/achievements`;

    const userId = await getUserId(displayName);
    const discordTag = userId ? `(<@${userId}>)` : '';

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('tada')} New member achievement!`)
      .setDescription(`${displayName} ${discordTag} - ${getEmoji(metric)} ${type}`)
      .setURL(url);

    propagate(message, channelIds);
  }
}

export default new MemberAchievement();
