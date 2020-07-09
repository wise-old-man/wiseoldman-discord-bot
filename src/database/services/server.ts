import { Server } from '../';

/**
 * Find the Server object corresponding to a given guildId.
 */
async function getServer(guildId: string | undefined): Promise<Server | null> {
  if (!guildId) return null;

  const [match] = await Server.findOrCreate({ where: { guildId } });
  return match;
}

/**
 * Find all the Server objects that are tracking a given groupId.
 */
async function getServers(groupId: number): Promise<Server[]> {
  const results = await Server.findAll({ where: { groupId } });
  return results;
}

/**
 * Find all "announcement channels" for the Servers
 * that are tracking a given groupId.
 */
async function getChannelIds(groupId: number): Promise<string[] | undefined> {
  const servers = await getServers(groupId);

  if (!servers || servers.length === 0) return;

  return servers.map(s => s.botChannelId).filter(s => s);
}

/**
 * Update the "tracked" group for a given guild.
 */
async function updateGroup(guildId: string, groupId: number): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setGroup(groupId);
}

/**
 * Update the command prefix for a given guild.
 */
async function updatePrefix(guildId: string, prefix: string): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setPrefix(prefix);
}

/**
 * Update the bot's announcement channel for a given guild.
 */
async function updateAnnouncementChannel(guildId: string, channelId: string): Promise<Server> {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return await server.setBotChannel(channelId);
}

export { getServer, getServers, getChannelIds, updateGroup, updatePrefix, updateAnnouncementChannel };
