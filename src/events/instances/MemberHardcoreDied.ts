import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { BroadcastType, Event } from '../../types';
import { encodeURL, getEmoji, broadcastMessage } from '../../utils';

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

    const message = this.buildMessage(data);
    broadcastMessage(groupId, BroadcastType.MemberHardcoreDied, message);
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
