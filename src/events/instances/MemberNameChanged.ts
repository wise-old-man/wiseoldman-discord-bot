import { AsyncResult, errored } from '@attio/fetchable';
import { Player } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import config from '../../config';
import { encodeURL, MessagePropagationError, NotificationType, propagateMessage } from '../../utils';
import { Event } from '../../utils/events';

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

  async execute(
    data: MemberNameChangedData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId, player, previousName } = data;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle('Member Name Changed')
      .setDescription(`\`${previousName}\` → \`${player.displayName}\``)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));

    return propagateMessage(client, groupId, NotificationType.MEMBER_NAME_CHANGED, message);
  }
}

export default new MemberNameChanged();
