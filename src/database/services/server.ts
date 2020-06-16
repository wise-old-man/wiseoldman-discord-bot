import { Server } from '../models/Server';

async function getServer(guildId: string): Promise<Server | null> {
  const [match] = await Server.findOrCreate({ where: { id: guildId } });
  return match;
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

export { getServer, updateGroup, updatePrefix };
