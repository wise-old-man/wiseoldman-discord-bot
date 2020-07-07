import { Server } from '../';

async function getServer(guildId: string | undefined): Promise<Server | null> {
  if (!guildId) return null;

  const [match] = await Server.findOrCreate({ where: { guildId } });
  return match;
}

async function getServers(groupId: number): Promise<Server[]> {
  const results = await Server.findAll({ where: { groupId } });
  return results;
}

async function getChannelIds(groupId: number): Promise<string[] | undefined> {
  const servers = await getServers(groupId);

  if (!servers || servers.length === 0) return;

  return servers.map(s => s.botChannelId).filter(s => s);
}

async function updateGroup(guildId: string, groupId: number): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setGroup(groupId);
}

async function updatePrefix(guildId: string, prefix: string): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setPrefix(prefix);
}

async function updateAnnouncementChannel(guildId: string, channelId: string): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setBotChannel(channelId);
}

export { getServer, getServers, getChannelIds, updateGroup, updatePrefix, updateAnnouncementChannel };
