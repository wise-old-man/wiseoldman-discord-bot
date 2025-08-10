import { AsyncResult, errored } from '@attio/fetchable';
import { PlayerResponse } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import config from '../../config';
import { encodeURL, MessagePropagationError, NotificationType, propagateMessage } from '../../utils';
import { Event } from '../../utils/events';

interface MembersLeftData {
  groupId: number;
  players: Pick<PlayerResponse, 'displayName'>[];
}

class MembersLeft implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_LEFT';
  }

  async execute(
    data: MembersLeftData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId } = data;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const message = buildMessage(data);
    return propagateMessage(client, groupId, NotificationType.MEMBERS_LEFT, message);
  }
}

function buildMessage(data: MembersLeftData) {
  const { groupId, players } = data;

  if (players.length === 1) {
    const player = players[0];
    const title = `👋 Group member left: ${player.displayName}`;

    return new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(title)
      .setURL(encodeURL(`https://wiseoldman.net/groups/${groupId}?dialog=group-activity`));
  }

  const url = `https://wiseoldman.net/groups/${groupId}?dialog=group-activity`;
  const title = `👋 ${players.length} Members have left the group`;
  const content = players.map(p => `\`${p.displayName}\``).join(', ');

  return new EmbedBuilder()
    .setColor(config.visuals.blue)
    .setTitle(title)
    .setDescription(content)
    .setURL(url);
}

export default new MembersLeft();
