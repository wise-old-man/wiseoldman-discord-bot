import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Find the "alias" username for a given discord userId.
 */
async function getUsername(userId: string) {
  const alias = await prisma.alias.findFirst({
    where: { userId },
    select: { username: true }
  });

  return alias ? alias.username : null;
}

/**
 * Find the "alias" userId for a given username.
 */
async function getUserId(username: string) {
  const alias = await prisma.alias.findFirst({
    where: { username },
    select: { userId: true }
  });

  return alias ? alias.userId : null;
}

/**
 * Find the Server object corresponding to a given guildId.
 */

async function getServer(guildId: string | null | undefined) {
  if (!guildId) return null;

  return prisma.server.upsert({
    where: { guildId },
    create: { guildId },
    update: {}
  });
}

/**
 * Find all the Server objects that are tracking a given groupId.
 */
async function getServers(groupId: number) {
  return prisma.server.findMany({ where: { groupId } });
}

/**
 * Update the bot's default broadcast channel for a given guild.
 */
async function updateBotChannel(guildId: string, channelId: string) {
  const server = await getServer(guildId);

  if (!server) {
    throw new Error(`Server does not exist for guild id: ${guildId}`);
  }

  return prisma.server.update({
    where: { guildId },
    data: { botChannelId: channelId }
  });
}

async function updateChannelPreference(guildId: string, type: string, channelId: string | null) {
  return prisma.channelPreference.upsert({
    where: { guildId_type: { guildId, type } },
    create: { guildId, type, channelId },
    update: { channelId }
  });
}

async function getPreferredChannels(guildIds: string[], type: string) {
  return (
    await prisma.channelPreference.findMany({
      where: { guildId: { in: guildIds }, type },
      select: { channelId: true }
    })
  )
    .map(pref => pref.channelId)
    .filter(c => !!c) as string[];
}

export default prisma;

export {
  getUserId,
  getUsername,
  getServer,
  getServers,
  updateBotChannel,
  updateChannelPreference,
  getPreferredChannels
};
