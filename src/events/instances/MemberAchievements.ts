import { AsyncResult, errored } from '@attio/fetchable';
import { Achievement, Player } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import config from '../../config';
import {
  encodeURL,
  getEmoji,
  MessagePropagationError,
  NotificationType,
  propagateMessage
} from '../../utils';
import { Event } from '../../utils/events';

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

  async execute(
    data: MemberAchievementsData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId, player, achievements } = data;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🎉 New member ${achievements.length > 1 ? 'achievements' : 'achievement'}`)
      .setDescription(
        achievements
          .map(({ metric, name }) => `${player.displayName} - ${getEmoji(metric)} ${name}`)
          .join('\n')
      )
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/achievements`));

    return propagateMessage(client, groupId, NotificationType.MEMBER_ACHIEVEMENTS, message);
  }
}

export default new MemberAchievements();
