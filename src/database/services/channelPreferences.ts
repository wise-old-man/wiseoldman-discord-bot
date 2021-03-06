import { ChannelPreference, Server } from '../';

async function getChannelPreference(guildId: string, type: string): Promise<ChannelPreference | null> {
  if (!guildId || !type) return null;

  const channelPref = await ChannelPreference.findOne({ where: { guildId, type } });
  return channelPref;
}

async function setChannelPreference(
  guildId: string,
  type: string,
  channelId: string
): Promise<ChannelPreference> {
  if (!guildId) throw new Error('Invalid guildId.');
  if (!type) throw new Error('Invalid type.');
  if (!channelId) throw new Error('Invalid channelId.');

  const channelPref = await ChannelPreference.findOne({ where: { guildId, type } });

  // Channel Preference already exists for this guild & announcement type
  if (channelPref) {
    return await channelPref.setChannelId(channelId);
  }

  // Create a new channel preference for this guild & type
  return await ChannelPreference.create({ guildId, type, channelId });
}

async function getPreferredChannels(servers: Server[], type: string): Promise<string[]> {
  const channels = await Promise.all(
    servers.map(async server => {
      try {
        const preferred = await getChannelPreference(server.guildId, type);

        // If this guild hasn't set a preferred channel for this announcement type
        // broadcast to their default bot channel instead.
        return preferred ? preferred.channelId : server.botChannelId;
      } catch (error) {
        return null;
      }
    })
  );

  // Filter out any null channel ids
  return channels.filter(c => !!c) as string[];
}

export { getChannelPreference, getPreferredChannels, setChannelPreference };
