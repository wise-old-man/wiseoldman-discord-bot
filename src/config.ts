import { PermissionFlagsBits } from 'discord.js';
import env from './env';

export default {
  token: env.DISCORD_TOKEN,
  apiKey: env.DISCORD_BOT_API_KEY,
  baseAPIUrl: env.BASE_API_URL || 'https://api.wiseoldman.net/v2',
  requiredPermissions: [
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.UseApplicationCommands
  ],
  visuals: {
    blue: 0x2980b9,
    red: 0xcc4242,
    green: 0x64d85b,
    orange: 0xecbf54
  },
  discord: {
    guildId: env.DISCORD_DEV_GUILD_ID || '679454777708380161',
    clientId: env.DISCORD_DEV_CLIENT_ID || '719720369241718837',
    roles: {
      moderator: env.DISCORD_DEV_MODERATOR_ROLE_ID || '705821689526747136',
      groupLeader: env.DISCORD_DEV_GROUP_LEADER_ROLE_ID || '705826389474934845',
      apiConsumer: env.DISCORD_DEV_API_CONSUMER_ROLE_ID || '713452544164233296',
      patreonSupporter: env.DISCORD_DEV_PATREON_SUPPORTER_ROLE_ID || '1169327347032412300',
      patreonSupporterT2: env.DISCORD_DEV_PATREONT2_SUPPOERTER_ROLE_ID || '1178310263154417735'
    },
    channels: {
      flags: env.DISCORD_DEV_FLAG_CHANNEL_ID || '802680940835897384',
      modLogs: env.DISCORD_DEV_MODSLOGS_CHANNEL_ID || '830199626630955039',
      patreonInfo: env.DISCORD_DEV_PATREON_INFO_CHANNEL_ID || '1173680059526152272',
      flaggedPlayerReviews: env.DISCORD_DEV_FLAGGED_REVIEWS_CHANNEL_ID || '1086637095415722169'
    }
  }
};
