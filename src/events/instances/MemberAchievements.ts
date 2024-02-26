import { Client, EmbedBuilder } from 'discord.js';
import { Achievement, Player } from '@wise-old-man/utils';
import config from '../../config';
import { getUserId } from '../../services/prisma';
import { Event } from '../../utils/events';
import { encodeURL, getEmoji, propagateMessage, NotificationType } from '../../utils';

interface MemberAchievementsData {
  groupId: number;
  player: Player;
  achievements: Achievement[];
}

class MemberAchievements implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_ACHIEVEMENTS';
  }

  async execute(data: MemberAchievementsData, client: Client) {
    const { groupId, player, achievements } = data;

    if (!groupId) return;

    const userId = await getUserId(player.displayName);
    const discordTag = userId ? `(<@${userId}>)` : '';

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🎉 New member ${achievements.length > 1 ? 'achievements' : 'achievement'}`)
      .setDescription(
        achievements
          .map(({ metric, name }) => `${player.displayName} ${discordTag} - ${getEmoji(metric)} ${name}`)
          .join('\n')
      )
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/achievements`));

    await propagateMessage(client, groupId, NotificationType.MEMBER_ACHIEVEMENTS, message);
  }
}

export default new MemberAchievements();
