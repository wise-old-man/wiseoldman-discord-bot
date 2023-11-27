import env from './env';

export default {
  token: env.DISCORD_TOKEN,
  apiKey: env.DISCORD_BOT_API_KEY,
  baseAPIUrl: env.BASE_API_URL || 'https://api.wiseoldman.net/v2',
  requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_APPLICATION_COMMANDS'],
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
      moderator: '705821689526747136',
      groupLeader: '705826389474934845',
      apiConsumer: '713452544164233296',
      patreonSupporter: '1169327347032412300',
      patreonSupporterT2: '1178310263154417735'
    },
    channels: {
      flags: '802680940835897384',
      modLogs: '830199626630955039',
      patreonInfo: '1173680059526152272',
      flaggedPlayerReviews: '1086637095415722169'
    }
  }
};
