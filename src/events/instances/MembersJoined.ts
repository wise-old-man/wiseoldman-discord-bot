import { Client, MessageEmbed } from 'discord.js';
import { Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { encodeURL, propagateMessage, NotificationType } from '../../utils';

interface MembersJoinedData {
  groupId: number;
  players: Player[];
}

class MembersJoined implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_JOINED';
  }

  async execute(data: MembersJoinedData, client: Client) {
    const { groupId } = data;

    if (!groupId) return;

    const message = buildMessage(data);
    await propagateMessage(client, groupId, NotificationType.MEMBERS_LIST_CHANGED, message);
  }
}

function buildMessage(data: MembersJoinedData) {
  const { groupId, players } = data;

  if (players.length === 1) {
    const player = players[0];
    const title = `🎉 New group member: ${player.displayName}`;

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(title)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));
  }

  const url = `https://wiseoldman.net/groups/${groupId}/members`;
  const title = `🎉 ${players.length} new group members!`;
  const content = players.map(p => `\`${p.displayName}\``).join(', ');

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setTitle(title)
    .setDescription(content)
    .setURL(url);
}

export default new MembersJoined();
