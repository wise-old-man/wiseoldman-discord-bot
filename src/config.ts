import 'dotenv/config';

export default {
  token: process.env.DISCORD_TOKEN,
  baseAPIUrl: process.env.DISCORD_DEV_API_URL || 'https://api.wiseoldman.net/v2',
  requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_APPLICATION_COMMANDS'],
  visuals: {
    blue: 0x2980b9,
    red: 0xcc4242,
    green: 0x64d85b,
    orange: 0xecbf54
  },
  discord: {
    guildId: process.env.DISCORD_DEV_GUILD_ID || '679454777708380161',
    clientId: process.env.DISCORD_DEV_CLIENT_ID || '719720369241718837',
    roles: {
      moderator: '705821689526747136',
      groupLeader: '705826389474934845'
    },
    channels: {
      flags: '802680940835897384',
      leadersLog: '830199626630955039'
    }
  }
};
