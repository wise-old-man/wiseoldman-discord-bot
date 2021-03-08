import 'dotenv/config';

export default {
  token: process.env.DISCORD_TOKEN,
  defaultPrefix: '!',
  validPrefixes: ['!', '-', '+', '++', '$'],
  helpCommand: 'wom!help',
  baseAPIUrl: 'https://api.wiseoldman.net',
  womGuildId: '679454777708380161',
  womFlagChannelId: '802680940835897384',
  requiredPermissions: ['MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS'],
  visuals: {
    blue: '#2980b9',
    red: '#cc4242',
    green: '#64d85b',
    orange: '#ecbf54'
  }
};
