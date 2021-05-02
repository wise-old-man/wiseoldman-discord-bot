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
  womGuild: {
    id: '679454777708380161',
    flagChannelId: '802680940835897384',
    moderatorRoleId: '838198270601723915'
  }
};
