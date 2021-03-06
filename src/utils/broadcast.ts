import { MessageEmbed } from 'discord.js';
import { getPreferredChannels } from '../database/services/channelPreferences';
import { getServers } from '../database/services/server';
import { propagateMessage } from '../utils';

async function broadcastMessage(groupId: number, type: string, message: MessageEmbed): Promise<void> {
  const servers = await getServers(groupId);
  const preferredChannels = await getPreferredChannels(servers, type);

  propagateMessage(message, preferredChannels);
}

export { broadcastMessage };
