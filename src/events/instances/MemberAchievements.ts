import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getUserId } from '../../database/services/alias';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, propagate } from '../../utils';

interface PlayerAchievement {
  type: string;
  metric: string;
}

interface MemberAchievementsData {
  groupId: number;
  player: {
    id: number;
    displayName: string;
  };
  achievements: PlayerAchievement[];
}

class MemberAchievements implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_ACHIEVEMENTS';
  }

  async execute(data: MemberAchievementsData): Promise<void> {
    const { groupId, player } = data;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    const userId = await getUserId(player.displayName);
    const discordTag = userId ? `(<@${userId}>)` : '';

    const message = this.buildMessage(data, discordTag);

    propagate(message, channelIds);
  }

  buildMessage(data: MemberAchievementsData, discordTag: string): MessageEmbed {
    const { player, achievements } = data;
    const { displayName } = player;

    const url = `https://wiseoldman.net/players/${player.id}/achievements`;
    const title = `New member ${achievements.length > 1 ? 'achievements' : 'achievement'}`;

    const content = achievements
      .map(({ metric, type }) => `${displayName} ${discordTag} - ${getEmoji(metric)} ${type}`)
      .join('\n');

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('tada')} ${title}`)
      .setDescription(content)
      .setURL(url);
  }
}

export default new MemberAchievements();
