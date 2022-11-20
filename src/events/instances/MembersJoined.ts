import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { Event } from '../../types';
import { encodeURL, getEmoji, broadcastMessage, BroadcastType } from '../../utils';

interface Player {
  id: number;
  displayName: string;
}

interface MembersJoinedData {
  groupId: number;
  players: Player[];
}

class MembersJoined implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_JOINED';
  }

  async execute(data: MembersJoinedData): Promise<void> {
    const { groupId } = data;

    if (!groupId) return;

    const message = this.buildMessage(data);
    broadcastMessage(groupId, BroadcastType.MembersListChanged, message);
  }

  buildMessage(data: MembersJoinedData) {
    const { groupId, players } = data;

    if (players.length === 1) {
      const player = players[0];
      const title = `${getEmoji('tada')} New group member: ${player.displayName}`;

      return new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(title)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));
    }

    const url = `https://wiseoldman.net/groups/${groupId}/members`;
    const title = `${getEmoji('tada')} ${players.length} new group members!`;
    const content = players.map(p => `\`${p.displayName}\``).join(', ');

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(title)
      .setDescription(content)
      .setURL(url);
  }
}

export default new MembersJoined();
