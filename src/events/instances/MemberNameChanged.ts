import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { BroadcastType, Event } from '../../types';
import { encodeURL, broadcastMessage } from '../../utils';

interface MemberNameChangedData {
  groupId: number;
  player: {
    id: number;
    displayName: string;
  };
  previousName: string;
}

class MemberNameChanged implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_NAME_CHANGED';
  }

  async execute(data: MemberNameChangedData): Promise<void> {
    const { groupId } = data;

    if (!groupId) return;

    const message = this.buildMessage(data);
    broadcastMessage(groupId, BroadcastType.MemberNameChanged, message);
  }

  buildMessage(data: MemberNameChangedData): MessageEmbed {
    const { player, previousName } = data;

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle('Member Name Changed')
      .setDescription(`\`${previousName}\` → \`${player.displayName}\``)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));
  }
}

export default new MemberNameChanged();
