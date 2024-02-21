import { Client, EmbedBuilder } from 'discord.js';
import { Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { encodeURL, propagateMessage, NotificationType } from '../../utils';

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

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle('Member Name Changed')
      .setDescription(`\`${previousName}\` → \`${player.displayName}\``)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));

    await propagateMessage(client, groupId, NotificationType.MEMBER_NAME_CHANGED, message);
  }
}

export default new MemberNameChanged();
