import 'dotenv/config';

export default {
  token: process.env.DISCORD_TOKEN,
  defaultPrefix: '!',
  validPrefixes: ['!', '-', '+', '++', '$'],
  helpCommand: 'wom!help',
  baseAPIUrl: 'https://api.wiseoldman.net',
  requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS'],
  visuals: {
    blue: '#2980b9',
    red: '#cc4242',
    green: '#64d85b',
    orange: '#ecbf54'
  },
  discord: {
    guildId: '679454777708380161',
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
