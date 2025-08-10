import { AsyncResult, errored } from '@attio/fetchable';
import { PlayerResponse } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import config from '../../config';
import { encodeURL, MessagePropagationError, NotificationType, propagateMessage } from '../../utils';
import { Event } from '../../utils/events';

interface MemberHardcoreDiedData {
  groupId: number;
  player: PlayerResponse;
}

class MemberHardcoreDied implements Event {
  type: string;

  constructor() {
    this.type = 'MEMBER_HCIM_DIED';
  }

  async execute(
    data: MemberHardcoreDiedData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId, player } = data;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🪦 Hardcore Ironman Member Died`)
      .setDescription(`\`${player.displayName}\` has died and is now a regular Ironman.`)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));

    return propagateMessage(client, groupId, NotificationType.MEMBER_HCIM_DIED, message);
  }
}

export default new MemberHardcoreDied();
