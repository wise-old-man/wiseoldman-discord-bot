import { Client, MessageEmbed } from 'discord.js';
import { Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { encodeURL, broadcastMessage, BroadcastType } from '../../utils';

interface MemberNameChangedData {
  groupId: number;
  player: Player;
  previousName: string;
}

class MemberNameChanged implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_NAME_CHANGED';
  }

  async execute(data: MemberNameChangedData, client: Client) {
    const { groupId, player, previousName } = data;

    if (!groupId) return;

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle('Member Name Changed')
      .setDescription(`\`${previousName}\` → \`${player.displayName}\``)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));

    await broadcastMessage(client, groupId, BroadcastType.MEMBER_NAME_CHANGED, message);
  }
}

export default new MemberNameChanged();
