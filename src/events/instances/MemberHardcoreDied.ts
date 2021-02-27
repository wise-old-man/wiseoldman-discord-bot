import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { encodeURL, getEmoji, propagate } from '../../utils';

interface MemberHardcoreDiedData {
  groupId: number;
  player: {
    id: number;
    displayName: string;
  };
}

class MemberHardcoreDied implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_HCIM_DIED';
  }

  async execute(data: MemberHardcoreDiedData): Promise<void> {
    const { groupId } = data;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);
    const message = this.buildMessage(data);

    propagate(message, channelIds);
  }

  buildMessage(data: MemberHardcoreDiedData): MessageEmbed {
    const { player } = data;

    const title = `${getEmoji('grave')} Hardcore Ironman Member Died`;
    const message = `\`${player.displayName}\` has died and is now a regular Ironman.`;

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(title)
      .setDescription(message)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));
  }
}

export default new MemberHardcoreDied();
