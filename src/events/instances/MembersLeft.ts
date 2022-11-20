import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { Event } from '../../types';
import { encodeURL, getEmoji, broadcastMessage, BroadcastType } from '../../utils';

interface Player {
  id: number;
  displayName: string;
}

interface MembersLeftData {
  groupId: number;
  players: Player[];
}

class MembersLeft implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_LEFT';
  }

  async execute(data: MembersLeftData): Promise<void> {
    const { groupId } = data;

    if (!groupId) return;

    const message = this.buildMessage(data);
    broadcastMessage(groupId, BroadcastType.MembersListChanged, message);
  }

  buildMessage(data: MembersLeftData) {
    const { groupId, players } = data;

    if (players.length === 1) {
      const player = players[0];
      const title = `${getEmoji('wave')} Group member left: ${player.displayName}`;

      return new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(title)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`));
    }

    const url = `https://wiseoldman.net/groups/${groupId}/members`;
    const title = `${getEmoji('wave')} ${players.length} members have left the group`;
    const content = players.map(p => `\`${p.displayName}\``).join(', ');

    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(title)
      .setDescription(content)
      .setURL(url);
  }
}

export default new MembersLeft();
