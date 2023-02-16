import { Client, MessageEmbed } from 'discord.js';
import { Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { encodeURL, propagateMessage, NotificationType } from '../../utils';

interface MemberHardcoreDiedData {
  groupId: number;
  player: Player;
}

class MemberHardcoreDied implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_HCIM_DIED';
  }

  async execute(data: MemberHardcoreDiedData, client: Client) {
    const { groupId, player } = data;

    if (!groupId) return;

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`🪦 Hardcore Ironman Member Died`)
      .setDescription(`\`${player.displayName}\` has died and is now a regular Ironman.`)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));

    await propagateMessage(client, groupId, NotificationType.MEMBER_HCIM_DIED, message);
  }
}

export default new MemberHardcoreDied();
