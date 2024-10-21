import { Client, EmbedBuilder } from 'discord.js';
import { Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { encodeURL, propagateMessage, NotificationType } from '../../utils';

interface MembersLeftData {
  groupId: number;
  players: Player[];
}

class MembersLeft implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_LEFT';
  }

  async execute(data: MembersLeftData, client: Client) {
    const { groupId } = data;

    if (!groupId) return;

    const message = buildMessage(data);
    await propagateMessage(client, groupId, NotificationType.MEMBERS_LEFT, message);
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
